import { chromium } from '/workspace/faithpath-next/node_modules/@playwright/test/index.mjs';
import { readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
const root='/workspace/oliva-v09-art-preparation';
// Serve only the three named local review files on a loopback ephemeral port.
// Chromium's managed policy disallows file://; no policy or flags are changed.
const allowed=new Map([
 ['/review.html',['review.html','text/html; charset=utf-8']],
 ['/masters/romans-grace-pilot.png',['masters/romans-grace-pilot.png','image/png']],
 ['/references/john-life-original-reference.png',['references/john-life-original-reference.png','image/png']],
]);
const server=createServer(async(req,res)=>{const asset=allowed.get(new URL(req.url,'http://localhost').pathname);if(!asset){res.writeHead(404);res.end();return;}try{const data=await readFile(path.join(root,asset[0]));res.writeHead(200,{'Content-Type':asset[1],'Cache-Control':'no-store'});res.end(data);}catch{res.writeHead(500);res.end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser;
try{
 browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1100,height:1800},deviceScaleFactor:1});
 await page.goto(`http://127.0.0.1:${server.address().port}/review.html`);
 await page.locator('img').evaluateAll(async images=>{await Promise.all(images.map(im=>im.decode()));if(images.some(im=>!im.complete||im.naturalWidth===0))throw Error('Actual image decode failed');});
 await page.screenshot({path:path.join(root,'background-review.png'),fullPage:true});
 await writeFile(path.join(root,'background-review.json'),JSON.stringify({browser:browser.version(),scope:'Actual local Chromium rendering of unchanged master files on CSS cream/dark backgrounds; not product, simulator, physical-device or specialist acceptance.',earlierFileProtocolAttempt:'Chromium ERR_BLOCKED_BY_ADMINISTRATOR; no flags/policy changed. Normal loopback HTTP review used instead.',images:await page.locator('img').evaluateAll(images=>images.map(im=>({src:im.getAttribute('src'),width:im.naturalWidth,height:im.naturalHeight,decoded:im.complete&&im.naturalWidth>0})))},null,2)+'\n');
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
