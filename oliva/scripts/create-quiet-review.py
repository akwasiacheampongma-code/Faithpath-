"""Create a linkable SVG/PNG review without adding a second SPA HTML entry."""
from pathlib import Path
from html import escape
ROOT = Path(__file__).resolve().parents[1]
names = [('heute', 'Heute'), ('bibel', 'Bibel'), ('wege', 'Wege'), ('garten', 'Mein Garten'), ('sammlung', 'Sammlung')]
svg = ['<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="390" height="2490" viewBox="0 0 390 2490">',
    '<title>OLIVA: Bestand und zwei Gestaltungsvorschläge</title><desc>Private Freigabevorlage. Fünf Bereiche mit Links zu echten 390-Pixel-Browserbildern. A und B sind noch nicht in die App integriert. Alle Daten sind synthetisch. Keine echten Gerätetests.</desc>',
    '<style>text{fill:#263c30;font-family:system-ui,sans-serif}.muted{fill:#5c675b}.title{font-family:Georgia,serif}a:focus-visible rect{stroke:#806025;stroke-width:3}a{cursor:pointer}</style>',
    '<rect width="390" height="2490" fill="#f8f7f2"/>',
    '<text x="20" y="35" font-size="16" letter-spacing="4">OLIVA</text>',
    '<text class="title" x="20" y="79" font-size="30">Weniger Oberfläche.</text>',
    '<text class="title" x="20" y="114" font-size="30">Mehr Tiefe.</text>',
    '<text class="muted" x="20" y="149" font-size="15">Private Freigabevorlage · 18.11.2026</text>',
    '<text x="20" y="179" font-size="15">A/B sind nicht integrierte Layoutstudien.</text>',
    '<text x="20" y="204" font-size="15">Antippen öffnet das vollständige Bild.</text>',
    '<text class="muted" x="20" y="229" font-size="14">390 CSS-Pixel · synthetische Prüfdaten</text>']
for i, (area, label) in enumerate(names):
    y = 275 + i * 420
    svg += [f'<g><text class="title" x="20" y="{y}" font-size="26">{escape(label)}</text>']
    for j, (prefix, title) in enumerate([('before','0.18'),('proposal-A','A'),('proposal-B','B')]):
        x = 20 + j * 118
        light = f'images/{prefix}-{area}-390-light-filled.png'
        dark = f'images/{prefix}-{area}-390-dark-filled.png'
        svg += [f'<a href="{light}" aria-label="{escape(label)} {title}, helle vollständige Aufnahme"><rect x="{x}" y="{y+16}" width="108" height="234" rx="12" fill="#fffefa" stroke="#dedfd4"/><image href="{light}" x="{x}" y="{y+16}" width="108" height="234"/></a>']
        for offset, href, mode in [(260,light,'Hell'),(310,dark,'Dunkel')]:
            svg += [f'<a href="{href}" aria-label="{escape(label)} {title} {mode}"><rect x="{x}" y="{y+offset}" width="108" height="44" rx="10" fill="{ "#40583d" if title=="A" else "#efeee5" }"/><text x="{x+54}" y="{y+offset+28}" text-anchor="middle" font-size="15" style="fill:{ "#fffefa" if title=="A" else "#263c30" }">{title} · {mode}</text></a>']
    svg += ['</g>']
svg += ['<text x="20" y="2390" font-size="15">Empfehlung A: Inhalt zuerst.</text>',
    '<text class="muted" x="20" y="2416" font-size="14">Umsetzung erst nach deiner Freigabe.</text>',
    '<a href="/"><rect x="20" y="2430" width="350" height="44" rx="12" fill="#40583d"/><text x="195" y="2458" text-anchor="middle" font-size="16" style="fill:#fffefa">Zur unveränderten App 0.18</text></a>', '</svg>']
(ROOT/'design-previews/quiet-ux/index.svg').write_text('\n'.join(svg)+'\n')
print('Created five-area SVG review with30full-size image links; no second HTML entry.')
