import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../api';

const LABELS = {
  mood:        'Mood',
  activity:    'Activity',
  missLevel:   'Miss you level',
  smiledAt:    'Smiled at',
  ateWell:     'Ate well',
  energyLevel: 'Energy',
  wants:       'Wanted',
  facetime:    'FaceTime',
};

export default function AdminHistory() {
  const { userId } = useParams();
  const navigate   = useNavigate();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/api/admin/users/${userId}/checkins`)
      .then(d => setEntries(d.entries))
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <button className="btn-ghost" onClick={() => navigate('/admin')}>← Back</button>
        <h1>Check-in history</h1>
      </div>

      {loading ? <p className="muted">Loading…</p> : (
        entries.length === 0
          ? <p className="muted">No check-ins yet.</p>
          : entries.map(entry => (
            <div className="history-card" key={entry._id}>
              <div className="history-date">{entry.date}</div>
              <div className="history-answers">
                {Object.entries(entry.answers).map(([k, v]) => v && (
                  <div className="history-row" key={k}>
                    <span className="history-label">{LABELS[k] || k}</span>
                    <span>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
      )}
    </div>
  );
}
