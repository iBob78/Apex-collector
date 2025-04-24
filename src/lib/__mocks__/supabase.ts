export const supabase = {
  auth: {
    signInWithOtp: jest.fn(),
    getSession: jest.fn(),
    onAuthStateChange: jest.fn()
  }
}

export default supabase
