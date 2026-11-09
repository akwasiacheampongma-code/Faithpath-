import {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from "react";
import { useTheme } from "../../../design-system/theme";
import { highlightBackground } from "../highlights";
import type { FlowTextHandle, FlowTextProps } from "./types";

/** Web owns real inline elements and fragment rectangles. No HTML parsing of
 * Bible or personal text: React renders every string as text content. */
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
    renderActions,
  },
  ref,
) {
  const t = useTheme(),
    root = useRef<HTMLDivElement>(null),
    verses = useRef(new Map<number, HTMLSpanElement>()),
    geometry = useRef(onGeometryChange);
  geometry.current = onGeometryChange;
  useImperativeHandle(
    ref,
    () => ({
      measure: async (relativeTo) => {
        const list = relativeTo as unknown as HTMLElement;
        if (!list?.isConnected || !root.current?.isConnected) return null;
        const origin = list.getBoundingClientRect(),
          fragments = [];
        for (const paragraph of paragraphs)
          for (const verse of paragraph.verses) {
            const node = verses.current.get(verse.n);
            if (!node?.isConnected) return null;
            const rects = Array.from(node.getClientRects()).filter(
              (rect) => rect.width > 0 && rect.height > 0,
            );
            if (!rects.length) return null;
            for (const rect of rects)
              fragments.push({
                verse: verse.n,
                y: rect.top - origin.top,
                height: rect.height,
              });
          }
        return fragments;
      },
      focusVerse: (verse) =>
        verses.current.get(verse)?.focus({ preventScroll: true }),
    }),
    [paragraphs],
  );
  useLayoutEffect(() => {
    geometry.current();
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => geometry.current());
    if (root.current) observer?.observe(root.current);
    const onResize = () => geometry.current();
    window.addEventListener("resize", onResize);
    let active = true;
    void document.fonts.ready.then(() => {
      if (active) geometry.current();
    });
    return () => {
      active = false;
      observer?.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [layoutKey, paragraphs]);
  return (
    <div
      ref={root}
      data-testid="reader-flow"
      data-renderer="web-inline"
      style={{ width: "100%", minWidth: 0 }}
    >
      {paragraphs.map((paragraph) => {
        const active = paragraph.verses.find((verse) => verse.n === selected);
        return (
          <div
            key={paragraph.key}
            data-testid={`flow-paragraph-${paragraph.verses[0]!.n}`}
          >
            <p
              lang="de"
              style={{
                margin: "0 0 26px",
                fontFamily: "Cormorant",
                fontSize,
                lineHeight,
                color: t.text,
                overflowWrap: "anywhere",
                textAlign: "start",
              }}
            >
              {paragraph.verses.map((verse, index) => {
                const color = highlights[verse.key],
                  marked = bookmarks.includes(verse.key);
                return (
                  <span key={verse.key}>
                    {index > 0 ? " " : null}
                    <span
                      ref={(node) => {
                        if (node) verses.current.set(verse.n, node);
                        else verses.current.delete(verse.n);
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`Vers ${verse.n}: ${verse.text}${marked ? " · gemerkt" : ""}${color ? " · markiert" : ""}`}
                      aria-pressed={selected === verse.n}
                      data-verse={verse.n}
                      data-testid={`flow-verse-${verse.n}`}
                      aria-controls={
                        selected === verse.n
                          ? `verse-actions-${verse.n}`
                          : undefined
                      }
                      onClick={() => onSelect(verse.n)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          onSelect(verse.n);
                        }
                      }}
                      style={{
                        cursor: "pointer",
                        borderRadius: 4,
                        backgroundColor:
                          selected === verse.n
                            ? t.soft
                            : highlightBackground(color, t.dark),
                        boxDecorationBreak: "clone",
                        WebkitBoxDecorationBreak: "clone",
                      }}
                    >
                      <span
                        aria-hidden="true"
                        style={{
                          fontFamily: "DMSans",
                          fontSize: 11,
                          color: t.gold,
                          textDecoration: marked ? "underline" : undefined,
                        }}
                      >
                        {verse.n}
                      </span>{" "}
                      {verse.text}
                    </span>
                  </span>
                );
              })}
            </p>
            {active ? (
              <div id={`verse-actions-${active.n}`}>
                {renderActions(active)}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
});
export default FlowText;
