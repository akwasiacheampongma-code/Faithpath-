import { chromium, expect } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';

const directory = path.resolve(process.argv[2] ?? 'dist');
const out = process.argv[3] ?? 'docs/evidence/illustration-review';
const inventory = JSON.parse(await readFile(`${out}/inventory.json`, 'utf8'));
const packaged = inventory.appVersionBasis !== undefined;
const screenshotScale = packaged ? 'css' : 'device';
const catalog = JSON.parse(await readFile('src/data/story-index.json', 'utf8')).units;
const units = [...inventory.storyAssignments, ...catalog.filter(u => ['NS-0073', 'NS-0349'].includes(u.id))];
await mkdir(`${out}/screens`, {recursive:true});
const port = await new Promise(resolve => {
  const probe = net.createServer();
  probe.listen(0, '127.0.0.1', () => { const {port} = probe.address(); probe.close(() => resolve(port)); });
});
const base = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ['scripts/serve.mjs', directory], {env:{...process.env, PORT:String(port)},stdio:'ignore'});
for (let i = 0; i < 50; i++) {
  try { if ((await fetch(base)).ok) break; } catch {}
  await new Promise(resolve => setTimeout(resolve, 100));
}
const browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH ?? '/usr/bin/chromium',args:['--no-sandbox']});
const report = {build:inventory.build, browser:'Local Chromium on loopback', physicalDeviceTest:false,
  privateReleasePackageTestedOnLoopback:packaged, visual:[], thumbnails:[], coldLoads:[], offline:[], resources:[], errors:[]};

function artImage(page, unit) {
  return page.getByRole('main').locator(`img[src*="${unit.image}-"]`).first();
}

function inspectRequests(context) {
  context.on('request', request => {
    const url = new URL(request.url());
    if (!['http:', 'https:'].includes(url.protocol)) return;
    const item = {sameOrigin:url.origin === base, method:request.method(), type:request.resourceType()};
    const matching = report.resources.find(r => r.sameOrigin === item.sameOrigin && r.method === item.method && r.type === item.type);
    if (matching) matching.count++; else report.resources.push({...item,count:1});
  });
}

async function loadStory(page, unit) {
  await page.goto(`${base}/geschichte/${unit.id}`, {waitUntil:'domcontentloaded',timeout:90000});
  await expect(page.getByRole('heading',{name:unit.title,exact:true})).toBeVisible({timeout:65000});
  await expect(page.locator('meta[name="oliva-build"]')).toHaveAttribute('content',inventory.build);
  const main = page.getByRole('main');
  await page.evaluate(() => document.fonts.ready);
  let asset = null;
  if (unit.image) {
    const image = artImage(page, unit);
    if (unit.image !== 'storm') {
      await expect(page.getByTestId(`story-artwork-${unit.image}`)).toHaveAttribute('aria-busy','false',{timeout:60000});
    }
    // React Native Web can draw a background and keep the corresponding IMG transparent.
    await expect.poll(() => image.evaluate(el => el.complete && el.naturalWidth > 0).catch(() => false),{timeout:60000}).toBe(true);
    asset = await image.evaluate(el => {
      const rect = el.getBoundingClientRect();
      const url = el.currentSrc || el.src;
      const resource = performance.getEntriesByName(url).at(-1);
      return {file:new URL(url).pathname, pixels:[el.naturalWidth,el.naturalHeight], frame:[Math.round(rect.width),Math.round(rect.height)],
        resourceMs:resource ? Math.round(resource.duration) : null, transferBytes:resource?.transferSize ?? null, encodedBytes:resource?.encodedBodySize ?? null};
    });
  } else {
    await expect(page.getByTestId('story-typographic-hero')).toBeVisible();
  }
  const pageMetrics = await main.evaluate(el => {
    const referenceButton = [...el.querySelectorAll('[role="button"],button')].find(button => button.textContent.trim() === 'Im Bibeltext lesen');
    const rect = referenceButton?.getBoundingClientRect();
    const mainRect = el.getBoundingClientRect();
    const resources = performance.getEntriesByType('resource');
    return {
      readyMs:Math.round(performance.now()),
      domContentLoadedMs:Math.round(performance.getEntriesByType('navigation')[0].domContentLoadedEventEnd),
      scriptTransferBytes:resources.filter(entry => new URL(entry.name).pathname.endsWith('.js')).reduce((total,entry) => total+entry.transferSize,0),
      readerButtonTop:rect ? Math.round(rect.top) : null,
      readerButtonVisibleAtStart:!!rect && rect.bottom <= mainRect.bottom,
      overflow:el.scrollWidth > el.clientWidth + 1 || document.documentElement.scrollWidth > innerWidth,
    };
  });
  expect(pageMetrics.overflow).toBe(false);
  return {id:unit.id,title:unit.title,asset,...pageMetrics};
}

