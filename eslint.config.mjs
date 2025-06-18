import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import validateFilename from 'eslint-plugin-validate-filename';
import noRelativeImportPaths from 'eslint-plugin-no-relative-import-paths';
import sonarjs from 'eslint-plugin-sonarjs';
import importPlugin from 'eslint-plugin-import';
import unusedImports from 'eslint-plugin-unused-imports';
import reactHooks from 'eslint-plugin-react-hooks';

/**
 * Flat ESLint configuration aligned with Next.js 15 best‑practice "web‑vitals" preset
 * plus stricter TypeScript rules, Prettier formatting, React‑specific hook checks,
 * import hygiene and filename / path conventions.
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Global ignores -------------------------------------------
  {
    ignores: [
      // Build outputs
      '.next/**/*',
      'out/**/*',
      'build/**/*',
      'dist/**/*',

      // Dependencies
      'node_modules/**/*',
      '.pnp/**/*',
      '.yarn/**/*',

      // Generated files
      'next-env.d.ts',
      '*.tsbuildinfo',

      // Cache directories
      '.cache/**/*',
      'coverage/**/*',
      'playwright-report/**/*',
      'test-results/**/*',
      'blob-report/**/*',
      'playwright/.cache/**/*',

      // Config files that don't need linting
      'pnpm-lock.yaml',
      '*.lock',

      // OS/Editor files
      '.DS_Store',
      '.vscode/**/*',
      '.idea/**/*',

      // Env files
      '.env*',
      '!.env.example',

      // Vercel
      '.vercel/**/*',
    ],
  },

  // Base presets -----------------------------------------------------------
  ...compat.extends(
    'next/core-web-vitals',
    'next/typescript',
    'plugin:@typescript-eslint/strict-type-checked',
    'plugin:react-hooks/recommended', // NEW – enforce rules‑of‑hooks & deps array
    'plugin:prettier/recommended',
  ),
  sonarjs.configs.recommended,

  // Project‑wide rules / plugins -------------------------------------------
  {
    plugins: {
      'validate-filename': validateFilename,
      'no-relative-import-paths': noRelativeImportPaths,
      import: importPlugin,
      'unused-imports': unusedImports,
      'react-hooks': reactHooks,
    },
    rules: {
      /* ---------- Naming / organisation ----------------*/
      'validate-filename/naming-rules': [
        'error',
        {
          rules: [
            {
              case: 'camel',
              target: '**/hooks/**', // React hooks should use camelCase
              patterns: '^use', // React hooks start with "use"
            },
            {
              case: 'kebab',
              target: '**/*',
              excludes: [
                '**/[[]*', // ignored: "[...slug]" etc.
                '**/page.*', // Next.js special filenames
                '**/layout.*',
                'hooks', // Exclude hooks directory from kebab-case rule
              ],
            },
          ],
        },
      ],
      'no-relative-import-paths/no-relative-import-paths': [
        'error',
        {
          allowSameFolder: true,
          rootDir: '',
          prefix: '@',
          allowedDepth: 1,
        },
      ],

      /* ---------- Import ordering / cycles -------------*/
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/no-duplicates': 'error',
      'import/no-unresolved': 'error',
      'import/no-cycle': 'error',
      // Prevent leaking dev deps into prod bundle
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: [
            '**/*.test.{ts,tsx,js,jsx}',
            '**/*.spec.{ts,tsx,js,jsx}',
            '**/test/**',
            '**/tests/**',
            '**/scripts/**',
            'playwright.config.ts',
            'vitest.config.ts',
            'vitest.config.browser.ts',
            'eslint.config.mjs',
            'next.config.ts',
            'postcss.config.mjs',
          ],
        },
      ],

      /* ---------- SonarJS tweaks ----------------------*/
      'sonarjs/cognitive-complexity': ['error', 15],
      'sonarjs/no-duplicate-string': ['error', { threshold: 4 }],
      'sonarjs/prefer-read-only-props': 'off',
      'sonarjs/void-use': 'off',

      /* ---------- Unused import / vars ----------------*/
      'unused-imports/no-unused-imports': 'error',
      // Let TS compiler + unused-imports handle vars; no duplicate rule needed

      /* ---------- React hooks -------------------------*/
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  // TypeScript‑specific rules applied only to TS/JS files --------------------
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parserOptions: {
        // Use main tsconfig with ignores handling exclusions
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'error',
      '@typescript-eslint/strict-boolean-expressions': 'error',
      '@typescript-eslint/no-non-null-assertion': 'warn', // downgraded to warn – practical in event handlers
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'typeParameter', format: ['PascalCase'], prefix: ['T'] },
        { selector: 'enumMember', format: ['UPPER_CASE'] },
        {
          selector: 'variable',
          modifiers: ['const'],
          format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
        },
        { selector: 'function', format: ['camelCase', 'PascalCase'] },
        {
          selector: 'function',
          filter: { regex: '^use[A-Z].*', match: true },
          format: ['camelCase'],
        },
        {
          selector: 'variableLike',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
        { selector: 'typeLike', format: ['PascalCase'] },
        // Allow __filename and __dirname in config files
        {
          selector: 'variable',
          filter: { regex: '^__(filename|dirname)$', match: true },
          format: null,
        },
      ],
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: false,
        },
      ],
    },
  },
];

export default eslintConfig;
