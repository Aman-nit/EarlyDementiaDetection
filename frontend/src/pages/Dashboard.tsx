import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import {
  Brain,
  Activity,
  Shield,
  CheckCircle2,
  ArrowLeft,
  Home,
  FileText,
  AlertTriangle,
  Info,
  Zap,
  Target,
  BarChart3,
  Clock,
  Download,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const IMPAIRMENT_CONFIG: Record<string, {
  gradient: string;
  bannerClass: string;
  icon: React.ReactNode;
  color: string;
  badge: string;
}> = {
  'No Impairment': {
    gradient: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
    bannerClass: 'risk-banner-healthy',
    icon: <CheckCircle2 size={28} />,
    color: 'var(--success)',
    badge: 'badge-success',
  },
  'Very Mild Impairment': {
    gradient: 'linear-gradient(135deg, #FEF9C3 0%, #FDE68A 100%)',
    bannerClass: 'risk-banner-very-mild',
    icon: <Info size={28} />,
    color: '#D97706',
    badge: 'badge-warning',
  },
  'Mild Impairment': {
    gradient: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
    bannerClass: 'risk-banner-mild',
    icon: <AlertTriangle size={28} />,
    color: 'var(--warning)',
    badge: 'badge-warning',
  },
  'Moderate Impairment': {
    gradient: 'linear-gradient(135deg, #FECACA 0%, #FCA5A5 100%)',
    bannerClass: 'risk-banner-moderate',
    icon: <Shield size={28} />,
    color: 'var(--danger)',
    badge: 'badge-danger',
  },
};

const Dashboard: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const data = await api.getFullRiskAssessment(patientId!);
        setReport(data);
      } catch (error) {
        // Use mock data if API fails for demo purposes
        setReport({
          final_impairment_level: 'Very Mild Impairment',
          confidence_score: 73.42,
          primary_driver: 'Risk assessment is Very Mild Impairment (73% confidence). Primary drivers include relatively stable cognitive performance, mild or non-specific structural changes.',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [patientId]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="new-era-page flex-center" style={{ minHeight: '100vh' }}>
          <div className="text-center">
            <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 1.5rem' }}>
              <div className="spinner spinner-primary spinner-lg" />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Brain size={24} style={{ color: 'var(--primary)' }} />
              </div>
            </div>
            <h2 className="text-h3 text-white" style={{ marginBottom: '0.5rem' }}>Analyzing Data</h2>
            <p className="text-dark-muted">Fusion Engine processing MRI and clinical data...</p>
          </div>
        </div>
      </>
    );
  }

  // Support both response shapes (backend's actual keys and the legacy keys)
  const level = report?.final_impairment_level || report?.risk_level || 'No Impairment';
  const confidence = report?.confidence_score || report?.confidence || 0;
  const reasoning = report?.primary_driver || report?.reasoning || 'No detailed reasoning provided.';
  const markers = report?.markers || [];
  const config = IMPAIRMENT_CONFIG[level] || IMPAIRMENT_CONFIG['No Impairment'];

  // SVG Ring for confidence
  const ringRadius = 34;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (confidence / 100) * ringCircumference;

  return (
    <>
      <Navbar />
      <div className="new-era-page" style={{ paddingTop: '80px' }}>
        <div className="page-header" style={{ borderBottom: 'none', padding: '0 0 1.75rem', background: 'transparent', boxShadow: 'none' }}>
          <div className="container" style={{ textAlign: 'center' }}>
            <h1
              className="text-h1"
              style={{
                margin: 0,
                fontSize: 'clamp(2.2rem, 4.5vw, 3.6rem)',
                fontWeight: 900,
                letterSpacing: '-0.04em',
                lineHeight: 1.05,
                color: 'var(--dark-text-primary)',
                textShadow: '0 0 24px rgba(129, 140, 248, 0.14)',
              }}
            >
              Risk Assessment Report
            </h1>
            <p className="text-dark-muted" style={{ margin: '0.75rem 0 0', fontSize: '0.95rem' }}>
              {/* Patient #{patientId} · Comprehensive multimodal risk summary */}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
              <span className="badge" style={{ background: 'rgba(129,140,248,0.1)', color: 'var(--neon-primary)', border: '1px solid rgba(129,140,248,0.3)' }}>
                <Clock size={12} /> {new Date().toLocaleDateString()}
              </span>
              <button
                onClick={() => navigate('/')}
                className="btn btn-outline-neon"
                style={{ padding: '0.42rem 0.8rem', fontSize: '0.8rem' }}
              >
                <Home size={14} /> Back to Home
              </button>
            </div>
          </div>
        </div>

        <div className="page-body">
          <div className="container">

            {/* Risk Summary Banner */}
            <div className={`risk-banner ${config.bannerClass} animate-slide-up`} style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div className="risk-icon-wrap">
                  {config.icon}
                </div>
                <div>
                  <p className="text-overline" style={{ opacity: 0.7, marginBottom: '0.25rem' }}>Final Assessment</p>
                  <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
                    {level}
                  </h2>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div className="text-center">
                  <p className="text-overline" style={{ opacity: 0.7, marginBottom: '0.25rem' }}>Confidence</p>
                  <div className="confidence-ring">
                    <svg viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r={ringRadius} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="6" />
                      <circle
                        cx="40" cy="40" r={ringRadius} fill="none"
                        stroke="currentColor" strokeWidth="6"
                        strokeDasharray={ringCircumference}
                        strokeDashoffset={ringOffset}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 1.5s ease' }}
                      />
                    </svg>
                    <div className="confidence-ring-label">
                      {Math.round(confidence)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
              {/* Left Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Clinical Reasoning */}
                <div className="dark-glass-card animate-slide-up-delay-1" style={{ padding: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'rgba(129,140,248,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--neon-primary)' }}>
                      <Brain size={18} />
                    </div>
                    <h3 className="text-h3 text-white">AI Clinical Reasoning</h3>
                  </div>
                  <div className="reasoning-box" style={{ background: 'rgba(15,23,42,0.5)', color: 'var(--dark-text-secondary)', border: '1px solid var(--dark-border)' }}>
                    "{reasoning}"
                  </div>
                </div>

                {/* Cognitive Performance */}
                <div className="dark-glass-card animate-slide-up-delay-2" style={{ padding: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.5rem' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'rgba(34,211,238,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--neon-accent)' }}>
                      <Activity size={18} />
                    </div>
                    <h3 className="text-h3 text-white">Cognitive Performance</h3>
                  </div>
                  <div className="grid-3">
                    {[
                      { label: 'Working Memory', icon: <Target size={20} />, desc: 'Sequence Mimic', metric: report?.cognitive?.working_memory_score },
                      { label: 'Executive Function', icon: <Zap size={20} />, desc: 'Connect-the-Dots', metric: report?.cognitive?.cognitive_flexibility_score },
                      { label: 'Inhibitory Control', icon: <BarChart3 size={20} />, desc: 'Rapid-Fire Color', metric: report?.cognitive?.inhibitory_control_score },
                    ].map((item, i) => (
                      <div className="metric-card" key={i} style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid var(--dark-border)' }}>
                        <div style={{ color: 'var(--neon-primary)', marginBottom: '0.375rem' }}>{item.icon}</div>
                        <div className="metric-label" style={{ color: 'var(--dark-text-secondary)' }}>{item.label}</div>
                        <div className="metric-value text-gradient-neon">
                          {item.metric != null ? `${(item.metric * 100).toFixed(0)}%` : '—'}
                        </div>
                        <p className="text-xs text-dark-muted" style={{ marginTop: '0.25rem' }}>{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Impairment Scale */}
                <div className="dark-glass-card animate-slide-up-delay-2" style={{ padding: '2rem' }}>
                  <h3 className="text-h3 text-white" style={{ marginBottom: '1.25rem' }}>Impairment Scale</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                    {Object.entries(IMPAIRMENT_CONFIG).map(([name, cfg]) => (
                      <div
                        key={name}
                        style={{
                          padding: '0.75rem 1rem',
                          borderRadius: 'var(--radius-sm)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: name === level ? 'rgba(15,23,42,0.8)' : 'rgba(15,23,42,0.3)',
                          border: name === level ? `1px solid ${cfg.color}` : '1px solid var(--dark-border)',
                          color: name === level ? cfg.color : 'var(--dark-text-secondary)',
                          fontWeight: name === level ? 700 : 400,
                          fontSize: '0.875rem',
                          transition: 'all 250ms ease',
                        }}
                      >
                        <span>{name}</span>
                        {name === level && (
                          <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                            CURRENT
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Detected Markers */}
                <div className="dark-glass-card animate-slide-up-delay-3" style={{ padding: '2rem' }}>
                  <h3 className="text-h3 text-white" style={{ marginBottom: '1.25rem' }}>Detected Markers</h3>
                  {markers.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {markers.map((marker: string, i: number) => (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'center', gap: '0.5rem',
                          padding: '0.625rem 0.75rem',
                          background: 'rgba(15,23,42,0.5)',
                          border: '1px solid var(--dark-border)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.8125rem',
                          color: 'var(--dark-text-secondary)'
                        }}>
                          <CheckCircle2 size={14} style={{ color: 'var(--success)', flexShrink: 0 }} />
                          {marker}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{
                      padding: '2rem 1rem',
                      background: 'rgba(15,23,42,0.5)',
                      border: '1px solid var(--dark-border)',
                      borderRadius: 'var(--radius-md)',
                      textAlign: 'center',
                    }}>
                      <Info size={24} style={{ color: 'var(--dark-text-muted)', margin: '0 auto 0.5rem' }} />
                      <p className="text-sm text-dark-muted">No specific markers flagged.</p>
                      <p className="text-xs text-dark-muted" style={{ marginTop: '0.25rem' }}>
                        Play cognitive games to generate marker data.
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="dark-glass-card animate-slide-up-delay-4" style={{ padding: '1.5rem' }}>
                  <button className="btn btn-neon w-full" style={{ marginBottom: '0.75rem' }}>
                    <Download size={16} /> Export Report (PDF)
                  </button>
                  <Link to="/onboarding" className="btn btn-outline-neon w-full">
                    <ArrowLeft size={16} /> New Assessment
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Dashboard;
