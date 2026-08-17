import { useState, useEffect } from "react";

const API_BASE = "/api/vendor/campsite";

const getToken = () => localStorage.getItem("vendorToken");

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...(options.headers || {}),
    },
  });
  return res.json();
}

const AMENITIES_OPTIONS = [
  "WiFi", "Bonfire", "Parking", "Washrooms", "Hot Water",
  "Electricity", "First Aid", "Drinking Water", "Tents Provided", "Kitchen",
];

const INDIA_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi",
];

const STATUS_CONFIG = {
  pending:  { bg: "#FFF7ED", color: "#C2410C", dot: "#F97316", label: "Pending" },
  approved: { bg: "#F0FDF4", color: "#15803D", dot: "#22C55E", label: "Approved" },
  rejected: { bg: "#FFF1F2", color: "#BE123C", dot: "#F43F5E", label: "Rejected" },
  inactive: { bg: "#F1F5F9", color: "#475569", dot: "#94A3B8", label: "Inactive" },
};

const EMPTY_FORM = {
  campsiteName: "", description: "", category: "Camping",
  street: "", area: "", city: "", state: "", pincode: "", landmark: "",
  latitude: "", longitude: "",
  perNight: "", weekendPrice: "",
  amenities: [],
};

/* ─── StatusBadge ─── */
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 600,
      background: cfg.bg, color: cfg.color,
    }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: cfg.dot, display: "inline-block" }} />
      {cfg.label}
    </span>
  );
}

/* ─── CampsiteCard ─── */
function CampsiteCard({ camp, onView }) {
  return (
    <div
      onClick={() => onView(camp)}
      style={{
        background: "#fff",
        border: "1.5px solid #E2EAF4",
        borderRadius: 16,
        padding: "22px 24px",
        cursor: "pointer",
        transition: "box-shadow 0.18s, transform 0.18s",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = "0 8px 32px rgba(37,99,235,0.13)";
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.borderColor = "#3B82F6";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "#E2EAF4";
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: "linear-gradient(180deg,#3B82F6,#1D4ED8)", borderRadius: "16px 0 0 16px" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.3px" }}>{camp.campsiteName}</h3>
        <StatusBadge status={camp.status} />
      </div>
      <p style={{ margin: "0 0 12px", color: "#64748B", fontSize: 13.5, lineHeight: 1.5 }}>
        {camp.description?.slice(0, 90) || "No description provided"}{camp.description?.length > 90 ? "…" : ""}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        {camp.amenities?.slice(0, 4).map(a => (
          <span key={a} style={{ background: "#EFF6FF", color: "#2563EB", fontSize: 11.5, fontWeight: 600, borderRadius: 6, padding: "3px 9px" }}>{a}</span>
        ))}
        {camp.amenities?.length > 4 && (
          <span style={{ background: "#F1F5F9", color: "#64748B", fontSize: 11.5, fontWeight: 600, borderRadius: 6, padding: "3px 9px" }}>+{camp.amenities.length - 4} more</span>
        )}
      </div>
      <div style={{ display: "flex", gap: 20 }}>
        <div>
          <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, marginBottom: 2 }}>PER NIGHT</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#1D4ED8" }}>₹{camp.price?.perNight || "—"}</div>
        </div>
        {camp.price?.weekendPrice && (
          <div>
            <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, marginBottom: 2 }}>WEEKEND</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#1D4ED8" }}>₹{camp.price.weekendPrice}</div>
          </div>
        )}
        <div style={{ marginLeft: "auto" }}>
          <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, marginBottom: 2 }}>LOCATION</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>{camp.address?.city || "—"}, {camp.address?.state || "—"}</div>
        </div>
      </div>
    </div>
  );
}

