import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api';

/* ── PAGE DEFINITIONS ── */
const TOTAL_STEPS = 6;

const PAGES = [
  { id: 'mood',     step: 1, type: 'grid',
    question: 'How are you feeling today?',
    quote: '"In all the world,\nthere is no heart\nfor me like yours."',
    options: [
      { emoji: '✨', label: 'Amazing' },
      { emoji: '😊', label: 'Good'    },
      { emoji: '😌', label: 'Okay'    },
      { emoji: '😔', label: 'Tired'   },
      { emoji: '😣', label: 'Stressed'},
      { emoji: '🥺', label: 'Sad'     },
    ],
    key: 'mood' },

  { id: 'activity', step: 2, type: 'list',
    question: 'What did you do mostly?',
    options: ['Working hard','Taking it easy','Running errands','Seeing people','Making things','Learning'],
    key: 'activity' },

  { id: 'miss',     step: 3, type: 'slider',
    question: 'How much do you miss me?',
    icons: ['🥺','😭'], labels: ['A little','So much!'],
    min: 0, max: 100, defaultValue: 50,
    format: v => `${Math.round(v / 20)}/5 🥺`,
    key: 'missLevel' },

  { id: 'smile',    step: 4, type: 'list',
    question: 'What made you smile?',
    options: ['Thinking of you 💗','Good food 🍲','A cute animal 🐶','A funny meme 😂','Getting things done ✨','Not much today'],
    key: 'smiledAt' },

  { id: 'food',     step: 5, type: 'list',
    question: 'Did you eat properly?',
    options: ['Ate really well 🍛','Ate decently 🙂','Junk food day 🍔','Forgot to eat enough 🥺'],
    key: 'ateWell' },

  { id: 'energy',   step: 6, type: 'slider',
    question: 'Energy level today?',
    icons: ['🔋','🔋'],
    min: 0, max: 100, defaultValue: 70,
    format: v => `${Math.round(v / 20)}/5 🔋`,
    key: 'energyLevel' },

  { id: 'want',     step: null, type: 'list',
    question: 'What would you like from me?',
    options: ['A big hug 🫂','FaceTime/Call 📞','A sweet text 💌','Some quiet time 🌙','Someone to listen 👂'],
    key: 'wants' },

  { id: 'facetime', step: null, type: 'date',
    question: "Let's set up a\nFaceTime date 💕",
    times: ['8:00 AM','9:00 AM','10:00 AM','12:00 PM','1:00 PM','3:00 PM','5:00 PM','6:00 PM','7:00 PM'],
    key: 'facetime' },
];

