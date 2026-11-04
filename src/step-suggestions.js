import {LIFE_TOPICS, PATH_CATEGORIES} from './content.js';

// Curated editorial invitations; never infer a topic from private prose.
const catalog = {
  "angst": [
    "Eine konkrete Sorge in einem Satz aufschreiben.",
    "Für eine beeinflussbare Sorge einen kleinen praktischen Schritt festlegen.",
    "Notieren, welche Befürchtung belegt ist und welche noch offen ist.",
    "Nur ein Wort für meine Sorge finden."
  ],
  "streit": [
    "Beim nächsten schwierigen Gespräch drei Sekunden warten, bevor ich antworte.",
    "Diese Woche ein sicheres, ruhiges Gespräch beginnen und zuerst fünf Minuten zuhören.",
    "Aufschreiben, was mich verletzt hat und was ich selbst beeinflussen kann.",
    "Eine Antwort erst einmal als Entwurf schreiben, ohne sie zu senden."
  ],
  "einsam": [
    "Einen Ort notieren, an dem ich mich etwas weniger allein fühle.",
    "Wenn es sich sicher anfühlt, eine vertraute Person zu einem kurzen Austausch einladen.",
    "Festhalten, welche Art von Nähe mir fehlt und welche Grenzen ich brauche.",
    "Für einen Moment an einen vertrauten Menschen denken."
  ],
  "entscheidung": [
    "Die offene Entscheidung in einem Satz benennen.",
    "Diese Woche eine fehlende Information für meine Entscheidung einholen.",
    "Zwei Möglichkeiten und ihre Folgen aufschreiben, ohne mich schon festzulegen.",
    "Nur die nächste offene Frage notieren."
  ],
  "vergebung": [
    "Aufschreiben, welche Verletzung mich noch beschäftigt.",
    "Für mich klären, ob ein sicherer nächster Schritt möglich und gewollt ist.",
    "Unterscheiden, was Vergebung, Vertrauen und persönliche Grenzen für mich bedeuten.",
    "Ein Wort für eine Grenze finden, die ich brauche."
  ],
  "zweifel": [
    "Eine offene Glaubensfrage notieren.",
    "Einen zugehörigen vorhandenen Bibelabschnitt im Zusammenhang lesen.",
    "Festhalten, was ich verstehe und was für mich weiterhin offenbleibt.",
    "Meine Frage stehen lassen, ohne heute eine Antwort zu suchen."
  ],
  "ueberfordert": [
    "Heute für zwei Minuten eine Pause ohne Bildschirm einlegen.",
    "Einen realistischen Moment der Ruhe in meinen Tagesablauf einplanen.",
    "Aufschreiben, welche Aufgabe ich heute bewusst nicht erledigen muss.",
    "Für einen Atemzug die Schultern lockern."
  ],
  "trauer": [
    "Einen Satz über das festhalten, was mir fehlt.",
    "Wenn ich möchte, einen geschützten Moment für eine Erinnerung reservieren.",
    "Notieren, was mir gerade guttut und was mir zu viel ist.",
    "Eine Erinnerung nur für mich benennen."
  ],
  "dankbar": [
    "Heute eine Sache festhalten, für die ich dankbar bin.",
    "Einer Person diese Woche ehrlich danken.",
    "Aufschreiben, was ich in letzter Zeit als selbstverständlich angesehen habe.",
    "Einen guten kleinen Moment wahrnehmen, ohne ihn erklären zu müssen."
  ],
  "wut": [
    "Wenn Wut aufkommt, meine Füße kurz auf dem Boden spüren.",
    "Für eine aufgeladene Situation eine sichere Pause einplanen, bevor ich reagiere.",
    "Aufschreiben, welches Bedürfnis oder welche Grenze hinter meiner Wut steht.",
    "Meine Antwort zunächst nicht senden."
  ],
  "familie": [
    "Eine kleine Geste der Wertschätzung bemerken.",
    "In einer sicheren Beziehung nachfragen, welche Unterstützung gerade gewünscht ist.",
    "Notieren, welche Nähe und welche Grenze ich in meiner Familie brauche.",
    "Einen Wunsch für mich in einem Wort benennen."
  ],
  "hoffnung": [
    "Einen kleinen Halt für den heutigen Tag benennen.",
    "Eine machbare Sache planen, auf die ich mich diese Woche freuen kann.",
    "Festhalten, was mir Hoffnung gibt und welche Frage offenbleibt.",
    "Nur den nächsten überschaubaren Moment ansehen."
  ],
  "versuchung": [
    "Eine Situation erkennen, in der mir eine Entscheidung schwerfällt.",
    "Für diese Situation eine kleine hilfreiche Alternative vorbereiten.",
    "Notieren, was ich in diesem Moment eigentlich suche oder brauche.",
    "Einen Auslöser in einem Wort benennen."
  ],
  "arbeit": [
    "Eine heutige Aufgabe auswählen, die wirklich Vorrang hat.",
    "Diese Woche eine Stärke in einer klar begrenzten Aufgabe einsetzen.",
    "Aufschreiben, was mir bei meiner Arbeit Sinn gibt und wo ich Grenzen brauche.",
    "Den ersten Handgriff einer Aufgabe benennen."
  ],
  "schuld": [
    "Für mich benennen, wofür ich tatsächlich Verantwortung trage.",
    "Prüfen, ob eine sichere, angemessene Wiedergutmachung möglich und gewollt ist.",
    "Unterscheiden, was meine Verantwortung ist und welche Schuld mir nur zugeschrieben wird.",
    "Eine konkrete Tatsache aufschreiben, ohne mich als Person abzuwerten."
  ],
  "selbstbeherrschung": [
    "Vor einer gewohnten Reaktion einmal bewusst ausatmen.",
    "Für einen wiederkehrenden Auslöser eine kurze Wenn-dann-Pause formulieren.",
    "Eine Situation ohne Selbstverurteilung ansehen: Was hat meine Reaktion begünstigt?",
    "Eine Reaktion nur bemerken, ohne sie sofort ändern zu müssen."
  ],
  "ruhe": [
    "Für eine Minute eine Tätigkeit ohne Nebenbeschäftigung tun.",
    "Einen kurzen geschützten Ruhezeitraum für diese Woche vereinbaren.",
    "Notieren, was mir Ruhe ermöglicht und was sie unterbricht.",
    "Für einen Augenblick den Bildschirm weglegen."
  ],
  "geduld": [
    "In einer Wartesituation einen bewussten Atemzug nehmen.",
    "Für eine langsame Aufgabe diese Woche etwas mehr Zeit einplanen.",
    "Aufschreiben, was ich beschleunigen kann und was Zeit braucht.",
    "Einmal bemerken, dass ich gerade ungeduldig bin."
  ],
  "gebet": [
    "Einen ehrlichen Satz als Gebet formulieren.",
    "Einen kurzen ruhigen Moment für ein Gebet auswählen.",
    "Notieren, was ich Gott sagen möchte und wo mir Worte fehlen.",
    "Mit einem einzigen Wort beten, wenn ich möchte."
  ],
  "bibel": [
    "Einen vorhandenen Vers langsam lesen.",
    "Einen kurzen vorhandenen Abschnitt samt Zusammenhang lesen.",
    "Eine Frage zum gelesenen Abschnitt notieren, ohne sie sofort zu lösen.",
    "Nur die Überschrift eines Abschnitts ansehen."
  ],
  "naechstenliebe": [
    "Eine kleine hilfreiche Möglichkeit in meinem Umfeld bemerken.",
    "Eine begrenzte Hilfe anbieten und die Antwort respektieren.",
    "Überlegen, welche Hilfe gebraucht wird und was meine Kräfte erlauben.",
    "Eine mögliche Hilfe nur notieren."
  ],
  "charakter": [
    "Eine Eigenschaft benennen, die mir wichtig ist.",
    "Diese Eigenschaft in einer einzelnen Alltagssituation ausprobieren.",
    "Ein konkretes Beispiel ansehen, ohne meinen Wert daraus abzuleiten.",
    "Ein Wort für die gewünschte Haltung finden."
  ],
  "disziplin": [
    "Den ersten Handgriff einer hilfreichen Gewohnheit ausprobieren.",
    "Eine sehr kleine Gewohnheit an einen vorhandenen Alltagsmoment knüpfen.",
    "Notieren, was eine Gewohnheit erleichtert oder erschwert.",
    "Nur einen möglichen Auslöser auswählen."
  ],
  "gemeinde": [
    "Überlegen, wo ich mich in einer Gemeinschaft sicher fühle.",
    "Wenn ich möchte, eine unverbindliche Gelegenheit zum Kennenlernen auswählen.",
    "Festhalten, was mir Gemeinschaft gibt und welche Grenzen ich brauche.",
    "Einen Wunsch an Gemeinschaft in einem Wort benennen."
  ],
  "sonstiges": [
    "Mein Anliegen in einem Satz benennen.",
    "Eine einzelne machbare Handlung für diese Woche auswählen.",
    "Aufschreiben, was ich zunächst verstehen möchte, bevor ich handle.",
    "Ein Wort für das finden, was mich beschäftigt."
  ]
};

