import {createTreeScene} from './olive-a51/tree-scene.js';
const scenes=new Map();
export function reconcileOliveTrees(root=document) {
 const present=new Set();
 for(const placeholder of root.querySelectorAll('[data-a51-tree]')){
  const key=placeholder.dataset.treeContext,presentStage=Number(placeholder.dataset.treeStage);present.add(key);
  let item=scenes.get(key);
  if(item){
   if(item.host!==placeholder){placeholder.replaceWith(item.host);item.host.after(item.failure);}
   if(item.stage!==presentStage){item.stage=presentStage;item.host.dataset.treeStage=String(presentStage);void item.scene.setStage(presentStage);}
   item.scene.setEnabled(!document.querySelector('dialog[open]')||Boolean(item.host.closest('dialog[open]')));
  }else{
   const emergency=placeholder.querySelector('img');
   const failure=document.createElement('p');failure.className='meta a51-image-error';failure.hidden=true;failure.setAttribute('role','status');placeholder.after(failure);
   const scene=createTreeScene(placeholder,{stage:presentStage,onStatus:text=>{
    placeholder.dataset.treeStatus=text;
    if(text.includes('nicht geladen')){if(emergency)emergency.hidden=true;failure.hidden=false;failure.replaceChildren(document.createTextNode('Das Baumbild ist gerade nicht verfügbar. '));const retry=document.createElement('button');retry.type='button';retry.className='text-button';retry.textContent='Baumbild erneut laden';retry.addEventListener('click',()=>{failure.hidden=true;void scene.retry().then(ok=>{if(ok)emergency?.remove();});});failure.append(retry);}else if(!text.includes('geladen'))failure.hidden=true;
   }});
   item={host:placeholder,scene,stage:presentStage,failure};
   scene.setEnabled(!document.querySelector('dialog[open]')||Boolean(placeholder.closest('dialog[open]')));scenes.set(key,item);
   void scene.ready.then(ok=>{if(ok)emergency?.remove();});
  }
 }
 for(const [key,item]of scenes)if(!present.has(key)){item.scene.dispose();item.failure?.remove();scenes.delete(key);}
}
// Narrow diagnostic API for synthetic browser QA; no private state.
export function oliveDiagnostics(){return [...scenes].map(([context,x])=>({context,...x.scene.metrics}));}
export function pauseOliveTrees(paused){for(const {scene}of scenes.values())paused?scene.pause():scene.play();}
export function disposeOliveTrees(){for(const {scene,failure}of scenes.values()){scene.dispose();failure?.remove();}scenes.clear();}
