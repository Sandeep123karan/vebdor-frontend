
// import React, { useEffect, useMemo, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import "./Onboarding.css";

// /* =====================================================
//    API
// ===================================================== */

// const API_BASE = process.env.REACT_APP_API_URL || "https://bmtvendorfinal.onrender.com";
// const SIGNUP_URL = `${API_BASE}/api/vendor/auth/signup`;

// /* =====================================================
//    OPTIONS
// ===================================================== */

// const COUNTRIES = [
//   { id: "india", name: "India", code: "IN", currency: "INR", phone: "+91", timezone: "Asia/Kolkata" },
//   { id: "uae", name: "United Arab Emirates", code: "AE", currency: "AED", phone: "+971", timezone: "Asia/Dubai" },
//   { id: "singapore", name: "Singapore", code: "SG", currency: "SGD", phone: "+65", timezone: "Asia/Singapore" },
//   { id: "usa", name: "United States", code: "US", currency: "USD", phone: "+1", timezone: "America/New_York" },
//   { id: "uk", name: "United Kingdom", code: "GB", currency: "GBP", phone: "+44", timezone: "Europe/London" },
//   { id: "thailand", name: "Thailand", code: "TH", currency: "THB", phone: "+66", timezone: "Asia/Bangkok" },
//   { id: "indonesia", name: "Indonesia", code: "ID", currency: "IDR", phone: "+62", timezone: "Asia/Jakarta" },
//   { id: "australia", name: "Australia", code: "AU", currency: "AUD", phone: "+61", timezone: "Australia/Sydney" },
// ];

// const BUSINESS_TYPES = [
//   "Individual Owner", "Sole Proprietorship", "Partnership", "LLP", "Private Company",
//   "Public Company", "Corporation", "Agency", "DMC", "Property Group", "Transport Operator",
//   "Fleet Owner", "Activity Operator", "Event Organizer", "Cruise Operator",
//   "Religious / Temple Trust", "Non-profit / Foundation", "Government / Public Authority", "Other",
// ];

// /* Backend enum values for the labels shown above. */
// const BUSINESS_TYPE_VALUES = {
//   "Individual Owner": "individual-owner",
//   "Sole Proprietorship": "sole-proprietorship",
//   Partnership: "partnership",
//   LLP: "llp",
//   "Private Company": "private-limited",
//   "Public Company": "public-limited",
//   Corporation: "corporation",
//   Agency: "agency",
//   DMC: "dmc",
//   "Property Group": "hotel-property-group",
//   "Transport Operator": "transport-operator",
//   "Fleet Owner": "fleet-owner",
//   "Activity Operator": "activity-operator",
//   "Event Organizer": "event-organizer",
//   "Cruise Operator": "cruise-operator",
//   "Religious / Temple Trust": "religious-darshan-operator",
//   "Non-profit / Foundation": "non-profit",
//   "Government / Public Authority": "government",
//   Other: "other",
// };

// const VERTICALS = [
//   { id: "stay", name: "Stay", description: "Hotels, resorts, villas, homestays and accommodation", icon: "🏨" },
//   { id: "bus", name: "Bus", description: "Bus operators, routes, fleet and scheduled trips", icon: "🚌" },
//   { id: "cab", name: "Cab", description: "Cab, taxi, rental and transfer operators", icon: "🚕" },
//   { id: "packages", name: "Tours", description: "Holiday packages, tours and DMC services", icon: "🧳" },
//   { id: "activities", name: "Activities", description: "Experiences, attractions and activities", icon: "🎟️" },
//   { id: "events", name: "Events", description: "Events, nightlife and ticketed experiences", icon: "🎉" },
//   { id: "darshan", name: "Darshan", description: "Temple, religious and spiritual experiences", icon: "🛕" },
//   { id: "cruise", name: "Cruise", description: "Cruise operators, ships and cabins", icon: "🚢" },
// ];

// const SUBTYPES = {
//   stay: [
//     { id: "hotel", name: "Hotel" },
//     { id: "resort", name: "Resort" },
//     { id: "homestay", name: "Homestay" },
//     { id: "villa", name: "Villa" },
//     { id: "apartment", name: "Apartment" },
//     { id: "hostel", name: "Hostel" },
//     { id: "motel", name: "Motel" },
//     { id: "guesthouse", name: "Guest House" },
//     { id: "vacation-home", name: "Vacation Home" },
//     { id: "palace", name: "Palace" },
//     { id: "campsite", name: "Campsite" },
//     { id: "farmhouse", name: "Farm Stay / Farmhouse" },
//     { id: "bnb", name: "B&B" },
//     { id: "lodge", name: "Lodge" },
//     { id: "inn", name: "Inn" },
//     { id: "serviced-apartment", name: "Serviced Apartment" },
//     { id: "camp", name: "Camp" },
//   ],
//   bus: [
//     { id: "intercity-bus-operator", name: "Intercity Bus Operator" },
//     { id: "tourist-bus-operator", name: "Tourist Bus Operator" },
//     { id: "shuttle-operator", name: "Shuttle Operator" },
//     { id: "sleeper-bus-operator", name: "Sleeper Bus Operator" },
//     { id: "luxury-coach-operator", name: "Luxury Coach Operator" },
//   ],
//   cab: [
//     { id: "independent-cab-owner", name: "Independent Cab Owner" },
//     { id: "fleet-owner", name: "Fleet Owner" },
//     { id: "airport-transfer-operator", name: "Airport Transfer Operator" },
//     { id: "car-rental-operator", name: "Car Rental Operator" },
//     { id: "chauffeur-service", name: "Chauffeur Service" },
//   ],
//   packages: [
//     { id: "tour-operator", name: "Tour Operator" },
//     { id: "travel-agency", name: "Travel Agency" },
//     { id: "dmc", name: "DMC" },
//     { id: "inbound-tour-operator", name: "Inbound Tour Operator" },
//     { id: "outbound-tour-operator", name: "Outbound Tour Operator" },
//   ],
//   activities: [
//     { id: "activity-operator", name: "Activity Operator" },
//     { id: "attraction", name: "Attraction" },
//     { id: "adventure-operator", name: "Adventure Operator" },
//     { id: "experience-host", name: "Experience Host" },
//   ],
//   events: [
//     { id: "event-organizer", name: "Event Organizer" },
//     { id: "nightlife-venue", name: "Nightlife Venue" },
//     { id: "concert-organizer", name: "Concert Organizer" },
//     { id: "festival-organizer", name: "Festival Organizer" },
//   ],
//   darshan: [
//     { id: "temple-trust", name: "Temple Trust" },
//     { id: "religious-operator", name: "Religious Operator" },
//     { id: "darshan-service-provider", name: "Darshan Service Provider" },
//     { id: "pilgrimage-operator", name: "Pilgrimage Operator" },
//   ],
//   cruise: [
//     { id: "cruise-line", name: "Cruise Line" },
//     { id: "cruise-operator", name: "Cruise Operator" },
//     { id: "river-cruise", name: "River Cruise" },
//     { id: "yacht-operator", name: "Yacht Operator" },
//   ],
// };

// const STEPS = [
//   { id: 1, key: "country", title: "Country" },
//   { id: 2, key: "businessType", title: "Business Type" },
//   { id: 3, key: "vertical", title: "Choose Vertical" },
//   { id: 4, key: "subtype", title: "Choose Subtype" },
//   { id: 5, key: "basics", title: "Property Basics" },
//   { id: 6, key: "location", title: "Location" },
//   { id: 7, key: "classification", title: "Classification" },
//   { id: 8, key: "units", title: "Rooms & Units" },
//   { id: 9, key: "amenities", title: "Amenities & Services" },
//   { id: 10, key: "policies", title: "Rules & Policies" },
//   { id: 11, key: "photos", title: "Photos & Videos" },
//   { id: 12, key: "kyc", title: "Owner / KYC" },
//   { id: 13, key: "documents", title: "Documents" },
//   { id: 14, key: "media", title: "Media" },
//   { id: 15, key: "bank", title: "Bank & Payout" },
//   { id: 16, key: "tax", title: "Tax" },
//   { id: 17, key: "contract", title: "Contract" },
//   { id: 18, key: "review", title: "Review & Submit" },
// ];

// /* =====================================================
//    VERTICAL-SPECIFIC STEP CONFIG
//    Cruise, Tours (packages), Activities, Events, Darshan.
//    Stay ke steps neeche alag components me hain.

//    Naya field add karna ho to bas yaha ek line add karo.
//    Field flags:
//      required : validation
//      positive : number > 0 hona chahiye
//      root     : value form[name] me store hoti hai (vd me nahi)
//      out      : payload me is naam se jaayega
// ===================================================== */

// const fText = (name, label, x = {}) => ({ name, label, type: "text", ...x });
// const fNum = (name, label, x = {}) => ({ name, label, type: "number", ...x });
// const fArea = (name, label, x = {}) => ({ name, label, type: "textarea", ...x });
// const fSel = (name, label, options, x = {}) => ({ name, label, type: "select", options, ...x });
// const fChips = (name, label, options, x = {}) => ({ name, label, type: "chips", options, ...x });
// const fToggle = (name, label) => ({ name, label, type: "toggle" });
// const fTime = (name, label, x = {}) => ({ name, label, type: "time", ...x });
// const fUrls = (name, label, x = {}) => ({ name, label, type: "urls", ...x });

// /* Image / video URL fields (raw text, root level) */
// const fImages = (label, required = false) =>
//   fUrls("propertyImagesText", label, {
//     root: true, out: "propertyImages", required, placeholder: "One URL per line",
//   });
// const fVideos = (label) =>
//   fUrls("videosText", label, { root: true, out: "videos", placeholder: "One URL per line" });

// const cancelRefund = [
//   fArea("cancellationPolicy", "Cancellation policy", {
//     required: true, placeholder: "Free cancellation kab tak, uske baad kitna charge",
//   }),
//   fArea("refundPolicy", "Refund policy", {
//     required: true, placeholder: "Refund kitne din me aur kis mode me",
//   }),
// ];

// const VERTICAL_CONFIG = {
//   /* ------------------- CRUISE ------------------- */
//   cruise: {
//     key: "cruiseDetails",
//     steps: {
//       5: {
//         section: "basic",
//         title: "Cruise Basic Details",
//         desc: "Enter your cruise operator and contact details.",
//         fields: [
//           fText("cruiseOperatorName", "Cruise operator name", { required: true }),
//           fText("cruiseLineName", "Cruise line name", { required: true }),
//           fText("businessRegistrationNumber", "Business registration number", { root: true }),
//           fText("contactPerson", "Contact person"),
//           fText("businessEmail", "Business email"),
//           fText("businessPhone", "Business phone"),
//         ],
//       },
//       7: {
//         section: "classification",
//         title: "Cruise Classification",
//         desc: "Select the type of cruise service you provide.",
//         fields: [
//           fSel("cruiseType", "Cruise type", [
//             "ocean_cruise", "river_cruise", "luxury_cruise", "expedition_cruise", "yacht_cruise",
//           ], { required: true }),
//           fSel("cruiseOperatorType", "Operator type", [
//             "cruise_line", "cruise_operator", "river_cruise_operator", "yacht_operator",
//           ], { required: true }),
//           fSel("vesselType", "Vessel type", [
//             "passenger_ship", "river_ship", "yacht", "catamaran", "expedition_ship",
//           ], { required: true }),
//           fSel("cruiseCategory", "Service category", [
//             "standard", "premium", "luxury", "ultra_luxury",
//           ], { required: true }),
//           fArea("cruiseExperience", "Cruise experience", {
//             placeholder: "Routes, onboard services, activities etc.",
//           }),
//         ],
//       },
//       8: {
//         section: "ship",
//         title: "Ship, Cabins & Route",
//         desc: "Add ship details, passenger capacity, cabins and route information.",
//         fields: [
//           fText("shipName", "Ship name", { required: true }),
//           fText("imoNumber", "IMO number"),
//           fText("shipRegistrationNumber", "Ship registration number"),
//           fNum("yearBuilt", "Year built", { placeholder: "e.g. 2022" }),
//           fNum("passengerCapacity", "Passenger capacity", { required: true, positive: true }),
//           fNum("crewCapacity", "Crew capacity"),
//           fNum("numberOfDecks", "Number of decks"),
//           fNum("numberOfCabins", "Total cabins", { required: true, positive: true }),
//           fArea("cabinTypes", "Cabin types", {
//             required: true, placeholder: "Interior, Ocean View, Balcony, Suite",
//           }),
//           fText("departurePort", "Departure port", { required: true, placeholder: "e.g. Mumbai Port" }),
//           fText("destinationPort", "Main destination", { required: true, placeholder: "e.g. Goa" }),
//           fText("cruiseDuration", "Cruise duration", { required: true, placeholder: "e.g. 3 Nights / 4 Days" }),
//           fTime("embarkationTime", "Embarkation time"),
//         ],
//       },
//       9: {
//         section: "amenities",
//         title: "Onboard Amenities",
//         desc: "Select all facilities available onboard.",
//         fields: [
//           fChips("cruiseAmenities", "Amenities", [
//             "Swimming Pool", "Kids Pool", "Restaurant", "Buffet", "Bar & Lounge", "Spa",
//             "Gym & Fitness Center", "Wi-Fi", "Room Service", "24/7 Reception", "Entertainment",
//             "Live Shows", "Theatre", "Casino", "Kids Club", "Play Area", "Shopping",
//             "Beauty Salon", "Medical Facility", "Laundry", "Conference / Business Center",
//             "Outdoor Deck", "Jacuzzi", "Sports Activities", "Excursion Services",
//           ], { required: true }),
//         ],
//       },
//       10: {
//         section: "policies",
//         title: "Cruise Policies",
//         desc: "Policies for bookings, passengers and the onboard experience.",
//         fields: [
//           ...cancelRefund,
//           fArea("childPolicy", "Child policy", { required: true }),
//           fArea("infantPolicy", "Infant policy"),
//           fArea("passengerEligibility", "Passenger eligibility", { placeholder: "Age limits, requirements" }),
//           fArea("baggagePolicy", "Baggage policy", { required: true }),
//           fArea("passportVisaPolicy", "Passport / visa requirements", { required: true }),
//           fArea("checkInPolicy", "Check-in / boarding policy", { required: true }),
//           fArea("medicalPolicy", "Medical / health requirements"),
//           fArea("specialRequirements", "Special requirements", {
//             placeholder: "Wheelchair assistance, dietary needs, special requests",
//           }),
//         ],
//       },
//       11: {
//         section: "media",
//         title: "Cruise Photos & Videos",
//         desc: "Add hosted image and video links for your cruise.",
//         fields: [
//           fText("logo", "Cruise operator logo URL", { root: true, required: true, placeholder: "https://.../logo.png" }),
//           fText("coverImage", "Cruise / ship cover image URL", { root: true, required: true, placeholder: "https://.../cover.jpg" }),
//           fImages("Ship / cabin / onboard image URLs", true),
//           fVideos("Cruise video URLs"),
//         ],
//       },
//       13: {
//         section: "documents",
//         title: "Maritime Licences & Certificates",
//         desc: "Licence and safety certificate numbers for your vessel.",
//         fields: [
//           fText("maritimeLicenseNumber", "Maritime / operator licence no."),
//           fText("portAuthorityPermit", "Port authority permit no."),
//           fText("safetyManagementCertificate", "Safety management (ISM) certificate no."),
//           fText("insurancePolicyNumber", "Passenger liability insurance policy no."),
//         ],
//       },
//     },
//   },

//   /* ------------------- TOURS / PACKAGES ------------------- */
//   packages: {
//     key: "packageDetails",
//     steps: {
//       5: {
//         section: "basic",
//         withBasic: true,
//         title: "Tour Company Details",
//         desc: "Tell travellers who you are and what makes your tours different.",
//         fields: [
//           fText("tagline", "Tagline", { placeholder: "e.g. Handcrafted Himalayan journeys" }),
//           fNum("yearsInBusiness", "Years in business"),
//           fNum("teamSize", "Team size"),
//           fText("languages", "Languages spoken", { placeholder: "Hindi, English, French" }),
//           fText("supportPhone", "Customer support phone"),
//           fText("supportEmail", "Customer support email"),
//           fArea("description", "About your company", { placeholder: "Short introduction for the marketplace listing" }),
//         ],
//       },
//       7: {
//         section: "classification",
//         title: "Tour Classification",
//         desc: "Choose the type of holidays you sell.",
//         fields: [
//           fSel("operatingRegion", "Operating region", ["Domestic", "International", "Both"], { required: true }),
//           fChips("packageCategories", "Package categories", [
//             "Honeymoon", "Family", "Adventure", "Pilgrimage", "Luxury", "Budget", "Wildlife",
//             "Beach", "Hill Stations", "Corporate / MICE", "Cultural", "Weekend Getaway",
//           ], { required: true }),
//           fChips("tourStyles", "Tour style", ["Group tours", "Private tours", "Fixed departures", "Fully customised"]),
//           fArea("destinationsCovered", "Destinations covered", {
//             required: true, placeholder: "Manali, Kashmir, Goa, Bali, Dubai...",
//           }),
//         ],
//       },
//       8: {
//         section: "inventory",
//         title: "Packages & Capacity",
//         desc: "Initial package inventory. Full itineraries dashboard me add hongi.",
//         fields: [
//           fNum("activePackages", "Number of active packages", { required: true }),
//           fText("departureCities", "Departure cities", { placeholder: "Delhi, Mumbai, Chandigarh" }),
//           fText("typicalDurations", "Typical durations", { placeholder: "3N/4D, 5N/6D, 7N/8D" }),
//           fNum("startingPrice", "Starting price per person"),
//           fNum("minGroupSize", "Minimum group size"),
//           fNum("maxGroupSize", "Maximum group size"),
//           fToggle("hasOwnTransport", "Own vehicles / transport"),
//           fToggle("guidesAvailable", "In-house tour guides"),
//         ],
//       },
//       9: {
//         section: "amenities",
//         title: "Inclusions & Services",
//         desc: "What is usually included in your packages?",
//         fields: [
//           fChips("services", "Services offered", [
//             "Hotel stay", "Meals", "Airport / station transfers", "Sightseeing", "Tour guide",
//             "Flights", "Train tickets", "Visa assistance", "Travel insurance", "Entry tickets",
//             "24x7 trip support", "Customisation",
//           ], { required: true }),
//         ],
//       },
//       10: {
//         section: "policies",
//         title: "Booking Policies",
//         desc: "Cancellation, payment and traveller terms.",
//         fields: [
//           ...cancelRefund,
//           fArea("paymentPolicy", "Payment policy", { placeholder: "Advance %, balance payment date" }),
//           fArea("childPolicy", "Child policy"),
//           fArea("exclusions", "Not included"),
//           fArea("termsAndConditions", "Other terms & conditions"),
//         ],
//       },
//       11: {
//         section: "media",
//         title: "Tour Photos & Videos",
//         desc: "Hosted image / video links of your best tours.",
//         fields: [
//           fImages("Tour image URLs", true),
//           fVideos("Video URLs"),
//           fText("brochureUrl", "Brochure / sample itinerary URL"),
//         ],
//       },
//       13: {
//         section: "documents",
//         title: "Licences & Certificates",
//         desc: "Licence numbers for tour operations.",
//         fields: [
//           fText("tourismLicenseNumber", "Tourism / tour operator licence no."),
//           fText("iataNumber", "IATA / TAAI / ADTOI membership no."),
//           fText("insurancePolicyNumber", "Liability insurance policy no."),
//           fText("registrationLicenseNumber", "Company registration / shop & establishment no."),
//         ],
//       },
//     },
//   },

//   /* ------------------- ACTIVITIES ------------------- */
//   activities: {
//     key: "activityDetails",
//     steps: {
//       5: {
//         section: "basic",
//         withBasic: true,
//         title: "Activity Business Details",
//         desc: "Introduce your experiences to customers.",
//         fields: [
//           fText("tagline", "Tagline", { placeholder: "e.g. Rafting & camping on the Beas" }),
//           fNum("yearsInBusiness", "Years in business"),
//           fText("languages", "Languages spoken"),
//           fText("supportPhone", "Customer support phone"),
//           fText("meetingPoint", "Main meeting / check-in point", { placeholder: "Address or landmark" }),
//           fArea("description", "About your business", { placeholder: "What guests can expect" }),
//         ],
//       },
//       7: {
//         section: "classification",
//         title: "Activity Classification",
//         desc: "Choose the kind of experiences you run.",
//         fields: [
//           fChips("activityCategories", "Activity categories", [
//             "Water sports", "Trekking", "Paragliding", "Safari", "Rafting", "Camping",
//             "Sightseeing", "Cultural", "Theme park", "Museum / attraction", "Food tour", "Wellness",
//           ], { required: true }),
//           fSel("difficultyLevel", "Difficulty level", ["Easy", "Moderate", "Challenging", "Extreme"], { required: true }),
//           fSel("experienceType", "Experience type", ["Group", "Private", "Both"]),
//           fSel("setting", "Setting", ["Outdoor", "Indoor", "Both"]),
//         ],
//       },
//       8: {
//         section: "inventory",
//         title: "Capacity & Schedule",
//         desc: "Slot capacity and timing for your experiences.",
//         fields: [
//           fNum("totalActivities", "Number of activities offered", { required: true }),
//           fNum("maxParticipantsPerSlot", "Max participants per slot", { required: true }),
//           fNum("slotsPerDay", "Slots per day"),
//           fNum("durationMinutes", "Typical duration (minutes)"),
//           fNum("minAge", "Minimum age"),
//           fNum("maxAge", "Maximum age"),
//           fNum("startingPrice", "Starting price per person"),
//           fText("operatingMonths", "Operating months", { placeholder: "e.g. Oct - Jun" }),
//           fTime("openingTime", "Opening time"),
//           fTime("closingTime", "Closing time"),
//           fToggle("pickupAvailable", "Pickup / drop available"),
//           fToggle("privateBookingAvailable", "Private booking available"),
//         ],
//       },
//       9: {
//         section: "amenities",
//         title: "Facilities & Inclusions",
//         desc: "What do guests get with the experience?",
//         fields: [
//           fChips("facilities", "Facilities & inclusions", [
//             "Safety gear", "Trained instructor", "Guide", "Photos / videos", "Refreshments",
//             "Transport", "Lockers", "Changing room", "First aid", "Insurance included",
//             "Equipment rental", "Parking",
//           ], { required: true }),
//         ],
//       },
//       10: {
//         section: "policies",
//         title: "Safety & Booking Policies",
//         desc: "Safety rules and cancellation terms.",
//         fields: [
//           ...cancelRefund,
//           fArea("safetyRules", "Safety rules", {
//             required: true, placeholder: "Briefing, gear, guidelines guests must follow",
//           }),
//           fArea("healthRestrictions", "Age / health restrictions"),
//           fArea("weatherPolicy", "Weather / force majeure policy"),
//           fArea("whatToBring", "What to bring / dress code"),
//         ],
//       },
//       11: {
//         section: "media",
//         title: "Activity Photos & Videos",
//         desc: "Hosted image / video links of your experiences.",
//         fields: [fImages("Activity image URLs", true), fVideos("Video URLs")],
//       },
//       13: {
//         section: "documents",
//         title: "Licences & Safety Certificates",
//         desc: "Permits required for running activities.",
//         fields: [
//           fText("activityLicenseNumber", "Activity / adventure operator licence no."),
//           fText("safetyCertificateNumber", "Safety certificate no."),
//           fText("insurancePolicyNumber", "Liability insurance policy no."),
//           fText("instructorCertification", "Instructor / guide certification no."),
//           fText("forestPermitNumber", "Forest / local authority permit no."),
//         ],
//       },
//     },
//   },

