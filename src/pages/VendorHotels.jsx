
import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "https://bmtvendorfinal.onrender.com/api/vendor/hotels";

const HOTEL_TYPES     = ["Hotel","Resort","Villa","Hostel","Boutique","Motel","Guesthouse","Apartment"];
const STAR_RATINGS    = [1,2,3,4,5];
const PAYMENT_METHODS = ["Cash","Credit Card","Debit Card","UPI","Net Banking","Wallet","Cheque"];
const AMENITIES_LIST  = ["WiFi","Pool","Gym","Spa","Restaurant","Bar","Room Service","Parking","AC","Elevator","Laundry","Conference Room","Kids Play Area","Library","Terrace"];
const PROP_HIGHLIGHTS = ["Beachfront","Mountain View","City Center","Heritage Building","Eco-Friendly","Family Friendly","Pet Friendly","Adults Only","Countryside"];
const FOOD_DINING     = ["All-Day Dining","Rooftop Restaurant","Cafe","Bar & Lounge","Room Service 24/7","BBQ Area","Poolside Snacks","Fine Dining","Buffet Breakfast"];
const SAFETY_LIST     = ["24/7 Security","CCTV","Fire Safety","Safe Deposit Box","Security Guard","Smoke Detector","Emergency Exit","First Aid"];
const WELLNESS_LIST   = ["Spa","Yoga Center","Meditation Room","Steam Room","Sauna","Jacuzzi","Massage","Aromatherapy","Infinity Pool"];
const BUSINESS_LIST   = ["Conference Hall","Business Center","Meeting Rooms","Projector","High-Speed Internet","Fax/Printing","Co-Working Space"];
const MEDIA_LIST      = ["Smart TV","Netflix","Cable TV","Music System","Gaming Console","Streaming Services","Sound System"];
const TRANSPORT_LIST  = ["Airport Pickup","Car Rental","Taxi Service","Shuttle Bus","Valet Parking","Bicycle Rental","Boat Service"];
const BED_TYPES       = ["Single","Double","Queen","King","Twin","Bunk","Sofa Bed","Water Bed"];
const VIEW_TYPES      = ["City View","Sea View","Mountain View","Garden View","Pool View","Forest View","Desert View","No View"];
const BATHROOM_TYPES  = ["Private","Shared","En-Suite","Open Bathroom","Jack and Jill"];

const emptyHotel = {
  hotelName:"", hotelType:"", description:"", starRating:"", yearBuilt:"",
  phone:"", alternatePhone:"", email:"", website:"",
  country:"India", state:"", city:"", area:"", address:"", pincode:"", landmark:"",
  latitude:"", longitude:"",
  amenities:[], propertyHighlights:[], foodAndDining:[], safetyAndSecurity:[],
  wellnessAndSpa:[], businessFacilities:[], mediaAndTechnology:[], transportServices:[],
  paymentMethods:[],
  checkInTime:"", checkOutTime:"",
  earlyCheckInAllowed:false, lateCheckOutAllowed:false,
  cancellationPolicy:"", childPolicy:"", petPolicy:"",
  coupleFriendly:true, localIdAllowed:true,
  pricePerNight:"", taxPercentage:"", serviceCharge:"", extraBedCharge:"",
  refundPolicy:"", gstNumber:"", virtualTourLink:"",
};

const emptyRoom = {
  roomType:"", roomName:"", description:"", floorNumber:"", roomSize:"", viewType:"",
  basePrice:"", offerPrice:"", tax:"", serviceCharge:"",
  totalRooms:"", availableRooms:"", maxGuests:"", adults:"", children:"",
  bedType:"", bedCount:"", extraBedAvailable:false, extraBedCharge:"",
  balcony:false, airCondition:true, heater:false, wifi:true, tv:true,
  minibar:false, wardrobe:true, workDesk:false, iron:false, kitchen:false,
  bathroomType:"Private", bathtub:false, shower:true, toiletries:true, hairDryer:false,
  breakfastIncluded:false, lunchIncluded:false, dinnerIncluded:false,
  smokingAllowed:false, refundable:true, cancellationPolicy:"", status:"available",
};

