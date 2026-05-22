interface UnitToggleProps {
  isMetric: boolean
  onToggle: (isMetric: boolean) => void
}

export default function UnitToggle({ isMetric, onToggle }: UnitToggleProps) {
  return (
    <button
      className="px-4 py-2 bg-blue-500 text-white rounded"
      onClick={() => onToggle(!isMetric)}
    >
      {isMetric ? 'Switch to Imperial' : 'Switch to Metric'}
    </button>
  )
}
