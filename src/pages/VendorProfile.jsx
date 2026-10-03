import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./VendorProfile.css";

/*
  LOCAL BACKEND
  Production me is URL ko apne Render URL se replace kar dena.
*/
const API_URL = "https://bmtvendorfinal.onrender.com/api/vendor/auth";

const EMPTY = "Not provided";

/* =========================================================
   HELPERS
========================================================= */

const formatText = (value = "") => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return EMPTY;
  }

  return String(value)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
};

const safeArray = (value) => {
  return Array.isArray(value)
    ? value
    : [];
};

const getInitials = (name = "Vendor") => {
  return (
    String(name)
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((item) =>
        item.charAt(0).toUpperCase()
      )
      .join("") || "V"
  );
};

const maskAccountNumber = (value) => {
  if (!value) return EMPTY;

  const account = String(value);

  if (account.length <= 4) {
    return account;
  }

  return `XXXX XXXX ${account.slice(-4)}`;
};

const maskAadhaar = (value) => {
  if (!value) return EMPTY;

  return `XXXX XXXX ${String(
    value
  ).slice(-4)}`;
};

/* =========================================================
   INFO ITEM
========================================================= */

function InfoItem({
  label,
  value,
  children,
  fullWidth = false,
}) {
  return (
    <div
      className={`vp-info-item ${
        fullWidth
          ? "vp-full-width"
          : ""
      }`}
    >
      <span className="vp-info-label">
        {label}
      </span>

      <div className="vp-info-value">
        {children ??
          value ??
          EMPTY}
      </div>
    </div>
  );
}

/* =========================================================
   BADGES
========================================================= */

function ServiceBadges({
  items = [],
}) {
  if (!items.length) {
    return (
      <span className="vp-empty">
        {EMPTY}
      </span>
    );
  }

  return (
    <div className="vp-badges">
      {items.map(
        (item, index) => (
          <span
            className="vp-badge"
            key={`${item}-${index}`}
          >
            {formatText(item)}
          </span>
        )
      )}
    </div>
  );
}

/* =========================================================
   YES / NO
========================================================= */

function BooleanStatus({
  value,
}) {
  return (
    <span
      className={
        value
          ? "vp-boolean vp-boolean-yes"
          : "vp-boolean vp-boolean-no"
      }
    >
      {value
        ? "Yes"
        : "No"}
    </span>
  );
}

/* =========================================================
   PROFILE SECTION
========================================================= */

