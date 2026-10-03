import { useEffect, useMemo, useState } from "react";
import "./ManageEvents.css";

const API_BASE = "https://bmtvendorfinal.onrender.com/api/nightclub-events";
const CLUB_API = "https://bmtvendorfinal.onrender.com/api/vendor/nightclubs/my-club";

const EVENT_TYPES = [
  { value: "party", label: "Party" },
  { value: "dj-night", label: "DJ Night" },
  { value: "live-music", label: "Live Music" },
  { value: "bollywood-night", label: "Bollywood Night" },
  { value: "edm-night", label: "EDM Night" },
  { value: "punjabi-night", label: "Punjabi Night" },
  { value: "hip-hop-night", label: "Hip Hop Night" },
  { value: "ladies-night", label: "Ladies Night" },
  { value: "couple-night", label: "Couple Night" },
  { value: "special-event", label: "Special Event" },
  { value: "festival", label: "Festival" },
  { value: "other", label: "Other" },
];

// [availableKey, priceKey, label]
const ENTRY_OPTIONS = [
  ["stagEntryAvailable", "stagEntryPrice", "Stag Entry"],
  ["coupleEntryAvailable", "coupleEntryPrice", "Couple Entry"],
  ["femaleEntryAvailable", "femaleEntryPrice", "Female Entry"],
  ["maleEntryAvailable", "maleEntryPrice", "Male Entry"],
];

const emptyForm = {
  nightClubId: "",
  title: "",
  description: "",
  eventType: "party",
  eventDate: "",
  startTime: "",
  endTime: "",
  lastEntryTime: "",
  artistName: "",
  djName: "",
  hostName: "",
  musicGenres: "",
  totalCapacity: "",
  bookingStartDate: "",
  bookingEndDate: "",
  stagEntryAvailable: true,
  coupleEntryAvailable: true,
  femaleEntryAvailable: true,
  maleEntryAvailable: true,
  stagEntryPrice: "",
  coupleEntryPrice: "",
  femaleEntryPrice: "",
  maleEntryPrice: "",
  vipAvailable: false,
  vipPrice: "",
  vipCapacity: "",
  tableBookingAvailable: false,
  boothBookingAvailable: false,
  minimumAge: 18,
  dressCode: "",
  entryPolicy: "",
  prohibitedItems: "",
  // files
  bannerImage: null,
  images: [],
  videos: [],
};

const FILE_KEYS = ["bannerImage", "images", "videos"];
const DATE_KEYS = ["eventDate", "bookingStartDate", "bookingEndDate"];

/* ---------------- API ---------------- */

const apiRequest = async (url, options = {}) => {
  const headers = {
    Authorization: `Bearer ${localStorage.getItem("vendorToken")}`,
    ...(options.headers || {}),
  };
  // JSON body -> content-type. FormData -> browser sets boundary itself.
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
};

/* ---------------- helpers ---------------- */

const toDateInput = (d) => (d ? new Date(d).toISOString().split("T")[0] : "");

const normalizeEvent = (event) => {
  const next = { ...emptyForm };
  Object.keys(emptyForm).forEach((key) => {
    if (FILE_KEYS.includes(key)) return;
    const value = event?.[key];
    if (value === undefined || value === null) return;

    if (key === "nightClubId") next[key] = value._id || value; // populated object -> id
    else if (DATE_KEYS.includes(key)) next[key] = toDateInput(value);
    else if (Array.isArray(value)) next[key] = value.join(", ");
    else next[key] = value;
  });
  return next;
};

const buildPayload = (form) => {
  const fd = new FormData();

  Object.keys(emptyForm).forEach((key) => {
    if (FILE_KEYS.includes(key)) return;
    const value = form[key];
    fd.append(key, typeof value === "boolean" ? String(value) : value ?? "");
  });

  if (form.bannerImage) fd.append("bannerImage", form.bannerImage);
  form.images.forEach((f) => fd.append("images", f));
  form.videos.forEach((f) => fd.append("videos", f));
  return fd;
};

