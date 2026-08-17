import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:7000/api/vendor/holidays";

export default function VendorHoliday() {
  const token = localStorage.getItem("token");

  const headers = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const [holidays, setHolidays] = useState([]);
  const [filteredHolidays, setFilteredHolidays] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [banner, setBanner] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [form, setForm] = useState({
    title: "",
    destination: "",
    country: "India",
    duration: "",
    packageType: "Domestic",
    category: "Budget",
    overview: "",
    perPerson: "",
    discountPrice: "",
    validFrom: "",
    validTill: "",
  });

  const [filters, setFilters] = useState({
    searchQuery: "",
    packageType: "",
    category: "",
    sortBy: "newest",
  });

  const packageTypes = ["Domestic", "International"];
  const categories = ["Budget", "Mid-Range", "Premium", "Luxury"];
  const countries = [
    "India",
    "Thailand",
    "Dubai",
    "Singapore",
    "Malaysia",
    "Maldives",
    "Sri Lanka",
    "Nepal",
    "Bhutan",
    "Indonesia",
  ];

  /* ================= FETCH HOLIDAYS ================= */
  useEffect(() => {
    if (!token) {
      window.location.href = "/";
      return;
    }
    loadHolidays();
  }, [token]);

  /* ================= APPLY FILTERS ================= */
  useEffect(() => {
    applyFilters();
  }, [holidays, filters]);

  const applyFilters = () => {
    let result = [...holidays];

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(
        (h) =>
          h.title?.toLowerCase().includes(query) ||
          h.destination?.toLowerCase().includes(query)
      );
    }

    if (filters.packageType) {
      result = result.filter((h) => h.packageType === filters.packageType);
    }

    if (filters.category) {
      result = result.filter((h) => h.category === filters.category);
    }

    switch (filters.sortBy) {
      case "price-low":
        result.sort((a, b) => (a.pricing?.perPerson || 0) - (b.pricing?.perPerson || 0));
        break;
      case "price-high":
        result.sort((a, b) => (b.pricing?.perPerson || 0) - (a.pricing?.perPerson || 0));
        break;
      case "title":
        result.sort((a, b) => a.title?.localeCompare(b.title));
        break;
      case "newest":
      default:
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFilteredHolidays(result);
  };

  const resetFilters = () => {
    setFilters({
      searchQuery: "",
      packageType: "",
      category: "",
      sortBy: "newest",
    });
  };

  /* ================= LOAD ================= */
  const loadHolidays = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API, headers);
      setHolidays(res.data.data || res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load holidays");
    }
    setLoading(false);
  };

  /* ================= BANNER HANDLING ================= */
  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }
      setBanner(file);
      setBannerPreview(URL.createObjectURL(file));
      setError("");
    }
  };

  /* ================= GALLERY HANDLING ================= */
  const handleGalleryAdd = (e) => {
    const files = Array.from(e.target.files);
    if (gallery.length + files.length > 10) {
      setError("Maximum 10 gallery images allowed");
      return;
    }
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) return false;
      if (file.size > 5 * 1024 * 1024) return false;
      return true;
    });
    setGallery((prev) => [...prev, ...validFiles]);
    setGalleryPreviews((prev) => [
      ...prev,
      ...validFiles.map((f) => URL.createObjectURL(f)),
    ]);
  };

  const removeGalleryImage = (index) => {
    setGallery((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  /* ================= SUBMIT ================= */
  const submitHandler = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.destination.trim()) {
      setError("Please fill all required fields");
      return;
    }

    if (!editingId && !banner) {
      setError("Please upload a banner image");
      return;
    }

    setSubmitting(true);
    setError("");

    const fd = new FormData();
    Object.keys(form).forEach((k) => {
      if (k !== "perPerson" && k !== "discountPrice" && form[k]) {
        fd.append(k, form[k]);
      }
    });

    fd.append(
      "pricing",
      JSON.stringify({
        perPerson: form.perPerson,
        discountPrice: form.discountPrice,
      })
    );

    if (banner) fd.append("banner", banner);
    gallery.forEach((img) => fd.append("gallery", img));

    try {
      if (editingId) {
        await axios.put(`${API}/${editingId}`, fd, headers);
      } else {
        await axios.post(API, fd, headers);
      }
      resetForm();
      setShowModal(false);
      loadHolidays();
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed");
    }
    setSubmitting(false);
  };

  /* ================= EDIT ================= */
  const startEdit = (h) => {
    setEditingId(h._id);
    setForm({
      title: h.title,
      destination: h.destination,
      country: h.country,
      duration: h.duration,
      packageType: h.packageType,
      category: h.category,
      overview: h.overview,
      perPerson: h.pricing?.perPerson || "",
      discountPrice: h.pricing?.discountPrice || "",
      validFrom: h.validFrom?.substring(0, 10) || "",
      validTill: h.validTill?.substring(0, 10) || "",
    });
    setBanner(null);
    setBannerPreview(h.bannerImage || null);
    setGallery([]);
    setGalleryPreviews(h.galleryImages || []);
    setShowModal(true);
  };

  /* ================= DELETE ================= */
  const deleteHoliday = async (id) => {
    if (!window.confirm("Are you sure you want to delete this holiday package?")) return;
    setLoading(true);
    try {
      await axios.delete(`${API}/${id}`, headers);
      loadHolidays();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete holiday");
    }
    setLoading(false);
  };

  const resetForm = () => {
    setEditingId(null);
    setBanner(null);
    setBannerPreview(null);
    setGallery([]);
    setGalleryPreviews([]);
    setForm({
      title: "",
      destination: "",
      country: "India",
      duration: "",
      packageType: "Domestic",
      category: "Budget",
      overview: "",
      perPerson: "",
      discountPrice: "",
      validFrom: "",
      validTill: "",
    });
    setError("");
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  /* ================= RENDER ================= */
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            <span style={styles.titleIcon}>🏖️</span>
            Manage Holiday Packages
          </h1>
          <p style={styles.subtitle}>View and manage your holiday packages</p>
        </div>
        <div style={styles.headerActions}>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={styles.filterButton}
          >
            🔍 {showFilters ? "Hide" : "Show"} Filters
          </button>
          <button
            onClick={() => setShowModal(true)}
            style={styles.addButton}
            disabled={loading}
          >
            ➕ Add New Package
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={styles.errorBox}>
          <span>⚠️ {error}</span>
          <button onClick={() => setError("")} style={styles.closeError}>
            ✕
          </button>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div style={styles.filtersCard}>
          <div style={styles.filtersHeader}>
            <h3 style={styles.filtersTitle}>🔍 Filters & Search</h3>
            <button onClick={resetFilters} style={styles.resetBtn}>
              Reset All
            </button>
          </div>

          <div style={styles.filtersGrid}>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Search</label>
              <input
                type="text"
                placeholder="Search by title or destination..."
                value={filters.searchQuery}
                onChange={(e) =>
                  setFilters({ ...filters, searchQuery: e.target.value })
                }
                style={styles.filterInput}
              />
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Package Type</label>
              <select
                value={filters.packageType}
                onChange={(e) =>
                  setFilters({ ...filters, packageType: e.target.value })
                }
                style={styles.filterInput}
              >
                <option value="">All Types</option>
                {packageTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Category</label>
              <select
                value={filters.category}
                onChange={(e) =>
                  setFilters({ ...filters, category: e.target.value })
                }
                style={styles.filterInput}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters({ ...filters, sortBy: e.target.value })
                }
                style={styles.filterInput}
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price (Low to High)</option>
                <option value="price-high">Price (High to Low)</option>
                <option value="title">Title (A-Z)</option>
              </select>
            </div>
          </div>

          <div style={styles.filterStats}>
            Showing {filteredHolidays.length} of {holidays.length} packages
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && <div style={styles.loader}>Loading...</div>}

      {/* Empty State */}
      {!loading && filteredHolidays.length === 0 && (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🏖️</div>
          <p style={styles.emptyText}>
            {holidays.length === 0
              ? "No holiday packages added yet"
              : "No packages match your filters"}
          </p>
          <p style={styles.emptySubtext}>
            {holidays.length === 0
              ? 'Click "Add New Package" to get started'
              : "Try adjusting your filters"}
          </p>
        </div>
      )}

      {/* Table */}
      {!loading && filteredHolidays.length > 0 && (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.th}>Banner</th>
                <th style={styles.th}>Package Details</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Duration</th>
                <th style={styles.th}>Price</th>
                <th style={styles.th}>Gallery</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredHolidays.map((holiday) => (
                <tr key={holiday._id} style={styles.tableRow}>
                  <td style={styles.td}>
                    {holiday.bannerImage ? (
                      <img
                        src={holiday.bannerImage}
                        alt={holiday.title}
                        style={styles.holidayImage}
                      />
                    ) : (
                      <div style={styles.noImage}>🏖️</div>
                    )}
                  </td>
                  <td style={styles.td}>
                    <div style={styles.holidayDetails}>
                      <span style={styles.holidayName}>{holiday.title}</span>
                      <span style={styles.holidayDesc}>
                        📍 {holiday.destination}, {holiday.country}
                      </span>
                      {holiday.overview && (
                        <span style={styles.holidayOverview}>
                          {holiday.overview.length > 60
                            ? holiday.overview.substring(0, 60) + "..."
                            : holiday.overview}
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.categoryBadge}>
                      {holiday.packageType}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.categoryBadge}>
                      {holiday.category}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.durationText}>
                      ⏱️ {holiday.duration}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.priceContainer}>
                      <span style={styles.priceText}>
                        ₹{holiday.pricing?.perPerson?.toLocaleString('en-IN')}
                      </span>
                      {holiday.pricing?.discountPrice && (
                        <span style={styles.discountPrice}>
                          ₹{holiday.pricing.discountPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.galleryContainer}>
                      {holiday.galleryImages && holiday.galleryImages.length > 0 ? (
                        <>
                          <img
                            src={holiday.galleryImages[0]}
                            alt="gallery"
                            style={styles.galleryThumb}
                          />
                          {holiday.galleryImages.length > 1 && (
                            <span style={styles.galleryCount}>
                              +{holiday.galleryImages.length - 1}
                            </span>
                          )}
                        </>
                      ) : (
                        <span style={styles.noGallery}>No images</span>
                      )}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actionButtons}>
                      <button
                        onClick={() => startEdit(holiday)}
                        style={styles.editBtn}
                        disabled={loading}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => deleteHoliday(holiday._id)}
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

      {/* MODAL */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div
            style={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editingId ? "✏️ Edit Holiday Package" : "➕ Add New Holiday Package"}
              </h2>
              <button style={styles.closeButton} onClick={closeModal}>
                ✕
              </button>
            </div>

            <form onSubmit={submitHandler} style={styles.modalForm}>
              {/* Basic Information */}
              <div style={styles.formSection}>
                <h3 style={styles.sectionTitle}>🏖️ Basic Information</h3>
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Package Title *</label>
                    <input
                      placeholder="e.g., Amazing Goa Beach Holiday"
                      value={form.title}
                      onChange={(e) =>
                        setForm({ ...form, title: e.target.value })
                      }
                      style={styles.input}
                      disabled={submitting}
                      required
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Destination *</label>
                    <input
                      placeholder="e.g., Goa"
                      value={form.destination}
                      onChange={(e) =>
                        setForm({ ...form, destination: e.target.value })
                      }
                      style={styles.input}
                      disabled={submitting}
                      required
                    />
                  </div>
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Country *</label>
                    <select
                      value={form.country}
                      onChange={(e) =>
                        setForm({ ...form, country: e.target.value })
                      }
                      style={styles.select}
                      disabled={submitting}
                      required
                    >
                      {countries.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Duration *</label>
                    <input
                      placeholder="e.g., 5D/4N"
                      value={form.duration}
                      onChange={(e) =>
                        setForm({ ...form, duration: e.target.value })
                      }
                      style={styles.input}
                      disabled={submitting}
                      required
                    />
                  </div>
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Package Type *</label>
                    <select
                      value={form.packageType}
                      onChange={(e) =>
                        setForm({ ...form, packageType: e.target.value })
                      }
                      style={styles.select}
                      disabled={submitting}
                      required
                    >
                      {packageTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Category *</label>
                    <select
                      value={form.category}
                      onChange={(e) =>
                        setForm({ ...form, category: e.target.value })
                      }
                      style={styles.select}
                      disabled={submitting}
                      required
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Overview</label>
                  <textarea
                    placeholder="Describe the holiday package..."
                    value={form.overview}
                    onChange={(e) =>
                      setForm({ ...form, overview: e.target.value })
                    }
                    style={{ ...styles.input, ...styles.textarea }}
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* Pricing */}
              <div style={styles.formSection}>
                <h3 style={styles.sectionTitle}>💰 Pricing</h3>
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Price Per Person (₹) *</label>
                    <input
                      type="number"
                      placeholder="e.g., 25000"
                      value={form.perPerson}
                      onChange={(e) =>
                        setForm({ ...form, perPerson: e.target.value })
                      }
                      style={styles.input}
                      disabled={submitting}
                      min="0"
                      required
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Discount Price (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g., 22000"
                      value={form.discountPrice}
                      onChange={(e) =>
                        setForm({ ...form, discountPrice: e.target.value })
                      }
                      style={styles.input}
                      disabled={submitting}
                      min="0"
                    />
                  </div>
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Valid From</label>
                    <input
                      type="date"
                      value={form.validFrom}
                      onChange={(e) =>
                        setForm({ ...form, validFrom: e.target.value })
                      }
                      style={styles.input}
                      disabled={submitting}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Valid Till</label>
                    <input
                      type="date"
                      value={form.validTill}
                      onChange={(e) =>
                        setForm({ ...form, validTill: e.target.value })
                      }
                      style={styles.input}
                      disabled={submitting}
                    />
                  </div>
                </div>
              </div>

              {/* Images */}
              <div style={styles.formSection}>
                <h3 style={styles.sectionTitle}>
                  📸 Images
                </h3>

                {/* Banner Image */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Banner Image {!editingId && "*"}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerChange}
                    style={styles.fileInput}
                    disabled={submitting}
                  />
                  {bannerPreview && (
                    <div style={styles.bannerPreviewContainer}>
                      <img
                        src={bannerPreview}
                        alt="Banner Preview"
                        style={styles.bannerPreview}
                      />
                    </div>
                  )}
                </div>

                {/* Gallery */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Gallery Images (Max 10)
                  </label>
                  <div style={styles.galleryGrid}>
                    {galleryPreviews.map((img, index) => (
                      <div key={index} style={styles.galleryItem}>
                        <img src={img} alt="gallery" style={styles.galleryImg} />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(index)}
                          style={styles.removeBtn}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {galleryPreviews.length < 10 && (
                      <label style={styles.addGallery}>
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
              </div>

              <div style={styles.modalFooter}>
                <button
                  type="button"
                  style={styles.cancelBtn}
                  onClick={closeModal}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={styles.submitBtn}
                  disabled={submitting}
                >
                  {submitting
                    ? "⏳ Processing..."
                    : editingId
                    ? "💾 Update Package"
                    : "➕ Add Package"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= STYLES ================= */
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
  headerActions: {
    display: "flex",
    gap: "12px",
  },
  filterButton: {
    padding: "14px 28px",
    fontSize: "16px",
    fontWeight: "600",
    color: "white",
    backgroundColor: "#6c757d",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
    fontFamily: "inherit",
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
  errorBox: {
    margin: "0 0 24px 0",
    padding: "12px 16px",
    background: "#fee",
    border: "1px solid #fcc",
    borderRadius: "8px",
    color: "#c33",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  closeError: {
    background: "none",
    border: "none",
    color: "#c33",
    fontSize: "18px",
    cursor: "pointer",
  },
  filtersCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  filtersHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  filtersTitle: {
    fontSize: "20px",
    fontWeight: "600",
    margin: 0,
    color: "#1a1a1a",
  },
  resetBtn: {
    padding: "8px 16px",
    background: "#f8f9fa",
    color: "#333",
    border: "1px solid #ddd",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
  filtersGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "16px",
    marginBottom: "16px",
  },
  filterGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  filterLabel: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#495057",
  },
  filterInput: {
    padding: "10px 12px",
    fontSize: "14px",
    border: "2px solid #e9ecef",
    borderRadius: "6px",
    outline: "none",
    fontFamily: "inherit",
  },
  filterStats: {
    marginTop: "16px",
    padding: "12px",
    background: "#f8f9fa",
    borderRadius: "6px",
    fontSize: "14px",
    color: "#666",
    textAlign: "center",
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
  holidayImage: {
    width: "100px",
    height: "70px",
    objectFit: "cover",
    borderRadius: "6px",
    border: "1px solid #e9ecef",
  },
  noImage: {
    width: "100px",
    height: "70px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: "6px",
    fontSize: "32px",
  },
  holidayDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  holidayName: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#1a1a1a",
  },
  holidayDesc: {
    fontSize: "12px",
    color: "#6c757d",
  },
  holidayOverview: {
    fontSize: "11px",
    color: "#adb5bd",
    fontStyle: "italic",
  },
  categoryBadge: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#0d6efd",
    backgroundColor: "#e7f1ff",
    padding: "6px 12px",
    borderRadius: "16px",
    display: "inline-block",
  },
  durationText: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#495057",
  },
  priceContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  priceText: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#198754",
  },
  discountPrice: {
    fontSize: "13px",
    color: "#6c757d",
    textDecoration: "line-through",
  },
  galleryContainer: {
    position: "relative",
    display: "inline-block",
  },
  galleryThumb: {
    width: "60px",
    height: "50px",
    objectFit: "cover",
    borderRadius: "6px",
    border: "1px solid #e9ecef",
  },
  galleryCount: {
    position: "absolute",
    bottom: "4px",
    right: "4px",
    backgroundColor: "rgba(0,0,0,0.7)",
    color: "white",
    padding: "2px 6px",
    borderRadius: "10px",
    fontSize: "10px",
    fontWeight: "600",
  },
  noGallery: {
    fontSize: "11px",
    color: "#adb5bd",
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
  textarea: {
    minHeight: "100px",
    resize: "vertical",
  },
  fileInput: {
    padding: "10px",
    fontSize: "14px",
    border: "2px dashed #dee2e6",
    borderRadius: "8px",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  bannerPreviewContainer: {
    marginTop: "12px",
  },
  bannerPreview: {
    width: "100%",
    maxWidth: "400px",
    height: "200px",
    objectFit: "cover",
    borderRadius: "8px",
    border: "2px solid #e9ecef",
  },
  galleryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, 100px)",
    gap: "10px",
    marginTop: "8px",
  },
  galleryItem: {
    position: "relative",
    width: "100px",
    height: "80px",
  },
  galleryImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "6px",
    border: "1px solid #ddd",
  },
  removeBtn: {
    position: "absolute",
    top: "-6px",
    right: "-6px",
    background: "#dc3545",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    width: "22px",
    height: "22px",
    cursor: "pointer",
    fontSize: "12px",
  },
  addGallery: {
    width: "100px",
    height: "80px",
    border: "2px dashed #ccc",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "26px",
    color: "#666",
    cursor: "pointer",
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
};