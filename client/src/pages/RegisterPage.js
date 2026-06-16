import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';

const RegisterPage = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'patient'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
      const res = await API.post('/auth/register', form);
      login(res.data.user, res.data.token);
      if (res.data.user.role === 'doctor') {
        navigate('/doctor/dashboard');
      } else {
        navigate('/patient/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '2.5rem',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', margin: 0 }}>🏥</h1>
          <h2 style={{ color: '#1e3a5f', margin: '0.5rem 0 0' }}>
            Create Account
          </h2>
          <p style={{ color: '#6b7280', margin: '0.5rem 0 0' }}>
            Join MediLocal today
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '0.75rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* Role Toggle */}
        <div style={{
          display: 'flex',
          background: '#f3f4f6',
          borderRadius: '8px',
          padding: '4px',
          marginBottom: '1.5rem'
        }}>
          {['patient', 'doctor'].map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setForm({ ...form, role })}
              style={{
                flex: 1,
                padding: '0.5rem',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500',
                background: form.role === role ? '#2563eb' : 'transparent',
                color: form.role === role ? 'white' : '#6b7280',
                transition: 'all 0.2s'
              }}>
              {role === 'patient' ? '🙋 Patient' : '👨‍⚕️ Doctor'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {[
            { label: 'Full Name', name: 'name', type: 'text', placeholder: 'Rahul Sharma' },
            { label: 'Email', name: 'email', type: 'email', placeholder: 'rahul@gmail.com' },
            { label: 'Phone', name: 'phone', type: 'tel', placeholder: '9876543210' },
            { label: 'Password', name: 'password', type: 'password', placeholder: '••••••••' },
          ].map((field) => (
            <div key={field.name} style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#374151',
                fontWeight: '500'
              }}>
                {field.label}
              </label>
              <input
                type={field.type}
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? '#93c5fd' : '#2563eb',
              color: 'white',
              border: 'none',
              padding: '0.875rem',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '0.5rem'
            }}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        {/* Login link */}
        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#6b7280' }}>
          Already have an account?{' '}
          <span
            onClick={() => navigate('/login')}
            style={{ color: '#2563eb', cursor: 'pointer', fontWeight: '500' }}>
            Login here
          </span>
        </p>

        <p style={{ textAlign: 'center', marginTop: '0.5rem' }}>
          <span
            onClick={() => navigate('/')}
            style={{ color: '#6b7280', cursor: 'pointer', fontSize: '0.9rem' }}>
            ← Back to Home
          </span>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;