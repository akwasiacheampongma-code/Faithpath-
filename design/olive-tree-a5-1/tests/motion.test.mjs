import test from 'node:test';
import assert from 'node:assert/strict';
const old = Boolean(process.env.A51_RED_BASELINE);
const M = await import(
  old ? '../reference/a5/motion-model.js' : '../motion-model.js'
);
const stage = M.STAGES[6];
const outer = [
    [300, 150],
    [130, 710],
    [1120, 500],
  ],
  inner = [
    [330, 450],
    [930, 350],
    [700, 400],
  ];
function delta(point, ms, s = stage, width = 200) {
  if (!old) return M.sampleDisplacement(...point, ms, s, width);
  const p = M.offset(
    point,
    M.weightsAt(...point, s),
    M.windPose(ms, s.index),
    M.motionGain(width, s),
  );
  return p.map((v, i) => ((v - point[i]) * width) / 1254);
}
function maximum(points, s = stage) {
  let maximum = 0;
  for (let ms = 0; ms <= 120000; ms += 250)
    for (const p of points)
      maximum = Math.max(maximum, Math.hypot(...delta(p, ms, s)));
  return maximum;
}
test('mature outer leaves reach a visible 5–7 CSS-pixel local excursion', () => {
  const max = maximum(outer);
  assert(max >= 5 && max <= 7.4, 'Outer leaf excursion ' + max + ' CSSpx');
});
test('inner leaves have their own 2–4 CSS-pixel movement instead of following the outer crown', () => {
  const max = maximum(inner);
  assert(max >= 2 && max <= 4.3, 'Inner leaf excursion ' + max + ' CSSpx');
  const a = delta(outer[0], 10000),
    b = delta(inner[0], 10000);
  assert(Math.hypot(a[0] - b[0], a[1] - b[1]) > 0.2);
});
test('wind remains active at 10,30,120 seconds and returns smoothly rather than jumping', () => {
  for (const ms of [10000, 30000, 120000])
    assert(
      outer.some((p) => Math.hypot(...delta(p, ms)) > 0.2),
      'Stopped at ' + ms,
    );
  for (let ms = 0; ms < 120000; ms += 137) {
    const a = delta(outer[1], ms),
      b = delta(outer[1], ms + 16);
    assert(Math.hypot(a[0] - b[0], a[1] - b[1]) < 0.2);
  }
});
test('the seed never moves spatially and younger crowns respond more gently', () => {
  for (const ms of [0, 10000, 30000, 120000])
    assert.deepEqual(delta([650, 1000], ms, M.STAGES[0]), [0, 0]);
  assert(maximum(outer, M.STAGES[2]) < 4.5);
});
if (!old) {
  test('registered wood axes and roots remain exactly still at every stage', () => {
    for (const s of M.STAGES)
      for (const p of s.probes)
        for (const ms of [10000, 30000, 120000])
          assert.deepEqual(delta(p, ms, s), [0, 0], s.name + ' ' + p);
  });
  test('stronger local wind does not fold the shared mesh in any quality or stage', () => {
    for (const s of M.STAGES)
      for (const cells of [48, 64, 80]) {
        const mesh = M.createMesh(s, cells);
        for (let ms = 0; ms <= 120000; ms += 1700) {
          const pose = M.windPose(ms, s.index),
            points = mesh.points.map((p, i) =>
              M.project(p, mesh.weights[i], pose, s, 200),
            );
          for (let i = 0; i < mesh.indices.length; i += 3) {
            const a = points[mesh.indices[i]],
              b = points[mesh.indices[i + 1]],
              c = points[mesh.indices[i + 2]];
            const area =
              (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
            assert(
              area > 0,
              s.name + ' folded at ' + ms + '/' + cells + ' area ' + area,
            );
          }
        }
      }
  });
}
