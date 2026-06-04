import React, { useEffect } from "react";
import gsap from "gsap";
import { ShieldCheck, Timer } from "lucide-react";
import { ThreeCanvas } from "../components/ThreeCanvas";

export const Home = () => {
  useEffect(() => {
    // Scroll animations using IntersectionObserver & GSAP
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target.classList.contains("spec-item")) {
            gsap.from(entry.target, { x: -50, opacity: 0, duration: 0.8, ease: "power2.out" });
          } else if (entry.target.classList.contains("testimonial-card")) {
            gsap.from(entry.target, { y: 50, opacity: 0, duration: 1, ease: "power3.out" });
          }
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const animatedElements = document.querySelectorAll(".spec-item, .testimonial-card");
    animatedElements.forEach((el) => observer.observe(el));

    return () => {
      animatedElements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, []);

  const handleReserveSubmit = (e) => {
    e.preventDefault();
    alert("Thank you! You have been added to the CarePlus early access waitlist.");
  };

  return (
    <>
      <section className="hero" id="hero">
        <ThreeCanvas />
        <div className="hero-content">
          <h1 className="hero-title" id="mega-title">CAREPLUS</h1>
          <p className="hero-subtitle">YOUR INTELLIGENT HEALTH COMPANION</p>
        </div>
      </section>

      <section className="editorial-statement" id="vision">
        <div className="statement-container">
          <h2 className="massive-text">HEALTHCARE, REIMAGINED.</h2>
          <div className="statement-content">
            <p className="lead">
              CarePlus is a fundamental shift in how we approach personal well-being.
            </p>
            <p className="secondary-text">
              By blending advanced biometric sentiment analysis with a friendly, always-available robotic companion interface, we bridge the gap between cold clinical data and warm emotional support.
            </p>
          </div>
        </div>
      </section>

      <section className="how-it-works" id="platform">
        <div className="hiw-header">
          <span className="section-badge">The Mechanism</span>
          <h2 className="section-title-dark">How CarePlus Integrates Into Your Life</h2>
        </div>

        <div className="hiw-grid">
          <div className="hiw-step">
            <div className="step-number">01</div>
            <div className="step-content">
              <h3>Continuous Sync</h3>
              <p>
                Your companion passively connects with your smart devices—watches, rings, and scales—aggregating health metrics securely in the background without manual entry.
              </p>
            </div>
          </div>
          <div className="hiw-step">
            <div className="step-number">02</div>
            <div className="step-content">
              <h3>Sentient Analysis</h3>
              <p>
                Our proprietary engine understands trends, correlates your heart rate variability with your reported mood, and predicts potential health dips before they happen.
              </p>
            </div>
          </div>
          <div className="hiw-step">
            <div className="step-number">03</div>
            <div className="step-content">
              <h3>Proactive Care</h3>
              <p>
                Instead of waiting for you to ask, CarePlus initiates check-ins when anomalies are detected, offering immediate triage or scaling to a human specialist.
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
              <span className="spec-value">Aura-7 Biometric Processor</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Connectivity</span>
              <span className="spec-value">6G Ultra-Low Latency</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Privacy</span>
              <span className="spec-value">On-Device Zero-Knowledge Encryption</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Battery Life</span>
              <span className="spec-value">14-Day Kinetic Recharge</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Material</span>
              <span className="spec-value">Bio-Compatible Aerospace Grade Ceramic</span>
            </div>
          </div>
        </div>
      </section>

      <section className="bento-features">
        <div className="bento-grid">
          <div className="bento-item bento-large bento-dark">
            <h3>Deep Medical Triage</h3>
            <p>
              Powered by clinically validated algorithms, bypassing standard waitlists for severe symptoms with direct physician linkage.
            </p>
          </div>
          <div className="bento-item bento-accent">
            <div className="bento-icon">
              <ShieldCheck size={32} />
            </div>
            <h3>Privacy First</h3>
            <p>End-to-end encrypted health ledgers.</p>
          </div>
          <div className="bento-item bento-light">
            <div className="bento-icon">
              <Timer size={32} />
            </div>
            <h3>24/7 Availability</h3>
            <p>Unlike human clinics, your companion never sleeps.</p>
          </div>
          <div className="bento-item bento-wide">
            <div className="bento-image-placeholder"></div>
            <div className="bento-content-inline">
              <h3>Seamless Ecosystem Integration</h3>
              <p>
                Connects with Apple Health, Google Fit, Oura, and all major hospital EMR systems to create a unified medical record.
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
              "CarePlus didn't just track my heart rate; it knew I was stressed before I did. It prompted me to take a breather, and likely saved me from burnout."
            </p>
            <div className="author">
              <span className="name">Sarah J.</span>
              <span className="role">Software Architect</span>
            </div>
          </div>
          <div className="testimonial-card">
            <p className="quote">
              "The transition from my smart watch data to a full medical triage was seamless. It's like having a doctor in my pocket who actually cares."
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
            <input className="styled-input" type="email" placeholder="Enter your email address" required />
            <button type="submit" className="cta-btn-dark">
              Reserve Now
            </button>
          </form>
        </div>
      </section>
    </>
  );
};
