import React, { useState, useEffect, useCallback } from "react";

/* ============================================================
   HOMESTAY UNIT MANAGER
   ------------------------------------------------------------
   Drop this component into your vendor-panel React app.

   It talks directly to your existing backend routes:
     GET    /api/homestay-units?homestayId=...
     GET    /api/homestay-units/:unitId
     POST   /api/homestay-units
     PUT    /api/homestay-units/:unitId
     DELETE /api/homestay-units/:unitId
     PATCH  /api/homestay-units/:unitId/activate
     PATCH  /api/homestay-units/:unitId/deactivate
     DELETE /api/homestay-units/:unitId/images

   Set API_BASE below to wherever your Express server runs
   (e.g. "http://localhost:7000" in dev, or "" if the frontend
   is served from the same origin / behind a proxy).

   Auth: your routes use `protect` (vendor JWT). This component
   expects the vendor token to be typed in, or you can hardwire
   it from your own auth context — just replace `token` state
   with whatever you already store after vendor login.
============================================================ */

const API_BASE = "http://localhost:7000";

const UNIT_TYPES = [
  "private-room",
  "shared-room",
  "entire-property",
  "villa",
  "cottage",
  "apartment",
  "suite",
  "studio",
  "dormitory",
];

const BED_TYPES = [
  "single",
  "twin",
  "double",
  "queen",
  "king",
  "super-king",
  "bunk-bed",
  "sofa-bed",
  "floor-mattress",
  "multiple",
];

const BATHROOM_TYPES = ["private", "shared", "attached", "common"];
const INVENTORY_TYPES = ["individual-units", "shared-inventory"];

const AMENITY_TOGGLES = [
  ["wifi", "Wifi"],
  ["airConditioning", "AC"],
  ["heater", "Heater"],
  ["tv", "TV"],
  ["kitchen", "Kitchen"],
  ["balcony", "Balcony"],
  ["workDesk", "Work desk"],
  ["washingMachine", "Washing machine"],
];

const emptyForm = {
  unitName: "",
  unitType: "private-room",
  description: "",
  shortDescription: "",
  maxGuests: 2,
  adults: 2,
  children: 0,
  bedrooms: 1,
  beds: 1,
  bedType: "double",
  bathrooms: 1,
  bathroomType: "private",
  basePrice: "",
  weekendPrice: "",
  totalUnits: 1,
  inventoryType: "individual-units",
  instantBooking: true,
  refundable: true,
  wifi: true,
  airConditioning: false,
  heater: false,
  tv: false,
  kitchen: false,
  balcony: false,
  workDesk: false,
  washingMachine: false,
};

