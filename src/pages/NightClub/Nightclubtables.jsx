import { useCallback, useEffect, useMemo, useState } from "react";

/* ==========================================================
   CONFIG  (apne project ke hisaab se change karo)
========================================================== */
const API_BASE = import.meta?.env?.VITE_API_URL || "https://bmtvendorfinal.onrender.com";

// Backend: app.use("/api/vendor/nightclub-tables", nightClubTable.routes)
//   POST   /            -> create
//   GET    /my-tables   -> ?nightClubId=
//   PUT    /:id         -> update
//   DELETE /:id         -> soft disable (isActive=false, isBookable=false)
const TABLES_URL = `${API_BASE}/api/vendor/nightclub-tables`;

// Vendor ke clubs ki list ka endpoint. Ye sab ek-ek karke try honge,
// jo pehla chal jaye wahi use hoga. Apna sahi endpoint sabse upar daal do.
const CLUBS_URLS = [
  `${API_BASE}/api/vendor/nightclubs/my-nightclubs`,
  `${API_BASE}/api/vendor/nightclubs/my`,
  `${API_BASE}/api/vendor/nightclubs/my-clubs`,
  `${API_BASE}/api/vendor/nightclubs`,
  `${API_BASE}/api/nightclubs/my-nightclubs`,
];

// Token kis key mein save hai - yahan sab common keys check hoti hain
const TOKEN_KEYS = ["token", "vendorToken", "authToken", "accessToken"];
const getToken = () => {
  for (const k of TOKEN_KEYS) {
    const v = localStorage.getItem(k);
    if (v) return v;
  }
  return "";
};

// Response se clubs ki array nikalne ke liye (alag-alag shapes handle karta hai)
const extractClubs = (d) => {
  const c = d?.data ?? d?.nightClubs ?? d?.nightclubs ?? d?.clubs ?? d;
  if (Array.isArray(c)) return c;
  if (Array.isArray(c?.nightClubs)) return c.nightClubs;
  if (Array.isArray(c?.data)) return c.data;
  return [];
};

const TABLE_TYPES = ["regular", "premium", "vip", "private", "booth", "sofa"];

const FLAGS = [
  ["nearDanceFloor", "Near dance floor"],
  ["nearStage", "Near stage"],
  ["privateArea", "Private area"],
  ["smokingAllowed", "Smoking allowed"],
];

const EMPTY_FORM = {
  tableNumber: "",
  tableName: "",
  tableType: "regular",
  capacity: "",
  minimumPersons: 1,
  maximumPersons: "",
  floor: "",
  section: "",
  position: "",
  nearDanceFloor: false,
  nearStage: false,
  privateArea: false,
  smokingAllowed: false,
  description: "",
  image: "",
};

/* ==========================================================
   API HELPER  (backend always returns { success, message, data })
========================================================== */
async function api(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    throw new Error(
      data.message ||
        (res.status === 401
          ? "Session expired. Please log in again."
          : "Something went wrong")
    );
  }
  return data;
}

const cap = (s = "") => s.charAt(0).toUpperCase() + s.slice(1);

