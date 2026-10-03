

import React, { useEffect, useState } from "react";
import axios from "axios";
import {  message } from 'antd';

const API = "https://bmtvendorfinal.onrender.com/api/vendor/homestay";

const AMENITIES = ["WiFi", "AC", "TV", "Parking", "Kitchen", "Washing Machine", "Geyser", "Swimming Pool", "Garden", "Balcony", "Power Backup", "CCTV", "Fire Extinguisher", "First Aid Kit"];
const PROPERTY_TYPES = ["Homestay", "Villa", "Apartment", "Cottage", "Farmhouse"];
const MEAL_PLANS = ["None", "Breakfast Only", "Half Board", "Full Board", "All Inclusive"];
const ROOM_TYPES = ["Entire Property", "Private Room", "Shared Room"];
const CANCELLATION = ["Flexible", "Moderate", "Strict", "Non-Refundable"];

const DEFAULT_RULES = { smoking: false, alcohol: false, parties: false, loudMusic: false, unmarriedCouples: false, localIdAllowed: false };
const RULE_LABELS = { smoking: "Smoking", alcohol: "Alcohol", parties: "Parties", loudMusic: "Loud Music", unmarriedCouples: "Unmarried Couples", localIdAllowed: "Local ID Accepted" };

const DEFAULT_FORM = {
  propertyName: "", propertyType: "Homestay", description: "", hostName: "",
  phone: "", altPhone: "", email: "",
  country: "India", state: "", city: "", area: "", address: "", pincode: "", landmark: "",
  lat: "", lng: "",
  maxGuests: "", bedrooms: "", bathrooms: "", beds: "",
  extraMattressAllowed: false, childrenAllowed: false, petsAllowed: false,
  kitchenAvailable: false, selfCookingAllowed: false, vegFoodAvailable: false, nonVegAllowed: false,
  basePrice: "", weekendPrice: "", extraGuestPrice: "", cleaningFee: "", securityDeposit: "",
  checkInTime: "14:00", checkOutTime: "11:00",
  availableFrom: "", availableTo: "",
  roomType: "Entire Property", mealPlan: "None", cancellationPolicy: "Moderate", notes: "",
};

