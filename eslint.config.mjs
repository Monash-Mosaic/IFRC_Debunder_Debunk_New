// @ts-check
import next from 'eslint-config-next'
import eslintPluginPrettier from 'eslint-plugin-prettier'

export default [
  ...next,
  {
    ignores: ['node_modules/', '.next/', 'out/', 'dist/'],
    languageOptions: { ecmaVersion: 2023, sourceType: 'module' },
    plugins: { prettier: eslintPluginPrettier },
    rules: {
      'prettier/prettier': 'warn'
    }
  }
]
