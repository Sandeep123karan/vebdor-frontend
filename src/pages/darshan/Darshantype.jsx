import { useCallback, useEffect, useMemo, useState } from "react";

/* =========================================================
   CONFIG
   - Backend base URL yahan change karo (ya env se lo)
========================================================= */
const API_BASE = "https://bmtvendorfinal.onrender.com";
const TYPES_URL = `${API_BASE}/api/vendor/darshan-types`;

// Darshan (temple) list kis endpoint se aati hai, uska pata nahi tha,
// isliye ye sab try honge. Jo sahi ho use sabse upar rakh do.
const DARSHAN_LIST_URLS = [
  `${API_BASE}/api/vendor/darshans/my-darshans`,
  `${API_BASE}/api/vendor/darshans/my`,
  `${API_BASE}/api/vendor/darshans`,
];

const TYPE_OPTIONS = [
  { value: "general", label: "General" },
  { value: "vip", label: "VIP" },
  { value: "special", label: "Special" },
  { value: "sheeghra", label: "Sheeghra (Fast track)" },
  { value: "aarti", label: "Aarti" },
  { value: "paid", label: "Paid" },
  { value: "free", label: "Free" },
  { value: "other", label: "Other" },
];

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const EMPTY_FORM = {
  darshanId: "",
  name: "",
  type: "general",
  shortDescription: "",
  description: "",
  dailyCapacity: "",
  perSlotCapacity: "",
  maxPersonsPerBooking: "10",
  adultPrice: "",
  childPrice: "",
  seniorCitizenPrice: "",
  currency: "INR",
  minimumAge: "",
  advanceBookingDays: "30",
  bookingAllowed: true,
  status: "draft",
  isPublished: false,
  isActive: true,
};

