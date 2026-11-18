from pathlib import Path
from html import escape
ROOT=Path(__file__).resolve().parents[1]
out=ROOT/'design-previews/today-focus';out.mkdir(parents=True,exist_ok=True)
svg=['<svg xmlns="http://www.w3.org/2000/svg" width="740" height="2980" viewBox="0 0 740 2980">',
 '<title>OLIVA Heute: echte Vorher-Nachher-Vergleiche</title><desc>Umgesetzter Heute-Arbeitsstand auf0.18Basis. Gleiche synthetische Profile, feste Uhrzeit und Viewports. Lokales Chromium, keine echten Gerätetests.</desc>',
 '<style>text{font-family:system-ui,sans-serif;fill:#263c30}.title{font-family:Georgia,serif}a:focus-visible rect{stroke:#806025;stroke-width:3}</style>',
 '<rect width="740" height="2980" fill="#f8f7f2"/><text x="30" y="42" letter-spacing="4" font-size="19">OLIVA</text>',
 '<text class="title" x="30" y="96" font-size="38">Heute. Ein klarer nächster Schritt.</text>',
 '<text x="30" y="132" font-size="18">Echte Produktions-Browseraufnahmen · umgesetzt, kein Mockup</text>',
 '<text x="30" y="164" font-size="17">Nur Heute verändert. Eigene Worte, Lesestand und Bilder bleiben.</text>',
 '<text x="30" y="194" font-size="16">Antippen öffnet das Original. Fiktives Profil Mara · feste Uhrzeit.</text>']
for index,(width,height) in enumerate([(320,568),(375,812),(390,844)]):
 y=238+index*880;svg.append(f'<text class="title" x="30" y="{y}" font-size="30">{width} × {height} CSS-Pixel</text>')
 for column,stage in enumerate(['before','after']):
  x=30+column*355;label='Vorher ·0.18'if stage=='before'else'Nachher ·Heute';file=f'images/{stage}-{width}-light-returning.png';h=round(320*height/width)
  svg.append(f'<text x="{x}" y="{y+33}" font-size="18">{escape(label)}</text><a href="{file}" aria-label="{escape(label)} {width}Pixel"><rect x="{x}" y="{y+48}" width="320" height="{h}" rx="15" fill="#fffefa" stroke="#dedfd4"/><image href="{file}" x="{x}" y="{y+48}" width="320" height="{h}"/></a>')
  for offset,mode,suffix in [(50+h,'Dunkel','dark-returning'),(100+h,'Erster Einstieg','light-fresh')]:
   href=f'images/{stage}-{width}-{suffix}.png'
   svg.append(f'<a href="{href}" aria-label="{escape(label)} {width}Pixel {mode}"><rect x="{x}" y="{y+offset}" width="320" height="44" rx="10" fill="#efeee5"/><text x="{x+16}" y="{y+offset+28}" font-size="16">{mode} ansehen →</text></a>')
svg+=['<text x="30" y="2920" font-size="17">Lokale Chromium-Prüfung. Keine iPhone-/Android-/Screenreaderabnahme.</text>',
 '<a href="/"><text x="30" y="2957" font-size="20">Private OLIVA-Vorschau öffnen →</text></a>','</svg>']
(out/'index.svg').write_text('\n'.join(svg)+'\n')
print('Created Today-only three-width comparison; existing screenshots are unchanged.')
