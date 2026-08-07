module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    // Este projeto documenta os tipos com JSDoc, nao com a biblioteca prop-types.
    // Manter a regra ligada obrigaria a escrever a mesma informacao duas vezes,
    // e ainda adicionaria uma dependencia so para isso. Ver specs/STANDARDS.md.
    'react/prop-types': 'off',
  },
}
