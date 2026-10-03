import React, { useEffect, useMemo, useState } from "react";
import {
  Ship,
  Plus,
  Search,
  X,
  Pencil,
  Trash2,
  Eye,
  Anchor,
  Users,
  BedDouble,
  Layers3,
  Upload,
  Image as ImageIcon,
  Video,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { api } from "../api/axios";
import "./VendorCruise.css";

/* =========================================================
   NOTE
   Ye file ab sirf "My Cruises" ka content hai (list / add /
   edit / view). Sidebar, topbar, login aur routing ka kaam
   VendorLayout karta hai. Isliye yahan koi duplicate shell nahi.
   Navigation yahan local state se hoti hai (URL change nahi).
========================================================= */

/* =========================================================
   CRUISE API METHODS (axios.js unchanged)
========================================================= */
const cruiseAuthConfig = () => {
  const token = localStorage.getItem("vendorToken");
  if (!token) {
    throw new Error("Authentication required. Token missing.");
  }
  return { headers: { Authorization: `Bearer ${token}` } };
};

const shipApi = {
  getShips: async () =>
    (await api.get("/api/vendor/cruise/ships", cruiseAuthConfig())).data,
  getShip: async (id) =>
    (await api.get(`/api/vendor/cruise/ships/${id}`, cruiseAuthConfig())).data,
  createShip: async (formData) =>
    (await api.post("/api/vendor/cruise/ships", formData, cruiseAuthConfig())).data,
  updateShip: async (id, formData) =>
    (await api.put(`/api/vendor/cruise/ships/${id}`, formData, cruiseAuthConfig())).data,
  deleteShip: async (id) =>
    (await api.delete(`/api/vendor/cruise/ships/${id}`, cruiseAuthConfig())).data,
};

/* =========================================================
   HELPERS
========================================================= */
const cruiseTypes = [
  { value: "ocean-cruise", label: "Ocean Cruise" },
  { value: "river-cruise", label: "River Cruise" },
  { value: "expedition-cruise", label: "Expedition Cruise" },
  { value: "luxury-cruise", label: "Luxury Cruise" },
  { value: "other", label: "Other" },
];

const emptyForm = {
  shipName: "",
  cruiseLineName: "",
  cruiseType: "ocean-cruise",
  vesselType: "",
  imoNumber: "",
  registrationNumber: "",
  passengerCapacity: "",
  crewCapacity: "",
  numberOfCabins: "",
  numberOfDecks: "",
  yearBuilt: "",
  yearRefurbished: "",
  shipLength: "",
  shipWidth: "",
  description: "",
  amenities: [],
  status: "draft",
};

function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Something went wrong."
  );
}

const getShipsFromResponse = (data) => data?.ships || data?.data?.ships || [];
const getShipFromResponse = (data) => data?.ship || data?.data?.ship || null;

function formatCruiseType(type) {
  if (!type) return "—";
  return cruiseTypes.find((item) => item.value === type)?.label || type;
}

