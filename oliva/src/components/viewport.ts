import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useState,
  type RefObject,
} from "react";
import { View, useWindowDimensions } from "react-native";
export type ViewportBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};
type Signals = {
  subscribe(listener: () => void): () => void;
  notify(): void;
  setBounds(bounds: ViewportBounds | null): void;
  getBounds(): ViewportBounds | null;
  dispose(): void;
};
function signals(): Signals {
  const listeners = new Set<() => void>();
  let timer: ReturnType<typeof setTimeout> | null = null,
    bounds: ViewportBounds | null = null;
  const notify = () => {
    if (timer || !listeners.size) return;
    timer = setTimeout(() => {
      timer = null;
      listeners.forEach((f) => f());
    }, 100);
  };
  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    notify,
    setBounds(next) {
      if (
        next?.x === bounds?.x &&
        next?.y === bounds?.y &&
        next?.width === bounds?.width &&
        next?.height === bounds?.height
      )
        return;
      bounds = next;
      notify();
    },
    getBounds() {
      return bounds;
    },
    dispose() {
      if (timer) clearTimeout(timer);
      timer = null;
      bounds = null;
      listeners.clear();
    },
  };
}
export const ViewportSignals = createContext<Signals | null>(null);
export function useViewportSignals() {
  const value = useMemo(signals, []);
  useEffect(() => () => value.dispose(), [value]);
  return value;
}
export function useNativeVisibility(
  ref: RefObject<React.ComponentRef<typeof View> | null>,
  enabled: boolean,
) {
  const viewport = useContext(ViewportSignals),
    { height, width } = useWindowDimensions();
  const [visible, setVisible] = useState(false),
    measurement = useRef(0);
  const check = useCallback(() => {
    if (!enabled) return;
    const request = ++measurement.current;
    ref.current?.measureInWindow((x, y, w, h) => {
      if (request !== measurement.current) return;
      const bounds =
        viewport?.getBounds() ??
        (viewport ? null : { x: 0, y: 0, width, height });
      if (!bounds) {
        setVisible(false);
        return;
      }
      const left = Math.max(0, bounds.x),
        top = Math.max(0, bounds.y);
      const right = Math.min(width, bounds.x + bounds.width),
        bottom = Math.min(height, bounds.y + bounds.height);
      setVisible(
        w > 0 &&
          h > 0 &&
          left < right &&
          top < bottom &&
          x + w > left &&
          x < right &&
          y + h > top &&
          y < bottom,
      );
    });
  }, [enabled, height, width, ref, viewport]);
  useEffect(() => {
    ++measurement.current;
    if (!enabled) {
      setVisible(false);
      return;
    }
    check();
    const unsubscribe = viewport?.subscribe(check);
    return () => {
      ++measurement.current;
      unsubscribe?.();
    };
  }, [enabled, viewport, check]);
  return { visible, check };
}
