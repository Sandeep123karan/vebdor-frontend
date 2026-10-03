import { useCallback, useEffect, useMemo, useState } from "react";

/* ==========================================================
   CONFIG
========================================================== */
const API_BASE = import.meta?.env?.VITE_API_URL || "https://bmtvendorfinal.onrender.com";

// Backend: app.use("/api/nightclub-table-pricing", nightClubTablePricing.routes)
//   POST   /                -> create
//   GET    /event/:eventId  -> pricing list of one event (tableId + eventId populated)
//   PUT    /:id             -> update
//   PATCH  /:id/toggle      -> pause / resume booking
//   DELETE /:id             -> delete
const PRICING_URL = `${API_BASE}/api/nightclub-table-pricing`;
const TABLES_URL = `${API_BASE}/api/vendor/nightclub-tables`;

// Clubs ki list - jo pehla endpoint chal jaye wahi use hoga.
// Apna sahi endpoint sabse upar daal do.
const CLUBS_URLS = [
  `${API_BASE}/api/vendor/nightclubs/my-nightclubs`,
  `${API_BASE}/api/vendor/nightclubs/my`,
  `${API_BASE}/api/vendor/nightclubs/my-clubs`,
  `${API_BASE}/api/vendor/nightclubs`,
  `${API_BASE}/api/nightclubs/my-nightclubs`,
];

// Events ki list (nightClubEvent.routes ke hisaab se). Ye bhi ek-ek karke try hote hain.
const eventsUrls = (clubId) => [
  `${API_BASE}/api/nightclub-events/my-events`,
  `${API_BASE}/api/nightclub-events/vendor`,
  `${API_BASE}/api/nightclub-events/my`,
  `${API_BASE}/api/nightclub-events/vendor/my-events`,
  `${API_BASE}/api/nightclub-events?nightClubId=${encodeURIComponent(clubId)}`,
  `${API_BASE}/api/nightclub-events/club/${encodeURIComponent(clubId)}`,
  `${API_BASE}/api/nightclub-events/nightclub/${encodeURIComponent(clubId)}`,
];

// VendorLayout "vendorToken" use karta hai
const TOKEN_KEYS = ["vendorToken", "token", "authToken", "accessToken"];
const getToken = () => {
  for (const k of TOKEN_KEYS) {
    const v = localStorage.getItem(k);
    if (v) return v;
  }
  return "";
};

const CURRENCIES = ["INR", "USD", "EUR", "AED", "GBP"];

const EMPTY_FORM = {
  tableId: "",
  price: "",
  minimumSpend: 0,
  currency: "INR",
  minimumPersons: 1,
  maximumPersons: "",
  totalQuantity: 1,
  isActive: true,
};

