import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Auth from '@/components/Auth';
import { signInWithEmail } from '@/lib/supabase';
import { act } from 'react-dom/test-utils';

jest.mock('@/lib/supabase');

describe('Auth Component', () => {
  const mockSignIn = signInWithEmail as jest.MockedFunction<typeof signInWithEmail>;
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('validates email format before submission', async () => {
    render(<Auth />);
    const emailInput = screen.getByPlaceholderText(/email/i);
    const submitButton = screen.getByRole('button');

    // Test avec email invalide
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.click(submitButton);
    });

    expect(mockSignIn).not.toHaveBeenCalled();
    expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();

    // Test avec email valide
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);
    });

    expect(mockSignIn).toHaveBeenCalledWith('test@example.com');
  });

  it('handles network errors gracefully', async () => {
    mockSignIn.mockRejectedValueOnce(new Error('Network error'));

    render(<Auth />);
    const emailInput = screen.getByPlaceholderText(/email/i);
    const submitButton = screen.getByRole('button');

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);
    });

    expect(await screen.findByText(/error occurred/i)).toBeInTheDocument();
  });
});
