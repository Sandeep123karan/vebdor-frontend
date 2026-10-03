import { useEffect, useState } from "react";
import "./NightclubManagement.css";

// NOTE: no trailing slash
const API_BASE_URL = "https://bmtvendorfinal.onrender.com/api/vendor/nightclubs";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

// must match enum in NightClub.model.js
const VENUE_TYPES = ["nightclub", "lounge", "pub", "bar", "rooftop", "club", "other"];

const emptyForm = {
  name: "", description: "", venueType: "nightclub",
  address: "", city: "", state: "", country: "India", pincode: "", latitude: "", longitude: "",
  phone: "", email: "", website: "", instagram: "",
  totalCapacity: "", musicGenres: "", residentDJs: "",
  liveDJAvailable: false, liveBandAvailable: false, danceFloorAvailable: true,
  minimumAge: 18, dressCodeRequired: false, dressCode: "", stagAllowed: true, coupleEntryAvailable: true,
  operatingDays: [], openingTime: "", closingTime: "", lastEntryTime: "",
  alcoholAvailable: false, parkingAvailable: false, valetAvailable: false,
  vipSectionAvailable: false, privateBoothAvailable: false, smokingAreaAvailable: false,
  wheelchairAccessible: false,
  alcoholLicenseNumber: "", exciseLicenseNumber: "", fireNOCNumber: "",
  cancellationPolicy: "", refundPolicy: "", entryPolicy: "", prohibitedItems: "",
};

const emptyFiles = {
  logo: null, coverImage: null, images: [], videos: [],
  alcoholLicenseDocument: null, exciseLicenseDocument: null, fireNOCDocument: null,
};

const NUMBER_FIELDS = ["latitude", "longitude", "totalCapacity", "minimumAge"];

/* ---------------- API ---------------- */

const apiRequest = async (path = "", options = {}) => {
  const token = localStorage.getItem("vendorToken");
  const headers = { Authorization: `Bearer ${token}`, ...(options.headers || {}) };

  // JSON body -> set content-type. FormData -> browser sets multipart boundary itself.
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.error || `Request failed (${response.status})`);
  }
  return data;
};

/* ---------------- helpers ---------------- */

const toFormState = (club) => {
  const next = { ...emptyForm };
  Object.keys(emptyForm).forEach((key) => {
    const value = club?.[key];
    if (value === undefined || value === null) return;
    if (key === "operatingDays") next[key] = Array.isArray(value) ? value : [];
    else if (Array.isArray(value)) next[key] = value.join(", ");
    else next[key] = value;
  });
  return next;
};

// backend controller expects multipart strings: "true"/"false" and comma separated arrays
const buildFormData = (form, files) => {
  const fd = new FormData();

  Object.keys(emptyForm).forEach((key) => {
    const value = form[key];
    if (key === "operatingDays") {
      fd.append(key, value.join(","));
    } else if (typeof value === "boolean") {
      fd.append(key, String(value));
    } else if (NUMBER_FIELDS.includes(key) && (value === "" || value === null)) {
      return; // skip empty numbers
    } else {
      fd.append(key, value ?? "");
    }
  });

  if (files.logo) fd.append("logo", files.logo);
  if (files.coverImage) fd.append("coverImage", files.coverImage);
  files.images.forEach((f) => fd.append("images", f));
  files.videos.forEach((f) => fd.append("videos", f));
  ["alcoholLicenseDocument", "exciseLicenseDocument", "fireNOCDocument"].forEach((k) => {
    if (files[k]) fd.append(k, files[k]);
  });

  return fd;
};

const formatValue = (value) => {
  if (value === undefined || value === null || value === "") return "—";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
};

const statusClass = (status) =>
  ["approved", "pending", "rejected", "inactive"].includes(status) ? status : "draft";

