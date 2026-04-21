import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MockInterviewPage.css';

const TYPES = [
  { id: 'technical',     icon: '{ }', label: 'Technical',      desc: 'DSA, coding challenges, problem solving' },
  { id: 'behavioral',    icon: '◈',   label: 'Behavioral',     desc: 'STAR method, leadership, teamwork' },
  { id: 'system-design', icon: '◎',   label: 'System Design',  desc: 'Architecture, scalability, trade-offs' },
  { id: 'hr',            icon: '◉',   label: 'HR Round',       desc: 'Culture fit, career goals, salary discussion' },
];

const TOPICS = {
  technical:     ['Arrays & Strings', 'Trees & Graphs', 'Dynamic Programming', 'System Design Basics', 'General Coding'],
  behavioral:    ['Leadership', 'Conflict Resolution', 'Teamwork', 'Failure & Learning', 'Achievements'],
  'system-design': ['URL Shortener', 'Twitter/Feed', 'Payment System', 'Chat App', 'Search Engine'],
  hr:            ['Career Goals', 'Strengths & Weaknesses', 'Salary Negotiation', 'Work Style', 'General'],
};

export default function MockInterviewPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [config, setConfig] = useState({ interview_type: 'technical', topic: '', difficulty: 'Medium' });
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    axios.get('/mock-interview/history').then(r => setHistory(r.data)).catch(console.error);
  }, []);

  const startInterview = async () => {
    setStarting(true);
    try {
      const res = await axios.post('/mock-interview/start', config);
      navigate(`/mock-interview/${res.data.interview.id}`);
    } catch (err) {
      console.error(err);
      setStarting(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="animate-fade-up">
        <div className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>
          <span className="text-cyan">// </span>mock_interview.session
        </div>
        <h1 className="page-title">AI Mock Interview</h1>
        <p className="text-secondary" style={{ fontSize: '0.875rem' }}>Practice with an AI interviewer and get instant feedback</p>
      </div>

      <div className="interview-setup mt-4">
        {/* Type Selection */}
        <div className="setup-section animate-fade-up">
          <h3 className="setup-label">Interview Type</h3>
          <div className="type-grid">
            {TYPES.map(t => (
              <div
                key={t.id}
                className={`type-card ${config.interview_type === t.id ? 'active' : ''}`}
                onClick={() => setConfig(p => ({ ...p, interview_type: t.id, topic: '' }))}
              >
                <div className="type-icon">{t.icon}</div>
                <div className="type-label">{t.label}</div>
                <div className="type-desc">{t.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="setup-row animate-fade-up">
          {/* Topic */}
          <div className="setup-section">
            <h3 className="setup-label">Topic Focus</h3>
            <div className="topic-options">
              {(TOPICS[config.interview_type] || []).map(t => (
                <button
                  key={t}
                  className={`topic-chip ${config.topic === t ? 'active' : ''}`}
                  onClick={() => setConfig(p => ({ ...p, topic: p.topic === t ? '' : t }))}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="setup-section">
            <h3 className="setup-label">Difficulty</h3>
            <div className="diff-options">
              {['Easy', 'Medium', 'Hard'].map(d => (
                <button
                  key={d}
                  className={`diff-option diff-${d.toLowerCase()} ${config.difficulty === d ? 'active' : ''}`}
                  onClick={() => setConfig(p => ({ ...p, difficulty: d }))}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Start button */}
        <div className="setup-actions animate-fade-up">
          <div className="setup-summary card">
            <div className="summary-row">
              <span className="text-muted">Type:</span>
              <span className="text-cyan">{TYPES.find(t => t.id === config.interview_type)?.label}</span>
            </div>
            <div className="summary-row">
              <span className="text-muted">Topic:</span>
              <span>{config.topic || 'General'}</span>
            </div>
            <div className="summary-row">
              <span className="text-muted">Difficulty:</span>
              <span className={`diff-${config.difficulty.toLowerCase()}`}>{config.difficulty}</span>
            </div>
          </div>
          <button className="btn btn-primary btn-lg start-btn" onClick={startInterview} disabled={starting}>
            {starting ? <><div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> Starting session...</> : '▶ Begin Interview'}
          </button>
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="mt-4 animate-fade-up">
          <h3 className="setup-label mb-2">Recent Sessions</h3>
          <div className="history-grid">
            {history.slice(0, 6).map(iv => (
              <div key={iv.id} className="card history-card">
                <div className="flex-between mb-1">
                  <span className="badge badge-cyan">{iv.interview_type}</span>
                  {iv.score && <span className="text-green" style={{ fontWeight: 700 }}>{Number(iv.score).toFixed(1)}/10</span>}
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>{iv.topic || 'General'}</div>
                <div className="flex gap-1" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span className={`diff-${iv.difficulty?.toLowerCase()}`}>{iv.difficulty}</span>
                  <span>·</span>
                  <span>{iv.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
