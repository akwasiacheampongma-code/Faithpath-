/** Shared source/display contracts; no app storage or progression logic. */
import { STUDY } from './stage-data.js';
export const SIZE = STUDY.size;
export const PAD_CSS = 12;
export const ANCHOR = STUDY.anchor;
export const QUALITY = {
  high: { fps: 30, dpr: 1.5, cells: 80 },
  medium: { fps: 24, dpr: 1.1, cells: 64 },
  low: { fps: 18, dpr: 1, cells: 48 },
};
export const TRANSITION_MS = 680;
export const RESUME_MS = 900;
export const LOAD_TIMEOUT_MS = 12000;
export const MAX_DIAGNOSTIC_WINDOWS = 180;
