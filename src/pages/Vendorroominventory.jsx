import { useEffect, useState } from "react";

/* ============================================================
   VENDOR ROOM INVENTORY (Date-wise pricing & availability)
   Props:
     roomId   -> required, mongo id of HotelRoom
     hotelId  -> required, mongo id of Hotel
     roomName -> optional, for header display
     onBack   -> function to go back to Room list
============================================================ */

const API_BASE = "https://bmtvendorfinal.onrender.com/api/hotel-inventory";

const todayStr = () => new Date().toISOString().split("T")[0];
const addDays = (dateStr, days) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
};

export default function VendorRoomInventory({
  roomId,
  hotelId,
  roomName,
  onBack,
}) {
  const [from, setFrom] = useState(todayStr());
  const [to, setTo] = useState(addDays(todayStr(), 13));
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("token");
  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  /* ================= FETCH INVENTORY ================= */
  const fetchInventory = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${API_BASE}/room/${roomId}?from=${from}&to=${to}`,
        { headers: authHeaders }
      );
      const data = await res.json();
      if (data.success) {
        setInventory(data.inventory || []);
      } else {
        setError(data.message || "Failed to load inventory");
      }
    } catch {
      setError("Server error while loading inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (roomId) fetchInventory();
    // eslint-disable-next-line
  }, [roomId]);

  /* ================= MAP EXISTING INVENTORY BY DATE ================= */
  const inventoryByDate = {};
  inventory.forEach((inv) => {
    const key = new Date(inv.date).toISOString().split("T")[0];
    inventoryByDate[key] = inv;
  });

  /* ================= BUILD DATE LIST BETWEEN from/to ================= */
  const buildDateRange = () => {
    const dates = [];
    let cursor = from;
    let guard = 0;
    while (cursor <= to && guard < 366) {
      dates.push(cursor);
      cursor = addDays(cursor, 1);
      guard++;
    }
    return dates;
  };

  const dateList = buildDateRange();

  /* ================= TOGGLE STOP SELL ================= */
  const handleStopSellToggle = async (entry, dateStr) => {
    try {
      if (!entry) {
        // no inventory yet for this date — nothing to toggle
        alert("Set up this date first before blocking it.");
        return;
      }
      const res = await fetch(`${API_BASE}/${entry._id}/stop-sell`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({
          stopSell: !entry.stopSell,
          reason: !entry.stopSell ? "Blocked by vendor" : "",
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchInventory();
      } else {
        alert(data.message || "Failed to update stop-sell");
      }
    } catch {
      alert("Server error while updating stop-sell");
    }
  };

  /* ================= DELETE ENTRY ================= */
  const handleDelete = async (entry) => {
    if (!window.confirm("Remove custom inventory for this date?")) return;
    try {
      const res = await fetch(`${API_BASE}/${entry._id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      const data = await res.json();
      if (data.success) {
        fetchInventory();
      } else {
        alert(data.message || "Failed to delete inventory");
      }
    } catch {
      alert("Server error while deleting inventory");
    }
  };

  /* ================= OPEN FORM ================= */
  const openEditForm = (dateStr, entry) => {
    setEditingEntry({ dateStr, entry: entry || null });
    setShowForm(true);
  };

  /* ================= SAVE (UPSERT) ================= */
  const handleSave = async (formData) => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({
          hotelId,
          roomId,
          date: editingEntry.dateStr,
          ...formData,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setEditingEntry(null);
        fetchInventory();
      } else {
        setError(data.message || "Failed to save inventory");
      }
    } catch {
      setError("Server error while saving inventory");
    } finally {
      setSaving(false);
    }
  };

  /* ================= QUICK RANGE PRESETS ================= */
  const setPreset = (days) => {
    setFrom(todayStr());
    setTo(addDays(todayStr(), days - 1));
  };

  return (
    <div>
      {/* HEADER */}
      <div style={styles.headerRow}>
        <div>
          <button style={styles.backBtn} onClick={onBack}>
            ← Back to Rooms
          </button>
          <h2 style={styles.title}>
            📅 Inventory & Pricing {roomName ? `— ${roomName}` : ""}
          </h2>
          <p style={styles.subText}>
            Set date-wise availability, pricing and stop-sell
          </p>
        </div>
      </div>

      {/* DATE RANGE CONTROLS */}
      <div style={styles.controlsBar}>
        <div style={styles.controlGroup}>
          <label style={styles.label}>From</label>
          <input
            type="date"
            style={styles.dateInput}
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>
        <div style={styles.controlGroup}>
          <label style={styles.label}>To</label>
          <input
            type="date"
            style={styles.dateInput}
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
        <button style={styles.applyBtn} onClick={fetchInventory}>
          Apply
        </button>
        <div style={styles.presetGroup}>
          <button style={styles.presetBtn} onClick={() => setPreset(7)}>
            7 Days
          </button>
          <button style={styles.presetBtn} onClick={() => setPreset(14)}>
            14 Days
          </button>
          <button style={styles.presetBtn} onClick={() => setPreset(30)}>
            30 Days
          </button>
        </div>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      {/* CALENDAR / TABLE */}
      {loading ? (
        <p style={{ padding: 20 }}>Loading inventory...</p>
      ) : (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Total</th>
                <th style={styles.th}>Available</th>
                <th style={styles.th}>Base Price</th>
                <th style={styles.th}>Offer Price</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {dateList.map((dateStr) => {
                const entry = inventoryByDate[dateStr];
                const isBlocked = entry?.stopSell;
                return (
                  <tr key={dateStr}>
                    <td style={styles.td}>
                      <strong>
                        {new Date(dateStr).toLocaleDateString("en-IN", {
                          weekday: "short",
                          day: "2-digit",
                          month: "short",
                        })}
                      </strong>
                    </td>
                    <td style={styles.td}>
                      {entry ? entry.totalRooms : <span style={styles.dim}>—</span>}
                    </td>
                    <td style={styles.td}>
                      {entry ? entry.availableRooms : <span style={styles.dim}>—</span>}
                    </td>
                    <td style={styles.td}>
                      {entry ? `₹${entry.basePrice}` : <span style={styles.dim}>Not set</span>}
                    </td>
                    <td style={styles.td}>
                      {entry?.offerPrice ? `₹${entry.offerPrice}` : <span style={styles.dim}>—</span>}
                    </td>
                    <td style={styles.td}>
                      {!entry ? (
                        <span style={styles.statusDefault}>Default</span>
                      ) : isBlocked ? (
                        <span style={styles.statusBlocked}>Stop Sell</span>
                      ) : (
                        <span style={styles.statusOpen}>Open</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      <button
                        style={styles.editBtn}
                        onClick={() => openEditForm(dateStr, entry)}
                      >
                        {entry ? "✏️ Edit" : "+ Set"}
                      </button>
                      {entry && (
                        <>
                          <button
                            style={
                              isBlocked
                                ? styles.unblockBtn
                                : styles.blockBtn
                            }
                            onClick={() =>
                              handleStopSellToggle(entry, dateStr)
                            }
                          >
                            {isBlocked ? "Unblock" : "Block"}
                          </button>
                          <button
                            style={styles.deleteBtn}
                            onClick={() => handleDelete(entry)}
                          >
                            🗑️
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ADD/EDIT MODAL */}
      {showForm && editingEntry && (
        <InventoryFormModal
          dateStr={editingEntry.dateStr}
          entry={editingEntry.entry}
          onCancel={() => {
            setShowForm(false);
            setEditingEntry(null);
          }}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </div>
  );
}

/* ============================================================
   INVENTORY ADD/EDIT FORM MODAL
============================================================ */
function InventoryFormModal({ dateStr, entry, onCancel, onSave, saving }) {
  const [form, setForm] = useState({
    totalRooms: entry?.totalRooms ?? 1,
    basePrice: entry?.basePrice ?? 0,
    offerPrice: entry?.offerPrice ?? 0,
    weekendPrice: entry?.weekendPrice ?? 0,
    holidayPrice: entry?.holidayPrice ?? 0,
    taxPercentage: entry?.taxPercentage ?? 0,
    minimumStay: entry?.minimumStay ?? 1,
    stopSell: entry?.stopSell ?? false,
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.totalRooms || form.totalRooms < 0)
      return alert("Total rooms must be 0 or more");
    if (form.basePrice === "" || form.basePrice < 0)
      return alert("Base price is required");
    onSave(form);
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalBox}>
        <div style={styles.modalHeader}>
          <h3 style={{ margin: 0 }}>
            📅{" "}
            {new Date(dateStr).toLocaleDateString("en-IN", {
              weekday: "long",
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </h3>
          <button style={styles.closeBtn} onClick={onCancel}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.formGrid}>
          <FormField label="Total Rooms *">
            <input
              type="number"
              min="0"
              style={styles.input}
              value={form.totalRooms}
              onChange={(e) =>
                handleChange("totalRooms", Number(e.target.value))
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

          <FormField label="Offer Price (₹)">
            <input
              type="number"
              min="0"
              style={styles.input}
              value={form.offerPrice}
              onChange={(e) =>
                handleChange("offerPrice", Number(e.target.value))
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

          <FormField label="Holiday Price (₹)">
            <input
              type="number"
              min="0"
              style={styles.input}
              value={form.holidayPrice}
              onChange={(e) =>
                handleChange("holidayPrice", Number(e.target.value))
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

          <FormField label="Minimum Stay (nights)">
            <input
              type="number"
              min="1"
              style={styles.input}
              value={form.minimumStay}
              onChange={(e) =>
                handleChange("minimumStay", Number(e.target.value))
              }
            />
          </FormField>

          <FormField label="Availability">
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={form.stopSell}
                onChange={(e) => handleChange("stopSell", e.target.checked)}
              />
              Stop Sell (block this date)
            </label>
          </FormField>

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
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div>
      <label style={styles.label}>{label}</label>
      {children}
    </div>
  );
}

/* ================= STYLES ================= */
const styles = {
  headerRow: { marginBottom: 20 },
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

  controlsBar: {
    display: "flex",
    alignItems: "flex-end",
    gap: 14,
    background: "#fff",
    padding: 16,
    borderRadius: 10,
    marginBottom: 18,
    flexWrap: "wrap",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  controlGroup: { display: "flex", flexDirection: "column" },
  dateInput: {
    padding: "8px 10px",
    borderRadius: 6,
    border: "1px solid #ddd",
    fontSize: 13,
  },
  applyBtn: {
    background: "linear-gradient(90deg, #1a5490 0%, #0f3460 100%)",
    color: "#fff",
    border: "none",
    padding: "9px 16px",
    borderRadius: 6,
    fontWeight: 600,
    cursor: "pointer",
  },
  presetGroup: { display: "flex", gap: 8, marginLeft: "auto" },
  presetBtn: {
    background: "#eef3fb",
    color: "#1a5490",
    border: "none",
    padding: "8px 12px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 600,
  },

  errorBox: {
    background: "#ffe0e0",
    color: "#c0392b",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
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
    padding: "12px 14px",
    fontSize: 12,
    color: "#666",
    textTransform: "uppercase",
    borderBottom: "1px solid #eee",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "12px 14px",
    borderBottom: "1px solid #f2f2f2",
    fontSize: 13,
    whiteSpace: "nowrap",
  },
  dim: { color: "#bbb" },
  statusDefault: {
    background: "#f0f0f0",
    color: "#777",
    padding: "4px 10px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
  },
  statusOpen: {
    background: "#e3fcef",
    color: "#1e824c",
    padding: "4px 10px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
  },
  statusBlocked: {
    background: "#ffe0e0",
    color: "#c0392b",
    padding: "4px 10px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
  },
  editBtn: {
    background: "#eef3fb",
    color: "#1a5490",
    border: "none",
    padding: "6px 10px",
    borderRadius: 6,
    cursor: "pointer",
    marginRight: 6,
    fontSize: 12,
    fontWeight: 600,
  },
  blockBtn: {
    background: "#fff6da",
    color: "#a8710a",
    border: "none",
    padding: "6px 10px",
    borderRadius: 6,
    cursor: "pointer",
    marginRight: 6,
    fontSize: 12,
    fontWeight: 600,
  },
  unblockBtn: {
    background: "#e3fcef",
    color: "#1e824c",
    border: "none",
    padding: "6px 10px",
    borderRadius: 6,
    cursor: "pointer",
    marginRight: 6,
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
    maxWidth: 560,
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
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    color: "#444",
    marginTop: 8,
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