export const HomeView = () => `
      <section class="hero" id="hero">
        <div class="hero-content">
          <h1 class="hero-title" id="mega-title">CAREPLUS</h1>
          <p class="hero-subtitle">YOUR INTELLIGENT HEALTH COMPANION</p>
        </div>
      </section>

      <section class="editorial-statement" id="vision">
        <div class="statement-container">
          <h2 class="massive-text">HEALTHCARE, REIMAGINED.</h2>
          <div class="statement-content">
            <p class="lead">
              CarePlus is a fundamental shift in how we approach personal
              well-being.
            </p>
            <p class="secondary-text">
              By blending advanced biometric sentiment analysis with a friendly,
              always-available robotic companion interface, we bridge the gap
              between cold clinical data and warm emotional support.
            </p>
          </div>
        </div>
      </section>

      <section class="how-it-works" id="platform">
        <div class="hiw-header">
          <span class="section-badge">The Mechanism</span>
          <h2 class="section-title-dark">
            How CarePlus Integrates Into Your Life
          </h2>
        </div>

        <div class="hiw-grid">
          <div class="hiw-step">
            <div class="step-number">01</div>
            <div class="step-content">
              <h3>Continuous Sync</h3>
              <p>
                Your companion passively connects with your smart
                devices—watches, rings, and scales—aggregating health metrics
                securely in the background without manual entry.
              </p>
            </div>
          </div>
          <div class="hiw-step">
            <div class="step-number">02</div>
            <div class="step-content">
              <h3>Sentient Analysis</h3>
              <p>
                Our proprietary engine understands trends, correlates your heart
                rate variability with your reported mood, and predicts potential
                health dips before they happen.
              </p>
            </div>
          </div>
          <div class="hiw-step">
            <div class="step-number">03</div>
            <div class="step-content">
              <h3>Proactive Care</h3>
              <p>
                Instead of waiting for you to ask, CarePlus initiates check-ins
                when anomalies are detected, offering immediate triage or
                scaling to a human specialist.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="tech-specs" id="specs">
        <div class="specs-container">
          <div class="specs-header">
            <span class="section-badge">The Intelligence</span>
            <h2 class="section-title-dark">Technical Specifications</h2>
          </div>
          <div class="specs-grid">
            <div class="spec-item">
              <span class="spec-label">Neural Engine</span>
              <span class="spec-value">Aura-7 Biometric Processor</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Connectivity</span>
              <span class="spec-value">6G Ultra-Low Latency</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Privacy</span>
              <span class="spec-value">On-Device Zero-Knowledge Encryption</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Battery Life</span>
              <span class="spec-value">14-Day Kinetic Recharge</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Material</span>
              <span class="spec-value">Bio-Compatible Aerospace Grade Ceramic</span>
            </div>
          </div>
        </div>
      </section>

      <section class="bento-features">
        <div class="bento-grid">
          <div class="bento-item bento-large bento-dark">
            <h3>Deep Medical Triage</h3>
            <p>
              Powered by clinically validated algorithms, bypassing standard
              waitlists for severe symptoms with direct physician linkage.
            </p>
          </div>
          <div class="bento-item bento-accent">
            <div class="bento-icon"><i data-lucide="shield-check"></i></div>
            <h3>Privacy First</h3>
            <p>End-to-end encrypted health ledgers.</p>
          </div>
          <div class="bento-item bento-light">
            <div class="bento-icon"><i data-lucide="timer"></i></div>
            <h3>24/7 Availability</h3>
            <p>Unlike human clinics, your companion never sleeps.</p>
          </div>
          <div class="bento-item bento-wide">
            <div class="bento-image-placeholder"></div>
            <div class="bento-content-inline">
              <h3>Seamless Ecosystem Integration</h3>
              <p>
                Connects with Apple Health, Google Fit, Oura, and all major
                hospital EMR systems to create a unified medical record.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="testimonials" id="stories">
        <div class="testimonials-header">
          <span class="section-badge">Success Stories</span>
          <h2 class="section-title-dark">Real Stories of Care</h2>
        </div>
        <div class="testimonials-slider">
          <div class="testimonial-card">
            <p class="quote">"CarePlus didn't just track my heart rate; it knew I was stressed before I did. It prompted me to take a breather, and likely saved me from burnout."</p>
            <div class="author">
              <span class="name">Sarah J.</span>
              <span class="role">Software Architect</span>
            </div>
          </div>
          <div class="testimonial-card">
            <p class="quote">"The transition from my smart watch data to a full medical triage was seamless. It's like having a doctor in my pocket who actually cares."</p>
            <div class="author">
              <span class="name">Marcus T.</span>
              <span class="role">Professional Athlete</span>
            </div>
          </div>
        </div>
      </section>

      <section class="cta-premium" id="contact">
        <div class="cta-content">
          <h2>Ready to step into the future of care?</h2>
          <p>Join the waitlist to secure your early access companion device.</p>
          <form class="cta-form">
            <input
              class="styled-input"
              type="email"
              placeholder="Enter your email address"
              required
            />
            <button type="submit" class="cta-btn-dark">Reserve Now</button>
          </form>
        </div>
      </section>
`;
