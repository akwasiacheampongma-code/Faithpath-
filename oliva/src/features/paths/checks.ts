import type { Reference } from "../bible/repository";
export type TextCheck = {
  id: string;
  ref: Reference;
  evidence: Reference;
  question: string;
  choices: { id: string; text: string }[];
  correct: string;
  explanation: string;
};
const q = (
  id: string,
  book: string,
  chapter: number,
  from: number,
  to: number,
  verse: number,
  question: string,
  a: string,
  b: string,
  c: string,
  explanation: string,
): TextCheck => ({
  id,
  ref: { book, chapter, from, to },
  evidence: { book, chapter, from: verse, to: verse },
  question,
  choices: [
    { id: "a", text: a },
    { id: "b", text: b },
    { id: "c", text: c },
  ],
  correct: "a",
  explanation,
});
export const TEXT_CHECKS: TextCheck[] = [
  q(
    "storm",
    "MRK",
    4,
    35,
    41,
    38,
    "Wie reagieren die Freunde im Sturm?",
    "Sie wecken Jesus und sprechen ihre Not an.",
    "Sie verlassen gemeinsam das Boot.",
    "Sie tun so, als gäbe es keinen Sturm.",
    "Markus erzählt, dass die Freunde Jesus aufwecken und ihm ihre Not sagen. Die Frage darf offen ausgesprochen werden.",
  ),
  q(
    "calling",
    "MRK",
    1,
    16,
    20,
    16,
    "Wo begegnet Jesus Simon und Andreas?",
    "Bei ihrer Arbeit am See.",
    "An einem Stadttor.",
    "Auf einem Bergweg.",
    "Die beiden werfen ihre Netze aus. Die Begegnung geschieht mitten in ihrer täglichen Arbeit.",
  ),
  q(
    "sheep",
    "LUK",
    15,
    1,
    7,
    5,
    "Worüber freut sich der Hirte im Gleichnis?",
    "Er hat das verlorene Schaf gefunden.",
    "Er hat seinen Stall vergrößert.",
    "Er hat ein besonders wertvolles Tier gekauft.",
    "Der Hirte trägt das gefundene Schaf mit Freude zurück. Jesus erzählt dieses Bild im Gespräch über Zuwendung und Umkehr.",
  ),
  q(
    "grace",
    "EPH",
    2,
    8,
    10,
    8,
    "Als was beschreibt der Brief die Rettung?",
    "Als Gottes Geschenk.",
    "Als Lohn für fehlerloses Verhalten.",
    "Als etwas, das nur sehr erfahrene Menschen erhalten.",
    "Der Brief nennt Gottes Gnade und Gottes Gabe. Gute Taten werden im folgenden Vers 10 als Teil des neuen Lebens beschrieben.",
  ),
  q(
    "beginning",
    "GEN",
    1,
    1,
    5,
    5,
    "Was nennt Gott in diesem Abschnitt Tag?",
    "Das Licht.",
    "Die Finsternis.",
    "Das Wasser.",
    "Genesis unterscheidet Licht und Finsternis: Das Licht wird Tag genannt, die Finsternis Nacht. Das ist eine Frage zum erzählten Text, keine Prüfung naturwissenschaftlicher Modelle.",
  ),
  q(
    "valley",
    "PSA",
    23,
    1,
    6,
    4,
    "Worauf setzt der Beter im finsteren Tal?",
    "Auf Gottes Nähe und Begleitung.",
    "Darauf, niemals Schwierigkeiten zu erleben.",
    "Darauf, sich Gottes Begleitung erst verdienen zu müssen.",
    "Das Gedicht spricht auch vom finsteren Tal. Sein Trost ist die angesprochene Nähe Gottes; schwierige Erfahrungen werden nicht geleugnet.",
  ),
  q(
    "prayer",
    "MAT",
    6,
    5,
    13,
    5,
    "Was kritisiert Jesus hier beim Beten?",
    "Beten, um sich vor anderen zur Schau zu stellen.",
    "Dass jemand nur wenige Worte findet.",
    "Die Bitte um das tägliche Brot.",
    "Jesus kritisiert das Beten für die Anerkennung durch andere. Wenige ehrliche Worte und konkrete Bitten bekommen in der folgenden Lehre Raum.",
  ),
  q(
    "peace",
    "JHN",
    14,
    25,
    27,
    27,
    "Was sagt Jesus seinen Freunden zu?",
    "Seinen Frieden.",
    "Ein Leben ohne Abschiede.",
    "Reichtum als Beweis ihres Glaubens.",
    "In einer Abschiedssituation spricht Jesus von seinem Frieden. Der Text setzt Frieden nicht mit einem problemlosen Leben gleich.",
  ),
  q(
    "forgiveness",
    "COL",
    3,
    12,
    15,
    13,
    "Welche Haltung wird den Angesprochenen ans Herz gelegt?",
    "Einander zu ertragen und zu vergeben.",
    "Sich anderen überlegen zu zeigen.",
    "Verletzungen grundsätzlich zu verschweigen.",
    "Der Brief verbindet das Miteinander mit Mitgefühl, Geduld und Vergebung. Er beantwortet damit nicht jede Frage nach Schutz, Grenzen oder dem Umgang mit Gewalt.",
  ),
];
export function checkFor(ref: Reference) {
  return TEXT_CHECKS.find(
    (q) =>
      q.ref.book === ref.book &&
      q.ref.chapter === ref.chapter &&
      q.ref.from === ref.from &&
      q.ref.to === ref.to,
  );
}
