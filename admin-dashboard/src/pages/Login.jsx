import { useState } from 'react';

const ADMIN_ACCOUNTS = [
  { email: 'admin@foodorder.com', password: 'admin123', name: 'Super Admin', role: 'super_admin' },
  { email: 'manager@foodorder.com', password: 'manager123', name: 'Manager', role: 'manager' },
];

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) return setError('Enter your email');
    if (!password) return setError('Enter your password');

    setLoading(true);
    setTimeout(() => {
      const acc = ADMIN_ACCOUNTS.find(
        a => a.email === email.trim().toLowerCase() && a.password === password
      );
      if (acc) onLogin({ email: acc.email, name: acc.name, role: acc.role });
      else { setError('Invalid credentials'); setLoading(false); }
    }, 900);
  };

  return (
    <div className="auth-split">
      {/* ── LEFT: Form ── */}
      <div className="auth-form-side">
        <div className="auth-form-inner">


          <h1 className="auth-heading">Sign in</h1>
          <p className="auth-subheading">Enter your credentials to access the admin panel</p>

          {error && (
            <div className="auth-alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          <form onSubmit={submit} autoComplete="off">
            <label className="auth-label">Email Address</label>
            <div className="auth-input-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="m2 7 10 7 10-7"/></svg>
              <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }} placeholder="admin@foodorder.com" autoFocus />
            </div>

            <label className="auth-label">Password</label>
            <div className="auth-input-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <input type={showPw ? 'text' : 'password'} value={password} onChange={e => { setPassword(e.target.value); setError(''); }} placeholder="••••••••" autoComplete="new-password" />
              <button type="button" className="auth-toggle-pw" onClick={() => setShowPw(!showPw)} tabIndex={-1}>
                {showPw ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>

            <div className="auth-options">
              <label className="auth-remember-row">
                <input type="checkbox" checked={remember} onChange={() => setRemember(!remember)} />
                <span className="auth-checkbox" />
                Remember me
              </label>
              <span className="auth-forgot-link">Forgot password?</span>
            </div>

            <button type="submit" className="auth-sign-in-btn" disabled={loading}>
              {loading ? <span className="auth-loader" /> : 'Sign in →'}
            </button>
          </form>
        </div>
      </div>

      {/* ── RIGHT: Hero ── */}
      <div className="auth-hero-side">
        <div className="auth-hero-overlay" />
        <img src="/login-hero.png" alt="" className="auth-hero-img" />
        <div className="auth-hero-content">
          <div className="auth-hero-badge">Admin Dashboard</div>
          <h2 className="auth-hero-title">Manage Your<br />Food Empire</h2>
          <p className="auth-hero-desc">Track orders, manage chefs, and grow your business — all from one powerful dashboard.</p>

        </div>
      </div>
    </div>
  );
}
