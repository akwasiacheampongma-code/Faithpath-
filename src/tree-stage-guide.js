import {stageNames} from './content.js';
import {escapeHtml as e} from './view-html.js';

/**
 * Seven narrative metaphors, not a Bible-mandated ladder of faith maturity.
 * The domain owns stage selection; this presentation module never writes state.
 */
export const TREE_STAGE_MEANINGS = Object.freeze([
  {
    "meaning": "Ein Anfang darf klein sein: eine Frage, ein Gedanke oder ein neuer Wunsch. Deine Geschichte zählt auch dann, wenn du noch keine Entwicklung ausdrücklich bestätigt hast."
  },
  {
    "meaning": "Du hast einen ersten Moment persönlicher Veränderung bewusst festgehalten. Etwas wird sichtbar, auch wenn längst nicht alles geklärt ist."
  },
  {
    "meaning": "Weitere bewusst bestätigte Erfahrungen verbinden sich zu deiner Geschichte. Neue Schritte, offene Fragen und Umwege dürfen nebeneinanderstehen."
  },
  {
    "meaning": "Wie ein Olivenbaum Zeit braucht, darf auch deine Geschichte langsam und ungerade wachsen. Veränderung ist kein Wettlauf."
  },
  {
    "meaning": "Ein Baum mit tieferen Wurzeln erinnert an Halt und Ausdauer. Dieses Bild bedeutet nicht, dass du immer stark sein musst."
  },
  {
    "meaning": "Die ersten Früchte erinnern an Liebe, Geduld und Versöhnung. FaithPath bewertet diese Eigenschaften nicht, sondern bewahrt, was du selbst als Entwicklung festgehalten hast."
  },
  {
    "meaning": "Viele bewusst bestätigte Entwicklungen gehören zu deiner Geschichte. Das ist weder eine Auszeichnung für perfekten Glauben noch das Ende deines Weges."
  }
].map(Object.freeze));

export function renderTreeStageGuide(level = 0) {
 const stage = Number.isInteger(level) && level >= 0 && level < stageNames.length ? level : 0;
 const rows = stageNames.map((name, i) => [
  '<li class="tree-stage-card"'+(i === stage ? ' aria-current="step"' : '')+'>',
  '<strong>'+e(name)+'</strong>',
  i === stage ? '<span class="meta">Deine aktuelle Darstellung</span>' : '',
  '<p>'+e(TREE_STAGE_MEANINGS[i].meaning)+'</p>',
  '</li>',
 ].join('')).join('');
 return [
  '<section class="section tree-stage-guide" aria-labelledby="tree-stage-guide-title">',
  '<span class="overline">Deinen Olivenbaum verstehen</span>',
  '<h2 id="tree-stage-guide-title">'+e(stageNames[stage])+': Was dieses Bild bedeutet</h2>',
  '<p class="tree-stage-current-meaning">'+e(TREE_STAGE_MEANINGS[stage].meaning)+'</p>',
  '<p class="meta">Dein Baum erzählt von selbst festgehaltenen Entwicklungen. Er misst nicht deinen Glauben oder deinen Wert.</p>',
  '<details class="tree-stage-details"><summary>Alle sieben Stufen und ihre Bedeutung</summary>',
  '<ol>'+rows+'</ol></details>',
  '<details class="tree-stage-why"><summary>Warum genau sieben?</summary>',
  '<div class="tree-stage-why-body">',
  '<p>Die Zahl Sieben ist in vielen biblischen Bildern mit Vollständigkeit verbunden. ',
  'Die Bibel schreibt jedoch keine sieben Stufen vor, die ein Christ durchlaufen muss. ',
  'FaithPath verwendet sieben Bilder als gestalterischen Rahmen für deine persönliche Geschichte.</p>',
  '<p>Der Olivenbaum erinnert an Psalm 52 und an das Bild eines verwurzelten Baumes in Jeremia 17,7–8. ',
  'Die Frucht-Symbolik erinnert an Galater 5,22–23. ',
  'Diese Bibelstellen geben keine geistliche Rangliste vor.</p>',
  '<p>Die Darstellung verändert sich ausschließlich durch ausdrücklich festgehaltene Entwicklungs-Momente. ',
  'Ein gelesenes Kapitel, eine erledigte Aufgabe oder eine Quizantwort zählen dafür nicht automatisch. ',
  'Auch nach der siebten Stufe geht dein Weg weiter.</p>',
  '</div></details>',
  '</section>'
 ].join('');
}
