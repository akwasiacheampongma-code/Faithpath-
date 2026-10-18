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

// Presentation fallback only. The domain's treeLevel still selects real stages.
const stageIndex = level => Number.isInteger(level) && level >= 0 && level < stageNames.length ? level : 0;

/** The current meaning belongs beside the title, before the image/path list. */
export function renderTreeStageMeaning(level = 0) {
 return '<p class="tree-stage-current-meaning">'+e(TREE_STAGE_MEANINGS[stageIndex(level)].meaning)+'</p>'+
  '<p class="tree-personal-meaning">Dein Baum misst nicht deinen Glauben, deine Nähe zu Gott oder deinen Wert.</p>';
}

export function renderTreeStageGuide(level = 0) {
 const stage = stageIndex(level);
 const rows = stageNames.map((name, i) => [
  '<li class="tree-stage-card"'+(i === stage ? ' aria-current="step"' : '')+'>',
  '<strong>'+e(name)+'</strong>',
  i === stage ? '<span class="meta">Deine aktuelle Darstellung</span>' : '',
  '<p>'+e(TREE_STAGE_MEANINGS[i].meaning)+'</p>',
  '</li>',
 ].join('')).join('');
 return [
  '<section class="section tree-stage-guide" aria-labelledby="tree-stage-guide-title">',
  '<h2 id="tree-stage-guide-title">Deinen Olivenbaum verstehen</h2>',
  '<details class="tree-stage-details"><summary>Alle sieben Stufen und ihre Bedeutung</summary>',
  '<ol>'+rows+'</ol></details>',
  '<details class="tree-stage-why"><summary>Warum genau sieben?</summary>',
  '<div class="tree-stage-why-body">',
  '<p>Die Zahl Sieben ist in vielen biblischen Bildern mit Vollständigkeit verbunden. ',
  'Die Bibel schreibt jedoch keine sieben Stufen vor, die ein Christ durchlaufen muss. ',
  'FaithPath verwendet sieben Bilder als gestalterischen Rahmen für deine persönliche Geschichte.</p>',
  '<p>Psalm 52 beschreibt Vertrauen auf Gottes Güte und Treue: ',
  'Der Beter vergleicht sich mit einem grünen Ölbaum im Haus Gottes.</p>',
  '<p>Jeremia 17,7–8 beschreibt einen Baum am Wasser als Bild für Vertrauen auf den Herrn, ',
  'auch in Dürrezeiten.</p>',
  '<p>Galater 5,22–23 spricht von der Frucht des Geistes, etwa Liebe, Friede und Geduld. ',
  'Diese Bilder sind keine geistliche Rangliste. FaithPath zählt oder bewertet die Frucht des Geistes nicht.</p>',
  '<p>Die Darstellung verändert sich ausschließlich durch ausdrücklich festgehaltene Entwicklungs-Momente. ',
  'Ein gelesenes Kapitel, eine erledigte Aufgabe oder eine Quizantwort zählen dafür nicht automatisch. ',
  'Auch nach der siebten Stufe geht dein Weg weiter.</p>',
  '</div></details>',
  '</section>'
 ].join('');
}
