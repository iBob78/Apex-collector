'use client'

import { FormEvent, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      alert('Please enter your email')
      return
    }

    try {
      setIsLoading(true)
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        alert(error.message)
      } else {
        alert('Check your email for the login link!')
        setEmail('')
      }
    } catch (error) {
      alert('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} aria-label="Authentication form">
        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 border rounded"
          required
        />
        <button
          type="submit"
          disabled={isLoading}
          className="ml-2 p-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Send magic link
        </button>
      </form>
    </div>
  )
}
