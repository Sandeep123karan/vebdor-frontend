import { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:7000/api/vendor/auth";

// Backend Vendor.model.js ke "service" enum se EXACT match
const SERVICE_OPTIONS = [
  { value: "hotel", label: "🏨 Hotel" },
  { value: "homestay", label: "🏠 Homestay" },
  { value: "resort", label: "🏝️ Resort" },
  { value: "villa", label: "🏡 Villa" },
  { value: "apartment", label: "🏢 Apartment" },
  { value: "guesthouse", label: "🛏️ Guesthouse" },
  { value: "hostel", label: "🛌 Hostel" },
  { value: "camp", label: "⛺ Camp" },
  { value: "farmhouse", label: "🌾 Farmhouse" },
  { value: "cab", label: "🚗 Cab" },
  { value: "bus", label: "🚌 Bus" },
  { value: "holiday-package", label: "🧳 Holiday Package" },
  { value: "BMT Darshan", label: "🕉️ BMT Darshan" },
  { value: "visa", label: "🛂 Visa" },
  { value: "travel-insurance", label: "🛡️ Travel Insurance" },
  { value: "cruise", label: "🚢 Cruise" },
  { value: "vacation-home", label: "🏘️ Vacation Home" },
  { value: "other", label: "➕ Other" },
];

export default function Auth({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    service: "",
    companyName: "",
    gstNumber: "",
    panNumber: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  /* ================= VALIDATION ================= */
  const validateForm = () => {
    if (!form.email || !form.password) {
      setError("Email and password are required");
      return false;
    }

    // Backend User schema email pattern se aligned basic check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (!isLogin) {
      if (!form.name) {
        setError("Full name is required");
        return false;
      }
      if (!form.phone) {
        setError("Phone number is required");
        return false;
      }
      // Backend Vendor.phone required field ke liye 10-digit basic check
      if (!/^\d{10}$/.test(form.phone)) {
        setError("Phone number must be 10 digits");
        return false;
      }
      if (!form.service) {
        setError("Please select a service type");
        return false;
      }
      if (form.password.length < 6) {
        setError("Password must be at least 6 characters");
        return false;
      }
    }

    return true;
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        // POST /api/vendor/auth/login -> { token, vendor }
        const { data } = await axios.post(`${API_URL}/login`, {
          email: form.email,
          password: form.password,
        });

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.vendor));

        if (onAuthSuccess) {
          onAuthSuccess(data.vendor);
        }

        // Backend already blocks PENDING/REJECTED/disabled vendors with 403,
        // so agar yahan tak pahuche toh vendor APPROVED + active hai
        window.location.href = "/dashboard";
      } else {
        // POST /api/vendor/auth/signup
        const signupData = {
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          service: form.service,
          companyName: form.companyName || "",
          gstNumber: form.gstNumber || "",
          panNumber: form.panNumber || "",
          address: form.address || "",
          city: form.city || "",
          state: form.state || "",
          pincode: form.pincode || "",
        };

        const { data } = await axios.post(`${API_URL}/signup`, signupData);

        alert(data.message || "Signup successful! Please wait for admin approval.");

        // Reset form and switch to login
        setIsLogin(true);
        setForm({
          name: "",
          email: "",
          phone: "",
          password: "",
          service: "",
          companyName: "",
          gstNumber: "",
          panNumber: "",
          address: "",
          city: "",
          state: "",
          pincode: "",
        });
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>
            {isLogin ? "Vendor Login" : "Vendor Registration"}
          </h2>
          <p style={styles.subtitle}>
            {isLogin
              ? "Welcome back! Login to your vendor account"
              : "Create your vendor account and start growing your business"}
          </p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {!isLogin && (
            <>
              {/* Name */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>Full Name *</label>
                <input
                  name="name"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              {/* Phone */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>Phone Number *</label>
                <input
                  name="phone"
                  type="tel"
                  placeholder="9876543210"
                  value={form.phone}
                  onChange={handleChange}
                  style={styles.input}
                  maxLength={10}
                />
              </div>

              {/* Service - matches backend enum exactly */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>Service Type *</label>
                <select
                  name="service"
                  value={form.service}
                  onChange={handleChange}
                  style={styles.select}
                >
                  <option value="">Select Service</option>
                  {SERVICE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Company Details */}
              <div style={styles.row}>
                <div style={{ ...styles.inputGroup, flex: 1 }}>
                  <label style={styles.label}>Company Name</label>
                  <input
                    name="companyName"
                    placeholder="Company Name"
                    value={form.companyName}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>
                <div style={{ ...styles.inputGroup, flex: 1 }}>
                  <label style={styles.label}>GST Number</label>
                  <input
                    name="gstNumber"
                    placeholder="GSTIN"
                    value={form.gstNumber}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.row}>
                <div style={{ ...styles.inputGroup, flex: 1 }}>
                  <label style={styles.label}>PAN Number</label>
                  <input
                    name="panNumber"
                    placeholder="PAN"
                    value={form.panNumber}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>
              </div>

              {/* Address */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>Address</label>
                <input
                  name="address"
                  placeholder="Street Address"
                  value={form.address}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.row}>
                <div style={{ ...styles.inputGroup, flex: 1 }}>
                  <label style={styles.label}>City</label>
                  <input
                    name="city"
                    placeholder="City"
                    value={form.city}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>
                <div style={{ ...styles.inputGroup, flex: 1 }}>
                  <label style={styles.label}>State</label>
                  <input
                    name="state"
                    placeholder="State"
                    value={form.state}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>
                <div style={{ ...styles.inputGroup, flex: 1 }}>
                  <label style={styles.label}>Pincode</label>
                  <input
                    name="pincode"
                    placeholder="Pincode"
                    value={form.pincode}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>
              </div>
            </>
          )}

          {/* Email - Common for both */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address *</label>
            <input
              name="email"
              type="email"
              placeholder="vendor@example.com"
              value={form.email}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          {/* Password - Common for both */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password *</label>
            <div style={styles.passwordWrapper}>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder={isLogin ? "Enter your password" : "Min 6 characters"}
                value={form.password}
                onChange={handleChange}
                style={styles.passwordInput}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.passwordToggle}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? (
              <span style={styles.loadingText}>
                <span style={styles.spinner}>⏳</span>{" "}
                {isLogin ? "Logging in..." : "Registering..."}
              </span>
            ) : isLogin ? (
              "Login"
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.switchText}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <span
              style={styles.link}
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setForm({
                  ...form,
                  password: "",
                });
              }}
            >
              {isLogin ? " Sign Up" : " Login"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */
const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  card: {
    background: "#fff",
    borderRadius: "16px",
    padding: "40px",
    maxWidth: "550px",
    width: "100%",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  header: {
    textAlign: "center",
    marginBottom: "30px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1a1a2e",
    margin: "0 0 8px 0",
  },
  subtitle: {
    fontSize: "14px",
    color: "#666",
    margin: "0",
  },
  error: {
    background: "#fee",
    color: "#c0392b",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "14px",
    border: "1px solid #f5c6cb",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#333",
  },
  input: {
    padding: "12px 14px",
    border: "2px solid #e0e0e0",
    borderRadius: "8px",
    fontSize: "14px",
    transition: "all 0.3s",
    outline: "none",
    background: "#fafafa",
  },
  select: {
    padding: "12px 14px",
    border: "2px solid #e0e0e0",
    borderRadius: "8px",
    fontSize: "14px",
    transition: "all 0.3s",
    outline: "none",
    background: "#fafafa",
    cursor: "pointer",
  },
  row: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  passwordWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
    padding: "12px 14px",
    border: "2px solid #e0e0e0",
    borderRadius: "8px",
    fontSize: "14px",
    transition: "all 0.3s",
    outline: "none",
    background: "#fafafa",
    paddingRight: "50px",
  },
  passwordToggle: {
    position: "absolute",
    right: "12px",
    background: "none",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
    padding: "4px",
  },
  button: {
    padding: "14px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s",
    marginTop: "8px",
    boxShadow: "0 4px 15px rgba(102,126,234,0.4)",
  },
  loadingText: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  spinner: {
    display: "inline-block",
    animation: "spin 1s linear infinite",
  },
  footer: {
    marginTop: "24px",
    textAlign: "center",
    paddingTop: "20px",
    borderTop: "1px solid #eee",
  },
  switchText: {
    fontSize: "14px",
    color: "#666",
    margin: "0",
  },
  link: {
    color: "#667eea",
    fontWeight: "600",
    cursor: "pointer",
    marginLeft: "4px",
    transition: "color 0.3s",
  },
};

// Add animation styles (only once, avoid duplicate injection on re-mount)
if (typeof document !== "undefined" && !document.getElementById("vendor-auth-anim")) {
  const styleSheet = document.createElement("style");
  styleSheet.id = "vendor-auth-anim";
  styleSheet.textContent = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    input:focus, select:focus {
      border-color: #667eea !important;
      background: #fff !important;
      box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
    }

    button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102,126,234,0.5);
    }

    button:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .link:hover {
      color: #5a67d8 !important;
      text-decoration: underline;
    }
  `;
  document.head.appendChild(styleSheet);
}