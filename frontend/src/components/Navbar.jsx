import { Link, NavLink } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
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
          <Link to="/login" className="btn btn-ghost">Sign in</Link>
          <Link to="/menu" className="btn btn-primary">Order Now</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;