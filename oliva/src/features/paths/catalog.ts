import type { Reference } from "../bible/repository";
export type PathStep = {
  title: string;
  ref: Reference;
  explanation: string;
  question: string;
  prayer: string;
  word?: [string, string];
};
export type LearningPath = {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  minutes: number;
  intro: string;
  goals: string[];
  steps: PathStep[];
  art: "galilee" | "storm" | "garden";
};
const step = (
  title: string,
  book: string,
  chapter: number,
  from: number,
  to: number,
  explanation: string,
  question: string,
  prayer: string,
  word?: [string, string],
): PathStep => ({
  title,
  ref: { book, chapter, from, to },
  explanation,
  question,
  prayer,
  word,
});
const storm = step(
  "Wenn der Sturm still wird",
  "MRK",
  4,
  35,
  41,
  "Jesus und seine Freunde geraten auf dem See in einen Sturm. Die Freunde haben Angst und sprechen sie offen aus. Markus erzählt, wie Jesus den Wind stillt. Am Ende bleibt ihre Frage: Wer ist dieser Jesus? Der Text lädt zum Vertrauen ein. Er verspricht nicht, dass glaubende Menschen von Krisen verschont bleiben.",
  "Was bewegt dich an der Frage: „Kümmert es dich nicht?“",
  "Gott, ich komme mit meinen Fragen und meiner Unruhe zu dir. Hilf mir, heute einen Moment Vertrauen zu finden. Amen.",
  ["Jünger", "Menschen, die mit Jesus unterwegs sind und von ihm lernen."],
);
const sheep = step(
  "Du wirst gesucht",
  "LUK",
  15,
  1,
  7,
  "Jesus erzählt eine kurze Geschichte: Ein Hirte sucht ein verlorenes Schaf. Anlass ist die Kritik daran, dass Jesus mit Menschen isst, die als Sünder gelten. Das Bild betont Gottes Zuwendung und Freude über Umkehr. Es ist keine Anleitung für Schafhaltung, sondern ein Gleichnis.",
  "Wie fühlt sich der Gedanke an, gesucht statt abgeschrieben zu werden?",
  "Gott, danke, dass Menschen bei dir nicht verloren gehen sollen. Öffne meinen Blick für jemanden, der heute Zuwendung braucht. Amen.",
  [
    "Gleichnis",
    "Eine anschauliche Geschichte, die zum Nachdenken über Gott und das Leben einlädt.",
  ],
);
const calling = step(
  "Eine Einladung zum Mitgehen",
  "MRK",
  1,
  16,
  20,
  "Jesus begegnet Fischern mitten bei der Arbeit und ruft sie in seine Nachfolge. „Menschenfischer“ ist ein Bild für ihre spätere Aufgabe, Menschen für Gottes gute Nachricht zu gewinnen. Es bedeutet keine Kontrolle über andere. Der knappe Text erzählt einen Anfang; er beschreibt nicht jedes Detail der Entscheidung.",
  "Welche kleine Einladung zum Guten könntest du heute wahrnehmen?",
  "Jesus, hilf mir, deine Einladung im Alltag zu entdecken und meinen nächsten Schritt frei und ehrlich zu wählen. Amen.",
  [
    "Nachfolge",
    "Von Jesus lernen und das eigene Leben an seinem Beispiel ausrichten.",
  ],
);
const grace = step(
  "Ein Geschenk, kein Verdienst",
  "EPH",
  2,
  8,
  10,
  "Der Brief beschreibt Rettung als Geschenk Gottes. Gute Werke kaufen Gottes Zuwendung nicht. Sie sind eine mögliche Antwort auf empfangene Gnade. Christliche Traditionen erklären das Verhältnis von Glaube, Gnade und Werken unterschiedlich; gemeinsam ist ihnen die zentrale Bedeutung von Gottes Initiative.",
  "Was ändert sich, wenn Zuwendung nicht erst verdient werden muss?",
  "Gott, lass mich deine Güte als Geschenk annehmen und mit anderen großzügig umgehen. Amen.",
  ["Gnade", "Unverdiente Zuwendung und Güte Gottes."],
);
const prayer = step(
  "Beten mit einfachen Worten",
  "MAT",
  6,
  5,
  13,
  "In der Bergpredigt stellt Jesus das Gebet als ehrliche Hinwendung zum Vater vor. Es ist keine Vorführung. Das Vaterunser verbindet die Bitte um Gottes Reich mit alltäglichem Brot, Vergebung und Schutz. Manche Kirchen beten einen zusätzlichen Lobpreis am Ende; Übersetzungen und Gottesdienstformen unterscheiden sich.",
  "Welche dieser Bitten passt heute zu deinem Leben?",
  "Gott, ich muss vor dir nichts vorspielen. Hier bin ich mit dem, was ich brauche. Amen.",
  ["Vaterunser", "Das Gebet, das Jesus seinen Jüngern als Beispiel gibt."],
);
const forgiveness = step(
  "Ein neuer Anfang miteinander",
  "COL",
  3,
  12,
  15,
  "Der Brief ermutigt zu Mitgefühl, Geduld und Vergebung innerhalb der Gemeinschaft. Vergebung bedeutet nicht, Unrecht gutzuheißen oder sich weiter verletzen zu lassen. Grenzen, Schutz und gerechte Verantwortung bleiben wichtig. Der Friede Christi ist ein Bild für ein versöhntes Miteinander.",
  "Wo könnte ein sicherer kleiner Schritt zu mehr Frieden möglich sein?",
  "Gott, schenke mir Weisheit für Grenzen und Offenheit für einen heilsamen Neuanfang. Amen.",
  ["Erbarmen", "Mitgefühl, das die Not eines anderen Menschen ernst nimmt."],
);
const psalm = step(
  "Worte für dunkle Täler",
  "PSA",
  23,
  1,
  6,
  "Ein betender Mensch beschreibt Gott mit dem Bild eines Hirten. Auch das dunkle Tal gehört zu diesem Psalm. Trost entsteht nicht daraus, dass Schwierigkeiten geleugnet werden, sondern aus dem Vertrauen, begleitet zu sein. Die Bilder sind poetische Gebetssprache.",
  "Welches Bild dieses Psalms möchtest du heute mitnehmen?",
  "Gott, begleite mich auch dort, wo ich den Weg nicht klar sehe. Amen.",
  ["Psalm", "Ein poetisches Lied oder Gebet aus der Bibel."],
);
const creation = step(
  "Am Anfang steht das Leben",
  "GEN",
  1,
  1,
  5,
  "Die Bibel beginnt mit Gottes schöpferischem Handeln und dem Licht. Dieser alte Text bezeugt, dass die Welt ihren Ursprung in Gott hat. Christinnen und Christen verstehen die Schöpfungstage unterschiedlich, etwa als poetische Ordnung oder als zeitliche Abfolge. Der Text ist kein moderner naturwissenschaftlicher Bericht.",
  "Was möchtest du heute bewusst als Geschenk wahrnehmen?",
  "Gott, öffne meine Augen für das Leben, das mich umgibt. Amen.",
  [
    "Genesis",
    "Griechisch für Ursprung oder Anfang; der Name des ersten Buches der Bibel.",
  ],
);
const peace = step(
  "Frieden, der Raum schafft",
  "JHN",
  14,
  25,
  27,
  "Jesus spricht in diesen Abschiedsreden zu seinen Freunden. Er verspricht den Heiligen Geist und spricht ihnen Frieden zu. Der Text richtet sich in eine bevorstehende Trennung hinein. Frieden ist hier mehr als eine ruhige Stimmung; er hängt mit Jesu bleibender Zuwendung zusammen.",
  "Was würde dir heute helfen, einen Moment ruhig zu werden?",
  "Gott, lass deinen Frieden in meiner Unruhe Raum finden. Amen.",
  ["Heiliger Geist", "Christliche Bezeichnung für Gottes wirksame Gegenwart."],
);

