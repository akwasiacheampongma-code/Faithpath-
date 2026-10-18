import test from 'node:test';import assert from 'node:assert/strict';
import {createStore,empty,KEYS} from '../src/store.js';
const module=await import('../src/backup-controller.js').catch(e=>{if(e.code==='ERR_MODULE_NOT_FOUND'&&e.message.includes('backup-controller.js'))return {};throw e;});
const file=data=>({size:JSON.stringify(data).length,text:async()=>JSON.stringify(data)});
function setup(){
 assert.equal(typeof module.createBackupController,'function','Backup lifecycle boundary is not exposed yet');
 const initial=empty();initial.journal=[{id:'old',text:'Mein Original',date:'2026-10-01'}];
 const draft=JSON.stringify({type:'entry',args:{},values:{text:'Mein Entwurf'},saved:'2026-10-18'}),map=new Map([[KEYS.main,JSON.stringify(initial)],[KEYS.draft,draft],[KEYS.restore,JSON.stringify({raw:null,guidedPlansRaw:null,saved:'2026-10-01'})]]);
 const storage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)},store=createStore(storage),dialog={open:true},calls=[],locks={request:async(_,fn)=>fn()},route={hash:'#more?section=data'};let controller;
 const find=selector=>selector==='#dialog'?dialog:selector==='#import-file'?{click:()=>calls.push(['picker'])}:null;
 controller=module.createBackupController({store,storage,getRoute:()=>route.hash,getReferences:()=>({}),locks,find,view:{modal:(title,body)=>{dialog.open=true;calls.push(['modal',title,body])},closeModal:()=>{dialog.open=false;controller.invalidate()},go:r=>calls.push(['go',r]),notify:(...x)=>calls.push(['notify',...x]),download:(...x)=>calls.push(['download',...x]),button:()=>'',date:x=>x}});
 const incoming=empty();incoming.journal=[{id:'new',text:'Geprüfter neuer Gedanke',date:'2026-10-18'}];
 return {controller,map,store,storage,dialog,calls,locks,route,incoming,snapshot:()=>JSON.stringify([...map])};
}
test('inspection is read-only and check mode cannot authorize restore',async()=>{
 const h=setup(),before=h.snapshot();await h.controller.handle('check-backup',{},{});await h.controller.inspectFile(file(h.incoming));assert.equal(h.snapshot(),before);assert.equal(h.calls.at(-1)[1],'Backup geprüft');await assert.rejects(h.controller.handle('review-import',{},{}));assert.equal(h.snapshot(),before);
});
test('late file read cannot reopen a preview after leaving and returning to the same route',async()=>{
 const h=setup(),before=h.snapshot();let release;const pending=h.controller.inspectFile({size:20,text:()=>new Promise(r=>release=r)});h.controller.invalidate();h.route.hash='#journal';h.route.hash='#more?section=data';release(JSON.stringify(h.incoming));await pending;assert.equal(h.calls.filter(x=>x[0]==='modal').length,0);assert.equal(h.snapshot(),before);
});
test('a newer preview retains ownership when an older file finishes later',async()=>{
 const h=setup();let release;const first=h.controller.inspectFile({size:20,text:()=>new Promise(r=>release=r)});await h.controller.inspectFile(file(h.incoming));const modalCount=h.calls.filter(x=>x[0]==='modal').length;release(JSON.stringify(empty()));await first;assert.equal(h.calls.filter(x=>x[0]==='modal').length,modalCount);
 await h.controller.handle('review-import',{},{});await h.controller.handle('confirm-import',{}, {disabled:false,isConnected:true});assert.equal(h.store.state.journal[0].text,h.incoming.journal[0].text);
});
test('changed draft during inspection rejects without writing or presenting stale state',async()=>{
 const h=setup();let release;const pending=h.controller.inspectFile({size:20,text:()=>new Promise(r=>release=r)});h.map.set(KEYS.draft,'newer draft');const before=h.snapshot();release(JSON.stringify(h.incoming));await assert.rejects(pending,/Entwurf/);assert.equal(h.snapshot(),before);assert.equal(h.calls.length,0);
});
test('closing while restore waits for its lock cancels authority before any write',async()=>{
 const h=setup();await h.controller.inspectFile(file(h.incoming));await h.controller.handle('review-import',{},{});let release;
 h.locks.request=(_,fn)=>new Promise(resolve=>release=()=>resolve(fn()));const before=h.snapshot(),el={disabled:false,isConnected:true};const pending=h.controller.handle('confirm-import',{},el);assert.equal(el.disabled,true);h.controller.invalidate();h.dialog.open=false;release();await pending;assert.equal(h.snapshot(),before);assert.equal(el.disabled,false);
});
test('explicit confirmed restore and undo preview retain original safety bytes and draft',async()=>{
 const h=setup(),oldRaw=h.map.get(KEYS.main),oldDraft=h.map.get(KEYS.draft);await h.controller.inspectFile(file(h.incoming));assert.equal(h.map.get(KEYS.main),oldRaw);await h.controller.handle('review-import',{},{});await h.controller.handle('confirm-import',{}, {disabled:false,isConnected:true});assert.equal(h.store.state.journal[0].id,'new');assert.equal(h.map.get(KEYS.draft),oldDraft);assert.equal(JSON.parse(h.map.get(KEYS.restore)).raw,oldRaw);
 const before=h.snapshot();await h.controller.handle('undo-import',{},{});assert.equal(h.snapshot(),before);await h.controller.handle('review-import',{},{});await h.controller.handle('confirm-import',{}, {disabled:false,isConnected:true});assert.equal(h.store.state.journal[0].id,'old');assert.equal(h.map.get(KEYS.draft),oldDraft);
});
test('malformed backup, missing Bible reference and stale export cannot mutate current records',async()=>{
 const h=setup(),before=h.snapshot();await assert.rejects(h.controller.inspectFile({size:5,text:async()=>'{bad'}));const invalid=empty();invalid.reading={book:'JHN',chapter:3,translation:'otb'};await assert.rejects(h.controller.inspectFile(file(invalid)),/Bibelstelle/);assert.equal(h.snapshot(),before);
 h.map.set(KEYS.main,JSON.stringify(empty()));const changed=h.snapshot();await assert.rejects(h.controller.handle('export',{},{}),/anderen Tab/);assert.equal(h.snapshot(),changed);assert(!h.calls.some(x=>x[0]==='download'));
});