//   /* ------------------- EVENTS ------------------- */
//   events: {
//     key: "eventDetails",
//     steps: {
//       5: {
//         section: "basic",
//         withBasic: true,
//         title: "Organizer Details",
//         desc: "Tell audiences who is behind the events.",
//         fields: [
//           fText("tagline", "Tagline"),
//           fNum("yearsInBusiness", "Years organizing events"),
//           fNum("eventsHosted", "Events hosted so far"),
//           fText("supportPhone", "Customer support phone"),
//           fText("instagram", "Instagram / social link"),
//           fArea("description", "About the organizer / venue", {
//             placeholder: "Type of events, audience, highlights",
//           }),
//         ],
//       },
//       7: {
//         section: "classification",
//         title: "Event Classification",
//         desc: "What kind of events do you host?",
//         fields: [
//           fChips("eventCategories", "Event categories", [
//             "Concert", "Festival", "Nightlife / club", "Comedy", "Workshop", "Sports",
//             "Exhibition", "Conference", "Cultural", "Theatre",
//           ], { required: true }),
//           fSel("venueType", "Venue type", ["Indoor", "Outdoor", "Both"], { required: true }),
//           fSel("ageRestriction", "Age restriction", ["All ages", "18+", "21+"], { required: true }),
//         ],
//       },
//       8: {
//         section: "inventory",
//         title: "Venue & Ticketing",
//         desc: "Capacity and ticketing details.",
//         fields: [
//           fText("venueName", "Venue name"),
//           fNum("venueCapacity", "Maximum capacity", { required: true }),
//           fSel("seatingType", "Seating type", ["Standing", "Seated", "Mixed"]),
//           fNum("eventsPerMonth", "Typical events per month"),
//           fNum("ticketPriceFrom", "Ticket price from"),
//           fNum("parkingCapacity", "Parking capacity"),
//           fToggle("hasTicketTiers", "Multiple ticket tiers (Early bird / VIP)"),
//           fToggle("hasTableBooking", "Table / group bookings"),
//         ],
//       },
//       9: {
//         section: "amenities",
//         title: "Venue Facilities",
//         desc: "Facilities available at your events.",
//         fields: [
//           fChips("facilities", "Facilities", [
//             "Sound system", "Stage", "Lighting", "VIP area", "Bar", "Food court", "Cloakroom",
//             "Parking", "Valet", "Security staff", "Medical desk", "Wheelchair access", "Green room",
//           ], { required: true }),
//         ],
//       },
//       10: {
//         section: "policies",
//         title: "Entry & Ticket Policies",
//         desc: "Entry rules and refund terms.",
//         fields: [
//           ...cancelRefund,
//           fArea("entryPolicy", "Entry policy", {
//             required: true, placeholder: "ID check, entry timing, re-entry rules",
//           }),
//           fArea("reschedulePolicy", "Event postponed / cancelled by organizer"),
//           fArea("dressCode", "Dress code"),
//           fArea("prohibitedItems", "Prohibited items"),
//         ],
//       },
//       11: {
//         section: "media",
//         title: "Event Photos & Videos",
//         desc: "Hosted image / video links from past events and venue.",
//         fields: [fImages("Event / venue image URLs", true), fVideos("Video / aftermovie URLs")],
//       },
//       13: {
//         section: "documents",
//         title: "Permits & Licences",
//         desc: "Permits required for hosting events.",
//         fields: [
//           fText("eventPermitNumber", "Event permission / police NOC no."),
//           fText("venueLicenseNumber", "Venue licence no."),
//           fText("entertainmentLicenseNumber", "Entertainment / music licence (PPL / IPRS) no."),
//           fText("fireNocNumber", "Fire NOC no."),
//           fText("liquorLicenseNumber", "Liquor licence no. (if applicable)"),
//         ],
//       },
//     },
//   },

//   /* ------------------- DARSHAN ------------------- */
//   darshan: {
//     key: "darshanDetails",
//     steps: {
//       5: {
//         section: "basic",
//         withBasic: true,
//         title: "Temple / Trust Details",
//         desc: "Details of the religious place or service you represent.",
//         fields: [
//           fText("mainDeity", "Main deity / place of worship", { required: true }),
//           fSel("tradition", "Tradition", [
//             "Hindu", "Sikh", "Buddhist", "Jain", "Christian", "Muslim", "Other",
//           ], { required: true }),
//           fNum("establishedYear", "Established year"),
//           fText("supportPhone", "Devotee support phone"),
//           fArea("description", "About", { placeholder: "History, significance, what devotees can book" }),
//         ],
//       },
//       7: {
//         section: "classification",
//         title: "Darshan Classification",
//         desc: "Choose the services you provide.",
//         fields: [
//           fSel("placeType", "Type of place", [
//             "Temple", "Gurudwara", "Monastery", "Church", "Dargah", "Pilgrimage operator", "Other",
//           ], { required: true }),
//           fChips("serviceCategories", "Services offered", [
//             "Darshan booking", "VIP / special darshan", "Puja / aarti / seva", "Abhishek",
//             "Prasad delivery", "Online puja", "Pilgrimage tours", "Accommodation assistance",
//           ], { required: true }),
//           fSel("accessLevel", "Access levels", ["General only", "General + VIP", "General + VIP + Special"]),
//         ],
//       },
//       8: {
//         section: "inventory",
//         title: "Timings & Capacity",
//         desc: "Darshan timings and slot capacity.",
//         fields: [
//           fTime("openingTime", "Opening time", { required: true }),
//           fTime("closingTime", "Closing time", { required: true }),
//           fText("closedDays", "Closed days / special closures"),
//           fNum("dailyCapacity", "Daily darshan capacity", { required: true }),
//           fNum("slotDurationMinutes", "Slot duration (minutes)"),
//           fNum("startingPrice", "Starting ticket / seva price"),
//           fToggle("freeDarshanAvailable", "Free darshan available"),
//           fToggle("vipDarshanAvailable", "VIP darshan available"),
//           fToggle("seniorCitizenSlots", "Senior citizen slots"),
//           fToggle("wheelchairAssistance", "Wheelchair assistance"),
//         ],
//       },
//       9: {
//         section: "amenities",
//         title: "Devotee Facilities",
//         desc: "Facilities available for devotees.",
//         fields: [
//           fChips("facilities", "Facilities", [
//             "Prasad counter", "Cloak room", "Lockers", "Footwear stand", "Drinking water",
//             "Medical aid", "Parking", "Guide services", "Accommodation", "Annadanam / Langar",
//             "Wheelchair access", "Donation counter",
//           ], { required: true }),
//         ],
//       },
//       10: {
//         section: "policies",
//         title: "Entry Rules & Policies",
//         desc: "Rules devotees must follow and booking terms.",
//         fields: [
//           ...cancelRefund,
//           fArea("dressCode", "Dress code", { required: true, placeholder: "e.g. Traditional wear, no shorts" }),
//           fArea("cameraPolicy", "Photography / mobile policy"),
//           fArea("idRequirement", "ID requirement for booking"),
//           fArea("entryRules", "Other entry rules"),
//           fArea("specialDaysNote", "Festival / special day rules"),
//         ],
//       },
//       11: {
//         section: "media",
//         title: "Photos & Videos",
//         desc: "Hosted image / video links of the place and services.",
//         fields: [fImages("Image URLs", true), fVideos("Video URLs")],
//       },
//       13: {
//         section: "documents",
//         title: "Trust & Permission Documents",
//         desc: "Registration and authority permissions.",
//         fields: [
//           fText("trustRegistrationNumber", "Trust / society registration no."),
//           fText("templeAuthorityPermission", "Temple board / authority permission no."),
//           fText("section80gNumber", "80G / 12A registration no."),
//           fText("fcraNumber", "FCRA registration no. (if applicable)"),
//         ],
//       },
//     },
//   },
// };

// /* Stay media step uses the same field renderer. */
// const STAY_MEDIA_FIELDS = [
//   fImages("Property image URLs"),
//   fVideos("Video URLs"),
// ];

// const splitLines = (value) =>
//   String(value || "")
//     .split(/\n|,/)
//     .map((item) => item.trim())
//     .filter(Boolean);

// const isEmptyValue = (value) =>
//   Array.isArray(value)
//     ? value.length === 0
//     : value === undefined || value === null || String(value).trim() === "";

// const getFieldValue = (form, field) =>
//   field.root ? form[field.name] : (form.vd || {})[field.name];

// function coerceField(field, raw) {
//   if (field.type === "urls") return splitLines(raw);
//   if (field.type === "number") return raw === undefined || raw === "" || raw === null ? null : Number(raw);
//   if (field.type === "chips") return Array.isArray(raw) ? raw : [];
//   if (field.type === "toggle") return Boolean(raw);
//   return raw || "";
// }

// function validateConfigStep(step, form) {
//   const stepCfg = VERTICAL_CONFIG[form.vertical]?.steps[step];
//   if (!stepCfg) return "";
//   for (const field of stepCfg.fields) {
//     const value = getFieldValue(form, field);

//     if (field.required && isEmptyValue(value)) {
//       return `${field.label} is required.`;
//     }

//     if (field.positive && !isEmptyValue(value) && Number(value) <= 0) {
//       return `${field.label} must be greater than 0.`;
//     }
//   }

//   return "";
// }

// /* Grouped details for Tours / Activities / Events / Darshan. */
// function buildGroupedDetails(form) {
//   const cfg = VERTICAL_CONFIG[form.vertical];
//   const out = {};

//   Object.values(cfg.steps).forEach((stepCfg) => {
//     out[stepCfg.section] = out[stepCfg.section] || {};

//     stepCfg.fields.forEach((field) => {
//       out[stepCfg.section][field.out || field.name] = coerceField(
//         field,
//         getFieldValue(form, field)
//       );
//     });
//   });

//   out.media = {
//     ...(out.media || {}),
//     logo: form.logo || "",
//     coverImage: form.coverImage || "",
//   };

//   return out;
// }

// /* Cruise keeps the payload shape your backend already expects. */
// function buildCruiseDetails(form) {
//   const v = form.vd || {};
//   const num = (x) => Number(x || 0);

//   return {
//     cruiseOperatorName: v.cruiseOperatorName || "",
//     cruiseLineName: v.cruiseLineName || "",
//     cruiseType: v.cruiseType || "",
//     cruiseOperatorType: v.cruiseOperatorType || "",
//     vesselType: v.vesselType || "",
//     cruiseCategory: v.cruiseCategory || "",
//     cruiseExperience: v.cruiseExperience || "",

//     shipName: v.shipName || "",
//     imoNumber: v.imoNumber || "",
//     shipRegistrationNumber: v.shipRegistrationNumber || "",
//     yearBuilt: v.yearBuilt || "",
//     passengerCapacity: num(v.passengerCapacity),
//     crewCapacity: num(v.crewCapacity),
//     numberOfDecks: num(v.numberOfDecks),
//     numberOfCabins: num(v.numberOfCabins),
//     cabinTypes: v.cabinTypes || "",

//     departurePort: v.departurePort || "",
//     destinationPort: v.destinationPort || "",
//     cruiseDuration: v.cruiseDuration || "",
//     embarkationTime: v.embarkationTime || "",

//     amenities: Array.isArray(v.cruiseAmenities) ? v.cruiseAmenities : [],

//     policies: {
//       cancellation: v.cancellationPolicy || "",
//       refund: v.refundPolicy || "",
//       child: v.childPolicy || "",
//       infant: v.infantPolicy || "",
//       passengerEligibility: v.passengerEligibility || "",
//       baggage: v.baggagePolicy || "",
//       passportVisa: v.passportVisaPolicy || "",
//       checkIn: v.checkInPolicy || "",
//       medical: v.medicalPolicy || "",
//       specialRequirements: v.specialRequirements || "",
//     },

//     contact: {
//       contactPerson: v.contactPerson || "",
//       businessEmail: v.businessEmail || "",
//       businessPhone: v.businessPhone || "",
//     },

//     media: {
//       logo: form.logo || "",
//       coverImage: form.coverImage || "",
//       images: splitLines(form.propertyImagesText),
//       videos: splitLines(form.videosText),
//     },

//     documents: {
//       maritimeLicenseNumber: v.maritimeLicenseNumber || "",
//       portAuthorityPermit: v.portAuthorityPermit || "",
//       safetyManagementCertificate: v.safetyManagementCertificate || "",
//       insurancePolicyNumber: v.insurancePolicyNumber || "",
//     },
//   };
// }

// function getStepTitle(step, vertical) {
//   return (
//     VERTICAL_CONFIG[vertical]?.steps[step]?.title ||
//     STEPS[step - 1].title
//   );
// }

// function getStepDescription(step, vertical) {
//   const custom = VERTICAL_CONFIG[vertical]?.steps[step]?.desc;
//   if (custom) return custom;

//   const isStay = vertical === "stay";

//   const common = {
//     1: "Registration adapts to country-specific tax, payout and compliance information.",
//     2: "Tell us how your business is legally structured.",
//     3: "Choose the BMT Connect supplier vertical you want to onboard.",
//     4: "Select the subtype that best describes your supplier business.",
//     5: "Enter the business and listing identity used by the backend.",
//     6: "Add the operating or property location and time zone.",
//     7: isStay
//       ? "Set the property's market classification and star rating."
//       : "This vertical does not require a Stay classification.",
//     8: isStay
//       ? "Configure initial property room/unit capacity."
//       : "Inventory will be configured in the vertical dashboard.",
//     9: isStay
//       ? "Choose the property facilities and services you provide."
//       : "Services will be configured in the vertical dashboard.",
//     10: isStay
//       ? "Set check-in/out and guest-facing property policies."
//       : "Operating policies will be configured in the vertical dashboard.",
//     11: "Add hosted property image and video references.",
//     12: "Provide the authorized representative and government ID information.",
//     13: "Provide licence and compliance identifiers required by the backend.",
//     14: "Add logo and marketplace cover-media references.",
//     15: "Configure country-aware bank and settlement information.",
//     16: "Provide country-specific VAT, GST, sales-tax or equivalent information.",
//     17: "Review and accept the BMT Connect Partner Agreement.",
//     18: "Review the application before submitting it for approval.",
//   };

//   return common[step];
// }

// /* =====================================================
//    LOCAL STORAGE
// ===================================================== */

// const DRAFT_KEY_PREFIX = "bmtPartnerOnboardingDraft";
// const VERTICAL_KEY_PREFIX = "bmtPartnerSelectedVertical";

// function decodePartnerToken() {
//   try {
//     const token = localStorage.getItem("token") || "";
//     const part = token.split(".")[1];
//     if (!part) return {};
//     const normalized = part.replace(/-/g, "+").replace(/_/g, "/");
//     const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
//     return JSON.parse(decodeURIComponent(escape(atob(padded))));
//   } catch {
//     return {};
//   }
// }

// function getPartnerAccount() {
//   let storedUser = {};
//   try {
//     storedUser = JSON.parse(localStorage.getItem("user") || "{}");
//   } catch {
//     storedUser = {};
//   }

//   const claims = decodePartnerToken();
//   const id = String(
//     claims.id || claims._id || claims.userId || claims.partnerId || claims.sub ||
//       storedUser._id || storedUser.id || storedUser.userId || storedUser.partnerId || ""
//   ).trim();
//   const email = String(
//     claims.email || storedUser.email || storedUser.businessEmail || ""
//   ).trim().toLowerCase();

//   // Token/user identity scopes browser drafts to the signed-in Partner account.
//   const identity = id || email;
//   return { id, email, identity };
// }

// function storageSafeIdentity(value) {
//   return encodeURIComponent(String(value || "").trim().toLowerCase());
// }

// function getDraftKey() {
//   const { identity } = getPartnerAccount();
//   return identity
//     ? `${DRAFT_KEY_PREFIX}:${storageSafeIdentity(identity)}`
//     : `${DRAFT_KEY_PREFIX}:anonymous`;
// }

// function getVerticalKey() {
//   const { identity } = getPartnerAccount();
//   return identity
//     ? `${VERTICAL_KEY_PREFIX}:${storageSafeIdentity(identity)}`
//     : `${VERTICAL_KEY_PREFIX}:anonymous`;
// }

// function loadDraft() {
//   try {
//     return JSON.parse(localStorage.getItem(getDraftKey()) || "{}");
//   } catch {
//     return {};
//   }
// }

// function normalizeStoredSubtype(value) {
//   if (!value) return "";

//   const raw = String(value).toLowerCase().trim().replace(/\s+/g, "-");

//   const aliases = {
//     "guest-house": "guesthouse",
//     "vacation-home": "vacation-home",
//     campsite: "campsite",
//     camp: "campsite",
//     "other-accommodation": "other",
//   };

//   return aliases[raw] || raw;
// }

// /* =====================================================
//    FORM DEFAULTS
// ===================================================== */

// const DEFAULT_FORM = {
//   country: "",
//   businessType: "",
//   vertical: "",
//   subtype: "",

//   businessName: "",
//   legalBusinessName: "",
//   propertyName: "",
//   displayName: "",
//   businessRegistrationNumber: "",
//   businessLicenseNumber: "",
//   website: "",

//   addressLine1: "",
//   addressLine2: "",
//   locality: "",
//   landmark: "",
//   city: "",
//   district: "",
//   state: "",
//   postalCode: "",
//   timezone: "",
//   latitude: "",
//   longitude: "",

//   classification: "",
//   starRating: "",
//   totalUnits: "",
//   totalRooms: "",
//   totalFloors: "",
//   totalBuildings: "",
//   maximumGuests: "",
//   unitType: "",

//   amenities: [],
//   customAmenities: "",
//   checkInFrom: "14:00",
//   checkOutUntil: "11:00",
//   frontDesk24Hours: false,
//   selfCheckIn: false,
//   wifiAvailable: false,
//   freeWifi: false,
//   parkingAvailable: false,
//   restaurantAvailable: false,
//   breakfastAvailable: false,
//   airportTransferAvailable: false,
//   childrenAllowed: true,
//   petsAllowed: false,
//   smokingAllowed: false,

//   cancellationPolicy: "",
//   noShowPolicy: "",
//   modificationPolicy: "",
//   paymentPolicy: "",

//   ownerName: "",
//   ownerPhone: "",
//   governmentIdType: "",
//   governmentIdNumber: "",
//   propertyRegistrationNumber: "",
//   tourismLicenseNumber: "",
//   fireSafetyCertificateNumber: "",
//   foodLicenseNumber: "",

//   logo: "",
//   coverImage: "",
//   propertyImagesText: "",
//   videosText: "",

//   bankCountry: "",
//   bankCurrency: "",
//   bankName: "",
//   branchName: "",
//   accountHolderName: "",
//   accountNumber: "",
//   confirmAccountNumber: "",
//   ifscCode: "",
//   iban: "",
//   swiftCode: "",
//   routingNumber: "",
//   settlementCurrency: "",

//   taxType: "",
//   taxRegistrationNumber: "",
//   gstNumber: "",
//   panNumber: "",

//   contractAccepted: false,

//   /* Vertical-specific answers (Cruise / Tours / Activities / Events / Darshan) */
//   vd: {},
// };

// function buildInitialForm(d) {
//   return {
//     ...DEFAULT_FORM,
//     ...d,

//     vertical: d.vertical || localStorage.getItem(getVerticalKey()) || "",
//     subtype: normalizeStoredSubtype(d.subtype || ""),

//     addressLine1: d.addressLine1 || d.address || "",
//     checkInFrom: d.checkInFrom || d.checkIn || "14:00",
//     checkOutUntil: d.checkOutUntil || d.checkOut || "11:00",
//     governmentIdType: d.governmentIdType || d.ownerIdType || "",
//     accountHolderName: d.accountHolderName || d.accountHolder || "",
//     taxRegistrationNumber: d.taxRegistrationNumber || d.taxNumber || "",

//     childrenAllowed: d.childrenAllowed !== undefined ? Boolean(d.childrenAllowed) : true,

//     amenities: Array.isArray(d.amenities) ? d.amenities : [],
//     vd: d.vd && typeof d.vd === "object" ? d.vd : {},

//     // Older drafts stored image/video arrays; the form now edits raw text.
//     propertyImagesText:
//       d.propertyImagesText ??
//       (Array.isArray(d.propertyImages) ? d.propertyImages.join("\n") : ""),
//     videosText:
//       d.videosText ??
//       (Array.isArray(d.videos) ? d.videos.join("\n") : ""),
//   };
// }

// /* =====================================================
//    MAIN
// ===================================================== */

// export default function Onboarding() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const savedDraft = useMemo(() => loadDraft(), []);

//   const [currentStep, setCurrentStep] = useState(Number(savedDraft.currentStep || 1));
//   const [profileLoading, setProfileLoading] = useState(true);
//   const [currentVendor, setCurrentVendor] = useState(null);
//   const [form, setForm] = useState(() => buildInitialForm(savedDraft));
//   const [error, setError] = useState("");
//   const [successMessage, setSuccessMessage] = useState("");
//   const [saving, setSaving] = useState(false);

//   /* ===================================================
//      ONBOARDING ENTRY

//      PartnerAuth is only the gate into onboarding.
//      Do NOT create/login the Vendor here. The Vendor
//      application is created only on the final submit.
//   =================================================== */

//   useEffect(() => {
//     const partnerToken = localStorage.getItem("token");

//     if (!partnerToken) {
//       navigate("/signin", { replace: true });
//       return;
//     }

//     // Never let credentials from a different Partner account leak into this onboarding.
//     const partnerAccount = getPartnerAccount();
//     const sessionEmail = String(
//       sessionStorage.getItem("bmtVendorAuthEmail") || ""
//     ).trim().toLowerCase();

//     if (sessionEmail && partnerAccount.email && sessionEmail !== partnerAccount.email) {
//       sessionStorage.removeItem("bmtVendorAuthEmail");
//       sessionStorage.removeItem("bmtVendorAuthPassword");
//     }

//     // A fresh onboarding flow must not reuse an old Vendor session.
//     localStorage.removeItem("vendorToken");
//     localStorage.removeItem("vendorUser");

//     setCurrentVendor(null);
//     setProfileLoading(false);
//   }, [navigate]);

//   /* ===================================================
//      SAVE DRAFT
//   =================================================== */

//   useEffect(() => {
//     localStorage.setItem(
//       getDraftKey(),
//       JSON.stringify({ ...form, currentStep })
//     );
//   }, [form, currentStep]);

//   /* ===================================================
//      HELPERS
//   =================================================== */

//   const updateField = (name, value) => {
//     setForm((previous) => ({ ...previous, [name]: value }));
//     setError("");
//   };

//   // Vertical-specific answers live in form.vd
//   const updateVd = (name, value) => {
//     setForm((previous) => ({
//       ...previous,
//       vd: { ...(previous.vd || {}), [name]: value },
//     }));
//     setError("");
//   };

//   const selectedCountry = COUNTRIES.find((item) => item.id === form.country);

//   const selectedSubtype = (SUBTYPES[form.vertical] || []).find(
//     (item) => item.id === form.subtype
//   );

//   const progress = Math.round((currentStep / STEPS.length) * 100);

//   /* ===================================================
//      SIGN OUT
//   =================================================== */

//   const exitOnboarding = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("vendorToken");
//     sessionStorage.removeItem("bmtVendorAuthEmail");
//     sessionStorage.removeItem("bmtVendorAuthPassword");
//     localStorage.removeItem("user");

//     /* Draft intentionally preserved. */
//     navigate("/signin", { replace: true });
//   };

//   /* ===================================================
//      BACK
//   =================================================== */

//   const handleBack = () => {
//     if (currentStep === 1) {
//       exitOnboarding();
//       return;
//     }

//     setCurrentStep((previous) => Math.max(1, previous - 1));
//   };

//   /* ===================================================
//      VALIDATION
//   =================================================== */

//   const validateStepBase = () => {
//     switch (currentStep) {
//       case 1:
//         return form.country ? "" : "Please select your country.";

//       case 2:
//         return form.businessType ? "" : "Please select your business type.";

//       case 3:
//         return form.vertical ? "" : "Please select a vertical.";

//       case 4:
//         return form.subtype ? "" : "Please select a subtype.";

//       case 5:
//         // Cruise uses its own operator name field.
//         if (form.vertical !== "cruise" && !form.businessName.trim()) {
//           return "Business name is required.";
//         }
//         if (form.vertical === "stay" && !form.propertyName.trim()) {
//           return "Property name is required.";
//         }
//         return "";

//       case 6:
//         if (!form.addressLine1.trim() || !form.city.trim()) {
//           return "Address and city are required.";
//         }
//         return "";

//       case 7:
//         if (form.vertical === "stay" && !form.classification) {
//           return "Please select a classification.";
//         }
//         return "";

//       case 8:
//         if (form.vertical === "stay" && !form.totalUnits) {
//           return "Please enter total rooms / units.";
//         }
//         return "";

//       case 12:
//         if (!form.ownerName.trim()) {
//           return "Owner / authorized person name is required.";
//         }
//         if (!form.governmentIdType) {
//           return "Please select a government ID type.";
//         }
//         return "";

//       case 15:
//         if (!form.accountHolderName.trim()) {
//           return "Account holder name is required.";
//         }
//         if (
//           form.accountNumber &&
//           form.confirmAccountNumber &&
//           form.accountNumber !== form.confirmAccountNumber
//         ) {
//           return "Account numbers do not match.";
//         }
//         return "";

//       case 17:
//         return form.contractAccepted ? "" : "Please accept the partner agreement.";

//       default:
//         return "";
//     }
//   };

//   // Base rules first, then the vertical-specific required fields.
//   const validateStep = () =>
//     validateStepBase() || validateConfigStep(currentStep, form);

//   /* ===================================================
//      CONTINUE
//   =================================================== */

//   const handleContinue = () => {
//     const validationError = validateStep();

//     if (validationError) {
//       setError(validationError);
//       return;
//     }

//     if (currentStep === 1 && selectedCountry) {
//       setForm((previous) => ({
//         ...previous,
//         timezone: previous.timezone || selectedCountry.timezone,
//         settlementCurrency: previous.settlementCurrency || selectedCountry.currency,
//         bankCountry: previous.bankCountry || selectedCountry.name,
//         bankCurrency: previous.bankCurrency || selectedCountry.currency,
//       }));
//     }

