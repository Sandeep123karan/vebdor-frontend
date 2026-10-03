import { useEffect, useState } from "react";
import axios from "axios";

const API = "https://bmtvendorfinal.onrender.com/api/vendor/cabs/bookings";

export default function VendorCabBookings() {
  const token = localStorage.getItem("token");

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await axios.get(API, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBookings(res.data);
    } catch (err) {
      console.error("Error fetching cab bookings", err);
    }
    setLoading(false);
  };

  if (loading) {
    return <div style={styles.loader}>⏳ Loading bookings...</div>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🚕 Cab Bookings</h1>
      <p style={styles.subtitle}>All bookings for your cabs</p>

      {bookings.length === 0 ? (
        <div style={styles.empty}>No bookings found</div>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>User</th>
                <th>Cab</th>
                <th>Route</th>
                <th>Seats</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {bookings.map((b) => (
                <tr key={b._id}>
                  <td>
                    <strong>{b.user?.name || "User"}</strong>
                    <br />
                    <small>{b.user?.email}</small>
                  </td>

                  <td>
                    {b.cab?.cabType} <br />
                    <small>{b.cab?.vehicleNumber}</small>
                  </td>

                  <td>
                    {b.cab?.fromCity} → {b.cab?.toCity}
                    <br />
                    <small>⏰ {b.cab?.pickupTime}</small>
                  </td>

                  <td>{b.seatsBooked}</td>

                  <td>₹{b.totalPrice}</td>

                  <td>
                    <span
                      style={{
                        ...styles.status,
                        background:
                          b.status === "cancelled"
                            ? "#ffe6e8"
                            : "#e7f1ff",
                        color:
                          b.status === "cancelled"
                            ? "#dc3545"
                            : "#0d6efd",
                      }}
                    >
                      {b.status}
                    </span>
                  </td>

                  <td>
                    {new Date(b.createdAt).toLocaleDateString()}
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
    background: "#fff",
    padding: 30,
    borderRadius: 12,
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  },

  title: {
    margin: 0,
    fontSize: 32,
  },

  subtitle: {
    color: "#666",
    marginBottom: 24,
  },

  loader: {
    padding: 40,
    textAlign: "center",
    fontSize: 18,
  },

  empty: {
    padding: 40,
    textAlign: "center",
    color: "#888",
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  status: {
    padding: "6px 12px",
    borderRadius: 20,
    fontSize: 13,
    fontWeight: "600",
    textTransform: "capitalize",
  },
};
