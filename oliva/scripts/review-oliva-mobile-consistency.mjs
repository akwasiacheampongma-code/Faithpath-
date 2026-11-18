import { chromium, expect as baseExpect } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';

const directory = path.resolve(process.argv[2] ?? 'dist');
const out = process.argv[3] ?? 'docs/evidence/image-review-final';
const baseline = JSON.parse(await readFile(`${out}/baseline.json`, 'utf8'));
const expect = baseExpect.configure({timeout: 20000});
const port = await new Promise(resolve => {
  const probe = net.createServer();
  probe.listen(0,'127.0.0.1',() => {const {port} = probe.address(); probe.close(() => resolve(port));});
});
const origin = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath,['scripts/serve.mjs',directory],{env:{...process.env,PORT:String(port)},stdio:'ignore'});
for (let i=0; i<50; i++) {
  try { if ((await fetch(origin)).ok) break; } catch {}
  await new Promise(resolve=>setTimeout(resolve,100));
}
const browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH??'/usr/bin/chromium',args:['--no-sandbox']});
const report = {build:baseline.privateBuild, syntheticProfile:true, actualDeviceTest:false,
  environment:'Local Chromium, locally served private deployment package', matrix:[], pageErrors:0, widths:[320,375,390,430]};
const areas = [
  ['heute','/','[data-testid="home-primary-action"]'],
  ['bibel','/bibel','input[aria-label="Buch suchen"]'],
  ['wege','/wege','[data-testid="path-list-item-jesus"]'],
  ['garten','/garten','[data-testid="olive-tree"]'],
  ['sammlung','/sammlung','[data-testid="collection-tabs"]'],
  ['reader','/lesen/MRK?chapter=4&mode=read','[data-testid="reader-flow"]'],
];
const button = (page,name) => page.getByRole('button',{name,exact:true});

async function seed(page,theme) {
  await page.goto(origin+'/einstellungen');
  await page.getByRole('textbox',{name:'Dein Vorname (freiwillig)',exact:true}).fill('Mara');
  await button(page,'Namen speichern').click();
  await expect(button(page,'Namen speichern')).toBeDisabled();
  await page.evaluate(theme=>new Promise((resolve,reject)=>{
    const open = indexedDB.open('oliva-local-v1',1);
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const db = open.result, tx = db.transaction('state','readwrite'), store = tx.objectStore('state'), main=store.get('main');
      main.onsuccess=()=>{
        const record=main.result,data=record.data;
        Object.assign(data.settings,{theme,reducedMotion:true});
        data.onboarded=true;
        data.growthStage=4;
        data.reading={book:'MRK',chapter:4};
        data.readingPosition=null;
        data.readChapters=['PSA:23'];
        data.bookmarks=['PSA:23:1'];
        data.notes=[{id:'review-note',kind:'note',text:'Ein vorhandener Gedanke im synthetischen Profil.',createdAt:'2026-11-17T10:00:00.000Z',updatedAt:'2026-11-17T10:00:00.000Z'}];
        data.revision++;
        store.put(record,'main');
      };
      tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>reject(tx.error);
    };
  }),theme);
}

try {
  await mkdir(`${out}/mobile`,{recursive:true});
  for (const theme of ['light','dark']) {
    const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,colorScheme:theme,reducedMotion:'reduce'});
    const page=await context.newPage();
    page.on('pageerror',()=>report.pageErrors++);
    await page.clock.setFixedTime(new Date('2026-11-18T09:00:00Z'));
    await seed(page,theme);
    for (const [width,height] of [[320,568],[375,812],[390,844],[430,932]]) for (const [area,route,focus] of areas) {
      await page.setViewportSize({width,height});
      await page.goto(origin+route);
      const main=page.getByRole('main');
      await expect(main).toBeVisible();
      await expect(page.locator('meta[name="oliva-build"]')).toHaveAttribute('content',baseline.privateBuild);
      await expect(button(page,theme==='dark'?'Hellen Modus aktivieren':'Dunklen Modus aktivieren')).toBeVisible();
      await expect(page.getByText('Für den Offline-Neustart bereit.',{exact:true})).toBeVisible({timeout:30000});
      if(area==='garten')await expect.poll(()=>page.getByTestId('olive-tree').evaluate(el=>el.olivaTree?.().stage)).toBe(4);
      const target=main.locator(focus).first();
      await expect(target).toBeVisible();
      await page.evaluate(()=>document.fonts.ready);
      await expect.poll(()=>main.locator('img').evaluateAll(images=>images.every(image=>image.complete&&image.naturalWidth>0))).toBe(true);
      await main.evaluate(el=>el.scrollTop=0);
      const measurements=await main.evaluate((el,selector)=>{
        const rect=el.getBoundingClientRect(),target=el.querySelector(selector).getBoundingClientRect();
        const heading=el.querySelector('h1,[role="heading"]');
        return {noHorizontalOverflow:el.scrollWidth<=el.clientWidth+1 && document.documentElement.scrollWidth<=innerWidth,
          targetTop:Math.round(target.top),targetStartsBeforeBottom:target.top<rect.bottom,
          firstHeading:heading?.textContent??null,headingFont:heading?getComputedStyle(heading).fontFamily:null,
          viewportContentHeight:Math.round(rect.height),mainBottom:Math.round(rect.bottom),
          assetCount:el.querySelectorAll('img').length};
      },focus);
      expect(measurements.noHorizontalOverflow).toBe(true);
      const nav=page.getByRole('navigation',{name:'Hauptnavigation',exact:true});
      await expect(nav).toHaveCount(area==='reader'?0:1);
      const file=width===320||width===390?`mobile/${area}-${width}-${theme}.png`:null;
      if(file)await page.screenshot({path:`${out}/${file}`,animations:'disabled',scale:'css'});
      report.matrix.push({area,width,height,theme,file,...measurements});
    }
    await context.close();
  }
  expect(report.pageErrors).toBe(0);
  report.passed=true;
} catch(error) {
  report.failure=String(error.stack??error);
  report.passed=false;
  process.exitCode=1;
} finally {
  await writeFile(`${out}/mobile-consistency.json`,JSON.stringify(report,null,2)+'\n');
  await browser.close();server.kill('SIGTERM');
  console.log(JSON.stringify({passed:report.passed,scenes:report.matrix.length,numberOfScreenshots:report.matrix.filter(x=>x.file).length,pageErrors:report.pageErrors,failure:report.failure}));
}
