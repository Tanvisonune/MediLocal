import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';

const LandingPage = () => {
  const [searchSpecialty, setSearchSpecialty] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await API.get('/doctors');
      setDoctors(res.data.doctors || []);
    } catch (err) {
      console.error(err);
    }
    setDoctorsLoading(false);
  };

  const handleSearch = () => {
    navigate(`/search?city=${searchCity}&specialty=${searchSpecialty}`);
  };

  const openNearbyDoctors = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => window.open(`https://www.google.com/maps/search/doctors+near+me/@${pos.coords.latitude},${pos.coords.longitude},14z`, '_blank'),
        () => window.open('https://www.google.com/maps/search/doctors+near+me', '_blank')
      );
    } else {
      window.open('https://www.google.com/maps/search/doctors+near+me', '_blank');
    }
  };

  const specialties = [
    { name: 'Pediatrics',        icon: 'child_care' },
    { name: 'Cardiology',        icon: 'favorite' },
    { name: 'General Physician', icon: 'medical_services' },
    { name: 'Ophthalmology',     icon: 'visibility' },
    { name: 'Dentistry',         icon: 'dentistry' },
    { name: 'All Specialities',  icon: 'grid_view', isAll: true },
  ];

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:'Public Sans',sans-serif; background:#f9f9ff; color:#091c35; overflow-x:hidden; }
        .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; font-family:'Material Symbols Outlined'; font-size:24px; line-height:1; display:inline-block; vertical-align:middle; }
        .pulse-dot { animation:pulse 2s infinite; }
        @keyframes pulse { 0%{transform:scale(.95);box-shadow:0 0 0 0 rgba(0,108,71,.7)} 70%{transform:scale(1);box-shadow:0 0 0 6px rgba(0,108,71,0)} 100%{transform:scale(.95)} }
        .doctor-card:hover { box-shadow:0 8px 24px rgba(0,0,0,0.12); transform:translateY(-2px); }
        .specialty-card:hover { border-color:#003d9b; background:#f0f3ff; }
        .spec-icon { transition:transform 0.2s; }
        .specialty-card:hover .spec-icon { transform:scale(1.1); }

        .nav-links { display:flex; align-items:center; gap:12px; }
        .hamburger-btn { display:none; padding:8px; border-radius:8px; border:none; background:transparent; cursor:pointer; }
        .mobile-menu-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:48; }
        .mobile-menu { display:none; position:fixed; top:0; right:0; height:100vh; width:260px; background:white; z-index:49; padding:24px 16px; flex-direction:column; gap:8px; box-shadow:-4px 0 20px rgba(0,0,0,0.15); }
        .mobile-menu.open { display:flex; }
        .mobile-menu-overlay.open { display:block; }
        .hero-search { display:flex; gap:4px; align-items:stretch; }
        .specialty-grid { display:grid; grid-template-columns:repeat(6,1fr); gap:16px; }
        .doctors-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:24px; }
        .steps-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:32px; }
        .stats-row { display:flex; justify-content:center; gap:4rem; flex-wrap:wrap; }
        .footer-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:24px; }
        .cta-buttons { display:flex; justify-content:center; gap:16px; flex-wrap:wrap; }

        /* Skeleton loader */
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .skeleton { background:linear-gradient(90deg,#e7eeff 25%,#f0f3ff 50%,#e7eeff 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; border-radius:8px; }

        @media (max-width:768px) {
          .nav-links { display:none !important; }
          .hamburger-btn { display:flex !important; align-items:center; justify-content:center; }
          .hero-section { padding:32px 16px !important; }
          .hero-title { font-size:22px !important; line-height:1.3 !important; }
          .hero-subtitle { font-size:15px !important; }
          .hero-search { flex-direction:column !important; gap:8px !important; padding:12px !important; border-radius:12px !important; }
          .hero-search input { min-width:unset !important; width:100% !important; }
          .hero-search button { width:100% !important; padding:14px !important; border-radius:8px !important; }
          .ai-pill { font-size:12px !important; padding:10px 16px !important; }
          .specialty-section { padding:24px 16px !important; }
          .specialty-grid { grid-template-columns:repeat(3,1fr) !important; gap:8px !important; }
          .specialty-card { padding:12px 8px !important; }
          .doctors-section { padding:24px 16px !important; }
          .doctors-grid { grid-template-columns:1fr !important; gap:14px !important; }
          .doctors-header { flex-direction:column !important; align-items:flex-start !important; gap:8px !important; }
          .steps-section { padding:24px 16px !important; }
          .steps-grid { grid-template-columns:1fr !important; gap:20px !important; }
          .stats-row { gap:2rem !important; padding:32px 16px !important; }
          .stat-number { font-size:2rem !important; }
          .cta-section { padding:32px 16px !important; }
          .cta-title { font-size:22px !important; }
          .cta-buttons { flex-direction:column !important; align-items:center !important; }
          .cta-btn { width:100% !important; max-width:320px !important; }
          .footer-grid { grid-template-columns:1fr !important; gap:16px !important; }
          .footer-section { padding:24px 16px 80px !important; }
        }
      `}</style>

      <div style={{ fontFamily:"'Public Sans',sans-serif", background:'#f9f9ff', minHeight:'100vh', paddingBottom:72 }}>

        {/* Mobile menu overlay */}
        <div className={`mobile-menu-overlay ${mobileMenuOpen ? 'open' : ''}`} onClick={() => setMobileMenuOpen(false)} />

        {/* Mobile slide-in menu */}
        <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
            <span style={{ fontSize:18, fontWeight:700, color:'#003d9b' }}>MediLocal</span>
            <button onClick={() => setMobileMenuOpen(false)} style={{ padding:8, borderRadius:'50%', border:'none', background:'#f0f3ff', cursor:'pointer', display:'flex' }}>
              <span className="material-symbols-outlined" style={{ color:'#003d9b', fontSize:20 }}>close</span>
            </button>
          </div>
          {[
            { label:'Find Doctors',       action:() => navigate('/search') },
            { label:'AI Symptom Checker', action:() => navigate('/symptom-checker') },
            { label:'Nearby on Maps',     action:openNearbyDoctors },
          ].map((item, i) => (
            <button key={i} onClick={() => { item.action(); setMobileMenuOpen(false); }}
              style={{ width:'100%', padding:'12px 16px', borderRadius:8, border:'none', background:'#f0f3ff', color:'#091c35', fontWeight:600, fontSize:15, cursor:'pointer', textAlign:'left', marginBottom:8 }}>
              {item.label}
            </button>
          ))}
          <div style={{ marginTop:16, borderTop:'1px solid #c3c6d6', paddingTop:16, display:'flex', flexDirection:'column', gap:8 }}>
            {user ? (
              <>
                <button onClick={() => { navigate(user.role==='doctor'?'/doctor/dashboard':'/patient/dashboard'); setMobileMenuOpen(false); }}
                  style={{ width:'100%', padding:'12px', borderRadius:8, border:'none', background:'#003d9b', color:'white', fontWeight:700, cursor:'pointer' }}>Dashboard</button>
                <button onClick={() => { logout(); navigate('/'); setMobileMenuOpen(false); }}
                  style={{ width:'100%', padding:'12px', borderRadius:8, border:'1px solid #c3c6d6', background:'transparent', color:'#434654', fontWeight:600, cursor:'pointer' }}>Logout</button>
              </>
            ) : (
              <>
                <button onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                  style={{ width:'100%', padding:'12px', borderRadius:8, border:'1px solid #003d9b', background:'transparent', color:'#003d9b', fontWeight:600, cursor:'pointer' }}>Login</button>
                <button onClick={() => { navigate('/register'); setMobileMenuOpen(false); }}
                  style={{ width:'100%', padding:'12px', borderRadius:8, border:'none', background:'#003d9b', color:'white', fontWeight:700, cursor:'pointer' }}>Register</button>
              </>
            )}
          </div>
        </div>

        {/* ── NAVBAR ── */}
        <header style={{ position:'fixed', top:0, zIndex:40, width:'100%', background:'#f9f9ff', borderBottom:'1px solid #c3c6d6', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 24px' }}>
          <span style={{ fontSize:20, fontWeight:700, color:'#003d9b' }}>MediLocal</span>
          <div style={{ flex:1, maxWidth:360, margin:'0 24px', position:'relative' }} className="nav-links">
            <span className="material-symbols-outlined" style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#434654', fontSize:18 }}>search</span>
            <input placeholder="Search specialists or clinics..."
              style={{ width:'100%', paddingLeft:38, paddingRight:12, paddingTop:7, paddingBottom:7, background:'#e7eeff', borderRadius:9999, border:'none', outline:'none', fontSize:14 }} />
          </div>
          <div className="nav-links" style={{ gap:12 }}>
            <button onClick={openNearbyDoctors} style={{ padding:8, borderRadius:'50%', border:'none', background:'transparent', cursor:'pointer', display:'flex' }}>
              <span className="material-symbols-outlined" style={{ color:'#003d9b' }}>location_on</span>
            </button>
            {user ? (
              <>
                <button onClick={() => navigate(user.role==='doctor'?'/doctor/dashboard':'/patient/dashboard')}
                  style={{ padding:'6px 16px', background:'#003d9b', color:'white', border:'none', borderRadius:8, cursor:'pointer', fontWeight:600, fontSize:14 }}>Dashboard</button>
                <button onClick={() => { logout(); navigate('/'); }}
                  style={{ padding:'6px 16px', background:'transparent', color:'#003d9b', border:'1px solid #003d9b', borderRadius:8, cursor:'pointer', fontWeight:600, fontSize:14 }}>Logout</button>
              </>
            ) : (
              <>
                <button onClick={() => navigate('/login')}
                  style={{ padding:'6px 16px', background:'transparent', color:'#003d9b', border:'1px solid #003d9b', borderRadius:8, cursor:'pointer', fontWeight:600, fontSize:14 }}>Login</button>
                <button onClick={() => navigate('/register')}
                  style={{ padding:'6px 16px', background:'#003d9b', color:'white', border:'none', borderRadius:8, cursor:'pointer', fontWeight:700, fontSize:14 }}>Register</button>
              </>
            )}
          </div>
          <button className="hamburger-btn" onClick={() => setMobileMenuOpen(true)}>
            <span className="material-symbols-outlined" style={{ color:'#003d9b' }}>menu</span>
          </button>
        </header>

        <main style={{ paddingTop:56 }}>

          {/* ── HERO ── */}
          <section className="hero-section" style={{ background:'linear-gradient(135deg,#001848 0%,#003d9b 50%,#0052cc 100%)', padding:'48px 48px', textAlign:'center', color:'white' }}>
            <h1 className="hero-title" style={{ fontSize:32, fontWeight:700, lineHeight:1.25, letterSpacing:'-0.02em', marginBottom:16 }}>
              Expert Healthcare, <br />Right in Your City.
            </h1>
            <p className="hero-subtitle" style={{ color:'rgba(255,255,255,0.9)', fontSize:18, lineHeight:'28px', marginBottom:32, maxWidth:560, margin:'0 auto 32px' }}>
              Find verified specialists, check live wait times, and book appointments instantly.
            </p>
            <div className="hero-search" style={{ background:'white', padding:6, borderRadius:12, boxShadow:'0 8px 32px rgba(0,0,0,0.2)', maxWidth:700, margin:'0 auto 24px' }}>
              <div style={{ flex:1, display:'flex', alignItems:'center', padding:'0 12px', borderRight:'1px solid #c3c6d6' }}>
                <span className="material-symbols-outlined" style={{ color:'#003d9b', marginRight:8, fontSize:20 }}>search</span>
                <input value={searchSpecialty} onChange={e => setSearchSpecialty(e.target.value)}
                  onKeyDown={e => e.key==='Enter' && handleSearch()}
                  placeholder="Specialist (e.g. Cardiologist)"
                  style={{ width:'100%', border:'none', outline:'none', fontSize:15, padding:'12px 0',color: '#091c35', background:'transparent' }} />
              </div>
              <div style={{ flex:1, display:'flex', alignItems:'center', padding:'0 12px' }}>
                <span className="material-symbols-outlined" style={{ color:'#003d9b', marginRight:8, fontSize:20 }}>location_on</span>
                <input value={searchCity} onChange={e => setSearchCity(e.target.value)}
                  onKeyDown={e => e.key==='Enter' && handleSearch()}
                  placeholder="City"
                  style={{ width:'100%', border:'none', outline:'none', fontSize:15, padding:'12px 0', background:'transparent' }} />
              </div>
              <button onClick={handleSearch}
                style={{ background:'#003d9b', color:'white', border:'none', padding:'14px 28px', borderRadius:8, fontWeight:700, fontSize:14, cursor:'pointer', whiteSpace:'nowrap' }}>
                Search Now
              </button>
            </div>
            <div className="ai-pill" onClick={() => navigate('/symptom-checker')}
              style={{ display:'inline-flex', alignItems:'center', gap:10, background:'#82f9be', color:'#00734c', padding:'12px 24px', borderRadius:9999, cursor:'pointer', fontWeight:600, fontSize:14, boxShadow:'0 4px 16px rgba(0,0,0,0.15)' }}>
              <span className="material-symbols-outlined" style={{ fontSize:20 }}>smart_toy</span>
              Unsure what's wrong? Try our AI Symptom Checker
              <span className="material-symbols-outlined" style={{ fontSize:18 }}>chevron_right</span>
            </div>
          </section>

          {/* ── SPECIALTIES ── */}
          <section className="specialty-section" style={{ padding:'32px 48px', maxWidth:1280, margin:'0 auto' }}>
            <h2 style={{ fontSize:22, fontWeight:600, color:'#091c35', marginBottom:20 }}>Common Specialties</h2>
            <div className="specialty-grid">
              {specialties.map(s => (
                <div key={s.name} className="specialty-card"
                  onClick={() => s.isAll ? navigate('/search') : navigate(`/search?specialty=${s.name}`)}
                  style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:20, background:'#f9f9ff', border:'1px solid #c3c6d6', borderRadius:12, cursor:'pointer', transition:'all 0.2s' }}>
                  <div className="spec-icon" style={{ width:52, height:52, borderRadius:'50%', background:s.isAll?'#e7eeff':'#dae2ff', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:10 }}>
                    <span className="material-symbols-outlined" style={{ color:s.isAll?'#434654':'#003d9b', fontVariationSettings:"'FILL' 1", fontSize:24 }}>{s.icon}</span>
                  </div>
                  <span style={{ fontSize:12, fontWeight:600, color:'#091c35', textAlign:'center', lineHeight:'16px' }}>{s.name}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ── VERIFIED DOCTORS (REAL DATA) ── */}
          <section className="doctors-section" style={{ background:'#f0f3ff', padding:'32px 48px' }}>
            <div style={{ maxWidth:1280, margin:'0 auto' }}>
              <div className="doctors-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:24 }}>
                <div>
                  <h2 style={{ fontSize:22, fontWeight:600, color:'#091c35' }}>Verified Doctors Near You</h2>
                  <p style={{ color:'#434654', fontSize:15, marginTop:4 }}>
                    {doctorsLoading ? 'Loading doctors...' : `${doctors.length} verified provider${doctors.length !== 1 ? 's' : ''} available`}
                  </p>
                </div>
                <span onClick={() => navigate('/search')} style={{ color:'#003d9b', fontWeight:600, fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', gap:4, whiteSpace:'nowrap' }}>
                  View All <span className="material-symbols-outlined" style={{ fontSize:16 }}>arrow_forward</span>
                </span>
              </div>

              {/* Loading skeletons */}
              {doctorsLoading && (
                <div className="doctors-grid">
                  {[1,2,3].map(i => (
                    <div key={i} style={{ background:'white', border:'1px solid #c3c6d6', borderRadius:12, overflow:'hidden' }}>
                      <div style={{ padding:16, display:'flex', gap:14 }}>
                        <div className="skeleton" style={{ width:80, height:80, borderRadius:8, flexShrink:0 }} />
                        <div style={{ flex:1, display:'flex', flexDirection:'column', gap:8 }}>
                          <div className="skeleton" style={{ height:16, width:'70%' }} />
                          <div className="skeleton" style={{ height:12, width:'50%' }} />
                          <div className="skeleton" style={{ height:12, width:'80%' }} />
                        </div>
                      </div>
                      <div className="skeleton" style={{ height:44, margin:'0 16px 16px', borderRadius:8 }} />
                    </div>
                  ))}
                </div>
              )}

              {/* No doctors yet */}
              {!doctorsLoading && doctors.length === 0 && (
                <div style={{ textAlign:'center', padding:'3rem', background:'white', borderRadius:12, border:'1px solid #c3c6d6' }}>
                  <span className="material-symbols-outlined" style={{ fontSize:48, color:'#c3c6d6', display:'block', marginBottom:12 }}>local_hospital</span>
                  <p style={{ color:'#434654', fontSize:16, marginBottom:16 }}>No doctors registered yet.</p>
                  <button onClick={() => navigate('/register')}
                    style={{ background:'#003d9b', color:'white', padding:'10px 24px', borderRadius:8, border:'none', cursor:'pointer', fontWeight:600, fontSize:14 }}>
                    Register as a Doctor
                  </button>
                </div>
              )}

              {/* Real doctor cards */}
              {!doctorsLoading && doctors.length > 0 && (
                <div className="doctors-grid">
                  {doctors.slice(0, 3).map((doc, i) => (
                    <div key={doc._id} className="doctor-card"
                      style={{ background:'white', border:'1px solid #c3c6d6', borderRadius:12, overflow:'hidden', transition:'all 0.2s', cursor:'pointer' }}
                      onClick={() => navigate(`/doctor/${doc._id}`)}>
                      <div style={{ display:'flex', padding:16, gap:14 }}>
                        {/* Avatar */}
                        <div style={{ width:80, height:80, borderRadius:8, background:'#dae2ff', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <span className="material-symbols-outlined" style={{ fontSize:40, color:'#003d9b', fontVariationSettings:"'FILL' 1" }}>person</span>
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                            <h3 style={{ fontSize:16, fontWeight:600, color:'#091c35' }}>{doc.name}</h3>
                            <div style={{ background:'#82f9be', color:'#00734c', padding:'2px 8px', borderRadius:4, fontSize:10, fontWeight:700, flexShrink:0, marginLeft:8, display:'flex', alignItems:'center', gap:3 }}>
                              <span className="material-symbols-outlined" style={{ fontSize:12, fontVariationSettings:"'FILL' 1" }}>verified</span>
                              VERIFIED
                            </div>
                          </div>
                          <p style={{ color:'#434654', fontSize:13, fontWeight:600, marginTop:4 }}>
                            {doc.specialty} • {doc.experience} Yrs Exp
                          </p>
                          <p style={{ color:'#434654', fontSize:12, marginTop:4 }}>
                            🏥 {doc.clinicName}
                          </p>
                          <p style={{ color:'#434654', fontSize:12, marginTop:2 }}>
                            📍 {doc.address}, {doc.city}
                          </p>
                          <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:8 }}>
                            <span className="pulse-dot" style={{ width:7, height:7, background:'#006c47', borderRadius:'50%', display:'inline-block', flexShrink:0 }} />
                            <span style={{ fontSize:11, fontWeight:700, color:'#006c47' }}>
                              {doc.isAvailable ? 'Available Now' : 'Check Availability'}
                            </span>
                          </div>
                          {/* Rating */}
                          {doc.rating > 0 && (
                            <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:4 }}>
                              <span className="material-symbols-outlined" style={{ fontSize:14, color:'#5e3c00', fontVariationSettings:"'FILL' 1" }}>star</span>
                              <span style={{ fontSize:12, fontWeight:700, color:'#091c35' }}>{doc.rating}</span>
                              <span style={{ fontSize:11, color:'#434654' }}>({doc.totalReviews} reviews)</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{ background:'#e7eeff', padding:'10px 16px', borderTop:'1px solid #c3c6d6', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8, color:'#434654' }}>
                          <span className="material-symbols-outlined" style={{ fontSize:14 }}>payments</span>
                          <span style={{ fontSize:12, fontWeight:600 }}>₹{doc.fee} consultation</span>
                        </div>
                        <div style={{ display:'flex', gap:8 }}>
                          <button
                            onClick={e => { e.stopPropagation(); navigate(`/doctor/${doc._id}`); }}
                            style={{ background:'white', color:'#003d9b', padding:'6px 14px', borderRadius:8, border:'1px solid #003d9b', fontWeight:600, fontSize:12, cursor:'pointer' }}>
                            View
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); navigate(`/book/${doc._id}`); }}
                            style={{ background:'#003d9b', color:'white', padding:'6px 14px', borderRadius:8, border:'none', fontWeight:700, fontSize:12, cursor:'pointer' }}>
                            Book Now
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Show more button if more than 3 */}
              {!doctorsLoading && doctors.length > 3 && (
                <div style={{ textAlign:'center', marginTop:24 }}>
                  <button onClick={() => navigate('/search')}
                    style={{ background:'#003d9b', color:'white', padding:'12px 32px', borderRadius:10, border:'none', fontWeight:700, fontSize:14, cursor:'pointer' }}>
                    View All {doctors.length} Doctors →
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* ── HOW IT WORKS ── */}
          <section className="steps-section" style={{ padding:'32px 48px', maxWidth:1280, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:32 }}>
              <h2 style={{ fontSize:22, fontWeight:600, color:'#091c35' }}>Seamless Care in 3 Steps</h2>
              <p style={{ color:'#434654', fontSize:15, marginTop:4 }}>Designed for clarity and trust in Tier 2 & 3 cities.</p>
            </div>
            <div className="steps-grid">
              {[
                { icon:'search',          title:'1. Find Your Doctor',     desc:"Browse verified specialists near your home. Use AI to check symptoms if you're unsure who to see." },
                { icon:'phonelink_setup', title:'2. OTP Verified Booking', desc:'Secure your slot instantly with OTP verification. No complex accounts — just your mobile number.' },
                { icon:'pending_actions', title:'3. Track Live Queue',     desc:"Don't wait in crowded rooms. Monitor the live queue from home and head to the clinic when it's your turn." },
              ].map((step, i) => (
                <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center' }}>
                  <div style={{ width:72, height:72, borderRadius:'50%', background:'#0052cc', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20, boxShadow:'0 4px 12px rgba(0,61,155,0.3)' }}>
                    <span className="material-symbols-outlined" style={{ fontSize:28, color:'white' }}>{step.icon}</span>
                  </div>
                  <h3 style={{ fontSize:18, fontWeight:600, marginBottom:10 }}>{step.title}</h3>
                  <p style={{ color:'#434654', fontSize:15, lineHeight:'24px' }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── STATS ── */}
          <div style={{ background:'#003d9b', padding:'40px 24px' }}>
            <div className="stats-row">
              {[
                { number: doctors.length > 0 ? `${doctors.length}+` : '500+', label:'Verified Doctors' },
                { number:'50+',  label:'Cities Covered' },
                { number:'10k+', label:'Appointments Booked' },
              ].map(stat => (
                <div key={stat.label} style={{ textAlign:'center', color:'white' }}>
                  <h2 className="stat-number" style={{ fontSize:'2.5rem', margin:0, fontWeight:700 }}>{stat.number}</h2>
                  <p style={{ margin:'8px 0 0', opacity:0.9, fontSize:15 }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── CTA ── */}
          <section className="cta-section" style={{ padding:'48px 24px', maxWidth:1280, margin:'0 auto' }}>
            <div style={{ background:'#003d9b', borderRadius:16, padding:'56px 40px', textAlign:'center', color:'white', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:-40, right:-40, width:240, height:240, background:'rgba(255,255,255,0.08)', borderRadius:'50%' }} />
              <div style={{ position:'absolute', bottom:-40, left:-40, width:180, height:180, background:'rgba(255,255,255,0.08)', borderRadius:'50%' }} />
              <h2 className="cta-title" style={{ fontSize:28, fontWeight:700, marginBottom:16, position:'relative', zIndex:10 }}>Health Support for Everyone</h2>
              <p style={{ fontSize:16, opacity:0.9, marginBottom:32, position:'relative', zIndex:10 }}>Get the best experience with real-time alerts and live queue tracking.</p>
              <div className="cta-buttons" style={{ position:'relative', zIndex:10 }}>
                <button className="cta-btn" onClick={() => navigate('/register')}
                  style={{ background:'white', color:'#003d9b', padding:'14px 28px', borderRadius:12, border:'none', fontWeight:600, fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
                  <span className="material-symbols-outlined" style={{ fontSize:18 }}>person_add</span>
                  Get Started Free
                </button>
                <button className="cta-btn" onClick={() => navigate('/register')}
                  style={{ background:'transparent', color:'white', padding:'14px 28px', borderRadius:12, border:'1px solid rgba(255,255,255,0.5)', fontWeight:600, fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  Register as a Provider
                </button>
              </div>
            </div>
          </section>

          {/* ── FOOTER ── */}
          <footer className="footer-section" style={{ padding:'32px 48px 80px', borderTop:'1px solid #c3c6d6', background:'white' }}>
            <div className="footer-grid" style={{ maxWidth:1280, margin:'0 auto' }}>
              <div>
                <span style={{ fontSize:22, fontWeight:600, color:'#003d9b' }}>MediLocal</span>
                <p style={{ color:'#434654', fontSize:14, marginTop:12 }}>© 2026 MediLocal Healthcare. Connecting Tier 2 & 3 Cities to Quality Care.</p>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <h4 style={{ fontSize:13, fontWeight:600, color:'#091c35', marginBottom:4 }}>Quick Links</h4>
                {['About Providers','Verified Status FAQ','Privacy Policy'].map(l => (
                  <a key={l} href="#" style={{ color:'#434654', fontSize:13, textDecoration:'none' }}>{l}</a>
                ))}
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <h4 style={{ fontSize:13, fontWeight:600, color:'#091c35', marginBottom:4 }}>Support</h4>
                {['Contact Support','Terms of Service','Clinic Registration'].map(l => (
                  <a key={l} href="#" style={{ color:'#434654', fontSize:13, textDecoration:'none' }}>{l}</a>
                ))}
              </div>
            </div>
          </footer>
        </main>

        {/* ── BOTTOM NAV ── */}
        <nav style={{ position:'fixed', bottom:0, width:'100%', zIndex:40, display:'flex', justifyContent:'space-around', alignItems:'center', padding:'8px 16px', background:'#f9f9ff', boxShadow:'0 -2px 8px rgba(0,0,0,0.08)', borderTop:'1px solid #c3c6d6', borderRadius:'12px 12px 0 0' }}>
          {[
            { icon:'home',          label:'Home',    action:() => navigate('/'),                   active:true },
            { icon:'map',           label:'Nearby',  action:openNearbyDoctors },
            { icon:'psychology_alt',label:'AI Check',action:() => navigate('/symptom-checker') },
            { icon:'list_alt',      label:'Queue',   action:() => navigate(user?'/patient/dashboard':'/login') },
          ].map((item, i) => (
            <div key={i} onClick={item.action} style={{ display:'flex', flexDirection:'column', alignItems:'center', cursor:'pointer', padding:'4px 16px', borderRadius:9999, background:item.active?'#dae2ff':'transparent', color:item.active?'#001848':'#434654' }}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings:item.active?"'FILL' 1":"'FILL' 0", fontSize:22 }}>{item.icon}</span>
              <span style={{ fontSize:11, fontWeight:600 }}>{item.label}</span>
            </div>
          ))}
        </nav>
      </div>
    </>
  );
};

export default LandingPage;