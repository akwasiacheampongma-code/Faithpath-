/** A neutral choice, not a faith classification. No inputs, required sequence or state. */
export function onboardingContent({button}) {
 return `<div class="onboarding-intro"><span class="overline">Deine persönliche Glaubensgeschichte</span><h3>Dein Glaube.<br>Dein Leben.<br>Dein Weg.</h3><p>Entdecke Gottes Wort. Halte fest, was dich bewegt. Erkenne mit der Zeit deine eigene Geschichte.</p></div>
 <div class="onboarding-choices">${button('Ich brauche Orientierung','onboard-next',{},'button primary')}${button('Direkt zur Bibel','onboard-skip',{},'button quiet')}</div>
 <p class="meta onboarding-freedom">Ohne Anmeldung. Ohne Pflichtprogramm.</p>
 <details class="onboarding-personal"><summary>Mein persönlicher Weg</summary><p>Du kannst einen Gedanken festhalten, einen eigenen kleinen Schritt wählen und später darauf zurückblicken. Alles ist freiwillig.</p><p>Der Olivenbaum zeigt Entwicklung, die du selbst dokumentierst. Das Schwert macht deine Bibelreise sichtbar. Beide bewerten weder deinen Glauben noch deinen Wert.</p></details>`;
}
