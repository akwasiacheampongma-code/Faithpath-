/** Delivery smoke test: real local before/after files, filters and keyboard. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright';

const out = process.env.QA_OUT || 'qa-output/uiux6b-mobile1/gallery';
const origins = [
  ['representative', process.env.QA_GALLERY_URL || 'http://127.0.0.1:4520'],
  ['full', process.env.QA_FULL_GALLERY_URL || 'http://127.0.0.1:4521'],
];
fs.mkdirSync(out, {recursive: true});
const browser = await chromium.launch({executablePath:'/usr/bin/chromium', args:['--no-sandbox']});
const results = [], errors = [];
try {
  for (const [name, origin] of origins) {
    for (const width of [390, 1440]) {
      const context = await browser.newContext({viewport:{width, height:900}});
      const page = await context.newPage();
      page.on('pageerror', error => errors.push({name, width, message:error.message}));
      page.on('response', response => {
        if (response.status() >= 400) errors.push({name, url:response.url(), status:response.status()});
      });
      await page.goto(origin + '/index.html');
      assert.equal(await page.locator('#screen option').count(), 23);
      assert.equal(await page.locator('#theme option').count(), 4);
      assert.match(await page.locator('header').innerText(), /d1fd4804/);
      for (const [screen, theme, size, before] of [
        ['journal-empty','night','390-100',true],
        ['journal-empty','night','320-200',true],
        ['reader','paper','390-100',true],
        ['quiz','atmospheric','390-100',true],
        ['settings','light','320-200',true],
        ['journey','night',name === 'full' ? '430-200' : '390-100',name !== 'full'],
      ]) {
        await page.selectOption('#screen', screen);
        await page.selectOption('#theme', theme);
        await page.selectOption('#size', size);
        await page.locator('#new').evaluate(image => image.decode());
        assert.equal(await page.locator('#old').isVisible(), before);
        if (before) await page.locator('#old').evaluate(image => image.decode());
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        assert.match(await page.locator('#new-link').getAttribute('href'), /\/after\//);
        results.push({name, width, screen, theme, size, before, status:'PASS'});
      }
      await page.locator('#screen').focus();
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => document.activeElement.id), 'theme');
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => document.activeElement.id), 'size');
      await page.screenshot({path:`${out}/${name}-${width}.png`});
      await context.close();
    }
  }
} catch (error) {
  errors.push({message:error.stack});
} finally {
  await browser.close();
}
fs.writeFileSync(out + '/results.json', JSON.stringify({results, errors}, null, 2));
console.log(JSON.stringify({cases:results.length, errors}));
process.exitCode = errors.length ? 1 : 0;
