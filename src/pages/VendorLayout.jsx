
// import { useEffect, useMemo, useState } from "react";
// import VendorHotels from "./VendorHotels";
// import VendorCabs from "./VendorCabs";
// import VendorCabDrivers from "./VendorCabDrivers";
// import CabVendorDashboard from "./CabVendorDashboard";
// import BusModule from "./BusModule";
// import BusTripModule from "./BusTripModule";
// import BusSeatLayoutModule from "./BusSeatLayoutModule";
// import VendorBusBookings from "./VendorBusBookings";
// import VendorCabBookings from "./VendorCabBookings";
// import VendorHotelBookings from "./VendorHotelBookings";
// import VendorHotelRooms from "./Vendorhotelrooms";
// import VendorRoomInventory from "./Vendorroominventory";
// import VendorApartment from "./Vendorapartment";
// import VendorHomestay from "./VendorHomestay";
// import Homestayunitmanager from "./Homestayunitmanager";
// import VendorHomestayInventory from "./VendorHomestayInventory";
// import VendorHomestayBookings from "./VendorHomestayBookings";
// import AddDarshan from "./darshan/AddDarshan";
// import Darshantype from "./darshan/Darshantype";
// import Darshanslot from "./darshan/Darshanslot";
// import Darshanavailability from "./darshan/Darshanavailability";
// import DarshanBookings from "./darshan/Vendordarshanbookings";
// import VendorHoliday from "./VendorHoliday";
// import VendorHolidayBookings from "./VendorHolidayBookings";
// import VendorBnb from "./Bnbmanager";
// import Palaceapp from "./Palaceapp";
// import VendorVacationHouse from "./Vacationhouseapp";
// import NightclubManagement from "./NightClub/NightclubManagement";
// import NightclubTables from "./NightClub/Nightclubtables";
// import NightclubTablePricing from "./NightClub/Nightclubtablepricing";
// import ManageEvents from "./NightClub/ManageEvents";
// import EventTickets from "./NightClub/EventTickets";
// import { BnbBooking } from "./bnbBooking/BnbBooking";
// import VendorProfile from "./VendorProfile";
// import VendorCruise from "./VendorCruise";
// import CabinManagement from "./CabinManagement";
// import CruiseItineraryManagement from "./CruiseItineraryManagement";
// import CruiseSailingManagement from "./CruiseSailingManagement";
// import Tours from "./tours-activities/Tours";
// import TourBookings from "./tours-activities/Tourbookings";
// import TourQuery from "./tours-activities/TourQuery";
// import TourReview from "./tours-activities/TourReview";
// import TourSchedule from "./tours-activities/TourSchedule";
// import AddActivities from "./Activities/AddActivities";
// import ScheduleActivities from "./Activities/ScheduleActivities";
// import ActivitiesBookings from "./Activities/ActivitiesBookings";
// import "./VendorCruise.css";
// import "./VendorLayout.css";

// /* ==================== ICONS & MENU HELPERS ==================== */

// const IC = {
//   dash: "▦", book: "▤", inv: "▥", prop: "⌂", bed: "▭", img: "▧", star: "☆", pin: "⌖", doc: "▢",
//   chart: "⌁", ship: "⚓", map: "◫", plus: "＋", price: "$", car: "◉", user: "☺", bus: "▣", seat: "▤",
//   tour: "✈", ev: "◆", club: "♪", pray: "◇", gear: "⚙", crown: "♛",
//   grow: "✦", pay: "◈", ad: "AD", eye: "◎", camp: "✦",
// };
// const L = (list) => list.map(([id, label, icon]) => ({ id, label, icon: IC[icon] }));

// const D = ["dashboard", "Dashboard", "dash"];

// // Property information tail (Hotel / Homestay)
// const stayTail = [
//   ["property_media", "Images & Videos", "img"],
//   ["property_amenities", "Amenities & Facilities", "star"],
//   ["property_location", "Location & Contact", "pin"],
//   ["property_policies", "Policies & House Rules", "doc"],
//   ["property_documents", "Documents & Verification", "doc"],
//   ["property_highlights", "Highlights & USPs", "star"],
//   ["ratings_reviews", "Ratings & Reviews", "star"],
//   ["analytics", "Analytics", "chart"],
// ];

// // Hotel-only "Grow your business" + payments + sponsored
// const hotelGrow = [
//   ["promotions", "Promotions & Offers", "grow"],
//   ["visibility_boost", "Visibility Booster", "eye"],
//   ["campaigns", "Campaigns", "camp"],
//   ["payments", "Payments", "pay"],
//   ["sponsored", "Sponsored Listing", "ad"],
// ];

// /* ==================== PANELS (per vendor vertical) ==================== */

// const PANELS = {
//   hotel: {
//     title: "Hotel",
//     icon: IC.prop,
//     main: L([
//       D,
//       ["hotels_bookings", "Bookings", "book"],
//       ["hotel_room_inventory", "Rates & Inventory", "inv"],
//       ...hotelGrow,
//       ["hotels_manage", "Property Details", "prop"],
//       ["hotel_rooms", "Rooms & Units", "bed"],
//       ...stayTail,
//     ]),
//   },
//   homestay: {
//     title: "Homestay",
//     icon: IC.prop,
//     main: L([
//       D,
//       ["homestays_bookings", "Bookings", "book"],
//       ["homestay_inventory", "Rates & Inventory", "inv"],
//       ["homestays_manage", "Property Details", "prop"],
//       ["homestay_units", "Units / Rooms", "bed"],
//       ...stayTail,
//     ]),
//   },
//   cruise: {
//     title: "Cruise",
//     icon: IC.ship,
//     main: L([
//       D,
//       ["cruise_manage", "My Cruises", "ship"],
//       ["cruise_cabins", "Cabin Management", "bed"],
//       ["cruise_itineraries", "Itinerary Management", "map"],
//       ["cruise_sailings", "Sailing Management", "ship"],
//       ["cruise_pricing", "Pricing Management", "price"],
//       ["cruise_add", "Add Cruise", "plus"],
//       ["cruise_bookings", "Bookings", "book"],
//     ]),
//   },
//   cab: {
//     title: "Cab",
//     icon: IC.car,
//     main: L([
//       D,
//       ["cabs_manage", "Manage Cabs", "car"],
//       ["cabs_drivers", "Driver Details", "user"],
//       ["cabs_bookings", "Cab Bookings", "book"],
//     ]),
//   },
//   bus: {
//     title: "Bus",
//     icon: IC.bus,
//     main: L([
//       D,
//       ["buses_manage", "Manage Buses", "bus"],
//       ["bus_trip_module", "Trip Management", "map"],
//       ["bus_seat_layout", "Seat Layout", "seat"],
//       ["buses_bookings", "Bus Bookings", "book"],
//     ]),
//   },
//   tours: {
//     title: "Tours",
//     icon: IC.tour,
//     main: L([
//       D,
//       ["tours_manage", "Manage Tours", "tour"],
//       ["tours_bookings", "Tour Bookings", "book"],
//       ["tours_queries", "Tour Queries", "doc"],
//       ["tours_reviews", "Tour Reviews", "star"],
//       ["tours_schedule", "Tour Schedules", "map"],
//     ]),
//   },
//   activities: {
//     title: "Activities",
//     icon: IC.ev,
//     main: L([
//       D,
//       ["activities_manage", "Manage Activities", "ev"],
//       ["activities_schedule", "Activity Schedules", "map"],
//       ["activities_bookings", "Activity Bookings", "book"],
//     ]),
//   },
//   events: {
//     title: "Events",
//     icon: IC.ev,
//     main: L([
//       D,
//       ["events_manage", "Manage Events", "ev"],
//       ["events_tickets", "Event Tickets", "book"],
//       ["events_nightclub", "Night Club", "club"],
//       ["nightclub_tables", "Tables", "seat"],
//       ["events_bookings", "Event Bookings", "book"],
//     ]),
//   },
//   nightclub: {
//     title: "Night Club",
//     icon: IC.club,
//     main: L([
//       D,
//       ["nightclub_manage", "Manage Night Club", "club"],
//       ["nightclub_tables", "Tables", "seat"],
//       ["nightclub_table_pricing", "Table Pricing", "price"],
//     ]),
//   },
//   darshan: {
//     title: "Darshan",
//     icon: IC.pray,
//     main: L([
//       D,
//       ["darshan_add", "Add Darshan", "plus"],
//       ["darshan_types", "Darshan Types", "tour"],
//       ["darshan_slots", "Darshan Slots", "seat"],
//       ["darshan_availability", "Slot Availability", "inv"],
//       ["darshan_bookings", "Bookings", "book"],
//     ]),
//   },
//   holidays: {
//     title: "Holidays",
//     icon: IC.tour,
//     main: L([D, ["holidays_manage", "Manage Holidays", "tour"], ["holidays_bookings", "Holiday Bookings", "book"]]),
//   },
//   bnb: {
//     title: "BnB",
//     icon: IC.prop,
//     main: L([D, ["bnb_manage", "Manage BnB", "prop"], ["bnb_bookings", "BnB Bookings", "book"]]),
//   },
//   palace: { title: "Palace", icon: IC.crown, main: L([D, ["palace_manage", "Manage Palace", "crown"]]) },
//   vacation: {
//     title: "Vacation House",
//     icon: IC.prop,
//     main: L([D, ["vacationhouses_manage", "Manage Houses", "prop"], ["vacationhouses_bookings", "Bookings", "book"]]),
//   },
//   apartments: {
//     title: "Apartments",
//     icon: IC.prop,
//     main: L([D, ["apartments_manage", "Manage Apartments", "prop"]]),
//   },
//   partner: { title: "Partner", icon: IC.dash, main: L([D]) },
// };

