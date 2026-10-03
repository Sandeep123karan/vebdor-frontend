// import React from "react";
// import { Routes, Route, Navigate } from "react-router-dom";
// import LandingPage from "./pages/LandingPage";
// import PartnerAuth from "./pages/PartnerAuth";
// import Onboarding from "./pages/Onboarding";
// import BusRegistration from "./pages/BusRegistration";
// import CabRegistration from "./pages/CabRegistration";
// import VendorLogin from "./pages/VendorLogin";
// import VendorLayout from "./pages/VendorLayout";
// import BusVendorLayout from "./pages/bus/BusVendorLayout";
// import "./pages/VendorCruise.css";
// import "./App.css";

// /* =========================================================
//    AUTH HELPERS
// ========================================================= */
// function getPartnerToken() {
//   return localStorage.getItem("token");
// }
// function getVendorToken() {
//   return localStorage.getItem("vendorToken");
// }
// function getVendorUser() {
//   try {
//     return JSON.parse(localStorage.getItem("vendorUser") || "{}");
//   } catch {
//     return {};
//   }
// }

// /* =========================================================
//    NORMALIZE VERTICAL
// ========================================================= */
// function normalizeVertical(value) {
//   const vertical = String(value || "").trim().toLowerCase();
//   const aliases = {
//     buses: "bus",
//     cabs: "cab",
//     package: "packages",
//     tours: "packages",
//     activity: "activities",
//     event: "events",
//     cruises: "cruise",
//     hotels: "stay",
//     hotel: "stay",
//     homestay: "stay",
//     resort: "stay",
//     villa: "stay",
//   };
//   return aliases[vertical] || vertical;
// }

// /* =========================================================
//    PARTNER SELECTED VERTICAL
// ========================================================= */
// function getPartnerSelectedVertical() {
//   let partnerUser = {};
//   try {
//     partnerUser = JSON.parse(localStorage.getItem("user") || "{}");
//   } catch {
//     partnerUser = {};
//   }
//   const value =
//     localStorage.getItem("selectedVertical") ||
//     localStorage.getItem("partnerSelectedVertical") ||
//     partnerUser?.selectedVertical ||
//     partnerUser?.vertical ||
//     partnerUser?.service ||
//     "";
//   return normalizeVertical(value);
// }

// /* =========================================================
//    REGISTRATION ROUTE RESOLVER
// ========================================================= */
// function getRegistrationRoute() {
//   const vertical = getPartnerSelectedVertical();
//   if (vertical === "bus") return "/bus-register";
//   if (vertical === "cab") return "/cab-register";
//   return "/onboarding";
// }

// /* =========================================================
//    PARTNER REGISTRATION GUARD
// ========================================================= */
// function ProtectedRegistrationRoute({ type }) {
//   const partnerToken = getPartnerToken();
//   if (!partnerToken) return <Navigate to="/signin" replace />;

//   const vertical = getPartnerSelectedVertical();
//   if (vertical === "bus") {
//     if (type !== "bus") return <Navigate to="/bus-register" replace />;
//     return <BusRegistration />;
//   }
//   if (vertical === "cab") {
//     if (type !== "cab") return <Navigate to="/cab-register" replace />;
//     return <CabRegistration />;
//   }
//   if (type === "bus" || type === "cab") {
//     return <Navigate to="/onboarding" replace />;
//   }
//   return <Onboarding />;
// }

// /* =========================================================
//    VENDOR DASHBOARD RESOLVER
// ========================================================= */
// function getVendorDashboard() {
//   const vendor = getVendorUser();
//   const vertical = normalizeVertical(
//     vendor?.vertical || vendor?.selectedVertical
//   );
//   if (vertical === "stay") {
//     const subtype = String(
//       vendor?.staySubtype ||
//         (vendor?.vertical === "stay" ? vendor?.service : "") ||
//         ""
//     )
//       .trim()
//       .toLowerCase();
//     if (subtype) return `/vendor/stay/${subtype}`;
//     return "/vendor";
//   }
//   const supportedVerticals = [
//     "bus",
//     "cab",
//     "packages",
//     "activities",
//     "events",
//     "darshan",
//     "cruise",
//     "nightclub",
//   ];
//   if (supportedVerticals.includes(vertical)) {
//     return `/vendor/${vertical}`;
//   }
//   return "/vendor";
// }

// /* =========================================================
//    VENDOR LOGIN ROUTE
// ========================================================= */
// function VendorLoginRoute() {
//   const vendorToken = getVendorToken();
//   if (vendorToken) return <Navigate to={getVendorDashboard()} replace />;
//   return <VendorLogin />;
// }

