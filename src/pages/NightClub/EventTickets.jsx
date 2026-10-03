import { useEffect, useMemo, useState } from "react";
import "./EventTickets.css";

const API_BASE = "https://bmtvendorfinal.onrender.com/api/nightclub-event-tickets";
const EVENT_API = "https://bmtvendorfinal.onrender.com/api/nightclub-events";
const SELECTED_KEY = "bmtTicketEventId";

const TICKET_TYPES = [
  { value: "stag", label: "Stag" },
  { value: "couple", label: "Couple" },
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "vip", label: "VIP" },
  { value: "table", label: "Table" },
  { value: "booth", label: "Booth" },
  { value: "other", label: "Other" },
];

const TYPE_NAMES = {
  stag: "Stag Entry",
  couple: "Couple Entry",
  female: "Female Entry",
  male: "Male Entry",
  vip: "VIP Pass",
  table: "Table Booking",
  booth: "Booth Booking",
  other: "",
};

const TYPE_PRICE_KEY = {
  stag: "stagEntryPrice",
  couple: "coupleEntryPrice",
  female: "femaleEntryPrice",
  male: "maleEntryPrice",
  vip: "vipPrice",
};

const emptyTicket = {
  name: "",
  ticketType: "stag",
  description: "",
  price: "",
  totalQuantity: "",
  personsPerTicket: 1,
  minimumAge: 18,
  saleStartDate: "",
  saleEndDate: "",
};

/* ---------------- API ---------------- */

const apiRequest = async (url, options = {}) => {
  const headers = {
    Authorization: `Bearer ${localStorage.getItem("vendorToken")}`,
    ...(options.headers || {}),
  };
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
};

/* ---------------- helpers ---------------- */

const toDateInput = (d) => (d ? new Date(d).toISOString().split("T")[0] : "");

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit", month: "short", year: "numeric", timeZone: "UTC",
      })
    : "—";

const typeLabel = (value) => TICKET_TYPES.find((t) => t.value === value)?.label || value;

// Suggest name / price / persons / quantity from the selected event
const suggest = (type, ev) => {
  const out = { name: TYPE_NAMES[type] || "", price: "", persons: 1, quantity: "" };
  const priceKey = TYPE_PRICE_KEY[type];
  if (priceKey && ev?.[priceKey]) out.price = String(ev[priceKey]);
  if (type === "couple") out.persons = 2;
  if (type === "vip" && ev?.vipCapacity) out.quantity = String(ev.vipCapacity);
  return out;
};

const eventLabel = (ev) =>
  `${ev.title} — ${ev.nightClubId?.name || "Night club"} (${formatDate(ev.eventDate)})`;

/* ---------------- main ---------------- */