// // Account section (all vendors) — full profile sub-sections included
// const ACCOUNT = L([
//   ["profile_personal", "My Profile", "user"],
//   ["profile_business", "Business Details", "prop"],
//   ["profile_contact", "Contact Details", "pin"],
//   ["profile_tax", "Tax & Identity", "doc"],
//   ["profile_bank", "Bank Details", "pay"],
//   ["profile_service", "Service Details", "gear"],
//   ["settings", "Settings", "gear"],
// ]);

// // vendor.vertical / staySubtype  ->  panel key
// const ALIASES = {
//   hotel: "hotel", hotels: "hotel",
//   homestay: "homestay", homestays: "homestay", "home stay": "homestay",
//   cab: "cab", cabs: "cab", "car-rental": "cab",
//   bus: "bus", buses: "bus",
//   cruise: "cruise", cruises: "cruise",
//   package: "tours", packages: "tours", tours: "tours", tour: "tours",
//   activity: "activities", activities: "activities",
//   events: "events", event: "events",
//   stay: "bnb", bnb: "bnb",
//   darshan: "darshan", darshans: "darshan", "bmt darshan": "darshan",
//   vacation: "vacation", vacationhouse: "vacation", "vacation-home": "vacation",
//   apartment: "apartments", apartments: "apartments",
//   palace: "palace",
//   holiday: "holidays", holidays: "holidays",
//   nightclub: "nightclub", nightclubs: "nightclub", "night-club": "nightclub",
// };

// /* ==================== SIMPLE (placeholder) PAGES ==================== */
// /* NOTE: yahan jo tab id hoga wo PAGES se PEHLE render hota hai.
//    Isliye activities_manage / activities_schedule / activities_bookings / darshan_* yahan NAHI hone chahiye
//    (ye ab real pages hain). */

// const SIMPLE_PAGES = {
//   promotions: ["Promotions & Offers", "Create property discounts, mobile offers, early-bird offers and limited-time deals."],
//   visibility_boost: ["Visibility Booster", "Improve property visibility with sponsored placement and performance campaigns."],
//   campaigns: ["Campaigns", "Manage seasonal campaigns and marketing participation."],
//   payments: ["Payments", "View settlements, payment status, deductions and payout history."],
//   sponsored: ["Sponsored Listing", "Boost your property ranking through paid sponsored placement."],
//   ratings_reviews: ["Ratings & Reviews", "Track guest ratings, review reasons and respond to guest feedback."],
//   events_bookings: ["Event Bookings", "View and manage bookings received for your events."],
//   vacationhouses_bookings: ["Vacation House Bookings", "Manage upcoming, completed and cancelled reservations."],
//   cruise_pricing: ["Pricing Management", "Set cabin prices and seasonal rates for your sailings."],
//   cruise_bookings: ["Cruise Bookings", "View and manage bookings received for your sailings."],
//   settings: ["Settings", "Manage your account preferences."],
// };

// const PROFILE_SECTIONS = {
//   profile_personal: "personal",
//   profile_business: "business",
//   profile_contact: "contact",
//   profile_tax: "tax",
//   profile_bank: "bank",
//   profile_service: "service",
// };

// // Ye pages apna heading khud dikhate hain, isliye layout ka heading chhupa do
// const SELF_HEADED_TABS = [
//   "dashboard",
//   "activities_manage",
//   "activities_schedule",
//   "activities_bookings",
//   "darshan_add",
//   "darshan_bookings",
// ];

// /* ==================== TAB -> PAGE MAP ==================== */

// const PAGES = {
//   // Hotel
//   hotels_manage: <VendorHotels />,
//   hotel_rooms: <VendorHotelRooms />,
//   hotel_room_inventory: <VendorRoomInventory />,
//   hotels_bookings: <VendorHotelBookings />,
//   // Homestay
//   homestays_manage: <VendorHomestay />,
//   homestay_units: <Homestayunitmanager />,
//   homestay_inventory: <VendorHomestayInventory />,
//   homestays_bookings: <VendorHomestayBookings />,
//   // Property info (shared)
//   property_media: <PropertyMedia />,
//   property_amenities: <PropertyAmenities />,
//   property_location: <PropertyLocation />,
//   property_policies: <PropertyPolicies />,
//   property_documents: <PropertyDocuments />,
//   property_highlights: <PropertyHighlights />,
//   analytics: <AnalyticsPage />,
//   // BnB / Apartments
//   bnb_manage: <VendorBnb />,
//   bnb_bookings: <BnbBooking />,
//   apartments_manage: <VendorApartment />,
//   // Cab
//   cabs_manage: <VendorCabs />,
//   cabs_drivers: <VendorCabDrivers />,
//   cabs_bookings: <VendorCabBookings />,
//   // Bus
//   buses_manage: <BusModule />,
//   bus_trip_module: <BusTripModule />,
//   bus_seat_layout: <BusSeatLayoutModule />,
//   buses_bookings: <VendorBusBookings />,
//   // Cruise
//   cruise_manage: <VendorCruise />,
//   cruise_add: <VendorCruise />,
//   cruise_cabins: <CabinManagement />,
//   cruise_itineraries: <CruiseItineraryManagement />,
//   cruise_sailings: <CruiseSailingManagement />,
//   // Tours
//   tours_manage: <Tours />,
//   tours_bookings: <TourBookings />,
//   tours_queries: <TourQuery />,
//   tours_reviews: <TourReview />,
//   tours_schedule: <TourSchedule />,
//   // Activities
//   activities_manage: <AddActivities />,
//   activities_schedule: <ScheduleActivities />,
//   activities_bookings: <ActivitiesBookings />,
//   // Events / Night club
//   events_manage: <ManageEvents />,
//   events_tickets: <EventTickets />,
//   nightclub_manage: <NightclubManagement />,
//   events_nightclub: <NightclubManagement />,
//   nightclub_tables: <NightclubTables />,
//   nightclub_table_pricing: <NightclubTablePricing />,
//   // Darshan
//   darshan_add: <AddDarshan />,
//   darshan_types: <Darshantype />,
//   darshan_slots: <Darshanslot />,
//   darshan_availability: <Darshanavailability />,
//   darshan_bookings: <DarshanBookings />,
//   // Others
//   vacationhouses_manage: <VendorVacationHouse />,
//   holidays_manage: <VendorHoliday />,
//   holidays_bookings: <VendorHolidayBookings />,
//   palace_manage: <Palaceapp />,
// };

// /* ==================== HELPERS ==================== */

// const pathTab = () => {
//   const p = typeof window !== "undefined" ? window.location.pathname : "";
//   if (p.includes("/vendor/cab/driver") || p.includes("/vendor/cab-driver")) return "cabs_drivers";
//   if (p.includes("/vendor/cab/booking")) return "cabs_bookings";
//   if (p.includes("/vendor/cab/manage")) return "cabs_manage";
//   if (p.includes("/vendor/darshan/add")) return "darshan_add";
//   if (p.includes("/vendor/darshan/types")) return "darshan_types";
//   if (p.includes("/vendor/darshan/slots")) return "darshan_slots";
//   if (p.includes("/vendor/darshan/availability")) return "darshan_availability";
//   if (p.includes("/vendor/darshan/bookings")) return "darshan_bookings";
//   return "";
// };

// const clearSession = () => {
//   localStorage.removeItem("vendorToken");
//   localStorage.removeItem("vendorUser");
//   sessionStorage.removeItem("bmtVendorActiveTab");
// };

// /* ==================== MAIN LAYOUT ==================== */

// export default function VendorLayout() {
//   const [activeTab, setActiveTab] = useState(() => pathTab() || sessionStorage.getItem("bmtVendorActiveTab") || "dashboard");
//   const [vendorName, setVendorName] = useState("");
//   const [vendorService, setVendorService] = useState("");
//   const [loading, setLoading] = useState(true);