//     if (currentStep === 3 && form.vertical) {
//       localStorage.setItem(getVerticalKey(), form.vertical);
//     }

//     if (currentStep < STEPS.length) {
//       setCurrentStep((previous) => previous + 1);
//       return;
//     }

//     submitApplication();
//   };

//   /* ===================================================
//      BUILD BACKEND PAYLOAD
//   =================================================== */

//   const buildPayload = () => {
//     const countryName = selectedCountry?.name || "";
//     const countryCode = selectedCountry?.code || "";
//     const isCruise = form.vertical === "cruise";

//     const businessName =
//       form.businessName || (isCruise ? form.vd?.cruiseOperatorName || "" : "");

//     const common = {
//       businessType: BUSINESS_TYPE_VALUES[form.businessType] || form.businessType,
//       businessName,
//       companyName: businessName,
//       legalBusinessName: form.legalBusinessName,
//       businessRegistrationNumber: form.businessRegistrationNumber,
//       businessLicenseNumber: form.businessLicenseNumber,
//       website: form.website,

//       vertical: form.vertical,
//       selectedVertical: form.vertical,

//       /*
//         Stay subtype backend field.
//         For other verticals the subtype remains
//         available as service/business subtype.
//       */
//       staySubtype: form.vertical === "stay" ? form.subtype : "",
//       service: form.vertical === "stay" ? form.subtype : form.vertical,
//       services:
//         form.vertical === "stay"
//           ? [form.subtype].filter(Boolean)
//           : [form.vertical].filter(Boolean),

//       country: countryName,
//       countryCode,

//       address: form.addressLine1,
//       addressLine1: form.addressLine1,
//       addressLine2: form.addressLine2,
//       locality: form.locality,
//       landmark: form.landmark,
//       city: form.city,
//       district: form.district,
//       state: form.state,
//       pincode: form.postalCode,
//       postalCode: form.postalCode,
//       timezone: form.timezone,

//       governmentIdType: form.governmentIdType,
//       governmentIdNumber: form.governmentIdNumber,

//       bankCountry: form.bankCountry || countryName,
//       bankCurrency: form.bankCurrency || selectedCountry?.currency || "",
//       settlementCurrency: form.settlementCurrency || selectedCountry?.currency || "",
//       accountHolderName: form.accountHolderName,
//       bankName: form.bankName,
//       branchName: form.branchName,
//       accountNumber: form.accountNumber,
//       confirmAccountNumber: form.confirmAccountNumber,
//       ifscCode: form.ifscCode,
//       iban: form.iban,
//       swiftCode: form.swiftCode,
//       routingNumber: form.routingNumber,

//       taxType: form.taxType,
//       taxRegistrationNumber: form.taxRegistrationNumber,
//       gstNumber: form.gstNumber,
//       panNumber: form.panNumber,

//       onboardingStatus: "submitted",
//       onboardingComplete: true,
//       onboardingStep: STEPS.length,
//       onboardingProgress: 100,
//     };

//     /* ---------------- STAY ---------------- */
//     if (form.vertical === "stay") {
//       common.stayDetails = {
//         propertyName: form.propertyName,
//         legalPropertyName: form.legalBusinessName,
//         displayName: form.displayName || form.propertyName,
//         propertyType: form.subtype,
//         totalProperties: 1,
//         propertyTypes: form.subtype ? [form.subtype] : [],

//         addressLine1: form.addressLine1,
//         addressLine2: form.addressLine2,
//         locality: form.locality,
//         landmark: form.landmark,
//         city: form.city,
//         district: form.district,
//         state: form.state,
//         postalCode: form.postalCode,
//         country: countryName,
//         countryCode,
//         timezone: form.timezone,
//         latitude: form.latitude || null,
//         longitude: form.longitude || null,

//         classification: form.classification,
//         starRating: Number(form.starRating || 0),
//         totalUnits: Number(form.totalUnits || 0),
//         totalRooms: Number(form.totalRooms || form.totalUnits || 0),
//         totalFloors: Number(form.totalFloors || 0),
//         totalBuildings: Number(form.totalBuildings || 1),
//         maximumGuests: Number(form.maximumGuests || 0),

//         amenities: form.amenities,
//         customAmenities: form.customAmenities
//           ? form.customAmenities.split(",").map((item) => item.trim()).filter(Boolean)
//           : [],

//         checkInFrom: form.checkInFrom,
//         checkOutUntil: form.checkOutUntil,
//         frontDesk24Hours: form.frontDesk24Hours,
//         selfCheckIn: form.selfCheckIn,
//         wifiAvailable: form.wifiAvailable,
//         freeWifi: form.freeWifi,
//         parkingAvailable: form.parkingAvailable,
//         restaurantAvailable: form.restaurantAvailable,
//         breakfastAvailable: form.breakfastAvailable,
//         airportTransferAvailable: form.airportTransferAvailable,
//         childrenAllowed: form.childrenAllowed,
//         petsAllowed: form.petsAllowed,
//         smokingAllowed: form.smokingAllowed,

//         cancellationPolicy: form.cancellationPolicy,
//         noShowPolicy: form.noShowPolicy,
//         modificationPolicy: form.modificationPolicy,
//         paymentPolicy: form.paymentPolicy,

//         propertyRegistrationNumber: form.propertyRegistrationNumber,
//         businessLicenseNumber: form.businessLicenseNumber,
//         tourismLicenseNumber: form.tourismLicenseNumber,
//         fireSafetyCertificateNumber: form.fireSafetyCertificateNumber,
//         foodLicenseNumber: form.foodLicenseNumber,

//         logo: form.logo,
//         coverImage: form.coverImage,
//         propertyImages: splitLines(form.propertyImagesText),
//         videos: splitLines(form.videosText),

//         propertyCurrency: selectedCountry?.currency || "",
//         settlementCurrency: form.settlementCurrency || selectedCountry?.currency || "",

//         isPublished: false,
//       };
//     }

//     /* ---------------- CRUISE ---------------- */
//     if (isCruise) {
//       common.cruiseDetails = buildCruiseDetails(form);
//     }

//     /* ------- TOURS / ACTIVITIES / EVENTS / DARSHAN ------- */
//     if (["packages", "activities", "events", "darshan"].includes(form.vertical)) {
//       common[VERTICAL_CONFIG[form.vertical].key] = buildGroupedDetails(form);
//     }

//     /*
//       Harmless UX metadata.
//       Backend must ignore/validate anything it does not own.
//     */
//     common.applicationMeta = {
//       supplierSubtype: form.subtype,
//       ownerName: form.ownerName,
//       ownerPhone: form.ownerPhone,
//       contractAccepted: form.contractAccepted,
//       contractAcceptedAt: form.contractAccepted ? new Date().toISOString() : null,
//     };

//     return common;
//   };

//   /* ===================================================
//      SUBMIT APPLICATION

//      FINAL FLOW:
//      Partner Auth -> Onboarding -> Vendor Signup -> PENDING
//      -> Admin Approval -> Vendor Sign-In -> exact dashboard.

//      IMPORTANT: No automatic Vendor login/profile/dashboard
//      request is made after this signup.
//   =================================================== */

//   const submitApplication = async () => {
//     const partnerToken = localStorage.getItem("token");

//     if (!partnerToken) {
//       navigate("/signin", { replace: true });
//       return;
//     }

//     setSaving(true);
//     setError("");
//     setSuccessMessage("");

//     try {
//       let partner = {};

//       try {
//         partner = JSON.parse(localStorage.getItem("user") || "{}");
//       } catch {
//         partner = {};
//       }

//       const email = String(
//         location.state?.vendorAuth?.email ||
//           sessionStorage.getItem("bmtVendorAuthEmail") ||
//           partner?.email ||
//           partner?.businessEmail ||
//           ""
//       ).trim().toLowerCase();

//       const password =
//         location.state?.vendorAuth?.password ||
//         sessionStorage.getItem("bmtVendorAuthPassword") ||
//         "";

//       const phone = String(
//         location.state?.vendorAuth?.phone ||
//           partner?.phone ||
//           partner?.businessPhone ||
//           form.ownerPhone ||
//           ""
//       ).trim();

//       // The onboarding selection is authoritative for this new application.
//       const selectedVertical = form.vertical;
//       const staySubtype = selectedVertical === "stay" ? form.subtype : "";

//       if (!email) {
//         throw new Error("Business email is missing. Please sign in again.");
//       }

//       if (!password) {
//         throw new Error(
//           "Signin password is no longer available in this tab. Please sign in again."
//         );
//       }

//       if (!phone) {
//         throw new Error("Phone number is required before submitting the application.");
//       }

//       if (!selectedVertical) {
//         throw new Error("Please select your business vertical.");
//       }

//       if (selectedVertical === "stay" && !staySubtype) {
//         throw new Error("Please select your property type.");
//       }

//       const payload = buildPayload();

//       const signupPayload = {
//         // Complete onboarding data
//         ...payload,

//         // Owner / user details
//         name:
//           form.ownerName ||
//           partner?.name ||
//           payload.businessName ||
//           email.split("@")[0],

//         email,
//         businessEmail: email,
//         phone,
//         businessPhone: phone,
//         password,

//         businessType: BUSINESS_TYPE_VALUES[form.businessType] || form.businessType,

//         selectedVertical,
//         vertical: selectedVertical,

//         // Stay: exact subtype. Everything else: the vertical itself.
//         service: selectedVertical === "stay" ? staySubtype : selectedVertical,
//         services:
//           selectedVertical === "stay"
//             ? [staySubtype].filter(Boolean)
//             : [selectedVertical].filter(Boolean),

//         staySubtype: selectedVertical === "stay" ? staySubtype : "",
//         subtype: selectedVertical === "stay" ? staySubtype : form.subtype || "",

//         // Cruise identification
//         ...(selectedVertical === "cruise" ? { cruise: true, cruiseVendor: true } : {}),
//       };

//       const signupResponse = await fetch(SIGNUP_URL, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(signupPayload),
//       });

//       const signupData = await signupResponse.json().catch(() => ({}));

//       if (signupResponse.status === 201 && signupData?.success) {
//         // Admin approval is mandatory before a Vendor session can exist.
//         localStorage.removeItem("vendorToken");
//         localStorage.removeItem("vendorUser");
//         localStorage.removeItem("onboardingComplete");

//         localStorage.setItem(getVerticalKey(), selectedVertical);
//         localStorage.removeItem(getDraftKey());
//         sessionStorage.removeItem("bmtVendorAuthPassword");

//         setCurrentVendor({
//           ...(signupData?.vendor || {}),
//           status: "PENDING",
//           isApproved: false,
//           onboardingStatus: "submitted",
//           vertical: selectedVertical,
//           selectedVertical,
//           staySubtype,
//         });

//         setSuccessMessage(
//           signupData?.message ||
//             "Application submitted successfully. Your BMT Connect vendor application is waiting for admin approval."
//         );

//         /*
//          * application saved -> PENDING -> Vendor Sign-In page.
//          * No Vendor session is created here. The login endpoint
//          * refuses access until Admin approves.
//          */
//         navigate("/vendor-login", {
//           replace: true,
//           state: {
//             applicationSubmitted: true,
//             email,
//             status: "PENDING",
//             vertical: selectedVertical,
//             staySubtype,
//           },
//         });

//         return;
//       }

//       if (signupResponse.status === 409) {
//         localStorage.removeItem("vendorToken");
//         localStorage.removeItem("vendorUser");

//         navigate("/vendor-login", {
//           replace: true,
//           state: {
//             applicationSubmitted: false,
//             existingApplication: true,
//             email,
//             message:
//               signupData?.message ||
//               "Your vendor application already exists. Please sign in to check your approval status.",
//           },
//         });

//         return;
//       }

//       if (signupResponse.status === 400) {
//         const details = Array.isArray(signupData?.details)
//           ? signupData.details.map((item) => item?.message).filter(Boolean).join(", ")
//           : "";

//         throw new Error(
//           details || signupData?.message || "Please check your registration details."
//         );
//       }

//       throw new Error(signupData?.message || "Unable to submit vendor application.");
//     } catch (err) {
//       console.error("Vendor onboarding submit error:", err);
//       setError(err?.message || "Unable to submit application.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   /* ===================================================
//      AMENITY (Stay)
//   =================================================== */

//   const toggleAmenity = (amenity) => {
//     setForm((previous) => {
//       const exists = previous.amenities.includes(amenity);

//       return {
//         ...previous,
//         amenities: exists
//           ? previous.amenities.filter((item) => item !== amenity)
//           : [...previous.amenities, amenity],
//       };
//     });
//   };

//   if (profileLoading) {
//     return (
//       <div className="bmt-onboarding">
//         <main className="bmt-onboarding-main" style={{ marginLeft: 0, width: "100%" }}>
//           <section className="bmt-onboarding-content">
//             <div className="bmt-content-inner">
//               <div className="bmt-empty-state">Loading your BMT Connect account...</div>
//             </div>
//           </section>
//         </main>
//       </div>
//     );
//   }

//   /* ===================================================
//      STEP RENDER
//   =================================================== */

//   const hasVerticalConfig = Boolean(VERTICAL_CONFIG[form.vertical]?.steps[currentStep]);

//   const renderStep = () => {
//     switch (currentStep) {
//       case 1:
//         return (
//           <CountryStep
//             value={form.country}
//             onChange={(value) => {
//               const country = COUNTRIES.find((item) => item.id === value);

//               setForm((previous) => ({
//                 ...previous,
//                 country: value,
//                 timezone: previous.timezone || country?.timezone || "",
//                 bankCountry: previous.bankCountry || country?.name || "",
//                 bankCurrency: previous.bankCurrency || country?.currency || "",
//                 settlementCurrency: previous.settlementCurrency || country?.currency || "",
//               }));
//               setError("");
//             }}
//           />
//         );

//       case 2:
//         return (
//           <BusinessTypeStep
//             value={form.businessType}
//             onChange={(value) => updateField("businessType", value)}
//           />
//         );

//       case 3:
//         return (
//           <VerticalStep
//             value={form.vertical}
//             onChange={(value) => {
//               // Changing vertical clears the previous vertical's answers.
//               setForm((previous) => ({
//                 ...previous,
//                 vertical: value,
//                 subtype: "",
//                 classification: "",
//                 vd: {},
//               }));
//               setError("");
//             }}
//           />
//         );

//       case 4:
//         return (
//           <SubtypeStep
//             vertical={form.vertical}
//             value={form.subtype}
//             onChange={(value) => updateField("subtype", value)}
//           />
//         );

//       case 6:
//         return (
//           <LocationStep
//             form={form}
//             updateField={updateField}
//             selectedCountry={selectedCountry}
//           />
//         );

//       case 12:
//         return <KycStep form={form} updateField={updateField} />;

//       case 14:
//         return <MediaFieldsStep form={form} updateField={updateField} />;

//       case 15:
//         return (
//           <BankStep form={form} updateField={updateField} selectedCountry={selectedCountry} />
//         );

//       case 16:
//         return (
//           <TaxStep form={form} updateField={updateField} selectedCountry={selectedCountry} />
//         );

//       case 17:
//         return (
//           <ContractStep
//             checked={form.contractAccepted}
//             onChange={(value) => updateField("contractAccepted", value)}
//           />
//         );

//       case 18:
//         return (
//           <ReviewStep
//             form={form}
//             selectedCountry={selectedCountry}
//             selectedSubtype={selectedSubtype}
//           />
//         );

//       /* ---- steps that change per vertical ---- */
//       case 5:
//         return hasVerticalConfig ? (
//           <VerticalStepRenderer
//             form={form}
//             step={5}
//             updateField={updateField}
//             updateVd={updateVd}
//             basic={
//               VERTICAL_CONFIG[form.vertical].steps[5].withBasic ? (
//                 <BasicDetailsStep form={form} updateField={updateField} />
//               ) : null
//             }
//           />
//         ) : (
//           <BasicDetailsStep form={form} updateField={updateField} />
//         );

//       case 7:
//         return hasVerticalConfig ? (
//           <VerticalStepRenderer form={form} step={7} updateField={updateField} updateVd={updateVd} />
//         ) : (
//           <ClassificationStep form={form} updateField={updateField} />
//         );

//       case 8:
//         return hasVerticalConfig ? (
//           <VerticalStepRenderer form={form} step={8} updateField={updateField} updateVd={updateVd} />
//         ) : (
//           <UnitsStep form={form} updateField={updateField} />
//         );

//       case 9:
//         return hasVerticalConfig ? (
//           <VerticalStepRenderer form={form} step={9} updateField={updateField} updateVd={updateVd} />
//         ) : (
//           <AmenitiesStep
//             form={form}
//             updateField={updateField}
//             selected={form.amenities}
//             toggle={toggleAmenity}
//           />
//         );

//       case 10:
//         return hasVerticalConfig ? (
//           <VerticalStepRenderer form={form} step={10} updateField={updateField} updateVd={updateVd} />
//         ) : (
//           <PoliciesStep form={form} updateField={updateField} />
//         );

//       case 11:
//         return hasVerticalConfig ? (
//           <VerticalStepRenderer form={form} step={11} updateField={updateField} updateVd={updateVd} />
//         ) : (
//           <div className="bmt-form-grid">
//             <div className="bmt-form-span-2">
//               <UploadInfo
//                 title="Property photos & videos"
//                 description="Paste hosted media URLs below, one per line."
//               />
//             </div>
//             {STAY_MEDIA_FIELDS.map((field) => (
//               <DynamicField
//                 key={field.name}
//                 field={field}
//                 value={getFieldValue(form, field)}
//                 onChange={(value) => updateField(field.name, value)}
//               />
//             ))}
//           </div>
//         );

//       case 13:
//         return hasVerticalConfig ? (
//           <VerticalStepRenderer form={form} step={13} updateField={updateField} updateVd={updateVd} />
//         ) : (
//           <DocumentsStep form={form} updateField={updateField} />
//         );

//       default:
//         return null;
//     }
//   };

//   /* ===================================================
//      PAGE
//   =================================================== */

//   return (
//     <div className="bmt-onboarding">
//       <aside className="bmt-onboarding-sidebar">
//         <div className="bmt-sidebar-title">APPLICATION STEPS</div>

//         <div className="bmt-step-list">
//           {STEPS.map((step) => {
//             const active = step.id === currentStep;
//             const complete = step.id < currentStep;

//             return (
//               <button
//                 type="button"
//                 key={step.id}
//                 className={["bmt-sidebar-step", active ? "active" : "", complete ? "complete" : ""]
//                   .filter(Boolean)
//                   .join(" ")}
//                 onClick={() => {
//                   if (step.id <= currentStep) setCurrentStep(step.id);
//                 }}
//               >
//                 <span className="bmt-step-number">{complete ? "✓" : step.id}</span>
//                 <span>{getStepTitle(step.id, form.vertical)}</span>
//               </button>
//             );
//           })}
//         </div>
//       </aside>

//       <main className="bmt-onboarding-main">
//         <header className="bmt-onboarding-header">
//           <div className="bmt-header-left">
//             <div className="bmt-onboarding-logo">
//               <span>BMT</span>
//               Connect
//             </div>

//             <div className="bmt-application-status">
//               {currentVendor?.onboardingStatus === "rejected"
//                 ? "Action required"
//                 : "Application in progress"}
//             </div>

//             {form.vertical && (
//               <div className="bmt-current-vertical">
//                 {VERTICALS.find((item) => item.id === form.vertical)?.name || form.vertical}
//                 {selectedSubtype?.name ? ` · ${selectedSubtype.name}` : ""}
//               </div>
//             )}
//           </div>

//           <div className="bmt-header-right">
//             <div className="bmt-progress-box">
//               <div className="bmt-progress-track">
//                 <div className="bmt-progress-fill" style={{ width: `${progress}%` }} />
//               </div>
//               <strong>{progress}%</strong>
//             </div>

//             <button type="button" className="bmt-signout-btn" onClick={exitOnboarding}>
//               Sign out
//             </button>
//           </div>
//         </header>

//         <section className="bmt-onboarding-content">
//           <div className="bmt-content-inner">
//             <div className="bmt-step-eyebrow">
//               STEP {currentStep} OF {STEPS.length}
//             </div>

//             <h1>{getStepTitle(currentStep, form.vertical)}</h1>

//             <p className="bmt-step-description">
//               {getStepDescription(currentStep, form.vertical)}
//             </p>

//             {successMessage && (
//               <div
//                 className="bmt-onboarding-error"
//                 style={{ borderColor: "#86efac", background: "#f0fdf4", color: "#166534" }}
//               >
//                 {successMessage}
//               </div>
//             )}

//             {error && <div className="bmt-onboarding-error">{error}</div>}

//             <div className="bmt-step-content">{renderStep()}</div>
//           </div>
//         </section>

//         <footer className="bmt-onboarding-footer">
//           <button type="button" className="bmt-back-btn" onClick={handleBack}>
//             ← {currentStep === 1 ? "Back to sign in" : "Back"}
//           </button>

//           <button
//             type="button"
//             className="bmt-continue-btn"
//             onClick={handleContinue}
//             disabled={saving}
//           >
//             {saving
//               ? "Submitting..."
//               : currentStep === STEPS.length
//               ? "Submit application"
//               : "Continue"}
//           </button>
//         </footer>
//       </main>
//     </div>
//   );
// }

// /* =====================================================
//    COMMON STEPS
// ===================================================== */

// function CountryStep({ value, onChange }) {
//   return (
//     <div className="bmt-card-grid bmt-country-grid">
//       {COUNTRIES.map((country) => (
//         <button
//           type="button"
//           key={country.id}
//           className={value === country.id ? "bmt-select-card selected" : "bmt-select-card"}
//           onClick={() => onChange(country.id)}
//         >
//           <strong>{country.name}</strong>
//           <span>
//             {country.currency}
//             {" · "}
//             {country.phone}
//           </span>
//         </button>
//       ))}
//     </div>
//   );
// }

// function BusinessTypeStep({ value, onChange }) {
//   return (
//     <div className="bmt-card-grid">
//       {BUSINESS_TYPES.map((type) => (
//         <button
//           type="button"
//           key={type}
//           className={value === type ? "bmt-select-card selected" : "bmt-select-card"}
//           onClick={() => onChange(type)}
//         >
//           <strong>{type}</strong>
//         </button>
//       ))}
//     </div>
//   );
// }

// function VerticalStep({ value, onChange }) {
//   return (
//     <div className="bmt-vertical-grid">
//       {VERTICALS.map((vertical) => (
//         <button
//           type="button"
//           key={vertical.id}
//           className={value === vertical.id ? "bmt-vertical-card selected" : "bmt-vertical-card"}
//           onClick={() => onChange(vertical.id)}
//         >
//           <div className="bmt-vertical-icon">{vertical.icon}</div>
//           <strong>{vertical.name}</strong>
//           <span>{vertical.description}</span>
//         </button>
//       ))}
//     </div>
//   );
// }

// function SubtypeStep({ vertical, value, onChange }) {
//   const options = SUBTYPES[vertical] || [];

//   if (!vertical) {
//     return <div className="bmt-empty-state">Please choose a vertical first.</div>;
//   }

//   return (
//     <div className="bmt-card-grid">
//       {options.map((item) => (
//         <button
//           key={item.id}
//           type="button"
//           className={value === item.id ? "bmt-select-card selected" : "bmt-select-card"}
//           onClick={() => onChange(item.id)}
//         >
//           <strong>{item.name}</strong>
//           <span>Backend value: {item.id}</span>
//         </button>
//       ))}
//     </div>
//   );
// }

// function BasicDetailsStep({ form, updateField }) {
//   const isStay = form.vertical === "stay";

//   return (
//     <div className="bmt-form-grid">
//       <Field
//         label="Business name"
//         value={form.businessName}
//         onChange={(value) => updateField("businessName", value)}
//         placeholder="Registered business name"
//       />

//       <Field
//         label="Legal business name"
//         value={form.legalBusinessName}
//         onChange={(value) => updateField("legalBusinessName", value)}
//         placeholder="Name on registration documents"
//       />

//       {isStay && (
//         <>
//           <Field
//             label="Property name"
//             value={form.propertyName}
//             onChange={(value) => updateField("propertyName", value)}
//             placeholder="Public property name"
//           />

//           <Field
//             label="Display name"
//             value={form.displayName}
//             onChange={(value) => updateField("displayName", value)}
//             placeholder="Marketplace display name"
//           />
//         </>
//       )}

//       <Field
//         label="Business registration number"
//         value={form.businessRegistrationNumber}
//         onChange={(value) => updateField("businessRegistrationNumber", value)}
//         placeholder="Registration / incorporation number"
//       />

