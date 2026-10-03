import { useEffect, useState } from "react";
import axios from "axios";

const API = "https://bmtvendorfinal.onrender.com/api/bus-bookings/vendor-bookings";

export default function VendorBusBookings() {
  const token = localStorage.getItem("token");

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error("Error fetching bookings", err);
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🚌 Bus Bookings</h1>
      <p style={styles.subtitle}>
        View all bookings & cancellations for your buses
      </p>

      {loading && <p style={styles.loading}>Loading...</p>}

      {!loading && bookings.length === 0 && (
        <div style={styles.emptyBox}>
          <p style={styles.emptyIcon}>📭</p>
          <p>No bookings found</p>
        </div>
      )}

      {!loading && bookings.length > 0 && (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Bus</th>
                <th>Route</th>
                <th>Seat</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {bookings.map((b) => (
                <tr key={b._id}>
                  <td>{b.user?.name || "—"}</td>
                  <td>{b.user?.email || "—"}</td>
                  <td>{b.bus?.busName}</td>
                  <td>
                    {b.bus?.fromCity} → {b.bus?.toCity}
                  </td>
                  <td>
                    <b>{b.seatNumber}</b>
                  </td>
                  <td>
                    {new Date(b.createdAt).toLocaleDateString("en-IN")}
                  </td>
                  <td>
                    <span
                      style={{
                        ...styles.status,
                        background:
                          b.status === "booked" ? "#d1e7dd" : "#f8d7da",
                        color:
                          b.status === "booked" ? "#0f5132" : "#842029",
                      }}
                    >
                      {b.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  container: {
    padding: "30px",
    background: "#f4f6f8",
    minHeight: "100vh",
  },

  title: {
    margin: 0,
    fontSize: "32px",
  },

  subtitle: {
    color: "#666",
    marginBottom: "20px",
  },

  loading: {
    fontSize: "18px",
    padding: "20px",
  },

  emptyBox: {
    textAlign: "center",
    background: "#fff",
    padding: "40px",
    borderRadius: "10px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
  },

  emptyIcon: {
    fontSize: "40px",
    marginBottom: "10px",
  },

  tableWrapper: {
    overflowX: "auto",
    background: "#fff",
    borderRadius: "10px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  status: {
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
  },
};
