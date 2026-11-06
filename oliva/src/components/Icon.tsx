import Svg, { Path, Circle, Rect, Line, Polyline } from "react-native-svg";
export type IconName =
  | "home"
  | "book"
  | "path"
  | "leaf"
  | "bookmark"
  | "arrow"
  | "back"
  | "search"
  | "sun"
  | "moon"
  | "settings"
  | "check"
  | "close"
  | "clock"
  | "pen"
  | "chevron"
  | "info"
  | "volume"
  | "sword"
  | "download"
  | "heart";
export function Icon({
  name,
  size = 22,
  color = "currentColor",
  stroke = 1.6,
}: {
  name: IconName;
  size?: number;
  color?: string;
  stroke?: number;
}) {
  const paths: Record<IconName, React.ReactNode> = {
    home: (
      <>
        <Path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z" />
      </>
    ),
    book: (
      <>
        <Path d="M12 5C8 2 4 3 2 4v15c4-2 7-1 10 1 3-2 6-3 10-1V4c-4-2-7-1-10 1Z" />
        <Line x1="12" y1="5" x2="12" y2="20" />
      </>
    ),
    path: (
      <>
        <Path d="M17 3c-15 0 8 7-7 11s-4 7 0 7" />
        <Circle cx="17" cy="3" r="1.5" />
      </>
    ),
    leaf: (
      <>
        <Path d="M5 19C2 8 9 3 21 3c0 12-5 18-16 16Z" />
        <Path d="M3 22 16 8M9 15V9M9 15h6" />
      </>
    ),
    bookmark: <Path d="M6 3h12v19l-6-4-6 4Z" />,
    arrow: (
      <>
        <Path d="M4 12h16m-6-6 6 6-6 6" />
      </>
    ),
    back: <Path d="M20 12H4m6-6-6 6 6 6" />,
    search: (
      <>
        <Circle cx="10" cy="10" r="6.5" />
        <Path d="m15 15 6 6" />
      </>
    ),
    sun: (
      <>
        <Circle cx="12" cy="12" r="4" />
        <Path d="M12 1v2m0 18v2M1 12h2m18 0h2M4 4l1.5 1.5m13 13L20 20M20 4l-1.5 1.5m-13 13L4 20" />
      </>
    ),
    moon: <Path d="M21 14A9 9 0 0 1 10 3a9 9 0 1 0 11 11Z" />,
    settings: (
      <>
        <Circle cx="12" cy="12" r="3" />
        <Path d="m9 3 6 0 1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1Z" />
      </>
    ),
    check: <Path d="m5 12 4 4L20 5" />,
    close: <Path d="m6 6 12 12M6 18 18 6" />,
    clock: (
      <>
        <Circle cx="12" cy="12" r="9" />
        <Path d="M12 7v6l4 2" />
      </>
    ),
    pen: (
      <>
        <Path d="m4 16 12-12 4 4L8 20l-5 1Z" />
        <Path d="m14 6 4 4" />
      </>
    ),
    chevron: <Path d="m9 5 7 7-7 7" />,
    info: (
      <>
        <Circle cx="12" cy="12" r="9" />
        <Path d="M12 11v6" />
        <Circle cx="12" cy="7" r=".5" />
      </>
    ),
    volume: (
      <>
        <Path d="m4 9 5 0 5-5v16l-5-5H4Z" />
        <Path d="M18 8c3 2 3 6 0 8" />
      </>
    ),
    sword: (
      <>
        <Path d="m12 2 3 4v10H9V6Zm-6 15h12M12 17v5m-2 0h4" />
      </>
    ),
    download: <Path d="M12 3v12m-4-4 4 4 4-4M4 17v4h16v-4" />,
    heart: <Path d="M12 21C-6 10 5-2 12 6 19-2 30 10 12 21Z" />,
  };
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      accessible={false}
    >
      {paths[name]}
    </Svg>
  );
}