const formatValue = (v) => {
  if (v === undefined || v === null || v === "") return "—";
  if (Array.isArray(v)) return v.length ? v.join(", ") : "—";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  return String(v);
};

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit", month: "short", year: "numeric", timeZone: "UTC",
      })
    : "—";

const typeLabel = (value) => EVENT_TYPES.find((t) => t.value === value)?.label || value;

const statusClass = (s) =>
  ["approved", "pending", "rejected", "cancelled", "completed"].includes(s) ? s : "draft";

const canPublish = (ev) => !ev.isPublished && !["cancelled", "completed"].includes(ev.status);

const ACTION_DONE = { publish: "published", unpublish: "unpublished" };

/* ---------------- small components (outside main so inputs keep focus) ---------------- */

const TextField = ({ label, name, form, onChange, span, hint, as = "input", children, ...rest }) => {
  const common = { name, value: form[name], onChange, ...rest };
  let control;
  if (as === "select") control = <select {...common}>{children}</select>;
  else if (as === "textarea") control = <textarea {...common} />;
  else control = <input {...common} />;

  return (
    <div className={`me-field ${span ? "me-span" : ""}`}>
      <label>{label}</label>
      {control}
      {hint && <p className="me-help">{hint}</p>}
    </div>
  );
};

const Check = ({ label, name, form, onChange }) => (
  <label className="me-check">
    <input type="checkbox" name={name} checked={form[name]} onChange={onChange} />
    <span>{label}</span>
  </label>
);

const Row = ({ label, value }) => (
  <div className="me-row">
    <span className="me-label">{label}</span>
    <span className="me-value">{value}</span>
  </div>
);

const MediaItem = ({ type, url, onRemove, removing }) => (
  <div className="me-media-item">
    {type === "video" ? <video src={url} controls /> : <img src={url} alt="" />}
    {onRemove && (
      <button type="button" className="me-media-remove" disabled={removing}
        onClick={() => onRemove(url)}>×</button>
    )}
  </div>
);

/* ---------------- main ---------------- */

