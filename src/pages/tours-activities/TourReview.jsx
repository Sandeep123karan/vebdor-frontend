import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Star,
  Search,
  RefreshCw,
  Eye,
  X,
  MessageSquare,
  Mail,
  User,
  CalendarDays,
  MapPin,
  Send,
  Filter,
} from "lucide-react";

const API =
  process.env.REACT_APP_API_URL || "https://bmtvendorfinal.onrender.com";

const TOKEN_KEY = "vendorToken";

const BASE = "/api/tour-reviews";

const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

const api = axios.create({
  baseURL: API,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("vendorToken");
      localStorage.removeItem("vendorUser");
      window.location.href = "/vendor-login";
    }

    return Promise.reject(error);
  }
);

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getCustomerName = (review) => {
  return (
    review?.customerId?.name ||
    review?.customerId?.fullname ||
    "Guest"
  );
};

const getCustomerEmail = (review) => {
  return review?.customerId?.email || "";
};

const getTourName = (review) => {
  return review?.tourId?.title || "Tour";
};

const getStatusClass = (status) => {
  return String(status || "PENDING").toLowerCase();
};

function Stars({ rating = 0, size = 16 }) {
  return (
    <div className="tr-stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          fill={star <= Number(rating) ? "currentColor" : "none"}
          strokeWidth={1.8}
        />
      ))}
    </div>
  );
}

function RatingNumber({ rating }) {
  return (
    <div className="tr-rating-number">
      <strong>{Number(rating || 0).toFixed(1)}</strong>
      <Stars rating={rating} size={13} />
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`tr-status tr-status-${getStatusClass(
        status
      )}`}
    >
      <span className="tr-status-dot" />
      {status || "PENDING"}
    </span>
  );
}

