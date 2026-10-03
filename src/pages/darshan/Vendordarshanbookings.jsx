import { useCallback, useEffect, useState } from "react";

/* ==================== CONFIG ==================== */
// Apne project ke hisaab se base URL change kar lena (same jo baaki vendor pages me use ho raha hai)
const API_BASE = "https://bmtvendorfinal.onrender.com";
const BOOKINGS_URL = `${API_BASE}/api/darshan-bookings`;

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("vendorToken")}`,
});

const BOOKING_STATUSES = ["pending", "confirmed", "completed", "cancelled", "refunded"];
const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];
const ENTRY_STATUSES = ["not_checked", "checked_in", "rejected"];

const money = (n, cur = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: cur, maximumFractionDigits: 0 }).format(n || 0);

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-";

const fmtDateTime = (d) =>
  d ? new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "-";

const label = (s) => String(s || "").replace(/_/g, " ");

async function api(path, options = {}) {
  const res = await fetch(`${BOOKINGS_URL}${path}`, { ...options, headers: authHeaders() });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) throw new Error(json.message || "Something went wrong");
  return json;
}

/* ==================== MAIN ==================== */
export default function VendorDarshanBookings() {
  const [summary, setSummary] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [filters, setFilters] = useState({ status: "", paymentStatus: "", entryStatus: "", bookingDate: "" });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);

  const flash = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const loadSummary = useCallback(async () => {
    try {
      const res = await api("/vendor/summary");
      setSummary(res.data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      Object.entries(filters).forEach(([k, v]) => v && params.set(k, v));
      const res = await api(`/vendor?${params.toString()}`);
      setBookings(res.data || []);
      setMeta({ total: res.total, page: res.page, totalPages: res.totalPages || 1 });
    } catch (e) {
      setError(e.message);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const refreshAll = () => {
    loadBookings();
    loadSummary();
  };

  const setFilter = (key, value) => {
    setPage(1);
    setFilters((f) => ({ ...f, [key]: value }));
  };

  const openDetail = async (id) => {
    try {
      const res = await api(`/vendor/${id}`);
      setSelected(res.data);
    } catch (e) {
      flash(e.message);
    }
  };

  // Generic action runner: PATCH + refresh + modal update
  const runAction = async (path, body, successMsg) => {
    if (!selected) return;
    setBusy(true);
    try {
      const res = await api(`/vendor/${selected._id}${path}`, {
        method: "PATCH",
        body: body ? JSON.stringify(body) : undefined,
      });
      setSelected((s) => ({ ...s, ...res.data }));
      flash(successMsg);
      refreshAll();
    } catch (e) {
      flash(e.message);
    } finally {
      setBusy(false);
    }
  };

  const cards = summary
    ? [
        ["Total bookings", summary.totalBookings],
        ["Total persons", summary.totalPersons],
        ["Paid revenue", money(summary.paidAmount)],
        ["Pending", summary.pendingBookings],
        ["Confirmed", summary.confirmedBookings],
        ["Completed", summary.completedBookings],
        ["Cancelled", summary.cancelledBookings],
      ]
    : [];

  return (
    <div className="vdb">
      <style>{css}</style>

      <header className="vdb-head">
        <div>
          <h2>Darshan Bookings</h2>
          <p>Devotees ki bookings dekho, payment confirm karo aur gate par check-in karo.</p>
        </div>
        <button className="vdb-btn ghost" onClick={refreshAll}>Refresh</button>
      </header>

      <section className="vdb-cards">
        {cards.map(([t, v]) => (
          <div className="vdb-card" key={t}>
            <span>{t}</span>
            <strong>{v}</strong>
          </div>
        ))}
      </section>

      <section className="vdb-filters">
        <select value={filters.status} onChange={(e) => setFilter("status", e.target.value)}>
          <option value="">All booking status</option>
          {BOOKING_STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
        </select>
        <select value={filters.paymentStatus} onChange={(e) => setFilter("paymentStatus", e.target.value)}>
          <option value="">All payment status</option>
          {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
        </select>
        <select value={filters.entryStatus} onChange={(e) => setFilter("entryStatus", e.target.value)}>
          <option value="">All entry status</option>
          {ENTRY_STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
        </select>
        <input type="date" value={filters.bookingDate} onChange={(e) => setFilter("bookingDate", e.target.value)} />
        <button
          className="vdb-btn ghost"
          onClick={() => {
            setPage(1);
            setFilters({ status: "", paymentStatus: "", entryStatus: "", bookingDate: "" });
          }}
        >
          Clear filters
        </button>
      </section>

      <section className="vdb-table-wrap">
        <table className="vdb-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Customer</th>
              <th>Darshan</th>
              <th>Date & slot</th>
              <th>Persons</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Entry</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan="10" className="vdb-empty">Loading bookings...</td></tr>
            )}
            {!loading && error && (
              <tr><td colSpan="10" className="vdb-empty err">{error}</td></tr>
            )}
            {!loading && !error && bookings.length === 0 && (
              <tr><td colSpan="10" className="vdb-empty">Koi booking nahi mili. Filters change karke dekho.</td></tr>
            )}
            {!loading && bookings.map((b) => (
              <tr key={b._id}>
                <td className="mono">{b.bookingId}</td>
                <td>
                  <b>{b.customerName}</b>
                  <small>{b.customerPhone}</small>
                </td>
                <td>
                  <b>{b.darshanId?.templeName || b.darshanId?.name || "-"}</b>
                  <small>{b.darshanTypeId?.name || ""}</small>
                </td>
                <td>
                  <b>{fmtDate(b.bookingDate)}</b>
                  <small>
                    {b.slotId ? `${b.slotId.name || ""} ${b.slotId.startTime || ""}-${b.slotId.endTime || ""}` : "-"}
                  </small>
                </td>
                <td>{b.totalPersons}</td>
                <td>{money(b.totalAmount, b.currency)}</td>
                <td><Badge value={b.bookingStatus} /></td>
                <td><Badge value={b.paymentStatus} /></td>
                <td><Badge value={b.entryStatus} /></td>
                <td><button className="vdb-btn small" onClick={() => openDetail(b._id)}>View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <footer className="vdb-pager">
        <span>{meta.total} bookings</span>
        <div>
          <button className="vdb-btn ghost small" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
          <span className="vdb-page">Page {meta.page} of {meta.totalPages}</span>
          <button className="vdb-btn ghost small" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      </footer>

      {selected && (
        <DetailModal
          booking={selected}
          busy={busy}
          onClose={() => setSelected(null)}
          onConfirm={() => runAction("/status", { bookingStatus: "confirmed", paymentStatus: "paid" }, "Booking confirmed")}
          onMarkPaid={() => runAction("/status", { paymentStatus: "paid" }, "Payment marked as paid")}
          onCancel={() => {
            if (window.confirm("Is booking ko cancel karna hai?")) {
              runAction("/status", { bookingStatus: "cancelled" }, "Booking cancelled");
            }
          }}
          onCheckIn={() => runAction("/check-in", null, "Customer checked in")}
          onReject={() => {
            if (window.confirm("Entry reject karni hai?")) runAction("/reject-entry", null, "Entry rejected");
          }}
        />
      )}

      {toast && <div className="vdb-toast">{toast}</div>}
    </div>
  );
}

/* ==================== PARTS ==================== */
function Badge({ value }) {
  return <span className={`vdb-badge ${value}`}>{label(value)}</span>;
}

function Row({ k, v }) {
  return (
    <div className="vdb-row">
      <span>{k}</span>
      <b>{v}</b>
    </div>
  );
}

function DetailModal({ booking: b, busy, onClose, onConfirm, onMarkPaid, onCancel, onCheckIn, onReject }) {
  const closed = ["cancelled", "completed", "refunded"].includes(b.bookingStatus);
  const canConfirm = b.bookingStatus === "pending";
  const canMarkPaid = b.paymentStatus !== "paid" && !closed;
  const canCheckIn = b.paymentStatus === "paid" && b.bookingStatus === "confirmed" && b.entryStatus !== "checked_in";
  const canReject = b.entryStatus !== "checked_in" && b.entryStatus !== "rejected";
  const canCancel = !closed;

  return (
    <div className="vdb-overlay" onClick={onClose}>
      <div className="vdb-modal" onClick={(e) => e.stopPropagation()}>
        <div className="vdb-modal-head">
          <div>
            <h3>{b.bookingId}</h3>
            <small>Booked on {fmtDateTime(b.createdAt)}</small>
          </div>
          <button className="vdb-x" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="vdb-badges">
          <Badge value={b.bookingStatus} />
          <Badge value={b.paymentStatus} />
          <Badge value={b.entryStatus} />
        </div>

        <div className="vdb-grid">
          <div>
            <h4>Customer</h4>
            <Row k="Name" v={b.customerName} />
            <Row k="Email" v={b.customerEmail} />
            <Row k="Phone" v={b.customerPhone} />
          </div>
          <div>
            <h4>Darshan</h4>
            <Row k="Temple" v={b.darshanId?.templeName || b.darshanId?.name || "-"} />
            <Row k="Type" v={b.darshanTypeId?.name || "-"} />
            <Row k="Date" v={fmtDate(b.bookingDate)} />
            <Row
              k="Slot"
              v={b.slotId ? `${b.slotId.name || ""} ${b.slotId.startTime || ""}-${b.slotId.endTime || ""}` : "-"}
            />
          </div>
        </div>

        <h4>Price breakup</h4>
        <table className="vdb-mini">
          <thead>
            <tr><th>Type</th><th>Count</th><th>Price</th><th>Amount</th></tr>
          </thead>
          <tbody>
            <tr><td>Adult</td><td>{b.adultCount}</td><td>{money(b.adultPrice)}</td><td>{money(b.adultAmount)}</td></tr>
            <tr><td>Child</td><td>{b.childCount}</td><td>{money(b.childPrice)}</td><td>{money(b.childAmount)}</td></tr>
            <tr>
              <td>Senior citizen</td><td>{b.seniorCitizenCount}</td>
              <td>{money(b.seniorCitizenPrice)}</td><td>{money(b.seniorCitizenAmount)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr><td colSpan="3">Total ({b.totalPersons} persons)</td><td>{money(b.totalAmount, b.currency)}</td></tr>
          </tfoot>
        </table>

        <div className="vdb-grid">
          <div>
            <h4>Payment</h4>
            <Row k="Method" v={b.paymentMethod} />
            <Row k="Razorpay order" v={b.razorpayOrderId || "-"} />
            <Row k="Razorpay payment" v={b.razorpayPaymentId || "-"} />
          </div>
          <div>
            <h4>Entry</h4>
            <Row k="Checked in at" v={fmtDateTime(b.checkedInAt)} />
            {b.cancelledAt && <Row k="Cancelled at" v={fmtDateTime(b.cancelledAt)} />}
            {b.cancellationReason && <Row k="Reason" v={b.cancellationReason} />}
          </div>
        </div>

        <div className="vdb-actions">
          {canConfirm && <button className="vdb-btn" disabled={busy} onClick={onConfirm}>Confirm & mark paid</button>}
          {canMarkPaid && !canConfirm && <button className="vdb-btn" disabled={busy} onClick={onMarkPaid}>Mark as paid</button>}
          {canCheckIn && <button className="vdb-btn success" disabled={busy} onClick={onCheckIn}>Check in</button>}
          {canReject && <button className="vdb-btn warn" disabled={busy} onClick={onReject}>Reject entry</button>}
          {canCancel && <button className="vdb-btn danger" disabled={busy} onClick={onCancel}>Cancel booking</button>}
        </div>
      </div>
    </div>
  );
}

/* ==================== STYLES (scoped with .vdb) ==================== */
const css = `
.vdb{--ink:#1d2433;--mut:#6b7385;--line:#e4e7ee;--bg:#f6f7fa;--pri:#c2410c;--pri-d:#9a3412;color:var(--ink);font-size:14px}
.vdb *{box-sizing:border-box}
.vdb-head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:18px}
.vdb-head h2{margin:0 0 4px;font-size:22px}
.vdb-head p{margin:0;color:var(--mut)}
.vdb-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px;margin-bottom:18px}
.vdb-card{background:#fff;border:1px solid var(--line);border-radius:10px;padding:12px 14px;display:flex;flex-direction:column;gap:6px}
.vdb-card span{color:var(--mut);font-size:12px}
.vdb-card strong{font-size:20px}
.vdb-filters{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:14px}
.vdb-filters select,.vdb-filters input{height:36px;padding:0 10px;border:1px solid var(--line);border-radius:8px;background:#fff;font-size:13px;text-transform:capitalize}
.vdb-filters input{text-transform:none}
.vdb-btn{height:36px;padding:0 14px;border:0;border-radius:8px;background:var(--pri);color:#fff;font-size:13px;font-weight:600;cursor:pointer}
.vdb-btn:hover{background:var(--pri-d)}
.vdb-btn:disabled{opacity:.5;cursor:not-allowed}
.vdb-btn.small{height:30px;padding:0 10px}
.vdb-btn.ghost{background:#fff;color:var(--ink);border:1px solid var(--line)}
.vdb-btn.ghost:hover{background:var(--bg)}
.vdb-btn.success{background:#15803d}
.vdb-btn.warn{background:#b45309}
.vdb-btn.danger{background:#b91c1c}
.vdb-btn:focus-visible,.vdb select:focus-visible,.vdb input:focus-visible{outline:2px solid var(--pri);outline-offset:2px}
.vdb-table-wrap{background:#fff;border:1px solid var(--line);border-radius:10px;overflow-x:auto}
.vdb-table{width:100%;border-collapse:collapse;min-width:980px}
.vdb-table th{text-align:left;font-weight:600;color:var(--mut);font-size:12px;padding:10px 12px;background:var(--bg);border-bottom:1px solid var(--line)}
.vdb-table td{padding:10px 12px;border-bottom:1px solid var(--line);vertical-align:top}
.vdb-table tr:last-child td{border-bottom:0}
.vdb-table td b{display:block;font-weight:600}
.vdb-table td small{color:var(--mut)}
.vdb .mono{font-family:ui-monospace,Menlo,monospace;font-size:12px}
.vdb-empty{text-align:center;color:var(--mut);padding:36px 12px!important}
.vdb-empty.err{color:#b91c1c}
.vdb-badge{display:inline-block;padding:3px 9px;border-radius:999px;font-size:12px;font-weight:600;text-transform:capitalize;background:#eef0f5;color:#475069;white-space:nowrap}
.vdb-badge.pending,.vdb-badge.not_checked{background:#fef3c7;color:#92400e}
.vdb-badge.confirmed,.vdb-badge.paid{background:#dbeafe;color:#1e40af}
.vdb-badge.completed,.vdb-badge.checked_in{background:#dcfce7;color:#166534}
.vdb-badge.cancelled,.vdb-badge.failed,.vdb-badge.rejected{background:#fee2e2;color:#991b1b}
.vdb-badge.refunded{background:#ede9fe;color:#5b21b6}
.vdb-pager{display:flex;justify-content:space-between;align-items:center;margin-top:14px;color:var(--mut)}
.vdb-pager>div{display:flex;align-items:center;gap:10px}
.vdb-overlay{position:fixed;inset:0;background:rgba(15,20,35,.5);display:flex;align-items:center;justify-content:center;padding:16px;z-index:1000}
.vdb-modal{background:#fff;border-radius:12px;width:100%;max-width:720px;max-height:90vh;overflow-y:auto;padding:20px}
.vdb-modal-head{display:flex;justify-content:space-between;align-items:flex-start}
.vdb-modal-head h3{margin:0 0 2px;font-family:ui-monospace,Menlo,monospace;font-size:16px}
.vdb-modal-head small{color:var(--mut)}
.vdb-x{border:0;background:none;font-size:26px;line-height:1;cursor:pointer;color:var(--mut)}
.vdb-badges{display:flex;gap:8px;margin:12px 0}
.vdb-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}
.vdb-modal h4{margin:14px 0 6px;font-size:13px}
.vdb-row{display:flex;justify-content:space-between;gap:12px;padding:5px 0;border-bottom:1px dashed var(--line)}
.vdb-row span{color:var(--mut)}
.vdb-row b{font-weight:600;text-align:right;word-break:break-all}
.vdb-mini{width:100%;border-collapse:collapse}
.vdb-mini th,.vdb-mini td{padding:7px 8px;text-align:left;border-bottom:1px solid var(--line)}
.vdb-mini th{color:var(--mut);font-size:12px}
.vdb-mini tfoot td{font-weight:700;border-bottom:0}
.vdb-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:20px;padding-top:16px;border-top:1px solid var(--line)}
.vdb-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--ink);color:#fff;padding:10px 18px;border-radius:8px;z-index:1100}
@media(max-width:640px){.vdb-grid{grid-template-columns:1fr}.vdb-head{flex-direction:column}}
`;