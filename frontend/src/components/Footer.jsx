import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Top section */}
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <div className="footer-logo-row">
              <span className="footer-logo-mark">🌸</span>
              <div>
                <p className="footer-tamil">செல்லா வேங்கடம்</p>
                <h3 className="footer-name">Chella Vengadam's Kitchen</h3>
              </div>
            </div>
            <p className="footer-tagline">
              Three generations of Tamil heritage —
              served with the warmth of home, from our family to yours.
            </p>
            <div className="footer-socials">
            <a href="#" className="social-link" aria-label="Instagram">Instagram</a>
            <a href="#" className="social-link" aria-label="Facebook">Facebook</a>
            <a href="#" className="social-link" aria-label="WhatsApp">WhatsApp</a>
          </div>
          </div>

          {/* Quick links */}
          <div className="footer-col">
            <h4 className="footer-col-title">Visit</h4>
            <ul>
              <li><Link to="/menu">Our Menu</Link></li>
              <li><Link to="/reserve">Book a Table</Link></li>
              <li><Link to="/about">Our Story</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-title">Your Account</h4>
            <ul>
              <li><Link to="/login">Sign in</Link></li>
              <li><Link to="/signup">Create Account</Link></li>
              <li><Link to="/cart">Your Cart</Link></li>
            </ul>
          </div>

          <div className="footer-col footer-contact">
            <h4 className="footer-col-title">Find Us</h4>
            <p>
              <span className="footer-label">Address</span>
              14, Bagayam Road<br />
              Sathuvachari, Vellore<br />
              Tamil Nadu 632009
            </p>
            <p>
              <span className="footer-label">Hours</span>
              Lunch · 12 – 3 PM<br />
              Dinner · 7 – 10:30 PM<br />
              <span className="muted-line">Closed Tuesdays</span>
            </p>
            <p>
              <span className="footer-label">Phone</span>
              +91 416 222 1962
            </p>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            © {year} Chella Vengadam's Kitchen,Vellore, Tamil Nadu.
          </p>
          <p className="footer-credits">
            Designed and built by <strong>Nithya</strong> · React, Express, MySQL
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;