import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './DSAPracticePage.css';

const DIFFICULTIES = ['', 'Easy', 'Medium', 'Hard'];
const CATEGORIES = ['', 'Arrays', 'Strings', 'Linked Lists', 'Trees', 'Graphs', 'Dynamic Programming', 'Sliding Window', 'Sorting', 'Heaps', 'Backtracking'];

const statusIcon = (s) => s === 'solved' ? <span className="text-green">✓</span> : s === 'attempted' ? <span className="text-orange">~</span> : <span className="text-muted">○</span>;

export default function DSAPracticePage() {
  const [problems, setProblems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ difficulty: '', category: '', search: '' });

  const fetchProblems = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20, ...filters };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const res = await axios.get('/dsa/problems', { params });
      setProblems(res.data.problems);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { fetchProblems(); }, [fetchProblems]);

  const setFilter = (k, v) => { setFilters(p => ({ ...p, [k]: v })); setPage(1); };

  return (
    <div className="page-wrapper">
      <div className="dsa-header animate-fade-up">
        <div>
          <div className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>
            <span className="text-cyan">{'// '}</span>practice_problems.js
          </div>
          <h1 className="page-title">DSA Practice</h1>
          <p className="text-secondary" style={{ fontSize: '0.875rem' }}>
            {total} problems · Solve daily to build mastery
          </p>
        </div>
        <div className="dsa-stats">
          {['Easy', 'Medium', 'Hard'].map(d => (
            <div key={d} className={`dsa-stat diff-${d.toLowerCase()}`}>
              <span>{d}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="dsa-filters card animate-fade-up mt-2">
        <div className="filter-search">
          <span className="filter-search-icon">⌕</span>
          <input
            type="text"
            placeholder="Search problems..."
            value={filters.search}
            onChange={e => setFilter('search', e.target.value)}
            className="filter-input"
          />
        </div>
        <div className="filter-selects">
          <select value={filters.difficulty} onChange={e => setFilter('difficulty', e.target.value)} className="filter-select">
            {DIFFICULTIES.map(d => <option key={d} value={d}>{d || 'All Difficulties'}</option>)}
          </select>
          <select value={filters.category} onChange={e => setFilter('category', e.target.value)} className="filter-select">
            {CATEGORIES.map(c => <option key={c} value={c}>{c || 'All Categories'}</option>)}
          </select>
          {(filters.difficulty || filters.category || filters.search) && (
            <button className="btn btn-ghost btn-sm" onClick={() => { setFilters({ difficulty: '', category: '', search: '' }); setPage(1); }}>
              Clear filters ✕
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="dsa-table-wrap card mt-2 animate-fade-up">
        <div className="terminal-header">
          <div className="terminal-dot dot-red" />
          <div className="terminal-dot dot-yellow" />
          <div className="terminal-dot dot-green" />
          <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            problems.db — {total} entries
          </span>
        </div>
        {loading ? (
          <div className="loading-center" style={{ minHeight: 200 }}>
            <div className="spinner" /><span>Fetching problems...</span>
          </div>
        ) : problems.length === 0 ? (
          <div className="dash-empty" style={{ padding: '3rem' }}>
            <span>{ }</span><p>No problems found for these filters.</p>
          </div>
        ) : (
          <table className="dsa-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>Status</th>
                <th>#</th>
                <th>Title</th>
                <th>Category</th>
                <th>Difficulty</th>
                <th>Acceptance</th>
                <th>Companies</th>
              </tr>
            </thead>
            <tbody>
              {problems.map((p, i) => (
                <tr key={p.id} className="dsa-row" style={{ animationDelay: `${i * 0.02}s` }}>
                  <td className="text-center">{statusIcon(p.status)}</td>
                  <td className="text-muted" style={{ fontSize: '0.8rem' }}>{p.id}</td>
                  <td>
                    <Link to={`/dsa/${p.slug}`} className="problem-link">
                      {p.title}
                      {p.is_bookmarked && <span className="text-yellow" style={{ marginLeft: 6 }}>★</span>}
                    </Link>
                    <div className="problem-tags">
                      {(p.tags || []).slice(0, 3).map(t => (
                        <span key={t} className="problem-tag">{t}</span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>{p.category}</span>
                  </td>
                  <td>
                    <span className={`diff-${p.difficulty?.toLowerCase()}`} style={{ fontWeight: 600 }}>
                      {p.difficulty}
                    </span>
                  </td>
                  <td className="text-muted" style={{ fontSize: '0.85rem' }}>
                    {p.acceptance_rate ? `${p.acceptance_rate}%` : '—'}
                  </td>
                  <td>
                    <div className="company-logos">
                      {(p.companies || []).slice(0, 3).map(c => (
                        <span key={c} className="company-chip">{c[0]}</span>
                      ))}
                      {(p.companies?.length || 0) > 3 && (
                        <span className="company-chip">+{p.companies.length - 3}</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="dsa-pagination">
          <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span className="text-muted" style={{ fontSize: '0.875rem' }}>Page {page} of {totalPages}</span>
          <button className="btn btn-ghost btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
}