//       <Field
//         label="Business licence number"
//         value={form.businessLicenseNumber}
//         onChange={(value) => updateField("businessLicenseNumber", value)}
//         placeholder="Licence number, if applicable"
//       />

//       <div className="bmt-form-span-2">
//         <Field
//           label="Website"
//           value={form.website}
//           onChange={(value) => updateField("website", value)}
//           placeholder="https://"
//         />
//       </div>
//     </div>
//   );
// }

// function LocationStep({ form, updateField, selectedCountry }) {
//   return (
//     <div className="bmt-form-grid">
//       <div className="bmt-form-span-2">
//         <Field
//           label="Address line 1"
//           value={form.addressLine1}
//           onChange={(value) => updateField("addressLine1", value)}
//           placeholder="Building / street / area"
//         />
//       </div>

//       <div className="bmt-form-span-2">
//         <Field
//           label="Address line 2"
//           value={form.addressLine2}
//           onChange={(value) => updateField("addressLine2", value)}
//           placeholder="Optional"
//         />
//       </div>

//       <Field label="Locality" value={form.locality} onChange={(value) => updateField("locality", value)} placeholder="Locality / area" />
//       <Field label="Landmark" value={form.landmark} onChange={(value) => updateField("landmark", value)} placeholder="Nearby landmark" />
//       <Field label="City" value={form.city} onChange={(value) => updateField("city", value)} placeholder="City" />
//       <Field label="District" value={form.district} onChange={(value) => updateField("district", value)} placeholder="District" />
//       <Field label="State / Province / Region" value={form.state} onChange={(value) => updateField("state", value)} placeholder="State / Province" />
//       <Field label="Postal code" value={form.postalCode} onChange={(value) => updateField("postalCode", value)} placeholder="Postal code" />
//       <Field label="Country" value={selectedCountry?.name || ""} disabled />
//       <Field label="Time zone" value={form.timezone} onChange={(value) => updateField("timezone", value)} placeholder="e.g. Asia/Kolkata" />

//       {form.vertical === "stay" && (
//         <>
//           <Field label="Latitude" type="number" value={form.latitude} onChange={(value) => updateField("latitude", value)} placeholder="Optional" />
//           <Field label="Longitude" type="number" value={form.longitude} onChange={(value) => updateField("longitude", value)} placeholder="Optional" />
//         </>
//       )}
//     </div>
//   );
// }

// /* =====================================================
//    STAY-ONLY STEPS
// ===================================================== */

// function ClassificationStep({ form, updateField }) {
//   if (form.vertical !== "stay") {
//     return (
//       <NotApplicable text="Classification is not required for this vertical. Continue to the next step." />
//     );
//   }

//   const options = [
//     { id: "unrated", name: "Unrated", star: 0 },
//     { id: "budget", name: "Budget", star: 0 },
//     { id: "1-star", name: "1 Star", star: 1 },
//     { id: "2-star", name: "2 Star", star: 2 },
//     { id: "3-star", name: "3 Star", star: 3 },
//     { id: "4-star", name: "4 Star", star: 4 },
//     { id: "5-star", name: "5 Star", star: 5 },
//     { id: "luxury", name: "Luxury", star: 0 },
//   ];

//   return (
//     <div className="bmt-card-grid">
//       {options.map((option) => (
//         <button
//           type="button"
//           key={option.id}
//           className={
//             form.classification === option.id ? "bmt-select-card selected" : "bmt-select-card"
//           }
//           onClick={() => {
//             updateField("classification", option.id);
//             updateField("starRating", option.star ? String(option.star) : "");
//           }}
//         >
//           <strong>{option.name}</strong>
//         </button>
//       ))}
//     </div>
//   );
// }

// function UnitsStep({ form, updateField }) {
//   if (form.vertical !== "stay") {
//     return (
//       <NotApplicable text="Inventory details will be configured inside the selected vertical dashboard." />
//     );
//   }

//   return (
//     <div className="bmt-form-grid">
//       <Field
//         label="Total rooms / units"
//         type="number"
//         value={form.totalUnits}
//         onChange={(value) => {
//           updateField("totalUnits", value);
//           if (!form.totalRooms) updateField("totalRooms", value);
//         }}
//         placeholder="e.g. 25"
//       />

//       <Field label="Total rooms" type="number" value={form.totalRooms} onChange={(value) => updateField("totalRooms", value)} placeholder="e.g. 25" />
//       <Field label="Total floors" type="number" value={form.totalFloors} onChange={(value) => updateField("totalFloors", value)} placeholder="e.g. 4" />
//       <Field label="Total buildings" type="number" value={form.totalBuildings} onChange={(value) => updateField("totalBuildings", value)} placeholder="e.g. 1" />
//       <Field label="Maximum guests" type="number" value={form.maximumGuests} onChange={(value) => updateField("maximumGuests", value)} placeholder="Total property capacity" />
//       <Field label="Primary room / unit type" value={form.unitType} onChange={(value) => updateField("unitType", value)} placeholder="e.g. Deluxe Room" />
//     </div>
//   );
// }

// function AmenitiesStep({ form, updateField, selected, toggle }) {
//   if (form.vertical !== "stay") {
//     return (
//       <NotApplicable text="Vertical-specific services and amenities will be configured in the supplier dashboard." />
//     );
//   }

//   const amenities = [
//     "Wi-Fi", "Parking", "Restaurant", "Room Service", "Swimming Pool", "Air Conditioning",
//     "Airport Transfer", "Gym", "Spa", "24-hour Front Desk", "Breakfast", "Wheelchair Access",
//   ];

//   return (
//     <>
//       <div className="bmt-checkbox-grid">
//         {amenities.map((item) => (
//           <label
//             key={item}
//             className={selected.includes(item) ? "bmt-checkbox-card checked" : "bmt-checkbox-card"}
//           >
//             <input type="checkbox" checked={selected.includes(item)} onChange={() => toggle(item)} />
//             <span>{item}</span>
//           </label>
//         ))}
//       </div>

//       <div className="bmt-form-grid" style={{ marginTop: 18 }}>
//         <ToggleField label="Wi-Fi available" checked={form.wifiAvailable} onChange={(value) => updateField("wifiAvailable", value)} />
//         <ToggleField label="Free Wi-Fi" checked={form.freeWifi} onChange={(value) => updateField("freeWifi", value)} />
//         <ToggleField label="Parking available" checked={form.parkingAvailable} onChange={(value) => updateField("parkingAvailable", value)} />
//         <ToggleField label="Restaurant available" checked={form.restaurantAvailable} onChange={(value) => updateField("restaurantAvailable", value)} />
//         <ToggleField label="Breakfast available" checked={form.breakfastAvailable} onChange={(value) => updateField("breakfastAvailable", value)} />
//         <ToggleField label="Airport transfer" checked={form.airportTransferAvailable} onChange={(value) => updateField("airportTransferAvailable", value)} />

//         <div className="bmt-form-span-2">
//           <Field
//             label="Other amenities"
//             value={form.customAmenities}
//             onChange={(value) => updateField("customAmenities", value)}
//             placeholder="Comma separated, e.g. Rooftop, Garden, EV charging"
//           />
//         </div>
//       </div>
//     </>
//   );
// }

// function PoliciesStep({ form, updateField }) {
//   if (form.vertical !== "stay") {
//     return (
//       <NotApplicable text="Vertical-specific operating policies will be configured in the supplier dashboard." />
//     );
//   }

//   return (
//     <div className="bmt-form-grid">
//       <Field label="Check-in from" type="time" value={form.checkInFrom} onChange={(value) => updateField("checkInFrom", value)} />
//       <Field label="Check-out until" type="time" value={form.checkOutUntil} onChange={(value) => updateField("checkOutUntil", value)} />

//       <ToggleField label="24-hour front desk" checked={form.frontDesk24Hours} onChange={(value) => updateField("frontDesk24Hours", value)} />
//       <ToggleField label="Self check-in" checked={form.selfCheckIn} onChange={(value) => updateField("selfCheckIn", value)} />
//       <ToggleField label="Children allowed" checked={form.childrenAllowed} onChange={(value) => updateField("childrenAllowed", value)} />
//       <ToggleField label="Pets allowed" checked={form.petsAllowed} onChange={(value) => updateField("petsAllowed", value)} />
//       <ToggleField label="Smoking allowed" checked={form.smokingAllowed} onChange={(value) => updateField("smokingAllowed", value)} />

//       <TextAreaField label="Cancellation policy" value={form.cancellationPolicy} onChange={(value) => updateField("cancellationPolicy", value)} placeholder="Describe cancellation rules" />
//       <TextAreaField label="No-show policy" value={form.noShowPolicy} onChange={(value) => updateField("noShowPolicy", value)} placeholder="Describe no-show rules" />
//       <TextAreaField label="Modification policy" value={form.modificationPolicy} onChange={(value) => updateField("modificationPolicy", value)} placeholder="Describe modification rules" />
//       <TextAreaField label="Payment policy" value={form.paymentPolicy} onChange={(value) => updateField("paymentPolicy", value)} placeholder="Describe payment / deposit rules" />
//     </div>
//   );
// }

// function DocumentsStep({ form, updateField }) {
//   return (
//     <div className="bmt-form-grid">
//       <Field label="Property registration number" value={form.propertyRegistrationNumber} onChange={(value) => updateField("propertyRegistrationNumber", value)} placeholder="If applicable" />
//       <Field label="Tourism licence number" value={form.tourismLicenseNumber} onChange={(value) => updateField("tourismLicenseNumber", value)} placeholder="If applicable" />
//       <Field label="Fire safety certificate number" value={form.fireSafetyCertificateNumber} onChange={(value) => updateField("fireSafetyCertificateNumber", value)} placeholder="If applicable" />
//       <Field label="Food licence number" value={form.foodLicenseNumber} onChange={(value) => updateField("foodLicenseNumber", value)} placeholder="If applicable" />

//       <div className="bmt-form-span-2">
//         <UploadInfo
//           title="Document upload"
//           description="Document-number fields are mapped to your backend. Binary document upload still needs the storage/upload API endpoint."
//         />
//       </div>
//     </div>
//   );
// }

// /* =====================================================
//    VERTICAL STEP RENDERER (Cruise / Tours / Activities /
//    Events / Darshan)
// ===================================================== */

// function VerticalStepRenderer({ form, step, updateField, updateVd, basic = null }) {
//   const stepCfg = VERTICAL_CONFIG[form.vertical]?.steps[step];
//   if (!stepCfg) return null;

//   return (
//     <>
//       {basic}

//       <div className="bmt-form-grid" style={basic ? { marginTop: 24 } : undefined}>
//         {stepCfg.fields.map((field) => (
//           <DynamicField
//             key={field.name}
//             field={field}
//             value={getFieldValue(form, field)}
//             onChange={(value) =>
//               field.root ? updateField(field.name, value) : updateVd(field.name, value)
//             }
//           />
//         ))}
//       </div>
//     </>
//   );
// }

// function DynamicField({ field, value, onChange }) {
//   const label = field.required ? `${field.label} *` : field.label;

//   if (field.type === "toggle") {
//     return <ToggleField label={field.label} checked={value} onChange={onChange} />;
//   }

//   if (field.type === "chips") {
//     const selected = Array.isArray(value) ? value : [];

//     const toggle = (option) =>
//       onChange(
//         selected.includes(option)
//           ? selected.filter((item) => item !== option)
//           : [...selected, option]
//       );

//     return (
//       <div className="bmt-form-span-2">
//         <div className="bmt-field">
//           <span>{label}</span>
//         </div>

//         <div className="bmt-checkbox-grid" style={{ marginTop: 8 }}>
//           {field.options.map((option) => (
//             <label
//               key={option}
//               className={
//                 selected.includes(option) ? "bmt-checkbox-card checked" : "bmt-checkbox-card"
//               }
//             >
//               <input
//                 type="checkbox"
//                 checked={selected.includes(option)}
//                 onChange={() => toggle(option)}
//               />
//               <span>{option}</span>
//             </label>
//           ))}
//         </div>
//       </div>
//     );
//   }

//   if (field.type === "textarea" || field.type === "urls") {
//     return (
//       <TextAreaField
//         label={label}
//         value={value}
//         onChange={onChange}
//         placeholder={field.placeholder}
//         rows={field.type === "urls" ? 4 : 3}
//       />
//     );
//   }

//   if (field.type === "select") {
//     return (
//       <label className="bmt-field">
//         <span>{label}</span>
//         <select value={value ?? ""} onChange={(event) => onChange(event.target.value)}>
//           <option value="">Select</option>
//           {field.options.map((option) => (
//             <option key={option} value={option}>
//               {option.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase())}
//             </option>
//           ))}
//         </select>
//       </label>
//     );
//   }

//   // text | number | time
//   return (
//     <Field
//       label={label}
//       type={field.type}
//       value={value}
//       onChange={onChange}
//       placeholder={field.placeholder}
//     />
//   );
// }

// /* =====================================================
//    BRAND MEDIA (step 14 - all verticals)
// ===================================================== */

// function MediaFieldsStep({ form, updateField }) {
//   return (
//     <div className="bmt-form-grid">
//       <div className="bmt-form-span-2">
//         <UploadInfo
//           title="Business media"
//           description="Your current backend stores media references/URLs. Paste hosted URLs here until an upload/storage endpoint is connected."
//         />
//       </div>

//       <Field
//         label="Business / property logo URL"
//         value={form.logo || ""}
//         onChange={(value) => updateField("logo", value)}
//         placeholder="https://.../logo.png"
//       />

//       <Field
//         label="Cover image URL"
//         value={form.coverImage || ""}
//         onChange={(value) => updateField("coverImage", value)}
//         placeholder="https://.../cover.jpg"
//       />
//     </div>
//   );
// }

// /* =====================================================
//    OWNER / BANK / TAX / CONTRACT / REVIEW
// ===================================================== */

// function KycStep({ form, updateField }) {
//   return (
//     <div className="bmt-form-grid">
//       <Field label="Owner / authorized person" value={form.ownerName} onChange={(value) => updateField("ownerName", value)} placeholder="Full legal name" />
//       <Field label="Owner phone" value={form.ownerPhone} onChange={(value) => updateField("ownerPhone", value)} placeholder="+91..." />

//       <label className="bmt-field">
//         <span>Government ID type</span>

//         <select
//           value={form.governmentIdType}
//           onChange={(event) => updateField("governmentIdType", event.target.value)}
//         >
//           <option value="">Select ID type</option>
//           <option value="passport">Passport</option>
//           <option value="national-id">National ID</option>
//           <option value="drivers-license">Driver's licence</option>
//           <option value="aadhaar">Aadhaar / local national ID</option>
//           <option value="other">Other government ID</option>
//         </select>
//       </label>

//       <Field label="Government ID number" value={form.governmentIdNumber} onChange={(value) => updateField("governmentIdNumber", value)} placeholder="ID number" />
//     </div>
//   );
// }

// function BankStep({ form, updateField, selectedCountry }) {
//   const isIndia = selectedCountry?.code === "IN";

//   return (
//     <div className="bmt-form-grid">
//       <Field label="Account holder name" value={form.accountHolderName} onChange={(value) => updateField("accountHolderName", value)} placeholder="As per bank account" />
//       <Field label="Bank name" value={form.bankName} onChange={(value) => updateField("bankName", value)} placeholder="Bank name" />
//       <Field label="Branch name" value={form.branchName} onChange={(value) => updateField("branchName", value)} placeholder="Branch name" />
//       <Field label="Account number" value={form.accountNumber} onChange={(value) => updateField("accountNumber", value)} placeholder="Account number" />
//       <Field label="Confirm account number" value={form.confirmAccountNumber} onChange={(value) => updateField("confirmAccountNumber", value)} placeholder="Re-enter account number" />

//       {isIndia ? (
//         <Field label="IFSC code" value={form.ifscCode} onChange={(value) => updateField("ifscCode", value)} placeholder="IFSC" />
//       ) : (
//         <>
//           <Field label="IBAN" value={form.iban} onChange={(value) => updateField("iban", value)} placeholder="If applicable" />
//           <Field label="SWIFT / BIC" value={form.swiftCode} onChange={(value) => updateField("swiftCode", value)} placeholder="SWIFT / BIC" />
//           <Field label="Routing number" value={form.routingNumber} onChange={(value) => updateField("routingNumber", value)} placeholder="If applicable" />
//         </>
//       )}

//       <Field label="Bank country" value={form.bankCountry || selectedCountry?.name || ""} onChange={(value) => updateField("bankCountry", value)} />
//       <Field label="Bank currency" value={form.bankCurrency || selectedCountry?.currency || ""} onChange={(value) => updateField("bankCurrency", value)} />
//       <Field label="Settlement currency" value={form.settlementCurrency} onChange={(value) => updateField("settlementCurrency", value)} placeholder={selectedCountry?.currency || "Currency"} />
//     </div>
//   );
// }

// function TaxStep({ form, updateField, selectedCountry }) {
//   const isIndia = selectedCountry?.code === "IN";

//   return (
//     <div className="bmt-form-grid">
//       <label className="bmt-field">
//         <span>Tax registration type</span>

//         <select value={form.taxType} onChange={(event) => updateField("taxType", event.target.value)}>
//           <option value="">Select tax type</option>
//           {isIndia && <option value="gst">GST</option>}
//           <option value="vat">VAT</option>
//           <option value="sales-tax">Sales Tax</option>
//           <option value="other">Other</option>
//           <option value="not-registered">Not registered</option>
//         </select>
//       </label>

//       <Field label="Tax registration number" value={form.taxRegistrationNumber} onChange={(value) => updateField("taxRegistrationNumber", value)} placeholder="VAT / GST / sales-tax number" />

//       {isIndia && (
//         <>
//           <Field label="GST number" value={form.gstNumber} onChange={(value) => updateField("gstNumber", value)} placeholder="GSTIN, if registered" />
//           <Field label="PAN number" value={form.panNumber} onChange={(value) => updateField("panNumber", value)} placeholder="PAN" />
//         </>
//       )}
//     </div>
//   );
// }

// function ContractStep({ checked, onChange }) {
//   return (
//     <div className="bmt-contract-card">
//       <h3>BMT Connect Partner Agreement</h3>

//       <p>
//         Review the commercial, operational, payout, cancellation, data and marketplace terms
//         before submitting your application.
//       </p>

//       <label className="bmt-contract-checkbox">
//         <input
//           type="checkbox"
//           checked={checked}
//           onChange={(event) => onChange(event.target.checked)}
//         />

//         <span>
//           I am authorized to act for this business and I accept the BMT Connect Partner Agreement.
//         </span>
//       </label>
//     </div>
//   );
// }

// function ReviewStep({ form, selectedCountry, selectedSubtype }) {
//   const vd = form.vd || {};
//   const verticalName = VERTICALS.find((item) => item.id === form.vertical)?.name || form.vertical;
//   const isCruise = form.vertical === "cruise";

//   return (
//     <div className="bmt-review-card">
//       <ReviewRow label="Country" value={selectedCountry?.name} />
//       <ReviewRow label="Business type" value={form.businessType} />
//       <ReviewRow label="Vertical" value={verticalName} />
//       <ReviewRow label="Subtype" value={selectedSubtype?.name || form.subtype} />
//       <ReviewRow label="Business" value={form.businessName || vd.cruiseOperatorName} />

//       {form.vertical === "stay" && <ReviewRow label="Property" value={form.propertyName} />}
//       {isCruise && <ReviewRow label="Ship" value={vd.shipName} />}
//       {isCruise && (
//         <ReviewRow
//           label="Route"
//           value={
//             vd.departurePort && vd.destinationPort
//               ? `${vd.departurePort} → ${vd.destinationPort}`
//               : ""
//           }
//         />
//       )}

//       <ReviewRow label="City" value={form.city} />
//       <ReviewRow label="Owner" value={form.ownerName} />
//       <ReviewRow label="Settlement" value={form.settlementCurrency || selectedCountry?.currency} />
//       <ReviewRow label="Status after submit" value="Submitted for review" />
//     </div>
//   );
// }

// /* =====================================================
//    COMMON UI
// ===================================================== */

// function Field({ label, type = "text", value = "", onChange, placeholder = "", disabled = false }) {
//   return (
//     <label className="bmt-field">
//       <span>{label}</span>

//       <input
//         type={type}
//         min={type === "number" ? 0 : undefined}
//         value={value ?? ""}
//         disabled={disabled}
//         placeholder={placeholder}
//         onChange={(event) => onChange?.(event.target.value)}
//       />
//     </label>
//   );
// }

// function TextAreaField({ label, value = "", onChange, placeholder = "", rows = 3 }) {
//   return (
//     <div className="bmt-form-span-2">
//       <label className="bmt-field">
//         <span>{label}</span>

//         <textarea
//           rows={rows}
//           value={value ?? ""}
//           placeholder={placeholder}
//           onChange={(event) => onChange?.(event.target.value)}
//         />
//       </label>
//     </div>
//   );
// }

// function ToggleField({ label, checked, onChange }) {
//   return (
//     <label className={checked ? "bmt-checkbox-card checked" : "bmt-checkbox-card"}>
//       <input
//         type="checkbox"
//         checked={Boolean(checked)}
//         onChange={(event) => onChange(event.target.checked)}
//       />

//       <span>{label}</span>
//     </label>
//   );
// }

// function UploadInfo({ title, description }) {
//   return (
//     <div className="bmt-upload-box compact">
//       <div className="bmt-upload-icon">↑</div>
//       <strong>{title}</strong>
//       <p>{description}</p>
//     </div>
//   );
// }

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Onboarding.css";

/* =====================================================
   API
===================================================== */

const API_BASE = process.env.REACT_APP_API_URL || "https://bmtvendorfinal.onrender.com";
const SIGNUP_URL = `${API_BASE}/api/vendor/auth/signup`;
/* File upload endpoint: multipart, field name "file", partner token se auth.
   Response me { url } (ya { fileUrl } / { data: { url } }) aana chahiye. */
const UPLOAD_URL = `${API_BASE}/api/upload`;

/* =====================================================
   OPTIONS
===================================================== */

const COUNTRIES = [
  { id: "india", name: "India", code: "IN", currency: "INR", phone: "+91", timezone: "Asia/Kolkata" },
  { id: "uae", name: "United Arab Emirates", code: "AE", currency: "AED", phone: "+971", timezone: "Asia/Dubai" },
  { id: "singapore", name: "Singapore", code: "SG", currency: "SGD", phone: "+65", timezone: "Asia/Singapore" },
  { id: "usa", name: "United States", code: "US", currency: "USD", phone: "+1", timezone: "America/New_York" },
  { id: "uk", name: "United Kingdom", code: "GB", currency: "GBP", phone: "+44", timezone: "Europe/London" },
  { id: "thailand", name: "Thailand", code: "TH", currency: "THB", phone: "+66", timezone: "Asia/Bangkok" },
  { id: "indonesia", name: "Indonesia", code: "ID", currency: "IDR", phone: "+62", timezone: "Asia/Jakarta" },
  { id: "australia", name: "Australia", code: "AU", currency: "AUD", phone: "+61", timezone: "Australia/Sydney" },
];

const BUSINESS_TYPES = [
  "Individual Owner", "Sole Proprietorship", "Partnership", "LLP", "Private Company",
  "Public Company", "Corporation", "Agency", "DMC", "Property Group", "Transport Operator",
  "Fleet Owner", "Activity Operator", "Event Organizer", "Cruise Operator",
  "Religious / Temple Trust", "Non-profit / Foundation", "Government / Public Authority", "Other",
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
  { id: "stay", name: "Stay", description: "Hotels, resorts, villas, homestays and accommodation", icon: "🏨" },
  { id: "bus", name: "Bus", description: "Bus operators, routes, fleet and scheduled trips", icon: "🚌" },
  { id: "cab", name: "Cab", description: "Cab, taxi, rental and transfer operators", icon: "🚕" },
  { id: "packages", name: "Tours", description: "Holiday packages, tours and DMC services", icon: "🧳" },
  { id: "activities", name: "Activities", description: "Experiences, attractions and activities", icon: "🎟️" },
  { id: "events", name: "Events", description: "Events, nightlife and ticketed experiences", icon: "🎉" },
  { id: "darshan", name: "Darshan", description: "Temple, religious and spiritual experiences", icon: "🛕" },
  { id: "cruise", name: "Cruise", description: "Cruise operators, ships and cabins", icon: "🚢" },
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
    { id: "serviced-apartment", name: "Serviced Apartment" },
    { id: "camp", name: "Camp" },
  ],
  bus: [
    { id: "intercity-bus-operator", name: "Intercity Bus Operator" },
    { id: "tourist-bus-operator", name: "Tourist Bus Operator" },
    { id: "shuttle-operator", name: "Shuttle Operator" },
    { id: "sleeper-bus-operator", name: "Sleeper Bus Operator" },
    { id: "luxury-coach-operator", name: "Luxury Coach Operator" },
  ],
  cab: [
    { id: "independent-cab-owner", name: "Independent Cab Owner" },
    { id: "fleet-owner", name: "Fleet Owner" },
    { id: "airport-transfer-operator", name: "Airport Transfer Operator" },
    { id: "car-rental-operator", name: "Car Rental Operator" },
    { id: "chauffeur-service", name: "Chauffeur Service" },
  ],
  packages: [
    { id: "tour-operator", name: "Tour Operator" },
    { id: "travel-agency", name: "Travel Agency" },
    { id: "dmc", name: "DMC" },
    { id: "inbound-tour-operator", name: "Inbound Tour Operator" },
    { id: "outbound-tour-operator", name: "Outbound Tour Operator" },
  ],
  activities: [
    { id: "activity-operator", name: "Activity Operator" },
    { id: "attraction", name: "Attraction" },
    { id: "adventure-operator", name: "Adventure Operator" },
    { id: "experience-host", name: "Experience Host" },
  ],
  events: [
    { id: "event-organizer", name: "Event Organizer" },
    { id: "nightlife-venue", name: "Nightlife Venue" },
    { id: "concert-organizer", name: "Concert Organizer" },
    { id: "festival-organizer", name: "Festival Organizer" },
  ],
  darshan: [
    { id: "temple-trust", name: "Temple Trust" },
    { id: "religious-operator", name: "Religious Operator" },
    { id: "darshan-service-provider", name: "Darshan Service Provider" },
    { id: "pilgrimage-operator", name: "Pilgrimage Operator" },
  ],
  cruise: [
    { id: "cruise-line", name: "Cruise Line" },
    { id: "cruise-operator", name: "Cruise Operator" },
    { id: "river-cruise", name: "River Cruise" },
    { id: "yacht-operator", name: "Yacht Operator" },
  ],
};

