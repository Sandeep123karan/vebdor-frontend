import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import {
  MdAdd,
  MdRefresh,
  MdCheckCircle,
  MdEdit,
  MdDeleteOutline,
  MdFlashOn,
  MdAirlineSeatReclineExtra,
  MdAcUnit,
  MdWarning,
} from "react-icons/md";
import "./BusTypes.css";

const API_BASE = "https://bmtvendorfinal.onrender.com/api";

function getAuthHeader() {
  const token =
    localStorage.getItem("vendorToken") || localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Steering wheel SVG matching the RedBus BO GDS chassis outline
const SteeringWheelIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#94a3b8"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="3" />
    <line x1="12" y1="2" x2="12" y2="9" />
    <line x1="4.93" y1="16.07" x2="9.88" y2="14.12" />
    <line x1="19.07" y1="16.07" x2="14.12" y2="14.12" />
  </svg>
);

const GRID_ROWS = 5;
const GRID_COLS = 15;

/* Helper: Build default 5x15 empty grid */
const createEmptyGrid = (rows = GRID_ROWS, cols = GRID_COLS) => {
  const grid = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      grid.push({
        row: r,
        col: c,
        seatNumber: "",
        seatType: "SEATER",
        berthType: "",
        category: "REGULAR",
        isSeat: false,
      });
    }
  }
  return grid;
};

/* Helper: Build 2+1 Layout matching RedBus BO GDS default */
const createDefault2Plus1Grid = () => {
  const grid = createEmptyGrid();
  // In the screenshot:
  // Row 0, cols 0..5 -> seats 1, 3, 5, 7, 9, 11
  // Row 1, cols 0..5 -> seats 2, 4, 6, 8, 10, 12
  const topNumbers = ["1", "3", "5", "7", "9", "11"];
  const bottomNumbers = ["2", "4", "6", "8", "10", "12"];

  topNumbers.forEach((num, idx) => {
    const cell = grid.find((c) => c.row === 0 && c.col === idx);
    if (cell) {
      cell.isSeat = true;
      cell.seatNumber = num;
      cell.seatType = "SEATER";
    }
  });

  bottomNumbers.forEach((num, idx) => {
    const cell = grid.find((c) => c.row === 1 && c.col === idx);
    if (cell) {
      cell.isSeat = true;
      cell.seatNumber = num;
      cell.seatType = "SEATER";
    }
  });

  return grid;
};

/* Fallback Demo Bus Types if backend has none yet */
const DEMO_SAVED_BUS_TYPES = [
  {
    _id: "demo-bt-1",
    name: "Seater/Sleeper 2+1",
    vehicleMake: "Leyland",
    otherInfo: "Air Suspension",
    seatingType: "2+1",
    isAc: true,
    displayName: "Leyland Seater/Sleeper 2+1 Air Suspension Ac",
    hasUpperDeck: true,
    totalSeats: 36,
    lowerSeatsCount: 24,
    upperSeatsCount: 12,
    lowerDeckGrid: createDefault2Plus1Grid(),
    upperDeckGrid: createEmptyGrid(),
  },
  {
    _id: "demo-bt-2",
    name: "Volvo Multi-Axle 2+2",
    vehicleMake: "Volvo",
    otherInfo: "Multi-Axle",
    seatingType: "2+2",
    isAc: true,
    displayName: "Volvo Volvo Multi-Axle 2+2 Multi-Axle AC",
    hasUpperDeck: false,
    totalSeats: 45,
    lowerSeatsCount: 45,
    upperSeatsCount: 0,
    lowerDeckGrid: createEmptyGrid(),
    upperDeckGrid: [],
  },
];

