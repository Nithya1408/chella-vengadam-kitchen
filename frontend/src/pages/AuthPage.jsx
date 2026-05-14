import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

function AuthPage({ mode = 'login' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup } = useAuth();
  
  const isSignup = mode === 'signup';

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Where to go after login (if redirected from a protected page)
  const redirectTo = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = isSignup
        ? await signup({ name, email, phone, password })
        : await login({ email, password });

      if (res.success) {
        navigate(redirectTo, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || `${isSignup ? 'Signup' : 'Login'} failed. Try again.`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Decorative blobs */}
      <div className="auth-bg">
        <div className="auth-blob blob-1"></div>
        <div className="auth-blob blob-2"></div>
      </div>

      <div className="auth-container">
        <div className="auth-card">
          {/* Brand */}
          <div className="auth-brand">
            <span className="auth-logo">🌸</span>
            <div>
              <p className="auth-tamil">செல்லா வேங்கடம்</p>
              <p className="auth-brand-name">Chella Vengadam's Kitchen</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="auth-tabs">
            <Link 
              to="/login" 
              className={`auth-tab ${!isSignup ? 'active' : ''}`}
            >
              Sign In
            </Link>
            <Link 
              to="/signup" 
              className={`auth-tab ${isSignup ? 'active' : ''}`}
            >
              Create Account
            </Link>
          </div>

          {/* Heading */}
          <div className="auth-heading">
            {isSignup ? (
              <>
                <h2>Welcome to the <span className="italic">family</span></h2>
                <p>Create an account to save your orders and book tables faster.</p>
              </>
            ) : (
              <>
                <h2>Welcome <span className="italic">back</span></h2>
                <p>Sign in to access your orders and reservations.</p>
              </>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            {isSignup && (
              <label className="auth-field">
                <span>Full Name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Nithya"
                  required={isSignup}
                  autoComplete="name"
                />
              </label>
            )}

            <label className="auth-field">
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </label>

            {isSignup && (
              <label className="auth-field">
                <span>Phone <span className="optional">(optional)</span></span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile"
                  pattern="[0-9]{10}"
                  autoComplete="tel"
                />
              </label>
            )}

            <label className="auth-field">
              <span>Password</span>
              <div className="password-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isSignup ? 'At least 6 characters' : 'Your password'}
                  minLength="6"
                  required
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </label>

            {error && (
              <div className="auth-error">⚠️ {error}</div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary auth-submit"
              disabled={submitting}
            >
              {submitting 
                ? (isSignup ? 'Creating account...' : 'Signing in...') 
                : (isSignup ? 'Create Account 🌸' : 'Sign In →')
              }
            </button>
          </form>

          {/* Footer */}
          <div className="auth-footer">
            {isSignup ? (
              <p>Already have an account? <Link to="/login">Sign in</Link></p>
            ) : (
              <p>Don't have an account? <Link to="/signup">Create one</Link></p>
            )}
            <p className="auth-back">
              <Link to="/">← Back to home</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;