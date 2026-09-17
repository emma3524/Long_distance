import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [mode,     setMode]     = useState('login'); // 'login' | 'signup'
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [busy,     setBusy]     = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'login') {
        const user = await login(email, password);
        navigate(user.role === 'admin' ? '/admin' : '/', { replace: true });
      } else {
        // Sign up then auto login
        if (!name.trim()) throw new Error('Name is required');
        await apiFetch('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({ name, email, password }),
        });
        const user = await login(email, password);
        navigate(user.role === 'admin' ? '/admin' : '/', { replace: true });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function switchMode() {
    setMode(m => m === 'login' ? 'signup' : 'login');
    setError('');
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-emoji">💗</div>
        <h1>{mode === 'login' ? 'Welcome back' : 'Join in'}</h1>
        <p className="auth-sub">
          {mode === 'login' ? 'Sign in to continue' : 'Create your account'}
        </p>

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <label>Name
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                required
                autoFocus
              />
            </label>
          )}

          <label>Email
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@email.com"
              required
              autoFocus={mode === 'login'}
            />
          </label>

          <label>Password
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </label>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="btn-primary" disabled={busy}>
            {busy ? '…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#888' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={switchMode}
            style={{ background: 'none', border: 'none', color: '#f472b6', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
