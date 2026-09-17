import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:7000/api/homestay-inventory";

// ============================================================
// MAIN COMPONENT
// ============================================================
const VendorHomestayInventory = () => {
  const token = localStorage.getItem("token");

  // State
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Filters
  const [filters, setFilters] = useState({
    homestayId: "",
    unitId: "",
    startDate: "",
    endDate: "",
  });

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    homestayId: "",
    unitId: "",
    date: "",
    basePrice: "",
    weekendPrice: "",
    holidayPrice: "",
    specialPrice: "",
    extraGuestPrice: "",
    discountType: "none",
    discountValue: "",
    taxPercentage: "",
    serviceChargePercentage: "",
    minimumStay: "1",
    maximumStay: "0",
    stopSell: false,
    closedForBooking: false,
    isBlocked: false,
    blockReason: "",
    blockedUnits: "0",
  });

  // Range modal
  const [rangeModalOpen, setRangeModalOpen] = useState(false);
  const [rangeForm, setRangeForm] = useState({
    homestayId: "",
    unitId: "",
    startDate: "",
    endDate: "",
    basePrice: "",
    weekendPrice: "",
    holidayPrice: "",
    specialPrice: "",
    extraGuestPrice: "",
    discountType: "none",
    discountValue: "",
    taxPercentage: "",
    serviceChargePercentage: "",
    minimumStay: "1",
    maximumStay: "0",
    stopSell: false,
    closedForBooking: false,
    isBlocked: false,
    blockReason: "",
    blockedUnits: "0",
  });

  // ============================================================
  // API CALLS
  // ============================================================
  const loadInventory = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (filters.homestayId) params.append("homestayId", filters.homestayId);
      if (filters.unitId) params.append("unitId", filters.unitId);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);

      const response = await axios.get(`${API_URL}?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setInventory(response.data.inventory || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load inventory");
      setInventory([]);
    }
    setLoading(false);
  };

  const createInventory = async (data) => {
    const response = await axios.post(API_URL, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  };

  const createInventoryRange = async (data) => {
    const response = await axios.post(`${API_URL}/range`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  };

  const updateInventory = async (id, data) => {
    const response = await axios.put(`${API_URL}/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  };

  const deleteInventory = async (id) => {
    await axios.delete(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const blockInventory = async (id, data) => {
    const response = await axios.patch(`${API_URL}/${id}/block`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  };

  const unblockInventory = async (id) => {
    const response = await axios.patch(`${API_URL}/${id}/unblock`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  };

  const stopSellInventory = async (id) => {
    const response = await axios.patch(`${API_URL}/${id}/stop-sell`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  };

  const resumeSellInventory = async (id) => {
    const response = await axios.patch(`${API_URL}/${id}/resume-sell`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  };

  // ============================================================
  // LIFE CYCLE
  // ============================================================
  useEffect(() => {
    loadInventory();
  }, [filters]);

  // ============================================================
  // HANDLERS
  // ============================================================
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleRangeFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRangeForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const data = { ...form };
      if (editId) {
        await updateInventory(editId, data);
        setSuccess("Inventory updated successfully!");
      } else {
        await createInventory(data);
        setSuccess("Inventory created successfully!");
      }
      closeModal();
      loadInventory();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save inventory");
    }
    setSubmitting(false);
  };

  const handleRangeSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await createInventoryRange(rangeForm);
      setSuccess("Inventory range created successfully!");
      closeRangeModal();
      loadInventory();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create inventory range");
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this inventory?")) return;
    setLoading(true);
    try {
      await deleteInventory(id);
      setSuccess("Inventory deleted successfully!");
      loadInventory();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete inventory");
    }
    setLoading(false);
  };

  const handleBlock = async (id) => {
    try {
      await blockInventory(id, { reason: "Blocked by vendor" });
      setSuccess("Inventory blocked successfully!");
      loadInventory();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to block inventory");
    }
  };

  const handleUnblock = async (id) => {
    try {
      await unblockInventory(id);
      setSuccess("Inventory unblocked successfully!");
      loadInventory();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to unblock inventory");
    }
  };

  const handleStopSell = async (id) => {
    try {
      await stopSellInventory(id);
      setSuccess("Stop sell enabled!");
      loadInventory();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to enable stop sell");
    }
  };

  const handleResumeSell = async (id) => {
    try {
      await resumeSellInventory(id);
      setSuccess("Sell resumed!");
      loadInventory();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resume sell");
    }
  };

  const openEdit = (item) => {
    setEditId(item._id);
    setForm({
      homestayId: item.homestay?._id || "",
      unitId: item.unit?._id || "",
      date: item.date?.split("T")[0] || "",
      basePrice: item.basePrice || "",
      weekendPrice: item.weekendPrice || "",
      holidayPrice: item.holidayPrice || "",
      specialPrice: item.specialPrice || "",
      extraGuestPrice: item.extraGuestPrice || "",
      discountType: item.discountType || "none",
      discountValue: item.discountValue || "",
      taxPercentage: item.taxPercentage || "",
      serviceChargePercentage: item.serviceChargePercentage || "",
      minimumStay: item.minimumStay || "1",
      maximumStay: item.maximumStay || "0",
      stopSell: item.stopSell || false,
      closedForBooking: item.closedForBooking || false,
      isBlocked: item.isBlocked || false,
      blockReason: item.blockReason || "",
      blockedUnits: item.blockedUnits || "0",
    });
    setModalOpen(true);
  };

  const openCreate = () => {
    setEditId(null);
    setForm({
      homestayId: "",
      unitId: "",
      date: "",
      basePrice: "",
      weekendPrice: "",
      holidayPrice: "",
      specialPrice: "",
      extraGuestPrice: "",
      discountType: "none",
      discountValue: "",
      taxPercentage: "",
      serviceChargePercentage: "",
      minimumStay: "1",
      maximumStay: "0",
      stopSell: false,
      closedForBooking: false,
      isBlocked: false,
      blockReason: "",
      blockedUnits: "0",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditId(null);
  };

  const closeRangeModal = () => {
    setRangeModalOpen(false);
  };

  // ============================================================
  // FORMAT HELPERS
  // ============================================================
  const formatDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return "-";
    return `₹${Number(amount).toLocaleString()}`;
  };

  const formatStatus = (item) => {
    if (item.isBlocked) return { label: "Blocked", className: "status-blocked" };
    if (item.stopSell) return { label: "Stop Sell", className: "status-stopsell" };
    if (item.closedForBooking) return { label: "Closed", className: "status-closed" };
    if (item.isAvailable) return { label: "Available", className: "status-available" };
    return { label: "Unavailable", className: "status-unavailable" };
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🏠 Homestay Inventory</h1>
          <span style={styles.count}>{inventory.length} record(s)</span>
        </div>
        <div style={styles.headerActions}>
          <button style={styles.btnOutline} onClick={loadInventory}>
            <i className="fas fa-sync"></i> Refresh
          </button>
          <button style={styles.btnPrimary} onClick={() => setRangeModalOpen(true)}>
            <i className="fas fa-calendar-plus"></i> Add Range
          </button>
          <button style={styles.btnPrimary} onClick={openCreate}>
            <i className="fas fa-plus"></i> Add Single
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div style={styles.alertError}>
          <span>❌ {error}</span>
          <button style={styles.alertClose} onClick={() => setError("")}>×</button>
        </div>
      )}
      {success && (
        <div style={styles.alertSuccess}>
          <span>✅ {success}</span>
          <button style={styles.alertClose} onClick={() => setSuccess("")}>×</button>
        </div>
      )}

      {/* Filters */}
      <div style={styles.filterBar}>
        <div style={styles.filterGrid}>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Homestay ID</label>
            <input
              style={styles.filterInput}
              name="homestayId"
              placeholder="Enter Homestay ID"
              value={filters.homestayId}
              onChange={handleFilterChange}
            />
          </div>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Unit ID</label>
            <input
              style={styles.filterInput}
              name="unitId"
              placeholder="Enter Unit ID"
              value={filters.unitId}
              onChange={handleFilterChange}
            />
          </div>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Start Date</label>
            <input
              style={styles.filterInput}
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </div>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>End Date</label>
            <input
              style={styles.filterInput}
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </div>
        </div>
        <div style={styles.filterFooter}>
          <span style={styles.textMuted}>
            Showing {inventory.length} records
          </span>
          <button
            style={styles.btnReset}
            onClick={() =>
              setFilters({
                homestayId: "",
                unitId: "",
                startDate: "",
                endDate: "",
              })
            }
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={styles.loading}>Loading...</div>
      ) : inventory.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📅</div>
          <h3 style={styles.emptyTitle}>No inventory records found</h3>
          <p style={styles.emptyText}>
            Add inventory for your homestay units to start managing availability
          </p>
        </div>
      ) : (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Unit</th>
                <th style={styles.th}>Homestay</th>
                <th style={styles.th}>Base Price</th>
                <th style={styles.th}>Final Price</th>
                <th style={styles.th}>Units</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => {
                const status = formatStatus(item);
                return (
                  <tr key={item._id} style={styles.tr}>
                    <td style={styles.td}>{formatDate(item.date)}</td>
                    <td style={styles.td}>
                      <div style={styles.unitName}>{item.unit?.unitName || "N/A"}</div>
                      <div style={styles.unitType}>{item.unit?.unitType || ""}</div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.homestayName}>
                        {item.homestay?.propertyName || "N/A"}
                      </div>
                      <div style={styles.homestayCity}>
                        {item.homestay?.city || ""}
                      </div>
                    </td>
                    <td style={styles.td}>{formatCurrency(item.basePrice)}</td>
                    <td style={styles.td}>
                      <div style={styles.finalPrice}>{formatCurrency(item.finalPrice)}</div>
                      {item.discountType !== "none" && (
                        <div style={styles.discountBadge}>
                          {item.discountType === "percentage" ? `${item.discountValue}%` : `-${formatCurrency(item.discountValue)}`}
                        </div>
                      )}
                    </td>
                    <td style={styles.td}>
                      <div style={styles.unitCount}>
                        <span style={styles.totalUnits}>Total: {item.totalUnits}</span>
                        <span style={styles.availableUnits}>Avail: {item.availableUnits}</span>
                        <span style={styles.bookedUnits}>Booked: {item.bookedUnits}</span>
                        {item.blockedUnits > 0 && (
                          <span style={styles.blockedUnits}>Blocked: {item.blockedUnits}</span>
                        )}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={{ ...styles.statusPill, ...styles[status.className] }}>
                        {status.label}
                      </span>
                      {item.isBlocked && item.blockReason && (
                        <div style={styles.blockReason}>{item.blockReason}</div>
                      )}
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionGroup}>
                        <button
                          style={styles.actionBtn}
                          onClick={() => openEdit(item)}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        {item.isBlocked ? (
                          <button
                            style={{ ...styles.actionBtn, ...styles.actionUnblock }}
                            onClick={() => handleUnblock(item._id)}
                            title="Unblock"
                          >
                            🔓
                          </button>
                        ) : (
                          <button
                            style={{ ...styles.actionBtn, ...styles.actionBlock }}
                            onClick={() => handleBlock(item._id)}
                            title="Block"
                          >
                            🔒
                          </button>
                        )}
                        {item.stopSell ? (
                          <button
                            style={{ ...styles.actionBtn, ...styles.actionResume }}
                            onClick={() => handleResumeSell(item._id)}
                            title="Resume Sell"
                          >
                            ▶️
                          </button>
                        ) : (
                          <button
                            style={{ ...styles.actionBtn, ...styles.actionStopSell }}
                            onClick={() => handleStopSell(item._id)}
                            title="Stop Sell"
                          >
                            ⛔
                          </button>
                        )}
                        <button
                          style={{ ...styles.actionBtn, ...styles.actionDelete }}
                          onClick={() => handleDelete(item._id)}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ============================================================
          SINGLE INVENTORY MODAL
      ============================================================ */}
      {modalOpen && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editId ? "✏️ Edit Inventory" : "➕ Add Inventory"}
              </h2>
              <button style={styles.modalClose} onClick={closeModal}>×</button>
            </div>

            <form onSubmit={handleSubmit} style={styles.modalBody}>
              <div style={styles.formGrid2}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Homestay ID *</label>
                  <input
                    style={styles.formInput}
                    name="homestayId"
                    placeholder="Enter Homestay ID"
                    value={form.homestayId}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Unit ID *</label>
                  <input
                    style={styles.formInput}
                    name="unitId"
                    placeholder="Enter Unit ID"
                    value={form.unitId}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Date *</label>
                  <input
                    style={styles.formInput}
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Base Price (₹)</label>
                  <input
                    style={styles.formInput}
                    type="number"
                    name="basePrice"
                    placeholder="2500"
                    value={form.basePrice}
                    onChange={handleFormChange}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Weekend Price (₹)</label>
                  <input
                    style={styles.formInput}
                    type="number"
                    name="weekendPrice"
                    placeholder="3000"
                    value={form.weekendPrice}
                    onChange={handleFormChange}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Holiday Price (₹)</label>
                  <input
                    style={styles.formInput}
                    type="number"
                    name="holidayPrice"
                    placeholder="3500"
                    value={form.holidayPrice}
                    onChange={handleFormChange}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Special Price (₹)</label>
                  <input
                    style={styles.formInput}
                    type="number"
                    name="specialPrice"
                    placeholder="2000"
                    value={form.specialPrice}
                    onChange={handleFormChange}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Extra Guest Price (₹)</label>
                  <input
                    style={styles.formInput}
                    type="number"
                    name="extraGuestPrice"
                    placeholder="500"
                    value={form.extraGuestPrice}
                    onChange={handleFormChange}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Discount Type</label>
                  <select
                    style={styles.formSelect}
                    name="discountType"
                    value={form.discountType}
                    onChange={handleFormChange}
                  >
                    <option value="none">None</option>
                    <option value="percentage">Percentage</option>
                    <option value="flat">Flat</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Discount Value</label>
                  <input
                    style={styles.formInput}
                    type="number"
                    name="discountValue"
                    placeholder="10"
                    value={form.discountValue}
                    onChange={handleFormChange}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Tax (%)</label>
                  <input
                    style={styles.formInput}
                    type="number"
                    name="taxPercentage"
                    placeholder="18"
                    value={form.taxPercentage}
                    onChange={handleFormChange}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Service Charge (%)</label>
                  <input
                    style={styles.formInput}
                    type="number"
                    name="serviceChargePercentage"
                    placeholder="5"
                    value={form.serviceChargePercentage}
                    onChange={handleFormChange}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Minimum Stay</label>
                  <input
                    style={styles.formInput}
                    type="number"
                    name="minimumStay"
                    placeholder="1"
                    value={form.minimumStay}
                    onChange={handleFormChange}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Maximum Stay</label>
                  <input
                    style={styles.formInput}
                    type="number"
                    name="maximumStay"
                    placeholder="0 (unlimited)"
                    value={form.maximumStay}
                    onChange={handleFormChange}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Blocked Units</label>
                  <input
                    style={styles.formInput}
                    type="number"
                    name="blockedUnits"
                    placeholder="0"
                    value={form.blockedUnits}
                    onChange={handleFormChange}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Block Reason</label>
                  <input
                    style={styles.formInput}
                    name="blockReason"
                    placeholder="Reason for blocking"
                    value={form.blockReason}
                    onChange={handleFormChange}
                  />
                </div>
              </div>

              <div style={styles.checkboxGrid}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="stopSell"
                    checked={form.stopSell}
                    onChange={handleFormChange}
                  />
                  ⛔ Stop Sell
                </label>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="closedForBooking"
                    checked={form.closedForBooking}
                    onChange={handleFormChange}
                  />
                  🔒 Closed for Booking
                </label>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="isBlocked"
                    checked={form.isBlocked}
                    onChange={handleFormChange}
                  />
                  🚫 Blocked
                </label>
              </div>

              <div style={styles.modalFooter}>
                <button
                  type="button"
                  style={styles.btnCancel}
                  onClick={closeModal}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={styles.btnSubmit}
                  disabled={submitting}
                >
                  {submitting ? "⏳ Saving..." : editId ? "💾 Update" : "➕ Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          RANGE INVENTORY MODAL
      ============================================================ */}
      {rangeModalOpen && (
        <div style={styles.modalOverlay} onClick={closeRangeModal}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>📅 Add Inventory Range</h2>
              <button style={styles.modalClose} onClick={closeRangeModal}>×</button>
            </div>

            <form onSubmit={handleRangeSubmit} style={styles.modalBody}>
              <div style={styles.formGrid2}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Homestay ID *</label>
                  <input
                    style={styles.formInput}
                    name="homestayId"
                    placeholder="Enter Homestay ID"
                    value={rangeForm.homestayId}
                    onChange={handleRangeFormChange}
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Unit ID *</label>
                  <input
                    style={styles.formInput}
                    name="unitId"
                    placeholder="Enter Unit ID"
                    value={rangeForm.unitId}
                    onChange={handleRangeFormChange}
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Start Date *</label>
                  <input
                    style={styles.formInput}
                    type="date"
                    name="startDate"
                    value={rangeForm.startDate}
                    onChange={handleRangeFormChange}
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>End Date *</label>
                  <input
                    style={styles.formInput}
                    type="date"
                    name="endDate"
                    value={rangeForm.endDate}
                    onChange={handleRangeFormChange}
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Base Price (₹)</label>
                  <input
                    style={styles.formInput}
                    type="number"
                    name="basePrice"
                    placeholder="2500"
                    value={rangeForm.basePrice}
                    onChange={handleRangeFormChange}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Weekend Price (₹)</label>
                  <input
                    style={styles.formInput}
                    type="number"
                    name="weekendPrice"
                    placeholder="3000"
                    value={rangeForm.weekendPrice}
                    onChange={handleRangeFormChange}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Holiday Price (₹)</label>
                  <input
                    style={styles.formInput}
                    type="number"
                    name="holidayPrice"
                    placeholder="3500"
                    value={rangeForm.holidayPrice}
                    onChange={handleRangeFormChange}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Special Price (₹)</label>
                  <input
                    style={styles.formInput}
                    type="number"
                    name="specialPrice"
                    placeholder="2000"
                    value={rangeForm.specialPrice}
                    onChange={handleRangeFormChange}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Extra Guest Price (₹)</label>
                  <input
                    style={styles.formInput}
                    type="number"
                    name="extraGuestPrice"
                    placeholder="500"
                    value={rangeForm.extraGuestPrice}
                    onChange={handleRangeFormChange}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Discount Type</label>
                  <select
                    style={styles.formSelect}
                    name="discountType"
                    value={rangeForm.discountType}
                    onChange={handleRangeFormChange}
                  >
                    <option value="none">None</option>
                    <option value="percentage">Percentage</option>
                    <option value="flat">Flat</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Discount Value</label>
                  <input
                    style={styles.formInput}
                    type="number"
                    name="discountValue"
                    placeholder="10"
                    value={rangeForm.discountValue}
                    onChange={handleRangeFormChange}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Tax (%)</label>
                  <input
                    style={styles.formInput}
                    type="number"
                    name="taxPercentage"
                    placeholder="18"
                    value={rangeForm.taxPercentage}
                    onChange={handleRangeFormChange}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Service Charge (%)</label>
                  <input
                    style={styles.formInput}
                    type="number"
                    name="serviceChargePercentage"
                    placeholder="5"
                    value={rangeForm.serviceChargePercentage}
                    onChange={handleRangeFormChange}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Minimum Stay</label>
                  <input
                    style={styles.formInput}
                    type="number"
                    name="minimumStay"
                    placeholder="1"
                    value={rangeForm.minimumStay}
                    onChange={handleRangeFormChange}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Maximum Stay</label>
                  <input
                    style={styles.formInput}
                    type="number"
                    name="maximumStay"
                    placeholder="0 (unlimited)"
                    value={rangeForm.maximumStay}
                    onChange={handleRangeFormChange}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Blocked Units</label>
                  <input
                    style={styles.formInput}
                    type="number"
                    name="blockedUnits"
                    placeholder="0"
                    value={rangeForm.blockedUnits}
                    onChange={handleRangeFormChange}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Block Reason</label>
                  <input
                    style={styles.formInput}
                    name="blockReason"
                    placeholder="Reason for blocking"
                    value={rangeForm.blockReason}
                    onChange={handleRangeFormChange}
                  />
                </div>
              </div>

              <div style={styles.checkboxGrid}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="stopSell"
                    checked={rangeForm.stopSell}
                    onChange={handleRangeFormChange}
                  />
                  ⛔ Stop Sell
                </label>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="closedForBooking"
                    checked={rangeForm.closedForBooking}
                    onChange={handleRangeFormChange}
                  />
                  🔒 Closed for Booking
                </label>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="isBlocked"
                    checked={rangeForm.isBlocked}
                    onChange={handleRangeFormChange}
                  />
                  🚫 Blocked
                </label>
              </div>

              <div style={styles.modalFooter}>
                <button
                  type="button"
                  style={styles.btnCancel}
                  onClick={closeRangeModal}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={styles.btnSubmit}
                  disabled={submitting}
                >
                  {submitting ? "⏳ Creating..." : "📅 Create Range"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// STYLES
// ============================================================
const styles = {
  container: {
    maxWidth: "1600px",
    margin: "0 auto",
    padding: "32px 24px",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    background: "#f4f6fa",
    minHeight: "100vh",
    color: "#0b1a33",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "18px",
    background: "#ffffff",
    padding: "24px 28px",
    borderRadius: "20px",
    boxShadow: "0 8px 30px rgba(0, 20, 50, 0.06)",
    marginBottom: "28px",
    border: "1px solid #e4e5e7",
  },
  title: {
    fontSize: "26px",
    fontWeight: "700",
    letterSpacing: "-0.3px",
    margin: 0,
    color: "#0b1a33",
  },
  count: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#6c7078",
    background: "#f1f2f4",
    padding: "4px 14px",
    borderRadius: "40px",
    marginLeft: "12px",
  },
  headerActions: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  btnPrimary: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 22px",
    borderRadius: "40px",
    fontWeight: "600",
    fontSize: "14px",
    border: "none",
    cursor: "pointer",
    background: "#000000",
    color: "#ffffff",
    transition: "all 0.2s ease",
  },
  btnOutline: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 22px",
    borderRadius: "40px",
    fontWeight: "600",
    fontSize: "14px",
    border: "1.5px solid #cdcfd2",
    cursor: "pointer",
    background: "transparent",
    color: "#2d3138",
    transition: "all 0.2s ease",
  },
  btnReset: {
    padding: "6px 16px",
    borderRadius: "30px",
    fontWeight: "600",
    fontSize: "13px",
    border: "1.5px solid #cdcfd2",
    cursor: "pointer",
    background: "transparent",
    color: "#2d3138",
    transition: "all 0.2s ease",
  },
  alertError: {
    padding: "14px 20px",
    borderRadius: "14px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    background: "#fef2f2",
    borderLeft: "6px solid #dc2626",
    color: "#991b1b",
  },
  alertSuccess: {
    padding: "14px 20px",
    borderRadius: "14px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    background: "#ecfdf5",
    borderLeft: "6px solid #065f46",
    color: "#065f46",
  },
  alertClose: {
    background: "none",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
    padding: "0 8px",
  },
  filterBar: {
    background: "#ffffff",
    borderRadius: "18px",
    padding: "22px 26px",
    marginBottom: "28px",
    border: "1px solid #e4e5e7",
  },
  filterGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px 24px",
    marginBottom: "14px",
  },
  filterGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  filterLabel: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#4a4e56",
  },
  filterInput: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1.5px solid #e4e5e7",
    fontSize: "14px",
    background: "#ffffff",
    transition: "all 0.2s ease",
    color: "#0b0d11",
  },
  filterFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textMuted: {
    color: "#6c7078",
    fontSize: "13px",
  },
  loading: {
    textAlign: "center",
    padding: "60px 20px",
    fontSize: "18px",
    color: "#6c7078",
  },
  emptyState: {
    textAlign: "center",
    padding: "70px 20px",
    background: "#ffffff",
    borderRadius: "18px",
    border: "1px solid #e4e5e7",
  },
  emptyIcon: {
    fontSize: "56px",
    color: "#cdcfd2",
    marginBottom: "16px",
  },
  emptyTitle: {
    fontWeight: "700",
    fontSize: "22px",
    color: "#0b0d11",
    marginBottom: "8px",
  },
  emptyText: {
    color: "#6c7078",
    fontSize: "14px",
  },
  tableWrap: {
    overflowX: "auto",
    borderRadius: "18px",
    background: "#ffffff",
    border: "1px solid #e4e5e7",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  },
  th: {
    textAlign: "left",
    padding: "16px 16px 12px 16px",
    fontWeight: "700",
    fontSize: "12px",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    color: "#6c7078",
    borderBottom: "2px solid #e4e5e7",
    background: "#f8f9fa",
  },
  tr: {
    borderBottom: "1px solid #f1f2f4",
  },
  td: {
    padding: "16px 16px",
    verticalAlign: "middle",
  },
  unitName: {
    fontWeight: "600",
    color: "#0b0d11",
  },
  unitType: {
    fontSize: "12px",
    color: "#6c7078",
  },
  homestayName: {
    fontWeight: "500",
    color: "#0b0d11",
  },
  homestayCity: {
    fontSize: "12px",
    color: "#6c7078",
  },
  finalPrice: {
    fontWeight: "700",
    fontSize: "16px",
    color: "#000000",
  },
  discountBadge: {
    fontSize: "11px",
    color: "#065f46",
    background: "#ecfdf5",
    padding: "2px 8px",
    borderRadius: "12px",
    display: "inline-block",
    marginTop: "4px",
  },
  unitCount: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    fontSize: "12px",
  },
  totalUnits: { color: "#2d3138" },
  availableUnits: { color: "#065f46" },
  bookedUnits: { color: "#92400e" },
  blockedUnits: { color: "#991b1b" },
  statusPill: {
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: "40px",
    fontWeight: "600",
    fontSize: "11px",
  },
  "status-available": { background: "#ecfdf5", color: "#065f46" },
  "status-unavailable": { background: "#fef2f2", color: "#991b1b" },
  "status-blocked": { background: "#fef2f2", color: "#991b1b" },
  "status-stopsell": { background: "#fffbeb", color: "#92400e" },
  "status-closed": { background: "#fef2f2", color: "#991b1b" },
  blockReason: {
    fontSize: "11px",
    color: "#6c7078",
    marginTop: "4px",
  },
  actionGroup: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
  },
  actionBtn: {
    background: "transparent",
    border: "none",
    fontSize: "16px",
    cursor: "pointer",
    padding: "4px 8px",
    borderRadius: "30px",
    transition: "all 0.2s ease",
  },
  actionBlock: { color: "#991b1b" },
  actionUnblock: { color: "#065f46" },
  actionStopSell: { color: "#92400e" },
  actionResume: { color: "#065f46" },
  actionDelete: { color: "#dc2626" },

  // Modal
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0, 0, 0, 0.5)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "24px",
  },
  modal: {
    background: "#ffffff",
    borderRadius: "28px",
    maxWidth: "900px",
    width: "100%",
    maxHeight: "92vh",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.18)",
    animation: "modalFade 0.25s ease",
    border: "1px solid #e4e5e7",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "22px 30px",
    borderBottom: "1px solid #e4e5e7",
    flexShrink: 0,
  },
  modalTitle: {
    fontSize: "22px",
    fontWeight: "700",
    margin: 0,
    color: "#0b0d11",
  },
  modalClose: {
    background: "transparent",
    border: "none",
    fontSize: "26px",
    color: "#9a9da3",
    cursor: "pointer",
    padding: "0 8px",
    transition: "all 0.2s ease",
  },
  modalBody: {
    padding: "28px 30px 18px",
    overflowY: "auto",
    flex: 1,
  },
  modalFooter: {
    padding: "18px 30px 26px",
    borderTop: "1px solid #e4e5e7",
    display: "flex",
    justifyContent: "flex-end",
    gap: "14px",
    flexShrink: 0,
  },
  formGrid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "18px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  formLabel: {
    fontWeight: "600",
    fontSize: "13px",
    color: "#2d3138",
  },
  formInput: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1.5px solid #e4e5e7",
    fontSize: "14px",
    background: "#ffffff",
    transition: "all 0.2s ease",
    width: "100%",
    color: "#0b0d11",
  },
  formSelect: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1.5px solid #e4e5e7",
    fontSize: "14px",
    background: "#ffffff",
    transition: "all 0.2s ease",
    width: "100%",
    color: "#0b0d11",
  },
  checkboxGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "10px",
    marginTop: "16px",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: "500",
    color: "#2d3138",
    cursor: "pointer",
  },
  btnCancel: {
    padding: "10px 22px",
    borderRadius: "40px",
    fontWeight: "600",
    fontSize: "14px",
    border: "1.5px solid #cdcfd2",
    cursor: "pointer",
    background: "transparent",
    color: "#2d3138",
    transition: "all 0.2s ease",
  },
  btnSubmit: {
    padding: "10px 22px",
    borderRadius: "40px",
    fontWeight: "600",
    fontSize: "14px",
    border: "none",
    cursor: "pointer",
    background: "#000000",
    color: "#ffffff",
    transition: "all 0.2s ease",
  },
};

// CSS Animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes modalFade {
    from { opacity: 0.6; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .btn-primary:hover { background: #2d3138; transform: scale(1.02); }
  .btn-outline:hover { background: #f1f2f4; border-color: #000000; }
  .btn-reset:hover { background: #f1f2f4; }
  .action-btn:hover { background: #f1f2f4; }
  .form-input:focus, .form-select:focus, .filter-input:focus {
    border-color: #000000;
    outline: none;
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.08);
  }
`;
document.head.appendChild(styleSheet);

export default VendorHomestayInventory;