import { render, screen, fireEvent } from '@testing-library/react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Auth from '@/components/Auth'

// Mock de Supabase
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: jest.fn()
}))

describe('Auth Component', () => {
  const mockSignIn = jest.fn()
  const mockSignUp = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(createClientComponentClient as jest.Mock).mockReturnValue({
      auth: {
        signInWithPassword: mockSignIn,
        signUp: mockSignUp
      }
    })
  })

  it('renders login form by default', () => {
    render(<Auth />)
    expect(screen.getByText('Connexion')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Mot de passe')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Se connecter' })).toBeInTheDocument()
  })

  it('toggles between login and signup forms', () => {
    render(<Auth />)
    
    // Vérifier l'état initial (login)
    expect(screen.getByText('Connexion')).toBeInTheDocument()
    
    // Cliquer sur le lien d'inscription
    fireEvent.click(screen.getByText("Pas encore de compte ?"))
    
    // Vérifier que le formulaire d'inscription est affiché
    expect(screen.getByText('Inscription')).toBeInTheDocument()
    
    // Retourner au formulaire de connexion
    fireEvent.click(screen.getByText("Déjà un compte ?"))
    expect(screen.getByText('Connexion')).toBeInTheDocument()
  })

  it('handles login submission', async () => {
    mockSignIn.mockResolvedValue({ error: null })
    
    render(<Auth />)
    
    // Remplir le formulaire
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByPlaceholderText('Mot de passe'), {
      target: { value: 'password123' }
    })
    
    // Soumettre le formulaire
    fireEvent.click(screen.getByRole('button', { name: 'Se connecter' }))
    
    expect(mockSignIn).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    })
  })

  it('handles signup submission', async () => {
    mockSignUp.mockResolvedValue({ error: null })
    
    render(<Auth />)
    
    // Aller au formulaire d'inscription
    fireEvent.click(screen.getByText("Pas encore de compte ?"))
    
    // Remplir le formulaire
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByPlaceholderText('Mot de passe'), {
      target: { value: 'password123' }
    })
    
    // Soumettre le formulaire
    fireEvent.click(screen.getByRole('button', { name: "S'inscrire" }))
    
    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    })
  })

  it('displays error messages', async () => {
    mockSignIn.mockResolvedValue({ 
      error: { message: 'Invalid credentials' } 
    })
    
    render(<Auth />)
    
    // Soumettre le formulaire avec des informations invalides
    fireEvent.click(screen.getByRole('button', { name: 'Se connecter' }))
    
    // Vérifier que le message d'erreur est affiché
    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument()
  })

  it('handles loading state during submission', async () => {
    mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(<Auth />)
    
    // Soumettre le formulaire
    fireEvent.click(screen.getByRole('button', { name: 'Se connecter' }))
    
    // Vérifier que le bouton est désactivé pendant le chargement
    expect(screen.getByRole('button', { name: 'Se connecter' })).toBeDisabled()
  })
})
