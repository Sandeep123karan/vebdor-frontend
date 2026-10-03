import React, { useMemo, useState } from "react";
import {
  MdDashboard,
  MdConfirmationNumber,
  MdSchedule,
  MdCategory,
  MdDirectionsBus,
  MdPolicy,
  MdLogout,
  MdSearch,
  MdNotificationsNone,
  MdHelpOutline,
} from "react-icons/md";

import BusDashboard from "./BusDashboard";
import BusBooking from "./BusBooking";
import BusSchedule from "./BusSchedule";
import BusTypes from "./BusTypes";
import BusFleet from "./BusFleet";
import BusCancellationPolicy from "./BusCancellationPolicy";
import "./BusVendorLayout.css";

/* ===================================================
   SIDEBAR MENU

   We add items here INCREMENTALLY as each
   component's UI is completed.
   =================================================== */

const MENU = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <MdDashboard />,
    section: "OPERATIONS",
  },
  {
    id: "bus-booking",
    label: "Bus Booking",
    icon: <MdConfirmationNumber />,
    section: "OPERATIONS",
  },
  {
    id: "bus-schedule",
    label: "Bus Schedule",
    icon: <MdSchedule />,
    section: "OPERATIONS",
  },
  {
    id: "bus-types",
    label: "Bus Types",
    icon: <MdCategory />,
    section: "MANAGEMENT",
  },
  {
    id: "buses",
    label: "Buses",
    icon: <MdDirectionsBus />,
    section: "MANAGEMENT",
  },
  {
    id: "cancellation-policy",
    label: "Cancellation Policy",
    icon: <MdPolicy />,
    section: "MANAGEMENT",
  },
  // ──────────────────────────────────
  // Add new sidebar items here as we
  // build each component. Example:
  //
  // { id: "layouts",  label: "Seat Layouts",         icon: <MdGridView />,         section: "MANAGEMENT" },
  // ──────────────────────────────────
];

/* ===================================================
   VENDOR HELPERS
   =================================================== */

function getVendorUser() {
  try {
    return JSON.parse(localStorage.getItem("vendorUser") || "{}");
  } catch {
    return {};
  }
}

function logout() {
  if (window.confirm("Are you sure you want to sign out?")) {
    localStorage.removeItem("vendorToken");
    localStorage.removeItem("vendorUser");
    window.location.href = "/vendor-login";
  }
}

/* ===================================================
   LAYOUT COMPONENT
   =================================================== */

export default function BusVendorLayout() {
  const [active, setActive] = useState("dashboard");
  const [search, setSearch] = useState("");

  const vendor = useMemo(() => getVendorUser(), []);
  const vendorName = vendor?.name || vendor?.companyName || "Bus Operator";
  const vendorInitials = vendorName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  /* ── Filter menu by search ── */
  const filteredMenu = useMemo(() => {
    if (!search.trim()) return MENU;
    const q = search.toLowerCase();
    return MENU.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q)
    );
  }, [search]);

  /* ── Group by section ── */
  const groupedMenu = useMemo(() => {
    const groups = {};
    filteredMenu.forEach((item) => {
      const section = item.section || "GENERAL";
      if (!groups[section]) groups[section] = [];
      groups[section].push(item);
    });
    return groups;
  }, [filteredMenu]);

  /* ── Render active content ── */
  const content = useMemo(() => {
    switch (active) {
      case "dashboard":
        return <BusDashboard onNavigate={setActive} />;

      case "bus-booking":
      case "bookings":
      case "other-bookings":
        return <BusBooking onNavigate={setActive} />;

      case "bus-schedule":
      case "schedule":
      case "trips":
      case "services":
        return <BusSchedule onNavigate={setActive} />;

      case "bus-types":
        return <BusTypes onNavigate={setActive} />;

      case "buses":
      case "fleet":
        return <BusFleet onNavigate={setActive} />;

      case "cancellation-policy":
      case "policy":
      case "cancellation":
        return <BusCancellationPolicy onNavigate={setActive} />;

      // ────────────────────────────────
      // Future components go here:
      //
      // case "layouts":
      //   return <BusSeatLayout onNavigate={setActive} />;
      // ────────────────────────────────

      default:
        return <BusDashboard onNavigate={setActive} />;
    }
  }, [active]);

  return (
    <div className="bvl">
      {/* ===== SIDEBAR ===== */}
      <aside className="bvl-sidebar">
        {/* Brand */}
        <div className="bvl-brand">
          <div className="bvl-brand-icon">BMT</div>
          <div className="bvl-brand-text">
            <b>BMT Connect</b>
            <small>Bus Operator Panel</small>
          </div>
        </div>

        {/* Search */}
        <div className="bvl-search">
          <MdSearch className="bvl-search-icon" />
          <input
            placeholder="Search menu…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Navigation */}
        <nav className="bvl-nav">
          {Object.entries(groupedMenu).map(([section, items]) => (
            <React.Fragment key={section}>
              <span className="bvl-nav-label">{section}</span>
              {items.map((item) => (
                <button
                  key={item.id}
                  className={`bvl-nav-btn${active === item.id ? " active" : ""}`}
                  onClick={() => setActive(item.id)}
                >
                  <span className="bvl-nav-icon">{item.icon}</span>
                  <span className="bvl-nav-text">{item.label}</span>
                </button>
              ))}
            </React.Fragment>
          ))}
        </nav>

        {/* Logout */}
        <div className="bvl-logout">
          <button className="bvl-logout-btn" onClick={logout}>
            <span className="bvl-nav-icon">
              <MdLogout />
            </span>
            <span className="bvl-nav-text">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ===== CONTENT SHELL ===== */}
      <section className="bvl-content">
        {/* Header */}
        <header className="bvl-header">
          <div className="bvl-header-left">
            <b>Bus Management Panel</b>
            <small>BirdMyTrip Partner Operations</small>
          </div>

          <div className="bvl-header-right">
            {/* RedBus-style TIN/Mobile search */}
            <div className="bvl-header-quick-search">
              <input
                type="text"
                placeholder="Enter TIN or Mobile"
                className="bvl-header-quick-input"
              />
              <button className="bvl-header-quick-btn" title="Search Ticket">
                <MdSearch />
              </button>
            </div>

            <button className="bvl-header-icon-btn" title="Help">
              <MdHelpOutline />
            </button>

            <button className="bvl-header-icon-btn bvl-has-badge" title="Notifications">
              <MdNotificationsNone />
              <span className="bvl-badge">1</span>
            </button>

            <div className="bvl-header-user">
              <div className="bvl-header-avatar">{vendorInitials}</div>
              <div className="bvl-header-user-info">
                <b>{vendorName}</b>
                <small>Approved Vendor</small>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="bvl-main">{content}</main>
      </section>
    </div>
  );
}
