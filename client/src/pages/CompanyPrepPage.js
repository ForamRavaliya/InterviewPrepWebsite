import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './CompanyPrepPage.css';

export default function CompanyPrepPage() {
  const [companies, setCompanies] = useState([]);
  const [selected, setSelected] = useState(null);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    axios.get('/companies').then(r => setCompanies(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const selectCompany = async (company) => {
    setSelected(company);
    setProblems([]);
    try {
      const res = await axios.get(`/companies/${company.id}/problems`);
      setProblems(res.data);
    } catch (err) { console.error(err); }
  };

  const filtered = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.industry || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-wrapper">
      <div className="animate-fade-up">
        <div className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>
          <span className="text-cyan">// </span>company_prep.db
        </div>
        <h1 className="page-title">Company Prep</h1>
        <p className="text-secondary" style={{ fontSize: '0.875rem' }}>Explore company-specific interview questions & patterns</p>
      </div>

      <div className="company-layout mt-3">
        {/* Company List */}
        <div className="company-list-panel">
          <div className="company-search">
            <input
              type="text"
              placeholder="Search companies..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {loading ? (
            <div className="loading-center" style={{ minHeight: 200 }}><div className="spinner" /></div>
          ) : (
            <div className="company-list">
              {filtered.map(c => (
                <div
                  key={c.id}
                  className={`company-item ${selected?.id === c.id ? 'active' : ''}`}
                  onClick={() => selectCompany(c)}
                >
                  <div className="company-avatar">{c.name[0]}</div>
                  <div className="company-info">
                    <div className="company-name">{c.name}</div>
                    <div className="company-meta">
                      <span className="text-muted" style={{ fontSize: '0.72rem' }}>{c.industry}</span>
                      <span className={`diff-${c.difficulty?.toLowerCase()}`} style={{ fontSize: '0.72rem' }}>{c.difficulty}</span>
                    </div>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && <div className="text-muted" style={{ padding: '1rem', fontSize: '0.875rem' }}>No companies found.</div>}
            </div>
          )}
        </div>

        {/* Company Detail */}
        <div className="company-detail">
          {!selected ? (
            <div className="company-placeholder">
              <div className="placeholder-icon">◎</div>
              <h3>Select a Company</h3>
              <p className="text-muted">Choose a company to see their interview patterns, common questions, and curated problem sets.</p>
            </div>
          ) : (
            <div className="animate-fade-up">
              <div className="company-detail-header">
                <div className="company-avatar-lg">{selected.name[0]}</div>
                <div>
                  <h2>{selected.name}</h2>
                  <div className="flex gap-1 mt-1">
                    {selected.industry && <span className="badge badge-cyan">{selected.industry}</span>}
                    {selected.size && <span className="badge badge-cyan">{selected.size}</span>}
                    {selected.difficulty && <span className={`badge badge-${selected.difficulty.toLowerCase()}`}>{selected.difficulty}</span>}
                  </div>
                  {selected.description && <p className="text-secondary mt-2" style={{ fontSize: '0.875rem' }}>{selected.description}</p>}
                </div>
              </div>

              <div className="company-tags mt-2">
                {(selected.tags || []).map(t => <span key={t} className="company-tag-pill">{t}</span>)}
              </div>

              <div className="mt-3">
                <h3 className="setup-label mb-2">Frequently Asked Problems</h3>
                {problems.length === 0 ? (
                  <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    No curated problems for {selected.name} yet.
                  </div>
                ) : (
                  <div className="company-problems">
                    {problems.map(p => (
                      <a key={p.id} href={`/dsa/${p.slug}`} className="company-problem-row card">
                        <div className="flex-between">
                          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.title}</span>
                          <div className="flex gap-1">
                            <span className="badge badge-cyan">{p.category}</span>
                            <span className={`diff-${p.difficulty?.toLowerCase()}`} style={{ fontWeight: 600, fontSize: '0.85rem' }}>{p.difficulty}</span>
                          </div>
                        </div>
                        {p.acceptance_rate && (
                          <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                            Acceptance: {p.acceptance_rate}%
                          </div>
                        )}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
