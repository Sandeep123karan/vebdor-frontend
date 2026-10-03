import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  X,
  Ship,
  Map,
  CalendarDays,
  Users,
  CheckCircle2,
  Clock3,
  XCircle,
  RefreshCw,
  Save,
  ArrowRight,
} from "lucide-react";
import { api } from "../api/axios";
import "./CruiseSailingManagement.css";

const API_SAILINGS = "/api/cruise-sailings";
const API_SHIPS = "/api/vendor/cruise/ships";
const API_ITINERARIES = "/api/cruise-itineraries";

const authConfig = () => {
  const token = localStorage.getItem("vendorToken");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

const EMPTY_FORM = {
  shipId: "",
  itineraryId: "",
  sailingCode: "",
  departureDate: "",
  returnDate: "",
  departurePort: {
    name: "",
    city: "",
    country: "",
    code: "",
  },
  arrivalPort: {
    name: "",
    city: "",
    country: "",
    code: "",
  },
  bookingOpenDate: "",
  bookingCloseDate: "",
  totalCapacity: "0",
  availableCapacity: "0",
  bookingStatus: "open",
  status: "draft",
};

const STATUS_OPTIONS = [
  ["draft", "Draft"],
  ["active", "Active"],
  ["inactive", "Inactive"],
  ["cancelled", "Cancelled"],
  ["completed", "Completed"],
];

const BOOKING_STATUS_OPTIONS = [
  ["open", "Open"],
  ["closed", "Closed"],
  ["sold-out", "Sold Out"],
];

const getErrorMessage = (error, fallback = "Something went wrong.") =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

const normalizeArray = (response, key) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.[key])) return response[key];
  if (Array.isArray(response?.data?.[key])) return response.data[key];
  return [];
};

const getId = (value) =>
  typeof value === "object" ? value?._id || "" : value || "";

const getName = (value, fallback = "-") => {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  return value.shipName || value.itineraryName || value.name || fallback;
};

const toInputDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (number) => String(number).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const statusLabel = (value) =>
  STATUS_OPTIONS.find(([key]) => key === value)?.[1] || value || "-";

const bookingStatusLabel = (value) =>
  BOOKING_STATUS_OPTIONS.find(([key]) => key === value)?.[1] || value || "-";

const emptyPort = () => ({
  name: "",
  city: "",
  country: "",
  code: "",
});

