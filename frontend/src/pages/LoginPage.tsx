import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Scale, Lock, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../api/client';

export default function LoginPage() {
  const [username, setUsername]       = useState('');
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter your username and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(username.trim(), password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <Scale size={26} color="#fff" />
          </div>
          <h1>Welcome back</h1>
          <p>Sign in to your LexAI account</p>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-danger" style={{ marginBottom: 20 }}>
            <Lock size={14} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label required" htmlFor="username">Username</label>
            <div style={{ position: 'relative' }}>
              <User
                size={14}
                style={{
                  position: 'absolute', left: 11,
                  top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--color-gray-400)', pointerEvents: 'none',
                }}
              />
              <input
                id="username"
                type="text"
                className="form-input"
                style={{ paddingLeft: 32 }}
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter your username"
                autoComplete="username"
                autoFocus
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label required" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={14}
                style={{
                  position: 'absolute', left: 11,
                  top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--color-gray-400)', pointerEvents: 'none',
                }}
              />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                style={{ paddingLeft: 32, paddingRight: 38 }}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                style={{
                  position: 'absolute', right: 10,
                  top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--color-gray-400)', display: 'flex', padding: 2,
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
            disabled={loading}
          >
            {loading
              ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Signing in…</>
              : 'Sign in'
            }
          </button>
        </form>

        <div className="auth-footer-link">
          Don't have an account?{' '}
          <Link to="/signup">Create one</Link>
        </div>

        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <Link
            to="/"
            style={{ fontSize: 12, color: 'var(--color-text-muted)' }}
          >
            ← Back to home
          </Link>
        </div>

      </div>
    </div>
  );
}