/* ==========================================================
   HELPERS
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

// response se array nikalta hai; array na mile to null
const extractList = (d) => {
  const c = d?.data ?? d?.events ?? d?.nightClubs ?? d?.nightclubs ?? d?.clubs ?? d;
  if (Array.isArray(c)) return c;
  if (Array.isArray(c?.data)) return c.data;
  if (Array.isArray(c?.events)) return c.events;
  if (Array.isArray(c?.nightClubs)) return c.nightClubs;
  return null;
};

const idOf = (v) => String(v?._id || v || "");

const money = (n, currency = "INR") => {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(Number(n) || 0);
  } catch {
    return `${currency} ${Number(n) || 0}`;
  }
};

const fmtDate = (d) => {
  if (!d) return "";
  const x = new Date(d);
  return isNaN(x) ? "" : x.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const eventLabel = (e) =>
  [e.title || e.name || e._id, fmtDate(e.eventDate)].filter(Boolean).join(" – ");

const cap = (s = "") => s.charAt(0).toUpperCase() + s.slice(1);

const statusOf = (p) => {
  if (!p.isActive) return { key: "disabled", label: "Disabled", cls: "off" };
  if (p.isSoldOut || p.availableQuantity <= 0) return { key: "soldout", label: "Sold out", cls: "bad" };
  if (!p.isBookable) return { key: "paused", label: "Booking paused", cls: "warn" };
  return { key: "open", label: "Open for booking", cls: "good" };
};

/* ==========================================================
   MAIN COMPONENT
========================================================== */
export default function NightclubTablePricing({ initialClubId = "", initialEventId = "" }) {
  const [clubs, setClubs] = useState([]);
  const [clubsNote, setClubsNote] = useState("");
  const [clubId, setClubId] = useState(initialClubId);

  const [events, setEvents] = useState([]);
  const [eventsFailed, setEventsFailed] = useState(false);
  const [eventId, setEventId] = useState(initialEventId);

  const [clubTables, setClubTables] = useState([]);
  const [pricing, setPricing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [modal, setModal] = useState(null); // { mode: "create" | "edit", item? }
  const [confirm, setConfirm] = useState(null); // pricing to delete

  const notify = (message, kind = "ok") => {
    setToast({ message, kind });
    setTimeout(() => setToast(null), 3200);
  };

  /* ---------- clubs ---------- */
  useEffect(() => {
    let alive = true;
    (async () => {
      let lastErr = "";
      for (const url of CLUBS_URLS) {
        try {
          const list = extractList(await api(url));
          if (!list) continue;
          if (!alive) return;
          setClubs(list);
          setClubsNote("");
          if (!initialClubId && list.length) setClubId(list[0]._id);
          return;
        } catch (e) {
          lastErr = e.message;
        }
      }
      if (alive) {
        setClubs([]);
        setClubsNote(
          getToken()
            ? `Clubs list load nahi hui (${lastErr}). Club ID paste karo ya CLUBS_URLS sahi karo.`
            : "Token nahi mila. Pehle vendor login karo."
        );
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- events + tables of the selected club ---------- */
  useEffect(() => {
    setEvents([]);
    setClubTables([]);
    setPricing([]);
    setEventsFailed(false);
    if (!initialEventId) setEventId("");
    if (!clubId) return;

    let alive = true;

    (async () => {
      for (const url of eventsUrls(clubId)) {
        try {
          const list = extractList(await api(url));
          if (!list) continue;
          const mine = list.filter(
            (e) => !e.nightClubId || idOf(e.nightClubId) === String(clubId)
          );
          if (!alive) return;
          setEvents(mine);
          setEventsFailed(false);
          if (mine.length && !initialEventId) setEventId(mine[0]._id);
          return;
        } catch {
          /* next url */
        }
      }
      if (alive) setEventsFailed(true);
    })();

    api(`${TABLES_URL}/my-tables?nightClubId=${encodeURIComponent(clubId)}`)
      .then((d) => alive && setClubTables(d.data || []))
      .catch(() => alive && setClubTables([]));

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clubId]);

  /* ---------- pricing ---------- */
  const loadPricing = useCallback(async () => {
    if (!eventId) {
      setPricing([]);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const d = await api(`${PRICING_URL}/event/${encodeURIComponent(eventId)}`);
      setPricing(d.data || []);
    } catch (e) {
      setError(e.message);
      setPricing([]);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadPricing();
  }, [loadPricing]);

  /* ---------- actions ---------- */
  const savePricing = async (form, existing) => {
    const base = {
      price: Number(form.price),
      minimumSpend: Number(form.minimumSpend || 0),
      currency: form.currency,
      minimumPersons: Number(form.minimumPersons || 1),
      maximumPersons: Number(form.maximumPersons),
      totalQuantity: Number(form.totalQuantity || 1),
    };

    if (existing) {
      await api(`${PRICING_URL}/${existing._id}`, {
        method: "PUT",
        body: JSON.stringify({ ...base, isActive: !!form.isActive }),
      });
      notify("Pricing updated");
    } else {
      await api(PRICING_URL, {
        method: "POST",
        body: JSON.stringify({ ...base, nightClubId: clubId, eventId, tableId: form.tableId }),
      });
      notify("Pricing added");
    }
    setModal(null);
    loadPricing();
  };

  const togglePricing = async (p) => {
    try {
      const d = await api(`${PRICING_URL}/${p._id}/toggle`, { method: "PATCH" });
      notify(d.message || "Updated");
      loadPricing();
    } catch (e) {
      notify(e.message, "err");
    }
  };

  const deletePricing = async () => {
    try {
      await api(`${PRICING_URL}/${confirm._id}`, { method: "DELETE" });
      notify("Pricing deleted");
    } catch (e) {
      notify(e.message, "err");
    }
    setConfirm(null);
    loadPricing();
  };

  /* ---------- derived ---------- */
  const pricedTableIds = useMemo(
    () => new Set(pricing.map((p) => idOf(p.tableId))),
    [pricing]
  );

  const freeTables = useMemo(
    () => clubTables.filter((t) => t.isActive && !pricedTableIds.has(String(t._id))),
    [clubTables, pricedTableIds]
  );

  const stats = useMemo(() => {
    const live = pricing.filter((p) => p.isActive);
    return {
      priced: pricing.length,
      open: pricing.filter((p) => statusOf(p).key === "open").length,
      left: live.reduce((s, p) => s + (p.availableQuantity || 0), 0),
      booked: live.reduce((s, p) => s + (p.bookedQuantity || 0), 0),
    };
  }, [pricing]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return pricing.filter((p) => {
      if (statusFilter !== "all" && statusOf(p).key !== statusFilter) return false;
      if (!q) return true;
      const t = p.tableId || {};
      return [t.tableNumber, t.tableName, t.section, t.floor]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [pricing, search, statusFilter]);

  const canAdd = !!clubId && !!eventId;

  /* ======================================================== */
  return (
    <div className="ntp">
      <style>{CSS}</style>

      <header className="ntp-head">
        <div>
          <h1>Table pricing</h1>
          <p>Set the price and number of tables guests can book for each event.</p>
        </div>
        <button className="btn primary" disabled={!canAdd} onClick={() => setModal({ mode: "create" })}>
          Add pricing
        </button>
      </header>

      <div className="ntp-pickers">
        <div className="pick">
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
        </div>

        <div className="pick">
          <label htmlFor="event">Event</label>
          {events.length > 0 ? (
            <select id="event" value={eventId} onChange={(e) => setEventId(e.target.value)}>
              {events.map((e) => (
                <option key={e._id} value={e._id}>
                  {eventLabel(e)}
                </option>
              ))}
            </select>
          ) : (
            <input
              id="event"
              disabled={!clubId}
              placeholder={clubId ? "Paste your event ID" : "Choose a club first"}
              value={eventId}
              onChange={(e) => setEventId(e.target.value.trim())}
            />
          )}
        </div>

        {clubsNote && <p className="note">{clubsNote}</p>}
        {clubId && eventsFailed && (
          <p className="note">
            Events ki list load nahi hui. Event ID paste karo ya file ke upar eventsUrls sahi karo.
          </p>
        )}
        {clubId && !eventsFailed && events.length === 0 && (
          <p className="note info">
            Is club mein abhi koi event nahi mila. Pehle "Manage Events" mein event banao.
          </p>
        )}
      </div>

      <section className="ntp-stats">
        <Stat label="Tables priced" value={stats.priced} />
        <Stat label="Open for booking" value={stats.open} />
        <Stat label="Units left" value={stats.left} />
        <Stat label="Units booked" value={stats.booked} />
      </section>

      <div className="ntp-filters">
        <input
          type="search"
          placeholder="Search by table number, name, section or floor"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="open">Open for booking</option>
          <option value="paused">Booking paused</option>
          <option value="soldout">Sold out</option>
          <option value="disabled">Disabled</option>
        </select>
      </div>

      {!clubId ? (
        <Empty title="Choose a night club" text="Select a club above to price its tables." />
      ) : !eventId ? (
        <Empty title="Choose an event" text="Table prices are set separately for every event." />
      ) : loading ? (
        <div className="ntp-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card skeleton" />
          ))}
        </div>
      ) : error ? (
        <Empty
          title="Couldn't load pricing"
          text={error}
          action={<button className="btn" onClick={loadPricing}>Try again</button>}
        />
      ) : pricing.length === 0 ? (
        <Empty
          title="No prices set for this event"
          text={
            clubTables.length === 0
              ? "This club has no tables yet. Add tables first in the Tables section."
              : "Add a price to a table to start taking bookings for this event."
          }
          action={
            clubTables.length > 0 && (
              <button className="btn primary" onClick={() => setModal({ mode: "create" })}>
                Add pricing
              </button>
            )
          }
        />
      ) : visible.length === 0 ? (
        <Empty title="No matching tables" text="Try a different search or clear the filter." />
      ) : (
        <div className="ntp-grid">
          {visible.map((p) => (
            <PricingCard
              key={p._id}
              p={p}
              onEdit={() => setModal({ mode: "edit", item: p })}
              onToggle={() => togglePricing(p)}
              onDelete={() => setConfirm(p)}
            />
          ))}
        </div>
      )}

      {modal && (
        <PricingModal
          mode={modal.mode}
          item={modal.item}
          freeTables={freeTables}
          onClose={() => setModal(null)}
          onSave={savePricing}
        />
      )}

      {confirm && (
        <Dialog
          small
          onClose={() => setConfirm(null)}
          title={`Delete price for table ${confirm.tableId?.tableNumber ?? ""}?`}
        >
          <p className="muted">
            This table won't be bookable for this event any more. You can add the price again later.
          </p>
          <div className="actions">
            <button className="btn" onClick={() => setConfirm(null)}>Keep price</button>
            <button className="btn danger" onClick={deletePricing}>Delete price</button>
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
      {action || null}
    </div>
  );
}

function PricingCard({ p, onEdit, onToggle, onDelete }) {
  const t = p.tableId || {};
  const st = statusOf(p);
  const where = [t.floor, t.section].filter(Boolean).join(", ");
  const total = p.totalQuantity || 0;
  const left = Math.max(p.availableQuantity || 0, 0);
  const pct = total ? Math.round((left / total) * 100) : 0;

  return (
    <article className={`card ${p.isActive ? "" : "off"}`}>
      <div className="card-top">
        <div className="num">{t.tableNumber ?? "—"}</div>
        {t.tableType && <span className={`badge ${t.tableType}`}>{cap(t.tableType)}</span>}
      </div>

      <h3>{t.tableName || (t.tableNumber ? `Table ${t.tableNumber}` : "Table removed")}</h3>
      {where && <p className="muted">{where}</p>}

      <div className="price">{money(p.price, p.currency)}</div>
      {p.minimumSpend > 0 && (
        <p className="muted">Minimum spend {money(p.minimumSpend, p.currency)}</p>
      )}
      <p className="muted">
        {p.minimumPersons}–{p.maximumPersons} guests per booking
      </p>

      <div className="qty">
        <div className="qty-row">
          <span>{left} of {total} left</span>
          <span>{p.bookedQuantity || 0} booked</span>
        </div>
        <div className="bar" aria-hidden="true">
          <i style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className={`status ${st.cls}`}>{st.label}</div>

      <div className="card-actions">
        <button className="btn sm" onClick={onEdit}>Edit</button>
        {p.isActive && (
          <button className="btn sm" onClick={onToggle}>
            {p.isBookable ? "Pause booking" : "Resume booking"}
          </button>
        )}
        <button className="btn sm danger-ghost" onClick={onDelete}>Delete</button>
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
      <div className={`dialog ${small ? "small" : ""}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="dialog-head">
          <h2>{title}</h2>
          <button className="x" onClick={onClose} aria-label="Close">×</button>
        </div>
        {children}
      </div>
    </div>
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
   CREATE / EDIT FORM
========================================================== */
function PricingModal({ mode, item, freeTables, onClose, onSave }) {
  const editing = mode === "edit";
  const table = editing ? item.tableId || {} : null;

  const [form, setForm] = useState(() =>
    editing
      ? {
          tableId: idOf(item.tableId),
          price: item.price ?? "",
          minimumSpend: item.minimumSpend ?? 0,
          currency: item.currency || "INR",
          minimumPersons: item.minimumPersons ?? 1,
          maximumPersons: item.maximumPersons ?? "",
          totalQuantity: item.totalQuantity ?? 1,
          isActive: item.isActive !== false,
        }
      : EMPTY_FORM
  );
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");

  const selected = editing ? table : freeTables.find((t) => String(t._id) === form.tableId);
  const tableCapacity = selected?.capacity;

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const pickTable = (id) => {
    const t = freeTables.find((x) => String(x._id) === id);
    setForm((f) => ({
      ...f,
      tableId: id,
      minimumPersons: t?.minimumPersons || 1,
      maximumPersons: t ? t.maximumPersons || t.capacity : "",
    }));
    setErrors((e) => ({ ...e, tableId: undefined }));
  };

  const validate = () => {
    const e = {};
    const price = Number(form.price);
    const spend = Number(form.minimumSpend || 0);
    const min = Number(form.minimumPersons || 1);
    const max = Number(form.maximumPersons);
    const qty = Number(form.totalQuantity || 1);

    if (!form.tableId) e.tableId = "Choose a table";
    if (form.price === "" || isNaN(price) || price < 0) e.price = "Enter a price (0 or more)";
    if (isNaN(spend) || spend < 0) e.minimumSpend = "Can't be negative";
    if (min < 1) e.minimumPersons = "Minimum is 1";
    if (!max || max < 1) e.maximumPersons = "Enter maximum guests";
    else if (tableCapacity && max > tableCapacity) e.maximumPersons = `Table seats only ${tableCapacity}`;
    if (!e.minimumPersons && !e.maximumPersons && min > max) e.minimumPersons = "Can't be more than maximum";
    if (qty < 1) e.totalQuantity = "At least 1";
    else if (editing && qty < (item.bookedQuantity || 0))
      e.totalQuantity = `${item.bookedQuantity} already booked`;

    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setApiError("");
    try {
      await onSave(form, editing ? item : null);
    } catch (e) {
      setApiError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      title={editing ? `Edit price for table ${table.tableNumber ?? ""}` : "Add table pricing"}
      onClose={onClose}
    >
      <form onSubmit={submit} noValidate>
        <div className="form-grid">
          {editing ? (
            <Field label="Table" full>
              <input
                disabled
                value={`${table.tableNumber ?? ""}${table.tableName ? ` – ${table.tableName}` : ""}`}
              />
            </Field>
          ) : (
            <Field
              label="Table *"
              full
              error={errors.tableId}
              hint={freeTables.length === 0 ? "Every active table already has a price for this event." : ""}
            >
              <select value={form.tableId} onChange={(e) => pickTable(e.target.value)}>
                <option value="">Select a table</option>
                {freeTables.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.tableNumber}
                    {t.tableName ? ` – ${t.tableName}` : ""} (seats {t.capacity})
                  </option>
                ))}
              </select>
            </Field>
          )}

          <Field label="Price *" error={errors.price}>
            <input type="number" min="0" value={form.price} onChange={(e) => set("price", e.target.value)} />
          </Field>
          <Field label="Currency">
            <select value={form.currency} onChange={(e) => set("currency", e.target.value)}>
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>

          <Field label="Minimum spend" error={errors.minimumSpend} hint="Leave 0 if there is none">
            <input
              type="number"
              min="0"
              value={form.minimumSpend}
              onChange={(e) => set("minimumSpend", e.target.value)}
            />
          </Field>
          <Field
            label="Tables available *"
            error={errors.totalQuantity}
            hint="How many of this table can be booked"
          >
            <input
              type="number"
              min="1"
              value={form.totalQuantity}
              onChange={(e) => set("totalQuantity", e.target.value)}
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
          <Field label="Maximum guests *" error={errors.maximumPersons}>
            <input
              type="number"
              min="1"
              value={form.maximumPersons}
              onChange={(e) => set("maximumPersons", e.target.value)}
            />
          </Field>
        </div>

        {editing && (
          <label className="check active-check">
            <input
              type="checkbox"
              checked={!!form.isActive}
              onChange={(e) => set("isActive", e.target.checked)}
            />
            Active for this event
          </label>
        )}

        {apiError && (
          <div className="form-error" role="alert">
            {apiError}
          </div>
        )}

        <div className="actions">
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button
            type="submit"
            className="btn primary"
            disabled={saving || (!editing && freeTables.length === 0)}
          >
            {saving ? "Saving…" : editing ? "Save changes" : "Add pricing"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

/* ==========================================================
   STYLES  (white theme)
========================================================== */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@500;700&family=Figtree:wght@400;500;600&display=swap');

.ntp{
  --bg:#ffffff; --panel:#ffffff; --soft:#f5f4f9; --line:#e4e1ee;
  --text:#1c1830; --muted:#6b657f;
  --accent:#5b3fd9; --accent-dark:#4a31b8; --accent-soft:#ece8fb;
  --good:#1a8a5a; --good-bg:#e5f6ee;
  --warn:#a76a00; --warn-bg:#fff3d9;
  --bad:#c42b46;  --bad-bg:#fdeaee;
  font-family:'Figtree',system-ui,sans-serif; color:var(--text); background:var(--bg);
  min-height:100vh; padding:32px clamp(16px,4vw,48px); box-sizing:border-box;
}
.ntp *{box-sizing:border-box}
.ntp h1,.ntp h2,.ntp h3{font-family:'Bricolage Grotesque',system-ui,sans-serif;margin:0}
.ntp-head{display:flex;justify-content:space-between;align-items:flex-end;gap:16px;flex-wrap:wrap;margin-bottom:24px}
.ntp-head h1{font-size:clamp(28px,4vw,40px);font-weight:700}
.ntp-head p{margin:6px 0 0;color:var(--muted)}

.ntp-pickers{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px}
@media(max-width:700px){.ntp-pickers{grid-template-columns:1fr}}
.pick{display:flex;flex-direction:column;gap:6px}
.pick label{color:var(--muted);font-size:14px}
.note{grid-column:1/-1;margin:0;font-size:13px;color:var(--warn);background:var(--warn-bg);border-radius:8px;padding:8px 12px}
.note.info{color:var(--accent-dark);background:var(--accent-soft)}

.ntp input,.ntp select,.ntp textarea{
  background:#fff;border:1px solid var(--line);color:var(--text);border-radius:8px;
  padding:10px 12px;font:inherit;width:100%;
}
.ntp input:disabled{background:var(--soft);color:var(--muted)}
.ntp input::placeholder{color:#a9a4ba}
.ntp input:focus,.ntp select:focus,.ntp button:focus-visible{outline:2px solid var(--accent);outline-offset:1px}

.ntp-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:20px}
.stat{background:var(--soft);border-radius:10px;padding:14px 16px;display:flex;flex-direction:column;gap:2px}
.stat strong{font-family:'Bricolage Grotesque',sans-serif;font-size:28px;font-weight:700}
.stat span{color:var(--muted);font-size:13px}

.ntp-filters{display:grid;grid-template-columns:2fr 1fr;gap:10px;margin-bottom:20px}
@media(max-width:700px){.ntp-filters{grid-template-columns:1fr}}

.ntp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px}
.card{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:16px;display:flex;flex-direction:column;gap:6px}
.card.off{background:var(--soft)}
.card.off h3,.card.off .num,.card.off .price{color:var(--muted)}
.card h3{font-size:18px;margin-top:6px}
.card p{margin:0}
.card-top{display:flex;justify-content:space-between;align-items:center}
.num{font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:22px;background:var(--soft);border-radius:8px;padding:4px 12px}
.badge{font-size:12px;font-weight:600;padding:3px 10px;border-radius:99px;background:var(--soft);color:var(--muted)}
.badge.vip,.badge.premium{background:var(--accent);color:#fff}
.badge.private{background:var(--accent-soft);color:var(--accent-dark)}
.muted{color:var(--muted);font-size:14px}
.price{font-family:'Bricolage Grotesque',sans-serif;font-size:26px;font-weight:700;margin-top:6px}

.qty{margin-top:8px}
.qty-row{display:flex;justify-content:space-between;font-size:13px;color:var(--muted);margin-bottom:6px}
.bar{height:6px;background:var(--soft);border-radius:99px;overflow:hidden}
.bar i{display:block;height:100%;background:var(--accent);border-radius:99px}

.status{font-size:12px;font-weight:600;margin-top:8px;align-self:flex-start;padding:3px 10px;border-radius:99px}
.status.good{color:var(--good);background:var(--good-bg)}
.status.warn{color:var(--warn);background:var(--warn-bg)}
.status.bad{color:var(--bad);background:var(--bad-bg)}
.status.off{color:var(--muted);background:var(--line)}
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

.skeleton{min-height:220px;background:linear-gradient(90deg,var(--soft),#fff,var(--soft));background-size:200% 100%;animation:ntpsh 1.4s infinite}
@keyframes ntpsh{to{background-position:-200% 0}}
@media(prefers-reduced-motion:reduce){.skeleton{animation:none}}

.empty{text-align:center;border:1px dashed var(--line);border-radius:12px;padding:56px 20px;display:flex;flex-direction:column;align-items:center;gap:8px}
.empty h3{font-size:20px}.empty p{margin:0 0 8px;color:var(--muted);max-width:46ch}

.overlay{position:fixed;inset:0;background:rgba(28,24,48,.45);display:flex;align-items:flex-start;justify-content:center;padding:4vh 16px;overflow:auto;z-index:50}
.dialog{background:#fff;border-radius:14px;width:min(620px,100%);padding:22px;box-shadow:0 20px 50px rgba(28,24,48,.25)}
.dialog.small{width:min(420px,100%)}
.dialog-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
.dialog-head h2{font-size:22px}
.x{background:none;border:0;color:var(--muted);font-size:28px;line-height:1;cursor:pointer}

.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media(max-width:560px){.form-grid{grid-template-columns:1fr}}
.field{display:flex;flex-direction:column;gap:5px}
.field.full{grid-column:1/-1}
.field>span{font-size:13px;color:var(--muted)}
.field small{color:var(--muted);font-size:12px}
.field em{color:var(--bad);font-size:12px;font-style:normal}
.field.has-error input,.field.has-error select{border-color:var(--bad)}
.check{display:flex;align-items:center;gap:8px;font-size:14px;cursor:pointer}
.check input{width:auto;accent-color:var(--accent)}
.active-check{margin-top:16px}
.form-error{margin-top:14px;color:var(--bad);background:var(--bad-bg);font-size:14px;border-radius:8px;padding:10px 12px}
.actions{display:flex;justify-content:flex-end;gap:10px;margin-top:20px}

.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--text);color:#fff;padding:10px 18px;border-radius:8px;z-index:60;font-weight:500;box-shadow:0 8px 24px rgba(28,24,48,.25)}
.toast.err{background:var(--bad)}
`;