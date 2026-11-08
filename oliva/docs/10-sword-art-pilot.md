# Johannes · Pilot für OLIVAs Buchschwert-Bildwelt

Stand: 07.11.2026. Der tatsächlich generierte Johannes-Pilot ist als große Buchillustration in OLIVA 0.6 integriert und seit **12:59:18 UTC privat bereitgestellt**: [Johannes öffnen](https://oliva-v04-private-preview.purplebean128.chatgpt.site/buch/JHN). Dieser Bericht belegt den Kernbuild **`oliva-a542b7009551a2a2`**: 75 Fachtests, vollständiger Browserlauf mit 51/52 erfolgreichen Fällen und anschließend 11/11 gezielte Fälle nach einer ausschließlichen Testsynchronisierung. Die vereinigten Belege decken alle 52 unterschiedlichen Szenarien ab; es gab **keinen neuen einzelnen grünen 52/52-Gesamtlauf**. Native Debugexports und der echte 0.5→0.6-Offlinewechsel sind geprüft. Den Bereitstellungsnachweis nennt `RESUME.md`; eine öffentliche Veröffentlichung sowie native Geräte-, unabhängige Fach- und Designfreigaben werden nicht behauptet.

## Bildidee und redaktionelle Einordnung

Johannes erhält das **„Schwert des Lebens“**. Das Motiv verbindet eine ruhige, schlanke Klinge aus warmem Silber, eine zurückhaltende goldene Einlage, einen hellen Messinggriff und einen feinen lebenden Trieb. Die Ausführung nähert sich der Material- und Naturdetailqualität des A51-Baums. Sie vermeidet Kampf, Blut, Trophäen, leuchtende Machtinszenierung und Fantasy-Ränge.

Die Beschreibung in der Buchansicht nennt **Quelle und Weinstock** und bietet drei konkrete Leselinks an:

| Bildbezug | Tatsächlich verlinkter Abschnitt | Redaktionelle Grenze |
| --- | --- | --- |
| Leben | Johannes 1,4 | Thema des Johannesevangeliums, keine Behauptung eines dort beschriebenen Schwerts |
| Quelle lebendigen Wassers | Johannes 4,14 | Bezug der Erklärung; der gemalte Trieb ist keine wörtliche Rekonstruktion dieses Verses |
| Weinstock und Verbundenheit | Johannes 15,1–5 | Künstlerische Übertragung auf einen kleinen Trieb |
| Schwert als Symbol für Gottes Wort | Epheser 6,17 | Allgemeine Anregung für OLIVAs Buchschwerter; separat in jeder Buchansicht lesbar |

Die Darstellung ist als **künstlerisches Symbol** bezeichnet. Sie ist keine historische Waffenrekonstruktion, keine biblisch behauptete Schwertbeschreibung und keine geistliche Autorität. Originaler Luther-1912-Bibeltext öffnet sich getrennt im Reader. Weitere Buchmotive sollen nach der Pilotprüfung entwickelt werden; ein Bild für Johannes ersetzt keine vollständige Illustration aller 66 Bücher.

## Original und technische Varianten

Der Master wurde am 06.11.2026 mit dem tatsächlich ausgeführten OpenAI-`image_gen`-Werkzeug erzeugt. Originalausgabe, vollständiger Prompt, Prompt-Version und Rechte-/Freigabestatus stehen in [pilot.json](../art/swords/pilot.json). Der unveränderte 1.024 × 1.536-Pixel-Master liegt unter [john-life-pilot.png](../art/swords/masters/john-life-pilot.png), seine technische Hell-/Dunkelansicht unter [pilot-background-review.png](../art/swords/pilot-background-review.png).

Master-SHA-256: `67aef437a0cd7239b10339143f96993ff7bd2bacbd938f017e0801bc6c2a4c33`.

Die Laufzeit verwendet drei transparente PNGs. Sie wurden ausschließlich über vollständiges RGBA-Resizing mit Lanczos erzeugt: kein Ausschnitt, keine Retusche, keine Veränderung des Originalverhältnisses 2:3. Der Generator dekodiert die Ausgaben und vergleicht ihre Pixel mit dem jeweiligen skalierten RGBA-Puffer. Eine wiederholte Erzeugung ergab bytegleiche Dateien.

| Variante | Abmessungen | Dateigröße |
| --- | --- | --- |
| `assets/swords/john-life-pilot-256.png` | 256 × 384 | 33.022 Byte |
| `assets/swords/john-life-pilot-512.png` | 512 × 768 | 111.513 Byte |
| `assets/swords/john-life-pilot-768.png` | 768 × 1.152 | 243.980 Byte |
| Gesamt | Drei PNGs | **388.515 Byte** |

[runtime.json](../art/swords/runtime.json) erfasst Maße, Größen, SHA-256, Ableitung und den getrennten internen Laufzeit-/öffentlichen Freigabestatus. Die normalen Builds verwenden die gespeicherten Varianten. Die Laufzeit importiert weder den vollständigen Prompt noch den großen Master oder die Hintergrundprüfdatei.

## Verwendung im Produkt

Die große Illustration erscheint ausschließlich in der neuen lokalen Route **`/buch/JHN`**. Bei den geprüften Viewports ab 320 Pixeln ist der Bildrahmen mindestens 220 × 330 Pixel groß; auf größeren Ansichten bis zu 256 × 384 Pixel. Buchname, Schwertname und der lesbare Kapitelzähler stehen vor der Illustration. Eine ruhige Titelhierarchie gibt dem Bild Kontext, bevor weitere Erklärung und Kapitelwahl folgen.

Die **66 kompakten Vektorschwerter bleiben erhalten**. Johannes erhält darin einen feinen Trieb anstelle des zuvor durch die parametrische Familie gewählten Kronenornaments. Die anderen 65 Buchansichten verwenden weiterhin ihre großen Vektordarstellungen. Das ist eine erste hochwertige Bildidentität innerhalb einer bestehenden funktionsfähigen Familie, keine Behauptung von 66 neuen Bildmastern.

`BookSwordArtwork` wählt anhand von Bildbreite und Pixeldichte eine der drei PNG-Größen. Während des Ladens bleibt das zugehörige Vektorsymbol vollständig sichtbar. Nach einem Decoderfehler werden die übrigen Kandidaten desselben Piloten versucht. Wenn alle drei scheitern, bleibt das Vektorsymbol mit verständlicher Fehlermeldung und **„Bild erneut laden“** erhalten. Buch, Größe, Pixeldichte und Retry bilden eine Anfragekennung; zusätzlich geschützte Kandidaten-Callbacks verhindern, dass ein verspätetes Johannes-Bild einen inzwischen geöffneten anderen Buchzustand übernimmt.

## Fortschrittsdarstellung ohne Bildmanipulation

Die goldene Einlage des gemalten Masters ist ein Gestaltungselement. Der tatsächliche Lesefortschritt liegt als **separates SVG-Overlay** darüber. `JohnLightTrack` verwendet eine im 100 × 150-Koordinatenraum registrierte Spur, eine Clipmaske und Kapitelteilungen für die 21 Johanneskapitel. Der botanische Trieb und das Bild selbst werden nicht übermalt oder schrittweise freigeschaltet.

Die Datenquelle sind ausschließlich die gültigen, eindeutigen Einträge in OLIVAs bestehendem `readChapters`. Verse, kurze Abschnitte und bloßes Öffnen zählen nicht als Kapitel. Der sichtbare Zähler ist der genaue Wert; die Prozentanzeige wird gerundet:

| Bestätigte Johanneskapitel | Fortschritt | Gerundete Anzeige |
| --- | --- | --- |
| 0 von 21 | 0/21 | 0 % |
| 1 von 21 | 1/21 | 5 % |
| 11 von 21 | 11/21 | 52 % |
| 21 von 21 | 21/21 | 100 % |

Eine ausdrücklich bestätigte und erfolgreich gespeicherte Kapitel-Lesung im Reader darf einen kurzen Lichtimpuls auslösen. `SwordPulse` blendet die Spur über 240 ms ein und über 480 ms wieder aus: **720 ms, kein Loop**. Reines Öffnen, ein Bildladeabschluss, ein Kapitelwechsel oder ein externer Import löst keine Bestätigung aus. App- und Systemvorgabe für reduzierte Bewegung halten die Darstellung statisch. Fehlgeschlagene Speicherung darf nicht als Lesebestätigung inszeniert werden. Der Baumfortschritt wird durch das Ansehen des Schwerts nicht berührt.

## Architektur

| Datei | Zuständigkeit |
| --- | --- |
| `src/features/swords/model.ts` | Nur lesende Buchidentität und Kapitelprojektion; keine Speicherung |
| `pilot-assets.ts` | Statische Bildmodule, Auswahl bevorzugter Größe und Alternativen |
| `BookSwordArtwork.tsx` | Große Bild-/Vektordarstellung, Decoderzustand, Fallback, Retry und Anfragegrenzen |
| `JohnLightTrack.tsx`, `layout.ts` | Registrierte Johannes-Lichtspur und normalisierte Bildgrößen |
| `SwordArt.tsx`, `VectorSwordDrawing.tsx` | Erhaltene kompakte Vektorfamilie für alle 66 Bücher |
| `SwordPulse.tsx` | Kurzer, abbrechbarer Bestätigungsimpuls; kein Schreibvorgang |
| `scripts/prepare-sword-pilot.py` | Reproduzierbare technische PNG-Ableitung aus dem unveränderten Master |
| `scripts/check-sword-art.mjs` | Originalhash, PNG-Format, Maße, Varianten und Metadaten prüfen |

Es werden bestehende Expo-/React-Native- und `react-native-svg`-Funktionen verwendet. Kein neuer Bilddienst, keine Laufzeit-Bildgenerierung, kein Cloudkonto und keine neue Fortschrittsdatenbank sind erforderlich. Der aktuelle Stand verändert das V5-Nutzdatenformat nicht.

## Tatsächlich ausgeführte Prüfungen und offene Kriterien

Die technischen [Assetprüfungen](evidence/session-06/sword-assets.json) bestanden: Original unverändert, drei vollständige RGBA-PNGs mit erwarteten Maßen/Hashes, wiederholte Ableitung bytegleich und Generator/Prüfer aus anderem Arbeitsverzeichnis ausführbar. Die [Renderer-Vorprüfung](evidence/session-06/sword-renderer-preflight.json) belegt TypeScript und Assetverträge; sie war ausdrücklich noch keine Browser- oder Geräteabnahme.

Es bestanden **75 Fachtests**. Zunächst bestanden **sieben fokussierte Buchschwert-Browserfälle**, darunter Fortschrittsstände 0/1/11/21, Hell/Dunkel, 320/390/1.440 Pixel, Offline-Zugriff, Quellenlinks, Fallback nach drei Bildfehlern, Retry, verspätete Antwort und der endliche Lichtimpuls mit reduzierter Bewegung. Dieselben sieben Fälle bestanden später auch im vollständigen Lauf nach der Layoutkorrektur. Ein Axe-Scan der Buchansicht fand im geprüften Zustand keine automatisiert erkannten Verstöße. [Fokussierter Rohbericht](evidence/session-06/swords-e2e.json) und [Unitbericht](evidence/session-06/unit-results.json) sind erhalten.

Der anschließende vollständige Lauf nach der letzten Layoutkorrektur bestand **51/52**. Der einzige Fehler war eine einmalige Positionsmessung eines fortgesetzten Versentwurfs, bevor die asynchrone Reader-Wiederherstellung beendet war. Die Diagnose am unveränderten Produktbuild maß zunächst `y=6379` und danach ohne Testscroll `y=24`. Der Test wartet jetzt innerhalb des bestehenden Erwartungszeitlimits auf dieselbe Anforderung: ein tatsächlich vorhandenes Versrechteck mit `0 ≤ y < 200`. Kein Produktcode, Positionsschwellwert oder Nutzerfluss wurde dafür verändert. Anschließend bestanden **11/11** betroffene Capture-/Readerfälle ohne Überspringen oder Flaky-Ergebnis. **Dies ist kein neuer einzelner grüner Gesamtlauf.** [Gesamtlauf](evidence/session-06/e2e-first-full.json), [Nachtests](evidence/session-06/reader-regression.json), [Messung](evidence/session-06/reader-anchor-synchronization.json) und [Zusammenfassung](evidence/session-06/validation-summary.json) halten die Grenze fest.

Die Screens unter `docs/evidence/session-06/screens/` wurden im vollständigen Lauf nach der Layoutkorrektur am 07.11. gegen 12:31 UTC neu erzeugt. Schwertname und Kapitelzähler stehen dort vor dem Bild. Es sind reale Chromium-Aufnahmen mit synthetischen Leseständen, keine Handyfotos.

Android- und iOS-Debugexports enthalten je alle **98 A51-PNGs und drei Johannes-PNGs bytegenau**; der A51-Webrenderer und die großen Schwertmaster/-prompts sind ausgeschlossen. [native-builds.json](evidence/session-06/native-builds.json) belegt unsignierte JS-/Asset-Exporte mit `--no-minify --no-bytecode`, keine native Ausführung. Der tatsächliche [0.5→0.6-Updateversuch](evidence/session-06/offline-upgrade.json) bewahrt alle lokalen Zustandsdatensätze unverändert, benötigt keine Nutzdatenmigration und bestätigt nach Netzabschaltung die neue Buchroute, deren PNG-Dekodierung sowie alle sieben A51-Stadien. Ein ausschließlich im Vorgängercache vorhandener JS-Chunk bleibt verfügbar.

| Abnahmekriterium | Stand |
| --- | --- |
| Originalmaster unverändert; Varianten vollständig und reproduzierbar | Technisch bestanden |
| Gemalter Schmuck und bestätigter Kapitelstand klar getrennt | 0/1/11/21 in Hell/Dunkel im fokussierten und späteren vollständigen Lauf geprüft |
| Alle kompakten Buchsymbole bleiben verfügbar | Implementiert; 66 Identitäten fachlich modelliert, repräsentative Routen im Browser geprüft |
| Bilder zeigen beim Laden/Fehler einen brauchbaren statischen Ersatz | Drei Kandidaten, Fallback, Retry und verspätete Antworten im Zwischenstand geprüft |
| Kein Fortschritt durch Bildansicht oder Quellenlink | Unit-/Browserzwischenstand bestanden |
| Kurzer Impuls nur nach gespeicherter expliziter Kapitelbestätigung; beide Reduktionsvorgaben | Browserzwischenstand bestanden; keine native Animationsabnahme |
| Letzte Layoutkorrektur und Appregression | 51/52 im vollständigen Lauf, danach 11/11 nach ausschließlicher Testsynchronisierung; vereinigte Belege für 52 Szenarien, kein neuer einzelner grüner Gesamtlauf |
| Native Bündelung und echter Offlineversionswechsel | Beide Debugexports und 0.5→0.6-Updateprüfung bestanden; keine nativen Geräte |
| Native Bilddecoder, Animation, Screenreader, Speicher/Energie auf echten Geräten | Nicht durchgeführt |
| Safari-/iPhone-PWA-Prüfung, unabhängige theologische/historische Prüfung und persönliche Designfreigabe | Offen |
| Private 0.6-Aktualisierung und öffentliche Veröffentlichung | Private Bereitstellung erfolgreich, siehe `session-06/private-deployment.json`; öffentliche Veröffentlichung nicht freigegeben |

Reproduzierbare Aufrufe im Projektverzeichnis:

```sh
npm run content:swords
npm run typecheck
npm test
npm run build
npx playwright test tests/e2e/swords.spec.ts
```

Die optionale erneute Variantenableitung lautet `python scripts/prepare-sword-pilot.py`; Pillow wird dafür benötigt. Ein grüner Assetcheck ist keine visuelle, historische, theologische oder öffentliche Rechtefreigabe.

## Rechte und nächster Schritt

Der Pilot wurde für das Projekt unter den Bedingungen des Bildgenerierungsanbieters erzeugt. Die Herkunft ist dokumentiert; `public_release` bleibt **`not approved`**. Eine technische Einbindung erteilt keine zusätzliche öffentliche Vertriebsfreigabe und ersetzt keine abschließende Rechteprüfung. Das Original außerhalb des Projektmasters wurde nicht entfernt. Der zuvor integrierte A51-Baum und seine gesonderten Lizenzgrenzen bleiben unberührt.

Der lokale Abnahmestand ist für eine getrennt nachzuweisende autorisierte private Aktualisierung dokumentiert. Vor breiter Skalierung sollen Pilotgestaltung und Einordnung unabhängig geprüft werden. Weitere Bücher benötigen eigene Illustrationen; die bestehenden 66 funktionierenden Vektorschwerter bleiben bewahrt. Die Anforderungen an A51, Startseite, Bibelbilder, Anfängerführung, Datenschutz und native Geräteabnahme bleiben Bestandteil des offenen Master-Prompts.
