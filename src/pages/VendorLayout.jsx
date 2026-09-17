


// // // // import { useEffect, useState } from "react";
// // // // import VendorHotels from "./VendorHotels";
// // // // import VendorCabs from "./VendorCabs";
// // // // import BusModule from "./BusModule";
// // // // import BusTripModule from "./BusTripModule";
// // // // import BusSeatLayoutModule from "./BusSeatLayoutModule"; // NEW
// // // // import VendorBusBookings from "./VendorBusBookings";
// // // // import VendorCabBookings from "./VendorCabBookings";
// // // // import VendorHotelBookings from "./VendorHotelBookings";
// // // // import VendorHotelRooms from "./Vendorhotelrooms";
// // // // import VendorRoomInventory from "./Vendorroominventory";
// // // // import VendorFlights from "./VendorFlights";
// // // // import VendorFlightBookings from "./VendorFlightBookings";
// // // // import VendorApartment from "./Vendorapartment";
// // // // import VendorHomestay from "./VendorHomestay";
// // // // import Homestayunitmanager from "./Homestayunitmanager";
// // // // import VendorHomestayInventory from "./VendorHomestayInventory";
// // // // import VendorHomestayBookings from "./VendorHomestayBookings";
// // // // import VendorDarshan from "./VendorDarshan";
// // // // import VendorHoliday from "./VendorHoliday";
// // // // import VendorHolidayBookings from "./VendorHolidayBookings";
// // // // import VendorBnb from "./Bnbmanager";
// // // // import Palaceapp from "./Palaceapp";
// // // // import VendorVacationHouse from "./Vacationhouseapp";
// // // // import NightclubManagement from "./NightclubManagement";
// // // // import { BnbBooking } from "./bnbBooking/BnbBooking";
// // // // import VendorProfile from "./VendorProfile";

// // // // export default function VendorLayout() {
// // // //   const [activeTab, setActiveTab] = useState("dashboard");
// // // //   const [vendorName, setVendorName] = useState("");
// // // //   const [loading, setLoading] = useState(true);
// // // //   const [expandedMenus, setExpandedMenus] = useState({});
// // // //   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
// // // //   const [vendorService, setVendorService] = useState("");

// // // //   // useEffect(() => {
// // // //   //   const token = localStorage.getItem("token");
// // // //   //   if (!token) {
// // // //   //     window.location.href = "/";
// // // //   //     return;
// // // //   //   }

// // // //   //   try {
// // // //   //     const payload = JSON.parse(atob(token.split(".")[1]));
// // // //   //     setVendorName(payload.name || "Vendor");
// // // //   //     setVendorService(payload.service || "");
// // // //   //   } catch {
// // // //   //     logout();
// // // //   //   } finally {
// // // //   //     setLoading(false);
// // // //   //   }
// // // //   // }, []);

// // // //   useEffect(() => {
// // // //   const token = localStorage.getItem("token");

// // // //   if (!token) {
// // // //     window.location.href = "/login";
// // // //     return;
// // // //   }

// // // //   try {
// // // //     const payload = JSON.parse(
// // // //       atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
// // // //     );

// // // //     console.log("LOGIN TOKEN PAYLOAD:", payload);

// // // //     setVendorName(
// // // //       payload.name ||
// // // //       payload.vendorName ||
// // // //       payload.email ||
// // // //       "Vendor"
// // // //     );

// // // //     setVendorService(
// // // //       String(
// // // //         payload.service ||
// // // //         payload.vendorService ||
// // // //         payload.serviceType ||
// // // //         ""
// // // //       )
// // // //         .trim()
// // // //         .toLowerCase()
// // // //     );
// // // //   } catch (error) {
// // // //     console.error("TOKEN ERROR:", error);
// // // //     localStorage.removeItem("token");
// // // //     window.location.href = "/login";
// // // //   } finally {
// // // //     setLoading(false);
// // // //   }
// // // // }, []);

// // // //   const logout = () => {
// // // //     if (window.confirm("Are you sure you want to logout?")) {
// // // //       localStorage.removeItem("token");
// // // //       window.location.href = "/";
// // // //     }
// // // //   };

// // // //   const menuItems = [
// // // //     { id: "dashboard", label: "Dashboard" },
    
// // // // //  {
// // // // //     id: "profile",
// // // // //     label: "My Profile",
// // // // //   },
// // // //     {
// // // //       id: "bnb",
// // // //       label: "BnB Manager",
// // // //       children: [
// // // //         { id: "bnb_manage", label: "Manage BnB" },
// // // //         { id: "bnb_bookings", label: "BnB Bookings" },
// // // //       ],
// // // //     },
// // // //     {
// // // //       id: "hotels",
// // // //       label: "Hotels",
// // // //       children: [
// // // //         { id: "hotels_manage", label: "Manage Hotels" },
// // // //         { id: "hotel_rooms", label: "Hotel Rooms" },
// // // //         { id: "hotel_room_inventory", label: "Room Inventory" },
// // // //         { id: "hotels_bookings", label: "Hotel Bookings" },
// // // //       ],
// // // //     },
// // // //     {
// // // //       id: "palace",
// // // //       label: "Palace",
// // // //       children: [{ id: "palace_manage", label: "Manage Palace" }],
// // // //     },
// // // //     {
// // // //       id: "homestays",
// // // //       label: "Homestays",
// // // //       children: [
// // // //         { id: "homestays_manage", label: "Manage Homestays" },
// // // //         {
// // // //       id: "homestay_units",
// // // //       label: "Manage Homestay Units",
// // // //       icon: "▦",
// // // //     },
// // // //      {
// // // //       id: "homestay_inventory",
// // // //       label: "Homestay Inventory",
// // // //       icon: "▤",
// // // //     },
// // // //         { id: "homestays_bookings", label: "Homestay Bookings" },
// // // //       ],
// // // //     },
// // // //     {
// // // //       id: "vacationhouses",
// // // //       label: "Vacation Houses",
// // // //       children: [
// // // //         { id: "vacationhouses_manage", label: "Manage Vacation Houses" },
// // // //         { id: "vacationhouses_bookings", label: "Vacation House Bookings" },
// // // //       ],
// // // //     },
// // // //     {
// // // //       id: "apartments",
// // // //       label: "Apartments",
// // // //       children: [{ id: "apartments_manage", label: "Manage Apartments" }],
// // // //     },
// // // //     {
// // // //       id: "cabs",
// // // //       label: "Cabs",
// // // //       children: [
// // // //         { id: "cabs_manage", label: "Manage Cabs" },
// // // //         { id: "cabs_bookings", label: "Cab Bookings" },
// // // //       ],
// // // //     },
// // // //     {
// // // //       id: "buses",
// // // //       label: "Buses",
// // // //       children: [
// // // //         { id: "buses_manage", label: "Manage Buses" },
// // // //         {
// // // //       id: "bus_trip_module",
// // // //       label: "Bus Trip Management",
// // // //     },
// // // //     {
// // // //       id: "bus_seat_layout",
// // // //       label: "Bus Seat Layout",
// // // //     },
// // // //         { id: "buses_bookings", label: "Bus Bookings" },
// // // //       ],
// // // //     },
// // // //     {
// // // //       id: "darshans",
// // // //       label: "Darshan",
// // // //       children: [{ id: "darshan_manage", label: "Manage Darshan" }],
// // // //     },
// // // //     {
// // // //   id: "nightclub",
// // // //   label: "Nightclub",
// // // //   icon: "🌃",
// // // //   children: [
// // // //     {
// // // //       id: "nightclub_manage",
// // // //       label: "Manage Nightclubs",
// // // //       icon: "🏙️",
// // // //     },
// // // //   ],
// // // // },
// // // //     {
// // // //       id: "holidays",
// // // //       label: "Holidays",
// // // //       children: [
// // // //         { id: "holidays_manage", label: "Manage Holidays" },
// // // //         { id: "holidays_bookings", label: "Holiday Bookings" },
// // // //       ],
// // // //     },
// // // //   ];

// // // //  const serviceMenus = {
// // // //   hotel: ["hotels"],
// // // //   hotels: ["hotels"],

// // // //   homestay: ["homestays"],
// // // //   homestays: ["homestays"],
// // // //   "home stay": ["homestays"],

// // // //   cab: ["cabs"],
// // // //   cabs: ["cabs"],

// // // //   bus: ["buses"],
// // // //   buses: ["buses"],

// // // //   stay: ["bnb"],
// // // //   bnb: ["bnb"],

// // // //   darshan: ["darshans"],
// // // //   "bmt darshan": ["darshans"],

// // // //   vacation: ["vacationhouses"],
// // // //   vacationhouse: ["vacationhouses"],

// // // //   apartment: ["apartments"],
// // // //   apartments: ["apartments"],

// // // //   palace: ["palace"],
// // // //   holiday: ["holidays"],
// // // //   holidays: ["holidays"],
// // // //    nightclub: ["nightclub"],
// // // //   nightclubs: ["nightclub"],
// // // //   "night-club": ["nightclub"],
// // // // };

// // // // // const filteredMenus = menuItems.filter((item) => {
  
// // // // //   if (
// // // // //     item.id === "dashboard" ||
// // // // //     item.id === "profile"
// // // // //   ) {
// // // // //     return true;
// // // // //   }

  
// // // // //   return serviceMenus[vendorService]?.includes(item.id);
// // // // // });
// // // // const filteredMenus = menuItems.filter((item) => {
// // // //   // Dashboard har vendor ko dikhega
// // // //   if (item.id === "dashboard") {
// // // //     return true;
// // // //   }

// // // //   // Baaki sirf vendor ki service ke according
// // // //   return serviceMenus[vendorService]?.includes(item.id);
// // // // });
// // // //   const toggleMenu = (menuId) => {
// // // //     setExpandedMenus((prev) => ({
// // // //       ...prev,
// // // //       [menuId]: !prev[menuId],
// // // //     }));
// // // //   };

// // // //   const handleMenuClick = (item) => {
// // // //     if (item.children) {
// // // //       toggleMenu(item.id);
// // // //       if (!expandedMenus[item.id]) {
// // // //         setActiveTab(item.children[0].id);
// // // //       }
// // // //     } else {
// // // //       setActiveTab(item.id);
// // // //     }
// // // //   };

// // // //   useEffect(() => {
// // // //     menuItems.forEach((item) => {
// // // //       if (item.children) {
// // // //         const isChildActive = item.children.some((child) => child.id === activeTab);
// // // //         if (isChildActive && !expandedMenus[item.id]) {
// // // //           setExpandedMenus((prev) => ({ ...prev, [item.id]: true }));
// // // //         }
// // // //       }
// // // //     });
// // // //   }, [activeTab]);

// // // //   const getActiveLabel = () => {
// // // //     for (let item of menuItems) {
// // // //       if (item.id === activeTab) return item.label;
// // // //       if (item.children) {
// // // //         const child = item.children.find((c) => c.id === activeTab);
// // // //         if (child) return child.label;
// // // //       }
// // // //     }
// // // //     return "Dashboard";
// // // //   };

// // // //   const renderContent = () => {
// // // //     switch (activeTab) {
// // // //       case "dashboard":
// // // //         return <DashboardContent />;
// // // //          case "profile":
// // // //       return <VendorProfile />;
        
// // // //       case "bnb_manage":
// // // //         return <VendorBnb />;
// // // //       case "bnb_bookings":
// // // //         return <BnbBooking />;
// // // //       case "hotels_manage":
// // // //         return <VendorHotels />;
// // // //       case "hotel_rooms":
// // // //         return <VendorHotelRooms />;
// // // //       case "hotel_room_inventory":
// // // //         return <VendorRoomInventory />;
// // // //       case "hotels_bookings":
// // // //         return <VendorHotelBookings />;
// // // //       case "homestays_manage":
// // // //         return <VendorHomestay />;
// // // //         case "homestay_units":
// // // //   return <Homestayunitmanager />;
// // // //       case "homestays_bookings":
// // // //         return <VendorHomestayBookings />;
// // // //         case "homestay_inventory":
// // // //   return <VendorHomestayInventory />;
// // // //       case "apartments_manage":
// // // //         return <VendorApartment />;
// // // //       case "cabs_manage":
// // // //         return <VendorCabs />;
// // // //       case "cabs_bookings":
// // // //         return <VendorCabBookings />;
// // // //       case "buses_manage":
// // // //         return <BusModule />;
// // // //         case "bus_trip_module":
// // // //   return <BusTripModule />;
// // // //   case "bus_seat_layout":
// // // //   return <BusSeatLayoutModule />;
// // // //       case "buses_bookings":
// // // //         return <VendorBusBookings />;
// // // //         case "nightclub_manage":
// // // //   return <NightclubManagement />;
// // // //       case "vacationhouses_manage":
// // // //         return <VendorVacationHouse />;
// // // //       case "vacationhouses_bookings":
// // // //         return <h2>Vacation House Bookings</h2>;
// // // //       case "flights_manage":
// // // //         return <VendorFlights />;
// // // //       case "flights_bookings":
// // // //         return <VendorFlightBookings />;
// // // //       case "darshan_manage":
// // // //         return <VendorDarshan />;
// // // //       case "holidays_manage":
// // // //         return <VendorHoliday />;
// // // //       case "holidays_bookings":
// // // //         return <VendorHolidayBookings />;
// // // //       case "palace_manage":
// // // //         return <Palaceapp />;
// // // //       default:
// // // //         return <DashboardContent />;
// // // //     }
// // // //   };

// // // //   if (loading) {
// // // //     return (
// // // //       <div style={styles.loadingContainer}>
// // // //         <div style={styles.spinner}></div>
// // // //         <p style={styles.loadingText}>Loading Vendor Panel...</p>
// // // //       </div>
// // // //     );
// // // //   }

// // // //   return (
// // // //     <div style={styles.wrapper}>
// // // //       <aside style={{ ...styles.sidebar, width: sidebarCollapsed ? "72px" : "270px" }}>
// // // //         <div style={styles.sidebarHeader}>
// // // //           <div style={styles.logoContainer}>
// // // //             <span style={styles.logoIcon}>VP</span>
// // // //             {!sidebarCollapsed && (
// // // //               <div>
// // // //                 <h2 style={styles.logo}>Vendor Panel</h2>
// // // //                 <p style={styles.vendorName}>Hi, {vendorName}</p>
// // // //               </div>
// // // //             )}
// // // //           </div>
// // // //           <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={styles.hamburgerBtn}>
// // // //             <span style={{ ...styles.hamburgerLine, ...styles.hamburgerLineTop, transform: sidebarCollapsed ? "rotate(0deg) translateY(0)" : "rotate(45deg) translateY(8px)" }} />
// // // //             <span style={{ ...styles.hamburgerLine, ...styles.hamburgerLineMiddle, opacity: sidebarCollapsed ? 1 : 0 }} />
// // // //             <span style={{ ...styles.hamburgerLine, ...styles.hamburgerLineBottom, transform: sidebarCollapsed ? "rotate(0deg) translateY(0)" : "rotate(-45deg) translateY(-8px)" }} />
// // // //           </button>
// // // //         </div>

// // // //         <nav style={styles.nav}>
// // // //           {filteredMenus.map((item) => (
// // // //             <div key={item.id}>
// // // //               <div
// // // //                 style={{
// // // //                   ...styles.menuItem,
// // // //                   ...(activeTab === item.id && styles.menuItemActive),
// // // //                   ...(item.children && item.children.some((c) => c.id === activeTab) && styles.menuItemParentActive),
// // // //                 }}
// // // //                 onClick={() => handleMenuClick(item)}
// // // //               >
// // // //                 <span style={styles.menuLabel}>{item.label}</span>
// // // //                 {!sidebarCollapsed && item.children && (
// // // //                   <span style={{ ...styles.chevron, transform: expandedMenus[item.id] ? "rotate(90deg)" : "rotate(0deg)" }}>›</span>
// // // //                 )}
// // // //               </div>

// // // //               {item.children && expandedMenus[item.id] && !sidebarCollapsed && (
// // // //                 <div style={styles.subMenuContainer}>
// // // //                   {item.children.map((child) => (
// // // //                     <div
// // // //                       key={child.id}
// // // //                       style={{
// // // //                         ...styles.subMenuItem,
// // // //                         ...(activeTab === child.id && styles.subMenuItemActive),
// // // //                       }}
// // // //                       onClick={(e) => {
// // // //                         e.stopPropagation();
// // // //                         setActiveTab(child.id);
// // // //                       }}
// // // //                     >
// // // //                       <span style={styles.subMenuLabel}>{child.label}</span>
// // // //                     </div>
// // // //                   ))}
// // // //                 </div>
// // // //               )}
// // // //             </div>
// // // //           ))}
// // // //         </nav>

// // // //       <div style={styles.sidebarFooter}>

// // // //   {/* PROFILE */}
// // // //   <button
// // // //     onClick={() => setActiveTab("profile")}
// // // //     style={{
// // // //       ...styles.profileBtn,
// // // //       ...(activeTab === "profile" && styles.profileBtnActive),
// // // //     }}
// // // //   >
// // // //     {!sidebarCollapsed && <span>My Profile</span>}

// // // //     {sidebarCollapsed && (
// // // //       <span style={styles.footerIcon}>👤</span>
// // // //     )}
// // // //   </button>

// // // //   {/* LOGOUT */}
// // // //   <button
// // // //     onClick={logout}
// // // //     style={styles.logoutBtn}
// // // //   >
// // // //     {!sidebarCollapsed && <span>Logout</span>}

// // // //     {sidebarCollapsed && (
// // // //       <span style={styles.footerIcon}>↪</span>
// // // //     )}
// // // //   </button>

// // // // </div>
// // // //       </aside>

// // // //       <main style={styles.main}>
// // // //         <header style={styles.header}>
// // // //           <div style={styles.headerLeft}>
// // // //             <h1 style={styles.pageTitle}>{getActiveLabel()}</h1>
// // // //             <p style={styles.breadcrumb}>Vendor Panel / {getActiveLabel()}</p>
// // // //           </div>
// // // //           <div style={styles.headerRight}>
// // // //             <div style={styles.avatar}>{vendorName.charAt(0).toUpperCase()}</div>
// // // //             <div style={styles.userInfo}>
// // // //               <p style={styles.userName}>{vendorName}</p>
// // // //               <p style={styles.userRole}>Vendor</p>
// // // //             </div>
// // // //           </div>
// // // //         </header>

// // // //         <div style={styles.content}>{renderContent()}</div>
// // // //       </main>
// // // //     </div>
// // // //   );
// // // // }

// // // // function DashboardContent() {
// // // //   const stats = [
// // // //     { title: "Total Hotels", value: "12", color: "#4CAF50" },
// // // //     { title: "Total Cabs", value: "8", color: "#FF9800" },
// // // //     { title: "Total Buses", value: "15", color: "#2196F3" },
// // // //     { title: "Total Flights", value: "6", color: "#9C27B0" },
// // // //   ];

// // // //   return (
// // // //     <div>
// // // //       <div style={styles.welcomeCard}>
// // // //         <h2 style={styles.welcomeTitle}>Welcome to Vendor Dashboard</h2>
// // // //         <p style={styles.welcomeText}>Manage your hotels, cabs, buses, and flights all in one place</p>
// // // //       </div>

// // // //       <div style={styles.statsGrid}>
// // // //         {stats.map((stat, idx) => (
// // // //           <StatCard key={idx} {...stat} />
// // // //         ))}
// // // //       </div>

