import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api/axios";
import { Plus, Search, RefreshCw, Pencil, Trash2, Eye, X, Loader2, DollarSign, Ship, BedDouble, CheckCircle2, FileText } from "lucide-react";
import "./CruisePricingManagement.css";

const authConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("vendorToken")}`,
  },
});

const initialForm = {
  sailingId: "",
  shipId: "",
  cabinId: "",
  currency: "INR",
  basePrice: "",
  adultPrice: "",
  childPrice: "",
  infantPrice: "",
  singleSupplement: "",
  taxPercentage: "",
  taxAmount: "",
  portCharges: "",
  serviceCharges: "",
  discountAmount: "",
  status: "draft",
};

const idOf = (value) => (typeof value === "object" ? value?._id : value);

const listFrom = (data, key) => {
  if (Array.isArray(data)) return data;
  return data?.[key] || data?.data?.[key] || data?.data || [];
};

const errorText = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  "Something went wrong.";

const dateText = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

const money = (value, currency = "INR") => {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 2,
    }).format(Number(value || 0));
  } catch {
    return `${currency || "INR"} ${Number(value || 0).toFixed(2)}`;
  }
};

const shipName = (ship) => ship?.shipName || ship?.name || "Cruise Ship";
const cabinName = (cabin) =>
  cabin?.cabinName ||
  cabin?.name ||
  cabin?.cabinType ||
  cabin?.categoryName ||
  cabin?.type ||
  "Cabin";

const sailingName = (sailing) => {
  const code = sailing?.sailingCode || "Sailing";
  const date = dateText(sailing?.departureDate);
  return `${code}${date !== "—" ? ` • ${date}` : ""}`;
};

export default function CruisePricingManagement() {
  const [pricings, setPricings] = useState([]);
  const [ships, setShips] = useState([]);
  const [sailings, setSailings] = useState([]);
  const [cabins, setCabins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [shipFilter, setShipFilter] = useState("");
  const [sailingFilter, setSailingFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modal, setModal] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [pricingRes, shipsRes, sailingRes, cabinRes] = await Promise.all([
        api.get("/api/cruise-pricings", authConfig()),
        api.get("/api/vendor/cruise/ships", authConfig()),
        api.get("/api/cruise-sailings", authConfig()),
        api.get("/api/cruise-cabins", authConfig()),
      ]);
      setPricings(listFrom(pricingRes.data, "pricings"));
      setShips(listFrom(shipsRes.data, "ships"));
      setSailings(listFrom(sailingRes.data, "sailings"));
      setCabins(listFrom(cabinRes.data, "cabins"));
    } catch (err) {
      setError(errorText(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formSailings = useMemo(
    () =>
      form.shipId
        ? sailings.filter((item) => idOf(item.shipId) === form.shipId)
        : sailings,
    [form.shipId, sailings]
  );

  const formCabins = useMemo(
    () =>
      form.shipId
        ? cabins.filter((item) => idOf(item.shipId) === form.shipId)
        : cabins,
    [form.shipId, cabins]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return pricings.filter((item) => {
      const text = [
        item?.sailingId?.sailingCode,
        item?.shipId?.shipName,
        item?.cabinId?.cabinName,
        item?.cabinId?.name,
        item?.cabinId?.cabinType,
        item?.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return (
        (!q || text.includes(q)) &&
        (!shipFilter || idOf(item.shipId) === shipFilter) &&
        (!sailingFilter || idOf(item.sailingId) === sailingFilter) &&
        (!statusFilter || item.status === statusFilter)
      );
    });
  }, [pricings, search, shipFilter, sailingFilter, statusFilter]);

  const stats = useMemo(
    () => ({
      total: pricings.length,
      active: pricings.filter((x) => x.status === "active").length,
      draft: pricings.filter((x) => x.status === "draft").length,
      inactive: pricings.filter((x) => x.status === "inactive").length,
    }),
    [pricings]
  );

  const calculatedFinal = useMemo(() => {
    const total =
      Number(form.basePrice || 0) +
      Number(form.taxAmount || 0) +
      Number(form.portCharges || 0) +
      Number(form.serviceCharges || 0) -
      Number(form.discountAmount || 0);
    return Math.max(0, total);
  }, [form]);

  const closeModal = () => {
    if (!saving) {
      setModal("");
      setEditing(null);
    }
  };

  const setField = (field, value) => {
    setForm((current) => {
      const next = { ...current, [field]: value };
      if (field === "shipId") {
        next.sailingId = "";
        next.cabinId = "";
      }
      return next;
    });
  };

  const addPricing = () => {
    setError("");
    setMessage("");
    setEditing(null);
    setForm(initialForm);
    setModal("form");
  };

  const editPricing = (item) => {
    setError("");
    setMessage("");
    setEditing(item);
    setForm({
      sailingId: idOf(item.sailingId) || "",
      shipId: idOf(item.shipId) || "",
      cabinId: idOf(item.cabinId) || "",
      currency: item.currency || "INR",
      basePrice: item.basePrice ?? "",
      adultPrice: item.adultPrice ?? "",
      childPrice: item.childPrice ?? "",
      infantPrice: item.infantPrice ?? "",
      singleSupplement: item.singleSupplement ?? "",
      taxPercentage: item.taxPercentage ?? "",
      taxAmount: item.taxAmount ?? "",
      portCharges: item.portCharges ?? "",
      serviceCharges: item.serviceCharges ?? "",
      discountAmount: item.discountAmount ?? "",
      status: item.status || "draft",
    });
    setModal("form");
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!form.sailingId || !form.shipId || !form.cabinId) {
      setError("Ship, sailing and cabin are required.");
      return;
    }
    if (form.basePrice === "" || Number(form.basePrice) < 0) {
      setError("Base price is required.");
      return;
    }
    if (form.adultPrice === "" || Number(form.adultPrice) < 0) {
      setError("Adult price is required.");
      return;
    }

    const payload = {
      sailingId: form.sailingId,
      shipId: form.shipId,
      cabinId: form.cabinId,
      currency: (form.currency || "INR").toUpperCase(),
      basePrice: Number(form.basePrice || 0),
      adultPrice: Number(form.adultPrice || 0),
      childPrice: Number(form.childPrice || 0),
      infantPrice: Number(form.infantPrice || 0),
      singleSupplement: Number(form.singleSupplement || 0),
      taxPercentage: Number(form.taxPercentage || 0),
      taxAmount: Number(form.taxAmount || 0),
      portCharges: Number(form.portCharges || 0),
      serviceCharges: Number(form.serviceCharges || 0),
      discountAmount: Number(form.discountAmount || 0),
      status: form.status,
    };

    try {
      setSaving(true);
      if (editing?._id) {
        await api.put(`/api/cruise-pricings/${editing._id}`, payload, authConfig());
        setMessage("Cruise pricing updated successfully.");
      } else {
        await api.post("/api/cruise-pricings", payload, authConfig());
        setMessage("Cruise pricing created successfully.");
      }
      closeModal();
      await loadData();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setSaving(false);
    }
  };

  const removePricing = async (item) => {
    if (!window.confirm("Are you sure you want to delete this pricing?")) return;
    try {
      setDeleting(item._id);
      setError("");
      await api.delete(`/api/cruise-pricings/${item._id}`, authConfig());
      setMessage("Cruise pricing deleted successfully.");
      await loadData();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setDeleting("");
    }
  };

  return (
    <div className="pricing-page">
      <div className="pricing-heading">
        <div>
          <span className="pricing-eyebrow">CRUISE MANAGEMENT</span>
          <h1>Pricing Management</h1>
          <p>Create and manage pricing for each sailing and cabin.</p>
        </div>
        <button className="pricing-primary" onClick={addPricing}>
          <Plus size={18} /> Add Pricing
        </button>
      </div>

      {error && (
        <div className="pricing-alert error">
          <span>{error}</span>
          <button onClick={() => setError("")}><X size={16} /></button>
        </div>
      )}
      {message && (
        <div className="pricing-alert success">
          <CheckCircle2 size={17} />
          <span>{message}</span>
          <button onClick={() => setMessage("")}><X size={16} /></button>
        </div>
      )}

      <div className="pricing-stats">
        <div><span>Total Pricing</span><strong>{stats.total}</strong><DollarSign size={20} /></div>
        <div><span>Active</span><strong>{stats.active}</strong><CheckCircle2 size={20} /></div>
        <div><span>Draft</span><strong>{stats.draft}</strong><FileText size={20} /></div>
        <div><span>Inactive</span><strong>{stats.inactive}</strong><FileText size={20} /></div>
      </div>

      <div className="pricing-filters">
        <div className="pricing-search">
          <Search size={18} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search sailing, ship or cabin..." />
        </div>
        <select value={shipFilter} onChange={(e) => setShipFilter(e.target.value)}>
          <option value="">All Ships</option>
          {ships.map((ship) => <option key={ship._id} value={ship._id}>{shipName(ship)}</option>)}
        </select>
        <select value={sailingFilter} onChange={(e) => setSailingFilter(e.target.value)}>
          <option value="">All Sailings</option>
          {sailings.map((sailing) => <option key={sailing._id} value={sailing._id}>{sailingName(sailing)}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="inactive">Inactive</option>
        </select>
        <button className="pricing-refresh" onClick={loadData} disabled={loading}>
          <RefreshCw size={17} className={loading ? "pricing-spin" : ""} /> Refresh
        </button>
      </div>

      <div className="pricing-card">
        <div className="pricing-card-head">
          <div><h2>Cruise Pricing</h2><span>{filtered.length} record{filtered.length === 1 ? "" : "s"}</span></div>
        </div>
        {loading ? (
          <div className="pricing-empty"><Loader2 className="pricing-spin" size={28} />Loading pricing...</div>
        ) : filtered.length === 0 ? (
          <div className="pricing-empty">
            <DollarSign size={34} />
            <h3>No pricing found</h3>
            <p>Create pricing for a sailing and cabin.</p>
            <button className="pricing-primary" onClick={addPricing}><Plus size={17} /> Add Pricing</button>
          </div>
        ) : (
          <div className="pricing-table-wrap">
            <table className="pricing-table">
              <thead>
                <tr><th>SAILING</th><th>SHIP</th><th>CABIN</th><th>ADULT</th><th>CHILD</th><th>FINAL PRICE</th><th>STATUS</th><th>ACTIONS</th></tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item._id}>
                    <td><strong>{item.sailingId?.sailingCode || "—"}</strong><small>{dateText(item.sailingId?.departureDate)}</small></td>
                    <td><span className="pricing-entity"><Ship size={16} />{shipName(item.shipId)}</span></td>
                    <td><span className="pricing-entity"><BedDouble size={16} />{cabinName(item.cabinId)}</span></td>
                    <td>{money(item.adultPrice, item.currency)}</td>
                    <td>{money(item.childPrice, item.currency)}</td>
                    <td><strong>{money(item.finalPrice, item.currency)}</strong></td>
                    <td><span className={`pricing-status ${item.status}`}>{item.status}</span></td>
                    <td>
                      <div className="pricing-actions">
                        <button title="View" onClick={() => { setEditing(item); setModal("view"); }}><Eye size={16} /></button>
                        <button title="Edit" onClick={() => editPricing(item)}><Pencil size={16} /></button>
                        <button title="Delete" className="danger" disabled={deleting === item._id} onClick={() => removePricing(item)}>
                          {deleting === item._id ? <Loader2 size={16} className="pricing-spin" /> : <Trash2 size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal === "form" && (
        <div className="pricing-overlay" onMouseDown={closeModal}>
          <div className="pricing-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="pricing-modal-head">
              <div><h2>{editing ? "Edit Pricing" : "Add Pricing"}</h2><p>Set pricing for a sailing and cabin.</p></div>
              <button onClick={closeModal}><X size={20} /></button>
            </div>
            <form onSubmit={submit}>
              <div className="pricing-modal-body">
                <section>
                  <h3>Sailing Details</h3>
                  <div className="pricing-grid three">
                    <label><span>Ship *</span><select value={form.shipId} onChange={(e) => setField("shipId", e.target.value)}><option value="">Select ship</option>{ships.map((x) => <option key={x._id} value={x._id}>{shipName(x)}</option>)}</select></label>
                    <label><span>Sailing *</span><select value={form.sailingId} onChange={(e) => setField("sailingId", e.target.value)}><option value="">Select sailing</option>{formSailings.map((x) => <option key={x._id} value={x._id}>{sailingName(x)}</option>)}</select></label>
                    <label><span>Cabin *</span><select value={form.cabinId} onChange={(e) => setField("cabinId", e.target.value)}><option value="">Select cabin</option>{formCabins.map((x) => <option key={x._id} value={x._id}>{cabinName(x)}</option>)}</select></label>
                  </div>
                </section>
                <section>
                  <h3>Passenger Pricing</h3>
                  <div className="pricing-grid four">
                    <label><span>Currency</span><input value={form.currency} maxLength={3} onChange={(e) => setField("currency", e.target.value.toUpperCase())} /></label>
                    <label><span>Base Price *</span><input type="number" min="0" step="0.01" value={form.basePrice} onChange={(e) => setField("basePrice", e.target.value)} /></label>
                    <label><span>Adult Price *</span><input type="number" min="0" step="0.01" value={form.adultPrice} onChange={(e) => setField("adultPrice", e.target.value)} /></label>
                    <label><span>Child Price</span><input type="number" min="0" step="0.01" value={form.childPrice} onChange={(e) => setField("childPrice", e.target.value)} /></label>
                    <label><span>Infant Price</span><input type="number" min="0" step="0.01" value={form.infantPrice} onChange={(e) => setField("infantPrice", e.target.value)} /></label>
                    <label><span>Single Supplement</span><input type="number" min="0" step="0.01" value={form.singleSupplement} onChange={(e) => setField("singleSupplement", e.target.value)} /></label>
                  </div>
                </section>
                <section>
                  <h3>Taxes & Charges</h3>
                  <div className="pricing-grid four">
                    <label><span>Tax %</span><input type="number" min="0" step="0.01" value={form.taxPercentage} onChange={(e) => setField("taxPercentage", e.target.value)} /></label>
                    <label><span>Tax Amount</span><input type="number" min="0" step="0.01" value={form.taxAmount} onChange={(e) => setField("taxAmount", e.target.value)} /></label>
                    <label><span>Port Charges</span><input type="number" min="0" step="0.01" value={form.portCharges} onChange={(e) => setField("portCharges", e.target.value)} /></label>
                    <label><span>Service Charges</span><input type="number" min="0" step="0.01" value={form.serviceCharges} onChange={(e) => setField("serviceCharges", e.target.value)} /></label>
                    <label><span>Discount Amount</span><input type="number" min="0" step="0.01" value={form.discountAmount} onChange={(e) => setField("discountAmount", e.target.value)} /></label>
                    <label><span>Final Price</span><div className="pricing-final">{money(calculatedFinal, form.currency)}</div></label>
                    <label><span>Status</span><select value={form.status} onChange={(e) => setField("status", e.target.value)}><option value="draft">Draft</option><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
                  </div>
                </section>
              </div>
              <div className="pricing-modal-footer">
                <button type="button" className="pricing-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="pricing-primary" disabled={saving}>{saving ? <><Loader2 size={16} className="pricing-spin" /> Saving...</> : <><CheckCircle2 size={16} /> {editing ? "Update Pricing" : "Create Pricing"}</>}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal === "view" && editing && (
        <div className="pricing-overlay" onMouseDown={closeModal}>
          <div className="pricing-modal pricing-view" onMouseDown={(e) => e.stopPropagation()}>
            <div className="pricing-modal-head"><div><h2>Pricing Details</h2><p>{editing.sailingId?.sailingCode || "Cruise Pricing"}</p></div><button onClick={closeModal}><X size={20} /></button></div>
            <div className="pricing-modal-body">
              <div className="pricing-details">
                <div><span>Ship</span><strong>{shipName(editing.shipId)}</strong></div>
                <div><span>Cabin</span><strong>{cabinName(editing.cabinId)}</strong></div>
                <div><span>Sailing</span><strong>{editing.sailingId?.sailingCode || "—"}</strong></div>
                <div><span>Departure</span><strong>{dateText(editing.sailingId?.departureDate)}</strong></div>
                <div><span>Return</span><strong>{dateText(editing.sailingId?.returnDate)}</strong></div>
                <div><span>Status</span><strong className={`pricing-status ${editing.status}`}>{editing.status}</strong></div>
              </div>
              <div className="pricing-price-details">
                <div><span>Base Price</span><strong>{money(editing.basePrice, editing.currency)}</strong></div>
                <div><span>Adult Price</span><strong>{money(editing.adultPrice, editing.currency)}</strong></div>
                <div><span>Child Price</span><strong>{money(editing.childPrice, editing.currency)}</strong></div>
                <div><span>Infant Price</span><strong>{money(editing.infantPrice, editing.currency)}</strong></div>
                <div><span>Tax Amount</span><strong>{money(editing.taxAmount, editing.currency)}</strong></div>
                <div><span>Port Charges</span><strong>{money(editing.portCharges, editing.currency)}</strong></div>
                <div><span>Service Charges</span><strong>{money(editing.serviceCharges, editing.currency)}</strong></div>
                <div><span>Discount</span><strong>- {money(editing.discountAmount, editing.currency)}</strong></div>
                <div className="final"><span>Final Price</span><strong>{money(editing.finalPrice, editing.currency)}</strong></div>
              </div>
            </div>
            <div className="pricing-modal-footer"><button className="pricing-secondary" onClick={closeModal}>Close</button><button className="pricing-primary" onClick={() => editPricing(editing)}><Pencil size={16} /> Edit Pricing</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
