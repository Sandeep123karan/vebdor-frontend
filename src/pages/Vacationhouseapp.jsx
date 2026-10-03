// import { useState, useEffect, useRef } from "react";

// /* ============================================================
//    CONFIG — change BASE_URL to your backend
// ============================================================ */
// const BASE_URL = "https://bmtvendorfinal.onrender.com/api/vacation-house";
// const TOKEN_KEY = "token";

// const getToken = () => localStorage.getItem(TOKEN_KEY);
// const authHeaders = () => ({
//   "Content-Type": "application/json",
//   Authorization: `Bearer ${getToken()}`,
// });

// /* ============================================================
//    GLOBAL STYLES (injected once)
// ============================================================ */
// const GlobalStyle = () => {
//   useEffect(() => {
//     const style = document.createElement("style");
//     style.innerHTML = `
//       @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

//       *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

//       :root {
//         --cream:   #F5F0E8;
//         --sand:    #E8DECE;
//         --brown:   #8B6F47;
//         --dark:    #2C2416;
//         --accent:  #C4843A;
//         --green:   #4A6741;
//         --red:     #B85450;
//         --white:   #FDFAF5;
//         --shadow:  0 4px 24px rgba(44,36,22,0.10);
//         --radius:  14px;
//       }

//       body {
//         font-family: 'DM Sans', sans-serif;
//         background: var(--cream);
//         color: var(--dark);
//         min-height: 100vh;
//       }

//       h1,h2,h3,h4 { font-family: 'Cormorant Garamond', serif; }

//       input, textarea, select {
//         font-family: 'DM Sans', sans-serif;
//         font-size: 14px;
//         background: var(--white);
//         border: 1.5px solid var(--sand);
//         border-radius: 8px;
//         padding: 10px 14px;
//         width: 100%;
//         color: var(--dark);
//         transition: border-color 0.2s;
//         outline: none;
//       }
//       input:focus, textarea:focus, select:focus {
//         border-color: var(--accent);
//       }

//       button { cursor: pointer; font-family: 'DM Sans', sans-serif; }

//       .btn-primary {
//         background: var(--accent);
//         color: var(--white);
//         border: none;
//         padding: 11px 26px;
//         border-radius: 8px;
//         font-weight: 600;
//         font-size: 14px;
//         letter-spacing: 0.3px;
//         transition: background 0.2s, transform 0.1s;
//       }
//       .btn-primary:hover { background: var(--brown); }
//       .btn-primary:active { transform: scale(0.98); }

//       .btn-ghost {
//         background: transparent;
//         color: var(--brown);
//         border: 1.5px solid var(--sand);
//         padding: 10px 22px;
//         border-radius: 8px;
//         font-weight: 500;
//         font-size: 13px;
//         transition: background 0.2s;
//       }
//       .btn-ghost:hover { background: var(--sand); }

//       .btn-danger {
//         background: var(--red);
//         color: white;
//         border: none;
//         padding: 8px 18px;
//         border-radius: 8px;
//         font-size: 13px;
//         font-weight: 500;
//         transition: opacity 0.2s;
//       }
//       .btn-danger:hover { opacity: 0.85; }

//       .card {
//         background: var(--white);
//         border-radius: var(--radius);
//         box-shadow: var(--shadow);
//         border: 1px solid var(--sand);
//       }

//       .tag {
//         display: inline-block;
//         padding: 3px 10px;
//         border-radius: 20px;
//         font-size: 12px;
//         font-weight: 500;
//       }

//       .fade-in {
//         animation: fadeIn 0.35s ease;
//       }
//       @keyframes fadeIn {
//         from { opacity: 0; transform: translateY(8px); }
//         to   { opacity: 1; transform: translateY(0); }
//       }

//       ::-webkit-scrollbar { width: 6px; }
//       ::-webkit-scrollbar-track { background: var(--cream); }
//       ::-webkit-scrollbar-thumb { background: var(--sand); border-radius: 10px; }
//     `;
//     document.head.appendChild(style);
//     return () => document.head.removeChild(style);
//   }, []);
//   return null;
// };

// /* ============================================================
//    TOAST
// ============================================================ */
// const Toast = ({ msg, type, onClose }) => {
//   useEffect(() => {
//     const t = setTimeout(onClose, 3200);
//     return () => clearTimeout(t);
//   }, []);
//   const bg = type === "error" ? "var(--red)" : type === "warn" ? "var(--brown)" : "var(--green)";
//   return (
//     <div style={{
//       position: "fixed", bottom: 28, right: 28, zIndex: 9999,
//       background: bg, color: "#fff", padding: "13px 22px",
//       borderRadius: 10, fontWeight: 500, fontSize: 14,
//       boxShadow: "0 6px 24px rgba(0,0,0,0.18)",
//       animation: "fadeIn 0.3s ease",
//       maxWidth: 320,
//     }}>
//       {msg}
//     </div>
//   );
// };

// /* ============================================================
//    LABEL + FIELD
// ============================================================ */
// const Field = ({ label, children, half }) => (
//   <div style={{ gridColumn: half ? "span 1" : "span 2", display: "flex", flexDirection: "column", gap: 5 }}>
//     <label style={{ fontSize: 12, fontWeight: 600, color: "var(--brown)", textTransform: "uppercase", letterSpacing: "0.6px" }}>{label}</label>
//     {children}
//   </div>
// );

// /* ============================================================
//    FILE INPUT
// ============================================================ */
// const FileField = ({ label, name, multiple, onChange }) => {
//   const ref = useRef();
//   const [names, setNames] = useState([]);
//   const handle = (e) => {
//     const files = Array.from(e.target.files);
//     setNames(files.map(f => f.name));
//     onChange(name, files);
//   };
//   return (
//     <Field label={label} half>
//       <div
//         onClick={() => ref.current.click()}
//         style={{
//           border: "2px dashed var(--sand)", borderRadius: 8,
//           padding: "14px 12px", cursor: "pointer", background: "var(--cream)",
//           fontSize: 13, color: "var(--brown)", textAlign: "center",
//           transition: "border-color 0.2s",
//         }}
//         onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
//         onMouseLeave={e => e.currentTarget.style.borderColor = "var(--sand)"}
//       >
//         {names.length ? names.join(", ") : `📎 Upload ${label}`}
//       </div>
//       <input ref={ref} type="file" multiple={multiple} accept="image/*,application/pdf" style={{ display: "none" }} onChange={handle} />
//     </Field>
//   );
// };

