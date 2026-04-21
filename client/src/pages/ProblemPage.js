import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import './ProblemPage.css';

const LANGUAGES = ['javascript', 'python', 'java', 'cpp', 'typescript'];
const DEFAULT_CODE = {
  javascript: '/**\n * @param {number[]} nums\n * @return {number[]}\n */\nfunction solution(nums) {\n  // Your solution here\n  \n}',
  python: 'class Solution:\n    def solution(self, nums: list[int]) -> list[int]:\n        # Your solution here\n        pass',
  java: 'class Solution {\n    public int[] solution(int[] nums) {\n        // Your solution here\n        return new int[]{};\n    }\n}',
  cpp: '#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> solution(vector<int>& nums) {\n        // Your solution here\n        return {};\n    }\n};',
  typescript: 'function solution(nums: number[]): number[] {\n  // Your solution here\n  return [];\n}',
};

export default function ProblemPage() {
  const { slug } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState(DEFAULT_CODE.javascript);
  const [language, setLanguage] = useState('javascript');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    axios.get(`/dsa/problems/${slug}`)
      .then(r => setProblem(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCode(DEFAULT_CODE[lang] || DEFAULT_CODE.javascript);
  };

  const handleSubmit = async (status = 'Accepted') => {
    if (!problem) return;
    setSubmitting(true); setResult(null);
    try {
      const res = await axios.post(`/dsa/problems/${problem.id}/submit`, {
        code, language, status,
        runtime_ms: Math.floor(Math.random() * 200) + 10,
        memory_kb: Math.floor(Math.random() * 10000) + 5000,
      });
      setResult({ ...res.data, status });
    } catch (err) {
      setResult({ error: err.response?.data?.error || 'Submission failed.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /><span>Loading problem...</span></div>;
  if (!problem) return <div className="loading-center"><span>Problem not found.</span><Link to="/dsa" className="btn btn-secondary btn-sm mt-2">← Back</Link></div>;

  return (
    <div className="problem-page">
      {/* Left panel - problem */}
      <div className="problem-panel">
        <div className="problem-panel-header">
          <Link to="/dsa" className="btn btn-ghost btn-sm">← Problems</Link>
          <div className="flex gap-1 align-items-center">
            <span className={`badge badge-${problem.difficulty?.toLowerCase()}`}>{problem.difficulty}</span>
            {problem.user_status === 'solved' && <span className="badge badge-green">✓ Solved</span>}
          </div>
        </div>

        <div className="problem-title-row">
          <h1 className="problem-title">{problem.id}. {problem.title}</h1>
          <span className="badge badge-cyan">{problem.category}</span>
        </div>

        {/* Tabs */}
        <div className="problem-tabs">
          {['description', 'hints', 'companies'].map(t => (
            <button key={t} className={`prob-tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="problem-body">
          {activeTab === 'description' && (
            <>
              <p className="problem-desc">{problem.description}</p>

              {problem.examples?.length > 0 && (
                <div className="problem-section">
                  <h3>Examples</h3>
                  {problem.examples.map((ex, i) => (
                    <div key={i} className="example-block">
                      <div><span className="ex-label">Input:</span> <code>{ex.input}</code></div>
                      <div><span className="ex-label">Output:</span> <code>{ex.output}</code></div>
                      {ex.explanation && <div className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}><span className="ex-label">Explanation:</span> {ex.explanation}</div>}
                    </div>
                  ))}
                </div>
              )}

              {problem.constraints && (
                <div className="problem-section">
                  <h3>Constraints</h3>
                  <div className="constraints-box">{problem.constraints}</div>
                </div>
              )}

              {problem.tags?.length > 0 && (
                <div className="problem-section">
                  <h3>Topics</h3>
                  <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
                    {problem.tags.map(t => <span key={t} className="problem-tag" style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem' }}>{t}</span>)}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'hints' && (
            <div className="hints-list">
              {problem.hints?.length ? problem.hints.map((h, i) => (
                <details key={i} className="hint-item">
                  <summary>Hint {i + 1}</summary>
                  <p>{h}</p>
                </details>
              )) : <p className="text-muted">No hints available for this problem.</p>}
            </div>
          )}

          {activeTab === 'companies' && (
            <div className="companies-list">
              {problem.companies?.length ? problem.companies.map(c => (
                <span key={c} className="company-badge">{c}</span>
              )) : <p className="text-muted">No company data available.</p>}
            </div>
          )}
        </div>
      </div>

      {/* Right panel - editor */}
      <div className="editor-panel">
        {/* Editor header */}
        <div className="editor-header">
          <div className="terminal-dot dot-red" /><div className="terminal-dot dot-yellow" /><div className="terminal-dot dot-green" />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>solution.{language === 'cpp' ? 'cpp' : language === 'java' ? 'java' : language}</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
            {LANGUAGES.map(l => (
              <button key={l} onClick={() => handleLanguageChange(l)}
                className={`lang-btn ${language === l ? 'active' : ''}`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Monaco Editor */}
        <div className="editor-wrap">
          <Editor
            height="100%"
            language={language === 'cpp' ? 'cpp' : language}
            value={code}
            onChange={val => setCode(val || '')}
            theme="vs-dark"
            options={{
              fontSize: 14,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              padding: { top: 16, bottom: 16 },
              lineNumbers: 'on',
              renderLineHighlight: 'line',
              cursorBlinking: 'smooth',
              smoothScrolling: true,
              tabSize: 2,
            }}
          />
        </div>

        {/* Result */}
        {result && (
          <div className={`submit-result ${result.error ? 'error' : result.status === 'Accepted' ? 'accepted' : 'wrong'}`}>
            {result.error
              ? <span>✗ {result.error}</span>
              : <span>{result.status === 'Accepted' ? '✓ Accepted!' : `✗ ${result.status}`} {result.message}</span>
            }
          </div>
        )}

        {/* Actions */}
        <div className="editor-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => setCode(DEFAULT_CODE[language])}>
            Reset
          </button>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-ghost" onClick={() => handleSubmit('Wrong Answer')} disabled={submitting}>
              Run Tests
            </button>
            <button className="btn btn-primary" onClick={() => handleSubmit('Accepted')} disabled={submitting}>
              {submitting ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Submitting...</> : '▶ Submit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
