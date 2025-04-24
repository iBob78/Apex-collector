'use client'

import { useState } from 'react'

export default function UnitToggle() {
  const [unit, setUnit] = useState('metric')

  return (
    <button onClick={() => setUnit(unit === 'metric' ? 'imperial' : 'metric')}>
      Toggle to {unit === 'metric' ? 'Imperial' : 'Metric'}
    </button>
  )
}
