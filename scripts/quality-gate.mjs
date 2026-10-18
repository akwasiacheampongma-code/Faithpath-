/** Read-only quality gate. Outputs are disposable; it cannot publish or alter refs. */
import fs from 'node:fs';import path from 'node:path';import {spawn,execFileSync} from 'node:child_process';import {once} from 'node:events';
const root=path.resolve(process.env.QA_GATE_OUT||'qa-output/phase7/gate');fs.mkdirSync(root,{recursive:true});
const results=[];
async function run(name,command,args,env={}){
 const log=fs.openSync(root+'/'+name+'.log','w'),started=new Date().toISOString();
 const child=spawn(command,args,{env:{...process.env,...env},stdio:['ignore',log,log]});
 const [code]=await once(child,'exit');fs.closeSync(log);results.push({name,code,started,ended:new Date().toISOString()});
 fs.writeFileSync(root+'/results.json',JSON.stringify({results},null,2));console.log(name+': '+code);
 if(code!==0)throw new Error(name+' failed; see '+root+'/'+name+'.log');
}
let server;
try{
 await run('nt-master','npm',['run','validate:nt-quiz']);
 await run('nachlese-master','npm',['run','validate:nachlese-editorial']);
 await run('unit','npm',['test']);
 await run('lint','npm',['run','lint','--','--max-warnings','5','--format','json','--output-file',root+'/lint.json']);
 await run('module-graph',process.execPath,['scripts/check-modules.mjs']);
 await run('contracts',process.execPath,['scripts/check-contracts.mjs']);
 for(const suffix of ['a','b'])await run('build-'+suffix,'npm',['run','build'],{FAITHPATH_OUT:root+'/build-'+suffix});
 await run('build-integrity',process.execPath,['scripts/check-build.mjs',root+'/build-a',root+'/build-b']);
 let previous=process.env.FAITHPATH_PREVIOUS_ROOT;
 if(!previous){
  const source=root+'/baseline-source';fs.mkdirSync(source,{recursive:true});
  execFileSync('git',['archive','--format=tar','--output='+root+'/baseline.tar','7d24aea30bec5b0b8d43e199f3cadfc6305c1e3e']);
  execFileSync('tar',['-xf',root+'/baseline.tar','-C',source]);
  previous=root+'/baseline';
  execFileSync(process.execPath,['scripts/build.mjs'],{cwd:source,env:{...process.env,FAITHPATH_OUT:previous,FAITHPATH_BUILD_COMMIT:'ce89422411ec3382c62ba7683167cf1b6db4a457',FAITHPATH_BUILD_BRANCH:'fix/treeguide2-mobile-final-20261018'},stdio:'pipe'});
 }
 const candidate=root+'/build-a';
 await run('core-browser',process.execPath,['tests/browser.mjs'],{FAITHPATH_TEST_ROOT:candidate,FAITHPATH_PORT:'4574',QA_OUT:root+'/core-browser'});
 server=spawn(process.execPath,['scripts/serve.mjs',candidate],{env:{...process.env,PORT:'4575'},stdio:['ignore','pipe','inherit']});await once(server.stdout,'data');
 await run('route-browser',process.execPath,['tests/phase4-routes-browser.mjs'],{QA_URL:'http://127.0.0.1:4575',QA_OUT:root+'/routes'});
 await run('platform-browser',process.execPath,['tests/phase7/platform-browser.mjs'],{QA_URL:'http://127.0.0.1:4575',QA_OUT:root+'/platform-browser',FAITHPATH_CANDIDATE_ROOT:candidate});
 await run('offline-update',process.execPath,['tests/phase7/update.mjs'],{FAITHPATH_PREVIOUS_ROOT:previous,FAITHPATH_CANDIDATE_ROOT:candidate,QA_OUT:root+'/update'});
}finally{server?.kill();fs.writeFileSync(root+'/results.json',JSON.stringify({results,physicalIOS:'OFFEN',noDeployment:true},null,2))}
