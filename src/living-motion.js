/** Finite CSS animation only: pause hidden/offscreen scenes, respect live reduced
 * motion changes, and disconnect at every render. No timers or frame loop. */
export function setupLivingMotion(root,{document:doc=globalThis.document,matchMedia:mediaQuery=globalThis.matchMedia,IntersectionObserver:Observer=globalThis.IntersectionObserver,previousStages=new Map()}={}) {
 const scenes=[...root.querySelectorAll('[data-living-tree]')],visible=new Set(),media=mediaQuery('(prefers-reduced-motion: reduce)');
 const update=()=>{for(const scene of scenes)scene.dataset.motion=media.matches?'reduced':doc.hidden||!visible.has(scene)?'paused':'running'};
 const observer=Observer?new Observer(entries=>{for(const entry of entries)if(entry.isIntersecting)visible.add(entry.target);else visible.delete(entry.target);update();},{threshold:0.05}):null;
 const replay=event=>{const scene=event.currentTarget;if(media.matches)return;for(const animation of scene.getAnimations({subtree:true})){animation.currentTime=0;animation.play();}update();};
 for(const scene of scenes){const context=scene.dataset.treeContext,level=Number(scene.dataset.treeStage);if(context&&Number.isInteger(level)){const before=previousStages.get(context);if(before!==undefined&&level>before)scene.dataset.grown='true';previousStages.set(context,level);}scene.addEventListener('faithpath-replay',replay);if(observer)observer.observe(scene);else visible.add(scene);}
 doc.addEventListener('visibilitychange',update);media.addEventListener?.('change',update);update();
 return ()=>{observer?.disconnect();doc.removeEventListener('visibilitychange',update);media.removeEventListener?.('change',update);for(const scene of scenes){scene.removeEventListener('faithpath-replay',replay);scene.dataset.motion='paused';for(const animation of scene.getAnimations({subtree:true}))animation.cancel();}};
}
