import { Pressable, View } from "react-native";
import {
  forwardRef,
  useImperativeHandle,
  useRef,
  type ComponentRef,
  type ReactNode,
} from "react";
import { T } from "../../../components/ui";
import { useTheme } from "../../../design-system/theme";
import { highlightBackground, type HighlightColor } from "../highlights";
import type { Reference, Verse } from "../repository";
import type { useReaderPosition } from "../useReaderPosition";
import { focusReaderControl } from "./focus";
import type { FlowTextHandle, FlowTextProps } from "./types";

type LegacyVerseTextProps = {
  reference: Reference;
  verses: Verse[];
  selected: number | null;
  selectedVerses?: FlowTextProps["selectedVerses"];
  focusRange?: FlowTextProps["focusRange"];
  fontSize: number;
  lineHeight: number;
  highlights: Record<string, HighlightColor>;
  bookmarks: readonly string[];
  position: Pick<
    ReturnType<typeof useReaderPosition>,
    "verseRef" | "verseLayout"
  >;
  onSelect: (verse: number) => void;
  renderActions: (verse: Verse) => ReactNode;
};

/** Preserve the tested block layout as an explicit choice and safe fallback. */
export const LegacyVerseText = forwardRef<FlowTextHandle, LegacyVerseTextProps>(
  function LegacyVerseText(
    {
      reference,
      verses,
      selected,
      selectedVerses,
      focusRange,
      fontSize,
      lineHeight,
      highlights,
      bookmarks,
      position,
      onSelect,
      renderActions,
    },
    ref,
  ) {
    const t = useTheme(),
      verseNodes = useRef(new Map<number, ComponentRef<typeof Pressable>>());
    useImperativeHandle(ref, () => ({
      // Legacy geometry remains owned by the measured block-position hook.
      measure: async () => null,
      focusVerse: (verse) => focusReaderControl(verseNodes.current.get(verse)),
    }), []);
    return (
      <View testID="reader-single-verses" style={{ gap: 5 }}>
        {verses.map((verse) => {
          const key = `${reference.book}:${reference.chapter}:${verse.n}`,
            color = highlights[key],
            marked = bookmarks.includes(key),
            isSelected = selectedVerses
              ? selectedVerses.includes(verse.n)
              : selected === verse.n,
            isFocused =
              !!focusRange &&
              verse.n >= focusRange.from &&
              verse.n <= focusRange.to;
          return (
            <View
              key={key}
              ref={(node) => position.verseRef(verse.n, node)}
              collapsable={false}
              onLayout={(event) => position.verseLayout(verse.n, event)}
            >
              <Pressable
                ref={(node) => {
                  if (node) verseNodes.current.set(verse.n, node);
                  else verseNodes.current.delete(verse.n);
                }}
                accessibilityRole="button"
                accessibilityLabel={`Vers ${verse.n}: ${verse.text}${marked ? " · gemerkt" : ""}${color ? " · markiert" : ""}${isFocused ? " · im Fokus" : ""}`}
                accessibilityState={{ selected: isSelected }}
                aria-pressed={isSelected}
                onPress={() => onSelect(verse.n)}
                style={{
                  paddingVertical: 5,
                  paddingHorizontal: 8,
                  marginHorizontal: -8,
                  borderRadius: 8,
                  backgroundColor:
                    isSelected
                      ? t.soft
                      : color
                        ? highlightBackground(color, t.dark)
                        : isFocused
                          ? t.dark
                            ? "#293b43"
                            : "#e8edf0"
                          : "transparent",
                }}
              >
                <T
                  style={{
                    fontFamily: "Cormorant",
                    fontSize,
                    lineHeight: fontSize * lineHeight,
                  }}
                >
                  <T
                    style={{
                      fontFamily: "DMSans",
                      color: t.gold,
                      fontSize: 10,
                      lineHeight: 20,
                    }}
                  >
                    {verse.n}　
                  </T>
                  {verse.text}
                  {marked ? " ◇" : ""}
                </T>
              </Pressable>
              {selected === verse.n ? renderActions(verse) : null}
            </View>
          );
        })}
      </View>
    );
  },
);
