'use strict';

module.exports = {
    env: {
        commonjs: true,
        es6: true,
        node: true,
    },
    extends: ['eslint:recommended', 'airbnb-base', 'plugin:jest/recommended'],
    plugins: ['jest'],
    globals: {
        BigInt: true,
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
    },
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'script',
    },
    ignorePatterns: [
        'jest.config.js',
    ],
    rules: {
        indent: ['error', 4, {
            SwitchCase: 1,
            MemberExpression: 1,
        }],
        'import/no-unresolved': 0,
        'import/no-extraneous-dependencies': 0,
        'import/extensions': 0,
        'import/no-dynamic-require': 0,
        'no-console': 0,
        'no-param-reassign': ['error', { props: false }],
        strict: ['error', 'global'],
        'no-extra-parens': ['error', 'all'],
    },
};
