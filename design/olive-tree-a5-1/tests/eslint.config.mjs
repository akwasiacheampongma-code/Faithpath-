const names =
  'innerWidth Event localStorage sessionStorage process Buffer console URL URLSearchParams performance setTimeout clearTimeout document window navigator location requestAnimationFrame cancelAnimationFrame devicePixelRatio Image AbortController DOMException matchMedia ResizeObserver IntersectionObserver CSS HTMLCanvasElement OLIVE_A51 OLIVE_A5 scene fixture pendingStage gpuObjects trackedGL axe';
export default [
  {
    ignores: ['**/reference/**', '**/stage-data.js'],
  },
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: Object.fromEntries(
        names.split(' ').map((name) => [name, 'readonly']),
      ),
    },
    rules: {
      'no-undef': 'error',
      'no-unreachable': 'error',
      'no-dupe-args': 'error',
      'no-dupe-keys': 'error',
      'no-duplicate-case': 'error',
      'valid-typeof': 'error',
      'no-async-promise-executor': 'error',
      'no-debugger': 'error',
      'no-eval': 'error',
      'no-global-assign': 'error',
      'no-unsafe-finally': 'error',
      'no-unused-vars': ['error', { args: 'none', ignoreRestSiblings: true }],
    },
  },
];
