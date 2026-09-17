import React, { useState } from "react";
import axios from "axios";
import "./Auth.css";

const API_URL = "http://localhost:7000/api/vendor/auth";

const registerCards = [
  {
    icon: "🚌",
    title: "Register your bus with BirdMyTrip",
    text: "Start selling on the world's largest bus ticketing platform today",
    button: "Register Now",
  },
  {
    icon: "📚",
    title: "Learn about bus business",
    text: "Take the first step toward building your bus business with BirdMyTrip",
    button: "Know More",
  },
  {
    icon: "🤝",
    title: "Register as travel agent",
    text: "Grow your business by booking tickets for your clients and earn commissions effortlessly",
    button: "Go to seatseller",
  },
  {
    icon: "⚙️",
    title: "Register as NOVA vendor",
    text: "Expand your business by selling to 8000+ bus operators across India",
    button: "Explore NOVA",
  },
];

const benefits = [
  {
    icon: "📈",
    title: "Automate pricing and maximise revenue",
    text: "Use smart tools to optimize pricing, occupancy and revenue.",
  },
  {
    icon: "🚌",
    title: "Manage, promote, and grow your bus business",
    text: "Control routes, inventory, bookings and business operations from one place.",
  },
  {
    icon: "🔧",
    title: "Buy best quality bus parts at better prices",
    text: "Get access to trusted vendors and quality products through NOVA.",
  },
];

const opportunities = [
  {
    number: "30%+",
    title: "annual returns with weekly payments",
    text: "Get weekly payments with high profits in the growing bus market",
  },
  {
    number: "50L+",
    title: "Travelers & growing every day in market",
    text: "The bus market is growing fast giving you more bookings",
  },
  {
    number: "24/7",
    title: "Online operations makes it zero hassle",
    text: "Operate easily with permits, bookings and payments digitally",
  },
  {
    number: "1000+",
    title: "Untapped routes gives big opportunity",
    text: "Find profitable new routes with smart pricing and operational tools",
  },
];

const testimonials = [
  {
    quote:
      "For bus fleet owners like us, this change opened doors we couldn't imagine earlier. Once permits and sleeper codes became streamlined, we could invest confidently in better coaches and explore intercity routes beyond Chhattisgarh.",
    name: "Rajesh Bafna",
    role: "CA-turned-entrepreneur from Dada Brothers",
    initials: "RB",
  },
  {
    quote:
      "The market's momentum is undeniable. We started operations just this February and achieved a 4.9 rating within months. Demand for reliable, comfortable intercity travel is rising fast, and passengers are willing to pay for quality.",
    name: "Jasjeet Singh Rehal",
    role: "Founder of King Luxuries",
    initials: "JR",
  },
  {
    quote:
      "We proudly operated the longest routes for Kumbh, connecting Coimbatore and BLR to Prayagraj. These routes saw an overwhelming demand and occupancy, with BirdMyTrip playing a crucial role in driving bookings and making it a highly successful season.",
    name: "Mr. Pradeesh Karthi",
    role: "Delta Transport Pvt Ltd (Tamil Nadu)",
    initials: "PK",
  },
];

const faqs = [
  {
    q: "What are the benefits of being a BirdMyTrip partner?",
    a: "After bus registration, you can manage your inventory digitally, receive business insights, improve seat sales, receive timely payments and access partner support.",
  },
  {
    q: "What is the process of bus registration?",
    a: "Create your account, submit your operator and business details, complete the onboarding process and start managing your inventory.",
  },
  {
    q: "Is there a partnership fee?",
    a: "The partnership and commercial terms can depend on your business category and onboarding requirements.",
  },
  {
    q: "How can I manage my inventory?",
    a: "After onboarding, your vendor dashboard allows you to manage routes, buses, units, pricing, availability and other business details.",
  },
  {
    q: "How do I get paid as a partner?",
    a: "Payments and settlements are managed according to your partnership and booking cycle.",
  },
  {
    q: "How does settlement work?",
    a: "Settlement details, payment cycles and transaction history can be tracked through your business account.",
  },
  {
    q: "How can I know if a seat is booked?",
    a: "Bookings and inventory updates are reflected in your dashboard.",
  },
];