/* ── COMPONENT ── */
export default function CheckInFlow() {
  const { user, logout, refreshUser } = useAuth();
  const [screen,   setScreen]   = useState('opening'); // opening | checkin | done | alreadyDone
  const [pageIdx,  setPageIdx]  = useState(0);
  const [answers,  setAnswers]  = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result,   setResult]   = useState(null);

  // Check if already checked in today
  useEffect(() => {
    apiFetch('/api/checkin/today')
      .then(d => { if (d.checkedIn) setScreen('alreadyDone'); })
      .catch(() => {});
  }, []);

  function setAnswer(key, val) {
    setAnswers(prev => ({ ...prev, [key]: val }));
  }

  function next() {
    if (pageIdx < PAGES.length - 1) setPageIdx(i => i + 1);
    else handleSubmit();
  }
  function back() {
    if (pageIdx > 0) setPageIdx(i => i - 1);
    else setScreen('opening');
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const data = await apiFetch('/api/checkin', {
        method: 'POST',
        body: JSON.stringify({ answers }),
      });
      setResult(data);
      refreshUser();
      setScreen('done');
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  /* ── OPENING ── */
  if (screen === 'opening') {
    return (
      <div className="flow-page opening-page">
        {user.adminMessage && (
          <div className="admin-message">
            <span>💌</span> {user.adminMessage}
          </div>
        )}
        <div className="big-emoji">🥺</div>
        <h1>Did you miss me?</h1>
        <div className="choice-area">
          <DodgeButton />
          <button className="yes-button" onClick={() => setScreen('checkin')}>Yes 💗</button>
        </div>
        <button className="logout-link" onClick={logout}>Sign out</button>
      </div>
    );
  }

  /* ── ALREADY DONE ── */
  if (screen === 'alreadyDone') {
    return (
      <div className="flow-page opening-page">
        <div className="big-emoji">✅</div>
        <h1>Already checked in today!</h1>
        <p style={{ color:'#c0749a', textAlign:'center' }}>
          Come back tomorrow 💗<br/>
          <strong>Streak: {user.streak} 🔥</strong>
        </p>
        <button className="logout-link" onClick={logout}>Sign out</button>
      </div>
    );
  }

  /* ── DONE ── */
  if (screen === 'done') {
    return (
      <div className="flow-page complete-page">
        <div className="complete-icon">✓</div>
        <h1>All done for today!</h1>
        <p>Streak: <strong>{result?.streak} day{result?.streak !== 1 ? 's' : ''} 🔥</strong></p>
        <div className="summary">
          {Object.entries(answers).map(([k, v]) => (
            <div className="summary-item" key={k}>
              <strong>{k.toUpperCase()}</strong>
              <span>{v}</span>
            </div>
          ))}
        </div>
        <button className="logout-link" onClick={logout}>Sign out</button>
      </div>
    );
  }

  /* ── CHECK-IN FLOW ── */
  const page = PAGES[pageIdx];
  const isLast = pageIdx === PAGES.length - 1;

  return (
    <div className="flow-page checkin-page">
      {page.step !== null && page.step <= 2 && (
        <div className="top-row">
          <div className="streak">✨ {user.streak} day streak</div>
          <div className="heart">♡</div>
        </div>
      )}

      {page.step !== null && (
        <div className="progress">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <span key={i} className={i < page.step ? 'done' : ''} />
          ))}
        </div>
      )}

      {page.quote && (
        <p className="quote" dangerouslySetInnerHTML={{ __html: page.quote.replace(/\n/g, '<br>') }} />
      )}

      <h2 className="question" dangerouslySetInnerHTML={{ __html: page.question.replace(/\n/g, '<br>') }} />

      {page.type === 'grid' && (
        <div className="option-grid">
          {page.options.map(o => (
            <button
              key={o.label}
              className={`option-card ${answers[page.key] === o.label ? 'selected' : ''}`}
              onClick={() => setAnswer(page.key, o.label)}
            >
              <span className="option-emoji">{o.emoji}</span>
              {o.label}
            </button>
          ))}
        </div>
      )}

      {page.type === 'list' && (
        <div className="long-options">
          {page.options.map(o => (
            <button
              key={o}
              className={`long-option ${answers[page.key] === o ? 'selected' : ''}`}
              onClick={() => setAnswer(page.key, o)}
            >
              {o}
            </button>
          ))}
        </div>
      )}

      {page.type === 'slider' && (
        <div className="slider-card">
          <div className="slider-icons">
            <span>{page.icons[0]}</span><span>{page.icons[1]}</span>
          </div>
          <input
            type="range" min={page.min} max={page.max}
            defaultValue={page.defaultValue}
            onChange={e => setAnswer(page.key, page.format(e.target.value))}
          />
          {page.labels && (
            <div className="slider-labels">
              <span>{page.labels[0]}</span><span>{page.labels[1]}</span>
            </div>
          )}
        </div>
      )}

      {page.type === 'date' && (
        <DatePicker
          times={page.times}
          value={answers[page.key] || ''}
          onChange={val => setAnswer(page.key, val)}
        />
      )}

      <div className="navigation">
        <button className="back-button" onClick={back}>Back</button>
        <button
          className="next-button"
          onClick={next}
          disabled={submitting}
        >
          {submitting ? '…' : isLast ? 'Complete Check-in 💗' : 'Next →'}
        </button>
      </div>
    </div>
  );
}

/* ── SUB-COMPONENTS ── */

function DodgeButton() {
  const [pos, setPos] = useState({ left: 10, top: 40 });

  function dodge() {
    const area = document.querySelector('.choice-area');
    if (!area) return;
    setPos({
      left: Math.random() * (area.clientWidth  - 60),
      top:  Math.random() * (area.clientHeight - 40),
    });
  }

  return (
    <button
      className="no-button"
      style={{ left: pos.left, top: pos.top }}
      onMouseEnter={dodge}
      onTouchStart={e => { e.preventDefault(); dodge(); }}
      onClick={e => { e.preventDefault(); dodge(); }}
    >
      No
    </button>
  );
}

function DatePicker({ times, value, onChange }) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  function update(d, t) {
    const val = `${d}${t ? ' ' + t : ''}`.trim();
    onChange(val);
  }

  return (
    <div className="date-card">
      <div className="date-icon">📅</div>
      <p>Pick a date and time you're both free to call.</p>
      <input
        type="date"
        className="date-input"
        value={date}
        onChange={e => { setDate(e.target.value); update(e.target.value, time); }}
      />
      <div className="time-grid">
        {times.map(t => (
          <button
            key={t}
            className={`time-button ${time === t ? 'selected' : ''}`}
            onClick={() => { setTime(t); update(date, t); }}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
