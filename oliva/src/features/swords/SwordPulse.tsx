import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, AppState, Easing } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useApp } from "../../state/store";
import { useTheme } from "../../design-system/theme";
import { normalizeSwordProgress } from "./model";
import { JOHN_LIGHT_LENGTH, JOHN_LIGHT_PATH } from "./layout";

/** A short optional confirmation, never a loop or a data/progress event. */
export function SwordPulse({
  active,
  book,
  progress,
  illustrated = false,
  frameSize,
}: {
  active: boolean;
  book: string;
  progress: number;
  illustrated?: boolean;
  frameSize: number;
}) {
  const reduced = useApp((s) => s.data.settings.reducedMotion),
    t = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const previous = useRef({ book, active: false });
  const [target, setTarget] = useState({
    illustrated,
    progress: normalizeSwordProgress(progress),
  });
  useEffect(() => {
    const rising =
      active && !previous.current.active && previous.current.book === book;
    previous.current = { book, active };
    opacity.stopAnimation();
    opacity.setValue(0);
    if (
      !rising ||
      reduced ||
      normalizeSwordProgress(progress) === 0 ||
      AppState.currentState !== "active"
    )
      return;
    setTarget({ illustrated, progress: normalizeSwordProgress(progress) });
    let alive = true,
      animation: Animated.CompositeAnimation | null = null;
    const subscriptions: { remove(): void }[] = [];
    const release = () => {
      subscriptions.splice(0).forEach((subscription) => subscription.remove());
    };
    const stop = () => {
      alive = false;
      animation?.stop();
      opacity.stopAnimation();
      opacity.setValue(0);
      release();
    };
    subscriptions.push(
      AccessibilityInfo.addEventListener("reduceMotionChanged", (value) => {
        if (value) stop();
      }),
    );
    subscriptions.push(
      AppState.addEventListener("change", (value) => {
        if (value !== "active") stop();
      }),
    );
    void AccessibilityInfo.isReduceMotionEnabled()
      .then((system) => {
        if (!alive || system || AppState.currentState !== "active") {
          release();
          return;
        }
        animation = Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0.75,
            duration: 240,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 480,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]);
        animation.start(release);
      })
      .catch(release);
    return () => {
      stop();
    };
    // Progress is sampled at this explicit confirmation edge. A later import,
    // image load or preference change must never replay the confirmation.
  }, [active, book, reduced, opacity]);
  const length = target.illustrated ? JOHN_LIGHT_LENGTH : 71;
  return (
    <Animated.View
      testID="sword-confirmation"
      pointerEvents="none"
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: frameSize,
        height: frameSize * 1.5,
        opacity,
      }}
    >
      <Svg
        accessible={false}
        aria-hidden={true}
        viewBox="0 0 100 150"
        width="100%"
        height="100%"
      >
        <Path
          d={target.illustrated ? JOHN_LIGHT_PATH : "M50 95V24"}
          stroke={t.dark ? "#fff3c7" : "#f9e8ad"}
          strokeWidth={target.illustrated ? 0.7 : 2.7}
          fill="none"
          strokeDasharray={[target.progress * length, length]}
          opacity={target.progress > 0 ? 1 : 0}
        />
      </Svg>
    </Animated.View>
  );
}