// /* =========================================================
//    VENDOR PROTECTED ROUTE
// ========================================================= */
// function ProtectedVendorRoute() {
//   const vendorToken = getVendorToken();
//   const vendor = getVendorUser();
//   if (!vendorToken || !vendor?._id) {
//     localStorage.removeItem("vendorToken");
//     localStorage.removeItem("vendorUser");
//     return <Navigate to="/vendor-login" replace />;
//   }
//   return <VendorLayout />;
// }

// /* =========================================================
//    BUS VENDOR PROTECTED ROUTE
// ========================================================= */
// function ProtectedBusVendorRoute() {
//   const vendorToken = getVendorToken();
//   const vendor = getVendorUser();
//   if (!vendorToken || !vendor?._id) {
//     localStorage.removeItem("vendorToken");
//     localStorage.removeItem("vendorUser");
//     return <Navigate to="/vendor-login" replace />;
//   }
//   const vertical = normalizeVertical(
//     vendor?.vertical || vendor?.selectedVertical
//   );
//   if (vertical !== "bus") {
//     return <Navigate to={getVendorDashboard()} replace />;
//   }
//   return <BusVendorLayout />;
// }

// /* =========================================================
//    CRUISE VENDOR PROTECTED ROUTE
// ========================================================= */
// function ProtectedCruiseVendorRoute() {
//   const vendorToken = getVendorToken();
//   const vendor = getVendorUser();
//   if (!vendorToken || !vendor?._id) {
//     localStorage.removeItem("vendorToken");
//     localStorage.removeItem("vendorUser");
//     return <Navigate to="/vendor-login" replace />;
//   }
//   const vertical = normalizeVertical(
//     vendor?.vertical || vendor?.selectedVertical
//   );
//   if (vertical !== "cruise") {
//     return <Navigate to={getVendorDashboard()} replace />;
//   }
//   return <VendorLayout />;
// }

// /* =========================================================
//    APP
// ========================================================= */
// function App() {
//   const partnerToken = getPartnerToken();
//   const vendorToken = getVendorToken();

//   return (
//     <Routes>
//       {/* HOME */}
//       <Route
//         path="/"
//         element={
//           vendorToken ? (
//             <Navigate to={getVendorDashboard()} replace />
//           ) : partnerToken ? (
//             <Navigate to={getRegistrationRoute()} replace />
//           ) : (
//             <LandingPage />
//           )
//         }
//       />

//       {/* PARTNER SIGNUP */}
//       <Route
//         path="/signup"
//         element={
//           partnerToken ? (
//             <Navigate to={getRegistrationRoute()} replace />
//           ) : (
//             <PartnerAuth mode="signup" />
//           )
//         }
//       />

//       {/* PARTNER SIGNIN */}
//       <Route
//         path="/signin"
//         element={
//           partnerToken ? (
//             <Navigate to={getRegistrationRoute()} replace />
//           ) : (
//             <PartnerAuth mode="signin" />
//           )
//         }
//       />

//       {/* ONBOARDING */}
//       <Route
//         path="/onboarding"
//         element={<ProtectedRegistrationRoute type="onboarding" />}
//       />

//       {/* BUS REGISTRATION */}
//       <Route
//         path="/bus-register"
//         element={<ProtectedRegistrationRoute type="bus" />}
//       />

//       {/* CAB REGISTRATION */}
//       <Route
//         path="/cab-register"
//         element={<ProtectedRegistrationRoute type="cab" />}
//       />

//       {/* VENDOR LOGIN */}
//       <Route path="/vendor-login" element={<VendorLoginRoute />} />

//       {/* VENDOR ROOT */}
//       <Route path="/vendor" element={<ProtectedVendorRoute />} />

//       {/* STAY */}
//       <Route path="/vendor/stay/:subtype" element={<ProtectedVendorRoute />} />

//       {/* BUS */}
//       <Route path="/vendor/bus/*" element={<ProtectedBusVendorRoute />} />

//       {/* CAB */}
//       <Route path="/vendor/cab" element={<ProtectedVendorRoute />} />
//       <Route path="/vendor/cab/*" element={<ProtectedVendorRoute />} />

//       {/* PACKAGES */}
//       <Route path="/vendor/packages" element={<ProtectedVendorRoute />} />

//       {/* ACTIVITIES */}
//       <Route path="/vendor/activities" element={<ProtectedVendorRoute />} />

//       {/* EVENTS */}
//       <Route path="/vendor/events" element={<ProtectedVendorRoute />} />

//       {/* DARSHAN */}
//       <Route path="/vendor/darshan" element={<ProtectedVendorRoute />} />

//       {/* CRUISE */}
//       <Route path="/vendor/cruise/*" element={<ProtectedCruiseVendorRoute />} />

