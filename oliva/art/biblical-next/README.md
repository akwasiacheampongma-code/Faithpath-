# Nächster Bildpilot · David vor Goliath

Am 7. November 2026 tatsächlich mit dem OpenAI-Bildwerkzeug generiert. Das neue Motiv ergänzt die sieben bestehenden OLIVA-Master; Geburt Jesu und Noah waren bereits vorhanden und wurden nicht erneut erzeugt oder ersetzt. Es handelt sich um genau einen neuen Auftrag und einen unveränderten PNG-Master.

Der Bildbezug ist **1. Samuel 17,40–47**, ergänzt durch die Talsituation aus **17,3**. David hält einen Stab; Tasche und noch unbenutzte Schleuder gehören zur Erzählung. Goliath und sein vorausgehender Schildträger bleiben als Menschen erkennbar. Das Bild wählt einen Moment vor der Kampfhandlung. Es behauptet nicht, dass die ganze Erzählung friedlich sei, und zeigt keine Verletzung, keinen Tod oder Triumph.

Landschaft, Morgenlicht, Gesichtszüge, Kleidung, konkrete Ausrüstung und Größenverhältnisse sind künstlerische Interpretation. Die Illustration ist keine archäologische Rekonstruktion, kein nachgewiesener Ort und kein historisches Porträt. Eine theologische oder historische Fachfreigabe steht aus.

Die warme, zurückhaltende Palette und die feine malerische Textur passen nach tatsächlicher Ansicht des Masters zu `oliva-cinema-v1`. Stab, Tasche und hängende Schleuder sind sichtbar; ein menschlicher, größerer Goliath mit Schildträger steht gegenüber. Es wurden keine offensichtlichen modernen Gegenstände, Verletzungen oder anatomischen Hauptfehler festgestellt. Das ist eine Prüfung durch den Implementierungsagenten, keine unabhängige Abnahme.

- Master: [david-before-goliath.png](masters/david-before-goliath.png), 1536 × 1024 Pixel.
- Vollständiger tatsächlich verwendeter Prompt, Bibelverse, SHA-256, Quelldatei, Generation und Freigabegrenzen: [david-before-goliath.json](david-before-goliath.json).
- Die Originalausgabe unter `/workspace/generated_images/exec-e0799527-78be-4d01-8e60-d881d5554c4c.png` bleibt erhalten; die Masterkopie ist bytegleich.
- **Seit OLIVA 0.8 in der Runtime eingebunden.** Drei bytegleiche WebP-Varianten (640/1024/1280 Pixel, zusammen 448.938 Byte) liegen zusätzlich unter `assets/images/`; Master und Prompt bleiben außerhalb des Appbundles. Die technischen Originalbelege unter [variants/](variants/) beschreiben den damaligen Vorbereitungsstand und bleiben unverändert.
- Der [Storyentwurf](david-story-draft.json) ist die nachvollziehbare Grundlage der Runtime-Einordnung zu **1. Samuel 17,38–45**, genau acht unveränderte lokale Luther-1912-Verse. Er ist keine unabhängige Fachfreigabe. Die Bildreferenz umfasst darüber hinaus 17,40–47 und 17,3; Bild und Lesebereich sind deshalb ausdrücklich getrennt beschrieben.
- Die fünf Storykarten verwenden einen gemeinsamen, größenabhängigen Bildloader mit echtem Decode-, Fehler- und Retryzustand. Kartenformat 8:5 und Kontextformat 3:2 erhalten Person und Landschaft auch auf breiten Ansichten. Lokale Chromium-Screenshots unter `docs/evidence/session-08/stories/screens/` wurden bei 320/390/1440 CSS-Pixeln in Hell/Dunkel angesehen. Elementaufnahmen können an der Scrollviewport und der festen Navigation abgeschnitten sein; dies ist kein zugeschnittener Bildmaster und keine Geräteprüfung.
- Der echte 0.7→0.8-Workerwechsel lädt das Motiv erstmals offline und nach Neustart; Bildbetrachtung erhält alle rohen Nutzdatensätze. [Beleg](../../docs/evidence/session-08/offline-upgrade.json).
- Privater Produktpilot; GitHub-Quellensicherung ist seit 08.11.2026 ausdrücklich beauftragt. Eine öffentliche Web-/Storeveröffentlichung und deren Rechteprüfung sind **nicht freigegeben**.

Nächste inhaltliche Abnahme: Ausrüstungs-/Textbezüge unabhängig fachlich gegenlesen und das Erlebnis auf echten Smartphones prüfen. Die ursprünglichen Generations- und Variantenmetadaten werden als historische Entstehungsbelege bewahrt; aktueller Runtime- und Freigabestand ist `art/manifest.json`.