//   // Session check + vendor info
//   useEffect(() => {
//     const token = localStorage.getItem("vendorToken");
//     const stored = localStorage.getItem("vendorUser");
//     if (!token || !stored) {
//       clearSession();
//       window.location.href = "/vendor-login";
//       return;
//     }
//     try {
//       const vendor = JSON.parse(stored);
//       const vertical = String(vendor.vertical || vendor.selectedVertical || "").trim().toLowerCase();
//       const staySubtype = String(vendor.staySubtype || (vertical === "stay" ? vendor.service : "") || "").trim().toLowerCase();
//       setVendorName(
//         vendor.business?.businessName ||
//           vendor.businessName ||
//           vendor.companyName ||
//           vendor.name ||
//           vendor.ownerName ||
//           vendor.email ||
//           "Vendor"
//       );
//       const resolvedService = vertical === "stay" ? staySubtype : vertical;
//       setVendorService(resolvedService);

//       // Cruise vendors should not land on a profile tab from a stale session
//       if (resolvedService === "cruise" && String(activeTab).startsWith("profile_")) {
//         setActiveTab("cruise_manage");
//         sessionStorage.setItem("bmtVendorActiveTab", "cruise_manage");
//       }
//     } catch (error) {
//       console.error("VENDOR SESSION ERROR:", error);
//       clearSession();
//       window.location.href = "/vendor-login";
//       return;
//     } finally {
//       setLoading(false);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const key = ALIASES[vendorService] || "partner";
//   const panel = PANELS[key];

//   const allIds = useMemo(
//     () => new Set([...panel.main, ...ACCOUNT].map((i) => i.id).concat(Object.keys(PROFILE_SECTIONS))),
//     [panel]
//   );
//   const tab = allIds.has(activeTab) ? activeTab : "dashboard";

//   useEffect(() => {
//     sessionStorage.setItem("bmtVendorActiveTab", tab);
//   }, [tab]);

//   const logout = () => {
//     if (window.confirm("Are you sure you want to logout?")) {
//       clearSession();
//       window.location.href = "/vendor-login";
//     }
//   };

//   const label = [...panel.main, ...ACCOUNT].find((i) => i.id === tab)?.label || "Dashboard";

//   const hideLayoutHeading = SELF_HEADED_TABS.includes(tab);

//   const renderContent = () => {
//     if (tab === "dashboard") {
//       return key === "cab"
//         ? <CabVendorDashboard onNavigate={setActiveTab} />
//         : <DashboardContent vendorService={vendorService} onNavigate={setActiveTab} />;
//     }
//     if (PROFILE_SECTIONS[tab]) return <VendorProfile initialSection={PROFILE_SECTIONS[tab]} />;
//     if (SIMPLE_PAGES[tab]) return <SimplePremiumPage title={SIMPLE_PAGES[tab][0]} description={SIMPLE_PAGES[tab][1]} />;
//     return PAGES[tab] || <DashboardContent vendorService={vendorService} onNavigate={setActiveTab} />;
//   };

//   if (loading) {
//     return (
//       <div className="bmt-loader">
//         <div className="bmt-loader-ring" />
//         <p>Loading BirdMyTrip Partner Panel...</p>
//       </div>
//     );
//   }

//   const NavButton = ({ item }) => (
//     <button
//       className={`vx-item ${tab === item.id ? "active" : ""}`}
//       onClick={() => setActiveTab(item.id)}
//       title={item.label}
//     >
//       <span className="vx-icon">{item.icon}</span>
//       <span className="vx-label">{item.label}</span>
//     </button>
//   );

//   return (
//     <div className="vx-app">
//       <div className="vx-side">
//         <div className="vx-brand-box">
//           <div className="vx-brandmark">{panel.icon}</div>
//           <div className="vx-brand-title"><strong>{panel.title}</strong><span>Vendor</span></div>
//         </div>

//         <div className="vx-nav">
//           <div className="vx-section">Main menu</div>
//           {panel.main.map((item) => <NavButton key={item.id} item={item} />)}
//           <div className="vx-section">Account</div>
//           {ACCOUNT.map((item) => <NavButton key={item.id} item={item} />)}
//         </div>

//         <div className="vx-side-foot">
//           <div className="vx-portal">
//             <span className="vx-portal-icon">▮</span>
//             <div><b>Vendor Portal</b><small>Manage your {panel.title.toLowerCase()} business</small></div>
//           </div>
//           <button className="vx-logout" onClick={logout}>
//             <span className="vx-icon">↪</span><span className="vx-label">Logout</span>
//           </button>
//         </div>
//       </div>

//       <div className="vx-main-wrap">
//         <div className="vx-top">
//           <div className="vx-brand">
//             <div className="vx-logo">bmt</div>
//             <div className="vx-brand-text">
//               <strong className="vx-name">{vendorName || "BirdMyTrip Partner"}</strong>
//               <div className="vx-sub-line"><span className="vx-pill">{panel.title}</span><span>BirdMyTrip Verified Partner</span></div>
//             </div>
//           </div>
//           <div className="vx-top-actions">
//             <button className="vx-help" aria-label="Help">?</button>
//             <button className="vx-user" onClick={() => setActiveTab("profile_personal")}>
//               <span className="vx-avatar">{(vendorName || "V").charAt(0).toUpperCase()}</span>
//               <span className="vx-user-text"><b>{vendorName || "Vendor"}</b><small>Partner</small></span>
//             </button>
//           </div>
//         </div>

//         {/* <div className="vx-main">
//           {!hideLayoutHeading && (
//             <div className="vx-heading"><h1>{label}</h1><p>BirdMyTrip Partner Panel / {label}</p></div>
//           )}
//           <div className="vx-content">{renderContent()}</div>
//         </div> */}
//         <div className="vx-main">
//   <div className="vx-content">
//     {renderContent()}
//   </div>
// </div>
//       </div>
//     </div>
//   );
// }

// /* ==================== PAGE COMPONENTS ==================== */

// function DashboardContent({ vendorService, onNavigate }) {
//   const isStay = ["hotel", "hotels", "homestay", "homestays", "home stay", "stay", "bnb"].includes(vendorService);
//   const bookingTarget = ["hotel", "hotels"].includes(vendorService) ? "hotels_bookings"
//     : ["homestay", "homestays"].includes(vendorService) ? "homestays_bookings"
//     : ["bus", "buses"].includes(vendorService) ? "buses_bookings"
//     : ["cab", "cabs"].includes(vendorService) ? "cabs_bookings"
//     : ["activity", "activities"].includes(vendorService) ? "activities_bookings"
//     : ["darshan", "darshans"].includes(vendorService) ? "darshan_bookings"
//     : "dashboard";
//   const inventoryTarget = ["hotel", "hotels"].includes(vendorService) ? "hotel_room_inventory"
//     : ["homestay", "homestays"].includes(vendorService) ? "homestay_inventory"
//     : ["activity", "activities"].includes(vendorService) ? "activities_manage"
//     : ["darshan", "darshans"].includes(vendorService) ? "darshan_availability"
//     : "dashboard";

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
//       <section className="bmt-performance-head">
//         <div className="bmt-title-line"><h1>Performance Overview</h1><span className="bmt-info-icon">?</span></div>
//         <p>Last updated just now</p>
//       </section>

//       <section className="bmt-analytics-banner">
//         <div>
//           <h2>{isStay ? "Property Analytics" : "Business Analytics"}</h2>
//           <p>See detailed analysis and past data for Revenue, Room Nights, Average Selling Price, Conversion, Bookings and more.</p>
//         </div>
//         <button onClick={() => onNavigate("analytics")}>View All</button>
//       </section>

//       <section className="bmt-metrics-grid">
//         {metrics.map((m) => (
//           <article className="bmt-metric-card" key={m.title}>
//             <h3>{m.title}</h3>
//             <div className="bmt-metric-value">{m.value}</div>
//             <p>{m.sub}</p>
//             <button onClick={() => onNavigate(m.action)}>View More</button>
//           </article>
//         ))}
//       </section>

//       {isStay && (
//         <section className="bmt-dashboard-bottom-grid">
//           <article className="bmt-panel-card">
//             <div className="bmt-card-header">
//               <div><h3>Property Setup</h3><p>Complete important property content</p></div>
//               <span className="bmt-new-badge">NEW</span>
//             </div>
//             <div className="bmt-action-list">
//               <button onClick={() => onNavigate("property_media")}><span>Add Images & Videos</span><b>›</b></button>
//               <button onClick={() => onNavigate("property_amenities")}><span>Update Amenities & Facilities</span><b>›</b></button>
//               <button onClick={() => onNavigate("property_policies")}><span>Review Property Policies</span><b>›</b></button>
//             </div>
//           </article>
//           <article className="bmt-panel-card">
//             <div className="bmt-card-header"><div><h3>Today's Snapshot</h3><p>Quick operational summary</p></div></div>
//             <div className="bmt-snapshot-grid">
//               <div><strong>0</strong><span>Pending</span></div>
//               <div><strong>0</strong><span>Confirmed</span></div>
//               <div><strong>0</strong><span>Cancelled</span></div>
//               <div><strong>0</strong><span>Completed</span></div>
//             </div>
//           </article>
//         </section>
//       )}
//     </div>
//   );
// }

// function Intro({ eyebrow, title, text, extra }) {
//   return (
//     <div className="bmt-section-intro">
//       <div><span className="bmt-eyebrow">{eyebrow}</span><h2>{title}</h2><p>{text}</p></div>
//       {extra}
//     </div>
//   );
// }

