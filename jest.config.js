const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleDirectories: ['node_modules', 'src'],
  moduleNameMapper: {
    '^@/components/(.*)$': '<rootDir>/src/components/',
    '^@/lib/(.*)$': '<rootDir>/src/lib/',
    '^@/app/(.*)$': '<rootDir>/src/app/'
  },
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  roots: ['<rootDir>/src']
}

module.exports = createJestConfig(customJestConfig)
