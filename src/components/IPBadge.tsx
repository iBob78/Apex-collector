import { Exo } from 'next/font/google';

const exo = Exo({ subsets: ['latin'], weight: ['700', '800', '900'] });

export default function IPBadge({ value, size = "md" }: { value: number, size?: "sm" | "md" | "lg" }) {
  // Compact scaling
  const scale = size === "sm" ? 0.8 : size === "lg" ? 1.2 : 1;
  const width = 50 * scale;
  const height = 50 * scale;
  const ipClass = value >= 1000 ? "SS"
    : value >= 800 ? "S"
      : value >= 700 ? "A"
        : value >= 600 ? "B"
          : value >= 500 ? "C"
            : value >= 400 ? "D"
              : value >= 300 ? "E"
                : value >= 200 ? "F"
                  : "G";

  // New Design: A golden-bordered square/badge style
  return (
    <div
      style={{ width, height }}
      className="relative flex-shrink-0"
    >
      <svg width="100%" height="100%" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Main Background shape - 90% Opacity, White Border */}
        <rect x="2" y="2" width="46" height="46" rx="6" fill="#0A0A0A" fillOpacity="0.9" stroke="white" strokeWidth="2" />

        {/* Class label header */}
        <path d="M 2 23 L 48 23" stroke="white" strokeWidth="1" strokeOpacity="0.7" />
        <text className={exo.className} x="25" y="19" textAnchor="middle" fill="#FFFFFF" fontSize="17" fontWeight="900" style={{ letterSpacing: '0.5px' }}>
          {ipClass}
        </text>

        {/* Value Display */}
        <text className={exo.className} x="25" y="40" textAnchor="middle" fill="white" fontSize="16" fontWeight="700">
          {value}
        </text>
      </svg>
    </div>
  );
}