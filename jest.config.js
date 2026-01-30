module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/components'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
