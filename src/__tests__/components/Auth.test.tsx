import { render, screen } from '@testing-library/react';

// Mock implementation
const mockSignInWithOtp = jest.fn().mockResolvedValue({ error: null });
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithOtp: mockSignInWithOtp
    }
  }
}));

import Auth from '@/components/Auth';

describe('Auth', () => {
  beforeEach(() => {
    mockSignInWithOtp.mockClear();
  });

  it('renders login form', () => {
    render(<Auth />);
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
  });
});
