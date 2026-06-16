import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';

const SymptomChecker = () => {
  const [symptoms, setSymptoms] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [activeNav, setActiveNav] = useState('ai');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const quickSymptoms = [
    'Fever & Chills', 'Chest Pain', 'Headache', 'Cough & Cold',
    'Stomach Pain', 'Back Pain', 'Skin Rash', 'Eye Problems',
  ];

  const navItems = [
    { key: 'appointments', icon: 'calendar_today',  label: 'My Appointments',    action: () => navigate('/patient/dashboard') },
    { key: 'ai',           icon: 'smart_toy',        label: 'AI Symptom Checker', action: () => setActiveNav('ai'), fill: true },
    { key: 'queue',        icon: 'hourglass_empty',  label: 'Live Queue',         action: () => { setActiveNav('queue'); alert('Live Queue coming soon!'); } },
    { key: 'records',      icon: 'description',      label: 'Medical Records',    action: () => navigate('/patient/dashboard') },
    { key: 'help',         icon: 'help_outline',     label: 'Help Center',        action: () => window.open('mailto:support@MediLocal.com', '_blank') },
  ];

  const handleCheck = async () => {
    if (!symptoms.trim()) return;
    if (!user) return navigate('/login');
    setLoading(true);
    setResult(null);
    try {
      const res = await API.post('/ai/symptoms', { symptoms });
      const newResult = { symptoms, advice: res.data.advice, time: new Date().toLocaleTimeString() };
      setResult(newResult);
      setHistory(prev => [newResult, ...prev].slice(0, 5));
    } catch (err) {
      setResult({ symptoms, advice: err.response?.data?.message || 'AI service unavailable. Please try again.', error: true });
    }
    setLoading(false);
  };

  const handleQuickSymptom = (s) => setSymptoms(prev => prev ? `${prev}, ${s}` : s);

  const urgencyColor = (advice) => {
    if (!advice) return null;
    const lower = advice.toLowerCase();
    if (lower.includes('high') || lower.includes('emergency') || lower.includes('urgent'))
      return { bg: '#fef2f2', border: '#fecaca', color: '#ba1a1a', label: 'High Urgency', icon: 'emergency' };
    if (lower.includes('medium') || lower.includes('moderate'))
      return { bg: '#fefce8', border: '#fde68a', color: '#ca8a04', label: 'Medium Urgency', icon: 'warning' };
    return { bg: '#f0fdf4', border: '#86efac', color: '#006c47', label: 'Low Urgency', icon: 'check_circle' };
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:'Public Sans',sans-serif; background:#f9f9ff; }
        .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; font-family:'Material Symbols Outlined'; font-size:24px; line-height:1; display:inline-block; vertical-align:middle; }
        .nav-item:hover { background:#dfe8ff; }
        .chip:hover { border-color:#003d9b !important; background:#eff6ff !important; color:#003d9b !important; }
        .send-btn:hover { background:#0052cc !important; }
        @keyframes spin { to{transform:rotate(360deg)} }
        .spin { animation:spin 1s linear infinite; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .fade-in { animation:fadeIn 0.4s ease; }
        @keyframes pulse-ring { 0%{transform:scale(.95);box-shadow:0 0 0 0 rgba(0,61,155,.4)} 70%{transform:scale(1);box-shadow:0 0 0 8px rgba(0,61,155,0)} 100%{transform:scale(.95)} }
        .pulse-ring { animation:pulse-ring 2s infinite; }
        textarea:focus { outline:none; border-color:#003d9b !important; box-shadow:0 0 0 3px rgba(0,61,155,0.1); }
        .hist-card:hover { background:#f0f3ff !important; border-color:#003d9b !important; }
        @keyframes slideIn { from{transform:translateX(-100%)} to{transform:translateX(0)} }

        /* Sidebar */
        .sidebar { width:256px; height:100vh; position:fixed; left:0; top:0; z-index:50; background:#f0f3ff; border-right:1px solid #c3c6d6; display:flex; flex-direction:column; padding:16px; gap:8px; transition:transform 0.25s ease; overflow-y:auto; }
        .sidebar-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.4); z-index:49; }
        .sidebar-overlay.open { display:block; }
        .hamburger { display:none; padding:8px; border-radius:8px; border:none; background:transparent; cursor:pointer; }
        .main-content { margin-left:256px; }

        /* Two-column layout */
        .checker-grid { display:grid; grid-template-columns:1fr 340px; gap:24px; align-items:start; }
        .right-panel { display:flex; flex-direction:column; gap:16px; position:sticky; top:80px; }

        @media (max-width:768px) {
          .sidebar { transform:translateX(-100%); }
          .sidebar.open { transform:translateX(0); animation:slideIn 0.25s ease; }
          .sidebar-overlay.open { display:block; }
          .hamburger { display:flex !important; align-items:center; justify-content:center; color:#003d9b; }
          .main-content { margin-left:0 !important; }

          /* Stack grid on mobile */
          .checker-grid { grid-template-columns:1fr !important; }

          /* Right panel goes below on mobile */
          .right-panel { position:static !important; order:2; }
          .left-col { order:1; }

          /* Hide history on mobile to save space */
          .history-panel { display:none !important; }

          /* Emergency + Book stays visible */
          .emergency-panel { display:block !important; }
          .book-btn-panel { display:block !important; }

          /* How it works — 2 col on mobile */
          .how-steps { gap:12px !important; }
          .how-step { flex-direction:row !important; gap:12px !important; }
          .step-num { width:28px !important; height:28px !important; font-size:12px !important; flex-shrink:0; }

          /* Chips wrap */
          .chips-wrap { gap:6px !important; }
          .chip { padding:6px 12px !important; font-size:13px !important; }

          /* Page padding */
          .page-pad { padding:16px !important; }
          .header-pad { padding:0 12px !important; }

          /* Hero banner */
          .hero-banner { padding:20px !important; }
          .hero-title { font-size:20px !important; }
          .hero-sub { font-size:14px !important; }
          .hero-tags { flex-wrap:wrap !important; gap:6px !important; }

          /* Textarea smaller on mobile */
          .symptom-textarea { rows:3; }

          /* Result card */
          .result-actions { flex-direction:column !important; }
          .result-actions button { width:100% !important; }
        }

        @media (max-width:480px) {
          .checker-grid { gap:12px !important; }
        }
      `}</style>

      <div style={{ display:'flex', background:'#f9f9ff', minHeight:'100vh', fontFamily:"'Public Sans',sans-serif" }}>

        {/* Sidebar Overlay */}
        <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

        {/* ── SIDEBAR ── */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
            <h1 style={{ fontSize:18, fontWeight:700, color:'#003d9b', cursor:'pointer' }} onClick={() => navigate('/')}>MediLocal</h1>
            <button onClick={() => setSidebarOpen(false)} style={{ padding:6, borderRadius:'50%', border:'none', background:'#dae2ff', cursor:'pointer', display:'flex' }}>
              <span className="material-symbols-outlined" style={{ fontSize:18, color:'#003d9b' }}>close</span>
            </button>
          </div>

          {/* User */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:16, marginBottom:16, textAlign:'center' }}>
            <div style={{ width:60, height:60, borderRadius:'50%', background:'#dae2ff', border:'2px solid #003d9b', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:10 }}>
              <span className="material-symbols-outlined" style={{ fontSize:32, color:'#003d9b', fontVariationSettings:"'FILL' 1" }}>person</span>
            </div>
            <p style={{ fontSize:13, fontWeight:600, color:'#091c35' }}>Welcome, {user?.name?.split(' ')[0] || 'Patient'}</p>
            <p style={{ fontSize:11, color:'#434654' }}>Tier 2 Healthcare Portal</p>
          </div>

          {/* Nav */}
          <nav style={{ flex:1, display:'flex', flexDirection:'column', gap:4 }}>
            {navItems.map(item => (
              <div key={item.key} className="nav-item"
                onClick={() => { setActiveNav(item.key); item.action(); setSidebarOpen(false); }}
                style={{ display:'flex', alignItems:'center', gap:14, padding:'11px 14px', borderRadius:8, cursor:'pointer', transition:'all 0.15s', background:activeNav===item.key?'#82f9be':'transparent', color:activeNav===item.key?'#00734c':'#434654', fontWeight:activeNav===item.key?700:400 }}>
                <span className="material-symbols-outlined" style={{ fontSize:20, fontVariationSettings:activeNav===item.key?"'FILL' 1":"'FILL' 0" }}>{item.icon}</span>
                <span style={{ fontSize:13, fontWeight:600 }}>{item.label}</span>
              </div>
            ))}
          </nav>

          {/* Bottom */}
          <div style={{ paddingTop:14, borderTop:'1px solid #c3c6d6', display:'flex', flexDirection:'column', gap:8 }}>
            <button onClick={() => { navigate('/search'); setSidebarOpen(false); }}
              style={{ width:'100%', background:'#003d9b', color:'white', padding:'11px 14px', borderRadius:10, border:'none', fontWeight:700, fontSize:13, cursor:'pointer', marginBottom:6 }}>
              Book New Visit
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
              <span className="material-symbols-outlined" style={{ color:'#003d9b', fontSize:26, fontVariationSettings:"'FILL' 1" }}>smart_toy</span>
              <span style={{ fontSize:18, fontWeight:700, color:'#003d9b' }}>AI Symptom Checker</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <button onClick={() => alert('Check your appointments dashboard!')}
                style={{ position:'relative', padding:8, borderRadius:'50%', border:'none', background:'transparent', cursor:'pointer', display:'flex' }}>
                <span className="material-symbols-outlined" style={{ color:'#434654' }}>notifications</span>
                <span style={{ position:'absolute', top:4, right:4, width:8, height:8, background:'#ba1a1a', borderRadius:'50%' }} />
              </button>
              <div style={{ width:32, height:32, borderRadius:'50%', background:'#dae2ff', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <span className="material-symbols-outlined" style={{ color:'#003d9b', fontSize:18 }}>person</span>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="page-pad" style={{ padding:'24px 48px', maxWidth:1200, margin:'0 auto' }}>
            <div className="checker-grid">

              {/* ── LEFT: Main Checker ── */}
              <div className="left-col" style={{ display:'flex', flexDirection:'column', gap:20 }}>

                {/* Hero Banner */}
                <div className="hero-banner" style={{ background:'linear-gradient(135deg,#003d9b,#0052cc)', borderRadius:14, padding:28, color:'white', position:'relative', overflow:'hidden' }}>
                  <div style={{ position:'absolute', top:-30, right:-30, width:180, height:180, background:'rgba(255,255,255,0.05)', borderRadius:'50%' }} />
                  <div style={{ position:'relative', zIndex:10 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
                      <div className="pulse-ring" style={{ width:44, height:44, borderRadius:'50%', background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <span className="material-symbols-outlined" style={{ fontSize:24, color:'white', fontVariationSettings:"'FILL' 1" }}>smart_toy</span>
                      </div>
                      <div>
                        <p style={{ fontSize:11, opacity:0.8, textTransform:'uppercase', letterSpacing:'0.08em' }}>Powered by Groq AI</p>
                        <h2 className="hero-title" style={{ fontSize:22, fontWeight:700 }}>Tell me your symptoms</h2>
                      </div>
                    </div>
                    <p className="hero-sub" style={{ opacity:0.9, fontSize:15, lineHeight:'22px', maxWidth:480, marginBottom:14 }}>
                      Describe what you're feeling and our AI will suggest the right specialist — available 24/7, completely free.
                    </p>
                    <div className="hero-tags" style={{ display:'flex', gap:8 }}>
                      {['Free to use','Available 24/7','Not a diagnosis'].map(tag => (
                        <span key={tag} style={{ background:'rgba(255,255,255,0.15)', padding:'3px 10px', borderRadius:9999, fontSize:11, fontWeight:600 }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quick Chips */}
                <div style={{ background:'white', border:'1px solid #c3c6d6', borderRadius:12, padding:16 }}>
                  <p style={{ fontSize:11, color:'#434654', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10, fontWeight:600 }}>Quick Select Symptoms</p>
                  <div className="chips-wrap" style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                    {quickSymptoms.map(s => (
                      <button key={s} className="chip" onClick={() => handleQuickSymptom(s)}
                        style={{ padding:'7px 14px', borderRadius:9999, border:'1px solid #c3c6d6', background:'white', color:'#434654', fontSize:13, fontWeight:500, cursor:'pointer', transition:'all 0.15s' }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input */}
                <div style={{ background:'white', border:'1px solid #c3c6d6', borderRadius:12, padding:16 }}>
                  <p style={{ fontSize:14, fontWeight:600, color:'#091c35', marginBottom:10 }}>Describe your symptoms in detail</p>
                  <textarea className="symptom-textarea" value={symptoms} onChange={e => setSymptoms(e.target.value)}
                    onKeyDown={e => { if (e.key==='Enter' && e.ctrlKey) handleCheck(); }}
                    placeholder="e.g. I have chest pain on the left side for 2 days, shortness of breath and mild dizziness..."
                    rows={4}
                    style={{ width:'100%', padding:'12px', border:'1px solid #c3c6d6', borderRadius:8, fontSize:14, fontFamily:'inherit', resize:'vertical', lineHeight:'22px', color:'#091c35', transition:'all 0.2s' }} />
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:10, flexWrap:'wrap', gap:8 }}>
                    <span style={{ fontSize:11, color:'#434654' }}>Ctrl+Enter to submit</span>
                    <div style={{ display:'flex', gap:8 }}>
                      {symptoms && (
                        <button onClick={() => { setSymptoms(''); setResult(null); }}
                          style={{ padding:'8px 16px', borderRadius:8, border:'1px solid #c3c6d6', background:'transparent', color:'#434654', fontWeight:600, fontSize:13, cursor:'pointer' }}>
                          Clear
                        </button>
                      )}
                      <button className="send-btn" onClick={handleCheck} disabled={loading || !symptoms.trim()}
                        style={{ padding:'8px 22px', borderRadius:8, border:'none', background:!symptoms.trim()?'#c3c6d6':'#003d9b', color:'white', fontWeight:700, fontSize:13, cursor:!symptoms.trim()?'not-allowed':'pointer', display:'flex', alignItems:'center', gap:6, transition:'all 0.2s' }}>
                        {loading ? (
                          <><span className="material-symbols-outlined spin" style={{ fontSize:16 }}>autorenew</span>Analyzing...</>
                        ) : (
                          <><span className="material-symbols-outlined" style={{ fontSize:16, fontVariationSettings:"'FILL' 1" }}>send</span>Analyze</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Loading */}
                {loading && (
                  <div className="fade-in" style={{ background:'#f0f3ff', border:'1px solid #c3c6d6', borderRadius:12, padding:28, textAlign:'center' }}>
                    <div style={{ width:56, height:56, borderRadius:'50%', background:'#dae2ff', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
                      <span className="material-symbols-outlined spin" style={{ fontSize:28, color:'#003d9b' }}>autorenew</span>
                    </div>
                    <p style={{ fontSize:16, fontWeight:600, color:'#003d9b', marginBottom:6 }}>AI is analyzing your symptoms...</p>
                    <p style={{ fontSize:13, color:'#434654' }}>This usually takes 5-10 seconds</p>
                  </div>
                )}

                {/* Result */}
                {result && !loading && (
                  <div className="fade-in" style={{ background:'white', border:`1px solid ${result.error?'#fecaca':'#c3c6d6'}`, borderRadius:12, overflow:'hidden' }}>
                    <div style={{ background:result.error?'#fef2f2':'#003d9b', padding:'14px 20px', display:'flex', alignItems:'center', gap:10 }}>
                      <span className="material-symbols-outlined" style={{ color:result.error?'#ba1a1a':'white', fontVariationSettings:"'FILL' 1" }}>
                        {result.error ? 'error' : 'smart_toy'}
                      </span>
                      <div style={{ flex:1 }}>
                        <p style={{ fontSize:13, fontWeight:700, color:result.error?'#ba1a1a':'white' }}>
                          {result.error ? 'Error' : 'AI Analysis Result'}
                        </p>
                        <p style={{ fontSize:11, color:result.error?'#ba1a1a':'rgba(255,255,255,0.8)' }}>
                          {result.error ? 'Something went wrong' : `Analyzed at ${result.time}`}
                        </p>
                      </div>
                      {!result.error && (() => { const u=urgencyColor(result.advice); return u ? (
                        <div style={{ background:'rgba(255,255,255,0.15)', padding:'3px 10px', borderRadius:9999 }}>
                          <span style={{ fontSize:11, fontWeight:700, color:'white', display:'flex', alignItems:'center', gap:5 }}>
                            <span className="material-symbols-outlined" style={{ fontSize:14, fontVariationSettings:"'FILL' 1" }}>{u.icon}</span>
                            {u.label}
                          </span>
                        </div>
                      ) : null; })()}
                    </div>

                    {!result.error && (
                      <div style={{ padding:'10px 20px', background:'#f0f3ff', borderBottom:'1px solid #c3c6d6' }}>
                        <p style={{ fontSize:12, color:'#434654' }}><span style={{ fontWeight:700 }}>Your symptoms:</span> {result.symptoms}</p>
                      </div>
                    )}

                    <div style={{ padding:20 }}>
                      <div style={{ whiteSpace:'pre-wrap', fontSize:14, color:'#091c35', lineHeight:'24px' }}>{result.advice}</div>
                    </div>

                    {!result.error && (
                      <>
                        <div style={{ margin:'0 20px 14px', padding:14, background:'#fefce8', border:'1px solid #fde68a', borderRadius:8 }}>
                          <div style={{ display:'flex', gap:8 }}>
                            <span className="material-symbols-outlined" style={{ color:'#ca8a04', fontSize:18, flexShrink:0, fontVariationSettings:"'FILL' 1" }}>warning</span>
                            <p style={{ fontSize:12, color:'#854d0e', lineHeight:'18px' }}>
                              <strong>Disclaimer:</strong> This is AI-generated information only and is NOT a medical diagnosis. Always consult a qualified doctor.
                            </p>
                          </div>
                        </div>
                        <div className="result-actions" style={{ padding:'0 20px 20px', display:'flex', gap:10 }}>
                          <button onClick={() => navigate('/search')}
                            style={{ flex:1, background:'#003d9b', color:'white', padding:'11px', borderRadius:8, border:'none', fontWeight:700, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                            <span className="material-symbols-outlined" style={{ fontSize:16 }}>search</span>
                            Find a Specialist
                          </button>
                          <button onClick={() => { setSymptoms(''); setResult(null); }}
                            style={{ flex:1, background:'white', color:'#003d9b', padding:'11px', borderRadius:8, border:'1px solid #003d9b', fontWeight:700, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                            <span className="material-symbols-outlined" style={{ fontSize:16 }}>refresh</span>
                            Check Again
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Empty state */}
                {!result && !loading && (
                  <div style={{ background:'white', border:'1px solid #c3c6d6', borderRadius:12, padding:'3rem', textAlign:'center' }}>
                    <div style={{ width:72, height:72, borderRadius:'50%', background:'#f0f3ff', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize:36, color:'#003d9b', fontVariationSettings:"'FILL' 1" }}>smart_toy</span>
                    </div>
                    <h3 style={{ fontSize:18, fontWeight:600, color:'#091c35', marginBottom:8 }}>Describe your symptoms above</h3>
                    <p style={{ color:'#434654', fontSize:14, lineHeight:'22px', maxWidth:380, margin:'0 auto' }}>
                      Our AI will suggest which specialist to visit, urgency level, and basic care tips.
                    </p>
                  </div>
                )}
              </div>

              {/* ── RIGHT: Info Panel ── */}
              <div className="right-panel">

                {/* How it works */}
                <div style={{ background:'white', border:'1px solid #c3c6d6', borderRadius:12, padding:18 }}>
                  <h3 style={{ fontSize:15, fontWeight:700, color:'#091c35', marginBottom:14 }}>How it works</h3>
                  <div className="how-steps" style={{ display:'flex', flexDirection:'column', gap:14 }}>
                    {[
                      { icon:'edit_note',        step:'1', title:'Describe symptoms',   desc:'Type or tap chips to add symptoms' },
                      { icon:'smart_toy',        step:'2', title:'AI analyzes',          desc:'Groq AI matches with medical knowledge' },
                      { icon:'medical_services', step:'3', title:'Get recommendation',  desc:'Find which specialist to visit' },
                      { icon:'calendar_month',   step:'4', title:'Book appointment',    desc:'Book with the right doctor nearby' },
                    ].map((item, i) => (
                      <div key={i} className="how-step" style={{ display:'flex', flexDirection:'column', gap:6 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div className="step-num" style={{ width:26, height:26, borderRadius:'50%', background:'#003d9b', color:'white', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:11, fontWeight:700 }}>
                            {item.step}
                          </div>
                          <p style={{ fontSize:13, fontWeight:700, color:'#091c35' }}>{item.title}</p>
                        </div>
                        <p style={{ fontSize:12, color:'#434654', lineHeight:'17px', paddingLeft:36 }}>{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* History */}
                {history.length > 0 && (
                  <div className="history-panel" style={{ background:'white', border:'1px solid #c3c6d6', borderRadius:12, padding:18 }}>
                    <h3 style={{ fontSize:15, fontWeight:700, color:'#091c35', marginBottom:10 }}>Recent Checks</h3>
                    <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                      {history.map((h, i) => (
                        <div key={i} className="hist-card" onClick={() => { setSymptoms(h.symptoms); setResult(h); }}
                          style={{ padding:10, background:'#f9f9ff', border:'1px solid #c3c6d6', borderRadius:8, cursor:'pointer', transition:'all 0.15s' }}>
                          <p style={{ fontSize:12, fontWeight:600, color:'#091c35', marginBottom:3, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{h.symptoms}</p>
                          <p style={{ fontSize:11, color:'#434654' }}>{h.time}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Emergency */}
                <div className="emergency-panel" style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:12, padding:16 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                    <span className="material-symbols-outlined" style={{ color:'#ba1a1a', fontVariationSettings:"'FILL' 1", fontSize:20 }}>emergency</span>
                    <p style={{ fontSize:13, fontWeight:700, color:'#ba1a1a' }}>Medical Emergency?</p>
                  </div>
                  <p style={{ fontSize:12, color:'#7f1d1d', lineHeight:'17px', marginBottom:10 }}>
                    If experiencing severe symptoms, don't wait. Call emergency services immediately.
                  </p>
                  <button style={{ width:'100%', background:'#ba1a1a', color:'white', padding:'10px', borderRadius:8, border:'none', fontWeight:700, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}>
                    <span className="material-symbols-outlined" style={{ fontSize:16 }}>call</span>
                    Call 112
                  </button>
                </div>

                {/* Quick Book */}
                <button className="book-btn-panel" onClick={() => navigate('/search')}
                  style={{ width:'100%', background:'#006c47', color:'white', padding:'13px', borderRadius:10, border:'none', fontWeight:700, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                  <span className="material-symbols-outlined" style={{ fontSize:18, fontVariationSettings:"'FILL' 1" }}>calendar_month</span>
                  Book Appointment Directly
                </button>
              </div>

            </div>
          </div>
        </main>

        {/* ── MOBILE BOTTOM NAV ── */}
        <nav style={{ position:'fixed', bottom:0, width:'100%', zIndex:50, display:'flex', justifyContent:'space-around', alignItems:'center', padding:'8px 16px', background:'#f9f9ff', borderTop:'1px solid #c3c6d6', boxShadow:'0 -2px 8px rgba(0,0,0,0.06)', borderRadius:'12px 12px 0 0' }}>
          {[
            { icon:'home',          label:'Home',    action:() => navigate('/') },
            { icon:'map',           label:'Nearby',  action:() => navigate('/search') },
            { icon:'psychology_alt',label:'AI Check',action:() => {}, active:true },
            { icon:'menu',          label:'Menu',    action:() => setSidebarOpen(true) },
          ].map((item, i) => (
            <div key={i} onClick={item.action} style={{ display:'flex', flexDirection:'column', alignItems:'center', cursor:'pointer', padding:'4px 14px', borderRadius:9999, background:item.active?'#dae2ff':'transparent', color:item.active?'#001848':'#434654', transform:item.active?'translateY(-4px)':'none' }}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings:item.active?"'FILL' 1":"'FILL' 0", fontSize:22 }}>{item.icon}</span>
              <span style={{ fontSize:11, fontWeight:600 }}>{item.label}</span>
            </div>
          ))}
        </nav>

      </div>
    </>
  );
};

export default SymptomChecker;