import { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  Button,
  Badge,
  Spinner,
} from "react-bootstrap";

const API = "http://localhost:7000/api/homestay-bookings";

export default function VendorHomestayBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const headers = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  };

  const loadBookings = async () => {
    setLoading(true);
    const res = await axios.get(`${API}/vendor`, headers);
    setBookings(res.data.data);
    setLoading(false);
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const updateStatus = async (id, status) => {
    await axios.put(
      `${API}/${id}/status`,
      { status },
      headers
    );
    loadBookings();
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <div>
      <h4>Homestay Bookings</h4>

      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>Homestay</th>
            <th>Guest</th>
            <th>Dates</th>
            <th>Guests</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {bookings.map((b) => (
            <tr key={b._id}>
              <td>
                {b.homestay.propertyName}
                <br />
                <small>{b.homestay.city}</small>
              </td>

              <td>
                {b.guestName}
                <br />
                <small>{b.guestPhone}</small>
              </td>

              <td>
                {new Date(b.checkInDate).toDateString()}
                <br />→
                <br />
                {new Date(b.checkOutDate).toDateString()}
              </td>

              <td>
                {b.adults} Adults
                <br />
                {b.children} Children
              </td>

              <td>₹{b.totalAmount}</td>

              <td>
                <Badge
                  bg={
                    b.status === "confirmed"
                      ? "success"
                      : b.status === "cancelled"
                      ? "danger"
                      : "warning"
                  }
                >
                  {b.status}
                </Badge>
              </td>

              <td>
                {b.status === "pending" && (
                  <>
                    <Button
                      size="sm"
                      onClick={() =>
                        updateStatus(b._id, "confirmed")
                      }
                    >
                      Accept
                    </Button>{" "}
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() =>
                        updateStatus(b._id, "cancelled")
                      }
                    >
                      Reject
                    </Button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
