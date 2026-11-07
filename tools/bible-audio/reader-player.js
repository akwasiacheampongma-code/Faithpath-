/** Optional reader adapter. No router, app store, progress or localStorage writes.
 * @param {{audio:HTMLAudioElement,resolve:(ref:Object)=>Promise<{url:string}|null>,onState?:(state:Object)=>void}} options
 * resolve must match the exact translation, chapter and approved text hash.
 */
export function createChapterAudio({audio,resolve,onState=()=>{}}){
 let serial=0,destroyed=false,current=null,pendingPosition=null,rate=1;
 const positions=new Map(),listeners=[];
 const key=ref=>`${ref.translation}:${ref.book}:${ref.chapter}`;
 const emit=(status,message='')=>{if(!destroyed)onState({status,message,ref:current});};
 const stop=()=>{if(current)positions.set(key(current),audio.currentTime);audio.pause();};
 const clear=()=>{audio.removeAttribute('src');audio.load();};
 const clearPendingPosition=()=>{if(pendingPosition){audio.removeEventListener('loadedmetadata',pendingPosition);pendingPosition=null;}};
 const listen=(name,handler)=>{audio.addEventListener(name,handler);listeners.push([name,handler]);};
 listen('ended',()=>emit('ended','Kapitel zu Ende. Du kannst zum nächsten Kapitel wechseln.'));
 listen('error',()=>emit('error','Audio konnte nicht geladen werden. Du kannst den Bibeltext weiter lesen.'));
 listen('play',()=>emit('playing'));
 listen('pause',()=>emit('paused'));
 return {
  async load(ref){
   if(destroyed)return;
   const token=++serial;
   clearPendingPosition();stop();clear();current={...ref};emit('loading');
   try{
    const entry=await resolve(ref);
    if(destroyed||token!==serial)return;
    if(!entry){emit('unavailable','Für dieses Kapitel und diese Übersetzung ist noch keine geprüfte Aufnahme vorhanden.');return;}
    audio.src=entry.url;audio.defaultPlaybackRate=rate;audio.load();
    // Apply a remembered position only once metadata is ready. Never autoplay.
    const position=positions.get(key(ref))||0;
    if(position){
     pendingPosition=()=>{if(!destroyed&&token===serial)audio.currentTime=position;clearPendingPosition();};
     audio.addEventListener('loadedmetadata',pendingPosition);
    }
    emit('ready');
   }catch{if(!destroyed&&token===serial)emit('error','Audio ist gerade nicht verfügbar. Der Bibeltext bleibt lesbar.');}
  },
  async play(){if(destroyed||!audio.src)return;const token=serial;try{await audio.play();}catch{if(!destroyed&&token===serial)emit('error','Tippe auf Wiedergabe, um das Kapitel zu starten.');}},
  pause(){if(!destroyed){stop();emit('paused');}},
  setRate(value){if(!Number.isFinite(value)||value<.5||value>2)throw new RangeError('Unsupported playback rate');if(!destroyed){rate=value;audio.defaultPlaybackRate=value;audio.playbackRate=value;}},
  destroy(){if(destroyed)return;clearPendingPosition();stop();destroyed=true;serial++;for(const [name,handler]of listeners)audio.removeEventListener(name,handler);clear();positions.clear();}
 };
}
