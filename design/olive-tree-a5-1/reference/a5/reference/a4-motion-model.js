/** Registered local leaf motion, in 1254px master coordinates. No product state. */
export const CONFIG=Object.freeze({size:1254,splitY:900,duration:8000,columns:72,rows:72,dx:[3.4,2.6,3.2],dy:[1.1,.8,1.2]});
// Main load-bearing axes. Each has a motion-free radius plus a soft outer reserve.
const wood=[
 {radius:58,points:[[650,1100],[650,980],[635,850],[580,750],[520,650],[480,550],[450,460],[435,380],[425,300],[440,210]]},
 {radius:28,points:[[600,690],[610,550],[590,440],[640,350],[690,270]]},
 {radius:35,points:[[520,650],[400,575],[300,560],[200,600]]},
 {radius:24,points:[[435,380],[340,340],[270,280]]},
 {radius:40,points:[[640,850],[800,780],[930,810],[940,660],[1000,540],[1030,430]]},
 {radius:26,points:[[940,770],[910,650],[890,560],[850,450]]},
];
export const STATIC_PROBES=Object.freeze([[650,1100],[650,980],[670,855],[532,658],[437,413],[815,795],[950,680],[425,300]]);
const regions=[{x:470,y:180,rx:270,ry:230},{x:210,y:620,rx:220,ry:260},{x:1040,y:500,rx:230,ry:340}];
const clamp=x=>Math.max(0,Math.min(1,x));
const smooth=x=>{const t=clamp(x);return t*t*(3-2*t);};
function distance(x,y,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],t=clamp(((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy));return Math.hypot(x-a[0]-dx*t,y-a[1]-dy*t);}
export function weightsAt(x,y){
 let guard=1-smooth((y-740)/70);
 for(const line of wood)for(let i=1;i<line.points.length;i++)guard=Math.min(guard,smooth((distance(x,y,line.points[i-1],line.points[i])-line.radius)/24));
 const w=regions.map(r=>guard*smooth(1-((x-r.x)/r.rx)**2-((y-r.y)/r.ry)**2)),sum=w.reduce((a,b)=>a+b,0);
 return sum>1?w.map(x=>x/sum):w;
}
export function pose(ms){
 if(ms<=0||ms>=CONFIG.duration)return{phase:[0,0,0],light:0};
 const t=ms/CONFIG.duration,envelope=Math.sin(Math.PI*t)**2;
 return{phase:[1.15,1.35,.85].map((speed,i)=>envelope*Math.sin(2*Math.PI*t*speed+i*1.2)),light:.012*envelope*Math.sin(2*Math.PI*t)};
}
export function displace(x,y,p){const w=weightsAt(x,y),ph=p.phase;return[x+w.reduce((s,a,i)=>s+a*CONFIG.dx[i]*ph[i],0),y+w.reduce((s,a,i)=>s+a*CONFIG.dy[i]*ph[(i+1)%3],0)];}
export function createMesh(){
 const points=[],weights=[],indices=[],{size,columns,rows}=CONFIG;
 for(let y=0;y<=rows;y++)for(let x=0;x<=columns;x++){// Integer source registration avoids rest-pose subpixel raster drift.
 const p=[Math.round(x/columns*size),Math.round(y/rows*size)];points.push(p);weights.push(weightsAt(...p));}
 for(let y=0;y<rows;y++)for(let x=0;x<columns;x++){const a=y*(columns+1)+x,b=a+1,c=a+columns+1,d=c+1;indices.push(a,b,c,b,d,c);}
 return{points,weights,indices};
}
