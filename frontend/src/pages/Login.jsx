import { useState } from 'react';
import { authService } from '../services/api';

function Login({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('admin');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (isLogin) {
        const res = await authService.login(email, password);
        const token = res.data.access_token;
        const payload = JSON.parse(atob(token.split('.')[1]));
        onLogin(token, payload.role, payload.name || email.split('@')[0]);
      } else {
        await authService.signup(name, email, password, role);
        setIsLogin(true);
        setSuccess('Account created! Please login.');
        setPassword('');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred');
    }
  };

  return (
    <div className="login-page">
      <div className="login-sidebar">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
            <div className="sidebar-brand-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>Team Task Manager</span>
          </div>
          <h1>Manage your team's work, effortlessly.</h1>
          <p style={{ marginTop: '1rem' }}>
            Organize projects, assign tasks, track progress — all in one clean workspace built for teams that ship.
          </p>
        </div>
      </div>

      <div className="login-main">
        <div className="login-card">
          <h2>{isLogin ? 'Welcome back' : 'Create account'}</h2>
          <p className="login-subtitle">
            {isLogin ? 'Sign in to your workspace' : 'Choose your role and get started'}
          </p>

          {error && <div className="alert-error">{error}</div>}
          {success && <div className="alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div className="role-toggle">
                  <div
                    className={`role-option ${role === 'member' ? 'selected' : ''}`}
                    onClick={() => setRole('member')}
                  >
                    <div className="role-label">Member</div>
                    <div className="role-desc">View & update assigned tasks</div>
                  </div>
                  <div
                    className={`role-option ${role === 'admin' ? 'selected' : ''}`}
                    onClick={() => setRole('admin')}
                  >
                    <div className="role-label">Admin</div>
                    <div className="role-desc">Full project & team management</div>
                  </div>
                </div>
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" required />
                </div>
              </>
            )}
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <button type="submit">
              {isLogin ? 'Sign In' : `Sign Up as ${role === 'admin' ? 'Admin' : 'Member'}`}
            </button>
          </form>

          <div className="login-toggle">
            <button onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }}>
              {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
