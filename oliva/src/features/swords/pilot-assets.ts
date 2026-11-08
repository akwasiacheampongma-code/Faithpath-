import type { ImageSourcePropType } from "react-native";
const sources: Record<number, ImageSourcePropType> = {
  256: require("../../../assets/swords/john-life-pilot-256.png"),
  512: require("../../../assets/swords/john-life-pilot-512.png"),
  768: require("../../../assets/swords/john-life-pilot-768.png"),
};
export function pilotVariants(width: number, dpr: number) {
  const target = width * Math.max(1, Math.min(3, dpr));
  // Only runtime sizes and static image modules enter the app. Full prompts,
  // master provenance and rights-review records remain development artifacts.
  const variants = [256, 512, 768].map((width) => ({ width }));
  const preferred =
    variants.find((v) => v.width >= target) ?? variants[variants.length - 1]!;
  return [
    preferred,
    ...variants
      .filter((v) => v !== preferred)
      .sort(
        (a, b) =>
          Math.abs(a.width - preferred.width) -
          Math.abs(b.width - preferred.width),
      ),
  ];
}
export function pilotSource(width: number): ImageSourcePropType {
  const source = sources[width];
  if (!source) throw new Error("Unbekannte Buchbildvariante.");
  return source;
}
