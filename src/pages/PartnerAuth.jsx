import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import "./PartnerAuth.css";

/* =====================================================
   API CONFIG
===================================================== */

const API_BASE =
  process.env.REACT_APP_API_URL ||
  "https://bmtvendorfinal.onrender.com";

const REGISTER_URL =
  `${API_BASE}/api/bmt-partner/auth/register`;

const LOGIN_URL =
  `${API_BASE}/api/bmt-partner/auth/login`;

/* =====================================================
   COUNTRY CODES
===================================================== */

const COUNTRY_CODES = [
  {
    code: "+91",
    label: "India",
    country: "India",
  },

  {
    code: "+971",
    label: "United Arab Emirates",
    country: "United Arab Emirates",
  },

  {
    code: "+1",
    label: "USA / Canada",
    country: "United States",
  },

  {
    code: "+44",
    label: "United Kingdom",
    country: "United Kingdom",
  },

  {
    code: "+65",
    label: "Singapore",
    country: "Singapore",
  },

  {
    code: "+66",
    label: "Thailand",
    country: "Thailand",
  },

  {
    code: "+62",
    label: "Indonesia",
    country: "Indonesia",
  },

  {
    code: "+60",
    label: "Malaysia",
    country: "Malaysia",
  },

  {
    code: "+977",
    label: "Nepal",
    country: "Nepal",
  },

  {
    code: "+94",
    label: "Sri Lanka",
    country: "Sri Lanka",
  },
];

/* =====================================================
   SUPPORTED VERTICALS
===================================================== */

const SUPPORTED_VERTICALS = [
  "stay",
  "bus",
  "cab",
  "packages",
  "activities",
  "events",
  "darshan",
  "cruise",
];

/* =====================================================
   GET SELECTED VERTICAL
===================================================== */

function getSelectedVertical(search) {
  const params =
    new URLSearchParams(search);

  const queryVertical =
    params.get("vertical");

  const storedVertical =
    localStorage.getItem(
      "selectedVertical"
    );

  const value =
    queryVertical ||
    storedVertical ||
    "";

  if (
    value &&
    SUPPORTED_VERTICALS.includes(
      value.toLowerCase()
    )
  ) {
    return value.toLowerCase();
  }

  return "";
}

/* =====================================================
   SAVE AUTHENTICATED PARTNER
   ONLY USED AFTER SUCCESSFUL LOGIN
===================================================== */

function saveAuthenticatedPartner(data) {
  const token =
    data?.token;

  const partner =
    data?.partner ||
    data?.user ||
    data?.vendor ||
    data?.account ||
    null;

  if (!token) {
    return false;
  }

  localStorage.setItem(
    "token",
    token
  );

  if (partner) {
    localStorage.setItem(
      "user",
      JSON.stringify(partner)
    );

    const partnerVertical =
      partner.selectedVertical ||
      partner.vertical ||
      partner.service ||
      "";

    if (partnerVertical) {
      localStorage.setItem(
        "selectedVertical",
        partnerVertical
      );
    }
  }

  return true;
}

/* =====================================================
   CHECK ONBOARDING COMPLETE

   IMPORTANT:
   Backend boolean is the source of truth.
   Do NOT treat onboardingStatus="active" as complete,
   because accountStatus can be active while onboarding
   is still pending/incomplete.
===================================================== */

function isOnboardingComplete(data) {
  const partner =
    data?.partner ||
    data?.user ||
    data?.vendor ||
    data?.account ||
    {};

  return Boolean(
    data?.onboardingComplete === true ||
    partner?.onboardingComplete === true
  );
}

/* =====================================================
   MAIN COMPONENT
===================================================== */

