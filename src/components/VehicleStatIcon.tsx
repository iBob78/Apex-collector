export default function VehicleStatIcon({ kind }: { kind: 'engine' | 'torque' | 'acceleration' | 'weight' }) {
  const sharedProps = {
    'aria-hidden': true as const,
    className: 'h-4 w-4 shrink-0 text-cyan-300',
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeWidth: 1.7,
    viewBox: '0 0 24 24',
  };

  switch (kind) {
    case 'engine':
      return (
        <svg {...sharedProps}>
          <path d="M4 9h3l2-3h6l2 3h3v9h-3l-2 2H9l-2-2H4z" />
          <path d="M10 6V3h4v3M9 12h6M12 9v6M2 12v4M22 11v5" />
        </svg>
      );
    case 'torque':
      return (
        <svg {...sharedProps}>
          <path d="M5 8a8 8 0 0 1 13-2l2 2" />
          <path d="M20 4v4h-4M19 16a8 8 0 0 1-13 2l-2-2" />
          <path d="M4 20v-4h4M12 7v5l3 2" />
        </svg>
      );
    case 'acceleration':
      return (
        <svg {...sharedProps}>
          <circle cx="12" cy="13" r="8" />
          <path d="M12 13l4-3M9 2h6M12 5V3M19 6l1.5-1.5" />
        </svg>
      );
    case 'weight':
      return (
        <svg {...sharedProps}>
          <path d="M8 4h8l5 15H3z" />
          <path d="M10 8a2 2 0 1 1 4 0" />
          <path d="M9 15h6" />
        </svg>
      );
  }
}
