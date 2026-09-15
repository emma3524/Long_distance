import { useState, useEffect } from 'react';
import { apiFetch } from '../../api';

export default function AdminQuestions() {
  const [questions, setQuestions] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showAdd,   setShowAdd]   = useState(false);
  const [text,      setText]      = useState('');
  const [error,     setError]     = useState('');

  async function load() {
    setLoading(true);
    try {
      const d = await apiFetch('/api/admin/questions');
      setQuestions(d.questions);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function addQuestion(e) {
    e.preventDefault();
    setError('');
    try {
      await apiFetch('/api/admin/questions', {
        method: 'POST',
        body: JSON.stringify({ text }),
      });
      setText('');
      setShowAdd(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteQuestion(id) {
    if (!confirm('Remove this question from the pool?')) return;
    await apiFetch(`/api/admin/questions/${id}`, { method: 'DELETE' });
    load();
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Daily Questions</h1>
          <p className="muted" style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>
            One question from this pool is shown to users each day, rotating automatically.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(s => !s)}>
          {showAdd ? 'Cancel' : '+ Add question'}
        </button>
      </div>

      {showAdd && (
        <form className="add-question-form" onSubmit={addQuestion}>
          <h3>New question</h3>
          {error && <p className="form-error">{error}</p>}
          <textarea
            placeholder="e.g. What's one thing you're looking forward to?"
            value={text}
            onChange={e => setText(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary">Add to pool</button>
        </form>
      )}

      {loading ? (
        <p className="muted">Loading…</p>
      ) : (
        <div className="question-list">
          {questions.length === 0 && (
            <p className="muted">
              No questions yet — add some above and they'll start rotating daily.
            </p>
          )}
          {questions.map((q, i) => (
            <div className="question-card" key={q._id}>
              <div>
                <p>{q.text}</p>
                <p className="question-meta">Added {formatDate(q.createdAt)} · #{i + 1} in pool</p>
              </div>
              <button
                className="btn-danger"
                onClick={() => deleteQuestion(q._id)}
                style={{ flexShrink: 0 }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
