import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const { totalItems } = useCart();
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  // Generate initials for avatar
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '';

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-mark">🌸</span>
          <div className="logo-text">
            <span className="logo-name">Chella Vengadam's</span>
            <span className="logo-tagline">செல்லா வேங்கடம் · KITCHEN</span>
          </div>
        </Link>

        {/* Nav Links */}
        <ul className="navbar-links">
          <li>
            <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/menu" className={({ isActive }) => isActive ? 'active' : ''}>
              Menu
            </NavLink>
          </li>
          <li>
            <NavLink to="/reserve" className={({ isActive }) => isActive ? 'active' : ''}>
              Reserve
            </NavLink>
          </li>
          <li>
            <NavLink to="/about" className={({ isActive }) => isActive ? 'active' : ''}>
              About
            </NavLink>
          </li>
        </ul>

        {/* Right side */}
        <div className="navbar-actions">
          {/* Cart icon */}
          <button 
            className="cart-icon-btn"
            onClick={() => navigate('/cart')}
            aria-label="View cart"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {totalItems > 0 && (
              <span className="cart-badge">{totalItems}</span>
            )}
          </button>

          {/* Auth area */}
          {isLoggedIn ? (
            <div className="user-menu" ref={menuRef}>
              <button 
                className="user-avatar-btn"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="User menu"
              >
                <span className="user-avatar">{initials}</span>
                <span className="user-greeting">Hi, {user.name.split(' ')[0]}</span>
                <span className={`chev ${menuOpen ? 'open' : ''}`}>▾</span>
              </button>

              {menuOpen && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <p className="dropdown-name">{user.name}</p>
                    <p className="dropdown-email">{user.email}</p>
                    <span className={`role-tag role-${user.role}`}>
                      {user.role}
                    </span>
                  </div>
                  <div className="dropdown-divider"></div>
                  <Link to="/" onClick={() => setMenuOpen(false)} className="dropdown-link">
                    🏠 Home
                  </Link>
                  <Link to="/menu" onClick={() => setMenuOpen(false)} className="dropdown-link">
                    🍽️ Menu
                  </Link>
                  <Link to="/cart" onClick={() => setMenuOpen(false)} className="dropdown-link">
                    🛒 Cart {totalItems > 0 && `(${totalItems})`}
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" onClick={() => setMenuOpen(false)} className="dropdown-link admin-link">
                      ⚙️ Admin Dashboard
                    </Link>
                  )}
                  <div className="dropdown-divider"></div>
                  <button onClick={handleLogout} className="dropdown-link logout-btn">
                    🚪 Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn-ghost sign-in-btn">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;