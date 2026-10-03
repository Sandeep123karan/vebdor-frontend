import { useCallback, useEffect, useMemo, useState } from "react";

/* =========================================================
   CONFIG  (Darshantype.jsx wali same values rakho)
========================================================= */
const API_BASE = "https://bmtvendorfinal.onrender.com";
const SLOTS_URL = `${API_BASE}/api/vendor/darshan-slots`;
const TYPES_URL = `${API_BASE}/api/vendor/darshan-types`;

const DARSHAN_LIST_URLS = [
  `${API_BASE}/api/vendor/darshans/my-darshans`,
  `${API_BASE}/api/vendor/darshans/my`,
  `${API_BASE}/api/vendor/darshans`,
];

const EMPTY_FORM = {
  darshanId: "",
  darshanTypeId: "",
  name: "",
  startTime: "",
  endTime: "",
  capacity: "",
  maxPersonsPerBooking: "10",
  adultPrice: "",
  childPrice: "",
  seniorCitizenPrice: "",
  currency: "INR",
  description: "",
  isActive: true,
  isBookable: true,
};

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
  const ap = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ap}`;
};

const money = (v, c) => `${!c || c === "INR" ? "₹" : c + " "}${Number(v || 0).toLocaleString("en-IN")}`;

/* =========================================================
   MAIN PAGE
========================================================= */
export default function Darshanslot() {
  const [darshans, setDarshans] = useState([]);
  const [allTypes, setAllTypes] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [toast, setToast] = useState(null);

  const [filterDarshan, setFilterDarshan] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterState, setFilterState] = useState("all");

  const [modal, setModal] = useState({ open: false, editing: null });
  const [deleting, setDeleting] = useState(null);
  const [busyId, setBusyId] = useState("");

  const notify = (message, kind = "ok") => {
    setToast({ message, kind });
    setTimeout(() => setToast(null), 3200);
  };

  /* ---------- temples + all types (once) ---------- */
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
    })();
  }, []);

  /* ---------- slots ---------- */
  const loadSlots = useCallback(async () => {
    setLoading(true);
    setPageError("");
    try {
      const p = new URLSearchParams();
      if (filterDarshan) p.set("darshanId", filterDarshan);
      if (filterType) p.set("darshanTypeId", filterType);
      const qs = p.toString() ? `?${p}` : "";
      setSlots(toList(await api(`${SLOTS_URL}/my-slots${qs}`)));
    } catch (e) {
      setPageError(e.message);
    } finally {
      setLoading(false);
    }
  }, [filterDarshan, filterType]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  const typeOptions = useMemo(
    () => allTypes.filter((t) => !filterDarshan || idOf(t.darshanId) === filterDarshan),
    [allTypes, filterDarshan]
  );

  const visible = useMemo(() => {
    return slots.filter((s) => {
      if (filterState === "bookable") return s.isActive && s.isBookable && !s.isSoldOut;
      if (filterState === "soldout") return s.isSoldOut;
      if (filterState === "paused") return !s.isActive || !s.isBookable;
      return true;
    });
  }, [slots, filterState]);

  const stats = useMemo(
    () => ({
      total: slots.length,
      open: slots.filter((s) => s.isActive && s.isBookable && !s.isSoldOut).length,
      soldOut: slots.filter((s) => s.isSoldOut).length,
      seats: slots.reduce((n, s) => n + (s.availableCapacity || 0), 0),
    }),
    [slots]
  );

  /* ---------- quick toggle ---------- */
  const toggle = async (slot, patch, msg) => {
    setBusyId(slot._id);
    try {
      const res = await api(`${SLOTS_URL}/${slot._id}`, { method: "PUT", json: patch });
      setSlots((prev) =>
        prev.map((s) => (s._id === slot._id ? { ...s, ...res.data, darshanId: s.darshanId, darshanTypeId: s.darshanTypeId } : s))
      );
      notify(msg);
    } catch (e) {
      notify(e.message, "err");
    } finally {
      setBusyId("");
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setBusyId(deleting._id);
    try {
      await api(`${SLOTS_URL}/${deleting._id}`, { method: "DELETE" });
      setSlots((prev) => prev.filter((s) => s._id !== deleting._id));
      notify("Slot deleted");
      setDeleting(null);
    } catch (e) {
      notify(e.message, "err");
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="ds-page">
      <style>{CSS}</style>

      <header className="ds-head">
        <div>
          <h2>Darshan slots</h2>
          <p>Set the time windows for each darshan type, with seats, pricing and booking limits.</p>
        </div>
        <button className="ds-btn ds-btn-primary" onClick={() => setModal({ open: true, editing: null })}>
          + Add slot
        </button>
      </header>

      <div className="ds-stats">
        <Stat label="Total slots" value={stats.total} />
        <Stat label="Open for booking" value={stats.open} />
        <Stat label="Sold out" value={stats.soldOut} />
        <Stat label="Seats available" value={stats.seats} />
      </div>

      <div className="ds-filters">
        <select
          className="ds-input"
          value={filterDarshan}
          onChange={(e) => {
            setFilterDarshan(e.target.value);
            setFilterType("");
          }}
        >
          <option value="">All temples</option>
          {darshans.map((d) => (
            <option key={d._id} value={d._id}>
              {darshanLabel(d)}
            </option>
          ))}
        </select>
        <select className="ds-input" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="">All darshan types</option>
          {typeOptions.map((t) => (
            <option key={t._id} value={t._id}>
              {t.name}
            </option>
          ))}
        </select>
        <div className="ds-seg" role="tablist" aria-label="Slot state">
          {[
            ["all", "All"],
            ["bookable", "Open"],
            ["soldout", "Sold out"],
            ["paused", "Paused"],
          ].map(([v, l]) => (
            <button key={v} role="tab" aria-selected={filterState === v} className={filterState === v ? "on" : ""} onClick={() => setFilterState(v)}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {pageError && (
        <div className="ds-alert">
          {pageError} <button onClick={loadSlots}>Try again</button>
        </div>
      )}

      {loading ? (
        <div className="ds-list">
          {[1, 2, 3].map((n) => (
            <div key={n} className="ds-row ds-skel" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="ds-empty">
          <h3>{slots.length === 0 ? "No slots yet" : "No slots match these filters"}</h3>
          <p>
            {slots.length === 0
              ? "Slots need a temple and a darshan type first. Add a slot like “Morning 6:00 – 8:00 AM” with its seat count."
              : "Change the temple, type or state filter to see more."}
          </p>
          {slots.length === 0 && (
            <button className="ds-btn ds-btn-primary" onClick={() => setModal({ open: true, editing: null })}>
              Add slot
            </button>
          )}
        </div>
      ) : (
        <div className="ds-list">
          {visible.map((s) => {
            const pct = s.capacity ? Math.min(100, Math.round(((s.bookedCapacity || 0) / s.capacity) * 100)) : 0;
            const canDelete = !(s.bookedCapacity > 0);
            return (
              <article className={`ds-row ${!s.isActive ? "off" : ""}`} key={s._id}>
                <div className="ds-time">
                  <strong>{fmtTime(s.startTime)}</strong>
                  <span>to {fmtTime(s.endTime)}</span>
                </div>

                <div className="ds-main">
                  <div className="ds-title">
                    <h3>{s.name}</h3>
                    {s.isSoldOut && <span className="ds-pill red">Sold out</span>}
                    {!s.isSoldOut && !s.isActive && <span className="ds-pill grey">Inactive</span>}
                    {!s.isSoldOut && s.isActive && !s.isBookable && <span className="ds-pill amber">Booking paused</span>}
                  </div>
                  <p className="ds-sub">
                    {s.darshanTypeId?.name || "Darshan type"} · {darshanLabel(s.darshanId)}
                    {s.darshanId?.city ? `, ${s.darshanId.city}` : ""}
                  </p>
                  {s.description && <p className="ds-desc">{s.description}</p>}

                  <div className="ds-prices">
                    <span>Adult <b>{money(s.adultPrice, s.currency)}</b></span>
                    <span>Child <b>{money(s.childPrice, s.currency)}</b></span>
                    <span>Senior <b>{money(s.seniorCitizenPrice, s.currency)}</b></span>
                    <span>Max {s.maxPersonsPerBooking} per booking</span>
                  </div>
                </div>

                <div className="ds-cap">
                  <div className="ds-cap-top">
                    <b>{s.availableCapacity}</b> <span>of {s.capacity} seats left</span>
                  </div>
                  <div className="ds-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Seats booked">
                    <i style={{ width: `${pct}%` }} className={pct >= 100 ? "full" : ""} />
                  </div>
                  <small>{s.bookedCapacity || 0} booked</small>
                </div>

                <div className="ds-side">
                  <Switch
                    label="Active"
                    checked={!!s.isActive}
                    disabled={busyId === s._id}
                    onChange={(v) => toggle(s, { isActive: v }, v ? "Slot activated" : "Slot deactivated")}
                  />
                  <Switch
                    label="Bookable"
                    checked={!!s.isBookable}
                    disabled={busyId === s._id}
                    onChange={(v) => toggle(s, { isBookable: v }, v ? "Booking opened" : "Booking paused")}
                  />
                  <div className="ds-actions">
                    <button className="ds-btn" onClick={() => setModal({ open: true, editing: s })}>
                      Edit
                    </button>
                    <button
                      className="ds-btn ds-btn-danger"
                      disabled={!canDelete}
                      title={canDelete ? "Delete slot" : "Slots with bookings can’t be deleted. Turn off Bookable instead."}
                      onClick={() => setDeleting(s)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {modal.open && (
        <SlotForm
          editing={modal.editing}
          darshans={darshans}
          allTypes={allTypes}
          defaultDarshan={filterDarshan}
          defaultType={filterType}
          onClose={() => setModal({ open: false, editing: null })}
          onSaved={(msg) => {
            setModal({ open: false, editing: null });
            notify(msg);
            loadSlots();
          }}
        />
      )}

      {deleting && (
        <div className="ds-overlay" onClick={() => setDeleting(null)}>
          <div className="ds-dialog" onClick={(e) => e.stopPropagation()} role="alertdialog" aria-modal="true">
            <h3>Delete “{deleting.name}”?</h3>
            <p>
              The {fmtTime(deleting.startTime)} – {fmtTime(deleting.endTime)} slot will be removed permanently.
            </p>
            <div className="ds-dialog-actions">
              <button className="ds-btn" onClick={() => setDeleting(null)}>
                Keep it
              </button>
              <button className="ds-btn ds-btn-danger-solid" disabled={busyId === deleting._id} onClick={confirmDelete}>
                {busyId === deleting._id ? "Deleting…" : "Delete slot"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`ds-toast ${toast.kind}`}>{toast.message}</div>}
    </div>
  );
}

/* =========================================================
   FORM
========================================================= */
function SlotForm({ editing, darshans, allTypes, defaultDarshan, defaultType, onClose, onSaved }) {
  const isEdit = !!editing;
  const booked = editing?.bookedCapacity || 0;

  const [form, setForm] = useState(() => {
    if (!editing) return { ...EMPTY_FORM, darshanId: defaultDarshan || "", darshanTypeId: defaultType || "" };
    const v = (k, f = "") => (editing[k] === undefined || editing[k] === null ? f : editing[k]);
    return {
      darshanId: idOf(editing.darshanId),
      darshanTypeId: idOf(editing.darshanTypeId),
      name: v("name"),
      startTime: v("startTime"),
      endTime: v("endTime"),
      capacity: String(v("capacity")),
      maxPersonsPerBooking: String(v("maxPersonsPerBooking", 10)),
      adultPrice: String(v("adultPrice", 0)),
      childPrice: String(v("childPrice", 0)),
      seniorCitizenPrice: String(v("seniorCitizenPrice", 0)),
      currency: v("currency", "INR"),
      description: v("description"),
      isActive: v("isActive", true),
      isBookable: v("isBookable", true),
    };
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});

  const typesForTemple = useMemo(() => allTypes.filter((t) => idOf(t.darshanId) === form.darshanId), [allTypes, form.darshanId]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && !saving && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, saving]);

  const set = (key) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((p) => ({ ...p, [key]: value }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: "" }));
  };

  const onTempleChange = (e) => {
    setForm((p) => ({ ...p, darshanId: e.target.value, darshanTypeId: "" }));
    setErrors((p) => ({ ...p, darshanId: "", darshanTypeId: "" }));
  };

  // type choose karte hi uske price / capacity defaults bhar do (sirf create me)
  const onTypeChange = (e) => {
    const id = e.target.value;
    const t = allTypes.find((x) => x._id === id);
    setForm((p) =>
      isEdit || !t
        ? { ...p, darshanTypeId: id }
        : {
            ...p,
            darshanTypeId: id,
            adultPrice: String(t.adultPrice ?? ""),
            childPrice: String(t.childPrice ?? ""),
            seniorCitizenPrice: String(t.seniorCitizenPrice ?? ""),
            currency: t.currency || p.currency,
            capacity: p.capacity || (t.perSlotCapacity > 0 ? String(t.perSlotCapacity) : ""),
            maxPersonsPerBooking: String(t.maxPersonsPerBooking || p.maxPersonsPerBooking),
          }
    );
    setErrors((p) => ({ ...p, darshanTypeId: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.darshanId) e.darshanId = "Choose a temple.";
    if (!form.darshanTypeId) e.darshanTypeId = "Choose a darshan type.";
    if (!form.name.trim()) e.name = "Enter a slot name.";
    if (!form.startTime) e.startTime = "Set a start time.";
    if (!form.endTime) e.endTime = "Set an end time.";
    if (form.startTime && form.endTime && form.endTime <= form.startTime) e.endTime = "End time must be after start time.";
    const cap = Number(form.capacity);
    if (!cap || cap < 1) e.capacity = "Enter at least 1 seat.";
    else if (isEdit && cap < booked) e.capacity = `${booked} seats are already booked. Capacity can’t go below that.`;
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

    const payload = {
      name: form.name.trim(),
      startTime: form.startTime,
      endTime: form.endTime,
      capacity: Number(form.capacity),
      maxPersonsPerBooking: Number(form.maxPersonsPerBooking),
      adultPrice: Number(form.adultPrice || 0),
      childPrice: Number(form.childPrice || 0),
      seniorCitizenPrice: Number(form.seniorCitizenPrice || 0),
      currency: form.currency,
      description: form.description,
    };

    try {
      if (isEdit) {
        await api(`${SLOTS_URL}/${editing._id}`, {
          method: "PUT",
          json: { ...payload, isActive: form.isActive, isBookable: form.isBookable },
        });
        onSaved("Slot updated");
      } else {
        await api(SLOTS_URL, {
          method: "POST",
          json: { ...payload, darshanId: form.darshanId, darshanTypeId: form.darshanTypeId },
        });
        onSaved("Slot created");
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ds-overlay" onClick={() => !saving && onClose()}>
      <form className="ds-modal" onClick={(e) => e.stopPropagation()} onSubmit={submit} noValidate>
        <div className="ds-modal-head">
          <h3>{isEdit ? "Edit slot" : "Add slot"}</h3>
          <button type="button" className="ds-x" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="ds-modal-body">
          {error && <div className="ds-alert">{error}</div>}

          <fieldset>
            <legend>Darshan</legend>
            <div className="ds-grid2">
              <Field label="Temple" error={errors.darshanId} required>
                <select className="ds-input" value={form.darshanId} onChange={onTempleChange} disabled={isEdit}>
                  <option value="">Select a temple</option>
                  {darshans.map((d) => (
                    <option key={d._id} value={d._id}>
                      {darshanLabel(d)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Darshan type" error={errors.darshanTypeId} required>
                <select className="ds-input" value={form.darshanTypeId} onChange={onTypeChange} disabled={isEdit || !form.darshanId}>
                  <option value="">{form.darshanId ? "Select a type" : "Choose a temple first"}</option>
                  {typesForTemple.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                {form.darshanId && typesForTemple.length === 0 && <small>This temple has no darshan types yet. Add one in Darshan Types first.</small>}
              </Field>
            </div>
            {isEdit && <small className="ds-note">Temple and type can’t be changed after the slot is created.</small>}
          </fieldset>

          <fieldset>
            <legend>Timing</legend>
            <Field label="Slot name" error={errors.name} required>
              <input className="ds-input" value={form.name} onChange={set("name")} placeholder="e.g. Morning slot" />
            </Field>
            <div className="ds-grid2">
              <Field label="Start time" error={errors.startTime} required>
                <input className="ds-input" type="time" value={form.startTime} onChange={set("startTime")} />
              </Field>
              <Field label="End time" error={errors.endTime} required>
                <input className="ds-input" type="time" value={form.endTime} onChange={set("endTime")} />
              </Field>
            </div>
            <Field label="Description">
              <textarea className="ds-input" rows={3} value={form.description} onChange={set("description")} placeholder="Reporting point, entry gate, anything pilgrims should know" />
            </Field>
          </fieldset>

          <fieldset>
            <legend>Seats</legend>
            <div className="ds-grid2">
              <Field label="Total seats" error={errors.capacity} required>
                <input className="ds-input" type="number" min={isEdit ? Math.max(1, booked) : 1} value={form.capacity} onChange={set("capacity")} placeholder="e.g. 100" />
                {isEdit && <small>{booked} already booked.</small>}
              </Field>
              <Field label="Max people per booking" error={errors.maxPersonsPerBooking}>
                <input className="ds-input" type="number" min="1" value={form.maxPersonsPerBooking} onChange={set("maxPersonsPerBooking")} />
              </Field>
            </div>
          </fieldset>

          <fieldset>
            <legend>Pricing</legend>
            <div className="ds-grid4">
              <Field label="Adult" error={errors.adultPrice}>
                <input className="ds-input" type="number" min="0" value={form.adultPrice} onChange={set("adultPrice")} placeholder="0" />
              </Field>
              <Field label="Child" error={errors.childPrice}>
                <input className="ds-input" type="number" min="0" value={form.childPrice} onChange={set("childPrice")} placeholder="0" />
              </Field>
              <Field label="Senior citizen" error={errors.seniorCitizenPrice}>
                <input className="ds-input" type="number" min="0" value={form.seniorCitizenPrice} onChange={set("seniorCitizenPrice")} placeholder="0" />
              </Field>
              <Field label="Currency">
                <select className="ds-input" value={form.currency} onChange={set("currency")}>
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </Field>
            </div>
            {!isEdit && <small className="ds-note">Prices are filled from the darshan type. Change them if this slot costs differently.</small>}
          </fieldset>

          {isEdit && (
            <fieldset>
              <legend>Availability</legend>
              <div className="ds-checks">
                <label>
                  <input type="checkbox" checked={form.isActive} onChange={set("isActive")} />
                  <span>
                    <b>Active</b>
                    <small>Turn off to hide the slot</small>
                  </span>
                </label>
                <label>
                  <input type="checkbox" checked={form.isBookable} onChange={set("isBookable")} />
                  <span>
                    <b>Bookable</b>
                    <small>Pause new bookings only</small>
                  </span>
                </label>
              </div>
            </fieldset>
          )}
        </div>

        <div className="ds-modal-foot">
          <button type="button" className="ds-btn" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="ds-btn ds-btn-primary" disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create slot"}
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
    <div className="ds-stat">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function Field({ label, error, required, children }) {
  return (
    <div className={`ds-field ${error ? "has-err" : ""}`}>
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
    <label className={`ds-switch ${disabled ? "disabled" : ""}`}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span className="track" />
      <span className="txt">{label}</span>
    </label>
  );
}

/* =========================================================
   STYLES (self-contained, prefix ds-)
========================================================= */
const CSS = `
.ds-page{
  --ink:#241c1a; --muted:#6f6560; --line:#e7dfd6; --paper:#fffdf9; --bg:#faf6f0;
  --maroon:#7a1f2b; --maroon-d:#5d1620; --marigold:#e9a21b; --ok:#2f7d4f; --err:#b3261e;
  color:var(--ink); font-family:"Segoe UI",system-ui,-apple-system,sans-serif; font-size:14px; line-height:1.5;
}
.ds-page *{box-sizing:border-box}
.ds-head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:18px;flex-wrap:wrap}
.ds-head h2{margin:0 0 4px;font-size:22px;font-weight:700;letter-spacing:-.01em}
.ds-head p{margin:0;color:var(--muted);max-width:560px}

