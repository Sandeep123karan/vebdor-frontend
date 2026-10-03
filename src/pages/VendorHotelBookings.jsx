import { useEffect, useState } from "react";
import axios from "axios";

const API = "https://bmtvendorfinal.onrender.com/api/hotel-bookings/vendor";

export default function VendorHotelBookings() {
  const token = localStorage.getItem("token");

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await axios.get(API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(res.data);
    } catch (err) {
      console.error("Error fetching hotel bookings", err);
    }
    setLoading(false);
  };

  const statusColor = (status) => {
    if (status === "booked") return "#198754";
    if (status === "cancelled") return "#dc3545";
    return "#6c757d";
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🏨 Hotel Bookings</h1>
      <p style={styles.subtitle}>
        View all bookings made on your hotels
      </p>

      {loading && <p>Loading...</p>}

      {!loading && bookings.length === 0 && (
        <div style={styles.emptyState}>
          <p>No bookings found</p>
        </div>
      )}

      {!loading && bookings.length > 0 && (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Guest</th>
                <th>Hotel</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Nights</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Booked On</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id}>
                  <td>
                    <strong>{b.user?.name}</strong>
                    <br />
                    <span style={styles.subText}>{b.user?.email}</span>
                  </td>
                  <td>
                    <strong>{b.hotel?.name}</strong>
                    <br />
                    <span style={styles.subText}>
                      {b.hotel?.location}
                    </span>
                  </td>
                  <td>{formatDate(b.checkIn)}</td>
                  <td>{formatDate(b.checkOut)}</td>
                  <td>{b.nights}</td>
                  <td>₹{b.totalAmount}</td>
                  <td>
                    <span
                      style={{
                        ...styles.statusBadge,
                        background: statusColor(b.status),
                      }}
                    >
                      {b.status.toUpperCase()}
                    </span>
                  </td>
                  <td>{formatDateTime(b.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ================= HELPERS ================= */

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN");

const formatDateTime = (date) =>
  new Date(date).toLocaleString("en-IN");

/* ================= STYLES ================= */

const styles = {
  container: {
    background: "#fff",
    padding: 30,
    borderRadius: 10,
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },

  title: {
    margin: 0,
    fontSize: 28,
  },

  subtitle: {
    marginBottom: 20,
    color: "#666",
  },

  emptyState: {
    padding: 40,
    textAlign: "center",
    color: "#777",
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  subText: {
    fontSize: 12,
    color: "#777",
  },

  statusBadge: {
    padding: "4px 10px",
    borderRadius: 20,
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
};
