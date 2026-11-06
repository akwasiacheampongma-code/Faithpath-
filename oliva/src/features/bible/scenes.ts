import type { Reference } from "./repository";
export type Scene = {
  id: "noah" | "abraham" | "nativity" | "easter-dawn";
  ref: Reference;
  title: string;
  intro: string;
  summary: string;
  minutes: number;
  action: string;
  interpretation: string;
  word: [string, string];
};
export const SCENES: Scene[] = [
  {
    id: "noah",
    ref: { book: "GEN", chapter: 8, from: 6, to: 12 },
    title: "Ein Blatt und ein neuer Anfang.",
    intro:
      "Noah wartet auf trockenes Land. Eine Taube bringt ein kleines Zeichen dafür, dass sich etwas verändert.",
    summary:
      "Die Erzählung beschreibt das lange Warten nach der Flut. Noah lässt Vögel ausfliegen. Eine Taube kommt zunächst zurück, weil sie keinen Ruheplatz findet. Später bringt sie ein frisches Olivenblatt. Noah wartet erneut. Der Neuanfang geschieht in kleinen Schritten. Bauform und Lage der Arche lassen sich aus diesem Bild nicht historisch belegen.",
    minutes: 3,
    action: "Mit Noah weiterlesen",
    interpretation:
      "Arche, Landschaft und Olivenzweig sind frei gestaltet. Keine Rekonstruktion eines nachgewiesenen Fundorts.",
    word: [
      "Arche",
      "Das große Schiff in der Noah-Erzählung. Das Bild ist eine freie Gestaltung und kein archäologischer Fundbeleg.",
    ],
  },
  {
    id: "abraham",
    ref: { book: "GEN", chapter: 15, from: 1, to: 6 },
    title: "Unter einem weiten Himmel.",
    intro:
      "Abram spricht seine offene Frage aus. Unter den Sternen hört er von einer Zukunft, die er noch nicht sehen kann.",
    summary:
      "Abram, der später Abraham heißt, fragt nach seiner Zukunft und seiner Nachkommenschaft. Die Erzählung lässt seine Sorge zu Wort kommen. Der Blick in den Sternenhimmel wird zum Bild für Gottes Versprechen. Der Abschnitt beschreibt Abrams Vertrauen. Die Verheißung richtet sich im Text an ihn; sie ist keine pauschale Vorhersage heutiger Lebensläufe.",
    minutes: 3,
    action: "Abrahams Geschichte lesen",
    interpretation:
      "Person, Zelt, Kleidung, Landschaft und Sternenhimmel sind frei gestaltet. Kein historisches Porträt.",
    word: [
      "Verheißung",
      "Ein Versprechen Gottes, von dem die Bibel erzählt. Bei einer Einordnung ist wichtig, wem es im jeweiligen Text gilt.",
    ],
  },
  {
    id: "nativity",
    ref: { book: "LUK", chapter: 2, from: 1, to: 20 },
    title: "Ein kleiner Anfang in Bethlehem.",
    intro:
      "Ein Kind in einer Krippe. Hirten hören eine unerwartete Nachricht und machen sich auf den Weg.",
    summary:
      "Lukas erzählt von Jesu Geburt in Bethlehem. Maria wickelt das Kind und legt es in eine Krippe, weil in der Unterkunft kein Platz ist. Eine Engelsbotschaft führt Hirten zu dem Kind. Sie erzählen von dem Gehörten; Maria bewahrt die Worte und denkt darüber nach. Das Bild ergänzt weder Sterndeuter noch einen leitenden Stern aus dem Matthäusbericht. Die genaue Raumgestalt und der Geburtstag werden damit nicht belegt.",
    minutes: 5,
    action: "Die Geburtsgeschichte lesen",
    interpretation:
      "Raum, Gesichter, Kleidung und Anzahl der Hirten sind künstlerische Interpretation; keine Rekonstruktion der Geburt.",
    word: [
      "Krippe",
      "Ein Futtertrog für Tiere. Lukas erzählt, dass Jesus als Neugeborener darin liegt. Ein genauer Grundriss der Unterkunft wird nicht beschrieben.",
    ],
  },
  {
    id: "easter-dawn",
    ref: { book: "MRK", chapter: 16, from: 1, to: 8 },
    title: "Ein Morgen voller Fragen.",
    intro:
      "Drei Frauen machen sich auf den Weg. Am Grab erwartet sie eine Nachricht, mit der sie nicht gerechnet haben.",
    summary:
      "Drei Frauen gehen am frühen Morgen zum Grab Jesu. Markus erzählt, dass der große Stein bereits weggewälzt ist. Im Grab hören sie von einem jungen Mann: Jesus ist auferstanden und nicht hier. Sie bekommen einen Auftrag für die Jünger. Der Abschnitt endet mit ihrem Erschrecken und ihrer Furcht. Die unerwartete Botschaft und die offenen Reaktionen stehen nebeneinander.",
    minutes: 4,
    action: "Die Ostergeschichte entdecken",
    interpretation:
      "Felsgrab, Landschaft und Kleidung sind frei gestaltet. Kein nachgewiesener Ort oder historisches Porträt.",
    word: [
      "Auferstehung",
      "Im christlichen Glauben bedeutet das: Jesu Tod hat nicht das letzte Wort; Gott schenkt ihm neues Leben. Die Evangelien erzählen von dieser Hoffnung in unterschiedlichen Osterberichten.",
    ],
  },
];
export function sceneFor(ref: Reference) {
  return SCENES.find(
    (s) =>
      s.ref.book === ref.book &&
      s.ref.chapter === ref.chapter &&
      (!ref.from || ref.from <= s.ref.to!) &&
      (!ref.to || ref.to >= s.ref.from!),
  );
}