try {
  for (const [width,height,theme] of [[320,568,'light'],[390,844,'dark']]) {
    const context = await browser.newContext({viewport:{width,height},deviceScaleFactor:2,colorScheme:theme,reducedMotion:'reduce'});
    inspectRequests(context);
    const page = await context.newPage(); page.on('pageerror', error => report.errors.push(error.message));
    if (theme === 'dark') {
      await page.goto(base + '/einstellungen');
      await page.getByRole('button',{name:'Dunklen Modus aktivieren',exact:true}).click();
      await expect(page.getByRole('button',{name:'Hellen Modus aktivieren',exact:true})).toBeVisible();
    }
    for (const unit of units) {
      const metrics = await loadStory(page, unit);
      await expect(page.getByRole('button',{name:theme === 'dark' ? 'Hellen Modus aktivieren' : 'Dunklen Modus aktivieren',exact:true})).toBeVisible();
      const file = `screens/${unit.id}-${width}-${theme}.png`;
      await page.screenshot({path:`${out}/${file}`,animations:'disabled',scale:screenshotScale});
      let artFile = null;
      if (unit.image) {
        artFile = `screens/${unit.id}-${width}-${theme}-art.png`;
        const frame = unit.image === 'storm' ? artImage(page,unit).locator('..') : page.getByTestId(`story-artwork-${unit.image}`);
        await frame.screenshot({path:`${out}/${artFile}`,animations:'disabled',scale:screenshotScale});
      }
      report.visual.push({width,height,theme,deviceScaleFactor:2,file,artFile,...metrics});
    }
    if (packaged) {
      await page.goto(base + '/geschichten');
      await page.getByRole('button',{name:'Mit Bild',exact:true}).click();
      await expect(page.getByText('6 Abschnitte',{exact:true})).toBeVisible();
      for (const unit of inventory.storyAssignments) {
        const row = page.getByTestId(`story-row-${unit.id}`);
        const image = row.locator(`img[src*="${unit.image}-"]`).first();
        await expect.poll(() => image.evaluate(el=>el.complete && el.naturalWidth>0)).toBe(true);
        const frame = await image.evaluate(el=>{
          const rect = el.getBoundingClientRect();
          return {width:Math.round(rect.width),height:Math.round(rect.height),naturalWidth:el.naturalWidth,naturalHeight:el.naturalHeight,path:new URL(el.currentSrc || el.src).pathname};
        });
        const file = `screens/${unit.id}-${width}-${theme}-list-row.png`;
        await row.screenshot({path:`${out}/${file}`,animations:'disabled',scale:screenshotScale});
        report.thumbnails.push({id:unit.id,title:unit.title,width,theme,frame,file});
      }
    }
    await context.close();
  }

  const context = await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,reducedMotion:'reduce'});
  inspectRequests(context);
  const page = await context.newPage();
  await page.goto(base);
  await expect(page.getByText('Für den Offline-Neustart bereit.',{exact:true})).toBeVisible({timeout:30000});
  const cache = await page.evaluate(async () => {
    const keys = await caches.keys(), paths = new Set();
    for (const key of keys) for (const request of await (await caches.open(key)).keys()) paths.add(new URL(request.url).pathname);
    return {keys,paths:[...paths].sort()};
  });
  const expectedImages = inventory.images.flatMap(row => row.currentWebFiles.map(file => '/' + file));
  const missing = expectedImages.filter(file => !cache.paths.includes(file));
  expect(missing).toEqual([]);
  report.offlineCache = {keys:cache.keys, referencedImagesCached:expectedImages.length, missing};
  await context.setOffline(true);
  for (const unit of units) report.offline.push(await loadStory(page, unit));
  for (const [section,route,check] of [
    ['Heute','/',p=>p.getByTestId('home-primary-action')],
    ['Bibel','/bibel',p=>p.getByRole('heading',{name:'Deine Bibel.',exact:true})],
    ['Wege','/wege',p=>p.getByTestId('path-list-item-jesus')],
    ['Mein Garten','/garten',p=>p.getByTestId('olive-tree')],
    ['Sammlung','/sammlung',p=>p.getByTestId('collection-tabs')],
    ['Reader','/lesen/MRK?chapter=4',p=>p.getByTestId('reader-flow')],
  ]) {
    await page.goto(base+route);
    await expect(check(page)).toBeVisible();
    if (section === 'Mein Garten') await expect.poll(() => check(page).evaluate(el=>el.olivaTree?.().stage)).toBe(0);
    report.offline.push({section, route, available:true});
  }
  await context.close();

  // Fresh contexts and disabled browser cache avoid counting warmed assets as network requests.
  for (const id of ['NS-0006','NS-0052','NS-0073']) {
    const ctx = await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,serviceWorkers:'block'});
    inspectRequests(ctx);
    const p = await ctx.newPage(), network = await ctx.newCDPSession(p);
    await network.send('Network.enable');
    await network.send('Network.setCacheDisabled',{cacheDisabled:true});
    await network.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:200000,uploadThroughput:93750,connectionType:'cellular3g'});
    report.coldLoads.push({lab:'1.6 Mbit/s down, 0.75 Mbit/s up, 150 ms added latency; one run with SW blocked and HTTP cache disabled',...await loadStory(p,units.find(unit=>unit.id===id))});
    await ctx.close();
  }
  expect(report.resources.filter(r=>!r.sameOrigin || r.method !== 'GET')).toEqual([]);
} catch (error) {
  report.failure = String(error.stack ?? error);
  process.exitCode = 1;
} finally {
  report.finishedAt = new Date().toISOString();
  await writeFile(`${out}/visual-and-offline.json`,JSON.stringify(report,null,2)+'\n');
  await browser.close(); server.kill('SIGTERM');
  console.log(JSON.stringify({visual:report.visual.length,coldLoads:report.coldLoads,offline:report.offline.length,resources:report.resources,errors:report.errors,failure:report.failure}));
}
