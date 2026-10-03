import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  Mail,
  Phone,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL || "https://bmtvendorfinal.onrender.com";

const TOKEN_KEY = "vendorToken";
const VENDOR_KEY = "vendorUser";

const getToken = () => localStorage.getItem(TOKEN_KEY);

const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(VENDOR_KEY);
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
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      clearSession();
      window.location.href = "/vendor-login";
    }

    return Promise.reject(error);
  }
);

const BASE = "/api/vendor/tour-queries";

const STATUSES = [
  "NEW",
  "IN_PROGRESS",
  "CONVERTED",
  "CLOSED",
  "REJECTED",
];

const label = (s) => {
  const t = String(s || "")
    .replace(/_/g, " ")
    .toLowerCase();

  return t.charAt(0).toUpperCase() + t.slice(1);
};

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const formatLocation = (l) => {
  if (!l) return "";

  if (typeof l === "string") return l;

  return [l.city, l.state, l.country]
    .filter(Boolean)
    .join(", ");
};

const money = (n, currency = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));

const formatBudget = (b) => {
  const min = Number(b?.min || 0);
  const max = Number(b?.max || 0);

  if (!min && !max) return "Not shared";

  if (min && max) {
    return `${money(min, b.currency)} – ${money(max, b.currency)}`;
  }

  if (max) {
    return `Up to ${money(max, b.currency)}`;
  }

  return `From ${money(min, b.currency)}`;
};

const guestsText = (g) => {
  if (!g) return "—";

  const parts = [];

  if (g.adults) {
    parts.push(`${g.adults} adult${g.adults > 1 ? "s" : ""}`);
  }

  if (g.children) {
    parts.push(`${g.children} child${g.children > 1 ? "ren" : ""}`);
  }

  if (g.infants) {
    parts.push(`${g.infants} infant${g.infants > 1 ? "s" : ""}`);
  }

  return parts.length ? parts.join(", ") : "—";
};

const getName = (q) =>
  q?.customer?.name ||
  q?.customerId?.fullname ||
  "Guest";

const getEmail = (q) =>
  q?.customer?.email ||
  q?.customerId?.email ||
  "";

const getPhone = (q) =>
  q?.customer?.phone ||
  q?.customerId?.phone ||
  "";

function Badge({ value }) {
  return (
    <span className={`tq-badge tq-${String(value).toLowerCase()}`}>
      {label(value)}
    </span>
  );
}

function Row({ label: rowLabel, children }) {
  return (
    <div className="tq-row">
      <span>{rowLabel}</span>
      <strong>{children}</strong>
    </div>
  );
}