// function FormActions({ saveLabel }) {
//   return (
//     <div className="bmt-form-actions">
//       <button className="bmt-secondary-btn">Save Draft</button>
//       <button className="bmt-primary-btn">{saveLabel}</button>
//     </div>
//   );
// }

// function PropertyMedia() {
//   const [images, setImages] = useState([]);
//   const [videos, setVideos] = useState([]);
//   const [videoUrl, setVideoUrl] = useState("");
//   const toItems = (event) =>
//     Array.from(event.target.files || []).map((file) => ({ file, url: URL.createObjectURL(file), name: file.name }));

//   return (
//     <div className="bmt-premium-page">
//       <Intro
//         eyebrow="PROPERTY CONTENT"
//         title="Images & Videos"
//         text="Add high-quality property photos, room photos, exterior images, facilities, dining images and walkthrough videos."
//         extra={<span className="bmt-completion-pill">Media completeness 0%</span>}
//       />
//       <div className="bmt-property-grid">
//         <section className="bmt-form-card">
//           <div className="bmt-form-card-head"><h3>Property Images</h3><p>Recommended: minimum 8 clear landscape photos.</p></div>
//           <label className="bmt-upload-zone">
//             <input type="file" accept="image/*" multiple onChange={(e) => setImages((p) => [...p, ...toItems(e)])} />
//             <span className="bmt-upload-icon">＋</span>
//             <strong>Upload property images</strong>
//             <small>JPG, PNG, WEBP • Front view, rooms, lobby, washroom, dining and facilities</small>
//           </label>
//           {images.length > 0 && (
//             <div className="bmt-media-grid">
//               {images.map((img, i) => (
//                 <div className="bmt-media-item" key={`${img.name}-${i}`}>
//                   <img src={img.url} alt={img.name} />
//                   <button onClick={() => setImages((p) => p.filter((_, x) => x !== i))}>Remove</button>
//                 </div>
//               ))}
//             </div>
//           )}
//         </section>

//         <section className="bmt-form-card">
//           <div className="bmt-form-card-head"><h3>Property Videos</h3><p>Upload walkthrough videos or add a video URL.</p></div>
//           <label className="bmt-upload-zone compact">
//             <input type="file" accept="video/*" multiple onChange={(e) => setVideos((p) => [...p, ...toItems(e)])} />
//             <span className="bmt-upload-icon">▶</span>
//             <strong>Upload property video</strong>
//             <small>MP4 / WEBM recommended</small>
//           </label>
//           <div className="bmt-field-group">
//             <label>Video URL</label>
//             <div className="bmt-inline-input">
//               <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtube.com/... or property video URL" />
//               <button type="button">Add URL</button>
//             </div>
//           </div>
//           {videos.length > 0 && (
//             <div className="bmt-media-grid video-grid">
//               {videos.map((v, i) => (
//                 <div className="bmt-media-item" key={`${v.name}-${i}`}>
//                   <video src={v.url} controls />
//                   <button onClick={() => setVideos((p) => p.filter((_, x) => x !== i))}>Remove</button>
//                 </div>
//               ))}
//             </div>
//           )}
//         </section>
//       </div>
//     </div>
//   );
// }

// function PropertyAmenities() {
//   const amenities = [
//     "Free Wi-Fi", "Parking", "Air Conditioning", "Restaurant", "Room Service", "Swimming Pool", "Gym", "Spa",
//     "Airport Transfer", "24x7 Front Desk", "Power Backup", "Lift / Elevator", "Laundry", "Pet Friendly",
//     "Wheelchair Accessible", "EV Charging",
//   ];
//   const [selected, setSelected] = useState([]);
//   const toggle = (name) => setSelected((p) => (p.includes(name) ? p.filter((x) => x !== name) : [...p, name]));

//   return (
//     <div className="bmt-premium-page">
//       <Intro eyebrow="PROPERTY INFORMATION" title="Amenities & Facilities" text="Select all facilities available at the property." />
//       <section className="bmt-form-card">
//         <div className="bmt-check-grid">
//           {amenities.map((item) => (
//             <label className={`bmt-check-card ${selected.includes(item) ? "selected" : ""}`} key={item}>
//               <input type="checkbox" checked={selected.includes(item)} onChange={() => toggle(item)} />
//               <span>{item}</span>
//             </label>
//           ))}
//         </div>
//         <FormActions saveLabel="Save Amenities" />
//       </section>
//     </div>
//   );
// }

// function PropertyLocation() {
//   return (
//     <div className="bmt-premium-page">
//       <Intro eyebrow="PROPERTY INFORMATION" title="Location & Contact" text="Keep the exact map location and guest-facing contact details updated." />
//       <section className="bmt-form-card">
//         <div className="bmt-form-grid">
//           <Field label="Address line 1" placeholder="Property address" />
//           <Field label="Address line 2" placeholder="Area / Landmark" />
//           <Field label="City" placeholder="City" />
//           <Field label="State / Province" placeholder="State / Province" />
//           <Field label="Postal Code" placeholder="Postal code" />
//           <Field label="Country" placeholder="Country" />
//           <Field label="Latitude" placeholder="e.g. 27.4924" />
//           <Field label="Longitude" placeholder="e.g. 77.6737" />
//           <Field label="Property Phone" placeholder="+91..." />
//           <Field label="Property Email" placeholder="property@example.com" />
//         </div>
//         <div className="bmt-map-placeholder"><span>Map preview</span><small>Connect Google Maps / Mapbox later with your API key.</small></div>
//         <FormActions saveLabel="Save Location" />
//       </section>
//     </div>
//   );
// }

// function PropertyPolicies() {
//   return (
//     <div className="bmt-premium-page">
//       <Intro eyebrow="PROPERTY INFORMATION" title="Policies & House Rules" text="Define check-in, check-out, cancellation, child and guest rules." />
//       <section className="bmt-form-card">
//         <div className="bmt-form-grid">
//           <Field label="Check-in from" type="time" />
//           <Field label="Check-out until" type="time" />
//           <SelectField label="Children allowed?" options={["Yes", "No", "On request"]} />
//           <SelectField label="Pets allowed?" options={["No", "Yes", "On request"]} />
//           <SelectField label="Smoking" options={["Not allowed", "Designated area only", "Allowed"]} />
//           <SelectField label="Unmarried couples" options={["Allowed", "Not allowed", "Subject to ID verification"]} />
//         </div>
//         <div className="bmt-field-group"><label>Cancellation Policy</label><textarea rows="5" placeholder="Describe cancellation and no-show rules..." /></div>
//         <div className="bmt-field-group"><label>House Rules</label><textarea rows="5" placeholder="Add important guest rules..." /></div>
//         <FormActions saveLabel="Save Policies" />
//       </section>
//     </div>
//   );
// }

// function PropertyDocuments() {
//   const docs = ["Business Registration", "Tax Registration", "Property License", "Owner / Authorized ID", "Bank Proof", "Fire / Safety Certificate"];
//   return (
//     <div className="bmt-premium-page">
//       <Intro eyebrow="VERIFICATION" title="Documents & Verification" text="Upload and track documents required to keep your property live." />
//       <section className="bmt-form-card">
//         <div className="bmt-document-list">
//           {docs.map((doc) => (
//             <div className="bmt-document-row" key={doc}>
//               <div><strong>{doc}</strong><span>Not uploaded</span></div>
//               <label className="bmt-upload-small">Upload<input type="file" /></label>
//             </div>
//           ))}
//         </div>
//       </section>
//     </div>
//   );
// }

// function PropertyHighlights() {
//   const [highlights, setHighlights] = useState(["Near major attractions", "Family friendly"]);
//   const [value, setValue] = useState("");
//   const add = () => {
//     const next = value.trim();
//     if (!next) return;
//     setHighlights((p) => [...p, next]);
//     setValue("");
//   };

//   return (
//     <div className="bmt-premium-page">
//       <Intro eyebrow="CONTENT QUALITY" title="Highlights & USPs" text="Add the strongest reasons a guest should choose your property." />
//       <section className="bmt-form-card">
//         <div className="bmt-field-group">
//           <label>Property short description</label>
//           <textarea rows="6" placeholder="Write a clear, premium guest-facing property description..." />
//         </div>
//         <div className="bmt-field-group">
//           <label>Add highlight</label>
//           <div className="bmt-inline-input">
//             <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="e.g. 2 minutes from the beach" />
//             <button type="button" onClick={add}>Add</button>
//           </div>
//         </div>
//         <div className="bmt-chip-wrap">
//           {highlights.map((item, i) => (
//             <span className="bmt-chip" key={`${item}-${i}`}>
//               {item}
//               <button onClick={() => setHighlights((p) => p.filter((_, x) => x !== i))}>×</button>
//             </span>
//           ))}
//         </div>
//         <FormActions saveLabel="Save Content" />
//       </section>
//     </div>
//   );
// }

