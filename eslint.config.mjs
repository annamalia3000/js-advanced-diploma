import globals from 'globals';
import babelParser from '@babel/eslint-parser';
import jestPlugin from 'eslint-plugin-jest';
import stylisticJs from '@stylistic/eslint-plugin-js';
import pluginJs from '@eslint/js';

export default [
    {
        ignores: [ 'dist/', '*.json' ],
    },
    {
        languageOptions: {
            parser: babelParser,
            parserOptions: {
                requireConfigFile: false,
                babelOptions: {
                    babelrc: false,
                    configFile: false,
                    presets: [ '@babel/preset-env' ],
                },
            },
            ecmaVersion: 2023,
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...jestPlugin.environments.globals.globals,
            },
        },
    },
    {
        files: [ '**/__tests__/**', '**/*.test.js' ],
        plugins: {
            jest: jestPlugin,
        },
        rules: {
            'jest/no-disabled-tests': 'off',
            'jest/no-focused-tests': 'off',
            'jest/no-identical-title': 'off',
            'jest/prefer-to-have-length': 'off',
            'jest/valid-expect': 'off',
        },
    },
    {
        rules: {
            indent: [ 'error', 4 ],
            semi: [ 'error', 'always' ],
            'no-unused-vars': 'off',
            'no-console': 'off',
        },
    },
    {
        files: [ '*.config.*' ],
        rules: {
            'no-underscore-dangle': [ 'off' ],
            'import/no-extraneous-dependencies': 'off',
        },
    },
    {
        plugins: {
            '@stylistic/js': stylisticJs,
        },
        rules: {
            'max-len': [ 'error', { code: 300 } ],
            quotes: [ 'error', 'single' ],
            'object-property-newline': [ 'error' ],
            'array-bracket-spacing': [ 'error', 'always' ],
            'no-multiple-empty-lines': [ 'error', {
                max: 1,
                maxBOF: 1,
            } ],
        },
    },
];