export default function TourQuery() {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selected, setSelected] = useState(null);
  const [vendorNote, setVendorNote] = useState("");
  const [toast, setToast] = useState("");

  const showToast = (message) => {
    setToast(message);

    setTimeout(() => {
      setToast("");
    }, 2500);
  };

  const fetchQueries = async () => {
    try {
      setRefreshing(true);

      const { data } = await api.get(BASE);

      setQueries(data?.queries || []);
    } catch (error) {
      showToast(
        error?.response?.data?.message ||
          "Could not load queries"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  useEffect(() => {
    if (!selected) return;

    const onKey = (event) => {
      if (event.key === "Escape") {
        setSelected(null);
      }
    };

    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [selected]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return queries.filter((item) => {
      if (
        statusFilter !== "ALL" &&
        item.status !== statusFilter
      ) {
        return false;
      }

      if (!q) return true;

      return [
        item.queryId,
        getName(item),
        getEmail(item),
        getPhone(item),
        item.message,
        item.tourId?.title,
        formatLocation(item.tourId?.location),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [queries, search, statusFilter]);

  const stats = useMemo(
    () => ({
      total: queries.length,
      fresh: queries.filter((x) => x.status === "NEW").length,
      progress: queries.filter(
        (x) => x.status === "IN_PROGRESS"
      ).length,
      converted: queries.filter(
        (x) => x.status === "CONVERTED"
      ).length,
    }),
    [queries]
  );

  const open = (item) => {
    setSelected(item);
    setVendorNote(item.vendorNote || "");
  };

  const patch = async (
    path,
    body,
    successMessage,
    failMessage
  ) => {
    if (!selected) return;

    try {
      const { data } = await api.patch(
        `${BASE}/${selected._id}/${path}`,
        body
      );

      const updated = {
        ...selected,
        ...(data?.query || body),
        tourId: selected.tourId,
        customerId: selected.customerId,
      };

      setQueries((prev) =>
        prev.map((item) =>
          item._id === updated._id ? updated : item
        )
      );

      setSelected(updated);

      showToast(successMessage);
    } catch (error) {
      showToast(
        error?.response?.data?.message || failMessage
      );
    }
  };

  const updateStatus = (status) => {
    patch(
      "status",
      { status },
      "Status updated",
      "Could not update status"
    );
  };

  const saveNote = () => {
    patch(
      "note",
      { vendorNote },
      "Note saved",
      "Could not save note"
    );
  };

  const deleteQuery = async () => {
    if (!selected) return;

    const confirmed = window.confirm(
      "Delete this query permanently? This cannot be undone."
    );

    if (!confirmed) return;

    try {
      await api.delete(`${BASE}/${selected._id}`);

      setQueries((prev) =>
        prev.filter((item) => item._id !== selected._id)
      );

      setSelected(null);

      showToast("Query deleted");
    } catch (error) {
      showToast(
        error?.response?.data?.message ||
          "Could not delete query"
      );
    }
  };

  const s = selected;

  return (
    <div className="bmt-premium-page tq-page">
      <div className="bmt-analytics-cards">
        <article>
          <span>Total queries</span>
          <strong>{stats.total}</strong>
          <small>All enquiries received</small>
        </article>

        <article>
          <span>New</span>
          <strong>{stats.fresh}</strong>
          <small>Not answered yet</small>
        </article>

        <article>
          <span>In progress</span>
          <strong>{stats.progress}</strong>
          <small>Being followed up</small>
        </article>

        <article>
          <span>Converted</span>
          <strong>{stats.converted}</strong>
          <small>Turned into bookings</small>
        </article>
      </div>

      <section className="bmt-form-card tq-card">
        <div className="tq-head">
          <div>
            <h3>Customer enquiries</h3>
            <p>
              {filtered.length} quer
              {filtered.length !== 1 ? "ies" : "y"}
            </p>
          </div>

          <button
            type="button"
            className="bmt-secondary-btn tq-sm"
            onClick={fetchQueries}
            disabled={refreshing}
          >
            <RefreshCw
              size={14}
              className={refreshing ? "tq-spin" : ""}
            />
            Refresh
          </button>
        </div>

        <div className="tq-filters">
          <div className="tq-search">
            <Search size={16} />

            <input
              className="tq-input"
              type="text"
              placeholder="Search by query ID, guest, tour or message"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="tq-input"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >
            <option value="ALL">All statuses</option>

            {STATUSES.map((value) => (
              <option key={value} value={value}>
                {label(value)}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="tq-empty">
            <div className="tq-spinner" />
            <p>Loading queries...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="tq-empty">
            <h3>No queries found</h3>
            <p>
              Change the search or filter, or wait for new
              enquiries.
            </p>
          </div>
        ) : (
          <div className="tq-table-wrap">
            <table className="tq-table">
              <thead>
                <tr>
                  <th>Query</th>
                  <th>Customer</th>
                  <th>Tour</th>
                  <th>Message</th>
                  <th>Travel date</th>
                  <th>Budget</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div className="tq-two">
                        <strong>
                          {item.queryId || "—"}
                        </strong>
                        <span>
                          {formatDate(item.createdAt)}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div className="tq-two">
                        <strong>{getName(item)}</strong>
                        <span>
                          {getEmail(item) ||
                            getPhone(item) ||
                            "No contact"}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div className="tq-two">
                        <strong>
                          {item.tourId?.title ||
                            "Tour no longer available"}
                        </strong>

                        <span>
                          {formatLocation(
                            item.tourId?.location
                          ) || "—"}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div className="tq-two">
                        <span className="tq-msg">
                          {item.message || "No message"}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div className="tq-two">
                        <strong>
                          {formatDate(item.travelDate)}
                        </strong>

                        <span>
                          {item.guests?.total || 0} guest
                          {item.guests?.total === 1
                            ? ""
                            : "s"}
                        </span>
                      </div>
                    </td>

                    <td>{formatBudget(item.budget)}</td>

                    <td>
                      <Badge value={item.status} />
                    </td>

                    <td>
                      <button
                        type="button"
                        className="bmt-secondary-btn tq-sm"
                        onClick={() => open(item)}
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

      {s && (
        <div
          className="tq-overlay"
          onClick={() => setSelected(null)}
        >
          <aside
            className="tq-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="tq-drawer-head">
              <div>
                <h2>
                  {s.tourId?.title || "Tour enquiry"}
                </h2>

                <p>
                  {s.queryId} · received{" "}
                  {formatDate(s.createdAt)}
                </p>
              </div>

              <button
                type="button"
                className="tq-x"
                onClick={() => setSelected(null)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="tq-drawer-body">
              <div className="tq-section">
                <h4>Message</h4>

                <div className="tq-quote">
                  {s.message ||
                    "The customer did not leave a message."}
                </div>
              </div>

              <div className="tq-section">
                <h4>Customer</h4>

                <Row label="Name">{getName(s)}</Row>

                <Row label="Email">
                  {getEmail(s) || "—"}
                </Row>

                <Row label="Phone">
                  {getPhone(s) || "—"}
                </Row>

                {(getEmail(s) || getPhone(s)) && (
                  <div className="tq-contact">
                    {getEmail(s) && (
                      <a
                        className="bmt-secondary-btn tq-sm"
                        href={`mailto:${getEmail(s)}`}
                      >
                        <Mail size={14} />
                        Email
                      </a>
                    )}

                    {getPhone(s) && (
                      <a
                        className="bmt-secondary-btn tq-sm"
                        href={`tel:${getPhone(s)}`}
                      >
                        <Phone size={14} />
                        Call
                      </a>
                    )}
                  </div>
                )}
              </div>

              <div className="tq-section">
                <h4>Trip</h4>

                <Row label="Location">
                  {formatLocation(
                    s.tourId?.location
                  ) || "—"}
                </Row>

                <Row label="Travel date">
                  {formatDate(s.travelDate)}
                </Row>

                <Row label="Guests">
                  {guestsText(s.guests)}
                </Row>

                <Row label="Budget">
                  {formatBudget(s.budget)}
                </Row>

                <Row label="Source">
                  {label(s.source)}
                </Row>
              </div>

              <div className="tq-section">
                <h4>Manage query</h4>

                <label className="tq-label">
                  Status
                </label>

                <select
                  className="tq-input"
                  style={{ width: "100%" }}
                  value={s.status || "NEW"}
                  onChange={(e) =>
                    updateStatus(e.target.value)
                  }
                >
                  {STATUSES.map((value) => (
                    <option
                      key={value}
                      value={value}
                    >
                      {label(value)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="tq-section">
                <h4>Internal note</h4>

                <textarea
                  className="tq-input"
                  rows="4"
                  placeholder="Only you can see this note"
                  value={vendorNote}
                  onChange={(e) =>
                    setVendorNote(e.target.value)
                  }
                />

                <div
                  className="bmt-form-actions"
                  style={{ marginTop: 12 }}
                >
                  <button
                    type="button"
                    className="bmt-primary-btn"
                    onClick={saveNote}
                  >
                    Save note
                  </button>
                </div>
              </div>
            </div>

            <div className="tq-drawer-foot">
              <button
                type="button"
                className="bmt-secondary-btn tq-danger tq-sm"
                onClick={deleteQuery}
              >
                <Trash2 size={14} />
                Delete query
              </button>

              <button
                type="button"
                className="bmt-secondary-btn tq-sm"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
            </div>
          </aside>
        </div>
      )}

      {toast && <div className="tq-toast">{toast}</div>}

      <style>{`
        .tq-page {
          width: 100%;
        }

        .tq-card {
          padding: 0;
          overflow: hidden;
        }

        .tq-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 20px 22px 16px;
        }

        .tq-head h3 {
          margin: 0;
          color: #343940;
          font-size: 17px;
        }

        .tq-head p {
          margin: 4px 0 0;
          color: #9097a0;
          font-size: 11px;
        }

        .tq-sm {
          min-height: 36px;
          padding: 0 13px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          text-decoration: none;
          cursor: pointer;
        }

        .tq-sm:disabled {
          opacity: 0.6;
          cursor: default;
        }

        .tq-danger {
          border-color: #f0c9cc;
          color: #c14a52;
        }

        .tq-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          padding: 0 22px 18px;
          border-bottom: 1px solid #edf0f3;
        }

        .tq-search {
          position: relative;
          flex: 1;
          min-width: 220px;
          max-width: 420px;
        }

        .tq-search svg {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ba2ab;
          pointer-events: none;
        }

        .tq-search .tq-input {
          padding-left: 36px;
        }

        .tq-input {
          width: 100%;
          height: 40px;
          border: 1px solid #dfe3e9;
          border-radius: 8px;
          background: #fff;
          color: #333941;
          outline: 0;
          padding: 0 12px;
          font-size: 12px;
          transition:
            border-color 0.18s,
            box-shadow 0.18s;
          box-sizing: border-box;
        }

        select.tq-input {
          width: auto;
          min-width: 170px;
        }

        textarea.tq-input {
          height: auto;
          padding: 11px 12px;
          resize: vertical;
        }

        .tq-input:focus {
          border-color: #7184c8;
          box-shadow: 0 0 0 3px rgba(70, 92, 175, 0.08);
        }

        .tq-table-wrap {
          overflow-x: auto;
        }

        .tq-table {
          width: 100%;
          min-width: 1060px;
          border-collapse: collapse;
        }

        .tq-table th {
          text-align: left;
          padding: 12px 14px;
          border-bottom: 1px solid #edf0f3;
          background: #fafbfc;
          color: #7c848e;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
        }

        .tq-table td {
          padding: 14px;
          border-bottom: 1px solid #f0f2f4;
          color: #545b64;
          font-size: 12px;
          vertical-align: middle;
        }

        .tq-table th:first-child,
        .tq-table td:first-child {
          padding-left: 22px;
        }

        .tq-table tbody tr:hover {
          background: #fafbff;
        }

        .tq-two strong,
        .tq-two span {
          display: block;
        }

        .tq-two strong {
          color: #343940;
          font-size: 12px;
        }

        .tq-two span {
          margin-top: 3px;
          max-width: 210px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #9097a0;
          font-size: 11px;
        }

        .tq-two .tq-msg {
          margin-top: 0;
          max-width: 240px;
          color: #545b64;
          font-size: 12px;
        }

        .tq-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border: 1px solid transparent;
          border-radius: 99px;
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
        }

        .tq-badge::before {
          content: "";
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        .tq-new {
          color: #a8710a;
          background: #fff8e6;
          border-color: #f3e0b0;
        }

        .tq-in_progress {
          color: #3558bf;
          background: #f2f5ff;
          border-color: #d4dcf5;
        }

        .tq-converted {
          color: #2f8f50;
          background: #f1faf4;
          border-color: #c9e8d3;
        }

        .tq-closed {
          color: #5d6570;
          background: #f5f6f8;
          border-color: #e2e6ec;
        }

        .tq-rejected {
          color: #c14a52;
          background: #fff4f4;
          border-color: #f3d0d2;
        }

        .tq-empty {
          min-height: 260px;
          display: grid;
          place-items: center;
          align-content: center;
          gap: 8px;
          padding: 20px;
          text-align: center;
          color: #858d97;
        }

        .tq-empty h3 {
          margin: 0;
          color: #343940;
          font-size: 16px;
        }

        .tq-empty p {
          margin: 0;
          font-size: 12px;
        }

        .tq-spinner {
          width: 30px;
          height: 30px;
          border: 3px solid #e7eaf0;
          border-top-color: #3558bf;
          border-radius: 50%;
          animation: tq-spin 0.8s linear infinite;
        }

        .tq-spin {
          animation: tq-spin 0.8s linear infinite;
        }

        @keyframes tq-spin {
          to {
            transform: rotate(360deg);
          }
        }

        .tq-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          justify-content: flex-end;
          background: rgba(15, 23, 42, 0.45);
        }

        .tq-drawer {
          width: min(480px, 100%);
          height: 100%;
          display: flex;
          flex-direction: column;
          background: #fff;
          box-shadow: -16px 0 40px rgba(15, 23, 42, 0.18);
        }

        .tq-drawer-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          padding: 20px 22px;
          border-bottom: 1px solid #edf0f3;
        }

        .tq-drawer-head h2 {
          margin: 0;
          color: #2f343b;
          font-size: 18px;
        }

        .tq-drawer-head p {
          margin: 5px 0 0;
          color: #7b838d;
          font-size: 12px;
        }

        .tq-x {
          width: 34px;
          height: 34px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border: 1px solid #dfe3e9;
          border-radius: 8px;
          background: #fff;
          color: #59616b;
          cursor: pointer;
        }

        .tq-drawer-body {
          flex: 1;
          overflow-y: auto;
          padding: 20px 22px;
        }

        .tq-section {
          padding-bottom: 18px;
          margin-bottom: 18px;
          border-bottom: 1px solid #edf0f3;
        }

        .tq-section:last-child {
          margin-bottom: 0;
          border-bottom: 0;
        }

        .tq-section h4 {
          margin: 0 0 8px;
          color: #343940;
          font-size: 13px;
        }

        .tq-quote {
          border: 1px solid #e4e8f3;
          border-left: 3px solid #3558bf;
          border-radius: 8px;
          background: #fafbff;
          padding: 12px 14px;
          color: #40464e;
          font-size: 13px;
          line-height: 1.6;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .tq-row {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          padding: 6px 0;
          font-size: 12px;
        }

        .tq-row span {
          flex-shrink: 0;
          color: #8c949e;
        }

        .tq-row strong {
          color: #40464e;
          font-weight: 600;
          text-align: right;
          word-break: break-word;
        }

        .tq-contact {
          display: flex;
          gap: 8px;
          margin-top: 10px;
        }

        .tq-label {
          display: block;
          margin: 12px 0 6px;
          color: #505761;
          font-size: 11px;
          font-weight: 700;
        }

        .tq-drawer-foot {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          padding: 14px 22px;
          border-top: 1px solid #edf0f3;
        }

        .tq-toast {
          position: fixed;
          right: 24px;
          bottom: 24px;
          z-index: 1100;
          padding: 12px 16px;
          border-radius: 10px;
          background: #0f172a;
          color: #fff;
          font-size: 12px;
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.2);
        }

        @media (max-width: 768px) {
          .tq-head {
            align-items: flex-start;
            flex-direction: column;
          }

          .tq-filters {
            flex-direction: column;
          }

          .tq-search {
            max-width: none;
            width: 100%;
          }

          select.tq-input {
            width: 100%;
          }

          .tq-drawer {
            width: 100%;
          }

          .tq-drawer-foot {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
}