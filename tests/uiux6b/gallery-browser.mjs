/** Verify the delivery gallery, not a substitute for real-app browser tests. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const url = process.env.QA_GALLERY_URL || 'http://127.0.0.1:4494';
const out = 'reports/uiux6b/evidence/gallery-browser.json';
const browser = await chromium.launch({executablePath: '/usr/bin/chromium', args: ['--no-sandbox']});
const page = await browser.newPage({viewport: {width: 1500, height: 1320}});
const errors = [], results = [];
page.on('pageerror', e => errors.push(e.message));
page.on('response', r => {if (r.status() >= 400) errors.push(r.status() + ' ' + r.url())});
try {
  await page.goto(url);
  const screens = await page.locator('#screen option').evaluateAll(es => es.map(e => e.value));
  assert.equal(screens.length, 26);
  for (const screen of screens) {
    await page.selectOption('#screen', screen);
    await page.waitForFunction(() => [...document.querySelectorAll('.grid img')].filter(e => !e.hidden).every(e => e.complete && e.naturalWidth));
    results.push({screen, status: 'PASS'});
  }
  for (const theme of ['light', 'atmospheric', 'paper', 'night']) {
    await page.selectOption('#screen', 'reader');
    await page.selectOption('#theme', theme);
    await page.selectOption('#width', '320');
    await page.selectOption('#font', '200');
    await page.waitForFunction(() => document.querySelector('#after').complete && document.querySelector('#after').naturalWidth === 320);
    results.push({theme, width: 320, font: 200, status: 'PASS'});
  }
  await page.selectOption('#screen', 'today');
  await page.selectOption('#theme', 'light');
  await page.selectOption('#width', '390');
  await page.selectOption('#font', '100');
  await page.waitForFunction(() => [...document.querySelectorAll('.grid img')].every(e => e.complete && e.naturalWidth));
  fs.mkdirSync('/workspace/shared/downloads', {recursive: true});
  await page.screenshot({path: '/workspace/shared/downloads/FaithPath_UIUX6B_Vergleich.png', fullPage: true});
  assert.equal(await page.locator('#all a').count(), 432);
  assert.deepEqual(errors, []);
} catch (error) {
  results.push({status: 'FAIL', error: error.stack});
} finally {
  await browser.close();
}
fs.writeFileSync(out, JSON.stringify({results, errors, method: 'Local HTTP, real Chromium', directFileOpening: 'OFFEN; ERR_BLOCKED_BY_ADMINISTRATOR in this environment, no bypass attempted'}, null, 2));
console.log(JSON.stringify({cases: results.length, errors}));
process.exitCode = results.some(r => r.status !== 'PASS') || errors.length ? 1 : 0;
