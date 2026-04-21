import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', full_name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.error || 'Registration failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-grid" />
        <div className="auth-glow auth-glow-1" />
        <div className="auth-glow auth-glow-2" />
      </div>

      <div className="auth-card animate-fade-up">
        <div className="auth-header">
          <div className="auth-logo">
            <span className="text-cyan">&lt;</span>IP<span className="text-cyan">/&gt;</span>
          </div>
          <h1 className="auth-title">Create account</h1>
          <p className="auth-sub">Start your interview preparation today</p>
        </div>

        <div className="auth-terminal">
          <span className="text-muted">$</span>
          <span className="text-green"> ./register --new-user</span>
          <span className="auth-cursor" />
        </div>

        {error && <div className="auth-error"><span>✗</span> {error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" name="full_name" placeholder="John Doe" value={form.full_name} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Username *</label>
            <input type="text" name="username" placeholder="johndoe" value={form.username} onChange={handleChange} required minLength={3} />
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Password *</label>
            <input type="password" name="password" placeholder="Min 6 characters" value={form.password} onChange={handleChange} required minLength={6} />
          </div>

          <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
            {loading ? <><div className="spinner" style={{width:18,height:18,borderWidth:2}} /> Creating account...</> : '→ Create Account'}
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account? <Link to="/login">Sign in →</Link>
        </p>
      </div>
    </div>
  );
}