export default function ManageEvents() {
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("list"); // list | form | detail
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });

  useEffect(() => { loadAll(); }, []);

  const resetAlerts = () => { setMessage(""); setError(""); };

  /* ---------- READ ---------- */
  const loadEvents = async () => {
    const res = await apiRequest(`${API_BASE}/my-events`);
    const list = Array.isArray(res?.data) ? res.data : [];
    setEvents(list);
    // keep detail / edit panel in sync with fresh data
    setSelectedEvent((cur) => (cur ? list.find((e) => e._id === cur._id) || null : null));
  };

  const loadAll = async () => {
    try {
      setError("");
      const [, clubsRes] = await Promise.all([
        loadEvents(),
        apiRequest(CLUB_API).catch(() => ({ data: [] })),
      ]);
      setClubs(Array.isArray(clubsRes?.data) ? clubsRes.data : []);
    } catch (err) {
      setError(err.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- navigation ---------- */
  const openAdd = () => {
    setSelectedEvent(null); setForm({ ...emptyForm }); setViewMode("form"); resetAlerts();
  };
  const openEdit = (ev) => {
    setSelectedEvent(ev); setForm(normalizeEvent(ev)); setViewMode("form"); resetAlerts();
  };
  const openView = (ev) => { setSelectedEvent(ev); setViewMode("detail"); resetAlerts(); };
  const closePanel = () => { setSelectedEvent(null); setViewMode("list"); resetAlerts(); };

  /* ---------- form handlers ---------- */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "bannerImage" ? files[0] || null : Array.from(files || []),
    }));
  };

  /* ---------- CREATE / UPDATE ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    resetAlerts();

    if (form.bookingStartDate && form.bookingEndDate && form.bookingEndDate < form.bookingStartDate) {
      return setError("Booking end date cannot be before booking start date");
    }
    if (form.images.length > 10) return setError("You can upload up to 10 gallery images at a time");
    if (form.videos.length > 5) return setError("You can upload up to 5 videos at a time");

    try {
      setSaving(true);
      const body = buildPayload(form);

      if (selectedEvent?._id) {
        await apiRequest(`${API_BASE}/${selectedEvent._id}`, { method: "PUT", body });
        setMessage("Event updated successfully");
      } else {
        await apiRequest(API_BASE, { method: "POST", body });
        setMessage("Event created successfully");
      }

      await loadEvents();
      setViewMode("list");
      setSelectedEvent(null);
    } catch (err) {
      setError(err.message || "Failed to save event");
    } finally {
      setSaving(false);
    }
  };

  /* ---------- publish / unpublish ---------- */
  const performAction = async (ev, action) => {
    try {
      setActionLoading(`${action}-${ev._id}`); resetAlerts();
      await apiRequest(`${API_BASE}/${ev._id}/${action}`, { method: "PATCH" });
      setMessage(`Event ${ACTION_DONE[action]} successfully`);
      await loadEvents();
    } catch (err) {
      setError(err.message || `Failed to ${action} event`);
    } finally {
      setActionLoading("");
    }
  };

  /* ---------- DELETE ---------- */
  const handleDelete = async (ev) => {
    if (!window.confirm(`Delete event "${ev.title}"?`)) return;
    try {
      setActionLoading(`delete-${ev._id}`); resetAlerts();
      await apiRequest(`${API_BASE}/${ev._id}`, { method: "DELETE" });
      setMessage("Event deleted successfully");
      if (selectedEvent?._id === ev._id) { setSelectedEvent(null); setViewMode("list"); }
      await loadEvents();
    } catch (err) {
      setError(err.message || "Failed to delete event");
    } finally {
      setActionLoading("");
    }
  };

  /* ---------- remove banner / image / video ---------- */
  const handleRemoveMedia = async (type, url) => {
    if (!window.confirm("Remove this file?")) return;
    try {
      setActionLoading(url); resetAlerts();
      await apiRequest(`${API_BASE}/${selectedEvent._id}/remove-media`, {
        method: "PATCH",
        body: JSON.stringify({ type, url }),
      });
      await loadEvents();
    } catch (err) {
      setError(err.message || "Failed to remove file");
    } finally {
      setActionLoading("");
    }
  };

  /* ---------- derived ---------- */
  const filteredEvents = useMemo(
    () =>
      events.filter((ev) => {
        const text = `${ev.title || ""} ${ev.eventType || ""} ${ev.nightClubId?.name || ""} ${ev.nightClubId?.city || ""}`.toLowerCase();
        return text.includes(search.toLowerCase()) && (statusFilter === "all" || ev.status === statusFilter);
      }),
    [events, search, statusFilter]
  );

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  if (loading) return <div className="me"><div className="me-loading">Loading events...</div></div>;

  /* ---------- render ---------- */
  return (
    <div className="me">
      {message && <div className="me-msg success">{message}</div>}
      {error && <div className="me-msg error">{error}</div>}

      {/* ================= LIST ================= */}
      {viewMode === "list" && (
        <>
          <div className="me-page-title">
            <div>
              <span className="me-eyebrow">BIRDMYTRIP PARTNER</span>
              <h2>Manage Events</h2>
              <p>Create and manage events, schedules and pricing for your nightclubs.</p>
            </div>
            <button className="me-btn" onClick={openAdd}>+ Create Event</button>
          </div>

          <div className="me-grid">
            {[
              ["TOTAL", "Total Events", events.length],
              ["PUBLISHED", "Live Events", events.filter((e) => e.isPublished).length],
              ["UPCOMING", "Upcoming Events", events.filter((e) => new Date(e.eventDate) >= startOfToday).length],
              ["DRAFTS", "Draft Events", events.filter((e) => e.status === "draft").length],
            ].map(([eyebrow, title, count]) => (
              <div className="me-card" key={title}>
                <div className="me-card-head">
                  <div><span className="me-eyebrow">{eyebrow}</span><h3>{title}</h3></div>
                  <strong>{count}</strong>
                </div>
              </div>
            ))}
          </div>

          <div className="me-card">
            <div className="me-card-head">
              <div><span className="me-eyebrow">EVENTS</span><h3>All Events</h3></div>
              <div className="me-actions">
                <input className="me-search" placeholder="Search events..." value={search}
                  onChange={(e) => setSearch(e.target.value)} />
                <select className="me-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            {filteredEvents.length === 0 ? (
              <div className="me-empty-state">
                <div className="me-empty-icon">✦</div>
                <h3>No Events Found</h3>
                <p>{events.length === 0 ? "Create your first event to get started." : "Try changing your search or filter."}</p>
                <button className="me-btn" onClick={openAdd}>+ Create Event</button>
              </div>
            ) : (
              <div className="me-events-list">
                {filteredEvents.map((ev) => (
                  <div className="me-event-card" key={ev._id}>
                    <div className="me-event-main">
                      <div className="me-event-banner">
                        {ev.bannerImage ? <img src={ev.bannerImage} alt={ev.title} /> : <div className="me-event-banner-placeholder">✦</div>}
                      </div>
                      <div className="me-event-info">
                        <div className="me-event-header">
                          <h4>{ev.title}</h4>
                          <span className={`me-pill ${statusClass(ev.status)}`}>{ev.status}</span>
                          {ev.isPublished && <span className="me-pill live">LIVE</span>}
                        </div>
                        <p className="me-event-meta">
                          {ev.nightClubId?.name && <span>📍 {ev.nightClubId.name}</span>}
                          <span>📅 {formatDate(ev.eventDate)}</span>
                          <span>🕒 {ev.startTime} – {ev.endTime}</span>
                          <span>🎟 {ev.availableCapacity}/{ev.totalCapacity} available</span>
                        </p>
                        <p className="me-event-type"><strong>Type:</strong> {typeLabel(ev.eventType)}</p>
                      </div>
                    </div>

                    <div className="me-event-actions">
                      <button className="me-btn secondary" onClick={() => openView(ev)}>View</button>
                      <button className="me-btn secondary" onClick={() => openEdit(ev)}>Edit</button>
                      {canPublish(ev) && (
                        <button className="me-btn" disabled={actionLoading === `publish-${ev._id}`}
                          onClick={() => performAction(ev, "publish")}>
                          {actionLoading === `publish-${ev._id}` ? "..." : "Publish"}
                        </button>
                      )}
                      {ev.isPublished && (
                        <button className="me-btn secondary" disabled={actionLoading === `unpublish-${ev._id}`}
                          onClick={() => performAction(ev, "unpublish")}>
                          {actionLoading === `unpublish-${ev._id}` ? "..." : "Unpublish"}
                        </button>
                      )}
                      <button className="me-btn danger" disabled={actionLoading === `delete-${ev._id}`}
                        onClick={() => handleDelete(ev)}>
                        {actionLoading === `delete-${ev._id}` ? "..." : "Delete"}
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
      {viewMode === "detail" && selectedEvent && (
        <>
          <div className="me-page-title">
            <div>
              <button className="me-btn secondary" onClick={closePanel}>← Back</button>
              <h2>{selectedEvent.title}</h2>
              <p>{selectedEvent.nightClubId?.name} • {formatDate(selectedEvent.eventDate)}</p>
            </div>
            <div className="me-actions">
              <span className={`me-pill ${statusClass(selectedEvent.status)}`}>{selectedEvent.status}</span>
              {selectedEvent.isPublished && <span className="me-pill live">LIVE</span>}
              {canPublish(selectedEvent) && (
                <button className="me-btn" disabled={actionLoading === `publish-${selectedEvent._id}`}
                  onClick={() => performAction(selectedEvent, "publish")}>Publish</button>
              )}
              {selectedEvent.isPublished && (
                <button className="me-btn secondary" disabled={actionLoading === `unpublish-${selectedEvent._id}`}
                  onClick={() => performAction(selectedEvent, "unpublish")}>Unpublish</button>
              )}
              <button className="me-btn secondary" onClick={() => openEdit(selectedEvent)}>Edit</button>
              <button className="me-btn danger" onClick={() => handleDelete(selectedEvent)}>Delete</button>
            </div>
          </div>

          {selectedEvent.bannerImage && (
            <div className="me-detail-banner"><img src={selectedEvent.bannerImage} alt={selectedEvent.title} /></div>
          )}

          <div className="me-grid">
            <div className="me-card">
              <div className="me-card-head"><div><span className="me-eyebrow">BASIC</span><h3>Basic Information</h3></div></div>
              <div className="me-table">
                <Row label="Title" value={formatValue(selectedEvent.title)} />
                <Row label="Type" value={typeLabel(selectedEvent.eventType)} />
                <Row label="Description" value={formatValue(selectedEvent.description)} />
                <Row label="Music Genres" value={formatValue(selectedEvent.musicGenres)} />
                <Row label="Artist" value={formatValue(selectedEvent.artistName)} />
                <Row label="DJ" value={formatValue(selectedEvent.djName)} />
                <Row label="Host" value={formatValue(selectedEvent.hostName)} />
              </div>
            </div>

            <div className="me-card">
              <div className="me-card-head"><div><span className="me-eyebrow">DATE & TIME</span><h3>Schedule</h3></div></div>
              <div className="me-table">
                <Row label="Event Date" value={formatDate(selectedEvent.eventDate)} />
                <Row label="Start / End" value={`${selectedEvent.startTime} – ${selectedEvent.endTime}`} />
                <Row label="Last Entry" value={formatValue(selectedEvent.lastEntryTime)} />
                <Row label="Booking Starts" value={formatDate(selectedEvent.bookingStartDate)} />
                <Row label="Booking Ends" value={formatDate(selectedEvent.bookingEndDate)} />
              </div>
            </div>

            <div className="me-card">
              <div className="me-card-head"><div><span className="me-eyebrow">CAPACITY</span><h3>Capacity</h3></div></div>
              <div className="me-table">
                <Row label="Total Capacity" value={selectedEvent.totalCapacity} />
                <Row label="Available" value={selectedEvent.availableCapacity} />
                <Row label="Table Booking" value={formatValue(selectedEvent.tableBookingAvailable)} />
                <Row label="Booth Booking" value={formatValue(selectedEvent.boothBookingAvailable)} />
              </div>
            </div>

            <div className="me-card">
              <div className="me-card-head"><div><span className="me-eyebrow">ENTRY PRICING</span><h3>Pricing</h3></div></div>
              <div className="me-table">
                {ENTRY_OPTIONS.filter(([avail]) => selectedEvent[avail]).map(([, price, label]) => (
                  <Row key={price} label={label} value={`₹${selectedEvent[price] ?? 0}`} />
                ))}
                {selectedEvent.vipAvailable && (
                  <>
                    <Row label="VIP Price" value={`₹${selectedEvent.vipPrice ?? 0}`} />
                    <Row label="VIP Capacity" value={formatValue(selectedEvent.vipCapacity)} />
                  </>
                )}
                {!ENTRY_OPTIONS.some(([avail]) => selectedEvent[avail]) && !selectedEvent.vipAvailable && (
                  <Row label="Entry options" value="—" />
                )}
              </div>
            </div>

            <div className="me-card">
              <div className="me-card-head"><div><span className="me-eyebrow">POLICY</span><h3>Rules & Policy</h3></div></div>
              <div className="me-table">
                <Row label="Minimum Age" value={`${selectedEvent.minimumAge}+`} />
                <Row label="Dress Code" value={formatValue(selectedEvent.dressCode)} />
                <Row label="Entry Policy" value={formatValue(selectedEvent.entryPolicy)} />
                <Row label="Prohibited Items" value={formatValue(selectedEvent.prohibitedItems)} />
              </div>
            </div>
          </div>

          {(selectedEvent.images?.length > 0 || selectedEvent.videos?.length > 0) && (
            <div className="me-card">
              <div className="me-card-head"><div><span className="me-eyebrow">MEDIA</span><h3>Gallery</h3></div></div>
              {selectedEvent.images?.length > 0 && (
                <div className="me-media-grid">
                  {selectedEvent.images.map((url) => <MediaItem key={url} type="image" url={url} />)}
                </div>
              )}
              {selectedEvent.videos?.length > 0 && (
                <div className="me-media-grid">
                  {selectedEvent.videos.map((url) => <MediaItem key={url} type="video" url={url} />)}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ================= FORM ================= */}
      {viewMode === "form" && (
        <div className="me-card me-form-card">
          <div className="me-page-title">
            <div>
              <span className="me-eyebrow">EVENT</span>
              <h2>{selectedEvent ? "Edit Event" : "Create Event"}</h2>
            </div>
            <button className="me-btn secondary" onClick={closePanel}>← Back</button>
          </div>

          <form className="me-form" onSubmit={handleSubmit}>
            <h4 className="me-section-title">Event details</h4>

            <TextField as="select" label="Night Club *" name="nightClubId" span form={form} onChange={handleChange}
              required hint={clubs.length === 0 ? "No clubs found. Please create a night club first." : ""}>
              <option value="">-- Select Night Club --</option>
              {clubs.map((c) => <option key={c._id} value={c._id}>{c.name} — {c.city}</option>)}
            </TextField>

            <TextField label="Title *" name="title" form={form} onChange={handleChange} required />
            <TextField as="select" label="Event Type" name="eventType" form={form} onChange={handleChange}>
              {EVENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </TextField>
            <TextField as="textarea" label="Description" name="description" span rows="3" form={form} onChange={handleChange} />

            <h4 className="me-section-title">Schedule & booking window</h4>
            <TextField label="Event Date *" name="eventDate" type="date" form={form} onChange={handleChange} required />
            <TextField label="Total Capacity *" name="totalCapacity" type="number" min="1" form={form} onChange={handleChange} required />
            <TextField label="Start Time *" name="startTime" type="time" form={form} onChange={handleChange} required />
            <TextField label="End Time *" name="endTime" type="time" form={form} onChange={handleChange} required
              hint="Overnight events are fine (e.g. 22:00 to 03:00)." />
            <TextField label="Last Entry Time" name="lastEntryTime" type="time" form={form} onChange={handleChange} />
            <div />
            <TextField label="Booking Start Date" name="bookingStartDate" type="date" form={form} onChange={handleChange} />
            <TextField label="Booking End Date" name="bookingEndDate" type="date" min={form.bookingStartDate || undefined}
              form={form} onChange={handleChange} />

            <h4 className="me-section-title">Artists & music</h4>
            <TextField label="Artist Name" name="artistName" form={form} onChange={handleChange} />
            <TextField label="DJ Name" name="djName" form={form} onChange={handleChange} />
            <TextField label="Host Name" name="hostName" form={form} onChange={handleChange} />
            <TextField label="Music Genres" name="musicGenres" placeholder="EDM, Bollywood, Hip Hop" form={form} onChange={handleChange} />

            <h4 className="me-section-title">Entry pricing (₹)</h4>
            {ENTRY_OPTIONS.map(([avail, price, label]) => (
              <div className="me-pair" key={avail}>
                <Check label={`${label} available`} name={avail} form={form} onChange={handleChange} />
                <TextField label={`${label} price`} name={price} type="number" min="0" form={form}
                  onChange={handleChange} disabled={!form[avail]} />
              </div>
            ))}

            <h4 className="me-section-title">VIP, tables & booths</h4>
            <div className="me-pair">
              <Check label="VIP available" name="vipAvailable" form={form} onChange={handleChange} />
              <TextField label="VIP price" name="vipPrice" type="number" min="0" form={form}
                onChange={handleChange} disabled={!form.vipAvailable} />
            </div>
            <TextField label="VIP capacity" name="vipCapacity" type="number" min="0" form={form}
              onChange={handleChange} disabled={!form.vipAvailable} />
            <div className="me-pair">
              <Check label="Table booking available" name="tableBookingAvailable" form={form} onChange={handleChange} />
              <Check label="Booth booking available" name="boothBookingAvailable" form={form} onChange={handleChange} />
            </div>

            <h4 className="me-section-title">Rules</h4>
            <TextField label="Minimum Age" name="minimumAge" type="number" min="18" form={form} onChange={handleChange} />
            <TextField label="Dress Code" name="dressCode" form={form} onChange={handleChange} />
            <TextField as="textarea" label="Entry Policy" name="entryPolicy" span rows="2" form={form} onChange={handleChange} />
            <TextField as="textarea" label="Prohibited Items" name="prohibitedItems" span rows="2"
              placeholder="Weapons, outside food, etc. (comma separated)" form={form} onChange={handleChange} />

            <h4 className="me-section-title">Photos & videos</h4>
            <div className="me-field me-span">
              <label>Banner Image</label>
              <input type="file" name="bannerImage" accept="image/*" onChange={handleFileChange} />
              {form.bannerImage && <p className="me-help">{form.bannerImage.name}</p>}
              {selectedEvent?.bannerImage && !form.bannerImage && (
                <div className="me-media-grid">
                  <MediaItem type="image" url={selectedEvent.bannerImage}
                    removing={actionLoading === selectedEvent.bannerImage}
                    onRemove={(url) => handleRemoveMedia("bannerImage", url)} />
                </div>
              )}
              {selectedEvent?.bannerImage && form.bannerImage && (
                <p className="me-help">The new banner will replace the current one when you save.</p>
              )}
            </div>

            <div className="me-field me-span">
              <label>Gallery Images (up to 10 at a time)</label>
              <input type="file" name="images" accept="image/*" multiple onChange={handleFileChange} />
              {form.images.length > 0 && <p className="me-help">{form.images.length} new image(s) selected</p>}
              {selectedEvent?.images?.length > 0 && (
                <div className="me-media-grid">
                  {selectedEvent.images.map((url) => (
                    <MediaItem key={url} type="image" url={url} removing={actionLoading === url}
                      onRemove={(u) => handleRemoveMedia("images", u)} />
                  ))}
                </div>
              )}
            </div>

            <div className="me-field me-span">
              <label>Videos (up to 5 at a time)</label>
              <input type="file" name="videos" accept="video/*" multiple onChange={handleFileChange} />
              {form.videos.length > 0 && <p className="me-help">{form.videos.length} new video(s) selected</p>}
              {selectedEvent?.videos?.length > 0 && (
                <div className="me-media-grid">
                  {selectedEvent.videos.map((url) => (
                    <MediaItem key={url} type="video" url={url} removing={actionLoading === url}
                      onRemove={(u) => handleRemoveMedia("videos", u)} />
                  ))}
                </div>
              )}
            </div>

            <div className="me-save me-span">
              <button type="button" className="me-btn secondary" onClick={closePanel}>Cancel</button>
              <button type="submit" className="me-btn" disabled={saving}>
                {saving ? "Saving..." : selectedEvent ? "Update Event" : "Create Event"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}