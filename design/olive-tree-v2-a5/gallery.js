import {STAGES} from './motion-model.js';
import {createTreeScene} from './tree-scene.js';
const $=selector=>document.querySelector(selector),params=new URLSearchParams(location.search);
const themes=['light','paper','atmospheric','night'];
const theme=themes.includes(params.get('theme'))?params.get('theme'):'paper';document.documentElement.dataset.theme=theme;$('#theme').value=theme;
if(params.has('capture'))document.body.classList.add('capture');
$('#theme').addEventListener('change',event=>document.documentElement.dataset.theme=event.target.value);
for(const stage of STAGES){const option=document.createElement('option');option.value=stage.index;option.textContent=stage.name;$('#stage').append(option);}
const index=Math.min(6,Math.max(0,Number(params.get('stage')??6)));$('#stage').value=index;
const live=createTreeScene($('#live-tree'),{stage:index,autoplay:!params.has('paused'),onStatus:text=>$('#status').textContent=text});
let oldScene=null,newScene=null,currentView='preview';
function description(stage){$('#stage-name').textContent=stage.name.replace('Fruchttragender','Frucht\u00adtragender').replaceAll('Olivenbaum','Oliven\u00adbaum');$('#stage-meaning').textContent=stage.meaning;}
description(STAGES[index]);
$('#stage').addEventListener('change',()=>{const i=Number($('#stage').value);description(STAGES[i]);live.setStage(i);});
const contexts={
 today:['HEUTE','Was in dir wächst.','Deine Gedanken und bewusst festgehaltenen Entwicklungen verbinden sich zu deiner Geschichte.'],
 journey:['MEIN WEG','Was dich begleitet.','Ein Anliegen, eigene Worte, ein nächster Schritt. Hier bleibt miteinander verbunden, was dir wichtig ist.'],
 detail:['DEIN OLIVENBAUM','Geschichte, die bleibt.','Diese sieben Bilder sind eine gestalterische Entscheidung. Sie messen weder geistliche Reife noch Gottes Nähe.'],
 seed:['DEIN ERSTER WEG','Ein Anfang darf klein sein.','Der erste Weg wäre jetzt gespeichert. Das symbolische Pflanzen vergibt keine zusätzliche Entwicklungsstufe.']
};
function context(value){$('#context').value=value;const [area,title,intro]=contexts[value];$('#area').textContent=area;$('#screen-title').textContent=title;$('#screen-intro').textContent=intro;document.querySelectorAll('[data-context]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.context===value)));if(value==='seed'){$('#stage').value=0;description(STAGES[0]);live.setStage(0);}$('#next-step').hidden=value==='detail';}
$('#context').addEventListener('change',()=>context($('#context').value));
document.querySelectorAll('[data-context]').forEach(button=>button.addEventListener('click',()=>context(button.dataset.context)));
for(const id of ['bible','quick-bible','bible-nav','journal-nav','continue'])$('#'+id).addEventListener('click',()=>$('#demo-message').textContent='Gestaltungsvorschau: In der App führt dieser Zugang zu '+(id.includes('bible')?'deiner Bibel.':id==='journal-nav'?'deinem Journal.':'deinem vorhandenen persönlichen Weg.'));
$('#pause').addEventListener('click',()=>live.pause());$('#play').addEventListener('click',()=>live.play());$('#retry').addEventListener('click',()=>live.retry());
$('#read-metrics').addEventListener('click',()=>{const {renderTimes,submitTimes,...metrics}=live.metrics;$('#metrics').textContent=JSON.stringify(metrics,null,2);});
for(const stage of STAGES){const card=document.createElement('article');card.className='stage-card';const img=document.createElement('img');img.src=stage.runtime.full;img.alt=stage.name;img.loading='lazy';const heading=document.createElement('h3');heading.textContent=stage.name;const p=document.createElement('p');p.textContent=stage.meaning;const button=document.createElement('button');button.textContent='Bewegt ansehen';button.addEventListener('click',()=>{showView('preview');$('#stage').value=stage.index;description(stage);live.setStage(stage.index);$('#preview').scrollIntoView({block:'start'});});card.append(img,heading,p,button);$('#family-grid').append(card);}
function showView(view){
 currentView=view;for(const id of ['preview','family','compare'])$('#'+id).hidden=id!==view;
 document.querySelectorAll('[data-view]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.view===view)));
 $('#context-label').hidden=$('#stage-label').hidden=view!=='preview';live.setEnabled(view==='preview');
 if(view==='compare'&&!oldScene){oldScene=createTreeScene($('#old-tree'),{mode:'reference',onStatus:text=>$('#old-status').textContent=text});newScene=createTreeScene($('#new-tree'),{onStatus:text=>$('#new-status').textContent=text});}
 oldScene?.setEnabled(view==='compare');newScene?.setEnabled(view==='compare');
}
document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>showView(button.dataset.view)));
$('#restart-comparison').addEventListener('click',()=>{oldScene?.play();newScene?.play();});
if(params.get('size')){const width=Number(params.get('size'));if(width>=160&&width<=1254)$('#live-tree').style.width=width+'px';}
if(params.get('context')in contexts)context(params.get('context'));
showView(['family','compare'].includes(params.get('view'))?params.get('view'):'preview');
window.OLIVE_A5={live,get old(){return oldScene;},get next(){return newScene;},showView,get view(){return currentView;},setStage(index){$('#stage').value=index;description(STAGES[index]);return live.setStage(index);},dispose(){live.dispose();oldScene?.dispose();newScene?.dispose();}};
