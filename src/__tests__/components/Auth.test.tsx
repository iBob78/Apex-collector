import { render, screen, fireEvent } from '@testing-library/react';
import Auth from '@/components/Auth';

// Mock automatique via __mocks__
jest.mock('@/lib/supabase');

describe('Auth', () => {
  it('renders login form', () => {
    render(<Auth />);
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
  });

  it('handles form submission', async () => {
    render(<Auth />);
    const input = screen.getByPlaceholderText(/email/i);
    const button = screen.getByRole('button');

    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.click(button);

    // Attendre que le formulaire soit soumis
    await screen.findByText(/Check your email/i);
  });
});
