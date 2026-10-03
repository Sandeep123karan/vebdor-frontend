import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  CalendarDays,
  Plus,
  Search,
  RefreshCw,
  Edit3,
  Trash2,
  X,
  Save,
  MapPin,
  Users,
  IndianRupee,
  Clock3,
  ChevronDown,
} from "lucide-react";

const API =
  process.env.REACT_APP_API_URL || "https://bmtvendorfinal.onrender.com";

const TOKEN_KEY = "vendorToken";

const api = axios.create({
  baseURL: API,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = "/vendor-login";
    }

    return Promise.reject(error);
  }
);

const STATUS_OPTIONS = [
  "DRAFT",
  "OPEN",
  "FULL",
  "CLOSED",
  "CANCELLED",
  "COMPLETED",
];

const emptyForm = {
  tourId: "",
  departureDate: "",
  returnDate: "",
  totalSeats: "",
  availableSeats: "",
  adult: "",
  child: "0",
  infant: "0",
  vendorNote: "",
  status: "OPEN",
};

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateInput = (date) => {
  if (!date) return "";

  const d = new Date(date);

  if (Number.isNaN(d.getTime())) return "";

  return d.toISOString().split("T")[0];
};

const getTourTitle = (schedule) => {
  return (
    schedule?.tourId?.title ||
    schedule?.tour?.title ||
    "Unnamed tour"
  );
};

const getTourLocation = (schedule) => {
  const location =
    schedule?.tourId?.location ||
    schedule?.tour?.location;

  if (!location) return "";

  if (typeof location === "string") return location;

  return [
    location.city,
    location.state,
    location.country,
  ]
    .filter(Boolean)
    .join(", ");
};

const getStatusClass = (status) => {
  return String(status || "DRAFT").toLowerCase();
};

