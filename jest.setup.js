import '@testing-library/jest-dom'

// Supprimer les warnings inutiles pour les tests
const originalError = console.error
const originalWarn = console.warn

beforeAll(() => {
  console.error = (...args) => {
    if (typeof args[0] === 'string' && 
        (args[0].includes('Warning:') || 
         args[0].includes('Invalid value for prop') ||
         args[0].includes('Failed prop type'))) {
      return
    }
    originalError.apply(console, args)
  }

  console.warn = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Warning:')) {
      return
    }
    originalWarn.apply(console, args)
  }
})

afterAll(() => {
  console.error = originalError
  console.warn = originalWarn
})
