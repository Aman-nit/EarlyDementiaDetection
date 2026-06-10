import React, { useState, useEffect } from 'react';

interface ConnectDotsProps {
  onComplete: (results: { score: number, time: number, errors: number }) => void;
}

const ConnectDots: React.FC<ConnectDotsProps> = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dots, setDots] = useState<{ id: number, x: number, y: number }[]>([]);
  const [connected, setConnected] = useState<number[]>([]);
  const [errors, setErrors] = useState(0);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const newDots = [];
    for (let i = 1; i <= 6; i++) {
      newDots.push({
        id: i,
        x: 50 + Math.random() * 400,
        y: 50 + Math.random() * 400,
      });
    }
    setDots(newDots);
  }, []);

  const handleDotClick = (id: number) => {
    if (id === currentIndex + 1) {
      const newConnected = [...connected, id];
      setConnected(newConnected);
      setCurrentIndex(id);

      if (id === dots.length) {
        const timeTaken = (Date.now() - startTime) / 1000;
        onComplete({
          score: 100,
          time: timeTaken,
          errors: errors,
        });
      }
    } else {
      setErrors(prev => prev + 1);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center mb-4">
        <p className="text-xl font-medium text-slate-700">
          Connect the dots in order: 1 → 2 → 3...
        </p>
        <p className="text-slate-500">Next: {currentIndex + 1}</p>
      </div>

      <div className="relative w-[500px] h-[500px] bg-slate-100 rounded-xl border-2 border-slate-300 overflow-hidden cursor-crosshair">
        {/* SVG for lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {connected.map((id, index) => {
            if (index === 0) return null;
            const start = dots[id - 2];
            const end = dots[id - 1];
            if (!start || !end) return null;
            return (
              <line
                key={index}
                x1={start.x} y1={start.y}
                x2={end.x} y2={end.y}
                stroke="#2563eb"
                strokeWidth="4"
                strokeLinecap="round"
              />
            );
          })}
        </svg>

        {dots.map(dot => (
          <button
            key={dot.id}
            onClick={() => handleDotClick(dot.id)}
            className={`
              absolute w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all
              ${dot.id <= currentIndex
                ? 'bg-blue-600 text-white scale-90'
                : 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50'}
              ${dot.id === currentIndex + 1 ? 'ring-4 ring-blue-300 animate-pulse' : ''}
            `}
            style={{ left: dot.x - 20, top: dot.y - 20 }}
          >
            {dot.id}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ConnectDots;
