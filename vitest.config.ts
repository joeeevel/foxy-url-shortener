import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/__tests__/**/*.test.ts'],
    env: {
      NODE_ENV: 'test',
      VITEST: 'true',
      DATABASE_URL: 'postgresql://mock:mock@localhost:5432/mock',
    },
    testTimeout: 10000,
  },
});
