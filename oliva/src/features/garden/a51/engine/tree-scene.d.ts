import type { A51Variant, AnatomicalStage } from "../types";
export type TreeMetrics = {
  stage: number | null; requestedStage: number; ready: boolean; loading: boolean;
  running: boolean; frames?: number; activeMs: number; quality: string;
  reduced: boolean; graphicsFailed: boolean; disposed: boolean; reason: string;
  variant: A51Variant | null; visible: boolean; foreground: boolean;
  transition: { active: boolean; ownedAnimations: number; snapshots: number };
};
export interface TreeScene {
  readonly ready: Promise<boolean>;
  readonly metrics: TreeMetrics;
  readonly stage: AnatomicalStage | null;
  setStage(index: number): Promise<boolean>;
  setEnabled(enabled: boolean): void;
  setReducedMotion(reduced: boolean): void;
  pause(): void; play(): void; retry(): Promise<boolean>;
  inspect(ms: number, options?: { full?: boolean }): void;
  dispose(): void;
}
export function createTreeScene(root: HTMLElement, options: {
  stage: number; autoplay?: boolean;
  resolveSource: (variant: A51Variant) => string;
  onStatus?: (message: string) => void;
  onStage?: (index: number) => void;
}): TreeScene;
