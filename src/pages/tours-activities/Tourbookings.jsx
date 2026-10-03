
import React, { useEffect, useMemo, useState, useCallback } from "react";

/* ==========================================================
   CONFIG
   Token ka key agar alag hai (jaise "vendorToken") to yahan badlo
========================================================== */
const API = "https://bmtvendorfinal.onrender.com/api/vendor";
const TOKEN_KEY = "token";

const BOOKING_STATUSES = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "REJECTED"];
const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED", "REFUNDED"];
const PAYMENT_METHODS = ["ONLINE", "CASH", "UPI", "CARD", "OTHER"];

const api = async (path, options = {}) => {
  const token = localStorage.getItem(TOKEN_KEY);
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) throw new Error(data.message || "Something went wrong");
  return data;
};

const money = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-";

const emptyForm = {
  tourId: "", customerName: "", customerPhone: "", customerEmail: "",
  bookingDate: "", adults: 1, children: 0, infants: 0,
  adultPrice: 0, childPrice: 0, infantPrice: 0, discount: 0, tax: 0,
  paymentMethod: "CASH", paymentStatus: "PENDING", customerNote: "", vendorNote: "",
};

export default function TourBookings() {
  const [bookings, setBookings] = useState([]);
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [payment, setPayment] = useState("");
  const [tourId, setTourId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const notify = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (status) q.set("status", status);
      if (payment) q.set("paymentStatus", payment);
      if (tourId) q.set("tourId", tourId);
      if (fromDate) q.set("fromDate", fromDate);
      if (toDate) q.set("toDate", toDate);
      const data = await api(`/tour-bookings?${q.toString()}`);
      setBookings(data.bookings || []);
    } catch (e) {
      notify(e.message, "err");
    } finally {
      setLoading(false);
    }
  }, [status, payment, tourId, fromDate, toDate]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    api("/tours")
      .then((d) => setTours(Array.isArray(d) ? d : d.tours || d.data || []))
      .catch(() => {});
  }, []);

  const visible = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return bookings;
    return bookings.filter((b) =>
      [b.customerName, b.customerPhone, b.customerEmail, b.tourId?.title]
        .filter(Boolean).some((v) => v.toLowerCase().includes(s))
    );
  }, [bookings, search]);

  const stats = useMemo(() => ({
    total: bookings.length,
    pending: bookings.filter((b) => b.bookingStatus === "PENDING").length,
    confirmed: bookings.filter((b) => b.bookingStatus === "CONFIRMED").length,
    revenue: bookings
      .filter((b) => b.paymentStatus === "PAID")
      .reduce((sum, b) => sum + (b.pricing?.totalAmount || 0), 0),
  }), [bookings]);

  const replace = (updated) => {
    setBookings((list) => list.map((b) => (b._id === updated._id ? { ...b, ...updated, tourId: b.tourId, customerId: b.customerId } : b)));
    setSelected((s) => (s && s._id === updated._id ? { ...s, ...updated, tourId: s.tourId, customerId: s.customerId } : s));
  };

  const changeStatus = async (b, bookingStatus) => {
    try {
      const d = await api(`/tour-bookings/${b._id}/status`, { method: "PATCH", body: JSON.stringify({ bookingStatus }) });
      replace(d.booking); notify(d.message);
    } catch (e) { notify(e.message, "err"); }
  };

  const changePayment = async (b, paymentStatus) => {
    try {
      const d = await api(`/tour-bookings/${b._id}/payment-status`, { method: "PATCH", body: JSON.stringify({ paymentStatus }) });
      replace(d.booking); notify(d.message);
    } catch (e) { notify(e.message, "err"); }
  };

  const saveNote = async () => {
    try {
      const d = await api(`/tour-bookings/${selected._id}/note`, { method: "PATCH", body: JSON.stringify({ vendorNote: note }) });
      replace(d.booking); notify("Note saved");
    } catch (e) { notify(e.message, "err"); }
  };

  const remove = async (b) => {
    if (!window.confirm(`Delete booking of ${b.customerName}?`)) return;
    try {
      await api(`/tour-bookings/${b._id}`, { method: "DELETE" });
      setBookings((l) => l.filter((x) => x._id !== b._id));
      setSelected(null); notify("Booking deleted");
    } catch (e) { notify(e.message, "err"); }
  };

  /* ---------- create form ---------- */
  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const subtotal =
    form.adults * form.adultPrice + form.children * form.childPrice + form.infants * form.infantPrice;
  const totalAmount = Math.max(0, subtotal - Number(form.discount) + Number(form.tax));

  const pickTour = (id) => {
    const t = tours.find((x) => x._id === id);
    setForm((f) => ({
      ...f, tourId: id,
      adultPrice: t?.pricing?.adultPrice ?? t?.pricing?.adult ?? t?.price ?? f.adultPrice,
      childPrice: t?.pricing?.childPrice ?? t?.pricing?.child ?? f.childPrice,
    }));
  };

  const create = async () => {
    if (!form.tourId || !form.customerName || !form.customerPhone || !form.bookingDate)
      return notify("Tour, name, phone and date are required", "err");
    setSaving(true);
    try {
      await api("/tour-bookings", {
        method: "POST",
        body: JSON.stringify({
          tourId: form.tourId,
          customerName: form.customerName,
          customerPhone: form.customerPhone,
          customerEmail: form.customerEmail || undefined,
          bookingDate: form.bookingDate,
          guests: {
            adults: Number(form.adults), children: Number(form.children), infants: Number(form.infants),
            total: Number(form.adults) + Number(form.children) + Number(form.infants),
          },
          pricing: {
            adultPrice: Number(form.adultPrice), childPrice: Number(form.childPrice),
            infantPrice: Number(form.infantPrice), subtotal,
            discount: Number(form.discount), tax: Number(form.tax), totalAmount,
          },
          paymentMethod: form.paymentMethod,
          paymentStatus: form.paymentStatus,
          customerNote: form.customerNote,
          vendorNote: form.vendorNote,
        }),
      });
      notify("Booking created");
      setShowCreate(false); setForm(emptyForm); load();
    } catch (e) { notify(e.message, "err"); }
    finally { setSaving(false); }
  };

  return (
    <div className="tb">
      <style>{css}</style>

      <div className="tb-head">
        <div>
          <span className="tb-eyebrow">Tours & Activities</span>
          <h1>Tour Bookings</h1>
          <p>See who booked your tours, confirm them and track payments.</p>
        </div>
        <button className="btn primary" onClick={() => setShowCreate(true)}>+ Add Booking</button>
      </div>

      <div className="tb-stats">
        <Stat label="Total Bookings" value={stats.total} icon="✦" />
        <Stat label="Pending" value={stats.pending} icon="◷" />
        <Stat label="Confirmed" value={stats.confirmed} icon="✓" />
        <Stat label="Revenue Received" value={money(stats.revenue)} icon="₹" />
      </div>

      <div className="tb-card tb-filters">
        <input className="grow" placeholder="Search customer, phone or tour..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All booking status</option>
          {BOOKING_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={payment} onChange={(e) => setPayment(e.target.value)}>
          <option value="">All payments</option>
          {PAYMENT_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={tourId} onChange={(e) => setTourId(e.target.value)}>
          <option value="">All tours</option>
          {tours.map((t) => <option key={t._id} value={t._id}>{t.title}</option>)}
        </select>
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} title="From date" />
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} title="To date" />
        <button className="btn" onClick={load}>↻ Refresh</button>
      </div>

      <div className="tb-card">
        <div className="tb-card-title">
          <h3>All Bookings</h3>
          <span>{visible.length} bookings</span>
        </div>
        <div className="tb-scroll">
          <table>
            <thead>
              <tr>
                <th>Customer</th><th>Tour</th><th>Travel date</th><th>Guests</th>
                <th>Amount</th><th>Payment</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan="8" className="empty">Loading bookings...</td></tr>}
              {!loading && visible.length === 0 && (
                <tr><td colSpan="8" className="empty">No bookings yet. Click “Add Booking” to create one.</td></tr>
              )}
              {!loading && visible.map((b) => (
                <tr key={b._id}>
                  <td>
                    <b>{b.customerName}</b>
                    <small>{b.customerPhone}</small>
                  </td>
                  <td>{b.tourId?.title || "-"}</td>
                  <td>{fmtDate(b.bookingDate)}</td>
                  <td>{b.guests?.total}</td>
                  <td><b>{money(b.pricing?.totalAmount)}</b></td>
                  <td><span className={`pill pay-${b.paymentStatus}`}>{b.paymentStatus}</span></td>
                  <td><span className={`pill st-${b.bookingStatus}`}>{b.bookingStatus}</span></td>
                  <td className="right">
                    <button className="btn sm" onClick={() => { setSelected(b); setNote(b.vendorNote || ""); }}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------- DETAILS DRAWER ---------- */}
      {selected && (
        <div className="overlay" onClick={() => setSelected(null)}>
          <aside className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-head">
              <div>
                <h2>{selected.customerName}</h2>
                <small>Booking #{selected._id.slice(-6).toUpperCase()}</small>
              </div>
              <button className="x" onClick={() => setSelected(null)}>✕</button>
            </div>

            <div className="kv">
              <Row k="Tour" v={selected.tourId?.title} />
              <Row k="Travel date" v={fmtDate(selected.bookingDate)} />
              <Row k="Phone" v={selected.customerPhone} />
              <Row k="Email" v={selected.customerEmail || "-"} />
              <Row k="Guests" v={`${selected.guests?.adults} adults, ${selected.guests?.children} children, ${selected.guests?.infants} infants`} />
              <Row k="Payment method" v={selected.paymentMethod} />
              {selected.customerNote && <Row k="Customer note" v={selected.customerNote} />}
            </div>

            <div className="bill">
              <div><span>Subtotal</span><b>{money(selected.pricing?.subtotal)}</b></div>
              <div><span>Discount</span><b>- {money(selected.pricing?.discount)}</b></div>
              <div><span>Tax</span><b>{money(selected.pricing?.tax)}</b></div>
              <div className="total"><span>Total</span><b>{money(selected.pricing?.totalAmount)}</b></div>
            </div>

            <label>Booking status</label>
            <select value={selected.bookingStatus} onChange={(e) => changeStatus(selected, e.target.value)}>
              {BOOKING_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>

            <label>Payment status</label>
            <select value={selected.paymentStatus} onChange={(e) => changePayment(selected, e.target.value)}>
              {PAYMENT_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>

            <label>Your private note</label>
            <textarea rows="3" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Pickup time, special requests..." />
            <div className="drawer-actions">
              <button className="btn primary" onClick={saveNote}>Save note</button>
              <button className="btn danger" onClick={() => remove(selected)}>Delete booking</button>
            </div>
          </aside>
        </div>
      )}

      {/* ---------- CREATE MODAL ---------- */}
      {showCreate && (
        <div className="overlay center" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-head">
              <h2>Add Booking</h2>
              <button className="x" onClick={() => setShowCreate(false)}>✕</button>
            </div>

            <div className="grid2">
              <div className="span2">
                <label>Tour *</label>
                <select value={form.tourId} onChange={(e) => pickTour(e.target.value)}>
                  <option value="">Select a tour</option>
                  {tours.map((t) => <option key={t._id} value={t._id}>{t.title}</option>)}
                </select>
              </div>
              <div><label>Customer name *</label><input value={form.customerName} onChange={(e) => setF("customerName", e.target.value)} /></div>
              <div><label>Phone *</label><input value={form.customerPhone} onChange={(e) => setF("customerPhone", e.target.value)} /></div>
              <div><label>Email</label><input type="email" value={form.customerEmail} onChange={(e) => setF("customerEmail", e.target.value)} /></div>
              <div><label>Travel date *</label><input type="date" value={form.bookingDate} onChange={(e) => setF("bookingDate", e.target.value)} /></div>

              <div><label>Adults</label><input type="number" min="0" value={form.adults} onChange={(e) => setF("adults", +e.target.value)} /></div>
              <div><label>Adult price</label><input type="number" min="0" value={form.adultPrice} onChange={(e) => setF("adultPrice", +e.target.value)} /></div>
              <div><label>Children</label><input type="number" min="0" value={form.children} onChange={(e) => setF("children", +e.target.value)} /></div>
              <div><label>Child price</label><input type="number" min="0" value={form.childPrice} onChange={(e) => setF("childPrice", +e.target.value)} /></div>
              <div><label>Infants</label><input type="number" min="0" value={form.infants} onChange={(e) => setF("infants", +e.target.value)} /></div>
              <div><label>Infant price</label><input type="number" min="0" value={form.infantPrice} onChange={(e) => setF("infantPrice", +e.target.value)} /></div>
              <div><label>Discount</label><input type="number" min="0" value={form.discount} onChange={(e) => setF("discount", +e.target.value)} /></div>
              <div><label>Tax</label><input type="number" min="0" value={form.tax} onChange={(e) => setF("tax", +e.target.value)} /></div>

              <div>
                <label>Payment method</label>
                <select value={form.paymentMethod} onChange={(e) => setF("paymentMethod", e.target.value)}>
                  {PAYMENT_METHODS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label>Payment status</label>
                <select value={form.paymentStatus} onChange={(e) => setF("paymentStatus", e.target.value)}>
                  {PAYMENT_STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="span2"><label>Customer note</label><textarea rows="2" value={form.customerNote} onChange={(e) => setF("customerNote", e.target.value)} /></div>
            </div>

            <div className="modal-foot">
              <div className="sum">Total <b>{money(totalAmount)}</b></div>
              <button className="btn" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="btn primary" disabled={saving} onClick={create}>{saving ? "Saving..." : "Create booking"}</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}

const Stat = ({ label, value, icon }) => (
  <div className="tb-card stat">
    <div className="ico">{icon}</div>
    <div><small>{label}</small><strong>{value}</strong></div>
  </div>
);

const Row = ({ k, v }) => (
  <div className="row"><span>{k}</span><b>{v}</b></div>
);

/* ==========================================================
   STYLES - blue & white
========================================================== */
const css = `
.tb{--blue:#1d4ed8;--blue-d:#1e40af;--blue-l:#eff4ff;--line:#e5eaf3;--ink:#0f172a;--mute:#64748b;
  font-family:Inter,system-ui,sans-serif;color:var(--ink);background:#f8faff;padding:28px 32px;min-height:100vh}
.tb *{box-sizing:border-box}
.tb-head{display:flex;justify-content:space-between;align-items:flex-end;gap:16px;flex-wrap:wrap;margin-bottom:22px}
.tb-eyebrow{color:var(--blue);font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase}
.tb-head h1{margin:4px 0 6px;font-size:34px;font-weight:800}
.tb-head p{margin:0;color:var(--mute)}
.tb-card{background:#fff;border:1px solid var(--line);border-radius:14px}
.tb-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:18px}
.stat{display:flex;align-items:center;gap:14px;padding:18px}
.stat .ico{width:44px;height:44px;border-radius:12px;background:var(--blue-l);color:var(--blue);display:grid;place-items:center;font-size:18px}
.stat small{display:block;color:var(--mute);font-size:13px;font-weight:600}
.stat strong{font-size:26px}
.tb-filters{display:flex;gap:10px;flex-wrap:wrap;padding:14px;margin-bottom:18px}
.tb input,.tb select,.tb textarea{border:1px solid var(--line);border-radius:10px;padding:10px 12px;font:inherit;font-size:14px;background:#fff;color:var(--ink);width:100%}
.tb-filters input,.tb-filters select{width:auto}
.tb-filters .grow{flex:1;min-width:220px}
.tb input:focus,.tb select:focus,.tb textarea:focus{outline:2px solid #bfd0ff;border-color:var(--blue)}
.btn{border:1px solid var(--line);background:#fff;color:var(--ink);padding:10px 16px;border-radius:10px;font-weight:700;font-size:14px;cursor:pointer}
.btn:hover{background:var(--blue-l)}
.btn.primary{background:var(--blue);border-color:var(--blue);color:#fff;box-shadow:0 6px 16px rgba(29,78,216,.25)}
.btn.primary:hover{background:var(--blue-d)}
.btn.danger{color:#b91c1c;border-color:#fecaca}
.btn.danger:hover{background:#fef2f2}
.btn.sm{padding:6px 14px}
.btn:disabled{opacity:.6;cursor:not-allowed}
.tb-card-title{display:flex;justify-content:space-between;align-items:baseline;padding:18px 20px 10px}
.tb-card-title h3{margin:0;font-size:18px}
.tb-card-title span{color:var(--mute);font-size:13px}
.tb-scroll{overflow-x:auto}
.tb table{width:100%;border-collapse:collapse;min-width:860px}
.tb th{text-align:left;font-size:12px;color:var(--mute);font-weight:700;padding:10px 20px;border-bottom:1px solid var(--line);background:#fafcff}
.tb td{padding:14px 20px;border-bottom:1px solid var(--line);font-size:14px;vertical-align:middle}
.tb td small{display:block;color:var(--mute);font-size:12px;margin-top:2px}
.tb td.right{text-align:right}
.tb td.empty{text-align:center;color:var(--mute);padding:40px}
.pill{font-size:11px;font-weight:700;padding:4px 10px;border-radius:999px;background:#eef2f7;color:#475569}
.st-CONFIRMED,.pay-PAID{background:#dbeafe;color:#1d4ed8}
.st-COMPLETED{background:#1d4ed8;color:#fff}
.st-PENDING,.pay-PENDING{background:#fef3c7;color:#92400e}
.st-CANCELLED,.st-REJECTED,.pay-FAILED{background:#fee2e2;color:#b91c1c}
.pay-REFUNDED{background:#e0e7ff;color:#4338ca}
.overlay{position:fixed;inset:0;background:rgba(15,23,42,.45);z-index:50;display:flex;justify-content:flex-end}
.overlay.center{justify-content:center;align-items:center;padding:16px}
.drawer{width:420px;max-width:100%;background:#fff;height:100%;overflow-y:auto;padding:22px}
.modal{width:640px;max-width:100%;max-height:92vh;overflow-y:auto;background:#fff;border-radius:16px;padding:22px}
.drawer-head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px}
.drawer-head h2{margin:0;font-size:22px}
.drawer-head small{color:var(--mute)}
.x{border:0;background:var(--blue-l);color:var(--blue);width:34px;height:34px;border-radius:50%;cursor:pointer;font-size:14px}
.kv .row{display:flex;justify-content:space-between;gap:16px;padding:9px 0;border-bottom:1px solid var(--line);font-size:14px}
.kv .row span{color:var(--mute)}
.kv .row b{text-align:right;font-weight:600}
.bill{background:var(--blue-l);border-radius:12px;padding:14px;margin:16px 0}
.bill div{display:flex;justify-content:space-between;padding:4px 0;font-size:14px}
.bill .total{border-top:1px dashed #b6c7f5;margin-top:6px;padding-top:10px;font-size:17px;color:var(--blue)}
.tb label{display:block;font-size:12px;font-weight:700;color:var(--mute);margin:14px 0 6px}
.drawer-actions{display:flex;gap:10px;margin-top:14px}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:0 14px}
.grid2 label{margin-top:10px}
.span2{grid-column:span 2}
.modal-foot{display:flex;align-items:center;gap:10px;margin-top:18px;padding-top:16px;border-top:1px solid var(--line)}
.modal-foot .sum{margin-right:auto;color:var(--mute)}
.modal-foot .sum b{color:var(--blue);font-size:20px;margin-left:6px}
.toast{position:fixed;bottom:24px;right:24px;background:var(--blue);color:#fff;padding:12px 18px;border-radius:10px;font-weight:600;z-index:99;box-shadow:0 10px 30px rgba(0,0,0,.2)}
.toast.err{background:#b91c1c}
@media(max-width:900px){.tb{padding:18px 14px}.tb-stats{grid-template-columns:repeat(2,1fr)}}
@media(max-width:520px){.grid2{grid-template-columns:1fr}.span2{grid-column:auto}}
`;