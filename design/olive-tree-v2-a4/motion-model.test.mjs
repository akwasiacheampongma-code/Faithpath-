/* Risks: displaced wood, gaps at plate seam and folded raster mesh. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG, createMesh, pose, displace, STATIC_PROBES } from './motion-model.js';
test('documented wood/root points and the plate seam remain exactly static',()=>{
 for(const ms of[0,1000,2500,4000,6500,8000]){
  const p=pose(ms);
  for(const point of STATIC_PROBES)assert.deepEqual(displace(...point,p),point);
  for(let x=0;x<=1254;x+=17)assert.deepEqual(displace(x,CONFIG.splitY,p),[x,CONFIG.splitY]);
 }
});
test('a finite motion starts and ends at the exact rest pose and moves foliage in between',()=>{
 const point=[1100,360];
 for(const ms of[-1,0,CONFIG.duration,CONFIG.duration+1])assert.deepEqual(displace(...point,pose(ms)),point);
 assert.notDeepEqual(displace(...point,pose(3200)),point);
});
test('the connected mesh never folds or opens independent region seams',()=>{
 const mesh=createMesh();let largest=0,smallest=Infinity;
 for(let t=0;t<=CONFIG.duration;t+=125){const p=pose(t),v=mesh.points.map(([x,y])=>displace(x,y,p));
  for(let i=0;i<v.length;i++)largest=Math.max(largest,Math.hypot(v[i][0]-mesh.points[i][0],v[i][1]-mesh.points[i][1]));
  for(let i=0;i<mesh.indices.length;i+=3){const[a,b,c]=mesh.indices.slice(i,i+3).map(k=>v[k]);const area=(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);smallest=Math.min(smallest,area);assert(area>0,'folded triangle at '+t);}
 }
 assert(largest>0&&largest<=5,'displacement must stay within 5 source pixels');assert(smallest>0);
});
