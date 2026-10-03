import { useCallback, useEffect, useMemo, useState } from "react";
import "./ScheduleActivities.css";

/* ==================== CONFIG ==================== */

const API_ROOT = "https://bmtvendorfinal.onrender.com/api/vendor";
const SCHEDULE_API = `${API_ROOT}/activity-schedules`;
const ACTIVITY_API = `${API_ROOT}/activities`;

const MAX_RANGE_DAYS = 60;

const EMPTY_FORM = {
  activityId: "", date: "", endDate: "", startTime: "", endTime: "",
  totalSlots: "10", adult: "", child: "", infant: "", isActive: true,
};

/* ==================== HELPERS ==================== */

const pad = (n) => String(n).padStart(2, "0");

const todayStr = () => {
  const n = new Date();
  return `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}`;
};

const dateOnly = (d) => String(d || "").slice(0, 10);

const fmtDate = (d) =>
  new Date(`${dateOnly(d)}T00:00:00Z`).toLocaleDateString("en-IN", {
    weekday: "short", day: "2-digit", month: "short", year: "numeric", timeZone: "UTC",
  });

// "10:00 AM" / "10:00" / "23:30"  ->  "HH:mm" (input type=time ke liye)
const to24 = (t) => {
  const m = String(t || "").trim().match(/^(\d{1,2}):(\d{2})\s?(AM|PM)?$/i);
  if (!m) return "";
  let h = Number(m[1]);
  const mer = m[3] && m[3].toUpperCase();
  if (mer === "PM" && h < 12) h += 12;
  if (mer === "AM" && h === 12) h = 0;
  return `${pad(h)}:${m[2]}`;
};

const to12 = (t) => {
  const v = to24(t);
  if (!v) return t || "";
  let [h, m] = v.split(":").map(Number);
  const mer = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${pad(m)} ${mer}`;
};

const eachDay = (from, to) => {
  const out = [];
  let d = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${to}T00:00:00Z`);
  while (d <= end) {
    out.push(d.toISOString().slice(0, 10));
    d = new Date(d.getTime() + 86400000);
  }
  return out;
};

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const idOf = (ref) => (ref && typeof ref === "object" ? ref._id : ref);

