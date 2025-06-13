import { defineConfig, mergeConfig } from 'vitest/config';

import baseConfig from './vitest.config';

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      // Use jsdom environment for React component testing
      environment: 'jsdom',

      // Include patterns for component tests
      include: [
        'components/**/*.{test,spec}.{ts,tsx}',
        'app/**/*.{test,spec}.{ts,tsx}',
      ],

      // Setup files specific to browser/React testing
      setupFiles: ['./tests/unit/setup.browser.ts'],

      // Browser-specific test name
      name: 'browser',

      // CSS handling
      css: {
        modules: {
          classNameStrategy: 'non-scoped',
        },
      },
    },
  }),
);
