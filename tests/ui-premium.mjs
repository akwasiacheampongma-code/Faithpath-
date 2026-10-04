// UI acceptance and visual evidence. Uses existing storage schema and actions.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { empty, KEYS } from '../src/store.js';

const base = (process.env.FAITHPATH_QA_URL || 'http://127.0.0.1:4174').replace(/\/$/, '');
const out = process.env.FAITHPATH_QA_OUT || 'qa-output/ui-premium/local';
const baseline = process.env.FAITHPATH_QA_BASELINE === '1';
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.FAITHPATH_CHROMIUM || '/usr/bin/chromium', args: ['--no-sandbox'] });
const results = [], errors = [], loads = [], consoleErrors = [];
const seed = empty();
const today = new Date().toISOString();
const earlier = new Date(Date.now() - 35 * 86400000).toISOString();
seed.paths.push({ id: 'qa-path', title: 'In Ruhe zuhören', why: 'Menschen aufmerksam begegnen.', category: 'sonstiges', started: earlier, archived: false, steps: [{ id: 'qa-step', text: 'Im nächsten Gespräch ausreden lassen.', done: false, createdAt: earlier }], milestones: [], reviews: [], links: [] });
seed.journal.push({ id: 'qa-entry', text: 'Ich darf zuhören, bevor ich eine Antwort suche.', type: 'Journal', subtype: 'Gedanken', date: today, pathIds: ['qa-path'] });
seed.journal.push({ id: 'qa-earlier-entry', text: 'Was hilft mir, in schwierigen Gesprächen ruhig zu bleiben?', type: 'Journal', subtype: 'Gedanken', date: earlier, pathIds: [] });
seed.reading = { book: 'JHN', chapter: 3, translation: 'otb' };
async function context(data) {
  const c = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  await c.addInitScript(({ data, keys }) => {
    if (!sessionStorage.getItem('qa-seeded')) {
      localStorage.setItem(keys.onboard, 'done');
      if (data) localStorage.setItem(keys.main, JSON.stringify(data));
      sessionStorage.setItem('qa-seeded', '1');
    }
  }, { data, keys: KEYS });
  const p = await c.newPage();
  p.setDefaultTimeout(15000);
  p.on('pageerror', e => errors.push(e.message));
  p.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  p.on('response', r => { if (r.status() >= 400) loads.push({ url: r.url(), status: r.status() }); });
  p.on('requestfailed', r => loads.push({ url: r.url(), failure: r.failure()?.errorText }));
  return { c, p };
}
async function route(p, name) {
  await p.goto(`${base}/#${name}`, { waitUntil: 'networkidle' });
  await p.locator('main h1').waitFor();
  if (name.startsWith('read/')) await p.locator('.verse').first().waitFor();
  await p.evaluate(() => window.scrollTo(0, 0));
}
async function shot(p, name) {
  await p.locator('.toast.visible').waitFor({ state: 'hidden', timeout: 7000 });
  await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await p.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await p.screenshot({ path: path.join(out, `${name}.png`), fullPage: false });
  await p.screenshot({ path: path.join(out, `${name}-full.png`), fullPage: true });
}
async function check(name, fn) {
  try { await fn(); results.push({ name, status: 'PASS' }); console.log('PASS', name); }
  catch (e) { results.push({ name, status: 'FAIL', error: e.stack }); console.log('FAIL', name, e.message); }
}
try {
  const fresh = await context(null);
  await route(fresh.p, 'today'); await shot(fresh.p, '01-today-first-start');
  await route(fresh.p, 'journal'); await shot(fresh.p, '05-journal-empty');
  if (!baseline) await check('journal_empty_state', async () => {
    assert.equal(await fresh.p.locator('#journal-search').count(), 0);
    assert.equal(await fresh.p.locator('.filters').count(), 0);
    await fresh.p.getByRole('button', { name: 'Gedanken festhalten', exact: true }).click();
    await fresh.p.getByLabel('Dein Gedanke', { exact: true }).fill('Mein erster Gedanke.');
    await fresh.p.locator('#editor-form button[type=submit]').click();
    await fresh.p.getByRole('button', { name: 'Für jetzt reicht der Gedanke', exact: true }).click();
    await route(fresh.p, 'journal');
    await fresh.p.locator('#journal-search').waitFor();
    await fresh.p.locator('#journal-search').fill('unauffindbarerSuchbegriff');
    await fresh.p.getByText('Kein passender Eintrag.', { exact: true }).waitFor();
    assert.equal(await fresh.p.locator('.filters').isVisible(), true);
    assert.equal(await fresh.p.locator('#journal-search').isVisible(), true);
    await shot(fresh.p, 'journal-no-results');
  });
  await fresh.c.close();
  const { c, p } = await context(seed);
  await route(p, 'today'); await shot(p, '02-today-personal');
  if (!baseline) await check('today', async () => {
    const order = await p.locator('main').evaluate(el => el.innerText);
    assert(order.indexOf('In Ruhe zuhören') < order.indexOf('Ein Gedanke. Ein Schritt.'));
    assert(order.includes(seed.paths[0].steps[0].text));
    assert(order.includes(seed.journal[0].text));
    assert.equal(await p.locator('a[href="#read/JHN/3/otb"]').count(), 2);
    const card = await p.locator('.personal-path').boundingBox();
    const navigation = await p.locator('.primary-nav').boundingBox();
    assert(card.y < navigation.y, 'Current path begins above bottom navigation at 390x844');
  });
  const screens = [['bible', '03-bible'], ['read/JHN/3/otb', '04-reader'], ['journal', '06-journal-filled'], ['paths', '07-my-paths'], ['path/qa-path', '07-path-detail'], ['reviews', '08-reviews'], ['plans', '09-guided-paths'], ['guidance', '10-guidance'], ['more', '12-settings'], ['discover', 'discover'], ['quizzes', 'quiz'], ['marks', 'marks'], ['history', 'history']];
  for (const [r, name] of screens) { await route(p, r); await shot(p, name); }
  if (!baseline) await check('reader_reflection_entry', async () => {
    await route(p, 'read/JHN/3/otb');
    assert.equal(await p.locator('[data-action="reflect-reader"]').count(), 2);
    assert.equal(await p.locator('.verse').count(), 36);
    const early = await p.locator('.reader-reflection-entry').boundingBox();
    const verse = await p.locator('.verse').first().boundingBox();
    assert(early.y < verse.y);
    await p.locator('.reader-reflection-entry button').click();
    await p.getByLabel('Dein Gedanke', { exact: true }).fill('Ein Gedanke zu Johannes 3.');
    await p.locator('#editor-form button[type=submit]').click();
    await route(p, 'journal');
    assert((await p.locator('main').innerText()).includes('Ein Gedanke zu Johannes 3.'));
  });
  await route(p, 'today'); await p.locator('#menu-toggle').click(); await shot(p, '11-menu');
  await p.keyboard.press('Escape');
  if (!baseline) await check('responsive_and_zoom', async () => {
    for (const [width, height] of [[320, 568], [390, 844], [768, 1024], [1440, 1000]]) {
      await p.setViewportSize({ width, height });
      for (const r of ['today', 'journal', 'read/JHN/3/otb', 'path/qa-path', 'guidance', 'more', 'plans', 'reviews', 'discover', 'quizzes']) {
        await route(p, r);
        assert(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Overflow ${r} ${width}`);
      }
      await p.locator('#menu-toggle').click();
      assert(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      const drawer = await p.locator('#main-menu').boundingBox();
      assert(drawer.y + drawer.height <= height);
      await shot(p, `menu-${width}`); await p.keyboard.press('Escape');
      await route(p, 'today'); await shot(p, `today-${width}`);
    }
    await p.setViewportSize({ width: 390, height: 844 });
    await p.emulateMedia({ reducedMotion: 'reduce' });
    for (const r of ['today', 'journal', 'read/JHN/3/otb', 'path/qa-path', 'more']) {
      await route(p, r);
      await p.evaluate(() => document.documentElement.style.fontSize = '200%');
      assert(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `200% text ${r}`);
    }
    await p.evaluate(() => document.documentElement.style.fontSize = '');
  });
  await c.close();
  await check('no_js_or_load_errors', () => {
    assert.deepEqual(errors, []); assert.deepEqual(consoleErrors, []); assert.deepEqual(loads, []);
  });
} finally {
  await browser.close();
  fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify({ base, baseline, viewport: '390x844', results, errors, consoleErrors, loads, limitation: 'Chromium; no real iPhone/Safari/VoiceOver or live SW lifecycle assessment' }, null, 2));
}
if (results.some(r => r.status === 'FAIL')) process.exitCode = 1;
