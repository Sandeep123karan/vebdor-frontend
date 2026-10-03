import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "https://bmtvendorfinal.onrender.com/api/vendor/apartment";

const AMENITIES = ["WiFi", "AC", "TV", "Parking", "Lift", "Geyser", "Power Backup", "Security", "CCTV", "Intercom", "Gym", "Swimming Pool", "Garden", "Club House", "Play Area", "Visitor Parking"];
const APARTMENT_TYPES = ["Studio", "1BHK", "2BHK", "3BHK", "4BHK", "Penthouse"];
const FURNISHING_TYPES = ["Fully Furnished", "Semi Furnished", "Unfurnished"];
const ROOM_TYPES = ["Entire Apartment", "Private Room", "Shared Room"];
const MEAL_PLANS = ["None", "Breakfast Only", "Half Board", "Full Board", "All Inclusive"];
const CANCELLATION = ["Flexible", "Moderate", "Strict", "Non-Refundable"];

const DEFAULT_RULES = { smoking: false, alcohol: false, parties: false, loudMusic: false, unmarriedCouples: false, localIdAllowed: false };
const RULE_LABELS = { smoking: "Smoking", alcohol: "Alcohol", parties: "Parties", loudMusic: "Loud Music", unmarriedCouples: "Unmarried Couples", localIdAllowed: "Local ID Accepted" };

const DEFAULT_FORM = {
  apartmentName: "", propertyType: "Apartment", description: "", hostName: "",
  phone: "", altPhone: "", email: "",
  country: "India", state: "", city: "", area: "", address: "", pincode: "", landmark: "",
  lat: "", lng: "",
  buildingName: "", towerName: "", floorNumber: "", totalFloors: "", flatNumber: "", societyName: "",
  apartmentType: "1BHK", furnishing: "Fully Furnished",
  carpetArea: "", superArea: "",
  bedrooms: "", hall: "", kitchen: "", bathrooms: "", balcony: "",
  maxGuests: "", beds: "",
  extraMattressAllowed: false, childrenAllowed: false, petsAllowed: false,
  kitchenAvailable: false, selfCookingAllowed: false, vegFoodAvailable: false, nonVegAllowed: false,
  basePrice: "", monthlyPrice: "", weekendPrice: "", extraGuestPrice: "", cleaningFee: "", securityDeposit: "",
  checkInTime: "14:00", checkOutTime: "11:00",
  availableFrom: "", availableTo: "",
  roomType: "Entire Apartment", mealPlan: "None", cancellationPolicy: "Moderate", notes: "",
};

