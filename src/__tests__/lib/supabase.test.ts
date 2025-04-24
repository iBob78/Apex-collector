jest.mock('@/lib/supabase')
import { supabase } from '@/lib/supabase'

describe('Supabase Client', () => {
  it('should be defined', () => {
    expect(supabase).toBeDefined()
    expect(supabase.auth).toBeDefined()
  })

  it('should have required auth methods', () => {
    expect(supabase.auth.signInWithOtp).toBeDefined()
    expect(supabase.auth.getSession).toBeDefined()
    expect(supabase.auth.onAuthStateChange).toBeDefined()
  })
})
