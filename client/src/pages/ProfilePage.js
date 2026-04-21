import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [stats, setStats] = useState({});
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  useEffect(() => {
    axios.get('/users/profile').then(r => { setForm(r.data); }).catch(console.error);
    axios.get('/dashboard/stats').then(r => setStats(r.data.stats || {})).catch(console.error);
  }, []);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const saveProfile = async () => {
    setSaving(true); setSaved(false);
    try {
      const res = await axios.put('/users/profile', form);
      setUser(u => ({ ...u, ...res.data }));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  const changePassword = async () => {
    setPwError(''); setPwSuccess('');
    if (pwForm.new_password !== pwForm.confirm) { setPwError('Passwords do not match.'); return; }
    if (pwForm.new_password.length < 6) { setPwError('Password must be at least 6 characters.'); return; }
    try {
      await axios.put('/users/change-password', { current_password: pwForm.current_password, new_password: pwForm.new_password });
      setPwSuccess('Password changed successfully!');
      setPwForm({ current_password: '', new_password: '', confirm: '' });
    } catch (err) { setPwError(err.response?.data?.error || 'Failed to change password.'); }
  };

  return (
    <div className="page-wrapper">
      <div className="animate-fade-up">
        <div className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>
          <span className="text-cyan">// </span>user_profile.json
        </div>
        <h1 className="page-title">Profile</h1>
      </div>

      <div className="profile-layout mt-3">
        {/* Sidebar */}
        <div className="profile-sidebar animate-fade-up">
          <div className="profile-avatar-big">
            {form.full_name ? form.full_name[0].toUpperCase() : user?.username?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="profile-username">{form.full_name || user?.username}</div>
          <div className="profile-role">{form.target_role || 'Software Engineer'}</div>
          <div className="profile-stat-grid">
            <div className="profile-stat">
              <div className="profile-stat-val">{stats.total_problems_solved || 0}</div>
              <div className="profile-stat-lbl">Solved</div>
            </div>
            <div className="profile-stat">
              <div className="profile-stat-val">{stats.total_interviews || 0}</div>
              <div className="profile-stat-lbl">Interviews</div>
            </div>
            <div className="profile-stat">
              <div className="profile-stat-val text-orange">{stats.current_streak || 0}d</div>
              <div className="profile-stat-lbl">Streak</div>
            </div>
            <div className="profile-stat">
              <div className="profile-stat-val text-green">
                {stats.avg_interview_score ? Number(stats.avg_interview_score).toFixed(1) : '—'}
              </div>
              <div className="profile-stat-lbl">Avg Score</div>
            </div>
          </div>
          {form.github_url && (
            <a href={form.github_url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm w-full mt-2" style={{ justifyContent: 'center' }}>
              GitHub →
            </a>
          )}
          {form.linkedin_url && (
            <a href={form.linkedin_url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm w-full mt-1" style={{ justifyContent: 'center' }}>
              LinkedIn →
            </a>
          )}
        </div>

        {/* Edit form */}
        <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Personal Info */}
          <div className="card">
            <div className="flex-between mb-3">
              <h3 style={{ fontSize: '1rem' }}>Personal Information</h3>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {saved && <span className="text-green" style={{ fontSize: '0.8rem' }}>✓ Saved!</span>}
                <button className="btn btn-primary btn-sm" onClick={saveProfile} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label>Full Name</label>
                <input name="full_name" value={form.full_name || ''} onChange={handleChange} placeholder="John Doe" />
              </div>
              <div className="form-group">
                <label>Username</label>
                <input value={user?.username || ''} disabled style={{ opacity: 0.5 }} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input value={user?.email || ''} disabled style={{ opacity: 0.5 }} />
              </div>
              <div className="form-group">
                <label>Target Role</label>
                <input name="target_role" value={form.target_role || ''} onChange={handleChange} placeholder="e.g. Software Engineer" />
              </div>
              <div className="form-group">
                <label>GitHub URL</label>
                <input name="github_url" value={form.github_url || ''} onChange={handleChange} placeholder="https://github.com/you" />
              </div>
              <div className="form-group">
                <label>LinkedIn URL</label>
                <input name="linkedin_url" value={form.linkedin_url || ''} onChange={handleChange} placeholder="https://linkedin.com/in/you" />
              </div>
            </div>
            <div className="form-group">
              <label>Experience Level</label>
              <select name="experience_level" value={form.experience_level || 'beginner'} onChange={handleChange}>
                <option value="beginner">Beginner (0–1 years)</option>
                <option value="intermediate">Intermediate (1–3 years)</option>
                <option value="advanced">Advanced (3+ years)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Bio</label>
              <textarea name="bio" value={form.bio || ''} onChange={handleChange} rows={3} placeholder="Brief bio about yourself..." />
            </div>
          </div>

          {/* Change Password */}
          <div className="card">
            <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>Change Password</h3>
            {pwError   && <div className="auth-error mb-2"><span>✗</span> {pwError}</div>}
            {pwSuccess && <div style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)', color: 'var(--accent-green)', padding: '0.6rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.875rem' }}>✓ {pwSuccess}</div>}
            <div className="form-group">
              <label>Current Password</label>
              <input type="password" value={pwForm.current_password} onChange={e => setPwForm(p => ({ ...p, current_password: e.target.value }))} placeholder="••••••••" />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label>New Password</label>
                <input type="password" value={pwForm.new_password} onChange={e => setPwForm(p => ({ ...p, new_password: e.target.value }))} placeholder="Min 6 characters" />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input type="password" value={pwForm.confirm} onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} placeholder="Repeat new password" />
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={changePassword}>Update Password</button>
          </div>
        </div>
      </div>
    </div>
  );
}
