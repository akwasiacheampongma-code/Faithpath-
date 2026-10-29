/* Isolated gallery controller. No app imports, storage, service worker or API. */
(() => {
 'use strict';
 const stages = window.OLIVE_STUDY.stages;
 const q = s => document.querySelector(s);
 const options = stages.map(s=>`<option value="${s.index}">Stufe ${s.index+1}</option>`).join('');
 q('#stage-grid').innerHTML = stages.map(s=>`<figure class="stage-card"><img src="${s.exports['512'].path}" width="512" height="512" loading="lazy" alt="${s.name}: neuer botanischer Entwurf"><figcaption><span class="stage-number">${s.index+1}</span><h3>${s.name.replace('Fruchttragender','Frucht&shy;tra&shy;gen&shy;der').replace('Wachsender','Wach&shy;sen&shy;der').replace('Olivenbaum','Oli&shy;ven&shy;baum')}</h3><p>${s.meaning}</p>${s.opticalCloseUp?'<small>Optische Nahansicht</small>':''}</figcaption></figure>`).join('');
 q('#compare-stage').innerHTML = q('#preview-stage').innerHTML = options;
 q('#compare-stage').value=q('#preview-stage').value='6';
 const params = new URLSearchParams(location.search);
 if(['light','paper','atmospheric','night'].includes(params.get('theme')))q('#theme').value=params.get('theme');
 function compare(){ const n=Number(q('#compare-stage').value);q('#old-art').src=`assets/previous/stage-${n}.svg`;q('#new-art').src=stages[n].exports['1024'].path; }
 function preview(){ const url=`preview.html?view=${q('#preview-view').value}&theme=${q('#theme').value}&stage=${q('#preview-stage').value}`;q('#phone').src=url;q('#phone').style.width=q('#preview-width').value+'px';q('#phone').style.height=q('#preview-width').value==='320'?'568px':'844px';q('#open-preview').href=url; }
 q('#theme').addEventListener('change',()=>{document.documentElement.dataset.theme=q('#theme').value;preview();});
 q('#compare-stage').addEventListener('change',compare);
 for(const id of ['preview-view','preview-width','preview-stage'])q('#'+id).addEventListener('change',preview);
 document.documentElement.dataset.theme=q('#theme').value;compare();preview();
 // Explicit German syllables keep this portable gallery readable without an
 // installed browser hyphenation dictionary. Underlying stage data is intact.
 const breaks={Wachstumsschwellwert:'Wachs\u00adtums\u00adschwell\u00adwert',nebeneinanderstehen:'ne\u00adben\u00adei\u00adnan\u00adder\u00adste\u00adhen',Geschichte:'Ge\u00adschich\u00adte',Charakter:'Cha\u00adrak\u00adter',Entscheidung:'Ent\u00adschei\u00addung',Entwicklungen:'Ent\u00adwick\u00adlun\u00adgen',Erfahrungen:'Er\u00adfah\u00adrun\u00adgen',Speicherformat:'Spei\u00adcher\u00adfor\u00admat',Glaubensgeschichte:'Glau\u00adbens\u00adge\u00adschich\u00adte'};
 const walker=document.createTreeWalker(document.querySelector('main'),NodeFilter.SHOW_TEXT);
 for(let node; (node=walker.nextNode());){if(['SCRIPT','STYLE','OPTION'].includes(node.parentElement.tagName))continue;node.textContent=node.textContent.replace(/Geschichte|Charakter|Entscheidung|Entwicklungen|Erfahrungen|Speicherformat|Glaubensgeschichte|Wachstumsschwellwert|nebeneinanderstehen/g,w=>breaks[w]);}

})();
