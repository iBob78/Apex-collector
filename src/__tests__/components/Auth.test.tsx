import { render, screen, fireEvent } from '@testing-library/react';
import Auth from '@/components/Auth';

// Le mock sera automatiquement utilisé depuis lib/__mocks__/supabase.ts
jest.mock('@/lib/supabase');

describe('Auth', () => {
  it('renders login form', () => {
    render(<Auth />);
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
  });
});
