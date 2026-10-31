/* Isolated scene renderer. Reads asset coordinates; never reads app storage. */
(() => {
 'use strict';const m=window.OLIVE_A3,n=m.canvas;
 function image(src,cls='',attrs={}){const im=new Image(n,n);im.src=src;im.className=cls;im.alt='';im.draggable=false;for(const[k,v]of Object.entries(attrs))im.dataset[k]=v;return im;}
 function canopies(stage){const stack=document.createElement('div');stack.className='canopies';
  for(const key of ['C1','C2','C3']){const group=document.createElement('div');group.className='crown-group '+key;group.dataset.group=key;const anchor=m.geometry.components[key].target;group.style.transformOrigin=anchor.map(x=>x/n*100+'%').join(' ');
   if(key==='C1')group.append(image(stage.layers.F1,'art-layer', {layer:'F1'}));
   group.append(image(stage.layers[key],'art-layer',{layer:key}));
   if(key==='C3')group.append(image(stage.layers.F2,'art-layer',{layer:'F2'}));
   const light=document.createElement('span');light.className='crown-light';light.style.maskImage=`url("${stage.layers[key]}")`;light.style.webkitMaskImage=`url("${stage.layers[key]}")`;group.append(light);stack.append(group);
  }return stack;
 }
 async function decoded(node){await Promise.all([...node.querySelectorAll('img')].map(i=>i.decode()));}
 function create(root,initial=5){let current=initial,pending=false,timer=null,finishPending=null,cancelPending=null,generation=0;root.classList.add('tree-scene');root.setAttribute('role','img');
  function label(){root.setAttribute('aria-label','Olivenbaum – '+m.stages[current].name+' – isolierte Designstudie');root.dataset.stage=String(current);}
  function render(index){if(!m.stages[index])throw new RangeError('Unknown tree stage');generation++;clearTimeout(timer);cancelPending?.();cancelPending=null;finishPending=null;pending=false;current=index;const s=m.stages[index];root.replaceChildren();if(!s.rigged)root.append(image(s.composite,'art-layer',{flat:'true'}));else root.append(image(s.layers.G,'art-layer static-layer',{static:'G'}),image(s.layers.W,'art-layer static-layer',{static:'W'}),canopies(s));label();}
  render(initial);
  async function transitionTo(index,{reduced=false}={}){
   if(pending||index===current)return false;const from=m.stages[current],to=m.stages[index];if(!to)return false;
   if(reduced||!from.rigged||!to.rigged||from.layers.W!==to.layers.W){render(index);return true;}
   pending=true;const revision=generation,next=canopies(to);next.classList.add('incoming');try{await decoded(next);}catch(error){if(revision===generation)pending=false;throw error;}if(revision!==generation)return false;
   const old=root.querySelector('.canopies');root.append(next);void next.offsetWidth;old.classList.add('outgoing');next.classList.add('reveal');
   return new Promise(resolve=>{let done=false;const clean=()=>{clearTimeout(timer);next.removeEventListener('transitionend',finish);cancelPending=null;finishPending=null;};const finish=()=>{if(done)return;done=true;clean();old.remove();next.classList.remove('incoming','reveal');current=index;pending=false;label();resolve(true);};cancelPending=()=>{if(done)return;done=true;clean();next.remove();resolve(false);};finishPending=finish;next.addEventListener('transitionend',finish,{once:true});timer=setTimeout(finish,1250);});
  }
  return{render,transitionTo,get stage(){return current;},get pending(){return pending;},ready:()=>decoded(root),finishTransition:()=>finishPending?.(),dispose(){generation++;cancelPending?.();pending=false;clearTimeout(timer);root.replaceChildren();}};
 }
 window.OLIVE_SCENE={create};
})();
