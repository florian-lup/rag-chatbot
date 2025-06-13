import path from 'path';
import { fileURLToPath } from 'url';

import { defineConfig } from 'vitest/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  test: {
    // Environment for running tests
    environment: 'node',

    // Include patterns for test files
    include: ['tests/unit/**/*.{test,spec}.{ts,tsx,js,jsx}'],

    // Exclude patterns
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/playwright-report/**',
      '**/test-results/**',
    ],

    // Enable global test APIs (describe, it, expect, etc.)
    globals: true,

    // Setup files to run before tests
    setupFiles: ['./tests/unit/setup.ts'],

    // Coverage configuration
    coverage: {
      enabled: false, // Set to true when running with --coverage
      provider: 'v8', // or 'istanbul'
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: [
        'app/**/*.{ts,tsx}',
        'components/**/*.{ts,tsx}',
        'lib/**/*.{ts,tsx}',
        'hooks/**/*.{ts,tsx}',
      ],
      exclude: [
        'node_modules/**',
        'tests/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData.ts',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
      ],
      thresholds: {
        lines: 1,
        functions: 1,
        branches: 1,
        statements: 1,
      },
      // Only check thresholds for files that have tests
      skipFull: true,
    },

    // Test timeout
    testTimeout: 10000,

    // Hook timeout
    hookTimeout: 10000,

    // Pool options for running tests
    pool: 'forks', // 'threads' or 'forks'

    // Reporter configuration
    reporters: ['default'],

    // Output file for HTML reporter
    outputFile: {
      html: './test-results/vitest/index.html',
    },
  },

  // Resolve configuration for module aliases
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@/app': path.resolve(__dirname, './app'),
      '@/components': path.resolve(__dirname, './components'),
      '@/lib': path.resolve(__dirname, './lib'),
      '@/hooks': path.resolve(__dirname, './hooks'),
      '@/types': path.resolve(__dirname, './types'),
    },
  },
});
