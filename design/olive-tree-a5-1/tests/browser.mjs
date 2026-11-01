/** Component, compositor, failure and responsive evidence. No physical iOS claim. */
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { chromium } from 'playwright';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'),
  origin = process.env.A51_ORIGIN || 'http://127.0.0.1:4751';
const browser = await chromium.launch({
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox'],
  }),
  context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  }),
  page = await context.newPage();
page.setDefaultTimeout(9000);
const result = {
    study: 'FP-DESIGN-20261101-A51-FINAL-LIVING-TREE',
    timestamp: new Date().toISOString(),
    browser: browser.version(),
    environment: 'Chromium / ANGLE SwiftShader software',
    physicalIPhone: 'OPEN',
    cases: [],
    screenshots: [],
  },
  errors = [],
  external = [],
  requests = [];
page.on('pageerror', (error) => errors.push(error.message));
page.on('request', (request) => requests.push(request.url()));
await page.route('**/*', (route) => {
  const url = route.request().url();
  if (!url.startsWith(origin) && !url.startsWith('data:')) {
    external.push(url);
    return route.abort();
  }
  return route.continue();
});
async function check(name, fn) {
  if (process.env.A51_CASE && !new RegExp(process.env.A51_CASE).test(name))
    return;
  try {
    result.cases.push({ name, status: 'PASS', detail: await fn() });
  } catch (error) {
    result.cases.push({ name, status: 'FAIL', error: error.message });
  }
  console.log(result.cases.at(-1).status, name);
  await fs.writeFile(
    path.join(
      root,
      process.env.A51_CASE
        ? 'evidence/browser-focused.json'
        : 'evidence/browser.json',
    ),
    JSON.stringify(result, null, 2) + '\n',
  );
}
async function fixture(query = '?paused=1') {
  await page.goto(origin + '/tests/fixture.html' + query);
  await page.waitForFunction(() => window.scene);
  if (!query.includes('hidden')) assert(await page.evaluate(() => scene.ready));
}
async function gallery(query = '?capture=1&paused=1') {
  await page.goto(origin + '/' + query);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => window.OLIVE_A51);
  if (!query.includes('view=family') && !query.includes('view=compare')) {
    await page.locator('#live-tree').scrollIntoViewIfNeeded();
    assert(await page.evaluate(() => OLIVE_A51.live.ready));
  }
}
async function shot(name, selector = null) {
  const options = {
    path: path.join(root, 'evidence/screenshots', name + '.png'),
  };
  if (selector) await page.locator(selector).screenshot(options);
  else await page.screenshot({ ...options, fullPage: true });
  result.screenshots.push(name + '.png');
}
async function stable() {
  await page.waitForTimeout(100);
  const a = await page.evaluate(() => scene.metrics);
  await page.waitForTimeout(400);
  const b = await page.evaluate(() => scene.metrics);
  assert.equal(b.frames, a.frames);
  assert.equal(b.rafPending, false);
  assert.equal(b.transition.active, false);
  return { framesAdded: (b.frames || 0) - (a.frames || 0), reason: b.reason };
}
try {
  await check(
    'A5 rectangle regression: hidden paused startup allocates no tiny canvas and displays the full image when shown',
    async () => {
      requests.length = 0;
      await fixture('?hidden=1&paused=1');
      await page.waitForTimeout(180);
      const hidden = await page.evaluate(() => scene.metrics);
      assert.equal(hidden.loading, false);
      assert.equal(hidden.framebuffer, undefined);
      assert.equal(
        requests.filter((u) => u.includes('/assets/runtime/')).length,
        0,
      );
      await page.evaluate(
        () => (document.querySelector('#tree').hidden = false),
      );
      assert(await page.evaluate(() => scene.ready));
      const shown = await page.evaluate(() => scene.metrics);
      assert(shown.framebuffer >= 280);
      assert.equal(shown.running, false);
      await shot('rectangle-fixed-paused', '#tree');
      return {
        hidden: {
          ready: hidden.ready,
          framebuffer: hidden.framebuffer ?? null,
        },
        shown: {
          framebuffer: shown.framebuffer,
          cssWidth: shown.cssWidth,
          running: shown.running,
        },
      };
    },
  );
  await check(
    'Paused scenes resize correctly after hidden width changes',
    async () => {
      await fixture('?paused=1&width=200');
      await page.evaluate(
        () => (document.querySelector('#tree').hidden = true),
      );
      await page.waitForTimeout(120);
      await page.evaluate(() => {
        const t = document.querySelector('#tree');
        t.style.width = '280px';
        t.hidden = false;
      });
      await page.waitForFunction(
        () => scene.metrics.visible && scene.metrics.cssWidth === 280,
      );
      assert((await page.evaluate(() => scene.metrics)).framebuffer >= 280);
      return await stable();
    },
  );
  await check(
    'Only one responsive file of the visible stage is requested, no masters or QA media',
    async () => {
      requests.length = 0;
      await fixture('?paused=1');
      const images = requests.filter((u) => u.includes('/assets/'));
      assert.equal(images.length, 1, JSON.stringify(images));
      assert(images[0].includes('/assets/runtime/stage-7-640-'));
      assert(!requests.some((u) => /masters|\.mp4/.test(u)));
      return { images };
    },
  );
  await check(
    'All seven stages: partial redraw equals complete redraw at three qualities and strong poses',
    async () => {
      await fixture();
      const rows = [];
      for (let index = 0; index < 7; index++) {
        assert(await page.evaluate((i) => scene.setStage(i), index));
        const row = await page.evaluate(() => {
          const rows = [];
          for (const settings of [
            { cells: 80, dpr: 1.5 },
            { cells: 64, dpr: 1.1 },
            { cells: 48, dpr: 1 },
          ]) {
            scene.pause();
            scene.renderer.setQuality(settings);
            for (const ms of [0, 10000, 30000, 120000, 37000]) {
              const pose = fixture.windPose(ms, scene.stage.index);
              scene.renderer.draw(pose);
              const a = scene.renderer.pixels();
              scene.renderer.draw(pose, { full: true });
              const b = scene.renderer.pixels();
              let max = 0;
              for (let i = 0; i < a.length; i++)
                max = Math.max(max, Math.abs(a[i] - b[i]));
              rows.push({
                cells: settings.cells,
                framebuffer: scene.renderer.metrics.framebuffer,
                ms,
                max,
              });
            }
          }
          return rows;
        });
        assert(
          row.every((x) => x.max === 0),
          JSON.stringify({ index, row }),
        );
        rows.push({ index, poses: row });
      }
      return rows;
    },
  );
  await check(
    'Actual rendered protected wood patches stay unchanged through strong wind',
    async () => {
      await fixture();
      const rows = [];
      for (let index = 0; index < 7; index++) {
        await page.evaluate((i) => scene.setStage(i), index);
        const row = await page.evaluate(async () => {
          const { artPoint } = await import('../geometry.js'),
            { SIZE, PAD_CSS } = await import('../config.js');
          scene.inspect(10000);
          const a = scene.renderer.pixels(),
            m = scene.renderer.metrics;
          scene.inspect(30000);
          const b = scene.renderer.pixels();
          const width = m.cssWidth,
            pad = (PAD_CSS * SIZE) / width,
            factor = m.framebuffer / (SIZE + 2 * pad);
          let max = 0,
            alphaMax = 0,
            opaque = 0;
          for (const p of scene.stage.probes) {
            const point = artPoint(p, scene.stage),
              x = Math.round((point[0] + pad) * factor),
              y = Math.round((point[1] + pad) * factor);
            for (let dy = -1; dy <= 1; dy++)
              for (let dx = -1; dx <= 1; dx++) {
                const k =
                  ((m.framebuffer - 1 - y - dy) * m.framebuffer + x + dx) * 4;
                if (a[k + 3] > 128) opaque++;
                alphaMax = Math.max(alphaMax, Math.abs(a[k + 3] - b[k + 3]));
                for (let n = 0; n < 4; n++)
                  max = Math.max(max, Math.abs(a[k + n] - b[k + n]));
              }
          }
          return { max, alphaMax, opaque };
        });
        rows.push({ index, ...row });
      }
      assert(
        rows.every((r) => (r.index === 0 ? r.alphaMax === 0 : r.max === 0)),
        JSON.stringify(rows),
      );
      assert(
        rows.every((r) => r.opaque > 0),
        JSON.stringify(rows),
      );
      return rows;
    },
  );
  await check(
    'A5 rectangle cannot hide in readPixels: resting compositor screenshots match the complete fallback',
    async () => {
      await fixture();
      const pairs = [];
      for (let index = 0; index < 7; index++) {
        await page.evaluate((i) => scene.setStage(i), index);
        await page.evaluate(() => {
          scene.pause();
          scene.renderer.draw(fixture.restPose(), { full: true });
        });
        const a = path.join(
            root,
            'evidence/screenshots',
            `pixel-${index}-gl.png`,
          ),
          b = path.join(
            root,
            'evidence/screenshots',
            `pixel-${index}-fallback.png`,
          );
        await page.locator('.tree-art-window').screenshot({ path: a });
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.waitForFunction(() => scene.metrics.reduced);
        await page.locator('.tree-art-window').screenshot({ path: b });
        pairs.push({ index, a, b });
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        await page.waitForFunction(() => !scene.metrics.reduced);
      }
      const script =
        "import json,sys\nfrom PIL import Image,ImageChops,ImageStat\nrows=[]\nfor p in json.load(sys.stdin):\n a=Image.open(p['a']).convert('RGB');b=Image.open(p['b']).convert('RGB');d=ImageChops.difference(a,b);s=ImageStat.Stat(d);small=ImageChops.difference(a.resize((100,100),Image.Resampling.LANCZOS),b.resize((100,100),Image.Resampling.LANCZOS));rows.append({'index':p['index'],'mae':sum(s.mean)/3,'coarseMAE':sum(ImageStat.Stat(small).mean)/3,'maximum':max(v[1] for v in d.getextrema())})\nprint(json.dumps(rows))";
      const run = spawnSync('python3', ['-c', script], {
        input: JSON.stringify(pairs),
        encoding: 'utf8',
      });
      assert.equal(run.status, 0, run.stderr);
      const rows = JSON.parse(run.stdout);
      assert(
        rows.every((r) => r.mae < 5 && r.coarseMAE < 1),
        JSON.stringify(rows),
      );
      await fs.writeFile(
        path.join(root, 'evidence/compositor-fidelity.json'),
        JSON.stringify(rows, null, 2) + '\n',
      );
      const bad = path.join(
        root,
        'evidence/diagnosis/A51-intentional-2px-test.png',
      );
      await page.evaluate(() => {
        const canvas = scene.renderer.gl.canvas;
        canvas.width = canvas.height = 2;
        scene.renderer.draw(fixture.restPose(), { full: true });
      });
      await page.locator('.tree-art-window').screenshot({ path: bad });
      const mutation = spawnSync('python3', ['-c', script], {
        input: JSON.stringify([{ index: 6, a: bad, b: pairs[6].b }]),
        encoding: 'utf8',
      });
      assert.equal(mutation.status, 0, mutation.stderr);
      const detected = JSON.parse(mutation.stdout)[0];
      assert(
        detected.coarseMAE > 1,
        'The compositor check must reject the known2px defect',
      );
      return { stages: rows, intentional2pxDefect: detected };
    },
  );
  await check(
    'Adjacent-stage change uses one temporary snapshot and leaves one renderer, no ghost layers',
    async () => {
      await fixture('?width=200');
      await page.evaluate(() => scene.setStage(4));
      await page.waitForTimeout(750);
      await page.evaluate(() => scene.setStage(5));
      const during = await page.evaluate(() => scene.metrics);
      assert(during.transition.active);
      assert.equal(during.transition.snapshots, 1);
      await shot('stage-transition-middle', '#tree');
      await page.waitForTimeout(750);
      const after = await page.evaluate(() => scene.metrics);
      assert.equal(after.transition.active, false);
      assert.equal(await page.locator('.tree-transition-layer').count(), 0);
      assert.equal(await page.locator('.tree-canvas').count(), 1);
      assert.equal(after.stage, 5);
      assert(after.running);
      return { during: during.transition, after: after.transition };
    },
  );
  await check(
    'Rapid requests are latest-wins and a failed next stage keeps the previous complete picture and label',
    async () => {
      await fixture();
      const index = await page.evaluate(async () => {
        await Promise.all([
          scene.setStage(0),
          scene.setStage(3),
          scene.setStage(5),
        ]);
        return scene.metrics.stage;
      });
      assert.equal(index, 5);
      await page.route('**/stage-5-*.webp', (route) => route.abort());
      assert.equal(await page.evaluate(() => scene.setStage(4)), false);
      const kept = await page.evaluate(() => scene.metrics);
      assert.equal(kept.stage, 5);
      assert.equal(kept.requestedStage, 5);
      assert(kept.error);
      await page.unroute('**/stage-5-*.webp');
      return {
        lastRequested: index,
        retainedAfterFailure: kept.stage,
        error: kept.error,
      };
    },
  );
  await check(
    'Offscreen, disabled and synthetic document-background events leave no wind or transition loop',
    async () => {
      await fixture('?width=200');
      await page.waitForFunction(() => scene.metrics.running);
      await page.evaluate(
        () => (document.querySelector('#tree').style.marginTop = '2000px'),
      );
      await page.waitForFunction(() => !scene.metrics.visible);
      const offscreen = await stable();
      await page.evaluate(
        () => (document.querySelector('#tree').style.marginTop = ''),
      );
      await page.waitForFunction(() => scene.metrics.running);
      await page.evaluate(() => scene.setEnabled(false));
      const disabled = await stable();
      await page.evaluate(() => scene.setEnabled(true));
      await page.waitForFunction(() => scene.metrics.running);
      await page.evaluate(() => {
        Object.defineProperty(document, 'hidden', {
          configurable: true,
          value: true,
        });
        document.dispatchEvent(new Event('visibilitychange'));
      });
      const hidden = await stable();
      await page.evaluate(() => {
        delete document.hidden;
        document.dispatchEvent(new Event('visibilitychange'));
      });
      await page.waitForFunction(() => scene.metrics.running);
      return {
        offscreen,
        disabled,
        hidden,
        scope:
          'Actual IntersectionObserver; background handler via injected document event, physical iOS OPEN',
      };
    },
  );
  await check(
    'Dynamic Reduced Motion cancels wind and stage changes immediately, then resumes softly',
    async () => {
      await fixture('?width=200');
      await page.evaluate(() => scene.setStage(5));
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.waitForFunction(
        () => scene.metrics.reduced && !scene.metrics.running,
      );
      const stopped = await stable();
      assert(await page.locator('.tree-fallback').isVisible());
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.waitForFunction(() => scene.metrics.running);
      return { stopped, resumed: true };
    },
  );
  await check(
    'Context loss during a running change preserves the full image and retry recreates the GPU scene',
    async () => {
      await fixture();
      await page.evaluate(() => scene.setStage(5));
      await page.evaluate(() =>
        scene.renderer.gl.getExtension('WEBGL_lose_context').loseContext(),
      );
      await page.waitForFunction(() => scene.metrics.graphicsFailed);
      const stopped = await stable();
      assert(await page.locator('.tree-fallback').isVisible());
      await page.evaluate(() => scene.retry());
      await page.waitForFunction(
        () => scene.metrics.running && !scene.metrics.graphicsFailed,
      );
      return { stopped, retried: true };
    },
  );
  await check(
    'No WebGL and a missing preferred variant retain a complete same-stage static picture',
    async () => {
      const rows = [];
      for (const kind of ['no-webgl', 'missing-preferred']) {
        const c = await browser.newContext({
          viewport: { width: 390, height: 844 },
          deviceScaleFactor: 2,
        });
        if (kind === 'no-webgl')
          await c.addInitScript(() => {
            const native = HTMLCanvasElement.prototype.getContext;
            HTMLCanvasElement.prototype.getContext = function (type, ...args) {
              return type === 'webgl' ? null : native.call(this, type, ...args);
            };
          });
        else await c.route('**/stage-7-640-*.webp', (route) => route.abort());
        const p = await c.newPage();
        await p.goto(origin + '/tests/fixture.html');
        await p.waitForFunction(() => window.scene);
        assert(await p.evaluate(() => scene.ready));
        const m = await p.evaluate(() => scene.metrics);
        if (kind === 'no-webgl') {
          assert(m.graphicsFailed && !m.running);
          assert(await p.locator('.tree-fallback').isVisible());
        } else assert(m.variant.width !== 640);
        rows.push({
          kind,
          variant: m.variant.width,
          graphicsFailed: m.graphicsFailed,
        });
        await c.close();
      }
      return rows;
    },
  );
  await check(
    'Dispose during loading cannot attach later images or restart rendering',
    async () => {
      await fixture();
      await page.route('**/stage-6-*.webp', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 350));
        await route.continue().catch(() => {});
      });
      await page.evaluate(() => {
        scene.setStage(5);
        scene.dispose();
      });
      await page.waitForTimeout(600);
      const m = await page.evaluate(() => scene.metrics);
      assert(m.disposed && !m.running && !m.rafPending);
      assert.equal(await page.locator('#tree>*').count(), 0);
      await page.unroute('**/stage-6-*.webp');
      return { disposed: m.disposed, rafPending: m.rafPending };
    },
  );
  await check(
    'GPU objects are released after normal teardown and fragment compiler failure',
    async () => {
      const rows = [];
      for (const failure of [false, true]) {
        const c = await browser.newContext({
          viewport: { width: 390, height: 844 },
        });
        await c.addInitScript((failure) => {
          const native = HTMLCanvasElement.prototype.getContext;
          window.gpuObjects = { created: 0, deleted: 0 };
          HTMLCanvasElement.prototype.getContext = function (type, ...args) {
            const gl = native.call(this, type, ...args);
            if (type !== 'webgl' || !gl || gl.tracked) return gl;
            gl.tracked = true;
            window.trackedGL = gl;
            for (const kind of ['Shader', 'Program', 'Texture', 'Buffer']) {
              const make = gl['create' + kind].bind(gl),
                drop = gl['delete' + kind].bind(gl),
                live = new Set();
              gl['create' + kind] = function (...args) {
                const object = make(...args);
                if (object) {
                  live.add(object);
                  gpuObjects.created++;
                }
                return object;
              };
              gl['delete' + kind] = function (object) {
                if (live.delete(object)) gpuObjects.deleted++;
                return drop(object);
              };
            }
            if (failure) {
              const param = gl.getShaderParameter.bind(gl);
              gl.getShaderParameter = (shader, key) =>
                key === gl.COMPILE_STATUS &&
                param(shader, gl.SHADER_TYPE) === gl.FRAGMENT_SHADER
                  ? false
                  : param(shader, key);
              gl.getShaderInfoLog = () =>
                'Intentional QA fragment compiler failure';
            }
            return gl;
          };
        }, failure);
        const p = await c.newPage();
        await p.goto(origin + '/tests/fixture.html');
        await p.waitForFunction(() => window.scene);
        await p.evaluate(() => scene.ready);
        if (failure) assert(await p.locator('.tree-fallback').isVisible());
        await p.evaluate(() => scene.dispose());
        const counts = await p.evaluate(() => ({
          ...gpuObjects,
          currentProgram:
            trackedGL.getParameter(trackedGL.CURRENT_PROGRAM) !== null,
        }));
        rows.push({ failure, ...counts });
        await c.close();
      }
      assert(
        rows.every((x) => x.created === x.deleted && !x.currentProgram),
        JSON.stringify(rows),
      );
      return rows;
    },
  );
  await check(
    'Pause wins over a delayed stage load and paused selections never start a crossfade',
    async () => {
      const rows = [];
      for (const initiallyPaused of [false, true]) {
        await fixture('?width=200' + (initiallyPaused ? '&paused=1' : ''));
        await page.route('**/stage-6-*.webp', async (route) => {
          await new Promise((r) => setTimeout(r, 250));
          await route.continue();
        });
        await page.evaluate(() => {
          window.pendingStage = scene.setStage(5);
          scene.pause();
        });
        assert(await page.evaluate(() => pendingStage));
        const m = await page.evaluate(() => scene.metrics);
        rows.push({
          initiallyPaused,
          paused: m.paused,
          transition: m.transition,
          running: m.running,
        });
        await page.unroute('**/stage-6-*.webp');
      }
      assert(
        rows.every((r) => r.paused && !r.running && !r.transition.active),
        JSON.stringify(rows),
      );
      return rows;
    },
  );
  await check(
    'Reduced Motion resumes from the actual resting picture without a displaced first frame',
    async () => {
      await fixture('?width=200&paused=1');
      await page.evaluate(() => scene.inspect(10000));
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.waitForFunction(() => scene.metrics.reduced);
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.waitForFunction(() => !scene.metrics.reduced);
      const maximum = await page.evaluate(() => {
        const a = scene.renderer.pixels();
        scene.renderer.draw(fixture.restPose(), { full: true });
        const b = scene.renderer.pixels();
        let max = 0;
        for (let i = 0; i < a.length; i++)
          max = Math.max(max, Math.abs(a[i] - b[i]));
        return max;
      });
      assert.equal(maximum, 0);
      return { restingPixelMaximum: maximum };
    },
  );
  await check(
    '224 stage layouts and128 context layouts have no overflow',
    async () => {
      const rows = [];
      await gallery();
      for (const width of [320, 375, 390, 430])
        for (const theme of ['light', 'paper', 'atmospheric', 'night'])
          for (const text of [100, 200]) {
            await page.setViewportSize({
              width,
              height:
                width === 320
                  ? 568
                  : width === 375
                    ? 667
                    : width === 390
                      ? 844
                      : 932,
            });
            await page.evaluate(
              ({ theme, text }) => {
                document.documentElement.dataset.theme = theme;
                document.documentElement.style.fontSize = text + '%';
              },
              { theme, text },
            );
            for (let index = 0; index < 7; index++) {
              await page.locator('#live-tree').scrollIntoViewIfNeeded();
              assert(await page.evaluate((i) => OLIVE_A51.setStage(i), index));
              await page.evaluate(() => OLIVE_A51.live.inspect(10000));
              const layout = await page.evaluate(() => ({
                scrollWidth: document.documentElement.scrollWidth,
                rootWidth: document.querySelector('#live-tree').clientWidth,
              }));
              assert(
                layout.scrollWidth <= width,
                JSON.stringify({ width, theme, text, index, ...layout }),
              );
              assert(layout.rootWidth >= 200);
              rows.push({ width, theme, text, index, ...layout });
              if (
                index === 6 &&
                text === 100 &&
                (width === 320 || width === 390)
              )
                await shot(`today-${width}-${theme}`);
              if (
                index === 6 &&
                text === 200 &&
                theme === 'night' &&
                (width === 320 || width === 390)
              )
                await shot(`large-${width}-night`);
            }
          }
      await gallery();
      for (const width of [320, 375, 390, 430])
        for (const theme of ['light', 'paper', 'atmospheric', 'night'])
          for (const text of [100, 200])
            for (const value of ['today', 'journey', 'detail', 'seed']) {
              await page.setViewportSize({
                width,
                height:
                  width === 320
                    ? 568
                    : width === 375
                      ? 667
                      : width === 390
                        ? 844
                        : 932,
              });
              await page.evaluate(
                ({ theme, text, value }) => {
                  document.documentElement.dataset.theme = theme;
                  document.documentElement.style.fontSize = text + '%';
                  OLIVE_A51.showContext(value);
                },
                { theme, text, value },
              );
              await page.locator('#live-tree').scrollIntoViewIfNeeded();
              assert(await page.evaluate(() => OLIVE_A51.live.ready));
              await page.evaluate(() => OLIVE_A51.live.inspect(10000));
              const scrollWidth = await page.evaluate(
                () => document.documentElement.scrollWidth,
              );
              assert(
                scrollWidth <= width,
                JSON.stringify({ width, theme, text, value, scrollWidth }),
              );
              rows.push({ context: value, width, theme, text, scrollWidth });
              if ((width === 320 || width === 390) && text === 100)
                await shot(`context-${value}-${width}-${theme}`);
            }
      return rows;
    },
  );
  await check(
    'Full gallery controls, family and comparison reflow at200percent; desktop and200px family captured',
    async () => {
      const rows = [];
      for (const width of [320, 390])
        for (const view of ['preview', 'family', 'compare']) {
          await page.setViewportSize({ width, height: 844 });
          await gallery('?view=' + view + '&paused=1');
          await page.addStyleTag({ content: 'html{font-size:200%!important}' });
          const sw = await page.evaluate(
            () => document.documentElement.scrollWidth,
          );
          assert(sw <= width, JSON.stringify({ width, view, sw }));
          rows.push({ width, view, scrollWidth: sw });
        }
      await page.setViewportSize({ width: 1600, height: 1200 });
      await gallery('?view=family');
      await page.evaluate(() =>
        Promise.all(
          [...document.querySelectorAll('.stage-card img')].map((i) => {
            i.loading = 'eager';
            return i.decode();
          }),
        ),
      );
      assert.equal(await page.locator('.stage-card').count(), 7);
      await shot('seven-stages-desktop');
      assert(
        (
          await page
            .locator('.art-frame')
            .evaluateAll((xs) => xs.map((x) => x.getBoundingClientRect().width))
        ).every((w) => w === 200),
      );
      return rows;
    },
  );
  await check(
    'Axe and keyboard on all gallery views in all four themes',
    async () => {
      const rows = [];
      await page.setViewportSize({ width: 390, height: 844 });
      for (const theme of ['light', 'paper', 'atmospheric', 'night'])
        for (const view of ['preview', 'family', 'compare']) {
          await gallery('?theme=' + theme + '&view=' + view + '&paused=1');
          await page.addScriptTag({
            path: path.resolve(root, '../../node_modules/axe-core/axe.min.js'),
          });
          const a = await page.evaluate(async () => {
            const result = await axe.run(document, {
              runOnly: {
                type: 'tag',
                values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'],
              },
            });
            return {
              violations: result.violations.map((v) => ({
                id: v.id,
                impact: v.impact,
                nodes: v.nodes.map((n) => n.target),
              })),
              incomplete: result.incomplete.map((v) => ({
                id: v.id,
                nodes: v.nodes.length,
              })),
            };
          });
          rows.push({ theme, view, ...a });
        }
      await fs.writeFile(
        path.join(root, 'evidence/axe.json'),
        JSON.stringify(rows, null, 2) + '\n',
      );
      assert(
        rows.every((r) => !r.violations.length),
        JSON.stringify(rows.filter((r) => r.violations.length)),
      );
      await gallery('?paused=1');
      await page.locator('#stage').focus();
      await page.keyboard.press('Home');
      await page.keyboard.press('ArrowDown');
      await page.locator('#live-tree').scrollIntoViewIfNeeded();
      await page.waitForFunction(() => OLIVE_A51.live.metrics.stage === 1);
      await page.locator('.meaning summary').focus();
      await page.keyboard.press('Enter');
      assert(await page.locator('.meaning').evaluate((d) => d.open));
      await page.locator('.quick-bible').focus();
      await page.keyboard.press('Enter');
      assert(await page.locator('dialog').evaluate((d) => d.open));
      await page.keyboard.press('Escape');
      assert.equal(
        await page.evaluate(() => document.activeElement.className),
        'quick-bible',
      );
      return rows;
    },
  );
  await check(
    'Untrusted gallery context parameters fall back to Today instead of prototype properties',
    async () => {
      await gallery('?capture=1&paused=1&context=toString');
      assert.equal(await page.locator('#context').inputValue(), 'today');
      assert.equal(
        await page.evaluate(() => OLIVE_A51.showContext('__proto__')),
        false,
      );
      return { invalidURL: 'today', invalidAPI: false };
    },
  );
  await check(
    'No script exceptions, external services or personal storage writes',
    async () => {
      assert.deepEqual(errors, []);
      assert.deepEqual(external, []);
      assert.equal(
        await page.evaluate(() => localStorage.length + sessionStorage.length),
        0,
      );
      return { errors, external, stored: 0 };
    },
  );
} finally {
  await browser.close();
  result.summary = {
    pass: result.cases.filter((c) => c.status === 'PASS').length,
    fail: result.cases.filter((c) => c.status === 'FAIL').length,
  };
  await fs.writeFile(
    path.join(
      root,
      process.env.A51_CASE
        ? 'evidence/browser-focused.json'
        : 'evidence/browser.json',
    ),
    JSON.stringify(result, null, 2) + '\n',
  );
  console.log(JSON.stringify(result.summary));
  if (result.summary.fail) process.exitCode = 1;
}
