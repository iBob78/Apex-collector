import { render, screen, fireEvent } from '@testing-library/react';
import { supabase } from '@/lib/supabase';
import Auth from '@/components/Auth';

// Mock the entire supabase module
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithOtp: jest.fn()
    }
  }
}));

describe('Auth', () => {
  const mockSignInWithOtp = jest.mocked(supabase.auth.signInWithOtp);

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    mockSignInWithOtp.mockResolvedValue({ error: null });
  });

  it('renders login form', () => {
    render(<Auth />);
    const emailInput = screen.getByPlaceholderText(/email/i);
    expect(emailInput).toBeInTheDocument();
  });

  it('handles form submission', async () => {
    render(<Auth />);
    const emailInput = screen.getByPlaceholderText(/email/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    expect(mockSignInWithOtp).toHaveBeenCalledWith({
      email: 'test@example.com'
    });
  });
});