function capitalize(value) {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/* =========================================================
   ROOT (local view state instead of router)
   view: { name: "list" | "add" | "edit" | "view", id }
========================================================= */
export default function VendorCruise() {
  const [view, setView] = useState({ name: "list", id: null });

  const go = (name, id = null) => {
    setView({ name, id });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="vcr">
      {view.name === "list" && <Ships go={go} />}
      {view.name === "add" && <ShipForm key="add" go={go} />}
      {view.name === "edit" && <ShipForm key={view.id} id={view.id} go={go} />}
      {view.name === "view" && <ShipDetails id={view.id} go={go} />}
    </div>
  );
}

/* =========================================================
   SHIPS LIST
========================================================= */
function Ships({ go }) {
  const [ships, setShips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const loadShips = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await shipApi.getShips();
      setShips(getShipsFromResponse(response));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShips();
  }, []);

  const filteredShips = useMemo(() => {
    const q = search.toLowerCase().trim();
    return ships.filter((ship) => {
      const matchesSearch =
        !q ||
        ship.shipName?.toLowerCase().includes(q) ||
        ship.cruiseLineName?.toLowerCase().includes(q) ||
        ship.vesselType?.toLowerCase().includes(q) ||
        ship.imoNumber?.toLowerCase().includes(q);
      return matchesSearch && (status === "all" || ship.status === status);
    });
  }, [ships, search, status]);

  const deleteShip = async (ship) => {
    if (!window.confirm(`Are you sure you want to delete "${ship.shipName}"?`)) return;
    try {
      await shipApi.deleteShip(ship._id);
      setShips((prev) => prev.filter((item) => item._id !== ship._id));
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  return (
    <>
      <div className="page-heading-row">
        <div>
          <h1>My Cruises</h1>
          <p>
            {ships.length} cruise{ships.length !== 1 ? "s" : ""} in your fleet
          </p>
        </div>
        <button className="primary-btn" onClick={() => go("add")}>
          <Plus size={18} />
          Add Cruise
        </button>
      </div>

      {error && <Alert type="error" message={error} />}

      <div className="filter-bar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by ship name, cruise line, IMO..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch("")}>
              <X size={15} />
            </button>
          )}
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="panel table-panel">
        {loading ? (
          <Loading />
        ) : filteredShips.length === 0 ? (
          <EmptyState
            icon={<Ship size={30} />}
            title="No cruise ships found"
            text={
              ships.length === 0
                ? "You have not added any cruise ships yet."
                : "Try changing your search or status filter."
            }
            buttonText={ships.length === 0 ? "Add Cruise" : undefined}
            onAction={() => go("add")}
          />
        ) : (
          <ShipTable ships={filteredShips} go={go} onDelete={deleteShip} />
        )}
      </div>
    </>
  );
}

