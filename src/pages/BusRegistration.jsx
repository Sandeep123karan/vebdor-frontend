import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./BusRegistration.css";

const API_BASE = process.env.REACT_APP_API_URL || "https://bmtvendorfinal.onrender.com";
const SIGNUP_URL = `${API_BASE}/api/vendor/auth/signup`;

const STEPS = [
  "Account",
  "Operator",
  "Business",
  "Office",
  "Fleet",
  "Operations",
  "Compliance",
  "Bank & Tax",
  "Review",
];

const OPERATOR_TYPES = [
  ["intercity-bus-operator", "Intercity Bus Operator"],
  ["tourist-bus-operator", "Tourist Bus Operator"],
  ["shuttle-operator", "Shuttle Operator"],
  ["sleeper-bus-operator", "Sleeper Bus Operator"],
  ["luxury-coach-operator", "Luxury Coach Operator"],
];

const EMPTY = {
  name: "", email: "", phone: "", password: "", confirmPassword: "",
  operatorType: "", businessName: "", legalBusinessName: "", tradeName: "", businessType: "transport-operator",
  businessRegistrationNumber: "", businessLicenseNumber: "", website: "", yearsInBusiness: "",
  ownerDesignation: "", alternatePhone: "", supportEmail: "", emergencyPhone: "",
  country: "India", state: "", city: "", district: "", postalCode: "", addressLine1: "", addressLine2: "",
  landmark: "", timezone: "Asia/Kolkata",
  fleetSize: "", fleetOwnership: "owned", busConfiguration: "mixed", acConfiguration: "mixed",
  singleDeckCount: "", doubleDeckCount: "", seaterCount: "", sleeperCount: "", mixedBusCount: "",
  gpsTracking: true, liveTrackingProvider: "", ownWorkshop: false, operatingRegions: "",
  primaryOrigin: "", primaryDestination: "", intermediateStops: "", boardingPoints: "", dropPoints: "",
  operationPattern: "daily", tripsPerDay: "", serviceStartTime: "", serviceEndTime: "",
  advanceBookingDays: "30", cancellationPolicy: "", noShowPolicy: "", luggagePolicy: "",
  operatorLicenseNumber: "", operatorLicenseExpiry: "", permitNumber: "", permitExpiry: "",
  insuranceNumber: "", insuranceExpiry: "", fitnessCertificateNumber: "", fitnessExpiry: "",
  pucNumber: "", pucExpiry: "", gstCertificateNumber: "", emergencyContactName: "",
  bankCountry: "India", bankCurrency: "INR", settlementCurrency: "INR", bankName: "", branchName: "",
  accountHolderName: "", accountNumber: "", confirmAccountNumber: "", ifscCode: "", iban: "", swiftCode: "",
  taxType: "GST", taxRegistrationNumber: "", gstNumber: "", panNumber: "",
  contractAccepted: false,
};