async function request(url, options = {}) {
  const token = localStorage.getItem("vendorToken");
  const { json, ...rest } = options;
  const res = await fetch(url, {
    ...rest,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(rest.headers || {}),
    },
    ...(json !== undefined ? { body: JSON.stringify(json) } : {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    const err = new Error(data.message || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

/* ==================== MAIN ==================== */

export default function ScheduleActivities() {
  const [view, setView] = useState("list"); // list | form
  const [schedules, setSchedules] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");

  const [filters, setFilters] = useState({ activityId: "", date: "", when: "upcoming", active: "" });

  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(null); // schedule object being edited
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState(null);

  const notify = useCallback((type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3600);
  }, []);

  /* ---------- load ---------- */

  const loadAll = useCallback(async () => {
    setLoading(true);
    setListError("");
    try {
      const [s, a] = await Promise.all([request(SCHEDULE_API), request(ACTIVITY_API)]);
      setSchedules(s.data || []);
      setActivities(a.data || []);
    } catch (err) {
      setListError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  /* ---------- derived ---------- */

  // Backend sirf APPROVED activity par schedule banane deta hai
  const approvedActivities = useMemo(() => activities.filter((a) => a.status === "APPROVED"), [activities]);

  const stats = useMemo(() => {
    const today = todayStr();
    return {
      total: schedules.length,
      upcoming: schedules.filter((s) => dateOnly(s.date) >= today).length,
      active: schedules.filter((s) => s.isActive).length,
      full: schedules.filter((s) => s.availableSlots <= 0).length,
    };
  }, [schedules]);

  const filtered = useMemo(() => {
    const today = todayStr();
    return schedules.filter((s) => {
      if (filters.activityId && idOf(s.activityId) !== filters.activityId) return false;
      if (filters.date && dateOnly(s.date) !== filters.date) return false;
      if (filters.when === "upcoming" && dateOnly(s.date) < today) return false;
      if (filters.when === "past" && dateOnly(s.date) >= today) return false;
      if (filters.active && String(!!s.isActive) !== filters.active) return false;
      return true;
    });
  }, [schedules, filters]);

  /* ---------- form helpers ---------- */

  const onInput = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const onPickActivity = (e) => {
    const id = e.target.value;
    const act = activities.find((a) => a._id === id);
    setForm((p) => ({
      ...p,
      activityId: id,
      adult: act ? String(act.pricing?.adult ?? 0) : "",
      child: act ? String(act.pricing?.child ?? 0) : "",
      infant: act ? String(act.pricing?.infant ?? 0) : "",
      totalSlots: act && p.totalSlots === "10" ? String(act.maxGuests || 10) : p.totalSlots,
    }));
  };

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setView("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openEdit = (s) => {
    setEditing(s);
    setForm({
      activityId: idOf(s.activityId) || "",
      date: dateOnly(s.date), endDate: "",
      startTime: to24(s.startTime), endTime: to24(s.endTime),
      totalSlots: String(s.totalSlots),
      adult: s.pricing?.adult ?? "", child: s.pricing?.child ?? "", infant: s.pricing?.infant ?? "",
      isActive: !!s.isActive,
    });
    setFormError("");
    setView("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeForm = () => {
    setView("list");
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError("");
  };

  /* ---------- submit ---------- */

  const validate = () => {
    if (!editing && !form.activityId) return "Activity select karo";
    if (!form.date) return "Date required hai";
    if (!form.startTime) return "Start time required hai";
    if (form.endTime && form.endTime <= form.startTime) return "End time, start time ke baad ka hona chahiye";
    const slots = Number(form.totalSlots);
    if (!Number.isInteger(slots) || slots < 1) return "Total slots positive whole number hona chahiye";
    if (editing && slots < editing.bookedSlots) return `Total slots booked slots (${editing.bookedSlots}) se kam nahi ho sakte`;
    if ([form.adult, form.child, form.infant].some((v) => v !== "" && Number(v) < 0)) return "Price negative nahi ho sakta";
    if (!editing && form.endDate) {
      if (form.endDate < form.date) return "End date, start date ke baad ki honi chahiye";
      if (eachDay(form.date, form.endDate).length > MAX_RANGE_DAYS) return `Ek baar me max ${MAX_RANGE_DAYS} din ka range allowed hai`;
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const problem = validate();
    if (problem) {
      setFormError(problem);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setFormError("");
    setSaving(true);

    const pricing = {
      adult: Number(form.adult) || 0,
      child: Number(form.child) || 0,
      infant: Number(form.infant) || 0,
    };

    try {
      if (editing) {
        await request(`${SCHEDULE_API}/${editing._id}`, {
          method: "PUT",
          json: {
            date: form.date,
            startTime: form.startTime,
            endTime: form.endTime,
            totalSlots: Number(form.totalSlots),
            pricing,
            isActive: form.isActive,
          },
        });
        notify("success", "Schedule update ho gaya");
      } else {
        const dates = form.endDate ? eachDay(form.date, form.endDate) : [form.date];
        let created = 0;
        let duplicates = 0;
        let lastError = "";

        for (const d of dates) {
          try {
            await request(SCHEDULE_API, {
              method: "POST",
              json: {
                activityId: form.activityId,
                date: d,
                startTime: form.startTime,
                endTime: form.endTime || undefined,
                totalSlots: Number(form.totalSlots),
                pricing,
                isActive: form.isActive,
              },
            });
            created += 1;
          } catch (err) {
            if (err.status === 409) duplicates += 1;
            else lastError = err.message;
          }
        }

        if (created === 0) throw new Error(lastError || "Is slot ke liye schedule pehle se maujood hai");

        const extra = [duplicates && `${duplicates} duplicate skip`, lastError && "kuch dates fail hui"].filter(Boolean).join(", ");
        notify("success", `${created} schedule create hue${extra ? ` (${extra})` : ""}`);
      }
      closeForm();
      loadAll();
    } catch (err) {
      setFormError(err.message);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  };

  /* ---------- toggle / delete ---------- */

  const handleToggle = async (s) => {
    setBusyId(s._id);
    try {
      const res = await request(`${SCHEDULE_API}/${s._id}/toggle`, { method: "PATCH" });
      // toggle response me activityId populate nahi hota, isliye purana populated object rakho
      setSchedules((p) => p.map((x) => (x._id === s._id ? { ...res.data, activityId: s.activityId } : x)));
      notify("success", res.message);
    } catch (err) {
      notify("error", err.message);
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    const target = deleteTarget;
    setBusyId(target._id);
    try {
      await request(`${SCHEDULE_API}/${target._id}`, { method: "DELETE" });
      setSchedules((p) => p.filter((x) => x._id !== target._id));
      notify("success", "Schedule delete ho gaya");
      setDeleteTarget(null);
    } catch (err) {
      notify("error", err.message);
      setDeleteTarget(null);
    } finally {
      setBusyId(null);
    }
  };

  /* ==================== RENDER: FORM ==================== */

  const selectedActivity = activities.find((a) => a._id === form.activityId);
  const isRange = !editing && form.endDate && form.endDate >= form.date;
  const rangeCount = isRange ? eachDay(form.date, form.endDate).length : 1;

  const renderForm = () => (
    <form className="sch-form" onSubmit={handleSubmit} noValidate>
      <div className="sch-top">
        <div>
          <span className="sch-eyebrow">{editing ? "EDIT SCHEDULE" : "NEW SCHEDULE"}</span>
          <h2>{editing ? "Update schedule" : "Add activity schedule"}</h2>
          <p>Date, time aur slots set karo — customers isi inventory me booking karenge.</p>
        </div>
        <button type="button" className="sch-btn ghost" onClick={closeForm}>← Back to list</button>
      </div>

      {formError && <div className="sch-alert">{formError}</div>}

      <section className="sch-card">
        <h3>Activity</h3>
        {editing ? (
          <div className="sch-locked">
            {editing.activityId?.thumbnail && <img src={editing.activityId.thumbnail} alt="" />}
            <div>
              <strong>{editing.activityId?.title || "Activity"}</strong>
              <small>Activity change nahi ho sakti — naya schedule banao.</small>
            </div>
          </div>
        ) : approvedActivities.length === 0 ? (
          <div className="sch-warn">
            Schedule sirf <b>APPROVED</b> activity par ban sakta hai. Abhi koi approved activity nahi hai —
            pehle admin se activity approve karwao.
          </div>
        ) : (
          <div className="sch-field">
            <label>Select activity <i>*</i></label>
            <select name="activityId" value={form.activityId} onChange={onPickActivity}>
              <option value="">— Choose approved activity —</option>
              {approvedActivities.map((a) => (
                <option key={a._id} value={a._id}>{a.title} • {a.location?.city}</option>
              ))}
            </select>
            {selectedActivity && (
              <small>Default price adult {money(selectedActivity.pricing?.adult)} • max guests {selectedActivity.maxGuests}</small>
            )}
          </div>
        )}
      </section>

      <section className="sch-card">
        <h3>Date & time</h3>
        <div className="sch-grid">
          <div className="sch-field">
            <label>{editing ? "Date" : "Start date"} <i>*</i></label>
            <input type="date" name="date" value={form.date} min={editing ? undefined : todayStr()} onChange={onInput} />
          </div>
          {!editing && (
            <div className="sch-field">
              <label>End date <span>(optional — poore range ke liye)</span></label>
              <input type="date" name="endDate" value={form.endDate} min={form.date || todayStr()} onChange={onInput} />
              {isRange && <small>{rangeCount} din ke schedule ek saath banenge</small>}
            </div>
          )}
          <div className="sch-field">
            <label>Start time <i>*</i></label>
            <input type="time" name="startTime" value={form.startTime} onChange={onInput} />
          </div>
          <div className="sch-field">
            <label>End time</label>
            <input type="time" name="endTime" value={form.endTime} onChange={onInput} />
          </div>
        </div>
      </section>

      <section className="sch-card">
        <h3>Slots & pricing</h3>
        <div className="sch-grid four">
          <div className="sch-field">
            <label>Total slots <i>*</i></label>
            <input type="number" min="1" name="totalSlots" value={form.totalSlots} onChange={onInput} />
            {editing && <small>Booked: {editing.bookedSlots}</small>}
          </div>
          <div className="sch-field">
            <label>Adult (₹)</label>
            <input type="number" min="0" name="adult" value={form.adult} onChange={onInput} />
          </div>
          <div className="sch-field">
            <label>Child (₹)</label>
            <input type="number" min="0" name="child" value={form.child} onChange={onInput} />
          </div>
          <div className="sch-field">
            <label>Infant (₹)</label>
            <input type="number" min="0" name="infant" value={form.infant} onChange={onInput} />
          </div>
        </div>
        <label className="sch-switch">
          <input type="checkbox" name="isActive" checked={form.isActive} onChange={onInput} />
          <span>Schedule is active (bookable)</span>
        </label>
      </section>

      <div className="sch-actions">
        <button type="button" className="sch-btn ghost" onClick={closeForm} disabled={saving}>Cancel</button>
        <button
          type="submit" className="sch-btn primary"
          disabled={saving || (!editing && approvedActivities.length === 0)}
        >
          {saving ? "Saving..." : editing ? "Update Schedule" : isRange ? `Create ${rangeCount} Schedules` : "Create Schedule"}
        </button>
      </div>
    </form>
  );

  /* ==================== RENDER: LIST ==================== */

  const renderList = () => (
    <>
      <div className="sch-top">
        <div>
          <span className="sch-eyebrow">ACTIVITIES</span>
          <h2>Activity schedules</h2>
          <p>Har activity ke liye date, time slot aur available seats manage karo.</p>
        </div>
        <button className="sch-btn primary" onClick={openCreate}>＋ Add Schedule</button>
      </div>

      <div className="sch-stats">
        <article><span>Total</span><strong>{stats.total}</strong></article>
        <article className="blue"><span>Upcoming</span><strong>{stats.upcoming}</strong></article>
        <article className="green"><span>Active</span><strong>{stats.active}</strong></article>
        <article className="red"><span>Fully booked</span><strong>{stats.full}</strong></article>
      </div>

      <div className="sch-filters">
        <select value={filters.activityId} onChange={(e) => setFilters((p) => ({ ...p, activityId: e.target.value }))}>
          <option value="">All activities</option>
          {activities.map((a) => <option key={a._id} value={a._id}>{a.title}</option>)}
        </select>
        <input type="date" value={filters.date} onChange={(e) => setFilters((p) => ({ ...p, date: e.target.value }))} />
        <select value={filters.when} onChange={(e) => setFilters((p) => ({ ...p, when: e.target.value }))}>
          <option value="upcoming">Upcoming</option>
          <option value="past">Past</option>
          <option value="">All dates</option>
        </select>
        <select value={filters.active} onChange={(e) => setFilters((p) => ({ ...p, active: e.target.value }))}>
          <option value="">Active & inactive</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        {(filters.activityId || filters.date || filters.active || filters.when !== "upcoming") && (
          <button className="sch-btn small ghost" onClick={() => setFilters({ activityId: "", date: "", when: "upcoming", active: "" })}>
            Reset
          </button>
        )}
      </div>

      {loading ? (
        <div className="sch-state"><div className="sch-spinner" /><p>Loading schedules...</p></div>
      ) : listError ? (
        <div className="sch-state">
          <p className="sch-err">{listError}</p>
          <button className="sch-btn ghost" onClick={loadAll}>Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="sch-state">
          <div className="sch-empty-icon">◫</div>
          <h3>{schedules.length === 0 ? "Abhi koi schedule nahi hai" : "Koi schedule match nahi hua"}</h3>
          <p>{schedules.length === 0 ? "Pehla schedule add karke bookings start karo." : "Filters change karke dekho."}</p>
          {schedules.length === 0 && <button className="sch-btn primary" onClick={openCreate}>＋ Add Schedule</button>}
        </div>
      ) : (
        <div className="sch-table-wrap">
          <table className="sch-table">
            <thead>
              <tr>
                <th>Activity</th><th>Date</th><th>Time</th><th>Slots</th><th>Price (A / C / I)</th><th>Status</th><th className="r">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const busy = busyId === s._id;
                const pct = Math.min(100, Math.round((s.bookedSlots / s.totalSlots) * 100));
                const isFull = s.availableSlots <= 0;
                const isPast = dateOnly(s.date) < todayStr();
                return (
                  <tr key={s._id} className={!s.isActive ? "off" : ""}>
                    <td>
                      <div className="sch-act">
                        {s.activityId?.thumbnail || s.activityId?.images?.[0]
                          ? <img src={s.activityId.thumbnail || s.activityId.images[0]} alt="" />
                          : <span className="sch-noimg">◆</span>}
                        <div>
                          <strong>{s.activityId?.title || "Deleted activity"}</strong>
                          <small>{s.activityId?.location?.city}</small>
                        </div>
                      </div>
                    </td>
                    <td>{fmtDate(s.date)}{isPast && <em className="sch-past">Past</em>}</td>
                    <td>{to12(s.startTime)}{s.endTime ? ` – ${to12(s.endTime)}` : ""}</td>
                    <td>
                      <div className="sch-slots">
                        <div className="sch-bar"><span className={isFull ? "full" : ""} style={{ width: `${pct}%` }} /></div>
                        <small>{isFull ? "Fully booked" : `${s.availableSlots} left`} • {s.bookedSlots}/{s.totalSlots}</small>
                      </div>
                    </td>
                    <td className="sch-price">{money(s.pricing?.adult)} / {money(s.pricing?.child)} / {money(s.pricing?.infant)}</td>
                    <td><span className={`sch-pill ${s.isActive ? "on" : "offp"}`}>{s.isActive ? "Active" : "Inactive"}</span></td>
                    <td className="r">
                      <div className="sch-row-btns">
                        <button className="sch-btn small" disabled={busy} onClick={() => openEdit(s)}>Edit</button>
                        <button className="sch-btn small ghost" disabled={busy} onClick={() => handleToggle(s)}>
                          {s.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          className="sch-btn small danger" disabled={busy || s.bookedSlots > 0}
                          title={s.bookedSlots > 0 ? "Bookings maujood hain — delete nahi ho sakta" : "Delete"}
                          onClick={() => setDeleteTarget(s)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );

  return (
    <div className="sch-page">
      {view === "form" ? renderForm() : renderList()}

      {deleteTarget && (
        <div className="sch-modal-bg" onClick={() => !busyId && setDeleteTarget(null)}>
          <div className="sch-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete schedule?</h3>
            <p>
              <b>{deleteTarget.activityId?.title}</b> — {fmtDate(deleteTarget.date)}, {to12(deleteTarget.startTime)}.
              Ye undo nahi hoga.
            </p>
            <div className="sch-actions">
              <button className="sch-btn ghost" disabled={!!busyId} onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="sch-btn danger solid" disabled={!!busyId} onClick={confirmDelete}>
                {busyId ? "Deleting..." : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`sch-toast ${toast.type}`}>{toast.message}</div>}
    </div>
  );
}