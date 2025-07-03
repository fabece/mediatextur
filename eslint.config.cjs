const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const nestTypedPlugin = require('@darraghor/eslint-plugin-nestjs-typed');
const prettierPlugin = require('eslint-plugin-prettier');

module.exports = [
    {
        files: ['**/*.ts'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                project: 'tsconfig.json',
                tsconfigRootDir: __dirname,
                sourceType: 'module',
            },
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
            '@darraghor/nestjs-typed': nestTypedPlugin,
            prettier: prettierPlugin,
        },
        rules: {
            '@typescript-eslint/naming-convention': [
                'error',
                {
                    selector: 'interface',
                    format: ['PascalCase'],
                    custom: {
                        regex: '^I[A-Z]',
                        match: true,
                    },
                },
            ],
            '@typescript-eslint/explicit-function-return-type': 'error',
            '@typescript-eslint/explicit-module-boundary-types': 'error',
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/no-unused-vars': 'warn',
            'prettier/prettier': ['error', { endOfLine: 'auto' }],
            'no-console': 'warn',
            // '@typescript-eslint/typedef': [
            //     'warn',
            //     {
            //         variableDeclaration: true,
            //         arrowParameter: true,
            //         propertyDeclaration: true,
            //         memberVariableDeclaration: true,
            //     },
            // ],
        },
    },
    {
        ignores: [],
    },
];