export default function VendorHomestay() {
  const token = localStorage.getItem("token");
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const [homestays, setHomestays] = useState([]);
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

  useEffect(() => { if (!token) window.location.href = "/"; else fetchHomestays(); }, []);
  useEffect(() => { applyFilters(); }, [homestays, search, filterStatus]);

  const applyFilters = () => {
    let res = [...homestays];
    if (search) res = res.filter(h => h.propertyName?.toLowerCase().includes(search.toLowerCase()) || h.city?.toLowerCase().includes(search.toLowerCase()));
    if (filterStatus) res = res.filter(h => h.status === filterStatus);
    setFiltered(res);
  };

  const fetchHomestays = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API, authHeaders);
      setHomestays(res.data.data || []);
    } catch (e) { setError("Failed to load homestays"); }
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
    if (!form.propertyName || !form.city || !form.basePrice) { setError("Fill all required fields"); return; }
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
      setSuccess(editId ? "Homestay updated!" : "Homestay added successfully!");
      closeModal(); fetchHomestays();
      setTimeout(() => setSuccess(""), 3000);
    } catch (e)
     { 
      message.error(e.response?.data?.message || "Operation failed");
      
      setError(e.response?.data?.message || "Operation failed");
     }
    setSubmitting(false);
  };

  const startEdit = h => {
    setEditId(h._id);
    setForm({
      propertyName: h.propertyName || "", propertyType: h.propertyType || "Homestay",
      description: h.description || "", hostName: h.hostName || "",
      phone: h.phone || "", altPhone: h.altPhone || "", email: h.email || "",
      country: h.country || "India", state: h.state || "", city: h.city || "",
      area: h.area || "", address: h.address || "", pincode: h.pincode || "", landmark: h.landmark || "",
      lat: h.mapLocation?.lat || "", lng: h.mapLocation?.lng || "",
      maxGuests: h.maxGuests || "", bedrooms: h.bedrooms || "", bathrooms: h.bathrooms || "", beds: h.beds || "",
      extraMattressAllowed: h.extraMattressAllowed || false, childrenAllowed: h.childrenAllowed || false, petsAllowed: h.petsAllowed || false,
      kitchenAvailable: h.kitchenAvailable || false, selfCookingAllowed: h.selfCookingAllowed || false,
      vegFoodAvailable: h.vegFoodAvailable || false, nonVegAllowed: h.nonVegAllowed || false,
      basePrice: h.pricing?.basePrice || "", weekendPrice: h.pricing?.weekendPrice || "",
      extraGuestPrice: h.pricing?.extraGuestPrice || "", cleaningFee: h.pricing?.cleaningFee || "",
      securityDeposit: h.pricing?.securityDeposit || "",
      checkInTime: h.checkInTime || "14:00", checkOutTime: h.checkOutTime || "11:00",
      availableFrom: h.availableFrom?.split("T")[0] || "", availableTo: h.availableTo?.split("T")[0] || "",
      roomType: h.roomType || "Entire Property", mealPlan: h.mealPlan || "None",
      cancellationPolicy: h.cancellationPolicy || "Moderate", notes: h.notes || "",
    });
    setAmenities(h.amenities || []);
    setRules(h.houseRules || DEFAULT_RULES);
    setImages([]); setPreviews(h.images || []);
    setShowModal(true); setActiveTab("basic");
  };

  const handleDelete = async id => {
    try {
      await axios.delete(`${API}/${id}`, authHeaders);
      setDeleteConfirm(null); fetchHomestays();
      setSuccess("Homestay deleted."); setTimeout(() => setSuccess(""), 3000);
    } catch (e) { setError("Delete failed"); }
  };

  const handleToggle = async h => {
    try {
      await axios.patch(`${API}/${h._id}/toggle`, {}, authHeaders);
      fetchHomestays();
    } catch (e) { setError(e.response?.data?.message || "Toggle failed"); }
  };

  const closeModal = () => { setShowModal(false); setEditId(null); setForm(DEFAULT_FORM); setRules(DEFAULT_RULES); setAmenities([]); setImages([]); setPreviews([]); setActiveTab("basic"); setError(""); };

  const tabs = [
    { id: "basic", label: "Basic Info", icon: "🏠" },
    { id: "location", label: "Location", icon: "📍" },
    { id: "capacity", label: "Capacity", icon: "👥" },
    { id: "amenities", label: "Amenities", icon: "✨" },
    { id: "food", label: "Food & Meals", icon: "🍽️" },
    { id: "pricing", label: "Pricing", icon: "💰" },
    { id: "rules", label: "Rules", icon: "📋" },
    { id: "media", label: "Photos", icon: "📸" },
  ];

  const statusColor = s => ({ approved: "#16a34a", pending: "#d97706", rejected: "#dc2626", inactive: "#6b7280" }[s] || "#6b7280");
  const statusBg = s => ({ approved: "#dcfce7", pending: "#fef3c7", rejected: "#fee2e2", inactive: "#f3f4f6" }[s] || "#f3f4f6");

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; }
        .hs-row:hover { background: #fafaf9 !important; }
        .hs-tab:hover { background: #f0fdf4 !important; }
        .hs-tab.active { background: #166534 !important; color: white !important; }
        .hs-btn-ghost:hover { background: #f0fdf4 !important; }
        .hs-chip { cursor: pointer; transition: all .2s; }
        .hs-chip:hover { border-color: #166534 !important; color: #166534 !important; }
        .hs-chip.on { background: #166534 !important; color: white !important; border-color: #166534 !important; }
        input:focus, select:focus, textarea:focus { outline: none; border-color: #166534 !important; box-shadow: 0 0 0 3px rgba(22,101,52,0.1) !important; }
        .hs-submit:hover { background: #14532d !important; }
        .hs-del:hover { background: #fef2f2 !important; }
        .hs-toggle:hover { opacity: .8; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #f1f5f9; } ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
      `}</style>

      {/* Header */}
      <div style={S.header}>
        <div>
          <h1 style={S.title}>Homestay Listings</h1>
          <p style={S.subtitle}>{homestays.length} properties · Manage your stays</p>
        </div>
        <button onClick={() => setShowModal(true)} style={S.addBtn}>+ Add New Property</button>
      </div>

      {/* Toasts */}
      {success && <div style={S.toast("green")}>{success}</div>}
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
        <span style={S.filterCount}>{filtered.length} of {homestays.length}</span>
      </div>

      {/* Table */}
      {loading ? (
        <div style={S.center}><div style={S.spinner} /></div>
      ) : filtered.length === 0 ? (
        <div style={S.empty}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🏠</div>
          <p style={{ fontSize: 20, fontWeight: 600, color: "#374151" }}>No homestays found</p>
          <p style={{ color: "#9ca3af", marginTop: 8 }}>Add your first property to get started</p>
        </div>
      ) : (
        <div style={S.tableWrap}>
          <table style={S.table}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                {["Property", "Location", "Type", "Pricing", "Amenities", "Status", "Actions"].map(h => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(h => (
                <tr key={h._id} className="hs-row" style={S.tr}>
                  <td style={S.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={S.imgWrap}>
                        {h.images?.[0] ? <img src={h.images[0]} alt="" style={S.thumb} onError={e => e.target.style.display = "none"} /> : <span style={{ fontSize: 28 }}>🏠</span>}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>{h.propertyName}</div>
                        {h.hostName && <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>Host: {h.hostName}</div>}
                        {h.description && <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2, maxWidth: 200 }}>{h.description.substring(0, 55)}{h.description.length > 55 ? "…" : ""}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={S.td}>
                    <div style={{ fontSize: 13 }}>
                      <div style={{ fontWeight: 500 }}>{h.city}{h.state ? `, ${h.state}` : ""}</div>
                      {h.area && <div style={{ color: "#9ca3af", fontSize: 12 }}>{h.area}</div>}
                    </div>
                  </td>
                  <td style={S.td}><span style={S.typeBadge}>{h.propertyType}</span></td>
                  <td style={S.td}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#166534" }}>₹{h.pricing?.basePrice?.toLocaleString("en-IN") || "—"}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>per night</div>
                  </td>
                  <td style={S.td}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, maxWidth: 160 }}>
                      {(h.amenities || []).slice(0, 3).map((a, i) => <span key={i} style={S.pill}>{a}</span>)}
                      {(h.amenities?.length || 0) > 3 && <span style={S.pill}>+{h.amenities.length - 3}</span>}
                      {!h.amenities?.length && <span style={{ color: "#9ca3af", fontSize: 12 }}>None</span>}
                    </div>
                  </td>
                  <td style={S.td}>
                    <span style={{ ...S.statusBadge, background: statusBg(h.status), color: statusColor(h.status) }}>
                      {h.status || "pending"}
                    </span>
                    {(h.status === "approved" || h.status === "inactive") && (
                      <button onClick={() => handleToggle(h)} className="hs-toggle" style={{ display: "block", marginTop: 6, fontSize: 11, background: "none", border: "1px solid #d1d5db", borderRadius: 4, padding: "2px 8px", cursor: "pointer", color: "#6b7280" }}>
                        {h.status === "approved" ? "Deactivate" : "Activate"}
                      </button>
                    )}
                  </td>
                  <td style={S.td}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => startEdit(h)} style={S.editBtn} title="Edit">✏️</button>
                      <button onClick={() => setDeleteConfirm(h._id)} className="hs-del" style={S.deleteBtn} title="Delete">🗑️</button>
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
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Delete Homestay?</h3>
            <p style={{ color: "#6b7280", marginBottom: 24 }}>This action cannot be undone.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button onClick={() => setDeleteConfirm(null)} style={S.cancelBtn}>Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} style={{ ...S.addBtn, background: "#dc2626" }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div style={S.overlay} onClick={closeModal}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={S.modalHead}>
              <div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700 }}>
                  {editId ? "Edit Homestay" : "Add New Homestay"}
                </h2>
                <p style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>Fill in the details below</p>
              </div>
              <button onClick={closeModal} style={S.closeBtn}>✕</button>
            </div>

            {error && <div style={{ margin: "0 32px", padding: "10px 16px", background: "#fee2e2", color: "#dc2626", borderRadius: 8, fontSize: 14 }}>{error}</div>}

            {/* Tabs */}
            <div style={S.tabsRow}>
              {tabs.map(t => (
                <button key={t.id} className={`hs-tab ${activeTab === t.id ? "active" : ""}`} onClick={() => setActiveTab(t.id)} style={S.tabBtn}>
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
                      <Label>Property Name *</Label>
                      <Input value={form.propertyName} onChange={v => f("propertyName", v)} placeholder="e.g., Sunrise Mountain Villa" required />
                    </div>
                    <div>
                      <Label>Property Type *</Label>
                      <Select value={form.propertyType} onChange={v => f("propertyType", v)} options={PROPERTY_TYPES} />
                    </div>
                    <div>
                      <Label>Host Name</Label>
                      <Input value={form.hostName} onChange={v => f("hostName", v)} placeholder="Host full name" />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input value={form.phone} onChange={v => f("phone", v)} placeholder="+91 XXXXX XXXXX" />
                    </div>
                    <div>
                      <Label>Alternate Phone</Label>
                      <Input value={form.altPhone} onChange={v => f("altPhone", v)} placeholder="+91 XXXXX XXXXX" />
                    </div>
                    <div style={{ gridColumn: "1/-1" }}>
                      <Label>Email</Label>
                      <Input value={form.email} onChange={v => f("email", v)} placeholder="host@email.com" type="email" />
                    </div>
                    <div style={{ gridColumn: "1/-1" }}>
                      <Label>Description</Label>
                      <textarea value={form.description} onChange={e => f("description", e.target.value)} placeholder="Describe your property — unique features, surroundings, experience..." style={{ ...S.input, minHeight: 100, resize: "vertical" }} />
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
                      <Input value={form.notes} onChange={v => f("notes", v)} placeholder="Admin notes (optional)" />
                    </div>
                  </div>
                )}

                {/* ── LOCATION ── */}
                {activeTab === "location" && (
                  <div style={S.grid2}>
                    <div style={{ gridColumn: "1/-1" }}>
                      <Label>Full Address *</Label>
                      <Input value={form.address} onChange={v => f("address", v)} placeholder="Street, building, area" required />
                    </div>
                    <div>
                      <Label>City *</Label>
                      <Input value={form.city} onChange={v => f("city", v)} placeholder="e.g., Manali" required />
                    </div>
                    <div>
                      <Label>Area / Locality</Label>
                      <Input value={form.area} onChange={v => f("area", v)} placeholder="e.g., Old Manali" />
                    </div>
                    <div>
                      <Label>State</Label>
                      <Input value={form.state} onChange={v => f("state", v)} placeholder="e.g., Himachal Pradesh" />
                    </div>
                    <div>
                      <Label>Pincode</Label>
                      <Input value={form.pincode} onChange={v => f("pincode", v)} placeholder="e.g., 175131" />
                    </div>
                    <div>
                      <Label>Country</Label>
                      <Input value={form.country} onChange={v => f("country", v)} placeholder="India" />
                    </div>
                    <div>
                      <Label>Landmark</Label>
                      <Input value={form.landmark} onChange={v => f("landmark", v)} placeholder="Near XYZ temple" />
                    </div>
                    <div>
                      <Label>Latitude</Label>
                      <Input value={form.lat} onChange={v => f("lat", v)} placeholder="e.g., 32.2396" />
                    </div>
                    <div>
                      <Label>Longitude</Label>
                      <Input value={form.lng} onChange={v => f("lng", v)} placeholder="e.g., 77.1887" />
                    </div>
                  </div>
                )}

                {/* ── CAPACITY ── */}
                {activeTab === "capacity" && (
                  <div>
                    <div style={S.grid4}>
                      {[["maxGuests", "Max Guests"], ["bedrooms", "Bedrooms"], ["bathrooms", "Bathrooms"], ["beds", "Beds"]].map(([k, l]) => (
                        <div key={k}>
                          <Label>{l}</Label>
                          <Input type="number" min="0" value={form[k]} onChange={v => f(k, v)} placeholder="0" />
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 24 }}>
                      <Label>Availability</Label>
                      <div style={S.grid2}>
                        <div>
                          <Label>Available From</Label>
                          <Input type="date" value={form.availableFrom} onChange={v => f("availableFrom", v)} />
                        </div>
                        <div>
                          <Label>Available To</Label>
                          <Input type="date" value={form.availableTo} onChange={v => f("availableTo", v)} />
                        </div>
                        <div>
                          <Label>Check-In Time</Label>
                          <Input type="time" value={form.checkInTime} onChange={v => f("checkInTime", v)} />
                        </div>
                        <div>
                          <Label>Check-Out Time</Label>
                          <Input type="time" value={form.checkOutTime} onChange={v => f("checkOutTime", v)} />
                        </div>
                      </div>
                    </div>
                    <div style={{ marginTop: 24 }}>
                      <Label>Additional Options</Label>
                      <div style={S.checkGrid}>
                        {[["extraMattressAllowed", "Extra Mattress Allowed"], ["childrenAllowed", "Children Allowed"], ["petsAllowed", "Pets Allowed"]].map(([k, l]) => (
                          <label key={k} style={S.checkLabel}>
                            <input type="checkbox" checked={form[k]} onChange={e => f(k, e.target.checked)} style={{ width: 16, height: 16, accentColor: "#166534" }} />
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
                    <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 16 }}>Select all amenities available at your property</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                      {AMENITIES.map(a => (
                        <button key={a} type="button" className={`hs-chip ${amenities.includes(a) ? "on" : ""}`} onClick={() => toggleAmenity(a)} style={{ ...S.chip, ...(amenities.includes(a) ? {} : {}) }}>
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
                    <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 20 }}>Configure food and kitchen options</p>
                    <div style={S.checkGrid}>
                      {[["kitchenAvailable", "Kitchen Available"], ["selfCookingAllowed", "Self Cooking Allowed"], ["vegFoodAvailable", "Veg Food Available"], ["nonVegAllowed", "Non-Veg Allowed"]].map(([k, l]) => (
                        <label key={k} style={S.checkLabel}>
                          <input type="checkbox" checked={form[k]} onChange={e => f(k, e.target.checked)} style={{ width: 16, height: 16, accentColor: "#166534" }} />
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
                      <Input type="number" min="0" value={form.basePrice} onChange={v => f("basePrice", v)} placeholder="e.g., 3000" required />
                    </div>
                    <div>
                      <Label>Weekend Price (₹)</Label>
                      <Input type="number" min="0" value={form.weekendPrice} onChange={v => f("weekendPrice", v)} placeholder="e.g., 4000" />
                    </div>
                    <div>
                      <Label>Extra Guest Price (₹)</Label>
                      <Input type="number" min="0" value={form.extraGuestPrice} onChange={v => f("extraGuestPrice", v)} placeholder="e.g., 500" />
                    </div>
                    <div>
                      <Label>Cleaning Fee (₹)</Label>
                      <Input type="number" min="0" value={form.cleaningFee} onChange={v => f("cleaningFee", v)} placeholder="e.g., 300" />
                    </div>
                    <div>
                      <Label>Security Deposit (₹)</Label>
                      <Input type="number" min="0" value={form.securityDeposit} onChange={v => f("securityDeposit", v)} placeholder="e.g., 5000" />
                    </div>
                    {form.basePrice && (
                      <div style={{ gridColumn: "1/-1", background: "#f0fdf4", borderRadius: 10, padding: 16, border: "1px solid #bbf7d0" }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#166534", marginBottom: 8 }}>Pricing Summary</p>
                        <div style={{ fontSize: 13, color: "#374151", display: "flex", flexDirection: "column", gap: 4 }}>
                          <span>Base: ₹{Number(form.basePrice).toLocaleString("en-IN")}/night</span>
                          {form.weekendPrice && <span>Weekend: ₹{Number(form.weekendPrice).toLocaleString("en-IN")}/night</span>}
                          {form.cleaningFee && <span>Cleaning: ₹{Number(form.cleaningFee).toLocaleString("en-IN")}</span>}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── RULES ── */}
                {activeTab === "rules" && (
                  <div>
                    <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 20 }}>Set rules for your guests</p>
                    <div style={S.grid2}>
                      {Object.keys(rules).map(k => (
                        <label key={k} style={{ ...S.checkLabel, background: rules[k] ? "#f0fdf4" : "#f9fafb", padding: "12px 16px", borderRadius: 10, border: `1px solid ${rules[k] ? "#bbf7d0" : "#e5e7eb"}`, cursor: "pointer" }}>
                          <input type="checkbox" checked={rules[k]} onChange={() => toggleRule(k)} style={{ width: 16, height: 16, accentColor: "#166534" }} />
                          <span style={{ fontWeight: 500 }}>{RULE_LABELS[k]}</span>
                          <span style={{ marginLeft: "auto", fontSize: 12, color: rules[k] ? "#166534" : "#9ca3af", fontWeight: 600 }}>{rules[k] ? "✓ Allowed" : "✗ Not Allowed"}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── MEDIA ── */}
                {activeTab === "media" && (
                  <div>
                    <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 16 }}>Upload property photos. First image will be the main display image. Max 10 images, 5MB each.</p>
                    <div style={S.imgGrid}>
                      {previews.map((src, i) => (
                        <div key={i} style={S.previewItem}>
                          <img src={typeof src === "string" ? src : URL.createObjectURL(src)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }} onError={e => e.target.style.display = "none"} />
                          {i < images.length + (editId ? previews.length - images.length : 0) && (
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
                  <button type="submit" className="hs-submit" style={S.submitBtn} disabled={submitting}>
                    {submitting ? "⏳ Saving..." : editId ? "💾 Update Homestay" : "✓ Add Homestay"}
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
  page: { maxWidth: 1400, margin: "0 auto", padding: "32px 24px", fontFamily: "'DM Sans', sans-serif", background: "#f8fafc", minHeight: "100vh" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 16 },
  title: { fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: "#111827" },
  subtitle: { fontSize: 14, color: "#9ca3af", marginTop: 6 },
  addBtn: { padding: "12px 24px", background: "#166534", color: "white", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  toast: c => ({ position: "fixed", top: 20, right: 20, zIndex: 9999, padding: "14px 20px", background: c === "green" ? "#166534" : "#dc2626", color: "white", borderRadius: 10, fontSize: 14, fontWeight: 500, boxShadow: "0 4px 20px rgba(0,0,0,.15)", display: "flex", alignItems: "center", gap: 8 }),
  filterBar: { display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" },
  searchInput: { flex: 1, minWidth: 220, padding: "10px 16px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 14, fontFamily: "inherit", background: "white" },
  filterSelect: { padding: "10px 16px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 14, fontFamily: "inherit", background: "white" },
  clearBtn: { padding: "10px 16px", background: "#f3f4f6", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 14, cursor: "pointer", fontFamily: "inherit" },
  filterCount: { fontSize: 13, color: "#9ca3af", whiteSpace: "nowrap" },
  center: { display: "flex", justifyContent: "center", alignItems: "center", height: 300 },
  spinner: { width: 40, height: 40, border: "3px solid #e5e7eb", borderTop: "3px solid #166534", borderRadius: "50%", animation: "spin 1s linear infinite" },
  empty: { textAlign: "center", padding: 80, background: "white", borderRadius: 16, boxShadow: "0 1px 4px rgba(0,0,0,.06)" },
  tableWrap: { background: "white", borderRadius: 16, boxShadow: "0 1px 4px rgba(0,0,0,.06)", overflow: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "14px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: .5, borderBottom: "1px solid #f3f4f6" },
  tr: { borderBottom: "1px solid #f9fafb", transition: "background .15s" },
  td: { padding: "14px 16px", fontSize: 14, color: "#374151", verticalAlign: "middle" },
  imgWrap: { width: 64, height: 52, borderRadius: 8, overflow: "hidden", background: "#f3f4f6", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" },
  thumb: { width: "100%", height: "100%", objectFit: "cover" },
  typeBadge: { fontSize: 12, fontWeight: 600, color: "#166534", background: "#dcfce7", padding: "4px 10px", borderRadius: 20 },
  pill: { fontSize: 11, background: "#f3f4f6", color: "#6b7280", padding: "2px 8px", borderRadius: 4, fontWeight: 500 },
  statusBadge: { fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20, display: "inline-block" },
  editBtn: { padding: "8px 10px", background: "#f0fdf4", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 15 },
  deleteBtn: { padding: "8px 10px", background: "#fff5f5", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 15 },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20, backdropFilter: "blur(4px)" },
  modal: { background: "white", borderRadius: 20, width: "100%", maxWidth: 860, maxHeight: "92vh", overflow: "auto", boxShadow: "0 25px 80px rgba(0,0,0,.25)", display: "flex", flexDirection: "column" },
  modalHead: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "24px 32px", borderBottom: "1px solid #f3f4f6", position: "sticky", top: 0, background: "white", zIndex: 10 },
  closeBtn: { background: "#f3f4f6", border: "none", borderRadius: 8, width: 36, height: 36, fontSize: 18, cursor: "pointer", color: "#6b7280", display: "flex", alignItems: "center", justifyContent: "center" },
  tabsRow: { display: "flex", gap: 0, padding: "0 32px", borderBottom: "1px solid #f3f4f6", overflowX: "auto", flexShrink: 0 },
  tabBtn: { padding: "12px 16px", background: "none", border: "none", fontSize: 13, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap", color: "#6b7280", borderBottom: "2px solid transparent", fontFamily: "inherit", borderRadius: 0 },
  formBody: { padding: "24px 32px", flex: 1, overflowY: "auto" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  grid4: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16 },
  input: { width: "100%", padding: "10px 14px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 14, fontFamily: "inherit", background: "white", transition: "border .2s, box-shadow .2s" },
  checkGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 },
  checkLabel: { display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#374151", cursor: "pointer" },
  chip: { padding: "8px 16px", border: "1.5px solid #e5e7eb", borderRadius: 20, background: "white", fontSize: 13, fontWeight: 500, color: "#6b7280", fontFamily: "inherit" },
  imgGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, 110px)", gap: 12 },
  previewItem: { width: 110, height: 90, borderRadius: 8, overflow: "visible", position: "relative" },
  removeImg: { position: "absolute", top: -8, right: -8, background: "#dc2626", color: "white", border: "none", borderRadius: "50%", width: 22, height: 22, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  mainBadge: { position: "absolute", bottom: -8, left: 4, background: "#166534", color: "white", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4 },
  uploadZone: { width: 110, height: 90, border: "2px dashed #d1d5db", borderRadius: 8, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#9ca3af", gap: 4 },
  modalFoot: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 32px", borderTop: "1px solid #f3f4f6", position: "sticky", bottom: 0, background: "white" },
  cancelBtn: { padding: "10px 20px", background: "#f3f4f6", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: "#374151" },
  nextBtn: { padding: "10px 20px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: "#166534" },
  submitBtn: { padding: "10px 24px", background: "#166534", color: "white", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "background .2s" },
};