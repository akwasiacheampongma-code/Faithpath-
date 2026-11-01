/** Mesh bounds measured in CSS coordinates; these are model, not device FPS. */
import fs from 'node:fs/promises';
import {STAGES,createMesh,windPose,referencePose,motionGain,offset} from './motion-model.js';
const rows=[];
for(const stage of STAGES){
 const mesh=createMesh(stage,40);let maxCSS=0,minDoubleArea=Infinity,peakMs=0,peakPoint=null;
 for(let ms=0;ms<=120000;ms+=250){
  const p=windPose(ms,stage.index),g=motionGain(200,stage),v=mesh.points.map((point,i)=>offset(point,mesh.weights[i],p,g));
  for(let i=0;i<v.length;i++){const d=Math.hypot(v[i][0]-mesh.points[i][0],v[i][1]-mesh.points[i][1])*200/1254;if(d>maxCSS){maxCSS=d;peakMs=ms;peakPoint=mesh.points[i];}}
  for(let i=0;i<mesh.indices.length;i+=3){const[a,b,c]=mesh.indices.slice(i,i+3).map(k=>v[k]);minDoubleArea=Math.min(minDoubleArea,(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]));}
 }
 rows.push({stage:stage.index,name:stage.name,maxVectorExcursionCSSPixelsAt200:maxCSS,maxVectorExcursionCSSPixelsAt300:maxCSS,peakMs,peakPoint,minDoubleTriangleAreaSourcePixels:minDoubleArea});
}
const mesh=createMesh(STAGES[6],72,true);let oldMax=0;
for(let ms=0;ms<=8000;ms+=40){const p=referencePose(ms);for(let i=0;i<mesh.points.length;i++){const a=mesh.points[i],b=offset(a,mesh.weights[i],p,1);oldMax=Math.max(oldMax,Math.hypot(a[0]-b[0],a[1]-b[1])*200/1254);}}
const result={scope:'Deterministic mesh displacement, 0–120seconds sampled250ms; 40x40 lowest grid; originalA4 profile sampled40ms. These are local excursions from rest, not peak-to-peak sway, and not FPS measurements.',stages:rows,referenceA4MaxCSSAt200:oldMax};
await fs.writeFile(new URL('./evidence/geometry.json',import.meta.url),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
