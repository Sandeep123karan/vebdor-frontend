import { useState, useEffect } from "react";

const API_BASE = "http://localhost:7000/api/palaces";

const AMENITIES_LIST = [
  "Swimming Pool", "Spa", "Gym", "Restaurant", "Bar", "Parking",
  "WiFi", "AC", "Helipad", "Garden", "Ballroom", "Conference Hall",
  "Butler Service", "Horse Riding", "Museum Tour", "Bonfire Area"
];

/* ═══════════════════════════════════════════════════
   SCOPED STYLES  (no body/sidebar overrides — VendorLayout ka styling safe)
═══════════════════════════════════════════════════ */
const palaceStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');

  .palace-root *, .palace-root *::before, .palace-root *::after {
    box-sizing: border-box;
  }

  .palace-root {
    --pg: #C9A84C;
    --pg-light: #E8C97A;
    --pg-dark: #8B6914;
    --pc: #FAF6EE;
    --pd: #1A1208;
    --pd2: #2D2010;
    --pm: #7A6A50;
    --pb: rgba(201,168,76,0.25);
    --pe: #C0392B;
    --ps: #27AE60;
    font-family: 'Jost', sans-serif;
    background: #1A1208;
    color: #FAF6EE;
    min-height: 100%;
    padding: 0;
  }

  /* ── TOP ACTION BAR ── */
  .pal-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 28px;
    border-bottom: 1px solid var(--pb);
    background: rgba(26,18,8,0.6);
    backdrop-filter: blur(8px);
    flex-wrap: wrap;
    gap: 12px;
  }

  .pal-topbar-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 26px;
    font-weight: 600;
    color: var(--pc);
    letter-spacing: 0.5px;
  }

  .pal-topbar-title span { color: var(--pg); }

  /* ── BUTTONS ── */
  .pb { padding: 9px 22px; font-family: 'Jost', sans-serif; font-size: 12px; font-weight: 500;
    letter-spacing: 1.5px; text-transform: uppercase; border: none; cursor: pointer;
    transition: all 0.2s; display: inline-flex; align-items: center; gap: 8px; border-radius: 2px; }
  .pb-gold { background: var(--pg); color: var(--pd); }
  .pb-gold:hover { background: var(--pg-light); transform: translateY(-1px); }
  .pb-outline { background: transparent; color: var(--pg); border: 1px solid var(--pb); }
  .pb-outline:hover { border-color: var(--pg); background: rgba(201,168,76,0.08); }
  .pb-danger { background: transparent; color: var(--pe); border: 1px solid rgba(192,57,43,0.3); }
  .pb-danger:hover { background: rgba(192,57,43,0.1); }
  .pb-sm { padding: 6px 14px; font-size: 11px; }
  .pb:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; }

  /* ── INNER CONTENT ── */
  .pal-body { padding: 24px 28px; }

  /* ── STATS ── */
  .pal-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 24px; }

  .pal-stat {
    background: var(--pd2); border: 1px solid var(--pb); padding: 20px;
    position: relative; overflow: hidden;
  }
  .pal-stat::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, var(--pg-dark), var(--pg), var(--pg-dark));
  }
  .pal-stat-label { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--pm); margin-bottom: 6px; }
  .pal-stat-val { font-family: 'Cormorant Garamond', serif; font-size: 36px; font-weight: 600; color: var(--pg); line-height: 1; }
  .pal-stat-sub { font-size: 11px; color: var(--pm); margin-top: 4px; }

  /* ── FILTER ── */
  .pal-filter { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; align-items: center; }
  .pal-search-wrap { position: relative; flex: 1; min-width: 200px; }
  .pal-search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); font-size: 14px; color: var(--pm); pointer-events: none; }
  .pal-search {
    width: 100%; background: var(--pd2); border: 1px solid var(--pb);
    color: var(--pc); padding: 9px 12px 9px 34px; font-family: 'Jost', sans-serif;
    font-size: 13px; outline: none; border-radius: 2px; transition: border-color 0.2s;
  }
  .pal-search:focus { border-color: var(--pg); }
  .pal-search::placeholder { color: rgba(122,106,80,0.5); }
  .pal-fsel {
    background: var(--pd2); border: 1px solid var(--pb); color: var(--pm);
    padding: 9px 12px; font-family: 'Jost', sans-serif; font-size: 12px;
    outline: none; border-radius: 2px; cursor: pointer;
  }
  .pal-fsel option { background: var(--pd2); }
  .pal-fsel:focus { border-color: var(--pg); }

  /* ── CARDS GRID ── */
  .pal-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }

  .pal-card {
    background: var(--pd2); border: 1px solid var(--pb);
    overflow: hidden; transition: all 0.3s;
  }
  .pal-card:hover { border-color: rgba(201,168,76,0.5); transform: translateY(-2px); box-shadow: 0 10px 36px rgba(0,0,0,0.4); }

  .pal-img { height: 190px; overflow: hidden; position: relative; background: var(--pd); }
  .pal-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
  .pal-card:hover .pal-img img { transform: scale(1.06); }
  .pal-no-img { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 44px; background: linear-gradient(135deg,#1a1208 0%,#2d2010 100%); color: var(--pm); }

  .pal-badges { position: absolute; top: 10px; left: 10px; display: flex; gap: 6px; flex-wrap: wrap; }
  .pbadge { padding: 2px 9px; font-size: 9px; letter-spacing: 1px; text-transform: uppercase; font-weight: 600; border-radius: 1px; }
  .pbadge-gold { background: var(--pg); color: var(--pd); }
  .pbadge-green { background: var(--ps); color: #fff; }
  .pbadge-pending { background: #E67E22; color: #fff; }
  .pbadge-rejected { background: var(--pe); color: #fff; }
  .pbadge-featured { background: rgba(201,168,76,0.2); color: var(--pg); border: 1px solid var(--pg); }

  .pal-info { padding: 18px; }
  .pal-name { font-family: 'Cormorant Garamond', serif; font-size: 20px; font-weight: 600; color: var(--pc); margin-bottom: 3px; line-height: 1.2; }
  .pal-loc { font-size: 11px; color: var(--pm); margin-bottom: 12px; }
  .pal-meta { display: flex; gap: 14px; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid var(--pb); }
  .pal-meta-i { font-size: 11px; color: var(--pm); }
  .pal-meta-i strong { color: var(--pg); font-weight: 500; display: block; font-size: 15px; }
  .pal-price { display: flex; align-items: baseline; gap: 5px; margin-bottom: 14px; }
  .pal-price-amt { font-family: 'Cormorant Garamond', serif; font-size: 25px; font-weight: 600; color: var(--pg); }
  .pal-price-lbl { font-size: 11px; color: var(--pm); }
  .pal-actions { display: flex; gap: 8px; }

  /* ── EMPTY / LOADER ── */
  .pal-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 70px 20px; text-align: center; }
  .pal-empty-ico { font-size: 52px; margin-bottom: 14px; opacity: 0.35; }
  .pal-empty-title { font-family: 'Cormorant Garamond', serif; font-size: 20px; color: var(--pm); margin-bottom: 5px; }
  .pal-empty-sub { font-size: 12px; color: var(--pm); margin-bottom: 20px; }

  .pal-loader { display: flex; align-items: center; justify-content: center; padding: 70px; font-size: 12px; color: var(--pm); letter-spacing: 2px; }
  .pal-spin { width: 24px; height: 24px; border: 2px solid var(--pb); border-top-color: var(--pg); border-radius: 50%; animation: palSpin 0.7s linear infinite; margin-right: 10px; }
  @keyframes palSpin { to { transform: rotate(360deg); } }

  /* ── TOAST ── */
  .pal-toast {
    position: fixed; bottom: 24px; right: 24px; padding: 13px 20px;
    font-size: 13px; letter-spacing: 0.5px; z-index: 9999; border-left: 3px solid;
    animation: palSlide 0.3s ease; font-family: 'Jost', sans-serif;
  }
  .pal-toast-ok { background: #2D2010; border-color: var(--ps); color: #5dbb7b; }
  .pal-toast-err { background: #2D2010; border-color: var(--pe); color: #e87464; }
  @keyframes palSlide { from { transform: translateX(28px); opacity: 0; } to { transform: none; opacity: 1; } }

  /* ── MODAL OVERLAY ── */
  .pal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.82);
    backdrop-filter: blur(4px); z-index: 1000;
    display: flex; align-items: flex-start; justify-content: center;
    padding: 20px; overflow-y: auto;
  }

  .pal-modal {
    background: #2D2010; border: 1px solid var(--pb);
    width: 100%; max-width: 760px; margin: auto; position: relative;
  }

  .pal-mhdr {
    padding: 24px 28px 20px; border-bottom: 1px solid var(--pb);
    display: flex; align-items: center; justify-content: space-between;
  }
  .pal-mtitle { font-family: 'Cormorant Garamond', serif; font-size: 24px; font-weight: 600; color: var(--pc); }
  .pal-mclose { background: none; border: none; color: var(--pm); font-size: 22px; cursor: pointer; padding: 2px; line-height: 1; transition: color 0.2s; }
  .pal-mclose:hover { color: var(--pc); }
  .pal-mbody { padding: 24px 28px; max-height: 72vh; overflow-y: auto; }
  .pal-mftr { padding: 16px 28px; border-top: 1px solid var(--pb); display: flex; justify-content: flex-end; gap: 10px; }

  /* ── FORM ── */
  .pal-fsec { margin-bottom: 24px; }
  .pal-fsec-title {
    font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: var(--pg);
    margin-bottom: 14px; display: flex; align-items: center; gap: 8px;
  }
  .pal-fsec-title::after { content: ''; flex: 1; height: 1px; background: var(--pb); }

  .pal-fgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .pal-fgrid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }
  .pal-full { grid-column: 1 / -1; }
  .pal-fgroup { display: flex; flex-direction: column; gap: 5px; }
  .pal-flabel { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--pm); font-weight: 500; }

  .pal-input, .pal-textarea {
    background: rgba(26,18,8,0.7); border: 1px solid var(--pb); color: var(--pc);
    padding: 9px 12px; font-family: 'Jost', sans-serif; font-size: 13px;
    width: 100%; outline: none; transition: border-color 0.2s; border-radius: 2px;
  }
  .pal-input:focus, .pal-textarea:focus { border-color: var(--pg); }
  .pal-input::placeholder { color: rgba(122,106,80,0.5); }
  .pal-textarea { resize: vertical; min-height: 80px; }

  .pal-checks { display: flex; flex-wrap: wrap; gap: 10px; }
  .pal-chk {
    display: flex; align-items: center; gap: 7px; cursor: pointer;
    font-size: 12px; color: var(--pm); transition: color 0.2s;
  }
  .pal-chk:hover { color: var(--pc); }
  .pal-chk input { accent-color: var(--pg); width: 14px; height: 14px; cursor: pointer; }
  .pal-chk.on { color: var(--pc); }

  .pal-atag {
    padding: 5px 12px; border: 1px solid var(--pb); font-size: 11px;
    cursor: pointer; transition: all 0.15s; border-radius: 2px; color: var(--pm); letter-spacing: 0.5px;
  }
  .pal-atag:hover { border-color: var(--pg); color: var(--pg); }
  .pal-atag.on { background: rgba(201,168,76,0.14); border-color: var(--pg); color: var(--pg); }

  /* ── ROOM ROW ── */
  .pal-rrow {
    display: grid; grid-template-columns: 1.5fr 1fr 1fr auto auto;
    gap: 8px; align-items: center; padding: 10px;
    background: rgba(26,18,8,0.4); border: 1px solid var(--pb); margin-bottom: 7px; border-radius: 2px;
  }
  .pal-rcheck { display: flex; align-items: center; justify-content: center; }
  .pal-rcheck input { accent-color: var(--pg); width: 15px; height: 15px; cursor: pointer; }
  .pal-add-room {
    display: flex; align-items: center; gap: 7px; color: var(--pg); font-size: 12px;
    cursor: pointer; padding: 8px 0; letter-spacing: 0.5px; transition: opacity 0.2s;
    background: none; border: none; font-family: 'Jost', sans-serif;
  }
  .pal-add-room:hover { opacity: 0.65; }

  /* ── THUMBS ── */
  .pal-thumbs { display: flex; gap: 7px; flex-wrap: wrap; margin-top: 8px; }
  .pal-thumb { width: 64px; height: 64px; object-fit: cover; border: 1px solid var(--pb); border-radius: 2px; }

  /* ── DETAIL ── */
  .pal-det-grid { display: grid; grid-template-columns: 1fr 300px; gap: 20px; }
  .pal-isec { background: rgba(26,18,8,0.5); border: 1px solid var(--pb); padding: 20px; margin-bottom: 16px; }
  .pal-isec h3 { font-family: 'Cormorant Garamond', serif; font-size: 16px; color: var(--pg); margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid var(--pb); }
  .pal-irow { display: flex; justify-content: space-between; padding: 7px 0; border-bottom: 1px solid rgba(201,168,76,0.07); font-size: 13px; }
  .pal-irow:last-child { border: none; }
  .pal-irow .lbl { color: var(--pm); }
  .pal-irow .val { color: var(--pc); }

  /* ── CONFIRM ── */
  .pal-confirm {
    background: #2D2010; border: 1px solid var(--pb); padding: 32px;
    max-width: 380px; width: 100%; text-align: center;
  }
  .pal-conf-ico { font-size: 36px; margin-bottom: 12px; }
  .pal-conf-title { font-family: 'Cormorant Garamond', serif; font-size: 22px; margin-bottom: 7px; color: var(--pc); }
  .pal-conf-text { color: var(--pm); font-size: 13px; margin-bottom: 20px; }
  .pal-conf-btns { display: flex; gap: 10px; justify-content: center; }

  /* ── RESPONSIVE ── */
  @media (max-width: 800px) {
    .pal-stats { grid-template-columns: 1fr 1fr; }
    .pal-det-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 560px) {
    .pal-grid { grid-template-columns: 1fr; }
    .pal-fgrid, .pal-fgrid3 { grid-template-columns: 1fr; }
    .pal-stats { grid-template-columns: 1fr 1fr; }
    .pal-mbody { padding: 16px; }
    .pal-mhdr, .pal-mftr { padding: 16px; }
    .pal-body { padding: 16px; }
    .pal-topbar { padding: 14px 16px; }
  }
`;

/* ═══════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════ */
const statusBadge = (s) => {
  if (s === "approved") return "pbadge-green";
  if (s === "rejected") return "pbadge-rejected";
  return "pbadge-pending";
};

const fmtPrice = (n) => n ? "₹" + Number(n).toLocaleString("en-IN") : "N/A";

/* ═══════════════════════════════════════════════════
   INIT STATE
═══════════════════════════════════════════════════ */
const initForm = () => ({
  propertyName: "", description: "", ownerName: "",
  email: "", phone: "", password: "",
  country: "", state: "", city: "", fullAddress: "",
  latitude: "", longitude: "",
  totalRooms: "", heritageCertified: false,
  weddingAllowed: false, eventAllowed: false,
  amenities: [], basePrice: "", weekendPrice: "", rooms: []
});

const initRoom = () => ({ roomType: "", price: "", capacity: "", available: true, images: [] });

/* ═══════════════════════════════════════════════════
   TOAST
═══════════════════════════════════════════════════ */
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [msg]);
  if (!msg) return null;
  return (
    <div className={`pal-toast pal-toast-${type === "success" ? "ok" : "err"}`}>
      {type === "success" ? "✓ " : "✕ "}{msg}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   CONFIRM DIALOG
═══════════════════════════════════════════════════ */
function Confirm({ msg, onConfirm, onCancel }) {
  return (
    <div className="pal-overlay" onClick={onCancel}>
      <div className="pal-confirm" onClick={e => e.stopPropagation()}>
        <div className="pal-conf-ico">🗑️</div>
        <div className="pal-conf-title">Are you sure?</div>
        <div className="pal-conf-text">{msg}</div>
        <div className="pal-conf-btns">
          <button className="pb pb-outline" onClick={onCancel}>Cancel</button>
          <button className="pb pb-danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   PALACE FORM MODAL
═══════════════════════════════════════════════════ */
function PalaceForm({ initial, onSave, onClose, loading }) {
  const [form, setForm] = useState(() => initial
    ? { ...initial, amenities: initial.amenities || [], rooms: initial.rooms || [] }
    : initForm()
  );
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState(initial?.images || []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleAmenity = (a) => set("amenities",
    form.amenities.includes(a) ? form.amenities.filter(x => x !== a) : [...form.amenities, a]
  );

  const addRoom = () => set("rooms", [...form.rooms, initRoom()]);
  const setRoom = (i, k, v) => set("rooms", form.rooms.map((r, idx) => idx === i ? { ...r, [k]: v } : r));
  const removeRoom = (i) => set("rooms", form.rooms.filter((_, idx) => idx !== i));

  const handleFiles = (e) => {
    const f = Array.from(e.target.files);
    setFiles(f);
    setPreviews(f.map(file => URL.createObjectURL(file)));
  };

  const handleSubmit = () => {
    if (!form.propertyName.trim()) { alert("Property Name is required"); return; }
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === "rooms" || k === "amenities") fd.append(k, JSON.stringify(v));
      else fd.append(k, v);
    });
    files.forEach(f => fd.append("images", f));
    onSave(fd);
  };

  return (
    <div className="pal-overlay" onClick={onClose}>
      <div className="pal-modal" onClick={e => e.stopPropagation()}>
        <div className="pal-mhdr">
          <div className="pal-mtitle">{initial ? "Edit Palace" : "Add New Palace"}</div>
          <button className="pal-mclose" onClick={onClose}>×</button>
        </div>

        <div className="pal-mbody">
          {/* Property */}
          <div className="pal-fsec">
            <div className="pal-fsec-title">Property Details</div>
            <div className="pal-fgrid">
              <div className="pal-fgroup pal-full">
                <label className="pal-flabel">Property Name *</label>
                <input className="pal-input" value={form.propertyName}
                  onChange={e => set("propertyName", e.target.value)} placeholder="e.g. Umaid Bhawan Palace" />
              </div>
              <div className="pal-fgroup pal-full">
                <label className="pal-flabel">Description</label>
                <textarea className="pal-textarea" value={form.description}
                  onChange={e => set("description", e.target.value)} placeholder="Describe the palace..." />
              </div>
            </div>
          </div>

          {/* Owner */}
          <div className="pal-fsec">
            <div className="pal-fsec-title">Owner Information</div>
            <div className="pal-fgrid">
              {[["ownerName","Owner Name","Full name"],["email","Email","owner@palace.com","email"],
                ["phone","Phone","+91 XXXXX XXXXX"],["password","Password","••••••••","password"]
              ].map(([key, label, ph, type="text"]) => (
                <div className="pal-fgroup" key={key}>
                  <label className="pal-flabel">{label}</label>
                  <input className="pal-input" type={type} value={form[key]}
                    onChange={e => set(key, e.target.value)} placeholder={ph} />
                </div>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="pal-fsec">
            <div className="pal-fsec-title">Location</div>
            <div className="pal-fgrid3">
              {[["country","Country","India"],["state","State","Rajasthan"],["city","City","Jodhpur"]].map(([k,l,p]) => (
                <div className="pal-fgroup" key={k}>
                  <label className="pal-flabel">{l}</label>
                  <input className="pal-input" value={form[k]} onChange={e => set(k, e.target.value)} placeholder={p} />
                </div>
              ))}
              <div className="pal-fgroup pal-full">
                <label className="pal-flabel">Full Address</label>
                <input className="pal-input" value={form.fullAddress}
                  onChange={e => set("fullAddress", e.target.value)} placeholder="Complete address" />
              </div>
              <div className="pal-fgroup">
                <label className="pal-flabel">Latitude</label>
                <input className="pal-input" type="number" value={form.latitude}
                  onChange={e => set("latitude", e.target.value)} placeholder="26.2924" />
              </div>
              <div className="pal-fgroup">
                <label className="pal-flabel">Longitude</label>
                <input className="pal-input" type="number" value={form.longitude}
                  onChange={e => set("longitude", e.target.value)} placeholder="73.0169" />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="pal-fsec">
            <div className="pal-fsec-title">Pricing & Capacity</div>
            <div className="pal-fgrid">
              <div className="pal-fgroup">
                <label className="pal-flabel">Base Price (₹)</label>
                <input className="pal-input" type="number" value={form.basePrice}
                  onChange={e => set("basePrice", e.target.value)} placeholder="25000" />
              </div>
              <div className="pal-fgroup">
                <label className="pal-flabel">Weekend Price (₹)</label>
                <input className="pal-input" type="number" value={form.weekendPrice}
                  onChange={e => set("weekendPrice", e.target.value)} placeholder="35000" />
              </div>
              <div className="pal-fgroup">
                <label className="pal-flabel">Total Rooms</label>
                <input className="pal-input" type="number" value={form.totalRooms}
                  onChange={e => set("totalRooms", e.target.value)} placeholder="20" />
              </div>
            </div>
          </div>

          {/* Flags */}
          <div className="pal-fsec">
            <div className="pal-fsec-title">Features & Permissions</div>
            <div className="pal-checks">
              {[["heritageCertified","🏛️ Heritage Certified"],["weddingAllowed","💍 Weddings Allowed"],["eventAllowed","🎪 Events Allowed"]].map(([k,l]) => (
                <label key={k} className={`pal-chk ${form[k] ? "on" : ""}`}>
                  <input type="checkbox" checked={!!form[k]} onChange={e => set(k, e.target.checked)} />
                  {l}
                </label>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div className="pal-fsec">
            <div className="pal-fsec-title">Amenities</div>
            <div className="pal-checks">
              {AMENITIES_LIST.map(a => (
                <div key={a} className={`pal-atag ${form.amenities.includes(a) ? "on" : ""}`}
                  onClick={() => toggleAmenity(a)}>{a}</div>
              ))}
            </div>
          </div>

          {/* Rooms */}
          <div className="pal-fsec">
            <div className="pal-fsec-title">Room Types</div>
            {form.rooms.map((room, i) => (
              <div className="pal-rrow" key={i}>
                <input className="pal-input" value={room.roomType}
                  onChange={e => setRoom(i, "roomType", e.target.value)} placeholder="e.g. Suite" />
                <input className="pal-input" type="number" value={room.price}
                  onChange={e => setRoom(i, "price", e.target.value)} placeholder="Price ₹" />
                <input className="pal-input" type="number" value={room.capacity}
                  onChange={e => setRoom(i, "capacity", e.target.value)} placeholder="Capacity" />
                <div className="pal-rcheck">
                  <input type="checkbox" checked={!!room.available}
                    onChange={e => setRoom(i, "available", e.target.checked)} title="Available" />
                </div>
                <button className="pb pb-danger pb-sm" onClick={() => removeRoom(i)}>✕</button>
              </div>
            ))}
            <button className="pal-add-room" onClick={addRoom}>＋ Add Room Type</button>
          </div>

          {/* Images */}
          <div className="pal-fsec">
            <div className="pal-fsec-title">Images</div>
            <input type="file" accept="image/*" multiple onChange={handleFiles}
              style={{ color: "var(--pm)", fontSize: 12 }} />
            {previews.length > 0 && (
              <div className="pal-thumbs">
                {previews.map((src, i) => <img key={i} className="pal-thumb" src={src} alt="" />)}
              </div>
            )}
          </div>
        </div>

        <div className="pal-mftr">
          <button className="pb pb-outline" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="pb pb-gold" onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : initial ? "Update Palace" : "Add Palace"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   PALACE CARD
═══════════════════════════════════════════════════ */
function PalaceCard({ palace, onEdit, onDelete, onView }) {
  return (
    <div className="pal-card">
      <div className="pal-img">
        {palace.images && palace.images.length > 0 && palace.images[0] !== null ? (
  <img src={palace.images[0]} alt={palace.propertyName} />
) : (
  <div className="pal-no-img"></div>
)}
       {palace.images && palace.images.length > 0 && palace.images[0] !== null ? (
  <img src={palace.images[0]} alt={palace.propertyName} />
) : (
  <div className="pal-no-img">🏰</div>
)}
        <div className="pal-badges">
          <span className={`pbadge ${statusBadge(palace.status)}`}>{palace.status}</span>
          {palace.heritageCertified && <span className="pbadge pbadge-gold">Heritage</span>}
          {palace.featured && <span className="pbadge pbadge-featured">Featured</span>}
        </div>
      </div>
      <div className="pal-info">
        <div className="pal-name">{palace.propertyName}</div>
        <div className="pal-loc">📍 {[palace.city, palace.state, palace.country].filter(Boolean).join(", ") || "Location not set"}</div>
        <div className="pal-meta">
          <div className="pal-meta-i"><strong>{palace.totalRooms || 0}</strong>Rooms</div>
          <div className="pal-meta-i"><strong>{palace.rooms?.length || 0}</strong>Types</div>
          <div className="pal-meta-i"><strong>{palace.amenities?.length || 0}</strong>Amenities</div>
        </div>
        <div className="pal-price">
          <span className="pal-price-amt">{fmtPrice(palace.basePrice)}</span>
          <span className="pal-price-lbl">/ night</span>
          {palace.weekendPrice && <span className="pal-price-lbl" style={{ marginLeft: 4 }}>· {fmtPrice(palace.weekendPrice)} wknd</span>}
        </div>
        <div className="pal-actions">
          <button className="pb pb-outline pb-sm" onClick={() => onView(palace)}>View</button>
          <button className="pb pb-gold pb-sm" onClick={() => onEdit(palace)}>Edit</button>
          <button className="pb pb-danger pb-sm" onClick={() => onDelete(palace)}>Delete</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   DETAIL MODAL
═══════════════════════════════════════════════════ */
function PalaceDetail({ palace, onClose }) {
  return (
    <div className="pal-overlay" onClick={onClose}>
      <div className="pal-modal" style={{ maxWidth: 820 }} onClick={e => e.stopPropagation()}>
        <div className="pal-mhdr">
          <div className="pal-mtitle">{palace.propertyName}</div>
          <button className="pal-mclose" onClick={onClose}>×</button>
        </div>
        <div className="pal-mbody">
          {palace.images?.length > 0 && (
            <div className="pal-thumbs" style={{ marginBottom: 18 }}>
              {palace.images.map((src, i) => (
                <img key={i} src={src} alt=""
                  style={{ width: 110, height: 80, objectFit: "cover", border: "1px solid var(--pb)", borderRadius: 2 }} />
              ))}
            </div>
          )}
          <div className="pal-det-grid">
            <div>
              <div className="pal-isec">
                <h3>Property Info</h3>
                {[
                  ["Status", <span className={`pbadge ${statusBadge(palace.status)}`}>{palace.status}</span>],
                  ["Category", palace.category || "palace"],
                  ["Heritage", palace.heritageCertified ? "✓ Certified" : "No"],
                  ["Total Rooms", palace.totalRooms || "N/A"],
                  ["Wedding", palace.weddingAllowed ? "Allowed" : "Not Allowed"],
                  ["Events", palace.eventAllowed ? "Allowed" : "Not Allowed"],
                ].map(([l, v]) => (
                  <div className="pal-irow" key={l}>
                    <span className="lbl">{l}</span><span className="val">{v}</span>
                  </div>
                ))}
              </div>
              {palace.description && (
                <div className="pal-isec">
                  <h3>Description</h3>
                  <p style={{ fontSize: 13, color: "var(--pm)", lineHeight: 1.7 }}>{palace.description}</p>
                </div>
              )}
              {palace.amenities?.length > 0 && (
                <div className="pal-isec">
                  <h3>Amenities</h3>
                  <div className="pal-checks" style={{ flexWrap: "wrap" }}>
                    {palace.amenities.map(a => <span key={a} className="pal-atag on">{a}</span>)}
                  </div>
                </div>
              )}
            </div>
            <div>
              <div className="pal-isec">
                <h3>Location</h3>
                {[
                  ["Country", palace.country],["State", palace.state],["City", palace.city],
                  ["Address", palace.fullAddress],
                  ["Lat / Lng", palace.latitude ? `${palace.latitude}, ${palace.longitude}` : "N/A"]
                ].map(([l,v]) => (
                  <div className="pal-irow" key={l}><span className="lbl">{l}</span><span className="val">{v||"—"}</span></div>
                ))}
              </div>
              <div className="pal-isec">
                <h3>Pricing</h3>
                {[["Base Price", fmtPrice(palace.basePrice)],["Weekend Price", fmtPrice(palace.weekendPrice)]].map(([l,v]) => (
                  <div className="pal-irow" key={l}><span className="lbl">{l}</span><span className="val" style={{ color:"var(--pg)" }}>{v}</span></div>
                ))}
              </div>
              <div className="pal-isec">
                <h3>Owner</h3>
                {[["Name",palace.ownerName],["Email",palace.email],["Phone",palace.phone]].map(([l,v]) => (
                  <div className="pal-irow" key={l}><span className="lbl">{l}</span><span className="val">{v||"—"}</span></div>
                ))}
              </div>
              {palace.rooms?.length > 0 && (
                <div className="pal-isec">
                  <h3>Room Types</h3>
                  {palace.rooms.map((r, i) => (
                    <div className="pal-irow" key={i} style={{ flexDirection:"column", gap: 2, alignItems:"stretch" }}>
                      <div style={{ display:"flex", justifyContent:"space-between" }}>
                        <span className="lbl">{r.roomType || `Room ${i+1}`}</span>
                        <span className="val" style={{ color:"var(--pg)" }}>₹{r.price?.toLocaleString()}</span>
                      </div>
                      <div style={{ fontSize:11, color:"var(--pm)" }}>
                        Cap: {r.capacity} · {r.available ? "Available" : "Occupied"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="pal-mftr">
          <button className="pb pb-outline" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN EXPORT — embeds cleanly inside VendorLayout
═══════════════════════════════════════════════════ */
export default function Palaceapp() {
  const [palaces, setPalaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [editPalace, setEditPalace] = useState(null);
  const [viewPalace, setViewPalace] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const showToast = (msg, type = "success") => setToast({ msg, type });

  const fetchPalaces = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/all`);
      const data = await res.json();
      if (data.success) setPalaces(data.data);
      else showToast("Failed to load", "error");
    } catch { showToast("Network error", "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPalaces(); }, []);

  const savePalace = async (fd) => {
    setSaving(true);
    try {
      const url = editPalace ? `${API_BASE}/update/${editPalace._id}` : `${API_BASE}/add`;
      const method = editPalace ? "PUT" : "POST";
      const res = await fetch(url, { method, body: fd });
      const data = await res.json();
      if (data.success) {
        showToast(editPalace ? "Palace updated!" : "Palace added successfully!");
        setShowForm(false); setEditPalace(null);
        fetchPalaces();
      } else throw new Error(data.message);
    } catch (e) { showToast(e.message || "Save failed", "error"); }
    finally { setSaving(false); }
  };

  const deletePalace = async () => {
    try {
      const res = await fetch(`${API_BASE}/delete/${confirmDelete._id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) { showToast("Palace deleted"); setConfirmDelete(null); fetchPalaces(); }
      else throw new Error(data.message);
    } catch (e) { showToast(e.message || "Delete failed", "error"); }
  };

  const filtered = palaces.filter(p => {
    const q = search.toLowerCase();
    const matchS = !search || p.propertyName?.toLowerCase().includes(q)
      || p.city?.toLowerCase().includes(q) || p.ownerName?.toLowerCase().includes(q);
    const matchF = statusFilter === "all" || p.status === statusFilter;
    return matchS && matchF;
  });

  const stats = {
    total: palaces.length,
    approved: palaces.filter(p => p.status === "approved").length,
    pending: palaces.filter(p => p.status === "pending").length,
    heritage: palaces.filter(p => p.heritageCertified).length
  };

  return (
    <div className="palace-root">
      <style>{palaceStyles}</style>

      {/* TOP ACTION BAR */}
      <div className="pal-topbar">
        <div className="pal-topbar-title">Manage <span>Palaces</span></div>
        <button className="pb pb-gold" onClick={() => { setEditPalace(null); setShowForm(true); }}>
          ＋ Add Palace
        </button>
      </div>

      <div className="pal-body">
        {/* STATS */}
        <div className="pal-stats">
          {[
            ["Total", stats.total, "Registered"],
            ["Approved", stats.approved, "Live & active"],
            ["Pending", stats.pending, "Awaiting review"],
            ["Heritage", stats.heritage, "Certified"]
          ].map(([label, val, sub]) => (
            <div className="pal-stat" key={label}>
              <div className="pal-stat-label">{label}</div>
              <div className="pal-stat-val">{val}</div>
              <div className="pal-stat-sub">{sub}</div>
            </div>
          ))}
        </div>

        {/* FILTERS */}
        <div className="pal-filter">
          <div className="pal-search-wrap">
            <span className="pal-search-icon">🔍</span>
            <input className="pal-search" placeholder="Search by name, city, owner..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="pal-fsel" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <button className="pb pb-outline" onClick={fetchPalaces}>↻ Refresh</button>
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="pal-loader"><div className="pal-spin" />Loading Palaces...</div>
        ) : filtered.length === 0 ? (
          <div className="pal-empty">
            <div className="pal-empty-ico">🏰</div>
            <div className="pal-empty-title">No palaces found</div>
            <div className="pal-empty-sub">Add your first heritage property to get started</div>
            <button className="pb pb-gold" onClick={() => { setEditPalace(null); setShowForm(true); }}>
              ＋ Add Palace
            </button>
          </div>
        ) : (
          <div className="pal-grid">
            {filtered.map(p => (
              <PalaceCard key={p._id} palace={p}
                onEdit={palace => { setEditPalace(palace); setShowForm(true); }}
                onDelete={setConfirmDelete}
                onView={setViewPalace}
              />
            ))}
          </div>
        )}
      </div>

      {/* MODALS */}
      {showForm && (
        <PalaceForm initial={editPalace} onSave={savePalace}
          onClose={() => { setShowForm(false); setEditPalace(null); }} loading={saving} />
      )}
      {viewPalace && <PalaceDetail palace={viewPalace} onClose={() => setViewPalace(null)} />}
      {confirmDelete && (
        <Confirm msg={`"${confirmDelete.propertyName}" will be permanently deleted.`}
          onConfirm={deletePalace} onCancel={() => setConfirmDelete(null)} />
      )}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