// // // //       <div style={styles.quickActions}>
// // // //         <h3 style={styles.sectionTitle}>Quick Actions</h3>
// // // //         <div style={styles.actionGrid}>
// // // //           <ActionCard title="Add Hotel" />
// // // //           <ActionCard title="Add Cab" />
// // // //           <ActionCard title="Add Bus" />
// // // //           <ActionCard title="Add Flight" />
// // // //         </div>
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // }

// // // // function StatCard({ title, value, color }) {
// // // //   return (
// // // //     <div style={styles.statCard}>
// // // //       <div style={{ ...styles.statIconBox, background: color + "20" }}>
// // // //         <span style={{ ...styles.statIcon, color }}>{value}</span>
// // // //       </div>
// // // //       <div style={styles.statContent}>
// // // //         <p style={styles.statTitle}>{title}</p>
// // // //         <h2 style={styles.statValue}>{value}</h2>
// // // //       </div>
// // // //       <div style={styles.statTrend}>
// // // //         <span style={styles.trendUp}>↑ 12%</span>
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // }

// // // // function ActionCard({ title }) {
// // // //   return (
// // // //     <div style={styles.actionCard}>
// // // //       <p style={styles.actionTitle}>{title}</p>
// // // //     </div>
// // // //   );
// // // // }

// // // // const styles = {
// // // //   wrapper: {
// // // //     display: "flex",
// // // //     minHeight: "100vh",
// // // //     background: "#f0f2f5",
// // // //     fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
// // // //   },

// // // //   loadingContainer: {
// // // //     minHeight: "100vh",
// // // //     display: "flex",
// // // //     flexDirection: "column",
// // // //     justifyContent: "center",
// // // //     alignItems: "center",
// // // //     background: "#0b1120",
// // // //     color: "#fff",
// // // //   },
// // // //   spinner: {
// // // //     width: "48px",
// // // //     height: "48px",
// // // //     border: "4px solid rgba(255,255,255,0.1)",
// // // //     borderTop: "4px solid #ffffff",
// // // //     borderRadius: "50%",
// // // //     animation: "spin 1s linear infinite",
// // // //   },
// // // //   loadingText: {
// // // //     fontSize: "18px",
// // // //     marginTop: "20px",
// // // //     color: "#a8c0ff",
// // // //   },

// // // //   sidebar: {
// // // //     background: "#0b1120",
// // // //     color: "#e8ecf5",
// // // //     display: "flex",
// // // //     flexDirection: "column",
// // // //     boxShadow: "4px 0 20px rgba(0,0,0,0.2)",
// // // //     transition: "width 0.3s ease",
// // // //     position: "relative",
// // // //     flexShrink: 0,
// // // //     height: "100vh",
// // // //     overflow: "hidden",
// // // //   },
// // // //   sidebarHeader: {
// // // //     padding: "24px 20px",
// // // //     borderBottom: "1px solid rgba(255,255,255,0.06)",
// // // //     display: "flex",
// // // //     justifyContent: "space-between",
// // // //     alignItems: "center",
// // // //     flexShrink: 0,
// // // //   },
// // // //   logoContainer: {
// // // //     display: "flex",
// // // //     alignItems: "center",
// // // //     gap: 12,
// // // //     overflow: "hidden",
// // // //   },
// // // //   logoIcon: {
// // // //     fontSize: "22px",
// // // //     fontWeight: 700,
// // // //     background: "linear-gradient(135deg, #4a6cf7, #8b5cf6)",
// // // //     color: "#fff",
// // // //     width: "40px",
// // // //     height: "40px",
// // // //     display: "flex",
// // // //     alignItems: "center",
// // // //     justifyContent: "center",
// // // //     borderRadius: "10px",
// // // //     flexShrink: 0,
// // // //   },
// // // //   logo: {
// // // //     margin: 0,
// // // //     fontSize: "18px",
// // // //     fontWeight: 600,
// // // //     color: "#fff",
// // // //     whiteSpace: "nowrap",
// // // //   },
// // // //   vendorName: {
// // // //     fontSize: "12px",
// // // //     color: "#8896ab",
// // // //     margin: "2px 0 0 0",
// // // //     whiteSpace: "nowrap",
// // // //   },

// // // //   hamburgerBtn: {
// // // //     background: "rgba(255,255,255,0.05)",
// // // //     border: "none",
// // // //     width: "36px",
// // // //     height: "36px",
// // // //     borderRadius: "8px",
// // // //     cursor: "pointer",
// // // //     display: "flex",
// // // //     flexDirection: "column",
// // // //     alignItems: "center",
// // // //     justifyContent: "center",
// // // //     gap: "5px",
// // // //     padding: 0,
// // // //     transition: "all 0.3s ease",
// // // //     position: "relative",
// // // //     flexShrink: 0,
// // // //   },
// // // //   hamburgerLine: {
// // // //     width: "20px",
// // // //     height: "2.5px",
// // // //     background: "#8896ab",
// // // //     borderRadius: "2px",
// // // //     transition: "all 0.3s ease",
// // // //     position: "absolute",
// // // //   },
// // // //   hamburgerLineTop: {
// // // //     top: "10px",
// // // //   },
// // // //   hamburgerLineMiddle: {
// // // //     top: "50%",
// // // //     transform: "translateY(-50%)",
// // // //   },
// // // //   hamburgerLineBottom: {
// // // //     bottom: "10px",
// // // //   },

// // // //   nav: {
// // // //     flex: 1,
// // // //     padding: "16px 12px",
// // // //     overflowY: "auto",
// // // //     overflowX: "hidden",
// // // //   },
// // // //   menuItem: {
// // // //     display: "flex",
// // // //     alignItems: "center",
// // // //     justifyContent: "space-between",
// // // //     padding: "10px 14px",
// // // //     borderRadius: "8px",
// // // //     cursor: "pointer",
// // // //     color: "#8896ab",
// // // //     transition: "all 0.2s ease",
// // // //     marginBottom: "4px",
// // // //     fontSize: "14px",
// // // //     fontWeight: 500,
// // // //   },
// // // //   menuItemActive: {
// // // //     background: "linear-gradient(90deg, #1a2a4a 0%, #2a3a6a 100%)",
// // // //     color: "#fff",
// // // //   },
// // // //   menuItemParentActive: {
// // // //     background: "rgba(26, 42, 74, 0.4)",
// // // //     color: "#fff",
// // // //   },
// // // //   menuLabel: {
// // // //     fontSize: "14px",
// // // //     fontWeight: 500,
// // // //     whiteSpace: "nowrap",
// // // //     overflow: "hidden",
// // // //     textOverflow: "ellipsis",
// // // //   },
// // // //   chevron: {
// // // //     fontSize: "18px",
// // // //     color: "#5a6a8a",
// // // //     transition: "transform 0.3s ease",
// // // //     marginLeft: "auto",
// // // //     flexShrink: 0,
// // // //   },

// // // //   subMenuContainer: {
// // // //     marginLeft: "16px",
// // // //     borderLeft: "2px solid rgba(255,255,255,0.06)",
// // // //     paddingLeft: "12px",
// // // //     marginBottom: "6px",
// // // //   },
// // // //   subMenuItem: {
// // // //     display: "flex",
// // // //     alignItems: "center",
// // // //     padding: "8px 14px",
// // // //     cursor: "pointer",
// // // //     fontSize: "13px",
// // // //     color: "#6a7a9a",
// // // //     borderRadius: "6px",
// // // //     transition: "all 0.2s ease",
// // // //     marginBottom: "2px",
// // // //   },
// // // //   subMenuItemActive: {
// // // //     background: "rgba(26, 42, 74, 0.3)",
// // // //     color: "#fff",
// // // //   },
// // // //   subMenuLabel: {
// // // //     fontSize: "13px",
// // // //     fontWeight: 400,
// // // //   },

// // // //   sidebarFooter: {
// // // //     padding: "16px 12px",
// // // //     borderTop: "1px solid rgba(255,255,255,0.06)",
// // // //     flexShrink: 0,
// // // //   },
// // // //   profileBtn: {
// // // //   width: "100%",
// // // //   padding: "11px 12px",
// // // //   background: "rgba(255,255,255,0.04)",
// // // //   border: "1px solid rgba(255,255,255,0.06)",
// // // //   color: "#a8b4c8",
// // // //   cursor: "pointer",
// // // //   borderRadius: "8px",
// // // //   fontSize: "14px",
// // // //   fontWeight: 600,
// // // //   transition: "all 0.25s ease",
// // // //   textAlign: "center",
// // // //   marginBottom: "10px",
// // // // },

// // // // profileBtnActive: {
// // // //   background: "linear-gradient(90deg, #1a2a4a 0%, #2a3a6a 100%)",
// // // //   color: "#ffffff",
// // // //   border: "1px solid rgba(255,255,255,0.10)",
// // // // },

// // // // footerIcon: {
// // // //   fontSize: "18px",
// // // // },
// // // //   logoutBtn: {
// // // //     width: "100%",
// // // //     padding: "10px",
// // // //     background: "rgba(220, 53, 69, 0.15)",
// // // //     border: "none",
// // // //     color: "#dc3545",
// // // //     cursor: "pointer",
// // // //     borderRadius: "8px",
// // // //     fontSize: "14px",
// // // //     fontWeight: 600,
// // // //     transition: "all 0.3s",
// // // //     textAlign: "center",
// // // //   },

// // // //   main: {
// // // //     flex: 1,
// // // //     display: "flex",
// // // //     flexDirection: "column",
// // // //     overflow: "hidden",
// // // //     background: "#f0f2f5",
// // // //   },
// // // //   header: {
// // // //     background: "#fff",
// // // //     padding: "20px 32px",
// // // //     display: "flex",
// // // //     justifyContent: "space-between",
// // // //     alignItems: "center",
// // // //     boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
// // // //     flexShrink: 0,
// // // //   },
// // // //   headerLeft: {},
// // // //   pageTitle: {
// // // //     margin: 0,
// // // //     fontSize: "24px",
// // // //     color: "#0b1120",
// // // //     fontWeight: 700,
// // // //   },
// // // //   breadcrumb: {
// // // //     margin: "4px 0 0 0",
// // // //     fontSize: "13px",
// // // //     color: "#8896ab",
// // // //   },
// // // //   headerRight: {
// // // //     display: "flex",
// // // //     alignItems: "center",
// // // //     gap: 12,
// // // //   },
// // // //   avatar: {
// // // //     width: "40px",
// // // //     height: "40px",
// // // //     borderRadius: "50%",
// // // //     background: "linear-gradient(135deg, #0b1120, #1a2a4a)",
// // // //     color: "#fff",
// // // //     display: "flex",
// // // //     alignItems: "center",
// // // //     justifyContent: "center",
// // // //     fontWeight: 600,
// // // //     fontSize: "16px",
// // // //   },
// // // //   userInfo: {},
// // // //   userName: {
// // // //     margin: 0,
// // // //     fontSize: "14px",
// // // //     fontWeight: 600,
// // // //     color: "#0b1120",
// // // //   },
// // // //   userRole: {
// // // //     margin: "2px 0 0 0",
// // // //     fontSize: "12px",
// // // //     color: "#8896ab",
// // // //   },

// // // //   content: {
// // // //     padding: "32px",
// // // //     flex: 1,
// // // //     overflowY: "auto",
// // // //   },

// // // //   welcomeCard: {
// // // //     background: "linear-gradient(135deg, #0b1120 0%, #1a2a4a 100%)",
// // // //     padding: "32px",
// // // //     borderRadius: "16px",
// // // //     marginBottom: "28px",
// // // //     color: "#fff",
// // // //     boxShadow: "0 4px 20px rgba(11, 17, 32, 0.2)",
// // // //   },
// // // //   welcomeTitle: {
// // // //     margin: 0,
// // // //     fontSize: "24px",
// // // //     fontWeight: 600,
// // // //   },
// // // //   welcomeText: {
// // // //     margin: "8px 0 0 0",
// // // //     fontSize: "15px",
// // // //     opacity: 0.85,
// // // //   },
// // // //   statsGrid: {
// // // //     display: "grid",
// // // //     gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
// // // //     gap: "20px",
// // // //     marginBottom: "32px",
// // // //   },
// // // //   statCard: {
// // // //     background: "#fff",
// // // //     padding: "20px 24px",
// // // //     borderRadius: "12px",
// // // //     display: "flex",
// // // //     gap: "16px",
// // // //     alignItems: "center",
// // // //     boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
// // // //     transition: "transform 0.2s, box-shadow 0.2s",
// // // //   },
// // // //   statIconBox: {
// // // //     width: "56px",
// // // //     height: "56px",
// // // //     borderRadius: "12px",
// // // //     display: "flex",
// // // //     alignItems: "center",
// // // //     justifyContent: "center",
// // // //     flexShrink: 0,
// // // //   },
// // // //   statIcon: {
// // // //     fontSize: "28px",
// // // //     fontWeight: 700,
// // // //   },
// // // //   statContent: {
// // // //     flex: 1,
// // // //   },
// // // //   statTitle: {
// // // //     margin: 0,
// // // //     fontSize: "13px",
// // // //     color: "#8896ab",
// // // //     fontWeight: 500,
// // // //   },
// // // //   statValue: {
// // // //     margin: "4px 0 0 0",
// // // //     fontSize: "26px",
// // // //     fontWeight: 700,
// // // //     color: "#0b1120",
// // // //   },
// // // //   statTrend: {},
// // // //   trendUp: {
// // // //     fontSize: "12px",
// // // //     color: "#4CAF50",
// // // //     fontWeight: 600,
// // // //   },

// // // //   quickActions: {
// // // //     marginTop: "8px",
// // // //   },
// // // //   sectionTitle: {
// // // //     fontSize: "18px",
// // // //     fontWeight: 600,
// // // //     color: "#0b1120",
// // // //     marginBottom: "16px",
// // // //   },
// // // //   actionGrid: {
// // // //     display: "grid",
// // // //     gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
// // // //     gap: "16px",
// // // //   },
// // // //   actionCard: {
// // // //     background: "#fff",
// // // //     padding: "24px",
// // // //     borderRadius: "12px",
// // // //     textAlign: "center",
// // // //     cursor: "pointer",
// // // //     transition: "all 0.2s",
// // // //     boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
// // // //   },
// // // //   actionTitle: {
// // // //     margin: 0,
// // // //     fontSize: "14px",
// // // //     fontWeight: 500,
// // // //     color: "#0b1120",
// // // //   },
// // // // };

// // // // if (typeof document !== "undefined" && !document.getElementById("vendor-layout-styles")) {
// // // //   const styleSheet = document.createElement("style");
// // // //   styleSheet.id = "vendor-layout-styles";
// // // //   styleSheet.textContent = `
// // // //     @keyframes spin {
// // // //       from { transform: rotate(0deg); }
// // // //       to { transform: rotate(360deg); }
// // // //     }

// // // //     .menu-item:hover {
// // // //       background: rgba(255,255,255,0.04);
// // // //     }

// // // //     .sub-menu-item:hover {
// // // //       background: rgba(255,255,255,0.03);
// // // //     }

// // // //     .stat-card:hover {
// // // //       transform: translateY(-4px);
// // // //       box-shadow: 0 8px 25px rgba(0,0,0,0.08);
// // // //     }

// // // //     .action-card:hover {
// // // //       transform: translateY(-4px);
// // // //       box-shadow: 0 8px 25px rgba(0,0,0,0.08);
// // // //     }

// // // //     .logout-btn:hover {
// // // //       background: rgba(220, 53, 69, 0.25);
// // // //     }

// // // //     .hamburger-btn:hover {
// // // //       background: rgba(255,255,255,0.08);
// // // //     }

// // // //     .sidebar::-webkit-scrollbar {
// // // //       width: 4px;
// // // //     }

// // // //     .sidebar::-webkit-scrollbar-track {
// // // //       background: transparent;
// // // //     }

// // // //     .sidebar::-webkit-scrollbar-thumb {
// // // //       background: rgba(255,255,255,0.1);
// // // //       border-radius: 10px;
// // // //     }

// // // //     .content::-webkit-scrollbar {
// // // //       width: 6px;
// // // //     }

// // // //     .content::-webkit-scrollbar-track {
// // // //       background: transparent;
// // // //     }

// // // //     .content::-webkit-scrollbar-thumb {
// // // //       background: #d1d5db;
// // // //       border-radius: 10px;
// // // //     }

// // // //     .content::-webkit-scrollbar-thumb:hover {
// // // //       background: #9ca3af;
// // // //     }

// // // //     @media (max-width: 768px) {
// // // //       .sidebar {
// // // //         width: 72px !important;
// // // //       }
      
// // // //       .sidebar .logo,
// // // //       .sidebar .vendor-name,
// // // //       .sidebar .menu-label,
// // // //       .sidebar .chevron,
// // // //       .sidebar .sub-menu-label {
// // // //         display: none !important;
// // // //       }
      
// // // //       .sidebar .logo-container {
// // // //         justify-content: center;
// // // //       }
      
// // // //       .sidebar .sub-menu-container {
// // // //         margin-left: 4px;
// // // //         padding-left: 4px;
// // // //       }
      
// // // //       .sidebar .sub-menu-item {
// // // //         padding: 6px 8px;
// // // //         justify-content: center;
// // // //       }
      
// // // //       .sidebar .menu-item {
// // // //         justify-content: center;
// // // //         padding: 10px 8px;
// // // //       }
      
// // // //       .header {
// // // //         padding: 16px 20px !important;
// // // //         flex-wrap: wrap;
// // // //         gap: 12px;
// // // //       }
      
// // // //       .page-title {
// // // //         font-size: 20px !important;
// // // //       }
      
// // // //       .content {
// // // //         padding: 20px !important;
// // // //       }
      
// // // //       .stats-grid {
// // // //         grid-template-columns: 1fr 1fr !important;
// // // //       }
      
// // // //       .action-grid {
// // // //         grid-template-columns: 1fr 1fr !important;
// // // //       }
      
// // // //       .welcome-card {
// // // //         padding: 24px !important;
// // // //       }
      
// // // //       .welcome-title {
// // // //         font-size: 20px !important;
// // // //       }
// // // //     }

// // // //     @media (max-width: 480px) {
// // // //       .stats-grid {
// // // //         grid-template-columns: 1fr !important;
// // // //       }
      
// // // //       .action-grid {
// // // //         grid-template-columns: 1fr !important;
// // // //       }
      
// // // //       .header-right {
// // // //         display: none !important;
// // // //       }
      
// // // //       .content {
// // // //         padding: 16px !important;
// // // //       }
// // // //     }
// // // //   `;
// // // //   document.head.appendChild(styleSheet);
// // // // }

// // // import { useEffect, useState } from "react";

// // // import VendorHotels from "./VendorHotels";
// // // import VendorCabs from "./VendorCabs";

// // // import BusModule from "./BusModule";
// // // import BusTripModule from "./BusTripModule";
// // // import BusSeatLayoutModule from "./BusSeatLayoutModule";

// // // import VendorBusBookings from "./VendorBusBookings";
// // // import VendorCabBookings from "./VendorCabBookings";

// // // import VendorHotelBookings from "./VendorHotelBookings";
// // // import VendorHotelRooms from "./Vendorhotelrooms";
// // // import VendorRoomInventory from "./Vendorroominventory";

// // // import VendorFlights from "./VendorFlights";
// // // import VendorFlightBookings from "./VendorFlightBookings";

// // // import VendorApartment from "./Vendorapartment";

// // // import VendorHomestay from "./VendorHomestay";
// // // import Homestayunitmanager from "./Homestayunitmanager";
// // // import VendorHomestayInventory from "./VendorHomestayInventory";
// // // import VendorHomestayBookings from "./VendorHomestayBookings";

// // // import VendorDarshan from "./VendorDarshan";

