import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing environment variables for Supabase configuration')
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// Validation des emails
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Fonction de connexion
export const signInWithEmail = async (email: string) => {
  if (!validateEmail(email)) {
    return { error: { message: 'Invalid email format' } }
  }
  return await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`
    }
  })
}

// Fonction de déconnexion
export const signOut = async () => {
  return await supabase.auth.signOut()
}
