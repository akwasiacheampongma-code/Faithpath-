/** Regression for the independent review's two writing-mode findings.
 * These are synthetic CSS insets and Chromium text enlargement, not iPhone QA. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {KEYS, empty} from '../../src/store.js';

const base = process.env.QA_URL || 'http://127.0.0.1:4482';
const out = process.env.QA_OUT || 'qa-output/uiux6b/fullscreen-red';
fs.mkdirSync(out, {recursive: true});
const browser = await chromium.launch({executablePath: '/usr/bin/chromium', args: ['--no-sandbox']});
const results = [];
for (const scenario of [
  {name: 'large-reader-editor', width: 320, height: 420, font: 200, inset: 0, route: 'read/JHN/15/otb'},
  {name: 'large-journal-editor', width: 320, height: 420, font: 200, inset: 0, route: 'journal'},
  {name: 'safe-reader-editor', width: 390, height: 844, font: 100, inset: 44, route: 'read/JHN/15/otb'},
]) {
  const context = await browser.newContext({viewport: {width: scenario.width, height: scenario.height}});
  await context.addInitScript(({KEYS, data, scenario}) => {
    localStorage.setItem(KEYS.main, JSON.stringify(data));
    localStorage.setItem(KEYS.onboard, 'done');
    document.addEventListener('DOMContentLoaded', () => {
      document.documentElement.style.fontSize = scenario.font + '%';
      document.documentElement.style.setProperty('--safe-top', scenario.inset + 'px');
    });
  }, {KEYS, data: empty(), scenario});
  const page = await context.newPage();
  let geometry;
  try {
    await page.goto(base + '/#' + scenario.route);
    await page.locator('#main h1').waitFor();
    if (scenario.route.startsWith('read/')) {
      await page.locator('.verse').last().waitFor();
      await page.getByRole('button', {name: 'Gedanken festhalten', exact: true}).click();
    } else {
      await page.locator('[data-action=new-entry]').click();
    }
    await page.locator('.writing-dialog textarea[name=text]').waitFor();
    await page.evaluate(() => document.fonts.ready);
    geometry = await page.locator('.writing-dialog').evaluate(dialog => {
      const textarea = dialog.querySelector('textarea[name=text]');
      const header = dialog.querySelector('.dialog-top');
      const save = dialog.querySelector('[type=submit]');
      const close = dialog.querySelector('.dialog-top .icon-button');
      const r = element => element.getBoundingClientRect().toJSON();
      return {header: r(header), save: r(save), close: r(close), textarea: r(textarea),
        lineHeight: parseFloat(getComputedStyle(textarea).lineHeight),
        usableLineSpace: innerHeight - Math.max(header.getBoundingClientRect().bottom, textarea.getBoundingClientRect().top),
        overflow: dialog.scrollWidth - dialog.clientWidth};
    });
    assert(geometry.usableLineSpace >= geometry.lineHeight, 'At least one complete writing line must remain below the header');
    assert(geometry.save.top >= scenario.inset, 'Save must respect the reserved safe top');
    assert(geometry.close.top >= scenario.inset, 'Close must respect the reserved safe top');
    assert(geometry.close.width >= 44 && geometry.close.height >= 44, 'Close must retain a 44px target');
    assert(geometry.overflow <= 1, 'No horizontal dialog overflow');
    await page.locator('textarea[name=text]').fill('Synthetischer Gedanke, der im echten Formular bleibt.');
    await page.locator('.dialog-top [type=submit]').click();
    await page.waitForFunction(KEYS => JSON.parse(localStorage.getItem(KEYS.main)).entries.some(e => e.text === 'Synthetischer Gedanke, der im echten Formular bleibt.'), KEYS);
    results.push({...scenario, geometry, status: 'PASS'});
  } catch (error) {
    results.push({...scenario, geometry, status: 'FAIL', error: error.stack});
  } finally {
    await page.screenshot({path: out + '/' + scenario.name + '.png'});
    await context.close();
  }
}
await browser.close();
fs.writeFileSync(out + '/results.json', JSON.stringify({results, physicalDevice: 'OFFEN'}, null, 2));
console.log(JSON.stringify(results, null, 2));
process.exitCode = results.some(r => r.status !== 'PASS') ? 1 : 0;