export default function BusTypes({ onNavigate }) {
  // View mode: 'editor' (exact RedBus BO GDS #newbustype) vs 'list'
  const [viewMode, setViewMode] = useState("editor");

  // Saved types from backend
  const [busTypes, setBusTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Notifications
  const [toast, setToast] = useState({ text: "", type: "" });
  const showToast = (text, type = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast({ text: "", type: "" }), 4000);
  };

  // Form State matching screenshot
  const [name, setName] = useState("Seater/Sleeper 2+1");
  const [vehicleMake, setVehicleMake] = useState("Leyland");
  const [otherInfo, setOtherInfo] = useState("Air Suspension");
  const [seatingType, setSeatingType] = useState("2+1");
  const [isAc, setIsAc] = useState(true);
  const [hasUpperDeck, setHasUpperDeck] = useState(false);

  // Deck Grids
  const [lowerGrid, setLowerGrid] = useState(createDefault2Plus1Grid);
  const [upperGrid, setUpperGrid] = useState(createEmptyGrid);

  // Active Deck Tab ('LOWER' | 'UPPER')
  const [activeDeckTab, setActiveDeckTab] = useState("LOWER");

  // Categorize Modal
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryType, setCategoryType] = useState("REGULAR");

  // Dynamic Display Name computed live
  const computedDisplayName = useMemo(() => {
    return `${vehicleMake} ${name} ${otherInfo} ${isAc ? "Ac" : "Non-Ac"}`.trim();
  }, [vehicleMake, name, otherInfo, isAc]);

  // Total seat counters
  const lowerSeatsCount = useMemo(
    () => lowerGrid.filter((c) => c.isSeat && c.seatNumber).length,
    [lowerGrid]
  );
  const upperSeatsCount = useMemo(
    () => (hasUpperDeck ? upperGrid.filter((c) => c.isSeat && c.seatNumber).length : 0),
    [hasUpperDeck, upperGrid]
  );
  const totalSeatsCount = lowerSeatsCount + upperSeatsCount;

  /* ── Fetch Saved Bus Types from Backend ── */
  const fetchBusTypes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/bus-types/vendor`, {
        headers: getAuthHeader(),
      });
      if (res.data?.success && res.data.busTypes?.length > 0) {
        setBusTypes(res.data.busTypes);
      } else {
        setBusTypes(DEMO_SAVED_BUS_TYPES);
      }
    } catch {
      setBusTypes(DEMO_SAVED_BUS_TYPES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBusTypes();
  }, [fetchBusTypes]);

  /* ── Cell Click Handler ── */
  const handleCellClick = (deck, row, col) => {
    const grid = deck === "LOWER" ? [...lowerGrid] : [...upperGrid];
    const cellIndex = grid.findIndex((c) => c.row === row && c.col === col);
    if (cellIndex === -1) return;

    const cell = { ...grid[cellIndex] };

    if (!cell.isSeat) {
      // Toggle to seat with next available number
      const existingSeats = grid
        .filter((c) => c.isSeat && c.seatNumber)
        .map((c) => parseInt(c.seatNumber, 10))
        .filter((n) => !isNaN(n));
      const nextNum = existingSeats.length > 0 ? Math.max(...existingSeats) + 1 : 1;

      cell.isSeat = true;
      cell.seatNumber = String(nextNum);
      cell.seatType = "SEATER";
      cell.category = "REGULAR";
    } else {
      // Toggle off
      cell.isSeat = false;
      cell.seatNumber = "";
    }

    grid[cellIndex] = cell;
    if (deck === "LOWER") setLowerGrid(grid);
    else setUpperGrid(grid);
  };

  /* ── Quick Preset Layouts ── */
  const applyPreset = (type) => {
    if (type === "2+1") {
      setSeatingType("2+1");
      setLowerGrid(createDefault2Plus1Grid());
      showToast("Applied standard 2+1 layout preset");
    } else if (type === "2+2") {
      setSeatingType("2+2");
      const grid = createEmptyGrid();
      let seatNo = 1;
      const targetRows = [0, 1, 3, 4];
      for (let c = 0; c < 10; c++) {
        for (let i = 0; i < targetRows.length; i++) {
          const r = targetRows[i];
          const cell = grid.find((item) => item.row === r && item.col === c);
          if (cell) {
            cell.isSeat = true;
            cell.seatNumber = String(seatNo);
            seatNo += 1;
            cell.seatType = "SEATER";
          }
        }
      }
      setLowerGrid(grid);
      showToast("Applied standard 2+2 layout preset");
    } else if (type === "clear") {
      setLowerGrid(createEmptyGrid());
      setUpperGrid(createEmptyGrid());
      showToast("Grid cleared", "info");
    }
  };

  /* ── Auto-Number Seats sequentially ── */
  const autoNumberSeats = (deck) => {
    const grid = deck === "LOWER" ? [...lowerGrid] : [...upperGrid];
    let num = deck === "LOWER" ? 1 : lowerSeatsCount + 1;

    for (let c = 0; c < GRID_COLS; c++) {
      for (let r = 0; r < GRID_ROWS; r++) {
        const cellIndex = grid.findIndex((item) => item.row === r && item.col === c);
        if (cellIndex !== -1 && grid[cellIndex].isSeat) {
          grid[cellIndex] = { ...grid[cellIndex], seatNumber: String(num++) };
        }
      }
    }

    if (deck === "LOWER") setLowerGrid(grid);
    else setUpperGrid(grid);
    showToast(`Seats auto-numbered on ${deck} deck`);
  };

  /* ── Save / Update Bus Type to Backend ── */
  const handleSaveBusType = async () => {
    if (!name.trim()) {
      showToast("Please enter a name for the bus type", "error");
      return;
    }

    setSaveLoading(true);
    try {
      const payload = {
        name,
        vehicleMake,
        otherInfo,
        seatingType,
        isAc,
        hasUpperDeck,
        gridRows: GRID_ROWS,
        gridCols: GRID_COLS,
        lowerDeckGrid: lowerGrid,
        upperDeckGrid: hasUpperDeck ? upperGrid : [],
      };

      let res;
      if (editingId) {
        res = await axios.put(`${API_BASE}/bus-types/${editingId}`, payload, {
          headers: getAuthHeader(),
        });
      } else {
        res = await axios.post(`${API_BASE}/bus-types`, payload, {
          headers: getAuthHeader(),
        });
      }

      if (res.data?.success) {
        showToast(
          editingId
            ? "Bus Type updated successfully!"
            : "New Bus Type saved successfully!"
        );
        fetchBusTypes();
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save Bus Type", "error");
    } finally {
      setSaveLoading(false);
    }
  };

  /* ── Load Bus Type for Editing ── */
  const handleEditBusType = (bt) => {
    setEditingId(bt._id);
    setName(bt.name || "");
    setVehicleMake(bt.vehicleMake || "Leyland");
    setOtherInfo(bt.otherInfo || "Air Suspension");
    setSeatingType(bt.seatingType || "2+1");
    setIsAc(bt.isAc !== undefined ? bt.isAc : true);
    setHasUpperDeck(Boolean(bt.hasUpperDeck));

    if (bt.lowerDeckGrid?.length > 0) {
      setLowerGrid(bt.lowerDeckGrid);
    } else {
      setLowerGrid(createDefault2Plus1Grid());
    }

    if (bt.upperDeckGrid?.length > 0) {
      setUpperGrid(bt.upperDeckGrid);
    } else {
      setUpperGrid(createEmptyGrid());
    }

    setViewMode("editor");
  };

  /* ── Delete Bus Type ── */
  const handleDeleteBusType = async (id) => {
    if (!window.confirm("Are you sure you want to delete this bus type?")) return;
    try {
      const res = await axios.delete(`${API_BASE}/bus-types/${id}`, {
        headers: getAuthHeader(),
      });
      if (res.data?.success) {
        showToast("Bus type deleted");
        fetchBusTypes();
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete", "error");
    }
  };

  /* ── Helper to render active seats in the live preview bus chassis ── */
  const renderChassisSeats = (grid) => {
    const seats = grid.filter((c) => c.isSeat && c.seatNumber);
    if (seats.length === 0) {
      return (
        <div className="btype-preview-empty">
          <small>Click on grid cells to add seats</small>
        </div>
      );
    }

    // Determine max columns used
    const maxCol = Math.max(...seats.map((s) => s.col), 0);

    return (
      <div
        className="btype-chassis-grid"
        style={{
          gridTemplateColumns: `repeat(${maxCol + 1}, 24px)`,
          gridTemplateRows: `repeat(${GRID_ROWS}, 24px)`,
        }}
      >
        {seats.map((seat) => (
          <div
            key={`${seat.row}-${seat.col}`}
            className={`btype-preview-seat seat-${seat.category?.toLowerCase() || "regular"}`}
            style={{
              gridRowStart: seat.row + 1,
              gridColumnStart: seat.col + 1,
            }}
            title={`Seat ${seat.seatNumber} (${seat.category || "Regular"})`}
          >
            <div className="btype-preview-seat-head" />
            <span className="btype-preview-seat-num">{seat.seatNumber}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="btype-page">
      {/* Toast Notification */}
      {toast.text && (
        <div className={`btype-toast ${toast.type}`}>
          {toast.type === "error" ? <MdWarning /> : <MdCheckCircle />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* ===================================================
          MODE 1: REDBUS BO GDS EXACT EDITOR (#newbustype)
          =================================================== */}
      {viewMode === "editor" ? (
        <div className="btype-editor-card">
          {/* Top Breadcrumb Link */}
          <div className="btype-top-nav">
            <button
              className="btype-back-link"
              onClick={() => setViewMode("list")}
            >
              « Back to Bus Types
            </button>

            {editingId && (
              <span className="btype-editing-badge">
                Editing: {name} (ID: {editingId.slice(-6)})
              </span>
            )}
          </div>

          {/* Form Control Row 1: Name */}
          <div className="btype-form-row">
            <label className="btype-field-label">
              Name{" "}
              <span
                className="btype-help-icon"
                title="Enter a name for this bus type configuration (e.g. Seater/Sleeper 2+1)"
              >
                (?)
              </span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="btype-input btype-input-lg"
              placeholder="e.g. Seater/Sleeper 2+1"
            />
          </div>

          {/* Form Control Row 2: Vehicle Make & Other info */}
          <div className="btype-form-row-multi">
            <div className="btype-form-field">
              <label className="btype-field-label">Vehicle Make</label>
              <select
                value={vehicleMake}
                onChange={(e) => setVehicleMake(e.target.value)}
                className="btype-select"
              >
                <option value="Leyland">Leyland</option>
                <option value="Volvo">Volvo</option>
                <option value="Scania">Scania</option>
                <option value="Tata">Tata</option>
                <option value="Eicher">Eicher</option>
                <option value="BharatBenz">BharatBenz</option>
                <option value="Mercedes-Benz">Mercedes-Benz</option>
                <option value="Force">Force</option>
                <option value="Isuzu">Isuzu</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="btype-form-field">
              <label className="btype-field-label">Other info</label>
              <select
                value={otherInfo}
                onChange={(e) => setOtherInfo(e.target.value)}
                className="btype-select"
              >
                <option value="Air Suspension">Air Suspension</option>
                <option value="Non-Air Suspension">Non-Air Suspension</option>
                <option value="Multi-Axle">Multi-Axle</option>
                <option value="Ultra Deluxe">Ultra Deluxe</option>
                <option value="Standard">Standard</option>
                <option value="Executive">Executive</option>
              </select>
            </div>
          </div>

          {/* Form Control Row 3: Seating Type & AC */}
          <div className="btype-form-row-multi">
            <div className="btype-form-field">
              <label className="btype-field-label">Seating Type</label>
              <select
                value={seatingType}
                onChange={(e) => setSeatingType(e.target.value)}
                className="btype-select"
              >
                <option value="2+1">2+1</option>
                <option value="2+2">2+2</option>
                <option value="1+2">1+2</option>
                <option value="2+3">2+3</option>
                <option value="1+1">1+1 VIP</option>
              </select>
            </div>

            <div className="btype-form-field btype-checkbox-field">
              <label className="btype-field-label">Ac</label>
              <input
                type="checkbox"
                id="btype-ac-check"
                checked={isAc}
                onChange={(e) => setIsAc(e.target.checked)}
                className="btype-checkbox"
              />
            </div>
          </div>

          {/* Dynamic Bus Type Display Heading */}
          <div className="btype-display-name-section">
            <div className="btype-display-name-label">
              Bus Type will be displayed as:
            </div>
            <div className="btype-display-name-val">
              {computedDisplayName}
            </div>
          </div>

          {/* Deck Switcher Tabs (LOWER / UPPER) */}
          <div className="btype-deck-tabs-row">
            <div className="btype-deck-buttons">
              <button
                type="button"
                className={`btype-deck-btn ${
                  activeDeckTab === "LOWER" ? "active" : ""
                }`}
                onClick={() => setActiveDeckTab("LOWER")}
              >
                LOWER ({lowerSeatsCount} Seats)
              </button>

              {hasUpperDeck && (
                <button
                  type="button"
                  className={`btype-deck-btn ${
                    activeDeckTab === "UPPER" ? "active" : ""
                  }`}
                  onClick={() => setActiveDeckTab("UPPER")}
                >
                  UPPER ({upperSeatsCount} Berths)
                </button>
              )}
            </div>

            <div className="btype-upper-toggle">
              <label>
                <input
                  type="checkbox"
                  checked={hasUpperDeck}
                  onChange={(e) => {
                    setHasUpperDeck(e.target.checked);
                    if (!e.target.checked && activeDeckTab === "UPPER") {
                      setActiveDeckTab("LOWER");
                    }
                  }}
                />{" "}
                Include Upper Deck (Sleeper)
              </label>
            </div>

            {/* Layout Quick Presets */}
            <div className="btype-presets-toolbar">
              <button
                type="button"
                className="btype-tool-btn"
                onClick={() => applyPreset("2+1")}
                title="Fill 2+1 standard layout"
              >
                <MdFlashOn /> 2+1 Preset
              </button>
              <button
                type="button"
                className="btype-tool-btn"
                onClick={() => applyPreset("2+2")}
                title="Fill 2+2 pushback layout"
              >
                <MdFlashOn /> 2+2 Preset
              </button>
              <button
                type="button"
                className="btype-tool-btn"
                onClick={() => autoNumberSeats(activeDeckTab)}
                title="Sequentially renumber seats"
              >
                Auto-Number
              </button>
              <button
                type="button"
                className="btype-tool-btn danger"
                onClick={() => applyPreset("clear")}
                title="Clear current grid"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Active Deck Header */}
          <div className="btype-active-deck-title">
            <b>{activeDeckTab}</b>
          </div>

          {/* Main Interactive Grid & Live Bus Preview */}
          <div className="btype-grid-preview-container">
            {/* Left: The Clickable Matrix Grid */}
            <div className="btype-matrix-wrapper">
              <div
                className="btype-matrix-grid"
                style={{
                  gridTemplateRows: `repeat(${GRID_ROWS}, 32px)`,
                  gridTemplateColumns: `repeat(${GRID_COLS}, 32px)`,
                }}
              >
                {(activeDeckTab === "LOWER" ? lowerGrid : upperGrid).map(
                  (cell) => {
                    const isFilled = cell.isSeat && cell.seatNumber;
                    return (
                      <div
                        key={`${cell.row}-${cell.col}`}
                        className={`btype-grid-cell ${
                          isFilled ? "filled-seat" : "empty-cell"
                        }`}
                        onClick={() =>
                          handleCellClick(activeDeckTab, cell.row, cell.col)
                        }
                        title={
                          isFilled
                            ? `Seat ${cell.seatNumber} (Click to remove)`
                            : `Row ${cell.row + 1}, Col ${
                                cell.col + 1
                              } (Click to add seat)`
                        }
                      >
                        {isFilled && (
                          <span className="btype-cell-seat-num">
                            {cell.seatNumber}
                          </span>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
              <small className="btype-grid-hint">
                * Click on any empty square to place a seat, click on a green
                square to remove.
              </small>
            </div>

            {/* Right: Live Bus Chassis Outline Preview matching screenshot */}
            <div className="btype-preview-panel">
              <div className="btype-chassis-box">
                {/* Steering wheel at front */}
                <div className="btype-chassis-front">
                  <div className="btype-steering-circle" title="Driver Cabin">
                    <SteeringWheelIcon />
                  </div>
                </div>

                {/* Seat layout outline */}
                <div className="btype-chassis-interior">
                  {renderChassisSeats(
                    activeDeckTab === "LOWER" ? lowerGrid : upperGrid
                  )}
                </div>
              </div>

              {/* Categorize Seats Link */}
              <div className="btype-categorize-link-row">
                <button
                  type="button"
                  className="btype-categorize-link"
                  onClick={() => setShowCategoryModal(true)}
                >
                  + Categorize Seats (Optional)
                </button>
              </div>

              {/* Total Capacity Counter */}
              <div className="btype-capacity-pill">
                <span>Total Seats: </span>
                <b>{totalSeatsCount}</b>
                <small>
                  {" "}
                  ({lowerSeatsCount} Lower
                  {hasUpperDeck ? `, ${upperSeatsCount} Upper` : ""})
                </small>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="btype-bottom-actions">
            <button
              type="button"
              className="btype-btn btype-btn-primary"
              onClick={handleSaveBusType}
              disabled={saveLoading}
            >
              {saveLoading
                ? "Saving to Registry…"
                : editingId
                ? "Update Bus Type"
                : "Save Bus Type"}
            </button>

            <button
              type="button"
              className="btype-btn btype-btn-secondary"
              onClick={() => {
                if (editingId) {
                  setEditingId(null);
                  setName("Seater/Sleeper 2+1");
                  setLowerGrid(createDefault2Plus1Grid());
                }
                setViewMode("list");
              }}
            >
              Cancel / View Saved
            </button>
          </div>
        </div>
      ) : (
        /* ===================================================
            MODE 2: SAVED BUS TYPES LISTING
            =================================================== */
        <div className="btype-list-card">
          <div className="btype-list-header">
            <div>
              <h2 className="btype-list-title">Configured Bus Types</h2>
              <p className="btype-list-subtitle">
                Registered seating configurations and vehicle blueprints for
                your fleet
              </p>
            </div>

            <div className="btype-list-header-actions">
              <button
                className="btype-btn btype-btn-secondary"
                onClick={fetchBusTypes}
                title="Refresh list"
              >
                <MdRefresh /> Refresh
              </button>
              <button
                className="btype-btn btype-btn-primary"
                onClick={() => {
                  setEditingId(null);
                  setName("Seater/Sleeper 2+1");
                  setVehicleMake("Leyland");
                  setOtherInfo("Air Suspension");
                  setSeatingType("2+1");
                  setIsAc(true);
                  setHasUpperDeck(false);
                  setLowerGrid(createDefault2Plus1Grid());
                  setViewMode("editor");
                }}
              >
                <MdAdd /> + Add New Bus Type
              </button>
            </div>
          </div>

          {/* Bus Types Cards Grid */}
          {loading ? (
            <div className="btype-loading">Loading bus types…</div>
          ) : busTypes.length === 0 ? (
            <div className="btype-empty">
              <MdAirlineSeatReclineExtra className="btype-empty-icon" />
              <h3>No bus types configured yet</h3>
              <p>Create your first custom seating layout blueprint.</p>
              <button
                className="btype-btn btype-btn-primary"
                onClick={() => setViewMode("editor")}
              >
                <MdAdd /> Create Bus Type
              </button>
            </div>
          ) : (
            <div className="btype-cards-grid">
              {busTypes.map((bt) => (
                <div key={bt._id} className="btype-summary-card">
                  <div className="btype-card-top">
                    <div>
                      <h3 className="btype-card-name">
                        {bt.displayName || bt.name}
                      </h3>
                      <span className="btype-card-make">
                        Make: <b>{bt.vehicleMake}</b> • Layout:{" "}
                        <b>{bt.seatingType}</b>
                      </span>
                    </div>
                    {bt.isAc && (
                      <span className="btype-badge-ac">
                        <MdAcUnit /> AC
                      </span>
                    )}
                  </div>

                  <div className="btype-card-specs">
                    <div className="btype-spec-chip">
                      <span>Total Capacity:</span>
                      <b>{bt.totalSeats || 0} Seats</b>
                    </div>
                    <div className="btype-spec-chip">
                      <span>Lower Deck:</span>
                      <b>{bt.lowerSeatsCount || 0}</b>
                    </div>
                    {bt.hasUpperDeck && (
                      <div className="btype-spec-chip">
                        <span>Upper Deck:</span>
                        <b>{bt.upperSeatsCount || 0}</b>
                      </div>
                    )}
                    <div className="btype-spec-chip">
                      <span>Suspension:</span>
                      <b>{bt.otherInfo}</b>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="btype-card-actions">
                    <button
                      className="btype-btn-card-edit"
                      onClick={() => handleEditBusType(bt)}
                      title="Edit layout blueprint"
                    >
                      <MdEdit /> Edit Layout
                    </button>
                    <button
                      className="btype-btn-card-del"
                      onClick={() => handleDeleteBusType(bt._id)}
                      title="Delete bus type"
                    >
                      <MdDeleteOutline />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===================================================
          MODAL: CATEGORIZE SEATS (Optional)
          =================================================== */}
      {showCategoryModal && (
        <div className="btype-modal-backdrop">
          <div className="btype-modal-box">
            <div className="btype-modal-header">
              <h3>Categorize Seats</h3>
              <button
                className="btype-modal-close"
                onClick={() => setShowCategoryModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="btype-modal-body">
              <p>
                Choose a passenger category to tag special seats (e.g. Ladies
                Quota, Senior Citizen, Sleeper Berth, VIP):
              </p>
              <div className="btype-category-options">
                {[
                  {
                    id: "REGULAR",
                    label: "Regular Seat",
                    desc: "Standard general booking",
                  },
                  {
                    id: "LADIES",
                    label: "Ladies Only Quota",
                    desc: "Restricted to female passengers",
                  },
                  {
                    id: "SENIOR",
                    label: "Senior Citizen",
                    desc: "Priority lower deck seating",
                  },
                  {
                    id: "VIP",
                    label: "VIP / Executive",
                    desc: "Premium legroom and comfort",
                  },
                  {
                    id: "CREW",
                    label: "Crew / Conductor",
                    desc: "Reserved for operator staff",
                  },
                ].map((cat) => (
                  <label
                    key={cat.id}
                    className={`btype-cat-radio-label ${
                      categoryType === cat.id ? "selected" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="seatCategory"
                      value={cat.id}
                      checked={categoryType === cat.id}
                      onChange={(e) => setCategoryType(e.target.value)}
                    />
                    <div>
                      <b>{cat.label}</b>
                      <small>{cat.desc}</small>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="btype-modal-footer">
              <button
                type="button"
                className="btype-btn btype-btn-secondary"
                onClick={() => setShowCategoryModal(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="btype-btn btype-btn-primary"
                onClick={() => {
                  showToast(`Selected category: ${categoryType}`);
                  setShowCategoryModal(false);
                }}
              >
                Apply Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