//       {/* NIGHT CLUB */}
//       <Route path="/vendor/nightclub" element={<ProtectedVendorRoute />} />

//       {/* OLD URL SUPPORT */}
//       <Route path="/login" element={<Navigate to="/signin" replace />} />
//       <Route path="/registration" element={<Navigate to="/signup" replace />} />

//       {/* UNKNOWN */}
//       <Route path="*" element={<Navigate to="/" replace />} />
//     </Routes>
//   );
// }

// export default App;

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import PartnerAuth from "./pages/PartnerAuth";
import Onboarding from "./pages/Onboarding";
import BusRegistration from "./pages/BusRegistration";
import CabRegistration from "./pages/CabRegistration";
import VendorLogin from "./pages/VendorLogin";
import VendorLayout from "./pages/VendorLayout";
import BusVendorLayout from "./pages/bus/BusVendorLayout";
import "./pages/VendorCruise.css";
import "./App.css";

/* =========================================================
   AUTH HELPERS
========================================================= */
function getPartnerToken() {
  return localStorage.getItem("token");
}
function getVendorToken() {
  return localStorage.getItem("vendorToken");
}
function getVendorUser() {
  try {
    return JSON.parse(localStorage.getItem("vendorUser") || "{}");
  } catch {
    return {};
  }
}

/* =========================================================
   NORMALIZE VERTICAL
========================================================= */
function normalizeVertical(value) {
  const vertical = String(value || "").trim().toLowerCase();
  const aliases = {
    buses: "bus",
    cabs: "cab",
    package: "packages",
    tours: "packages",
    activity: "activities",
    event: "events",
    cruises: "cruise",
    hotels: "stay",
    hotel: "stay",
    homestay: "stay",
    resort: "stay",
    villa: "stay",
    darshans: "darshan",
    "bmt darshan": "darshan",
  };
  return aliases[vertical] || vertical;
}

/* =========================================================
   PARTNER SELECTED VERTICAL
========================================================= */
function getPartnerSelectedVertical() {
  let partnerUser = {};
  try {
    partnerUser = JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    partnerUser = {};
  }
  const value =
    localStorage.getItem("selectedVertical") ||
    localStorage.getItem("partnerSelectedVertical") ||
    partnerUser?.selectedVertical ||
    partnerUser?.vertical ||
    partnerUser?.service ||
    "";
  return normalizeVertical(value);
}

/* =========================================================
   REGISTRATION ROUTE RESOLVER
========================================================= */
function getRegistrationRoute() {
  const vertical = getPartnerSelectedVertical();
  if (vertical === "bus") return "/bus-register";
  if (vertical === "cab") return "/cab-register";
  return "/onboarding";
}

/* =========================================================
   PARTNER REGISTRATION GUARD
========================================================= */
function ProtectedRegistrationRoute({ type }) {
  const partnerToken = getPartnerToken();
  if (!partnerToken) return <Navigate to="/signin" replace />;

  const vertical = getPartnerSelectedVertical();
  if (vertical === "bus") {
    if (type !== "bus") return <Navigate to="/bus-register" replace />;
    return <BusRegistration />;
  }
  if (vertical === "cab") {
    if (type !== "cab") return <Navigate to="/cab-register" replace />;
    return <CabRegistration />;
  }
  if (type === "bus" || type === "cab") {
    return <Navigate to="/onboarding" replace />;
  }
  return <Onboarding />;
}

/* =========================================================
   VENDOR DASHBOARD RESOLVER
========================================================= */
function getVendorDashboard() {
  const vendor = getVendorUser();
  const vertical = normalizeVertical(
    vendor?.vertical || vendor?.selectedVertical
  );
  if (vertical === "stay") {
    const subtype = String(
      vendor?.staySubtype ||
        (vendor?.vertical === "stay" ? vendor?.service : "") ||
        ""
    )
      .trim()
      .toLowerCase();
    if (subtype) return `/vendor/stay/${subtype}`;
    return "/vendor";
  }
  const supportedVerticals = [
    "bus",
    "cab",
    "packages",
    "activities",
    "events",
    "darshan",
    "cruise",
    "nightclub",
  ];
  if (supportedVerticals.includes(vertical)) {
    return `/vendor/${vertical}`;
  }
  return "/vendor";
}

/* =========================================================
   VENDOR LOGIN ROUTE
========================================================= */
function VendorLoginRoute() {
  const vendorToken = getVendorToken();
  if (vendorToken) return <Navigate to={getVendorDashboard()} replace />;
  return <VendorLogin />;
}

/* =========================================================
   VENDOR PROTECTED ROUTE
========================================================= */
function ProtectedVendorRoute() {
  const vendorToken = getVendorToken();
  const vendor = getVendorUser();
  if (!vendorToken || !vendor?._id) {
    localStorage.removeItem("vendorToken");
    localStorage.removeItem("vendorUser");
    return <Navigate to="/vendor-login" replace />;
  }
  return <VendorLayout />;
}