// function AnalyticsPage() {
//   const cards = [["Revenue", "₹0", "+0%"], ["Room Nights", "0", "+0%"], ["Average Selling Price", "₹0", "+0%"], ["Conversion", "0%", "+0%"]];
//   return (
//     <div className="bmt-premium-page">
//       <Intro eyebrow="PERFORMANCE" title="Analytics" text="Property performance overview for bookings, revenue and conversion." />
//       <div className="bmt-analytics-cards">
//         {cards.map(([title, value, trend]) => (
//           <article key={title}><span>{title}</span><strong>{value}</strong><small>{trend} vs previous period</small></article>
//         ))}
//       </div>
//       <section className="bmt-form-card">
//         <div className="bmt-chart-placeholder"><strong>Performance chart</strong><span>Connect this section to your analytics API data.</span></div>
//       </section>
//     </div>
//   );
// }

// function SimplePremiumPage({ title, description }) {
//   return (
//     <div className="bmt-premium-page">
//       <Intro eyebrow="BIRDMYTRIP PARTNER" title={title} text={description} />
//       <section className="bmt-form-card">
//         <div className="bmt-empty-state">
//           <div className="bmt-empty-icon">✦</div>
//           <h3>{title}</h3>
//           <p>Frontend section is ready. Connect this screen to the matching BirdMyTrip backend API when available.</p>
//           <button className="bmt-primary-btn">Get Started</button>
//         </div>
//       </section>
//     </div>
//   );
// }

// function Field({ label, placeholder, type = "text" }) {
//   return <div className="bmt-field-group"><label>{label}</label><input type={type} placeholder={placeholder} /></div>;
// }

// function SelectField({ label, options }) {
//   return (
//     <div className="bmt-field-group">
//       <label>{label}</label>
//       <select defaultValue=""><option value="" disabled>Select</option>{options.map((o) => <option key={o}>{o}</option>)}</select>
//     </div>
//   );
// }

import { useEffect, useMemo, useState } from "react";
import VendorHotels from "./VendorHotels";
import VendorCabs from "./VendorCabs";
import VendorCabDrivers from "./VendorCabDrivers";
import CabVendorDashboard from "./CabVendorDashboard";
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
import AddDarshan from "./darshan/AddDarshan";
import Darshantype from "./darshan/Darshantype";
import Darshanslot from "./darshan/Darshanslot";
import Darshanavailability from "./darshan/Darshanavailability";
import DarshanBookings from "./darshan/Vendordarshanbookings";
import VendorHoliday from "./VendorHoliday";
import VendorHolidayBookings from "./VendorHolidayBookings";
import VendorBnb from "./Bnbmanager";
import Palaceapp from "./Palaceapp";
import VendorVacationHouse from "./Vacationhouseapp";
import NightclubManagement from "./NightClub/NightclubManagement";
import NightclubTables from "./NightClub/Nightclubtables";
import NightclubTablePricing from "./NightClub/Nightclubtablepricing";
import ManageEvents from "./NightClub/ManageEvents";
import EventTickets from "./NightClub/EventTickets";
import { BnbBooking } from "./bnbBooking/BnbBooking";
import VendorProfile from "./VendorProfile";
import VendorCruise from "./VendorCruise";
import CabinManagement from "./CabinManagement";
import CruiseItineraryManagement from "./CruiseItineraryManagement";
import CruiseSailingManagement from "./CruiseSailingManagement";
import Tours from "./tours-activities/Tours";
import TourBookings from "./tours-activities/Tourbookings";
import TourQuery from "./tours-activities/TourQuery";
import TourReview from "./tours-activities/TourReview";
import TourSchedule from "./tours-activities/TourSchedule";
import AddActivities from "./Activities/AddActivities";
import ScheduleActivities from "./Activities/ScheduleActivities";
import ActivitiesBookings from "./Activities/ActivitiesBookings";
import "./VendorCruise.css";
import "./VendorLayout.css";

/* ==================== ICONS & MENU HELPERS ==================== */

const IC = {
  dash: "▦", book: "▤", inv: "▥", prop: "⌂", bed: "▭", img: "▧", star: "☆", pin: "⌖", doc: "▢",
  chart: "⌁", ship: "⚓", map: "◫", plus: "＋", price: "$", car: "◉", user: "☺", bus: "▣", seat: "▤",
  tour: "✈", ev: "◆", club: "♪", pray: "◇", gear: "⚙", crown: "♛",
  grow: "✦", pay: "◈", ad: "AD", eye: "◎", camp: "✦",
};
const L = (list) => list.map(([id, label, icon]) => ({ id, label, icon: IC[icon] }));

const D = ["dashboard", "Dashboard", "dash"];

// Property information tail (Hotel / Homestay)
const stayTail = [
  ["property_media", "Images & Videos", "img"],
  ["property_amenities", "Amenities & Facilities", "star"],
  ["property_location", "Location & Contact", "pin"],
  ["property_policies", "Policies & House Rules", "doc"],
  ["property_documents", "Documents & Verification", "doc"],
  ["property_highlights", "Highlights & USPs", "star"],
  ["ratings_reviews", "Ratings & Reviews", "star"],
  ["analytics", "Analytics", "chart"],
];

// Hotel-only "Grow your business" + payments + sponsored
const hotelGrow = [
  ["promotions", "Promotions & Offers", "grow"],
  ["visibility_boost", "Visibility Booster", "eye"],
  ["campaigns", "Campaigns", "camp"],
  ["payments", "Payments", "pay"],
  ["sponsored", "Sponsored Listing", "ad"],
];

/* ==================== PANELS (per vendor vertical) ==================== */

const PANELS = {
  hotel: {
    title: "Hotel",
    icon: IC.prop,
    main: L([
      D,
      ["hotels_bookings", "Bookings", "book"],
      ["hotel_room_inventory", "Rates & Inventory", "inv"],
      ...hotelGrow,
      ["hotels_manage", "Property Details", "prop"],
      ["hotel_rooms", "Rooms & Units", "bed"],
      ...stayTail,
    ]),
  },
  homestay: {
    title: "Homestay",
    icon: IC.prop,
    main: L([
      D,
      ["homestays_bookings", "Bookings", "book"],
      ["homestay_inventory", "Rates & Inventory", "inv"],
      ["homestays_manage", "Property Details", "prop"],
      ["homestay_units", "Units / Rooms", "bed"],
      ...stayTail,
    ]),
  },
  cruise: {
    title: "Cruise",
    icon: IC.ship,
    main: L([
      D,
      ["cruise_manage", "My Cruises", "ship"],
      ["cruise_cabins", "Cabin Management", "bed"],
      ["cruise_itineraries", "Itinerary Management", "map"],
      ["cruise_sailings", "Sailing Management", "ship"],
      ["cruise_pricing", "Pricing Management", "price"],
      ["cruise_add", "Add Cruise", "plus"],
      ["cruise_bookings", "Bookings", "book"],
    ]),
  },
  cab: {
    title: "Cab",
    icon: IC.car,
    main: L([
      D,
      ["cabs_manage", "Manage Cabs", "car"],
      ["cabs_drivers", "Driver Details", "user"],
      ["cabs_bookings", "Cab Bookings", "book"],
    ]),
  },
  bus: {
    title: "Bus",
    icon: IC.bus,
    main: L([
      D,
      ["buses_manage", "Manage Buses", "bus"],
      ["bus_trip_module", "Trip Management", "map"],
      ["bus_seat_layout", "Seat Layout", "seat"],
      ["buses_bookings", "Bus Bookings", "book"],
    ]),
  },
  tours: {
    title: "Tours",
    icon: IC.tour,
    main: L([
      D,
      ["tours_manage", "Manage Tours", "tour"],
      ["tours_bookings", "Tour Bookings", "book"],
      ["tours_queries", "Tour Queries", "doc"],
      ["tours_reviews", "Tour Reviews", "star"],
      ["tours_schedule", "Tour Schedules", "map"],
    ]),
  },
  activities: {
    title: "Activities",
    icon: IC.ev,
    main: L([
      D,
      ["activities_manage", "Manage Activities", "ev"],
      ["activities_schedule", "Activity Schedules", "map"],
      ["activities_bookings", "Activity Bookings", "book"],
    ]),
  },
  events: {
    title: "Events",
    icon: IC.ev,
    main: L([
      D,
      ["events_manage", "Manage Events", "ev"],
      ["events_tickets", "Event Tickets", "book"],
      ["events_nightclub", "Night Club", "club"],
      ["nightclub_tables", "Tables", "seat"],
      ["nightclub_table_pricing", "Table Pricing", "price"],
      ["events_bookings", "Event Bookings", "book"],
    ]),
  },
  nightclub: {
    title: "Night Club",
    icon: IC.club,
    main: L([
      D,
      ["nightclub_manage", "Manage Night Club", "club"],
      ["nightclub_tables", "Tables", "seat"],
      ["nightclub_table_pricing", "Table Pricing", "price"],
    ]),
  },
  darshan: {
    title: "Darshan",
    icon: IC.pray,
    main: L([
      D,
      ["darshan_add", "Add Darshan", "plus"],
      ["darshan_types", "Darshan Types", "tour"],
      ["darshan_slots", "Darshan Slots", "seat"],
      ["darshan_availability", "Slot Availability", "inv"],
      ["darshan_bookings", "Bookings", "book"],
    ]),
  },
  holidays: {
    title: "Holidays",
    icon: IC.tour,
    main: L([D, ["holidays_manage", "Manage Holidays", "tour"], ["holidays_bookings", "Holiday Bookings", "book"]]),
  },
  bnb: {
    title: "BnB",
    icon: IC.prop,
    main: L([D, ["bnb_manage", "Manage BnB", "prop"], ["bnb_bookings", "BnB Bookings", "book"]]),
  },
  palace: { title: "Palace", icon: IC.crown, main: L([D, ["palace_manage", "Manage Palace", "crown"]]) },
  vacation: {
    title: "Vacation House",
    icon: IC.prop,
    main: L([D, ["vacationhouses_manage", "Manage Houses", "prop"], ["vacationhouses_bookings", "Bookings", "book"]]),
  },
  apartments: {
    title: "Apartments",
    icon: IC.prop,
    main: L([D, ["apartments_manage", "Manage Apartments", "prop"]]),
  },
  partner: { title: "Partner", icon: IC.dash, main: L([D]) },
};

