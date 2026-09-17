import React, { useMemo, useState } from "react";
import "./BusManagementPanel.css";

const initialSeats = [
  ...["U1","U3","U5","U7","U9","U2","U4","U6","U8","U10","U11","U12","U13","U14","U15"].map((n,i)=>({id:n,deck:"upper",type:"sleeper",status:i===4||i===9||i===14?"booked":"available",fare:i<10?2000:1200})),
  ...["1","3","5","7","9","11","A","C","2","4","6","8","10","12","B","D","E","F","G","H","I"].map((n,i)=>({id:n,deck:"lower",type:i<12?"seater":"sleeper",status:[7,15,20].includes(i)?"booked":"available",fare:i<12?800:1200}))
];

const MENU = [
  ["dashboard","Dashboard"],["booking","Bus Booking"],["fleet","Fleet / Buses"],
  ["layouts","Seat Layouts"],["routes","Routes & Stops"],["schedule","Trips & Schedules"],
  ["crew","Crew"],["boarding","Boarding Operations"],["live","Live Operations"],
  ["rates","Rates & Inventory"],["policy","Cancellation Policy"],["analytics","Reports & Analytics"],
  ["campaigns","Campaigns"],["payments","Payments & Settlements"],["documents","Documents"],
  ["settings","Settings"]
];

