import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";
import "./Onboarding.css";

/* =====================================================
   API
===================================================== */

const API_BASE =
  process.env.REACT_APP_API_URL ||
  "http://localhost:7000";

/*
  ONBOARDING AUTH SYSTEM
  ----------------------
  Is page par Vendor Auth APIs hi use hongi.
*/
const SIGNUP_URL =
  `${API_BASE}/api/vendor/auth/signup`;



/* =====================================================
   OPTIONS
===================================================== */

const COUNTRIES = [
  {
    id: "india",
    name: "India",
    code: "IN",
    currency: "INR",
    phone: "+91",
    timezone: "Asia/Kolkata",
  },
  {
    id: "uae",
    name: "United Arab Emirates",
    code: "AE",
    currency: "AED",
    phone: "+971",
    timezone: "Asia/Dubai",
  },
  {
    id: "singapore",
    name: "Singapore",
    code: "SG",
    currency: "SGD",
    phone: "+65",
    timezone: "Asia/Singapore",
  },
  {
    id: "usa",
    name: "United States",
    code: "US",
    currency: "USD",
    phone: "+1",
    timezone: "America/New_York",
  },
  {
    id: "uk",
    name: "United Kingdom",
    code: "GB",
    currency: "GBP",
    phone: "+44",
    timezone: "Europe/London",
  },
  {
    id: "thailand",
    name: "Thailand",
    code: "TH",
    currency: "THB",
    phone: "+66",
    timezone: "Asia/Bangkok",
  },
  {
    id: "indonesia",
    name: "Indonesia",
    code: "ID",
    currency: "IDR",
    phone: "+62",
    timezone: "Asia/Jakarta",
  },
  {
    id: "australia",
    name: "Australia",
    code: "AU",
    currency: "AUD",
    phone: "+61",
    timezone: "Australia/Sydney",
  },
];

const BUSINESS_TYPES = [
  "Individual Owner",
  "Sole Proprietorship",
  "Partnership",
  "LLP",
  "Private Company",
  "Public Company",
  "Corporation",
  "Agency",
  "DMC",
  "Property Group",
  "Transport Operator",
  "Fleet Owner",
  "Activity Operator",
  "Event Organizer",
  "Cruise Operator",
  "Religious / Temple Trust",
  "Non-profit / Foundation",
  "Government / Public Authority",
  "Other",
];

/* Backend enum values for the labels shown above. */
const BUSINESS_TYPE_VALUES = {
  "Individual Owner": "individual-owner",
  "Sole Proprietorship": "sole-proprietorship",
  Partnership: "partnership",
  LLP: "llp",
  "Private Company": "private-limited",
  "Public Company": "public-limited",
  Corporation: "corporation",
  Agency: "agency",
  DMC: "dmc",
  "Property Group": "hotel-property-group",
  "Transport Operator": "transport-operator",
  "Fleet Owner": "fleet-owner",
  "Activity Operator": "activity-operator",
  "Event Organizer": "event-organizer",
  "Cruise Operator": "cruise-operator",
  "Religious / Temple Trust": "religious-darshan-operator",
  "Non-profit / Foundation": "non-profit",
  "Government / Public Authority": "government",
  Other: "other",
};

const VERTICALS = [
  {
    id: "stay",
    name: "Stay",
    description:
      "Hotels, resorts, villas, homestays and accommodation",
    icon: "🏨",
  },
  {
    id: "bus",
    name: "Bus",
    description:
      "Bus operators, routes, fleet and scheduled trips",
    icon: "🚌",
  },
  {
    id: "cab",
    name: "Cab",
    description:
      "Cab, taxi, rental and transfer operators",
    icon: "🚕",
  },
  {
    id: "packages",
    name: "Tours",
    description:
      "Holiday packages, tours and DMC services",
    icon: "🧳",
  },
  {
    id: "activities",
    name: "Activities",
    description:
      "Experiences, attractions and activities",
    icon: "🎟️",
  },
  {
    id: "events",
    name: "Events",
    description:
      "Events, nightlife and ticketed experiences",
    icon: "🎉",
  },
  {
    id: "darshan",
    name: "Darshan",
    description:
      "Temple, religious and spiritual experiences",
    icon: "🛕",
  },
  {
    id: "cruise",
    name: "Cruise",
    description:
      "Cruise operators, ships and cabins",
    icon: "🚢",
  },
];

const SUBTYPES = {
  stay: [
    { id: "hotel", name: "Hotel" },
    { id: "resort", name: "Resort" },
    { id: "homestay", name: "Homestay" },
    { id: "villa", name: "Villa" },
    { id: "apartment", name: "Apartment" },
    { id: "hostel", name: "Hostel" },
    { id: "motel", name: "Motel" },
    { id: "guesthouse", name: "Guest House" },
    { id: "vacation-home", name: "Vacation Home" },
    { id: "palace", name: "Palace" },
    { id: "campsite", name: "Campsite" },
    { id: "farmhouse", name: "Farm Stay / Farmhouse" },
    { id: "bnb", name: "B&B" },
    { id: "lodge", name: "Lodge" },
    { id: "inn", name: "Inn" },
    {
      id: "serviced-apartment",
      name: "Serviced Apartment",
    },
    { id: "camp", name: "Camp" },
  ],

  bus: [
    {
      id: "intercity-bus-operator",
      name: "Intercity Bus Operator",
    },
    {
      id: "tourist-bus-operator",
      name: "Tourist Bus Operator",
    },
    {
      id: "shuttle-operator",
      name: "Shuttle Operator",
    },
    {
      id: "sleeper-bus-operator",
      name: "Sleeper Bus Operator",
    },
    {
      id: "luxury-coach-operator",
      name: "Luxury Coach Operator",
    },
  ],

  cab: [
    {
      id: "independent-cab-owner",
      name: "Independent Cab Owner",
    },
    {
      id: "fleet-owner",
      name: "Fleet Owner",
    },
    {
      id: "airport-transfer-operator",
      name: "Airport Transfer Operator",
    },
    {
      id: "car-rental-operator",
      name: "Car Rental Operator",
    },
    {
      id: "chauffeur-service",
      name: "Chauffeur Service",
    },
  ],

  packages: [
    { id: "tour-operator", name: "Tour Operator" },
    { id: "travel-agency", name: "Travel Agency" },
    { id: "dmc", name: "DMC" },
    {
      id: "inbound-tour-operator",
      name: "Inbound Tour Operator",
    },
    {
      id: "outbound-tour-operator",
      name: "Outbound Tour Operator",
    },
  ],

  activities: [
    {
      id: "activity-operator",
      name: "Activity Operator",
    },
    { id: "attraction", name: "Attraction" },
    {
      id: "adventure-operator",
      name: "Adventure Operator",
    },
    {
      id: "experience-host",
      name: "Experience Host",
    },
  ],

  events: [
    {
      id: "event-organizer",
      name: "Event Organizer",
    },
    {
      id: "nightlife-venue",
      name: "Nightlife Venue",
    },
    {
      id: "concert-organizer",
      name: "Concert Organizer",
    },
    {
      id: "festival-organizer",
      name: "Festival Organizer",
    },
  ],

  darshan: [
    { id: "temple-trust", name: "Temple Trust" },
    {
      id: "religious-operator",
      name: "Religious Operator",
    },
    {
      id: "darshan-service-provider",
      name: "Darshan Service Provider",
    },
    {
      id: "pilgrimage-operator",
      name: "Pilgrimage Operator",
    },
  ],

  cruise: [
    { id: "cruise-line", name: "Cruise Line" },
    {
      id: "cruise-operator",
      name: "Cruise Operator",
    },
    { id: "river-cruise", name: "River Cruise" },
    {
      id: "yacht-operator",
      name: "Yacht Operator",
    },
  ],
};

const STEPS = [
  { id: 1, key: "country", title: "Country" },
  {
    id: 2,
    key: "businessType",
    title: "Business Type",
  },
  {
    id: 3,
    key: "vertical",
    title: "Choose Vertical",
  },
  {
    id: 4,
    key: "subtype",
    title: "Choose Subtype",
  },
  {
    id: 5,
    key: "basics",
    title: "Property Basics",
  },
  {
    id: 6,
    key: "location",
    title: "Location",
  },
  {
    id: 7,
    key: "classification",
    title: "Classification",
  },
  {
    id: 8,
    key: "units",
    title: "Rooms & Units",
  },
  {
    id: 9,
    key: "amenities",
    title: "Amenities & Services",
  },
  {
    id: 10,
    key: "policies",
    title: "Rules & Policies",
  },
  {
    id: 11,
    key: "photos",
    title: "Photos & Videos",
  },
  {
    id: 12,
    key: "kyc",
    title: "Owner / KYC",
  },
  {
    id: 13,
    key: "documents",
    title: "Documents",
  },
  {
    id: 14,
    key: "media",
    title: "Media",
  },
  {
    id: 15,
    key: "bank",
    title: "Bank & Payout",
  },
  {
    id: 16,
    key: "tax",
    title: "Tax",
  },
  {
    id: 17,
    key: "contract",
    title: "Contract",
  },
  {
    id: 18,
    key: "review",
    title: "Review & Submit",
  },
];

