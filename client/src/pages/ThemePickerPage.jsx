import { useNavigate } from 'react-router-dom';
import { useTheme, THEMES } from '../context/ThemeContext';

export default function ThemePickerPage() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  function handlePick(key) {
    setTheme(key);
  }

  function handleContinue() {
    navigate('/', { replace: true });
  }

  return (
    <div className="theme-page">
      <div className="theme-card">
        <div style={{ fontSize: '2.5rem' }}>🎨</div>
        <h1>Pick your vibe</h1>
        <p>Choose a colour that feels right to you. You can always change it later from the settings.</p>

        <div className="theme-swatches">
          {Object.entries(THEMES).map(([key, t]) => (
            <button
              key={key}
              className={`theme-swatch${theme === key ? ' active' : ''}`}
              onClick={() => handlePick(key)}
              aria-label={`${t.label} theme`}
              aria-pressed={theme === key}
            >
              <span
                className="swatch-dot"
                style={{ background: t['--color-primary'] }}
              />
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Live preview strip */}
        <div style={{
          width: '100%',
          background: 'var(--color-lighter)',
          border: '1.5px solid var(--color-light)',
          borderRadius: '12px',
          padding: '0.85rem 1rem',
          fontSize: '0.85rem',
          color: 'var(--color-text-mid)',
          lineHeight: 1.5,
        }}>
          ✨ This is how your cards will look
        </div>

        <button
          className="btn-primary"
          style={{ width: '100%', fontSize: '1rem', padding: '0.9rem' }}
          onClick={handleContinue}
        >
          Let's go 💗
        </button>
      </div>
    </div>
  );
}
