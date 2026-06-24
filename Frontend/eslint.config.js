import reactHooks from 'eslint-plugin-react-hooks';
import react from 'eslint-plugin-react';

const browserGlobals = {
  AbortController: 'readonly',
  Event: 'readonly',
  console: 'readonly',
  document: 'readonly',
  fetch: 'readonly',
  localStorage: 'readonly',
  requestAnimationFrame: 'readonly',
  setTimeout: 'readonly',
  window: 'readonly',
};

export default [
  {
    ignores: ['dist/**', 'node_modules/**', '.ui-checks/**'],
  },
  {
    files: ['src/**/*.{js,jsx}', 'vite.config.js', 'tailwind.config.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: browserGlobals,
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react/jsx-uses-vars': 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
];
