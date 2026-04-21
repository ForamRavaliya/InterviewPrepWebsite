import React, { useEffect, useState } from 'react';
import axios from 'axios';

const EMPTY_RESUME = {
  personal: { name: '', email: '', phone: '', location: '', linkedin: '', github: '', summary: '' },
  experience: [],
  education: [],
  skills: { languages: [], frameworks: [], tools: [], databases: [] },
  projects: [],
};

export default function ResumeBuilderPage() {
  const [resumes, setResumes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [content, setContent] = useState(EMPTY_RESUME);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => { axios.get('/resume').then(r => setResumes(r.data)).catch(console.error); }, []);

  const loadResume = async (r) => {
    setSelected(r);
    const detail = await axios.get(`/resume/${r.id}`);
    setContent(detail.data.content || EMPTY_RESUME);
  };

  const createNew = async () => {
    setCreating(true);
    try {
      const res = await axios.post('/resume', { title: 'New Resume', content: EMPTY_RESUME });
      setResumes(prev => [res.data, ...prev]);
      setSelected(res.data);
      setContent(EMPTY_RESUME);
    } catch (err) { console.error(err); }
    setCreating(false);
  };

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await axios.put(`/resume/${selected.id}`, { content });
      setResumes(prev => prev.map(r => r.id === selected.id ? { ...r, updated_at: new Date() } : r));
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  const updateField = (section, field, value) =>
    setContent(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));

  return (
    <div className="page-wrapper">
      <div className="animate-fade-up flex-between">
        <div>
          <div className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>
            <span className="text-cyan">// </span>resume_builder.tool
          </div>
          <h1 className="page-title">Resume Builder</h1>
          <p className="text-secondary" style={{ fontSize: '0.875rem' }}>Create ATS-optimized resumes for your target roles</p>
        </div>
      </div>

      <div className="resume-layout mt-3">
        {/* Sidebar */}
        <div className="resume-sidebar">
          <button className="btn btn-primary w-full" onClick={createNew} disabled={creating}>
            {creating ? 'Creating...' : '+ New Resume'}
          </button>
          <div className="resume-list">
            {resumes.map(r => (
              <div key={r.id} className={`resume-card-item ${selected?.id === r.id ? 'active' : ''}`} onClick={() => loadResume(r)}>
                <div className="resume-card-title">▤ {r.title}</div>
                <div className="resume-card-meta">
                  {r.ats_score ? `ATS Score: ${r.ats_score}% · ` : ''}
                  {new Date(r.updated_at).toLocaleDateString()}
                </div>
              </div>
            ))}
            {resumes.length === 0 && <div className="text-muted" style={{ fontSize: '0.8rem', padding: '0.5rem' }}>No resumes yet. Create one!</div>}
          </div>
        </div>

        {/* Editor */}
        <div className="resume-editor">
          {!selected ? (
            <div className="resume-placeholder">
              <span style={{ fontSize: '3rem', opacity: 0.3 }}>▤</span>
              <h3 style={{ color: 'var(--text-secondary)' }}>Select or Create a Resume</h3>
              <p style={{ fontSize: '0.875rem' }}>Build ATS-friendly resumes with guided sections</p>
            </div>
          ) : (
            <>
              <div className="flex-between mb-3">
                <h2 style={{ fontSize: '1.1rem' }}>{selected.title}</h2>
                <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>
                  {saving ? 'Saving...' : '✓ Save Resume'}
                </button>
              </div>

              {/* Personal Info */}
              <div className="resume-section">
                <div className="resume-section-title">Personal Information</div>
                <div className="grid-2">
                  {[['name','Full Name'],['email','Email'],['phone','Phone'],['location','Location'],['linkedin','LinkedIn URL'],['github','GitHub URL']].map(([k, label]) => (
                    <div key={k} className="form-group" style={{ marginBottom: '0.75rem' }}>
                      <label>{label}</label>
                      <input type="text" value={content.personal?.[k] || ''} onChange={e => updateField('personal', k, e.target.value)} placeholder={label} />
                    </div>
                  ))}
                </div>
                <div className="form-group">
                  <label>Professional Summary</label>
                  <textarea value={content.personal?.summary || ''} onChange={e => updateField('personal', 'summary', e.target.value)} rows={4} placeholder="Brief professional summary highlighting your experience and goals..." />
                </div>
              </div>

              {/* Skills */}
              <div className="resume-section">
                <div className="resume-section-title">Technical Skills</div>
                <div className="grid-2">
                  {[['languages','Programming Languages'],['frameworks','Frameworks & Libraries'],['tools','Tools & Platforms'],['databases','Databases']].map(([k, label]) => (
                    <div key={k} className="form-group" style={{ marginBottom: '0.75rem' }}>
                      <label>{label}</label>
                      <input
                        type="text"
                        value={(content.skills?.[k] || []).join(', ')}
                        onChange={e => setContent(prev => ({ ...prev, skills: { ...prev.skills, [k]: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } }))}
                        placeholder="Comma-separated list"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="card" style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Experience, Education & Projects sections — extend with add/remove item functionality per your needs.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
