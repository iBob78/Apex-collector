export const mockSupabase = {
  auth: {
    signInWithOtp: jest.fn().mockResolvedValue({ error: null }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
    getSession: jest.fn(),
    onAuthStateChange: jest.fn()
  },
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
};

export const supabase = mockSupabase;

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const signInWithEmail = jest.fn().mockResolvedValue({ error: null });
export const signOut = jest.fn().mockResolvedValue({ error: null });
