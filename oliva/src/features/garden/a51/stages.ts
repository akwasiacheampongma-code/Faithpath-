import study from "./stage-data.json";
import type { A51Stage } from "./types";
export const A51_STAGES: readonly A51Stage[] = study.stages;
export const A51_SIZE = study.size;
export const A51_ANCHOR = study.anchor as [number, number];
export function a51Stage(index: number): A51Stage {
  return A51_STAGES[Number.isInteger(index) && index >= 0 && index < 7 ? index : 0]!;
}
export function treeLayout(stage: A51Stage, requestedWidth: number) {
  const width = Number.isFinite(requestedWidth) ? Math.max(80, Math.min(700, requestedWidth)) : 280;
  return {
    width,
    height: width * (A51_SIZE - stage.art.cropTop) / A51_SIZE,
    artWidth: width * stage.art.scale,
    left: (1 - stage.art.scale) * A51_ANCHOR[0] * width / A51_SIZE,
    bottom: (1 - stage.art.scale) * (A51_SIZE - A51_ANCHOR[1]) * width / A51_SIZE,
  };
}
export function stageVariant(stage: A51Stage, width: number, dpr: number) {
  const target = Math.max(1, width) * Math.max(1, Math.min(3, dpr)) * stage.art.scale;
  return stage.variants.find(v => v.width >= target) ?? stage.variants[stage.variants.length - 1]!;
}
