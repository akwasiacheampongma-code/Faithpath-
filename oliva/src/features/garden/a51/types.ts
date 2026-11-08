export type A51Variant = { width: number; src: string; bytes: number; sha256: string };
export type A51Stage = {
  index: number;
  name: string;
  meaning: string;
  art: { index: number; scale: number; cropTop: number; response: number; intent: string };
  source: string;
  sourceSHA256: string;
  variants: A51Variant[];
};
export type WindPose = { x: number[]; y: number[]; light: number };
export type AnatomicalStage = A51Stage & {
  wood: [number, number[][]][];
  probes: number[][];
  regions: number[][];
  falloff: number;
  fade: number[];
};
export type OliveTreeProps = { stage: number; size?: number; animate?: boolean };
