import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';

const statusColors = {
  pending:   { bg: '#fefce8', color: '#ca8a04', label: 'Pending' },
  confirmed: { bg: '#f0fdf4', color: '#006c47', label: 'Confirmed' },
  completed: { bg: '#eff6ff', color: '#003d9b', label: 'Completed' },
  cancelled: { bg: '#fef2f2', color: '#ba1a1a', label: 'Cancelled' },
};

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('appointments');
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '', specialty: '', clinicName: '', address: '',
    city: '', fee: '', experience: '', timings: '9:00 AM - 5:00 PM',
    languages: 'Hindi, English',
    location: { type: 'Point', coordinates: [73.8567, 18.5204] }
  });
  const [saving, setSaving] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // eslint-disable-next-line
  useEffect(() => {
    if (!user) return navigate('/login');
    if (user.role !== 'doctor') return navigate('/patient/dashboard');
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [aptsRes, allDoctors] = await Promise.all([
        API.get('/appointments/doctor'),
        API.get('/doctors')
      ]);
      setAppointments(aptsRes.data.appointments || []);
      const myProfile = allDoctors.data.doctors?.find(d => d.userId?._id === user.id || d.userId === user.id);
      if (myProfile) {
        setProfile(myProfile);
        setProfileForm({
          name: myProfile.name || '',
          specialty: myProfile.specialty || '',
          clinicName: myProfile.clinicName || '',
          address: myProfile.address || '',
          city: myProfile.city || '',
          fee: myProfile.fee || '',
          experience: myProfile.experience || '',
          timings: myProfile.timings || '9:00 AM - 5:00 PM',
          languages: myProfile.languages?.join(', ') || 'Hindi, English',
          location: myProfile.location || { type: 'Point', coordinates: [73.8567, 18.5204] }
        });
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await API.put(`/appointments/status/${id}`, { status });
      fetchData();
    } catch (err) { alert(err.response?.data?.message || 'Update failed'); }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const payload = {
        ...profileForm,
        fee: Number(profileForm.fee),
        experience: Number(profileForm.experience),
        languages: profileForm.languages.split(',').map(l => l.trim()),
      };
      if (profile) {
        await API.put('/doctors/profile', payload);
      } else {
        await API.post('/doctors/profile', payload);
      }
      setShowProfileForm(false);
      fetchData();
    } catch (err) { alert(err.response?.data?.message || 'Save failed'); }
    setSaving(false);
  };

  const today = new Date().toISOString().split('T')[0];
  const todayApts = appointments.filter(a => a.date === today);
  const filtered = activeFilter === 'all' ? appointments : appointments.filter(a => a.status === activeFilter);
  const pendingCount = appointments.filter(a => a.status === 'pending').length;

  const stats = [
    { label: "Today's Apts", value: todayApts.length,    icon: 'today',         color: '#003d9b' },
    { label: 'Total',        value: appointments.length,  icon: 'calendar_month',color: '#006c47' },
    { label: 'Pending',      value: pendingCount,         icon: 'pending',       color: '#ca8a04' },
    { label: 'Completed',    value: appointments.filter(a => a.status==='completed').length, icon:'check_circle', color:'#003d9b' },
  ];

  const navItems = [
    { key: 'appointments', icon: 'calendar_today',  label: 'Appointments' },
    { key: 'profile',      icon: 'badge',           label: 'My Profile' },
    { key: 'queue',        icon: 'hourglass_empty', label: 'Queue Manager' },
    { key: 'analytics',   icon: 'bar_chart',        label: 'Analytics' },
    { key: 'help',         icon: 'help_outline',    label: 'Help Center' },
  ];

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:'Public Sans',sans-serif; background:#f9f9ff; }
        .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; font-family:'Material Symbols Outlined'; font-size:24px; line-height:1; display:inline-block; vertical-align:middle; }
        .nav-item:hover { background:#dfe8ff; }
        .apt-row:hover { background:#f0f3ff; }
        .status-btn:hover { opacity:.85; }
        input:focus,select:focus,textarea:focus { outline:none; border-color:#003d9b !important; box-shadow:0 0 0 3px rgba(0,61,155,0.1); }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .fade-in { animation:fadeIn 0.3s ease; }
        .pulse-dot { animation:pulse-a 2s infinite; }
        @keyframes pulse-a { 0%{transform:scale(.95);box-shadow:0 0 0 0 rgba(0,108,71,.7)} 70%{transform:scale(1);box-shadow:0 0 0 6px rgba(0,108,71,0)} 100%{transform:scale(.95)} }
        @keyframes slideIn { from{transform:translateX(-100%)} to{transform:translateX(0)} }

        /* Sidebar */
        .sidebar { width:256px; height:100vh; position:fixed; left:0; top:0; z-index:50; background:#f0f3ff; border-right:1px solid #c3c6d6; display:flex; flex-direction:column; padding:16px; gap:8px; transition:transform 0.25s ease; overflow-y:auto; }
        .sidebar-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.4); z-index:49; }
        .sidebar-overlay.open { display:block; }
        .hamburger { display:none; padding:8px; border-radius:8px; border:none; background:transparent; cursor:pointer; }
        .main-content { margin-left:256px; }

        /* Main grid */
        .main-grid { display:grid; grid-template-columns:1fr 320px; gap:24px; }
        .stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:24px; }
        .filter-chips { display:flex; gap:8px; flex-wrap:wrap; }

        @media (max-width:768px) {
          .sidebar { transform:translateX(-100%); }
          .sidebar.open { transform:translateX(0); animation:slideIn 0.25s ease; }
          .sidebar-overlay.open { display:block; }
          .hamburger { display:flex !important; align-items:center; justify-content:center; color:#003d9b; }
          .main-content { margin-left:0 !important; }

          .main-grid { grid-template-columns:1fr !important; }
          .right-col { order:1; }
          .left-col { order:2; }

          .stats-grid { grid-template-columns:repeat(2,1fr) !important; gap:10px !important; margin-bottom:16px !important; }

          /* Table — make it card-based on mobile */
          .apt-table { display:none !important; }
          .apt-cards { display:flex !important; flex-direction:column; gap:12px; }

          .page-pad { padding:16px !important; }
          .header-pad { padding:0 12px !important; }

          /* Today schedule compact */
          .today-apts { max-height:200px; overflow-y:auto; }

          /* Profile card compact */
          .profile-items { gap:7px !important; }

          /* Warning banner */
          .warning-banner { flex-direction:column !important; }
          .warning-banner button { width:100% !important; }

          /* Profile form grid 1 col */
          .profile-form-grid { grid-template-columns:1fr !important; }

          h2.welcome-text { font-size:22px !important; }
        }

        @media (max-width:480px) {
          .stats-grid { grid-template-columns:repeat(2,1fr) !important; }
          .filter-chips { gap:6px !important; }
          .filter-chip { padding:5px 12px !important; font-size:11px !important; }
        }
      `}</style>

      <div style={{ display:'flex', background:'#f9f9ff', minHeight:'100vh', fontFamily:"'Public Sans',sans-serif" }}>

        {/* Sidebar overlay */}
        <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

        {/* ── SIDEBAR ── */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
            <div>
              <h1 style={{ fontSize:18, fontWeight:700, color:'#003d9b', cursor:'pointer' }} onClick={() => navigate('/')}>MediLocal</h1>
              <span style={{ fontSize:10, background:'#82f9be', color:'#006c47', padding:'2px 7px', borderRadius:9999, fontWeight:700 }}>Doctor Portal</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} style={{ padding:6, borderRadius:'50%', border:'none', background:'#dae2ff', cursor:'pointer', display:'flex' }}>
              <span className="material-symbols-outlined" style={{ fontSize:18, color:'#003d9b' }}>close</span>
            </button>
          </div>

          {/* Doctor Avatar */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:14, marginBottom:14, textAlign:'center' }}>
            <div style={{ width:60, height:60, borderRadius:'50%', background:'#dae2ff', border:'2px solid #003d9b', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:10 }}>
              <span className="material-symbols-outlined" style={{ fontSize:32, color:'#003d9b', fontVariationSettings:"'FILL' 1" }}>person</span>
            </div>
            <p style={{ fontSize:13, fontWeight:600, color:'#091c35' }}>{user?.name}</p>
            <p style={{ fontSize:11, color:'#434654' }}>{profile?.specialty || 'Doctor'}</p>
            <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:5 }}>
              <span className="pulse-dot" style={{ width:7, height:7, background:'#006c47', borderRadius:'50%', display:'inline-block' }} />
              <span style={{ fontSize:11, color:'#006c47', fontWeight:600 }}>Available</span>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex:1, display:'flex', flexDirection:'column', gap:4 }}>
            {navItems.map(item => (
              <div key={item.key} className="nav-item"
                onClick={() => { setActiveNav(item.key); setSidebarOpen(false); }}
                style={{ display:'flex', alignItems:'center', gap:14, padding:'11px 14px', borderRadius:8, cursor:'pointer', transition:'all 0.15s', background:activeNav===item.key?'#82f9be':'transparent', color:activeNav===item.key?'#00734c':'#434654', fontWeight:activeNav===item.key?700:400 }}>
                <span className="material-symbols-outlined" style={{ fontSize:20, fontVariationSettings:activeNav===item.key?"'FILL' 1":"'FILL' 0" }}>{item.icon}</span>
                <span style={{ fontSize:13, fontWeight:600 }}>{item.label}</span>
              </div>
            ))}
          </nav>

          {/* Bottom */}
          <div style={{ paddingTop:14, borderTop:'1px solid #c3c6d6', display:'flex', flexDirection:'column', gap:8 }}>
            <button onClick={() => { setShowProfileForm(true); setSidebarOpen(false); }}
              style={{ width:'100%', background:'#003d9b', color:'white', padding:'11px 14px', borderRadius:10, border:'none', fontWeight:700, fontSize:13, cursor:'pointer', marginBottom:6 }}>
              {profile ? 'Edit Profile' : '+ Create Profile'}
            </button>
            <div className="nav-item" style={{ display:'flex', alignItems:'center', gap:14, padding:'10px 14px', borderRadius:8, cursor:'pointer', color:'#434654' }}>
              <span className="material-symbols-outlined" style={{ fontSize:20 }}>settings</span>
              <span style={{ fontSize:13, fontWeight:600 }}>Settings</span>
            </div>
            <div className="nav-item" onClick={() => { logout(); navigate('/'); }}
              style={{ display:'flex', alignItems:'center', gap:14, padding:'10px 14px', borderRadius:8, cursor:'pointer', color:'#434654' }}>
              <span className="material-symbols-outlined" style={{ fontSize:20 }}>logout</span>
              <span style={{ fontSize:13, fontWeight:600 }}>Logout</span>
            </div>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="main-content" style={{ flex:1, minHeight:'100vh', paddingBottom:80 }}>

          {/* Top Bar */}
          <header className="header-pad" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 48px', background:'#f9f9ff', borderBottom:'1px solid #c3c6d6', position:'sticky', top:0, zIndex:30 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              {/* Hamburger */}
              <button className="hamburger" onClick={() => setSidebarOpen(true)}>
                <span className="material-symbols-outlined">menu</span>
              </button>
              <div style={{ display:'flex', alignItems:'center', background:'#f0f3ff', borderRadius:9999, padding:'6px 14px', border:'1px solid #c3c6d6', gap:8 }}>
                <span className="material-symbols-outlined" style={{ color:'#737685', fontSize:18 }}>search</span>
                <input placeholder="Search appointments..." style={{ background:'transparent', border:'none', outline:'none', fontSize:14, width:200, color:'#091c35' }} />
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ position:'relative', padding:8, borderRadius:'50%', cursor:'pointer', background:'#f0f3ff', border:'1px solid #c3c6d6', display:'flex' }}>
                <span className="material-symbols-outlined" style={{ color:'#003d9b' }}>notifications</span>
                {pendingCount > 0 && (
                  <span style={{ position:'absolute', top:2, right:2, width:18, height:18, background:'#ba1a1a', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:'white' }}>
                    {pendingCount}
                  </span>
                )}
              </div>
              <div style={{ width:34, height:34, borderRadius:'50%', background:'#dae2ff', display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid #003d9b' }}>
                <span className="material-symbols-outlined" style={{ color:'#003d9b', fontSize:18 }}>person</span>
              </div>
            </div>
          </header>

          <div className="page-pad" style={{ padding:'28px 48px', maxWidth:1200, margin:'0 auto' }}>

            {/* Welcome */}
            <section style={{ marginBottom:24 }}>
              <h2 className="welcome-text" style={{ fontSize:28, fontWeight:700, color:'#091c35', letterSpacing:'-0.02em' }}>
                Good {new Date().getHours()<12?'Morning':new Date().getHours()<17?'Afternoon':'Evening'}, Dr. {user?.name?.split(' ').slice(-1)[0]}
              </h2>
              <p style={{ fontSize:16, color:'#434654', marginTop:6 }}>
                You have <strong style={{ color:'#003d9b' }}>{todayApts.length}</strong> appointments today.
              </p>
            </section>

            {/* No Profile Warning */}
            {!profile && !loading && (
              <div className="fade-in warning-banner" style={{ background:'#fefce8', border:'1px solid #fde68a', borderRadius:12, padding:18, marginBottom:20, display:'flex', justifyContent:'space-between', alignItems:'center', gap:12 }}>
                <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                  <span className="material-symbols-outlined" style={{ color:'#ca8a04', fontVariationSettings:"'FILL' 1", flexShrink:0 }}>warning</span>
                  <div>
                    <p style={{ fontWeight:700, color:'#854d0e', fontSize:14 }}>Your clinic profile is not set up yet</p>
                    <p style={{ fontSize:12, color:'#854d0e', marginTop:2 }}>Patients can't find you without a profile!</p>
                  </div>
                </div>
                <button onClick={() => setShowProfileForm(true)} style={{ background:'#ca8a04', color:'white', padding:'9px 20px', borderRadius:8, border:'none', fontWeight:700, cursor:'pointer', fontSize:13, flexShrink:0 }}>
                  Create Profile
                </button>
              </div>
            )}

            {/* Stats */}
            <div className="stats-grid">
              {stats.map((s, i) => (
                <div key={i} style={{ background:'white', border:'1px solid #c3c6d6', borderRadius:12, padding:18, display:'flex', alignItems:'center', gap:14 }}>
                  <div style={{ width:44, height:44, borderRadius:10, background:`${s.color}15`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span className="material-symbols-outlined" style={{ color:s.color, fontVariationSettings:"'FILL' 1", fontSize:22 }}>{s.icon}</span>
                  </div>
                  <div>
                    <p style={{ fontSize:24, fontWeight:700, color:'#091c35', lineHeight:1 }}>{s.value}</p>
                    <p style={{ fontSize:11, color:'#434654', marginTop:3 }}>{s.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Main Grid */}
            <div className="main-grid">

              {/* ── LEFT: Appointments ── */}
              <div className="left-col" style={{ background:'white', border:'1px solid #c3c6d6', borderRadius:12, overflow:'hidden' }}>
                <div style={{ padding:'18px 20px', borderBottom:'1px solid #c3c6d6', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
                  <h3 style={{ fontSize:18, fontWeight:600, color:'#091c35' }}>All Appointments</h3>
                  <div className="filter-chips">
                    {['all','pending','confirmed','completed','cancelled'].map(f => (
                      <button key={f} className="filter-chip" onClick={() => setActiveFilter(f)}
                        style={{ padding:'5px 14px', borderRadius:9999, border:'1px solid #c3c6d6', background:activeFilter===f?'#003d9b':'#e7eeff', color:activeFilter===f?'white':'#434654', fontWeight:600, fontSize:12, cursor:'pointer', textTransform:'capitalize', transition:'all 0.15s', flexShrink:0 }}>
                        {f==='all'?`All (${appointments.length})`:`${f} (${appointments.filter(a=>a.status===f).length})`}
                      </button>
                    ))}
                  </div>
                </div>

                {loading ? (
                  <div style={{ textAlign:'center', padding:'3rem', color:'#434654' }}>Loading...</div>
                ) : filtered.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'3rem', color:'#434654' }}>
                    <span className="material-symbols-outlined" style={{ fontSize:44, color:'#c3c6d6', display:'block', marginBottom:10 }}>calendar_today</span>
                    <p>No {activeFilter==='all'?'':activeFilter} appointments</p>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table */}
                    <div className="apt-table" style={{ overflowX:'auto' }}>
                      <table style={{ width:'100%', borderCollapse:'collapse', minWidth:500 }}>
                        <thead>
                          <tr style={{ background:'#f0f3ff' }}>
                            {['Patient','Date & Time','Symptoms','Status','Actions'].map((h,i) => (
                              <th key={i} style={{ padding:'11px 14px', textAlign:'left', fontSize:11, color:'#434654', textTransform:'uppercase', letterSpacing:'0.08em', fontWeight:600, borderBottom:'1px solid #c3c6d6' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.map((apt, i) => (
                            <tr key={apt._id} className="apt-row" style={{ borderBottom:i<filtered.length-1?'1px solid #c3c6d6':'none', transition:'background 0.15s' }}>
                              <td style={{ padding:'14px' }}>
                                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                  <div style={{ width:36, height:36, borderRadius:'50%', background:'#dae2ff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                    <span className="material-symbols-outlined" style={{ fontSize:18, color:'#003d9b', fontVariationSettings:"'FILL' 1" }}>person</span>
                                  </div>
                                  <div>
                                    <p style={{ fontSize:13, fontWeight:600, color:'#091c35' }}>{apt.patientId?.name || 'Patient'}</p>
                                    <p style={{ fontSize:11, color:'#434654' }}>{apt.patientId?.phone || ''}</p>
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding:'14px' }}>
                                <p style={{ fontSize:13, fontWeight:600, color:'#003d9b' }}>{apt.date}</p>
                                <p style={{ fontSize:11, color:'#434654' }}>{apt.slot}</p>
                              </td>
                              <td style={{ padding:'14px', maxWidth:160 }}>
                                <p style={{ fontSize:12, color:'#434654', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{apt.symptoms || '—'}</p>
                              </td>
                              <td style={{ padding:'14px' }}>
                                <span style={{ background:statusColors[apt.status]?.bg, color:statusColors[apt.status]?.color, padding:'3px 10px', borderRadius:9999, fontSize:11, fontWeight:700 }}>
                                  {statusColors[apt.status]?.label}
                                </span>
                              </td>
                              <td style={{ padding:'14px' }}>
                                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                                  {apt.status==='pending' && (
                                    <>
                                      <button className="status-btn" onClick={() => handleStatusUpdate(apt._id,'confirmed')}
                                        style={{ padding:'5px 10px', borderRadius:6, border:'none', background:'#006c47', color:'white', fontSize:11, fontWeight:700, cursor:'pointer' }}>Confirm</button>
                                      <button className="status-btn" onClick={() => handleStatusUpdate(apt._id,'cancelled')}
                                        style={{ padding:'5px 10px', borderRadius:6, border:'1px solid #fecaca', background:'#fef2f2', color:'#ba1a1a', fontSize:11, fontWeight:700, cursor:'pointer' }}>Reject</button>
                                    </>
                                  )}
                                  {apt.status==='confirmed' && (
                                    <button className="status-btn" onClick={() => handleStatusUpdate(apt._id,'completed')}
                                      style={{ padding:'5px 10px', borderRadius:6, border:'none', background:'#003d9b', color:'white', fontSize:11, fontWeight:700, cursor:'pointer' }}>Mark Done</button>
                                  )}
                                  {(apt.status==='completed'||apt.status==='cancelled') && (
                                    <span style={{ fontSize:11, color:'#c3c6d6' }}>—</span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="apt-cards" style={{ display:'none', padding:14 }}>
                      {filtered.map(apt => (
                        <div key={apt._id} style={{ border:'1px solid #c3c6d6', borderRadius:10, padding:14, background:'white' }}>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                              <div style={{ width:36, height:36, borderRadius:'50%', background:'#dae2ff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                <span className="material-symbols-outlined" style={{ fontSize:18, color:'#003d9b', fontVariationSettings:"'FILL' 1" }}>person</span>
                              </div>
                              <div>
                                <p style={{ fontSize:14, fontWeight:600, color:'#091c35' }}>{apt.patientId?.name || 'Patient'}</p>
                                <p style={{ fontSize:12, color:'#434654' }}>{apt.patientId?.phone || ''}</p>
                              </div>
                            </div>
                            <span style={{ background:statusColors[apt.status]?.bg, color:statusColors[apt.status]?.color, padding:'3px 9px', borderRadius:9999, fontSize:11, fontWeight:700, flexShrink:0 }}>
                              {statusColors[apt.status]?.label}
                            </span>
                          </div>
                          <div style={{ display:'flex', gap:16, marginBottom:10 }}>
                            <div>
                              <p style={{ fontSize:11, color:'#434654' }}>Date</p>
                              <p style={{ fontSize:13, fontWeight:600, color:'#003d9b' }}>{apt.date}</p>
                            </div>
                            <div>
                              <p style={{ fontSize:11, color:'#434654' }}>Time</p>
                              <p style={{ fontSize:13, fontWeight:600, color:'#003d9b' }}>{apt.slot}</p>
                            </div>
                          </div>
                          {apt.symptoms && (
                            <p style={{ fontSize:12, color:'#434654', marginBottom:10, background:'#f0f3ff', padding:'6px 10px', borderRadius:6 }}>💬 {apt.symptoms}</p>
                          )}
                          <div style={{ display:'flex', gap:8 }}>
                            {apt.status==='pending' && (
                              <>
                                <button onClick={() => handleStatusUpdate(apt._id,'confirmed')}
                                  style={{ flex:1, padding:'8px', borderRadius:8, border:'none', background:'#006c47', color:'white', fontSize:13, fontWeight:700, cursor:'pointer' }}>✓ Confirm</button>
                                <button onClick={() => handleStatusUpdate(apt._id,'cancelled')}
                                  style={{ flex:1, padding:'8px', borderRadius:8, border:'1px solid #fecaca', background:'#fef2f2', color:'#ba1a1a', fontSize:13, fontWeight:700, cursor:'pointer' }}>✕ Reject</button>
                              </>
                            )}
                            {apt.status==='confirmed' && (
                              <button onClick={() => handleStatusUpdate(apt._id,'completed')}
                                style={{ flex:1, padding:'8px', borderRadius:8, border:'none', background:'#003d9b', color:'white', fontSize:13, fontWeight:700, cursor:'pointer' }}>Mark Done</button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* ── RIGHT: Today + Profile + Stats ── */}
              <div className="right-col" style={{ display:'flex', flexDirection:'column', gap:16 }}>

                {/* Today's Schedule */}
                <div style={{ background:'#003d9b', borderRadius:12, padding:20, color:'white' }}>
                  <h3 style={{ fontSize:16, fontWeight:700, marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
                    <span className="material-symbols-outlined" style={{ fontSize:20, fontVariationSettings:"'FILL' 1" }}>today</span>
                    Today's Schedule
                  </h3>
                  {todayApts.length === 0 ? (
                    <p style={{ opacity:0.7, fontSize:13 }}>No appointments today</p>
                  ) : (
                    <div className="today-apts" style={{ display:'flex', flexDirection:'column', gap:10 }}>
                      {todayApts.slice(0,4).map((apt, i) => (
                        <div key={i} style={{ background:'rgba(255,255,255,0.1)', borderRadius:8, padding:'10px 12px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                          <div>
                            <p style={{ fontSize:13, fontWeight:600 }}>{apt.patientId?.name || 'Patient'}</p>
                            <p style={{ fontSize:11, opacity:0.8 }}>{apt.slot}</p>
                          </div>
                          <span style={{ background:apt.status==='confirmed'?'#82f9be':'rgba(255,255,255,0.2)', color:apt.status==='confirmed'?'#006c47':'white', padding:'2px 8px', borderRadius:9999, fontSize:10, fontWeight:700 }}>
                            {statusColors[apt.status]?.label}
                          </span>
                        </div>
                      ))}
                      {todayApts.length > 4 && (
                        <p style={{ fontSize:11, opacity:0.7, textAlign:'center' }}>+{todayApts.length-4} more</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Profile Card */}
                {profile && (
                  <div style={{ background:'white', border:'1px solid #c3c6d6', borderRadius:12, padding:18 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                      <h3 style={{ fontSize:15, fontWeight:700, color:'#091c35' }}>Clinic Profile</h3>
                      <button onClick={() => setShowProfileForm(true)} style={{ padding:'4px 10px', borderRadius:8, border:'1px solid #c3c6d6', background:'transparent', color:'#003d9b', fontSize:11, fontWeight:700, cursor:'pointer' }}>Edit</button>
                    </div>
                    <div className="profile-items" style={{ display:'flex', flexDirection:'column', gap:9 }}>
                      {[
                        { icon:'local_hospital', label:profile.clinicName },
                        { icon:'medical_services', label:profile.specialty },
                        { icon:'location_on', label:`${profile.address}, ${profile.city}` },
                        { icon:'payments', label:`₹${profile.fee} fee` },
                        { icon:'schedule', label:profile.timings },
                        { icon:'translate', label:profile.languages?.join(', ') },
                      ].map((item, i) => (
                        <div key={i} style={{ display:'flex', alignItems:'center', gap:9 }}>
                          <span className="material-symbols-outlined" style={{ fontSize:16, color:'#003d9b' }}>{item.icon}</span>
                          <span style={{ fontSize:12, color:'#434654' }}>{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Stats */}
                <div style={{ background:'#f0fdf4', border:'1px solid #86efac', borderRadius:12, padding:18 }}>
                  <h3 style={{ fontSize:15, fontWeight:700, color:'#006c47', marginBottom:14 }}>This Week</h3>
                  {[
                    { label:'Completed', value:appointments.filter(a=>a.status==='completed').length, icon:'check_circle' },
                    { label:'Cancelled', value:appointments.filter(a=>a.status==='cancelled').length, icon:'cancel' },
                    { label:'Avg Rating', value:profile?.rating>0?profile.rating:'N/A', icon:'star' },
                  ].map((s, i) => (
                    <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:i<2?'1px solid #86efac':'none' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span className="material-symbols-outlined" style={{ fontSize:16, color:'#006c47', fontVariationSettings:"'FILL' 1" }}>{s.icon}</span>
                        <span style={{ fontSize:13, color:'#006c47', fontWeight:500 }}>{s.label}</span>
                      </div>
                      <span style={{ fontSize:18, fontWeight:700, color:'#006c47' }}>{s.value}</span>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>
        </main>

        {/* ── PROFILE FORM MODAL ── */}
        {showProfileForm && (
          <div className="fade-in" style={{ position:'fixed', inset:0, zIndex:100, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
            <div style={{ background:'white', borderRadius:14, padding:28, width:'100%', maxWidth:580, maxHeight:'90vh', overflowY:'auto', boxShadow:'0 20px 60px rgba(0,0,0,0.3)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
                <h3 style={{ fontSize:20, fontWeight:700, color:'#091c35' }}>{profile?'Edit Profile':'Create Profile'}</h3>
                <button onClick={() => setShowProfileForm(false)} style={{ padding:8, borderRadius:'50%', border:'none', background:'#f0f3ff', cursor:'pointer', display:'flex' }}>
                  <span className="material-symbols-outlined" style={{ color:'#434654' }}>close</span>
                </button>
              </div>
              <div className="profile-form-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                {[
                  { label:'Full Name',              key:'name',        placeholder:'Dr. Priya Sharma',   col:2 },
                  { label:'Specialty',              key:'specialty',   placeholder:'Cardiologist' },
                  { label:'Clinic Name',            key:'clinicName',  placeholder:'Sharma Heart Clinic' },
                  { label:'City',                   key:'city',        placeholder:'Pune' },
                  { label:'Address',                key:'address',     placeholder:'123 MG Road',         col:2 },
                  { label:'Fee (₹)',                key:'fee',         placeholder:'500',                  type:'number' },
                  { label:'Experience (years)',     key:'experience',  placeholder:'8',                    type:'number' },
                  { label:'Timings',                key:'timings',     placeholder:'9:00 AM - 6:00 PM',    col:2 },
                  { label:'Languages (comma sep)', key:'languages',   placeholder:'Hindi, English, Marathi', col:2 },
                ].map(field => (
                  <div key={field.key} style={{ gridColumn:field.col===2?'span 2':'span 1' }}>
                    <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#374151', marginBottom:5 }}>{field.label}</label>
                    <input type={field.type||'text'} value={profileForm[field.key]}
                      onChange={e => setProfileForm({ ...profileForm, [field.key]:e.target.value })}
                      placeholder={field.placeholder}
                      style={{ width:'100%', padding:'9px 12px', border:'1px solid #c3c6d6', borderRadius:8, fontSize:14, transition:'all 0.2s' }} />
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', gap:12, marginTop:22 }}>
                <button onClick={() => setShowProfileForm(false)}
                  style={{ flex:1, padding:'11px', borderRadius:10, border:'1px solid #c3c6d6', background:'transparent', color:'#434654', fontWeight:600, cursor:'pointer', fontSize:14 }}>
                  Cancel
                </button>
                <button onClick={handleSaveProfile} disabled={saving}
                  style={{ flex:1, padding:'11px', borderRadius:10, border:'none', background:saving?'#93c5fd':'#003d9b', color:'white', fontWeight:700, cursor:saving?'not-allowed':'pointer', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                  {saving?'Saving...':<><span className="material-symbols-outlined" style={{ fontSize:16 }}>save</span>{profile?'Update':'Create'} Profile</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── MOBILE BOTTOM NAV ── */}
        <nav style={{ position:'fixed', bottom:0, width:'100%', zIndex:50, display:'flex', justifyContent:'space-around', alignItems:'center', padding:'8px 16px', background:'#f9f9ff', borderTop:'1px solid #c3c6d6', boxShadow:'0 -2px 8px rgba(0,0,0,0.06)', borderRadius:'12px 12px 0 0' }}>
          {[
            { icon:'home',          label:'Home',     action:() => navigate('/') },
            { icon:'calendar_today',label:'Schedule', action:() => setActiveNav('appointments'), active:activeNav==='appointments' },
            { icon:'badge',         label:'Profile',  action:() => setShowProfileForm(true) },
            { icon:'menu',          label:'Menu',     action:() => setSidebarOpen(true) },
          ].map((item, i) => (
            <div key={i} onClick={item.action} style={{ display:'flex', flexDirection:'column', alignItems:'center', cursor:'pointer', padding:'4px 14px', borderRadius:9999, background:item.active?'#dae2ff':'transparent', color:item.active?'#001848':'#434654' }}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings:item.active?"'FILL' 1":"'FILL' 0", fontSize:22 }}>{item.icon}</span>
              <span style={{ fontSize:11, fontWeight:600 }}>{item.label}</span>
            </div>
          ))}
        </nav>

      </div>
    </>
  );
};

export default DoctorDashboard;