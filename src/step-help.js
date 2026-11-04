import {LIFE_TOPICS} from './content.js';
import {stepSuggestions,SENTENCE_STARTS,smallerStep,topicsForCategory} from './step-suggestions.js';
import {escapeHtml as e} from './view-html.js';

/** One optional helper shared by real editors. Selection only stages a candidate. */
export function renderStepHelp({topic='',category='sonstiges',used=[],field='text',scope='form',candidate=''}={}) {
 const b=(label,text)=>`<button type="button" class="button quiet step-candidate" data-action="guided-candidate" data-text="${e(text)}">${e(label)}</button>`;
 return `<section class="step-help" data-step-help data-field="${e(field)}" data-scope="${scope}" data-topic="${e(topic)}" data-category="${e(category)}" data-used="${e(JSON.stringify(used))}"><h2>Hilfe für deinen kleinen Schritt</h2><p>Freiwillige praktische Anregungen. Wähle, ändere oder schreibe ganz eigene Worte.</p><button type="button" class="text-button" data-action="guided-own">Ich schreibe meinen Schritt selbst</button>${scope==='form'?`<label>Passendes Lebensthema (optional)<select data-guided-topic name="guidedTopic"><option value="">Nach Bereich</option>${[...topicsForCategory(category),...LIFE_TOPICS.filter(t=>t.category!==category)].map(t=>`<option value="${t.id}"${topic===t.id?' selected':''}>${e(t.title)}</option>`).join('')}</select></label>`:''}<div data-guided-options>${stepSuggestions({topic,category,used}).map(x=>`<article><h3>${e(x.kind)}</h3>${b(x.text,x.text)}</article>`).join('')||'<p>Diese Anregungen hast du schon verwendet. Schreibe eigene Worte oder wähle ein anderes Thema.</p>'}</div><details><summary>Eigene Worte leichter finden</summary><div class="actions">${SENTENCE_STARTS.map(t=>b(t,t)).join('')}</div></details><button type="button" class="text-button" data-action="guided-smaller">Schritt kleiner machen</button><div data-guided-preview${candidate?'':' hidden'}><label>Deine bearbeitbare Anregung<textarea data-guided-candidate name="stepCandidate" rows="4">${e(candidate)}</textarea></label><p class="meta">Dein bisheriger Text bleibt erhalten, bis du ausdrücklich übernimmst.</p><div class="actions"><button type="button" class="button quiet" data-action="guided-apply">In mein Eingabefeld übernehmen</button><button type="button" class="text-button" data-action="guided-append">An meine Worte anhängen</button><button type="button" class="text-button" data-action="guided-cancel">Verwerfen</button></div><div data-guided-confirm hidden><p>In deinem Eingabefeld stehen bereits eigene Worte. Möchtest du sie durch diese Anregung ersetzen?</p><button type="button" class="button quiet" data-action="guided-replace">Eigene Worte ausdrücklich ersetzen</button></div></div></section>`;
}
export function handleStepHelp(action,button) {
 const help=button.closest('[data-step-help]');if(!help)return false;
 const preview=help.querySelector('[data-guided-preview]'),candidate=help.querySelector('[data-guided-candidate]'),confirm=help.querySelector('[data-guided-confirm]');
 const target=help.dataset.scope==='seed'?document.querySelector('#seed-next'):document.querySelector('#editor-form [name="'+help.dataset.field+'"]');
 if(!target)return false;
 if(action==='guided-own'){target.focus();target.scrollIntoView({block:'center',behavior:'instant'});return true;}
 if(action==='guided-candidate'||action==='guided-smaller'){
  candidate.value=action==='guided-smaller'?smallerStep(help.dataset):button.dataset.text;candidate.dispatchEvent(new Event('input',{bubbles:true}));preview.hidden=false;confirm.hidden=true;candidate.focus();return true;
 }
 if(action==='guided-cancel'){candidate.value='';candidate.dispatchEvent(new Event('input',{bubbles:true}));preview.hidden=true;confirm.hidden=true;return true;}
 if(action==='guided-apply'&&target.value.trim()&&target.value!==candidate.value){confirm.hidden=false;confirm.querySelector('button').focus();return true;}
 if(['guided-apply','guided-replace','guided-append'].includes(action)){
  target.value=action==='guided-append'&&target.value.trim()?target.value+'\n'+candidate.value:candidate.value;
  target.dispatchEvent(new Event('input',{bubbles:true}));candidate.value='';candidate.dispatchEvent(new Event('input',{bubbles:true}));preview.hidden=true;confirm.hidden=true;target.focus();return true;
 }
 return false;
}
