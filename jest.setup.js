import '@testing-library/jest-dom'

// Fix for console error/warn mock
const originalError = console.error
const originalWarn = console.warn

beforeAll(() => {
  console.error = (...args) => {
    const message = typeof args[0] === 'string' ? args[0] : ''
    if (message.includes('Warning:')) return
    originalError.call(console, ...args)
  }
  console.warn = (...args) => {
    const message = typeof args[0] === 'string' ? args[0] : ''
    if (message.includes('Warning:')) return
    originalWarn.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
  console.warn = originalWarn
})
