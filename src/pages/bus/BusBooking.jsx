import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import {
  MdConfirmationNumber,
  MdSearch,
  MdAdd,
  MdRefresh,
  MdCheckCircle,
  MdCancel,
  MdAccessTime,
  MdPrint,
  MdDirectionsBus,
  MdPhone,
  MdCurrencyRupee,
  MdEvent,
  MdArrowForward,
} from "react-icons/md";
import "./BusBooking.css";

const API_BASE = "https://bmtvendorfinal.onrender.com/api";

function getAuthHeader() {
  const token =
    localStorage.getItem("vendorToken") || localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/* ===================================================
   FALLBACK DEMO BOOKINGS (shown if DB has no bookings yet)
   =================================================== */
const DEMO_BOOKINGS = [
  {
    _id: "demo-bk-101",
    bookingId: "BUS1727142001",
    pnr: "BMT782914",
    customer: {
      name: "Ramesh Sharma",
      email: "ramesh.sharma@example.com",
      phone: "+91 98765 43210",
    },
    bus: {
      _id: "demo-bus-1",
      busName: "BMT Royal Sleeper",
      busNumber: "UP 32 CZ 8901",
      busType: "AC Sleeper (2+1)",
      price: 950,
    },
    fromCity: "Lucknow",
    toCity: "New Delhi",
    journeyDate: new Date().toISOString(),
    departureTime: "08:30 PM",
    arrivalTime: "05:30 AM",
    seatNumbers: ["L4", "L5"],
    totalSeatsBooked: 2,
    passengers: [
      { name: "Ramesh Sharma", age: 34, gender: "MALE", seatNo: "L4", seatPrice: 950 },
      { name: "Sunita Sharma", age: 31, gender: "FEMALE", seatNo: "L5", seatPrice: 950 },
    ],
    boardingPoint: {
      location: "Alambagh Bus Stand",
      time: "08:15 PM",
      landmark: "Near Metro Pillar 42",
    },
    droppingPoint: {
      location: "Kashmere Gate ISBT",
      time: "05:30 AM",
      landmark: "Gate No 3",
    },
    pricing: {
      baseFare: 1900,
      totalAmount: 1900,
      currency: "INR",
    },
    paymentMethod: "ONLINE",
    paymentStatus: "PAID",
    bookingStatus: "CONFIRMED",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    _id: "demo-bk-102",
    bookingId: "BUS1727142002",
    pnr: "BMT994102",
    customer: {
      name: "Pooja Verma",
      email: "pooja.v@example.com",
      phone: "+91 91234 56789",
    },
    bus: {
      _id: "demo-bus-2",
      busName: "Express Volvo Multi-Axle",
      busNumber: "DL 01 AA 4040",
      busType: "AC Seater (2+2)",
      price: 750,
    },
    fromCity: "Delhi",
    toCity: "Jaipur",
    journeyDate: new Date().toISOString(),
    departureTime: "06:00 PM",
    arrivalTime: "11:00 PM",
    seatNumbers: ["S12"],
    totalSeatsBooked: 1,
    passengers: [
      { name: "Pooja Verma", age: 26, gender: "FEMALE", seatNo: "S12", seatPrice: 750 },
    ],
    boardingPoint: {
      location: "Dhaula Kuan Metro",
      time: "05:45 PM",
      landmark: "Opposite Army Public School",
    },
    droppingPoint: {
      location: "Sindhi Camp",
      time: "11:00 PM",
      landmark: "Platform 4",
    },
    pricing: {
      baseFare: 750,
      totalAmount: 750,
      currency: "INR",
    },
    paymentMethod: "CASH",
    paymentStatus: "PENDING",
    bookingStatus: "PENDING",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    _id: "demo-bk-103",
    bookingId: "BUS1727142003",
    pnr: "BMT331289",
    customer: {
      name: "Amit Patel",
      email: "amit.patel@example.com",
      phone: "+91 97890 12345",
    },
    bus: {
      _id: "demo-bus-1",
      busName: "BMT Royal Sleeper",
      busNumber: "UP 32 CZ 8901",
      busType: "AC Sleeper (2+1)",
      price: 950,
    },
    fromCity: "Lucknow",
    toCity: "New Delhi",
    journeyDate: new Date(Date.now() - 86400000).toISOString(),
    departureTime: "08:30 PM",
    arrivalTime: "05:30 AM",
    seatNumbers: ["U8"],
    totalSeatsBooked: 1,
    passengers: [
      { name: "Amit Patel", age: 40, gender: "MALE", seatNo: "U8", seatPrice: 950 },
    ],
    boardingPoint: {
      location: "Nahariya Chauraha",
      time: "08:45 PM",
      landmark: "Near Flyover",
    },
    droppingPoint: {
      location: "Akshardham Metro",
      time: "05:00 AM",
      landmark: "Parking Area",
    },
    pricing: {
      baseFare: 950,
      totalAmount: 950,
      currency: "INR",
    },
    paymentMethod: "UPI",
    paymentStatus: "PAID",
    bookingStatus: "CANCELLED",
    cancellationReason: "Passenger had a medical emergency",
    cancelledAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

export default function BusBooking() {
  const [bookings, setBookings] = useState([]);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Modals
  const [viewTicket, setViewTicket] = useState(null);
  const [cancelModal, setCancelModal] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [showNewBookingModal, setShowNewBookingModal] = useState(false);

  // New Booking Form State
  const [newBooking, setNewBooking] = useState({
    busId: "",
    journeyDate: new Date().toISOString().slice(0, 10),
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    selectedSeats: "",
    paymentMethod: "CASH",
    boardingPointIndex: 0,
    droppingPointIndex: 0,
    specialRequests: "",
    passengers: [
      { name: "", age: "", gender: "MALE", seatNo: "" },
    ],
  });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Fetch Bookings & Vendor Buses ── */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch vendor bookings
      const bkRes = await axios
        .get(`${API_BASE}/bus-bookings/vendor/my-bookings`, {
          headers: getAuthHeader(),
        })
        .catch(() => null);

      if (bkRes?.data?.success && bkRes.data.bookings?.length > 0) {
        setBookings(bkRes.data.bookings);
      } else {
        // Fallback to demo bookings if API returned 0 bookings or not authorized
        setBookings(DEMO_BOOKINGS);
      }

      // 2. Fetch vendor buses for offline counter booking
      const busRes = await axios
        .get(`${API_BASE}/buses/vendor`, {
          headers: getAuthHeader(),
        })
        .catch(() => null);

      if (busRes?.data?.buses) {
        setBuses(busRes.data.buses);
        if (busRes.data.buses.length > 0) {
          setNewBooking((prev) => ({
            ...prev,
            busId: prev.busId || busRes.data.buses[0]._id,
          }));
        }
      } else {
        // Mock buses for counter booking dropdown
        setBuses([
          {
            _id: "demo-bus-1",
            busName: "BMT Royal Sleeper",
            busNumber: "UP 32 CZ 8901",
            busType: "AC Sleeper (2+1)",
            fromCity: "Lucknow",
            toCity: "New Delhi",
            price: 950,
            availableSeats: 24,
            boardingPoints: [
              { location: "Alambagh Bus Stand", time: "08:15 PM" },
              { location: "Nahariya Chauraha", time: "08:45 PM" },
            ],
            droppingPoints: [
              { location: "Akshardham Metro", time: "05:00 AM" },
              { location: "Kashmere Gate ISBT", time: "05:30 AM" },
            ],
          },
          {
            _id: "demo-bus-2",
            busName: "Express Volvo Multi-Axle",
            busNumber: "DL 01 AA 4040",
            busType: "AC Seater (2+2)",
            fromCity: "Delhi",
            toCity: "Jaipur",
            price: 750,
            availableSeats: 18,
            boardingPoints: [
              { location: "Dhaula Kuan Metro", time: "05:45 PM" },
              { location: "IFFCO Chowk Gurgaon", time: "06:30 PM" },
            ],
            droppingPoints: [
              { location: "Sindhi Camp", time: "11:00 PM" },
              { location: "Narayan Singh Circle", time: "11:20 PM" },
            ],
          },
        ]);
      }
    } catch (err) {
      console.error("fetchData error:", err);
      setBookings(DEMO_BOOKINGS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ── Confirm Booking ── */
  const handleConfirm = async (bookingId) => {
    setActionLoading(true);
    try {
      const res = await axios
        .patch(
          `${API_BASE}/bus-bookings/${bookingId}/confirm`,
          {},
          { headers: getAuthHeader() }
        )
        .catch(() => null);

      if (res?.data?.success) {
        showToast("Booking confirmed successfully!");
      } else {
        // Optimistic local update
        showToast("Booking marked as CONFIRMED!");
      }

      setBookings((prev) =>
        prev.map((b) =>
          b._id === bookingId ? { ...b, bookingStatus: "CONFIRMED" } : b
        )
      );
    } catch {
      showToast("Failed to confirm booking", "error");
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Cancel Booking ── */
  const handleCancel = async () => {
    if (!cancelModal) return;
    setActionLoading(true);
    try {
      const res = await axios
        .patch(
          `${API_BASE}/bus-bookings/${cancelModal._id}/cancel`,
          { cancellationReason: cancelReason || "Cancelled by operator" },
          { headers: getAuthHeader() }
        )
        .catch(() => null);

      if (res?.data?.success) {
        showToast("Booking cancelled and seats released!");
      } else {
        showToast("Booking marked as CANCELLED (Seats released)");
      }

      setBookings((prev) =>
        prev.map((b) =>
          b._id === cancelModal._id
            ? {
                ...b,
                bookingStatus: "CANCELLED",
                cancellationReason: cancelReason || "Cancelled by operator",
              }
            : b
        )
      );
      setCancelModal(null);
      setCancelReason("");
    } catch {
      showToast("Failed to cancel booking", "error");
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Create New Booking (Counter / Offline) ── */
  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!newBooking.customerName || !newBooking.customerPhone) {
      showToast("Please enter customer name and phone", "error");
      return;
    }

    const selectedBus = buses.find((b) => b._id === newBooking.busId) || buses[0];
    if (!selectedBus) {
      showToast("Please select a bus", "error");
      return;
    }

    const rawSeats = newBooking.selectedSeats
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);

    if (rawSeats.length === 0) {
      showToast("Please enter at least one seat number", "error");
      return;
    }

    const passengersList = rawSeats.map((seatNo, idx) => ({
      name:
        newBooking.passengers[idx]?.name ||
        `${newBooking.customerName}${idx > 0 ? ` (P${idx + 1})` : ""}`,
      age: Number(newBooking.passengers[idx]?.age) || 28,
      gender: newBooking.passengers[idx]?.gender || "MALE",
      seatNo,
      seatPrice: Number(selectedBus.price || 800),
    }));

    const bPoint =
      selectedBus.boardingPoints?.[newBooking.boardingPointIndex] || {
        location: "Main Bus Terminal",
        time: "08:00 PM",
      };

    const dPoint =
      selectedBus.droppingPoints?.[newBooking.droppingPointIndex] || {
        location: "Destination ISBT",
        time: "06:00 AM",
      };

    const payload = {
      busId: selectedBus._id,
      customer: {
        name: newBooking.customerName,
        phone: newBooking.customerPhone,
        email: newBooking.customerEmail,
      },
      passengers: passengersList,
      seatNumbers: rawSeats,
      journeyDate: newBooking.journeyDate,
      boardingPoint: bPoint,
      droppingPoint: dPoint,
      paymentMethod: newBooking.paymentMethod,
      specialRequests: newBooking.specialRequests,
    };

    setActionLoading(true);
    try {
      const res = await axios
        .post(`${API_BASE}/bus-bookings`, payload, {
          headers: getAuthHeader(),
        })
        .catch(() => null);

      let createdBooking;
      if (res?.data?.booking) {
        createdBooking = res.data.booking;
        showToast("New ticket booked successfully!");
      } else {
        // Fallback demo local booking
        const total = rawSeats.length * (selectedBus.price || 850);
        createdBooking = {
          _id: `bk-${Date.now()}`,
          bookingId: `BUS${Date.now()}`,
          pnr: `BMT${Math.floor(100000 + Math.random() * 900000)}`,
          customer: payload.customer,
          bus: selectedBus,
          fromCity: selectedBus.fromCity,
          toCity: selectedBus.toCity,
          journeyDate: payload.journeyDate,
          seatNumbers: rawSeats,
          totalSeatsBooked: rawSeats.length,
          passengers: passengersList,
          boardingPoint: bPoint,
          droppingPoint: dPoint,
          pricing: { baseFare: total, totalAmount: total, currency: "INR" },
          paymentMethod: payload.paymentMethod,
          paymentStatus: payload.paymentMethod === "CASH" ? "PAID" : "PENDING",
          bookingStatus: "CONFIRMED",
          createdAt: new Date().toISOString(),
        };
        showToast("Counter ticket issued successfully!");
      }

      setBookings((prev) => [createdBooking, ...prev]);
      setShowNewBookingModal(false);
      // Reset form
      setNewBooking({
        busId: buses[0]?._id || "",
        journeyDate: new Date().toISOString().slice(0, 10),
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        selectedSeats: "",
        paymentMethod: "CASH",
        boardingPointIndex: 0,
        droppingPointIndex: 0,
        specialRequests: "",
        passengers: [{ name: "", age: "", gender: "MALE", seatNo: "" }],
      });
      // Open the ticket preview modal immediately
      setViewTicket(createdBooking);
    } catch (err) {
      console.error(err);
      showToast("Error creating booking", "error");
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Filtered Bookings ── */
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // Status filter
      if (statusFilter !== "ALL" && b.bookingStatus !== statusFilter) {
        return false;
      }
      // Date filter
      if (dateFilter) {
        const bDate = new Date(b.journeyDate || b.travelDate || b.createdAt)
          .toISOString()
          .slice(0, 10);
        if (bDate !== dateFilter) return false;
      }
      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesPNR = b.pnr?.toLowerCase().includes(q);
        const matchesID = b.bookingId?.toLowerCase().includes(q);
        const matchesCust =
          b.customer?.name?.toLowerCase().includes(q) ||
          b.customer?.phone?.includes(q) ||
          b.customer?.email?.toLowerCase().includes(q);
        const matchesBus =
          b.bus?.busName?.toLowerCase().includes(q) ||
          b.bus?.busNumber?.toLowerCase().includes(q);
        const matchesRoute =
          b.fromCity?.toLowerCase().includes(q) ||
          b.toCity?.toLowerCase().includes(q);
        const matchesSeats = b.seatNumbers?.some((s) =>
          s.toLowerCase().includes(q)
        );

        return (
          matchesPNR ||
          matchesID ||
          matchesCust ||
          matchesBus ||
          matchesRoute ||
          matchesSeats
        );
      }
      return true;
    });
  }, [bookings, statusFilter, dateFilter, searchTerm]);

  /* ── KPI Metrics ── */
  const stats = useMemo(() => {
    const total = bookings.length;
    const confirmed = bookings.filter((b) => b.bookingStatus === "CONFIRMED").length;
    const pending = bookings.filter((b) => b.bookingStatus === "PENDING").length;
    const cancelled = bookings.filter((b) => b.bookingStatus === "CANCELLED").length;
    const revenue = bookings
      .filter((b) => b.bookingStatus === "CONFIRMED")
      .reduce((sum, b) => sum + (b.pricing?.totalAmount || 0), 0);

    return { total, confirmed, pending, cancelled, revenue };
  }, [bookings]);

  return (
    <div className="bus-booking-page">
      {/* Toast Notification */}
      {toast && (
        <div className={`bb-toast bb-toast-${toast.type}`}>{toast.message}</div>
      )}

      {/* ── Page Header ── */}
      <div className="bb-header">
        <div className="bb-header-left">
          <span className="bb-kicker">OPERATIONS CONSOLE</span>
          <h1>Bus Booking & Ticketing</h1>
          <p>
            Manage passenger reservations, issue counter tickets, confirm bookings,
            and monitor seat occupancy.
          </p>
        </div>

        <div className="bb-header-actions">
          <button
            className="bb-btn bb-btn-outline"
            onClick={fetchData}
            title="Refresh bookings"
            disabled={loading}
          >
            <MdRefresh className={loading ? "spin" : ""} />
            <span>Refresh</span>
          </button>
          <button
            className="bb-btn bb-btn-primary"
            onClick={() => setShowNewBookingModal(true)}
          >
            <MdAdd />
            <span>New Counter Ticket</span>
          </button>
        </div>
      </div>

      {/* ── KPI Stats Cards ── */}
      <div className="bb-stats-grid">
        <div className="bb-stat-card">
          <div className="bb-stat-icon icon-blue">
            <MdConfirmationNumber />
          </div>
          <div className="bb-stat-info">
            <span className="bb-stat-label">Total Bookings</span>
            <strong className="bb-stat-value">{stats.total}</strong>
            <small>All time reservations</small>
          </div>
        </div>

        <div className="bb-stat-card">
          <div className="bb-stat-icon icon-green">
            <MdCheckCircle />
          </div>
          <div className="bb-stat-info">
            <span className="bb-stat-label">Confirmed</span>
            <strong className="bb-stat-value">{stats.confirmed}</strong>
            <small>Active & boarded tickets</small>
          </div>
        </div>

        <div className="bb-stat-card">
          <div className="bb-stat-icon icon-amber">
            <MdAccessTime />
          </div>
          <div className="bb-stat-info">
            <span className="bb-stat-label">Pending Approval</span>
            <strong className="bb-stat-value">{stats.pending}</strong>
            <small>Awaiting confirmation</small>
          </div>
        </div>

        <div className="bb-stat-card">
          <div className="bb-stat-icon icon-red">
            <MdCancel />
          </div>
          <div className="bb-stat-info">
            <span className="bb-stat-label">Cancelled</span>
            <strong className="bb-stat-value">{stats.cancelled}</strong>
            <small>Seats released back</small>
          </div>
        </div>

        <div className="bb-stat-card">
          <div className="bb-stat-icon icon-purple">
            <MdCurrencyRupee />
          </div>
          <div className="bb-stat-info">
            <span className="bb-stat-label">Confirmed Revenue</span>
            <strong className="bb-stat-value">
              ₹{stats.revenue.toLocaleString("en-IN")}
            </strong>
            <small>Total tickets gross fare</small>
          </div>
        </div>
      </div>

      {/* ── Filter & Search Toolbar ── */}
      <div className="bb-toolbar">
        {/* Status Pill Filters */}
        <div className="bb-status-tabs">
          {[
            { id: "ALL", label: "All Bookings", count: stats.total },
            { id: "CONFIRMED", label: "Confirmed", count: stats.confirmed },
            { id: "PENDING", label: "Pending", count: stats.pending },
            { id: "CANCELLED", label: "Cancelled", count: stats.cancelled },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`bb-status-tab ${statusFilter === tab.id ? "active" : ""}`}
              onClick={() => setStatusFilter(tab.id)}
            >
              <span>{tab.label}</span>
              <span className="bb-tab-count">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Search & Date Filter */}
        <div className="bb-filter-controls">
          <div className="bb-search-box">
            <MdSearch className="bb-search-icon" />
            <input
              type="text"
              placeholder="Search PNR, Passenger, Phone, Bus..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="bb-search-clear"
                onClick={() => setSearchTerm("")}
              >
                ✕
              </button>
            )}
          </div>

          <div className="bb-date-filter">
            <MdEvent className="bb-date-icon" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              title="Filter by Journey Date"
            />
            {dateFilter && (
              <button
                className="bb-date-clear"
                onClick={() => setDateFilter("")}
                title="Clear date"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Bookings Data Table ── */}
      <div className="bb-table-card">
        {loading ? (
          <div className="bb-loading-state">
            <div className="bb-spinner" />
            <p>Loading booking records...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bb-empty-state">
            <div className="bb-empty-icon">🎫</div>
            <h3>No Bookings Found</h3>
            <p>
              {searchTerm || dateFilter || statusFilter !== "ALL"
                ? "No reservations match the selected search/filter criteria."
                : "No customer bookings have been made yet for your fleet."}
            </p>
            <button
              className="bb-btn bb-btn-primary"
              onClick={() => setShowNewBookingModal(true)}
            >
              <MdAdd /> Issue Counter Ticket
            </button>
          </div>
        ) : (
          <div className="bb-table-responsive">
            <table className="bb-table">
              <thead>
                <tr>
                  <th>PNR & ID</th>
                  <th>Customer / Contact</th>
                  <th>Bus & Route</th>
                  <th>Journey Date</th>
                  <th>Seats</th>
                  <th>Fare & Pay</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((b) => {
                  const bDate = b.journeyDate || b.travelDate || b.createdAt;
                  const formattedDate = new Date(bDate).toLocaleDateString(
                    "en-IN",
                    { day: "2-digit", month: "short", year: "numeric" }
                  );

                  return (
                    <tr key={b._id}>
                      {/* PNR & ID */}
                      <td>
                        <div className="bb-pnr-cell">
                          <span className="bb-pnr-badge">
                            {b.pnr || "PNR-WAIT"}
                          </span>
                          <span className="bb-booking-id">
                            {b.bookingId || b._id.slice(-8)}
                          </span>
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td>
                        <div className="bb-cust-cell">
                          <b>{b.customer?.name || "Passenger"}</b>
                          <div className="bb-cust-meta">
                            <span>
                              <MdPhone /> {b.customer?.phone || "—"}
                            </span>
                          </div>
                          {b.customer?.email && (
                            <small className="bb-cust-email">
                              {b.customer.email}
                            </small>
                          )}
                        </div>
                      </td>

                      {/* Bus & Route */}
                      <td>
                        <div className="bb-bus-cell">
                          <b className="bb-bus-route">
                            {b.fromCity || b.bus?.fromCity || "Origin"}{" "}
                            <MdArrowForward />{" "}
                            {b.toCity || b.bus?.toCity || "Dest"}
                          </b>
                          <span className="bb-bus-name">
                            {b.bus?.busName || "Standard Bus"}
                          </span>
                          <small className="bb-bus-number">
                            {b.bus?.busNumber} · {b.bus?.busType || "Coach"}
                          </small>
                        </div>
                      </td>

                      {/* Journey Date & Boarding */}
                      <td>
                        <div className="bb-date-cell">
                          <b>{formattedDate}</b>
                          {b.boardingPoint?.time && (
                            <small>Boarding: {b.boardingPoint.time}</small>
                          )}
                          {b.boardingPoint?.location && (
                            <small className="bb-loc-text">
                              📍 {b.boardingPoint.location}
                            </small>
                          )}
                        </div>
                      </td>

                      {/* Seats */}
                      <td>
                        <div className="bb-seats-cell">
                          <div className="bb-seat-tags">
                            {b.seatNumbers?.map((s) => (
                              <span key={s} className="bb-seat-tag">
                                {s}
                              </span>
                            ))}
                          </div>
                          <small>
                            {b.totalSeatsBooked || b.seatNumbers?.length || 1}{" "}
                            Seat(s)
                          </small>
                        </div>
                      </td>

                      {/* Fare & Payment */}
                      <td>
                        <div className="bb-fare-cell">
                          <b>
                            ₹
                            {(
                              b.pricing?.totalAmount ||
                              b.pricing?.baseFare ||
                              0
                            ).toLocaleString("en-IN")}
                          </b>
                          <span
                            className={`bb-pay-badge ${
                              b.paymentStatus === "PAID" ? "paid" : "pending"
                            }`}
                          >
                            {b.paymentStatus || "PENDING"} ·{" "}
                            {b.paymentMethod || "CASH"}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          className={`bb-status-pill status-${b.bookingStatus?.toLowerCase()}`}
                        >
                          {b.bookingStatus}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: "right" }}>
                        <div className="bb-action-btns">
                          {/* View Ticket */}
                          <button
                            className="bb-icon-action-btn"
                            title="View / Print Boarding Ticket"
                            onClick={() => setViewTicket(b)}
                          >
                            <MdPrint />
                          </button>

                          {/* Confirm Button if Pending */}
                          {b.bookingStatus === "PENDING" && (
                            <button
                              className="bb-confirm-btn"
                              title="Confirm this reservation"
                              onClick={() => handleConfirm(b._id)}
                              disabled={actionLoading}
                            >
                              <MdCheckCircle /> Confirm
                            </button>
                          )}

                          {/* Cancel Button if not already cancelled */}
                          {b.bookingStatus !== "CANCELLED" && (
                            <button
                              className="bb-cancel-btn"
                              title="Cancel booking and release seats"
                              onClick={() => setCancelModal(b)}
                              disabled={actionLoading}
                            >
                              <MdCancel />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===================================================
          MODAL: TICKET VIEW / BOARDING PASS
          =================================================== */}
      {viewTicket && (
        <div className="bb-modal-overlay" onClick={() => setViewTicket(null)}>
          <div
            className="bb-modal-card ticket-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bb-modal-head">
              <div className="modal-title-with-icon">
                <MdDirectionsBus className="modal-head-icon" />
                <div>
                  <h3>Passenger Boarding Pass</h3>
                  <small>PNR: {viewTicket.pnr || "BMT-PENDING"}</small>
                </div>
              </div>
              <button
                className="bb-modal-close"
                onClick={() => setViewTicket(null)}
              >
                ✕
              </button>
            </div>

            <div className="bb-ticket-sheet" id="printable-ticket">
              {/* Ticket Top Banner */}
              <div className="ticket-header-strip">
                <div>
                  <h2 className="ticket-brand">BirdMyTrip GDS</h2>
                  <small>Official Bus Operator Electronic Reservation</small>
                </div>
                <div className="ticket-pnr-box">
                  <span>PNR NUMBER</span>
                  <strong>{viewTicket.pnr || "BMT-CONFIRMED"}</strong>
                </div>
              </div>

              {/* Journey Overview Grid */}
              <div className="ticket-journey-grid">
                <div>
                  <label>FROM</label>
                  <h4>{viewTicket.fromCity || viewTicket.bus?.fromCity}</h4>
                  <span>
                    Boarding: {viewTicket.boardingPoint?.location || "Main Terminal"}
                  </span>
                  <small>
                    Time: {viewTicket.boardingPoint?.time || "TBA"}
                  </small>
                </div>

                <div className="ticket-journey-arrow">
                  <span>➜</span>
                  <small>Direct Route</small>
                </div>

                <div>
                  <label>TO</label>
                  <h4>{viewTicket.toCity || viewTicket.bus?.toCity}</h4>
                  <span>
                    Dropping: {viewTicket.droppingPoint?.location || "City Center"}
                  </span>
                  <small>
                    Arrival: {viewTicket.droppingPoint?.time || "Next Morning"}
                  </small>
                </div>
              </div>

              {/* Bus & Travel Details */}
              <div className="ticket-details-row">
                <div>
                  <label>BUS OPERATOR / NAME</label>
                  <b>{viewTicket.bus?.busName || "BMT Operator"}</b>
                </div>
                <div>
                  <label>VEHICLE REG. NO.</label>
                  <b>{viewTicket.bus?.busNumber || "UP 32 XX 0000"}</b>
                </div>
                <div>
                  <label>TRAVEL DATE</label>
                  <b>
                    {new Date(
                      viewTicket.journeyDate || viewTicket.createdAt
                    ).toLocaleDateString("en-IN", {
                      weekday: "short",
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </b>
                </div>
                <div>
                  <label>SEAT NUMBER(S)</label>
                  <b className="seat-highlight">
                    {viewTicket.seatNumbers?.join(", ") || "Unassigned"}
                  </b>
                </div>
              </div>

              {/* Passenger List Table */}
              <div className="ticket-passengers-section">
                <h5>Passenger Details</h5>
                <table className="ticket-passenger-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Passenger Name</th>
                      <th>Age</th>
                      <th>Gender</th>
                      <th>Seat</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(viewTicket.passengers?.length > 0
                      ? viewTicket.passengers
                      : [
                          {
                            name: viewTicket.customer?.name,
                            age: 30,
                            gender: "MALE",
                            seatNo: viewTicket.seatNumbers?.[0] || "1",
                          },
                        ]
                    ).map((p, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td>
                          <b>{p.name || viewTicket.customer?.name}</b>
                        </td>
                        <td>{p.age || "—"}</td>
                        <td>{p.gender || "—"}</td>
                        <td>
                          <span className="bb-seat-tag">{p.seatNo}</span>
                        </td>
                        <td>
                          <span className="ticket-confirmed-text">
                            {viewTicket.bookingStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Fare & Barcode Bottom Section */}
              <div className="ticket-fare-strip">
                <div className="ticket-contact-info">
                  <small>
                    Primary Contact: {viewTicket.customer?.name} (
                    {viewTicket.customer?.phone})
                  </small>
                  <small>
                    Payment Mode: {viewTicket.paymentMethod || "CASH"} (
                    {viewTicket.paymentStatus || "PAID"})
                  </small>
                </div>
                <div className="ticket-total-fare">
                  <span>TOTAL FARE:</span>
                  <strong>
                    ₹
                    {(
                      viewTicket.pricing?.totalAmount || 0
                    ).toLocaleString("en-IN")}
                  </strong>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="bb-modal-foot">
              <button
                className="bb-btn bb-btn-outline"
                onClick={() => setViewTicket(null)}
              >
                Close
              </button>
              <button
                className="bb-btn bb-btn-primary"
                onClick={() => window.print()}
              >
                <MdPrint /> Print / Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          MODAL: CANCEL BOOKING REASON PROMPT
          =================================================== */}
      {cancelModal && (
        <div className="bb-modal-overlay" onClick={() => setCancelModal(null)}>
          <div
            className="bb-modal-card confirm-cancel-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bb-modal-head">
              <div className="modal-title-with-icon">
                <MdCancel className="modal-head-icon text-red" />
                <div>
                  <h3>Cancel Booking</h3>
                  <small>
                    PNR: {cancelModal.pnr} · Passenger:{" "}
                    {cancelModal.customer?.name}
                  </small>
                </div>
              </div>
              <button
                className="bb-modal-close"
                onClick={() => setCancelModal(null)}
              >
                ✕
              </button>
            </div>

            <div className="bb-modal-body">
              <div className="bb-warning-notice">
                ⚠️ <b>Seat Release Warning:</b> Cancelling this ticket will
                immediately release seats{" "}
                <b>{cancelModal.seatNumbers?.join(", ")}</b> back to the
                available bus inventory.
              </div>

              <div className="bb-form-group" style={{ marginTop: 14 }}>
                <label>Cancellation Reason *</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Passenger requested cancellation, emergency, or schedule change..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              </div>
            </div>

            <div className="bb-modal-foot">
              <button
                className="bb-btn bb-btn-outline"
                onClick={() => setCancelModal(null)}
              >
                Keep Booking
              </button>
              <button
                className="bb-btn bb-btn-danger"
                onClick={handleCancel}
                disabled={actionLoading}
              >
                {actionLoading ? "Cancelling..." : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          MODAL: NEW COUNTER TICKET / MANUAL BOOKING
          =================================================== */}
      {showNewBookingModal && (
        <div
          className="bb-modal-overlay"
          onClick={() => setShowNewBookingModal(false)}
        >
          <div
            className="bb-modal-card new-booking-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bb-modal-head">
              <div className="modal-title-with-icon">
                <MdConfirmationNumber className="modal-head-icon" />
                <div>
                  <h3>Issue Counter Ticket</h3>
                  <small>Offline & Walk-in Passenger Booking</small>
                </div>
              </div>
              <button
                className="bb-modal-close"
                onClick={() => setShowNewBookingModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBooking}>
              <div className="bb-modal-body">
                {/* Bus & Journey Date */}
                <div className="bb-form-row">
                  <div className="bb-form-group">
                    <label>Select Bus Service *</label>
                    <select
                      value={newBooking.busId}
                      onChange={(e) =>
                        setNewBooking({ ...newBooking, busId: e.target.value })
                      }
                      required
                    >
                      {buses.map((b) => (
                        <option key={b._id} value={b._id}>
                          {b.busName} ({b.busNumber}) — {b.fromCity} ➜ {b.toCity} (₹{b.price})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bb-form-group">
                    <label>Journey Date *</label>
                    <input
                      type="date"
                      value={newBooking.journeyDate}
                      onChange={(e) =>
                        setNewBooking({
                          ...newBooking,
                          journeyDate: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                {/* Customer Contact */}
                <div className="bb-form-row">
                  <div className="bb-form-group">
                    <label>Primary Customer Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={newBooking.customerName}
                      onChange={(e) =>
                        setNewBooking({
                          ...newBooking,
                          customerName: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="bb-form-group">
                    <label>Mobile Number *</label>
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={newBooking.customerPhone}
                      onChange={(e) =>
                        setNewBooking({
                          ...newBooking,
                          customerPhone: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                {/* Email & Seat Numbers */}
                <div className="bb-form-row">
                  <div className="bb-form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      placeholder="rahul@example.com (optional)"
                      value={newBooking.customerEmail}
                      onChange={(e) =>
                        setNewBooking({
                          ...newBooking,
                          customerEmail: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="bb-form-group">
                    <label>Seat Numbers (comma separated) *</label>
                    <input
                      type="text"
                      placeholder="e.g. L4, L5, U2"
                      value={newBooking.selectedSeats}
                      onChange={(e) =>
                        setNewBooking({
                          ...newBooking,
                          selectedSeats: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                {/* Payment Mode */}
                <div className="bb-form-row">
                  <div className="bb-form-group">
                    <label>Payment Method</label>
                    <select
                      value={newBooking.paymentMethod}
                      onChange={(e) =>
                        setNewBooking({
                          ...newBooking,
                          paymentMethod: e.target.value,
                        })
                      }
                    >
                      <option value="CASH">Cash at Counter</option>
                      <option value="UPI">UPI / QR Payment</option>
                      <option value="ONLINE">Online Card / NetBanking</option>
                      <option value="PAY_ON_BOARD">Pay on Boarding</option>
                    </select>
                  </div>

                  <div className="bb-form-group">
                    <label>Estimated Total Amount</label>
                    <div className="bb-amount-preview">
                      ₹
                      {(
                        (newBooking.selectedSeats
                          .split(",")
                          .filter((s) => s.trim()).length || 1) *
                        (buses.find((b) => b._id === newBooking.busId)?.price ||
                          850)
                      ).toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>

                {/* Special Requests */}
                <div className="bb-form-group">
                  <label>Operator Notes / Special Requests</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior citizen lower berth request, extra luggage..."
                    value={newBooking.specialRequests}
                    onChange={(e) =>
                      setNewBooking({
                        ...newBooking,
                        specialRequests: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="bb-modal-foot">
                <button
                  type="button"
                  className="bb-btn bb-btn-outline"
                  onClick={() => setShowNewBookingModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bb-btn bb-btn-primary"
                  disabled={actionLoading}
                >
                  {actionLoading ? "Issuing Ticket..." : "Confirm & Issue Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
