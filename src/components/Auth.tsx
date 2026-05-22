import { useState } from 'react'
import { signInWithEmail } from ''

export default function Auth() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setLoading(true)

    try {
      const { error: signInError } = await signInWithEmail(email)
      if (signInError) {
        setError(signInError.message)
      } else {
        setSuccessMessage('Check your email for the login link!')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col w-full justify-center gap-2">
        <label className="text-md" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-md px-4 py-2 bg-inherit border mb-6"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-green-700 rounded px-4 py-2 text-white mb-6 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Send magic link'}
        </button>
        {error && (
          <p className="text-red-500 text-sm" role="alert">{error}</p>
        )}
        {successMessage && (
          <p className="text-green-500 text-sm" role="status">{successMessage}</p>
        )}
      </form>
    </div>
  )
}