// /* ============================================================
//    SECTION HEADING
// ============================================================ */
// const Section = ({ title }) => (
//   <div style={{ gridColumn: "span 2", borderBottom: "1.5px solid var(--sand)", paddingBottom: 6, marginTop: 8 }}>
//     <h3 style={{ fontSize: 20, color: "var(--brown)", fontWeight: 600 }}>{title}</h3>
//   </div>
// );

// /* ============================================================
//    ADD / EDIT FORM
// ============================================================ */
// const HouseForm = ({ initial, onSuccess, onCancel }) => {
//   const isEdit = !!initial;
//   const [form, setForm] = useState({
//     propertyName: "", description: "", shortDescription: "", starRating: "",
//     street: "", city: "", state: "", pincode: "", latitude: "", longitude: "",
//     ownerName: "", phone: "", alternatePhone: "", email: "",
//     basePrice: "", weekendPrice: "", monthlyPrice: "", cleaningFee: "", securityDeposit: "",
//     checkInTime: "", checkOutTime: "",
//     petsAllowed: false, smokingAllowed: false,
//     cancellationPolicy: "", houseRules: "",
//     ...(initial || {}),
//     ...(initial?.address || {}),
//     ...(initial?.owner || {}),
//     ...(initial?.pricing || {}),
//   });
//   const [files, setFiles] = useState({});
//   const [loading, setLoading] = useState(false);

//   const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
//   const setFile = (k, v) => setFiles(p => ({ ...p, [k]: v }));

//   const submit = async () => {
//     if (!form.propertyName.trim()) return alert("Property name required");
//     setLoading(true);
//     try {
//       const fd = new FormData();
//       Object.entries(form).forEach(([k, v]) => fd.append(k, v));
//       Object.entries(files).forEach(([k, arr]) => arr.forEach(f => fd.append(k, f)));

//       const url = isEdit ? `${BASE_URL}/update/${initial._id}` : `${BASE_URL}/add`;
//       const method = isEdit ? "PUT" : "POST";

//       const res = await fetch(url, {
//         method,
//         headers: { Authorization: `Bearer ${getToken()}` },
//         body: fd,
//       });
//       const data = await res.json();
//       if (!data.success) throw new Error(data.message);
//       onSuccess(data.message || (isEdit ? "Updated!" : "House added!"));
//     } catch (e) {
//       alert(e.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const G = ({ children, cols = 2 }) => (
//     <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "16px 20px" }}>
//       {children}
//     </div>
//   );

//   return (
//     <div className="fade-in" style={{ padding: "28px 32px", maxHeight: "82vh", overflowY: "auto" }}>
//       <h2 style={{ fontSize: 28, marginBottom: 24, color: "var(--dark)" }}>
//         {isEdit ? "✏️ Edit Property" : "🏡 Add New Property"}
//       </h2>

//       <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

//         {/* Basic */}
//         <G>
//           <Section title="Basic Info" />
//           <Field label="Property Name" half>
//             <input value={form.propertyName} onChange={e => set("propertyName", e.target.value)} placeholder="Sunset Villa" />
//           </Field>
//           <Field label="Star Rating" half>
//             <select value={form.starRating} onChange={e => set("starRating", e.target.value)}>
//               <option value="">Select</option>
//               {[1,2,3,4,5].map(n => <option key={n} value={n}>{"⭐".repeat(n)} ({n} Star)</option>)}
//             </select>
//           </Field>
//           <Field label="Short Description">
//             <input value={form.shortDescription} onChange={e => set("shortDescription", e.target.value)} placeholder="One-line tagline" />
//           </Field>
//           <Field label="Full Description">
//             <textarea rows={3} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Detailed description..." />
//           </Field>
//         </G>

//         {/* Address */}
//         <G>
//           <Section title="Location" />
//           <Field label="Street" half><input value={form.street} onChange={e => set("street", e.target.value)} /></Field>
//           <Field label="City" half><input value={form.city} onChange={e => set("city", e.target.value)} /></Field>
//           <Field label="State" half><input value={form.state} onChange={e => set("state", e.target.value)} /></Field>
//           <Field label="Pincode" half><input value={form.pincode} onChange={e => set("pincode", e.target.value)} /></Field>
//           <Field label="Latitude" half><input type="number" value={form.latitude} onChange={e => set("latitude", e.target.value)} /></Field>
//           <Field label="Longitude" half><input type="number" value={form.longitude} onChange={e => set("longitude", e.target.value)} /></Field>
//         </G>

//         {/* Owner */}
//         <G>
//           <Section title="Owner Details" />
//           <Field label="Owner Name" half><input value={form.ownerName} onChange={e => set("ownerName", e.target.value)} /></Field>
//           <Field label="Phone" half><input value={form.phone} onChange={e => set("phone", e.target.value)} /></Field>
//           <Field label="Alternate Phone" half><input value={form.alternatePhone} onChange={e => set("alternatePhone", e.target.value)} /></Field>
//           <Field label="Email" half><input type="email" value={form.email} onChange={e => set("email", e.target.value)} /></Field>
//         </G>

//         {/* Pricing */}
//         <G>
//           <Section title="Pricing (₹)" />
//           {[["basePrice","Base / Night"],["weekendPrice","Weekend / Night"],["monthlyPrice","Monthly"],["cleaningFee","Cleaning Fee"],["securityDeposit","Security Deposit"]].map(([k,l]) => (
//             <Field key={k} label={l} half>
//               <input type="number" value={form[k]} onChange={e => set(k, e.target.value)} placeholder="0" />
//             </Field>
//           ))}
//         </G>

//         {/* Rules */}
//         <G>
//           <Section title="Rules & Policies" />
//           <Field label="Check-In Time" half><input type="time" value={form.checkInTime} onChange={e => set("checkInTime", e.target.value)} /></Field>
//           <Field label="Check-Out Time" half><input type="time" value={form.checkOutTime} onChange={e => set("checkOutTime", e.target.value)} /></Field>
//           <Field label="Cancellation Policy">
//             <textarea rows={2} value={form.cancellationPolicy} onChange={e => set("cancellationPolicy", e.target.value)} />
//           </Field>
//           <Field label="House Rules">
//             <textarea rows={2} value={form.houseRules} onChange={e => set("houseRules", e.target.value)} />
//           </Field>
//           <Field label="" half>
//             <div style={{ display: "flex", gap: 20, alignItems: "center", paddingTop: 6 }}>
//               {[["petsAllowed","🐾 Pets Allowed"],["smokingAllowed","🚬 Smoking Allowed"]].map(([k,l]) => (
//                 <label key={k} style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer", fontSize: 14 }}>
//                   <input type="checkbox" checked={form[k]} onChange={e => set(k, e.target.checked)}
//                     style={{ width: 16, height: 16, accentColor: "var(--accent)" }} />
//                   {l}
//                 </label>
//               ))}
//             </div>
//           </Field>
//         </G>

