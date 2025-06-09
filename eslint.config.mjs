import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import validateFilename from 'eslint-plugin-validate-filename';
import noRelativeImportPaths from 'eslint-plugin-no-relative-import-paths';
import sonarjs from 'eslint-plugin-sonarjs';
import importPlugin from 'eslint-plugin-import';
import unusedImports from 'eslint-plugin-unused-imports';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends(
    'next/core-web-vitals',
    'next/typescript',
    'plugin:@typescript-eslint/strict-type-checked',
    'plugin:prettier/recommended',
  ),
  sonarjs.configs.recommended,
  {
    plugins: {
      'validate-filename': validateFilename,
      'no-relative-import-paths': noRelativeImportPaths,
      import: importPlugin,
      'unused-imports': unusedImports,
    },
    rules: {
      'validate-filename/naming-rules': [
        'error',
        {
          rules: [{ case: 'kebab', target: '**/*', excludes: ['**/[[]*'] }],
        },
      ],
      'no-relative-import-paths/no-relative-import-paths': [
        'error',
        {
          allowSameFolder: true, // Allow "./file" for same-folder imports
          rootDir: '', // Don't strip any root directory
          prefix: '@', // Use "@" prefix for absolute imports
          allowedDepth: 1,
        },
      ],
      // Import plugin rules
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/no-duplicates': 'error',
      'import/no-unresolved': 'error',
      'import/no-cycle': 'error',
      // Override SonarJS rules if needed
      'sonarjs/cognitive-complexity': ['error', 15],
      'sonarjs/no-duplicate-string': ['error', { threshold: 4 }],
      'sonarjs/prefer-read-only-props': 'off', // Too strict for React components
      'sonarjs/void-use': 'off', // Sometimes needed for event handlers
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'error',
      '@typescript-eslint/strict-boolean-expressions': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
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
        { selector: 'variableLike', format: ['camelCase'], leadingUnderscore: 'allow' },
        { selector: 'typeLike', format: ['PascalCase'] },
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