/* =====================================================
   LOCAL STORAGE
===================================================== */

const DRAFT_KEY_PREFIX = "bmtPartnerOnboardingDraft";
const VERTICAL_KEY_PREFIX = "bmtPartnerSelectedVertical";

function decodePartnerToken() {
  try {
    const token = localStorage.getItem("token") || "";
    const part = token.split(".")[1];
    if (!part) return {};
    const normalized = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    return JSON.parse(decodeURIComponent(escape(atob(padded))));
  } catch {
    return {};
  }
}

function getPartnerAccount() {
  let storedUser = {};
  try {
    storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    storedUser = {};
  }

  const claims = decodePartnerToken();
  const id = String(
    claims.id || claims._id || claims.userId || claims.partnerId || claims.sub ||
    storedUser._id || storedUser.id || storedUser.userId || storedUser.partnerId || ""
  ).trim();
  const email = String(
    claims.email || storedUser.email || storedUser.businessEmail || ""
  ).trim().toLowerCase();

  // Token/user identity scopes browser drafts to the signed-in Partner account.
  const identity = id || email;
  return { id, email, identity };
}

function storageSafeIdentity(value) {
  return encodeURIComponent(String(value || "").trim().toLowerCase());
}

function getDraftKey() {
  const { identity } = getPartnerAccount();
  return identity
    ? `${DRAFT_KEY_PREFIX}:${storageSafeIdentity(identity)}`
    : `${DRAFT_KEY_PREFIX}:anonymous`;
}

function getVerticalKey() {
  const { identity } = getPartnerAccount();
  return identity
    ? `${VERTICAL_KEY_PREFIX}:${storageSafeIdentity(identity)}`
    : `${VERTICAL_KEY_PREFIX}:anonymous`;
}

function loadDraft() {
  try {
    return JSON.parse(localStorage.getItem(getDraftKey()) || "{}");
  } catch {
    return {};
  }
}

function normalizeStoredSubtype(value) {
  if (!value) return "";

  const raw = String(value)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");

  const aliases = {
    "guest-house": "guesthouse",
    "vacation-home": "vacation-home",
    campsite: "campsite",
    camp: "campsite",
    "other-accommodation": "other",
  };

  return aliases[raw] || raw;
}

/* =====================================================
   MAIN
===================================================== */

