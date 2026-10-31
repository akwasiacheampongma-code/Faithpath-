import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {chromium} from 'playwright';
const root=path.dirname(fileURLToPath(import.meta.url));
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try{
 for(const directory of ['layers','composites'])fs.rmSync(path.join(root,'assets',directory),{recursive:true,force:true});
 const p=await browser.newPage();
 await p.exposeFunction('saveAsset',async(relative,data)=>{if(!/^assets\/(layers|composites)\/[a-zA-Z0-9-]+\.png$/.test(relative))throw Error('Invalid export path');const file=path.join(root,relative);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,Buffer.from(data,'base64'));});
 await p.exposeFunction('saveManifest',async m=>{fs.writeFileSync(path.join(root,'manifest.json'),JSON.stringify(m,null,2)+'\n');fs.writeFileSync(path.join(root,'manifest.js'),'window.OLIVE_A3 = '+JSON.stringify(m,null,2)+';\n');});
 await p.goto((process.env.OLIVE_A3_ORIGIN||'http://127.0.0.1:4733')+'/export.html');await p.waitForFunction(()=>!!window.OLIVE_COMPILER);
 console.log(JSON.stringify(await p.evaluate(()=>window.OLIVE_COMPILER.run())));
 // Preserve both original close-ups byte-for-byte, rather than re-encoding them.
 for(const [original,output]of [['01-samen.png','stage-1.png'],['02-keimling.png','stage-2.png']])fs.copyFileSync(path.join(root,'reference-a2',original),path.join(root,'assets/composites',output));
}finally{await browser.close();}
