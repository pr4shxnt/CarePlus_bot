import React from "react";
import { Smartphone, Bot, Monitor } from "lucide-react";

export const Download = () => {
  return (
    <section className="download-page">
      <div className="download-container">
        <div className="download-header">
          <span className="section-badge">The Experience</span>
          <h2 className="section-title-dark">Download CarePlus</h2>
          <p>Take your health companion with you, everywhere.</p>
        </div>

        <div className="download-grid">
          <div className="download-card">
            <div className="card-icon">
              <Smartphone size={32} />
            </div>
            <h3>iOS App</h3>
            <p>Optimized for iPhone and iPad with native health integration.</p>
            <a href="#" className="download-link">
              App Store
            </a>
          </div>
          <div className="download-card">
            <div className="card-icon">
              <Bot size={32} />
            </div>
            <h3>Android App</h3>
            <p>Compatible with all modern Android devices and wearables.</p>
            <a href="#" className="download-link">
              Google Play
            </a>
          </div>
          <div className="download-card">
            <div className="card-icon">
              <Monitor size={32} />
            </div>
            <h3>Desktop Hub</h3>
            <p>Advanced analytics and long-term trend visualization for Mac & PC.</p>
            <a href="#" className="download-link">
              Download for Desktop
            </a>
          </div>
        </div>

        <div className="coming-soon">
          <h3>Coming Soon: CarePlus Mirror</h3>
          <p>The first holographic health interface for your home.</p>
        </div>
      </div>
    </section>
  );
};
