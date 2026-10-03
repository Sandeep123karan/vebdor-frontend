import { useCallback, useEffect, useMemo, useState } from "react";
import "./AddActivities.css";

/* ==================== CONFIG ==================== */

const API = "https://bmtvendorfinal.onrender.com/api/vendor/activities";

const ACTIVITY_TYPES = [
  "SIGHTSEEING", "ADVENTURE", "WATER_ACTIVITY", "CULTURAL", "ENTERTAINMENT",
  "FOOD", "WILDLIFE", "SPORTS", "WELLNESS", "OTHER",
];

const CATEGORY_SUGGESTIONS = [
  "Adventure", "Sightseeing", "Water Sports", "Cultural", "Food & Drink",
  "Wildlife", "Wellness & Spa", "Trekking", "Entertainment",
];

const EMPTY_FORM = {
  title: "", slug: "", category: "", activityType: "OTHER",
  shortDescription: "", description: "",
  city: "", state: "", country: "India", address: "", latitude: "", longitude: "",
  durationValue: "", durationUnit: "hours",
  adult: "", child: "", infant: "",
  maxGuests: "1", meetingPoint: "",
  pickupAvailable: false, pickupDetails: "",
  highlights: [], inclusions: [], exclusions: [], requirements: [], languages: [],
  cancellationPolicy: "", termsAndConditions: "",
  instantConfirmation: true, bookingCutoffHours: "2",
  minAge: "0", maxAge: "", isActive: true,
};

const STATUS_CLASS = { DRAFT: "draft", PENDING: "pending", APPROVED: "approved", REJECTED: "rejected" };
const pretty = (s) => String(s || "").replace(/_/g, " ").toLowerCase().replace(/^\w|\s\w/g, (c) => c.toUpperCase());
const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

/* ==================== API ==================== */

