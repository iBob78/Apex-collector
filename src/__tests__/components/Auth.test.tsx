import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Auth from '@/components/Auth'
import { supabase } from '@/lib/supabase'

// Mock automatique du module supabase
jest.mock('@/lib/supabase')

describe('Auth Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders login form by default', () => {
    render(<Auth />)
    
    // Vérification des éléments du formulaire de connexion
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument()
    expect(screen.getByText(/pas encore de compte/i)).toBeInTheDocument()
  })

  it('switches between login and signup forms', () => {
    render(<Auth />)
    
    // Vérifier l'état initial (connexion)
    expect(screen.getByText(/connexion/i)).toBeInTheDocument()
    
    // Passer à l'inscription
    fireEvent.click(screen.getByText(/pas encore de compte/i))
    expect(screen.getByText(/inscription/i)).toBeInTheDocument()
    
    // Revenir à la connexion
    fireEvent.click(screen.getByText(/déjà un compte/i))
    expect(screen.getByText(/connexion/i)).toBeInTheDocument()
  })

  it('handles login submission successfully', async () => {
    const mockUser = { id: '1', email: 'test@example.com' }
    ;(supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
      data: { user: mockUser },
      error: null
    })

    render(<Auth />)
    
    // Remplir le formulaire
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByLabelText(/mot de passe/i), {
      target: { value: 'password123' }
    })
    
    // Soumettre le formulaire
    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }))

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
    })
  })

  it('handles signup submission successfully', async () => {
    const mockUser = { id: '1', email: 'test@example.com' }
    ;(supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({
      data: { user: mockUser },
      error: null
    })

    render(<Auth />)
    
    // Aller au formulaire d'inscription
    fireEvent.click(screen.getByText(/pas encore de compte/i))
    
    // Remplir le formulaire
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByLabelText(/mot de passe/i), {
      target: { value: 'password123' }
    })
    
    // Soumettre le formulaire
    fireEvent.click(screen.getByRole('button', { name: /s'inscrire/i }))

    await waitFor(() => {
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
    })
  })

  it('displays error messages on login failure', async () => {
    const errorMessage = 'Invalid credentials'
    ;(supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
      data: null,
      error: { message: errorMessage }
    })

    render(<Auth />)
    
    // Soumettre le formulaire sans données
    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }))

    // Vérifier que le message d'erreur s'affiche
    expect(await screen.findByText(errorMessage)).toBeInTheDocument()
  })

  it('handles loading state during submission', async () => {
    ;(supabase.auth.signInWithPassword as jest.Mock).mockImplementationOnce(() =>
      new Promise(resolve => setTimeout(resolve, 100))
    )

    render(<Auth />)
    
    // Soumettre le formulaire
    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }))
    
    // Vérifier que le bouton est désactivé
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeDisabled()
  })
})
