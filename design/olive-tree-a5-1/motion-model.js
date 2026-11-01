/** Six spatial fields, CSS-pixel units, smoothly varying nonrepeating wind.
 * CPU model and shader consume the same weights/pose contract. */
import { SIZE, PAD_CSS } from './config.js';
import { STAGES, weightsAt, artPoint, meshFor, smooth } from './geometry.js';
import * as A5 from './reference/a5/motion-model.js';
export { STAGES, weightsAt, artPoint };
const hash = (n) => {
  const value = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
};
function noise(t, seed) {
  const k = Math.floor(t),
    f = smooth(t - k);
  return (2 * hash(k + seed) - 1) * (1 - f) + (2 * hash(k + seed + 1) - 1) * f;
}
function gust(t) {
  let value = 0;
  const window = Math.floor(t / 27);
  for (let k = window - 1; k <= window; k++) {
    const centre = k * 27 + 9 + hash(k + 18) * 9,
      width = 5 + hash(k + 42) * 2,
      d = Math.abs(t - centre) / width;
    if (d < 1)
      value +=
        Math.cos((d * Math.PI) / 2) ** 2 *
        (0.17 + hash(k + 4) * 0.14) *
        (hash(k + 7) > 0.5 ? 1 : -1);
  }
  return value;
}
function phase(t, index) {
  const lag = [0, 0.33, 0.58, 0.18, 0.48, 0.72][index % 6],
    s = t - lag,
    i = index + 1;
  return Math.tanh(
    1.7 *
      (0.67 * Math.sin(s / (1.85 + i * 0.13) + i * 0.63) +
        0.15 * Math.sin(s / (0.83 + i * 0.047) + i * 0.2) +
        0.18 * noise(s / (4.9 + i * 0.21), i * 19) +
        gust(s) * (index < 3 ? 1 : 0.65)),
  );
}
export function windPose(ms, index = 6) {
  const stage = STAGES[index],
    t = Math.max(0, ms) / 1000,
    response = stage.art.response,
    p = Array.from({ length: 6 }, (_, i) => phase(t, i));
  return {
    x: p.map((v, i) => v * [7.0, 7.0, 7.0, 3.45, 3.4, 3.5][i] * response),
    y: p.map(
      (_, i) =>
        phase(t - 0.42, i + 6) * [1.0, 1.15, 1.0, 0.5, 0.6, 0.55][i] * response,
    ),
    light:
      (index === 0 ? 0.009 : 0.014) *
      (0.7 * Math.sin(t / 6.3) + 0.3 * noise(t / 11, 91)),
  };
}
export const restPose = () => ({
  x: Array(6).fill(0),
  y: Array(6).fill(0),
  light: 0,
});
export function mixPose(a, b, t) {
  const f = smooth(t);
  return {
    x: a.x.map((v, i) => v * (1 - f) + b.x[i] * f),
    y: a.y.map((v, i) => v * (1 - f) + b.y[i] * f),
    light: a.light * (1 - f) + b.light * f,
  };
}
export function a5Pose(ms, width) {
  const p = A5.windPose(ms, 6),
    gain = (A5.motionGain(width, A5.STAGES[6]) * width) / SIZE;
  return {
    x: [...p.x.map((v) => v * gain), 0, 0, 0],
    y: [...p.y.map((v) => v * gain), 0, 0, 0],
    light: p.light,
  };
}
export const createMesh = (stage, cells = 80, profile = 'a51') =>
  profile === 'a5'
    ? meshFor(stage, cells, (x, y) => [
        ...A5.weightsAt(x, y, A5.STAGES[6]),
        0,
        0,
        0,
      ])
    : meshFor(stage, cells);
export function project(point, weights, pose, stage, width) {
  const a = artPoint(point, stage),
    gain = SIZE / Math.max(200, width);
  return a.map(
    (v, j) =>
      v +
      weights.reduce(
        (sum, w, i) => sum + w * pose[j === 0 ? 'x' : 'y'][i] * gain,
        0,
      ),
  );
}
export function sampleDisplacement(x, y, ms, stage, width = 200) {
  const weights = weightsAt(x, y, stage),
    pose = windPose(ms, stage.index),
    gain = Math.min(1, width / 200);
  return ['x', 'y'].map((axis) =>
    weights.reduce((sum, w, i) => sum + w * pose[axis][i] * gain, 0),
  );
}
/** Conservative full-source dirty bounds; pad covers moving vertices plus the
 * neighbouring interpolation cell. The renderer tests partial against full. */
export function dirtyBounds(stage, cells, width) {
  const x0 = Math.min(...stage.regions.map((r) => r[0] - r[2])),
    x1 = Math.max(...stage.regions.map((r) => r[0] + r[2])),
    y0 = Math.min(...stage.regions.map((r) => r[1] - r[3])),
    y1 = Math.min(
      stage.fade[1],
      Math.max(...stage.regions.map((r) => r[1] + r[3])),
    );
  const a = artPoint([x0, y0], stage),
    b = artPoint([x1, y1], stage),
    extra =
      ((9 + 1) * SIZE) / Math.max(200, width) +
      (SIZE / cells) * stage.art.scale;
  const margin = (PAD_CSS * SIZE) / Math.max(1, width);
  return {
    x: Math.max(-margin, a[0] - extra),
    y: Math.max(-margin, a[1] - extra),
    right: Math.min(SIZE + margin, b[0] + extra),
    bottom: Math.min(SIZE + margin, b[1] + extra),
  };
}
