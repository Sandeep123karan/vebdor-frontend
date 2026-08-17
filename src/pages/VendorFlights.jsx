

import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:7000/api/flights";

export default function VendorFlights() {
  const token = localStorage.getItem("token");

  const [flights, setFlights] = useState([]);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [gallery, setGallery] = useState([]);
  const [galleryPreview, setGalleryPreview] = useState([]);

  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    flightName: "",
    flightNumber: "",
    fromCity: "",
    toCity: "",
    travelDate: "",
    departureTime: "",
    arrivalTime: "",
    totalSeats: "",
    price: "",
  });

  /* ================= FETCH ================= */
  useEffect(() => {
    fetchFlights();
  }, []);

  const fetchFlights = async () => {
    try {
      const res = await axios.get(`${API}/vendor`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFlights(res.data);
    } catch (err) {
      setError("Failed to fetch flights");
      console.error(err);
    }
  };

  /* ================= MAIN IMAGE ================= */
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  /* ================= GALLERY ================= */
  const addGalleryImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      e.target.value = "";
      return;
    }

    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      e.target.value = "";
      return;
    }

    if (gallery.length >= 10) {
      alert("Maximum 10 gallery images allowed");
      e.target.value = "";
      return;
    }

    setGallery([...gallery, file]);
    setGalleryPreview([...galleryPreview, URL.createObjectURL(file)]);
    e.target.value = "";
  };

  const removeGalleryImage = (index) => {
    setGallery(gallery.filter((_, i) => i !== index));
    setGalleryPreview(galleryPreview.filter((_, i) => i !== index));
  };

  /* ================= SUBMIT ================= */
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));

      if (image) formData.append("image", image);

      gallery.forEach((img) => formData.append("gallery", img));

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      if (editId) {
        await axios.put(`${API}/${editId}`, formData, config);
      } else {
        await axios.post(API, formData, config);
      }

      resetForm();
      fetchFlights();
      alert(editId ? "Flight updated successfully!" : "Flight added successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= EDIT ================= */
  const editFlight = (f) => {
    setEditId(f._id);
    setForm({
      flightName: f.flightName,
      flightNumber: f.flightNumber,
      fromCity: f.fromCity,
      toCity: f.toCity,
      travelDate: f.travelDate?.slice(0, 10),
      departureTime: f.departureTime,
      arrivalTime: f.arrivalTime,
      totalSeats: f.totalSeats,
      price: f.price,
    });
    setImagePreview(f.image);
    setGalleryPreview(f.gallery || []);
    setGallery([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ================= DELETE ================= */
  const deleteFlight = async (id) => {
    if (!window.confirm("Are you sure you want to delete this flight?")) return;
    
    try {
      await axios.delete(`${API}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchFlights();
      alert("Flight deleted successfully!");
    } catch (err) {
      setError("Failed to delete flight");
      console.error(err);
    }
  };

  const resetForm = () => {
    setEditId(null);
    setImage(null);
    setImagePreview(null);
    setGallery([]);
    setGalleryPreview([]);
    setForm({
      flightName: "",
      flightNumber: "",
      fromCity: "",
      toCity: "",
      travelDate: "",
      departureTime: "",
      arrivalTime: "",
      totalSeats: "",
      price: "",
    });
  };

  /* ================= UI ================= */
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>✈️ Manage Flights</h1>

      {error && <div style={styles.error}>{error}</div>}

      <form onSubmit={submit} style={styles.formCard}>
        <h2 style={styles.formTitle}>
          {editId ? "✏️ Edit Flight" : "➕ Add New Flight"}
        </h2>

        <div style={styles.grid}>
          {Object.keys(form).map((key) => (
            <div key={key} style={styles.inputGroup}>
              <label style={styles.label}>
                {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
              </label>
              <input
                type={
                  key.includes("Date")
                    ? "date"
                    : key.includes("Time")
                    ? "time"
                    : key.includes("Seats") || key.includes("price")
                    ? "number"
                    : "text"
                }
                placeholder={key}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                style={styles.input}
                required
              />
            </div>
          ))}
        </div>

        {/* MAIN IMAGE */}
        <div style={styles.imageSection}>
          <h4 style={styles.sectionTitle}>📷 Main Image</h4>
          <input
            type="file"
            onChange={handleImage}
            accept="image/*"
            required={!editId}
            style={styles.fileInput}
          />
          {imagePreview && (
            <div style={styles.previewContainer}>
              <img src={imagePreview} style={styles.preview} alt="Preview" />
            </div>
          )}
        </div>

        {/* GALLERY */}
        <div style={styles.gallerySection}>
          <h4 style={styles.sectionTitle}>
            🖼️ Gallery Images ({galleryPreview.length}/10)
          </h4>
          <div style={styles.galleryRow}>
            {galleryPreview.map((img, i) => (
              <div key={i} style={styles.galleryItem}>
                <img src={img} style={styles.galleryImg} alt={`Gallery ${i + 1}`} />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(i)}
                  style={styles.removeBtn}
                  title="Remove image"
                >
                  ✖
                </button>
              </div>
            ))}

            {galleryPreview.length < 10 && (
              <label style={styles.addBox}>
                <span style={styles.addIcon}>+</span>
                <span style={styles.addText}>Add Image</span>
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={addGalleryImage}
                />
              </label>
            )}
          </div>
        </div>

        <div style={styles.btnGroup}>
          <button type="submit" style={styles.btnSubmit} disabled={loading}>
            {loading ? "⏳ Saving..." : editId ? "✅ Update Flight" : "➕ Add Flight"}
          </button>
          {editId && (
            <button
              type="button"
              onClick={resetForm}
              style={styles.btnCancel}
              disabled={loading}
            >
              ❌ Cancel
            </button>
          )}
        </div>
      </form>

      {/* FLIGHTS LIST */}
      <h2 style={styles.listHeading}>📋 All Flights ({flights.length})</h2>
      <div style={styles.gridList}>
        {flights.map((f) => (
          <div key={f._id} style={styles.card}>
            <div style={styles.cardImgWrapper}>
              <img src={f.image} style={styles.cardImg} alt={f.flightName} />
              {f.gallery && f.gallery.length > 0 && (
                <div style={styles.galleryBadge}>+{f.gallery.length} photos</div>
              )}
            </div>
            
            <div style={styles.cardContent}>
              <h3 style={styles.cardTitle}>{f.flightName}</h3>
              <p style={styles.flightNumber}>Flight: {f.flightNumber}</p>
              <p style={styles.route}>
                {f.fromCity} → {f.toCity}
              </p>
              <p style={styles.date}>📅 {new Date(f.travelDate).toLocaleDateString()}</p>
              <p style={styles.time}>
                🕐 {f.departureTime} - {f.arrivalTime}
              </p>
              <div style={styles.cardFooter}>
                <span style={styles.price}>₹ {f.price}</span>
                <span style={styles.seats}>💺 {f.totalSeats} seats</span>
              </div>
            </div>

            <div style={styles.actions}>
              <button onClick={() => editFlight(f)} style={styles.btnEdit}>
                ✏️ Edit
              </button>
              <button onClick={() => deleteFlight(f._id)} style={styles.btnDelete}>
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {flights.length === 0 && (
        <div style={styles.emptyState}>
          <p>No flights added yet. Start by adding your first flight! ✈️</p>
        </div>
      )}
    </div>
  );
}

/* ================= STYLES ================= */
const styles = {
  container: {
    padding: "30px",
    maxWidth: "1400px",
    margin: "0 auto",
    backgroundColor: "#f5f7fa",
    minHeight: "100vh",
  },
  heading: {
    fontSize: "32px",
    marginBottom: "30px",
    color: "#0f3460",
    textAlign: "center",
  },
  error: {
    backgroundColor: "#fee",
    color: "#c33",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "20px",
    border: "1px solid #fcc",
  },
  formCard: {
    background: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    marginBottom: "40px",
  },
  formTitle: {
    fontSize: "24px",
    marginBottom: "25px",
    color: "#0f3460",
    borderBottom: "2px solid #e8f4f8",
    paddingBottom: "10px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginBottom: "25px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#555",
    marginBottom: "6px",
    textTransform: "capitalize",
  },
  input: {
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
    transition: "border 0.3s",
    outline: "none",
  },
  imageSection: {
    marginTop: "25px",
    paddingTop: "25px",
    borderTop: "1px solid #eee",
  },
  sectionTitle: {
    fontSize: "16px",
    marginBottom: "12px",
    color: "#0f3460",
  },
  fileInput: {
    padding: "10px",
    border: "2px dashed #ccc",
    borderRadius: "6px",
    cursor: "pointer",
    width: "100%",
  },
  previewContainer: {
    marginTop: "15px",
  },
  preview: {
    width: "250px",
    height: "180px",
    objectFit: "cover",
    borderRadius: "8px",
    border: "2px solid #e8f4f8",
  },
  gallerySection: {
    marginTop: "25px",
    paddingTop: "25px",
    borderTop: "1px solid #eee",
  },
  galleryRow: {
    display: "flex",
    gap: "15px",
    flexWrap: "wrap",
    marginTop: "15px",
  },
  galleryItem: {
    position: "relative",
    width: "110px",
    height: "110px",
    borderRadius: "8px",
    overflow: "hidden",
    border: "2px solid #e8f4f8",
  },
  galleryImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  removeBtn: {
    position: "absolute",
    top: "5px",
    right: "5px",
    background: "rgba(255, 0, 0, 0.8)",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    width: "25px",
    height: "25px",
    cursor: "pointer",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  addBox: {
    width: "110px",
    height: "110px",
    border: "2px dashed #999",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.3s",
    backgroundColor: "#f9f9f9",
  },
  addIcon: {
    fontSize: "32px",
    color: "#0f3460",
  },
  addText: {
    fontSize: "11px",
    color: "#666",
    marginTop: "5px",
  },
  btnGroup: {
    marginTop: "30px",
    display: "flex",
    gap: "15px",
  },
  btnSubmit: {
    flex: 1,
    padding: "14px",
    background: "#0f3460",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background 0.3s",
  },
  btnCancel: {
    padding: "14px 30px",
    background: "#6c757d",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
  },
  listHeading: {
    fontSize: "24px",
    marginBottom: "20px",
    color: "#0f3460",
  },
  gridList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "25px",
  },
  card: {
    background: "#fff",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    transition: "transform 0.3s, box-shadow 0.3s",
  },
  cardImgWrapper: {
    position: "relative",
  },
  cardImg: {
    width: "100%",
    height: "180px",
    objectFit: "cover",
  },
  galleryBadge: {
    position: "absolute",
    bottom: "10px",
    right: "10px",
    background: "rgba(0,0,0,0.7)",
    color: "#fff",
    padding: "5px 10px",
    borderRadius: "15px",
    fontSize: "12px",
  },
  cardContent: {
    padding: "20px",
  },
  cardTitle: {
    fontSize: "18px",
    marginBottom: "8px",
    color: "#0f3460",
  },
  flightNumber: {
    fontSize: "13px",
    color: "#666",
    marginBottom: "8px",
  },
  route: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#333",
    marginBottom: "8px",
  },
  date: {
    fontSize: "13px",
    color: "#666",
    marginBottom: "5px",
  },
  time: {
    fontSize: "13px",
    color: "#666",
    marginBottom: "12px",
  },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: "12px",
    borderTop: "1px solid #eee",
  },
  price: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#0f3460",
  },
  seats: {
    fontSize: "13px",
    color: "#666",
  },
  actions: {
    display: "flex",
    gap: "10px",
    padding: "15px",
    borderTop: "1px solid #eee",
  },
  btnEdit: {
    flex: 1,
    padding: "10px",
    background: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },
  btnDelete: {
    flex: 1,
    padding: "10px",
    background: "#dc3545",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    background: "#fff",
    borderRadius: "12px",
    fontSize: "16px",
    color: "#666",
  },
};