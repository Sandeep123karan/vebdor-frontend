import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  MdDirectionsCar,
  MdPerson,
  MdLocationOn,
  MdPhone,
  MdSearch,
  MdFilterList,
  MdAdd,
  MdEdit,
  MdDelete,
  MdGridView,
  MdViewList,
  MdRefresh,
  MdCheckCircle,
  MdCancel,
  MdClose,
  MdSpeed,
  MdAirlineSeatReclineNormal,
  MdAcUnit,
  MdLocalGasStation,
  MdRadar,
  MdVisibility,
  MdPlayArrow,
  MdPause,
  MdCalculate,
  MdVerified,
  MdAssignmentInd,
  MdSend,
  MdMyLocation,
  MdMap,
  MdSwapHoriz,
} from "react-icons/md";
import "./VendorCabs.css";

const API = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL}/api/vendor/cabs`
  : "https://bmtvendorfinal.onrender.com/api/vendor/cabs";

export default function VendorCabs() {
  const token =
    localStorage.getItem("vendorToken") || localStorage.getItem("token");

  // Main UI Mode: 'fleet' | 'radar' | 'estimator'
  const [activeMainTab, setActiveMainTab] = useState("fleet");

  const [cabs, setCabs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [viewMode, setViewMode] = useState("cards"); // 'cards' | 'table'
  const [sortBy, setSortBy] = useState("default");

  // Modal / Form state (Add / Edit)
  const [showModal, setShowModal] = useState(false);
  const [modalTab, setModalTab] = useState("vehicle"); // 'vehicle' | 'driver' | 'location' | 'pricing'
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Quick view dossier drawer
  const [selectedCab, setSelectedCab] = useState(null);

  // Quick Driver Reassign Modal
  const [driverModalCab, setDriverModalCab] = useState(null);
  const [driverForm, setDriverForm] = useState({
    name: "",
    phone: "",
    alternatePhone: "",
    licenseNumber: "",
    experienceYears: "",
  });
  const [savingDriver, setSavingDriver] = useState(false);

  // Images state
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [galleryPreview, setGalleryPreview] = useState([]);

  // Interactive 40km radar controls
  const [radarRadius, setRadarRadius] = useState(40);
  const [radarSweepActive, setRadarSweepActive] = useState(true);
  const [selectedRadarCab, setSelectedRadarCab] = useState(null);

  // Interactive Fare Estimator state
  const [estimatorDistance, setEstimatorDistance] = useState(18);
  const [estimatorCabType, setEstimatorCabType] = useState("Sedan");

  const initialForm = {
    // 1. Vehicle Details
    cabType: "Sedan",
    vehicleNumber: "",
    brand: "",
    model: "",
    modelYear: new Date().getFullYear().toString(),
    vehicleColor: "",
    totalSeats: "4",
    availableSeats: "4",
    acType: "AC",
    fuelType: "Petrol",

    // 2. Driver Details
    driverName: "",
    driverPhone: "",
    driverAlternatePhone: "",
    driverLicenseNumber: "",
    driverExperience: "",
    isOwnerDriver: false,

    // 3. Location & 40km Coverage
    baseLocation: "",
    pickupLocation: "",
    fromCity: "",
    toCity: "",
    serviceRadiusKm: "40",
    operatingArea: "",

    // 4. Pricing & Schedule
    price: "",
    pricePerKm: "14",
    pickupTime: "09:00",
  };

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    fetchCabs();
  }, []);

  const fetchCabs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const list = Array.isArray(res.data)
        ? res.data
        : res.data?.data || res.data?.cabs || [];
      setCabs(list);
    } catch (error) {
      console.error("Error fetching cabs:", error);
    }
    setLoading(false);
  };

  // Live filtering & sorting
  const filteredCabs = useMemo(() => {
    let result = cabs.filter((cab) => {
      const vNum = (cab.vehicleNumber || "").toLowerCase();
      const driver = (cab.driver?.name || cab.driverName || "").toLowerCase();
      const city = (cab.fromCity || cab.baseLocation || "").toLowerCase();
      const type = (cab.cabType || "").toLowerCase();
      const brand = (cab.brand || "").toLowerCase();
      const model = (cab.model || "").toLowerCase();
      const q = searchQuery.toLowerCase().trim();

      const matchesQuery =
        !q ||
        vNum.includes(q) ||
        driver.includes(q) ||
        city.includes(q) ||
        type.includes(q) ||
        brand.includes(q) ||
        model.includes(q);

      if (!matchesQuery) return false;

      if (filterType === "available")
        return cab.isActive !== false && (cab.availableSeats || 0) > 0;
      if (filterType === "40km")
        return (cab.serviceRadiusKm || 40) >= 40;
      if (filterType === "driver")
        return Boolean(cab.driver?.name || cab.driverName);
      if (filterType === "sedan") return type.includes("sedan");
      if (filterType === "suv") return type.includes("suv");
      if (filterType === "mini") return type.includes("mini");

      return true;
    });

    if (sortBy === "price_asc") {
      result.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    } else if (sortBy === "price_desc") {
      result.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    } else if (sortBy === "seats") {
      result.sort((a, b) => (Number(b.availableSeats) || 0) - (Number(a.availableSeats) || 0));
    }

    return result;
  }, [cabs, searchQuery, filterType, sortBy]);

  // Handle KPI card click as interactive instant filter
  const handleKpiClick = (type) => {
    if (filterType === type) {
      setFilterType("all"); // Toggle off
    } else {
      setFilterType(type);
    }
  };

  // Image handlers
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryAdd = (e) => {
    const files = Array.from(e.target.files || []);
    if (gallery.length + files.length > 10) {
      alert("Maximum 10 gallery images allowed");
      return;
    }
    setGallery((prev) => [...prev, ...files]);
    const previews = files.map((f) => URL.createObjectURL(f));
    setGalleryPreview((prev) => [...prev, ...previews]);
  };

  const removeGalleryImage = (index) => {
    setGallery((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreview((prev) => prev.filter((_, i) => i !== index));
  };

  // Edit cab modal opener
  const editCab = (cab) => {
    setForm({
      cabType: cab.cabType || "Sedan",
      vehicleNumber: cab.vehicleNumber || "",
      brand: cab.brand || "",
      model: cab.model || "",
      modelYear: cab.modelYear ? String(cab.modelYear) : "",
      vehicleColor: cab.vehicleColor || "",
      totalSeats: cab.totalSeats ? String(cab.totalSeats) : "4",
      availableSeats: cab.availableSeats ? String(cab.availableSeats) : "4",
      acType: cab.acType || "AC",
      fuelType: cab.fuelType || "Petrol",

      // Driver
      driverName: cab.driver?.name || cab.driverName || "",
      driverPhone: cab.driver?.phone || cab.driverPhone || "",
      driverAlternatePhone:
        cab.driver?.alternatePhone || cab.driverAlternatePhone || "",
      driverLicenseNumber:
        cab.driver?.licenseNumber || cab.driverLicenseNumber || "",
      driverExperience: cab.driver?.experienceYears
        ? String(cab.driver?.experienceYears)
        : cab.driverExperience
        ? String(cab.driverExperience)
        : "",
      isOwnerDriver: false,

      // Location
      baseLocation: cab.baseLocation || cab.pickupLocation || "",
      pickupLocation: cab.pickupLocation || cab.baseLocation || "",
      fromCity: cab.fromCity || "",
      toCity: cab.toCity || "",
      serviceRadiusKm: cab.serviceRadiusKm ? String(cab.serviceRadiusKm) : "40",
      operatingArea: cab.operatingArea || "",

      // Pricing
      price: cab.price ? String(cab.price) : "",
      pricePerKm: cab.pricePerKm ? String(cab.pricePerKm) : "14",
      pickupTime: cab.pickupTime || "09:00",
    });

    setImagePreview(cab.image || null);
    setImage(null);
    setGallery([]);
    setGalleryPreview(cab.gallery || []);

    setEditId(cab._id);
    setModalTab("vehicle");
    setShowModal(true);
  };

  // 1-Click Interactive Status Toggle
  const toggleStatus = async (id, currentStatus) => {
    try {
      // Optimistic update for instant UI feedback
      setCabs((prev) =>
        prev.map((c) => (c._id === id ? { ...c, isActive: !c.isActive } : c))
      );
      await axios.patch(
        `${API}/${id}/toggle-status`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Error toggling status:", error);
      fetchCabs(); // rollback on error
    }
  };

  // Interactive Quick Seat Stepper (+ / -)
  const adjustSeats = async (cab, delta, e) => {
    e?.stopPropagation();
    const current = cab.availableSeats !== undefined ? Number(cab.availableSeats) : 4;
    const max = Number(cab.totalSeats) || 4;
    const newSeats = Math.max(0, Math.min(max, current + delta));

    if (newSeats === current) return;

    // Optimistic UI update
    setCabs((prev) =>
      prev.map((c) => (c._id === cab._id ? { ...c, availableSeats: newSeats } : c))
    );

    try {
      await axios.put(
        `${API}/${cab._id}`,
        { availableSeats: newSeats },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Failed to update seats:", err);
      fetchCabs();
    }
  };

  // Quick Driver Reassign Handler
  const openDriverModal = (cab, e) => {
    e?.stopPropagation();
    setDriverModalCab(cab);
    setDriverForm({
      name: cab.driver?.name || cab.driverName || "",
      phone: cab.driver?.phone || cab.driverPhone || "",
      alternatePhone: cab.driver?.alternatePhone || cab.driverAlternatePhone || "",
      licenseNumber: cab.driver?.licenseNumber || cab.driverLicenseNumber || "",
      experienceYears: cab.driver?.experienceYears
        ? String(cab.driver.experienceYears)
        : cab.driverExperience || "",
    });
  };

  const handleSaveDriver = async (e) => {
    e.preventDefault();
    if (!driverModalCab) return;
    setSavingDriver(true);

    try {
      const updateData = {
        driver: {
          name: driverForm.name,
          phone: driverForm.phone,
          alternatePhone: driverForm.alternatePhone,
          licenseNumber: driverForm.licenseNumber,
          experienceYears: Number(driverForm.experienceYears) || 0,
        },
        driverName: driverForm.name,
        driverPhone: driverForm.phone,
        driverAlternatePhone: driverForm.alternatePhone,
        driverLicenseNumber: driverForm.licenseNumber,
        driverExperience: Number(driverForm.experienceYears) || 0,
      };

      // Optimistic update
      setCabs((prev) =>
        prev.map((c) =>
          c._id === driverModalCab._id
            ? { ...c, driver: { ...c.driver, ...updateData.driver }, driverName: driverForm.name, driverPhone: driverForm.phone }
            : c
        )
      );

      await axios.put(`${API}/${driverModalCab._id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setDriverModalCab(null);
    } catch (err) {
      console.error("Failed to update driver:", err);
      alert("Failed to update driver details.");
      fetchCabs();
    }
    setSavingDriver(false);
  };

  // Delete cab
  const deleteCab = async (id) => {
    if (!window.confirm("Are you sure you want to delete this cab?")) return;
    try {
      setCabs((prev) => prev.filter((c) => c._id !== id));
      if (selectedCab?._id === id) setSelectedCab(null);
      await axios.delete(`${API}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Error deleting cab:", error);
      alert("Failed to delete cab.");
      fetchCabs();
    }
  };

  // Form submit (Add or Edit)
  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      if (form[key] !== undefined && form[key] !== null) {
        formData.append(key, form[key]);
      }
    });

    // Ensure baseFare and price are explicitly mapped for backend price engine
    formData.set("baseFare", form.price || "0");
    formData.set("price", form.price || "0");

    // Ensure baseLocation, pickupLocation, and 40km radius are mapped
    formData.set("baseLocation", form.baseLocation || "");
    formData.set("pickupLocation", form.pickupLocation || form.baseLocation || "");
    formData.set("serviceRadiusKm", form.serviceRadiusKm || "40");

    // Pass structured driver payload in addition to flattened fields
    formData.set(
      "driver",
      JSON.stringify({
        name: form.driverName || "",
        phone: form.driverPhone || "",
        alternatePhone: form.driverAlternatePhone || "",
        licenseNumber: form.driverLicenseNumber || "",
        experienceYears: Number(form.driverExperience) || 0,
      })
    );

    if (image) formData.append("image", image);
    gallery.forEach((img) => formData.append("gallery", img));

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    };

    try {
      if (editId) {
        await axios.put(`${API}/${editId}`, formData, config);
      } else {
        await axios.post(API, formData, config);
      }

      setShowModal(false);
      resetForm();
      fetchCabs();
    } catch (error) {
      console.error("Error saving cab:", error);
      alert(error.response?.data?.message || "Failed to save cab.");
    }
    setSaving(false);
  };

  const resetForm = () => {
    setForm(initialForm);
    setImage(null);
    setImagePreview(null);
    setGallery([]);
    setGalleryPreview([]);
    setEditId(null);
    setModalTab("vehicle");
  };

  const cabTypeIcons = {
    Mini: "🚗",
    Sedan: "🚙",
    SUV: "🚐",
    "Premium Sedan": "🚘",
    "Premium SUV": "🚙",
    Luxury: "🏎️",
    "Tempo Traveller": "🚌",
    Electric: "⚡",
  };

  // Compute positions of cabs for the interactive radar
  const radarCabsWithCoords = useMemo(() => {
    return cabs.map((cab, index) => {
      // Generate consistent synthetic distance and angle based on id or index
      const seed = cab._id
        ? cab._id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
        : index * 47;
      const angle = (seed * 53) % 360;
      const distanceRatio = ((seed * 29) % 85 + 10) / 100; // 0.1 to 0.95
      const distanceKm = Math.round(distanceRatio * 50); // up to 50km
      const inZone = distanceKm <= radarRadius;

      // Polar to cartesian (percentage 0 to 100 within a circle centered at 50,50)
      const rad = (angle * Math.PI) / 180;
      const r = distanceRatio * 42; // max radius percent = 42%
      const x = 50 + r * Math.cos(rad);
      const y = 50 + r * Math.sin(rad);

      return {
        ...cab,
        distanceKm,
        inZone,
        x,
        y,
        angle,
      };
    });
  }, [cabs, radarRadius]);

  // Fare calculation for interactive estimator
  const estimatedFare = useMemo(() => {
    const baseRates = {
      Mini: 250,
      Sedan: 350,
      SUV: 550,
      "Premium Sedan": 600,
      "Premium SUV": 850,
      Luxury: 1200,
      "Tempo Traveller": 1400,
      Electric: 400,
    };
    const perKmRates = {
      Mini: 12,
      Sedan: 15,
      SUV: 20,
      "Premium Sedan": 22,
      "Premium SUV": 28,
      Luxury: 45,
      "Tempo Traveller": 32,
      Electric: 14,
    };
    const base = baseRates[estimatorCabType] || 350;
    const perKm = perKmRates[estimatorCabType] || 15;
    const total = base + estimatorDistance * perKm;
    const etaMins = Math.max(8, Math.round(estimatorDistance * 2.2));
    return { base, perKm, total, etaMins };
  }, [estimatorDistance, estimatorCabType]);

  return (
    <div className="vc-container">
      {/* HEADER WITH INTERACTIVE NAVIGATION MODES */}
      <header className="vc-header">
        <div className="vc-title-wrap">
          <h1>
            <span style={{ fontSize: "32px" }}>🚕</span>
            Cab Fleet & Dispatch Management
            <span className="vc-live-pill">
              <span className="vc-live-dot" /> Live Dispatch Engine
            </span>
          </h1>
          <p>
            Real-time fleet operations, verified driver dispatching, and high-precision 40 km coverage radius.
          </p>
        </div>

        <div className="vc-header-actions">
          {/* Main View Mode Selector Tabs */}
          <div className="vc-mode-pill-group">
            <button
              type="button"
              className={`vc-mode-pill ${activeMainTab === "fleet" ? "active" : ""}`}
              onClick={() => setActiveMainTab("fleet")}
            >
              <MdGridView style={{ fontSize: "16px" }} /> Fleet Manager
            </button>
            <button
              type="button"
              className={`vc-mode-pill ${activeMainTab === "radar" ? "active" : ""}`}
              onClick={() => setActiveMainTab("radar")}
            >
              <MdRadar style={{ fontSize: "16px" }} /> 40 KM Radar Live
              <span className="vc-mini-badge">{cabs.length}</span>
            </button>
            <button
              type="button"
              className={`vc-mode-pill ${activeMainTab === "estimator" ? "active" : ""}`}
              onClick={() => setActiveMainTab("estimator")}
            >
              <MdCalculate style={{ fontSize: "16px" }} /> Fare & ETA Calc
            </button>
          </div>

          <button
            type="button"
            className="vc-btn-refresh"
            onClick={fetchCabs}
            title="Refresh Fleet Telematics"
          >
            <MdRefresh />
          </button>

          <button
            type="button"
            className="vc-btn-add"
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            <MdAdd style={{ fontSize: "20px" }} />
            Add New Cab
          </button>
        </div>
      </header>

      {/* INTERACTIVE KPI METRICS ROW (CLICKABLE TO INSTANT FILTER) */}
      <section className="vc-stats-grid">
        <div
          className={`vc-stat-card ${filterType === "all" ? "vc-kpi-active" : ""}`}
          onClick={() => handleKpiClick("all")}
          title="Click to view all fleet vehicles"
        >
          <div className="vc-stat-info">
            <small>Total Fleet Cabs</small>
            <strong>{cabs.length}</strong>
            <span className="vc-kpi-hint">
              {filterType === "all" ? "✓ Filter Active" : "Click to view all"}
            </span>
          </div>
          <div className="vc-stat-icon-wrap vc-stat-icon-blue">
            <MdDirectionsCar />
          </div>
        </div>

        <div
          className={`vc-stat-card ${filterType === "available" ? "vc-kpi-active" : ""}`}
          onClick={() => handleKpiClick("available")}
          title="Click to filter live available cabs"
        >
          <div className="vc-stat-info">
            <small>Live & Available</small>
            <strong style={{ color: "#10b981" }}>
              {cabs.filter((c) => c.isActive !== false && (c.availableSeats || 0) > 0).length}
            </strong>
            <span className="vc-kpi-hint">
              {filterType === "available" ? "✓ Filter Active" : "Click to filter live"}
            </span>
          </div>
          <div className="vc-stat-icon-wrap vc-stat-icon-green">
            <MdCheckCircle />
          </div>
        </div>

        <div
          className={`vc-stat-card ${filterType === "40km" ? "vc-kpi-active" : ""}`}
          onClick={() => handleKpiClick("40km")}
          title="Click to filter vehicles configured for 40km hub"
        >
          <div className="vc-stat-info">
            <small>40 KM Hub Active</small>
            <strong style={{ color: "#2563eb" }}>
              {cabs.filter((c) => (c.serviceRadiusKm || 40) >= 40).length} Cabs
            </strong>
            <span className="vc-kpi-hint">
              {filterType === "40km" ? "✓ Filter Active" : "Click to filter 40km"}
            </span>
          </div>
          <div className="vc-stat-icon-wrap vc-stat-icon-amber">
            <MdRadar />
          </div>
        </div>

        <div
          className={`vc-stat-card ${filterType === "driver" ? "vc-kpi-active" : ""}`}
          onClick={() => handleKpiClick("driver")}
          title="Click to filter cabs with assigned drivers"
        >
          <div className="vc-stat-info">
            <small>Drivers Assigned</small>
            <strong style={{ color: "#8b5cf6" }}>
              {cabs.filter((c) => c.driver?.name || c.driverName).length}
            </strong>
            <span className="vc-kpi-hint">
              {filterType === "driver" ? "✓ Filter Active" : "Click to filter drivers"}
            </span>
          </div>
          <div className="vc-stat-icon-wrap vc-stat-icon-purple">
            <MdPerson />
          </div>
        </div>
      </section>

      {/* =========================================================
          VIEW 1: 40 KM RADAR LIVE SIMULATION (INTERACTIVE)
      ========================================================= */}
      {activeMainTab === "radar" && (
        <section className="vc-radar-interactive-section">
          <div className="vc-radar-banner">
            <div className="vc-radar-banner-left">
              <h2>
                <MdRadar style={{ color: "#38bdf8" }} />
                Real-Time 40 KM Local Coverage Radar
              </h2>
              <p>
                Interactive GPS telematics visualizer for your fleet. Vehicles within the {radarRadius} km zone receive instant passenger bookings with optimal arrival times.
              </p>
            </div>

            <div className="vc-radar-controls">
              <div className="vc-radar-slider-wrap">
                <label>
                  <span>Dynamic Service Radius:</span>
                  <strong className="vc-radius-highlight">{radarRadius} KM</strong>
                </label>
                <input
                  type="range"
                  min="10"
                  max="70"
                  step="5"
                  value={radarRadius}
                  onChange={(e) => setRadarRadius(Number(e.target.value))}
                  className="vc-range-slider"
                />
                <div className="vc-slider-ticks">
                  <span>10km</span>
                  <span style={{ color: "#38bdf8", fontWeight: "700" }}>40km (Standard)</span>
                  <span>70km</span>
                </div>
              </div>

              <button
                type="button"
                className={`vc-radar-toggle-btn ${radarSweepActive ? "active" : ""}`}
                onClick={() => setRadarSweepActive((v) => !v)}
              >
                {radarSweepActive ? <MdPause /> : <MdPlayArrow />}
                {radarSweepActive ? "Pause Radar" : "Start Sweep"}
              </button>
            </div>
          </div>

          <div className="vc-radar-viewport-grid">
            {/* Visual Radar Display */}
            <div className="vc-radar-canvas-container">
              <div className="vc-radar-screen">
                {/* Concentric distance rings */}
                <div className="vc-radar-ring vc-ring-10km" data-label="10 KM" />
                <div className="vc-radar-ring vc-ring-20km" data-label="20 KM" />
                <div className="vc-radar-ring vc-ring-30km" data-label="30 KM" />
                <div
                  className="vc-radar-ring vc-ring-40km active-hub-ring"
                  data-label="40 KM HUB"
                  style={{
                    boxShadow: radarRadius >= 40 ? "0 0 20px rgba(56, 189, 248, 0.4)" : "none",
                  }}
                />
                <div className="vc-radar-ring vc-ring-outer" data-label="OUTER" />

                {/* Radar Grid Axes */}
                <div className="vc-radar-axis-x" />
                <div className="vc-radar-axis-y" />

                {/* Rotating Sweep Line */}
                {radarSweepActive && <div className="vc-radar-sweep-beam" />}

                {/* Center Station Hub Icon */}
                <div className="vc-radar-center-hub" title="Primary Fleet Dispatch Hub (Base 0,0)">
                  <div className="vc-hub-pulse" />
                  <span className="vc-hub-pin">🎯</span>
                  <small>HUB</small>
                </div>

                {/* Cab Interactive Blips */}
                {radarCabsWithCoords.map((cab) => {
                  const isSelected = selectedRadarCab?._id === cab._id;
                  const isLive = cab.isActive !== false && (cab.availableSeats || 0) > 0;
                  return (
                    <div
                      key={cab._id}
                      className={`vc-radar-blip ${cab.inZone ? "in-zone" : "out-zone"} ${
                        isLive ? "live" : "offline"
                      } ${isSelected ? "selected" : ""}`}
                      style={{
                        left: `${cab.x}%`,
                        top: `${cab.y}%`,
                      }}
                      onClick={() => setSelectedRadarCab(cab)}
                      title={`${cab.vehicleNumber} (${cab.cabType}) - ${cab.distanceKm} km from hub`}
                    >
                      <div className="vc-blip-ping" />
                      <div className="vc-blip-dot">
                        <span className="vc-blip-icon">{cabTypeIcons[cab.cabType] || "🚗"}</span>
                      </div>
                      <span className="vc-blip-tag">{cab.vehicleNumber.slice(-4)}</span>
                    </div>
                  );
                })}
              </div>

              {/* Radar Legend Bar */}
              <div className="vc-radar-legend">
                <div className="vc-legend-item">
                  <span className="vc-legend-dot live-in" />
                  <span>Available in {radarRadius}km ({radarCabsWithCoords.filter((c) => c.inZone && c.isActive !== false).length})</span>
                </div>
                <div className="vc-legend-item">
                  <span className="vc-legend-dot out" />
                  <span>Outside Zone ({radarCabsWithCoords.filter((c) => !c.inZone).length})</span>
                </div>
                <div className="vc-legend-item">
                  <span className="vc-legend-dot off" />
                  <span>Offline / Inactive ({radarCabsWithCoords.filter((c) => c.isActive === false).length})</span>
                </div>
              </div>
            </div>

            {/* Selected Cab HUD Detail Drawer */}
            <div className="vc-radar-hud-card">
              {selectedRadarCab ? (
                <div className="vc-hud-content">
                  <div className="vc-hud-header">
                    <div>
                      <span className="vc-hud-badge">
                        {selectedRadarCab.inZone ? "🎯 INSIDE 40 KM ZONE" : "⚠️ OUTSIDE ZONE"}
                      </span>
                      <h3>{selectedRadarCab.brand || selectedRadarCab.cabType} {selectedRadarCab.model}</h3>
                      <span className="vc-hud-plate">{selectedRadarCab.vehicleNumber}</span>
                    </div>
                    <button
                      type="button"
                      className="vc-hud-close"
                      onClick={() => setSelectedRadarCab(null)}
                    >
                      ✕
                    </button>
                  </div>

                  <div className="vc-hud-telemetry-grid">
                    <div className="vc-telemetry-box">
                      <small>Distance From Hub</small>
                      <strong style={{ color: selectedRadarCab.inZone ? "#10b981" : "#f59e0b" }}>
                        {selectedRadarCab.distanceKm} KM
                      </strong>
                    </div>
                    <div className="vc-telemetry-box">
                      <small>Est. Dispatch ETA</small>
                      <strong style={{ color: "#38bdf8" }}>
                        ~{Math.max(6, Math.round(selectedRadarCab.distanceKm * 2))} Mins
                      </strong>
                    </div>
                    <div className="vc-telemetry-box">
                      <small>Available Seats</small>
                      <strong>
                        {selectedRadarCab.availableSeats || 0} / {selectedRadarCab.totalSeats || 4}
                      </strong>
                    </div>
                    <div className="vc-telemetry-box">
                      <small>Base Fare</small>
                      <strong style={{ color: "#10b981" }}>₹{selectedRadarCab.price || 0}</strong>
                    </div>
                  </div>

                  {/* Driver Dossier Box */}
                  <div className="vc-hud-driver-box">
                    <div className="vc-hud-driver-avatar">👨‍✈️</div>
                    <div className="vc-hud-driver-info">
                      <h4>{selectedRadarCab.driver?.name || selectedRadarCab.driverName || "Driver Unassigned"}</h4>
                      <p>
                        📞 {selectedRadarCab.driver?.phone || selectedRadarCab.driverPhone || "No contact"}
                      </p>
                      <small>
                        Licence: {selectedRadarCab.driver?.licenseNumber || selectedRadarCab.driverLicenseNumber || "Pending"}
                      </small>
                    </div>
                  </div>

                  {/* Interactive HUD Action Buttons */}
                  <div className="vc-hud-actions">
                    {selectedRadarCab.driver?.phone && (
                      <a
                        href={`tel:${selectedRadarCab.driver?.phone}`}
                        className="vc-hud-btn-call"
                      >
                        <MdPhone /> Call Driver
                      </a>
                    )}
                    <a
                      href={`https://wa.me/${(selectedRadarCab.driver?.phone || "").replace(/\D/g, "")}?text=${encodeURIComponent(
                        `Hi ${selectedRadarCab.driver?.name || "Driver"}, you have an active dispatch query for Cab ${selectedRadarCab.vehicleNumber} within the 40km hub zone.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="vc-hud-btn-whatsapp"
                    >
                      <MdSend /> WhatsApp Dispatch
                    </a>
                    <button
                      type="button"
                      className="vc-hud-btn-edit"
                      onClick={() => editCab(selectedRadarCab)}
                    >
                      <MdEdit /> Edit Specs
                    </button>
                  </div>
                </div>
              ) : (
                <div className="vc-hud-empty">
                  <div style={{ fontSize: "48px", marginBottom: "12px" }}>🛰️</div>
                  <h4>Interactive Radar Telematics</h4>
                  <p>
                    Click any pulsating cab dot on the radar grid to view its live driver assignment, distance from base hub, estimated pickup ETA, and one-click dispatch actions.
                  </p>
                  <div className="vc-hud-quick-stats">
                    <div className="vc-hud-stat-pill">
                      <span>Total In Radius:</span>
                      <strong>{radarCabsWithCoords.filter((c) => c.inZone).length} Cabs</strong>
                    </div>
                    <div className="vc-hud-stat-pill">
                      <span>Live Response ETA:</span>
                      <strong>&lt; 15 mins</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* =========================================================
          VIEW 2: INTERACTIVE FARE & ETA ESTIMATOR
      ========================================================= */}
      {activeMainTab === "estimator" && (
        <section className="vc-estimator-section">
          <div className="vc-estimator-card">
            <div className="vc-estimator-head">
              <h2>
                <MdCalculate style={{ color: "#2563eb", fontSize: "32px" }} />
                Interactive 40 KM Fare & Dispatch Simulator
              </h2>
              <p>
                Simulate trip pricing, passenger pickup ETAs, and fuel economy for local intra-city and airport drops within the 40 km radius.
              </p>
            </div>

            <div className="vc-estimator-body">
              <div className="vc-estimator-inputs">
                {/* Distance Slider */}
                <div className="vc-calc-group">
                  <div className="vc-calc-label-row">
                    <label>Ride Distance within Hub:</label>
                    <span className="vc-calc-val">{estimatorDistance} KM</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="40"
                    step="1"
                    value={estimatorDistance}
                    onChange={(e) => setEstimatorDistance(Number(e.target.value))}
                    className="vc-range-slider"
                  />
                  <div className="vc-slider-ticks">
                    <span>1 KM (Local)</span>
                    <span>20 KM (Airport)</span>
                    <span style={{ color: "#2563eb", fontWeight: "700" }}>40 KM (Hub Boundary)</span>
                  </div>
                </div>

                {/* Cab Type Selector */}
                <div className="vc-calc-group">
                  <label>Select Cab Category:</label>
                  <div className="vc-car-type-chips">
                    {["Mini", "Sedan", "SUV", "Premium Sedan", "Premium SUV", "Luxury", "Electric"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        className={`vc-type-chip ${estimatorCabType === type ? "active" : ""}`}
                        onClick={() => setEstimatorCabType(type)}
                      >
                        <span>{cabTypeIcons[type] || "🚗"}</span>
                        <span>{type}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Estimate Results Receipt */}
              <div className="vc-estimator-receipt">
                <div className="vc-receipt-header">
                  <span>Fare Calculation Breakdown</span>
                  <span className="vc-receipt-tag">🎯 Within 40 km zone</span>
                </div>

                <div className="vc-receipt-lines">
                  <div className="vc-receipt-row">
                    <span>Base Flagdown Fare:</span>
                    <strong>₹{estimatedFare.base}</strong>
                  </div>
                  <div className="vc-receipt-row">
                    <span>Distance Fare ({estimatorDistance} km × ₹{estimatedFare.perKm}/km):</span>
                    <strong>₹{estimatorDistance * estimatedFare.perKm}</strong>
                  </div>
                  <div className="vc-receipt-row">
                    <span>Estimated Driver Arrival Time:</span>
                    <strong style={{ color: "#10b981" }}>~{estimatedFare.etaMins} Mins</strong>
                  </div>
                  <div className="vc-receipt-row">
                    <span>Deadhead Toll / Return Risk:</span>
                    <strong style={{ color: "#2563eb" }}>0% (Inside 40km Hub)</strong>
                  </div>
                  <div className="vc-receipt-divider" />
                  <div className="vc-receipt-total">
                    <span>Total Est. Fare:</span>
                    <span className="vc-total-val">₹{estimatedFare.total}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="vc-btn-receipt-action"
                  onClick={() => {
                    setFilterType(estimatorCabType.toLowerCase());
                    setActiveMainTab("fleet");
                  }}
                >
                  View Available {estimatorCabType} Fleet ({cabs.filter((c) => (c.cabType || "").toLowerCase().includes(estimatorCabType.toLowerCase())).length})
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================
          VIEW 3: FLEET MANAGER (CARDS / TABLE VIEW)
      ========================================================= */}
      {activeMainTab === "fleet" && (
        <>
          {/* TOOLBAR: SEARCH, FILTERS & VIEW TOGGLE */}
          <div className="vc-toolbar">
            <div className="vc-search-box">
              <MdSearch className="vc-search-icon" />
              <input
                type="text"
                placeholder="Search by vehicle plate, driver, city, brand or model..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="vc-search-clear"
                  onClick={() => setSearchQuery("")}
                >
                  ✕
                </button>
              )}
            </div>

            <div className="vc-filter-pills">
              {[
                { id: "all", label: "All Fleet" },
                { id: "available", label: "🟢 Available Now" },
                { id: "40km", label: "🎯 40km Hub" },
                { id: "driver", label: "👨‍✈️ Driver Assigned" },
                { id: "sedan", label: "🚙 Sedan" },
                { id: "suv", label: "🚐 SUV" },
                { id: "mini", label: "🚗 Mini" },
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  className={`vc-filter-pill ${filterType === pill.id ? "active" : ""}`}
                  onClick={() => setFilterType(pill.id)}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            <div className="vc-sort-wrap">
              <select
                className="vc-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="default">Sort: Default</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="seats">Most Seats Available</option>
              </select>
            </div>

            <div className="vc-view-toggle">
              <button
                type="button"
                className={`vc-view-btn ${viewMode === "cards" ? "active" : ""}`}
                onClick={() => setViewMode("cards")}
                title="Grid Card View"
              >
                <MdGridView />
              </button>
              <button
                type="button"
                className={`vc-view-btn ${viewMode === "table" ? "active" : ""}`}
                onClick={() => setViewMode("table")}
                title="Data Table View"
              >
                <MdViewList />
              </button>
            </div>
          </div>

          {/* ACTIVE FILTER NOTICE */}
          {(filterType !== "all" || searchQuery) && (
            <div className="vc-active-filter-bar">
              <span>
                Showing {filteredCabs.length} of {cabs.length} vehicles matching:
                {filterType !== "all" && <strong> [{filterType.toUpperCase()}]</strong>}
                {searchQuery && <strong> [Search: "{searchQuery}"]</strong>}
              </span>
              <button
                type="button"
                className="vc-btn-reset-filter"
                onClick={() => {
                  setFilterType("all");
                  setSearchQuery("");
                }}
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* LOADING STATE */}
          {loading && (
            <div className="vc-loading-state">
              <div className="vc-spinner" />
              <strong>Syncing Fleet Telematics...</strong>
            </div>
          )}

          {/* EMPTY STATE */}
          {!loading && filteredCabs.length === 0 && (
            <div className="vc-empty-state">
              <div style={{ fontSize: "54px", marginBottom: "16px" }}>🚕</div>
              <h3>No Fleet Cabs Found</h3>
              <p>
                {searchQuery || filterType !== "all"
                  ? "No fleet vehicles match your current search or filter criteria. Try resetting filters."
                  : "Get started by adding your first cab vehicle, driver details and 40 km location hub."}
              </p>
              <button
                type="button"
                className="vc-btn-add"
                style={{ margin: "0 auto" }}
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
              >
                <MdAdd /> Add First Cab
              </button>
            </div>
          )}

          {/* VIEW MODE 1: INTERACTIVE CARDS GRID */}
          {!loading && filteredCabs.length > 0 && viewMode === "cards" && (
            <div className="vc-cards-grid">
              {filteredCabs.map((cab) => {
                const driverName = cab.driver?.name || cab.driverName || "";
                const driverPhone = cab.driver?.phone || cab.driverPhone || "";
                const driverLicense =
                  cab.driver?.licenseNumber || cab.driverLicenseNumber || "";
                const driverExp =
                  cab.driver?.experienceYears || cab.driverExperience || "";
                const baseLoc =
                  cab.baseLocation ||
                  cab.pickupLocation ||
                  cab.fromCity ||
                  "Primary Hub";
                const radiusKm = cab.serviceRadiusKm || 40;
                const isLive =
                  cab.isActive !== false && (cab.availableSeats || 0) > 0;

                return (
                  <article key={cab._id} className="vc-card">
                    {/* Media banner */}
                    <div className="vc-card-media">
                      {cab.image ? (
                        <img
                          src={cab.image}
                          alt={cab.cabType}
                          className="vc-card-img"
                        />
                      ) : (
                        <div className="vc-card-no-img">
                          <span style={{ fontSize: "48px" }}>
                            {cabTypeIcons[cab.cabType] || "🚗"}
                          </span>
                        </div>
                      )}

                      <div className="vc-card-badges">
                        <span className="vc-badge-plate">
                          {cab.vehicleNumber}
                        </span>
                        <span
                          className={`vc-badge-status ${
                            cab.isActive === false
                              ? "vc-status-inactive"
                              : isLive
                              ? "vc-status-active"
                              : "vc-status-inactive"
                          }`}
                        >
                          {cab.isActive === false
                            ? "🔴 Inactive"
                            : isLive
                            ? "🟢 Available"
                            : "🟡 Occupied"}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="vc-card-body">
                      <div className="vc-card-title-row">
                        <div>
                          <h4 className="vc-card-car-name">
                            {cab.brand ? `${cab.brand} ${cab.model}` : `${cab.cabType} Cab`}
                          </h4>
                          <span className="vc-card-car-meta">
                            {cabTypeIcons[cab.cabType]} {cab.cabType} · {cab.vehicleColor || "Standard"}
                          </span>
                        </div>

                        <div className="vc-card-price-pill">
                          <span className="vc-card-price-amount">
                            ₹{cab.price || 0}
                          </span>
                          <span className="vc-card-price-label">Base Fare</span>
                        </div>
                      </div>

                      {/* 👨‍✈️ Driver Highlight Box */}
                      <div className="vc-driver-box">
                        <div className="vc-driver-avatar">
                          {cab.driver?.photo ? (
                            <img
                              src={cab.driver.photo}
                              alt={driverName}
                              style={{
                                width: "100%",
                                height: "100%",
                                borderRadius: "50%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            "👨‍✈️"
                          )}
                        </div>
                        <div className="vc-driver-meta">
                          <div className="vc-driver-header-line">
                            <h5 className="vc-driver-name">
                              {driverName || "Driver Unassigned"}
                              {driverName && <MdVerified style={{ color: "#2563eb", fontSize: "14px" }} />}
                            </h5>
                            <button
                              type="button"
                              className="vc-btn-reassign"
                              onClick={(e) => openDriverModal(cab, e)}
                              title="Assign or update driver"
                            >
                              <MdAssignmentInd /> {driverName ? "Change" : "Assign"}
                            </button>
                          </div>

                          {driverPhone ? (
                            <div className="vc-driver-contact-actions">
                              <a
                                href={`tel:${driverPhone}`}
                                className="vc-driver-phone-chip"
                                title="Click to call driver"
                              >
                                📞 {driverPhone}
                              </a>
                              <a
                                href={`https://wa.me/${driverPhone.replace(/\D/g, "")}?text=${encodeURIComponent(
                                  `Hi ${driverName}, notification regarding cab ${cab.vehicleNumber} (${cab.cabType}).`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="vc-driver-wa-chip"
                                title="Send WhatsApp Message"
                              >
                                💬 WhatsApp
                              </a>
                            </div>
                          ) : (
                            <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                              No phone linked
                            </span>
                          )}

                          {driverLicense && (
                            <span className="vc-driver-licence">
                              DL: {driverLicense}{" "}
                              {driverExp ? `· ${driverExp} yrs exp` : ""}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 📍 40 KM Location & Radius Box */}
                      <div className="vc-location-box">
                        <div className="vc-location-head">
                          <span className="vc-location-hub">
                            <MdLocationOn style={{ color: "#2563eb", fontSize: "16px" }} />
                            {baseLoc}
                          </span>
                          <span className="vc-location-badge-40km">
                            🎯 Within {radiusKm} km
                          </span>
                        </div>
                        <p className="vc-location-route">
                          {cab.fromCity || "Base Hub"}
                          {cab.toCity ? ` ➔ ${cab.toCity}` : " · Intra-City & Drops"}
                        </p>
                      </div>

                      {/* Specs bar with Interactive Seat Stepper */}
                      <div className="vc-specs-bar">
                        {/* Interactive Seat Stepper */}
                        <div className="vc-seat-stepper-wrap" title="Adjust available passenger seats">
                          <MdAirlineSeatReclineNormal style={{ fontSize: "15px", color: "#2563eb" }} />
                          <span>Seats:</span>
                          <button
                            type="button"
                            className="vc-seat-step-btn"
                            onClick={(e) => adjustSeats(cab, -1, e)}
                            disabled={(cab.availableSeats || 0) <= 0}
                          >
                            -
                          </button>
                          <strong className="vc-seat-number">
                            {cab.availableSeats || 0} / {cab.totalSeats || 4}
                          </strong>
                          <button
                            type="button"
                            className="vc-seat-step-btn"
                            onClick={(e) => adjustSeats(cab, 1, e)}
                            disabled={(cab.availableSeats || 0) >= (cab.totalSeats || 4)}
                          >
                            +
                          </button>
                        </div>

                        <span className="vc-spec-tag">
                          <MdAcUnit /> {cab.acType || "AC"}
                        </span>
                        <span className="vc-spec-tag">
                          <MdLocalGasStation /> {cab.fuelType || "Petrol"}
                        </span>
                      </div>

                      {/* Card Footer with 1-Click Interactive Status Switch */}
                      <div className="vc-card-footer">
                        <div
                          className="vc-card-toggle-wrap"
                          onClick={() => toggleStatus(cab._id, cab.isActive)}
                          title="Click to toggle active availability"
                        >
                          <div
                            className={`vc-toggle-switch ${
                              cab.isActive !== false ? "on" : ""
                            }`}
                          >
                            <div className="vc-toggle-knob" />
                          </div>
                          <span className="vc-toggle-label">
                            {cab.isActive !== false ? "Active" : "Inactive"}
                          </span>
                        </div>

                        <div className="vc-card-actions">
                          <button
                            type="button"
                            className="vc-btn-icon"
                            onClick={() => setSelectedCab(cab)}
                            title="Quick Dossier & Documents"
                          >
                            <MdVisibility />
                          </button>
                          <button
                            type="button"
                            className="vc-btn-icon"
                            onClick={() => editCab(cab)}
                            title="Edit Vehicle & Driver"
                          >
                            <MdEdit />
                          </button>
                          <button
                            type="button"
                            className="vc-btn-icon delete"
                            onClick={() => deleteCab(cab._id)}
                            title="Delete Cab"
                          >
                            <MdDelete />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* VIEW MODE 2: DATA TABLE */}
          {!loading && filteredCabs.length > 0 && viewMode === "table" && (
            <div className="vc-table-wrap">
              <table className="vc-table">
                <thead>
                  <tr>
                    <th>Vehicle Plate & Type</th>
                    <th>👨‍✈️ Driver Details</th>
                    <th>📍 Location Hub & 40km</th>
                    <th>Available Seats</th>
                    <th>Base Fare</th>
                    <th>Live Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCabs.map((cab) => {
                    const driverName = cab.driver?.name || cab.driverName || "";
                    const driverPhone = cab.driver?.phone || cab.driverPhone || "";
                    const driverLicense =
                      cab.driver?.licenseNumber || cab.driverLicenseNumber || "";
                    const baseLoc =
                      cab.baseLocation ||
                      cab.pickupLocation ||
                      cab.fromCity ||
                      "Base Hub";
                    const radiusKm = cab.serviceRadiusKm || 40;

                    return (
                      <tr key={cab._id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span style={{ fontSize: "24px" }}>
                              {cabTypeIcons[cab.cabType] || "🚗"}
                            </span>
                            <div>
                              <strong style={{ fontSize: "13px", color: "#0f172a", display: "block" }}>
                                {cab.vehicleNumber}
                              </strong>
                              <small style={{ color: "#64748b" }}>
                                {cab.cabType} {cab.model ? `· ${cab.model}` : ""}
                              </small>
                            </div>
                          </div>
                        </td>

                        <td>
                          {driverName ? (
                            <div>
                              <strong style={{ fontSize: "13px", color: "#1e293b", display: "block" }}>
                                {driverName}
                              </strong>
                              {driverPhone && (
                                <a
                                  href={`tel:${driverPhone}`}
                                  style={{ color: "#2563eb", fontWeight: "600", fontSize: "12px", textDecoration: "none" }}
                                >
                                  📞 {driverPhone}
                                </a>
                              )}
                              {driverLicense && (
                                <small style={{ color: "#64748b", display: "block", fontSize: "11px" }}>
                                  Licence: {driverLicense}
                                </small>
                              )}
                            </div>
                          ) : (
                            <button
                              type="button"
                              className="vc-btn-assign-small"
                              onClick={(e) => openDriverModal(cab, e)}
                            >
                              + Assign Driver
                            </button>
                          )}
                        </td>

                        <td>
                          <div>
                            <strong style={{ fontSize: "13px", color: "#1e293b", display: "block" }}>
                              📍 {baseLoc}
                            </strong>
                            <span
                              style={{
                                background: "#eff6ff",
                                color: "#2563eb",
                                fontWeight: "700",
                                fontSize: "11px",
                                padding: "2px 8px",
                                borderRadius: "99px",
                                border: "1px solid #bfdbfe",
                                display: "inline-block",
                                marginTop: "2px",
                              }}
                            >
                              🎯 Within {radiusKm} km
                            </span>
                          </div>
                        </td>

                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <button
                              type="button"
                              className="vc-seat-step-btn"
                              onClick={(e) => adjustSeats(cab, -1, e)}
                              disabled={(cab.availableSeats || 0) <= 0}
                            >
                              -
                            </button>
                            <strong>
                              {cab.availableSeats || 0} / {cab.totalSeats || 4}
                            </strong>
                            <button
                              type="button"
                              className="vc-seat-step-btn"
                              onClick={(e) => adjustSeats(cab, 1, e)}
                              disabled={(cab.availableSeats || 0) >= (cab.totalSeats || 4)}
                            >
                              +
                            </button>
                          </div>
                        </td>

                        <td>
                          <strong style={{ color: "#059669", fontSize: "14px" }}>
                            ₹{cab.price || 0}
                          </strong>
                        </td>

                        <td>
                          <div
                            className="vc-card-toggle-wrap"
                            onClick={() => toggleStatus(cab._id, cab.isActive)}
                          >
                            <div
                              className={`vc-toggle-switch ${
                                cab.isActive !== false ? "on" : ""
                              }`}
                            >
                              <div className="vc-toggle-knob" />
                            </div>
                            <span style={{ fontSize: "11px", fontWeight: "700" }}>
                              {cab.isActive !== false ? "Live" : "Off"}
                            </span>
                          </div>
                        </td>

                        <td>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button
                              type="button"
                              className="vc-btn-icon"
                              onClick={() => setSelectedCab(cab)}
                              title="Quick View"
                            >
                              <MdVisibility />
                            </button>
                            <button
                              type="button"
                              className="vc-btn-icon"
                              onClick={() => editCab(cab)}
                              title="Edit"
                            >
                              <MdEdit />
                            </button>
                            <button
                              type="button"
                              className="vc-btn-icon delete"
                              onClick={() => deleteCab(cab._id)}
                              title="Delete"
                            >
                              <MdDelete />
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
        </>
      )}

      {/* =========================================================
          MODAL 1: QUICK DRIVER ASSIGNMENT MODAL
      ========================================================= */}
      {driverModalCab && (
        <div
          className="vc-modal-overlay"
          onClick={() => setDriverModalCab(null)}
        >
          <div
            className="vc-modal"
            style={{ maxWidth: "520px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="vc-modal-head">
              <h2>
                <MdPerson style={{ color: "#2563eb" }} />
                Assign Driver · {driverModalCab.vehicleNumber}
              </h2>
              <button
                type="button"
                className="vc-modal-close"
                onClick={() => setDriverModalCab(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDriver}>
              <div className="vc-modal-body" style={{ display: "grid", gap: "16px" }}>
                <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>
                  Attach a dedicated commercial driver to this vehicle for automatic trip dispatching within the 40 km hub.
                </p>

                <div className="vc-form-group">
                  <label>Driver Full Name *</label>
                  <input
                    className="vc-input"
                    placeholder="e.g. Ramesh Kumar"
                    value={driverForm.name}
                    onChange={(e) =>
                      setDriverForm({ ...driverForm, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="vc-form-row">
                  <div className="vc-form-group">
                    <label>Driver Mobile Number *</label>
                    <input
                      className="vc-input"
                      type="tel"
                      placeholder="e.g. +91 9876543210"
                      value={driverForm.phone}
                      onChange={(e) =>
                        setDriverForm({ ...driverForm, phone: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="vc-form-group">
                    <label>Alternate Contact</label>
                    <input
                      className="vc-input"
                      type="tel"
                      placeholder="Optional emergency number"
                      value={driverForm.alternatePhone}
                      onChange={(e) =>
                        setDriverForm({
                          ...driverForm,
                          alternatePhone: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="vc-form-row">
                  <div className="vc-form-group">
                    <label>Driving Licence Number *</label>
                    <input
                      className="vc-input"
                      placeholder="e.g. DL-1420110012345"
                      value={driverForm.licenseNumber}
                      onChange={(e) =>
                        setDriverForm({
                          ...driverForm,
                          licenseNumber: e.target.value.toUpperCase(),
                        })
                      }
                      required
                    />
                  </div>
                  <div className="vc-form-group">
                    <label>Experience (Years)</label>
                    <input
                      className="vc-input"
                      type="number"
                      placeholder="e.g. 5"
                      value={driverForm.experienceYears}
                      onChange={(e) =>
                        setDriverForm({
                          ...driverForm,
                          experienceYears: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                  <button
                    type="button"
                    className="vc-btn-cancel"
                    onClick={() => setDriverModalCab(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="vc-btn-submit"
                    disabled={savingDriver}
                  >
                    {savingDriver ? "Saving..." : "Save Driver Assignment"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 2: QUICK VIEW DOSSIER DRAWER
      ========================================================= */}
      {selectedCab && (
        <div
          className="vc-modal-overlay"
          onClick={() => setSelectedCab(null)}
        >
          <div
            className="vc-modal"
            style={{ maxWidth: "680px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="vc-modal-head">
              <h2>
                <MdDirectionsCar style={{ color: "#2563eb" }} />
                {selectedCab.vehicleNumber} Telematics Dossier
              </h2>
              <button
                type="button"
                className="vc-modal-close"
                onClick={() => setSelectedCab(null)}
              >
                ✕
              </button>
            </div>

            <div className="vc-modal-body" style={{ display: "grid", gap: "20px" }}>
              {selectedCab.image && (
                <div style={{ borderRadius: "12px", overflow: "hidden", maxHeight: "240px" }}>
                  <img
                    src={selectedCab.image}
                    alt={selectedCab.vehicleNumber}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
              )}

              {/* Driver Box */}
              <div className="vc-driver-box">
                <span style={{ fontSize: "32px" }}>👨‍✈️</span>
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: "15px", color: "#0f172a" }}>
                    {selectedCab.driver?.name || selectedCab.driverName || "Driver Not Assigned"}
                  </strong>
                  <div style={{ color: "#2563eb", fontWeight: "600", fontSize: "13px" }}>
                    📞 {selectedCab.driver?.phone || selectedCab.driverPhone || "N/A"}
                  </div>
                  <div style={{ color: "#64748b", fontSize: "12px" }}>
                    Licence: {selectedCab.driver?.licenseNumber || selectedCab.driverLicenseNumber || "N/A"}
                    {selectedCab.driver?.experienceYears && ` · ${selectedCab.driver.experienceYears} yrs experience`}
                  </div>
                </div>
                {selectedCab.driver?.phone && (
                  <a
                    href={`tel:${selectedCab.driver.phone}`}
                    className="vc-btn-call-round"
                    title="Call Driver"
                  >
                    <MdPhone />
                  </a>
                )}
              </div>

              {/* 40 km location box */}
              <div className="vc-location-box">
                <div className="vc-location-head">
                  <strong style={{ fontSize: "14px", color: "#1e3a8a" }}>
                    📍 Base Hub: {selectedCab.baseLocation || selectedCab.pickupLocation || selectedCab.fromCity}
                  </strong>
                  <span className="vc-location-badge-40km">
                    🎯 Within {selectedCab.serviceRadiusKm || 40} km Radius
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: "12px", color: "#3b82f6" }}>
                  Eligible for auto-dispatch and ride acceptance within {selectedCab.serviceRadiusKm || 40} km of base location.
                </p>
              </div>

              {/* Details table */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13px" }}>
                <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "8px" }}>
                  <small style={{ color: "#64748b", display: "block" }}>Cab Category</small>
                  <strong>{selectedCab.cabType}</strong>
                </div>
                <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "8px" }}>
                  <small style={{ color: "#64748b", display: "block" }}>Make & Model</small>
                  <strong>{selectedCab.brand || "Standard"} {selectedCab.model}</strong>
                </div>
                <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "8px" }}>
                  <small style={{ color: "#64748b", display: "block" }}>Passenger Seating</small>
                  <strong>{selectedCab.availableSeats || 0} / {selectedCab.totalSeats || 4} Available</strong>
                </div>
                <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "8px" }}>
                  <small style={{ color: "#64748b", display: "block" }}>Base Trip Rate</small>
                  <strong style={{ color: "#059669" }}>₹{selectedCab.price || 0}</strong>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  className="vc-btn-cancel"
                  onClick={() => setSelectedCab(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="vc-btn-submit"
                  onClick={() => {
                    const c = selectedCab;
                    setSelectedCab(null);
                    editCab(c);
                  }}
                >
                  ✏️ Edit Vehicle & Driver
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 3: ADD / EDIT CAB 4-STEP WIZARD WITH LIVE PREVIEW
      ========================================================= */}
      {showModal && (
        <div className="vc-modal-overlay" onClick={resetForm}>
          <div
            className="vc-modal vc-modal-wizard"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="vc-modal-head">
              <h2>
                <MdDirectionsCar style={{ color: "#2563eb" }} />
                {editId ? "Edit Cab, Driver & 40km Hub" : "Add Cab to Fleet Inventory"}
              </h2>
              <button
                type="button"
                className="vc-modal-close"
                onClick={resetForm}
              >
                ✕
              </button>
            </div>

            {/* Modal Step Tabs */}
            <div className="vc-modal-tabs">
              <button
                type="button"
                className={`vc-modal-tab-btn ${modalTab === "vehicle" ? "active" : ""}`}
                onClick={() => setModalTab("vehicle")}
              >
                🚗 1. Vehicle Specs
              </button>
              <button
                type="button"
                className={`vc-modal-tab-btn ${modalTab === "driver" ? "active" : ""}`}
                onClick={() => setModalTab("driver")}
              >
                👨‍✈️ 2. Driver Details
              </button>
              <button
                type="button"
                className={`vc-modal-tab-btn ${modalTab === "location" ? "active" : ""}`}
                onClick={() => setModalTab("location")}
              >
                📍 3. Location (Within 40km)
              </button>
              <button
                type="button"
                className={`vc-modal-tab-btn ${modalTab === "pricing" ? "active" : ""}`}
                onClick={() => setModalTab("pricing")}
              >
                💰 4. Photos & Pricing
              </button>
            </div>

            <form onSubmit={submit}>
              <div className="vc-wizard-layout">
                <div className="vc-modal-body vc-wizard-form-area">
                  {/* TAB 1: VEHICLE INFORMATION */}
                  {modalTab === "vehicle" && (
                    <div>
                      <div className="vc-form-row">
                        <div className="vc-form-group">
                          <label>Cab Category *</label>
                          <select
                            className="vc-select"
                            value={form.cabType}
                            onChange={(e) =>
                              setForm({ ...form, cabType: e.target.value })
                            }
                            required
                          >
                            <option value="Sedan">🚙 Sedan</option>
                            <option value="Mini">🚗 Mini</option>
                            <option value="SUV">🚐 SUV</option>
                            <option value="Premium Sedan">🚘 Premium Sedan</option>
                            <option value="Premium SUV">🚙 Premium SUV</option>
                            <option value="Luxury">🏎️ Luxury</option>
                            <option value="Tempo Traveller">🚌 Tempo Traveller</option>
                            <option value="Electric">⚡ Electric</option>
                          </select>
                        </div>

                        <div className="vc-form-group">
                          <label>Vehicle Plate Number *</label>
                          <input
                            className="vc-input"
                            placeholder="e.g. DL 01 AB 1234"
                            value={form.vehicleNumber}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                vehicleNumber: e.target.value.toUpperCase(),
                              })
                            }
                            required
                          />
                        </div>
                      </div>

                      <div className="vc-form-row">
                        <div className="vc-form-group">
                          <label>Brand / Make</label>
                          <input
                            className="vc-input"
                            placeholder="e.g. Maruti Suzuki, Toyota, Hyundai"
                            value={form.brand}
                            onChange={(e) =>
                              setForm({ ...form, brand: e.target.value })
                            }
                          />
                        </div>
                        <div className="vc-form-group">
                          <label>Model Name</label>
                          <input
                            className="vc-input"
                            placeholder="e.g. Dzire, Ertiga, Innova Crysta"
                            value={form.model}
                            onChange={(e) =>
                              setForm({ ...form, model: e.target.value })
                            }
                          />
                        </div>
                      </div>

                      <div className="vc-form-row">
                        <div className="vc-form-group">
                          <label>Manufacturing Year</label>
                          <input
                            className="vc-input"
                            type="number"
                            placeholder="e.g. 2023"
                            value={form.modelYear}
                            onChange={(e) =>
                              setForm({ ...form, modelYear: e.target.value })
                            }
                          />
                        </div>
                        <div className="vc-form-group">
                          <label>Vehicle Color</label>
                          <input
                            className="vc-input"
                            placeholder="e.g. White, Silver, Black"
                            value={form.vehicleColor}
                            onChange={(e) =>
                              setForm({ ...form, vehicleColor: e.target.value })
                            }
                          />
                        </div>
                      </div>

                      <div className="vc-form-row">
                        <div className="vc-form-group">
                          <label>Total Seats</label>
                          <input
                            className="vc-input"
                            type="number"
                            value={form.totalSeats}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                totalSeats: e.target.value,
                                availableSeats: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="vc-form-group">
                          <label>Available Seats (Live)</label>
                          <input
                            className="vc-input"
                            type="number"
                            value={form.availableSeats}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                availableSeats: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="vc-form-row">
                        <div className="vc-form-group">
                          <label>AC Condition</label>
                          <select
                            className="vc-select"
                            value={form.acType}
                            onChange={(e) =>
                              setForm({ ...form, acType: e.target.value })
                            }
                          >
                            <option value="AC">AC</option>
                            <option value="Non-AC">Non-AC</option>
                          </select>
                        </div>
                        <div className="vc-form-group">
                          <label>Fuel Type</label>
                          <select
                            className="vc-select"
                            value={form.fuelType}
                            onChange={(e) =>
                              setForm({ ...form, fuelType: e.target.value })
                            }
                          >
                            <option value="Petrol">Petrol</option>
                            <option value="Diesel">Diesel</option>
                            <option value="CNG">CNG</option>
                            <option value="Electric">Electric</option>
                            <option value="Hybrid">Hybrid</option>
                          </select>
                        </div>
                      </div>

                      <div className="vc-wizard-nav-btns">
                        <span />
                        <button
                          type="button"
                          className="vc-btn-submit"
                          onClick={() => setModalTab("driver")}
                        >
                          Next: Driver Details ➔
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: DRIVER DETAILS */}
                  {modalTab === "driver" && (
                    <div>
                      <div className="vc-form-group">
                        <label>Driver Full Name *</label>
                        <input
                          className="vc-input"
                          placeholder="e.g. Ramesh Kumar"
                          value={form.driverName}
                          onChange={(e) =>
                            setForm({ ...form, driverName: e.target.value })
                          }
                          required
                        />
                      </div>

                      <div className="vc-form-row">
                        <div className="vc-form-group">
                          <label>Driver Mobile Number *</label>
                          <input
                            className="vc-input"
                            type="tel"
                            placeholder="e.g. +91 9876543210"
                            value={form.driverPhone}
                            onChange={(e) =>
                              setForm({ ...form, driverPhone: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div className="vc-form-group">
                          <label>Alternate Contact</label>
                          <input
                            className="vc-input"
                            type="tel"
                            placeholder="e.g. +91 9123456780"
                            value={form.driverAlternatePhone}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                driverAlternatePhone: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="vc-form-row">
                        <div className="vc-form-group">
                          <label>Driving Licence Number *</label>
                          <input
                            className="vc-input"
                            placeholder="e.g. DL-1420110012345"
                            value={form.driverLicenseNumber}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                driverLicenseNumber: e.target.value.toUpperCase(),
                              })
                            }
                            required
                          />
                        </div>
                        <div className="vc-form-group">
                          <label>Experience (Years)</label>
                          <input
                            className="vc-input"
                            type="number"
                            placeholder="e.g. 5"
                            value={form.driverExperience}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                driverExperience: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="vc-wizard-nav-btns">
                        <button
                          type="button"
                          className="vc-btn-cancel"
                          onClick={() => setModalTab("vehicle")}
                        >
                          ‹ Back
                        </button>
                        <button
                          type="button"
                          className="vc-btn-submit"
                          onClick={() => setModalTab("location")}
                        >
                          Next: Location (Within 40km) ➔
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: LOCATION & 40KM HUB */}
                  {modalTab === "location" && (
                    <div>
                      <div className="vc-form-row">
                        <div className="vc-form-group">
                          <label>Base Hub Location *</label>
                          <input
                            className="vc-input"
                            placeholder="e.g. IGI Airport Terminal 3 / Connaught Place"
                            value={form.baseLocation}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                baseLocation: e.target.value,
                                pickupLocation: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div className="vc-form-group">
                          <label>Operating City *</label>
                          <input
                            className="vc-input"
                            placeholder="e.g. Delhi NCR, Jaipur, Mumbai"
                            value={form.fromCity}
                            onChange={(e) =>
                              setForm({ ...form, fromCity: e.target.value })
                            }
                            required
                          />
                        </div>
                      </div>

                      <div className="vc-form-group" style={{ marginTop: "10px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                          <label style={{ margin: 0, fontWeight: "700" }}>
                            Service Operating Radius:
                          </label>
                          <span className="vc-location-badge-40km">
                            🎯 Within {form.serviceRadiusKm} km
                          </span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="60"
                          step="5"
                          value={form.serviceRadiusKm}
                          onChange={(e) =>
                            setForm({ ...form, serviceRadiusKm: e.target.value })
                          }
                          className="vc-range-slider"
                        />
                        <small style={{ color: "#64748b", display: "block", marginTop: "4px" }}>
                          Standard BMT intra-city operations are optimized for <strong>40 km</strong> local pickups.
                        </small>
                      </div>

                      <div className="vc-form-group">
                        <label>Preferred Operating Areas / Corridors</label>
                        <input
                          className="vc-input"
                          placeholder="e.g. South Delhi, Noida Sector 62, Gurgaon Cyber City"
                          value={form.operatingArea}
                          onChange={(e) =>
                            setForm({ ...form, operatingArea: e.target.value })
                          }
                        />
                      </div>

                      <div className="vc-wizard-nav-btns">
                        <button
                          type="button"
                          className="vc-btn-cancel"
                          onClick={() => setModalTab("driver")}
                        >
                          ‹ Back
                        </button>
                        <button
                          type="button"
                          className="vc-btn-submit"
                          onClick={() => setModalTab("pricing")}
                        >
                          Next: Photos & Pricing ➔
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: PRICING & PHOTOS */}
                  {modalTab === "pricing" && (
                    <div>
                      <div className="vc-form-row">
                        <div className="vc-form-group">
                          <label>Base Trip Fare (₹) *</label>
                          <input
                            className="vc-input"
                            type="number"
                            placeholder="e.g. 500"
                            value={form.price}
                            onChange={(e) =>
                              setForm({ ...form, price: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div className="vc-form-group">
                          <label>Per KM Rate (₹) *</label>
                          <input
                            className="vc-input"
                            type="number"
                            placeholder="e.g. 14"
                            value={form.pricePerKm}
                            onChange={(e) =>
                              setForm({ ...form, pricePerKm: e.target.value })
                            }
                          />
                        </div>
                      </div>

                      <div className="vc-form-group">
                        <label>Primary Vehicle Photo</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="vc-input"
                        />
                        {imagePreview && (
                          <div style={{ marginTop: "10px", width: "120px", height: "80px", borderRadius: "8px", overflow: "hidden" }}>
                            <img
                              src={imagePreview}
                              alt="Preview"
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          </div>
                        )}
                      </div>

                      <div className="vc-wizard-nav-btns">
                        <button
                          type="button"
                          className="vc-btn-cancel"
                          onClick={() => setModalTab("location")}
                        >
                          ‹ Back
                        </button>
                        <button
                          type="submit"
                          className="vc-btn-submit"
                          disabled={saving}
                        >
                          {saving ? "Saving Cab..." : editId ? "Update Cab" : "✓ Register Cab"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* REAL-TIME LIVE CARD PREVIEW AS YOU TYPE */}
                <div className="vc-wizard-preview-panel">
                  <div className="vc-preview-tag">Live Card Preview</div>
                  <div className="vc-card" style={{ boxShadow: "0 4px 14px rgba(0,0,0,0.06)" }}>
                    <div className="vc-card-media" style={{ height: "140px" }}>
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="vc-card-img"
                        />
                      ) : (
                        <div className="vc-card-no-img">
                          <span style={{ fontSize: "40px" }}>
                            {cabTypeIcons[form.cabType] || "🚗"}
                          </span>
                        </div>
                      )}
                      <div className="vc-card-badges">
                        <span className="vc-badge-plate">
                          {form.vehicleNumber || "PLATE-XXXX"}
                        </span>
                        <span className="vc-badge-status vc-status-active">
                          ● Live Available
                        </span>
                      </div>
                    </div>

                    <div className="vc-card-body" style={{ padding: "14px" }}>
                      <div className="vc-card-title-row">
                        <div>
                          <h4 className="vc-card-car-name">
                            {form.brand ? `${form.brand} ${form.model}` : `${form.cabType} Cab`}
                          </h4>
                          <span className="vc-card-car-meta">
                            {cabTypeIcons[form.cabType]} {form.cabType} · {form.vehicleColor || "Standard"}
                          </span>
                        </div>
                        <div className="vc-card-price-pill">
                          <span className="vc-card-price-amount">
                            ₹{form.price || "0"}
                          </span>
                          <span className="vc-card-price-label">Base</span>
                        </div>
                      </div>

                      <div className="vc-driver-box" style={{ padding: "8px 10px" }}>
                        <div className="vc-driver-avatar" style={{ width: "32px", height: "32px", fontSize: "16px" }}>
                          👨‍✈️
                        </div>
                        <div className="vc-driver-meta">
                          <h5 className="vc-driver-name" style={{ fontSize: "12px" }}>
                            {form.driverName || "Driver Unassigned"}
                          </h5>
                          <span style={{ fontSize: "11px", color: "#2563eb" }}>
                            {form.driverPhone ? `📞 ${form.driverPhone}` : "No phone entered"}
                          </span>
                        </div>
                      </div>

                      <div className="vc-location-box" style={{ padding: "8px 10px", marginTop: "8px" }}>
                        <div className="vc-location-head">
                          <span className="vc-location-hub" style={{ fontSize: "12px" }}>
                            📍 {form.baseLocation || "Base Hub"}
                          </span>
                          <span className="vc-location-badge-40km" style={{ fontSize: "10px" }}>
                            🎯 Within {form.serviceRadiusKm || 40} km
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
