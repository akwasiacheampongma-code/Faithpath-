import test from 'node:test';
import assert from 'node:assert/strict';
import { STAGES } from '../geometry.js';
import { selectVariant } from '../asset-loader.js';
import { createPerformancePolicy } from '../performance-policy.js';
test('variant selection is pure and never selects source masters or QA files', () => {
  const v = selectVariant(STAGES[6], 280, 1.5);
  assert.equal(v.width, 640);
  assert(v.src.startsWith('assets/runtime/'));
  assert(!v.src.includes('masters'));
  assert.equal(selectVariant(STAGES[0], 200, 1).width, 384);
});
test('weak delivered frames lower quality then stop without changing a stage response', () => {
  const p = createPerformancePolicy();
  p.resume(0);
  let now = 0;
  for (let i = 0; i < 200; i++) {
    now += 125;
    p.frame(now, 20);
  }
  assert.equal(p.level, 'static');
});
test('paused time cannot be counted as a slow active window', () => {
  const p = createPerformancePolicy();
  p.resume(0);
  for (let f = 1; f <= 60; f++) p.frame((f * 1000) / 30);
  p.pause();
  p.resume(120000);
  for (let f = 1; f <= 60; f++) p.frame(120000 + (f * 1000) / 30);
  assert.equal(p.level, 'high');
});
test('continuous diagnostics retain a bounded history over60000 frames', () => {
  const p = createPerformancePolicy();
  p.resume(0);
  for (let f = 1; f <= 60000; f++) p.frame((f * 1000) / 30, 0.1);
  assert(p.samples.length <= 180);
  assert.equal(p.level, 'high');
  assert(p.samples.at(-1).milliseconds > 1900000);
});