/* =========================================================
   API HELPERS
========================================================= */
async function api(url, { method = "GET", body } = {}) {
  const token = localStorage.getItem("vendorToken");
  const headers = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { method, headers, body });
  let json = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }
  if (!res.ok || json?.success === false) {
    const err = new Error(json?.message || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return json;
}

const toList = (json) => {
  if (Array.isArray(json)) return json;
  const d = json?.data ?? json?.darshans ?? json?.items;
  return Array.isArray(d) ? d : [];
};

const darshanLabel = (d) =>
  d?.name || d?.templeName || d?.title || (d?._id ? `Darshan ${String(d._id).slice(-5)}` : "Temple");

const money = (value, currency) =>
  `${currency === "INR" || !currency ? "₹" : currency + " "}${Number(value || 0).toLocaleString("en-IN")}`;

const typeLabel = (v) => TYPE_OPTIONS.find((t) => t.value === v)?.label || v;

const buildFormData = (form, imageFile, { isEdit }) => {
  const fd = new FormData();
  Object.entries(form).forEach(([key, value]) => {
    if (isEdit && key === "darshanId") return; // update me darshanId change nahi hota
    fd.append(key, typeof value === "boolean" ? String(value) : value ?? "");
  });
  if (imageFile) fd.append("image", imageFile);
  return fd;
};

/* =========================================================
   MAIN PAGE
========================================================= */
export default function Darshantype() {
  const [darshans, setDarshans] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [toast, setToast] = useState(null);

  const [filterDarshan, setFilterDarshan] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");

  const [modal, setModal] = useState({ open: false, editing: null });
  const [deleting, setDeleting] = useState(null);
  const [busyId, setBusyId] = useState("");

  const notify = (message, kind = "ok") => {
    setToast({ message, kind });
    setTimeout(() => setToast(null), 3200);
  };

  /* ---------- load temples ---------- */
  const loadDarshans = useCallback(async () => {
    for (const url of DARSHAN_LIST_URLS) {
      try {
        const json = await api(url);
        const list = toList(json);
        setDarshans(list);
        return;
      } catch (e) {
        if (e.status === 401) {
          setPageError("Session expired. Please login again.");
          return;
        }
      }
    }
    setDarshans([]);
  }, []);

  /* ---------- load types ---------- */
  const loadTypes = useCallback(async () => {
    setLoading(true);
    setPageError("");
    try {
      const qs = filterDarshan ? `?darshanId=${filterDarshan}` : "";
      const json = await api(`${TYPES_URL}/my-types${qs}`);
      setTypes(toList(json));
    } catch (e) {
      setPageError(e.message);
    } finally {
      setLoading(false);
    }
  }, [filterDarshan]);

  useEffect(() => {
    loadDarshans();
  }, [loadDarshans]);

  useEffect(() => {
    loadTypes();
  }, [loadTypes]);

  /* ---------- derived ---------- */
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return types.filter((t) => {
      if (filterStatus !== "all" && t.status !== filterStatus) return false;
      if (!q) return true;
      return (
        t.name?.toLowerCase().includes(q) ||
        t.type?.toLowerCase().includes(q) ||
        darshanLabel(t.darshanId).toLowerCase().includes(q)
      );
    });
  }, [types, search, filterStatus]);

  const stats = useMemo(
    () => ({
      total: types.length,
      live: types.filter((t) => t.isPublished && t.isActive).length,
      draft: types.filter((t) => t.status === "draft").length,
      closed: types.filter((t) => !t.bookingAllowed).length,
    }),
    [types]
  );

  /* ---------- quick toggles ---------- */
  const quickUpdate = async (item, patch, okMsg) => {
    setBusyId(item._id);
    try {
      const fd = new FormData();
      Object.entries(patch).forEach(([k, v]) => fd.append(k, String(v)));
      const json = await api(`${TYPES_URL}/${item._id}`, { method: "PUT", body: fd });
      setTypes((prev) => prev.map((t) => (t._id === item._id ? { ...t, ...json.data, darshanId: t.darshanId } : t)));
      notify(okMsg);
    } catch (e) {
      notify(e.message, "err");
    } finally {
      setBusyId("");
    }
  };

  /* ---------- delete ---------- */
  const confirmDelete = async () => {
    if (!deleting) return;
    setBusyId(deleting._id);
    try {
      await api(`${TYPES_URL}/${deleting._id}`, { method: "DELETE" });
      setTypes((prev) => prev.filter((t) => t._id !== deleting._id));
      notify("Darshan type deleted");
      setDeleting(null);
    } catch (e) {
      notify(e.message, "err");
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="dt-page">
      <style>{CSS}</style>

      {/* Header */}
      <header className="dt-head">
        <div>
          <h2>Darshan types</h2>
          <p>Create the ticket categories pilgrims can book for each temple, with their own price, capacity and rules.</p>
        </div>
        <button className="dt-btn dt-btn-primary" onClick={() => setModal({ open: true, editing: null })}>
          + Add darshan type
        </button>
      </header>

      {/* Stats */}
      <div className="dt-stats">
        <Stat label="Total types" value={stats.total} />
        <Stat label="Live for booking" value={stats.live} />
        <Stat label="Drafts" value={stats.draft} />
        <Stat label="Booking paused" value={stats.closed} />
      </div>

      {/* Filters */}
      <div className="dt-filters">
        <input
          className="dt-input dt-search"
          placeholder="Search by name, type or temple"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="dt-input" value={filterDarshan} onChange={(e) => setFilterDarshan(e.target.value)}>
          <option value="">All temples</option>
          {darshans.map((d) => (
            <option key={d._id} value={d._id}>
              {darshanLabel(d)}
            </option>
          ))}
        </select>
        <div className="dt-seg" role="tablist" aria-label="Status filter">
          {["all", "active", "draft", "inactive"].map((s) => (
            <button
              key={s}
              role="tab"
              aria-selected={filterStatus === s}
              className={filterStatus === s ? "on" : ""}
              onClick={() => setFilterStatus(s)}
            >
              {s === "all" ? "All" : s[0].toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {pageError && (
        <div className="dt-alert">
          {pageError} <button onClick={loadTypes}>Try again</button>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="dt-grid">
          {[1, 2, 3].map((n) => (
            <div key={n} className="dt-card dt-skel" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="dt-empty">
          <h3>{types.length === 0 ? "No darshan types yet" : "Nothing matches these filters"}</h3>
          <p>
            {types.length === 0
              ? "Add your first type, for example General, VIP or Aarti, and set its price and daily capacity."
              : "Clear the search or switch the status filter to see more."}
          </p>
          {types.length === 0 && (
            <button className="dt-btn dt-btn-primary" onClick={() => setModal({ open: true, editing: null })}>
              Add darshan type
            </button>
          )}
        </div>
      ) : (
        <div className="dt-grid">
          {visible.map((t) => (
            <article className="dt-card" key={t._id}>
              <div className="dt-media">
                {t.image ? <img src={t.image} alt={t.name} /> : <div className="dt-noimg">No image</div>}
                <span className={`dt-status s-${t.status}`}>{t.status}</span>
              </div>

              <div className="dt-body">
                <div className="dt-row-top">
                  <span className="dt-type">{typeLabel(t.type)}</span>
                  <span className="dt-temple">{darshanLabel(t.darshanId)}</span>
                </div>
                <h3>{t.name}</h3>
                {t.shortDescription && <p className="dt-short">{t.shortDescription}</p>}

                <dl className="dt-prices">
                  <div>
                    <dt>Adult</dt>
                    <dd>{money(t.adultPrice, t.currency)}</dd>
                  </div>
                  <div>
                    <dt>Child</dt>
                    <dd>{money(t.childPrice, t.currency)}</dd>
                  </div>
                  <div>
                    <dt>Senior</dt>
                    <dd>{money(t.seniorCitizenPrice, t.currency)}</dd>
                  </div>
                </dl>

                <ul className="dt-meta">
                  <li>{t.dailyCapacity || 0} per day</li>
                  <li>{t.perSlotCapacity || 0} per slot</li>
                  <li>Max {t.maxPersonsPerBooking} per booking</li>
                  <li>Book up to {t.advanceBookingDays} days ahead</li>
                  {t.minimumAge > 0 && <li>Age {t.minimumAge}+</li>}
                </ul>

                <div className="dt-toggles">
                  <Switch
                    label="Published"
                    checked={!!t.isPublished}
                    disabled={busyId === t._id}
                    onChange={(v) => quickUpdate(t, { isPublished: v }, v ? "Published" : "Unpublished")}
                  />
                  <Switch
                    label="Booking open"
                    checked={!!t.bookingAllowed}
                    disabled={busyId === t._id}
                    onChange={(v) => quickUpdate(t, { bookingAllowed: v }, v ? "Booking opened" : "Booking paused")}
                  />
                </div>

                {t.status === "inactive" && t.rejectionReason && (
                  <p className="dt-reason">Reason: {t.rejectionReason}</p>
                )}

                <div className="dt-actions">
                  <button className="dt-btn" onClick={() => setModal({ open: true, editing: t })}>
                    Edit
                  </button>
                  <button className="dt-btn dt-btn-danger" onClick={() => setDeleting(t)}>
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Form modal */}
      {modal.open && (
        <TypeForm
          editing={modal.editing}
          darshans={darshans}
          defaultDarshan={filterDarshan}
          onClose={() => setModal({ open: false, editing: null })}
          onSaved={(msg) => {
            setModal({ open: false, editing: null });
            notify(msg);
            loadTypes();
          }}
        />
      )}

      {/* Delete confirm */}
      {deleting && (
        <div className="dt-overlay" onClick={() => setDeleting(null)}>
          <div className="dt-dialog" onClick={(e) => e.stopPropagation()} role="alertdialog" aria-modal="true">
            <h3>Delete “{deleting.name}”?</h3>
            <p>This removes the darshan type permanently. Existing bookings are not changed, but no new bookings can use it.</p>
            <div className="dt-dialog-actions">
              <button className="dt-btn" onClick={() => setDeleting(null)}>
                Keep it
              </button>
              <button className="dt-btn dt-btn-danger-solid" disabled={busyId === deleting._id} onClick={confirmDelete}>
                {busyId === deleting._id ? "Deleting…" : "Delete darshan type"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`dt-toast ${toast.kind}`}>{toast.message}</div>}
    </div>
  );
}

/* =========================================================
   FORM (create + edit)
========================================================= */
function TypeForm({ editing, darshans, defaultDarshan, onClose, onSaved }) {
  const isEdit = !!editing;

  const [form, setForm] = useState(() => {
    if (!editing) return { ...EMPTY_FORM, darshanId: defaultDarshan || "" };
    const pick = (k, fallback = "") => (editing[k] === undefined || editing[k] === null ? fallback : editing[k]);
    return {
      darshanId: editing.darshanId?._id || editing.darshanId || "",
      name: pick("name"),
      type: pick("type", "general"),
      shortDescription: pick("shortDescription"),
      description: pick("description"),
      dailyCapacity: String(pick("dailyCapacity", "")),
      perSlotCapacity: String(pick("perSlotCapacity", "")),
      maxPersonsPerBooking: String(pick("maxPersonsPerBooking", 10)),
      adultPrice: String(pick("adultPrice", "")),
      childPrice: String(pick("childPrice", "")),
      seniorCitizenPrice: String(pick("seniorCitizenPrice", "")),
      currency: pick("currency", "INR"),
      minimumAge: String(pick("minimumAge", "")),
      advanceBookingDays: String(pick("advanceBookingDays", 30)),
      bookingAllowed: pick("bookingAllowed", true),
      status: pick("status", "draft"),
      isPublished: pick("isPublished", false),
      isActive: pick("isActive", true),
    };
  });

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(editing?.image || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});

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

  const pickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Only image files are allowed.");
    if (file.size > 10 * 1024 * 1024) return setError("Image must be 10 MB or smaller.");
    setError("");
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const validate = () => {
    const e = {};
    if (!form.darshanId) e.darshanId = "Choose the temple this type belongs to.";
    if (!form.name.trim()) e.name = "Enter a name for this darshan type.";
    if (!form.type) e.type = "Choose a type.";
    if (Number(form.maxPersonsPerBooking) < 1) e.maxPersonsPerBooking = "Must be at least 1.";
    ["dailyCapacity", "perSlotCapacity", "adultPrice", "childPrice", "seniorCitizenPrice", "minimumAge", "advanceBookingDays"].forEach(
      (k) => {
        if (form[k] !== "" && Number(form[k]) < 0) e[k] = "Cannot be negative.";
      }
    );
    if (form.perSlotCapacity !== "" && form.dailyCapacity !== "" && Number(form.perSlotCapacity) > Number(form.dailyCapacity)) {
      e.perSlotCapacity = "Per-slot capacity cannot exceed daily capacity.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setError("");
    if (!validate()) return;
    setSaving(true);
    try {
      const fd = buildFormData({ ...form, name: form.name.trim() }, imageFile, { isEdit });
      await api(isEdit ? `${TYPES_URL}/${editing._id}` : TYPES_URL, {
        method: isEdit ? "PUT" : "POST",
        body: fd,
      });
      onSaved(isEdit ? "Darshan type updated" : "Darshan type created");
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dt-overlay" onClick={() => !saving && onClose()}>
      <form className="dt-modal" onClick={(e) => e.stopPropagation()} onSubmit={submit} noValidate>
        <div className="dt-modal-head">
          <h3>{isEdit ? "Edit darshan type" : "Add darshan type"}</h3>
          <button type="button" className="dt-x" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="dt-modal-body">
          {error && <div className="dt-alert">{error}</div>}

          <fieldset>
            <legend>Basics</legend>
            <div className="dt-grid2">
              <Field label="Temple" error={errors.darshanId} required>
                <select className="dt-input" value={form.darshanId} onChange={set("darshanId")} disabled={isEdit}>
                  <option value="">Select a temple</option>
                  {darshans.map((d) => (
                    <option key={d._id} value={d._id}>
                      {darshanLabel(d)}
                    </option>
                  ))}
                </select>
                {isEdit && <small>The temple can’t be changed after creation.</small>}
                {!isEdit && darshans.length === 0 && <small>No temples found. Add a darshan first, then come back.</small>}
              </Field>

              <Field label="Type" error={errors.type} required>
                <select className="dt-input" value={form.type} onChange={set("type")}>
                  {TYPE_OPTIONS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                {!isEdit && <small>Each temple can have only one darshan type of each kind.</small>}
              </Field>
            </div>

            <Field label="Name" error={errors.name} required>
              <input className="dt-input" value={form.name} onChange={set("name")} placeholder="e.g. VIP Morning Darshan" />
            </Field>
            <Field label="Short description">
              <input
                className="dt-input"
                value={form.shortDescription}
                onChange={set("shortDescription")}
                placeholder="One line shown on the listing card"
              />
            </Field>
            <Field label="Full description">
              <textarea
                className="dt-input"
                rows={4}
                value={form.description}
                onChange={set("description")}
                placeholder="What the pilgrim gets, entry route, timings, dress code…"
              />
            </Field>

            <Field label="Cover image">
              <div className="dt-upload">
                {preview ? <img src={preview} alt="Preview" /> : <div className="dt-noimg">No image</div>}
                <label className="dt-btn">
                  {preview ? "Change image" : "Upload image"}
                  <input type="file" accept="image/*" hidden onChange={pickImage} />
                </label>
              </div>
            </Field>
          </fieldset>

          <fieldset>
            <legend>Pricing</legend>
            <div className="dt-grid4">
              <Field label="Adult" error={errors.adultPrice}>
                <input className="dt-input" type="number" min="0" value={form.adultPrice} onChange={set("adultPrice")} placeholder="0" />
              </Field>
              <Field label="Child" error={errors.childPrice}>
                <input className="dt-input" type="number" min="0" value={form.childPrice} onChange={set("childPrice")} placeholder="0" />
              </Field>
              <Field label="Senior citizen" error={errors.seniorCitizenPrice}>
                <input
                  className="dt-input"
                  type="number"
                  min="0"
                  value={form.seniorCitizenPrice}
                  onChange={set("seniorCitizenPrice")}
                  placeholder="0"
                />
              </Field>
              <Field label="Currency">
                <select className="dt-input" value={form.currency} onChange={set("currency")}>
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </Field>
            </div>
          </fieldset>

          <fieldset>
            <legend>Capacity and booking rules</legend>
            <div className="dt-grid4">
              <Field label="Daily capacity" error={errors.dailyCapacity}>
                <input className="dt-input" type="number" min="0" value={form.dailyCapacity} onChange={set("dailyCapacity")} placeholder="0" />
              </Field>
              <Field label="Per-slot capacity" error={errors.perSlotCapacity}>
                <input
                  className="dt-input"
                  type="number"
                  min="0"
                  value={form.perSlotCapacity}
                  onChange={set("perSlotCapacity")}
                  placeholder="0"
                />
              </Field>
              <Field label="Max people per booking" error={errors.maxPersonsPerBooking}>
                <input
                  className="dt-input"
                  type="number"
                  min="1"
                  value={form.maxPersonsPerBooking}
                  onChange={set("maxPersonsPerBooking")}
                />
              </Field>
              <Field label="Minimum age" error={errors.minimumAge}>
                <input className="dt-input" type="number" min="0" value={form.minimumAge} onChange={set("minimumAge")} placeholder="0" />
              </Field>
            </div>
            <div className="dt-grid2">
              <Field label="Advance booking (days)" error={errors.advanceBookingDays}>
                <input
                  className="dt-input"
                  type="number"
                  min="0"
                  value={form.advanceBookingDays}
                  onChange={set("advanceBookingDays")}
                />
              </Field>
              <Field label="Status">
                <select className="dt-input" value={form.status} onChange={set("status")}>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="dt-checks">
              <label>
                <input type="checkbox" checked={form.bookingAllowed} onChange={set("bookingAllowed")} />
                <span>
                  <b>Booking allowed</b>
                  <small>Pilgrims can book this type</small>
                </span>
              </label>
              <label>
                <input type="checkbox" checked={form.isPublished} onChange={set("isPublished")} />
                <span>
                  <b>Published</b>
                  <small>Visible to customers</small>
                </span>
              </label>
              <label>
                <input type="checkbox" checked={form.isActive} onChange={set("isActive")} />
                <span>
                  <b>Active</b>
                  <small>Turn off to hide without deleting</small>
                </span>
              </label>
            </div>
          </fieldset>
        </div>

        <div className="dt-modal-foot">
          <button type="button" className="dt-btn" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="dt-btn dt-btn-primary" disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create darshan type"}
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
    <div className="dt-stat">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function Field({ label, error, required, children }) {
  return (
    <div className={`dt-field ${error ? "has-err" : ""}`}>
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
    <label className={`dt-switch ${disabled ? "disabled" : ""}`}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span className="track" />
      <span className="txt">{label}</span>
    </label>
  );
}

/* =========================================================
   STYLES (self-contained, prefix dt-)
========================================================= */
const CSS = `
.dt-page{
  --ink:#241c1a; --muted:#6f6560; --line:#e7dfd6; --paper:#fffdf9; --bg:#faf6f0;
  --maroon:#7a1f2b; --maroon-d:#5d1620; --marigold:#e9a21b; --ok:#2f7d4f; --err:#b3261e;
  color:var(--ink); font-family:"Segoe UI",system-ui,-apple-system,sans-serif; font-size:14px; line-height:1.5;
}
.dt-page *{box-sizing:border-box}
.dt-head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:18px;flex-wrap:wrap}
.dt-head h2{margin:0 0 4px;font-size:22px;font-weight:700;letter-spacing:-.01em}
.dt-head p{margin:0;color:var(--muted);max-width:560px}

.dt-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px}
.dt-stat{background:var(--paper);border:1px solid var(--line);border-radius:10px;padding:12px 14px;display:flex;flex-direction:column}
.dt-stat strong{font-size:24px;line-height:1.1}
.dt-stat span{color:var(--muted);font-size:12.5px}

.dt-filters{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:16px}
.dt-search{flex:1;min-width:220px}
.dt-input{width:100%;padding:9px 11px;border:1px solid var(--line);border-radius:8px;background:#fff;font:inherit;color:var(--ink)}
.dt-filters .dt-input{width:auto}
.dt-search.dt-input{width:auto}
.dt-input:focus,.dt-btn:focus-visible,.dt-seg button:focus-visible,.dt-x:focus-visible{outline:2px solid var(--maroon);outline-offset:1px}
.dt-input:disabled{background:#f3eee7;color:var(--muted)}
textarea.dt-input{resize:vertical}

.dt-seg{display:inline-flex;border:1px solid var(--line);border-radius:8px;overflow:hidden;background:#fff}
.dt-seg button{border:0;background:transparent;padding:8px 13px;font:inherit;cursor:pointer;color:var(--muted)}
.dt-seg button.on{background:var(--maroon);color:#fff}

.dt-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:9px 15px;border:1px solid var(--line);background:#fff;color:var(--ink);border-radius:8px;font:inherit;font-weight:600;cursor:pointer}
.dt-btn:hover{border-color:#cfc3b6}
.dt-btn:disabled{opacity:.6;cursor:not-allowed}
.dt-btn-primary{background:var(--maroon);border-color:var(--maroon);color:#fff}
.dt-btn-primary:hover{background:var(--maroon-d);border-color:var(--maroon-d)}
.dt-btn-danger{color:var(--err)}
.dt-btn-danger-solid{background:var(--err);border-color:var(--err);color:#fff}

.dt-alert{background:#fdecea;border:1px solid #f3c1bc;color:#7d1a14;padding:10px 12px;border-radius:8px;margin-bottom:14px}
.dt-alert button{margin-left:8px;border:0;background:none;color:inherit;text-decoration:underline;cursor:pointer;font:inherit}

.dt-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(310px,1fr));gap:16px}
.dt-card{background:var(--paper);border:1px solid var(--line);border-radius:12px;overflow:hidden;display:flex;flex-direction:column}
.dt-skel{min-height:300px;background:linear-gradient(90deg,#f3ede4 25%,#faf6f0 50%,#f3ede4 75%);background-size:200% 100%;animation:dtsh 1.4s infinite}
@keyframes dtsh{to{background-position:-200% 0}}
@media (prefers-reduced-motion:reduce){.dt-skel{animation:none}}

.dt-media{position:relative;height:150px;background:#efe7db}
.dt-media img{width:100%;height:100%;object-fit:cover;display:block}
.dt-noimg{width:100%;height:100%;display:grid;place-items:center;color:var(--muted);font-size:12.5px;background:#efe7db}
.dt-status{position:absolute;top:10px;right:10px;padding:3px 9px;border-radius:99px;font-size:12px;font-weight:600;text-transform:capitalize;background:#fff}
.dt-status.s-active{color:var(--ok)} .dt-status.s-draft{color:#946200} .dt-status.s-inactive{color:var(--err)}

.dt-body{padding:14px;display:flex;flex-direction:column;gap:10px;flex:1}
.dt-row-top{display:flex;justify-content:space-between;gap:8px;align-items:center}
.dt-type{background:var(--marigold);color:#2b1d00;font-weight:700;font-size:12px;padding:2px 9px;border-radius:99px}
.dt-temple{color:var(--muted);font-size:12.5px;text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dt-body h3{margin:0;font-size:17px;line-height:1.3}
.dt-short{margin:0;color:var(--muted);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}

.dt-prices{display:grid;grid-template-columns:repeat(3,1fr);margin:0;border:1px solid var(--line);border-radius:8px}
.dt-prices div{padding:8px 10px;border-right:1px solid var(--line)}
.dt-prices div:last-child{border-right:0}
.dt-prices dt{font-size:12px;color:var(--muted)}
.dt-prices dd{margin:0;font-weight:700}

.dt-meta{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:6px}
.dt-meta li{background:#f3eee7;border-radius:6px;padding:3px 8px;font-size:12.5px;color:#4b413c}
.dt-reason{margin:0;color:var(--err);font-size:12.5px}

.dt-toggles{display:flex;gap:18px;flex-wrap:wrap;padding-top:2px}
.dt-switch{display:inline-flex;align-items:center;gap:8px;cursor:pointer}
.dt-switch input{position:absolute;opacity:0;pointer-events:none}
.dt-switch .track{width:34px;height:20px;border-radius:99px;background:#cfc6bb;position:relative;transition:background .15s}
.dt-switch .track::after{content:"";position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#fff;transition:transform .15s}
.dt-switch input:checked + .track{background:var(--ok)}
.dt-switch input:checked + .track::after{transform:translateX(14px)}
.dt-switch input:focus-visible + .track{outline:2px solid var(--maroon);outline-offset:2px}
.dt-switch.disabled{opacity:.55;cursor:wait}
.dt-switch .txt{font-size:13px}

.dt-actions{display:flex;gap:8px;margin-top:auto;padding-top:6px}
.dt-actions .dt-btn{flex:1}

.dt-empty{text-align:center;padding:48px 20px;background:var(--paper);border:1px dashed #d5c9bb;border-radius:12px}
.dt-empty h3{margin:0 0 6px;font-size:18px}
.dt-empty p{margin:0 auto 16px;max-width:420px;color:var(--muted)}

.dt-overlay{position:fixed;inset:0;background:rgba(36,28,26,.5);display:flex;align-items:center;justify-content:center;padding:16px;z-index:1000}
.dt-modal{background:var(--bg);width:100%;max-width:760px;max-height:92vh;border-radius:14px;display:flex;flex-direction:column;overflow:hidden}
.dt-modal-head,.dt-modal-foot{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px 18px;background:var(--paper)}
.dt-modal-head{border-bottom:1px solid var(--line)}
.dt-modal-head h3{margin:0;font-size:18px}
.dt-modal-foot{border-top:1px solid var(--line);justify-content:flex-end}
.dt-x{border:0;background:none;font-size:26px;line-height:1;cursor:pointer;color:var(--muted)}
.dt-modal-body{padding:16px 18px;overflow:auto;display:flex;flex-direction:column;gap:16px}
.dt-modal-body fieldset{border:1px solid var(--line);background:var(--paper);border-radius:10px;padding:14px;margin:0;display:flex;flex-direction:column;gap:12px;min-width:0}
.dt-modal-body legend{padding:0 6px;font-weight:700}

.dt-grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.dt-grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.dt-field{display:flex;flex-direction:column;gap:5px;min-width:0}
.dt-field label{font-weight:600;font-size:13px}
.dt-field label i{color:var(--err);font-style:normal}
.dt-field small{color:var(--muted);font-size:12px}
.dt-field em{color:var(--err);font-style:normal;font-size:12.5px}
.dt-field.has-err .dt-input{border-color:var(--err)}

.dt-upload{display:flex;align-items:center;gap:14px}
.dt-upload img,.dt-upload .dt-noimg{width:120px;height:80px;border-radius:8px;object-fit:cover;border:1px solid var(--line)}

.dt-checks{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.dt-checks label{display:flex;gap:10px;align-items:flex-start;border:1px solid var(--line);border-radius:8px;padding:10px;cursor:pointer;background:#fff}
.dt-checks label span{display:flex;flex-direction:column}
.dt-checks small{color:var(--muted);font-size:12px}
.dt-checks input{margin-top:3px;accent-color:var(--maroon)}

.dt-dialog{background:#fff;border-radius:12px;padding:20px;max-width:430px;width:100%}
.dt-dialog h3{margin:0 0 8px}
.dt-dialog p{margin:0 0 16px;color:var(--muted)}
.dt-dialog-actions{display:flex;justify-content:flex-end;gap:8px}

.dt-toast{position:fixed;bottom:22px;left:50%;transform:translateX(-50%);padding:10px 16px;border-radius:8px;color:#fff;background:var(--ok);z-index:1100;box-shadow:0 6px 20px rgba(0,0,0,.2)}
.dt-toast.err{background:var(--err)}

@media (max-width:820px){
  .dt-stats{grid-template-columns:repeat(2,1fr)}
  .dt-grid4{grid-template-columns:repeat(2,1fr)}
  .dt-checks{grid-template-columns:1fr}
}
@media (max-width:560px){
  .dt-grid2{grid-template-columns:1fr}
  .dt-filters .dt-input,.dt-seg{width:100%}
  .dt-seg button{flex:1}
}
`;