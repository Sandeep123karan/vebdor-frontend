import { useCallback, useEffect, useMemo, useState } from "react";

/* =========================================================
   CONFIG  (Darshantype.jsx / Darshanslot.jsx wali same values rakho)
========================================================= */
const API_BASE = "https://bmtvendorfinal.onrender.com";
const AV_URL = `${API_BASE}/api/vendor/darshan-slot-availability`;
const SLOTS_URL = `${API_BASE}/api/vendor/darshan-slots`;
const TYPES_URL = `${API_BASE}/api/vendor/darshan-types`;

const DARSHAN_LIST_URLS = [
  `${API_BASE}/api/vendor/darshans/my-darshans`,
  `${API_BASE}/api/vendor/darshans/my`,
  `${API_BASE}/api/vendor/darshans`,
];

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const EMPTY_FORM = () => ({
  darshanId: "",
  darshanTypeId: "",
  slotId: "",
  date: "",
  totalCapacity: "",
  maxPersonsPerBooking: "10",
  adultPrice: "",
  childPrice: "",
  seniorCitizenPrice: "",
  currency: "INR",
  notes: "",
  isActive: true,
  isBookable: true,
  isBlocked: false,
  blockedReason: "",
});

/* =========================================================
   HELPERS
========================================================= */
async function api(url, { method = "GET", json } = {}) {
  const token = localStorage.getItem("vendorToken");
  const headers = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (json !== undefined) headers["Content-Type"] = "application/json";

  const res = await fetch(url, {
    method,
    headers,
    body: json !== undefined ? JSON.stringify(json) : undefined,
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (!res.ok || data?.success === false) {
    const err = new Error(data?.message || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

const toList = (json) => {
  if (Array.isArray(json)) return json;
  const d = json?.data ?? json?.darshans ?? json?.items;
  return Array.isArray(d) ? d : [];
};

const idOf = (v) => (v && typeof v === "object" ? v._id : v) || "";
const darshanLabel = (d) => d?.name || d?.templeName || d?.title || (d?._id ? `Darshan ${String(d._id).slice(-5)}` : "Temple");

const fmtTime = (t) => {
  if (!t || !/^\d{1,2}:\d{2}/.test(t)) return t || "--";
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};

// Backend date ko UTC midnight par store karta hai, isliye UTC me hi dikhao
const dateKey = (iso) => String(iso || "").slice(0, 10);
const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

const fmtDateShort = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

const money = (v, c) => `${!c || c === "INR" ? "₹" : c + " "}${Number(v || 0).toLocaleString("en-IN")}`;

const stateOf = (a) => {
  if (a.isBlocked) return "blocked";
  if (a.isSoldOut) return "soldout";
  if (!a.isActive) return "inactive";
  if (!a.isBookable) return "paused";
  return "open";
};

/* =========================================================
   MAIN PAGE
========================================================= */
export default function Darshanavailability() {
  const [darshans, setDarshans] = useState([]);
  const [allTypes, setAllTypes] = useState([]);
  const [allSlots, setAllSlots] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [toast, setToast] = useState(null);

  const [fDarshan, setFDarshan] = useState("");
  const [fType, setFType] = useState("");
  const [fSlot, setFSlot] = useState("");
  const [fFrom, setFFrom] = useState(todayStr());
  const [fTo, setFTo] = useState("");
  const [fState, setFState] = useState("all");
  const [search, setSearch] = useState("");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [modal, setModal] = useState({ open: false, editing: null });
  const [deleting, setDeleting] = useState(null);
  const [blocking, setBlocking] = useState(null);
  const [busyId, setBusyId] = useState("");

  const notify = (message, kind = "ok") => {
    setToast({ message, kind });
    setTimeout(() => setToast(null), 3200);
  };

  /* ---------- reference data (once) ---------- */
  useEffect(() => {
    (async () => {
      for (const url of DARSHAN_LIST_URLS) {
        try {
          setDarshans(toList(await api(url)));
          break;
        } catch (e) {
          if (e.status === 401) break;
        }
      }
      try {
        setAllTypes(toList(await api(`${TYPES_URL}/my-types`)));
      } catch {
        setAllTypes([]);
      }
      try {
        setAllSlots(toList(await api(`${SLOTS_URL}/my-slots`)));
      } catch {
        setAllSlots([]);
      }
    })();
  }, []);

  /* ---------- availability list ---------- */
  const load = useCallback(async () => {
    setLoading(true);
    setPageError("");
    try {
      const p = new URLSearchParams();
      if (fDarshan) p.set("darshanId", fDarshan);
      if (fType) p.set("darshanTypeId", fType);
      if (fSlot) p.set("slotId", fSlot);
      if (fFrom) p.set("from", fFrom);
      if (fTo) p.set("to", fTo);
      const qs = p.toString() ? `?${p}` : "";
      setItems(toList(await api(`${AV_URL}/my-availability${qs}`)));
    } catch (e) {
      setPageError(e.message);
    } finally {
      setLoading(false);
    }
  }, [fDarshan, fType, fSlot, fFrom, fTo]);

  useEffect(() => {
    load();
  }, [load]);

  const typeOptions = useMemo(() => allTypes.filter((t) => !fDarshan || idOf(t.darshanId) === fDarshan), [allTypes, fDarshan]);
  const slotOptions = useMemo(
    () => allSlots.filter((s) => (!fDarshan || idOf(s.darshanId) === fDarshan) && (!fType || idOf(s.darshanTypeId) === fType)),
    [allSlots, fDarshan, fType]
  );

  const visible = useMemo(() => {
    if (fState === "all") return items;
    if (fState === "paused") return items.filter((a) => ["paused", "inactive"].includes(stateOf(a)));
    return items.filter((a) => stateOf(a) === fState);
  }, [items, fState]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q
      ? visible.filter((a) =>
          [a.slotId?.name, a.darshanTypeId?.name, darshanLabel(a.darshanId), a.notes]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(q)
        )
      : visible;
    const dir = sortDir === "asc" ? 1 : -1;
    return [...list].sort(
      (a, b) =>
        dir *
        (dateKey(a.date).localeCompare(dateKey(b.date)) ||
          String(a.slotId?.startTime || "").localeCompare(String(b.slotId?.startTime || "")))
    );
  }, [visible, search, sortDir]);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = rows.slice((safePage - 1) * pageSize, safePage * pageSize);
  const showFrom = rows.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const showTo = Math.min(safePage * pageSize, rows.length);

  // filter / search badalte hi page 1 par wapas
  useEffect(() => {
    setPage(1);
  }, [fDarshan, fType, fSlot, fFrom, fTo, fState, search, pageSize]);

  const stats = useMemo(
    () => ({
      total: items.length,
      open: items.filter((a) => stateOf(a) === "open").length,
      soldOut: items.filter((a) => a.isSoldOut).length,
      blocked: items.filter((a) => a.isBlocked).length,
    }),
    [items]
  );

  /* ---------- actions ---------- */
  const patch = async (item, body, msg) => {
    setBusyId(item._id);
    try {
      const res = await api(`${AV_URL}/${item._id}`, { method: "PUT", json: body });
      setItems((prev) => prev.map((a) => (a._id === item._id ? res.data : a)));
      notify(msg);
      return true;
    } catch (e) {
      notify(e.message, "err");
      return false;
    } finally {
      setBusyId("");
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setBusyId(deleting._id);
    try {
      await api(`${AV_URL}/${deleting._id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((a) => a._id !== deleting._id));
      notify("Availability deleted");
      setDeleting(null);
    } catch (e) {
      notify(e.message, "err");
    } finally {
      setBusyId("");
    }
  };

  const clearFilters = () => {
    setFDarshan("");
    setFType("");
    setFSlot("");
    setFFrom(todayStr());
    setFTo("");
    setFState("all");
    setSearch("");
  };

  return (
    <div className="da-page">
      <style>{CSS}</style>

      <header className="da-head">
        <div>
          <h2>Slot availability</h2>
          <p>Open a slot for a specific date, set the seats and prices for that day, and block dates when darshan is not available.</p>
        </div>
        <button className="da-btn da-btn-primary" onClick={() => setModal({ open: true, editing: null })}>
          + Add availability
        </button>
      </header>

      <div className="da-stats">
        <Stat label="Dates listed" value={stats.total} />
        <Stat label="Open for booking" value={stats.open} />
        <Stat label="Sold out" value={stats.soldOut} />
        <Stat label="Blocked" value={stats.blocked} />
      </div>

      <div className="da-filters">
        <select
          className="da-input"
          value={fDarshan}
          onChange={(e) => {
            setFDarshan(e.target.value);
            setFType("");
            setFSlot("");
          }}
        >
          <option value="">All temples</option>
          {darshans.map((d) => (
            <option key={d._id} value={d._id}>
              {darshanLabel(d)}
            </option>
          ))}
        </select>
        <select
          className="da-input"
          value={fType}
          onChange={(e) => {
            setFType(e.target.value);
            setFSlot("");
          }}
        >
          <option value="">All types</option>
          {typeOptions.map((t) => (
            <option key={t._id} value={t._id}>
              {t.name}
            </option>
          ))}
        </select>
        <select className="da-input" value={fSlot} onChange={(e) => setFSlot(e.target.value)}>
          <option value="">All slots</option>
          {slotOptions.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name} ({fmtTime(s.startTime)})
            </option>
          ))}
        </select>
        <label className="da-date">
          <span>From</span>
          <input className="da-input" type="date" value={fFrom} onChange={(e) => setFFrom(e.target.value)} />
        </label>
        <label className="da-date">
          <span>To</span>
          <input className="da-input" type="date" value={fTo} min={fFrom || undefined} onChange={(e) => setFTo(e.target.value)} />
        </label>
      </div>

      <div className="da-filters-row2">
        <div className="da-seg" role="tablist" aria-label="Availability state">
          {[
            ["all", "All"],
            ["open", "Open"],
            ["soldout", "Sold out"],
            ["blocked", "Blocked"],
            ["paused", "Paused"],
          ].map(([v, l]) => (
            <button key={v} role="tab" aria-selected={fState === v} className={fState === v ? "on" : ""} onClick={() => setFState(v)}>
              {l}
            </button>
          ))}
        </div>
        <input
          className="da-input da-search"
          placeholder="Search slot, type or temple"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="da-link" onClick={clearFilters}>
          Reset filters
        </button>
      </div>

      {pageError && (
        <div className="da-alert">
          {pageError} <button onClick={load}>Try again</button>
        </div>
      )}

      {loading ? (
        <div className="da-skel-table">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="da-skel" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="da-empty">
          <h3>{items.length === 0 ? "No availability in this date range" : "Nothing matches these filters"}</h3>
          <p>
            {items.length === 0
              ? "A slot can only be booked on dates you have opened. Add availability for the days you want pilgrims to book."
              : "Clear the search or switch the state filter back to All."}
          </p>
          {items.length === 0 && (
            <button className="da-btn da-btn-primary" onClick={() => setModal({ open: true, editing: null })}>
              Add availability
            </button>
          )}
        </div>
      ) : (
        <div className="da-table-card">
          <div className="da-table-wrap">
            <table className="da-table">
              <thead>
                <tr>
                  <th>
                    <button className="da-sort" onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))} title="Sort by date">
                      Date {sortDir === "asc" ? "↑" : "↓"}
                    </button>
                  </th>
                  <th>Slot</th>
                  <th>Darshan type</th>
                  <th>Temple</th>
                  <th className="num">Seats left</th>
                  <th className="num">Adult</th>
                  <th className="num">Child</th>
                  <th className="num">Senior</th>
                  <th className="num">Max / booking</th>
                  <th>Status</th>
                  <th>Bookable</th>
                  <th className="act">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((a) => {
                  const st = stateOf(a);
                  const pct = a.totalCapacity ? Math.min(100, Math.round(((a.bookedCapacity || 0) / a.totalCapacity) * 100)) : 0;
                  const canDelete = !(a.bookedCapacity > 0);
                  return (
                    <tr key={a._id} className={`st-${st}`}>
                      <td className="nowrap">
                        <b>{fmtDateShort(a.date)}</b>
                      </td>
                      <td>
                        <div className="da-cell-main">{a.slotId?.name || "Slot"}</div>
                        <div className="da-cell-sub">
                          {fmtTime(a.slotId?.startTime)} – {fmtTime(a.slotId?.endTime)}
                        </div>
                        {a.notes && <div className="da-cell-note" title={a.notes}>{a.notes}</div>}
                      </td>
                      <td>{a.darshanTypeId?.name || "-"}</td>
                      <td>{darshanLabel(a.darshanId)}</td>
                      <td className="num seats">
                        <div>
                          <b>{a.availableCapacity}</b> / {a.totalCapacity}
                        </div>
                        <div className="da-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Seats booked">
                          <i style={{ width: `${pct}%` }} className={pct >= 100 ? "full" : ""} />
                        </div>
                        <small>{a.bookedCapacity || 0} booked</small>
                      </td>
                      <td className="num">{money(a.adultPrice, a.currency)}</td>
                      <td className="num">{money(a.childPrice, a.currency)}</td>
                      <td className="num">{money(a.seniorCitizenPrice, a.currency)}</td>
                      <td className="num">{a.maxPersonsPerBooking}</td>
                      <td>
                        {st === "blocked" && <span className="da-pill red">Blocked</span>}
                        {st === "soldout" && <span className="da-pill red">Sold out</span>}
                        {st === "inactive" && <span className="da-pill grey">Inactive</span>}
                        {st === "paused" && <span className="da-pill amber">Paused</span>}
                        {st === "open" && <span className="da-pill green">Open</span>}
                        {a.isBlocked && a.blockedReason && <div className="da-cell-reason">{a.blockedReason}</div>}
                      </td>
                      <td>
                        <Switch
                          label=""
                          checked={!!a.isBookable}
                          disabled={busyId === a._id || a.isBlocked}
                          onChange={(v) => patch(a, { isBookable: v }, v ? "Booking opened" : "Booking paused")}
                        />
                      </td>
                      <td className="act">
                        <div className="da-actions">
                          <button className="da-btn da-btn-sm" onClick={() => setModal({ open: true, editing: a })}>
                            Edit
                          </button>
                          {a.isBlocked ? (
                            <button className="da-btn da-btn-sm" disabled={busyId === a._id} onClick={() => patch(a, { isBlocked: false }, "Date unblocked")}>
                              Unblock
                            </button>
                          ) : (
                            <button className="da-btn da-btn-sm" onClick={() => setBlocking(a)}>
                              Block
                            </button>
                          )}
                          <button
                            className="da-btn da-btn-sm da-btn-danger"
                            disabled={!canDelete}
                            title={canDelete ? "Delete" : "This date has bookings. Block it instead of deleting."}
                            onClick={() => setDeleting(a)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="da-pager">
            <span>
              Showing {showFrom}–{showTo} of {rows.length}
            </span>
            <div className="da-pager-ctl">
              <label>
                Rows
                <select className="da-input" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
                  {[10, 25, 50].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
              <button className="da-btn da-btn-sm" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)}>
                Previous
              </button>
              <span>
                Page {safePage} of {totalPages}
              </span>
              <button className="da-btn da-btn-sm" disabled={safePage >= totalPages} onClick={() => setPage(safePage + 1)}>
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {modal.open && (
        <AvailabilityForm
          editing={modal.editing}
          darshans={darshans}
          allTypes={allTypes}
          allSlots={allSlots}
          defaults={{ darshanId: fDarshan, darshanTypeId: fType, slotId: fSlot }}
          onClose={() => setModal({ open: false, editing: null })}
          onSaved={(msg) => {
            setModal({ open: false, editing: null });
            notify(msg);
            load();
          }}
        />
      )}

      {blocking && (
        <BlockDialog
          item={blocking}
          onClose={() => setBlocking(null)}
          onConfirm={async (reason) => {
            const ok = await patch(blocking, { isBlocked: true, blockedReason: reason }, "Date blocked");
            if (ok) setBlocking(null);
          }}
          busy={busyId === blocking._id}
        />
      )}

      {deleting && (
        <div className="da-overlay" onClick={() => setDeleting(null)}>
          <div className="da-dialog" onClick={(e) => e.stopPropagation()} role="alertdialog" aria-modal="true">
            <h3>Delete this date?</h3>
            <p>
              {deleting.slotId?.name} on {fmtDate(deleting.date)} will be removed. Pilgrims will no longer be able to book it.
            </p>
            <div className="da-dialog-actions">
              <button className="da-btn" onClick={() => setDeleting(null)}>
                Keep it
              </button>
              <button className="da-btn da-btn-danger-solid" disabled={busyId === deleting._id} onClick={confirmDelete}>
                {busyId === deleting._id ? "Deleting…" : "Delete availability"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`da-toast ${toast.kind}`}>{toast.message}</div>}
    </div>
  );
}

/* =========================================================
   BLOCK DIALOG
========================================================= */
function BlockDialog({ item, onClose, onConfirm, busy }) {
  const [reason, setReason] = useState("");
  return (
    <div className="da-overlay" onClick={onClose}>
      <div className="da-dialog" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <h3>Block {fmtDate(item.date)}?</h3>
        <p>Blocked dates can’t be booked. Existing bookings are not cancelled.</p>
        <div className="da-field">
          <label>Reason (optional)</label>
          <input className="da-input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Temple closed for festival" autoFocus />
        </div>
        <div className="da-dialog-actions">
          <button className="da-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="da-btn da-btn-primary" disabled={busy} onClick={() => onConfirm(reason.trim())}>
            {busy ? "Blocking…" : "Block date"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   FORM (create + edit)
========================================================= */
function AvailabilityForm({ editing, darshans, allTypes, allSlots, defaults, onClose, onSaved }) {
  const isEdit = !!editing;
  const booked = editing?.bookedCapacity || 0;

  const [form, setForm] = useState(() => {
    if (!editing) return { ...EMPTY_FORM(), ...defaults, date: "" };
    const v = (k, f = "") => (editing[k] === undefined || editing[k] === null ? f : editing[k]);
    return {
      darshanId: idOf(editing.darshanId),
      darshanTypeId: idOf(editing.darshanTypeId),
      slotId: idOf(editing.slotId),
      date: dateKey(editing.date),
      totalCapacity: String(v("totalCapacity")),
      maxPersonsPerBooking: String(v("maxPersonsPerBooking", 10)),
      adultPrice: String(v("adultPrice", 0)),
      childPrice: String(v("childPrice", 0)),
      seniorCitizenPrice: String(v("seniorCitizenPrice", 0)),
      currency: v("currency", "INR"),
      notes: v("notes"),
      isActive: v("isActive", true),
      isBookable: v("isBookable", true),
      isBlocked: v("isBlocked", false),
      blockedReason: v("blockedReason"),
    };
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});

  const typesForTemple = useMemo(() => allTypes.filter((t) => idOf(t.darshanId) === form.darshanId), [allTypes, form.darshanId]);
  const slotsForType = useMemo(() => allSlots.filter((s) => idOf(s.darshanTypeId) === form.darshanTypeId), [allSlots, form.darshanTypeId]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && !saving && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, saving]);

  const clearErr = (k) => errors[k] && setErrors((p) => ({ ...p, [k]: "" }));

  const set = (key) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((p) => ({ ...p, [key]: value }));
    clearErr(key);
  };

  const onTemple = (e) => {
    setForm((p) => ({ ...p, darshanId: e.target.value, darshanTypeId: "", slotId: "" }));
    setErrors((p) => ({ ...p, darshanId: "", darshanTypeId: "", slotId: "" }));
  };
  const onType = (e) => {
    setForm((p) => ({ ...p, darshanTypeId: e.target.value, slotId: "" }));
    setErrors((p) => ({ ...p, darshanTypeId: "", slotId: "" }));
  };
  // slot chunte hi uski capacity / prices default me bhar do (sirf create me)
  const onSlot = (e) => {
    const id = e.target.value;
    const s = allSlots.find((x) => x._id === id);
    setForm((p) =>
      isEdit || !s
        ? { ...p, slotId: id }
        : {
            ...p,
            slotId: id,
            totalCapacity: String(s.capacity ?? ""),
            maxPersonsPerBooking: String(s.maxPersonsPerBooking ?? 10),
            adultPrice: String(s.adultPrice ?? ""),
            childPrice: String(s.childPrice ?? ""),
            seniorCitizenPrice: String(s.seniorCitizenPrice ?? ""),
            currency: s.currency || p.currency,
          }
    );
    setErrors((p) => ({ ...p, slotId: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.darshanId) e.darshanId = "Choose a temple.";
    if (!form.darshanTypeId) e.darshanTypeId = "Choose a darshan type.";
    if (!form.slotId) e.slotId = "Choose a slot.";
    if (!form.date) e.date = "Pick a date.";
    else if (!isEdit && form.date < todayStr()) e.date = "Date can’t be in the past.";

    const cap = Number(form.totalCapacity);
    if (!cap || cap < 1) e.totalCapacity = "Enter at least 1 seat.";
    else if (isEdit && cap < booked) e.totalCapacity = `${booked} seats are already booked. Capacity can’t go below that.`;

    const mp = Number(form.maxPersonsPerBooking);
    if (!mp || mp < 1) e.maxPersonsPerBooking = "Must be at least 1.";
    else if (cap && mp > cap) e.maxPersonsPerBooking = "Can’t be more than total seats.";

    ["adultPrice", "childPrice", "seniorCitizenPrice"].forEach((k) => {
      if (form[k] !== "" && Number(form[k]) < 0) e[k] = "Cannot be negative.";
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setError("");
    if (!validate()) return;
    setSaving(true);

    const common = {
      totalCapacity: Number(form.totalCapacity),
      maxPersonsPerBooking: Number(form.maxPersonsPerBooking),
      adultPrice: Number(form.adultPrice || 0),
      childPrice: Number(form.childPrice || 0),
      seniorCitizenPrice: Number(form.seniorCitizenPrice || 0),
      currency: form.currency,
      notes: form.notes,
      isBookable: form.isBookable,
    };

    try {
      if (isEdit) {
        await api(`${AV_URL}/${editing._id}`, {
          method: "PUT",
          json: {
            ...common,
            isActive: form.isActive,
            isBlocked: form.isBlocked,
            blockedReason: form.isBlocked ? form.blockedReason : "",
          },
        });
        onSaved("Availability updated");
      } else {
        await api(AV_URL, {
          method: "POST",
          json: {
            ...common,
            darshanId: form.darshanId,
            darshanTypeId: form.darshanTypeId,
            slotId: form.slotId,
            date: form.date,
          },
        });
        onSaved("Availability created");
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="da-overlay" onClick={() => !saving && onClose()}>
      <form className="da-modal" onClick={(e) => e.stopPropagation()} onSubmit={submit} noValidate>
        <div className="da-modal-head">
          <h3>{isEdit ? "Edit availability" : "Add availability"}</h3>
          <button type="button" className="da-x" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="da-modal-body">
          {error && <div className="da-alert">{error}</div>}

          <fieldset>
            <legend>Slot and date</legend>
            <div className="da-grid2">
              <Field label="Temple" error={errors.darshanId} required>
                <select className="da-input" value={form.darshanId} onChange={onTemple} disabled={isEdit}>
                  <option value="">Select a temple</option>
                  {darshans.map((d) => (
                    <option key={d._id} value={d._id}>
                      {darshanLabel(d)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Darshan type" error={errors.darshanTypeId} required>
                <select className="da-input" value={form.darshanTypeId} onChange={onType} disabled={isEdit || !form.darshanId}>
                  <option value="">{form.darshanId ? "Select a type" : "Choose a temple first"}</option>
                  {typesForTemple.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Slot" error={errors.slotId} required>
                <select className="da-input" value={form.slotId} onChange={onSlot} disabled={isEdit || !form.darshanTypeId}>
                  <option value="">{form.darshanTypeId ? "Select a slot" : "Choose a type first"}</option>
                  {slotsForType.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({fmtTime(s.startTime)} – {fmtTime(s.endTime)})
                    </option>
                  ))}
                </select>
                {form.darshanTypeId && slotsForType.length === 0 && <small>This type has no slots yet. Add one in Darshan Slots first.</small>}
              </Field>
              <Field label="Date" error={errors.date} required>
                <input className="da-input" type="date" value={form.date} min={isEdit ? undefined : todayStr()} onChange={set("date")} disabled={isEdit} />
              </Field>
            </div>
            {isEdit && <small className="da-note">Temple, type, slot and date can’t be changed. Delete this entry and add a new one to move it.</small>}
          </fieldset>

          <fieldset>
            <legend>Seats</legend>
            <div className="da-grid2">
              <Field label="Total seats for this date" error={errors.totalCapacity} required>
                <input className="da-input" type="number" min={isEdit ? Math.max(1, booked) : 1} value={form.totalCapacity} onChange={set("totalCapacity")} placeholder="e.g. 100" />
                {isEdit && <small>{booked} already booked.</small>}
                {!isEdit && <small>Filled from the slot. Change it for this date if needed.</small>}
              </Field>
              <Field label="Max people per booking" error={errors.maxPersonsPerBooking}>
                <input className="da-input" type="number" min="1" value={form.maxPersonsPerBooking} onChange={set("maxPersonsPerBooking")} />
              </Field>
            </div>
          </fieldset>

          <fieldset>
            <legend>Pricing for this date</legend>
            <div className="da-grid4">
              <Field label="Adult" error={errors.adultPrice}>
                <input className="da-input" type="number" min="0" value={form.adultPrice} onChange={set("adultPrice")} placeholder="0" />
              </Field>
              <Field label="Child" error={errors.childPrice}>
                <input className="da-input" type="number" min="0" value={form.childPrice} onChange={set("childPrice")} placeholder="0" />
              </Field>
              <Field label="Senior citizen" error={errors.seniorCitizenPrice}>
                <input className="da-input" type="number" min="0" value={form.seniorCitizenPrice} onChange={set("seniorCitizenPrice")} placeholder="0" />
              </Field>
              <Field label="Currency">
                <select className="da-input" value={form.currency} onChange={set("currency")}>
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </Field>
            </div>
          </fieldset>

          <fieldset>
            <legend>Booking</legend>
            <div className="da-checks">
              <label>
                <input type="checkbox" checked={form.isBookable} onChange={set("isBookable")} />
                <span>
                  <b>Bookable</b>
                  <small>Pilgrims can book this date</small>
                </span>
              </label>
              {isEdit && (
                <>
                  <label>
                    <input type="checkbox" checked={form.isActive} onChange={set("isActive")} />
                    <span>
                      <b>Active</b>
                      <small>Turn off to hide this date</small>
                    </span>
                  </label>
                  <label>
                    <input type="checkbox" checked={form.isBlocked} onChange={set("isBlocked")} />
                    <span>
                      <b>Blocked</b>
                      <small>Closed for the day</small>
                    </span>
                  </label>
                </>
              )}
            </div>
            {isEdit && form.isBlocked && (
              <Field label="Block reason">
                <input className="da-input" value={form.blockedReason} onChange={set("blockedReason")} placeholder="e.g. Temple closed for festival" />
              </Field>
            )}
            <Field label="Notes">
              <textarea className="da-input" rows={3} value={form.notes} onChange={set("notes")} placeholder="Internal or guest-facing note for this date" />
            </Field>
          </fieldset>
        </div>

        <div className="da-modal-foot">
          <button type="button" className="da-btn" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="da-btn da-btn-primary" disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create availability"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* =========================================================
   SMALL PIECES
========================================================= */
function Stat({ label, value }) {
  return (
    <div className="da-stat">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function Field({ label, error, required, children }) {
  return (
    <div className={`da-field ${error ? "has-err" : ""}`}>
      <label>
        {label}
        {required && <i aria-hidden="true"> *</i>}
      </label>
      {children}
      {error && <em role="alert">{error}</em>}
    </div>
  );
}

function Switch({ label, checked, onChange, disabled }) {
  return (
    <label className={`da-switch ${disabled ? "disabled" : ""}`}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span className="track" />
      <span className="txt">{label}</span>
    </label>
  );
}

/* =========================================================
   STYLES (self-contained, prefix da-)
========================================================= */
const CSS = `
.da-page{
  --ink:#241c1a; --muted:#6f6560; --line:#e7dfd6; --paper:#fffdf9; --bg:#faf6f0;
  --maroon:#7a1f2b; --maroon-d:#5d1620; --marigold:#e9a21b; --ok:#2f7d4f; --err:#b3261e;
  color:var(--ink); font-family:"Segoe UI",system-ui,-apple-system,sans-serif; font-size:14px; line-height:1.5;
}
.da-page *{box-sizing:border-box}
.da-head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:18px;flex-wrap:wrap}
.da-head h2{margin:0 0 4px;font-size:22px;font-weight:700;letter-spacing:-.01em}
.da-head p{margin:0;color:var(--muted);max-width:580px}

.da-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px}
.da-stat{background:var(--paper);border:1px solid var(--line);border-radius:10px;padding:12px 14px;display:flex;flex-direction:column}
.da-stat strong{font-size:24px;line-height:1.1}
.da-stat span{color:var(--muted);font-size:12.5px}

.da-filters{display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;margin-bottom:12px}
.da-filters-row2{display:flex;gap:14px;align-items:center;flex-wrap:wrap;margin-bottom:18px}
.da-input{width:100%;padding:9px 11px;border:1px solid var(--line);border-radius:8px;background:#fff;font:inherit;color:var(--ink)}
.da-filters .da-input{width:auto;min-width:170px}
.da-date{display:flex;flex-direction:column;gap:3px;font-size:12px;color:var(--muted)}
.da-input:focus,.da-btn:focus-visible,.da-seg button:focus-visible,.da-x:focus-visible,.da-link:focus-visible{outline:2px solid var(--maroon);outline-offset:1px}
.da-input:disabled{background:#f3eee7;color:var(--muted)}
textarea.da-input{resize:vertical}
.da-link{border:0;background:none;color:var(--maroon);text-decoration:underline;cursor:pointer;font:inherit}

.da-seg{display:inline-flex;border:1px solid var(--line);border-radius:8px;overflow:hidden;background:#fff}
.da-seg button{border:0;background:transparent;padding:8px 13px;font:inherit;cursor:pointer;color:var(--muted)}
.da-seg button.on{background:var(--maroon);color:#fff}

.da-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:8px 13px;border:1px solid var(--line);background:#fff;color:var(--ink);border-radius:8px;font:inherit;font-weight:600;cursor:pointer}
.da-btn:hover:not(:disabled){border-color:#cfc3b6}
.da-btn:disabled{opacity:.5;cursor:not-allowed}
.da-btn-primary{background:var(--maroon);border-color:var(--maroon);color:#fff;padding:9px 15px}
.da-btn-primary:hover:not(:disabled){background:var(--maroon-d);border-color:var(--maroon-d)}
.da-btn-danger{color:var(--err)}
.da-btn-danger-solid{background:var(--err);border-color:var(--err);color:#fff}

.da-alert{background:#fdecea;border:1px solid #f3c1bc;color:#7d1a14;padding:10px 12px;border-radius:8px;margin-bottom:14px}
.da-alert button{margin-left:8px;border:0;background:none;color:inherit;text-decoration:underline;cursor:pointer;font:inherit}

.da-search{flex:1;min-width:220px;max-width:340px}
.da-btn-sm{padding:5px 10px;font-size:13px}

.da-table-card{background:var(--paper);border:1px solid var(--line);border-radius:12px;overflow:hidden}
.da-table-wrap{overflow-x:auto}
.da-table{width:100%;min-width:1180px;border-collapse:collapse;font-size:13.5px}
.da-table th{position:sticky;top:0;background:#f3eee7;text-align:left;font-weight:700;padding:11px 12px;border-bottom:1px solid var(--line);white-space:nowrap;color:#4b413c}
.da-table td{padding:11px 12px;border-bottom:1px solid var(--line);vertical-align:top}
.da-table tbody tr:last-child td{border-bottom:0}
.da-table tbody tr:hover{background:#fbf7f1}
.da-table tr.st-inactive td{opacity:.65}
.da-table tr.st-blocked td:first-child,.da-table tr.st-soldout td:first-child{box-shadow:inset 3px 0 0 var(--err)}
.da-table tr.st-open td:first-child{box-shadow:inset 3px 0 0 var(--ok)}
.da-table tr.st-paused td:first-child{box-shadow:inset 3px 0 0 var(--marigold)}
.da-table .num{text-align:right;white-space:nowrap}
.da-table .act{text-align:right;min-width:210px}
.da-table .nowrap{white-space:nowrap}
.da-sort{border:0;background:none;font:inherit;font-weight:700;cursor:pointer;color:inherit;padding:0}
.da-cell-main{font-weight:600}
.da-cell-sub{color:var(--muted);font-size:12.5px}
.da-cell-note{color:var(--muted);font-size:12px;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.da-cell-reason{color:var(--err);font-size:12px;margin-top:3px;max-width:150px}
.da-table .seats{min-width:120px}
.da-table .seats small{color:var(--muted)}
.da-pill{font-size:12px;font-weight:600;padding:2px 9px;border-radius:99px;white-space:nowrap}
.da-pill.red{background:#fdecea;color:var(--err)}
.da-pill.amber{background:#fdf1d6;color:#8a5a00}
.da-pill.grey{background:#ece7e0;color:var(--muted)}
.da-pill.green{background:#e3f3e9;color:var(--ok)}
.da-bar{height:6px;border-radius:99px;background:#eee6db;margin:5px 0 3px;overflow:hidden}
.da-bar i{display:block;height:100%;background:var(--ok);border-radius:99px}
.da-bar i.full{background:var(--err)}
.da-actions{display:flex;gap:6px;justify-content:flex-end;flex-wrap:nowrap}

.da-pager{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;padding:10px 14px;border-top:1px solid var(--line);background:#fbf8f3;color:var(--muted);font-size:13px}
.da-pager-ctl{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.da-pager-ctl label{display:flex;align-items:center;gap:6px}
.da-pager-ctl .da-input{width:auto;padding:5px 8px}

.da-skel-table{display:flex;flex-direction:column;gap:8px}
.da-skel{height:48px;border-radius:8px;background:linear-gradient(90deg,#f3ede4 25%,#faf6f0 50%,#f3ede4 75%);background-size:200% 100%;animation:dash 1.4s infinite}
@keyframes dash{to{background-position:-200% 0}}
@media (prefers-reduced-motion:reduce){.da-skel{animation:none}}

.da-empty{text-align:center;padding:48px 20px;background:var(--paper);border:1px dashed #d5c9bb;border-radius:12px}
.da-empty h3{margin:0 0 6px;font-size:18px}
.da-empty p{margin:0 auto 16px;max-width:460px;color:var(--muted)}

.da-switch{display:inline-flex;align-items:center;gap:8px;cursor:pointer}
.da-switch input{position:absolute;opacity:0;pointer-events:none}
.da-switch .track{width:34px;height:20px;border-radius:99px;background:#cfc6bb;position:relative;transition:background .15s}
.da-switch .track::after{content:"";position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#fff;transition:transform .15s}
.da-switch input:checked + .track{background:var(--ok)}
.da-switch input:checked + .track::after{transform:translateX(14px)}
.da-switch input:focus-visible + .track{outline:2px solid var(--maroon);outline-offset:2px}
.da-switch.disabled{opacity:.55;cursor:not-allowed}
.da-switch .txt{font-size:13px}
.da-switch .txt:empty{display:none}

.da-overlay{position:fixed;inset:0;background:rgba(36,28,26,.5);display:flex;align-items:center;justify-content:center;padding:16px;z-index:1000}
.da-modal{background:var(--bg);width:100%;max-width:720px;max-height:92vh;border-radius:14px;display:flex;flex-direction:column;overflow:hidden}
.da-modal-head,.da-modal-foot{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px 18px;background:var(--paper)}
.da-modal-head{border-bottom:1px solid var(--line)}
.da-modal-head h3{margin:0;font-size:18px}
.da-modal-foot{border-top:1px solid var(--line);justify-content:flex-end}
.da-x{border:0;background:none;font-size:26px;line-height:1;cursor:pointer;color:var(--muted)}
.da-modal-body{padding:16px 18px;overflow:auto;display:flex;flex-direction:column;gap:16px}
.da-modal-body fieldset{border:1px solid var(--line);background:var(--paper);border-radius:10px;padding:14px;margin:0;display:flex;flex-direction:column;gap:12px;min-width:0}
.da-modal-body legend{padding:0 6px;font-weight:700}
.da-note{color:var(--muted);font-size:12px}

.da-grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.da-grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.da-field{display:flex;flex-direction:column;gap:5px;min-width:0}
.da-field label{font-weight:600;font-size:13px}
.da-field label i{color:var(--err);font-style:normal}
.da-field small{color:var(--muted);font-size:12px}
.da-field em{color:var(--err);font-style:normal;font-size:12.5px}
.da-field.has-err .da-input{border-color:var(--err)}

.da-checks{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.da-checks label{display:flex;gap:10px;align-items:flex-start;border:1px solid var(--line);border-radius:8px;padding:10px;cursor:pointer;background:#fff}
.da-checks label span{display:flex;flex-direction:column}
.da-checks small{color:var(--muted);font-size:12px}
.da-checks input{margin-top:3px;accent-color:var(--maroon)}

.da-dialog{background:#fff;border-radius:12px;padding:20px;max-width:440px;width:100%}
.da-dialog h3{margin:0 0 8px}
.da-dialog p{margin:0 0 14px;color:var(--muted)}
.da-dialog .da-field{margin-bottom:16px}
.da-dialog-actions{display:flex;justify-content:flex-end;gap:8px}

.da-toast{position:fixed;bottom:22px;left:50%;transform:translateX(-50%);padding:10px 16px;border-radius:8px;color:#fff;background:var(--ok);z-index:1100;box-shadow:0 6px 20px rgba(0,0,0,.2)}
.da-toast.err{background:var(--err)}

@media (max-width:820px){
  .da-stats{grid-template-columns:repeat(2,1fr)}
  .da-grid4{grid-template-columns:repeat(2,1fr)}
  .da-checks{grid-template-columns:1fr}
}
@media (max-width:560px){
  .da-grid2{grid-template-columns:1fr}
  .da-filters .da-input,.da-seg{width:100%}
  .da-date{width:100%}
  .da-seg button{flex:1}
  .da-search{max-width:none;width:100%}
}
`;