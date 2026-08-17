
import { useEffect, useState } from "react";
import VendorHotels from "./VendorHotels";
import VendorCabs from "./VendorCabs";
import BusModule from "./BusModule";

import VendorBusBookings from "./VendorBusBookings";
import VendorCabBookings from "./VendorCabBookings";
import VendorHotelBookings from "./VendorHotelBookings";
import VendorHotelRooms from "./Vendorhotelrooms";
import VendorRoomInventory from "./Vendorroominventory";

// ✈️ FLIGHT COMPONENTS
import VendorFlights from "./VendorFlights";
import VendorFlightBookings from "./VendorFlightBookings";
import VendorApartment from "./Vendorapartment";

// 🏡 HOMESTAY COMPONENTS
import VendorHomestay from "./VendorHomestay";
import VendorHomestayBookings from "./VendorHomestayBookings";
import VendorDarshan from "./VendorDarshan";
import VendorHoliday from "./VendorHoliday";
import VendorHolidayBookings from "./VendorHolidayBookings";
import VendorBnb from "./Bnbmanager";
import Palaceapp from "./Palaceapp";
import VendorVacationHouse from "./Vacationhouseapp";
import { BnbBooking } from "./bnbBooking/BnbBooking";

export default function VendorLayout() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [vendorName, setVendorName] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [vendorService, setVendorService] = useState("");

  /* ================= AUTH CHECK ================= */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/";
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));

setVendorName(payload.name || "Vendor");
setVendorService(payload.service || "");
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("token");
      window.location.href = "/";
    }
  };

  /* ================= MENU CONFIG ================= */
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    {
  id: "bnb",
  label: "Bnbmanager",
  icon: "🏡",
  children: [
    { id: "bnb_manage", label: "Manage BnB", icon: "🏡" },
    { id: "bnb_bookings", label: "BnB Bookings", icon: "📘" },
  ],
},

   {
  id: "hotels",
  label: "Hotels",
  icon: "🏨",
  children: [
    {
      id: "hotels_manage",
      label: "Manage Hotels",
      icon: "🏨",
    },
    {
      id: "hotel_rooms",
      label: "Hotel Rooms",
      icon: "🛏️",
    },
    { id: "hotel_room_inventory", label: "Room Inventory", icon: "📊" },
    {
      id: "hotels_bookings",
      label: "Hotel Bookings",
      icon: "📑",
    },
  ],
},
    {
  id: "palace",
  label: "Palace",
  icon: "🏰",
  children: [
    { id: "palace_manage", label: "Manage Palace", icon: "🏰" }
  ],
},
    {
  id: "homestays",
  label: "Homestays",
  icon: "🏡",
  children: [
    { id: "homestays_manage", label: "Manage Homestays", icon: "🏡" },
    { id: "homestays_bookings", label: "Homestay Bookings", icon: "📘" },
  ],
},
{
  id: "vacationhouses",
  label: "Vacation Houses",
  icon: "🏡",
  children: [
    { id: "vacationhouses_manage", label: "Manage Vacation Houses", icon: "🏡" },
    { id: "vacationhouses_bookings", label: "Vacation House Bookings", icon: "📘" },
  ],
},
{
  id: "apartments",
  label: "Apartments",
  icon: "🏢",
  children: [
    { id: "apartments_manage", label: "Manage Apartments", icon: "🏢" },
    // { id: "apartments_bookings", label: "Apartment Bookings", icon: "📘" },
  ],
},

    {
      id: "cabs",
      label: "Cabs",
      icon: "🚕",
      children: [
        { id: "cabs_manage", label: "Manage Cabs", icon: "🚕" },
        { id: "cabs_bookings", label: "Cab Bookings", icon: "📑" },
      ],
    },

    {
      id: "buses",
      label: "Buses",
      icon: "🚌",
      children: [
        { id: "buses_manage", label: "Manage Buses", icon: "🚌" },
        { id: "buses_bookings", label: "Bus Bookings", icon: "🎫" },
    //      // 🔥 VIDEO JAISA STRUCTURE
    // { id: "buses_routes", label: "Routes", icon: "🛣️" },
    // { id: "buses_seats", label: "Seats Layout", icon: "💺" },

      ],
    },
    {
  id: "darshans",
  label: "Darshan",
  icon: "🛕",
  children: [
    { id: "darshan_manage", label: "Manage Darshan", icon: "🛕" },
  ],
},

   {
  id: "holidays",
  label: "Holidays",
  icon: "🏖️",
  children: [
    { id: "holidays_manage", label: "Manage Holidays", icon: "🏖️" },
    { id: "holidays_bookings", label: "Holiday Bookings", icon: "📘" },
  ],
},

    // {
    //   id: "flights",
    //   label: "Flights",
    //   icon: "✈️",
    //   children: [
    //     { id: "flights_manage", label: "Manage Flights", icon: "✈️" },
    //     { id: "flights_bookings", label: "Flight Bookings", icon: "🎟️" },
    //   ],
    // },
  ];const serviceMenus = {
  hotel: ["hotels"],

  homestay: ["homestays"],

  cabs: ["cabs"],

  buses: ["buses"],

  train: ["train"],

  Stay: ["bnb"],

  "BMT Darshan": ["darshans"]
};
const filteredMenus = menuItems.filter((item) => {

  if (item.id === "dashboard") return true;

  return serviceMenus[vendorService]?.includes(item.id);

});
  /* ================= TOGGLE MENU ================= */
  const toggleMenu = (menuId) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  /* ================= HANDLE MENU CLICK ================= */
  const handleMenuClick = (item) => {
    if (item.children) {
      toggleMenu(item.id);
      if (!expandedMenus[item.id]) {
        setActiveTab(item.children[0].id);
      }
    } else {
      setActiveTab(item.id);
    }
  };

  /* ================= AUTO-EXPAND ACTIVE PARENT ================= */
  useEffect(() => {
    menuItems.forEach((item) => {
      if (item.children) {
        const isChildActive = item.children.some((child) => child.id === activeTab);
        if (isChildActive && !expandedMenus[item.id]) {
          setExpandedMenus((prev) => ({ ...prev, [item.id]: true }));
        }
      }
    });
  }, [activeTab]);

  /* ================= HEADER TITLE ================= */
  const getActiveLabel = () => {
    for (let item of menuItems) {
      if (item.id === activeTab) return item.label;
      if (item.children) {
        const child = item.children.find((c) => c.id === activeTab);
        if (child) return child.label;
      }
    }
    return "Dashboard";
  };

  /* ================= MAIN CONTENT ================= */
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardContent />;
        case "bnb_manage":
  return <VendorBnb />;

