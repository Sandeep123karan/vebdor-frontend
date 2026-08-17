import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:7000/api/holiday-bookings";

export default function VendorHolidayBookings() {
  const token = localStorage.getItem("token");

  const headers = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const [bookings, setBookings] = useState([]);

  const loadBookings = async () => {
    const res = await axios.get(`${API}/vendor`, headers);
    setBookings(res.data.data);
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const updateStatus = async (id, status) => {
    await axios.put(`${API}/${id}/status`, { status }, headers);
    loadBookings();
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>📘 Holiday Booking Requests</h2>

      {bookings.length === 0 && <p>No bookings yet</p>}

      {bookings.map((b) => (
        <div
          key={b._id}
          style={{
            border: "1px solid #ccc",
            padding: 15,
            marginBottom: 10,
          }}
        >
          <h4>{b.holiday?.title}</h4>
          <p>Customer: {b.userName}</p>
          <p>Phone: {b.userPhone}</p>
          <p>Total: ₹{b.totalAmount}</p>
          <p>Status: {b.status}</p>

          {b.status === "pending" && (
            <>
              <button onClick={() => updateStatus(b._id, "confirmed")}>
                ✅ Accept
              </button>
              <button onClick={() => updateStatus(b._id, "cancelled")}>
                ❌ Reject
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
