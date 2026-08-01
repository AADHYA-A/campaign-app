import { useState } from 'react';

const API_BASE = 'http://localhost:8000';

function Login({ onLoginSuccess }) {
  // mode: "login" or "register" - Rendu forms okate component lo, toggle chestam
  const [mode, setMode] = useState('login');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'communication_team',
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleLogin(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Login failed');
      }
      // Token ni, tarvatha requests lo vadataniki, browser storage lo save chestunnam.
      // Idi page refresh ayina, login state maintain avataniki help chestundi.
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLoginSuccess(data.user, data.access_token);
    } catch (err) {
      setError(err.message === 'Failed to fetch' ? 'Could not reach the backend server.' : err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Registration failed');
      }
      // Register success ayyaka, direct ga login screen ki thisukellipotam
      setMode('login');
      setForm({ ...form, password: '' });
      setError(null);
    } catch (err) {
      setError(err.message === 'Failed to fetch' ? 'Could not reach the backend server.' : err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <span className="eyebrow">Mass Communication Platform</span>
        <h1>{mode === 'login' ? 'Sign In' : 'Create Account'}</h1>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="form-grid">
          {mode === 'register' && (
            <label>
              Full Name
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="ex: Ramesh Kumar"
                required
              />
            </label>
          )}

          <label>
            Email
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="ex: ramesh@example.com"
              required
            />
          </label>

          <label>
            Password
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              required
            />
          </label>

          {mode === 'register' && (
            <label>
              Role
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="communication_team">Communication Team</option>
                <option value="campaign_manager">Campaign Manager</option>
                <option value="admin">Admin</option>
              </select>
            </label>
          )}

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="toggle-line">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button className="link-btn" onClick={() => { setMode('register'); setError(null); }}>
                Create one
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button className="link-btn" onClick={() => { setMode('login'); setError(null); }}>
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default Login;