export default function TourReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [ratingFilter, setRatingFilter] = useState("ALL");

  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const [toast, setToast] = useState("");

  const showToast = (message) => {
    setToast(message);

    setTimeout(() => {
      setToast("");
    }, 2800);
  };

  const fetchReviews = async () => {
    try {
      setRefreshing(true);

      const response = await api.get(`${BASE}/vendor`);

      setReviews(response?.data?.reviews || []);
    } catch (error) {
      showToast(
        error?.response?.data?.message ||
          "Could not load reviews"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    if (!selected) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSelected(null);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [selected]);

  const stats = useMemo(() => {
    const total = reviews.length;

    const pending = reviews.filter(
      (review) => review.status === "PENDING"
    ).length;

    const approved = reviews.filter(
      (review) => review.status === "APPROVED"
    ).length;

    const rejected = reviews.filter(
      (review) => review.status === "REJECTED"
    ).length;

    const average =
      total > 0
        ? reviews.reduce(
            (sum, review) =>
              sum + Number(review.rating || 0),
            0
          ) / total
        : 0;

    return {
      total,
      pending,
      approved,
      rejected,
      average,
    };
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reviews.filter((review) => {
      if (
        statusFilter !== "ALL" &&
        review.status !== statusFilter
      ) {
        return false;
      }

      if (
        ratingFilter !== "ALL" &&
        Number(review.rating) !== Number(ratingFilter)
      ) {
        return false;
      }

      if (!query) return true;

      return [
        getCustomerName(review),
        getCustomerEmail(review),
        getTourName(review),
        review.review,
        review.vendorReply,
        review.bookingId?._id,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [
    reviews,
    search,
    statusFilter,
    ratingFilter,
  ]);

  const openReview = async (review) => {
    setSelected(review);
    setReply(review.vendorReply || "");

    try {
      const response = await api.get(
        `${BASE}/vendor/${review._id}`
      );

      if (response?.data?.review) {
        setSelected(response.data.review);
        setReply(
          response.data.review.vendorReply || ""
        );
      }
    } catch (error) {
      setSelected(review);
    }
  };

  const sendReply = async () => {
    if (!selected) return;

    if (!reply.trim()) {
      showToast("Please write a reply first");
      return;
    }

    try {
      setSendingReply(true);

      const response = await api.patch(
        `${BASE}/vendor/${selected._id}/reply`,
        {
          vendorReply: reply.trim(),
        }
      );

      const updatedReview = response?.data?.review;

      if (updatedReview) {
        setSelected((previous) => ({
          ...previous,
          ...updatedReview,
        }));

        setReviews((previous) =>
          previous.map((item) =>
            item._id === selected._id
              ? {
                  ...item,
                  ...updatedReview,
                }
              : item
          )
        );
      } else {
        setReviews((previous) =>
          previous.map((item) =>
            item._id === selected._id
              ? {
                  ...item,
                  vendorReply: reply.trim(),
                  vendorReplyAt: new Date(),
                }
              : item
          )
        );

        setSelected((previous) => ({
          ...previous,
          vendorReply: reply.trim(),
          vendorReplyAt: new Date(),
        }));
      }

      showToast("Reply added successfully");
    } catch (error) {
      showToast(
        error?.response?.data?.message ||
          "Could not add reply"
      );
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <div className="tr-page">
      <div className="tr-page-header">
        <div>
          <h1>Tour Reviews</h1>
          <p>
            Manage customer feedback and respond to your
            tour reviews.
          </p>
        </div>

        <button
          type="button"
          className="tr-refresh-btn"
          onClick={fetchReviews}
          disabled={refreshing}
        >
          <RefreshCw
            size={15}
            className={
              refreshing ? "tr-refresh-spin" : ""
            }
          />
          Refresh
        </button>
      </div>

      <div className="tr-stat-grid">
        <div className="tr-stat-card">
          <div className="tr-stat-icon">
            <MessageSquare size={19} />
          </div>

          <div>
            <span>Total reviews</span>
            <strong>{stats.total}</strong>
            <small>All customer feedback</small>
          </div>
        </div>

        <div className="tr-stat-card">
          <div className="tr-stat-icon tr-pending-icon">
            <CalendarDays size={19} />
          </div>

          <div>
            <span>Pending</span>
            <strong>{stats.pending}</strong>
            <small>Awaiting approval</small>
          </div>
        </div>

        <div className="tr-stat-card">
          <div className="tr-stat-icon tr-approved-icon">
            <Star size={19} />
          </div>

          <div>
            <span>Approved</span>
            <strong>{stats.approved}</strong>
            <small>Published reviews</small>
          </div>
        </div>

        <div className="tr-stat-card">
          <div className="tr-stat-icon tr-rating-icon">
            <Star
              size={19}
              fill="currentColor"
            />
          </div>

          <div>
            <span>Average rating</span>
            <strong>
              {stats.average.toFixed(1)}
            </strong>
            <small>From all reviews</small>
          </div>
        </div>
      </div>

      <section className="tr-card">
        <div className="tr-card-header">
          <div>
            <h2>Customer reviews</h2>
            <p>
              {filteredReviews.length} review
              {filteredReviews.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <div className="tr-toolbar">
          <div className="tr-search">
            <Search size={16} />

            <input
              type="text"
              placeholder="Search customer, tour or review..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>

          <div className="tr-filter">
            <Filter size={15} />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="ALL">
                All statuses
              </option>
              <option value="PENDING">
                Pending
              </option>
              <option value="APPROVED">
                Approved
              </option>
              <option value="REJECTED">
                Rejected
              </option>
            </select>
          </div>

          <select
            className="tr-rating-filter"
            value={ratingFilter}
            onChange={(event) =>
              setRatingFilter(event.target.value)
            }
          >
            <option value="ALL">
              All ratings
            </option>
            <option value="5">5 stars</option>
            <option value="4">4 stars</option>
            <option value="3">3 stars</option>
            <option value="2">2 stars</option>
            <option value="1">1 star</option>
          </select>
        </div>

        {loading ? (
          <div className="tr-empty">
            <div className="tr-loader" />
            <h3>Loading reviews...</h3>
            <p>
              Please wait while we fetch customer
              feedback.
            </p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="tr-empty">
            <div className="tr-empty-icon">
              <MessageSquare size={25} />
            </div>

            <h3>No reviews found</h3>

            <p>
              There are no reviews matching your
              current filters.
            </p>
          </div>
        ) : (
          <div className="tr-table-wrapper">
            <table className="tr-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Tour</th>
                  <th>Rating</th>
                  <th>Review</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {filteredReviews.map((review) => (
                  <tr key={review._id}>
                    <td>
                      <div className="tr-customer">
                        <div className="tr-avatar">
                          {getCustomerName(
                            review
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {getCustomerName(
                              review
                            )}
                          </strong>

                          <span>
                            {getCustomerEmail(
                              review
                            ) || "No email"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="tr-tour">
                        <strong>
                          {getTourName(review)}
                        </strong>

                        {review.tourId?.location && (
                          <span>
                            <MapPin size={11} />

                            {typeof review.tourId
                              .location ===
                            "string"
                              ? review.tourId
                                  .location
                              : [
                                  review.tourId
                                    .location
                                    ?.city,
                                  review.tourId
                                    .location
                                    ?.state,
                                ]
                                  .filter(Boolean)
                                  .join(", ")}
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <RatingNumber
                        rating={review.rating}
                      />
                    </td>

                    <td>
                      <div className="tr-review-text">
                        {review.review}
                      </div>

                      {review.vendorReply && (
                        <div className="tr-replied">
                          <MessageSquare
                            size={11}
                          />
                          Replied
                        </div>
                      )}
                    </td>

                    <td>
                      <StatusBadge
                        status={review.status}
                      />
                    </td>

                    <td>
                      <span className="tr-date">
                        {formatDate(
                          review.createdAt
                        )}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="tr-view-btn"
                        onClick={() =>
                          openReview(review)
                        }
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selected && (
        <div
          className="tr-overlay"
          onClick={() => setSelected(null)}
        >
          <aside
            className="tr-drawer"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="tr-drawer-header">
              <div>
                <span className="tr-drawer-label">
                  CUSTOMER REVIEW
                </span>

                <h2>
                  {getTourName(selected)}
                </h2>

                <p>
                  Submitted{" "}
                  {formatDate(
                    selected.createdAt
                  )}
                </p>
              </div>

              <button
                type="button"
                className="tr-close"
                onClick={() =>
                  setSelected(null)
                }
              >
                <X size={18} />
              </button>
            </div>

            <div className="tr-drawer-body">
              <div className="tr-detail-rating">
                <div>
                  <span>Customer rating</span>

                  <div className="tr-big-rating">
                    <strong>
                      {Number(
                        selected.rating || 0
                      ).toFixed(1)}
                    </strong>

                    <Stars
                      rating={
                        selected.rating
                      }
                      size={18}
                    />
                  </div>
                </div>

                <StatusBadge
                  status={selected.status}
                />
              </div>

              <div className="tr-detail-section">
                <h3>Customer</h3>

                <div className="tr-customer-detail">
                  <div className="tr-large-avatar">
                    {getCustomerName(
                      selected
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <strong>
                      {getCustomerName(
                        selected
                      )}
                    </strong>

                    {getCustomerEmail(
                      selected
                    ) && (
                      <a
                        href={`mailto:${getCustomerEmail(
                          selected
                        )}`}
                      >
                        <Mail size={13} />

                        {getCustomerEmail(
                          selected
                        )}
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="tr-detail-section">
                <h3>Review</h3>

                <div className="tr-review-box">
                  {selected.review}
                </div>
              </div>

              <div className="tr-detail-section">
                <h3>Tour</h3>

                <div className="tr-tour-detail">
                  <div>
                    <span>Tour</span>
                    <strong>
                      {getTourName(
                        selected
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Booking ID</span>
                    <strong>
                      {selected.bookingId?._id ||
                        selected.bookingId ||
                        "—"}
                    </strong>
                  </div>
                </div>
              </div>

              {selected.vendorReply && (
                <div className="tr-detail-section">
                  <h3>Your previous reply</h3>

                  <div className="tr-existing-reply">
                    <div className="tr-reply-header">
                      <span>
                        Vendor response
                      </span>

                      <small>
                        {formatDate(
                          selected.vendorReplyAt
                        )}
                      </small>
                    </div>

                    <p>
                      {selected.vendorReply}
                    </p>
                  </div>
                </div>
              )}

              <div className="tr-detail-section">
                <h3>
                  {selected.vendorReply
                    ? "Update reply"
                    : "Reply to customer"}
                </h3>

                <textarea
                  className="tr-reply-input"
                  rows="6"
                  value={reply}
                  onChange={(event) =>
                    setReply(
                      event.target.value
                    )
                  }
                  placeholder="Write a professional response to the customer..."
                  maxLength={2000}
                />

                <div className="tr-reply-footer">
                  <span>
                    {reply.length}/2000
                  </span>

                  <button
                    type="button"
                    className="tr-send-btn"
                    onClick={sendReply}
                    disabled={sendingReply}
                  >
                    <Send size={14} />

                    {sendingReply
                      ? "Sending..."
                      : "Send reply"}
                  </button>
                </div>
              </div>
            </div>

            <div className="tr-drawer-footer">
              {getCustomerEmail(selected) && (
                <a
                  href={`mailto:${getCustomerEmail(
                    selected
                  )}`}
                  className="tr-email-btn"
                >
                  <Mail size={14} />
                  Email customer
                </a>
              )}

              <button
                type="button"
                className="tr-close-btn"
                onClick={() =>
                  setSelected(null)
                }
              >
                Close
              </button>
            </div>
          </aside>
        </div>
      )}

      {toast && (
        <div className="tr-toast">
          {toast}
        </div>
      )}

      <style>{`
        .tr-page {
          width: 100%;
          min-height: 100%;
          color: #343940;
        }

        .tr-page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 22px;
        }

        .tr-page-header h1 {
          margin: 0;
          font-size: 25px;
          font-weight: 700;
          color: #292e35;
          letter-spacing: -0.4px;
        }

        .tr-page-header p {
          margin: 6px 0 0;
          color: #8a929d;
          font-size: 13px;
        }

        .tr-refresh-btn {
          height: 38px;
          padding: 0 14px;
          border: 1px solid #dfe3e9;
          border-radius: 8px;
          background: #fff;
          color: #454b54;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
        }

        .tr-refresh-btn:hover {
          border-color: #cbd2dc;
          background: #fafbfc;
        }

        .tr-refresh-btn:disabled {
          opacity: 0.6;
          cursor: default;
        }

        .tr-refresh-spin {
          animation: tr-spin 0.8s linear infinite;
        }

        .tr-stat-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 20px;
        }

        .tr-stat-card {
          min-height: 105px;
          padding: 18px;
          border: 1px solid #e9ecf0;
          border-radius: 11px;
          background: #fff;
          display: flex;
          align-items: center;
          gap: 14px;
          box-sizing: border-box;
        }

        .tr-stat-icon {
          width: 42px;
          height: 42px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 10px;
          background: #f1f4ff;
          color: #4058b6;
        }

        .tr-pending-icon {
          background: #fff7e8;
          color: #b27a14;
        }

        .tr-approved-icon {
          background: #eefaf3;
          color: #318a52;
        }

        .tr-rating-icon {
          background: #f7f2ff;
          color: #7950ad;
        }

        .tr-stat-card span {
          display: block;
          color: #818994;
          font-size: 11px;
          font-weight: 600;
        }

        .tr-stat-card strong {
          display: block;
          margin-top: 3px;
          color: #2f343b;
          font-size: 23px;
          line-height: 1.1;
        }

        .tr-stat-card small {
          display: block;
          margin-top: 4px;
          color: #a0a6ae;
          font-size: 10px;
        }

        .tr-card {
          overflow: hidden;
          border: 1px solid #e8ebef;
          border-radius: 11px;
          background: #fff;
        }

        .tr-card-header {
          padding: 20px 22px 15px;
          border-bottom: 1px solid #edf0f3;
        }

        .tr-card-header h2 {
          margin: 0;
          color: #343940;
          font-size: 17px;
        }

        .tr-card-header p {
          margin: 4px 0 0;
          color: #969da6;
          font-size: 11px;
        }

        .tr-toolbar {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          padding: 14px 22px;
          border-bottom: 1px solid #edf0f3;
          background: #fcfcfd;
        }

        .tr-search {
          position: relative;
          flex: 1;
          min-width: 260px;
          max-width: 440px;
        }

        .tr-search svg {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #9aa1aa;
          pointer-events: none;
        }

        .tr-search input,
        .tr-filter select,
        .tr-rating-filter {
          height: 39px;
          border: 1px solid #dfe3e8;
          border-radius: 8px;
          background: #fff;
          color: #3e444c;
          outline: none;
          font-size: 12px;
          box-sizing: border-box;
        }

        .tr-search input {
          width: 100%;
          padding: 0 12px 0 36px;
        }

        .tr-search input:focus,
        .tr-filter select:focus,
        .tr-rating-filter:focus {
          border-color: #7485c3;
          box-shadow: 0 0 0 3px rgba(67, 87, 168, 0.08);
        }

        .tr-filter {
          position: relative;
          display: flex;
          align-items: center;
        }

        .tr-filter svg {
          position: absolute;
          left: 11px;
          color: #9299a2;
          pointer-events: none;
        }

        .tr-filter select {
          min-width: 155px;
          padding: 0 12px 0 32px;
        }

        .tr-rating-filter {
          min-width: 125px;
          padding: 0 11px;
        }

        .tr-table-wrapper {
          overflow-x: auto;
        }

        .tr-table {
          width: 100%;
          min-width: 1100px;
          border-collapse: collapse;
        }

        .tr-table th {
          padding: 12px 14px;
          background: #fafbfc;
          border-bottom: 1px solid #edf0f3;
          text-align: left;
          color: #7c848e;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          white-space: nowrap;
        }

        .tr-table td {
          padding: 14px;
          border-bottom: 1px solid #f0f2f4;
          vertical-align: middle;
          color: #505761;
          font-size: 12px;
        }

        .tr-table tbody tr:hover {
          background: #fafbff;
        }

        .tr-customer {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 175px;
        }

        .tr-avatar,
        .tr-large-avatar {
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #eef1fb;
          color: #4359ae;
          font-weight: 700;
        }

        .tr-avatar {
          width: 34px;
          height: 34px;
          flex-shrink: 0;
          font-size: 12px;
        }

        .tr-customer strong {
          display: block;
          color: #363b43;
          font-size: 12px;
        }

        .tr-customer span {
          display: block;
          margin-top: 3px;
          color: #9299a2;
          font-size: 10px;
          max-width: 140px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .tr-tour {
          min-width: 150px;
        }

        .tr-tour strong {
          display: block;
          color: #3c424a;
          font-size: 12px;
          font-weight: 600;
        }

        .tr-tour span {
          display: flex;
          align-items: center;
          gap: 3px;
          margin-top: 4px;
          color: #969da6;
          font-size: 10px;
        }

        .tr-rating-number {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .tr-rating-number strong {
          color: #414750;
          font-size: 13px;
        }

        .tr-stars {
          display: flex;
          align-items: center;
          gap: 2px;
          color: #e4a52c;
        }

        .tr-review-text {
          max-width: 270px;
          color: #555c65;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .tr-replied {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin-top: 5px;
          color: #3e8b59;
          font-size: 9px;
          font-weight: 600;
        }

        .tr-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 9px;
          border-radius: 99px;
          font-size: 9px;
          font-weight: 700;
          white-space: nowrap;
        }

        .tr-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        .tr-status-pending {
          color: #a8730c;
          background: #fff8e7;
          border: 1px solid #f1dfb7;
        }

        .tr-status-approved {
          color: #318450;
          background: #f0faf4;
          border: 1px solid #cce7d5;
        }

        .tr-status-rejected {
          color: #c04d55;
          background: #fff3f3;
          border: 1px solid #f0d1d3;
        }

        .tr-date {
          color: #858d97;
          font-size: 11px;
          white-space: nowrap;
        }

        .tr-view-btn {
          height: 33px;
          padding: 0 11px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border: 1px solid #dfe3e9;
          border-radius: 7px;
          background: #fff;
          color: #4d5560;
          cursor: pointer;
          font-size: 11px;
          font-weight: 600;
        }

        .tr-view-btn:hover {
          background: #f8f9fb;
          border-color: #cdd3dc;
        }

        .tr-empty {
          min-height: 310px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 30px;
        }

        .tr-empty h3 {
          margin: 12px 0 4px;
          color: #363b43;
          font-size: 15px;
        }

        .tr-empty p {
          margin: 0;
          color: #949ba4;
          font-size: 11px;
        }

        .tr-empty-icon {
          width: 52px;
          height: 52px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #f2f4fa;
          color: #6577bd;
        }

        .tr-loader {
          width: 30px;
          height: 30px;
          border: 3px solid #e6e9ef;
          border-top-color: #4359ae;
          border-radius: 50%;
          animation: tr-spin 0.8s linear infinite;
        }

        .tr-overlay {
          position: fixed;
          inset: 0;
          z-index: 2000;
          display: flex;
          justify-content: flex-end;
          background: rgba(15, 23, 42, 0.45);
        }

        .tr-drawer {
          width: min(500px, 100%);
          height: 100%;
          display: flex;
          flex-direction: column;
          background: #fff;
          box-shadow: -18px 0 45px rgba(15, 23, 42, 0.18);
        }

        .tr-drawer-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 15px;
          padding: 21px 23px;
          border-bottom: 1px solid #edf0f3;
        }

        .tr-drawer-label {
          display: block;
          margin-bottom: 5px;
          color: #7380b2;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .tr-drawer-header h2 {
          margin: 0;
          color: #2e333a;
          font-size: 19px;
        }

        .tr-drawer-header p {
          margin: 5px 0 0;
          color: #8d959f;
          font-size: 11px;
        }

        .tr-close {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border: 1px solid #dfe3e8;
          border-radius: 8px;
          background: #fff;
          color: #555d67;
          cursor: pointer;
          flex-shrink: 0;
        }

        .tr-drawer-body {
          flex: 1;
          overflow-y: auto;
          padding: 21px 23px;
        }

        .tr-detail-rating {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 15px;
          border: 1px solid #e7eaf0;
          border-radius: 10px;
          background: #fafbff;
          margin-bottom: 19px;
        }

        .tr-detail-rating span {
          display: block;
          margin-bottom: 5px;
          color: #9299a2;
          font-size: 10px;
        }

        .tr-big-rating {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .tr-big-rating strong {
          color: #343940;
          font-size: 23px;
        }

        .tr-detail-section {
          padding-bottom: 19px;
          margin-bottom: 19px;
          border-bottom: 1px solid #edf0f3;
        }

        .tr-detail-section:last-child {
          border-bottom: 0;
        }

        .tr-detail-section h3 {
          margin: 0 0 10px;
          color: #383e46;
          font-size: 13px;
        }

        .tr-customer-detail {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .tr-large-avatar {
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          font-size: 14px;
        }

        .tr-customer-detail strong {
          display: block;
          color: #3c424a;
          font-size: 12px;
        }

        .tr-customer-detail a {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-top: 4px;
          color: #707984;
          font-size: 10px;
          text-decoration: none;
        }

        .tr-review-box {
          padding: 14px;
          border: 1px solid #e4e8f0;
          border-left: 3px solid #5266b5;
          border-radius: 8px;
          background: #fafbff;
          color: #4b525b;
          font-size: 13px;
          line-height: 1.65;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .tr-tour-detail {
          display: grid;
          gap: 9px;
        }

        .tr-tour-detail div {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          padding: 8px 0;
        }

        .tr-tour-detail span {
          color: #9299a2;
          font-size: 11px;
        }

        .tr-tour-detail strong {
          max-width: 280px;
          text-align: right;
          color: #454c55;
          font-size: 11px;
          word-break: break-word;
        }

        .tr-existing-reply {
          padding: 13px;
          border: 1px solid #dce9df;
          border-radius: 9px;
          background: #f7fcf8;
        }

        .tr-reply-header {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 8px;
        }

        .tr-reply-header span {
          color: #3e8253;
          font-size: 10px;
          font-weight: 700;
        }

        .tr-reply-header small {
          color: #8e9991;
          font-size: 9px;
        }

        .tr-existing-reply p {
          margin: 0;
          color: #505b53;
          font-size: 12px;
          line-height: 1.6;
          white-space: pre-wrap;
        }

        .tr-reply-input {
          width: 100%;
          min-height: 120px;
          box-sizing: border-box;
          padding: 12px;
          border: 1px solid #dfe3e9;
          border-radius: 8px;
          outline: none;
          resize: vertical;
          color: #414850;
          background: #fff;
          font-family: inherit;
          font-size: 12px;
          line-height: 1.6;
        }

        .tr-reply-input:focus {
          border-color: #7184c8;
          box-shadow: 0 0 0 3px rgba(70, 92, 175, 0.08);
        }

        .tr-reply-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-top: 9px;
        }

        .tr-reply-footer > span {
          color: #9ba2aa;
          font-size: 10px;
        }

        .tr-send-btn {
          height: 37px;
          padding: 0 14px;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          border: 0;
          border-radius: 7px;
          background: #3e55ad;
          color: #fff;
          cursor: pointer;
          font-size: 11px;
          font-weight: 600;
        }

        .tr-send-btn:hover {
          background: #34499a;
        }

        .tr-send-btn:disabled {
          opacity: 0.6;
          cursor: default;
        }

        .tr-drawer-footer {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          padding: 14px 23px;
          border-top: 1px solid #edf0f3;
        }

        .tr-email-btn,
        .tr-close-btn {
          min-height: 36px;
          padding: 0 13px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          border-radius: 7px;
          font-size: 11px;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
        }

        .tr-email-btn {
          border: 1px solid #dfe3e8;
          background: #fff;
          color: #4d5560;
        }

        .tr-close-btn {
          border: 0;
          background: #343b45;
          color: #fff;
        }

        .tr-toast {
          position: fixed;
          right: 24px;
          bottom: 24px;
          z-index: 3000;
          padding: 12px 16px;
          border-radius: 9px;
          background: #111827;
          color: #fff;
          font-size: 12px;
          box-shadow: 0 12px 35px rgba(15, 23, 42, 0.2);
        }

        @keyframes tr-spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 1100px) {
          .tr-stat-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 700px) {
          .tr-page-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .tr-stat-grid {
            grid-template-columns: 1fr;
          }

          .tr-toolbar {
            align-items: stretch;
            flex-direction: column;
          }

          .tr-search {
            width: 100%;
            max-width: none;
          }

          .tr-filter,
          .tr-rating-filter {
            width: 100%;
          }

          .tr-filter select,
          .tr-rating-filter {
            width: 100%;
          }

          .tr-drawer {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}