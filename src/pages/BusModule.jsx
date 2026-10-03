import { useEffect, useState } from "react";
import axios from "axios";

const API = "https://bmtvendorfinal.onrender.com/api/buses";

const EMPTY_FORM = {
  // Basic
  busName: "", busNumber: "", busType: "AC", busCategory: "Seater",
  busModel: "", busColor: "", seatLayoutType: "2x2", busOwner: "",
  operatorName: "", vendorName: "", busId: "",
  // Contact
  email: "", phone: "", altPhone: "", address: "", city: "", state: "", country: "",
  // Route
  fromCity: "", toCity: "", viaCities: "", routeName: "",
  boardingPoints: "", droppingPoints: "",
  // Timing
  departureTime: "", arrivalTime: "", journeyDuration: "", reportingTime: "",
  // Seats
  totalSeats: "", upperSeats: "", lowerSeats: "", seatNumbers: "", seatPrice: "",
  // Pricing
  price: "", basePrice: "", tax: "", tollTax: "", discount: "",
  offerPrice: "", finalPrice: "", agentCommission: "", agentPrice: "",
  vendorCost: "", vendorPaymentStatus: "", profit: "",
  // Driver
  driverName: "", driverPhone: "", driverLicense: "", helperName: "", helperPhone: "",
  // Docs
  rcNumber: "", insuranceNumber: "", permitNumber: "", fitnessExpiry: "",
  // GPS
  gpsDeviceId: "", liveTrackingLink: "",
  // Amenities & Dates
  amenities: "", travelDate: "", returnDate: "",
  startBookingDate: "", endBookingDate: "",
  // Map
  fromLat: "", fromLng: "", toLat: "", toLng: "",
  // Policy
  cancellationPolicy: "", notes: "",
};

const TABS = [
  { id: "basic",   label: "Bus Info" },
  { id: "contact", label: "Contact" },
  { id: "route",   label: "Route" },
  { id: "timing",  label: "Timing" },
  { id: "seats",   label: "Seats" },
  { id: "pricing", label: "Pricing" },
  { id: "driver",  label: "Driver" },
  { id: "docs",    label: "Docs" },
  { id: "images",  label: "Images" },
  { id: "policy",  label: "Policy" },
];

const busTypeIcons = { AC: "❄️", "Non-AC": "🌡️", Sleeper: "🛏️", Seater: "💺", "AC Sleeper": "🛏️❄️", "AC Seater": "💺❄️" };

