import { message, Popover, Select, Tag } from "antd";
import { useState, useEffect, useCallback } from "react";
import CommonTable from "../components/Table/CommonWithTable";
import { Edit, OptionsIcon, Setting, Trash, View } from "../assets/Image";
import LabelIcon from "../components/LabelIcon/LabelIcon";
import { addBnbLibrary } from "../api/bnbapi";
const { Option } = Select;

/* ═══════════════════════════════════════════════
   API  — match kar apna backend port
═══════════════════════════════════════════════ */
const API = "http://localhost:7000/api/vendor/bnb";

const AMENITIES = [
  "WiFi",
  "AC",
  "Heating",
  "Kitchen",
  "Parking",
  "Pool",
  "Gym",
  "Spa",
  "Laundry",
  "TV",
  "Balcony",
  "Garden",
  "Security",
  "Elevator",
  "Room Service",
  "CCTV",
  "Geyser",
  "Power Backup",
];

const PROPERTY_TYPES = [
  "Bed & Breakfast",
  "Guesthouse",
  "Homestay",
  "Boutique Hotel",
  "Villa",
  "Farmhouse",
  "Resort",
];

const CANCEL_POLICIES = [
  "Free Cancellation",
  "Moderate",
  "Strict",
  "Non-Refundable",
];

