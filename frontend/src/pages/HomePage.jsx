import { Link } from 'react-router-dom';
import './HomePage.css';

function HomePage() {
  return (
    <div className="home">
      {/* ============ HERO SECTION ============ */}
      <section className="hero">
        <div className="hero-bg-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>

        {/* Subtle Vellore Fort silhouette */}
        <div className="vellore-mark" aria-hidden="true">
          <svg viewBox="0 0 200 40" xmlns="http://www.w3.org/2000/svg">
            <path d="M 0 40 L 0 28 L 10 28 L 10 18 L 20 18 L 20 28 L 30 28 L 30 14 L 40 14 L 40 8 L 50 8 L 50 14 L 60 14 L 60 22 L 75 22 L 75 16 L 85 16 L 85 22 L 95 22 L 95 10 L 100 4 L 105 10 L 105 22 L 115 22 L 115 16 L 125 16 L 125 22 L 140 22 L 140 14 L 150 8 L 160 14 L 160 28 L 170 28 L 170 18 L 180 18 L 180 28 L 190 28 L 190 22 L 200 22 L 200 40 Z" />
          </svg>
        </div>

        <div className="container hero-content">
          <p className="hero-tag">EST. 2026 · VELLORE, TAMIL NADU</p>
          <p className="hero-tamil">செல்லா வேங்கடம்</p>
          <h1 className="hero-title">
            Where every meal feels<br />
            <span className="italic">like home.</span>
          </h1>
          <p className="hero-subtitle">
            Born in the fort city of Vellore — heirloom Tamil recipes from Chettinad
            to the coast, slow-cooked with love and served with grace.
          </p>
          <div className="hero-buttons">
            <Link to="/menu" className="btn btn-primary">
              Explore the Menu →
            </Link>
            <Link to="/reserve" className="btn btn-secondary">
              Reserve a Table
            </Link>
          </div>
        </div>
      </section>

      {/* ============ FEATURES STRIP ============ */}
      <section className="features">
        <div className="container">
          <div className="features-header">
            <p className="section-tag">— எங்கள் சிறப்பு · WHAT MAKES US —</p>
            <h2>The Vellore <span className="italic">heart.</span></h2>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🌿</div>
              <p className="feature-tamil">பாரம்பரிய சமையல்</p>
              <h3>Heirloom Recipes</h3>
              <p>Three generations of Tamil cooking, preserved on every plate.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🪔</div>
              <p className="feature-tamil">நெருப்பில் மெதுவாக</p>
              <h3>Slow & Soulful</h3>
              <p>No shortcuts. Every kuzhambu simmers until the spices sing.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌸</div>
              <p className="feature-tamil">இனிய விருந்து</p>
              <h3>Warm Hospitality</h3>
              <p>You arrive as a guest, you leave as family.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ ABOUT SECTION ============ */}
      <section className="about-section">
        <div className="container about-grid">
          <div className="about-text">
            <p className="section-tag">— எங்கள் கதை · OUR STORY —</p>
            <h2>A taste of <span className="italic">paati's kitchen.</span></h2>
            <p>
              Chella Vengadam's Kitchen began on a quiet street in Vellore — the fort city
              that has stood watch over Tamil Nadu for four centuries. We carry that same
              steadiness into every dish, from the curry leaves crackling in hot oil to
              the ghee melting over hot pongal.
            </p>
            <p>
              Whether you crave a quick filter coffee and idli or a slow Sunday Chettinad mutton,
              we've kept the soul of every recipe intact while serving it in a space that
              feels both familiar and special.
            </p>
            <Link to="/about" className="btn btn-ghost">
              Read our story →
            </Link>
          </div>
          <div className="about-visual">
            <div className="visual-card visual-card-1">
              <span className="visual-emoji">🍛</span>
              <p className="visual-tamil">செட்டிநாடு</p>
              <p>Chettinad Special</p>
            </div>
            <div className="visual-card visual-card-2">
              <span className="visual-emoji">☕</span>
              <p className="visual-tamil">டிகிரி காப்பி</p>
              <p>Filter Coffee</p>
            </div>
            <div className="visual-card visual-card-3">
              <span className="visual-emoji">🥥</span>
              <p className="visual-tamil">கடற்கரை சுவை</p>
              <p>Coastal Curries</p>
            </div>
            <div className="visual-card visual-card-4">
              <span className="visual-emoji">🍮</span>
              <p className="visual-tamil">பாயசம்</p>
              <p>Payasam</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CTA SECTION ============ */}
      <section className="cta-section">
        <div className="container cta-content">
          <p className="section-tag light">— வாங்க, சாப்பிடுவோம் · COME, LET'S EAT —</p>
          <h2 className="cta-heading">Hungry yet?</h2>
          <p className="cta-subtitle">
            Browse the full menu or book a table for a memorable evening.
          </p>
          <div className="hero-buttons">
            <Link to="/menu" className="btn btn-primary">View Menu</Link>
            <Link to="/reserve" className="btn btn-secondary">Reserve Table</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;