// // // import VendorHoliday from "./VendorHoliday";
// // // import VendorHolidayBookings from "./VendorHolidayBookings";

// // // import VendorBnb from "./Bnbmanager";

// // // import Palaceapp from "./Palaceapp";

// // // import VendorVacationHouse from "./Vacationhouseapp";

// // // import NightclubManagement from "./NightclubManagement";

// // // import { BnbBooking } from "./bnbBooking/BnbBooking";

// // // import VendorProfile from "./VendorProfile";

// // // export default function VendorLayout() {
// // //   const [activeTab, setActiveTab] = useState("dashboard");

// // //   const [vendorName, setVendorName] = useState("");

// // //   const [vendorService, setVendorService] = useState("");

// // //   const [loading, setLoading] = useState(true);

// // //   const [expandedMenus, setExpandedMenus] = useState({});

// // //   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

// // //   /* =========================================================
// // //      LOGIN TOKEN
// // //   ========================================================= */

// // //   useEffect(() => {
// // //     const token = localStorage.getItem("token");

// // //     if (!token) {
// // //       window.location.href = "/login";
// // //       return;
// // //     }

// // //     try {
// // //       const payload = JSON.parse(
// // //         atob(
// // //           token
// // //             .split(".")[1]
// // //             .replace(/-/g, "+")
// // //             .replace(/_/g, "/")
// // //         )
// // //       );

// // //       console.log("LOGIN TOKEN PAYLOAD:", payload);

// // //       setVendorName(
// // //         payload.name ||
// // //           payload.vendorName ||
// // //           payload.email ||
// // //           "Vendor"
// // //       );

// // //       setVendorService(
// // //         String(
// // //           payload.service ||
// // //             payload.vendorService ||
// // //             payload.serviceType ||
// // //             ""
// // //         )
// // //           .trim()
// // //           .toLowerCase()
// // //       );
// // //     } catch (error) {
// // //       console.error("TOKEN ERROR:", error);

// // //       localStorage.removeItem("token");

// // //       window.location.href = "/login";
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   }, []);

// // //   /* =========================================================
// // //      LOGOUT
// // //   ========================================================= */

// // //   const logout = () => {
// // //     if (window.confirm("Are you sure you want to logout?")) {
// // //       localStorage.removeItem("token");
// // //       localStorage.removeItem("user");

// // //       window.location.href = "/";
// // //     }
// // //   };

// // //   /* =========================================================
// // //      SIDEBAR MENUS
// // //   ========================================================= */

// // //   const menuItems = [
// // //     /* ===============================
// // //        DASHBOARD
// // //     =============================== */

// // //     {
// // //       id: "dashboard",
// // //       label: "Dashboard",
// // //     },

// // //     /* ===============================
// // //        BNB
// // //     =============================== */

// // //     {
// // //       id: "bnb",
// // //       label: "BnB Manager",

// // //       children: [
// // //         {
// // //           id: "bnb_manage",
// // //           label: "Manage BnB",
// // //         },

// // //         {
// // //           id: "bnb_bookings",
// // //           label: "BnB Bookings",
// // //         },
// // //       ],
// // //     },

// // //     /* ===============================
// // //        HOTELS
// // //     =============================== */

// // //     {
// // //       id: "hotels",
// // //       label: "Hotels",

// // //       children: [
// // //         {
// // //           id: "hotels_manage",
// // //           label: "Manage Hotels",
// // //         },

// // //         {
// // //           id: "hotel_rooms",
// // //           label: "Hotel Rooms",
// // //         },

// // //         {
// // //           id: "hotel_room_inventory",
// // //           label: "Room Inventory",
// // //         },

// // //         {
// // //           id: "hotels_bookings",
// // //           label: "Hotel Bookings",
// // //         },
// // //       ],
// // //     },

// // //     /* ===============================
// // //        PALACE
// // //     =============================== */

// // //     {
// // //       id: "palace",
// // //       label: "Palace",

// // //       children: [
// // //         {
// // //           id: "palace_manage",
// // //           label: "Manage Palace",
// // //         },
// // //       ],
// // //     },

// // //     /* ===============================
// // //        HOMESTAY
// // //     =============================== */

// // //     {
// // //       id: "homestays",
// // //       label: "Homestays",

// // //       children: [
// // //         {
// // //           id: "homestays_manage",
// // //           label: "Manage Homestays",
// // //         },

// // //         {
// // //           id: "homestay_units",
// // //           label: "Manage Homestay Units",
// // //         },

// // //         {
// // //           id: "homestay_inventory",
// // //           label: "Homestay Inventory",
// // //         },

// // //         {
// // //           id: "homestays_bookings",
// // //           label: "Homestay Bookings",
// // //         },
// // //       ],
// // //     },

// // //     /* ===============================
// // //        VACATION HOUSE
// // //     =============================== */

// // //     {
// // //       id: "vacationhouses",
// // //       label: "Vacation Houses",

// // //       children: [
// // //         {
// // //           id: "vacationhouses_manage",
// // //           label: "Manage Vacation Houses",
// // //         },

// // //         {
// // //           id: "vacationhouses_bookings",
// // //           label: "Vacation House Bookings",
// // //         },
// // //       ],
// // //     },

// // //     /* ===============================
// // //        APARTMENT
// // //     =============================== */

// // //     {
// // //       id: "apartments",
// // //       label: "Apartments",

// // //       children: [
// // //         {
// // //           id: "apartments_manage",
// // //           label: "Manage Apartments",
// // //         },
// // //       ],
// // //     },

// // //     /* ===============================
// // //        CABS
// // //     =============================== */

// // //     {
// // //       id: "cabs",
// // //       label: "Cabs",

// // //       children: [
// // //         {
// // //           id: "cabs_manage",
// // //           label: "Manage Cabs",
// // //         },

// // //         {
// // //           id: "cabs_bookings",
// // //           label: "Cab Bookings",
// // //         },
// // //       ],
// // //     },

// // //     /* ===============================
// // //        BUSES
// // //     =============================== */

// // //     {
// // //       id: "buses",
// // //       label: "Buses",

// // //       children: [
// // //         {
// // //           id: "buses_manage",
// // //           label: "Manage Buses",
// // //         },

// // //         {
// // //           id: "bus_trip_module",
// // //           label: "Bus Trip Management",
// // //         },

// // //         {
// // //           id: "bus_seat_layout",
// // //           label: "Bus Seat Layout",
// // //         },

// // //         {
// // //           id: "buses_bookings",
// // //           label: "Bus Bookings",
// // //         },
// // //       ],
// // //     },

// // //     /* ===============================
// // //        DARSHAN
// // //     =============================== */

// // //     {
// // //       id: "darshans",
// // //       label: "Darshan",

// // //       children: [
// // //         {
// // //           id: "darshan_manage",
// // //           label: "Manage Darshan",
// // //         },
// // //       ],
// // //     },

// // //     /* ===============================
// // //        NIGHTCLUB
// // //     =============================== */

// // //     {
// // //       id: "nightclub",
// // //       label: "Nightclub",

// // //       children: [
// // //         {
// // //           id: "nightclub_manage",
// // //           label: "Manage Nightclubs",
// // //         },
// // //       ],
// // //     },

// // //     /* ===============================
// // //        HOLIDAYS
// // //     =============================== */

// // //     {
// // //       id: "holidays",
// // //       label: "Holidays",

// // //       children: [
// // //         {
// // //           id: "holidays_manage",
// // //           label: "Manage Holidays",
// // //         },

// // //         {
// // //           id: "holidays_bookings",
// // //           label: "Holiday Bookings",
// // //         },
// // //       ],
// // //     },

// // //     /* =====================================================
// // //        MY PROFILE
// // //        IMPORTANT:
// // //        Ye menu sabse last hai.
// // //        Isliye service ke neeche aayega.
// // //     ===================================================== */

// // //     {
// // //       id: "profile",
// // //       label: "My Profile",

// // //       children: [
// // //         {
// // //           id: "profile_personal",
// // //           label: "Profile",
// // //         },

// // //         {
// // //           id: "profile_business",
// // //           label: "Business Details",
// // //         },

// // //         {
// // //           id: "profile_contact",
// // //           label: "Contact Details",
// // //         },

// // //         {
// // //           id: "profile_tax",
// // //           label: "Tax & Identity",
// // //         },

// // //         {
// // //           id: "profile_bank",
// // //           label: "Bank Details",
// // //         },

// // //         {
// // //           id: "profile_service",
// // //           label: "Service Details",
// // //         },
// // //       ],
// // //     },
// // //   ];

// // //   /* =========================================================
// // //      SERVICE MENU MAPPING
// // //   ========================================================= */

// // //   const serviceMenus = {
// // //     hotel: ["hotels"],
// // //     hotels: ["hotels"],

// // //     homestay: ["homestays"],
// // //     homestays: ["homestays"],
// // //     "home stay": ["homestays"],

// // //     cab: ["cabs"],
// // //     cabs: ["cabs"],
// // //     "car-rental": ["cabs"],

// // //     bus: ["buses"],
// // //     buses: ["buses"],

// // //     stay: ["bnb"],
// // //     bnb: ["bnb"],

// // //     darshan: ["darshans"],
// // //     "bmt darshan": ["darshans"],

// // //     vacation: ["vacationhouses"],
// // //     vacationhouse: ["vacationhouses"],
// // //     "vacation-home": ["vacationhouses"],

// // //     apartment: ["apartments"],
// // //     apartments: ["apartments"],

// // //     palace: ["palace"],

// // //     holiday: ["holidays"],
// // //     holidays: ["holidays"],

// // //     nightclub: ["nightclub"],
// // //     nightclubs: ["nightclub"],
// // //     "night-club": ["nightclub"],
// // //   };

// // //   /* =========================================================
// // //      FILTER MENU
// // //   ========================================================= */

// // //   const filteredMenus = menuItems.filter((item) => {
// // //     /* Dashboard always visible */

// // //     if (item.id === "dashboard") {
// // //       return true;
// // //     }

// // //     /* Profile always visible */

// // //     if (item.id === "profile") {
// // //       return true;
// // //     }

// // //     /* Service based menu */

// // //     return serviceMenus[vendorService]?.includes(item.id);
// // //   });

// // //   /* =========================================================
// // //      MENU OPEN / CLOSE
// // //   ========================================================= */

// // //   const toggleMenu = (menuId) => {
// // //     setExpandedMenus((prev) => ({
// // //       ...prev,

// // //       [menuId]: !prev[menuId],
// // //     }));
// // //   };

// // //   const handleMenuClick = (item) => {
// // //     if (item.children) {
// // //       toggleMenu(item.id);

// // //       /*
// // //         Agar menu closed tha aur ab open ho raha hai,
// // //         to first child open kar do.
// // //       */

// // //       if (!expandedMenus[item.id]) {
// // //         setActiveTab(item.children[0].id);
// // //       }
// // //     } else {
// // //       setActiveTab(item.id);
// // //     }
// // //   };

// // //   /* =========================================================
// // //      ACTIVE CHILD KA PARENT OPEN RAKHO
// // //   ========================================================= */

// // //   useEffect(() => {
// // //     menuItems.forEach((item) => {
// // //       if (!item.children) {
// // //         return;
// // //       }

// // //       const isChildActive = item.children.some(
// // //         (child) => child.id === activeTab
// // //       );

// // //       if (isChildActive) {
// // //         setExpandedMenus((prev) => ({
// // //           ...prev,

// // //           [item.id]: true,
// // //         }));
// // //       }
// // //     });
// // //   }, [activeTab]);

// // //   /* =========================================================
// // //      HEADER LABEL
// // //   ========================================================= */

// // //   const getActiveLabel = () => {
// // //     for (const item of menuItems) {
// // //       if (item.id === activeTab) {
// // //         return item.label;
// // //       }

// // //       if (item.children) {
// // //         const child = item.children.find(
// // //           (child) => child.id === activeTab
// // //         );

// // //         if (child) {
// // //           return child.label;
// // //         }
// // //       }
// // //     }

// // //     return "Dashboard";
// // //   };

// // //   /* =========================================================
// // //      PAGE CONTENT
// // //   ========================================================= */

// // //   const renderContent = () => {
// // //     switch (activeTab) {
// // //       /* ===============================
// // //          DASHBOARD
// // //       =============================== */

// // //       case "dashboard":
// // //         return <DashboardContent />;

// // //       /* ===============================
// // //          PROFILE
// // //       =============================== */

// // //       case "profile_personal":
// // //         return (
// // //           <VendorProfile
// // //             initialSection="personal"
// // //           />
// // //         );

// // //       case "profile_business":
// // //         return (
// // //           <VendorProfile
// // //             initialSection="business"
// // //           />
// // //         );

// // //       case "profile_contact":
// // //         return (
// // //           <VendorProfile
// // //             initialSection="contact"
// // //           />
// // //         );

// // //       case "profile_tax":
// // //         return (
// // //           <VendorProfile
// // //             initialSection="tax"
// // //           />
// // //         );

// // //       case "profile_bank":
// // //         return (
// // //           <VendorProfile
// // //             initialSection="bank"
// // //           />
// // //         );

// // //       case "profile_service":
// // //         return (
// // //           <VendorProfile
// // //             initialSection="service"
// // //           />
// // //         );

// // //       /* ===============================
// // //          BNB
// // //       =============================== */

// // //       case "bnb_manage":
// // //         return <VendorBnb />;

// // //       case "bnb_bookings":
// // //         return <BnbBooking />;

// // //       /* ===============================
// // //          HOTELS
// // //       =============================== */

// // //       case "hotels_manage":
// // //         return <VendorHotels />;

// // //       case "hotel_rooms":
// // //         return <VendorHotelRooms />;

// // //       case "hotel_room_inventory":
// // //         return <VendorRoomInventory />;

// // //       case "hotels_bookings":
// // //         return <VendorHotelBookings />;

// // //       /* ===============================
// // //          HOMESTAY
// // //       =============================== */

// // //       case "homestays_manage":
// // //         return <VendorHomestay />;

// // //       case "homestay_units":
// // //         return <Homestayunitmanager />;

// // //       case "homestay_inventory":
// // //         return <VendorHomestayInventory />;

// // //       case "homestays_bookings":
// // //         return <VendorHomestayBookings />;

// // //       /* ===============================
// // //          APARTMENT
// // //       =============================== */

// // //       case "apartments_manage":
// // //         return <VendorApartment />;

// // //       /* ===============================
// // //          CABS
// // //       =============================== */

// // //       case "cabs_manage":
// // //         return <VendorCabs />;

// // //       case "cabs_bookings":
// // //         return <VendorCabBookings />;

// // //       /* ===============================
// // //          BUS
// // //       =============================== */

// // //       case "buses_manage":
// // //         return <BusModule />;

// // //       case "bus_trip_module":
// // //         return <BusTripModule />;

// // //       case "bus_seat_layout":
// // //         return <BusSeatLayoutModule />;

// // //       case "buses_bookings":
// // //         return <VendorBusBookings />;

// // //       /* ===============================
// // //          NIGHTCLUB
// // //       =============================== */

// // //       case "nightclub_manage":
// // //         return <NightclubManagement />;

// // //       /* ===============================
// // //          VACATION HOUSE
// // //       =============================== */

// // //       case "vacationhouses_manage":
// // //         return <VendorVacationHouse />;

// // //       case "vacationhouses_bookings":
// // //         return (
// // //           <h2>
// // //             Vacation House Bookings
// // //           </h2>
// // //         );

// // //       /* ===============================
// // //          FLIGHTS
// // //       =============================== */

// // //       case "flights_manage":
// // //         return <VendorFlights />;

// // //       case "flights_bookings":
// // //         return <VendorFlightBookings />;

// // //       /* ===============================
// // //          DARSHAN
// // //       =============================== */

// // //       case "darshan_manage":
// // //         return <VendorDarshan />;

// // //       /* ===============================
// // //          HOLIDAY
// // //       =============================== */

// // //       case "holidays_manage":
// // //         return <VendorHoliday />;

// // //       case "holidays_bookings":
// // //         return <VendorHolidayBookings />;

// // //       /* ===============================
// // //          PALACE
// // //       =============================== */

// // //       case "palace_manage":
// // //         return <Palaceapp />;

// // //       default:
// // //         return <DashboardContent />;
// // //     }
// // //   };

// // //   /* =========================================================
// // //      LOADING
// // //   ========================================================= */

// // //   if (loading) {
// // //     return (
// // //       <div style={styles.loadingContainer}>
// // //         <div style={styles.spinner} />

// // //         <p style={styles.loadingText}>
// // //           Loading Vendor Panel...
// // //         </p>
// // //       </div>
// // //     );
// // //   }

// // //   /* =========================================================
// // //      UI
// // //   ========================================================= */

// // //   return (
// // //     <div style={styles.wrapper}>
// // //       {/* =====================================================
// // //           SIDEBAR
// // //       ===================================================== */}

// // //       <aside
// // //         style={{
// // //           ...styles.sidebar,

// // //           width: sidebarCollapsed
// // //             ? "72px"
// // //             : "270px",
// // //         }}
// // //       >
// // //         {/* HEADER */}

// // //         <div style={styles.sidebarHeader}>
// // //           <div style={styles.logoContainer}>
// // //             <span style={styles.logoIcon}>
// // //               VP
// // //             </span>

// // //             {!sidebarCollapsed && (
// // //               <div>
// // //                 <h2 style={styles.logo}>
// // //                   Vendor Panel
// // //                 </h2>

// // //                 <p style={styles.vendorName}>
// // //                   Hi, {vendorName}
// // //                 </p>
// // //               </div>
// // //             )}
// // //           </div>

// // //           <button
// // //             onClick={() =>
// // //               setSidebarCollapsed(
// // //                 !sidebarCollapsed
// // //               )
// // //             }
// // //             style={styles.hamburgerBtn}
// // //           >
// // //             {sidebarCollapsed
// // //               ? "☰"
// // //               : "×"}
// // //           </button>
// // //         </div>

// // //         {/* =================================================
// // //             MENU
// // //         ================================================= */}

// // //         <nav style={styles.nav}>
// // //           {filteredMenus.map((item) => {
// // //             const isParentActive =
// // //               item.children?.some(
// // //                 (child) =>
// // //                   child.id ===
// // //                   activeTab
// // //               );

// // //             return (
// // //               <div key={item.id}>
// // //                 <div
// // //                   style={{
// // //                     ...styles.menuItem,

// // //                     ...(activeTab ===
// // //                       item.id
// // //                       ? styles.menuItemActive
// // //                       : {}),

// // //                     ...(isParentActive
// // //                       ? styles.menuItemParentActive
// // //                       : {}),
// // //                   }}
// // //                   onClick={() =>
// // //                     handleMenuClick(
// // //                       item
// // //                     )
// // //                   }
// // //                 >
// // //                   <span
// // //                     style={
// // //                       styles.menuLabel
// // //                     }
// // //                   >
// // //                     {sidebarCollapsed
// // //                       ? item.label.charAt(
// // //                           0
// // //                         )
// // //                       : item.label}
// // //                   </span>

// // //                   {!sidebarCollapsed &&
// // //                     item.children && (
// // //                       <span
// // //                         style={{
// // //                           ...styles.chevron,

// // //                           transform:
// // //                             expandedMenus[
// // //                               item.id
// // //                             ]
// // //                               ? "rotate(90deg)"
// // //                               : "rotate(0deg)",
// // //                         }}
// // //                       >
// // //                         ›
// // //                       </span>
// // //                     )}
// // //                 </div>

// // //                 {/* SUB MENU */}

