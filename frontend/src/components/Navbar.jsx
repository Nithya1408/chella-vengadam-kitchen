import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Navbar.css';

function Navbar() {
  const { totalItems } = useCart();
  const navigate = useNavigate();

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

          <Link to="/login" className="btn btn-ghost sign-in-btn">Sign in</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;