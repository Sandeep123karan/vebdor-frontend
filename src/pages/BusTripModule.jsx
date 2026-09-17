import React, { useState, useEffect } from "react";
import axios from "axios";
import "./BusTripModule.css";

const API_URL = "http://localhost:7000/api/bus-trips";

const BusTripModule = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [buses, setBuses] = useState([]);
  const [selectedBus, setSelectedBus] = useState("");

  // ==========================================
  // FORM STATE
  // ==========================================
  const [formData, setFormData] = useState({
    bus: "",
    tripCode: "",
    tripName: "",
    fromCity: "",
    toCity: "",
    viaCities: [],
    travelDate: "",
    departureTime: "",
    arrivalTime: "",
    reportingTime: "",
    basePrice: "",
    tax: "0",
    discount: "0",
    totalSeats: "",
    boardingPoints: [],
    droppingPoints: [],
    notes: "",
  });

  const [boardingPoint, setBoardingPoint] = useState({
    location: "",
    time: "",
    address: "",
    landmark: "",
  });

  const [droppingPoint, setDroppingPoint] = useState({
    location: "",
    time: "",
    address: "",
    landmark: "",
  });

  const [viaCity, setViaCity] = useState("");

  // ==========================================
  // FETCH BUSES FOR DROPDOWN
  // ==========================================
  const fetchBuses = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:7000/api/buses/vendor", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBuses(response.data.buses || []);
    } catch (error) {
      console.error("Error fetching buses:", error);
    }
  };

  // ==========================================
  // FETCH TRIPS
  // ==========================================
  const fetchTrips = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/vendor`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrips(response.data.trips || []);
    } catch (error) {
      console.error("Error fetching trips:", error);
      alert(error.response?.data?.message || "Failed to fetch trips");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses();
    fetchTrips();
  }, []);

  // ==========================================
  // GENERATE TRIP CODE
  // ==========================================
  const generateTripCode = () => {
    const prefix = "TRIP";
    const random = Math.floor(10000 + Math.random() * 90000);
    return `${prefix}${random}`;
  };

  // ==========================================
  // HANDLE FORM CHANGE
  // ==========================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-generate trip code when bus is selected
    if (name === "bus") {
      setSelectedBus(value);
      const bus = buses.find((b) => b._id === value);
      if (bus) {
        setFormData((prev) => ({
          ...prev,
          bus: value,
          tripCode: generateTripCode(),
          totalSeats: bus.totalSeats || 0,
          fromCity: bus.fromCity || "",
          toCity: bus.toCity || "",
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          bus: value,
          tripCode: generateTripCode(),
        }));
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ==========================================
  // HANDLE VIA CITIES
  // ==========================================
  const addViaCity = () => {
    if (viaCity.trim()) {
      setFormData((prev) => ({
        ...prev,
        viaCities: [...prev.viaCities, viaCity.trim()],
      }));
      setViaCity("");
    }
  };

  const removeViaCity = (index) => {
    setFormData((prev) => ({
      ...prev,
      viaCities: prev.viaCities.filter((_, i) => i !== index),
    }));
  };

  // ==========================================
  // HANDLE BOARDING POINTS
  // ==========================================
  const addBoardingPoint = () => {
    if (boardingPoint.location.trim()) {
      setFormData((prev) => ({
        ...prev,
        boardingPoints: [...prev.boardingPoints, { ...boardingPoint }],
      }));
      setBoardingPoint({ location: "", time: "", address: "", landmark: "" });
    }
  };

  const removeBoardingPoint = (index) => {
    setFormData((prev) => ({
      ...prev,
      boardingPoints: prev.boardingPoints.filter((_, i) => i !== index),
    }));
  };

  // ==========================================
  // HANDLE DROPPING POINTS
  // ==========================================
  const addDroppingPoint = () => {
    if (droppingPoint.location.trim()) {
      setFormData((prev) => ({
        ...prev,
        droppingPoints: [...prev.droppingPoints, { ...droppingPoint }],
      }));
      setDroppingPoint({ location: "", time: "", address: "", landmark: "" });
    }
  };

  const removeDroppingPoint = (index) => {
    setFormData((prev) => ({
      ...prev,
      droppingPoints: prev.droppingPoints.filter((_, i) => i !== index),
    }));
  };

  // ==========================================
  // RESET FORM
  // ==========================================
  const resetForm = () => {
    setFormData({
      bus: "",
      tripCode: "",
      tripName: "",
      fromCity: "",
      toCity: "",
      viaCities: [],
      travelDate: "",
      departureTime: "",
      arrivalTime: "",
      reportingTime: "",
      basePrice: "",
      tax: "0",
      discount: "0",
      totalSeats: "",
      boardingPoints: [],
      droppingPoints: [],
      notes: "",
    });
    setSelectedBus("");
    setEditingTrip(null);
    setViaCity("");
    setBoardingPoint({ location: "", time: "", address: "", landmark: "" });
    setDroppingPoint({ location: "", time: "", address: "", landmark: "" });
  };

  // ==========================================
  // OPEN MODAL FOR ADD/EDIT
  // ==========================================
  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (trip) => {
    setEditingTrip(trip);
    setSelectedBus(trip.bus?._id || trip.bus);
    setFormData({
      bus: trip.bus?._id || trip.bus,
      tripCode: trip.tripCode || "",
      tripName: trip.tripName || "",
      fromCity: trip.fromCity || "",
      toCity: trip.toCity || "",
      viaCities: trip.viaCities || [],
      travelDate: trip.travelDate ? trip.travelDate.split("T")[0] : "",
      departureTime: trip.departureTime || "",
      arrivalTime: trip.arrivalTime || "",
      reportingTime: trip.reportingTime || "",
      basePrice: trip.basePrice || "",
      tax: trip.tax || "0",
      discount: trip.discount || "0",
      totalSeats: trip.totalSeats || "",
      boardingPoints: trip.boardingPoints || [],
      droppingPoints: trip.droppingPoints || [],
      notes: trip.notes || "",
    });
    setShowModal(true);
  };

  // ==========================================
  // SUBMIT FORM
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const payload = {
        ...formData,
        basePrice: parseFloat(formData.basePrice) || 0,
        tax: parseFloat(formData.tax) || 0,
        discount: parseFloat(formData.discount) || 0,
        totalSeats: parseInt(formData.totalSeats) || 0,
      };

      let response;
      if (editingTrip) {
        // UPDATE
        response = await axios.put(`${API_URL}/${editingTrip._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Trip updated successfully!");
      } else {
        // CREATE
        response = await axios.post(`${API_URL}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Trip created successfully!");
      }

      console.log("Response:", response.data);
      setShowModal(false);
      resetForm();
      fetchTrips();
    } catch (error) {
      console.error("Error saving trip:", error);
      alert(error.response?.data?.message || "Failed to save trip");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // CANCEL TRIP
  // ==========================================
  const handleCancelTrip = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this trip?")) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API_URL}/${id}/cancel`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Trip cancelled successfully!");
      fetchTrips();
    } catch (error) {
      console.error("Error cancelling trip:", error);
      alert(error.response?.data?.message || "Failed to cancel trip");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // DELETE TRIP
  // ==========================================
  const handleDeleteTrip = async (id) => {
    if (!window.confirm("Are you sure you want to delete this trip?")) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Trip deleted successfully!");
      fetchTrips();
    } catch (error) {
      console.error("Error deleting trip:", error);
      alert(error.response?.data?.message || "Failed to delete trip");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // GET STATUS BADGE
  // ==========================================
  const getStatusBadge = (status) => {
    const statusMap = {
      SCHEDULED: { label: "Scheduled", color: "#2196F3" },
      BOARDING: { label: "Boarding", color: "#FF9800" },
      STARTED: { label: "Started", color: "#4CAF50" },
      COMPLETED: { label: "Completed", color: "#9E9E9E" },
      CANCELLED: { label: "Cancelled", color: "#f44336" },
    };
    const s = statusMap[status] || { label: status, color: "#9E9E9E" };
    return <span className="status-badge" style={{ backgroundColor: s.color }}>{s.label}</span>;
  };

  // ==========================================
  // RENDER TRIP LIST
  // ==========================================
  const renderTripList = () => {
    if (trips.length === 0) {
      return (
        <div className="empty-state">
          <div className="empty-icon">🚌</div>
          <h3>No trips found</h3>
          <p>Click "Create Trip" to add a new bus trip</p>
        </div>
      );
    }

    return (
      <div className="trip-grid">
        {trips.map((trip) => (
          <div key={trip._id} className="trip-card">
            <div className="trip-card-header">
              <div>
                <h3>{trip.tripName || trip.tripCode}</h3>
                <span className="trip-code">{trip.tripCode}</span>
              </div>
              {getStatusBadge(trip.status)}
            </div>

            <div className="trip-route">
              <div className="route-city from">
                <span className="city-name">{trip.fromCity}</span>
                <span className="city-time">{trip.departureTime}</span>
              </div>
              <div className="route-arrow">→</div>
              <div className="route-city to">
                <span className="city-name">{trip.toCity}</span>
                <span className="city-time">{trip.arrivalTime}</span>
              </div>
            </div>

            <div className="trip-details">
              <div className="trip-detail-item">
                <span className="label">Bus:</span>
                <span className="value">{trip.bus?.busName || "N/A"}</span>
              </div>
              <div className="trip-detail-item">
                <span className="label">Seats:</span>
                <span className="value">{trip.availableSeats || 0} / {trip.totalSeats || 0}</span>
              </div>
              <div className="trip-detail-item">
                <span className="label">Price:</span>
                <span className="value price">₹{trip.finalPrice || trip.basePrice || 0}</span>
              </div>
              <div className="trip-detail-item">
                <span className="label">Date:</span>
                <span className="value">{new Date(trip.travelDate).toLocaleDateString()}</span>
              </div>
            </div>

            {trip.viaCities && trip.viaCities.length > 0 && (
              <div className="trip-via">
                <span className="label">Via:</span>
                {trip.viaCities.map((city, idx) => (
                  <span key={idx} className="via-tag">{city}</span>
                ))}
              </div>
            )}

            <div className="trip-actions">
              <button className="btn-edit" onClick={() => openEditModal(trip)}>
                ✏️ Edit
              </button>
              {trip.status !== "CANCELLED" && trip.status !== "COMPLETED" && (
                <button className="btn-cancel-trip" onClick={() => handleCancelTrip(trip._id)}>
                  ⛔ Cancel
                </button>
              )}
              <button className="btn-delete" onClick={() => handleDeleteTrip(trip._id)}>
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ==========================================
  // RENDER MODAL
  // ==========================================
  const renderModal = () => {
    if (!showModal) return null;

    return (
      <div className="modal-overlay" onClick={() => setShowModal(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>{editingTrip ? "Edit Trip" : "Create New Trip"}</h2>
            <button className="modal-close" onClick={() => setShowModal(false)}>
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="trip-form">
            {/* Bus Selection */}
            <div className="form-group">
              <label>Select Bus *</label>
              <select name="bus" value={formData.bus} onChange={handleChange} required>
                <option value="">-- Select a bus --</option>
                {buses.map((bus) => (
                  <option key={bus._id} value={bus._id}>
                    {bus.busName} ({bus.busNumber}) - {bus.fromCity} → {bus.toCity}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Trip Code *</label>
                <input
                  type="text"
                  name="tripCode"
                  value={formData.tripCode}
                  onChange={handleChange}
                  placeholder="Auto-generated"
                  required
                  disabled={!!editingTrip}
                />
              </div>
              <div className="form-group">
                <label>Trip Name</label>
                <input
                  type="text"
                  name="tripName"
                  value={formData.tripName}
                  onChange={handleChange}
                  placeholder="e.g. Mumbai-Pune Express"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>From City *</label>
                <input
                  type="text"
                  name="fromCity"
                  value={formData.fromCity}
                  onChange={handleChange}
                  placeholder="e.g. Mumbai"
                  required
                />
              </div>
              <div className="form-group">
                <label>To City *</label>
                <input
                  type="text"
                  name="toCity"
                  value={formData.toCity}
                  onChange={handleChange}
                  placeholder="e.g. Pune"
                  required
                />
              </div>
            </div>

            {/* Via Cities */}
            <div className="form-group">
              <label>Via Cities</label>
              <div className="array-input">
                <input
                  type="text"
                  value={viaCity}
                  onChange={(e) => setViaCity(e.target.value)}
                  placeholder="Enter via city"
                />
                <button type="button" onClick={addViaCity} className="btn-add-item">
                  Add
                </button>
              </div>
              <div className="tags-container">
                {formData.viaCities.map((city, idx) => (
                  <span key={idx} className="tag">
                    {city}
                    <button type="button" onClick={() => removeViaCity(idx)}>×</button>
                  </span>
                ))}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Travel Date *</label>
                <input
                  type="date"
                  name="travelDate"
                  value={formData.travelDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Total Seats *</label>
                <input
                  type="number"
                  name="totalSeats"
                  value={formData.totalSeats}
                  onChange={handleChange}
                  placeholder="e.g. 40"
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Departure Time *</label>
                <input
                  type="time"
                  name="departureTime"
                  value={formData.departureTime}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Arrival Time *</label>
                <input
                  type="time"
                  name="arrivalTime"
                  value={formData.arrivalTime}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Reporting Time</label>
              <input
                type="time"
                name="reportingTime"
                value={formData.reportingTime}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Base Price (₹) *</label>
                <input
                  type="number"
                  name="basePrice"
                  value={formData.basePrice}
                  onChange={handleChange}
                  placeholder="e.g. 500"
                  min="1"
                  required
                />
              </div>
              <div className="form-group">
                <label>Tax (%)</label>
                <input
                  type="number"
                  name="tax"
                  value={formData.tax}
                  onChange={handleChange}
                  placeholder="e.g. 5"
                  min="0"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Discount (₹)</label>
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                placeholder="e.g. 50"
                min="0"
              />
            </div>

            {/* Boarding Points */}
            <div className="form-section-title">Boarding Points</div>
            <div className="array-input-group">
              <div className="array-input-row">
                <input
                  type="text"
                  placeholder="Location *"
                  value={boardingPoint.location}
                  onChange={(e) => setBoardingPoint({ ...boardingPoint, location: e.target.value })}
                />
                <input
                  type="time"
                  placeholder="Time"
                  value={boardingPoint.time}
                  onChange={(e) => setBoardingPoint({ ...boardingPoint, time: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Address"
                  value={boardingPoint.address}
                  onChange={(e) => setBoardingPoint({ ...boardingPoint, address: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Landmark"
                  value={boardingPoint.landmark}
                  onChange={(e) => setBoardingPoint({ ...boardingPoint, landmark: e.target.value })}
                />
                <button type="button" onClick={addBoardingPoint} className="btn-add-item">
                  Add
                </button>
              </div>
              <div className="points-list">
                {formData.boardingPoints.map((point, idx) => (
                  <div key={idx} className="point-item">
                    <span><strong>{point.location}</strong> {point.time && `@ ${point.time}`}</span>
                    <button type="button" onClick={() => removeBoardingPoint(idx)}>×</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Dropping Points */}
            <div className="form-section-title">Dropping Points</div>
            <div className="array-input-group">
              <div className="array-input-row">
                <input
                  type="text"
                  placeholder="Location *"
                  value={droppingPoint.location}
                  onChange={(e) => setDroppingPoint({ ...droppingPoint, location: e.target.value })}
                />
                <input
                  type="time"
                  placeholder="Time"
                  value={droppingPoint.time}
                  onChange={(e) => setDroppingPoint({ ...droppingPoint, time: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Address"
                  value={droppingPoint.address}
                  onChange={(e) => setDroppingPoint({ ...droppingPoint, address: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Landmark"
                  value={droppingPoint.landmark}
                  onChange={(e) => setDroppingPoint({ ...droppingPoint, landmark: e.target.value })}
                />
                <button type="button" onClick={addDroppingPoint} className="btn-add-item">
                  Add
                </button>
              </div>
              <div className="points-list">
                {formData.droppingPoints.map((point, idx) => (
                  <div key={idx} className="point-item">
                    <span><strong>{point.location}</strong> {point.time && `@ ${point.time}`}</span>
                    <button type="button" onClick={() => removeDroppingPoint(idx)}>×</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any additional notes about this trip"
                rows="3"
              />
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? "Saving..." : editingTrip ? "Update Trip" : "Create Trip"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // ==========================================
  // MAIN RENDER
  // ==========================================
  return (
    <div className="bus-trip-module">
      <div className="module-header">
        <h2>Bus Trip Management</h2>
        <button className="btn-add" onClick={openAddModal}>
          + Create Trip
        </button>
      </div>

      {loading && (
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      )}

      {renderTripList()}
      {renderModal()}
    </div>
  );
};

export default BusTripModule;