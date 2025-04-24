import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Auth from '@/components/Auth'

// Mock du module supabase
jest.mock('../../lib/supabase', () => ({
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
  const { supabase } = require('../../lib/supabase')

  beforeEach(() => {
    jest.clearAllMocks()
    mockAlert.mockClear()
  })

  it('renders magic link form', () => {
    render(<Auth />)
    
    expect(screen.getByPlaceholderText('Your email')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Send magic link' })).toBeInTheDocument()
  })

  it('handles email submission', async () => {
    supabase.auth.signInWithOtp.mockResolvedValueOnce({
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
    supabase.auth.signInWithOtp.mockResolvedValueOnce({
      data: null,
      error: { message: errorMessage }
    })

    render(<Auth />)
    
    // Simuler la soumission du formulaire
    const form = screen.getByRole('form')
    fireEvent.submit(form)

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith(errorMessage)
    })
  })

  it('validates email format before submission', async () => {
    render(<Auth />)
    
    // Remplir avec un email invalide
    const emailInput = screen.getByPlaceholderText('Your email')
    fireEvent.change(emailInput, {
      target: { value: 'invalid-email' }
    })
    
    // Simuler la soumission du formulaire
    const form = screen.getByRole('form')
    fireEvent.submit(form)

    expect(emailInput).toBeInvalid()
    expect(supabase.auth.signInWithOtp).not.toHaveBeenCalled()
  })

  it('disables submit button during submission', async () => {
    supabase.auth.signInWithOtp.mockImplementationOnce(
      () => new Promise(resolve => setTimeout(resolve, 100))
    )

    render(<Auth />)
    
    const submitButton = screen.getByRole('button')
    const form = screen.getByRole('form')
    
    // Remplir le formulaire et soumettre
    const emailInput = screen.getByPlaceholderText('Your email')
    fireEvent.change(emailInput, {
      target: { value: 'test@example.com' }
    })
    fireEvent.submit(form)
    
    expect(submitButton).toHaveAttribute('disabled')

    await waitFor(() => {
      expect(submitButton).not.toHaveAttribute('disabled')
    })
  })
})
