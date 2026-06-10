import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SequenceMimic from '../components/games/SequenceMimic';
import ConnectDots from '../components/games/ConnectDots';
import RapidFireColor from '../components/games/RapidFireColor';
import { api } from '../api';

const CognitiveGames = () => {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const [step, setStep] = useState(1);
  const [results, setResults] = useState<{ [key: string]: any }>({});

  const games = [
    { id: 'sequenceMimic', name: 'Sequence Mimic', component: <SequenceMimic />, description: 'Test your short-term memory by repeating a sequence of lights.' },
    { id: 'connectDots', name: 'Connect-the-Dots', component: <ConnectDots />, description: 'Test your visuospatial skills by connecting points in order.' },
    { id: 'rapidFireColor', name: 'Rapid-Fire Color', component: <RapidFireColor />, description: 'Test your cognitive flexibility by naming colors quickly.' },
  ];

  const handleCompleteGame = (gameId: string, result: { score: number, time: number, errors: number }) => {
    setResults(prev => ({
      ...prev,
      [gameId]: result
    }));

    if (step < 3) {
      setStep(step + 1);
    } else {
      submitResults({ ...results, [gameId]: result });
    }
  };

  const submitResults = async (finalResults: any) => {
    const payload = {
      patient_id: parseInt(patientId || '0'),
      results: [
        { game_name: 'Sequence Mimic', score: finalResults.sequenceMimic?.score || 0, completion_time: finalResults.sequenceMimic?.time || 0, error_count: finalResults.sequenceMimic?.errors || 0 },
        { game_name: 'Connect-the-Dots', score: finalResults.connectDots?.score || 0, completion_time: finalResults.connectDots?.time || 0, error_count: finalResults.connectDots?.errors || 0 },
        { game_name: 'Rapid-Fire Color', score: finalResults.rapidFireColor?.score || 0, completion_time: finalResults.rapidFireColor?.time || 0, error_count: finalResults.rapidFireColor?.errors || 0 },
      ]
    };

    try {
      await api.uploadCognitiveResults(payload);
      navigate(`/dashboard/${patientId}`);
    } catch (error) {
      console.error('Error submitting results:', error);
      alert('An error occurred while submitting results');
    }
  };

  const currentGame = games[step - 1];

  return (
    <div className="new-era-page flex flex-col items-center justify-center p-6">
      <div className="dark-glass-card max-w-3xl w-full p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Cognitive Assessment</h1>
          <p className="text-dark-muted">Complete the following tasks to help us evaluate your cognitive health.</p>
          <div className="mt-6 flex justify-center gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-2 w-16 rounded-full transition-colors" style={{ background: i <= step ? 'var(--neon-primary)' : 'rgba(255,255,255,0.1)' }} />
            ))}
          </div>
        </div>

        <div className="text-center py-12 px-4 rounded-xl mb-8" style={{ background: 'rgba(15, 23, 42, 0.4)', border: '1px solid var(--dark-border)' }}>
          <h2 className="text-2xl font-semibold text-white mb-4">{currentGame.name}</h2>
          <p className="text-dark-muted mb-8">{currentGame.description}</p>

          <div className="flex justify-center items-center">
            {React.cloneElement(currentGame.component as React.ReactElement, {
              onComplete: (res: any) => handleCompleteGame(currentGame.id, res)
            })}
          </div>
        </div>

        <div className="text-center text-sm text-dark-muted">
          Step {step} of 3
        </div>
      </div>
    </div>
  );
};

export default CognitiveGames;
