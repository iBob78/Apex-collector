import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Auth from '@/components/Auth'

// Mock du module supabase
jest.mock('../../lib/supabase')

describe('Auth Component', () => {
  const { supabase } = require('../../lib/supabase')

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders magic link form', () => {
    render(<Auth />)
    
    // Vérifier les éléments du formulaire
    expect(screen.getByPlaceholderText('Your email')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Send magic link' })).toBeInTheDocument()
  })

  it('handles email submission', async () => {
    supabase.auth.signInWithOtp = jest.fn().mockResolvedValueOnce({
      data: {},
      error: null
    })

    render(<Auth />)
    
    // Remplir et soumettre le formulaire
    const emailInput = screen.getByPlaceholderText('Your email')
    fireEvent.change(emailInput, {
      target: { value: 'test@example.com' }
    })
    
    const submitButton = screen.getByRole('button', { name: 'Send magic link' })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(supabase.auth.signInWithOtp).toHaveBeenCalledWith({
        email: 'test@example.com',
        options: {
          emailRedirectTo: expect.any(String)
        }
      })
    })
  })

  it('displays error message on submission failure', async () => {
    const errorMessage = 'Invalid email format'
    supabase.auth.signInWithOtp = jest.fn().mockResolvedValueOnce({
      data: null,
      error: { message: errorMessage }
    })

    render(<Auth />)
    
    // Soumettre le formulaire avec un email invalide
    const submitButton = screen.getByRole('button', { name: 'Send magic link' })
    fireEvent.click(submitButton)

    // Vérifier que le message d'erreur s'affiche
    expect(await screen.findByText(errorMessage)).toBeInTheDocument()
  })

  it('shows success message after successful submission', async () => {
    supabase.auth.signInWithOtp = jest.fn().mockResolvedValueOnce({
      data: {},
      error: null
    })

    render(<Auth />)
    
    // Remplir et soumettre le formulaire
    const emailInput = screen.getByPlaceholderText('Your email')
    fireEvent.change(emailInput, {
      target: { value: 'test@example.com' }
    })
    
    const submitButton = screen.getByRole('button', { name: 'Send magic link' })
    fireEvent.click(submitButton)

    // Vérifier le message de succès
    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument()
    })
  })

  it('handles loading state during submission', async () => {
    supabase.auth.signInWithOtp = jest.fn().mockImplementationOnce(
      () => new Promise(resolve => setTimeout(resolve, 100))
    )

    render(<Auth />)
    
    // Soumettre le formulaire
    const submitButton = screen.getByRole('button', { name: 'Send magic link' })
    fireEvent.click(submitButton)
    
    // Vérifier que le bouton est désactivé
    expect(submitButton).toBeDisabled()
  })

  it('validates email format', async () => {
    render(<Auth />)
    
    // Soumettre le formulaire avec un email invalide
    const emailInput = screen.getByPlaceholderText('Your email')
    fireEvent.change(emailInput, {
      target: { value: 'invalid-email' }
    })
    
    const submitButton = screen.getByRole('button', { name: 'Send magic link' })
    fireEvent.click(submitButton)

    // Vérifier le message de validation
    expect(await screen.findByText(/invalid email format/i)).toBeInTheDocument()
  })
})
