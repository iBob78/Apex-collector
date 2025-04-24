export const supabase = {
  auth: {
    signInWithOtp: jest.fn().mockResolvedValue({ error: null })
  }
};

export default supabase;