export default function BusRegistration() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const signOut = () => {
    const ok = window.confirm(
      "Are you sure you want to sign out of BMT Connect?"
    );

    if (!ok) return;

    // Partner session
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Pre-registration vertical/session state
    localStorage.removeItem("selectedVertical");
    localStorage.removeItem("partnerSelectedVertical");
    localStorage.removeItem("selectedService");
    localStorage.removeItem("service");

    // Never leave an old Vendor session behind
    localStorage.removeItem("vendorToken");
    localStorage.removeItem("vendorUser");

    // Any password temporarily kept by an earlier flow
    sessionStorage.removeItem("bmtPartnerPassword");
    sessionStorage.removeItem("partnerPassword");
    sessionStorage.removeItem("password");

    navigate("/signin", { replace: true });
  };

  const progress = Math.round((step / STEPS.length) * 100);
  const set = (key, value) => { setForm(p => ({ ...p, [key]: value })); setError(""); };
  const operatorLabel = useMemo(() => OPERATOR_TYPES.find(([id]) => id === form.operatorType)?.[1] || "", [form.operatorType]);

  const validate = () => {
    if (step === 1) {
      if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) return "Name, email and phone are required.";
      if (form.password.length < 8) return "Password must be at least 8 characters.";
      if (form.password !== form.confirmPassword) return "Passwords do not match.";
    }
    if (step === 2 && !form.operatorType) return "Please select your bus operator type.";
    if (step === 3 && !form.businessName.trim()) return "Business / operator name is required.";
    if (step === 4 && (!form.addressLine1.trim() || !form.city.trim() || !form.state.trim())) return "Office address, city and state are required.";
    if (step === 5 && (!form.fleetSize || Number(form.fleetSize) < 1)) return "Please enter your fleet size.";
    if (step === 8) {
      if (!form.accountHolderName.trim() || !form.bankName.trim()) return "Bank name and account holder are required.";
      if (form.accountNumber && form.confirmAccountNumber && form.accountNumber !== form.confirmAccountNumber) return "Account numbers do not match.";
    }
    if (step === 9 && !form.contractAccepted) return "Please accept the BMT Connect supplier agreement.";
    return "";
  };

  const next = () => {
    const e = validate();
    if (e) return setError(e);
    if (step < STEPS.length) return setStep(s => s + 1);
    submit();
  };

  const submit = async () => {
    const e = validate();
    if (e) return setError(e);
    setSaving(true); setError("");
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        businessEmail: form.email.trim().toLowerCase(),
        phone: form.phone.trim(), businessPhone: form.phone.trim(), password: form.password,
        vertical: "bus", selectedVertical: "bus", service: "bus", services: ["bus"],
        subtype: form.operatorType,
        businessType: form.businessType,
        businessName: form.businessName.trim(), companyName: form.businessName.trim(),
        legalBusinessName: form.legalBusinessName.trim(), tradeName: form.tradeName.trim(),
        businessRegistrationNumber: form.businessRegistrationNumber.trim(),
        businessLicenseNumber: form.businessLicenseNumber.trim(), website: form.website.trim(),
        country: form.country, state: form.state.trim(), city: form.city.trim(), district: form.district.trim(),
        postalCode: form.postalCode.trim(), pincode: form.postalCode.trim(),
        address: form.addressLine1.trim(), addressLine1: form.addressLine1.trim(),
        addressLine2: form.addressLine2.trim(), landmark: form.landmark.trim(), timezone: form.timezone,
        alternatePhone: form.alternatePhone.trim(), supportEmail: form.supportEmail.trim(),
        bankCountry: form.bankCountry, bankCurrency: form.bankCurrency, settlementCurrency: form.settlementCurrency,
        bankName: form.bankName.trim(), branchName: form.branchName.trim(),
        accountHolderName: form.accountHolderName.trim(), accountNumber: form.accountNumber.trim(),
        ifscCode: form.ifscCode.trim(), iban: form.iban.trim(), swiftCode: form.swiftCode.trim(),
        taxType: form.taxType, taxRegistrationNumber: form.taxRegistrationNumber.trim(),
        gstNumber: form.gstNumber.trim(), panNumber: form.panNumber.trim(),
        onboardingStatus: "submitted", onboardingComplete: true, onboardingStep: STEPS.length, onboardingProgress: 100,
        busDetails: {
          operatorType: form.operatorType,
          operatorName: form.businessName.trim(),
          legalOperatorName: form.legalBusinessName.trim(),
          tradeName: form.tradeName.trim(),
          yearsInBusiness: Number(form.yearsInBusiness || 0),
          ownerDesignation: form.ownerDesignation.trim(),
          contacts: {
            primaryPhone: form.phone.trim(),
            alternatePhone: form.alternatePhone.trim(),
            supportEmail: form.supportEmail.trim(),
            emergencyPhone: form.emergencyPhone.trim(),
            emergencyContactName: form.emergencyContactName.trim(),
          },
          office: {
            country: form.country, state: form.state.trim(), city: form.city.trim(),
            district: form.district.trim(), postalCode: form.postalCode.trim(),
            addressLine1: form.addressLine1.trim(), addressLine2: form.addressLine2.trim(),
            landmark: form.landmark.trim(), timezone: form.timezone,
          },
          fleet: {
            totalBuses: Number(form.fleetSize || 0),
            ownershipType: form.fleetOwnership,
            busConfiguration: form.busConfiguration,
            acConfiguration: form.acConfiguration,
            singleDeckCount: Number(form.singleDeckCount || 0),
            doubleDeckCount: Number(form.doubleDeckCount || 0),
            seaterCount: Number(form.seaterCount || 0),
            sleeperCount: Number(form.sleeperCount || 0),
            mixedBusCount: Number(form.mixedBusCount || 0),
            hasGpsTracking: Boolean(form.gpsTracking),
            liveTrackingProvider: form.liveTrackingProvider.trim(),
            ownWorkshop: Boolean(form.ownWorkshop),
          },
          operations: {
            operatingRegions: form.operatingRegions.split(",").map(v => v.trim()).filter(Boolean),
            primaryOrigin: form.primaryOrigin.trim(),
            primaryDestination: form.primaryDestination.trim(),
            intermediateStops: form.intermediateStops.split(",").map(v => v.trim()).filter(Boolean),
            boardingPoints: form.boardingPoints.split(",").map(v => v.trim()).filter(Boolean),
            dropPoints: form.dropPoints.split(",").map(v => v.trim()).filter(Boolean),
            operationPattern: form.operationPattern,
            tripsPerDay: Number(form.tripsPerDay || 0),
            serviceStartTime: form.serviceStartTime,
            serviceEndTime: form.serviceEndTime,
            advanceBookingDays: Number(form.advanceBookingDays || 0),
            cancellationPolicy: form.cancellationPolicy.trim(),
            noShowPolicy: form.noShowPolicy.trim(),
            luggagePolicy: form.luggagePolicy.trim(),
          },
          compliance: {
            operatorLicenseNumber: form.operatorLicenseNumber.trim(),
            operatorLicenseExpiry: form.operatorLicenseExpiry || null,
            permitNumber: form.permitNumber.trim(), permitExpiry: form.permitExpiry || null,
            insuranceNumber: form.insuranceNumber.trim(), insuranceExpiry: form.insuranceExpiry || null,
            fitnessCertificateNumber: form.fitnessCertificateNumber.trim(), fitnessExpiry: form.fitnessExpiry || null,
            pucNumber: form.pucNumber.trim(), pucExpiry: form.pucExpiry || null,
            gstCertificateNumber: form.gstCertificateNumber.trim(),
          },
        },
        applicationMeta: {
          supplierSubtype: form.operatorType,
          contractAccepted: form.contractAccepted,
          contractAcceptedAt: new Date().toISOString(),
          busOperator: {
            operatorType: form.operatorType,
            fleetSize: Number(form.fleetSize || 0),
            fleetOwnership: form.fleetOwnership,
            busConfiguration: form.busConfiguration,
            acConfiguration: form.acConfiguration,
            gpsTracking: Boolean(form.gpsTracking),
            primaryOrigin: form.primaryOrigin.trim(),
            primaryDestination: form.primaryDestination.trim(),
          }
        }
      };

      const res = await fetch(SIGNUP_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json().catch(() => ({}));
      if (res.status === 201 && data?.success) {
        localStorage.removeItem("vendorToken"); localStorage.removeItem("vendorUser");
        navigate("/vendor-login", { replace: true, state: { applicationSubmitted: true, email: payload.email, status: "PENDING", vertical: "bus" } });
        return;
      }
      if (res.status === 409) {
        navigate("/vendor-login", { replace: true, state: { existingApplication: true, email: payload.email, message: data?.message || "A vendor application already exists for these credentials." } });
        return;
      }
      throw new Error(data?.message || "Unable to submit bus operator registration.");
    } catch (err) { setError(err.message || "Unable to submit registration."); }
    finally { setSaving(false); }
  };

  return (
    <div className="br-page">
      <aside className="br-side">
        <div className="br-brand"><span>BMT</span> Connect</div>
        <div className="br-side-copy"><small>BUS OPERATOR</small><h2>Grow your bus business with BirdMyTrip</h2><p>Register once. After approval, manage fleet, routes, trips, crew, boarding and settlements from one panel.</p></div>
        <div className="br-steps">{STEPS.map((label, i) => <div key={label} className={`br-step ${step===i+1?"active":""} ${step>i+1?"done":""}`}><b>{step>i+1?"✓":i+1}</b><span>{label}</span></div>)}</div>
      </aside>

      <main className="br-main">
        <header className="br-header">
          <div>
            <small>BUS OPERATOR REGISTRATION</small>
            <h1>{STEPS[step - 1]}</h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div className="br-progress">
              <span>{progress}% complete</span>
              <div>
                <i style={{ width: `${progress}%` }} />
              </div>
            </div>

            <button
              type="button"
              onClick={signOut}
              disabled={saving}
              style={{
                minHeight: "42px",
                padding: "0 16px",
                borderRadius: "10px",
                border: "1px solid #e5e7eb",
                background: "#ffffff",
                color: "#374151",
                fontWeight: 700,
                cursor: saving ? "not-allowed" : "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Sign out
            </button>
          </div>
        </header>
        <section className="br-card">
          {error && <div className="br-error">{error}</div>}
          {step === 1 && <><Title title="Create your operator account" text="These credentials will be used for Vendor Sign-In after admin approval."/><Grid><Field label="Owner / authorized person" value={form.name} onChange={v=>set("name",v)}/><Field label="Business email" type="email" value={form.email} onChange={v=>set("email",v)}/><Field label="Phone" value={form.phone} onChange={v=>set("phone",v)}/><Field label="Password" type="password" value={form.password} onChange={v=>set("password",v)}/><Field label="Confirm password" type="password" value={form.confirmPassword} onChange={v=>set("confirmPassword",v)}/></Grid></>}
          {step === 2 && <><Title title="What kind of bus operator are you?" text="Choose the option that best describes your primary operation."/><div className="br-options">{OPERATOR_TYPES.map(([id,label])=><button type="button" key={id} className={form.operatorType===id?"selected":""} onClick={()=>set("operatorType",id)}><span>🚌</span><strong>{label}</strong><small>{id}</small></button>)}</div></>}
          {step === 3 && <><Title title="Business information" text="Enter the legal and public details of your bus operation."/><Grid><Field label="Operator / business name" value={form.businessName} onChange={v=>set("businessName",v)}/><Field label="Legal business name" value={form.legalBusinessName} onChange={v=>set("legalBusinessName",v)}/><Field label="Trade / brand name" value={form.tradeName} onChange={v=>set("tradeName",v)}/><Select label="Business type" value={form.businessType} onChange={v=>set("businessType",v)} options={[["transport-operator","Transport Operator"],["sole-proprietorship","Sole Proprietorship"],["partnership","Partnership"],["private-limited","Private Company"],["company","Company"]]}/><Field label="Registration number" value={form.businessRegistrationNumber} onChange={v=>set("businessRegistrationNumber",v)}/><Field label="Business licence number" value={form.businessLicenseNumber} onChange={v=>set("businessLicenseNumber",v)}/><Field label="Years in business" type="number" value={form.yearsInBusiness} onChange={v=>set("yearsInBusiness",v)}/><Field label="Website" value={form.website} onChange={v=>set("website",v)}/><Field label="Owner designation" value={form.ownerDesignation} onChange={v=>set("ownerDesignation",v)}/><Field label="Alternate phone" value={form.alternatePhone} onChange={v=>set("alternatePhone",v)}/><Field label="Support email" type="email" value={form.supportEmail} onChange={v=>set("supportEmail",v)}/><Field label="Emergency phone" value={form.emergencyPhone} onChange={v=>set("emergencyPhone",v)}/></Grid></>}
          {step === 4 && <><Title title="Office & service location" text="This becomes your primary operator location."/><Grid><Field label="Country" value={form.country} onChange={v=>set("country",v)}/><Field label="State / Province" value={form.state} onChange={v=>set("state",v)}/><Field label="City" value={form.city} onChange={v=>set("city",v)}/><Field label="District" value={form.district} onChange={v=>set("district",v)}/><Field label="Postal code" value={form.postalCode} onChange={v=>set("postalCode",v)}/><Field wide label="Office address line 1" value={form.addressLine1} onChange={v=>set("addressLine1",v)}/><Field wide label="Office address line 2" value={form.addressLine2} onChange={v=>set("addressLine2",v)}/><Field label="Landmark" value={form.landmark} onChange={v=>set("landmark",v)}/><Field label="Timezone" value={form.timezone} onChange={v=>set("timezone",v)}/></Grid></>}
          {step === 5 && <><Title title="Fleet overview" text="Only basic fleet information is needed now. Add every bus after approval from Fleet."/><Grid><Field label="Number of buses" type="number" value={form.fleetSize} onChange={v=>set("fleetSize",v)}/><Select label="Fleet ownership" value={form.fleetOwnership} onChange={v=>set("fleetOwnership",v)} options={[["owned","Owned"],["leased","Leased"],["mixed","Owned + Leased"]]}/><Select label="Bus configuration" value={form.busConfiguration} onChange={v=>set("busConfiguration",v)} options={[["seater","Seater"],["sleeper","Sleeper"],["mixed","Seater + Sleeper"]]}/><Select label="AC configuration" value={form.acConfiguration} onChange={v=>set("acConfiguration",v)} options={[["ac","AC"],["non-ac","Non-AC"],["mixed","AC + Non-AC"]]}/><Field label="Single deck buses" type="number" value={form.singleDeckCount} onChange={v=>set("singleDeckCount",v)}/><Field label="Double deck buses" type="number" value={form.doubleDeckCount} onChange={v=>set("doubleDeckCount",v)}/><Field label="Seater buses" type="number" value={form.seaterCount} onChange={v=>set("seaterCount",v)}/><Field label="Sleeper buses" type="number" value={form.sleeperCount} onChange={v=>set("sleeperCount",v)}/><Field label="Mixed seater/sleeper buses" type="number" value={form.mixedBusCount} onChange={v=>set("mixedBusCount",v)}/><Field wide label="Primary operating regions (comma separated)" value={form.operatingRegions} onChange={v=>set("operatingRegions",v)}/><Check label="GPS / live tracking available" checked={form.gpsTracking} onChange={v=>set("gpsTracking",v)}/><Field label="Tracking provider" value={form.liveTrackingProvider} onChange={v=>set("liveTrackingProvider",v)}/><Check label="Own workshop / maintenance facility" checked={form.ownWorkshop} onChange={v=>set("ownWorkshop",v)}/></Grid></>}
          {step === 6 && <><Title title="Route & operating profile" text="Give us a snapshot of your primary operation. Full route management stays in the Bus panel."/><Grid><Field label="Primary origin" value={form.primaryOrigin} onChange={v=>set("primaryOrigin",v)}/><Field label="Primary destination" value={form.primaryDestination} onChange={v=>set("primaryDestination",v)}/><Field wide label="Intermediate stops (comma separated)" value={form.intermediateStops} onChange={v=>set("intermediateStops",v)}/><Field wide label="Common boarding points (comma separated)" value={form.boardingPoints} onChange={v=>set("boardingPoints",v)}/><Field wide label="Common drop points (comma separated)" value={form.dropPoints} onChange={v=>set("dropPoints",v)}/><Select label="Operation pattern" value={form.operationPattern} onChange={v=>set("operationPattern",v)} options={[["daily","Daily"],["scheduled","Scheduled"],["seasonal","Seasonal"],["charter","Charter / On demand"]]}/><Field label="Trips per day" type="number" value={form.tripsPerDay} onChange={v=>set("tripsPerDay",v)}/><Field label="Service start time" type="time" value={form.serviceStartTime} onChange={v=>set("serviceStartTime",v)}/><Field label="Service end time" type="time" value={form.serviceEndTime} onChange={v=>set("serviceEndTime",v)}/><Field label="Advance booking days" type="number" value={form.advanceBookingDays} onChange={v=>set("advanceBookingDays",v)}/><Field wide label="Cancellation policy" value={form.cancellationPolicy} onChange={v=>set("cancellationPolicy",v)}/><Field wide label="No-show policy" value={form.noShowPolicy} onChange={v=>set("noShowPolicy",v)}/><Field wide label="Luggage policy" value={form.luggagePolicy} onChange={v=>set("luggagePolicy",v)}/></Grid></>}
          {step === 7 && <><Title title="Compliance details" text="Enter available document numbers. Actual document upload/verification can continue from Documents after approval."/><Grid><Field label="Operator licence number" value={form.operatorLicenseNumber} onChange={v=>set("operatorLicenseNumber",v)}/><Field label="Licence expiry" type="date" value={form.operatorLicenseExpiry} onChange={v=>set("operatorLicenseExpiry",v)}/><Field label="Permit number" value={form.permitNumber} onChange={v=>set("permitNumber",v)}/><Field label="Permit expiry" type="date" value={form.permitExpiry} onChange={v=>set("permitExpiry",v)}/><Field label="Insurance reference" value={form.insuranceNumber} onChange={v=>set("insuranceNumber",v)}/><Field label="Insurance expiry" type="date" value={form.insuranceExpiry} onChange={v=>set("insuranceExpiry",v)}/><Field label="Fitness certificate" value={form.fitnessCertificateNumber} onChange={v=>set("fitnessCertificateNumber",v)}/><Field label="Fitness expiry" type="date" value={form.fitnessExpiry} onChange={v=>set("fitnessExpiry",v)}/><Field label="PUC reference" value={form.pucNumber} onChange={v=>set("pucNumber",v)}/><Field label="PUC expiry" type="date" value={form.pucExpiry} onChange={v=>set("pucExpiry",v)}/><Field label="GST certificate/reference" value={form.gstCertificateNumber} onChange={v=>set("gstCertificateNumber",v)}/><Field label="Emergency contact name" value={form.emergencyContactName} onChange={v=>set("emergencyContactName",v)}/></Grid></>}
          {step === 8 && <><Title title="Bank, settlement & tax" text="Settlement information is kept separate from operational data."/><Grid><Field label="Bank name" value={form.bankName} onChange={v=>set("bankName",v)}/><Field label="Branch name" value={form.branchName} onChange={v=>set("branchName",v)}/><Field label="Account holder" value={form.accountHolderName} onChange={v=>set("accountHolderName",v)}/><Field label="Account number" value={form.accountNumber} onChange={v=>set("accountNumber",v)}/><Field label="Confirm account number" value={form.confirmAccountNumber} onChange={v=>set("confirmAccountNumber",v)}/><Field label="IFSC / bank code" value={form.ifscCode} onChange={v=>set("ifscCode",v)}/><Field label="IBAN" value={form.iban} onChange={v=>set("iban",v)}/><Field label="SWIFT / BIC" value={form.swiftCode} onChange={v=>set("swiftCode",v)}/><Field label="Settlement currency" value={form.settlementCurrency} onChange={v=>set("settlementCurrency",v)}/><Field label="Tax type" value={form.taxType} onChange={v=>set("taxType",v)}/><Field label="Tax registration number" value={form.taxRegistrationNumber} onChange={v=>set("taxRegistrationNumber",v)}/><Field label="GST / VAT number" value={form.gstNumber} onChange={v=>set("gstNumber",v)}/><Field label="PAN / tax identity" value={form.panNumber} onChange={v=>set("panNumber",v)}/></Grid></>}
          {step === 9 && <><Title title="Review your bus operator application" text="After submission your account stays pending until BMT Connect admin approval."/><div className="br-review"><Review label="Operator" value={form.businessName}/><Review label="Operator type" value={operatorLabel}/><Review label="Contact" value={`${form.email} · ${form.phone}`}/><Review label="Location" value={[form.city,form.state,form.country].filter(Boolean).join(", ")}/><Review label="Fleet" value={`${form.fleetSize || 0} buses · ${form.busConfiguration} · ${form.acConfiguration}`}/><Review label="Primary route" value={[form.primaryOrigin,form.primaryDestination].filter(Boolean).join(" → ") || "Not provided"}/><Review label="Settlement" value={`${form.bankName || "Bank pending"} · ${form.settlementCurrency}`}/></div><Check label="I confirm these details and accept the BMT Connect Supplier Agreement." checked={form.contractAccepted} onChange={v=>set("contractAccepted",v)}/><div className="br-pending"><b>What happens next?</b><span>Application submitted → Pending review → Admin approval → Vendor Sign-In → Bus Management Panel</span></div></>}
        </section>
        <footer className="br-footer"><button type="button" className="secondary" disabled={step===1||saving} onClick={()=>setStep(s=>s-1)}>← Back</button><button type="button" className="primary" disabled={saving} onClick={next}>{saving?"Submitting...":step===STEPS.length?"Submit application":"Continue →"}</button></footer>
      </main>
    </div>
  );
}

function Title({title,text}) { return <div className="br-title"><h2>{title}</h2><p>{text}</p></div>; }
function Grid({children}) { return <div className="br-grid">{children}</div>; }
function Field({label,value,onChange,type="text",wide=false}) { return <label className={`br-field ${wide?"wide":""}`}><span>{label}</span><input type={type} value={value} onChange={e=>onChange(e.target.value)} /></label>; }
function Select({label,value,onChange,options}) { return <label className="br-field"><span>{label}</span><select value={value} onChange={e=>onChange(e.target.value)}>{options.map(([v,l])=><option value={v} key={v}>{l}</option>)}</select></label>; }
function Check({label,checked,onChange}) { return <label className="br-check"><input type="checkbox" checked={checked} onChange={e=>onChange(e.target.checked)}/><span>{label}</span></label>; }
function Review({label,value}) { return <div><span>{label}</span><strong>{value || "Not provided"}</strong></div>; }
