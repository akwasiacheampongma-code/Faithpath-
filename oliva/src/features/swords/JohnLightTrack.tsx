import { useId } from "react";
import { View } from "react-native";
import Svg, { ClipPath, Defs, G, Path } from "react-native-svg";
import { useTheme } from "../../design-system/theme";
import { JOHN_LIGHT_LENGTH, JOHN_LIGHT_PATH } from "./layout";
import { normalizeSwordProgress } from "./model";
import { bookByCode } from "../bible/repository";

/** The painted gold inlay is decoration. This separate measured rail and its
 * 21 chapter ticks encode confirmed reading; foliage remains untouched. */
export function JohnLightTrack({ progress }: { progress: number }) {
  const chapterCount = bookByCode("JHN")!.chapters;
  const t = useTheme(),
    id = useId().replace(/:/g, ""),
    value = normalizeSwordProgress(progress);
  return (
    <View
      testID="book-sword-progress"
      pointerEvents="none"
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ position: "absolute", inset: 0 }}
    >
      <Svg
        accessible={false}
        aria-hidden={true}
        viewBox="0 0 100 150"
        width="100%"
        height="100%"
      >
        <Defs>
          <ClipPath id={id}>
            <Path d="M49.6 4.6L50.8 9V49.7H48.4V9Z" />
          </ClipPath>
        </Defs>
        <G clipPath={`url(#${id})`}>
          <Path
            d={JOHN_LIGHT_PATH}
            fill="none"
            stroke="#314c3b"
            strokeWidth=".85"
            opacity=".9"
          />
          <Path
            d={Array.from(
              { length: chapterCount + 1 },
              (_, i) =>
                `M48.8 ${49.5 - (i * JOHN_LIGHT_LENGTH) / chapterCount}h1.6`,
            ).join(" ")}
            stroke="#314c3b"
            strokeWidth=".16"
            opacity=".85"
            fill="none"
          />
          <Path
            d={JOHN_LIGHT_PATH}
            fill="none"
            stroke={t.dark ? "#fff1bd" : "#e7c76f"}
            strokeWidth=".65"
            strokeDasharray={[value * JOHN_LIGHT_LENGTH, JOHN_LIGHT_LENGTH]}
            opacity={value > 0 ? 1 : 0}
          />
        </G>
      </Svg>
    </View>
  );
}
