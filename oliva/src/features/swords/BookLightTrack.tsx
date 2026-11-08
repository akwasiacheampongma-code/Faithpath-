import { useId } from "react";
import { View } from "react-native";
import Svg, { ClipPath, Defs, G, Path } from "react-native-svg";
import { useTheme } from "../../design-system/theme";
import { bookByCode } from "../bible/repository";
import { swordIllustration } from "./illustrations";
import { normalizeSwordProgress } from "./model";

/** A separate measured rail and the book's actual chapter ticks encode only
 * confirmed reading. The illustration's painted foliage stays unchanged. */
export function BookLightTrack({
  book,
  progress,
}: {
  book: string;
  progress: number;
}) {
  const t = useTheme(),
    id = useId().replace(/:/g, ""),
    value = normalizeSwordProgress(progress),
    illustration = swordIllustration(book),
    chapterCount = bookByCode(book)?.chapters;
  if (!illustration || !chapterCount) return null;
  const light = illustration.light;
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
            <Path d={light.clipPath} />
          </ClipPath>
        </Defs>
        <G clipPath={`url(#${id})`}>
          <Path
            d={light.path}
            fill="none"
            stroke="#314c3b"
            strokeWidth=".85"
            opacity=".9"
          />
          <Path
            d={Array.from(
              { length: chapterCount + 1 },
              (_, i) =>
                `M${light.tickX} ${light.tickStartY - (i * light.length) / chapterCount}h${light.tickWidth}`,
            ).join(" ")}
            stroke="#314c3b"
            strokeWidth=".16"
            opacity=".85"
            fill="none"
          />
          <Path
            d={light.path}
            fill="none"
            stroke={t.dark ? "#fff1bd" : "#e7c76f"}
            strokeWidth=".65"
            strokeDasharray={[value * light.length, light.length]}
            opacity={value > 0 ? 1 : 0}
          />
        </G>
      </Svg>
    </View>
  );
}