function ShipTable({ ships, go, onDelete }) {
  return (
    <div className="table-wrap">
      <table className="ship-table">
        <thead>
          <tr>
            <th>CRUISE SHIP</th>
            <th>CRUISE LINE</th>
            <th>TYPE</th>
            <th>CAPACITY</th>
            <th>STATUS</th>
            <th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {ships.map((ship) => (
            <tr key={ship._id}>
              <td>
                <div className="table-ship">
                  <div className="table-ship-image">
                    {ship.coverImage || ship.logo ? (
                      <img src={ship.coverImage || ship.logo} alt={ship.shipName} />
                    ) : (
                      <Ship size={22} />
                    )}
                  </div>
                  <div>
                    <strong>{ship.shipName}</strong>
                    <span>{ship.vesselType || "Cruise Vessel"}</span>
                  </div>
                </div>
              </td>
              <td>
                <span className="muted-text">{ship.cruiseLineName || "—"}</span>
              </td>
              <td>
                <span className="type-pill">{formatCruiseType(ship.cruiseType)}</span>
              </td>
              <td>
                <span className="capacity-cell">
                  <Users size={15} />
                  {ship.passengerCapacity || 0}
                </span>
              </td>
              <td>
                <StatusBadge status={ship.status} />
              </td>
              <td>
                <div className="table-actions">
                  <button className="action-btn view" title="View" onClick={() => go("view", ship._id)}>
                    <Eye size={17} />
                  </button>
                  <button className="action-btn edit" title="Edit" onClick={() => go("edit", ship._id)}>
                    <Pencil size={17} />
                  </button>
                  <button className="action-btn delete" title="Delete" onClick={() => onDelete(ship)}>
                    <Trash2 size={17} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* =========================================================
   SHIP FORM (add / edit)
========================================================= */
function ShipForm({ id, go }) {
  const isEdit = Boolean(id);

  const [form, setForm] = useState(emptyForm);
  const [existingMedia, setExistingMedia] = useState({
    logo: "",
    coverImage: "",
    images: [],
    videos: [],
  });
  const [logo, setLogo] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [amenityInput, setAmenityInput] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    const loadShip = async () => {
      try {
        setLoading(true);
        const response = await shipApi.getShip(id);
        const ship = getShipFromResponse(response);
        if (!ship) throw new Error("Cruise ship not found.");
        setForm({
          shipName: ship.shipName || "",
          cruiseLineName: ship.cruiseLineName || "",
          cruiseType: ship.cruiseType || "ocean-cruise",
          vesselType: ship.vesselType || "",
          imoNumber: ship.imoNumber || "",
          registrationNumber: ship.registrationNumber || "",
          passengerCapacity: ship.passengerCapacity || "",
          crewCapacity: ship.crewCapacity || "",
          numberOfCabins: ship.numberOfCabins || "",
          numberOfDecks: ship.numberOfDecks || "",
          yearBuilt: ship.yearBuilt || "",
          yearRefurbished: ship.yearRefurbished || "",
          shipLength: ship.shipLength || "",
          shipWidth: ship.shipWidth || "",
          description: ship.description || "",
          amenities: Array.isArray(ship.amenities) ? ship.amenities : [],
          status: ship.status || "draft",
        });
        setExistingMedia({
          logo: ship.logo || "",
          coverImage: ship.coverImage || "",
          images: ship.images || [],
          videos: ship.videos || [],
        });
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    loadShip();
  }, [id, isEdit]);

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const addAmenity = () => {
    const value = amenityInput.trim();
    if (!value) return;
    if (!form.amenities.includes(value)) {
      setForm((prev) => ({ ...prev, amenities: [...prev.amenities, value] }));
    }
    setAmenityInput("");
  };

  const removeAmenity = (amenity) =>
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((item) => item !== amenity),
    }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.shipName.trim()) {
      setError("Ship name is required.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      setSaving(true);
      const fd = new FormData();
      fd.append("shipName", form.shipName);
      fd.append("cruiseLineName", form.cruiseLineName);
      fd.append("cruiseType", form.cruiseType);
      fd.append("vesselType", form.vesselType);
      fd.append("imoNumber", form.imoNumber);
      fd.append("registrationNumber", form.registrationNumber);

      [
        "passengerCapacity",
        "crewCapacity",
        "numberOfCabins",
        "numberOfDecks",
        "yearBuilt",
        "yearRefurbished",
        "shipLength",
        "shipWidth",
      ].forEach((key) => {
        if (form[key] !== "") fd.append(key, form[key]);
      });

      fd.append("description", form.description);
      fd.append("amenities", JSON.stringify(form.amenities));
      fd.append("status", form.status);

      if (logo) fd.append("logo", logo);
      if (coverImage) fd.append("coverImage", coverImage);
      images.forEach((file) => fd.append("images", file));
      videos.forEach((file) => fd.append("videos", file));

      if (isEdit) {
        await shipApi.updateShip(id, fd);
        setSuccess("Cruise ship updated successfully.");
      } else {
        await shipApi.createShip(fd);
        setSuccess("Cruise ship created successfully.");
      }

      setTimeout(() => go("list"), 700);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading full />;

  return (
    <>
      <div className="page-heading-row">
        <div>
          <button className="back-link" onClick={() => go("list")}>
            ← Back to cruises
          </button>
          <h1>{isEdit ? "Edit Cruise" : "Add New Cruise"}</h1>
          <p>
            {isEdit
              ? "Update your cruise ship information."
              : "Add a new cruise ship to your fleet."}
          </p>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      <form onSubmit={submit} className="ship-form">
        <FormSection
          icon={<Ship size={20} />}
          title="Basic Information"
          description="Enter the primary details of your cruise ship."
        >
          <div className="form-grid two">
            <Field label="Ship Name" required>
              <input
                value={form.shipName}
                onChange={(e) => updateField("shipName", e.target.value)}
                placeholder="e.g. Ocean Majesty"
              />
            </Field>
            <Field label="Cruise Line Name">
              <input
                value={form.cruiseLineName}
                onChange={(e) => updateField("cruiseLineName", e.target.value)}
                placeholder="e.g. Royal Caribbean"
              />
            </Field>
            <Field label="Cruise Type">
              <select
                value={form.cruiseType}
                onChange={(e) => updateField("cruiseType", e.target.value)}
              >
                {cruiseTypes.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Vessel Type">
              <input
                value={form.vesselType}
                onChange={(e) => updateField("vesselType", e.target.value)}
                placeholder="e.g. Passenger Ship"
              />
            </Field>
            <Field label="IMO Number">
              <input
                value={form.imoNumber}
                onChange={(e) => updateField("imoNumber", e.target.value)}
                placeholder="IMO number"
              />
            </Field>
            <Field label="Registration Number">
              <input
                value={form.registrationNumber}
                onChange={(e) => updateField("registrationNumber", e.target.value)}
                placeholder="Registration number"
              />
            </Field>
          </div>
        </FormSection>

        <FormSection
          icon={<Users size={20} />}
          title="Capacity & Structure"
          description="Add ship capacity and physical specifications."
        >
          <div className="form-grid three">
            <Field label="Passenger Capacity">
              <input type="number" min="0" value={form.passengerCapacity} onChange={(e) => updateField("passengerCapacity", e.target.value)} placeholder="0" />
            </Field>
            <Field label="Crew Capacity">
              <input type="number" min="0" value={form.crewCapacity} onChange={(e) => updateField("crewCapacity", e.target.value)} placeholder="0" />
            </Field>
            <Field label="Number of Cabins">
              <input type="number" min="0" value={form.numberOfCabins} onChange={(e) => updateField("numberOfCabins", e.target.value)} placeholder="0" />
            </Field>
            <Field label="Number of Decks">
              <input type="number" min="0" value={form.numberOfDecks} onChange={(e) => updateField("numberOfDecks", e.target.value)} placeholder="0" />
            </Field>
            <Field label="Year Built">
              <input type="number" min="1800" max="2100" value={form.yearBuilt} onChange={(e) => updateField("yearBuilt", e.target.value)} placeholder="2025" />
            </Field>
            <Field label="Year Refurbished">
              <input type="number" min="1800" max="2100" value={form.yearRefurbished} onChange={(e) => updateField("yearRefurbished", e.target.value)} placeholder="2025" />
            </Field>
            <Field label="Ship Length">
              <input type="text" value={form.shipLength} onChange={(e) => updateField("shipLength", e.target.value)} placeholder="e.g. 330 m" />
            </Field>
            <Field label="Ship Width">
              <input type="text" value={form.shipWidth} onChange={(e) => updateField("shipWidth", e.target.value)} placeholder="e.g. 45 m" />
            </Field>
          </div>
        </FormSection>

        <FormSection
          icon={<Layers3 size={20} />}
          title="Description & Amenities"
          description="Tell customers what makes this ship special."
        >
          <Field label="Description">
            <textarea
              rows="7"
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Describe your cruise ship, facilities, experience and services..."
            />
          </Field>

          <div className="amenities-area">
            <label className="field-label">Amenities</label>
            <div className="amenity-input-row">
              <input
                value={amenityInput}
                onChange={(e) => setAmenityInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addAmenity();
                  }
                }}
                placeholder="e.g. Swimming Pool"
              />
              <button type="button" className="secondary-btn" onClick={addAmenity}>
                <Plus size={17} />
                Add
              </button>
            </div>
            {form.amenities.length > 0 && (
              <div className="amenity-list">
                {form.amenities.map((amenity) => (
                  <span className="amenity-chip" key={amenity}>
                    {amenity}
                    <button type="button" onClick={() => removeAmenity(amenity)}>
                      <X size={13} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </FormSection>

        <FormSection
          icon={<ImageIcon size={20} />}
          title="Media"
          description="Upload ship branding, cover photos, images and videos."
        >
          <div className="media-grid">
            <FileDrop label="Ship Logo" accept="image/*" file={logo} existing={existingMedia.logo} onChange={setLogo} />
            <FileDrop label="Cover Image" accept="image/*" file={coverImage} existing={existingMedia.coverImage} onChange={setCoverImage} />
          </div>
          <div className="media-block">
            <MultiFileDrop label="Ship Images" accept="image/*" files={images} existing={existingMedia.images} onChange={setImages} icon={<ImageIcon size={22} />} />
          </div>
          <div className="media-block">
            <MultiFileDrop label="Ship Videos" accept="video/*" files={videos} existing={existingMedia.videos} onChange={setVideos} icon={<Video size={22} />} />
          </div>
        </FormSection>

        <FormSection
          icon={<CheckCircle2 size={20} />}
          title="Publishing"
          description="Choose the current status of this cruise ship."
        >
          <Field label="Status">
            <select value={form.status} onChange={(e) => updateField("status", e.target.value)}>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </Field>
        </FormSection>

        <div className="form-actions">
          <button type="button" className="secondary-btn large" onClick={() => go("list")} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="primary-btn large" disabled={saving}>
            {saving ? (
              <>
                <Loader2 size={18} className="spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2 size={18} />
                {isEdit ? "Update Cruise" : "Create Cruise"}
              </>
            )}
          </button>
        </div>
      </form>
    </>
  );
}

/* =========================================================
   SHIP DETAILS
========================================================= */
function ShipDetails({ id, go }) {
  const [ship, setShip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await shipApi.getShip(id);
        setShip(getShipFromResponse(response));
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <Loading full />;

  if (error) {
    return (
      <>
        <button className="back-link" onClick={() => go("list")}>← Back to cruises</button>
        <Alert type="error" message={error} />
      </>
    );
  }

  if (!ship) {
    return (
      <EmptyState
        icon={<Ship size={30} />}
        title="Cruise not found"
        text="The requested cruise ship could not be found."
        buttonText="Back to Cruises"
        onAction={() => go("list")}
      />
    );
  }

  return (
    <>
      <div className="details-top">
        <button className="back-link" onClick={() => go("list")}>
          ← Back to cruises
        </button>
        <div className="details-actions">
          <button className="secondary-btn" onClick={() => go("edit", ship._id)}>
            <Pencil size={17} />
            Edit
          </button>
        </div>
      </div>

      <div className="ship-hero">
        <div className="ship-hero-image">
          {ship.coverImage || ship.logo ? (
            <img src={ship.coverImage || ship.logo} alt={ship.shipName} />
          ) : (
            <Ship size={60} />
          )}
        </div>
        <div className="ship-hero-content">
          <div className="ship-title-row">
            <div>
              <span className="eyebrow">CRUISE SHIP</span>
              <h1>{ship.shipName}</h1>
              <p>{ship.cruiseLineName || "Cruise Line not specified"}</p>
            </div>
            <StatusBadge status={ship.status} />
          </div>
          <div className="hero-meta">
            <Info icon={<Anchor size={17} />} label="Cruise Type" value={formatCruiseType(ship.cruiseType)} />
            <Info icon={<Users size={17} />} label="Passengers" value={ship.passengerCapacity || "—"} />
            <Info icon={<BedDouble size={17} />} label="Cabins" value={ship.numberOfCabins || "—"} />
            <Info icon={<Layers3 size={17} />} label="Decks" value={ship.numberOfDecks || "—"} />
          </div>
        </div>
      </div>

      <div className="details-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Ship Information</h3>
              <p>Technical and registration details</p>
            </div>
          </div>
          <div className="info-grid">
            <Info label="Vessel Type" value={ship.vesselType} />
            <Info label="IMO Number" value={ship.imoNumber} />
            <Info label="Registration Number" value={ship.registrationNumber} />
            <Info label="Crew Capacity" value={ship.crewCapacity} />
            <Info label="Year Built" value={ship.yearBuilt} />
            <Info label="Year Refurbished" value={ship.yearRefurbished} />
            <Info label="Ship Length" value={ship.shipLength} />
            <Info label="Ship Width" value={ship.shipWidth} />
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Amenities</h3>
              <p>Available onboard facilities</p>
            </div>
          </div>
          {ship.amenities?.length ? (
            <div className="amenity-list detail-amenities">
              {ship.amenities.map((item) => (
                <span className="amenity-chip" key={item}>
                  <CheckCircle2 size={14} />
                  {item}
                </span>
              ))}
            </div>
          ) : (
            <p className="empty-text">No amenities added.</p>
          )}
        </div>
      </div>

      <div className="panel description-panel">
        <div className="panel-header">
          <div>
            <h3>Description</h3>
          </div>
        </div>
        <p className="description-text">{ship.description || "No description available."}</p>
      </div>

      {ship.images?.length > 0 && (
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Ship Gallery</h3>
              <p>Uploaded ship images</p>
            </div>
          </div>
          <div className="gallery">
            {ship.images.map((image, index) => (
              <img src={image} alt={`${ship.shipName} ${index + 1}`} key={`${image}-${index}`} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

/* =========================================================
   FORM COMPONENTS
========================================================= */
function FormSection({ icon, title, description, children }) {
  return (
    <section className="form-section">
      <div className="form-section-heading">
        <div className="form-section-icon">{icon}</div>
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>
      <div className="form-section-content">{children}</div>
    </section>
  );
}

function Field({ label, required, children }) {
  return (
    <div className="field">
      <label className="field-label">
        {label}
        {required && <span className="required">*</span>}
      </label>
      {children}
    </div>
  );
}

/* =========================================================
   MEDIA
========================================================= */
function FileDrop({ label, accept, file, existing, onChange }) {
  return (
    <div className="file-field">
      <label className="field-label">{label}</label>
      <label className="file-drop">
        <input
          type="file"
          accept={accept}
          onChange={(e) => onChange(e.target.files?.[0] || null)}
        />
        {file ? (
          <div className="selected-file">
            <Upload size={20} />
            <div>
              <strong>{file.name}</strong>
              <span>New file selected</span>
            </div>
          </div>
        ) : existing ? (
          <div className="existing-file">
            <img src={existing} alt={label} />
            <div>
              <strong>Current {label}</strong>
              <span>Click to replace</span>
            </div>
          </div>
        ) : (
          <>
            <div className="upload-icon">
              <Upload size={22} />
            </div>
            <strong>Click to upload</strong>
            <span>or drag and drop</span>
          </>
        )}
      </label>
    </div>
  );
}

function MultiFileDrop({ label, accept, files, existing, onChange, icon }) {
  const removeNewFile = (index) => onChange(files.filter((_, i) => i !== index));

  return (
    <div className="file-field">
      <label className="field-label">{label}</label>
      <label className="multi-file-drop">
        <input
          type="file"
          accept={accept}
          multiple
          onChange={(e) => onChange([...files, ...Array.from(e.target.files || [])])}
        />
        <div className="upload-icon">{icon}</div>
        <strong>Click to upload files</strong>
        <span>You can select multiple files</span>
      </label>

      {existing?.length > 0 && <div className="media-count">Existing files: {existing.length}</div>}

      {files.length > 0 && (
        <div className="selected-files">
          {files.map((file, index) => (
            <div className="selected-file-row" key={`${file.name}-${index}`}>
              <div>
                {file.type.startsWith("video/") ? <Video size={17} /> : <ImageIcon size={17} />}
                <span>{file.name}</span>
              </div>
              <button type="button" onClick={() => removeNewFile(index)}>
                <X size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   SMALL COMPONENTS
========================================================= */
function StatusBadge({ status }) {
  const value = status || "draft";
  return (
    <span className={`status-badge ${value}`}>
      <span className="status-dot" />
      {capitalize(value)}
    </span>
  );
}

function Info({ icon, label, value }) {
  return (
    <div className="info-item">
      {icon && <div className="info-icon">{icon}</div>}
      <div>
        <span>{label}</span>
        <strong>{value || "—"}</strong>
      </div>
    </div>
  );
}

function Alert({ type = "error", message }) {
  return (
    <div className={`alert ${type}`}>
      {type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
      <span>{message}</span>
    </div>
  );
}

function Loading({ full = false }) {
  return (
    <div className={`loading ${full ? "loading-full" : ""}`}>
      <Loader2 size={28} className="spin" />
      <span>Loading...</span>
    </div>
  );
}

function EmptyState({ icon, title, text, buttonText, onAction }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
      {buttonText && onAction && (
        <button className="primary-btn" onClick={onAction}>
          <Plus size={17} />
          {buttonText}
        </button>
      )}
    </div>
  );
}