// // //                 {item.children &&
// // //                   expandedMenus[
// // //                     item.id
// // //                   ] &&
// // //                   !sidebarCollapsed && (
// // //                     <div
// // //                       style={
// // //                         styles.subMenuContainer
// // //                       }
// // //                     >
// // //                       {item.children.map(
// // //                         (child) => (
// // //                           <div
// // //                             key={
// // //                               child.id
// // //                             }
// // //                             style={{
// // //                               ...styles.subMenuItem,

// // //                               ...(activeTab ===
// // //                               child.id
// // //                                 ? styles.subMenuItemActive
// // //                                 : {}),
// // //                             }}
// // //                             onClick={(
// // //                               event
// // //                             ) => {
// // //                               event.stopPropagation();

// // //                               setActiveTab(
// // //                                 child.id
// // //                               );
// // //                             }}
// // //                           >
// // //                             <span
// // //                               style={
// // //                                 styles.subMenuDot
// // //                               }
// // //                             >
// // //                               •
// // //                             </span>

// // //                             <span
// // //                               style={
// // //                                 styles.subMenuLabel
// // //                               }
// // //                             >
// // //                               {
// // //                                 child.label
// // //                               }
// // //                             </span>
// // //                           </div>
// // //                         )
// // //                       )}
// // //                     </div>
// // //                   )}
// // //               </div>
// // //             );
// // //           })}
// // //         </nav>

// // //         {/* =================================================
// // //             LOGOUT ONLY
// // //         ================================================= */}

// // //         <div style={styles.sidebarFooter}>
// // //           <button
// // //             onClick={logout}
// // //             style={styles.logoutBtn}
// // //           >
// // //             {sidebarCollapsed
// // //               ? "↪"
// // //               : "Logout"}
// // //           </button>
// // //         </div>
// // //       </aside>

// // //       {/* =====================================================
// // //           MAIN
// // //       ===================================================== */}

// // //       <main style={styles.main}>
// // //         <header style={styles.header}>
// // //           <div>
// // //             <h1 style={styles.pageTitle}>
// // //               {getActiveLabel()}
// // //             </h1>

// // //             <p style={styles.breadcrumb}>
// // //               Vendor Panel /{" "}
// // //               {getActiveLabel()}
// // //             </p>
// // //           </div>

// // //           <div style={styles.headerRight}>
// // //             <div style={styles.avatar}>
// // //               {vendorName
// // //                 .charAt(0)
// // //                 .toUpperCase()}
// // //             </div>

// // //             <div>
// // //               <p style={styles.userName}>
// // //                 {vendorName}
// // //               </p>

// // //               <p style={styles.userRole}>
// // //                 Vendor
// // //               </p>
// // //             </div>
// // //           </div>
// // //         </header>

// // //         <div style={styles.content}>
// // //           {renderContent()}
// // //         </div>
// // //       </main>
// // //     </div>
// // //   );
// // // }

// // // /* =========================================================
// // //    DASHBOARD
// // // ========================================================= */

// // // function DashboardContent() {
// // //   return (
// // //     <div>
// // //       <div style={styles.welcomeCard}>
// // //         <h2 style={styles.welcomeTitle}>
// // //           Welcome to Vendor Dashboard
// // //         </h2>

// // //         <p style={styles.welcomeText}>
// // //           Manage your business from one
// // //           place.
// // //         </p>
// // //       </div>

// // //       <div style={styles.statsGrid}>
// // //         <StatCard
// // //           title="Bookings"
// // //           value="12"
// // //         />

// // //         <StatCard
// // //           title="Active Listings"
// // //           value="8"
// // //         />

// // //         <StatCard
// // //           title="Upcoming"
// // //           value="5"
// // //         />
// // //       </div>
// // //     </div>
// // //   );
// // // }

// // // function StatCard({
// // //   title,
// // //   value,
// // // }) {
// // //   return (
// // //     <div style={styles.statCard}>
// // //       <div>
// // //         <p style={styles.statTitle}>
// // //           {title}
// // //         </p>

// // //         <h2 style={styles.statValue}>
// // //           {value}
// // //         </h2>
// // //       </div>
// // //     </div>
// // //   );
// // // }

// // // /* =========================================================
// // //    STYLE
// // // ========================================================= */

// // // const styles = {
// // //   wrapper: {
// // //     display: "flex",

// // //     minHeight: "100vh",

// // //     background: "#f0f2f5",

// // //     fontFamily:
// // //       "'Inter', Arial, sans-serif",
// // //   },

// // //   loadingContainer: {
// // //     minHeight: "100vh",

// // //     display: "flex",

// // //     flexDirection: "column",

// // //     justifyContent: "center",

// // //     alignItems: "center",

// // //     background: "#0b1120",

// // //     color: "#ffffff",
// // //   },

// // //   spinner: {
// // //     width: "44px",

// // //     height: "44px",

// // //     border:
// // //       "4px solid rgba(255,255,255,.15)",

// // //     borderTop:
// // //       "4px solid white",

// // //     borderRadius: "50%",
// // //   },

// // //   loadingText: {
// // //     marginTop: "16px",
// // //   },

// // //   /* SIDEBAR */

// // //   sidebar: {
// // //     height: "100vh",

// // //     display: "flex",

// // //     flexDirection: "column",

// // //     flexShrink: 0,

// // //     overflow: "hidden",

// // //     background: "#0b1120",

// // //     color: "#ffffff",

// // //     transition:
// // //       "width .25s ease",

// // //     boxShadow:
// // //       "4px 0 18px rgba(0,0,0,.14)",
// // //   },

// // //   sidebarHeader: {
// // //     minHeight: "100px",

// // //     padding: "20px 18px",

// // //     display: "flex",

// // //     alignItems: "center",

// // //     justifyContent:
// // //       "space-between",

// // //     borderBottom:
// // //       "1px solid rgba(255,255,255,.07)",
// // //   },

// // //   logoContainer: {
// // //     display: "flex",

// // //     alignItems: "center",

// // //     gap: "12px",

// // //     minWidth: 0,
// // //   },

// // //   logoIcon: {
// // //     width: "48px",

// // //     height: "48px",

// // //     display: "flex",

// // //     justifyContent: "center",

// // //     alignItems: "center",

// // //     flexShrink: 0,

// // //     borderRadius: "12px",

// // //     background:
// // //       "linear-gradient(135deg,#536dfe,#8057f5)",

// // //     fontWeight: 800,

// // //     fontSize: "22px",
// // //   },

// // //   logo: {
// // //     margin: 0,

// // //     fontSize: "20px",

// // //     whiteSpace: "nowrap",
// // //   },

// // //   vendorName: {
// // //     margin: "4px 0 0",

// // //     maxWidth: "150px",

// // //     overflow: "hidden",

// // //     textOverflow:
// // //       "ellipsis",

// // //     whiteSpace: "nowrap",

// // //     color: "#9aabd0",

// // //     fontSize: "12px",
// // //   },

// // //   hamburgerBtn: {
// // //     width: "38px",

// // //     height: "38px",

// // //     border: 0,

// // //     borderRadius: "9px",

// // //     cursor: "pointer",

// // //     background:
// // //       "rgba(255,255,255,.06)",

// // //     color: "#9cabc8",

// // //     fontSize: "22px",
// // //   },

// // //   nav: {
// // //     flex: 1,

// // //     padding: "18px 12px",

// // //     overflowY: "auto",
// // //   },

// // //   menuItem: {
// // //     minHeight: "48px",

// // //     display: "flex",

// // //     justifyContent:
// // //       "space-between",

// // //     alignItems: "center",

// // //     padding: "11px 14px",

// // //     marginBottom: "5px",

// // //     borderRadius: "8px",

// // //     color: "#9aabd0",

// // //     cursor: "pointer",

// // //     fontSize: "14px",
// // //   },

// // //   menuItemActive: {
// // //     color: "#ffffff",

// // //     background:
// // //       "linear-gradient(90deg,#1b2e52,#304577)",
// // //   },

// // //   menuItemParentActive: {
// // //     color: "#ffffff",
// // //   },

// // //   menuLabel: {
// // //     overflow: "hidden",

// // //     textOverflow:
// // //       "ellipsis",

// // //     whiteSpace: "nowrap",

// // //     fontWeight: 500,
// // //   },

// // //   chevron: {
// // //     fontSize: "20px",

// // //     transition:
// // //       "transform .2s ease",
// // //   },

// // //   subMenuContainer: {
// // //     marginLeft: "15px",

// // //     marginBottom: "8px",

// // //     padding:
// // //       "4px 0 4px 13px",

// // //     borderLeft:
// // //       "1px solid rgba(255,255,255,.12)",
// // //   },

// // //   subMenuItem: {
// // //     minHeight: "38px",

// // //     display: "flex",

// // //     alignItems: "center",

// // //     gap: "7px",

// // //     padding: "8px 10px",

// // //     borderRadius: "6px",

// // //     color: "#7385ab",

// // //     cursor: "pointer",

// // //     fontSize: "12px",
// // //   },

// // //   subMenuItemActive: {
// // //     color: "#ffffff",

// // //     background:
// // //       "rgba(59,91,160,.28)",
// // //   },

// // //   subMenuDot: {
// // //     fontSize: "12px",

// // //     opacity: 0.55,
// // //   },

// // //   subMenuLabel: {
// // //     whiteSpace: "nowrap",
// // //   },

// // //   sidebarFooter: {
// // //     padding: "14px 12px",

// // //     borderTop:
// // //       "1px solid rgba(255,255,255,.08)",
// // //   },

// // //   logoutBtn: {
// // //     width: "100%",

// // //     padding: "12px",

// // //     border: 0,

// // //     borderRadius: "9px",

// // //     cursor: "pointer",

// // //     background:
// // //       "rgba(220,53,69,.15)",

// // //     color: "#ff4355",

// // //     fontWeight: 700,
// // //   },

// // //   /* MAIN */

// // //   main: {
// // //     minWidth: 0,

// // //     flex: 1,

// // //     display: "flex",

// // //     flexDirection: "column",

// // //     overflow: "hidden",
// // //   },

// // //   header: {
// // //     minHeight: "92px",

// // //     padding: "18px 30px",

// // //     display: "flex",

// // //     justifyContent:
// // //       "space-between",

// // //     alignItems: "center",

// // //     background: "#ffffff",

// // //     borderBottom:
// // //       "1px solid #e7e9ee",
// // //   },

// // //   pageTitle: {
// // //     margin: 0,

// // //     color: "#111827",

// // //     fontSize: "26px",
// // //   },

// // //   breadcrumb: {
// // //     margin: "4px 0 0",

// // //     color: "#9099aa",

// // //     fontSize: "12px",
// // //   },

// // //   headerRight: {
// // //     display: "flex",

// // //     alignItems: "center",

// // //     gap: "10px",
// // //   },

// // //   avatar: {
// // //     width: "40px",

// // //     height: "40px",

// // //     display: "flex",

// // //     alignItems: "center",

// // //     justifyContent: "center",

// // //     borderRadius: "50%",

// // //     color: "#ffffff",

// // //     background: "#192643",

// // //     fontWeight: 700,
// // //   },

// // //   userName: {
// // //     margin: 0,

// // //     fontSize: "13px",

// // //     fontWeight: 600,
// // //   },

// // //   userRole: {
// // //     margin: "2px 0 0",

// // //     fontSize: "11px",

// // //     color: "#8c96aa",
// // //   },

// // //   content: {
// // //     flex: 1,

// // //     overflowY: "auto",

// // //     padding: "28px",
// // //   },

// // //   /* DASHBOARD */

// // //   welcomeCard: {
// // //     padding: "30px",

// // //     marginBottom: "20px",

// // //     borderRadius: "14px",

// // //     color: "#ffffff",

// // //     background:
// // //       "linear-gradient(135deg,#0b1120,#1e335e)",
// // //   },

// // //   welcomeTitle: {
// // //     margin: 0,
// // //   },

// // //   welcomeText: {
// // //     margin: "8px 0 0",

// // //     opacity: 0.8,
// // //   },

// // //   statsGrid: {
// // //     display: "grid",

// // //     gridTemplateColumns:
// // //       "repeat(auto-fit,minmax(200px,1fr))",

// // //     gap: "15px",
// // //   },

// // //   statCard: {
// // //     padding: "22px",

// // //     background: "#ffffff",

// // //     borderRadius: "12px",

// // //     boxShadow:
// // //       "0 1px 5px rgba(0,0,0,.06)",
// // //   },

// // //   statTitle: {
// // //     margin: 0,

// // //     color: "#7b8498",

// // //     fontSize: "12px",
// // //   },

// // //   statValue: {
// // //     margin: "7px 0 0",

// // //     fontSize: "25px",
// // //   },
// // // };


// // import { useEffect, useMemo, useState } from "react";

// // import VendorHotels from "./VendorHotels";
// // import VendorCabs from "./VendorCabs";
// // import BusModule from "./BusModule";
// // import BusTripModule from "./BusTripModule";
// // import BusSeatLayoutModule from "./BusSeatLayoutModule";
// // import VendorBusBookings from "./VendorBusBookings";
// // import VendorCabBookings from "./VendorCabBookings";
// // import VendorHotelBookings from "./VendorHotelBookings";
// // import VendorHotelRooms from "./Vendorhotelrooms";
// // import VendorRoomInventory from "./Vendorroominventory";
// // import VendorFlights from "./VendorFlights";
// // import VendorFlightBookings from "./VendorFlightBookings";
// // import VendorApartment from "./Vendorapartment";
// // import VendorHomestay from "./VendorHomestay";
// // import Homestayunitmanager from "./Homestayunitmanager";
// // import VendorHomestayInventory from "./VendorHomestayInventory";
// // import VendorHomestayBookings from "./VendorHomestayBookings";
// // import VendorDarshan from "./VendorDarshan";
// // import VendorHoliday from "./VendorHoliday";
// // import VendorHolidayBookings from "./VendorHolidayBookings";
// // import VendorBnb from "./Bnbmanager";
// // import Palaceapp from "./Palaceapp";
// // import VendorVacationHouse from "./Vacationhouseapp";
// // import NightclubManagement from "./NightclubManagement";
// // import { BnbBooking } from "./bnbBooking/BnbBooking";
// // import VendorProfile from "./VendorProfile";

// // import "./VendorLayout.css";

// // const MENU_ICONS = {
// //   dashboard: "▦",
// //   bnb: "⌂",
// //   hotels: "▤",
// //   palace: "♛",
// //   homestays: "⌂",
// //   vacationhouses: "⌂",
// //   apartments: "▥",
// //   cabs: "◉",
// //   buses: "▣",
// //   darshans: "◇",
// //   nightclub: "♪",
// //   holidays: "✦",
// //   profile: "◯",
// // };

// // export default function VendorLayout() {
// //   const [activeTab, setActiveTab] = useState("dashboard");
// //   const [vendorName, setVendorName] = useState("");
// //   const [vendorService, setVendorService] = useState("");
// //   const [loading, setLoading] = useState(true);
// //   const [expandedMenus, setExpandedMenus] = useState({});
// //   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

// //   useEffect(() => {
// //     const token = localStorage.getItem("token");

// //     if (!token) {
// //       window.location.href = "/login";
// //       return;
// //     }

// //     try {
// //       const payload = JSON.parse(
// //         atob(
// //           token
// //             .split(".")[1]
// //             .replace(/-/g, "+")
// //             .replace(/_/g, "/")
// //         )
// //       );

// //       setVendorName(
// //         payload.name ||
// //           payload.vendorName ||
// //           payload.businessName ||
// //           payload.companyName ||
// //           payload.email ||
// //           "Vendor"
// //       );

// //       setVendorService(
// //         String(
// //           payload.service ||
// //             payload.vendorService ||
// //             payload.serviceType ||
// //             ""
// //         )
// //           .trim()
// //           .toLowerCase()
// //       );
// //     } catch (error) {
// //       console.error("TOKEN ERROR:", error);
// //       localStorage.removeItem("token");
// //       localStorage.removeItem("user");
// //       window.location.href = "/login";
// //     } finally {
// //       setLoading(false);
// //     }
// //   }, []);

// //   const logout = () => {
// //     if (window.confirm("Are you sure you want to logout?")) {
// //       localStorage.removeItem("token");
// //       localStorage.removeItem("user");
// //       window.location.href = "/";
// //     }
// //   };

// //   const menuItems = useMemo(
// //     () => [
// //       { id: "dashboard", label: "Dashboard" },

// //       {
// //         id: "bnb",
// //         label: "BnB Manager",
// //         children: [
// //           { id: "bnb_manage", label: "Manage BnB" },
// //           { id: "bnb_bookings", label: "BnB Bookings" },
// //         ],
// //       },

// //       {
// //         id: "hotels",
// //         label: "Property Information",
// //         children: [
// //           { id: "hotels_manage", label: "Manage Property" },
// //           { id: "hotel_rooms", label: "Rooms" },
// //           { id: "hotel_room_inventory", label: "Rates & Inventory" },
// //           { id: "hotels_bookings", label: "Bookings" },
// //         ],
// //       },

// //       {
// //         id: "palace",
// //         label: "Palace",
// //         children: [{ id: "palace_manage", label: "Manage Palace" }],
// //       },

// //       {
// //         id: "homestays",
// //         label: "Property Information",
// //         children: [
// //           { id: "homestays_manage", label: "Manage Homestay" },
// //           { id: "homestay_units", label: "Units / Rooms" },
// //           { id: "homestay_inventory", label: "Rates & Inventory" },
// //           { id: "homestays_bookings", label: "Bookings" },
// //         ],
// //       },

// //       {
// //         id: "vacationhouses",
// //         label: "Vacation Houses",
// //         children: [
// //           { id: "vacationhouses_manage", label: "Manage Vacation Houses" },
// //           { id: "vacationhouses_bookings", label: "Bookings" },
// //         ],
// //       },

// //       {
// //         id: "apartments",
// //         label: "Apartments",
// //         children: [{ id: "apartments_manage", label: "Manage Apartments" }],
// //       },

// //       {
// //         id: "cabs",
// //         label: "Cabs",
// //         children: [
// //           { id: "cabs_manage", label: "Manage Cabs" },
// //           { id: "cabs_bookings", label: "Cab Bookings" },
// //         ],
// //       },

// //       {
// //         id: "buses",
// //         label: "Buses",
// //         children: [
// //           { id: "buses_manage", label: "Manage Buses" },
// //           { id: "bus_trip_module", label: "Trip Management" },
// //           { id: "bus_seat_layout", label: "Seat Layout" },
// //           { id: "buses_bookings", label: "Bus Bookings" },
// //         ],
// //       },

// //       {
// //         id: "darshans",
// //         label: "Darshan",
// //         children: [{ id: "darshan_manage", label: "Manage Darshan" }],
// //       },

// //       {
// //         id: "nightclub",
// //         label: "Nightclub",
// //         children: [{ id: "nightclub_manage", label: "Manage Nightclubs" }],
// //       },

// //       {
// //         id: "holidays",
// //         label: "Holidays",
// //         children: [
// //           { id: "holidays_manage", label: "Manage Holidays" },
// //           { id: "holidays_bookings", label: "Holiday Bookings" },
// //         ],
// //       },

// //       {
// //         id: "profile",
// //         label: "More",
// //         children: [
// //           { id: "profile_personal", label: "Profile" },
// //           { id: "profile_business", label: "Business Details" },
// //           { id: "profile_contact", label: "Contact Details" },
// //           { id: "profile_tax", label: "Tax & Identity" },
// //           { id: "profile_bank", label: "Bank Details" },
// //           { id: "profile_service", label: "Service Details" },
// //         ],
// //       },
// //     ],
// //     []
// //   );

