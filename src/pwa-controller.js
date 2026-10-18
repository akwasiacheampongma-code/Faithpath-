/** Read-only worker protocol. Always settle and release both message ports.
 * @returns {Promise<{ready:boolean,build:string}|null>}
 */
export function requestWorkerStatus(worker,{MessageChannel:Channel=globalThis.MessageChannel,timeoutMs=2000}={}) {
 return new Promise(resolve=>{
  let channel,timer,settled=false;
  const finish=value=>{
   if(settled)return;settled=true;clearTimeout(timer);
   if(channel){channel.port1.onmessage=null;for(const port of [channel.port1,channel.port2])try{port.close();}catch{/* A transferred port may already be detached. */}}
   resolve(value);
  };
  try {
   channel=new Channel();channel.port1.onmessage=event=>finish(event.data);
   timer=setTimeout(()=>finish(null),timeoutMs);
   worker.postMessage({type:'STATUS'},[channel.port2]);
  } catch {finish(null);}
 });
}

/** Own worker lifecycle; no storage, data migration or automatic activation.
 * Hooks update existing presentation only. Call start once during app startup.
 * @param {{build:string,getServiceWorker:()=>ServiceWorkerContainer|undefined,
 * onStatus:(ready:boolean)=>void,onWaiting:(worker:ServiceWorker|null)=>void,
 * onNotice:Function,reload:()=>void,isDialogOpen:()=>boolean,
 * addFocusListener:Function,requestStatus?:Function}} dependencies
 */
export function createPwaController({build,getServiceWorker,onStatus,onWaiting,onNotice,reload,isDialogOpen,addFocusListener,requestStatus=requestWorkerStatus}) {
 let sequence=0,updating=false,started=false;
 async function status() {
  const current=++sequence;let ready=false;
  try {
   const serviceWorker=getServiceWorker(),registration=await serviceWorker?.getRegistration();
   if(registration?.active?.state==='activated'&&serviceWorker.controller){
    const info=await requestStatus(registration.active);ready=!!info?.ready&&info.build===build;
   }
  } catch {/* Optional platform access must not break the online application. */}
  if(current===sequence)onStatus(ready);
  return ready;
 }
 const refresh=()=>{void status().catch(error=>onNotice(error.message,true));};
 async function start() {
  if(started)return;
  try {
   const serviceWorker=getServiceWorker();if(!serviceWorker)return;started=true;
   const registration=await serviceWorker.register('./sw.js',{updateViaCache:'none'});
   const check=()=>onWaiting(registration.waiting&&serviceWorker.controller?registration.waiting:null);
   check();
   registration.addEventListener('updatefound',()=>registration.installing?.addEventListener('statechange',()=>{setTimeout(check,0);refresh();}));
   serviceWorker.addEventListener('controllerchange',()=>{
    if(updating)reload();else{onWaiting(null);refresh();}
   });
   await serviceWorker.ready;await status();
   addFocusListener(()=>{registration.update().catch(()=>{});refresh();});
  } catch {
   started=false;
   onNotice('Offline-Vorbereitung konnte nicht abgeschlossen werden. Du kannst die App online weiter nutzen.',true);
  }
 }
 async function activateUpdate() {
  if(isDialogOpen()){onNotice('Speichere oder schließe zuerst deinen Entwurf.');return;}
  const registration=await getServiceWorker()?.getRegistration(),waiting=registration?.waiting;
  if(!waiting){onWaiting(null);onNotice('Deine Version ist aktuell.');return;}
  updating=true;
  try{waiting.postMessage({type:'SKIP_WAITING'});}catch(error){updating=false;throw error;}
 }
 return Object.freeze({status,start,activateUpdate});
}
