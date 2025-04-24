import { render, screen, fireEvent } from '@testing-library/react';

// Mock supabase avant d'importer les composants qui l'utilisent
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithOtp: jest.fn().mockResolvedValue({ error: null })
    }
  }
}));

import Auth from '@/components/Auth';

describe('Auth', () => {
  it('renders login form', () => {
    render(<Auth />);
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
  });
});
