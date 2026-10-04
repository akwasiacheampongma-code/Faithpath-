// Compact Today prototype: real treeLevel, identical-data UI1 comparison, geometry.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { empty, KEYS } from '../src/store.js';
import { treeLevel } from '../src/domain.js';
import { stageNames } from '../src/content.js';
const base = process.env.FAITHPATH_VARIANT_URL || 'http://127.0.0.1:4181';
const baseline = process.env.FAITHPATH_UI1_URL || 'http://127.0.0.1:4180';
const out = process.env.FAITHPATH_VARIANT_OUT || 'qa-output/today-variant-b/local';
fs.mkdirSync(out, { recursive: true });
const errors = [], consoleErrors = [], loads = [], results = [], measurements = [];
function state(count, options = {}) {
  const data = empty();
  if (options.first) return data;
  const at = new Date().toISOString();
  data.paths.push({ id: 'variant-b-path', title: options.long ? 'Ein persönlicher Weg mit einem sehr langen Titel: aufmerksam zuhören und auch schwierigen Gesprächen mit Geduld und Vertrauen begegnen' : 'In Ruhe zuhören', why: options.long ? 'Eine lange persönliche Begründung. '.repeat(20) : 'Menschen aufmerksam begegnen.', started: at, archived: false, category: 'sonstiges', steps: options.noStep ? [] : [{ id: 'variant-b-step', text: options.long ? 'Ein sehr ausführlich beschriebener nächster Schritt, der ohne abgeschnittenen Text oder horizontales Scrollen lesbar bleiben soll. '.repeat(12) : 'Im nächsten Gespräch ausreden lassen.', done: false, createdAt: at }], links: [], reviews: [], milestones: Array.from({ length: count }, (_, i) => ({ id: `variant-b-milestone-${i}`, text: 'Eine selbst festgehaltene Entwicklung.', date: at })) });
  data.journal.push({ id: 'variant-b-thought', text: 'Ich darf zuhören, bevor ich eine Antwort suche.', type: 'Journal', subtype: 'Gedanken', date: at, pathIds: ['variant-b-path'] });
  data.reading = { book: 'JHN', chapter: 3, translation: 'otb' };
  return data;
}
async function pageFor(url, seed, viewport, textSize = '100%') {
  const c = await browser.newContext({ viewport, serviceWorkers: 'block' });
  await c.addInitScript(({ seed, keys, textSize }) => {
    if (!sessionStorage.getItem('variant-b-seeded')) {
      localStorage.setItem(keys.onboard, 'done');
      localStorage.setItem(keys.main, JSON.stringify(seed));
      sessionStorage.setItem('variant-b-seeded', '1');
    }
    document.addEventListener('DOMContentLoaded', () => document.documentElement.style.fontSize = textSize);
  }, { seed, keys: KEYS, textSize });
  const p = await c.newPage(); p.setDefaultTimeout(15000);
  p.on('pageerror', e => errors.push(e.message));
  p.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  p.on('response', r => { if (r.status() >= 400) loads.push({ url: r.url(), status: r.status() }); });
  p.on('requestfailed', r => loads.push({ url: r.url(), error: r.failure()?.errorText }));
  await p.goto(url + '/#today', { waitUntil: 'networkidle' });
  await p.getByRole('heading', { name: 'Was bewegt dich gerade?', exact: true }).waitFor();
  await p.locator('.toast.visible').waitFor({ state: 'hidden', timeout: 7000 });
  await p.evaluate(() => window.scrollTo(0, 0));
  return { c, p };
}
async function capture(p, name) {
  await p.screenshot({ path: path.join(out, name + '.png'), fullPage: false });
  await p.screenshot({ path: path.join(out, name + '-full.png'), fullPage: true });
}
async function geometry(p) {
  return p.evaluate(() => {
    const box = e => { if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height, bottom: r.bottom, right: r.right }; };
    const hero = document.querySelector('.olive-hero'), tree = hero?.querySelector('img'), cta = hero?.querySelector('.olive-hero-cta');
    const nav = box(document.querySelector('.primary-nav'));
    const limit = nav.width > innerWidth / 2 ? nav.y : innerHeight;
    const card = box(document.querySelector('.personal-path'));
    const items = hero ? [...hero.querySelectorAll('.overline,h2,p,a,button')].map(e => ({ text: e.textContent, box: box(e) })) : [];
    const image = box(tree);
    const rects = [...items.map(i => i.box), ...(image ? [image] : [])];
    const overlaps = rects.flatMap((a, i) => rects.slice(i + 1).filter(b => Math.min(a.right, b.right) - Math.max(a.x, b.x) > 1 && Math.min(a.bottom, b.bottom) - Math.max(a.y, b.y) > 1));
    return { viewport: { width: innerWidth, height: innerHeight }, hero: box(hero), currentPath: card, usableBottom: limit, currentPathVisiblePx: card ? Math.max(0, Math.min(card.bottom, limit) - Math.max(0, card.y)) : 0, horizontalOverflow: document.documentElement.scrollWidth > innerWidth, tree: image, treeSource: tree?.getAttribute('src'), treeFit: tree && getComputedStyle(tree).objectFit, treeLoaded: !!tree?.naturalWidth, cta: box(cta), ctaLabel: cta?.textContent, heroTextElements: items.length, heroTitle: hero?.querySelector('h2').textContent, overlaps: overlaps.length, header: box(document.querySelector('.today-header')), actions: box(document.querySelector('.today-entry-actions')), firstActions: [...document.querySelectorAll('.today-entry-actions a')].map(e => ({ text: e.textContent, box: box(e) })) };
  });
}
async function test(name, fn) {
  try { await fn(); results.push({ name, status: 'PASS' }); console.log('PASS', name); }
  catch (e) { results.push({ name, status: 'FAIL', error: e.stack }); console.log('FAIL', name, e.message); }
}
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
try {
  const fixtures = [
    ['first-user', state(0, { first: true })], ['returning-no-step', state(3, { noStep: true })],
    ['active-path', state(0)], ['strong-tree', state(5)], ['fruitful-tree', state(10)],
    ['long-text', state(5, { long: true })],
  ];
  for (const viewport of [{ width: 390, height: 844 }, { width: 320, height: 568 }]) {
    for (const [name, seed] of fixtures) {
      const { c, p } = await pageFor(base, seed, viewport);
      await capture(p, `${viewport.width}-${name}`);
      await test(`${viewport.width}-${name}`, async () => {
        const m = await geometry(p); measurements.push({ name, ...m });
        assert(m.hero.height <= (viewport.width === 390 ? 250 : 200), `Hero ${m.hero.height}px`);
        assert(m.currentPathVisiblePx >= (viewport.width === 320 ? 25 : 1), `Current path visible ${m.currentPathVisiblePx}px; starts ${m.currentPath.y}`);
        assert.equal(m.horizontalOverflow, false);
        assert(m.treeLoaded); assert.equal(m.treeFit, 'contain');
        assert.equal(m.treeSource, `trees/tree-stage-${treeLevel(seed) + 1}.webp`);
        assert.equal(m.heroTitle, stageNames[treeLevel(seed)]);
        assert.equal(m.heroTextElements, 4); assert.equal(m.overlaps, 0);
        assert(m.cta.height >= 44); assert(m.cta.bottom <= m.hero.bottom);
        assert(m.tree.x >= m.hero.x && m.tree.right <= m.hero.right && m.tree.y >= m.hero.y && m.tree.bottom <= m.hero.bottom);
        assert(m.firstActions.every(a => a.box.y >= m.hero.bottom && a.box.bottom <= m.currentPath.y));
        if (name === 'first-user') {
          assert.equal(m.ctaLabel, 'Deinen Weg beginnen');
          await p.locator('.olive-hero-cta').click();
          await p.getByLabel('Name deines Weges').waitFor();
        } else {
          assert.equal(m.ctaLabel, 'Deinen Weg ansehen');
          await p.locator('.olive-hero-cta').click();
          await p.waitForURL('**/#path/variant-b-path');
          await p.getByRole('heading', { name: seed.paths[0].title, exact: true }).waitFor();
        }
      });
      await c.close();
    }
  }
  for (const viewport of [{ width: 768, height: 1024 }, { width: 1440, height: 1000 }]) {
    const seed = state(5), { c, p } = await pageFor(base, seed, viewport);
    await capture(p, `${viewport.width}-strong-tree`);
    await test(`${viewport.width}-balanced-layout`, async () => {
      const m = await geometry(p); measurements.push({ name: 'strong-tree', ...m });
      assert.equal(m.horizontalOverflow, false); assert.equal(m.overlaps, 0);
      assert(m.hero.width <= 850); assert(m.hero.height <= 250); assert(m.treeLoaded);
    }); await c.close();
  }
  for (const viewport of [{ width: 390, height: 844 }, { width: 320, height: 568 }]) {
    const { c, p } = await pageFor(base, state(10), viewport, '200%');
    await capture(p, `${viewport.width}-text-200`);
    await test(`${viewport.width}-text-200`, async () => {
      const m = await geometry(p); measurements.push({ name: 'text-200', ...m });
      assert.equal(m.horizontalOverflow, false); assert.equal(m.overlaps, 0); assert(m.treeLoaded);
      await p.locator('.olive-hero-cta').scrollIntoViewIfNeeded();
      await p.locator('.olive-hero-cta').click(); await p.waitForURL('**/#path/variant-b-path');
    }); await c.close();
  }
  const shared = state(5), viewport = { width: 390, height: 844 };
  const comparison = [];
  for (const [label, url] of [['ui1', baseline], ['variant-b', base]]) {
    const { c, p } = await pageFor(url, shared, viewport);
    await capture(p, `comparison-${label}-390`);
    const m = await geometry(p); comparison.push({ version: label, ...m });
    await c.close();
  }
  fs.writeFileSync(path.join(out, 'comparison-geometry.json'), JSON.stringify({ same_data: true, same_scroll_start: 0, measurements: comparison }, null, 2));
  await test('no-console-or-load-errors', () => { assert.deepEqual(errors, []); assert.deepEqual(consoleErrors, []); assert.deepEqual(loads, []); });
} finally {
  await browser.close();
  fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify({ results, measurements, errors, consoleErrors, loads }, null, 2));
}
if (results.some(r => r.status === 'FAIL')) process.exitCode = 1;
