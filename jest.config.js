const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './'
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/lib/(.*)$': '<rootDir>/src/lib/',
    '^@/components/(.*)$': '<rootDir>/src/components/',
    '^@/(.*)$': '<rootDir>/src/'
  },
  moduleDirectories: ['node_modules', 'src'],
  roots: ['<rootDir>/src'],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/'
  ],
  verbose: true
};

module.exports = createJestConfig(customJestConfig);
