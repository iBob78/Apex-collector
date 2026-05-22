'use client';
import React, { useEffect, useState } from 'react';

export default function TachometerLoader() {
  const [rpm, setRpm] = useState(0);
  const [progress, setProgress] = useState(0);
  const [inLimiter, setInLimiter] = useState(false);

  useEffect(() => {
    let step = 0;
    const limiterSteps = [10000, 9900, 9800, 9700, 9600, 9500, 9400, 9300, 9400, 9500, 9600, 9700, 9800, 9900];

    if (!inLimiter) {
      const interval = setInterval(() => {
        setRpm((prev) => {
          if (prev >= 10000) {
            setInLimiter(true);
            return 10000;
          }
          return prev + 100;
        });
        setProgress((prev) => {
          if (prev >= 100) return 100;
          return prev + 1;
        });
      }, 40);
      return () => clearInterval(interval);
    } else {
      const bounce = setInterval(() => {
        const currentRpm = limiterSteps[step % limiterSteps.length];
        setRpm(currentRpm);
        setProgress(currentRpm / 10000 * 100);
        step++;
      }, 10);
      return () => clearInterval(bounce);
    }
  }, [inLimiter]);

  const angle = (progress * 120) / 100 + 210;
  const rad = (angle * Math.PI) / 180;
  const x = Number((100 + 70 * Math.cos(rad)).toFixed(3));
  const y = Number((100 + 70 * Math.sin(rad)).toFixed(3));

  return (
    <div className="flex items-center justify-center p-6 bg-black min-h-screen">
      <svg viewBox="0 0 200 200" className="w-64 h-64">
        <defs>
          <radialGradient id="metal" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#111" />
            <stop offset="100%" stopColor="#000" />
          </radialGradient>
          <radialGradient id="rim" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#bbb" />
            <stop offset="100%" stopColor="#333" />
          </radialGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#f00" />
          </filter>
        </defs>

        {/* Bordure et fond */}
        <circle cx="100" cy="100" r="98" fill="url(#rim)" />
        <circle cx="100" cy="100" r="88" fill="url(#metal)" />

        {/* Graduations GT + zone rouge */}
        {[...Array(21)].map((_, i) => {
          const a = (i * 120) / 20 + 210;
          const r = (a * Math.PI) / 180;
          const x1 = Number((100 + 78 * Math.cos(r)).toFixed(3));
          const y1 = Number((100 + 78 * Math.sin(r)).toFixed(3));
          const x2 = Number((100 + 88 * Math.cos(r)).toFixed(3));
          const y2 = Number((100 + 88 * Math.sin(r)).toFixed(3));
          const isRed = i >= 16;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={isRed ? '#f00' : '#ccc'}
              strokeWidth={i % 5 === 0 ? 2 : 1}
            />
          );
        })}

        {/* Chiffres */}
        {[...Array(6)].map((_, i) => {
          const val = i * 2;
          const a = i * 24 + 210;
          const r = (a * Math.PI) / 180;
          const tx = Number((100 + 60 * Math.cos(r)).toFixed(3));
          const ty = Number((100 + 60 * Math.sin(r)).toFixed(3)) + 2;
          return (
            <text
              key={`label-${i}`}
              x={tx}
              y={ty}
              textAnchor="middle"
              fontSize="10"
              fill="#eee"
              fontFamily="monospace"
            >
              {val}
            </text>
          );
        })}

        {/* Aiguille rouge glow */}
        <line
          x1="100"
          y1="100"
          x2={x}
          y2={y}
          stroke="#e11d48"
          strokeWidth="4"
          strokeLinecap="round"
          filter="url(#glow)"
        />

        {/* Centre mécanique */}
        <circle cx="100" cy="100" r="5" fill="#ccc" stroke="#111" strokeWidth="1" />

        {/* RPM numérique */}
        <text
          x="100"
          y="130"
          textAnchor="middle"
          fontSize="16"
          fill="#e5e5e5"
          fontFamily="monospace"
        >
          RPM {rpm}
        </text>
      </svg>
    </div>
  );
}