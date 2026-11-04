import fs from 'node:fs';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { fixtureServer } from './first-seed/fixture-server.mjs';
import { phase3Fixture } from './phase3-fixtures.mjs';
import { newSeedDraft } from '../src/first-seed/model.js';
import { KEYS } from '../src/store.js';

const out = process.env.QA_OUT || 'reports/simplified-steps/evidence/browser';
fs.mkdirSync(out, { recursive: true });
const server = await fixtureServer(process.env.QA_ROOT || 'dist'),
  browser = await chromium.launch({
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox'],
  });
const results = [],
  errors = [];
let p;
async function setup(
  flow,
  width = 390,
  { next = '', candidate = '', theme = 'paper' } = {},
) {
  const data = phase3Fixture('active', theme);
  data.paths[0].category = 'beziehungen';
  data.paths[0].links[0].ref = {
    book: 'JAS',
    chapter: 1,
    from: 19,
    to: 20,
    translation: 'otb',
  };
  const draft = newSeedDraft(
    Object.fromEntries(
      [
        'pathId',
        'journalId',
        'reflectionId',
        'stepId',
        'thoughtLinkId',
        'scriptureLinkId',
      ].map((k) => [k, 'qa-' + k]),
    ),
    '2026-11-04T12:00:00.000Z',
  );
  Object.assign(draft.values, {
    scene: 4,
    topic: 'streit',
    concern: 'Ich möchte ruhiger zuhören.',
    thought: 'Ich darf zuerst verstehen.',
    title: 'In Ruhe zuhören',
    next,
    stepCandidate: candidate,
  });
  const c = await browser.newContext({
    viewport: { width, height: width === 375 ? 667 : 844 },
    deviceScaleFactor: 2,
    serviceWorkers: 'allow',
  });
  await c.addInitScript(
    ({ KEYS, data, draft, flow }) => {
      if (!sessionStorage.seeded) {
        localStorage.setItem(KEYS.main, JSON.stringify(data));
        localStorage.setItem(KEYS.onboard, 'done');
        if (flow === 'seed')
          localStorage.setItem(KEYS.draft, JSON.stringify(draft));
        sessionStorage.seeded = 'yes';
      }
    },
    { KEYS, data, draft, flow },
  );
  p = await c.newPage();
  p.setDefaultTimeout(7000);
  p.on('pageerror', (e) => errors.push({ script: e.message }));
  await p.goto(
    server.url + '/#' + (flow === 'seed' ? 'first-seed' : 'path/personal-path'),
  );
  await p.locator('#main h1').waitFor();
  if (flow === 'step') {
    await p.locator('[data-action=step]').click();
    await p.locator('#editor-form').waitFor();
  }
  return c;
}
const field = (flow) =>
  p.locator(flow === 'seed' ? '#seed-next' : '#editor-form [name=text]');
const choices = () =>
  p.locator('[data-guided-options] [data-action=guided-candidate]');
