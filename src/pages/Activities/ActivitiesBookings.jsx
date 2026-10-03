import { useCallback, useEffect, useMemo, useState } from "react";
import "./ActivitiesBookings.css";

/* ==================== CONFIG ==================== */

const API_ROOT = "https://bmtvendorfinal.onrender.com/api";
const BOOKING_API = `${API_ROOT}/activity-bookings/vendor`;
const ACTIVITY_API = `${API_ROOT}/vendor/activities`;

const PAGE_LIMIT = 15;

const STATUS_TABS = [
  ["", "All"],
  ["PENDING", "Pending"],
  ["CONFIRMED", "Confirmed"],
  ["COMPLETED", "Completed"],
  ["CANCELLED", "Cancelled"],
  ["REJECTED", "Rejected"],
];

const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED", "REFUND_PENDING", "REFUNDED"];

const EMPTY_FILTERS = { status: "", paymentStatus: "", date: "", activityId: "", search: "" };

/* ==================== HELPERS ==================== */

const pretty = (s) =>
  String(s || "").replace(/_/g, " ").toLowerCase().replace(/^\w|\s\w/g, (c) => c.toUpperCase());

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        weekday: "short", day: "2-digit", month: "short", year: "numeric", timeZone: "UTC",
      })
    : "—";

const fmtDateTime = (d) =>
  d
    ? new Date(d).toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
      })
    : "—";

const to12 = (t) => {
  const m = String(t || "").trim().match(/^(\d{1,2}):(\d{2})\s?(AM|PM)?$/i);
  if (!m) return t || "";
  let h = Number(m[1]);
  const mer = m[3] && m[3].toUpperCase();
  if (mer === "PM" && h < 12) h += 12;
  if (mer === "AM" && h === 12) h = 0;
  return `${h % 12 || 12}:${m[2]} ${h >= 12 ? "PM" : "AM"}`;
};

const timeRange = (b) => `${to12(b.startTime)}${b.endTime ? ` – ${to12(b.endTime)}` : ""}`;

const canConfirm = (b) => b.status === "PENDING" && new Date(b.startsAt) > new Date();
const canReject = (b) => b.status === "PENDING";
const canCancel = (b) => ["PENDING", "CONFIRMED"].includes(b.status);
const canComplete = (b) => b.status === "CONFIRMED" && new Date(b.startsAt) <= new Date();