const STEPS = [
  { id: 1, key: "country", title: "Country" },
  { id: 2, key: "businessType", title: "Business Type" },
  { id: 3, key: "vertical", title: "Choose Vertical" },
  { id: 4, key: "subtype", title: "Choose Subtype" },
  { id: 5, key: "basics", title: "Property Basics" },
  { id: 6, key: "location", title: "Location" },
  { id: 7, key: "classification", title: "Classification" },
  { id: 8, key: "units", title: "Rooms & Units" },
  { id: 9, key: "amenities", title: "Amenities & Services" },
  { id: 10, key: "policies", title: "Rules & Policies" },
  { id: 11, key: "photos", title: "Photos & Videos" },
  { id: 12, key: "kyc", title: "Owner / KYC" },
  { id: 13, key: "documents", title: "Documents" },
  { id: 14, key: "media", title: "Media" },
  { id: 15, key: "bank", title: "Bank & Payout" },
  { id: 16, key: "tax", title: "Tax" },
  { id: 17, key: "contract", title: "Contract" },
  { id: 18, key: "review", title: "Review & Submit" },
];

/* =====================================================
   FILE UPLOAD HELPERS

   Saari files form.files[<key>] = [ { file, name, type, size, preview } ]
   me memory me rehti hain (localStorage draft me nahi jaati).
   Submit par pehle har file UPLOAD_URL par upload hoti hai, phir
   milne wale URLs payload me jaate hain.
===================================================== */

const UPLOAD_KINDS = {
  image: { accept: "image/*", maxMB: 5, title: "Upload image", hint: "JPG, PNG, WEBP · max 5 MB each" },
  video: { accept: "video/*", maxMB: 100, title: "Upload video", hint: "MP4 / WEBM · max 100 MB each" },
  doc: { accept: "image/*,application/pdf", maxMB: 5, title: "Upload image or PDF", hint: "JPG, PNG or PDF · clear and readable · max 5 MB" },
};

/* In keys ke alawa baaki saari uploaded files "documents" me jaati hain */
const MEDIA_KEYS = ["logo", "coverImage", "propertyImages", "videos", "brochure"];

const formatBytes = (bytes = 0) =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

const docStyles = `
.bmt-up{display:flex;flex-direction:column;gap:6px}
.bmt-up-label{font-size:13px;font-weight:600}
.bmt-up-drop{display:flex;align-items:center;gap:12px;padding:14px 16px;border:1.5px dashed #cbd5e1;border-radius:12px;background:#f8fafc;cursor:pointer;transition:.15s}
.bmt-up-drop:hover{border-color:#ff5a00;background:#fff7f2}
.bmt-up-drop input{display:none}
.bmt-up-icon{width:38px;height:38px;border-radius:10px;background:#fff1e8;color:#ff5a00;display:grid;place-items:center;font-size:18px;font-weight:700;flex:none}
.bmt-up-drop strong{display:block;font-size:13px}
.bmt-up-drop small{color:#64748b;font-size:12px}
.bmt-up-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px;margin-top:6px}
.bmt-up-item{position:relative;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;background:#fff}
.bmt-up-item img,.bmt-up-item video{width:100%;height:100px;object-fit:cover;display:block;background:#f1f5f9}
.bmt-up-pdf{height:100px;display:grid;place-items:center;background:#fee2e2;color:#b91c1c;font-weight:800;font-size:14px}
.bmt-up-info{padding:6px 8px;font-size:11px;color:#475569}
.bmt-up-info strong{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#0f172a}
.bmt-up-remove{position:absolute;top:6px;right:6px;border:0;border-radius:6px;background:rgba(15,23,42,.8);color:#fff;font-size:11px;padding:3px 8px;cursor:pointer}
.bmt-up-error{color:#b91c1c;font-size:12px}
`;

