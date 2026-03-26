import typescriptEslint from '@typescript-eslint/eslint-plugin';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

export default [
    {
        ignores: ['**/.eslintrc.js', '**/eslint.config.mjs'],
    },
    ...compat.extends(
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
    ),
    {
        plugins: {
            '@typescript-eslint': typescriptEslint,
            'unused-imports': unusedImports,
        },

        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.jest,
            },

            parser: tsParser,
            ecmaVersion: 2021,
            sourceType: 'module',

            parserOptions: {
                project: 'tsconfig.json',
                tsconfigRootDir: __dirname,
                parser: '@typescript-eslint/parser',
            },
        },

        rules: {
            '@typescript-eslint/interface-name-prefix': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/explicit-function-return-type': ['error'],

            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    vars: 'all',
                    varsIgnorePattern: '^_',
                    args: 'after-used',
                    argsIgnorePattern: '^_',
                    caughtErrors: 'all',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],

            'unused-imports/no-unused-imports': 'error',

            'unused-imports/no-unused-vars': [
                'warn',
                {
                    vars: 'all',
                    varsIgnorePattern: '^_',
                    args: 'after-used',
                    argsIgnorePattern: '^_',
                },
            ],
        },
    },
];
