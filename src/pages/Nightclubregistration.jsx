import React, { useState } from "react";
import axios from "axios";
import "./Nightclubregistration.css";

const API_URL = "http://localhost:7000/api/vendor/auth";

const NightClubRegistration = () => {
  // ==========================================
  // REGISTRATION STATE
  // ==========================================
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // ==========================================
  // LOGIN MODAL STATE
  // ==========================================
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ==========================================
  // FORM DATA - All Night Club Registration Fields
  // ==========================================
  const [formData, setFormData] = useState({
    // STEP 1: Venue Details
    venueName: "",
    venueType: "indoor",
    address: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    landmark: "",
    totalCapacity: "",
    ageLimit: "21",

    // STEP 2: Owner Details
    ownerName: "",
    email: "",
    phone: "",
    password: "",
    companyName: "",
    businessName: "",
    gstNumber: "",
    panNumber: "",

    // STEP 3: Club Features & Policies
    musicGenres: [],
    entryFeeType: "cover-charge",
    averageEntryFee: "",
    dressCodeRequired: false,
    dressCodeDetails: "",
    operatingDays: [],
    openingTime: "",
    closingTime: "",
    alcoholServed: true,
    alcoholLicenseNumber: "",
    excisePermitNumber: "",
    stagPolicy: "with-conditions",
    parkingAvailable: false,
    valetAvailable: false,
    vipSectionAvailable: false,
    privateBoothsAvailable: false,
    danceFloorAvailable: true,
    liveDjAvailable: true,
    liveBandAvailable: false,
    smokingAreaAvailable: false,
    venueDescription: "",

    // STEP 4: Bank Details
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    upiId: "",
    terms: false,
  });

  const musicGenresList = [
    "EDM",
    "Bollywood",
    "Hip-Hop",
    "Techno",
    "House",
    "Commercial",
    "Retro",
    "Rock",
    "Live Band",
    "Sufi",
  ];

  const daysList = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // ==========================================
  // FORM HANDLERS
  // ==========================================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Multi-checkbox groups (musicGenres, operatingDays)
    if (type === "checkbox" && (name === "musicGenres" || name === "operatingDays")) {
      setFormData((prev) => {
        const current = prev[name] || [];
        if (checked) {
          return { ...prev, [name]: [...current, value] };
        }
        return { ...prev, [name]: current.filter((item) => item !== value) };
      });
      return;
    }

    // Plain boolean checkboxes
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
    window.scrollTo(0, 0);
  };

  // ==========================================
  // LOGIN HANDLERS
  // ==========================================
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
    setLoginError("");
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    try {
      const response = await axios.post(`${API_URL}/login`, loginData);

      const token =
        response.data?.token ||
        response.data?.accessToken ||
        response.data?.data?.token;

      if (token) {
        localStorage.setItem("token", token);
      }

      if (response.data?.vendor) {
        localStorage.setItem("user", JSON.stringify(response.data.vendor));
      }

      if (response.data?.data?.vendor) {
        localStorage.setItem("user", JSON.stringify(response.data.data.vendor));
      }

      alert(response.data?.message || "Login successful!");
      window.location.href = "/vendor";
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      setLoginError(error.response?.data?.message || "Invalid email or password");
    } finally {
      setLoginLoading(false);
    }
  };

  // ==========================================
  // SIGNUP API (NO OTP)
  // ==========================================
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        // Basic
        name: formData.ownerName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        companyName: formData.companyName,
        businessName: formData.businessName,

        // SERVICE - NIGHT CLUB
        service: "night-club",
        services: ["night-club"],

        // Address
        address: `${formData.address} ${formData.addressLine2 || ""}`.trim(),
        city: formData.city,
        state: formData.state,
        country: formData.country,
        pincode: formData.pincode,

        // Tax Details
        gstNumber: formData.gstNumber,
        panNumber: formData.panNumber,

        // Night Club Details
        nightClubDetails: {
          venueName: formData.venueName,
          venueType: formData.venueType,
          totalCapacity: parseInt(formData.totalCapacity) || 0,
          operatingCities: [formData.city],
          musicGenres: formData.musicGenres,
          ageLimit: parseInt(formData.ageLimit) || 18,
          entryFeeType: formData.entryFeeType,
          averageEntryFee: parseFloat(formData.averageEntryFee) || 0,
          dressCodeRequired: formData.dressCodeRequired,
          dressCodeDetails: formData.dressCodeDetails,
          operatingDays: formData.operatingDays,
          openingTime: formData.openingTime,
          closingTime: formData.closingTime,
          alcoholServed: formData.alcoholServed,
          alcoholLicenseNumber: formData.alcoholLicenseNumber,
          excisePermitNumber: formData.excisePermitNumber,
          parkingAvailable: formData.parkingAvailable,
          valetAvailable: formData.valetAvailable,
          vipSectionAvailable: formData.vipSectionAvailable,
          privateBoothsAvailable: formData.privateBoothsAvailable,
          danceFloorAvailable: formData.danceFloorAvailable,
          liveDjAvailable: formData.liveDjAvailable,
          liveBandAvailable: formData.liveBandAvailable,
          smokingAreaAvailable: formData.smokingAreaAvailable,
          stagPolicy: formData.stagPolicy,
        },

        // Bank Details
        accountHolderName: formData.accountHolderName,
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        ifscCode: formData.ifscCode,
      };

      const response = await axios.post(`${API_URL}/signup`, payload);
      console.log("SIGNUP RESPONSE:", response.data);

      // No OTP — go straight to a success screen, then let them log in
      // once admin approves the account.
      setShowSuccess(true);
    } catch (error) {
      console.error("SIGNUP ERROR:", error);
      alert(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // RENDER LOGIN MODAL
  // ==========================================
  const renderLoginModal = () => {
    if (!showLoginModal) return null;

    return (
      <div className="club-modal-overlay" onClick={() => setShowLoginModal(false)}>
        <div className="club-modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="club-modal-close" onClick={() => setShowLoginModal(false)}>
            ×
          </button>

          <div className="club-modal-left">
            <h2>Welcome Back!</h2>
            <p>Login to manage your venue, track events, and grow your bookings.</p>
            <div className="club-modal-features">
              <div className="club-modal-feature">
                <span>🎧</span>
                <div>
                  <h4>Manage Venues</h4>
                  <p>Add, edit, and manage your night club listings</p>
                </div>
              </div>
              <div className="club-modal-feature">
                <span>🎟️</span>
                <div>
                  <h4>Entry & Table Bookings</h4>
                  <p>Track passes, tables, and guest lists in real time</p>
                </div>
              </div>
              <div className="club-modal-feature">
                <span>💰</span>
                <div>
                  <h4>Easy Payments</h4>
                  <p>Get paid on time, every time</p>
                </div>
              </div>
            </div>
          </div>

          <div className="club-modal-right">
            <h2>Login to your account</h2>
            <p className="club-modal-subtitle">Enter your credentials to access your dashboard</p>

            {loginError && (
              <div className="club-modal-error">
                <span>⚠️</span> {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="club-modal-form">
              <div className="club-modal-form-group">
                <label>Email Address *</label>
                <div className="club-modal-input-wrapper">
                  <span className="club-modal-input-icon">📧</span>
                  <input
                    type="email"
                    name="email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    placeholder="Enter your email address"
                    required
                  />
                </div>
              </div>

              <div className="club-modal-form-group">
                <label>Password *</label>
                <div className="club-modal-input-wrapper">
                  <span className="club-modal-input-icon">🔒</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    placeholder="Enter your password"
                    required
                    minLength="6"
                  />
                  <button
                    type="button"
                    className="club-modal-password-toggle"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <div className="club-modal-options">
                <label className="club-modal-remember">
                  <input type="checkbox" /> Remember me
                </label>
                <a href="/forgot-password" className="club-modal-forgot">
                  Forgot Password?
                </a>
              </div>

              <button type="submit" className="club-modal-submit-btn" disabled={loginLoading}>
                {loginLoading ? "Logging in..." : "Login →"}
              </button>

              <div className="club-modal-register-link">
                <span>Don't have an account?</span>
                <span
                  className="club-modal-register-link-text"
                  onClick={() => {
                    setShowLoginModal(false);
                    setLoginError("");
                  }}
                >
                  Register Now
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // RENDER STEP 1: Venue Details
  // ==========================================
  const renderStep1 = () => (
    <div className="club-step-content">
      <h2>List your night club with BridMyTrip</h2>
      <p>Reach millions of nightlife-goers worldwide</p>

      <div className="club-form-group">
        <label>Venue Name *</label>
        <input
          type="text"
          name="venueName"
          value={formData.venueName}
          onChange={handleChange}
          placeholder="Enter venue name"
          required
        />
      </div>

      <div className="club-form-row">
        <div className="club-form-group">
          <label>Venue Type *</label>
          <select name="venueType" value={formData.venueType} onChange={handleChange} required>
            <option value="indoor">Indoor</option>
            <option value="outdoor">Outdoor</option>
            <option value="rooftop">Rooftop</option>
            <option value="beach">Beach</option>
            <option value="banquet">Banquet</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="club-form-group">
          <label>Total Capacity *</label>
          <input
            type="number"
            name="totalCapacity"
            value={formData.totalCapacity}
            onChange={handleChange}
            placeholder="e.g. 400"
            min="1"
            required
          />
        </div>
      </div>

      <div className="club-form-group">
        <label>Address *</label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Enter street address"
          required
        />
      </div>

      <div className="club-form-group">
        <label>Address Line 2</label>
        <input
          type="text"
          name="addressLine2"
          value={formData.addressLine2}
          onChange={handleChange}
          placeholder="Floor, block, etc."
        />
      </div>

      <div className="club-form-row">
        <div className="club-form-group">
          <label>City *</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="Enter city"
            required
          />
        </div>
        <div className="club-form-group">
          <label>State *</label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            placeholder="Enter state"
            required
          />
        </div>
      </div>

      <div className="club-form-row">
        <div className="club-form-group">
          <label>Country *</label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            placeholder="Enter country"
            required
          />
        </div>
        <div className="club-form-group">
          <label>Pincode *</label>
          <input
            type="text"
            name="pincode"
            value={formData.pincode}
            onChange={handleChange}
            placeholder="Enter pincode"
            required
          />
        </div>
      </div>

      <div className="club-form-row">
        <div className="club-form-group">
          <label>Landmark</label>
          <input
            type="text"
            name="landmark"
            value={formData.landmark}
            onChange={handleChange}
            placeholder="Near any landmark"
          />
        </div>
        <div className="club-form-group">
          <label>Minimum Age Limit *</label>
          <input
            type="number"
            name="ageLimit"
            value={formData.ageLimit}
            onChange={handleChange}
            placeholder="e.g. 21"
            min="18"
            required
          />
        </div>
      </div>
    </div>
  );

  // ==========================================
  // RENDER STEP 2: Owner Details
  // ==========================================
  const renderStep2 = () => (
    <div className="club-step-content">
      <h3>Owner & Business Details</h3>
      <p>Provide your personal and business information</p>

      <div className="club-form-group">
        <label>Owner Name *</label>
        <input
          type="text"
          name="ownerName"
          value={formData.ownerName}
          onChange={handleChange}
          placeholder="Enter owner name"
          required
        />
      </div>

      <div className="club-form-row">
        <div className="club-form-group">
          <label>Email Address *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email"
            required
          />
        </div>
        <div className="club-form-group">
          <label>Phone Number *</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter mobile number"
            required
          />
        </div>
      </div>

      <div className="club-form-group">
        <label>Password *</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Create password (min 6 characters)"
          required
          minLength="6"
        />
      </div>

      <div className="club-form-row">
        <div className="club-form-group">
          <label>Company Name</label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            placeholder="Enter company name"
          />
        </div>
        <div className="club-form-group">
          <label>Business Name</label>
          <input
            type="text"
            name="businessName"
            value={formData.businessName}
            onChange={handleChange}
            placeholder="Enter business name"
          />
        </div>
      </div>

      <div className="club-form-row">
        <div className="club-form-group">
          <label>GST Number</label>
          <input
            type="text"
            name="gstNumber"
            value={formData.gstNumber}
            onChange={handleChange}
            placeholder="Enter GST number"
          />
        </div>
        <div className="club-form-group">
          <label>PAN Number</label>
          <input
            type="text"
            name="panNumber"
            value={formData.panNumber}
            onChange={handleChange}
            placeholder="Enter PAN number"
          />
        </div>
      </div>
    </div>
  );

  // ==========================================
  // RENDER STEP 3: Club Features & Policies
  // ==========================================
  const renderStep3 = () => (
    <div className="club-step-content">
      <h3>Venue Features & Policies</h3>
      <p>Tell guests what your venue offers</p>

      <div className="club-form-group">
        <label>Venue Description</label>
        <textarea
          name="venueDescription"
          value={formData.venueDescription}
          onChange={handleChange}
          placeholder="Describe your venue, vibe, special nights, etc."
          rows="4"
        />
      </div>

      <div className="club-form-group">
        <label>Music Genres (Select all that apply)</label>
        <div className="club-amenities-grid">
          {musicGenresList.map((genre) => (
            <label key={genre} className="club-checkbox-label">
              <input
                type="checkbox"
                name="musicGenres"
                value={genre}
                checked={formData.musicGenres.includes(genre)}
                onChange={handleChange}
              />
              {genre}
            </label>
          ))}
        </div>
      </div>

      <div className="club-form-group">
        <label>Operating Days</label>
        <div className="club-amenities-grid">
          {daysList.map((day) => (
            <label key={day} className="club-checkbox-label">
              <input
                type="checkbox"
                name="operatingDays"
                value={day}
                checked={formData.operatingDays.includes(day)}
                onChange={handleChange}
              />
              {day}
            </label>
          ))}
        </div>
      </div>

      <div className="club-form-row">
        <div className="club-form-group">
          <label>Opening Time</label>
          <input
            type="time"
            name="openingTime"
            value={formData.openingTime}
            onChange={handleChange}
          />
        </div>
        <div className="club-form-group">
          <label>Closing Time</label>
          <input
            type="time"
            name="closingTime"
            value={formData.closingTime}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="club-form-row">
        <div className="club-form-group">
          <label>Entry Fee Type</label>
          <select name="entryFeeType" value={formData.entryFeeType} onChange={handleChange}>
            <option value="free">Free</option>
            <option value="cover-charge">Cover Charge</option>
            <option value="ticketed">Ticketed</option>
            <option value="couple-entry">Couple Entry</option>
          </select>
        </div>
        <div className="club-form-group">
          <label>Average Entry Fee (₹)</label>
          <input
            type="number"
            name="averageEntryFee"
            value={formData.averageEntryFee}
            onChange={handleChange}
            placeholder="e.g. 999"
            min="0"
          />
        </div>
      </div>

      <div className="club-form-group">
        <label className="club-checkbox-label">
          <input
            type="checkbox"
            name="dressCodeRequired"
            checked={formData.dressCodeRequired}
            onChange={handleChange}
          />
          Dress Code Required
        </label>
      </div>

      {formData.dressCodeRequired && (
        <div className="club-form-group">
          <label>Dress Code Details</label>
          <input
            type="text"
            name="dressCodeDetails"
            value={formData.dressCodeDetails}
            onChange={handleChange}
            placeholder="e.g. Smart casuals only, no shorts/flip-flops"
          />
        </div>
      )}

      <div className="club-form-row">
        <div className="club-form-group">
          <label>Stag Entry Policy</label>
          <select name="stagPolicy" value={formData.stagPolicy} onChange={handleChange}>
            <option value="allowed">Allowed</option>
            <option value="not-allowed">Not Allowed</option>
            <option value="with-conditions">Allowed with Conditions</option>
          </select>
        </div>
        <div className="club-form-group">
          <label className="club-checkbox-label" style={{ marginTop: "1.9rem" }}>
            <input
              type="checkbox"
              name="alcoholServed"
              checked={formData.alcoholServed}
              onChange={handleChange}
            />
            Alcohol Served
          </label>
        </div>
      </div>

      {formData.alcoholServed && (
        <div className="club-form-row">
          <div className="club-form-group">
            <label>Alcohol License Number</label>
            <input
              type="text"
              name="alcoholLicenseNumber"
              value={formData.alcoholLicenseNumber}
              onChange={handleChange}
              placeholder="Enter license number"
            />
          </div>
          <div className="club-form-group">
            <label>Excise Permit Number</label>
            <input
              type="text"
              name="excisePermitNumber"
              value={formData.excisePermitNumber}
              onChange={handleChange}
              placeholder="Enter excise permit number"
            />
          </div>
        </div>
      )}

      <div className="club-form-group">
        <label>Venue Amenities</label>
        <div className="club-amenities-grid">
          <label className="club-checkbox-label">
            <input
              type="checkbox"
              name="parkingAvailable"
              checked={formData.parkingAvailable}
              onChange={handleChange}
            />
            Parking Available
          </label>
          <label className="club-checkbox-label">
            <input
              type="checkbox"
              name="valetAvailable"
              checked={formData.valetAvailable}
              onChange={handleChange}
            />
            Valet Available
          </label>
          <label className="club-checkbox-label">
            <input
              type="checkbox"
              name="vipSectionAvailable"
              checked={formData.vipSectionAvailable}
              onChange={handleChange}
            />
            VIP Section
          </label>
          <label className="club-checkbox-label">
            <input
              type="checkbox"
              name="privateBoothsAvailable"
              checked={formData.privateBoothsAvailable}
              onChange={handleChange}
            />
            Private Booths
          </label>
          <label className="club-checkbox-label">
            <input
              type="checkbox"
              name="danceFloorAvailable"
              checked={formData.danceFloorAvailable}
              onChange={handleChange}
            />
            Dance Floor
          </label>
          <label className="club-checkbox-label">
            <input
              type="checkbox"
              name="liveDjAvailable"
              checked={formData.liveDjAvailable}
              onChange={handleChange}
            />
            Live DJ
          </label>
          <label className="club-checkbox-label">
            <input
              type="checkbox"
              name="liveBandAvailable"
              checked={formData.liveBandAvailable}
              onChange={handleChange}
            />
            Live Band
          </label>
          <label className="club-checkbox-label">
            <input
              type="checkbox"
              name="smokingAreaAvailable"
              checked={formData.smokingAreaAvailable}
              onChange={handleChange}
            />
            Smoking Area
          </label>
        </div>
      </div>
    </div>
  );

  // ==========================================
  // RENDER STEP 4: Bank Details
  // ==========================================
  const renderStep4 = () => (
    <div className="club-step-content">
      <h3>Bank Details</h3>
      <p>Provide your bank account for payments</p>

      <div className="club-form-group">
        <label>Account Holder Name *</label>
        <input
          type="text"
          name="accountHolderName"
          value={formData.accountHolderName}
          onChange={handleChange}
          placeholder="Enter account holder name"
          required
        />
      </div>

      <div className="club-form-row">
        <div className="club-form-group">
          <label>Bank Name *</label>
          <input
            type="text"
            name="bankName"
            value={formData.bankName}
            onChange={handleChange}
            placeholder="Enter bank name"
            required
          />
        </div>
        <div className="club-form-group">
          <label>IFSC Code *</label>
          <input
            type="text"
            name="ifscCode"
            value={formData.ifscCode}
            onChange={handleChange}
            placeholder="Enter IFSC code"
            required
          />
        </div>
      </div>

      <div className="club-form-row">
        <div className="club-form-group">
          <label>Account Number *</label>
          <input
            type="text"
            name="accountNumber"
            value={formData.accountNumber}
            onChange={handleChange}
            placeholder="Enter account number"
            required
          />
        </div>
        <div className="club-form-group">
          <label>UPI ID (Optional)</label>
          <input
            type="text"
            name="upiId"
            value={formData.upiId}
            onChange={handleChange}
            placeholder="Enter UPI ID"
          />
        </div>
      </div>

      <div className="club-form-group checkbox">
        <label className="club-checkbox-label">
          <input
            type="checkbox"
            name="terms"
            checked={formData.terms}
            onChange={handleChange}
            required
          />
          I agree to the <a href="#terms">Terms & Conditions</a> and{" "}
          <a href="#privacy">Privacy Policy</a>
        </label>
      </div>

      {/* Summary */}
      <div className="club-summary-box">
        <h4>Review your information</h4>
        <div className="club-summary-item">
          <span>Venue:</span> <strong>{formData.venueName}</strong>
        </div>
        <div className="club-summary-item">
          <span>Owner:</span> <strong>{formData.ownerName}</strong>
        </div>
        <div className="club-summary-item">
          <span>Email:</span> <strong>{formData.email}</strong>
        </div>
        <div className="club-summary-item">
          <span>Phone:</span> <strong>{formData.phone}</strong>
        </div>
        <div className="club-summary-item">
          <span>Address:</span> <strong>{formData.city}, {formData.state}</strong>
        </div>
        <div className="club-summary-item">
          <span>Capacity:</span> <strong>{formData.totalCapacity}</strong>
        </div>
        <div className="club-summary-item">
          <span>Bank:</span> <strong>{formData.bankName}</strong>
        </div>
      </div>
    </div>
  );

  // ==========================================
  // SUCCESS SCREEN (replaces OTP step)
  // ==========================================
  if (showSuccess) {
    return (
      <div className="club-registration">
        <div className="club-otp-container">
          <div className="club-otp-box">
            <div className="club-otp-icon">🎉</div>
            <h2>Registration submitted!</h2>
            <p>
              Your night club <strong>{formData.venueName}</strong> has been
              submitted and is waiting for admin approval. You'll be able to
              log in once your account is approved.
            </p>
            <button
              className="club-submit-btn"
              onClick={() => setShowLoginModal(true)}
            >
              Go to Login
            </button>
          </div>
        </div>
        {renderLoginModal()}
      </div>
    );
  }

  // ==========================================
  // MAIN RENDER
  // ==========================================
  return (
    <div className="club-registration">
      {/* Header */}
      <header className="club-header">
        <div className="club-logo">
          <span className="club-logo-icon">🎧</span>
          <span className="club-logo-text">BridMyTrip<small></small></span>
        </div>
        <div className="club-header-actions">
          <span>Already have an account?</span>
          <button className="club-login-link" onClick={() => setShowLoginModal(true)}>
            Login
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="club-hero">
        <div className="club-hero-content">
          <h1>List your night club for free & reach millions of nightlife-goers</h1>
          <p>Join our growing network of partner venues and fill your dance floor every weekend.</p>
          <div className="club-stats">
            <span>🌍 48.2 Cr+ Visitors</span>
            <span>🎟️ Entry & Table Bookings</span>
            <span>📊 Real-time Guest List</span>
            <span>⏱️ Onboard in 30 mins</span>
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <div className="club-form-container">
        <div className="club-form-wrapper">
          <h2>Register your venue</h2>
          <p className="club-form-subtitle">Get started in minutes. No hidden charges.</p>

          {/* Progress Steps */}
          <div className="club-progress-steps">
            {["Venue Details", "Owner Details", "Features & Policies", "Bank Details"].map(
              (label, i) => (
                <div
                  key={i}
                  className={`club-progress-step ${step > i + 1 ? "completed" : ""} ${
                    step === i + 1 ? "active" : ""
                  }`}
                >
                  <div className="club-progress-number">{i + 1}</div>
                  <div className="club-progress-label">{label}</div>
                  {i < 3 && <div className="club-progress-line"></div>}
                </div>
              )
            )}
          </div>

          <form onSubmit={handleSignup}>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}

            <div className="club-form-actions">
              {step > 1 && (
                <button type="button" className="club-prev-btn" onClick={prevStep}>
                  ← Previous
                </button>
              )}
              {step < 4 ? (
                <button type="button" className="club-next-btn" onClick={nextStep}>
                  Next Step →
                </button>
              ) : (
                <button
                  type="submit"
                  className="club-submit-btn"
                  disabled={loading || !formData.terms}
                >
                  {loading ? "Submitting..." : "Submit & List Venue"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Features Section */}
      <section className="club-features">
        <h2>Why partner with BridMyTrip?</h2>
        <div className="club-features-grid">
          <div className="club-feature">
            <span>🌍</span>
            <h4>Global Reach</h4>
            <p>48.2 Cr+ annual visitors worldwide</p>
          </div>
          <div className="club-feature">
            <span>🎟️</span>
            <h4>Table & Entry Bookings</h4>
            <p>Sell passes and reserve tables online</p>
          </div>
          <div className="club-feature">
            <span>📊</span>
            <h4>Real-time Guest List</h4>
            <p>Manage every night's crowd with ease</p>
          </div>
          <div className="club-feature">
            <span>⏱️</span>
            <h4>Quick Onboarding</h4>
            <p>Get listed in just 30 minutes</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="club-faq">
        <h2>Frequently Asked Questions</h2>
        <div className="club-faq-grid">
          <div className="club-faq-item">
            <h4>When will my venue be listed online?</h4>
            <p>
              After you finish creating your listing, it goes through a
              quality and license check. Your venue will go online in about
              5-7 working days.
            </p>
          </div>
          <div className="club-faq-item">
            <h4>Do I need an alcohol license to register?</h4>
            <p>
              If your venue serves alcohol, a valid license number is
              required as part of admin verification before approval.
            </p>
          </div>
          <div className="club-faq-item">
            <h4>Can I update my entry fees and events later?</h4>
            <p>
              Yes, once your account is approved, you can manage entry fees,
              events, and guest list settings anytime from your dashboard.
            </p>
          </div>
          <div className="club-faq-item">
            <h4>How much commission does BridMyTrip.com charge?</h4>
            <p>
              We operate on a commission model that varies depending on the
              type of venue and location.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="club-footer">
        <p>© 2026 BridMyTrip.com. All rights reserved.</p>
        <div className="club-footer-links">
          <a href="#privacy">Privacy</a>
          <a href="#terms">Terms</a>
          <a href="#contact">Contact</a>
        </div>
      </footer>

      {/* Login Modal */}
      {renderLoginModal()}
    </div>
  );
};

export default NightClubRegistration;