export default function VendorHotels() {
  const token = localStorage.getItem("vendorToken");

  const [hotels,         setHotels]         = useState([]);
  const [filtered,       setFiltered]       = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [submitting,     setSubmitting]     = useState(false);
  const [error,          setError]          = useState("");

  // Hotel modal
  const [hotelModal,     setHotelModal]     = useState(false);
  const [editHotelId,    setEditHotelId]    = useState(null);
  const [tab,            setTab]            = useState("basic");
  const [hf,             setHf]             = useState({ ...emptyHotel }); // hotel form
  const [hImgs,          setHImgs]          = useState([]);   // new files
  const [hImgPrev,       setHImgPrev]       = useState([]);   // previews (existing + new)

  // Room modal
  const [roomModal,      setRoomModal]      = useState(false);
  const [editRoomId,     setEditRoomId]     = useState(null);
  const [selHotelId,     setSelHotelId]     = useState(null);
  const [rf,             setRf]             = useState({ ...emptyRoom }); // room form
  const [rImgs,          setRImgs]          = useState([]);
  const [rImgPrev,       setRImgPrev]       = useState([]);

  // Rooms view
  const [roomsView,      setRoomsView]      = useState(false);
  const [curHotel,       setCurHotel]       = useState(null);

  // Filters
  const [showF,  setShowF]  = useState(false);
  const [filt,   setFilt]   = useState({ q:"", city:"", hotelType:"", sort:"newest" });

  /* ══ LIFECYCLE ══ */
  useEffect(() => {
    if (!token) { window.location.replace("/vendor-login"); return; }
    load();
  }, []);
  useEffect(() => { applyFilters(); }, [hotels, filt]);

  /* ══ LOAD ══ */
  // const load = async () => {
  //   setLoading(true);
  //   try {
  //     const r = await axios.get(API_URL, { headers: { Authorization:`Bearer ${token}` } });
  //     setHotels(r.data);
  //   } catch(e) { setError(e.response?.data?.message || "Failed to load"); }
  //   setLoading(false);
  // };
  const load = async () => {
  try {
    setLoading(true);
    setError("");

    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("🏨 Hotels API Response:", response.data);

    // Backend se array kisi bhi common format me aaye,
    // frontend hamesha array store karega
    const hotelsData =
      Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.hotels)
        ? response.data.hotels
        : Array.isArray(response.data?.data)
        ? response.data.data
        : Array.isArray(response.data?.data?.hotels)
        ? response.data.data.hotels
        : [];

    setHotels(hotelsData);
  } catch (error) {
    console.error("❌ Hotel Load Error:", error.response?.data || error);

    setHotels([]);

    setError(
      error.response?.data?.message ||
      "Failed to load hotels"
    );
  } finally {
    setLoading(false);
  }
};

  /* ══ FILTERS ══ */
  const applyFilters = () => {
    let r = [...hotels];
    if (filt.q) {
      const q = filt.q.toLowerCase();
      r = r.filter(h => (h.hotelName||"").toLowerCase().includes(q) || (h.city||"").toLowerCase().includes(q));
    }
    if (filt.city)      r = r.filter(h => (h.city||"").toLowerCase().includes(filt.city.toLowerCase()));
    if (filt.hotelType) r = r.filter(h => h.hotelType === filt.hotelType);
    if (filt.sort==="rating") r.sort((a,b)=>(b.starRating||0)-(a.starRating||0));
    else if (filt.sort==="name") r.sort((a,b)=>(a.hotelName||"").localeCompare(b.hotelName||""));
    else if (filt.sort==="rooms") r.sort((a,b)=>(b.rooms?.length||0)-(a.rooms?.length||0));
    else r.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
    setFiltered(r);
  };

  /* ══ HOTEL FORM FIELD SETTER ══ */
  const setH = (k, v) => setHf(p => ({ ...p, [k]: v }));
  const setR = (k, v) => setRf(p => ({ ...p, [k]: v }));

  /* ══ CHIP TOGGLE ══ */
  const chipToggle = (key, val) => setHf(p => ({
    ...p,
    [key]: p[key].includes(val) ? p[key].filter(x=>x!==val) : [...p[key], val]
  }));

  /* ══ HOTEL IMAGES ══ */
  const addHotelImgs = (e) => {
    const files = [...e.target.files].filter(f => f.type.startsWith("image/") && f.size<=5*1024*1024);
    if (hImgs.length + files.length > 10) { setError("Max 10 images"); return; }
    setHImgs(p=>[...p,...files]);
    setHImgPrev(p=>[...p,...files.map(f=>URL.createObjectURL(f))]);
    e.target.value = "";
  };
  const removeNewHotelImg = (i) => {
    // i is index in hImgPrev; existing previews (from server) come first
    const existingCount = hImgPrev.length - hImgs.length;
    if (i < existingCount) return; // can't remove server images from here (UI only)
    const newI = i - existingCount;
    setHImgs(p=>p.filter((_,x)=>x!==newI));
    setHImgPrev(p=>p.filter((_,x)=>x!==i));
  };

  /* ══ ROOM IMAGES ══ */
  const addRoomImgs = (e) => {
    const files = [...e.target.files].filter(f => f.type.startsWith("image/") && f.size<=5*1024*1024);
    if (rImgs.length + files.length > 10) { setError("Max 10 images"); return; }
    setRImgs(p=>[...p,...files]);
    setRImgPrev(p=>[...p,...files.map(f=>URL.createObjectURL(f))]);
    e.target.value = "";
  };
  const removeNewRoomImg = (i) => {
    const existingCount = rImgPrev.length - rImgs.length;
    if (i < existingCount) return;
    const newI = i - existingCount;
    setRImgs(p=>p.filter((_,x)=>x!==newI));
    setRImgPrev(p=>p.filter((_,x)=>x!==i));
  };

  /* ══ HOTEL SUBMIT ══ */
  const submitHotel = async (e) => {
    e.preventDefault();
    if (!hf.hotelName.trim()) { setError("Hotel name zaruri hai"); return; }
    if (!hf.city.trim())      { setError("City zaruri hai"); return; }
    if (!editHotelId && hImgs.length===0) { setError("Kam se kam 1 image upload karo"); return; }

    setSubmitting(true); setError("");
    const fd = new FormData();
    const arrKeys = ["amenities","propertyHighlights","foodAndDining","safetyAndSecurity",
      "wellnessAndSpa","businessFacilities","mediaAndTechnology","transportServices","paymentMethods"];

    Object.entries(hf).forEach(([k,v]) => {
      if (arrKeys.includes(k)) {
        fd.append(k, JSON.stringify(v));
      } else if (typeof v === "boolean") {
        fd.append(k, String(v));
      } else if (v !== "" && v !== null && v !== undefined) {
        fd.append(k, v);
      }
    });
    hImgs.forEach(img => fd.append("hotelImages", img));

    try {
      if (editHotelId) {
        await axios.put(`${API_URL}/${editHotelId}`, fd, {
          headers: { Authorization:`Bearer ${token}`, "Content-Type":"multipart/form-data" }
        });
      } else {
        await axios.post(API_URL, fd, {
          headers: { Authorization:`Bearer ${token}`, "Content-Type":"multipart/form-data" }
        });
      }
      closeHotelModal();
      load();
    } catch(e) { setError(e.response?.data?.message || "Save failed"); }
    setSubmitting(false);
  };

  /* ══ ROOM SUBMIT ══ */
  const submitRoom = async (e) => {
    e.preventDefault();
    if (!rf.roomType)       { setError("Room type zaruri hai"); return; }
    if (!rf.basePrice)      { setError("Base price zaruri hai"); return; }
    if (!rf.totalRooms)     { setError("Total rooms zaruri hai"); return; }
    if (!rf.availableRooms) { setError("Available rooms zaruri hai"); return; }

    setSubmitting(true); setError("");
    const fd = new FormData();
    Object.entries(rf).forEach(([k,v]) => {
      if (typeof v === "boolean") {
        fd.append(k, String(v));
      } else if (v !== "" && v !== null && v !== undefined) {
        fd.append(k, v);
      }
    });
    rImgs.forEach(img => fd.append("roomGallery", img));

    try {
      if (editRoomId) {
        await axios.put(`${API_URL}/${selHotelId}/rooms/${editRoomId}`, fd, {
          headers: { Authorization:`Bearer ${token}`, "Content-Type":"multipart/form-data" }
        });
      } else {
        await axios.post(`${API_URL}/${selHotelId}/rooms`, fd, {
          headers: { Authorization:`Bearer ${token}`, "Content-Type":"multipart/form-data" }
        });
      }
      closeRoomModal();
      const res = await axios.get(API_URL, { headers: { Authorization:`Bearer ${token}` } });
      setHotels(res.data);
      const updated = res.data.find(h => h._id === (selHotelId || curHotel?._id));
      if (updated) setCurHotel(updated);
    } catch(e) { setError(e.response?.data?.message || "Save failed"); }
    setSubmitting(false);
  };

  /* ══ OPEN EDIT HOTEL ══ */
  const openEditHotel = (h) => {
    setEditHotelId(h._id);
    setHf({
      hotelName:      h.hotelName      || "",
      hotelType:      h.hotelType      || "",
      description:    h.description    || "",
      starRating:     h.starRating     != null ? String(h.starRating) : "",
      yearBuilt:      h.yearBuilt      != null ? String(h.yearBuilt)  : "",
      phone:          h.phone          || "",
      alternatePhone: h.alternatePhone || "",
      email:          h.email          || "",
      website:        h.website        || "",
      country:        h.country        || "India",
      state:          h.state          || "",
      city:           h.city           || "",
      area:           h.area           || "",
      address:        h.address        || "",
      pincode:        h.pincode        || "",
      landmark:       h.landmark       || "",
      latitude:       h.location?.coordinates?.[1] != null ? String(h.location.coordinates[1]) : "",
      longitude:      h.location?.coordinates?.[0] != null ? String(h.location.coordinates[0]) : "",
      amenities:          h.amenities          || [],
      propertyHighlights: h.propertyHighlights || [],
      foodAndDining:      h.foodAndDining      || [],
      safetyAndSecurity:  h.safetyAndSecurity  || [],
      wellnessAndSpa:     h.wellnessAndSpa     || [],
      businessFacilities: h.businessFacilities || [],
      mediaAndTechnology: h.mediaAndTechnology || [],
      transportServices:  h.transportServices  || [],
      paymentMethods:     h.paymentMethods     || [],
      checkInTime:          h.checkInTime          || "",
      checkOutTime:         h.checkOutTime         || "",
      earlyCheckInAllowed:  h.earlyCheckInAllowed  ?? false,
      lateCheckOutAllowed:  h.lateCheckOutAllowed  ?? false,
      cancellationPolicy:   h.cancellationPolicy   || "",
      childPolicy:          h.childPolicy          || "",
      petPolicy:            h.petPolicy            || "",
      coupleFriendly:       h.coupleFriendly        ?? true,
      localIdAllowed:       h.localIdAllowed        ?? true,
      pricePerNight:  h.pricePerNight  != null ? String(h.pricePerNight)  : "",
      taxPercentage:  h.taxPercentage  != null ? String(h.taxPercentage)  : "",
      serviceCharge:  h.serviceCharge  != null ? String(h.serviceCharge)  : "",
      extraBedCharge: h.extraBedCharge != null ? String(h.extraBedCharge) : "",
      refundPolicy:    h.refundPolicy    || "",
      gstNumber:       h.gstNumber       || "",
      virtualTourLink: h.virtualTourLink || "",
    });
    setHImgs([]);
    setHImgPrev(h.hotelImages || []);
    setTab("basic");
    setHotelModal(true);
  };

  /* ══ OPEN EDIT ROOM ══ */
  const openEditRoom = (hotelId, room) => {
    setSelHotelId(hotelId);
    setEditRoomId(room._id);
    setRf({
      roomType:     room.roomType     || "",
      roomName:     room.roomName     || "",
      description:  room.description  || "",
      floorNumber:  room.floorNumber  || "",
      roomSize:     room.roomSize     || "",
      viewType:     room.viewType     || "",
      basePrice:    room.basePrice    != null ? String(room.basePrice)    : "",
      offerPrice:   room.offerPrice   != null ? String(room.offerPrice)   : "",
      tax:          room.tax          != null ? String(room.tax)          : "",
      serviceCharge:room.serviceCharge!= null ? String(room.serviceCharge): "",
      totalRooms:   room.totalRooms   != null ? String(room.totalRooms)   : "",
      availableRooms:room.availableRooms!=null? String(room.availableRooms): "",
      maxGuests:    room.maxGuests    != null ? String(room.maxGuests)    : "",
      adults:       room.adults       != null ? String(room.adults)       : "",
      children:     room.children     != null ? String(room.children)     : "",
      bedType:           room.bedType           || "",
      bedCount:          room.bedCount != null ? String(room.bedCount) : "",
      extraBedAvailable: room.extraBedAvailable ?? false,
      extraBedCharge:    room.extraBedCharge != null ? String(room.extraBedCharge) : "",
      balcony:      room.balcony      ?? false,
      airCondition: room.airCondition ?? true,
      heater:       room.heater       ?? false,
      wifi:         room.wifi         ?? true,
      tv:           room.tv           ?? true,
      minibar:      room.minibar      ?? false,
      wardrobe:     room.wardrobe     ?? true,
      workDesk:     room.workDesk     ?? false,
      iron:         room.iron         ?? false,
      kitchen:      room.kitchen      ?? false,
      bathroomType: room.bathroomType || "Private",
      bathtub:      room.bathtub      ?? false,
      shower:       room.shower       ?? true,
      toiletries:   room.toiletries   ?? true,
      hairDryer:    room.hairDryer    ?? false,
      breakfastIncluded: room.breakfastIncluded ?? false,
      lunchIncluded:     room.lunchIncluded     ?? false,
      dinnerIncluded:    room.dinnerIncluded     ?? false,
      smokingAllowed:    room.smokingAllowed     ?? false,
      refundable:        room.refundable         ?? true,
      cancellationPolicy:room.cancellationPolicy || "",
      status:            room.status             || "available",
    });
    setRImgs([]);
    setRImgPrev(room.images || []);
    setRoomModal(true);
  };

  /* ══ DELETE ══ */
  const delHotel = async (id) => {
    if (!window.confirm("Hotel delete karna chahte ho?")) return;
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/${id}`, { headers: { Authorization:`Bearer ${token}` } });
      load();
    } catch(e) { setError("Delete failed"); }
    setLoading(false);
  };
  const delRoom = async (hotelId, roomId) => {
    if (!window.confirm("Room delete karna chahte ho?")) return;
    try {
      await axios.delete(`${API_URL}/${hotelId}/rooms/${roomId}`, { headers: { Authorization:`Bearer ${token}` } });
      const res = await axios.get(API_URL, { headers: { Authorization:`Bearer ${token}` } });
      setHotels(res.data);
      const updated = res.data.find(h => h._id === hotelId);
      if (updated) setCurHotel(updated);
    } catch(e) { setError("Delete failed"); }
  };

  /* ══ CLOSE MODALS ══ */
  const closeHotelModal = () => {
    setHotelModal(false); setEditHotelId(null);
    setHf({ ...emptyHotel }); setHImgs([]); setHImgPrev([]);
    setTab("basic"); setError("");
  };
  const closeRoomModal = () => {
    setRoomModal(false); setEditRoomId(null); setSelHotelId(null);
    setRf({ ...emptyRoom }); setRImgs([]); setRImgPrev([]); setError("");
  };

  /* ══════════════════════════════════════
     MINI COMPONENTS — defined OUTSIDE render to avoid re-creation
  ══════════════════════════════════════ */

  /* ══ RENDER ══ */
  return (
    <div style={s.page}>

      {/* HEADER */}
      <div style={s.hdr}>
        <div>
          <h1 style={s.h1}>🏨 {roomsView ? `Rooms — ${curHotel?.hotelName}` : "Manage Hotels"}</h1>
          <p style={s.sub}>{roomsView ? `${curHotel?.rooms?.length||0} room(s)` : `${filtered.length} hotel(s)`}</p>
        </div>
        <div style={{display:"flex",gap:12}}>
          {roomsView ? (
            <>
              <Btn gray onClick={()=>setRoomsView(false)}>← Back</Btn>
              <Btn blue onClick={()=>{ setSelHotelId(curHotel._id); setRoomModal(true); }}>➕ Add Room</Btn>
            </>
          ) : (
            <>
              <Btn gray onClick={()=>setShowF(p=>!p)}>🔍 Filters</Btn>
              <Btn blue onClick={()=>setHotelModal(true)} disabled={loading}>➕ Add Hotel</Btn>
            </>
          )}
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div style={s.err}>
          <span>⚠️ {error}</span>
          <button onClick={()=>setError("")} style={{background:"none",border:"none",color:"#991b1b",fontSize:18,cursor:"pointer"}}>✕</button>
        </div>
      )}

      {/* FILTERS */}
      {!roomsView && showF && (
        <div style={s.filterBox}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:16,marginBottom:14}}>
            <FI label="Search" placeholder="Name ya city…" value={filt.q} onChange={e=>setFilt(p=>({...p,q:e.target.value}))} />
            <FI label="City" placeholder="e.g. Mumbai" value={filt.city} onChange={e=>setFilt(p=>({...p,city:e.target.value}))} />
            <FS label="Hotel Type" value={filt.hotelType} onChange={e=>setFilt(p=>({...p,hotelType:e.target.value}))} options={HOTEL_TYPES} placeholder="All Types" />
            <FS label="Sort By" value={filt.sort} onChange={e=>setFilt(p=>({...p,sort:e.target.value}))}
              options={[{v:"newest",l:"Newest"},{v:"rating",l:"Best Rated"},{v:"name",l:"Name A-Z"},{v:"rooms",l:"Most Rooms"}]} />
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:13,color:"#64748b"}}>Showing {filtered.length} of {hotels.length}</span>
            <Btn gray onClick={()=>setFilt({q:"",city:"",hotelType:"",sort:"newest"})}>Reset</Btn>
          </div>
        </div>
      )}

      {/* HOTELS TABLE */}
      {!roomsView && (
        <>
          {loading && <div style={s.loader}>Loading…</div>}
          {!loading && filtered.length===0 && (
            <div style={s.empty}>
              <div style={{fontSize:64}}>🏨</div>
              <p style={{fontSize:20,fontWeight:600,color:"#374151"}}>{hotels.length===0?"":""}</p>
              <p style={{color:"#9ca3af"}}>{hotels.length===0?'"Add Hotel" click karo':"Filters adjust karo"}</p>
            </div>
          )}
          {!loading && filtered.length>0 && (
            <div style={s.tblWrap}>
              <table style={s.tbl}>
                <thead>
                  <tr style={{backgroundColor:"#f8fafc"}}>
                    {["Image","Hotel Info","Location","Type / Stars","Rooms","Pricing","Status","Actions"].map(h=>(
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(h=>(
                    <tr key={h._id} style={s.tr}>
                      <td style={s.td}>
                        {h.hotelImages?.[0] ? <img src={h.hotelImages[0]} alt="" style={s.thumb}/> : <div style={s.noThumb}>🏨</div>}
                        {h.hotelImages?.length>1 && <div style={{fontSize:10,color:"#9ca3af",textAlign:"center",marginTop:3}}>+{h.hotelImages.length-1}</div>}
                      </td>
                      <td style={s.td}>
                        <div style={{fontWeight:700,fontSize:14,color:"#111"}}>{h.hotelName}</div>
                        {h.description && <div style={{fontSize:12,color:"#6b7280",maxWidth:190}}>{h.description.slice(0,65)}{h.description.length>65?"…":""}</div>}
                        {h.phone && <div style={{fontSize:11,color:"#9ca3af",marginTop:2}}>📞 {h.phone}</div>}
                        {h.email && <div style={{fontSize:11,color:"#9ca3af"}}>✉️ {h.email}</div>}
                        {h.gstNumber && <div style={{fontSize:11,color:"#9ca3af"}}>GST: {h.gstNumber}</div>}
                      </td>
                      <td style={s.td}>
                        <div style={{fontSize:13}}>📍 {[h.city,h.state].filter(Boolean).join(", ")}</div>
                        {h.address && <div style={{fontSize:11,color:"#9ca3af",marginTop:2}}>{h.address.slice(0,45)}</div>}
                        {h.landmark && <div style={{fontSize:11,color:"#9ca3af"}}>Near: {h.landmark}</div>}
                      </td>
                      <td style={s.td}>
                        {h.hotelType && <span style={s.badge}>{h.hotelType}</span>}
                        <div style={{marginTop:5,fontSize:15}}>{"⭐".repeat(h.starRating||0)||"—"}</div>
                        {h.yearBuilt && <div style={{fontSize:11,color:"#9ca3af"}}>Est. {h.yearBuilt}</div>}
                      </td>
                      <td style={s.td}>
                        <div style={{fontWeight:700}}>🛏️ {h.rooms?.length||0}</div>
                        <button style={s.viewBtn} onClick={()=>{ setCurHotel(h); setRoomsView(true); }}>View Rooms</button>
                      </td>
                      <td style={s.td}>
                        {h.pricePerNight && <div style={{fontWeight:700,color:"#2563eb",fontSize:15}}>₹{h.pricePerNight}<span style={{fontWeight:400,fontSize:11,color:"#9ca3af"}}>/night</span></div>}
                        {h.taxPercentage && <div style={{fontSize:11,color:"#6b7280"}}>Tax: {h.taxPercentage}%</div>}
                        {h.serviceCharge && <div style={{fontSize:11,color:"#6b7280"}}>Svc: ₹{h.serviceCharge}</div>}
                      </td>
                      <td style={s.td}>
                        <span style={{...s.pill,...(h.status==="approved"?s.green:h.status==="rejected"?s.red:s.yellow)}}>{h.status}</span>
                        {h.featured && <span style={{...s.pill,...s.blue,marginTop:4,display:"block"}}>⭐ Featured</span>}
                        {!h.isActive && <span style={{...s.pill,...s.red,marginTop:4,display:"block"}}>Inactive</span>}
                      </td>
                      <td style={s.td}>
                        <div style={{display:"flex",gap:8}}>
                          <button style={s.eBtn} onClick={()=>openEditHotel(h)}>✏️</button>
                          <button style={s.dBtn} onClick={()=>delHotel(h._id)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ROOMS VIEW */}
      {roomsView && curHotel && (
        <>
          {!curHotel.rooms?.length ? (
            <div style={s.empty}>
              <div style={{fontSize:64}}>🛏️</div>
              <p style={{fontSize:20,fontWeight:600}}>Koi room nahi hai</p>
              <p style={{color:"#9ca3af"}}>"Add Room" click karo</p>
            </div>
          ) : (
            <div style={s.rGrid}>
              {curHotel.rooms.map(room=>(
                <div key={room._id} style={s.rCard}>
                  {room.images?.length>0 && (
                    <div style={{position:"relative",height:210,overflow:"hidden"}}>
                      <img src={room.images[0]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                      {room.images.length>1 && <span style={s.imgBadge}>+{room.images.length-1}</span>}
                      <span style={{...s.pill,...(room.status==="available"?s.green:s.red),position:"absolute",top:10,left:10}}>{room.status}</span>
                    </div>
                  )}
                  <div style={{padding:20}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                      <div>
                        <h3 style={{margin:0,fontSize:17,fontWeight:700,color:"#111"}}>{room.roomType}{room.roomName?` — ${room.roomName}`:""}</h3>
                        {room.viewType && <div style={{fontSize:12,color:"#6b7280",marginTop:2}}>👁 {room.viewType}</div>}
                      </div>
                      {!room.images?.length && <span style={{...s.pill,...(room.status==="available"?s.green:s.red)}}>{room.status}</span>}
                    </div>

                    <div style={s.mGrid}>
                      {[["Floor",room.floorNumber],["Size",room.roomSize],["Bed",room.bedType],
                        ["Beds",room.bedCount],["Max",room.maxGuests],["Adults",room.adults],
                        ["Kids",room.children],["Total",room.totalRooms],["Avail",room.availableRooms],
                        ["Bath",room.bathroomType]].filter(([,v])=>v!=null&&v!=="").map(([k,v])=>(
                        <div key={k} style={s.mItem}><span style={s.mK}>{k}</span><span style={s.mV}>{v}</span></div>
                      ))}
                    </div>

                    <div style={{...s.tags,marginBottom:7}}>
                      {room.wifi&&<span style={s.tGray}>📶</span>}{room.airCondition&&<span style={s.tGray}>❄️ AC</span>}
                      {room.tv&&<span style={s.tGray}>📺</span>}{room.minibar&&<span style={s.tGray}>🍷</span>}
                      {room.balcony&&<span style={s.tGray}>🌅 Balcony</span>}{room.wardrobe&&<span style={s.tGray}>🚪</span>}
                      {room.workDesk&&<span style={s.tGray}>💼 Desk</span>}{room.kitchen&&<span style={s.tGray}>🍳</span>}
                      {room.heater&&<span style={s.tGray}>🔥</span>}{room.iron&&<span style={s.tGray}>👔</span>}
                    </div>
                    <div style={{...s.tags,marginBottom:7}}>
                      {room.bathtub&&<span style={s.tBlue}>🛁</span>}{room.shower&&<span style={s.tBlue}>🚿</span>}
                      {room.toiletries&&<span style={s.tBlue}>🧴</span>}{room.hairDryer&&<span style={s.tBlue}>💨</span>}
                    </div>
                    <div style={{...s.tags,marginBottom:7}}>
                      {room.breakfastIncluded&&<span style={s.tGreen}>🍳 Breakfast</span>}
                      {room.lunchIncluded&&<span style={s.tGreen}>🍽️ Lunch</span>}
                      {room.dinnerIncluded&&<span style={s.tGreen}>🌙 Dinner</span>}
                    </div>
                    <div style={{...s.tags,marginBottom:10}}>
                      {room.refundable&&<span style={s.tYellow}>✅ Refundable</span>}
                      {room.smokingAllowed&&<span style={s.tYellow}>🚬 Smoking</span>}
                      {room.extraBedAvailable&&<span style={s.tYellow}>🛏️ Extra Bed</span>}
                    </div>

                    {room.description&&<p style={{fontSize:12,color:"#6b7280",lineHeight:1.6,marginBottom:12}}>{room.description}</p>}

                    <div style={{borderTop:"1px solid #f1f5f9",paddingTop:12,display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
                      <div>
                        <div style={{fontSize:23,fontWeight:800,color:"#2563eb"}}>₹{room.basePrice}<span style={{fontSize:12,color:"#9ca3af",fontWeight:400}}>/night</span></div>
                        {room.offerPrice&&<div style={{fontSize:13,color:"#16a34a",fontWeight:600}}>🏷️ ₹{room.offerPrice}</div>}
                        {(room.tax||room.serviceCharge)&&<div style={{fontSize:11,color:"#9ca3af"}}>{room.tax?`+${room.tax}% tax `:""}{room.serviceCharge?`+₹${room.serviceCharge}`:""}</div>}
                      </div>
                      <div style={{display:"flex",gap:8}}>
                        <button style={s.eBtn} onClick={()=>openEditRoom(curHotel._id,room)}>✏️</button>
                        <button style={s.dBtn} onClick={()=>delRoom(curHotel._id,room._id)}>🗑️</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ════ HOTEL MODAL ════ */}
      {hotelModal && (
        <div style={s.overlay} onClick={closeHotelModal}>
          <div style={s.modal} onClick={e=>e.stopPropagation()}>

            <div style={s.mHead}>
              <h2 style={{margin:0,fontSize:21,fontWeight:700}}>{editHotelId?"✏️ Edit Hotel":"➕ Add Hotel"}</h2>
              <button style={s.xBtn} onClick={closeHotelModal}>✕</button>
            </div>

            {/* TABS */}
            <div style={s.tabBar}>
              {[["basic","🏨 Basic"],["location","📍 Location"],["facilities","✨ Facilities"],
                ["policies","📋 Policies"],["pricing","💰 Pricing"],["media","📸 Media"]].map(([k,l])=>(
                <button key={k} type="button"
                  style={{...s.tabBtn,...(tab===k?s.tabOn:{})}}
                  onClick={()=>setTab(k)}>{l}</button>
              ))}
            </div>

            <form onSubmit={submitHotel} style={s.mBody}>

              {/* ── BASIC TAB ── */}
              {tab==="basic" && (
                <div style={s.g2}>
                  <div style={{gridColumn:"1/-1"}}>
                    <Label>Hotel Name *</Label>
                    <input value={hf.hotelName} onChange={e=>setH("hotelName",e.target.value)}
                      placeholder="e.g. Grand Palace Hotel" style={s.inp} required />
                  </div>

                  <div>
                    <Label>Hotel Type</Label>
                    <select value={hf.hotelType} onChange={e=>setH("hotelType",e.target.value)} style={s.sel}>
                      <option value="">Select Type</option>
                      {HOTEL_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <div>
                    <Label>Star Rating</Label>
                    <select value={hf.starRating} onChange={e=>setH("starRating",e.target.value)} style={s.sel}>
                      <option value="">Select Stars</option>
                      {STAR_RATINGS.map(r=><option key={r} value={r}>{"⭐".repeat(r)} ({r} Star)</option>)}
                    </select>
                  </div>

                  <div>
                    <Label>Year Built</Label>
                    <input type="number" value={hf.yearBuilt} onChange={e=>setH("yearBuilt",e.target.value)}
                      placeholder="e.g. 2010" style={s.inp} />
                  </div>

                  <div>
                    <Label>GST Number</Label>
                    <input value={hf.gstNumber} onChange={e=>setH("gstNumber",e.target.value)}
                      placeholder="22AAAAA0000A1Z5" style={s.inp} />
                  </div>

                  <div style={{gridColumn:"1/-1"}}>
                    <Label>Description</Label>
                    <textarea value={hf.description} onChange={e=>setH("description",e.target.value)}
                      placeholder="Hotel ke baare mein likhein…" rows={4} style={{...s.inp,resize:"vertical"}} />
                  </div>

                  <div>
                    <Label>Phone</Label>
                    <input value={hf.phone} onChange={e=>setH("phone",e.target.value)}
                      placeholder="+91 98765 43210" style={s.inp} />
                  </div>

                  <div>
                    <Label>Alternate Phone</Label>
                    <input value={hf.alternatePhone} onChange={e=>setH("alternatePhone",e.target.value)}
                      placeholder="+91 98765 43211" style={s.inp} />
                  </div>

                  <div>
                    <Label>Email</Label>
                    <input type="email" value={hf.email} onChange={e=>setH("email",e.target.value)}
                      placeholder="hotel@example.com" style={s.inp} />
                  </div>

                  <div>
                    <Label>Website</Label>
                    <input value={hf.website} onChange={e=>setH("website",e.target.value)}
                      placeholder="https://yourhotel.com" style={s.inp} />
                  </div>
                </div>
              )}

              {/* ── LOCATION TAB ── */}
              {tab==="location" && (
                <div style={s.g2}>
                  <div>
                    <Label>Country</Label>
                    <input value={hf.country} onChange={e=>setH("country",e.target.value)} placeholder="India" style={s.inp} />
                  </div>
                  <div>
                    <Label>State</Label>
                    <input value={hf.state} onChange={e=>setH("state",e.target.value)} placeholder="Maharashtra" style={s.inp} />
                  </div>
                  <div>
                    <Label>City *</Label>
                    <input value={hf.city} onChange={e=>setH("city",e.target.value)} placeholder="Mumbai" style={s.inp} required />
                  </div>
                  <div>
                    <Label>Area / Locality</Label>
                    <input value={hf.area} onChange={e=>setH("area",e.target.value)} placeholder="Bandra West" style={s.inp} />
                  </div>
                  <div>
                    <Label>Pincode</Label>
                    <input value={hf.pincode} onChange={e=>setH("pincode",e.target.value)} placeholder="400001" style={s.inp} />
                  </div>
                  <div>
                    <Label>Landmark</Label>
                    <input value={hf.landmark} onChange={e=>setH("landmark",e.target.value)} placeholder="Near Gateway of India" style={s.inp} />
                  </div>
                  <div style={{gridColumn:"1/-1"}}>
                    <Label>Full Address</Label>
                    <textarea value={hf.address} onChange={e=>setH("address",e.target.value)}
                      placeholder="Building, Street, Area…" rows={2} style={{...s.inp,resize:"vertical"}} />
                  </div>
                  <div>
                    <Label>Latitude</Label>
                    <input type="number" step="any" value={hf.latitude} onChange={e=>setH("latitude",e.target.value)}
                      placeholder="19.0760" style={s.inp} />
                  </div>
                  <div>
                    <Label>Longitude</Label>
                    <input type="number" step="any" value={hf.longitude} onChange={e=>setH("longitude",e.target.value)}
                      placeholder="72.8777" style={s.inp} />
                  </div>
                </div>
              )}

              {/* ── FACILITIES TAB ── */}
              {tab==="facilities" && (
                <div style={{display:"flex",flexDirection:"column",gap:20}}>
                  {[
                    ["Amenities",           AMENITIES_LIST,  "amenities"],
                    ["Property Highlights", PROP_HIGHLIGHTS, "propertyHighlights"],
                    ["Food & Dining",       FOOD_DINING,     "foodAndDining"],
                    ["Safety & Security",   SAFETY_LIST,     "safetyAndSecurity"],
                    ["Wellness & Spa",      WELLNESS_LIST,   "wellnessAndSpa"],
                    ["Business Facilities", BUSINESS_LIST,   "businessFacilities"],
                    ["Media & Technology",  MEDIA_LIST,      "mediaAndTechnology"],
                    ["Transport Services",  TRANSPORT_LIST,  "transportServices"],
                    ["Payment Methods",     PAYMENT_METHODS, "paymentMethods"],
                  ].map(([lbl, opts, key])=>(
                    <div key={key}>
                      <Label>{lbl}</Label>
                      <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:6}}>
                        {opts.map(o=>(
                          <button key={o} type="button"
                            onClick={()=>chipToggle(key,o)}
                            style={{...s.chip,...(hf[key].includes(o)?s.chipOn:{})}}>
                            {o}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── POLICIES TAB ── */}
              {tab==="policies" && (
                <div style={s.g2}>
                  <div>
                    <Label>Check-In Time</Label>
                    <input type="time" value={hf.checkInTime} onChange={e=>setH("checkInTime",e.target.value)} style={s.inp} />
                  </div>
                  <div>
                    <Label>Check-Out Time</Label>
                    <input type="time" value={hf.checkOutTime} onChange={e=>setH("checkOutTime",e.target.value)} style={s.inp} />
                  </div>

                  <div style={{gridColumn:"1/-1"}}>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:12}}>
                      <CbRow label="Early Check-In" checked={hf.earlyCheckInAllowed} onChange={v=>setH("earlyCheckInAllowed",v)} />
                      <CbRow label="Late Check-Out"  checked={hf.lateCheckOutAllowed}  onChange={v=>setH("lateCheckOutAllowed",v)} />
                      <CbRow label="Couple Friendly" checked={hf.coupleFriendly}       onChange={v=>setH("coupleFriendly",v)} />
                      <CbRow label="Local ID Allowed" checked={hf.localIdAllowed}      onChange={v=>setH("localIdAllowed",v)} />
                    </div>
                  </div>

                  <div style={{gridColumn:"1/-1"}}>
                    <Label>Cancellation Policy</Label>
                    <textarea value={hf.cancellationPolicy} onChange={e=>setH("cancellationPolicy",e.target.value)}
                      placeholder="Free cancellation 24 hrs before check-in…" rows={3} style={{...s.inp,resize:"vertical"}} />
                  </div>
                  <div>
                    <Label>Child Policy</Label>
                    <textarea value={hf.childPolicy} onChange={e=>setH("childPolicy",e.target.value)}
                      placeholder="Children below 5 stay free…" rows={3} style={{...s.inp,resize:"vertical"}} />
                  </div>
                  <div>
                    <Label>Pet Policy</Label>
                    <textarea value={hf.petPolicy} onChange={e=>setH("petPolicy",e.target.value)}
                      placeholder="Pets not allowed…" rows={3} style={{...s.inp,resize:"vertical"}} />
                  </div>
                  <div style={{gridColumn:"1/-1"}}>
                    <Label>Refund Policy</Label>
                    <textarea value={hf.refundPolicy} onChange={e=>setH("refundPolicy",e.target.value)}
                      placeholder="Full refund 48 hrs in advance…" rows={3} style={{...s.inp,resize:"vertical"}} />
                  </div>
                </div>
              )}

              {/* ── PRICING TAB ── */}
              {tab==="pricing" && (
                <div style={s.g2}>
                  <div>
                    <Label>Starting Price / Night (₹)</Label>
                    <input type="number" value={hf.pricePerNight} onChange={e=>setH("pricePerNight",e.target.value)}
                      placeholder="2500" style={s.inp} />
                  </div>
                  <div>
                    <Label>Tax (%)</Label>
                    <input type="number" value={hf.taxPercentage} onChange={e=>setH("taxPercentage",e.target.value)}
                      placeholder="18" style={s.inp} />
                  </div>
                  <div>
                    <Label>Service Charge (₹)</Label>
                    <input type="number" value={hf.serviceCharge} onChange={e=>setH("serviceCharge",e.target.value)}
                      placeholder="200" style={s.inp} />
                  </div>
                  <div>
                    <Label>Extra Bed Charge (₹)</Label>
                    <input type="number" value={hf.extraBedCharge} onChange={e=>setH("extraBedCharge",e.target.value)}
                      placeholder="500" style={s.inp} />
                  </div>
                </div>
              )}

              {/* ── MEDIA TAB ── */}
              {tab==="media" && (
                <div style={{display:"flex",flexDirection:"column",gap:20}}>
                  <div>
                    <Label>Hotel Images (Max 10){!editHotelId&&<span style={{color:"#e11d48"}}> *</span>}</Label>
                    <div style={s.gallery}>
                      {hImgPrev.map((src,i)=>(
                        <div key={i} style={s.gItem}>
                          <img src={src} alt="" style={s.gImg}/>
                          <button type="button" style={s.gX} onClick={()=>removeNewHotelImg(i)}>✕</button>
                        </div>
                      ))}
                      {hImgPrev.length < 10 && (
                        <label style={s.gAdd}>
                          ➕ Add
                          <input type="file" multiple accept="image/*" hidden onChange={addHotelImgs}/>
                        </label>
                      )}
                    </div>
                    <p style={{fontSize:12,color:"#9ca3af",marginTop:6}}>Max 10 • Max 5MB each • JPG/PNG/WEBP</p>
                  </div>
                  <div>
                    <Label>Virtual Tour Link</Label>
                    <input value={hf.virtualTourLink} onChange={e=>setH("virtualTourLink",e.target.value)}
                      placeholder="https://my360tour.com/hotel" style={s.inp} />
                  </div>
                </div>
              )}

              <div style={s.mFoot}>
                <button type="button" style={s.btnG} onClick={closeHotelModal} disabled={submitting}>Cancel</button>
                <button type="submit" style={s.btnB} disabled={submitting}>
                  {submitting?"⏳ Saving…":editHotelId?"💾 Update Hotel":"➕ Add Hotel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════ ROOM MODAL ════ */}
      {roomModal && (
        <div style={s.overlay} onClick={closeRoomModal}>
          <div style={s.modal} onClick={e=>e.stopPropagation()}>

            <div style={s.mHead}>
              <h2 style={{margin:0,fontSize:21,fontWeight:700}}>{editRoomId?"✏️ Edit Room":"➕ Add Room"}</h2>
              <button style={s.xBtn} onClick={closeRoomModal}>✕</button>
            </div>

            <form onSubmit={submitRoom} style={s.mBody}>

              {/* BASIC */}
              <SH>🛏️ Basic Information</SH>
              <div style={s.g3}>
                <div>
                  <Label>Room Type *</Label>
                  <input value={rf.roomType} onChange={e=>setR("roomType",e.target.value)}
                    placeholder="e.g. Deluxe Suite" style={s.inp} required />
                </div>
                <div>
                  <Label>Room Name</Label>
                  <input value={rf.roomName} onChange={e=>setR("roomName",e.target.value)}
                    placeholder="e.g. Ocean Suite" style={s.inp} />
                </div>
                <div>
                  <Label>Floor Number</Label>
                  <input value={rf.floorNumber} onChange={e=>setR("floorNumber",e.target.value)}
                    placeholder="5th Floor" style={s.inp} />
                </div>
                <div>
                  <Label>Room Size</Label>
                  <input value={rf.roomSize} onChange={e=>setR("roomSize",e.target.value)}
                    placeholder="45 sqm" style={s.inp} />
                </div>
                <div>
                  <Label>View Type</Label>
                  <select value={rf.viewType} onChange={e=>setR("viewType",e.target.value)} style={s.sel}>
                    <option value="">Select View</option>
                    {VIEW_TYPES.map(v=><option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Status</Label>
                  <select value={rf.status} onChange={e=>setR("status",e.target.value)} style={s.sel}>
                    <option value="available">Available</option>
                    <option value="soldout">Sold Out</option>
                  </select>
                </div>
              </div>
              <div style={{marginTop:12}}>
                <Label>Description</Label>
                <textarea value={rf.description} onChange={e=>setR("description",e.target.value)}
                  placeholder="Room ka description…" rows={3} style={{...s.inp,resize:"vertical"}} />
              </div>

              {/* BED & CAPACITY */}
              <SH>👥 Bed & Capacity</SH>
              <div style={s.g3}>
                <div>
                  <Label>Bed Type</Label>
                  <select value={rf.bedType} onChange={e=>setR("bedType",e.target.value)} style={s.sel}>
                    <option value="">Select Bed</option>
                    {BED_TYPES.map(b=><option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Number of Beds</Label>
                  <input type="number" min="1" value={rf.bedCount} onChange={e=>setR("bedCount",e.target.value)}
                    placeholder="1" style={s.inp} />
                </div>
                <div>
                  <Label>Max Guests</Label>
                  <input type="number" min="1" value={rf.maxGuests} onChange={e=>setR("maxGuests",e.target.value)}
                    placeholder="2" style={s.inp} />
                </div>
                <div>
                  <Label>Adults</Label>
                  <input type="number" min="1" value={rf.adults} onChange={e=>setR("adults",e.target.value)}
                    placeholder="2" style={s.inp} />
                </div>
                <div>
                  <Label>Children</Label>
                  <input type="number" min="0" value={rf.children} onChange={e=>setR("children",e.target.value)}
                    placeholder="0" style={s.inp} />
                </div>
                <div>
                  <Label>Extra Bed Charge (₹)</Label>
                  <input type="number" value={rf.extraBedCharge} onChange={e=>setR("extraBedCharge",e.target.value)}
                    placeholder="500" style={s.inp} disabled={!rf.extraBedAvailable} />
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:12,marginTop:10}}>
                <CbRow label="Extra Bed Available" checked={rf.extraBedAvailable} onChange={v=>setR("extraBedAvailable",v)} />
              </div>

              {/* INVENTORY & PRICING */}
              <SH>💰 Inventory & Pricing</SH>
              <div style={s.g2}>
                <div>
                  <Label>Total Rooms *</Label>
                  <input type="number" min="1" value={rf.totalRooms} onChange={e=>setR("totalRooms",e.target.value)}
                    placeholder="10" style={s.inp} required />
                </div>
                <div>
                  <Label>Available Rooms *</Label>
                  <input type="number" min="0" value={rf.availableRooms} onChange={e=>setR("availableRooms",e.target.value)}
                    placeholder="8" style={s.inp} required />
                </div>
                <div>
                  <Label>Base Price (₹) *</Label>
                  <input type="number" min="0" value={rf.basePrice} onChange={e=>setR("basePrice",e.target.value)}
                    placeholder="2500" style={s.inp} required />
                </div>
                <div>
                  <Label>Offer Price (₹)</Label>
                  <input type="number" min="0" value={rf.offerPrice} onChange={e=>setR("offerPrice",e.target.value)}
                    placeholder="2000" style={s.inp} />
                </div>
                <div>
                  <Label>Tax (%)</Label>
                  <input type="number" min="0" value={rf.tax} onChange={e=>setR("tax",e.target.value)}
                    placeholder="18" style={s.inp} />
                </div>
                <div>
                  <Label>Service Charge (₹)</Label>
                  <input type="number" min="0" value={rf.serviceCharge} onChange={e=>setR("serviceCharge",e.target.value)}
                    placeholder="100" style={s.inp} />
                </div>
              </div>

              {/* ROOM AMENITIES */}
              <SH>✨ Room Amenities</SH>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(175px,1fr))",gap:12}}>
                <CbRow label="📶 WiFi"       checked={rf.wifi}         onChange={v=>setR("wifi",v)} />
                <CbRow label="❄️ AC"         checked={rf.airCondition} onChange={v=>setR("airCondition",v)} />
                <CbRow label="📺 TV"         checked={rf.tv}           onChange={v=>setR("tv",v)} />
                <CbRow label="🍷 Minibar"    checked={rf.minibar}      onChange={v=>setR("minibar",v)} />
                <CbRow label="🌅 Balcony"    checked={rf.balcony}      onChange={v=>setR("balcony",v)} />
                <CbRow label="🚪 Wardrobe"   checked={rf.wardrobe}     onChange={v=>setR("wardrobe",v)} />
                <CbRow label="💼 Work Desk"  checked={rf.workDesk}     onChange={v=>setR("workDesk",v)} />
                <CbRow label="🔥 Heater"     checked={rf.heater}       onChange={v=>setR("heater",v)} />
                <CbRow label="🍳 Kitchen"    checked={rf.kitchen}      onChange={v=>setR("kitchen",v)} />
                <CbRow label="👔 Iron"       checked={rf.iron}         onChange={v=>setR("iron",v)} />
              </div>

              {/* BATHROOM */}
              <SH>🚿 Bathroom</SH>
              <div style={{marginBottom:14}}>
                <Label>Bathroom Type</Label>
                <select value={rf.bathroomType} onChange={e=>setR("bathroomType",e.target.value)} style={s.sel}>
                  {BATHROOM_TYPES.map(b=><option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(175px,1fr))",gap:12}}>
                <CbRow label="🛁 Bathtub"    checked={rf.bathtub}    onChange={v=>setR("bathtub",v)} />
                <CbRow label="🚿 Shower"     checked={rf.shower}     onChange={v=>setR("shower",v)} />
                <CbRow label="🧴 Toiletries" checked={rf.toiletries} onChange={v=>setR("toiletries",v)} />
                <CbRow label="💨 Hair Dryer" checked={rf.hairDryer}  onChange={v=>setR("hairDryer",v)} />
              </div>

              {/* MEALS */}
              <SH>🍽️ Meals Included</SH>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(175px,1fr))",gap:12}}>
                <CbRow label="🍳 Breakfast" checked={rf.breakfastIncluded} onChange={v=>setR("breakfastIncluded",v)} />
                <CbRow label="🍽️ Lunch"     checked={rf.lunchIncluded}     onChange={v=>setR("lunchIncluded",v)} />
                <CbRow label="🌙 Dinner"    checked={rf.dinnerIncluded}    onChange={v=>setR("dinnerIncluded",v)} />
              </div>

              {/* POLICIES */}
              <SH>📋 Policies</SH>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(175px,1fr))",gap:12,marginBottom:14}}>
                <CbRow label="🚬 Smoking Allowed" checked={rf.smokingAllowed} onChange={v=>setR("smokingAllowed",v)} />
                <CbRow label="✅ Refundable"       checked={rf.refundable}     onChange={v=>setR("refundable",v)} />
              </div>
              <div>
                <Label>Cancellation Policy</Label>
                <textarea value={rf.cancellationPolicy} onChange={e=>setR("cancellationPolicy",e.target.value)}
                  placeholder="Free cancellation 24 hrs before…" rows={3} style={{...s.inp,resize:"vertical"}} />
              </div>

              {/* IMAGES */}
              <SH>📸 Room Images (Max 10)</SH>
              <div style={s.gallery}>
                {rImgPrev.map((src,i)=>(
                  <div key={i} style={s.gItem}>
                    <img src={src} alt="" style={s.gImg}/>
                    <button type="button" style={s.gX} onClick={()=>removeNewRoomImg(i)}>✕</button>
                  </div>
                ))}
                {rImgPrev.length < 10 && (
                  <label style={s.gAdd}>
                    ➕ Add
                    <input type="file" multiple accept="image/*" hidden onChange={addRoomImgs}/>
                  </label>
                )}
              </div>
              <p style={{fontSize:12,color:"#9ca3af",marginTop:6}}>Max 10 images • Max 5MB each</p>

              <div style={s.mFoot}>
                <button type="button" style={s.btnG} onClick={closeRoomModal} disabled={submitting}>Cancel</button>
                <button type="submit" style={s.btnB} disabled={submitting}>
                  {submitting?"⏳ Saving…":editRoomId?"💾 Update Room":"➕ Add Room"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   HELPER COMPONENTS (outside main component)
════════════════════════════════════════ */
const Label = ({children}) => <label style={{display:"block",fontSize:13,fontWeight:700,color:"#374151",marginBottom:5}}>{children}</label>;
const SH    = ({children}) => <div style={{fontSize:14,fontWeight:800,color:"#1e293b",padding:"10px 0 8px",borderBottom:"2px solid #e2e8f0",marginTop:8,marginBottom:4}}>{children}</div>;
const Btn   = ({children,blue,gray,onClick,disabled}) => (
  <button onClick={onClick} disabled={disabled}
    style={{padding:"11px 22px",fontSize:14,fontWeight:700,border:"none",borderRadius:8,cursor:"pointer",
      color: blue?"#fff":"#374151", backgroundColor: blue?"#2563eb":"#e5e7eb"}}>
    {children}
  </button>
);
const CbRow = ({label,checked,onChange}) => (
  <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:14,fontWeight:500,color:"#374151",userSelect:"none"}}>
    <input type="checkbox" checked={checked} onChange={e=>onChange(e.target.checked)} style={{width:16,height:16,cursor:"pointer"}}/>
    <span>{label}</span>
  </label>
);
/* Filter-only mini components */
const FI = ({label,placeholder,value,onChange}) => (
  <div><label style={{display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:5}}>{label}</label>
    <input placeholder={placeholder} value={value} onChange={onChange} style={s.inp}/></div>
);
const FS = ({label,value,onChange,options,placeholder}) => (
  <div><label style={{display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:5}}>{label}</label>
    <select value={value} onChange={onChange} style={s.sel}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o=>typeof o==="object"
        ? <option key={o.v} value={o.v}>{o.l}</option>
        : <option key={o} value={o}>{o}</option>)}
    </select></div>
);

/* ════════════════════════════════════════
   STYLES
════════════════════════════════════════ */
const s = {
  page:    {maxWidth:1600,margin:"0 auto",padding:"32px 24px",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",backgroundColor:"#f1f5f9",minHeight:"100vh"},
  hdr:     {display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28,flexWrap:"wrap",gap:16},
  h1:      {fontSize:28,fontWeight:800,color:"#0f172a",margin:0},
  sub:     {fontSize:14,color:"#64748b",margin:"4px 0 0"},
  err:     {marginBottom:20,padding:"12px 16px",background:"#fee2e2",border:"1px solid #fca5a5",borderRadius:8,color:"#991b1b",display:"flex",justifyContent:"space-between",alignItems:"center"},
  filterBox:{background:"#fff",borderRadius:12,padding:20,marginBottom:20,boxShadow:"0 1px 4px rgba(0,0,0,0.06)"},
  loader:  {textAlign:"center",padding:64,fontSize:18,color:"#64748b"},
  empty:   {textAlign:"center",padding:"80px 24px",backgroundColor:"#fff",borderRadius:12,boxShadow:"0 1px 4px rgba(0,0,0,0.06)"},
  tblWrap: {background:"#fff",borderRadius:12,boxShadow:"0 1px 4px rgba(0,0,0,0.06)",overflowX:"auto"},
  tbl:     {width:"100%",borderCollapse:"collapse"},
  th:      {padding:"14px 16px",textAlign:"left",fontSize:11,fontWeight:800,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.6px",borderBottom:"2px solid #e2e8f0"},
  tr:      {borderBottom:"1px solid #f1f5f9"},
  td:      {padding:"14px 16px",fontSize:14,color:"#334155",verticalAlign:"middle"},
  thumb:   {width:90,height:68,objectFit:"cover",borderRadius:8,display:"block"},
  noThumb: {width:90,height:68,display:"flex",alignItems:"center",justifyContent:"center",background:"#f1f5f9",borderRadius:8,fontSize:30},
  badge:   {display:"inline-block",fontSize:12,fontWeight:700,color:"#1d4ed8",background:"#dbeafe",padding:"3px 10px",borderRadius:12},
  viewBtn: {marginTop:6,display:"block",padding:"5px 10px",fontSize:12,fontWeight:700,color:"#2563eb",background:"#eff6ff",border:"none",borderRadius:6,cursor:"pointer"},
  pill:    {display:"inline-block",fontSize:11,fontWeight:700,padding:"3px 9px",borderRadius:10},
  green:   {background:"#dcfce7",color:"#166534"},
  red:     {background:"#fee2e2",color:"#991b1b"},
  yellow:  {background:"#fef9c3",color:"#854d0e"},
  blue:    {background:"#dbeafe",color:"#1e40af"},
  eBtn:    {padding:"7px 11px",fontSize:16,background:"#eff6ff",border:"none",borderRadius:6,cursor:"pointer"},
  dBtn:    {padding:"7px 11px",fontSize:16,background:"#fee2e2",border:"none",borderRadius:6,cursor:"pointer"},
  rGrid:   {display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(360px,1fr))",gap:24,marginTop:24},
  rCard:   {background:"#fff",borderRadius:14,overflow:"hidden",boxShadow:"0 2px 10px rgba(0,0,0,0.07)"},
  imgBadge:{position:"absolute",bottom:10,right:10,background:"rgba(0,0,0,0.65)",color:"#fff",padding:"3px 10px",borderRadius:16,fontSize:12},
  mGrid:   {display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:12,paddingBottom:12,borderBottom:"1px solid #f1f5f9"},
  mItem:   {display:"flex",flexDirection:"column",gap:2},
  mK:      {fontSize:10,color:"#94a3b8",fontWeight:700,textTransform:"uppercase"},
  mV:      {fontSize:13,color:"#0f172a",fontWeight:600},
  tags:    {display:"flex",flexWrap:"wrap",gap:6},
  tGray:   {fontSize:11,padding:"3px 9px",background:"#f1f5f9",borderRadius:6,color:"#475569"},
  tBlue:   {fontSize:11,padding:"3px 9px",background:"#eff6ff",borderRadius:6,color:"#1d4ed8"},
  tGreen:  {fontSize:11,padding:"3px 9px",background:"#f0fdf4",borderRadius:6,color:"#15803d"},
  tYellow: {fontSize:11,padding:"3px 9px",background:"#fefce8",borderRadius:6,color:"#854d0e"},
  overlay: {position:"fixed",inset:0,background:"rgba(15,23,42,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20},
  modal:   {background:"#fff",borderRadius:16,width:"100%",maxWidth:940,maxHeight:"93vh",overflow:"auto",boxShadow:"0 25px 60px rgba(0,0,0,0.3)",display:"flex",flexDirection:"column"},
  mHead:   {display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 28px",borderBottom:"1px solid #e2e8f0",position:"sticky",top:0,background:"#fff",zIndex:2},
  xBtn:    {fontSize:22,color:"#94a3b8",background:"none",border:"none",cursor:"pointer"},
  tabBar:  {display:"flex",gap:2,padding:"0 28px",borderBottom:"1px solid #e2e8f0",overflowX:"auto",flexShrink:0,position:"sticky",top:62,background:"#fff",zIndex:1},
  tabBtn:  {padding:"12px 16px",fontSize:13,fontWeight:600,color:"#64748b",background:"none",border:"none",borderBottom:"3px solid transparent",cursor:"pointer",whiteSpace:"nowrap"},
  tabOn:   {color:"#2563eb",borderBottomColor:"#2563eb"},
  mBody:   {padding:"28px",display:"flex",flexDirection:"column",gap:18,overflow:"auto"},
  mFoot:   {display:"flex",justifyContent:"flex-end",gap:12,paddingTop:20,borderTop:"1px solid #e2e8f0",marginTop:8},
  g2:      {display:"grid",gridTemplateColumns:"1fr 1fr",gap:16},
  g3:      {display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16},
  inp:     {width:"100%",padding:"10px 14px",fontSize:14,border:"1.5px solid #d1d5db",borderRadius:8,outline:"none",fontFamily:"inherit",background:"#fff",color:"#111",boxSizing:"border-box"},
  sel:     {width:"100%",padding:"10px 14px",fontSize:14,border:"1.5px solid #d1d5db",borderRadius:8,outline:"none",fontFamily:"inherit",background:"#fff",cursor:"pointer",color:"#111",boxSizing:"border-box"},
  chip:    {padding:"7px 14px",background:"#f8fafc",border:"1.5px solid #e2e8f0",borderRadius:20,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",color:"#475569"},
  chipOn:  {background:"#2563eb",color:"#fff",borderColor:"#2563eb"},
  btnB:    {padding:"11px 22px",fontSize:14,fontWeight:700,color:"#fff",backgroundColor:"#2563eb",border:"none",borderRadius:8,cursor:"pointer"},
  btnG:    {padding:"11px 22px",fontSize:14,fontWeight:700,color:"#374151",backgroundColor:"#e5e7eb",border:"none",borderRadius:8,cursor:"pointer"},
  gallery: {display:"grid",gridTemplateColumns:"repeat(auto-fill,96px)",gap:10},
  gItem:   {position:"relative",width:96,height:76},
  gImg:    {width:"100%",height:"100%",objectFit:"cover",borderRadius:8,border:"1px solid #e2e8f0"},
  gX:      {position:"absolute",top:-7,right:-7,background:"#dc2626",color:"#fff",border:"none",borderRadius:"50%",width:22,height:22,cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center"},
  gAdd:    {width:96,height:76,border:"2px dashed #cbd5e1",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#94a3b8",cursor:"pointer",flexDirection:"column",gap:4,textAlign:"center"},
}; 
