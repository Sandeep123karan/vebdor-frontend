import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CabRegistration.css";

const API_BASE = process.env.REACT_APP_API_URL || "https://bmtvendorfinal.onrender.com";
const SIGNUP_URL = `${API_BASE}/api/vendor/auth/signup`;

const STEPS = [
  "Owner Details",
  "Cab Details",
  "Driver Details",
  "Service Areas",
  "Bank Details",
  "Documents",
  "Review & Submit",
];

const VEHICLE_TYPES = [
  "Sedan",
  "Hatchback",
  "SUV",
  "MUV",
  "Luxury",
  "Tempo Traveller",
  "Other",
];

const FUEL_TYPES = ["Petrol", "Diesel", "CNG", "Electric", "Hybrid"];

export default function CabRegistration() {
  const navigate = useNavigate();

  // Try to pre-fill from partner session if present
  const partnerUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    // 1. Owner / Vendor Details
    name: partnerUser?.name || "",
    companyName: partnerUser?.companyName || partnerUser?.businessName || "",
    phone: partnerUser?.phone || partnerUser?.businessPhone || "",
    email: partnerUser?.email || partnerUser?.businessEmail || "",
    password: "",
    confirmPassword: "",
    alternatePhone: "",
    panNumber: "",
    aadhaarNumber: "",
    gstNumber: "",
    profilePhoto: "",
    profilePhotoName: "",

    // 2. Cab Details
    vehicleNumber: "",
    vehicleType: "Sedan",
    vehicleMake: "",
    vehicleModel: "",
    manufacturingYear: new Date().getFullYear().toString(),
    fuelType: "Petrol",
    seatingCapacity: "4",
    acType: "AC", // "AC" or "Non-AC"
    vehicleColor: "",
    rcNumber: "",
    rcDocument: "",
    rcDocumentName: "",
    insurancePolicyNumber: "",
    insuranceExpiryDate: "",
    insuranceDocument: "",
    insuranceDocumentName: "",
    permitNumber: "",
    permitExpiryDate: "",
    permitDocument: "",
    permitDocumentName: "",
    vehiclePhotos: [], // array of base64 strings
    vehiclePhotoNames: [],

    // 3. Driver Details
    isOwnerDriver: false,
    driverName: "",
    driverPhone: "",
    driverDob: "",
    drivingLicenceNumber: "",
    licenceExpiryDate: "",
    drivingLicenceDocument: "",
    drivingLicenceDocumentName: "",
    driverPhoto: "",
    driverPhotoName: "",
    experienceYears: "",
    policeVerificationDocument: "",
    policeVerificationDocumentName: "",

    // 4. Service / Location Details
    operatingCity: "",
    operatingState: "",
    pickupLocation: "",
    serviceAreas: "",
    airportTransfer: true,
    outstationService: true,
    localRentalService: true,

    // 5. Bank / Payment Details
    accountHolderName: partnerUser?.name || "",
    bankName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: "",
    upiId: "",
    cancelledCheque: "",
    cancelledChequeName: "",

    // 6. Additional Documents
    ownerIdProof: "",
    ownerIdProofName: "",
    panCardDocument: "",
    panCardDocumentName: "",
    otherDocument: "",
    otherDocumentName: "",

    // Contract Agreement
    contractAccepted: false,
  });

  const progress = Math.round((step / STEPS.length) * 100);

  const set = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
  };

  // Convert File to Base64 with filename capture
  const handleFileUpload = (e, fieldKey, nameKey, isMultiple = false) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (isMultiple) {
      const readers = files.map(
        (file) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () =>
              resolve({ data: reader.result, name: file.name });
            reader.readAsDataURL(file);
          })
      );

      Promise.all(readers).then((results) => {
        setForm((prev) => ({
          ...prev,
          [fieldKey]: [...prev[fieldKey], ...results.map((r) => r.data)],
          [nameKey]: [...prev[nameKey], ...results.map((r) => r.name)],
        }));
      });
    } else {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({
          ...prev,
          [fieldKey]: reader.result,
          [nameKey]: file.name,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = (fieldKey, nameKey) => {
    setForm((prev) => ({
      ...prev,
      [fieldKey]: "",
      [nameKey]: "",
    }));
  };

  const removeMultipleFile = (fieldKey, nameKey, index) => {
    setForm((prev) => ({
      ...prev,
      [fieldKey]: prev[fieldKey].filter((_, i) => i !== index),
      [nameKey]: prev[nameKey].filter((_, i) => i !== index),
    }));
  };

  // Synchronize owner info into driver fields if owner is the driver
  const toggleOwnerDriver = (checked) => {
    setForm((prev) => ({
      ...prev,
      isOwnerDriver: checked,
      driverName: checked ? prev.name : prev.driverName,
      driverPhone: checked ? prev.phone : prev.driverPhone,
    }));
  };

  const signOut = () => {
    const ok = window.confirm(
      "Are you sure you want to sign out? Any unsaved registration progress will be lost."
    );
    if (!ok) return;

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("selectedVertical");
    localStorage.removeItem("partnerSelectedVertical");
    localStorage.removeItem("vendorToken");
    localStorage.removeItem("vendorUser");

    navigate("/signin", { replace: true });
  };

  // ==========================================
  // STEP VALIDATION
  // ==========================================
  const validate = () => {
    if (step === 1) {
      if (!form.name.trim()) return "Full Name is required.";
      if (!form.phone.trim()) return "Mobile Number is required.";
      if (form.phone.replace(/[^\d]/g, "").length < 10)
        return "Please enter a valid 10-digit mobile number.";
      if (!form.email.trim()) return "Email Address is required.";
      if (!form.password) return "Password is required.";
      if (form.password.length < 6)
        return "Password must be at least 6 characters.";
      if (form.password !== form.confirmPassword)
        return "Passwords do not match.";
      if (!form.panNumber.trim()) return "PAN Number is required.";
      if (!form.aadhaarNumber.trim())
        return "Aadhaar / Government ID Number is required.";
    }

    if (step === 2) {
      if (!form.vehicleNumber.trim()) return "Vehicle Number is required.";
      if (!form.vehicleType) return "Please select a Vehicle Type.";
      if (!form.vehicleMake.trim()) return "Vehicle Make is required.";
      if (!form.vehicleModel.trim()) return "Vehicle Model is required.";
      if (!form.manufacturingYear.trim())
        return "Manufacturing Year is required.";
      if (!form.fuelType) return "Please select a Fuel Type.";
      if (!form.seatingCapacity) return "Seating Capacity is required.";
      if (!form.acType) return "Please choose AC or Non-AC.";
      if (!form.rcNumber.trim()) return "RC Number is required.";
      if (!form.rcDocument) return "RC Document upload is required.";
      if (!form.insurancePolicyNumber.trim())
        return "Vehicle Insurance policy number is required.";
      if (!form.insuranceExpiryDate)
        return "Insurance Expiry Date is required.";
      if (!form.vehiclePhotos.length)
        return "At least one Vehicle Photo is required.";
    }

    if (step === 3) {
      if (!form.isOwnerDriver) {
        if (!form.driverName.trim()) return "Driver Full Name is required.";
        if (!form.driverPhone.trim()) return "Driver Mobile Number is required.";
      }
      if (!form.drivingLicenceNumber.trim())
        return "Driving Licence Number is required.";
      if (!form.licenceExpiryDate) return "Licence Expiry Date is required.";
      if (!form.drivingLicenceDocument)
        return "Driving Licence Document upload is required.";
      if (!form.driverPhoto) return "Driver Photo upload is required.";
    }

    if (step === 4) {
      if (!form.operatingCity.trim()) return "Operating City is required.";
      if (!form.operatingState.trim()) return "Operating State is required.";
      if (!form.pickupLocation.trim())
        return "Pickup Location / Base Hub is required.";
      if (!form.serviceAreas.trim())
        return "Service Areas / Coverage Zones are required.";
    }

    if (step === 5) {
      if (!form.accountHolderName.trim())
        return "Account Holder Name is required.";
      if (!form.bankName.trim()) return "Bank Name is required.";
      if (!form.accountNumber.trim()) return "Account Number is required.";
      if (form.accountNumber !== form.confirmAccountNumber)
        return "Account numbers do not match.";
      if (!form.ifscCode.trim()) return "Bank IFSC Code is required.";
    }

    if (step === 6) {
      if (!form.ownerIdProof) return "Owner ID Proof document is required.";
      if (!form.panCardDocument) return "PAN Card document is required.";
      if (!form.rcDocument) return "RC document is required.";
      if (!form.drivingLicenceDocument)
        return "Driving Licence document is required.";
    }

    if (step === 7) {
      if (!form.contractAccepted)
        return "You must accept the BMT Connect Supplier Terms & Conditions to submit your application for approval.";
    }

    return "";
  };

  const next = () => {
    const err = validate();
    if (err) {
      setError(err);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setError("");
    if (step < STEPS.length) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      submit();
    }
  };

  const prev = () => {
    setError("");
    if (step > 1) {
      setStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const submit = async () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        businessEmail: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        businessPhone: form.phone.trim(),
        password: form.password,
        vertical: "cab",
        selectedVertical: "cab",
        service: "cab",
        services: ["cab"],
        businessType: "individual-owner",
        businessName: form.companyName.trim() || form.name.trim(),
        companyName: form.companyName.trim() || form.name.trim(),
        alternatePhone: form.alternatePhone.trim(),
        panNumber: form.panNumber.trim().toUpperCase(),
        panCardNumber: form.panNumber.trim().toUpperCase(),
        panCard: form.panCardDocument,
        aadharNumber: form.aadhaarNumber.trim(),
        gstNumber: form.gstNumber.trim().toUpperCase(),
        logo: form.profilePhoto,

        // Location / Address
        country: "India",
        state: form.operatingState.trim(),
        city: form.operatingCity.trim(),
        address: form.pickupLocation.trim(),

        // Bank
        bankCountry: "India",
        bankCurrency: "INR",
        settlementCurrency: "INR",
        accountHolderName: form.accountHolderName.trim(),
        bankAccountName: form.accountHolderName.trim(),
        bankName: form.bankName.trim(),
        accountNumber: form.accountNumber.trim(),
        bankAccountNumber: form.accountNumber.trim(),
        ifscCode: form.ifscCode.trim().toUpperCase(),
        bankIfscCode: form.ifscCode.trim().toUpperCase(),
        upiId: form.upiId.trim(),
        cancelledCheque: form.cancelledCheque,

        // Onboarding Status
        onboardingStatus: "submitted",
        onboardingComplete: true,
        onboardingStep: STEPS.length,
        onboardingProgress: 100,
        status: "PENDING",
        isApproved: false,
        contractAccepted: form.contractAccepted,
        termsAccepted: form.contractAccepted,
        privacyAccepted: form.contractAccepted,

        // Legacy carRentalDetails
        carRentalDetails: {
          businessModel: form.isOwnerDriver
            ? "individual-owner-driver"
            : "cab-operator",
          totalVehicles: 1,
          vehicleTypes: [form.vehicleType],
          serviceCities: [form.operatingCity.trim()],
          airportPickupAvailable: Boolean(form.airportTransfer),
          outstationAvailable: Boolean(form.outstationService),
          localRentalAvailable: Boolean(form.localRentalService),
          driverProvided: true,
          selfDriveAvailable: false,
          transportLicenseNumber: form.drivingLicenceNumber.trim(),
          licenseDocument: form.drivingLicenceDocument,
        },

        // Detailed Cab & Driver Data
        cabDetails: {
          profilePhoto: form.profilePhoto,
          panNumber: form.panNumber.trim().toUpperCase(),
          aadhaarNumber: form.aadhaarNumber.trim(),
          gstNumber: form.gstNumber.trim().toUpperCase(),
          alternatePhone: form.alternatePhone.trim(),

          vehicleNumber: form.vehicleNumber.trim().toUpperCase(),
          vehicleType: form.vehicleType,
          vehicleMake: form.vehicleMake.trim(),
          vehicleModel: form.vehicleModel.trim(),
          manufacturingYear: form.manufacturingYear.trim(),
          fuelType: form.fuelType,
          seatingCapacity: Number(form.seatingCapacity) || 4,
          acType: form.acType,
          vehicleColor: form.vehicleColor.trim(),
          rcNumber: form.rcNumber.trim().toUpperCase(),
          rcDocument: form.rcDocument,
          insurancePolicyNumber: form.insurancePolicyNumber.trim(),
          insuranceDocument: form.insuranceDocument,
          insuranceExpiryDate: form.insuranceExpiryDate,
          permitNumber: form.permitNumber.trim(),
          permitExpiryDate: form.permitExpiryDate,
          vehiclePhotos: form.vehiclePhotos,

          isOwnerDriver: Boolean(form.isOwnerDriver),
          driverName: form.isOwnerDriver
            ? form.name.trim()
            : form.driverName.trim(),
          driverPhone: form.isOwnerDriver
            ? form.phone.trim()
            : form.driverPhone.trim(),
          driverDob: form.driverDob,
          drivingLicenceNumber: form.drivingLicenceNumber.trim().toUpperCase(),
          licenceExpiryDate: form.licenceExpiryDate,
          licenceDocument: form.drivingLicenceDocument,
          driverPhoto: form.driverPhoto,
          experienceYears: form.experienceYears.trim(),
          policeVerificationDocument: form.policeVerificationDocument,

          operatingCity: form.operatingCity.trim(),
          operatingState: form.operatingState.trim(),
          pickupLocation: form.pickupLocation.trim(),
          serviceAreas: form.serviceAreas.trim(),
          airportTransfer: Boolean(form.airportTransfer),
          outstationService: Boolean(form.outstationService),
          localRentalService: Boolean(form.localRentalService),

          accountHolderName: form.accountHolderName.trim(),
          bankName: form.bankName.trim(),
          accountNumber: form.accountNumber.trim(),
          ifscCode: form.ifscCode.trim().toUpperCase(),
          upiId: form.upiId.trim(),
          cancelledCheque: form.cancelledCheque,

          documents: {
            ownerIdProof: form.ownerIdProof,
            panCard: form.panCardDocument,
            rc: form.rcDocument,
            insurance: form.insuranceDocument,
            permit: form.permitDocument,
            drivingLicence: form.drivingLicenceDocument,
            otherDocuments: form.otherDocument ? [form.otherDocument] : [],
          },
        },

        applicationMeta: {
          supplierSubtype: "cab-operator",
          contractAccepted: form.contractAccepted,
          contractAcceptedAt: new Date().toISOString(),
          cabOperator: {
            vehicleType: form.vehicleType,
            vehicleNumber: form.vehicleNumber.trim().toUpperCase(),
            isOwnerDriver: Boolean(form.isOwnerDriver),
            operatingCity: form.operatingCity.trim(),
            operatingState: form.operatingState.trim(),
          },
        },
      };

      const res = await fetch(SIGNUP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 201 && data?.success) {
        localStorage.removeItem("vendorToken");
        localStorage.removeItem("vendorUser");

        navigate("/vendor-login", {
          replace: true,
          state: {
            applicationSubmitted: true,
            email: payload.email,
            status: "PENDING",
            vertical: "cab",
            message:
              "Cab vendor registration submitted successfully! Awaiting BMT admin approval.",
          },
        });
        return;
      }

      if (res.status === 409) {
        navigate("/vendor-login", {
          replace: true,
          state: {
            existingApplication: true,
            email: payload.email,
            message:
              data?.message ||
              "A vendor account already exists with this email/phone.",
          },
        });
        return;
      }

      throw new Error(data?.message || "Failed to submit cab registration.");
    } catch (err) {
      setError(err.message || "Failed to submit cab registration.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="cr-page">
      {/* SIDEBAR */}
      <aside className="cr-side">
        <div className="cr-brand">
          <span>BMT</span> Connect
        </div>

        <div className="cr-side-copy">
          <small>CAB OPERATOR</small>
          <h2>Register your cab with BirdMyTrip</h2>
          <p>
            Complete all details. Your profile will be submitted for admin
            approval to access the Cab Vendor Panel.
          </p>
        </div>

        <div className="cr-steps">
          {STEPS.map((label, i) => {
            const stepNum = i + 1;
            const isActive = step === stepNum;
            const isDone = step > stepNum;
            return (
              <div
                key={label}
                className={`cr-step ${isActive ? "active" : ""} ${
                  isDone ? "done" : ""
                }`}
                onClick={() => {
                  if (stepNum < step) setStep(stepNum);
                }}
              >
                <b>{isDone ? "✓" : stepNum}</b>
                <span>{label}</span>
              </div>
            );
          })}
        </div>

        <div className="cr-side-footer">
          <button type="button" className="cr-signout-btn" onClick={signOut}>
            <span>←</span> Sign out of BMT Connect
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="cr-main">
        <header className="cr-header">
          <div>
            <small>CAB VENDOR REGISTRATION</small>
            <h1>{STEPS[step - 1]}</h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div className="cr-progress">
              <span>{progress}% complete</span>
              <div>
                <i style={{ width: `${progress}%` }} />
              </div>
            </div>

            <button type="button" className="cr-signout-btn" onClick={signOut}>
              Sign out
            </button>
          </div>
        </header>

        <div className="cr-card">
          {error && <div className="cr-error-box">⚠️ {error}</div>}

          {/* =========================================================
              STEP 1: OWNER / VENDOR DETAILS
          ========================================================== */}
          {step === 1 && (
            <div>
              <div className="cr-title">
                <h2>🚕 1. Owner / Vendor Details</h2>
                <p>Provide verified contact and identity information of the cab owner.</p>
              </div>

              <div className="cr-grid">
                <div className="cr-field">
                  <label>
                    Full Name <span className="required-tag">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter owner full name"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                  />
                </div>

                <div className="cr-field">
                  <label>
                    Business / Company Name{" "}
                    <span className="optional-tag">Optional</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Speed Travels & Rentals"
                    value={form.companyName}
                    onChange={(e) => set("companyName", e.target.value)}
                  />
                </div>

                <div className="cr-field">
                  <label>
                    Mobile Number <span className="required-tag">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                  />
                </div>

                <div className="cr-field">
                  <label>
                    Alternate Mobile{" "}
                    <span className="optional-tag">Optional</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="Alternate contact number"
                    value={form.alternatePhone}
                    onChange={(e) => set("alternatePhone", e.target.value)}
                  />
                </div>

                <div className="cr-field">
                  <label>
                    Email Address <span className="required-tag">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="owner@example.com"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                  />
                </div>

                <div className="cr-field">
                  <label>
                    GST Number <span className="optional-tag">Optional</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 07AAAAA0000A1Z5"
                    value={form.gstNumber}
                    onChange={(e) =>
                      set("gstNumber", e.target.value.toUpperCase())
                    }
                  />
                </div>

                <div className="cr-field">
                  <label>
                    PAN Number <span className="required-tag">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ABCDE1234F"
                    maxLength={10}
                    value={form.panNumber}
                    onChange={(e) =>
                      set("panNumber", e.target.value.toUpperCase())
                    }
                  />
                </div>

                <div className="cr-field">
                  <label>
                    Aadhaar / Gov ID Number <span className="required-tag">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="12-digit Aadhaar or Govt ID"
                    value={form.aadhaarNumber}
                    onChange={(e) => set("aadhaarNumber", e.target.value)}
                  />
                </div>

                <div className="cr-field">
                  <label>
                    Account Password <span className="required-tag">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                  />
                </div>

                <div className="cr-field">
                  <label>
                    Confirm Password <span className="required-tag">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Re-enter password"
                    value={form.confirmPassword}
                    onChange={(e) => set("confirmPassword", e.target.value)}
                  />
                </div>

                <div className="cr-field wide">
                  <label>
                    Owner Profile Photo{" "}
                    <span className="optional-tag">Optional</span>
                  </label>
                  <div className="cr-upload-tile">
                    <div className="cr-upload-left">
                      {form.profilePhoto ? (
                        <img
                          src={form.profilePhoto}
                          alt="Profile Preview"
                          className="cr-upload-thumb"
                        />
                      ) : (
                        <div className="cr-upload-icon">👤</div>
                      )}
                      <div className="cr-upload-text">
                        <strong>
                          {form.profilePhotoName || "No photo chosen"}
                        </strong>
                        <small>Upload clear face photo (JPG, PNG)</small>
                      </div>
                    </div>
                    <div className="cr-upload-btn-wrap">
                      <label className="cr-upload-btn">
                        Upload Photo
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={(e) =>
                            handleFileUpload(
                              e,
                              "profilePhoto",
                              "profilePhotoName"
                            )
                          }
                        />
                      </label>
                      {form.profilePhoto && (
                        <button
                          type="button"
                          className="cr-upload-remove"
                          onClick={() =>
                            removeFile("profilePhoto", "profilePhotoName")
                          }
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              STEP 2: CAB DETAILS
          ========================================================== */}
          {step === 2 && (
            <div>
              <div className="cr-title">
                <h2>🚗 2. Cab Details</h2>
                <p>Register your vehicle specifications, registration and insurance.</p>
              </div>

              <div className="cr-grid">
                <div className="cr-field">
                  <label>
                    Vehicle Number <span className="required-tag">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. DL 01 AB 1234"
                    value={form.vehicleNumber}
                    onChange={(e) =>
                      set("vehicleNumber", e.target.value.toUpperCase())
                    }
                  />
                </div>

                <div className="cr-field">
                  <label>
                    Vehicle Type <span className="required-tag">*</span>
                  </label>
                  <select
                    value={form.vehicleType}
                    onChange={(e) => set("vehicleType", e.target.value)}
                  >
                    {VEHICLE_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="cr-field">
                  <label>
                    Vehicle Make / Brand <span className="required-tag">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Maruti Suzuki, Toyota, Hyundai"
                    value={form.vehicleMake}
                    onChange={(e) => set("vehicleMake", e.target.value)}
                  />
                </div>

                <div className="cr-field">
                  <label>
                    Vehicle Model <span className="required-tag">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dzire, Innova Crysta, Ertiga"
                    value={form.vehicleModel}
                    onChange={(e) => set("vehicleModel", e.target.value)}
                  />
                </div>

                <div className="cr-field">
                  <label>
                    Manufacturing Year <span className="required-tag">*</span>
                  </label>
                  <input
                    type="number"
                    min="2005"
                    max={new Date().getFullYear() + 1}
                    placeholder="e.g. 2022"
                    value={form.manufacturingYear}
                    onChange={(e) => set("manufacturingYear", e.target.value)}
                  />
                </div>

                <div className="cr-field">
                  <label>
                    Fuel Type <span className="required-tag">*</span>
                  </label>
                  <select
                    value={form.fuelType}
                    onChange={(e) => set("fuelType", e.target.value)}
                  >
                    {FUEL_TYPES.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="cr-field">
                  <label>
                    Seating Capacity (Excl. Driver){" "}
                    <span className="required-tag">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    placeholder="e.g. 4, 6, 7"
                    value={form.seatingCapacity}
                    onChange={(e) => set("seatingCapacity", e.target.value)}
                  />
                </div>

                <div className="cr-field">
                  <label>
                    AC / Non-AC <span className="required-tag">*</span>
                  </label>
                  <div className="cr-pills">
                    {["AC", "Non-AC"].map((ac) => (
                      <button
                        key={ac}
                        type="button"
                        className={`cr-pill ${
                          form.acType === ac ? "selected" : ""
                        }`}
                        onClick={() => set("acType", ac)}
                      >
                        {ac === "AC" ? "❄️ AC" : "💨 Non-AC"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="cr-field">
                  <label>
                    Vehicle Color <span className="optional-tag">Optional</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. White, Silver, Black"
                    value={form.vehicleColor}
                    onChange={(e) => set("vehicleColor", e.target.value)}
                  />
                </div>

                <div className="cr-field">
                  <label>
                    RC (Registration) Number{" "}
                    <span className="required-tag">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Registration certificate number"
                    value={form.rcNumber}
                    onChange={(e) =>
                      set("rcNumber", e.target.value.toUpperCase())
                    }
                  />
                </div>

                <div className="cr-field wide">
                  <label>
                    RC Document Upload <span className="required-tag">*</span>
                  </label>
                  <div className="cr-upload-tile">
                    <div className="cr-upload-left">
                      <div className="cr-upload-icon">📄</div>
                      <div className="cr-upload-text">
                        <strong>
                          {form.rcDocumentName || "No document uploaded"}
                        </strong>
                        <small>Upload clear RC copy (PDF, JPG, PNG)</small>
                      </div>
                    </div>
                    <div className="cr-upload-btn-wrap">
                      <label className="cr-upload-btn">
                        Upload RC
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          style={{ display: "none" }}
                          onChange={(e) =>
                            handleFileUpload(e, "rcDocument", "rcDocumentName")
                          }
                        />
                      </label>
                      {form.rcDocument && (
                        <button
                          type="button"
                          className="cr-upload-remove"
                          onClick={() =>
                            removeFile("rcDocument", "rcDocumentName")
                          }
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="cr-field">
                  <label>
                    Vehicle Insurance Policy Number{" "}
                    <span className="required-tag">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Insurance policy number"
                    value={form.insurancePolicyNumber}
                    onChange={(e) =>
                      set("insurancePolicyNumber", e.target.value)
                    }
                  />
                </div>

                <div className="cr-field">
                  <label>
                    Insurance Expiry Date{" "}
                    <span className="required-tag">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.insuranceExpiryDate}
                    onChange={(e) => set("insuranceExpiryDate", e.target.value)}
                  />
                </div>

                <div className="cr-field">
                  <label>
                    Permit Number <span className="optional-tag">Optional</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Taxi / Commercial permit number"
                    value={form.permitNumber}
                    onChange={(e) => set("permitNumber", e.target.value)}
                  />
                </div>

                <div className="cr-field">
                  <label>
                    Permit Expiry Date{" "}
                    <span className="optional-tag">Optional</span>
                  </label>
                  <input
                    type="date"
                    value={form.permitExpiryDate}
                    onChange={(e) => set("permitExpiryDate", e.target.value)}
                  />
                </div>

                <div className="cr-field wide">
                  <label>
                    Vehicle Photos (Front, Rear, Interior){" "}
                    <span className="required-tag">*</span>
                  </label>
                  <div className="cr-upload-tile">
                    <div className="cr-upload-left">
                      <div className="cr-upload-icon">🚗</div>
                      <div className="cr-upload-text">
                        <strong>
                          {form.vehiclePhotos.length
                            ? `${form.vehiclePhotos.length} photo(s) selected`
                            : "No photos uploaded yet"}
                        </strong>
                        <small>Upload 1 to 4 clear exterior and interior photos</small>
                      </div>
                    </div>
                    <div className="cr-upload-btn-wrap">
                      <label className="cr-upload-btn">
                        + Add Photos
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          style={{ display: "none" }}
                          onChange={(e) =>
                            handleFileUpload(
                              e,
                              "vehiclePhotos",
                              "vehiclePhotoNames",
                              true
                            )
                          }
                        />
                      </label>
                    </div>
                  </div>

                  {form.vehiclePhotos.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        marginTop: "12px",
                        flexWrap: "wrap",
                      }}
                    >
                      {form.vehiclePhotos.map((photo, idx) => (
                        <div
                          key={idx}
                          style={{
                            position: "relative",
                            width: "90px",
                            height: "70px",
                            borderRadius: "8px",
                            overflow: "hidden",
                            border: "1px solid #cbd5e1",
                          }}
                        >
                          <img
                            src={photo}
                            alt="Vehicle Preview"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              removeMultipleFile(
                                "vehiclePhotos",
                                "vehiclePhotoNames",
                                idx
                              )
                            }
                            style={{
                              position: "absolute",
                              top: 2,
                              right: 2,
                              background: "rgba(0,0,0,0.6)",
                              color: "#fff",
                              border: "none",
                              borderRadius: "50%",
                              width: "20px",
                              height: "20px",
                              cursor: "pointer",
                              display: "grid",
                              placeItems: "center",
                              fontSize: "12px",
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              STEP 3: DRIVER DETAILS
          ========================================================== */}
          {step === 3 && (
            <div>
              <div className="cr-title">
                <h2>👨✈️ 3. Driver Details</h2>
                <p>Add driver identity, licence credentials and verification documents.</p>
              </div>

              {/* OWNER-DRIVER CHECKBOX */}
              <label className="cr-driver-toggle-box">
                <input
                  type="checkbox"
                  checked={form.isOwnerDriver}
                  onChange={(e) => toggleOwnerDriver(e.target.checked)}
                />
                <div>
                  <h4>☑️ I am the driver</h4>
                  <p>
                    Tick this box if you (the owner) will personally drive this
                    cab. Owner contact info will be automatically synced.
                  </p>
                </div>
              </label>

              <div className="cr-grid">
                <div className="cr-field">
                  <label>
                    Driver Full Name <span className="required-tag">*</span>
                  </label>
                  <input
                    type="text"
                    disabled={form.isOwnerDriver}
                    placeholder="Enter driver's full name"
                    value={form.driverName}
                    onChange={(e) => set("driverName", e.target.value)}
                  />
                  {form.isOwnerDriver && (
                    <small>Auto-filled from Owner Details</small>
                  )}
                </div>

                <div className="cr-field">
                  <label>
                    Driver Mobile Number <span className="required-tag">*</span>
                  </label>
                  <input
                    type="tel"
                    disabled={form.isOwnerDriver}
                    placeholder="10-digit mobile number"
                    value={form.driverPhone}
                    onChange={(e) => set("driverPhone", e.target.value)}
                  />
                  {form.isOwnerDriver && (
                    <small>Auto-filled from Owner Details</small>
                  )}
                </div>

                <div className="cr-field">
                  <label>
                    Date of Birth <span className="optional-tag">Optional</span>
                  </label>
                  <input
                    type="date"
                    value={form.driverDob}
                    onChange={(e) => set("driverDob", e.target.value)}
                  />
                </div>

                <div className="cr-field">
                  <label>
                    Driving Experience (Years){" "}
                    <span className="optional-tag">Optional</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 5"
                    value={form.experienceYears}
                    onChange={(e) => set("experienceYears", e.target.value)}
                  />
                </div>

                <div className="cr-field">
                  <label>
                    Driving Licence Number{" "}
                    <span className="required-tag">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. DL-1420110012345"
                    value={form.drivingLicenceNumber}
                    onChange={(e) =>
                      set("drivingLicenceNumber", e.target.value.toUpperCase())
                    }
                  />
                </div>

                <div className="cr-field">
                  <label>
                    Licence Expiry Date <span className="required-tag">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.licenceExpiryDate}
                    onChange={(e) => set("licenceExpiryDate", e.target.value)}
                  />
                </div>

                <div className="cr-field wide">
                  <label>
                    Driving Licence Document{" "}
                    <span className="required-tag">*</span>
                  </label>
                  <div className="cr-upload-tile">
                    <div className="cr-upload-left">
                      <div className="cr-upload-icon">🪪</div>
                      <div className="cr-upload-text">
                        <strong>
                          {form.drivingLicenceDocumentName ||
                            "No document uploaded"}
                        </strong>
                        <small>Upload front/back of valid Commercial / LMV Driving Licence</small>
                      </div>
                    </div>
                    <div className="cr-upload-btn-wrap">
                      <label className="cr-upload-btn">
                        Upload Licence
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          style={{ display: "none" }}
                          onChange={(e) =>
                            handleFileUpload(
                              e,
                              "drivingLicenceDocument",
                              "drivingLicenceDocumentName"
                            )
                          }
                        />
                      </label>
                      {form.drivingLicenceDocument && (
                        <button
                          type="button"
                          className="cr-upload-remove"
                          onClick={() =>
                            removeFile(
                              "drivingLicenceDocument",
                              "drivingLicenceDocumentName"
                            )
                          }
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="cr-field">
                  <label>
                    Driver Photo <span className="required-tag">*</span>
                  </label>
                  <div className="cr-upload-tile">
                    <div className="cr-upload-left">
                      {form.driverPhoto ? (
                        <img
                          src={form.driverPhoto}
                          alt="Driver"
                          className="cr-upload-thumb"
                        />
                      ) : (
                        <div className="cr-upload-icon">👤</div>
                      )}
                      <div className="cr-upload-text">
                        <strong>
                          {form.driverPhotoName || "No photo chosen"}
                        </strong>
                        <small>Passport-size driver photo</small>
                      </div>
                    </div>
                    <div className="cr-upload-btn-wrap">
                      <label className="cr-upload-btn">
                        Upload Photo
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={(e) =>
                            handleFileUpload(
                              e,
                              "driverPhoto",
                              "driverPhotoName"
                            )
                          }
                        />
                      </label>
                      {form.driverPhoto && (
                        <button
                          type="button"
                          className="cr-upload-remove"
                          onClick={() =>
                            removeFile("driverPhoto", "driverPhotoName")
                          }
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="cr-field">
                  <label>
                    Police Verification Certificate{" "}
                    <span className="optional-tag">Optional</span>
                  </label>
                  <div className="cr-upload-tile">
                    <div className="cr-upload-left">
                      <div className="cr-upload-icon">🛡️</div>
                      <div className="cr-upload-text">
                        <strong>
                          {form.policeVerificationDocumentName ||
                            "Not provided"}
                        </strong>
                        <small>Police clearance or background check</small>
                      </div>
                    </div>
                    <div className="cr-upload-btn-wrap">
                      <label className="cr-upload-btn">
                        Upload PDF
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          style={{ display: "none" }}
                          onChange={(e) =>
                            handleFileUpload(
                              e,
                              "policeVerificationDocument",
                              "policeVerificationDocumentName"
                            )
                          }
                        />
                      </label>
                      {form.policeVerificationDocument && (
                        <button
                          type="button"
                          className="cr-upload-remove"
                          onClick={() =>
                            removeFile(
                              "policeVerificationDocument",
                              "policeVerificationDocumentName"
                            )
                          }
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              STEP 4: SERVICE / LOCATION DETAILS
          ========================================================== */}
          {step === 4 && (
            <div>
              <div className="cr-title">
                <h2>📍 4. Service / Location Details</h2>
                <p>Define your operating locations and available ride models.</p>
              </div>

              <div className="cr-grid">
                <div className="cr-field">
                  <label>
                    Operating City <span className="required-tag">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai, Delhi, Bengaluru"
                    value={form.operatingCity}
                    onChange={(e) => set("operatingCity", e.target.value)}
                  />
                </div>

                <div className="cr-field">
                  <label>
                    Operating State <span className="required-tag">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Maharashtra, Karnataka, Delhi NCR"
                    value={form.operatingState}
                    onChange={(e) => set("operatingState", e.target.value)}
                  />
                </div>

                <div className="cr-field wide">
                  <label>
                    Primary Pickup Location / Base Hub{" "}
                    <span className="required-tag">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Andheri East / Airport Taxi Stand"
                    value={form.pickupLocation}
                    onChange={(e) => set("pickupLocation", e.target.value)}
                  />
                </div>

                <div className="cr-field wide">
                  <label>
                    Service Areas & Coverage{" "}
                    <span className="required-tag">*</span>
                  </label>
                  <textarea
                    placeholder="e.g. Entire Mumbai Metropolitan Region, Navi Mumbai, Thane, Pune highway route"
                    value={form.serviceAreas}
                    onChange={(e) => set("serviceAreas", e.target.value)}
                  />
                </div>
              </div>

              <div style={{ marginTop: "24px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "800", marginBottom: "12px" }}>
                  Ride Services Offered
                </h3>

                <div className="cr-toggle-row">
                  <div className="cr-toggle-info">
                    <h4>Airport Transfer</h4>
                    <p>Pickups and drops to/from city airport terminals</p>
                  </div>
                  <div className="cr-toggle-btns">
                    <button
                      type="button"
                      className={`cr-toggle-btn ${
                        form.airportTransfer ? "active-yes" : ""
                      }`}
                      onClick={() => set("airportTransfer", true)}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      className={`cr-toggle-btn ${
                        !form.airportTransfer ? "active-no" : ""
                      }`}
                      onClick={() => set("airportTransfer", false)}
                    >
                      No
                    </button>
                  </div>
                </div>

                <div className="cr-toggle-row">
                  <div className="cr-toggle-info">
                    <h4>Outstation Service</h4>
                    <p>Intercity one-way and round trips</p>
                  </div>
                  <div className="cr-toggle-btns">
                    <button
                      type="button"
                      className={`cr-toggle-btn ${
                        form.outstationService ? "active-yes" : ""
                      }`}
                      onClick={() => set("outstationService", true)}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      className={`cr-toggle-btn ${
                        !form.outstationService ? "active-no" : ""
                      }`}
                      onClick={() => set("outstationService", false)}
                    >
                      No
                    </button>
                  </div>
                </div>

                <div className="cr-toggle-row">
                  <div className="cr-toggle-info">
                    <h4>Local / Hourly Rental Service</h4>
                    <p>Half-day, full-day, and multi-hour intra-city packages</p>
                  </div>
                  <div className="cr-toggle-btns">
                    <button
                      type="button"
                      className={`cr-toggle-btn ${
                        form.localRentalService ? "active-yes" : ""
                      }`}
                      onClick={() => set("localRentalService", true)}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      className={`cr-toggle-btn ${
                        !form.localRentalService ? "active-no" : ""
                      }`}
                      onClick={() => set("localRentalService", false)}
                    >
                      No
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              STEP 5: BANK / PAYMENT DETAILS
          ========================================================== */}
          {step === 5 && (
            <div>
              <div className="cr-title">
                <h2>💰 5. Bank / Payment Details</h2>
                <p>Direct bank account credentials for weekly trip payouts and settlements.</p>
              </div>

              <div className="cr-grid">
                <div className="cr-field">
                  <label>
                    Account Holder Name <span className="required-tag">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Name exactly as per bank records"
                    value={form.accountHolderName}
                    onChange={(e) => set("accountHolderName", e.target.value)}
                  />
                </div>

                <div className="cr-field">
                  <label>
                    Bank Name <span className="required-tag">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. State Bank of India, HDFC Bank"
                    value={form.bankName}
                    onChange={(e) => set("bankName", e.target.value)}
                  />
                </div>

                <div className="cr-field">
                  <label>
                    Account Number <span className="required-tag">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Enter bank account number"
                    value={form.accountNumber}
                    onChange={(e) => set("accountNumber", e.target.value)}
                  />
                </div>

                <div className="cr-field">
                  <label>
                    Confirm Account Number{" "}
                    <span className="required-tag">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Re-enter bank account number"
                    value={form.confirmAccountNumber}
                    onChange={(e) =>
                      set("confirmAccountNumber", e.target.value)
                    }
                  />
                </div>

                <div className="cr-field">
                  <label>
                    IFSC Code <span className="required-tag">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SBIN0001234"
                    maxLength={11}
                    value={form.ifscCode}
                    onChange={(e) =>
                      set("ifscCode", e.target.value.toUpperCase())
                    }
                  />
                </div>

                <div className="cr-field">
                  <label>
                    UPI ID <span className="optional-tag">Optional</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. vendor@okhdfcbank"
                    value={form.upiId}
                    onChange={(e) => set("upiId", e.target.value)}
                  />
                </div>

                <div className="cr-field wide">
                  <label>
                    Cancelled Cheque / Bank Passbook Proof{" "}
                    <span className="optional-tag">Optional</span>
                  </label>
                  <div className="cr-upload-tile">
                    <div className="cr-upload-left">
                      <div className="cr-upload-icon">🏦</div>
                      <div className="cr-upload-text">
                        <strong>
                          {form.cancelledChequeName || "No proof attached"}
                        </strong>
                        <small>Upload photo of cancelled cheque or front page of passbook</small>
                      </div>
                    </div>
                    <div className="cr-upload-btn-wrap">
                      <label className="cr-upload-btn">
                        Upload Cheque
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          style={{ display: "none" }}
                          onChange={(e) =>
                            handleFileUpload(
                              e,
                              "cancelledCheque",
                              "cancelledChequeName"
                            )
                          }
                        />
                      </label>
                      {form.cancelledCheque && (
                        <button
                          type="button"
                          className="cr-upload-remove"
                          onClick={() =>
                            removeFile("cancelledCheque", "cancelledChequeName")
                          }
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              STEP 6: DOCUMENTS
          ========================================================== */}
          {step === 6 && (
            <div>
              <div className="cr-title">
                <h2>📄 6. Documents Checklist</h2>
                <p>
                  Verify all regulatory and identity documents. Files already uploaded in earlier steps are automatically synced.
                </p>
              </div>

              <div className="cr-doc-grid">
                {/* 1. Owner ID Proof */}
                <div className="cr-doc-card">
                  <div className="cr-doc-header">
                    <div>
                      <h4>Owner ID Proof</h4>
                      <small style={{ color: "#64748b" }}>
                        Aadhaar, Passport or Voter ID
                      </small>
                    </div>
                    <span
                      className={`cr-badge ${
                        form.ownerIdProof ? "uploaded" : "required"
                      }`}
                    >
                      {form.ownerIdProof ? "Uploaded ✓" : "Required"}
                    </span>
                  </div>
                  <div className="cr-upload-tile">
                    <div className="cr-upload-left">
                      <div className="cr-upload-icon">🪪</div>
                      <div className="cr-upload-text">
                        <strong>
                          {form.ownerIdProofName || "Not uploaded"}
                        </strong>
                      </div>
                    </div>
                    <div className="cr-upload-btn-wrap">
                      <label className="cr-upload-btn">
                        {form.ownerIdProof ? "Change" : "Upload"}
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          style={{ display: "none" }}
                          onChange={(e) =>
                            handleFileUpload(
                              e,
                              "ownerIdProof",
                              "ownerIdProofName"
                            )
                          }
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* 2. PAN Card */}
                <div className="cr-doc-card">
                  <div className="cr-doc-header">
                    <div>
                      <h4>PAN Card</h4>
                      <small style={{ color: "#64748b" }}>
                        Owner or business PAN card
                      </small>
                    </div>
                    <span
                      className={`cr-badge ${
                        form.panCardDocument ? "uploaded" : "required"
                      }`}
                    >
                      {form.panCardDocument ? "Uploaded ✓" : "Required"}
                    </span>
                  </div>
                  <div className="cr-upload-tile">
                    <div className="cr-upload-left">
                      <div className="cr-upload-icon">💳</div>
                      <div className="cr-upload-text">
                        <strong>
                          {form.panCardDocumentName || "Not uploaded"}
                        </strong>
                      </div>
                    </div>
                    <div className="cr-upload-btn-wrap">
                      <label className="cr-upload-btn">
                        {form.panCardDocument ? "Change" : "Upload"}
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          style={{ display: "none" }}
                          onChange={(e) =>
                            handleFileUpload(
                              e,
                              "panCardDocument",
                              "panCardDocumentName"
                            )
                          }
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* 3. RC Document */}
                <div className="cr-doc-card">
                  <div className="cr-doc-header">
                    <div>
                      <h4>Vehicle RC</h4>
                      <small style={{ color: "#64748b" }}>
                        Registration Certificate
                      </small>
                    </div>
                    <span
                      className={`cr-badge ${
                        form.rcDocument ? "uploaded" : "required"
                      }`}
                    >
                      {form.rcDocument ? "Uploaded ✓" : "Required"}
                    </span>
                  </div>
                  <div className="cr-upload-tile">
                    <div className="cr-upload-left">
                      <div className="cr-upload-icon">🚗</div>
                      <div className="cr-upload-text">
                        <strong>{form.rcDocumentName || "Not uploaded"}</strong>
                      </div>
                    </div>
                    <div className="cr-upload-btn-wrap">
                      <label className="cr-upload-btn">
                        {form.rcDocument ? "Change" : "Upload"}
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          style={{ display: "none" }}
                          onChange={(e) =>
                            handleFileUpload(e, "rcDocument", "rcDocumentName")
                          }
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* 4. Vehicle Insurance */}
                <div className="cr-doc-card">
                  <div className="cr-doc-header">
                    <div>
                      <h4>Vehicle Insurance Policy</h4>
                      <small style={{ color: "#64748b" }}>
                        Commercial vehicle insurance
                      </small>
                    </div>
                    <span
                      className={`cr-badge ${
                        form.insuranceDocument ? "uploaded" : "required"
                      }`}
                    >
                      {form.insuranceDocument ? "Uploaded ✓" : "Required"}
                    </span>
                  </div>
                  <div className="cr-upload-tile">
                    <div className="cr-upload-left">
                      <div className="cr-upload-icon">🛡️</div>
                      <div className="cr-upload-text">
                        <strong>
                          {form.insuranceDocumentName || "Not uploaded"}
                        </strong>
                      </div>
                    </div>
                    <div className="cr-upload-btn-wrap">
                      <label className="cr-upload-btn">
                        {form.insuranceDocument ? "Change" : "Upload"}
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          style={{ display: "none" }}
                          onChange={(e) =>
                            handleFileUpload(
                              e,
                              "insuranceDocument",
                              "insuranceDocumentName"
                            )
                          }
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* 5. Driving Licence */}
                <div className="cr-doc-card">
                  <div className="cr-doc-header">
                    <div>
                      <h4>Driving Licence</h4>
                      <small style={{ color: "#64748b" }}>
                        Commercial / LMV Driving licence
                      </small>
                    </div>
                    <span
                      className={`cr-badge ${
                        form.drivingLicenceDocument ? "uploaded" : "required"
                      }`}
                    >
                      {form.drivingLicenceDocument ? "Uploaded ✓" : "Required"}
                    </span>
                  </div>
                  <div className="cr-upload-tile">
                    <div className="cr-upload-left">
                      <div className="cr-upload-icon">🪪</div>
                      <div className="cr-upload-text">
                        <strong>
                          {form.drivingLicenceDocumentName || "Not uploaded"}
                        </strong>
                      </div>
                    </div>
                    <div className="cr-upload-btn-wrap">
                      <label className="cr-upload-btn">
                        {form.drivingLicenceDocument ? "Change" : "Upload"}
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          style={{ display: "none" }}
                          onChange={(e) =>
                            handleFileUpload(
                              e,
                              "drivingLicenceDocument",
                              "drivingLicenceDocumentName"
                            )
                          }
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* 6. Permit Document */}
                <div className="cr-doc-card">
                  <div className="cr-doc-header">
                    <div>
                      <h4>Commercial Permit</h4>
                      <small style={{ color: "#64748b" }}>
                        Taxi or All-India tourist permit
                      </small>
                    </div>
                    <span
                      className={`cr-badge ${
                        form.permitDocument ? "uploaded" : "optional"
                      }`}
                    >
                      {form.permitDocument ? "Uploaded ✓" : "Optional"}
                    </span>
                  </div>
                  <div className="cr-upload-tile">
                    <div className="cr-upload-left">
                      <div className="cr-upload-icon">📑</div>
                      <div className="cr-upload-text">
                        <strong>
                          {form.permitDocumentName || "Not uploaded"}
                        </strong>
                      </div>
                    </div>
                    <div className="cr-upload-btn-wrap">
                      <label className="cr-upload-btn">
                        {form.permitDocument ? "Change" : "Upload"}
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          style={{ display: "none" }}
                          onChange={(e) =>
                            handleFileUpload(
                              e,
                              "permitDocument",
                              "permitDocumentName"
                            )
                          }
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              STEP 7: REVIEW & SUBMIT
          ========================================================== */}
          {step === 7 && (
            <div>
              <div className="cr-title">
                <h2>📋 7. Review & Submit for Approval</h2>
                <p>
                  Review your cab registration details before submitting. Once submitted, your profile will be sent to the BMT Admin team for review and approval.
                </p>
              </div>

              {/* SECTION 1 REVIEW */}
              <div className="cr-review-card">
                <div className="cr-review-header">
                  <h3>🚕 Owner / Vendor Details</h3>
                  <button
                    type="button"
                    className="cr-review-edit-btn"
                    onClick={() => setStep(1)}
                  >
                    Edit Step
                  </button>
                </div>
                <div className="cr-review-body">
                  <div className="cr-review-item">
                    <small>Full Name</small>
                    <strong>{form.name}</strong>
                  </div>
                  <div className="cr-review-item">
                    <small>Business / Company</small>
                    <strong>{form.companyName || "N/A"}</strong>
                  </div>
                  <div className="cr-review-item">
                    <small>Mobile Number</small>
                    <strong>{form.phone}</strong>
                  </div>
                  <div className="cr-review-item">
                    <small>Email</small>
                    <strong>{form.email}</strong>
                  </div>
                  <div className="cr-review-item">
                    <small>PAN Number</small>
                    <strong>{form.panNumber}</strong>
                  </div>
                  <div className="cr-review-item">
                    <small>Aadhaar / ID</small>
                    <strong>{form.aadhaarNumber}</strong>
                  </div>
                  <div className="cr-review-item">
                    <small>GST Number</small>
                    <strong>{form.gstNumber || "N/A"}</strong>
                  </div>
                </div>
              </div>

              {/* SECTION 2 REVIEW */}
              <div className="cr-review-card">
                <div className="cr-review-header">
                  <h3>🚗 Cab Details</h3>
                  <button
                    type="button"
                    className="cr-review-edit-btn"
                    onClick={() => setStep(2)}
                  >
                    Edit Step
                  </button>
                </div>
                <div className="cr-review-body">
                  <div className="cr-review-item">
                    <small>Vehicle Number</small>
                    <strong>{form.vehicleNumber}</strong>
                  </div>
                  <div className="cr-review-item">
                    <small>Type & Model</small>
                    <strong>
                      {form.vehicleType} · {form.vehicleMake} {form.vehicleModel}
                    </strong>
                  </div>
                  <div className="cr-review-item">
                    <small>Manufacturing Year</small>
                    <strong>{form.manufacturingYear}</strong>
                  </div>
                  <div className="cr-review-item">
                    <small>Fuel & AC</small>
                    <strong>
                      {form.fuelType} · {form.acType}
                    </strong>
                  </div>
                  <div className="cr-review-item">
                    <small>Seating Capacity</small>
                    <strong>{form.seatingCapacity} seats</strong>
                  </div>
                  <div className="cr-review-item">
                    <small>RC Number</small>
                    <strong>{form.rcNumber}</strong>
                  </div>
                  <div className="cr-review-item">
                    <small>Insurance Policy</small>
                    <strong>
                      {form.insurancePolicyNumber} (Exp:{" "}
                      {form.insuranceExpiryDate})
                    </strong>
                  </div>
                  <div className="cr-review-item">
                    <small>Photos</small>
                    <strong>{form.vehiclePhotos.length} uploaded</strong>
                  </div>
                </div>
              </div>

              {/* SECTION 3 REVIEW */}
              <div className="cr-review-card">
                <div className="cr-review-header">
                  <h3>👨✈️ Driver Details</h3>
                  <button
                    type="button"
                    className="cr-review-edit-btn"
                    onClick={() => setStep(3)}
                  >
                    Edit Step
                  </button>
                </div>
                <div className="cr-review-body">
                  <div className="cr-review-item">
                    <small>Role</small>
                    <strong>
                      {form.isOwnerDriver
                        ? "Owner is Driver (Self)"
                        : "Employed Driver"}
                    </strong>
                  </div>
                  <div className="cr-review-item">
                    <small>Driver Name</small>
                    <strong>
                      {form.isOwnerDriver ? form.name : form.driverName}
                    </strong>
                  </div>
                  <div className="cr-review-item">
                    <small>Driver Mobile</small>
                    <strong>
                      {form.isOwnerDriver ? form.phone : form.driverPhone}
                    </strong>
                  </div>
                  <div className="cr-review-item">
                    <small>Licence Number</small>
                    <strong>{form.drivingLicenceNumber}</strong>
                  </div>
                  <div className="cr-review-item">
                    <small>Licence Expiry</small>
                    <strong>{form.licenceExpiryDate}</strong>
                  </div>
                  <div className="cr-review-item">
                    <small>Experience</small>
                    <strong>
                      {form.experienceYears
                        ? `${form.experienceYears} Years`
                        : "N/A"}
                    </strong>
                  </div>
                </div>
              </div>

              {/* SECTION 4 REVIEW */}
              <div className="cr-review-card">
                <div className="cr-review-header">
                  <h3>📍 Service & Operations</h3>
                  <button
                    type="button"
                    className="cr-review-edit-btn"
                    onClick={() => setStep(4)}
                  >
                    Edit Step
                  </button>
                </div>
                <div className="cr-review-body">
                  <div className="cr-review-item">
                    <small>Operating Location</small>
                    <strong>
                      {form.operatingCity}, {form.operatingState}
                    </strong>
                  </div>
                  <div className="cr-review-item">
                    <small>Base Pickup Hub</small>
                    <strong>{form.pickupLocation}</strong>
                  </div>
                  <div className="cr-review-item">
                    <small>Services Offered</small>
                    <strong>
                      {[
                        form.airportTransfer && "Airport",
                        form.outstationService && "Outstation",
                        form.localRentalService && "Hourly Rental",
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </strong>
                  </div>
                </div>
              </div>

              {/* SECTION 5 REVIEW */}
              <div className="cr-review-card">
                <div className="cr-review-header">
                  <h3>💰 Bank Details</h3>
                  <button
                    type="button"
                    className="cr-review-edit-btn"
                    onClick={() => setStep(5)}
                  >
                    Edit Step
                  </button>
                </div>
                <div className="cr-review-body">
                  <div className="cr-review-item">
                    <small>Account Holder</small>
                    <strong>{form.accountHolderName}</strong>
                  </div>
                  <div className="cr-review-item">
                    <small>Bank & Account</small>
                    <strong>
                      {form.bankName} · ••••{form.accountNumber.slice(-4)}
                    </strong>
                  </div>
                  <div className="cr-review-item">
                    <small>IFSC Code</small>
                    <strong>{form.ifscCode}</strong>
                  </div>
                  <div className="cr-review-item">
                    <small>UPI ID</small>
                    <strong>{form.upiId || "N/A"}</strong>
                  </div>
                </div>
              </div>

              {/* IMPORTANT MANDATORY APPROVAL NOTICE */}
              <div className="cr-notice-box">
                <span style={{ fontSize: "24px" }}>🔒</span>
                <div>
                  <strong>Mandatory Form Submission & Admin Verification</strong>
                  <p>
                    Without completing and submitting this full form, your application cannot move to the vendor approval stage. Once submitted, your registration will be reviewed by the BMT Connect Operations team. You will be redirected to the sign-in page, and upon approval, your account will be activated with full dashboard access.
                  </p>
                </div>
              </div>

              {/* SUPPLIER AGREEMENT */}
              <label className="cr-agreement">
                <input
                  type="checkbox"
                  checked={form.contractAccepted}
                  onChange={(e) => set("contractAccepted", e.target.checked)}
                />
                <span>
                  I hereby confirm that all owner, cab, driver and banking information submitted above is true, accurate and legally compliant. I agree to the BMT Connect Supplier Terms & Conditions.
                </span>
              </label>
            </div>
          )}
        </div>

        {/* STICKY FOOTER */}
        <footer className="cr-footer">
          <div className="cr-footer-step">
            Step {step} of {STEPS.length}: <b>{STEPS[step - 1]}</b>
          </div>

          <div className="cr-footer-actions">
            {step > 1 && (
              <button
                type="button"
                className="cr-btn-back"
                disabled={saving}
                onClick={prev}
              >
                ← Back
              </button>
            )}

            <button
              type="button"
              className="cr-btn-next"
              disabled={saving}
              onClick={next}
            >
              {saving
                ? "Submitting Application..."
                : step === STEPS.length
                ? "Submit for Vendor Approval ➔"
                : "Continue ➔"}
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}