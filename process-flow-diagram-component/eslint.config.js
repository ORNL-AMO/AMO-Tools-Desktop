// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const reactHooks = require('eslint-plugin-react-hooks');
const reactRefresh = require('eslint-plugin-react-refresh');
const globals = require('globals');

module.exports = tseslint.config(
  {
    ignores: ['dist/**', 'coverage/**'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.recommended,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        projectService: {
          allowDefaultProject: ['vitest.config.ts'],
        },
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      'react-refresh/only-export-components': 'error',
      'react-hooks/exhaustive-deps': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-for-in-array': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
    },
  },
  {
    files: ['src/**/*.test.{ts,tsx}', 'src/__tests__/**/*.{ts,tsx}'],
    languageOptions: {
      globals: globals.vitest,
      parserOptions: {
        // projectService only resolves files named tsconfig.json, so tests would miss the vitest/globals
        // types in tsconfig.test.json and the promise rules would treat expect/vi as any.
        projectService: false,
        project: './tsconfig.test.json',
      },
    },
  },
);
