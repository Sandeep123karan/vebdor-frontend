import { useCallback, useEffect, useState } from "react";
import "./Adddarshan.css";

/* ==================== CONFIG ==================== */
// Backend: app.use("/api/vendor/darshans", darshan.routes)
// Agar baaki pages me aap koi common API base use karte ho to yahan wahi daal do.
const API_BASE = "https://bmtvendorfinal.onrender.com/api/vendor/darshans";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SUGGESTED_TYPES = ["General Darshan", "VIP Darshan", "Special Darshan", "Aarti Darshan", "Abhishek", "Seva"];

const EMPTY_FORM = {
  name: "",
  shortDescription: "",
  description: "",
  templeName: "",
  deityName: "",
  deityType: "",
  address: "",
  landmark: "",
  city: "",
  state: "",
  country: "India",
  pincode: "",
  latitude: "",
  longitude: "",
  openingTime: "",
  closingTime: "",
  morningDarshanStart: "",
  morningDarshanEnd: "",
  eveningDarshanStart: "",
  eveningDarshanEnd: "",
  dailyCapacity: "",
  basePrice: "",
  currency: "INR",
  ageRestriction: "",
  dressCode: "",
  entryPolicy: "",
  cancellationPolicy: "",
  phone: "",
  email: "",
  website: "",
  wheelchairAccessible: false,
  parkingAvailable: false,
  cloakRoomAvailable: false,
  prasadAvailable: false,
};

const FACILITIES = [
  ["wheelchairAccessible", "Wheelchair accessible"],
  ["parkingAvailable", "Parking available"],
  ["cloakRoomAvailable", "Cloak room"],
  ["prasadAvailable", "Prasad available"],
];

const STATUS_LABEL = {
  draft: "Draft",
  pending: "In review",
  approved: "Approved",
  rejected: "Rejected",
  inactive: "Inactive",
};

/* ==================== API ==================== */
async function api(path = "", options = {}) {
  const token = localStorage.getItem("vendorToken");
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, ...(options.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    throw new Error(data.message || "Something went wrong. Please try again.");
  }
  return data;
}

