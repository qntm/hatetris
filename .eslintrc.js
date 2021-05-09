module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'plugin:react/recommended',
    'standard'
  ],
  ignorePatterns: [
    'dist'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: [
    'react',
    '@typescript-eslint'
  ],
  rules: {
    // <https://github.com/typescript-eslint/typescript-eslint/issues/2540> ???
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': 'error'
  },
  settings: {
    react: {
      version: '16.3'
    }
  }
}