function StatusBadge({ status }) {
  const styles = {
    ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
    DRAFT: "bg-amber-50 text-amber-700 border-amber-200",
    INACTIVE: "bg-stone-100 text-stone-500 border-stone-200",
    SOLD_OUT: "bg-rose-50 text-rose-700 border-rose-200",
    SUSPENDED: "bg-rose-50 text-rose-700 border-rose-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide ${
        styles[status] || styles.DRAFT
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}

function Field({ label, children, span }) {
  return (
    <label className={`flex flex-col gap-1.5 ${span ? "sm:col-span-2" : ""}`}>
      <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 outline-none transition focus:border-[#3f6259] focus:ring-2 focus:ring-[#3f6259]/15";

export default function HomestayUnitManager({ homestayId: initialHomestayId = "" }) {
  const [homestayId, setHomestayId] = useState(initialHomestayId);
  const [token, setToken] = useState("");
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [coverFile, setCoverFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [saving, setSaving] = useState(false);

  const authHeaders = useCallback(
    (extra = {}) => ({
      Authorization: token ? `Bearer ${token}` : undefined,
      ...extra,
    }),
    [token]
  );

  const loadUnits = useCallback(async () => {
    if (!homestayId) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${API_BASE}/api/homestay-units?homestayId=${homestayId}`,
        { headers: authHeaders() }
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load units");
      }
      setUnits(data.units || []);
    } catch (err) {
      setError(err.message || "Could not reach the server");
      setUnits([]);
    } finally {
      setLoading(false);
    }
  }, [homestayId, authHeaders]);

  useEffect(() => {
    if (homestayId) loadUnits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setCoverFile(null);
    setGalleryFiles([]);
    setShowForm(true);
  };

  const openEdit = (unit) => {
    setEditingId(unit._id);
    setForm({
      ...emptyForm,
      ...unit,
    });
    setCoverFile(null);
    setGalleryFiles([]);
    setShowForm(true);
  };

  const updateField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const buildFormData = () => {
    const fd = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      fd.append(key, typeof value === "boolean" ? String(value) : value);
    });
    fd.append("homestayId", homestayId);
    if (coverFile) fd.append("coverImage", coverFile);
    galleryFiles.forEach((f) => fd.append("images", f));
    return fd;
  };

  const submitForm = async (e) => {
    e.preventDefault();
    if (!homestayId) {
      setError("Enter a homestay ID first.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const url = editingId
        ? `${API_BASE}/api/homestay-units/${editingId}`
        : `${API_BASE}/api/homestay-units`;
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: authHeaders(),
        body: buildFormData(),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Save failed");
      }
      setShowForm(false);
      await loadUnits();
    } catch (err) {
      setError(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const removeUnit = async (unitId) => {
    if (!window.confirm("Delete this unit? This cannot be undone.")) return;
    try {
      const res = await fetch(`${API_BASE}/api/homestay-units/${unitId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      setUnits((prev) => prev.filter((u) => u._id !== unitId));
    } catch (err) {
      setError(err.message || "Delete failed");
    }
  };

  const toggleActive = async (unit) => {
    const action = unit.isActive ? "deactivate" : "activate";
    try {
      const res = await fetch(
        `${API_BASE}/api/homestay-units/${unit._id}/${action}`,
        { method: "PATCH", headers: authHeaders() }
      );
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      setUnits((prev) =>
        prev.map((u) => (u._id === unit._id ? data.unit : u))
      );
    } catch (err) {
      setError(err.message || "Status update failed");
    }
  };

  return (
    <div className="min-h-full bg-[#f6f4ef] p-6 text-stone-800">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Work+Sans:wght@400;500;600&display=swap');
        .hu-serif { font-family: 'Fraunces', serif; }
        .hu-sans { font-family: 'Work Sans', sans-serif; }
      `}</style>

      <div className="hu-sans mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="hu-serif text-xs uppercase tracking-[0.2em] text-[#3f6259]">
              Vendor panel
            </p>
            <h1 className="hu-serif text-3xl font-semibold text-stone-900">
              Homestay units
            </h1>
          </div>
          <button
            onClick={openCreate}
            disabled={!homestayId}
            className="rounded-lg bg-[#3f6259] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#345149] disabled:cursor-not-allowed disabled:opacity-40"
          >
            + Add unit
          </button>
        </div>

        {/* Connection bar */}
        <div className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-stone-200 bg-white p-4">
          <Field label="Homestay ID">
            <input
              className={inputCls}
              placeholder="paste homestay _id"
              value={homestayId}
              onChange={(e) => setHomestayId(e.target.value)}
            />
          </Field>
          <Field label="Vendor token">
            <input
              className={inputCls}
              placeholder="Bearer token"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </Field>
          <button
            onClick={loadUnits}
            disabled={!homestayId || loading}
            className="h-[38px] rounded-lg border border-stone-300 px-4 text-sm font-medium text-stone-700 transition hover:bg-stone-50 disabled:opacity-40"
          >
            {loading ? "Loading…" : "Load units"}
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {/* Unit grid */}
        {units.length === 0 && !loading && (
          <div className="rounded-xl border border-dashed border-stone-300 bg-white/60 px-6 py-16 text-center">
            <p className="hu-serif text-lg text-stone-600">
              No units yet for this homestay.
            </p>
            <p className="mt-1 text-sm text-stone-500">
              Add the first room, cottage, or entire-property unit to start
              taking bookings.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {units.map((unit) => (
            <div
              key={unit._id}
              className="group overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="relative h-36 w-full bg-stone-100">
                {unit.coverImage ? (
                  <img
                    src={unit.coverImage}
                    alt={unit.unitName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-stone-400">
                    No cover image
                  </div>
                )}
                <div className="absolute right-2 top-2">
                  <StatusBadge status={unit.status} />
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="hu-serif text-base font-semibold leading-tight text-stone-900">
                    {unit.unitName}
                  </h3>
                </div>
                <p className="mt-0.5 text-xs uppercase tracking-wide text-stone-400">
                  {unit.unitType?.replace(/-/g, " ")}
                </p>

                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-500">
                  <span>👤 {unit.maxGuests} guests</span>
                  <span>🛏 {unit.beds} beds</span>
                  <span>🛁 {unit.bathrooms} bath</span>
                  <span>🏠 {unit.totalUnits} units</span>
                </div>

                <div className="mt-3 flex items-baseline gap-1">
                  <span className="hu-serif text-lg font-semibold text-[#3f6259]">
                    ₹{unit.basePrice}
                  </span>
                  <span className="text-xs text-stone-400">/ night</span>
                </div>

                <div className="mt-4 flex items-center gap-2 border-t border-stone-100 pt-3">
                  <button
                    onClick={() => openEdit(unit)}
                    className="flex-1 rounded-md border border-stone-300 px-2 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => toggleActive(unit)}
                    className="flex-1 rounded-md border border-stone-300 px-2 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50"
                  >
                    {unit.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => removeUnit(unit._id)}
                    className="rounded-md border border-rose-200 px-2 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Create / edit form */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-stone-900/40 p-4 sm:p-8">
            <div className="hu-sans w-full max-w-2xl rounded-2xl bg-[#f6f4ef] shadow-xl">
              <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
                <h2 className="hu-serif text-xl font-semibold text-stone-900">
                  {editingId ? "Edit unit" : "New unit"}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-stone-400 hover:text-stone-700"
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={submitForm}
                className="max-h-[75vh] space-y-5 overflow-y-auto px-6 py-5"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Unit name">
                    <input
                      required
                      className={inputCls}
                      value={form.unitName}
                      onChange={(e) => updateField("unitName", e.target.value)}
                    />
                  </Field>
                  <Field label="Unit type">
                    <select
                      className={inputCls}
                      value={form.unitType}
                      onChange={(e) => updateField("unitType", e.target.value)}
                    >
                      {UNIT_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t.replace(/-/g, " ")}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Description" span>
                    <textarea
                      rows={3}
                      className={inputCls}
                      value={form.description}
                      onChange={(e) =>
                        updateField("description", e.target.value)
                      }
                    />
                  </Field>

                  <Field label="Max guests">
                    <input
                      type="number"
                      min={1}
                      className={inputCls}
                      value={form.maxGuests}
                      onChange={(e) =>
                        updateField("maxGuests", e.target.value)
                      }
                    />
                  </Field>
                  <Field label="Bedrooms">
                    <input
                      type="number"
                      min={0}
                      className={inputCls}
                      value={form.bedrooms}
                      onChange={(e) =>
                        updateField("bedrooms", e.target.value)
                      }
                    />
                  </Field>
                  <Field label="Beds">
                    <input
                      type="number"
                      min={1}
                      className={inputCls}
                      value={form.beds}
                      onChange={(e) => updateField("beds", e.target.value)}
                    />
                  </Field>
                  <Field label="Bed type">
                    <select
                      className={inputCls}
                      value={form.bedType}
                      onChange={(e) => updateField("bedType", e.target.value)}
                    >
                      {BED_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t.replace(/-/g, " ")}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Bathrooms">
                    <input
                      type="number"
                      min={1}
                      className={inputCls}
                      value={form.bathrooms}
                      onChange={(e) =>
                        updateField("bathrooms", e.target.value)
                      }
                    />
                  </Field>
                  <Field label="Bathroom type">
                    <select
                      className={inputCls}
                      value={form.bathroomType}
                      onChange={(e) =>
                        updateField("bathroomType", e.target.value)
                      }
                    >
                      {BATHROOM_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Base price / night (₹)">
                    <input
                      required
                      type="number"
                      min={0}
                      className={inputCls}
                      value={form.basePrice}
                      onChange={(e) =>
                        updateField("basePrice", e.target.value)
                      }
                    />
                  </Field>
                  <Field label="Weekend price (₹)">
                    <input
                      type="number"
                      min={0}
                      className={inputCls}
                      value={form.weekendPrice}
                      onChange={(e) =>
                        updateField("weekendPrice", e.target.value)
                      }
                    />
                  </Field>
                  <Field label="Total units">
                    <input
                      required
                      type="number"
                      min={1}
                      className={inputCls}
                      value={form.totalUnits}
                      onChange={(e) =>
                        updateField("totalUnits", e.target.value)
                      }
                    />
                  </Field>
                  <Field label="Inventory type">
                    <select
                      className={inputCls}
                      value={form.inventoryType}
                      onChange={(e) =>
                        updateField("inventoryType", e.target.value)
                      }
                    >
                      {INVENTORY_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t.replace(/-/g, " ")}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                    Amenities
                  </span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {AMENITY_TOGGLES.map(([key, label]) => (
                      <label
                        key={key}
                        className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                          form[key]
                            ? "border-[#3f6259] bg-[#3f6259]/10 text-[#3f6259]"
                            : "border-stone-300 text-stone-500"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={!!form[key]}
                          onChange={(e) =>
                            updateField(key, e.target.checked)
                          }
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center gap-2 text-sm text-stone-700">
                    <input
                      type="checkbox"
                      checked={!!form.instantBooking}
                      onChange={(e) =>
                        updateField("instantBooking", e.target.checked)
                      }
                    />
                    Instant booking
                  </label>
                  <label className="flex items-center gap-2 text-sm text-stone-700">
                    <input
                      type="checkbox"
                      checked={!!form.refundable}
                      onChange={(e) =>
                        updateField("refundable", e.target.checked)
                      }
                    />
                    Refundable
                  </label>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Cover image">
                    <input
                      type="file"
                      accept="image/*"
                      className="text-sm"
                      onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                    />
                  </Field>
                  <Field label="Gallery images (up to 20)">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="text-sm"
                      onChange={(e) =>
                        setGalleryFiles(Array.from(e.target.files || []))
                      }
                    />
                  </Field>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-stone-200 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="rounded-lg px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-[#3f6259] px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#345149] disabled:opacity-50"
                  >
                    {saving ? "Saving…" : editingId ? "Save changes" : "Create unit"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}