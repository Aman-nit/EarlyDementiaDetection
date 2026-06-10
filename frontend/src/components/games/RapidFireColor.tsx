import React, { useState, useEffect } from 'react';

interface RapidFireColorProps {
  onComplete: (results: { score: number, time: number, errors: number }) => void;
}

const COLORS = [
  { name: 'Red', hex: '#ef4444' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Green', hex: '#22c55e' },
  { name: 'Yellow', hex: '#eab308' },
];

const RapidFireColor: React.FC<RapidFireColorProps> = ({ onComplete }) => {
  const [trial, setTrial] = useState(0);
  const [currentWord, setCurrentWord] = useState('');
  const [currentColor, setCurrentColor] = useState('');
  const [errors, setErrors] = useState(0);
  const [startTime] = useState(Date.now());
  const [trialStartTimes, setTrialStartTimes] = useState<number[]>([]);

  const totalTrials = 15;

  useEffect(() => {
    generateTrial();
  }, []);

  const generateTrial = () => {
    const wordIdx = Math.floor(Math.random() * COLORS.length);
    const colorIdx = Math.floor(Math.random() * COLORS.length);

    setCurrentWord(COLORS[wordIdx].name);
    setCurrentColor(COLORS[colorIdx].hex);
    setTrialStartTimes(prev => [...prev, Date.now()]);
  };

  const handleChoice = (colorHex: string) => {
    const correctColor = currentColor;
    if (colorHex === correctColor) {
      if (trial === totalTrials - 1) {
        const totalTime = (Date.now() - startTime) / 1000;
        onComplete({
          score: Math.round((totalTrials - errors) / totalTrials * 100),
          time: totalTime,
          errors: errors,
        });
        return;
      }
      setTrial(prev => prev + 1);
      generateTrial();
    } else {
      setErrors(prev => prev + 1);
      if (trial === totalTrials - 1) {
        const totalTime = (Date.now() - startTime) / 1000;
        onComplete({
          score: Math.round((totalTrials - errors) / totalTrials * 100),
          time: totalTime,
          errors: errors,
        });
      } else {
        setTrial(prev => prev + 1);
        generateTrial();
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center mb-4">
        <p className="text-xl font-medium text-slate-700">
          Click the button matching the <span className="font-bold text-blue-600 underline">ink color</span>, not the word.
        </p>
        <p className="text-slate-500">Trial: {trial + 1} / {totalTrials}</p>
      </div>

      <div className="text-6xl font-black tracking-tighter py-12 px-8 bg-white rounded-2xl shadow-inner border-2 border-slate-200 mb-8 min-w-[300px] text-center"
           style={{ color: currentColor }}>
        {currentWord}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {COLORS.map(color => (
          <button
            key={color.name}
            onClick={() => handleChoice(color.hex)}
            className="w-32 h-16 rounded-xl shadow-md hover:scale-105 transition-transform font-bold text-white text-lg"
            style={{ backgroundColor: color.hex }}
          >
            {color.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RapidFireColor;
