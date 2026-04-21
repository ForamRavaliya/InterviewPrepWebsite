import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
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
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo">
            <span className="text-cyan">&lt;</span>IP<span className="text-cyan">/&gt;</span>
          </div>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-sub">Sign in to continue your prep journey</p>
        </div>

        {/* Terminal-style decoration */}
        <div className="auth-terminal">
          <span className="text-muted">$</span>
          <span className="text-green"> ./authenticate</span>
          <span className="auth-cursor" />
        </div>

        {error && (
          <div className="auth-error">
            <span>✗</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
            {loading ? <><div className="spinner" style={{width:18,height:18,borderWidth:2}} /> Authenticating...</> : '→ Sign In'}
          </button>
        </form>

        <p className="auth-footer-text">
          No account?{' '}
          <Link to="/register">Create one →</Link>
        </p>
      </div>
    </div>
  );
}
