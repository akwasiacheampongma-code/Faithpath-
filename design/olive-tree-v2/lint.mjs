/** Isolated correctness lint; does not change the app's lint configuration. */
import {ESLint} from 'eslint';
import fs from 'node:fs';
const globals=Object.fromEntries(
 'document window location URLSearchParams NodeFilter innerWidth navigator localStorage sessionStorage scrollTo requestAnimationFrame getComputedStyle process console'
 .split(' ').map(name=>[name,'readonly']),
);
const engine=new ESLint({overrideConfigFile:true,overrideConfig:[{
 files:['design/olive-tree-v2/*.js','design/olive-tree-v2/*.mjs'],
 languageOptions:{ecmaVersion:'latest',sourceType:'module',globals},
 rules:{'no-undef':'error','no-unreachable':'error','no-dupe-keys':'error',
  'no-dupe-args':'error','no-eval':'error','no-debugger':'error','valid-typeof':'error'},
}]});
const results=await engine.lintFiles(['design/olive-tree-v2/*.js','design/olive-tree-v2/*.mjs']);
const report={pass:results.every(r=>r.errorCount===0),files:results.map(r=>({
 path:r.filePath.split('/design/')[1],errorCount:r.errorCount,warningCount:r.warningCount,messages:r.messages,
}))};
fs.writeFileSync('design/olive-tree-v2/evidence/design-lint.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
if(!report.pass)process.exitCode=1;
