import { useCallback, useRef } from "react";
import { BackHandler, Platform } from "react-native";
import { useFocusEffect } from "expo-router";

/** Escape / Android Back dismisses reader context before leaving its route.
 * State remains local to the focused screen; no history or data mutation. */
export function useReaderDismiss(onDismiss: () => boolean) {
  const latest = useRef(onDismiss);
  latest.current = onDismiss;
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === "web") {
        const onKey = (event: KeyboardEvent) => {
          if (event.key !== "Escape" || event.repeat || event.isComposing)
            return;
          if (latest.current()) {
            event.preventDefault();
            event.stopPropagation();
          }
        };
        window.addEventListener("keydown", onKey, true);
        return () => window.removeEventListener("keydown", onKey, true);
      }
      const listener = BackHandler.addEventListener("hardwareBackPress", () =>
        latest.current(),
      );
      return () => listener.remove();
    }, []),
  );
}
