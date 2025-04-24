import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Auth } from '@/components'
import { supabase } from '@/lib/supabase'

// Mock du module supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithOtp: jest.fn()
    }
  }
}))

// Mock de window.alert
const mockAlert = jest.fn()
global.alert = mockAlert

describe('Auth Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockAlert.mockClear()
    jest.mocked(supabase.auth.signInWithOtp).mockReset()
  })

  it('renders magic link form', () => {
    render(<Auth />)
    
    expect(screen.getByPlaceholderText('Your email')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Send magic link' })).toBeInTheDocument()
  })

  it('handles email submission', async () => {
    jest.mocked(supabase.auth.signInWithOtp).mockResolvedValueOnce({
      data: {},
      error: null
    })

    render(<Auth />)
    
    // Remplir le formulaire
    const emailInput = screen.getByPlaceholderText('Your email')
    fireEvent.change(emailInput, {
      target: { value: 'test@example.com' }
    })
    
    // Simuler la soumission du formulaire
    const form = screen.getByRole('form')
    fireEvent.submit(form)

    await waitFor(() => {
      expect(supabase.auth.signInWithOtp).toHaveBeenCalledWith({
        email: 'test@example.com',
        options: {
          emailRedirectTo: expect.any(String)
        }
      })
      expect(mockAlert).toHaveBeenCalledWith('Check your email for the login link!')
    })
  })

  it('handles submission errors', async () => {
    const errorMessage = 'Invalid email format'
    jest.mocked(supabase.auth.signInWithOtp).mockResolvedValueOnce({
      data: null,
      error: { message: errorMessage }
    })

    render(<Auth />)
    
    // Remplir le formulaire avec un email valide
    const emailInput = screen.getByPlaceholderText('Your email')
    fireEvent.change(emailInput, {
      target: { value: 'test@example.com' }
    })
    
    // Simuler la soumission du formulaire
    const form = screen.getByRole('form')
    fireEvent.submit(form)

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith(errorMessage)
    })
  })

  it('validates email before submission', async () => {
    render(<Auth />)
    
    // Remplir avec un email invalide
    const emailInput = screen.getByPlaceholderText('Your email')
    fireEvent.change(emailInput, {
      target: { value: 'invalid-email' }
    })
    
    // Simuler la soumission du formulaire
    const form = screen.getByRole('form')
    fireEvent.submit(form)

    // La validation HTML5 devrait empêcher la soumission
    expect(emailInput).toHaveAttribute('type', 'email')
    expect(supabase.auth.signInWithOtp).not.toHaveBeenCalled()
  })

  it('disables button during submission', async () => {
    jest.mocked(supabase.auth.signInWithOtp).mockImplementationOnce(
      () => new Promise(resolve => setTimeout(resolve, 100))
    )

    render(<Auth />)
    
    // Remplir le formulaire
    const emailInput = screen.getByPlaceholderText('Your email')
    fireEvent.change(emailInput, {
      target: { value: 'test@example.com' }
    })
    
    const submitButton = screen.getByRole('button')
    const form = screen.getByRole('form')
    
    // Soumettre le formulaire
    fireEvent.submit(form)
    
    // Le bouton devrait être désactivé immédiatement
    expect(submitButton).toBeDisabled()

    // Attendre la fin de la soumission
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    })
  })
})
