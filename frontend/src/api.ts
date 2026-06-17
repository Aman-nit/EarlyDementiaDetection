import axios from 'axios';

// Vite injects env vars prefixed with VITE_ at build time.
// In dev, falls back to the local FastAPI server.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {

  async createPatient(patientData: any) {
    const response = await apiClient.post('/patient-info', patientData);
    return response.data;
  },

  async uploadMRI(patientId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('patient_id', patientId);

    const response = await apiClient.post('/analysis/upload-mri', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async uploadCognitiveResults(payload: any) {
    const response = await apiClient.post('/analysis/cognitive-results', payload);
    return response.data;
  },

  async getFullRiskAssessment(patientId: string) {
    const response = await apiClient.post(`/analysis/full-risk/${patientId}`);
    return response.data;
  },

};
