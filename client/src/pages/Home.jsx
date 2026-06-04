import React, { useEffect } from "react";
import gsap from "gsap";
import {
  ShieldCheck,
  Timer,
  BatteryCharging,
  Activity,
  Cpu,
} from "lucide-react";
import { ThreeCanvas } from "../components/ThreeCanvas";

export const Home = () => {
  useEffect(() => {
    // Scroll animations using IntersectionObserver & GSAP
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target.classList.contains("spec-item")) {
            gsap.from(entry.target, {
              x: -50,
              opacity: 0,
              duration: 0.8,
              ease: "power2.out",
            });
          } else if (entry.target.classList.contains("testimonial-card")) {
            gsap.from(entry.target, {
              y: 50,
              opacity: 0,
              duration: 1,
              ease: "power3.out",
            });
          }
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const animatedElements = document.querySelectorAll(
      ".spec-item, .testimonial-card",
    );
    animatedElements.forEach((el) => observer.observe(el));

    return () => {
      animatedElements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, []);

  const handleReserveSubmit = (e) => {
    e.preventDefault();
    alert(
      "Thank you! You have been added to the CarePlus early access waitlist.",
    );
  };

  return (
    <>
      <section className="hero" id="hero">
        <ThreeCanvas />
        <div className="hero-content">
          <h1 className="hero-title" id="mega-title">
            CAREPLUS
          </h1>
          <p className="hero-subtitle">YOUR INTELLIGENT HEALTH COMPANION</p>
        </div>
      </section>

      <section className="editorial-statement" id="vision">
        <div className="statement-container">
          <h2 className="massive-text">HEALTHCARE, REIMAGINED.</h2>
          <div className="statement-content">
            <p className="lead">
              CarePlus is a fundamental shift in how we approach personal
              well-being.
            </p>
            <p className="secondary-text">
              By blending advanced biometric sentiment analysis with a friendly,
              always-available robotic companion interface, we bridge the gap
              between cold clinical data and warm emotional support.
            </p>
          </div>
        </div>
      </section>

      <section className="how-it-works" id="platform">
        <div className="hiw-header">
          <span className="section-badge">The Mechanism</span>
          <h2 className="section-title-dark">
            How CarePlus Integrates Into Your Life
          </h2>
        </div>

        <div className="hiw-grid">
          <div className="hiw-step">
            <div className="step-number">01</div>
            <div className="step-content">
              <h3>Intake Monitoring</h3>
              <p>
                The local agent automatically checks scheduled medicine times
                and prompts the patient for verbal confirmation, logging status
                directly to the SQLite ledger.
              </p>
            </div>
          </div>
          <div className="hiw-step">
            <div className="step-number">02</div>
            <div className="step-content">
              <h3>Wellness Analysis</h3>
              <p>
                The AI engine parses daily conversations to extract patient mood
                trends and intensity, reporting fluctuations directly to
                guardians and physicians.
              </p>
            </div>
          </div>
          <div className="hiw-step">
            <div className="step-number">03</div>
            <div className="step-content">
              <h3>Alert Generation</h3>
              <p>
                The system automatically detects missed doses or negative mood
                anomalies, immediately triggering visual alerts on the doctor
                and guardian dashboards.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="tech-specs" id="specs">
        <div className="specs-container">
          <div className="specs-header">
            <span className="section-badge">The Intelligence</span>
            <h2 className="section-title-dark">Technical Specifications</h2>
          </div>
          <div className="specs-grid">
            <div className="spec-item">
              <span className="spec-label">Neural Engine</span>
              <span className="spec-value">Gemma-4-E2B-it (Local Ollama)</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Speech Synthesis</span>
              <span className="spec-value">
                Piper TTS (Nepali Chitwan Model)
              </span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Local Database</span>
              <span className="spec-value">
                SQLite (Offline-First Medicine & Object Ledger)
              </span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Communication</span>
              <span className="spec-value">
                WebSocket Streaming (Real-Time Voice/Chat)
              </span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Privacy Model</span>
              <span className="spec-value">
                100% On-Device Offline Processing
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="bento-features">
        <div className="bento-grid">
          {/* Item 1: Large (2x2) */}
          <div className="bento-item bento-large bento-dark">
            <div className="bento-icon">
              <Activity size={32} />
            </div>
            <div>
              <h3>Cross Linkage</h3>
              <p>
                Real-time synchronization of patient chats, mood analyses, and
                medicine intake logs directly to the physician's clinical
                portal.
              </p>
            </div>
          </div>

          {/* Item 2: Medium (2x1) */}
          <div className="bento-item bento-medium bento-accent">
            <div className="bento-icon">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h3>Privacy Focused</h3>
              <p>
                Localized offline database storage and zero cloud transmission
                for personal conversations and medical diaries.
              </p>
            </div>
          </div>

          {/* Item 3: Small (1x1) */}
          <div className="bento-item bento-light">
            <div className="bento-icon">
              <Timer size={32} />
            </div>
            <div>
              <h3>Loneliness companion</h3>
              <p>Continuous local WebSocket streaming.</p>
            </div>
          </div>

          {/* Item 4: Small (1x1) */}
          <div className="bento-item bento-accent">
            <div className="bento-icon">
              <BatteryCharging size={32} />
            </div>
            <div>
              <h3>Background Syncronization</h3>
              <p>Application and robot connection through background syncing</p>
            </div>
          </div>

          {/* Item 5: Wide (4x1) */}
          <div className="bento-item bento-wide">
            <div className="bento-image-placeholder"></div>
            <div className="bento-content-inline">
              <h3>Health Ledger</h3>
              <p>
                Consolidates medical schedules, daily mood records, conversation
                histories, and reminders for lost household objects in a unified
                registry.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="testimonials" id="stories">
        <div className="testimonials-header">
          <span className="section-badge">Success Stories</span>
          <h2 className="section-title-dark">Real Stories of Care</h2>
        </div>
        <div className="testimonials-slider">
          <div className="testimonial-card">
            <p className="quote">
              "CarePlus didn't just track my heart rate; it knew I was stressed
              before I did. It prompted me to take a breather, and likely saved
              me from burnout."
            </p>
            <div className="author">
              <span className="name">Sarah J.</span>
              <span className="role">Software Architect</span>
            </div>
          </div>
          <div className="testimonial-card">
            <p className="quote">
              "The transition from my smart watch data to a full medical triage
              was seamless. It's like having a doctor in my pocket who actually
              cares."
            </p>
            <div className="author">
              <span className="name">Marcus T.</span>
              <span className="role">Professional Athlete</span>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-premium" id="contact">
        <div className="cta-content">
          <h2>Ready to step into the future of care?</h2>
          <p>Join the waitlist to secure your early access companion device.</p>
          <form className="cta-form" onSubmit={handleReserveSubmit}>
            <input
              className="styled-input"
              type="email"
              placeholder="Enter your email address"
              required
            />
            <button type="submit" className="cta-btn-dark">
              Reserve Now
            </button>
          </form>
        </div>
      </section>
    </>
  );
};
