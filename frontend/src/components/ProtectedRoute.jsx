import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, requireAdmin = false }) {
  const { isLoggedIn, isAdmin, loading } = useAuth();
  const location = useLocation();

  // Wait for auth to load (avoids flicker)
  if (loading) {
    return (
      <div style={{ 
        minHeight: '60vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'var(--muted)'
      }}>
        🌸 Loading...
      </div>
    );
  }

  // Not logged in → redirect to login
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Logged in but not admin (when admin required)
  if (requireAdmin && !isAdmin) {
    return (
      <div style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem',
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚫</div>
        <h2 style={{ color: 'var(--lavender-900)', marginBottom: '0.5rem' }}>Access denied</h2>
        <p style={{ color: 'var(--muted)' }}>Only admins can view this page.</p>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;