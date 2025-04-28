import { supabase, signInWithEmail, signOut, validateEmail } from '@/lib/supabase'

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signInWithOtp: jest.fn().mockResolvedValue({ error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null })
    }
  }))
}))

describe('Supabase Client', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'http://test.com',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-key'
    }
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost:3000' }
    })
  })

  afterEach(() => {
    process.env = originalEnv
    jest.clearAllMocks()
  })

  describe('validateEmail', () => {
    it('validates correct email format', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('')).toBe(false)
    })
  })

  describe('signInWithEmail', () => {
    it('calls signInWithOtp with correct parameters', async () => {
      const result = await signInWithEmail('test@example.com')
      expect(result.error).toBeNull()
      expect(supabase.auth.signInWithOtp).toHaveBeenCalledWith({
        email: 'test@example.com',
        options: {
          emailRedirectTo: 'http://localhost:3000/auth/callback'
        }
      })
    })

    it('returns error for invalid email', async () => {
      const result = await signInWithEmail('invalid-email')
      expect(result.error).toBeDefined()
      expect(result.error.message).toBe('Invalid email format')
    })
  })

  describe('signOut', () => {
    it('calls signOut method', async () => {
      const result = await signOut()
      expect(result.error).toBeNull()
      expect(supabase.auth.signOut).toHaveBeenCalled()
    })
  })
})