async function check(name, fn) {
  if (process.env.QA_CASE && !new RegExp(process.env.QA_CASE).test(name))
    return;
  try {
    await fn();
    results.push(name);
    console.log('PASS', name);
  } catch (error) {
    errors.push({ name, error: error.message });
    console.log('FAIL', name, error.message);
  }
}
try {
  for (const flow of ['seed', 'step'])
    await check(
      flow + ': direct selection, editing, pause/reload, restore and save',
      async () => {
        const c = await setup(flow);
        try {
          const target = field(flow);
          assert.equal(await p.locator('[data-step-help] textarea').count(), 1);
          const a = await choices().nth(0).getAttribute('data-text'),
            b = await choices().nth(1).getAttribute('data-text');
          await choices().nth(0).click();
          assert.equal(await target.inputValue(), a);
          const primary = p.locator(
            flow === 'seed'
              ? '[data-action=seed-next]'
              : '#editor-form button[type=submit]',
          );
          const primaryBox = await primary.boundingBox();
          assert(
            primaryBox &&
              primaryBox.y + primaryBox.height <=
                (flow === 'seed' ? 844 - 60 : 844),
            'Saving/review action should be reachable after choosing a proposal',
          );
          await choices().nth(1).click();
          assert.equal(await target.inputValue(), b);
          assert.equal(
            await p.locator('[data-guided-confirm]').isVisible(),
            false,
          );
          await target.fill('Meine Worte bleiben auch beim Wechsel erhalten.');
          await choices().nth(0).click();
          assert.equal(
            await target.inputValue(),
            'Meine Worte bleiben auch beim Wechsel erhalten.',
          );
          assert(await p.locator('[data-guided-confirm]').isVisible());
          await p.locator('[data-action=guided-keep]').click();
          assert.equal(
            await target.inputValue(),
            'Meine Worte bleiben auch beim Wechsel erhalten.',
          );
          await choices().nth(0).click();
          await p.locator('[data-action=guided-replace]').click();
          assert.equal(await target.inputValue(), a);
          await choices().nth(1).click();
          assert.equal(await target.inputValue(), b);
          if (flow === 'seed') {
            await p.locator('[data-action=seed-pause]').click();
            await p.locator('.today-phase1').waitFor();
            await p.goto(server.url + '/#first-seed');
          } else {
            await p.locator('dialog [data-action=close]').click();
            await p.reload();
            await p.goto(server.url + '/#today');
            await p.locator('[data-action=resume]').first().click();
          }
          assert.equal(await field(flow).inputValue(), b);
          await p.locator('[data-step-help] details summary').click();
          await p.locator('[data-action=guided-restore-own]').click();
          assert.equal(
            await field(flow).inputValue(),
            'Meine Worte bleiben auch beim Wechsel erhalten.',
          );
          await field(flow).fill('Morgen höre ich zuerst zu.');
          if (flow === 'seed') {
            await p.locator('[data-action=seed-next]').click();
            await p.locator('[data-action=seed-save]').click();
            await p.locator('[data-seed-planted]').waitFor();
          } else {
            await p.locator('#editor-form button[type=submit]').click();
            await p.locator('#editor-form').waitFor({ state: 'hidden' });
          }
          const saved = await p.evaluate(
            (KEYS) => JSON.parse(localStorage.getItem(KEYS.main)),
            KEYS,
          );
          assert(
            saved.paths.some((path) =>
              path.steps.some((s) => s.text === 'Morgen höre ich zuerst zu.'),
            ),
          );
          assert(saved.paths.every((path) => path.milestones.length === 0));
        } finally {
          await c.close();
        }
      },
    );
  for (const flow of ['seed', 'step'])
    await check(
      flow + ': manually typed proposal remains protected after restart',
      async () => {
        const c = await setup(flow);
        try {
          const a = await choices().nth(0).getAttribute('data-text');
          await field(flow).fill(a);
          if (flow === 'seed') {
            await p.locator('[data-action=seed-pause]').click();
            await p.locator('.today-phase1').waitFor();
            await p.goto(server.url + '/#first-seed');
          } else {
            await p.locator('dialog [data-action=close]').click();
            await p.goto(server.url + '/#today');
            await p.locator('[data-action=resume]').click();
          }
          await choices().nth(1).click();
          assert.equal(await field(flow).inputValue(), a);
          assert(await p.locator('[data-guided-confirm]').isVisible());
          await p.locator('[data-action=guided-keep]').click();
        } finally {
          await c.close();
        }
      },
    );
  await check(
    'legacy two-field first-seed draft retains both personal words and unaccepted candidate',
    async () => {
      const c = await setup('seed', 390, {
        next: 'Meine unveränderten eigenen Worte.',
        candidate: 'Meine frühere bearbeitete Anregung.',
      });
      try {
        assert.equal(
          await field('seed').inputValue(),
          'Meine unveränderten eigenen Worte.',
        );
        await p.locator('.step-more-help summary').click();
        assert(
          (await p.locator('.step-more-help').innerText()).includes(
            'Meine frühere bearbeitete Anregung.',
          ),
        );
        await p.locator('[data-action=guided-legacy]').click();
        assert.equal(
          await field('seed').inputValue(),
          'Meine unveränderten eigenen Worte.',
        );
        await p.locator('[data-action=guided-replace]').click();
        assert.equal(
          await field('seed').inputValue(),
          'Meine frühere bearbeitete Anregung.',
        );
        await p.locator('[data-action=seed-pause]').click();
        await p.locator('.today-phase1').waitFor();
        await p.goto(server.url + '/#first-seed');
        await p.locator('.step-more-help summary').click();
        await p.locator('[data-action=guided-restore-own]').click();
        assert(await p.locator('[data-guided-confirm]').isVisible());
        await p.locator('[data-action=guided-replace]').click();
        assert.equal(
          await field('seed').inputValue(),
          'Meine unveränderten eigenen Worte.',
        );
      } finally {
        await c.close();
      }
    },
  );
  await check(
    'changing a new path category preserves its live text and protection',
    async () => {
      const c = await setup('step');
      try {
        await p.locator('dialog [data-action=close]').click();
        await p.goto(server.url + '/#paths');
        await p.locator('[data-action=new-path]').first().click();
        const t = p.locator('#editor-form [name=step]');
        await t.fill('Eigene Worte im neuen Weg.');
        await p.locator('#editor-form [name=category]').selectOption('geduld');
        assert.equal(await t.inputValue(), 'Eigene Worte im neuen Weg.');
        await choices().first().click();
        assert.equal(await t.inputValue(), 'Eigene Worte im neuen Weg.');
        assert(await p.locator('[data-guided-confirm]').isVisible());
      } finally {
        await c.close();
      }
    },
  );
  let layouts = 0;
  for (const flow of ['seed', 'step'])
    for (const width of [375, 390])
      for (const theme of ['light', 'paper', 'atmospheric', 'night'])
        for (const percent of [100, 200])
          await check(`${flow}: ${width} ${theme} ${percent}%`, async () => {
            const c = await setup(flow, width, { theme });
            try {
              if (percent === 200)
                await p.evaluate(
                  () => (document.documentElement.style.fontSize = '200%'),
                );
              await p.evaluate(() => document.fonts.ready);
              assert.equal(await choices().count(), 3);
              assert.equal(await p.locator('[data-guided-topic]').count(), 0);
              assert.equal(await p.locator('[data-guided-preview]').count(), 0);
              assert.equal(
                await p.locator('[data-step-help] textarea').count(),
                1,
              );
              const size = await p.evaluate(() => ({
                page: document.documentElement.scrollWidth <= innerWidth,
                dialog:
                  !document.querySelector('#dialog').open ||
                  document.querySelector('#dialog').scrollWidth <=
                    document.querySelector('#dialog').clientWidth,
              }));
              assert(size.page && size.dialog, JSON.stringify(size));
              if (percent === 100) {
                if (flow === 'seed') await p.evaluate(() => scrollTo(0, 0));
                await p.screenshot({
                  path: out + `/${flow}-${width}-${theme}-initial.png`,
                  fullPage: false,
                });
                await choices().first().click();
                await p.screenshot({
                  path: out + `/${flow}-${width}-${theme}-selected.png`,
                  fullPage: false,
                });
              }
              layouts++;
            } finally {
              await c.close();
            }
          });
  results.push(layouts + ' mobile layout states verified');
} finally {
  await browser.close();
  await server.disconnect();
  fs.writeFileSync(
    out + '/results.json',
    JSON.stringify(
      { results, errors, realIPhone: 'OPEN', synthetic: true },
      null,
      2,
    ),
  );
}
if (errors.length) process.exitCode = 1;
