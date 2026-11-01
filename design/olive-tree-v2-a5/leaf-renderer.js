/** A4's connected texture mesh, evolved in place: one shader, one texture,
 * shared edges. Source wood is never a moving cut-out. No app dependencies. */
import {SIZE,createMesh,dirtyRect,motionGain,restPose} from './motion-model.js';
const vertex=`
attribute vec2 a_position;
attribute vec3 a_weights;
uniform vec3 u_x;
uniform vec3 u_y;
uniform float u_gain;
varying vec2 v_uv;
varying float v_leaf;
void main(){
 vec2 offset=vec2(dot(a_weights,u_x),dot(a_weights,u_y))*u_gain;
 vec2 position=(a_position+offset)/1254.0;
 gl_Position=vec4(position.x*2.0-1.0,1.0-position.y*2.0,0.0,1.0);
 v_uv=a_position/1254.0;
 v_leaf=dot(a_weights,vec3(1.0));
}`;
const fragment=`precision highp float;
uniform sampler2D u_image;
uniform float u_light;
varying vec2 v_uv;
varying float v_leaf;
void main(){vec4 c=texture2D(u_image,v_uv);gl_FragColor=vec4(c.rgb*(1.0+u_light*v_leaf),c.a);}`;
function compile(gl,type,source){
 const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);
 if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){const message=gl.getShaderInfoLog(shader);gl.deleteShader(shader);throw Error(message);}
 return shader;
}
export function createLeafRenderer(canvas,{onLost=()=>{}}={}){
 const gl=canvas.getContext('webgl',{alpha:true,antialias:false,premultipliedAlpha:true,preserveDrawingBuffer:true});
 if(!gl)throw Error('WebGL ist nicht verfügbar.');
 if(!gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER,gl.HIGH_FLOAT).precision)throw Error('Grafikpräzision nicht ausreichend.');
 const vs=compile(gl,gl.VERTEX_SHADER,vertex),fs=compile(gl,gl.FRAGMENT_SHADER,fragment),program=gl.createProgram();
 gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
 if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
 gl.useProgram(program);
 const vertices=gl.createBuffer(),indices=gl.createBuffer(),texture=gl.createTexture();
 const uniforms=Object.fromEntries(['u_x','u_y','u_gain','u_light'].map(name=>[name,gl.getUniformLocation(program,name)]));
 gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);
 for(const [name,value]of [[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,name,value);
 gl.uniform1i(gl.getUniformLocation(program,'u_image'),0);gl.disable(gl.BLEND);gl.clearColor(0,0,0,0);
 let stage=null,mesh=null,reference=false,cells=72,cssWidth=300,dpr=1,lost=false,disposed=false,needsFull=true;
 let frames=0,lastPose=restPose(),lastCost=0,lastArea=1;
 function geometry(){
  mesh=createMesh(stage,cells,reference);
  const data=new Float32Array(mesh.points.flatMap((point,i)=>[...point,...mesh.weights[i]]));
  gl.bindBuffer(gl.ARRAY_BUFFER,vertices);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);
  for(const[name,size,offset]of [['a_position',2,0],['a_weights',3,8]]){const a=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,size,gl.FLOAT,false,20,offset);}
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indices);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(mesh.indices),gl.STATIC_DRAW);needsFull=true;
 }
 function draw(pose=lastPose,{full=false}={}){
  if(lost||disposed||!stage)return 0;
  const started=performance.now();lastPose=pose;
  gl.viewport(0,0,canvas.width,canvas.height);
  if(!needsFull&&!full){
   const r=dirtyRect(stage),scale=canvas.width/SIZE,x=Math.floor(r.x*scale),top=Math.floor(r.y*scale),right=Math.ceil((r.x+r.width)*scale),bottom=Math.ceil((r.y+r.height)*scale);
   gl.enable(gl.SCISSOR_TEST);gl.scissor(x,canvas.height-bottom,right-x,bottom-top);lastArea=(right-x)*(bottom-top)/(canvas.width*canvas.height);
  }else{gl.disable(gl.SCISSOR_TEST);lastArea=1;}
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.uniform3fv(uniforms.u_x,pose.x);gl.uniform3fv(uniforms.u_y,pose.y);
  gl.uniform1f(uniforms.u_gain,reference?1:motionGain(cssWidth,stage));gl.uniform1f(uniforms.u_light,pose.light);
  gl.drawElements(gl.TRIANGLES,mesh.indices.length,gl.UNSIGNED_SHORT,0);
  gl.disable(gl.SCISSOR_TEST);needsFull=false;frames++;lastCost=performance.now()-started;return lastCost;
 }
 function resize(width,cap=dpr){
  cssWidth=Math.max(1,width);dpr=cap;
  const resolution=Math.min(SIZE,Math.max(1,Math.round(cssWidth*Math.min(devicePixelRatio||1,dpr))));
  if(canvas.width!==resolution){canvas.width=canvas.height=resolution;needsFull=true;}
 }
 function setStage(next,image,{mode='continuous',grid=cells}={}){
  if(disposed||lost)return;
  stage=next;reference=mode==='reference';cells=grid;geometry();
  gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);lastPose=restPose();needsFull=true;
 }
 function setQuality(settings){if(settings.cells!==cells&&stage){cells=settings.cells;geometry();}resize(cssWidth,settings.dpr);}
 const contextLost=e=>{e.preventDefault();lost=true;onLost();};canvas.addEventListener('webglcontextlost',contextLost);
 return{
  draw,resize,setStage,setQuality,
  get lost(){return lost;},get mesh(){return mesh;},get gl(){return gl;},
  get metrics(){return{frames,submitMs:lastCost,resolution:canvas.width,cssWidth,gain:stage?(reference?1:motionGain(cssWidth,stage)):0,updatedArea:lastArea,cells,disposed,lost};},
  pixels(){const data=new Uint8Array(canvas.width*canvas.height*4);gl.readPixels(0,0,canvas.width,canvas.height,gl.RGBA,gl.UNSIGNED_BYTE,data);return data;},
  dispose(){if(disposed)return;disposed=true;canvas.removeEventListener('webglcontextlost',contextLost);gl.deleteTexture(texture);gl.deleteBuffer(vertices);gl.deleteBuffer(indices);gl.deleteProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);}
 };
}
