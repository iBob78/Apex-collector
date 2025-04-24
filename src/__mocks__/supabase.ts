export const supabaseClient = {
  auth: {
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    getUser: jest.fn(),
    getSession: jest.fn(),
    onAuthStateChange: jest.fn()
  }
}

export const createClient = jest.fn(() => supabaseClient)
