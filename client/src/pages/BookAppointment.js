import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';

const BookAppointment = () => {
  const [doctor, setDoctor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => { fetchDoctor(); }, []);
  // eslint-disable-next-line
  useEffect(() => { if (selectedDate && doctorId) fetchSlots(); }, [selectedDate]);

  const fetchDoctor = async () => {
    try {
      const res = await API.get(`/doctors/${doctorId}`);
      setDoctor(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchSlots = async () => {
    try {
      const res = await API.get(`/appointments/slots?doctorId=${doctorId}&date=${formatDate(selectedDate)}`);
      setSlots(res.data.availableSlots || []);
    } catch (err) { console.error(err); }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  };

  const formatDisplayDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short' });
  };

  const handleBook = async () => {
    if (!user) return navigate('/login');
    if (!selectedDate || !selectedSlot) return alert('Please select date and time slot');
    setLoading(true);
    try {
      await API.post('/appointments/book', { doctorId, date:formatDate(selectedDate), slot:selectedSlot, symptoms });
      setSuccess(true);
    } catch (err) { alert(err.response?.data?.message || 'Booking failed'); }
    setLoading(false);
  };

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth()+1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const today = new Date(); today.setHours(0,0,0,0);
  const monthName = currentMonth.toLocaleDateString('en-IN', { month:'long', year:'numeric' });

  const morningSlots   = slots.filter(s => s.split(' ')[1]==='AM');
  const afternoonSlots = slots.filter(s => { const h=parseInt(s); return s.split(' ')[1]==='PM' && h<5; });
  const eveningSlots   = slots.filter(s => { const h=parseInt(s); return s.split(' ')[1]==='PM' && h>=5; });

  if (success) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f0fdf4', fontFamily:"'Public Sans',sans-serif", padding:16 }}>
      <link href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;600;700&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      <div style={{ background:'white', borderRadius:16, padding:'2.5rem', textAlign:'center', boxShadow:'0 4px 20px rgba(0,0,0,0.1)', maxWidth:400, width:'100%' }}>
        <div style={{ width:72, height:72, borderRadius:'50%', background:'#82f9be', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
          <span style={{ fontFamily:'Material Symbols Outlined', fontSize:36, color:'#006c47', fontVariationSettings:"'FILL' 1" }}>check_circle</span>
        </div>
        <h2 style={{ fontSize:22, fontWeight:700, color:'#091c35', marginBottom:8 }}>Appointment Confirmed!</h2>
        <p style={{ color:'#434654', fontSize:15, marginBottom:6 }}>Your appointment with <strong>{doctor?.name}</strong></p>
        <p style={{ color:'#003d9b', fontWeight:700, fontSize:17, marginBottom:24 }}>{formatDisplayDate(selectedDate)} • {selectedSlot}</p>
        <button onClick={() => navigate('/patient/dashboard')} style={{ width:'100%', background:'#003d9b', color:'white', border:'none', padding:'13px', borderRadius:10, fontSize:15, fontWeight:700, cursor:'pointer', marginBottom:10 }}>
          View My Appointments
        </button>
        <button onClick={() => navigate('/')} style={{ width:'100%', background:'transparent', color:'#6b7280', border:'none', padding:'8px', cursor:'pointer', fontSize:13 }}>
          Back to Home
        </button>
      </div>
    </div>
  );

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:'Public Sans',sans-serif; background:#f9f9ff; }
        .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; font-family:'Material Symbols Outlined'; font-size:24px; line-height:1; display:inline-block; vertical-align:middle; }
        .slot-btn:hover { border-color:#003d9b !important; background:#f0f3ff !important; }
        .cal-btn:hover { background:#dfe8ff !important; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        .pulse { animation:pulse 2s infinite; }
        @keyframes bounce { 0%,100%{transform:translateY(-10%)} 50%{transform:translateY(0)} }
        .bounce { animation:bounce 1s infinite; }
        textarea:focus { outline:none; border-color:#003d9b !important; box-shadow:0 0 0 3px rgba(0,61,155,0.1); }

        /* Two column layout */
        .booking-grid { display:grid; grid-template-columns:1fr 380px; gap:24px; align-items:start; }

        /* Slot groups */
        .slot-group-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }

        /* Calendar days */
        .cal-days { display:grid; grid-template-columns:repeat(7,1fr); gap:3px; }

        /* Nav links */
        .nav-links { display:flex; gap:16px; }
        .hamburger-book { display:none; }

        @media (max-width:768px) {
          .booking-grid { grid-template-columns:1fr !important; }

          /* Slots panel goes on TOP on mobile */
          .slots-panel { order:-1; }
          .left-panel { order:1; }

          .nav-links { display:none !important; }
          .hamburger-book { display:flex !important; align-items:center; padding:8px; border-radius:8px; border:none; background:transparent; cursor:pointer; }

          .page-pad { padding:16px !important; }
          .header-pad { padding:0 12px !important; }

          /* Calendar day buttons smaller */
          .cal-day { padding:8px 2px !important; font-size:13px !important; }

          /* Slot groups 3 col on mobile */
          .slot-group-grid { grid-template-columns:repeat(3,1fr) !important; gap:7px !important; }
          .slot-btn { padding:9px 4px !important; font-size:12px !important; }

          /* Doctor summary compact */
          .doc-summary { flex-direction:column !important; }
          .doc-summary-img { width:100% !important; height:100px !important; }

          /* Footer 1 col */
          .footer-grid { grid-template-columns:1fr !important; }

          /* Bottom confirm bar */
          .confirm-btn-desktop { display:none !important; }
          .confirm-bar-mobile { display:flex !important; }
        }

        @media (max-width:480px) {
          .slot-group-grid { grid-template-columns:repeat(3,1fr) !important; }
          .cal-days { gap:2px !important; }
        }
      `}</style>

      <div style={{ background:'#f9f9ff', minHeight:'100vh', fontFamily:"'Public Sans',sans-serif", display:'flex', flexDirection:'column', paddingBottom:80 }}>

        {/* ── HEADER ── */}
        <header className="header-pad" style={{ background:'#f9f9ff', position:'sticky', top:0, zIndex:50, borderBottom:'1px solid #c3c6d6', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 48px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <button onClick={() => navigate(-1)} style={{ padding:8, borderRadius:'50%', border:'none', background:'transparent', cursor:'pointer', color:'#003d9b', display:'flex' }}>
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <span onClick={() => navigate('/')} style={{ fontSize:18, fontWeight:700, color:'#003d9b', cursor:'pointer' }}>MediLocal</span>
          </div>
          <nav className="nav-links">
            {['Explore Providers','Booking','Medical Records'].map((item,i) => (
              <span key={i} onClick={() => i===0 && navigate('/search')}
                style={{ color: i===1 ? '#003d9b' : '#434654', fontWeight:600, fontSize:13, padding:'6px 10px', borderBottom:i===1?'2px solid #003d9b':'none', cursor:'pointer' }}>
                {item}
              </span>
            ))}
          </nav>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span className="material-symbols-outlined" style={{ color:'#003d9b', cursor:'pointer' }}>notifications</span>
            <div style={{ width:32, height:32, borderRadius:'50%', background:'#dae2ff', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span className="material-symbols-outlined" style={{ color:'#003d9b', fontSize:18 }}>person</span>
            </div>
          </div>
        </header>

        {/* ── MAIN ── */}
        <main style={{ flex:1, width:'100%', maxWidth:1200, margin:'0 auto' }} className="page-pad" >
          <div style={{ padding:'24px 48px' }}>

            {/* Page heading */}
            <div style={{ marginBottom:24 }}>
              <h1 style={{ fontSize:22, fontWeight:600, color:'#091c35', marginBottom:4 }}>Select a Date & Time</h1>
              <p style={{ color:'#434654', fontSize:14 }}>Step 2 of 3: Scheduling your visit with {doctor?.name || '...'}</p>
            </div>

            <div className="booking-grid">

              {/* ── LEFT: Calendar + Doctor + Symptoms + Location ── */}
              <div className="left-panel" style={{ display:'flex', flexDirection:'column', gap:20 }}>

                {/* Doctor Summary */}
                {doctor && (
                  <div className="doc-summary" style={{ background:'#f0f3ff', border:'1px solid #c3c6d6', borderRadius:12, padding:16, display:'flex', gap:14, alignItems:'flex-start' }}>
                    <div className="doc-summary-img" style={{ width:110, height:110, borderRadius:8, background:'#d6e3ff', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <span className="material-symbols-outlined" style={{ fontSize:44, color:'#003d9b', fontVariationSettings:"'FILL' 1" }}>person</span>
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                        <h2 style={{ fontSize:18, fontWeight:600, color:'#091c35' }}>{doctor.name}</h2>
                        <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'2px 8px', background:'#82f9be', color:'#00734c', borderRadius:9999, fontSize:11, fontWeight:500 }}>
                          <span className="material-symbols-outlined" style={{ fontSize:12, fontVariationSettings:"'FILL' 1" }}>verified</span>
                          Verified
                        </span>
                      </div>
                      <p style={{ color:'#003d9b', fontWeight:700, fontSize:14, marginBottom:4 }}>{doctor.specialty} • {doctor.experience}+ Yrs</p>
                      <p style={{ color:'#434654', fontSize:13 }}>🏥 {doctor.clinicName}, {doctor.city}</p>
                      <div style={{ display:'flex', gap:20, marginTop:12, paddingTop:12, borderTop:'1px solid #c3c6d6', flexWrap:'wrap' }}>
                        <div>
                          <p style={{ fontSize:11, color:'#434654' }}>Consultation Fee</p>
                          <p style={{ fontWeight:700, color:'#091c35', fontSize:15 }}>₹{doctor.fee}</p>
                        </div>
                        <div>
                          <p style={{ fontSize:11, color:'#434654' }}>Timings</p>
                          <p style={{ display:'flex', alignItems:'center', gap:4, fontWeight:700, color:'#006c47', fontSize:14 }}>
                            <span className="pulse" style={{ width:7, height:7, background:'#006c47', borderRadius:'50%', display:'inline-block' }} />
                            {doctor.timings}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Calendar */}
                <div style={{ background:'white', border:'1px solid #c3c6d6', borderRadius:12, padding:16 }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
                    <h3 style={{ fontSize:18, fontWeight:600, color:'#091c35' }}>{monthName}</h3>
                    <div style={{ display:'flex', gap:6 }}>
                      <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth()-1))}
                        style={{ padding:7, borderRadius:'50%', border:'1px solid #c3c6d6', background:'transparent', cursor:'pointer', display:'flex' }}>
                        <span className="material-symbols-outlined" style={{ fontSize:18 }}>chevron_left</span>
                      </button>
                      <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth()+1))}
                        style={{ padding:7, borderRadius:'50%', border:'1px solid #c3c6d6', background:'transparent', cursor:'pointer', display:'flex' }}>
                        <span className="material-symbols-outlined" style={{ fontSize:18 }}>chevron_right</span>
                      </button>
                    </div>
                  </div>

                  {/* Day headers */}
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', textAlign:'center', marginBottom:6 }}>
                    {['S','M','T','W','T','F','S'].map((d,i) => (
                      <span key={i} style={{ fontSize:11, color:'#434654', padding:'6px 0', fontWeight:500 }}>{d}</span>
                    ))}
                  </div>

                  {/* Days */}
                  <div className="cal-days">
                    {Array(getFirstDayOfMonth(currentMonth)).fill(null).map((_,i) => <div key={`e${i}`} />)}
                    {Array(getDaysInMonth(currentMonth)).fill(null).map((_,i) => {
                      const day = i+1;
                      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                      const isPast = date < today;
                      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
                      const isToday = date.toDateString() === today.toDateString();
                      return (
                        <button key={day} className={isPast?'':'cal-btn'} disabled={isPast}
                          onClick={() => { setSelectedDate(date); setSelectedSlot(''); }}
                          className="cal-day"
                          style={{ padding:'10px 2px', borderRadius:8, border:'none', cursor:isPast?'not-allowed':'pointer', opacity:isPast?0.3:1, background:isSelected?'#003d9b':isToday?'#dae2ff':'transparent', color:isSelected?'white':isToday?'#001848':'#091c35', fontWeight:isSelected?700:500, transition:'all 0.15s', fontSize:14 }}>
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Symptoms */}
                <div style={{ background:'white', border:'1px solid #c3c6d6', borderRadius:12, padding:16 }}>
                  <h3 style={{ fontSize:16, fontWeight:600, color:'#091c35', marginBottom:10 }}>
                    Describe Symptoms <span style={{ color:'#434654', fontSize:13, fontWeight:400 }}>(optional)</span>
                  </h3>
                  <textarea value={symptoms} onChange={e => setSymptoms(e.target.value)}
                    placeholder="e.g. Chest pain, shortness of breath, dizziness..."
                    rows={3}
                    style={{ width:'100%', padding:'10px', border:'1px solid #c3c6d6', borderRadius:8, fontSize:14, outline:'none', resize:'vertical', fontFamily:'inherit', color:'#091c35', transition:'all 0.2s' }} />
                </div>

                {/* Clinic Location */}
                {doctor && (
                  <div style={{ background:'#f0f3ff', border:'1px solid #c3c6d6', borderRadius:12, padding:16 }}>
                    <h3 style={{ fontSize:16, fontWeight:600, color:'#091c35', marginBottom:12 }}>Clinic Location</h3>
                    <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                      <div style={{ flex:1, minWidth:160 }}>
                        <div style={{ display:'flex', gap:12 }}>
                          <div style={{ background:'#0052cc', padding:10, borderRadius:10, height:'fit-content', flexShrink:0 }}>
                            <span className="material-symbols-outlined" style={{ color:'white', fontSize:18 }}>apartment</span>
                          </div>
                          <div>
                            <p style={{ fontWeight:700, fontSize:15, color:'#091c35' }}>{doctor.clinicName}</p>
                            <p style={{ color:'#434654', fontSize:13, marginTop:3, lineHeight:'20px' }}>{doctor.address}, {doctor.city}</p>
                            <button onClick={() => { const q=`${doctor.clinicName} ${doctor.city}`; window.open(`https://www.google.com/maps/search/${encodeURIComponent(q)}`, '_blank'); }}
                              style={{ display:'flex', alignItems:'center', gap:6, color:'white', background:'#003d9b', border:'none', padding:'6px 12px', borderRadius:8, cursor:'pointer', marginTop:8, fontSize:12, fontWeight:600 }}>
                              <span className="material-symbols-outlined" style={{ fontSize:14 }}>directions</span>
                              Get Directions
                            </button>
                          </div>
                        </div>
                      </div>
                      <div onClick={() => { const q=`${doctor.clinicName} ${doctor.city}`; window.open(`https://www.google.com/maps/search/${encodeURIComponent(q)}`, '_blank'); }}
                        style={{ flex:1, minWidth:140, height:140, borderRadius:10, background:'#dfe8ff', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', cursor:'pointer', gap:8, border:'1px solid #c3c6d6' }}>
                        <span className="material-symbols-outlined" style={{ fontSize:36, color:'#003d9b', fontVariationSettings:"'FILL' 1" }}>map</span>
                        <p style={{ fontSize:12, fontWeight:700, color:'#003d9b' }}>Open in Google Maps</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── RIGHT: Time Slots ── */}
              <div className="slots-panel">
                <div style={{ background:'white', border:'1px solid #c3c6d6', borderRadius:12, padding:20, display:'flex', flexDirection:'column', gap:0 }}>
                  <h3 style={{ fontSize:18, fontWeight:600, color:'#091c35', marginBottom:20 }}>Available Slots</h3>

                  {!selectedDate ? (
                    <div style={{ textAlign:'center', padding:'3rem 1rem', color:'#434654' }}>
                      <span className="material-symbols-outlined" style={{ fontSize:44, color:'#c3c6d6', display:'block', marginBottom:10 }}>calendar_today</span>
                      <p style={{ fontSize:14 }}>Select a date to see slots</p>
                    </div>
                  ) : slots.length === 0 ? (
                    <div style={{ textAlign:'center', padding:'3rem 1rem', color:'#434654' }}>
                      <span className="material-symbols-outlined" style={{ fontSize:44, color:'#c3c6d6', display:'block', marginBottom:10 }}>event_busy</span>
                      <p style={{ fontSize:14 }}>No slots available for this date</p>
                    </div>
                  ) : (
                    <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
                      {[
                        { label:'Morning',   icon:'light_mode',  color:'#003d9b', data:morningSlots },
                        { label:'Afternoon', icon:'sunny',       color:'#5e3c00', data:afternoonSlots },
                        { label:'Evening',   icon:'bedtime',     color:'#434654', data:eveningSlots },
                      ].filter(g => g.data.length > 0).map(group => (
                        <div key={group.label}>
                          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12, color:group.color }}>
                            <span className="material-symbols-outlined" style={{ fontSize:18 }}>{group.icon}</span>
                            <span style={{ fontSize:13, fontWeight:600 }}>{group.label}</span>
                          </div>
                          <div className="slot-group-grid">
                            {group.data.map(slot => (
                              <button key={slot} className="slot-btn" onClick={() => setSelectedSlot(slot)}
                                style={{ padding:'11px 8px', borderRadius:8, fontSize:13, cursor:'pointer', transition:'all 0.15s', border:selectedSlot===slot?'2px solid #003d9b':'1px solid #c3c6d6', background:selectedSlot===slot?'#dae2ff':'white', color:selectedSlot===slot?'#001848':'#091c35', fontWeight:selectedSlot===slot?700:400, transform:selectedSlot===slot?'scale(1.04)':'scale(1)' }}>
                                {slot}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Selected slot display + Confirm button (desktop) */}
                  <div className="confirm-btn-desktop" style={{ marginTop:28, paddingTop:20, borderTop:'1px solid #c3c6d6' }}>
                    <div style={{ marginBottom:18 }}>
                      <p style={{ fontSize:11, color:'#434654', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>Selected Slot</p>
                      <p style={{ fontSize:18, fontWeight:600, color:selectedSlot?'#003d9b':'#c3c6d6' }}>
                        {selectedDate && selectedSlot ? `${formatDisplayDate(selectedDate)} • ${selectedSlot}` : 'None selected'}
                      </p>
                    </div>
                    <button onClick={handleBook} disabled={loading || !selectedDate || !selectedSlot}
                      style={{ width:'100%', background:(!selectedDate||!selectedSlot)?'#c3c6d6':'#003d9b', color:'white', border:'none', padding:'15px', borderRadius:10, fontWeight:700, fontSize:16, cursor:(!selectedDate||!selectedSlot)?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:10, boxShadow:(!selectedDate||!selectedSlot)?'none':'0 4px 16px rgba(0,61,155,0.3)', transition:'all 0.2s' }}>
                      {loading ? 'Confirming...' : <>Confirm Appointment <span className="material-symbols-outlined">arrow_forward</span></>}
                    </button>
                    {!user && (
                      <p style={{ textAlign:'center', color:'#ba1a1a', marginTop:10, fontSize:13 }}>
                        Please <span onClick={() => navigate('/login')} style={{ cursor:'pointer', textDecoration:'underline', fontWeight:600 }}>login</span> to book
                      </p>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Footer */}
            <footer className="footer-grid" style={{ marginTop:32, paddingTop:24, display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20, borderTop:'1px solid #c3c6d6' }}>
              <div>
                <span style={{ fontSize:18, fontWeight:600, color:'#003d9b' }}>MediLocal</span>
                <p style={{ color:'#434654', fontSize:13, marginTop:10 }}>Connecting Tier 2 & 3 Cities to Quality Healthcare.</p>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {['About Providers','Privacy Policy','Verified Status FAQ'].map(l => (
                  <a key={l} href="#" style={{ color:'#434654', fontSize:12, textDecoration:'none' }}>{l}</a>
                ))}
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {['Terms of Service','Contact Support'].map(l => (
                  <a key={l} href="#" style={{ color:'#434654', fontSize:12, textDecoration:'none' }}>{l}</a>
                ))}
              </div>
            </footer>
          </div>
        </main>

        {/* ── MOBILE CONFIRM BAR ── */}
        <div className="confirm-bar-mobile" style={{ display:'none', position:'fixed', bottom:0, width:'100%', background:'white', borderTop:'1px solid #c3c6d6', padding:'10px 16px', alignItems:'center', gap:12, boxShadow:'0 -4px 10px rgba(0,0,0,0.07)', zIndex:60 }}>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:11, color:'#434654' }}>Selected</p>
            <p style={{ fontSize:13, fontWeight:700, color:selectedSlot?'#003d9b':'#c3c6d6' }}>
              {selectedDate && selectedSlot ? `${formatDisplayDate(selectedDate)} • ${selectedSlot}` : 'Pick date & slot'}
            </p>
          </div>
          <button onClick={handleBook} disabled={loading || !selectedDate || !selectedSlot}
            style={{ background:(!selectedDate||!selectedSlot)?'#c3c6d6':'#003d9b', color:'white', padding:'11px 22px', borderRadius:10, border:'none', fontWeight:700, fontSize:14, cursor:(!selectedDate||!selectedSlot)?'not-allowed':'pointer' }}>
            {loading ? 'Confirming...' : 'Confirm'}
          </button>
        </div>

      </div>
    </>
  );
};

export default BookAppointment;