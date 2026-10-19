import {renderOliveTree} from './olive-tree.js';
/** A voluntary invitation; the first-seed editor owns actual personal input. */
export function onboardingContent({button}) {
 return `<div class="onboarding-intro"><span class="overline">FaithPath – deine persönliche Glaubensgeschichte</span><div class="onboarding-seed-art">${renderOliveTree(0,{context:'welcome',decorative:true})}</div><h3>Deine Geschichte<br>hat längst begonnen.</h3><p>Was beschäftigt dich? Verbinde einen Bibelgedanken mit deinen eigenen Worten und einem kleinen Schritt. Später kannst du darauf zurückblicken.</p></div>
 <div class="onboarding-choices">${button('Gemeinsam den ersten Samen säen','seed-start',{},'button primary')}${button('Ich brauche Orientierung','onboard-next',{},'button quiet')}${button('Direkt zur Bibel','onboard-skip',{},'button quiet')}</div>
 <p class="meta onboarding-freedom">Ohne Anmeldung. Ohne Pflichtprogramm.</p>
 <details class="onboarding-personal"><summary>Mein persönlicher Weg</summary><p>Du kannst einen Gedanken festhalten, einen eigenen kleinen Schritt wählen und später darauf zurückblicken. Alles ist freiwillig.</p><p>Der Olivenbaum zeigt Entwicklung, die du selbst dokumentierst. Das Schwert macht deine Bibelreise sichtbar. Beide bewerten weder deinen Glauben noch deinen Wert.</p></details>`;
}
