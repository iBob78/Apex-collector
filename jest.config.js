const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleDirectories: ['node_modules', '<rootDir>/'],
  moduleNameMapper: {
    '^@/components/(.*)$': '<rootDir>/src/components/',
    '^@/lib/(.*)$': '<rootDir>/src/lib/',
    '^@/types/(.*)$': '<rootDir>/src/types/',
    '^@/utils/(.*)$': '<rootDir>/src/utils/'
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
  transform: {
    '^.+\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }]
  },
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '^.+\.module\.(css|sass|scss)$'
  ]
}

module.exports = createJestConfig(customJestConfig)