function ProfileSection({
  title,
  subtitle,
  children,
}) {
  return (
    <section className="vp-card">
      <div className="vp-card-header">
        <div>
          <h3>
            {title}
          </h3>

          {subtitle && (
            <p>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="vp-info-grid">
        {children}
      </div>
    </section>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function VendorProfile({ initialSection = "personal" }) {
  const [
    vendor,
    setVendor,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  /*
    IMPORTANT:
    Ye sirf profile page ka step hai.
    VendorLayout/sidebar ka activeTab nahi.
  */
  const sectionToStep = {
    personal: 1,
    business: 1,
    contact: 2,
    tax: 3,
    bank: 4,
    service: 5,
  };

  const [
    currentStep,
    setCurrentStep,
  ] = useState(sectionToStep[initialSection] || 1);

  useEffect(() => {
    setCurrentStep(sectionToStep[initialSection] || 1);
  }, [initialSection]);

  /* =====================================================
     SERVICES
  ===================================================== */

  const services = useMemo(() => {
    if (
      safeArray(
        vendor?.services
      ).length > 0
    ) {
      return safeArray(
        vendor.services
      );
    }

    if (vendor?.service) {
      return [
        vendor.service,
      ];
    }

    return [];
  }, [vendor]);

  /* =====================================================
     FETCH LOGGED IN PROFILE
  ===================================================== */

  useEffect(() => {
    fetchVendorProfile();
  }, []);

  const fetchVendorProfile = async () => {
    let cachedVendor = null;

    try {
      const raw = localStorage.getItem("vendorUser");
      cachedVendor = raw ? JSON.parse(raw) : null;
    } catch (e) {
      cachedVendor = null;
    }

    try {
      setLoading(true);
      setError("");

      // IMPORTANT: Vendor dashboard has its own token.
      // Do not use the Partner onboarding token here.
      const token = localStorage.getItem("vendorToken");

      if (!token) {
        if (cachedVendor) {
          setVendor(cachedVendor);
          return;
        }
        setError("Vendor login session not found. Please sign in again.");
        return;
      }

      const response = await axios.get(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const apiVendor =
        response.data?.vendor ||
        response.data?.data?.vendor ||
        response.data?.data ||
        null;

      if (!apiVendor && !cachedVendor) {
        setError("Vendor profile not found.");
        return;
      }

      // API is authoritative. Cached login response fills any fields that
      // are not returned by an older profile endpoint.
      const vendorData = {
        ...(cachedVendor || {}),
        ...(apiVendor || {}),
        business: {
          ...(cachedVendor?.business || {}),
          ...(apiVendor?.business || {}),
        },
        owner: {
          ...(cachedVendor?.owner || {}),
          ...(apiVendor?.owner || {}),
        },
        contact: {
          ...(cachedVendor?.contact || {}),
          ...(apiVendor?.contact || {}),
        },
        tax: {
          ...(cachedVendor?.tax || {}),
          ...(apiVendor?.tax || {}),
        },
        bank: {
          ...(cachedVendor?.bank || {}),
          ...(apiVendor?.bank || {}),
        },
      };

      setVendor(vendorData);
      localStorage.setItem("vendorUser", JSON.stringify(vendorData));
    } catch (error) {
      console.error("PROFILE ERROR:", error.response?.data || error.message);

      // Do not blank the page when the API is temporarily unavailable.
      // Login response already contains the approved vendor record.
      if (cachedVendor) {
        setVendor(cachedVendor);
        setError("");
        return;
      }

      setError(
        error.response?.data?.message || "Unable to load vendor profile."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="vp-page">
        <div className="vp-state-card">
          <div className="vp-loader" />

          <h3>
            Loading Profile
          </h3>

          <p>
            Please wait while
            your profile is
            loading.
          </p>
        </div>
      </div>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (
    error ||
    !vendor
  ) {
    return (
      <div className="vp-page">
        <div className="vp-state-card">
          <div className="vp-error-icon">
            !
          </div>

          <h3>
            Unable to load
            profile
          </h3>

          <p>
            {error ||
              "Vendor profile not found."}
          </p>

          <button
            type="button"
            className="vp-primary-button"
            onClick={
              fetchVendorProfile
            }
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /* =====================================================
     STATUS
  ===================================================== */

  const status =
    String(
      vendor.status ||
        "PENDING"
    ).toUpperCase();

  /* =====================================================
     SERVICE CHECK
  ===================================================== */

  const stayServices = [
    "hotel",
    "homestay",
    "resort",
    "villa",
    "apartment",
    "guesthouse",
    "hostel",
    "camp",
    "farmhouse",
    "vacation-home",
    "palace",
    "motel",
  ];

  const isStayVendor =
    services.some(
      (service) =>
        stayServices.includes(
          String(
            service
          ).toLowerCase()
        )
    );

  const isCabVendor =
    services.some(
      (service) =>
        [
          "cab",
          "cabs",
          "car-rental",
          "bike-rental",
        ].includes(
          String(
            service
          ).toLowerCase()
        )
    );

  const isBusVendor =
    services.some(
      (service) =>
        String(
          service
        ).toLowerCase() ===
        "bus"
    );

  const isNightClubVendor =
    services.some(
      (service) =>
        [
          "night-club",
          "nightclub",
          "nightclubs",
        ].includes(
          String(
            service
          ).toLowerCase()
        )
    );

  /* =====================================================
     STEP CONFIG
  ===================================================== */

  const steps = [
    {
      id: 1,
      label:
        "Business",
      short:
        "Business Info",
    },
    {
      id: 2,
      label:
        "Contact",
      short:
        "Contact & Address",
    },
    {
      id: 3,
      label:
        "Tax",
      short:
        "Tax & Identity",
    },
    {
      id: 4,
      label:
        "Bank",
      short:
        "Bank Details",
    },
    {
      id: 5,
      label:
        "Service",
      short:
        "Service Details",
    },
  ];

  const goNext = () => {
    setCurrentStep(
      (prev) =>
        Math.min(
          prev + 1,
          steps.length
        )
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const goPrevious =
    () => {
      setCurrentStep(
        (prev) =>
          Math.max(
            prev - 1,
            1
          )
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };

  const goToStep = (
    step
  ) => {
    setCurrentStep(
      step
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="vp-page">
      <div className="vp-container">

        {/* =================================================
            TOP PROFILE SUMMARY
        ================================================= */}

        <section className="vp-profile-header">

          <div className="vp-profile-left">

            <div className="vp-avatar-wrapper">

              {vendor.profileImage ? (
                <img
                  src={
                    vendor.profileImage
                  }
                  alt={
                    vendor.name ||
                    "Vendor"
                  }
                  className="vp-avatar-image"
                />
              ) : (
                <div className="vp-avatar">
                  {getInitials(
                    vendor.name
                  )}
                </div>
              )}

              {vendor.isApproved && (
                <span
                  className="vp-approved-icon"
                  title="Approved Vendor"
                >
                  ✓
                </span>
              )}

            </div>

            <div className="vp-profile-heading">

              <div className="vp-name-row">

                <h1>
                  {vendor.name ||
                    "Vendor"}
                </h1>

                <span
                  className={`vp-status vp-status-${status.toLowerCase()}`}
                >
                  {status}
                </span>

              </div>

              <p className="vp-business-title">
                {vendor.businessName ||
                  vendor.companyName ||
                  vendor.legalBusinessName ||
                  "BirdMyTrip Vendor"}
              </p>

              <div className="vp-contact-row">

                {vendor.email && (
                  <span>
                    ✉{" "}
                    {
                      vendor.email
                    }
                  </span>
                )}

                {vendor.phone && (
                  <span>
                    ☎{" "}
                    {
                      vendor.phone
                    }
                  </span>
                )}

                {(
                  vendor.city ||
                  vendor.state ||
                  vendor.country
                ) && (
                  <span>
                    📍{" "}
                    {[
                      vendor.city,
                      vendor.state,
                      vendor.country,
                    ]
                      .filter(
                        Boolean
                      )
                      .join(
                        ", "
                      )}
                  </span>
                )}

              </div>

            </div>

          </div>

          <div className="vp-profile-right">

            <div className="vp-approval-box">

              <span>
                Account Status
              </span>

              <strong>
                {vendor.isApproved
                  ? "Approved"
                  : status ===
                    "REJECTED"
                  ? "Rejected"
                  : "Under Review"}
              </strong>

            </div>

            <div className="vp-verification-list">

              <span
                className={
                  vendor.isEmailVerified
                    ? "vp-verified"
                    : ""
                }
              >
                {vendor.isEmailVerified
                  ? "✓"
                  : "○"}{" "}
                Email
              </span>

              <span
                className={
                  vendor.isPhoneVerified
                    ? "vp-verified"
                    : ""
                }
              >
                {vendor.isPhoneVerified
                  ? "✓"
                  : "○"}{" "}
                Phone
              </span>

              <span
                className={
                  vendor.isActive
                    ? "vp-verified"
                    : "vp-inactive"
                }
              >
                {vendor.isActive
                  ? "✓ Active"
                  : "○ Inactive"}
              </span>

            </div>

          </div>

        </section>

        {/* =================================================
            STEPPER
        ================================================= */}

        <div className="vp-stepper">

          {steps.map(
            (step) => {
              const isActive =
                currentStep ===
                step.id;

              const isCompleted =
                currentStep >
                step.id;

              return (
                <button
                  key={
                    step.id
                  }
                  type="button"
                  className={`vp-step ${
                    isActive
                      ? "vp-step-active"
                      : ""
                  } ${
                    isCompleted
                      ? "vp-step-completed"
                      : ""
                  }`}
                  onClick={() =>
                    goToStep(
                      step.id
                    )
                  }
                >

                  <span className="vp-step-circle">
                    {isCompleted
                      ? "✓"
                      : step.id}
                  </span>

                  <span className="vp-step-copy">
                    <strong>
                      {
                        step.label
                      }
                    </strong>

                    <small>
                      {
                        step.short
                      }
                    </small>
                  </span>

                </button>
              );
            }
          )}

        </div>

        {/* =================================================
            CURRENT STEP CONTENT
        ================================================= */}

        <div className="vp-step-content">

          {/* =============================================
              STEP 1
          ============================================= */}

          {currentStep === 1 && (
            <ProfileSection
              title="Business Profile"
              subtitle="Your registered business and account information"
            >

              <InfoItem
                label="Full Name"
                value={
                  vendor.name
                }
              />

              <InfoItem
                label="Email"
                value={
                  vendor.email
                }
              />

              <InfoItem
                label="Phone"
                value={
                  vendor.phone
                }
              />

              <InfoItem
                label="Business Type"
                value={formatText(
                  vendor.businessType
                )}
              />

              <InfoItem
                label="Company Name"
                value={
                  vendor.companyName
                }
              />

              <InfoItem
                label="Business Name"
                value={
                  vendor.businessName
                }
              />

              <InfoItem
                label="Legal Business Name"
                value={
                  vendor.legalBusinessName
                }
              />

              <InfoItem
                label="Website"
                value={
                  vendor.website
                }
              />

              <InfoItem
                label="Selected Services"
                fullWidth
              >
                <ServiceBadges
                  items={
                    services
                  }
                />
              </InfoItem>

              <InfoItem
                label="Approval Status"
              >
                <span
                  className={`vp-inline-status vp-inline-${status.toLowerCase()}`}
                >
                  {
                    status
                  }
                </span>
              </InfoItem>

              <InfoItem
                label="Account Active"
              >
                <BooleanStatus
                  value={
                    vendor.isActive
                  }
                />
              </InfoItem>

            </ProfileSection>
          )}

          {/* =============================================
              STEP 2
          ============================================= */}

          {currentStep === 2 && (
            <ProfileSection
              title="Contact & Address"
              subtitle="Your registered contact and business location details"
            >

              <InfoItem
                label="Business Email"
                value={
                  vendor.businessEmail
                }
              />

              <InfoItem
                label="Business Phone"
                value={
                  vendor.businessPhone
                }
              />

              <InfoItem
                label="Alternate Phone"
                value={
                  vendor.alternatePhone
                }
              />

              <InfoItem
                label="Country"
                value={
                  vendor.country
                }
              />

              <InfoItem
                label="State"
                value={
                  vendor.state
                }
              />

              <InfoItem
                label="City"
                value={
                  vendor.city
                }
              />

              <InfoItem
                label="Pincode"
                value={
                  vendor.pincode
                }
              />

              <InfoItem
                label="Landmark"
                value={
                  vendor.landmark
                }
              />

              <InfoItem
                label="Address"
                fullWidth
                value={
                  vendor.address ||
                  vendor.addressLine1
                }
              />

              <InfoItem
                label="Address Line 2"
                fullWidth
                value={
                  vendor.addressLine2
                }
              />

            </ProfileSection>
          )}

          {/* =============================================
              STEP 3
          ============================================= */}

          {currentStep === 3 && (
            <ProfileSection
              title="Tax & Identity"
              subtitle="Tax registration and verification documents"
            >

              <InfoItem
                label="GST Number"
                value={
                  vendor.gstNumber ||
                  vendor.gstRegistrationNumber
                }
              />

              <InfoItem
                label="PAN Number"
                value={
                  vendor.panNumber ||
                  vendor.panCardNumber
                }
              />

              <InfoItem
                label="Aadhaar Number"
                value={maskAadhaar(
                  vendor.aadharNumber
                )}
              />

              <InfoItem
                label="Email Verified"
              >
                <BooleanStatus
                  value={
                    vendor.isEmailVerified
                  }
                />
              </InfoItem>

              <InfoItem
                label="Phone Verified"
              >
                <BooleanStatus
                  value={
                    vendor.isPhoneVerified
                  }
                />
              </InfoItem>

              <InfoItem
                label="GST Certificate"
              >
                {vendor.gstCertificate ? (
                  <a
                    href={
                      vendor.gstCertificate
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="vp-document-link"
                  >
                    View Document
                  </a>
                ) : (
                  EMPTY
                )}
              </InfoItem>

              <InfoItem
                label="PAN Card"
              >
                {vendor.panCard ? (
                  <a
                    href={
                      vendor.panCard
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="vp-document-link"
                  >
                    View Document
                  </a>
                ) : (
                  EMPTY
                )}
              </InfoItem>

              <InfoItem
                label="Aadhaar Front"
              >
                {vendor.aadharFront ? (
                  <a
                    href={
                      vendor.aadharFront
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="vp-document-link"
                  >
                    View Document
                  </a>
                ) : (
                  EMPTY
                )}
              </InfoItem>

              <InfoItem
                label="Aadhaar Back"
              >
                {vendor.aadharBack ? (
                  <a
                    href={
                      vendor.aadharBack
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="vp-document-link"
                  >
                    View Document
                  </a>
                ) : (
                  EMPTY
                )}
              </InfoItem>

            </ProfileSection>
          )}

          {/* =============================================
              STEP 4
          ============================================= */}

          {currentStep === 4 && (
            <ProfileSection
              title="Bank Details"
              subtitle="Settlement and payout account information"
            >

              <InfoItem
                label="Account Holder Name"
                value={
                  vendor.accountHolderName
                }
              />

              <InfoItem
                label="Bank Name"
                value={
                  vendor.bankName
                }
              />

              <InfoItem
                label="Branch Name"
                value={
                  vendor.branchName
                }
              />

              <InfoItem
                label="Account Number"
                value={maskAccountNumber(
                  vendor.accountNumber
                )}
              />

              <InfoItem
                label="IFSC Code"
                value={
                  vendor.ifscCode
                }
              />

              <InfoItem
                label="Cancelled Cheque"
              >
                {vendor.cancelledCheque ? (
                  <a
                    href={
                      vendor.cancelledCheque
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="vp-document-link"
                  >
                    View Document
                  </a>
                ) : (
                  EMPTY
                )}
              </InfoItem>

              <InfoItem
                label="Passbook"
              >
                {vendor.passbookImage ? (
                  <a
                    href={
                      vendor.passbookImage
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="vp-document-link"
                  >
                    View Document
                  </a>
                ) : (
                  EMPTY
                )}
              </InfoItem>

            </ProfileSection>
          )}

          {/* =============================================
              STEP 5
          ============================================= */}

          {currentStep === 5 && (
            <div className="vp-service-step">

              {/* BUS */}

              {isBusVendor && (
                <ProfileSection
                  title="Bus Operator Details"
                  subtitle="Your bus fleet and operating details"
                >

                  <InfoItem
                    label="Operator Name"
                    value={
                      vendor.busDetails
                        ?.operatorName
                    }
                  />

                  <InfoItem
                    label="Total Buses"
                    value={
                      vendor.busDetails
                        ?.totalBuses
                    }
                  />

                  <InfoItem
                    label="Transport Permit Number"
                    value={
                      vendor.busDetails
                        ?.transportPermitNumber
                    }
                  />

                  <InfoItem
                    label="Operator License Number"
                    value={
                      vendor.busDetails
                        ?.operatorLicenseNumber
                    }
                  />

                  <InfoItem
                    label="Bus Types"
                    fullWidth
                  >
                    <ServiceBadges
                      items={safeArray(
                        vendor.busDetails
                          ?.busTypes
                      )}
                    />
                  </InfoItem>

                  <InfoItem
                    label="Operating Cities"
                    fullWidth
                  >
                    <ServiceBadges
                      items={safeArray(
                        vendor.busDetails
                          ?.operatingCities
                      )}
                    />
                  </InfoItem>

                  <InfoItem
                    label="Routes"
                    fullWidth
                  >
                    <ServiceBadges
                      items={safeArray(
                        vendor.busDetails
                          ?.routes
                      )}
                    />
                  </InfoItem>

                </ProfileSection>
              )}

              {/* CAB */}

              {isCabVendor && (
                <ProfileSection
                  title="Cab / Car Rental Details"
                  subtitle="Your vehicle and transport business details"
                >

                  <InfoItem
                    label="Business Model"
                    value={formatText(
                      vendor.carRentalDetails
                        ?.businessModel
                    )}
                  />

                  <InfoItem
                    label="Total Vehicles"
                    value={
                      vendor.carRentalDetails
                        ?.totalVehicles
                    }
                  />

                  <InfoItem
                    label="Transport License"
                    value={
                      vendor.carRentalDetails
                        ?.transportLicenseNumber
                    }
                  />

                  <InfoItem
                    label="Airport Pickup"
                  >
                    <BooleanStatus
                      value={
                        vendor.carRentalDetails
                          ?.airportPickupAvailable
                      }
                    />
                  </InfoItem>

                  <InfoItem
                    label="Outstation Available"
                  >
                    <BooleanStatus
                      value={
                        vendor.carRentalDetails
                          ?.outstationAvailable
                      }
                    />
                  </InfoItem>

                  <InfoItem
                    label="Local Rental"
                  >
                    <BooleanStatus
                      value={
                        vendor.carRentalDetails
                          ?.localRentalAvailable
                      }
                    />
                  </InfoItem>

                  <InfoItem
                    label="Driver Provided"
                  >
                    <BooleanStatus
                      value={
                        vendor.carRentalDetails
                          ?.driverProvided
                      }
                    />
                  </InfoItem>

                  <InfoItem
                    label="Self Drive"
                  >
                    <BooleanStatus
                      value={
                        vendor.carRentalDetails
                          ?.selfDriveAvailable
                      }
                    />
                  </InfoItem>

                  <InfoItem
                    label="Vehicle Types"
                    fullWidth
                  >
                    <ServiceBadges
                      items={safeArray(
                        vendor.carRentalDetails
                          ?.vehicleTypes
                      )}
                    />
                  </InfoItem>

                  <InfoItem
                    label="Service Cities"
                    fullWidth
                  >
                    <ServiceBadges
                      items={safeArray(
                        vendor.carRentalDetails
                          ?.serviceCities
                      )}
                    />
                  </InfoItem>

                </ProfileSection>
              )}

              {/* STAY */}

              {isStayVendor && (
                <ProfileSection
                  title="Stay Business Details"
                  subtitle="Your property business information"
                >

                  <InfoItem
                    label="Total Properties"
                    value={
                      vendor.stayDetails
                        ?.totalProperties
                    }
                  />

                  <InfoItem
                    label="Property Types"
                    fullWidth
                  >
                    <ServiceBadges
                      items={safeArray(
                        vendor.stayDetails
                          ?.propertyTypes
                      )}
                    />
                  </InfoItem>

                  <InfoItem
                    label="Operating Cities"
                    fullWidth
                  >
                    <ServiceBadges
                      items={safeArray(
                        vendor.stayDetails
                          ?.operatingCities
                      )}
                    />
                  </InfoItem>

                </ProfileSection>
              )}

              {/* NIGHT CLUB */}

              {isNightClubVendor && (
                <ProfileSection
                  title="Night Club Details"
                  subtitle="Your venue and nightlife business details"
                >

                  <InfoItem
                    label="Venue Name"
                    value={
                      vendor.nightClubDetails
                        ?.venueName
                    }
                  />

                  <InfoItem
                    label="Venue Type"
                    value={formatText(
                      vendor.nightClubDetails
                        ?.venueType
                    )}
                  />

                  <InfoItem
                    label="Total Capacity"
                    value={
                      vendor.nightClubDetails
                        ?.totalCapacity
                    }
                  />

                  <InfoItem
                    label="Age Limit"
                    value={
                      vendor.nightClubDetails
                        ?.ageLimit
                        ? `${vendor.nightClubDetails.ageLimit}+`
                        : EMPTY
                    }
                  />

                  <InfoItem
                    label="Entry Fee Type"
                    value={formatText(
                      vendor.nightClubDetails
                        ?.entryFeeType
                    )}
                  />

                  <InfoItem
                    label="Average Entry Fee"
                    value={
                      vendor.nightClubDetails
                        ?.averageEntryFee
                    }
                  />

                  <InfoItem
                    label="Opening Time"
                    value={
                      vendor.nightClubDetails
                        ?.openingTime
                    }
                  />

                  <InfoItem
                    label="Closing Time"
                    value={
                      vendor.nightClubDetails
                        ?.closingTime
                    }
                  />

                  <InfoItem
                    label="Parking"
                  >
                    <BooleanStatus
                      value={
                        vendor.nightClubDetails
                          ?.parkingAvailable
                      }
                    />
                  </InfoItem>

                  <InfoItem
                    label="Valet"
                  >
                    <BooleanStatus
                      value={
                        vendor.nightClubDetails
                          ?.valetAvailable
                      }
                    />
                  </InfoItem>

                  <InfoItem
                    label="VIP Section"
                  >
                    <BooleanStatus
                      value={
                        vendor.nightClubDetails
                          ?.vipSectionAvailable
                      }
                    />
                  </InfoItem>

                  <InfoItem
                    label="Live DJ"
                  >
                    <BooleanStatus
                      value={
                        vendor.nightClubDetails
                          ?.liveDjAvailable
                      }
                    />
                  </InfoItem>

                  <InfoItem
                    label="Operating Cities"
                    fullWidth
                  >
                    <ServiceBadges
                      items={safeArray(
                        vendor.nightClubDetails
                          ?.operatingCities
                      )}
                    />
                  </InfoItem>

                  <InfoItem
                    label="Music Genres"
                    fullWidth
                  >
                    <ServiceBadges
                      items={safeArray(
                        vendor.nightClubDetails
                          ?.musicGenres
                      )}
                    />
                  </InfoItem>

                </ProfileSection>
              )}

              {/* GENERIC SERVICE */}

              {!isBusVendor &&
                !isCabVendor &&
                !isStayVendor &&
                !isNightClubVendor && (
                  <ProfileSection
                    title="Service Details"
                    subtitle="Your selected vendor services"
                  >
                    <InfoItem
                      label="Selected Services"
                      fullWidth
                    >
                      <ServiceBadges
                        items={
                          services
                        }
                      />
                    </InfoItem>
                  </ProfileSection>
                )}

            </div>
          )}

          {/* =================================================
              PREVIOUS / NEXT
          ================================================= */}

          <div className="vp-navigation">

            <button
              type="button"
              className="vp-nav-btn vp-nav-secondary"
              onClick={
                goPrevious
              }
              disabled={
                currentStep ===
                1
              }
            >
              ← Previous
            </button>

            <div className="vp-page-indicator">
              <strong>
                Step{" "}
                {
                  currentStep
                }
              </strong>

              <span>
                of{" "}
                {
                  steps.length
                }
              </span>
            </div>

            {currentStep <
            steps.length ? (
              <button
                type="button"
                className="vp-nav-btn vp-nav-primary"
                onClick={
                  goNext
                }
              >
                Next →
              </button>
            ) : (
              <button
                type="button"
                className="vp-nav-btn vp-nav-primary"
                onClick={() =>
                  goToStep(
                    1
                  )
                }
              >
                Back to Start
              </button>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}