export const PATHS: LearningPath[] = [
  {
    id: "jesus",
    title: "Wer ist Jesus?",
    subtitle: "Begegne dem Menschen, der Hoffnung schenkt.",
    category: "Für deinen Anfang",
    minutes: 15,
    intro:
      "Drei kurze Begegnungen aus dem Leben Jesu. Du brauchst kein Vorwissen und darfst alle deine Fragen mitbringen.",
    goals: [
      "Jesus in einer konkreten Geschichte begegnen",
      "Biblische Bilder besser verstehen",
      "Einen Gedanken in deinen Alltag mitnehmen",
    ],
    steps: [storm, calling, sheep],
    art: "storm",
  },
  {
    id: "anfang",
    title: "Ich bin neu im Glauben",
    subtitle: "Ein Anfang darf ganz klein sein.",
    category: "Für deinen Anfang",
    minutes: 15,
    intro:
      "Du musst nicht alles wissen oder schon etwas Bestimmtes glauben. Diese Reise beginnt mit Zuwendung, Fragen und einer Einladung.",
    goals: [
      "Gottes Zuwendung kennenlernen",
      "Vertrauen von Leistung unterscheiden",
      "Einen eigenen Anfang finden",
    ],
    steps: [sheep, grace, calling],
    art: "galilee",
  },
  {
    id: "bibel",
    title: "Wie lese ich die Bibel?",
    subtitle: "Eine Bibliothek voller Geschichten entdecken.",
    category: "Bibel verstehen",
    minutes: 15,
    intro:
      "Die Bibel ist eine Sammlung verschiedener Bücher. Wir begegnen einer Erzählung, einem Gedicht und einer Beispielgeschichte.",
    goals: [
      "Drei Textarten unterscheiden",
      "Den Zusammenhang beachten",
      "Offene Fragen wahrnehmen",
    ],
    steps: [creation, psalm, sheep],
    art: "garden",
  },
  {
    id: "beten",
    title: "Wie kann ich beten?",
    subtitle: "Du brauchst keine perfekten Worte.",
    category: "Glaube im Alltag",
    minutes: 15,
    intro:
      "Beten kann mit einem ehrlichen Satz beginnen. Entdecke Jesu Beispiel und alte Worte, die auch heute tragen können.",
    goals: [
      "Das Vaterunser kennenlernen",
      "Einen Psalm als Gebet entdecken",
      "Eigene Worte ausprobieren",
    ],
    steps: [prayer, psalm, peace],
    art: "galilee",
  },
  {
    id: "gnade",
    title: "Was bedeutet Gnade?",
    subtitle: "Geliebt, bevor du etwas leistest.",
    category: "Bibel verstehen",
    minutes: 15,
    intro:
      "Gnade ist ein Wort für Gottes geschenkte Zuwendung. Drei Texte helfen, diese Idee zu verstehen.",
    goals: [
      "Gnade in einfachen Worten erklären",
      "Geschenk und Leistung unterscheiden",
      "Großzügigkeit im Alltag entdecken",
    ],
    steps: [grace, sheep, forgiveness],
    art: "garden",
  },
  {
    id: "hoffnung",
    title: "Hoffnung in schweren Zeiten",
    subtitle: "Du musst nicht alles allein tragen.",
    category: "Für deine Lebenssituation",
    minutes: 15,
    intro:
      "Diese Texte geben Raum für Angst und offene Fragen. Sie ersetzen keine menschliche oder professionelle Unterstützung.",
    goals: [
      "Angst ehrlich benennen",
      "Bilder der Begleitung entdecken",
      "Einen hilfreichen Gedanken bewahren",
    ],
    steps: [storm, psalm, peace],
    art: "storm",
  },
  {
    id: "vergebung",
    title: "Vergebung verstehen",
    subtitle: "Raum für einen sicheren Neuanfang.",
    category: "Glaube im Alltag",
    minutes: 15,
    intro:
      "Vergebung ist vielschichtig. Wir lesen von Gottes Güte und einem Miteinander, das Mitgefühl und Verantwortung verbindet.",
    goals: [
      "Vergebung und Verharmlosung unterscheiden",
      "Geduld und Grenzen zusammendenken",
      "Eine freiwillige Anwendung erwägen",
    ],
    steps: [forgiveness, sheep, prayer],
    art: "garden",
  },
  {
    id: "frieden",
    title: "Frieden finden",
    subtitle: "Ein stiller Moment mitten im Leben.",
    category: "Für deine Lebenssituation",
    minutes: 15,
    intro:
      "Entdecke drei biblische Perspektiven auf Frieden. Du darfst in deinem Tempo lesen, innehalten und auch widersprechen.",
    goals: [
      "Frieden als Beziehungswort verstehen",
      "Eigene Unruhe wahrnehmen",
      "Ein Gebet ausprobieren",
    ],
    steps: [peace, storm, psalm],
    art: "galilee",
  },
  {
    id: "geschichte",
    title: "Die Geschichte der Bibel",
    subtitle: "Vom Anfang zu einer neuen Hoffnung.",
    category: "Bibel verstehen",
    minutes: 15,
    intro:
      "Ein erster Ausschnitt aus der großen Geschichte: Schöpfung, Jesu Einladung und Gottes geschenkte Zuwendung. Dies ist ein Einstieg, kein vollständiger Bibelüberblick.",
    goals: [
      "Einen Anfang der biblischen Geschichte kennenlernen",
      "Jesu Einladung einordnen",
      "Ein zentrales Briefthema entdecken",
    ],
    steps: [creation, calling, grace],
    art: "garden",
  },
];
export const pathById = (id: string) => PATHS.find((path) => path.id === id);