//         {!isEdit && <>
//           {/* Images */}
//           <G>
//             <Section title="Photos" />
//             {[["frontView","Front View",true],["bedRoom","Bedroom",true],["kitchen","Kitchen",true],["washroom","Washroom",true]].map(([n,l,m]) => (
//               <FileField key={n} label={l} name={n} multiple={m} onChange={setFile} />
//             ))}
//           </G>

//           {/* Documents */}
//           <G>
//             <Section title="Documents" />
//             {[["propertyDocument","Property Document"],["ownerIdProof","Owner ID Proof"],["addressProof","Address Proof"],["govtLicense","Govt License"]].map(([n,l]) => (
//               <FileField key={n} label={l} name={n} multiple onChange={setFile} />
//             ))}
//           </G>
//         </>}

//       </div>

//       <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--sand)" }}>
//         <button className="btn-ghost" onClick={onCancel}>Cancel</button>
//         <button className="btn-primary" onClick={submit} disabled={loading}>
//           {loading ? "Saving…" : isEdit ? "Save Changes" : "Add Property"}
//         </button>
//       </div>
//     </div>
//   );
// };

// /* ============================================================
//    HOUSE CARD
// ============================================================ */
// const HouseCard = ({ house, onEdit, onDelete, onView }) => {
//   const img = house.images?.frontView?.[0];
//   return (
//     <div className="card fade-in" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
//       {/* Image */}
//       <div style={{
//         height: 180, background: "var(--sand)",
//         backgroundImage: img ? `url(${img})` : "none",
//         backgroundSize: "cover", backgroundPosition: "center",
//         display: "flex", alignItems: "flex-end",
//         position: "relative",
//       }}>
//         {!img && (
//           <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>🏡</div>
//         )}
//         {house.starRating && (
//           <span className="tag" style={{ position: "absolute", top: 10, right: 10, background: "rgba(44,36,22,0.75)", color: "#fff" }}>
//             {"⭐".repeat(house.starRating)}
//           </span>
//         )}
//         <span className="tag" style={{
//           position: "absolute", bottom: 10, left: 10,
//           background: house.status === "active" ? "var(--green)" : "var(--brown)",
//           color: "#fff"
//         }}>
//           {house.status || "pending"}
//         </span>
//       </div>

//       {/* Body */}
//       <div style={{ padding: "16px 18px", flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
//         <h3 style={{ fontSize: 19, fontWeight: 700, color: "var(--dark)", lineHeight: 1.2 }}>{house.propertyName}</h3>
//         <p style={{ fontSize: 13, color: "#888", lineHeight: 1.5 }}>
//           📍 {[house.address?.city, house.address?.state].filter(Boolean).join(", ") || "Location not set"}
//         </p>
//         {house.shortDescription && (
//           <p style={{ fontSize: 13, color: "var(--brown)", marginTop: 2 }}>{house.shortDescription.slice(0, 80)}{house.shortDescription.length > 80 ? "…" : ""}</p>
//         )}

//         <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 6 }}>
//           {house.pricing?.basePrice && (
//             <span className="tag" style={{ background: "var(--cream)", color: "var(--accent)", fontWeight: 700, fontSize: 13 }}>
//               ₹{house.pricing.basePrice}/night
//             </span>
//           )}
//           {house.petsAllowed && <span className="tag" style={{ background: "#EBF5E8", color: "var(--green)" }}>🐾 Pets</span>}
//           {house.smokingAllowed && <span className="tag" style={{ background: "#FBF0E8", color: "var(--brown)" }}>🚬 Smoking</span>}
//         </div>
//       </div>

//       {/* Footer */}
//       <div style={{ padding: "12px 18px", borderTop: "1px solid var(--sand)", display: "flex", gap: 8, justifyContent: "flex-end" }}>
//         <button className="btn-ghost" style={{ padding: "7px 14px", fontSize: 13 }} onClick={() => onView(house)}>View</button>
//         <button className="btn-ghost" style={{ padding: "7px 14px", fontSize: 13 }} onClick={() => onEdit(house)}>Edit</button>
//         <button className="btn-danger" onClick={() => onDelete(house._id)}>Delete</button>
//       </div>
//     </div>
//   );
// };

// /* ============================================================
//    DETAIL MODAL
// ============================================================ */
// const DetailModal = ({ house, onClose }) => {
//   const Row = ({ label, value }) => value ? (
//     <div style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 14 }}>
//       <span style={{ fontWeight: 600, minWidth: 140, color: "var(--brown)" }}>{label}</span>
//       <span style={{ color: "var(--dark)" }}>{String(value)}</span>
//     </div>
//   ) : null;

//   const ImgRow = ({ label, urls }) => urls?.length ? (
//     <div>
//       <p style={{ fontWeight: 600, color: "var(--brown)", fontSize: 13, marginBottom: 8 }}>{label}</p>
//       <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
//         {urls.map((u, i) => (
//           <img key={i} src={u} alt={label} style={{ width: 90, height: 70, objectFit: "cover", borderRadius: 8, border: "1px solid var(--sand)" }} />
//         ))}
//       </div>
//     </div>
//   ) : null;

//   return (
//     <div style={{ padding: "28px 32px", maxHeight: "82vh", overflowY: "auto" }}>
//       <h2 style={{ fontSize: 26, marginBottom: 20 }}>{house.propertyName}</h2>

