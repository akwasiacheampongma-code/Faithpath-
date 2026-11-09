import { Pressable, View } from "react-native";
import type { ReactNode } from "react";
import { T } from "../../../components/ui";
import { useTheme } from "../../../design-system/theme";
import { highlightBackground, type HighlightColor } from "../highlights";
import type { Reference, Verse } from "../repository";
import type { useReaderPosition } from "../useReaderPosition";

/** Preserve the tested block layout as an explicit choice and safe fallback. */
export function LegacyVerseText({
  reference,
  verses,
  selected,
  fontSize,
  lineHeight,
  highlights,
  bookmarks,
  position,
  onSelect,
  renderActions,
}: {
  reference: Reference;
  verses: Verse[];
  selected: number | null;
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
}) {
  const t = useTheme();
  return (
    <View testID="reader-single-verses" style={{ gap: 5 }}>
      {verses.map((verse) => {
        const key = `${reference.book}:${reference.chapter}:${verse.n}`;
        return (
          <View
            key={key}
            ref={(node) => position.verseRef(verse.n, node)}
            collapsable={false}
            onLayout={(event) => position.verseLayout(verse.n, event)}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Vers ${verse.n}: ${verse.text}`}
              accessibilityState={{ selected: selected === verse.n }}
              aria-pressed={selected === verse.n}
              onPress={() => onSelect(verse.n)}
              style={{
                paddingVertical: 5,
                paddingHorizontal: 8,
                marginHorizontal: -8,
                borderRadius: 8,
                backgroundColor:
                  selected === verse.n
                    ? t.soft
                    : highlightBackground(highlights[key], t.dark),
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
                {bookmarks.includes(key) ? " ◇" : ""}
              </T>
            </Pressable>
            {selected === verse.n ? renderActions(verse) : null}
          </View>
        );
      })}
    </View>
  );
}
