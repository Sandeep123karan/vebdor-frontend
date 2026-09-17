import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API_BASE =
  process.env.REACT_APP_API_URL ||
  "http://localhost:7000";

const LOGIN_URL =
  `${API_BASE}/api/vendor/auth/login`;

export default function VendorLogin() {
  const navigate = useNavigate();
  const location = useLocation();

  const applicationSubmitted =
    location.state?.applicationSubmitted === true;

  const [form, setForm] = useState({
    email: location.state?.email || "",
    password: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const token =
      localStorage.getItem(
        "vendorToken"
      );

    const vendorRaw =
      localStorage.getItem(
        "vendorUser"
      );

    if (!token || !vendorRaw) return;

    try {
      const vendor =
        JSON.parse(vendorRaw);

      const dashboard =
        getDashboardFromVendor(
          vendor
        );

      navigate(dashboard, {
        replace: true,
      });
    } catch {
      localStorage.removeItem(
        "vendorToken"
      );

      localStorage.removeItem(
        "vendorUser"
      );
    }
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value } =
      event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) setError("");
  };

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      const email =
        form.email
          .trim()
          .toLowerCase();

      const password =
        form.password;

      if (!email) {
        setError(
          "Please enter your registered email."
        );
        return;
      }

      if (!password) {
        setError(
          "Please enter your password."
        );
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response =
          await fetch(
            LOGIN_URL,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  email,
                  password,
                }),
            }
          );

        const data =
          await response
            .json()
            .catch(() => ({}));

        if (!response.ok) {
          if (
            response.status ===
              403 &&
            data?.code ===
              "ADMIN_APPROVAL_REQUIRED"
          ) {
            throw new Error(
              data?.message ||
                "Your BMT Connect application is waiting for admin approval."
            );
          }

          if (
            response.status ===
              403 &&
            data?.code ===
              "APPLICATION_REJECTED"
          ) {
            throw new Error(
              data?.message ||
                "Your vendor application has been rejected."
            );
          }

          if (
            response.status ===
              403 &&
            data?.code ===
              "ACCOUNT_SUSPENDED"
          ) {
            throw new Error(
              data?.message ||
                "Your vendor account is suspended."
            );
          }

          throw new Error(
            data?.message ||
              "Invalid email or password."
          );
        }

        if (
          !data?.success ||
          !data?.token
        ) {
          throw new Error(
            "Login response did not contain a valid vendor session."
          );
        }

        if (!data?.vendor) {
          throw new Error(
            "Vendor profile is missing from login response."
          );
        }

        localStorage.setItem(
          "vendorToken",
          data.token
        );

        localStorage.setItem(
          "vendorUser",
          JSON.stringify(
            data.vendor
          )
        );

        /*
         * First preference:
         * backend-calculated dashboard.
         *
         * Fallback:
         * calculate only from the
         * vendor object returned by backend.
         *
         * Never use onboarding/localStorage
         * selectedVertical as authority.
         */
        const dashboard =
          normalizeDashboard(
            data.dashboard
          ) ||
          getDashboardFromVendor(
            data.vendor
          );

        navigate(dashboard, {
          replace: true,
        });
      } catch (requestError) {
        localStorage.removeItem(
          "vendorToken"
        );

        localStorage.removeItem(
          "vendorUser"
        );

        setError(
          requestError?.message ||
            "Unable to sign in."
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div style={styles.page}>
      <div style={styles.left}>
        <div style={styles.brand}>
          <div style={styles.logo}>
            B
          </div>

          <div>
            <div
              style={
                styles.brandName
              }
            >
              BMT Connect
            </div>

            <div
              style={
                styles.brandSub
              }
            >
              BirdMyTrip Partner
              Platform
            </div>
          </div>
        </div>

        <div style={styles.hero}>
          <div
            style={
              styles.heroBadge
            }
          >
            SUPPLIER EXTRANET
          </div>

          <h1
            style={
              styles.heroTitle
            }
          >
            Manage your travel
            business from one
            powerful workspace.
          </h1>

          <p
            style={
              styles.heroText
            }
          >
            Access bookings,
            inventory, rates,
            operations, payments
            and performance for
            your approved BMT
            Connect business.
          </p>

          <div
            style={
              styles.featureGrid
            }
          >
            <Feature
              title="Secure access"
              text="Approved vendor accounts only"
            />

            <Feature
              title="Your dashboard"
              text="Opens your registered vertical automatically"
            />

            <Feature
              title="Live operations"
              text="Manage bookings and inventory"
            />

            <Feature
              title="BMT Connect"
              text="One supplier operating platform"
            />
          </div>
        </div>

        <div
          style={
            styles.leftFooter
          }
        >
          © BMT Connect ·
          BirdMyTrip
        </div>
      </div>

      <div style={styles.right}>
        <div
          style={
            styles.loginCard
          }
        >
          <div
            style={
              styles.mobileBrand
            }
          >
            <div style={styles.logo}>
              B
            </div>

            <strong>
              BMT Connect
            </strong>
          </div>

          <div
            style={
              styles.loginEyebrow
            }
          >
            VENDOR SIGN IN
          </div>

          <h2
            style={
              styles.loginTitle
            }
          >
            Welcome back
          </h2>

          <p
            style={
              styles.loginSubtitle
            }
          >
            Sign in with the email
            and password used during
            your vendor registration.
          </p>

          {applicationSubmitted && (
            <div style={styles.submittedBox}>
              <div style={styles.submittedIcon}>✓</div>
              <div>
                <strong>Application submitted successfully</strong>
                <div style={styles.submittedText}>
                  Your vendor account is waiting for BMT Connect admin approval.
                  After approval, sign in here with the same registered email and password.
                </div>
              </div>
            </div>
          )}

          {error && (
            <div
              style={
                styles.errorBox
              }
            >
              <div
                style={
                  styles.errorIcon
                }
              >
                !
              </div>

              <div>{error}</div>
            </div>
          )}

          <form
            onSubmit={
              handleSubmit
            }
          >
            <label
              style={
                styles.label
              }
            >
              Registered email
            </label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={
                handleChange
              }
              placeholder="name@company.com"
              autoComplete="email"
              style={styles.input}
            />

            <label
              style={{
                ...styles.label,
                marginTop: 18,
              }}
            >
              Password
            </label>

            <div
              style={
                styles.passwordWrap
              }
            >
              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                value={
                  form.password
                }
                onChange={
                  handleChange
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                style={
                  styles.passwordInput
                }
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (value) =>
                      !value
                  )
                }
                style={
                  styles.showButton
                }
              >
                {showPassword
                  ? "Hide"
                  : "Show"}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.loginButton,

                opacity: loading
                  ? 0.7
                  : 1,

                cursor: loading
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              {loading
                ? "Signing in..."
                : "Sign in to BMT Connect"}
            </button>
          </form>

          <div
            style={
              styles.approvalNote
            }
          >
            <strong>
              Application recently
              submitted?
            </strong>

            <span>
              You can sign in only
              after BMT Connect admin
              approves your vendor
              application.
            </span>
          </div>

          <div
            style={
              styles.securityText
            }
          >
            Your dashboard is selected
            from your approved vendor
            record. Hotel credentials
            open the Hotel workspace,
            Bus credentials open the
            Bus workspace, and so on.
          </div>
        </div>
      </div>
    </div>
  );
}

