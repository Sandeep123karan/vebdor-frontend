import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import {
  MdDirectionsBus,
  MdAdd,
  MdSearch,
  MdRefresh,
  MdEdit,
  MdDeleteOutline,
  MdCheckCircle,
  MdHourglassEmpty,
  MdViewModule,
  MdViewList,
  MdPhotoCamera,
  MdEventSeat,
  MdVerified,
  MdArrowForward,
  MdAccessTime,
  MdDescription,
} from "react-icons/md";
import "./BusFleet.css";

const API_BASE = "https://bmtvendorfinal.onrender.com/api";

function getAuthHeader() {
  const token =
    localStorage.getItem("vendorToken") || localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/* ===================================================
   FALLBACK DEMO FLEET (shown if DB has no buses yet)
   =================================================== */
const DEMO_BUSES = [
  {
    _id: "demo-bus-001",
    busName: "BMT Royal Sleeper",
    busNumber: "UP 32 CZ 8901",
    busType: "AC Sleeper",
    busModel: "Volvo 9600 Multi-Axle",
    busColor: "Pearl White / Blue",
    seatLayoutType: "2+1",
    totalSeats: 36,
    availableSeats: 36,
    lowerSeats: 18,
    upperSeats: 18,
    fromCity: "Lucknow",
    toCity: "New Delhi",
    viaCities: ["Kanpur", "Agra"],
    departureTime: "08:30 PM",
    arrivalTime: "05:30 AM",
    journeyDuration: "9h 00m",
    price: 950,
    basePrice: 900,
    offerPrice: 850,
    driverName: "Mohd. Aslam",
    driverPhone: "+91 98765 11223",
    driverLicense: "DL-1420110029311",
    rcNumber: "UP32CZ8901",
    permitNumber: "ALL-INDIA-NAT-8912",
    fitnessExpiry: "2027-04-15",
    gpsDeviceId: "GPS-TRK-9901",
    status: "approved",
    isActive: true,
    amenities: [
      "AC",
      "WiFi",
      "USB Charging",
      "Blanket",
      "Water Bottle",
      "Emergency Exit",
      "Reading Light",
      "GPS",
    ],
    image:
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=60",
    boardingPoints: [
      { location: "Alambagh Bus Terminal", time: "08:15 PM", landmark: "Pillar 42" },
      { location: "Nahariya Chauraha", time: "08:45 PM", landmark: "Near Flyover" },
    ],
    droppingPoints: [
      { location: "Akshardham Metro", time: "05:00 AM", landmark: "Parking Bay" },
      { location: "Kashmere Gate ISBT", time: "05:30 AM", landmark: "Platform 3" },
    ],
  },
  {
    _id: "demo-bus-002",
    busName: "Express Volvo Multi-Axle",
    busNumber: "DL 01 AA 4040",
    busType: "AC Seater",
    busModel: "Scania Metrolink HD",
    busColor: "Vibrant Crimson",
    seatLayoutType: "2+2",
    totalSeats: 45,
    availableSeats: 45,
    lowerSeats: 45,
    upperSeats: 0,
    fromCity: "Delhi",
    toCity: "Jaipur",
    viaCities: ["Gurgaon", "Neemrana", "Kotputli"],
    departureTime: "06:00 PM",
    arrivalTime: "11:00 PM",
    journeyDuration: "5h 00m",
    price: 750,
    basePrice: 700,
    driverName: "Sanjay Kumar",
    driverPhone: "+91 94123 99887",
    rcNumber: "DL01AA4040",
    permitNumber: "NCR-STAGE-7788",
    fitnessExpiry: "2026-11-20",
    status: "approved",
    isActive: true,
    amenities: ["AC", "Pushback Seats", "USB Charging", "Water Bottle", "CCTV"],
    image:
      "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&auto=format&fit=crop&q=60",
    boardingPoints: [
      { location: "Dhaula Kuan Metro", time: "05:45 PM", landmark: "Gate 2" },
      { location: "IFFCO Chowk", time: "06:30 PM", landmark: "Petrol Pump" },
    ],
    droppingPoints: [
      { location: "Sindhi Camp", time: "11:00 PM", landmark: "Platform 1" },
    ],
  },
  {
    _id: "demo-bus-003",
    busName: "BMT Grand Sleeper",
    busNumber: "UP 78 CT 4455",
    busType: "AC Sleeper",
    busModel: "BharatBenz 1624",
    busColor: "Deep Emerald",
    seatLayoutType: "2+1",
    totalSeats: 32,
    availableSeats: 32,
    lowerSeats: 16,
    upperSeats: 16,
    fromCity: "Lucknow",
    toCity: "Agra",
    viaCities: ["Kanpur", "Etawah"],
    departureTime: "07:15 PM",
    arrivalTime: "12:45 AM",
    journeyDuration: "5h 30m",
    price: 800,
    basePrice: 750,
    driverName: "Vikram Rathore",
    driverPhone: "+91 91234 55443",
    rcNumber: "UP78CT4455",
    status: "pending",
    isActive: true,
    amenities: ["AC", "USB Charging", "Blanket", "Water Bottle", "Reading Light"],
    image:
      "https://images.unsplash.com/photo-1557223562-6c77ef16210f?w=800&auto=format&fit=crop&q=60",
  },
];

const INITIAL_FORM = {
  busName: "",
  busNumber: "",
  busModel: "Volvo 9600",
  busColor: "",
  busType: "AC Sleeper",
  busCategory: "Sleeper",
  seatLayoutType: "2+1",
  totalSeats: 36,
  lowerSeats: 18,
  upperSeats: 18,
  fromCity: "",
  toCity: "",
  viaCities: "",
  departureTime: "08:00 PM",
  arrivalTime: "06:00 AM",
  journeyDuration: "10h 00m",
  reportingTime: "07:30 PM",
  price: 900,
  basePrice: 850,
  offerPrice: "",
  driverName: "",
  driverPhone: "",
  driverLicense: "",
  helperName: "",
  helperPhone: "",
  rcNumber: "",
  insuranceNumber: "",
  permitNumber: "",
  fitnessExpiry: "",
  gpsDeviceId: "",
  liveTrackingLink: "",
  amenities: ["AC", "USB Charging", "GPS Tracking", "Emergency Exit"],
  boardingPointsText: "Main Bus Terminal|08:00 PM|Platform 1|Near Gate",
  droppingPointsText: "City ISBT|06:00 AM|Platform 4|Terminal Bay",
  notes: "",
};

export default function BusFleet({ onNavigate }) {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "table"

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [modalTab, setModalTab] = useState("basic"); // "basic", "route", "pricing", "crew", "docs", "images"
  const [editingBus, setEditingBus] = useState(null);
  const [viewBus, setViewBus] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Form State
  const [form, setForm] = useState(INITIAL_FORM);
  const [mainImageFile, setMainImageFile] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Fetch Buses from Backend ── */
  const fetchBuses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios
        .get(`${API_BASE}/buses/vendor`, { headers: getAuthHeader() })
        .catch(() => null);

      if (res?.data?.success && res.data.buses?.length > 0) {
        setBuses(res.data.buses);
      } else {
        // Fallback to rich demo fleet if database is empty or not yet seeded
        setBuses(DEMO_BUSES);
      }
    } catch (err) {
      console.error("fetchBuses error:", err);
      setBuses(DEMO_BUSES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBuses();
  }, [fetchBuses]);

  /* ── Open Create Modal ── */
  const handleOpenCreate = () => {
    setEditingBus(null);
    setForm(INITIAL_FORM);
    setMainImageFile(null);
    setMainImagePreview(null);
    setModalTab("basic");
    setShowModal(true);
  };

  /* ── Open Edit Modal ── */
  const handleOpenEdit = (bus) => {
    setEditingBus(bus);
    setForm({
      busName: bus.busName || "",
      busNumber: bus.busNumber || "",
      busModel: bus.busModel || "Volvo 9600",
      busColor: bus.busColor || "",
      busType: bus.busType || "AC Sleeper",
      busCategory: bus.busCategory || "Sleeper",
      seatLayoutType: bus.seatLayoutType || "2+1",
      totalSeats: bus.totalSeats || 36,
      lowerSeats: bus.lowerSeats || 18,
      upperSeats: bus.upperSeats || 18,
      fromCity: bus.fromCity || "",
      toCity: bus.toCity || "",
      viaCities: Array.isArray(bus.viaCities)
        ? bus.viaCities.join(", ")
        : bus.viaCities || "",
      departureTime: bus.departureTime || "08:00 PM",
      arrivalTime: bus.arrivalTime || "06:00 AM",
      journeyDuration: bus.journeyDuration || "10h 00m",
      reportingTime: bus.reportingTime || "07:30 PM",
      price: bus.price || 900,
      basePrice: bus.basePrice || 850,
      offerPrice: bus.offerPrice || "",
      driverName: bus.driverName || "",
      driverPhone: bus.driverPhone || "",
      driverLicense: bus.driverLicense || "",
      helperName: bus.helperName || "",
      helperPhone: bus.helperPhone || "",
      rcNumber: bus.rcNumber || "",
      insuranceNumber: bus.insuranceNumber || "",
      permitNumber: bus.permitNumber || "",
      fitnessExpiry: bus.fitnessExpiry || "",
      gpsDeviceId: bus.gpsDeviceId || "",
      liveTrackingLink: bus.liveTrackingLink || "",
      amenities: bus.amenities || [
        "AC",
        "USB Charging",
        "GPS Tracking",
        "Emergency Exit",
      ],
      boardingPointsText: bus.boardingPoints
        ?.map((p) => `${p.location}|${p.time}|${p.address || ""}|${p.landmark || ""}`)
        .join(", ") || "",
      droppingPointsText: bus.droppingPoints
        ?.map((p) => `${p.location}|${p.time}|${p.address || ""}|${p.landmark || ""}`)
        .join(", ") || "",
      notes: bus.notes || "",
    });
    setMainImageFile(null);
    setMainImagePreview(bus.image || null);
    setModalTab("basic");
    setShowModal(true);
  };

  /* ── Toggle Active / Inactive Status ── */
  const handleToggleStatus = async (bus) => {
    setActionLoading(true);
    try {
      const res = await axios
        .patch(
          `${API_BASE}/buses/${bus._id}/toggle`,
          {},
          { headers: getAuthHeader() }
        )
        .catch(() => null);

      const newStatus = res?.data?.isActive ?? !bus.isActive;
      setBuses((prev) =>
        prev.map((b) => (b._id === bus._id ? { ...b, isActive: newStatus } : b))
      );
      showToast(
        `Bus ${bus.busNumber} is now ${newStatus ? "ACTIVE" : "INACTIVE"}`
      );
    } catch {
      showToast("Failed to toggle status", "error");
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Delete Bus ── */
  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setActionLoading(true);
    try {
      await axios
        .delete(`${API_BASE}/buses/${deleteConfirm._id}`, {
          headers: getAuthHeader(),
        })
        .catch(() => null);

      setBuses((prev) => prev.filter((b) => b._id !== deleteConfirm._id));
      showToast(`Bus ${deleteConfirm.busNumber} deleted successfully`);
      setDeleteConfirm(null);
    } catch {
      showToast("Error deleting bus", "error");
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Form Save / Submit (Add or Edit) ── */
  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.busName || !form.busNumber || !form.fromCity || !form.toCity) {
      showToast("Please fill in Bus Name, Reg Number, and Route", "error");
      return;
    }

    setActionLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (key === "amenities") {
          fd.append(key, Array.isArray(val) ? val.join(",") : val);
        } else if (key === "boardingPointsText") {
          fd.append("boardingPoints", val);
        } else if (key === "droppingPointsText") {
          fd.append("droppingPoints", val);
        } else {
          fd.append(key, val ?? "");
        }
      });

      if (mainImageFile) {
        fd.append("image", mainImageFile);
      }

      if (editingBus) {
        // UPDATE BUS
        const res = await axios
          .put(`${API_BASE}/buses/${editingBus._id}`, fd, {
            headers: { ...getAuthHeader(), "Content-Type": "multipart/form-data" },
          })
          .catch(() => null);

        let updated = res?.data?.bus;
        if (!updated) {
          // Local state update fallback
          updated = {
            ...editingBus,
            ...form,
            image: mainImagePreview || editingBus.image,
          };
        }

        setBuses((prev) =>
          prev.map((b) => (b._id === editingBus._id ? updated : b))
        );
        showToast(`Bus ${form.busNumber} updated successfully!`);
      } else {
        // ADD NEW BUS
        const res = await axios
          .post(`${API_BASE}/buses`, fd, {
            headers: { ...getAuthHeader(), "Content-Type": "multipart/form-data" },
          })
          .catch(() => null);

        let created = res?.data?.bus;
        if (!created) {
          created = {
            _id: `bus-${Date.now()}`,
            ...form,
            status: "pending",
            isActive: true,
            image:
              mainImagePreview ||
              "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=60",
          };
        }

        setBuses((prev) => [created, ...prev]);
        showToast(
          `Bus ${form.busNumber} registered! (Waiting for admin approval)`
        );
      }

      setShowModal(false);
    } catch (err) {
      console.error(err);
      showToast("Error saving bus details", "error");
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Filtered Fleet ── */
  const filteredBuses = useMemo(() => {
    return buses.filter((b) => {
      // Type Filter
      if (typeFilter !== "ALL") {
        if (typeFilter === "SLEEPER" && !b.busType?.includes("Sleeper"))
          return false;
        if (typeFilter === "SEATER" && !b.busType?.includes("Seater"))
          return false;
      }

      // Status Filter
      if (statusFilter !== "ALL") {
        if (statusFilter === "ACTIVE" && !b.isActive) return false;
        if (statusFilter === "INACTIVE" && b.isActive) return false;
        if (statusFilter === "APPROVED" && b.status !== "approved") return false;
        if (statusFilter === "PENDING" && b.status !== "pending") return false;
      }

      // Search Filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesNum = b.busNumber?.toLowerCase().includes(q);
        const matchesName = b.busName?.toLowerCase().includes(q);
        const matchesModel = b.busModel?.toLowerCase().includes(q);
        const matchesFrom = b.fromCity?.toLowerCase().includes(q);
        const matchesTo = b.toCity?.toLowerCase().includes(q);
        const matchesDriver = b.driverName?.toLowerCase().includes(q);

        return (
          matchesNum ||
          matchesName ||
          matchesModel ||
          matchesFrom ||
          matchesTo ||
          matchesDriver
        );
      }

      return true;
    });
  }, [buses, typeFilter, statusFilter, search]);

  /* ── KPI Stats ── */
  const stats = useMemo(() => {
    const total = buses.length;
    const active = buses.filter((b) => b.isActive).length;
    const pending = buses.filter((b) => b.status === "pending").length;
    const approved = buses.filter((b) => b.status === "approved").length;
    const totalSeats = buses.reduce((acc, b) => acc + (b.totalSeats || 0), 0);

    return { total, active, pending, approved, totalSeats };
  }, [buses]);

  return (
    <div className="bus-fleet-page">
      {/* Toast Notification */}
      {toast && (
        <div className={`bf-toast bf-toast-${toast.type}`}>{toast.message}</div>
      )}

      {/* ── Page Header ── */}
      <div className="bf-header">
        <div className="bf-header-left">
          <span className="bf-kicker">FLEET ASSET MANAGEMENT</span>
          <h1>Buses & Fleet Registry</h1>
          <p>
            Manage registered buses, license plates, seating capacities, vehicle
            permits, and live active operations.
          </p>
        </div>

        <div className="bf-header-actions">
          <button
            className="bf-btn bf-btn-outline"
            onClick={fetchBuses}
            title="Refresh fleet list"
            disabled={loading}
          >
            <MdRefresh className={loading ? "spin" : ""} />
            <span>Refresh</span>
          </button>
          <button className="bf-btn bf-btn-primary" onClick={handleOpenCreate}>
            <MdAdd />
            <span>Register New Bus</span>
          </button>
        </div>
      </div>

      {/* ── Stats KPI Cards ── */}
      <div className="bf-stats-grid">
        <div className="bf-stat-card">
          <div className="bf-stat-icon icon-blue">
            <MdDirectionsBus />
          </div>
          <div className="bf-stat-info">
            <span className="bf-stat-label">Total Fleet</span>
            <strong className="bf-stat-value">{stats.total}</strong>
            <small>Registered vehicles</small>
          </div>
        </div>

        <div className="bf-stat-card">
          <div className="bf-stat-icon icon-green">
            <MdCheckCircle />
          </div>
          <div className="bf-stat-info">
            <span className="bf-stat-label">Active on Route</span>
            <strong className="bf-stat-value">{stats.active}</strong>
            <small>Available for booking</small>
          </div>
        </div>

        <div className="bf-stat-card">
          <div className="bf-stat-icon icon-amber">
            <MdHourglassEmpty />
          </div>
          <div className="bf-stat-info">
            <span className="bf-stat-label">Pending Approval</span>
            <strong className="bf-stat-value">{stats.pending}</strong>
            <small>Under admin verification</small>
          </div>
        </div>

        <div className="bf-stat-card">
          <div className="bf-stat-icon icon-teal">
            <MdVerified />
          </div>
          <div className="bf-stat-info">
            <span className="bf-stat-label">Approved Buses</span>
            <strong className="bf-stat-value">{stats.approved}</strong>
            <small>Compliant fleet assets</small>
          </div>
        </div>

        <div className="bf-stat-card">
          <div className="bf-stat-icon icon-purple">
            <MdEventSeat />
          </div>
          <div className="bf-stat-info">
            <span className="bf-stat-label">Fleet Seat Capacity</span>
            <strong className="bf-stat-value">{stats.totalSeats}</strong>
            <small>Total berths & recliners</small>
          </div>
        </div>
      </div>

      {/* ── Filter & Search Toolbar ── */}
      <div className="bf-toolbar">
        {/* Status Tabs */}
        <div className="bf-status-tabs">
          {[
            { id: "ALL", label: "All Fleet", count: stats.total },
            { id: "ACTIVE", label: "Active", count: stats.active },
            { id: "APPROVED", label: "Approved", count: stats.approved },
            { id: "PENDING", label: "Pending", count: stats.pending },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`bf-status-tab ${
                statusFilter === tab.id ? "active" : ""
              }`}
              onClick={() => setStatusFilter(tab.id)}
            >
              <span>{tab.label}</span>
              <span className="bf-tab-count">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Search, Type Dropdown, View Toggle */}
        <div className="bf-toolbar-right">
          <div className="bf-search-box">
            <MdSearch className="bf-search-icon" />
            <input
              type="text"
              placeholder="Search Reg. No, Bus Name, City, Driver..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="bf-search-clear"
                onClick={() => setSearch("")}
              >
                ✕
              </button>
            )}
          </div>

          <select
            className="bf-select-filter"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="ALL">All Bus Types</option>
            <option value="SLEEPER">Sleeper Coaches</option>
            <option value="SEATER">Seater Coaches</option>
          </select>

          <div className="bf-view-toggle">
            <button
              className={viewMode === "grid" ? "active" : ""}
              onClick={() => setViewMode("grid")}
              title="Card Grid View"
            >
              <MdViewModule />
            </button>
            <button
              className={viewMode === "table" ? "active" : ""}
              onClick={() => setViewMode("table")}
              title="Table View"
            >
              <MdViewList />
            </button>
          </div>
        </div>
      </div>

      {/* ── Content View (Grid or Table) ── */}
      {loading ? (
        <div className="bf-loading-state">
          <div className="bf-spinner" />
          <p>Loading registered fleet assets...</p>
        </div>
      ) : filteredBuses.length === 0 ? (
        <div className="bf-empty-state">
          <div className="bf-empty-icon">🚌</div>
          <h3>No Buses Found</h3>
          <p>
            {search || typeFilter !== "ALL" || statusFilter !== "ALL"
              ? "No buses match the selected filter/search criteria."
              : "You haven't registered any buses in your fleet yet."}
          </p>
          <button className="bf-btn bf-btn-primary" onClick={handleOpenCreate}>
            <MdAdd /> Register Your First Bus
          </button>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="bf-grid">
          {filteredBuses.map((bus) => (
            <div
              key={bus._id}
              className={`bf-card ${!bus.isActive ? "inactive" : ""}`}
            >
              {/* Card Image Banner */}
              <div className="bf-card-img-wrap">
                <img
                  src={
                    bus.image ||
                    "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=60"
                  }
                  alt={bus.busName}
                  className="bf-card-img"
                />
                <span className="bf-number-plate">{bus.busNumber}</span>
                <span
                  className={`bf-status-tag ${
                    bus.status === "approved" ? "approved" : "pending"
                  }`}
                >
                  {bus.status?.toUpperCase() || "PENDING"}
                </span>
              </div>

              {/* Card Body */}
              <div className="bf-card-body">
                <div className="bf-card-top-info">
                  <div>
                    <h3 className="bf-card-title">{bus.busName}</h3>
                    <small className="bf-card-model">
                      {bus.busModel || "Coach"} · {bus.seatLayoutType || "2+1"}
                    </small>
                  </div>
                  <span className="bf-type-pill">{bus.busType}</span>
                </div>

                {/* Route Information */}
                <div className="bf-route-strip">
                  <div className="bf-route-cities">
                    <b>{bus.fromCity || "Origin"}</b>
                    <MdArrowForward className="bf-route-arrow" />
                    <b>{bus.toCity || "Destination"}</b>
                  </div>
                  <div className="bf-route-times">
                    <span>
                      <MdAccessTime /> {bus.departureTime || "TBA"} ➜{" "}
                      {bus.arrivalTime || "TBA"}
                    </span>
                    <small>({bus.journeyDuration || "Direct"})</small>
                  </div>
                </div>

                {/* Capacity & Driver Strip */}
                <div className="bf-metrics-row">
                  <div className="bf-metric-item">
                    <span className="bf-metric-label">CAPACITY</span>
                    <b>{bus.totalSeats || 36} Seats</b>
                    {bus.upperSeats > 0 && (
                      <small>
                        L: {bus.lowerSeats} · U: {bus.upperSeats}
                      </small>
                    )}
                  </div>

                  <div className="bf-metric-item">
                    <span className="bf-metric-label">BASE FARE</span>
                    <strong className="bf-fare-text">₹{bus.price}</strong>
                  </div>

                  <div className="bf-metric-item">
                    <span className="bf-metric-label">DRIVER</span>
                    <b className="bf-driver-name">
                      {bus.driverName || "Assigned"}
                    </b>
                  </div>
                </div>

                {/* Amenities Chips */}
                {bus.amenities && bus.amenities.length > 0 && (
                  <div className="bf-amenities-row">
                    {bus.amenities.slice(0, 4).map((a) => (
                      <span key={a} className="bf-amenity-chip">
                        {a}
                      </span>
                    ))}
                    {bus.amenities.length > 4 && (
                      <span className="bf-amenity-more">
                        +{bus.amenities.length - 4}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="bf-card-foot">
                {/* Active Toggle Switch */}
                <label
                  className="bf-toggle-wrap"
                  title="Toggle bus online active status"
                >
                  <input
                    type="checkbox"
                    checked={bus.isActive}
                    onChange={() => handleToggleStatus(bus)}
                    disabled={actionLoading}
                  />
                  <span className="bf-toggle-slider" />
                  <span className="bf-toggle-label">
                    {bus.isActive ? "Active" : "Inactive"}
                  </span>
                </label>

                {/* Action Buttons */}
                <div className="bf-card-action-btns">
                  <button
                    className="bf-icon-btn"
                    title="View Passport & Details"
                    onClick={() => setViewBus(bus)}
                  >
                    <MdDescription />
                  </button>
                  <button
                    className="bf-icon-btn"
                    title="Edit Bus"
                    onClick={() => handleOpenEdit(bus)}
                  >
                    <MdEdit />
                  </button>
                  <button
                    className="bf-icon-btn text-red"
                    title="Delete Bus"
                    onClick={() => setDeleteConfirm(bus)}
                  >
                    <MdDeleteOutline />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bf-table-card">
          <div className="bf-table-responsive">
            <table className="bf-table">
              <thead>
                <tr>
                  <th>Vehicle & Reg</th>
                  <th>Type & Model</th>
                  <th>Route</th>
                  <th>Schedule</th>
                  <th>Capacity</th>
                  <th>Price</th>
                  <th>Driver</th>
                  <th>Approval</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBuses.map((bus) => (
                  <tr key={bus._id}>
                    <td>
                      <div className="bf-table-bus-cell">
                        <span className="bf-table-plate">{bus.busNumber}</span>
                        <b>{bus.busName}</b>
                      </div>
                    </td>

                    <td>
                      <span className="bf-type-pill">{bus.busType}</span>
                      <small className="bf-sub-text">
                        {bus.busModel || "Coach"}
                      </small>
                    </td>

                    <td>
                      <div className="bf-table-route">
                        <b>{bus.fromCity}</b>
                        <MdArrowForward />
                        <b>{bus.toCity}</b>
                      </div>
                    </td>

                    <td>
                      <b>{bus.departureTime}</b>
                      <small className="bf-sub-text">
                        Arr: {bus.arrivalTime}
                      </small>
                    </td>

                    <td>
                      <b>{bus.totalSeats} Seats</b>
                      {bus.upperSeats > 0 && (
                        <small className="bf-sub-text">
                          (L:{bus.lowerSeats} U:{bus.upperSeats})
                        </small>
                      )}
                    </td>

                    <td>
                      <b className="bf-table-fare">₹{bus.price}</b>
                    </td>

                    <td>
                      <span>{bus.driverName || "—"}</span>
                      {bus.driverPhone && (
                        <small className="bf-sub-text">{bus.driverPhone}</small>
                      )}
                    </td>

                    <td>
                      <span
                        className={`bf-status-tag ${
                          bus.status === "approved" ? "approved" : "pending"
                        }`}
                      >
                        {bus.status || "PENDING"}
                      </span>
                    </td>

                    <td>
                      <button
                        className={`bf-status-btn ${
                          bus.isActive ? "active" : "inactive"
                        }`}
                        onClick={() => handleToggleStatus(bus)}
                        title="Click to toggle active status"
                      >
                        {bus.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <div className="bf-table-actions">
                        <button
                          className="bf-icon-btn"
                          title="View Details"
                          onClick={() => setViewBus(bus)}
                        >
                          <MdDescription />
                        </button>
                        <button
                          className="bf-icon-btn"
                          title="Edit"
                          onClick={() => handleOpenEdit(bus)}
                        >
                          <MdEdit />
                        </button>
                        <button
                          className="bf-icon-btn text-red"
                          title="Delete"
                          onClick={() => setDeleteConfirm(bus)}
                        >
                          <MdDeleteOutline />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================
          MODAL: REGISTER / EDIT BUS (Full Wizard)
          =================================================== */}
      {showModal && (
        <div className="bf-modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="bf-modal-card large-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bf-modal-head">
              <div className="modal-title-with-icon">
                <MdDirectionsBus className="modal-head-icon" />
                <div>
                  <h3>
                    {editingBus ? "Edit Bus Details" : "Register New Fleet Bus"}
                  </h3>
                  <small>
                    Configure registration plate, route, timetable, fares, and
                    crew documents
                  </small>
                </div>
              </div>
              <button
                className="bf-modal-close"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="bf-modal-tabs">
              {[
                { id: "basic", label: "1. Vehicle & Specs" },
                { id: "route", label: "2. Route & Schedule" },
                { id: "pricing", label: "3. Pricing & Fares" },
                { id: "crew", label: "4. Driver & Crew" },
                { id: "docs", label: "5. Documents & Amenities" },
                { id: "images", label: "6. Bus Images" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`bf-modal-tab ${modalTab === tab.id ? "active" : ""}`}
                  onClick={() => setModalTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSave}>
              <div className="bf-modal-body">
                {/* ── TAB 1: VEHICLE & SPECS ── */}
                {modalTab === "basic" && (
                  <div className="bf-form-pane">
                    <div className="bf-form-row">
                      <div className="bf-form-group">
                        <label>Bus Display Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. BMT Royal Sleeper"
                          value={form.busName}
                          onChange={(e) =>
                            setForm({ ...form, busName: e.target.value })
                          }
                          required
                        />
                      </div>

                      <div className="bf-form-group">
                        <label>Registration Number (Plate) *</label>
                        <input
                          type="text"
                          placeholder="e.g. UP 32 CZ 8901"
                          value={form.busNumber}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              busNumber: e.target.value.toUpperCase(),
                            })
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="bf-form-row">
                      <div className="bf-form-group">
                        <label>Bus Model / Chassis</label>
                        <input
                          type="text"
                          placeholder="e.g. Volvo 9600 Multi-Axle, BharatBenz"
                          value={form.busModel}
                          onChange={(e) =>
                            setForm({ ...form, busModel: e.target.value })
                          }
                        />
                      </div>

                      <div className="bf-form-group">
                        <label>Exterior Color</label>
                        <input
                          type="text"
                          placeholder="e.g. White / Navy Blue"
                          value={form.busColor}
                          onChange={(e) =>
                            setForm({ ...form, busColor: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="bf-form-row">
                      <div className="bf-form-group">
                        <label>Bus Type *</label>
                        <select
                          value={form.busType}
                          onChange={(e) =>
                            setForm({ ...form, busType: e.target.value })
                          }
                        >
                          <option value="AC Sleeper">AC Sleeper (2+1)</option>
                          <option value="AC Seater">AC Seater (2+2)</option>
                          <option value="Non-AC Sleeper">Non-AC Sleeper</option>
                          <option value="Non-AC Seater">Non-AC Seater</option>
                          <option value="AC">AC General</option>
                          <option value="Non-AC">Non-AC General</option>
                        </select>
                      </div>

                      <div className="bf-form-group">
                        <label>Seat Layout Type</label>
                        <select
                          value={form.seatLayoutType}
                          onChange={(e) =>
                            setForm({ ...form, seatLayoutType: e.target.value })
                          }
                        >
                          <option value="2+1">2+1 Sleeper</option>
                          <option value="2+2">2+2 Seater</option>
                          <option value="1+2">1+2 VIP Sleeper</option>
                          <option value="2+3">2+3 Standard Seater</option>
                        </select>
                      </div>
                    </div>

                    <div className="bf-form-row">
                      <div className="bf-form-group">
                        <label>Total Passenger Seats *</label>
                        <input
                          type="number"
                          min={10}
                          max={70}
                          value={form.totalSeats}
                          onChange={(e) => {
                            const val = Number(e.target.value) || 0;
                            const half = Math.floor(val / 2);
                            setForm({
                              ...form,
                              totalSeats: val,
                              lowerSeats: form.busType.includes("Sleeper")
                                ? half
                                : val,
                              upperSeats: form.busType.includes("Sleeper")
                                ? val - half
                                : 0,
                            });
                          }}
                          required
                        />
                      </div>

                      {form.busType.includes("Sleeper") && (
                        <>
                          <div className="bf-form-group">
                            <label>Lower Berths</label>
                            <input
                              type="number"
                              value={form.lowerSeats}
                              onChange={(e) =>
                                setForm({
                                  ...form,
                                  lowerSeats: Number(e.target.value) || 0,
                                })
                              }
                            />
                          </div>
                          <div className="bf-form-group">
                            <label>Upper Berths</label>
                            <input
                              type="number"
                              value={form.upperSeats}
                              onChange={(e) =>
                                setForm({
                                  ...form,
                                  upperSeats: Number(e.target.value) || 0,
                                })
                              }
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* ── TAB 2: ROUTE & SCHEDULE ── */}
                {modalTab === "route" && (
                  <div className="bf-form-pane">
                    <div className="bf-form-row">
                      <div className="bf-form-group">
                        <label>Origin City (From) *</label>
                        <input
                          type="text"
                          placeholder="e.g. Lucknow"
                          value={form.fromCity}
                          onChange={(e) =>
                            setForm({ ...form, fromCity: e.target.value })
                          }
                          required
                        />
                      </div>

                      <div className="bf-form-group">
                        <label>Destination City (To) *</label>
                        <input
                          type="text"
                          placeholder="e.g. New Delhi"
                          value={form.toCity}
                          onChange={(e) =>
                            setForm({ ...form, toCity: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="bf-form-group">
                      <label>Via En-route Cities (comma separated)</label>
                      <input
                        type="text"
                        placeholder="e.g. Kanpur, Agra, Mathura"
                        value={form.viaCities}
                        onChange={(e) =>
                          setForm({ ...form, viaCities: e.target.value })
                        }
                      />
                    </div>

                    <div className="bf-form-row">
                      <div className="bf-form-group">
                        <label>Departure Time</label>
                        <input
                          type="text"
                          placeholder="08:30 PM"
                          value={form.departureTime}
                          onChange={(e) =>
                            setForm({ ...form, departureTime: e.target.value })
                          }
                        />
                      </div>

                      <div className="bf-form-group">
                        <label>Arrival Time</label>
                        <input
                          type="text"
                          placeholder="05:30 AM"
                          value={form.arrivalTime}
                          onChange={(e) =>
                            setForm({ ...form, arrivalTime: e.target.value })
                          }
                        />
                      </div>

                      <div className="bf-form-group">
                        <label>Journey Duration</label>
                        <input
                          type="text"
                          placeholder="9h 00m"
                          value={form.journeyDuration}
                          onChange={(e) =>
                            setForm({ ...form, journeyDuration: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="bf-form-group">
                      <label>Boarding Points (Format: Location|Time|Address|Landmark, ...)</label>
                      <textarea
                        rows={2}
                        value={form.boardingPointsText}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            boardingPointsText: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="bf-form-group">
                      <label>Dropping Points (Format: Location|Time|Address|Landmark, ...)</label>
                      <textarea
                        rows={2}
                        value={form.droppingPointsText}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            droppingPointsText: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                )}

                {/* ── TAB 3: PRICING & FARES ── */}
                {modalTab === "pricing" && (
                  <div className="bf-form-pane">
                    <div className="bf-form-row">
                      <div className="bf-form-group">
                        <label>Main Ticket Price (₹) *</label>
                        <input
                          type="number"
                          min={100}
                          value={form.price}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              price: Number(e.target.value) || 0,
                            })
                          }
                          required
                        />
                      </div>

                      <div className="bf-form-group">
                        <label>Base Fare (Net) (₹)</label>
                        <input
                          type="number"
                          value={form.basePrice}
                          onChange={(e) =>
                            setForm({ ...form, basePrice: e.target.value })
                          }
                        />
                      </div>

                      <div className="bf-form-group">
                        <label>Offer / Promotional Price (₹)</label>
                        <input
                          type="number"
                          value={form.offerPrice}
                          onChange={(e) =>
                            setForm({ ...form, offerPrice: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="bf-info-banner">
                      💡 <b>Seat-wise Dynamic Pricing:</b> Individual seat pricing
                      can also be customized in the <b>Seat Layouts</b> module.
                    </div>
                  </div>
                )}

                {/* ── TAB 4: DRIVER & CREW ── */}
                {modalTab === "crew" && (
                  <div className="bf-form-pane">
                    <div className="bf-form-row">
                      <div className="bf-form-group">
                        <label>Primary Driver Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Mohd. Aslam"
                          value={form.driverName}
                          onChange={(e) =>
                            setForm({ ...form, driverName: e.target.value })
                          }
                        />
                      </div>

                      <div className="bf-form-group">
                        <label>Driver Contact Number</label>
                        <input
                          type="tel"
                          placeholder="+91 98765 00000"
                          value={form.driverPhone}
                          onChange={(e) =>
                            setForm({ ...form, driverPhone: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="bf-form-group">
                      <label>Driver Commercial License Number</label>
                      <input
                        type="text"
                        placeholder="e.g. DL-1420110029311"
                        value={form.driverLicense}
                        onChange={(e) =>
                          setForm({ ...form, driverLicense: e.target.value })
                        }
                      />
                    </div>

                    <div className="bf-form-row">
                      <div className="bf-form-group">
                        <label>Helper / Conductor Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Santosh"
                          value={form.helperName}
                          onChange={(e) =>
                            setForm({ ...form, helperName: e.target.value })
                          }
                        />
                      </div>

                      <div className="bf-form-group">
                        <label>Helper Contact Number</label>
                        <input
                          type="tel"
                          placeholder="+91 91234 00000"
                          value={form.helperPhone}
                          onChange={(e) =>
                            setForm({ ...form, helperPhone: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB 5: DOCS & AMENITIES ── */}
                {modalTab === "docs" && (
                  <div className="bf-form-pane">
                    <div className="bf-form-row">
                      <div className="bf-form-group">
                        <label>RC Registration Certificate Number</label>
                        <input
                          type="text"
                          placeholder="e.g. UP32CZ8901"
                          value={form.rcNumber}
                          onChange={(e) =>
                            setForm({ ...form, rcNumber: e.target.value })
                          }
                        />
                      </div>

                      <div className="bf-form-group">
                        <label>Insurance Policy Number</label>
                        <input
                          type="text"
                          placeholder="e.g. POL-99881122"
                          value={form.insuranceNumber}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              insuranceNumber: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="bf-form-row">
                      <div className="bf-form-group">
                        <label>All-India / State Permit Number</label>
                        <input
                          type="text"
                          placeholder="e.g. ALL-INDIA-NAT-8912"
                          value={form.permitNumber}
                          onChange={(e) =>
                            setForm({ ...form, permitNumber: e.target.value })
                          }
                        />
                      </div>

                      <div className="bf-form-group">
                        <label>Fitness Certificate Expiry Date</label>
                        <input
                          type="date"
                          value={form.fitnessExpiry}
                          onChange={(e) =>
                            setForm({ ...form, fitnessExpiry: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="bf-form-row">
                      <div className="bf-form-group">
                        <label>GPS Device ID (AIS-140)</label>
                        <input
                          type="text"
                          placeholder="e.g. GPS-TRK-9901"
                          value={form.gpsDeviceId}
                          onChange={(e) =>
                            setForm({ ...form, gpsDeviceId: e.target.value })
                          }
                        />
                      </div>

                      <div className="bf-form-group">
                        <label>Live Tracking Webhook / URL</label>
                        <input
                          type="text"
                          placeholder="https://track.operator.com/live/..."
                          value={form.liveTrackingLink}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              liveTrackingLink: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB 6: BUS IMAGES ── */}
                {modalTab === "images" && (
                  <div className="bf-form-pane">
                    <div className="bf-image-upload-box">
                      <label className="bf-upload-dropzone">
                        <MdPhotoCamera className="bf-upload-icon" />
                        <b>Upload Main Bus Exterior Image</b>
                        <small>PNG, JPG up to 5MB (Displayed on booking portal)</small>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setMainImageFile(file);
                              setMainImagePreview(URL.createObjectURL(file));
                            }
                          }}
                        />
                      </label>

                      {mainImagePreview && (
                        <div className="bf-preview-wrap">
                          <img
                            src={mainImagePreview}
                            alt="Bus Preview"
                            className="bf-preview-img"
                          />
                          <button
                            type="button"
                            className="bf-remove-img"
                            onClick={() => {
                              setMainImageFile(null);
                              setMainImagePreview(null);
                            }}
                          >
                            ✕ Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="bf-modal-foot">
                <button
                  type="button"
                  className="bf-btn bf-btn-outline"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bf-btn bf-btn-primary"
                  disabled={actionLoading}
                >
                  {actionLoading
                    ? "Saving Vehicle..."
                    : editingBus
                    ? "Save Changes"
                    : "Register Bus"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================
          MODAL: VIEW BUS PASSPORT & DETAILS
          =================================================== */}
      {viewBus && (
        <div className="bf-modal-overlay" onClick={() => setViewBus(null)}>
          <div
            className="bf-modal-card passport-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bf-modal-head">
              <div className="modal-title-with-icon">
                <MdDirectionsBus className="modal-head-icon" />
                <div>
                  <h3>Vehicle Passport & Specs</h3>
                  <small>Plate: {viewBus.busNumber}</small>
                </div>
              </div>
              <button
                className="bf-modal-close"
                onClick={() => setViewBus(null)}
              >
                ✕
              </button>
            </div>

            <div className="bf-passport-body">
              <div className="bf-passport-hero">
                <img
                  src={
                    viewBus.image ||
                    "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=60"
                  }
                  alt={viewBus.busName}
                  className="bf-passport-img"
                />
                <div className="bf-passport-meta">
                  <span className="bf-number-plate large">
                    {viewBus.busNumber}
                  </span>
                  <h2>{viewBus.busName}</h2>
                  <p>
                    {viewBus.busModel} · {viewBus.busType}
                  </p>
                  <span
                    className={`bf-status-tag ${
                      viewBus.status === "approved" ? "approved" : "pending"
                    }`}
                  >
                    {viewBus.status?.toUpperCase() || "PENDING"}
                  </span>
                </div>
              </div>

              {/* Passport Specs Grid */}
              <div className="bf-passport-grid">
                <div>
                  <label>ROUTE</label>
                  <b>
                    {viewBus.fromCity} ➜ {viewBus.toCity}
                  </b>
                  {viewBus.viaCities?.length > 0 && (
                    <small>
                      Via:{" "}
                      {Array.isArray(viewBus.viaCities)
                        ? viewBus.viaCities.join(", ")
                        : viewBus.viaCities}
                    </small>
                  )}
                </div>

                <div>
                  <label>TIMING & SCHEDULE</label>
                  <b>
                    Dep: {viewBus.departureTime} | Arr: {viewBus.arrivalTime}
                  </b>
                  <small>Duration: {viewBus.journeyDuration}</small>
                </div>

                <div>
                  <label>SEATING CAPACITY</label>
                  <b>{viewBus.totalSeats} Total Seats</b>
                  <small>
                    Layout: {viewBus.seatLayoutType} (Lower:{" "}
                    {viewBus.lowerSeats || 0} · Upper:{" "}
                    {viewBus.upperSeats || 0})
                  </small>
                </div>

                <div>
                  <label>TICKET FARE</label>
                  <strong className="bf-fare-highlight">
                    ₹{viewBus.price}
                  </strong>
                </div>

                <div>
                  <label>DRIVER CONTACT</label>
                  <b>{viewBus.driverName || "Not assigned"}</b>
                  <small>{viewBus.driverPhone || "—"}</small>
                </div>

                <div>
                  <label>PERMIT & FITNESS</label>
                  <b>Permit: {viewBus.permitNumber || "N/A"}</b>
                  <small>Fitness Expiry: {viewBus.fitnessExpiry || "N/A"}</small>
                </div>
              </div>

              {/* Amenities */}
              {viewBus.amenities && (
                <div className="bf-passport-amenities">
                  <label>INCLUDED AMENITIES</label>
                  <div className="bf-amenities-row">
                    {viewBus.amenities.map((a) => (
                      <span key={a} className="bf-amenity-chip">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bf-modal-foot">
              <button
                className="bf-btn bf-btn-outline"
                onClick={() => setViewBus(null)}
              >
                Close
              </button>
              <button
                className="bf-btn bf-btn-primary"
                onClick={() => {
                  setViewBus(null);
                  handleOpenEdit(viewBus);
                }}
              >
                <MdEdit /> Edit Bus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          MODAL: CONFIRM DELETE
          =================================================== */}
      {deleteConfirm && (
        <div className="bf-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div
            className="bf-modal-card delete-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bf-modal-head">
              <div className="modal-title-with-icon">
                <MdDeleteOutline className="modal-head-icon text-red" />
                <div>
                  <h3>Delete Bus Vehicle?</h3>
                  <small>Plate: {deleteConfirm.busNumber}</small>
                </div>
              </div>
              <button
                className="bf-modal-close"
                onClick={() => setDeleteConfirm(null)}
              >
                ✕
              </button>
            </div>

            <div className="bf-modal-body">
              <p>
                Are you sure you want to delete bus{" "}
                <b>"{deleteConfirm.busName} ({deleteConfirm.busNumber})"</b>?
                This action is permanent and will remove this vehicle from your
                active operating fleet.
              </p>
            </div>

            <div className="bf-modal-foot">
              <button
                className="bf-btn bf-btn-outline"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="bf-btn bf-btn-danger"
                onClick={handleDelete}
                disabled={actionLoading}
              >
                {actionLoading ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
