export function swordSize(value: number, fallback = 140) {
  return Number.isFinite(value) && value > 0
    ? Math.max(40, Math.min(512, value))
    : fallback;
}

/** Registered to the unchanged 1024 × 1536 John master, in a 100 × 150 plane.
 * The lower foliage is deliberately outside this progress track. */
export const JOHN_LIGHT_PATH = "M49.6 49.5V5.5";
export const JOHN_LIGHT_LENGTH = 44;
