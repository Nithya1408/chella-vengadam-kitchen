import { Link } from 'react-router-dom';
import './AboutPage.css';

function AboutPage() {
  return (
    <div className="about-page">
      {/* ============ HERO ============ */}
      <section className="about-hero">
        <div className="about-hero-shapes">
          <div className="ah-shape ah-shape-1"></div>
          <div className="ah-shape ah-shape-2"></div>
        </div>
        <div className="container about-hero-content">
          <p className="ah-tag">— எங்கள் கதை · OUR STORY —</p>
          <h1>
            Three generations,<br />
            <span className="italic">one kitchen.</span>
          </h1>
          <p className="ah-subtitle">
            From a quiet street in Vellore to a place that feels like home —
            the story of how grandmother's recipes became a restaurant.
          </p>
        </div>
      </section>

      {/* ============ STORY ============ */}
      <section className="about-story">
        <div className="container story-grid">
          <div className="story-left">
            <p className="section-tag">— THE BEGINNING —</p>
            <h2>
              It started with a <span className="italic">single pot</span> of kuzhambu.
            </h2>
          </div>
          <div className="story-right">
            <p>
              In 1962, in a small Vellore home, our grandmother Lakshmi began cooking
              for the families on her street. Word spread quickly — her Chettinad mutton
              brought neighbours from three lanes over. Her payasam at festivals
              fed the whole community.
            </p>
            <p>
              Sixty years later, those same recipes — written in her looping handwriting,
              passed through her daughter to her grandchildren — became
              <strong> Chella Vengadam's Kitchen</strong>. We named it after
              grandfather, who first encouraged her to open a proper restaurant.
            </p>
            <p>
              Everything you taste here comes from that lineage. The curry leaves still
              crackle the same way in hot oil. The ghee still melts over hot pongal the
              way it did on Sunday mornings in our home. We've just made room for more
              guests at the table.
            </p>
          </div>
        </div>
      </section>

      {/* ============ VALUES STRIP ============ */}
      <section className="about-values">
        <div className="container">
          <p className="section-tag center">— எங்கள் நம்பிக்கைகள் · WHAT WE BELIEVE —</p>
          <h2 className="center-heading">
            Slow food, <span className="italic">honest hands.</span>
          </h2>

          <div className="values-grid">
            <div className="value-card">
              <span className="value-icon">🌿</span>
              <h3>Heirloom over trend</h3>
              <p>We cook recipes that took our grandmother decades to perfect. No fusion, no shortcuts — just food the way it was meant to be.</p>
            </div>
            <div className="value-card">
              <span className="value-icon">🪔</span>
              <h3>Time is the ingredient</h3>
              <p>Our kuzhambus simmer for hours. Our biryanis rest before they reach you. We refuse to rush flavour into existence.</p>
            </div>
            <div className="value-card">
              <span className="value-icon">🌾</span>
              <h3>From the land, to the plate</h3>
              <p>Curry leaves from the backyard. Coconut from the coast. Spices from Chettinad markets. Every ingredient has a place it belongs.</p>
            </div>
            <div className="value-card">
              <span className="value-icon">🌸</span>
              <h3>Guests become family</h3>
              <p>You came hungry — we'll send you home full and happy. That's the deal grandmother made with everyone who walked through her door.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TIMELINE ============ */}
      <section className="about-timeline">
        <div className="container">
          <p className="section-tag center">— எங்கள் பயணம் · THE JOURNEY —</p>
          <h2 className="center-heading">
            Sixty years of <span className="italic">slow growth.</span>
          </h2>

          <div className="timeline">
            <div className="timeline-item">
              <span className="timeline-year">1962</span>
              <div className="timeline-content">
                <h4>The first meal</h4>
                <p>Grandmother Lakshmi cooks her first Chettinad mutton kuzhambu for the neighbourhood. People come back. And bring others.</p>
              </div>
            </div>
            <div className="timeline-item">
              <span className="timeline-year">1985</span>
              <div className="timeline-content">
                <h4>The handwritten book</h4>
                <p>She writes down every recipe — over 200 of them — in a single notebook. Some pages still smell like the cardamom from her shelf.</p>
              </div>
            </div>
            <div className="timeline-item">
              <span className="timeline-year">2001</span>
              <div className="timeline-content">
                <h4>The next generation cooks</h4>
                <p>Her daughter Saraswathi begins recreating every dish, syllable for syllable. She makes one small change: a sweeter payasam.</p>
              </div>
            </div>
            <div className="timeline-item">
              <span className="timeline-year">2026</span>
              <div className="timeline-content">
                <h4>The doors open</h4>
                <p>Chella Vengadam's Kitchen welcomes its first guest in Vellore. The notebook sits in the kitchen office, still in use.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ VISIT US ============ */}
      <section className="about-visit">
        <div className="container visit-grid">
          <div className="visit-info">
            <p className="section-tag">— எங்கள் இடம் · COME FIND US —</p>
            <h2>Pay us a <span className="italic">visit.</span></h2>
            <p>We'd love to see you. Walk-ins are welcome — but if you want a quiet corner table, do book ahead.</p>

            <div className="visit-details">
              <div className="visit-detail-row">
                <span className="vd-icon">📍</span>
                <div>
                  <p className="vd-label">Address</p>
                  <p className="vd-value">
                    14, Bagayam Road<br />
                    Sathuvachari, Vellore<br />
                    Tamil Nadu 632009
                  </p>
                </div>
              </div>

              <div className="visit-detail-row">
                <span className="vd-icon">🕐</span>
                <div>
                  <p className="vd-label">Hours</p>
                  <p className="vd-value">
                    Lunch · 12:00 – 3:00 PM<br />
                    Dinner · 7:00 – 10:30 PM<br />
                    <span className="muted">Closed Tuesdays</span>
                  </p>
                </div>
              </div>

              <div className="visit-detail-row">
                <span className="vd-icon">📞</span>
                <div>
                  <p className="vd-label">Call us</p>
                  <p className="vd-value">+91 416 222 1962</p>
                </div>
              </div>

              <div className="visit-detail-row">
                <span className="vd-icon">✉️</span>
                <div>
                  <p className="vd-label">Email</p>
                  <p className="vd-value">hello@chellavengadam.in</p>
                </div>
              </div>
            </div>

            <div className="visit-actions">
              <Link to="/reserve" className="btn btn-primary">Reserve a Table 🌸</Link>
              <Link to="/menu" className="btn btn-secondary">See the Menu</Link>
            </div>
          </div>

          <div className="visit-visual">
            <div className="visit-card vc-1">
              <span className="vc-emoji">🌸</span>
              <p>Family-run since 1962</p>
            </div>
            <div className="visit-card vc-2">
              <span className="vc-emoji">🪔</span>
              <p>Slow-cooked traditions</p>
            </div>
            <div className="visit-card vc-3">
              <span className="vc-emoji">☕</span>
              <p>Filter coffee that hits</p>
            </div>
            <div className="visit-card vc-4">
              <span className="vc-emoji">📜</span>
              <p>200+ family recipes</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ QUOTE STRIP ============ */}
      <section className="about-quote">
        <div className="container">
          <span className="quote-mark">"</span>
          <p className="quote-text">
            <span className="italic">
              The best food is the food that someone remembers their grandmother making.
            </span>
          </p>
          <p className="quote-attribution">— grandmother Lakshmi, 1962</p>
        </div>
      </section>
    </div>
  );
}

export default AboutPage;