export default function BusManagementPanel() {
  const [active, setActive] = useState("dashboard");
  const [seats, setSeats] = useState(initialSeats);
  const [selected, setSelected] = useState([]);
  const [trip, setTrip] = useState({
    service:"BMT-135891", route:"Lucknow → Delhi", type:"A/C Sleeper",
    date:"2026-09-17", fare:"₹800 / ₹1,200 / ₹2,000", departure:"05:00 PM",
    vehicle:"UP 80 FT 1234", driver:"", conductor:"", status:"Booking Open"
  });

  const booked = seats.filter(s=>s.status==="booked").length;
  const available = seats.filter(s=>s.status==="available").length;
  const occupancy = Math.round((booked / seats.length) * 100);

  const toggleSeat = id => {
    const seat = seats.find(s=>s.id===id);
    if (!seat || seat.status==="booked" || seat.status==="blocked") return;
    setSelected(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  };

  const blockSelected = () => {
    setSeats(p=>p.map(s=>selected.includes(s.id)?{...s,status:"blocked"}:s));
    setSelected([]);
  };

  const releaseSelected = () => {
    setSeats(p=>p.map(s=>selected.includes(s.id)?{...s,status:"available"}:s));
    setSelected([]);
  };

  const logout = () => {
    localStorage.removeItem("vendorToken");
    localStorage.removeItem("vendorUser");
    window.location.href="/vendor-login";
  };

  const content = useMemo(()=>{
    if(active==="dashboard") return <Dashboard booked={booked} available={available} occupancy={occupancy} setActive={setActive}/>;
    if(active==="booking") return <BookingConsole seats={seats} selected={selected} toggleSeat={toggleSeat} trip={trip} setTrip={setTrip} booked={booked} blockSelected={blockSelected} releaseSelected={releaseSelected}/>;
    if(active==="layouts") return <SeatLayoutBuilder seats={seats} setSeats={setSeats}/>;
    return <ModulePage title={MENU.find(x=>x[0]===active)?.[1] || "Bus Management"} active={active}/>;
  },[active,seats,selected,trip,booked,available,occupancy]);

  return (
    <div className="bmp">
      <aside className="bmp-sidebar">
        <div className="bmp-brand"><div className="bmp-logo">bmt</div><div><b>BMT Connect</b><small>Bus Operator</small></div></div>
        <div className="bmp-search">⌕ <input placeholder="Search menu..." /></div>
        <nav>{MENU.map(([id,label])=><button key={id} className={active===id?"active":""} onClick={()=>setActive(id)}><span>{icon(id)}</span>{label}</button>)}</nav>
        <button className="bmp-logout" onClick={logout}>↪ Sign out</button>
      </aside>
      <section className="bmp-shell">
        <header className="bmp-header">
          <div><b>Bus Management Panel</b><small>BirdMyTrip Partner Operations</small></div>
          <div className="bmp-header-actions"><button>?</button><button>🔔</button><div className="bmp-user">BO <span>Bus Operator<small>Approved Vendor</small></span></div></div>
        </header>
        {active==="booking" && <TripBar trip={trip} setTrip={setTrip}/>}
        <main>{content}</main>
      </section>
    </div>
  );
}

function Dashboard({booked,available,occupancy,setActive}) {
  return <div className="bmp-page">
    <div className="bmp-title"><div><small>BUS OPERATIONS</small><h1>Dashboard</h1><p>Manage today's trips, bookings, boarding and fleet from one place.</p></div><button className="primary" onClick={()=>setActive("booking")}>Open Booking Console</button></div>
    <div className="metric-grid">
      <Metric label="Today's Trips" value="12" sub="8 scheduled · 4 active"/>
      <Metric label="Bookings" value={booked} sub={`${available} seats available`}/>
      <Metric label="Passengers" value="148" sub="132 boarded"/>
      <Metric label="Seat Occupancy" value={`${occupancy}%`} sub="Across active inventory"/>
      <Metric label="Revenue" value="₹1,84,650" sub="+12.4% vs yesterday"/>
      <Metric label="Active Trips" value="4" sub="3 on time"/>
      <Metric label="Delayed Trips" value="1" sub="18 min average delay"/>
      <Metric label="Boarding Status" value="89%" sub="132 / 148 boarded"/>
    </div>
    <div className="dash-grid">
      <div className="panel"><div className="panel-head"><h3>Today's Operations</h3><button onClick={()=>setActive("schedule")}>View all</button></div>
        <TripRow route="Lucknow → Delhi" bus="UP 80 FT 1234" time="05:00 PM" status="Boarding"/>
        <TripRow route="Delhi → Jaipur" bus="UP 32 AB 9090" time="06:30 PM" status="Scheduled"/>
        <TripRow route="Agra → Lucknow" bus="UP 78 KL 2211" time="08:15 PM" status="Delayed"/>
      </div>
      <div className="panel"><div className="panel-head"><h3>Quick Actions</h3></div><div className="quick-grid">
        <button onClick={()=>setActive("booking")}>＋ New Booking</button><button onClick={()=>setActive("fleet")}>＋ Add Bus</button>
        <button onClick={()=>setActive("layouts")}>▦ Create Seat Layout</button><button onClick={()=>setActive("routes")}>⌖ Add Route</button>
        <button onClick={()=>setActive("schedule")}>◷ Schedule Trip</button><button onClick={()=>setActive("boarding")}>✓ Boarding Chart</button>
      </div></div>
    </div>
  </div>
}

function TripBar({trip,setTrip}) {
  return <div className="tripbar">
    <button className="back">‹</button><strong>{trip.service}</strong>
    <select value={trip.route} onChange={e=>setTrip({...trip,route:e.target.value})}><option>Lucknow → Delhi</option><option>Delhi → Jaipur</option></select>
    <span>{trip.type}</span><input type="date" value={trip.date} onChange={e=>setTrip({...trip,date:e.target.value})}/>
    <span>{trip.fare}</span><span>Departure: <b>{trip.departure}</b></span><button>More Info</button>
  </div>
}

function BookingConsole({seats,selected,toggleSeat,trip,setTrip,booked,blockSelected,releaseSelected}) {
  const upper=seats.filter(s=>s.deck==="upper"), lower=seats.filter(s=>s.deck==="lower");
  return <div className="booking-page">
    <div className="module-tabs"><button className="active">Booking</button><button>GDS</button><button>Configure</button><button>Schedule</button><button>Reports</button><button>Tickets / SMS</button><button>Trip Expenses</button></div>
    <div className="booking-grid">
      <section className="seat-panel">
        <div className="seat-links"><button>View Boarding Chart</button><button>More Boarding Chart Types</button><button>‹ Back</button></div>
        <Deck title="UPPER" seats={upper} selected={selected} onSeat={toggleSeat}/>
        <Deck title="LOWER" seats={lower} selected={selected} onSeat={toggleSeat} driver/>
        <div className="legend"><i className="available"/>Available <i className="selected"/>Selected <i className="booked"/>Booked <i className="blocked"/>Blocked</div>
        <div className="seat-summary"><span>Available <b>{seats.filter(s=>s.status==="available").length}</b></span><span>Booked <b>{booked}</b></span><span>Selected <b>{selected.length}</b></span></div>
      </section>
      <section className="ops-panel">
        <div className="form-row"><label>Seat Numbers</label><input value={selected.join(", ")} readOnly placeholder="Select seats from chart"/></div>
        <div className="two"><select><option>Select Boarding Point</option><option>Alambagh Bus Stand</option><option>Charbagh</option></select><select><option>Select Dropping Point</option><option>Anand Vihar ISBT</option><option>Kashmiri Gate</option></select></div>
        <Info label="Booked" value={`${booked}/${seats.length}`}/><Info label="Fare" value={trip.fare}/>
        <div className="divider"/>
        <Info label="Vehicle Number" value={trip.vehicle} action="ASSIGN / CHANGE BUS"/>
        <div className="form-row"><label>Driver Details</label><select value={trip.driver} onChange={e=>setTrip({...trip,driver:e.target.value})}><option value="">-- Select Driver --</option><option>Rajesh Kumar</option><option>Amit Singh</option></select></div>
        <div className="form-row"><label>Conductor Details</label><select value={trip.conductor} onChange={e=>setTrip({...trip,conductor:e.target.value})}><option value="">-- Select Conductor --</option><option>Sunil Yadav</option><option>Ravi Kumar</option></select></div>
        <div className="notice"><b>Driver:</b> {trip.driver||"Not configured"} <b>Bus:</b> {trip.vehicle}<button>Send SMS</button></div>
        <Info label="Current Status" value={trip.status} action="Close Booking"/>
        <p className="closing">Agent booking closes 2 hours before departure.</p>
        <div className="selection-actions"><button onClick={blockSelected} disabled={!selected.length}>Block Selected</button><button onClick={releaseSelected} disabled={!selected.length}>Release Selected</button><button className="primary" disabled={!selected.length}>Continue Booking</button></div>
      </section>
    </div>
  </div>
}

function Deck({title,seats,selected,onSeat,driver}) {
  return <div className="deck"><div className="deck-label">{driver?"◉ ":""}{title}</div><div className="seat-map">
    {driver && <div className="driver">◉</div>}
    {seats.map((s,i)=><React.Fragment key={s.id}>
      {i===Math.ceil(seats.length/2) && <div className="aisle"/>}
      <button title={`${s.id} · ₹${s.fare}`} onClick={()=>onSeat(s.id)} className={`seat ${s.type} ${s.status} ${selected.includes(s.id)?"selected":""}`}>{s.id}</button>
    </React.Fragment>)}
  </div></div>
}

function SeatLayoutBuilder({seats,setSeats}) {
  const [deck,setDeck]=useState("lower"), [type,setType]=useState("seater"), [name,setName]=useState("2x2 Sleeper / Seater");
  const deckSeats=seats.filter(s=>s.deck===deck);
  const add=()=>{const id=`${deck==="upper"?"U":"S"}${deckSeats.length+1}`;setSeats(p=>[...p,{id,deck,type,status:"available",fare:type==="sleeper"?1200:800}])};
  const remove=id=>setSeats(p=>p.filter(s=>s.id!==id));
  return <div className="bmp-page"><div className="bmp-title"><div><small>CONFIGURATION</small><h1>Seat Layout Builder</h1><p>Create upper/lower deck layouts and configure seat-wise inventory.</p></div><button className="primary">Save Layout</button></div>
    <div className="builder-grid"><aside className="builder-tools"><h3>Layout Settings</h3><label>Layout name<input value={name} onChange={e=>setName(e.target.value)}/></label><label>Deck<select value={deck} onChange={e=>setDeck(e.target.value)}><option value="lower">Lower Deck</option><option value="upper">Upper Deck</option></select></label><label>New seat type<select value={type} onChange={e=>setType(e.target.value)}><option value="seater">Seater</option><option value="sleeper">Sleeper / Berth</option></select></label><button onClick={add}>＋ Add Seat / Berth</button><hr/><p>Click × on any seat to remove it. Use this builder for custom operator layouts.</p></aside>
    <section className="builder-canvas"><div className="bus-front">BUS FRONT <span>◉ Driver</span></div><div className="builder-map">{deckSeats.map(s=><div className={`builder-seat ${s.type}`} key={s.id}><b>{s.id}</b><small>₹{s.fare}</small><button onClick={()=>remove(s.id)}>×</button></div>)}</div><div className="builder-footer">{deck.toUpperCase()} DECK · {deckSeats.length} seats/berths</div></section></div>
  </div>
}

function ModulePage({title,active}) {
  const descriptions={fleet:"Add buses, registration numbers, documents, amenities and maintenance.",routes:"Create routes, boarding points, dropping points and stop timings.",schedule:"Create trips and assign route, bus, driver, conductor and seat inventory.",crew:"Manage drivers, conductors, shifts and trip assignments.",boarding:"Passenger manifest, QR/manual boarding, walk-ins and no-shows.",live:"Track active trips, delays, operational alerts and trip status.",rates:"Manage fares, seat-wise pricing, quotas and trip inventory.",policy:"Configure cancellation, refund and no-show rules.",analytics:"Revenue, occupancy, route performance and operational reports.",campaigns:"Create offers, promotions and sponsored campaigns.",payments:"View payments, deductions, settlements and payout statements.",documents:"Manage operator, vehicle and compliance documents.",settings:"Bus operator account and operational settings."};
  return <div className="bmp-page"><div className="bmp-title"><div><small>BUS MANAGEMENT</small><h1>{title}</h1><p>{descriptions[active]||"Manage this module from BMT Connect."}</p></div><button className="primary">＋ Add New</button></div><div className="empty-module"><div>▦</div><h2>{title}</h2><p>{descriptions[active]}</p><button className="primary">Create First Record</button></div></div>
}
function Metric({label,value,sub}){return <div className="metric"><small>{label}</small><strong>{value}</strong><span>{sub}</span></div>}
function TripRow({route,bus,time,status}){return <div className="trip-row"><div><b>{route}</b><small>{bus}</small></div><span>{time}</span><em className={status.toLowerCase()}>{status}</em><button>Open</button></div>}
function Info({label,value,action}){return <div className="info"><label>{label}</label><b>{value}</b>{action&&<button>{action}</button>}</div>}
function icon(id){return ({dashboard:"▦",booking:"▤",fleet:"▣",layouts:"▥",routes:"⌖",schedule:"◷",crew:"♟",boarding:"✓",live:"◉",rates:"₹",policy:"↩",analytics:"⌁",campaigns:"✦",payments:"◈",documents:"▧",settings:"⚙"})[id]||"•"}
