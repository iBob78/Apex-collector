import '@testing-library/jest-dom';

// Setup global mocks
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithOtp: jest.fn().mockResolvedValue({ error: null })
    }
  }
}));
