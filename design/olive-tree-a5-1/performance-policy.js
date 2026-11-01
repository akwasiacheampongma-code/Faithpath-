/** Active delivered-frame windows only. Lower resolution/FPS, never wind size. */
import { QUALITY, MAX_DIAGNOSTIC_WINDOWS } from './config.js';
export function createPerformancePolicy(seed = false) {
  let level = 'high',
    start = null,
    count = 0,
    warmUntil = 0,
    weak = 0;
  const samples = [];
  const settings = () =>
    level === 'static'
      ? { fps: 0, dpr: 1, cells: 48 }
      : seed
        ? {
            ...QUALITY[level],
            fps: { high: 8, medium: 6, low: 4 }[level],
            dpr: 1,
          }
        : QUALITY[level];
  return {
    get level() {
      return level;
    },
    get settings() {
      return settings();
    },
    get samples() {
      return samples.slice();
    },
    resume(now) {
      start = now;
      warmUntil = now + 1000;
      count = 0;
    },
    pause() {
      start = null;
      count = 0;
    },
    reset() {
      level = 'high';
      weak = 0;
      start = null;
      count = 0;
    },
    frame(now, submitMs = 0) {
      if (start === null || level === 'static' || now < warmUntil) return null;
      if (start < warmUntil) {
        start = now;
        count = 0;
      }
      count++;
      const elapsed = now - start;
      if (elapsed < 3000) return null;
      const fps = ((count - 1) * 1000) / elapsed,
        target = settings().fps,
        previous = level;
      samples.push({ milliseconds: now, fps, target, level, submitMs });
      if (samples.length > MAX_DIAGNOSTIC_WINDOWS) samples.shift();
      if (fps < target * 0.65) {
        if (level === 'high') level = 'medium';
        else if (level === 'medium') level = 'low';
        else if (++weak >= 2) level = 'static';
      } else weak = 0;
      start = now;
      count = 0;
      return level === previous
        ? null
        : { from: previous, to: level, fps, target };
    },
  };
}