/* ─── DetailModal ─── */
function DetailModal({ camp, onClose }) {
  if (!camp) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 560, maxHeight: "85vh", overflowY: "auto", padding: "32px 32px 28px", position: "relative" }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: "absolute", top: 18, right: 18, background: "#F1F5F9", border: "none", borderRadius: 10, width: 36, height: 36, fontSize: 18, cursor: "pointer", color: "#64748B", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, background: "linear-gradient(135deg,#3B82F6,#1D4ED8)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>⛺</div>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#0F172A" }}>{camp.campsiteName}</h2>
            <StatusBadge status={camp.status} />
          </div>
        </div>
        <Section label="Description" value={camp.description || "—"} />
        <Section label="Category" value={camp.category} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <InfoBox label="Per Night" value={camp.price?.perNight ? `₹${camp.price.perNight}` : "—"} />
          <InfoBox label="Weekend" value={camp.price?.weekendPrice ? `₹${camp.price.weekendPrice}` : "—"} />
        </div>
        <Section label="Address" value={[camp.address?.street, camp.address?.area, camp.address?.city, camp.address?.state, camp.address?.pincode].filter(Boolean).join(", ") || "—"} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <InfoBox label="Latitude" value={camp.location?.latitude || "—"} />
          <InfoBox label="Longitude" value={camp.location?.longitude || "—"} />
        </div>
        {camp.amenities?.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: 1, marginBottom: 8 }}>AMENITIES</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {camp.amenities.map(a => <span key={a} style={{ background: "#EFF6FF", color: "#2563EB", fontSize: 12, fontWeight: 600, borderRadius: 7, padding: "4px 11px" }}>{a}</span>)}
            </div>
          </div>
        )}
        <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 8 }}>Created: {new Date(camp.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</div>
      </div>
    </div>
  );
}

function Section({ label, value }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: 1, marginBottom: 4 }}>{label.toUpperCase()}</div>
      <div style={{ fontSize: 14, color: "#334155", lineHeight: 1.6 }}>{value}</div>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div style={{ background: "#F8FAFC", borderRadius: 10, padding: "12px 14px", border: "1px solid #E2EAF4" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: 0.8, marginBottom: 4 }}>{label.toUpperCase()}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#1D4ED8" }}>{value}</div>
    </div>
  );
}

