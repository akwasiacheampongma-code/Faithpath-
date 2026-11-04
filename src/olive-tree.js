import {stageNames} from './content.js';
import {STUDY} from './olive-a51/stage-data.js';
import {escapeHtml as e} from './view-html.js';
export function renderOliveTree(level=0,{context='main',label='Olivenbaum',decorative=false}={}) {
 const stage=Number.isInteger(level)&&level>=0&&level<7?level:0;
 const image=new URL('./olive-a51/'+STUDY.stages[stage].variants[0].src,import.meta.url).href;
 return `<span class="olive-art olive-a51" data-a51-tree data-tree-context="${e(context)}" data-tree-stage="${stage}"${decorative?' aria-hidden="true"':` role="img" aria-label="${e(label)} – ${e(stageNames[stage])}"`}><img class="a51-emergency" src="${e(image)}" alt="" loading="lazy" decoding="async"></span>`;
}
