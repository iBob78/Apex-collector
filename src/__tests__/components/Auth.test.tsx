import { render, screen, fireEvent } from '@testing-library/react';
import Auth from '@/components/Auth';

// Configure le mock avant l'import du composant
const mockSignInWithOtp = jest.fn().mockResolvedValue({ error: null });

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithOtp: mockSignInWithOtp
    }
  }
}));

describe('Auth', () => {
  beforeEach(() => {
    mockSignInWithOtp.mockClear();
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

    // Utiliser fireEvent au lieu de setAttribute
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    expect(mockSignInWithOtp).toHaveBeenCalledWith({
      email: 'test@example.com'
    });
  });
});
