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
  it('creates a supabase client', () => {
    expect(supabase).toBeDefined()
    expect(supabase.auth).toBeDefined()
  })

  describe('signInWithEmail', () => {
    it('calls signInWithOtp with correct parameters', async () => {
      const result = await signInWithEmail('test@example.com')
      expect(result.error).toBeNull()
      expect(supabase.auth.signInWithOtp).toHaveBeenCalledWith({
        email: 'test@example.com',
        options: {
          emailRedirectTo: 'http://localhost/auth/callback'
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
