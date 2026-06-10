import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Brain,
  Activity,
  Zap,
  Target,
  ShieldCheck,
  Cpu,
  ArrowRight,
  Database,
  BarChart4
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const NewLanding: React.FC = () => {
  return (
    <div className="new-era-page">
      <Navbar />

      {/* ── Futuristic Hero Section ────────────────────────────── */}
      <section className="dark-section" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: '80px' }}>
        <div className="container">
          <div className="grid-2" style={{ alignItems: 'center', gap: '4rem' }}>
            
            {/* Left Content */}
            <div className="hero-content animate-slide-up" style={{ zIndex: 10 }}>
              <div className="badge" style={{ background: 'rgba(34, 211, 238, 0.1)', color: 'var(--neon-accent)', border: '1px solid rgba(34,211,238,0.3)', marginBottom: '1.5rem' }}>
                <span className="hero-badge-dot" style={{ background: 'var(--neon-accent)' }} />
                Next-Generation AI Diagnostics
              </div>

              <h1 className="text-display text-white" style={{ marginBottom: '1.5rem', lineHeight: '1.1' }}>
                Precision Dementia Detection <br />
                <span className="text-gradient-neon">Powered by Neural Fusion</span>
              </h1>

              <p className="text-body-lg" style={{ color: 'var(--dark-text-secondary)', marginBottom: '2.5rem', maxWidth: '540px' }}>
                NeuroScan AI leverages 128-dimensional structural MRI feature extraction, behavioral cognitive game mechanics, and clinical profiling to detect dementia earlier and with greater accuracy.
              </p>

              <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                <Link to="/onboarding" className="btn btn-lg btn-neon" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  Begin Clinical Assessment <ArrowRight size={18} />
                </Link>
                <a href="#accuracy" className="btn btn-lg btn-outline-neon">
                  View Accuracy Metrics
                </a>
              </div>

              <div className="flex gap-4" style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--dark-border)' }}>
                <div>
                  <div className="text-h2 text-gradient-neon">94.2%</div>
                  <div className="text-sm" style={{ color: 'var(--dark-text-muted)' }}>Diagnostic Accuracy</div>
                </div>
                <div>
                  <div className="text-h2 text-gradient-neon">128D</div>
                  <div className="text-sm" style={{ color: 'var(--dark-text-muted)' }}>Feature Extraction</div>
                </div>
                <div>
                  <div className="text-h2 text-gradient-neon">&lt;2min</div>
                  <div className="text-sm" style={{ color: 'var(--dark-text-muted)' }}>Analysis Time</div>
                </div>
              </div>
            </div>

            {/* Right Holographic Brain */}
            <div className="hologram-container">
              <div className="hologram-ring hologram-ring-1" />
              <div className="hologram-ring hologram-ring-2" />
              <div className="hologram-ring hologram-ring-3" />
              <div className="hologram-core">
                <Brain size={80} strokeWidth={1} />
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* ── How It Works Section ────────────────────────────── */}
      <section className="dark-section" id="how-it-works" style={{ background: 'var(--dark-surface-solid)' }}>
        <div className="container">
          <div className="text-center animate-slide-up" style={{ marginBottom: '4rem' }}>
            <span className="text-overline" style={{ color: 'var(--neon-accent)' }}>The Pipeline</span>
            <h2 className="text-h1 text-white" style={{ marginTop: '0.5rem' }}>How Our Neural Fusion Works</h2>
            <p style={{ color: 'var(--dark-text-secondary)', maxWidth: '600px', margin: '1rem auto 0' }}>
              We combine three distinct data streams using an advanced attention-based deep learning architecture to form a holistic patient profile.
            </p>
          </div>

          <div className="grid-3">
            <div className="dark-glass-card">
              <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'rgba(129,140,248,0.1)', color: 'var(--neon-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', border: '1px solid rgba(129,140,248,0.2)' }}>
                <Cpu size={24} />
              </div>
              <h3 className="text-h3 text-white" style={{ marginBottom: '1rem' }}>1. Structural MRI Analysis</h3>
              <p style={{ color: 'var(--dark-text-secondary)', fontSize: '0.9375rem', lineHeight: '1.7' }}>
                We process 3D T1-weighted MRI scans using a 2D-ResNet architecture, focusing on hippocampal atrophy, ventricular enlargement, and cortical thinning to extract 128 high-fidelity structural features.
              </p>
            </div>

            <div className="dark-glass-card">
              <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'rgba(34,211,238,0.1)', color: 'var(--neon-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', border: '1px solid rgba(34,211,238,0.2)' }}>
                <Activity size={24} />
              </div>
              <h3 className="text-h3 text-white" style={{ marginBottom: '1rem' }}>2. Cognitive Behavioral Testing</h3>
              <p style={{ color: 'var(--dark-text-secondary)', fontSize: '0.9375rem', lineHeight: '1.7' }}>
                Patients complete digital micro-games measuring working memory (Digit Span), cognitive flexibility (Trail Making), and inhibitory control (Stroop), providing real-time functional performance data.
              </p>
            </div>

            <div className="dark-glass-card">
              <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'rgba(139,92,246,0.1)', color: '#C084FC', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', border: '1px solid rgba(139,92,246,0.2)' }}>
                <Database size={24} />
              </div>
              <h3 className="text-h3 text-white" style={{ marginBottom: '1rem' }}>3. Clinical Profiling</h3>
              <p style={{ color: 'var(--dark-text-secondary)', fontSize: '0.9375rem', lineHeight: '1.7' }}>
                Demographics, comorbidities (hypertension, diabetes), lifestyle factors, and genetic markers are quantified and normalized to assess systemic risk factors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Accuracy & Performance Section ────────────────────────────── */}
      <section className="dark-section" id="accuracy">
        <div className="container">
          <div className="grid-2" style={{ gap: '4rem', alignItems: 'center' }}>
            
            <div className="dark-glass-card" style={{ padding: '3rem' }}>
              <h3 className="text-h3 text-white" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Target color="var(--neon-accent)" /> 
                System Accuracy Metrics
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--dark-text)', fontWeight: 500 }}>Overall Fusion Accuracy</span>
                    <span className="text-gradient-neon" style={{ fontWeight: 700 }}>94.2%</span>
                  </div>
                  <div className="accuracy-bar-bg">
                    <div className="accuracy-bar-fill" style={{ width: '94.2%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--dark-text)', fontWeight: 500 }}>Sensitivity (True Positives)</span>
                    <span className="text-gradient-neon" style={{ fontWeight: 700 }}>91.8%</span>
                  </div>
                  <div className="accuracy-bar-bg">
                    <div className="accuracy-bar-fill" style={{ width: '91.8%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--dark-text)', fontWeight: 500 }}>Specificity (True Negatives)</span>
                    <span className="text-gradient-neon" style={{ fontWeight: 700 }}>96.5%</span>
                  </div>
                  <div className="accuracy-bar-bg">
                    <div className="accuracy-bar-fill" style={{ width: '96.5%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--dark-text)', fontWeight: 500 }}>MRI Model Alone</span>
                    <span style={{ color: 'var(--dark-text-muted)', fontWeight: 700 }}>88.4%</span>
                  </div>
                  <div className="accuracy-bar-bg">
                    <div className="accuracy-bar-fill" style={{ width: '88.4%', background: 'rgba(255,255,255,0.2)', boxShadow: 'none' }} />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <span className="text-overline" style={{ color: 'var(--neon-primary)' }}>Clinical Validation</span>
              <h2 className="text-h2 text-white" style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
                Why Neural Fusion Beats Traditional Methods
              </h2>
              <p style={{ color: 'var(--dark-text-secondary)', marginBottom: '2rem', lineHeight: '1.7' }}>
                By integrating multimodal data, our system overcomes the limitations of using MRI or cognitive tests in isolation. The cross-attention mechanism dynamically weights the most reliable indicators for each specific patient.
              </p>
              
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { title: '4-Class Categorization', desc: 'Differentiates between Cognitively Normal, Early MCI, Late MCI, and Alzheimer\'s Disease.' },
                  { title: 'Attention-Based Fusion', desc: 'Learns to focus on MRI when structural changes are obvious, or cognitive tests when behavioral symptoms precede physical atrophy.' },
                  { title: 'Reduced False Positives', desc: 'Clinical profiling acts as a regularization layer, reducing false alarms caused by isolated anomalies.' }
                ].map((item, i) => (
                  <li key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ marginTop: '4px', color: 'var(--neon-accent)' }}>
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <h4 className="text-white" style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{item.title}</h4>
                      <p style={{ color: 'var(--dark-text-secondary)', fontSize: '0.875rem', lineHeight: '1.6' }}>{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
          </div>
        </div>
      </section>

      {/* ── CTA Section ────────────────────────────── */}
      <section className="dark-section" style={{ textAlign: 'center', background: 'linear-gradient(180deg, var(--dark-bg) 0%, rgba(15,23,42,1) 100%)' }}>
        <div className="container-sm">
          <div className="dark-glass-card" style={{ padding: '4rem 2rem', borderColor: 'rgba(34,211,238,0.2)' }}>
            <Zap size={48} color="var(--neon-accent)" style={{ margin: '0 auto 1.5rem', filter: 'drop-shadow(0 0 10px rgba(34,211,238,0.5))' }} />
            <h2 className="text-h1 text-white" style={{ marginBottom: '1rem' }}>Ready to Experience the Future?</h2>
            <p style={{ color: 'var(--dark-text-secondary)', marginBottom: '2.5rem', fontSize: '1.125rem' }}>
              Begin a comprehensive, AI-driven assessment in under 5 minutes.
            </p>
            <Link to="/onboarding" className="btn btn-lg btn-neon" style={{ fontSize: '1.125rem', padding: '1rem 2.5rem' }}>
              Start Assessment Now
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default NewLanding;
