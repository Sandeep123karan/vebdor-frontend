
import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:7000/api/vendor/cabs";

export default function VendorCabs() {
  const token = localStorage.getItem("token");

  const [cabs, setCabs] = useState([]);
  const [image, setImage] = useState(null);
  const [editId, setEditId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [gallery, setGallery] = useState([]); // files
const [galleryPreview, setGalleryPreview] = useState([]); // urls


  const [form, setForm] = useState({
    cabType: "Mini",
    vehicleNumber: "",
    fromCity: "",
    toCity: "",
    pickupTime: "",
    totalSeats: "",
    availableSeats: "",
    price: "",
  });

  useEffect(() => {
    fetchCabs();
  }, []);

  const fetchCabs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCabs(res.data);
    } catch (error) {
      console.error("Error fetching cabs:", error);
    }
    setLoading(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };
const handleGalleryAdd = (e) => {
  const files = Array.from(e.target.files);

  if (gallery.length + files.length > 10) {
    alert("Maximum 10 gallery images allowed");
    return;
  }

  setGallery((prev) => [...prev, ...files]);

  const previews = files.map((f) => URL.createObjectURL(f));
  setGalleryPreview((prev) => [...prev, ...previews]);
};

const removeGalleryImage = (index) => {
  setGallery((prev) => prev.filter((_, i) => i !== index));
  setGalleryPreview((prev) => prev.filter((_, i) => i !== index));
};

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    Object.keys(form).forEach((key) => formData.append(key, form[key]));
    if (image) formData.append("image", image);
gallery.forEach((img) => {
  formData.append("gallery", img);
});
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    };

    try {
      if (editId) {
        await axios.put(`${API}/${editId}`, formData, config);
      } else {
        await axios.post(API, formData, config);
      }

      resetForm();
      setShowModal(false);
      fetchCabs();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
    setLoading(false);
  };

  // const editCab = (cab) => {
  //   setForm({
  //     cabType: cab.cabType,
  //     vehicleNumber: cab.vehicleNumber,
  //     fromCity: cab.fromCity,
  //     toCity: cab.toCity,
  //     pickupTime: cab.pickupTime,
  //     totalSeats: cab.totalSeats,
  //     availableSeats: cab.availableSeats,
  //     price: cab.price,
  //   });
  //   setImagePreview(cab.image);
  //   setEditId(cab._id);
  //   setShowModal(true);
  // };
  const editCab = (cab) => {
  setForm({
    cabType: cab.cabType,
    vehicleNumber: cab.vehicleNumber,
    fromCity: cab.fromCity,
    toCity: cab.toCity,
    pickupTime: cab.pickupTime,
    totalSeats: cab.totalSeats,
    availableSeats: cab.availableSeats,
    price: cab.price,
  });

  setImagePreview(cab.image);
  setGallery([]);
  setGalleryPreview(cab.gallery || []);

  setEditId(cab._id);
  setShowModal(true);
};


  const deleteCab = async (id) => {
    if (!window.confirm("Are you sure you want to delete this cab?")) return;

    setLoading(true);
    try {
      await axios.delete(`${API}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCabs();
    } catch (error) {
      console.error("Error deleting cab:", error);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setForm({
      cabType: "Mini",
      vehicleNumber: "",
      fromCity: "",
      toCity: "",
      pickupTime: "",
      totalSeats: "",
      availableSeats: "",
      price: "",
    });
    setImage(null);
    setImagePreview(null);
    setEditId(null);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const cabTypeIcons = {
    Mini: "🚗",
    Sedan: "🚙",
    SUV: "🚐",
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            <span style={styles.titleIcon}>🚕</span>
            Manage Your Cabs
          </h1>
          <p style={styles.subtitle}>View and manage your cab fleet</p>
        </div>
        <button
          style={styles.addButton}
          onClick={() => setShowModal(true)}
          disabled={loading}
        >
          ➕ Add New Cab
        </button>
      </div>

      {/* Table */}
      {loading && <div style={styles.loader}>Loading...</div>}

      {!loading && cabs.length === 0 && (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🚕</div>
          <p style={styles.emptyText}>No cabs added yet</p>
          <p style={styles.emptySubtext}>Click "Add New Cab" to get started</p>
        </div>
      )}

      {!loading && cabs.length > 0 && (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.th}>Image</th>
                <th style={styles.th}>Vehicle Details</th>
                <th style={styles.th}>Route</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Pickup Time</th>
                <th style={styles.th}>Seats</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Price</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cabs.map((cab) => (
                <tr key={cab._id} style={styles.tableRow}>
                  <td style={styles.td}>
                    {cab.image ? (
                      <img
                        src={cab.image}
                        alt={cab.cabType}
                        style={styles.cabImage}
                      />
                    ) : (
                      <div style={styles.noImage}>
                        {cabTypeIcons[cab.cabType] || "🚗"}
                      </div>
                    )}
                  </td>
                  <td style={styles.td}>
                    <div style={styles.vehicleDetails}>
                      <span style={styles.vehicleNumber}>
                        {cab.vehicleNumber}
                      </span>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.routeInfo}>
                      <span style={styles.cityText}>{cab.fromCity}</span>
                      <span style={styles.arrow}>→</span>
                      <span style={styles.cityText}>{cab.toCity}</span>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.typeBadge}>
                      {cabTypeIcons[cab.cabType]} {cab.cabType}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.timeText}>🕐 {cab.pickupTime}</span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.seatsInfo}>
                      <span style={styles.seatsText}>
                        {cab.availableSeats} / {cab.totalSeats}
                      </span>
                      <span style={styles.seatsLabel}>available</span>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.statusBadge,
                        ...(cab.availableSeats > 0
                          ? styles.statusAvailable
                          : styles.statusFull),
                      }}
                    >
                      {cab.availableSeats > 0 ? "🟢 Available" : "🔴 Full"}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.priceInfo}>
                      <span style={styles.priceAmount}>₹{cab.price}</span>
                      <span style={styles.priceLabel}>fixed</span>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actionButtons}>
                      <button
                        onClick={() => editCab(cab)}
                        style={styles.editBtn}
                        disabled={loading}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => deleteCab(cab._id)}
                        style={styles.deleteBtn}
                        disabled={loading}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Form */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div
            style={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editId ? "✏️ Edit Cab" : "➕ Add New Cab"}
              </h2>
              <button style={styles.closeButton} onClick={closeModal}>
                ✕
              </button>
            </div>

            <form onSubmit={submit} style={styles.modalForm}>
              {/* Vehicle Information */}
              <div style={styles.formSection}>
                <h3 style={styles.sectionTitle}>🚕 Vehicle Information</h3>
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Cab Type *</label>
                    <select
                      value={form.cabType}
                      onChange={(e) =>
                        setForm({ ...form, cabType: e.target.value })
                      }
                      style={styles.select}
                      required
                    >
                      <option value="Mini">🚗 Mini</option>
                      <option value="Sedan">🚙 Sedan</option>
                      <option value="SUV">🚐 SUV</option>
                    </select>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Vehicle Number *</label>
                    <input
                      placeholder="e.g., MH-01-AB-1234"
                      value={form.vehicleNumber}
                      onChange={(e) =>
                        setForm({ ...form, vehicleNumber: e.target.value })
                      }
                      style={styles.input}
                      required
                    />
                  </div>
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Total Seats *</label>
                    <input
                      type="number"
                      placeholder="e.g., 4"
                      value={form.totalSeats}
                      onChange={(e) =>
                        setForm({ ...form, totalSeats: e.target.value })
                      }
                      style={styles.input}
                      min="1"
                      required
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Available Seats *</label>
                    <input
                      type="number"
                      placeholder="e.g., 4"
                      value={form.availableSeats}
                      onChange={(e) =>
                        setForm({ ...form, availableSeats: e.target.value })
                      }
                      style={styles.input}
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Cab Image {!editId && "*"}
                  </label>
                  <input
                    type="file"
                    onChange={handleImageChange}
                    style={styles.fileInput}
                    accept="image/*"
                    required={!editId}
                  />
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      style={styles.imagePreview}
                      alt="Preview"
                    />
                  )}
                </div>
              </div>
              {/* GALLERY SECTION */}
<div style={styles.formSection}>
  <h3 style={styles.sectionTitle}>🖼️ Cab Gallery (Max 10)</h3>

  <div style={styles.galleryGrid}>
    {galleryPreview.map((img, i) => (
      <div key={i} style={styles.galleryItem}>
        <img src={img} style={styles.galleryImg} />
        <button
          type="button"
          style={styles.removeImg}
          onClick={() => removeGalleryImage(i)}
        >
          ✕
        </button>
      </div>
    ))}

    {galleryPreview.length < 10 && (
      <label style={styles.addGalleryBox}>
        ➕
        <input
          type="file"
          multiple
          accept="image/*"
          hidden
          onChange={handleGalleryAdd}
        />
      </label>
    )}
  </div>
</div>


              {/* Route Information */}
              <div style={styles.formSection}>
                <h3 style={styles.sectionTitle}>🗺️ Route Information</h3>
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>From City *</label>
                    <input
                      placeholder="e.g., Mumbai"
                      value={form.fromCity}
                      onChange={(e) =>
                        setForm({ ...form, fromCity: e.target.value })
                      }
                      style={styles.input}
                      required
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>To City *</label>
                    <input
                      placeholder="e.g., Pune"
                      value={form.toCity}
                      onChange={(e) =>
                        setForm({ ...form, toCity: e.target.value })
                      }
                      style={styles.input}
                      required
                    />
                  </div>
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Pickup Time *</label>
                    <input
                      type="time"
                      value={form.pickupTime}
                      onChange={(e) =>
                        setForm({ ...form, pickupTime: e.target.value })
                      }
                      style={styles.input}
                      required
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Fixed Price (₹) *</label>
                    <input
                      type="number"
                      placeholder="e.g., 500"
                      value={form.price}
                      onChange={(e) =>
                        setForm({ ...form, price: e.target.value })
                      }
                      style={styles.input}
                      min="0"
                      required
                    />
                  </div>
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button
                  type="button"
                  style={styles.cancelBtn}
                  onClick={closeModal}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={styles.submitBtn}
                  disabled={loading}
                >
                  {loading
                    ? "⏳ Processing..."
                    : editId
                    ? "💾 Update Cab"
                    : "➕ Add Cab"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "1600px",
    margin: "0 auto",
    padding: "32px 24px",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
    flexWrap: "wrap",
    gap: "16px",
  },
  title: {
    fontSize: "36px",
    fontWeight: "700",
    color: "#1a1a1a",
    margin: "0",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  titleIcon: {
    fontSize: "40px",
  },
  subtitle: {
    fontSize: "16px",
    color: "#6c757d",
    margin: "4px 0 0 0",
  },
  addButton: {
    padding: "14px 28px",
    fontSize: "16px",
    fontWeight: "600",
    color: "white",
    backgroundColor: "#0d6efd",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
    fontFamily: "inherit",
  },
  loader: {
    textAlign: "center",
    padding: "64px",
    fontSize: "18px",
    color: "#6c757d",
  },
  emptyState: {
    textAlign: "center",
    padding: "80px 24px",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  emptyIcon: {
    fontSize: "72px",
    marginBottom: "16px",
  },
  emptyText: {
    fontSize: "22px",
    fontWeight: "600",
    color: "#495057",
    margin: "0 0 8px 0",
  },
  emptySubtext: {
    fontSize: "16px",
    color: "#6c757d",
    margin: "0",
  },
  tableContainer: {
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    overflow: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1200px",
  },
  tableHeaderRow: {
    backgroundColor: "#f8f9fa",
  },
  th: {
    padding: "16px",
    textAlign: "left",
    fontSize: "13px",
    fontWeight: "700",
    color: "#495057",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    borderBottom: "2px solid #dee2e6",
  },
  tableRow: {
    borderBottom: "1px solid #f1f3f5",
    transition: "background-color 0.2s",
  },
  td: {
    padding: "16px",
    fontSize: "14px",
    color: "#495057",
    verticalAlign: "middle",
  },
  cabImage: {
    width: "80px",
    height: "60px",
    objectFit: "cover",
    borderRadius: "6px",
    border: "1px solid #e9ecef",
  },
  noImage: {
    width: "80px",
    height: "60px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: "6px",
    fontSize: "32px",
  },
  vehicleDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  vehicleNumber: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1a1a1a",
    fontFamily: "monospace",
  },
  routeInfo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  cityText: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1a1a1a",
  },
  arrow: {
    fontSize: "16px",
    color: "#0d6efd",
  },
  typeBadge: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#0d6efd",
    backgroundColor: "#e7f1ff",
    padding: "6px 12px",
    borderRadius: "16px",
    display: "inline-block",
  },
  timeText: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#495057",
  },
  seatsInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  seatsText: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1a1a1a",
  },
  seatsLabel: {
    fontSize: "11px",
    color: "#6c757d",
  },
  statusBadge: {
    fontSize: "13px",
    fontWeight: "600",
    padding: "6px 12px",
    borderRadius: "16px",
    display: "inline-block",
  },
  statusAvailable: {
    color: "#198754",
    backgroundColor: "#d1e7dd",
  },
  statusFull: {
    color: "#dc3545",
    backgroundColor: "#f8d7da",
  },
  priceInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  priceAmount: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#0d6efd",
  },
  priceLabel: {
    fontSize: "11px",
    color: "#6c757d",
  },
  actionButtons: {
    display: "flex",
    gap: "8px",
  },
  editBtn: {
    padding: "8px 12px",
    fontSize: "16px",
    backgroundColor: "#e7f1ff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  deleteBtn: {
    padding: "8px 12px",
    fontSize: "16px",
    backgroundColor: "#ffe6e8",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  // Modal Styles
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "900px",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px 32px",
    borderBottom: "2px solid #f1f3f5",
    position: "sticky",
    top: 0,
    backgroundColor: "white",
    zIndex: 1,
  },
  modalTitle: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#1a1a1a",
    margin: 0,
  },
  closeButton: {
    fontSize: "24px",
    fontWeight: "400",
    color: "#6c757d",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "4px 12px",
    borderRadius: "6px",
    transition: "all 0.2s",
  },
  modalForm: {
    padding: "32px",
    display: "flex",
    flexDirection: "column",
    gap: "28px",
  },
  formSection: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#495057",
    margin: "0 0 8px 0",
    paddingBottom: "10px",
    borderBottom: "2px solid #e9ecef",
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#495057",
  },
  input: {
    padding: "12px 16px",
    fontSize: "15px",
    border: "2px solid #e9ecef",
    borderRadius: "8px",
    outline: "none",
    transition: "all 0.2s",
    fontFamily: "inherit",
  },
  select: {
    padding: "12px 16px",
    fontSize: "15px",
    border: "2px solid #e9ecef",
    borderRadius: "8px",
    outline: "none",
    transition: "all 0.2s",
    cursor: "pointer",
    backgroundColor: "white",
    fontFamily: "inherit",
  },
  fileInput: {
    padding: "10px",
    fontSize: "14px",
    border: "2px dashed #dee2e6",
    borderRadius: "8px",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  imagePreview: {
    width: "200px",
    height: "140px",
    objectFit: "cover",
    borderRadius: "8px",
    border: "2px solid #e9ecef",
    marginTop: "8px",
  },
  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    paddingTop: "24px",
    borderTop: "2px solid #f1f3f5",
  },
  cancelBtn: {
    padding: "12px 24px",
    fontSize: "15px",
    fontWeight: "600",
    color: "#495057",
    backgroundColor: "#e9ecef",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
    fontFamily: "inherit",
  },
  submitBtn: {
    padding: "12px 24px",
    fontSize: "15px",
    fontWeight: "600",
    color: "white",
    backgroundColor: "#0d6efd",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
    fontFamily: "inherit",
  },
  galleryGrid: {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(120px,1fr))",
  gap: "12px",
},

galleryItem: {
  position: "relative",
},

galleryImg: {
  width: "100%",
  height: "100px",
  objectFit: "cover",
  borderRadius: "8px",
  border: "2px solid #e9ecef",
},

removeImg: {
  position: "absolute",
  top: "6px",
  right: "6px",
  background: "rgba(0,0,0,0.6)",
  color: "#fff",
  border: "none",
  borderRadius: "50%",
  width: "24px",
  height: "24px",
  cursor: "pointer",
},

addGalleryBox: {
  height: "100px",
  border: "2px dashed #adb5bd",
  borderRadius: "8px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "32px",
  color: "#6c757d",
  cursor: "pointer",
},

};
