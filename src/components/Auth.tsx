'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOtp({ email })

      if (error) {
        throw new Error(error.message)
      }

      alert('Check your email for the login link!')
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message)
      } else {
        alert('An unexpected error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4">
      <form onSubmit={handleSignIn}>
        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 border rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="ml-2 p-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          {loading ? 'Loading...' : 'Send magic link'}
        </button>
      </form>
    </div>
  )
}
