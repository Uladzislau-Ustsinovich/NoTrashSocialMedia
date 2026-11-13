// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierRecommended = require('eslint-plugin-prettier/recommended');
const globals = require('globals');

module.exports = defineConfig([
  expoConfig,
  // Reports formatting differences as lint problems and turns off rules that fight Prettier.
  prettierRecommended,
  {
    ignores: [
      'dist/*',
      'ios/*',
      'android/*',
      '.expo/*',
      '.claude/*',
      'node_modules/*',
      'expo-env.d.ts',
    ],
  },
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      // Reach into other folders through the `@/` alias (= src/), never with `../`.
      // Same-folder imports (`./Name.styles`) stay relative.
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*'],
              message: "Import from another folder with the '@/' alias, e.g. '@/utils/usage'.",
            },
          ],
        },
      ],
      // Built-ins and packages first, then `@/` imports, then same-folder files; alphabetical in each group.
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index']],
          pathGroups: [{ pattern: '@/**', group: 'internal' }],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/no-duplicates': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'react-hooks/exhaustive-deps': 'error',
      // Leftover debugging output. Deliberate warnings and errors are fine.
      'no-console': ['error', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'always'],
      // Apostrophes in <Text> are plain text in React Native.
      'react/no-unescaped-entities': 'off',
    },
  },
  {
    files: ['**/__tests__/**', 'jest.setup.js'],
    languageOptions: { globals: globals.jest },
    rules: {
      // Tests load a fresh copy of a module with require() inside jest.isolateModules.
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    // Styles belong in `<Name>.styles.ts`, next to the component or screen.
    files: ['src/**/*.tsx'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "CallExpression[callee.object.name='StyleSheet'][callee.property.name='create']",
          message: 'Define styles in a sibling <Name>.styles.ts file.',
        },
      ],
      'react-native/no-inline-styles': 'off',
    },
  },
]);
