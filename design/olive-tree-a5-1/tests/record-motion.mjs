/** Real browser screencast, not replayed screenshots. Encoding FPS ≠ device FPS. */
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'),
  temporary = await fs.mkdtemp(path.join(os.tmpdir(), 'faithpath-a51-video-'));
const registry = JSON.parse(
    await fs.readFile(
      path.resolve(root, '../../node_modules/playwright-core/browsers.json'),
      'utf8',
    ),
  ),
  revision = registry.browsers.find((x) => x.name === 'ffmpeg').revision;
await fs.mkdir(path.join(temporary, 'ffmpeg-' + revision));
await fs.symlink(
  '/usr/bin/ffmpeg',
  path.join(temporary, 'ffmpeg-' + revision, 'ffmpeg-linux'),
);
process.env.PLAYWRIGHT_BROWSERS_PATH = temporary;
const { chromium } = await import('playwright'),
  browser = await chromium.launch({
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox'],
  });
const report = {
  method:
    'Actual Playwright Chromium browser recording. No screenshot replay. Comparison uses preserved A5 wind model and corrected A51 renderer on both sides, same approved A4 image, theme and CSS size.',
  encodingFPS: 25,
  notPhysicalDeviceFPS: true,
  physicalIPhone: 'OPEN',
  recordings: [],
};
const run = (args) => {
  const result = spawnSync('/usr/bin/ffmpeg', args, { encoding: 'utf8' });
  if (result.status !== 0) throw Error(result.stderr);
};
try {
  for (const item of [
    {
      name: 'A5_A51_VERGLEICH_35s',
      width: 800,
      height: 620,
      query: '?view=compare&capture=1&theme=paper',
      selector: '.capture-shell',
      seconds: 35,
    },
    {
      name: 'SIEBEN_STUFEN_UND_UEBERGAENGE',
      width: 390,
      height: 844,
      query: '?capture=1&theme=paper&context=detail&stage=0',
      seconds: 35,
    },
  ]) {
    const context = await browser.newContext({
        viewport: { width: item.width, height: item.height },
        deviceScaleFactor: 1,
        recordVideo: {
          dir: path.join(temporary, item.name),
          size: { width: item.width, height: item.height },
        },
      }),
      page = await context.newPage();
    await page.goto('http://127.0.0.1:4751/' + item.query);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => window.OLIVE_A51);
    let startTime;
    if (item.selector) {
      await page.evaluate(() =>
        Promise.all([OLIVE_A51.old.ready, OLIVE_A51.next.ready]),
      );
      await page.evaluate(() => {
        OLIVE_A51.old.play();
        OLIVE_A51.next.play();
      });
      startTime = performance.now();
      await page.waitForTimeout(item.seconds * 1000);
    } else {
      await page.locator('#live-tree').scrollIntoViewIfNeeded();
      await page.evaluate(() => OLIVE_A51.live.ready);
      startTime = performance.now();
      for (let index = 0; index < 7; index++) {
        await page.locator('#live-tree').scrollIntoViewIfNeeded();
        await page.evaluate((i) => OLIVE_A51.setStage(i), index);
        await page.locator('#live-tree').scrollIntoViewIfNeeded();
        await page.waitForTimeout(5000);
      }
    }
    const observedSeconds = (performance.now() - startTime) / 1000;
    const state = await page.evaluate(() => {
      const a = OLIVE_A51;
      return a.next
        ? { old: a.old.metrics, new: a.next.metrics }
        : { live: a.live.metrics };
    });
    for (const m of Object.values(state))
      if (!m.running)
        throw Error(
          'Expected running real motion at recording end: ' + m.reason,
        );
    const clip = item.selector
      ? await page.locator(item.selector).boundingBox()
      : { x: 0, y: 0, width: item.width, height: item.height };
    await page.screenshot({
      path: path.join(root, 'evidence/screenshots', item.name + '-poster.png'),
    });
    const source = await page.video().path();
    await context.close();
    const crop = [
      Math.floor(Math.min(clip.width, item.width) / 2) * 2,
      Math.floor(Math.min(clip.height, item.height) / 2) * 2,
      Math.floor(clip.x),
      Math.floor(clip.y),
    ];
    run([
      '-y',
      '-i',
      source,
      '-vf',
      'crop=' + crop.join(':'),
      '-c:v',
      'libx264',
      '-preset',
      'medium',
      '-crf',
      '16',
      '-pix_fmt',
      'yuv420p',
      path.join(temporary, 'encoded.mp4'),
    ]);
    run([
      '-y',
      '-i',
      path.join(temporary, 'encoded.mp4'),
      '-c',
      'copy',
      '-bsf:v',
      'h264_metadata=video_full_range_flag=1',
      '-color_range',
      'pc',
      '-movflags',
      '+faststart',
      path.join(root, 'evidence', item.name + '.mp4'),
    ]);
    report.recordings.push({
      file: item.name + '.mp4',
      actualObservedSeconds: observedSeconds,
      viewport: [item.width, item.height],
      crop,
      ending: Object.fromEntries(
        Object.entries(state).map(([key, m]) => [
          key,
          {
            running: m.running,
            quality: m.quality,
            frames: m.frames,
            activeMs: m.activeMs,
          },
        ]),
      ),
      colorRange:
        'full/pc SPS metadata corrected only; image colours not retouched',
    });
    console.log('Recorded', item.name);
  }
} finally {
  await browser.close();
  await fs.rm(temporary, { recursive: true, force: true });
  await fs.writeFile(
    path.join(root, 'evidence/motion-capture.json'),
    JSON.stringify(report, null, 2) + '\n',
  );
}