async function request(url, options = {}) {
  const token = localStorage.getItem("vendorToken");
  const { json, ...rest } = options;
  const res = await fetch(url, {
    ...rest,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(rest.headers || {}),
    },
    ...(json !== undefined ? { body: JSON.stringify(json) } : {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data;
}

/* ==================== ACTION BUTTONS ==================== */

function Actions({ b, busy, onAction, onReason, size = "small" }) {
  return (
    <>
      {canConfirm(b) && (
        <button className={`bk-btn ${size} success`} disabled={busy} onClick={() => onAction(b, "confirm")}>Confirm</button>
      )}
      {canComplete(b) && (
        <button className={`bk-btn ${size} primary`} disabled={busy} onClick={() => onAction(b, "complete")}>Mark completed</button>
      )}
      {canReject(b) && (
        <button className={`bk-btn ${size} danger`} disabled={busy} onClick={() => onReason("reject", b)}>Reject</button>
      )}
      {canCancel(b) && !canReject(b) && (
        <button className={`bk-btn ${size} danger`} disabled={busy} onClick={() => onReason("cancel", b)}>Cancel</button>
      )}
    </>
  );
}

/* ==================== MAIN ==================== */

export default function ActivitiesBookings() {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState([]);
  const [activities, setActivities] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [reasonModal, setReasonModal] = useState(null); // { type, booking }
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");

  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState(null);

  const notify = useCallback((type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3400);
  }, []);

  /* ---------- load ---------- */

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const qs = new URLSearchParams({ page: String(page), limit: String(PAGE_LIMIT) });
      if (filters.status) qs.set("status", filters.status);
      if (filters.paymentStatus) qs.set("paymentStatus", filters.paymentStatus);
      if (filters.date) qs.set("date", filters.date);
      if (filters.activityId) qs.set("activityId", filters.activityId);

      const res = await request(`${BOOKING_API}?${qs.toString()}`);
      setBookings(res.data || []);
      setStats(res.stats || []);
      setTotal(res.total || 0);
      setPages(res.pages || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, filters.status, filters.paymentStatus, filters.date, filters.activityId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    request(ACTIVITY_API).then((r) => setActivities(r.data || [])).catch(() => {});
  }, []);

  /* ---------- derived ---------- */

  const summary = useMemo(() => {
    const by = (s) => stats.find((x) => x._id === s) || { count: 0, amount: 0 };
    return {
      total: stats.reduce((n, x) => n + x.count, 0),
      pending: by("PENDING").count,
      confirmed: by("CONFIRMED").count,
      completed: by("COMPLETED").count,
      closed: by("CANCELLED").count + by("REJECTED").count,
      revenue: by("CONFIRMED").amount + by("COMPLETED").amount,
    };
  }, [stats]);

  const visible = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    if (!q) return bookings;
    return bookings.filter((b) =>
      [b.bookingId, b.leadTraveller?.name, b.leadTraveller?.phone, b.leadTraveller?.email, b.activitySnapshot?.title]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [bookings, filters.search]);

  const hasFilters = filters.status || filters.paymentStatus || filters.date || filters.activityId || filters.search;

  const setFilter = (key, value) => {
    setPage(1);
    setFilters((p) => ({ ...p, [key]: value }));
  };

  /* ---------- detail ---------- */

  const openDetail = async (b) => {
    setDetail(b);
    setDetailLoading(true);
    try {
      const res = await request(`${BOOKING_API}/${b._id}`);
      setDetail(res.data);
    } catch (err) {
      notify("error", err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  /* ---------- actions ---------- */

  const runAction = async (b, action, body) => {
    setBusyId(b._id);
    try {
      const res = await request(`${BOOKING_API}/${b._id}/${action}`, { method: "PATCH", json: body || {} });
      notify("success", res.message || "Done");
      // response me user populate nahi hota — detail me purana userId rakho
      setDetail((prev) => (prev && prev._id === b._id ? { ...res.data, userId: prev.userId } : prev));
      setReasonModal(null);
      setReason("");
      await load();
    } catch (err) {
      notify("error", err.message);
      if (reasonModal) setReasonError(err.message);
      load();
    } finally {
      setBusyId(null);
    }
  };

  const openReason = (type, booking) => {
    setReasonModal({ type, booking });
    setReason("");
    setReasonError("");
  };

  const submitReason = () => {
    const text = reason.trim();
    if (reasonModal.type === "cancel" && !text) {
      setReasonError("Cancellation reason required hai");
      return;
    }
    runAction(reasonModal.booking, reasonModal.type, text ? { reason: text } : {});
  };

  /* ==================== RENDER ==================== */

  return (
    <div className="bk-page">
      <div className="bk-top">
        <div>
          <span className="bk-eyebrow">ACTIVITIES</span>
          <h2>Activity bookings</h2>
          <p>Customers ki bookings confirm, reject, cancel ya complete karo.</p>
        </div>
        <button className="bk-btn ghost" onClick={load} disabled={loading}>↻ Refresh</button>
      </div>

      <div className="bk-stats">
        <article><span>Total bookings</span><strong>{summary.total}</strong></article>
        <article className="amber"><span>Pending</span><strong>{summary.pending}</strong></article>
        <article className="blue"><span>Confirmed</span><strong>{summary.confirmed}</strong></article>
        <article className="green"><span>Completed</span><strong>{summary.completed}</strong></article>
        <article className="red"><span>Cancelled / Rejected</span><strong>{summary.closed}</strong></article>
        <article className="dark"><span>Revenue (confirmed + completed)</span><strong>{money(summary.revenue)}</strong></article>
      </div>

      <div className="bk-tabs">
        {STATUS_TABS.map(([value, label]) => (
          <button key={label} className={filters.status === value ? "active" : ""} onClick={() => setFilter("status", value)}>
            {label}
          </button>
        ))}
      </div>

      <div className="bk-filters">
        <input
          type="search" placeholder="Search this page — booking ID, name, phone..."
          value={filters.search} onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
        />
        <select value={filters.activityId} onChange={(e) => setFilter("activityId", e.target.value)}>
          <option value="">All activities</option>
          {activities.map((a) => <option key={a._id} value={a._id}>{a.title}</option>)}
        </select>
        <input type="date" title="Activity date" value={filters.date} onChange={(e) => setFilter("date", e.target.value)} />
        <select value={filters.paymentStatus} onChange={(e) => setFilter("paymentStatus", e.target.value)}>
          <option value="">All payments</option>
          {PAYMENT_STATUSES.map((p) => <option key={p} value={p}>{pretty(p)}</option>)}
        </select>
        {hasFilters && (
          <button className="bk-btn small ghost" onClick={() => { setPage(1); setFilters(EMPTY_FILTERS); }}>Reset</button>
        )}
      </div>

      {loading ? (
        <div className="bk-state"><div className="bk-spinner" /><p>Loading bookings...</p></div>
      ) : error ? (
        <div className="bk-state"><p className="bk-err">{error}</p><button className="bk-btn ghost" onClick={load}>Retry</button></div>
      ) : visible.length === 0 ? (
        <div className="bk-state">
          <div className="bk-empty-icon">▤</div>
          <h3>{hasFilters ? "Koi booking match nahi hui" : "Abhi koi booking nahi aayi"}</h3>
          <p>{hasFilters ? "Filters change karke dekho." : "Schedules active rakho — bookings yahan dikhengi."}</p>
        </div>
      ) : (
        <>
          <div className="bk-table-wrap">
            <table className="bk-table">
              <thead>
                <tr>
                  <th>Booking</th><th>Activity</th><th>Date & time</th><th>Guests</th>
                  <th>Traveller</th><th>Amount</th><th>Status</th><th className="r">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <button className="bk-link" onClick={() => openDetail(b)}>{b.bookingId}</button>
                      <small>{fmtDateTime(b.createdAt)}</small>
                    </td>
                    <td>
                      <div className="bk-act">
                        {b.activitySnapshot?.thumbnail
                          ? <img src={b.activitySnapshot.thumbnail} alt="" />
                          : <span className="bk-noimg">◆</span>}
                        <div>
                          <strong>{b.activitySnapshot?.title || "Activity"}</strong>
                          <small>{b.activitySnapshot?.city}</small>
                        </div>
                      </div>
                    </td>
                    <td><strong className="bk-d">{fmtDate(b.activityDate)}</strong><small>{timeRange(b)}</small></td>
                    <td>
                      <strong className="bk-d">{b.guests?.adults + b.guests?.children + b.guests?.infants} guests</strong>
                      <small>{b.guests?.adults}A • {b.guests?.children}C • {b.guests?.infants}I</small>
                    </td>
                    <td>
                      <strong className="bk-d">{b.leadTraveller?.name}</strong>
                      <small>{b.leadTraveller?.phone}</small>
                    </td>
                    <td>
                      <strong className="bk-d">{money(b.totalAmount)}</strong>
                      <span className={`bk-pay ${b.paymentStatus}`}>{pretty(b.paymentStatus)}</span>
                    </td>
                    <td><span className={`bk-badge ${b.status}`}>{pretty(b.status)}</span></td>
                    <td className="r">
                      <div className="bk-row-btns">
                        <button className="bk-btn small ghost" onClick={() => openDetail(b)}>View</button>
                        <Actions b={b} busy={busyId === b._id} onAction={runAction} onReason={openReason} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bk-pager">
            <span>{total} booking{total === 1 ? "" : "s"} • Page {page} of {pages}</span>
            <div>
              <button className="bk-btn small ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
              <button className="bk-btn small ghost" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next →</button>
            </div>
          </div>
        </>
      )}

      {/* ---------- DETAIL DRAWER ---------- */}
      {detail && (
        <div className="bk-drawer-bg" onClick={() => setDetail(null)}>
          <aside className="bk-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="bk-drawer-head">
              <div>
                <small>Booking ID</small>
                <h3>{detail.bookingId}</h3>
                <span className={`bk-badge ${detail.status}`}>{pretty(detail.status)}</span>
              </div>
              <button className="bk-close" onClick={() => setDetail(null)} aria-label="Close">×</button>
            </div>

            <div className="bk-drawer-body">
              {detailLoading && <p className="bk-muted">Refreshing details...</p>}

              <section>
                <h4>Activity</h4>
                <div className="bk-act big">
                  {detail.activitySnapshot?.thumbnail && <img src={detail.activitySnapshot.thumbnail} alt="" />}
                  <div>
                    <strong>{detail.activitySnapshot?.title}</strong>
                    <small>{detail.activitySnapshot?.city}</small>
                  </div>
                </div>
                <dl>
                  <div><dt>Date</dt><dd>{fmtDate(detail.activityDate)}</dd></div>
                  <div><dt>Time</dt><dd>{timeRange(detail)}</dd></div>
                  {detail.activitySnapshot?.meetingPoint && <div><dt>Meeting point</dt><dd>{detail.activitySnapshot.meetingPoint}</dd></div>}
                </dl>
              </section>

              <section>
                <h4>Lead traveller</h4>
                <dl>
                  <div><dt>Name</dt><dd>{detail.leadTraveller?.name}</dd></div>
                  <div><dt>Phone</dt><dd><a href={`tel:${detail.leadTraveller?.phone}`}>{detail.leadTraveller?.phone}</a></dd></div>
                  <div><dt>Email</dt><dd><a href={`mailto:${detail.leadTraveller?.email}`}>{detail.leadTraveller?.email}</a></dd></div>
                  {detail.userId && typeof detail.userId === "object" && (
                    <div><dt>Account</dt><dd>{detail.userId.fullname || detail.userId.name || detail.userId.email}</dd></div>
                  )}
                </dl>
                {detail.specialRequest && <p className="bk-note"><b>Special request:</b> {detail.specialRequest}</p>}
              </section>

              <section>
                <h4>Guests & price</h4>
                <table className="bk-mini">
                  <tbody>
                    <tr><td>Adults × {detail.guests?.adults}</td><td>{money(detail.priceSnapshot?.adult)}</td><td>{money(detail.guests?.adults * detail.priceSnapshot?.adult)}</td></tr>
                    {detail.guests?.children > 0 && (
                      <tr><td>Children × {detail.guests.children}</td><td>{money(detail.priceSnapshot?.child)}</td><td>{money(detail.guests.children * detail.priceSnapshot?.child)}</td></tr>
                    )}
                    {detail.guests?.infants > 0 && (
                      <tr><td>Infants × {detail.guests.infants}</td><td>{money(detail.priceSnapshot?.infant)}</td><td>{money(detail.guests.infants * detail.priceSnapshot?.infant)}</td></tr>
                    )}
                    <tr className="total"><td colSpan={2}>Total ({detail.slotsBooked} slot{detail.slotsBooked === 1 ? "" : "s"})</td><td>{money(detail.totalAmount)}</td></tr>
                  </tbody>
                </table>
                <dl>
                  <div><dt>Payment</dt><dd><span className={`bk-pay ${detail.paymentStatus}`}>{pretty(detail.paymentStatus)}</span></dd></div>
                </dl>
              </section>

              {(detail.status === "CANCELLED" || detail.status === "REJECTED") && (
                <section>
                  <h4>{detail.status === "REJECTED" ? "Rejection" : "Cancellation"}</h4>
                  <dl>
                    <div><dt>By</dt><dd>{pretty(detail.cancelledBy)}</dd></div>
                    <div><dt>When</dt><dd>{fmtDateTime(detail.cancelledAt)}</dd></div>
                    <div><dt>Reason</dt><dd>{detail.cancellationReason || "—"}</dd></div>
                  </dl>
                  {detail.paymentStatus === "REFUND_PENDING" && <p className="bk-warn">Payment PAID tha — refund pending hai.</p>}
                </section>
              )}

              {detail.statusHistory?.length > 0 && (
                <section>
                  <h4>Timeline</h4>
                  <ol className="bk-timeline">
                    {detail.statusHistory.map((h, i) => (
                      <li key={i}>
                        <span className={`dot ${h.status}`} />
                        <div>
                          <strong>{pretty(h.status)} <em>by {pretty(h.by)}</em></strong>
                          <small>{fmtDateTime(h.at)}{h.note ? ` • ${h.note}` : ""}</small>
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>
              )}
            </div>

            <div className="bk-drawer-foot">
              <Actions b={detail} busy={busyId === detail._id} onAction={runAction} onReason={openReason} size="" />
            </div>
          </aside>
        </div>
      )}

      {/* ---------- REASON MODAL ---------- */}
      {reasonModal && (
        <div className="bk-modal-bg" onClick={() => !busyId && setReasonModal(null)}>
          <div className="bk-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{reasonModal.type === "reject" ? "Reject booking?" : "Cancel booking?"}</h3>
            <p>
              <b>{reasonModal.booking.bookingId}</b> — {reasonModal.booking.leadTraveller?.name}. Slots wapas available ho jayenge
              {reasonModal.booking.paymentStatus === "PAID" ? " aur payment refund pending me jayegi." : "."}
            </p>
            <label>
              Reason {reasonModal.type === "cancel" ? <i>*</i> : <span>(optional)</span>}
              <textarea
                rows={3} value={reason} maxLength={300} autoFocus
                onChange={(e) => { setReason(e.target.value); setReasonError(""); }}
                placeholder={reasonModal.type === "reject" ? "e.g. Slot not available" : "e.g. Bad weather"}
              />
            </label>
            {reasonError && <div className="bk-alert">{reasonError}</div>}
            <div className="bk-modal-actions">
              <button className="bk-btn ghost" disabled={!!busyId} onClick={() => setReasonModal(null)}>Go back</button>
              <button className="bk-btn danger solid" disabled={!!busyId} onClick={submitReason}>
                {busyId ? "Please wait..." : reasonModal.type === "reject" ? "Yes, reject" : "Yes, cancel booking"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`bk-toast ${toast.type}`}>{toast.message}</div>}
    </div>
  );
}