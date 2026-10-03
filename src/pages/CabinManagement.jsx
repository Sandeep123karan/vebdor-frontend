import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  X,
  Image as ImageIcon,
  Ship,
  Users,
  BedDouble,
  DollarSign,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { api } from "../api/axios";
import "./CabinManagement.css";

const API_CABINS = "https://bmtvendorfinal.onrender.com/api/cruise-cabins";
const API_SHIPS = "/api/vendor/cruise/ships";

const CABIN_TYPES = [
  ["interior", "Interior"],
  ["ocean-view", "Ocean View"],
  ["balcony", "Balcony"],
  ["suite", "Suite"],
  ["family", "Family"],
  ["penthouse", "Penthouse"],
  ["other", "Other"],
];

const BED_TYPES = [
  ["single", "Single"],
  ["twin", "Twin"],
  ["double", "Double"],
  ["queen", "Queen"],
  ["king", "King"],
  ["bunk", "Bunk"],
  ["sofa-bed", "Sofa Bed"],
  ["multiple", "Multiple"],
  ["other", "Other"],
];

const EMPTY_FORM = {
  shipId: "",
  cabinName: "",
  cabinNumber: "",
  cabinType: "interior",
  deckNumber: "",
  deckName: "",
  maxGuests: "2",
  maxAdults: "2",
  maxChildren: "0",
  bedType: "double",
  numberOfBeds: "1",
  cabinSize: "",
  cabinSizeUnit: "sqm",
  description: "",
  amenities: "",
  basePrice: "0",
  currency: "INR",
  status: "draft",
  available: true,
};

