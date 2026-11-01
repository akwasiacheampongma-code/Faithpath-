/** Numeric illustration-space evidence, not a physical smartphone measurement. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {STAGES,sampleDisplacement,weightsAt} from '../motion-model.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const png=path.join(root,'assets/masters/stage-7.png');
const probe=spawnSync('python3',['-c',"from PIL import Image\nimport json,sys\na=Image.open(sys.argv[1]).getchannel('A');print(json.dumps([[x,y] for y in range(30,900,12) for x in range(30,1230,12) if a.getpixel((x,y))>192]))",png],{encoding:'utf8'});
if(probe.status!==0)throw Error(probe.stderr);
const points=JSON.parse(probe.stdout),stage=STAGES[6],row={study:'A51',method:'Alpha>192 original stage7 pixels on12px grid; pure model at200CSSpx; sampled every250ms across120s. Not physical device optical tracking.',sampleCount:points.length,outer:{maximumCSS:0},inner:{maximumCSS:0}};
for(const p of points){const w=weightsAt(...p,stage),outer=w.slice(0,3).reduce((a,b)=>a+b,0),inner=w.slice(3).reduce((a,b)=>a+b,0);const area=outer>.85?'outer':inner>.85?'inner':null;if(!area)continue;for(let ms=0;ms<=120000;ms+=250){const excursion=Math.hypot(...sampleDisplacement(...p,ms,stage,200));if(excursion>row[area].maximumCSS)row[area]={maximumCSS:excursion,point:p,ms};}}
await fs.writeFile(path.join(root,'evidence/displacement.json'),JSON.stringify(row,null,2)+'\n');console.log(JSON.stringify(row));
