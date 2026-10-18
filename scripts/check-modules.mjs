/** Resolve runtime ESM edges from ESLint's parser, rather than guessing with regex. */
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {Linter} from 'eslint';
const list=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?list(path.join(dir,e.name)):[path.join(dir,e.name)]).filter(f=>f.endsWith('.js')).sort();
const graph={},linter=new Linter();
for(const file of list('src')) {
 const edges=[];
 const rule={create:()=>({ImportDeclaration:node=>edges.push(node.source.value),ExportNamedDeclaration:node=>{if(node.source)edges.push(node.source.value)},ExportAllDeclaration:node=>edges.push(node.source.value)})};
 const diagnostics=linter.verify(fs.readFileSync(file,'utf8'),[{plugins:{graph:{rules:{edges:rule}}},rules:{'graph/edges':'error'}}]);
 assert(!diagnostics.some(d=>d.fatal),file+' has invalid JavaScript');
 graph[file]=edges.map(edge=>{assert(edge.startsWith('.'),file+': no unbundled runtime dependencies');const target=path.normalize(path.join(path.dirname(file),edge));assert(fs.existsSync(target),file+' imports missing '+target);return target});
}
const visiting=new Set(),done=new Set();
function visit(file,chain=[]){assert(!visiting.has(file),'Runtime import cycle: '+[...chain,file].join(' -> '));if(done.has(file))return;visiting.add(file);for(const next of graph[file]||[])visit(next,[...chain,file]);visiting.delete(file);done.add(file)}
for(const file of Object.keys(graph))visit(file);
console.log(JSON.stringify({status:'PASS',modules:Object.keys(graph).length,edges:Object.values(graph).reduce((n,x)=>n+x.length,0),cycles:0,graph},null,2));
