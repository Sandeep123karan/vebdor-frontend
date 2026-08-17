

import React, { useEffect, useState } from "react";
import axios from "axios";

/* ================= AXIOS AUTH ================= */
const api = axios.create({ baseURL: "http://localhost:7000/api" });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ================= STYLES ================= */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --saffron: #E8620A;
    --saffron-dark: #C94A05;
    --saffron-pale: #FDF0E8;
    --maroon: #7B1E1E;
    --maroon-dark: #4A0E0E;
    --cream: #FAF6F0;
    --charcoal: #1C1C1E;
    --muted: #6B6B6B;
    --border: #E8DDD4;
    --white: #FFFFFF;
    --danger: #DC2626;
    --danger-pale: #FEF2F2;
    --success: #16A34A;
    --shadow-sm: 0 1px 6px rgba(0,0,0,0.06);
    --shadow: 0 4px 24px rgba(232,98,10,0.08);
    --shadow-lg: 0 12px 48px rgba(0,0,0,0.18);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .vd-root {
    font-family: 'DM Sans', sans-serif;
    background: var(--cream);
    min-height: 100vh;
    color: var(--charcoal);
  }

  /* ---- HEADER ---- */
  .vd-header {
    background: linear-gradient(135deg, var(--maroon) 0%, var(--maroon-dark) 100%);
    padding: 24px 36px;
    display: flex; align-items: center; justify-content: space-between;
    position: relative; overflow: hidden;
  }
  .vd-header::before {
    content: ''; position: absolute; right: -40px; top: -60px;
    width: 220px; height: 220px;
    background: radial-gradient(circle, rgba(232,98,10,0.22) 0%, transparent 70%);
    border-radius: 50%; pointer-events: none;
  }
  .vd-header-left { display: flex; align-items: center; gap: 14px; }
  .vd-header-icon { font-size: 36px; filter: drop-shadow(0 2px 8px rgba(232,98,10,0.5)); }
  .vd-header-text h1 {
    font-family: 'Playfair Display', serif;
    font-size: 24px; font-weight: 700; color: var(--white); letter-spacing: 0.4px;
  }
  .vd-header-text p { font-size: 13px; color: rgba(255,255,255,0.55); font-weight: 300; margin-top: 2px; }

  .vd-add-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 20px; background: var(--saffron);
    color: white; border: none; border-radius: 10px;
    font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600;
    cursor: pointer; transition: all 0.2s; white-space: nowrap; position: relative; z-index: 1;
  }
  .vd-add-btn:hover { background: var(--saffron-dark); transform: translateY(-1px); box-shadow: 0 4px 16px rgba(232,98,10,0.4); }

  /* ---- PAGE BODY ---- */
  .vd-body { max-width: 1200px; margin: 0 auto; padding: 32px 24px; }

  /* ---- STATS ---- */
  .vd-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; margin-bottom: 28px; }
  .vd-stat-card {
    background: var(--white); border: 1px solid var(--border); border-radius: 14px;
    padding: 18px 22px; box-shadow: var(--shadow-sm); display: flex; align-items: center; gap: 14px;
  }
  .vd-stat-icon { font-size: 28px; }
  .vd-stat-val { font-size: 22px; font-weight: 700; color: var(--charcoal); line-height: 1; }
  .vd-stat-label { font-size: 12px; color: var(--muted); margin-top: 3px; }

  /* ---- TABLE ---- */
  .vd-table-wrapper {
    background: var(--white); border: 1px solid var(--border);
    border-radius: 16px; box-shadow: var(--shadow); overflow: hidden;
  }
  .vd-table-toolbar {
    padding: 18px 24px; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;
  }
  .vd-table-title { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: var(--charcoal); }
  .vd-search {
    padding: 8px 14px; border: 1.5px solid var(--border); border-radius: 8px;
    font-family: 'DM Sans', sans-serif; font-size: 13px; color: var(--charcoal);
    background: var(--cream); outline: none; width: 240px; transition: border-color 0.2s;
  }
  .vd-search:focus { border-color: var(--saffron); }

  .vd-table { width: 100%; border-collapse: collapse; }
  .vd-table thead tr { background: var(--saffron-pale); border-bottom: 2px solid var(--border); }
  .vd-table th {
    padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 600;
    color: var(--saffron); text-transform: uppercase; letter-spacing: 0.9px; white-space: nowrap;
  }
  .vd-table tbody tr { border-bottom: 1px solid var(--border); transition: background 0.15s; }
  .vd-table tbody tr:last-child { border-bottom: none; }
  .vd-table tbody tr:hover { background: #fffbf8; }
  .vd-table td { padding: 14px 16px; font-size: 13.5px; vertical-align: middle; }

  .vd-thumb-wrap { display: flex; gap: 4px; }
  .vd-thumb { width: 36px; height: 36px; border-radius: 6px; object-fit: cover; border: 1.5px solid var(--border); }
  .vd-thumb-placeholder {
    width: 36px; height: 36px; border-radius: 6px; background: var(--saffron-pale);
    display: flex; align-items: center; justify-content: center; font-size: 16px; border: 1.5px solid var(--border);
  }

  .vd-badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 500;
  }
  .vd-badge-price { background: linear-gradient(135deg, var(--saffron), var(--saffron-dark)); color: white; }
  .vd-badge-seats { background: var(--saffron-pale); color: var(--saffron); border: 1px solid rgba(232,98,10,0.2); }
  .vd-badge-date { background: #f3f4f6; color: var(--muted); }

  .vd-name-cell { font-weight: 600; color: var(--charcoal); font-size: 14px; }
  .vd-loc-cell { font-size: 12px; color: var(--muted); margin-top: 2px; }

  .vd-actions { display: flex; gap: 8px; }
  .vd-btn-edit, .vd-btn-del {
    display: flex; align-items: center; gap: 5px;
    padding: 6px 12px; border-radius: 7px;
    font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500;
    cursor: pointer; transition: all 0.18s; border: 1px solid transparent;
  }
  .vd-btn-edit { background: #EFF6FF; color: #2563EB; border-color: #BFDBFE; }
  .vd-btn-edit:hover { background: #2563EB; color: white; }
  .vd-btn-del { background: var(--danger-pale); color: var(--danger); border-color: #FECACA; }
  .vd-btn-del:hover { background: var(--danger); color: white; }

  .vd-empty { text-align: center; padding: 64px 20px; color: var(--muted); }
  .vd-empty .e-icon { font-size: 52px; display: block; margin-bottom: 12px; }
  .vd-empty p { font-size: 15px; }
  .vd-empty small { font-size: 13px; color: #bbb; margin-top: 4px; display: block; }

  /* ---- MODAL ---- */
  .vd-overlay {
    position: fixed; inset: 0; z-index: 1000;
    background: rgba(0,0,0,0.55); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center; padding: 16px;
    animation: fadeIn 0.2s ease;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  .vd-modal {
    background: var(--white); border-radius: 20px;
    width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto;
    box-shadow: var(--shadow-lg); animation: slideUp 0.25s ease;
  }
  @keyframes slideUp { from { transform: translateY(24px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

  .vd-modal-header {
    padding: 24px 28px 20px; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    position: sticky; top: 0; background: var(--white); border-radius: 20px 20px 0 0; z-index: 1;
  }
  .vd-modal-title {
    font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: var(--charcoal);
    display: flex; align-items: center; gap: 10px;
  }
  .vd-modal-close {
    width: 32px; height: 32px; border-radius: 8px;
    background: var(--cream); border: 1px solid var(--border);
    font-size: 18px; cursor: pointer; color: var(--muted);
    display: flex; align-items: center; justify-content: center; transition: all 0.15s;
  }
  .vd-modal-close:hover { background: var(--danger-pale); color: var(--danger); border-color: #FECACA; }

  .vd-modal-body { padding: 24px 28px; }

  .vd-field { margin-bottom: 18px; }
  .vd-label {
    display: block; font-size: 11.5px; font-weight: 600; color: var(--muted);
    text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 7px;
  }
  .vd-input, .vd-textarea {
    width: 100%; padding: 10px 14px;
    font-family: 'DM Sans', sans-serif; font-size: 14px; color: var(--charcoal);
    background: var(--cream); border: 1.5px solid var(--border); border-radius: 10px;
    outline: none; transition: border-color 0.2s, box-shadow 0.2s;
  }
  .vd-input:focus, .vd-textarea:focus {
    border-color: var(--saffron); box-shadow: 0 0 0 3px rgba(232,98,10,0.1); background: var(--white);
  }
  .vd-textarea { resize: vertical; min-height: 80px; }
  .vd-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

  .vd-file-label {
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px;
    padding: 18px; border: 2px dashed var(--border); border-radius: 12px;
    cursor: pointer; transition: all 0.2s; background: var(--cream); text-align: center;
  }
  .vd-file-label:hover { border-color: var(--saffron); background: var(--saffron-pale); }
  .vd-file-label .icon { font-size: 26px; }
  .vd-file-label .txt { font-size: 13px; color: var(--muted); }
  .vd-file-label .sub { font-size: 11px; color: #bbb; }
  .vd-file-input { display: none; }

  .vd-previews { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
  .vd-preview-wrap {
    width: 68px; height: 68px; border-radius: 9px;
    overflow: hidden; border: 2px solid var(--border);
  }
  .vd-preview-wrap img { width: 100%; height: 100%; object-fit: cover; }

  .vd-modal-footer {
    padding: 16px 28px 24px; display: flex; gap: 10px; justify-content: flex-end;
    border-top: 1px solid var(--border);
  }
  .vd-btn-cancel {
    padding: 10px 20px; border-radius: 10px;
    font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500;
    color: var(--muted); background: var(--cream); border: 1.5px solid var(--border);
    cursor: pointer; transition: all 0.15s;
  }
  .vd-btn-cancel:hover { border-color: #ccc; color: var(--charcoal); }
  .vd-btn-submit {
    padding: 10px 24px; border-radius: 10px;
    font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600;
    color: white; background: linear-gradient(135deg, var(--saffron), var(--saffron-dark));
    border: none; cursor: pointer; transition: all 0.2s;
    display: flex; align-items: center; gap: 8px;
  }
  .vd-btn-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(232,98,10,0.35); }
  .vd-btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

  .vd-loader {
    width: 15px; height: 15px; border: 2px solid rgba(255,255,255,0.35);
    border-top-color: white; border-radius: 50%;
    animation: spin 0.7s linear infinite; display: inline-block;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ---- DELETE CONFIRM ---- */
  .vd-confirm-modal {
    background: var(--white); border-radius: 16px; width: 100%; max-width: 380px;
    padding: 28px; text-align: center; box-shadow: var(--shadow-lg); animation: slideUp 0.2s ease;
  }
  .vd-confirm-icon { font-size: 44px; margin-bottom: 14px; }
  .vd-confirm-title { font-size: 18px; font-weight: 700; color: var(--charcoal); margin-bottom: 8px; }
  .vd-confirm-msg { font-size: 13.5px; color: var(--muted); margin-bottom: 22px; line-height: 1.5; }
  .vd-confirm-btns { display: flex; gap: 10px; justify-content: center; }
  .vd-confirm-cancel {
    padding: 9px 20px; border-radius: 8px; background: var(--cream); border: 1.5px solid var(--border);
    color: var(--muted); font-size: 14px; font-weight: 500; cursor: pointer;
    font-family: 'DM Sans', sans-serif; transition: all 0.15s;
  }
  .vd-confirm-cancel:hover { border-color: #ccc; color: var(--charcoal); }
  .vd-confirm-del {
    padding: 9px 20px; border-radius: 8px; background: var(--danger); border: none;
    color: white; font-size: 14px; font-weight: 600; cursor: pointer;
    font-family: 'DM Sans', sans-serif; transition: all 0.15s;
    display: flex; align-items: center; gap: 6px;
  }
  .vd-confirm-del:hover { background: #B91C1C; }

  /* ---- TOAST ---- */
  .vd-toast {
    position: fixed; bottom: 24px; right: 24px; z-index: 9999;
    padding: 12px 20px; border-radius: 10px;
    font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500;
    color: white; box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    animation: toastIn 0.25s ease; display: flex; align-items: center; gap: 8px;
  }
  .vd-toast-success { background: var(--success); }
  .vd-toast-error { background: var(--danger); }
  @keyframes toastIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

  @media (max-width: 700px) {
    .vd-stats { grid-template-columns: 1fr; }
    .vd-table th:nth-child(4), .vd-table td:nth-child(4),
    .vd-table th:nth-child(5), .vd-table td:nth-child(5) { display: none; }
    .vd-row { grid-template-columns: 1fr; }
    .vd-header { padding: 18px 20px; }
    .vd-add-btn span { display: none; }
  }
`;

/* ================= TOAST ================= */
const Toast = ({ msg, type, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  return <div className={`vd-toast vd-toast-${type}`}>{type === "success" ? "✅" : "❌"} {msg}</div>;
};

/* ================= FORM MODAL ================= */
const DarshanModal = ({ mode, initial, onClose, onSaved }) => {
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState(initial?.images || []);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviewImages(files.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === "add" && images.length === 0) { onSaved(null, "Please select at least one image"); return; }
    setLoading(true);
    const formData = new FormData();
    ["name","location","date","time","description","price","availableSeats"]
      .forEach((k) => formData.append(k, e.target[k].value));
    images.forEach((img) => formData.append("images", img));
    try {
      if (mode === "add") {
        const res = await api.post("/vendor/darshans", formData);
        onSaved(res.data.data || res.data, null);
      } else {
        const res = await api.put(`/vendor/darshans/${initial._id}`, formData);
        onSaved(res.data.data || res.data, null);
      }
    } catch (err) {
      onSaved(null, err.response?.data?.message || "Something went wrong");
    } finally { setLoading(false); }
  };

  const fmtDate = (d) => d ? new Date(d).toISOString().split("T")[0] : "";

  return (
    <div className="vd-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="vd-modal">
        <div className="vd-modal-header">
          <div className="vd-modal-title">
            <span>{mode === "add" ? "✨" : "✏️"}</span>
            {mode === "add" ? "Add New Darshan" : "Edit Darshan"}
          </div>
          <button className="vd-modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="vd-modal-body">
            <div className="vd-field">
              <label className="vd-label">Darshan Name *</label>
              <input className="vd-input" name="name" placeholder="e.g. Tirupati Special Darshan" defaultValue={initial?.name || ""} required />
            </div>
            <div className="vd-field">
              <label className="vd-label">Location</label>
              <input className="vd-input" name="location" placeholder="e.g. Tirupati, Andhra Pradesh" defaultValue={initial?.location || ""} />
            </div>
            <div className="vd-row">
              <div className="vd-field">
                <label className="vd-label">Date</label>
                <input className="vd-input" type="date" name="date" defaultValue={fmtDate(initial?.date)} />
              </div>
              <div className="vd-field">
                <label className="vd-label">Time</label>
                <input className="vd-input" type="time" name="time" defaultValue={initial?.time || ""} />
              </div>
            </div>
            <div className="vd-field">
              <label className="vd-label">Description</label>
              <textarea className="vd-textarea" name="description" placeholder="Describe the darshan experience..." defaultValue={initial?.description || ""} />
            </div>
            <div className="vd-row">
              <div className="vd-field">
                <label className="vd-label">Price (₹) *</label>
                <input className="vd-input" type="number" name="price" placeholder="500" defaultValue={initial?.price || ""} required />
              </div>
              <div className="vd-field">
                <label className="vd-label">Available Seats</label>
                <input className="vd-input" type="number" name="availableSeats" placeholder="100" defaultValue={initial?.availableSeats || ""} />
              </div>
            </div>
            <div className="vd-field">
              <label className="vd-label">Images {mode === "add" ? "*" : "(leave blank to keep existing)"}</label>
              <label className="vd-file-label">
                <span className="icon">🖼️</span>
                <span className="txt">Click to upload images</span>
                <span className="sub">PNG, JPG, WEBP • Multiple allowed</span>
                <input className="vd-file-input" type="file" multiple accept="image/*" onChange={handleImageChange} />
              </label>
              {previewImages.length > 0 && (
                <div className="vd-previews">
                  {previewImages.map((img, i) => (
                    <div key={i} className="vd-preview-wrap"><img src={img} alt="preview" /></div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="vd-modal-footer">
            <button type="button" className="vd-btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="vd-btn-submit" disabled={loading}>
              {loading ? <><span className="vd-loader" /> Saving...</> : <>{mode === "add" ? "🙏 Add Darshan" : "💾 Save Changes"}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ================= DELETE CONFIRM ================= */
const DeleteConfirm = ({ darshan, onClose, onDeleted }) => {
  const [loading, setLoading] = useState(false);
  const handleDelete = async () => {
    setLoading(true);
    try {
      await api.delete(`/vendor/darshans/${darshan._id}`);
      onDeleted(darshan._id);
    } catch { onDeleted(null, "Failed to delete darshan"); }
    finally { setLoading(false); }
  };
  return (
    <div className="vd-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="vd-confirm-modal">
        <div className="vd-confirm-icon">🗑️</div>
        <div className="vd-confirm-title">Delete Darshan?</div>
        <div className="vd-confirm-msg">
          Are you sure you want to delete <strong>"{darshan.name}"</strong>?<br />This action cannot be undone.
        </div>
        <div className="vd-confirm-btns">
          <button className="vd-confirm-cancel" onClick={onClose}>Cancel</button>
          <button className="vd-confirm-del" onClick={handleDelete} disabled={loading}>
            {loading ? <><span className="vd-loader" /> Deleting...</> : <>🗑 Delete</>}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ================= MAIN COMPONENT ================= */
const VendorDarshan = () => {
  const [darshans, setDarshans] = useState([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);

  const showToast = (msg, type = "success") => setToast({ msg, type });

  useEffect(() => {
    api.get("/vendor/darshans")
      .then((res) => setDarshans(res.data.data || []))
      .catch(() => showToast("Failed to load darshans", "error"))
      .finally(() => setPageLoading(false));
  }, []);

  const handleSaved = (result, error) => {
    if (error) { showToast(error, "error"); return; }
    if (modal?.type === "add") {
      setDarshans((prev) => [result, ...prev]);
      showToast("Darshan added successfully!");
    } else {
      setDarshans((prev) => prev.map((d) => d._id === result._id ? result : d));
      showToast("Darshan updated successfully!");
    }
    setModal(null);
  };

  const handleDeleted = (id, error) => {
    if (error) { showToast(error, "error"); return; }
    setDarshans((prev) => prev.filter((d) => d._id !== id));
    setModal(null);
    showToast("Darshan deleted!");
  };

  const filtered = darshans.filter((d) =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.location?.toLowerCase().includes(search.toLowerCase())
  );

  const totalSeats = darshans.reduce((s, d) => s + (Number(d.availableSeats) || 0), 0);
  const totalPrice = darshans.reduce((s, d) => s + (Number(d.price) || 0), 0);

  const fmtDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className="vd-root">
      <style>{styles}</style>

      {/* HEADER */}
      <div className="vd-header">
        <div className="vd-header-left">
          <div className="vd-header-icon">🛕</div>
          <div className="vd-header-text">
            <h1>Vendor Darshan Portal</h1>
            <p>Manage your sacred darshan offerings</p>
          </div>
        </div>
        <button className="vd-add-btn" onClick={() => setModal({ type: "add" })}>
          ＋ <span>Add Darshan</span>
        </button>
      </div>

      <div className="vd-body">
        {/* STATS */}
        <div className="vd-stats">
          <div className="vd-stat-card">
            <span className="vd-stat-icon">🛕</span>
            <div><div className="vd-stat-val">{darshans.length}</div><div className="vd-stat-label">Total Darshans</div></div>
          </div>
          <div className="vd-stat-card">
            <span className="vd-stat-icon">🪑</span>
            <div><div className="vd-stat-val">{totalSeats.toLocaleString()}</div><div className="vd-stat-label">Total Seats</div></div>
          </div>
          <div className="vd-stat-card">
            <span className="vd-stat-icon">💰</span>
            <div><div className="vd-stat-val">₹{totalPrice.toLocaleString()}</div><div className="vd-stat-label">Total Listed Price</div></div>
          </div>
        </div>

        {/* TABLE */}
        <div className="vd-table-wrapper">
          <div className="vd-table-toolbar">
            <span className="vd-table-title">All Darshans</span>
            <input
              className="vd-search"
              placeholder="🔍  Search name or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {pageLoading ? (
            <div className="vd-empty"><span className="e-icon">⏳</span><p>Loading...</p></div>
          ) : filtered.length === 0 ? (
            <div className="vd-empty">
              <span className="e-icon">🛕</span>
              <p>{search ? "No results found" : "No darshans added yet"}</p>
              <small>{search ? "Try a different search" : 'Click "+ Add Darshan" to get started'}</small>
            </div>
          ) : (
            <table className="vd-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Image</th>
                  <th>Darshan</th>
                  <th>Date & Time</th>
                  <th>Price</th>
                  <th>Seats</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d, i) => (
                  <tr key={d._id}>
                    <td style={{ color: "var(--muted)", fontWeight: 500 }}>{i + 1}</td>
                    <td>
                      <div className="vd-thumb-wrap">
                        {d.images?.length > 0
                          ? d.images.slice(0, 2).map((img, j) => <img key={j} className="vd-thumb" src={img} alt="" />)
                          : <div className="vd-thumb-placeholder">🛕</div>
                        }
                      </div>
                    </td>
                    <td>
                      <div className="vd-name-cell">{d.name}</div>
                      {d.location && <div className="vd-loc-cell">📍 {d.location}</div>}
                    </td>
                    <td>
                      <span className="vd-badge vd-badge-date">
                        {fmtDate(d.date)}{d.time ? ` · ${d.time}` : ""}
                      </span>
                    </td>
                    <td><span className="vd-badge vd-badge-price">₹ {Number(d.price).toLocaleString()}</span></td>
                    <td><span className="vd-badge vd-badge-seats">🪑 {d.availableSeats ?? "—"}</span></td>
                    <td>
                      <div className="vd-actions">
                        <button className="vd-btn-edit" onClick={() => setModal({ type: "edit", data: d })}>✏️ Edit</button>
                        <button className="vd-btn-del" onClick={() => setModal({ type: "delete", data: d })}>🗑 Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODALS */}
      {modal?.type === "add" && <DarshanModal mode="add" onClose={() => setModal(null)} onSaved={handleSaved} />}
      {modal?.type === "edit" && <DarshanModal mode="edit" initial={modal.data} onClose={() => setModal(null)} onSaved={handleSaved} />}
      {modal?.type === "delete" && <DeleteConfirm darshan={modal.data} onClose={() => setModal(null)} onDeleted={handleDeleted} />}

      {/* TOAST */}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default VendorDarshan;