//       <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
//         <Row label="Short Desc" value={house.shortDescription} />
//         <Row label="Description" value={house.description} />
//         <Row label="Star Rating" value={house.starRating ? "⭐".repeat(house.starRating) : null} />
//         <Row label="Address" value={[house.address?.street, house.address?.city, house.address?.state, house.address?.pincode].filter(Boolean).join(", ")} />
//         <Row label="Owner" value={house.owner?.ownerName} />
//         <Row label="Phone" value={house.owner?.phone} />
//         <Row label="Email" value={house.owner?.email} />
//         <Row label="Base Price" value={house.pricing?.basePrice ? `₹${house.pricing.basePrice}/night` : null} />
//         <Row label="Weekend Price" value={house.pricing?.weekendPrice ? `₹${house.pricing.weekendPrice}/night` : null} />
//         <Row label="Monthly Price" value={house.pricing?.monthlyPrice ? `₹${house.pricing.monthlyPrice}/month` : null} />
//         <Row label="Cleaning Fee" value={house.pricing?.cleaningFee ? `₹${house.pricing.cleaningFee}` : null} />
//         <Row label="Security Deposit" value={house.pricing?.securityDeposit ? `₹${house.pricing.securityDeposit}` : null} />
//         <Row label="Check-In" value={house.checkInTime} />
//         <Row label="Check-Out" value={house.checkOutTime} />
//         <Row label="Pets Allowed" value={house.petsAllowed ? "Yes 🐾" : "No"} />
//         <Row label="Smoking" value={house.smokingAllowed ? "Yes 🚬" : "No"} />
//         <Row label="Cancellation" value={house.cancellationPolicy} />
//         <Row label="House Rules" value={house.houseRules} />

//         <hr style={{ border: "none", borderTop: "1px solid var(--sand)", margin: "8px 0" }} />

//         <ImgRow label="Front View" urls={house.images?.frontView} />
//         <ImgRow label="Bedroom" urls={house.images?.bedRoom} />
//         <ImgRow label="Kitchen" urls={house.images?.kitchen} />
//         <ImgRow label="Washroom" urls={house.images?.washroom} />
//       </div>

//       <div style={{ marginTop: 24, textAlign: "right" }}>
//         <button className="btn-ghost" onClick={onClose}>Close</button>
//       </div>
//     </div>
//   );
// };

// /* ============================================================
//    MODAL WRAPPER
// ============================================================ */
// const Modal = ({ children, onClose }) => (
//   <div style={{
//     position: "fixed", inset: 0, zIndex: 1000,
//     background: "rgba(44,36,22,0.45)", backdropFilter: "blur(4px)",
//     display: "flex", alignItems: "center", justifyContent: "center",
//     padding: 20,
//   }} onClick={e => e.target === e.currentTarget && onClose()}>
//     <div className="card fade-in" style={{ width: "100%", maxWidth: 720, maxHeight: "90vh", overflowY: "auto" }}>
//       {children}
//     </div>
//   </div>
// );

// /* ============================================================
//    CONFIRM DELETE
// ============================================================ */
// const Confirm = ({ msg, onConfirm, onCancel }) => (
//   <Modal onClose={onCancel}>
//     <div style={{ padding: "32px 36px", textAlign: "center" }}>
//       <div style={{ fontSize: 44, marginBottom: 16 }}>🗑️</div>
//       <h3 style={{ fontSize: 22, marginBottom: 10 }}>Are you sure?</h3>
//       <p style={{ color: "#888", marginBottom: 28 }}>{msg}</p>
//       <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
//         <button className="btn-ghost" onClick={onCancel}>Cancel</button>
//         <button className="btn-danger" onClick={onConfirm}>Yes, Delete</button>
//       </div>
//     </div>
//   </Modal>
// );

// /* ============================================================
//    STATS BAR
// ============================================================ */
// const StatsBar = ({ houses }) => {
//   const total = houses.length;
//   const avgPrice = total ? Math.round(houses.reduce((s, h) => s + (h.pricing?.basePrice || 0), 0) / total) : 0;
//   const cities = [...new Set(houses.map(h => h.address?.city).filter(Boolean))].length;

//   return (
//     <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
//       {[
//         { icon: "🏠", label: "Total Properties", value: total },
//         { icon: "📍", label: "Cities", value: cities },
//         { icon: "💰", label: "Avg. Base Price", value: avgPrice ? `₹${avgPrice}` : "—" },
//       ].map(s => (
//         <div key={s.label} className="card" style={{ padding: "14px 22px", display: "flex", gap: 14, alignItems: "center", flex: "1 1 160px" }}>
//           <span style={{ fontSize: 28 }}>{s.icon}</span>
//           <div>
//             <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "Cormorant Garamond, serif", color: "var(--dark)" }}>{s.value}</div>
//             <div style={{ fontSize: 12, color: "#888" }}>{s.label}</div>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

// /* ============================================================
//    MAIN APP
// ============================================================ */
// export default function App() {
//   const [houses, setHouses] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [modal, setModal] = useState(null); // null | "add" | "edit" | "view" | "delete"
//   const [selected, setSelected] = useState(null);
//   const [deleteId, setDeleteId] = useState(null);
//   const [toast, setToast] = useState(null);
//   const [search, setSearch] = useState("");
//   const [sortBy, setSortBy] = useState("newest");

//   const showToast = (msg, type = "success") => setToast({ msg, type });

//   const fetchHouses = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch(`${BASE_URL}/my-houses`, { headers: authHeaders() });
//       const data = await res.json();
//       if (data.success) setHouses(data.data);
//       else showToast(data.message || "Failed to load", "error");
//     } catch {
//       showToast("Network error", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { fetchHouses(); }, []);

//   const handleDelete = async () => {
//     try {
//       const res = await fetch(`${BASE_URL}/delete/${deleteId}`, {
//         method: "DELETE",
//         headers: authHeaders(),
//       });
//       const data = await res.json();
//       if (!data.success) throw new Error(data.message);
//       showToast("Property deleted");
//       setModal(null);
//       setDeleteId(null);
//       fetchHouses();
//     } catch (e) {
//       showToast(e.message, "error");
//     }
//   };

//   const filtered = houses
//     .filter(h =>
//       !search ||
//       h.propertyName?.toLowerCase().includes(search.toLowerCase()) ||
//       h.address?.city?.toLowerCase().includes(search.toLowerCase())
//     )
//     .sort((a, b) => {
//       if (sortBy === "price-asc") return (a.pricing?.basePrice || 0) - (b.pricing?.basePrice || 0);
//       if (sortBy === "price-desc") return (b.pricing?.basePrice || 0) - (a.pricing?.basePrice || 0);
//       if (sortBy === "name") return a.propertyName?.localeCompare(b.propertyName);
//       return new Date(b.createdAt) - new Date(a.createdAt); // newest
//     });

//   return (
//     <>
//       <GlobalStyle />

