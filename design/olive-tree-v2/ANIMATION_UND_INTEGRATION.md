# Realistischer Animations- und Integrationsplan

**Plan, keine Freigabe zur Implementierung. Phase B wurde nicht begonnen.**

## Was die neuen Dateien können

Sieben lokale RGBA-Illustrationen liefern die botanische Bildsprache. Sie sind für die statische Darstellung und einen ruhigen Übergang zwischen Zuständen geeignet. Die drei späten Stufen behalten die Hauptaststruktur, unterscheiden sich vor allem im Fruchtbesatz. Die frühe Reihe zeigt dieselbe S-Bewegung und linke/rechte Verzweigung als visuelle Identität; generierte Geometrie ist jedoch nicht exakt deckungsgleich.

Ein einzelnes PNG bietet **keine unabhängig animierbaren Blätter**. Die Designstudie enthält deshalb keine vorgetäuschte „Blattanimation“ durch Schwenken oder Pulsieren des gesamten Baums. Sie läuft ohne Animationsschleifen. Das Storyboard für Samen/Keimling ist als Storyboard beschriftet.

## Empfohlene Produktionsaufbereitung

1. Pro Stufe eine gemeinsame Wurzelposition und ein festes Sichtfenster anhand der tatsächlichen Stammgeometrie registrieren. Die jetzige Bodenunterkante ist nur ein erster Exportanker.
2. Die Krone in höchstens drei oder vier **sauber freigestellte und überlappende Ebenen** zerlegen; Stamm/Wurzeln bleiben statisch. Verdeckte Hintergründe ergänzen, damit beim Bewegen keine Löcher entstehen. Diese Ebenen sind noch nicht geliefert.
3. Fruchtgruppen für Stufe 6/7 als eigene, exakt registrierte lokale Ebenen aufbereiten. Nicht zwischen beliebigen ganz unterschiedlichen Bäumen morphen.
4. Die vorhandenen Weg-/Astverbindungen als separate semantische HTML-Bedienelemente über der Szene erhalten. Touchflächen mindestens 44 × 44 CSS-Pixel, bei Platzmangel zusätzlich die vorhandene textliche Wegliste nutzen. Die Illustration darf ihre Ziele nicht bestimmen.

## Bewegungsregeln

| Anlass | Vorschlag | Begrenzung |
|---|---|---|
| Eintritt in sichtbare Baumansicht | Zwei sehr kleine, gegenläufige Kronenbewegungen, ca. 0,3–0,6° um den Astansatz; Stamm statisch | Zwei Zyklen von 5–7 Sekunden, dann Ruhe; nicht dauernd neu bei jedem Scrollpixel |
| Licht | Sehr schwache, auf die Krone begrenzte Helligkeitsänderung; nur nach Kontrast-/Farbkontrolle | Ein kurzer Verlauf; keine wandernden Glitzerpunkte und kein permanenter Filter auf der ganzen Seite |
| Tatsächlich bestätigte neue Stufe | Registrierte Überblendung mit lokalem Kronen-/Fruchteinblenden, etwa 900–1400 ms | Einmal je realem beobachtetem Stufenwechsel; keine Schreiboperation, kein nachträgliches Ändern historischer Ereignisse |
| Erster gespeicherter Weg | Kurze Pflanzbewegung, Erdruhe, symbolisches Aufrichten eines Keims | Erst nach erfolgreicher vorhandener Speichertransaktion; ca. 2,5 s; **keine** zusätzliche Stufe oder Entwicklung |
| Reduced Motion | Sofortige statische Darstellung und kurze Textbestätigung | Keine Translation, kein Zoom und keine dekorative Schleife |
| Unsichtbares Dokument / Szene außerhalb Sichtfeld | Animation sofort pausieren oder entfernen | Cleanup beim Rendern und Routenwechsel, keine Hintergrundtimer |

`src/living-motion.js` bietet bereits IntersectionObserver, Dokument-Sichtbarkeit, dynamische Reduced-Motion-Reaktion und Cleanup. Diese Infrastruktur gezielt weiterverwenden; keine zweite konkurrierende Animationssteuerung hinzufügen. Die empfohlenen Winkel und Laufzeiten sind Designparameter, **noch keine auf echten Geräten gemessenen Performanceergebnisse**. Kein 60-FPS-Nachweis liegt für die neuen Ebenen vor.

## Modulare Schnittstellen für Phase B

- `tree-art-assets.js`: ausschließlich Index 0–6 → lokale Quelle, `srcset`, feste Dimensionen, Anker und spätere Ebenen. Keine Schwellwerte.
- `olive-tree.js`: vorhandene Render-Schnittstelle erhalten; nur Präsentation austauschen. Domain entscheidet unverändert über den Index.
- `living-motion.js`: eine gemeinsame, begrenzte Lifecycle-Steuerung. Keine neue Speicherung des Animationsfortschritts.
- `tree-stage-guide.js`: Bedeutungen und Stufennamen beibehalten. Die Galerie hat die sieben vorhandenen Bedeutungstexte unverändert kopiert.
- Bestehende Heute-, Wege-, Baum- und erster-Samen-Views: gezielte CSS-/Präsentationsintegration; kein Demo-Datenmodell übernehmen.
- Bestehendes Build-/Worker-Manifest: nur die tatsächlich benötigten lokalen Assets aufnehmen, keine zusätzliche Service-Worker-Registrierung.

## Größen und Budget

512- und 1024-Pixel-WebP-Exporte sind beigefügt; alle sieben 512er Bilder benötigen zusammen 618.358 Bytes, alle sieben 1024er Bilder 2.042.608 Bytes; genaue Bytes pro Datei stehen im Manifest. Für kleine Karten 512 px, für Retina-Detailbilder 1024 px. Die PNG-Master sind **Designquellen**, kein Vorschlag, sie beim Appstart alle zu laden. Nur das aktuelle Bild eager laden; Übersicht lazy. Vor der Integration entscheiden, ob alle sieben 512er Bilder vorab offline gecacht werden und höhere Auflösungen bei Bedarf hinzukommen. Offlinefähigkeit muss ausdrücklich erhalten bleiben.

## Kleine Umsetzungspakete nach Freigabe

1. **Assets und Präsentationsadapter**: zentrale Zuordnung, Fallback, Alttexte, keine Änderungen an Domain/Store. Tests aller sieben Indexwerte und ungültiger Werte.
2. **Heute / Mein Weg / Baumdetail / Übersicht**: vier Themes, 320/390, 100/200 %, interaktive Astverknüpfungen. Bestehende IDs und Funktionen unverändert.
3. **Samenablauf und begrenzte Bewegung**: vorhandene erfolgreiche Transaktion als Voraussetzung; fehlgeschlagenes Speichern und Mehrfachtippen testen. Stufe muss vorher/nachher identisch bleiben, solange keine Entwicklung bestätigt wurde.
4. **Offline-/Update-/Daten-Gate**: aktuelle App → Kandidat auf derselben isolierten Origin, bestehende synthetische V5-Daten, Backups, Journal, Rückblicke, Quiz, Bibel, Astlinks und Zähllogik vergleichen.
5. **Geräte-Gate**: reales iPhone Safari, installierte PWA, VoiceOver, dynamische Schrift und schwächeres Smartphone. Bis zur tatsächlichen Durchführung offen.

Rollback: ausschließlich auf den geprüften bisherigen Präsentationscommit zurückgehen. Keine Daten-Rückmigration, kein Zurücksetzen von LocalStorage und kein Löschen persönlicher Einträge.
