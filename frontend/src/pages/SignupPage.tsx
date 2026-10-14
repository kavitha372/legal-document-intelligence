import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Scale, Lock, User, Mail, CheckCircle } from 'lucide-react';
import { register } from '../api/auth';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../api/client';

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: 'Uppercase letter',       ok: /[A-Z]/.test(password) },
    { label: 'Number',                 ok: /\d/.test(password) },
    { label: 'Special character',      ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.ok).length;
  const colors = ['#dc2626', '#d97706', '#16a34a', '#0f766e'];
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];

  if (!password) return null;

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              background: i < score ? colors[score - 1] : 'var(--color-gray-200)',
              transition: 'background 0.2s',
            }}
          />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {checks.map(c => (
            <span
              key={c.label}
              style={{
                fontSize: 11,
                color: c.ok ? 'var(--color-success)' : 'var(--color-text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: 3,
              }}
            >
              <CheckCircle size={10} style={{ opacity: c.ok ? 1 : 0.3 }} />
              {c.label}
            </span>
          ))}
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, color: score > 0 ? colors[score - 1] : 'var(--color-text-muted)' }}>
          {score > 0 ? labels[score - 1] : ''}
        </span>
      </div>
    </div>
  );
}

export default function SignupPage() {
  const [username,        setUsername]        = useState('');
  const [email,           setEmail]           = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword,    setShowPassword]    = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState('');
  const [fieldErrors,     setFieldErrors]     = useState<Record<string, string>>({});

  const { login } = useAuth();
  const navigate  = useNavigate();

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!username.trim())              errs.username = 'Username is required.';
    else if (username.length < 3)      errs.username = 'Username must be at least 3 characters.';
    else if (!/^[a-zA-Z0-9_]+$/.test(username)) errs.username = 'Only letters, numbers and underscores allowed.';

    if (!email.trim())                 errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email address.';

    if (!password)                     errs.password = 'Password is required.';
    else if (password.length < 8)      errs.password = 'Password must be at least 8 characters.';

    if (!confirmPassword)              errs.confirmPassword = 'Please confirm your password.';
    else if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match.';

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    setLoading(true);
    try {
      await register({ username: username.trim(), email: email.trim(), password });
      // auto-login after successful registration
      await login(username.trim(), password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const field = (key: string) => ({
    error: !!fieldErrors[key],
    onChange: () => fieldErrors[key] && setFieldErrors(p => ({ ...p, [key]: '' })),
  });

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 460 }}>

        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <Scale size={26} color="#fff" />
          </div>
          <h1>Create an account</h1>
          <p>Join LexAI and start analysing legal documents</p>
        </div>

        {/* Server error */}
        {error && (
          <div className="alert alert-danger" style={{ marginBottom: 20 }}>
            <Lock size={14} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Username */}
          <div className="form-group">
            <label className="form-label required" htmlFor="username">Username</label>
            <div style={{ position: 'relative' }}>
              <User size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-400)', pointerEvents: 'none' }} />
              <input
                id="username"
                type="text"
                className={`form-input${field('username').error ? ' error' : ''}`}
                style={{ paddingLeft: 32 }}
                value={username}
                onChange={e => { setUsername(e.target.value); field('username').onChange(); }}
                placeholder="e.g. john_doe"
                autoComplete="username"
                autoFocus
                disabled={loading}
              />
            </div>
            {fieldErrors.username && <div className="form-error">{fieldErrors.username}</div>}
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label required" htmlFor="email">Email address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-400)', pointerEvents: 'none' }} />
              <input
                id="email"
                type="email"
                className={`form-input${field('email').error ? ' error' : ''}`}
                style={{ paddingLeft: 32 }}
                value={email}
                onChange={e => { setEmail(e.target.value); field('email').onChange(); }}
                placeholder="you@company.com"
                autoComplete="email"
                disabled={loading}
              />
            </div>
            {fieldErrors.email && <div className="form-error">{fieldErrors.email}</div>}
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label required" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-400)', pointerEvents: 'none' }} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={`form-input${field('password').error ? ' error' : ''}`}
                style={{ paddingLeft: 32, paddingRight: 38 }}
                value={password}
                onChange={e => { setPassword(e.target.value); field('password').onChange(); }}
                placeholder="Create a strong password"
                autoComplete="new-password"
                disabled={loading}
              />
              <button type="button" onClick={() => setShowPassword(v => !v)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-gray-400)', display: 'flex', padding: 2 }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {fieldErrors.password
              ? <div className="form-error">{fieldErrors.password}</div>
              : <PasswordStrength password={password} />
            }
          </div>

          {/* Confirm password */}
          <div className="form-group">
            <label className="form-label required" htmlFor="confirmPassword">Confirm password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-400)', pointerEvents: 'none' }} />
              <input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                className={`form-input${field('confirmPassword').error ? ' error' : ''}`}
                style={{ paddingLeft: 32, paddingRight: 38 }}
                value={confirmPassword}
                onChange={e => { setConfirmPassword(e.target.value); field('confirmPassword').onChange(); }}
                placeholder="Repeat your password"
                autoComplete="new-password"
                disabled={loading}
              />
              <button type="button" onClick={() => setShowConfirm(v => !v)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-gray-400)', display: 'flex', padding: 2 }}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {fieldErrors.confirmPassword && <div className="form-error">{fieldErrors.confirmPassword}</div>}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
            disabled={loading}
          >
            {loading
              ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Creating account…</>
              : 'Create account'
            }
          </button>
        </form>

        <div className="auth-footer-link">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </div>

        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Link to="/" style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
            ← Back to home
          </Link>
        </div>

      </div>
    </div>
  );
}