function FileUpload({ label, files = [], onChange, kind = "doc", multiple = false }) {
  const cfg = UPLOAD_KINDS[kind] || UPLOAD_KINDS.doc;
  const [problem, setProblem] = useState("");

  const typeOk = (file) => {
    if (kind === "image") return file.type.startsWith("image/");
    if (kind === "video") return file.type.startsWith("video/");
    return file.type.startsWith("image/") || file.type === "application/pdf";
  };

  const handlePick = (event) => {
    const picked = [];
    let err = "";

    Array.from(event.target.files || []).forEach((file) => {
      if (!typeOk(file)) {
        err = `${file.name}: yeh file type allowed nahi hai.`;
        return;
      }
      if (file.size > cfg.maxMB * 1024 * 1024) {
        err = `${file.name} bahut bada hai. Max ${cfg.maxMB} MB.`;
        return;
      }
      picked.push({
        file,
        name: file.name,
        type: file.type,
        size: file.size,
        preview: URL.createObjectURL(file),
      });
    });

    event.target.value = "";
    setProblem(err);
    if (!picked.length) return;

    if (multiple) {
      onChange([...files, ...picked]);
    } else {
      files.forEach((f) => URL.revokeObjectURL(f.preview));
      onChange([picked[0]]);
    }
  };

  const remove = (index) => {
    URL.revokeObjectURL(files[index].preview);
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className={multiple ? "bmt-up bmt-form-span-2" : "bmt-up"}>
      <span className="bmt-up-label">{label}</span>

      {(multiple || files.length === 0) && (
        <label className="bmt-up-drop">
          <input type="file" accept={cfg.accept} multiple={multiple} onChange={handlePick} />
          <span className="bmt-up-icon">↑</span>
          <span>
            <strong>{cfg.title}</strong>
            <small>{cfg.hint}</small>
          </span>
        </label>
      )}

      {files.length > 0 && (
        <div className="bmt-up-grid">
          {files.map((item, index) => (
            <div className="bmt-up-item" key={`${item.name}-${index}`}>
              {item.type.startsWith("image/") && <img src={item.preview} alt={item.name} />}
              {item.type.startsWith("video/") && <video src={item.preview} />}
              {item.type === "application/pdf" && <div className="bmt-up-pdf">PDF</div>}

              <div className="bmt-up-info">
                <strong>{item.name}</strong>
                {formatBytes(item.size)}
              </div>

              <button type="button" className="bmt-up-remove" onClick={() => remove(index)}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {problem && <span className="bmt-up-error">{problem}</span>}
    </div>
  );
}

/* =====================================================
   VERTICAL-SPECIFIC STEP CONFIG
   Cruise, Tours (packages), Activities, Events, Darshan.

   Field flags:
     required : validation
     positive : number > 0 hona chahiye
     root     : value form[name] me store hoti hai (vd me nahi)
     out      : payload me is naam se jaayega
     kind     : (file) image | video | doc
     multiple : (file) ek se zyada files
===================================================== */

const fText = (name, label, x = {}) => ({ name, label, type: "text", ...x });
const fNum = (name, label, x = {}) => ({ name, label, type: "number", ...x });
const fArea = (name, label, x = {}) => ({ name, label, type: "textarea", ...x });
const fSel = (name, label, options, x = {}) => ({ name, label, type: "select", options, ...x });
const fChips = (name, label, options, x = {}) => ({ name, label, type: "chips", options, ...x });
const fToggle = (name, label) => ({ name, label, type: "toggle" });
const fTime = (name, label, x = {}) => ({ name, label, type: "time", ...x });
const fFile = (name, label, x = {}) => ({ name, label, type: "file", kind: "doc", ...x });

/* Image / video uploads (pehle URL textarea the) */
const fImages = (label, required = false) =>
  fFile("propertyImages", label, { kind: "image", multiple: true, required });
const fVideos = (label) => fFile("videos", label, { kind: "video", multiple: true });

const cancelRefund = [
  fArea("cancellationPolicy", "Cancellation policy", {
    required: true, placeholder: "Free cancellation kab tak, uske baad kitna charge",
  }),
  fArea("refundPolicy", "Refund policy", {
    required: true, placeholder: "Refund kitne din me aur kis mode me",
  }),
];

const VERTICAL_CONFIG = {
  /* ------------------- BUS ------------------- */
  bus: {
    key: "busDetails",
    steps: {
      5: {
        section: "basic",
        withBasic: true,
        title: "Bus Operator Details",
        desc: "Tell passengers who operates the buses.",
        fields: [
          fText("tagline", "Tagline", { placeholder: "e.g. Comfortable overnight travel across North India" }),
          fNum("yearsInBusiness", "Years in business"),
          fNum("fleetSize", "Total buses in fleet", { required: true, positive: true }),
          fText("operatingRegions", "Operating states / regions", { placeholder: "Punjab, Delhi, Himachal" }),
          fText("supportPhone", "Customer support phone"),
          fArea("description", "About your bus service", { placeholder: "Routes, comfort, safety highlights" }),
        ],
      },
      7: {
        section: "classification",
        title: "Bus Classification",
        desc: "Choose the type of buses and service you run.",
        fields: [
          fChips("busTypes", "Bus types", [
            "AC Seater", "Non-AC Seater", "AC Sleeper", "Non-AC Sleeper", "Semi-Sleeper",
            "Volvo / Multi-axle", "Luxury Coach", "Mini Bus", "Tempo Traveller",
          ], { required: true }),
          fSel("operationType", "Operation type", [
            "Intercity", "Interstate", "Local / City", "Tourist / Charter", "Shuttle",
          ], { required: true }),
          fSel("permitType", "Permit type", [
            "State permit", "All India tourist permit", "Contract carriage", "Stage carriage",
          ], { required: true }),
        ],
      },
      8: {
        section: "inventory",
        title: "Fleet, Routes & Fares",
        desc: "Fleet capacity and main routes. Trips and seat layouts dashboard me add hongi.",
        fields: [
          fNum("totalBuses", "Number of buses available for booking", { required: true, positive: true }),
          fNum("avgSeatsPerBus", "Average seats per bus"),
          fArea("popularRoutes", "Main routes", {
            required: true, placeholder: "Chandigarh - Delhi, Delhi - Manali, Amritsar - Jaipur...",
          }),
          fText("departureCities", "Departure cities", { placeholder: "Chandigarh, Ludhiana, Amritsar" }),
          fArea("boardingPoints", "Main boarding / drop points"),
          fNum("startingFare", "Starting fare per seat"),
          fToggle("ownDrivers", "Own drivers & conductors"),
          fToggle("gpsTracking", "GPS tracking on all buses"),
          fToggle("womenSeats", "Seats reserved for women"),
          fToggle("onlineBooking", "Accept online seat bookings"),
        ],
      },
      9: {
        section: "amenities",
        title: "Onboard Amenities",
        desc: "What do passengers get onboard?",
        fields: [
          fChips("amenities", "Amenities", [
            "Charging point", "Wi-Fi", "Blanket", "Water bottle", "Reading light",
            "Entertainment screen", "CCTV", "GPS tracking", "Fire extinguisher", "First aid kit",
            "Emergency exit", "Pushback seats", "Snacks", "Live tracking link",
          ], { required: true }),
        ],
      },
      10: {
        section: "policies",
        title: "Booking & Travel Policies",
        desc: "Cancellation, luggage and boarding rules.",
        fields: [
          ...cancelRefund,
          fArea("luggagePolicy", "Luggage policy", { required: true, placeholder: "Free luggage limit, extra charges" }),
          fArea("boardingPolicy", "Boarding policy", { placeholder: "Report time before departure, ID needed" }),
          fArea("childPolicy", "Child policy"),
          fArea("delayPolicy", "Delay / breakdown policy"),
        ],
      },
      11: {
        section: "media",
        title: "Bus Photos & Videos",
        desc: "Upload photos and videos of your buses.",
        fields: [fImages("Bus images (exterior / interior / seats)", true), fVideos("Videos")],
      },
      13: {
        section: "documents",
        title: "Permits & Vehicle Documents",
        desc: "Permit and vehicle document numbers, with a copy of each document.",
        fields: [
          fText("busPermitNumber", "Route / tourist permit no."),
          fText("rcNumber", "RC (registration certificate) no."),
          fText("fitnessCertificateNumber", "Fitness certificate no."),
          fText("insurancePolicyNumber", "Vehicle insurance policy no."),
          fText("pucNumber", "PUC certificate no."),
          fText("operatorLicenseNumber", "Transport operator licence no."),
          fFile("busPermitDoc", "Route / tourist permit"),
          fFile("rcDoc", "RC (registration certificate)"),
          fFile("fitnessCertificateDoc", "Fitness certificate"),
          fFile("insurancePolicyDoc", "Vehicle insurance"),
          fFile("pucDoc", "PUC certificate"),
          fFile("operatorLicenseDoc", "Transport operator licence"),
        ],
      },
    },
  },

  /* ------------------- CAB ------------------- */
  cab: {
    key: "cabDetails",
    steps: {
      5: {
        section: "basic",
        withBasic: true,
        title: "Cab Business Details",
        desc: "Tell customers about your cab or taxi service.",
        fields: [
          fText("tagline", "Tagline", { placeholder: "e.g. Safe airport and outstation rides" }),
          fNum("yearsInBusiness", "Years in business"),
          fNum("fleetSize", "Total vehicles", { required: true, positive: true }),
          fText("serviceCities", "Cities you operate in", { placeholder: "Chandigarh, Mohali, Delhi" }),
          fText("supportPhone", "Customer support phone"),
          fArea("description", "About your service", { placeholder: "Type of rides, drivers, safety" }),
        ],
      },
      7: {
        section: "classification",
        title: "Cab Classification",
        desc: "Choose the vehicles and services you offer.",
        fields: [
          fChips("vehicleCategories", "Vehicle categories", [
            "Hatchback", "Sedan", "SUV", "MUV / Innova", "Tempo Traveller", "Luxury", "Electric",
          ], { required: true }),
          fChips("serviceTypes", "Services offered", [
            "Airport transfer", "Outstation", "Local rental (hourly)", "One-way drop",
            "City taxi", "Corporate", "Wedding / events",
          ], { required: true }),
          fChips("fuelTypes", "Fuel types", ["Petrol", "Diesel", "CNG", "Electric"]),
        ],
      },
      8: {
        section: "inventory",
        title: "Fleet & Fares",
        desc: "Fleet size and base pricing. Individual cabs and drivers dashboard me add honge.",
        fields: [
          fNum("totalVehicles", "Vehicles available for booking", { required: true, positive: true }),
          fNum("totalDrivers", "Number of drivers"),
          fArea("serviceAreas", "Service areas / routes", {
            required: true, placeholder: "Tricity, Delhi NCR, Shimla, Manali...",
          }),
          fNum("baseFarePerKm", "Base fare per km", { required: true }),
          fNum("minimumFare", "Minimum fare"),
          fNum("driverAllowancePerDay", "Driver allowance per day (outstation)"),
          fNum("freeWaitingMinutes", "Free waiting time (minutes)"),
          fToggle("allAc", "All vehicles are AC"),
          fToggle("available24x7", "Available 24x7"),
          fToggle("carrierAvailable", "Luggage carrier available"),
          fToggle("tollIncluded", "Toll included in fare"),
        ],
      },
      9: {
        section: "amenities",
        title: "Vehicle Facilities",
        desc: "What do customers get in your cabs?",
        fields: [
          fChips("facilities", "Facilities", [
            "GPS tracking", "Child seat", "Roof carrier", "Wi-Fi", "Phone charger", "Water bottle",
            "First aid kit", "Dashcam", "Uniformed driver", "UPI / card payment", "Music system",
          ], { required: true }),
        ],
      },
      10: {
        section: "policies",
        title: "Ride & Booking Policies",
        desc: "Cancellation, waiting and charges.",
        fields: [
          ...cancelRefund,
          fArea("waitingChargePolicy", "Waiting charges"),
          fArea("nightChargePolicy", "Night charges"),
          fArea("tollParkingPolicy", "Toll / parking / state tax policy", { required: true }),
          fArea("kmLimitPolicy", "Km limit / extra km charges"),
          fArea("safetyPolicy", "Safety & driver conduct"),
        ],
      },
      11: {
        section: "media",
        title: "Vehicle Photos & Videos",
        desc: "Upload photos and videos of your vehicles.",
        fields: [fImages("Vehicle images (exterior / interior)", true), fVideos("Videos")],
      },
      13: {
        section: "documents",
        title: "Vehicle & Driver Documents",
        desc: "Document numbers, with a copy of each document.",
        fields: [
          fText("rcNumber", "RC (registration certificate) no."),
          fText("permitNumber", "Commercial / tourist permit no."),
          fText("insurancePolicyNumber", "Vehicle insurance policy no."),
          fText("fitnessCertificateNumber", "Fitness certificate no."),
          fText("pucNumber", "PUC certificate no."),
          fText("driverLicenseNumber", "Driver / owner driving licence no."),
          fFile("rcDoc", "RC (registration certificate)"),
          fFile("permitDoc", "Commercial / tourist permit"),
          fFile("insurancePolicyDoc", "Vehicle insurance"),
          fFile("fitnessCertificateDoc", "Fitness certificate"),
          fFile("pucDoc", "PUC certificate"),
          fFile("driverLicenseDoc", "Driving licence"),
          fFile("policeVerificationDoc", "Police verification (driver)"),
        ],
      },
    },
  },

  /* ------------------- CRUISE ------------------- */
  cruise: {
    key: "cruiseDetails",
    steps: {
      5: {
        section: "basic",
        title: "Cruise Basic Details",
        desc: "Enter your cruise operator and contact details.",
        fields: [
          fText("cruiseOperatorName", "Cruise operator name", { required: true }),
          fText("cruiseLineName", "Cruise line name", { required: true }),
          fText("businessRegistrationNumber", "Business registration number", { root: true }),
          fText("contactPerson", "Contact person"),
          fText("businessEmail", "Business email"),
          fText("businessPhone", "Business phone"),
          fFile("businessRegistrationDoc", "Business registration certificate"),
        ],
      },
      7: {
        section: "classification",
        title: "Cruise Classification",
        desc: "Select the type of cruise service you provide.",
        fields: [
          fSel("cruiseType", "Cruise type", [
            "ocean_cruise", "river_cruise", "luxury_cruise", "expedition_cruise", "yacht_cruise",
          ], { required: true }),
          fSel("cruiseOperatorType", "Operator type", [
            "cruise_line", "cruise_operator", "river_cruise_operator", "yacht_operator",
          ], { required: true }),
          fSel("vesselType", "Vessel type", [
            "passenger_ship", "river_ship", "yacht", "catamaran", "expedition_ship",
          ], { required: true }),
          fSel("cruiseCategory", "Service category", [
            "standard", "premium", "luxury", "ultra_luxury",
          ], { required: true }),
          fArea("cruiseExperience", "Cruise experience", {
            placeholder: "Routes, onboard services, activities etc.",
          }),
        ],
      },
      8: {
        section: "ship",
        title: "Ship, Cabins & Route",
        desc: "Add ship details, passenger capacity, cabins and route information.",
        fields: [
          fText("shipName", "Ship name", { required: true }),
          fText("imoNumber", "IMO number"),
          fText("shipRegistrationNumber", "Ship registration number"),
          fNum("yearBuilt", "Year built", { placeholder: "e.g. 2022" }),
          fNum("passengerCapacity", "Passenger capacity", { required: true, positive: true }),
          fNum("crewCapacity", "Crew capacity"),
          fNum("numberOfDecks", "Number of decks"),
          fNum("numberOfCabins", "Total cabins", { required: true, positive: true }),
          fArea("cabinTypes", "Cabin types", {
            required: true, placeholder: "Interior, Ocean View, Balcony, Suite",
          }),
          fText("departurePort", "Departure port", { required: true, placeholder: "e.g. Mumbai Port" }),
          fText("destinationPort", "Main destination", { required: true, placeholder: "e.g. Goa" }),
          fText("cruiseDuration", "Cruise duration", { required: true, placeholder: "e.g. 3 Nights / 4 Days" }),
          fTime("embarkationTime", "Embarkation time"),
        ],
      },
      9: {
        section: "amenities",
        title: "Onboard Amenities",
        desc: "Select all facilities available onboard.",
        fields: [
          fChips("cruiseAmenities", "Amenities", [
            "Swimming Pool", "Kids Pool", "Restaurant", "Buffet", "Bar & Lounge", "Spa",
            "Gym & Fitness Center", "Wi-Fi", "Room Service", "24/7 Reception", "Entertainment",
            "Live Shows", "Theatre", "Casino", "Kids Club", "Play Area", "Shopping",
            "Beauty Salon", "Medical Facility", "Laundry", "Conference / Business Center",
            "Outdoor Deck", "Jacuzzi", "Sports Activities", "Excursion Services",
          ], { required: true }),
        ],
      },
      10: {
        section: "policies",
        title: "Cruise Policies",
        desc: "Policies for bookings, passengers and the onboard experience.",
        fields: [
          ...cancelRefund,
          fArea("childPolicy", "Child policy", { required: true }),
          fArea("infantPolicy", "Infant policy"),
          fArea("passengerEligibility", "Passenger eligibility", { placeholder: "Age limits, requirements" }),
          fArea("baggagePolicy", "Baggage policy", { required: true }),
          fArea("passportVisaPolicy", "Passport / visa requirements", { required: true }),
          fArea("checkInPolicy", "Check-in / boarding policy", { required: true }),
          fArea("medicalPolicy", "Medical / health requirements"),
          fArea("specialRequirements", "Special requirements", {
            placeholder: "Wheelchair assistance, dietary needs, special requests",
          }),
        ],
      },
      11: {
        section: "media",
        title: "Cruise Photos & Videos",
        desc: "Upload your logo, cover image, and ship / cabin photos and videos.",
        fields: [
          fFile("logo", "Cruise operator logo", { kind: "image", required: true }),
          fFile("coverImage", "Cruise / ship cover image", { kind: "image", required: true }),
          fImages("Ship / cabin / onboard images", true),
          fVideos("Cruise videos"),
        ],
      },
      13: {
        section: "documents",
        title: "Maritime Licences & Certificates",
        desc: "Licence and safety certificate numbers for your vessel, with a copy of each document.",
        fields: [
          fText("maritimeLicenseNumber", "Maritime / operator licence no."),
          fText("portAuthorityPermit", "Port authority permit no."),
          fText("safetyManagementCertificate", "Safety management (ISM) certificate no."),
          fText("insurancePolicyNumber", "Passenger liability insurance policy no."),
          fFile("maritimeLicenseDoc", "Maritime / operator licence"),
          fFile("portAuthorityPermitDoc", "Port authority permit"),
          fFile("safetyManagementCertificateDoc", "Safety management (ISM) certificate"),
          fFile("insurancePolicyDoc", "Passenger liability insurance"),
        ],
      },
    },
  },

  /* ------------------- TOURS / PACKAGES ------------------- */
  packages: {
    key: "packageDetails",
    steps: {
      5: {
        section: "basic",
        withBasic: true,
        title: "Tour Company Details",
        desc: "Tell travellers who you are and what makes your tours different.",
        fields: [
          fText("tagline", "Tagline", { placeholder: "e.g. Handcrafted Himalayan journeys" }),
          fNum("yearsInBusiness", "Years in business"),
          fNum("teamSize", "Team size"),
          fText("languages", "Languages spoken", { placeholder: "Hindi, English, French" }),
          fText("supportPhone", "Customer support phone"),
          fText("supportEmail", "Customer support email"),
          fArea("description", "About your company", { placeholder: "Short introduction for the marketplace listing" }),
        ],
      },
      7: {
        section: "classification",
        title: "Tour Classification",
        desc: "Choose the type of holidays you sell.",
        fields: [
          fSel("operatingRegion", "Operating region", ["Domestic", "International", "Both"], { required: true }),
          fChips("packageCategories", "Package categories", [
            "Honeymoon", "Family", "Adventure", "Pilgrimage", "Luxury", "Budget", "Wildlife",
            "Beach", "Hill Stations", "Corporate / MICE", "Cultural", "Weekend Getaway",
          ], { required: true }),
          fChips("tourStyles", "Tour style", ["Group tours", "Private tours", "Fixed departures", "Fully customised"]),
          fArea("destinationsCovered", "Destinations covered", {
            required: true, placeholder: "Manali, Kashmir, Goa, Bali, Dubai...",
          }),
        ],
      },
      8: {
        section: "inventory",
        title: "Packages & Capacity",
        desc: "Initial package inventory. Full itineraries dashboard me add hongi.",
        fields: [
          fNum("activePackages", "Number of active packages", { required: true }),
          fText("departureCities", "Departure cities", { placeholder: "Delhi, Mumbai, Chandigarh" }),
          fText("typicalDurations", "Typical durations", { placeholder: "3N/4D, 5N/6D, 7N/8D" }),
          fNum("startingPrice", "Starting price per person"),
          fNum("minGroupSize", "Minimum group size"),
          fNum("maxGroupSize", "Maximum group size"),
          fToggle("hasOwnTransport", "Own vehicles / transport"),
          fToggle("guidesAvailable", "In-house tour guides"),
        ],
      },
      9: {
        section: "amenities",
        title: "Inclusions & Services",
        desc: "What is usually included in your packages?",
        fields: [
          fChips("services", "Services offered", [
            "Hotel stay", "Meals", "Airport / station transfers", "Sightseeing", "Tour guide",
            "Flights", "Train tickets", "Visa assistance", "Travel insurance", "Entry tickets",
            "24x7 trip support", "Customisation",
          ], { required: true }),
        ],
      },
      10: {
        section: "policies",
        title: "Booking Policies",
        desc: "Cancellation, payment and traveller terms.",
        fields: [
          ...cancelRefund,
          fArea("paymentPolicy", "Payment policy", { placeholder: "Advance %, balance payment date" }),
          fArea("childPolicy", "Child policy"),
          fArea("exclusions", "Not included"),
          fArea("termsAndConditions", "Other terms & conditions"),
        ],
      },
      11: {
        section: "media",
        title: "Tour Photos & Videos",
        desc: "Upload photos and videos of your best tours.",
        fields: [
          fImages("Tour images", true),
          fVideos("Videos"),
          fFile("brochure", "Brochure / sample itinerary (PDF)"),
        ],
      },
      13: {
        section: "documents",
        title: "Licences & Certificates",
        desc: "Licence numbers for tour operations, with a copy of each document.",
        fields: [
          fText("tourismLicenseNumber", "Tourism / tour operator licence no."),
          fText("iataNumber", "IATA / TAAI / ADTOI membership no."),
          fText("insurancePolicyNumber", "Liability insurance policy no."),
          fText("registrationLicenseNumber", "Company registration / shop & establishment no."),
          fFile("tourismLicenseDoc", "Tourism / tour operator licence"),
          fFile("iataDoc", "IATA / TAAI / ADTOI membership"),
          fFile("insurancePolicyDoc", "Liability insurance"),
          fFile("registrationLicenseDoc", "Company registration / shop & establishment"),
        ],
      },
    },
  },

  /* ------------------- ACTIVITIES ------------------- */
  activities: {
    key: "activityDetails",
    steps: {
      5: {
        section: "basic",
        withBasic: true,
        title: "Activity Business Details",
        desc: "Introduce your experiences to customers.",
        fields: [
          fText("tagline", "Tagline", { placeholder: "e.g. Rafting & camping on the Beas" }),
          fNum("yearsInBusiness", "Years in business"),
          fText("languages", "Languages spoken"),
          fText("supportPhone", "Customer support phone"),
          fText("meetingPoint", "Main meeting / check-in point", { placeholder: "Address or landmark" }),
          fArea("description", "About your business", { placeholder: "What guests can expect" }),
        ],
      },
      7: {
        section: "classification",
        title: "Activity Classification",
        desc: "Choose the kind of experiences you run.",
        fields: [
          fChips("activityCategories", "Activity categories", [
            "Water sports", "Trekking", "Paragliding", "Safari", "Rafting", "Camping",
            "Sightseeing", "Cultural", "Theme park", "Museum / attraction", "Food tour", "Wellness",
          ], { required: true }),
          fSel("difficultyLevel", "Difficulty level", ["Easy", "Moderate", "Challenging", "Extreme"], { required: true }),
          fSel("experienceType", "Experience type", ["Group", "Private", "Both"]),
          fSel("setting", "Setting", ["Outdoor", "Indoor", "Both"]),
        ],
      },
      8: {
        section: "inventory",
        title: "Capacity & Schedule",
        desc: "Slot capacity and timing for your experiences.",
        fields: [
          fNum("totalActivities", "Number of activities offered", { required: true }),
          fNum("maxParticipantsPerSlot", "Max participants per slot", { required: true }),
          fNum("slotsPerDay", "Slots per day"),
          fNum("durationMinutes", "Typical duration (minutes)"),
          fNum("minAge", "Minimum age"),
          fNum("maxAge", "Maximum age"),
          fNum("startingPrice", "Starting price per person"),
          fText("operatingMonths", "Operating months", { placeholder: "e.g. Oct - Jun" }),
          fTime("openingTime", "Opening time"),
          fTime("closingTime", "Closing time"),
          fToggle("pickupAvailable", "Pickup / drop available"),
          fToggle("privateBookingAvailable", "Private booking available"),
        ],
      },
      9: {
        section: "amenities",
        title: "Facilities & Inclusions",
        desc: "What do guests get with the experience?",
        fields: [
          fChips("facilities", "Facilities & inclusions", [
            "Safety gear", "Trained instructor", "Guide", "Photos / videos", "Refreshments",
            "Transport", "Lockers", "Changing room", "First aid", "Insurance included",
            "Equipment rental", "Parking",
          ], { required: true }),
        ],
      },
      10: {
        section: "policies",
        title: "Safety & Booking Policies",
        desc: "Safety rules and cancellation terms.",
        fields: [
          ...cancelRefund,
          fArea("safetyRules", "Safety rules", {
            required: true, placeholder: "Briefing, gear, guidelines guests must follow",
          }),
          fArea("healthRestrictions", "Age / health restrictions"),
          fArea("weatherPolicy", "Weather / force majeure policy"),
          fArea("whatToBring", "What to bring / dress code"),
        ],
      },
      11: {
        section: "media",
        title: "Activity Photos & Videos",
        desc: "Upload photos and videos of your experiences.",
        fields: [fImages("Activity images", true), fVideos("Videos")],
      },
      13: {
        section: "documents",
        title: "Licences & Safety Certificates",
        desc: "Permits required for running activities, with a copy of each document.",
        fields: [
          fText("activityLicenseNumber", "Activity / adventure operator licence no."),
          fText("safetyCertificateNumber", "Safety certificate no."),
          fText("insurancePolicyNumber", "Liability insurance policy no."),
          fText("instructorCertification", "Instructor / guide certification no."),
          fText("forestPermitNumber", "Forest / local authority permit no."),
          fFile("activityLicenseDoc", "Activity / adventure operator licence"),
          fFile("safetyCertificateDoc", "Safety certificate"),
          fFile("insurancePolicyDoc", "Liability insurance"),
          fFile("instructorCertificationDoc", "Instructor / guide certification"),
          fFile("forestPermitDoc", "Forest / local authority permit"),
        ],
      },
    },
  },

  /* ------------------- EVENTS ------------------- */
  events: {
    key: "eventDetails",
    steps: {
      5: {
        section: "basic",
        withBasic: true,
        title: "Organizer Details",
        desc: "Tell audiences who is behind the events.",
        fields: [
          fText("tagline", "Tagline"),
          fNum("yearsInBusiness", "Years organizing events"),
          fNum("eventsHosted", "Events hosted so far"),
          fText("supportPhone", "Customer support phone"),
          fText("instagram", "Instagram / social link"),
          fArea("description", "About the organizer / venue", {
            placeholder: "Type of events, audience, highlights",
          }),
        ],
      },
      7: {
        section: "classification",
        title: "Event Classification",
        desc: "What kind of events do you host?",
        fields: [
          fChips("eventCategories", "Event categories", [
            "Concert", "Festival", "Nightlife / club", "Comedy", "Workshop", "Sports",
            "Exhibition", "Conference", "Cultural", "Theatre",
          ], { required: true }),
          fSel("venueType", "Venue type", ["Indoor", "Outdoor", "Both"], { required: true }),
          fSel("ageRestriction", "Age restriction", ["All ages", "18+", "21+"], { required: true }),
        ],
      },
      8: {
        section: "inventory",
        title: "Venue & Ticketing",
        desc: "Capacity and ticketing details.",
        fields: [
          fText("venueName", "Venue name"),
          fNum("venueCapacity", "Maximum capacity", { required: true }),
          fSel("seatingType", "Seating type", ["Standing", "Seated", "Mixed"]),
          fNum("eventsPerMonth", "Typical events per month"),
          fNum("ticketPriceFrom", "Ticket price from"),
          fNum("parkingCapacity", "Parking capacity"),
          fToggle("hasTicketTiers", "Multiple ticket tiers (Early bird / VIP)"),
          fToggle("hasTableBooking", "Table / group bookings"),
        ],
      },
      9: {
        section: "amenities",
        title: "Venue Facilities",
        desc: "Facilities available at your events.",
        fields: [
          fChips("facilities", "Facilities", [
            "Sound system", "Stage", "Lighting", "VIP area", "Bar", "Food court", "Cloakroom",
            "Parking", "Valet", "Security staff", "Medical desk", "Wheelchair access", "Green room",
          ], { required: true }),
        ],
      },
      10: {
        section: "policies",
        title: "Entry & Ticket Policies",
        desc: "Entry rules and refund terms.",
        fields: [
          ...cancelRefund,
          fArea("entryPolicy", "Entry policy", {
            required: true, placeholder: "ID check, entry timing, re-entry rules",
          }),
          fArea("reschedulePolicy", "Event postponed / cancelled by organizer"),
          fArea("dressCode", "Dress code"),
          fArea("prohibitedItems", "Prohibited items"),
        ],
      },
      11: {
        section: "media",
        title: "Event Photos & Videos",
        desc: "Upload photos and videos from past events and the venue.",
        fields: [fImages("Event / venue images", true), fVideos("Videos / aftermovie")],
      },
      13: {
        section: "documents",
        title: "Permits & Licences",
        desc: "Permits required for hosting events, with a copy of each document.",
        fields: [
          fText("eventPermitNumber", "Event permission / police NOC no."),
          fText("venueLicenseNumber", "Venue licence no."),
          fText("entertainmentLicenseNumber", "Entertainment / music licence (PPL / IPRS) no."),
          fText("fireNocNumber", "Fire NOC no."),
          fText("liquorLicenseNumber", "Liquor licence no. (if applicable)"),
          fFile("eventPermitDoc", "Event permission / police NOC"),
          fFile("venueLicenseDoc", "Venue licence"),
          fFile("entertainmentLicenseDoc", "Entertainment / music licence"),
          fFile("fireNocDoc", "Fire NOC"),
          fFile("liquorLicenseDoc", "Liquor licence (if applicable)"),
        ],
      },
    },
  },

  /* ------------------- DARSHAN ------------------- */
  darshan: {
    key: "darshanDetails",
    steps: {
      5: {
        section: "basic",
        withBasic: true,
        title: "Temple / Trust Details",
        desc: "Details of the religious place or service you represent.",
        fields: [
          fText("mainDeity", "Main deity / place of worship", { required: true }),
          fSel("tradition", "Tradition", [
            "Hindu", "Sikh", "Buddhist", "Jain", "Christian", "Muslim", "Other",
          ], { required: true }),
          fNum("establishedYear", "Established year"),
          fText("supportPhone", "Devotee support phone"),
          fArea("description", "About", { placeholder: "History, significance, what devotees can book" }),
        ],
      },
      7: {
        section: "classification",
        title: "Darshan Classification",
        desc: "Choose the services you provide.",
        fields: [
          fSel("placeType", "Type of place", [
            "Temple", "Gurudwara", "Monastery", "Church", "Dargah", "Pilgrimage operator", "Other",
          ], { required: true }),
          fChips("serviceCategories", "Services offered", [
            "Darshan booking", "VIP / special darshan", "Puja / aarti / seva", "Abhishek",
            "Prasad delivery", "Online puja", "Pilgrimage tours", "Accommodation assistance",
          ], { required: true }),
          fSel("accessLevel", "Access levels", ["General only", "General + VIP", "General + VIP + Special"]),
        ],
      },
      8: {
        section: "inventory",
        title: "Timings & Capacity",
        desc: "Darshan timings and slot capacity.",
        fields: [
          fTime("openingTime", "Opening time", { required: true }),
          fTime("closingTime", "Closing time", { required: true }),
          fText("closedDays", "Closed days / special closures"),
          fNum("dailyCapacity", "Daily darshan capacity", { required: true }),
          fNum("slotDurationMinutes", "Slot duration (minutes)"),
          fNum("startingPrice", "Starting ticket / seva price"),
          fToggle("freeDarshanAvailable", "Free darshan available"),
          fToggle("vipDarshanAvailable", "VIP darshan available"),
          fToggle("seniorCitizenSlots", "Senior citizen slots"),
          fToggle("wheelchairAssistance", "Wheelchair assistance"),
        ],
      },
      9: {
        section: "amenities",
        title: "Devotee Facilities",
        desc: "Facilities available for devotees.",
        fields: [
          fChips("facilities", "Facilities", [
            "Prasad counter", "Cloak room", "Lockers", "Footwear stand", "Drinking water",
            "Medical aid", "Parking", "Guide services", "Accommodation", "Annadanam / Langar",
            "Wheelchair access", "Donation counter",
          ], { required: true }),
        ],
      },
      10: {
        section: "policies",
        title: "Entry Rules & Policies",
        desc: "Rules devotees must follow and booking terms.",
        fields: [
          ...cancelRefund,
          fArea("dressCode", "Dress code", { required: true, placeholder: "e.g. Traditional wear, no shorts" }),
          fArea("cameraPolicy", "Photography / mobile policy"),
          fArea("idRequirement", "ID requirement for booking"),
          fArea("entryRules", "Other entry rules"),
          fArea("specialDaysNote", "Festival / special day rules"),
        ],
      },
      11: {
        section: "media",
        title: "Photos & Videos",
        desc: "Upload photos and videos of the place and services.",
        fields: [fImages("Images", true), fVideos("Videos")],
      },
      13: {
        section: "documents",
        title: "Trust & Permission Documents",
        desc: "Registration and authority permissions, with a copy of each document.",
        fields: [
          fText("trustRegistrationNumber", "Trust / society registration no."),
          fText("templeAuthorityPermission", "Temple board / authority permission no."),
          fText("section80gNumber", "80G / 12A registration no."),
          fText("fcraNumber", "FCRA registration no. (if applicable)"),
          fFile("trustRegistrationDoc", "Trust / society registration certificate"),
          fFile("templeAuthorityPermissionDoc", "Temple board / authority permission"),
          fFile("section80gDoc", "80G / 12A certificate"),
          fFile("fcraDoc", "FCRA certificate (if applicable)"),
        ],
      },
    },
  },
};

/* Stay photos & videos step (step 11) */
const STAY_MEDIA_FIELDS = [fImages("Property images"), fVideos("Property videos")];

const isEmptyValue = (value) =>
  Array.isArray(value)
    ? value.length === 0
    : value === undefined || value === null || String(value).trim() === "";

const getFieldValue = (form, field) => {
  if (field.type === "file") return (form.files || {})[field.name] || [];
  return field.root ? form[field.name] : (form.vd || {})[field.name];
};

function coerceField(field, raw) {
  if (field.type === "number") return raw === undefined || raw === "" || raw === null ? null : Number(raw);
  if (field.type === "chips") return Array.isArray(raw) ? raw : [];
  if (field.type === "toggle") return Boolean(raw);
  return raw || "";
}

function validateConfigStep(step, form) {
  const stepCfg = VERTICAL_CONFIG[form.vertical]?.steps[step];
  if (!stepCfg) return "";

  for (const field of stepCfg.fields) {
    const value = getFieldValue(form, field);

    if (field.required && isEmptyValue(value)) {
      return field.type === "file"
        ? `Please upload: ${field.label}.`
        : `${field.label} is required.`;
    }

    if (field.positive && !isEmptyValue(value) && Number(value) <= 0) {
      return `${field.label} must be greater than 0.`;
    }
  }

  return "";
}

/* Grouped details for Tours / Activities / Events / Darshan. */
function buildGroupedDetails(form, up) {
  const cfg = VERTICAL_CONFIG[form.vertical];
  const out = {};

  Object.values(cfg.steps).forEach((stepCfg) => {
    out[stepCfg.section] = out[stepCfg.section] || {};

    stepCfg.fields.forEach((field) => {
      if (field.type === "file") return;

      out[stepCfg.section][field.out || field.name] = coerceField(
        field,
        getFieldValue(form, field)
      );
    });
  });

  out.media = {
    ...(out.media || {}),
    logo: up.first("logo"),
    coverImage: up.first("coverImage"),
    propertyImages: up.urls("propertyImages"),
    videos: up.urls("videos"),
    brochureUrl: up.first("brochure"),
  };

  return out;
}

/* Cruise keeps the payload shape your backend already expects. */
function buildCruiseDetails(form, up) {
  const v = form.vd || {};
  const num = (x) => Number(x || 0);

  return {
    cruiseOperatorName: v.cruiseOperatorName || "",
    cruiseLineName: v.cruiseLineName || "",
    cruiseType: v.cruiseType || "",
    cruiseOperatorType: v.cruiseOperatorType || "",
    vesselType: v.vesselType || "",
    cruiseCategory: v.cruiseCategory || "",
    cruiseExperience: v.cruiseExperience || "",

    shipName: v.shipName || "",
    imoNumber: v.imoNumber || "",
    shipRegistrationNumber: v.shipRegistrationNumber || "",
    yearBuilt: v.yearBuilt || "",
    passengerCapacity: num(v.passengerCapacity),
    crewCapacity: num(v.crewCapacity),
    numberOfDecks: num(v.numberOfDecks),
    numberOfCabins: num(v.numberOfCabins),
    cabinTypes: v.cabinTypes || "",

    departurePort: v.departurePort || "",
    destinationPort: v.destinationPort || "",
    cruiseDuration: v.cruiseDuration || "",
    embarkationTime: v.embarkationTime || "",

    amenities: Array.isArray(v.cruiseAmenities) ? v.cruiseAmenities : [],

    policies: {
      cancellation: v.cancellationPolicy || "",
      refund: v.refundPolicy || "",
      child: v.childPolicy || "",
      infant: v.infantPolicy || "",
      passengerEligibility: v.passengerEligibility || "",
      baggage: v.baggagePolicy || "",
      passportVisa: v.passportVisaPolicy || "",
      checkIn: v.checkInPolicy || "",
      medical: v.medicalPolicy || "",
      specialRequirements: v.specialRequirements || "",
    },

    contact: {
      contactPerson: v.contactPerson || "",
      businessEmail: v.businessEmail || "",
      businessPhone: v.businessPhone || "",
    },

    media: {
      logo: up.first("logo"),
      coverImage: up.first("coverImage"),
      images: up.urls("propertyImages"),
      videos: up.urls("videos"),
    },

    documents: {
      maritimeLicenseNumber: v.maritimeLicenseNumber || "",
      portAuthorityPermit: v.portAuthorityPermit || "",
      safetyManagementCertificate: v.safetyManagementCertificate || "",
      insurancePolicyNumber: v.insurancePolicyNumber || "",
    },
  };
}

function getStepTitle(step, vertical) {
  return VERTICAL_CONFIG[vertical]?.steps[step]?.title || STEPS[step - 1].title;
}

function getStepDescription(step, vertical) {
  const custom = VERTICAL_CONFIG[vertical]?.steps[step]?.desc;
  if (custom) return custom;

  const isStay = vertical === "stay";

  const common = {
    1: "Registration adapts to country-specific tax, payout and compliance information.",
    2: "Tell us how your business is legally structured.",
    3: "Choose the BMT Connect supplier vertical you want to onboard.",
    4: "Select the subtype that best describes your supplier business.",
    5: "Enter the business and listing identity used by the backend.",
    6: "Add the operating or property location and time zone.",
    7: isStay
      ? "Set the property's market classification and star rating."
      : "This vertical does not require a Stay classification.",
    8: isStay
      ? "Configure initial property room/unit capacity."
      : "Inventory will be configured in the vertical dashboard.",
    9: isStay
      ? "Choose the property facilities and services you provide."
      : "Services will be configured in the vertical dashboard.",
    10: isStay
      ? "Set check-in/out and guest-facing property policies."
      : "Operating policies will be configured in the vertical dashboard.",
    11: "Upload property photos and videos.",
    12: "Provide the authorized representative and government ID information, with a copy of the ID.",
    13: "Provide licence and compliance identifiers, with a copy of each document.",
    14: "Upload your logo and marketplace cover image.",
    15: "Configure country-aware bank and settlement information.",
    16: "Provide country-specific VAT, GST, sales-tax or equivalent information.",
    17: "Review and accept the BMT Connect Partner Agreement.",
    18: "Review the application before submitting it for approval.",
  };

  return common[step];
}

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

  const raw = String(value).toLowerCase().trim().replace(/\s+/g, "-");

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
   FORM DEFAULTS
===================================================== */

const DEFAULT_FORM = {
  country: "",
  businessType: "",
  vertical: "",
  subtype: "",

  businessName: "",
  legalBusinessName: "",
  propertyName: "",
  displayName: "",
  businessRegistrationNumber: "",
  businessLicenseNumber: "",
  website: "",

  addressLine1: "",
  addressLine2: "",
  locality: "",
  landmark: "",
  city: "",
  district: "",
  state: "",
  postalCode: "",
  timezone: "",
  latitude: "",
  longitude: "",

  classification: "",
  starRating: "",
  totalUnits: "",
  totalRooms: "",
  totalFloors: "",
  totalBuildings: "",
  maximumGuests: "",
  unitType: "",

  amenities: [],
  customAmenities: "",
  checkInFrom: "14:00",
  checkOutUntil: "11:00",
  frontDesk24Hours: false,
  selfCheckIn: false,
  wifiAvailable: false,
  freeWifi: false,
  parkingAvailable: false,
  restaurantAvailable: false,
  breakfastAvailable: false,
  airportTransferAvailable: false,
  childrenAllowed: true,
  petsAllowed: false,
  smokingAllowed: false,

  cancellationPolicy: "",
  noShowPolicy: "",
  modificationPolicy: "",
  paymentPolicy: "",

  ownerName: "",
  ownerPhone: "",
  governmentIdType: "",
  governmentIdNumber: "",
  propertyRegistrationNumber: "",
  tourismLicenseNumber: "",
  fireSafetyCertificateNumber: "",
  foodLicenseNumber: "",

  bankCountry: "",
  bankCurrency: "",
  bankName: "",
  branchName: "",
  accountHolderName: "",
  accountNumber: "",
  confirmAccountNumber: "",
  ifscCode: "",
  iban: "",
  swiftCode: "",
  routingNumber: "",
  settlementCurrency: "",

  taxType: "",
  taxRegistrationNumber: "",
  gstNumber: "",
  panNumber: "",

  contractAccepted: false,

  /* Vertical-specific answers (Cruise / Tours / Activities / Events / Darshan) */
  vd: {},

  /* Uploaded files: { [key]: [ { file, name, type, size, preview } ] }
     Sirf memory me; draft me save nahi hoti. */
  files: {},
};

function buildInitialForm(d) {
  return {
    ...DEFAULT_FORM,
    ...d,

    vertical: d.vertical || localStorage.getItem(getVerticalKey()) || "",
    subtype: normalizeStoredSubtype(d.subtype || ""),

    addressLine1: d.addressLine1 || d.address || "",
    checkInFrom: d.checkInFrom || d.checkIn || "14:00",
    checkOutUntil: d.checkOutUntil || d.checkOut || "11:00",
    governmentIdType: d.governmentIdType || d.ownerIdType || "",
    accountHolderName: d.accountHolderName || d.accountHolder || "",
    taxRegistrationNumber: d.taxRegistrationNumber || d.taxNumber || "",

    childrenAllowed: d.childrenAllowed !== undefined ? Boolean(d.childrenAllowed) : true,

    amenities: Array.isArray(d.amenities) ? d.amenities : [],
    vd: d.vd && typeof d.vd === "object" ? d.vd : {},

    // Files kabhi draft se nahi aate.
    files: {},
  };
}

/* =====================================================
   UPLOAD ONE FILE
===================================================== */

async function uploadOne(item, token) {
  const body = new FormData();
  body.append("file", item.file);

  const response = await fetch(UPLOAD_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || `Upload failed for ${item.name}.`);
  }

  const url = data?.url || data?.fileUrl || data?.data?.url || "";

  if (!url) {
    throw new Error(`Upload server did not return a URL for ${item.name}.`);
  }

  return url;
}

/* =====================================================
   MAIN
===================================================== */

export default function Onboarding() {
  const navigate = useNavigate();
  const location = useLocation();

  const savedDraft = useMemo(() => loadDraft(), []);
  const uploadCache = useRef(new WeakMap()); // retry par dobara upload na ho

  const [currentStep, setCurrentStep] = useState(Number(savedDraft.currentStep || 1));
  const [profileLoading, setProfileLoading] = useState(true);
  const [currentVendor, setCurrentVendor] = useState(null);
  const [form, setForm] = useState(() => buildInitialForm(savedDraft));
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

  /* ===================================================
     ONBOARDING ENTRY
  =================================================== */

  useEffect(() => {
    const partnerToken = localStorage.getItem("token");

    if (!partnerToken) {
      navigate("/signin", { replace: true });
      return;
    }

    const partnerAccount = getPartnerAccount();
    const sessionEmail = String(
      sessionStorage.getItem("bmtVendorAuthEmail") || ""
    ).trim().toLowerCase();

    if (sessionEmail && partnerAccount.email && sessionEmail !== partnerAccount.email) {
      sessionStorage.removeItem("bmtVendorAuthEmail");
      sessionStorage.removeItem("bmtVendorAuthPassword");
    }

    localStorage.removeItem("vendorToken");
    localStorage.removeItem("vendorUser");

    setCurrentVendor(null);
    setProfileLoading(false);
  }, [navigate]);

  /* ===================================================
     SAVE DRAFT (files draft me nahi jaati)
  =================================================== */

  useEffect(() => {
    try {
      // eslint-disable-next-line no-unused-vars
      const { files, ...draftForm } = form;

      localStorage.setItem(
        getDraftKey(),
        JSON.stringify({ ...draftForm, currentStep })
      );
    } catch (err) {
      console.warn("Could not save onboarding draft:", err);
    }
  }, [form, currentStep]);

  /* ===================================================
     HELPERS
  =================================================== */

  const updateField = (name, value) => {
    setForm((previous) => ({ ...previous, [name]: value }));
    setError("");
  };

  const updateVd = (name, value) => {
    setForm((previous) => ({
      ...previous,
      vd: { ...(previous.vd || {}), [name]: value },
    }));
    setError("");
  };

  // Uploaded files: key -> array
  const updateFiles = (name, list) => {
    setForm((previous) => {
      const files = { ...(previous.files || {}) };

      if (list && list.length) files[name] = list;
      else delete files[name];

      return { ...previous, files };
    });
    setError("");
  };

  const selectedCountry = COUNTRIES.find((item) => item.id === form.country);

  const selectedSubtype = (SUBTYPES[form.vertical] || []).find(
    (item) => item.id === form.subtype
  );

  const progress = Math.round((currentStep / STEPS.length) * 100);

  /* ===================================================
     SIGN OUT
  =================================================== */

  const exitOnboarding = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("vendorToken");
    sessionStorage.removeItem("bmtVendorAuthEmail");
    sessionStorage.removeItem("bmtVendorAuthPassword");
    localStorage.removeItem("user");

    navigate("/signin", { replace: true });
  };

  const handleBack = () => {
    if (currentStep === 1) {
      exitOnboarding();
      return;
    }

    setCurrentStep((previous) => Math.max(1, previous - 1));
  };

  /* ===================================================
     VALIDATION
  =================================================== */

  const validateStepBase = (step = currentStep) => {
    switch (step) {
      case 1:
        return form.country ? "" : "Please select your country.";

      case 2:
        return form.businessType ? "" : "Please select your business type.";

      case 3:
        return form.vertical ? "" : "Please select a vertical.";

      case 4:
        return form.subtype ? "" : "Please select a subtype.";

      case 5:
        if (form.vertical !== "cruise" && !form.businessName.trim()) {
          return "Business name is required.";
        }
        if (form.vertical === "stay" && !form.propertyName.trim()) {
          return "Property name is required.";
        }
        return "";

      case 6:
        if (!form.addressLine1.trim() || !form.city.trim()) {
          return "Address and city are required.";
        }
        return "";

      case 7:
        if (form.vertical === "stay" && !form.classification) {
          return "Please select a classification.";
        }
        return "";

      case 8:
        if (form.vertical === "stay" && !form.totalUnits) {
          return "Please enter total rooms / units.";
        }
        return "";

      case 12:
        if (!form.ownerName.trim()) {
          return "Owner / authorized person name is required.";
        }
        if (!form.governmentIdType) {
          return "Please select a government ID type.";
        }
        return "";

      case 15:
        if (!form.accountHolderName.trim()) {
          return "Account holder name is required.";
        }
        if (
          form.accountNumber &&
          form.confirmAccountNumber &&
          form.accountNumber !== form.confirmAccountNumber
        ) {
          return "Account numbers do not match.";
        }
        return "";

      case 17:
        return form.contractAccepted ? "" : "Please accept the partner agreement.";

      default:
        return "";
    }
  };

  const validateStep = (step = currentStep) =>
    validateStepBase(step) || validateConfigStep(step, form);

  /* ===================================================
     CONTINUE
  =================================================== */

  const handleContinue = () => {
    const validationError = validateStep();

    if (validationError) {
      setError(validationError);
      return;
    }

    if (currentStep === 1 && selectedCountry) {
      setForm((previous) => ({
        ...previous,
        timezone: previous.timezone || selectedCountry.timezone,
        settlementCurrency: previous.settlementCurrency || selectedCountry.currency,
        bankCountry: previous.bankCountry || selectedCountry.name,
        bankCurrency: previous.bankCurrency || selectedCountry.currency,
      }));
    }

    if (currentStep === 3 && form.vertical) {
      localStorage.setItem(getVerticalKey(), form.vertical);
    }

    if (currentStep < STEPS.length) {
      setCurrentStep((previous) => previous + 1);
      return;
    }

    // Final step: sab steps dobara check (refresh ke baad files gum ho sakti hain)
    for (let step = 1; step < STEPS.length; step += 1) {
      const stepError = validateStep(step);

      if (stepError) {
        setCurrentStep(step);
        setError(stepError);
        return;
      }
    }

    submitApplication();
  };

  /* ===================================================
     BUILD BACKEND PAYLOAD
     `uploaded` = { [key]: [ { name, type, size, url } ] }
  =================================================== */

  const buildPayload = (uploaded) => {
    const up = {
      urls: (key) => (uploaded[key] || []).map((item) => item.url),
      first: (key) => (uploaded[key] || [])[0]?.url || "",
    };

    const countryName = selectedCountry?.name || "";
    const countryCode = selectedCountry?.code || "";
    const isCruise = form.vertical === "cruise";

    const businessName =
      form.businessName || (isCruise ? form.vd?.cruiseOperatorName || "" : "");

    const common = {
      businessType: BUSINESS_TYPE_VALUES[form.businessType] || form.businessType,
      businessName,
      companyName: businessName,
      legalBusinessName: form.legalBusinessName,
      businessRegistrationNumber: form.businessRegistrationNumber,
      businessLicenseNumber: form.businessLicenseNumber,
      website: form.website,

      vertical: form.vertical,
      selectedVertical: form.vertical,

      staySubtype: form.vertical === "stay" ? form.subtype : "",
      service: form.vertical === "stay" ? form.subtype : form.vertical,
      services:
        form.vertical === "stay"
          ? [form.subtype].filter(Boolean)
          : [form.vertical].filter(Boolean),

      country: countryName,
      countryCode,

      address: form.addressLine1,
      addressLine1: form.addressLine1,
      addressLine2: form.addressLine2,
      locality: form.locality,
      landmark: form.landmark,
      city: form.city,
      district: form.district,
      state: form.state,
      pincode: form.postalCode,
      postalCode: form.postalCode,
      timezone: form.timezone,

      governmentIdType: form.governmentIdType,
      governmentIdNumber: form.governmentIdNumber,

      bankCountry: form.bankCountry || countryName,
      bankCurrency: form.bankCurrency || selectedCountry?.currency || "",
      settlementCurrency: form.settlementCurrency || selectedCountry?.currency || "",
      accountHolderName: form.accountHolderName,
      bankName: form.bankName,
      branchName: form.branchName,
      accountNumber: form.accountNumber,
      confirmAccountNumber: form.confirmAccountNumber,
      ifscCode: form.ifscCode,
      iban: form.iban,
      swiftCode: form.swiftCode,
      routingNumber: form.routingNumber,

      taxType: form.taxType,
      taxRegistrationNumber: form.taxRegistrationNumber,
      gstNumber: form.gstNumber,
      panNumber: form.panNumber,

      onboardingStatus: "submitted",
      onboardingComplete: true,
      onboardingStep: STEPS.length,
      onboardingProgress: 100,
    };

    /* ---------------- STAY ---------------- */
    if (form.vertical === "stay") {
      common.stayDetails = {
        propertyName: form.propertyName,
        legalPropertyName: form.legalBusinessName,
        displayName: form.displayName || form.propertyName,
        propertyType: form.subtype,
        totalProperties: 1,
        propertyTypes: form.subtype ? [form.subtype] : [],

        addressLine1: form.addressLine1,
        addressLine2: form.addressLine2,
        locality: form.locality,
        landmark: form.landmark,
        city: form.city,
        district: form.district,
        state: form.state,
        postalCode: form.postalCode,
        country: countryName,
        countryCode,
        timezone: form.timezone,
        latitude: form.latitude || null,
        longitude: form.longitude || null,

        classification: form.classification,
        starRating: Number(form.starRating || 0),
        totalUnits: Number(form.totalUnits || 0),
        totalRooms: Number(form.totalRooms || form.totalUnits || 0),
        totalFloors: Number(form.totalFloors || 0),
        totalBuildings: Number(form.totalBuildings || 1),
        maximumGuests: Number(form.maximumGuests || 0),

        amenities: form.amenities,
        customAmenities: form.customAmenities
          ? form.customAmenities.split(",").map((item) => item.trim()).filter(Boolean)
          : [],

        checkInFrom: form.checkInFrom,
        checkOutUntil: form.checkOutUntil,
        frontDesk24Hours: form.frontDesk24Hours,
        selfCheckIn: form.selfCheckIn,
        wifiAvailable: form.wifiAvailable,
        freeWifi: form.freeWifi,
        parkingAvailable: form.parkingAvailable,
        restaurantAvailable: form.restaurantAvailable,
        breakfastAvailable: form.breakfastAvailable,
        airportTransferAvailable: form.airportTransferAvailable,
        childrenAllowed: form.childrenAllowed,
        petsAllowed: form.petsAllowed,
        smokingAllowed: form.smokingAllowed,

        cancellationPolicy: form.cancellationPolicy,
        noShowPolicy: form.noShowPolicy,
        modificationPolicy: form.modificationPolicy,
        paymentPolicy: form.paymentPolicy,

        propertyRegistrationNumber: form.propertyRegistrationNumber,
        businessLicenseNumber: form.businessLicenseNumber,
        tourismLicenseNumber: form.tourismLicenseNumber,
        fireSafetyCertificateNumber: form.fireSafetyCertificateNumber,
        foodLicenseNumber: form.foodLicenseNumber,

        logo: up.first("logo"),
        coverImage: up.first("coverImage"),
        propertyImages: up.urls("propertyImages"),
        videos: up.urls("videos"),

        propertyCurrency: selectedCountry?.currency || "",
        settlementCurrency: form.settlementCurrency || selectedCountry?.currency || "",

        isPublished: false,
      };
    }

    if (isCruise) {
      common.cruiseDetails = buildCruiseDetails(form, up);
    }

    if (["packages", "activities", "events", "darshan", "bus", "cab"].includes(form.vertical)) {
      common[VERTICAL_CONFIG[form.vertical].key] = buildGroupedDetails(form, up);
    }

    /* Document files -> { [docKey]: { name, type, size, url } } */
    const documentFiles = {};

    Object.entries(uploaded).forEach(([key, list]) => {
      if (!MEDIA_KEYS.includes(key) && list[0]) documentFiles[key] = list[0];
    });

    if (Object.keys(documentFiles).length > 0) {
      common.documentFiles = documentFiles;
    }

    common.applicationMeta = {
      supplierSubtype: form.subtype,
      ownerName: form.ownerName,
      ownerPhone: form.ownerPhone,
      contractAccepted: form.contractAccepted,
      contractAcceptedAt: form.contractAccepted ? new Date().toISOString() : null,
    };

    return common;
  };

  /* ===================================================
     UPLOAD ALL FILES (submit se pehle)
  =================================================== */

  const uploadAllFiles = async (token) => {
    const entries = Object.entries(form.files || {}).filter(([, list]) => list?.length);
    const total = entries.reduce((sum, [, list]) => sum + list.length, 0);

    const uploaded = {};
    let done = 0;

    for (const [key, list] of entries) {
      uploaded[key] = [];

      for (const item of list) {
        setUploadStatus(`Uploading files ${done + 1} of ${total}...`);

        let url = uploadCache.current.get(item.file);

        if (!url) {
          url = await uploadOne(item, token);
          uploadCache.current.set(item.file, url);
        }

        uploaded[key].push({ name: item.name, type: item.type, size: item.size, url });
        done += 1;
      }
    }

    setUploadStatus("");
    return uploaded;
  };

  /* ===================================================
     SUBMIT APPLICATION
     Partner Auth -> Onboarding -> Upload files -> Vendor Signup
     -> PENDING -> Admin Approval -> Vendor Sign-In
  =================================================== */

  const submitApplication = async () => {
    const partnerToken = localStorage.getItem("token");

    if (!partnerToken) {
      navigate("/signin", { replace: true });
      return;
    }

    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      let partner = {};

      try {
        partner = JSON.parse(localStorage.getItem("user") || "{}");
      } catch {
        partner = {};
      }

      const email = String(
        location.state?.vendorAuth?.email ||
          sessionStorage.getItem("bmtVendorAuthEmail") ||
          partner?.email ||
          partner?.businessEmail ||
          ""
      ).trim().toLowerCase();

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

      const selectedVertical = form.vertical;
      const staySubtype = selectedVertical === "stay" ? form.subtype : "";

      if (!email) {
        throw new Error("Business email is missing. Please sign in again.");
      }

      if (!password) {
        throw new Error(
          "Signin password is no longer available in this tab. Please sign in again."
        );
      }

      if (!phone) {
        throw new Error("Phone number is required before submitting the application.");
      }

      if (!selectedVertical) {
        throw new Error("Please select your business vertical.");
      }

      if (selectedVertical === "stay" && !staySubtype) {
        throw new Error("Please select your property type.");
      }

      // 1) files upload -> URLs
      const uploaded = await uploadAllFiles(partnerToken);

      // 2) payload
      const payload = buildPayload(uploaded);

      const signupPayload = {
        ...payload,

        name:
          form.ownerName ||
          partner?.name ||
          payload.businessName ||
          email.split("@")[0],

        email,
        businessEmail: email,
        phone,
        businessPhone: phone,
        password,

        businessType: BUSINESS_TYPE_VALUES[form.businessType] || form.businessType,

        selectedVertical,
        vertical: selectedVertical,

        service: selectedVertical === "stay" ? staySubtype : selectedVertical,
        services:
          selectedVertical === "stay"
            ? [staySubtype].filter(Boolean)
            : [selectedVertical].filter(Boolean),

        staySubtype: selectedVertical === "stay" ? staySubtype : "",
        subtype: selectedVertical === "stay" ? staySubtype : form.subtype || "",

        ...(selectedVertical === "cruise" ? { cruise: true, cruiseVendor: true } : {}),
      };

      const signupResponse = await fetch(SIGNUP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupPayload),
      });

      const signupData = await signupResponse.json().catch(() => ({}));

      if (signupResponse.status === 201 && signupData?.success) {
        localStorage.removeItem("vendorToken");
        localStorage.removeItem("vendorUser");
        localStorage.removeItem("onboardingComplete");

        localStorage.setItem(getVerticalKey(), selectedVertical);
        localStorage.removeItem(getDraftKey());
        sessionStorage.removeItem("bmtVendorAuthPassword");

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
        const details = Array.isArray(signupData?.details)
          ? signupData.details.map((item) => item?.message).filter(Boolean).join(", ")
          : "";

        throw new Error(
          details || signupData?.message || "Please check your registration details."
        );
      }

      throw new Error(signupData?.message || "Unable to submit vendor application.");
    } catch (err) {
      console.error("Vendor onboarding submit error:", err);
      setUploadStatus("");
      setError(err?.message || "Unable to submit application.");
    } finally {
      setSaving(false);
    }
  };

  const toggleAmenity = (amenity) => {
    setForm((previous) => {
      const exists = previous.amenities.includes(amenity);

      return {
        ...previous,
        amenities: exists
          ? previous.amenities.filter((item) => item !== amenity)
          : [...previous.amenities, amenity],
      };
    });
  };

  if (profileLoading) {
    return (
      <div className="bmt-onboarding">
        <main className="bmt-onboarding-main" style={{ marginLeft: 0, width: "100%" }}>
          <section className="bmt-onboarding-content">
            <div className="bmt-content-inner">
              <div className="bmt-empty-state">Loading your BMT Connect account...</div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  /* ===================================================
     STEP RENDER
  =================================================== */

  const hasVerticalConfig = Boolean(VERTICAL_CONFIG[form.vertical]?.steps[currentStep]);

  const renderVertical = (step, basic = null) => (
    <VerticalStepRenderer
      form={form}
      step={step}
      updateField={updateField}
      updateVd={updateVd}
      updateFiles={updateFiles}
      basic={basic}
    />
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CountryStep
            value={form.country}
            onChange={(value) => {
              const country = COUNTRIES.find((item) => item.id === value);

              setForm((previous) => ({
                ...previous,
                country: value,
                timezone: previous.timezone || country?.timezone || "",
                bankCountry: previous.bankCountry || country?.name || "",
                bankCurrency: previous.bankCurrency || country?.currency || "",
                settlementCurrency: previous.settlementCurrency || country?.currency || "",
              }));
              setError("");
            }}
          />
        );

      case 2:
        return (
          <BusinessTypeStep
            value={form.businessType}
            onChange={(value) => updateField("businessType", value)}
          />
        );

      case 3:
        return (
          <VerticalStep
            value={form.vertical}
            onChange={(value) => {
              // Vertical badalne par purane answers aur files clear
              setForm((previous) => ({
                ...previous,
                vertical: value,
                subtype: "",
                classification: "",
                vd: {},
                files: {},
              }));
              setError("");
            }}
          />
        );

      case 4:
        return (
          <SubtypeStep
            vertical={form.vertical}
            value={form.subtype}
            onChange={(value) => updateField("subtype", value)}
          />
        );

      case 6:
        return (
          <LocationStep form={form} updateField={updateField} selectedCountry={selectedCountry} />
        );

      case 12:
        return <KycStep form={form} updateField={updateField} updateFiles={updateFiles} />;

      case 14:
        return <MediaFieldsStep form={form} updateFiles={updateFiles} />;

      case 15:
        return (
          <BankStep
            form={form}
            updateField={updateField}
            updateFiles={updateFiles}
            selectedCountry={selectedCountry}
          />
        );

      case 16:
        return (
          <TaxStep
            form={form}
            updateField={updateField}
            updateFiles={updateFiles}
            selectedCountry={selectedCountry}
          />
        );

      case 17:
        return (
          <ContractStep
            checked={form.contractAccepted}
            onChange={(value) => updateField("contractAccepted", value)}
          />
        );

      case 18:
        return (
          <ReviewStep form={form} selectedCountry={selectedCountry} selectedSubtype={selectedSubtype} />
        );

      case 5:
        return hasVerticalConfig ? (
          renderVertical(
            5,
            VERTICAL_CONFIG[form.vertical].steps[5].withBasic ? (
              <BasicDetailsStep form={form} updateField={updateField} updateFiles={updateFiles} />
            ) : null
          )
        ) : (
          <BasicDetailsStep form={form} updateField={updateField} updateFiles={updateFiles} />
        );

      case 7:
        return hasVerticalConfig ? renderVertical(7) : (
          <ClassificationStep form={form} updateField={updateField} />
        );

      case 8:
        return hasVerticalConfig ? renderVertical(8) : (
          <UnitsStep form={form} updateField={updateField} />
        );

      case 9:
        return hasVerticalConfig ? renderVertical(9) : (
          <AmenitiesStep
            form={form}
            updateField={updateField}
            selected={form.amenities}
            toggle={toggleAmenity}
          />
        );

      case 10:
        return hasVerticalConfig ? renderVertical(10) : (
          <PoliciesStep form={form} updateField={updateField} />
        );

      case 11:
        return hasVerticalConfig ? (
          renderVertical(11)
        ) : (
          <div className="bmt-form-grid">
            {STAY_MEDIA_FIELDS.map((field) => (
              <DynamicField
                key={field.name}
                field={field}
                value={getFieldValue(form, field)}
                onChange={(value) => updateFiles(field.name, value)}
              />
            ))}
          </div>
        );

      case 13:
        return hasVerticalConfig ? renderVertical(13) : (
          <DocumentsStep form={form} updateField={updateField} updateFiles={updateFiles} />
        );

      default:
        return null;
    }
  };

  /* ===================================================
     PAGE
  =================================================== */

  return (
    <div className="bmt-onboarding">
      <style>{docStyles}</style>

      <aside className="bmt-onboarding-sidebar">
        <div className="bmt-sidebar-title">APPLICATION STEPS</div>

        <div className="bmt-step-list">
          {STEPS.map((step) => {
            const active = step.id === currentStep;
            const complete = step.id < currentStep;

            return (
              <button
                type="button"
                key={step.id}
                className={["bmt-sidebar-step", active ? "active" : "", complete ? "complete" : ""]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => {
                  if (step.id <= currentStep) setCurrentStep(step.id);
                }}
              >
                <span className="bmt-step-number">{complete ? "✓" : step.id}</span>
                <span>{getStepTitle(step.id, form.vertical)}</span>
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
              {currentVendor?.onboardingStatus === "rejected"
                ? "Action required"
                : "Application in progress"}
            </div>

            {form.vertical && (
              <div className="bmt-current-vertical">
                {VERTICALS.find((item) => item.id === form.vertical)?.name || form.vertical}
                {selectedSubtype?.name ? ` · ${selectedSubtype.name}` : ""}
              </div>
            )}
          </div>

          <div className="bmt-header-right">
            <div className="bmt-progress-box">
              <div className="bmt-progress-track">
                <div className="bmt-progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <strong>{progress}%</strong>
            </div>

            <button type="button" className="bmt-signout-btn" onClick={exitOnboarding}>
              Sign out
            </button>
          </div>
        </header>

        <section className="bmt-onboarding-content">
          <div className="bmt-content-inner">
            <div className="bmt-step-eyebrow">
              STEP {currentStep} OF {STEPS.length}
            </div>

            <h1>{getStepTitle(currentStep, form.vertical)}</h1>

            <p className="bmt-step-description">
              {getStepDescription(currentStep, form.vertical)}
            </p>

            {successMessage && (
              <div
                className="bmt-onboarding-error"
                style={{ borderColor: "#86efac", background: "#f0fdf4", color: "#166534" }}
              >
                {successMessage}
              </div>
            )}

            {uploadStatus && (
              <div
                className="bmt-onboarding-error"
                style={{ borderColor: "#bfdbfe", background: "#eff6ff", color: "#1d4ed8" }}
              >
                {uploadStatus}
              </div>
            )}

            {error && <div className="bmt-onboarding-error">{error}</div>}

            <div className="bmt-step-content">{renderStep()}</div>
          </div>
        </section>

        <footer className="bmt-onboarding-footer">
          <button type="button" className="bmt-back-btn" onClick={handleBack} disabled={saving}>
            ← {currentStep === 1 ? "Back to sign in" : "Back"}
          </button>

          <button
            type="button"
            className="bmt-continue-btn"
            onClick={handleContinue}
            disabled={saving}
          >
            {saving
              ? uploadStatus || "Submitting..."
              : currentStep === STEPS.length
              ? "Submit application"
              : "Continue"}
          </button>
        </footer>
      </main>
    </div>
  );
}

/* =====================================================
   COMMON STEPS
===================================================== */

function CountryStep({ value, onChange }) {
  return (
    <div className="bmt-card-grid bmt-country-grid">
      {COUNTRIES.map((country) => (
        <button
          type="button"
          key={country.id}
          className={value === country.id ? "bmt-select-card selected" : "bmt-select-card"}
          onClick={() => onChange(country.id)}
        >
          <strong>{country.name}</strong>
          <span>
            {country.currency}
            {" · "}
            {country.phone}
          </span>
        </button>
      ))}
    </div>
  );
}

function BusinessTypeStep({ value, onChange }) {
  return (
    <div className="bmt-card-grid">
      {BUSINESS_TYPES.map((type) => (
        <button
          type="button"
          key={type}
          className={value === type ? "bmt-select-card selected" : "bmt-select-card"}
          onClick={() => onChange(type)}
        >
          <strong>{type}</strong>
        </button>
      ))}
    </div>
  );
}

function VerticalStep({ value, onChange }) {
  return (
    <div className="bmt-vertical-grid">
      {VERTICALS.map((vertical) => (
        <button
          type="button"
          key={vertical.id}
          className={value === vertical.id ? "bmt-vertical-card selected" : "bmt-vertical-card"}
          onClick={() => onChange(vertical.id)}
        >
          <div className="bmt-vertical-icon">{vertical.icon}</div>
          <strong>{vertical.name}</strong>
          <span>{vertical.description}</span>
        </button>
      ))}
    </div>
  );
}

function SubtypeStep({ vertical, value, onChange }) {
  const options = SUBTYPES[vertical] || [];

  if (!vertical) {
    return <div className="bmt-empty-state">Please choose a vertical first.</div>;
  }

  return (
    <div className="bmt-card-grid">
      {options.map((item) => (
        <button
          key={item.id}
          type="button"
          className={value === item.id ? "bmt-select-card selected" : "bmt-select-card"}
          onClick={() => onChange(item.id)}
        >
          <strong>{item.name}</strong>
          <span>Backend value: {item.id}</span>
        </button>
      ))}
    </div>
  );
}

function BasicDetailsStep({ form, updateField, updateFiles }) {
  const isStay = form.vertical === "stay";
  const files = form.files || {};

  return (
    <div className="bmt-form-grid">
      <Field
        label="Business name"
        value={form.businessName}
        onChange={(value) => updateField("businessName", value)}
        placeholder="Registered business name"
      />

      <Field
        label="Legal business name"
        value={form.legalBusinessName}
        onChange={(value) => updateField("legalBusinessName", value)}
        placeholder="Name on registration documents"
      />

      {isStay && (
        <>
          <Field
            label="Property name"
            value={form.propertyName}
            onChange={(value) => updateField("propertyName", value)}
            placeholder="Public property name"
          />

          <Field
            label="Display name"
            value={form.displayName}
            onChange={(value) => updateField("displayName", value)}
            placeholder="Marketplace display name"
          />
        </>
      )}

      <Field
        label="Business registration number"
        value={form.businessRegistrationNumber}
        onChange={(value) => updateField("businessRegistrationNumber", value)}
        placeholder="Registration / incorporation number"
      />

      <Field
        label="Business licence number"
        value={form.businessLicenseNumber}
        onChange={(value) => updateField("businessLicenseNumber", value)}
        placeholder="Licence number, if applicable"
      />

      <FileUpload
        label="Business registration certificate"
        files={files.businessRegistrationDoc}
        onChange={(list) => updateFiles("businessRegistrationDoc", list)}
      />

      <FileUpload
        label="Business licence"
        files={files.businessLicenseDoc}
        onChange={(list) => updateFiles("businessLicenseDoc", list)}
      />

      <div className="bmt-form-span-2">
        <Field
          label="Website"
          value={form.website}
          onChange={(value) => updateField("website", value)}
          placeholder="https://"
        />
      </div>
    </div>
  );
}

function LocationStep({ form, updateField, selectedCountry }) {
  return (
    <div className="bmt-form-grid">
      <div className="bmt-form-span-2">
        <Field
          label="Address line 1"
          value={form.addressLine1}
          onChange={(value) => updateField("addressLine1", value)}
          placeholder="Building / street / area"
        />
      </div>

      <div className="bmt-form-span-2">
        <Field
          label="Address line 2"
          value={form.addressLine2}
          onChange={(value) => updateField("addressLine2", value)}
          placeholder="Optional"
        />
      </div>

      <Field label="Locality" value={form.locality} onChange={(value) => updateField("locality", value)} placeholder="Locality / area" />
      <Field label="Landmark" value={form.landmark} onChange={(value) => updateField("landmark", value)} placeholder="Nearby landmark" />
      <Field label="City" value={form.city} onChange={(value) => updateField("city", value)} placeholder="City" />
      <Field label="District" value={form.district} onChange={(value) => updateField("district", value)} placeholder="District" />
      <Field label="State / Province / Region" value={form.state} onChange={(value) => updateField("state", value)} placeholder="State / Province" />
      <Field label="Postal code" value={form.postalCode} onChange={(value) => updateField("postalCode", value)} placeholder="Postal code" />
      <Field label="Country" value={selectedCountry?.name || ""} disabled />
      <Field label="Time zone" value={form.timezone} onChange={(value) => updateField("timezone", value)} placeholder="e.g. Asia/Kolkata" />

      {form.vertical === "stay" && (
        <>
          <Field label="Latitude" type="number" value={form.latitude} onChange={(value) => updateField("latitude", value)} placeholder="Optional" />
          <Field label="Longitude" type="number" value={form.longitude} onChange={(value) => updateField("longitude", value)} placeholder="Optional" />
        </>
      )}
    </div>
  );
}

/* =====================================================
   STAY-ONLY STEPS
===================================================== */

function ClassificationStep({ form, updateField }) {
  if (form.vertical !== "stay") {
    return (
      <NotApplicable text="Classification is not required for this vertical. Continue to the next step." />
    );
  }

  const options = [
    { id: "unrated", name: "Unrated", star: 0 },
    { id: "budget", name: "Budget", star: 0 },
    { id: "1-star", name: "1 Star", star: 1 },
    { id: "2-star", name: "2 Star", star: 2 },
    { id: "3-star", name: "3 Star", star: 3 },
    { id: "4-star", name: "4 Star", star: 4 },
    { id: "5-star", name: "5 Star", star: 5 },
    { id: "luxury", name: "Luxury", star: 0 },
  ];

  return (
    <div className="bmt-card-grid">
      {options.map((option) => (
        <button
          type="button"
          key={option.id}
          className={
            form.classification === option.id ? "bmt-select-card selected" : "bmt-select-card"
          }
          onClick={() => {
            updateField("classification", option.id);
            updateField("starRating", option.star ? String(option.star) : "");
          }}
        >
          <strong>{option.name}</strong>
        </button>
      ))}
    </div>
  );
}

function UnitsStep({ form, updateField }) {
  if (form.vertical !== "stay") {
    return (
      <NotApplicable text="Inventory details will be configured inside the selected vertical dashboard." />
    );
  }

  return (
    <div className="bmt-form-grid">
      <Field
        label="Total rooms / units"
        type="number"
        value={form.totalUnits}
        onChange={(value) => {
          updateField("totalUnits", value);
          if (!form.totalRooms) updateField("totalRooms", value);
        }}
        placeholder="e.g. 25"
      />

      <Field label="Total rooms" type="number" value={form.totalRooms} onChange={(value) => updateField("totalRooms", value)} placeholder="e.g. 25" />
      <Field label="Total floors" type="number" value={form.totalFloors} onChange={(value) => updateField("totalFloors", value)} placeholder="e.g. 4" />
      <Field label="Total buildings" type="number" value={form.totalBuildings} onChange={(value) => updateField("totalBuildings", value)} placeholder="e.g. 1" />
      <Field label="Maximum guests" type="number" value={form.maximumGuests} onChange={(value) => updateField("maximumGuests", value)} placeholder="Total property capacity" />
      <Field label="Primary room / unit type" value={form.unitType} onChange={(value) => updateField("unitType", value)} placeholder="e.g. Deluxe Room" />
    </div>
  );
}

function AmenitiesStep({ form, updateField, selected, toggle }) {
  if (form.vertical !== "stay") {
    return (
      <NotApplicable text="Vertical-specific services and amenities will be configured in the supplier dashboard." />
    );
  }

  const amenities = [
    "Wi-Fi", "Parking", "Restaurant", "Room Service", "Swimming Pool", "Air Conditioning",
    "Airport Transfer", "Gym", "Spa", "24-hour Front Desk", "Breakfast", "Wheelchair Access",
  ];

  return (
    <>
      <div className="bmt-checkbox-grid">
        {amenities.map((item) => (
          <label
            key={item}
            className={selected.includes(item) ? "bmt-checkbox-card checked" : "bmt-checkbox-card"}
          >
            <input type="checkbox" checked={selected.includes(item)} onChange={() => toggle(item)} />
            <span>{item}</span>
          </label>
        ))}
      </div>

      <div className="bmt-form-grid" style={{ marginTop: 18 }}>
        <ToggleField label="Wi-Fi available" checked={form.wifiAvailable} onChange={(value) => updateField("wifiAvailable", value)} />
        <ToggleField label="Free Wi-Fi" checked={form.freeWifi} onChange={(value) => updateField("freeWifi", value)} />
        <ToggleField label="Parking available" checked={form.parkingAvailable} onChange={(value) => updateField("parkingAvailable", value)} />
        <ToggleField label="Restaurant available" checked={form.restaurantAvailable} onChange={(value) => updateField("restaurantAvailable", value)} />
        <ToggleField label="Breakfast available" checked={form.breakfastAvailable} onChange={(value) => updateField("breakfastAvailable", value)} />
        <ToggleField label="Airport transfer" checked={form.airportTransferAvailable} onChange={(value) => updateField("airportTransferAvailable", value)} />

        <div className="bmt-form-span-2">
          <Field
            label="Other amenities"
            value={form.customAmenities}
            onChange={(value) => updateField("customAmenities", value)}
            placeholder="Comma separated, e.g. Rooftop, Garden, EV charging"
          />
        </div>
      </div>
    </>
  );
}

function PoliciesStep({ form, updateField }) {
  if (form.vertical !== "stay") {
    return (
      <NotApplicable text="Vertical-specific operating policies will be configured in the supplier dashboard." />
    );
  }

  return (
    <div className="bmt-form-grid">
      <Field label="Check-in from" type="time" value={form.checkInFrom} onChange={(value) => updateField("checkInFrom", value)} />
      <Field label="Check-out until" type="time" value={form.checkOutUntil} onChange={(value) => updateField("checkOutUntil", value)} />

      <ToggleField label="24-hour front desk" checked={form.frontDesk24Hours} onChange={(value) => updateField("frontDesk24Hours", value)} />
      <ToggleField label="Self check-in" checked={form.selfCheckIn} onChange={(value) => updateField("selfCheckIn", value)} />
      <ToggleField label="Children allowed" checked={form.childrenAllowed} onChange={(value) => updateField("childrenAllowed", value)} />
      <ToggleField label="Pets allowed" checked={form.petsAllowed} onChange={(value) => updateField("petsAllowed", value)} />
      <ToggleField label="Smoking allowed" checked={form.smokingAllowed} onChange={(value) => updateField("smokingAllowed", value)} />

      <TextAreaField label="Cancellation policy" value={form.cancellationPolicy} onChange={(value) => updateField("cancellationPolicy", value)} placeholder="Describe cancellation rules" />
      <TextAreaField label="No-show policy" value={form.noShowPolicy} onChange={(value) => updateField("noShowPolicy", value)} placeholder="Describe no-show rules" />
      <TextAreaField label="Modification policy" value={form.modificationPolicy} onChange={(value) => updateField("modificationPolicy", value)} placeholder="Describe modification rules" />
      <TextAreaField label="Payment policy" value={form.paymentPolicy} onChange={(value) => updateField("paymentPolicy", value)} placeholder="Describe payment / deposit rules" />
    </div>
  );
}

function DocumentsStep({ form, updateField, updateFiles }) {
  const files = form.files || {};

  return (
    <div className="bmt-form-grid">
      <Field label="Property registration number" value={form.propertyRegistrationNumber} onChange={(value) => updateField("propertyRegistrationNumber", value)} placeholder="If applicable" />
      <FileUpload label="Property registration document" files={files.propertyRegistrationDoc} onChange={(list) => updateFiles("propertyRegistrationDoc", list)} />

      <Field label="Tourism licence number" value={form.tourismLicenseNumber} onChange={(value) => updateField("tourismLicenseNumber", value)} placeholder="If applicable" />
      <FileUpload label="Tourism licence" files={files.tourismLicenseDoc} onChange={(list) => updateFiles("tourismLicenseDoc", list)} />

      <Field label="Fire safety certificate number" value={form.fireSafetyCertificateNumber} onChange={(value) => updateField("fireSafetyCertificateNumber", value)} placeholder="If applicable" />
      <FileUpload label="Fire safety certificate" files={files.fireSafetyDoc} onChange={(list) => updateFiles("fireSafetyDoc", list)} />

      <Field label="Food licence number" value={form.foodLicenseNumber} onChange={(value) => updateField("foodLicenseNumber", value)} placeholder="If applicable" />
      <FileUpload label="Food licence" files={files.foodLicenseDoc} onChange={(list) => updateFiles("foodLicenseDoc", list)} />
    </div>
  );
}

/* =====================================================
   VERTICAL STEP RENDERER (Cruise / Tours / Activities /
   Events / Darshan)
===================================================== */

function VerticalStepRenderer({ form, step, updateField, updateVd, updateFiles, basic = null }) {
  const stepCfg = VERTICAL_CONFIG[form.vertical]?.steps[step];
  if (!stepCfg) return null;

  return (
    <>
      {basic}

      <div className="bmt-form-grid" style={basic ? { marginTop: 24 } : undefined}>
        {stepCfg.fields.map((field) => (
          <DynamicField
            key={field.name}
            field={field}
            value={getFieldValue(form, field)}
            onChange={(value) => {
              if (field.type === "file") updateFiles(field.name, value);
              else if (field.root) updateField(field.name, value);
              else updateVd(field.name, value);
            }}
          />
        ))}
      </div>
    </>
  );
}

function DynamicField({ field, value, onChange }) {
  const label = field.required ? `${field.label} *` : field.label;

  if (field.type === "file") {
    return (
      <FileUpload
        label={label}
        files={value}
        onChange={onChange}
        kind={field.kind}
        multiple={Boolean(field.multiple)}
      />
    );
  }

  if (field.type === "toggle") {
    return <ToggleField label={field.label} checked={value} onChange={onChange} />;
  }

  if (field.type === "chips") {
    const selected = Array.isArray(value) ? value : [];

    const toggle = (option) =>
      onChange(
        selected.includes(option)
          ? selected.filter((item) => item !== option)
          : [...selected, option]
      );

    return (
      <div className="bmt-form-span-2">
        <div className="bmt-field">
          <span>{label}</span>
        </div>

        <div className="bmt-checkbox-grid" style={{ marginTop: 8 }}>
          {field.options.map((option) => (
            <label
              key={option}
              className={
                selected.includes(option) ? "bmt-checkbox-card checked" : "bmt-checkbox-card"
              }
            >
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => toggle(option)}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <TextAreaField
        label={label}
        value={value}
        onChange={onChange}
        placeholder={field.placeholder}
        rows={3}
      />
    );
  }

  if (field.type === "select") {
    return (
      <label className="bmt-field">
        <span>{label}</span>
        <select value={value ?? ""} onChange={(event) => onChange(event.target.value)}>
          <option value="">Select</option>
          {field.options.map((option) => (
            <option key={option} value={option}>
              {option.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase())}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <Field
      label={label}
      type={field.type}
      value={value}
      onChange={onChange}
      placeholder={field.placeholder}
    />
  );
}

/* =====================================================
   BRAND MEDIA (step 14 - all verticals)
===================================================== */

function MediaFieldsStep({ form, updateFiles }) {
  const files = form.files || {};

  return (
    <div className="bmt-form-grid">
      <FileUpload
        label="Business / property logo"
        kind="image"
        files={files.logo}
        onChange={(list) => updateFiles("logo", list)}
      />

      <FileUpload
        label="Cover image"
        kind="image"
        files={files.coverImage}
        onChange={(list) => updateFiles("coverImage", list)}
      />
    </div>
  );
}

/* =====================================================
   OWNER / BANK / TAX / CONTRACT / REVIEW
===================================================== */

function KycStep({ form, updateField, updateFiles }) {
  const files = form.files || {};

  return (
    <div className="bmt-form-grid">
      <Field label="Owner / authorized person" value={form.ownerName} onChange={(value) => updateField("ownerName", value)} placeholder="Full legal name" />
      <Field label="Owner phone" value={form.ownerPhone} onChange={(value) => updateField("ownerPhone", value)} placeholder="+91..." />

      <label className="bmt-field">
        <span>Government ID type</span>

        <select
          value={form.governmentIdType}
          onChange={(event) => updateField("governmentIdType", event.target.value)}
        >
          <option value="">Select ID type</option>
          <option value="passport">Passport</option>
          <option value="national-id">National ID</option>
          <option value="drivers-license">Driver's licence</option>
          <option value="aadhaar">Aadhaar / local national ID</option>
          <option value="other">Other government ID</option>
        </select>
      </label>

      <Field label="Government ID number" value={form.governmentIdNumber} onChange={(value) => updateField("governmentIdNumber", value)} placeholder="ID number" />

      <FileUpload label="Government ID - front side" files={files.govtIdFront} onChange={(list) => updateFiles("govtIdFront", list)} />
      <FileUpload label="Government ID - back side" files={files.govtIdBack} onChange={(list) => updateFiles("govtIdBack", list)} />
    </div>
  );
}

function BankStep({ form, updateField, updateFiles, selectedCountry }) {
  const isIndia = selectedCountry?.code === "IN";
  const files = form.files || {};

  return (
    <div className="bmt-form-grid">
      <Field label="Account holder name" value={form.accountHolderName} onChange={(value) => updateField("accountHolderName", value)} placeholder="As per bank account" />
      <Field label="Bank name" value={form.bankName} onChange={(value) => updateField("bankName", value)} placeholder="Bank name" />
      <Field label="Branch name" value={form.branchName} onChange={(value) => updateField("branchName", value)} placeholder="Branch name" />
      <Field label="Account number" value={form.accountNumber} onChange={(value) => updateField("accountNumber", value)} placeholder="Account number" />
      <Field label="Confirm account number" value={form.confirmAccountNumber} onChange={(value) => updateField("confirmAccountNumber", value)} placeholder="Re-enter account number" />

      {isIndia ? (
        <Field label="IFSC code" value={form.ifscCode} onChange={(value) => updateField("ifscCode", value)} placeholder="IFSC" />
      ) : (
        <>
          <Field label="IBAN" value={form.iban} onChange={(value) => updateField("iban", value)} placeholder="If applicable" />
          <Field label="SWIFT / BIC" value={form.swiftCode} onChange={(value) => updateField("swiftCode", value)} placeholder="SWIFT / BIC" />
          <Field label="Routing number" value={form.routingNumber} onChange={(value) => updateField("routingNumber", value)} placeholder="If applicable" />
        </>
      )}

      <Field label="Bank country" value={form.bankCountry || selectedCountry?.name || ""} onChange={(value) => updateField("bankCountry", value)} />
      <Field label="Bank currency" value={form.bankCurrency || selectedCountry?.currency || ""} onChange={(value) => updateField("bankCurrency", value)} />
      <Field label="Settlement currency" value={form.settlementCurrency} onChange={(value) => updateField("settlementCurrency", value)} placeholder={selectedCountry?.currency || "Currency"} />

      <FileUpload
        label="Bank proof (cancelled cheque / passbook / statement)"
        files={files.bankProofDoc}
        onChange={(list) => updateFiles("bankProofDoc", list)}
      />
    </div>
  );
}

function TaxStep({ form, updateField, updateFiles, selectedCountry }) {
  const isIndia = selectedCountry?.code === "IN";
  const files = form.files || {};

  return (
    <div className="bmt-form-grid">
      <label className="bmt-field">
        <span>Tax registration type</span>

        <select value={form.taxType} onChange={(event) => updateField("taxType", event.target.value)}>
          <option value="">Select tax type</option>
          {isIndia && <option value="gst">GST</option>}
          <option value="vat">VAT</option>
          <option value="sales-tax">Sales Tax</option>
          <option value="other">Other</option>
          <option value="not-registered">Not registered</option>
        </select>
      </label>

      <Field label="Tax registration number" value={form.taxRegistrationNumber} onChange={(value) => updateField("taxRegistrationNumber", value)} placeholder="VAT / GST / sales-tax number" />

      {isIndia && (
        <>
          <Field label="GST number" value={form.gstNumber} onChange={(value) => updateField("gstNumber", value)} placeholder="GSTIN, if registered" />
          <Field label="PAN number" value={form.panNumber} onChange={(value) => updateField("panNumber", value)} placeholder="PAN" />
        </>
      )}

      <FileUpload
        label="Tax registration certificate (GST / VAT / sales tax)"
        files={files.taxCertificateDoc}
        onChange={(list) => updateFiles("taxCertificateDoc", list)}
      />

      {isIndia && (
        <FileUpload
          label="PAN card"
          files={files.panCardDoc}
          onChange={(list) => updateFiles("panCardDoc", list)}
        />
      )}
    </div>
  );
}

function ContractStep({ checked, onChange }) {
  return (
    <div className="bmt-contract-card">
      <h3>BMT Connect Partner Agreement</h3>

      <p>
        Review the commercial, operational, payout, cancellation, data and marketplace terms
        before submitting your application.
      </p>

      <label className="bmt-contract-checkbox">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
        />

        <span>
          I am authorized to act for this business and I accept the BMT Connect Partner Agreement.
        </span>
      </label>
    </div>
  );
}

function ReviewStep({ form, selectedCountry, selectedSubtype }) {
  const vd = form.vd || {};
  const verticalName = VERTICALS.find((item) => item.id === form.vertical)?.name || form.vertical;
  const isCruise = form.vertical === "cruise";
  const fileCount = Object.values(form.files || {}).reduce((n, list) => n + (list?.length || 0), 0);

  return (
    <div className="bmt-review-card">
      <ReviewRow label="Country" value={selectedCountry?.name} />
      <ReviewRow label="Business type" value={form.businessType} />
      <ReviewRow label="Vertical" value={verticalName} />
      <ReviewRow label="Subtype" value={selectedSubtype?.name || form.subtype} />
      <ReviewRow label="Business" value={form.businessName || vd.cruiseOperatorName} />

      {form.vertical === "stay" && <ReviewRow label="Property" value={form.propertyName} />}
      {isCruise && <ReviewRow label="Ship" value={vd.shipName} />}
      {isCruise && (
        <ReviewRow
          label="Route"
          value={
            vd.departurePort && vd.destinationPort
              ? `${vd.departurePort} → ${vd.destinationPort}`
              : ""
          }
        />
      )}

      <ReviewRow label="City" value={form.city} />
      <ReviewRow label="Owner" value={form.ownerName} />
      <ReviewRow label="Settlement" value={form.settlementCurrency || selectedCountry?.currency} />
      <ReviewRow
        label="Files to upload"
        value={fileCount ? `${fileCount} file${fileCount > 1 ? "s" : ""}` : "None"}
      />
      <ReviewRow label="Status after submit" value="Submitted for review" />
    </div>
  );
}

/* =====================================================
   COMMON UI
===================================================== */

function Field({ label, type = "text", value = "", onChange, placeholder = "", disabled = false }) {
  return (
    <label className="bmt-field">
      <span>{label}</span>

      <input
        type={type}
        min={type === "number" ? 0 : undefined}
        value={value ?? ""}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(event) => onChange?.(event.target.value)}
      />
    </label>
  );
}

function TextAreaField({ label, value = "", onChange, placeholder = "", rows = 3 }) {
  return (
    <div className="bmt-form-span-2">
      <label className="bmt-field">
        <span>{label}</span>

        <textarea
          rows={rows}
          value={value ?? ""}
          placeholder={placeholder}
          onChange={(event) => onChange?.(event.target.value)}
        />
      </label>
    </div>
  );
}

function ToggleField({ label, checked, onChange }) {
  return (
    <label className={checked ? "bmt-checkbox-card checked" : "bmt-checkbox-card"}>
      <input
        type="checkbox"
        checked={Boolean(checked)}
        onChange={(event) => onChange(event.target.checked)}
      />

      <span>{label}</span>
    </label>
  );
}

function NotApplicable({ text }) {
  return <div className="bmt-empty-state">{text}</div>;
}

function ReviewRow({ label, value }) {
  return (
    <div className="bmt-review-row">
      <span>{label}</span>
      <strong>{value || "—"}</strong>
    </div>
  );
}