/* ==========================================================
   MAIN COMPONENT
========================================================== */
export default function NightClubTables({ initialClubId = "" }) {
  const [clubs, setClubs] = useState([]);
  const [clubsError, setClubsError] = useState("");
  const [clubId, setClubId] = useState(initialClubId);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [modal, setModal] = useState(null); // { mode: "create" | "edit", table? }
  const [confirm, setConfirm] = useState(null); // table to disable

  const notify = (message, kind = "ok") => {
    setToast({ message, kind });
    setTimeout(() => setToast(null), 3200);
  };

  /* ---------- load clubs ---------- */
  useEffect(() => {
    let alive = true;
    (async () => {
      let lastErr = "";
      for (const url of CLUBS_URLS) {
        try {
          const d = await api(url);
          const list = extractClubs(d);
          if (!alive) return;
          setClubs(list);
          setClubsError("");
          if (!initialClubId && list.length) setClubId(list[0]._id);
          return;
        } catch (e) {
          lastErr = e.message;
        }
      }
      if (alive) {
        setClubs([]);
        setClubsError(
          getToken()
            ? `Clubs list load nahi hui (${lastErr}). Neeche club ID paste karo ya CLUBS_URLS sahi karo.`
            : "Token nahi mila. Pehle vendor login karo (localStorage mein token hona chahiye)."
        );
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- load tables ---------- */
  const loadTables = useCallback(async () => {
    if (!clubId) return;
    setLoading(true);
    setError("");
    try {
      const d = await api(
        `${TABLES_URL}/my-tables?nightClubId=${encodeURIComponent(clubId)}`
      );
      setTables(d.data || []);
    } catch (e) {
      setError(e.message);
      setTables([]);
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  /* ---------- actions ---------- */
  const saveTable = async (form, existing) => {
    const capacity = Number(form.capacity);
    const payload = {
      ...form,
      tableNumber: String(form.tableNumber).trim(),
      capacity,
      minimumPersons: Number(form.minimumPersons || 1),
      maximumPersons: Number(form.maximumPersons || capacity),
    };

    if (existing) {
      await api(`${TABLES_URL}/${existing._id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      notify("Table updated");
    } else {
      await api(TABLES_URL, {
        method: "POST",
        body: JSON.stringify({ ...payload, nightClubId: clubId }),
      });
      notify("Table added");
    }
    setModal(null);
    loadTables();
  };

  const patchTable = async (table, patch, okMsg) => {
    try {
      await api(`${TABLES_URL}/${table._id}`, {
        method: "PUT",
        body: JSON.stringify(patch),
      });
      notify(okMsg);
      loadTables();
    } catch (e) {
      notify(e.message, "err");
    }
  };

  const disableTable = async () => {
    try {
      await api(`${TABLES_URL}/${confirm._id}`, { method: "DELETE" });
      notify("Table disabled");
    } catch (e) {
      notify(e.message, "err");
    }
    setConfirm(null);
    loadTables();
  };

  /* ---------- derived ---------- */
  const stats = useMemo(() => {
    const active = tables.filter((t) => t.isActive);
    return {
      total: tables.length,
      active: active.length,
      bookable: active.filter((t) => t.isBookable).length,
      seats: active.reduce((s, t) => s + (t.capacity || 0), 0),
    };
  }, [tables]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tables.filter((t) => {
      if (typeFilter !== "all" && t.tableType !== typeFilter) return false;
      if (statusFilter === "active" && !(t.isActive && t.isBookable)) return false;
      if (statusFilter === "paused" && !(t.isActive && !t.isBookable)) return false;
      if (statusFilter === "disabled" && t.isActive) return false;
      if (!q) return true;
      return [t.tableNumber, t.tableName, t.section, t.floor]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [tables, search, typeFilter, statusFilter]);

  /* ======================================================== */
  return (
    <div className="nct">
      <style>{CSS}</style>

      <header className="nct-head">
        <div>
          <h1>Tables</h1>
          <p>Set up the tables guests can book at your club.</p>
        </div>
        <button
          className="btn primary"
          disabled={!clubId}
          onClick={() => setModal({ mode: "create" })}
        >
          Add table
        </button>
      </header>

      <div className="nct-club">
        <label htmlFor="club">Night club</label>
        {clubs.length > 0 ? (
          <select id="club" value={clubId} onChange={(e) => setClubId(e.target.value)}>
            {clubs.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name || c.clubName || c._id}
              </option>
            ))}
          </select>
        ) : (
          <input
            id="club"
            placeholder="Paste your night club ID"
            value={clubId}
            onChange={(e) => setClubId(e.target.value.trim())}
          />
        )}
        {clubsError && <p className="club-note">{clubsError}</p>}
      </div>

      <section className="nct-stats">
        <Stat label="Total tables" value={stats.total} />
        <Stat label="Active" value={stats.active} />
        <Stat label="Open for booking" value={stats.bookable} />
        <Stat label="Seats in total" value={stats.seats} />
      </section>

      <div className="nct-filters">
        <input
          type="search"
          placeholder="Search by number, name, section or floor"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="all">All types</option>
          {TABLE_TYPES.map((t) => (
            <option key={t} value={t}>
              {cap(t)}
            </option>
          ))}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="active">Open for booking</option>
          <option value="paused">Booking paused</option>
          <option value="disabled">Disabled</option>
        </select>
      </div>

      {!clubId ? (
        <Empty
          title="Choose a night club"
          text="Select a club above to see and manage its tables."
        />
      ) : loading ? (
        <div className="nct-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card skeleton" />
          ))}
        </div>
      ) : error ? (
        <Empty
          title="Couldn't load tables"
          text={error}
          action={
            <button className="btn" onClick={loadTables}>
              Try again
            </button>
          }
        />
      ) : tables.length === 0 ? (
        <Empty
          title="No tables yet"
          text="Add your first table to start taking bookings."
          action={
            <button className="btn primary" onClick={() => setModal({ mode: "create" })}>
              Add table
            </button>
          }
        />
      ) : visible.length === 0 ? (
        <Empty title="No matching tables" text="Try a different search or clear the filters." />
      ) : (
        <div className="nct-grid">
          {visible.map((t) => (
            <TableCard
              key={t._id}
              t={t}
              onEdit={() => setModal({ mode: "edit", table: t })}
              onDisable={() => setConfirm(t)}
              onEnable={() =>
                patchTable(t, { isActive: true, isBookable: true }, "Table enabled")
              }
              onToggleBookable={() =>
                patchTable(
                  t,
                  { isBookable: !t.isBookable },
                  t.isBookable ? "Booking paused" : "Booking resumed"
                )
              }
            />
          ))}
        </div>
      )}

      {modal && (
        <TableModal
          mode={modal.mode}
          table={modal.table}
          onClose={() => setModal(null)}
          onSave={saveTable}
        />
      )}

      {confirm && (
        <Dialog
          small
          onClose={() => setConfirm(null)}
          title={`Disable table ${confirm.tableNumber}?`}
        >
          <p className="muted">
            Guests won't be able to book this table. You can enable it again anytime.
          </p>
          <div className="actions">
            <button className="btn" onClick={() => setConfirm(null)}>
              Keep active
            </button>
            <button className="btn danger" onClick={disableTable}>
              Disable table
            </button>
          </div>
        </Dialog>
      )}

      {toast && (
        <div className={`toast ${toast.kind}`} role="status">
          {toast.message}
        </div>
      )}
    </div>
  );
}

/* ==========================================================
   SMALL PIECES
========================================================== */
function Stat({ label, value }) {
  return (
    <div className="stat">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function Empty({ title, text, action }) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}

function TableCard({ t, onEdit, onDisable, onEnable, onToggleBookable }) {
  const status = !t.isActive
    ? "Disabled"
    : t.isBookable
    ? "Open for booking"
    : "Booking paused";
  const where = [t.floor, t.section, t.position].filter(Boolean).join(", ");
  const perks = FLAGS.filter(([k]) => t[k]).map(([, l]) => l);
  const max = t.maximumPersons || t.capacity;

  return (
    <article className={`card ${t.isActive ? "" : "off"}`}>
      <div className="card-top">
        <div className="num">{t.tableNumber}</div>
        <span className={`badge ${t.tableType}`}>{cap(t.tableType)}</span>
      </div>

      <h3>{t.tableName || `Table ${t.tableNumber}`}</h3>
      <p className="muted">
        Seats {t.capacity} · {t.minimumPersons || 1}–{max} guests per booking
      </p>
      {where && <p className="muted">{where}</p>}
      {t.description && <p className="desc">{t.description}</p>}

      {perks.length > 0 && (
        <ul className="perks">
          {perks.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      )}

      <div className={`status ${!t.isActive ? "bad" : t.isBookable ? "good" : "warn"}`}>
        {status}
      </div>

      <div className="card-actions">
        <button className="btn sm" onClick={onEdit}>
          Edit
        </button>
        {t.isActive ? (
          <>
            <button className="btn sm" onClick={onToggleBookable}>
              {t.isBookable ? "Pause booking" : "Resume booking"}
            </button>
            <button className="btn sm danger-ghost" onClick={onDisable}>
              Disable
            </button>
          </>
        ) : (
          <button className="btn sm" onClick={onEnable}>
            Enable
          </button>
        )}
      </div>
    </article>
  );
}

function Dialog({ title, children, onClose, small }) {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className={`dialog ${small ? "small" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="dialog-head">
          <h2>{title}</h2>
          <button className="x" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ==========================================================
   CREATE / EDIT FORM
========================================================== */
const pick = (obj, keys) =>
  Object.fromEntries(keys.map((k) => [k, obj[k] ?? EMPTY_FORM[k]]));

function TableModal({ mode, table, onClose, onSave }) {
  const [form, setForm] = useState(() => {
    if (!table) return EMPTY_FORM;
    const f = { ...EMPTY_FORM, ...pick(table, Object.keys(EMPTY_FORM)) };
    // backend default for maximumPersons is 0 -> show as empty
    if (!f.maximumPersons) f.maximumPersons = "";
    return f;
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = () => {
    const e = {};
    const cp = Number(form.capacity);
    const min = Number(form.minimumPersons || 1);
    const max = Number(form.maximumPersons || cp);
    if (!String(form.tableNumber).trim()) e.tableNumber = "Enter a table number";
    if (!cp || cp < 1) e.capacity = "Capacity must be at least 1";
    if (min < 1) e.minimumPersons = "Minimum is 1";
    if (cp && max > cp) e.maximumPersons = "Can't be more than capacity";
    if (!e.minimumPersons && min > max) e.minimumPersons = "Can't be more than maximum guests";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setApiError("");
    try {
      await onSave(form, table);
    } catch (e) {
      setApiError(
        /duplicate|E11000|already exists/i.test(e.message)
          ? "This table number already exists in this club."
          : e.message
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      title={mode === "edit" ? `Edit table ${table.tableNumber}` : "Add table"}
      onClose={onClose}
    >
      <form onSubmit={submit} noValidate>
        <div className="form-grid">
          <Field label="Table number *" error={errors.tableNumber}>
            <input
              value={form.tableNumber}
              onChange={(e) => set("tableNumber", e.target.value)}
              placeholder="e.g. A12"
            />
          </Field>
          <Field label="Table name">
            <input
              value={form.tableName}
              onChange={(e) => set("tableName", e.target.value)}
              placeholder="e.g. Stage-side sofa"
            />
          </Field>

          <Field label="Type">
            <select value={form.tableType} onChange={(e) => set("tableType", e.target.value)}>
              {TABLE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {cap(t)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Capacity (seats) *" error={errors.capacity}>
            <input
              type="number"
              min="1"
              value={form.capacity}
              onChange={(e) => set("capacity", e.target.value)}
            />
          </Field>

          <Field label="Minimum guests" error={errors.minimumPersons}>
            <input
              type="number"
              min="1"
              value={form.minimumPersons}
              onChange={(e) => set("minimumPersons", e.target.value)}
            />
          </Field>
          <Field
            label="Maximum guests"
            error={errors.maximumPersons}
            hint="Leave empty to match capacity"
          >
            <input
              type="number"
              min="1"
              value={form.maximumPersons}
              onChange={(e) => set("maximumPersons", e.target.value)}
            />
          </Field>

          <Field label="Floor">
            <input
              value={form.floor}
              onChange={(e) => set("floor", e.target.value)}
              placeholder="e.g. Ground"
            />
          </Field>
          <Field label="Section">
            <input
              value={form.section}
              onChange={(e) => set("section", e.target.value)}
              placeholder="e.g. VIP lounge"
            />
          </Field>
          <Field label="Position" full>
            <input
              value={form.position}
              onChange={(e) => set("position", e.target.value)}
              placeholder="e.g. Left of the DJ booth"
            />
          </Field>
        </div>

        <fieldset className="flags">
          <legend>Features</legend>
          {FLAGS.map(([k, label]) => (
            <label key={k} className="check">
              <input
                type="checkbox"
                checked={!!form[k]}
                onChange={(e) => set(k, e.target.checked)}
              />
              {label}
            </label>
          ))}
        </fieldset>

        <Field label="Description" full>
          <textarea
            rows="3"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </Field>
        <Field label="Image URL" full>
          <input
            value={form.image}
            onChange={(e) => set("image", e.target.value)}
            placeholder="https://…"
          />
        </Field>

        {apiError && (
          <div className="form-error" role="alert">
            {apiError}
          </div>
        )}

        <div className="actions">
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn primary" disabled={saving}>
            {saving ? "Saving…" : mode === "edit" ? "Save changes" : "Add table"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

function Field({ label, error, hint, full, children }) {
  return (
    <label className={`field ${full ? "full" : ""} ${error ? "has-error" : ""}`}>
      <span>{label}</span>
      {children}
      {error ? <em>{error}</em> : hint ? <small>{hint}</small> : null}
    </label>
  );
}

/* ==========================================================
   STYLES  (white theme)
========================================================== */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@500;700&family=Figtree:wght@400;500;600&display=swap');

.nct{
  --bg:#ffffff; --panel:#ffffff; --soft:#f5f4f9; --line:#e4e1ee;
  --text:#1c1830; --muted:#6b657f;
  --accent:#5b3fd9; --accent-dark:#4a31b8; --accent-soft:#ece8fb;
  --good:#1a8a5a; --good-bg:#e5f6ee;
  --warn:#a76a00; --warn-bg:#fff3d9;
  --bad:#c42b46;  --bad-bg:#fdeaee;
  font-family:'Figtree',system-ui,sans-serif; color:var(--text); background:var(--bg);
  min-height:100vh; padding:32px clamp(16px,4vw,48px); box-sizing:border-box;
}
.nct *{box-sizing:border-box}
.nct h1,.nct h2,.nct h3{font-family:'Bricolage Grotesque',system-ui,sans-serif;margin:0}
.nct-head{display:flex;justify-content:space-between;align-items:flex-end;gap:16px;flex-wrap:wrap;margin-bottom:24px}
.nct-head h1{font-size:clamp(28px,4vw,40px);font-weight:700}
.nct-head p{margin:6px 0 0;color:var(--muted)}

.nct-club{display:flex;align-items:center;gap:12px;margin-bottom:20px;flex-wrap:wrap}
.nct-club label{color:var(--muted);font-size:14px}
.nct-club select,.nct-club input{min-width:260px;width:auto}
.club-note{flex-basis:100%;margin:0;font-size:13px;color:var(--warn);background:var(--warn-bg);border-radius:8px;padding:8px 12px}

.nct input,.nct select,.nct textarea{
  background:#fff;border:1px solid var(--line);color:var(--text);border-radius:8px;
  padding:10px 12px;font:inherit;width:100%;
}
.nct input::placeholder,.nct textarea::placeholder{color:#a9a4ba}
.nct input:focus,.nct select:focus,.nct textarea:focus,.nct button:focus-visible{outline:2px solid var(--accent);outline-offset:1px}

.nct-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:20px}
.stat{background:var(--soft);border-radius:10px;padding:14px 16px;display:flex;flex-direction:column;gap:2px}
.stat strong{font-family:'Bricolage Grotesque',sans-serif;font-size:28px;font-weight:700}
.stat span{color:var(--muted);font-size:13px}

.nct-filters{display:grid;grid-template-columns:2fr 1fr 1fr;gap:10px;margin-bottom:20px}
@media(max-width:700px){.nct-filters{grid-template-columns:1fr}}

.nct-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px}
.card{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:16px;display:flex;flex-direction:column;gap:6px}
.card.off{background:var(--soft)}
.card.off h3,.card.off .num{color:var(--muted)}
.card h3{font-size:18px;margin-top:6px}
.card p{margin:0}
.card .desc{font-size:14px;color:var(--text);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.card-top{display:flex;justify-content:space-between;align-items:center}
.num{font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:22px;background:var(--soft);border-radius:8px;padding:4px 12px}
.badge{font-size:12px;font-weight:600;padding:3px 10px;border-radius:99px;background:var(--soft);color:var(--muted)}
.badge.vip,.badge.premium{background:var(--accent);color:#fff}
.badge.private{background:var(--accent-soft);color:var(--accent-dark)}
.muted{color:var(--muted);font-size:14px}
.perks{list-style:none;display:flex;flex-wrap:wrap;gap:6px;padding:0;margin:6px 0 0}
.perks li{font-size:12px;border:1px solid var(--line);border-radius:6px;padding:2px 8px;color:var(--muted)}
.status{font-size:12px;font-weight:600;margin-top:8px;align-self:flex-start;padding:3px 10px;border-radius:99px}
.status.good{color:var(--good);background:var(--good-bg)}
.status.warn{color:var(--warn);background:var(--warn-bg)}
.status.bad{color:var(--bad);background:var(--bad-bg)}
.card-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;padding-top:12px;border-top:1px solid var(--line)}

.btn{background:#fff;color:var(--text);border:1px solid var(--line);border-radius:8px;padding:10px 16px;font:inherit;font-weight:600;cursor:pointer}
.btn:hover:not(:disabled){border-color:var(--muted)}
.btn:disabled{opacity:.5;cursor:not-allowed}
.btn.sm{padding:6px 12px;font-size:13px}
.btn.primary{background:var(--accent);border-color:var(--accent);color:#fff}
.btn.primary:hover:not(:disabled){background:var(--accent-dark);border-color:var(--accent-dark)}
.btn.danger{background:var(--bad);border-color:var(--bad);color:#fff}
.btn.danger-ghost{color:var(--bad)}
.btn.danger-ghost:hover:not(:disabled){border-color:var(--bad)}

.skeleton{min-height:200px;background:linear-gradient(90deg,var(--soft),#fff,var(--soft));background-size:200% 100%;animation:sh 1.4s infinite}
@keyframes sh{to{background-position:-200% 0}}
@media(prefers-reduced-motion:reduce){.skeleton{animation:none}}

.empty{text-align:center;border:1px dashed var(--line);border-radius:12px;padding:56px 20px;display:flex;flex-direction:column;align-items:center;gap:8px}
.empty h3{font-size:20px}.empty p{margin:0 0 8px;color:var(--muted);max-width:44ch}

.overlay{position:fixed;inset:0;background:rgba(28,24,48,.45);display:flex;align-items:flex-start;justify-content:center;padding:4vh 16px;overflow:auto;z-index:50}
.dialog{background:#fff;border-radius:14px;width:min(680px,100%);padding:22px;box-shadow:0 20px 50px rgba(28,24,48,.25)}
.dialog.small{width:min(420px,100%)}
.dialog-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
.dialog-head h2{font-size:22px}
.x{background:none;border:0;color:var(--muted);font-size:28px;line-height:1;cursor:pointer}

.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media(max-width:560px){.form-grid{grid-template-columns:1fr}}
.field{display:flex;flex-direction:column;gap:5px;margin-bottom:0}
.field.full{grid-column:1/-1;margin-top:12px}
.field>span{font-size:13px;color:var(--muted)}
.field small{color:var(--muted);font-size:12px}
.field em{color:var(--bad);font-size:12px;font-style:normal}
.field.has-error input{border-color:var(--bad)}
.flags{border:1px solid var(--line);border-radius:8px;margin:16px 0 4px;padding:10px 14px;display:flex;flex-wrap:wrap;gap:8px 20px}
.flags legend{color:var(--muted);font-size:13px;padding:0 6px}
.check{display:flex;align-items:center;gap:8px;font-size:14px;cursor:pointer}
.check input{width:auto;accent-color:var(--accent)}
.form-error{margin-top:14px;color:var(--bad);background:var(--bad-bg);font-size:14px;border-radius:8px;padding:10px 12px}
.actions{display:flex;justify-content:flex-end;gap:10px;margin-top:20px}

.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--text);color:#fff;padding:10px 18px;border-radius:8px;z-index:60;font-weight:500;box-shadow:0 8px 24px rgba(28,24,48,.25)}
.toast.err{background:var(--bad)}
`;