import { useColorScheme } from "react-native";
import { useApp } from "../state/store";
export const palette = {
  light: {
    bg: "#f8f7f2",
    surface: "#fffefa",
    soft: "#efeee5",
    text: "#263c30",
    muted: "#5c675b",
    line: "#dedfd4",
    primary: "#40583d",
    onPrimary: "#ffffff",
    gold: "#806025",
    goldSoft: "#f2ead8",
    danger: "#a03a32",
    highlight: "#e3e9d5",
  },
  dark: {
    bg: "#19251f",
    surface: "#233128",
    soft: "#2d3b30",
    text: "#f3f0e4",
    muted: "#bbc3b4",
    line: "#455044",
    primary: "#c4d0a8",
    onPrimary: "#203024",
    gold: "#dfbd7c",
    goldSoft: "#3e392b",
    danger: "#ffa69a",
    highlight: "#414e33",
  },
};
export const tokens = {
  space: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64],
  radius: { sm: 10, md: 18, lg: 26, pill: 999 },
  font: { body: "DMSans", display: "Cormorant" },
  motion: { short: 180, medium: 320 },
};
export function useTheme() {
  const selected = useApp((s) => s.data.settings.theme),
    system = useColorScheme();
  const dark =
    selected === "dark" || (selected === "system" && system === "dark");
  return { ...palette[dark ? "dark" : "light"], dark };
}