//       {/* HEADER */}
//       <header style={{
//         background: "var(--dark)", color: "var(--cream)",
//         padding: "0 40px", height: 64,
//         display: "flex", alignItems: "center", justifyContent: "space-between",
//         position: "sticky", top: 0, zIndex: 100,
//         boxShadow: "0 2px 16px rgba(44,36,22,0.18)",
//       }}>
//         <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
//           <span style={{ fontSize: 26 }}>🏡</span>
//           <span style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 22, fontWeight: 600, letterSpacing: "0.5px" }}>
//             VacationHouse <span style={{ color: "var(--accent)", fontStyle: "italic" }}>Manager</span>
//           </span>
//         </div>
//         <button className="btn-primary" onClick={() => setModal("add")}>
//           + Add Property
//         </button>
//       </header>

//       {/* MAIN */}
//       <main style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 24px" }}>

//         <div style={{ marginBottom: 28 }}>
//           <h1 style={{ fontSize: 36, fontWeight: 700, color: "var(--dark)" }}>My Properties</h1>
//           <p style={{ color: "#888", marginTop: 4 }}>Manage all your vacation rental listings</p>
//         </div>

//         <StatsBar houses={houses} />

//         {/* SEARCH + SORT */}
//         <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
//           <input
//             placeholder="🔍  Search by name or city…"
//             value={search} onChange={e => setSearch(e.target.value)}
//             style={{ maxWidth: 320 }}
//           />
//           <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ maxWidth: 200 }}>
//             <option value="newest">Newest First</option>
//             <option value="price-asc">Price: Low → High</option>
//             <option value="price-desc">Price: High → Low</option>
//             <option value="name">Name A–Z</option>
//           </select>
//         </div>

//         {/* GRID */}
//         {loading ? (
//           <div style={{ textAlign: "center", padding: "80px 0", color: "#aaa", fontSize: 16 }}>
//             Loading properties…
//           </div>
//         ) : filtered.length === 0 ? (
//           <div style={{ textAlign: "center", padding: "80px 0" }}>
//             <div style={{ fontSize: 56 }}>🏡</div>
//             <h3 style={{ fontSize: 22, marginTop: 16, color: "var(--brown)" }}>No properties found</h3>
//             <p style={{ color: "#aaa", marginTop: 8 }}>{search ? "Try a different search" : "Click '+ Add Property' to get started"}</p>
//           </div>
//         ) : (
//           <div style={{
//             display: "grid",
//             gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
//             gap: 22,
//           }}>
//             {filtered.map(h => (
//               <HouseCard
//                 key={h._id}
//                 house={h}
//                 onEdit={house => { setSelected(house); setModal("edit"); }}
//                 onDelete={id => { setDeleteId(id); setModal("delete"); }}
//                 onView={house => { setSelected(house); setModal("view"); }}
//               />
//             ))}
//           </div>
//         )}
//       </main>

//       {/* MODALS */}
//       {modal === "add" && (
//         <Modal onClose={() => setModal(null)}>
//           <HouseForm
//             onSuccess={(msg) => { showToast(msg); setModal(null); fetchHouses(); }}
//             onCancel={() => setModal(null)}
//           />
//         </Modal>
//       )}

//       {modal === "edit" && selected && (
//         <Modal onClose={() => setModal(null)}>
//           <HouseForm
//             initial={selected}
//             onSuccess={(msg) => { showToast(msg); setModal(null); fetchHouses(); }}
//             onCancel={() => setModal(null)}
//           />
//         </Modal>
//       )}

//       {modal === "view" && selected && (
//         <Modal onClose={() => setModal(null)}>
//           <DetailModal house={selected} onClose={() => setModal(null)} />
//         </Modal>
//       )}

//       {modal === "delete" && (
//         <Confirm
//           msg="This will permanently delete the property and all its data."
//           onConfirm={handleDelete}
//           onCancel={() => { setModal(null); setDeleteId(null); }}
//         />
//       )}

//       {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
//     </>
//   );
// }





import { useState, useEffect, useRef } from "react";

const BASE_URL = "https://bmtvendorfinal.onrender.com/api/vacation-house";
const TOKEN_KEY = "token";

const getToken = () => localStorage.getItem(TOKEN_KEY);
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const GlobalStyle = () => {
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      :root {
        --cream:   #F5F0E8;
        --sand:    #E8DECE;
        --brown:   #8B6F47;
        --dark:    #2C2416;
        --accent:  #C4843A;
        --green:   #4A6741;
        --red:     #B85450;
        --white:   #FDFAF5;
        --shadow:  0 4px 24px rgba(44,36,22,0.10);
        --radius:  14px;
      }
      body { font-family: 'DM Sans', sans-serif; background: var(--cream); color: var(--dark); min-height: 100vh; }
      h1,h2,h3,h4 { font-family: 'Cormorant Garamond', serif; }
      input, textarea, select {
        font-family: 'DM Sans', sans-serif; font-size: 14px; background: var(--white);
        border: 1.5px solid var(--sand); border-radius: 8px; padding: 10px 14px;
        width: 100%; color: var(--dark); transition: border-color 0.2s; outline: none;
      }
      input:focus, textarea:focus, select:focus { border-color: var(--accent); }
      button { cursor: pointer; font-family: 'DM Sans', sans-serif; }
      .btn-primary { background: var(--accent); color: var(--white); border: none; padding: 11px 26px; border-radius: 8px; font-weight: 600; font-size: 14px; letter-spacing: 0.3px; transition: background 0.2s, transform 0.1s; }
      .btn-primary:hover { background: var(--brown); }
      .btn-primary:active { transform: scale(0.98); }
      .btn-ghost { background: transparent; color: var(--brown); border: 1.5px solid var(--sand); padding: 10px 22px; border-radius: 8px; font-weight: 500; font-size: 13px; transition: background 0.2s; }
      .btn-ghost:hover { background: var(--sand); }
      .btn-danger { background: var(--red); color: white; border: none; padding: 8px 18px; border-radius: 8px; font-size: 13px; font-weight: 500; transition: opacity 0.2s; }
      .btn-danger:hover { opacity: 0.85; }
      .card { background: var(--white); border-radius: var(--radius); box-shadow: var(--shadow); border: 1px solid var(--sand); }
      .tag { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; }
      .fade-in { animation: fadeIn 0.35s ease; }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      ::-webkit-scrollbar { width: 6px; }
      ::-webkit-scrollbar-track { background: var(--cream); }
      ::-webkit-scrollbar-thumb { background: var(--sand); border-radius: 10px; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  return null;
};

const Toast = ({ msg, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3200);
    return () => clearTimeout(t);
  }, []);
  const bg = type === "error" ? "var(--red)" : type === "warn" ? "var(--brown)" : "var(--green)";
  return (
    <div style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 9999,
      background: bg, color: "#fff", padding: "13px 22px",
      borderRadius: 10, fontWeight: 500, fontSize: 14,
      boxShadow: "0 6px 24px rgba(0,0,0,0.18)", animation: "fadeIn 0.3s ease", maxWidth: 320,
    }}>
      {msg}
    </div>
  );
};

