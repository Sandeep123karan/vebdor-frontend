import React, { useState, useMemo } from "react";
import {
  MdPeople,
  MdPersonAdd,
  MdShowChart,
  MdCalculate,
  MdConfirmationNumber,
  MdAccountBalanceWallet,
  MdDirectionsBus,
  MdSchedule,
  MdInsertDriveFile,
  MdChevronLeft,
  MdChevronRight,
} from "react-icons/md";

/* ===================================================
   STATIC DATA (Ready to connect to API)
   =================================================== */

const CHANNELS = [
  { name: "Office", count: 0 },
  { name: "Agent", count: 0 },
  { name: "API", count: 0 },
  { name: "Website", count: 0 },
  { name: "PR", count: 0 },
  { name: "Quota", count: 0 },
];

const STATS = [
  { label: "Today's Trips", value: "12", sub: "8 scheduled · 4 active", icon: "🚌" },
  { label: "Bookings", value: "148", sub: "24 new today", icon: "🎫" },
  { label: "Passengers", value: "132", sub: "132 / 148 boarded", icon: "👥" },
  { label: "Seat Occupancy", value: "82%", sub: "Today's average", icon: "💺" },
  { label: "Revenue", value: "₹1,84,650", sub: "+12.4% vs yesterday", icon: "₹" },
  { label: "Active Trips", value: "4", sub: "Currently on route", icon: "📍" },
  { label: "Delayed Trips", value: "1", sub: "18 min delayed", icon: "⏱" },
  { label: "Boarding Rate", value: "89%", sub: "132 boarded", icon: "✓" },
];

const TRIPS = [
  {
    id: "BMT-135891",
    route: "Lucknow → Delhi",
    bus: "UP 80 FT 1234",
    type: "A/C Sleeper (2+1)",
    time: "05:00 PM",
    seats: "31/36",
    status: "Boarding",
  },
  {
    id: "BMT-135892",
    route: "Delhi → Jaipur",
    bus: "UP 32 AB 9090",
    type: "Volvo Multi-Axle",
    time: "06:30 PM",
    seats: "39/45",
    status: "Scheduled",
  },
  {
    id: "BMT-135893",
    route: "Lucknow → Agra",
    bus: "UP 78 CT 4455",
    type: "A/C Seater (2+2)",
    time: "07:15 PM",
    seats: "28/40",
    status: "Delayed",
  },
];

const FLEET = [
  { label: "Total Buses", value: 24 },
  { label: "Active", value: 18 },
  { label: "Available", value: 4 },
  { label: "Maintenance", value: 2 },
];

const SOURCES = [
  ["BirdMyTrip", 76],
  ["Direct", 14],
  ["Agent", 7],
  ["Other OTA", 3],
];

/* ===================================================
   DATE HELPERS
   =================================================== */

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const MONTHS = [
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12",
];

function formatDate(date) {
  const d = String(date.getDate()).padStart(2, "0");
  const m = MONTHS[date.getMonth()];
  const y = date.getFullYear();
  const dayName = DAYS[date.getDay()];
  return `${dayName} (${d}-${m}-${y})`;
}

/* ===================================================
   MAIN COMPONENT
   =================================================== */

