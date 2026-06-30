import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
 
const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showGoogleSoon, setShowGoogleSoon] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
 
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await API.post('/auth/login', form);
      login(res.data.user, res.data.token);
      navigate(res.data.user.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };
 
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
    }}>
      <div style={{
        background: 'white', borderRadius: '16px', padding: '2.5rem',
        width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', margin: 0 }}>🏥</h1>
          <h2 style={{ color: '#1e3a5f', margin: '0.5rem 0 0' }}>Welcome Back</h2>
          <p style={{ color: '#6b7280', margin: '0.5rem 0 0' }}>Login to your account</p>
        </div>
 
        {/* Error */}
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center', fontSize: '14px' }}>
            {error}
          </div>
        )}
 
        {/* Google Button - Dummy/Coming Soon */}
        <button
          type="button"
          onClick={() => setShowGoogleSoon(true)}
          style={{
            width: '100%', padding: '0.75rem', borderRadius: '8px',
            border: '1px solid #d1d5db', background: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '10px', cursor: 'pointer', marginBottom: showGoogleSoon ? '0.75rem' : '1.5rem',
            fontSize: '15px', fontWeight: '500', color: '#374151',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)', transition: 'all 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.background = '#f9fafb'}
          onMouseOut={e => e.currentTarget.style.background = 'white'}>
          {/* Google Icon SVG */}
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continue with Google
        </button>
 
        {/* Coming Soon Message */}
        {showGoogleSoon && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
            padding: '0.6rem', borderRadius: '8px', marginBottom: '1.5rem',
            textAlign: 'center', fontSize: '13px', fontWeight: '600'
          }}>
            Google login coming soon!
          </div>
        )}
 
        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
          <span style={{ color: '#9ca3af', fontSize: '13px' }}>or continue with email</span>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
        </div>
 
        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500', fontSize: '14px' }}>
              Email
            </label>
            <input
              type="email" name="email" value={form.email}
              onChange={handleChange} placeholder="rahul@gmail.com" required
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '15px', boxSizing: 'border-box', outline: 'none', transition: 'border 0.2s' }}
              onFocus={e => e.target.style.borderColor = '#2563eb'}
              onBlur={e => e.target.style.borderColor = '#d1d5db'}
            />
          </div>
 
          {/* Password with show/hide */}
          <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500', fontSize: '14px' }}>
              Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password" value={form.password}
              onChange={handleChange} placeholder="••••••••" required
              style={{ width: '100%', padding: '0.75rem', paddingRight: '3rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '15px', boxSizing: 'border-box', outline: 'none', transition: 'border 0.2s' }}
              onFocus={e => e.target.style.borderColor = '#2563eb'}
              onBlur={e => e.target.style.borderColor = '#d1d5db'}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: '12px', top: '38px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '4px', color: '#6b7280' }}>
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
 
          <button type="submit" disabled={loading}
            style={{ width: '100%', background: loading ? '#93c5fd' : '#2563eb', color: 'white', border: 'none', padding: '0.875rem', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
 
        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#6b7280', fontSize: '14px' }}>
          Don't have an account?{' '}
          <span onClick={() => navigate('/register')} style={{ color: '#2563eb', cursor: 'pointer', fontWeight: '600' }}>
            Register here
          </span>
        </p>
        <p style={{ textAlign: 'center', marginTop: '0.5rem' }}>
          <span onClick={() => navigate('/')} style={{ color: '#6b7280', cursor: 'pointer', fontSize: '13px' }}>
            ← Back to Home
          </span>
        </p>
      </div>
    </div>
  );
};
 
export default LoginPage;