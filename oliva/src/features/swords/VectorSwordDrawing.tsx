import { useId } from "react";
import Svg, {
  Path,
  Circle,
  G,
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg";
import { useTheme } from "../../design-system/theme";
import { bookByCode } from "../bible/repository";
import { normalizeSwordProgress } from "./model";

export function VectorSwordDrawing({
  book = "MRK",
  progress = 0,
}: {
  book?: string;
  progress?: number;
}) {
  const bladeId = useId().replace(/:/g, "");
  const value = normalizeSwordProgress(progress);
  const t = useTheme(),
    b = bookByCode(book),
    i = b?.index ?? 0,
    w = 8 + (i % 4),
    guard = 25 + (i % 5) * 2;
  const glyphs = [
    <Path key="a" d="M50 47q-14-16-12-23 14 0 12 23 14-16 12-23-14 0-12 23" />,
    <Path key="b" d="M37 29q13-12 26 0M37 37q13-12 26 0M37 45q13-12 26 0" />,
    <Path key="c" d="m50 22 5 12 13 1-10 8 3 13-11-7-11 7 3-13-10-8 13-1Z" />,
    <Path key="d" d="M39 22h22v31H39Zm5 7h12m-12 8h12m-12 8h7" />,
    <Path key="e" d="M50 23q-18 20-3 30-5-10 6-16-2 10 2 16 12-12-5-30Z" />,
    <Path key="f" d="M50 24c-23-12-23 10 0 28 23-18 23-40 0-28Z" />,
    <Path key="g" d="m33 47 5-20 12 11 12-11 5 20Zm4 6h26" />,
    <Path key="h" d="M50 24v29M39 34q11-15 22 0M36 43q14-14 28 0" />,
    <Path key="j" d="M34 37q16-22 32 0-16 22-32 0Zm16-7v14" />,
  ];
  return (
    <Svg
      accessible={false}
      aria-hidden={true}
      viewBox="0 0 100 150"
      width="100%"
      height="100%"
    >
      <Defs>
        <LinearGradient id={bladeId} x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#829187" />
          <Stop offset=".48" stopColor="#f0efe2" />
          <Stop offset="1" stopColor="#b0b9a7" />
        </LinearGradient>
      </Defs>
      <Circle cx="50" cy="59" r="40" fill={t.goldSoft} opacity=".6" />
      <Circle
        cx="50"
        cy="59"
        r="44"
        fill="none"
        stroke={t.gold}
        strokeWidth=".5"
        opacity=".4"
      />
      <G
        stroke={t.gold}
        strokeWidth=".7"
        fill="none"
        opacity=".55"
        transform="translate(14 -1) scale(.72)"
      >
        {book !== "JHN" && glyphs[i % glyphs.length]}
      </G>
      <Path
        d={`M50 14  ${50 + w} 33  ${50 + w - 2} 99 50 105 ${50 - w + 2} 99 ${50 - w} 33Z`}
        fill={`url(#${bladeId})`}
        stroke="#839080"
        strokeWidth=".65"
      />
      <Path d="M50 24v71" stroke="#f6f1d1" strokeWidth="1.4" />
      <Path
        d="M50 95V24"
        stroke={t.gold}
        strokeWidth="2.2"
        strokeDasharray={`${value * 71} 71`}
      />
      {book === "JHN" && (
        <G fill={t.primary} stroke={t.primary} strokeWidth=".9">
          <Path d="M48 94Q31 82 36 67Q39 57 34 49" fill="none" />
          <Path
            d="M35 73Q23 73 25 65Q33 64 35 73M36 64Q45 60 43 55Q36 55 36 64M37 84Q25 83 28 76Q36 77 37 84"
            strokeWidth=".35"
          />
        </G>
      )}
      <Path
        d={`M${50 - guard} 99Q50 108 ${50 + guard} 99l-2 6Q50 113 ${52 - guard} 105Z`}
        fill="#ac9058"
      />
      <Path d="M46 110h8v22h-8Z" fill={t.primary} />
      <Path d="m46 114 8 3m-8 3 8 3m-8 3 8 3" stroke={t.gold} strokeWidth="1" />
      <Circle cx="50" cy="137" r="5" fill="#ad9055" />
      {Array.from({ length: 1 + (i % 7) }, (_, n) => (
        <Circle key={n} cx={37 + n * 4} cy="103" r=".7" fill="#e8d19a" />
      ))}
      <Path
        d={`M${50 - w + 3} 39l${w - 3} ${(i % 5) + 3} ${w - 3} -${(i % 5) + 3}`}
        fill="none"
        stroke={t.gold}
        strokeWidth=".65"
      />
    </Svg>
  );
}
