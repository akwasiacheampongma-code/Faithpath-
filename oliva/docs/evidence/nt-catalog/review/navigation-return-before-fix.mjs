import { chromium, expect } from '/workspace/faithpath-next/node_modules/@playwright/test/index.mjs';
import { readFile, writeFile } from 'node:fs/promises';
const source=JSON.parse(await readFile('/workspace/faithpath-next/src/data/nt-catalog.json','utf8'));
const chapter=source.chapters.find(c=>c.book==='MRK'&&c.chapter===4), question=chapter.questions[0];
const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:390,height:844}, serviceWorkers:'block'}), page=await context.newPage();
const button=(name)=>page.getByRole('button',{name,exact:true}).filter({visible:true});
const readMain=()=>page.evaluate(()=>new Promise((resolve,reject)=>{const q=indexedDB.open('oliva-local-v1',1);q.onsuccess=()=>{const db=q.result,tx=db.transaction('state','readonly'),r=tx.objectStore('state').get('main');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);tx.oncomplete=()=>db.close()};q.onerror=()=>reject(q.error)}));
const result={testedAt:new Date().toISOString(),scope:'Independent local Chromium probe only; no hosted or native device check',sourceQuestionId:question.id};
try {
 await page.goto('http://localhost:4173/verstehen/MRK?chapter=4');
 await expect(page.getByTestId('nt-question-heading').filter({visible:true})).toHaveText(question.prompt);
 result.build=await page.locator('meta[name="oliva-build"]').getAttribute('content');
 await page.evaluate(()=>{
   const prototype=IDBTransaction.prototype, property=Object.getOwnPropertyDescriptor(prototype,'oncomplete'); let armed=true;
   Object.defineProperty(prototype,'oncomplete',{configurable:true,get:property.get,set(handler){if(armed&&this.mode==='readwrite'){armed=false;property.set.call(this,event=>{window.__releaseNt=()=>{Object.defineProperty(prototype,'oncomplete',property);handler.call(this,event)}})}else property.set.call(this,handler)}});
 });
 await button('Nächste Frage').click();
 await expect.poll(()=>page.evaluate(()=>typeof window.__releaseNt)).toBe('function');
 result.pendingNavigationDisabled=await button('Nächste Frage').isDisabled();
 await button('Das ganze Kapitel lesen').click();
 await expect(page).toHaveURL(/\/lesen\/MRK/);
 result.leftBeforePersistenceCallback=true;
 await page.evaluate(()=>window.__releaseNt());
 await expect.poll(async()=>{const value=await readMain();return value?.data?.ntStudy?.position?.index === 1}).toBe(true);
 await page.goBack();
 await expect(page.getByTestId('nt-question-heading').filter({visible:true})).toHaveText(question.prompt);
 result.returnedView={answerCheckCount:await button('Antwort prüfen').count(),answerChangeCount:await button('Antwort ändern').count(),alerts:await page.getByRole('alert').allTextContents()};
 result.savedPosition=(await readMain()).data.ntStudy.position; result.visibleHeading=await page.getByTestId('nt-question-heading').filter({visible:true}).textContent();
 await page.screenshot({path:'/tmp/nt-navigation-return.png',fullPage:true});
 result.probeCompleted=true;
} catch(error){result.probeError=String(error);result.currentURL=page.url();await page.screenshot({path:'/tmp/nt-navigation-review-error.png',fullPage:true}).catch(()=>{});process.exitCode=1}
finally{await writeFile('/tmp/nt-navigation-review.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));await browser.close()}
