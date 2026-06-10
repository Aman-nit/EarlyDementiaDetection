import React from 'react';
import { Link } from 'react-router-dom';
import {
  Brain,
  Scan,
  Gamepad2,
  ClipboardList,
  ArrowRight,
  UserPlus,
  Upload,
  BarChart3,
  Sparkles,
  Shield,
  Zap,
  Activity
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Landing: React.FC = () => {
  return (
    <>
      <Navbar />

      {/* ── Hero Section ────────────────────────────── */}
      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-content animate-slide-up">
              <div className="hero-badge">
                <span className="hero-badge-dot" />
                AI-Powered Medical Diagnostics
              </div>

              <h1 className="text-display hero-title">
                Detect Dementia <br />
                <span className="text-gradient">Before It's Too Late</span>
              </h1>

              <p className="hero-subtitle">
                NeuroScan AI combines advanced brain imaging analysis, scientifically-backed
                cognitive assessments, and comprehensive clinical profiling to deliver
                early, accurate dementia risk evaluation.
              </p>

              <div className="hero-buttons">
                <Link to="/onboarding" className="btn btn-primary btn-lg">
                  Begin Assessment <ArrowRight size={18} />
                </Link>
                <a href="#how-it-works" className="btn btn-outline btn-lg">
                  Learn How It Works
                </a>
              </div>

              <div className="hero-stats">
                <div>
                  <div className="hero-stat-value text-gradient">4</div>
                  <div className="hero-stat-label">Impairment Levels</div>
                </div>
                <div>
                  <div className="hero-stat-value text-gradient">3</div>
                  <div className="hero-stat-label">Cognitive Tests</div>
                </div>
                <div>
                  <div className="hero-stat-value text-gradient">15+</div>
                  <div className="hero-stat-label">Risk Factors</div>
                </div>
                <div>
                  <div className="hero-stat-value text-gradient">128D</div>
                  <div className="hero-stat-label">Feature Extraction</div>
                </div>
              </div>
            </div>

            <div className="hero-visual animate-fade-in">
              <div className="brain-viz">
                <div className="brain-ring" />
                <div className="brain-ring" />
                <div className="brain-ring" />
                <div className="brain-core">
                  <Brain size={48} />
                </div>
                <div className="brain-node" />
                <div className="brain-node" />
                <div className="brain-node" />
                <div className="brain-node" />
                <div className="brain-node" />
                <div className="brain-node" />
                <div className="brain-node" />
                <div className="brain-node" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Section ────────────────────────── */}
      <section className="section" id="features" style={{ background: 'var(--surface)' }}>
        <div className="container">
          <div className="section-header animate-slide-up">
            <span className="text-overline">Multimodal Intelligence</span>
            <h2 className="text-h1">Three Pillars of Detection</h2>
            <p>
              Our system fuses structural brain imaging, functional cognitive testing,
              and clinical risk markers through an attention-based AI engine for
              unparalleled diagnostic accuracy.
            </p>
          </div>

          <div className="grid-3">
            <div className="card animate-slide-up-delay-1">
              <div className="feature-icon feature-icon-purple">
                <Scan size={28} />
              </div>
              <h3 className="text-h3" style={{ marginBottom: '0.75rem' }}>MRI Brain Analysis</h3>
              <p className="text-secondary" style={{ lineHeight: 1.7 }}>
                Deep learning powered 2D-ResNet analyzes structural brain MRI scans to identify
                hippocampal atrophy, ventricular enlargement, and cortical thinning patterns
                with 128-dimensional feature extraction.
              </p>
              <div className="feature-tag">ResNet • MONAI • PyTorch</div>
            </div>

            <div className="card animate-slide-up-delay-2">
              <div className="feature-icon feature-icon-cyan">
                <Gamepad2 size={28} />
              </div>
              <h3 className="text-h3" style={{ marginBottom: '0.75rem' }}>Cognitive Game Suite</h3>
              <p className="text-secondary" style={{ lineHeight: 1.7 }}>
                Three scientifically-validated interactive games measuring working memory,
                cognitive flexibility, and inhibitory control — derived from the Digit Span,
                Trail Making, and Stroop tests.
              </p>
              <div className="feature-tag">Memory • Flexibility • Control</div>
            </div>

            <div className="card animate-slide-up-delay-3">
              <div className="feature-icon feature-icon-amber">
                <ClipboardList size={28} />
              </div>
              <h3 className="text-h3" style={{ marginBottom: '0.75rem' }}>Clinical Risk Profiling</h3>
              <p className="text-secondary" style={{ lineHeight: 1.7 }}>
                Comprehensive analysis of demographics, comorbidities (hypertension, diabetes,
                heart disease), lifestyle factors, and genetic markers (APOE-ε4)
                for holistic risk evaluation.
              </p>
              <div className="feature-tag">15+ Clinical Markers</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────── */}
      <section className="section" id="how-it-works">
        <div className="container">
          <div className="section-header">
            <span className="text-overline">Assessment Pipeline</span>
            <h2 className="text-h1">How It Works</h2>
            <p>
              A streamlined four-step process from clinical intake to comprehensive
              AI-powered risk assessment.
            </p>
          </div>

          <div className="steps-row">
            {[
              { num: '01', icon: <UserPlus size={24} />, title: 'Clinical Intake', desc: 'Complete your medical profile with demographics, health history, and lifestyle information.' },
              { num: '02', icon: <Gamepad2 size={24} />, title: 'Cognitive Tests', desc: 'Play three scientifically-designed games that assess key cognitive domains.' },
              { num: '03', icon: <Upload size={24} />, title: 'MRI Upload', desc: 'Upload brain MRI scan for AI-powered structural analysis and feature extraction.' },
              { num: '04', icon: <BarChart3 size={24} />, title: 'Risk Report', desc: 'Receive a comprehensive fusion-analyzed risk assessment with clinical reasoning.' },
            ].map((step, i) => (
              <div className="step-card" key={i}>
                <div
                  className="step-number"
                  style={{
                    background: 'var(--gradient-primary)',
                    color: 'white',
                    boxShadow: 'var(--shadow-primary)',
                  }}
                >
                  {step.icon}
                </div>
                <h3 className="text-h3" style={{ marginBottom: '0.5rem' }}>{step.title}</h3>
                <p className="text-sm text-secondary">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Section ───────────────────────────── */}
      <section className="section-sm">
        <div className="container">
          <div className="stats-bar">
            <div className="grid-4">
              {[
                { icon: <Shield size={24} />, value: '4-Class', label: 'Classification Precision', color: 'var(--primary)' },
                { icon: <Zap size={24} />, value: 'Attention', label: 'Fusion Mechanism', color: 'var(--accent)' },
                { icon: <Activity size={24} />, value: 'Real-time', label: 'Risk Assessment', color: 'var(--success)' },
                { icon: <Sparkles size={24} />, value: 'Multimodal', label: 'Data Integration', color: 'var(--warning)' },
              ].map((stat, i) => (
                <div className="stat-item" key={i}>
                  <div className="flex-center" style={{ marginBottom: '0.5rem', color: stat.color }}>
                    {stat.icon}
                  </div>
                  <div className="stat-value text-gradient">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Section ─────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="cta-section">
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 className="text-h1 text-white" style={{ marginBottom: '1rem' }}>
                Ready for Early Detection?
              </h2>
              <p className="text-body-lg" style={{ color: 'rgba(255,255,255,0.8)', maxWidth: 560, margin: '0 auto 2rem' }}>
                Start the comprehensive assessment today. Early detection is the most
                powerful tool in the fight against dementia.
              </p>
              <Link to="/onboarding" className="btn btn-lg" style={{ background: 'white', color: 'var(--primary-dark)', fontWeight: 700, boxShadow: 'var(--shadow-xl)' }}>
                Begin Free Assessment <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Landing;
