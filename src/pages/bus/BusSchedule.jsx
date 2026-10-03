import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import {
  MdSchedule,
  MdAdd,
  MdSearch,
  MdRefresh,
  MdEdit,
  MdDeleteOutline,
  MdCancel,
  MdCheckCircle,
  MdDirectionsBus,
  MdArrowForward,
  MdCalendarToday,
  MdEventSeat,
  MdViewModule,
  MdViewList,
  MdFlashOn,
  MdInfoOutline,
} from "react-icons/md";
import "./BusSchedule.css";

const API_BASE = "https://bmtvendorfinal.onrender.com/api";

function getAuthHeader() {
  const token =
    localStorage.getItem("vendorToken") || localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/* ===================================================
   DEMO FALLBACK TRIPS (shown if DB has no trips yet)
   =================================================== */
const DEMO_TRIPS = [
  {
    _id: "demo-trip-101",
    tripCode: "TRIP-EXP-8901",
    tripName: "Lucknow - Delhi Express Royal",
    bus: {
      _id: "demo-bus-001",
      busName: "BMT Royal Sleeper",
      busNumber: "UP 32 CZ 8901",
      busType: "AC Sleeper",
    },
    fromCity: "Lucknow",
    toCity: "New Delhi",
    viaCities: ["Kanpur", "Agra"],
    travelDate: new Date(Date.now() + 86400000).toISOString(),
    departureTime: "08:30 PM",
    arrivalTime: "05:30 AM",
    reportingTime: "08:00 PM",
    journeyDuration: "9h 00m",
    totalSeats: 36,
    availableSeats: 22,
    bookedSeats: ["L1", "L2", "L5", "L6", "U1", "U2", "U7", "U8"],
    blockedSeats: ["L3", "L4", "U3", "U4", "U9", "U10"],
    basePrice: 950,
    tax: 48,
    discount: 50,
    finalPrice: 948,
    status: "SCHEDULED",
    isActive: true,
    boardingPoints: [
      { location: "Alambagh Bus Terminal", time: "08:30 PM", address: "Near Metro Gate 2", landmark: "Metro Station" },
      { location: "Polytechnic Chauraha", time: "09:00 PM", address: "Flyover Pillar 42", landmark: "HP Petrol Pump" },
    ],
    droppingPoints: [
      { location: "Kashmere Gate ISBT", time: "05:00 AM", address: "Platform 14", landmark: "ISBT Ingate" },
      { location: "Anand Vihar ISBT", time: "05:30 AM", address: "EDMC Building", landmark: "Metro Gate 1" },
    ],
    notes: "Complimentary water bottle and fresh bedsheet provided.",
  },
  {
    _id: "demo-trip-102",
    tripCode: "TRIP-EXP-4492",
    tripName: "Mumbai - Pune Super Express",
    bus: {
      _id: "demo-bus-002",
      busName: "BMT Garud Multi-Axle",
      busNumber: "MH 04 AZ 4492",
      busType: "AC Seater",
    },
    fromCity: "Mumbai",
    toCity: "Pune",
    viaCities: ["Navi Mumbai", "Lonavala"],
    travelDate: new Date().toISOString(),
    departureTime: "02:00 PM",
    arrivalTime: "05:45 PM",
    reportingTime: "01:30 PM",
    journeyDuration: "3h 45m",
    totalSeats: 45,
    availableSeats: 8,
    bookedSeats: Array.from({ length: 35 }, (_, i) => `S${i + 1}`),
    blockedSeats: ["S44", "S45"],
    basePrice: 420,
    tax: 21,
    discount: 0,
    finalPrice: 441,
    status: "BOARDING",
    isActive: true,
    boardingPoints: [
      { location: "Borivali West", time: "02:00 PM", address: "Near Gokul Hotel", landmark: "SV Road" },
      { location: "Dadar TT Circle", time: "02:45 PM", address: "Asiad Bus Stand", landmark: "Swami Narayan Temple" },
    ],
    droppingPoints: [
      { location: "Wakad Bridge", time: "05:15 PM", address: "Highway Chowk", landmark: "Ginger Hotel" },
      { location: "Swargate", time: "05:45 PM", address: "Stand No 3", landmark: "Swargate Chowk" },
    ],
    notes: "Express highway nonstop corridor transit.",
  },
  {
    _id: "demo-trip-103",
    tripCode: "TRIP-EXP-1102",
    tripName: "Bangalore - Hyderabad Platinum",
    bus: {
      _id: "demo-bus-003",
      busName: "BMT Airavat Diamond",
      busNumber: "KA 01 F 1102",
      busType: "AC Sleeper",
    },
    fromCity: "Bangalore",
    toCity: "Hyderabad",
    viaCities: ["Anantapur", "Kurnool"],
    travelDate: new Date(Date.now() - 86400000).toISOString(),
    departureTime: "09:30 PM",
    arrivalTime: "06:30 AM",
    reportingTime: "09:00 PM",
    journeyDuration: "9h 00m",
    totalSeats: 32,
    availableSeats: 0,
    bookedSeats: Array.from({ length: 32 }, (_, i) => `B${i + 1}`),
    blockedSeats: [],
    basePrice: 1100,
    tax: 55,
    discount: 50,
    finalPrice: 1105,
    status: "COMPLETED",
    isActive: true,
    boardingPoints: [
      { location: "Majestic Bus Stand", time: "09:30 PM", address: "Platform 9B", landmark: "City Railway Station" },
      { location: "Hebbal Flyover", time: "10:15 PM", address: "Esteem Mall Side", landmark: "Hebbal Lake" },
    ],
    droppingPoints: [
      { location: "Shamshabad Airport", time: "05:45 AM", address: "Toll Plaza Drop", landmark: "RGIA Approach" },
      { location: "Ameerpet", time: "06:30 AM", address: "Metro Station Gate 3", landmark: "Saradhi Studios" },
    ],
    notes: "Night express with onboard sleeper entertainment.",
  },
];

export default function BusSchedule({ onNavigate }) {
  /* ── State ── */
  const [trips, setTrips] = useState([]);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  /* ── Filters ── */
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [busFilter, setBusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'table'

  /* ── Modals ── */
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [activeTrip, setActiveTrip] = useState(null);
  const [cancelReason, setCancelReason] = useState("");

  /* ── Trip Form State ── */
  const initialForm = {
    busId: "",
    tripName: "",
    fromCity: "",
    toCity: "",
    viaCities: "",
    travelDate: "",
    departureTime: "08:00 PM",
    arrivalDate: "",
    arrivalTime: "06:00 AM",
    reportingTime: "07:30 PM",
    journeyDuration: "10h 00m",
    basePrice: "",
    tax: "0",
    discount: "0",
    boardingPoints: [{ location: "", time: "", address: "", landmark: "" }],
    droppingPoints: [{ location: "", time: "", address: "", landmark: "" }],
    notes: "",
    status: "SCHEDULED",
  };
  const [form, setForm] = useState(initialForm);
  const [hasLayoutWarning, setHasLayoutWarning] = useState(false);
  const [autoLayoutCreating, setAutoLayoutCreating] = useState(false);

  /* ── Flash message helper ── */
  const notify = (msg, isErr = false) => {
    if (isErr) {
      setError(msg);
      setTimeout(() => setError(""), 5000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(""), 4000);
    }
  };

  /* ── Fetch Buses (for dropdowns) ── */
  const fetchBuses = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/buses/vendor`, {
        headers: getAuthHeader(),
      });
      if (res.data?.success && res.data.buses?.length > 0) {
        setBuses(res.data.buses);
      }
    } catch {
      // Fallback
      setBuses([]);
    }
  }, []);

  /* ── Fetch Trips from backend ── */
  const fetchTrips = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      let queryParams = [];
      if (busFilter !== "ALL") queryParams.push(`busId=${busFilter}`);
      if (statusFilter !== "ALL") queryParams.push(`status=${statusFilter}`);
      if (dateFilter) queryParams.push(`travelDate=${dateFilter}`);

      const queryString = queryParams.length ? `?${queryParams.join("&")}` : "";
      const res = await axios.get(`${API_BASE}/bus-trips/vendor${queryString}`, {
        headers: getAuthHeader(),
      });

      if (res.data?.success) {
        const fetched = res.data.trips || [];
        setTrips(fetched.length > 0 ? fetched : DEMO_TRIPS);
      } else {
        setTrips(DEMO_TRIPS);
      }
    } catch {
      // Offline fallback
      setTrips(DEMO_TRIPS);
    } finally {
      setLoading(false);
    }
  }, [busFilter, statusFilter, dateFilter]);

  useEffect(() => {
    fetchBuses();
    fetchTrips();
  }, [fetchBuses, fetchTrips]);

  /* ── When user selects a bus in Create Trip form ── */
  const handleBusSelection = async (selectedBusId) => {
    const selectedBus = buses.find((b) => b._id === selectedBusId);
    if (!selectedBus) {
      setForm((prev) => ({ ...prev, busId: selectedBusId }));
      return;
    }

    // Auto populate details from bus profile
    setForm((prev) => ({
      ...prev,
      busId: selectedBusId,
      tripName: `${selectedBus.fromCity || "Origin"} to ${
        selectedBus.toCity || "Destination"
      } (${selectedBus.busName || "Express"})`,
      fromCity: selectedBus.fromCity || "",
      toCity: selectedBus.toCity || "",
      viaCities: Array.isArray(selectedBus.viaCities)
        ? selectedBus.viaCities.join(", ")
        : selectedBus.viaCities || "",
      departureTime: selectedBus.departureTime || "08:00 PM",
      arrivalTime: selectedBus.arrivalTime || "06:00 AM",
      journeyDuration: selectedBus.journeyDuration || "10h 00m",
      basePrice: selectedBus.price || selectedBus.basePrice || "800",
      boardingPoints:
        selectedBus.boardingPoints?.length > 0
          ? selectedBus.boardingPoints
          : [{ location: "", time: "", address: "", landmark: "" }],
      droppingPoints:
        selectedBus.droppingPoints?.length > 0
          ? selectedBus.droppingPoints
          : [{ location: "", time: "", address: "", landmark: "" }],
    }));

    // Verify if Seat Layout exists for this bus
    try {
      const layoutRes = await axios.get(
        `${API_BASE}/bus-seat-layouts/bus/${selectedBusId}`,
        { headers: getAuthHeader() }
      );
      if (layoutRes.data?.success && layoutRes.data.layout) {
        setHasLayoutWarning(false);
      } else {
        setHasLayoutWarning(true);
      }
    } catch {
      setHasLayoutWarning(true);
    }
  };

  /* ── Auto generate layout if bus doesn't have one ── */
  const handleAutoCreateLayout = async () => {
    if (!form.busId) return;
    const selectedBus = buses.find((b) => b._id === form.busId);
    if (!selectedBus) return;

    setAutoLayoutCreating(true);
    try {
      const total = Number(selectedBus.totalSeats) || 36;
      const lowerCount = Number(selectedBus.lowerSeats) || Math.ceil(total / 2);
      const upperCount = Number(selectedBus.upperSeats) || (total - lowerCount);

      // Generate standard seat maps
      const lowerDeckSeats = Array.from({ length: lowerCount }, (_, idx) => ({
        seatNumber: `L${idx + 1}`,
        deck: "LOWER",
        seatType: selectedBus.busType?.includes("Sleeper") ? "SLEEPER" : "SEATER",
        row: Math.floor(idx / 3) + 1,
        column: (idx % 3) + 1,
        status: "AVAILABLE",
        isBlocked: false,
      }));

      const upperDeckSeats = Array.from({ length: upperCount }, (_, idx) => ({
        seatNumber: `U${idx + 1}`,
        deck: "UPPER",
        seatType: "SLEEPER",
        row: Math.floor(idx / 3) + 1,
        column: (idx % 3) + 1,
        status: "AVAILABLE",
        isBlocked: false,
      }));

      const payload = {
        busId: form.busId,
        layoutType: selectedBus.seatLayoutType || "2+1",
        totalRows: Math.ceil(lowerCount / 3),
        totalColumns: 3,
        hasUpperDeck: upperCount > 0,
        lowerDeckSeats,
        upperDeckSeats,
      };

      const res = await axios.post(`${API_BASE}/bus-seat-layouts`, payload, {
        headers: getAuthHeader(),
      });

      if (res.data?.success) {
        setHasLayoutWarning(false);
        notify("Standard Seat Blueprint generated automatically for this coach!");
      }
    } catch (err) {
      notify(
        err.response?.data?.message || "Failed to auto-generate seat blueprint",
        true
      );
    } finally {
      setAutoLayoutCreating(false);
    }
  };

  /* ── Submit Create Trip ── */
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!form.busId) {
      notify("Please select an operating bus for this schedule", true);
      return;
    }
    if (!form.travelDate) {
      notify("Please choose journey date", true);
      return;
    }

    setActionLoading(true);
    try {
      const payload = {
        busId: form.busId,
        tripName: form.tripName,
        fromCity: form.fromCity,
        toCity: form.toCity,
        viaCities: form.viaCities,
        travelDate: form.travelDate,
        departureTime: form.departureTime,
        arrivalDate: form.arrivalDate || form.travelDate,
        arrivalTime: form.arrivalTime,
        reportingTime: form.reportingTime,
        journeyDuration: form.journeyDuration,
        basePrice: form.basePrice,
        tax: form.tax,
        discount: form.discount,
        boardingPoints: form.boardingPoints.filter((p) => p.location.trim()),
        droppingPoints: form.droppingPoints.filter((p) => p.location.trim()),
        notes: form.notes,
      };

      const res = await axios.post(`${API_BASE}/bus-trips`, payload, {
        headers: getAuthHeader(),
      });

      if (res.data?.success) {
        notify("New Bus Trip scheduled successfully!");
        setShowCreateModal(false);
        setForm(initialForm);
        fetchTrips();
      }
    } catch (err) {
      const errMsg =
        err.response?.data?.message || "Failed to schedule bus trip";
      if (errMsg.includes("seat layout")) {
        setHasLayoutWarning(true);
      }
      notify(errMsg, true);
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Open Edit Modal ── */
  const openEditModal = (trip) => {
    setActiveTrip(trip);
    setForm({
      busId: trip.bus?._id || trip.bus || "",
      tripName: trip.tripName || "",
      fromCity: trip.fromCity || "",
      toCity: trip.toCity || "",
      viaCities: Array.isArray(trip.viaCities)
        ? trip.viaCities.join(", ")
        : trip.viaCities || "",
      travelDate: trip.travelDate ? trip.travelDate.slice(0, 10) : "",
      departureTime: trip.departureTime || "",
      arrivalDate: trip.arrivalDate ? trip.arrivalDate.slice(0, 10) : "",
      arrivalTime: trip.arrivalTime || "",
      reportingTime: trip.reportingTime || "",
      journeyDuration: trip.journeyDuration || "",
      basePrice: trip.basePrice || "",
      tax: trip.tax || "0",
      discount: trip.discount || "0",
      boardingPoints:
        trip.boardingPoints?.length > 0
          ? trip.boardingPoints
          : [{ location: "", time: "", address: "", landmark: "" }],
      droppingPoints:
        trip.droppingPoints?.length > 0
          ? trip.droppingPoints
          : [{ location: "", time: "", address: "", landmark: "" }],
      notes: trip.notes || "",
      status: trip.status || "SCHEDULED",
    });
    setShowEditModal(true);
  };

  /* ── Submit Edit Trip ── */
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!activeTrip) return;

    setActionLoading(true);
    try {
      const payload = {
        tripName: form.tripName,
        fromCity: form.fromCity,
        toCity: form.toCity,
        viaCities: form.viaCities,
        travelDate: form.travelDate,
        departureTime: form.departureTime,
        arrivalDate: form.arrivalDate || form.travelDate,
        arrivalTime: form.arrivalTime,
        reportingTime: form.reportingTime,
        journeyDuration: form.journeyDuration,
        basePrice: form.basePrice,
        tax: form.tax,
        discount: form.discount,
        boardingPoints: form.boardingPoints.filter((p) => p.location.trim()),
        droppingPoints: form.droppingPoints.filter((p) => p.location.trim()),
        status: form.status,
        notes: form.notes,
      };

      const res = await axios.put(
        `${API_BASE}/bus-trips/${activeTrip._id}`,
        payload,
        { headers: getAuthHeader() }
      );

      if (res.data?.success) {
        notify("Bus Trip schedule updated successfully!");
        setShowEditModal(false);
        fetchTrips();
      }
    } catch (err) {
      notify(
        err.response?.data?.message || "Failed to update bus trip schedule",
        true
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Quick Status Update (Direct state transitions) ── */
  const handleQuickStatus = async (tripId, newStatus) => {
    setActionLoading(true);
    try {
      const res = await axios.put(
        `${API_BASE}/bus-trips/${tripId}`,
        { status: newStatus },
        { headers: getAuthHeader() }
      );
      if (res.data?.success) {
        notify(`Trip marked as ${newStatus}!`);
        fetchTrips();
      }
    } catch (err) {
      notify(err.response?.data?.message || "Failed to update status", true);
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Cancel Trip ── */
  const handleCancelSubmit = async () => {
    if (!activeTrip) return;
    setActionLoading(true);
    try {
      const res = await axios.patch(
        `${API_BASE}/bus-trips/${activeTrip._id}/cancel`,
        { cancellationReason: cancelReason || "Cancelled by Operator" },
        { headers: getAuthHeader() }
      );
      if (res.data?.success) {
        notify("Trip cancelled successfully");
        setShowCancelModal(false);
        setCancelReason("");
        fetchTrips();
      }
    } catch (err) {
      notify(
        err.response?.data?.message || "Cannot cancel trip. Check bookings.",
        true
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Delete Trip ── */
  const handleDeleteSubmit = async () => {
    if (!activeTrip) return;
    setActionLoading(true);
    try {
      const res = await axios.delete(
        `${API_BASE}/bus-trips/${activeTrip._id}`,
        { headers: getAuthHeader() }
      );
      if (res.data?.success) {
        notify("Trip schedule removed from registry");
        setShowDeleteModal(false);
        fetchTrips();
      }
    } catch (err) {
      notify(
        err.response?.data?.message || "Cannot delete trip with booked seats.",
        true
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Filtered Trips ── */
  const filteredTrips = useMemo(() => {
    return trips.filter((t) => {
      // Status filter
      if (statusFilter !== "ALL" && t.status !== statusFilter) return false;

      // Bus filter
      if (busFilter !== "ALL") {
        const bId = t.bus?._id || t.bus;
        if (bId !== busFilter) return false;
      }

      // Date filter
      if (dateFilter) {
        const tDate = t.travelDate ? t.travelDate.slice(0, 10) : "";
        if (tDate !== dateFilter) return false;
      }

      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesCode = t.tripCode?.toLowerCase().includes(q);
        const matchesName = t.tripName?.toLowerCase().includes(q);
        const matchesRoute =
          t.fromCity?.toLowerCase().includes(q) ||
          t.toCity?.toLowerCase().includes(q);
        const matchesBus =
          t.bus?.busName?.toLowerCase().includes(q) ||
          t.bus?.busNumber?.toLowerCase().includes(q);
        if (!matchesCode && !matchesName && !matchesRoute && !matchesBus) {
          return false;
        }
      }

      return true;
    });
  }, [trips, statusFilter, busFilter, dateFilter, search]);

  /* ── Summary Stats ── */
  const stats = useMemo(() => {
    const total = trips.length;
    const scheduled = trips.filter((t) => t.status === "SCHEDULED").length;
    const activeRunning = trips.filter((t) =>
      ["BOARDING", "STARTED"].includes(t.status)
    ).length;
    const completed = trips.filter((t) => t.status === "COMPLETED").length;
    const cancelled = trips.filter((t) => t.status === "CANCELLED").length;

    let totalSeats = 0;
    let bookedSeats = 0;
    trips.forEach((t) => {
      totalSeats += t.totalSeats || 0;
      bookedSeats += t.bookedSeats?.length || 0;
    });
    const occupancy =
      totalSeats > 0 ? Math.round((bookedSeats / totalSeats) * 100) : 0;

    return { total, scheduled, activeRunning, completed, cancelled, occupancy };
  }, [trips]);

  /* ── Boarding/Dropping points repeater helper ── */
  const addPoint = (type) => {
    setForm((prev) => ({
      ...prev,
      [type]: [
        ...prev[type],
        { location: "", time: "", address: "", landmark: "" },
      ],
    }));
  };

  const removePoint = (type, index) => {
    setForm((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  const updatePoint = (type, index, field, value) => {
    setForm((prev) => {
      const updated = [...prev[type]];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, [type]: updated };
    });
  };

  /* ── Status pill class ── */
  const getStatusBadge = (status) => {
    switch (status) {
      case "BOARDING":
        return { label: "Boarding Now", cls: "pill-boarding" };
      case "STARTED":
        return { label: "On Route / Started", cls: "pill-started" };
      case "COMPLETED":
        return { label: "Completed", cls: "pill-completed" };
      case "CANCELLED":
        return { label: "Cancelled", cls: "pill-cancelled" };
      default:
        return { label: "Scheduled", cls: "pill-scheduled" };
    }
  };

  return (
    <div className="bsch-container">
      {/* ===== NOTIFICATION BANNERS ===== */}
      {successMsg && (
        <div className="bsch-alert bsch-alert-success">
          <MdCheckCircle /> <span>{successMsg}</span>
        </div>
      )}
      {error && (
        <div className="bsch-alert bsch-alert-danger">
          <MdCancel /> <span>{error}</span>
        </div>
      )}

      {/* ===== HEADER ===== */}
      <div className="bsch-header">
        <div className="bsch-header-left">
          <div className="bsch-title-row">
            <span className="bsch-header-icon">
              <MdSchedule />
            </span>
            <div>
              <h1 className="bsch-title">Bus Schedule & Trips</h1>
              <p className="bsch-subtitle">
                RedBus BO GDS Trip Scheduling, Real-Time Dispatches & Route Timetables
              </p>
            </div>
          </div>
        </div>

        <div className="bsch-header-actions">
          <button
            className="bsch-btn bsch-btn-secondary"
            onClick={() => {
              fetchBuses();
              fetchTrips();
            }}
            title="Refresh Schedules"
          >
            <MdRefresh /> Refresh
          </button>
          <button
            className="bsch-btn bsch-btn-primary"
            onClick={() => {
              setForm(initialForm);
              setHasLayoutWarning(false);
              setShowCreateModal(true);
            }}
          >
            <MdAdd /> Schedule New Trip
          </button>
        </div>
      </div>

      {/* ===== 5 KPI METRIC CARDS ===== */}
      <div className="bsch-metrics-grid">
        <div className="bsch-metric-card">
          <div className="bsch-metric-label">TOTAL SCHEDULED</div>
          <div className="bsch-metric-val">{stats.total}</div>
          <div className="bsch-metric-sub">All registered service runs</div>
        </div>
        <div className="bsch-metric-card bsch-metric-card-accent">
          <div className="bsch-metric-label">LIVE ON ROUTE</div>
          <div className="bsch-metric-val">{stats.activeRunning}</div>
          <div className="bsch-metric-sub">Boarding or in-transit right now</div>
        </div>
        <div className="bsch-metric-card">
          <div className="bsch-metric-label">UPCOMING RUNS</div>
          <div className="bsch-metric-val">{stats.scheduled}</div>
          <div className="bsch-metric-sub">Ready for passenger bookings</div>
        </div>
        <div className="bsch-metric-card">
          <div className="bsch-metric-label">AVG OCCUPANCY</div>
          <div className="bsch-metric-val">{stats.occupancy}%</div>
          <div className="bsch-metric-sub">Confirmed booked seat ratio</div>
        </div>
        <div className="bsch-metric-card">
          <div className="bsch-metric-label">COMPLETED TRIPS</div>
          <div className="bsch-metric-val">{stats.completed}</div>
          <div className="bsch-metric-sub">Arrived safely at destination</div>
        </div>
      </div>

      {/* ===== TOOLBAR ===== */}
      <div className="bsch-toolbar">
        {/* Status Filters */}
        <div className="bsch-filter-tabs">
          {[
            { id: "ALL", label: "All Runs" },
            { id: "SCHEDULED", label: "Scheduled" },
            { id: "BOARDING", label: "Boarding" },
            { id: "STARTED", label: "On Route" },
            { id: "COMPLETED", label: "Completed" },
            { id: "CANCELLED", label: "Cancelled" },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`bsch-tab-btn ${
                statusFilter === tab.id ? "active" : ""
              }`}
              onClick={() => setStatusFilter(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Controls Row */}
        <div className="bsch-controls-row">
          {/* Search */}
          <div className="bsch-search-box">
            <MdSearch className="bsch-search-icon" />
            <input
              type="text"
              placeholder="Search by trip code, city, bus plate…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Bus Filter */}
          <div className="bsch-filter-select-wrap">
            <select
              value={busFilter}
              onChange={(e) => setBusFilter(e.target.value)}
              className="bsch-select"
            >
              <option value="ALL">All Operating Buses</option>
              {buses.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.busNumber} — {b.busName}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div className="bsch-date-input-wrap">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bsch-date-picker"
            />
            {dateFilter && (
              <button
                className="bsch-clear-date"
                onClick={() => setDateFilter("")}
                title="Clear date"
              >
                ✕
              </button>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="bsch-view-toggle">
            <button
              className={`bsch-toggle-btn ${
                viewMode === "grid" ? "active" : ""
              }`}
              onClick={() => setViewMode("grid")}
              title="Card Grid View"
            >
              <MdViewModule />
            </button>
            <button
              className={`bsch-toggle-btn ${
                viewMode === "table" ? "active" : ""
              }`}
              onClick={() => setViewMode("table")}
              title="Data Table View"
            >
              <MdViewList />
            </button>
          </div>
        </div>
      </div>

      {/* ===== CONTENT (GRID OR TABLE) ===== */}
      {loading ? (
        <div className="bsch-loading-box">
          <div className="bsch-spinner" />
          <p>Loading scheduled bus services…</p>
        </div>
      ) : filteredTrips.length === 0 ? (
        <div className="bsch-empty-box">
          <MdSchedule className="bsch-empty-icon" />
          <h3>No bus trips found</h3>
          <p>
            No scheduled services match your active filters or date criteria.
          </p>
          <button
            className="bsch-btn bsch-btn-primary"
            onClick={() => {
              setForm(initialForm);
              setShowCreateModal(true);
            }}
          >
            <MdAdd /> Schedule First Trip
          </button>
        </div>
      ) : viewMode === "grid" ? (
        /* ── GRID CARDS VIEW ── */
        <div className="bsch-grid">
          {filteredTrips.map((trip) => {
            const statusInfo = getStatusBadge(trip.status);
            const total = trip.totalSeats || 0;
            const booked = trip.bookedSeats?.length || 0;
            const blocked = trip.blockedSeats?.length || 0;
            const available = trip.availableSeats ?? total - booked - blocked;
            const pctBooked = total > 0 ? Math.round((booked / total) * 100) : 0;

            const tDateFormatted = trip.travelDate
              ? new Date(trip.travelDate).toLocaleDateString("en-IN", {
                  weekday: "short",
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "Date TBD";

            return (
              <div key={trip._id} className="bsch-card">
                {/* Top Bar */}
                <div className="bsch-card-top">
                  <div className="bsch-trip-code-box">
                    <span className="bsch-code-badge">{trip.tripCode}</span>
                    <h3 className="bsch-trip-name">
                      {trip.tripName || `${trip.fromCity} → ${trip.toCity}`}
                    </h3>
                  </div>
                  <span className={`bsch-status-pill ${statusInfo.cls}`}>
                    <span className="bsch-status-dot" />
                    {statusInfo.label}
                  </span>
                </div>

                {/* Assigned Bus Info */}
                <div className="bsch-assigned-bus">
                  <MdDirectionsBus className="bsch-bus-icon" />
                  <div className="bsch-bus-details">
                    <span className="bsch-bus-plate">
                      {trip.bus?.busNumber || "Bus Plate"}
                    </span>
                    <span className="bsch-bus-title">
                      {trip.bus?.busName || "Coach"} •{" "}
                      {trip.bus?.busType || "AC"}
                    </span>
                  </div>
                </div>

                {/* Route Timeline */}
                <div className="bsch-route-timeline">
                  <div className="bsch-timeline-node">
                    <span className="bsch-time">{trip.departureTime}</span>
                    <span className="bsch-city">{trip.fromCity}</span>
                  </div>
                  <div className="bsch-timeline-track">
                    <span className="bsch-duration">
                      {trip.journeyDuration || "Direct"}
                    </span>
                    <div className="bsch-arrow-line">
                      <div className="bsch-line" />
                      <MdArrowForward className="bsch-arrow-icon" />
                    </div>
                    {trip.viaCities?.length > 0 && (
                      <span className="bsch-via">
                        via {trip.viaCities.slice(0, 2).join(", ")}
                      </span>
                    )}
                  </div>
                  <div className="bsch-timeline-node right">
                    <span className="bsch-time">{trip.arrivalTime}</span>
                    <span className="bsch-city">{trip.toCity}</span>
                  </div>
                </div>

                {/* Calendar Date & Price */}
                <div className="bsch-date-price-row">
                  <div className="bsch-info-chip">
                    <MdCalendarToday /> {tDateFormatted}
                  </div>
                  <div className="bsch-price-tag">
                    <span className="bsch-currency">₹</span>
                    <span className="bsch-fare">
                      {trip.finalPrice || trip.basePrice || 0}
                    </span>
                    <small>net fare</small>
                  </div>
                </div>

                {/* Seat Occupancy Meter */}
                <div className="bsch-seat-meter">
                  <div className="bsch-seat-meter-header">
                    <span>
                      <MdEventSeat /> {available} seats left of {total}
                    </span>
                    <span className="bsch-meter-pct">{pctBooked}% booked</span>
                  </div>
                  <div className="bsch-progress-bar">
                    <div
                      className={`bsch-progress-fill ${
                        pctBooked > 80
                          ? "fill-high"
                          : pctBooked > 40
                          ? "fill-mid"
                          : "fill-low"
                      }`}
                      style={{ width: `${pctBooked}%` }}
                    />
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="bsch-card-actions">
                  <button
                    className="bsch-action-btn view-btn"
                    onClick={() => {
                      setActiveTrip(trip);
                      setShowDetailsModal(true);
                    }}
                    title="View Passenger & Route Manifest"
                  >
                    Manifest
                  </button>

                  {/* Fast State Transitions */}
                  {trip.status === "SCHEDULED" && (
                    <button
                      className="bsch-action-btn status-btn boarding"
                      onClick={() => handleQuickStatus(trip._id, "BOARDING")}
                      disabled={actionLoading}
                      title="Open Boarding Gates"
                    >
                      <MdFlashOn /> Boarding
                    </button>
                  )}
                  {trip.status === "BOARDING" && (
                    <button
                      className="bsch-action-btn status-btn started"
                      onClick={() => handleQuickStatus(trip._id, "STARTED")}
                      disabled={actionLoading}
                      title="Dispatch Coach on Highway"
                    >
                      <MdFlashOn /> Start Trip
                    </button>
                  )}
                  {trip.status === "STARTED" && (
                    <button
                      className="bsch-action-btn status-btn completed"
                      onClick={() => handleQuickStatus(trip._id, "COMPLETED")}
                      disabled={actionLoading}
                      title="Mark Arrived & Completed"
                    >
                      <MdCheckCircle /> Complete
                    </button>
                  )}

                  <button
                    className="bsch-action-btn edit-btn"
                    onClick={() => openEditModal(trip)}
                    disabled={["STARTED", "COMPLETED"].includes(trip.status)}
                    title="Edit Schedule & Fares"
                  >
                    <MdEdit />
                  </button>

                  <button
                    className="bsch-action-btn cancel-btn"
                    onClick={() => {
                      setActiveTrip(trip);
                      setShowCancelModal(true);
                    }}
                    disabled={
                      ["COMPLETED", "CANCELLED"].includes(trip.status) ||
                      trip.bookedSeats?.length > 0
                    }
                    title="Cancel Service Run"
                  >
                    <MdCancel />
                  </button>

                  <button
                    className="bsch-action-btn delete-btn"
                    onClick={() => {
                      setActiveTrip(trip);
                      setShowDeleteModal(true);
                    }}
                    disabled={trip.bookedSeats?.length > 0}
                    title="Delete Trip"
                  >
                    <MdDeleteOutline />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── TABLE VIEW ── */
        <div className="bsch-table-card">
          <table className="bsch-table">
            <thead>
              <tr>
                <th>TRIP CODE / NAME</th>
                <th>ASSIGNED COACH</th>
                <th>JOURNEY DATE</th>
                <th>TIMING (DEP - ARR)</th>
                <th>ROUTE</th>
                <th>FARE</th>
                <th>SEATS (AVAIL/TOT)</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrips.map((trip) => {
                const statusInfo = getStatusBadge(trip.status);
                const total = trip.totalSeats || 0;
                const booked = trip.bookedSeats?.length || 0;
                const blocked = trip.blockedSeats?.length || 0;
                const available =
                  trip.availableSeats ?? total - booked - blocked;

                return (
                  <tr key={trip._id}>
                    <td>
                      <b className="bsch-table-code">{trip.tripCode}</b>
                      <div className="bsch-table-sub">
                        {trip.tripName || "Service"}
                      </div>
                    </td>
                    <td>
                      <b>{trip.bus?.busNumber || "Plate"}</b>
                      <div className="bsch-table-sub">
                        {trip.bus?.busName || "Coach"}
                      </div>
                    </td>
                    <td>
                      {trip.travelDate
                        ? new Date(trip.travelDate).toLocaleDateString(
                            "en-IN",
                            { day: "2-digit", month: "short", year: "numeric" }
                          )
                        : "—"}
                    </td>
                    <td>
                      <div>
                        <b>{trip.departureTime}</b> → {trip.arrivalTime}
                      </div>
                      <small className="bsch-table-sub">
                        {trip.journeyDuration}
                      </small>
                    </td>
                    <td>
                      <b>
                        {trip.fromCity} → {trip.toCity}
                      </b>
                      {trip.viaCities?.length > 0 && (
                        <div className="bsch-table-sub">
                          via {trip.viaCities.join(", ")}
                        </div>
                      )}
                    </td>
                    <td>
                      <b>₹{trip.finalPrice || trip.basePrice || 0}</b>
                    </td>
                    <td>
                      <b>{available}</b> / {total}
                      <small className="bsch-table-sub">
                        ({booked} booked)
                      </small>
                    </td>
                    <td>
                      <span className={`bsch-status-pill ${statusInfo.cls}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td>
                      <div className="bsch-table-actions">
                        <button
                          className="bsch-icon-btn"
                          onClick={() => {
                            setActiveTrip(trip);
                            setShowDetailsModal(true);
                          }}
                          title="Manifest"
                        >
                          <MdInfoOutline />
                        </button>
                        <button
                          className="bsch-icon-btn"
                          onClick={() => openEditModal(trip)}
                          disabled={["STARTED", "COMPLETED"].includes(
                            trip.status
                          )}
                          title="Edit"
                        >
                          <MdEdit />
                        </button>
                        <button
                          className="bsch-icon-btn danger"
                          onClick={() => {
                            setActiveTrip(trip);
                            setShowCancelModal(true);
                          }}
                          disabled={
                            ["COMPLETED", "CANCELLED"].includes(trip.status) ||
                            trip.bookedSeats?.length > 0
                          }
                          title="Cancel"
                        >
                          <MdCancel />
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

      {/* ===================================================
          MODAL 1: CREATE NEW BUS TRIP
          =================================================== */}
      {showCreateModal && (
        <div className="bsch-modal-backdrop">
          <div className="bsch-modal bsch-modal-lg">
            <div className="bsch-modal-header">
              <div className="bsch-modal-title">
                <MdAdd className="bsch-modal-icon" />
                <div>
                  <h3>Schedule New Bus Trip</h3>
                  <small>
                    Dispatch a bus service run with timetable, route stops & seat layout
                  </small>
                </div>
              </div>
              <button
                className="bsch-modal-close"
                onClick={() => setShowCreateModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="bsch-modal-form">
              {/* Layout Warning Notice */}
              {hasLayoutWarning && (
                <div className="bsch-alert bsch-alert-warning">
                  <div>
                    <b>Notice:</b> This coach does not have an active seat layout blueprint registered in the system yet.
                  </div>
                  <button
                    type="button"
                    className="bsch-btn bsch-btn-small bsch-btn-primary"
                    onClick={handleAutoCreateLayout}
                    disabled={autoLayoutCreating}
                  >
                    {autoLayoutCreating ? "Generating…" : "⚡ Auto-Generate Seat Layout"}
                  </button>
                </div>
              )}

              <div className="bsch-form-grid">
                {/* Assigned Bus Selection */}
                <div className="bsch-form-group col-2">
                  <label>
                    Select Operating Bus Coach <span className="req">*</span>
                  </label>
                  <select
                    value={form.busId}
                    onChange={(e) => handleBusSelection(e.target.value)}
                    required
                    className="bsch-input"
                  >
                    <option value="">-- Choose bus from fleet --</option>
                    {buses.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.busNumber} — {b.busName} ({b.busType},{" "}
                        {b.totalSeats} seats)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Trip Name */}
                <div className="bsch-form-group col-2">
                  <label>Trip / Service Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Lucknow - Delhi Royal Express"
                    value={form.tripName}
                    onChange={(e) =>
                      setForm({ ...form, tripName: e.target.value })
                    }
                    className="bsch-input"
                  />
                </div>

                {/* Origin City */}
                <div className="bsch-form-group">
                  <label>
                    Origin (From City) <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lucknow"
                    value={form.fromCity}
                    onChange={(e) =>
                      setForm({ ...form, fromCity: e.target.value })
                    }
                    className="bsch-input"
                  />
                </div>

                {/* Destination City */}
                <div className="bsch-form-group">
                  <label>
                    Destination (To City) <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. New Delhi"
                    value={form.toCity}
                    onChange={(e) =>
                      setForm({ ...form, toCity: e.target.value })
                    }
                    className="bsch-input"
                  />
                </div>

                {/* Via Cities */}
                <div className="bsch-form-group col-2">
                  <label>Via Cities (Comma-separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Kanpur, Agra, Mathura"
                    value={form.viaCities}
                    onChange={(e) =>
                      setForm({ ...form, viaCities: e.target.value })
                    }
                    className="bsch-input"
                  />
                </div>

                {/* Travel Date */}
                <div className="bsch-form-group">
                  <label>
                    Journey Travel Date <span className="req">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={form.travelDate}
                    onChange={(e) =>
                      setForm({ ...form, travelDate: e.target.value })
                    }
                    className="bsch-input"
                  />
                </div>

                {/* Departure Time */}
                <div className="bsch-form-group">
                  <label>
                    Departure Time <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 08:30 PM"
                    value={form.departureTime}
                    onChange={(e) =>
                      setForm({ ...form, departureTime: e.target.value })
                    }
                    className="bsch-input"
                  />
                </div>

                {/* Arrival Date */}
                <div className="bsch-form-group">
                  <label>Arrival Date</label>
                  <input
                    type="date"
                    value={form.arrivalDate}
                    onChange={(e) =>
                      setForm({ ...form, arrivalDate: e.target.value })
                    }
                    className="bsch-input"
                  />
                </div>

                {/* Arrival Time */}
                <div className="bsch-form-group">
                  <label>
                    Arrival Time <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 05:30 AM"
                    value={form.arrivalTime}
                    onChange={(e) =>
                      setForm({ ...form, arrivalTime: e.target.value })
                    }
                    className="bsch-input"
                  />
                </div>

                {/* Reporting Time */}
                <div className="bsch-form-group">
                  <label>Passenger Reporting Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 08:00 PM"
                    value={form.reportingTime}
                    onChange={(e) =>
                      setForm({ ...form, reportingTime: e.target.value })
                    }
                    className="bsch-input"
                  />
                </div>

                {/* Journey Duration */}
                <div className="bsch-form-group">
                  <label>Approx. Journey Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 9h 00m"
                    value={form.journeyDuration}
                    onChange={(e) =>
                      setForm({ ...form, journeyDuration: e.target.value })
                    }
                    className="bsch-input"
                  />
                </div>

                {/* Base Price */}
                <div className="bsch-form-group">
                  <label>
                    Base Ticket Fare (₹) <span className="req">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="900"
                    value={form.basePrice}
                    onChange={(e) =>
                      setForm({ ...form, basePrice: e.target.value })
                    }
                    className="bsch-input"
                  />
                </div>

                {/* Tax / Surcharge */}
                <div className="bsch-form-group">
                  <label>Taxes & Fees (₹)</label>
                  <input
                    type="number"
                    placeholder="45"
                    value={form.tax}
                    onChange={(e) => setForm({ ...form, tax: e.target.value })}
                    className="bsch-input"
                  />
                </div>

                {/* Special Discount */}
                <div className="bsch-form-group">
                  <label>Discount Override (₹)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={form.discount}
                    onChange={(e) =>
                      setForm({ ...form, discount: e.target.value })
                    }
                    className="bsch-input"
                  />
                </div>

                {/* Net Fare Preview */}
                <div className="bsch-form-group">
                  <label>Calculated Net Passenger Fare</label>
                  <div className="bsch-preview-fare">
                    ₹
                    {Math.max(
                      0,
                      Number(form.basePrice || 0) +
                        Number(form.tax || 0) -
                        Number(form.discount || 0)
                    )}
                  </div>
                </div>
              </div>

              {/* Boarding Points Section */}
              <div className="bsch-form-section">
                <div className="bsch-section-header">
                  <h4>Boarding Points / Pickup Locations</h4>
                  <button
                    type="button"
                    className="bsch-btn bsch-btn-small bsch-btn-secondary"
                    onClick={() => addPoint("boardingPoints")}
                  >
                    + Add Boarding Point
                  </button>
                </div>
                {form.boardingPoints.map((pt, i) => (
                  <div key={i} className="bsch-point-row">
                    <input
                      type="text"
                      placeholder="Pickup Location (e.g. ISBT Gate 2)"
                      value={pt.location}
                      onChange={(e) =>
                        updatePoint(
                          "boardingPoints",
                          i,
                          "location",
                          e.target.value
                        )
                      }
                      className="bsch-input flex-2"
                    />
                    <input
                      type="text"
                      placeholder="Pickup Time (08:30 PM)"
                      value={pt.time}
                      onChange={(e) =>
                        updatePoint("boardingPoints", i, "time", e.target.value)
                      }
                      className="bsch-input flex-1"
                    />
                    <input
                      type="text"
                      placeholder="Landmark"
                      value={pt.landmark}
                      onChange={(e) =>
                        updatePoint(
                          "boardingPoints",
                          i,
                          "landmark",
                          e.target.value
                        )
                      }
                      className="bsch-input flex-1"
                    />
                    {form.boardingPoints.length > 1 && (
                      <button
                        type="button"
                        className="bsch-remove-btn"
                        onClick={() => removePoint("boardingPoints", i)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Dropping Points Section */}
              <div className="bsch-form-section">
                <div className="bsch-section-header">
                  <h4>Dropping Points / Destination Stops</h4>
                  <button
                    type="button"
                    className="bsch-btn bsch-btn-small bsch-btn-secondary"
                    onClick={() => addPoint("droppingPoints")}
                  >
                    + Add Dropping Point
                  </button>
                </div>
                {form.droppingPoints.map((pt, i) => (
                  <div key={i} className="bsch-point-row">
                    <input
                      type="text"
                      placeholder="Drop Location (e.g. Anand Vihar ISBT)"
                      value={pt.location}
                      onChange={(e) =>
                        updatePoint(
                          "droppingPoints",
                          i,
                          "location",
                          e.target.value
                        )
                      }
                      className="bsch-input flex-2"
                    />
                    <input
                      type="text"
                      placeholder="Drop Time (05:30 AM)"
                      value={pt.time}
                      onChange={(e) =>
                        updatePoint("droppingPoints", i, "time", e.target.value)
                      }
                      className="bsch-input flex-1"
                    />
                    <input
                      type="text"
                      placeholder="Landmark"
                      value={pt.landmark}
                      onChange={(e) =>
                        updatePoint(
                          "droppingPoints",
                          i,
                          "landmark",
                          e.target.value
                        )
                      }
                      className="bsch-input flex-1"
                    />
                    {form.droppingPoints.length > 1 && (
                      <button
                        type="button"
                        className="bsch-remove-btn"
                        onClick={() => removePoint("droppingPoints", i)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Notes */}
              <div className="bsch-form-group">
                <label>Operational Trip Notes</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Water bottles, blankets, charging points available."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="bsch-textarea"
                />
              </div>

              {/* Modal Actions */}
              <div className="bsch-modal-footer">
                <button
                  type="button"
                  className="bsch-btn bsch-btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bsch-btn bsch-btn-primary"
                  disabled={actionLoading}
                >
                  {actionLoading ? "Scheduling Trip…" : "Confirm & Dispatch Run"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================
          MODAL 2: EDIT BUS TRIP
          =================================================== */}
      {showEditModal && activeTrip && (
        <div className="bsch-modal-backdrop">
          <div className="bsch-modal bsch-modal-lg">
            <div className="bsch-modal-header">
              <div className="bsch-modal-title">
                <MdEdit className="bsch-modal-icon" />
                <div>
                  <h3>Edit Schedule — {activeTrip.tripCode}</h3>
                  <small>Modify journey timetable, fares and route stops</small>
                </div>
              </div>
              <button
                className="bsch-modal-close"
                onClick={() => setShowEditModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="bsch-modal-form">
              <div className="bsch-form-grid">
                {/* Trip Name */}
                <div className="bsch-form-group col-2">
                  <label>Trip Name</label>
                  <input
                    type="text"
                    value={form.tripName}
                    onChange={(e) =>
                      setForm({ ...form, tripName: e.target.value })
                    }
                    className="bsch-input"
                  />
                </div>

                {/* Status Switcher */}
                <div className="bsch-form-group col-2">
                  <label>Trip Service Status</label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                    className="bsch-input"
                  >
                    <option value="SCHEDULED">SCHEDULED (Upcoming)</option>
                    <option value="BOARDING">BOARDING (Gates Open)</option>
                    <option value="STARTED">STARTED (On Road / Active)</option>
                    <option value="COMPLETED">COMPLETED (Arrived)</option>
                  </select>
                </div>

                {/* Origin */}
                <div className="bsch-form-group">
                  <label>From City</label>
                  <input
                    type="text"
                    value={form.fromCity}
                    onChange={(e) =>
                      setForm({ ...form, fromCity: e.target.value })
                    }
                    className="bsch-input"
                  />
                </div>

                {/* Destination */}
                <div className="bsch-form-group">
                  <label>To City</label>
                  <input
                    type="text"
                    value={form.toCity}
                    onChange={(e) =>
                      setForm({ ...form, toCity: e.target.value })
                    }
                    className="bsch-input"
                  />
                </div>

                {/* Travel Date */}
                <div className="bsch-form-group">
                  <label>Travel Date</label>
                  <input
                    type="date"
                    value={form.travelDate}
                    onChange={(e) =>
                      setForm({ ...form, travelDate: e.target.value })
                    }
                    className="bsch-input"
                  />
                </div>

                {/* Departure Time */}
                <div className="bsch-form-group">
                  <label>Departure Time</label>
                  <input
                    type="text"
                    value={form.departureTime}
                    onChange={(e) =>
                      setForm({ ...form, departureTime: e.target.value })
                    }
                    className="bsch-input"
                  />
                </div>

                {/* Arrival Time */}
                <div className="bsch-form-group">
                  <label>Arrival Time</label>
                  <input
                    type="text"
                    value={form.arrivalTime}
                    onChange={(e) =>
                      setForm({ ...form, arrivalTime: e.target.value })
                    }
                    className="bsch-input"
                  />
                </div>

                {/* Base Price */}
                <div className="bsch-form-group">
                  <label>Base Price (₹)</label>
                  <input
                    type="number"
                    value={form.basePrice}
                    onChange={(e) =>
                      setForm({ ...form, basePrice: e.target.value })
                    }
                    className="bsch-input"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="bsch-modal-footer">
                <button
                  type="button"
                  className="bsch-btn bsch-btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bsch-btn bsch-btn-primary"
                  disabled={actionLoading}
                >
                  {actionLoading ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================
          MODAL 3: TRIP DETAILS & MANIFEST
          =================================================== */}
      {showDetailsModal && activeTrip && (
        <div className="bsch-modal-backdrop">
          <div className="bsch-modal bsch-modal-lg">
            <div className="bsch-modal-header">
              <div className="bsch-modal-title">
                <MdDirectionsBus className="bsch-modal-icon" />
                <div>
                  <h3>Trip Manifest — {activeTrip.tripCode}</h3>
                  <small>
                    {activeTrip.tripName ||
                      `${activeTrip.fromCity} → ${activeTrip.toCity}`}
                  </small>
                </div>
              </div>
              <button
                className="bsch-modal-close"
                onClick={() => setShowDetailsModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="bsch-manifest-body">
              {/* Top Overview */}
              <div className="bsch-manifest-summary">
                <div className="bsch-manifest-stat">
                  <span>Assigned Bus:</span>
                  <b>
                    {activeTrip.bus?.busNumber} ({activeTrip.bus?.busName})
                  </b>
                </div>
                <div className="bsch-manifest-stat">
                  <span>Journey Date:</span>
                  <b>
                    {activeTrip.travelDate
                      ? new Date(activeTrip.travelDate).toDateString()
                      : "—"}
                  </b>
                </div>
                <div className="bsch-manifest-stat">
                  <span>Schedule:</span>
                  <b>
                    {activeTrip.departureTime} → {activeTrip.arrivalTime}
                  </b>
                </div>
                <div className="bsch-manifest-stat">
                  <span>Status:</span>
                  <b>{activeTrip.status}</b>
                </div>
              </div>

              {/* Seat Inventory Breakdown */}
              <div className="bsch-manifest-seats">
                <h4>Seat Inventory Breakdown</h4>
                <div className="bsch-seat-chips-row">
                  <div className="bsch-chip total">
                    Total: {activeTrip.totalSeats}
                  </div>
                  <div className="bsch-chip available">
                    Available: {activeTrip.availableSeats}
                  </div>
                  <div className="bsch-chip booked">
                    Booked: {activeTrip.bookedSeats?.length || 0}
                  </div>
                  <div className="bsch-chip blocked">
                    Blocked: {activeTrip.blockedSeats?.length || 0}
                  </div>
                </div>

                {activeTrip.bookedSeats?.length > 0 ? (
                  <div className="bsch-seats-list">
                    <span>Booked Seat Nos:</span>
                    <div className="bsch-tags">
                      {activeTrip.bookedSeats.map((s, idx) => (
                        <span key={idx} className="bsch-tag-seat">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="bsch-hint">
                    No tickets booked yet on this scheduled run.
                  </p>
                )}
              </div>

              {/* Route & Stops */}
              <div className="bsch-manifest-stops">
                <div className="bsch-stops-col">
                  <h4>Boarding Points</h4>
                  {activeTrip.boardingPoints?.length > 0 ? (
                    activeTrip.boardingPoints.map((b, i) => (
                      <div key={i} className="bsch-stop-card">
                        <b>{b.time}</b> — {b.location}
                        {b.landmark && <small> ({b.landmark})</small>}
                      </div>
                    ))
                  ) : (
                    <p className="bsch-hint">Standard Origin Bus Terminal</p>
                  )}
                </div>

                <div className="bsch-stops-col">
                  <h4>Dropping Points</h4>
                  {activeTrip.droppingPoints?.length > 0 ? (
                    activeTrip.droppingPoints.map((d, i) => (
                      <div key={i} className="bsch-stop-card">
                        <b>{d.time}</b> — {d.location}
                        {d.landmark && <small> ({d.landmark})</small>}
                      </div>
                    ))
                  ) : (
                    <p className="bsch-hint">Main Destination ISBT</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bsch-modal-footer">
              <button
                type="button"
                className="bsch-btn bsch-btn-secondary"
                onClick={() => setShowDetailsModal(false)}
              >
                Close Manifest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          MODAL 4: CANCEL TRIP
          =================================================== */}
      {showCancelModal && activeTrip && (
        <div className="bsch-modal-backdrop">
          <div className="bsch-modal bsch-modal-sm">
            <div className="bsch-modal-header">
              <div className="bsch-modal-title">
                <MdCancel className="bsch-modal-icon text-danger" />
                <div>
                  <h3>Cancel Service Run</h3>
                  <small>{activeTrip.tripCode}</small>
                </div>
              </div>
              <button
                className="bsch-modal-close"
                onClick={() => setShowCancelModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="bsch-modal-body">
              <p>
                Are you sure you want to cancel trip{" "}
                <b>{activeTrip.tripCode}</b> from <b>{activeTrip.fromCity}</b> to{" "}
                <b>{activeTrip.toCity}</b>?
              </p>
              <div className="bsch-form-group">
                <label>Cancellation Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Engine Maintenance, Bad Weather Corridor"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="bsch-input"
                />
              </div>
            </div>

            <div className="bsch-modal-footer">
              <button
                className="bsch-btn bsch-btn-secondary"
                onClick={() => setShowCancelModal(false)}
              >
                Keep Active
              </button>
              <button
                className="bsch-btn bsch-btn-danger"
                onClick={handleCancelSubmit}
                disabled={actionLoading}
              >
                {actionLoading ? "Cancelling…" : "Yes, Cancel Trip"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          MODAL 5: DELETE TRIP
          =================================================== */}
      {showDeleteModal && activeTrip && (
        <div className="bsch-modal-backdrop">
          <div className="bsch-modal bsch-modal-sm">
            <div className="bsch-modal-header">
              <div className="bsch-modal-title">
                <MdDeleteOutline className="bsch-modal-icon text-danger" />
                <div>
                  <h3>Delete Trip Schedule</h3>
                  <small>{activeTrip.tripCode}</small>
                </div>
              </div>
              <button
                className="bsch-modal-close"
                onClick={() => setShowDeleteModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="bsch-modal-body">
              <p>
                This will permanently delete scheduled run{" "}
                <b>{activeTrip.tripCode}</b> from your operator roster.
              </p>
            </div>

            <div className="bsch-modal-footer">
              <button
                className="bsch-btn bsch-btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="bsch-btn bsch-btn-danger"
                onClick={handleDeleteSubmit}
                disabled={actionLoading}
              >
                {actionLoading ? "Deleting…" : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
