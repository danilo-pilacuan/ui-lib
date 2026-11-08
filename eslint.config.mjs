// @ts-check
// ESLint 9 flat config para la lib de presentacion (@projecthub/ui).
// Componentes de presentacion con templates inline: processor de
// angular-eslint + selectores ph (prefijo publico de la lib).
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';

export default tseslint.config(
  {
    files: ['projects/**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      // Los prefijos son parte de la API de la lib: ph-* para lo publico
      // (data-table y su columna declarativa), app-* para lo interno.
      // directive-selector admite dos configs y valida cada selector con la
      // que coincide por tipo real (atributo camelCase, elemento kebab-case).
      '@angular-eslint/directive-selector': [
        'error',
        [
          { type: 'attribute', prefix: ['ph', 'app'], style: 'camelCase' },
          { type: 'element', prefix: ['ph', 'app'], style: 'kebab-case' },
        ],
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: ['ph', 'app'], style: 'kebab-case' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['projects/**/*.html'],
    extends: [...angular.configs.templateRecommended],
  },
  {
    ignores: ['dist/**', 'node_modules/**', 'projects/**/dist/**'],
  },
);
