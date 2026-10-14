import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    // Use a separate test database
    setupFiles: ['./tests/setup.ts'],
    testTimeout: 30000,
  },
});
