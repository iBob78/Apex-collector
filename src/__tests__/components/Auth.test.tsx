import { render, screen } from '@testing-library/react';
import Auth from '@/components/Auth';

// Mock direct au lieu d'utiliser jest.mock
const mockSupabase = {
  auth: {
    signInWithOtp: jest.fn().mockResolvedValue({ error: null })
  }
};

jest.mock('@/lib/supabase', () => ({
  supabase: mockSupabase
}));

describe('Auth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form', () => {
    render(<Auth />);
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
  });

  it('handles form submission', async () => {
    render(<Auth />);
    const emailInput = screen.getByPlaceholderText(/email/i);
    const submitButton = screen.getByRole('button');

    // Simuler la saisie de l'email
    emailInput.setAttribute('value', 'test@example.com');
    submitButton.click();

    // Vérifier que signInWithOtp a été appelé
    expect(mockSupabase.auth.signInWithOtp).toHaveBeenCalledWith({
      email: 'test@example.com'
    });
  });
});