// //   const serviceMenus = {
// //     hotel: ["hotels"],
// //     hotels: ["hotels"],
// //     homestay: ["homestays"],
// //     homestays: ["homestays"],
// //     "home stay": ["homestays"],
// //     cab: ["cabs"],
// //     cabs: ["cabs"],
// //     "car-rental": ["cabs"],
// //     bus: ["buses"],
// //     buses: ["buses"],
// //     stay: ["bnb"],
// //     bnb: ["bnb"],
// //     darshan: ["darshans"],
// //     "bmt darshan": ["darshans"],
// //     vacation: ["vacationhouses"],
// //     vacationhouse: ["vacationhouses"],
// //     "vacation-home": ["vacationhouses"],
// //     apartment: ["apartments"],
// //     apartments: ["apartments"],
// //     palace: ["palace"],
// //     holiday: ["holidays"],
// //     holidays: ["holidays"],
// //     nightclub: ["nightclub"],
// //     nightclubs: ["nightclub"],
// //     "night-club": ["nightclub"],
// //   };

// //   const filteredMenus = menuItems.filter((item) => {
// //     if (item.id === "dashboard" || item.id === "profile") return true;
// //     return serviceMenus[vendorService]?.includes(item.id);
// //   });

// //   const toggleMenu = (menuId) => {
// //     setExpandedMenus((prev) => ({
// //       ...prev,
// //       [menuId]: !prev[menuId],
// //     }));
// //   };

// //   const handleMenuClick = (item) => {
// //     if (item.children) {
// //       toggleMenu(item.id);
// //       if (!expandedMenus[item.id]) {
// //         setActiveTab(item.children[0].id);
// //       }
// //     } else {
// //       setActiveTab(item.id);
// //     }
// //   };

// //   useEffect(() => {
// //     menuItems.forEach((item) => {
// //       if (!item.children) return;
// //       const isChildActive = item.children.some((child) => child.id === activeTab);
// //       if (isChildActive) {
// //         setExpandedMenus((prev) => ({ ...prev, [item.id]: true }));
// //       }
// //     });
// //   }, [activeTab, menuItems]);

// //   const getActiveLabel = () => {
// //     for (const item of menuItems) {
// //       if (item.id === activeTab) return item.label;
// //       const child = item.children?.find((c) => c.id === activeTab);
// //       if (child) return child.label;
// //     }
// //     return "Dashboard";
// //   };

// //   const renderContent = () => {
// //     switch (activeTab) {
// //       case "dashboard":
// //         return (
// //           <DashboardContent
// //             vendorName={vendorName}
// //             vendorService={vendorService}
// //             onNavigate={setActiveTab}
// //           />
// //         );

// //       case "profile_personal":
// //         return <VendorProfile initialSection="personal" />;
// //       case "profile_business":
// //         return <VendorProfile initialSection="business" />;
// //       case "profile_contact":
// //         return <VendorProfile initialSection="contact" />;
// //       case "profile_tax":
// //         return <VendorProfile initialSection="tax" />;
// //       case "profile_bank":
// //         return <VendorProfile initialSection="bank" />;
// //       case "profile_service":
// //         return <VendorProfile initialSection="service" />;

// //       case "bnb_manage":
// //         return <VendorBnb />;
// //       case "bnb_bookings":
// //         return <BnbBooking />;

// //       case "hotels_manage":
// //         return <VendorHotels />;
// //       case "hotel_rooms":
// //         return <VendorHotelRooms />;
// //       case "hotel_room_inventory":
// //         return <VendorRoomInventory />;
// //       case "hotels_bookings":
// //         return <VendorHotelBookings />;

// //       case "homestays_manage":
// //         return <VendorHomestay />;
// //       case "homestay_units":
// //         return <Homestayunitmanager />;
// //       case "homestay_inventory":
// //         return <VendorHomestayInventory />;
// //       case "homestays_bookings":
// //         return <VendorHomestayBookings />;

// //       case "apartments_manage":
// //         return <VendorApartment />;

// //       case "cabs_manage":
// //         return <VendorCabs />;
// //       case "cabs_bookings":
// //         return <VendorCabBookings />;

// //       case "buses_manage":
// //         return <BusModule />;
// //       case "bus_trip_module":
// //         return <BusTripModule />;
// //       case "bus_seat_layout":
// //         return <BusSeatLayoutModule />;
// //       case "buses_bookings":
// //         return <VendorBusBookings />;

// //       case "nightclub_manage":
// //         return <NightclubManagement />;

// //       case "vacationhouses_manage":
// //         return <VendorVacationHouse />;
// //       case "vacationhouses_bookings":
// //         return <h2>Vacation House Bookings</h2>;

// //       case "flights_manage":
// //         return <VendorFlights />;
// //       case "flights_bookings":
// //         return <VendorFlightBookings />;

// //       case "darshan_manage":
// //         return <VendorDarshan />;

// //       case "holidays_manage":
// //         return <VendorHoliday />;
// //       case "holidays_bookings":
// //         return <VendorHolidayBookings />;

// //       case "palace_manage":
// //         return <Palaceapp />;

// //       default:
// //         return (
// //           <DashboardContent
// //             vendorName={vendorName}
// //             vendorService={vendorService}
// //             onNavigate={setActiveTab}
// //           />
// //         );
// //     }
// //   };

// //   const propertyTypeLabel =
// //     vendorService === "homestay" || vendorService === "homestays"
// //       ? "Homestay"
// //       : vendorService === "hotel" || vendorService === "hotels"
// //       ? "Hotel"
// //       : vendorService
// //       ? vendorService.charAt(0).toUpperCase() + vendorService.slice(1)
// //       : "Property";

// //   if (loading) {
// //     return (
// //       <div className="bmt-loader">
// //         <div className="bmt-loader-ring" />
// //         <p>Loading BirdMyTrip Partner Panel...</p>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="bmt-extranet">
// //       <aside className={`bmt-sidebar ${sidebarCollapsed ? "is-collapsed" : ""}`}>
// //         <div className="bmt-sidebar-top">
// //           <button
// //             className="bmt-menu-button"
// //             onClick={() => setSidebarCollapsed((v) => !v)}
// //             aria-label="Toggle menu"
// //           >
// //             <span />
// //             <span />
// //             <span />
// //           </button>

// //           {!sidebarCollapsed && <span className="bmt-menu-text">Menu</span>}
// //         </div>

// //         <div className="bmt-hide-strip">
// //           {!sidebarCollapsed ? (
// //             <button onClick={() => setSidebarCollapsed(true)}>‹‹ &nbsp; Hide</button>
// //           ) : (
// //             <button onClick={() => setSidebarCollapsed(false)}>››</button>
// //           )}
// //         </div>

// //         <nav className="bmt-nav">
// //           {filteredMenus.map((item) => {
// //             const childActive = item.children?.some((c) => c.id === activeTab);
// //             const active = activeTab === item.id || childActive;

// //             return (
// //               <div className="bmt-nav-group" key={item.id}>
// //                 <button
// //                   className={`bmt-nav-item ${active ? "active" : ""}`}
// //                   onClick={() => handleMenuClick(item)}
// //                   title={sidebarCollapsed ? item.label : undefined}
// //                 >
// //                   <span className="bmt-nav-icon">{MENU_ICONS[item.id] || "•"}</span>
// //                   {!sidebarCollapsed && (
// //                     <>
// //                       <span className="bmt-nav-label">{item.label}</span>
// //                       {item.children && (
// //                         <span className={`bmt-nav-arrow ${expandedMenus[item.id] ? "open" : ""}`}>
// //                           ›
// //                         </span>
// //                       )}
// //                     </>
// //                   )}
// //                 </button>

// //                 {!sidebarCollapsed &&
// //                   item.children &&
// //                   expandedMenus[item.id] && (
// //                     <div className="bmt-subnav">
// //                       {item.children.map((child) => (
// //                         <button
// //                           key={child.id}
// //                           className={`bmt-subnav-item ${
// //                             activeTab === child.id ? "active" : ""
// //                           }`}
// //                           onClick={() => setActiveTab(child.id)}
// //                         >
// //                           {child.label}
// //                         </button>
// //                       ))}
// //                     </div>
// //                   )}
// //               </div>
// //             );
// //           })}
// //         </nav>

// //         <div className="bmt-sidebar-footer">
// //           <button onClick={logout} className="bmt-logout-btn">
// //             {sidebarCollapsed ? "↪" : "Logout"}
// //           </button>
// //         </div>
// //       </aside>

// //       <div className="bmt-shell">
// //         <header className="bmt-topbar">
// //           <div className="bmt-property-block">
// //             <div className="bmt-brand-badge">
// //               <span>b</span>
// //               <small>mt</small>
// //             </div>
// //             <div className="bmt-property-copy">
// //               <div className="bmt-property-name-row">
// //                 <strong>{vendorName || "BirdMyTrip Partner"}</strong>
// //                 <span className="bmt-chevron">⌄</span>
// //               </div>
// //               <p>{propertyTypeLabel} | BirdMyTrip Partner</p>
// //             </div>
// //           </div>

// //           <div className="bmt-topbar-actions">
// //             <button className="bmt-help-btn">?</button>
// //             <div className="bmt-user-pill">
// //               <div className="bmt-user-avatar">
// //                 {(vendorName || "V").charAt(0).toUpperCase()}
// //               </div>
// //               <div>
// //                 <strong>{vendorName || "Vendor"}</strong>
// //                 <span>Partner</span>
// //               </div>
// //             </div>
// //           </div>
// //         </header>

// //         <main className="bmt-main">
// //           {activeTab !== "dashboard" && (
// //             <div className="bmt-page-heading">
// //               <h1>{getActiveLabel()}</h1>
// //               <p>BirdMyTrip Partner Panel / {getActiveLabel()}</p>
// //             </div>
// //           )}

// //           <div className="bmt-content">{renderContent()}</div>
// //         </main>
// //       </div>
// //     </div>
// //   );
// // }

// // function DashboardContent({ vendorName, vendorService, onNavigate }) {
// //   const isStay =
// //     ["hotel", "hotels", "homestay", "homestays", "home stay", "stay", "bnb"].includes(
// //       vendorService
// //     );

// //   const bookingTarget =
// //     vendorService === "hotel" || vendorService === "hotels"
// //       ? "hotels_bookings"
// //       : vendorService === "homestay" || vendorService === "homestays"
// //       ? "homestays_bookings"
// //       : vendorService === "bus" || vendorService === "buses"
// //       ? "buses_bookings"
// //       : vendorService === "cab" || vendorService === "cabs" || vendorService === "car-rental"
// //       ? "cabs_bookings"
// //       : vendorService === "holiday" || vendorService === "holidays"
// //       ? "holidays_bookings"
// //       : "dashboard";

// //   const inventoryTarget =
// //     vendorService === "hotel" || vendorService === "hotels"
// //       ? "hotel_room_inventory"
// //       : vendorService === "homestay" || vendorService === "homestays"
// //       ? "homestay_inventory"
// //       : vendorService === "bus" || vendorService === "buses"
// //       ? "buses_manage"
// //       : vendorService === "cab" || vendorService === "cabs" || vendorService === "car-rental"
// //       ? "cabs_manage"
// //       : "dashboard";

// //   const metrics = isStay
// //     ? [
// //         { title: "Today's Room Nights", value: "0", sub: "FOR LAST 7 DAYS : 3 ROOM NIGHTS", action: bookingTarget },
// //         { title: "Today's Revenue", value: "₹ 0", sub: "FOR LAST 7 DAYS : ₹ 3,239", action: bookingTarget },
// //         { title: "Today's Average Selling Price", value: "₹ 0", sub: "FOR LAST 7 DAYS : ₹ 1,371", action: inventoryTarget },
// //         { title: "Today's Check-ins", value: "0", sub: "FOR LAST 7 DAYS : 3 CHECK-INS", action: bookingTarget },
// //       ]
// //     : [
// //         { title: "Today's Bookings", value: "0", sub: "FOR LAST 7 DAYS : 12 BOOKINGS", action: bookingTarget },
// //         { title: "Today's Revenue", value: "₹ 0", sub: "FOR LAST 7 DAYS : ₹ 8,920", action: bookingTarget },
// //         { title: "Active Listings", value: "8", sub: "CURRENTLY LIVE ON BIRDMYTRIP", action: inventoryTarget },
// //         { title: "Upcoming Operations", value: "5", sub: "NEXT 7 DAYS", action: bookingTarget },
// //       ];

// //   return (
// //     <div className="bmt-dashboard">
// //       <section className="bmt-performance-head">
// //         <div>
// //           <div className="bmt-title-line">
// //             <h1>Performance Overview</h1>
// //             <span className="bmt-info-icon">?</span>
// //           </div>
// //           <p>Last updated just now</p>
// //         </div>
// //       </section>

// //       <section className="bmt-analytics-banner">
// //         <div>
// //           <h2>{isStay ? "Property Analytics" : "Business Analytics"}</h2>
// //           <p>
// //             See detailed analysis and past data for your{" "}
// //             {isStay ? "property's Revenue, Room Nights, Average Selling Price, Conversion" : "business performance, revenue, bookings and conversion"}.
// //           </p>
// //         </div>
// //         <button>View All</button>
// //       </section>

// //       <section className="bmt-metrics-grid">
// //         {metrics.map((metric) => (
// //           <article className="bmt-metric-card" key={metric.title}>
// //             <h3>{metric.title}</h3>
// //             <div className="bmt-metric-value">{metric.value}</div>
// //             <p>{metric.sub}</p>
// //             <button onClick={() => onNavigate(metric.action)}>View More</button>
// //           </article>
// //         ))}
// //       </section>

// //       <section className="bmt-dashboard-bottom-grid">
// //         <article className="bmt-panel-card">
// //           <div className="bmt-card-header">
// //             <div>
// //               <h3>Grow Your Business</h3>
// //               <p>Recommended actions for {vendorName || "your account"}</p>
// //             </div>
// //             <span className="bmt-new-badge">NEW</span>
// //           </div>

// //           <div className="bmt-action-list">
// //             <button onClick={() => onNavigate(inventoryTarget)}>
// //               <span>Improve rates & availability</span>
// //               <b>›</b>
// //             </button>
// //             <button onClick={() => onNavigate(bookingTarget)}>
// //               <span>Review upcoming bookings</span>
// //               <b>›</b>
// //             </button>
// //             <button onClick={() => onNavigate("profile_business")}>
// //               <span>Complete property information</span>
// //               <b>›</b>
// //             </button>
// //           </div>
// //         </article>

// //         <article className="bmt-panel-card">
// //           <div className="bmt-card-header">
// //             <div>
// //               <h3>Today's Snapshot</h3>
// //               <p>Quick operational summary</p>
// //             </div>
// //           </div>

// //           <div className="bmt-snapshot-grid">
// //             <div><strong>0</strong><span>Pending</span></div>
// //             <div><strong>0</strong><span>Confirmed</span></div>
// //             <div><strong>0</strong><span>Cancelled</span></div>
// //             <div><strong>0</strong><span>Completed</span></div>
// //           </div>
// //         </article>
// //       </section>
// //     </div>
// //   );
// // }

// import { useEffect, useMemo, useState } from "react";

// import VendorHotels from "./VendorHotels";
// import VendorCabs from "./VendorCabs";
// import BusModule from "./BusModule";
// import BusTripModule from "./BusTripModule";
// import BusSeatLayoutModule from "./BusSeatLayoutModule";
// import VendorBusBookings from "./VendorBusBookings";
// import VendorCabBookings from "./VendorCabBookings";
// import VendorHotelBookings from "./VendorHotelBookings";
// import VendorHotelRooms from "./Vendorhotelrooms";
// import VendorRoomInventory from "./Vendorroominventory";
// import VendorFlights from "./VendorFlights";
// import VendorFlightBookings from "./VendorFlightBookings";
// import VendorApartment from "./Vendorapartment";
// import VendorHomestay from "./VendorHomestay";
// import Homestayunitmanager from "./Homestayunitmanager";
// import VendorHomestayInventory from "./VendorHomestayInventory";
// import VendorHomestayBookings from "./VendorHomestayBookings";
// import VendorDarshan from "./VendorDarshan";
// import VendorHoliday from "./VendorHoliday";
// import VendorHolidayBookings from "./VendorHolidayBookings";
// import VendorBnb from "./Bnbmanager";
// import Palaceapp from "./Palaceapp";
// import VendorVacationHouse from "./Vacationhouseapp";
// import NightclubManagement from "./NightclubManagement";
// import { BnbBooking } from "./bnbBooking/BnbBooking";
// import VendorProfile from "./VendorProfile";

// import "./VendorLayout.css";

// const ICONS = {
//   dashboard: "▦",
//   bookings: "▤",
//   inventory: "▥",
//   grow: "✦",
//   payments: "◈",
//   sponsored: "AD",
//   property: "⌂",
//   reviews: "☆",
//   analytics: "⌁",
//   more: "⋯",
//   buses: "▣",
//   cabs: "◉",
//   holidays: "✦",
//   darshan: "◇",
//   nightclub: "♪",
//   bnb: "⌂",
//   apartments: "▥",
//   palace: "♛",
//   vacationhouses: "⌂",
// };

