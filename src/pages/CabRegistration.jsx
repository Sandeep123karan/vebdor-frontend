import React, { useState } from "react";
import axios from "axios";
import "./CabRegistration.css";

const API_URL = "http://localhost:7000/api/vendor/auth";

const CabRegistration = () => {
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
  // FORM DATA - All Cab Registration Fields
  // ==========================================
  const [formData, setFormData] = useState({
    // STEP 1: Owner Details
    name: "",
    email: "",
    phone: "",
    password: "",
    companyName: "",
    businessName: "",

    // STEP 2: Vehicle Details
    vehicleNumber: "",
    vehicleType: "Sedan",
    vehicleModel: "",
    seatingCapacity: "",
    registrationYear: "",
    insuranceExpiry: "",

    // STEP 3: License & Permit
    licenseNumber: "",
    permitNumber: "",
    transportLicenseNumber: "",
    licenseExpiry: "",
    permitExpiry: "",

    // STEP 4: Bank Details
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    upiId: "",
    terms: false,
  });

  // ==========================================
  // REGISTRATION HANDLERS
  // ==========================================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
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
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        companyName: formData.companyName,
        businessName: formData.businessName,

        // SERVICE - CABS (Fixed)
        service: "cab",
        services: ["cab"],

        // Car Rental Details
        carRentalDetails: {
          totalVehicles: 1,
          vehicleTypes: [formData.vehicleType],
          serviceCities: [formData.vehicleModel],
          transportLicenseNumber: formData.transportLicenseNumber || "",
          licenseDocument: "",
          businessModel: "outstation",
          airportPickupAvailable: false,
          outstationAvailable: true,
          localRentalAvailable: true,
          driverProvided: true,
          selfDriveAvailable: false,
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
            <p>Login to manage your cab business, track bookings, and grow your revenue.</p>
            <div className="login-modal-features">
              <div className="login-modal-feature">
                <span>📊</span>
                <div>
                  <h4>Real-time Analytics</h4>
                  <p>Track your business performance instantly</p>
                </div>
              </div>
              <div className="login-modal-feature">
                <span>🚕</span>
                <div>
                  <h4>Manage Fleet</h4>
                  <p>Add, edit, and manage your vehicles</p>
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
  // RENDER STEP 1: Owner Details
  // ==========================================
  const renderStep1 = () => (
    <div className="cab-step-content">
      <h2>Register your cab business</h2>
      <p>Start selling on India's largest travel network</p>

      <div className="cab-form-group">
        <label>Full Name *</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter your full name"
          required
        />
      </div>

      <div className="cab-form-row">
        <div className="cab-form-group">
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
        <div className="cab-form-group">
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

      <div className="cab-form-group">
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

      <div className="cab-form-row">
        <div className="cab-form-group">
          <label>Company Name</label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            placeholder="Enter company name"
          />
        </div>
        <div className="cab-form-group">
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
    </div>
  );

  // ==========================================
  // RENDER STEP 2: Vehicle Details
  // ==========================================
  const renderStep2 = () => (
    <div className="cab-step-content">
      <h3>Vehicle Details</h3>
      <p>Tell us about your vehicle fleet</p>

      <div className="cab-form-group">
        <label>Vehicle Number *</label>
        <input
          type="text"
          name="vehicleNumber"
          value={formData.vehicleNumber}
          onChange={handleChange}
          placeholder="e.g. MH-01-AB-1234"
          required
        />
      </div>

      <div className="cab-form-row">
        <div className="cab-form-group">
          <label>Vehicle Type *</label>
          <select name="vehicleType" value={formData.vehicleType} onChange={handleChange} required>
            <option value="Sedan">Sedan</option>
            <option value="SUV">SUV</option>
            <option value="Hatchback">Hatchback</option>
            <option value="Luxury">Luxury</option>
            <option value="Mini">Mini</option>
            <option value="MUV">MUV</option>
            <option value="Electric">Electric</option>
          </select>
        </div>
        <div className="cab-form-group">
          <label>Vehicle Model</label>
          <input
            type="text"
            name="vehicleModel"
            value={formData.vehicleModel}
            onChange={handleChange}
            placeholder="e.g. Toyota Innova"
          />
        </div>
      </div>

      <div className="cab-form-row">
        <div className="cab-form-group">
          <label>Seating Capacity *</label>
          <select name="seatingCapacity" value={formData.seatingCapacity} onChange={handleChange} required>
            <option value="">Select seating capacity</option>
            <option value="4">4 Seater</option>
            <option value="6">6 Seater</option>
            <option value="7">7 Seater</option>
            <option value="8">8 Seater</option>
            <option value="10">10 Seater</option>
            <option value="12">12 Seater</option>
          </select>
        </div>
        <div className="cab-form-group">
          <label>Registration Year *</label>
          <select name="registrationYear" value={formData.registrationYear} onChange={handleChange} required>
            <option value="">Select year</option>
            {Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - i).map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="cab-form-group">
        <label>Insurance Expiry Date</label>
        <input
          type="date"
          name="insuranceExpiry"
          value={formData.insuranceExpiry}
          onChange={handleChange}
        />
      </div>
    </div>
  );

  // ==========================================
  // RENDER STEP 3: License & Permit
  // ==========================================
  const renderStep3 = () => (
    <div className="cab-step-content">
      <h3>License & Permit Details</h3>
      <p>Provide your transportation license and permit information</p>

      <div className="cab-form-row">
        <div className="cab-form-group">
          <label>Driver's License Number *</label>
          <input
            type="text"
            name="licenseNumber"
            value={formData.licenseNumber}
            onChange={handleChange}
            placeholder="Enter license number"
            required
          />
        </div>
        <div className="cab-form-group">
          <label>License Expiry Date</label>
          <input
            type="date"
            name="licenseExpiry"
            value={formData.licenseExpiry}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="cab-form-row">
        <div className="cab-form-group">
          <label>Transport Permit Number *</label>
          <input
            type="text"
            name="permitNumber"
            value={formData.permitNumber}
            onChange={handleChange}
            placeholder="Enter permit number"
            required
          />
        </div>
        <div className="cab-form-group">
          <label>Permit Expiry Date</label>
          <input
            type="date"
            name="permitExpiry"
            value={formData.permitExpiry}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="cab-form-group">
        <label>Transport License Number</label>
        <input
          type="text"
          name="transportLicenseNumber"
          value={formData.transportLicenseNumber}
          onChange={handleChange}
          placeholder="Enter transport license number"
        />
      </div>
    </div>
  );

  // ==========================================
  // RENDER STEP 4: Bank Details
  // ==========================================
  const renderStep4 = () => (
    <div className="cab-step-content">
      <h3>Bank Details</h3>
      <p>Provide your bank account for payments</p>

      <div className="cab-form-group">
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

      <div className="cab-form-row">
        <div className="cab-form-group">
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
        <div className="cab-form-group">
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

      <div className="cab-form-row">
        <div className="cab-form-group">
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
        <div className="cab-form-group">
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

      <div className="cab-form-group checkbox">
        <input
          type="checkbox"
          name="terms"
          checked={formData.terms}
          onChange={handleChange}
          required
        />
        <label>
          I agree to the <a href="#terms">Terms & Conditions</a> and <a href="#privacy">Privacy Policy</a>
        </label>
      </div>

      {/* Summary */}
      <div className="cab-summary-box">
        <h4>Review your information</h4>
        <div className="cab-summary-item">
          <span>Name:</span> <strong>{formData.name}</strong>
        </div>
        <div className="cab-summary-item">
          <span>Email:</span> <strong>{formData.email}</strong>
        </div>
        <div className="cab-summary-item">
          <span>Phone:</span> <strong>{formData.phone}</strong>
        </div>
        <div className="cab-summary-item">
          <span>Vehicle:</span> <strong>{formData.vehicleType} - {formData.vehicleNumber}</strong>
        </div>
        <div className="cab-summary-item">
          <span>Company:</span> <strong>{formData.companyName || "Not provided"}</strong>
        </div>
        <div className="cab-summary-item">
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
      <div className="cab-registration">
        <div className="cab-otp-container">
          <div className="cab-otp-box">
            <div className="cab-otp-icon">📧</div>
            <h2>Verify your email</h2>
            <p>We've sent a 6-digit OTP to <strong>{formData.email}</strong></p>
            <div className="cab-form-group">
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength="6"
                className="cab-otp-input"
              />
            </div>
            <button className="cab-submit-btn" onClick={handleVerifyOtp}>
              Verify OTP
            </button>
            <p className="cab-resend-otp">
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
    <div className="cab-registration">
      {/* Header */}
      <header className="cab-header">
        <div className="cab-logo">
          <span className="cab-logo-icon"></span>
          <span className="cab-logo-text">BridMyTrip <small></small></span>
        </div>
        <div className="cab-header-actions">
          <span>Already have an account?</span>
          <button className="cab-login-link" onClick={() => setShowLoginModal(true)}>
            Login
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="cab-hero">
        <div className="cab-hero-content">
          <h1>Reach 48.2 Cr+ travellers & grow your cab business</h1>
          <p>Join India's largest travel network. List your cabs for free and get bookings from MakeMyTrip, , and more.</p>
          <div className="cab-stats">
            <div className="cab-stat">
              <span className="cab-stat-number">48.2 Cr+</span>
              <span className="cab-stat-label">Annual Visitors</span>
            </div>
            <div className="cab-stat">
              <span className="cab-stat-number">3.1 Cr+</span>
              <span className="cab-stat-label">Bookings/Year</span>
            </div>
            <div className="cab-stat">
              <span className="cab-stat-number">80+</span>
              <span className="cab-stat-label">Channel Managers</span>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <div className="cab-form-container">
        <div className="cab-form-wrapper">
          <h2>Register your cab business</h2>
          <p className="cab-form-subtitle">Get started in minutes. No hidden charges.</p>

          {/* Progress Steps */}
          <div className="cab-progress-steps">
            {["Owner Details", "Vehicle Details", "License & Permit", "Bank Details"].map((label, i) => (
              <div
                key={i}
                className={`cab-progress-step ${step > i + 1 ? "completed" : ""} ${step === i + 1 ? "active" : ""}`}
              >
                <div className="cab-progress-number">{i + 1}</div>
                <div className="cab-progress-label">{label}</div>
                {i < 3 && <div className="cab-progress-line"></div>}
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
            <div className="cab-form-actions">
              {step > 1 && (
                <button type="button" className="cab-prev-btn" onClick={prevStep}>
                  ← Previous
                </button>
              )}
              {step < 4 ? (
                <button type="button" className="cab-next-btn" onClick={nextStep}>
                  Next Step →
                </button>
              ) : (
                <button type="submit" className="cab-submit-btn" disabled={loading || !formData.terms}>
                  {loading ? "Registering..." : "Submit & Start Selling"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Features Section */}
      <section className="cab-features">
        <div className="cab-features-grid">
          <div className="cab-feature">
            <span className="cab-feature-icon">📱</span>
            <h4>Digital Onboarding</h4>
            <p>Get your property listed for free, in just 30 minutes.</p>
          </div>
          <div className="cab-feature">
            <span className="cab-feature-icon">💰</span>
            <h4>Full Control</h4>
            <p>Manage rates, availability, and bookings in real-time.</p>
          </div>
          <div className="cab-feature">
            <span className="cab-feature-icon">📊</span>
            <h4>Real-time Analytics</h4>
            <p>Better decision making with data insights.</p>
          </div>
          <div className="cab-feature">
            <span className="cab-feature-icon">⭐</span>
            <h4>Guest Reviews</h4>
            <p>Build trust with authentic guest feedback.</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="cab-testimonials">
        <h2>What our partners say</h2>
        <div className="cab-testimonial-grid">
          <div className="cab-testimonial">
            <p>"MMT has been helpful for overall revenue maximization. Top features include key growth recommendations and transparent billing."</p>
            <div className="cab-testimonial-author">
              <strong>Piyush R. Samantaray</strong>
              <span>AGM- Revenue | MAYFAIR Hotels & Resorts</span>
            </div>
          </div>
          <div className="cab-testimonial">
            <p>"We have seen tremendous growth with almost 90% consecutive growth YoY through MMT. Simple inventory & rate management features help a lot!"</p>
            <div className="cab-testimonial-author">
              <strong>Kartik Mehta</strong>
              <span>DM - Revenue & Distribution | WelcomHeritage</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="cab-faq">
        <h2>Frequently Asked Questions</h2>
        <div className="cab-faq-grid">
          <div className="cab-faq-item">
            <h4>When will my property be listed online?</h4>
            <p>After you finish creating your listing, it goes through a quality check. Your property will go online in about 5-7 working days.</p>
          </div>
          <div className="cab-faq-item">
            <h4>Do I need to sign up for each MakeMyTrip brand separately?</h4>
            <p>No! Partnering with us means your listing appears on BridMyTrip.com </p>
          </div>
          <div className="cab-faq-item">
            <h4>How much commission does MakeMyTrip charge?</h4>
            <p>We operate on a commission model that varies depending on the type of property and location.</p>
          </div>
          <div className="cab-faq-item">
            <h4>How do MakeMyTrip payments work?</h4>
            <p>You'll receive payments against your bookings within 48-72 hours of checkout.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="cab-footer">
        <p>© 2026 Go-MMT. All rights reserved.</p>
        <div className="cab-footer-links">
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

export default CabRegistration;