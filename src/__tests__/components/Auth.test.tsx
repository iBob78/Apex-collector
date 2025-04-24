import { render, screen, fireEvent, act } from '@testing-library/react';
import { supabase } from '@/lib/supabase';
import Auth from '@/components/Auth';
import '../lib/__mocks__/windowMock';

// Mock supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithOtp: jest.fn()
    }
  }
}));

describe('Auth', () => {
  const mockSignInWithOtp = jest.mocked(supabase.auth.signInWithOtp);
  const expectedOptions = {
    email: 'test@example.com',
    options: {
      emailRedirectTo: 'http://localhost/auth/callback'
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSignInWithOtp.mockResolvedValue({ error: null });
  });

  it('renders login form', () => {
    render(<Auth />);
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
  });

  it('handles form submission', async () => {
    render(<Auth />);
    const emailInput = screen.getByPlaceholderText(/email/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button');

    // Wrapper les actions dans act()
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);
    });

    // Vérifier l'appel avec les options complètes
    expect(mockSignInWithOtp).toHaveBeenCalledWith(expectedOptions);
    expect(window.alert).toHaveBeenCalledWith('Check your email for the login link!');
  });

  it('handles submission error', async () => {
    const errorMessage = 'Test error';
    mockSignInWithOtp.mockResolvedValue({ error: { message: errorMessage } });

    render(<Auth />);
    const emailInput = screen.getByPlaceholderText(/email/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button');

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);
    });

    expect(window.alert).toHaveBeenCalledWith(errorMessage);
  });
});
