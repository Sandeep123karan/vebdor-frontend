import { useEffect, useState } from "react";

/* ============================================================
   VENDOR HOTEL ROOMS
   Props:
     hotelId   -> required, mongo id of hotel
     hotelName -> optional, for header display
     onBack    -> function to go back to Manage Hotels list
============================================================ */

const API_BASE = "http://localhost:7000/api/hotel-rooms";

export default function VendorHotelRooms({ hotelId, hotelName, onBack }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  /* ================= FETCH ROOMS ================= */
  const fetchRooms = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/hotel/${hotelId}`, {
        headers: authHeaders,
      });
      const data = await res.json();
      if (data.success) {
        setRooms(data.rooms || []);
      } else {
        setError(data.message || "Failed to load rooms");
      }
    } catch (err) {
      setError("Server error while loading rooms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hotelId) fetchRooms();
    // eslint-disable-next-line
  }, [hotelId]);

  /* ================= DELETE ROOM ================= */
  const handleDelete = async (roomId) => {
    if (!window.confirm("Delete this room? This cannot be undone.")) return;
    try {
      const res = await fetch(`${API_BASE}/${roomId}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      const data = await res.json();
      if (data.success) {
        setRooms((prev) => prev.filter((r) => r._id !== roomId));
      } else {
        alert(data.message || "Failed to delete room");
      }
    } catch {
      alert("Server error while deleting room");
    }
  };

  /* ================= TOGGLE STATUS ================= */
  const handleStatusChange = async (roomId, status) => {
    try {
      const res = await fetch(`${API_BASE}/${roomId}/status`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setRooms((prev) =>
          prev.map((r) => (r._id === roomId ? data.room : r))
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
    setEditingRoom(null);
    setShowForm(true);
  };

  const openEditForm = (room) => {
    setEditingRoom(room);
    setShowForm(true);
  };

  /* ================= SAVE (ADD / EDIT) ================= */
  const handleSave = async (formData) => {
    setSaving(true);
    setError("");
    try {
      const isEdit = Boolean(editingRoom);
      const url = isEdit ? `${API_BASE}/${editingRoom._id}` : `${API_BASE}/`;
      const method = isEdit ? "PUT" : "POST";

      const payload = isEdit ? formData : { ...formData, hotelId };

      const res = await fetch(url, {
        method,
        headers: authHeaders,
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        if (isEdit) {
          setRooms((prev) =>
            prev.map((r) => (r._id === data.room._id ? data.room : r))
          );
        } else {
          setRooms((prev) => [data.room, ...prev]);
        }
        setShowForm(false);
        setEditingRoom(null);
      } else {
        setError(data.message || "Failed to save room");
      }
    } catch {
      setError("Server error while saving room");
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
            ← Back to Hotels
          </button>
          <h2 style={styles.title}>
            🛏️ Rooms {hotelName ? `— ${hotelName}` : ""}
          </h2>
          <p style={styles.subText}>{rooms.length} room(s)</p>
        </div>
        <button style={styles.addBtn} onClick={openAddForm}>
          + Add Room
        </button>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      {/* LOADING */}
      {loading ? (
        <p style={{ padding: 20 }}>Loading rooms...</p>
      ) : rooms.length === 0 ? (
        <div style={styles.emptyBox}>
          <p>No rooms added yet for this hotel.</p>
          <button style={styles.addBtn} onClick={openAddForm}>
            + Add First Room
          </button>
        </div>
      ) : (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Room</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Guests</th>
                <th style={styles.th}>Inventory</th>
                <th style={styles.th}>Price / Night</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room._id}>
                  <td style={styles.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {room.coverImage ? (
                        <img
                          src={room.coverImage}
                          alt={room.roomName}
                          style={styles.thumb}
                        />
                      ) : (
                        <div style={styles.thumbPlaceholder}>🛏️</div>
                      )}
                      <div>
                        <strong>{room.roomName}</strong>
                        <div style={styles.smallGray}>
                          {room.roomSize
                            ? `${room.roomSize} ${room.roomSizeUnit}`
                            : ""}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={styles.td}>{room.roomType}</td>
                  <td style={styles.td}>
                    {room.maxGuests} guests
                    <div style={styles.smallGray}>
                      {room.maxAdults}A / {room.maxChildren}C
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div>Total: {room.totalRooms}</div>
                    <div style={styles.smallGray}>
                      Avail: {room.availableRooms}
                    </div>
                  </td>
                  <td style={styles.td}>
                    ₹{room.basePrice}
                    <div style={styles.smallGray}>
                      Tax {room.taxPercentage}%
                    </div>
                  </td>
                  <td style={styles.td}>
                    <select
                      value={room.status}
                      onChange={(e) =>
                        handleStatusChange(room._id, e.target.value)
                      }
                      style={{
                        ...styles.statusSelect,
                        ...(room.status === "ACTIVE" && styles.statusActive),
                        ...(room.status === "PENDING" && styles.statusPending),
                        ...(room.status === "REJECTED" && styles.statusRejected),
                      }}
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="PENDING">Pending</option>
                      <option value="APPROVED">Approved</option>
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </td>
                  <td style={styles.td}>
                    <button
                      style={styles.editBtn}
                      onClick={() => openEditForm(room)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      style={styles.deleteBtn}
                      onClick={() => handleDelete(room._id)}
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
        <RoomFormModal
          room={editingRoom}
          onCancel={() => {
            setShowForm(false);
            setEditingRoom(null);
          }}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </div>
  );
}

/* ============================================================
   ROOM ADD/EDIT FORM MODAL
============================================================ */
function RoomFormModal({ room, onCancel, onSave, saving }) {
  const isEdit = Boolean(room);

  const [form, setForm] = useState({
    roomName: room?.roomName || "",
    roomType: room?.roomType || "standard",
    description: room?.description || "",
    totalRooms: room?.totalRooms || 1,
    maxGuests: room?.maxGuests || 2,
    maxAdults: room?.maxAdults || 2,
    maxChildren: room?.maxChildren || 0,
    bedType: room?.bedType || "double",
    bedCount: room?.bedCount || 1,
    basePrice: room?.basePrice || 0,
    weekendPrice: room?.weekendPrice || 0,
    taxPercentage: room?.taxPercentage || 0,
    serviceChargePercentage: room?.serviceChargePercentage || 0,
    wifi: room?.wifi || false,
    airConditioning: room?.airConditioning || false,
    television: room?.television || false,
    breakfastIncluded: room?.breakfastIncluded || false,
    refundable: room?.refundable ?? true,
    coverImage: room?.coverImage || "",
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.roomName.trim()) return alert("Room name is required");
    if (!form.totalRooms || form.totalRooms < 1)
      return alert("Total rooms must be at least 1");
    if (!form.maxGuests || form.maxGuests < 1)
      return alert("Max guests must be at least 1");
    if (form.basePrice === "" || form.basePrice < 0)
      return alert("Base price is required");

    onSave(form);
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalBox}>
        <div style={styles.modalHeader}>
          <h3 style={{ margin: 0 }}>
            {isEdit ? "✏️ Edit Room" : "+ Add New Room"}
          </h3>
          <button style={styles.closeBtn} onClick={onCancel}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.formGrid}>
          <FormField label="Room Name *">
            <input
              style={styles.input}
              value={form.roomName}
              onChange={(e) => handleChange("roomName", e.target.value)}
            />
          </FormField>

          <FormField label="Room Type *">
            <select
              style={styles.input}
              value={form.roomType}
              onChange={(e) => handleChange("roomType", e.target.value)}
            >
              {[
                "standard",
                "deluxe",
                "super-deluxe",
                "premium",
                "executive",
                "suite",
                "junior-suite",
                "presidential-suite",
                "family-room",
                "studio",
                "villa",
                "dormitory",
                "other",
              ].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Total Rooms *">
            <input
              type="number"
              min="1"
              style={styles.input}
              value={form.totalRooms}
              onChange={(e) =>
                handleChange("totalRooms", Number(e.target.value))
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

          <FormField label="Max Adults">
            <input
              type="number"
              min="1"
              style={styles.input}
              value={form.maxAdults}
              onChange={(e) =>
                handleChange("maxAdults", Number(e.target.value))
              }
            />
          </FormField>

          <FormField label="Max Children">
            <input
              type="number"
              min="0"
              style={styles.input}
              value={form.maxChildren}
              onChange={(e) =>
                handleChange("maxChildren", Number(e.target.value))
              }
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
                "bunk",
                "sofa-bed",
                "multiple",
                "other",
              ].map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Bed Count">
            <input
              type="number"
              min="1"
              style={styles.input}
              value={form.bedCount}
              onChange={(e) =>
                handleChange("bedCount", Number(e.target.value))
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

          <FormField label="Service Charge %">
            <input
              type="number"
              min="0"
              max="100"
              style={styles.input}
              value={form.serviceChargePercentage}
              onChange={(e) =>
                handleChange(
                  "serviceChargePercentage",
                  Number(e.target.value)
                )
              }
            />
          </FormField>

          <FormField label="Cover Image URL">
            <input
              style={styles.input}
              value={form.coverImage}
              onChange={(e) => handleChange("coverImage", e.target.value)}
              placeholder="https://..."
            />
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
              checked={form.television}
              onChange={(v) => handleChange("television", v)}
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
              {saving ? "Saving..." : isEdit ? "Update Room" : "Add Room"}
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
  thumb: {
    width: 50,
    height: 50,
    borderRadius: 8,
    objectFit: "cover",
  },
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
  smallGray: { fontSize: 12, color: "#999" },
  statusSelect: {
    padding: "6px 10px",
    borderRadius: 20,
    border: "1px solid #ddd",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  },
  statusActive: { background: "#e3fcef", color: "#1e824c", borderColor: "#1e824c" },
  statusPending: { background: "#fff6da", color: "#a8710a", borderColor: "#a8710a" },
  statusRejected: { background: "#ffe0e0", color: "#c0392b", borderColor: "#c0392b" },
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