export default function Auth() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [faqOpen, setFaqOpen] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  
  // ==========================================
  // 4-STEP REGISTRATION STATE
  // ==========================================
  const [step, setStep] = useState(1);
  const [isRegistrationMode, setIsRegistrationMode] = useState(false);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // ==========================================
  // BUS REGISTRATION FORM DATA
  // ==========================================
  const [signupData, setSignupData] = useState({
    // STEP 1: Basic Details
    name: "",
    email: "",
    phone: "",
    password: "",
    companyName: "",
    businessName: "",
    // STEP 2: Business & Address
    address: "",
    city: "",
    state: "",
    pincode: "",
    gstNumber: "",
    panNumber: "",
    // STEP 3: Bus Details
    totalBuses: "",
    busTypes: [],
    operatingCities: [],
    routes: [],
    transportPermitNumber: "",
    operatorLicenseNumber: "",
    // STEP 4: Bank Details
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
  });

  const openAuth = (mode = "signup") => {
    setAuthMode(mode);
    setAuthOpen(true);
    setShowOtpInput(false);
    setOtp("");
    setStep(1);
    setIsRegistrationMode(false);
  };

  // ==========================================
  // HANDLE 4-STEP REGISTRATION
  // ==========================================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setSignupData((prev) => {
        const array = prev[name] || [];
        if (checked) {
          return { ...prev, [name]: [...array, value] };
        } else {
          return { ...prev, [name]: array.filter((item) => item !== value) };
        }
      });
    } else {
      setSignupData({ ...signupData, [name]: value });
    }
  };

  const handleArrayChange = (e, field) => {
    const value = e.target.value;
    setSignupData((prev) => ({
      ...prev,
      [field]: value.split(",").map((item) => item.trim()).filter(Boolean),
    }));
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
  // SIGNUP API (with OTP)
  // ==========================================
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare payload for backend
      const payload = {
        name: signupData.name,
        email: signupData.email,
        phone: signupData.phone,
        password: signupData.password,
        companyName: signupData.companyName,
        businessName: signupData.businessName,
        address: signupData.address,
        city: signupData.city,
        state: signupData.state,
        pincode: signupData.pincode,
        gstNumber: signupData.gstNumber,
        panNumber: signupData.panNumber,
        service: "bus",
        services: ["bus"],
        busDetails: {
          totalBuses: parseInt(signupData.totalBuses) || 0,
          busTypes: signupData.busTypes,
          operatingCities: signupData.operatingCities,
          routes: signupData.routes,
          transportPermitNumber: signupData.transportPermitNumber,
          operatorLicenseNumber: signupData.operatorLicenseNumber,
        },
        accountHolderName: signupData.accountHolderName,
        bankName: signupData.bankName,
        accountNumber: signupData.accountNumber,
        ifscCode: signupData.ifscCode,
      };

      const response = await axios.post(`${API_URL}/signup`, payload);
      console.log("SIGNUP RESPONSE:", response.data);

      // Generate OTP
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(generatedOtp);

      try {
        await axios.post(`${API_URL}/send-otp`, {
          email: signupData.email,
          otp: generatedOtp,
        });
        alert("OTP sent to your email! Please verify.");
        setShowOtpInput(true);
        setIsRegistrationMode(true);
      } catch (otpError) {
        console.log("OTP SEND ERROR:", otpError);
        alert("Account created but OTP sending failed. Please login directly.");
        setAuthMode("login");
        setShowOtpInput(false);
        setStep(1);
      }
    } catch (error) {
      console.log("SIGNUP ERROR:", error.response?.data || error.message);
      alert(error.response?.data?.message || error.message || "Signup failed");
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
      setAuthMode("login");
      setShowOtpInput(false);
      setOtp("");
      setStep(1);
      setIsRegistrationMode(false);
    } else {
      alert("Invalid OTP. Please try again.");
    }
  };

  // ==========================================
  // LOGIN API
  // ==========================================
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await axios.post(`${API_URL}/login`, loginData);
      console.log("LOGIN RESPONSE:", response.data);

      const token = response.data?.token || response.data?.accessToken || response.data?.data?.token;

      if (token) {
        localStorage.setItem("token", token);
      }

      if (response.data?.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      if (response.data?.data?.user) {
        localStorage.setItem("user", JSON.stringify(response.data.data.user));
      }

      alert(response.data?.message || "Login successful");
      window.location.reload();
    } catch (error) {
      console.log("LOGIN ERROR:", error.response?.data || error.message);
      alert(error.response?.data?.message || error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneStart = () => {
    openAuth("signup");
  };

  // ==========================================
  // RENDER 4-STEP FORM
  // ==========================================
  const renderStep1 = () => (
    <div className="rb-step-content">
      <h2>Register your bus with BirdMyTrip</h2>
      <p>Start selling on the world's largest bus ticketing platform</p>

      <div className="rb-form-group">
        <label>Full Name *</label>
        <input
          type="text"
          name="name"
          value={signupData.name}
          onChange={handleChange}
          placeholder="Enter your full name"
          required
        />
      </div>

      <div className="rb-form-row">
        <div className="rb-form-group">
          <label>Email Address *</label>
          <input
            type="email"
            name="email"
            value={signupData.email}
            onChange={handleChange}
            placeholder="Enter email"
            required
          />
        </div>
        <div className="rb-form-group">
          <label>Phone Number *</label>
          <input
            type="tel"
            name="phone"
            value={signupData.phone}
            onChange={handleChange}
            placeholder="Enter mobile number"
            required
          />
        </div>
      </div>

      <div className="rb-form-group">
        <label>Password *</label>
        <input
          type="password"
          name="password"
          value={signupData.password}
          onChange={handleChange}
          placeholder="Create password (min 6 characters)"
          required
          minLength="6"
        />
      </div>

      <div className="rb-form-row">
        <div className="rb-form-group">
          <label>Company Name</label>
          <input
            type="text"
            name="companyName"
            value={signupData.companyName}
            onChange={handleChange}
            placeholder="Enter company name"
          />
        </div>
        <div className="rb-form-group">
          <label>Business Name</label>
          <input
            type="text"
            name="businessName"
            value={signupData.businessName}
            onChange={handleChange}
            placeholder="Enter business name"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="rb-step-content">
      <h3>Business & Address Details</h3>
      <p>Share your business location and tax details</p>

      <div className="rb-form-group">
        <label>Address *</label>
        <textarea
          name="address"
          value={signupData.address}
          onChange={handleChange}
          placeholder="Enter complete address"
          rows="3"
          required
        />
      </div>

      <div className="rb-form-row">
        <div className="rb-form-group">
          <label>City *</label>
          <input
            type="text"
            name="city"
            value={signupData.city}
            onChange={handleChange}
            placeholder="Enter city"
            required
          />
        </div>
        <div className="rb-form-group">
          <label>State *</label>
          <input
            type="text"
            name="state"
            value={signupData.state}
            onChange={handleChange}
            placeholder="Enter state"
            required
          />
        </div>
      </div>

      <div className="rb-form-row">
        <div className="rb-form-group">
          <label>Pincode *</label>
          <input
            type="text"
            name="pincode"
            value={signupData.pincode}
            onChange={handleChange}
            placeholder="Enter pincode"
            required
          />
        </div>
        <div className="rb-form-group">
          <label>GST Number</label>
          <input
            type="text"
            name="gstNumber"
            value={signupData.gstNumber}
            onChange={handleChange}
            placeholder="Enter GST number"
          />
        </div>
      </div>

      <div className="rb-form-group">
        <label>PAN Number</label>
        <input
          type="text"
          name="panNumber"
          value={signupData.panNumber}
          onChange={handleChange}
          placeholder="Enter PAN number"
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="rb-step-content">
      <h3>Bus Fleet Details</h3>
      <p>Tell us about your bus fleet and operations</p>

      <div className="rb-form-group">
        <label>Total Buses *</label>
        <input
          type="number"
          name="totalBuses"
          value={signupData.totalBuses}
          onChange={handleChange}
          placeholder="Enter number of buses"
          min="1"
          required
        />
      </div>

      <div className="rb-form-group">
        <label>Bus Types (Select all that apply)</label>
        <div className="rb-checkbox-group">
          {["AC", "Non-AC", "Sleeper", "Seater", "Volvo", "BharatBenz"].map((type) => (
            <label className="rb-checkbox-label" key={type}>
              <input
                type="checkbox"
                name="busTypes"
                value={type}
                checked={signupData.busTypes.includes(type)}
                onChange={handleChange}
              />
              {type}
            </label>
          ))}
        </div>
      </div>

      <div className="rb-form-group">
        <label>Operating Cities (comma separated)</label>
        <input
          type="text"
          value={signupData.operatingCities.join(", ")}
          onChange={(e) => handleArrayChange(e, "operatingCities")}
          placeholder="e.g. Mumbai, Delhi, Bangalore"
        />
      </div>

      <div className="rb-form-group">
        <label>Routes (comma separated)</label>
        <input
          type="text"
          value={signupData.routes.join(", ")}
          onChange={(e) => handleArrayChange(e, "routes")}
          placeholder="e.g. Mumbai-Pune, Delhi-Agra"
        />
      </div>

      <div className="rb-form-row">
        <div className="rb-form-group">
          <label>Transport Permit Number</label>
          <input
            type="text"
            name="transportPermitNumber"
            value={signupData.transportPermitNumber}
            onChange={handleChange}
            placeholder="Enter permit number"
          />
        </div>
        <div className="rb-form-group">
          <label>Operator License Number</label>
          <input
            type="text"
            name="operatorLicenseNumber"
            value={signupData.operatorLicenseNumber}
            onChange={handleChange}
            placeholder="Enter license number"
          />
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="rb-step-content">
      <h3>Bank Details</h3>
      <p>Provide your bank account for payments</p>

      <div className="rb-form-group">
        <label>Account Holder Name *</label>
        <input
          type="text"
          name="accountHolderName"
          value={signupData.accountHolderName}
          onChange={handleChange}
          placeholder="Enter account holder name"
          required
        />
      </div>

      <div className="rb-form-row">
        <div className="rb-form-group">
          <label>Bank Name *</label>
          <input
            type="text"
            name="bankName"
            value={signupData.bankName}
            onChange={handleChange}
            placeholder="Enter bank name"
            required
          />
        </div>
        <div className="rb-form-group">
          <label>IFSC Code *</label>
          <input
            type="text"
            name="ifscCode"
            value={signupData.ifscCode}
            onChange={handleChange}
            placeholder="Enter IFSC code"
            required
          />
        </div>
      </div>

      <div className="rb-form-group">
        <label>Account Number *</label>
        <input
          type="text"
          name="accountNumber"
          value={signupData.accountNumber}
          onChange={handleChange}
          placeholder="Enter account number"
          required
        />
      </div>

      <div className="rb-summary-box">
        <h4>Review your information</h4>
        <div className="rb-summary-item">
          <span>Name:</span> <strong>{signupData.name}</strong>
        </div>
        <div className="rb-summary-item">
          <span>Email:</span> <strong>{signupData.email}</strong>
        </div>
        <div className="rb-summary-item">
          <span>Phone:</span> <strong>{signupData.phone}</strong>
        </div>
        <div className="rb-summary-item">
          <span>Company:</span> <strong>{signupData.companyName || "Not provided"}</strong>
        </div>
        <div className="rb-summary-item">
          <span>Total Buses:</span> <strong>{signupData.totalBuses || "0"}</strong>
        </div>
        <div className="rb-summary-item">
          <span>City:</span> <strong>{signupData.city}</strong>
        </div>
        <div className="rb-summary-item">
          <span>Bus Types:</span> <strong>{signupData.busTypes.join(", ") || "Not selected"}</strong>
        </div>
      </div>
    </div>
  );

  return (
    <div className="rb-page">
      {/* ================= NAVBAR ================= */}
      <header className="rb-navbar">
        <div className="rb-nav-inner">
          <div className="rb-logo" onClick={() => window.scrollTo(0, 0)}>
            <div className="rb-logo-icon">
              <span>r</span>
            </div>
            <div className="rb-logo-text">
              <b>BirdMyTrip</b>
              <small>BUSINESS</small>
            </div>
          </div>

          <nav className="rb-nav-links">
            <a href="#opportunities">Opportunities</a>
            <a href="#capabilities">Capabilities</a>
            <a href="#testimonials">Testimonials</a>
            <a href="#faq">FAQs</a>
          </nav>

          <div className="rb-nav-actions">
            <button className="rb-login-btn" onClick={() => openAuth("login")}>
              Login
            </button>
            <button className="rb-callback-btn" onClick={() => openAuth("signup")}>
              Get a call back
            </button>
          </div>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="rb-hero">
        <div className="rb-hero-overlay"></div>
        <div className="rb-hero-content">
          <div className="rb-hero-left">
            <div className="rb-badge">
              <span className="rb-dot"></span>
              PARTNER WITH THE FUTURE OF BUS TRAVEL
            </div>
            <h1>
              Grow your business with the world's
              <span> #1 bus platform</span>
            </h1>
            <p>
              Join a powerful ecosystem built to help bus operators,
              travel businesses and vendors grow faster.
            </p>
            <div className="rb-hero-buttons">
              <button className="rb-primary-btn" onClick={() => openAuth("signup")}>
                Get started with BirdMyTrip
                <span>→</span>
              </button>
              <button className="rb-outline-btn" onClick={() =>
                document.getElementById("opportunities")?.scrollIntoView({ behavior: "smooth" })
              }>
                Explore opportunities
              </button>
            </div>
            <div className="rb-hero-trust">
              <div>
                <b>50L+</b>
                <span>Travellers</span>
              </div>
              <div className="rb-divider"></div>
              <div>
                <b>8000+</b>
                <span>Bus operators</span>
              </div>
              <div className="rb-divider"></div>
              <div>
                <b>1000+</b>
                <span>Routes to grow</span>
              </div>
            </div>
          </div>

          <div className="rb-hero-visual">
            <div className="rb-glow"></div>
            <div className="rb-hero-card rb-top-card">
              <span className="rb-card-icon">📊</span>
              <div>
                <small>BUSINESS GROWTH</small>
                <b>More bookings. More revenue.</b>
              </div>
            </div>
            <div className="rb-bus-illustration">
              <div className="rb-bus-top">
                <span>BirdMyTrip</span>
                <div className="rb-bus-lights"></div>
              </div>
              <div className="rb-bus-windows">
                <i></i><i></i><i></i><i></i><i></i>
              </div>
              <div className="rb-bus-body">
                <div className="rb-bus-stripe"></div>
              </div>
              <div className="rb-bus-wheels">
                <span></span><span></span>
              </div>
            </div>
            <div className="rb-hero-card rb-bottom-card">
              <div className="rb-mini-avatars">
                <span>✓</span><span>₹</span>
              </div>
              <div>
                <small>SMART OPERATIONS</small>
                <b>Everything managed digitally</b>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= REGISTER OPTIONS ================= */}
      <section className="rb-section rb-register-section">
        <div className="rb-container">
          <div className="rb-section-heading center">
            <span className="rb-eyebrow">GET STARTED</span>
            <h2>Choose how you want to grow</h2>
            <p>Multiple opportunities designed for every type of bus business.</p>
          </div>
          <div className="rb-register-grid">
            {registerCards.map((card, index) => (
              <div className="rb-register-card" key={index}>
                <div className="rb-register-icon">{card.icon}</div>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
                <button onClick={() => openAuth("signup")}>
                  {card.button}
                  <span>→</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PLATFORMS ================= */}
      <section className="rb-platform-section">
        <div className="rb-container rb-platform-wrap">
          <div className="rb-platform-content">
            <span className="rb-eyebrow light">EXPAND YOUR REACH</span>
            <h2>Go live across platforms</h2>
            <p>Maximize your reach with your inventory live across major digital travel platforms and reach more customers.</p>
            <div className="rb-platform-list">
              <div><span>✓</span> Reach more travellers</div>
              <div><span>✓</span> Centralized inventory management</div>
              <div><span>✓</span> Grow bookings across channels</div>
            </div>
          </div>
          <div className="rb-platform-visual">
            <div className="rb-platform-circle rb-circle-one"></div>
            <div className="rb-platform-circle rb-circle-two"></div>
            <div className="rb-platform-center">
              <div className="rb-platform-logo">r</div>
              <b>BirdMyTrip</b>
            </div>
            <div className="rb-platform-chip chip-1">Bus Booking</div>
            <div className="rb-platform-chip chip-2">Travel Partners</div>
            <div className="rb-platform-chip chip-3">Digital Sales</div>
            <div className="rb-platform-chip chip-4">More Reach</div>
          </div>
        </div>
      </section>

      {/* ================= CAPABILITIES ================= */}
      <section className="rb-section" id="capabilities">
        <div className="rb-container">
          <div className="rb-section-heading">
            <span className="rb-eyebrow">POWERFUL BUSINESS TOOLS</span>
            <h2>Capabilities powering India's online bus business</h2>
            <p>Powerful tools that help your business reach the next milestone.</p>
          </div>
          <div className="rb-benefit-grid">
            {benefits.map((item, index) => (
              <div className="rb-benefit-card" key={index}>
                <div className="rb-benefit-icon">{item.icon}</div>
                <div className="rb-benefit-number">0{index + 1}</div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <span className="rb-benefit-arrow">↗</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= NOVA ================= */}
      <section className="rb-nova-section">
        <div className="rb-container rb-nova-wrap">
          <div className="rb-nova-visual">
            <div className="rb-nova-main-card">
              <span className="rb-nova-small">NOVA MARKETPLACE</span>
              <h3>Parts. Vendors. Operators.</h3>
              <p>One ecosystem for smarter fleet procurement.</p>
              <div className="rb-nova-stat-row">
                <div><b>8000+</b><span>Operators</span></div>
                <div><b>Trusted</b><span>Vendors</span></div>
              </div>
            </div>
            <div className="rb-floating-part part-one">⚙️</div>
            <div className="rb-floating-part part-two">🔩</div>
            <div className="rb-floating-part part-three">🛞</div>
          </div>
          <div className="rb-nova-content">
            <span className="rb-eyebrow">NOVA</span>
            <h2>Buy best quality bus parts at better prices</h2>
            <p>NOVA is a fleet marketplace connecting bus operators with trusted vendors for quality parts at better prices.</p>
            <button className="rb-dark-btn" onClick={() => openAuth("signup")}>
              Explore NOVA <span>→</span>
            </button>
          </div>
        </div>
      </section>

      {/* ================= OPPORTUNITIES ================= */}
      <section className="rb-section rb-opportunity-section" id="opportunities">
        <div className="rb-container">
          <div className="rb-section-heading center">
            <span className="rb-eyebrow">WHY NOW</span>
            <h2>Why now is the time to start bus business</h2>
            <p>Your chance to profit from India's growing travel market.</p>
            <button className="rb-primary-btn rb-heading-btn" onClick={() => openAuth("signup")}>
              Get Started <span>→</span>
            </button>
          </div>
          <div className="rb-opportunity-grid">
            {opportunities.map((item, index) => (
              <div className="rb-opportunity-card" key={index}>
                <div className="rb-op-number">{item.number}</div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="rb-testimonial-section" id="testimonials">
        <div className="rb-container">
          <div className="rb-section-heading center">
            <span className="rb-eyebrow light">REAL STORIES</span>
            <h2>See what our operators are saying about us</h2>
          </div>
          <div className="rb-testimonial-grid">
            {testimonials.map((item, index) => (
              <div className="rb-testimonial-card" key={index}>
                <div className="rb-quote">“</div>
                <p>{item.quote}</p>
                <div className="rb-person">
                  <div className="rb-person-avatar">{item.initials}</div>
                  <div>
                    <h4>{item.name}</h4>
                    <span>{item.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PHONE CTA ================= */}
      <section className="rb-phone-section">
        <div className="rb-phone-shape one"></div>
        <div className="rb-phone-shape two"></div>
        <div className="rb-container rb-phone-wrap">
          <div>
            <span className="rb-eyebrow light">START TODAY</span>
            <h2>Be part of world's largest bus booking platform</h2>
            <p>Register with your phone number to get started instantly.</p>
          </div>
          <div className="rb-phone-box">
            <div className="rb-phone-input-wrap">
              <span>🇮🇳 +91</span>
              <input type="text" placeholder="Enter mobile number" />
            </div>
            <button onClick={handlePhoneStart}>Generate OTP</button>
            <small>By continuing, you agree to our terms and privacy policy.</small>
          </div>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section className="rb-section rb-faq-section" id="faq">
        <div className="rb-container rb-faq-wrap">
          <div className="rb-faq-intro">
            <span className="rb-eyebrow">HELP CENTER</span>
            <h2>Frequently asked questions</h2>
            <p>Find answers to common questions about joining and growing your business.</p>
            <button className="rb-outline-dark" onClick={() => openAuth("signup")}>
              Get started now →
            </button>
          </div>
          <div className="rb-faq-list">
            {faqs.map((item, index) => (
              <div className={`rb-faq-item ${faqOpen === index ? "open" : ""}`} key={index}>
                <button className="rb-faq-question" onClick={() => setFaqOpen(faqOpen === index ? null : index)}>
                  <span>{item.q}</span>
                  <b>{faqOpen === index ? "−" : "+"}</b>
                </button>
                {faqOpen === index && (
                  <div className="rb-faq-answer">
                    <p>{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="rb-footer">
        <div className="rb-container">
          <div className="rb-footer-top">
            <div className="rb-footer-brand">
              <div className="rb-logo">
                <div className="rb-logo-icon"><span>r</span></div>
                <div className="rb-logo-text">
                  <b>BirdMyTrip</b>
                  <small>BUSINESS</small>
                </div>
              </div>
              <p>Build, manage and grow your bus business with a powerful digital ecosystem.</p>
            </div>
            <div className="rb-footer-column">
              <h4>About BirdMyTrip</h4>
              <a href="#contact">Contact us</a>
              <a href="#sitemap">Sitemap</a>
              <a href="#offers">Offers</a>
              <a href="#careers">Careers</a>
            </div>
            <div className="rb-footer-column">
              <h4>Info</h4>
              <a href="#terms">T&C</a>
              <a href="#privacy">Privacy policy</a>
              <a href="#blog">Blog</a>
              <a href="#operator">Bus operator registration</a>
              <a href="#agent">Agent registration</a>
              <a href="#security">Report Security Issues</a>
            </div>
            <div className="rb-footer-column">
              <h4>Global Sites</h4>
              <a href="#india">India</a>
              <a href="#singapore">Singapore</a>
              <a href="#malaysia">Malaysia</a>
              <a href="#indonesia">Indonesia</a>
              <a href="#peru">Peru</a>
              <a href="#colombia">Colombia</a>
              <a href="#vietnam">Vietnam</a>
            </div>
            <div className="rb-footer-column">
              <h4>Our Partners</h4>
              <a href="#goibibo">Goibibo Bus</a>
              <a href="#goibibo-hotels">Goibibo Hotels</a>
              <a href="#makemytrip">Makemytrip Hotels</a>
            </div>
          </div>
          <div className="rb-footer-description">
            BirdMyTrip is one of the world's leading online bus ticket booking platforms, helping travellers discover and book bus journeys while enabling operators to grow their business digitally.
          </div>
          <div className="rb-footer-bottom">
            <span>© 2026 MakeMyTrip (India) Limited. All rights reserved.</span>
            <div>
              <a href="#privacy">Privacy</a>
              <a href="#terms">Terms</a>
            </div>
          </div>
        </div>
      </footer>

      {/* ================= AUTH MODAL ================= */}
      {authOpen && (
        <div className="rb-auth-overlay">
          <div className="rb-auth-modal">
            <button className="rb-modal-close" onClick={() => setAuthOpen(false)}>
              ×
            </button>

            <div className="rb-auth-side">
              <div className="rb-auth-side-logo">
                <span>r</span> BirdMyTrip
              </div>
              <h2>
                Grow your business.
                <br />
                <span>Start today.</span>
              </h2>
              <p>Join our partner ecosystem and manage your business digitally.</p>
              <div className="rb-auth-side-points">
                <div>✓ Reach more customers</div>
                <div>✓ Manage your business online</div>
                <div>✓ Grow with powerful tools</div>
              </div>
            </div>

            <div className="rb-auth-form-side">
              <div className="rb-auth-tabs">
                <button className={authMode === "login" ? "active" : ""} onClick={() => setAuthMode("login")}>
                  Login
                </button>
                <button className={authMode === "signup" ? "active" : ""} onClick={() => { setAuthMode("signup"); setStep(1); }}>
                  Register
                </button>
              </div>

              {authMode === "login" ? (
                // ========== LOGIN FORM ==========
                <form onSubmit={handleLogin}>
                  <h2>Welcome back</h2>
                  <p className="rb-form-subtitle">Login to access your vendor dashboard.</p>
                  <div className="rb-form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      placeholder="Enter email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    />
                  </div>
                  <div className="rb-form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      placeholder="Enter password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    />
                  </div>
                  <button className="rb-form-submit" type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                  </button>
                  <p className="rb-form-switch">
                    New here?
                    <span onClick={() => { setAuthMode("signup"); setStep(1); }}>
                      Create an account
                    </span>
                  </p>
                </form>
              ) : (
                // ========== 4-STEP REGISTRATION FORM ==========
                <>
                  {showOtpInput ? (
                    // OTP Verification
                    <div>
                      <h2>Verify your email</h2>
                      <p className="rb-form-subtitle">
                        We've sent a 6-digit OTP to <strong>{signupData.email}</strong>
                      </p>
                      <div className="rb-form-group">
                        <label>Enter OTP</label>
                        <input
                          type="text"
                          placeholder="Enter 6-digit OTP"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          maxLength="6"
                        />
                      </div>
                      <button className="rb-form-submit" type="button" onClick={handleVerifyOtp} disabled={loading}>
                        Verify OTP
                      </button>
                      <p className="rb-form-switch" style={{ marginTop: "15px" }}>
                        Didn't receive OTP?
                        <span
                          onClick={() => {
                            const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
                            setGeneratedOtp(newOtp);
                            axios.post(`${API_URL}/send-otp`, {
                              email: signupData.email,
                              otp: newOtp,
                            });
                            alert("New OTP sent!");
                          }}
                        >
                          Resend OTP
                        </span>
                      </p>
                      <p className="rb-form-switch">
                        Already registered?
                        <span
                          onClick={() => {
                            setAuthMode("login");
                            setShowOtpInput(false);
                            setOtp("");
                            setStep(1);
                          }}
                        >
                          Login now
                        </span>
                      </p>
                    </div>
                  ) : (
                    // 4-STEP REGISTRATION FORM
                    <form onSubmit={handleSignup}>
                      {/* Progress Steps */}
                      <div className="rb-progress-steps">
                        {["Basic Details", "Business & Address", "Bus Fleet", "Bank Details"].map((label, i) => (
                          <div
                            key={i}
                            className={`rb-progress-step ${step > i + 1 ? "completed" : ""} ${step === i + 1 ? "active" : ""}`}
                          >
                            <div className="rb-progress-number">{i + 1}</div>
                            <div className="rb-progress-label">{label}</div>
                            {i < 3 && <div className="rb-progress-line"></div>}
                          </div>
                        ))}
                      </div>

                      {/* Step Content */}
                      {step === 1 && renderStep1()}
                      {step === 2 && renderStep2()}
                      {step === 3 && renderStep3()}
                      {step === 4 && renderStep4()}

                      {/* Navigation Buttons */}
                      <div className="rb-form-actions">
                        {step > 1 && (
                          <button type="button" className="rb-prev-btn" onClick={prevStep}>
                            ← Previous
                          </button>
                        )}
                        {step < 4 ? (
                          <button type="button" className="rb-next-btn" onClick={nextStep}>
                            Next Step →
                          </button>
                        ) : (
                          <button type="submit" className="rb-submit-btn" disabled={loading}>
                            {loading ? "Registering..." : "Submit & Start Selling"}
                          </button>
                        )}
                      </div>

                      <p className="rb-form-switch" style={{ marginTop: "20px" }}>
                        Already registered?
                        <span
                          onClick={() => {
                            setAuthMode("login");
                            setShowOtpInput(false);
                            setOtp("");
                            setStep(1);
                          }}
                        >
                          Login now
                        </span>
                      </p>
                    </form>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}