'use client'

import { createClient } from '@supabase/supabase-js'
import UnitToggle from '@/components/UnitToggle'
import TachometerLoader from '@/components/TachometerLoader'

export default function SettingsPage() {
  return (
    <div className="p-4">
      <h1>Settings</h1>
      <UnitToggle />
      <TachometerLoader />
    </div>
  )
}
