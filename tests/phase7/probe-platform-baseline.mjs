// Read-only fault injection into the exact baseline functions; no browser/user data.
import fs from 'node:fs';import vm from 'node:vm';import {execFileSync} from 'node:child_process';
const source=execFileSync('git',['show','7d24aea:src/app.js'],{encoding:'utf8'}),build='FP4-20261018-G-STABLE1-UIUX6D-TREEFINAL';
const getBook=source.slice(source.indexOf('async function getBook('),source.indexOf('\nfunction contextOf('));let fetches=0;
const bookContext=vm.createContext({ui:{cache:new Map()},fetch:async()=>({ok:true,json:async()=>{fetches++;return {chapters:null}}})});
const first=await vm.runInContext(getBook+';getBook("JHN","otb")',bookContext),second=await vm.runInContext('getBook("JHN","otb")',bookContext);
const offline=source.slice(source.indexOf('async function offlineStatus()'),source.indexOf('\nasync function pwa()',source.indexOf('async function offlineStatus()')));
let channel,closed=0;
class Channel{constructor(){channel=this;this.port1={close:()=>closed++};this.port2={close:()=>closed++};}}
const worker={state:'activated',postMessage:()=>channel.port1.onmessage({data:{ready:true,build}})},context=vm.createContext({BUILD:build,ui:{offline:false},navigator:{serviceWorker:{controller:{},getRegistration:async()=>({active:worker})}},MessageChannel:Channel,setTimeout:()=>1,clearTimeout:()=>{},$:()=>null});
const ready=await vm.runInContext(offline+';offlineStatus()',context);context.navigator.serviceWorker.getRegistration=async()=>{throw new Error('Injected registration denial')};let rejected;
try{await vm.runInContext('offlineStatus()',context)}catch(e){rejected=e.message}
const result={baseline:'7d24aea30bec5b0b8d43e199f3cadfc6305c1e3e',method:'Injected platform responses executing actual baseline function bodies in a VM; not observed real-device failures',malformedBible:{first,second,fetches,poisonedFulfilledCache:fetches===1},workerStatus:{ready,closedPorts:closed,registrationErrorRejected:rejected}};
fs.writeFileSync('qa-output/phase7/platform-baseline-faults.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