export default function PartnerAuth({
  mode = "signup",
}) {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const isSignup =
    mode === "signup";

  const selectedVertical =
    useMemo(
      () =>
        getSelectedVertical(
          location.search
        ),
      [location.search]
    );

  /* ===================================================
     FORM STATE
  =================================================== */

  const [form, setForm] =
    useState({
      email: "",
      countryCode: "+91",
      phone: "",
      password: "",
      confirmPassword: "",
      terms: false,
    });

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  /* ===================================================
     SIGNIN PAGE:
     PREFILL EMAIL AFTER REGISTRATION
  =================================================== */

  useEffect(() => {
    if (isSignup) {
      return;
    }

    const createdEmail =
      location.state?.email;

    const accountCreated =
      location.state?.accountCreated;

    if (createdEmail) {
      setForm((previous) => ({
        ...previous,
        email: createdEmail,
      }));
    }

    if (accountCreated) {
      setSuccessMessage(
        "Account created successfully. Please sign in with your email and password."
      );
    }
  }, [
    isSignup,
    location.state,
  ]);

  /* ===================================================
     SET FIELD
  =================================================== */

  const setValue = (
    name,
    value
  ) => {
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (message) {
      setMessage("");
    }

    if (successMessage) {
      setSuccessMessage("");
    }
  };

  /* ===================================================
     NAVIGATION
  =================================================== */

  const goHome = () => {
    navigate("/");
  };

  const goSignin = () => {
    navigate(
      selectedVertical
        ? `/signin?vertical=${selectedVertical}`
        : "/signin"
    );
  };

  const goSignup = () => {
    navigate(
      selectedVertical
        ? `/signup?vertical=${selectedVertical}`
        : "/signup"
    );
  };

  /* ===================================================
     SIGN UP
  =================================================== */

  const handleSignup =
    async (event) => {
      event.preventDefault();

      setMessage("");
      setSuccessMessage("");

      /* -------------------------
         EMAIL
      ------------------------- */

      const email =
        form.email
          .trim()
          .toLowerCase();

      if (!email) {
        setMessage(
          "Business email is required."
        );

        return;
      }

      /* -------------------------
         PHONE
      ------------------------- */

      const cleanPhone =
        form.phone
          .replace(/\s+/g, "")
          .trim();

      if (!cleanPhone) {
        setMessage(
          "Phone number is required."
        );

        return;
      }

      /* -------------------------
         PASSWORD
      ------------------------- */

      if (!form.password) {
        setMessage(
          "Password is required."
        );

        return;
      }

      if (
        form.password.length < 6
      ) {
        setMessage(
          "Password must be at least 6 characters."
        );

        return;
      }

      /* -------------------------
         CONFIRM PASSWORD
      ------------------------- */

      if (
        form.password !==
        form.confirmPassword
      ) {
        setMessage(
          "Passwords do not match."
        );

        return;
      }

      /* -------------------------
         TERMS
      ------------------------- */

      if (!form.terms) {
        setMessage(
          "Please accept the BMT Connect Partner Terms and Privacy Policy."
        );

        return;
      }

      setLoading(true);

      try {
        /* -------------------------
           COUNTRY
        ------------------------- */

        const countryData =
          COUNTRY_CODES.find(
            (item) =>
              item.code ===
              form.countryCode
          );

        /* -------------------------
           REGISTER PAYLOAD
        ------------------------- */

        const payload = {
          email,

          businessEmail:
            email,

          country:
            countryData?.country ||
            "",

          countryCode:
            form.countryCode,

          phone:
            `${form.countryCode}${cleanPhone}`,

          password:
            form.password,

          selectedVertical:
            selectedVertical ||
            "",

          vertical:
            selectedVertical ||
            "",

          service:
            selectedVertical ||
            "",
        };

        /* -------------------------
           REGISTER REQUEST
        ------------------------- */

        const response =
          await fetch(
            REGISTER_URL,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify(
                  payload
                ),
            }
          );

        const data =
          await response
            .json()
            .catch(() => ({}));

        /* -------------------------
           REGISTER FAILED
        ------------------------- */

        if (!response.ok) {
          throw new Error(
            data?.message ||
            data?.error ||
            "Unable to create account."
          );
        }

        /* =================================================
           IMPORTANT AUTH RULE

           REGISTER != LOGIN

           Account create hone ke baad
           user ko signin karna hi padega.

           Register API token bhej bhi de
           to hum frontend par use nahi karenge.
        ================================================= */

        localStorage.removeItem(
          "token"
        );

        localStorage.removeItem(
          "user"
        );

        localStorage.setItem(
          "onboardingComplete",
          "false"
        );

        if (selectedVertical) {
          localStorage.setItem(
            "selectedVertical",
            selectedVertical
          );
        }

        /* -------------------------
           GO TO SIGN IN
        ------------------------- */

        navigate(
          selectedVertical
            ? `/signin?vertical=${selectedVertical}`
            : "/signin",
          {
            replace: true,

            state: {
              accountCreated: true,
              email,
            },
          }
        );

        return;
      } catch (error) {
        setMessage(
          error?.message ||
          "Unable to create account."
        );
      } finally {
        setLoading(false);
      }
    };

  /* ===================================================
     SIGN IN
  =================================================== */

  const handleSignin =
    async (event) => {
      event.preventDefault();

      setMessage("");
      setSuccessMessage("");

      /* -------------------------
         VALIDATION
      ------------------------- */

      const email =
        form.email
          .trim()
          .toLowerCase();

      if (!email) {
        setMessage(
          "Email is required."
        );

        return;
      }

      if (!form.password) {
        setMessage(
          "Password is required."
        );

        return;
      }

      setLoading(true);

      try {
        /* -------------------------
           LOGIN REQUEST
        ------------------------- */

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
                  password:
                    form.password,
                }),
            }
          );

        const data =
          await response
            .json()
            .catch(() => ({}));

        /* =================================================
           WRONG EMAIL / PASSWORD

           Backend 401 bhejega.
           Yahan navigate nahi hoga.
        ================================================= */

        if (!response.ok) {
          throw new Error(
            data?.message ||
            data?.error ||
            "Invalid email or password."
          );
        }

        /* -------------------------
           TOKEN REQUIRED
        ------------------------- */

        if (!data?.token) {
          throw new Error(
            "Login failed. Authentication token was not returned."
          );
        }

        /* -------------------------
           SAVE LOGIN SESSION
        ------------------------- */

        const saved =
          saveAuthenticatedPartner(
            data
          );

        if (!saved) {
          throw new Error(
            "Unable to save login session."
          );
        }

        /* -------------------------
           PARTNER VERTICAL
        ------------------------- */

        const partner =
          data?.partner ||
          data?.user ||
          data?.vendor ||
          data?.account ||
          {};

        const partnerVertical =
          partner
            ?.selectedVertical ||
          partner?.vertical ||
          partner?.service ||
          data?.vertical ||
          data?.service ||
          selectedVertical ||
          "";

        if (partnerVertical) {
          localStorage.setItem(
            "selectedVertical",
            partnerVertical
          );
        }

        /* -------------------------
           ONBOARDING STATUS
        ------------------------- */

        const completed =
          isOnboardingComplete(
            data
          );

        localStorage.setItem(
          "onboardingComplete",
          String(completed)
        );

        /* =================================================
           LOGIN SUCCESS ONLY

           New/incomplete account -> onboarding
           Completed account      -> dashboard
        ================================================= */

        if (completed === true) {
          navigate("/vendor", {
            replace: true,
          });
          return;
        }

        sessionStorage.setItem(
          "bmtVendorAuthEmail",
          email
        );

        sessionStorage.setItem(
          "bmtVendorAuthPassword",
          form.password
        );

        const targetVertical = (partnerVertical || selectedVertical || "").toLowerCase();
        let targetRoute = "/onboarding";
        if (targetVertical === "bus") targetRoute = "/bus-register";
        if (targetVertical === "cab") targetRoute = "/cab-register";

        navigate(targetRoute, {
          replace: true,
          state: {
            vendorAuth: {
              email,
              password: form.password,
              phone:
                partner?.phone ||
                partner?.businessPhone ||
                "",
              countryCode:
                partner?.countryCode ||
                "",
              selectedVertical:
                partnerVertical ||
                selectedVertical ||
                "",
            },
          },
        });
        return;
      } catch (error) {
        /*
          Failed signin ke baad
          stale token rehna nahi chahiye.
        */

        localStorage.removeItem(
          "token"
        );

        localStorage.removeItem(
          "user"
        );

        setMessage(
          error?.message ||
          "Invalid email or password."
        );

        /*
          IMPORTANT:
          YAHAN KOI navigate() NAHI HAI.

          Isliye wrong email/password par
          user signin page par hi rahega.
        */
      } finally {
        setLoading(false);
      }
    };

  /* ===================================================
     UI
  =================================================== */

  return (
    <div className="partner-auth-page">

      {/* ===============================================
          LEFT SIDE
      =============================================== */}

      <section className="partner-auth-visual">

        <div className="partner-auth-overlay" />

        <button
          type="button"
          className="partner-auth-back"
          onClick={goHome}
        >
          <span>
            ←
          </span>

          Back to BMT Connect
        </button>

        <div className="partner-auth-copy">

          <div className="partner-auth-kicker">

            {isSignup
              ? "PROPERTY PARTNERSHIP"
              : "WELCOME BACK PARTNER"}

          </div>

          <h1>
            Join a global travel supplier
            <br />

            platform built for
            professionals.
          </h1>

          <p>
            Country-aware KYC,
            document verification,
            contract e-sign and
            vertical-specific dashboards
            for stays, buses, cabs,
            tours, activities, events,
            darshan and cruises.
          </p>

        </div>

      </section>

      {/* ===============================================
          RIGHT SIDE
      =============================================== */}

      <section className="partner-auth-form-panel">

        <div className="partner-auth-form-wrap">

          {/* LOGO */}

          <div className="partner-auth-logo">

            <strong>
              BMT
            </strong>

            <span>
              Connect
            </span>

          </div>

          {/* TITLE */}

          <h2>

            {isSignup
              ? "Create your BMT Connect partner account"
              : "Sign in to BMT Connect"}

          </h2>

          <p className="partner-auth-subtitle">

            {isSignup
              ? "Register once and manage any of the 8 supported verticals."
              : "Access your supplier extranet."}

          </p>

          {/* SELECTED VERTICAL */}

          {selectedVertical &&
            isSignup && (

              <div className="partner-auth-vertical-pill">

                Selected vertical:

                <strong>
                  {selectedVertical}
                </strong>

              </div>

            )}

          {/* SUCCESS MESSAGE */}

          {successMessage && (

            <div
              className="partner-auth-error"
              style={{
                background:
                  "#ecfdf5",
                borderColor:
                  "#a7f3d0",
                color:
                  "#047857",
              }}
            >

              {successMessage}

            </div>

          )}

          {/* ERROR MESSAGE */}

          {message && (

            <div className="partner-auth-error">

              {message}

            </div>

          )}

          {/* ===========================================
              SIGN UP
          =========================================== */}

          {isSignup ? (

            <form
              onSubmit={
                handleSignup
              }
              className="partner-auth-form"
            >

              {/* EMAIL */}

              <AuthField
                label="Business email"
                type="email"
                value={
                  form.email
                }
                onChange={(value) =>
                  setValue(
                    "email",
                    value
                  )
                }
                placeholder="you@yourbusiness.com"
                autoComplete="email"
              />

              {/* COUNTRY + PHONE */}

              <div className="partner-auth-row">

                <label className="partner-auth-field partner-country-field">

                  <span>
                    Country
                  </span>

                  <select
                    value={
                      form.countryCode
                    }
                    onChange={(event) =>
                      setValue(
                        "countryCode",
                        event.target.value
                      )
                    }
                  >

                    {COUNTRY_CODES.map(
                      (country) => (

                        <option
                          key={
                            `${country.code}-${country.label}`
                          }
                          value={
                            country.code
                          }
                        >

                          {country.code}{" "}
                          {country.label}

                        </option>

                      )
                    )}

                  </select>

                </label>

                <AuthField
                  label="Phone"
                  type="tel"
                  value={
                    form.phone
                  }
                  onChange={(value) =>
                    setValue(
                      "phone",
                      value
                    )
                  }
                  placeholder="Mobile number"
                  autoComplete="tel"
                />

              </div>

              {/* PASSWORD */}

              <PasswordField
                label="Password"
                value={
                  form.password
                }
                onChange={(value) =>
                  setValue(
                    "password",
                    value
                  )
                }
                visible={
                  showPassword
                }
                onToggle={() =>
                  setShowPassword(
                    (previous) =>
                      !previous
                  )
                }
                autoComplete="new-password"
              />

              {/* CONFIRM PASSWORD */}

              <PasswordField
                label="Confirm password"
                value={
                  form.confirmPassword
                }
                onChange={(value) =>
                  setValue(
                    "confirmPassword",
                    value
                  )
                }
                visible={
                  showConfirmPassword
                }
                onToggle={() =>
                  setShowConfirmPassword(
                    (previous) =>
                      !previous
                  )
                }
                autoComplete="new-password"
              />

              {/* TERMS */}

              <label className="partner-auth-checkbox">

                <input
                  type="checkbox"
                  checked={
                    form.terms
                  }
                  onChange={(event) =>
                    setValue(
                      "terms",
                      event.target.checked
                    )
                  }
                />

                <span>
                  I accept the BMT
                  Connect Partner Terms
                  and Privacy Policy.
                </span>

              </label>

              {/* CREATE ACCOUNT */}

              <button
                type="submit"
                className="partner-auth-submit"
                disabled={
                  loading
                }
              >

                {loading
                  ? "Creating account..."
                  : "Create account"}

              </button>

              {/* SWITCH */}

              <div className="partner-auth-switch">

                Already registered?

                <button
                  type="button"
                  onClick={
                    goSignin
                  }
                >

                  Sign in

                </button>

              </div>

            </form>

          ) : (

            /* =========================================
               SIGN IN
            ========================================= */

            <form
              onSubmit={
                handleSignin
              }
              className="partner-auth-form"
            >

              {/* EMAIL */}

              <AuthField
                label="Email"
                type="email"
                value={
                  form.email
                }
                onChange={(value) =>
                  setValue(
                    "email",
                    value
                  )
                }
                placeholder="you@yourbusiness.com"
                autoComplete="email"
              />

              {/* PASSWORD */}

              <PasswordField
                label="Password"
                value={
                  form.password
                }
                onChange={(value) =>
                  setValue(
                    "password",
                    value
                  )
                }
                visible={
                  showPassword
                }
                onToggle={() =>
                  setShowPassword(
                    (previous) =>
                      !previous
                  )
                }
                autoComplete="current-password"
              />

              {/* SIGN IN */}

              <button
                type="submit"
                className="partner-auth-submit"
                disabled={
                  loading
                }
              >

                {loading
                  ? "Signing in..."
                  : "Sign in"}

              </button>

              {/* SWITCH */}

              <div className="partner-auth-switch">

                New to BMT Connect?

                <button
                  type="button"
                  onClick={
                    goSignup
                  }
                >

                  Create partner account

                </button>

              </div>

              {/* DEMO ACCOUNTS */}

              <div className="partner-auth-demo">

                <strong>
                  ⓘ DEMO ACCOUNTS
                  (PASSWORD: DEMO@1234)
                </strong>

                <div className="partner-auth-demo-grid">

                  <span>
                    demo.stay@bmt.test
                  </span>

                  <span>
                    demo.bus@bmt.test
                  </span>

                  <span>
                    demo.cab@bmt.test
                  </span>

                  <span>
                    demo.tours@bmt.test
                  </span>

                  <span>
                    demo.activities@bmt.test
                  </span>

                  <span>
                    demo.events@bmt.test
                  </span>

                  <span>
                    demo.darshan@bmt.test
                  </span>

                  <span>
                    demo.cruise@bmt.test
                  </span>

                </div>

              </div>

            </form>

          )}

        </div>

      </section>

    </div>
  );
}

/* =====================================================
   NORMAL INPUT
===================================================== */

function AuthField({
  label,
  type = "text",
  value,
  onChange,
  placeholder = "",
  autoComplete = "off",
}) {
  return (

    <label className="partner-auth-field">

      <span>
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={
          placeholder
        }
        autoComplete={
          autoComplete
        }
      />

    </label>

  );
}

/* =====================================================
   PASSWORD INPUT
===================================================== */

function PasswordField({
  label,
  value,
  onChange,
  visible,
  onToggle,
  autoComplete =
  "current-password",
}) {
  return (

    <label className="partner-auth-field">

      <span>
        {label}
      </span>

      <div className="partner-password-wrap">

        <input
          type={
            visible
              ? "text"
              : "password"
          }
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          autoComplete={
            autoComplete
          }
        />

        <button
          type="button"
          className="partner-password-toggle"
          onClick={
            onToggle
          }
          tabIndex={-1}
        >

          {visible
            ? "Hide"
            : "Show"}

        </button>

      </div>

    </label>

  );
}