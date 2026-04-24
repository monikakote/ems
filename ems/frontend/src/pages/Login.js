import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';

export default function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      const endpoint = isSignup ? '/auth/signup' : '/auth/login';
      const { data } = await API.post(endpoint, form);
      login(data.token, data.admin);
      toast.success(isSignup ? 'Account created!' : 'Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 30% 20%, #0d1829 0%, #0a0d14 60%)',
      position: 'relative', overflow: 'hidden'
    }}>
      {/* Background glow */}
      <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(79,142,247,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-100px', right: '-100px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(124,77,255,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '420px', padding: '0 20px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, #4f8ef7, #7c4dff)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', margin: '0 auto 16px' }}>⚡</div>
          <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#e8edf8' }}>SmartEMS</h1>
          <p style={{ color: '#5a6a8a', fontSize: '13px', marginTop: '4px' }}>Employee Management System</p>
        </div>

        {/* Card */}
        <div style={{ background: '#13182299', border: '1px solid #1e2a42', borderRadius: '16px', padding: '32px', backdropFilter: 'blur(12px)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '6px' }}>
            {isSignup ? 'Create Admin Account' : 'Welcome back'}
          </h2>
          <p style={{ color: '#5a6a8a', fontSize: '13px', marginBottom: '24px' }}>
            {isSignup ? 'Set up your administrator account' : 'Sign in to your admin dashboard'}
          </p>

          <form onSubmit={handleSubmit}>
            {isSignup && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" type="text" placeholder="John Doe" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" placeholder="admin@company.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="••••••••" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '8px' }} disabled={loading}>
              {loading ? '⏳ Please wait...' : isSignup ? '🚀 Create Account' : '🔑 Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#5a6a8a' }}>
            {isSignup ? 'Already have an account? ' : "Don't have an account? "}
            <button onClick={() => setIsSignup(!isSignup)} style={{ background: 'none', border: 'none', color: '#4f8ef7', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
              {isSignup ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
