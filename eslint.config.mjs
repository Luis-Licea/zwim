import globals from 'globals';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({
    baseDirectory: import.meta.dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [
    ...compat.extends('eslint:recommended'),
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.mocha,
                ...globals.node,
            },

            ecmaVersion: 'latest',
            sourceType: 'module',

            parserOptions: {
                ecmaFeatures: {
                    impliedStrict: true,
                },
            },
        },

        rules: {
            'no-fallthrough': 'off',
            semi: 'error',
            quotes: ['error', 'single'],

            'no-unused-vars': ['error', {
                destructuredArrayIgnorePattern: '^_',
                argsIgnorePattern: '^_',
            }],
        },
    }];