export default function VendorApartment() {
  const token = localStorage.getItem("token");
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const [apartments, setApartments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [rules, setRules] = useState(DEFAULT_RULES);
  const [amenities, setAmenities] = useState([]);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => { if (!token) window.location.href = "/"; else fetchApartments(); }, []);
  useEffect(() => { applyFilters(); }, [apartments, search, filterStatus]);

  const applyFilters = () => {
    let res = [...apartments];
    if (search) res = res.filter(a => a.apartmentName?.toLowerCase().includes(search.toLowerCase()) || a.city?.toLowerCase().includes(search.toLowerCase()));
    if (filterStatus) res = res.filter(a => a.status === filterStatus);
    setFiltered(res);
  };

  const fetchApartments = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API, authHeaders);
      setApartments(res.data.data || []);
    } catch (e) { setError("Failed to load apartments"); }
    setLoading(false);
  };

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const toggleAmenity = a => setAmenities(p => p.includes(a) ? p.filter(x => x !== a) : [...p, a]);
  const toggleRule = k => setRules(p => ({ ...p, [k]: !p[k] }));

  const handleImages = e => {
    const files = Array.from(e.target.files);
    const valid = files.filter(f => f.type.startsWith("image/") && f.size <= 5 * 1024 * 1024);
    if (images.length + valid.length > 10) { setError("Max 10 images"); return; }
    setImages(p => [...p, ...valid]);
    setPreviews(p => [...p, ...valid.map(f => URL.createObjectURL(f))]);
  };

  const removeImage = i => {
    setImages(p => p.filter((_, idx) => idx !== i));
    setPreviews(p => p.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.apartmentName || !form.city || !form.basePrice) { setError("Fill all required fields"); return; }
    if (!editId && images.length === 0) { setError("Upload at least one image"); return; }
    setSubmitting(true); setError("");

    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    data.append("amenities", JSON.stringify(amenities));
    data.append("houseRules", JSON.stringify(rules));
    images.forEach(img => data.append("images", img));

    const cfg = { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } };
    try {
      if (editId) await axios.put(`${API}/${editId}`, data, cfg);
      else await axios.post(API, data, cfg);
      setSuccess(editId ? "Apartment updated!" : "Apartment added successfully!");
      closeModal(); fetchApartments();
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) { setError(e.response?.data?.message || "Operation failed"); }
    setSubmitting(false);
  };

  const startEdit = a => {
    setEditId(a._id);
    setForm({
      apartmentName: a.apartmentName || "", propertyType: a.propertyType || "Apartment",
      description: a.description || "", hostName: a.hostName || "",
      phone: a.phone || "", altPhone: a.altPhone || "", email: a.email || "",
      country: a.country || "India", state: a.state || "", city: a.city || "",
      area: a.area || "", address: a.address || "", pincode: a.pincode || "", landmark: a.landmark || "",
      lat: a.mapLocation?.lat || "", lng: a.mapLocation?.lng || "",
      buildingName: a.buildingName || "", towerName: a.towerName || "",
      floorNumber: a.floorNumber || "", totalFloors: a.totalFloors || "",
      flatNumber: a.flatNumber || "", societyName: a.societyName || "",
      apartmentType: a.apartmentType || "1BHK", furnishing: a.furnishing || "Fully Furnished",
      carpetArea: a.carpetArea || "", superArea: a.superArea || "",
      bedrooms: a.bedrooms || "", hall: a.hall || "", kitchen: a.kitchen || "",
      bathrooms: a.bathrooms || "", balcony: a.balcony || "",
      maxGuests: a.maxGuests || "", beds: a.beds || "",
      extraMattressAllowed: a.extraMattressAllowed || false,
      childrenAllowed: a.childrenAllowed || false, petsAllowed: a.petsAllowed || false,
      kitchenAvailable: a.kitchenAvailable || false, selfCookingAllowed: a.selfCookingAllowed || false,
      vegFoodAvailable: a.vegFoodAvailable || false, nonVegAllowed: a.nonVegAllowed || false,
      basePrice: a.pricing?.basePrice || "", monthlyPrice: a.pricing?.monthlyPrice || "",
      weekendPrice: a.pricing?.weekendPrice || "", extraGuestPrice: a.pricing?.extraGuestPrice || "",
      cleaningFee: a.pricing?.cleaningFee || "", securityDeposit: a.pricing?.securityDeposit || "",
      checkInTime: a.checkInTime || "14:00", checkOutTime: a.checkOutTime || "11:00",
      availableFrom: a.availableFrom?.split("T")[0] || "", availableTo: a.availableTo?.split("T")[0] || "",
      roomType: a.roomType || "Entire Apartment", mealPlan: a.mealPlan || "None",
      cancellationPolicy: a.cancellationPolicy || "Moderate", notes: a.notes || "",
    });
    setAmenities(a.amenities || []);
    setRules(a.houseRules || DEFAULT_RULES);
    setImages([]); setPreviews(a.images || []);
    setShowModal(true); setActiveTab("basic");
  };

  const handleDelete = async id => {
    try {
      await axios.delete(`${API}/${id}`, authHeaders);
      setDeleteConfirm(null); fetchApartments();
      setSuccess("Apartment deleted."); setTimeout(() => setSuccess(""), 3000);
    } catch (e) { setError("Delete failed"); }
  };

  const handleToggle = async a => {
    try {
      await axios.patch(`${API}/${a._id}/toggle`, {}, authHeaders);
      fetchApartments();
    } catch (e) { setError(e.response?.data?.message || "Toggle failed"); }
  };

  const closeModal = () => { setShowModal(false); setEditId(null); setForm(DEFAULT_FORM); setRules(DEFAULT_RULES); setAmenities([]); setImages([]); setPreviews([]); setActiveTab("basic"); setError(""); };

  const tabs = [
    { id: "basic", label: "Basic Info", icon: "🏢" },
    { id: "location", label: "Location", icon: "📍" },
    { id: "building", label: "Building", icon: "🏗️" },
    { id: "details", label: "Details", icon: "📐" },
    { id: "amenities", label: "Amenities", icon: "✨" },
    { id: "food", label: "Food", icon: "🍽️" },
    { id: "pricing", label: "Pricing", icon: "💰" },
    { id: "rules", label: "Rules", icon: "📋" },
    { id: "media", label: "Photos", icon: "📸" },
  ];

  const statusColor = s => ({ approved: "#0369a1", pending: "#d97706", rejected: "#dc2626", inactive: "#6b7280" }[s] || "#6b7280");
  const statusBg = s => ({ approved: "#e0f2fe", pending: "#fef3c7", rejected: "#fee2e2", inactive: "#f3f4f6" }[s] || "#f3f4f6");

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Outfit:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Outfit', sans-serif; }
        .ap-row:hover { background: #f0f9ff !important; }
        .ap-tab:hover { background: #e0f2fe !important; }
        .ap-tab.active { background: #0369a1 !important; color: white !important; }
        .ap-chip { cursor: pointer; transition: all .2s; }
        .ap-chip:hover { border-color: #0369a1 !important; color: #0369a1 !important; }
        .ap-chip.on { background: #0369a1 !important; color: white !important; border-color: #0369a1 !important; }
        input:focus, select:focus, textarea:focus { outline: none; border-color: #0369a1 !important; box-shadow: 0 0 0 3px rgba(3,105,161,0.12) !important; }
        .ap-submit:hover { background: #075985 !important; }
        .ap-del:hover { background: #fef2f2 !important; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #f1f5f9; } ::-webkit-scrollbar-thumb { background: #bae6fd; border-radius: 3px; }
      `}</style>

      {/* Header */}
      <div style={S.header}>
        <div>
          <h1 style={S.title}>Apartment Listings</h1>
          <p style={S.subtitle}>{apartments.length} apartments · Manage your properties</p>
        </div>
        <button onClick={() => setShowModal(true)} style={S.addBtn}>+ Add Apartment</button>
      </div>

      {/* Toasts */}
      {success && <div style={S.toast("blue")}>{success}</div>}
      {error && !showModal && <div style={S.toast("red")}>{error} <button onClick={() => setError("")} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", marginLeft: 8 }}>✕</button></div>}

      {/* Filters */}
      <div style={S.filterBar}>
        <input placeholder="🔍 Search by name or city..." value={search} onChange={e => setSearch(e.target.value)} style={S.searchInput} />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={S.filterSelect}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="inactive">Inactive</option>
        </select>
        {(search || filterStatus) && <button onClick={() => { setSearch(""); setFilterStatus(""); }} style={S.clearBtn}>Clear</button>}
        <span style={S.filterCount}>{filtered.length} of {apartments.length}</span>
      </div>

      {/* Table */}
      {loading ? (
        <div style={S.center}><div style={S.spinner} /></div>
      ) : filtered.length === 0 ? (
        <div style={S.empty}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🏢</div>
          <p style={{ fontSize: 20, fontWeight: 600, color: "#374151" }}>No apartments found</p>
          <p style={{ color: "#9ca3af", marginTop: 8 }}>Add your first apartment to get started</p>
        </div>
      ) : (
        <div style={S.tableWrap}>
          <table style={S.table}>
            <thead>
              <tr style={{ background: "#f0f9ff" }}>
                {["Apartment", "Location", "Type & Size", "Pricing", "Amenities", "Status", "Actions"].map(h => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a._id} className="ap-row" style={S.tr}>
                  <td style={S.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={S.imgWrap}>
                        {a.images?.[0] ? <img src={a.images[0]} alt="" style={S.thumb} onError={e => e.target.style.display = "none"} /> : <span style={{ fontSize: 28 }}>🏢</span>}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>{a.apartmentName}</div>
                        {a.societyName && <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{a.societyName}</div>}
                        {a.description && <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2, maxWidth: 200 }}>{a.description.substring(0, 55)}{a.description.length > 55 ? "…" : ""}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={S.td}>
                    <div style={{ fontSize: 13 }}>
                      <div style={{ fontWeight: 500 }}>{a.city}{a.state ? `, ${a.state}` : ""}</div>
                      {a.area && <div style={{ color: "#9ca3af", fontSize: 12 }}>{a.area}</div>}
                      {a.floorNumber && <div style={{ color: "#9ca3af", fontSize: 12 }}>Floor {a.floorNumber}{a.totalFloors ? `/${a.totalFloors}` : ""}</div>}
                    </div>
                  </td>
                  <td style={S.td}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <span style={S.typeBadge}>{a.apartmentType || "Apartment"}</span>
                      {a.furnishing && <span style={{ fontSize: 11, color: "#6b7280" }}>{a.furnishing}</span>}
                      <span style={{ fontSize: 11, color: "#9ca3af" }}>
                        {[a.bedrooms && `${a.bedrooms}BR`, a.bathrooms && `${a.bathrooms}BA`, a.maxGuests && `${a.maxGuests} guests`].filter(Boolean).join(" · ")}
                      </span>
                    </div>
                  </td>
                  <td style={S.td}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#0369a1" }}>₹{a.pricing?.basePrice?.toLocaleString("en-IN") || "—"}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>per night</div>
                    {a.pricing?.monthlyPrice && <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>₹{Number(a.pricing.monthlyPrice).toLocaleString("en-IN")}/mo</div>}
                  </td>
                  <td style={S.td}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, maxWidth: 160 }}>
                      {(a.amenities || []).slice(0, 3).map((am, i) => <span key={i} style={S.pill}>{am}</span>)}
                      {(a.amenities?.length || 0) > 3 && <span style={S.pill}>+{a.amenities.length - 3}</span>}
                      {!a.amenities?.length && <span style={{ color: "#9ca3af", fontSize: 12 }}>None</span>}
                    </div>
                  </td>
                  <td style={S.td}>
                    <span style={{ ...S.statusBadge, background: statusBg(a.status), color: statusColor(a.status) }}>
                      {a.status || "pending"}
                    </span>
                    {(a.status === "approved" || a.status === "inactive") && (
                      <button onClick={() => handleToggle(a)} style={{ display: "block", marginTop: 6, fontSize: 11, background: "none", border: "1px solid #d1d5db", borderRadius: 4, padding: "2px 8px", cursor: "pointer", color: "#6b7280" }}>
                        {a.status === "approved" ? "Deactivate" : "Activate"}
                      </button>
                    )}
                  </td>
                  <td style={S.td}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => startEdit(a)} style={S.editBtn} title="Edit">✏️</button>
                      <button onClick={() => setDeleteConfirm(a._id)} className="ap-del" style={S.deleteBtn} title="Delete">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div style={S.overlay} onClick={() => setDeleteConfirm(null)}>
          <div style={{ ...S.modal, maxWidth: 400, padding: 32, textAlign: "center" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Delete Apartment?</h3>
            <p style={{ color: "#6b7280", marginBottom: 24 }}>This action cannot be undone.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button onClick={() => setDeleteConfirm(null)} style={S.cancelBtn}>Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} style={{ ...S.addBtn, background: "#dc2626" }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div style={S.overlay} onClick={closeModal}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={S.modalHead}>
              <div>
                <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800 }}>
                  {editId ? "Edit Apartment" : "Add New Apartment"}
                </h2>
                <p style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>Fill in all the details carefully</p>
              </div>
              <button onClick={closeModal} style={S.closeBtn}>✕</button>
            </div>

            {error && <div style={{ margin: "0 32px", padding: "10px 16px", background: "#fee2e2", color: "#dc2626", borderRadius: 8, fontSize: 14 }}>{error}</div>}

            {/* Tabs */}
            <div style={S.tabsRow}>
              {tabs.map(t => (
                <button key={t.id} className={`ap-tab ${activeTab === t.id ? "active" : ""}`} onClick={() => setActiveTab(t.id)} style={S.tabBtn}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              <div style={S.formBody}>

                {/* ── BASIC INFO ── */}
                {activeTab === "basic" && (
                  <div style={S.grid2}>
                    <div style={{ gridColumn: "1/-1" }}>
                      <Label>Apartment Name *</Label>
                      <Input value={form.apartmentName} onChange={v => f("apartmentName", v)} placeholder="e.g., Skyline 2BHK Apartment" required />
                    </div>
                    <div>
                      <Label>Host Name</Label>
                      <Input value={form.hostName} onChange={v => f("hostName", v)} placeholder="Owner / host name" />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input value={form.phone} onChange={v => f("phone", v)} placeholder="+91 XXXXX XXXXX" />
                    </div>
                    <div>
                      <Label>Alternate Phone</Label>
                      <Input value={form.altPhone} onChange={v => f("altPhone", v)} placeholder="+91 XXXXX XXXXX" />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input type="email" value={form.email} onChange={v => f("email", v)} placeholder="host@email.com" />
                    </div>
                    <div style={{ gridColumn: "1/-1" }}>
                      <Label>Description</Label>
                      <textarea value={form.description} onChange={e => f("description", e.target.value)} placeholder="Describe your apartment — layout, views, neighbourhood, nearby attractions..." style={{ ...S.input, minHeight: 100, resize: "vertical" }} />
                    </div>
                    <div>
                      <Label>Room Type</Label>
                      <Select value={form.roomType} onChange={v => f("roomType", v)} options={ROOM_TYPES} />
                    </div>
                    <div>
                      <Label>Meal Plan</Label>
                      <Select value={form.mealPlan} onChange={v => f("mealPlan", v)} options={MEAL_PLANS} />
                    </div>
                    <div>
                      <Label>Cancellation Policy</Label>
                      <Select value={form.cancellationPolicy} onChange={v => f("cancellationPolicy", v)} options={CANCELLATION} />
                    </div>
                    <div>
                      <Label>Internal Notes</Label>
                      <Input value={form.notes} onChange={v => f("notes", v)} placeholder="Notes (optional)" />
                    </div>
                  </div>
                )}

                {/* ── LOCATION ── */}
                {activeTab === "location" && (
                  <div style={S.grid2}>
                    <div style={{ gridColumn: "1/-1" }}>
                      <Label>Full Address *</Label>
                      <Input value={form.address} onChange={v => f("address", v)} placeholder="Flat no, building, street..." required />
                    </div>
                    <div>
                      <Label>City *</Label>
                      <Input value={form.city} onChange={v => f("city", v)} placeholder="e.g., Mumbai" required />
                    </div>
                    <div>
                      <Label>Area / Locality</Label>
                      <Input value={form.area} onChange={v => f("area", v)} placeholder="e.g., Bandra West" />
                    </div>
                    <div>
                      <Label>State</Label>
                      <Input value={form.state} onChange={v => f("state", v)} placeholder="e.g., Maharashtra" />
                    </div>
                    <div>
                      <Label>Pincode</Label>
                      <Input value={form.pincode} onChange={v => f("pincode", v)} placeholder="e.g., 400050" />
                    </div>
                    <div>
                      <Label>Country</Label>
                      <Input value={form.country} onChange={v => f("country", v)} placeholder="India" />
                    </div>
                    <div>
                      <Label>Landmark</Label>
                      <Input value={form.landmark} onChange={v => f("landmark", v)} placeholder="Near XYZ mall" />
                    </div>
                    <div>
                      <Label>Latitude</Label>
                      <Input value={form.lat} onChange={v => f("lat", v)} placeholder="e.g., 19.0760" />
                    </div>
                    <div>
                      <Label>Longitude</Label>
                      <Input value={form.lng} onChange={v => f("lng", v)} placeholder="e.g., 72.8777" />
                    </div>
                  </div>
                )}

                {/* ── BUILDING ── */}
                {activeTab === "building" && (
                  <div style={S.grid2}>
                    <div>
                      <Label>Building Name</Label>
                      <Input value={form.buildingName} onChange={v => f("buildingName", v)} placeholder="e.g., Oberoi Splendor" />
                    </div>
                    <div>
                      <Label>Society / Complex Name</Label>
                      <Input value={form.societyName} onChange={v => f("societyName", v)} placeholder="e.g., Green Park Society" />
                    </div>
                    <div>
                      <Label>Tower Name</Label>
                      <Input value={form.towerName} onChange={v => f("towerName", v)} placeholder="e.g., Tower A" />
                    </div>
                    <div>
                      <Label>Flat Number</Label>
                      <Input value={form.flatNumber} onChange={v => f("flatNumber", v)} placeholder="e.g., 1204" />
                    </div>
                    <div>
                      <Label>Floor Number</Label>
                      <Input type="number" value={form.floorNumber} onChange={v => f("floorNumber", v)} placeholder="e.g., 12" />
                    </div>
                    <div>
                      <Label>Total Floors in Building</Label>
                      <Input type="number" value={form.totalFloors} onChange={v => f("totalFloors", v)} placeholder="e.g., 25" />
                    </div>
                  </div>
                )}

                {/* ── APARTMENT DETAILS ── */}
                {activeTab === "details" && (
                  <div>
                    <div style={S.grid2}>
                      <div>
                        <Label>Apartment Type</Label>
                        <Select value={form.apartmentType} onChange={v => f("apartmentType", v)} options={APARTMENT_TYPES} />
                      </div>
                      <div>
                        <Label>Furnishing</Label>
                        <Select value={form.furnishing} onChange={v => f("furnishing", v)} options={FURNISHING_TYPES} />
                      </div>
                      <div>
                        <Label>Carpet Area (sq ft)</Label>
                        <Input value={form.carpetArea} onChange={v => f("carpetArea", v)} placeholder="e.g., 850" />
                      </div>
                      <div>
                        <Label>Super Area (sq ft)</Label>
                        <Input value={form.superArea} onChange={v => f("superArea", v)} placeholder="e.g., 1100" />
                      </div>
                    </div>
                    <div style={{ ...S.grid4, marginTop: 20 }}>
                      {[["bedrooms", "Bedrooms"], ["hall", "Hall"], ["kitchen", "Kitchen"], ["bathrooms", "Bathrooms"], ["balcony", "Balcony"], ["maxGuests", "Max Guests"], ["beds", "Beds"]].map(([k, l]) => (
                        <div key={k}>
                          <Label>{l}</Label>
                          <Input type="number" min="0" value={form[k]} onChange={v => f(k, v)} placeholder="0" />
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 24 }}>
                      <Label>Availability & Timings</Label>
                      <div style={{ ...S.grid2, marginTop: 12 }}>
                        {[["availableFrom", "Available From", "date"], ["availableTo", "Available To", "date"], ["checkInTime", "Check-In Time", "time"], ["checkOutTime", "Check-Out Time", "time"]].map(([k, l, t]) => (
                          <div key={k}>
                            <Label>{l}</Label>
                            <Input type={t} value={form[k]} onChange={v => f(k, v)} />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ marginTop: 24 }}>
                      <Label>Guest Policy</Label>
                      <div style={S.checkGrid}>
                        {[["extraMattressAllowed", "Extra Mattress Allowed"], ["childrenAllowed", "Children Allowed"], ["petsAllowed", "Pets Allowed"]].map(([k, l]) => (
                          <label key={k} style={S.checkLabel}>
                            <input type="checkbox" checked={form[k]} onChange={e => f(k, e.target.checked)} style={{ width: 16, height: 16, accentColor: "#0369a1" }} />
                            {l}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── AMENITIES ── */}
                {activeTab === "amenities" && (
                  <div>
                    <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 16 }}>Select all amenities available in your apartment</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                      {AMENITIES.map(a => (
                        <button key={a} type="button" className={`ap-chip ${amenities.includes(a) ? "on" : ""}`} onClick={() => toggleAmenity(a)} style={S.chip}>
                          {a}
                        </button>
                      ))}
                    </div>
                    <p style={{ marginTop: 16, fontSize: 13, color: "#9ca3af" }}>{amenities.length} amenities selected</p>
                  </div>
                )}

                {/* ── FOOD ── */}
                {activeTab === "food" && (
                  <div>
                    <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 20 }}>Configure food and kitchen availability</p>
                    <div style={S.checkGrid}>
                      {[["kitchenAvailable", "Kitchen Available"], ["selfCookingAllowed", "Self Cooking Allowed"], ["vegFoodAvailable", "Veg Food Available"], ["nonVegAllowed", "Non-Veg Allowed"]].map(([k, l]) => (
                        <label key={k} style={S.checkLabel}>
                          <input type="checkbox" checked={form[k]} onChange={e => f(k, e.target.checked)} style={{ width: 16, height: 16, accentColor: "#0369a1" }} />
                          {l}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── PRICING ── */}
                {activeTab === "pricing" && (
                  <div style={S.grid2}>
                    <div>
                      <Label>Base Price / Night (₹) *</Label>
                      <Input type="number" min="0" value={form.basePrice} onChange={v => f("basePrice", v)} placeholder="e.g., 2500" required />
                    </div>
                    <div>
                      <Label>Monthly Price (₹)</Label>
                      <Input type="number" min="0" value={form.monthlyPrice} onChange={v => f("monthlyPrice", v)} placeholder="e.g., 35000" />
                    </div>
                    <div>
                      <Label>Weekend Price (₹)</Label>
                      <Input type="number" min="0" value={form.weekendPrice} onChange={v => f("weekendPrice", v)} placeholder="e.g., 3000" />
                    </div>
                    <div>
                      <Label>Extra Guest Price (₹)</Label>
                      <Input type="number" min="0" value={form.extraGuestPrice} onChange={v => f("extraGuestPrice", v)} placeholder="e.g., 400" />
                    </div>
                    <div>
                      <Label>Cleaning Fee (₹)</Label>
                      <Input type="number" min="0" value={form.cleaningFee} onChange={v => f("cleaningFee", v)} placeholder="e.g., 250" />
                    </div>
                    <div>
                      <Label>Security Deposit (₹)</Label>
                      <Input type="number" min="0" value={form.securityDeposit} onChange={v => f("securityDeposit", v)} placeholder="e.g., 10000" />
                    </div>
                    {form.basePrice && (
                      <div style={{ gridColumn: "1/-1", background: "#e0f2fe", borderRadius: 10, padding: 16, border: "1px solid #bae6fd" }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#0369a1", marginBottom: 8 }}>Pricing Summary</p>
                        <div style={{ fontSize: 13, color: "#374151", display: "flex", flexDirection: "column", gap: 4 }}>
                          <span>Nightly: ₹{Number(form.basePrice).toLocaleString("en-IN")}/night</span>
                          {form.monthlyPrice && <span>Monthly: ₹{Number(form.monthlyPrice).toLocaleString("en-IN")}/month</span>}
                          {form.weekendPrice && <span>Weekend: ₹{Number(form.weekendPrice).toLocaleString("en-IN")}/night</span>}
                          {form.securityDeposit && <span>Security Deposit: ₹{Number(form.securityDeposit).toLocaleString("en-IN")}</span>}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── RULES ── */}
                {activeTab === "rules" && (
                  <div>
                    <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 20 }}>Define house rules for your guests</p>
                    <div style={S.grid2}>
                      {Object.keys(rules).map(k => (
                        <label key={k} style={{ ...S.checkLabel, background: rules[k] ? "#e0f2fe" : "#f9fafb", padding: "12px 16px", borderRadius: 10, border: `1px solid ${rules[k] ? "#bae6fd" : "#e5e7eb"}`, cursor: "pointer" }}>
                          <input type="checkbox" checked={rules[k]} onChange={() => toggleRule(k)} style={{ width: 16, height: 16, accentColor: "#0369a1" }} />
                          <span style={{ fontWeight: 500 }}>{RULE_LABELS[k]}</span>
                          <span style={{ marginLeft: "auto", fontSize: 12, color: rules[k] ? "#0369a1" : "#9ca3af", fontWeight: 600 }}>{rules[k] ? "✓ Allowed" : "✗ Not Allowed"}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── MEDIA ── */}
                {activeTab === "media" && (
                  <div>
                    <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 16 }}>Upload apartment photos. First image will be the main display image. Max 10 images, 5MB each.</p>
                    <div style={S.imgGrid}>
                      {previews.map((src, i) => (
                        <div key={i} style={S.previewItem}>
                          <img src={typeof src === "string" ? src : URL.createObjectURL(src)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }} onError={e => e.target.style.display = "none"} />
                          {i < images.length && (
                            <button type="button" onClick={() => removeImage(i)} style={S.removeImg}>✕</button>
                          )}
                          {i === 0 && <span style={S.mainBadge}>Main</span>}
                        </div>
                      ))}
                      {previews.length < 10 && (
                        <label style={S.uploadZone}>
                          <span style={{ fontSize: 32, display: "block" }}>+</span>
                          <span style={{ fontSize: 13, color: "#9ca3af" }}>Add Photos</span>
                          <input type="file" multiple accept="image/*" hidden onChange={handleImages} />
                        </label>
                      )}
                    </div>
                    <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 12 }}>{previews.length}/10 images uploaded</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div style={S.modalFoot}>
                <div style={{ display: "flex", gap: 8 }}>
                  {tabs.findIndex(t => t.id === activeTab) > 0 && (
                    <button type="button" onClick={() => setActiveTab(tabs[tabs.findIndex(t => t.id === activeTab) - 1].id)} style={S.cancelBtn}>← Back</button>
                  )}
                  {tabs.findIndex(t => t.id === activeTab) < tabs.length - 1 && (
                    <button type="button" onClick={() => setActiveTab(tabs[tabs.findIndex(t => t.id === activeTab) + 1].id)} style={S.nextBtn}>Next →</button>
                  )}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" onClick={closeModal} style={S.cancelBtn}>Cancel</button>
                  <button type="submit" className="ap-submit" style={S.submitBtn} disabled={submitting}>
                    {submitting ? "⏳ Saving..." : editId ? "💾 Update Apartment" : "✓ Add Apartment"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Sub-components ── */
const Label = ({ children }) => <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>{children}</label>;
const Input = ({ onChange, ...props }) => <input {...props} onChange={e => onChange(e.target.value)} style={S.input} />;
const Select = ({ value, onChange, options }) => (
  <select value={value} onChange={e => onChange(e.target.value)} style={S.input}>
    {options.map(o => <option key={o} value={o}>{o}</option>)}
  </select>
);

/* ── Styles ── */
const S = {
  page: { maxWidth: 1400, margin: "0 auto", padding: "32px 24px", fontFamily: "'Outfit', sans-serif", background: "#f0f9ff", minHeight: "100vh" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 16 },
  title: { fontFamily: "'Syne', sans-serif", fontSize: 32, fontWeight: 800, color: "#0c4a6e" },
  subtitle: { fontSize: 14, color: "#7ea8c4", marginTop: 6 },
  addBtn: { padding: "12px 24px", background: "#0369a1", color: "white", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  toast: c => ({ position: "fixed", top: 20, right: 20, zIndex: 9999, padding: "14px 20px", background: c === "blue" ? "#0369a1" : "#dc2626", color: "white", borderRadius: 10, fontSize: 14, fontWeight: 500, boxShadow: "0 4px 20px rgba(0,0,0,.15)", display: "flex", alignItems: "center", gap: 8 }),
  filterBar: { display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" },
  searchInput: { flex: 1, minWidth: 220, padding: "10px 16px", border: "1.5px solid #bae6fd", borderRadius: 8, fontSize: 14, fontFamily: "inherit", background: "white" },
  filterSelect: { padding: "10px 16px", border: "1.5px solid #bae6fd", borderRadius: 8, fontSize: 14, fontFamily: "inherit", background: "white" },
  clearBtn: { padding: "10px 16px", background: "#e0f2fe", border: "1.5px solid #bae6fd", borderRadius: 8, fontSize: 14, cursor: "pointer", fontFamily: "inherit", color: "#0369a1" },
  filterCount: { fontSize: 13, color: "#7ea8c4", whiteSpace: "nowrap" },
  center: { display: "flex", justifyContent: "center", alignItems: "center", height: 300 },
  spinner: { width: 40, height: 40, border: "3px solid #bae6fd", borderTop: "3px solid #0369a1", borderRadius: "50%", animation: "spin 1s linear infinite" },
  empty: { textAlign: "center", padding: 80, background: "white", borderRadius: 16, boxShadow: "0 1px 4px rgba(0,0,0,.06)" },
  tableWrap: { background: "white", borderRadius: 16, boxShadow: "0 1px 4px rgba(0,0,0,.06)", overflow: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "14px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#0369a1", textTransform: "uppercase", letterSpacing: .5, borderBottom: "1px solid #e0f2fe" },
  tr: { borderBottom: "1px solid #f0f9ff", transition: "background .15s" },
  td: { padding: "14px 16px", fontSize: 14, color: "#374151", verticalAlign: "middle" },
  imgWrap: { width: 64, height: 52, borderRadius: 8, overflow: "hidden", background: "#e0f2fe", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" },
  thumb: { width: "100%", height: "100%", objectFit: "cover" },
  typeBadge: { fontSize: 12, fontWeight: 600, color: "#0369a1", background: "#e0f2fe", padding: "4px 10px", borderRadius: 20 },
  pill: { fontSize: 11, background: "#f0f9ff", color: "#0369a1", padding: "2px 8px", borderRadius: 4, fontWeight: 500, border: "1px solid #bae6fd" },
  statusBadge: { fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20, display: "inline-block" },
  editBtn: { padding: "8px 10px", background: "#e0f2fe", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 15 },
  deleteBtn: { padding: "8px 10px", background: "#fff5f5", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 15 },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20, backdropFilter: "blur(4px)" },
  modal: { background: "white", borderRadius: 20, width: "100%", maxWidth: 900, maxHeight: "92vh", overflow: "auto", boxShadow: "0 25px 80px rgba(0,0,0,.25)", display: "flex", flexDirection: "column" },
  modalHead: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "24px 32px", borderBottom: "1px solid #e0f2fe", position: "sticky", top: 0, background: "white", zIndex: 10 },
  closeBtn: { background: "#e0f2fe", border: "none", borderRadius: 8, width: 36, height: 36, fontSize: 18, cursor: "pointer", color: "#0369a1", display: "flex", alignItems: "center", justifyContent: "center" },
  tabsRow: { display: "flex", gap: 0, padding: "0 32px", borderBottom: "1px solid #e0f2fe", overflowX: "auto", flexShrink: 0 },
  tabBtn: { padding: "12px 14px", background: "none", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", color: "#6b7280", borderBottom: "2px solid transparent", fontFamily: "inherit", borderRadius: 0 },
  formBody: { padding: "24px 32px", flex: 1, overflowY: "auto" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  grid4: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 },
  input: { width: "100%", padding: "10px 14px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 14, fontFamily: "inherit", background: "white", transition: "border .2s, box-shadow .2s" },
  checkGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 },
  checkLabel: { display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#374151", cursor: "pointer" },
  chip: { padding: "8px 16px", border: "1.5px solid #e5e7eb", borderRadius: 20, background: "white", fontSize: 13, fontWeight: 500, color: "#6b7280", fontFamily: "inherit" },
  imgGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, 110px)", gap: 12 },
  previewItem: { width: 110, height: 90, borderRadius: 8, overflow: "visible", position: "relative" },
  removeImg: { position: "absolute", top: -8, right: -8, background: "#dc2626", color: "white", border: "none", borderRadius: "50%", width: 22, height: 22, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  mainBadge: { position: "absolute", bottom: -8, left: 4, background: "#0369a1", color: "white", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4 },
  uploadZone: { width: 110, height: 90, border: "2px dashed #bae6fd", borderRadius: 8, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#9ca3af", gap: 4 },
  modalFoot: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 32px", borderTop: "1px solid #e0f2fe", position: "sticky", bottom: 0, background: "white" },
  cancelBtn: { padding: "10px 20px", background: "#f3f4f6", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: "#374151" },
  nextBtn: { padding: "10px 20px", background: "#e0f2fe", border: "1px solid #bae6fd", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: "#0369a1" },
  submitBtn: { padding: "10px 24px", background: "#0369a1", color: "white", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "background .2s" },
};