function normalizeDashboard(
  dashboard
) {
  if (
    typeof dashboard ===
    "string"
  ) {
    return dashboard;
  }

  /*
   * Backward compatibility in case
   * old backend still returns:
   *
   * dashboard: {
   *   dashboard: "/vendor/..."
   * }
   */
  if (
    dashboard &&
    typeof dashboard.dashboard ===
      "string"
  ) {
    return dashboard.dashboard;
  }

  return "";
}

function getDashboardFromVendor(
  vendor
) {
  const vertical =
    String(
      vendor?.selectedVertical ||
        vendor?.vertical ||
        ""
    )
      .trim()
      .toLowerCase();

  if (!vertical) {
    return "/vendor";
  }

  if (vertical === "stay") {
    const subtype =
      String(
        vendor?.staySubtype ||
          vendor?.service ||
          ""
      )
        .trim()
        .toLowerCase();

    if (!subtype) {
      return "/vendor";
    }

    return `/vendor/stay/${subtype}`;
  }

  const supported = [
    "bus",
    "cab",
    "packages",
    "activities",
    "events",
    "darshan",
    "cruise",
  ];

  if (
    supported.includes(vertical)
  ) {
    return `/vendor/${vertical}`;
  }

  return "/vendor";
}

function Feature({
  title,
  text,
}) {
  return (
    <div
      style={
        styles.featureCard
      }
    >
      <div
        style={
          styles.checkCircle
        }
      >
        ✓
      </div>

      <div>
        <div
          style={
            styles.featureTitle
          }
        >
          {title}
        </div>

        <div
          style={
            styles.featureText
          }
        >
          {text}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    gridTemplateColumns:
      "minmax(430px, 1.08fr) minmax(420px, .92fr)",
    fontFamily:
      "'Inter','Segoe UI',Arial,sans-serif",
    background: "#f8fafc",
  },

  left: {
    position: "relative",
    minHeight: "100vh",
    padding: "38px 52px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    color: "#fff",
    background:
      "radial-gradient(circle at 80% 15%, rgba(249,115,22,.28), transparent 30%), linear-gradient(145deg,#111827 0%,#172554 55%,#0f172a 100%)",
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: 13,
    position: "relative",
    zIndex: 2,
  },

  logo: {
    width: 44,
    height: 44,
    borderRadius: 13,
    display: "grid",
    placeItems: "center",
    background:
      "linear-gradient(135deg,#fb923c,#ea580c)",
    color: "#fff",
    fontSize: 21,
    fontWeight: 900,
    boxShadow:
      "0 10px 30px rgba(234,88,12,.28)",
  },

  brandName: {
    fontSize: 19,
    fontWeight: 800,
    letterSpacing: "-.3px",
  },

  brandSub: {
    marginTop: 2,
    color: "#cbd5e1",
    fontSize: 11,
  },

  hero: {
    width: "100%",
    maxWidth: 650,
    margin: "auto 0",
    position: "relative",
    zIndex: 2,
  },

  heroBadge: {
    display: "inline-flex",
    padding: "7px 11px",
    borderRadius: 999,
    background:
      "rgba(249,115,22,.14)",
    border:
      "1px solid rgba(251,146,60,.35)",
    color: "#fdba74",
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: "1.2px",
  },

  heroTitle: {
    maxWidth: 610,
    margin: "20px 0 16px",
    fontSize:
      "clamp(38px,4.3vw,64px)",
    lineHeight: 1.04,
    letterSpacing: "-2.2px",
  },

  heroText: {
    maxWidth: 570,
    margin: 0,
    color: "#cbd5e1",
    fontSize: 16,
    lineHeight: 1.75,
  },

  featureGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2,minmax(0,1fr))",
    gap: 12,
    marginTop: 34,
  },

  featureCard: {
    display: "flex",
    gap: 11,
    padding: 14,
    border:
      "1px solid rgba(255,255,255,.09)",
    borderRadius: 14,
    background:
      "rgba(255,255,255,.045)",
  },

  checkCircle: {
    width: 25,
    height: 25,
    flex: "0 0 25px",
    display: "grid",
    placeItems: "center",
    borderRadius: 999,
    background:
      "rgba(249,115,22,.16)",
    color: "#fb923c",
    fontWeight: 900,
  },

  featureTitle: {
    fontSize: 13,
    fontWeight: 800,
  },

  featureText: {
    marginTop: 3,
    color: "#94a3b8",
    fontSize: 11,
    lineHeight: 1.45,
  },

  leftFooter: {
    position: "relative",
    zIndex: 2,
    color: "#64748b",
    fontSize: 11,
  },

  right: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: 34,
    boxSizing: "border-box",
    background: "#f8fafc",
  },

  loginCard: {
    width: "100%",
    maxWidth: 470,
    padding: "38px 38px 34px",
    boxSizing: "border-box",
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 22,
    boxShadow:
      "0 24px 70px rgba(15,23,42,.09)",
  },

  mobileBrand: {
    display: "none",
    alignItems: "center",
    gap: 10,
    marginBottom: 30,
  },

  loginEyebrow: {
    color: "#ea580c",
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: "1.4px",
  },

  loginTitle: {
    margin: "8px 0 7px",
    color: "#111827",
    fontSize: 32,
    letterSpacing: "-1px",
  },

  loginSubtitle: {
    margin: "0 0 28px",
    color: "#6b7280",
    fontSize: 14,
    lineHeight: 1.6,
  },

  submittedBox: {
    display: "flex",
    gap: 11,
    alignItems: "flex-start",
    padding: 14,
    marginBottom: 20,
    borderRadius: 12,
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    color: "#166534",
    fontSize: 13,
    lineHeight: 1.5,
  },

  submittedIcon: {
    width: 24,
    height: 24,
    flex: "0 0 24px",
    display: "grid",
    placeItems: "center",
    borderRadius: 999,
    background: "#16a34a",
    color: "#fff",
    fontSize: 13,
    fontWeight: 900,
  },

  submittedText: {
    marginTop: 4,
    color: "#15803d",
    fontSize: 12,
    lineHeight: 1.55,
  },

  errorBox: {
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
    padding: 13,
    marginBottom: 20,
    borderRadius: 11,
    background: "#fff7ed",
    border: "1px solid #fed7aa",
    color: "#9a3412",
    fontSize: 13,
    lineHeight: 1.5,
  },

  errorIcon: {
    width: 21,
    height: 21,
    flex: "0 0 21px",
    display: "grid",
    placeItems: "center",
    borderRadius: 999,
    background: "#ea580c",
    color: "#fff",
    fontSize: 12,
    fontWeight: 900,
  },

  label: {
    display: "block",
    marginBottom: 7,
    color: "#374151",
    fontSize: 12,
    fontWeight: 800,
  },

  input: {
    width: "100%",
    height: 50,
    padding: "0 14px",
    boxSizing: "border-box",
    border: "1px solid #d1d5db",
    borderRadius: 11,
    outline: "none",
    background: "#fff",
    color: "#111827",
    fontSize: 14,
  },

  passwordWrap: {
    display: "flex",
    alignItems: "center",
    height: 50,
    border: "1px solid #d1d5db",
    borderRadius: 11,
    overflow: "hidden",
    background: "#fff",
  },

  passwordInput: {
    flex: 1,
    height: "100%",
    minWidth: 0,
    padding: "0 14px",
    border: 0,
    outline: "none",
    color: "#111827",
    fontSize: 14,
  },

  showButton: {
    height: "100%",
    padding: "0 14px",
    border: 0,
    background: "transparent",
    color: "#ea580c",
    fontSize: 12,
    fontWeight: 800,
    cursor: "pointer",
  },

  loginButton: {
    width: "100%",
    height: 52,
    marginTop: 24,
    border: 0,
    borderRadius: 11,
    background:
      "linear-gradient(135deg,#f97316,#ea580c)",
    color: "#fff",
    fontSize: 14,
    fontWeight: 900,
    boxShadow:
      "0 10px 25px rgba(234,88,12,.22)",
  },

  approvalNote: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
    marginTop: 23,
    padding: 14,
    borderRadius: 12,
    background: "#f8fafc",
    color: "#64748b",
    fontSize: 12,
    lineHeight: 1.5,
  },

  securityText: {
    marginTop: 18,
    color: "#9ca3af",
    fontSize: 11,
    lineHeight: 1.55,
    textAlign: "center",
  },
};
