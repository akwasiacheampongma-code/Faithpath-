/** One connected texture mesh. All vertices share edges; no independent crown cut-outs. */
import { CONFIG,createMesh,pose } from './motion-model.js';
const vertex=`
attribute vec2 a_position;
attribute vec3 a_weights;
uniform vec3 u_phase;
varying vec2 v_uv;
varying float v_leaf;
void main(){
 vec2 offset=vec2(dot(a_weights,u_phase*vec3(${CONFIG.dx.join(',')})),dot(a_weights,u_phase.yzx*vec3(${CONFIG.dy.join(',')})));
 vec2 position=(a_position+offset)/${CONFIG.size.toFixed(1)};
 gl_Position=vec4(position.x*2.0-1.0,1.0-position.y*2.0,0.0,1.0);
 v_uv=a_position/${CONFIG.size.toFixed(1)};
 v_leaf=dot(a_weights,vec3(1.0));
}`;
const fragment=`precision highp float;
uniform sampler2D u_image;
uniform float u_light;
varying vec2 v_uv;
varying float v_leaf;
void main(){vec4 color=texture2D(u_image,v_uv);gl_FragColor=vec4(color.rgb*(1.0+u_light*v_leaf),color.a);}`;
function shader(gl,type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
export async function createLeafRenderer(canvas,source,{onLost=()=>{}}={}){
 const gl=canvas.getContext('webgl',{alpha:true,antialias:false,premultipliedAlpha:true,preserveDrawingBuffer:true});
 if(!gl)throw Error('WebGL ist nicht verfügbar.');
 if(!gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER,gl.HIGH_FLOAT).precision)throw Error('Die Grafikpräzision reicht für diese Zeichnung nicht aus.');
 const image=new Image();image.src=source;await image.decode();
 const program=gl.createProgram(),vs=shader(gl,gl.VERTEX_SHADER,vertex),fs=shader(gl,gl.FRAGMENT_SHADER,fragment);
 gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);
 const mesh=createMesh(),data=new Float32Array(mesh.points.flatMap((p,i)=>[...p,...mesh.weights[i]])),buffer=gl.createBuffer(),indices=gl.createBuffer();
 gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);
 for(const[name,size,offset]of[['a_position',2,0],['a_weights',3,8]]){const a=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,size,gl.FLOAT,false,20,offset);}
 gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indices);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(mesh.indices),gl.STATIC_DRAW);
 const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
 const phaseUniform=gl.getUniformLocation(program,'u_phase'),lightUniform=gl.getUniformLocation(program,'u_light');gl.uniform1i(gl.getUniformLocation(program,'u_image'),0);gl.disable(gl.BLEND);gl.clearColor(0,0,0,0);
 let current=0,lost=false,frames=0;
 function draw(ms=0){if(lost)return;current=ms;const p=pose(ms);gl.viewport(0,0,canvas.width,canvas.height);gl.clear(gl.COLOR_BUFFER_BIT);gl.uniform3fv(phaseUniform,p.phase);gl.uniform1f(lightUniform,p.light);gl.drawElements(gl.TRIANGLES,mesh.indices.length,gl.UNSIGNED_SHORT,0);frames++;}
 function resize(size){const r=Math.min(CONFIG.size,Math.max(1,Math.round(size)));if(canvas.width!==r){canvas.width=canvas.height=r;}draw(current);}
 const contextLost=e=>{e.preventDefault();lost=true;onLost();};canvas.addEventListener('webglcontextlost',contextLost);
 resize(canvas.clientWidth||390);
 return{draw,resize,get frames(){return frames;},get time(){return current;},get lost(){return lost;},get gl(){return gl;},get mesh(){return mesh;},pixels(){draw(current);const pixels=new Uint8Array(canvas.width*canvas.height*4);gl.readPixels(0,0,canvas.width,canvas.height,gl.RGBA,gl.UNSIGNED_BYTE,pixels);return pixels;},dispose(){canvas.removeEventListener('webglcontextlost',contextLost);lost=true;gl.deleteTexture(texture);gl.deleteBuffer(buffer);gl.deleteBuffer(indices);gl.deleteProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);}};
}
