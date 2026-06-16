import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';

const DoctorProfilePage = () => {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(0);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => { fetchDoctor(); }, []);

  const fetchDoctor = async () => {
    try {
      const res = await API.get(`/doctors/${id}`);
      setDoctor(res.data);
      fetchSlots(0, res.data._id);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const getDateStr = (daysFromNow) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    return d.toISOString().split('T')[0];
  };

  const fetchSlots = async (dayOffset, docId) => {
    try {
      const res = await API.get(`/appointments/slots?doctorId=${docId || id}&date=${getDateStr(dayOffset)}`);
      setSlots(res.data.availableSlots || []);
    } catch (err) { console.error(err); }
  };

  const handleDateSelect = (offset) => {
    setSelectedDate(offset);
    setSelectedSlot('');
    fetchSlots(offset, doctor?._id);
  };

  const getDayLabel = (offset) => {
    if (offset === 0) return 'Today';
    const d = new Date(); d.setDate(d.getDate() + offset);
    return d.toLocaleDateString('en-IN', { weekday: 'short' });
  };

  const getDayNum = (offset) => {
    const d = new Date(); d.setDate(d.getDate() + offset);
    return d.getDate();
  };

  const handleBook = () => {
    if (!user) return navigate('/login');
    navigate(`/book/${doctor._id}`);
  };

  const openClinicOnMaps = () => {
    if (!doctor) return;
    const q = `${doctor.clinicName || doctor.name} ${doctor.address} ${doctor.city}`;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => window.open(`https://www.google.com/maps/dir/${pos.coords.latitude},${pos.coords.longitude}/${encodeURIComponent(q)}`, '_blank'),
        () => window.open(`https://www.google.com/maps/search/${encodeURIComponent(q)}`, '_blank')
      );
    } else window.open(`https://www.google.com/maps/search/${encodeURIComponent(q)}`, '_blank');
  };

  const reviews = [
    { initials: 'AK', name: 'Anil K.', rating: 5, text: '"Explained the diagnosis so simply. The live queue was very helpful — I waited in my car until my turn."' },
    { initials: 'SP', name: 'Sunita P.', rating: 4, text: '"Very professional clinic. Staff is polite and doctor is clearly very experienced."' },
  ];

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f9f9ff' }}>
      <link href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;600;700&display=swap" rel="stylesheet" />
      <p style={{ color:'#434654', fontSize:18 }}>Loading doctor profile...</p>
    </div>
  );

  if (!doctor) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f9f9ff' }}>
      <p style={{ color:'#434654', fontSize:18 }}>Doctor not found.</p>
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
        .pulse-dot { animation:pulse-a 2s cubic-bezier(0.4,0,0.6,1) infinite; }
        @keyframes pulse-a { 0%,100%{opacity:1} 50%{opacity:.3} }
        .hide-scrollbar::-webkit-scrollbar { display:none; }
        .hide-scrollbar { -ms-overflow-style:none; scrollbar-width:none; }
        .slot-btn:hover { background:#dfe8ff !important; }
        .date-btn:hover { border-color:#003d9b !important; }

        /* Two-column profile layout */
        .profile-grid { display:grid; grid-template-columns:1fr 360px; gap:24px; align-items:start; }
        .sticky-sidebar { position:sticky; top:88px; }

        /* Doctor header */
        .doc-header-inner { display:flex; gap:24px; flex-wrap:wrap; }
        .doc-avatar { width:160px; height:160px; }

        /* Stats grid */
        .stats-3col { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-top:16px; }

        /* Gallery */
        .gallery-strip { display:flex; gap:14px; overflow-x:auto; }
        .gallery-item { width:160px; height:110px; flex-shrink:0; }

        /* Nav links (desktop) */
        .nav-links-desktop { display:flex; gap:4px; }
        .hamburger-profile { display:none; }

        /* Mobile booking panel */
        .mobile-book-bar { display:none; }

        @media (max-width:768px) {
          .profile-grid { grid-template-columns:1fr !important; }
          .sticky-sidebar { position:static !important; }

          /* Hide right sidebar on mobile — show inline */
          .right-sidebar { order:1; }
          .left-col { order:2; }

          .doc-header-inner { flex-direction:column; align-items:center; text-align:center; }
          .doc-avatar { width:120px !important; height:120px !important; }
          .doc-tags { justify-content:center !important; }

          .stats-3col { grid-template-columns:repeat(3,1fr) !important; gap:8px !important; }

          .gallery-item { width:130px !important; height:90px !important; }

          .nav-links-desktop { display:none !important; }
          .hamburger-profile { display:flex !important; align-items:center; justify-content:center; padding:8px; border-radius:8px; border:none; background:transparent; cursor:pointer; color:#003d9b; }

          .page-pad { padding:16px !important; }
          .header-pad { padding:0 12px !important; }

          /* Mobile sticky book bar */
          .mobile-book-bar { display:flex !important; }
          /* Hide desktop sticky bottom bar */
          .desktop-sticky-bar { display:none !important; }

          /* Queue widget compact */
          .queue-stats { flex-direction:row !important; }

          /* Date selector smaller */
          .date-pill { padding:8px 12px !important; }
          .date-pill span:first-child { font-size:11px !important; }
          .date-pill span:last-child { font-size:16px !important; }

          /* Slot grid 3 cols on mobile */
          .slot-grid { grid-template-columns:repeat(3,1fr) !important; gap:8px !important; }
          .slot-btn { padding:8px 4px !important; font-size:12px !important; }
        }

        @media (max-width:480px) {
          .stats-3col { grid-template-columns:repeat(3,1fr) !important; }
          .slot-grid { grid-template-columns:repeat(3,1fr) !important; }
        }
      `}</style>

      <div style={{ background:'#f9f9ff', minHeight:'100vh', fontFamily:"'Public Sans',sans-serif", paddingBottom:80 }}>

        {/* ── HEADER ── */}
        <header style={{ background:'#f9f9ff', position:'sticky', top:0, zIndex:50, borderBottom:'1px solid #c3c6d6', display:'flex', justifyContent:'space-between', alignItems:'center' }} className="header-pad">
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 0' }}>
            <button onClick={() => navigate(-1)} style={{ padding:8, borderRadius:'50%', border:'none', background:'transparent', cursor:'pointer', color:'#003d9b', display:'flex' }}>
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 style={{ fontSize:18, fontWeight:700, color:'#003d9b', cursor:'pointer' }} onClick={() => navigate('/')}>MediLocal</h1>
          </div>

          {/* Desktop nav */}
          <nav className="nav-links-desktop">
            {['Nearby','AI Check','Queue'].map((item, i) => (
              <span key={i} onClick={() => navigate(i===0?'/search':i===1?'/symptom-checker':'/patient/dashboard')}
                style={{ color:'#434654', fontSize:13, fontWeight:600, padding:'6px 10px', borderRadius:4, cursor:'pointer' }}>{item}</span>
            ))}
          </nav>

          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 0' }}>
            <button onClick={openClinicOnMaps} title="Get directions"
              style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 10px', borderRadius:8, border:'1px solid #c3c6d6', background:'transparent', cursor:'pointer', color:'#003d9b', fontSize:12, fontWeight:600 }}>
              <span className="material-symbols-outlined" style={{ fontSize:16, fontVariationSettings:"'FILL' 1" }}>location_on</span>
              {doctor.city}
            </button>
            <button onClick={() => alert('Check your appointments dashboard!')}
              style={{ position:'relative', padding:8, borderRadius:'50%', border:'none', background:'transparent', cursor:'pointer', display:'flex' }}>
              <span className="material-symbols-outlined" style={{ color:'#434654' }}>notifications</span>
              <span style={{ position:'absolute', top:4, right:4, width:8, height:8, background:'#ba1a1a', borderRadius:'50%' }} />
            </button>
            {/* Hamburger mobile */}
            <button className="hamburger-profile" onClick={() => navigate('/patient/dashboard')}>
              <span className="material-symbols-outlined">person</span>
            </button>
          </div>
        </header>

        {/* ── MAIN ── */}
        <main className="page-pad" style={{ maxWidth:1200, margin:'0 auto', padding:'24px 48px' }}>
          <div className="profile-grid">

            {/* ── LEFT COLUMN ── */}
            <div className="left-col" style={{ display:'flex', flexDirection:'column', gap:20 }}>

              {/* Doctor Header */}
              <div style={{ background:'white', border:'1px solid #c3c6d6', borderRadius:12, padding:20 }}>
                <div className="doc-header-inner">
                  <div style={{ position:'relative', flexShrink:0 }}>
                    <div className="doc-avatar" style={{ borderRadius:12, background:'#d6e3ff', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 8px rgba(0,0,0,0.1)' }}>
                      <span className="material-symbols-outlined" style={{ fontSize:64, color:'#003d9b', fontVariationSettings:"'FILL' 1" }}>person</span>
                    </div>
                    <div style={{ position:'absolute', bottom:-8, right:-8, background:'#82f9be', color:'#00734c', padding:'3px 10px', borderRadius:9999, display:'flex', alignItems:'center', gap:4, boxShadow:'0 2px 8px rgba(0,0,0,0.1)', fontSize:11 }}>
                      <span className="material-symbols-outlined" style={{ fontSize:14, fontVariationSettings:"'FILL' 1" }}>verified</span>
                      Verified
                    </div>
                  </div>
                  <div style={{ flex:1 }}>
                    <h2 style={{ fontSize:22, fontWeight:600, color:'#091c35' }}>{doctor.name}</h2>
                    <p style={{ color:'#003d9b', fontWeight:600, fontSize:13, marginTop:4 }}>{doctor.specialty} • MBBS, MD</p>
                    <div style={{ display:'flex', alignItems:'center', gap:6, color:'#434654', marginTop:6 }}>
                      <span className="material-symbols-outlined" style={{ fontSize:15 }}>work</span>
                      <span style={{ fontSize:14 }}>{doctor.experience}+ Years Experience</span>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:6, color:'#434654', marginTop:4, flexWrap:'wrap' }}>
                      <span className="material-symbols-outlined" style={{ fontSize:15 }}>location_on</span>
                      <span style={{ fontSize:14 }}>{doctor.clinicName}, {doctor.address}, {doctor.city}</span>
                      <button onClick={openClinicOnMaps}
                        style={{ padding:'2px 8px', borderRadius:6, border:'1px solid #c3c6d6', background:'#f0f3ff', color:'#003d9b', fontSize:11, fontWeight:600, cursor:'pointer' }}>
                        Directions →
                      </button>
                    </div>
                    <div className="doc-tags" style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:10 }}>
                      {doctor.languages?.map(lang => (
                        <span key={lang} style={{ background:'#dfe8ff', padding:'3px 10px', borderRadius:8, fontSize:11, fontWeight:500 }}>{lang}</span>
                      ))}
                      <span style={{ background:'#dfe8ff', padding:'3px 10px', borderRadius:8, fontSize:11, fontWeight:500 }}>₹{doctor.fee}</span>
                      <span style={{ background:'#dfe8ff', padding:'3px 10px', borderRadius:8, fontSize:11, fontWeight:500 }}>{doctor.timings}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <section style={{ background:'white', border:'1px solid #c3c6d6', borderRadius:12, padding:20 }}>
                <h3 style={{ fontSize:18, fontWeight:600, color:'#091c35', marginBottom:10 }}>Professional Bio</h3>
                <p style={{ color:'#434654', fontSize:14, lineHeight:'24px' }}>
                  {doctor.name} is a distinguished {doctor.specialty} serving {doctor.city} for over {doctor.experience} years.
                  Known for bridging premium healthcare in Tier 2 cities — patients receive the same quality care as metro residents.
                </p>
                <div className="stats-3col">
                  {[
                    { label:'Patient Satisfaction', value:'98%' },
                    { label:'Annual Visits',         value:'2,400+' },
                    { label:'Wait Time Avg.',        value:'12m' },
                  ].map(stat => (
                    <div key={stat.label} style={{ padding:10, background:'#f0f3ff', borderRadius:8, border:'1px solid #c3c6d6', textAlign:'center' }}>
                      <p style={{ fontSize:11, color:'#434654', marginBottom:3 }}>{stat.label}</p>
                      <p style={{ fontSize:18, fontWeight:600, color:'#003d9b' }}>{stat.value}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Clinic Location */}
              <section style={{ background:'#f0f3ff', border:'1px solid #c3c6d6', borderRadius:12, padding:20 }}>
                <h3 style={{ fontSize:18, fontWeight:600, color:'#091c35', marginBottom:14 }}>Clinic Location</h3>
                <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
                  <div style={{ flex:1, minWidth:180 }}>
                    <div style={{ display:'flex', gap:12 }}>
                      <div style={{ background:'#0052cc', padding:10, borderRadius:10, height:'fit-content', flexShrink:0 }}>
                        <span className="material-symbols-outlined" style={{ color:'white', fontSize:20 }}>apartment</span>
                      </div>
                      <div>
                        <p style={{ fontWeight:700, fontSize:16, color:'#091c35' }}>{doctor.clinicName}</p>
                        <p style={{ color:'#434654', fontSize:14, marginTop:3, lineHeight:'20px' }}>{doctor.address}, {doctor.city}</p>
                        <button onClick={openClinicOnMaps}
                          style={{ display:'flex', alignItems:'center', gap:6, color:'white', background:'#003d9b', border:'none', padding:'7px 14px', borderRadius:8, cursor:'pointer', marginTop:10, fontSize:13, fontWeight:600 }}>
                          <span className="material-symbols-outlined" style={{ fontSize:16 }}>directions</span>
                          Get Directions
                        </button>
                      </div>
                    </div>
                  </div>
                  <div onClick={openClinicOnMaps}
                    style={{ flex:1, minWidth:160, height:150, borderRadius:10, background:'#dfe8ff', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', cursor:'pointer', gap:8, border:'1px solid #c3c6d6' }}
                    onMouseOver={e => e.currentTarget.style.background='#c8d8ff'}
                    onMouseOut={e => e.currentTarget.style.background='#dfe8ff'}>
                    <span className="material-symbols-outlined" style={{ fontSize:40, color:'#003d9b', fontVariationSettings:"'FILL' 1" }}>map</span>
                    <p style={{ fontSize:13, fontWeight:700, color:'#003d9b' }}>Open in Google Maps</p>
                  </div>
                </div>
              </section>

              {/* Gallery */}
              <section style={{ background:'white', border:'1px solid #c3c6d6', borderRadius:12, padding:20 }}>
                <h3 style={{ fontSize:18, fontWeight:600, color:'#091c35', marginBottom:14 }}>Clinic Gallery</h3>
                <div className="gallery-strip hide-scrollbar">
                  {['Reception Area','Examination Room','Medical Supplies'].map((label, i) => (
                    <div key={i} className="gallery-item" style={{ borderRadius:8, background:`hsl(${220+i*15},40%,${85-i*5}%)`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <span className="material-symbols-outlined" style={{ fontSize:28, color:'#003d9b', opacity:0.5 }}>
                        {i===0?'local_hospital':i===1?'medical_services':'medication'}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Reviews */}
              <section style={{ background:'white', border:'1px solid #c3c6d6', borderRadius:12, padding:20 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
                  <h3 style={{ fontSize:18, fontWeight:600, color:'#091c35' }}>Patient Reviews</h3>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <span className="material-symbols-outlined" style={{ color:'#5e3c00', fontVariationSettings:"'FILL' 1", fontSize:18 }}>star</span>
                    <span style={{ fontWeight:700, fontSize:15 }}>{doctor.rating > 0 ? doctor.rating : '4.9'}</span>
                    <span style={{ color:'#434654', fontSize:12 }}>(120+ reviews)</span>
                  </div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {reviews.map((rev, i) => (
                    <div key={i} style={{ padding:14, background:'white', borderRadius:10, border:'1px solid #c3c6d6' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div style={{ width:30, height:30, borderRadius:'50%', background: i===0?'#dae2ff':'#82f9be', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:11, color:i===0?'#001848':'#002113', flexShrink:0 }}>
                            {rev.initials}
                          </div>
                          <div>
                            <p style={{ fontSize:13, fontWeight:600 }}>{rev.name}</p>
                            <span style={{ display:'flex', alignItems:'center', gap:3, color:'#006c47', fontSize:10, fontWeight:700 }}>
                              <span className="material-symbols-outlined" style={{ fontSize:11 }}>verified_user</span>
                              OTP Verified
                            </span>
                          </div>
                        </div>
                        <div style={{ display:'flex' }}>
                          {Array(5).fill(null).map((_,si) => (
                            <span key={si} className="material-symbols-outlined" style={{ fontSize:14, color:'#5e3c00', fontVariationSettings:si<rev.rating?"'FILL' 1":"'FILL' 0" }}>star</span>
                          ))}
                        </div>
                      </div>
                      <p style={{ color:'#434654', fontSize:14, fontStyle:'italic', lineHeight:'22px' }}>{rev.text}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* ── RIGHT COLUMN ── */}
            <div className="right-sidebar sticky-sidebar" style={{ display:'flex', flexDirection:'column', gap:20 }}>

              {/* Live Queue */}
              <div style={{ background:'#0052cc', borderRadius:14, padding:20, boxShadow:'0 4px 20px rgba(0,61,155,0.3)', display:'flex', flexDirection:'column', gap:14 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize:18, fontWeight:600, color:'white', marginBottom:6 }}>Live Queue</h3>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <span className="pulse-dot" style={{ width:7, height:7, background:'#82f9be', borderRadius:'50%', display:'inline-block' }} />
                      <span style={{ fontSize:11, color:'#dae2ff', fontWeight:500 }}>Real-time status</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined" style={{ fontSize:28, color:'white' }}>list_alt</span>
                </div>
                <div className="queue-stats" style={{ background:'rgba(255,255,255,0.1)', borderRadius:10, padding:14, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  {[
                    { label:'Now Serving', value:'#14' },
                    { label:'Waiting',     value:'04' },
                    { label:'Est. Wait',   value:'22m' },
                  ].map((item, i) => (
                    <div key={i} style={{ textAlign:'center', flex:1, borderRight:i<2?'1px solid rgba(255,255,255,0.2)':'none', padding:'0 6px' }}>
                      <p style={{ fontSize:10, color:'#dae2ff', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:3 }}>{item.label}</p>
                      <p style={{ fontSize:26, fontWeight:700, color:'white' }}>{item.value}</p>
                    </div>
                  ))}
                </div>
                <button style={{ width:'100%', background:'#82f9be', color:'#00734c', padding:'13px', borderRadius:10, border:'none', fontWeight:700, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}
                  onClick={handleBook}>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings:"'FILL' 1", fontSize:18 }}>bolt</span>
                  JOIN VIRTUAL QUEUE
                </button>
              </div>

              {/* Booking Widget */}
              <div style={{ background:'white', border:'1px solid #c3c6d6', borderRadius:14, padding:20, display:'flex', flexDirection:'column', gap:14 }}>
                <h3 style={{ fontSize:18, fontWeight:600, color:'#091c35' }}>Book Appointment</h3>

                {/* Date Selector */}
                <div>
                  <p style={{ fontSize:11, color:'#434654', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>Select Date</p>
                  <div className="hide-scrollbar" style={{ display:'flex', gap:10, overflowX:'auto', paddingBottom:6 }}>
                    {[0,1,2,3,4].map(offset => (
                      <button key={offset} className="date-btn date-pill"
                        onClick={() => handleDateSelect(offset)}
                        style={{ flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center', padding:'10px 14px', borderRadius:10, cursor:'pointer', transition:'all 0.15s', background:selectedDate===offset?'#0052cc':'#e7eeff', color:selectedDate===offset?'white':'#091c35', border:selectedDate===offset?'1px solid #003d9b':'1px solid #c3c6d6', fontWeight:selectedDate===offset?700:400 }}>
                        <span style={{ fontSize:11 }}>{getDayLabel(offset)}</span>
                        <span style={{ fontSize:17, fontWeight:700 }}>{getDayNum(offset)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Slots */}
                <div>
                  <p style={{ fontSize:11, color:'#434654', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>Available Slots</p>
                  {slots.length === 0 ? (
                    <p style={{ color:'#434654', fontSize:13, textAlign:'center', padding:'12px 0' }}>No slots available</p>
                  ) : (
                    <div className="slot-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                      {slots.slice(0,6).map(slot => (
                        <button key={slot} className="slot-btn"
                          onClick={() => setSelectedSlot(slot)}
                          style={{ padding:'10px', borderRadius:8, fontSize:13, cursor:'pointer', transition:'all 0.15s', border:selectedSlot===slot?'1px solid #003d9b':'1px solid #c3c6d6', background:selectedSlot===slot?'#dae2ff':'white', color:selectedSlot===slot?'#001848':'#091c35', fontWeight:selectedSlot===slot?700:400 }}>
                          {slot}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button onClick={handleBook}
                  style={{ width:'100%', background:'#003d9b', color:'white', padding:'13px', borderRadius:10, border:'none', fontWeight:700, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                  <span className="material-symbols-outlined" style={{ fontSize:18 }}>calendar_month</span>
                  CONFIRM BOOKING
                </button>

                <button onClick={openClinicOnMaps}
                  style={{ width:'100%', background:'#f0f3ff', color:'#003d9b', padding:'10px', borderRadius:10, border:'1px solid #c3c6d6', fontWeight:600, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                  <span className="material-symbols-outlined" style={{ fontSize:16, fontVariationSettings:"'FILL' 1" }}>directions</span>
                  Get Directions to Clinic
                </button>
              </div>
            </div>

          </div>
        </main>

        {/* ── MOBILE STICKY BOTTOM BAR ── */}
        <div className="mobile-book-bar" style={{ position:'fixed', bottom:0, width:'100%', background:'white', borderTop:'1px solid #c3c6d6', padding:'10px 16px', display:'flex', gap:12, alignItems:'center', boxShadow:'0 -4px 10px rgba(0,0,0,0.07)', zIndex:60 }}>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:11, color:'#434654' }}>Next Available</p>
            <p style={{ fontSize:14, fontWeight:700, color:'#003d9b' }}>{slots[0] || 'Select date'}</p>
          </div>
          <button onClick={openClinicOnMaps}
            style={{ background:'#f0f3ff', color:'#003d9b', padding:'10px 14px', borderRadius:10, border:'1px solid #c3c6d6', fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:5, fontSize:13 }}>
            <span className="material-symbols-outlined" style={{ fontSize:16, fontVariationSettings:"'FILL' 1" }}>directions</span>
            Maps
          </button>
          <button onClick={handleBook}
            style={{ background:'#003d9b', color:'white', padding:'10px 22px', borderRadius:10, border:'none', fontWeight:700, cursor:'pointer', fontSize:14, boxShadow:'0 4px 12px rgba(0,61,155,0.3)' }}>
            Book Now
          </button>
        </div>

      </div>
    </>
  );
};

export default DoctorProfilePage;