export default function BusModule() {
  const token = localStorage.getItem("token");
  const authH = () => ({ Authorization: `Bearer ${token}` });

  const [buses, setBuses]         = useState([]);
  const [loading, setLoading]     = useState(false);
  const [editId, setEditId]       = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [form, setForm]           = useState(EMPTY_FORM);

  // Images
  const [image, setImage]                   = useState(null);
  const [imagePreview, setImagePreview]     = useState(null);
  const [frontImg, setFrontImg]             = useState(null);
  const [frontPrev, setFrontPrev]           = useState(null);
  const [backImg, setBackImg]               = useState(null);
  const [backPrev, setBackPrev]             = useState(null);
  const [seatLayoutImg, setSeatLayoutImg]   = useState(null);
  const [seatLayoutPrev, setSeatLayoutPrev] = useState(null);
  const [insideImgs, setInsideImgs]         = useState([]);
  const [insidePrevs, setInsidePrevs]       = useState([]);
  const [gallery, setGallery]               = useState([]);
  const [galleryPreview, setGalleryPreview] = useState([]);

  useEffect(() => { fetchBuses(); }, []);

  const fetchBuses = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/vendor`, { headers: authH() });
      setBuses(res.data.buses || res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSingle = (setFile, setPreview) => (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleMulti = (setFiles, setPrevs, max) => (e) => {
    const files = Array.from(e.target.files);
    setFiles(prev => {
      if (prev.length + files.length > max) { alert(`Maximum ${max} images allowed`); return prev; }
      return [...prev, ...files];
    });
    setPrevs(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };

  const removeMulti = (idx, setFiles, setPrevs) => {
    setFiles(p => p.filter((_, i) => i !== idx));
    setPrevs(p => p.filter((_, i) => i !== idx));
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === "amenities") {
        fd.append("amenities", JSON.stringify(v ? v.split(",").map(a => a.trim()) : []));
      } else {
        fd.append(k, v);
      }
    });

    if (image)        fd.append("image", image);
    if (frontImg)     fd.append("frontImage", frontImg);
    if (backImg)      fd.append("backImage", backImg);
    if (seatLayoutImg) fd.append("seatLayoutImage", seatLayoutImg);
    insideImgs.forEach(f => fd.append("insideImages", f));
    gallery.forEach(f => fd.append("gallery", f));

    const cfg = { headers: { ...authH(), "Content-Type": "multipart/form-data" } };

    try {
      if (editId) {
        await axios.put(`${API}/${editId}`, fd, cfg);
      } else {
        await axios.post(API, fd, cfg);
      }
      resetForm();
      setShowModal(false);
      fetchBuses();
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const editBus = (bus) => {
    setForm({
      ...EMPTY_FORM,
      busName: bus.busName || "", busNumber: bus.busNumber || "",
      busType: bus.busType || "AC", busCategory: bus.busCategory || "Seater",
      busModel: bus.busModel || "", busColor: bus.busColor || "",
      seatLayoutType: bus.seatLayoutType || "2x2", busOwner: bus.busOwner || "",
      operatorName: bus.operatorName || "", vendorName: bus.vendorName || "",
      busId: bus.busId || "", email: bus.email || "", phone: bus.phone || "",
      altPhone: bus.altPhone || "", address: bus.address || "",
      city: bus.city || "", state: bus.state || "", country: bus.country || "",
      fromCity: bus.fromCity || "", toCity: bus.toCity || "",
      viaCities: (bus.viaCities || []).join(","), routeName: bus.routeName || "",
      boardingPoints: JSON.stringify(bus.boardingPoints || []),
      droppingPoints: JSON.stringify(bus.droppingPoints || []),
      departureTime: bus.departureTime || "", arrivalTime: bus.arrivalTime || "",
      journeyDuration: bus.journeyDuration || "", reportingTime: bus.reportingTime || "",
      totalSeats: bus.totalSeats || "", upperSeats: bus.upperSeats || "",
      lowerSeats: bus.lowerSeats || "",
      seatNumbers: (bus.seatNumbers || []).join(","),
      seatPrice: (bus.seatPrice || []).map(s => `${s.seatNo}:${s.price}`).join(","),
      price: bus.price || "", basePrice: bus.basePrice || "",
      tax: bus.tax || "", tollTax: bus.tollTax || "",
      discount: bus.discount || "", offerPrice: bus.offerPrice || "",
      finalPrice: bus.finalPrice || "", agentCommission: bus.agentCommission || "",
      agentPrice: bus.agentPrice || "", vendorCost: bus.vendorCost || "",
      vendorPaymentStatus: bus.vendorPaymentStatus || "", profit: bus.profit || "",
      driverName: bus.driverName || "", driverPhone: bus.driverPhone || "",
      driverLicense: bus.driverLicense || "", helperName: bus.helperName || "",
      helperPhone: bus.helperPhone || "", rcNumber: bus.rcNumber || "",
      insuranceNumber: bus.insuranceNumber || "", permitNumber: bus.permitNumber || "",
      fitnessExpiry: bus.fitnessExpiry?.slice(0, 10) || "",
      gpsDeviceId: bus.gpsDeviceId || "", liveTrackingLink: bus.liveTrackingLink || "",
      amenities: (bus.amenities || []).join(","),
      travelDate: bus.travelDate?.slice(0, 10) || "",
      returnDate: bus.returnDate?.slice(0, 10) || "",
      startBookingDate: bus.startBookingDate?.slice(0, 10) || "",
      endBookingDate: bus.endBookingDate?.slice(0, 10) || "",
      fromLat: bus.routeMap?.fromLat || "", fromLng: bus.routeMap?.fromLng || "",
      toLat: bus.routeMap?.toLat || "", toLng: bus.routeMap?.toLng || "",
      cancellationPolicy: bus.cancellationPolicy || "", notes: bus.notes || "",
    });
    setImagePreview(bus.image || null);
    setFrontPrev(bus.frontImage || null);
    setBackPrev(bus.backImage || null);
    setSeatLayoutPrev(bus.seatLayoutImage || null);
    setInsidePrevs(bus.insideImages || []);
    setGalleryPreview((bus.gallery || []).map(g => g.url || g));
    setGallery([]); setInsideImgs([]);
    setEditId(bus._id);
    setActiveTab("basic");
    setShowModal(true);
  };

  const deleteBus = async (id) => {
    if (!window.confirm("Are you sure you want to delete this bus?")) return;
    setLoading(true);
    try {
      await axios.delete(`${API}/${id}`, { headers: authH() });
      fetchBuses();
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setImage(null); setImagePreview(null);
    setFrontImg(null); setFrontPrev(null);
    setBackImg(null); setBackPrev(null);
    setSeatLayoutImg(null); setSeatLayoutPrev(null);
    setInsideImgs([]); setInsidePrevs([]);
    setGallery([]); setGalleryPreview([]);
    setEditId(null);
  };

  const closeModal = () => { setShowModal(false); resetForm(); };

  /* ── Tab content ── */
  const renderTabContent = () => {
    switch (activeTab) {
      case "basic": return (
        <>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Bus Name *</label>
              <input style={styles.input} value={form.busName} onChange={f("busName")} placeholder="e.g., Volvo Multi-Axle" required />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Bus Number *</label>
              <input style={styles.input} value={form.busNumber} onChange={f("busNumber")} placeholder="MH-12-AB-1234" required />
            </div>
          </div>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Bus Type *</label>
              <select style={styles.select} value={form.busType} onChange={f("busType")}>
                <option value="AC">❄️ AC</option>
                <option value="Non-AC">🌡️ Non-AC</option>
                <option value="Sleeper">🛏️ Sleeper</option>
                <option value="Seater">💺 Seater</option>
                <option value="AC Sleeper">❄️🛏️ AC Sleeper</option>
                <option value="AC Seater">❄️💺 AC Seater</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Bus Category</label>
              <select style={styles.select} value={form.busCategory} onChange={f("busCategory")}>
                <option>Seater</option><option>Sleeper</option><option>Semi-Sleeper</option>
              </select>
            </div>
          </div>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Bus Model</label>
              <input style={styles.input} value={form.busModel} onChange={f("busModel")} placeholder="e.g., Volvo 9400" />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Bus Color</label>
              <input style={styles.input} value={form.busColor} onChange={f("busColor")} placeholder="e.g., White" />
            </div>
          </div>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Seat Layout</label>
              <select style={styles.select} value={form.seatLayoutType} onChange={f("seatLayoutType")}>
                <option>2x2</option><option>2x1</option><option>1x1</option><option>2x3</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Operator Name</label>
              <input style={styles.input} value={form.operatorName} onChange={f("operatorName")} placeholder="Operator name" />
            </div>
          </div>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Vendor Name</label>
              <input style={styles.input} value={form.vendorName} onChange={f("vendorName")} placeholder="Vendor name" />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Bus Owner</label>
              <input style={styles.input} value={form.busOwner} onChange={f("busOwner")} placeholder="Owner name" />
            </div>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Amenities</label>
            <input style={styles.input} value={form.amenities} onChange={f("amenities")} placeholder="e.g., WiFi, Charging, Water, Blanket" />
            <span style={styles.hint}>Separate with commas</span>
          </div>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Travel Date *</label>
              <input style={styles.input} type="date" value={form.travelDate} onChange={f("travelDate")} required />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Return Date</label>
              <input style={styles.input} type="date" value={form.returnDate} onChange={f("returnDate")} />
            </div>
          </div>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Booking Opens</label>
              <input style={styles.input} type="date" value={form.startBookingDate} onChange={f("startBookingDate")} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Booking Closes</label>
              <input style={styles.input} type="date" value={form.endBookingDate} onChange={f("endBookingDate")} />
            </div>
          </div>
        </>
      );

      case "contact": return (
        <>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input style={styles.input} type="email" value={form.email} onChange={f("email")} placeholder="operator@email.com" />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Phone</label>
              <input style={styles.input} value={form.phone} onChange={f("phone")} placeholder="+91 9876543210" />
            </div>
          </div>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Alt Phone</label>
              <input style={styles.input} value={form.altPhone} onChange={f("altPhone")} placeholder="Alternate number" />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>City</label>
              <input style={styles.input} value={form.city} onChange={f("city")} placeholder="City" />
            </div>
          </div>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>State</label>
              <input style={styles.input} value={form.state} onChange={f("state")} placeholder="State" />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Country</label>
              <input style={styles.input} value={form.country} onChange={f("country")} placeholder="Country" />
            </div>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Full Address</label>
            <textarea style={{ ...styles.input, height: 80, resize: "vertical" }} value={form.address} onChange={f("address")} placeholder="Full address..." />
          </div>
        </>
      );

      case "route": return (
        <>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>From City *</label>
              <input style={styles.input} value={form.fromCity} onChange={f("fromCity")} placeholder="e.g., Mumbai" required />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>To City *</label>
              <input style={styles.input} value={form.toCity} onChange={f("toCity")} placeholder="e.g., Pune" required />
            </div>
          </div>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Via Cities</label>
              <input style={styles.input} value={form.viaCities} onChange={f("viaCities")} placeholder="Thane, Nashik" />
              <span style={styles.hint}>Comma separated</span>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Route Name</label>
              <input style={styles.input} value={form.routeName} onChange={f("routeName")} placeholder="Mumbai – Pune Express" />
            </div>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Boarding Points</label>
            <textarea style={{ ...styles.input, height: 90, resize: "vertical" }} value={form.boardingPoints} onChange={f("boardingPoints")} placeholder={"Pipe format: Dadar|06:00|Dadar ST|Near McD, Thane|07:00|Thane Bus Stop|\nOR JSON array"} />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Dropping Points</label>
            <textarea style={{ ...styles.input, height: 90, resize: "vertical" }} value={form.droppingPoints} onChange={f("droppingPoints")} placeholder={"Pipe format: Pune|10:00|Swargate|Main terminal\nOR JSON array"} />
          </div>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>From Latitude</label>
              <input style={styles.input} value={form.fromLat} onChange={f("fromLat")} placeholder="19.0760" />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>From Longitude</label>
              <input style={styles.input} value={form.fromLng} onChange={f("fromLng")} placeholder="72.8777" />
            </div>
          </div>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>To Latitude</label>
              <input style={styles.input} value={form.toLat} onChange={f("toLat")} placeholder="18.5204" />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>To Longitude</label>
              <input style={styles.input} value={form.toLng} onChange={f("toLng")} placeholder="73.8567" />
            </div>
          </div>
        </>
      );

      case "timing": return (
        <>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Departure Time *</label>
              <input style={styles.input} type="time" value={form.departureTime} onChange={f("departureTime")} required />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Arrival Time *</label>
              <input style={styles.input} type="time" value={form.arrivalTime} onChange={f("arrivalTime")} required />
            </div>
          </div>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Journey Duration</label>
              <input style={styles.input} value={form.journeyDuration} onChange={f("journeyDuration")} placeholder="e.g., 4h 30m" />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Reporting Time</label>
              <input style={styles.input} type="time" value={form.reportingTime} onChange={f("reportingTime")} />
            </div>
          </div>
        </>
      );

      case "seats": return (
        <>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Total Seats *</label>
              <input style={styles.input} type="number" value={form.totalSeats} onChange={f("totalSeats")} placeholder="40" min="1" required />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Upper Deck Seats</label>
              <input style={styles.input} type="number" value={form.upperSeats} onChange={f("upperSeats")} placeholder="20" min="0" />
            </div>
          </div>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Lower Deck Seats</label>
              <input style={styles.input} type="number" value={form.lowerSeats} onChange={f("lowerSeats")} placeholder="20" min="0" />
            </div>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Seat Numbers</label>
            <input style={styles.input} value={form.seatNumbers} onChange={f("seatNumbers")} placeholder="A1,A2,B1,B2... (leave empty to auto-generate S1,S2...)" />
            <span style={styles.hint}>Comma separated — leave blank to auto-generate</span>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Seat-wise Pricing</label>
            <input style={styles.input} value={form.seatPrice} onChange={f("seatPrice")} placeholder="A1:500,A2:600,B1:450" />
            <span style={styles.hint}>Format: SeatNo:Price — comma separated</span>
          </div>
        </>
      );

      case "pricing": return (
        <>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Ticket Price (₹) *</label>
              <input style={styles.input} type="number" value={form.price} onChange={f("price")} placeholder="800" min="0" required />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Base Price</label>
              <input style={styles.input} value={form.basePrice} onChange={f("basePrice")} placeholder="700" />
            </div>
          </div>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Tax</label>
              <input style={styles.input} value={form.tax} onChange={f("tax")} placeholder="50" />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Toll Tax</label>
              <input style={styles.input} value={form.tollTax} onChange={f("tollTax")} placeholder="30" />
            </div>
          </div>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Discount</label>
              <input style={styles.input} value={form.discount} onChange={f("discount")} placeholder="0" />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Offer Price</label>
              <input style={styles.input} value={form.offerPrice} onChange={f("offerPrice")} placeholder="750" />
            </div>
          </div>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Final Price</label>
              <input style={styles.input} value={form.finalPrice} onChange={f("finalPrice")} placeholder="780" />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Agent Commission</label>
              <input style={styles.input} value={form.agentCommission} onChange={f("agentCommission")} placeholder="5%" />
            </div>
          </div>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Agent Price</label>
              <input style={styles.input} value={form.agentPrice} onChange={f("agentPrice")} placeholder="760" />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Vendor Cost</label>
              <input style={styles.input} value={form.vendorCost} onChange={f("vendorCost")} placeholder="600" />
            </div>
          </div>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Vendor Payment Status</label>
              <select style={styles.select} value={form.vendorPaymentStatus} onChange={f("vendorPaymentStatus")}>
                <option value="">Select...</option>
                <option>Pending</option><option>Partial</option><option>Paid</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Profit</label>
              <input style={styles.input} value={form.profit} onChange={f("profit")} placeholder="180" />
            </div>
          </div>
        </>
      );

      case "driver": return (
        <>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Driver Name</label>
              <input style={styles.input} value={form.driverName} onChange={f("driverName")} placeholder="Full name" />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Driver Phone</label>
              <input style={styles.input} value={form.driverPhone} onChange={f("driverPhone")} placeholder="+91..." />
            </div>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Driver License Number</label>
            <input style={styles.input} value={form.driverLicense} onChange={f("driverLicense")} placeholder="License number" />
          </div>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Helper / Conductor Name</label>
              <input style={styles.input} value={form.helperName} onChange={f("helperName")} placeholder="Helper name" />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Helper Phone</label>
              <input style={styles.input} value={form.helperPhone} onChange={f("helperPhone")} placeholder="+91..." />
            </div>
          </div>
        </>
      );

      case "docs": return (
        <>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>RC Number</label>
              <input style={styles.input} value={form.rcNumber} onChange={f("rcNumber")} placeholder="Registration number" />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Insurance Number</label>
              <input style={styles.input} value={form.insuranceNumber} onChange={f("insuranceNumber")} placeholder="Insurance policy number" />
            </div>
          </div>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Permit Number</label>
              <input style={styles.input} value={form.permitNumber} onChange={f("permitNumber")} placeholder="Permit number" />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Fitness Expiry</label>
              <input style={styles.input} type="date" value={form.fitnessExpiry} onChange={f("fitnessExpiry")} />
            </div>
          </div>
        </>
      );

      case "images": return (
        <>
          {/* Main Image */}
          <div style={styles.formSection}>
            <h3 style={styles.sectionTitle}>🖼️ Main & Extra Images</h3>
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Main Image {!editId && "*"}</label>
                <input type="file" accept="image/*" onChange={handleSingle(setImage, setImagePreview)} style={styles.fileInput} required={!editId} />
                {imagePreview && <img src={imagePreview} alt="Preview" style={styles.imagePreview} />}
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Front View</label>
                <input type="file" accept="image/*" onChange={handleSingle(setFrontImg, setFrontPrev)} style={styles.fileInput} />
                {frontPrev && <img src={frontPrev} alt="Front" style={styles.imagePreview} />}
              </div>
            </div>
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Back View</label>
                <input type="file" accept="image/*" onChange={handleSingle(setBackImg, setBackPrev)} style={styles.fileInput} />
                {backPrev && <img src={backPrev} alt="Back" style={styles.imagePreview} />}
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Seat Layout Image</label>
                <input type="file" accept="image/*" onChange={handleSingle(setSeatLayoutImg, setSeatLayoutPrev)} style={styles.fileInput} />
                {seatLayoutPrev && <img src={seatLayoutPrev} alt="Seat Layout" style={styles.imagePreview} />}
              </div>
            </div>
          </div>

          {/* Inside Images */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Inside Images (max 5)</label>
            <input type="file" accept="image/*" multiple style={styles.fileInput} onChange={handleMulti(setInsideImgs, setInsidePrevs, 5)} />
            <div style={styles.thumbRow}>
              {insidePrevs.map((src, i) => (
                <div key={i} style={{ position: "relative" }}>
                  <img src={src} style={styles.thumbImg} alt="inside" />
                  <button type="button" onClick={() => removeMulti(i, setInsideImgs, setInsidePrevs)} style={styles.removeThumb}>×</button>
                </div>
              ))}
            </div>
          </div>

          {/* Gallery */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Bus Gallery (max 10)</label>
            <input type="file" accept="image/*" multiple style={styles.fileInput} onChange={handleMulti(setGallery, setGalleryPreview, 10)} />
            <div style={styles.thumbRow}>
              {galleryPreview.map((src, i) => (
                <div key={i} style={{ position: "relative" }}>
                  <img src={src} style={styles.thumbImg} alt="gallery" />
                  <button type="button" onClick={() => removeMulti(i, setGallery, setGalleryPreview)} style={styles.removeThumb}>×</button>
                </div>
              ))}
            </div>
          </div>
        </>
      );

      case "policy": return (
        <>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>GPS Device ID</label>
              <input style={styles.input} value={form.gpsDeviceId} onChange={f("gpsDeviceId")} placeholder="Device ID" />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Live Tracking Link</label>
              <input style={styles.input} value={form.liveTrackingLink} onChange={f("liveTrackingLink")} placeholder="https://track.example.com/bus" />
            </div>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Cancellation Policy</label>
            <textarea style={{ ...styles.input, height: 100, resize: "vertical" }} value={form.cancellationPolicy} onChange={f("cancellationPolicy")} placeholder="e.g., 50% refund if cancelled 24h before departure..." />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Internal Notes</label>
            <textarea style={{ ...styles.input, height: 80, resize: "vertical" }} value={form.notes} onChange={f("notes")} placeholder="Any internal notes for admin..." />
          </div>
        </>
      );

      default: return null;
    }
  };

  /* ── UI ── */
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            <span style={styles.titleIcon}>🚌</span>
            Manage Your Buses
          </h1>
          <p style={styles.subtitle}>View and manage your bus fleet</p>
        </div>
        <button style={styles.addButton} onClick={() => { setShowModal(true); setActiveTab("basic"); }} disabled={loading}>
          ➕ Add New Bus
        </button>
      </div>

      {/* Table */}
      {loading && <div style={styles.loader}>Loading...</div>}

      {!loading && buses.length === 0 && (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🚌</div>
          <p style={styles.emptyText}>No buses added yet</p>
          <p style={styles.emptySubtext}>Click "Add New Bus" to get started</p>
        </div>
      )}

      {!loading && buses.length > 0 && (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.th}>Image</th>
                <th style={styles.th}>Bus Details</th>
                <th style={styles.th}>Route</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Seats</th>
                <th style={styles.th}>Date & Time</th>
                <th style={styles.th}>Price</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {buses.map((bus) => (
                <tr key={bus._id} style={styles.tableRow}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f8f9fa"}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                  <td style={styles.td}>
                    {bus.image
                      ? <img src={bus.image} alt={bus.busName} style={styles.busImage} />
                      : <div style={styles.noImage}>🚌</div>
                    }
                  </td>
                  <td style={styles.td}>
                    <div style={styles.busDetails}>
                      <span style={styles.busName}>{bus.busName}</span>
                      <span style={styles.busNumber}>{bus.busNumber}</span>
                      {bus.amenities?.length > 0 && (
                        <div style={styles.amenitiesContainer}>
                          {bus.amenities.slice(0, 2).map((a, i) => <span key={i} style={styles.amenityBadge}>{a}</span>)}
                          {bus.amenities.length > 2 && <span style={styles.amenityBadge}>+{bus.amenities.length - 2}</span>}
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.routeInfo}>
                      <span style={styles.cityText}>{bus.fromCity}</span>
                      <span style={styles.arrow}>→</span>
                      <span style={styles.cityText}>{bus.toCity}</span>
                    </div>
                    {bus.viaCities?.length > 0 && <div style={styles.via}>via {bus.viaCities.slice(0,2).join(", ")}</div>}
                  </td>
                  <td style={styles.td}>
                    <span style={styles.typeBadge}>{busTypeIcons[bus.busType]} {bus.busType}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.seatsText}>{bus.totalSeats}</span>
                    {bus.availableSeats !== undefined && <div style={styles.seatsAvail}>{bus.availableSeats} avail.</div>}
                  </td>
                  <td style={styles.td}>
                    <div style={styles.dateTimeInfo}>
                      <span style={styles.dateText}>📅 {bus.travelDate ? new Date(bus.travelDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "—"}</span>
                      {bus.departureTime && <span style={styles.timeText}>🕐 {bus.departureTime}</span>}
                      {bus.arrivalTime && <span style={styles.timeText}>🏁 {bus.arrivalTime}</span>}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.priceInfo}>
                      <span style={styles.priceAmount}>₹{bus.price}</span>
                      <span style={styles.priceLabel}>per seat</span>
                      {bus.discount && <span style={styles.discountLabel}>-{bus.discount} off</span>}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.statusBadge,
                      ...(bus.status === "approved" ? styles.statusApproved : bus.status === "rejected" ? styles.statusRejected : styles.statusPending)
                    }}>{bus.status}</span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actionButtons}>
                      <button onClick={() => editBus(bus)} style={styles.editBtn} disabled={loading} title="Edit">✏️</button>
                      <button onClick={() => deleteBus(bus._id)} style={styles.deleteBtn} disabled={loading} title="Delete">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editId ? "✏️ Edit Bus" : "➕ Add New Bus"}
              </h2>
              <button style={styles.closeButton} onClick={closeModal}>✕</button>
            </div>

            {/* Tabs */}
            <div style={styles.tabBar}>
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{ ...styles.tabBtn, ...(activeTab === tab.id ? styles.tabBtnActive : {}) }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, overflow: "hidden" }}>
              <div style={styles.modalBody}>
                <div style={styles.formSection}>
                  {renderTabContent()}
                </div>
              </div>

              {/* Footer */}
              <div style={styles.modalFooter}>
                <div style={styles.footerNav}>
                  {TABS.findIndex(t => t.id === activeTab) > 0 && (
                    <button type="button" style={styles.navBtn} onClick={() => {
                      const i = TABS.findIndex(t => t.id === activeTab);
                      setActiveTab(TABS[i - 1].id);
                    }}>← Back</button>
                  )}
                  {TABS.findIndex(t => t.id === activeTab) < TABS.length - 1 && (
                    <button type="button" style={styles.navBtnNext} onClick={() => {
                      const i = TABS.findIndex(t => t.id === activeTab);
                      setActiveTab(TABS[i + 1].id);
                    }}>Next →</button>
                  )}
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <button type="button" style={styles.cancelBtn} onClick={closeModal} disabled={loading}>Cancel</button>
                  <button type="submit" style={styles.submitBtn} disabled={loading}>
                    {loading ? "⏳ Processing..." : editId ? "💾 Update Bus" : "➕ Add Bus"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Styles — same white/light design as original ── */
const styles = {
  container: {
    maxWidth: "1600px", margin: "0 auto", padding: "32px 24px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    backgroundColor: "#f8f9fa", minHeight: "100vh",
  },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "16px" },
  title: { fontSize: "36px", fontWeight: "700", color: "#1a1a1a", margin: "0", display: "flex", alignItems: "center", gap: "12px" },
  titleIcon: { fontSize: "40px" },
  subtitle: { fontSize: "16px", color: "#6c757d", margin: "4px 0 0 0" },
  addButton: { padding: "14px 28px", fontSize: "16px", fontWeight: "600", color: "white", backgroundColor: "#0d6efd", border: "none", borderRadius: "8px", cursor: "pointer", fontFamily: "inherit" },
  loader: { textAlign: "center", padding: "64px", fontSize: "18px", color: "#6c757d" },
  emptyState: { textAlign: "center", padding: "80px 24px", backgroundColor: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" },
  emptyIcon: { fontSize: "72px", marginBottom: "16px" },
  emptyText: { fontSize: "22px", fontWeight: "600", color: "#495057", margin: "0 0 8px 0" },
  emptySubtext: { fontSize: "16px", color: "#6c757d", margin: "0" },
  tableContainer: { backgroundColor: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse" },
  tableHeaderRow: { backgroundColor: "#f8f9fa" },
  th: { padding: "16px", textAlign: "left", fontSize: "13px", fontWeight: "700", color: "#495057", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "2px solid #dee2e6" },
  tableRow: { borderBottom: "1px solid #f1f3f5", transition: "background-color 0.15s" },
  td: { padding: "14px 16px", fontSize: "14px", color: "#495057", verticalAlign: "middle" },
  busImage: { width: "80px", height: "60px", objectFit: "cover", borderRadius: "6px", border: "1px solid #e9ecef" },
  noImage: { width: "80px", height: "60px", display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f3f5", borderRadius: "6px", fontSize: "24px" },
  busDetails: { display: "flex", flexDirection: "column", gap: "5px" },
  busName: { fontSize: "15px", fontWeight: "600", color: "#1a1a1a" },
  busNumber: { fontSize: "12px", fontWeight: "600", color: "#6c757d", fontFamily: "monospace", backgroundColor: "#f8f9fa", padding: "3px 8px", borderRadius: "4px", width: "fit-content" },
  amenitiesContainer: { display: "flex", gap: "4px", flexWrap: "wrap" },
  amenityBadge: { fontSize: "10px", fontWeight: "500", color: "#495057", backgroundColor: "#e9ecef", padding: "2px 6px", borderRadius: "3px" },
  routeInfo: { display: "flex", alignItems: "center", gap: "8px" },
  cityText: { fontSize: "14px", fontWeight: "600", color: "#1a1a1a" },
  arrow: { fontSize: "16px", color: "#0d6efd" },
  via: { fontSize: "11px", color: "#adb5bd", marginTop: 3 },
  typeBadge: { fontSize: "13px", fontWeight: "600", color: "#0d6efd", backgroundColor: "#e7f1ff", padding: "6px 12px", borderRadius: "16px", display: "inline-block" },
  seatsText: { fontSize: "14px", fontWeight: "600", color: "#1a1a1a" },
  seatsAvail: { fontSize: "11px", color: "#28a745", marginTop: 2 },
  dateTimeInfo: { display: "flex", flexDirection: "column", gap: "3px" },
  dateText: { fontSize: "13px", fontWeight: "500", color: "#495057" },
  timeText: { fontSize: "12px", color: "#6c757d" },
  priceInfo: { display: "flex", flexDirection: "column", gap: "2px" },
  priceAmount: { fontSize: "18px", fontWeight: "700", color: "#0d6efd" },
  priceLabel: { fontSize: "11px", color: "#6c757d" },
  discountLabel: { fontSize: "11px", color: "#28a745", fontWeight: "600" },
  statusBadge: { fontSize: "11px", fontWeight: "700", padding: "4px 10px", borderRadius: "20px", textTransform: "capitalize" },
  statusApproved: { background: "#d1fae5", color: "#065f46" },
  statusPending: { background: "#fff3cd", color: "#856404" },
  statusRejected: { background: "#fee2e2", color: "#991b1b" },
  actionButtons: { display: "flex", gap: "8px" },
  editBtn: { padding: "8px 12px", fontSize: "16px", backgroundColor: "#e7f1ff", border: "none", borderRadius: "6px", cursor: "pointer" },
  deleteBtn: { padding: "8px 12px", fontSize: "16px", backgroundColor: "#ffe6e8", border: "none", borderRadius: "6px", cursor: "pointer" },

  // Modal
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" },
  modalContent: { backgroundColor: "white", borderRadius: "16px", width: "100%", maxWidth: "900px", height: "90vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 32px 16px", borderBottom: "2px solid #f1f3f5", flexShrink: 0 },
  modalTitle: { fontSize: "24px", fontWeight: "600", color: "#1a1a1a", margin: 0 },
  closeButton: { fontSize: "24px", color: "#6c757d", backgroundColor: "transparent", border: "none", cursor: "pointer", padding: "4px 12px", borderRadius: "6px" },

  // Tabs
  tabBar: { display: "flex", flexWrap: "wrap", padding: "4px 16px 0", gap: 0, borderBottom: "2px solid #f1f3f5", flexShrink: 0, backgroundColor: "white" },
  tabBtn: { padding: "9px 14px", border: "none", background: "transparent", color: "#6c757d", cursor: "pointer", fontSize: "12.5px", fontWeight: "500", whiteSpace: "nowrap", borderBottom: "2px solid transparent", marginBottom: "-2px", fontFamily: "inherit", transition: "all 0.15s" },
  tabBtnActive: { color: "#0d6efd", borderBottomColor: "#0d6efd", fontWeight: "700", background: "#f0f5ff", borderRadius: "6px 6px 0 0" },

  // Form
  modalBody: { flex: 1, overflowY: "auto", padding: "28px 32px", minHeight: 0 },
  formSection: { display: "flex", flexDirection: "column", gap: "16px" },
  sectionTitle: { fontSize: "15px", fontWeight: "600", color: "#495057", margin: "8px 0 4px 0", paddingBottom: "10px", borderBottom: "2px solid #e9ecef" },
  formRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  formGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { fontSize: "14px", fontWeight: "600", color: "#495057" },
  input: { padding: "12px 16px", fontSize: "15px", border: "2px solid #e9ecef", borderRadius: "8px", outline: "none", fontFamily: "inherit", width: "100%", boxSizing: "border-box", transition: "border-color 0.2s" },
  select: { padding: "12px 16px", fontSize: "15px", border: "2px solid #e9ecef", borderRadius: "8px", outline: "none", cursor: "pointer", backgroundColor: "white", fontFamily: "inherit", width: "100%" },
  hint: { fontSize: "12px", color: "#6c757d", fontStyle: "italic" },
  fileInput: { padding: "10px", fontSize: "14px", border: "2px dashed #dee2e6", borderRadius: "8px", cursor: "pointer", fontFamily: "inherit" },
  imagePreview: { width: "200px", height: "140px", objectFit: "cover", borderRadius: "8px", border: "2px solid #e9ecef", marginTop: "8px" },
  thumbRow: { display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "10px" },
  thumbImg: { width: "80px", height: "60px", objectFit: "cover", borderRadius: "6px", border: "1px solid #e9ecef" },
  removeThumb: { position: "absolute", top: -6, right: -6, background: "red", color: "#fff", border: "none", borderRadius: "50%", width: 20, height: 20, cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center" },

  // Footer
  modalFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", padding: "16px 32px", borderTop: "2px solid #f1f3f5", flexShrink: 0 },
  footerNav: { display: "flex", gap: 8 },
  navBtn: { padding: "10px 18px", fontSize: "14px", fontWeight: "600", color: "#495057", backgroundColor: "#e9ecef", border: "none", borderRadius: "8px", cursor: "pointer", fontFamily: "inherit" },
  navBtnNext: { padding: "10px 18px", fontSize: "14px", fontWeight: "600", color: "#0d6efd", backgroundColor: "#e7f1ff", border: "none", borderRadius: "8px", cursor: "pointer", fontFamily: "inherit" },
  cancelBtn: { padding: "12px 24px", fontSize: "15px", fontWeight: "600", color: "#495057", backgroundColor: "#e9ecef", border: "none", borderRadius: "8px", cursor: "pointer", fontFamily: "inherit" },
  submitBtn: { padding: "12px 24px", fontSize: "15px", fontWeight: "600", color: "white", backgroundColor: "#0d6efd", border: "none", borderRadius: "8px", cursor: "pointer", fontFamily: "inherit" },
};