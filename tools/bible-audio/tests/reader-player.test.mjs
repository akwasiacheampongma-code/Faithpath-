import test from 'node:test';
import assert from 'node:assert/strict';
import {getEventListeners} from 'node:events';
import {createChapterAudio} from '../reader-player.js';

class AudioStub extends EventTarget {
 currentTime=0;playbackRate=1;defaultPlaybackRate=1;paused=true;src='';loads=0;
 pause(){this.paused=true;}
 play(){this.paused=false;return Promise.resolve();}
 load(){this.loads++;this.playbackRate=this.defaultPlaybackRate;}
 removeAttribute(name){if(name==='src')this.src='';}
}
const ref=chapter=>({translation:'l1912',book:'MAT',chapter});
test('pause and resume retain position and chosen speed without touching app progress',async()=>{
 const audio=new AudioStub();const p=createChapterAudio({audio,resolve:async r=>({url:`/${r.chapter}.mp3`})});
 await p.load(ref(1));p.setRate(1.25);await p.play();audio.currentTime=12.5;p.pause();await p.play();
 assert.equal(audio.currentTime,12.5);assert.equal(audio.playbackRate,1.25);assert.equal(audio.paused,false);p.destroy();
});
test('late chapter fetch cannot replace the more recent reader chapter',async()=>{
 const audio=new AudioStub();let first;
 const p=createChapterAudio({audio,resolve:r=>r.chapter===1?new Promise(resolve=>{first=resolve;}):Promise.resolve({url:'/2.mp3'})});
 const stale=p.load(ref(1));await p.load(ref(2));first({url:'/1.mp3'});await stale;
 assert.equal(audio.src,'/2.mp3');assert.equal(audio.paused,true);p.destroy();
});
test('missing next chapter pauses current audio and reports unavailable without inventing audio',async()=>{
 const audio=new AudioStub();const events=[];
 const p=createChapterAudio({audio,resolve:async r=>r.chapter===1?{url:'/1.mp3'}:null,onState:s=>events.push(s.status)});
 await p.load(ref(1));await p.play();await p.load(ref(2));
 assert.equal(audio.src,'');assert.equal(audio.paused,true);assert(events.includes('unavailable'));p.destroy();
});
test('destroy cancels late results, removes listeners and stops audio',async()=>{
 const audio=new AudioStub();let finish;const events=[];
 const p=createChapterAudio({audio,resolve:()=>new Promise(resolve=>{finish=resolve;}),onState:s=>events.push(s.status)});
 const loading=p.load(ref(1));p.destroy();finish({url:'/1.mp3'});await loading;
 const count=events.length;audio.dispatchEvent(new Event('ended'));
 assert.equal(events.length,count);assert.equal(audio.src,'');assert.equal(audio.paused,true);
});
test('unsupported rates are rejected and errors are visible',async()=>{
 const audio=new AudioStub();const events=[];
 const p=createChapterAudio({audio,resolve:async()=>{throw new Error('offline')},onState:s=>events.push(s)});
 assert.throws(()=>p.setRate(0),/rate/i);await p.load(ref(1));assert.equal(events.at(-1).status,'error');p.destroy();
});
test('repeated chapter changes keep one pending position listener and the chosen speed',async()=>{
 const audio=new AudioStub();const p=createChapterAudio({audio,resolve:async()=>({url:'/chapter.mp3'})});
 await p.load(ref(1));p.setRate(1.25);audio.currentTime=10;
 for(let i=0;i<5;i++){await p.load(ref(2));audio.currentTime=2;await p.load(ref(1));audio.currentTime=10;}
 assert.equal(audio.playbackRate,1.25);
 assert(getEventListeners(audio,'loadedmetadata').length<=1);
 p.destroy();assert.equal(getEventListeners(audio,'loadedmetadata').length,0);
});
test('an obsolete play rejection cannot replace the current unavailable chapter state',async()=>{
 const audio=new AudioStub();const states=[];let rejectPlay;
 audio.play=()=>new Promise((_,reject)=>{rejectPlay=reject;});
 const p=createChapterAudio({audio,resolve:async r=>r.chapter===1?{url:'/1.mp3'}:null,onState:s=>states.push(s.status)});
 await p.load(ref(1));const oldPlay=p.play();await p.load(ref(2));
 rejectPlay(new Error('Aborted old source'));await oldPlay;
 assert.equal(states.at(-1),'unavailable');assert.equal(audio.src,'');p.destroy();
});