export default function BusDashboard({ onNavigate }) {
  const [dateOffset, setDateOffset] = useState(0);
  const [promoSlide, setPromoSlide] = useState(0);

  const selectedDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + dateOffset);
    return d;
  }, [dateOffset]);

  return (
    <div className="bus-dash">
      {/* ── TOP SECTION (RedBus BO GDS style Promo + Inventory Summary) ── */}
      <div className="bus-dash-top-hero">
        {/* Left: Promo Banner Card */}
        <div className="bus-dash-promo-card">
          <div className="bus-dash-promo-mascot">
            <div className="promo-avatar-icon">🧑‍💼</div>
            <div className="promo-stars">✨</div>
          </div>

          <div className="bus-dash-promo-ticket">
            <div className="ticket-notch ticket-notch-left" />
            <div className="ticket-content">
              <span className="ticket-tag">PrePone - Postpone</span>
              <h3>Instant ticket rescheduling now available online!</h3>
              <p>Allow passengers to adjust travel dates seamlessly.</p>
              <button
                className="ticket-btn"
                onClick={() => onNavigate?.("reschedule-rules")}
              >
                Try it out! →
              </button>
            </div>
            <div className="ticket-notch ticket-notch-right" />
          </div>

          {/* Dots Indicator */}
          <div className="promo-dots">
            <span
              className={promoSlide === 0 ? "active" : ""}
              onClick={() => setPromoSlide(0)}
            />
            <span
              className={promoSlide === 1 ? "active" : ""}
              onClick={() => setPromoSlide(1)}
            />
            <span
              className={promoSlide === 2 ? "active" : ""}
              onClick={() => setPromoSlide(2)}
            />
          </div>
        </div>

        {/* Right: Date Navigator & Inventory Matrix */}
        <div className="bus-dash-inventory-box">
          {/* Date Selector Header */}
          <div className="inventory-date-bar">
            <button
              className="inv-date-btn"
              onClick={() => setDateOffset((p) => p - 1)}
              title="Previous Day"
            >
              <MdChevronLeft />
            </button>
            <span className="inv-date-text">{formatDate(selectedDate)}</span>
            <button
              className="inv-date-btn"
              onClick={() => setDateOffset((p) => p + 1)}
              title="Next Day"
            >
              <MdChevronRight />
            </button>
          </div>

          <div className="inventory-empty-notice">
            There are no inventories for selected date.
          </div>

          {/* Booked / Blocked Counts Bar */}
          <div className="inventory-status-bar">
            <div className="status-item booked">
              <span className="status-label">Booked :</span>
              <span className="status-count">0</span>
              <span className="status-amount">₹0.00</span>
            </div>
            <div className="status-item blocked">
              <span className="status-label">Blocked :</span>
              <span className="status-count">0</span>
            </div>
          </div>

          {/* Channel Matrix Table */}
          <div className="inventory-channel-table">
            <div className="channel-row channel-row-head">
              {CHANNELS.map((ch) => (
                <div key={ch.name} className="channel-cell">
                  {ch.name}
                </div>
              ))}
            </div>
            <div className="channel-row channel-row-body">
              {CHANNELS.map((ch) => (
                <div key={ch.name} className="channel-cell">
                  {ch.count}
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity Bar */}
          <div className="bus-dash-recent-activity">
            <span className="activity-bell">🔔</span>
            <div className="activity-text">
              <b>Recent Activity : </b>
              <span className="activity-badge">Blocked</span>
              <span className="activity-code">45KPBKK3</span>
              <span className="activity-sep">|</span>
              <span className="activity-time">Today 04:48 PM</span>
              <span className="activity-sep">|</span>
              <span className="activity-route">Hardoi to Sitapur</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── QUICK ACTION CARDS GRID (10 RedBus BO GDS Tiles) ── */}
      <div className="bogds-tiles-section">
        <div className="bogds-tiles-grid">
          {/* Tile 1: Dark Slate Multi-Link Configuration Tile */}
          <div className="bogds-tile tile-dark-links">
            <ul className="tile-link-list">
              <li>
                <button onClick={() => onNavigate?.("bus-types")}>
                  • Create/Edit Bus Types
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.("buses")}>
                  • Create/Edit Buses
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.("services")}>
                  • Create/Manage Services
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.("cities")}>
                  • Add/Manage Cities
                </button>
              </li>
            </ul>
          </div>

          {/* Tile 2: Direct Agents */}
          <button
            className="bogds-tile tile-grey"
            onClick={() => onNavigate?.("agents")}
          >
            <div className="bogds-tile-icon">
              <MdPeople />
            </div>
            <div className="bogds-tile-title">Direct Agents</div>
          </button>

          {/* Tile 3: Employee Management */}
          <button
            className="bogds-tile tile-darkblue"
            onClick={() => onNavigate?.("employees")}
          >
            <div className="bogds-tile-icon">
              <MdPersonAdd />
            </div>
            <div className="bogds-tile-title">Employee Management</div>
          </button>

          {/* Tile 4: GDS */}
          <button
            className="bogds-tile tile-yellow"
            onClick={() => onNavigate?.("gds")}
          >
            <div className="bogds-tile-icon">
              <MdShowChart />
            </div>
            <div className="bogds-tile-title">GDS</div>
          </button>

          {/* Tile 5: Internal Accounting */}
          <button
            className="bogds-tile tile-slate"
            onClick={() => onNavigate?.("accounting")}
          >
            <div className="bogds-tile-icon">
              <MdCalculate />
            </div>
            <div className="bogds-tile-title">Internal Accounting</div>
          </button>

          {/* Tile 6: Other Bookings */}
          <button
            className="bogds-tile tile-brightblue"
            onClick={() => onNavigate?.("other-bookings")}
          >
            <div className="bogds-tile-icon">
              <MdConfirmationNumber />
            </div>
            <div className="bogds-tile-title">Other Bookings</div>
          </button>

          {/* Tile 7: My Account */}
          <button
            className="bogds-tile tile-teal"
            onClick={() => onNavigate?.("account")}
          >
            <div className="bogds-tile-icon">
              <MdAccountBalanceWallet />
            </div>
            <div className="bogds-tile-title">My Account</div>
          </button>

          {/* Tile 8: BMT Plus (redBus Plus style) */}
          <button
            className="bogds-tile tile-orange-red"
            onClick={() => onNavigate?.("bmt-plus")}
          >
            <div className="bogds-tile-icon">
              <MdDirectionsBus />
            </div>
            <div className="bogds-tile-title">BMT Plus</div>
          </button>

          {/* Tile 9: Live GPS Tracking / YourBus */}
          <button
            className="bogds-tile tile-mint"
            onClick={() => onNavigate?.("live-tracking")}
          >
            <span className="bogds-badge-corner">NEW</span>
            <div className="bogds-tile-icon">
              <MdSchedule />
            </div>
            <div className="bogds-tile-title">Live Tracking</div>
            <small className="bogds-tile-sub">Know More...</small>
          </button>

          {/* Tile 10: Reports */}
          <button
            className="bogds-tile tile-purple"
            onClick={() => onNavigate?.("reports")}
          >
            <div className="bogds-tile-icon">
              <MdInsertDriveFile />
            </div>
            <div className="bogds-tile-title">Reports</div>
          </button>
        </div>
      </div>

      {/* ── OPERATIONAL INSIGHTS (Today's Scheduled Trips & Live Stats) ── */}
      <div className="bus-dash-stats-row">
        {STATS.slice(0, 4).map((s) => (
          <div className="bus-dash-stat-mini" key={s.label}>
            <div className="stat-mini-head">
              <span>{s.label}</span>
              <i>{s.icon}</i>
            </div>
            <strong>{s.value}</strong>
            <small>{s.sub}</small>
          </div>
        ))}
      </div>

      <div className="bus-dash-grid">
        {/* Today's Trips */}
        <div className="bus-dash-card">
          <div className="bus-dash-card-head">
            <div>
              <h3>Today's Trips</h3>
              <p>Live overview of scheduled services</p>
            </div>
            <button
              className="bus-dash-link-btn"
              onClick={() => onNavigate?.("services")}
            >
              View all →
            </button>
          </div>

          <div className="bus-dash-table-wrap">
            <table className="bus-dash-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Route</th>
                  <th>Bus</th>
                  <th>Departure</th>
                  <th>Seats</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {TRIPS.map((trip) => (
                  <tr key={trip.id}>
                    <td>
                      <b>{trip.id}</b>
                      <small>{trip.type}</small>
                    </td>
                    <td>
                      <b>{trip.route}</b>
                    </td>
                    <td>{trip.bus}</td>
                    <td>
                      <b>{trip.time}</b>
                    </td>
                    <td>{trip.seats}</td>
                    <td>
                      <span
                        className={`bus-dash-badge ${trip.status.toLowerCase()}`}
                      >
                        {trip.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="bus-dash-link-btn"
                        onClick={() => onNavigate?.("bus-booking")}
                      >
                        Bookings
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fleet & Sources */}
        <div className="bus-dash-side-col">
          <div className="bus-dash-card">
            <div className="bus-dash-card-head">
              <div>
                <h3>Fleet Status</h3>
                <p>Real-time vehicle availability</p>
              </div>
            </div>
            <div className="bus-dash-fleet-grid">
              {FLEET.map((f) => (
                <div className="bus-dash-fleet-item" key={f.label}>
                  <strong>{f.value}</strong>
                  <span>{f.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bus-dash-card" style={{ marginTop: 16 }}>
            <div className="bus-dash-card-head">
              <div>
                <h3>Booking Sources</h3>
                <p>Today's channel distribution</p>
              </div>
            </div>
            <div className="bus-dash-sources">
              {SOURCES.map(([name, percent]) => (
                <div className="bus-dash-source" key={name}>
                  <span>{name}</span>
                  <div className="bus-dash-source-bar">
                    <i style={{ width: `${percent}%` }} />
                  </div>
                  <b>{percent}%</b>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOTER (Matching RedBus BO GDS Screenshot) ── */}
      <footer className="bogds-footer">
        <div className="bogds-footer-content">
          <span>
            <b>Contact Us : </b> Email -{" "}
            <a href="mailto:support@birdmytrip.com">support@birdmytrip.com</a>
          </span>
          <span className="bogds-footer-sep">|</span>
          <span>
            <b>Phone : </b> 080-46190905
          </span>
          <span className="bogds-footer-sep">|</span>
          <span>
            <b>Partner Desk : </b> 24x7 Priority Support
          </span>
        </div>
      </footer>
    </div>
  );
}