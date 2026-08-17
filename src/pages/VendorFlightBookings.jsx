import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:7000/api/flight-bookings/vendor";

export default function VendorFlightBookings() {
  const token = localStorage.getItem("token");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    const res = await axios.get(API, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setBookings(res.data);
    setLoading(false);
  };

  if (loading) return <p>Loading bookings...</p>;

  return (
    <div style={styles.container}>
      <h1>✈️ Flight Bookings</h1>

      {bookings.length === 0 && <p>No bookings yet</p>}

      <div style={styles.grid}>
        {bookings.map((b) => (
          <div key={b._id} style={styles.card}>
            <h3>{b.flight.flightName}</h3>
            <p>✈️ {b.flight.flightNumber}</p>

            <p>
              📍 {b.flight.fromCity} → {b.flight.toCity}
            </p>

            <p>👤 User: {b.user.name}</p>
            <p>💺 Seat: {b.seatNumber}</p>
            <p>💰 ₹{b.price}</p>

            <span
              style={{
                ...styles.status,
                background:
                  b.status === "cancelled" ? "#dc3545" : "#28a745",
              }}
            >
              {b.status.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: 20 },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
    gap: 20,
    marginTop: 20,
  },
  card: {
    background: "#fff",
    padding: 16,
    borderRadius: 8,
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },
  status: {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: 20,
    color: "#fff",
    fontSize: 12,
    marginTop: 10,
  },
};
