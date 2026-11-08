/** Source-space geometry and a deterministic, nonrestarting wind field. */
import { STUDY } from './stage-data.js';
import * as A4 from './reference/a4-motion-model.js';
export const SIZE = 1254;
export const LEVELS = {
  high: { fps: 30, dpr: 1.75, cells: 72 },
  medium: { fps: 24, dpr: 1.25, cells: 56 },
  low: { fps: 18, dpr: 1, cells: 40 },
};
const matureWood = [
  [
    58,
    [
      [650, 1100],
      [650, 980],
      [635, 850],
      [580, 750],
      [520, 650],
      [480, 550],
      [450, 460],
      [435, 380],
      [425, 300],
      [440, 210],
    ],
  ],
  [
    28,
    [
      [600, 690],
      [610, 550],
      [590, 440],
      [640, 350],
      [690, 270],
    ],
  ],
  [
    35,
    [
      [520, 650],
      [400, 575],
      [300, 560],
      [200, 600],
    ],
  ],
  [
    24,
    [
      [435, 380],
      [340, 340],
      [270, 280],
    ],
  ],
  [
    40,
    [
      [640, 850],
      [800, 780],
      [930, 810],
      [940, 660],
      [1000, 540],
      [1030, 430],
    ],
  ],
  [
    26,
    [
      [940, 770],
      [910, 650],
      [890, 560],
      [850, 450],
    ],
  ],
];
const youngWood = [
  [
    48,
    [
      [650, 1100],
      [690, 960],
      [670, 860],
      [600, 760],
      [510, 670],
      [460, 550],
      [420, 400],
      [405, 240],
    ],
  ],
  [
    30,
    [
      [640, 900],
      [820, 900],
      [940, 840],
      [970, 700],
      [1000, 570],
      [1030, 500],
    ],
  ],
  [
    25,
    [
      [510, 670],
      [340, 620],
      [220, 570],
    ],
  ],
  [
    22,
    [
      [600, 760],
      [620, 610],
      [660, 500],
      [720, 430],
    ],
  ],
];
const sproutWood = [
  [
    26,
    [
      [650, 1080],
      [710, 970],
      [710, 850],
      [650, 750],
      [620, 660],
      [640, 540],
      [650, 450],
      [665, 300],
    ],
  ],
];
const standardRegions = [
  [470, 180, 270, 230],
  [210, 620, 220, 260],
  [1040, 500, 230, 340],
];
const seedRegions = [
  [650, 830, 500, 340],
  [650, 830, 500, 340],
  [650, 830, 500, 340],
];
const sproutRegions = [
  [390, 300, 280, 350],
  [920, 350, 300, 280],
  [820, 610, 270, 185],
];
const amplitudes = [0, 0.65, 0.78, 0.9, 1, 1, 1];
export const STAGES = STUDY.stages.map((s) => ({
  ...s,
  amplitude: amplitudes[s.index],
  // The seed is drawn low in its source canvas. Frame the actual subject,
  // without rescaling it or changing the shared source-space motion geometry.
  cropTop: s.index === 0 ? 480 : 0,
  regions:
    s.index === 0
      ? seedRegions
      : s.index === 1
        ? sproutRegions
        : standardRegions,
  wood:
    s.index === 0
      ? []
      : s.index === 1
        ? sproutWood
        : s.index < 4
          ? youngWood
          : matureWood,
  fade: s.index === 0 ? [1040, 1100] : [740, 810],
  probes:
    s.index === 0
      ? [[650, 1105]]
      : s.index === 1
        ? [
            [650, 1080],
            [710, 850],
            [620, 660],
            [650, 450],
          ]
        : s.index < 4
          ? [
              [650, 1100],
              [690, 960],
              [600, 760],
              [460, 550],
              [420, 400],
            ]
          : A4.STATIC_PROBES,
}));
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const smooth = (x) => {
  const t = clamp(x);
  return t * t * (3 - 2 * t);
};
function distance(x, y, a, b) {
  const dx = b[0] - a[0],
    dy = b[1] - a[1],
    t = clamp(((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy));
  return Math.hypot(x - a[0] - dx * t, y - a[1] - dy * t);
}
export function weightsAt(x, y, stage) {
  let guard = 1 - smooth((y - stage.fade[0]) / (stage.fade[1] - stage.fade[0]));
  for (const [radius, points] of stage.wood)
    for (let i = 1; i < points.length; i++)
      guard = Math.min(
        guard,
        smooth((distance(x, y, points[i - 1], points[i]) - radius) / 32),
      );
  const w = stage.regions.map(
      ([cx, cy, rx, ry]) =>
        guard * smooth(1 - ((x - cx) / rx) ** 2 - ((y - cy) / ry) ** 2),
    ),
    sum = w.reduce((a, b) => a + b, 0);
  return sum > 1 ? w.map((v) => v / sum) : w;
}
const hash = (n) => {
  const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};
function noise(t, seed) {
  const k = Math.floor(t),
    f = smooth(t - k);
  return (hash(k + seed) * (1 - f) + hash(k + seed + 1) * f) * 2 - 1;
}
function gustAt(t) {
  const k = Math.floor(t / 24);
  let gust = 0;
  for (let j = k - 1; j <= k; j++) {
    const centre = j * 24 + 7 + hash(j + 19) * 11,
      width = 4 + hash(j + 73) * 3,
      d = Math.abs(t - centre) / width;
    if (d < 1)
      gust +=
        Math.cos((d * Math.PI) / 2) ** 2 *
        (0.14 + hash(j + 6) * 0.14) *
        (hash(j + 2) > 0.5 ? 1 : -1);
  }
  return gust;
}
export function windPose(ms, index = 6) {
  const t = Math.max(0, ms) / 1000,
    g = gustAt(t),
    p = [
      0.62 * Math.sin(t / 1.7 + 0.4) +
        0.25 * noise(t / 3.11, 7) +
        0.13 * Math.sin(t / 0.59 + 0.2) +
        g,
      0.58 * Math.sin(t / 2.13 + 1.7) +
        0.3 * noise(t / 4.7, 29) +
        0.12 * Math.sin(t / 0.83) +
        g * 0.7,
      0.64 * Math.sin(t / 1.91 + 2.8) +
        0.22 * noise(t / 3.53, 51) +
        0.14 * Math.sin(t / 0.67 + 0.6) +
        g * 1.1,
    ].map((v) => clamp(v, -1, 1));
  const phase = index === 0 ? [0, 0, 0] : p;
  return {
    phase,
    x: phase.map((v, i) => v * [14, 12, 15][i]),
    y: phase.map((_, i) => phase[(i + 1) % 3] * [3.5, 4, 4.5][i]),
    light:
      (index === 0 ? 0.014 : 0.018) *
        (0.6 * Math.sin(t / 5.1) + 0.4 * noise(t / 13, 91)) +
      g * 0.01,
  };
}
export function referencePose(ms) {
  const p = A4.pose(ms);
  return {
    phase: p.phase,
    x: p.phase.map((v, i) => v * A4.CONFIG.dx[i]),
    y: p.phase.map((_, i) => p.phase[(i + 1) % 3] * A4.CONFIG.dy[i]),
    light: p.light,
  };
}
export const restPose = () => ({
  phase: [0, 0, 0],
  x: [0, 0, 0],
  y: [0, 0, 0],
  light: 0,
});
export function mixPose(a, b, t) {
  const f = smooth(t);
  return {
    phase: a.phase.map((v, i) => v * (1 - f) + b.phase[i] * f),
    x: a.x.map((v, i) => v * (1 - f) + b.x[i] * f),
    y: a.y.map((v, i) => v * (1 - f) + b.y[i] * f),
    light: a.light * (1 - f) + b.light * f,
  };
}
export const motionGain = (cssWidth, stage) =>
  (stage.amplitude * 2.4 * SIZE) / (Math.max(160, cssWidth) * 15);
export function offset(point, w, p, gain) {
  return [
    point[0] + w.reduce((s, v, i) => s + v * p.x[i] * gain, 0),
    point[1] + w.reduce((s, v, i) => s + v * p.y[i] * gain, 0),
  ];
}
export function createMesh(stage, cells = 72, reference = false) {
  const points = [],
    weights = [],
    indices = [],
    weightAt = (x, y) =>
      reference ? A4.weightsAt(x, y) : weightsAt(x, y, stage);
  for (let y = 0; y <= cells; y++)
    for (let x = 0; x <= cells; x++) {
      const p = [
        Math.round((x / cells) * SIZE),
        Math.round((y / cells) * SIZE),
      ];
      points.push(p);
      weights.push(weightAt(...p));
    }
  for (let y = 0; y < cells; y++)
    for (let x = 0; x < cells; x++) {
      const a = y * (cells + 1) + x,
        b = a + 1,
        c = a + cells + 1,
        d = c + 1;
      indices.push(a, b, c, b, d, c);
    }
  return { points, weights, indices, weightAt };
}
export function dirtyRect(stage) {
  const pad = 72,
    x0 = Math.max(
      0,
      Math.floor(Math.min(...stage.regions.map((r) => r[0] - r[2])) - pad),
    ),
    y0 = Math.max(
      0,
      Math.floor(Math.min(...stage.regions.map((r) => r[1] - r[3])) - pad),
    ),
    x1 = Math.min(
      SIZE,
      Math.ceil(Math.max(...stage.regions.map((r) => r[0] + r[2])) + pad),
    ),
    y1 = Math.min(stage.splitY, stage.fade[1] + pad);
  return { x: x0, y: y0, width: x1 - x0, height: y1 - y0 };
}