/* ─── CreateForm ─── */
function CreateForm({ onSuccess, onCancel }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleAmenity = (a) => {
    setForm(f => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a],
    }));
  };

  const handleSubmit = async () => {
    if (!form.campsiteName.trim()) return setError("Campsite name is required.");
    if (!form.perNight) return setError("Price per night is required.");
    setError(""); setLoading(true);
    try {
      const body = {
        campsiteName: form.campsiteName,
        description: form.description,
        category: form.category,
        address: { street: form.street, area: form.area, city: form.city, state: form.state, pincode: form.pincode, landmark: form.landmark },
        latitude: form.latitude,
        longitude: form.longitude,
        perNight: Number(form.perNight),
        weekendPrice: form.weekendPrice ? Number(form.weekendPrice) : undefined,
        amenities: form.amenities,
      };
      const data = await apiFetch("/", { method: "POST", body: JSON.stringify(body) });
      if (data.success) onSuccess(data.data);
      else setError(data.message || "Something went wrong.");
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  const inputStyle = {
    width: "100%", padding: "11px 14px", border: "1.5px solid #E2EAF4", borderRadius: 10,
    fontSize: 14, color: "#0F172A", background: "#fff", outline: "none", boxSizing: "border-box",
    transition: "border-color 0.15s",
    fontFamily: "inherit",
  };
  const labelStyle = { fontSize: 12, fontWeight: 700, color: "#475569", letterSpacing: 0.5, marginBottom: 5, display: "block" };

  return (
    <div style={{ background: "#fff", borderRadius: 20, border: "1.5px solid #E2EAF4", padding: "28px 28px 24px", maxWidth: 640 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <div style={{ width: 40, height: 40, background: "linear-gradient(135deg,#3B82F6,#1D4ED8)", borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⛺</div>
        <div>
          <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: "#0F172A" }}>Add New Campsite</h2>
          <p style={{ margin: 0, fontSize: 13, color: "#94A3B8" }}>Fill in details — submitted as "pending" for approval</p>
        </div>
      </div>

      {error && (
        <div style={{ background: "#FFF1F2", border: "1px solid #FECDD3", color: "#BE123C", borderRadius: 10, padding: "10px 14px", marginBottom: 18, fontSize: 13, fontWeight: 500 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Basic */}
      <SectionHeader>Basic Info</SectionHeader>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <div>
          <label style={labelStyle}>CAMPSITE NAME *</label>
          <input style={inputStyle} value={form.campsiteName} placeholder="e.g. Riverside Camp Manali" onChange={e => set("campsiteName", e.target.value)} onFocus={e => e.target.style.borderColor="#3B82F6"} onBlur={e => e.target.style.borderColor="#E2EAF4"} />
        </div>
        <div>
          <label style={labelStyle}>CATEGORY</label>
          <select style={{ ...inputStyle }} value={form.category} onChange={e => set("category", e.target.value)} onFocus={e => e.target.style.borderColor="#3B82F6"} onBlur={e => e.target.style.borderColor="#E2EAF4"}>
            {["Camping","Adventure","Glamping","Trekking","Beach","Forest","Mountain"].map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div style={{ marginBottom: 18 }}>
        <label style={labelStyle}>DESCRIPTION</label>
        <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 80 }} value={form.description} placeholder="Describe the campsite experience, surroundings, what makes it special…" onChange={e => set("description", e.target.value)} onFocus={e => e.target.style.borderColor="#3B82F6"} onBlur={e => e.target.style.borderColor="#E2EAF4"} />
      </div>

      {/* Address */}
      <SectionHeader>Address</SectionHeader>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <div>
          <label style={labelStyle}>STREET</label>
          <input style={inputStyle} value={form.street} placeholder="Street / Plot No." onChange={e => set("street", e.target.value)} onFocus={e => e.target.style.borderColor="#3B82F6"} onBlur={e => e.target.style.borderColor="#E2EAF4"} />
        </div>
        <div>
          <label style={labelStyle}>AREA / LOCALITY</label>
          <input style={inputStyle} value={form.area} placeholder="Area or Village" onChange={e => set("area", e.target.value)} onFocus={e => e.target.style.borderColor="#3B82F6"} onBlur={e => e.target.style.borderColor="#E2EAF4"} />
        </div>
        <div>
          <label style={labelStyle}>CITY</label>
          <input style={inputStyle} value={form.city} placeholder="City" onChange={e => set("city", e.target.value)} onFocus={e => e.target.style.borderColor="#3B82F6"} onBlur={e => e.target.style.borderColor="#E2EAF4"} />
        </div>
        <div>
          <label style={labelStyle}>STATE</label>
          <select style={{ ...inputStyle }} value={form.state} onChange={e => set("state", e.target.value)} onFocus={e => e.target.style.borderColor="#3B82F6"} onBlur={e => e.target.style.borderColor="#E2EAF4"}>
            <option value="">Select State</option>
            {INDIA_STATES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>PINCODE</label>
          <input style={inputStyle} value={form.pincode} placeholder="e.g. 175131" onChange={e => set("pincode", e.target.value)} onFocus={e => e.target.style.borderColor="#3B82F6"} onBlur={e => e.target.style.borderColor="#E2EAF4"} />
        </div>
        <div>
          <label style={labelStyle}>LANDMARK</label>
          <input style={inputStyle} value={form.landmark} placeholder="Near / Opposite" onChange={e => set("landmark", e.target.value)} onFocus={e => e.target.style.borderColor="#3B82F6"} onBlur={e => e.target.style.borderColor="#E2EAF4"} />
        </div>
      </div>

      {/* GPS */}
      <SectionHeader>GPS Coordinates</SectionHeader>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
        <div>
          <label style={labelStyle}>LATITUDE</label>
          <input style={inputStyle} value={form.latitude} placeholder="e.g. 32.2396" onChange={e => set("latitude", e.target.value)} onFocus={e => e.target.style.borderColor="#3B82F6"} onBlur={e => e.target.style.borderColor="#E2EAF4"} />
        </div>
        <div>
          <label style={labelStyle}>LONGITUDE</label>
          <input style={inputStyle} value={form.longitude} placeholder="e.g. 77.1887" onChange={e => set("longitude", e.target.value)} onFocus={e => e.target.style.borderColor="#3B82F6"} onBlur={e => e.target.style.borderColor="#E2EAF4"} />
        </div>
      </div>

      {/* Pricing */}
      <SectionHeader>Pricing (₹)</SectionHeader>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
        <div>
          <label style={labelStyle}>PER NIGHT *</label>
          <input style={inputStyle} type="number" value={form.perNight} placeholder="e.g. 1500" onChange={e => set("perNight", e.target.value)} onFocus={e => e.target.style.borderColor="#3B82F6"} onBlur={e => e.target.style.borderColor="#E2EAF4"} />
        </div>
        <div>
          <label style={labelStyle}>WEEKEND PRICE</label>
          <input style={inputStyle} type="number" value={form.weekendPrice} placeholder="e.g. 2000" onChange={e => set("weekendPrice", e.target.value)} onFocus={e => e.target.style.borderColor="#3B82F6"} onBlur={e => e.target.style.borderColor="#E2EAF4"} />
        </div>
      </div>

      {/* Amenities */}
      <SectionHeader>Amenities</SectionHeader>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
        {AMENITIES_OPTIONS.map(a => {
          const selected = form.amenities.includes(a);
          return (
            <button key={a} type="button" onClick={() => toggleAmenity(a)} style={{
              padding: "7px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "1.5px solid",
              background: selected ? "#EFF6FF" : "#F8FAFC",
              borderColor: selected ? "#3B82F6" : "#E2EAF4",
              color: selected ? "#2563EB" : "#64748B",
              transition: "all 0.15s",
            }}>
              {selected ? "✓ " : ""}{a}
            </button>
          );
        })}
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: 12 }}>
        <button type="button" onClick={onCancel} style={{ flex: 1, padding: "12px", borderRadius: 11, border: "1.5px solid #E2EAF4", background: "#F8FAFC", color: "#475569", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
          Cancel
        </button>
        <button type="button" onClick={handleSubmit} disabled={loading} style={{ flex: 2, padding: "12px", borderRadius: 11, border: "none", background: loading ? "#93C5FD" : "linear-gradient(135deg,#3B82F6,#1D4ED8)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer", letterSpacing: 0.3 }}>
          {loading ? "Submitting…" : "⛺ Submit Campsite"}
        </button>
      </div>
    </div>
  );
}

function SectionHeader({ children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
      <div style={{ height: 1, flex: 1, background: "#E2EAF4" }} />
      <span style={{ fontSize: 11, fontWeight: 800, color: "#3B82F6", letterSpacing: 1.2 }}>{children}</span>
      <div style={{ height: 1, flex: 1, background: "#E2EAF4" }} />
    </div>
  );
}

/* ─── Main App ─── */
export default function CampsiteApp() {
  const [view, setView] = useState("list"); // list | create
  const [campsites, setCampsites] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadCampsites = async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/");
      if (data.success) setCampsites(data.data);
      else setError(data.message || "Failed to load campsites.");
    } catch {
      setError("Network error.");
    }
    setLoading(false);
  };

  useEffect(() => { loadCampsites(); }, []);

  const handleCreated = (newCamp) => {
    setCampsites(prev => [newCamp, ...prev]);
    setView("list");
  };

  const filtered = campsites.filter(c => {
    const matchSearch = c.campsiteName?.toLowerCase().includes(search.toLowerCase()) ||
      c.address?.city?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: campsites.length,
    approved: campsites.filter(c => c.status === "approved").length,
    pending: campsites.filter(c => c.status === "pending").length,
    rejected: campsites.filter(c => c.status === "rejected").length,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F0F5FF", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1D4ED8 0%, #2563EB 60%, #3B82F6 100%)", padding: "0 0 0 0", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 16px rgba(29,78,216,0.18)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 26 }}>⛺</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 17, color: "#fff", letterSpacing: "-0.3px" }}>CampManager</div>
              <div style={{ fontSize: 11.5, color: "#93C5FD", fontWeight: 500 }}>Vendor Dashboard</div>
            </div>
          </div>
          <button
            onClick={() => setView(view === "create" ? "list" : "create")}
            style={{ background: view === "create" ? "rgba(255,255,255,0.15)" : "#fff", border: "none", borderRadius: 10, padding: "9px 18px", fontWeight: 700, fontSize: 13.5, cursor: "pointer", color: view === "create" ? "#fff" : "#1D4ED8", display: "flex", alignItems: "center", gap: 7 }}
          >
            {view === "create" ? "← My Campsites" : "+ Add Campsite"}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px 48px" }}>

        {view === "create" ? (
          <CreateForm onSuccess={handleCreated} onCancel={() => setView("list")} />
        ) : (
          <>
            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
              {[
                { label: "Total", value: stats.total, color: "#3B82F6", bg: "#EFF6FF" },
                { label: "Approved", value: stats.approved, color: "#16A34A", bg: "#F0FDF4" },
                { label: "Pending", value: stats.pending, color: "#EA580C", bg: "#FFF7ED" },
                { label: "Rejected", value: stats.rejected, color: "#DC2626", bg: "#FFF1F2" },
              ].map(s => (
                <div key={s.label} style={{ background: "#fff", borderRadius: 14, padding: "16px 18px", border: "1.5px solid #E2EAF4", textAlign: "center" }}>
                  <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#94A3B8", marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Search + Filter */}
            <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1, position: "relative" }}>
                <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: "#94A3B8" }}>🔍</span>
                <input
                  style={{ width: "100%", padding: "11px 14px 11px 38px", border: "1.5px solid #E2EAF4", borderRadius: 10, fontSize: 14, background: "#fff", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                  placeholder="Search campsite name or city…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onFocus={e => e.target.style.borderColor = "#3B82F6"}
                  onBlur={e => e.target.style.borderColor = "#E2EAF4"}
                />
              </div>
              <select
                style={{ padding: "11px 16px", border: "1.5px solid #E2EAF4", borderRadius: 10, fontSize: 13, fontWeight: 600, background: "#fff", color: "#334155", cursor: "pointer", outline: "none", fontFamily: "inherit" }}
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* List */}
            {loading ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#94A3B8" }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>⛺</div>
                <div style={{ fontWeight: 600 }}>Loading campsites…</div>
              </div>
            ) : error ? (
              <div style={{ background: "#FFF1F2", border: "1px solid #FECDD3", color: "#BE123C", borderRadius: 12, padding: "18px 20px", textAlign: "center" }}>⚠️ {error}</div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <div style={{ fontSize: 48, marginBottom: 14 }}>🏕️</div>
                <div style={{ fontWeight: 700, fontSize: 17, color: "#334155", marginBottom: 6 }}>
                  {campsites.length === 0 ? "No campsites yet" : "No results found"}
                </div>
                <div style={{ color: "#94A3B8", fontSize: 14, marginBottom: 20 }}>
                  {campsites.length === 0 ? "Add your first campsite to get started." : "Try a different search or filter."}
                </div>
                {campsites.length === 0 && (
                  <button onClick={() => setView("create")} style={{ background: "linear-gradient(135deg,#3B82F6,#1D4ED8)", color: "#fff", border: "none", borderRadius: 10, padding: "12px 24px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>+ Add First Campsite</button>
                )}
              </div>
            ) : (
              <div style={{ display: "grid", gap: 14 }}>
                {filtered.map(c => <CampsiteCard key={c._id} camp={c} onView={setSelected} />)}
              </div>
            )}
          </>
        )}
      </div>

      <DetailModal camp={selected} onClose={() => setSelected(null)} />
    </div>
  );
}