import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="footer dark-footer">
      <div className="container">
        <div className="footer-inner">
          <div className="footer-brand">
            <Link to="/" className="navbar-logo" style={{ marginBottom: '0.5rem' }}>
              <div className="navbar-logo-icon" style={{ width: 32, height: 32 }}>
                <Brain size={16} />
              </div>
              <span>Neuro<span className="text-gradient">Scan</span></span>
            </Link>
            <p>
              AI-powered multimodal early dementia detection combining brain imaging,
              cognitive assessments, and clinical profiling for accurate risk evaluation.
            </p>
          </div>

          <div className="footer-links-group">
            <h4>Platform</h4>
            <Link to="/onboarding">Start Assessment</Link>
            <a href="#features">Features</a>
            <a href="#how-it-works">Methodology</a>
          </div>

          <div className="footer-links-group">
            <h4>Science</h4>
            <a href="#features">MRI Analysis</a>
            <a href="#features">Cognitive Tests</a>
            <a href="#features">Clinical Profiling</a>
          </div>

          <div className="footer-links-group">
            <h4>Resources</h4>
            <a href="#">Documentation</a>
            <a href="#">Research Papers</a>
            <a href="#">API Reference</a>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 NeuroScan AI. All rights reserved.</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            Built with <Heart size={14} style={{ color: 'var(--danger)' }} /> for early detection
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