export default function TourSchedule() {
  const [schedules, setSchedules] = useState([]);
  const [tours, setTours] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [toast, setToast] = useState("");

  const showToast = (message) => {
    setToast(message);

    setTimeout(() => {
      setToast("");
    }, 2800);
  };

  const fetchSchedules = async () => {
    try {
      setRefreshing(true);

      const response = await api.get(
        "/api/vendor/tour-schedules"
      );

      setSchedules(response?.data?.data || []);
    } catch (error) {
      showToast(
        error?.response?.data?.message ||
          "Failed to load schedules"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchTours = async () => {
    try {
      const response = await api.get(
        "/api/vendor/tours"
      );

      const data =
        response?.data?.data ||
        response?.data?.tours ||
        response?.data ||
        [];

      setTours(Array.isArray(data) ? data : []);
    } catch (error) {
      setTours([]);
    }
  };

  useEffect(() => {
    fetchSchedules();
    fetchTours();
  }, []);

  const stats = useMemo(() => {
    const total = schedules.length;

    const open = schedules.filter(
      (item) => item.status === "OPEN"
    ).length;

    const full = schedules.filter(
      (item) => item.status === "FULL"
    ).length;

    const completed = schedules.filter(
      (item) => item.status === "COMPLETED"
    ).length;

    const totalSeats = schedules.reduce(
      (sum, item) =>
        sum + Number(item.totalSeats || 0),
      0
    );

    const availableSeats = schedules.reduce(
      (sum, item) =>
        sum + Number(item.availableSeats || 0),
      0
    );

    return {
      total,
      open,
      full,
      completed,
      totalSeats,
      availableSeats,
    };
  }, [schedules]);

  const filteredSchedules = useMemo(() => {
    const query = search.trim().toLowerCase();

    return schedules.filter((schedule) => {
      if (
        statusFilter !== "ALL" &&
        schedule.status !== statusFilter
      ) {
        return false;
      }

      if (!query) return true;

      return [
        getTourTitle(schedule),
        getTourLocation(schedule),
        schedule.vendorNote,
        schedule.status,
        schedule._id,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [schedules, search, statusFilter]);

  const openCreateModal = () => {
    setEditingId(null);

    setForm({
      ...emptyForm,
    });

    setShowModal(true);
  };

  const openEditModal = (schedule) => {
    setEditingId(schedule._id);

    setForm({
      tourId:
        schedule?.tourId?._id ||
        schedule?.tourId ||
        "",

      departureDate: formatDateInput(
        schedule.departureDate
      ),

      returnDate: formatDateInput(
        schedule.returnDate
      ),

      totalSeats: String(
        schedule.totalSeats ?? ""
      ),

      availableSeats: String(
        schedule.availableSeats ?? ""
      ),

      adult: String(
        schedule?.pricing?.adult ?? ""
      ),

      child: String(
        schedule?.pricing?.child ?? 0
      ),

      infant: String(
        schedule?.pricing?.infant ?? 0
      ),

      vendorNote: schedule.vendorNote || "",

      status: schedule.status || "OPEN",
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const updateForm = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const submitForm = async (event) => {
    event.preventDefault();

    if (!form.tourId) {
      showToast("Please select a tour");
      return;
    }

    if (!form.departureDate) {
      showToast("Please select departure date");
      return;
    }

    if (!form.returnDate) {
      showToast("Please select return date");
      return;
    }

    if (
      new Date(form.returnDate) <
      new Date(form.departureDate)
    ) {
      showToast(
        "Return date cannot be before departure date"
      );
      return;
    }

    if (
      !form.totalSeats ||
      Number(form.totalSeats) < 1
    ) {
      showToast("Total seats must be at least 1");
      return;
    }

    if (
      Number(form.availableSeats) < 0 ||
      Number(form.availableSeats) >
        Number(form.totalSeats)
    ) {
      showToast(
        "Available seats must be between 0 and total seats"
      );
      return;
    }

    if (
      form.adult === "" ||
      Number(form.adult) < 0
    ) {
      showToast("Please enter a valid adult price");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        tourId: form.tourId,
        departureDate: form.departureDate,
        returnDate: form.returnDate,
        totalSeats: Number(form.totalSeats),
        availableSeats:
          form.availableSeats === ""
            ? Number(form.totalSeats)
            : Number(form.availableSeats),
        pricing: {
          adult: Number(form.adult),
          child: Number(form.child || 0),
          infant: Number(form.infant || 0),
        },
        vendorNote: form.vendorNote.trim(),
      };

      if (editingId) {
        payload.status = form.status;

        const response = await api.put(
          `/api/vendor/tour-schedules/${editingId}`,
          payload
        );

        const updated =
          response?.data?.data;

        setSchedules((previous) =>
          previous.map((item) =>
            item._id === editingId
              ? updated || {
                  ...item,
                  ...payload,
                }
              : item
          )
        );

        showToast(
          "Schedule updated successfully"
        );
      } else {
        const response = await api.post(
          "/api/vendor/tour-schedules",
          payload
        );

        const created =
          response?.data?.data;

        if (created) {
          setSchedules((previous) => [
            created,
            ...previous,
          ]);
        }

        showToast(
          "Schedule created successfully"
        );
      }

      closeModal();
    } catch (error) {
      showToast(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Failed to save schedule"
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteSchedule = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this schedule?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      await api.delete(
        `/api/vendor/tour-schedules/${id}`
      );

      setSchedules((previous) =>
        previous.filter(
          (item) => item._id !== id
        )
      );

      showToast(
        "Schedule deleted successfully"
      );
    } catch (error) {
      showToast(
        error?.response?.data?.message ||
          "Failed to delete schedule"
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="ts-page">
      <div className="ts-header">
        <div>
          <h1>Tour Schedules</h1>

          <p>
            Manage your tour departures, seats,
            pricing and availability.
          </p>
        </div>

        <div className="ts-header-actions">
          <button
            type="button"
            className="ts-refresh"
            onClick={fetchSchedules}
            disabled={refreshing}
          >
            <RefreshCw
              size={15}
              className={
                refreshing
                  ? "ts-spin"
                  : ""
              }
            />

            Refresh
          </button>

          <button
            type="button"
            className="ts-primary"
            onClick={openCreateModal}
          >
            <Plus size={16} />
            Add Schedule
          </button>
        </div>
      </div>

      <div className="ts-stats">
        <div className="ts-stat">
          <div className="ts-stat-icon">
            <CalendarDays size={18} />
          </div>

          <div>
            <span>Total schedules</span>
            <strong>{stats.total}</strong>
            <small>All departures</small>
          </div>
        </div>

        <div className="ts-stat">
          <div className="ts-stat-icon ts-open">
            <CalendarDays size={18} />
          </div>

          <div>
            <span>Open</span>
            <strong>{stats.open}</strong>
            <small>Available departures</small>
          </div>
        </div>

        <div className="ts-stat">
          <div className="ts-stat-icon ts-full">
            <Users size={18} />
          </div>

          <div>
            <span>Full</span>
            <strong>{stats.full}</strong>
            <small>Fully booked</small>
          </div>
        </div>

        <div className="ts-stat">
          <div className="ts-stat-icon ts-seat">
            <Users size={18} />
          </div>

          <div>
            <span>Available seats</span>
            <strong>
              {stats.availableSeats}
            </strong>
            <small>
              of {stats.totalSeats} total
            </small>
          </div>
        </div>
      </div>

      <section className="ts-card">
        <div className="ts-card-head">
          <div>
            <h2>Departure schedules</h2>

            <p>
              {filteredSchedules.length} schedule
              {filteredSchedules.length === 1
                ? ""
                : "s"} found
            </p>
          </div>
        </div>

        <div className="ts-toolbar">
          <div className="ts-search">
            <Search size={16} />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search tour or location..."
            />
          </div>

          <div className="ts-select">
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
            >
              <option value="ALL">
                All statuses
              </option>

              {STATUS_OPTIONS.map(
                (status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>
                )
              )}
            </select>

            <ChevronDown size={14} />
          </div>
        </div>

        {loading ? (
          <div className="ts-empty">
            <div className="ts-loader" />

            <h3>Loading schedules...</h3>

            <p>
              Fetching your tour departures.
            </p>
          </div>
        ) : filteredSchedules.length === 0 ? (
          <div className="ts-empty">
            <div className="ts-empty-icon">
              <CalendarDays size={25} />
            </div>

            <h3>No schedules found</h3>

            <p>
              Create a schedule to start
              managing tour departures.
            </p>

            <button
              type="button"
              className="ts-primary ts-empty-btn"
              onClick={openCreateModal}
            >
              <Plus size={15} />
              Add Schedule
            </button>
          </div>
        ) : (
          <div className="ts-table-wrap">
            <table className="ts-table">
              <thead>
                <tr>
                  <th>Tour</th>
                  <th>Departure</th>
                  <th>Return</th>
                  <th>Seats</th>
                  <th>Pricing</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredSchedules.map(
                  (schedule) => (
                    <tr key={schedule._id}>
                      <td>
                        <div className="ts-tour">
                          <div className="ts-tour-icon">
                            <CalendarDays
                              size={15}
                            />
                          </div>

                          <div>
                            <strong>
                              {getTourTitle(
                                schedule
                              )}
                            </strong>

                            {getTourLocation(
                              schedule
                            ) && (
                              <span>
                                <MapPin
                                  size={11}
                                />

                                {getTourLocation(
                                  schedule
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="ts-date">
                          <strong>
                            {formatDate(
                              schedule.departureDate
                            )}
                          </strong>

                          <span>
                            <Clock3
                              size={10}
                            />
                            Departure
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="ts-date">
                          <strong>
                            {formatDate(
                              schedule.returnDate
                            )}
                          </strong>

                          <span>
                            <Clock3
                              size={10}
                            />
                            Return
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="ts-seats">
                          <strong>
                            {schedule.availableSeats}
                            <span>
                              /
                              {
                                schedule.totalSeats
                              }
                            </span>
                          </strong>

                          <div className="ts-progress">
                            <div
                              style={{
                                width: `${
                                  schedule.totalSeats
                                    ? Math.max(
                                        0,
                                        Math.min(
                                          100,
                                          (Number(
                                            schedule.availableSeats
                                          ) /
                                            Number(
                                              schedule.totalSeats
                                            )) *
                                            100
                                        )
                                      )
                                    : 0
                                }%`,
                              }}
                            />
                          </div>

                          <small>
                            available
                          </small>
                        </div>
                      </td>

                      <td>
                        <div className="ts-pricing">
                          <strong>
                            ₹
                            {Number(
                              schedule
                                ?.pricing
                                ?.adult || 0
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </strong>

                          <span>
                            Adult
                          </span>

                          <small>
                            Child ₹
                            {Number(
                              schedule
                                ?.pricing
                                ?.child || 0
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </small>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`ts-status ts-status-${getStatusClass(
                            schedule.status
                          )}`}
                        >
                          <i />

                          {schedule.status}
                        </span>
                      </td>

                      <td>
                        <div className="ts-actions">
                          <button
                            type="button"
                            className="ts-edit"
                            onClick={() =>
                              openEditModal(
                                schedule
                              )
                            }
                            title="Edit schedule"
                          >
                            <Edit3 size={14} />
                          </button>

                          <button
                            type="button"
                            className="ts-delete"
                            onClick={() =>
                              deleteSchedule(
                                schedule._id
                              )
                            }
                            disabled={
                              deletingId ===
                              schedule._id
                            }
                            title="Delete schedule"
                          >
                            <Trash2 size={14} />
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
      </section>

      {showModal && (
        <div
          className="ts-overlay"
          onClick={closeModal}
        >
          <div
            className="ts-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="ts-modal-head">
              <div>
                <span>
                  {editingId
                    ? "EDIT SCHEDULE"
                    : "NEW SCHEDULE"}
                </span>

                <h2>
                  {editingId
                    ? "Edit tour schedule"
                    : "Create tour schedule"}
                </h2>

                <p>
                  Set departure dates, seats and
                  pricing for this tour.
                </p>
              </div>

              <button
                type="button"
                className="ts-close"
                onClick={closeModal}
              >
                <X size={18} />
              </button>
            </div>

            <form
              className="ts-form"
              onSubmit={submitForm}
            >
              <div className="ts-form-section">
                <h3>Tour information</h3>

                <div className="ts-field full">
                  <label>
                    Tour <b>*</b>
                  </label>

                  <select
                    value={form.tourId}
                    onChange={(event) =>
                      updateForm(
                        "tourId",
                        event.target.value
                      )
                    }
                    required
                  >
                    <option value="">
                      Select a tour
                    </option>

                    {tours.map((tour) => (
                      <option
                        key={tour._id}
                        value={tour._id}
                      >
                        {tour.title ||
                          tour.name ||
                          "Unnamed tour"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="ts-form-section">
                <h3>Dates</h3>

                <div className="ts-form-grid">
                  <div className="ts-field">
                    <label>
                      Departure date <b>*</b>
                    </label>

                    <input
                      type="date"
                      value={
                        form.departureDate
                      }
                      onChange={(event) =>
                        updateForm(
                          "departureDate",
                          event.target.value
                        )
                      }
                      min={
                        new Date()
                          .toISOString()
                          .split("T")[0]
                      }
                      required
                    />
                  </div>

                  <div className="ts-field">
                    <label>
                      Return date <b>*</b>
                    </label>

                    <input
                      type="date"
                      value={
                        form.returnDate
                      }
                      onChange={(event) =>
                        updateForm(
                          "returnDate",
                          event.target.value
                        )
                      }
                      min={
                        form.departureDate ||
                        new Date()
                          .toISOString()
                          .split("T")[0]
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="ts-form-section">
                <h3>Seats</h3>

                <div className="ts-form-grid">
                  <div className="ts-field">
                    <label>
                      Total seats <b>*</b>
                    </label>

                    <input
                      type="number"
                      min="1"
                      value={
                        form.totalSeats
                      }
                      onChange={(event) =>
                        updateForm(
                          "totalSeats",
                          event.target.value
                        )
                      }
                      placeholder="e.g. 40"
                      required
                    />
                  </div>

                  <div className="ts-field">
                    <label>
                      Available seats
                    </label>

                    <input
                      type="number"
                      min="0"
                      max={
                        form.totalSeats || undefined
                      }
                      value={
                        form.availableSeats
                      }
                      onChange={(event) =>
                        updateForm(
                          "availableSeats",
                          event.target.value
                        )
                      }
                      placeholder={
                        form.totalSeats ||
                        "Same as total"
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="ts-form-section">
                <h3>Pricing</h3>

                <div className="ts-form-grid-3">
                  <div className="ts-field">
                    <label>
                      Adult price <b>*</b>
                    </label>

                    <div className="ts-price-input">
                      <IndianRupee
                        size={14}
                      />

                      <input
                        type="number"
                        min="0"
                        value={form.adult}
                        onChange={(event) =>
                          updateForm(
                            "adult",
                            event.target.value
                          )
                        }
                        placeholder="0"
                        required
                      />
                    </div>
                  </div>

                  <div className="ts-field">
                    <label>
                      Child price
                    </label>

                    <div className="ts-price-input">
                      <IndianRupee
                        size={14}
                      />

                      <input
                        type="number"
                        min="0"
                        value={form.child}
                        onChange={(event) =>
                          updateForm(
                            "child",
                            event.target.value
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="ts-field">
                    <label>
                      Infant price
                    </label>

                    <div className="ts-price-input">
                      <IndianRupee
                        size={14}
                      />

                      <input
                        type="number"
                        min="0"
                        value={form.infant}
                        onChange={(event) =>
                          updateForm(
                            "infant",
                            event.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              {editingId && (
                <div className="ts-form-section">
                  <h3>Status</h3>

                  <div className="ts-field full">
                    <label>
                      Schedule status
                    </label>

                    <select
                      value={form.status}
                      onChange={(event) =>
                        updateForm(
                          "status",
                          event.target.value
                        )
                      }
                    >
                      {STATUS_OPTIONS.map(
                        (status) => (
                          <option
                            key={status}
                            value={status}
                          >
                            {status}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>
              )}

              <div className="ts-form-section">
                <h3>Vendor note</h3>

                <div className="ts-field full">
                  <label>
                    Internal note
                  </label>

                  <textarea
                    rows="3"
                    value={form.vendorNote}
                    onChange={(event) =>
                      updateForm(
                        "vendorNote",
                        event.target.value
                      )
                    }
                    placeholder="Add any internal note for this schedule..."
                  />
                </div>
              </div>

              <div className="ts-modal-footer">
                <button
                  type="button"
                  className="ts-cancel"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="ts-save"
                  disabled={saving}
                >
                  <Save size={15} />

                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update schedule"
                    : "Create schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className="ts-toast">
          {toast}
        </div>
      )}

      <style>{`
        .ts-page {
          width: 100%;
          min-height: 100%;
          color: #343940;
        }

        .ts-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 22px;
        }

        .ts-header h1 {
          margin: 0;
          color: #292e35;
          font-size: 25px;
          font-weight: 700;
          letter-spacing: -0.4px;
        }

        .ts-header p {
          margin: 6px 0 0;
          color: #8a929d;
          font-size: 13px;
        }

        .ts-header-actions {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .ts-refresh,
        .ts-primary {
          height: 38px;
          padding: 0 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
        }

        .ts-refresh {
          border: 1px solid #dfe3e9;
          background: #fff;
          color: #4d5560;
        }

        .ts-primary {
          border: 0;
          background: #4359ad;
          color: #fff;
        }

        .ts-primary:hover {
          background: #354a9d;
        }

        .ts-refresh:hover {
          background: #fafbfc;
        }

        .ts-refresh:disabled,
        .ts-primary:disabled {
          opacity: 0.6;
          cursor: default;
        }

        .ts-spin {
          animation: ts-spin 0.8s linear infinite;
        }

        .ts-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 20px;
        }

        .ts-stat {
          min-height: 104px;
          padding: 18px;
          display: flex;
          align-items: center;
          gap: 14px;
          box-sizing: border-box;
          border: 1px solid #e9ecf0;
          border-radius: 11px;
          background: #fff;
        }

        .ts-stat-icon {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border-radius: 10px;
          background: #f0f3ff;
          color: #445bb2;
        }

        .ts-open {
          background: #eefaf3;
          color: #318650;
        }

        .ts-full {
          background: #fff4ed;
          color: #b56c36;
        }

        .ts-seat {
          background: #f5f1ff;
          color: #7555a8;
        }

        .ts-stat span {
          display: block;
          color: #818994;
          font-size: 11px;
          font-weight: 600;
        }

        .ts-stat strong {
          display: block;
          margin-top: 3px;
          color: #2f343b;
          font-size: 23px;
          line-height: 1.1;
        }

        .ts-stat small {
          display: block;
          margin-top: 4px;
          color: #a0a6ae;
          font-size: 10px;
        }

        .ts-card {
          overflow: hidden;
          border: 1px solid #e8ebef;
          border-radius: 11px;
          background: #fff;
        }

        .ts-card-head {
          padding: 20px 22px 15px;
          border-bottom: 1px solid #edf0f3;
        }

        .ts-card-head h2 {
          margin: 0;
          color: #343940;
          font-size: 17px;
        }

        .ts-card-head p {
          margin: 4px 0 0;
          color: #969da6;
          font-size: 11px;
        }

        .ts-toolbar {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 22px;
          border-bottom: 1px solid #edf0f3;
          background: #fcfcfd;
        }

        .ts-search {
          position: relative;
          flex: 1;
          max-width: 430px;
        }

        .ts-search svg {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #9aa1aa;
        }

        .ts-search input {
          width: 100%;
          height: 39px;
          box-sizing: border-box;
          padding: 0 12px 0 36px;
          border: 1px solid #dfe3e8;
          border-radius: 8px;
          outline: none;
          background: #fff;
          color: #3e444c;
          font-size: 12px;
        }

        .ts-search input:focus,
        .ts-select select:focus {
          border-color: #7485c3;
          box-shadow: 0 0 0 3px rgba(67, 87, 168, 0.08);
        }

        .ts-select {
          position: relative;
        }

        .ts-select select {
          width: 160px;
          height: 39px;
          padding: 0 30px 0 12px;
          border: 1px solid #dfe3e8;
          border-radius: 8px;
          outline: none;
          background: #fff;
          color: #3e444c;
          font-size: 12px;
          appearance: none;
          cursor: pointer;
        }

        .ts-select svg {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #9299a2;
          pointer-events: none;
        }

        .ts-table-wrap {
          overflow-x: auto;
        }

        .ts-table {
          width: 100%;
          min-width: 1050px;
          border-collapse: collapse;
        }

        .ts-table th {
          padding: 12px 14px;
          border-bottom: 1px solid #edf0f3;
          background: #fafbfc;
          text-align: left;
          color: #7c848e;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.3px;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .ts-table td {
          padding: 14px;
          border-bottom: 1px solid #f0f2f4;
          vertical-align: middle;
          font-size: 12px;
        }

        .ts-table tbody tr:hover {
          background: #fafbff;
        }

        .ts-tour {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 190px;
        }

        .ts-tour-icon {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border-radius: 8px;
          background: #f0f3ff;
          color: #4a60b3;
        }

        .ts-tour strong {
          display: block;
          max-width: 210px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #383e46;
          font-size: 12px;
        }

        .ts-tour span {
          display: flex;
          align-items: center;
          gap: 3px;
          margin-top: 4px;
          color: #959ca5;
          font-size: 10px;
        }

        .ts-date strong {
          display: block;
          color: #3e444c;
          font-size: 11px;
          white-space: nowrap;
        }

        .ts-date span {
          display: flex;
          align-items: center;
          gap: 3px;
          margin-top: 4px;
          color: #a0a6ae;
          font-size: 9px;
        }

        .ts-seats strong {
          display: block;
          color: #3c424a;
          font-size: 13px;
        }

        .ts-seats strong span {
          color: #9aa1aa;
          font-weight: 400;
        }

        .ts-progress {
          width: 70px;
          height: 4px;
          margin-top: 5px;
          overflow: hidden;
          border-radius: 99px;
          background: #e8ebef;
        }

        .ts-progress div {
          height: 100%;
          border-radius: inherit;
          background: #5368b8;
        }

        .ts-seats small {
          display: block;
          margin-top: 3px;
          color: #9ba2aa;
          font-size: 9px;
        }

        .ts-pricing strong {
          display: block;
          color: #3d434b;
          font-size: 12px;
        }

        .ts-pricing span {
          display: block;
          margin-top: 3px;
          color: #8f969f;
          font-size: 9px;
        }

        .ts-pricing small {
          display: block;
          margin-top: 3px;
          color: #a2a8b0;
          font-size: 9px;
        }

        .ts-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 9px;
          border-radius: 99px;
          border: 1px solid transparent;
          font-size: 9px;
          font-weight: 700;
          white-space: nowrap;
        }

        .ts-status i {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        .ts-status-open {
          color: #318451;
          background: #f0faf4;
          border-color: #cce7d5;
        }

        .ts-status-full {
          color: #a96925;
          background: #fff7eb;
          border-color: #f0ddb9;
        }

        .ts-status-draft {
          color: #68727e;
          background: #f3f5f7;
          border-color: #dfe3e7;
        }

        .ts-status-closed,
        .ts-status-cancelled {
          color: #bd525b;
          background: #fff3f3;
          border-color: #efd2d4;
        }

        .ts-status-completed {
          color: #4968a6;
          background: #f0f4ff;
          border-color: #d3dcf4;
        }

        .ts-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .ts-edit,
        .ts-delete {
          width: 32px;
          height: 32px;
          display: grid;
          place-items: center;
          border-radius: 7px;
          cursor: pointer;
        }

        .ts-edit {
          border: 1px solid #dfe4ec;
          background: #fff;
          color: #5267ad;
        }

        .ts-delete {
          border: 1px solid #f0d7d9;
          background: #fff;
          color: #bd5960;
        }

        .ts-edit:hover {
          background: #f5f7ff;
        }

        .ts-delete:hover {
          background: #fff5f5;
        }

        .ts-delete:disabled {
          opacity: 0.5;
          cursor: default;
        }

        .ts-empty {
          min-height: 330px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 30px;
        }

        .ts-empty-icon {
          width: 52px;
          height: 52px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #f1f4ff;
          color: #5268b6;
        }

        .ts-empty h3 {
          margin: 12px 0 4px;
          color: #363b43;
          font-size: 15px;
        }

        .ts-empty p {
          margin: 0;
          color: #949ba4;
          font-size: 11px;
        }

        .ts-empty-btn {
          margin-top: 15px;
        }

        .ts-loader {
          width: 30px;
          height: 30px;
          border: 3px solid #e5e8ee;
          border-top-color: #465db0;
          border-radius: 50%;
          animation: ts-spin 0.8s linear infinite;
        }

        .ts-overlay {
          position: fixed;
          inset: 0;
          z-index: 3000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          overflow-y: auto;
          background: rgba(15, 23, 42, 0.48);
        }

        .ts-modal {
          width: min(680px, 100%);
          max-height: calc(100vh - 40px);
          overflow-y: auto;
          border-radius: 13px;
          background: #fff;
          box-shadow: 0 25px 70px rgba(15, 23, 42, 0.2);
        }

        .ts-modal-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 15px;
          padding: 21px 23px;
          border-bottom: 1px solid #edf0f3;
        }

        .ts-modal-head > div > span {
          display: block;
          margin-bottom: 5px;
          color: #7380b2;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .ts-modal-head h2 {
          margin: 0;
          color: #2f343b;
          font-size: 19px;
        }

        .ts-modal-head p {
          margin: 5px 0 0;
          color: #8d959f;
          font-size: 11px;
        }

        .ts-close {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border: 1px solid #dfe3e8;
          border-radius: 8px;
          background: #fff;
          color: #555d67;
          cursor: pointer;
        }

        .ts-form {
          padding: 0 23px 23px;
        }

        .ts-form-section {
          padding: 18px 0;
          border-bottom: 1px solid #edf0f3;
        }

        .ts-form-section h3 {
          margin: 0 0 13px;
          color: #3b4149;
          font-size: 13px;
        }

        .ts-form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 13px;
        }

        .ts-form-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 13px;
        }

        .ts-field {
          min-width: 0;
        }

        .ts-field.full {
          width: 100%;
        }

        .ts-field label {
          display: block;
          margin-bottom: 6px;
          color: #5e6670;
          font-size: 10px;
          font-weight: 700;
        }

        .ts-field label b {
          color: #c34d55;
        }

        .ts-field input,
        .ts-field select,
        .ts-field textarea {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #dfe3e8;
          border-radius: 8px;
          outline: none;
          background: #fff;
          color: #3f464e;
          font-family: inherit;
          font-size: 12px;
        }

        .ts-field input,
        .ts-field select {
          height: 40px;
          padding: 0 11px;
        }

        .ts-field textarea {
          padding: 10px 11px;
          resize: vertical;
          line-height: 1.5;
        }

        .ts-field input:focus,
        .ts-field select:focus,
        .ts-field textarea:focus {
          border-color: #7183c3;
          box-shadow: 0 0 0 3px rgba(67, 87, 168, 0.08);
        }

        .ts-price-input {
          position: relative;
        }

        .ts-price-input svg {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #9199a3;
          pointer-events: none;
        }

        .ts-price-input input {
          padding-left: 29px;
        }

        .ts-modal-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
          padding-top: 18px;
        }

        .ts-cancel,
        .ts-save {
          min-height: 38px;
          padding: 0 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 600;
        }

        .ts-cancel {
          border: 1px solid #dfe3e8;
          background: #fff;
          color: #505761;
        }

        .ts-save {
          border: 0;
          background: #4359ad;
          color: #fff;
        }

        .ts-save:hover {
          background: #354a9d;
        }

        .ts-cancel:disabled,
        .ts-save:disabled {
          opacity: 0.6;
          cursor: default;
        }

        .ts-toast {
          position: fixed;
          right: 24px;
          bottom: 24px;
          z-index: 5000;
          padding: 12px 16px;
          border-radius: 9px;
          background: #111827;
          color: #fff;
          font-size: 12px;
          box-shadow: 0 12px 35px rgba(15, 23, 42, 0.2);
        }

        @keyframes ts-spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 1050px) {
          .ts-stats {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 700px) {
          .ts-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .ts-header-actions {
            width: 100%;
          }

          .ts-refresh,
          .ts-primary {
            flex: 1;
          }

          .ts-stats {
            grid-template-columns: 1fr;
          }

          .ts-toolbar {
            flex-direction: column;
            align-items: stretch;
          }

          .ts-search {
            max-width: none;
          }

          .ts-select,
          .ts-select select {
            width: 100%;
          }

          .ts-form-grid,
          .ts-form-grid-3 {
            grid-template-columns: 1fr;
          }

          .ts-modal {
            max-height: calc(100vh - 20px);
          }

          .ts-overlay {
            padding: 10px;
          }
        }
      `}</style>
    </div>
  );
}