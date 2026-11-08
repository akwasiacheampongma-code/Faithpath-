import { useCallback, useEffect, useState } from "react";
import { AccessibilityInfo, AppState } from "react-native";
import { useFocusEffect } from "expo-router";
import { useApp } from "../../../state/store";
export function useTreeMotion(animate: boolean) {
  const reduced = useApp(s => s.data.settings.reducedMotion), [focused, setFocused] = useState(false);
  useFocusEffect(useCallback(() => { setFocused(true); return () => setFocused(false); }, []));
  // Static until the platform preference is known; never flash an animation.
  const [systemReduced, setReduced] = useState(true), [active, setActive] = useState(AppState.currentState === "active");
  useEffect(() => {
    let alive = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(v => { if (alive) setReduced(v); }).catch(() => {});
    const preference = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduced);
    const state = AppState.addEventListener("change", v => setActive(v === "active"));
    return () => { alive = false; preference.remove(); state.remove(); };
  }, []);
  return { focused, moving: animate && !reduced && !systemReduced && focused && active };
}