// Account section (all vendors) — full profile sub-sections included
const ACCOUNT = L([
  ["profile_personal", "My Profile", "user"],
  ["profile_business", "Business Details", "prop"],
  ["profile_contact", "Contact Details", "pin"],
  ["profile_tax", "Tax & Identity", "doc"],
  ["profile_bank", "Bank Details", "pay"],
  ["profile_service", "Service Details", "gear"],
  ["settings", "Settings", "gear"],
]);

// vendor.vertical / staySubtype  ->  panel key
const ALIASES = {
  hotel: "hotel", hotels: "hotel",
  homestay: "homestay", homestays: "homestay", "home stay": "homestay",
  cab: "cab", cabs: "cab", "car-rental": "cab",
  bus: "bus", buses: "bus",
  cruise: "cruise", cruises: "cruise",
  package: "tours", packages: "tours", tours: "tours", tour: "tours",
  activity: "activities", activities: "activities",
  events: "events", event: "events",
  stay: "bnb", bnb: "bnb",
  darshan: "darshan", darshans: "darshan", "bmt darshan": "darshan",
  vacation: "vacation", vacationhouse: "vacation", "vacation-home": "vacation",
  apartment: "apartments", apartments: "apartments",
  palace: "palace",
  holiday: "holidays", holidays: "holidays",
  nightclub: "nightclub", nightclubs: "nightclub", "night-club": "nightclub",
};

/* ==================== SIMPLE (placeholder) PAGES ==================== */
/* NOTE: yahan jo tab id hoga wo PAGES se PEHLE render hota hai.
   Isliye activities_*, darshan_*, nightclub_* yahan NAHI hone chahiye
   (ye real pages hain). */

const SIMPLE_PAGES = {
  promotions: ["Promotions & Offers", "Create property discounts, mobile offers, early-bird offers and limited-time deals."],
  visibility_boost: ["Visibility Booster", "Improve property visibility with sponsored placement and performance campaigns."],
  campaigns: ["Campaigns", "Manage seasonal campaigns and marketing participation."],
  payments: ["Payments", "View settlements, payment status, deductions and payout history."],
  sponsored: ["Sponsored Listing", "Boost your property ranking through paid sponsored placement."],
  ratings_reviews: ["Ratings & Reviews", "Track guest ratings, review reasons and respond to guest feedback."],
  events_bookings: ["Event Bookings", "View and manage bookings received for your events."],
  vacationhouses_bookings: ["Vacation House Bookings", "Manage upcoming, completed and cancelled reservations."],
  cruise_pricing: ["Pricing Management", "Set cabin prices and seasonal rates for your sailings."],
  cruise_bookings: ["Cruise Bookings", "View and manage bookings received for your sailings."],
  settings: ["Settings", "Manage your account preferences."],
};

const PROFILE_SECTIONS = {
  profile_personal: "personal",
  profile_business: "business",
  profile_contact: "contact",
  profile_tax: "tax",
  profile_bank: "bank",
  profile_service: "service",
};

/* ==================== TAB -> PAGE MAP ==================== */

const PAGES = {
  // Hotel
  hotels_manage: <VendorHotels />,
  hotel_rooms: <VendorHotelRooms />,
  hotel_room_inventory: <VendorRoomInventory />,
  hotels_bookings: <VendorHotelBookings />,
  // Homestay
  homestays_manage: <VendorHomestay />,
  homestay_units: <Homestayunitmanager />,
  homestay_inventory: <VendorHomestayInventory />,
  homestays_bookings: <VendorHomestayBookings />,
  // Property info (shared)
  property_media: <PropertyMedia />,
  property_amenities: <PropertyAmenities />,
  property_location: <PropertyLocation />,
  property_policies: <PropertyPolicies />,
  property_documents: <PropertyDocuments />,
  property_highlights: <PropertyHighlights />,
  analytics: <AnalyticsPage />,
  // BnB / Apartments
  bnb_manage: <VendorBnb />,
  bnb_bookings: <BnbBooking />,
  apartments_manage: <VendorApartment />,
  // Cab
  cabs_manage: <VendorCabs />,
  cabs_drivers: <VendorCabDrivers />,
  cabs_bookings: <VendorCabBookings />,
  // Bus
  buses_manage: <BusModule />,
  bus_trip_module: <BusTripModule />,
  bus_seat_layout: <BusSeatLayoutModule />,
  buses_bookings: <VendorBusBookings />,
  // Cruise
  cruise_manage: <VendorCruise />,
  cruise_add: <VendorCruise />,
  cruise_cabins: <CabinManagement />,
  cruise_itineraries: <CruiseItineraryManagement />,
  cruise_sailings: <CruiseSailingManagement />,
  // Tours
  tours_manage: <Tours />,
  tours_bookings: <TourBookings />,
  tours_queries: <TourQuery />,
  tours_reviews: <TourReview />,
  tours_schedule: <TourSchedule />,
  // Activities
  activities_manage: <AddActivities />,
  activities_schedule: <ScheduleActivities />,
  activities_bookings: <ActivitiesBookings />,
  // Events / Night club
  events_manage: <ManageEvents />,
  events_tickets: <EventTickets />,
  nightclub_manage: <NightclubManagement />,
  events_nightclub: <NightclubManagement />,
  nightclub_tables: <NightclubTables />,
  nightclub_table_pricing: <NightclubTablePricing />,
  // Darshan
  darshan_add: <AddDarshan />,
  darshan_types: <Darshantype />,
  darshan_slots: <Darshanslot />,
  darshan_availability: <Darshanavailability />,
  darshan_bookings: <DarshanBookings />,
  // Others
  vacationhouses_manage: <VendorVacationHouse />,
  holidays_manage: <VendorHoliday />,
  holidays_bookings: <VendorHolidayBookings />,
  palace_manage: <Palaceapp />,
};

/* ==================== HELPERS ==================== */

const pathTab = () => {
  const p = typeof window !== "undefined" ? window.location.pathname : "";
  if (p.includes("/vendor/cab/driver") || p.includes("/vendor/cab-driver")) return "cabs_drivers";
  if (p.includes("/vendor/cab/booking")) return "cabs_bookings";
  if (p.includes("/vendor/cab/manage")) return "cabs_manage";
  if (p.includes("/vendor/darshan/add")) return "darshan_add";
  if (p.includes("/vendor/darshan/types")) return "darshan_types";
  if (p.includes("/vendor/darshan/slots")) return "darshan_slots";
  if (p.includes("/vendor/darshan/availability")) return "darshan_availability";
  if (p.includes("/vendor/darshan/bookings")) return "darshan_bookings";
  if (p.includes("/vendor/nightclub/pricing")) return "nightclub_table_pricing";
  if (p.includes("/vendor/nightclub/tables")) return "nightclub_tables";
  return "";
};

const clearSession = () => {
  localStorage.removeItem("vendorToken");
  localStorage.removeItem("vendorUser");
  sessionStorage.removeItem("bmtVendorActiveTab");
};

/* ==================== MAIN LAYOUT ==================== */

