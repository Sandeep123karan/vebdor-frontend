import { useEffect, useState } from "react";

/* ============================================================
   VENDOR HOMESTAY UNITS
   Props:
     homestayId   -> required, mongo id of Homestay
     homestayName -> optional, for header display
     onBack       -> function to go back to Manage Homestays
============================================================ */

const API_BASE = "http://localhost:7000/api/homestay-units";

export default function VendorHomestayUnits({
  homestayId,
  homestayName,
  onBack,
}) {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("token");

  /* ================= FETCH UNITS ================= */
  const fetchUnits = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${API_BASE}?homestayId=${homestayId}&limit=100`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (data.success) {
        setUnits(data.units || []);
      } else {
        setError(data.message || "Failed to load units");
      }
    } catch {
      setError("Server error while loading units");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (homestayId) fetchUnits();
    // eslint-disable-next-line
  }, [homestayId]);

  /* ================= DELETE UNIT ================= */
  const handleDelete = async (unitId) => {
    if (!window.confirm("Delete this unit? This cannot be undone.")) return;
    try {
      const res = await fetch(`${API_BASE}/${unitId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setUnits((prev) => prev.filter((u) => u._id !== unitId));
      } else {
        alert(data.message || "Failed to delete unit");
      }
    } catch {
      alert("Server error while deleting unit");
    }
  };

  /* ================= TOGGLE STATUS ================= */
  const handleToggleStatus = async (unitId) => {
    try {
      const res = await fetch(`${API_BASE}/${unitId}/toggle-status`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setUnits((prev) =>
          prev.map((u) =>
            u._id === unitId
              ? { ...u, isActive: data.isActive, status: data.status }
              : u
          )
        );
      } else {
        alert(data.message || "Failed to update status");
      }
    } catch {
      alert("Server error while updating status");
    }
  };

  /* ================= OPEN FORM ================= */
  const openAddForm = () => {
    setEditingUnit(null);
    setShowForm(true);
  };

  const openEditForm = (unit) => {
    setEditingUnit(unit);
    setShowForm(true);
  };

  /* ================= SAVE (ADD / EDIT) ================= */
  const handleSave = async (formData) => {
    setSaving(true);
    setError("");
    try {
      const isEdit = Boolean(editingUnit);
      const url = isEdit
        ? `${API_BASE}/${editingUnit._id}`
        : `${API_BASE}/`;
      const method = isEdit ? "PUT" : "POST";

      if (!isEdit) {
        formData.append("homestayId", homestayId);
      }

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setShowForm(false);
        setEditingUnit(null);
        fetchUnits();
      } else {
        setError(data.message || "Failed to save unit");
      }
    } catch {
      setError("Server error while saving unit");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* HEADER */}
      <div style={styles.headerRow}>
        <div>
          <button style={styles.backBtn} onClick={onBack}>
            ← Back to Homestays
          </button>
          <h2 style={styles.title}>
            🏡 Units {homestayName ? `— ${homestayName}` : ""}
          </h2>
          <p style={styles.subText}>{units.length} unit(s)</p>
        </div>
        <button style={styles.addBtn} onClick={openAddForm}>
          + Add Unit
        </button>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      {/* LOADING */}
      {loading ? (
        <p style={{ padding: 20 }}>Loading units...</p>
      ) : units.length === 0 ? (
        <div style={styles.emptyBox}>
          <p>No units added yet for this homestay.</p>
          <button style={styles.addBtn} onClick={openAddForm}>
            + Add First Unit
          </button>
        </div>
      ) : (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Unit</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Guests</th>
                <th style={styles.th}>Total Units</th>
                <th style={styles.th}>Price / Night</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {units.map((unit) => (
                <tr key={unit._id}>
                  <td style={styles.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {unit.coverImage ? (
                        <img
                          src={unit.coverImage}
                          alt={unit.unitName}
                          style={styles.thumb}
                        />
                      ) : (
                        <div style={styles.thumbPlaceholder}>🏡</div>
                      )}
                      <div>
                        <strong>{unit.unitName}</strong>
                        <div style={styles.smallGray}>
                          {unit.bedrooms} BR / {unit.beds} Bed
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={styles.td}>{unit.unitType}</td>
                  <td style={styles.td}>
                    {unit.maxGuests} guests
                    <div style={styles.smallGray}>
                      {unit.adults}A / {unit.children}C
                    </div>
                  </td>
                  <td style={styles.td}>{unit.totalUnits}</td>
                  <td style={styles.td}>
                    ₹{unit.basePrice}
                    <div style={styles.smallGray}>
                      Tax {unit.taxPercentage}%
                    </div>
                  </td>
                  <td style={styles.td}>
                    <button
                      style={{
                        ...styles.statusBtn,
                        ...(unit.isActive
                          ? styles.statusActive
                          : styles.statusInactive),
                      }}
                      onClick={() => handleToggleStatus(unit._id)}
                    >
                      {unit.status}
                    </button>
                  </td>
                  <td style={styles.td}>
                    <button
                      style={styles.editBtn}
                      onClick={() => openEditForm(unit)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      style={styles.deleteBtn}
                      onClick={() => handleDelete(unit._id)}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ADD/EDIT MODAL */}
      {showForm && (
        <UnitFormModal
          unit={editingUnit}
          onCancel={() => {
            setShowForm(false);
            setEditingUnit(null);
          }}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </div>
  );
}

/* ============================================================
   UNIT ADD/EDIT FORM MODAL (uses FormData for file upload)
============================================================ */
function UnitFormModal({ unit, onCancel, onSave, saving }) {
  const isEdit = Boolean(unit);

  const [form, setForm] = useState({
    unitName: unit?.unitName || "",
    unitType: unit?.unitType || "private-room",
    description: unit?.description || "",
    maxGuests: unit?.maxGuests || 2,
    adults: unit?.adults || 2,
    children: unit?.children || 0,
    bedrooms: unit?.bedrooms || 1,
    beds: unit?.beds || 1,
    bedType: unit?.bedType || "double",
    bathrooms: unit?.bathrooms || 1,
    totalUnits: unit?.totalUnits || 1,
    basePrice: unit?.basePrice || 0,
    weekendPrice: unit?.weekendPrice || 0,
    taxPercentage: unit?.taxPercentage || 0,
    wifi: unit?.wifi ?? true,
    airConditioning: unit?.airConditioning || false,
    tv: unit?.tv || false,
    kitchen: unit?.kitchen || false,
    breakfastIncluded: unit?.breakfastIncluded || false,
    refundable: unit?.refundable ?? true,
    petsAllowed: unit?.petsAllowed || false,
  });

  const [coverImageFile, setCoverImageFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.unitName.trim()) return alert("Unit name is required");
    if (!form.maxGuests || form.maxGuests < 1)
      return alert("Max guests must be at least 1");
    if (form.basePrice === "" || form.basePrice < 0)
      return alert("Base price is required");
    if (!form.totalUnits || form.totalUnits < 1)
      return alert("Total units must be at least 1");

    const fd = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      fd.append(key, value);
    });

    if (coverImageFile) fd.append("coverImage", coverImageFile);
    galleryFiles.forEach((file) => fd.append("images", file));

    onSave(fd);
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalBox}>
        <div style={styles.modalHeader}>
          <h3 style={{ margin: 0 }}>
            {isEdit ? "✏️ Edit Unit" : "+ Add New Unit"}
          </h3>
          <button style={styles.closeBtn} onClick={onCancel}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.formGrid}>
          <FormField label="Unit Name *">
            <input
              style={styles.input}
              value={form.unitName}
              onChange={(e) => handleChange("unitName", e.target.value)}
            />
          </FormField>

          <FormField label="Unit Type *">
            <select
              style={styles.input}
              value={form.unitType}
              onChange={(e) => handleChange("unitType", e.target.value)}
            >
              {[
                "private-room",
                "shared-room",
                "entire-property",
                "villa",
                "cottage",
                "apartment",
                "suite",
                "studio",
                "dormitory",
              ].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Total Units *">
            <input
              type="number"
              min="1"
              style={styles.input}
              value={form.totalUnits}
              onChange={(e) =>
                handleChange("totalUnits", Number(e.target.value))
              }
            />
          </FormField>

          <FormField label="Max Guests *">
            <input
              type="number"
              min="1"
              style={styles.input}
              value={form.maxGuests}
              onChange={(e) =>
                handleChange("maxGuests", Number(e.target.value))
              }
            />
          </FormField>

          <FormField label="Adults">
            <input
              type="number"
              min="1"
              style={styles.input}
              value={form.adults}
              onChange={(e) =>
                handleChange("adults", Number(e.target.value))
              }
            />
          </FormField>

          <FormField label="Children">
            <input
              type="number"
              min="0"
              style={styles.input}
              value={form.children}
              onChange={(e) =>
                handleChange("children", Number(e.target.value))
              }
            />
          </FormField>

          <FormField label="Bedrooms">
            <input
              type="number"
              min="0"
              style={styles.input}
              value={form.bedrooms}
              onChange={(e) =>
                handleChange("bedrooms", Number(e.target.value))
              }
            />
          </FormField>

          <FormField label="Beds">
            <input
              type="number"
              min="1"
              style={styles.input}
              value={form.beds}
              onChange={(e) => handleChange("beds", Number(e.target.value))}
            />
          </FormField>

          <FormField label="Bed Type">
            <select
              style={styles.input}
              value={form.bedType}
              onChange={(e) => handleChange("bedType", e.target.value)}
            >
              {[
                "single",
                "twin",
                "double",
                "queen",
                "king",
                "super-king",
                "bunk-bed",
                "sofa-bed",
                "floor-mattress",
                "multiple",
              ].map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Bathrooms">
            <input
              type="number"
              min="1"
              style={styles.input}
              value={form.bathrooms}
              onChange={(e) =>
                handleChange("bathrooms", Number(e.target.value))
              }
            />
          </FormField>

          <FormField label="Base Price (₹) *">
            <input
              type="number"
              min="0"
              style={styles.input}
              value={form.basePrice}
              onChange={(e) =>
                handleChange("basePrice", Number(e.target.value))
              }
            />
          </FormField>

          <FormField label="Weekend Price (₹)">
            <input
              type="number"
              min="0"
              style={styles.input}
              value={form.weekendPrice}
              onChange={(e) =>
                handleChange("weekendPrice", Number(e.target.value))
              }
            />
          </FormField>

          <FormField label="Tax %">
            <input
              type="number"
              min="0"
              max="100"
              style={styles.input}
              value={form.taxPercentage}
              onChange={(e) =>
                handleChange("taxPercentage", Number(e.target.value))
              }
            />
          </FormField>

          <FormField label="Cover Image">
            <input
              type="file"
              accept="image/*"
              style={styles.input}
              onChange={(e) => setCoverImageFile(e.target.files[0])}
            />
            {isEdit && unit?.coverImage && !coverImageFile && (
              <img src={unit.coverImage} alt="cover" style={styles.previewThumb} />
            )}
          </FormField>

          <FormField label="Gallery Images">
            <input
              type="file"
              accept="image/*"
              multiple
              style={styles.input}
              onChange={(e) => setGalleryFiles(Array.from(e.target.files))}
            />
            <div style={styles.smallGray}>
              {galleryFiles.length > 0
                ? `${galleryFiles.length} file(s) selected`
                : isEdit
                ? "Uploading new files will add to existing gallery"
                : ""}
            </div>
          </FormField>

          <FormField label="Description" full>
            <textarea
              style={{ ...styles.input, minHeight: 70 }}
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </FormField>

          {/* CHECKBOXES */}
          <div style={styles.checkRow}>
            <Checkbox
              label="WiFi"
              checked={form.wifi}
              onChange={(v) => handleChange("wifi", v)}
            />
            <Checkbox
              label="AC"
              checked={form.airConditioning}
              onChange={(v) => handleChange("airConditioning", v)}
            />
            <Checkbox
              label="TV"
              checked={form.tv}
              onChange={(v) => handleChange("tv", v)}
            />
            <Checkbox
              label="Kitchen"
              checked={form.kitchen}
              onChange={(v) => handleChange("kitchen", v)}
            />
            <Checkbox
              label="Breakfast Included"
              checked={form.breakfastIncluded}
              onChange={(v) => handleChange("breakfastIncluded", v)}
            />
            <Checkbox
              label="Refundable"
              checked={form.refundable}
              onChange={(v) => handleChange("refundable", v)}
            />
            <Checkbox
              label="Pets Allowed"
              checked={form.petsAllowed}
              onChange={(v) => handleChange("petsAllowed", v)}
            />
          </div>

          <div style={styles.modalFooter}>
            <button
              type="button"
              style={styles.cancelBtn}
              onClick={onCancel}
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" style={styles.saveBtn} disabled={saving}>
              {saving ? "Saving..." : isEdit ? "Update Unit" : "Add Unit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({ label, children, full }) {
  return (
    <div style={{ gridColumn: full ? "1 / -1" : "auto" }}>
      <label style={styles.label}>{label}</label>
      {children}
    </div>
  );
}

function Checkbox({ label, checked, onChange }) {
  return (
    <label style={styles.checkboxLabel}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}

/* ================= STYLES ================= */
const styles = {
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  backBtn: {
    background: "none",
    border: "none",
    color: "#1a5490",
    fontWeight: 600,
    cursor: "pointer",
    padding: 0,
    marginBottom: 8,
    fontSize: 13,
  },
  title: { margin: 0, fontSize: 24, color: "#1a1a2e" },
  subText: { margin: "4px 0 0 0", color: "#888", fontSize: 13 },
  addBtn: {
    background: "linear-gradient(90deg, #1a5490 0%, #0f3460 100%)",
    color: "#fff",
    border: "none",
    padding: "10px 18px",
    borderRadius: 8,
    fontWeight: 600,
    cursor: "pointer",
  },
  errorBox: {
    background: "#ffe0e0",
    color: "#c0392b",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  emptyBox: {
    background: "#fff",
    borderRadius: 12,
    padding: 40,
    textAlign: "center",
    color: "#666",
  },
  tableWrap: {
    background: "#fff",
    borderRadius: 12,
    overflow: "auto",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left",
    padding: "14px 16px",
    fontSize: 12,
    color: "#666",
    textTransform: "uppercase",
    borderBottom: "1px solid #eee",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "14px 16px",
    borderBottom: "1px solid #f2f2f2",
    fontSize: 14,
    verticalAlign: "top",
  },
  thumb: { width: 50, height: 50, borderRadius: 8, objectFit: "cover" },
  thumbPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 8,
    background: "#f0f0f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
  },
  smallGray: { fontSize: 12, color: "#999", marginTop: 4 },
  statusBtn: {
    padding: "6px 12px",
    borderRadius: 20,
    border: "1px solid #ddd",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  },
  statusActive: { background: "#e3fcef", color: "#1e824c", borderColor: "#1e824c" },
  statusInactive: { background: "#f0f0f0", color: "#777", borderColor: "#ccc" },
  editBtn: {
    background: "#eef3fb",
    color: "#1a5490",
    border: "none",
    padding: "6px 10px",
    borderRadius: 6,
    cursor: "pointer",
    marginRight: 8,
    fontSize: 12,
    fontWeight: 600,
  },
  deleteBtn: {
    background: "#ffe0e0",
    color: "#c0392b",
    border: "none",
    padding: "6px 10px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 600,
  },

  /* MODAL */
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: 20,
  },
  modalBox: {
    background: "#fff",
    borderRadius: 12,
    width: "100%",
    maxWidth: 700,
    maxHeight: "90vh",
    overflowY: "auto",
    padding: 24,
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: 18,
    cursor: "pointer",
    color: "#888",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
  },
  label: {
    display: "block",
    fontSize: 12,
    fontWeight: 600,
    color: "#555",
    marginBottom: 5,
  },
  input: {
    width: "100%",
    padding: "9px 10px",
    borderRadius: 6,
    border: "1px solid #ddd",
    fontSize: 14,
    boxSizing: "border-box",
  },
  previewThumb: {
    width: 60,
    height: 60,
    borderRadius: 6,
    objectFit: "cover",
    marginTop: 6,
  },
  checkRow: {
    gridColumn: "1 / -1",
    display: "flex",
    flexWrap: "wrap",
    gap: 16,
    marginTop: 6,
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    color: "#444",
  },
  modalFooter: {
    gridColumn: "1 / -1",
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 10,
  },
  cancelBtn: {
    padding: "10px 18px",
    borderRadius: 8,
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 600,
  },
  saveBtn: {
    padding: "10px 18px",
    borderRadius: 8,
    border: "none",
    background: "linear-gradient(90deg, #1a5490 0%, #0f3460 100%)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
  },
};