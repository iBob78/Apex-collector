import { supabase } from '@/lib/supabase'

describe('Supabase Client', () => {
  it('should be defined', () => {
    expect(supabase).toBeDefined()
    expect(supabase.auth).toBeDefined()
  })
})