export default function Onboarding() {
  const navigate = useNavigate();

  const location = useLocation();

  const savedDraft = useMemo(
    () => loadDraft(),
    []
  );

  const [
    currentStep,
    setCurrentStep,
  ] = useState(
    Number(savedDraft.currentStep || 1)
  );

  const [
    profileLoading,
    setProfileLoading,
  ] = useState(true);

  const [
    currentVendor,
    setCurrentVendor,
  ] = useState(null);

  const [
    form,
    setForm,
  ] = useState({
    country:
      savedDraft.country || "",

    businessType:
      savedDraft.businessType || "",

    vertical:
      savedDraft.vertical ||
      localStorage.getItem(getVerticalKey()) ||
      "",

    subtype:
      normalizeStoredSubtype(
        savedDraft.subtype || ""
      ),

    businessName:
      savedDraft.businessName || "",

    legalBusinessName:
      savedDraft.legalBusinessName ||
      "",

    propertyName:
      savedDraft.propertyName || "",

    displayName:
      savedDraft.displayName || "",

    businessRegistrationNumber:
      savedDraft.businessRegistrationNumber ||
      "",

    businessLicenseNumber:
      savedDraft.businessLicenseNumber ||
      "",

    website:
      savedDraft.website || "",

    addressLine1:
      savedDraft.addressLine1 ||
      savedDraft.address ||
      "",

    addressLine2:
      savedDraft.addressLine2 || "",

    locality:
      savedDraft.locality || "",

    landmark:
      savedDraft.landmark || "",

    city:
      savedDraft.city || "",

    district:
      savedDraft.district || "",

    state:
      savedDraft.state || "",

    postalCode:
      savedDraft.postalCode || "",

    timezone:
      savedDraft.timezone || "",

    latitude:
      savedDraft.latitude || "",

    longitude:
      savedDraft.longitude || "",

    classification:
      savedDraft.classification || "",

    starRating:
      savedDraft.starRating || "",

    totalUnits:
      savedDraft.totalUnits || "",

    totalRooms:
      savedDraft.totalRooms || "",

    totalFloors:
      savedDraft.totalFloors || "",

    totalBuildings:
      savedDraft.totalBuildings || "",

    maximumGuests:
      savedDraft.maximumGuests || "",

    unitType:
      savedDraft.unitType || "",

    amenities:
      savedDraft.amenities || [],

    customAmenities:
      savedDraft.customAmenities || "",

    checkInFrom:
      savedDraft.checkInFrom ||
      savedDraft.checkIn ||
      "14:00",

    checkOutUntil:
      savedDraft.checkOutUntil ||
      savedDraft.checkOut ||
      "11:00",

    frontDesk24Hours:
      Boolean(
        savedDraft.frontDesk24Hours
      ),

    selfCheckIn:
      Boolean(savedDraft.selfCheckIn),

    wifiAvailable:
      Boolean(savedDraft.wifiAvailable),

    freeWifi:
      Boolean(savedDraft.freeWifi),

    parkingAvailable:
      Boolean(
        savedDraft.parkingAvailable
      ),

    restaurantAvailable:
      Boolean(
        savedDraft.restaurantAvailable
      ),

    breakfastAvailable:
      Boolean(
        savedDraft.breakfastAvailable
      ),

    airportTransferAvailable:
      Boolean(
        savedDraft.airportTransferAvailable
      ),

    childrenAllowed:
      savedDraft.childrenAllowed !==
      undefined
        ? Boolean(
            savedDraft.childrenAllowed
          )
        : true,

    petsAllowed:
      Boolean(savedDraft.petsAllowed),

    smokingAllowed:
      Boolean(
        savedDraft.smokingAllowed
      ),

    cancellationPolicy:
      savedDraft.cancellationPolicy ||
      "",

    noShowPolicy:
      savedDraft.noShowPolicy || "",

    modificationPolicy:
      savedDraft.modificationPolicy ||
      "",

    paymentPolicy:
      savedDraft.paymentPolicy || "",

    ownerName:
      savedDraft.ownerName || "",

    ownerPhone:
      savedDraft.ownerPhone || "",

    governmentIdType:
      savedDraft.governmentIdType ||
      savedDraft.ownerIdType ||
      "",

    governmentIdNumber:
      savedDraft.governmentIdNumber ||
      "",

    propertyRegistrationNumber:
      savedDraft.propertyRegistrationNumber ||
      "",

    tourismLicenseNumber:
      savedDraft.tourismLicenseNumber ||
      "",

    fireSafetyCertificateNumber:
      savedDraft.fireSafetyCertificateNumber ||
      "",

    foodLicenseNumber:
      savedDraft.foodLicenseNumber ||
      "",

    logo:
      savedDraft.logo || "",

    coverImage:
      savedDraft.coverImage || "",

    propertyImages:
      savedDraft.propertyImages || [],

    videos:
      savedDraft.videos || [],

    bankCountry:
      savedDraft.bankCountry || "",

    bankCurrency:
      savedDraft.bankCurrency || "",

    bankName:
      savedDraft.bankName || "",

    branchName:
      savedDraft.branchName || "",

    accountHolderName:
      savedDraft.accountHolderName ||
      savedDraft.accountHolder ||
      "",

    accountNumber:
      savedDraft.accountNumber || "",

    confirmAccountNumber:
      savedDraft.confirmAccountNumber ||
      "",

    ifscCode:
      savedDraft.ifscCode || "",

    iban:
      savedDraft.iban || "",

    swiftCode:
      savedDraft.swiftCode || "",

    routingNumber:
      savedDraft.routingNumber || "",

    settlementCurrency:
      savedDraft.settlementCurrency ||
      "",

    taxType:
      savedDraft.taxType || "",

    taxRegistrationNumber:
      savedDraft.taxRegistrationNumber ||
      savedDraft.taxNumber ||
      "",

    gstNumber:
      savedDraft.gstNumber || "",

    panNumber:
      savedDraft.panNumber || "",

    contractAccepted:
      Boolean(
        savedDraft.contractAccepted
      ),
  });

  const [error, setError] =
    useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [saving, setSaving] =
    useState(false);

  /* ===================================================
     ONBOARDING ENTRY

     PartnerAuth is only the gate into onboarding.
     Do NOT create/login the Vendor here. The Vendor
     application is created only on the final submit.
  =================================================== */

  useEffect(() => {
    const partnerToken =
      localStorage.getItem("token");

    if (!partnerToken) {
      navigate("/signin", {
        replace: true,
      });
      return;
    }

    // Never let credentials from a different Partner account leak into this onboarding.
    const partnerAccount = getPartnerAccount();
    const sessionEmail = String(
      sessionStorage.getItem("bmtVendorAuthEmail") || ""
    ).trim().toLowerCase();

    if (
      sessionEmail &&
      partnerAccount.email &&
      sessionEmail !== partnerAccount.email
    ) {
      sessionStorage.removeItem("bmtVendorAuthEmail");
      sessionStorage.removeItem("bmtVendorAuthPassword");
    }

    // A fresh onboarding flow must not reuse an old Vendor session.
    localStorage.removeItem("vendorToken");
    localStorage.removeItem("vendorUser");

    setCurrentVendor(null);
    setProfileLoading(false);
  }, [navigate]);

  /* ===================================================
     SAVE DRAFT
  =================================================== */

  useEffect(() => {
    const draft = {
      ...form,
      currentStep,
    };

    localStorage.setItem(
      getDraftKey(),
      JSON.stringify(draft)
    );
  }, [form, currentStep]);

  /* ===================================================
     HELPERS
  =================================================== */

  const updateField = (
    name,
    value
  ) => {
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const selectedCountry =
    COUNTRIES.find(
      (item) =>
        item.id === form.country
    );

  const selectedSubtype =
    (SUBTYPES[form.vertical] || [])
      .find(
        (item) =>
          item.id === form.subtype
      );

  const progress = Math.round(
    (currentStep / STEPS.length) *
      100
  );

  /* ===================================================
     SIGN OUT
  =================================================== */

  const exitOnboarding = () => {
    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "vendorToken"
    );

    sessionStorage.removeItem(
      "bmtVendorAuthEmail"
    );

    sessionStorage.removeItem(
      "bmtVendorAuthPassword"
    );

    localStorage.removeItem(
      "user"
    );

    /*
      Draft intentionally preserved.
    */
    navigate("/signin", {
      replace: true,
    });
  };

  /* ===================================================
     BACK
  =================================================== */

  const handleBack = () => {
    if (currentStep === 1) {
      exitOnboarding();
      return;
    }

    setCurrentStep((previous) =>
      Math.max(1, previous - 1)
    );
  };

  /* ===================================================
     VALIDATION
  =================================================== */

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        return form.country
          ? ""
          : "Please select your country.";

      case 2:
        return form.businessType
          ? ""
          : "Please select your business type.";

      case 3:
        return form.vertical
          ? ""
          : "Please select a vertical.";

      case 4:
        return form.subtype
          ? ""
          : "Please select a subtype.";

      case 5:
        if (
          !form.businessName.trim()
        ) {
          return "Business name is required.";
        }

        if (
          form.vertical ===
            "stay" &&
          !form.propertyName.trim()
        ) {
          return "Property name is required.";
        }

        return "";

      case 6:
        if (
          !form.addressLine1.trim() ||
          !form.city.trim()
        ) {
          return "Address and city are required.";
        }

        return "";

      case 7:
        if (
          form.vertical === "stay" &&
          !form.classification
        ) {
          return "Please select a classification.";
        }

        return "";

      case 8:
        if (
          form.vertical === "stay" &&
          !form.totalUnits
        ) {
          return "Please enter total rooms / units.";
        }

        return "";

      case 12:
        if (
          !form.ownerName.trim()
        ) {
          return "Owner / authorized person name is required.";
        }

        if (
          !form.governmentIdType
        ) {
          return "Please select a government ID type.";
        }

        return "";

      case 15:
        if (
          !form.accountHolderName.trim()
        ) {
          return "Account holder name is required.";
        }

        if (
          form.accountNumber &&
          form.confirmAccountNumber &&
          form.accountNumber !==
            form.confirmAccountNumber
        ) {
          return "Account numbers do not match.";
        }

        return "";

      case 17:
        return form.contractAccepted
          ? ""
          : "Please accept the partner agreement.";

      default:
        return "";
    }
  };

  /* ===================================================
     CONTINUE
  =================================================== */

  const handleContinue = () => {
    const validationError =
      validateStep();

    if (validationError) {
      setError(validationError);
      return;
    }

    if (
      currentStep === 1 &&
      selectedCountry
    ) {
      setForm((previous) => ({
        ...previous,

        timezone:
          previous.timezone ||
          selectedCountry.timezone,

        settlementCurrency:
          previous.settlementCurrency ||
          selectedCountry.currency,

        bankCountry:
          previous.bankCountry ||
          selectedCountry.name,

        bankCurrency:
          previous.bankCurrency ||
          selectedCountry.currency,
      }));
    }

    if (
      currentStep === 3 &&
      form.vertical
    ) {
      localStorage.setItem(
        getVerticalKey(),
        form.vertical
      );
    }

    if (
      currentStep < STEPS.length
    ) {
      setCurrentStep(
        (previous) =>
          previous + 1
      );

      return;
    }

    submitApplication();
  };

  /* ===================================================
     BUILD BACKEND PAYLOAD
  =================================================== */

  const buildPayload = () => {
    const countryName =
      selectedCountry?.name || "";

    const countryCode =
      selectedCountry?.code || "";

    const common = {
      businessType:
        BUSINESS_TYPE_VALUES[form.businessType] ||
        form.businessType,

      businessName:
        form.businessName,

      companyName:
        form.businessName,

      legalBusinessName:
        form.legalBusinessName,

      businessRegistrationNumber:
        form.businessRegistrationNumber,

      businessLicenseNumber:
        form.businessLicenseNumber,

      website:
        form.website,

      vertical:
        form.vertical,

      selectedVertical:
        form.vertical,

      /*
        Stay subtype backend field.
        For other verticals the subtype remains
        available as service/business subtype.
      */
      staySubtype:
        form.vertical === "stay"
          ? form.subtype
          : "",

      service:
        form.vertical === "stay"
          ? form.subtype
          : form.vertical,

      services:
        form.vertical === "stay"
          ? [form.subtype].filter(Boolean)
          : [form.vertical].filter(Boolean),

      country:
        countryName,

      countryCode,

      address:
        form.addressLine1,

      addressLine1:
        form.addressLine1,

      addressLine2:
        form.addressLine2,

      locality:
        form.locality,

      landmark:
        form.landmark,

      city:
        form.city,

      district:
        form.district,

      state:
        form.state,

      pincode:
        form.postalCode,

      postalCode:
        form.postalCode,

      timezone:
        form.timezone,

      governmentIdType:
        form.governmentIdType,

      governmentIdNumber:
        form.governmentIdNumber,

      bankCountry:
        form.bankCountry ||
        countryName,

      bankCurrency:
        form.bankCurrency ||
        selectedCountry?.currency ||
        "",

      settlementCurrency:
        form.settlementCurrency ||
        selectedCountry?.currency ||
        "",

      accountHolderName:
        form.accountHolderName,

      bankName:
        form.bankName,

      branchName:
        form.branchName,

      accountNumber:
        form.accountNumber,

      confirmAccountNumber:
        form.confirmAccountNumber,

      ifscCode:
        form.ifscCode,

      iban:
        form.iban,

      swiftCode:
        form.swiftCode,

      routingNumber:
        form.routingNumber,

      taxType:
        form.taxType,

      taxRegistrationNumber:
        form.taxRegistrationNumber,

      gstNumber:
        form.gstNumber,

      panNumber:
        form.panNumber,

      onboardingStatus:
        "submitted",

      onboardingComplete:
        true,

      onboardingStep:
        STEPS.length,

      onboardingProgress:
        100,
    };

    if (
      form.vertical === "stay"
    ) {
      common.stayDetails = {
        propertyName:
          form.propertyName,

        legalPropertyName:
          form.legalBusinessName,

        displayName:
          form.displayName ||
          form.propertyName,

        propertyType:
          form.subtype,

        totalProperties: 1,

        propertyTypes:
          form.subtype
            ? [form.subtype]
            : [],

        addressLine1:
          form.addressLine1,

        addressLine2:
          form.addressLine2,

        locality:
          form.locality,

        landmark:
          form.landmark,

        city:
          form.city,

        district:
          form.district,

        state:
          form.state,

        postalCode:
          form.postalCode,

        country:
          countryName,

        countryCode,

        timezone:
          form.timezone,

        latitude:
          form.latitude ||
          null,

        longitude:
          form.longitude ||
          null,

        classification:
          form.classification,

        starRating:
          Number(
            form.starRating || 0
          ),

        totalUnits:
          Number(
            form.totalUnits || 0
          ),

        totalRooms:
          Number(
            form.totalRooms ||
            form.totalUnits ||
            0
          ),

        totalFloors:
          Number(
            form.totalFloors || 0
          ),

        totalBuildings:
          Number(
            form.totalBuildings ||
            1
          ),

        maximumGuests:
          Number(
            form.maximumGuests ||
            0
          ),

        amenities:
          form.amenities,

        customAmenities:
          form.customAmenities
            ? form.customAmenities
                .split(",")
                .map(
                  (item) =>
                    item.trim()
                )
                .filter(Boolean)
            : [],

        checkInFrom:
          form.checkInFrom,

        checkOutUntil:
          form.checkOutUntil,

        frontDesk24Hours:
          form.frontDesk24Hours,

        selfCheckIn:
          form.selfCheckIn,

        wifiAvailable:
          form.wifiAvailable,

        freeWifi:
          form.freeWifi,

        parkingAvailable:
          form.parkingAvailable,

        restaurantAvailable:
          form.restaurantAvailable,

        breakfastAvailable:
          form.breakfastAvailable,

        airportTransferAvailable:
          form.airportTransferAvailable,

        childrenAllowed:
          form.childrenAllowed,

        petsAllowed:
          form.petsAllowed,

        smokingAllowed:
          form.smokingAllowed,

        cancellationPolicy:
          form.cancellationPolicy,

        noShowPolicy:
          form.noShowPolicy,

        modificationPolicy:
          form.modificationPolicy,

        paymentPolicy:
          form.paymentPolicy,

        propertyRegistrationNumber:
          form.propertyRegistrationNumber,

        businessLicenseNumber:
          form.businessLicenseNumber,

        tourismLicenseNumber:
          form.tourismLicenseNumber,

        fireSafetyCertificateNumber:
          form.fireSafetyCertificateNumber,

        foodLicenseNumber:
          form.foodLicenseNumber,

        logo:
          form.logo,

        coverImage:
          form.coverImage,

        propertyImages:
          form.propertyImages,

        videos:
          form.videos,

        propertyCurrency:
          selectedCountry?.currency ||
          "",

        settlementCurrency:
          form.settlementCurrency ||
          selectedCountry?.currency ||
          "",

        isPublished: false,
      };
    }

    /*
      These are harmless UX metadata.
      Backend must ignore/validate anything
      it does not own.
    */
    common.applicationMeta = {
      supplierSubtype:
        form.subtype,

      ownerName:
        form.ownerName,

      ownerPhone:
        form.ownerPhone,

      contractAccepted:
        form.contractAccepted,

      contractAcceptedAt:
        form.contractAccepted
          ? new Date().toISOString()
          : null,
    };

    return common;
  };

  /* ===================================================
     SUBMIT APPLICATION

     FINAL FLOW:
     Partner Auth -> Onboarding -> Vendor Signup -> PENDING
     -> Admin Approval -> Vendor Sign-In -> exact dashboard.

     IMPORTANT: No automatic Vendor login/profile/dashboard
     request is made after this signup.
  =================================================== */

  const submitApplication = async () => {
    const partnerToken =
      localStorage.getItem("token");

    if (!partnerToken) {
      navigate("/signin", {
        replace: true,
      });
      return;
    }

    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      let partner = {};

      try {
        partner = JSON.parse(
          localStorage.getItem("user") || "{}"
        );
      } catch {
        partner = {};
      }

      const email = String(
        location.state?.vendorAuth?.email ||
          sessionStorage.getItem("bmtVendorAuthEmail") ||
          partner?.email ||
          partner?.businessEmail ||
          ""
      )
        .trim()
        .toLowerCase();

      const password =
        location.state?.vendorAuth?.password ||
        sessionStorage.getItem("bmtVendorAuthPassword") ||
        "";

      const phone = String(
        location.state?.vendorAuth?.phone ||
          partner?.phone ||
          partner?.businessPhone ||
          form.ownerPhone ||
          ""
      ).trim();

      // The onboarding selection is authoritative for this new application.
      const selectedVertical = form.vertical;
      const staySubtype =
        selectedVertical === "stay"
          ? form.subtype
          : "";

      if (!email) {
        throw new Error(
          "Business email is missing. Please sign in again."
        );
      }

      if (!password) {
        throw new Error(
          "Signin password is no longer available in this tab. Please sign in again."
        );
      }

      if (!phone) {
        throw new Error(
          "Phone number is required before submitting the application."
        );
      }

      if (!selectedVertical) {
        throw new Error(
          "Please select your business vertical."
        );
      }

      if (
        selectedVertical === "stay" &&
        !staySubtype
      ) {
        throw new Error(
          "Please select your property type."
        );
      }

      const signupPayload = {
        ...buildPayload(),

        name:
          form.ownerName ||
          partner?.name ||
          form.businessName ||
          email.split("@")[0],

        email,
        businessEmail: email,
        phone,
        businessPhone: phone,
        password,

        businessType:
          BUSINESS_TYPE_VALUES[form.businessType] ||
          form.businessType,

        selectedVertical,
        vertical: selectedVertical,

        // Stay stores the exact property subtype as the service.
        service:
          selectedVertical === "stay"
            ? staySubtype
            : selectedVertical,

        // Do not send parent "stay" in the legacy services enum.
        services:
          selectedVertical === "stay"
            ? [staySubtype].filter(Boolean)
            : [selectedVertical].filter(Boolean),

        staySubtype,
        subtype:
          selectedVertical === "stay"
            ? staySubtype
            : form.subtype || "",
      };

      const signupResponse = await fetch(
        SIGNUP_URL,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(signupPayload),
        }
      );

      const signupData = await signupResponse
        .json()
        .catch(() => ({}));

      if (
        signupResponse.status === 201 &&
        signupData?.success
      ) {
        // Admin approval is mandatory before a Vendor session can exist.
        localStorage.removeItem("vendorToken");
        localStorage.removeItem("vendorUser");
        localStorage.removeItem("onboardingComplete");

        localStorage.setItem(
          getVerticalKey(),
          selectedVertical
        );

        localStorage.removeItem(getDraftKey());
        sessionStorage.removeItem(
          "bmtVendorAuthPassword"
        );

        setCurrentVendor({
          ...(signupData?.vendor || {}),
          status: "PENDING",
          isApproved: false,
          onboardingStatus: "submitted",
          vertical: selectedVertical,
          selectedVertical,
          staySubtype,
        });

        setSuccessMessage(
          signupData?.message ||
            "Application submitted successfully. Your BMT Connect vendor application is waiting for admin approval."
        );

        /*
         * Final onboarding flow:
         * application saved -> PENDING -> Vendor Sign-In page.
         *
         * We DO NOT create a Vendor session here.
         * The login endpoint will refuse access until Admin approves.
         */
        navigate("/vendor-login", {
          replace: true,
          state: {
            applicationSubmitted: true,
            email,
            status: "PENDING",
            vertical: selectedVertical,
            staySubtype,
          },
        });

        return;
      }
      

   if (signupResponse.status === 409) {
  localStorage.removeItem("vendorToken");
  localStorage.removeItem("vendorUser");

  navigate("/vendor-login", {
    replace: true,
    state: {
      applicationSubmitted: false,
      existingApplication: true,
      email,
      message:
        signupData?.message ||
        "Your vendor application already exists. Please sign in to check your approval status.",
    },
  });

  return;
}

      if (signupResponse.status === 400) {
        const details = Array.isArray(
          signupData?.details
        )
          ? signupData.details
              .map((item) => item?.message)
              .filter(Boolean)
              .join(", ")
          : "";

        throw new Error(
          details ||
            signupData?.message ||
            "Please check your registration details."
        );
      }

      throw new Error(
        signupData?.message ||
          "Unable to submit vendor application."
      );
    } catch (err) {
      console.error(
        "Vendor onboarding submit error:",
        err
      );

      setError(
        err?.message ||
          "Unable to submit application."
      );
    } finally {
      setSaving(false);
    }
  };

  /* ===================================================
     AMENITY
  =================================================== */

  const toggleAmenity = (
    amenity
  ) => {
    setForm((previous) => {
      const exists =
        previous.amenities.includes(
          amenity
        );

      return {
        ...previous,

        amenities: exists
          ? previous.amenities.filter(
              (item) =>
                item !== amenity
            )
          : [
              ...previous.amenities,
              amenity,
            ],
      };
    });
  };

  if (profileLoading) {
    return (
      <div className="bmt-onboarding">
        <main
          className="bmt-onboarding-main"
          style={{
            marginLeft: 0,
            width: "100%",
          }}
        >
          <section className="bmt-onboarding-content">
            <div className="bmt-content-inner">
              <div className="bmt-empty-state">
                Loading your BMT Connect account...
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  /* ===================================================
     PAGE
  =================================================== */

  return (
    <div className="bmt-onboarding">
      <aside className="bmt-onboarding-sidebar">
        <div className="bmt-sidebar-title">
          APPLICATION STEPS
        </div>

        <div className="bmt-step-list">
          {STEPS.map((step) => {
            const active =
              step.id === currentStep;

            const complete =
              step.id < currentStep;

            return (
              <button
                type="button"
                key={step.id}
                className={[
                  "bmt-sidebar-step",
                  active
                    ? "active"
                    : "",
                  complete
                    ? "complete"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => {
                  if (
                    step.id <=
                    currentStep
                  ) {
                    setCurrentStep(
                      step.id
                    );
                  }
                }}
              >
                <span className="bmt-step-number">
                  {complete
                    ? "✓"
                    : step.id}
                </span>

                <span>
                  {step.title}
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      <main className="bmt-onboarding-main">
        <header className="bmt-onboarding-header">
          <div className="bmt-header-left">
            <div className="bmt-onboarding-logo">
              <span>BMT</span>
              Connect
            </div>

            <div className="bmt-application-status">
              {currentVendor
                ?.onboardingStatus ===
              "rejected"
                ? "Action required"
                : "Application in progress"}
            </div>

            {form.vertical && (
              <div className="bmt-current-vertical">
                {VERTICALS.find(
                  (item) =>
                    item.id ===
                    form.vertical
                )?.name ||
                  form.vertical}

                {selectedSubtype?.name
                  ? ` · ${selectedSubtype.name}`
                  : ""}
              </div>
            )}
          </div>

          <div className="bmt-header-right">
            <div className="bmt-progress-box">
              <div className="bmt-progress-track">
                <div
                  className="bmt-progress-fill"
                  style={{
                    width:
                      `${progress}%`,
                  }}
                />
              </div>

              <strong>
                {progress}%
              </strong>
            </div>

            <button
              type="button"
              className="bmt-signout-btn"
              onClick={
                exitOnboarding
              }
            >
              Sign out
            </button>
          </div>
        </header>

        <section className="bmt-onboarding-content">
          <div className="bmt-content-inner">
            <div className="bmt-step-eyebrow">
              STEP {currentStep} OF{" "}
              {STEPS.length}
            </div>

            <h1>
              {
                STEPS[
                  currentStep - 1
                ].title
              }
            </h1>

            <p className="bmt-step-description">
              {getStepDescription(
                currentStep,
                form.vertical
              )}
            </p>

            {successMessage && (
              <div
                className="bmt-onboarding-error"
                style={{
                  borderColor: "#86efac",
                  background: "#f0fdf4",
                  color: "#166534",
                }}
              >
                {successMessage}
              </div>
            )}

            {error && (
              <div className="bmt-onboarding-error">
                {error}
              </div>
            )}

            <div className="bmt-step-content">
              {currentStep === 1 && (
                <CountryStep
                  value={
                    form.country
                  }
                  onChange={(
                    value
                  ) => {
                    const country =
                      COUNTRIES.find(
                        (item) =>
                          item.id ===
                          value
                      );

                    updateField(
                      "country",
                      value
                    );

                    if (country) {
                      setForm(
                        (previous) => ({
                          ...previous,
                          country:
                            value,
                          timezone:
                            previous.timezone ||
                            country.timezone,
                          bankCountry:
                            previous.bankCountry ||
                            country.name,
                          bankCurrency:
                            previous.bankCurrency ||
                            country.currency,
                          settlementCurrency:
                            previous.settlementCurrency ||
                            country.currency,
                        })
                      );
                    }
                  }}
                />
              )}

              {currentStep === 2 && (
                <BusinessTypeStep
                  value={
                    form.businessType
                  }
                  onChange={(
                    value
                  ) =>
                    updateField(
                      "businessType",
                      value
                    )
                  }
                />
              )}

              {currentStep === 3 && (
                <VerticalStep
                  value={
                    form.vertical
                  }
                  onChange={(
                    value
                  ) => {
                    setForm(
                      (previous) => ({
                        ...previous,
                        vertical:
                          value,
                        subtype: "",
                        classification:
                          "",
                      })
                    );

                    setError("");
                  }}
                />
              )}

              {currentStep === 4 && (
                <SubtypeStep
                  vertical={
                    form.vertical
                  }
                  value={
                    form.subtype
                  }
                  onChange={(
                    value
                  ) =>
                    updateField(
                      "subtype",
                      value
                    )
                  }
                />
              )}

              {currentStep === 5 && (
                <BasicDetailsStep
                  form={form}
                  updateField={
                    updateField
                  }
                />
              )}

              {currentStep === 6 && (
                <LocationStep
                  form={form}
                  updateField={
                    updateField
                  }
                  selectedCountry={
                    selectedCountry
                  }
                />
              )}

              {currentStep === 7 && (
                <ClassificationStep
                  form={form}
                  updateField={
                    updateField
                  }
                />
              )}

              {currentStep === 8 && (
                <UnitsStep
                  form={form}
                  updateField={
                    updateField
                  }
                />
              )}

              {currentStep === 9 && (
                <AmenitiesStep
                  form={form}
                  updateField={
                    updateField
                  }
                  selected={
                    form.amenities
                  }
                  toggle={
                    toggleAmenity
                  }
                />
              )}

              {currentStep === 10 && (
                <PoliciesStep
                  form={form}
                  updateField={
                    updateField
                  }
                />
              )}

              {currentStep === 11 && (
                <MediaFieldsStep
                  form={form}
                  updateField={
                    updateField
                  }
                  mode="property"
                />
              )}

              {currentStep === 12 && (
                <KycStep
                  form={form}
                  updateField={
                    updateField
                  }
                />
              )}

              {currentStep === 13 && (
                <DocumentsStep
                  form={form}
                  updateField={
                    updateField
                  }
                />
              )}

              {currentStep === 14 && (
                <MediaFieldsStep
                  form={form}
                  updateField={
                    updateField
                  }
                  mode="brand"
                />
              )}

              {currentStep === 15 && (
                <BankStep
                  form={form}
                  updateField={
                    updateField
                  }
                  selectedCountry={
                    selectedCountry
                  }
                />
              )}

              {currentStep === 16 && (
                <TaxStep
                  form={form}
                  updateField={
                    updateField
                  }
                  selectedCountry={
                    selectedCountry
                  }
                />
              )}

              {currentStep === 17 && (
                <ContractStep
                  checked={
                    form.contractAccepted
                  }
                  onChange={(
                    value
                  ) =>
                    updateField(
                      "contractAccepted",
                      value
                    )
                  }
                />
              )}

              {currentStep === 18 && (
                <ReviewStep
                  form={form}
                  selectedCountry={
                    selectedCountry
                  }
                  selectedSubtype={
                    selectedSubtype
                  }
                />
              )}
            </div>
          </div>
        </section>

        <footer className="bmt-onboarding-footer">
          <button
            type="button"
            className="bmt-back-btn"
            onClick={handleBack}
          >
            ←{" "}
            {currentStep === 1
              ? "Back to sign in"
              : "Back"}
          </button>

          <button
            type="button"
            className="bmt-continue-btn"
            onClick={
              handleContinue
            }
            disabled={saving}
          >
            {saving
              ? "Submitting..."
              : currentStep ===
                  STEPS.length
              ? "Submit application"
              : "Continue"}
          </button>
        </footer>
      </main>
    </div>
  );
}

/* =====================================================
   STEPS
===================================================== */

function CountryStep({
  value,
  onChange,
}) {
  return (
    <div className="bmt-card-grid bmt-country-grid">
      {COUNTRIES.map(
        (country) => (
          <button
            type="button"
            key={country.id}
            className={
              value === country.id
                ? "bmt-select-card selected"
                : "bmt-select-card"
            }
            onClick={() =>
              onChange(country.id)
            }
          >
            <strong>
              {country.name}
            </strong>

            <span>
              {country.currency}
              {" · "}
              {country.phone}
            </span>
          </button>
        )
      )}
    </div>
  );
}

function BusinessTypeStep({
  value,
  onChange,
}) {
  return (
    <div className="bmt-card-grid">
      {BUSINESS_TYPES.map(
        (type) => (
          <button
            type="button"
            key={type}
            className={
              value === type
                ? "bmt-select-card selected"
                : "bmt-select-card"
            }
            onClick={() =>
              onChange(type)
            }
          >
            <strong>
              {type}
            </strong>
          </button>
        )
      )}
    </div>
  );
}

function VerticalStep({
  value,
  onChange,
}) {
  return (
    <div className="bmt-vertical-grid">
      {VERTICALS.map(
        (vertical) => (
          <button
            type="button"
            key={vertical.id}
            className={
              value === vertical.id
                ? "bmt-vertical-card selected"
                : "bmt-vertical-card"
            }
            onClick={() =>
              onChange(
                vertical.id
              )
            }
          >
            <div className="bmt-vertical-icon">
              {vertical.icon}
            </div>

            <strong>
              {vertical.name}
            </strong>

            <span>
              {
                vertical.description
              }
            </span>
          </button>
        )
      )}
    </div>
  );
}

function SubtypeStep({
  vertical,
  value,
  onChange,
}) {
  const options =
    SUBTYPES[vertical] || [];

  if (!vertical) {
    return (
      <div className="bmt-empty-state">
        Please choose a vertical first.
      </div>
    );
  }

  return (
    <div className="bmt-card-grid">
      {options.map((item) => (
        <button
          key={item.id}
          type="button"
          className={
            value === item.id
              ? "bmt-select-card selected"
              : "bmt-select-card"
          }
          onClick={() =>
            onChange(item.id)
          }
        >
          <strong>
            {item.name}
          </strong>

          <span>
            Backend value:{" "}
            {item.id}
          </span>
        </button>
      ))}
    </div>
  );
}

function BasicDetailsStep({
  form,
  updateField,
}) {
  const isStay =
    form.vertical === "stay";

  return (
    <div className="bmt-form-grid">
      <Field
        label="Business name"
        value={
          form.businessName
        }
        onChange={(value) =>
          updateField(
            "businessName",
            value
          )
        }
        placeholder="Registered business name"
      />

      <Field
        label="Legal business name"
        value={
          form.legalBusinessName
        }
        onChange={(value) =>
          updateField(
            "legalBusinessName",
            value
          )
        }
        placeholder="Name on registration documents"
      />

      {isStay && (
        <>
          <Field
            label="Property name"
            value={
              form.propertyName
            }
            onChange={(
              value
            ) =>
              updateField(
                "propertyName",
                value
              )
            }
            placeholder="Public property name"
          />

          <Field
            label="Display name"
            value={
              form.displayName
            }
            onChange={(
              value
            ) =>
              updateField(
                "displayName",
                value
              )
            }
            placeholder="Marketplace display name"
          />
        </>
      )}

      <Field
        label="Business registration number"
        value={
          form.businessRegistrationNumber
        }
        onChange={(value) =>
          updateField(
            "businessRegistrationNumber",
            value
          )
        }
        placeholder="Registration / incorporation number"
      />

      <Field
        label="Business licence number"
        value={
          form.businessLicenseNumber
        }
        onChange={(value) =>
          updateField(
            "businessLicenseNumber",
            value
          )
        }
        placeholder="Licence number, if applicable"
      />

      <div className="bmt-form-span-2">
        <Field
          label="Website"
          value={
            form.website
          }
          onChange={(
            value
          ) =>
            updateField(
              "website",
              value
            )
          }
          placeholder="https://"
        />
      </div>
    </div>
  );
}

function LocationStep({
  form,
  updateField,
  selectedCountry,
}) {
  return (
    <div className="bmt-form-grid">
      <div className="bmt-form-span-2">
        <Field
          label="Address line 1"
          value={
            form.addressLine1
          }
          onChange={(
            value
          ) =>
            updateField(
              "addressLine1",
              value
            )
          }
          placeholder="Building / street / area"
        />
      </div>

      <div className="bmt-form-span-2">
        <Field
          label="Address line 2"
          value={
            form.addressLine2
          }
          onChange={(
            value
          ) =>
            updateField(
              "addressLine2",
              value
            )
          }
          placeholder="Optional"
        />
      </div>

      <Field
        label="Locality"
        value={form.locality}
        onChange={(value) =>
          updateField(
            "locality",
            value
          )
        }
        placeholder="Locality / area"
      />

      <Field
        label="Landmark"
        value={form.landmark}
        onChange={(value) =>
          updateField(
            "landmark",
            value
          )
        }
        placeholder="Nearby landmark"
      />

      <Field
        label="City"
        value={form.city}
        onChange={(value) =>
          updateField(
            "city",
            value
          )
        }
        placeholder="City"
      />

      <Field
        label="District"
        value={form.district}
        onChange={(value) =>
          updateField(
            "district",
            value
          )
        }
        placeholder="District"
      />

      <Field
        label="State / Province / Region"
        value={form.state}
        onChange={(value) =>
          updateField(
            "state",
            value
          )
        }
        placeholder="State / Province"
      />

      <Field
        label="Postal code"
        value={form.postalCode}
        onChange={(value) =>
          updateField(
            "postalCode",
            value
          )
        }
        placeholder="Postal code"
      />

      <Field
        label="Country"
        value={
          selectedCountry?.name ||
          ""
        }
        disabled
      />

      <Field
        label="Time zone"
        value={form.timezone}
        onChange={(value) =>
          updateField(
            "timezone",
            value
          )
        }
        placeholder="e.g. Asia/Kolkata"
      />

      {form.vertical ===
        "stay" && (
        <>
          <Field
            label="Latitude"
            type="number"
            value={
              form.latitude
            }
            onChange={(
              value
            ) =>
              updateField(
                "latitude",
                value
              )
            }
            placeholder="Optional"
          />

          <Field
            label="Longitude"
            type="number"
            value={
              form.longitude
            }
            onChange={(
              value
            ) =>
              updateField(
                "longitude",
                value
              )
            }
            placeholder="Optional"
          />
        </>
      )}
    </div>
  );
}

function ClassificationStep({
  form,
  updateField,
}) {
  if (
    form.vertical !== "stay"
  ) {
    return (
      <NotApplicable
        text="Classification is not required for this vertical. Continue to the next step."
      />
    );
  }

  const options = [
    {
      id: "unrated",
      name: "Unrated",
      star: 0,
    },
    {
      id: "budget",
      name: "Budget",
      star: 0,
    },
    {
      id: "1-star",
      name: "1 Star",
      star: 1,
    },
    {
      id: "2-star",
      name: "2 Star",
      star: 2,
    },
    {
      id: "3-star",
      name: "3 Star",
      star: 3,
    },
    {
      id: "4-star",
      name: "4 Star",
      star: 4,
    },
    {
      id: "5-star",
      name: "5 Star",
      star: 5,
    },
    {
      id: "luxury",
      name: "Luxury",
      star: 0,
    },
  ];

  return (
    <div className="bmt-card-grid">
      {options.map(
        (option) => (
          <button
            type="button"
            key={option.id}
            className={
              form.classification ===
              option.id
                ? "bmt-select-card selected"
                : "bmt-select-card"
            }
            onClick={() => {
              updateField(
                "classification",
                option.id
              );

              updateField(
                "starRating",
                option.star
                  ? String(
                      option.star
                    )
                  : ""
              );
            }}
          >
            <strong>
              {option.name}
            </strong>
          </button>
        )
      )}
    </div>
  );
}

function UnitsStep({
  form,
  updateField,
}) {
  if (
    form.vertical !== "stay"
  ) {
    return (
      <NotApplicable
        text="Inventory details will be configured inside the selected vertical dashboard."
      />
    );
  }

  return (
    <div className="bmt-form-grid">
      <Field
        label="Total rooms / units"
        type="number"
        value={form.totalUnits}
        onChange={(value) => {
          updateField(
            "totalUnits",
            value
          );

          if (!form.totalRooms) {
            updateField(
              "totalRooms",
              value
            );
          }
        }}
        placeholder="e.g. 25"
      />

      <Field
        label="Total rooms"
        type="number"
        value={form.totalRooms}
        onChange={(value) =>
          updateField(
            "totalRooms",
            value
          )
        }
        placeholder="e.g. 25"
      />

      <Field
        label="Total floors"
        type="number"
        value={
          form.totalFloors
        }
        onChange={(value) =>
          updateField(
            "totalFloors",
            value
          )
        }
        placeholder="e.g. 4"
      />

      <Field
        label="Total buildings"
        type="number"
        value={
          form.totalBuildings
        }
        onChange={(value) =>
          updateField(
            "totalBuildings",
            value
          )
        }
        placeholder="e.g. 1"
      />

      <Field
        label="Maximum guests"
        type="number"
        value={
          form.maximumGuests
        }
        onChange={(value) =>
          updateField(
            "maximumGuests",
            value
          )
        }
        placeholder="Total property capacity"
      />

      <Field
        label="Primary room / unit type"
        value={form.unitType}
        onChange={(value) =>
          updateField(
            "unitType",
            value
          )
        }
        placeholder="e.g. Deluxe Room"
      />
    </div>
  );
}

function AmenitiesStep({
  form,
  updateField,
  selected,
  toggle,
}) {
  if (
    form.vertical !== "stay"
  ) {
    return (
      <NotApplicable
        text="Vertical-specific services and amenities will be configured in the supplier dashboard."
      />
    );
  }

  const amenities = [
    "Wi-Fi",
    "Parking",
    "Restaurant",
    "Room Service",
    "Swimming Pool",
    "Air Conditioning",
    "Airport Transfer",
    "Gym",
    "Spa",
    "24-hour Front Desk",
    "Breakfast",
    "Wheelchair Access",
  ];

  return (
    <>
      <div className="bmt-checkbox-grid">
        {amenities.map(
          (item) => (
            <label
              key={item}
              className={
                selected.includes(
                  item
                )
                  ? "bmt-checkbox-card checked"
                  : "bmt-checkbox-card"
              }
            >
              <input
                type="checkbox"
                checked={selected.includes(
                  item
                )}
                onChange={() =>
                  toggle(item)
                }
              />

              <span>{item}</span>
            </label>
          )
        )}
      </div>

      <div
        className="bmt-form-grid"
        style={{
          marginTop: 18,
        }}
      >
        <ToggleField
          label="Wi-Fi available"
          checked={
            form.wifiAvailable
          }
          onChange={(value) =>
            updateField(
              "wifiAvailable",
              value
            )
          }
        />

        <ToggleField
          label="Free Wi-Fi"
          checked={form.freeWifi}
          onChange={(value) =>
            updateField(
              "freeWifi",
              value
            )
          }
        />

        <ToggleField
          label="Parking available"
          checked={
            form.parkingAvailable
          }
          onChange={(value) =>
            updateField(
              "parkingAvailable",
              value
            )
          }
        />

        <ToggleField
          label="Restaurant available"
          checked={
            form.restaurantAvailable
          }
          onChange={(value) =>
            updateField(
              "restaurantAvailable",
              value
            )
          }
        />

        <ToggleField
          label="Breakfast available"
          checked={
            form.breakfastAvailable
          }
          onChange={(value) =>
            updateField(
              "breakfastAvailable",
              value
            )
          }
        />

        <ToggleField
          label="Airport transfer"
          checked={
            form.airportTransferAvailable
          }
          onChange={(value) =>
            updateField(
              "airportTransferAvailable",
              value
            )
          }
        />

        <div className="bmt-form-span-2">
          <Field
            label="Other amenities"
            value={
              form.customAmenities
            }
            onChange={(value) =>
              updateField(
                "customAmenities",
                value
              )
            }
            placeholder="Comma separated, e.g. Rooftop, Garden, EV charging"
          />
        </div>
      </div>
    </>
  );
}

function PoliciesStep({
  form,
  updateField,
}) {
  if (
    form.vertical !== "stay"
  ) {
    return (
      <NotApplicable
        text="Vertical-specific operating policies will be configured in the supplier dashboard."
      />
    );
  }

  return (
    <div className="bmt-form-grid">
      <Field
        label="Check-in from"
        type="time"
        value={form.checkInFrom}
        onChange={(value) =>
          updateField(
            "checkInFrom",
            value
          )
        }
      />

      <Field
        label="Check-out until"
        type="time"
        value={
          form.checkOutUntil
        }
        onChange={(value) =>
          updateField(
            "checkOutUntil",
            value
          )
        }
      />

      <ToggleField
        label="24-hour front desk"
        checked={
          form.frontDesk24Hours
        }
        onChange={(value) =>
          updateField(
            "frontDesk24Hours",
            value
          )
        }
      />

      <ToggleField
        label="Self check-in"
        checked={form.selfCheckIn}
        onChange={(value) =>
          updateField(
            "selfCheckIn",
            value
          )
        }
      />

      <ToggleField
        label="Children allowed"
        checked={
          form.childrenAllowed
        }
        onChange={(value) =>
          updateField(
            "childrenAllowed",
            value
          )
        }
      />

      <ToggleField
        label="Pets allowed"
        checked={form.petsAllowed}
        onChange={(value) =>
          updateField(
            "petsAllowed",
            value
          )
        }
      />

      <ToggleField
        label="Smoking allowed"
        checked={
          form.smokingAllowed
        }
        onChange={(value) =>
          updateField(
            "smokingAllowed",
            value
          )
        }
      />

      <TextAreaField
        label="Cancellation policy"
        value={
          form.cancellationPolicy
        }
        onChange={(value) =>
          updateField(
            "cancellationPolicy",
            value
          )
        }
        placeholder="Describe cancellation rules"
      />

      <TextAreaField
        label="No-show policy"
        value={form.noShowPolicy}
        onChange={(value) =>
          updateField(
            "noShowPolicy",
            value
          )
        }
        placeholder="Describe no-show rules"
      />

      <TextAreaField
        label="Modification policy"
        value={
          form.modificationPolicy
        }
        onChange={(value) =>
          updateField(
            "modificationPolicy",
            value
          )
        }
        placeholder="Describe modification rules"
      />

      <TextAreaField
        label="Payment policy"
        value={
          form.paymentPolicy
        }
        onChange={(value) =>
          updateField(
            "paymentPolicy",
            value
          )
        }
        placeholder="Describe payment / deposit rules"
      />
    </div>
  );
}

/*
  Current backend stores media as URL/string arrays.
  This keeps the frontend aligned without pretending
  binary upload already exists.
*/
function MediaFieldsStep({
  form,
  updateField,
  mode,
}) {
  if (mode === "brand") {
    return (
      <div className="bmt-form-grid">
        <div className="bmt-form-span-2">
          <UploadInfo
            title="Business media"
            description="Your current backend stores media references/URLs. Paste hosted URLs here until an upload/storage endpoint is connected."
          />
        </div>

        <Field
          label="Business / property logo URL"
          value={form.logo}
          onChange={(value) =>
            updateField(
              "logo",
              value
            )
          }
          placeholder="https://..."
        />

        <Field
          label="Cover image URL"
          value={form.coverImage}
          onChange={(value) =>
            updateField(
              "coverImage",
              value
            )
          }
          placeholder="https://..."
        />
      </div>
    );
  }

  return (
    <div className="bmt-form-grid">
      <div className="bmt-form-span-2">
        <UploadInfo
          title="Property photos & videos"
          description="Paste hosted media URLs below. They are mapped to stayDetails.propertyImages and stayDetails.videos."
        />
      </div>

      <div className="bmt-form-span-2">
        <TextAreaField
          label="Property image URLs"
          value={
            form.propertyImages.join(
              "\n"
            )
          }
          onChange={(value) =>
            updateField(
              "propertyImages",
              value
                .split(/\n|,/)
                .map(
                  (item) =>
                    item.trim()
                )
                .filter(Boolean)
            )
          }
          placeholder={"https://.../image-1.jpg\nhttps://.../image-2.jpg"}
        />
      </div>

      <div className="bmt-form-span-2">
        <TextAreaField
          label="Video URLs"
          value={form.videos.join(
            "\n"
          )}
          onChange={(value) =>
            updateField(
              "videos",
              value
                .split(/\n|,/)
                .map(
                  (item) =>
                    item.trim()
                )
                .filter(Boolean)
            )
          }
          placeholder={"https://.../video-1.mp4"}
        />
      </div>
    </div>
  );
}

function KycStep({
  form,
  updateField,
}) {
  return (
    <div className="bmt-form-grid">
      <Field
        label="Owner / authorized person"
        value={form.ownerName}
        onChange={(value) =>
          updateField(
            "ownerName",
            value
          )
        }
        placeholder="Full legal name"
      />

      <Field
        label="Owner phone"
        value={form.ownerPhone}
        onChange={(value) =>
          updateField(
            "ownerPhone",
            value
          )
        }
        placeholder="+91..."
      />

      <label className="bmt-field">
        <span>
          Government ID type
        </span>

        <select
          value={
            form.governmentIdType
          }
          onChange={(event) =>
            updateField(
              "governmentIdType",
              event.target.value
            )
          }
        >
          <option value="">
            Select ID type
          </option>

          <option value="passport">
            Passport
          </option>

          <option value="national-id">
            National ID
          </option>

          <option value="drivers-license">
            Driver's licence
          </option>

          <option value="aadhaar">
            Aadhaar / local national ID
          </option>

          <option value="other">
            Other government ID
          </option>
        </select>
      </label>

      <Field
        label="Government ID number"
        value={
          form.governmentIdNumber
        }
        onChange={(value) =>
          updateField(
            "governmentIdNumber",
            value
          )
        }
        placeholder="ID number"
      />
    </div>
  );
}

function DocumentsStep({
  form,
  updateField,
}) {
  return (
    <div className="bmt-form-grid">
      <Field
        label="Property registration number"
        value={
          form.propertyRegistrationNumber
        }
        onChange={(value) =>
          updateField(
            "propertyRegistrationNumber",
            value
          )
        }
        placeholder="If applicable"
      />

      <Field
        label="Tourism licence number"
        value={
          form.tourismLicenseNumber
        }
        onChange={(value) =>
          updateField(
            "tourismLicenseNumber",
            value
          )
        }
        placeholder="If applicable"
      />

      <Field
        label="Fire safety certificate number"
        value={
          form.fireSafetyCertificateNumber
        }
        onChange={(value) =>
          updateField(
            "fireSafetyCertificateNumber",
            value
          )
        }
        placeholder="If applicable"
      />

      <Field
        label="Food licence number"
        value={
          form.foodLicenseNumber
        }
        onChange={(value) =>
          updateField(
            "foodLicenseNumber",
            value
          )
        }
        placeholder="If applicable"
      />

      <div className="bmt-form-span-2">
        <UploadInfo
          title="Document upload"
          description="Document-number fields are mapped to your backend. Binary document upload still needs the storage/upload API endpoint."
        />
      </div>
    </div>
  );
}

function BankStep({
  form,
  updateField,
  selectedCountry,
}) {
  const isIndia =
    selectedCountry?.code === "IN";

  return (
    <div className="bmt-form-grid">
      <Field
        label="Account holder name"
        value={
          form.accountHolderName
        }
        onChange={(value) =>
          updateField(
            "accountHolderName",
            value
          )
        }
        placeholder="As per bank account"
      />

      <Field
        label="Bank name"
        value={form.bankName}
        onChange={(value) =>
          updateField(
            "bankName",
            value
          )
        }
        placeholder="Bank name"
      />

      <Field
        label="Branch name"
        value={form.branchName}
        onChange={(value) =>
          updateField(
            "branchName",
            value
          )
        }
        placeholder="Branch name"
      />

      <Field
        label="Account number"
        value={form.accountNumber}
        onChange={(value) =>
          updateField(
            "accountNumber",
            value
          )
        }
        placeholder="Account number"
      />

      <Field
        label="Confirm account number"
        value={
          form.confirmAccountNumber
        }
        onChange={(value) =>
          updateField(
            "confirmAccountNumber",
            value
          )
        }
        placeholder="Re-enter account number"
      />

      {isIndia ? (
        <Field
          label="IFSC code"
          value={form.ifscCode}
          onChange={(value) =>
            updateField(
              "ifscCode",
              value
            )
          }
          placeholder="IFSC"
        />
      ) : (
        <>
          <Field
            label="IBAN"
            value={form.iban}
            onChange={(value) =>
              updateField(
                "iban",
                value
              )
            }
            placeholder="If applicable"
          />

          <Field
            label="SWIFT / BIC"
            value={form.swiftCode}
            onChange={(value) =>
              updateField(
                "swiftCode",
                value
              )
            }
            placeholder="SWIFT / BIC"
          />

          <Field
            label="Routing number"
            value={
              form.routingNumber
            }
            onChange={(value) =>
              updateField(
                "routingNumber",
                value
              )
            }
            placeholder="If applicable"
          />
        </>
      )}

      <Field
        label="Bank country"
        value={
          form.bankCountry ||
          selectedCountry?.name ||
          ""
        }
        onChange={(value) =>
          updateField(
            "bankCountry",
            value
          )
        }
      />

      <Field
        label="Bank currency"
        value={
          form.bankCurrency ||
          selectedCountry
            ?.currency ||
          ""
        }
        onChange={(value) =>
          updateField(
            "bankCurrency",
            value
          )
        }
      />

      <Field
        label="Settlement currency"
        value={
          form.settlementCurrency
        }
        onChange={(value) =>
          updateField(
            "settlementCurrency",
            value
          )
        }
        placeholder={
          selectedCountry
            ?.currency ||
          "Currency"
        }
      />
    </div>
  );
}

function TaxStep({
  form,
  updateField,
  selectedCountry,
}) {
  const isIndia =
    selectedCountry?.code === "IN";

  return (
    <div className="bmt-form-grid">
      <label className="bmt-field">
        <span>
          Tax registration type
        </span>

        <select
          value={form.taxType}
          onChange={(event) =>
            updateField(
              "taxType",
              event.target.value
            )
          }
        >
          <option value="">
            Select tax type
          </option>

          {isIndia && (
            <option value="gst">
              GST
            </option>
          )}

          <option value="vat">
            VAT
          </option>

          <option value="sales-tax">
            Sales Tax
          </option>

          <option value="other">
            Other
          </option>

          <option value="not-registered">
            Not registered
          </option>
        </select>
      </label>

      <Field
        label="Tax registration number"
        value={
          form.taxRegistrationNumber
        }
        onChange={(value) =>
          updateField(
            "taxRegistrationNumber",
            value
          )
        }
        placeholder="VAT / GST / sales-tax number"
      />

      {isIndia && (
        <>
          <Field
            label="GST number"
            value={form.gstNumber}
            onChange={(value) =>
              updateField(
                "gstNumber",
                value
              )
            }
            placeholder="GSTIN, if registered"
          />

          <Field
            label="PAN number"
            value={form.panNumber}
            onChange={(value) =>
              updateField(
                "panNumber",
                value
              )
            }
            placeholder="PAN"
          />
        </>
      )}
    </div>
  );
}

function ContractStep({
  checked,
  onChange,
}) {
  return (
    <div className="bmt-contract-card">
      <h3>
        BMT Connect Partner Agreement
      </h3>

      <p>
        Review the commercial,
        operational, payout,
        cancellation, data and
        marketplace terms before
        submitting your application.
      </p>

      <label className="bmt-contract-checkbox">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) =>
            onChange(
              event.target.checked
            )
          }
        />

        <span>
          I am authorized to act
          for this business and I
          accept the BMT Connect
          Partner Agreement.
        </span>
      </label>
    </div>
  );
}

function ReviewStep({
  form,
  selectedCountry,
  selectedSubtype,
}) {
  return (
    <div className="bmt-review-card">
      <ReviewRow
        label="Country"
        value={
          selectedCountry?.name
        }
      />

      <ReviewRow
        label="Business type"
        value={
          form.businessType
        }
      />

      <ReviewRow
        label="Vertical"
        value={form.vertical}
      />

      <ReviewRow
        label="Subtype"
        value={
          selectedSubtype?.name ||
          form.subtype
        }
      />

      <ReviewRow
        label="Business"
        value={
          form.businessName
        }
      />

      {form.vertical ===
        "stay" && (
        <ReviewRow
          label="Property"
          value={
            form.propertyName
          }
        />
      )}

      <ReviewRow
        label="City"
        value={form.city}
      />

      <ReviewRow
        label="Owner"
        value={form.ownerName}
      />

      <ReviewRow
        label="Settlement"
        value={
          form.settlementCurrency ||
          selectedCountry
            ?.currency
        }
      />

      <ReviewRow
        label="Status after submit"
        value="Submitted for review"
      />
    </div>
  );
}

/* =====================================================
   COMMON
===================================================== */

function Field({
  label,
  type = "text",
  value = "",
  onChange,
  placeholder = "",
  disabled = false,
}) {
  return (
    <label className="bmt-field">
      <span>{label}</span>

      <input
        type={type}
        value={value ?? ""}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(event) =>
          onChange?.(
            event.target.value
          )
        }
      />
    </label>
  );
}

function TextAreaField({
  label,
  value = "",
  onChange,
  placeholder = "",
}) {
  return (
    <div className="bmt-form-span-2">
      <label className="bmt-field">
        <span>{label}</span>

        <textarea
          value={value ?? ""}
          placeholder={placeholder}
          onChange={(event) =>
            onChange?.(
              event.target.value
            )
          }
        />
      </label>
    </div>
  );
}

function ToggleField({
  label,
  checked,
  onChange,
}) {
  return (
    <label
      className={
        checked
          ? "bmt-checkbox-card checked"
          : "bmt-checkbox-card"
      }
    >
      <input
        type="checkbox"
        checked={Boolean(checked)}
        onChange={(event) =>
          onChange(
            event.target.checked
          )
        }
      />

      <span>{label}</span>
    </label>
  );
}

function UploadInfo({
  title,
  description,
}) {
  return (
    <div className="bmt-upload-box compact">
      <div className="bmt-upload-icon">
        ↑
      </div>

      <strong>{title}</strong>

      <p>{description}</p>
    </div>
  );
}

function NotApplicable({ text }) {
  return (
    <div className="bmt-empty-state">
      {text}
    </div>
  );
}

function ReviewRow({
  label,
  value,
}) {
  return (
    <div className="bmt-review-row">
      <span>{label}</span>

      <strong>
        {value || "—"}
      </strong>
    </div>
  );
}

function getStepDescription(
  step,
  vertical
) {
  const common = {
    1:
      "Registration adapts to country-specific tax, payout and compliance information.",
    2:
      "Tell us how your business is legally structured.",
    3:
      "Choose the BMT Connect supplier vertical you want to onboard.",
    4:
      "Select the subtype that best describes your supplier business.",
    5:
      "Enter the business and listing identity used by the backend.",
    6:
      "Add the operating or property location and time zone.",
    7:
      vertical === "stay"
        ? "Set the property's market classification and star rating."
        : "This vertical does not require a Stay classification.",
    8:
      vertical === "stay"
        ? "Configure initial property room/unit capacity."
        : "Inventory will be configured in the vertical dashboard.",
    9:
      vertical === "stay"
        ? "Choose the property facilities and services you provide."
        : "Services will be configured in the vertical dashboard.",
    10:
      vertical === "stay"
        ? "Set check-in/out and guest-facing property policies."
        : "Operating policies will be configured in the vertical dashboard.",
    11:
      "Add hosted property image and video references.",
    12:
      "Provide the authorized representative and government ID information.",
    13:
      "Provide licence and compliance identifiers required by the backend.",
    14:
      "Add logo and marketplace cover-media references.",
    15:
      "Configure country-aware bank and settlement information.",
    16:
      "Provide country-specific VAT, GST, sales-tax or equivalent information.",
    17:
      "Review and accept the BMT Connect Partner Agreement.",
    18:
      "Review the application before submitting it for approval.",
  };

  return common[step];
}
