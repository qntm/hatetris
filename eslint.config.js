import * as eslintPluginImport from 'eslint-plugin-import'
import eslintPluginReactHooks from 'eslint-plugin-react-hooks'
import neostandard, { plugins } from 'neostandard'

export default [
  ...neostandard({
    ignores: [
      'dist'
    ]
  }),
  {
    rules: {
      // https://github.com/neostandard/neostandard/issues/79
      '@stylistic/comma-dangle': ['error', 'never']
    }
  },
  {
    ...plugins.react.configs.flat.recommended,
    files: [
      '**/*.jsx'
    ]
  },
  {
    ...eslintPluginImport.flatConfigs.recommended,
    languageOptions: {
      ...eslintPluginImport.flatConfigs.recommended.languageOptions,
      ecmaVersion: 'latest' // overrides `2018`
    }
  },
  {
    rules: {
      'operator-linebreak': ['error', 'after', {
        overrides: {
          '?': 'before',
          ':': 'before',
          '|>': 'before',

          // All of the above is as per Standard, but we add the following
          '=': 'none'
        }
      }],

      'arrow-parens': ['error', 'as-needed'],

      'no-extra-parens': ['error', 'all', {
        ignoreJSX: 'all',
        nestedBinaryExpressions: false
      }],

      'arrow-body-style': ['error'],

      'import/order': ['error', {
        alphabetize: {
          order: 'asc'
        },
        'newlines-between': 'always'
      }],

      'import/extensions': ['error', 'always']
    }
  },
  {
    plugins: {
      'react-hooks': eslintPluginReactHooks
    },
    rules: eslintPluginReactHooks.configs.recommended.rules
  }
]
