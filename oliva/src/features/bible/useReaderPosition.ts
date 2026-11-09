import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import {
  AppState,
  Dimensions,
  ScrollView,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { useApp } from "../../state/store";
import {
  readingScope,
  sameReadingScope,
  verseAtOffset,
  type ReadingPosition,
  type VerseFrame,
} from "./position";
import { getPassage, validReference, type Reference } from "./repository";

const viewportKey = () => {
  const window = Dimensions.get("window");
  return `${window.width}:${window.height}:${window.scale}:${window.fontScale}`;
};

type Options = {
  reference: Reference;
  scroll: React.RefObject<React.ComponentRef<typeof ScrollView> | null>;
  explicitVerse?: number;
  mode: "read" | "deep";
  toolsOpen: boolean;
  layoutKey: string;
  measureVerses?: (
    relativeTo: React.ComponentRef<typeof View>,
  ) => Promise<VerseFrame[] | null>;
  pauseRemember?: boolean;
};
export function useReaderPosition({
  reference,
  scroll,
  explicitVerse,
  mode,
  toolsOpen,
  layoutKey,
  measureVerses,
  pauseRemember = false,
}: Options) {
  const scope = readingScope(reference),
    positions = useRef(new Map<number, VerseFrame>()),
    fragments = useRef<VerseFrame[]>([]),
    measuredViewport = useRef(viewportKey()),
    rootNode = useRef<React.ComponentRef<typeof View> | null>(null),
    listNode = useRef<React.ComponentRef<typeof View> | null>(null),
    verseNodes = useRef(new Map<number, React.ComponentRef<typeof View>>()),
    measurement = useRef(0),
    dirty = useRef(true),
    rootY = useRef(0),
    listY = useRef<number | null>(null),
    offset = useRef(0),
    active = useRef(true),
    foreground = useRef(
      AppState.currentState !== "background" &&
        AppState.currentState !== "inactive",
    ),
    holdRestoredVerse = useRef(false),
    pendingMeasurements = useRef(new Set<() => void>()),
    requestLayout = useRef<() => void>(() => {}),
    pending = useRef<ReadingPosition | null>(null),
    target = useRef<number | null>(null),
    lastVerse = useRef<number | null>(null),
    saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null),
    layoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null),
    restoredTimer = useRef<ReturnType<typeof setTimeout> | null>(null),
    latest = useRef({
      reference,
      mode,
      toolsOpen,
      measureVerses,
      pauseRemember,
    });
  latest.current = { reference, mode, toolsOpen, measureVerses, pauseRemember };
  const previousTools = useRef(toolsOpen),
    previousLayout = useRef(layoutKey),
    previousPause = useRef(pauseRemember);
  function flush() {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = null;
    const value = pending.current;
    pending.current = null;
    if (value) void useApp.getState().rememberReadingPosition(value, value.ref);
  }
  function remember(verse: number) {
    lastVerse.current = verse;
    pending.current = {
      ref: { ...latest.current.reference },
      verse,
      mode: latest.current.mode,
    };
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(flush, 500);
  }
  function rememberVisible() {
    if (
      !active.current ||
      !foreground.current ||
      dirty.current ||
      latest.current.toolsOpen ||
      latest.current.pauseRemember ||
      holdRestoredVerse.current ||
      target.current !== null ||
      listY.current === null
    )
      return;
    const verse = verseAtOffset(
      fragments.current,
      offset.current + 24 - 20 - rootY.current - listY.current,
    );
    if (
      verse !== null &&
      (verse !== lastVerse.current ||
        pending.current?.mode !== latest.current.mode)
    )
      remember(verse);
  }
  function applyTarget() {
    const verse = target.current;
    if (
      verse === null ||
      listY.current === null ||
      !scroll.current ||
      latest.current.toolsOpen ||
      latest.current.pauseRemember
    )
      return;
    const frame = positions.current.get(verse);
    if (!frame) return;
    const y = Math.max(0, 20 + rootY.current + listY.current + frame.y - 24);
    offset.current = y;
    holdRestoredVerse.current = true;
    scroll.current.scrollTo({ y, animated: false });
    // Layout and the ensuing scroll event are separate platform events. Keep
    // the verse frozen until both settle; intermediate offsets are not reading.
    if (restoredTimer.current) clearTimeout(restoredTimer.current);
    const token = measurement.current;
    restoredTimer.current = setTimeout(() => {
      if (
        token !== measurement.current ||
        !active.current ||
        !foreground.current ||
        readingScope(latest.current.reference) !== scope ||
        target.current !== verse
      )
        return;
      target.current = null;
      remember(verse);
    }, 100);
  }
  function boundedMeasurement<T>(
    start: (done: (value: T | null) => void) => void,
  ) {
    return new Promise<T | null>((resolve) => {
      let settled = false;
      const finish = (value: T | null) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        pendingMeasurements.current.delete(cancel);
        resolve(value);
      };
      const cancel = () => finish(null);
      const timer = setTimeout(cancel, 350);
      pendingMeasurements.current.add(cancel);
      try {
        start(finish);
      } catch {
        finish(null);
      }
    });
  }
  async function measureFrames() {
    // RN Web's onLayout is ResizeObserver based: moving a view without resizing
    // it does not emit an event. Read the complete coordinate frame together
    // after a reflow (e.g. closing settings or a verse note).
    const token = ++measurement.current,
      list = listNode.current,
      root = rootNode.current,
      viewport = viewportKey();
    if (!list || !root) return;
    const inlineMeasure = latest.current.measureVerses;
    const entries = [...verseNodes.current];
    const relative = (
      node: React.ComponentRef<typeof View>,
      parent: React.ComponentRef<typeof View>,
    ) =>
      boundedMeasurement<{ y: number; height: number }>((resolve) => {
        // Native View refs do not universally expose a DOM isConnected flag.
        if (node.isConnected === false || parent.isConnected === false) {
          resolve(null);
          return;
        }
        node.measureLayout(
          parent,
          (_x, y, _width, height) =>
            resolve(
              Number.isFinite(y) && Number.isFinite(height) && height >= 0
                ? { y, height }
                : null,
            ),
          () => resolve(null),
        );
      });
    const [listFrame, frames] = await Promise.all([
      relative(list, root),
      inlineMeasure
        ? boundedMeasurement<VerseFrame[]>((resolve) => {
            void inlineMeasure(list).then(resolve, () => resolve(null));
          })
        : Promise.all(
            entries.map(async ([verse, node]) => {
              const frame = await relative(node, list);
              return frame ? { verse, ...frame } : null;
            }),
          ).then((items) =>
            items.every((item): item is VerseFrame => item !== null)
              ? items
              : null,
          ),
    ]);
    if (
      token !== measurement.current ||
      viewport !== viewportKey() ||
      readingScope(latest.current.reference) !== scope ||
      !active.current ||
      !foreground.current
    )
      return;
    const expected = new Set(
      getPassage(latest.current.reference).map((verse) => verse.n),
    );
    if (
      !listFrame ||
      !frames ||
      frames.some(
        (frame) =>
          !expected.has(frame.verse) ||
          !Number.isFinite(frame.y) ||
          !Number.isFinite(frame.height) ||
          frame.height <= 0,
      ) ||
      new Set(frames.map((frame) => frame.verse)).size !== expected.size
    )
      return;
    listY.current = listFrame.y;
    measuredViewport.current = viewport;
    positions.current.clear();
    fragments.current = frames.map((frame) => ({ ...frame }));
    for (const frame of frames) {
      const previous = positions.current.get(frame.verse);
      if (!previous || frame.y < previous.y)
        positions.current.set(frame.verse, { ...frame });
    }
    dirty.current = false;
    applyTarget();
    // A quick user scroll may have occurred while the new frames were read.
    // Account for its final offset once, using the coherent measurements.
    rememberVisible();
  }
  function settleLayout() {
    dirty.current = true;
    measurement.current++;
    if (restoredTimer.current) clearTimeout(restoredTimer.current);
    if (layoutTimer.current) clearTimeout(layoutTimer.current);
    if (!active.current || !foreground.current) return;
    layoutTimer.current = setTimeout(() => {
      void measureFrames();
    }, 80);
  }
  requestLayout.current = settleLayout;
  function viewportChanged() {
    // Native keyboard resizing must not pull a focused note out of view.
    // A picker/settings overlay can retain its old target until it closes.
    if (
      lastVerse.current !== null &&
      (!latest.current.pauseRemember || latest.current.toolsOpen)
    ) {
      target.current = lastVerse.current;
      holdRestoredVerse.current = true;
    }
    requestLayout.current();
  }
  const requestViewport = useRef(viewportChanged);
  requestViewport.current = viewportChanged;
  function restore(verse: number) {
    if (readingScope(latest.current.reference) !== scope) return;
    if (!getPassage(latest.current.reference).some((v) => v.n === verse))
      return;
    target.current = verse;
    lastVerse.current = verse;
    settleLayout();
  }
  useLayoutEffect(() => {
    if (restoredTimer.current) clearTimeout(restoredTimer.current);
    flush();
    positions.current.clear();
    fragments.current = [];
    for (const cancel of pendingMeasurements.current) cancel();
    measurement.current++;
    listY.current = null;
    rootY.current = 0;
    offset.current = 0;
    if (!validReference(reference)) return;
    const saved = useApp.getState().data.readingPosition;
    const validExplicit =
      explicitVerse && getPassage(reference).some((v) => v.n === explicitVerse)
        ? explicitVerse
        : null;
    const verse =
      validExplicit ??
      (saved && sameReadingScope(saved.ref, reference) ? saved.verse : null);
    target.current = verse;
    lastVerse.current = verse;
    holdRestoredVerse.current = verse !== null;
    void useApp.getState().openReading(reference);
    if (verse === null) scroll.current?.scrollTo({ y: 0, animated: false });
    return flush;
  }, [scope]);
  useLayoutEffect(() => {
    if (explicitVerse) restore(explicitVerse);
  }, [scope, explicitVerse]);
  useLayoutEffect(() => {
    const changed = previousLayout.current !== layoutKey;
    const closed = previousTools.current && !toolsOpen;
    previousLayout.current = layoutKey;
    previousTools.current = toolsOpen;
    if (lastVerse.current !== null && (changed || closed)) {
      // Freeze before DOM/native layout callbacks can report temporary offsets.
      target.current = lastVerse.current;
      if (!toolsOpen) restore(lastVerse.current);
    }
  }, [layoutKey, toolsOpen]);
  useLayoutEffect(() => {
    const resumed = previousPause.current && !pauseRemember;
    previousPause.current = pauseRemember;
    if (resumed && (target.current !== null || dirty.current)) settleLayout();
  }, [pauseRemember]);
  useFocusEffect(
    useCallback(() => {
      active.current = true;
      requestLayout.current();
      return () => {
        active.current = false;
        measurement.current++;
        dirty.current = true;
        if (layoutTimer.current) clearTimeout(layoutTimer.current);
        if (restoredTimer.current) clearTimeout(restoredTimer.current);
        for (const cancel of pendingMeasurements.current) cancel();
        flush();
      };
    }, []),
  );
  useEffect(() => {
    // Dimensions can change and clamp a native/browser scroll position before
    // React commits the new width/fontScale layoutKey. Freeze the canonical
    // anchor at the platform event, not after that intermediate scroll.
    const dimensions = Dimensions.addEventListener("change", () => {
      requestViewport.current();
    });
    const listener = AppState.addEventListener("change", (state) => {
      foreground.current = state === "active";
      if (foreground.current) requestLayout.current();
      else {
        measurement.current++;
        dirty.current = true;
        if (layoutTimer.current) clearTimeout(layoutTimer.current);
        if (restoredTimer.current) clearTimeout(restoredTimer.current);
        for (const cancel of pendingMeasurements.current) cancel();
        flush();
      }
    });
    return () => {
      dimensions.remove();
      listener.remove();
      flush();
      if (layoutTimer.current) clearTimeout(layoutTimer.current);
      if (restoredTimer.current) clearTimeout(restoredTimer.current);
      for (const cancel of pendingMeasurements.current) cancel();
      measurement.current++;
    };
  }, []);
  return {
    rootRef: (node: React.ComponentRef<typeof View> | null) => {
      rootNode.current = node;
    },
    listRef: (node: React.ComponentRef<typeof View> | null) => {
      listNode.current = node;
    },
    verseRef: (verse: number, node: React.ComponentRef<typeof View> | null) => {
      if (node) verseNodes.current.set(verse, node);
      else verseNodes.current.delete(verse);
    },
    rootLayout: (e: LayoutChangeEvent) => {
      if (readingScope(latest.current.reference) !== scope) return;
      rootY.current = e.nativeEvent.layout.y;
      settleLayout();
    },
    listLayout: (e: LayoutChangeEvent) => {
      if (readingScope(latest.current.reference) !== scope) return;
      listY.current = e.nativeEvent.layout.y;
      settleLayout();
    },
    verseLayout: (verse: number, e: LayoutChangeEvent) => {
      if (readingScope(latest.current.reference) !== scope) return;
      positions.current.set(verse, {
        verse,
        y: e.nativeEvent.layout.y,
        height: e.nativeEvent.layout.height,
      });
      settleLayout();
    },
    onScroll: (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (readingScope(latest.current.reference) !== scope) return;
      const next = e.nativeEvent.contentOffset.y;
      if (viewportKey() !== measuredViewport.current) {
        offset.current = next;
        requestViewport.current();
        return;
      }
      if (target.current === null && Math.abs(next - offset.current) > 0.5)
        holdRestoredVerse.current = false;
      offset.current = next;
      rememberVisible();
    },
    restore,
    layoutChanged: settleLayout,
    beginning: () => {
      target.current = null;
      holdRestoredVerse.current = false;
      if (restoredTimer.current) clearTimeout(restoredTimer.current);
      pending.current = null;
      lastVerse.current = null;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      void useApp
        .getState()
        .rememberReadingPosition(null, latest.current.reference);
      scroll.current?.scrollTo({ y: 0, animated: false });
    },
    flush,
  };
}