/* ✅ G component — HouseForm ke BAHAR define kiya */
const G = ({ children, cols = 2 }) => (
  <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "16px 20px" }}>
    {children}
  </div>
);

const Field = ({ label, children, half }) => (
  <div style={{ gridColumn: half ? "span 1" : "span 2", display: "flex", flexDirection: "column", gap: 5 }}>
    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--brown)", textTransform: "uppercase", letterSpacing: "0.6px" }}>{label}</label>
    {children}
  </div>
);

const FileField = ({ label, name, multiple, onChange }) => {
  const ref = useRef();
  const [names, setNames] = useState([]);
  const handle = (e) => {
    const files = Array.from(e.target.files);
    setNames(files.map(f => f.name));
    onChange(name, files);
  };
  return (
    <Field label={label} half>
      <div
        onClick={() => ref.current.click()}
        style={{
          border: "2px dashed var(--sand)", borderRadius: 8,
          padding: "14px 12px", cursor: "pointer", background: "var(--cream)",
          fontSize: 13, color: "var(--brown)", textAlign: "center", transition: "border-color 0.2s",
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
        onMouseLeave={e => e.currentTarget.style.borderColor = "var(--sand)"}
      >
        {names.length ? names.join(", ") : `📎 Upload ${label}`}
      </div>
      <input ref={ref} type="file" multiple={multiple} accept="image/*,application/pdf" style={{ display: "none" }} onChange={handle} />
    </Field>
  );
};

const Section = ({ title }) => (
  <div style={{ gridColumn: "span 2", borderBottom: "1.5px solid var(--sand)", paddingBottom: 6, marginTop: 8 }}>
    <h3 style={{ fontSize: 20, color: "var(--brown)", fontWeight: 600 }}>{title}</h3>
  </div>
);

const HouseForm = ({ initial, onSuccess, onCancel }) => {
  const isEdit = !!initial;
  const [form, setForm] = useState({
    propertyName: "", description: "", shortDescription: "", starRating: "",
    street: "", city: "", state: "", pincode: "", latitude: "", longitude: "",
    ownerName: "", phone: "", alternatePhone: "", email: "",
    basePrice: "", weekendPrice: "", monthlyPrice: "", cleaningFee: "", securityDeposit: "",
    checkInTime: "", checkOutTime: "",
    petsAllowed: false, smokingAllowed: false,
    cancellationPolicy: "", houseRules: "",
    ...(initial || {}),
    ...(initial?.address || {}),
    ...(initial?.owner || {}),
    ...(initial?.pricing || {}),
  });
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const setFile = (k, v) => setFiles(p => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.propertyName.trim()) return alert("Property name required");
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      Object.entries(files).forEach(([k, arr]) => arr.forEach(f => fd.append(k, f)));
      const url = isEdit ? `${BASE_URL}/update/${initial._id}` : `${BASE_URL}/add`;
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd,
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      onSuccess(data.message || (isEdit ? "Updated!" : "House added!"));
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in" style={{ padding: "28px 32px", maxHeight: "82vh", overflowY: "auto" }}>
      <h2 style={{ fontSize: 28, marginBottom: 24, color: "var(--dark)" }}>
        {isEdit ? "✏️ Edit Property" : "🏡 Add New Property"}
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

        <G>
          <Section title="Basic Info" />
          <Field label="Property Name" half>
            <input value={form.propertyName} onChange={e => set("propertyName", e.target.value)} placeholder="Sunset Villa" />
          </Field>
          <Field label="Star Rating" half>
            <select value={form.starRating} onChange={e => set("starRating", e.target.value)}>
              <option value="">Select</option>
              {[1,2,3,4,5].map(n => <option key={n} value={n}>{"⭐".repeat(n)} ({n} Star)</option>)}
            </select>
          </Field>
          <Field label="Short Description">
            <input value={form.shortDescription} onChange={e => set("shortDescription", e.target.value)} placeholder="One-line tagline" />
          </Field>
          <Field label="Full Description">
            <textarea rows={3} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Detailed description..." />
          </Field>
        </G>

        <G>
          <Section title="Location" />
          <Field label="Street" half><input value={form.street} onChange={e => set("street", e.target.value)} /></Field>
          <Field label="City" half><input value={form.city} onChange={e => set("city", e.target.value)} /></Field>
          <Field label="State" half><input value={form.state} onChange={e => set("state", e.target.value)} /></Field>
          <Field label="Pincode" half><input value={form.pincode} onChange={e => set("pincode", e.target.value)} /></Field>
          <Field label="Latitude" half><input type="number" value={form.latitude} onChange={e => set("latitude", e.target.value)} /></Field>
          <Field label="Longitude" half><input type="number" value={form.longitude} onChange={e => set("longitude", e.target.value)} /></Field>
        </G>

        <G>
          <Section title="Owner Details" />
          <Field label="Owner Name" half><input value={form.ownerName} onChange={e => set("ownerName", e.target.value)} /></Field>
          <Field label="Phone" half><input value={form.phone} onChange={e => set("phone", e.target.value)} /></Field>
          <Field label="Alternate Phone" half><input value={form.alternatePhone} onChange={e => set("alternatePhone", e.target.value)} /></Field>
          <Field label="Email" half><input type="email" value={form.email} onChange={e => set("email", e.target.value)} /></Field>
        </G>

        <G>
          <Section title="Pricing (₹)" />
          {[["basePrice","Base / Night"],["weekendPrice","Weekend / Night"],["monthlyPrice","Monthly"],["cleaningFee","Cleaning Fee"],["securityDeposit","Security Deposit"]].map(([k,l]) => (
            <Field key={k} label={l} half>
              <input type="number" value={form[k]} onChange={e => set(k, e.target.value)} placeholder="0" />
            </Field>
          ))}
        </G>

        <G>
          <Section title="Rules & Policies" />
          <Field label="Check-In Time" half><input type="time" value={form.checkInTime} onChange={e => set("checkInTime", e.target.value)} /></Field>
          <Field label="Check-Out Time" half><input type="time" value={form.checkOutTime} onChange={e => set("checkOutTime", e.target.value)} /></Field>
          <Field label="Cancellation Policy">
            <textarea rows={2} value={form.cancellationPolicy} onChange={e => set("cancellationPolicy", e.target.value)} />
          </Field>
          <Field label="House Rules">
            <textarea rows={2} value={form.houseRules} onChange={e => set("houseRules", e.target.value)} />
          </Field>
          <Field label="" half>
            <div style={{ display: "flex", gap: 20, alignItems: "center", paddingTop: 6 }}>
              {[["petsAllowed","🐾 Pets Allowed"],["smokingAllowed","🚬 Smoking Allowed"]].map(([k,l]) => (
                <label key={k} style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer", fontSize: 14 }}>
                  <input type="checkbox" checked={form[k]} onChange={e => set(k, e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: "var(--accent)" }} />
                  {l}
                </label>
              ))}
            </div>
          </Field>
        </G>

        {!isEdit && (
          <>
            <G>
              <Section title="Photos" />
              {[["frontView","Front View",true],["bedRoom","Bedroom",true],["kitchen","Kitchen",true],["washroom","Washroom",true]].map(([n,l,m]) => (
                <FileField key={n} label={l} name={n} multiple={m} onChange={setFile} />
              ))}
            </G>
            <G>
              <Section title="Documents" />
              {[["propertyDocument","Property Document"],["ownerIdProof","Owner ID Proof"],["addressProof","Address Proof"],["govtLicense","Govt License"]].map(([n,l]) => (
                <FileField key={n} label={l} name={n} multiple onChange={setFile} />
              ))}
            </G>
          </>
        )}

      </div>

      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--sand)" }}>
        <button className="btn-ghost" onClick={onCancel}>Cancel</button>
        <button className="btn-primary" onClick={submit} disabled={loading}>
          {loading ? "Saving…" : isEdit ? "Save Changes" : "Add Property"}
        </button>
      </div>
    </div>
  );
};

