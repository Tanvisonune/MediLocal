import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';

const SearchPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All Categories');
  const [searchText, setSearchText] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, logout } = useAuth();

  const filters = [
    { label: 'All Categories',   icon: 'filter_list' },
    { label: 'Cardiology',       icon: 'favorite' },
    { label: 'Neurology',        icon: 'psychology' },
    { label: 'Pediatrics',       icon: 'child_care' },
    { label: 'Dentistry',        icon: 'dentistry' },
    { label: 'Dermatology',      icon: 'healing' },
    { label: 'Ophthalmology',    icon: 'visibility' },
    { label: 'General Physician',icon: 'medical_services' },
    { label: 'Orthopedic',       icon: 'accessibility' },
    { label: 'Gynecology',       icon: 'pregnant_woman' },
    { label: 'ENT',              icon: 'hearing' },
    { label: 'Psychiatry',       icon: 'self_improvement' },
  ];

  const sideNavItems = [
    { icon: 'calendar_today',  label: 'My Appointments',   action: () => navigate('/patient/dashboard') },
    { icon: 'smart_toy',       label: 'AI Symptom Checker', action: () => navigate('/symptom-checker') },
    { icon: 'hourglass_empty', label: 'Live Queue',         action: () => alert('Live Queue coming soon!') },
    { icon: 'description',     label: 'Medical Records',    action: () => navigate('/patient/dashboard') },
    { icon: 'help_outline',    label: 'Help Center',        action: () => window.open('mailto:support@MediLocal.com', '_blank') },
  ];

  // eslint-disable-next-line
  useEffect(() => {
    const city = searchParams.get('city') || '';
    const specialty = searchParams.get('specialty') || '';
    if (specialty) setActiveFilter(specialty);
    setSearchText(specialty || city);
    fetchDoctors({ city, specialty });
  }, []);

  const fetchDoctors = async (params = {}) => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (params.city) query.append('city', params.city);
      if (params.specialty && params.specialty !== 'All Categories') query.append('specialty', params.specialty);
      const res = await API.get(`/doctors/search?${query}`);
      setDoctors(res.data.doctors);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleFilterClick = (label) => {
    setActiveFilter(label);
    fetchDoctors({ specialty: label === 'All Categories' ? '' : label });
  };

  const handleSearch = () => {
    // Try to match as city or specialty
    fetchDoctors({ specialty: searchText, city: searchText });
  };

  const openNearbyDoctors = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => window.open(`https://www.google.com/maps/search/doctors+near+me/@${pos.coords.latitude},${pos.coords.longitude},14z`, '_blank'),
        () => window.open('https://www.google.com/maps/search/doctors+near+me', '_blank')
      );
    } else window.open('https://www.google.com/maps/search/doctors+near+me', '_blank');
  };

  const getQueueBadge = (doctor) => doctor.isAvailable
    ? { bg: '#82f9be', color: '#006c47', dot: '#006c47', pulse: true,  text: 'Available Now' }
    : { bg: '#dfe8ff', color: '#434654', dot: '#737685', pulse: false, text: 'Check Availability' };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:'Public Sans',sans-serif; background:#f9f9ff; }
        .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; font-family:'Material Symbols Outlined'; font-size:24px; line-height:1; display:inline-block; vertical-align:middle; }
        .pulse-dot { animation:pulse-anim 2s cubic-bezier(0.4,0,0.6,1) infinite; }
        @keyframes pulse-anim { 0%,100%{opacity:1} 50%{opacity:.3} }
        .doctor-card:hover { box-shadow:0 8px 24px rgba(0,0,0,0.12); }
        .no-scrollbar::-webkit-scrollbar { display:none; }
        .no-scrollbar { -ms-overflow-style:none; scrollbar-width:none; }
        .side-link:hover { background:#dfe8ff; }
        .book-btn:hover { background:#0052cc !important; }

        /* Sidebar */
        .sidebar {
          width:256px; height:100vh; position:fixed; left:0; top:0; z-index:50;
          background:#f0f3ff; border-right:1px solid #c3c6d6;
          display:flex; flex-direction:column; padding:16px; gap:8px;
          transition:transform 0.25s ease; overflow-y:auto;
        }
        .sidebar-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.4); z-index:49; }
        .sidebar-overlay.open { display:block; }
        .hamburger { display:none; padding:8px; border-radius:8px; border:none; background:transparent; cursor:pointer; }
        .main-with-sidebar { margin-left:256px; }
        .desktop-search { display:flex; }

        /* Doctor cards: horizontal on desktop */
        .doc-card-inner { display:flex; flex-direction:row; min-width:0; }
        .doc-card-img { width:160px; flex-shrink:0; min-height:180px; }
        .doc-card-info { flex:1; min-width:0; overflow:hidden; }
        .doctor-card { min-width:0; overflow:hidden; }

        @media (max-width:768px) {
          .sidebar { transform:translateX(-100%); }
          .sidebar.open { transform:translateX(0); }
          .sidebar-overlay.open { display:block; }
          .hamburger { display:flex !important; align-items:center; justify-content:center; color:#003d9b; }
          .main-with-sidebar { margin-left:0 !important; }
          .desktop-search { display:none !important; }

          /* Doctor cards: vertical stacked on mobile */
          .doc-card-inner { flex-direction:column !important; }
          .doc-card-img { width:100% !important; height:120px !important; min-height:unset !important; }
          .doc-card-info { padding:12px !important; width:100% !important; }
          .doc-card-footer { padding:10px 12px !important; flex-wrap:wrap !important; }
          .book-btn { padding:8px 14px !important; font-size:13px !important; }
          .view-btn { padding:8px 12px !important; font-size:13px !important; }
          .map-small-btn { display:none !important; }

          /* Grid — full width single column */
          .doctors-grid { grid-template-columns:1fr !important; gap:12px !important; }

          /* Page padding */
          .page-pad { padding:12px !important; }
          .header-pad { padding:0 12px !important; }
          .section-title { font-size:20px !important; }

          /* Filter chips scroll */
          .filter-chips { padding-bottom:10px !important; }

          /* Prevent text overflow */
          h3, p, span { word-break:break-word; }
        }

        @media (min-width:769px) and (max-width:1100px) {
          .sidebar { width:200px; }
          .main-with-sidebar { margin-left:200px; }
          .doctors-grid { grid-template-columns:1fr !important; }
          .doc-card-img { width:140px !important; }
        }
      `}</style>

      <div style={{ fontFamily:"'Public Sans',sans-serif", background:'#f9f9ff', minHeight:'100vh' }}>

        {/* Sidebar overlay */}
        <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

        {/* ── SIDEBAR ── */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
            <p style={{ fontSize:16, fontWeight:700, color:'#003d9b' }}>MediLocal</p>
            <button onClick={() => setSidebarOpen(false)} style={{ padding:6, borderRadius:'50%', border:'none', background:'#dae2ff', cursor:'pointer', display:'flex' }}>
              <span className="material-symbols-outlined" style={{ fontSize:18, color:'#003d9b' }}>close</span>
            </button>
          </div>

          <div style={{ marginBottom:16, padding:'0 8px' }}>
            <p style={{ fontSize:13, fontWeight:600, color:'#434654' }}>Welcome, {user?.name || 'Patient'}</p>
            <p style={{ fontSize:15, fontWeight:700, color:'#003d9b', marginTop:2 }}>Tier 2 Healthcare Portal</p>
          </div>

          <nav style={{ flex:1, display:'flex', flexDirection:'column', gap:4 }}>
            {sideNavItems.map((item, i) => (
              <div key={i} className="side-link"
                onClick={() => { item.action(); setSidebarOpen(false); }}
                style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 14px', borderRadius:8, cursor:'pointer', transition:'background 0.15s', color:'#434654' }}>
                <span className="material-symbols-outlined" style={{ fontSize:20 }}>{item.icon}</span>
                <span style={{ fontSize:13, fontWeight:600 }}>{item.label}</span>
              </div>
            ))}
          </nav>

          <button onClick={openNearbyDoctors}
            style={{ width:'100%', background:'#e7eeff', color:'#003d9b', padding:'10px', borderRadius:10, border:'1px solid #c3c6d6', fontWeight:600, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:8 }}>
            <span className="material-symbols-outlined" style={{ fontSize:16, fontVariationSettings:"'FILL' 1" }}>map</span>
            View on Google Maps
          </button>

          <button onClick={() => { navigate('/search'); setSidebarOpen(false); }}
            style={{ width:'100%', background:'#003d9b', color:'white', padding:'12px', borderRadius:12, border:'none', fontWeight:700, fontSize:13, cursor:'pointer', marginBottom:16 }}>
            Book New Visit
          </button>

          <div style={{ paddingTop:12, borderTop:'1px solid #c3c6d6', display:'flex', flexDirection:'column', gap:4 }}>
            <div className="side-link" style={{ display:'flex', alignItems:'center', gap:14, padding:'10px 14px', borderRadius:8, cursor:'pointer', color:'#434654' }}>
              <span className="material-symbols-outlined" style={{ fontSize:20 }}>settings</span>
              <span style={{ fontSize:13, fontWeight:600 }}>Settings</span>
            </div>
            <div className="side-link" onClick={() => { logout(); navigate('/'); }}
              style={{ display:'flex', alignItems:'center', gap:14, padding:'10px 14px', borderRadius:8, cursor:'pointer', color:'#434654' }}>
              <span className="material-symbols-outlined" style={{ fontSize:20 }}>logout</span>
              <span style={{ fontSize:13, fontWeight:600 }}>Logout</span>
            </div>
          </div>
        </aside>

        {/* ── HEADER ── */}
        <header style={{ position:'fixed', top:0, zIndex:40, width:'100%', height:64, background:'#f9f9ff', borderBottom:'1px solid #c3c6d6', display:'flex', justifyContent:'space-between', alignItems:'center' }} className="header-pad" >
          <div style={{ display:'flex', alignItems:'center', gap:8, paddingLeft:16 }}>
            {/* Hamburger */}
            <button className="hamburger" onClick={() => setSidebarOpen(true)}>
              <span className="material-symbols-outlined" style={{ color:'#003d9b' }}>menu</span>
            </button>
            <span onClick={() => navigate('/')} style={{ fontSize:18, fontWeight:700, color:'#003d9b', cursor:'pointer' }}>MediLocal</span>
          </div>

          {/* Desktop search */}
          <div className="desktop-search" style={{ flex:1, maxWidth:440, margin:'0 24px', position:'relative', alignItems:'center' }}>
            <span className="material-symbols-outlined" style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#434654', fontSize:18 }}>search</span>
            <input value={searchText} onChange={e => setSearchText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Search by specialty or doctor name..."
              style={{ width:'100%', paddingLeft:42, paddingRight:14, paddingTop:8, paddingBottom:8, background:'#f0f3ff', border:'1px solid #c3c6d6', borderRadius:9999, outline:'none', fontSize:15 }} />
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:8, paddingRight:16 }}>
            <button onClick={openNearbyDoctors} title="Nearby doctors on Maps"
              style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:8, border:'1px solid #c3c6d6', background:'transparent', color:'#003d9b', fontWeight:600, fontSize:13, cursor:'pointer' }}>
              <span className="material-symbols-outlined" style={{ fontSize:16, fontVariationSettings:"'FILL' 1" }}>location_on</span>
              <span>Nearby</span>
            </button>
            <button onClick={() => alert('Check your appointments dashboard!')}
              style={{ position:'relative', padding:8, borderRadius:'50%', border:'none', background:'transparent', cursor:'pointer' }}>
              <span className="material-symbols-outlined" style={{ color:'#434654' }}>notifications</span>
              <span style={{ position:'absolute', top:4, right:4, width:8, height:8, background:'#ba1a1a', borderRadius:'50%' }} />
            </button>
            {user ? (
              <div style={{ width:32, height:32, borderRadius:'50%', background:'#dae2ff', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}
                onClick={() => navigate('/patient/dashboard')}>
                <span className="material-symbols-outlined" style={{ color:'#003d9b', fontSize:18 }}>person</span>
              </div>
            ) : (
              <button onClick={() => navigate('/login')} style={{ padding:'6px 14px', background:'#003d9b', color:'white', border:'none', borderRadius:8, cursor:'pointer', fontWeight:600, fontSize:13 }}>Login</button>
            )}
          </div>
        </header>

        {/* ── LAYOUT ── */}
        <div style={{ display:'flex', paddingTop:64, paddingBottom:80 }}>

          {/* Sidebar spacer (desktop only) */}
          <div className="main-with-sidebar" style={{ display:'none' }} />

          {/* ── MAIN ── */}
          <main className="main-with-sidebar" style={{ flex:1, minHeight:'calc(100vh - 64px)', minWidth:0, overflow:'hidden' }}>

            {/* Mobile search bar */}
            <div style={{ padding:'12px 16px', background:'white', borderBottom:'1px solid #c3c6d6', display:'none' }} className="mobile-search-bar">
              <div style={{ display:'flex', alignItems:'center', background:'#f0f3ff', borderRadius:9999, padding:'8px 14px', gap:8 }}>
                <span className="material-symbols-outlined" style={{ color:'#434654', fontSize:18 }}>search</span>
                <input value={searchText} onChange={e => setSearchText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="Search specialty or doctor..."
                  style={{ flex:1, border:'none', outline:'none', background:'transparent', fontSize:15 }} />
              </div>
            </div>

            <div className="page-pad" style={{ padding:'24px 48px' }}>

              {/* Page header */}
              <section style={{ marginBottom:24 }}>
                <h1 className="section-title" style={{ fontSize:28, fontWeight:700, color:'#091c35', letterSpacing:'-0.02em', marginBottom:4 }}>
                  Find Specialist Near You
                </h1>
                <p style={{ fontSize:15, color:'#434654' }}>
                  Verified providers with real-time wait estimations.{' '}
                  <span onClick={openNearbyDoctors} style={{ color:'#003d9b', fontWeight:600, cursor:'pointer', textDecoration:'underline' }}>
                    View on Maps →
                  </span>
                </p>
              </section>

              {/* Filter Chips */}
              <div className="no-scrollbar filter-chips" style={{ display:'flex', gap:10, overflowX:'auto', paddingBottom:16, marginBottom:24 }}>
                {filters.map(f => (
                  <button key={f.label} onClick={() => handleFilterClick(f.label)}
                    style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 18px', borderRadius:9999, border: activeFilter === f.label ? 'none' : '1px solid #c3c6d6', background: activeFilter === f.label ? '#003d9b' : '#e7eeff', color: activeFilter === f.label ? 'white' : '#434654', fontWeight:600, fontSize:13, cursor:'pointer', whiteSpace:'nowrap', transition:'all 0.2s', flexShrink:0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize:16 }}>{f.icon}</span>
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Results */}
              {loading ? (
                <div style={{ textAlign:'center', padding:'4rem', color:'#434654' }}>
                  <span className="material-symbols-outlined" style={{ fontSize:48, color:'#003d9b' }}>search</span>
                  <p style={{ marginTop:16, fontSize:16 }}>Finding doctors...</p>
                </div>
              ) : doctors.length === 0 ? (
                <div style={{ textAlign:'center', padding:'4rem', background:'white', borderRadius:12, border:'1px solid #c3c6d6' }}>
                  <span className="material-symbols-outlined" style={{ fontSize:48, color:'#c3c6d6' }}>local_hospital</span>
                  <p style={{ marginTop:16, color:'#434654', fontSize:15 }}>No doctors found. Try a different filter.</p>
                  <button onClick={openNearbyDoctors} style={{ marginTop:16, background:'#003d9b', color:'white', padding:'10px 20px', borderRadius:8, border:'none', cursor:'pointer', fontWeight:600, display:'inline-flex', alignItems:'center', gap:8, fontSize:14 }}>
                    <span className="material-symbols-outlined" style={{ fontSize:18 }}>map</span>
                    Search on Google Maps
                  </button>
                </div>
              ) : (
                <div className="doctors-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(min(420px, 100%), 1fr))', gap:16 }}>
                  {doctors.map((doc) => {
                    const badge = getQueueBadge(doc);
                    return (
                      <div key={doc._id} className="doctor-card"
                        style={{ background:'white', border:'1px solid #c3c6d6', borderRadius:12, overflow:'hidden', transition:'all 0.3s' }}>
                        <div className="doc-card-inner">
                          {/* Image */}
                          <div className="doc-card-img" style={{ background:'#d6e3ff', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', minHeight:180 }}>
                            <span className="material-symbols-outlined" style={{ fontSize:56, color:'#003d9b', fontVariationSettings:"'FILL' 1" }}>person</span>
                            <div style={{ position:'absolute', top:10, left:10, background:badge.bg, color:badge.color, padding:'3px 10px', borderRadius:9999, display:'flex', alignItems:'center', gap:6, fontSize:11, fontWeight:500 }}>
                              <span className={badge.pulse ? 'pulse-dot' : ''} style={{ width:7, height:7, background:badge.dot, borderRadius:'50%', display:'inline-block', flexShrink:0 }} />
                              {badge.text}
                            </div>
                          </div>

                          {/* Info */}
                          <div className="doc-card-info" style={{ padding:14, flex:1, display:'flex', flexDirection:'column' }}>
                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                              <div>
                                <div style={{ display:'flex', alignItems:'center', gap:6, color:'#006c47', fontWeight:700, marginBottom:3 }}>
                                  <span className="material-symbols-outlined" style={{ fontSize:15, fontVariationSettings:"'FILL' 1" }}>verified</span>
                                  <span style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.06em' }}>Verified</span>
                                </div>
                                <h3 style={{ fontSize:17, fontWeight:600, color:'#091c35' }}>{doc.name}</h3>
                                <p style={{ fontSize:14, color:'#434654', marginTop:2 }}>{doc.specialty} • {doc.experience} Yrs</p>
                              </div>
                              <div style={{ background:'#f0f3ff', padding:'3px 7px', borderRadius:8, display:'flex', alignItems:'center', gap:3, border:'1px solid #c3c6d6', flexShrink:0 }}>
                                <span className="material-symbols-outlined" style={{ fontSize:15, color:'#5e3c00', fontVariationSettings:"'FILL' 1" }}>star</span>
                                <span style={{ fontSize:13, fontWeight:700, color:'#091c35' }}>{doc.rating > 0 ? doc.rating : '4.8'}</span>
                              </div>
                            </div>

                            <div style={{ display:'flex', flexDirection:'column', gap:5, marginTop:6, flex:1 }}>
                              <div style={{ display:'flex', alignItems:'center', gap:6, color:'#434654' }}>
                                <span className="material-symbols-outlined" style={{ fontSize:16 }}>location_on</span>
                                <span style={{ fontSize:13 }}>{doc.address}, {doc.city}</span>
                              </div>
                              <div style={{ display:'flex', alignItems:'center', gap:6, color:'#003d9b' }}>
                                <span className="material-symbols-outlined" style={{ fontSize:16 }}>schedule</span>
                                <span style={{ fontSize:13, fontWeight:700 }}>{doc.timings}</span>
                              </div>
                              <div style={{ display:'flex', alignItems:'center', gap:6, color:'#434654' }}>
                                <span className="material-symbols-outlined" style={{ fontSize:16 }}>translate</span>
                                <span style={{ fontSize:12 }}>{doc.languages?.join(', ')}</span>
                              </div>
                            </div>

                            <div className="doc-card-footer" style={{ marginTop:12, paddingTop:12, borderTop:'1px solid #c3c6d6', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                              <div>
                                <span style={{ fontSize:11, color:'#434654', display:'block' }}>Fee</span>
                                <span style={{ fontSize:18, fontWeight:700, color:'#091c35' }}>₹{doc.fee}</span>
                              </div>
                              <div style={{ display:'flex', gap:6 }}>
                                <button className="map-small-btn"
                                  onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent(`${doc.clinicName} ${doc.city}`)}`, '_blank')}
                                  style={{ padding:'7px', borderRadius:8, border:'1px solid #c3c6d6', background:'#f0f3ff', color:'#003d9b', cursor:'pointer', display:'flex', alignItems:'center' }}>
                                  <span className="material-symbols-outlined" style={{ fontSize:16, fontVariationSettings:"'FILL' 1" }}>map</span>
                                </button>
                                <button className="view-btn" onClick={() => navigate(`/doctor/${doc._id}`)}
                                  style={{ padding:'7px 14px', borderRadius:8, border:'1px solid #003d9b', background:'transparent', color:'#003d9b', fontWeight:600, fontSize:13, cursor:'pointer' }}>
                                  View
                                </button>
                                <button className="book-btn" onClick={() => navigate(`/book/${doc._id}`)}
                                  style={{ padding:'7px 18px', borderRadius:8, border:'none', background:'#003d9b', color:'white', fontWeight:600, fontSize:13, cursor:'pointer', transition:'all 0.2s' }}>
                                  Book
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Footer */}
              <footer style={{ marginTop:32, paddingTop:24, display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:20, borderTop:'1px solid #c3c6d6' }}>
                <div>
                  <span style={{ fontSize:20, fontWeight:600, color:'#003d9b' }}>MediLocal</span>
                  <p style={{ color:'#434654', fontSize:13, marginTop:10 }}>Empowering Tier 2 & 3 cities.</p>
                </div>
                {['About Providers', 'Privacy Policy', 'Contact Support'].map(l => (
                  <a key={l} href="#" style={{ color:'#434654', fontSize:13, textDecoration:'none', alignSelf:'center' }}>{l}</a>
                ))}
              </footer>
            </div>
          </main>
        </div>

        {/* ── BOTTOM NAV ── */}
        <nav style={{ position:'fixed', bottom:0, width:'100%', zIndex:40, background:'#f9f9ff', borderTop:'1px solid #c3c6d6', display:'flex', justifyContent:'space-around', alignItems:'center', padding:'8px 16px', boxShadow:'0 -2px 8px rgba(0,0,0,0.06)', borderRadius:'12px 12px 0 0' }}>
          {[
            { icon:'home',          label:'Home',     action:() => navigate('/') },
            { icon:'map',           label:'Nearby',   action:openNearbyDoctors, active:true },
            { icon:'psychology_alt',label:'AI Check', action:() => navigate('/symptom-checker') },
            { icon:'menu',          label:'Menu',     action:() => setSidebarOpen(true) },
          ].map((item, i) => (
            <div key={i} onClick={item.action} style={{ display:'flex', flexDirection:'column', alignItems:'center', cursor:'pointer', padding:'4px 14px', borderRadius:9999, background:item.active ? '#dae2ff' : 'transparent', color:item.active ? '#001848' : '#434654' }}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings:item.active ? "'FILL' 1" : "'FILL' 0", fontSize:22 }}>{item.icon}</span>
              <span style={{ fontSize:11, fontWeight:600 }}>{item.label}</span>
            </div>
          ))}
        </nav>

        {/* FAB */}
        <button onClick={() => navigate('/symptom-checker')}
          style={{ position:'fixed', right:20, bottom:80, background:'#dae2ff', color:'#001848', width:52, height:52, borderRadius:'50%', boxShadow:'0 4px 16px rgba(0,0,0,0.2)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', zIndex:40 }}>
          <span className="material-symbols-outlined" style={{ fontSize:26, fontVariationSettings:"'FILL' 1" }}>chat_bubble</span>
        </button>
      </div>
    </>
  );
};

export default SearchPage;