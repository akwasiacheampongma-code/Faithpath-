import { chromium, expect } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import { faithpathFixture } from '../tests/fixtures/faithpath-v5.ts';

const [stage, directory = 'dist', correction] = process.argv.slice(2);
if (!['before', 'after'].includes(stage)) throw new Error('Usage: node scripts/capture-quiet-reading.mjs before|after <dist>');
const output = 'docs/evidence/quiet-reading';
await mkdir(`${output}/screens`, { recursive: true });
const port = await new Promise(resolve => {
  const probe = net.createServer();
  probe.listen(0, '127.0.0.1', () => { const {port} = probe.address(); probe.close(() => resolve(port)); });
});
const server = spawn(process.execPath, ['scripts/serve.mjs', path.resolve(directory)], { env: {...process.env, PORT: String(port)}, stdio: 'ignore' });
const base = `http://127.0.0.1:${port}`;
for (let i = 0; i < 50; i++) {
  try { if ((await fetch(base)).ok) break; } catch {}
  await new Promise(resolve => setTimeout(resolve, 100));
}
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium', args: ['--no-sandbox'] });
const report = correction === '--empty-dark'
  ? JSON.parse(await readFile(`${output}/${stage}-initial.json`, 'utf8'))
  : {stage, fixedClock: '2026-11-18T09:00:00Z', syntheticData: true, browser: 'Local Chromium', deviceTest: false, scenes: [], errors: []};
const button = (page, name) => page.getByRole('button', {name, exact: true});
const viewports = [[320,568], [375,812], [390,844], [430,932]];
const changed = [['garten','/garten'], ['sammlung','/sammlung'], ['reader','/lesen/MRK?chapter=4&mode=read']];
const other = [['heute','/'], ['bibel','/bibel'], ['wege','/wege']];

async function profile(page, theme) {
  await page.goto(base + '/importieren');
  const chooser = page.waitForEvent('filechooser');
  await button(page, 'FaithPath-Datei auswählen').click();
  await (await chooser).setFiles({name:'synthetic-faithpath.json', mimeType:'application/json', buffer:Buffer.from(JSON.stringify(faithpathFixture()))});
  await button(page, 'Jetzt sichern und Import übernehmen').click();
  await expect(page.getByText(/Import abgeschlossen/)).toBeVisible();
  await page.evaluate(theme => new Promise((resolve, reject) => {
    const request = indexedDB.open('oliva-local-v1', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result, tx = db.transaction('state', 'readwrite'), store = tx.objectStore('state'), main = store.get('main');
      main.onsuccess = () => {
        const record = main.result, data = record.data;
        data.name = 'Mara'; data.onboarded = true; data.growthStage = 4;
        data.settings.theme = theme; data.settings.reducedMotion = true;
        data.reading = {book:'PSA', chapter:23}; data.readingPosition = null;
        data.bookmarks = ['PSA:23:1']; data.highlights = {'MRK:4:35':'olive'};
        data.drafts = [{id:'sample-draft', key:'journal', revision:0, updatedAt:'2026-11-17T10:00:00Z', type:'journal', values:{entityId:'sample-note', targetId:null, baseUpdatedAt:null, text:'Mein persönlicher Entwurf.', kind:'note'}}];
        data.revision++; store.put(record, 'main');
      };
      tx.oncomplete = () => {db.close(); resolve();};
      tx.onerror = () => reject(tx.error);
    };
  }), theme);
}

async function enlarge(page) {
  await page.evaluate(() => {
    const els = [...document.querySelectorAll('[role="main"] div,[role="main"] p,[role="main"] h1,[role="main"] span,[role="main"] button,[role="main"] input')];
    const sizes = els.map(el => {const style = getComputedStyle(el); return [el, parseFloat(style.fontSize), parseFloat(style.lineHeight)];});
    for (const [el, font, line] of sizes) {
      if (font) el.style.fontSize = 2 * font + 'px';
      if (line) el.style.lineHeight = 2 * line + 'px';
    }
  });
}

async function measure(page) {
  return page.evaluate(() => {
    const main = [...document.querySelectorAll('[role="main"]')].find(el => el.getBoundingClientRect().height > 0);
    const read = selector => {
      const element = selector === ':scope' ? main : main.querySelector(selector);
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      return {top: Math.round(rect.top), bottom: Math.round(rect.bottom), width: Math.round(rect.width), height: Math.round(rect.height)};
    };
    const text = main.querySelector('[data-testid^="flow-paragraph-"] p');
    return {main:read(':scope'), tree:read('[data-testid="olive-tree"]'), archive:read('[data-testid="garden-original-history"]'),
      firstVerse:read('[data-testid="flow-verse-1"]'), firstText:read('[data-testid="reader-flow"]'), collectionTabs:read('[data-testid="collection-tabs"]'),
      documentOverflow: document.documentElement.scrollWidth > innerWidth, mainOverflow:main.scrollWidth > main.clientWidth + 1,
      mainScrollHeight:main.scrollHeight, readerFont:text ? getComputedStyle(text).fontSize : null, readerLineHeight:text ? getComputedStyle(text).lineHeight : null};
  });
}

