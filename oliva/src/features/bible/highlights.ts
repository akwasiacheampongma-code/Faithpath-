import { z } from "zod";
export const highlightColor = z.enum([
  "olive",
  "gold",
  "sand",
  "sage",
  "terra",
]);
export type HighlightColor = z.infer<typeof highlightColor>;
// Each imported color keeps its identity. Reader and collection share the palette.
export function highlightBackground(
  color: HighlightColor | undefined,
  dark: boolean,
) {
  const colors = dark
    ? {
        olive: "#39452c",
        gold: "#56472c",
        sand: "#4e463b",
        sage: "#304a43",
        terra: "#573e35",
      }
    : {
        olive: "#e7ecdc",
        gold: "#f4e8cc",
        sand: "#eee5d6",
        sage: "#dcebe4",
        terra: "#f0ddd3",
      };
  return color ? colors[color] : "transparent";
}