case "bnb_bookings":
  return <BnbBooking/>

    case "hotels_manage":
  return <VendorHotels />;

case "hotel_rooms":
  return <VendorHotelRooms />;
  
case "hotel_room_inventory":
  return <VendorRoomInventory />;

case "hotels_bookings":
  return <VendorHotelBookings />;
      
         case "homestays_manage":
      return <VendorHomestay />;
    case "homestays_bookings":
      return <VendorHomestayBookings />;

      case "apartments_manage":
  return <VendorApartment />;
      case "cabs_manage":
        return <VendorCabs />;
      case "cabs_bookings":
        return <VendorCabBookings />;

      case "buses_manage":
        return <BusModule />;
      case "buses_bookings":
        return <VendorBusBookings />;
        case "vacationhouses_manage":
  return <VendorVacationHouse />;

case "vacationhouses_bookings":
  return <h2>Vacation House Bookings</h2>;

      case "flights_manage":
        return <VendorFlights />;
      case "flights_bookings":
        return <VendorFlightBookings />;
      case "darshan_manage":
  return <VendorDarshan />;
        case "holidays_manage":
  return <VendorHoliday />;
case "holidays_bookings":
  return <VendorHolidayBookings />;
  case "palace_manage":
  return <Palaceapp />;
      default:
        return <DashboardContent />;
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}>⏳</div>
        <p style={styles.loadingText}>Loading Vendor Panel...</p>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      {/* SIDEBAR */}
      <aside
        style={{
          ...styles.sidebar,
          width: sidebarCollapsed ? "70px" : "260px",
        }}
      >
        <div style={styles.sidebarHeader}>
          <div style={styles.logoContainer}>
            <span style={styles.logoIcon}>🏪</span>
            {!sidebarCollapsed && (
              <div>
                <h2 style={styles.logo}>Vendor Panel</h2>
                <p style={styles.vendorName}>Hi, {vendorName}</p>
              </div>
            )}
          </div>
          
          {/* HAMBURGER TOGGLE BUTTON */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={styles.hamburgerBtn}
            title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <span
              style={{
                ...styles.hamburgerLine,
                ...styles.hamburgerLineTop,
                transform: sidebarCollapsed
                  ? "rotate(0deg) translateY(0)"
                  : "rotate(45deg) translateY(8px)",
              }}
            />
            <span
              style={{
                ...styles.hamburgerLine,
                ...styles.hamburgerLineMiddle,
                opacity: sidebarCollapsed ? 1 : 0,
              }}
            />
            <span
              style={{
                ...styles.hamburgerLine,
                ...styles.hamburgerLineBottom,
                transform: sidebarCollapsed
                  ? "rotate(0deg) translateY(0)"
                  : "rotate(-45deg) translateY(-8px)",
              }}
            />
          </button>
        </div>

        <nav style={styles.nav}>
    {filteredMenus.map((item) => (
            <div key={item.id}>
              {/* MAIN ITEM */}
              <div
                style={{
                  ...styles.menuItem,
                  ...(activeTab === item.id && styles.menuItemActive),
                  ...(item.children &&
                    item.children.some((c) => c.id === activeTab) &&
                    styles.menuItemParentActive),
                }}
                onClick={() => handleMenuClick(item)}
              >
                <span style={styles.menuIcon}>{item.icon}</span>
                {!sidebarCollapsed && (
                  <>
                    <span style={styles.menuLabel}>{item.label}</span>
                    {item.children && (
                      <span
                        style={{
                          ...styles.chevron,
                          transform: expandedMenus[item.id]
                            ? "rotate(90deg)"
                            : "rotate(0deg)",
                        }}
                      >
                        ❯
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* SUB ITEMS (DROPDOWN) */}
              {item.children && expandedMenus[item.id] && !sidebarCollapsed && (
                <div style={styles.subMenuContainer}>
                  {item.children.map((child) => (
                    <div
                      key={child.id}
                      style={{
                        ...styles.subMenuItem,
                        ...(activeTab === child.id && styles.subMenuItemActive),
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTab(child.id);
                      }}
                    >
                      <span style={styles.subMenuDot}>•</span>
                      <span style={styles.subMenuIcon}>{child.icon}</span>
                      <span style={styles.subMenuLabel}>{child.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div style={styles.sidebarFooter}>
          <button onClick={logout} style={styles.logoutBtn}>
            <span>🚪</span>
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main style={styles.main}>
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <h1 style={styles.pageTitle}>{getActiveLabel()}</h1>
            <p style={styles.breadcrumb}>
              Vendor Panel / {getActiveLabel()}
            </p>
          </div>
          <div style={styles.headerRight}>
            <div style={styles.avatar}>
              {vendorName.charAt(0).toUpperCase()}
            </div>
            <div style={styles.userInfo}>
              <p style={styles.userName}>{vendorName}</p>
              <p style={styles.userRole}>Vendor</p>
            </div>
          </div>
        </header>

        <div style={styles.content}>{renderContent()}</div>
      </main>
    </div>
  );
}

/* ================= DASHBOARD ================= */
function DashboardContent() {
  const stats = [
    { title: "Total Hotels", value: "12", icon: "🏨", color: "#4CAF50" },
    { title: "Total Cabs", value: "8", icon: "🚕", color: "#FF9800" },
    { title: "Total Buses", value: "15", icon: "🚌", color: "#2196F3" },
    { title: "Total Flights", value: "6", icon: "✈️", color: "#9C27B0" },
  ];

  return (
    <div>
      <div style={styles.welcomeCard}>
        <h2 style={styles.welcomeTitle}>👋 Welcome to Vendor Dashboard</h2>
        <p style={styles.welcomeText}>
          Manage your hotels, cabs, buses, and flights all in one place
        </p>
      </div>

      <div style={styles.statsGrid}>
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      <div style={styles.quickActions}>
        <h3 style={styles.sectionTitle}>⚡ Quick Actions</h3>
        <div style={styles.actionGrid}>
          <ActionCard icon="🏨" title="Add Hotel" />
          <ActionCard icon="🚕" title="Add Cab" />
          <ActionCard icon="🚌" title="Add Bus" />
          <ActionCard icon="✈️" title="Add Flight" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div style={styles.statCard}>
      <div style={{ ...styles.statIconBox, background: color + "20" }}>
        <span style={{ ...styles.statIcon, color }}>{icon}</span>
      </div>
      <div style={styles.statContent}>
        <p style={styles.statTitle}>{title}</p>
        <h2 style={styles.statValue}>{value}</h2>
      </div>
      <div style={styles.statTrend}>
        <span style={styles.trendUp}>↑ 12%</span>
      </div>
    </div>
  );
}

function ActionCard({ icon, title }) {
  return (
    <div style={styles.actionCard}>
      <span style={styles.actionIcon}>{icon}</span>
      <p style={styles.actionTitle}>{title}</p>
    </div>
  );
}

/* ================= STYLES ================= */
const styles = {
  wrapper: {
    display: "flex",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },

  /* LOADING */
  loadingContainer: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
  },
  spinner: { fontSize: 60 },
  loadingText: { fontSize: 18, marginTop: 20 },

  /* SIDEBAR */
  sidebar: {
    background: "var(--sidebar-color",
    color: "black",
    display: "flex",
    flexDirection: "column",
    boxShadow: "4px 0 20px rgba(0,0,0,0.1)",
    transition: "width 0.3s ease",
    position: "relative",
    
  },
  sidebarHeader: {
    padding: "20px 15px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  logoIcon: {
    fontSize: 32,
  },
  logo: {
    margin: 0,
    fontSize: 18,
    fontWeight: 600,
  },
  vendorName: {
    fontSize: 12,
    color: "black",
    margin: "4px 0 0 0",
  },

  /* HAMBURGER BUTTON */
  hamburgerBtn: {
    background: "rgba(255,255,255,0.1)",
    border: "none",
    width: 32,
    height: 32,
    borderRadius: 6,
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    padding: 0,
    transition: "all 0.3s ease",
    position: "relative",
  },
  hamburgerLine: {
    width: 20,
    height: 2.5,
    background: "#fff",
    borderRadius: 2,
    transition: "all 0.3s ease",
    position: "absolute",
  },
  hamburgerLineTop: {
    top: 8,
  },
  hamburgerLineMiddle: {
    top: "50%",
    transform: "translateY(-50%)",
  },
  hamburgerLineBottom: {
    bottom: 8,
  },

  /* NAV */
  nav: {
    flex: 1,
    padding: "15px 10px",
    overflowY: "auto",
  },
  menuItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 15px",
    borderRadius: 8,
    cursor: "pointer",
    color: "#ccc",
    transition: "all 0.3s",
    marginBottom: 6,
    position: "relative",
  },
  menuItemActive: {
    background: "linear-gradient(90deg, #0f3460 0%, #1a5490 100%)",
    color: "#fff",
    boxShadow: "0 2px 8px rgba(15,52,96,0.4)",
  },
  menuItemParentActive: {
    background: "rgba(15,52,96,0.3)",
    color: "#fff",
  },
  menuIcon: {
    fontSize: 20,
    minWidth: 24,
    textAlign: "center",
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: 500,
  },
  chevron: {
    fontSize: 12,
    color: "#888",
    transition: "transform 0.3s ease",
    marginLeft: "auto",
  },

  /* SUBMENU */
  subMenuContainer: {
    marginLeft: 10,
    borderLeft: "2px solid rgba(255,255,255,0.1)",
    paddingLeft: 10,
    marginBottom: 8,
  },
  subMenuItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 15px",
    cursor: "pointer",
    fontSize: 13,
    color: "#bbb",
    borderRadius: 6,
    transition: "all 0.3s",
    marginBottom: 4,
  },
  subMenuItemActive: {
    background: "rgba(15,52,96,0.5)",
    color: "#fff",
    borderLeft: "3px solid #4CAF50",
    paddingLeft: "12px",
  },
  subMenuDot: {
    fontSize: 20,
    color: "#666",
    lineHeight: 1,
  },
  subMenuIcon: {
    fontSize: 16,
  },
  subMenuLabel: {
    fontWeight: 400,
  },

  /* SIDEBAR FOOTER */
  sidebarFooter: {
    padding: 15,
    borderTop: "1px solid rgba(255,255,255,0.1)",
  },
  logoutBtn: {
    width: "100%",
    padding: 12,
    background: "linear-gradient(90deg, #dc3545 0%, #c82333 100%)",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    display: "flex",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s",
    boxShadow: "0 2px 6px rgba(220,53,69,0.3)",
  },

  /* MAIN */
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  header: {
    background: "#fff",
    padding: "20px 30px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  headerLeft: {},
  pageTitle: {
    margin: 0,
    fontSize: 26,
    color: "#1a1a2e",
    fontWeight: 600,
  },
  breadcrumb: {
    margin: "5px 0 0 0",
    fontSize: 13,
    color: "#888",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: 18,
    boxShadow: "0 2px 8px rgba(102,126,234,0.4)",
  },
  userInfo: {},
  userName: {
    margin: 0,
    fontSize: 14,
    fontWeight: 600,
    color: "#1a1a2e",
  },
  userRole: {
    margin: "2px 0 0 0",
    fontSize: 12,
    color: "#888",
  },

  /* CONTENT */
  content: {
    padding: 30,
    flex: 1,
    overflowY: "auto",
  },

  /* DASHBOARD */
  welcomeCard: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: 30,
    borderRadius: 12,
    marginBottom: 30,
    color: "#fff",
    boxShadow: "0 4px 15px rgba(102,126,234,0.3)",
  },
  welcomeTitle: {
    margin: 0,
    fontSize: 24,
    fontWeight: 600,
  },
  welcomeText: {
    margin: "10px 0 0 0",
    fontSize: 15,
    opacity: 0.9,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: 20,
    marginBottom: 30,
  },
  statCard: {
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    display: "flex",
    gap: 15,
    alignItems: "center",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
    transition: "transform 0.3s, box-shadow 0.3s",
    cursor: "pointer",
  },
  statIconBox: {
    width: 60,
    height: 60,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  statIcon: {
    fontSize: 30,
  },
  statContent: {
    flex: 1,
  },
  statTitle: {
    margin: 0,
    fontSize: 13,
    color: "#666",
    fontWeight: 500,
  },
  statValue: {
    margin: "5px 0 0 0",
    fontSize: 28,
    fontWeight: 700,
    color: "#1a1a2e",
  },
  statTrend: {},
  trendUp: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: 600,
  },

  /* QUICK ACTIONS */
  quickActions: {
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: "#1a1a2e",
    marginBottom: 15,
  },
  actionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: 15,
  },
  actionCard: {
    background: "#fff",
    padding: 25,
    borderRadius: 12,
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.3s",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  actionIcon: {
    fontSize: 40,
    display: "block",
    marginBottom: 10,
  },
  actionTitle: {
    margin: 0,
    fontSize: 14,
    fontWeight: 600,
    color: "#1a1a2e",
  },
};





// import { useEffect, useState } from "react";

// import VendorHotels from "./VendorHotels";
// import VendorCabs from "./VendorCabs";
// import BusModule from "./BusModule";

// import VendorBusBookings from "./VendorBusBookings";
// import VendorCabBookings from "./VendorCabBookings";
// import VendorHotelBookings from "./VendorHotelBookings";

// import VendorHomestay from "./VendorHomestay";
// import VendorHomestayBookings from "./VendorHomestayBookings";

// export default function VendorLayout() {

//   const [activeTab, setActiveTab] = useState("dashboard");
//   const [vendorName, setVendorName] = useState("");
//   const [vendorService, setVendorService] = useState("");
//   const [loading, setLoading] = useState(true);

//   const [expandedMenus, setExpandedMenus] = useState({});

//   /* ================= AUTH CHECK ================= */

//   useEffect(() => {

//     const token = localStorage.getItem("token");

//     if (!token) {
//       window.location.href = "/";
//       return;
//     }

//     try {

//       const payload = JSON.parse(atob(token.split(".")[1]));

//       setVendorName(payload.name || "Vendor");
//       setVendorService(payload.service);

//     } catch {
//       localStorage.removeItem("token");
//       window.location.href = "/";
//     }

//     setLoading(false);

//   }, []);

//   /* ================= SERVICE MENUS ================= */

//   const serviceMenus = {

//     hotel: [
//       {
//         id: "hotels",
//         label: "Hotels",
//         icon: "🏨",
//         children: [
//           { id: "hotels_manage", label: "Manage Hotels" },
//           { id: "hotels_bookings", label: "Hotel Bookings" },
//         ],
//       },
//     ],

//     homestay: [
//       {
//         id: "homestays",
//         label: "Homestays",
//         icon: "🏡",
//         children: [
//           { id: "homestays_manage", label: "Manage Homestays" },
//           { id: "homestays_bookings", label: "Homestay Bookings" },
//         ],
//       },
//     ],

//     cab: [
//       {
//         id: "cabs",
//         label: "Cabs",
//         icon: "🚕",
//         children: [
//           { id: "cabs_manage", label: "Manage Cabs" },
//           { id: "cabs_bookings", label: "Cab Bookings" },
//         ],
//       },
//     ],

//     bus: [
//       {
//         id: "buses",
//         label: "Buses",
//         icon: "🚌",
//         children: [
//           { id: "buses_manage", label: "Manage Buses" },
//           { id: "buses_bookings", label: "Bus Bookings" },
//         ],
//       },
//     ],

//   };

//   /* ================= MENU BUILD ================= */

//   const menuItems = [
//     { id: "dashboard", label: "Dashboard", icon: "📊" },
//     ...(serviceMenus[vendorService] || [])
//   ];

//   /* ================= AUTO OPEN SERVICE MODULE ================= */

//   useEffect(() => {

//     if (vendorService === "hotel") {
//       setActiveTab("hotels_manage");
//     }

//     if (vendorService === "cab") {
//       setActiveTab("cabs_manage");
//     }

//     if (vendorService === "bus") {
//       setActiveTab("buses_manage");
//     }

//     if (vendorService === "homestay") {
//       setActiveTab("homestays_manage");
//     }

//   }, [vendorService]);

//   /* ================= MENU CLICK ================= */

//   const toggleMenu = (id) => {

//     setExpandedMenus(prev => ({
//       ...prev,
//       [id]: !prev[id]
//     }));

//   };

//   const handleMenuClick = (item) => {

//     if (item.children) {
//       toggleMenu(item.id);
//       setActiveTab(item.children[0].id);
//     } else {
//       setActiveTab(item.id);
//     }

//   };

//   /* ================= CONTENT ================= */

//   const renderContent = () => {

//     switch (activeTab) {

//       case "dashboard":
//         return <h2>Welcome {vendorName}</h2>;

//       case "hotels_manage":
//         return <VendorHotels />;

//       case "hotels_bookings":
//         return <VendorHotelBookings />;

//       case "cabs_manage":
//         return <VendorCabs />;

//       case "cabs_bookings":
//         return <VendorCabBookings />;

//       case "buses_manage":
//         return <BusModule />;

//       case "buses_bookings":
//         return <VendorBusBookings />;

//       case "homestays_manage":
//         return <VendorHomestay />;

//       case "homestays_bookings":
//         return <VendorHomestayBookings />;

//       default:
//         return <h2>Dashboard</h2>;
//     }

//   };

//   if (loading) {
//     return <h2 style={{ padding: 40 }}>Loading Vendor Panel...</h2>;
//   }

//   return (
//     <div style={{ display: "flex", minHeight: "100vh" }}>

//       {/* SIDEBAR */}

//       <aside style={{
//         width: 250,
//         background: "#1a1a2e",
//         color: "#fff",
//         padding: 20
//       }}>

//         <h2>Vendor Panel</h2>
//         <p>Hi, {vendorName}</p>

//         {menuItems.map(item => (

//           <div key={item.id}>

//             <div
//               style={{
//                 padding: 10,
//                 cursor: "pointer",
//                 background: activeTab === item.id ? "#16213e" : "transparent"
//               }}
//               onClick={() => handleMenuClick(item)}
//             >
//               {item.icon} {item.label}
//             </div>

//             {item.children && expandedMenus[item.id] && (

//               <div style={{ marginLeft: 15 }}>

//                 {item.children.map(child => (

//                   <div
//                     key={child.id}
//                     style={{
//                       padding: 8,
//                       cursor: "pointer",
//                       color: activeTab === child.id ? "#4CAF50" : "#ccc"
//                     }}
//                     onClick={() => setActiveTab(child.id)}
//                   >
//                     • {child.label}
//                   </div>

//                 ))}

//               </div>

//             )}

//           </div>

//         ))}

//         <button
//           style={{
//             marginTop: 30,
//             padding: 10,
//             width: "100%",
//             background: "#dc3545",
//             border: "none",
//             color: "#fff",
//             cursor: "pointer"
//           }}
//           onClick={() => {
//             localStorage.removeItem("token");
//             window.location.href = "/";
//           }}
//         >
//           Logout
//         </button>

//       </aside>

//       {/* MAIN CONTENT */}

//       <main style={{ flex: 1, padding: 30 }}>

//         {renderContent()}

//       </main>

//     </div>
//   );
// }