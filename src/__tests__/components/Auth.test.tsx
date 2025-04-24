import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Auth from '@/components/Auth'

// Mock du module supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn()
    }
  }
}))

describe('Auth Component', () => {
  const mockSupabase = require('@/lib/supabase').supabase

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders login form by default', () => {
    render(<Auth />)
    
    // Vérification des éléments du formulaire de connexion
    expect(screen.getByRole('heading', { name: /connexion/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/mot de passe/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument()
  })

  it('switches between login and signup forms', () => {
    render(<Auth />)
    
    // Vérifier l'état initial (connexion)
    expect(screen.getByRole('heading', { name: /connexion/i })).toBeInTheDocument()
    
    // Passer à l'inscription
    fireEvent.click(screen.getByText(/pas encore de compte/i))
    expect(screen.getByRole('heading', { name: /inscription/i })).toBeInTheDocument()
    
    // Revenir à la connexion
    fireEvent.click(screen.getByText(/déjà un compte/i))
    expect(screen.getByRole('heading', { name: /connexion/i })).toBeInTheDocument()
  })

  it('handles login form submission', async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: { id: '1' } },
      error: null
    })

    render(<Auth />)
    
    // Remplir et soumettre le formulaire
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByPlaceholderText(/mot de passe/i), {
      target: { value: 'password123' }
    })
    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }))

    await waitFor(() => {
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
    })
  })

  it('handles signup form submission', async () => {
    mockSupabase.auth.signUp.mockResolvedValueOnce({
      data: { user: { id: '1' } },
      error: null
    })

    render(<Auth />)
    
    // Passer au formulaire d'inscription
    fireEvent.click(screen.getByText(/pas encore de compte/i))
    
    // Remplir et soumettre le formulaire
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByPlaceholderText(/mot de passe/i), {
      target: { value: 'password123' }
    })
    fireEvent.click(screen.getByRole('button', { name: /s'inscrire/i }))

    await waitFor(() => {
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
    })
  })

  it('displays error messages', async () => {
    const errorMessage = 'Invalid credentials'
    mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: null,
      error: { message: errorMessage }
    })

    render(<Auth />)
    
    // Soumettre le formulaire sans données
    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }))

    expect(await screen.findByText(errorMessage)).toBeInTheDocument()
  })

  it('handles loading state during form submission', async () => {
    mockSupabase.auth.signInWithPassword.mockImplementationOnce(() =>
      new Promise(resolve => setTimeout(resolve, 100))
    )

    render(<Auth />)
    
    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }))
    
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeDisabled()
  })
})
