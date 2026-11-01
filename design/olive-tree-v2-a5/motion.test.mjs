import test from 'node:test';
import assert from 'node:assert/strict';
import {STAGES, windPose, referencePose, createMesh, offset, motionGain} from './motion-model.js';
import {createPerformancePolicy} from './performance-policy.js';

test('continuous wind remains active after eight seconds and has no eight-second repeat',()=>{
 assert.notDeepEqual(windPose(9000,6).phase,[0,0,0]);
 assert.notDeepEqual(windPose(60000,6).phase,[0,0,0]);
 assert.notDeepEqual(windPose(8000,6),windPose(16000,6));
 assert.deepEqual(referencePose(9000).phase,[0,0,0]);
});
test('roots and structural wood remain static in all seven stages',()=>{
 for(const stage of STAGES)for(const point of stage.probes)for(const t of[0,4000,17000,61000]){
  const mesh=createMesh(stage,40),p=windPose(t,stage.index);
  assert.deepEqual(offset(point,[0,0,0],p,motionGain(200,stage)),point);
  const w=mesh.weightAt(...point);assert(w.every(x=>x===0),stage.name+' protected '+point);
 }
});
test('stronger motion stays within visible mobile bounds without folding the connected mesh',()=>{
 for(const stage of STAGES){const mesh=createMesh(stage,40);let maximum=0,minArea=Infinity;
  for(let t=0;t<90000;t+=3700){const p=windPose(t,stage.index),gain=motionGain(200,stage);const v=mesh.points.map((point,i)=>offset(point,mesh.weights[i],p,gain));
   for(let i=0;i<v.length;i++)maximum=Math.max(maximum,Math.hypot(v[i][0]-mesh.points[i][0],v[i][1]-mesh.points[i][1])*200/1254);
   for(let i=0;i<mesh.indices.length;i+=3){const[a,b,c]=mesh.indices.slice(i,i+3).map(j=>v[j]);const area=(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);minArea=Math.min(minArea,area);assert(area>0,'folded '+stage.name);}
  }
  assert(minArea>0);if(stage.index===0)assert.equal(maximum,0);else assert(maximum>.6&&maximum<=3.2,stage.name+' '+maximum);
 }
 const s=STAGES[6];assert.equal(motionGain(200,s)*200,motionGain(300,s)*300);
});
test('weak performance degrades quality and then stops, without scaling motion amplitude',()=>{
 const p=createPerformancePolicy(false);p.resume(0);let now=0;
 for(let window=0;window<6;window++)for(let j=0;j<32;j++){now+=125;p.frame(now,30);}
 assert.equal(p.level,'static');
});
test('paused time does not count as a low-FPS performance sample',()=>{
 const p=createPerformancePolicy(false);p.resume(0);for(let i=1;i<=60;i++)p.frame(i*33.5,1);p.pause();p.resume(60000);for(let i=1;i<=60;i++)p.frame(60000+i*33.5,1);assert.equal(p.level,'high');
});
test('continuous operation keeps only a bounded rolling performance history',()=>{
 const p=createPerformancePolicy(false);p.resume(0);
 for(let frame=1;frame<=60000;frame++)p.frame(frame*1000/30,.1);
 assert(p.samples.length<=180,'Diagnostics grew without a bound: '+p.samples.length);
 assert.equal(p.level,'high');
 assert(p.samples.at(-1).milliseconds>1900000);
});
