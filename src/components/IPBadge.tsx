import clsx from 'clsx';

export default function IPBadge({ value, size = "md" }: { value: number, size?: "sm" | "md" | "lg" }) {
  // Compact scaling
  const scale = size === "sm" ? 0.8 : size === "lg" ? 1.2 : 1;
  const width = 50 * scale;
  const height = 50 * scale;

  // New Design: A golden-bordered square/badge style
  return (
    <div
      style={{ width, height }}
      className="relative flex-shrink-0"
    >
      <svg width="100%" height="100%" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Main Background shape - 90% Opacity, White Border */}
        <rect x="2" y="2" width="46" height="46" rx="6" fill="#0A0A0A" fillOpacity="0.9" stroke="white" strokeWidth="2" />

        {/* "IP" Label Header - White */}
        <path d="M 2 16 L 48 16" stroke="white" strokeWidth="1" strokeOpacity="0.5" />
        <text x="25" y="12" textAnchor="middle" fill="white" fontSize="9" fontWeight="800" fontFamily="sans-serif" style={{ letterSpacing: '1px' }}>
          IP
        </text>

        {/* Value Display */}
        <text x="25" y="34" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold" fontFamily="monospace">
          {value}
        </text>
      </svg>
    </div>
  );
}