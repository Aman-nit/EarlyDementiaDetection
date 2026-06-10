import React, { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import {
  UploadCloud,
  FileText,
  CheckCircle,
  AlertCircle,
  Brain,
  ArrowRight,
  X,
  HardDrive,
  Shield,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MRIUpload: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (f: File) => {
    setFile(f);
    setStatus('idle');
    setProgress(0);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !patientId) return;

    setUploading(true);
    setStatus('uploading');
    
    // Simulate progress
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) { clearInterval(interval); return p; }
        return p + Math.random() * 15;
      });
    }, 300);

    try {
      await api.uploadMRI(patientId, file);
      clearInterval(interval);
      setProgress(100);
      setStatus('success');
      setTimeout(() => navigate(`/cognitive-games/${patientId}`), 2000);
    } catch (error) {
      clearInterval(interval);
      setStatus('error');
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setStatus('idle');
    setProgress(0);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <>
      <Navbar />
      <div className="new-era-page" style={{ paddingTop: '80px' }}>
        <div className="page-header" style={{ borderBottom: 'none' }}>
          <div className="container-sm text-center">
            <div className="badge" style={{ background: 'rgba(34, 211, 238, 0.1)', color: 'var(--neon-accent)', border: '1px solid rgba(34,211,238,0.3)', marginBottom: '1rem' }}>
              <Brain size={14} /> Step 2 of 3
            </div>
            <h1 className="text-h1 text-white">Upload Brain MRI</h1>
            <p className="text-dark-muted" style={{ marginTop: '0.5rem' }}>
              Upload a brain MRI scan for AI-powered structural analysis and feature extraction.
            </p>
          </div>
        </div>

        <div className="page-body">
          <div className="container-sm">
            <div className="dark-glass-card animate-slide-up" style={{ padding: '2.5rem' }}>
              {/* Upload Zone */}
              <div
                className={`dark-upload-zone ${dragOver ? 'active' : ''} ${status === 'success' ? 'success' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  accept=".nii,.nii.gz,.dcm,.jpg,.jpeg,.png"
                  style={{ display: 'none' }}
                />

                {status === 'success' ? (
                  <div className="animate-scale-in">
                    <div className="upload-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
                      <CheckCircle size={36} />
                    </div>
                    <h3 className="text-h3" style={{ color: 'var(--success-text)', marginBottom: '0.5rem' }}>
                      Upload Complete!
                    </h3>
                    <p className="text-sm text-secondary">
                      Redirecting to your analysis dashboard...
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="upload-icon">
                      <UploadCloud size={36} />
                    </div>
                    <h3 className="text-h3 text-white" style={{ marginBottom: '0.5rem' }}>
                      {dragOver ? 'Drop your file here' : 'Drag & drop your MRI scan'}
                    </h3>
                    <p className="text-sm text-dark-muted">
                      or click to browse files • Supports NIfTI, DICOM, JPEG, PNG
                    </p>
                  </>
                )}
              </div>

              {/* Selected File Info */}
              {file && status !== 'success' && (
                <div className="animate-slide-up" style={{
                  marginTop: '1.5rem',
                  padding: '1rem 1.25rem',
                  background: 'rgba(15, 23, 42, 0.5)',
                  border: '1px solid var(--dark-border)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 'var(--radius-sm)',
                      background: 'rgba(129, 140, 248, 0.1)', color: 'var(--neon-primary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <FileText size={20} />
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--dark-text)' }}>{file.name}</p>
                      <p className="text-xs text-dark-muted">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(); }}
                    className="btn btn-ghost btn-icon"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <X size={18} />
                  </button>
                </div>
              )}

              {/* Progress Bar */}
              {status === 'uploading' && (
                <div style={{ marginTop: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span className="text-sm text-white" style={{ fontWeight: 600 }}>Uploading & Analyzing...</span>
                    <span className="text-sm" style={{ fontWeight: 700, color: 'var(--neon-accent)' }}>{Math.round(progress)}%</span>
                  </div>
                  <div style={{
                    height: 6, borderRadius: 3,
                    background: 'rgba(255,255,255,0.1)',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${progress}%`,
                      background: 'var(--gradient-primary)',
                      borderRadius: 3,
                      transition: 'width 300ms ease',
                    }} />
                  </div>
                </div>
              )}

              {/* Error Message */}
              {status === 'error' && (
                <div className="animate-slide-up" style={{
                  marginTop: '1.5rem',
                  padding: '1rem 1.25rem',
                  background: 'var(--danger-bg)',
                  border: '1px solid var(--danger)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  color: 'var(--danger-text)',
                }}>
                  <AlertCircle size={20} />
                  <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                    Upload failed. Please check the file format and try again.
                  </span>
                </div>
              )}

              {/* Upload Button */}
              <button
                className="btn btn-neon btn-lg w-full"
                style={{ marginTop: '2rem' }}
                onClick={handleUpload}
                disabled={!file || uploading || status === 'success'}
              >
                {uploading ? (
                  <><div className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} /> Processing Scan...</>
                ) : (
                  <>Start Diagnostic Analysis <ArrowRight size={18} /></>
                )}
              </button>

              {/* Info Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '2rem' }}>
                <div style={{
                  padding: '1rem',
                  background: 'rgba(15, 23, 42, 0.4)',
                  border: '1px solid var(--dark-border)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                }}>
                  <HardDrive size={18} style={{ color: 'var(--neon-accent)', marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <p className="text-sm text-white" style={{ fontWeight: 600 }}>Accepted Formats</p>
                    <p className="text-xs text-dark-muted">.nii, .nii.gz, .dcm, .jpg, .png</p>
                  </div>
                </div>
                <div style={{
                  padding: '1rem',
                  background: 'rgba(15, 23, 42, 0.4)',
                  border: '1px solid var(--dark-border)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                }}>
                  <Shield size={18} style={{ color: '#6EE7B7', marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <p className="text-sm text-white" style={{ fontWeight: 600 }}>Secure Processing</p>
                    <p className="text-xs text-dark-muted">HIPAA-compliant data handling</p>
                  </div>
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

export default MRIUpload;
