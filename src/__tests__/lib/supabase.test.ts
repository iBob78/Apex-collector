import { supabase, signInWithEmail, signOut } from '@/lib/supabase'

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
  })

  it('creates a supabase client with environment variables', () => {
    expect(supabase).toBeDefined()
    expect(supabase.auth).toBeDefined()
  })

  it('throws error when environment variables are missing', () => {
    jest.resetModules()
    process.env.NEXT_PUBLIC_SUPABASE_URL = undefined
    expect(() => require('@/lib/supabase')).toThrow()
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
  })

  describe('signOut', () => {
    it('calls signOut method', async () => {
      const result = await signOut()
      expect(result.error).toBeNull()
      expect(supabase.auth.signOut).toHaveBeenCalled()
    })
  })
})