async function request(url, options = {}) {
  const token = localStorage.getItem("vendorToken");
  const res = await fetch(url, {
    ...options,
    // Content-Type mat set karo FormData ke liye — browser boundary khud lagata hai
    headers: { Authorization: `Bearer ${token}`, ...(options.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data;
}

/* ==================== SMALL COMPONENTS ==================== */

function TagInput({ label, values, onChange, placeholder }) {
  const [text, setText] = useState("");

  const add = () => {
    const parts = text.split(",").map((t) => t.trim()).filter(Boolean);
    if (!parts.length) return;
    onChange([...values, ...parts.filter((p) => !values.includes(p))]);
    setText("");
  };

  return (
    <div className="act-field">
      <label>{label}</label>
      <div className="act-tag-input">
        <input
          value={text}
          placeholder={placeholder}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); }
          }}
        />
        <button type="button" onClick={add}>Add</button>
      </div>
      {values.length > 0 && (
        <div className="act-chips">
          {values.map((v, i) => (
            <span className="act-chip" key={`${v}-${i}`}>
              {v}
              <button type="button" onClick={() => onChange(values.filter((_, x) => x !== i))} aria-label={`Remove ${v}`}>×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ label, required, children, hint }) {
  return (
    <div className="act-field">
      <label>{label}{required && <i>*</i>}</label>
      {children}
      {hint && <small>{hint}</small>}
    </div>
  );
}

/* ==================== MAIN ==================== */

export default function AddActivities() {
  const [view, setView] = useState("list"); // list | form
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");

  const [filters, setFilters] = useState({ search: "", status: "", type: "", active: "" });

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]); // [{file, url}]
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState(null);

  const notify = useCallback((type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3200);
  }, []);

  /* ---------- load ---------- */

  const loadActivities = useCallback(async () => {
    setLoading(true);
    setListError("");
    try {
      const data = await request(API);
      setActivities(data.data || []);
    } catch (err) {
      setListError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadActivities(); }, [loadActivities]);

  // object URLs cleanup
  useEffect(() => () => newFiles.forEach((f) => URL.revokeObjectURL(f.url)), []); // eslint-disable-line

  /* ---------- derived ---------- */

  const stats = useMemo(() => ({
    total: activities.length,
    approved: activities.filter((a) => a.status === "APPROVED").length,
    pending: activities.filter((a) => a.status === "PENDING").length,
    rejected: activities.filter((a) => a.status === "REJECTED").length,
  }), [activities]);

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return activities.filter((a) => {
      if (filters.status && a.status !== filters.status) return false;
      if (filters.type && a.activityType !== filters.type) return false;
      if (filters.active && String(!!a.isActive) !== filters.active) return false;
      if (q) {
        const hay = `${a.title} ${a.category} ${a.location?.city || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [activities, filters]);

  /* ---------- form helpers ---------- */

  const setField = (key, value) => setForm((p) => ({ ...p, [key]: value }));
  const onInput = (e) => {
    const { name, value, type, checked } = e.target;
    setField(name, type === "checkbox" ? checked : value);
  };

  const resetFormState = () => {
    newFiles.forEach((f) => URL.revokeObjectURL(f.url));
    setNewFiles([]);
    setExistingImages([]);
    setForm(EMPTY_FORM);
    setEditingId(null);
    setFormError("");
  };

  const openCreate = () => {
    resetFormState();
    setView("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openEdit = async (id) => {
    setBusyId(id);
    try {
      const { data: a } = await request(`${API}/${id}`);
      resetFormState();
      setEditingId(a._id);
      setExistingImages(a.images || []);
      setForm({
        title: a.title || "", slug: a.slug || "", category: a.category || "",
        activityType: a.activityType || "OTHER",
        shortDescription: a.shortDescription || "", description: a.description || "",
        city: a.location?.city || "", state: a.location?.state || "",
        country: a.location?.country || "India", address: a.location?.address || "",
        latitude: a.location?.latitude ?? "", longitude: a.location?.longitude ?? "",
        durationValue: a.duration?.value ?? "", durationUnit: a.duration?.unit || "hours",
        adult: a.pricing?.adult ?? "", child: a.pricing?.child ?? "", infant: a.pricing?.infant ?? "",
        maxGuests: String(a.maxGuests ?? 1), meetingPoint: a.meetingPoint || "",
        pickupAvailable: !!a.pickupAvailable, pickupDetails: a.pickupDetails || "",
        highlights: a.highlights || [], inclusions: a.inclusions || [],
        exclusions: a.exclusions || [], requirements: a.requirements || [],
        languages: a.languages || [],
        cancellationPolicy: a.cancellationPolicy || "", termsAndConditions: a.termsAndConditions || "",
        instantConfirmation: a.instantConfirmation !== false,
        bookingCutoffHours: String(a.bookingCutoffHours ?? 2),
        minAge: String(a.minAge ?? 0), maxAge: a.maxAge ?? "",
        isActive: a.isActive !== false,
      });
      setView("form");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      notify("error", err.message);
    } finally {
      setBusyId(null);
    }
  };

  const closeForm = () => {
    resetFormState();
    setView("list");
  };

  /* ---------- images ---------- */

  const onPickImages = (e) => {
    const picked = Array.from(e.target.files || []).filter((f) => f.type.startsWith("image/"));
    e.target.value = "";
    const room = 10 - newFiles.length;
    if (picked.length > room) notify("error", "Maximum 10 new images ek baar me upload ho sakti hain");
    setNewFiles((p) => [
      ...p,
      ...picked.slice(0, Math.max(room, 0)).map((file) => ({ file, url: URL.createObjectURL(file) })),
    ]);
  };

  const removeNew = (idx) => {
    setNewFiles((p) => {
      URL.revokeObjectURL(p[idx].url);
      return p.filter((_, i) => i !== idx);
    });
  };

  /* ---------- submit ---------- */

  const validate = () => {
    if (!form.title.trim()) return "Activity title required hai";
    if (!form.category.trim()) return "Category required hai";
    if (!form.description.trim()) return "Description required hai";
    if (!form.city.trim()) return "City required hai";
    if (!(Number(form.maxGuests) >= 1)) return "Max guests kam se kam 1 hona chahiye";
    if (existingImages.length + newFiles.length === 0) return "Kam se kam ek image upload karo";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const problem = validate();
    if (problem) {
      setFormError(problem);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setFormError("");
    setSaving(true);

    const fd = new FormData();
    fd.append("title", form.title.trim());
    if (form.slug.trim()) fd.append("slug", form.slug.trim());
    fd.append("category", form.category.trim());
    fd.append("activityType", form.activityType);
    fd.append("shortDescription", form.shortDescription.trim());
    fd.append("description", form.description.trim());
    fd.append("location", JSON.stringify({
      city: form.city.trim(), state: form.state.trim(), country: form.country.trim() || "India",
      address: form.address.trim(), latitude: form.latitude, longitude: form.longitude,
    }));
    fd.append("duration", JSON.stringify({ value: Number(form.durationValue) || 0, unit: form.durationUnit }));
    fd.append("pricing", JSON.stringify({
      adult: Number(form.adult) || 0, child: Number(form.child) || 0, infant: Number(form.infant) || 0,
    }));
    fd.append("maxGuests", String(Number(form.maxGuests) || 1));
    fd.append("meetingPoint", form.meetingPoint.trim());
    fd.append("pickupAvailable", String(form.pickupAvailable));
    fd.append("pickupDetails", form.pickupDetails.trim());
    ["highlights", "inclusions", "exclusions", "requirements", "languages"].forEach((k) =>
      fd.append(k, JSON.stringify(form[k]))
    );
    fd.append("cancellationPolicy", form.cancellationPolicy.trim());
    fd.append("termsAndConditions", form.termsAndConditions.trim());
    fd.append("instantConfirmation", String(form.instantConfirmation));
    fd.append("bookingCutoffHours", String(Number(form.bookingCutoffHours) || 0));
    fd.append("minAge", String(Number(form.minAge) || 0));
    if (form.maxAge !== "" && form.maxAge !== null) fd.append("maxAge", String(Number(form.maxAge)));
    newFiles.forEach((f) => fd.append("images", f.file));

    try {
      if (editingId) {
        fd.append("existingImages", JSON.stringify(existingImages));
        fd.append("isActive", String(form.isActive));
        await request(`${API}/${editingId}`, { method: "PUT", body: fd });
        notify("success", "Activity update ho gayi (dobara approval ke liye pending)");
      } else {
        await request(API, { method: "POST", body: fd });
        notify("success", "Activity create ho gayi — admin approval pending");
      }
      closeForm();
      loadActivities();
    } catch (err) {
      setFormError(err.message);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  };

  /* ---------- toggle / delete ---------- */

  const handleToggle = async (a) => {
    setBusyId(a._id);
    try {
      const res = await request(`${API}/${a._id}/toggle`, { method: "PATCH" });
      setActivities((p) => p.map((x) => (x._id === a._id ? res.data : x)));
      notify("success", res.message);
    } catch (err) {
      notify("error", err.message);
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    const target = deleteTarget;
    setBusyId(target._id);
    try {
      await request(`${API}/${target._id}`, { method: "DELETE" });
      setActivities((p) => p.filter((x) => x._id !== target._id));
      notify("success", "Activity delete ho gayi");
      setDeleteTarget(null);
    } catch (err) {
      notify("error", err.message);
    } finally {
      setBusyId(null);
    }
  };

  /* ==================== RENDER: FORM ==================== */

  const renderForm = () => (
    <form className="act-form" onSubmit={handleSubmit} noValidate>
      <div className="act-form-head">
        <div>
          <span className="act-eyebrow">{editingId ? "EDIT ACTIVITY" : "NEW ACTIVITY"}</span>
          <h2>{editingId ? "Update activity details" : "Add a new activity"}</h2>
          <p>Create hone ke baad activity admin approval ke liye PENDING me jayegi.</p>
        </div>
        <button type="button" className="act-btn ghost" onClick={closeForm}>← Back to list</button>
      </div>

      {formError && <div className="act-alert">{formError}</div>}

      {/* BASIC */}
      <section className="act-card">
        <h3>Basic information</h3>
        <div className="act-grid">
          <Field label="Activity title" required>
            <input name="title" value={form.title} onChange={onInput} maxLength={150} placeholder="e.g. Paragliding Adventure in Manali" />
          </Field>
          <Field label="Slug" hint="Khali chhodo to title se auto ban jayega">
            <input name="slug" value={form.slug} onChange={onInput} placeholder="paragliding-adventure-manali" />
          </Field>
          <Field label="Category" required>
            <input name="category" value={form.category} onChange={onInput} list="act-categories" placeholder="Adventure" />
            <datalist id="act-categories">
              {CATEGORY_SUGGESTIONS.map((c) => <option key={c} value={c} />)}
            </datalist>
          </Field>
          <Field label="Activity type">
            <select name="activityType" value={form.activityType} onChange={onInput}>
              {ACTIVITY_TYPES.map((t) => <option key={t} value={t}>{pretty(t)}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Short description" hint={`${form.shortDescription.length}/500`}>
          <input name="shortDescription" value={form.shortDescription} onChange={onInput} maxLength={500} placeholder="One-line pitch for the listing card" />
        </Field>
        <Field label="Full description" required>
          <textarea name="description" rows={5} value={form.description} onChange={onInput} placeholder="Describe the experience in detail..." />
        </Field>
        <TagInput label="Highlights" values={form.highlights} onChange={(v) => setField("highlights", v)} placeholder="Type & press Enter (e.g. Mountain Views)" />
      </section>

      {/* IMAGES */}
      <section className="act-card">
        <h3>Images <small>Pehli image thumbnail banegi</small></h3>
        <label className="act-upload">
          <input type="file" accept="image/*" multiple onChange={onPickImages} />
          <span className="act-upload-icon">＋</span>
          <strong>Click to upload images</strong>
          <small>JPG, PNG, WEBP • max 10 files per upload</small>
        </label>

        {(existingImages.length > 0 || newFiles.length > 0) && (
          <div className="act-img-grid">
            {existingImages.map((url, i) => (
              <div className="act-img" key={url}>
                <img src={url} alt={`Activity ${i + 1}`} />
                {i === 0 && newFiles.length >= 0 && <em>Cover</em>}
                <button type="button" onClick={() => setExistingImages((p) => p.filter((x) => x !== url))}>Remove</button>
              </div>
            ))}
            {newFiles.map((f, i) => (
              <div className="act-img new" key={f.url}>
                <img src={f.url} alt={f.file.name} />
                <em>New</em>
                <button type="button" onClick={() => removeNew(i)}>Remove</button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* LOCATION */}
      <section className="act-card">
        <h3>Location</h3>
        <div className="act-grid">
          <Field label="City" required><input name="city" value={form.city} onChange={onInput} placeholder="Manali" /></Field>
          <Field label="State"><input name="state" value={form.state} onChange={onInput} placeholder="Himachal Pradesh" /></Field>
          <Field label="Country"><input name="country" value={form.country} onChange={onInput} /></Field>
          <Field label="Address / Area"><input name="address" value={form.address} onChange={onInput} placeholder="Solang Valley" /></Field>
          <Field label="Latitude"><input name="latitude" type="number" step="any" value={form.latitude} onChange={onInput} placeholder="32.3166" /></Field>
          <Field label="Longitude"><input name="longitude" type="number" step="any" value={form.longitude} onChange={onInput} placeholder="77.1566" /></Field>
        </div>
      </section>

      {/* DURATION / PRICING / CAPACITY */}
      <section className="act-card">
        <h3>Duration, pricing & capacity</h3>
        <div className="act-grid three">
          <Field label="Duration">
            <div className="act-split">
              <input name="durationValue" type="number" min="0" value={form.durationValue} onChange={onInput} placeholder="2" />
              <select name="durationUnit" value={form.durationUnit} onChange={onInput}>
                <option value="hours">Hours</option>
                <option value="days">Days</option>
              </select>
            </div>
          </Field>
          <Field label="Max guests" required><input name="maxGuests" type="number" min="1" value={form.maxGuests} onChange={onInput} /></Field>
          <Field label="Booking cutoff (hours)"><input name="bookingCutoffHours" type="number" min="0" value={form.bookingCutoffHours} onChange={onInput} /></Field>
          <Field label="Adult price (₹)"><input name="adult" type="number" min="0" value={form.adult} onChange={onInput} placeholder="2500" /></Field>
          <Field label="Child price (₹)"><input name="child" type="number" min="0" value={form.child} onChange={onInput} placeholder="1800" /></Field>
          <Field label="Infant price (₹)"><input name="infant" type="number" min="0" value={form.infant} onChange={onInput} placeholder="0" /></Field>
          <Field label="Minimum age"><input name="minAge" type="number" min="0" value={form.minAge} onChange={onInput} /></Field>
          <Field label="Maximum age" hint="Optional"><input name="maxAge" type="number" min="0" value={form.maxAge} onChange={onInput} /></Field>
        </div>
      </section>

      {/* MEETING / PICKUP */}
      <section className="act-card">
        <h3>Meeting point & pickup</h3>
        <Field label="Meeting point"><input name="meetingPoint" value={form.meetingPoint} onChange={onInput} placeholder="Solang Valley Parking" /></Field>
        <label className="act-switch">
          <input type="checkbox" name="pickupAvailable" checked={form.pickupAvailable} onChange={onInput} />
          <span>Pickup available</span>
        </label>
        {form.pickupAvailable && (
          <Field label="Pickup details"><input name="pickupDetails" value={form.pickupDetails} onChange={onInput} placeholder="Hotel pickup available" /></Field>
        )}
      </section>

      {/* LISTS */}
      <section className="act-card">
        <h3>Inclusions, exclusions & requirements</h3>
        <div className="act-grid">
          <TagInput label="Inclusions" values={form.inclusions} onChange={(v) => setField("inclusions", v)} placeholder="Safety Equipment" />
          <TagInput label="Exclusions" values={form.exclusions} onChange={(v) => setField("exclusions", v)} placeholder="Food" />
          <TagInput label="Requirements" values={form.requirements} onChange={(v) => setField("requirements", v)} placeholder="Valid ID" />
          <TagInput label="Languages" values={form.languages} onChange={(v) => setField("languages", v)} placeholder="English, Hindi" />
        </div>
      </section>

      {/* POLICIES */}
      <section className="act-card">
        <h3>Policies & settings</h3>
        <Field label="Cancellation policy">
          <textarea name="cancellationPolicy" rows={3} value={form.cancellationPolicy} onChange={onInput} placeholder="Free cancellation 24 hours before" />
        </Field>
        <Field label="Terms & conditions">
          <textarea name="termsAndConditions" rows={3} value={form.termsAndConditions} onChange={onInput} placeholder="Activity subject to weather" />
        </Field>
        <div className="act-switches">
          <label className="act-switch">
            <input type="checkbox" name="instantConfirmation" checked={form.instantConfirmation} onChange={onInput} />
            <span>Instant confirmation</span>
          </label>
          {editingId && (
            <label className="act-switch">
              <input type="checkbox" name="isActive" checked={form.isActive} onChange={onInput} />
              <span>Activity is active</span>
            </label>
          )}
        </div>
      </section>

      <div className="act-actions">
        <button type="button" className="act-btn ghost" onClick={closeForm} disabled={saving}>Cancel</button>
        <button type="submit" className="act-btn primary" disabled={saving}>
          {saving ? "Saving..." : editingId ? "Update Activity" : "Create Activity"}
        </button>
      </div>
    </form>
  );

  /* ==================== RENDER: LIST ==================== */

  const renderList = () => (
    <>
      <div className="act-top">
        <div>
          <span className="act-eyebrow">ACTIVITIES</span>
          <h2>Manage activities</h2>
          <p>Apni saari activities yahan se create, edit aur manage karo.</p>
        </div>
        <button className="act-btn primary" onClick={openCreate}>＋ Add Activity</button>
      </div>

      <div className="act-stats">
        {[["Total", stats.total, ""], ["Approved", stats.approved, "approved"], ["Pending", stats.pending, "pending"], ["Rejected", stats.rejected, "rejected"]].map(([label, value, cls]) => (
          <article key={label} className={cls}><span>{label}</span><strong>{value}</strong></article>
        ))}
      </div>

      <div className="act-filters">
        <input
          type="search" placeholder="Search by title, category or city..."
          value={filters.search} onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
        />
        <select value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}>
          <option value="">All status</option>
          {Object.keys(STATUS_CLASS).map((s) => <option key={s} value={s}>{pretty(s)}</option>)}
        </select>
        <select value={filters.type} onChange={(e) => setFilters((p) => ({ ...p, type: e.target.value }))}>
          <option value="">All types</option>
          {ACTIVITY_TYPES.map((t) => <option key={t} value={t}>{pretty(t)}</option>)}
        </select>
        <select value={filters.active} onChange={(e) => setFilters((p) => ({ ...p, active: e.target.value }))}>
          <option value="">Active & inactive</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {loading ? (
        <div className="act-state"><div className="act-spinner" /><p>Loading activities...</p></div>
      ) : listError ? (
        <div className="act-state"><p className="act-err">{listError}</p><button className="act-btn ghost" onClick={loadActivities}>Retry</button></div>
      ) : filtered.length === 0 ? (
        <div className="act-state">
          <div className="act-empty-icon">◆</div>
          <h3>{activities.length === 0 ? "Abhi koi activity nahi hai" : "Koi activity match nahi hui"}</h3>
          <p>{activities.length === 0 ? "Apni pehli activity add karke start karo." : "Filters change karke dekho."}</p>
          {activities.length === 0 && <button className="act-btn primary" onClick={openCreate}>＋ Add Activity</button>}
        </div>
      ) : (
        <div className="act-list">
          {filtered.map((a) => {
            const busy = busyId === a._id;
            return (
              <article className={`act-item ${a.isActive ? "" : "inactive"}`} key={a._id}>
                <div className="act-thumb">
                  {a.thumbnail || a.images?.[0]
                    ? <img src={a.thumbnail || a.images[0]} alt={a.title} />
                    : <div className="act-noimg">No image</div>}
                  <span className={`act-badge ${STATUS_CLASS[a.status] || ""}`}>{pretty(a.status)}</span>
                </div>
                <div className="act-body">
                  <div className="act-meta">
                    <span>{pretty(a.activityType)}</span><span>•</span><span>{a.category}</span>
                    {!a.isActive && <span className="act-off">Inactive</span>}
                  </div>
                  <h3>{a.title}</h3>
                  <p className="act-loc">⌖ {[a.location?.city, a.location?.state].filter(Boolean).join(", ")}</p>
                  <p className="act-desc">{a.shortDescription || a.description}</p>
                  <div className="act-facts">
                    <span>⏱ {a.duration?.value || 0} {a.duration?.unit}</span>
                    <span>☺ Up to {a.maxGuests}</span>
                    <span>{a.instantConfirmation ? "⚡ Instant" : "Manual confirm"}</span>
                  </div>
                  {a.status === "REJECTED" && a.rejectionReason && (
                    <div className="act-reject">Rejected: {a.rejectionReason}</div>
                  )}
                </div>
                <div className="act-side">
                  <div className="act-price"><small>Adult from</small><strong>{money(a.pricing?.adult)}</strong></div>
                  <div className="act-btns">
                    <button className="act-btn small" disabled={busy} onClick={() => openEdit(a._id)}>Edit</button>
                    <button className="act-btn small ghost" disabled={busy} onClick={() => handleToggle(a)}>
                      {a.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button className="act-btn small danger" disabled={busy} onClick={() => setDeleteTarget(a)}>Delete</button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );

  return (
    <div className="act-page">
      {view === "form" ? renderForm() : renderList()}

      {deleteTarget && (
        <div className="act-modal-bg" onClick={() => !busyId && setDeleteTarget(null)}>
          <div className="act-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete activity?</h3>
            <p><b>{deleteTarget.title}</b> aur uski saari images permanently delete ho jayengi. Ye undo nahi hoga.</p>
            <div className="act-actions">
              <button className="act-btn ghost" disabled={!!busyId} onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="act-btn danger solid" disabled={!!busyId} onClick={confirmDelete}>
                {busyId ? "Deleting..." : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`act-toast ${toast.type}`}>{toast.message}</div>}
    </div>
  );
}