const DETAIL_SECTIONS = [
  {
    eyebrow: "BASIC INFORMATION", title: "Basic Information",
    rows: [["Name", "name"], ["Venue Type", "venueType"], ["Description", "description"],
      ["Capacity", "totalCapacity"], ["Minimum Age", "minimumAge"]],
  },
  {
    eyebrow: "CONTACT", title: "Contact & Location",
    rows: [["Address", "address"], ["City", "city"], ["State", "state"], ["Country", "country"],
      ["Pincode", "pincode"], ["Phone", "phone"], ["Email", "email"], ["Website", "website"],
      ["Instagram", "instagram"]],
  },
  {
    eyebrow: "ENTERTAINMENT", title: "Entertainment",
    rows: [["Music Genres", "musicGenres"], ["Resident DJs", "residentDJs"], ["Live DJ", "liveDJAvailable"],
      ["Live Band", "liveBandAvailable"], ["Dance Floor", "danceFloorAvailable"]],
  },
  {
    eyebrow: "ENTRY", title: "Entry & Dress Code",
    rows: [["Dress Code Required", "dressCodeRequired"], ["Dress Code", "dressCode"],
      ["Stag Allowed", "stagAllowed"], ["Couple Entry", "coupleEntryAvailable"]],
  },
  {
    eyebrow: "TIMINGS", title: "Operating Hours",
    rows: [["Operating Days", "operatingDays"], ["Opening Time", "openingTime"],
      ["Closing Time", "closingTime"], ["Last Entry", "lastEntryTime"]],
  },
  {
    eyebrow: "FACILITIES", title: "Facilities",
    rows: [["Alcohol", "alcoholAvailable"], ["Parking", "parkingAvailable"], ["Valet", "valetAvailable"],
      ["VIP Section", "vipSectionAvailable"], ["Private Booth", "privateBoothAvailable"],
      ["Smoking Area", "smokingAreaAvailable"], ["Wheelchair Accessible", "wheelchairAccessible"]],
  },
  {
    eyebrow: "LICENSES", title: "Licenses",
    rows: [["Alcohol License", "alcoholLicenseNumber"], ["Excise License", "exciseLicenseNumber"],
      ["Fire NOC", "fireNOCNumber"]],
  },
  {
    eyebrow: "POLICIES", title: "Policies",
    rows: [["Cancellation", "cancellationPolicy"], ["Refund", "refundPolicy"],
      ["Entry Policy", "entryPolicy"], ["Prohibited Items", "prohibitedItems"]],
  },
];

const CHECKBOXES = [
  ["liveDJAvailable", "Live DJ Available"], ["liveBandAvailable", "Live Band Available"],
  ["danceFloorAvailable", "Dance Floor Available"], ["dressCodeRequired", "Dress Code Required"],
  ["stagAllowed", "Stag Allowed"], ["coupleEntryAvailable", "Couple Entry Available"],
  ["alcoholAvailable", "Alcohol Available"], ["parkingAvailable", "Parking Available"],
  ["valetAvailable", "Valet Available"], ["vipSectionAvailable", "VIP Section Available"],
  ["privateBoothAvailable", "Private Booth Available"], ["smokingAreaAvailable", "Smoking Area Available"],
  ["wheelchairAccessible", "Wheelchair Accessible"],
];

/* ---------------- small components (outside main so inputs keep focus) ---------------- */

const Field = ({ label, name, form, onChange, type = "text", span, children, ...rest }) => (
  <div className={`nc-field ${span ? "nc-span" : ""}`}>
    <label htmlFor={name}>{label}</label>
    {children || <input id={name} type={type} name={name} value={form[name]} onChange={onChange} {...rest} />}
  </div>
);

const FileField = ({ label, accept, multiple, onPick, hint }) => (
  <div className="nc-field nc-file-field">
    <label>{label}</label>
    <input type="file" accept={accept} multiple={multiple} onChange={onPick} />
    {hint && <small>{hint}</small>}
  </div>
);

