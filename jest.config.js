module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom', // Changed to jsdom for React components
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transform: {
    // Use ts-jest for ts and tsx files
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json', 
      // Add babelConfig to handle JSX if ts-jest alone isn't enough
      // babelConfig: true, // You might need to install @babel/preset-react
    }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'], // Added tsx and jsx
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  // Add setup file to polyfill `TextEncoder` if needed for `gray-matter` or other deps
  // setupFilesAfterEnv: ['./jest.setup.js'], // Create this file if you need it
};