/* =========================================================
   BUS VENDOR PROTECTED ROUTE
========================================================= */
function ProtectedBusVendorRoute() {
  const vendorToken = getVendorToken();
  const vendor = getVendorUser();
  if (!vendorToken || !vendor?._id) {
    localStorage.removeItem("vendorToken");
    localStorage.removeItem("vendorUser");
    return <Navigate to="/vendor-login" replace />;
  }
  const vertical = normalizeVertical(
    vendor?.vertical || vendor?.selectedVertical
  );
  if (vertical !== "bus") {
    return <Navigate to={getVendorDashboard()} replace />;
  }
  return <BusVendorLayout />;
}

/* =========================================================
   CRUISE VENDOR PROTECTED ROUTE
========================================================= */
function ProtectedCruiseVendorRoute() {
  const vendorToken = getVendorToken();
  const vendor = getVendorUser();
  if (!vendorToken || !vendor?._id) {
    localStorage.removeItem("vendorToken");
    localStorage.removeItem("vendorUser");
    return <Navigate to="/vendor-login" replace />;
  }
  const vertical = normalizeVertical(
    vendor?.vertical || vendor?.selectedVertical
  );
  if (vertical !== "cruise") {
    return <Navigate to={getVendorDashboard()} replace />;
  }
  return <VendorLayout />;
}

/* =========================================================
   APP
========================================================= */
function App() {
  const partnerToken = getPartnerToken();
  const vendorToken = getVendorToken();

  return (
    <Routes>
      {/* HOME */}
      <Route
        path="/"
        element={
          vendorToken ? (
            <Navigate to={getVendorDashboard()} replace />
          ) : partnerToken ? (
            <Navigate to={getRegistrationRoute()} replace />
          ) : (
            <LandingPage />
          )
        }
      />

      {/* PARTNER SIGNUP */}
      <Route
        path="/signup"
        element={
          partnerToken ? (
            <Navigate to={getRegistrationRoute()} replace />
          ) : (
            <PartnerAuth mode="signup" />
          )
        }
      />

      {/* PARTNER SIGNIN */}
      <Route
        path="/signin"
        element={
          partnerToken ? (
            <Navigate to={getRegistrationRoute()} replace />
          ) : (
            <PartnerAuth mode="signin" />
          )
        }
      />

      {/* ONBOARDING */}
      <Route
        path="/onboarding"
        element={<ProtectedRegistrationRoute type="onboarding" />}
      />

      {/* BUS REGISTRATION */}
      <Route
        path="/bus-register"
        element={<ProtectedRegistrationRoute type="bus" />}
      />

      {/* CAB REGISTRATION */}
      <Route
        path="/cab-register"
        element={<ProtectedRegistrationRoute type="cab" />}
      />

      {/* VENDOR LOGIN */}
      <Route path="/vendor-login" element={<VendorLoginRoute />} />

      {/* VENDOR ROOT */}
      <Route path="/vendor" element={<ProtectedVendorRoute />} />

      {/* STAY */}
      <Route path="/vendor/stay/:subtype" element={<ProtectedVendorRoute />} />

      {/* BUS */}
      <Route path="/vendor/bus/*" element={<ProtectedBusVendorRoute />} />

      {/* CAB */}
      <Route path="/vendor/cab" element={<ProtectedVendorRoute />} />
      <Route path="/vendor/cab/*" element={<ProtectedVendorRoute />} />

      {/* PACKAGES */}
      <Route path="/vendor/packages" element={<ProtectedVendorRoute />} />

      {/* ACTIVITIES */}
      <Route path="/vendor/activities" element={<ProtectedVendorRoute />} />

      {/* EVENTS */}
      <Route path="/vendor/events" element={<ProtectedVendorRoute />} />

      {/* DARSHAN (/vendor/darshan, /vendor/darshan/add, /vendor/darshan/manage) */}
      <Route path="/vendor/darshan" element={<ProtectedVendorRoute />} />
      <Route path="/vendor/darshan/*" element={<ProtectedVendorRoute />} />

      {/* CRUISE */}
      <Route path="/vendor/cruise/*" element={<ProtectedCruiseVendorRoute />} />

      {/* NIGHT CLUB */}
      <Route path="/vendor/nightclub" element={<ProtectedVendorRoute />} />

      {/* OLD URL SUPPORT */}
      <Route path="/login" element={<Navigate to="/signin" replace />} />
      <Route path="/registration" element={<Navigate to="/signup" replace />} />

      {/* UNKNOWN */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;