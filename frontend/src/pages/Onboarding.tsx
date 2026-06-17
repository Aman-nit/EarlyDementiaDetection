import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import {
  User,
  Heart,
  Activity,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Stethoscope,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const STEPS = [
  { label: 'Demographics', icon: <User size={16} /> },
  { label: 'Clinical Markers', icon: <Heart size={16} /> },
  { label: 'Lifestyle', icon: <Activity size={16} /> },
];

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    education_level: 'University',
    hypertension: false,
    diabetes: false,
    heart_disease: false,
    stroke_history: false,
    depression: false,
    sleep_disorders: false,
    family_history_dementia: false,
    current_medications: [] as string[],
    // Lifestyle (used in UI, mapped before sending)
    sleepQuality: 'Good',
    physicalActivity: 'Moderate',
    diet: 'Balanced',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender,
        education_level: formData.education_level,
        diabetes: formData.diabetes,
        hypertension: formData.hypertension,
        heart_disease: formData.heart_disease,
        stroke_history: formData.stroke_history,
        depression: formData.depression,
        sleep_disorders: formData.sleep_disorders,
        family_history_dementia: formData.family_history_dementia,
        current_medications: formData.current_medications,
      };
      const data = await api.createPatient(payload);
      navigate(`/upload/${data.patient_id || data.id || 1}`);
    } catch (error) {
      alert('Error saving patient profile. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const canNext = () => {
    if (step === 0) return formData.name.trim() !== '' && formData.age !== '';
    return true;
  };

  const nextStep = () => {
    if (step < 2) setStep(step + 1);
    else handleSubmit();
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  const renderToggle = (label: string, name: string, checked: boolean) => (
    <label className={`dark-toggle-label ${checked ? 'active' : ''}`}>
      <span>{label}</span>
      <div style={{ position: 'relative', width: 44, height: 24, flexShrink: 0 }}>
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={handleChange}
          style={{ opacity: 0, position: 'absolute', width: '100%', height: '100%', cursor: 'pointer' }}
        />
        <div style={{
          width: 44, height: 24, borderRadius: 12,
          background: checked ? 'var(--neon-primary)' : 'rgba(255,255,255,0.1)',
          transition: 'background 200ms ease',
          position: 'relative',
        }}>
          <div style={{
            width: 18, height: 18, borderRadius: '50%', background: 'white',
            position: 'absolute', top: 3,
            left: checked ? 23 : 3,
            transition: 'left 200ms ease',
            boxShadow: checked ? '0 0 10px rgba(129,140,248,0.8)' : '0 1px 3px rgba(0,0,0,0.15)',
          }} />
        </div>
      </div>
    </label>
  );

  return (
    <>
      <Navbar />
      <div className="new-era-page" style={{ paddingTop: '80px' }}>
        {/* <div className="page-header" style={{ borderBottom: 'none' }}>
          <div className="container-sm text-center">
            <div className="badge" style={{ background: 'rgba(34, 211, 238, 0.1)', color: 'var(--neon-accent)', border: '1px solid rgba(34,211,238,0.3)', marginBottom: '1rem' }}>
              <Stethoscope size={14} /> Clinical Intake
            </div>
            <h1 className="text-h1 text-white">Patient Assessment</h1>
            <p className="text-secondary" style={{ marginTop: '0.5rem' }}>
              Please provide accurate clinical information for high-precision evaluation.
            </p>
          </div>
        </div> */}

        <div className="page-body">
          <div className="container-sm">
            {/* Step Progress */}
            <div className="dark-step-progress">
              {STEPS.map((s, i) => (
                <React.Fragment key={i}>
                  <div className="step-progress-item">
                    <div className={`dark-step-circle ${i === step ? 'active' : i < step ? 'completed' : ''}`}>
                      {i < step ? <CheckCircle size={18} /> : i + 1}
                    </div>
                    <span className={`step-progress-label text-dark-muted ${i === step ? 'active text-neon-accent' : i < step ? 'completed text-neon-primary' : ''}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`step-progress-line ${i < step ? 'completed bg-neon-primary' : ''}`} style={{ opacity: 0.3 }} />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Form Card */}
            <div className="dark-glass-card animate-scale-in" key={step} style={{ padding: '2.5rem' }}>
              {/* Step 1: Demographics */}
              {step === 0 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '2rem' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'rgba(129, 140, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--neon-primary)' }}>
                      <User size={20} />
                    </div>
                    <div>
                      <h2 className="text-h3 text-white">Personal Information</h2>
                      <p className="text-sm text-dark-muted">Basic demographic data for cognitive reserve estimation.</p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="dark-form-label">Full Name *</label>
                      <input className="dark-form-input" type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter patient's full name" required />
                    </div>
                    <div className="form-group">
                      <label className="dark-form-label">Age *</label>
                      <input className="dark-form-input" type="number" name="age" value={formData.age} onChange={handleChange} placeholder="e.g. 65" min="1" max="120" required />
                    </div>
                    <div className="form-group">
                      <label className="dark-form-label">Gender</label>
                      <select className="dark-form-select" name="gender" value={formData.gender} onChange={handleChange}>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="dark-form-label">Education Level</label>
                      <select className="dark-form-select" name="education_level" value={formData.education_level} onChange={handleChange}>
                        <option value="Primary">Primary School</option>
                        <option value="Secondary">Secondary / High School</option>
                        <option value="University">University / Bachelor's</option>
                        <option value="Postgraduate">Postgraduate / Doctoral</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Clinical Markers */}
              {step === 1 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '2rem' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FCA5A5' }}>
                      <Heart size={20} />
                    </div>
                    <div>
                      <h2 className="text-h3 text-white">Clinical Health Markers</h2>
                      <p className="text-sm text-dark-muted">Comorbid conditions and medical history assessment.</p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {renderToggle('Hypertension (High Blood Pressure)', 'hypertension', formData.hypertension)}
                    {renderToggle('Type 2 Diabetes', 'diabetes', formData.diabetes)}
                    {renderToggle('Heart Disease', 'heart_disease', formData.heart_disease)}
                    {renderToggle('History of Stroke', 'stroke_history', formData.stroke_history)}
                    {renderToggle('Depression / Mood Disorder', 'depression', formData.depression)}
                    {renderToggle('Sleep Disorders (Apnea, Insomnia)', 'sleep_disorders', formData.sleep_disorders)}
                    {renderToggle('Family History of Dementia / APOE-ε4', 'family_history_dementia', formData.family_history_dementia)}
                  </div>
                </div>
              )}

              {/* Step 3: Lifestyle */}
              {step === 2 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '2rem' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6EE7B7' }}>
                      <Activity size={20} />
                    </div>
                    <div>
                      <h2 className="text-h3 text-white">Lifestyle Assessment</h2>
                      <p className="text-sm text-dark-muted">Modifiable risk factors and behavioral patterns.</p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gap: '1.25rem' }}>
                    <div className="form-group">
                      <label className="dark-form-label">Sleep Quality</label>
                      <select className="dark-form-select" name="sleepQuality" value={formData.sleepQuality} onChange={handleChange}>
                        <option value="Poor">Poor — Frequent interruptions, &lt;5 hours</option>
                        <option value="Fair">Fair — Some interruptions, 5-6 hours</option>
                        <option value="Good">Good — Generally restful, 7-8 hours</option>
                        <option value="Excellent">Excellent — Consistent, 8+ hours</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="dark-form-label">Physical Activity Level</label>
                      <select className="dark-form-select" name="physicalActivity" value={formData.physicalActivity} onChange={handleChange}>
                        <option value="Sedentary">Sedentary — Little to no exercise</option>
                        <option value="Low">Low — Light walks, occasional movement</option>
                        <option value="Moderate">Moderate — 30 min exercise, 3-4x/week</option>
                        <option value="High">High — Daily vigorous exercise, 60+ min</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="dark-form-label">Dietary Habits</label>
                      <select className="dark-form-select" name="diet" value={formData.diet} onChange={handleChange}>
                        <option value="Poor">Poor — High processed food, irregular meals</option>
                        <option value="Balanced">Balanced — Mixed diet, regular meals</option>
                        <option value="Healthy">Healthy — Mediterranean / MIND diet pattern</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--dark-border)' }}>
                <button
                  className="btn btn-outline-neon"
                  onClick={prevStep}
                  disabled={step === 0}
                  style={{ visibility: step === 0 ? 'hidden' : 'visible' }}
                >
                  <ArrowLeft size={16} /> Back
                </button>

                <div className="text-sm text-dark-muted">
                  Step {step + 1} of {STEPS.length}
                </div>

                <button
                  className="btn btn-neon"
                  onClick={nextStep}
                  disabled={!canNext() || loading}
                >
                  {loading ? (
                    <><div className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} /> Saving...</>
                  ) : step === 2 ? (
                    <>Submit & Continue <ArrowRight size={16} /></>
                  ) : (
                    <>Continue <ArrowRight size={16} /></>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Onboarding;
