/** Anatomical axes in the actual1254px illustrations. Radii are motion-free;
 * the wide surrounding falloff lets larger leaf motion remain invertible. */
import { STUDY } from './stage-data.js';
import { SIZE, ANCHOR } from './config.js';
const a4Wood = [
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
const axes = [
  [],
  [
    [
      22,
      [
        [650, 1070],
        [710, 900],
        [680, 760],
        [650, 620],
        [650, 400],
      ],
    ],
  ],
  [
    [
      42,
      [
        [650, 1100],
        [690, 960],
        [620, 820],
        [550, 680],
        [530, 550],
        [480, 380],
        [500, 200],
      ],
    ],
    [
      26,
      [
        [660, 920],
        [820, 850],
        [900, 750],
        [920, 600],
      ],
    ],
    [
      24,
      [
        [560, 680],
        [450, 640],
        [330, 550],
      ],
    ],
    [
      24,
      [
        [600, 780],
        [650, 600],
        [700, 480],
      ],
    ],
  ],
  [
    [
      55,
      [
        [650, 1100],
        [700, 980],
        [650, 850],
        [550, 730],
        [530, 600],
        [480, 450],
        [480, 250],
      ],
    ],
    [
      32,
      [
        [680, 920],
        [830, 880],
        [940, 820],
        [1000, 700],
        [1040, 540],
      ],
    ],
    [
      30,
      [
        [560, 730],
        [390, 650],
        [250, 600],
      ],
    ],
    [
      26,
      [
        [550, 730],
        [650, 550],
        [710, 450],
      ],
    ],
  ],
  [
    [
      65,
      [
        [650, 1100],
        [630, 970],
        [670, 850],
        [580, 740],
        [480, 640],
        [440, 520],
        [420, 400],
        [430, 280],
      ],
    ],
    [
      40,
      [
        [650, 850],
        [810, 790],
        [920, 750],
        [1000, 690],
        [1030, 550],
      ],
    ],
    [
      32,
      [
        [490, 640],
        [330, 560],
        [180, 600],
      ],
    ],
    [
      28,
      [
        [500, 640],
        [600, 470],
        [620, 350],
      ],
    ],
  ],
  [
    [
      65,
      [
        [650, 1100],
        [660, 980],
        [640, 850],
        [550, 750],
        [480, 620],
        [460, 470],
        [420, 340],
        [400, 230],
      ],
    ],
    [
      40,
      [
        [640, 850],
        [820, 790],
        [930, 760],
        [970, 650],
        [1040, 550],
      ],
    ],
    [
      30,
      [
        [510, 650],
        [350, 560],
        [200, 600],
      ],
    ],
    [
      28,
      [
        [580, 720],
        [610, 540],
        [600, 380],
        [680, 300],
      ],
    ],
  ],
  a4Wood,
];
const crownRegions = [
  [300, 150, 260, 250],
  [130, 710, 260, 290],
  [1120, 500, 230, 340],
  [590, 300, 290, 260],
  [330, 450, 260, 250],
  [930, 350, 270, 260],
];
const sproutRegions = [
  [460, 430, 210, 240],
  [420, 660, 210, 170],
  [930, 790, 200, 180],
  [850, 490, 210, 190],
  [650, 410, 150, 170],
  [650, 670, 170, 170],
];
const probes = [
  [[650, 1100]],
  [
    [650, 1070],
    [710, 900],
    [680, 760],
    [650, 620],
  ],
  [
    [650, 1100],
    [690, 960],
    [620, 820],
    [550, 680],
    [480, 380],
    [820, 850],
  ],
  [
    [650, 1100],
    [700, 980],
    [650, 850],
    [550, 730],
    [480, 450],
    [830, 880],
  ],
  [
    [650, 1100],
    [630, 970],
    [670, 850],
    [580, 740],
    [440, 520],
    [810, 790],
  ],
  [
    [650, 1100],
    [660, 980],
    [640, 850],
    [550, 750],
    [460, 470],
    [820, 790],
  ],
  [
    [650, 1100],
    [650, 980],
    [670, 855],
    [532, 658],
    [437, 413],
    [815, 795],
    [950, 680],
    [425, 300],
  ],
];
export const STAGES = STUDY.stages.map((stage) => ({
  ...stage,
  wood: axes[stage.index],
  probes: probes[stage.index],
  regions:
    stage.index === 0
      ? Array.from({ length: 6 }, () => [650, 1000, 500, 270])
      : stage.index === 1
        ? sproutRegions
        : crownRegions,
  falloff: stage.index === 1 ? 85 : 110,
  fade: stage.index === 0 ? [1160, 1210] : [900, 970],
}));
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export function smooth(x) {
  const t = clamp(x);
  return t * t * (3 - 2 * t);
}
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
        smooth(
          (distance(x, y, points[i - 1], points[i]) - radius) / stage.falloff,
        ),
      );
  const weights = stage.regions.map(
      ([cx, cy, rx, ry]) =>
        guard * smooth(1 - ((x - cx) / rx) ** 2 - ((y - cy) / ry) ** 2),
    ),
    sum = weights.reduce((a, b) => a + b, 0);
  return sum > 1 ? weights.map((v) => v / sum) : weights;
}
export const artPoint = (point, stage) =>
  point.map((v, i) => (v - ANCHOR[i]) * stage.art.scale + ANCHOR[i]);
export function meshFor(stage, cells = 80, weightFunction = weightsAt) {
  const points = [],
    weights = [],
    indices = [];
  for (let y = 0; y <= cells; y++)
    for (let x = 0; x <= cells; x++) {
      const p = [
        Math.round((x / cells) * SIZE),
        Math.round((y / cells) * SIZE),
      ];
      points.push(p);
      weights.push(weightFunction(...p, stage));
    }
  for (let y = 0; y < cells; y++)
    for (let x = 0; x < cells; x++) {
      const a = y * (cells + 1) + x,
        b = a + 1,
        c = a + cells + 1,
        d = c + 1;
      indices.push(a, b, c, b, d, c);
    }
  return { points, weights, indices, cells };
}
