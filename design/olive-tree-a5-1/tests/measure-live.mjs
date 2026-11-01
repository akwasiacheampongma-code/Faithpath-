/** Serial, real elapsed-time observation. No seek/inspect and no video overhead.
 * WebGL submissions and CDP counters are NOT physical display/GPU energy data. */
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const percentile = (xs, q) =>
  xs.slice().sort((a, b) => a - b)[
    Math.min(xs.length - 1, Math.floor(q * (xs.length - 1)))
  ];
const report = {
  timestamp: new Date().toISOString(),
  scope:
    'Linux headless Chromium / ANGLE SwiftShader software. Serial single scene. Actual elapsed time, not inspected poses. No physical Safari, iPhone, battery, temperature or display presentation measurement.',
  cases: [],
};
for (const item of [
  {
    name: 'A5.1-280-120s',
    origin: 4751,
    size: 280,
    seconds: 120,
    candidate: true,
  },
  {
    name: 'A5.1-200-30s',
    origin: 4751,
    size: 200,
    seconds: 30,
    candidate: true,
  },
  {
    name: 'A5-280-30s',
    origin: 4750,
    size: 280,
    seconds: 30,
    candidate: false,
  },
]) {
  const browser = await chromium.launch({
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox'],
  });
  try {
    const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 2,
      }),
      page = await context.newPage(),
      cdp = await context.newCDPSession(page),
      system = await browser.newBrowserCDPSession();
    report.browser = browser.version();
    await cdp.send('Performance.enable');
    const counters = async () =>
      Object.fromEntries(
        (await cdp.send('Performance.getMetrics')).metrics.map((x) => [
          x.name,
          x.value,
        ]),
      );
    const processes = async () =>
      (await system.send('SystemInfo.getProcessInfo')).processInfo;
    const api = item.candidate ? 'scene' : 'OLIVE_A5.live';
    await page.goto(
      `http://127.0.0.1:${item.origin}/` +
        (item.candidate
          ? `tests/fixture.html?width=${item.size}`
          : `?capture=1&size=${item.size}`),
    );
    await page.waitForFunction(
      (api) =>
        'scene' === api ? Boolean(window.scene) : Boolean(window.OLIVE_A5),
      api,
    );
    if (!item.candidate)
      await page.locator('#live-tree').scrollIntoViewIfNeeded();
    assert(
      await page.evaluate(
        (api) => (api === 'scene' ? window.scene : window.OLIVE_A5.live).ready,
        api,
      ),
    );
    await page.waitForTimeout(1300);
    const get = () =>
      page.evaluate(
        (api) =>
          (api === 'scene' ? window.scene : window.OLIVE_A5.live).metrics,
        api,
      );
    const before = await counters(),
      cpuBefore = await processes(),
      first = await get(),
      started = performance.now(),
      checkpoints = [];
    for (const seconds of item.seconds === 120 ? [10, 30, 120] : [10, 30]) {
      await page.waitForTimeout(
        Math.max(0, seconds * 1000 - (performance.now() - started)),
      );
      const m = await get();
      assert(m.running && !m.reduced);
      assert(m.frames > first.frames);
      const selector = item.candidate ? '#tree' : '#live-tree';
      await page
        .locator(selector)
        .screenshot({
          path: path.join(
            root,
            'evidence/screenshots',
            `${item.name}-${seconds}s.png`,
          ),
        });
      checkpoints.push({
        seconds,
        observedMs: performance.now() - started,
        frames: m.frames - first.frames,
        activeMs: m.activeMs,
        running: m.running,
        quality: m.quality,
      });
      console.log(
        item.name,
        seconds,
        'seconds',
        m.frames - first.frames,
        'submissions',
      );
    }
    const elapsed = (performance.now() - started) / 1000,
      last = await get(),
      after = await counters(),
      cpuAfter = await processes();
    const recent = last.renderTimes.filter((t) => t > first.renderTimes.at(-1)),
      intervals = recent.slice(1).map((t, i) => t - recent[i]);
    const result = {
      ...item,
      elapsedSeconds: elapsed,
      checkpoints,
      frames: last.frames - first.frames,
      submittedFramesPerSecond: (last.frames - first.frames) / elapsed,
      frameIntervalsMs: {
        p50: percentile(intervals, 0.5),
        p95: percentile(intervals, 0.95),
      },
      jsSubmissionMs: {
        p50: percentile(last.submitTimes, 0.5),
        p95: percentile(last.submitTimes, 0.95),
      },
      taskSeconds: after.TaskDuration - before.TaskDuration,
      scriptSeconds: after.ScriptDuration - before.ScriptDuration,
      heapBytes: { before: before.JSHeapUsedSize, after: after.JSHeapUsedSize },
      processCPU: cpuAfter
        .map((p) => {
          const b = cpuBefore.find((x) => x.id === p.id);
          return b ? { type: p.type, cpuSeconds: p.cpuTime - b.cpuTime } : null;
        })
        .filter(Boolean),
      quality: last.quality,
      changes: last.qualityChanges,
      framebuffer: last.framebuffer ?? last.resolution,
      updatedArea: last.updatedArea,
      asset: last.variant ?? null,
    };
    // Actual IntersectionObserver pause, not an inspect pose or synthetic state.
    await page.evaluate((api) => {
      const root =
        api === 'scene'
          ? document.querySelector('#tree')
          : document.querySelector('#live-tree');
      root.style.marginTop = '2400px';
    }, api);
    await page.waitForFunction(
      (api) =>
        !(api === 'scene' ? window.scene : window.OLIVE_A5.live).metrics
          .visible,
      api,
    );
    await page.waitForTimeout(100);
    const idleFirst = await get(),
      idleCPU = await processes();
    await page.waitForTimeout(4000);
    const idleLast = await get(),
      idleEnd = await processes();
    result.offscreen = {
      framesAdded: idleLast.frames - idleFirst.frames,
      rafPending: idleLast.rafPending,
      processCPU: idleEnd
        .map((p) => {
          const b = idleCPU.find((x) => x.id === p.id);
          return b ? { type: p.type, cpuSeconds: p.cpuTime - b.cpuTime } : null;
        })
        .filter(Boolean),
    };
    assert.equal(result.offscreen.framesAdded, 0);
    assert.equal(result.offscreen.rafPending, false);
    await page.evaluate(
      (api) =>
        (api === 'scene' ? window.scene : window.OLIVE_A5.live).dispose(),
      api,
    );
    report.cases.push(result);
    await fs.writeFile(
      path.join(root, 'evidence/performance-live.json'),
      JSON.stringify(report, null, 2) + '\n',
    );
  } finally {
    await browser.close();
  }
}
