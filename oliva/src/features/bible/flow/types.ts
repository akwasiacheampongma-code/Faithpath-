import type { ComponentRef, ReactNode } from "react";
import type { View } from "react-native";
import type { Verse } from "../repository";
import type { VerseFrame } from "../position";
import type { HighlightColor } from "../highlights";
import type { FlowParagraph } from "./model";

export type FlowTextHandle = {
  /** Actual line fragments relative to the reader list, never guessed widths. */
  measure: (
    relativeTo: ComponentRef<typeof View>,
  ) => Promise<VerseFrame[] | null>;
  focusVerse: (verse: number) => void;
};
export type FlowTextProps = {
  paragraphs: FlowParagraph[];
  /** The sole inline action anchor; retained for the single-verse reader. */
  selected: number | null;
  /** When supplied, controls selection styling independently of inline actions. */
  selectedVerses?: readonly number[];
  /** Logical passage focus within the displayed chapter; never changes text. */
  focusRange?: Readonly<{ from: number; to: number }>;
  highlights: Record<string, HighlightColor>;
  bookmarks: readonly string[];
  /** Actual rendered size, including the existing reader's +3 adjustment. */
  fontSize: number;
  fontFamily?: "Cormorant" | "DMSans";
  lineHeight: number;
  layoutKey: string;
  onSelect: (verse: number) => void;
  onGeometryChange: () => void;
  onUnavailable: () => void;
  renderActions: (verse: Verse) => ReactNode;
};