async function capture(page, theme, width, height, area, route, scenario = 'normal') {
  await page.setViewportSize({width,height});
  await page.goto(base + route);
  await expect(page.getByRole('main')).toBeVisible();
  await expect(button(page, theme === 'dark' ? 'Hellen Modus aktivieren' : 'Dunklen Modus aktivieren')).toBeVisible();
  await expect(page.getByText('Für den Offline-Neustart bereit.', {exact:true})).toBeVisible({timeout:30000});
  if (area === 'garten') {
    await expect.poll(() => page.getByTestId('olive-tree').evaluate(el => el.olivaTree?.().stage)).toBe(scenario === 'empty' ? 0 : 4);
  }
  if (area === 'reader') await expect(page.getByTestId('reader-flow')).toBeVisible();
  if (scenario === 'large') await enlarge(page);
  await page.evaluate(() => document.fonts.ready);
  await expect.poll(() => page.getByRole('main').locator('img').evaluateAll(images => images.every(img => img.complete && img.naturalWidth > 0))).toBe(true);
  await page.getByRole('main').evaluate(el => el.scrollTop = 0);
  const metrics = await measure(page), file = `screens/${stage}-${area}-${width}-${theme}-${scenario}.png`;
  await page.screenshot({path: `${output}/${file}`, animations:'disabled'});
  report.scenes.push({area, route, theme, width, height, scenario, file, ...metrics});
}

try {
  if (correction === '--empty-dark') {
    report.scenes = report.scenes.filter(scene => scene.scenario !== 'empty' || scene.theme !== 'dark');
    const context = await browser.newContext({viewport:{width:390,height:844},colorScheme:'dark',reducedMotion:'reduce'});
    const page = await context.newPage();
    await page.clock.setFixedTime(new Date(report.fixedClock));
    await page.goto(base+'/einstellungen');
    await button(page,'Dunklen Modus aktivieren').click();
    await expect(button(page,'Hellen Modus aktivieren')).toBeVisible();
    for (const [area,route] of changed.slice(0,2)) await capture(page,'dark',390,844,area,route,'empty');
    report.darkGuestCorrection = {reason:'The app defaults to light rather than the OS preference', appThemeVerified:true};
    await context.close();
  } else {
  for (const theme of ['light', 'dark']) {
    const context = await browser.newContext({ viewport:{width:390,height:844}, colorScheme:theme, reducedMotion:'reduce' });
    const page = await context.newPage();
    page.on('pageerror', error => report.errors.push(error.message));
    await page.clock.setFixedTime(new Date(report.fixedClock));
    await profile(page, theme);
    for (const [width,height] of viewports) {
      for (const [area,route] of stage === 'after' ? [...changed, ...other] : changed) await capture(page, theme, width, height, area, route);
    }
    for (const [area,route] of changed) await capture(page, theme, 320, 568, area, route, 'large');
    for (const tab of ['Entwürfe','Lesezeichen','Markierungen']) {
      await page.setViewportSize({width:390,height:844});
      await page.goto(base + '/sammlung');
      await button(page, tab).click();
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({path:`${output}/screens/${stage}-sammlung-390-${theme}-${tab.toLowerCase()}.png`, animations:'disabled'});
    }
    await context.close();
    const empty = await browser.newContext({viewport:{width:390,height:844}, colorScheme:theme, reducedMotion:'reduce'});
    const guest = await empty.newPage();
    await guest.clock.setFixedTime(new Date(report.fixedClock));
    if (theme === 'dark') {
      await guest.goto(base+'/einstellungen');
      await button(guest,'Dunklen Modus aktivieren').click();
      await expect(button(guest,'Hellen Modus aktivieren')).toBeVisible();
    }
    for (const [area,route] of changed.slice(0,2)) await capture(guest, theme, 390, 844, area, route, 'empty');
    await empty.close();
  }
  }
} catch(error) {
  report.failure = String(error.stack ?? error);
  process.exitCode = 1;
} finally {
  report.finishedAt = new Date().toISOString();
  await writeFile(`${output}/${stage}.json`, JSON.stringify(report, null, 2) + '\n');
  await browser.close(); server.kill('SIGTERM');
  console.log(JSON.stringify({stage, scenes:report.scenes.length, errors:report.errors, failure:report.failure}));
}
