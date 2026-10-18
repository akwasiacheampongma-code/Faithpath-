import test from 'node:test';import assert from 'node:assert/strict';
import fs from 'node:fs';
const optional=path=>import(path).catch(e=>{if(e.code==='ERR_MODULE_NOT_FOUND'&&e.message.includes(path.slice(3)))return {};throw e});
const bible=await optional('../src/bible-loader.js'),pwa=await optional('../src/pwa-controller.js');
const book={name:'Synthetisches Testbuch',chapters:[[[1,'Synthetischer Text']]]};
const response=value=>({ok:true,json:async()=>value});
function loader(fetch){assert.equal(typeof bible.createBibleLoader,'function','Bible resource boundary is not exposed yet');return bible.createBibleLoader({fetch});}
function channelTracker(){const channels=[];class TrackedChannel{constructor(){const real=new MessageChannel();this.port1=real.port1;this.port2=real.port2;this.closed=[false,false];for(const[index,p]of[real.port1,real.port2].entries()){const close=p.close.bind(p);p.close=()=>{this.closed[index]=true;close()}}channels.push(this)}}return {channels,MessageChannel:TrackedChannel};}
function workerQuery(){assert.equal(typeof pwa.requestWorkerStatus,'function','Worker protocol boundary is not exposed yet');return pwa.requestWorkerStatus;}
test('Bible loader coalesces concurrent reads and keeps translation caches separate',async()=>{
 const requests=[],load=loader(async url=>{requests.push(url);return response(book)});const [a,b]=await Promise.all([load('JHN','otb'),load('JHN','otb')]);assert.equal(a,b);await load('JHN','l1912');assert.deepEqual(requests,['data/bibles/otb/JHN.json','data/bibles/l1912/JHN.json']);assert.deepEqual(a,book);
});
test('failed and malformed Bible responses are never cached as a successful retry',async()=>{
 for(const bad of [()=>({ok:false}),()=>({ok:true,json:async()=>{throw new SyntaxError('bad JSON')}}),...[
  {chapters:null},{chapters:[]},{chapters:[[]]},{chapters:[[null]]},
  {chapters:[[[1,null]]]},{chapters:[[[0,'bad']]]},{chapters:[[[1,'a'],[1,'duplicate']]]}
 ].map(value=>()=>response({name:'Synthetisches Testbuch',...value}))]){let count=0;const load=loader(async()=>++count===1?bad():response(book));await assert.rejects(load('JHN','otb'));assert.deepEqual(await load('JHN','otb'),book);assert.equal(count,2)}
});
test('all 132 original offline Bible books pass the boundary without changing any verse',async()=>{
 const load=loader(async url=>response(JSON.parse(fs.readFileSync(url,'utf8'))));let count=0;
 for(const tr of ['otb','l1912'])for(const file of fs.readdirSync('data/bibles/'+tr)){
  const original=JSON.parse(fs.readFileSync('data/bibles/'+tr+'/'+file,'utf8'));
  assert.deepEqual(await load(file.replace('.json',''),tr),original);count++;
 }
 assert.equal(count,132);
});
test('worker status success closes both ports and preserves the protocol payload',async()=>{
 const query=workerQuery(),track=channelTracker();const value=await query({postMessage:(message,ports)=>{assert.deepEqual(message,{type:'STATUS'});ports[0].postMessage({ready:true,build:'test'})}},{MessageChannel:track.MessageChannel,timeoutMs:100});assert.deepEqual(value,{ready:true,build:'test'});assert.deepEqual(track.channels[0].closed,[true,true]);
});
test('worker timeout and send failure settle safely and close both ports',async()=>{
 const query=workerQuery();for(const worker of [{postMessage:()=>{}},{postMessage:()=>{throw new Error('revoked worker')}}]){const track=channelTracker();assert.equal(await query(worker,{MessageChannel:track.MessageChannel,timeoutMs:5}),null);assert.deepEqual(track.channels[0].closed,[true,true]);}
});
function monitor(overrides={}){assert.equal(typeof pwa.createPwaController,'function','PWA lifecycle boundary is not exposed yet');const statuses=[],waiting=[],notices=[];const api=pwa.createPwaController({build:'current',getServiceWorker:()=>({controller:{},getRegistration:async()=>({active:{state:'activated'}})}),onStatus:v=>statuses.push(v),onWaiting:v=>waiting.push(v),onNotice:(...v)=>notices.push(v),reload:()=>{},isDialogOpen:()=>false,addFocusListener:()=>{},...overrides});return {api,statuses,waiting,notices};}
test('unavailable or denied worker registrations report not ready without an unhandled rejection',async()=>{
 for(const getServiceWorker of [()=>undefined,()=>({getRegistration:async()=>{throw new Error('denied')}})]){const h=monitor({getServiceWorker});assert.equal(await h.api.status(),false);assert.deepEqual(h.statuses,[false]);}
});
test('a late old worker status cannot overwrite a newer readiness result',async()=>{
 const replies=[];const h=monitor({requestStatus:()=>new Promise(resolve=>replies.push(resolve))});const first=h.api.status(),second=h.api.status();await Promise.resolve();assert.equal(replies.length,2);replies[1]({ready:true,build:'current'});await second;replies[0](null);await first;assert.deepEqual(h.statuses,[true]);
});
test('update activation is deliberate, blocks open editors and clears only presentation when no update exists',async()=>{
 let posts=0;const sw={getRegistration:async()=>({waiting:{postMessage:message=>{assert.equal(message.type,'SKIP_WAITING');posts++}}})};const closed=monitor({getServiceWorker:()=>sw});await closed.api.activateUpdate();assert.equal(posts,1);
 const open=monitor({getServiceWorker:()=>sw,isDialogOpen:()=>true});await open.api.activateUpdate();assert.equal(posts,1);assert.match(open.notices[0][0],/Entwurf/);
 const none=monitor({getServiceWorker:()=>({getRegistration:async()=>({})})});await none.api.activateUpdate();assert.deepEqual(none.waiting,[null]);assert.match(none.notices[0][0],/aktuell/);
});
