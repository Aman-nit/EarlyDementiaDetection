import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import NewLanding from './pages/NewLanding';
import Onboarding from './pages/Onboarding';
import Upload from './pages/Upload';
import CognitiveGames from './pages/CognitiveGames';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<NewLanding />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/upload/:patientId" element={<Upload />} />
        <Route path="/cognitive-games/:patientId" element={<CognitiveGames />} />
        <Route path="/dashboard/:patientId" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