const HouseCard = ({ house, onEdit, onDelete, onView }) => {
  const img = house.images?.frontView?.[0];
  return (
    <div className="card fade-in" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{
        height: 180, background: "var(--sand)",
        backgroundImage: img ? `url(${img})` : "none",
        backgroundSize: "cover", backgroundPosition: "center",
        display: "flex", alignItems: "flex-end", position: "relative",
      }}>
        {!img && (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>🏡</div>
        )}
        {house.starRating && (
          <span className="tag" style={{ position: "absolute", top: 10, right: 10, background: "rgba(44,36,22,0.75)", color: "#fff" }}>
            {"⭐".repeat(house.starRating)}
          </span>
        )}
        <span className="tag" style={{
          position: "absolute", bottom: 10, left: 10,
          background: house.status === "active" ? "var(--green)" : "var(--brown)", color: "#fff"
        }}>
          {house.status || "pending"}
        </span>
      </div>
      <div style={{ padding: "16px 18px", flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <h3 style={{ fontSize: 19, fontWeight: 700, color: "var(--dark)", lineHeight: 1.2 }}>{house.propertyName}</h3>
        <p style={{ fontSize: 13, color: "#888", lineHeight: 1.5 }}>
          📍 {[house.address?.city, house.address?.state].filter(Boolean).join(", ") || "Location not set"}
        </p>
        {house.shortDescription && (
          <p style={{ fontSize: 13, color: "var(--brown)", marginTop: 2 }}>{house.shortDescription.slice(0, 80)}{house.shortDescription.length > 80 ? "…" : ""}</p>
        )}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 6 }}>
          {house.pricing?.basePrice && (
            <span className="tag" style={{ background: "var(--cream)", color: "var(--accent)", fontWeight: 700, fontSize: 13 }}>
              ₹{house.pricing.basePrice}/night
            </span>
          )}
          {house.petsAllowed && <span className="tag" style={{ background: "#EBF5E8", color: "var(--green)" }}>🐾 Pets</span>}
          {house.smokingAllowed && <span className="tag" style={{ background: "#FBF0E8", color: "var(--brown)" }}>🚬 Smoking</span>}
        </div>
      </div>
      <div style={{ padding: "12px 18px", borderTop: "1px solid var(--sand)", display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button className="btn-ghost" style={{ padding: "7px 14px", fontSize: 13 }} onClick={() => onView(house)}>View</button>
        <button className="btn-ghost" style={{ padding: "7px 14px", fontSize: 13 }} onClick={() => onEdit(house)}>Edit</button>
        <button className="btn-danger" onClick={() => onDelete(house._id)}>Delete</button>
      </div>
    </div>
  );
};

const DetailModal = ({ house, onClose }) => {
  const Row = ({ label, value }) => value ? (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 14 }}>
      <span style={{ fontWeight: 600, minWidth: 140, color: "var(--brown)" }}>{label}</span>
      <span style={{ color: "var(--dark)" }}>{String(value)}</span>
    </div>
  ) : null;

  const ImgRow = ({ label, urls }) => urls?.length ? (
    <div>
      <p style={{ fontWeight: 600, color: "var(--brown)", fontSize: 13, marginBottom: 8 }}>{label}</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {urls.map((u, i) => (
          <img key={i} src={u} alt={label} style={{ width: 90, height: 70, objectFit: "cover", borderRadius: 8, border: "1px solid var(--sand)" }} />
        ))}
      </div>
    </div>
  ) : null;

  return (
    <div style={{ padding: "28px 32px", maxHeight: "82vh", overflowY: "auto" }}>
      <h2 style={{ fontSize: 26, marginBottom: 20 }}>{house.propertyName}</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Row label="Short Desc" value={house.shortDescription} />
        <Row label="Description" value={house.description} />
        <Row label="Star Rating" value={house.starRating ? "⭐".repeat(house.starRating) : null} />
        <Row label="Address" value={[house.address?.street, house.address?.city, house.address?.state, house.address?.pincode].filter(Boolean).join(", ")} />
        <Row label="Owner" value={house.owner?.ownerName} />
        <Row label="Phone" value={house.owner?.phone} />
        <Row label="Email" value={house.owner?.email} />
        <Row label="Base Price" value={house.pricing?.basePrice ? `₹${house.pricing.basePrice}/night` : null} />
        <Row label="Weekend Price" value={house.pricing?.weekendPrice ? `₹${house.pricing.weekendPrice}/night` : null} />
        <Row label="Monthly Price" value={house.pricing?.monthlyPrice ? `₹${house.pricing.monthlyPrice}/month` : null} />
        <Row label="Cleaning Fee" value={house.pricing?.cleaningFee ? `₹${house.pricing.cleaningFee}` : null} />
        <Row label="Security Deposit" value={house.pricing?.securityDeposit ? `₹${house.pricing.securityDeposit}` : null} />
        <Row label="Check-In" value={house.checkInTime} />
        <Row label="Check-Out" value={house.checkOutTime} />
        <Row label="Pets Allowed" value={house.petsAllowed ? "Yes 🐾" : "No"} />
        <Row label="Smoking" value={house.smokingAllowed ? "Yes 🚬" : "No"} />
        <Row label="Cancellation" value={house.cancellationPolicy} />
        <Row label="House Rules" value={house.houseRules} />
        <hr style={{ border: "none", borderTop: "1px solid var(--sand)", margin: "8px 0" }} />
        <ImgRow label="Front View" urls={house.images?.frontView} />
        <ImgRow label="Bedroom" urls={house.images?.bedRoom} />
        <ImgRow label="Kitchen" urls={house.images?.kitchen} />
        <ImgRow label="Washroom" urls={house.images?.washroom} />
      </div>
      <div style={{ marginTop: 24, textAlign: "right" }}>
        <button className="btn-ghost" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

const Modal = ({ children, onClose }) => (
  <div style={{
    position: "fixed", inset: 0, zIndex: 1000,
    background: "rgba(44,36,22,0.45)", backdropFilter: "blur(4px)",
    display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
  }} onClick={e => e.target === e.currentTarget && onClose()}>
    <div className="card fade-in" style={{ width: "100%", maxWidth: 720, maxHeight: "90vh", overflowY: "auto" }}>
      {children}
    </div>
  </div>
);

const Confirm = ({ msg, onConfirm, onCancel }) => (
  <Modal onClose={onCancel}>
    <div style={{ padding: "32px 36px", textAlign: "center" }}>
      <div style={{ fontSize: 44, marginBottom: 16 }}>🗑️</div>
      <h3 style={{ fontSize: 22, marginBottom: 10 }}>Are you sure?</h3>
      <p style={{ color: "#888", marginBottom: 28 }}>{msg}</p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <button className="btn-ghost" onClick={onCancel}>Cancel</button>
        <button className="btn-danger" onClick={onConfirm}>Yes, Delete</button>
      </div>
    </div>
  </Modal>
);

const StatsBar = ({ houses }) => {
  const total = houses.length;
  const avgPrice = total ? Math.round(houses.reduce((s, h) => s + (h.pricing?.basePrice || 0), 0) / total) : 0;
  const cities = [...new Set(houses.map(h => h.address?.city).filter(Boolean))].length;
  return (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
      {[
        { icon: "🏠", label: "Total Properties", value: total },
        { icon: "📍", label: "Cities", value: cities },
        { icon: "💰", label: "Avg. Base Price", value: avgPrice ? `₹${avgPrice}` : "—" },
      ].map(s => (
        <div key={s.label} className="card" style={{ padding: "14px 22px", display: "flex", gap: 14, alignItems: "center", flex: "1 1 160px" }}>
          <span style={{ fontSize: 28 }}>{s.icon}</span>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "Cormorant Garamond, serif", color: "var(--dark)" }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#888" }}>{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function App() {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const showToast = (msg, type = "success") => setToast({ msg, type });

  const fetchHouses = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/my-houses`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) setHouses(data.data);
      else showToast(data.message || "Failed to load", "error");
    } catch {
      showToast("Network error", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHouses(); }, []);

  const handleDelete = async () => {
    try {
      const res = await fetch(`${BASE_URL}/delete/${deleteId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      showToast("Property deleted");
      setModal(null);
      setDeleteId(null);
      fetchHouses();
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const filtered = houses
    .filter(h =>
      !search ||
      h.propertyName?.toLowerCase().includes(search.toLowerCase()) ||
      h.address?.city?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "price-asc") return (a.pricing?.basePrice || 0) - (b.pricing?.basePrice || 0);
      if (sortBy === "price-desc") return (b.pricing?.basePrice || 0) - (a.pricing?.basePrice || 0);
      if (sortBy === "name") return a.propertyName?.localeCompare(b.propertyName);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  return (
    <>
      <GlobalStyle />
      <header style={{
        background: "var(--dark)", color: "var(--cream)",
        padding: "0 40px", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
        boxShadow: "0 2px 16px rgba(44,36,22,0.18)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 26 }}>🏡</span>
          <span style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 22, fontWeight: 600, letterSpacing: "0.5px" }}>
            VacationHouse <span style={{ color: "var(--accent)", fontStyle: "italic" }}>Manager</span>
          </span>
        </div>
        <button className="btn-primary" onClick={() => setModal("add")}>+ Add Property</button>
      </header>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 24px" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 36, fontWeight: 700, color: "var(--dark)" }}>My Properties</h1>
          <p style={{ color: "#888", marginTop: 4 }}>Manage all your vacation rental listings</p>
        </div>

        <StatsBar houses={houses} />

        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          <input
            placeholder="🔍  Search by name or city…"
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ maxWidth: 320 }}
          />
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ maxWidth: 200 }}>
            <option value="newest">Newest First</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#aaa", fontSize: 16 }}>Loading properties…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: 56 }}>🏡</div>
            <h3 style={{ fontSize: 22, marginTop: 16, color: "var(--brown)" }}>No properties found</h3>
            <p style={{ color: "#aaa", marginTop: 8 }}>{search ? "Try a different search" : "Click '+ Add Property' to get started"}</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 22 }}>
            {filtered.map(h => (
              <HouseCard
                key={h._id} house={h}
                onEdit={house => { setSelected(house); setModal("edit"); }}
                onDelete={id => { setDeleteId(id); setModal("delete"); }}
                onView={house => { setSelected(house); setModal("view"); }}
              />
            ))}
          </div>
        )}
      </main>

      {modal === "add" && (
        <Modal onClose={() => setModal(null)}>
          <HouseForm
            onSuccess={(msg) => { showToast(msg); setModal(null); fetchHouses(); }}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}
      {modal === "edit" && selected && (
        <Modal onClose={() => setModal(null)}>
          <HouseForm
            initial={selected}
            onSuccess={(msg) => { showToast(msg); setModal(null); fetchHouses(); }}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}
      {modal === "view" && selected && (
        <Modal onClose={() => setModal(null)}>
          <DetailModal house={selected} onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal === "delete" && (
        <Confirm
          msg="This will permanently delete the property and all its data."
          onConfirm={handleDelete}
          onCancel={() => { setModal(null); setDeleteId(null); }}
        />
      )}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}