export default function VendorLayout() {
  const [activeTab, setActiveTab] = useState(() => pathTab() || sessionStorage.getItem("bmtVendorActiveTab") || "dashboard");
  const [vendorName, setVendorName] = useState("");
  const [vendorService, setVendorService] = useState("");
  const [loading, setLoading] = useState(true);

  // Session check + vendor info
  useEffect(() => {
    const token = localStorage.getItem("vendorToken");
    const stored = localStorage.getItem("vendorUser");
    if (!token || !stored) {
      clearSession();
      window.location.href = "/vendor-login";
      return;
    }
    try {
      const vendor = JSON.parse(stored);
      const vertical = String(vendor.vertical || vendor.selectedVertical || "").trim().toLowerCase();
      const staySubtype = String(vendor.staySubtype || (vertical === "stay" ? vendor.service : "") || "").trim().toLowerCase();
      setVendorName(
        vendor.business?.businessName ||
          vendor.businessName ||
          vendor.companyName ||
          vendor.name ||
          vendor.ownerName ||
          vendor.email ||
          "Vendor"
      );
      const resolvedService = vertical === "stay" ? staySubtype : vertical;
      setVendorService(resolvedService);

      // Cruise vendors should not land on a profile tab from a stale session
      if (resolvedService === "cruise" && String(activeTab).startsWith("profile_")) {
        setActiveTab("cruise_manage");
        sessionStorage.setItem("bmtVendorActiveTab", "cruise_manage");
      }
    } catch (error) {
      console.error("VENDOR SESSION ERROR:", error);
      clearSession();
      window.location.href = "/vendor-login";
      return;
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const key = ALIASES[vendorService] || "partner";
  const panel = PANELS[key];

  const allIds = useMemo(
    () => new Set([...panel.main, ...ACCOUNT].map((i) => i.id).concat(Object.keys(PROFILE_SECTIONS))),
    [panel]
  );
  const tab = allIds.has(activeTab) ? activeTab : "dashboard";

  useEffect(() => {
    sessionStorage.setItem("bmtVendorActiveTab", tab);
  }, [tab]);

  const logout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      clearSession();
      window.location.href = "/vendor-login";
    }
  };

  const renderContent = () => {
    if (tab === "dashboard") {
      return key === "cab"
        ? <CabVendorDashboard onNavigate={setActiveTab} />
        : <DashboardContent vendorService={vendorService} onNavigate={setActiveTab} />;
    }
    if (PROFILE_SECTIONS[tab]) return <VendorProfile initialSection={PROFILE_SECTIONS[tab]} />;
    if (SIMPLE_PAGES[tab]) return <SimplePremiumPage title={SIMPLE_PAGES[tab][0]} description={SIMPLE_PAGES[tab][1]} />;
    return PAGES[tab] || <DashboardContent vendorService={vendorService} onNavigate={setActiveTab} />;
  };

  if (loading) {
    return (
      <div className="bmt-loader">
        <div className="bmt-loader-ring" />
        <p>Loading BirdMyTrip Partner Panel...</p>
      </div>
    );
  }

  const NavButton = ({ item }) => (
    <button
      className={`vx-item ${tab === item.id ? "active" : ""}`}
      onClick={() => setActiveTab(item.id)}
      title={item.label}
    >
      <span className="vx-icon">{item.icon}</span>
      <span className="vx-label">{item.label}</span>
    </button>
  );

  return (
    <div className="vx-app">
      <div className="vx-side">
        <div className="vx-brand-box">
          <div className="vx-brandmark">{panel.icon}</div>
          <div className="vx-brand-title"><strong>{panel.title}</strong><span>Vendor</span></div>
        </div>

        <div className="vx-nav">
          <div className="vx-section">Main menu</div>
          {panel.main.map((item) => <NavButton key={item.id} item={item} />)}
          <div className="vx-section">Account</div>
          {ACCOUNT.map((item) => <NavButton key={item.id} item={item} />)}
        </div>

        <div className="vx-side-foot">
          <div className="vx-portal">
            <span className="vx-portal-icon">▮</span>
            <div><b>Vendor Portal</b><small>Manage your {panel.title.toLowerCase()} business</small></div>
          </div>
          <button className="vx-logout" onClick={logout}>
            <span className="vx-icon">↪</span><span className="vx-label">Logout</span>
          </button>
        </div>
      </div>

      <div className="vx-main-wrap">
        <div className="vx-top">
          <div className="vx-brand">
            <div className="vx-logo">bmt</div>
            <div className="vx-brand-text">
              <strong className="vx-name">{vendorName || "BirdMyTrip Partner"}</strong>
              <div className="vx-sub-line"><span className="vx-pill">{panel.title}</span><span>BirdMyTrip Verified Partner</span></div>
            </div>
          </div>
          <div className="vx-top-actions">
            <button className="vx-help" aria-label="Help">?</button>
            <button className="vx-user" onClick={() => setActiveTab("profile_personal")}>
              <span className="vx-avatar">{(vendorName || "V").charAt(0).toUpperCase()}</span>
              <span className="vx-user-text"><b>{vendorName || "Vendor"}</b><small>Partner</small></span>
            </button>
          </div>
        </div>

        <div className="vx-main">
          <div className="vx-content">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==================== PAGE COMPONENTS ==================== */

function DashboardContent({ vendorService, onNavigate }) {
  const isStay = ["hotel", "hotels", "homestay", "homestays", "home stay", "stay", "bnb"].includes(vendorService);
  const bookingTarget = ["hotel", "hotels"].includes(vendorService) ? "hotels_bookings"
    : ["homestay", "homestays"].includes(vendorService) ? "homestays_bookings"
    : ["bus", "buses"].includes(vendorService) ? "buses_bookings"
    : ["cab", "cabs"].includes(vendorService) ? "cabs_bookings"
    : ["activity", "activities"].includes(vendorService) ? "activities_bookings"
    : ["darshan", "darshans"].includes(vendorService) ? "darshan_bookings"
    : "dashboard";
  const inventoryTarget = ["hotel", "hotels"].includes(vendorService) ? "hotel_room_inventory"
    : ["homestay", "homestays"].includes(vendorService) ? "homestay_inventory"
    : ["activity", "activities"].includes(vendorService) ? "activities_manage"
    : ["darshan", "darshans"].includes(vendorService) ? "darshan_availability"
    : ["nightclub", "nightclubs", "night-club"].includes(vendorService) ? "nightclub_table_pricing"
    : "dashboard";

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
      <section className="bmt-performance-head">
        <div className="bmt-title-line"><h1>Performance Overview</h1><span className="bmt-info-icon">?</span></div>
        <p>Last updated just now</p>
      </section>

      <section className="bmt-analytics-banner">
        <div>
          <h2>{isStay ? "Property Analytics" : "Business Analytics"}</h2>
          <p>See detailed analysis and past data for Revenue, Room Nights, Average Selling Price, Conversion, Bookings and more.</p>
        </div>
        <button onClick={() => onNavigate("analytics")}>View All</button>
      </section>

      <section className="bmt-metrics-grid">
        {metrics.map((m) => (
          <article className="bmt-metric-card" key={m.title}>
            <h3>{m.title}</h3>
            <div className="bmt-metric-value">{m.value}</div>
            <p>{m.sub}</p>
            <button onClick={() => onNavigate(m.action)}>View More</button>
          </article>
        ))}
      </section>

      {isStay && (
        <section className="bmt-dashboard-bottom-grid">
          <article className="bmt-panel-card">
            <div className="bmt-card-header">
              <div><h3>Property Setup</h3><p>Complete important property content</p></div>
              <span className="bmt-new-badge">NEW</span>
            </div>
            <div className="bmt-action-list">
              <button onClick={() => onNavigate("property_media")}><span>Add Images & Videos</span><b>›</b></button>
              <button onClick={() => onNavigate("property_amenities")}><span>Update Amenities & Facilities</span><b>›</b></button>
              <button onClick={() => onNavigate("property_policies")}><span>Review Property Policies</span><b>›</b></button>
            </div>
          </article>
          <article className="bmt-panel-card">
            <div className="bmt-card-header"><div><h3>Today's Snapshot</h3><p>Quick operational summary</p></div></div>
            <div className="bmt-snapshot-grid">
              <div><strong>0</strong><span>Pending</span></div>
              <div><strong>0</strong><span>Confirmed</span></div>
              <div><strong>0</strong><span>Cancelled</span></div>
              <div><strong>0</strong><span>Completed</span></div>
            </div>
          </article>
        </section>
      )}
    </div>
  );
}

function Intro({ eyebrow, title, text, extra }) {
  return (
    <div className="bmt-section-intro">
      <div><span className="bmt-eyebrow">{eyebrow}</span><h2>{title}</h2><p>{text}</p></div>
      {extra}
    </div>
  );
}

function FormActions({ saveLabel }) {
  return (
    <div className="bmt-form-actions">
      <button className="bmt-secondary-btn">Save Draft</button>
      <button className="bmt-primary-btn">{saveLabel}</button>
    </div>
  );
}

function PropertyMedia() {
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [videoUrl, setVideoUrl] = useState("");
  const toItems = (event) =>
    Array.from(event.target.files || []).map((file) => ({ file, url: URL.createObjectURL(file), name: file.name }));

  return (
    <div className="bmt-premium-page">
      <Intro
        eyebrow="PROPERTY CONTENT"
        title="Images & Videos"
        text="Add high-quality property photos, room photos, exterior images, facilities, dining images and walkthrough videos."
        extra={<span className="bmt-completion-pill">Media completeness 0%</span>}
      />
      <div className="bmt-property-grid">
        <section className="bmt-form-card">
          <div className="bmt-form-card-head"><h3>Property Images</h3><p>Recommended: minimum 8 clear landscape photos.</p></div>
          <label className="bmt-upload-zone">
            <input type="file" accept="image/*" multiple onChange={(e) => setImages((p) => [...p, ...toItems(e)])} />
            <span className="bmt-upload-icon">＋</span>
            <strong>Upload property images</strong>
            <small>JPG, PNG, WEBP • Front view, rooms, lobby, washroom, dining and facilities</small>
          </label>
          {images.length > 0 && (
            <div className="bmt-media-grid">
              {images.map((img, i) => (
                <div className="bmt-media-item" key={`${img.name}-${i}`}>
                  <img src={img.url} alt={img.name} />
                  <button onClick={() => setImages((p) => p.filter((_, x) => x !== i))}>Remove</button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bmt-form-card">
          <div className="bmt-form-card-head"><h3>Property Videos</h3><p>Upload walkthrough videos or add a video URL.</p></div>
          <label className="bmt-upload-zone compact">
            <input type="file" accept="video/*" multiple onChange={(e) => setVideos((p) => [...p, ...toItems(e)])} />
            <span className="bmt-upload-icon">▶</span>
            <strong>Upload property video</strong>
            <small>MP4 / WEBM recommended</small>
          </label>
          <div className="bmt-field-group">
            <label>Video URL</label>
            <div className="bmt-inline-input">
              <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtube.com/... or property video URL" />
              <button type="button">Add URL</button>
            </div>
          </div>
          {videos.length > 0 && (
            <div className="bmt-media-grid video-grid">
              {videos.map((v, i) => (
                <div className="bmt-media-item" key={`${v.name}-${i}`}>
                  <video src={v.url} controls />
                  <button onClick={() => setVideos((p) => p.filter((_, x) => x !== i))}>Remove</button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function PropertyAmenities() {
  const amenities = [
    "Free Wi-Fi", "Parking", "Air Conditioning", "Restaurant", "Room Service", "Swimming Pool", "Gym", "Spa",
    "Airport Transfer", "24x7 Front Desk", "Power Backup", "Lift / Elevator", "Laundry", "Pet Friendly",
    "Wheelchair Accessible", "EV Charging",
  ];
  const [selected, setSelected] = useState([]);
  const toggle = (name) => setSelected((p) => (p.includes(name) ? p.filter((x) => x !== name) : [...p, name]));

  return (
    <div className="bmt-premium-page">
      <Intro eyebrow="PROPERTY INFORMATION" title="Amenities & Facilities" text="Select all facilities available at the property." />
      <section className="bmt-form-card">
        <div className="bmt-check-grid">
          {amenities.map((item) => (
            <label className={`bmt-check-card ${selected.includes(item) ? "selected" : ""}`} key={item}>
              <input type="checkbox" checked={selected.includes(item)} onChange={() => toggle(item)} />
              <span>{item}</span>
            </label>
          ))}
        </div>
        <FormActions saveLabel="Save Amenities" />
      </section>
    </div>
  );
}

function PropertyLocation() {
  return (
    <div className="bmt-premium-page">
      <Intro eyebrow="PROPERTY INFORMATION" title="Location & Contact" text="Keep the exact map location and guest-facing contact details updated." />
      <section className="bmt-form-card">
        <div className="bmt-form-grid">
          <Field label="Address line 1" placeholder="Property address" />
          <Field label="Address line 2" placeholder="Area / Landmark" />
          <Field label="City" placeholder="City" />
          <Field label="State / Province" placeholder="State / Province" />
          <Field label="Postal Code" placeholder="Postal code" />
          <Field label="Country" placeholder="Country" />
          <Field label="Latitude" placeholder="e.g. 27.4924" />
          <Field label="Longitude" placeholder="e.g. 77.6737" />
          <Field label="Property Phone" placeholder="+91..." />
          <Field label="Property Email" placeholder="property@example.com" />
        </div>
        <div className="bmt-map-placeholder"><span>Map preview</span><small>Connect Google Maps / Mapbox later with your API key.</small></div>
        <FormActions saveLabel="Save Location" />
      </section>
    </div>
  );
}

function PropertyPolicies() {
  return (
    <div className="bmt-premium-page">
      <Intro eyebrow="PROPERTY INFORMATION" title="Policies & House Rules" text="Define check-in, check-out, cancellation, child and guest rules." />
      <section className="bmt-form-card">
        <div className="bmt-form-grid">
          <Field label="Check-in from" type="time" />
          <Field label="Check-out until" type="time" />
          <SelectField label="Children allowed?" options={["Yes", "No", "On request"]} />
          <SelectField label="Pets allowed?" options={["No", "Yes", "On request"]} />
          <SelectField label="Smoking" options={["Not allowed", "Designated area only", "Allowed"]} />
          <SelectField label="Unmarried couples" options={["Allowed", "Not allowed", "Subject to ID verification"]} />
        </div>
        <div className="bmt-field-group"><label>Cancellation Policy</label><textarea rows="5" placeholder="Describe cancellation and no-show rules..." /></div>
        <div className="bmt-field-group"><label>House Rules</label><textarea rows="5" placeholder="Add important guest rules..." /></div>
        <FormActions saveLabel="Save Policies" />
      </section>
    </div>
  );
}

function PropertyDocuments() {
  const docs = ["Business Registration", "Tax Registration", "Property License", "Owner / Authorized ID", "Bank Proof", "Fire / Safety Certificate"];
  return (
    <div className="bmt-premium-page">
      <Intro eyebrow="VERIFICATION" title="Documents & Verification" text="Upload and track documents required to keep your property live." />
      <section className="bmt-form-card">
        <div className="bmt-document-list">
          {docs.map((doc) => (
            <div className="bmt-document-row" key={doc}>
              <div><strong>{doc}</strong><span>Not uploaded</span></div>
              <label className="bmt-upload-small">Upload<input type="file" /></label>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function PropertyHighlights() {
  const [highlights, setHighlights] = useState(["Near major attractions", "Family friendly"]);
  const [value, setValue] = useState("");
  const add = () => {
    const next = value.trim();
    if (!next) return;
    setHighlights((p) => [...p, next]);
    setValue("");
  };

  return (
    <div className="bmt-premium-page">
      <Intro eyebrow="CONTENT QUALITY" title="Highlights & USPs" text="Add the strongest reasons a guest should choose your property." />
      <section className="bmt-form-card">
        <div className="bmt-field-group">
          <label>Property short description</label>
          <textarea rows="6" placeholder="Write a clear, premium guest-facing property description..." />
        </div>
        <div className="bmt-field-group">
          <label>Add highlight</label>
          <div className="bmt-inline-input">
            <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="e.g. 2 minutes from the beach" />
            <button type="button" onClick={add}>Add</button>
          </div>
        </div>
        <div className="bmt-chip-wrap">
          {highlights.map((item, i) => (
            <span className="bmt-chip" key={`${item}-${i}`}>
              {item}
              <button onClick={() => setHighlights((p) => p.filter((_, x) => x !== i))}>×</button>
            </span>
          ))}
        </div>
        <FormActions saveLabel="Save Content" />
      </section>
    </div>
  );
}

function AnalyticsPage() {
  const cards = [["Revenue", "₹0", "+0%"], ["Room Nights", "0", "+0%"], ["Average Selling Price", "₹0", "+0%"], ["Conversion", "0%", "+0%"]];
  return (
    <div className="bmt-premium-page">
      <Intro eyebrow="PERFORMANCE" title="Analytics" text="Property performance overview for bookings, revenue and conversion." />
      <div className="bmt-analytics-cards">
        {cards.map(([title, value, trend]) => (
          <article key={title}><span>{title}</span><strong>{value}</strong><small>{trend} vs previous period</small></article>
        ))}
      </div>
      <section className="bmt-form-card">
        <div className="bmt-chart-placeholder"><strong>Performance chart</strong><span>Connect this section to your analytics API data.</span></div>
      </section>
    </div>
  );
}

function SimplePremiumPage({ title, description }) {
  return (
    <div className="bmt-premium-page">
      <Intro eyebrow="BIRDMYTRIP PARTNER" title={title} text={description} />
      <section className="bmt-form-card">
        <div className="bmt-empty-state">
          <div className="bmt-empty-icon">✦</div>
          <h3>{title}</h3>
          <p>Frontend section is ready. Connect this screen to the matching BirdMyTrip backend API when available.</p>
          <button className="bmt-primary-btn">Get Started</button>
        </div>
      </section>
    </div>
  );
}

function Field({ label, placeholder, type = "text" }) {
  return <div className="bmt-field-group"><label>{label}</label><input type={type} placeholder={placeholder} /></div>;
}

function SelectField({ label, options }) {
  return (
    <div className="bmt-field-group">
      <label>{label}</label>
      <select defaultValue=""><option value="" disabled>Select</option>{options.map((o) => <option key={o}>{o}</option>)}</select>
    </div>
  );
}