/* ═══════════════════════════════════════════════
   GLOBAL STYLES
═══════════════════════════════════════════════ */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Outfit:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:        #eff1f4;
    --s1:        var(--primary-color);
    --s2:        var(--primary-color);
    --s3:        var(--primary-color) ;
    --border:    #1f2535;
    --border2:   #2a3245;
    --text:      var(--text-color);
    --muted:      var(--text-color);
    --gold:       var(--text-color);
    --gold-lt:   #e8b84b;
    --gold-bg:   #c8952a18;
    --green:      var(--text-color);
    --green-bg:  #2da55e14;
    --red:       #d94f4f;
    --red-bg:    #d94f4f12;
    --blue:      #4a7fd4;
    --blue-bg:   #4a7fd414;
    --r:         12px;
    --r-sm:      8px;
    --shadow:    0 8px 40px #00000060;
  }

  html, body, #root { height: 100%; }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Outfit', sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 4px; }

  input, select, textarea {
    background: white;
    border: 1px solid var(--border);
    border-radius: var(--r-sm);
    color: black;
    font-family: 'Outfit', sans-serif;
    font-size: 13.5px;
    outline: none;
    transition: border-color .15s;
    width: 100%;
    padding: 9px 13px;
  }
  input:focus, select:focus, textarea:focus { border-color:white; }
  input::placeholder, textarea::placeholder { color: var(--placeHolder); }
  select option { background: var(--s2); }
  textarea { resize: vertical; }

  button { cursor: pointer; font-family: 'Outfit', sans-serif; }

  @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
  @keyframes slideUp { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
  @keyframes spin    { to { transform: rotate(360deg) } }
  @keyframes toast   { 0%{opacity:0;transform:translateY(12px)} 10%{opacity:1;transform:translateY(0)} 85%{opacity:1} 100%{opacity:0} }
`;

/* ═══════════════════════════════════════════════
   SMALL HELPERS
═══════════════════════════════════════════════ */
function Spinner({ size = 20, color = "var(--gold)" }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: size,
        height: size,
        border: `2px solid ${color}30`,
        borderTopColor: color,
        borderRadius: "50%",
        animation: "spin .65s linear infinite",
      }}
    />
  );
}

function Badge({ label, variant = "gray" }) {
  const map = {
    green: ["var(--green-bg)", "var(--green)", "#2da55e40"],
    gold: ["var(--gold-bg)", "var(--gold-lt)", "#c8952a40"],
    blue: ["var(--blue-bg)", "var(--blue)", "#4a7fd440"],
    gray: ["#ffffff08", "var(--muted)", "#ffffff18"],
    red: ["var(--red-bg)", "var(--red)", "#d94f4f40"],
  };
  const [bg, color, border] = map[variant] || map.gray;
  return (
    <span
      style={{
        background: bg,
        color,
        border: `1px solid ${border}`,
        padding: "2px 9px",
        borderRadius: 20,
        fontSize: 10.5,
        fontWeight: 600,
        letterSpacing: ".06em",
        textTransform: "uppercase",
      }}
    >
      {label}
    </span>
  );
}

function Toast({ toasts }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: t.type === "success" ? "#0d2318" : "#220d0d",
            border: `1px solid ${t.type === "success" ? "var(--green)" : "var(--red)"}`,
            color: t.type === "success" ? "var(--green)" : "var(--red)",
            padding: "11px 18px",
            borderRadius: 10,
            fontSize: 13.5,
            fontWeight: 500,
            boxShadow: "0 8px 32px #00000080",
            animation: "toast 3.4s ease forwards",
          }}
        >
          <span>{t.type === "success" ? "✓" : "✗"}</span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   STAT CARD
═══════════════════════════════════════════════ */
function StatCard({ label, value, icon, accent }) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 130,
        background: "white",
        borderRadius: "var(--r)",
        padding: "18px 20px",
        borderTop: `2px solid`,
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <div className="flex gap-2 items-center">
        {/* <div style={{ fontSize: 22 }}>{icon}</div> */}
        <div
          className="font-bold text-[15px]"
          style={{
            color: "black",
            textTransform: "uppercase",
            letterSpacing: ".07em",
          }}
        >
          {label}
        </div>
      </div>

      <div
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 32,
          fontWeight: 700,
          color: "black",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   PROPERTY CARD
═══════════════════════════════════════════════ */
function PropertyCard({ p, onView, onEdit, onDelete, onApprove, onFeature }) {
  const [hov, setHov] = useState(false);
  const img =
    p.propertyImages?.[0] || p.frontImages?.[0] || p.receptionImages?.[0];

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "var(--s1)",
        border: `1px solid ${hov ? "var(--border2)" : "var(--border)"}`,
        borderRadius: "var(--r)",
        overflow: "hidden",
        transition: "transform .22s, box-shadow .22s, border-color .22s",
        transform: hov ? "translateY(-4px)" : "none",
        boxShadow: hov ? "var(--shadow)" : "none",
      }}
    >
      {/* image */}
      <div
        style={{
          height: 172,
          background: "var(--s3)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {img ? (
          <img
            src={img}
            alt={p.propertyName}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform .5s",
              transform: hov ? "scale(1.06)" : "scale(1)",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
              opacity: 0.15,
            }}
          >
            🏡
          </div>
        )}
        {/* badges */}
        <div
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            display: "flex",
            gap: 5,
            flexWrap: "wrap",
          }}
        >
          {p.isApproved && <Badge label="Approved" variant="green" />}
          {p.isFeatured && <Badge label="Featured" variant="gold" />}
          {!p.isApproved && <Badge label="Pending" variant="gray" />}
        </div>
        {/* stars */}
        {p.starCategory > 0 && (
          <div
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              background: "#00000099",
              borderRadius: 6,
              padding: "2px 8px",
              fontSize: 11,
              color: "var(--gold-lt)",
            }}
          >
            {"★".repeat(p.starCategory)}
          </div>
        )}
      </div>

      {/* body */}
      <div style={{ padding: "14px 16px 12px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 6,
            marginBottom: 4,
          }}
        >
          <h3
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 17,
              fontWeight: 600,
              color: "var(--text)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {p.propertyName}
          </h3>
          <span
            style={{
              fontSize: 11,
              color: "var(--muted)",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {p.propertyType}
          </span>
        </div>

        {(p.city || p.state) && (
          <p
            style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 10 }}
          >
            📍 {[p.area, p.city, p.state].filter(Boolean).join(", ")}
          </p>
        )}

        <div
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 12,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {p.basePrice && (
            <span
              style={{ fontSize: 13, color: "var(--gold-lt)", fontWeight: 600 }}
            >
              ₹{p.basePrice.toLocaleString()}
              <span
                style={{ fontSize: 11, fontWeight: 400, color: "var(--muted)" }}
              >
                /night
              </span>
            </span>
          )}
          {p.totalRooms && (
            <span style={{ fontSize: 12, color: "var(--muted)" }}>
              🛏 {p.availableRooms ?? "?"}/{p.totalRooms}
            </span>
          )}
          {p.breakfastIncluded && (
            <span style={{ fontSize: 11, color: "var(--green)" }}>
              ☕ Breakfast
            </span>
          )}
        </div>

        {p.ownerName && (
          <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>
            👤 {p.ownerName} · {p.contactNumber}
          </p>
        )}

        {/* action buttons */}
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          <Btn label="View" color="var(--blue)" onClick={() => onView(p)} />
          <Btn label="Edit" color="#7c5cbf" onClick={() => onEdit(p)} />
          {!p.isApproved && (
            <Btn
              label="Approve"
              color="var(--green)"
              onClick={() => onApprove(p._id)}
            />
          )}
          {!p.isFeatured && (
            <Btn
              label="Feature"
              color="var(--gold)"
              onClick={() => onFeature(p._id)}
            />
          )}
          <Btn
            label="Delete"
            color="var(--red)"
            onClick={() => onDelete(p._id)}
          />
        </div>
      </div>
    </div>
  );
}

function Btn({
  label,
  color,
  onClick,
  full = false,
  disabled = false,
  type = "submit",
  children,
}) {
  const [h, setH] = useState(false);
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      // onMouseEnter={() => setH(true)}
      // onMouseLeave={() => setH(false)}
      style={{
        background: h && !disabled ? color : "transparent",
        color: disabled ? "var(--muted)" : h ? "#fff" : color,
        border: `1px solid ${disabled ? "var(--border)" : color}`,
        borderRadius: "var(--r-sm)",
        padding: "5px 13px",
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: ".03em",
        transition: "all .14s",
        width: full ? "100%" : undefined,
        opacity: disabled ? 0.5 : 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
      }}
    >
      {children || label}
    </button>
  );
}

/* ═══════════════════════════════════════════════
   MODAL WRAPPER
═══════════════════════════════════════════════ */
function Modal({ title, subtitle, onClose, children, maxW = 800 }) {
  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        background: "#000000bb",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 16,
        animation: "fadeIn .18s ease",
      }}
    >
      <div
        style={{
          background: "var(--primary-color)",
          border: "1px solid var(--border2)",
          borderRadius: 16,
          width: "100%",
          maxWidth: maxW,
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          animation: "slideUp .2s ease",
          boxShadow: "0 32px 80px #00000090",
        }}
      >
        {/* header */}
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 22,
                fontWeight: 700,
                color: "var(--text)",
              }}
            >
              {title}
            </h2>
            {subtitle && (
              <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: "var(--s2)",
              border: "1px solid var(--border)",
              color: "var(--muted)",
              borderRadius: 8,
              width: 32,
              height: 32,
              fontSize: 15,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>
        <div style={{ overflowY: "auto", flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   FORM PIECES
═══════════════════════════════════════════════ */
function FLabel({ children, required }) {
  return (
    <label
      style={{
        display: "block",
        fontSize: 11,
        fontWeight: 600,
        color: "var(--muted)",
        textTransform: "uppercase",
        letterSpacing: ".07em",
        marginBottom: 5,
      }}
    >
      {children}
      {required && <span style={{ color: "var(--red)" }}> *</span>}
    </label>
  );
}

function FGroup({ label, required, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <FLabel required={required}>{label}</FLabel>
      {children}
    </div>
  );
}

function FInput({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  rows,
}) {
  return (
    <FGroup label={label} required={required}>
      {rows ? (
        <textarea
          name={name}
          value={value ?? ""}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value ?? ""}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
        />
      )}
    </FGroup>
  );
}

function FSelect({ label, name, value, onChange, options, required }) {
  return (
    <FGroup label={label} required={required}>
      <Select
        className="w-[100%]"
        name={name}
        value={value ?? ""}
        onChange={onChange}
        required={required}
      >
        <option value="">— Select —</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </Select>
    </FGroup>
  );
}

function FCheck({ name, label, checked, onChange }) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        cursor: "pointer",
        marginBottom: 9,
        userSelect: "none",
      }}
    >
      <input
        type="checkbox"
        name={name}
        checked={!!checked}
        onChange={onChange}
        style={{
          width: 15,
          height: 15,
          accentColor: "var(--gold)",
          cursor: "pointer",
          flexShrink: 0,
        }}
      />
      <span style={{ fontSize: 13, color: "var(--text)" }}>{label}</span>
    </label>
  );
}

function SecHead({ children }) {
  return (
    <div
      style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 16,
        fontWeight: 600,
        color: "var(--gold-lt)",
        borderBottom: "1px solid var(--border)",
        paddingBottom: 7,
        marginBottom: 16,
        marginTop: 4,
      }}
    >
      {children}
    </div>
  );
}

function Grid({ cols = 2, children }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: "0 16px",
      }}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   PROPERTY FORM
   — covers all fields from bnbSchema
═══════════════════════════════════════════════ */
const BLANK = {
  propertyName: "",
  tagline: "",
  description: "",
  propertyType: "Bed & Breakfast",
  starCategory: "3",
  establishedYear: "",
  ownerName: "",
  companyName: "",
  contactNumber: "",
  alternateContact: "",
  email: "",
  website: "",
  password: "",
  street: "",
  area: "",
  city: "",
  state: "",
  country: "India",
  pincode: "",
  landmark: "",
  latitude: "",
  longitude: "",
  totalRooms: "",
  availableRooms: "",
  maxGuests: "",
  basePrice: "",
  weekendPrice: "",
  extraGuestCharge: "",
  taxesIncluded: false,
  taxPercentage: "",
  breakfastIncluded: true,
  lunchIncluded: false,
  dinnerIncluded: false,
  breakfastType: "",
  breakfastTiming: "",
  amenities: [],
  parkingAvailable: false,
  parkingType: "",
  petAllowed: false,
  smokingAllowed: false,
  alcoholAllowed: false,
  powerBackup: false,
  wifiSpeed: "",
  coupleFriendly: false,
  checkIn: "",
  checkOut: "",
  earlyCheckInAllowed: false,
  lateCheckOutAllowed: false,
  instantBooking: true,
  minimumStay: "",
  maximumStay: "",
  cancellationPolicy: "",
  cancellationDays: "",
  accountHolder: "",
  accountNumber: "",
  ifsc: "",
  bankName: "",
  gstNumber: "",
  panNumber: "",
};

function PropertyForm({ initial = {}, onSubmit, onClose, loading }) {
  const [form, setForm] = useState({ ...BLANK, ...initial });
  const [files, setFiles] = useState({
    propertyImages: [],
    frontImages: [],
    receptionImages: [],
  });
  const [tab, setTab] = useState(0);

  const ch = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const toggleAmenity = (a) => {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a)
        ? f.amenities.filter((x) => x !== a)
        : [...f.amenities, a],
    }));
  };

  const handleFiles = (e) => {
    const { name, files: fl } = e.target;
    setFiles((f) => ({ ...f, [name]: Array.from(fl) }));
  };

  const submit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (Array.isArray(v)) {
        v.forEach((i) => fd.append(k, i));
      } else if (v !== "" && v !== null && v !== undefined)
        fd.append(k, String(v));
    });
    // images — backend expects propertyImages, frontImages, receptionImages
    Object.entries(files).forEach(([k, arr]) =>
      arr.forEach((f) => fd.append(k, f)),
    );
    onSubmit(fd);
  };

  const TABS = [
    "Basic",
    "Owner",
    "Location",
    "Rooms & Meals",
    "Amenities",
    "Policies",
    "Bank",
    "Images",
  ];

  return (
    <form onSubmit={submit}>
      {/* tab bar */}
      <div
        style={{
          display: "flex",
          gap: 4,
          padding: "12px 24px 0",
          borderBottom: "1px solid var(--border)",
          flexWrap: "wrap",
          flexShrink: 0,
        }}
      >
        {TABS.map((t, i) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(i)}
            style={{
              background: tab === i ? "var(--gold-bg)" : "transparent",
              color: tab === i ? "var(--gold-lt)" : "var(--muted)",
              border:
                tab === i ? "1px solid var(--gold)44" : "1px solid transparent",
              borderRadius: "8px 8px 0 0",
              padding: "7px 14px",
              fontSize: 12.5,
              fontWeight: tab === i ? 600 : 400,
              transition: "all .12s",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div style={{ padding: "22px 24px" }}>
        {tab === 0 && (
          <>
            <SecHead>Basic Information</SecHead>
            <Grid cols={2}>
              <FInput
                label="Property Name"
                name="propertyName"
                value={form.propertyName}
                onChange={ch}
                required
                placeholder="The Grand BnB"
              />
              <FGroup label="Property Type">
                <Select
                  className="w-[100%]"
                  value={form.propertyType}
                  onChange={(e) =>
                    ch({ target: { value: e, name: "propertyType" } })
                  }
                >
                  {PROPERTY_TYPES.map((t) => (
                    <Option key={t}>{t}</Option>
                  ))}
                </Select>
              </FGroup>
              <FInput
                label="Tagline"
                name="tagline"
                value={form.tagline}
                onChange={ch}
                placeholder="Your home away from home"
              />
              <FGroup label="Star Category (1–5)">
                <div style={{ display: "flex", gap: 6 }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() =>
                        setForm((f) => ({ ...f, starCategory: String(s) }))
                      }
                      style={{
                        fontSize: 22,
                        background: "none",
                        border: "none",
                        padding: 0,
                        color:
                          Number(form.starCategory) >= s
                            ? "var(--gold-lt)"
                            : "var(--border2)",
                        cursor: "pointer",
                        transition: "color .12s",
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </FGroup>
              <FInput
                label="Established Year"
                name="establishedYear"
                value={form.establishedYear}
                onChange={ch}
                type="number"
                placeholder="2020"
              />
            </Grid>
            <FInput
              label="Description"
              name="description"
              value={form.description}
              onChange={ch}
              rows={4}
              placeholder="Tell guests about your property..."
            />
          </>
        )}

        {tab === 1 && (
          <>
            <SecHead>Owner Details</SecHead>
            <Grid cols={2}>
              <FInput
                placeholder={"Owner Name"}
                label="Owner Name"
                name="ownerName"
                value={form.ownerName}
                onChange={ch}
                required
              />
              <FInput
                placeholder={"Company Name"}
                label="Company Name"
                name="companyName"
                value={form.companyName}
                onChange={ch}
              />
              <FInput
                label="Contact Number"
                name="contactNumber"
                value={form.contactNumber}
                onChange={ch}
                required
                placeholder="Contact Number"
              />
              <FInput
                label="Alternate Contact"
                name="alternateContact"
                value={form.alternateContact}
                onChange={ch}
                placeholder="Alternate number"
              />
              <FInput
                label="Email"
                name="email"
                value={form.email}
                onChange={ch}
                type="email"
                placeholder="Enter email address"
              />
              <FInput
                label="Website"
                name="website"
                value={form.website}
                onChange={ch}
                placeholder="https://..."
              />
              <FInput
                label="Password"
                name="password"
                value={form.password}
                placeholder="Set password"
                onChange={ch}
                type="password"
                placeholder={
                  initial._id ? "Leave blank to keep" : "Set password"
                }
              />
            </Grid>
          </>
        )}

        {tab === 2 && (
          <>
            <SecHead>Location</SecHead>
            <Grid cols={2}>
              <FInput
                label="Street"
                name="street"
                value={form.street}
                onChange={ch}
                placeholder={"Enter Street"}
              />
              <FInput
                label="Area / Locality"
                name="area"
                value={form.area}
                onChange={ch}
                placeholder={"Enter Area or Locality"}
              />
              <FInput
                label="City"
                name="city"
                value={form.city}
                onChange={ch}
                required
                placeholder={"Enter City"}
              />
              <FInput
                label="State"
                name="state"
                value={form.state}
                onChange={ch}
                required
                placeholder={"Enter State"}
              />
              <FInput
                label="Country"
                name="country"
                value={form.country}
                onChange={ch}
                placeholder={"Enter Country "}
              />
              <FInput
                label="Pincode"
                name="pincode"
                value={form.pincode}
                onChange={ch}
                placeholder={"Enter Pincode"}
              />
              <FInput
                label="Landmark"
                name="landmark"
                value={form.landmark}
                onChange={ch}
                placeholder={"Enter Landmark"}
              />
            </Grid>
            <Grid cols={2}>
              <FInput
                label="Latitude"
                name="latitude"
                value={form.latitude}
                onChange={ch}
                type="number"
                placeholder="28.6139"
              />
              <FInput
                label="Longitude"
                name="longitude"
                value={form.longitude}
                onChange={ch}
                type="number"
                placeholder="77.2090"
              />
            </Grid>
          </>
        )}

        {tab === 3 && (
          <>
            <SecHead>Rooms & Pricing</SecHead>
            <Grid cols={3}>
              <FInput
                label="Total Rooms"
                name="totalRooms"
                value={form.totalRooms}
                onChange={ch}
                type="number"
                placeholder={"Enter total Rooms"}
              />
              <FInput
                label="Available Rooms"
                name="availableRooms"
                value={form.availableRooms}
                onChange={ch}
                type="number"
                placeholder={"Enter available Rooms"}
              />
              <FInput
                label="Max Guests"
                name="maxGuests"
                value={form.maxGuests}
                onChange={ch}
                type="number"
                placeholder={"Enter max guests per room"}
              />
              <FInput
                label="Base Price (₹)"
                name="basePrice"
                value={form.basePrice}
                onChange={ch}
                type="number"
                placeholder={"Enter base price per night"}
              />
              <FInput
                label="Weekend Price (₹)"
                name="weekendPrice"
                value={form.weekendPrice}
                onChange={ch}
                type="number"
                placeholder={"Enter weekend price per night"}
              />
              <FInput
                label="Extra Guest Charge (₹)"
                name="extraGuestCharge"
                value={form.extraGuestCharge}
                onChange={ch}
                type="number"
                placeholder={"Enter extra guest charge per night"}
              />
              <FInput
                label="Tax %"
                name="taxPercentage"
                value={form.taxPercentage}
                onChange={ch}
                type="number"
                placeholder={"Enter tax percentage"}
              />
            </Grid>
            <FCheck
              name="taxesIncluded"
              label="Taxes Included in Price"
              checked={form.taxesIncluded}
              onChange={ch}
            />

            <SecHead>Meals</SecHead>
            <Grid cols={3}>
              <FCheck
                name="breakfastIncluded"
                label="Breakfast Included"
                checked={form.breakfastIncluded}
                onChange={ch}
              />
              <FCheck
                name="lunchIncluded"
                label="Lunch Included"
                checked={form.lunchIncluded}
                onChange={ch}
              />
              <FCheck
                name="dinnerIncluded"
                label="Dinner Included"
                checked={form.dinnerIncluded}
                onChange={ch}
              />
            </Grid>
            <Grid cols={2}>
              <FInput
                label="Breakfast Type"
                name="breakfastType"
                value={form.breakfastType}
                onChange={ch}
                placeholder="Continental, Indian…"
              />
              <FInput
                label="Breakfast Timing"
                name="breakfastTiming"
                value={form.breakfastTiming}
                onChange={ch}
                placeholder="7:00 AM – 10:00 AM"
              />
            </Grid>
          </>
        )}

        {tab === 4 && (
          <>
            <SecHead>Amenities</SecHead>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 7,
                marginBottom: 20,
              }}
            >
              {AMENITIES.map((a) => {
                const on = form.amenities.includes(a);
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggleAmenity(a)}
                    style={{
                      // background: on ? "var(--green-bg)" : "white",
                      background: on ? "white" : "var(--green-bg)",
                      border: `1px solid ${on ? "var(--green)" : "var(--border)"}`,
                      // color: on ? "var(--green)" : "var(--primary-color)",
                      color: on ? "var(--primary-color)" : "var(--green)",
                      borderRadius: 20,
                      padding: "6px 14px",
                      fontSize: 12.5,
                      transition: "all .12s",
                    }}
                  >
                    {a}
                  </button>
                );
              })}
            </div>

            <SecHead>Facilities</SecHead>
            <Grid cols={3}>
              <FCheck
                name="parkingAvailable"
                label="Parking Available"
                checked={form.parkingAvailable}
                onChange={ch}
              />
              <FCheck
                name="petAllowed"
                label="Pet Allowed"
                checked={form.petAllowed}
                onChange={ch}
              />
              <FCheck
                name="smokingAllowed"
                label="Smoking Allowed"
                checked={form.smokingAllowed}
                onChange={ch}
              />
              <FCheck
                name="alcoholAllowed"
                label="Alcohol Allowed"
                checked={form.alcoholAllowed}
                onChange={ch}
              />
              <FCheck
                name="powerBackup"
                label="Power Backup"
                checked={form.powerBackup}
                onChange={ch}
              />
              <FCheck
                name="coupleFriendly"
                label="Couple Friendly"
                checked={form.coupleFriendly}
                onChange={ch}
              />
            </Grid>
            <Grid cols={2}>
              <FInput
                label="WiFi Speed"
                name="wifiSpeed"
                value={form.wifiSpeed}
                onChange={ch}
                placeholder="100 Mbps"
              />
              <FInput
                label="Parking Type"
                name="parkingType"
                value={form.parkingType}
                onChange={ch}
                placeholder="Free / Paid / Valet"
              />
            </Grid>
          </>
        )}

        {tab === 5 && (
          <>
            <SecHead>Check-in / Check-out</SecHead>
            <Grid cols={2}>
              <FInput
                label="Check-in Time"
                name="checkIn"
                value={form.checkIn}
                onChange={ch}
                placeholder="12:00 PM"
              />
              <FInput
                label="Check-out Time"
                name="checkOut"
                value={form.checkOut}
                onChange={ch}
                placeholder="11:00 AM"
              />
            </Grid>
            <Grid cols={2}>
              <FCheck
                name="earlyCheckInAllowed"
                label="Early Check-in Allowed"
                checked={form.earlyCheckInAllowed}
                onChange={ch}
              />
              <FCheck
                name="lateCheckOutAllowed"
                label="Late Check-out Allowed"
                checked={form.lateCheckOutAllowed}
                onChange={ch}
              />
              <FCheck
                name="instantBooking"
                label="Instant Booking Enabled"
                checked={form.instantBooking}
                onChange={ch}
              />
            </Grid>

            <SecHead>Stay & Cancellation</SecHead>
            <Grid cols={3}>
              <FInput
                label="Min Stay (nights)"
                name="minimumStay"
                value={form.minimumStay}
                onChange={ch}
                type="number"
                placeholder={"Min Stay (nights)"}
              />
              <FInput
                label="Max Stay (nights)"
                name="maximumStay"
                value={form.maximumStay}
                onChange={ch}
                type="number"
                placeholder={"Max Stay (nights)"}
              />
              <FInput
                label="Cancellation (days)"
                name="cancellationDays"
                value={form.cancellationDays}
                onChange={ch}
                type="number"
                placeholder={"Canellation days"}
              />
            </Grid>
            {/* <FSelect
              label="Cancellation Policy"
              name="cancellationPolicy"
              value={form.cancellationPolicy}
              onChange={(e)}
              options={CANCEL_POLICIES}
            /> */}
            <FGroup label={"Cancellation Policy"}>
              <Select
                placeholder={"Select cancellation policy"}
                className="w-[100%]"
                name={"cancellationPolicy"}
                value={form.cancellationPolicy ?? ""}
                onChange={(e) =>
                  ch({ target: { value: e, name: "cancellationPolicy" } })
                }
              >
                {CANCEL_POLICIES.map((o) => (
                  <Option key={o} value={o}>
                    {o}
                  </Option>
                ))}
              </Select>
            </FGroup>
          </>
        )}

        {tab === 6 && (
          <>
            <SecHead>Bank Details</SecHead>
            <Grid cols={2}>
              <FInput
                placeholder={"Account Holder"}
                label="Account Holder"
                name="accountHolder"
                value={form.accountHolder}
                onChange={ch}
              />
              <FInput
                label="Account Number"
                name="accountNumber"
                value={form.accountNumber}
                onChange={ch}
                placeholder={"Account Number"}
              />
              <FInput
                label="IFSC Code"
                name="ifsc"
                value={form.ifsc}
                onChange={ch}
                placeholder={"IFSC Code"}
              />
              <FInput
                label="Bank Name"
                name="bankName"
                value={form.bankName}
                onChange={ch}
                placeholder={"Bank Name"}
              />
              <FInput
                label="GST Number"
                name="gstNumber"
                value={form.gstNumber}
                onChange={ch}
                placeholder={"Enter GST Number"}
              />
              <FInput
                label="PAN Number"
                name="panNumber"
                value={form.panNumber}
                onChange={ch}
                placeholder={"Enter PAN Number"}
              />
            </Grid>
          </>
        )}

        {tab === 7 && (
          <>
            <SecHead>Upload Images</SecHead>
            {[
              { key: "propertyImages", label: "Property Images", max: 10 },
              { key: "frontImages", label: "Front / Exterior", max: 5 },
              { key: "receptionImages", label: "Reception Area", max: 5 },
            ].map(({ key, label, max }) => (
              <div key={key} style={{ marginBottom: 20 }}>
                <FLabel>
                  {label} (max {max})
                </FLabel>
                {/* show existing images */}
                {initial[key]?.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      flexWrap: "wrap",
                      marginBottom: 8,
                    }}
                  >
                    {initial[key].map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt=""
                        style={{
                          width: 70,
                          height: 55,
                          objectFit: "cover",
                          borderRadius: 6,
                          border: "1px solid var(--border)",
                        }}
                      />
                    ))}
                    <span
                      style={{
                        fontSize: 11,
                        color: "var(--muted)",
                        alignSelf: "center",
                      }}
                    >
                      (existing — upload new to replace)
                    </span>
                  </div>
                )}
                <input
                  type="file"
                  name={key}
                  multiple
                  accept="image/*"
                  onChange={handleFiles}
                  style={{ padding: "8px 12px", color: "var(--muted)" }}
                />
                {files[key].length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      flexWrap: "wrap",
                      marginTop: 8,
                    }}
                  >
                    {files[key].map((f, i) => (
                      <img
                        key={i}
                        src={URL.createObjectURL(f)}
                        alt=""
                        style={{
                          width: 70,
                          height: 55,
                          objectFit: "cover",
                          borderRadius: 6,
                          border: "1px solid var(--green)",
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {/* footer buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 24,
            paddingTop: 16,
            borderTop: "1px solid var(--border)",
          }}
        >
          <div style={{ display: "flex", gap: 8 }}>
            {tab > 0 && (
              <Btn
                type="button"
                label="← Previous"
                onClick={() => setTab((t) => t - 1)}
              />
            )}
            {tab < TABS.length - 1 && (
              <Btn
                type="button"
                label="Next →"
                onClick={() => setTab((t) => t + 1)}
              />
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn label="Cancel" color="var(--muted)" onClick={onClose} />
            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? "var(--s3)" : "white",
                border: "none",
                color: loading ? "var(--muted)" : "#000",
                borderRadius: "var(--r-sm)",
                padding: "9px 28px",
                fontSize: 13.5,
                fontWeight: 700,
                transition: "opacity .15s",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {loading && <Spinner size={15} color="#000" />}
              {loading
                ? "Saving…"
                : initial._id
                  ? "Update Property"
                  : "Add Property"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

/* ═══════════════════════════════════════════════
   DETAIL VIEW
═══════════════════════════════════════════════ */
function DetailView({ p }) {
  const [imgIdx, setImgIdx] = useState(0);
  const allImgs = [
    ...(p.propertyImages || []),
    ...(p.frontImages || []),
    ...(p.receptionImages || []),
  ];

  const DRow = ({ label, value }) => {
    if (!value && value !== 0) return null;
    return (
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid var(--border)",
          padding: "9px 0",
          gap: 12,
        }}
      >
        <span
          style={{
            fontSize: 11,
            color: "var(--muted)",
            width: 165,
            flexShrink: 0,
            textTransform: "uppercase",
            letterSpacing: ".06em",
            paddingTop: 1,
          }}
        >
          {label}
        </span>
        <span style={{ fontSize: 13.5, color: "var(--text)" }}>
          {String(value)}
        </span>
      </div>
    );
  };

  const DSection = ({ title, children }) => (
    <div style={{ marginBottom: 22 }}>
      <div
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 15,
          color: "var(--gold-lt)",
          marginBottom: 4,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );

  return (
    <div style={{ padding: "20px 24px" }}>
      {/* gallery */}
      {allImgs.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <img
            src={allImgs[imgIdx]}
            alt=""
            style={{
              width: "100%",
              height: 240,
              objectFit: "cover",
              borderRadius: "var(--r)",
              border: "1px solid var(--border)",
            }}
          />
          {allImgs.length > 1 && (
            <div
              style={{
                display: "flex",
                gap: 6,
                marginTop: 8,
                overflowX: "auto",
                paddingBottom: 4,
              }}
            >
              {allImgs.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt=""
                  onClick={() => setImgIdx(i)}
                  style={{
                    width: 72,
                    height: 52,
                    objectFit: "cover",
                    flexShrink: 0,
                    borderRadius: 7,
                    cursor: "pointer",
                    border: `2px solid ${i === imgIdx ? "var(--gold)" : "var(--border)"}`,
                    opacity: i === imgIdx ? 1 : 0.6,
                    transition: "all .12s",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* status badges */}
      <div
        style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}
      >
        <Badge
          label={p.isApproved ? "Approved" : "Pending"}
          variant={p.isApproved ? "green" : "gray"}
        />
        {p.isFeatured && <Badge label="Featured" variant="gold" />}
        {p.isActive && <Badge label="Active" variant="blue" />}
        {p.starCategory > 0 && (
          <Badge label={"★".repeat(p.starCategory)} variant="gold" />
        )}
      </div>

      {p.tagline && (
        <p
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 17,
            fontStyle: "italic",
            color: "var(--muted)",
            marginBottom: 14,
          }}
        >
          "{p.tagline}"
        </p>
      )}

      {p.description && (
        <p
          style={{
            fontSize: 13.5,
            color: "var(--muted)",
            lineHeight: 1.65,
            marginBottom: 18,
          }}
        >
          {p.description}
        </p>
      )}

      <DSection title="Basic">
        <DRow label="Property ID" value={p.propertyId} />
        <DRow label="Type" value={p.propertyType} />
        <DRow label="Est. Year" value={p.establishedYear} />
      </DSection>

      <DSection title="Owner">
        <DRow label="Owner" value={p.ownerName} />
        <DRow label="Company" value={p.companyName} />
        <DRow label="Phone" value={p.contactNumber} />
        <DRow label="Alt. Phone" value={p.alternateContact} />
        <DRow label="Email" value={p.email} />
        <DRow label="Website" value={p.website} />
      </DSection>

      <DSection title="Location">
        <DRow
          label="Full Address"
          value={[p.street, p.area, p.city, p.state, p.pincode]
            .filter(Boolean)
            .join(", ")}
        />
        <DRow label="Landmark" value={p.landmark} />
        <DRow label="Country" value={p.country} />
        <DRow
          label="Coordinates"
          value={
            p.latitude && p.longitude ? `${p.latitude}, ${p.longitude}` : null
          }
        />
      </DSection>

      <DSection title="Rooms & Pricing">
        <DRow label="Total Rooms" value={p.totalRooms} />
        <DRow label="Available" value={p.availableRooms} />
        <DRow label="Max Guests" value={p.maxGuests} />
        <DRow
          label="Base Price"
          value={p.basePrice ? `₹${p.basePrice.toLocaleString()}/night` : null}
        />
        <DRow
          label="Weekend Price"
          value={
            p.weekendPrice ? `₹${p.weekendPrice.toLocaleString()}/night` : null
          }
        />
        <DRow
          label="Extra Guest"
          value={p.extraGuestCharge ? `₹${p.extraGuestCharge}` : null}
        />
        <DRow
          label="Tax"
          value={
            p.taxPercentage
              ? `${p.taxPercentage}%${p.taxesIncluded ? " (included)" : ""}`
              : null
          }
        />
      </DSection>

      <DSection title="Meals">
        <DRow
          label="Breakfast"
          value={
            p.breakfastIncluded
              ? `✓ ${[p.breakfastType, p.breakfastTiming].filter(Boolean).join(" · ") || ""}`
              : "Not included"
          }
        />
        <DRow label="Lunch" value={p.lunchIncluded ? "Included" : null} />
        <DRow label="Dinner" value={p.dinnerIncluded ? "Included" : null} />
      </DSection>

      {p.amenities?.length > 0 && (
        <DSection title="Amenities">
          <div
            style={{ display: "flex", flexWrap: "wrap", gap: 6, paddingTop: 6 }}
          >
            {p.amenities.map((a) => (
              <span
                key={a}
                style={{
                  background: "var(--s2)",
                  border: "1px solid var(--border)",
                  borderRadius: 20,
                  padding: "4px 12px",
                  fontSize: 12,
                  color: "var(--text)",
                }}
              >
                {a}
              </span>
            ))}
          </div>
        </DSection>
      )}

      <DSection title="Policies">
        <DRow label="Check-In" value={p.checkIn} />
        <DRow label="Check-Out" value={p.checkOut} />
        <DRow
          label="Min Stay"
          value={p.minimumStay ? `${p.minimumStay} nights` : null}
        />
        <DRow
          label="Max Stay"
          value={p.maximumStay ? `${p.maximumStay} nights` : null}
        />
        <DRow label="Cancellation" value={p.cancellationPolicy} />
        <DRow label="Cancel Days" value={p.cancellationDays} />
        <DRow
          label="Parking"
          value={
            p.parkingAvailable
              ? `Yes${p.parkingType ? ` (${p.parkingType})` : ""}`
              : "No"
          }
        />
        <DRow label="Pets" value={p.petAllowed ? "Allowed" : "Not allowed"} />
        <DRow label="Couple Friendly" value={p.coupleFriendly ? "Yes" : "No"} />
        <DRow label="WiFi" value={p.wifiSpeed} />
      </DSection>

      <DSection title="Bank">
        <DRow label="Account Holder" value={p.accountHolder} />
        <DRow label="Bank" value={p.bankName} />
        <DRow label="IFSC" value={p.ifsc} />
        <DRow label="GST" value={p.gstNumber} />
        <DRow label="PAN" value={p.panNumber} />
      </DSection>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   DELETE CONFIRM
═══════════════════════════════════════════════ */
function Confirm({ msg, onYes, onNo }) {
  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onNo()}
      style={{
        position: "fixed",
        inset: 0,
        background: "#000000cc",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
      }}
    >
      <div
        style={{
          background: "var(--s1)",
          border: "1px solid var(--red)44",
          borderRadius: 14,
          padding: "28px 32px",
          maxWidth: 380,
          width: "100%",
          animation: "slideUp .2s ease",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
        <h3
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 20,
            marginBottom: 8,
          }}
        >
          Confirm Delete
        </h3>
        <p
          style={{
            fontSize: 13.5,
            color: "var(--muted)",
            lineHeight: 1.6,
            marginBottom: 22,
          }}
        >
          {msg}
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <Btn label="Cancel" color="var(--muted)" onClick={onNo} />
          <button
            onClick={onYes}
            style={{
              background: "var(--red)",
              border: "none",
              color: "#fff",
              borderRadius: "var(--r-sm)",
              padding: "8px 24px",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT — BnbManager
═══════════════════════════════════════════════ */
export default function BnbManager() {
  const [properties, setProperties] = useState([]);
  const [allProperties, setAllProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [search, setSearch] = useState("");
  const [filterCity, setFilterCity] = useState("All");
  const [filterApproved, setFilterApproved] = useState("all");
  const [filterFeatured, setFilterFeatured] = useState("all");
  const [modal, setModal] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  /* toast */
  const toast = useCallback((msg, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  }, []);

  /* fetch — GET /api/bnb */
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterCity !== "All") params.set("city", filterCity);
      if (filterApproved !== "all") params.set("approved", filterApproved);
      if (filterFeatured !== "all") params.set("featured", filterFeatured);
      const r = await fetch(`${API}?${params}`);
      const d = await r.json();
      if (d.success) {
        setProperties(d.data || []);
        setAllProperties(d.data || []);
      } else message.error("Failed to load properties");
    } catch {
      message.error("Network error — is backend running?");
    }
    setLoading(false);
  }, [filterCity, filterApproved, filterFeatured, toast]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);
  const [activePopover, setActivePopover] = useState(null);
  const columns = [
    {
      title: "Name",
      dataIndex: "propertyName",
      key: "propertyName",
    },
    {
      title: "Type",
      dataIndex: "propertyType",
      key: "propertyType",
    },
    {
      title: "Star",
      dataIndex: "starCategory",
      key: "starCategory",
      render: (star) => `${star} ⭐`,
    },
    {
      title: "Owner",
      dataIndex: "ownerName",
      key: "ownerName",
    },
    {
      title: "Contact",
      dataIndex: "contactNumber",
      key: "contactNumber",
    },
    {
      title: "Location",
      key: "location",
      render: (_, record) =>
        `${record.city}, ${record.state}, ${record.country}`,
    },
    {
      title: "Breakfast",
      dataIndex: "breakfastIncluded",
      key: "breakfastIncluded",
      render: (val) =>
        val ? <Tag color="green">Yes</Tag> : <Tag color="red">No</Tag>,
    },
    {
      title: "Taxes",
      dataIndex: "taxesIncluded",
      key: "taxesIncluded",
      render: (val) =>
        val ? (
          <Tag color="green">Included</Tag>
        ) : (
          <Tag color="orange">Extra</Tag>
        ),
    },
    {
      title: "Instant Booking",
      dataIndex: "instantBooking",
      key: "instantBooking",
      render: (val) =>
        val ? <Tag color="blue">Enabled</Tag> : <Tag>Disabled</Tag>,
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (val) =>
        val ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>,
    },
    {
      title: "Approval",
      dataIndex: "isApproved",
      key: "isApproved",
      render: (val) =>
        val ? (
          <Tag color="green">Approved</Tag>
        ) : (
          <Tag color="orange">Pending</Tag>
        ),
    },
    {
      title: "Featured",
      dataIndex: "isFeatured",
      key: "isFeatured",
      render: (val) =>
        val ? <Tag color="purple">Featured</Tag> : <Tag>Normal</Tag>,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (record, txt) => {
        return (
          <>
            <>
              <Popover
                // getPopupContainer={(triggerNode) => triggerNode.parentNode}

                // open={activePopover === txt._id}
                // onOpenChange={(open) => setActivePopover(open ? txt._id : null)}
                trigger="hover"
                content={
                  <>
                    <div className="w-28">
                      <LabelIcon
                        icon={View}
                        label="View"
                        onClick={() => {
                          // setActivePopover(null);
                          setModal({ type: "view", data: txt });
                        }}
                      />
                    </div>
                    <div className="w-28">
                      <LabelIcon
                        icon={Edit}
                        label="Edit"
                        onClick={() => {
                          // setActivePopover(null);

                          setModal({ type: "edit", data: txt });
                        }}
                      />
                    </div>
                    <div className="w-28">
                      <LabelIcon
                        icon={Trash}
                        label="Delete"
                        onClick={() => {
                          // setActivePopover(null);

                          setConfirmId(txt._id);
                        }}
                      />
                    </div>
                     <div className="w-28">
                      <LabelIcon
                        icon={Setting}
                        label="Approve"
                        onClick={() => {
                          setActivePopover(null);

                          handleApprove(txt?._id)
                        }}
                      />
                    </div>

                     <div className="w-28">
                      <LabelIcon
                        icon={Setting}
                        label="Feature"
                        onClick={() => {
                          setActivePopover(null);

                          handleFeature(txt?._id)
                        }}
                      />
                    </div>
                  </>
                }
                placement="bottomRight"
              >
                <img
                  src={OptionsIcon}
                  alt="Options"
                  className="cursor-pointer"
                />
              </Popover>
            </>
          </>
        );
      },
    },
  ];

  /* stats */
  const stats = {
    total: properties.length,
    approved: properties.filter((p) => p.isApproved).length,
    featured: properties.filter((p) => p.isFeatured).length,
    pending: properties.filter((p) => !p.isApproved).length,
  };

  /* unique cities for filter */
  const cities = ["All", ...new Set(allProperties.map((p) => p.city))];

  /* client-side search */
  const filtered = properties.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.propertyName?.toLowerCase().includes(q) ||
      p.city?.toLowerCase().includes(q) ||
      p.ownerName?.toLowerCase().includes(q) ||
      p.propertyId?.toLowerCase().includes(q)
    );
  });

  /* ── API ACTIONS ── */

  /* POST /api/bnb/add */
  const handleAdd = async (fd) => {
    setSaving(true);
    try {
      // const r = await fetch(`${API}/add`, { method: "POST", body: fd });
      // const r = await fetch(`${API}/add`, { method: "POST", body: fd });
      const r = await addBnbLibrary(fd);
      const d = r;
      if (r.status === 201) {
        // toast("Property added!");
        message.success("Property added!");
        fetchAll();
        setModal(null);
      } else message.error(d.message || "Add failed");
    } catch (error) {
      // toast("Network error", "error");
      const errMsg =
        error?.response?.data?.message || // backend message
        error?.response?.data?.error || // sometimes APIs use 'error'
        error?.message || // fallback
        "Failed to add property!";

      message.error(errMsg);
    }
    setSaving(false);
  };

  /* PUT /api/bnb/update/:id */
  const handleUpdate = async (fd) => {
    setSaving(true);
    try {
      const r = await fetch(`${API}/update/${modal.data._id}`, {
        method: "PUT",
        body: fd,
      });
      const d = await r.json();
      if (d.success) {
        message.success("Property updated!");
        fetchAll();
        setModal(null);
      } else message.error(d.message || "Update failed");
    } catch {
      message.error("Network error");
    }
    setSaving(false);
  };

  /* DELETE /api/bnb/delete/:id */
  const handleDelete = async () => {
    try {
      const r = await fetch(`${API}/delete/${confirmId}`, { method: "DELETE" });
      const d = await r.json();
      if (d.success) {
        // toast("Property deleted");
        message.error("Property deleted");
        fetchAll();
      // } else toast(d.message || "Delete failed", "error");
      } else message.error(d.message || "Delete failed", "error");
    } catch {
      // toast("Network error", "error");
      message.error("Network error");
    }
    setConfirmId(null);
  };

  /* PATCH /api/bnb/approve/:id */
  const handleApprove = async (id) => {
    try {
      const r = await fetch(`${API}/approve/${id}`, { method: "PATCH" });
      const d = await r.json();
      if (d.success) {
        // toast("Property approved! ✓");
        message.success("Property approved! ✓");
        fetchAll();
      } else message.error(d.message || "Approve failed");
    } catch {
      message.error("Network error");
    }
  };

  /* PATCH /api/bnb/feature/:id */
  const handleFeature = async (id) => {
    try {
      const r = await fetch(`${API}/feature/${id}`, { method: "PATCH" });
      const d = await r.json();
      if (d.success) {
        message.success("Property featured! ⭐");
        fetchAll();
      } else message.error(d.message || "Feature failed");
    } catch {
      message.error("Network error");
    }
  };

  /* ─────────────────── RENDER ─────────────────── */
  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
        {/* ── HEADER ── */}
        <header
          style={{
            background: "var(--s1)",
            borderBottom: "1px solid var(--border)",
            position: "sticky",
            top: 0,
            zIndex: 100,
          }}
        >
          <div
            style={{
              maxWidth: 1300,
              margin: "0 auto",
              padding: "0 28px",
              height: 60,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* <div style={{
                width:34, height:34,
                background:"linear-gradient(135deg, var(--gold), var(--gold-lt))",
                borderRadius:8, display:"flex", alignItems:"center",
                justifyContent:"center", fontSize:17
              }}>🏡</div> */}
              <div>
                <div
                  className=""
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 19,
                    fontWeight: 700,
                    lineHeight: 1,
                  }}
                >
                  BnB Manager
                </div>
                <div
                  style={{
                    fontSize: 10.5,
                    color: "var(--muted)",
                    letterSpacing: ".05em",
                  }}
                >
                  PROPERTY MANAGEMENT
                </div>
              </div>
            </div>
            <button
              onClick={() => setModal({ type: "add" })}
              className="bg-white"
              style={{
                // background:"linear-gradient(135deg, var(--gold), var(--gold-lt))",

                border: "none",
                color: "#000",
                borderRadius: "var(--r-sm)",
                padding: "9px 20px",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: ".03em",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              + Add Property
            </button>
          </div>
        </header>

        <main
          style={{ maxWidth: 1300, margin: "0 auto", padding: "26px 28px" }}
        >
          {/* ── STATS ── */}
          <div
            style={{
              display: "flex",
              gap: 12,
              marginBottom: 26,
              flexWrap: "wrap",
            }}
          >
            <StatCard
              label="Total Properties"
              value={stats.total}
              icon="🏘"
              accent="var(--gold)"
            />
            <StatCard
              label="Approved"
              value={stats.approved}
              icon="✓"
              accent="var(--green)"
            />
            <StatCard
              label="Featured"
              value={stats.featured}
              icon="⭐"
              accent="var(--gold-lt)"
            />
            <StatCard
              label="Pending Review"
              value={stats.pending}
              icon="⏳"
              accent="var(--red)"
            />
          </div>

          {/* ── FILTERS ── */}
          <div
            style={{
              display: "flex",
              gap: 10,
              marginBottom: 22,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            {/* search */}
            <div
              style={{
                flex: 1,
                minWidth: 220,
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  left: 12,
                  fontSize: 14,
                  opacity: 0.4,
                }}
              >
                🔍
              </span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, city, owner, ID…"
                style={{ paddingLeft: 36 }}
              />
            </div>

            {/* city chips */}
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {/* {cities.map((c) => (
                <button
                  key={c}
                  onClick={() => setFilterCity(c)}
                  style={{
                    // background: filterCity===c ? "var(--gold-bg)"  : "var(--s2)",
                    background: filterCity === c ? "var(--s2)" : "white",

                    color: filterCity === c ? "white" : "black",
                    borderRadius: 20,
                    padding: "6px 13px",
                    fontSize: 12,
                    transition: "all .12s",
                  }}
                >
                  {c}
                </button>
              ))} */}
              <Select
                className="w-[100px]"
                value={filterCity}
                onChange={(e) => setFilterCity(e)}
              >
                {cities?.map((item) => {
                  return (
                    <>
                      <Option value={item}>{item}</Option>
                    </>
                  );
                })}
              </Select>
            </div>

            {/* status dropdowns */}
            {/* <select value={filterApproved} onChange={e => setFilterApproved(e.target.value)}
              style={{ width:"auto", minWidth:130 }}>
              <option value="all">All Status</option>
              <option value="true">Approved</option>
              <option value="false">Pending</option>
            </select> */}
            <Select
              className="w-[100px]"
              value={filterApproved}
              onChange={(e) => setFilterApproved(e)}
            >
              <Option value="all">All Status</Option>
              <Option value="true">Approved</Option>
              <Option value="false">Pending</Option>
            </Select>

            {/* <select value={filterFeatured} onChange={e => setFilterFeatured(e.target.value)}
              style={{ width:"auto", minWidth:130 }}>
              <option value="all">All Types</option>
              <option value="true">Featured</option>
              <option value="false">Regular</option>
            </select> */}

            <Select
              className="w-[100px]"
              value={filterFeatured}
              onChange={(e) => setFilterFeatured(e)}
            >
              <Option value="all">All Status</Option>
              <Option value="true">Featured</Option>
              <Option value="false">Regular</Option>
            </Select>

            <button
              onClick={fetchAll}
              style={{
                background: "var(--s2)",
                border: "1px solid var(--border)",
                color: "var(--muted)",
                borderRadius: "var(--r-sm)",
                padding: "8px 14px",
                fontSize: 12.5,
              }}
            >
              ↻ Refresh
            </button>
          </div>

          {/* ── RESULTS COUNT ── */}
          {/* {!loading && (
            <p className="font-semibold text-xl mb-2text-black ">
              Showing {filtered.length} of {properties.length} properties
            </p>
          )} */}

          {/* ── GRID / STATES ── */}
          {loading ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 360,
                gap: 14,
              }}
            >
              <Spinner size={40} />
              <span style={{ color: "var(--muted)", fontSize: 14 }}>
                Loading properties…
              </span>
            </div>
          ) : (
            <CommonTable
              columns={columns}
              data={filtered}

              // onApprove={handleApprove}
              // onFeature={handleFeature}
            />
          )}
        </main>
      </div>

      {/* ── MODALS ── */}
      {modal?.type === "add" && (
        <Modal
          title="Add New Property"
          subtitle="Fill in all details below"
          onClose={() => setModal(null)}
        >
          <PropertyForm
            onSubmit={handleAdd}
            onClose={() => setModal(null)}
            loading={saving}
          />
        </Modal>
      )}

      {modal?.type === "edit" && (
        <Modal
          title="Edit Property"
          subtitle={modal.data.propertyName}
          onClose={() => setModal(null)}
        >
          <PropertyForm
            initial={modal.data}
            onSubmit={handleUpdate}
            onClose={() => setModal(null)}
            loading={saving}
          />
        </Modal>
      )}

      {modal?.type === "view" && (
        <Modal
          title={modal.data.propertyName}
          subtitle={`${modal.data.city}, ${modal.data.state}`}
          onClose={() => setModal(null)}
        >
          <DetailView p={modal.data} />
        </Modal>
      )}

      {/* ── DELETE CONFIRM ── */}
      {confirmId && (
        <Confirm
          msg="Are you sure you want to delete this property? This action cannot be undone."
          onYes={handleDelete}
          onNo={() => setConfirmId(null)}
        />
      )}

      {/* ── TOASTS ── */}
      <Toast toasts={toasts} />
    </>
  );
}
