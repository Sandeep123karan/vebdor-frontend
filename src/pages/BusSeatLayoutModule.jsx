import React, { useState, useEffect } from "react";
import axios from "axios";
import "./BusSeatLayoutModule.css";

const API_URL = "https://bmtvendorfinal.onrender.com/api/bus-seat-layouts";

const BusSeatLayoutModule = () => {
  const [buses, setBuses] = useState([]);
  const [selectedBus, setSelectedBus] = useState("");
  const [layout, setLayout] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showLayoutEditor, setShowLayoutEditor] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [showSeatModal, setShowSeatModal] = useState(false);

  // ==========================================
  // FORM STATE FOR LAYOUT
  // ==========================================
  const [formData, setFormData] = useState({
    busId: "",
    layoutType: "2X2_SEATER",
    totalRows: 4,
    totalColumns: 4,
    hasUpperDeck: false,
    lowerDeckSeats: [],
    upperDeckSeats: [],
  });

  // ==========================================
  // SEAT STATUS MODAL
  // ==========================================
  const [seatModalData, setSeatModalData] = useState({
    seatId: "",
    deck: "LOWER",
    status: "AVAILABLE",
  });

  // ==========================================
  // FETCH BUSES
  // ==========================================
  const fetchBuses = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("https://bmtvendorfinal.onrender.com/api/buses/vendor", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBuses(response.data.buses || []);
    } catch (error) {
      console.error("Error fetching buses:", error);
      alert(error.response?.data?.message || "Failed to fetch buses");
    }
  };

  // ==========================================
  // FETCH SEAT LAYOUT
  // ==========================================
  const fetchSeatLayout = async (busId) => {
    if (!busId) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/bus/${busId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        const layoutData = response.data.data;
        setLayout(layoutData);
        setFormData({
          busId: layoutData.bus,
          layoutType: layoutData.layoutType || "2X2_SEATER",
          totalRows: layoutData.totalRows || 4,
          totalColumns: layoutData.totalColumns || 4,
          hasUpperDeck: layoutData.hasUpperDeck || false,
          lowerDeckSeats: layoutData.lowerDeckSeats || [],
          upperDeckSeats: layoutData.upperDeckSeats || [],
        });
        setShowLayoutEditor(true);
      }
    } catch (error) {
      console.error("Error fetching layout:", error);
      if (error.response?.status === 404) {
        // No layout found, create new
        setLayout(null);
        setFormData({
          busId,
          layoutType: "2X2_SEATER",
          totalRows: 4,
          totalColumns: 4,
          hasUpperDeck: false,
          lowerDeckSeats: [],
          upperDeckSeats: [],
        });
        setShowLayoutEditor(true);
      } else {
        alert(error.response?.data?.message || "Failed to fetch layout");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses();
  }, []);

  // ==========================================
  // HANDLE BUS SELECTION
  // ==========================================
  const handleBusSelect = (e) => {
    const busId = e.target.value;
    setSelectedBus(busId);
    if (busId) {
      fetchSeatLayout(busId);
    } else {
      setLayout(null);
      setShowLayoutEditor(false);
    }
  };

  // ==========================================
  // GENERATE SEAT LAYOUT
  // ==========================================
  const generateSeats = (rows, cols, deck) => {
    const seats = [];
    const seatTypes = ["SEATER", "SLEEPER"];
    const positionTypes = ["WINDOW", "AISLE", "MIDDLE"];
    const sides = ["LEFT", "RIGHT"];

    for (let row = 1; row <= rows; row++) {
      for (let col = 1; col <= cols; col++) {
        // Skip some seats for sleeper layout (2x1 pattern)
        if (formData.layoutType.includes("SLEEPER") && col % 3 === 0 && col > 1) {
          continue;
        }

        const seatNumber = `${deck === "LOWER" ? "L" : "U"}${row}${String.fromCharCode(64 + col)}`;
        seats.push({
          seatNumber,
          deck,
          seatType: formData.layoutType.includes("SLEEPER") ? "SLEEPER" : "SEATER",
          berthType: formData.layoutType.includes("SLEEPER") ? "SINGLE" : "",
          row,
          column: col,
          side: col % 2 === 0 ? "RIGHT" : "LEFT",
          positionType: col % 2 === 0 ? "WINDOW" : "AISLE",
          status: "AVAILABLE",
          price: 0,
          extraCharge: 0,
          genderRestriction: "ANY",
          isActive: true,
        });
      }
    }
    return seats;
  };

  // ==========================================
  // GENERATE LAYOUT
  // ==========================================
  const generateLayout = () => {
    const rows = parseInt(formData.totalRows) || 4;
    const cols = parseInt(formData.totalColumns) || 4;

    const lowerSeats = generateSeats(rows, cols, "LOWER");
    let upperSeats = [];

    if (formData.hasUpperDeck) {
      upperSeats = generateSeats(rows, cols, "UPPER");
    }

    setFormData((prev) => ({
      ...prev,
      lowerDeckSeats: lowerSeats,
      upperDeckSeats: upperSeats,
    }));
  };

  // ==========================================
  // HANDLE FORM CHANGE
  // ==========================================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // ==========================================
  // SAVE LAYOUT
  // ==========================================
  const handleSaveLayout = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem("token");
      const payload = {
        busId: formData.busId,
        layoutType: formData.layoutType,
        totalRows: parseInt(formData.totalRows) || 0,
        totalColumns: parseInt(formData.totalColumns) || 0,
        hasUpperDeck: formData.hasUpperDeck,
        lowerDeckSeats: formData.lowerDeckSeats,
        upperDeckSeats: formData.upperDeckSeats,
      };

      const response = await axios.post(`${API_URL}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Seat layout saved successfully!");
      fetchSeatLayout(formData.busId);
    } catch (error) {
      console.error("Error saving layout:", error);
      alert(error.response?.data?.message || "Failed to save layout");
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // TOGGLE SEAT STATUS
  // ==========================================
  const handleToggleSeatStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const payload = {
        busId: formData.busId,
        seatId: seatModalData.seatId,
        deck: seatModalData.deck,
        status: seatModalData.status,
      };

      const response = await axios.patch(`${API_URL}/seat-status`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert(`Seat status changed to ${seatModalData.status}`);
      setShowSeatModal(false);
      fetchSeatLayout(formData.busId);
    } catch (error) {
      console.error("Error toggling seat status:", error);
      alert(error.response?.data?.message || "Failed to update seat status");
    }
  };

  // ==========================================
  // OPEN SEAT MODAL
  // ==========================================
  const openSeatModal = (seat, deck) => {
    setSeatModalData({
      seatId: seat._id || seat.id,
      deck: deck,
      status: seat.status || "AVAILABLE",
    });
    setSelectedSeat(seat);
    setShowSeatModal(true);
  };

  // ==========================================
  // RENDER SEAT GRID
  // ==========================================
  const renderSeatGrid = (seats, deck) => {
    if (!seats || seats.length === 0) {
      return <div className="no-seats">No seats in this deck</div>;
    }

    // Group seats by row
    const rows = {};
    seats.forEach((seat) => {
      const rowKey = seat.row || 1;
      if (!rows[rowKey]) rows[rowKey] = [];
      rows[rowKey].push(seat);
    });

    return (
      <div className="seat-grid">
        {Object.keys(rows).sort((a, b) => a - b).map((rowKey) => (
          <div key={rowKey} className="seat-row">
            <span className="row-label">Row {rowKey}</span>
            <div className="seat-row-seats">
              {rows[rowKey].sort((a, b) => (a.column || 0) - (b.column || 0)).map((seat) => (
                <button
                  key={seat._id || seat.id || seat.seatNumber}
                  className={`seat-btn ${seat.status?.toLowerCase() || "available"}`}
                  onClick={() => openSeatModal(seat, deck)}
                  title={`${seat.seatNumber} - ${seat.status}`}
                >
                  <span className="seat-number">{seat.seatNumber}</span>
                  <span className="seat-status-dot"></span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ==========================================
  // RENDER LAYOUT
  // ==========================================
  const renderLayout = () => {
    if (!showLayoutEditor) {
      return (
        <div className="layout-placeholder">
          <div className="placeholder-icon">🪑</div>
          <h3>No Layout Selected</h3>
          <p>Select a bus from the dropdown to view or create its seat layout</p>
        </div>
      );
    }

    return (
      <div className="layout-container">
        <div className="layout-header">
          <h3>Seat Layout for {buses.find(b => b._id === formData.busId)?.busName || "Bus"}</h3>
          <button className="btn-generate" onClick={generateLayout}>
            🔄 Generate Seats
          </button>
        </div>

        <form onSubmit={handleSaveLayout} className="layout-form">
          <div className="form-row">
            <div className="form-group">
              <label>Layout Type</label>
              <select
                name="layoutType"
                value={formData.layoutType}
                onChange={handleChange}
              >
                <option value="2X2_SEATER">2x2 Seater</option>
                <option value="2X1_SEATER">2x1 Seater</option>
                <option value="2X2_SLEEPER">2x2 Sleeper</option>
                <option value="2X1_SLEEPER">2x1 Sleeper</option>
                <option value="MIXED">Mixed</option>
              </select>
            </div>
            <div className="form-group">
              <label>Total Rows</label>
              <input
                type="number"
                name="totalRows"
                value={formData.totalRows}
                onChange={handleChange}
                min="1"
                max="20"
              />
            </div>
            <div className="form-group">
              <label>Total Columns</label>
              <input
                type="number"
                name="totalColumns"
                value={formData.totalColumns}
                onChange={handleChange}
                min="1"
                max="10"
              />
            </div>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="hasUpperDeck"
                checked={formData.hasUpperDeck}
                onChange={handleChange}
              />
              Has Upper Deck
            </label>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-generate-layout" onClick={generateLayout}>
              Generate Seats
            </button>
            <button type="submit" className="btn-save" disabled={saving}>
              {saving ? "Saving..." : "Save Layout"}
            </button>
          </div>
        </form>

        <div className="seat-layout-view">
          {/* Lower Deck */}
          <div className="deck-section">
            <h4>Lower Deck ({formData.lowerDeckSeats?.length || 0} seats)</h4>
            {renderSeatGrid(formData.lowerDeckSeats, "LOWER")}
          </div>

          {/* Upper Deck */}
          {formData.hasUpperDeck && (
            <div className="deck-section">
              <h4>Upper Deck ({formData.upperDeckSeats?.length || 0} seats)</h4>
              {renderSeatGrid(formData.upperDeckSeats, "UPPER")}
            </div>
          )}

          <div className="legend">
            <span className="legend-item">
              <span className="legend-dot available"></span> Available
            </span>
            <span className="legend-item">
              <span className="legend-dot blocked"></span> Blocked
            </span>
            <span className="legend-item">
              <span className="legend-dot maintenance"></span> Maintenance
            </span>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // RENDER SEAT STATUS MODAL
  // ==========================================
  const renderSeatModal = () => {
    if (!showSeatModal) return null;

    return (
      <div className="modal-overlay" onClick={() => setShowSeatModal(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Update Seat Status</h2>
            <button className="modal-close" onClick={() => setShowSeatModal(false)}>
              ×
            </button>
          </div>

          <div className="modal-body">
            <div className="seat-info">
              <p>
                <strong>Seat Number:</strong> {selectedSeat?.seatNumber}
              </p>
              <p>
                <strong>Deck:</strong> {seatModalData.deck}
              </p>
              <p>
                <strong>Current Status:</strong> {selectedSeat?.status}
              </p>
            </div>

            <div className="form-group">
              <label>Select Status</label>
              <select
                value={seatModalData.status}
                onChange={(e) =>
                  setSeatModalData({ ...seatModalData, status: e.target.value })
                }
              >
                <option value="AVAILABLE">Available</option>
                <option value="BLOCKED">Blocked</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
            </div>

            <div className="form-actions">
              <button className="btn-cancel" onClick={() => setShowSeatModal(false)}>
                Cancel
              </button>
              <button className="btn-save" onClick={handleToggleSeatStatus}>
                Update Status
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // MAIN RENDER
  // ==========================================
  return (
    <div className="seat-layout-module">
      <div className="module-header">
        <h2>Bus Seat Layout Management</h2>
      </div>

      <div className="bus-selector">
        <label>Select Bus:</label>
        <select value={selectedBus} onChange={handleBusSelect} className="bus-select">
          <option value="">-- Select a bus --</option>
          {buses.map((bus) => (
            <option key={bus._id} value={bus._id}>
              {bus.busName} ({bus.busNumber}) - {bus.fromCity} → {bus.toCity}
            </option>
          ))}
        </select>

        {selectedBus && (
          <button
            className="btn-refresh"
            onClick={() => fetchSeatLayout(selectedBus)}
          >
            🔄 Refresh
          </button>
        )}
      </div>

      {loading && (
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      )}

      {renderLayout()}
      {renderSeatModal()}
    </div>
  );
};

export default BusSeatLayoutModule;