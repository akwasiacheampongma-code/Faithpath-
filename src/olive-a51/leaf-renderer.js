/** One evolved A4/WebGL renderer. Complete immutable texture, shared mesh,
 * six local fields and a real motion margin. No scheduling or DOM observers. */
import { SIZE, PAD_CSS, ANCHOR } from './config.js';
import { createMesh, dirtyBounds, restPose } from './motion-model.js';
const vertex = `
attribute vec2 a_position;
attribute vec3 a_weights0;
attribute vec3 a_weights1;
uniform vec3 u_x0; uniform vec3 u_x1;
uniform vec3 u_y0; uniform vec3 u_y1;
uniform float u_sourcePerCSS; uniform float u_padding;
uniform float u_artScale;
varying vec2 v_uv; varying float v_leaf;
void main(){
 vec2 offset=vec2(dot(a_weights0,u_x0)+dot(a_weights1,u_x1),dot(a_weights0,u_y0)+dot(a_weights1,u_y1))*u_sourcePerCSS;
 vec2 art=(a_position-vec2(${ANCHOR[0]}.0,${ANCHOR[1]}.0))*u_artScale+vec2(${ANCHOR[0]}.0,${ANCHOR[1]}.0);
 vec2 position=(art+offset+u_padding)/(${SIZE}.0+2.0*u_padding);
 gl_Position=vec4(position.x*2.0-1.0,1.0-position.y*2.0,0.0,1.0);
 v_uv=a_position/${SIZE}.0;
 v_leaf=dot(a_weights0+a_weights1,vec3(1.0));
}`;
const fragment = `precision highp float;
uniform sampler2D u_image; uniform float u_light;
varying vec2 v_uv; varying float v_leaf;
void main(){vec4 c=texture2D(u_image,v_uv);gl_FragColor=vec4(clamp(c.rgb*(1.0+u_light*v_leaf),vec3(0.0),vec3(c.a)),c.a);}`;
function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw Error(message);
  }
  return shader;
}
export function createLeafRenderer(
  canvas,
  { profile = 'a51', onLost = () => {} } = {},
) {
  const gl = canvas.getContext('webgl', {
    alpha: true,
    antialias: false,
    premultipliedAlpha: true,
    preserveDrawingBuffer: true,
  });
  if (!gl) throw Error('WebGL nicht verfügbar.');
  if (!gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT).precision)
    throw Error('Grafikpräzision nicht ausreichend.');
  const shaders = [],
    buffers = [],
    program = gl.createProgram();
  let texture = null,
    disposed = false,
    lost = false;
  try {
    // Register each handle immediately so a later compiler failure cannot
    // orphan an already allocated shader.
    shaders.push(compile(gl, gl.VERTEX_SHADER, vertex));
    shaders.push(compile(gl, gl.FRAGMENT_SHADER, fragment));
    for (const shader of shaders) gl.attachShader(program, shader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
      throw Error(gl.getProgramInfoLog(program));
    gl.useProgram(program);
    buffers.push(gl.createBuffer(), gl.createBuffer());
    texture = gl.createTexture();
  } catch (error) {
    for (const shader of shaders) gl.deleteShader(shader);
    for (const buffer of buffers) gl.deleteBuffer(buffer);
    gl.deleteTexture(texture);
    gl.deleteProgram(program);
    throw error;
  }
  const uniforms = Object.fromEntries(
    [
      'u_x0',
      'u_x1',
      'u_y0',
      'u_y1',
      'u_sourcePerCSS',
      'u_padding',
      'u_artScale',
      'u_light',
    ].map((name) => [name, gl.getUniformLocation(program, name)]),
  );
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  for (const [key, value] of [
    [gl.TEXTURE_MIN_FILTER, gl.LINEAR],
    [gl.TEXTURE_MAG_FILTER, gl.LINEAR],
    [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE],
    [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE],
  ])
    gl.texParameteri(gl.TEXTURE_2D, key, value);
  gl.uniform1i(gl.getUniformLocation(program, 'u_image'), 0);
  gl.disable(gl.BLEND);
  gl.clearColor(0, 0, 0, 0);
  let stage = null,
    mesh = null,
    cells = 80,
    width = 0,
    dpr = 1.5,
    needsFull = true,
    lastPose = restPose(),
    frames = 0,
    lastCost = 0,
    lastArea = 1,
    sourceWidth = 0;
  function geometry() {
    mesh = createMesh(stage, cells, profile);
    const data = new Float32Array(
      mesh.points.flatMap((point, i) => [...point, ...mesh.weights[i]]),
    );
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers[0]);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    for (const [name, size, offset] of [
      ['a_position', 2, 0],
      ['a_weights0', 3, 8],
      ['a_weights1', 3, 20],
    ]) {
      const a = gl.getAttribLocation(program, name);
      gl.enableVertexAttribArray(a);
      gl.vertexAttribPointer(a, size, gl.FLOAT, false, 32, offset);
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers[1]);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(mesh.indices),
      gl.STATIC_DRAW,
    );
    needsFull = true;
  }
  function resize(cssWidth, cap = dpr) {
    // A hidden width is not a meaningful raster size. In particular, never
    // replace a valid paused scene with A5's 2x2 hidden framebuffer.
    if (!(cssWidth > 0) || disposed || lost) return false;
    const changed = width !== cssWidth;
    width = cssWidth;
    dpr = cap;
    const display = width + 2 * PAD_CSS,
      resolution = Math.min(
        1024,
        Math.max(1, Math.round(display * Math.min(devicePixelRatio || 1, dpr))),
      );
    canvas.style.width = canvas.style.height = display + 'px';
    if (canvas.width !== resolution) {
      canvas.width = canvas.height = resolution;
      needsFull = true;
      return true;
    }
    return changed;
  }
  function setStage(next, image, settings) {
    if (disposed || lost) throw Error('Grafikdarstellung nicht bereit.');
    if (!image.complete || image.naturalWidth < 1)
      throw Error('Baumbild nicht vollständig geladen.');
    stage = next;
    cells = settings.cells;
    geometry();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    sourceWidth = image.naturalWidth;
    if (gl.getError() !== gl.NO_ERROR)
      throw Error('Baumbild konnte nicht zur Grafik übertragen werden.');
    needsFull = true;
  }
  function draw(pose = lastPose, { full = false } = {}) {
    if (disposed || lost || !stage || !width) return 0;
    const start = performance.now();
    lastPose = pose;
    const padding = (PAD_CSS * SIZE) / width,
      viewport = SIZE + 2 * padding;
    gl.viewport(0, 0, canvas.width, canvas.height);
    if (!needsFull && !full) {
      const b = dirtyBounds(stage, cells, width),
        factor = canvas.width / viewport;
      const x = Math.max(0, Math.floor((b.x + padding) * factor)),
        right = Math.min(canvas.width, Math.ceil((b.right + padding) * factor)),
        top = Math.max(0, Math.floor((b.y + padding) * factor)),
        bottom = Math.min(
          canvas.height,
          Math.ceil((b.bottom + padding) * factor),
        );
      gl.enable(gl.SCISSOR_TEST);
      gl.scissor(x, canvas.height - bottom, right - x, bottom - top);
      lastArea =
        ((right - x) * (bottom - top)) / (canvas.width * canvas.height);
    } else {
      gl.disable(gl.SCISSOR_TEST);
      lastArea = 1;
    }
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform3fv(uniforms.u_x0, pose.x.slice(0, 3));
    gl.uniform3fv(uniforms.u_x1, pose.x.slice(3, 6));
    gl.uniform3fv(uniforms.u_y0, pose.y.slice(0, 3));
    gl.uniform3fv(uniforms.u_y1, pose.y.slice(3, 6));
    gl.uniform1f(uniforms.u_sourcePerCSS, SIZE / Math.max(200, width));
    gl.uniform1f(uniforms.u_padding, padding);
    gl.uniform1f(uniforms.u_artScale, stage.art.scale);
    gl.uniform1f(uniforms.u_light, pose.light);
    gl.drawElements(gl.TRIANGLES, mesh.indices.length, gl.UNSIGNED_SHORT, 0);
    gl.disable(gl.SCISSOR_TEST);
    needsFull = false;
    frames++;
    lastCost = performance.now() - start;
    return lastCost;
  }
  const contextLost = (event) => {
    event.preventDefault();
    lost = true;
    onLost();
  };
  canvas.addEventListener('webglcontextlost', contextLost);
  return {
    resize,
    setStage,
    draw,
    setQuality(settings) {
      if (settings.cells !== cells && stage) {
        cells = settings.cells;
        geometry();
      }
      return resize(width, settings.dpr);
    },
    snapshot() {
      if (disposed || lost) return null;
      const copy = document.createElement('canvas');
      copy.width = canvas.width;
      copy.height = canvas.height;
      copy.style.width = copy.style.height = width + 2 * PAD_CSS + 'px';
      copy.getContext('2d').drawImage(canvas, 0, 0);
      return copy;
    },
    pixels() {
      const pixels = new Uint8Array(canvas.width * canvas.height * 4);
      gl.readPixels(
        0,
        0,
        canvas.width,
        canvas.height,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        pixels,
      );
      return pixels;
    },
    get metrics() {
      return {
        frames,
        submitMs: lastCost,
        framebuffer: canvas.width,
        cssWidth: width,
        sourceWidth,
        sourcePerCSS: SIZE / Math.max(200, width),
        updatedArea: lastArea,
        cells,
        lost,
        disposed,
      };
    },
    get gl() {
      return gl;
    },
    get mesh() {
      return mesh;
    },
    get lost() {
      return lost;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      canvas.removeEventListener('webglcontextlost', contextLost);
      gl.useProgram(null);
      gl.bindTexture(gl.TEXTURE_2D, null);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
      gl.deleteTexture(texture);
      for (const buffer of buffers) gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      for (const shader of shaders) gl.deleteShader(shader);
      canvas.width = canvas.height = 1;
    },
  };
}
