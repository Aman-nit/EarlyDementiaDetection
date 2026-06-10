import React, { useState, useEffect, useCallback } from 'react';

interface SequenceMimicProps {
  onComplete: (results: { score: number, time: number, errors: number }) => void;
}

const SequenceMimic: React.FC<SequenceMimicProps> = ({ onComplete }) => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUserTurn, setIsUserTurn] = useState(false);
  const [activeTile, setActiveTile] = useState<number | null>(null);
  const [startTime] = useState(Date.now());

  const tiles = [0, 1, 2, 3];

  const startNextRound = useCallback(() => {
    const currentLength = sequence.length;
    const newSequence = [...sequence];
    newSequence.push(Math.floor(Math.random() * 4));
    setSequence(newSequence);
    playSequence(newSequence);
  }, [sequence]);

  const playSequence = async (seq: number[]) => {
    setIsPlaying(true);
    setIsUserTurn(false);
    for (const tileId of seq) {
      await new Promise(resolve => setTimeout(resolve, 600));
      setActiveTile(tileId);
      await new Promise(resolve => setTimeout(resolve, 600));
      setActiveTile(null);
    }
    setIsPlaying(false);
    setIsUserTurn(true);
  };

  useEffect(() => {
    startNextRound();
  }, []);

  const handleTileClick = (id: number) => {
    if (!isUserTurn) return;

    const newUserSequence = [...userSequence, id];
    setUserSequence(newUserSequence);

    const currentStep = newUserSequence.length - 1;
    if (id !== sequence[currentStep]) {
      // Game Over
      const timeTaken = (Date.now() - startTime) / 1000;
      onComplete({
        score: sequence.length - 1,
        time: timeTaken,
        errors: 1,
      });
      return;
    }

    if (newUserSequence.length === sequence.length) {
      setUserSequence([]);
      setIsUserTurn(false);
      setTimeout(startNextRound, 1000);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center mb-4">
        <p className="text-xl font-medium text-slate-700">
          {isPlaying ? "Watch the sequence..." : "Repeat the sequence!"}
        </p>
        <p className="text-slate-500">Round: {sequence.length}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 w-64 h-64">
        {tiles.map(id => (
          <button
            key={id}
            onClick={() => handleTileClick(id)}
            disabled={!isUserTurn}
            className={`
              w-full h-full rounded-2xl transition-all duration-200 transform active:scale-95
              ${activeTile === id
                ? 'bg-yellow-400 shadow-lg scale-105 ring-4 ring-yellow-200'
                : 'bg-blue-500 hover:bg-blue-600 shadow-md'}
              ${!isUserTurn && activeTile !== id ? 'opacity-80 cursor-default' : 'cursor-pointer'}
            `}
          />
        ))}
      </div>
    </div>
  );
};

export default SequenceMimic;
