import React, { useEffect, useMemo, useState } from "react";
import "./CruiseItineraryManagement.css";
import axios from "axios";

const API_BASE = "https://bmtvendorfinal.onrender.com";
const API_ITINERARIES = "/api/cruise-itineraries";
const API_SHIPS = "/api/vendor/cruise/ships";

const getAuthConfig = () => {
  const token = localStorage.getItem("vendorToken");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

const emptyPort = {
  name: "",
  city: "",
  country: "",
  code: "",
};

const emptyStop = {
  day: "",
  portName: "",
  city: "",
  country: "",
  portCode: "",
  arrivalTime: "",
  departureTime: "",
  stayDuration: "",
  description: "",
  activities: [],
};

const initialForm = {
  shipId: "",
  itineraryName: "",
  itineraryCode: "",
  description: "",

  durationDays: "",
  durationNights: "",

  departurePort: { ...emptyPort },
  arrivalPort: { ...emptyPort },

  stops: [],

  destinations: [],
  activities: [],

  inclusions: [],
  exclusions: [],

  departureDate: "",
  returnDate: "",

  status: "draft",
};

const CruiseItineraryManagement = () => {
  const [itineraries, setItineraries] = useState([]);
  const [ships, setShips] = useState([]);

  const [loading, setLoading] = useState(false);
  const [shipsLoading, setShipsLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [viewItem, setViewItem] = useState(null);

  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [shipFilter, setShipFilter] = useState("");

  const [form, setForm] = useState(initialForm);

  const [coverImage, setCoverImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);

  const [existingCoverImage, setExistingCoverImage] = useState("");
  const [existingImages, setExistingImages] = useState([]);

  const [destinationInput, setDestinationInput] = useState("");
  const [activityInput, setActivityInput] = useState("");
  const [inclusionInput, setInclusionInput] = useState("");
  const [exclusionInput, setExclusionInput] = useState("");

  const [stopActivityInputs, setStopActivityInputs] = useState({});

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  /* =====================================================
     LOAD SHIPS
  ===================================================== */

  const loadShips = async () => {
    try {
      setShipsLoading(true);

      const response = await axios.get(
        `${API_BASE}${API_SHIPS}`,
        getAuthConfig()
      );

      const data = response.data;

      if (Array.isArray(data)) {
        setShips(data);
      } else if (Array.isArray(data.ships)) {
        setShips(data.ships);
      } else if (Array.isArray(data.data)) {
        setShips(data.data);
      } else {
        setShips([]);
      }
    } catch (error) {
      console.error("LOAD SHIPS ERROR:", error);

      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Failed to load cruise ships.",
      });
    } finally {
      setShipsLoading(false);
    }
  };

  /* =====================================================
     LOAD ITINERARIES
  ===================================================== */

  const loadItineraries = async () => {
    try {
      setLoading(true);

      const params = {};

      if (shipFilter) {
        params.shipId = shipFilter;
      }

      if (statusFilter) {
        params.status = statusFilter;
      }

      const response = await axios.get(
        `${API_BASE}${API_ITINERARIES}`,
        {
          ...getAuthConfig(),
          params,
        }
      );

      const data = response.data;

      if (Array.isArray(data)) {
        setItineraries(data);
      } else if (Array.isArray(data.itineraries)) {
        setItineraries(data.itineraries);
      } else if (Array.isArray(data.data)) {
        setItineraries(data.data);
      } else {
        setItineraries([]);
      }
    } catch (error) {
      console.error("LOAD ITINERARIES ERROR:", error);

      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Failed to load cruise itineraries.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShips();
  }, []);

  useEffect(() => {
    loadItineraries();
  }, [shipFilter, statusFilter]);

  /* =====================================================
     FILTER
  ===================================================== */

  const filteredItineraries = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return itineraries;
    }

    return itineraries.filter((item) => {
      const shipName =
        item.shipId?.shipName ||
        item.shipName ||
        "";

      return (
        item.itineraryName
          ?.toLowerCase()
          .includes(value) ||
        item.itineraryCode
          ?.toLowerCase()
          .includes(value) ||
        shipName
          .toLowerCase()
          .includes(value) ||
        item.departurePort?.name
          ?.toLowerCase()
          .includes(value) ||
        item.arrivalPort?.name
          ?.toLowerCase()
          .includes(value)
      );
    });
  }, [itineraries, search]);

  /* =====================================================
     FORM HELPERS
  ===================================================== */

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updatePort = (portType, field, value) => {
    setForm((prev) => ({
      ...prev,
      [portType]: {
        ...prev[portType],
        [field]: value,
      },
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);

    setCoverImage(null);
    setGalleryImages([]);

    setExistingCoverImage("");
    setExistingImages([]);

    setDestinationInput("");
    setActivityInput("");
    setInclusionInput("");
    setExclusionInput("");

    setStopActivityInputs({});

    setMessage({
      type: "",
      text: "",
    });
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    resetForm();
  };

  /* =====================================================
     ARRAY HELPERS
  ===================================================== */

  const addArrayItem = (field, value, setter) => {
    const cleanValue = value.trim();

    if (!cleanValue) return;

    setForm((prev) => ({
      ...prev,
      [field]: [...prev[field], cleanValue],
    }));

    setter("");
  };

  const removeArrayItem = (field, index) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  /* =====================================================
     STOPS
  ===================================================== */

  const addStop = () => {
    setForm((prev) => ({
      ...prev,
      stops: [
        ...prev.stops,
        {
          ...emptyStop,
          day: prev.stops.length + 1,
        },
      ],
    }));
  };

  const removeStop = (index) => {
    setForm((prev) => ({
      ...prev,
      stops: prev.stops
        .filter((_, i) => i !== index)
        .map((stop, i) => ({
          ...stop,
          day: i + 1,
        })),
    }));
  };

  const updateStop = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      stops: prev.stops.map((stop, i) =>
        i === index
          ? {
              ...stop,
              [field]: value,
            }
          : stop
      ),
    }));
  };

  const addStopActivity = (index) => {
    const value = (
      stopActivityInputs[index] || ""
    ).trim();

    if (!value) return;

    setForm((prev) => ({
      ...prev,
      stops: prev.stops.map((stop, i) =>
        i === index
          ? {
              ...stop,
              activities: [
                ...(stop.activities || []),
                value,
              ],
            }
          : stop
      ),
    }));

    setStopActivityInputs((prev) => ({
      ...prev,
      [index]: "",
    }));
  };

  const removeStopActivity = (stopIndex, activityIndex) => {
    setForm((prev) => ({
      ...prev,
      stops: prev.stops.map((stop, i) =>
        i === stopIndex
          ? {
              ...stop,
              activities: stop.activities.filter(
                (_, index) => index !== activityIndex
              ),
            }
          : stop
      ),
    }));
  };

  /* =====================================================
     EDIT
  ===================================================== */

  const openEditModal = async (item) => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API_BASE}${API_ITINERARIES}/${item._id}`,
        getAuthConfig()
      );

      const itinerary =
        response.data?.itinerary || item;

      setEditingId(itinerary._id);

      setForm({
        shipId:
          itinerary.shipId?._id ||
          itinerary.shipId ||
          "",

        itineraryName:
          itinerary.itineraryName || "",

        itineraryCode:
          itinerary.itineraryCode || "",

        description:
          itinerary.description || "",

        durationDays:
          itinerary.durationDays ?? "",

        durationNights:
          itinerary.durationNights ?? "",

        departurePort: {
          name:
            itinerary.departurePort?.name || "",
          city:
            itinerary.departurePort?.city || "",
          country:
            itinerary.departurePort?.country || "",
          code:
            itinerary.departurePort?.code || "",
        },

        arrivalPort: {
          name:
            itinerary.arrivalPort?.name || "",
          city:
            itinerary.arrivalPort?.city || "",
          country:
            itinerary.arrivalPort?.country || "",
          code:
            itinerary.arrivalPort?.code || "",
        },

        stops: Array.isArray(itinerary.stops)
          ? itinerary.stops
          : [],

        destinations:
          Array.isArray(itinerary.destinations)
            ? itinerary.destinations
            : [],

        activities:
          Array.isArray(itinerary.activities)
            ? itinerary.activities
            : [],

        inclusions:
          Array.isArray(itinerary.inclusions)
            ? itinerary.inclusions
            : [],

        exclusions:
          Array.isArray(itinerary.exclusions)
            ? itinerary.exclusions
            : [],

        departureDate: itinerary.departureDate
          ? formatDateForInput(
              itinerary.departureDate
            )
          : "",

        returnDate: itinerary.returnDate
          ? formatDateForInput(
              itinerary.returnDate
            )
          : "",

        status: itinerary.status || "draft",
      });

      setExistingCoverImage(
        itinerary.coverImage || ""
      );

      setExistingImages(
        Array.isArray(itinerary.images)
          ? itinerary.images
          : []
      );

      setCoverImage(null);
      setGalleryImages([]);

      setShowModal(true);
    } catch (error) {
      console.error("EDIT ITINERARY ERROR:", error);

      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Failed to load itinerary.",
      });
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     DATE
  ===================================================== */

  const formatDateForInput = (date) => {
    const d = new Date(date);

    if (Number.isNaN(d.getTime())) {
      return "";
    }

    const year = d.getFullYear();
    const month = String(
      d.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      d.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  /* =====================================================
     SAVE
  ===================================================== */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.shipId) {
      setMessage({
        type: "error",
        text: "Please select a cruise ship.",
      });
      return;
    }

    if (!form.itineraryName.trim()) {
      setMessage({
        type: "error",
        text: "Itinerary name is required.",
      });
      return;
    }

    if (!form.durationDays) {
      setMessage({
        type: "error",
        text: "Duration days is required.",
      });
      return;
    }

    if (
      form.durationNights === "" ||
      form.durationNights === null
    ) {
      setMessage({
        type: "error",
        text: "Duration nights is required.",
      });
      return;
    }

    if (!form.departurePort.name.trim()) {
      setMessage({
        type: "error",
        text: "Departure port name is required.",
      });
      return;
    }

    if (!form.arrivalPort.name.trim()) {
      setMessage({
        type: "error",
        text: "Arrival port name is required.",
      });
      return;
    }

    try {
      setSaving(true);

      const data = new FormData();

      data.append("shipId", form.shipId);
      data.append(
        "itineraryName",
        form.itineraryName.trim()
      );
      data.append(
        "itineraryCode",
        form.itineraryCode.trim()
      );
      data.append(
        "description",
        form.description.trim()
      );

      data.append(
        "durationDays",
        String(form.durationDays)
      );

      data.append(
        "durationNights",
        String(form.durationNights)
      );

      data.append(
        "departurePort",
        JSON.stringify(form.departurePort)
      );

      data.append(
        "arrivalPort",
        JSON.stringify(form.arrivalPort)
      );

      data.append(
        "stops",
        JSON.stringify(form.stops)
      );

      data.append(
        "destinations",
        JSON.stringify(form.destinations)
      );

      data.append(
        "activities",
        JSON.stringify(form.activities)
      );

      data.append(
        "inclusions",
        JSON.stringify(form.inclusions)
      );

      data.append(
        "exclusions",
        JSON.stringify(form.exclusions)
      );

      if (form.departureDate) {
        data.append(
          "departureDate",
          form.departureDate
        );
      }

      if (form.returnDate) {
        data.append(
          "returnDate",
          form.returnDate
        );
      }

      data.append("status", form.status);

      if (coverImage) {
        data.append(
          "coverImage",
          coverImage
        );
      }

      galleryImages.forEach((file) => {
        data.append("images", file);
      });

      const config = {
        ...getAuthConfig(),
        headers: {
          ...getAuthConfig().headers,
          "Content-Type": "multipart/form-data",
        },
      };

      let response;

      if (editingId) {
        response = await axios.put(
          `${API_BASE}${API_ITINERARIES}/${editingId}`,
          data,
          config
        );
      } else {
        response = await axios.post(
          `${API_BASE}${API_ITINERARIES}`,
          data,
          config
        );
      }

      setMessage({
        type: "success",
        text:
          response.data?.message ||
          "Itinerary saved successfully.",
      });

      setShowModal(false);
      resetForm();

      await loadItineraries();
    } catch (error) {
      console.error("SAVE ITINERARY ERROR:", error);

      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          error.message ||
          "Failed to save itinerary.",
      });
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     DELETE
  ===================================================== */

  const deleteItinerary = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this itinerary?"
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      const response = await axios.delete(
        `${API_BASE}${API_ITINERARIES}/${id}`,
        getAuthConfig()
      );

      setMessage({
        type: "success",
        text:
          response.data?.message ||
          "Itinerary deleted successfully.",
      });

      await loadItineraries();
    } catch (error) {
      console.error("DELETE ITINERARY ERROR:", error);

      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Failed to delete itinerary.",
      });
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     STATS
  ===================================================== */

  const stats = useMemo(() => {
    return {
      total: itineraries.length,

      active: itineraries.filter(
        (item) => item.status === "active"
      ).length,

      draft: itineraries.filter(
        (item) => item.status === "draft"
      ).length,

      inactive: itineraries.filter(
        (item) => item.status === "inactive"
      ).length,
    };
  }, [itineraries]);

  /* =====================================================
     SHIP NAME
  ===================================================== */

  const getShipName = (item) => {
    return (
      item.shipId?.shipName ||
      ships.find(
        (ship) =>
          ship._id ===
          (item.shipId?._id || item.shipId)
      )?.shipName ||
      "Unknown Ship"
    );
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="cruise-itinerary-page">
      <div className="itinerary-header">
        <div>
          <span className="page-eyebrow">
            CRUISE MANAGEMENT
          </span>

          <h1>Itinerary Management</h1>

          <p>
            Create and manage complete cruise
            itineraries, daily stops and port
            schedules.
          </p>
        </div>

        <button
          className="primary-btn"
          onClick={openAddModal}
        >
          <span>+</span>
          Add Itinerary
        </button>
      </div>

      {message.text && (
        <div
          className={`alert ${
            message.type === "error"
              ? "alert-error"
              : "alert-success"
          }`}
        >
          {message.text}

          <button
            onClick={() =>
              setMessage({
                type: "",
                text: "",
              })
            }
          >
            ×
          </button>
        </div>
      )}

      {/* =================================================
          STATS
      ================================================= */}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🗺️</div>

          <div>
            <span>Total Itineraries</span>
            <strong>{stats.total}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✓</div>

          <div>
            <span>Active</span>
            <strong>{stats.active}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📝</div>

          <div>
            <span>Draft</span>
            <strong>{stats.draft}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">◷</div>

          <div>
            <span>Inactive</span>
            <strong>{stats.inactive}</strong>
          </div>
        </div>
      </div>

      {/* =================================================
          FILTERS
      ================================================= */}

      <div className="filter-card">
        <div className="search-box">
          <span>⌕</span>

          <input
            type="text"
            placeholder="Search itinerary, code, ship or port..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        <select
          value={shipFilter}
          onChange={(e) =>
            setShipFilter(e.target.value)
          }
        >
          <option value="">All Ships</option>

          {ships.map((ship) => (
            <option
              key={ship._id}
              value={ship._id}
            >
              {ship.shipName}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="inactive">
            Inactive
          </option>
        </select>

        <button
          className="refresh-btn"
          onClick={loadItineraries}
          disabled={loading}
        >
          ↻ Refresh
        </button>
      </div>

      {/* =================================================
          TABLE
      ================================================= */}

      <div className="table-card">
        <div className="table-header">
          <div>
            <h2>Cruise Itineraries</h2>

            <span>
              {filteredItineraries.length} itinerary
              {filteredItineraries.length !== 1
                ? "ies"
                : ""}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="table-loading">
            <div className="spinner" />
            Loading itineraries...
          </div>
        ) : filteredItineraries.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              🗺️
            </div>

            <h3>No itineraries found</h3>

            <p>
              Create your first cruise itinerary
              to get started.
            </p>

            <button
              className="primary-btn"
              onClick={openAddModal}
            >
              + Add Itinerary
            </button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ITINERARY</th>
                  <th>SHIP</th>
                  <th>DURATION</th>
                  <th>ROUTE</th>
                  <th>STOPS</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {filteredItineraries.map(
                  (item) => (
                    <tr key={item._id}>
                      <td>
                        <div className="itinerary-cell">
                          <div className="thumb">
                            {item.coverImage ? (
                              <img
                                src={
                                  item.coverImage
                                }
                                alt={
                                  item.itineraryName
                                }
                              />
                            ) : (
                              <span>🛳️</span>
                            )}
                          </div>

                          <div>
                            <strong>
                              {
                                item.itineraryName
                              }
                            </strong>

                            <small>
                              {item.itineraryCode ||
                                "No code"}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="ship-name">
                          {getShipName(item)}
                        </span>
                      </td>

                      <td>
                        <strong>
                          {item.durationDays}
                        </strong>{" "}
                        Days
                        <br />
                        <small>
                          {item.durationNights} Nights
                        </small>
                      </td>

                      <td>
                        <div className="route-cell">
                          <span>
                            {
                              item.departurePort
                                ?.name
                            }
                          </span>

                          <b>→</b>

                          <span>
                            {
                              item.arrivalPort
                                ?.name
                            }
                          </span>
                        </div>
                      </td>

                      <td>
                        <span className="count-pill">
                          {item.stops?.length || 0}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`status-badge status-${item.status}`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td>
                        <div className="action-buttons">
                          <button
                            title="View"
                            onClick={() =>
                              setViewItem(item)
                            }
                          >
                            👁
                          </button>

                          <button
                            title="Edit"
                            onClick={() =>
                              openEditModal(item)
                            }
                          >
                            ✎
                          </button>

                          <button
                            title="Delete"
                            className="delete-action"
                            onClick={() =>
                              deleteItinerary(
                                item._id
                              )
                            }
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =================================================
          ADD / EDIT MODAL
      ================================================= */}

      {showModal && (
        <div className="modal-overlay">
          <div className="itinerary-modal">
            <div className="modal-header">
              <div>
                <span className="page-eyebrow">
                  CRUISE ITINERARY
                </span>

                <h2>
                  {editingId
                    ? "Edit Itinerary"
                    : "Create Itinerary"}
                </h2>
              </div>

              <button
                className="modal-close"
                onClick={closeModal}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* BASIC */}

              <section className="form-section">
                <div className="section-title">
                  <span>01</span>

                  <div>
                    <h3>Basic Information</h3>

                    <p>
                      Define the itinerary and
                      cruise ship.
                    </p>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="field full">
                    <label>
                      Cruise Ship *
                    </label>

                    <select
                      value={form.shipId}
                      onChange={(e) =>
                        updateField(
                          "shipId",
                          e.target.value
                        )
                      }
                      required
                    >
                      <option value="">
                        {shipsLoading
                          ? "Loading ships..."
                          : "Select cruise ship"}
                      </option>

                      {ships.map((ship) => (
                        <option
                          key={ship._id}
                          value={ship._id}
                        >
                          {ship.shipName}
                          {ship.cruiseLineName
                            ? ` — ${ship.cruiseLineName}`
                            : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field">
                    <label>
                      Itinerary Name *
                    </label>

                    <input
                      type="text"
                      value={
                        form.itineraryName
                      }
                      onChange={(e) =>
                        updateField(
                          "itineraryName",
                          e.target.value
                        )
                      }
                      placeholder="e.g. Mediterranean Explorer"
                      required
                    />
                  </div>

                  <div className="field">
                    <label>
                      Itinerary Code
                    </label>

                    <input
                      type="text"
                      value={
                        form.itineraryCode
                      }
                      onChange={(e) =>
                        updateField(
                          "itineraryCode",
                          e.target.value
                        )
                      }
                      placeholder="MED-001"
                    />
                  </div>

                  <div className="field">
                    <label>
                      Duration Days *
                    </label>

                    <input
                      type="number"
                      min="1"
                      value={
                        form.durationDays
                      }
                      onChange={(e) =>
                        updateField(
                          "durationDays",
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>

                  <div className="field">
                    <label>
                      Duration Nights *
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={
                        form.durationNights
                      }
                      onChange={(e) =>
                        updateField(
                          "durationNights",
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>

                  <div className="field full">
                    <label>
                      Description
                    </label>

                    <textarea
                      rows="4"
                      value={
                        form.description
                      }
                      onChange={(e) =>
                        updateField(
                          "description",
                          e.target.value
                        )
                      }
                      placeholder="Describe the cruise itinerary..."
                    />
                  </div>
                </div>
              </section>

              {/* PORTS */}

              <section className="form-section">
                <div className="section-title">
                  <span>02</span>

                  <div>
                    <h3>Ports</h3>

                    <p>
                      Define departure and
                      arrival ports.
                    </p>
                  </div>
                </div>

                <div className="port-grid">
                  <div className="port-card">
                    <div className="port-heading">
                      <span>DEPARTURE</span>
                      <b>🚢</b>
                    </div>

                    <div className="field">
                      <label>
                        Port Name *
                      </label>

                      <input
                        type="text"
                        value={
                          form.departurePort
                            .name
                        }
                        onChange={(e) =>
                          updatePort(
                            "departurePort",
                            "name",
                            e.target.value
                          )
                        }
                        placeholder="Port of Miami"
                        required
                      />
                    </div>

                    <div className="two-fields">
                      <div className="field">
                        <label>City</label>

                        <input
                          type="text"
                          value={
                            form
                              .departurePort
                              .city
                          }
                          onChange={(e) =>
                            updatePort(
                              "departurePort",
                              "city",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div className="field">
                        <label>Country</label>

                        <input
                          type="text"
                          value={
                            form
                              .departurePort
                              .country
                          }
                          onChange={(e) =>
                            updatePort(
                              "departurePort",
                              "country",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>

                    <div className="field">
                      <label>
                        Port Code
                      </label>

                      <input
                        type="text"
                        value={
                          form
                            .departurePort
                            .code
                        }
                        onChange={(e) =>
                          updatePort(
                            "departurePort",
                            "code",
                            e.target.value
                          )
                        }
                        placeholder="MIA"
                      />
                    </div>
                  </div>

                  <div className="port-card">
                    <div className="port-heading">
                      <span>ARRIVAL</span>
                      <b>⚓</b>
                    </div>

                    <div className="field">
                      <label>
                        Port Name *
                      </label>

                      <input
                        type="text"
                        value={
                          form.arrivalPort.name
                        }
                        onChange={(e) =>
                          updatePort(
                            "arrivalPort",
                            "name",
                            e.target.value
                          )
                        }
                        placeholder="Port of Barcelona"
                        required
                      />
                    </div>

                    <div className="two-fields">
                      <div className="field">
                        <label>City</label>

                        <input
                          type="text"
                          value={
                            form.arrivalPort
                              .city
                          }
                          onChange={(e) =>
                            updatePort(
                              "arrivalPort",
                              "city",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div className="field">
                        <label>Country</label>

                        <input
                          type="text"
                          value={
                            form.arrivalPort
                              .country
                          }
                          onChange={(e) =>
                            updatePort(
                              "arrivalPort",
                              "country",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>

                    <div className="field">
                      <label>
                        Port Code
                      </label>

                      <input
                        type="text"
                        value={
                          form.arrivalPort.code
                        }
                        onChange={(e) =>
                          updatePort(
                            "arrivalPort",
                            "code",
                            e.target.value
                          )
                        }
                        placeholder="BCN"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* STOPS */}

              <section className="form-section">
                <div className="section-title-row">
                  <div className="section-title">
                    <span>03</span>

                    <div>
                      <h3>Daily Route & Stops</h3>

                      <p>
                        Add ports and activities
                        for every cruise day.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={addStop}
                  >
                    + Add Day
                  </button>
                </div>

                <div className="stops-list">
                  {form.stops.length === 0 ? (
                    <div className="no-stops">
                      <span>🗺️</span>

                      <p>
                        No daily stops added yet.
                      </p>

                      <button
                        type="button"
                        onClick={addStop}
                      >
                        Add first day
                      </button>
                    </div>
                  ) : (
                    form.stops.map(
                      (stop, index) => (
                        <div
                          className="stop-card"
                          key={index}
                        >
                          <div className="stop-top">
                            <div className="day-badge">
                              DAY{" "}
                              {index + 1}
                            </div>

                            <button
                              type="button"
                              className="remove-btn"
                              onClick={() =>
                                removeStop(
                                  index
                                )
                              }
                            >
                              Remove
                            </button>
                          </div>

                          <div className="form-grid">
                            <div className="field">
                              <label>
                                Port Name *
                              </label>

                              <input
                                type="text"
                                value={
                                  stop.portName
                                }
                                onChange={(e) =>
                                  updateStop(
                                    index,
                                    "portName",
                                    e.target.value
                                  )
                                }
                                required
                              />
                            </div>

                            <div className="field">
                              <label>
                                Port Code
                              </label>

                              <input
                                type="text"
                                value={
                                  stop.portCode
                                }
                                onChange={(e) =>
                                  updateStop(
                                    index,
                                    "portCode",
                                    e.target.value
                                  )
                                }
                              />
                            </div>

                            <div className="field">
                              <label>
                                City
                              </label>

                              <input
                                type="text"
                                value={
                                  stop.city
                                }
                                onChange={(e) =>
                                  updateStop(
                                    index,
                                    "city",
                                    e.target.value
                                  )
                                }
                              />
                            </div>

                            <div className="field">
                              <label>
                                Country
                              </label>

                              <input
                                type="text"
                                value={
                                  stop.country
                                }
                                onChange={(e) =>
                                  updateStop(
                                    index,
                                    "country",
                                    e.target.value
                                  )
                                }
                              />
                            </div>

                            <div className="field">
                              <label>
                                Arrival Time
                              </label>

                              <input
                                type="time"
                                value={
                                  stop.arrivalTime
                                }
                                onChange={(e) =>
                                  updateStop(
                                    index,
                                    "arrivalTime",
                                    e.target.value
                                  )
                                }
                              />
                            </div>

                            <div className="field">
                              <label>
                                Departure Time
                              </label>

                              <input
                                type="time"
                                value={
                                  stop.departureTime
                                }
                                onChange={(e) =>
                                  updateStop(
                                    index,
                                    "departureTime",
                                    e.target.value
                                  )
                                }
                              />
                            </div>

                            <div className="field">
                              <label>
                                Stay Duration
                              </label>

                              <input
                                type="text"
                                value={
                                  stop.stayDuration
                                }
                                onChange={(e) =>
                                  updateStop(
                                    index,
                                    "stayDuration",
                                    e.target.value
                                  )
                                }
                                placeholder="6 hours"
                              />
                            </div>

                            <div className="field full">
                              <label>
                                Stop Description
                              </label>

                              <textarea
                                rows="2"
                                value={
                                  stop.description
                                }
                                onChange={(e) =>
                                  updateStop(
                                    index,
                                    "description",
                                    e.target.value
                                  )
                                }
                              />
                            </div>

                            <div className="field full">
                              <label>
                                Activities
                              </label>

                              <div className="inline-input">
                                <input
                                  type="text"
                                  value={
                                    stopActivityInputs[
                                      index
                                    ] || ""
                                  }
                                  onChange={(e) =>
                                    setStopActivityInputs(
                                      (prev) => ({
                                        ...prev,
                                        [index]:
                                          e.target
                                            .value,
                                      })
                                    )
                                  }
                                  placeholder="e.g. City Tour"
                                  onKeyDown={(
                                    e
                                  ) => {
                                    if (
                                      e.key ===
                                      "Enter"
                                    ) {
                                      e.preventDefault();
                                      addStopActivity(
                                        index
                                      );
                                    }
                                  }}
                                />

                                <button
                                  type="button"
                                  onClick={() =>
                                    addStopActivity(
                                      index
                                    )
                                  }
                                >
                                  Add
                                </button>
                              </div>

                              <div className="tag-list">
                                {(
                                  stop.activities ||
                                  []
                                ).map(
                                  (
                                    activity,
                                    activityIndex
                                  ) => (
                                    <span
                                      className="tag"
                                      key={
                                        activityIndex
                                      }
                                    >
                                      {
                                        activity
                                      }

                                      <button
                                        type="button"
                                        onClick={() =>
                                          removeStopActivity(
                                            index,
                                            activityIndex
                                          )
                                        }
                                      >
                                        ×
                                      </button>
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    )
                  )}
                </div>
              </section>

              {/* TAGS */}

              <section className="form-section">
                <div className="section-title">
                  <span>04</span>

                  <div>
                    <h3>
                      Destinations & Activities
                    </h3>

                    <p>
                      Add highlights of the
                      itinerary.
                    </p>
                  </div>
                </div>

                <TagInput
                  label="Destinations"
                  placeholder="e.g. Barcelona"
                  value={destinationInput}
                  setValue={setDestinationInput}
                  items={form.destinations}
                  addItem={() =>
                    addArrayItem(
                      "destinations",
                      destinationInput,
                      setDestinationInput
                    )
                  }
                  removeItem={(index) =>
                    removeArrayItem(
                      "destinations",
                      index
                    )
                  }
                />

                <TagInput
                  label="Activities"
                  placeholder="e.g. Snorkeling"
                  value={activityInput}
                  setValue={setActivityInput}
                  items={form.activities}
                  addItem={() =>
                    addArrayItem(
                      "activities",
                      activityInput,
                      setActivityInput
                    )
                  }
                  removeItem={(index) =>
                    removeArrayItem(
                      "activities",
                      index
                    )
                  }
                />
              </section>

              {/* INCLUSION */}

              <section className="form-section">
                <div className="section-title">
                  <span>05</span>

                  <div>
                    <h3>
                      Inclusions & Exclusions
                    </h3>

                    <p>
                      Clearly define what is
                      included in the cruise.
                    </p>
                  </div>
                </div>

                <TagInput
                  label="What's Included"
                  placeholder="e.g. Breakfast"
                  value={inclusionInput}
                  setValue={setInclusionInput}
                  items={form.inclusions}
                  addItem={() =>
                    addArrayItem(
                      "inclusions",
                      inclusionInput,
                      setInclusionInput
                    )
                  }
                  removeItem={(index) =>
                    removeArrayItem(
                      "inclusions",
                      index
                    )
                  }
                  positive
                />

                <TagInput
                  label="What's Excluded"
                  placeholder="e.g. Port taxes"
                  value={exclusionInput}
                  setValue={setExclusionInput}
                  items={form.exclusions}
                  addItem={() =>
                    addArrayItem(
                      "exclusions",
                      exclusionInput,
                      setExclusionInput
                    )
                  }
                  removeItem={(index) =>
                    removeArrayItem(
                      "exclusions",
                      index
                    )
                  }
                  negative
                />
              </section>

              {/* SCHEDULE */}

              <section className="form-section">
                <div className="section-title">
                  <span>06</span>

                  <div>
                    <h3>Schedule & Status</h3>

                    <p>
                      Set sailing dates and
                      publication status.
                    </p>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="field">
                    <label>
                      Departure Date
                    </label>

                    <input
                      type="date"
                      value={
                        form.departureDate
                      }
                      onChange={(e) =>
                        updateField(
                          "departureDate",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="field">
                    <label>
                      Return Date
                    </label>

                    <input
                      type="date"
                      value={
                        form.returnDate
                      }
                      onChange={(e) =>
                        updateField(
                          "returnDate",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="field">
                    <label>Status</label>

                    <select
                      value={form.status}
                      onChange={(e) =>
                        updateField(
                          "status",
                          e.target.value
                        )
                      }
                    >
                      <option value="draft">
                        Draft
                      </option>

                      <option value="active">
                        Active
                      </option>

                      <option value="inactive">
                        Inactive
                      </option>
                    </select>
                  </div>
                </div>
              </section>

              {/* MEDIA */}

              <section className="form-section">
                <div className="section-title">
                  <span>07</span>

                  <div>
                    <h3>Media</h3>

                    <p>
                      Upload itinerary cover and
                      gallery images.
                    </p>
                  </div>
                </div>

                <div className="media-grid">
                  <div className="upload-card">
                    <label>
                      Cover Image
                    </label>

                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={(e) =>
                        setCoverImage(
                          e.target.files?.[0] ||
                            null
                        )
                      }
                    />

                    {coverImage ? (
                      <div className="selected-file">
                        <span>✓</span>

                        {coverImage.name}
                      </div>
                    ) : existingCoverImage ? (
                      <img
                        className="existing-cover"
                        src={
                          existingCoverImage
                        }
                        alt="Existing cover"
                      />
                    ) : null}
                  </div>

                  <div className="upload-card">
                    <label>
                      Gallery Images
                    </label>

                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={(e) =>
                        setGalleryImages(
                          Array.from(
                            e.target.files || []
                          )
                        )
                      }
                    />

                    {galleryImages.length >
                      0 && (
                      <div className="selected-file">
                        <span>✓</span>

                        {
                          galleryImages.length
                        }{" "}
                        image
                        {galleryImages.length !==
                        1
                          ? "s"
                          : ""}{" "}
                        selected
                      </div>
                    )}

                    {editingId &&
                      existingImages.length >
                        0 && (
                        <div className="existing-gallery">
                          {existingImages.map(
                            (
                              image,
                              index
                            ) => (
                              <img
                                key={index}
                                src={image}
                                alt={`Gallery ${
                                  index + 1
                                }`}
                              />
                            )
                          )}
                        </div>
                      )}
                  </div>
                </div>
              </section>

              {/* FOOTER */}

              <div className="modal-footer">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Itinerary"
                    : "Create Itinerary"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================
          VIEW MODAL
      ================================================= */}

      {viewItem && (
        <div className="modal-overlay">
          <div className="view-modal">
            <div className="modal-header">
              <div>
                <span className="page-eyebrow">
                  ITINERARY DETAILS
                </span>

                <h2>
                  {viewItem.itineraryName}
                </h2>
              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setViewItem(null)
                }
              >
                ×
              </button>
            </div>

            {viewItem.coverImage && (
              <img
                className="view-cover"
                src={viewItem.coverImage}
                alt={viewItem.itineraryName}
              />
            )}

            <div className="view-content">
              <div className="view-summary">
                <div>
                  <span>SHIP</span>
                  <strong>
                    {getShipName(viewItem)}
                  </strong>
                </div>

                <div>
                  <span>DURATION</span>
                  <strong>
                    {viewItem.durationDays} Days /{" "}
                    {viewItem.durationNights}{" "}
                    Nights
                  </strong>
                </div>

                <div>
                  <span>STATUS</span>
                  <strong>
                    {viewItem.status}
                  </strong>
                </div>
              </div>

              {viewItem.description && (
                <div className="view-block">
                  <h3>Description</h3>
                  <p>
                    {viewItem.description}
                  </p>
                </div>
              )}

              <div className="view-route">
                <div>
                  <span>DEPARTURE</span>
                  <strong>
                    {
                      viewItem.departurePort
                        ?.name
                    }
                  </strong>
                  <small>
                    {
                      viewItem.departurePort
                        ?.city
                    }
                    {viewItem.departurePort
                      ?.city &&
                    viewItem.departurePort
                      ?.country
                      ? ", "
                      : ""}
                    {
                      viewItem.departurePort
                        ?.country
                    }
                  </small>
                </div>

                <div className="route-arrow">
                  →
                </div>

                <div>
                  <span>ARRIVAL</span>
                  <strong>
                    {
                      viewItem.arrivalPort
                        ?.name
                    }
                  </strong>
                  <small>
                    {
                      viewItem.arrivalPort
                        ?.city
                    }
                    {viewItem.arrivalPort
                      ?.city &&
                    viewItem.arrivalPort
                      ?.country
                      ? ", "
                      : ""}
                    {
                      viewItem.arrivalPort
                        ?.country
                    }
                  </small>
                </div>
              </div>

              <div className="view-block">
                <h3>Daily Stops</h3>

                <div className="view-stops">
                  {viewItem.stops?.length ? (
                    viewItem.stops.map(
                      (stop, index) => (
                        <div
                          className="view-stop"
                          key={index}
                        >
                          <div className="view-day">
                            {stop.day ||
                              index + 1}
                          </div>

                          <div>
                            <strong>
                              {
                                stop.portName
                              }
                            </strong>

                            <small>
                              {stop.city}
                              {stop.city &&
                              stop.country
                                ? ", "
                                : ""}
                              {
                                stop.country
                              }
                            </small>

                            {(
                              stop.activities ||
                              []
                            ).length >
                              0 && (
                              <div className="mini-tags">
                                {stop.activities.map(
                                  (
                                    activity,
                                    i
                                  ) => (
                                    <span
                                      key={i}
                                    >
                                      {
                                        activity
                                      }
                                    </span>
                                  )
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    )
                  ) : (
                    <p>
                      No stops added.
                    </p>
                  )}
                </div>
              </div>

              <div className="view-two-column">
                <ViewTags
                  title="Destinations"
                  items={
                    viewItem.destinations
                  }
                />

                <ViewTags
                  title="Activities"
                  items={
                    viewItem.activities
                  }
                />

                <ViewTags
                  title="Inclusions"
                  items={
                    viewItem.inclusions
                  }
                />

                <ViewTags
                  title="Exclusions"
                  items={
                    viewItem.exclusions
                  }
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* =====================================================
   TAG INPUT
===================================================== */

const TagInput = ({
  label,
  placeholder,
  value,
  setValue,
  items,
  addItem,
  removeItem,
  positive,
  negative,
}) => {
  return (
    <div className="tag-input-section">
      <label>{label}</label>

      <div className="inline-input">
        <input
          type="text"
          value={value}
          onChange={(e) =>
            setValue(e.target.value)
          }
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addItem();
            }
          }}
        />

        <button
          type="button"
          onClick={addItem}
        >
          Add
        </button>
      </div>

      <div className="tag-list">
        {items.map((item, index) => (
          <span
            className={`tag ${
              positive
                ? "tag-positive"
                : negative
                ? "tag-negative"
                : ""
            }`}
            key={index}
          >
            {positive && "✓ "}
            {negative && "× "}
            {item}

            <button
              type="button"
              onClick={() =>
                removeItem(index)
              }
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

/* =====================================================
   VIEW TAGS
===================================================== */

const ViewTags = ({ title, items }) => {
  if (!items?.length) return null;

  return (
    <div className="view-block">
      <h3>{title}</h3>

      <div className="mini-tags">
        {items.map((item, index) => (
          <span key={index}>{item}</span>
        ))}
      </div>
    </div>
  );
};

export default CruiseItineraryManagement;