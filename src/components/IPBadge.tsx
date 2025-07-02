import clsx from 'clsx';

export default function IPBadge({ value }: { value: number }) {
  return (
    <div
      className={clsx(
        'absolute top-1 left-1 z-10',
        'w-[48px] h-[72px] relative'
      )}
    >
      {/* SVG unique : fond noir + cadre doré */}
      <svg
        viewBox="0 0 60 90"
        className="absolute inset-0 w-full h-full z-10"
        preserveAspectRatio="xMidYMid meet"
        shapeRendering="geometricPrecision"
      >
        {/* Fond noir */}
        <path
          d="
            M6,0
            H54
            A6,6 0 0 1 60,6
            V58.5
            A6,6 0 0 1 54,64.5
            H6
            A6,6 0 0 1 0,58.5
            V6
            A6,6 0 0 1 6,0
            Z
          "
          fill="rgba(0,0,0,0.60)"
        />
        {/* Cadre doré */}
        <path
          d="
            M6,0
            H54
            A6,6 0 0 1 60,6
            V58.5
            A6,6 0 0 1 54,64.5
            H6
            A6,6 0 0 1 0,58.5
            V6
            A6,6 0 0 1 6,0
            Z
          "
          fill="none"
          stroke="#FFD700"
          strokeWidth="3.3"
        />
      </svg>

      {/* Texte IP */}
      <div className="absolute top-1 w-full text-center text-white text-[11px] font-bold font-mono z-20">
        IP
      </div>

      {/* Encart blanc */}
      <div className="absolute top-[26px] left-[6px] w-[36px] h-[20px] bg-white rounded-sm flex items-center justify-center z-20">
        <span className="text-black text-[13px] font-bold font-mono">{value}</span>
      </div>
    </div>
  );
}