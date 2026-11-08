"""Reproducible PNG cutouts for native compositor motion; original art stays intact.
Requires Python 3, Pillow, NumPy and Node 24. No network, no user data.
"""
import hashlib, json, subprocess
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets/a51/native'
OUT.mkdir(parents=True, exist_ok=True)
module = (ROOT / 'src/features/garden/a51/engine/motion-model.js').as_uri()
stages = json.loads(subprocess.check_output(['node', '--input-type=module', '-e',
    f'import {{STAGES}} from {json.dumps(module)};process.stdout.write(JSON.stringify(STAGES));']))

def smooth(v):
    v = np.clip(v, 0, 1)
    return v * v * (3 - 2 * v)

def fields(stage, width):
    yy, xx = np.mgrid[:width, :width].astype(np.float32)
    x, y = (xx + .5) * 1254 / width, (yy + .5) * 1254 / width
    guard = 1 - smooth((y - stage['fade'][0]) / (stage['fade'][1] - stage['fade'][0]))
    for radius, points in stage['wood']:
        for a, b in zip(points, points[1:]):
            dx, dy = b[0] - a[0], b[1] - a[1]
            t = np.clip(((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy), 0, 1)
            distance = np.hypot(x-a[0]-dx*t, y-a[1]-dy*t)
            guard = np.minimum(guard, smooth((distance-radius)/stage['falloff']))
    weights = np.stack([guard*smooth(1-((x-cx)/rx)**2-((y-cy)/ry)**2)
                        for cx,cy,rx,ry in stage['regions']])
    return weights / np.maximum(1, weights.sum(axis=0))

def save(stage, width, name, rgba):
    image = Image.fromarray(rgba, 'RGBA')
    bounds = image.getbbox() or (0,0,1,1)
    path = OUT / f'stage-{stage+1}-{width}-{name}.png'
    image.crop(bounds).save(path, optimize=True)
    return {'file': path.relative_to(ROOT).as_posix(), 'x': bounds[0], 'y': bounds[1],
            'width': bounds[2]-bounds[0], 'height': bounds[3]-bounds[1],
            'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'bytes': path.stat().st_size}

groups = []
for stage in stages:
    index = stage['index']
    master = ROOT / f'art/a51/masters/stage-{index+1}.png'
    original = Image.open(master).convert('RGBA')
    for width in (640,1024):
        art = np.array(original.resize((width,width), Image.Resampling.LANCZOS))
        full = save(index,width,'full',art)
        layers, worst_error = [], 0
        if index:
            weights = fields(stage,width)
            fractions = np.concatenate([(1-weights.sum(axis=0))[None], weights])
            source_alpha = art[:,:,3].astype(np.float32)/255
            actual = np.zeros_like(source_alpha)
            cumulative = np.zeros_like(source_alpha)
            for layer, fraction in enumerate(fractions):
                cumulative += source_alpha * fraction
                alpha = np.clip((cumulative-actual)/np.maximum(1-actual,1e-8),0,1)
                alpha8 = np.rint(alpha*255).astype(np.uint8)
                actual += (1-actual)*(alpha8.astype(np.float32)/255)
                cutout = art.copy();cutout[:,:,3] = alpha8;cutout[alpha8==0,:3] = 0
                layers.append(save(index,width,f'layer-{layer}',cutout))
            worst_error = float(np.max(np.abs(actual-source_alpha))*255)
            assert worst_error <= 1, worst_error
        groups.append({'stage':index,'resolution':width,'full':full,'layers':layers,
                       'rest_alpha_max_error_8bit':round(worst_error,6),
                       'source_master_sha256':hashlib.sha256(master.read_bytes()).hexdigest()})

manifest = {'generator':'scripts/prepare-a51-native.py','version':1,
 'method':'Six original anatomical wind fields; conditional alpha partition, original RGB; zero displacement for wood and roots. Cropped PNG layers for native compositor.',
 'groups':groups}
(ROOT/'art/a51/native-derivatives.json').write_text(json.dumps(manifest,indent=2)+'\n')
lines = ['import type { ImageSourcePropType } from "react-native";',
 'import metadata from "../../../../art/a51/native-derivatives.json";',
 'const images: Record<string, ImageSourcePropType> = {']
for g in groups:
 for p in [g['full'],*g['layers']]:
  lines.append(f'  "{p["file"]}": require("../../../../{p["file"]}"),')
lines += ['};','export const NATIVE_GROUPS = metadata.groups;',
 'export function nativeSource(file: string): ImageSourcePropType {',
 '  const source = images[file]; if (!source) throw new Error("Unbekanntes Baumbild."); return source;', '}', '']
(ROOT/'src/features/garden/a51/native-assets.ts').write_text('\n'.join(lines))
print(json.dumps({'groups':len(groups),'png_files':sum(1+len(g['layers']) for g in groups),
 'max_rest_alpha_error_8bit':max(g['rest_alpha_max_error_8bit'] for g in groups),
 'total_png_bytes':sum(p['bytes'] for g in groups for p in [g['full'],*g['layers']])}))
