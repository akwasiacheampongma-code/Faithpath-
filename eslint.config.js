// Development-only correctness checks. No formatting/autofix or runtime framework.
const browser='document window navigator localStorage location self fetch caches Request Response URL URLSearchParams Blob File FileReader FormData MessageChannel ResizeObserver IntersectionObserver MutationObserver AbortController AbortSignal Event CustomEvent HTMLElement Element Storage CSS Image requestAnimationFrame cancelAnimationFrame matchMedia getComputedStyle innerWidth innerHeight scrollX scrollY devicePixelRatio setTimeout clearTimeout setInterval clearInterval console crypto TextEncoder TextDecoder structuredClone atob btoa performance'.split(' ');
const platform=Object.fromEntries([...browser,'process','Buffer','__ASSETS__'].map(name=>[name,'readonly']));
export default [
 {ignores:['node_modules/**','dist/**','qa-output/**','reports/**','prototypes/**']},
 {files:['src/**/*.js','scripts/**/*.mjs','scripts/sw-template.js','tests/*.test.mjs','tests/phase7/**/*.mjs','eslint.config.js'],languageOptions:{ecmaVersion:'latest',sourceType:'module',globals:platform},rules:{
  'no-undef':'error','no-unreachable':'error','no-dupe-args':'error','no-dupe-keys':'error','no-duplicate-case':'error','valid-typeof':'error','no-async-promise-executor':'error','no-debugger':'error','no-eval':'error','no-global-assign':'error','no-unsafe-finally':'error',
  'no-unused-vars':['warn',{args:'none',ignoreRestSiblings:true,varsIgnorePattern:'^_'}]
 }},
 {files:['src/app-router.js','src/backup-controller.js','src/pwa-controller.js','src/bible-loader.js'],rules:{'no-unused-vars':['error',{args:'none',ignoreRestSiblings:true}]}}
];
