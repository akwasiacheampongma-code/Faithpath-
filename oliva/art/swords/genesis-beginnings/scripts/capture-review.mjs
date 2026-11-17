import { chromium } from "@playwright/test";
import { readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const project=path.resolve(root,'../../..');
const allowed=new Map([
 ['/review.html',[path.join(root,'review.html'),'text/html; charset=utf-8']],
 ['/genesis.png',[path.join(root,'masters/genesis-beginnings-pilot.png'),'image/png']],
 ['/genesis-256.png',[path.join(root,'variants/genesis-beginnings-pilot-256.png'),'image/png']],
 ['/genesis-512.png',[path.join(root,'variants/genesis-beginnings-pilot-512.png'),'image/png']],
 ['/john.png',[path.join(project,'art/swords/masters/john-life-pilot.png'),'image/png']],
 ['/romans.png',[path.join(project,'art/swords/romans-grace/masters/romans-grace-pilot.png'),'image/png']],
 ['/fonts/DM.ttf',[path.join(project,'assets/fonts/DMSans.ttf'),'font/ttf']],
 ['/fonts/Cormorant.ttf',[path.join(project,'assets/fonts/CormorantGaramond.ttf'),'font/ttf']],
]);
const server=createServer(async(req,res)=>{const asset=allowed.get(new URL(req.url,'http://localhost').pathname);if(!asset){res.writeHead(404);res.end();return;}try{res.writeHead(200,{'Content-Type':asset[1],'Cache-Control':'no-store'});res.end(await readFile(asset[0]));}catch{res.writeHead(500);res.end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser;
try{
 browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const captures=[];
 for(const width of [1100,390]){
  const page=await browser.newPage({viewport:{width,height:1800},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(`http://127.0.0.1:${server.address().port}/review.html`);
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(im=>im.decode()));});
  const images=await page.locator('img').evaluateAll(items=>items.map(im=>({src:im.getAttribute('src'),naturalWidth:im.naturalWidth,naturalHeight:im.naturalHeight,decoded:im.complete&&im.naturalWidth>0,cssWidth:im.getBoundingClientRect().width,cssHeight:im.getBoundingClientRect().height})));
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
  if(errors.length||overflow||images.some(im=>!im.decoded))throw Error('Review rendering failure');
  const screenshot=`background-review-${width}.png`;
  await page.screenshot({path:path.join(root,screenshot),fullPage:true});
  captures.push({width,deviceScaleFactor:1,screenshot,sha256:createHash('sha256').update(await readFile(path.join(root,screenshot))).digest('hex'),images,overflow,pageErrors:errors});
  await page.close();
 }
 await writeFile(path.join(root,'background-review.json'),JSON.stringify({checkedAt:new Date().toISOString(),browser:browser.version(),scope:'Actual local Chromium CSS composition at1100/390px with unchanged masters, actual fonts and actual OLIVA surface tokens; not product, hosted, simulator, physical-device or specialist acceptance.',captures},null,2)+'\n');
 console.log(JSON.stringify({captures:captures.map(c=>({width:c.width,screenshot:c.screenshot,allImagesDecoded:c.images.every(im=>im.decoded),overflow:c.overflow}))}));
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
