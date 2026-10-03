import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api/axios";
import { Search, RefreshCw, Eye, X, Loader2, CalendarDays, Users, Ship, BedDouble, CreditCard, CheckCircle2, AlertCircle, Ban } from "lucide-react";
import "./CruiseBookingsManagement.css";

const authConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("vendorToken")}`,
  },
});

const listFrom = (data) => {
  if (Array.isArray(data)) return data;
  return data?.bookings || data?.data?.bookings || data?.data || [];
};

const errorText = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  "Failed to load cruise bookings.";

const idOf = (value) => (typeof value === "object" ? value?._id : value);

const dateText = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const dateTimeText = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const money = (value, currency = "INR") => {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 2,
    }).format(Number(value || 0));
  } catch {
    return `${currency || "INR"} ${Number(value || 0).toFixed(2)}`;
  }
};

const passengerName = (passenger) =>
  [passenger?.firstName, passenger?.lastName].filter(Boolean).join(" ") || "Passenger";

const shipName = (ship) =>
  ship?.shipName || ship?.name || "Cruise Ship";

const cabinName = (cabin) =>
  cabin?.cabinName ||
  cabin?.name ||
  cabin?.cabinType ||
  cabin?.categoryName ||
  "Cabin";

const sailingCode = (sailing) =>
  sailing?.sailingCode || sailing?.code || "Sailing";

export default function CruiseBookingsManagement() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [bookingStatus, setBookingStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const loadBookings = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError("");
      const response = await api.get("/api/customer/cruise-bookings", authConfig());
      setBookings(listFrom(response.data));
    } catch (err) {
      setError(errorText(err));
      setBookings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return bookings.filter((booking) => {
      const text = [
        booking?.bookingReference,
        booking?.customerName,
        booking?.customerEmail,
        booking?.customerPhone,
        sailingCode(booking?.sailingId),
        shipName(booking?.shipId),
        cabinName(booking?.cabinId),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        (!q || text.includes(q)) &&
        (!bookingStatus || booking?.bookingStatus === bookingStatus) &&
        (!paymentStatus || booking?.paymentStatus === paymentStatus)
      );
    });
  }, [bookings, search, bookingStatus, paymentStatus]);

  const stats = useMemo(() => ({
    total: bookings.length,
    pending: bookings.filter((x) => x.bookingStatus === "pending").length,
    reserved: bookings.filter((x) => x.bookingStatus === "reserved").length,
    confirmed: bookings.filter((x) => x.bookingStatus === "confirmed").length,
    cancelled: bookings.filter((x) => x.bookingStatus === "cancelled").length,
    paid: bookings.filter((x) => x.paymentStatus === "paid").length,
  }), [bookings]);

  const openDetails = async (booking) => {
    setSelected(booking);
    setCancelReason("");
    try {
      setDetailLoading(true);
      const response = await api.get(`/api/customer/cruise-bookings/${booking._id}`, authConfig());
      setSelected(response.data?.booking || response.data?.data || booking);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetails = () => {
    if (!cancelling) {
      setSelected(null);
      setCancelReason("");
    }
  };

  const cancelBooking = async () => {
    if (!selected?._id) return;
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      setCancelling(true);
      setError("");
      const response = await api.patch(
        `/api/customer/cruise-bookings/${selected._id}/cancel`,
        { reason: cancelReason },
        authConfig()
      );
      const updated = response.data?.booking || response.data?.data;
      if (updated) setSelected(updated);
      await loadBookings(true);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="cruise-bookings-page">
      <div className="cruise-bookings-heading">
        <div>
          <span className="cruise-bookings-eyebrow">CRUISE MANAGEMENT</span>
          <h1>Bookings Management</h1>
          <p>View cruise booking records, customer details and booking status.</p>
        </div>
        <button className="cruise-bookings-refresh" onClick={() => loadBookings(true)} disabled={loading || refreshing}>
          <RefreshCw size={17} className={refreshing ? "cruise-bookings-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="cruise-bookings-alert">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button onClick={() => setError("")}><X size={16} /></button>
        </div>
      )}

      <div className="cruise-bookings-stats">
        <div><span>Total Bookings</span><strong>{stats.total}</strong><CalendarDays /></div>
        <div><span>Reserved</span><strong>{stats.reserved}</strong><CheckCircle2 /></div>
        <div><span>Confirmed</span><strong>{stats.confirmed}</strong><CheckCircle2 /></div>
        <div><span>Paid</span><strong>{stats.paid}</strong><CreditCard /></div>
        <div><span>Cancelled</span><strong>{stats.cancelled}</strong><Ban /></div>
      </div>

      <div className="cruise-bookings-filters">
        <div className="cruise-bookings-search">
          <Search size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search booking, customer, sailing or ship..."
          />
        </div>
        <select value={bookingStatus} onChange={(e) => setBookingStatus(e.target.value)}>
          <option value="">All Booking Status</option>
          <option value="pending">Pending</option>
          <option value="reserved">Reserved</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
          <option value="completed">Completed</option>
        </select>
        <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
          <option value="">All Payment Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
          <option value="partially-refunded">Partially Refunded</option>
        </select>
      </div>

      <div className="cruise-bookings-card">
        <div className="cruise-bookings-card-head">
          <div>
            <h2>Cruise Bookings</h2>
            <span>{filtered.length} booking{filtered.length === 1 ? "" : "s"}</span>
          </div>
        </div>

        {loading ? (
          <div className="cruise-bookings-empty">
            <Loader2 size={28} className="cruise-bookings-spin" />
            <span>Loading bookings...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="cruise-bookings-empty">
            <CalendarDays size={38} />
            <h3>No bookings found</h3>
            <p>No cruise bookings match the selected filters.</p>
          </div>
        ) : (
          <div className="cruise-bookings-table-wrap">
            <table className="cruise-bookings-table">
              <thead>
                <tr>
                  <th>BOOKING</th>
                  <th>CUSTOMER</th>
                  <th>SAILING</th>
                  <th>SHIP</th>
                  <th>PASSENGERS</th>
                  <th>TOTAL</th>
                  <th>BOOKING STATUS</th>
                  <th>PAYMENT</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((booking) => (
                  <tr key={booking._id}>
                    <td>
                      <strong>{booking.bookingReference || "—"}</strong>
                      <small>{dateText(booking.createdAt)}</small>
                    </td>
                    <td>
                      <strong>{booking.customerName || "—"}</strong>
                      <small>{booking.customerEmail || "—"}</small>
                    </td>
                    <td>
                      <strong>{sailingCode(booking.sailingId)}</strong>
                      <small>{dateText(booking.sailingId?.departureDate)}</small>
                    </td>
                    <td>
                      <span className="cruise-bookings-entity">
                        <Ship size={15} />
                        {shipName(booking.shipId)}
                      </span>
                    </td>
                    <td>
                      <span className="cruise-bookings-entity">
                        <Users size={15} />
                        {booking.quantity || booking.passengers?.length || 0}
                      </span>
                    </td>
                    <td><strong>{money(booking.totalAmount, booking.currency)}</strong></td>
                    <td><span className={`cruise-bookings-status ${booking.bookingStatus}`}>{booking.bookingStatus}</span></td>
                    <td><span className={`cruise-bookings-payment ${booking.paymentStatus}`}>{booking.paymentStatus}</span></td>
                    <td>
                      <button className="cruise-bookings-view" onClick={() => openDetails(booking)}>
                        <Eye size={16} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div className="cruise-bookings-overlay" onMouseDown={closeDetails}>
          <div className="cruise-bookings-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="cruise-bookings-modal-head">
              <div>
                <span>BOOKING DETAILS</span>
                <h2>{selected.bookingReference || "Cruise Booking"}</h2>
              </div>
              <button onClick={closeDetails}><X size={20} /></button>
            </div>

            {detailLoading ? (
              <div className="cruise-bookings-modal-loading">
                <Loader2 size={30} className="cruise-bookings-spin" />
                Loading booking details...
              </div>
            ) : (
              <>
                <div className="cruise-bookings-modal-body">
                  <section>
                    <h3>Customer Details</h3>
                    <div className="cruise-bookings-detail-grid">
                      <div><span>Name</span><strong>{selected.customerName || "—"}</strong></div>
                      <div><span>Email</span><strong>{selected.customerEmail || "—"}</strong></div>
                      <div><span>Phone</span><strong>{selected.customerPhone || "—"}</strong></div>
                      <div><span>Booking Date</span><strong>{dateTimeText(selected.createdAt)}</strong></div>
                    </div>
                  </section>

                  <section>
                    <h3>Cruise Details</h3>
                    <div className="cruise-bookings-detail-grid">
                      <div><span>Sailing</span><strong>{sailingCode(selected.sailingId)}</strong></div>
                      <div><span>Ship</span><strong>{shipName(selected.shipId)}</strong></div>
                      <div><span>Cabin</span><strong>{cabinName(selected.cabinId)}</strong></div>
                      <div><span>Departure</span><strong>{dateText(selected.sailingId?.departureDate)}</strong></div>
                      <div><span>Return</span><strong>{dateText(selected.sailingId?.returnDate)}</strong></div>
                      <div><span>Quantity</span><strong>{selected.quantity || selected.passengers?.length || 0}</strong></div>
                    </div>
                  </section>

                  <section>
                    <h3>Passengers</h3>
                    <div className="cruise-bookings-passengers">
                      {(selected.passengers || []).map((passenger, index) => (
                        <div key={passenger._id || index}>
                          <strong>{passengerName(passenger)}</strong>
                          <span>{passenger.gender || "other"}{passenger.age != null ? ` • ${passenger.age} yrs` : ""}</span>
                          <small>{passenger.email || passenger.phone || "Passenger details"}</small>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h3>Payment & Amount</h3>
                    <div className="cruise-bookings-amount-grid">
                      <div><span>Base Amount</span><strong>{money(selected.baseAmount, selected.currency)}</strong></div>
                      <div><span>Tax</span><strong>{money(selected.taxAmount, selected.currency)}</strong></div>
                      <div><span>Port Charges</span><strong>{money(selected.portCharges, selected.currency)}</strong></div>
                      <div><span>Service Charges</span><strong>{money(selected.serviceCharges, selected.currency)}</strong></div>
                      <div><span>Discount</span><strong>- {money(selected.discountAmount, selected.currency)}</strong></div>
                      <div className="total"><span>Total Amount</span><strong>{money(selected.totalAmount, selected.currency)}</strong></div>
                    </div>
                    <div className="cruise-bookings-payment-meta">
                      <span>Payment: <strong>{selected.paymentStatus}</strong></span>
                      <span>Method: <strong>{selected.paymentMethod || "—"}</strong></span>
                      <span>Booking: <strong>{selected.bookingStatus}</strong></span>
                    </div>
                  </section>

                  {selected.specialRequests && (
                    <section>
                      <h3>Special Requests</h3>
                      <p className="cruise-bookings-special">{selected.specialRequests}</p>
                    </section>
                  )}

                  {selected.bookingStatus !== "cancelled" &&
                    selected.bookingStatus !== "completed" &&
                    selected.paymentStatus !== "paid" && (
                      <section>
                        <h3>Cancel Booking</h3>
                        <textarea
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                          placeholder="Cancellation reason (optional)"
                          rows={3}
                        />
                      </section>
                    )}
                </div>

                <div className="cruise-bookings-modal-footer">
                  <button className="cruise-bookings-secondary" onClick={closeDetails}>Close</button>
                  {selected.bookingStatus !== "cancelled" &&
                    selected.bookingStatus !== "completed" &&
                    selected.paymentStatus !== "paid" && (
                      <button className="cruise-bookings-danger" onClick={cancelBooking} disabled={cancelling}>
                        {cancelling ? <Loader2 size={16} className="cruise-bookings-spin" /> : <Ban size={16} />}
                        {cancelling ? "Cancelling..." : "Cancel Booking"}
                      </button>
                    )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
