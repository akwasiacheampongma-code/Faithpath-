import {
  forwardRef,
  Fragment,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  type ComponentRef,
} from "react";
import { AppState, Text, View } from "react-native";
import { useTheme } from "../../../design-system/theme";
import { highlightBackground } from "../highlights";
import { measureFlowLines, type FlowLineMeasurement } from "./model";
import type { VerseFrame } from "../position";
import type { FlowTextHandle, FlowTextProps } from "./types";

type ParagraphNode = ComponentRef<typeof View>;
type CachedLines = { generation: number; measurement: FlowLineMeasurement };

/** Native Text supplies the line text and coordinates. If that contract cannot
 * be mapped exactly, retain the existing measured verse reader instead of
 * guessing character widths or calling an entire paragraph a verse anchor.
 * This adapter has not been verified on a physical device or simulator. */
const FlowText = forwardRef<FlowTextHandle, FlowTextProps>(function FlowText(
  {
    paragraphs,
    selected,
    highlights,
    bookmarks,
    fontSize,
    lineHeight,
    layoutKey,
    onSelect,
    onGeometryChange,
    onUnavailable,
    renderActions,
  },
  ref,
) {
  const t = useTheme(),
    paragraphNodes = useRef(new Map<string, ParagraphNode>()),
    verseNodes = useRef(new Map<number, ComponentRef<typeof Text>>()),
    lines = useRef(new Map<string, CachedLines>()),
    pending = useRef(new Set<() => void>()),
    lineDeadline = useRef<ReturnType<typeof setTimeout> | null>(null),
    lineWaitGeneration = useRef<number | null>(null),
    mounted = useRef(false),
    unavailableGeneration = useRef<number | null>(null),
    callbacks = useRef({ onGeometryChange, onUnavailable }),
    current = useRef({ layoutKey, paragraphs, generation: 0 });
  callbacks.current = { onGeometryChange, onUnavailable };
  if (
    current.current.layoutKey !== layoutKey ||
    current.current.paragraphs !== paragraphs
  ) {
    current.current = {
      layoutKey,
      paragraphs,
      generation: current.current.generation + 1,
    };
    lines.current.clear();
  }
  const generation = current.current.generation;

  function stopLineDeadline() {
    if (lineDeadline.current) clearTimeout(lineDeadline.current);
    lineDeadline.current = null;
  }

  function unavailable(expected: number) {
    if (
      !mounted.current ||
      current.current.generation !== expected ||
      AppState.currentState === "background" ||
      AppState.currentState === "inactive" ||
      unavailableGeneration.current === expected
    )
      return;
    stopLineDeadline();
    unavailableGeneration.current = expected;
    callbacks.current.onUnavailable();
  }

  function waitForInitialLines(expected: number) {
    if (
      lineWaitGeneration.current === expected ||
      unavailableGeneration.current === expected ||
      AppState.currentState === "background" ||
      AppState.currentState === "inactive"
    )
      return;
    stopLineDeadline();
    lineWaitGeneration.current = expected;
    // Started only by a real measure request after all paragraph Views exist.
    // Give initial native text layout time to arrive, but never leave the old
    // verse-position contract indefinitely unconfirmed if no event is emitted.
    const deadline: ReturnType<typeof setTimeout> = setTimeout(() => {
      if (lineDeadline.current !== deadline) return;
      lineDeadline.current = null;
      if (!mounted.current || current.current.generation !== expected) return;
      if (
        AppState.currentState === "background" ||
        AppState.currentState === "inactive"
      ) {
        lineWaitGeneration.current = null;
        return;
      }
      const complete = current.current.paragraphs.every(
        (paragraph) =>
          lines.current.get(paragraph.key)?.generation === expected,
      );
      if (!complete) unavailable(expected);
    }, 500);
    lineDeadline.current = deadline;
  }

  function measureParagraph(
    node: ParagraphNode,
    relativeTo: ParagraphNode,
    expected: number,
  ) {
    return new Promise<{ y: number; height: number } | null>((resolve) => {
      let done = false,
        timer: ReturnType<typeof setTimeout> | null = null;
      function settle(
        frame: { y: number; height: number } | null,
        failed = false,
      ) {
        if (done) return;
        done = true;
        if (timer) clearTimeout(timer);
        pending.current.delete(cancel);
        if (failed) unavailable(expected);
        resolve(frame);
      }
      const cancel = () => settle(null);
      timer = setTimeout(() => settle(null, true), 350);
      pending.current.add(cancel);
      try {
        node.measureLayout(
          relativeTo,
          (_x, y, _width, height) => {
            if (!mounted.current || current.current.generation !== expected) {
              settle(null);
              return;
            }
            if (!Number.isFinite(y) || !Number.isFinite(height) || height < 0)
              settle(null, true);
            // A zero-height mount is not yet a failed native measurement.
            else settle(height > 0 ? { y, height } : null);
          },
          () => settle(null, true),
        );
      } catch {
        settle(null, true);
      }
    });
  }

  useImperativeHandle(
    ref,
    () => ({
      measure: async (relativeTo) => {
        const expected = current.current.generation;
        if (
          !mounted.current ||
          !relativeTo ||
          AppState.currentState === "background" ||
          AppState.currentState === "inactive"
        )
          return null;
        const entries = paragraphs.map((paragraph) => ({
          key: paragraph.key,
          node: paragraphNodes.current.get(paragraph.key),
          cached: lines.current.get(paragraph.key),
        }));
        // Initial onTextLayout events may still be pending. Return no guessed
        // fragments and let the actual event request the next coherent read.
        if (
          entries.some(
            ({ node, cached }) =>
              !node || !cached || cached.generation !== expected,
          )
        ) {
          if (entries.every(({ node }) => !!node))
            waitForInitialLines(expected);
          return null;
        }
        stopLineDeadline();
        const origins = await Promise.all(
          entries.map(({ node }) =>
            measureParagraph(node!, relativeTo, expected),
          ),
        );
        if (
          !mounted.current ||
          expected !== current.current.generation ||
          AppState.currentState === "background" ||
          AppState.currentState === "inactive" ||
          origins.some((origin) => !origin) ||
          entries.some(
            ({ key, node, cached }) =>
              paragraphNodes.current.get(key) !== node ||
              lines.current.get(key) !== cached,
          )
        )
          return null;
        const fragments: VerseFrame[] = [];
        entries.forEach(({ cached }, index) => {
          const origin = origins[index]!;
          for (const fragment of cached!.measurement.fragments)
            fragments.push({
              verse: fragment.verse,
              y: origin.y + fragment.y,
              height: fragment.height,
            });
        });
        return fragments;
      },
      focusVerse: (verse) => {
        const node = verseNodes.current.get(verse);
        if (typeof node?.focus === "function") node.focus();
      },
    }),
    [paragraphs, layoutKey],
  );

  useLayoutEffect(() => {
    mounted.current = true;
    callbacks.current.onGeometryChange();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active") {
        stopLineDeadline();
        lineWaitGeneration.current = null;
        for (const cancel of [...pending.current]) cancel();
      } else callbacks.current.onGeometryChange();
    });
    return () => {
      mounted.current = false;
      subscription.remove();
      stopLineDeadline();
      lineWaitGeneration.current = null;
      for (const cancel of [...pending.current]) cancel();
      pending.current.clear();
    };
  }, [layoutKey, paragraphs]);

  return (
    <View testID="reader-flow" style={{ width: "100%", minWidth: 0 }}>
      {paragraphs.map((paragraph) => {
        const active = paragraph.verses.find((verse) => verse.n === selected);
        return (
          <View
            key={paragraph.key}
            testID={`flow-paragraph-${paragraph.verses[0]!.n}`}
            collapsable={false}
            ref={(node) => {
              if (node) paragraphNodes.current.set(paragraph.key, node);
              else paragraphNodes.current.delete(paragraph.key);
            }}
            onLayout={() => {
              if (mounted.current && current.current.generation === generation)
                callbacks.current.onGeometryChange();
            }}
            style={{ width: "100%" }}
          >
            <Text
              // A new layout generation must receive fresh native line events,
              // including when only an adjacent action panel was changed.
              key={`${paragraph.key}:${generation}`}
              accessible={false}
              onTextLayout={(event) => {
                if (
                  !mounted.current ||
                  current.current.generation !== generation
                )
                  return;
                const measurement = measureFlowLines(
                  paragraph,
                  event.nativeEvent.lines,
                );
                if (!measurement) {
                  lines.current.delete(paragraph.key);
                  unavailable(generation);
                  return;
                }
                lines.current.set(paragraph.key, { generation, measurement });
                if (
                  current.current.paragraphs.every(
                    (item) =>
                      lines.current.get(item.key)?.generation === generation,
                  )
                )
                  stopLineDeadline();
                callbacks.current.onGeometryChange();
              }}
              style={{
                marginBottom: 26,
                fontFamily: "Cormorant",
                fontSize,
                lineHeight: fontSize * lineHeight,
                color: t.text,
              }}
            >
              {paragraph.verses.map((verse, index) => {
                const color = highlights[verse.key],
                  marked = bookmarks.includes(verse.key);
                return (
                  <Fragment key={verse.key}>
                    {index > 0 ? " " : null}
                    <Text
                      ref={(node) => {
                        if (node) verseNodes.current.set(verse.n, node);
                        else verseNodes.current.delete(verse.n);
                      }}
                      testID={`flow-verse-${verse.n}`}
                      accessible
                      accessibilityRole="button"
                      accessibilityLabel={`Vers ${verse.n}: ${verse.text}${marked ? " · gemerkt" : ""}${color ? " · markiert" : ""}`}
                      accessibilityState={{ selected: selected === verse.n }}
                      onPress={() => onSelect(verse.n)}
                      style={{
                        backgroundColor:
                          selected === verse.n
                            ? t.soft
                            : highlightBackground(color, t.dark),
                      }}
                    >
                      <Text
                        accessible={false}
                        style={{
                          fontFamily: "DMSans",
                          fontSize: 11,
                          color: t.gold,
                          textDecorationLine: marked ? "underline" : "none",
                        }}
                      >
                        {verse.n}
                      </Text>{" "}
                      {verse.text}
                    </Text>
                  </Fragment>
                );
              })}
            </Text>
            {active ? renderActions(active) : null}
          </View>
        );
      })}
    </View>
  );
});

export default FlowText;
