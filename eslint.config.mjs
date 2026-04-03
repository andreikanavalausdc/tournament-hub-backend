import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import unusedImports from 'eslint-plugin-unused-imports';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
    {
        ignores: ['dist/**', 'node_modules/**', 'eslint.config.mjs']
    },

    js.configs.recommended,

    ...tseslint.configs.recommended,

    {
        files: ['src/**/*.ts', 'apps/**/*.ts', 'libs/**/*.ts', 'shared/**/*.ts'],

        languageOptions: {
            parser: tseslint.parser,
            ecmaVersion: 2021,
            sourceType: 'module',
            globals: {
                ...globals.node,
                ...globals.jest
            },
            parserOptions: {
                project: './tsconfig.json'
            }
        },

        plugins: {
            '@typescript-eslint': tseslint.plugin,
            'unused-imports': unusedImports,
            'simple-import-sort': simpleImportSort
        },

        rules: {
            'simple-import-sort/imports': 'error',
            'simple-import-sort/exports': 'error',

            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/explicit-function-return-type': 'error',

            '@typescript-eslint/no-unused-vars': 'off',

            'unused-imports/no-unused-imports': 'error',

            'unused-imports/no-unused-vars': [
                'warn',
                {
                    vars: 'all',
                    varsIgnorePattern: '^_',
                    args: 'after-used',
                    argsIgnorePattern: '^_',
                    caughtErrors: 'all',
                    caughtErrorsIgnorePattern: '^_'
                }
            ]
        }
    },

    eslintConfigPrettier
);