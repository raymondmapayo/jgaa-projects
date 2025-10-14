module.exports = {
  parserOptions: {
    project: './tsconfig.json',
  },
  extends: [
    'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'airbnb-typescript',
    'prettier',
  ],
  rules: {
    // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'react/react-in-jsx-scope': 'off',
    'arrow-body-style': 'off',
    'import/prefer-default-export': 'off',
    'no-underscore-dangle': 'off',
    'react/require-default-props': 'off',
    'prefer-template': 'off',
    'import/no-extraneous-dependencies': [
      'error',
      {
        bundledDependencies: false,
        optionalDependencies: false,
        peerDependencies: false,
      },
    ],
    'react/self-closing-comp': 'off',
    '@typescript-eslint/naming-convention': 'off',
    'no-param-reassign': 'off',
    'no-shadow': 'off',
    'class-methods-use-this': 'off',
    'max-classes-per-file': ['error', 3],
    '@typescript-eslint/no-shadow': [
      'error',
      {
        allow: ['req', 'res'],
      },
    ],
    'no-empty': [
      'error',
      {
        allowEmptyCatch: true,
      },
    ],
    'react/jsx-props-no-spreading': 'off',
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': [
      'error',
      {
        functions: false,
      },
    ],
    'no-plusplus': [
      'error',
      {
        allowForLoopAfterthoughts: true,
      },
    ],
    'react/prop-types': 'off',
  },
};
