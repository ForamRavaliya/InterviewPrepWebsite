import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './DashboardPage.css';

const StatCard = ({ label, value, sub, color, icon, delay }) => (
  <div className="stat-card animate-fade-up card card-glow" style={{ animationDelay: `${delay}s` }}>
    <div className="stat-icon" style={{ color }}>{icon}</div>
    <div className="stat-value" style={{ color }}>{value ?? '—'}</div>
    <div className="stat-label">{label}</div>
    {sub && <div className="stat-sub">{sub}</div>}
  </div>
);

const DiffBar = ({ easy, medium, hard }) => {
  const total = (easy || 0) + (medium || 0) + (hard || 0) || 1;
  return (
    <div className="diff-bar-wrap">
      <div className="diff-bar">
        <div className="diff-segment easy"   style={{ width: `${(easy/total)*100}%` }} />
        <div className="diff-segment medium" style={{ width: `${(medium/total)*100}%` }} />
        <div className="diff-segment hard"   style={{ width: `${(hard/total)*100}%` }} />
      </div>
      <div className="diff-legend">
        <span><span className="dot easy" />{easy||0} Easy</span>
        <span><span className="dot medium" />{medium||0} Medium</span>
        <span><span className="dot hard" />{hard||0} Hard</span>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/dashboard/stats')
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading-center">
      <div className="spinner" />
      <span>Loading dashboard...</span>
    </div>
  );

  const stats = data?.stats || {};

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="dash-header animate-fade-up">
        <div>
          <div className="dash-greeting">
            <span className="text-muted">// </span>
            <span className="text-cyan">Hello, </span>
            <span>{user?.full_name || user?.username}</span>
          </div>
          <h1 className="dash-title">Your Dashboard</h1>
          <p className="text-secondary" style={{ fontSize: '0.875rem' }}>
            {stats.current_streak > 0 ? `🔥 ${stats.current_streak}-day streak! Keep it up.` : 'Start solving to build your streak!'}
          </p>
        </div>
        <div className="dash-quick-actions">
          <Link to="/dsa"            className="btn btn-secondary btn-sm">Practice DSA</Link>
          <Link to="/mock-interview" className="btn btn-primary btn-sm">Start Interview</Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid-4 mt-3 stagger-children">
        <StatCard icon="{ }" label="Problems Solved"  value={stats.total_problems_solved} sub="All time"           color="var(--accent-cyan)"   delay={0.05} />
        <StatCard icon="◈"  label="Interviews Done"  value={stats.total_interviews}       sub="Mock sessions"      color="var(--accent-green)"  delay={0.1} />
        <StatCard icon="★"  label="Avg Score"        value={stats.avg_interview_score ? `${Number(stats.avg_interview_score).toFixed(1)}/10` : '—'} sub="Interview rating" color="var(--accent-yellow)" delay={0.15} />
        <StatCard icon="🔥" label="Current Streak"   value={`${stats.current_streak || 0}d`} sub={`Best: ${stats.longest_streak || 0}d`} color="var(--accent-orange)" delay={0.2} />
      </div>

      <div className="dash-row mt-4">
        {/* Progress breakdown */}
        <div className="card dash-progress">
          <h3 className="card-title">Problem Progress</h3>
          <div className="progress-big">
            <div className="progress-circle">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border)" strokeWidth="8" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="var(--accent-cyan)" strokeWidth="8"
                  strokeDasharray={`${Math.min((stats.total_problems_solved || 0) / 2, 100) * 2.638} 263.8`}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                  style={{ transition: 'stroke-dasharray 1s ease' }}
                />
              </svg>
              <div className="progress-center">
                <span className="progress-num">{stats.total_problems_solved || 0}</span>
                <span className="progress-den">solved</span>
              </div>
            </div>
          </div>
          <DiffBar easy={stats.easy_solved} medium={stats.medium_solved} hard={stats.hard_solved} />
        </div>

        {/* Recent Submissions */}
        <div className="card dash-recent">
          <div className="flex-between mb-2">
            <h3 className="card-title">Recent Submissions</h3>
            <Link to="/dsa" className="btn btn-ghost btn-sm">View all →</Link>
          </div>
          {data?.recentSubmissions?.length ? (
            <div className="recent-list">
              {data.recentSubmissions.map(sub => (
                <div key={sub.id} className="recent-item">
                  <div className="recent-info">
                    <span className="recent-title">{sub.title}</span>
                    <span className={`badge badge-${sub.difficulty?.toLowerCase()}`}>{sub.difficulty}</span>
                  </div>
                  <div className="recent-meta">
                    <span className={`status-${sub.status === 'Accepted' ? 'accepted' : 'wrong'}`}>
                      {sub.status === 'Accepted' ? '✓' : '✗'} {sub.status}
                    </span>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>{sub.language}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="dash-empty">
              <span>{ }</span>
              <p>No submissions yet.</p>
              <Link to="/dsa" className="btn btn-secondary btn-sm">Start practicing</Link>
            </div>
          )}
        </div>

        {/* Recent Interviews */}
        <div className="card dash-recent">
          <div className="flex-between mb-2">
            <h3 className="card-title">Recent Interviews</h3>
            <Link to="/mock-interview" className="btn btn-ghost btn-sm">View all →</Link>
          </div>
          {data?.recentInterviews?.length ? (
            <div className="recent-list">
              {data.recentInterviews.map(iv => (
                <div key={iv.id} className="recent-item">
                  <div className="recent-info">
                    <span className="recent-title">{iv.topic || iv.interview_type}</span>
                    <span className="badge badge-cyan">{iv.interview_type}</span>
                  </div>
                  <div className="recent-meta">
                    <span className="text-green">{iv.score}/10</span>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>{iv.difficulty}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="dash-empty">
              <span>◈</span>
              <p>No interviews yet.</p>
              <Link to="/mock-interview" className="btn btn-secondary btn-sm">Start session</Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Feature Access */}
      <div className="dash-features mt-4">
        <h3 className="card-title mb-2">Jump Into</h3>
        <div className="grid-3 stagger-children">
          {[
            { to: '/dsa',            icon: '{ }', title: 'DSA Practice',     desc: 'Arrays, Trees, DP, Graphs & more',   color: 'var(--accent-cyan)' },
            { to: '/mock-interview', icon: '◈',   title: 'AI Mock Interview', desc: 'Technical, behavioral, system design', color: 'var(--accent-green)' },
            { to: '/companies',      icon: '◎',   title: 'Company Prep',     desc: 'FAANG, startups & company questions', color: 'var(--accent-orange)' },
          ].map(f => (
            <Link key={f.to} to={f.to} className="card feature-card animate-fade-up" style={{ '--feature-color': f.color }}>
              <div className="feature-icon" style={{ color: f.color }}>{f.icon}</div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
              <div className="feature-arrow" style={{ color: f.color }}>→</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
