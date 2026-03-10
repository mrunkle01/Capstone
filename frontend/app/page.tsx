import Link from "next/link";
import { Playfair_Display, DM_Sans } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-sans",
});

export default function Home() {
  return (
    <div className={`lp-page ${playfair.variable} ${dmSans.variable}`}>
      <nav className="lp-nav">
        <div className="lp-logo">Atelier<span>.</span></div>
        <ul className="lp-nav-links">
          <li><a href="#how-it-works">How It Works</a></li>
          <li><a href="#how-it-works">Curriculum</a></li>
          <li><Link href="/login" className="lp-btn-outline">Sign In</Link></li>
        </ul>
      </nav>

      <section className="lp-hero">
        <div className="lp-hero-left">
          <p className="lp-eyebrow">Adaptive Foundation Training</p>

          <h1 className="lp-h1">
            The Art of<br /><em>Drawing.</em>
          </h1>

          <p className="lp-hero-desc">
            A personalized, AI-powered curriculum that meets you where you are.
            Master line control, form, shading, and perspective at your pace,
            toward your goals.
          </p>

          <div className="lp-meta-row">
            <div className="lp-meta-item">
              <label>Format</label>
              <span>Self-paced daily practice</span>
            </div>
            <div className="lp-meta-item">
              <label>Prerequisites</label>
              <span>None required</span>
            </div>
          </div>

          <div className="lp-cta-row">
            <Link href="/register" className="lp-btn-primary">Begin Assessment</Link>
            <a href="#how-it-works" className="lp-btn-ghost">See how it works</a>
          </div>
        </div>

        <div className="lp-hero-right">
          <div className="lp-card-stack">
            <div className="lp-card">
              <div className="lp-card-tabs">
                <div className="lp-card-tab active"></div>
                <div className="lp-card-tab"></div>
                <div className="lp-card-tab"></div>
              </div>
              <span className="lp-card-badge">Section 01</span>
              <div className="lp-card-number">01</div>
              <div className="lp-card-title">Form &amp; Value.</div>
              <div className="lp-card-subtitle">Master the behavior of light on foundational geometric solids.</div>
            </div>
          </div>
        </div>
      </section>

      <div className="lp-features" id="how-it-works">
        <div className="lp-feature">
          <span className="lp-feature-num">i.</span>
          <h3>A curriculum built for you.</h3>
          <p>Tell us your goals and experience. Atelier builds a structured lesson plan around your style, not a generic one-size-fits-all track.</p>
        </div>
        <div className="lp-feature">
          <span className="lp-feature-num">ii.</span>
          <h3>AI that sees your work.</h3>
          <p>Submit drawings at each stage. A vision model grades your actual technique: composition, line, form, and value, then adapts what comes next.</p>
        </div>
        <div className="lp-feature">
          <span className="lp-feature-num">iii.</span>
          <h3>Earn every lesson.</h3>
          <p>Sections unlock in sequence. You can request changes through the AI tutor, but the curriculum enforces the foundations that matter.</p>
        </div>
      </div>
    </div>
  );
}