const alternatives = {
  "angst": [
    "Eine Sorge mit einem kurzen Wort benennen.",
    "Für eine offene Frage eine verlässliche Information suchen.",
    "Notieren, was mir heute Sicherheit gibt."
  ],
  "streit": [
    "Eine Antwort erst als ungesendeten Entwurf schreiben.",
    "In einem sicheren Gespräch eine offene Frage statt eines Vorwurfs ausprobieren.",
    "Zwischen beobachteten Tatsachen und meinen Vermutungen unterscheiden."
  ],
  "einsam": [
    "Einen vertrauten Namen aufschreiben.",
    "Wenn ich möchte, einen öffentlichen Ort mit anderen Menschen kurz besuchen.",
    "Notieren, wann sich Alleinsein wohltuend und wann es sich schwer anfühlt."
  ],
  "entscheidung": [
    "Eine noch fehlende Information benennen.",
    "Einen kleinen umkehrbaren Versuch für eine mögliche Entscheidung planen.",
    "Aufschreiben, welche Werte bei meiner Entscheidung wichtig sind."
  ],
  "vergebung": [
    "Eine notwendige Grenze für mich benennen.",
    "Eine sichere Unterstützungsmöglichkeit für die Verarbeitung der Verletzung prüfen.",
    "Notieren, was ich heute noch nicht entscheiden muss."
  ],
  "zweifel": [
    "Eine unklare Aussage als Frage formulieren.",
    "Eine Frage zu einem vorhandenen Bibelabschnitt für später festhalten.",
    "Unterscheiden, was mein eigener Zweifel ist und welche Erwartungen andere an mich stellen."
  ],
  "ueberfordert": [
    "Eine Aufgabe für später notieren.",
    "Für eine konkrete Aufgabe um begrenzte Unterstützung bitten, wenn das sicher ist.",
    "Meine heutige Kraft und die erwarteten Aufgaben nebeneinander aufschreiben."
  ],
  "trauer": [
    "Eine Erinnerung mit einem Wort benennen.",
    "Eine kleine entlastende Alltagshilfe auswählen, die ich annehmen möchte.",
    "Festhalten, ob ich gerade Nähe, Ruhe oder praktische Hilfe brauche."
  ],
  "dankbar": [
    "Einen hilfreichen Alltagsmoment wahrnehmen.",
    "Einen kurzen Dank aufschreiben und selbst entscheiden, ob ich ihn weitergebe.",
    "Notieren, wie Dankbarkeit und eine weiterhin schwere Erfahrung nebeneinander Platz haben."
  ],
  "wut": [
    "Für einen Moment Abstand vom Bildschirm nehmen.",
    "Für eine angespannte Situation einen sicheren Rückzugsort überlegen.",
    "Eine körperliche Warnung bemerken, an der ich meine Wut früh erkenne."
  ],
  "familie": [
    "Einen eigenen Wunsch kurz notieren.",
    "Eine kleine gemeinsame Zeit nur dann vorschlagen, wenn sie für mich sicher und gewollt ist.",
    "Unterscheiden, was ich geben möchte und was meine Kräfte übersteigt."
  ],
  "hoffnung": [
    "Etwas benennen, das mir heute Halt gibt.",
    "Eine ermutigende Erinnerung an einem gut sichtbaren Ort für mich festhalten.",
    "Notieren, was ich trotz offener Zukunft für heute entscheiden kann."
  ],
  "versuchung": [
    "Einen schwierigen Auslöser notieren.",
    "Eine hilfreiche Alternative in Reichweite legen, bevor die schwierige Situation kommt.",
    "Festhalten, was eine gute Entscheidung zuletzt erleichtert hat."
  ],
  "arbeit": [
    "Den nächsten Handgriff auswählen.",
    "Eine Grenze für meine Erreichbarkeit für einen Tag ausprobieren.",
    "Notieren, welche Aufgaben zu meinen Stärken passen und welche Hilfe benötigen."
  ],
  "schuld": [
    "Eine eigene Handlung sachlich benennen.",
    "Eine verlässliche, sichere Ansprechmöglichkeit für eine belastende Schuldfrage prüfen.",
    "Zwischen einem konkreten Fehler und einem Urteil über meinen ganzen Wert unterscheiden."
  ],
  "selbstbeherrschung": [
    "Eine Reaktion zunächst nur bemerken.",
    "Bei einem wiederkehrenden Auslöser eine vorbereitete Pause ausprobieren.",
    "Festhalten, welche Rolle Müdigkeit oder Überlastung bei einer Reaktion hatten."
  ],
  "ruhe": [
    "Einen leisen Moment wahrnehmen.",
    "Eine kleine Ablenkung für eine vereinbarte kurze Zeit ausschalten.",
    "Aufschreiben, welche Art von Ruhe ich heute brauche."
  ],
  "geduld": [
    "Einen Moment des Wartens benennen.",
    "Eine Verzögerung in meinen Plan aufnehmen, statt jede Minute zu füllen.",
    "Notieren, welche Erwartung mich gerade unter Druck setzt."
  ]
};
export const STEP_KINDS = ['Ganz klein anfangen','Ein konkreter nächster Schritt','Erst einmal reflektieren'];
export const SENTENCE_STARTS = ['Ich möchte …','Wenn … passiert, dann möchte ich …','Diese Woche probiere ich …','Ein erster machbarer Schritt wäre …'];
const categoryTopics={vertrauen:'angst',beziehungen:'streit',geduld:'geduld',vergebung:'vergebung',dankbarkeit:'dankbar',glaube:'zweifel',hoffnung:'hoffnung',entscheidung:'entscheidung',berufung:'arbeit',ruhe:'ruhe'};
export function stepSuggestions({topic='',category='sonstiges',used=[]}={}) {
 const key=LIFE_TOPICS.some(t=>t.id===topic)?topic:categoryTopics[category]||category;
 const row=catalog[key]||catalog.sonstiges;
 const candidates=row.slice(0,3).map((text,i)=>{
  const choices=[text,alternatives[key]?.[i]].filter(Boolean).map(value=>'Mein kleiner Versuch: '+value);
  const value=choices.find(value=>!used.includes(value));
  return value?{id:key+'-'+i,kind:STEP_KINDS[i],text:value,smaller:'Ich möchte Folgendes ausprobieren: '+row[3]}:null;
 });
 return candidates.filter(Boolean);
}
export function topicsForCategory(category) {return LIFE_TOPICS.filter(t=>t.category===category);}
export function smallerStep({topic='',category='sonstiges'}={}) {return stepSuggestions({topic,category})[0].smaller;}
export function validateSuggestionCoverage() {
 return LIFE_TOPICS.every(t=>catalog[t.id]?.length===4)&&PATH_CATEGORIES.every(c=>(catalog[categoryTopics[c.id]||c.id]||[]).length===4);
}
