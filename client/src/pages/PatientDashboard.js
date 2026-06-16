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

const PatientDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('appointments');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    name: '', type: 'Lab Result', issuedBy: '', file: null
  });
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const openNearbyDoctors = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          window.open(`https://www.google.com/maps/search/doctors+hospitals+near+me/@${latitude},${longitude},14z`, '_blank');
        },
        () => window.open('https://www.google.com/maps/search/doctors+near+me', '_blank')
      );
    } else {
      window.open('https://www.google.com/maps/search/doctors+near+me', '_blank');
    }
  };

  // eslint-disable-next-line
  useEffect(() => {
    if (!user) return navigate('/login');
    fetchAppointments();
    fetchRecords();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await API.get('/appointments/my');
      setAppointments(res.data.appointments || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const fetchRecords = async () => {
    try {
      const res = await API.get('/records/my');
      setRecords(res.data.records || []);
    } catch (err) { console.error(err); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await API.put(`/appointments/cancel/${id}`);
      fetchAppointments();
    } catch (err) { alert(err.response?.data?.message || 'Cancel failed'); }
  };

  const handleUpload = async () => {
    if (!uploadForm.name || !uploadForm.file) return alert('Please fill record name and select a file');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadForm.file);
      formData.append('name', uploadForm.name);
      formData.append('type', uploadForm.type);
      formData.append('issuedBy', uploadForm.issuedBy);
      await API.post('/records/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      alert('Record uploaded successfully!');
      setShowUploadModal(false);
      setUploadForm({ name: '', type: 'Lab Result', issuedBy: '', file: null });
      fetchRecords();
    } catch (err) { alert(err.response?.data?.message || 'Upload failed'); }
    setUploading(false);
  };

  const upcoming = appointments.filter(a => a.status === 'pending' || a.status === 'confirmed');
  const stats = ['pending', 'confirmed', 'completed', 'cancelled'].map(s => ({
    label: s, count: appointments.filter(a => a.status === s).length
  }));

  const navItems = [
    { key: 'appointments', icon: 'calendar_today', label: 'My Appointments', action: () => setActiveNav('appointments') },
    { key: 'ai', icon: 'smart_toy', label: 'AI Symptom Checker', action: () => navigate('/symptom-checker') },
    { key: 'queue', icon: 'hourglass_empty', label: 'Live Queue', action: () => { setActiveNav('queue'); alert('Live Queue coming soon!'); } },
    { key: 'records', icon: 'description', label: 'Medical Records', action: () => setActiveNav('records') },
    { key: 'help', icon: 'help_outline', label: 'Help Center', action: () => window.open('mailto:support@MediLocal.com', '_blank') },
  ];

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Public Sans', sans-serif; background: #f9f9ff; }
        .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; font-family:'Material Symbols Outlined'; font-size:24px; line-height:1; display:inline-block; vertical-align:middle; }
        .pulse-dot { animation: pulse-a 2s infinite; }
        @keyframes pulse-a { 0%{transform:scale(.95);box-shadow:0 0 0 0 rgba(0,108,71,.7)} 70%{transform:scale(1);box-shadow:0 0 0 6px rgba(0,108,71,0)} 100%{transform:scale(.95)} }
        .nav-item:hover { background: #dfe8ff; }
        .apt-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.1); }
        .rec-row:hover { background: #e7eeff; }
        .quick-btn:hover { opacity: 0.9; }
        .map-btn:hover { background: #dae2ff !important; }
        input:focus, select:focus { outline: none; border-color: #003d9b !important; box-shadow: 0 0 0 3px rgba(0,61,155,0.1); }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .fade-in { animation: fadeIn 0.3s ease; }
        @keyframes slideIn { from{transform:translateX(-100%)} to{transform:translateX(0)} }
        .slide-in { animation: slideIn 0.25s ease; }

        /* ── RESPONSIVE ── */
        .sidebar {
          width: 256px; height: 100vh; position: fixed; left: 0; top: 0;
          z-index: 50; background: #f0f3ff; border-right: 1px solid #c3c6d6;
          display: flex; flex-direction: column; padding: 16px; gap: 8px;
          transition: transform 0.25s ease;
        }
        .sidebar-overlay {
          display: none; position: fixed; inset: 0;
          background: rgba(0,0,0,0.4); z-index: 49;
        }
        .hamburger { display: none; }
        .main-content { margin-left: 256px; }
        .desktop-search { display: flex; }
        .bento-col-8 { grid-column: span 8; }
        .bento-col-4 { grid-column: span 4; }
        .bento-col-7 { grid-column: span 7; }
        .bento-col-5 { grid-column: span 5; }
        .bento-col-3 { grid-column: span 3; }
        .bento-col-12 { grid-column: span 12; }
        .bento-grid { display: grid; grid-template-columns: repeat(12,1fr); gap: 24px; }
        .stats-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; }
        .live-queue-inner { display: flex; align-items: center; gap: 24px; flex-wrap: wrap; }
        .quick-actions { display: flex; flex-direction: column; gap: 16px; }

        @media (max-width: 768px) {
          .sidebar { transform: translateX(-100%); }
          .sidebar.open { transform: translateX(0); }
          .sidebar-overlay.open { display: block; }
          .hamburger { display: flex !important; align-items: center; justify-content: center; padding: 8px; border-radius: 8px; border: none; background: transparent; cursor: pointer; color: #003d9b; }
          .main-content { margin-left: 0 !important; }
          .desktop-search { display: none !important; }
          .bento-grid { display: flex !important; flex-direction: column !important; gap: 16px !important; }
          .stats-row { grid-template-columns: repeat(2,1fr) !important; gap: 12px !important; }
          .live-queue-inner { flex-direction: column; align-items: flex-start; gap: 16px; }
          .quick-actions { flex-direction: row !important; }
          .page-pad { padding: 16px !important; }
          .header-pad { padding: 8px 16px !important; }
          h2.welcome { font-size: 24px !important; }
          .footer-grid { grid-template-columns: 1fr !important; }
          .records-header { flex-wrap: wrap; gap: 8px; }
          .apt-card-inner { flex-wrap: wrap; }
        }

        @media (max-width: 480px) {
          .quick-actions { flex-direction: column !important; }
          .stats-row { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>

      <div style={{ display: 'flex', background: '#f9f9ff', minHeight: '100vh', fontFamily: "'Public Sans', sans-serif" }}>

        {/* ── SIDEBAR OVERLAY (mobile) ── */}
        <div
          className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* ── SIDEBAR ── */}
        <aside className={`sidebar ${sidebarOpen ? 'open slide-in' : ''}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, padding: '0 8px' }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#003d9b' }}>MediLocal</h1>
            {/* Close button — mobile only */}
            <button
              onClick={() => setSidebarOpen(false)}
              style={{ padding: 6, borderRadius: '50%', border: 'none', background: '#dae2ff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#003d9b' }}>close</span>
            </button>
          </div>

          {/* User Avatar */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 16, marginBottom: 16, textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#dae2ff', border: '2px solid #003d9b', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 36, color: '#003d9b', fontVariationSettings: "'FILL' 1" }}>person</span>
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#091c35' }}>Welcome, {user?.name?.split(' ')[0] || 'Patient'}</p>
            <p style={{ fontSize: 12, color: '#434654' }}>Tier 2 Healthcare Portal</p>
          </div>

          {/* Nav Items */}
          <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
            {navItems.map(item => (
              <div key={item.key}
                onClick={() => { setActiveNav(item.key); item.action(); setSidebarOpen(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s', background: activeNav === item.key ? '#82f9be' : 'transparent', color: activeNav === item.key ? '#00734c' : '#434654', fontWeight: activeNav === item.key ? 700 : 400 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 22, fontVariationSettings: activeNav === item.key ? "'FILL' 1" : "'FILL' 0" }}>{item.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{item.label}</span>
              </div>
            ))}
          </nav>

          {/* Bottom Buttons */}
          <div style={{ paddingTop: 16, borderTop: '1px solid #c3c6d6', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button onClick={() => { navigate('/search'); setSidebarOpen(false); }}
              style={{ width: '100%', background: '#003d9b', color: 'white', padding: '12px 16px', borderRadius: 12, border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer', marginBottom: 4 }}>
              Book New Visit
            </button>
            <button onClick={openNearbyDoctors} className="map-btn"
              style={{ width: '100%', background: '#e7eeff', color: '#003d9b', padding: '10px 16px', borderRadius: 12, border: '1px solid #c3c6d6', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8, transition: 'background 0.2s' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>map</span>
              Find Doctors on Maps
            </button>
            <div onClick={() => { logout(); navigate('/'); }}
              style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', borderRadius: 8, cursor: 'pointer', color: '#434654' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 22 }}>logout</span>
              <span style={{ fontSize: 14, fontWeight: 600 }}>Logout</span>
            </div>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="main-content" style={{ flex: 1, minHeight: '100vh', paddingBottom: 80 }}>

          {/* ── TOP BAR ── */}
          <header className="header-pad" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 48px', background: '#f9f9ff', borderBottom: '1px solid #c3c6d6', position: 'sticky', top: 0, zIndex: 30 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

              {/* ── HAMBURGER BUTTON (mobile only) ── */}
              <button className="hamburger" onClick={() => setSidebarOpen(true)}>
                <span className="material-symbols-outlined">menu</span>
              </button>

              {/* Desktop search */}
              <div className="desktop-search" style={{ alignItems: 'center', background: '#f0f3ff', borderRadius: 9999, padding: '6px 16px', border: '1px solid #c3c6d6', gap: 8 }}>
                <span className="material-symbols-outlined" style={{ color: '#737685', fontSize: 20 }}>search</span>
                <input placeholder="Search clinics or doctors"
                  style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: 16, width: 256, color: '#091c35' }}
                  onKeyDown={e => e.key === 'Enter' && navigate('/search')} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button className="map-btn" onClick={openNearbyDoctors} title="Find nearby doctors"
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, border: '1px solid #c3c6d6', background: 'transparent', color: '#003d9b', fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'background 0.2s' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>location_on</span>
                <span style={{ display: 'none' }} className="nearby-label">Nearby</span>
                <span>Nearby</span>
              </button>

              {/* Notification bell */}
              <button onClick={() => alert(`You have ${appointments.filter(a => a.status === 'pending').length} pending appointments!`)}
                style={{ position: 'relative', padding: 8, borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer' }}>
                <span className="material-symbols-outlined" style={{ color: '#434654' }}>notifications</span>
                {appointments.filter(a => a.status === 'pending').length > 0 && (
                  <span style={{ position: 'absolute', top: 2, right: 2, width: 18, height: 18, background: '#ba1a1a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'white' }}>
                    {appointments.filter(a => a.status === 'pending').length}
                  </span>
                )}
              </button>

              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#dae2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ color: '#003d9b', fontSize: 20 }}>person</span>
              </div>
            </div>
          </header>

          {/* ── PAGE CONTENT ── */}
          <div className="page-pad" style={{ padding: '32px 48px', maxWidth: 1200, margin: '0 auto' }}>

            {/* Welcome */}
            <section style={{ marginBottom: 32 }}>
              <h2 className="welcome" style={{ fontSize: 32, fontWeight: 700, color: '#091c35', letterSpacing: '-0.02em' }}>
                Hello, {user?.name?.split(' ')[0] || 'Patient'}
              </h2>
              <p style={{ fontSize: 18, color: '#434654', marginTop: 8 }}>
                You have {upcoming.length} appointment{upcoming.length !== 1 ? 's' : ''} scheduled.
              </p>
            </section>

            {/* ── BENTO GRID ── */}
            <div className="bento-grid">

              {/* Live Queue */}
              <div className="bento-col-8" style={{ background: 'white', border: '1px solid #c3c6d6', borderRadius: 12, padding: 24 }}>
                <div className="live-queue-inner">
                  <div style={{ position: 'relative', width: 128, height: 128, flexShrink: 0 }}>
                    <svg width="128" height="128" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="64" cy="64" r="58" fill="transparent" stroke="#d6e3ff" strokeWidth="8" />
                      <circle cx="64" cy="64" r="58" fill="transparent" stroke="#006c47" strokeWidth="8" strokeDasharray="364.4" strokeDashoffset="100" strokeLinecap="round" />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 32, fontWeight: 700, color: '#006c47' }}>04</span>
                      <span style={{ fontSize: 12, color: '#434654', textTransform: 'uppercase' }}>Position</span>
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span className="pulse-dot" style={{ width: 8, height: 8, background: '#006c47', borderRadius: '50%', display: 'inline-block' }} />
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#006c47', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Live Queue Active</span>
                    </div>
                    <h3 style={{ fontSize: 20, fontWeight: 600, color: '#091c35' }}>City Care Multispeciality</h3>
                    <p style={{ color: '#434654', fontSize: 15, marginTop: 4 }}>Dr. Ananya Sharma • General Medicine</p>
                    <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
                      {[{ label: 'Est. Wait', value: '~22 Mins' }, { label: 'Ahead', value: '3 Patients' }].map(s => (
                        <div key={s.label} style={{ background: '#e7eeff', padding: '8px 16px', borderRadius: 8 }}>
                          <p style={{ fontSize: 11, color: '#434654' }}>{s.label}</p>
                          <p style={{ fontSize: 18, fontWeight: 600, color: '#003d9b' }}>{s.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button onClick={fetchAppointments}
                    style={{ background: 'white', border: '1px solid #737685', color: '#091c35', padding: '10px 24px', borderRadius: 12, fontWeight: 700, cursor: 'pointer', flexShrink: 0, alignSelf: 'flex-start' }}>
                    Refresh
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bento-col-4">
                <div className="quick-actions">
                  <button className="quick-btn" onClick={() => navigate('/search')}
                    style={{ flex: 1, background: '#003d9b', color: 'white', padding: 20, borderRadius: 12, border: 'none', cursor: 'pointer', textAlign: 'left', position: 'relative', overflow: 'hidden' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 28, marginBottom: 12, display: 'block', fontVariationSettings: "'FILL' 1" }}>add_circle</span>
                    <p style={{ fontSize: 16, fontWeight: 600 }}>Book New Appointment</p>
                    <span className="material-symbols-outlined" style={{ position: 'absolute', bottom: -16, right: -16, fontSize: 100, opacity: 0.1 }}>event</span>
                  </button>
                  <button className="quick-btn" onClick={openNearbyDoctors}
                    style={{ flex: 1, background: '#006c47', color: 'white', padding: 20, borderRadius: 12, border: 'none', cursor: 'pointer', textAlign: 'left', position: 'relative', overflow: 'hidden' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 28, marginBottom: 12, display: 'block', fontVariationSettings: "'FILL' 1" }}>map</span>
                    <p style={{ fontSize: 16, fontWeight: 600 }}>Find Doctors on Maps</p>
                    <span className="material-symbols-outlined" style={{ position: 'absolute', bottom: -16, right: -16, fontSize: 100, opacity: 0.1 }}>location_on</span>
                  </button>
                </div>
              </div>

              {/* Upcoming Appointments */}
              <div className="bento-col-7" style={{ background: 'white', border: '1px solid #c3c6d6', borderRadius: 12, padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <h3 style={{ fontSize: 20, fontWeight: 600, color: '#091c35' }}>Upcoming Appointments</h3>
                  <span style={{ color: '#003d9b', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>View All</span>
                </div>
                {loading ? (
                  <p style={{ color: '#434654', textAlign: 'center', padding: '2rem' }}>Loading...</p>
                ) : upcoming.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#434654' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#c3c6d6', display: 'block', marginBottom: 12 }}>calendar_today</span>
                    <p>No upcoming appointments</p>
                    <button onClick={() => navigate('/search')} style={{ marginTop: 16, background: '#003d9b', color: 'white', padding: '8px 24px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600 }}>Find a Doctor</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {upcoming.map(apt => (
                      <div key={apt._id} className="apt-card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, border: '1px solid #c3c6d6', borderRadius: 12, transition: 'all 0.2s', flexWrap: 'wrap' }}>
                        <div style={{ width: 48, height: 48, borderRadius: 8, background: '#dae2ff', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span className="material-symbols-outlined" style={{ color: '#003d9b', fontVariationSettings: "'FILL' 1", fontSize: 20 }}>person</span>
                        </div>
                        <div style={{ flex: 1, minWidth: 120 }}>
                          <h4 style={{ fontSize: 14, fontWeight: 600, color: '#091c35' }}>{apt.doctorId?.name}</h4>
                          <p style={{ fontSize: 12, color: '#434654' }}>{apt.doctorId?.specialty}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: '#003d9b' }}>{apt.date} • {apt.slot}</p>
                          <p style={{ fontSize: 12, fontWeight: 700, color: statusColors[apt.status]?.color }}>{statusColors[apt.status]?.label}</p>
                        </div>
                        {apt.status === 'pending' && (
                          <button onClick={() => handleCancel(apt._id)} style={{ padding: 6, borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', color: '#434654' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>cancel</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Health Insights */}
              <div className="bento-col-5" style={{ background: '#ffddb3', borderRadius: 12, padding: 24, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'relative', zIndex: 10 }}>
                  <h3 style={{ fontSize: 20, fontWeight: 600, color: '#291800', marginBottom: 16 }}>Health Insights</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                      { icon: 'vaccines', title: 'Next Vaccination Due', desc: 'Flu Shot • Due by Oct 30' },
                      { icon: 'fitness_center', title: 'Daily Goal Progress', desc: '4,230 / 6,000 steps today' },
                    ].map(item => (
                      <div key={item.title} style={{ display: 'flex', gap: 12, background: 'rgba(255,255,255,0.2)', padding: 14, borderRadius: 8 }}>
                        <span className="material-symbols-outlined" style={{ color: '#291800', flexShrink: 0 }}>{item.icon}</span>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: '#291800' }}>{item.title}</p>
                          <p style={{ fontSize: 14, color: '#291800', opacity: 0.9 }}>{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <span className="material-symbols-outlined" style={{ position: 'absolute', top: -20, right: -20, fontSize: 140, opacity: 0.1, color: '#291800' }}>favorite</span>
              </div>

              {/* Stats */}
              <div className="bento-col-12">
                <div className="stats-row">
                  {stats.map(s => (
                    <div key={s.label} style={{ background: 'white', border: '1px solid #c3c6d6', borderRadius: 12, padding: 16, textAlign: 'center' }}>
                      <p style={{ fontSize: 28, fontWeight: 700, color: '#003d9b' }}>{s.count}</p>
                      <p style={{ fontSize: 13, color: '#434654', textTransform: 'capitalize', marginTop: 4 }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Medical Records */}
              <div className="bento-col-12" style={{ background: 'white', border: '1px solid #c3c6d6', borderRadius: 12, padding: 24, overflow: 'hidden' }}>
                <div className="records-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <h3 style={{ fontSize: 20, fontWeight: 600, color: '#091c35' }}>Medical Records</h3>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ color: '#003d9b', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>See All</span>
                    <button onClick={() => setShowUploadModal(true)}
                      style={{ background: '#003d9b', color: 'white', padding: '8px 16px', borderRadius: 8, border: 'none', fontWeight: 600, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>upload_file</span>
                      Upload
                    </button>
                  </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #c3c6d6' }}>
                        {['Document', 'Type', 'Date', 'Issued By', ''].map((h, i) => (
                          <th key={i} style={{ padding: '10px 12px', textAlign: i === 4 ? 'right' : 'left', fontSize: 11, color: '#434654', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {records.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#434654' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 40, color: '#c3c6d6', display: 'block', marginBottom: 8 }}>description</span>
                            No records yet. Upload your first medical record!
                          </td>
                        </tr>
                      ) : records.map((rec, i) => (
                        <tr key={rec._id} className="rec-row" style={{ borderBottom: i < records.length - 1 ? '1px solid #c3c6d6' : 'none', transition: 'background 0.15s' }}>
                          <td style={{ padding: '14px 12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span className="material-symbols-outlined" style={{ color: '#ba1a1a', fontSize: 18 }}>picture_as_pdf</span>
                              <span style={{ fontSize: 14, color: '#091c35' }}>{rec.name}</span>
                            </div>
                          </td>
                          <td style={{ padding: '14px 12px', fontSize: 14, color: '#434654' }}>{rec.type}</td>
                          <td style={{ padding: '14px 12px', fontSize: 14, color: '#434654' }}>
                            {new Date(rec.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td style={{ padding: '14px 12px', fontSize: 14, color: '#434654' }}>{rec.issuedBy || rec.doctorId?.name || '—'}</td>
                          <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                            <a href={`http://localhost:5000${rec.fileUrl}`} target="_blank" rel="noreferrer"
                              style={{ padding: 6, borderRadius: '50%', background: '#f0f3ff', cursor: 'pointer', color: '#003d9b', display: 'inline-flex', textDecoration: 'none' }}>
                              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>download</span>
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>{/* end bento grid */}

            {/* Footer */}
            <footer className="footer-grid" style={{ marginTop: 32, paddingTop: 32, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24, borderTop: '1px solid #c3c6d6' }}>
              <div>
                <h4 style={{ fontSize: 20, fontWeight: 600, color: '#003d9b', marginBottom: 12 }}>MediLocal</h4>
                <p style={{ color: '#434654', fontSize: 14 }}>© 2026 MediLocal Healthcare.</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['About Providers', 'Verified Status FAQ', 'Privacy Policy'].map(l => (
                  <a key={l} href="#" style={{ color: '#434654', fontSize: 13, textDecoration: 'none' }}>{l}</a>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['Terms of Service', 'Contact Support'].map(l => (
                  <a key={l} href="#" style={{ color: '#434654', fontSize: 13, textDecoration: 'none' }}>{l}</a>
                ))}
              </div>
            </footer>
          </div>
        </main>

        {/* ── UPLOAD MODAL ── */}
        {showUploadModal && (
          <div className="fade-in" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <div style={{ background: 'white', borderRadius: 16, padding: 28, width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#091c35' }}>Upload Medical Record</h3>
                <button onClick={() => setShowUploadModal(false)} style={{ padding: 8, borderRadius: '50%', border: 'none', background: '#f0f3ff', cursor: 'pointer' }}>
                  <span className="material-symbols-outlined" style={{ color: '#434654' }}>close</span>
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { label: 'Record Name *', key: 'name', placeholder: 'e.g. Blood Test Report' },
                  { label: 'Issued By', key: 'issuedBy', placeholder: 'e.g. City Diagnostics, Dr. Sharma' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>{f.label}</label>
                    <input placeholder={f.placeholder} value={uploadForm[f.key]}
                      onChange={e => setUploadForm({ ...uploadForm, [f.key]: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid #c3c6d6', borderRadius: 8, fontSize: 15 }} />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Record Type *</label>
                  <select value={uploadForm.type} onChange={e => setUploadForm({ ...uploadForm, type: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #c3c6d6', borderRadius: 8, fontSize: 15 }}>
                    {['Lab Result', 'Prescription', 'Radiology', 'Vaccination', 'Other'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Upload File * (PDF or Image, max 5MB)</label>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setUploadForm({ ...uploadForm, file: e.target.files[0] })}
                    style={{ width: '100%', padding: '10px', border: '1px solid #c3c6d6', borderRadius: 8, fontSize: 14 }} />
                  {uploadForm.file && <p style={{ fontSize: 12, color: '#006c47', marginTop: 6 }}>✅ {uploadForm.file.name}</p>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                <button onClick={() => setShowUploadModal(false)}
                  style={{ flex: 1, padding: 12, borderRadius: 10, border: '1px solid #c3c6d6', background: 'transparent', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleUpload} disabled={uploading}
                  style={{ flex: 1, padding: 12, borderRadius: 10, border: 'none', background: uploading ? '#93c5fd' : '#003d9b', color: 'white', fontWeight: 700, cursor: uploading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {uploading ? 'Uploading...' : <><span className="material-symbols-outlined" style={{ fontSize: 18 }}>upload_file</span>Upload</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── MOBILE BOTTOM NAV ── */}
        <nav style={{ position: 'fixed', bottom: 0, width: '100%', zIndex: 50, display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '8px 16px', background: '#f9f9ff', borderTop: '1px solid #c3c6d6', boxShadow: '0 -2px 8px rgba(0,0,0,0.06)', borderRadius: '12px 12px 0 0' }}>
          {[
            { icon: 'home', label: 'Home', action: () => navigate('/'), active: true },
            { icon: 'map', label: 'Nearby', action: openNearbyDoctors },
            { icon: 'psychology_alt', label: 'AI Check', action: () => navigate('/symptom-checker') },
            { icon: 'menu', label: 'Menu', action: () => setSidebarOpen(true) },
          ].map((item, i) => (
            <div key={i} onClick={item.action} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', padding: '4px 16px', borderRadius: 9999, background: item.active ? '#dae2ff' : 'transparent', color: item.active ? '#001848' : '#434654' }}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: item.active ? "'FILL' 1" : "'FILL' 0" }}>{item.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 600 }}>{item.label}</span>
            </div>
          ))}
        </nav>

      </div>
    </>
  );
};

export default PatientDashboard;