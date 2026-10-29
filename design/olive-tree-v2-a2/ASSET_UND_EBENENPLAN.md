# Asset- und Ebenenplan A.2

**Produktionsplan. Keine Phase-B-Integration und keine bereits gelieferten Animationsebenen.**

## Vorhanden

Zwei generierte Master: **Windform** und **Lichtkrone**. Die sieben Darstellungen verwenden Lichtkrone als eigene Art-Direction-Arbeitswahl, nicht als behauptete Nutzerfreigabe. Die zweite Mastervariante bleibt unverändert zur Auswahl erhalten.

Alle Originalausgaben sind 1254 × 1254 RGBA-PNGs. Im Prompt wurden 1536 Pixel angefragt, aber nicht vom Werkzeug geliefert. 512er und 1024er WebP-Exporte verwenden für jede Stufe dieselbe vollständige Canvas, gleichförmig auf 92 % skaliert und mit 4 % Rand. Keine stufenspezifische Anpassung, keine Verformung, kein nachträgliches Malen an Ästen. Die sieben Bedeutungen sind unverändert aus dem vorhandenen Modul übernommen.

Die neuen Bilder sind vollständig gerenderte Kompositionen. Sie enthalten **keine separaten natürlich beweglichen Blätter oder Äste**. Ein Dateiformatwechsel zu PNG/WebP macht sie nicht zu einem Rig.

## Aufzubereitende Ebenen

| ID | Ebene | Konkrete Arbeit | Status |
|---|---|---|---|
| G | Boden und Stein rechts | Gemeinsame Bildfläche und Wurzelkontakt registrieren, Übergänge außerhalb der Wurzeln sauber halten | Geplant |
| W | Stamm, Wurzeln, tragende Hauptäste | Eine verbindliche Geometrie zeichnerisch festlegen; bei Stufen 3/4 dünnere Konturen entlang derselben Achsen; verdecktes Holz vervollständigen | Geplant |
| C1 | Linke hohe Krone | Kleine Blatt-/Zweiggruppe mit eigenem Astansatz; saubere Freistellung und überdeckte Hintergrundflächen | Geplant |
| C2 | Linke äußere und untere Blattsprays | Eigenständige überlappende Teilgruppe, keine Bewegung ganzer Baumhälften | Geplant |
| C3 | Rechte Krone | Fester Ursprung am gebogenen rechten Hauptast; hintere/äußere Blätter getrennt genug für minimale Bewegung | Geplant |
| F-back / F-front | Fruchtgruppen | An konkrete feine Zweige binden; vordere und hintere Früchte korrekt überdecken | Geplant |

Als grobes Art-Direction-Ziel liegt der Wurzelkontakt bei etwa 52 % Breite / 88 % Höhe der Exportfläche. Das ist **kein bereits exakt vermessener Produktionsanker**. Die verbindlichen Anker und Rotationsursprünge müssen mit den späteren echten Ebenen festgelegt werden. Keine Koordinaten aus der Demo als Datenzuordnung für persönliche Wege übernehmen.

## Bewegungsregeln nach Freigabe

- G und W bleiben statisch. Die Stammcharakteristik darf nicht durch ein Wackeln der gesamten Illustration verloren gehen.
- C1–C3 höchstens wenige Zehntel Grad um einen plausiblen Zweigansatz bewegen, leicht versetzt. Zwei begrenzte Zyklen, dann Ruhe. Keine permanente Atemschleife des ganzen Baums.
- Früchte nur mit ihrem zugehörigen feinen Zweig bewegen; keine schwebenden Belohnungssymbole.
- Bei tatsächlich geändertem Stufenindex: registrierte Überblendung und lokal neues Blatt-/Fruchtwachstum. Die aktuellen Einzelbilder sind dafür noch kein nahtloser Morph.
- Pflanzsequenz erst nach erfolgreichem Speichern des ersten Weges; sie vergibt keine neue Entwicklung. Kein automatischer Aufstieg durch Lesen, Quiz oder erledigte Aufgaben.
- Vorhandenes `living-motion.js` mit Sichtbarkeitsprüfung, dynamischem Reduced Motion und Cleanup weiterverwenden. Bei Reduced Motion sofort statisch darstellen, unsichtbare Szenen stoppen.

Es wurden keine FPS-, Akku- oder CPU-Ergebnisse für diese noch nicht produzierten Ebenen gemessen. Erst die freigegebene, tatsächlich integrierte Bewegung kann auf realen Geräten bewertet werden.

## Was die Überlagerungen leisten

Stufen 3, 4, 5 und 6 werden jeweils mit Stufe 7 zu 50/50 % auf derselben Bildfläche gezeigt. Die ursprüngliche Canvas bleibt vollständig erhalten. Doppelkonturen zeigen reale Formänderungen. Gerade beim jungen Stamm ist das noch keine pixelgenaue Deckung.

Die gemeinsame Silhouette und Hauptastführung sind ein visueller Entwurfsnachweis. Für die spätere Animation braucht es eine präzise zeichnerische Registrierung. Eine generierte Bildserie ersetzt diese Arbeit nicht.

## Rechte und Herkunft

Alle neuen Illustrationen stammen aus den neun dokumentierten ImageGen-Aufrufen dieser Sitzung. `prompts.json` enthält die verwendeten Prompts einschließlich der verworfenen ersten Stufe 5. Die früher vom Nutzer gelieferten Konzeptbilder wurden als Referenz genutzt, nicht deren UI, Texte oder Tageszähler.

Die Originale bleiben unverändert erhalten; die Exporte sind technische Größen-/Formatanpassungen. Keine neuen Stockassets. Newsreader und DM Sans stammen mit OFL-Dateien aus dem bestehenden Projekt. Diese Herkunftsdokumentation ist keine juristische Garantie für Ausschließlichkeit oder Schutzfähigkeit generierter Illustrationen.