/* ==================== MAIN ==================== */
export default function AddDarshan() {
  const [view, setView] = useState("list"); // list | form
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null); // { type, text }
  const [editing, setEditing] = useState(null); // darshan object or null

  const flash = (type, text) => {
    setNotice({ type, text });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api("/my-darshans");
      setItems(res.data || []);
    } catch (err) {
      flash("error", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setNotice(null);
    setView("form");
  };

  const openEdit = (item) => {
    setEditing(item);
    setNotice(null);
    setView("form");
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    try {
      await api(`/${item._id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((d) => d._id !== item._id));
      flash("success", "Darshan deleted.");
    } catch (err) {
      flash("error", err.message);
    }
  };

  const handleSaved = (message) => {
    setView("list");
    flash("success", message);
    load();
  };

  return (
    <div className="bmt-premium-page dd-page">
      <div className="bmt-section-intro">
        <div>
          <span className="bmt-eyebrow">DARSHAN</span>
          <h2>{view === "form" ? (editing ? "Edit Darshan" : "Add Darshan") : "My Darshans"}</h2>
          <p>
            {view === "form"
              ? "Fill in the temple, timing, pricing and policy details. New and edited listings are reviewed before going live."
              : "Create and manage the temple darshan listings that appear on BirdMyTrip."}
          </p>
        </div>
        {view === "list" ? (
          <button className="bmt-primary-btn" onClick={openCreate}>+ Add Darshan</button>
        ) : (
          <button className="bmt-secondary-btn" onClick={() => setView("list")}>Back to list</button>
        )}
      </div>

      {notice && (
        <div className={`dd-notice ${notice.type}`} role="status">
          <span>{notice.text}</span>
          <button onClick={() => setNotice(null)} aria-label="Dismiss">×</button>
        </div>
      )}

      {view === "list" ? (
        <DarshanList
          items={items}
          loading={loading}
          onAdd={openCreate}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      ) : (
        <DarshanForm
          key={editing?._id || "new"}
          initial={editing}
          onCancel={() => setView("list")}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

/* ==================== LIST ==================== */
function DarshanList({ items, loading, onAdd, onEdit, onDelete }) {
  if (loading) {
    return (
      <section className="bmt-form-card">
        <div className="dd-empty"><p>Loading your darshans...</p></div>
      </section>
    );
  }

  if (!items.length) {
    return (
      <section className="bmt-form-card">
        <div className="dd-empty">
          <div className="bmt-empty-icon">◇</div>
          <h3>No darshans yet</h3>
          <p>Add your first temple darshan to start receiving bookings.</p>
          <button className="bmt-primary-btn" onClick={onAdd}>Add Darshan</button>
        </div>
      </section>
    );
  }

  return (
    <div className="dd-list">
      {items.map((d) => (
        <article className="dd-card" key={d._id}>
          <div className="dd-card-img">
            {d.mainImage ? <img src={d.mainImage} alt={d.name} /> : <span>◇</span>}
          </div>
          <div className="dd-card-body">
            <div className="dd-card-top">
              <h3>{d.name}</h3>
              <span className={`dd-status ${d.status}`}>{STATUS_LABEL[d.status] || d.status}</span>
            </div>
            <p className="dd-card-sub">{d.templeName}</p>
            <p className="dd-card-meta">
              {[d.city, d.state].filter(Boolean).join(", ")}
              {d.basePrice > 0 && ` • ${d.currency || "INR"} ${d.basePrice}`}
              {d.dailyCapacity > 0 && ` • ${d.dailyCapacity} / day`}
            </p>
            {d.status === "rejected" && d.rejectionReason && (
              <p className="dd-reject">Reason: {d.rejectionReason}</p>
            )}
            <div className="dd-card-actions">
              <button className="bmt-secondary-btn" onClick={() => onEdit(d)}>Edit</button>
              <button className="dd-danger-btn" onClick={() => onDelete(d)}>Delete</button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

/* ==================== FORM ==================== */
function DarshanForm({ initial, onCancel, onSaved }) {
  const isEdit = Boolean(initial);

  const [form, setForm] = useState(() => {
    if (!initial) return EMPTY_FORM;
    const next = { ...EMPTY_FORM };
    Object.keys(EMPTY_FORM).forEach((k) => {
      if (initial[k] !== undefined && initial[k] !== null) next[k] = initial[k];
    });
    return next;
  });
  const [days, setDays] = useState(initial?.operatingDays || []);
  const [types, setTypes] = useState(initial?.darshanTypes || []);
  const [typeInput, setTypeInput] = useState("");

  const [mainFile, setMainFile] = useState(null);
  const [mainPreview, setMainPreview] = useState(initial?.mainImage || "");
  const [galleryFiles, setGalleryFiles] = useState([]); // { file, url }
  const existingGallery = initial?.galleryImages || [];

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => {
    setForm((p) => ({ ...p, [key]: e.target.value }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: "" }));
  };
  const toggleFlag = (key) => setForm((p) => ({ ...p, [key]: !p[key] }));
  const toggleDay = (d) => setDays((p) => (p.includes(d) ? p.filter((x) => x !== d) : [...p, d]));

  const addType = (value) => {
    const v = value.trim();
    if (!v || types.some((t) => t.toLowerCase() === v.toLowerCase())) return;
    setTypes((p) => [...p, v]);
    setTypeInput("");
  };

  const pickMain = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMainFile(file);
    setMainPreview(URL.createObjectURL(file));
  };

  const pickGallery = (e) => {
    const files = Array.from(e.target.files || []);
    const room = 10 - galleryFiles.length;
    const next = files.slice(0, Math.max(room, 0)).map((file) => ({ file, url: URL.createObjectURL(file) }));
    setGalleryFiles((p) => [...p, ...next]);
    e.target.value = "";
  };

  const validate = () => {
    const err = {};
    if (!form.name.trim()) err.name = "Darshan name is required";
    if (!form.templeName.trim()) err.templeName = "Temple name is required";
    if (!String(form.address).trim()) err.address = "Address is required";
    if (!String(form.city).trim()) err.city = "City is required";
    if (!String(form.state).trim()) err.state = "State is required";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) err.email = "Enter a valid email";
    ["dailyCapacity", "basePrice", "ageRestriction"].forEach((k) => {
      if (form[k] !== "" && Number(form[k]) < 0) err[k] = "Cannot be negative";
    });
    setErrors(err);
    return err;
  };

  const submit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (Object.keys(err).length) {
      const first = document.querySelector(".dd-has-error");
      first?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (typeof v === "boolean") fd.append(k, String(v));
      else if (v !== "" && v !== null && v !== undefined) fd.append(k, String(v).trim());
    });
    if (days.length) fd.append("operatingDays", days.join(","));
    if (types.length) fd.append("darshanTypes", types.join(","));
    if (mainFile) fd.append("mainImage", mainFile);
    galleryFiles.forEach((g) => fd.append("galleryImages", g.file));

    setSaving(true);
    try {
      const res = isEdit
        ? await api(`/${initial._id}`, { method: "PUT", body: fd })
        : await api("", { method: "POST", body: fd });
      onSaved(res.message || "Darshan saved.");
    } catch (error) {
      setErrors((p) => ({ ...p, _form: error.message }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  };

  const text = (key, label, props = {}) => (
    <Field label={label} error={errors[key]}>
      <input value={form[key]} onChange={set(key)} {...props} />
    </Field>
  );

  return (
    <form onSubmit={submit} noValidate>
      {errors._form && <div className="dd-notice error"><span>{errors._form}</span></div>}

      {/* BASIC */}
      <section className="bmt-form-card dd-block">
        <div className="bmt-form-card-head"><h3>Basic details</h3><p>How this darshan appears to travellers.</p></div>
        <div className="bmt-form-grid">
          {text("name", "Darshan name *", { placeholder: "e.g. Morning Aarti Darshan" })}
          {text("templeName", "Temple name *", { placeholder: "e.g. Shri Banke Bihari Temple" })}
          {text("deityName", "Deity name", { placeholder: "e.g. Shri Krishna" })}
          {text("deityType", "Deity type", { placeholder: "e.g. Vishnu avatar" })}
        </div>
        <Field label="Short description">
          <input value={form.shortDescription} onChange={set("shortDescription")} placeholder="One line shown on listing cards" maxLength={160} />
        </Field>
        <Field label="Full description">
          <textarea rows="5" value={form.description} onChange={set("description")} placeholder="History, significance and what the visit includes..." />
        </Field>
      </section>

      {/* LOCATION */}
      <section className="bmt-form-card dd-block">
        <div className="bmt-form-card-head"><h3>Location</h3><p>Exact address helps travellers find the temple.</p></div>
        <div className="bmt-form-grid">
          {text("address", "Address *", { placeholder: "Street / area" })}
          {text("landmark", "Landmark", { placeholder: "Nearby landmark" })}
          {text("city", "City *", { placeholder: "City" })}
          {text("state", "State *", { placeholder: "State" })}
          {text("country", "Country", { placeholder: "Country" })}
          {text("pincode", "Pincode", { placeholder: "Pincode" })}
          {text("latitude", "Latitude", { type: "number", step: "any", placeholder: "e.g. 27.5650" })}
          {text("longitude", "Longitude", { type: "number", step: "any", placeholder: "e.g. 77.6593" })}
        </div>
      </section>

      {/* IMAGES */}
      <section className="bmt-form-card dd-block">
        <div className="bmt-form-card-head"><h3>Images</h3><p>JPG, PNG or WEBP, up to 10 MB each.</p></div>
        <div className="dd-image-row">
          <div>
            <label className="dd-label">Main image</label>
            <label className="bmt-upload-zone compact">
              <input type="file" accept="image/*" onChange={pickMain} />
              {mainPreview ? (
                <img className="dd-main-preview" src={mainPreview} alt="Main preview" />
              ) : (
                <>
                  <span className="bmt-upload-icon">＋</span>
                  <strong>Upload main image</strong>
                </>
              )}
            </label>
          </div>
          <div>
            <label className="dd-label">Gallery ({existingGallery.length + galleryFiles.length}/10 new + existing)</label>
            <label className="bmt-upload-zone compact">
              <input type="file" accept="image/*" multiple onChange={pickGallery} />
              <span className="bmt-upload-icon">＋</span>
              <strong>Add gallery images</strong>
              <small>Up to 10 images per upload</small>
            </label>
          </div>
        </div>
        {(existingGallery.length > 0 || galleryFiles.length > 0) && (
          <div className="bmt-media-grid">
            {existingGallery.map((url) => (
              <div className="bmt-media-item" key={url}>
                <img src={url} alt="Gallery" />
                <button type="button" disabled>Saved</button>
              </div>
            ))}
            {galleryFiles.map((g, i) => (
              <div className="bmt-media-item" key={g.url}>
                <img src={g.url} alt={g.file.name} />
                <button type="button" onClick={() => setGalleryFiles((p) => p.filter((_, x) => x !== i))}>Remove</button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* TIMINGS */}
      <section className="bmt-form-card dd-block">
        <div className="bmt-form-card-head"><h3>Timings</h3><p>Temple hours and darshan windows.</p></div>
        <div className="bmt-form-grid">
          {text("openingTime", "Temple opens", { type: "time" })}
          {text("closingTime", "Temple closes", { type: "time" })}
          {text("morningDarshanStart", "Morning darshan starts", { type: "time" })}
          {text("morningDarshanEnd", "Morning darshan ends", { type: "time" })}
          {text("eveningDarshanStart", "Evening darshan starts", { type: "time" })}
          {text("eveningDarshanEnd", "Evening darshan ends", { type: "time" })}
        </div>
        <label className="dd-label">Operating days</label>
        <div className="dd-day-row">
          {DAYS.map((d) => (
            <button
              type="button"
              key={d}
              className={`dd-day ${days.includes(d) ? "on" : ""}`}
              onClick={() => toggleDay(d)}
              aria-pressed={days.includes(d)}
            >
              {d.slice(0, 3)}
            </button>
          ))}
        </div>
      </section>

      {/* TYPES, CAPACITY, PRICE */}
      <section className="bmt-form-card dd-block">
        <div className="bmt-form-card-head"><h3>Darshan types, capacity & price</h3><p>Slots and per-type pricing can be set after the listing is created.</p></div>
        <label className="dd-label">Darshan types</label>
        <div className="bmt-inline-input">
          <input
            value={typeInput}
            onChange={(e) => setTypeInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addType(typeInput);
              }
            }}
            placeholder="Type and press Enter"
          />
          <button type="button" onClick={() => addType(typeInput)}>Add</button>
        </div>
        <div className="bmt-chip-wrap">
          {SUGGESTED_TYPES.filter((s) => !types.includes(s)).map((s) => (
            <button type="button" className="dd-suggest" key={s} onClick={() => addType(s)}>+ {s}</button>
          ))}
        </div>
        {types.length > 0 && (
          <div className="bmt-chip-wrap">
            {types.map((t) => (
              <span className="bmt-chip" key={t}>
                {t}
                <button type="button" onClick={() => setTypes((p) => p.filter((x) => x !== t))} aria-label={`Remove ${t}`}>×</button>
              </span>
            ))}
          </div>
        )}
        <div className="bmt-form-grid dd-gap-top">
          {text("dailyCapacity", "Daily capacity (people)", { type: "number", min: "0", placeholder: "0" })}
          {text("basePrice", "Base price", { type: "number", min: "0", placeholder: "0 for free entry" })}
          <Field label="Currency">
            <select value={form.currency} onChange={set("currency")}>
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </Field>
          {text("ageRestriction", "Minimum age", { type: "number", min: "0", placeholder: "0 for no restriction" })}
        </div>
      </section>

      {/* FACILITIES */}
      <section className="bmt-form-card dd-block">
        <div className="bmt-form-card-head"><h3>Facilities</h3></div>
        <div className="bmt-check-grid">
          {FACILITIES.map(([key, label]) => (
            <label className={`bmt-check-card ${form[key] ? "selected" : ""}`} key={key}>
              <input type="checkbox" checked={form[key]} onChange={() => toggleFlag(key)} />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </section>

      {/* POLICIES */}
      <section className="bmt-form-card dd-block">
        <div className="bmt-form-card-head"><h3>Policies</h3></div>
        <Field label="Dress code">
          <textarea rows="3" value={form.dressCode} onChange={set("dressCode")} placeholder="e.g. Traditional attire; no shorts or sleeveless tops" />
        </Field>
        <Field label="Entry policy">
          <textarea rows="3" value={form.entryPolicy} onChange={set("entryPolicy")} placeholder="ID proof, mobile phones, bags, footwear..." />
        </Field>
        <Field label="Cancellation policy">
          <textarea rows="3" value={form.cancellationPolicy} onChange={set("cancellationPolicy")} placeholder="Refund and cancellation rules" />
        </Field>
      </section>

      {/* CONTACT */}
      <section className="bmt-form-card dd-block">
        <div className="bmt-form-card-head"><h3>Contact</h3></div>
        <div className="bmt-form-grid">
          {text("phone", "Phone", { placeholder: "+91..." })}
          {text("email", "Email", { type: "email", placeholder: "temple@example.com" })}
          {text("website", "Website", { placeholder: "https://" })}
        </div>
      </section>

      <div className="dd-submit-bar">
        <button type="button" className="bmt-secondary-btn" onClick={onCancel} disabled={saving}>Cancel</button>
        <button type="submit" className="bmt-primary-btn" disabled={saving}>
          {saving ? "Saving..." : isEdit ? "Save changes" : "Create darshan"}
        </button>
      </div>
      {isEdit && <p className="dd-hint">Saving changes sends this listing back for review and unpublishes it until approved.</p>}
    </form>
  );
}

/* ==================== SMALL HELPERS ==================== */
function Field({ label, error, children }) {
  return (
    <div className={`bmt-field-group ${error ? "dd-has-error" : ""}`}>
      <label>{label}</label>
      {children}
      {error && <small className="dd-error">{error}</small>}
    </div>
  );
}