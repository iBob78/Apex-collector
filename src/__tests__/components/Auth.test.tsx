import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Auth from '@/components/Auth'
import { signInWithEmail } from '@/lib/supabase'

jest.mock('@/lib/supabase')

describe('Auth Component', () => {
  const mockSignIn = signInWithEmail as jest.MockedFunction<typeof signInWithEmail>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('validates email format before submission', async () => {
    render(<Auth />)
    const emailInput = screen.getByPlaceholderText(/email@example.com/i)
    const submitButton = screen.getByRole('button')

    // Test avec email invalide
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockSignIn).not.toHaveBeenCalled()
    })

    // Test avec email valide
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com')
    })
  })

  it('displays loading state during submission', async () => {
    mockSignIn.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(<Auth />)
    const emailInput = screen.getByPlaceholderText(/email@example.com/i)
    const submitButton = screen.getByRole('button')

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.click(submitButton)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('handles network errors gracefully', async () => {
    mockSignIn.mockRejectedValueOnce(new Error('Network error'))

    render(<Auth />)
    const emailInput = screen.getByPlaceholderText(/email@example.com/i)
    const submitButton = screen.getByRole('button')

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('An error occurred. Please try again.')).toBeInTheDocument()
    })
  })

  it('shows success message on successful submission', async () => {
    const mockAlert = jest.spyOn(window, 'alert').mockImplementation()
    mockSignIn.mockResolvedValueOnce({ error: null })

    render(<Auth />)
    const emailInput = screen.getByPlaceholderText(/email@example.com/i)
    const submitButton = screen.getByRole('button')

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Check your email for the login link!')
    })

    mockAlert.mockRestore()
  })
})