export default function EventTickets({ event: presetEvent, onNavigate }) {
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventId, setEventId] = useState(
    presetEvent?._id || sessionStorage.getItem(SELECTED_KEY) || ""
  );

  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [viewMode, setViewMode] = useState("list"); // list | form
  const [editingTicket, setEditingTicket] = useState(null);
  const [form, setForm] = useState({ ...emptyTicket });

  const selectedEvent = useMemo(
    () => events.find((e) => e._id === eventId) || null,
    [events, eventId]
  );

  const resetAlerts = () => { setMessage(""); setError(""); };

  /* ---------- load events ---------- */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await apiRequest(`${EVENT_API}/my-events`);
        if (cancelled) return;
        const list = Array.isArray(res?.data) ? res.data : [];
        setEvents(list);

        // keep the saved selection only if that event still exists
        setEventId((current) => {
          if (current && list.some((e) => e._id === current)) return current;
          return list.length === 1 ? list[0]._id : "";
        });
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load events");
      } finally {
        if (!cancelled) setEventsLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  /* ---------- load tickets whenever the event changes ---------- */
  const loadTickets = async (id) => {
    if (!id) { setTickets([]); return; }
    try {
      setTicketsLoading(true);
      const res = await apiRequest(`${API_BASE}/event/${id}`);
      setTickets(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      setTickets([]);
      setError(err.message || "Failed to load tickets");
    } finally {
      setTicketsLoading(false);
    }
  };

  useEffect(() => {
    setViewMode("list");
    setEditingTicket(null);
    if (eventId) sessionStorage.setItem(SELECTED_KEY, eventId);
    else sessionStorage.removeItem(SELECTED_KEY);
    loadTickets(eventId);
  }, [eventId]);

  /* ---------- derived ---------- */
  const usedTypes = tickets
    .filter((t) => t._id !== editingTicket?._id)
    .map((t) => t.ticketType);

  const totals = useMemo(
    () => ({
      types: tickets.length,
      allocated: tickets.reduce((s, t) => s + (t.totalQuantity || 0), 0),
      sold: tickets.reduce((s, t) => s + (t.soldQuantity || 0), 0),
      available: tickets.reduce((s, t) => s + (t.availableQuantity || 0), 0),
      revenue: tickets.reduce((s, t) => s + (t.soldQuantity || 0) * (t.price || 0), 0),
    }),
    [tickets]
  );

  const freeTypes = TICKET_TYPES.filter((t) => !tickets.some((x) => x.ticketType === t.value));

  /* ---------- form ---------- */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => {
      // when the type changes while adding, refresh the suggested values
      // (only the ones the vendor has not typed over)
      if (name === "ticketType" && !editingTicket) {
        const old = suggest(prev.ticketType, selectedEvent);
        const next = suggest(value, selectedEvent);
        return {
          ...prev,
          ticketType: value,
          name: !prev.name || prev.name === old.name ? next.name : prev.name,
          price: prev.price === "" || String(prev.price) === old.price ? next.price : prev.price,
          totalQuantity:
            prev.totalQuantity === "" || String(prev.totalQuantity) === old.quantity
              ? next.quantity
              : prev.totalQuantity,
          personsPerTicket:
            Number(prev.personsPerTicket) === old.persons ? next.persons : prev.personsPerTicket,
        };
      }
      return { ...prev, [name]: value };
    });
  };

  const openAdd = () => {
    if (!selectedEvent) return setError("Please select an event first");
    if (freeTypes.length === 0) {
      return setError("All ticket types are already created for this event. Edit an existing ticket instead.");
    }

    const type = freeTypes[0].value;
    const s = suggest(type, selectedEvent);

    setEditingTicket(null);
    setForm({
      ...emptyTicket,
      ticketType: type,
      name: s.name,
      price: s.price,
      totalQuantity: s.quantity,
      personsPerTicket: s.persons,
      minimumAge: selectedEvent.minimumAge || 18,
      saleEndDate: toDateInput(selectedEvent.eventDate),
    });
    setViewMode("form");
    resetAlerts();
  };

  const openEdit = (ticket) => {
    setEditingTicket(ticket);
    setForm({
      ...emptyTicket,
      name: ticket.name || "",
      ticketType: ticket.ticketType,
      description: ticket.description || "",
      price: ticket.price ?? "",
      totalQuantity: ticket.totalQuantity ?? "",
      personsPerTicket: ticket.personsPerTicket ?? 1,
      minimumAge: ticket.minimumAge ?? 18,
      saleStartDate: toDateInput(ticket.saleStartDate),
      saleEndDate: toDateInput(ticket.saleEndDate),
    });
    setViewMode("form");
    resetAlerts();
  };

  const closeForm = () => {
    setViewMode("list");
    setEditingTicket(null);
    setForm({ ...emptyTicket });
  };

  /* ---------- CREATE / UPDATE ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    resetAlerts();

    if (!selectedEvent) return setError("Please select an event first");

    if (form.saleStartDate && form.saleEndDate && form.saleEndDate < form.saleStartDate) {
      return setError("Sale end date cannot be before sale start date");
    }

    const payload = {
      name: form.name.trim(),
      ticketType: form.ticketType,
      description: form.description,
      price: Number(form.price),
      totalQuantity: Number(form.totalQuantity),
      personsPerTicket: Number(form.personsPerTicket || 1),
      minimumAge: Number(form.minimumAge || 18),
      saleStartDate: form.saleStartDate || "",
      saleEndDate: form.saleEndDate || "",
    };

    try {
      setSaving(true);

      if (editingTicket?._id) {
        await apiRequest(`${API_BASE}/${editingTicket._id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setMessage("Ticket updated successfully");
      } else {
        await apiRequest(API_BASE, {
          method: "POST",
          body: JSON.stringify({ ...payload, eventId: selectedEvent._id }),
        });
        setMessage("Ticket created successfully");
      }

      await loadTickets(selectedEvent._id);
      closeForm();
    } catch (err) {
      setError(err.message || "Failed to save ticket");
    } finally {
      setSaving(false);
    }
  };

  /* ---------- activate / deactivate ---------- */
  const toggleStatus = async (ticket) => {
    try {
      setActionLoading(`toggle-${ticket._id}`); resetAlerts();
      const res = await apiRequest(`${API_BASE}/${ticket._id}/toggle`, { method: "PATCH" });
      setMessage(res.message || "Ticket status updated");
      await loadTickets(eventId);
    } catch (err) {
      setError(err.message || "Failed to update ticket");
    } finally {
      setActionLoading("");
    }
  };

  /* ---------- DELETE ---------- */
  const handleDelete = async (ticket) => {
    if (!window.confirm(`Delete ticket "${ticket.name}"?`)) return;
    try {
      setActionLoading(`delete-${ticket._id}`); resetAlerts();
      await apiRequest(`${API_BASE}/${ticket._id}`, { method: "DELETE" });
      setMessage("Ticket deleted successfully");
      await loadTickets(eventId);
    } catch (err) {
      setError(err.message || "Failed to delete ticket");
    } finally {
      setActionLoading("");
    }
  };

  /* ---------- render ---------- */
  return (
    <div className="et">
      {message && <div className="et-msg success">{message}</div>}
      {error && <div className="et-msg error">{error}</div>}

      {/* ============ EVENT PICKER ============ */}
      <div className="et-card">
        <div className="et-picker-head">
          <div>
            <span className="et-eyebrow">STEP 1</span>
            <h3>Select Event</h3>
            <p className="et-sub">Tickets are created for one event at a time.</p>
          </div>
        </div>

        {eventsLoading ? (
          <div className="et-loading">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="et-empty">
            <div className="et-empty-icon">🎟</div>
            <h3>No Events Found</h3>
            <p>Create an event first, then come back to add tickets.</p>
            {onNavigate && (
              <button className="et-btn" onClick={() => onNavigate("events_manage")}>
                Go to Manage Events
              </button>
            )}
          </div>
        ) : (
          <>
            <select className="et-event-select" value={eventId} onChange={(e) => setEventId(e.target.value)}>
              <option value="">-- Select an event --</option>
              {events.map((ev) => (
                <option key={ev._id} value={ev._id}>{eventLabel(ev)}</option>
              ))}
            </select>

            {selectedEvent && (
              <div className="et-event-summary">
                <div><span>Night Club</span><strong>{selectedEvent.nightClubId?.name || "—"}</strong></div>
                <div><span>Date</span><strong>{formatDate(selectedEvent.eventDate)}</strong></div>
                <div><span>Time</span><strong>{selectedEvent.startTime} – {selectedEvent.endTime}</strong></div>
                <div><span>Event Capacity</span><strong>{selectedEvent.totalCapacity}</strong></div>
                <div>
                  <span>Status</span>
                  <strong>{selectedEvent.isPublished ? "Live" : selectedEvent.status}</strong>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ============ NO EVENT SELECTED ============ */}
      {!eventsLoading && events.length > 0 && !selectedEvent && (
        <div className="et-card">
          <div className="et-empty">
            <div className="et-empty-icon">🎟</div>
            <h3>Select an event to continue</h3>
            <p>Choose an event above to view and manage its tickets.</p>
          </div>
        </div>
      )}

      {/* ============ LIST ============ */}
      {selectedEvent && viewMode === "list" && (
        <div className="et-card">
          <div className="et-toolbar">
            <div>
              <span className="et-eyebrow">STEP 2</span>
              <h3>Tickets for “{selectedEvent.title}”</h3>
            </div>
            <button className="et-btn" onClick={openAdd}>+ Add Ticket</button>
          </div>

          <div className="et-stat-grid">
            <div><span>Ticket Types</span><strong>{totals.types}</strong></div>
            <div><span>Tickets Allocated</span><strong>{totals.allocated}</strong></div>
            <div><span>Sold</span><strong>{totals.sold}</strong></div>
            <div><span>Available</span><strong>{totals.available}</strong></div>
            <div><span>Revenue</span><strong>₹{totals.revenue.toLocaleString("en-IN")}</strong></div>
          </div>

          {ticketsLoading ? (
            <div className="et-loading">Loading tickets...</div>
          ) : tickets.length === 0 ? (
            <div className="et-empty">
              <div className="et-empty-icon">🎟</div>
              <h3>No Tickets Yet</h3>
              <p>Create your first ticket type for this event.</p>
              <button className="et-btn" onClick={openAdd}>+ Add Ticket</button>
            </div>
          ) : (
            <div className="et-tickets-list">
              {tickets.map((t) => {
                const pct = t.totalQuantity ? Math.min(100, Math.round((t.soldQuantity / t.totalQuantity) * 100)) : 0;
                return (
                  <div className="et-ticket-card" key={t._id}>
                    <div className="et-ticket-main">
                      <div className="et-ticket-header">
                        <h4>{t.name}</h4>
                        <span className="et-badge-type">{typeLabel(t.ticketType)}</span>
                        {!t.isActive && <span className="et-badge inactive">INACTIVE</span>}
                        {t.isSoldOut && <span className="et-badge soldout">SOLD OUT</span>}
                      </div>
                      {t.description && <p className="et-ticket-desc">{t.description}</p>}

                      <div className="et-ticket-stats">
                        <div><span>Price</span><strong>₹{t.price}</strong></div>
                        <div><span>Total</span><strong>{t.totalQuantity}</strong></div>
                        <div><span>Sold</span><strong>{t.soldQuantity}</strong></div>
                        <div><span>Available</span><strong>{t.availableQuantity}</strong></div>
                        <div><span>Per Ticket</span><strong>{t.personsPerTicket} pax</strong></div>
                        <div><span>Min Age</span><strong>{t.minimumAge}+</strong></div>
                      </div>

                      <div className="et-progress" title={`${pct}% sold`}><i style={{ width: `${pct}%` }} /></div>

                      {(t.saleStartDate || t.saleEndDate) && (
                        <p className="et-ticket-dates">
                          Sale: {formatDate(t.saleStartDate)} – {formatDate(t.saleEndDate)}
                        </p>
                      )}
                    </div>

                    <div className="et-ticket-actions">
                      <button className="et-btn secondary" onClick={() => openEdit(t)}>Edit</button>
                      <button className="et-btn secondary" disabled={actionLoading === `toggle-${t._id}`}
                        onClick={() => toggleStatus(t)}>
                        {actionLoading === `toggle-${t._id}` ? "..." : t.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button className="et-btn danger"
                        disabled={actionLoading === `delete-${t._id}` || t.soldQuantity > 0}
                        title={t.soldQuantity > 0 ? "Tickets with bookings can't be deleted. Deactivate instead." : ""}
                        onClick={() => handleDelete(t)}>
                        {actionLoading === `delete-${t._id}` ? "..." : "Delete"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============ FORM ============ */}
      {selectedEvent && viewMode === "form" && (
        <form className="et-card et-form" onSubmit={handleSubmit}>
          <div className="et-form-head">
            <div>
              <span className="et-eyebrow">{editingTicket ? "EDIT TICKET" : "NEW TICKET"}</span>
              <h3>{editingTicket ? `Edit “${editingTicket.name}”` : "Add Ticket"}</h3>
            </div>
            <button type="button" className="et-btn secondary" onClick={closeForm}>← Back</button>
          </div>

          <div className="et-event-banner">
            <span>Event</span>
            <strong>{eventLabel(selectedEvent)}</strong>
          </div>

          <div className="et-form-grid">
            <div className="et-field">
              <label>Ticket Type *</label>
              <select name="ticketType" value={form.ticketType} onChange={handleChange} required>
                {TICKET_TYPES.map((t) => (
                  <option key={t.value} value={t.value} disabled={usedTypes.includes(t.value)}>
                    {t.label}{usedTypes.includes(t.value) ? " (already created)" : ""}
                  </option>
                ))}
              </select>
              <small>Each ticket type can be created once per event.</small>
            </div>

            <div className="et-field">
              <label>Ticket Name *</label>
              <input name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Stag Entry" />
            </div>

            <div className="et-field">
              <label>Price (₹) *</label>
              <input type="number" name="price" value={form.price} onChange={handleChange} required min="0" />
            </div>

            <div className="et-field">
              <label>Total Quantity *</label>
              <input type="number" name="totalQuantity" value={form.totalQuantity} onChange={handleChange}
                required min={editingTicket?.soldQuantity > 0 ? editingTicket.soldQuantity : 1} />
              <small>
                {editingTicket
                  ? `Can't be lower than sold (${editingTicket.soldQuantity}).`
                  : `Event capacity: ${selectedEvent.totalCapacity} • already allocated: ${totals.allocated}`}
              </small>
            </div>

            <div className="et-field">
              <label>Persons Per Ticket</label>
              <input type="number" name="personsPerTicket" value={form.personsPerTicket} onChange={handleChange} min="1" />
            </div>

            <div className="et-field">
              <label>Minimum Age</label>
              <input type="number" name="minimumAge" value={form.minimumAge} onChange={handleChange} min="0" />
            </div>

            <div className="et-field">
              <label>Sale Start Date</label>
              <input type="date" name="saleStartDate" value={form.saleStartDate} onChange={handleChange} />
            </div>

            <div className="et-field">
              <label>Sale End Date</label>
              <input type="date" name="saleEndDate" value={form.saleEndDate} min={form.saleStartDate || undefined}
                onChange={handleChange} />
            </div>

            <div className="et-field et-span">
              <label>Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows="3"
                placeholder="What's included in this ticket..." />
            </div>
          </div>

          <div className="et-form-actions">
            <button type="button" className="et-btn secondary" onClick={closeForm}>Cancel</button>
            <button type="submit" className="et-btn" disabled={saving}>
              {saving ? "Saving..." : editingTicket ? "Update Ticket" : "Create Ticket"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}