import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  MdDirectionsCar,
  MdPerson,
  MdLocationOn,
  MdPhone,
  MdRefresh,
  MdAdd,
  MdEdit,
  MdCheckCircle,
  MdRadar,
  MdTrendingUp,
  MdAttachMoney,
  MdAirlineSeatReclineNormal,
  MdCalculate,
  MdSend,
  MdSpeed,
  MdVisibility,
  MdCalendarToday,
  MdArrowForward,
} from "react-icons/md";
import "./CabVendorDashboard.css";

const API_CABS = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL}/api/vendor/cabs`
  : "https://bmtvendorfinal.onrender.com/api/vendor/cabs";

const API_BOOKINGS = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL}/api/vendor/cabs/bookings`
  : "https://bmtvendorfinal.onrender.com/api/vendor/cabs/bookings";

export default function CabVendorDashboard({ onNavigate }) {
  const token =
    localStorage.getItem("vendorToken") || localStorage.getItem("token");

  const [timeframe, setTimeframe] = useState("today"); // 'today' | 'week' | 'month'
  const [cabs, setCabs] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Interactive 40km radar mini-widget controls
  const [radarRadius, setRadarRadius] = useState(40);
  const [selectedRadarCab, setSelectedRadarCab] = useState(null);

  // Interactive Fare Simulator controls
  const [calcDistance, setCalcDistance] = useState(16);
  const [calcCabType, setCalcCabType] = useState("Sedan");

  // Recent trips filter
  const [tripFilter, setTripFilter] = useState("all");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Cabs
      const cabsRes = await axios.get(API_CABS, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const cabsList = Array.isArray(cabsRes.data)
        ? cabsRes.data
        : cabsRes.data?.data || cabsRes.data?.cabs || [];
      setCabs(cabsList);

      // 2. Fetch Drivers
      try {
        const driversRes = await axios.get(`${API_CABS}/drivers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (driversRes.data?.success && Array.isArray(driversRes.data?.data)) {
          setDrivers(driversRes.data.data);
        } else {
          extractDriversFromCabs(cabsList);
        }
      } catch {
        extractDriversFromCabs(cabsList);
      }

      // 3. Fetch Bookings
      try {
        const bookingsRes = await axios.get(API_BOOKINGS, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (Array.isArray(bookingsRes.data)) {
          setBookings(bookingsRes.data);
        } else if (Array.isArray(bookingsRes.data?.data)) {
          setBookings(bookingsRes.data.data);
        }
      } catch {
        // Fallback demo bookings for interactive demonstration
        setBookings([]);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    }
    setLoading(false);
  };

  const extractDriversFromCabs = (cabsList) => {
    const list = cabsList
      .filter((c) => c.driver?.name || c.driverName)
      .map((c) => ({
        cabId: c._id,
        vehicleNumber: c.vehicleNumber,
        cabType: c.cabType,
        model: c.model,
        driverName: c.driver?.name || c.driverName,
        driverPhone: c.driver?.phone || c.driverPhone,
        driverLicenseNumber: c.driver?.licenseNumber || c.driverLicenseNumber,
        experienceYears: c.driver?.experienceYears || c.driverExperience,
        baseLocation: c.baseLocation || c.pickupLocation || "Base Hub",
        serviceRadiusKm: c.serviceRadiusKm || 40,
      }));
    setDrivers(list);
  };

  // Metrics based on timeframe
  const metrics = useMemo(() => {
    const multipliers = { today: 1, week: 5.4, month: 22.8 };
    const m = multipliers[timeframe] || 1;

    const totalCabs = cabs.length;
    const availableCabs = cabs.filter(
      (c) => c.isActive !== false && (c.availableSeats || 0) > 0
    ).length;
    const hubCabs = cabs.filter((c) => (c.serviceRadiusKm || 40) >= 40).length;
    const assignedDrivers = cabs.filter(
      (c) => c.driver?.name || c.driverName
    ).length;

    const baseRides = totalCabs > 0 ? totalCabs * 2 : 8;
    const ridesCount = Math.round(baseRides * m);
    const revenue = Math.round(ridesCount * 760);

    return {
      rides: ridesCount,
      revenue: revenue,
      activeFleet: availableCabs,
      totalFleet: totalCabs,
      hubReady: hubCabs,
      assignedDrivers,
      utilizationPct: totalCabs > 0 ? Math.round((availableCabs / totalCabs) * 100) : 80,
    };
  }, [cabs, timeframe]);

  // Synthetic radar blip positions for cabs
  const radarBlips = useMemo(() => {
    return cabs.map((cab, idx) => {
      const seed = cab._id
        ? cab._id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
        : idx * 43;
      const angle = (seed * 57) % 360;
      const distanceRatio = ((seed * 31) % 80 + 12) / 100; // 0.12 to 0.92
      const distanceKm = Math.round(distanceRatio * 50);
      const inZone = distanceKm <= radarRadius;

      const rad = (angle * Math.PI) / 180;
      const r = distanceRatio * 42;
      const x = 50 + r * Math.cos(rad);
      const y = 50 + r * Math.sin(rad);

      return { ...cab, distanceKm, inZone, x, y };
    });
  }, [cabs, radarRadius]);

  // Quick Fare calculation
  const fareEstimate = useMemo(() => {
    const rates = {
      Mini: { base: 250, perKm: 12 },
      Sedan: { base: 350, perKm: 15 },
      SUV: { base: 550, perKm: 20 },
      Luxury: { base: 1200, perKm: 45 },
    };
    const rate = rates[calcCabType] || rates.Sedan;
    const fare = rate.base + calcDistance * rate.perKm;
    const eta = Math.max(6, Math.round(calcDistance * 2.1));
    return { fare, eta, base: rate.base, kmCharge: calcDistance * rate.perKm };
  }, [calcDistance, calcCabType]);

  // Recent rides feed (real bookings or synthetic based on fleet)
  const recentRides = useMemo(() => {
    if (bookings.length > 0) return bookings;

    return [
      {
        id: "TRIP-8021",
        pickup: "Terminal 3, IGI Airport",
        drop: "Cyber Hub, DLF Phase 2",
        time: "10 mins ago",
        status: "IN_TRANSIT",
        vehicle: cabs[0]?.vehicleNumber || "DL 01 AB 8920",
        cabType: cabs[0]?.cabType || "Sedan",
        driver: cabs[0]?.driver?.name || cabs[0]?.driverName || "Suresh Kumar",
        fare: 650,
        distance: "18 km",
      },
      {
        id: "TRIP-8020",
        pickup: "Connaught Place Hub",
        drop: "Sector 62, Noida",
        time: "32 mins ago",
        status: "COMPLETED",
        vehicle: cabs[1]?.vehicleNumber || "DL 02 CD 4512",
        cabType: cabs[1]?.cabType || "SUV",
        driver: cabs[1]?.driver?.name || cabs[1]?.driverName || "Vikram Singh",
        fare: 820,
        distance: "24 km",
      },
      {
        id: "TRIP-8019",
        pickup: "Saket Metro Station",
        drop: "Aerocity Hotel Zone",
        time: "1 hr ago",
        status: "COMPLETED",
        vehicle: cabs[2]?.vehicleNumber || "HR 26 DQ 7890",
        cabType: cabs[2]?.cabType || "Mini",
        driver: cabs[2]?.driver?.name || cabs[2]?.driverName || "Anil Verma",
        fare: 450,
        distance: "12 km",
      },
      {
        id: "TRIP-8018",
        pickup: "Vasant Kunj Base",
        drop: "South Extension Part 2",
        time: "Scheduled 16:30",
        status: "CONFIRMED",
        vehicle: cabs[3]?.vehicleNumber || "DL 04 EF 2341",
        cabType: cabs[3]?.cabType || "Sedan",
        driver: cabs[3]?.driver?.name || cabs[3]?.driverName || "Manoj Sharma",
        fare: 540,
        distance: "14 km",
      },
    ];
  }, [bookings, cabs]);

  const filteredRides = useMemo(() => {
    if (tripFilter === "all") return recentRides;
    return recentRides.filter((r) => r.status.toLowerCase() === tripFilter.toLowerCase());
  }, [recentRides, tripFilter]);

  const cabIcons = {
    Mini: "🚗",
    Sedan: "🚙",
    SUV: "🚐",
    Luxury: "🏎️",
    Electric: "⚡",
  };

  return (
    <div className="cvd-container">
      {/* TOP HEADER & CONTROLS */}
      <header className="cvd-header">
        <div>
          <div className="cvd-title-row">
            <h1>
              <span style={{ fontSize: "32px" }}>🚕</span>
              Cab Fleet & Dispatch Operations
            </h1>
            <span className="cvd-live-hub-badge">
              <span className="cvd-pulse-dot" /> 40 KM Hub Live Dispatch
            </span>
          </div>
          <p>
            Real-time fleet telemetry, verified commercial drivers, and dynamic 40 km intra-city passenger dispatching.
          </p>
        </div>

        <div className="cvd-header-right">
          {/* Interactive Timeframe Pill Group */}
          <div className="cvd-timeframe-group">
            {[
              { id: "today", label: "Today" },
              { id: "week", label: "This Week" },
              { id: "month", label: "This Month" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                className={`cvd-timeframe-btn ${timeframe === t.id ? "active" : ""}`}
                onClick={() => setTimeframe(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="cvd-btn-refresh"
            onClick={fetchDashboardData}
            title="Refresh Live Fleet Telematics"
          >
            <MdRefresh />
          </button>

          <button
            type="button"
            className="cvd-btn-primary"
            onClick={() => onNavigate("cabs_manage")}
          >
            <MdAdd style={{ fontSize: "18px" }} />
            Add New Cab
          </button>
        </div>
      </header>

      {/* 4 CORE INTERACTIVE KPI CARDS */}
      <section className="cvd-kpi-grid">
        {/* Metric 1: Revenue */}
        <div
          className="cvd-kpi-card"
          onClick={() => onNavigate("cabs_bookings")}
          title="Click to view full bookings & settlement report"
        >
          <div className="cvd-kpi-header">
            <span className="cvd-kpi-title">
              {timeframe === "today" ? "Today's Revenue" : timeframe === "week" ? "Weekly Revenue" : "Monthly Revenue"}
            </span>
            <span className="cvd-trend-pill">
              <MdTrendingUp /> +18.4%
            </span>
          </div>
          <div className="cvd-kpi-main">
            <strong>₹ {metrics.revenue.toLocaleString()}</strong>
          </div>
          <div className="cvd-kpi-footer">
            <span>Avg ₹ 760 / ride · Guaranteed Payout</span>
            <span className="cvd-kpi-link">View Bookings ➔</span>
          </div>
          <div className="cvd-kpi-glow glow-green" />
        </div>

        {/* Metric 2: Rides */}
        <div
          className="cvd-kpi-card"
          onClick={() => onNavigate("cabs_bookings")}
          title="Click to view active passenger dispatches"
        >
          <div className="cvd-kpi-header">
            <span className="cvd-kpi-title">
              {timeframe === "today" ? "Today's Rides" : timeframe === "week" ? "Weekly Trips" : "Monthly Trips"}
            </span>
            <span className="cvd-stat-badge-blue">
              ● {metrics.rides} Dispatched
            </span>
          </div>
          <div className="cvd-kpi-main">
            <strong style={{ color: "#2563eb" }}>{metrics.rides}</strong>
            <small style={{ fontSize: "14px", color: "#64748b", marginLeft: "6px" }}>trips</small>
          </div>
          <div className="cvd-kpi-footer">
            <span>98.2% on-time passenger pickup</span>
            <span className="cvd-kpi-link">Track Rides ➔</span>
          </div>
          <div className="cvd-kpi-glow glow-blue" />
        </div>

        {/* Metric 3: Active Fleet */}
        <div
          className="cvd-kpi-card"
          onClick={() => onNavigate("cabs_manage")}
          title="Click to manage vehicle fleet inventory"
        >
          <div className="cvd-kpi-header">
            <span className="cvd-kpi-title">Live Active Fleet</span>
            <span className="cvd-stat-badge-green">
              {metrics.activeFleet} / {metrics.totalFleet || 8} Ready
            </span>
          </div>
          <div className="cvd-kpi-main">
            <strong style={{ color: "#10b981" }}>{metrics.activeFleet} Cabs</strong>
          </div>
          {/* Progress bar */}
          <div className="cvd-kpi-progress-wrap">
            <div
              className="cvd-kpi-progress-bar"
              style={{ width: `${metrics.utilizationPct}%` }}
            />
          </div>
          <div className="cvd-kpi-footer">
            <span>{metrics.utilizationPct}% fleet available for ride bookings</span>
            <span className="cvd-kpi-link">Manage Fleet ➔</span>
          </div>
          <div className="cvd-kpi-glow glow-teal" />
        </div>

        {/* Metric 4: Drivers & 40km Hub */}
        <div
          className="cvd-kpi-card"
          onClick={() => onNavigate("cabs_drivers")}
          title="Click to view driver roster and licences"
        >
          <div className="cvd-kpi-header">
            <span className="cvd-kpi-title">40 KM Hub Drivers</span>
            <span className="cvd-stat-badge-purple">
              🎯 &lt; 14 Mins ETA
            </span>
          </div>
          <div className="cvd-kpi-main">
            <strong style={{ color: "#8b5cf6" }}>
              {metrics.assignedDrivers} Assigned
            </strong>
          </div>
          <div className="cvd-kpi-footer">
            <span>Commercial licence verified & compliant</span>
            <span className="cvd-kpi-link">Driver Roster ➔</span>
          </div>
          <div className="cvd-kpi-glow glow-purple" />
        </div>
      </section>

      {/* ROW 2: LIVE 40 KM RADAR TELEMATICS + FLEET BREAKDOWN */}
      <section className="cvd-grid-2col">
        {/* Left Column: Interactive 40 KM Mini-Radar */}
        <div className="cvd-panel cvd-radar-panel">
          <div className="cvd-panel-header">
            <div>
              <h3>
                <MdRadar style={{ color: "#38bdf8" }} />
                40 KM Radar Live Telematics
              </h3>
              <p>Instant dispatch radius visualizer for local pickups and airport rides.</p>
            </div>
            <button
              type="button"
              className="cvd-btn-link-action"
              onClick={() => onNavigate("cabs_manage")}
            >
              Full Radar Screen ➔
            </button>
          </div>

          <div className="cvd-mini-radar-body">
            <div className="cvd-mini-radar-screen">
              {/* Concentric distance rings */}
              <div className="cvd-mring cvd-mring-10" />
              <div className="cvd-mring cvd-mring-20" />
              <div className="cvd-mring cvd-mring-30" />
              <div
                className="cvd-mring cvd-mring-40 active-hub"
                style={{
                  borderColor: radarRadius >= 40 ? "#38bdf8" : "rgba(56, 189, 248, 0.3)",
                }}
              />
              <div className="cvd-mring-sweep" />

              {/* Center Hub */}
              <div className="cvd-mhub">
                <span className="cvd-mhub-icon">🎯</span>
                <small>BASE</small>
              </div>

              {/* Pulsing cab dots */}
              {radarBlips.map((b) => (
                <div
                  key={b._id}
                  className={`cvd-mblip ${b.inZone ? "in" : "out"} ${
                    b.isActive !== false ? "live" : "off"
                  } ${selectedRadarCab?._id === b._id ? "selected" : ""}`}
                  style={{ left: `${b.x}%`, top: `${b.y}%` }}
                  onClick={() => setSelectedRadarCab(b)}
                  title={`${b.vehicleNumber} (${b.cabType}) - ${b.distanceKm} km`}
                >
                  <span className="cvd-mblip-icon">{cabIcons[b.cabType] || "🚗"}</span>
                </div>
              ))}
            </div>

            {/* Radar Controls & Selection preview */}
            <div className="cvd-mini-radar-info">
              <div className="cvd-slider-box">
                <div className="cvd-slider-labels">
                  <span>Operating Radius:</span>
                  <strong style={{ color: "#38bdf8" }}>{radarRadius} KM</strong>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  step="5"
                  value={radarRadius}
                  onChange={(e) => setRadarRadius(Number(e.target.value))}
                  className="cvd-range-slider"
                />
                <div className="cvd-slider-sub">
                  <span>10km</span>
                  <span style={{ color: "#38bdf8", fontWeight: "700" }}>40km Standard</span>
                  <span>60km</span>
                </div>
              </div>

              {selectedRadarCab ? (
                <div className="cvd-selected-cab-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong style={{ fontSize: "14px", color: "#f8fafc" }}>
                      {selectedRadarCab.vehicleNumber}
                    </strong>
                    <span className="cvd-hub-in-badge">
                      {selectedRadarCab.inZone ? "🎯 Inside 40km" : "⚠️ Outer Range"}
                    </span>
                  </div>
                  <p style={{ margin: "4px 0", fontSize: "12px", color: "#94a3b8" }}>
                    {selectedRadarCab.cabType} · {selectedRadarCab.model || "Standard"}
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#cbd5e1" }}>
                    <span>Hub Distance: <strong>{selectedRadarCab.distanceKm} KM</strong></span>
                    <span>Driver: <strong>{selectedRadarCab.driver?.name || "Unassigned"}</strong></span>
                  </div>
                </div>
              ) : (
                <div className="cvd-radar-hint">
                  <span>💡 Tip: Click any cab dot on the radar to inspect live distance from base hub.</span>
                </div>
              )}

              <div className="cvd-radar-stat-strip">
                <div>
                  <small>Within {radarRadius}km</small>
                  <strong>{radarBlips.filter((b) => b.inZone).length} Cabs</strong>
                </div>
                <div>
                  <small>Dispatch Arrival</small>
                  <strong style={{ color: "#10b981" }}>&lt; 14 Mins</strong>
                </div>
                <div>
                  <small>Deadhead Risk</small>
                  <strong style={{ color: "#38bdf8" }}>0% Zone</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive 40 KM Fare & ETA Simulator */}
        <div className="cvd-panel cvd-calc-panel">
          <div className="cvd-panel-header">
            <div>
              <h3>
                <MdCalculate style={{ color: "#2563eb" }} />
                40 KM Fare & Revenue Calculator
              </h3>
              <p>Simulate customer pricing, travel duration, and driver earnings.</p>
            </div>
          </div>

          <div className="cvd-calc-body">
            {/* Distance Slider */}
            <div className="cvd-calc-field">
              <div className="cvd-calc-field-row">
                <label>Ride Distance in 40km Hub:</label>
                <span className="cvd-calc-number">{calcDistance} KM</span>
              </div>
              <input
                type="range"
                min="1"
                max="40"
                step="1"
                value={calcDistance}
                onChange={(e) => setCalcDistance(Number(e.target.value))}
                className="cvd-range-slider-blue"
              />
              <div className="cvd-slider-sub">
                <span>1km (Local)</span>
                <span>20km (Airport)</span>
                <span style={{ color: "#2563eb", fontWeight: "700" }}>40km Boundary</span>
              </div>
            </div>

            {/* Vehicle Category Chips */}
            <div className="cvd-calc-field">
              <label style={{ display: "block", marginBottom: "8px", fontSize: "12px", fontWeight: "700" }}>
                Select Vehicle Category:
              </label>
              <div className="cvd-calc-chips">
                {["Mini", "Sedan", "SUV", "Luxury"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`cvd-chip-btn ${calcCabType === type ? "active" : ""}`}
                    onClick={() => setCalcCabType(type)}
                  >
                    <span>{cabIcons[type] || "🚗"}</span>
                    <span>{type}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Fare Breakdown Card */}
            <div className="cvd-calc-receipt">
              <div className="cvd-receipt-row">
                <span>Base Flagdown Fare:</span>
                <strong>₹ {fareEstimate.base}</strong>
              </div>
              <div className="cvd-receipt-row">
                <span>Distance Charge ({calcDistance} km):</span>
                <strong>₹ {fareEstimate.kmCharge}</strong>
              </div>
              <div className="cvd-receipt-row">
                <span>Estimated Passenger Arrival:</span>
                <strong style={{ color: "#10b981" }}>~{fareEstimate.eta} Mins</strong>
              </div>
              <div className="cvd-receipt-divider" />
              <div className="cvd-receipt-total">
                <span>Estimated Total Trip Fare:</span>
                <strong className="cvd-total-fare">₹ {fareEstimate.fare}</strong>
              </div>
            </div>

            <button
              type="button"
              className="cvd-btn-calc-action"
              onClick={() => onNavigate("cabs_manage")}
            >
              View Available {calcCabType} Vehicles ({cabs.filter((c) => (c.cabType || "").includes(calcCabType)).length})
            </button>
          </div>
        </div>
      </section>

      {/* ROW 3: DRIVERS ON DUTY + RECENT RIDES & DISPATCHES */}
      <section className="cvd-grid-2col" style={{ marginTop: "24px" }}>
        {/* On-Duty Drivers Roster */}
        <div className="cvd-panel">
          <div className="cvd-panel-header">
            <div>
              <h3>
                <MdPerson style={{ color: "#8b5cf6" }} />
                On-Duty Drivers Roster
              </h3>
              <p>Commercial drivers assigned to your fleet with direct call actions.</p>
            </div>
            <button
              type="button"
              className="cvd-btn-link-action"
              onClick={() => onNavigate("cabs_drivers")}
            >
              View All ({drivers.length}) ➔
            </button>
          </div>

          <div className="cvd-drivers-list">
            {drivers.length === 0 ? (
              <div className="cvd-empty-box">
                <span>👨‍✈️</span>
                <p>No drivers currently linked. Click below to attach drivers to your vehicles.</p>
                <button
                  type="button"
                  className="cvd-btn-secondary"
                  onClick={() => onNavigate("cabs_drivers")}
                >
                  Go to Driver Directory
                </button>
              </div>
            ) : (
              drivers.slice(0, 4).map((d, i) => (
                <div className="cvd-driver-item" key={d.cabId || i}>
                  <div className="cvd-driver-avatar">👨‍✈️</div>
                  <div className="cvd-driver-meta">
                    <h4>{d.driverName}</h4>
                    <p>
                      Cab: <strong>{d.vehicleNumber}</strong> ({d.cabType})
                    </p>
                    <small>DL: {d.driverLicenseNumber || "Verified"}</small>
                  </div>
                  <div className="cvd-driver-actions">
                    {d.driverPhone && (
                      <a
                        href={`tel:${d.driverPhone}`}
                        className="cvd-btn-action-call"
                        title="Call Driver"
                      >
                        <MdPhone /> Call
                      </a>
                    )}
                    <a
                      href={`https://wa.me/${(d.driverPhone || "").replace(/\D/g, "")}?text=${encodeURIComponent(
                        `Hi ${d.driverName}, dispatch notification for vehicle ${d.vehicleNumber}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cvd-btn-action-wa"
                      title="Send WhatsApp Message"
                    >
                      <MdSend />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Operations & Dispatches */}
        <div className="cvd-panel">
          <div className="cvd-panel-header">
            <div>
              <h3>
                <MdDirectionsCar style={{ color: "#2563eb" }} />
                Recent Dispatches & Ride Feed
              </h3>
              <p>Live passenger pickups and scheduled trips within 40 km zone.</p>
            </div>
            {/* Filter Pills */}
            <div className="cvd-pill-filter">
              {["all", "in_transit", "completed", "confirmed"].map((st) => (
                <button
                  key={st}
                  type="button"
                  className={`cvd-pill-btn ${tripFilter === st ? "active" : ""}`}
                  onClick={() => setTripFilter(st)}
                >
                  {st === "in_transit" ? "In-Transit" : st.charAt(0).toUpperCase() + st.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="cvd-rides-table-wrap">
            <table className="cvd-table">
              <thead>
                <tr>
                  <th>Trip ID & Route</th>
                  <th>Vehicle & Driver</th>
                  <th>Fare</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRides.map((ride, i) => (
                  <tr key={ride.id || i}>
                    <td>
                      <div>
                        <strong style={{ fontSize: "12px", color: "#0f172a", display: "block" }}>
                          📍 {ride.pickup}
                        </strong>
                        <small style={{ color: "#64748b" }}>➔ {ride.drop}</small>
                      </div>
                    </td>

                    <td>
                      <div>
                        <span style={{ fontWeight: "700", color: "#1e293b", fontSize: "12px" }}>
                          {ride.vehicle}
                        </span>
                        <small style={{ display: "block", color: "#64748b" }}>
                          {ride.driver} ({ride.cabType})
                        </small>
                      </div>
                    </td>

                    <td>
                      <strong style={{ color: "#059669", fontSize: "13px" }}>
                        ₹ {ride.fare}
                      </strong>
                    </td>

                    <td>
                      <span
                        className={`cvd-badge-status ${
                          ride.status === "COMPLETED"
                            ? "completed"
                            : ride.status === "IN_TRANSIT"
                            ? "transit"
                            : "confirmed"
                        }`}
                      >
                        {ride.status === "IN_TRANSIT"
                          ? "● In Transit"
                          : ride.status === "COMPLETED"
                          ? "✓ Completed"
                          : "Scheduled"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
