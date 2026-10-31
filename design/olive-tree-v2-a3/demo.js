(() => {
 'use strict';const q=s=>document.querySelector(s),p=new URLSearchParams(location.search),theme=p.get('theme');if(['light','paper','atmospheric','night'].includes(theme)){document.documentElement.dataset.theme=theme;q('#theme').value=theme;}
 const scene=window.OLIVE_SCENE.create(q('#tree'),5),motion=window.OLIVE_MOTION.create(q('#tree'),text=>q('#status').textContent=text);
 const label=()=>q('#stage-name').textContent='Stufe '+(scene.stage+1)+' · '+window.OLIVE_A3.stages[scene.stage].name;
 q('#theme').addEventListener('change',()=>document.documentElement.dataset.theme=q('#theme').value);
 q('#play').addEventListener('click',()=>{if(!scene.pending)motion.play();});
 q('#reset').addEventListener('click',()=>{motion.stop('Demo zurückgesetzt.');scene.render(5);q('#next').disabled=false;label();});
 q('#next').addEventListener('click',async()=>{if(scene.pending||scene.stage!==5)return;motion.stop('Registrierte Überblendung.');q('#next').disabled=true;try{const finished=await scene.transitionTo(6,{reduced:motion.reduced});label();if(finished)q('#status').textContent=motion.reduced?'Reduzierte Bewegung: Stufe 7 sofort dargestellt.':'Überblendung beendet. Stamm und Boden wurden nicht bewegt.';}catch{q('#status').textContent='Eine Bildebene konnte nicht geladen werden. Die bisherige Stufe bleibt erhalten. Du kannst es erneut versuchen.';q('#next').disabled=false;}});
 scene.ready().then(label).catch(()=>q('#status').textContent='Bildebene nicht verfügbar. Bitte die vollständige Galerie lokal öffnen.');window.addEventListener('pagehide',()=>{motion.stop();scene.finishTransition();});document.addEventListener('visibilitychange',()=>{if(document.hidden)scene.finishTransition();});matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',e=>{if(e.matches)scene.finishTransition();});
 window.A3_DEMO={scene,motion};
})();