.ds-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px}
.ds-stat{background:var(--paper);border:1px solid var(--line);border-radius:10px;padding:12px 14px;display:flex;flex-direction:column}
.ds-stat strong{font-size:24px;line-height:1.1}
.ds-stat span{color:var(--muted);font-size:12.5px}

.ds-filters{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:16px}
.ds-input{width:100%;padding:9px 11px;border:1px solid var(--line);border-radius:8px;background:#fff;font:inherit;color:var(--ink)}
.ds-filters .ds-input{width:auto;min-width:190px}
.ds-input:focus,.ds-btn:focus-visible,.ds-seg button:focus-visible,.ds-x:focus-visible{outline:2px solid var(--maroon);outline-offset:1px}
.ds-input:disabled{background:#f3eee7;color:var(--muted)}
textarea.ds-input{resize:vertical}

.ds-seg{display:inline-flex;border:1px solid var(--line);border-radius:8px;overflow:hidden;background:#fff}
.ds-seg button{border:0;background:transparent;padding:8px 13px;font:inherit;cursor:pointer;color:var(--muted)}
.ds-seg button.on{background:var(--maroon);color:#fff}

.ds-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:9px 15px;border:1px solid var(--line);background:#fff;color:var(--ink);border-radius:8px;font:inherit;font-weight:600;cursor:pointer}
.ds-btn:hover:not(:disabled){border-color:#cfc3b6}
.ds-btn:disabled{opacity:.5;cursor:not-allowed}
.ds-btn-primary{background:var(--maroon);border-color:var(--maroon);color:#fff}
.ds-btn-primary:hover:not(:disabled){background:var(--maroon-d);border-color:var(--maroon-d)}
.ds-btn-danger{color:var(--err)}
.ds-btn-danger-solid{background:var(--err);border-color:var(--err);color:#fff}

.ds-alert{background:#fdecea;border:1px solid #f3c1bc;color:#7d1a14;padding:10px 12px;border-radius:8px;margin-bottom:14px}
.ds-alert button{margin-left:8px;border:0;background:none;color:inherit;text-decoration:underline;cursor:pointer;font:inherit}

.ds-list{display:flex;flex-direction:column;gap:12px}
.ds-row{display:grid;grid-template-columns:120px 1fr 190px 170px;gap:18px;align-items:start;background:var(--paper);border:1px solid var(--line);border-radius:12px;padding:16px}
.ds-row.off{opacity:.72}
.ds-skel{min-height:120px;background:linear-gradient(90deg,#f3ede4 25%,#faf6f0 50%,#f3ede4 75%);background-size:200% 100%;animation:dssh 1.4s infinite}
@keyframes dssh{to{background-position:-200% 0}}
@media (prefers-reduced-motion:reduce){.ds-skel{animation:none}}

.ds-time{border-right:2px solid var(--marigold);padding-right:12px}
.ds-time strong{display:block;font-size:18px;line-height:1.2}
.ds-time span{color:var(--muted);font-size:13px}

.ds-title{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.ds-title h3{margin:0;font-size:17px}
.ds-pill{font-size:12px;font-weight:600;padding:2px 9px;border-radius:99px}
.ds-pill.red{background:#fdecea;color:var(--err)}
.ds-pill.amber{background:#fdf1d6;color:#8a5a00}
.ds-pill.grey{background:#ece7e0;color:var(--muted)}
.ds-sub{margin:2px 0 0;color:var(--muted)}
.ds-desc{margin:6px 0 0;color:#4b413c}
.ds-prices{display:flex;flex-wrap:wrap;gap:6px 14px;margin-top:10px;font-size:13px;color:var(--muted)}
.ds-prices b{color:var(--ink)}

.ds-cap-top{font-size:13px;color:var(--muted)}
.ds-cap-top b{font-size:22px;color:var(--ink)}
.ds-bar{height:8px;border-radius:99px;background:#eee6db;margin:6px 0 4px;overflow:hidden}
.ds-bar i{display:block;height:100%;background:var(--ok);border-radius:99px}
.ds-bar i.full{background:var(--err)}
.ds-cap small{color:var(--muted)}

.ds-side{display:flex;flex-direction:column;gap:10px}
.ds-actions{display:flex;gap:8px;margin-top:4px}
.ds-actions .ds-btn{flex:1;padding:8px 10px}

.ds-switch{display:inline-flex;align-items:center;gap:8px;cursor:pointer}
.ds-switch input{position:absolute;opacity:0;pointer-events:none}
.ds-switch .track{width:34px;height:20px;border-radius:99px;background:#cfc6bb;position:relative;transition:background .15s}
.ds-switch .track::after{content:"";position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#fff;transition:transform .15s}
.ds-switch input:checked + .track{background:var(--ok)}
.ds-switch input:checked + .track::after{transform:translateX(14px)}
.ds-switch input:focus-visible + .track{outline:2px solid var(--maroon);outline-offset:2px}
.ds-switch.disabled{opacity:.55;cursor:wait}
.ds-switch .txt{font-size:13px}

.ds-empty{text-align:center;padding:48px 20px;background:var(--paper);border:1px dashed #d5c9bb;border-radius:12px}
.ds-empty h3{margin:0 0 6px;font-size:18px}
.ds-empty p{margin:0 auto 16px;max-width:440px;color:var(--muted)}

.ds-overlay{position:fixed;inset:0;background:rgba(36,28,26,.5);display:flex;align-items:center;justify-content:center;padding:16px;z-index:1000}
.ds-modal{background:var(--bg);width:100%;max-width:700px;max-height:92vh;border-radius:14px;display:flex;flex-direction:column;overflow:hidden}
.ds-modal-head,.ds-modal-foot{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px 18px;background:var(--paper)}
.ds-modal-head{border-bottom:1px solid var(--line)}
.ds-modal-head h3{margin:0;font-size:18px}
.ds-modal-foot{border-top:1px solid var(--line);justify-content:flex-end}
.ds-x{border:0;background:none;font-size:26px;line-height:1;cursor:pointer;color:var(--muted)}
.ds-modal-body{padding:16px 18px;overflow:auto;display:flex;flex-direction:column;gap:16px}
.ds-modal-body fieldset{border:1px solid var(--line);background:var(--paper);border-radius:10px;padding:14px;margin:0;display:flex;flex-direction:column;gap:12px;min-width:0}
.ds-modal-body legend{padding:0 6px;font-weight:700}
.ds-note{color:var(--muted);font-size:12px}

.ds-grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.ds-grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.ds-field{display:flex;flex-direction:column;gap:5px;min-width:0}
.ds-field label{font-weight:600;font-size:13px}
.ds-field label i{color:var(--err);font-style:normal}
.ds-field small{color:var(--muted);font-size:12px}
.ds-field em{color:var(--err);font-style:normal;font-size:12.5px}
.ds-field.has-err .ds-input{border-color:var(--err)}

.ds-checks{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.ds-checks label{display:flex;gap:10px;align-items:flex-start;border:1px solid var(--line);border-radius:8px;padding:10px;cursor:pointer;background:#fff}
.ds-checks label span{display:flex;flex-direction:column}
.ds-checks small{color:var(--muted);font-size:12px}
.ds-checks input{margin-top:3px;accent-color:var(--maroon)}

.ds-dialog{background:#fff;border-radius:12px;padding:20px;max-width:430px;width:100%}
.ds-dialog h3{margin:0 0 8px}
.ds-dialog p{margin:0 0 16px;color:var(--muted)}
.ds-dialog-actions{display:flex;justify-content:flex-end;gap:8px}

.ds-toast{position:fixed;bottom:22px;left:50%;transform:translateX(-50%);padding:10px 16px;border-radius:8px;color:#fff;background:var(--ok);z-index:1100;box-shadow:0 6px 20px rgba(0,0,0,.2)}
.ds-toast.err{background:var(--err)}

@media (max-width:980px){
  .ds-row{grid-template-columns:110px 1fr}
  .ds-cap,.ds-side{grid-column:2}
  .ds-side{flex-direction:row;flex-wrap:wrap;align-items:center}
  .ds-actions{margin-left:auto}
}
@media (max-width:820px){
  .ds-stats{grid-template-columns:repeat(2,1fr)}
  .ds-grid4{grid-template-columns:repeat(2,1fr)}
}
@media (max-width:560px){
  .ds-row{grid-template-columns:1fr}
  .ds-cap,.ds-side{grid-column:1}
  .ds-time{border-right:0;border-bottom:2px solid var(--marigold);padding:0 0 8px}
  .ds-grid2,.ds-checks{grid-template-columns:1fr}
  .ds-filters .ds-input,.ds-seg{width:100%}
  .ds-seg button{flex:1}
}
`;