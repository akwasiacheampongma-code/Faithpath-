from pathlib import Path
from xml.sax.saxutils import escape
import json

root = Path(__file__).resolve().parents[1]
reading = root / 'docs/evidence/quiet-reading'
art = root / 'docs/evidence/illustration-review'
out = root / 'design-previews/quiet-reading'
out.mkdir(parents=True, exist_ok=True)
before = json.loads((reading / 'before.json').read_text())
after = json.loads((reading / 'after.json').read_text())
assert all(not r.get('failure') and not r['errors'] for r in (before, after))
assert len(before['scenes']) == 34 and len(after['scenes']) == 58

def start(width, height, title):
    return [f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">',
            f'<title>{escape(title)}</title><rect width="100%" height="100%" fill="#f8f7f2"/>',
            '<g font-family="system-ui,sans-serif" fill="#263c30">']

def line(x, y, message, size=17):
    return f'<text x="{x}" y="{y}" font-size="{size}">{escape(message)}</text>'

def link(x, y, uri, message):
    return '<a href="' + uri + '">' + line(x, y, message, 16).replace('<text ', '<text text-decoration="underline" ') + '</a>'

def screenshot(name, x, y, width, height, folder='images'):
    return f'<a href="{folder}/{name}"><image href="{folder}/{name}" x="{x}" y="{y}" width="{width}" height="{height}" preserveAspectRatio="xMinYMin meet"/></a>'

def save(name, chunks):
    (out / name).write_text(''.join(chunks) + '</g></svg>\n')

sections = [('garten', 'Mein Garten'), ('sammlung', 'Sammlung'), ('reader', 'Reader')]
for area, title in sections:
    chunks = start(900, 4150, f'OLIVA · {title} vorher und nachher')
    chunks += [line(35,52,f'{title} · Vorher und nachher',28),link(35,88,'index.svg','Zur Übersicht'),line(35,122,'Echte Chromium-Aufnahmen. Helles und dunkles Farbschema auf vier Breiten.')]
    y = 172
    for width in (320,375,390,430):
        scene = next(s for s in after['scenes'] if s['width'] == width and s['area'] == area and s['scenario'] == 'normal')
        scaled_height = round(scene['height'] * 197 / width)
        chunks.append(line(35,y,f'{width} Pixel · Hell vorher / nachher · Dunkel vorher / nachher',19))
        y += 18
        for index,(theme,stage) in enumerate([('light','before'),('light','after'),('dark','before'),('dark','after')]):
            name = f'{stage}-{area}-{width}-{theme}-normal.png'
            assert (reading / 'screens' / name).is_file()
            chunks.append(screenshot(name,35+index*208,y,197,scaled_height))
        y += scaled_height + 37
    chunks[0] = start(900,y+10,title)[0]
    save(area + '.svg', chunks)

chunks = start(900,1560,'OLIVA · Mobile Übersichten')
chunks += [line(35,55,'OLIVA · Mobile Übersichten',32),line(35,90,'Bibel, Wege, Mein Garten, Sammlung und Reader im Vergleich.'),
           link(35,130,'../bible-paths-focus/index.svg','Bibel und Wege · vorher / nachher'),
           link(35,164,'art.svg','Bestehende Geschichten und Illustrationen'),
           line(35,207,'390 Pixel · je zwei Bildschirmaufnahmen',19)]
for i,(area,title) in enumerate(sections):
    x = 35 + i*280
    chunks.append(link(x,248,area+'.svg',title+' · alle Breiten'))
    for j,stage in enumerate(['before','after']):
        chunks.append(screenshot(f'{stage}-{area}-390-light-normal.png',x+j*130,272,123,266))
chunks += [line(35,590,'Konsistenz der sechs Ansichten · 320 Pixel',22)]
for i, (area, title) in enumerate([('heute','Heute'),('bibel','Bibel'),('wege','Wege'),*sections]):
    x = 35 + (i%3)*280; y = 640 + (i//3)*430
    chunks.append(line(x,y,title,18))
    for j,theme in enumerate(['light','dark']): chunks.append(screenshot(f'after-{area}-320-{theme}-normal.png',x+j*130,y+25,123,218))
save('index.svg',chunks)

review = json.loads((art / 'visual-and-offline.json').read_text())
assert not review.get('failure')
chunks = start(900,1850,'OLIVA · Bestehende Bildwelt')
chunks += [line(35,54,'OLIVA · Geschichten und Bildwelt',31),link(35,88,'index.svg','Zu den mobilen Vergleichen'),
           line(35,126,'Vorhandene Motive im echten Browser. Aufnahmen öffnen das Originalbild.')]
for i, scene in enumerate(s for s in review['visual'] if s['width'] == 390):
    x = 35 + (i%2)*425; y = 180 + (i//2)*390
    chunks.append(line(x,y,scene['title'],15))
    if scene['artFile']:
        chunks.append(screenshot(Path(scene['artFile']).name,x,y+24,395,270,'art-images'))
    else:
        chunks.append(screenshot(Path(scene['file']).name,x,y+24,145,314,'art-images'))
save('art.svg',chunks)

for name,target in [('images','../../docs/evidence/quiet-reading/screens'),('art-images','../../docs/evidence/illustration-review/screens')]:
    link_path = out / name
    if not link_path.exists(): link_path.symlink_to(target,target_is_directory=True)
print('Five review pages generated from the tested screenshots.')
