/** Presentation only: verse IDs/text and existing context markup are supplied by
 * the reader. Groups can contain block note context without invalid nested <p>s. */
export function renderReaderFlow(verses,renderVerse){
 const groups=[];for(let i=0;i<verses.length;i+=5)groups.push(`<div class="reader-paragraph">${verses.slice(i,i+5).map(renderVerse).join(' ')}</div>`);
 return groups.join('');
}
export function readingTools(){return `<details class="reading-settings"><summary aria-label="Aa – Lesedarstellung">Aa</summary><div class="reading-tools" aria-label="Lesedarstellung"><button type="button" data-verbunden-action="smaller" aria-label="Leseschrift verkleinern">A−</button><button type="button" data-verbunden-action="larger" aria-label="Leseschrift vergrößern">A+</button><button type="button" data-verbunden-action="focus" aria-pressed="false">Lesefokus</button></div></details><div class="reading-focus-exit"><button type="button" data-verbunden-action="focus">Lesefokus beenden</button></div>`;}
