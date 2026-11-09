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
  selected: number | null;
  highlights: Record<string, HighlightColor>;
  bookmarks: readonly string[];
  /** Actual rendered size, including the existing reader's +3 adjustment. */
  fontSize: number;
  lineHeight: number;
  layoutKey: string;
  onSelect: (verse: number) => void;
  onGeometryChange: () => void;
  onUnavailable: () => void;
  renderActions: (verse: Verse) => ReactNode;
};
