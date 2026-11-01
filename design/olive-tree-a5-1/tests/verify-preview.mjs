/** Verify the actual delivered preview as HTTP files; never register a SW. */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'),
  origin = process.env.A51_VERIFY_ORIGIN || 'http://127.0.0.1:4751',
  output =
    process.env.A51_OUTPUT ||
    path.join(root, 'evidence/preview-verification.json');
const browser = await chromium.launch({
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox'],
  }),
  context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  }),
  page = await context.newPage(),
  errors = [],
  external = [],
  files = new Set();
page.on('pageerror', (error) => errors.push(error.message));
await context.route('**/*', (route) => {
  const url = route.request().url();
  if (!url.startsWith(origin) && !url.startsWith('data:')) {
    external.push(url);
    return route.abort();
  }
  return route.continue();
});
try {
  for (const file of ['START_HIER.html', 'BERICHT.html', 'index.html']) {
    assert((await page.goto(origin + '/' + file)).ok());
    await page.evaluate(() => document.fonts.ready);
    const urls = await page
      .locator(
        'a[href],img[src],video source[src],script[src],link[rel=stylesheet]',
      )
      .evaluateAll((nodes) => nodes.map((n) => n.href || n.src));
    for (const url of urls)
      if (url.startsWith(origin) && !url.includes('#')) files.add(url);
  }
  for (const url of files)
    assert(
      (await context.request.get(url)).ok(),
      'Missing delivered file ' + url,
    );
  await page.goto(origin + '/');
  await page.locator('#live-tree').scrollIntoViewIfNeeded();
  assert(await page.evaluate(() => OLIVE_A51.live.ready));
  await page
    .getByRole('button', { name: 'Sieben Stufen', exact: true })
    .click();
  await page.evaluate(() =>
    Promise.all(
      [...document.querySelectorAll('.stage-card img')].map((i) => {
        i.loading = 'eager';
        return i.decode();
      }),
    ),
  );
  assert.equal(await page.locator('.stage-card').count(), 7);
  for (const href of await page
    .locator('.stage-card>a')
    .evaluateAll((nodes) => nodes.map((n) => n.href)))
    assert((await context.request.get(href)).ok());
  await page.setViewportSize({ width: 1400, height: 1000 });
  await page.evaluate(() => OLIVE_A51.showView('compare'));
  await page.locator('.compare-pair').scrollIntoViewIfNeeded();
  assert(
    (
      await page.evaluate(() =>
        Promise.all([OLIVE_A51.old.ready, OLIVE_A51.next.ready]),
      )
    ).every(Boolean),
  );
  await page.evaluate(() => OLIVE_A51.showView('preview'));
  await page.locator('#live-tree').scrollIntoViewIfNeeded();
  assert(await page.evaluate(() => OLIVE_A51.live.ready));
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  for (const file of ['START_HIER.html', 'BERICHT.html']) {
    await page.goto(origin + '/' + file);
    await page.setViewportSize({ width: 320, height: 568 });
    await page.addStyleTag({ content: 'html{font-size:200%!important}' });
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      'Report overflow ' + file,
    );
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(external, []);
  assert.equal(
    await page.evaluate(() => localStorage.length + sessionStorage.length),
    0,
  );
  await fs.writeFile(
    output,
    JSON.stringify(
      {
        status: 'PASS',
        origin,
        localFilesChecked: files.size,
        sevenSourceLinks: true,
        allThreeGalleryViews: true,
        report200Percent: true,
        desktopWidth: 1400,
        errors,
        external,
        physicalIPhone: 'OPEN',
        scope: 'HTTP source/delivery file check, no new deployment',
      },
      null,
      2,
    ) + '\n',
  );
  console.log('Preview verified', files.size, 'local links');
} finally {
  await browser.close();
}
