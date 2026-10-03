import React, { useEffect, useState } from "react";
import "./Tours.css";

const API_BASE =
  process.env.REACT_APP_API_URL || "https://bmtvendorfinal.onrender.com";

export default function Tours() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const token = localStorage.getItem("vendorToken");

  // =========================================================
  // FETCH TOURS
  // =========================================================

  const fetchTours = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE}/api/vendor/tours`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch tours"
        );
      }

      setTours(data.tours || []);
    } catch (err) {
      console.error("FETCH TOURS ERROR:", err);
      setError(err.message || "Unable to load tours");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTours();
  }, []);

  // =========================================================
  // DELETE TOUR
  // =========================================================

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this tour?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `${API_BASE}/api/vendor/tours/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete tour"
        );
      }

      setTours((prev) =>
        prev.filter((tour) => tour._id !== id)
      );

      alert("Tour deleted successfully");
    } catch (err) {
      console.error("DELETE TOUR ERROR:", err);
      alert(err.message || "Failed to delete tour");
    }
  };

  // =========================================================
  // TOGGLE TOUR
  // =========================================================

  const handleToggle = async (id) => {
    try {
      const response = await fetch(
        `${API_BASE}/api/vendor/tours/${id}/toggle-status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update tour"
        );
      }

      setTours((prev) =>
        prev.map((tour) =>
          tour._id === id
            ? {
                ...tour,
                isActive: data.isActive,
              }
            : tour
        )
      );
    } catch (err) {
      console.error("TOGGLE TOUR ERROR:", err);
      alert(err.message || "Failed to update tour");
    }
  };

  // =========================================================
  // FILTER
  // =========================================================

  const filteredTours = tours.filter((tour) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      tour.title?.toLowerCase().includes(searchText) ||
      tour.category?.toLowerCase().includes(searchText) ||
      tour.location?.city?.toLowerCase().includes(searchText);

    const matchesStatus =
      statusFilter === "ALL" ||
      tour.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // =========================================================
  // STATS
  // =========================================================

  const totalTours = tours.length;

  const activeTours = tours.filter(
    (tour) => tour.isActive
  ).length;

  const pendingTours = tours.filter(
    (tour) => tour.status === "PENDING"
  ).length;

  const approvedTours = tours.filter(
    (tour) => tour.status === "APPROVED"
  ).length;

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="tours-page">
        <div className="tours-loading">
          <div className="tours-spinner"></div>
          <p>Loading your tours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tours-page">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="tours-header">
        <div>
          <span className="tours-eyebrow">
            TOURS & ACTIVITIES
          </span>

          <h1>My Tours</h1>

          <p>
            Create, manage and monitor all your tour
            packages from one place.
          </p>
        </div>

        <button
          className="tours-add-btn"
          onClick={() =>
            window.dispatchEvent(
              new CustomEvent("bmt-open-add-tour")
            )
          }
        >
          + Add New Tour
        </button>
      </div>

      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="tours-error">
          <strong>Error:</strong> {error}

          <button onClick={fetchTours}>
            Retry
          </button>
        </div>
      )}

      {/* =====================================================
          STATS
      ====================================================== */}

      <div className="tours-stats">

        <div className="tour-stat-card">
          <div className="tour-stat-icon">✦</div>

          <div>
            <span>Total Tours</span>
            <strong>{totalTours}</strong>
          </div>
        </div>

        <div className="tour-stat-card">
          <div className="tour-stat-icon">✓</div>

          <div>
            <span>Active Tours</span>
            <strong>{activeTours}</strong>
          </div>
        </div>

        <div className="tour-stat-card">
          <div className="tour-stat-icon">◷</div>

          <div>
            <span>Pending Approval</span>
            <strong>{pendingTours}</strong>
          </div>
        </div>

        <div className="tour-stat-card">
          <div className="tour-stat-icon">★</div>

          <div>
            <span>Approved Tours</span>
            <strong>{approvedTours}</strong>
          </div>
        </div>

      </div>

      {/* =====================================================
          TOOLBAR
      ====================================================== */}

      <div className="tours-toolbar">

        <div className="tour-search">
          <span>⌕</span>

          <input
            type="text"
            placeholder="Search tours, category or city..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >
          <option value="ALL">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>

        <button
          className="tour-refresh-btn"
          onClick={fetchTours}
        >
          ↻ Refresh
        </button>

      </div>

      {/* =====================================================
          TOUR LIST
      ====================================================== */}

      {filteredTours.length === 0 ? (

        <div className="tour-empty">

          <div className="tour-empty-icon">
            ✈
          </div>

          <h2>No tours found</h2>

          <p>
            {tours.length === 0
              ? "You haven't created any tours yet."
              : "No tours match your search or filter."}
          </p>

          {tours.length === 0 && (
            <button
              className="tours-add-btn"
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent("bmt-open-add-tour")
                )
              }
            >
              + Create Your First Tour
            </button>
          )}

        </div>

      ) : (

        <div className="tour-table-card">

          <div className="tour-table-header">
            <div>
              <h2>All Tours</h2>
              <span>
                {filteredTours.length} tour
                {filteredTours.length !== 1
                  ? "s"
                  : ""}
              </span>
            </div>
          </div>

          <div className="tour-table-wrapper">

            <table className="tour-table">

              <thead>
                <tr>
                  <th>Tour</th>
                  <th>Location</th>
                  <th>Duration</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {filteredTours.map((tour) => (

                  <tr key={tour._id}>

                    {/* TOUR */}

                    <td>
                      <div className="tour-name-cell">

                        {tour.images?.length > 0 ? (
                          <img
                            src={tour.images[0]}
                            alt={tour.title}
                          />
                        ) : (
                          <div className="tour-image-placeholder">
                            ✈
                          </div>
                        )}

                        <div>
                          <strong>
                            {tour.title}
                          </strong>

                          <span>
                            {tour.category ||
                              "Tour Package"}
                          </span>
                        </div>

                      </div>
                    </td>

                    {/* LOCATION */}

                    <td>
                      {tour.location?.city ||
                        "—"}

                      {tour.location?.state && (
                        <small>
                          {tour.location.state}
                        </small>
                      )}
                    </td>

                    {/* DURATION */}

                    <td>
                      {tour.duration?.value
                        ? `${tour.duration.value} ${
                            tour.duration.unit ||
                            "days"
                          }`
                        : "—"}
                    </td>

                    {/* PRICE */}

                    <td>
                      <strong>
                        ₹
                        {Number(
                          tour.pricing?.adult || 0
                        ).toLocaleString("en-IN")}
                      </strong>

                      <small>
                        / adult
                      </small>
                    </td>

                    {/* STATUS */}

                    <td>
                      <span
                        className={`tour-status ${String(
                          tour.status || ""
                        ).toLowerCase()}`}
                      >
                        {tour.status || "DRAFT"}
                      </span>
                    </td>

                    {/* ACTIVE */}

                    <td>
                      <button
                        className={`tour-toggle ${
                          tour.isActive
                            ? "active"
                            : ""
                        }`}
                        onClick={() =>
                          handleToggle(tour._id)
                        }
                      >
                        <span></span>
                      </button>
                    </td>

                    {/* ACTIONS */}

                    <td>

                      <div className="tour-actions">

                        <button
                          title="View"
                          onClick={() =>
                            alert(
                              `Tour: ${tour.title}`
                            )
                          }
                        >
                          View
                        </button>

                        <button
                          title="Edit"
                          onClick={() =>
                            window.dispatchEvent(
                              new CustomEvent(
                                "bmt-edit-tour",
                                {
                                  detail: tour,
                                }
                              )
                            )
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="danger"
                          title="Delete"
                          onClick={() =>
                            handleDelete(tour._id)
                          }
                        >
                          Delete
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

    </div>
  );
}