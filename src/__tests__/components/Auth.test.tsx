import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Auth from '@/components/Auth';
import { supabase } from '@/lib/supabase';

// Mock supabase avec la structure exacte attendue
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithOtp: jest.fn().mockResolvedValue({ error: null })
    }
  }
}));

// Mock window.alert
const mockAlert = jest.fn();
window.alert = mockAlert;

describe('Auth', () => {
  const mockSignInWithOtp = jest.mocked(supabase.auth.signInWithOtp);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form', () => {
    render(<Auth />);
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
  });

  it('handles form submission correctly', async () => {
    render(<Auth />);
    const emailInput = screen.getByPlaceholderText(/email/i);
    const submitButton = screen.getByRole('button');

    // Simuler la saisie et la soumission
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    // Vérifier que signInWithOtp est appelé avec les bons paramètres
    await waitFor(() => {
      expect(mockSignInWithOtp).toHaveBeenCalledWith({
        email: 'test@example.com',
        options: {
          emailRedirectTo: 'http://localhost/auth/callback'
        }
      });
      expect(mockAlert).toHaveBeenCalledWith('Check your email for the login link!');
    });
  });

  it('handles error case', async () => {
    const errorMessage = 'Invalid email';
    mockSignInWithOtp.mockResolvedValueOnce({ error: { message: errorMessage } });

    render(<Auth />);
    const emailInput = screen.getByPlaceholderText(/email/i);
    const submitButton = screen.getByRole('button');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith(errorMessage);
    });
  });
});