function CruiseSailingManagement() {
  const [sailings, setSailings] = useState([]);
  const [ships, setShips] = useState([]);
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shipsLoading, setShipsLoading] = useState(true);
  const [itinerariesLoading, setItinerariesLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [shipFilter, setShipFilter] = useState("all");
  const [itineraryFilter, setItineraryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [bookingStatusFilter, setBookingStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [selectedSailing, setSelectedSailing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const clearMessages = () => {
    setError("");
    setNotice("");
  };

  const loadShips = async () => {
    try {
      setShipsLoading(true);
      const response = await api.get(API_SHIPS, authConfig());
      setShips(normalizeArray(response.data, "ships"));
    } catch (err) {
      setShips([]);
      setError(getErrorMessage(err, "Unable to load cruise ships."));
    } finally {
      setShipsLoading(false);
    }
  };

  const loadItineraries = async () => {
    try {
      setItinerariesLoading(true);
      const response = await api.get(API_ITINERARIES, authConfig());
      setItineraries(normalizeArray(response.data, "itineraries"));
    } catch (err) {
      setItineraries([]);
      setError(getErrorMessage(err, "Unable to load cruise itineraries."));
    } finally {
      setItinerariesLoading(false);
    }
  };

  const loadSailings = async () => {
    try {
      setLoading(true);
      setError("");
      const params = {};
      if (shipFilter !== "all") params.shipId = shipFilter;
      if (itineraryFilter !== "all") params.itineraryId = itineraryFilter;
      if (statusFilter !== "all") params.status = statusFilter;
      if (bookingStatusFilter !== "all") {
        params.bookingStatus = bookingStatusFilter;
      }
      const response = await api.get(API_SAILINGS, {
        ...authConfig(),
        params,
      });
      setSailings(normalizeArray(response.data, "sailings"));
    } catch (err) {
      setSailings([]);
      setError(getErrorMessage(err, "Unable to load cruise sailings."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShips();
    loadItineraries();
  }, []);

  useEffect(() => {
    loadSailings();
  }, [shipFilter, itineraryFilter, statusFilter, bookingStatusFilter]);

  const filteredSailings = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return sailings;
    return sailings.filter((sailing) => {
      const values = [
        sailing.sailingCode,
        getName(sailing.shipId),
        getName(sailing.itineraryId),
        sailing.departurePort?.name,
        sailing.departurePort?.city,
        sailing.arrivalPort?.name,
        sailing.arrivalPort?.city,
      ];
      return values.some((value) =>
        String(value || "").toLowerCase().includes(query)
      );
    });
  }, [sailings, search]);

  const stats = useMemo(() => {
    return {
      total: sailings.length,
      active: sailings.filter((item) => item.status === "active").length,
      open: sailings.filter((item) => item.bookingStatus === "open").length,
      soldOut: sailings.filter((item) => item.bookingStatus === "sold-out").length,
    };
  }, [sailings]);

  const openAdd = () => {
    clearMessages();
    setEditingId("");
    const defaultShip =
      shipFilter !== "all"
        ? shipFilter
        : ships.length === 1
        ? ships[0]._id
        : "";
    const defaultItinerary =
      itineraryFilter !== "all"
        ? itineraryFilter
        : itineraries.length === 1
        ? itineraries[0]._id
        : "";
    setForm({
      ...EMPTY_FORM,
      shipId: defaultShip,
      itineraryId: defaultItinerary,
    });
    setShowForm(true);
  };

  const openEdit = (sailing) => {
    clearMessages();
    setEditingId(sailing._id);
    setForm({
      shipId: getId(sailing.shipId),
      itineraryId: getId(sailing.itineraryId),
      sailingCode: sailing.sailingCode || "",
      departureDate: toInputDate(sailing.departureDate),
      returnDate: toInputDate(sailing.returnDate),
      departurePort: {
        name: sailing.departurePort?.name || "",
        city: sailing.departurePort?.city || "",
        country: sailing.departurePort?.country || "",
        code: sailing.departurePort?.code || "",
      },
      arrivalPort: {
        name: sailing.arrivalPort?.name || "",
        city: sailing.arrivalPort?.city || "",
        country: sailing.arrivalPort?.country || "",
        code: sailing.arrivalPort?.code || "",
      },
      bookingOpenDate: toInputDate(sailing.bookingOpenDate),
      bookingCloseDate: toInputDate(sailing.bookingCloseDate),
      totalCapacity: String(sailing.totalCapacity ?? 0),
      availableCapacity: String(sailing.availableCapacity ?? 0),
      bookingStatus: sailing.bookingStatus || "open",
      status: sailing.status || "draft",
    });
    setShowForm(true);
  };

  const openView = (sailing) => {
    clearMessages();
    setSelectedSailing(sailing);
    setShowView(true);
  };

  const closeForm = () => {
    if (saving) return;
    setShowForm(false);
    setEditingId("");
    setForm(EMPTY_FORM);
  };

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handlePortChange = (portType, field, value) => {
    setForm((previous) => ({
      ...previous,
      [portType]: {
        ...previous[portType],
        [field]: value,
      },
    }));
  };

  const handleItineraryChange = (event) => {
    const itineraryId = event.target.value;
    const selected = itineraries.find((item) => item._id === itineraryId);
    setForm((previous) => ({
      ...previous,
      itineraryId,
      departurePort:
        selected?.departurePort?.name && !previous.departurePort.name
          ? {
              name: selected.departurePort.name || "",
              city: selected.departurePort.city || "",
              country: selected.departurePort.country || "",
              code: selected.departurePort.code || "",
            }
          : previous.departurePort,
      arrivalPort:
        selected?.arrivalPort?.name && !previous.arrivalPort.name
          ? {
              name: selected.arrivalPort.name || "",
              city: selected.arrivalPort.city || "",
              country: selected.arrivalPort.country || "",
              code: selected.arrivalPort.code || "",
            }
          : previous.arrivalPort,
    }));
  };

  const handleShipChange = (event) => {
    setForm((previous) => ({
      ...previous,
      shipId: event.target.value,
    }));
  };

  const validateForm = () => {
    if (!form.shipId) return "Please select a cruise ship.";
    if (!form.itineraryId) return "Please select an itinerary.";
    if (!form.sailingCode.trim()) return "Sailing code is required.";
    if (!form.departureDate) return "Departure date is required.";
    if (!form.returnDate) return "Return date is required.";
    if (new Date(form.returnDate) <= new Date(form.departureDate)) {
      return "Return date must be after departure date.";
    }
    if (!form.departurePort.name.trim()) {
      return "Departure port name is required.";
    }
    if (!form.arrivalPort.name.trim()) {
      return "Arrival port name is required.";
    }
    if (Number(form.totalCapacity) < 0 || Number(form.availableCapacity) < 0) {
      return "Capacity cannot be negative.";
    }
    if (Number(form.availableCapacity) > Number(form.totalCapacity)) {
      return "Available capacity cannot be greater than total capacity.";
    }
    if (
      form.bookingOpenDate &&
      form.bookingCloseDate &&
      new Date(form.bookingCloseDate) < new Date(form.bookingOpenDate)
    ) {
      return "Booking close date cannot be before booking open date.";
    }
    return "";
  };

  const buildPayload = () => ({
    shipId: form.shipId,
    itineraryId: form.itineraryId,
    sailingCode: form.sailingCode.trim().toUpperCase(),
    departureDate: form.departureDate,
    returnDate: form.returnDate,
    departurePort: form.departurePort,
    arrivalPort: form.arrivalPort,
    bookingOpenDate: form.bookingOpenDate || null,
    bookingCloseDate: form.bookingCloseDate || null,
    totalCapacity: Number(form.totalCapacity || 0),
    availableCapacity: Number(form.availableCapacity || 0),
    bookingStatus: form.bookingStatus,
    status: form.status,
  });

  const saveSailing = async (event) => {
    event.preventDefault();
    clearMessages();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    try {
      setSaving(true);
      const payload = buildPayload();
      if (editingId) {
        await api.put(`${API_SAILINGS}/${editingId}`, payload, authConfig());
        setNotice("Cruise sailing updated successfully.");
      } else {
        await api.post(API_SAILINGS, payload, authConfig());
        setNotice("Cruise sailing created successfully.");
      }
      closeForm();
      await loadSailings();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to save cruise sailing."));
    } finally {
      setSaving(false);
    }
  };

  const deleteSailing = async (sailing) => {
    if (!window.confirm(`Delete sailing ${sailing.sailingCode || ""}?`)) return;
    clearMessages();
    try {
      setDeletingId(sailing._id);
      await api.delete(`${API_SAILINGS}/${sailing._id}`, authConfig());
      setNotice("Cruise sailing deleted successfully.");
      await loadSailings();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to delete cruise sailing."));
    } finally {
      setDeletingId("");
    }
  };

  const resetFilters = () => {
    setSearch("");
    setShipFilter("all");
    setItineraryFilter("all");
    setStatusFilter("all");
    setBookingStatusFilter("all");
  };

  return (
    <div className="sailing-page">
      <div className="sailing-header">
        <div>
          <div className="sailing-kicker">
            <Ship size={16} />
            Cruise Operations
          </div>
          <h1>Cruise Sailing Management</h1>
          <p>Create and manage scheduled cruise departures connected to your ships and itineraries.</p>
        </div>
        <button className="sailing-primary-btn" onClick={openAdd}>
          <Plus size={18} />
          Add Sailing
        </button>
      </div>

      {error && (
        <div className="sailing-alert sailing-alert-error">
          <XCircle size={18} />
          <span>{error}</span>
          <button onClick={() => setError("")}><X size={16} /></button>
        </div>
      )}

      {notice && (
        <div className="sailing-alert sailing-alert-success">
          <CheckCircle2 size={18} />
          <span>{notice}</span>
          <button onClick={() => setNotice("")}><X size={16} /></button>
        </div>
      )}

      <div className="sailing-stats">
        <div className="sailing-stat-card">
          <div className="sailing-stat-icon"><CalendarDays size={20} /></div>
          <span>Total Sailings</span>
          <strong>{stats.total}</strong>
        </div>
        <div className="sailing-stat-card">
          <div className="sailing-stat-icon"><CheckCircle2 size={20} /></div>
          <span>Active</span>
          <strong>{stats.active}</strong>
        </div>
        <div className="sailing-stat-card">
          <div className="sailing-stat-icon"><Clock3 size={20} /></div>
          <span>Booking Open</span>
          <strong>{stats.open}</strong>
        </div>
        <div className="sailing-stat-card">
          <div className="sailing-stat-icon"><Users size={20} /></div>
          <span>Sold Out</span>
          <strong>{stats.soldOut}</strong>
        </div>
      </div>

      <div className="sailing-toolbar">
        <div className="sailing-search">
          <Search size={18} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search sailing code, ship, itinerary or port..."
          />
        </div>
        <select value={shipFilter} onChange={(event) => setShipFilter(event.target.value)}>
          <option value="all">All Ships</option>
          {ships.map((ship) => (
            <option key={ship._id} value={ship._id}>
              {getName(ship, "Unnamed Ship")}
            </option>
          ))}
        </select>
        <select value={itineraryFilter} onChange={(event) => setItineraryFilter(event.target.value)}>
          <option value="all">All Itineraries</option>
          {itineraries.map((itinerary) => (
            <option key={itinerary._id} value={itinerary._id}>
              {getName(itinerary, "Unnamed Itinerary")}
            </option>
          ))}
        </select>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="all">All Status</option>
          {STATUS_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select value={bookingStatusFilter} onChange={(event) => setBookingStatusFilter(event.target.value)}>
          <option value="all">All Booking</option>
          {BOOKING_STATUS_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <button className="sailing-refresh-btn" onClick={loadSailings} title="Refresh">
          <RefreshCw size={17} />
        </button>
        <button className="sailing-reset-btn" onClick={resetFilters}>Reset</button>
      </div>

      <div className="sailing-table-card">
        <div className="sailing-table-head">
          <div>
            <strong>Scheduled Sailings</strong>
            <span>{filteredSailings.length} result{filteredSailings.length === 1 ? "" : "s"}</span>
          </div>
          {(shipsLoading || itinerariesLoading) && <span className="sailing-loading-mini">Loading references...</span>}
        </div>

        {loading ? (
          <div className="sailing-empty">
            <RefreshCw size={24} className="sailing-spin" />
            <strong>Loading sailings...</strong>
          </div>
        ) : filteredSailings.length === 0 ? (
          <div className="sailing-empty">
            <Ship size={34} />
            <strong>No cruise sailings found</strong>
            <span>Create your first sailing or change the filters.</span>
            <button className="sailing-primary-btn" onClick={openAdd}>
              <Plus size={17} />
              Add Sailing
            </button>
          </div>
        ) : (
          <div className="sailing-table-wrap">
            <table className="sailing-table">
              <thead>
                <tr>
                  <th>Sailing</th>
                  <th>Ship</th>
                  <th>Itinerary</th>
                  <th>Departure</th>
                  <th>Return</th>
                  <th>Route</th>
                  <th>Capacity</th>
                  <th>Booking</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSailings.map((sailing) => (
                  <tr key={sailing._id}>
                    <td>
                      <div className="sailing-code">{sailing.sailingCode || "-"}</div>
                      <small>{formatDateTime(sailing.createdAt)}</small>
                    </td>
                    <td>
                      <div className="sailing-reference">
                        <Ship size={15} />
                        {getName(sailing.shipId)}
                      </div>
                    </td>
                    <td>
                      <div className="sailing-reference">
                        <Map size={15} />
                        {getName(sailing.itineraryId)}
                      </div>
                    </td>
                    <td>{formatDate(sailing.departureDate)}</td>
                    <td>{formatDate(sailing.returnDate)}</td>
                    <td>
                      <div className="sailing-route">
                        <span>{sailing.departurePort?.city || sailing.departurePort?.name || "-"}</span>
                        <ArrowRight size={14} />
                        <span>{sailing.arrivalPort?.city || sailing.arrivalPort?.name || "-"}</span>
                      </div>
                    </td>
                    <td>
                      <strong>{sailing.availableCapacity ?? 0}</strong>
                      <small> / {sailing.totalCapacity ?? 0} available</small>
                    </td>
                    <td>
                      <span className={`sailing-badge booking-${sailing.bookingStatus || "open"}`}>
                        {bookingStatusLabel(sailing.bookingStatus)}
                      </span>
                    </td>
                    <td>
                      <span className={`sailing-badge status-${sailing.status || "draft"}`}>
                        {statusLabel(sailing.status)}
                      </span>
                    </td>
                    <td>
                      <div className="sailing-actions">
                        <button onClick={() => openView(sailing)} title="View">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => openEdit(sailing)} title="Edit">
                          <Pencil size={16} />
                        </button>
                        <button
                          className="danger"
                          onClick={() => deleteSailing(sailing)}
                          disabled={deletingId === sailing._id}
                          title="Delete"
                        >
                          {deletingId === sailing._id ? <RefreshCw size={16} className="sailing-spin" /> : <Trash2 size={16} />}
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
        <div className="sailing-modal-backdrop">
          <div className="sailing-modal sailing-form-modal">
            <div className="sailing-modal-header">
              <div>
                <span>{editingId ? "UPDATE SAILING" : "NEW SAILING"}</span>
                <h2>{editingId ? "Edit Cruise Sailing" : "Add Cruise Sailing"}</h2>
              </div>
              <button onClick={closeForm} disabled={saving}><X size={20} /></button>
            </div>

            <form onSubmit={saveSailing}>
              <div className="sailing-form-section">
                <div className="sailing-section-title">
                  <Ship size={18} />
                  Cruise Reference
                </div>
                <div className="sailing-form-grid three">
                  <Field label="Cruise Ship" required>
                    <select value={form.shipId} onChange={handleShipChange} disabled={shipsLoading}>
                      <option value="">Select cruise ship</option>
                      {ships.map((ship) => (
                        <option key={ship._id} value={ship._id}>
                          {getName(ship, "Unnamed Ship")}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Itinerary" required>
                    <select value={form.itineraryId} onChange={handleItineraryChange} disabled={itinerariesLoading}>
                      <option value="">Select itinerary</option>
                      {itineraries.map((itinerary) => (
                        <option key={itinerary._id} value={itinerary._id}>
                          {getName(itinerary, "Unnamed Itinerary")}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Sailing Code" required hint="Unique for this vendor">
                    <input
                      name="sailingCode"
                      value={form.sailingCode}
                      onChange={handleFieldChange}
                      placeholder="e.g. SAIL-2026-001"
                    />
                  </Field>
                </div>
              </div>

              <div className="sailing-form-section">
                <div className="sailing-section-title">
                  <CalendarDays size={18} />
                  Sailing Dates
                </div>
                <div className="sailing-form-grid four">
                  <Field label="Departure Date" required>
                    <input type="date" name="departureDate" value={form.departureDate} onChange={handleFieldChange} />
                  </Field>
                  <Field label="Return Date" required>
                    <input type="date" name="returnDate" value={form.returnDate} onChange={handleFieldChange} />
                  </Field>
                  <Field label="Booking Open Date">
                    <input type="date" name="bookingOpenDate" value={form.bookingOpenDate} onChange={handleFieldChange} />
                  </Field>
                  <Field label="Booking Close Date">
                    <input type="date" name="bookingCloseDate" value={form.bookingCloseDate} onChange={handleFieldChange} />
                  </Field>
                </div>
              </div>

              <PortSection
                title="Departure Port"
                value={form.departurePort}
                onChange={(field, value) => handlePortChange("departurePort", field, value)}
              />
              <PortSection
                title="Arrival Port"
                value={form.arrivalPort}
                onChange={(field, value) => handlePortChange("arrivalPort", field, value)}
              />

              <div className="sailing-form-section">
                <div className="sailing-section-title">
                  <Users size={18} />
                  Capacity & Status
                </div>
                <div className="sailing-form-grid four">
                  <Field label="Total Capacity" required>
                    <input type="number" min="0" name="totalCapacity" value={form.totalCapacity} onChange={handleFieldChange} />
                  </Field>
                  <Field label="Available Capacity" required>
                    <input type="number" min="0" name="availableCapacity" value={form.availableCapacity} onChange={handleFieldChange} />
                  </Field>
                  <Field label="Booking Status">
                    <select name="bookingStatus" value={form.bookingStatus} onChange={handleFieldChange}>
                      {BOOKING_STATUS_OPTIONS.map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Sailing Status">
                    <select name="status" value={form.status} onChange={handleFieldChange}>
                      {STATUS_OPTIONS.map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </Field>
                </div>
              </div>

              <div className="sailing-modal-footer">
                <button type="button" className="sailing-secondary-btn" onClick={closeForm} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="sailing-primary-btn" disabled={saving}>
                  {saving ? <RefreshCw size={17} className="sailing-spin" /> : <Save size={17} />}
                  {saving ? "Saving..." : editingId ? "Update Sailing" : "Create Sailing"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showView && selectedSailing && (
        <div className="sailing-modal-backdrop">
          <div className="sailing-modal sailing-view-modal">
            <div className="sailing-modal-header">
              <div>
                <span>SAILING DETAILS</span>
                <h2>{selectedSailing.sailingCode || "Cruise Sailing"}</h2>
              </div>
              <button onClick={() => setShowView(false)}><X size={20} /></button>
            </div>

            <div className="sailing-view-content">
              <div className="sailing-view-summary">
                <div>
                  <span>Ship</span>
                  <strong>{getName(selectedSailing.shipId)}</strong>
                </div>
                <div>
                  <span>Itinerary</span>
                  <strong>{getName(selectedSailing.itineraryId)}</strong>
                </div>
                <div>
                  <span>Status</span>
                  <strong>{statusLabel(selectedSailing.status)}</strong>
                </div>
                <div>
                  <span>Booking</span>
                  <strong>{bookingStatusLabel(selectedSailing.bookingStatus)}</strong>
                </div>
              </div>

              <div className="sailing-detail-grid">
                <DetailItem label="Departure Date" value={formatDate(selectedSailing.departureDate)} />
                <DetailItem label="Return Date" value={formatDate(selectedSailing.returnDate)} />
                <DetailItem label="Booking Opens" value={formatDate(selectedSailing.bookingOpenDate)} />
                <DetailItem label="Booking Closes" value={formatDate(selectedSailing.bookingCloseDate)} />
                <DetailItem label="Total Capacity" value={String(selectedSailing.totalCapacity ?? 0)} />
                <DetailItem label="Available Capacity" value={String(selectedSailing.availableCapacity ?? 0)} />
              </div>

              <div className="sailing-route-card">
                <div>
                  <span>DEPARTURE</span>
                  <strong>{selectedSailing.departurePort?.name || "-"}</strong>
                  <small>
                    {[selectedSailing.departurePort?.city, selectedSailing.departurePort?.country, selectedSailing.departurePort?.code].filter(Boolean).join(" • ") || "Port details not available"}
                  </small>
                </div>
                <ArrowRight size={24} />
                <div>
                  <span>ARRIVAL</span>
                  <strong>{selectedSailing.arrivalPort?.name || "-"}</strong>
                  <small>
                    {[selectedSailing.arrivalPort?.city, selectedSailing.arrivalPort?.country, selectedSailing.arrivalPort?.code].filter(Boolean).join(" • ") || "Port details not available"}
                  </small>
                </div>
              </div>

              <div className="sailing-created-info">
                Created: {formatDateTime(selectedSailing.createdAt)} &nbsp; • &nbsp; Updated: {formatDateTime(selectedSailing.updatedAt)}
              </div>
            </div>

            <div className="sailing-modal-footer">
              <button className="sailing-secondary-btn" onClick={() => setShowView(false)}>Close</button>
              <button
                className="sailing-primary-btn"
                onClick={() => {
                  setShowView(false);
                  openEdit(selectedSailing);
                }}
              >
                <Pencil size={17} />
                Edit Sailing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, required, hint, children }) {
  return (
    <label className="sailing-field">
      <span>
        {label} {required && <b>*</b>}
      </span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}

function PortSection({ title, value, onChange }) {
  return (
    <div className="sailing-form-section">
      <div className="sailing-section-title">
        <Map size={18} />
        {title}
      </div>
      <div className="sailing-form-grid four">
        <Field label="Port Name" required>
          <input value={value.name} onChange={(event) => onChange("name", event.target.value)} placeholder="e.g. Mumbai Port" />
        </Field>
        <Field label="City">
          <input value={value.city} onChange={(event) => onChange("city", event.target.value)} placeholder="City" />
        </Field>
        <Field label="Country">
          <input value={value.country} onChange={(event) => onChange("country", event.target.value)} placeholder="Country" />
        </Field>
        <Field label="Port Code">
          <input value={value.code} onChange={(event) => onChange("code", event.target.value.toUpperCase())} placeholder="e.g. BOM" maxLength={10} />
        </Field>
      </div>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="sailing-detail-item">
      <span>{label}</span>
      <strong>{value || "-"}</strong>
    </div>
  );
}

export default CruiseSailingManagement;