const authConfig = () => {
  const token = localStorage.getItem("vendorToken");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

const getErrorMessage = (error, fallback = "Something went wrong.") =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

const getImageUrl = (url) => {
  if (!url) return "";
  return String(url);
};

const formatPrice = (price, currency = "INR") => {
  const value = Number(price || 0);
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currency || "INR"} ${value.toLocaleString("en-IN")}`;
  }
};

const labelFor = (items, value) =>
  items.find(([key]) => key === value)?.[1] || value || "-";

const normalizeShips = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.ships)) return response.ships;
  if (Array.isArray(response?.data?.ships)) return response.data.ships;
  return [];
};

const normalizeCabins = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.cabins)) return response.cabins;
  if (Array.isArray(response?.data?.cabins)) return response.data.cabins;
  return [];
};

const parseAmenitiesForForm = (amenities) =>
  Array.isArray(amenities) ? amenities.join(", ") : amenities || "";

const parseAmenitiesForRequest = (value) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

function CabinManagement() {
  const [cabins, setCabins] = useState([]);
  const [ships, setShips] = useState([]);

  const [loading, setLoading] = useState(true);
  const [shipsLoading, setShipsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [shipFilter, setShipFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [selectedCabin, setSelectedCabin] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [coverImage, setCoverImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);

  const clearMessages = () => {
    setError("");
    setNotice("");
  };

  const loadShips = async () => {
    try {
      setShipsLoading(true);
      const response = await api.get(API_SHIPS, authConfig());
      setShips(normalizeShips(response.data));
    } catch (err) {
      setShips([]);
      setError(getErrorMessage(err, "Unable to load cruise ships."));
    } finally {
      setShipsLoading(false);
    }
  };

  const loadCabins = async (selectedShipId = shipFilter) => {
    try {
      setLoading(true);
      setError("");

      const query =
        selectedShipId && selectedShipId !== "all"
          ? `?shipId=${encodeURIComponent(selectedShipId)}`
          : "";

      const response = await api.get(
        `${API_CABINS}${query}`,
        authConfig()
      );

      setCabins(normalizeCabins(response.data));
    } catch (err) {
      setCabins([]);
      setError(getErrorMessage(err, "Unable to load cabins."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShips();
    loadCabins("all");
  }, []);

  useEffect(() => {
    if (!showForm) {
      loadCabins(shipFilter);
    }
  }, [shipFilter]);

  const openAdd = () => {
    clearMessages();
    setEditingId("");
    setForm({
      ...EMPTY_FORM,
      shipId:
        shipFilter !== "all"
          ? shipFilter
          : ships.length === 1
          ? ships[0]._id
          : "",
    });
    setCoverImage(null);
    setGalleryImages([]);
    setShowForm(true);
  };

  const openEdit = (cabin) => {
    clearMessages();
    setEditingId(cabin._id);

    setForm({
      shipId:
        typeof cabin.shipId === "object"
          ? cabin.shipId?._id || ""
          : cabin.shipId || "",
      cabinName: cabin.cabinName || "",
      cabinNumber: cabin.cabinNumber || "",
      cabinType: cabin.cabinType || "interior",
      deckNumber:
        cabin.deckNumber === null || cabin.deckNumber === undefined
          ? ""
          : String(cabin.deckNumber),
      deckName: cabin.deckName || "",
      maxGuests: String(cabin.maxGuests ?? 2),
      maxAdults: String(cabin.maxAdults ?? 0),
      maxChildren: String(cabin.maxChildren ?? 0),
      bedType: cabin.bedType || "double",
      numberOfBeds: String(cabin.numberOfBeds ?? 1),
      cabinSize:
        cabin.cabinSize === null || cabin.cabinSize === undefined
          ? ""
          : String(cabin.cabinSize),
      cabinSizeUnit: cabin.cabinSizeUnit || "sqm",
      description: cabin.description || "",
      amenities: parseAmenitiesForForm(cabin.amenities),
      basePrice: String(cabin.basePrice ?? 0),
      currency: cabin.currency || "INR",
      status: cabin.status || "draft",
      available: cabin.available !== false,
    });

    setCoverImage(null);
    setGalleryImages([]);
    setShowForm(true);
  };

  const openView = (cabin) => {
    clearMessages();
    setSelectedCabin(cabin);
    setShowView(true);
  };

  const closeForm = () => {
    if (saving) return;
    setShowForm(false);
    setEditingId("");
    setCoverImage(null);
    setGalleryImages([]);
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const buildFormData = () => {
    const fd = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      if (key === "amenities") {
        fd.append(
          "amenities",
          JSON.stringify(parseAmenitiesForRequest(value))
        );
        return;
      }

      if (key === "available") {
        fd.append("available", String(Boolean(value)));
        return;
      }

      if (value !== null && value !== undefined) {
        fd.append(key, String(value));
      }
    });

    if (coverImage) {
      fd.append("coverImage", coverImage);
    }

    galleryImages.forEach((file) => {
      fd.append("images", file);
    });

    return fd;
  };

  const saveCabin = async (event) => {
    event.preventDefault();
    clearMessages();

    if (!form.shipId) {
      setError("Please select a cruise ship.");
      return;
    }

    if (!form.cabinName.trim()) {
      setError("Cabin name is required.");
      return;
    }

    if (!form.maxGuests || Number(form.maxGuests) < 1) {
      setError("Maximum guests must be at least 1.");
      return;
    }

    try {
      setSaving(true);

      const fd = buildFormData();

      let response;

      if (editingId) {
        response = await api.put(
          `${API_CABINS}/${editingId}`,
          fd,
          {
            ...authConfig(),
            headers: {
              ...authConfig().headers,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        response = await api.post(API_CABINS, fd, {
          ...authConfig(),
          headers: {
            ...authConfig().headers,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      const returnedCabin = response?.data?.cabin;

      setNotice(
        response?.data?.message ||
          (editingId
            ? "Cabin updated successfully."
            : "Cabin created successfully.")
      );

      setShowForm(false);
      setEditingId("");
      setCoverImage(null);
      setGalleryImages([]);

      await loadCabins(shipFilter);

      if (returnedCabin) {
        setSelectedCabin(returnedCabin);
      }
    } catch (err) {
      setError(getErrorMessage(err, "Unable to save cabin."));
    } finally {
      setSaving(false);
    }
  };

  const deleteCabin = async (cabin) => {
    const confirmed = window.confirm(
      `Delete "${cabin.cabinName}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      clearMessages();
      setDeletingId(cabin._id);

      const response = await api.delete(
        `${API_CABINS}/${cabin._id}`,
        authConfig()
      );

      setNotice(
        response?.data?.message || "Cabin deleted successfully."
      );

      await loadCabins(shipFilter);

      if (selectedCabin?._id === cabin._id) {
        setShowView(false);
        setSelectedCabin(null);
      }
    } catch (err) {
      setError(getErrorMessage(err, "Unable to delete cabin."));
    } finally {
      setDeletingId("");
    }
  };

  const filteredCabins = useMemo(() => {
    const query = search.trim().toLowerCase();

    return cabins.filter((cabin) => {
      const shipName =
        typeof cabin.shipId === "object"
          ? cabin.shipId?.shipName || ""
          : "";

      const matchesSearch =
        !query ||
        [
          cabin.cabinName,
          cabin.cabinNumber,
          cabin.cabinType,
          cabin.deckName,
          shipName,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "all" || cabin.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [cabins, search, statusFilter]);

  const stats = useMemo(() => {
    const total = cabins.length;
    const active = cabins.filter((c) => c.status === "active").length;
    const draft = cabins.filter((c) => c.status === "draft").length;
    const inactive = cabins.filter((c) => c.status === "inactive").length;
    const available = cabins.filter((c) => c.available !== false).length;

    return { total, active, draft, inactive, available };
  }, [cabins]);

  const getShipName = (cabin) => {
    if (typeof cabin.shipId === "object") {
      return cabin.shipId?.shipName || "Unknown ship";
    }

    const ship = ships.find((item) => item._id === cabin.shipId);
    return ship?.shipName || cabin.shipId || "Unknown ship";
  };

  return (
    <div className="cabin-page">
      <div className="cabin-page-header">
        <div>
          <div className="cabin-title-row">
            <div className="cabin-title-icon">
              <BedDouble size={23} />
            </div>
            <div>
              <h1>Cabin Management</h1>
              <p>Manage cruise cabins, pricing, availability and media.</p>
            </div>
          </div>
        </div>

        <button className="cabin-primary-btn" onClick={openAdd}>
          <Plus size={18} />
          Add Cabin
        </button>
      </div>

      {error && (
        <div className="cabin-alert cabin-alert-error">
          <XCircle size={18} />
          <span>{error}</span>
          <button onClick={() => setError("")}>
            <X size={16} />
          </button>
        </div>
      )}

      {notice && (
        <div className="cabin-alert cabin-alert-success">
          <CheckCircle2 size={18} />
          <span>{notice}</span>
          <button onClick={() => setNotice("")}>
            <X size={16} />
          </button>
        </div>
      )}

      <div className="cabin-stats-grid">
        <div className="cabin-stat-card">
          <div className="cabin-stat-icon">
            <BedDouble size={20} />
          </div>
          <div>
            <span>Total Cabins</span>
            <strong>{stats.total}</strong>
          </div>
        </div>

        <div className="cabin-stat-card">
          <div className="cabin-stat-icon success">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span>Active</span>
            <strong>{stats.active}</strong>
          </div>
        </div>

        <div className="cabin-stat-card">
          <div className="cabin-stat-icon warning">
            <RefreshCw size={20} />
          </div>
          <div>
            <span>Draft</span>
            <strong>{stats.draft}</strong>
          </div>
        </div>

        <div className="cabin-stat-card">
          <div className="cabin-stat-icon info">
            <Users size={20} />
          </div>
          <div>
            <span>Available</span>
            <strong>{stats.available}</strong>
          </div>
        </div>
      </div>

      <div className="cabin-toolbar">
        <div className="cabin-search">
          <Search size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cabin name, number, ship..."
          />
        </div>

        <select
          className="cabin-filter"
          value={shipFilter}
          onChange={(e) => setShipFilter(e.target.value)}
        >
          <option value="all">All Ships</option>
          {ships.map((ship) => (
            <option key={ship._id} value={ship._id}>
              {ship.shipName}
            </option>
          ))}
        </select>

        <select
          className="cabin-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <button
          className="cabin-refresh-btn"
          onClick={() => {
            loadShips();
            loadCabins(shipFilter);
          }}
          title="Refresh"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="cabin-table-card">
        <div className="cabin-table-top">
          <div>
            <h2>Cabins</h2>
            <span>{filteredCabins.length} cabin(s)</span>
          </div>
          {shipsLoading && (
            <span className="cabin-loading-small">Loading ships...</span>
          )}
        </div>

        {loading ? (
          <div className="cabin-empty-state">
            <RefreshCw className="cabin-spin" size={28} />
            <h3>Loading cabins...</h3>
          </div>
        ) : filteredCabins.length === 0 ? (
          <div className="cabin-empty-state">
            <div className="cabin-empty-icon">
              <BedDouble size={30} />
            </div>
            <h3>No cabins found</h3>
            <p>
              {cabins.length === 0
                ? "Create your first cruise cabin to get started."
                : "Try changing your search or filters."}
            </p>
            {cabins.length === 0 && (
              <button className="cabin-primary-btn" onClick={openAdd}>
                <Plus size={17} />
                Add Cabin
              </button>
            )}
          </div>
        ) : (
          <div className="cabin-table-wrap">
            <table className="cabin-table">
              <thead>
                <tr>
                  <th>Cabin</th>
                  <th>Ship</th>
                  <th>Type</th>
                  <th>Deck</th>
                  <th>Guests</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Available</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredCabins.map((cabin) => (
                  <tr key={cabin._id}>
                    <td>
                      <div className="cabin-name-cell">
                        {cabin.coverImage ? (
                          <img
                            src={getImageUrl(cabin.coverImage)}
                            alt={cabin.cabinName}
                          />
                        ) : (
                          <div className="cabin-thumb-placeholder">
                            <ImageIcon size={18} />
                          </div>
                        )}
                        <div>
                          <strong>{cabin.cabinName}</strong>
                          <span>
                            {cabin.cabinNumber
                              ? `#${cabin.cabinNumber}`
                              : "No cabin number"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="cabin-ship-cell">
                        <Ship size={15} />
                        {getShipName(cabin)}
                      </div>
                    </td>

                    <td>
                      <span className="cabin-type-badge">
                        {labelFor(CABIN_TYPES, cabin.cabinType)}
                      </span>
                    </td>

                    <td>
                      {cabin.deckNumber !== null &&
                      cabin.deckNumber !== undefined
                        ? `Deck ${cabin.deckNumber}`
                        : "-"}
                      {cabin.deckName ? (
                        <small className="cabin-deck-name">
                          {cabin.deckName}
                        </small>
                      ) : null}
                    </td>

                    <td>
                      <strong>{cabin.maxGuests || 0}</strong>
                    </td>

                    <td>
                      <div className="cabin-price-cell">
                        <DollarSign size={14} />
                        {formatPrice(cabin.basePrice, cabin.currency)}
                      </div>
                    </td>

                    <td>
                      <span
                        className={`cabin-status cabin-status-${cabin.status}`}
                      >
                        {cabin.status}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`cabin-availability ${
                          cabin.available ? "is-available" : "not-available"
                        }`}
                      >
                        {cabin.available ? "Available" : "Unavailable"}
                      </span>
                    </td>

                    <td>
                      <div className="cabin-actions">
                        <button
                          className="cabin-icon-btn view"
                          onClick={() => openView(cabin)}
                          title="View"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          className="cabin-icon-btn edit"
                          onClick={() => openEdit(cabin)}
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          className="cabin-icon-btn delete"
                          onClick={() => deleteCabin(cabin)}
                          disabled={deletingId === cabin._id}
                          title="Delete"
                        >
                          {deletingId === cabin._id ? (
                            <RefreshCw className="cabin-spin" size={16} />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="cabin-modal-overlay">
          <div className="cabin-modal cabin-form-modal">
            <div className="cabin-modal-header">
              <div>
                <h2>{editingId ? "Edit Cabin" : "Add Cabin"}</h2>
                <p>
                  {editingId
                    ? "Update the selected cabin."
                    : "Create a new cruise cabin."}
                </p>
              </div>
              <button
                className="cabin-close-btn"
                onClick={closeForm}
                disabled={saving}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={saveCabin}>
              <div className="cabin-form-body">
                <div className="cabin-section-heading">
                  <Ship size={18} />
                  <span>Ship & Basic Details</span>
                </div>

                <div className="cabin-form-grid">
                  <label className="cabin-field">
                    <span>Cruise Ship *</span>
                    <select
                      name="shipId"
                      value={form.shipId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select cruise ship</option>
                      {ships.map((ship) => (
                        <option key={ship._id} value={ship._id}>
                          {ship.shipName}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="cabin-field">
                    <span>Cabin Name *</span>
                    <input
                      name="cabinName"
                      value={form.cabinName}
                      onChange={handleChange}
                      placeholder="e.g. Ocean View Cabin"
                      required
                    />
                  </label>

                  <label className="cabin-field">
                    <span>Cabin Number</span>
                    <input
                      name="cabinNumber"
                      value={form.cabinNumber}
                      onChange={handleChange}
                      placeholder="e.g. 101"
                    />
                  </label>

                  <label className="cabin-field">
                    <span>Cabin Type *</span>
                    <select
                      name="cabinType"
                      value={form.cabinType}
                      onChange={handleChange}
                      required
                    >
                      {CABIN_TYPES.map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="cabin-section-heading">
                  <Ship size={18} />
                  <span>Location</span>
                </div>

                <div className="cabin-form-grid three">
                  <label className="cabin-field">
                    <span>Deck Number</span>
                    <input
                      type="number"
                      min="0"
                      name="deckNumber"
                      value={form.deckNumber}
                      onChange={handleChange}
                      placeholder="5"
                    />
                  </label>

                  <label className="cabin-field">
                    <span>Deck Name</span>
                    <input
                      name="deckName"
                      value={form.deckName}
                      onChange={handleChange}
                      placeholder="e.g. Deck 5"
                    />
                  </label>
                </div>

                <div className="cabin-section-heading">
                  <Users size={18} />
                  <span>Capacity & Bed Details</span>
                </div>

                <div className="cabin-form-grid four">
                  <label className="cabin-field">
                    <span>Max Guests *</span>
                    <input
                      type="number"
                      min="1"
                      name="maxGuests"
                      value={form.maxGuests}
                      onChange={handleChange}
                      required
                    />
                  </label>

                  <label className="cabin-field">
                    <span>Max Adults</span>
                    <input
                      type="number"
                      min="0"
                      name="maxAdults"
                      value={form.maxAdults}
                      onChange={handleChange}
                    />
                  </label>

                  <label className="cabin-field">
                    <span>Max Children</span>
                    <input
                      type="number"
                      min="0"
                      name="maxChildren"
                      value={form.maxChildren}
                      onChange={handleChange}
                    />
                  </label>

                  <label className="cabin-field">
                    <span>Bed Type</span>
                    <select
                      name="bedType"
                      value={form.bedType}
                      onChange={handleChange}
                    >
                      {BED_TYPES.map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="cabin-field">
                    <span>Number of Beds</span>
                    <input
                      type="number"
                      min="0"
                      name="numberOfBeds"
                      value={form.numberOfBeds}
                      onChange={handleChange}
                    />
                  </label>

                  <label className="cabin-field">
                    <span>Cabin Size</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      name="cabinSize"
                      value={form.cabinSize}
                      onChange={handleChange}
                      placeholder="25"
                    />
                  </label>

                  <label className="cabin-field">
                    <span>Size Unit</span>
                    <select
                      name="cabinSizeUnit"
                      value={form.cabinSizeUnit}
                      onChange={handleChange}
                    >
                      <option value="sqm">Square Meter (sqm)</option>
                      <option value="sqft">Square Feet (sqft)</option>
                    </select>
                  </label>
                </div>

                <div className="cabin-section-heading">
                  <DollarSign size={18} />
                  <span>Pricing & Status</span>
                </div>

                <div className="cabin-form-grid four">
                  <label className="cabin-field">
                    <span>Base Price</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      name="basePrice"
                      value={form.basePrice}
                      onChange={handleChange}
                    />
                  </label>

                  <label className="cabin-field">
                    <span>Currency</span>
                    <input
                      name="currency"
                      value={form.currency}
                      onChange={handleChange}
                      placeholder="INR"
                    />
                  </label>

                  <label className="cabin-field">
                    <span>Status</span>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </label>

                  <label className="cabin-checkbox-field">
                    <input
                      type="checkbox"
                      name="available"
                      checked={form.available}
                      onChange={handleChange}
                    />
                    <span>Cabin is available</span>
                  </label>
                </div>

                <div className="cabin-section-heading">
                  <ImageIcon size={18} />
                  <span>Description, Amenities & Media</span>
                </div>

                <div className="cabin-form-grid">
                  <label className="cabin-field full">
                    <span>Description</span>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      rows="4"
                      placeholder="Describe the cabin..."
                    />
                  </label>

                  <label className="cabin-field full">
                    <span>Amenities</span>
                    <input
                      name="amenities"
                      value={form.amenities}
                      onChange={handleChange}
                      placeholder="WiFi, TV, Mini Bar, Ocean View"
                    />
                    <small>Separate amenities with commas.</small>
                  </label>

                  <label className="cabin-file-field">
                    <span>
                      Cover Image{" "}
                      {editingId ? "(optional replacement)" : ""}
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={(e) =>
                        setCoverImage(e.target.files?.[0] || null)
                      }
                    />
                    <small>JPEG, JPG, PNG or WEBP. Max 5 MB.</small>
                    {coverImage && (
                      <em>{coverImage.name}</em>
                    )}
                  </label>

                  <label className="cabin-file-field">
                    <span>Cabin Images</span>
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={(e) =>
                        setGalleryImages(
                          Array.from(e.target.files || []).slice(0, 10)
                        )
                      }
                    />
                    <small>Maximum 10 images, 5 MB each.</small>
                    {galleryImages.length > 0 && (
                      <em>{galleryImages.length} image(s) selected</em>
                    )}
                  </label>
                </div>
              </div>

              <div className="cabin-modal-footer">
                <button
                  type="button"
                  className="cabin-secondary-btn"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="cabin-primary-btn"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <RefreshCw className="cabin-spin" size={17} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={17} />
                      {editingId ? "Update Cabin" : "Create Cabin"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showView && selectedCabin && (
        <div className="cabin-modal-overlay">
          <div className="cabin-modal cabin-view-modal">
            <div className="cabin-modal-header">
              <div>
                <h2>{selectedCabin.cabinName}</h2>
                <p>
                  {getShipName(selectedCabin)}
                  {selectedCabin.cabinNumber
                    ? ` • #${selectedCabin.cabinNumber}`
                    : ""}
                </p>
              </div>

              <button
                className="cabin-close-btn"
                onClick={() => setShowView(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="cabin-view-body">
              <div className="cabin-view-media">
                {selectedCabin.coverImage ? (
                  <img
                    src={getImageUrl(selectedCabin.coverImage)}
                    alt={selectedCabin.cabinName}
                  />
                ) : (
                  <div className="cabin-view-placeholder">
                    <ImageIcon size={42} />
                    <span>No cover image</span>
                  </div>
                )}
              </div>

              <div className="cabin-view-info">
                <div className="cabin-view-badges">
                  <span
                    className={`cabin-status cabin-status-${selectedCabin.status}`}
                  >
                    {selectedCabin.status}
                  </span>
                  <span
                    className={`cabin-availability ${
                      selectedCabin.available
                        ? "is-available"
                        : "not-available"
                    }`}
                  >
                    {selectedCabin.available
                      ? "Available"
                      : "Unavailable"}
                  </span>
                </div>

                <div className="cabin-detail-grid">
                  <div>
                    <span>Cabin Type</span>
                    <strong>
                      {labelFor(
                        CABIN_TYPES,
                        selectedCabin.cabinType
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Deck</span>
                    <strong>
                      {selectedCabin.deckNumber ?? "-"}
                      {selectedCabin.deckName
                        ? ` • ${selectedCabin.deckName}`
                        : ""}
                    </strong>
                  </div>

                  <div>
                    <span>Max Guests</span>
                    <strong>{selectedCabin.maxGuests}</strong>
                  </div>

                  <div>
                    <span>Adults / Children</span>
                    <strong>
                      {selectedCabin.maxAdults ?? 0} /{" "}
                      {selectedCabin.maxChildren ?? 0}
                    </strong>
                  </div>

                  <div>
                    <span>Bed</span>
                    <strong>
                      {labelFor(BED_TYPES, selectedCabin.bedType)}{" "}
                      × {selectedCabin.numberOfBeds ?? 0}
                    </strong>
                  </div>

                  <div>
                    <span>Cabin Size</span>
                    <strong>
                      {selectedCabin.cabinSize ?? "-"}{" "}
                      {selectedCabin.cabinSize
                        ? selectedCabin.cabinSizeUnit
                        : ""}
                    </strong>
                  </div>

                  <div>
                    <span>Base Price</span>
                    <strong>
                      {formatPrice(
                        selectedCabin.basePrice,
                        selectedCabin.currency
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Ship</span>
                    <strong>{getShipName(selectedCabin)}</strong>
                  </div>
                </div>

                <div className="cabin-view-description">
                  <h3>Description</h3>
                  <p>
                    {selectedCabin.description ||
                      "No description added."}
                  </p>
                </div>

                <div className="cabin-view-amenities">
                  <h3>Amenities</h3>
                  <div>
                    {Array.isArray(selectedCabin.amenities) &&
                    selectedCabin.amenities.length > 0 ? (
                      selectedCabin.amenities.map((item) => (
                        <span key={item}>{item}</span>
                      ))
                    ) : (
                      <p>No amenities added.</p>
                    )}
                  </div>
                </div>

                {Array.isArray(selectedCabin.images) &&
                  selectedCabin.images.length > 0 && (
                    <div className="cabin-view-gallery">
                      <h3>Cabin Images</h3>
                      <div className="cabin-gallery-grid">
                        {selectedCabin.images.map((image, index) => (
                          <img
                            key={`${image}-${index}`}
                            src={getImageUrl(image)}
                            alt={`${selectedCabin.cabinName} ${index + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>

            <div className="cabin-modal-footer">
              <button
                className="cabin-secondary-btn"
                onClick={() => setShowView(false)}
              >
                Close
              </button>

              <button
                className="cabin-primary-btn"
                onClick={() => {
                  setShowView(false);
                  openEdit(selectedCabin);
                }}
              >
                <Pencil size={17} />
                Edit Cabin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CabinManagement;
