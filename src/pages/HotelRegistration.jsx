import React, { useState } from "react";
import axios from "axios";
import "./HotelRegistration.css";

const API_URL = "https://bmtvendorfinal.onrender.com/api/vendor/auth";

const HotelRegistration = () => {
  // ==========================================
  // REGISTRATION STATE
  // ==========================================
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");

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
  // FORM DATA - All Hotel Registration Fields
  // ==========================================
  const [formData, setFormData] = useState({
    // STEP 1: Property Details
    propertyName: "",
    propertyType: "Hotel",
    address: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    landmark: "",
    starRating: "",
    totalRooms: "",

    // STEP 2: Owner Details
    ownerName: "",
    email: "",
    phone: "",
    password: "",
    companyName: "",
    businessName: "",
    gstNumber: "",
    panNumber: "",

    // STEP 3: Property Amenities
    amenities: [],
    propertyDescription: "",
    checkInTime: "",
    checkOutTime: "",
    cancellationPolicy: "",

    // STEP 4: Bank Details
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    upiId: "",
    terms: false,
  });

  const amenitiesList = [
    "Free WiFi",
    "Free Parking",
    "Airport Shuttle",
    "Swimming Pool",
    "Gym",
    "Restaurant",
    "Room Service",
    "Laundry Service",
    "Bar/Lounge",
    "Business Center",
    "Spa",
    "Pet Friendly",
    "Family Rooms",
    "Non-Smoking Rooms",
    "Air Conditioning",
    "Heating",
    "24/7 Front Desk",
    "Luggage Storage",
  ];

  // ==========================================
  // REGISTRATION HANDLERS - FIXED
  // ==========================================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle Amenities Checkbox (array of strings)
    if (type === "checkbox" && name === "amenities") {
      setFormData((prev) => {
        const amenities = prev.amenities || [];
        if (checked) {
          return { ...prev, amenities: [...amenities, value] };
        } else {
          return { ...prev, amenities: amenities.filter((item) => item !== value) };
        }
      });
      return;
    }
    
    // Handle Terms Checkbox (boolean)
    if (type === "checkbox" && name === "terms") {
      setFormData({
        ...formData,
        [name]: checked,
      });
      return;
    }
    
    // Handle all other inputs (text, email, select, etc.)
    setFormData({
      ...formData,
      [name]: value,
    });
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
    setLoginData({
      ...loginData,
      [name]: value,
    });
    setLoginError("");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    try {
      const response = await axios.post(`${API_URL}/login`, loginData);
      console.log("LOGIN RESPONSE:", response.data);

      const token = response.data?.token || response.data?.accessToken || response.data?.data?.token;

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
  // SIGNUP API
  // ==========================================
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare payload for backend
      const payload = {
        // Basic
        name: formData.ownerName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        companyName: formData.companyName,
        businessName: formData.businessName,

        // SERVICE - HOTELS (Fixed)
        service: "hotel",
        services: ["hotel"],

        // Address
        address: `${formData.address} ${formData.addressLine2 || ""}`,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        pincode: formData.pincode,

        // Tax Details
        gstNumber: formData.gstNumber,
        panNumber: formData.panNumber,

        // Stay Details
        stayDetails: {
          totalProperties: parseInt(formData.totalRooms) || 1,
          propertyTypes: [formData.propertyType],
          operatingCities: [formData.city],
          starRating: formData.starRating,
          amenities: formData.amenities,
          description: formData.propertyDescription,
          checkInTime: formData.checkInTime,
          checkOutTime: formData.checkOutTime,
          cancellationPolicy: formData.cancellationPolicy,
        },

        // Bank Details
        accountHolderName: formData.accountHolderName,
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        ifscCode: formData.ifscCode,
      };

      const response = await axios.post(`${API_URL}/signup`, payload);
      console.log("SIGNUP RESPONSE:", response.data);

      // Send OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(otpCode);

      try {
        await axios.post(`${API_URL}/send-otp`, {
          email: formData.email,
          otp: otpCode,
        });
        alert("OTP sent to your email! Please verify.");
        setShowOtp(true);
      } catch (otpError) {
        console.log("OTP SEND ERROR:", otpError);
        alert("Account created! Please login.");
        setShowLoginModal(true);
      }
    } catch (error) {
      console.error("SIGNUP ERROR:", error);
      alert(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // VERIFY OTP
  // ==========================================
  const handleVerifyOtp = async () => {
    if (otp === generatedOtp) {
      alert("Email verified successfully! Please login.");
      setShowLoginModal(true);
      setShowOtp(false);
      setOtp("");
    } else {
      alert("Invalid OTP. Please try again.");
    }
  };

  // ==========================================
  // RENDER LOGIN MODAL
  // ==========================================
  const renderLoginModal = () => {
    if (!showLoginModal) return null;

    return (
      <div className="login-modal-overlay" onClick={() => setShowLoginModal(false)}>
        <div className="login-modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="login-modal-close" onClick={() => setShowLoginModal(false)}>
            ×
          </button>

          <div className="login-modal-left">
            <h2>Welcome Back!</h2>
            <p>Login to manage your property, track bookings, and grow your revenue.</p>
            <div className="login-modal-features">
              <div className="login-modal-feature">
                <span>🏨</span>
                <div>
                  <h4>Manage Properties</h4>
                  <p>Add, edit, and manage your hotel properties</p>
                </div>
              </div>
              <div className="login-modal-feature">
                <span>📊</span>
                <div>
                  <h4>Real-time Analytics</h4>
                  <p>Track your business performance instantly</p>
                </div>
              </div>
              <div className="login-modal-feature">
                <span>💰</span>
                <div>
                  <h4>Easy Payments</h4>
                  <p>Get paid on time, every time</p>
                </div>
              </div>
            </div>
          </div>

          <div className="login-modal-right">
            <h2>Login to your account</h2>
            <p className="login-modal-subtitle">Enter your credentials to access your dashboard</p>

            {loginError && (
              <div className="login-modal-error">
                <span>⚠️</span> {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="login-modal-form">
              <div className="login-modal-form-group">
                <label>Email Address *</label>
                <div className="login-modal-input-wrapper">
                  <span className="login-modal-input-icon">📧</span>
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

              <div className="login-modal-form-group">
                <label>Password *</label>
                <div className="login-modal-input-wrapper">
                  <span className="login-modal-input-icon">🔒</span>
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
                    className="login-modal-password-toggle"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <div className="login-modal-options">
                <label className="login-modal-remember">
                  <input type="checkbox" /> Remember me
                </label>
                <a href="/forgot-password" className="login-modal-forgot">
                  Forgot Password?
                </a>
              </div>

              <button type="submit" className="login-modal-submit-btn" disabled={loginLoading}>
                {loginLoading ? "Logging in..." : "Login →"}
              </button>

              <div className="login-modal-register-link">
                <span>Don't have an account?</span>
                <span 
                  className="login-modal-register-link-text"
                  onClick={() => {
                    setShowLoginModal(false);
                    setLoginError("");
                  }}
                >
                  Register Now
                </span>
              </div>
            </form>

            <div className="login-modal-divider">
              <span>or continue with</span>
            </div>

            <div className="login-modal-social">
              <button className="login-modal-social-btn google">
                <span>G</span> Google
              </button>
              <button className="login-modal-social-btn facebook">
                <span>f</span> Facebook
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // RENDER STEP 1: Property Details
  // ==========================================
  const renderStep1 = () => (
    <div className="hotel-step-content">
      <h2>List your property with BridMyTrip</h2>
      <p>Reach millions of travellers worldwide</p>

      <div className="hotel-form-group">
        <label>Property Name *</label>
        <input
          type="text"
          name="propertyName"
          value={formData.propertyName}
          onChange={handleChange}
          placeholder="Enter property name"
          required
        />
      </div>

      <div className="hotel-form-row">
        <div className="hotel-form-group">
          <label>Property Type *</label>
          <select name="propertyType" value={formData.propertyType} onChange={handleChange} required>
            <option value="Hotel">Hotel</option>
            <option value="Resort">Resort</option>
            <option value="Homestay">Homestay</option>
            <option value="Apartment">Apartment</option>
            <option value="Villa">Villa</option>
            <option value="Guesthouse">Guesthouse</option>
            <option value="Hostel">Hostel</option>
            <option value="Motel">Motel</option>
          </select>
        </div>
        <div className="hotel-form-group">
          <label>Star Rating</label>
          <select name="starRating" value={formData.starRating} onChange={handleChange}>
            <option value="">Select rating</option>
            <option value="1">1 Star</option>
            <option value="2">2 Star</option>
            <option value="3">3 Star</option>
            <option value="4">4 Star</option>
            <option value="5">5 Star</option>
            <option value="Unrated">Unrated</option>
          </select>
        </div>
      </div>

      <div className="hotel-form-group">
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

      <div className="hotel-form-group">
        <label>Address Line 2</label>
        <input
          type="text"
          name="addressLine2"
          value={formData.addressLine2}
          onChange={handleChange}
          placeholder="Apartment, suite, etc."
        />
      </div>

      <div className="hotel-form-row">
        <div className="hotel-form-group">
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
        <div className="hotel-form-group">
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

      <div className="hotel-form-row">
        <div className="hotel-form-group">
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
        <div className="hotel-form-group">
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

      <div className="hotel-form-group">
        <label>Landmark</label>
        <input
          type="text"
          name="landmark"
          value={formData.landmark}
          onChange={handleChange}
          placeholder="Near any landmark"
        />
      </div>

      <div className="hotel-form-group">
        <label>Total Rooms *</label>
        <input
          type="number"
          name="totalRooms"
          value={formData.totalRooms}
          onChange={handleChange}
          placeholder="Enter total number of rooms"
          min="1"
          required
        />
      </div>
    </div>
  );

  // ==========================================
  // RENDER STEP 2: Owner Details
  // ==========================================
  const renderStep2 = () => (
    <div className="hotel-step-content">
      <h3>Owner & Business Details</h3>
      <p>Provide your personal and business information</p>

      <div className="hotel-form-group">
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

      <div className="hotel-form-row">
        <div className="hotel-form-group">
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
        <div className="hotel-form-group">
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

      <div className="hotel-form-group">
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

      <div className="hotel-form-row">
        <div className="hotel-form-group">
          <label>Company Name</label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            placeholder="Enter company name"
          />
        </div>
        <div className="hotel-form-group">
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

      <div className="hotel-form-row">
        <div className="hotel-form-group">
          <label>GST Number</label>
          <input
            type="text"
            name="gstNumber"
            value={formData.gstNumber}
            onChange={handleChange}
            placeholder="Enter GST number"
          />
        </div>
        <div className="hotel-form-group">
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
  // RENDER STEP 3: Amenities & Policies
  // ==========================================
  const renderStep3 = () => (
    <div className="hotel-step-content">
      <h3>Amenities & Policies</h3>
      <p>Tell guests about your property</p>

      <div className="hotel-form-group">
        <label>Property Description</label>
        <textarea
          name="propertyDescription"
          value={formData.propertyDescription}
          onChange={handleChange}
          placeholder="Describe your property, special features, etc."
          rows="4"
        />
      </div>

      <div className="hotel-form-group">
        <label>Amenities (Select all that apply)</label>
        <div className="hotel-amenities-grid">
          {amenitiesList.map((amenity) => (
            <label key={amenity} className="hotel-checkbox-label">
              <input
                type="checkbox"
                name="amenities"
                value={amenity}
                checked={formData.amenities.includes(amenity)}
                onChange={handleChange}
              />
              {amenity}
            </label>
          ))}
        </div>
      </div>

      <div className="hotel-form-row">
        <div className="hotel-form-group">
          <label>Check-in Time</label>
          <input
            type="time"
            name="checkInTime"
            value={formData.checkInTime}
            onChange={handleChange}
          />
        </div>
        <div className="hotel-form-group">
          <label>Check-out Time</label>
          <input
            type="time"
            name="checkOutTime"
            value={formData.checkOutTime}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="hotel-form-group">
        <label>Cancellation Policy</label>
        <select name="cancellationPolicy" value={formData.cancellationPolicy} onChange={handleChange}>
          <option value="">Select policy</option>
          <option value="Free">Free Cancellation</option>
          <option value="Non-Refundable">Non-Refundable</option>
          <option value="Partial">Partial Refund</option>
          <option value="Flexible">Flexible</option>
        </select>
      </div>
    </div>
  );

  // ==========================================
  // RENDER STEP 4: Bank Details - FIXED
  // ==========================================
  const renderStep4 = () => (
    <div className="hotel-step-content">
      <h3>Bank Details</h3>
      <p>Provide your bank account for payments</p>

      <div className="hotel-form-group">
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

      <div className="hotel-form-row">
        <div className="hotel-form-group">
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
        <div className="hotel-form-group">
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

      <div className="hotel-form-row">
        <div className="hotel-form-group">
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
        <div className="hotel-form-group">
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

      {/* ✅ FIXED: Terms Checkbox */}
      <div className="hotel-form-group checkbox">
        <label className="hotel-checkbox-label">
          <input
            type="checkbox"
            name="terms"
            checked={formData.terms}
            onChange={handleChange}
            required
          />
          I agree to the <a href="#terms">Terms & Conditions</a> and <a href="#privacy">Privacy Policy</a>
        </label>
      </div>

      {/* Summary */}
      <div className="hotel-summary-box">
        <h4>Review your information</h4>
        <div className="hotel-summary-item">
          <span>Property:</span> <strong>{formData.propertyName}</strong>
        </div>
        <div className="hotel-summary-item">
          <span>Owner:</span> <strong>{formData.ownerName}</strong>
        </div>
        <div className="hotel-summary-item">
          <span>Email:</span> <strong>{formData.email}</strong>
        </div>
        <div className="hotel-summary-item">
          <span>Phone:</span> <strong>{formData.phone}</strong>
        </div>
        <div className="hotel-summary-item">
          <span>Address:</span> <strong>{formData.city}, {formData.state}</strong>
        </div>
        <div className="hotel-summary-item">
          <span>Total Rooms:</span> <strong>{formData.totalRooms}</strong>
        </div>
        <div className="hotel-summary-item">
          <span>Bank:</span> <strong>{formData.bankName}</strong>
        </div>
      </div>
    </div>
  );

  // ==========================================
  // MAIN RENDER
  // ==========================================
  if (showOtp) {
    return (
      <div className="hotel-registration">
        <div className="hotel-otp-container">
          <div className="hotel-otp-box">
            <div className="hotel-otp-icon">📧</div>
            <h2>Verify your email</h2>
            <p>We've sent a 6-digit OTP to <strong>{formData.email}</strong></p>
            <div className="hotel-form-group">
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength="6"
                className="hotel-otp-input"
              />
            </div>
            <button className="hotel-submit-btn" onClick={handleVerifyOtp}>
              Verify OTP
            </button>
            <p className="hotel-resend-otp">
              Didn't receive OTP?{" "}
              <span
                onClick={() => {
                  const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
                  setGeneratedOtp(newOtp);
                  axios.post(`${API_URL}/send-otp`, {
                    email: formData.email,
                    otp: newOtp,
                  });
                  alert("New OTP sent!");
                }}
              >
                Resend OTP
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hotel-registration">
      {/* Header */}
      <header className="hotel-header">
        <div className="hotel-logo">
          <span className="hotel-logo-icon">🏨</span>
          <span className="hotel-logo-text">BridMyTrip<small></small></span>
        </div>
        <div className="hotel-header-actions">
          <span>Already have an account?</span>
          <button className="hotel-login-link" onClick={() => setShowLoginModal(true)}>
            Login
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hotel-hero">
        <div className="hotel-hero-content">
          <h1>List your property for free & reach millions of travellers worldwide</h1>
          <p>Join 5.5 lakhs+ happy partners. Get bookings from 48.2 Cr+ annual visitors.</p>
          <div className="hotel-stats">
            <span>🌍 48.2 Cr+ Visitors</span>
            <span>📊 3.1 Cr+ Check-ins</span>
            <span>🔗 80+ Channel Managers</span>
            <span>⏱️ Onboard in 30 mins</span>
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <div className="hotel-form-container">
        <div className="hotel-form-wrapper">
          <h2>Register your property</h2>
          <p className="hotel-form-subtitle">Get started in minutes. No hidden charges.</p>

          {/* Progress Steps */}
          <div className="hotel-progress-steps">
            {["Property Details", "Owner Details", "Amenities", "Bank Details"].map((label, i) => (
              <div
                key={i}
                className={`hotel-progress-step ${step > i + 1 ? "completed" : ""} ${step === i + 1 ? "active" : ""}`}
              >
                <div className="hotel-progress-number">{i + 1}</div>
                <div className="hotel-progress-label">{label}</div>
                {i < 3 && <div className="hotel-progress-line"></div>}
              </div>
            ))}
          </div>

          <form onSubmit={handleSignup}>
            {/* Step Content */}
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}

            {/* Navigation Buttons */}
            <div className="hotel-form-actions">
              {step > 1 && (
                <button type="button" className="hotel-prev-btn" onClick={prevStep}>
                  ← Previous
                </button>
              )}
              {step < 4 ? (
                <button type="button" className="hotel-next-btn" onClick={nextStep}>
                  Next Step →
                </button>
              ) : (
                <button 
                  type="submit" 
                  className="hotel-submit-btn" 
                  disabled={loading || !formData.terms}
                >
                  {loading ? "Submitting..." : "Submit & List Property"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Features Section */}
      <section className="hotel-features">
        <h2>Why partner with BridMyTrip?</h2>
        <div className="hotel-features-grid">
          <div className="hotel-feature">
            <span>🌍</span>
            <h4>Global Reach</h4>
            <p>48.2 Cr+ annual visitors worldwide</p>
          </div>
          <div className="hotel-feature">
            <span>📊</span>
            <h4>High Demand</h4>
            <p>3.1 Cr+ check-ins per year</p>
          </div>
          <div className="hotel-feature">
            <span>🔗</span>
            <h4>Channel Managers</h4>
            <p>80+ network for seamless management</p>
          </div>
          <div className="hotel-feature">
            <span>⏱️</span>
            <h4>Quick Onboarding</h4>
            <p>Get listed in just 30 minutes</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="hotel-faq">
        <h2>Frequently Asked Questions</h2>
        <div className="hotel-faq-grid">
          <div className="hotel-faq-item">
            <h4>When will my property be listed online?</h4>
            <p>After you finish creating your listing, it goes through a quality check. Your property will go online in about 5-7 working days.</p>
          </div>
          <div className="hotel-faq-item">
            <h4>Can I list my property if I work with other OTAs?</h4>
            <p>Absolutely! We're excited to help you connect with millions of travellers searching for their next stay.</p>
          </div>
          <div className="hotel-faq-item">
            <h4>Do I need to sign up for each brand separately?</h4>
            <p>No! Partnering with us means your listing appears on BridMyTrip.com and Goibibo.com.</p>
          </div>
          <div className="hotel-faq-item">
            <h4>How much commission does BridMyTrip.com charge?</h4>
            <p>We operate on a commission model that varies depending on the type of property and location.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="hotel-footer">
        <p>© 2026 BridMyTrip.com. All rights reserved.</p>
        <div className="hotel-footer-links">
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

export default HotelRegistration;