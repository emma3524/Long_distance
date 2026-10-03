import { createContext, useContext, useEffect, useState } from 'react';

// Each theme defines the full set of CSS custom properties
export const THEMES = {
  pink: {
    label: 'Pink',
    emoji: '🌸',
    '--color-primary':      '#f472b6',
    '--color-primary-dark': '#9d174d',
    '--color-light':        '#fce7f3',
    '--color-lighter':      '#fdf2f8',
    '--color-bg':           '#fff0f5',
    '--color-text-dark':    '#3d0026',
    '--color-text-mid':     '#6b3050',
    '--color-text-muted':   '#c0749a',
    '--color-shadow':       'rgba(244,114,182,0.1)',
  },
  red: {
    label: 'Red',
    emoji: '🔴',
    '--color-primary':      '#ef4444',
    '--color-primary-dark': '#7f1d1d',
    '--color-light':        '#fee2e2',
    '--color-lighter':      '#fff5f5',
    '--color-bg':           '#fff8f8',
    '--color-text-dark':    '#3b0000',
    '--color-text-mid':     '#7c2d12',
    '--color-text-muted':   '#f87171',
    '--color-shadow':       'rgba(239,68,68,0.1)',
  },
  blue: {
    label: 'Blue',
    emoji: '💙',
    '--color-primary':      '#3b82f6',
    '--color-primary-dark': '#1e3a8a',
    '--color-light':        '#dbeafe',
    '--color-lighter':      '#eff6ff',
    '--color-bg':           '#f0f6ff',
    '--color-text-dark':    '#0f172a',
    '--color-text-mid':     '#1e40af',
    '--color-text-muted':   '#60a5fa',
    '--color-shadow':       'rgba(59,130,246,0.1)',
  },
  green: {
    label: 'Green',
    emoji: '💚',
    '--color-primary':      '#22c55e',
    '--color-primary-dark': '#14532d',
    '--color-light':        '#dcfce7',
    '--color-lighter':      '#f0fdf4',
    '--color-bg':           '#f0fdf6',
    '--color-text-dark':    '#052e16',
    '--color-text-mid':     '#166534',
    '--color-text-muted':   '#4ade80',
    '--color-shadow':       'rgba(34,197,94,0.1)',
  },
  purple: {
    label: 'Purple',
    emoji: '💜',
    '--color-primary':      '#a855f7',
    '--color-primary-dark': '#4a1d96',
    '--color-light':        '#ede9fe',
    '--color-lighter':      '#f5f3ff',
    '--color-bg':           '#f8f4ff',
    '--color-text-dark':    '#1e0040',
    '--color-text-mid':     '#6b21a8',
    '--color-text-muted':   '#c084fc',
    '--color-shadow':       'rgba(168,85,247,0.1)',
  },
  black: {
    label: 'Black',
    emoji: '🖤',
    '--color-primary':      '#374151',
    '--color-primary-dark': '#111827',
    '--color-light':        '#e5e7eb',
    '--color-lighter':      '#f3f4f6',
    '--color-bg':           '#f9fafb',
    '--color-text-dark':    '#111827',
    '--color-text-mid':     '#374151',
    '--color-text-muted':   '#6b7280',
    '--color-shadow':       'rgba(55,65,81,0.1)',
  },
};

const STORAGE_KEY = 'ld_theme';

function applyTheme(themeKey) {
  const theme = THEMES[themeKey] ?? THEMES.pink;
  const root = document.documentElement;
  Object.entries(theme).forEach(([key, value]) => {
    if (key.startsWith('--')) root.style.setProperty(key, value);
  });
}

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved && THEMES[saved] ? saved : 'pink';
  });

  // Apply on mount and whenever theme changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function setTheme(key) {
    if (!THEMES[key]) return;
    localStorage.setItem(STORAGE_KEY, key);
    setThemeState(key);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
