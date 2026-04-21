import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './InterviewSessionPage.css';

export default function InterviewSessionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm your AI interviewer today. Let's begin. Could you start by briefly introducing yourself and telling me about your background?",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [ending, setEnding] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [timer, setTimer] = useState(0);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Timer
  useEffect(() => {
    const t = setInterval(() => setTimer(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    const userMsg = { role: 'user', content: input.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const res = await axios.post(`/mock-interview/${id}/message`, {
        message: userMsg.content,
        conversation_history: history,
      });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.response, timestamp: new Date() }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I had trouble responding. Please try again.',
        timestamp: new Date(),
      }]);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const endInterview = async () => {
    setEnding(true);
    try {
      const res = await axios.post(`/mock-interview/${id}/complete`);
      setFeedback(res.data.feedback);
    } catch (err) {
      console.error(err);
      setFeedback({ overall_score: 0, strengths: [], improvements: [], detailed_feedback: 'Failed to get feedback.' });
    } finally {
      setEnding(false);
    }
  };

  const handleKeyDown = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  if (feedback) {
    return (
      <div className="page-wrapper">
        <div className="feedback-page animate-fade-up">
          <div className="feedback-header">
            <h1 className="page-title">Interview Complete!</h1>
            <p className="text-secondary">Here's your AI-generated feedback</p>
          </div>
          <div className="feedback-score-card card">
            <div className="score-circle">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border)" strokeWidth="8" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="var(--accent-green)" strokeWidth="8"
                  strokeDasharray={`${(feedback.overall_score / 10) * 263.8} 263.8`}
                  strokeLinecap="round" transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="score-center">
                <span className="score-num text-green">{Number(feedback.overall_score).toFixed(1)}</span>
                <span className="score-label">/ 10</span>
              </div>
            </div>
            <div className="score-info">
              <h2>Overall Score</h2>
              <p className="text-secondary">{feedback.detailed_feedback}</p>
            </div>
          </div>

          <div className="grid-2 mt-3">
            <div className="card">
              <h3 style={{ color: 'var(--accent-green)', marginBottom: '0.75rem' }}>✓ Strengths</h3>
              <ul className="feedback-list">
                {(feedback.strengths || []).map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            <div className="card">
              <h3 style={{ color: 'var(--accent-orange)', marginBottom: '0.75rem' }}>→ Areas to Improve</h3>
              <ul className="feedback-list">
                {(feedback.improvements || []).map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          </div>

          <div className="flex gap-2 mt-3">
            <button className="btn btn-primary" onClick={() => navigate('/mock-interview')}>Start New Interview</button>
            <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="session-page">
      {/* Header */}
      <div className="session-header">
        <div className="session-info">
          <span className="text-muted" style={{ fontSize: '0.75rem' }}>LIVE SESSION</span>
          <div className="session-live"><div className="live-dot" /><span>AI Interview in Progress</span></div>
        </div>
        <div className="session-timer">
          <span className="timer-icon">⏱</span>
          <span className="timer-val">{formatTime(timer)}</span>
        </div>
        <button className="btn btn-danger btn-sm" onClick={endInterview} disabled={ending}>
          {ending ? 'Ending...' : '■ End & Get Feedback'}
        </button>
      </div>

      {/* Chat */}
      <div className="chat-area">
        {messages.map((m, i) => (
          <div key={i} className={`msg msg-${m.role} animate-fade-up`} style={{ animationDelay: `${i * 0.03}s` }}>
            <div className="msg-avatar">
              {m.role === 'assistant' ? '◈' : '◉'}
            </div>
            <div className="msg-content">
              <div className="msg-header">
                <span className="msg-name">{m.role === 'assistant' ? 'AI Interviewer' : 'You'}</span>
                <span className="msg-time">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="msg-text">{m.content}</div>
            </div>
          </div>
        ))}

        {sending && (
          <div className="msg msg-assistant">
            <div className="msg-avatar">◈</div>
            <div className="msg-content">
              <div className="msg-header"><span className="msg-name">AI Interviewer</span></div>
              <div className="typing-indicator"><span /><span /><span /></div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="session-input-area">
        <div className="input-wrap">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your answer... (Enter to send, Shift+Enter for new line)"
            rows={3}
            disabled={sending}
          />
          <button className="send-btn btn btn-primary" onClick={sendMessage} disabled={sending || !input.trim()}>
            {sending ? '...' : '→'}
          </button>
        </div>
        <p className="text-muted" style={{ fontSize: '0.72rem', textAlign: 'center', marginTop: '0.4rem' }}>
          Press Enter to send · Shift+Enter for new line · Take your time — think before answering
        </p>
      </div>
    </div>
  );
}