// export default function VendorLayout() {
//   const [activeTab, setActiveTab] = useState("dashboard");
//   const [vendorName, setVendorName] = useState("");
//   const [vendorService, setVendorService] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [expandedMenus, setExpandedMenus] = useState({});
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (!token) {
//       window.location.href = "/login";
//       return;
//     }

//     try {
//       const payload = JSON.parse(
//         atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
//       );

//       setVendorName(
//         payload.name ||
//           payload.vendorName ||
//           payload.businessName ||
//           payload.companyName ||
//           payload.email ||
//           "Vendor"
//       );

//       setVendorService(
//         String(payload.service || payload.vendorService || payload.serviceType || "")
//           .trim()
//           .toLowerCase()
//       );
//     } catch (error) {
//       console.error("TOKEN ERROR:", error);
//       localStorage.removeItem("token");
//       localStorage.removeItem("user");
//       window.location.href = "/login";
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   const isHotel = ["hotel", "hotels"].includes(vendorService);
//   const isHomestay = ["homestay", "homestays", "home stay"].includes(vendorService);

//   const logout = () => {
//     if (window.confirm("Are you sure you want to logout?")) {
//       localStorage.removeItem("token");
//       localStorage.removeItem("user");
//       window.location.href = "/";
//     }
//   };

//   const menuItems = useMemo(() => {
//     if (isHotel) {
//       return [
//         { id: "dashboard", label: "Dashboard", icon: "dashboard" },
//         { id: "hotels_bookings", label: "Bookings", icon: "bookings" },
//         { id: "hotel_room_inventory", label: "Rates & Inventory", icon: "inventory" },
//         {
//           id: "grow_business",
//           label: "Grow Your Business",
//           icon: "grow",
//           badge: "NEW",
//           children: [
//             { id: "promotions", label: "Promotions & Offers" },
//             { id: "visibility_boost", label: "Visibility Booster" },
//             { id: "campaigns", label: "Campaigns" },
//           ],
//         },
//         { id: "payments", label: "Payments", icon: "payments" },
//         { id: "sponsored", label: "Sponsored Listing", icon: "sponsored" },
//         {
//           id: "hotels",
//           label: "Property Information",
//           icon: "property",
//           badge: "NEW",
//           children: [
//             { id: "hotels_manage", label: "Property Details" },
//             { id: "hotel_rooms", label: "Rooms & Units" },
//             { id: "property_media", label: "Images & Videos" },
//             { id: "property_amenities", label: "Amenities & Facilities" },
//             { id: "property_location", label: "Location & Contact" },
//             { id: "property_policies", label: "Policies & House Rules" },
//             { id: "property_documents", label: "Documents & Verification" },
//             { id: "property_highlights", label: "Highlights & USPs" },
//           ],
//         },
//         { id: "ratings_reviews", label: "Ratings & Reviews", icon: "reviews" },
//         { id: "analytics", label: "Analytics", icon: "analytics", badge: "NEW" },
//         {
//           id: "profile",
//           label: "More",
//           icon: "more",
//           children: [
//             { id: "profile_personal", label: "My Profile" },
//             { id: "profile_business", label: "Business Details" },
//             { id: "profile_contact", label: "Contact Details" },
//             { id: "profile_tax", label: "Tax & Identity" },
//             { id: "profile_bank", label: "Bank Details" },
//             { id: "profile_service", label: "Service Details" },
//           ],
//         },
//       ];
//     }

//     if (isHomestay) {
//       return [
//         { id: "dashboard", label: "Dashboard", icon: "dashboard" },
//         { id: "homestays_bookings", label: "Bookings", icon: "bookings" },
//         { id: "homestay_inventory", label: "Rates & Inventory", icon: "inventory" },
//         {
//           id: "homestays",
//           label: "Property Information",
//           icon: "property",
//           children: [
//             { id: "homestays_manage", label: "Property Details" },
//             { id: "homestay_units", label: "Units / Rooms" },
//             { id: "property_media", label: "Images & Videos" },
//             { id: "property_amenities", label: "Amenities & Facilities" },
//             { id: "property_location", label: "Location & Contact" },
//             { id: "property_policies", label: "Policies & House Rules" },
//             { id: "property_documents", label: "Documents & Verification" },
//             { id: "property_highlights", label: "Highlights & USPs" },
//           ],
//         },
//         { id: "ratings_reviews", label: "Ratings & Reviews", icon: "reviews" },
//         { id: "analytics", label: "Analytics", icon: "analytics", badge: "NEW" },
//         {
//           id: "profile",
//           label: "More",
//           icon: "more",
//           children: [
//             { id: "profile_personal", label: "My Profile" },
//             { id: "profile_business", label: "Business Details" },
//             { id: "profile_contact", label: "Contact Details" },
//             { id: "profile_tax", label: "Tax & Identity" },
//             { id: "profile_bank", label: "Bank Details" },
//             { id: "profile_service", label: "Service Details" },
//           ],
//         },
//       ];
//     }

//     return [
//       { id: "dashboard", label: "Dashboard", icon: "dashboard" },
//       { id: "bnb", label: "BnB Manager", icon: "bnb", children: [
//         { id: "bnb_manage", label: "Manage BnB" },
//         { id: "bnb_bookings", label: "BnB Bookings" },
//       ] },
//       { id: "palace", label: "Palace", icon: "palace", children: [
//         { id: "palace_manage", label: "Manage Palace" },
//       ] },
//       { id: "vacationhouses", label: "Vacation Houses", icon: "vacationhouses", children: [
//         { id: "vacationhouses_manage", label: "Manage Vacation Houses" },
//         { id: "vacationhouses_bookings", label: "Bookings" },
//       ] },
//       { id: "apartments", label: "Apartments", icon: "apartments", children: [
//         { id: "apartments_manage", label: "Manage Apartments" },
//       ] },
//       { id: "cabs", label: "Cabs", icon: "cabs", children: [
//         { id: "cabs_manage", label: "Manage Cabs" },
//         { id: "cabs_bookings", label: "Cab Bookings" },
//       ] },
//       { id: "buses", label: "Buses", icon: "buses", children: [
//         { id: "buses_manage", label: "Manage Buses" },
//         { id: "bus_trip_module", label: "Trip Management" },
//         { id: "bus_seat_layout", label: "Seat Layout" },
//         { id: "buses_bookings", label: "Bus Bookings" },
//       ] },
//       { id: "darshans", label: "Darshan", icon: "darshan", children: [
//         { id: "darshan_manage", label: "Manage Darshan" },
//       ] },
//       { id: "nightclub", label: "Nightclub", icon: "nightclub", children: [
//         { id: "nightclub_manage", label: "Manage Nightclubs" },
//       ] },
//       { id: "holidays", label: "Holidays", icon: "holidays", children: [
//         { id: "holidays_manage", label: "Manage Holidays" },
//         { id: "holidays_bookings", label: "Holiday Bookings" },
//       ] },
//       { id: "profile", label: "More", icon: "more", children: [
//         { id: "profile_personal", label: "My Profile" },
//         { id: "profile_business", label: "Business Details" },
//         { id: "profile_contact", label: "Contact Details" },
//         { id: "profile_tax", label: "Tax & Identity" },
//         { id: "profile_bank", label: "Bank Details" },
//         { id: "profile_service", label: "Service Details" },
//       ] },
//     ];
//   }, [isHotel, isHomestay]);

//   const serviceMenus = {
//     cab: ["cabs"], cabs: ["cabs"], "car-rental": ["cabs"],
//     bus: ["buses"], buses: ["buses"],
//     stay: ["bnb"], bnb: ["bnb"],
//     darshan: ["darshans"], "bmt darshan": ["darshans"],
//     vacation: ["vacationhouses"], vacationhouse: ["vacationhouses"], "vacation-home": ["vacationhouses"],
//     apartment: ["apartments"], apartments: ["apartments"],
//     palace: ["palace"],
//     holiday: ["holidays"], holidays: ["holidays"],
//     nightclub: ["nightclub"], nightclubs: ["nightclub"], "night-club": ["nightclub"],
//   };

//   const filteredMenus = isHotel || isHomestay
//     ? menuItems
//     : menuItems.filter((item) => {
//         if (item.id === "dashboard" || item.id === "profile") return true;
//         return serviceMenus[vendorService]?.includes(item.id);
//       });

//   const toggleMenu = (menuId) => {
//     setExpandedMenus((prev) => ({ ...prev, [menuId]: !prev[menuId] }));
//   };

//   const handleMenuClick = (item) => {
//     if (item.children) {
//       toggleMenu(item.id);
//       if (!expandedMenus[item.id]) setActiveTab(item.children[0].id);
//       return;
//     }
//     setActiveTab(item.id);
//   };

//   useEffect(() => {
//     menuItems.forEach((item) => {
//       if (!item.children) return;
//       if (item.children.some((child) => child.id === activeTab)) {
//         setExpandedMenus((prev) => ({ ...prev, [item.id]: true }));
//       }
//     });
//   }, [activeTab, menuItems]);

//   const getActiveLabel = () => {
//     for (const item of menuItems) {
//       if (item.id === activeTab) return item.label;
//       const child = item.children?.find((c) => c.id === activeTab);
//       if (child) return child.label;
//     }
//     return "Dashboard";
//   };

//   const renderContent = () => {
//     switch (activeTab) {
//       case "dashboard": return <DashboardContent vendorService={vendorService} onNavigate={setActiveTab} />;
//       case "hotels_manage": return <VendorHotels />;
//       case "hotel_rooms": return <VendorHotelRooms />;
//       case "hotel_room_inventory": return <VendorRoomInventory />;
//       case "hotels_bookings": return <VendorHotelBookings />;
//       case "homestays_manage": return <VendorHomestay />;
//       case "homestay_units": return <Homestayunitmanager />;
//       case "homestay_inventory": return <VendorHomestayInventory />;
//       case "homestays_bookings": return <VendorHomestayBookings />;
//       case "property_media": return <PropertyMedia />;
//       case "property_amenities": return <PropertyAmenities />;
//       case "property_location": return <PropertyLocation />;
//       case "property_policies": return <PropertyPolicies />;
//       case "property_documents": return <PropertyDocuments />;
//       case "property_highlights": return <PropertyHighlights />;
//       case "promotions": return <SimplePremiumPage title="Promotions & Offers" description="Create property discounts, mobile offers, early-bird offers and limited-time deals." />;
//       case "visibility_boost": return <SimplePremiumPage title="Visibility Booster" description="Improve property visibility with sponsored placement and performance campaigns." />;
//       case "campaigns": return <SimplePremiumPage title="Campaigns" description="Manage seasonal campaigns and marketing participation." />;
//       case "payments": return <SimplePremiumPage title="Payments" description="View settlements, payment status, deductions and payout history." />;
//       case "sponsored": return <SimplePremiumPage title="Sponsored Listing" description="Boost your property ranking through paid sponsored placement." />;
//       case "ratings_reviews": return <SimplePremiumPage title="Ratings & Reviews" description="Track guest ratings, review reasons and respond to guest feedback." />;
//       case "analytics": return <AnalyticsPage />;
//       case "profile_personal": return <VendorProfile initialSection="personal" />;
//       case "profile_business": return <VendorProfile initialSection="business" />;
//       case "profile_contact": return <VendorProfile initialSection="contact" />;
//       case "profile_tax": return <VendorProfile initialSection="tax" />;
//       case "profile_bank": return <VendorProfile initialSection="bank" />;
//       case "profile_service": return <VendorProfile initialSection="service" />;
//       case "bnb_manage": return <VendorBnb />;
//       case "bnb_bookings": return <BnbBooking />;
//       case "apartments_manage": return <VendorApartment />;
//       case "cabs_manage": return <VendorCabs />;
//       case "cabs_bookings": return <VendorCabBookings />;
//       case "buses_manage": return <BusModule />;
//       case "bus_trip_module": return <BusTripModule />;
//       case "bus_seat_layout": return <BusSeatLayoutModule />;
//       case "buses_bookings": return <VendorBusBookings />;
//       case "nightclub_manage": return <NightclubManagement />;
//       case "vacationhouses_manage": return <VendorVacationHouse />;
//       case "vacationhouses_bookings": return <SimplePremiumPage title="Vacation House Bookings" description="Manage upcoming, completed and cancelled reservations." />;
//       case "flights_manage": return <VendorFlights />;
//       case "flights_bookings": return <VendorFlightBookings />;
//       case "darshan_manage": return <VendorDarshan />;
//       case "holidays_manage": return <VendorHoliday />;
//       case "holidays_bookings": return <VendorHolidayBookings />;
//       case "palace_manage": return <Palaceapp />;
//       default: return <DashboardContent vendorService={vendorService} onNavigate={setActiveTab} />;
//     }
//   };

//   const propertyTypeLabel = isHotel ? "Hotel" : isHomestay ? "Homestay" : vendorService ? vendorService.charAt(0).toUpperCase() + vendorService.slice(1) : "Partner";

//   if (loading) {
//     return <div className="bmt-loader"><div className="bmt-loader-ring" /><p>Loading BirdMyTrip Partner Panel...</p></div>;
//   }

//   return (
//     <div className="bmt-extranet">
//       <aside className={`bmt-sidebar ${sidebarCollapsed ? "is-collapsed" : ""}`}>
//         <div className="bmt-sidebar-top">
//           <button className="bmt-menu-button" onClick={() => setSidebarCollapsed((v) => !v)} aria-label="Toggle menu"><span /><span /><span /></button>
//           {!sidebarCollapsed && <span className="bmt-menu-text">Menu</span>}
//         </div>

//         <div className="bmt-hide-strip"><button onClick={() => setSidebarCollapsed((v) => !v)}>{sidebarCollapsed ? "›" : "‹  Hide"}</button></div>

//         <nav className="bmt-nav">
//           {filteredMenus.map((item) => {
//             const childActive = item.children?.some((c) => c.id === activeTab);
//             const active = activeTab === item.id || childActive;
//             return (
//               <div className="bmt-nav-group" key={item.id}>
//                 <button className={`bmt-nav-item ${active ? "active" : ""}`} onClick={() => handleMenuClick(item)} title={sidebarCollapsed ? item.label : undefined}>
//                   <span className="bmt-nav-icon">{ICONS[item.icon] || "•"}</span>
//                   {!sidebarCollapsed && <>
//                     <span className="bmt-nav-label">{item.label}</span>
//                     {item.badge && <span className="bmt-menu-badge">{item.badge}</span>}
//                     {item.children && <span className={`bmt-nav-arrow ${expandedMenus[item.id] ? "open" : ""}`}>›</span>}
//                   </>}
//                 </button>

//                 {!sidebarCollapsed && item.children && expandedMenus[item.id] && (
//                   <div className="bmt-subnav">
//                     {item.children.map((child) => (
//                       <button key={child.id} className={`bmt-subnav-item ${activeTab === child.id ? "active" : ""}`} onClick={() => setActiveTab(child.id)}>{child.label}</button>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </nav>

//         <div className="bmt-sidebar-footer"><button onClick={logout} className="bmt-logout-btn">{sidebarCollapsed ? "↪" : "Logout"}</button></div>
//       </aside>

//       <div className="bmt-shell">
//         <header className="bmt-topbar">
//           <div className="bmt-property-block">
//             <div className="bmt-brand-badge">bmt</div>
//             <div className="bmt-property-copy">
//               <div className="bmt-property-name-row"><strong>{vendorName || "BirdMyTrip Partner"}</strong><span className="bmt-chevron">⌄</span></div>
//               <p>{propertyTypeLabel} | BirdMyTrip Partner</p>
//             </div>
//           </div>

//           <div className="bmt-topbar-actions">
//             <button className="bmt-round-action">?</button>
//             <button className="bmt-user-pill" onClick={() => setActiveTab("profile_personal")}>
//               <span className="bmt-user-avatar">{(vendorName || "V").charAt(0).toUpperCase()}</span>
//               <span className="bmt-user-copy"><strong>{vendorName || "Vendor"}</strong><small>Partner</small></span>
//             </button>
//           </div>
//         </header>

//         <main className="bmt-main">
//           {activeTab !== "dashboard" && <div className="bmt-page-heading"><h1>{getActiveLabel()}</h1><p>BirdMyTrip Partner Panel / {getActiveLabel()}</p></div>}
//           <div className="bmt-content">{renderContent()}</div>
//         </main>
//       </div>
//     </div>
//   );
// }

// function DashboardContent({ vendorService, onNavigate }) {
//   const isStay = ["hotel","hotels","homestay","homestays","home stay","stay","bnb"].includes(vendorService);
//   const bookingTarget = ["hotel","hotels"].includes(vendorService) ? "hotels_bookings" : ["homestay","homestays"].includes(vendorService) ? "homestays_bookings" : ["bus","buses"].includes(vendorService) ? "buses_bookings" : ["cab","cabs"].includes(vendorService) ? "cabs_bookings" : "dashboard";
//   const inventoryTarget = ["hotel","hotels"].includes(vendorService) ? "hotel_room_inventory" : ["homestay","homestays"].includes(vendorService) ? "homestay_inventory" : "dashboard";

//   const metrics = isStay ? [
//     { title: "Today's Room Nights", value: "0", sub: "FOR LAST 7 DAYS : 3 ROOM NIGHTS", action: bookingTarget },
//     { title: "Today's Revenue", value: "₹ 0", sub: "FOR LAST 7 DAYS : ₹ 3,239", action: bookingTarget },
//     { title: "Today's Average Selling Price", value: "₹ 0", sub: "FOR LAST 7 DAYS : ₹ 1,371", action: inventoryTarget },
//     { title: "Today's Check-ins", value: "0", sub: "FOR LAST 7 DAYS : 3 CHECK-INS", action: bookingTarget },
//   ] : [
//     { title: "Today's Bookings", value: "0", sub: "FOR LAST 7 DAYS : 12 BOOKINGS", action: bookingTarget },
//     { title: "Today's Revenue", value: "₹ 0", sub: "FOR LAST 7 DAYS : ₹ 8,920", action: bookingTarget },
//     { title: "Active Listings", value: "8", sub: "CURRENTLY LIVE ON BIRDMYTRIP", action: inventoryTarget },
//     { title: "Upcoming Operations", value: "5", sub: "NEXT 7 DAYS", action: bookingTarget },
//   ];

//   return (
//     <div className="bmt-dashboard">
//       <section className="bmt-performance-head"><div><div className="bmt-title-line"><h1>Performance Overview</h1><span className="bmt-info-icon">?</span></div><p>Last updated just now</p></div></section>
//       <section className="bmt-analytics-banner"><div><h2>{isStay ? "Property Analytics" : "Business Analytics"}</h2><p>See detailed analysis and past data for Revenue, Room Nights, Average Selling Price, Conversion, Bookings and more.</p></div><button onClick={() => onNavigate("analytics")}>View All</button></section>
//       <section className="bmt-metrics-grid">{metrics.map((metric) => <article className="bmt-metric-card" key={metric.title}><h3>{metric.title}</h3><div className="bmt-metric-value">{metric.value}</div><p>{metric.sub}</p><button onClick={() => onNavigate(metric.action)}>View More</button></article>)}</section>
//       {isStay && <section className="bmt-dashboard-bottom-grid"><article className="bmt-panel-card"><div className="bmt-card-header"><div><h3>Property Setup</h3><p>Complete important property content</p></div><span className="bmt-new-badge">NEW</span></div><div className="bmt-action-list"><button onClick={() => onNavigate("property_media")}><span>Add Images & Videos</span><b>›</b></button><button onClick={() => onNavigate("property_amenities")}><span>Update Amenities & Facilities</span><b>›</b></button><button onClick={() => onNavigate("property_policies")}><span>Review Property Policies</span><b>›</b></button></div></article><article className="bmt-panel-card"><div className="bmt-card-header"><div><h3>Today's Snapshot</h3><p>Quick operational summary</p></div></div><div className="bmt-snapshot-grid"><div><strong>0</strong><span>Pending</span></div><div><strong>0</strong><span>Confirmed</span></div><div><strong>0</strong><span>Cancelled</span></div><div><strong>0</strong><span>Completed</span></div></div></article></section>}
//     </div>
//   );
// }

// function PropertyMedia() {
//   const [images, setImages] = useState([]);
//   const [videos, setVideos] = useState([]);
//   const [videoUrl, setVideoUrl] = useState("");
//   const handleImages = (event) => setImages((prev) => [...prev, ...Array.from(event.target.files || []).map((file) => ({ file, url: URL.createObjectURL(file), name: file.name }))]);
//   const handleVideos = (event) => setVideos((prev) => [...prev, ...Array.from(event.target.files || []).map((file) => ({ file, url: URL.createObjectURL(file), name: file.name }))]);
//   return <div className="bmt-premium-page"><div className="bmt-section-intro"><div><span className="bmt-eyebrow">PROPERTY CONTENT</span><h2>Images & Videos</h2><p>Add high-quality property photos, room photos, exterior images, facilities, dining images and walkthrough videos.</p></div><span className="bmt-completion-pill">Media completeness 0%</span></div><div className="bmt-property-grid"><section className="bmt-form-card"><div className="bmt-form-card-head"><div><h3>Property Images</h3><p>Recommended: minimum 8 clear landscape photos.</p></div></div><label className="bmt-upload-zone"><input type="file" accept="image/*" multiple onChange={handleImages} /><span className="bmt-upload-icon">＋</span><strong>Upload property images</strong><small>JPG, PNG, WEBP • Front view, rooms, lobby, washroom, dining and facilities</small></label>{images.length > 0 && <div className="bmt-media-grid">{images.map((image, index) => <div className="bmt-media-item" key={`${image.name}-${index}`}><img src={image.url} alt={image.name} /><button onClick={() => setImages((prev) => prev.filter((_, i) => i !== index))}>Remove</button></div>)}</div>}</section><section className="bmt-form-card"><div className="bmt-form-card-head"><div><h3>Property Videos</h3><p>Upload walkthrough videos or add a video URL.</p></div></div><label className="bmt-upload-zone compact"><input type="file" accept="video/*" multiple onChange={handleVideos} /><span className="bmt-upload-icon">▶</span><strong>Upload property video</strong><small>MP4 / WEBM recommended</small></label><div className="bmt-field-group"><label>Video URL</label><div className="bmt-inline-input"><input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtube.com/... or property video URL" /><button type="button">Add URL</button></div></div>{videos.length > 0 && <div className="bmt-media-grid video-grid">{videos.map((video, index) => <div className="bmt-media-item" key={`${video.name}-${index}`}><video src={video.url} controls /><button onClick={() => setVideos((prev) => prev.filter((_, i) => i !== index))}>Remove</button></div>)}</div>}</section></div></div>;
// }

// function PropertyAmenities() {
//   const amenities = ["Free Wi-Fi","Parking","Air Conditioning","Restaurant","Room Service","Swimming Pool","Gym","Spa","Airport Transfer","24x7 Front Desk","Power Backup","Lift / Elevator","Laundry","Pet Friendly","Wheelchair Accessible","EV Charging"];
//   const [selected, setSelected] = useState([]);
//   const toggle = (name) => setSelected((prev) => prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]);
//   return <div className="bmt-premium-page"><div className="bmt-section-intro"><div><span className="bmt-eyebrow">PROPERTY INFORMATION</span><h2>Amenities & Facilities</h2><p>Select all facilities available at the property.</p></div></div><section className="bmt-form-card"><div className="bmt-check-grid">{amenities.map((item) => <label className={`bmt-check-card ${selected.includes(item) ? "selected" : ""}`} key={item}><input type="checkbox" checked={selected.includes(item)} onChange={() => toggle(item)} /><span>{item}</span></label>)}</div><div className="bmt-form-actions"><button className="bmt-secondary-btn">Save Draft</button><button className="bmt-primary-btn">Save Amenities</button></div></section></div>;
// }

// function PropertyLocation() {
//   return <div className="bmt-premium-page"><div className="bmt-section-intro"><div><span className="bmt-eyebrow">PROPERTY INFORMATION</span><h2>Location & Contact</h2><p>Keep the exact map location and guest-facing contact details updated.</p></div></div><section className="bmt-form-card"><div className="bmt-form-grid"><Field label="Address line 1" placeholder="Property address" /><Field label="Address line 2" placeholder="Area / Landmark" /><Field label="City" placeholder="City" /><Field label="State / Province" placeholder="State / Province" /><Field label="Postal Code" placeholder="Postal code" /><Field label="Country" placeholder="Country" /><Field label="Latitude" placeholder="e.g. 27.4924" /><Field label="Longitude" placeholder="e.g. 77.6737" /><Field label="Property Phone" placeholder="+91..." /><Field label="Property Email" placeholder="property@example.com" /></div><div className="bmt-map-placeholder"><span>Map preview</span><small>Connect Google Maps / Mapbox later with your API key.</small></div><div className="bmt-form-actions"><button className="bmt-secondary-btn">Save Draft</button><button className="bmt-primary-btn">Save Location</button></div></section></div>;
// }

// function PropertyPolicies() {
//   return <div className="bmt-premium-page"><div className="bmt-section-intro"><div><span className="bmt-eyebrow">PROPERTY INFORMATION</span><h2>Policies & House Rules</h2><p>Define check-in, check-out, cancellation, child and guest rules.</p></div></div><section className="bmt-form-card"><div className="bmt-form-grid"><Field label="Check-in from" type="time" /><Field label="Check-out until" type="time" /><SelectField label="Children allowed?" options={["Yes","No","On request"]} /><SelectField label="Pets allowed?" options={["No","Yes","On request"]} /><SelectField label="Smoking" options={["Not allowed","Designated area only","Allowed"]} /><SelectField label="Unmarried couples" options={["Allowed","Not allowed","Subject to ID verification"]} /></div><div className="bmt-field-group"><label>Cancellation Policy</label><textarea rows="5" placeholder="Describe cancellation and no-show rules..." /></div><div className="bmt-field-group"><label>House Rules</label><textarea rows="5" placeholder="Add important guest rules..." /></div><div className="bmt-form-actions"><button className="bmt-secondary-btn">Save Draft</button><button className="bmt-primary-btn">Save Policies</button></div></section></div>;
// }

// function PropertyDocuments() {
//   const docs = ["Business Registration","Tax Registration","Property License","Owner / Authorized ID","Bank Proof","Fire / Safety Certificate"];
//   return <div className="bmt-premium-page"><div className="bmt-section-intro"><div><span className="bmt-eyebrow">VERIFICATION</span><h2>Documents & Verification</h2><p>Upload and track documents required to keep your property live.</p></div></div><section className="bmt-form-card"><div className="bmt-document-list">{docs.map((doc) => <div className="bmt-document-row" key={doc}><div><strong>{doc}</strong><span>Not uploaded</span></div><label className="bmt-upload-small">Upload<input type="file" /></label></div>)}</div></section></div>;
// }

// function PropertyHighlights() {
//   const [highlights, setHighlights] = useState(["Near major attractions","Family friendly"]);
//   const [value, setValue] = useState("");
//   const add = () => { const next = value.trim(); if (!next) return; setHighlights((prev) => [...prev, next]); setValue(""); };
//   return <div className="bmt-premium-page"><div className="bmt-section-intro"><div><span className="bmt-eyebrow">CONTENT QUALITY</span><h2>Highlights & USPs</h2><p>Add the strongest reasons a guest should choose your property.</p></div></div><section className="bmt-form-card"><div className="bmt-field-group"><label>Property short description</label><textarea rows="6" placeholder="Write a clear, premium guest-facing property description..." /></div><div className="bmt-field-group"><label>Add highlight</label><div className="bmt-inline-input"><input value={value} onChange={(e) => setValue(e.target.value)} placeholder="e.g. 2 minutes from the beach" /><button type="button" onClick={add}>Add</button></div></div><div className="bmt-chip-wrap">{highlights.map((item, index) => <span className="bmt-chip" key={`${item}-${index}`}>{item}<button onClick={() => setHighlights((prev) => prev.filter((_, i) => i !== index))}>×</button></span>)}</div><div className="bmt-form-actions"><button className="bmt-secondary-btn">Save Draft</button><button className="bmt-primary-btn">Save Content</button></div></section></div>;
// }

// function AnalyticsPage() {
//   return <div className="bmt-premium-page"><div className="bmt-section-intro"><div><span className="bmt-eyebrow">PERFORMANCE</span><h2>Analytics</h2><p>Property performance overview for bookings, revenue and conversion.</p></div></div><div className="bmt-analytics-cards">{[["Revenue","₹0","+0%"],["Room Nights","0","+0%"],["Average Selling Price","₹0","+0%"],["Conversion","0%","+0%"]].map(([title,value,trend]) => <article key={title}><span>{title}</span><strong>{value}</strong><small>{trend} vs previous period</small></article>)}</div><section className="bmt-form-card"><div className="bmt-chart-placeholder"><strong>Performance chart</strong><span>Connect this section to your analytics API data.</span></div></section></div>;
// }

// function SimplePremiumPage({ title, description }) {
//   return <div className="bmt-premium-page"><div className="bmt-section-intro"><div><span className="bmt-eyebrow">BIRDMYTRIP PARTNER</span><h2>{title}</h2><p>{description}</p></div></div><section className="bmt-form-card"><div className="bmt-empty-state"><div className="bmt-empty-icon">✦</div><h3>{title}</h3><p>Frontend section is ready. Connect this screen to the matching BirdMyTrip backend API when available.</p><button className="bmt-primary-btn">Get Started</button></div></section></div>;
// }

// function Field({ label, placeholder, type = "text" }) {
//   return <div className="bmt-field-group"><label>{label}</label><input type={type} placeholder={placeholder} /></div>;
// }

// function SelectField({ label, options }) {
//   return <div className="bmt-field-group"><label>{label}</label><select defaultValue=""><option value="" disabled>Select</option>{options.map((option) => <option key={option}>{option}</option>)}</select></div>;
// }
import { useEffect, useMemo, useState } from "react";

import VendorHotels from "./VendorHotels";
import VendorCabs from "./VendorCabs";
import BusModule from "./BusModule";
import BusTripModule from "./BusTripModule";
import BusSeatLayoutModule from "./BusSeatLayoutModule";
import VendorBusBookings from "./VendorBusBookings";
import VendorCabBookings from "./VendorCabBookings";
import VendorHotelBookings from "./VendorHotelBookings";
import VendorHotelRooms from "./Vendorhotelrooms";
import VendorRoomInventory from "./Vendorroominventory";
import VendorApartment from "./Vendorapartment";
import VendorHomestay from "./VendorHomestay";
import Homestayunitmanager from "./Homestayunitmanager";
import VendorHomestayInventory from "./VendorHomestayInventory";
import VendorHomestayBookings from "./VendorHomestayBookings";
import VendorDarshan from "./VendorDarshan";
import VendorHoliday from "./VendorHoliday";
import VendorHolidayBookings from "./VendorHolidayBookings";
import VendorBnb from "./Bnbmanager";
import Palaceapp from "./Palaceapp";
import VendorVacationHouse from "./Vacationhouseapp";
import NightclubManagement from "./NightclubManagement";
import { BnbBooking } from "./bnbBooking/BnbBooking";
import VendorProfile from "./VendorProfile";

import "./VendorLayout.css";

const ICONS = {
  dashboard: "▦",
  bookings: "▤",
  inventory: "▥",
  grow: "✦",
  payments: "◈",
  sponsored: "AD",
  property: "⌂",
  reviews: "☆",
  analytics: "⌁",
  more: "⋯",
  buses: "▣",
  cabs: "◉",
  holidays: "✦",
  darshan: "◇",
  nightclub: "♪",
  bnb: "⌂",
  apartments: "▥",
  palace: "♛",
  vacationhouses: "⌂",
};

export default function VendorLayout() {
  const [activeTab, setActiveTab] = useState(() => {
    return sessionStorage.getItem("bmtVendorActiveTab") || "dashboard";
  });
  const [vendorName, setVendorName] = useState("");
  const [vendorService, setVendorService] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Keep the selected module stable even if VendorLayout is remounted by React Router.
  useEffect(() => {
    sessionStorage.setItem("bmtVendorActiveTab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    const vendorToken = localStorage.getItem("vendorToken");
    const storedVendor = localStorage.getItem("vendorUser");

    if (!vendorToken || !storedVendor) {
      localStorage.removeItem("vendorToken");
      localStorage.removeItem("vendorUser");
      sessionStorage.removeItem("bmtVendorActiveTab");
      window.location.href = "/vendor-login";
      return;
    }

    try {
      const vendor = JSON.parse(storedVendor);
      const vertical = String(vendor.vertical || vendor.selectedVertical || "")
        .trim()
        .toLowerCase();
      const staySubtype = String(
        vendor.staySubtype ||
          (vertical === "stay" ? vendor.service : "") ||
          ""
      )
        .trim()
        .toLowerCase();

      setVendorName(
        vendor.business?.businessName ||
          vendor.businessName ||
          vendor.companyName ||
          vendor.name ||
          vendor.ownerName ||
          vendor.email ||
          "Vendor"
      );

      // Vendor DB record is the source of truth.
      // For Stay vendors the saved subtype (hotel/homestay/etc.) controls the dashboard.
      setVendorService(vertical === "stay" ? staySubtype : vertical);
    } catch (error) {
      console.error("VENDOR SESSION ERROR:", error);
      localStorage.removeItem("vendorToken");
      localStorage.removeItem("vendorUser");
      window.location.href = "/vendor-login";
      return;
    } finally {
      setLoading(false);
    }
  }, []);

  const isHotel = ["hotel", "hotels"].includes(vendorService);
  const isHomestay = ["homestay", "homestays", "home stay"].includes(vendorService);

  const logout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("vendorToken");
      localStorage.removeItem("vendorUser");
      sessionStorage.removeItem("bmtVendorActiveTab");
      window.location.href = "/vendor-login";
    }
  };

  const menuItems = useMemo(() => {
    if (isHotel) {
      return [
        { id: "dashboard", label: "Dashboard", icon: "dashboard" },
        { id: "hotels_bookings", label: "Bookings", icon: "bookings" },
        { id: "hotel_room_inventory", label: "Rates & Inventory", icon: "inventory" },
        {
          id: "grow_business",
          label: "Grow Your Business",
          icon: "grow",
          badge: "NEW",
          children: [
            { id: "promotions", label: "Promotions & Offers" },
            { id: "visibility_boost", label: "Visibility Booster" },
            { id: "campaigns", label: "Campaigns" },
          ],
        },
        { id: "payments", label: "Payments", icon: "payments" },
        { id: "sponsored", label: "Sponsored Listing", icon: "sponsored" },
        {
          id: "hotels",
          label: "Property Information",
          icon: "property",
          badge: "NEW",
          children: [
            { id: "hotels_manage", label: "Property Details" },
            { id: "hotel_rooms", label: "Rooms & Units" },
            { id: "property_media", label: "Images & Videos" },
            { id: "property_amenities", label: "Amenities & Facilities" },
            { id: "property_location", label: "Location & Contact" },
            { id: "property_policies", label: "Policies & House Rules" },
            { id: "property_documents", label: "Documents & Verification" },
            { id: "property_highlights", label: "Highlights & USPs" },
          ],
        },
        { id: "ratings_reviews", label: "Ratings & Reviews", icon: "reviews" },
        { id: "analytics", label: "Analytics", icon: "analytics", badge: "NEW" },
        {
          id: "profile",
          label: "More",
          icon: "more",
          children: [
            { id: "profile_personal", label: "My Profile" },
            { id: "profile_business", label: "Business Details" },
            { id: "profile_contact", label: "Contact Details" },
            { id: "profile_tax", label: "Tax & Identity" },
            { id: "profile_bank", label: "Bank Details" },
            { id: "profile_service", label: "Service Details" },
          ],
        },
      ];
    }

    if (isHomestay) {
      return [
        { id: "dashboard", label: "Dashboard", icon: "dashboard" },
        { id: "homestays_bookings", label: "Bookings", icon: "bookings" },
        { id: "homestay_inventory", label: "Rates & Inventory", icon: "inventory" },
        {
          id: "homestays",
          label: "Property Information",
          icon: "property",
          children: [
            { id: "homestays_manage", label: "Property Details" },
            { id: "homestay_units", label: "Units / Rooms" },
            { id: "property_media", label: "Images & Videos" },
            { id: "property_amenities", label: "Amenities & Facilities" },
            { id: "property_location", label: "Location & Contact" },
            { id: "property_policies", label: "Policies & House Rules" },
            { id: "property_documents", label: "Documents & Verification" },
            { id: "property_highlights", label: "Highlights & USPs" },
          ],
        },
        { id: "ratings_reviews", label: "Ratings & Reviews", icon: "reviews" },
        { id: "analytics", label: "Analytics", icon: "analytics", badge: "NEW" },
        {
          id: "profile",
          label: "More",
          icon: "more",
          children: [
            { id: "profile_personal", label: "My Profile" },
            { id: "profile_business", label: "Business Details" },
            { id: "profile_contact", label: "Contact Details" },
            { id: "profile_tax", label: "Tax & Identity" },
            { id: "profile_bank", label: "Bank Details" },
            { id: "profile_service", label: "Service Details" },
          ],
        },
      ];
    }

    return [
      { id: "dashboard", label: "Dashboard", icon: "dashboard" },
      { id: "bnb", label: "BnB Manager", icon: "bnb", children: [
        { id: "bnb_manage", label: "Manage BnB" },
        { id: "bnb_bookings", label: "BnB Bookings" },
      ] },
      { id: "palace", label: "Palace", icon: "palace", children: [
        { id: "palace_manage", label: "Manage Palace" },
      ] },
      { id: "vacationhouses", label: "Vacation Houses", icon: "vacationhouses", children: [
        { id: "vacationhouses_manage", label: "Manage Vacation Houses" },
        { id: "vacationhouses_bookings", label: "Bookings" },
      ] },
      { id: "apartments", label: "Apartments", icon: "apartments", children: [
        { id: "apartments_manage", label: "Manage Apartments" },
      ] },
      { id: "cabs", label: "Cabs", icon: "cabs", children: [
        { id: "cabs_manage", label: "Manage Cabs" },
        { id: "cabs_bookings", label: "Cab Bookings" },
      ] },
      { id: "buses", label: "Buses", icon: "buses", children: [
        { id: "buses_manage", label: "Manage Buses" },
        { id: "bus_trip_module", label: "Trip Management" },
        { id: "bus_seat_layout", label: "Seat Layout" },
        { id: "buses_bookings", label: "Bus Bookings" },
      ] },
      { id: "darshans", label: "Darshan", icon: "darshan", children: [
        { id: "darshan_manage", label: "Manage Darshan" },
      ] },
      { id: "nightclub", label: "Nightclub", icon: "nightclub", children: [
        { id: "nightclub_manage", label: "Manage Nightclubs" },
      ] },
      { id: "holidays", label: "Holidays", icon: "holidays", children: [
        { id: "holidays_manage", label: "Manage Holidays" },
        { id: "holidays_bookings", label: "Holiday Bookings" },
      ] },
      { id: "profile", label: "More", icon: "more", children: [
        { id: "profile_personal", label: "My Profile" },
        { id: "profile_business", label: "Business Details" },
        { id: "profile_contact", label: "Contact Details" },
        { id: "profile_tax", label: "Tax & Identity" },
        { id: "profile_bank", label: "Bank Details" },
        { id: "profile_service", label: "Service Details" },
      ] },
    ];
  }, [isHotel, isHomestay]);

  const serviceMenus = {
    cab: ["cabs"], cabs: ["cabs"], "car-rental": ["cabs"],
    bus: ["buses"], buses: ["buses"],
    stay: ["bnb"], bnb: ["bnb"],
    darshan: ["darshans"], "bmt darshan": ["darshans"],
    vacation: ["vacationhouses"], vacationhouse: ["vacationhouses"], "vacation-home": ["vacationhouses"],
    apartment: ["apartments"], apartments: ["apartments"],
    palace: ["palace"],
    holiday: ["holidays"], holidays: ["holidays"],
    nightclub: ["nightclub"], nightclubs: ["nightclub"], "night-club": ["nightclub"],
  };

  const filteredMenus = isHotel || isHomestay
    ? menuItems
    : menuItems.filter((item) => {
        if (item.id === "dashboard" || item.id === "profile") return true;
        return serviceMenus[vendorService]?.includes(item.id);
      });

  const toggleMenu = (menuId) => {
    setExpandedMenus((prev) => ({ ...prev, [menuId]: !prev[menuId] }));
  };

  const handleMenuClick = (item) => {
    if (item.children) {
      toggleMenu(item.id);
      if (!expandedMenus[item.id]) setActiveTab(item.children[0].id);
      return;
    }
    setActiveTab(item.id);
  };

  useEffect(() => {
    menuItems.forEach((item) => {
      if (!item.children) return;
      if (item.children.some((child) => child.id === activeTab)) {
        setExpandedMenus((prev) => ({ ...prev, [item.id]: true }));
      }
    });
  }, [activeTab, menuItems]);

  const getActiveLabel = () => {
    for (const item of menuItems) {
      if (item.id === activeTab) return item.label;
      const child = item.children?.find((c) => c.id === activeTab);
      if (child) return child.label;
    }
    return "Dashboard";
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return <DashboardContent vendorService={vendorService} onNavigate={setActiveTab} />;
      case "hotels_manage": return <VendorHotels />;
      case "hotel_rooms": return <VendorHotelRooms />;
      case "hotel_room_inventory": return <VendorRoomInventory />;
      case "hotels_bookings": return <VendorHotelBookings />;
      case "homestays_manage": return <VendorHomestay />;
      case "homestay_units": return <Homestayunitmanager />;
      case "homestay_inventory": return <VendorHomestayInventory />;
      case "homestays_bookings": return <VendorHomestayBookings />;
      case "property_media": return <PropertyMedia />;
      case "property_amenities": return <PropertyAmenities />;
      case "property_location": return <PropertyLocation />;
      case "property_policies": return <PropertyPolicies />;
      case "property_documents": return <PropertyDocuments />;
      case "property_highlights": return <PropertyHighlights />;
      case "promotions": return <SimplePremiumPage title="Promotions & Offers" description="Create property discounts, mobile offers, early-bird offers and limited-time deals." />;
      case "visibility_boost": return <SimplePremiumPage title="Visibility Booster" description="Improve property visibility with sponsored placement and performance campaigns." />;
      case "campaigns": return <SimplePremiumPage title="Campaigns" description="Manage seasonal campaigns and marketing participation." />;
      case "payments": return <SimplePremiumPage title="Payments" description="View settlements, payment status, deductions and payout history." />;
      case "sponsored": return <SimplePremiumPage title="Sponsored Listing" description="Boost your property ranking through paid sponsored placement." />;
      case "ratings_reviews": return <SimplePremiumPage title="Ratings & Reviews" description="Track guest ratings, review reasons and respond to guest feedback." />;
      case "analytics": return <AnalyticsPage />;
      case "profile_personal": return <VendorProfile initialSection="personal" />;
      case "profile_business": return <VendorProfile initialSection="business" />;
      case "profile_contact": return <VendorProfile initialSection="contact" />;
      case "profile_tax": return <VendorProfile initialSection="tax" />;
      case "profile_bank": return <VendorProfile initialSection="bank" />;
      case "profile_service": return <VendorProfile initialSection="service" />;
      case "bnb_manage": return <VendorBnb />;
      case "bnb_bookings": return <BnbBooking />;
      case "apartments_manage": return <VendorApartment />;
      case "cabs_manage": return <VendorCabs />;
      case "cabs_bookings": return <VendorCabBookings />;
      case "buses_manage": return <BusModule />;
      case "bus_trip_module": return <BusTripModule />;
      case "bus_seat_layout": return <BusSeatLayoutModule />;
      case "buses_bookings": return <VendorBusBookings />;
      case "nightclub_manage": return <NightclubManagement />;
      case "vacationhouses_manage": return <VendorVacationHouse />;
      case "vacationhouses_bookings": return <SimplePremiumPage title="Vacation House Bookings" description="Manage upcoming, completed and cancelled reservations." />;
      case "darshan_manage": return <VendorDarshan />;
      case "holidays_manage": return <VendorHoliday />;
      case "holidays_bookings": return <VendorHolidayBookings />;
      case "palace_manage": return <Palaceapp />;
      default: return <DashboardContent vendorService={vendorService} onNavigate={setActiveTab} />;
    }
  };

  const propertyTypeLabel = isHotel ? "Hotel" : isHomestay ? "Homestay" : vendorService ? vendorService.charAt(0).toUpperCase() + vendorService.slice(1) : "Partner";

  if (loading) {
    return <div className="bmt-loader"><div className="bmt-loader-ring" /><p>Loading BirdMyTrip Partner Panel...</p></div>;
  }

  return (
    <div className="bmt-extranet">
      <aside className={`bmt-sidebar ${sidebarCollapsed ? "is-collapsed" : ""}`}>
        <div className="bmt-sidebar-top">
          <button className="bmt-menu-button" onClick={() => setSidebarCollapsed((v) => !v)} aria-label="Toggle menu"><span /><span /><span /></button>
          {!sidebarCollapsed && <span className="bmt-menu-text">Menu</span>}
        </div>

        <div className="bmt-hide-strip"><button onClick={() => setSidebarCollapsed((v) => !v)}>{sidebarCollapsed ? "›" : "‹  Hide"}</button></div>

        <nav className="bmt-nav">
          {filteredMenus.map((item) => {
            const childActive = item.children?.some((c) => c.id === activeTab);
            const active = activeTab === item.id || childActive;
            return (
              <div className="bmt-nav-group" key={item.id}>
                <button className={`bmt-nav-item ${active ? "active" : ""}`} onClick={() => handleMenuClick(item)} title={sidebarCollapsed ? item.label : undefined}>
                  <span className="bmt-nav-icon">{ICONS[item.icon] || "•"}</span>
                  {!sidebarCollapsed && <>
                    <span className="bmt-nav-label">{item.label}</span>
                    {item.badge && <span className="bmt-menu-badge">{item.badge}</span>}
                    {item.children && <span className={`bmt-nav-arrow ${expandedMenus[item.id] ? "open" : ""}`}>›</span>}
                  </>}
                </button>

                {!sidebarCollapsed && item.children && expandedMenus[item.id] && (
                  <div className="bmt-subnav">
                    {item.children.map((child) => (
                      <button key={child.id} className={`bmt-subnav-item ${activeTab === child.id ? "active" : ""}`} onClick={() => setActiveTab(child.id)}>{child.label}</button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="bmt-sidebar-footer"><button onClick={logout} className="bmt-logout-btn">{sidebarCollapsed ? "↪" : "Logout"}</button></div>
      </aside>

      <div className="bmt-shell">
        <header className="bmt-topbar">
          <div className="bmt-property-block">
            <div className="bmt-brand-badge">bmt</div>
            <div className="bmt-property-copy">
              <div className="bmt-property-name-row"><strong>{vendorName || "BirdMyTrip Partner"}</strong><span className="bmt-chevron">⌄</span></div>
              <p>{propertyTypeLabel} | BirdMyTrip Partner</p>
            </div>
          </div>

          <div className="bmt-topbar-actions">
            <button className="bmt-round-action">?</button>
            <button className="bmt-user-pill" onClick={() => setActiveTab("profile_personal")}>
              <span className="bmt-user-avatar">{(vendorName || "V").charAt(0).toUpperCase()}</span>
              <span className="bmt-user-copy"><strong>{vendorName || "Vendor"}</strong><small>Partner</small></span>
            </button>
          </div>
        </header>

        <main className="bmt-main">
          {activeTab !== "dashboard" && <div className="bmt-page-heading"><h1>{getActiveLabel()}</h1><p>BirdMyTrip Partner Panel / {getActiveLabel()}</p></div>}
          <div className="bmt-content">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
}

function DashboardContent({ vendorService, onNavigate }) {
  const isStay = ["hotel","hotels","homestay","homestays","home stay","stay","bnb"].includes(vendorService);
  const bookingTarget = ["hotel","hotels"].includes(vendorService) ? "hotels_bookings" : ["homestay","homestays"].includes(vendorService) ? "homestays_bookings" : ["bus","buses"].includes(vendorService) ? "buses_bookings" : ["cab","cabs"].includes(vendorService) ? "cabs_bookings" : "dashboard";
  const inventoryTarget = ["hotel","hotels"].includes(vendorService) ? "hotel_room_inventory" : ["homestay","homestays"].includes(vendorService) ? "homestay_inventory" : "dashboard";

  const metrics = isStay ? [
    { title: "Today's Room Nights", value: "0", sub: "FOR LAST 7 DAYS : 3 ROOM NIGHTS", action: bookingTarget },
    { title: "Today's Revenue", value: "₹ 0", sub: "FOR LAST 7 DAYS : ₹ 3,239", action: bookingTarget },
    { title: "Today's Average Selling Price", value: "₹ 0", sub: "FOR LAST 7 DAYS : ₹ 1,371", action: inventoryTarget },
    { title: "Today's Check-ins", value: "0", sub: "FOR LAST 7 DAYS : 3 CHECK-INS", action: bookingTarget },
  ] : [
    { title: "Today's Bookings", value: "0", sub: "FOR LAST 7 DAYS : 12 BOOKINGS", action: bookingTarget },
    { title: "Today's Revenue", value: "₹ 0", sub: "FOR LAST 7 DAYS : ₹ 8,920", action: bookingTarget },
    { title: "Active Listings", value: "8", sub: "CURRENTLY LIVE ON BIRDMYTRIP", action: inventoryTarget },
    { title: "Upcoming Operations", value: "5", sub: "NEXT 7 DAYS", action: bookingTarget },
  ];

  return (
    <div className="bmt-dashboard">
      <section className="bmt-performance-head"><div><div className="bmt-title-line"><h1>Performance Overview</h1><span className="bmt-info-icon">?</span></div><p>Last updated just now</p></div></section>
      <section className="bmt-analytics-banner"><div><h2>{isStay ? "Property Analytics" : "Business Analytics"}</h2><p>See detailed analysis and past data for Revenue, Room Nights, Average Selling Price, Conversion, Bookings and more.</p></div><button onClick={() => onNavigate("analytics")}>View All</button></section>
      <section className="bmt-metrics-grid">{metrics.map((metric) => <article className="bmt-metric-card" key={metric.title}><h3>{metric.title}</h3><div className="bmt-metric-value">{metric.value}</div><p>{metric.sub}</p><button onClick={() => onNavigate(metric.action)}>View More</button></article>)}</section>
      {isStay && <section className="bmt-dashboard-bottom-grid"><article className="bmt-panel-card"><div className="bmt-card-header"><div><h3>Property Setup</h3><p>Complete important property content</p></div><span className="bmt-new-badge">NEW</span></div><div className="bmt-action-list"><button onClick={() => onNavigate("property_media")}><span>Add Images & Videos</span><b>›</b></button><button onClick={() => onNavigate("property_amenities")}><span>Update Amenities & Facilities</span><b>›</b></button><button onClick={() => onNavigate("property_policies")}><span>Review Property Policies</span><b>›</b></button></div></article><article className="bmt-panel-card"><div className="bmt-card-header"><div><h3>Today's Snapshot</h3><p>Quick operational summary</p></div></div><div className="bmt-snapshot-grid"><div><strong>0</strong><span>Pending</span></div><div><strong>0</strong><span>Confirmed</span></div><div><strong>0</strong><span>Cancelled</span></div><div><strong>0</strong><span>Completed</span></div></div></article></section>}
    </div>
  );
}

function PropertyMedia() {
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [videoUrl, setVideoUrl] = useState("");
  const handleImages = (event) => setImages((prev) => [...prev, ...Array.from(event.target.files || []).map((file) => ({ file, url: URL.createObjectURL(file), name: file.name }))]);
  const handleVideos = (event) => setVideos((prev) => [...prev, ...Array.from(event.target.files || []).map((file) => ({ file, url: URL.createObjectURL(file), name: file.name }))]);
  return <div className="bmt-premium-page"><div className="bmt-section-intro"><div><span className="bmt-eyebrow">PROPERTY CONTENT</span><h2>Images & Videos</h2><p>Add high-quality property photos, room photos, exterior images, facilities, dining images and walkthrough videos.</p></div><span className="bmt-completion-pill">Media completeness 0%</span></div><div className="bmt-property-grid"><section className="bmt-form-card"><div className="bmt-form-card-head"><div><h3>Property Images</h3><p>Recommended: minimum 8 clear landscape photos.</p></div></div><label className="bmt-upload-zone"><input type="file" accept="image/*" multiple onChange={handleImages} /><span className="bmt-upload-icon">＋</span><strong>Upload property images</strong><small>JPG, PNG, WEBP • Front view, rooms, lobby, washroom, dining and facilities</small></label>{images.length > 0 && <div className="bmt-media-grid">{images.map((image, index) => <div className="bmt-media-item" key={`${image.name}-${index}`}><img src={image.url} alt={image.name} /><button onClick={() => setImages((prev) => prev.filter((_, i) => i !== index))}>Remove</button></div>)}</div>}</section><section className="bmt-form-card"><div className="bmt-form-card-head"><div><h3>Property Videos</h3><p>Upload walkthrough videos or add a video URL.</p></div></div><label className="bmt-upload-zone compact"><input type="file" accept="video/*" multiple onChange={handleVideos} /><span className="bmt-upload-icon">▶</span><strong>Upload property video</strong><small>MP4 / WEBM recommended</small></label><div className="bmt-field-group"><label>Video URL</label><div className="bmt-inline-input"><input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtube.com/... or property video URL" /><button type="button">Add URL</button></div></div>{videos.length > 0 && <div className="bmt-media-grid video-grid">{videos.map((video, index) => <div className="bmt-media-item" key={`${video.name}-${index}`}><video src={video.url} controls /><button onClick={() => setVideos((prev) => prev.filter((_, i) => i !== index))}>Remove</button></div>)}</div>}</section></div></div>;
}

function PropertyAmenities() {
  const amenities = ["Free Wi-Fi","Parking","Air Conditioning","Restaurant","Room Service","Swimming Pool","Gym","Spa","Airport Transfer","24x7 Front Desk","Power Backup","Lift / Elevator","Laundry","Pet Friendly","Wheelchair Accessible","EV Charging"];
  const [selected, setSelected] = useState([]);
  const toggle = (name) => setSelected((prev) => prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]);
  return <div className="bmt-premium-page"><div className="bmt-section-intro"><div><span className="bmt-eyebrow">PROPERTY INFORMATION</span><h2>Amenities & Facilities</h2><p>Select all facilities available at the property.</p></div></div><section className="bmt-form-card"><div className="bmt-check-grid">{amenities.map((item) => <label className={`bmt-check-card ${selected.includes(item) ? "selected" : ""}`} key={item}><input type="checkbox" checked={selected.includes(item)} onChange={() => toggle(item)} /><span>{item}</span></label>)}</div><div className="bmt-form-actions"><button className="bmt-secondary-btn">Save Draft</button><button className="bmt-primary-btn">Save Amenities</button></div></section></div>;
}

function PropertyLocation() {
  return <div className="bmt-premium-page"><div className="bmt-section-intro"><div><span className="bmt-eyebrow">PROPERTY INFORMATION</span><h2>Location & Contact</h2><p>Keep the exact map location and guest-facing contact details updated.</p></div></div><section className="bmt-form-card"><div className="bmt-form-grid"><Field label="Address line 1" placeholder="Property address" /><Field label="Address line 2" placeholder="Area / Landmark" /><Field label="City" placeholder="City" /><Field label="State / Province" placeholder="State / Province" /><Field label="Postal Code" placeholder="Postal code" /><Field label="Country" placeholder="Country" /><Field label="Latitude" placeholder="e.g. 27.4924" /><Field label="Longitude" placeholder="e.g. 77.6737" /><Field label="Property Phone" placeholder="+91..." /><Field label="Property Email" placeholder="property@example.com" /></div><div className="bmt-map-placeholder"><span>Map preview</span><small>Connect Google Maps / Mapbox later with your API key.</small></div><div className="bmt-form-actions"><button className="bmt-secondary-btn">Save Draft</button><button className="bmt-primary-btn">Save Location</button></div></section></div>;
}

function PropertyPolicies() {
  return <div className="bmt-premium-page"><div className="bmt-section-intro"><div><span className="bmt-eyebrow">PROPERTY INFORMATION</span><h2>Policies & House Rules</h2><p>Define check-in, check-out, cancellation, child and guest rules.</p></div></div><section className="bmt-form-card"><div className="bmt-form-grid"><Field label="Check-in from" type="time" /><Field label="Check-out until" type="time" /><SelectField label="Children allowed?" options={["Yes","No","On request"]} /><SelectField label="Pets allowed?" options={["No","Yes","On request"]} /><SelectField label="Smoking" options={["Not allowed","Designated area only","Allowed"]} /><SelectField label="Unmarried couples" options={["Allowed","Not allowed","Subject to ID verification"]} /></div><div className="bmt-field-group"><label>Cancellation Policy</label><textarea rows="5" placeholder="Describe cancellation and no-show rules..." /></div><div className="bmt-field-group"><label>House Rules</label><textarea rows="5" placeholder="Add important guest rules..." /></div><div className="bmt-form-actions"><button className="bmt-secondary-btn">Save Draft</button><button className="bmt-primary-btn">Save Policies</button></div></section></div>;
}

function PropertyDocuments() {
  const docs = ["Business Registration","Tax Registration","Property License","Owner / Authorized ID","Bank Proof","Fire / Safety Certificate"];
  return <div className="bmt-premium-page"><div className="bmt-section-intro"><div><span className="bmt-eyebrow">VERIFICATION</span><h2>Documents & Verification</h2><p>Upload and track documents required to keep your property live.</p></div></div><section className="bmt-form-card"><div className="bmt-document-list">{docs.map((doc) => <div className="bmt-document-row" key={doc}><div><strong>{doc}</strong><span>Not uploaded</span></div><label className="bmt-upload-small">Upload<input type="file" /></label></div>)}</div></section></div>;
}

function PropertyHighlights() {
  const [highlights, setHighlights] = useState(["Near major attractions","Family friendly"]);
  const [value, setValue] = useState("");
  const add = () => { const next = value.trim(); if (!next) return; setHighlights((prev) => [...prev, next]); setValue(""); };
  return <div className="bmt-premium-page"><div className="bmt-section-intro"><div><span className="bmt-eyebrow">CONTENT QUALITY</span><h2>Highlights & USPs</h2><p>Add the strongest reasons a guest should choose your property.</p></div></div><section className="bmt-form-card"><div className="bmt-field-group"><label>Property short description</label><textarea rows="6" placeholder="Write a clear, premium guest-facing property description..." /></div><div className="bmt-field-group"><label>Add highlight</label><div className="bmt-inline-input"><input value={value} onChange={(e) => setValue(e.target.value)} placeholder="e.g. 2 minutes from the beach" /><button type="button" onClick={add}>Add</button></div></div><div className="bmt-chip-wrap">{highlights.map((item, index) => <span className="bmt-chip" key={`${item}-${index}`}>{item}<button onClick={() => setHighlights((prev) => prev.filter((_, i) => i !== index))}>×</button></span>)}</div><div className="bmt-form-actions"><button className="bmt-secondary-btn">Save Draft</button><button className="bmt-primary-btn">Save Content</button></div></section></div>;
}

function AnalyticsPage() {
  return <div className="bmt-premium-page"><div className="bmt-section-intro"><div><span className="bmt-eyebrow">PERFORMANCE</span><h2>Analytics</h2><p>Property performance overview for bookings, revenue and conversion.</p></div></div><div className="bmt-analytics-cards">{[["Revenue","₹0","+0%"],["Room Nights","0","+0%"],["Average Selling Price","₹0","+0%"],["Conversion","0%","+0%"]].map(([title,value,trend]) => <article key={title}><span>{title}</span><strong>{value}</strong><small>{trend} vs previous period</small></article>)}</div><section className="bmt-form-card"><div className="bmt-chart-placeholder"><strong>Performance chart</strong><span>Connect this section to your analytics API data.</span></div></section></div>;
}

function SimplePremiumPage({ title, description }) {
  return <div className="bmt-premium-page"><div className="bmt-section-intro"><div><span className="bmt-eyebrow">BIRDMYTRIP PARTNER</span><h2>{title}</h2><p>{description}</p></div></div><section className="bmt-form-card"><div className="bmt-empty-state"><div className="bmt-empty-icon">✦</div><h3>{title}</h3><p>Frontend section is ready. Connect this screen to the matching BirdMyTrip backend API when available.</p><button className="bmt-primary-btn">Get Started</button></div></section></div>;
}

function Field({ label, placeholder, type = "text" }) {
  return <div className="bmt-field-group"><label>{label}</label><input type={type} placeholder={placeholder} /></div>;
}

function SelectField({ label, options }) {
  return <div className="bmt-field-group"><label>{label}</label><select defaultValue=""><option value="" disabled>Select</option>{options.map((option) => <option key={option}>{option}</option>)}</select></div>;
}
