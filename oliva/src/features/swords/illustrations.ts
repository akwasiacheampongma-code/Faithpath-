import type { Reference } from "../bible/repository";
import { JOHN_LIGHT_LENGTH, JOHN_LIGHT_PATH } from "./layout";

/** Measured in the masters' shared 100 × 150 plane. Painted metal, foliage
 * and decorative inlays never encode chapter progress. */
export type SwordLightGeometry = {
  readonly path: string;
  readonly length: number;
  readonly clipPath: string;
  readonly tickX: number;
  readonly tickStartY: number;
  readonly tickWidth: number;
};

export type SwordIllustration = {
  readonly book: "JHN" | "ROM";
  readonly id: string;
  readonly motif: string;
  readonly explanation: string;
  readonly references: readonly {
    readonly label: string;
    readonly ref: Reference;
  }[];
  readonly light: SwordLightGeometry;
};

// Pure data: domain tests and book navigation never import React Native or
// PNG delivery modules. Original masters and prompts stay outside this graph.
export const SWORD_ILLUSTRATIONS: readonly SwordIllustration[] = [
  {
    book: "JHN",
    id: "john-life-pilot",
    motif: "Quelle und Weinstock",
    explanation:
      "Johannes erzählt von Jesus als Leben und als Quelle lebendigen Wassers. Das Bild vom Weinstock beschreibt Verbundenheit. Der zarte Trieb am Buchschwert nimmt dieses Bild auf – als künstlerisches Symbol für Leben und Verstehen.",
    references: [
      {
        label: "Johannes 1,4 lesen",
        ref: { book: "JHN", chapter: 1, from: 4, to: 4 },
      },
      {
        label: "Johannes 4,14 lesen",
        ref: { book: "JHN", chapter: 4, from: 14, to: 14 },
      },
      {
        label: "Johannes 15,1–5 lesen",
        ref: { book: "JHN", chapter: 15, from: 1, to: 5 },
      },
    ],
    light: {
      path: JOHN_LIGHT_PATH,
      length: JOHN_LIGHT_LENGTH,
      clipPath: "M49.6 4.6L50.8 9V49.7H48.4V9Z",
      tickX: 48.8,
      tickStartY: 49.5,
      tickWidth: 1.6,
    },
  },
  {
    book: "ROM",
    id: "romans-grace-pilot",
    motif: "Brücke und Olivenzweig",
    explanation:
      "Paulus spricht im Römerbrief von Gnade ohne Verdienst und von Frieden mit Gott durch Jesus Christus. Der ruhige Bogen erinnert als frei gestaltete Brücke an Verbindung; der Olivenzweig ist eine künstlerische Friedensdeutung. Diese Formen werden in den verlinkten Versen nicht beschrieben. Gnade ist kein Lohn für deine Aktivität.",
    references: [
      {
        label: "Römer 3,23–24 lesen",
        ref: { book: "ROM", chapter: 3, from: 23, to: 24 },
      },
      {
        label: "Römer 5,1 lesen",
        ref: { book: "ROM", chapter: 5, from: 1, to: 1 },
      },
      {
        label: "Römer 8,1 lesen",
        ref: { book: "ROM", chapter: 8, from: 1, to: 1 },
      },
    ],
    light: {
      path: "M50 94V6.5",
      length: 87.5,
      clipPath: "M50 4.7L51.2 9.2V94.4H48.8V9.2Z",
      tickX: 49.2,
      tickStartY: 94,
      tickWidth: 1.6,
    },
  },
];

export type IllustratedBook = SwordIllustration["book"];

const byBook = new Map(SWORD_ILLUSTRATIONS.map((item) => [item.book, item]));

export function swordIllustration(code: string): SwordIllustration | null {
  return byBook.get(code as IllustratedBook) ?? null;
}