const MediaGallery = ({ club, onRemove, removing }) => (
  <>
    {club.images?.length > 0 && (
      <div className="nc-media">
        {club.images.map((url) => (
          <div key={url} style={{ position: "relative" }}>
            <a href={url} target="_blank" rel="noreferrer"><img src={url} alt="club" /></a>
            {onRemove && (
              <button type="button" className="nc-media-remove" disabled={removing === url}
                onClick={() => onRemove("images", url)}>×</button>
            )}
          </div>
        ))}
      </div>
    )}
    {club.videos?.length > 0 && (
      <div className="nc-media" style={{ marginTop: 10 }}>
        {club.videos.map((url) => (
          <div key={url} style={{ position: "relative" }}>
            <video src={url} controls />
            {onRemove && (
              <button type="button" className="nc-media-remove" disabled={removing === url}
                onClick={() => onRemove("videos", url)}>×</button>
            )}
          </div>
        ))}
      </div>
    )}
  </>
);

/* ---------------- main ---------------- */

export default function NightclubManagement() {
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [files, setFiles] = useState({ ...emptyFiles });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("list"); // list | detail | form

  useEffect(() => { loadClubs(); }, []);

  const resetAlerts = () => { setMessage(""); setError(""); };

  /* ---------- READ ---------- */
  const loadClubs = async () => {
    try {
      setError("");
      const result = await apiRequest("/my-club");
      const list = Array.isArray(result?.data) ? result.data : [];
      setClubs(list);
      setSelectedClub((current) => (current ? list.find((c) => c._id === current._id) || null : null));
    } catch (err) {
      setClubs([]);
      setError(err.message || "Failed to load nightclubs");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- navigation ---------- */
  const openAdd = () => {
    setSelectedClub(null); setForm({ ...emptyForm }); setFiles({ ...emptyFiles });
    setViewMode("form"); resetAlerts();
  };
  const openEdit = (club) => {
    setSelectedClub(club); setForm(toFormState(club)); setFiles({ ...emptyFiles });
    setViewMode("form"); resetAlerts();
  };
  const openView = (club) => { setSelectedClub(club); setViewMode("detail"); resetAlerts(); };
  const closePanel = () => { setSelectedClub(null); setViewMode("list"); resetAlerts(); };

  /* ---------- form handlers ---------- */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const toggleDay = (day) => {
    setForm((prev) => ({
      ...prev,
      operatingDays: prev.operatingDays.includes(day)
        ? prev.operatingDays.filter((d) => d !== day)
        : [...prev.operatingDays, day],
    }));
  };

  const pickSingle = (key) => (e) => setFiles((prev) => ({ ...prev, [key]: e.target.files[0] || null }));
  const pickMultiple = (key) => (e) => setFiles((prev) => ({ ...prev, [key]: Array.from(e.target.files) }));

  /* ---------- CREATE / UPDATE ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true); resetAlerts();
      const body = buildFormData(form, files);

      if (selectedClub?._id) {
        await apiRequest(`/${selectedClub._id}`, { method: "PUT", body });
        setMessage("Nightclub updated successfully");
      } else {
        await apiRequest("", { method: "POST", body });
        setMessage("Nightclub added successfully");
      }

      await loadClubs();
      setViewMode("list");
      setSelectedClub(null);
    } catch (err) {
      setError(err.message || "Failed to save nightclub");
    } finally {
      setSaving(false);
    }
  };

  /* ---------- submit / publish / unpublish ---------- */
  const performAction = async (club, action) => {
    try {
      setActionLoading(`${action}-${club._id}`); resetAlerts();
      await apiRequest(`/${club._id}/${action}`, { method: "PATCH" });
      setMessage(`Nightclub ${action}ed successfully`.replace("submited", "submitted"));
      await loadClubs();
    } catch (err) {
      setError(err.message || `Failed to ${action} nightclub`);
    } finally {
      setActionLoading("");
    }
  };

  /* ---------- DELETE ---------- */
  const handleDelete = async (club) => {
    if (!window.confirm(`Are you sure you want to delete "${club.name}"?`)) return;
    try {
      setActionLoading(`delete-${club._id}`); resetAlerts();
      await apiRequest(`/${club._id}`, { method: "DELETE" });
      setMessage("Nightclub deleted successfully");
      if (selectedClub?._id === club._id) { setSelectedClub(null); setViewMode("list"); }
      await loadClubs();
    } catch (err) {
      setError(err.message || "Failed to delete nightclub");
    } finally {
      setActionLoading("");
    }
  };

  /* ---------- remove single image / video ---------- */
  const handleRemoveMedia = async (type, url) => {
    if (!window.confirm(`Remove this ${type === "images" ? "image" : "video"}?`)) return;
    try {
      setActionLoading(url); resetAlerts();
      const result = await apiRequest(`/${selectedClub._id}/remove-media`, {
        method: "PATCH",
        body: JSON.stringify({ type, url }),
      });
      setSelectedClub(result.data);
      setClubs((prev) => prev.map((c) => (c._id === result.data._id ? result.data : c)));
    } catch (err) {
      setError(err.message || "Failed to remove media");
    } finally {
      setActionLoading("");
    }
  };

  /* ---------- derived ---------- */
  const filteredClubs = clubs.filter((club) => {
    const text = `${club.name || ""} ${club.city || ""} ${club.state || ""} ${club.venueType || ""}`.toLowerCase();
    return text.includes(search.toLowerCase()) && (statusFilter === "all" || club.status === statusFilter);
  });

  const countBy = (status) => clubs.filter((c) => c.status === status).length;

  if (loading) return <div className="nc"><div className="nc-loading">Loading nightclubs...</div></div>;

  /* ---------- render ---------- */
  return (
    <div className="nc">
      <div className="nc-page-title">
        <div>
          <span className="nc-eyebrow">VENDOR PANEL</span>
          <h2>Night Club</h2>
        </div>
        {viewMode === "list" && <button className="nc-btn" onClick={openAdd}>+ Add Nightclub</button>}
      </div>

      {message && <div className="nc-msg success">{message}</div>}
      {error && <div className="nc-msg error">{error}</div>}

      {/* ================= LIST ================= */}
      {viewMode === "list" && (
        <>
          <div className="nc-hero">
            <div className="nc-id">
              <div className="nc-logo">N</div>
              <div>
                <span className="nc-eyebrow light">NIGHTCLUB MANAGEMENT</span>
                <h2>Manage Your Nightclubs</h2>
                <p>Add, edit and manage all your nightclub properties.</p>
              </div>
            </div>
            <div className="nc-actions">
              <button className="nc-btn light" onClick={openAdd}>+ Add Nightclub</button>
            </div>
          </div>

          <div className="nc-grid">
            <div className="nc-card">
              <div className="nc-card-head">
                <div><span className="nc-eyebrow">TOTAL</span><h3>Total Nightclubs</h3></div>
                <strong>{clubs.length}</strong>
              </div>
              <div className="nc-table">
                <div className="nc-row"><span className="nc-label">Published</span>
                  <span className="nc-value">{clubs.filter((c) => c.isPublished).length}</span></div>
              </div>
            </div>
            <div className="nc-card">
              <div className="nc-card-head">
                <div><span className="nc-eyebrow">STATUS</span><h3>Nightclub Status</h3></div>
                <strong>{countBy("approved")}</strong>
              </div>
              <div className="nc-table">
                {["draft", "pending", "approved", "rejected"].map((s) => (
                  <div className="nc-row" key={s}>
                    <span className="nc-label" style={{ textTransform: "capitalize" }}>{s}</span>
                    <span className="nc-value">{countBy(s)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="nc-card">
            <div className="nc-card-head">
              <div><span className="nc-eyebrow">NIGHTCLUBS</span><h3>All Nightclubs</h3></div>
              <div className="nc-actions">
                <input className="nc-search" value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search nightclub, city..." />
                <select className="nc-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {filteredClubs.length === 0 ? (
              <div className="nc-empty-state">
                <div className="nc-empty-icon">N</div>
                <h2>No Nightclubs Found</h2>
                <p>{clubs.length === 0 ? "Add your first nightclub to get started." : "Try changing your search or status filter."}</p>
                <button className="nc-btn" onClick={openAdd}>+ Add Nightclub</button>
              </div>
            ) : (
              <div className="nc-list">
                {filteredClubs.map((club) => (
                  <div className="nc-card nc-club-card" key={club._id}>
                    <div className="nc-card-head">
                      <div>
                        <span className="nc-eyebrow">{club.venueType || "NIGHTCLUB"}</span>
                        <h3>{club.name || "Unnamed Nightclub"}</h3>
                        <p>{[club.city, club.state].filter(Boolean).join(", ") || "Location not added"}</p>
                      </div>
                      <span className={`nc-pill nc-pill-dark ${statusClass(club.status)}`}>{club.status || "draft"}</span>
                    </div>

                    <div className="nc-table">
                      <div className="nc-row"><span className="nc-label">Capacity</span><span className="nc-value">{formatValue(club.totalCapacity)}</span></div>
                      <div className="nc-row"><span className="nc-label">Published</span><span className="nc-value">{club.isPublished ? "Yes" : "No"}</span></div>
                      <div className="nc-row"><span className="nc-label">Operating Days</span><span className="nc-value">{formatValue(club.operatingDays)}</span></div>
                      {club.status === "rejected" && club.rejectionReason && (
                        <div className="nc-row"><span className="nc-label">Rejection Reason</span><span className="nc-value">{club.rejectionReason}</span></div>
                      )}
                    </div>

                    <div className="nc-actions">
                      <button className="nc-btn secondary" onClick={() => openView(club)}>View</button>
                      <button className="nc-btn secondary" onClick={() => openEdit(club)}>Edit</button>
                      {(club.status === "draft" || club.status === "rejected") && (
                        <button className="nc-btn" disabled={actionLoading === `submit-${club._id}`}
                          onClick={() => performAction(club, "submit")}>
                          {actionLoading === `submit-${club._id}` ? "..." : "Submit"}
                        </button>
                      )}
                      {club.status === "approved" && !club.isPublished && (
                        <button className="nc-btn" disabled={actionLoading === `publish-${club._id}`}
                          onClick={() => performAction(club, "publish")}>
                          {actionLoading === `publish-${club._id}` ? "..." : "Publish"}
                        </button>
                      )}
                      {club.isPublished && (
                        <button className="nc-btn secondary" disabled={actionLoading === `unpublish-${club._id}`}
                          onClick={() => performAction(club, "unpublish")}>
                          {actionLoading === `unpublish-${club._id}` ? "..." : "Unpublish"}
                        </button>
                      )}
                      <button className="nc-btn danger" disabled={actionLoading === `delete-${club._id}`}
                        onClick={() => handleDelete(club)}>
                        {actionLoading === `delete-${club._id}` ? "..." : "Delete"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ================= DETAIL ================= */}
      {viewMode === "detail" && selectedClub && (
        <>
          <div className="nc-page-title">
            <div>
              <button className="nc-btn secondary" onClick={closePanel}>← Back</button>
              <h2>{selectedClub.name || "Nightclub Details"}</h2>
            </div>
            <div className="nc-actions">
              <span className={`nc-pill nc-pill-dark ${statusClass(selectedClub.status)}`}>{selectedClub.status || "draft"}</span>
              <button className="nc-btn secondary" onClick={() => openEdit(selectedClub)}>Edit</button>
              <button className="nc-btn danger" onClick={() => handleDelete(selectedClub)}>Delete</button>
            </div>
          </div>

          {selectedClub.coverImage && (
            <div className="nc-hero" style={{ backgroundImage: `linear-gradient(#1b153366,#1b1533cc), url(${selectedClub.coverImage})` }}>
              <div className="nc-id">
                {selectedClub.logo
                  ? <img className="nc-logo" src={selectedClub.logo} alt="logo" />
                  : <div className="nc-logo">N</div>}
                <div>
                  <h2>{selectedClub.name}</h2>
                  <p>{[selectedClub.city, selectedClub.state].filter(Boolean).join(", ")}</p>
                </div>
              </div>
            </div>
          )}

          <div className="nc-grid">
            {DETAIL_SECTIONS.map((section) => (
              <div className="nc-card" key={section.title}>
                <div className="nc-card-head">
                  <div><span className="nc-eyebrow">{section.eyebrow}</span><h3>{section.title}</h3></div>
                </div>
                <div className="nc-table">
                  {section.rows.map(([label, key]) => (
                    <div className="nc-row" key={key}>
                      <span className="nc-label">{label}</span>
                      <span className="nc-value">{formatValue(selectedClub[key])}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="nc-card">
            <div className="nc-card-head">
              <div><span className="nc-eyebrow">MEDIA</span><h3>Photos & Videos</h3></div>
              <span className="nc-count">{(selectedClub.images?.length || 0) + (selectedClub.videos?.length || 0)}</span>
            </div>
            {selectedClub.images?.length || selectedClub.videos?.length
              ? <MediaGallery club={selectedClub} />
              : <p>No media uploaded yet.</p>}
          </div>

          <div className="nc-card">
            <div className="nc-card-head">
              <div><span className="nc-eyebrow">DOCUMENTS</span><h3>License Documents</h3></div>
            </div>
            <div className="nc-docs">
              {[["Alcohol License", "alcoholLicenseDocument"], ["Excise License", "exciseLicenseDocument"], ["Fire NOC", "fireNOCDocument"]]
                .map(([label, key]) =>
                  selectedClub[key]
                    ? <a key={key} href={selectedClub[key]} target="_blank" rel="noreferrer">{label}</a>
                    : <span key={key}>{label}: not uploaded</span>
                )}
            </div>
          </div>
        </>
      )}

      {/* ================= FORM ================= */}
      {viewMode === "form" && (
        <div className="nc-edit-card nc-card">
          <div className="nc-page-title">
            <div>
              <span className="nc-eyebrow">NIGHTCLUB</span>
              <h2>{selectedClub ? "Edit Nightclub" : "Add Nightclub"}</h2>
            </div>
            <button className="nc-btn secondary" onClick={closePanel}>← Back</button>
          </div>

          <form className="nc-form" onSubmit={handleSubmit}>
            <Field label="Name *" name="name" form={form} onChange={handleChange} required />
            <Field label="Venue Type" name="venueType" form={form} onChange={handleChange}>
              <select name="venueType" value={form.venueType} onChange={handleChange}>
                {VENUE_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </Field>
            <Field label="Total Capacity" name="totalCapacity" type="number" min="0" form={form} onChange={handleChange} />
            <Field label="Description" name="description" span form={form} onChange={handleChange}>
              <textarea name="description" value={form.description} onChange={handleChange} rows="4" />
            </Field>

            <Field label="Address *" name="address" form={form} onChange={handleChange} required />
            <Field label="City *" name="city" form={form} onChange={handleChange} required />
            <Field label="State" name="state" form={form} onChange={handleChange} />
            <Field label="Country" name="country" form={form} onChange={handleChange} />
            <Field label="Pincode" name="pincode" form={form} onChange={handleChange} />
            <Field label="Latitude" name="latitude" type="number" step="any" form={form} onChange={handleChange} />
            <Field label="Longitude" name="longitude" type="number" step="any" form={form} onChange={handleChange} />

            <Field label="Phone" name="phone" form={form} onChange={handleChange} />
            <Field label="Email" name="email" type="email" form={form} onChange={handleChange} />
            <Field label="Website" name="website" form={form} onChange={handleChange} />
            <Field label="Instagram" name="instagram" form={form} onChange={handleChange} />

            <Field label="Music Genres" name="musicGenres" form={form} onChange={handleChange} placeholder="EDM, Bollywood, Hip Hop" />
            <Field label="Resident DJs" name="residentDJs" form={form} onChange={handleChange} placeholder="DJ Name 1, DJ Name 2" />
            <Field label="Minimum Age" name="minimumAge" type="number" min="18" form={form} onChange={handleChange} />
            <Field label="Dress Code" name="dressCode" form={form} onChange={handleChange} />

            {CHECKBOXES.map(([name, label]) => (
              <label className="nc-check" key={name}>
                <input type="checkbox" name={name} checked={form[name]} onChange={handleChange} />
                {label}
              </label>
            ))}

            <div className="nc-field nc-span">
              <label>Operating Days</label>
              <div className="nc-days">
                {DAYS.map((day) => (
                  <button type="button" key={day} className={form.operatingDays.includes(day) ? "active" : ""}
                    onClick={() => toggleDay(day)}>{day}</button>
                ))}
              </div>
            </div>
            <Field label="Opening Time" name="openingTime" type="time" form={form} onChange={handleChange} />
            <Field label="Closing Time" name="closingTime" type="time" form={form} onChange={handleChange} />
            <Field label="Last Entry Time" name="lastEntryTime" type="time" form={form} onChange={handleChange} />

            <Field label="Alcohol License Number" name="alcoholLicenseNumber" form={form} onChange={handleChange} />
            <Field label="Excise License Number" name="exciseLicenseNumber" form={form} onChange={handleChange} />
            <Field label="Fire NOC Number" name="fireNOCNumber" form={form} onChange={handleChange} />

            <Field label="Cancellation Policy" name="cancellationPolicy" span form={form} onChange={handleChange}>
              <textarea name="cancellationPolicy" value={form.cancellationPolicy} onChange={handleChange} rows="3" />
            </Field>
            <Field label="Refund Policy" name="refundPolicy" span form={form} onChange={handleChange}>
              <textarea name="refundPolicy" value={form.refundPolicy} onChange={handleChange} rows="3" />
            </Field>
            <Field label="Entry Policy" name="entryPolicy" span form={form} onChange={handleChange}>
              <textarea name="entryPolicy" value={form.entryPolicy} onChange={handleChange} rows="3" />
            </Field>
            <Field label="Prohibited Items" name="prohibitedItems" span form={form} onChange={handleChange}>
              <textarea name="prohibitedItems" value={form.prohibitedItems} onChange={handleChange} rows="3"
                placeholder="Weapons, outside food, etc. (comma separated)" />
            </Field>

            {/* ---------- uploads ---------- */}
            <FileField label="Logo" accept="image/*" onPick={pickSingle("logo")}
              hint={files.logo?.name || (selectedClub?.logo ? "Current logo will be replaced" : "")} />
            <FileField label="Cover Image" accept="image/*" onPick={pickSingle("coverImage")}
              hint={files.coverImage?.name || (selectedClub?.coverImage ? "Current cover will be replaced" : "")} />
            <FileField label="Gallery Images (max 10)" accept="image/*" multiple onPick={pickMultiple("images")}
              hint={files.images.length ? `${files.images.length} new file(s)` : ""} />
            <FileField label="Videos (max 5)" accept="video/*" multiple onPick={pickMultiple("videos")}
              hint={files.videos.length ? `${files.videos.length} new file(s)` : ""} />
            <FileField label="Alcohol License Document" accept="image/*,.pdf" onPick={pickSingle("alcoholLicenseDocument")}
              hint={files.alcoholLicenseDocument?.name || (selectedClub?.alcoholLicenseDocument ? "Already uploaded" : "")} />
            <FileField label="Excise License Document" accept="image/*,.pdf" onPick={pickSingle("exciseLicenseDocument")}
              hint={files.exciseLicenseDocument?.name || (selectedClub?.exciseLicenseDocument ? "Already uploaded" : "")} />
            <FileField label="Fire NOC Document" accept="image/*,.pdf" onPick={pickSingle("fireNOCDocument")}
              hint={files.fireNOCDocument?.name || (selectedClub?.fireNOCDocument ? "Already uploaded" : "")} />

            {selectedClub && (selectedClub.images?.length > 0 || selectedClub.videos?.length > 0) && (
              <div className="nc-field nc-span">
                <label>Existing media (click × to remove)</label>
                <MediaGallery club={selectedClub} onRemove={handleRemoveMedia} removing={actionLoading} />
              </div>
            )}

            <div className="nc-save nc-field nc-span">
              <button type="button" className="nc-btn secondary" onClick={closePanel}>Cancel</button>
              <button type="submit" className="nc-btn" disabled={saving}>
                {saving ? "Saving..." : selectedClub ? "Update Nightclub" : "Add Nightclub"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}