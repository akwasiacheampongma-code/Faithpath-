/** Visible-only lifecycle. Every listener/observer/RAF belongs to this scene.
 * Stage loads are generation-guarded; no storage, app state or timers involved. */
import {STAGES,windPose,referencePose,restPose,mixPose} from './motion-model.js';
import {createLeafRenderer} from './leaf-renderer.js';
import {createPerformancePolicy} from './performance-policy.js';
const image=async source=>{const img=new Image();img.src=source;await img.decode();return img;};
export function createTreeScene(root,{stage:initial=6,mode='continuous',autoplay=true,onStatus=()=>{}}={}){
 const fallback=document.createElement('img'),base=document.createElement('img'),canvas=document.createElement('canvas');
 fallback.className='tree-fallback';base.className='tree-base';canvas.className='tree-crown';
 for(const node of [fallback,base,canvas]){node.setAttribute('aria-hidden','true');root.append(node);}
 root.classList.add('tree-scene');root.setAttribute('role','img');
 base.hidden=canvas.hidden=true;fallback.alt=base.alt='';
 let renderer=null,stage=STAGES[initial],policy=createPerformancePolicy(initial===0),generation=0,ready=false,disposed=false,fatal=false;
 let visible=false,foreground=!document.hidden,enabled=true,paused=!autoplay,raf=0,running=false,activeMs=0,lastClock=0,deadline=0,resumeAt=0;
 let lastPose=restPose(),resumePose=lastPose,referenceDone=false,reason='Lädt …',renderTimes=[],submitTimes=[],changes=[];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let reducedState=reduced.matches;
 function status(text){reason=text;onStatus(text);}
 function stop(text){if(running){activeMs+=Math.max(0,performance.now()-lastClock);}running=false;cancelAnimationFrame(raf);raf=0;policy.pause();if(text)status(text);}
 function rest(){lastPose=restPose();renderer?.draw(lastPose);}
 function fallbackTo(text){fatal=true;stop(text+' Ruhende Illustration.');canvas.hidden=base.hidden=true;fallback.hidden=false;}
 function targetPose(ms){return mode==='reference'?referencePose(ms):windPose(ms,stage.index);}
 function tick(now){
  if(!running||disposed)return;
  // Also guard the frame boundary: media/visibility event delivery can lag a
  // preference change. Never submit a moving frame while it is already known.
  if(reduced.matches||document.hidden||!enabled||!root.isConnected){foreground=!document.hidden;reconcile();return;}
  const elapsed=activeMs+now-lastClock;
  if(mode==='reference'&&elapsed>=8000){referenceDone=true;stop('A.4: nach acht Sekunden beendet.');rest();return;}
  if(now>=deadline){
   const period=1000/policy.settings.fps;deadline+=period;if(deadline<now-period)deadline=now+period;
   const pose=targetPose(elapsed);lastPose=mixPose(resumePose,pose,Math.min(1,(now-resumeAt)/850));
   const cost=renderer.draw(lastPose);renderTimes.push(now);submitTimes.push(cost);if(renderTimes.length>1200){renderTimes.shift();submitTimes.shift();}
   const change=policy.frame(now,cost);
   if(change){changes.push(change);if(policy.level==='static'){stop('Geringe Bildrate: ruhende Darstellung. Erneut versuchen ist möglich.');rest();return;}renderer.setQuality(policy.settings);status('Bewegt · Qualität '+policy.level);}
  }
  raf=requestAnimationFrame(tick);
 }
 function reconcile(){
  if(disposed)return;
  reducedState=reduced.matches;
  if(!ready){stop('Lädt …');return;}
  if(fatal){stop();return;}
  if(!enabled||!root.isConnected){stop('Szene deaktiviert.');return;}
  if(!foreground){stop('Im Hintergrund pausiert.');return;}
  if(!visible){stop('Außerhalb des Bildschirms pausiert.');return;}
  if(reduced.matches){stop('Reduzierte Bewegung: ruhende Illustration.');rest();return;}
  if(paused||referenceDone||policy.level==='static'){stop();return;}
  if(running)return;
  renderer.resize(root.clientWidth,policy.settings.dpr);
  resumePose=lastPose;resumeAt=lastClock=performance.now();deadline=lastClock;policy.resume(lastClock);running=true;
  status(mode==='reference'?'A.4: acht Sekunden, ursprüngliche Auslenkung.':'Kontinuierlicher Wind · Stamm und Wurzeln bleiben still.');raf=requestAnimationFrame(tick);
 }
 async function setStage(index){
  const token=++generation;stop();ready=false;fatal=false;referenceDone=false;activeMs=0;lastPose=restPose();stage=STAGES[index];
  if(!stage)throw Error('Unbekannte Baumstufe.');
  policy=createPerformancePolicy(index===0);changes=[];renderTimes=[];submitTimes=[];
  root.setAttribute('aria-label',stage.name+' – Illustration der dokumentierten persönlichen Geschichte.');
  fallback.src=stage.runtime.full;fallback.hidden=false;base.hidden=canvas.hidden=true;status('Lädt …');
  try{
   const [upper,lower]=await Promise.all([image(stage.runtime.upper),image(stage.runtime.base)]);
   if(disposed||token!==generation)return false;
   if(!renderer||renderer.lost){renderer?.dispose();renderer=createLeafRenderer(canvas,{onLost:()=>fallbackTo('Grafikdarstellung unterbrochen.')});}
   base.src=lower.src;await base.decode();if(disposed||token!==generation)return false;
   // A context may be lost during DOM-image decoding. Never replace the full
   // fallback with a lost canvas just because the original load completed.
   if(fatal||renderer.lost){ready=true;fallbackTo('Grafikdarstellung während des Ladens unterbrochen.');return false;}
   renderer.setStage(stage,upper,{mode,grid:policy.settings.cells});renderer.resize(root.clientWidth,policy.settings.dpr);rest();
   fallback.hidden=true;base.hidden=canvas.hidden=false;ready=true;reconcile();return true;
  }catch{if(!disposed&&token===generation){ready=true;fallbackTo('Bewegte Darstellung nicht verfügbar.');}return false;}
 }
 const intersection=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting&&entries[0].intersectionRatio>=.01;reconcile();},{threshold:[0,.01]});intersection.observe(root);
 const resize=new ResizeObserver(()=>{if(!renderer||!ready||fatal||!visible||!foreground)return;renderer.resize(root.clientWidth,policy.settings.dpr);renderer.draw(lastPose);});resize.observe(root);
 const visibility=()=>{foreground=!document.hidden;reconcile();},pagehide=()=>{foreground=false;reconcile();},pageshow=()=>{foreground=!document.hidden;reconcile();},motionChange=()=>reconcile();
 document.addEventListener('visibilitychange',visibility);window.addEventListener('pagehide',pagehide);window.addEventListener('pageshow',pageshow);reduced.addEventListener('change',motionChange);
 const readyPromise=setStage(initial);
 return{
  ready:readyPromise,setStage,
  pause(){paused=true;stop('Bewegung angehalten.');},
  play(){if(mode==='reference'){stop();activeMs=0;lastPose=restPose();}paused=false;referenceDone=false;reconcile();},
  retry(){policy.reset();renderer?.setQuality(policy.settings);paused=false;reconcile();},
  setEnabled(value){enabled=Boolean(value);reconcile();},
  inspect(ms,{full=false}={}){paused=true;stop('Prüfposition.');lastPose=reduced.matches?restPose():targetPose(ms);renderer?.draw(lastPose,{full});},
  get renderer(){return renderer;},get stage(){return stage;},
  get metrics(){return{stage:stage.index,mode,ready,fatal,running,visible,foreground,enabled,paused,reduced:reducedState,rafPending:Boolean(raf),activeMs:activeMs+(running?performance.now()-lastClock:0),reason,quality:policy.level,qualityChanges:changes,performanceSamples:policy.samples,...renderer?.metrics,renderTimes:renderTimes.slice(),submitTimes:submitTimes.slice()};},
  dispose(){if(disposed)return;stop();disposed=true;generation++;intersection.disconnect();resize.disconnect();document.removeEventListener('visibilitychange',visibility);window.removeEventListener('pagehide',pagehide);window.removeEventListener('pageshow',pageshow);reduced.removeEventListener('change',motionChange);renderer?.dispose();root.replaceChildren();}
 };
}
