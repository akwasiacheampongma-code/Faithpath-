# A51-Olivenbaum in OLIVA

Stand: 7. November 2026. **Das A51-Arbeitspaket ist implementiert und seit 06.11., 18:10:52 UTC privat in OLIVA 0.5.0 bereitgestellt.** [App öffnen](https://oliva-v04-private-preview.purplebean128.chatgpt.site) · [privater Screenshotvergleich](https://oliva-v04-private-preview.purplebean128.chatgpt.site/review/a51/comparison.svg). Native Debugexports sind geprüft; Simulator-/Geräteabnahme und der übrige Master-Prompt bleiben offen. Der Browsernachweis besteht aus dem vollständigen 44/45-Lauf vor einer isolierten Webkorrektur und fünf erfolgreichen Nachtests, nicht aus einem neuen einzelnen grünen Gesamtlauf.

## Herkunft und gesicherte Referenz

Die Quelle ist `akwasiacheampongma-code/Faithpath-`, Branch `feature/simplified-step-experience-20261104`, Snapshot `a519ce898fa33907b07d5ac7a585595127556183`. Die Kennung in der Stadienbeschreibung lautet `FP-DESIGN-20261101-A51-FINAL-LIVING-TREE`.

Im Snapshot wurden `src/olive-a51/` mit Stadienmetadaten, Geometrie, Windmodell, WebGL-Renderer, Bildlader, Qualitätsregelung, Übergängen und CSS sowie die Adapter `src/olive-tree.js`, `src/olive-adapter.js` und `src/tree-view.js` analysiert. Die dortigen Adapter sind an FaithPaths DOM- und Datenmodell gebunden und werden nicht als OLIVA-Appcode übernommen.

Die Runtime enthält alle 21 WebP-Dateien in 384, 640 und 1.024 Pixeln. Die sieben in `stage-data.js` referenzierten PNG-Master sind dort nicht enthalten. Sie wurden im historischen Designcommit `0e02d5329a87cdcdfc52694d74c610da2975b357` unter `design/olive-tree-a5-1/assets/masters/` gefunden. **Alle sieben Master-Hashes und alle 21 WebP-Hashes stimmen mit den Angaben der A51-Stadienbeschreibung überein.**

| Bestand | Aufbewahrung in OLIVA | Verwendung |
| --- | --- | --- |
| Sieben unveränderte PNG-Master, 1.254 × 1.254 Pixel | `art/a51/masters/` | Referenz und Quelle der nativen PNG-Ableitungen |
| 21 unveränderte WebPs | `assets/a51/` | Responsive Webdarstellung und statische Webvorschau |
| 14 originale Runtime-/Vergleichsdateien | `art/a51/reference/runtime/` | Unveränderte, per Hash prüfbare Referenz; historische A5/A4-Dateien gehören nur zu dieser Referenz |
| Originalprompts, Art Direction, Manifest, Architektur und Bericht | `art/a51/reference/` | Nachvollziehbare Herkunft und Gestaltungsentscheidungen |
| Frühere OLIVA-0.4-Vektordarstellung | `art/a51/reference/oliva-04-vector.tsx.txt` | Erhaltene Entwicklungsreferenz, kein zweiter aktiver Baumrenderer |

Die 47 übernommenen Originaldateien sind mit Commit, Quellpfad, Größe und SHA-256 in [provenance.json](../art/a51/provenance.json) erfasst. Die FaithPath-Referenz und die ursprüngliche Anwendung wurden nicht verändert.

## Die sieben Lebensbilder

Die Zuordnung bleibt ein nullbasierter Index von 0 bis 6. Originalbilder, individuelle Silhouetten, Ausschnitte, Skalierung und Bodenanker `[650, 1100]` bleiben erhalten.

| Anzeige | Bild | Besonderheit des Originals |
| --- | --- | --- |
| 1 · Samen | `stage-1` | Kompakter, teilweise eingebetteter Olivenkern |
| 2 · Keimling | `stage-2` | Zarter Spross mit zwei Blattpaaren und kleiner Spitze |
| 3 · Junger Olivenbaum | `stage-3` | Schlanker Stamm und erste offene Äste |
| 4 · Wachsender Olivenbaum | `stage-4` | Breiterer S-Stamm, mehr Verzweigungen und Blattmasse |
| 5 · Starker Olivenbaum | `stage-5` | Breite niedrige Krone, kräftigere Wurzeln, noch keine Früchte |
| 6 · Erste Früchte | `stage-6` | Höhere linke Triebe, niedriger rechter Bogen und wenige Fruchtgruppen |
| 7 · Fruchttragender Olivenbaum | `stage-7` | Reife Krone und mehr Früchte; unveränderter A4-Master innerhalb der A51-Reihe |

OLIVA verwendet die Originalnamen passend zu den Bildern. Die Bedeutungen und der gespeicherte `growthStage` stammen weiterhin aus OLIVA. FaithPaths Regeln zum Zählen ausdrücklich bestätigter Entwicklungen werden **nicht** importiert. Das Öffnen, Laden, Animieren oder Vorschauen eines Baums schreibt keine Daten, bestätigt kein Lesen und erzeugt keine Entwicklung. Der Baum misst weder den Wert eines Menschen noch Gottes Liebe.

## Anpassung an React Native und Expo

Die Komponenten lösen je nach Plattform zu `src/features/garden/OliveTree.web.tsx` oder `OliveTree.tsx` auf. Gemeinsam sind `a51/stage-data.json`, die typisierten Stadien-/Layoutfunktionen und das A51-Windmodell. Die UI erhält nur `stage`, `size` und `animate`; sie besitzt keine eigene Fortschrittslogik.

Der geprüfte numerische und WebGL-Kern wird in `a51/engine/` als abgegrenzte JavaScript-Implementierung weiterverwendet. TypeScript-Deklarationen beschreiben seinen Vertrag mit den React-Adaptern. Dies ist kein vollständiges Umschreiben sämtlicher Shader- und Mathematikmodule nach TypeScript. Geschäftslogik und React-Komponenten bleiben davon getrennt.

Für die ausgelieferte Engine wurde das historische A5-Vergleichsprofil entfernt. Metro löst die statisch registrierten Bildmodule über die explizite Expo-SDK-58-Abhängigkeit `expo-asset` auf; die ursprüngliche URL-Auflösung relativ zu `import.meta.url` wird nicht verwendet. A51s originale sechs lokale Windfelder, ruhende Holzachsen, Bodenanker, Qualitätsstufen und statische Darstellung bleiben die Grundlage.

### Web

Der React-Adapter besitzt genau eine Szene pro montierter Baumkomponente. Stufenwechsel verwenden `setStage`; beim Verlassen wird die Szene mit ihren Beobachtern, Animationen und Grafikressourcen entsorgt. Unsichtbare oder im Hintergrund liegende Szenen pausieren. Systemvorgabe und OLIVAs Einstellung für reduzierte Bewegung führen zum vollständigen ruhenden Bild. Ein fehlgeschlagener Bildwechsel bewahrt das bereits geladene Stadium und bietet einen erneuten Ladeversuch an.

Die Webengine behält ihre Begrenzung auf 30/24/18 Bilder pro Sekunde, angepasste Netzdichte und maximal 1,5-fache Framebufferdichte. Die Auswahl des Quellbilds ist davon getrennt: Auf dichten Displays darf sie bis zur dreifachen Pixeldichte und damit zur vorhandenen 1.024-Pixel-Variante greifen. Dies erhöht nicht die Bildrate. Grafikverlust und fehlendes WebGL zeigen die vollständige Originalillustration.

Zusätzlich wurde eine ursprüngliche Sichtbarkeitsschwäche behoben. Der Browser lieferte bei 320 Pixeln in einem Callback zwei IntersectionObserver-Meldungen derselben Wurzel: `false`, danach `true`. Der ursprüngliche Zugriff auf `entries[0]` hielt den sichtbaren Baum irrtümlich unsichtbar und verhinderte das Nachladen. OLIVA verarbeitet die letzte passende Meldung. Echte Diagnose und deterministischer Replay beider Reihenfolgen sind in [IO-batch-diagnosis.json](evidence/session-05/IO-batch-diagnosis.json) belegt. Die unveränderte Originalreferenz bleibt als nachvollziehbarer Vorherstand erhalten.

### Android und iOS

Die native Darstellung verwendet portable PNG-Dateien aus den unveränderten Mastern. `scripts/prepare-a51-native.py` erzeugt 14 Auflösungsgruppen mit insgesamt 98 zugeschnittenen PNGs: je ein vollständiges Bild pro Stadium und Auflösung sowie für die sechs belaubten Stadien eine feste Basis und sechs lokale Bewegungsebenen. Die Ebenen verwenden die originalen anatomischen Gewichtungsfelder; RGB-Farben stammen aus den Mastern. Die bedingte Alpha-Aufteilung verhindert eine absichtlich doppelte Abdunklung in der Ruhepose.

React Natives nativer Animationstreiber bewegt die sechs Ebenen anhand zeitlich abgetasteter A51-Windwerte. Es gibt keinen JavaScript-Loop pro Bild; zwischen den 1,5-Sekunden-Abschnitten setzt JavaScript die Sequenz fort. Fokus, App-Zustand, Bewegungseinstellung und Sichtbarkeit im Scrollbereich steuern die Aktivität. Bewegungsebenen werden erst bei erlaubter, tatsächlich im ScrollView sichtbarer Bewegung geladen. Bildcallbacks sind gegen alte Stadien, Retries und Materialisierungen geschützt. Bei einem fehlerhaften Vollbild wird zunächst die andere Auflösung desselben Stadiums versucht; bereits vollständig geladene Ebenen können in Ruhe als letzter Fallback dienen. Vollständige PNGs dienen als statische Ansicht; kleine Galeriebilder starten keine Windengine.

Die native Ebenenbewegung ist eine plattformgerechte Annäherung an die kontinuierliche WebGL-Verformung. Sie ist kein Nachweis identischer bewegter Pixel oder gleicher Qualität auf echten Geräten. Übergänge, mögliche Säume, Speicherbedarf, flüssige Bewegung und Energieverbrauch müssen dort noch geprüft werden.

## Sichtbarkeit und gestalterischer Vergleich

Der Baum erscheint auf der Startseite als kompakte Vorschau und im Garten groß. Im Garten lassen sich die Stadien einzeln oder über **„Alle sieben Lebensbilder ansehen“** aufrufen. **„Zurück zu deinem Baum“** kehrt zum vorhandenen persönlichen Index zurück. Die Farbumgebung bleibt OLIVAs Olivgrün, Creme und warmes Gold.

Die Originalillustrationen wurden nicht neu gezeichnet, farblich überarbeitet oder durch Screenshots ersetzt. Ein botanisch besserer Baum oder eine grundsätzlich bessere Windanimation wird nicht behauptet. Nachvollziehbare Änderungen sind die React-/Expo-Einbindung, gemeinsame Datenverträge, ein nativer Renderer, plattformübergreifende Bewegungsvorgaben, die getrennte hochauflösende Quellbildauswahl und der belegte Sichtbarkeitsfix.

Der [Screenshotvergleich aller sieben Stadien](evidence/a51/comparison.html) zeigt echte Browseraufnahmen. „Vorher“ ist die unveränderte A51-Engine in einem isolierten Referenz-Harness, **nicht** ein neu getesteter vollständiger FaithPath-Build. „Nachher“ ist der Baum in der echten OLIVA-Web-App. Beide Detailreihen wurden bei 300 CSS-Pixeln und reduzierter Bewegung aufgenommen. Der OLIVA-Hintergrundakzent ist Teil der Einbettung; deshalb sind die gesamten Screenshotdateien nicht pixelidentisch.

Zusätzlich liegen [die Kontaktübersicht](evidence/a51/screens/before-after-contact.png), sieben helle und sieben dunkle OLIVA-Ansichten sowie mobile/große Hubaufnahmen im Screenshotordner. Die Detail- und Gartenaufnahmen wurden im erfolgreichen A51-Nachtest am 06.11. gegen 17:58 UTC erneut erzeugt. Die private Hostingausgabe stellt den Vergleich als [SVG](https://oliva-v04-private-preview.purplebean128.chatgpt.site/review/a51/comparison.svg) bereit; die HTML-Version bleibt lokale Dokumentation. Die persönliche Designfreigabe durch den Auftraggeber ist offen.

## Tatsächlich durchgeführte Prüfungen

| Prüfung | Erreichtes Ergebnis | Praktische Grenze |
| --- | --- | --- |
| Hash-/Dateiprüfung | 47 Originaldateien einschließlich sieben Mastern und 21 WebPs sowie 98 native PNGs geprüft | Belegt Identität und Vollständigkeit, keine allgemeine Rechtefreigabe |
| Fach-/Persistenztests | 72 bestanden; strikte Typprüfung erfolgreich | Kein Ersatz für native Geräteabnahme |
| Fünf A51-Playwright-Nachtests | Alle bestanden: sieben Stadien, unveränderte gespeicherte Daten, Galerie, 320/390/1.440 Pixel, Hell/Dunkel, Offline-Neustart und beidseitiger IO-Batch-Replay | Gezielter Nachlauf nach 44/45-Gesamtlauf; kein neuer einzelner grüner Gesamtlauf |
| Bewegungs-/Fehlerfälle im Browser | Sichtbarkeitspause/Wiederaufnahme, System- und App-Reduced-Motion, fehlendes WebGL, Kontextverlust, Ladefehler und erneuter Versuch geprüft | Kein Safari-/iOS-Grafiktreibernachweis |
| Tatsächliche PNG-Rekonstruktion | 14 Gruppen dekodiert und gegen skalierte Originalmaster zusammengesetzt; maximale Alpha-Abweichung 0,498032 und vormultiplizierte RGB-Abweichung 0,461478 von 255 | Rechnerische Ruhepose, kein nativer Bildschirm und keine bewegte Szene |
| Native Debugexports | Android und iOS erfolgreich; je alle 98 A51-PNGs bytegenau enthalten, A51-Webrenderer ausgeschlossen | JS-/Asset-Bundles ohne Bytecode, Signierung oder Installationspaket |
| Native Simulatoren / echte Geräte | Nicht durchgeführt | Keine Android-SDK-/iOS-Simulator- oder Hardwareabnahme vorhanden |
| Echter 0.4→0.5-Updatewechsel | Daten, Originalarchiv-Blob und Entwurf erhalten; alle sieben Stadien nach Offline-Neustart; alter exklusiver JS-Chunk erreichbar | Lokale Kern-App mit synthetischen Daten, keine reale Handy-PWA |
| Private Bereitstellung des A51-Stands | Erfolgreich; 13 App-Routen, 94 App-/33 Review-Dateien per HTTP geprüft; anonym 401 | Zusätzliche gehostete CUA-Browserprüfung mangels Werkzeug nicht durchgeführt |

Die anfängliche Reader-Schwäche bei Schriftänderung/Neuladen ist behoben; vier gezielte Reader-Fälle bestanden und blieben im späteren vollständigen Lauf erfolgreich. Der vollständige Browserlauf vor dem IO-Fix bestand **44/45**. Anschließend bestanden **5/5** betroffene A51-Fälle ohne übersprungene oder als flaky bewertete Tests. Die vereinigten Berichte decken alle **45 verschiedenen Szenarien** ab. **Ein neuer einzelner grüner 45/45-Gesamtlauf nach dem Fix wurde nicht ausgeführt.** Dauerhafte Rohberichte und diese Abgrenzung stehen unter [validation-summary.json](evidence/session-05/validation-summary.json), [vollständiger Lauf vor Fix](evidence/session-05/e2e-full-before-io-fix.json) und [gezielte Nachtests](evidence/session-05/a51-io-fixed-e2e.json). Die früheren Fehlerberichte bleiben erhalten.

Die native Exportprüfung entstand vor dem späteren reinen Web-IO-Fix. Dieser Renderer ist nachweislich in keinem der beiden nativen Bundles enthalten; die zeitliche Abweichung ist in [native-builds.json](evidence/session-05/native-builds.json) annotiert. Die tatsächliche [Updateprüfung](evidence/session-05/offline-upgrade.json) wurde gegen den finalen Kernbuild ausgeführt. Der historische GitHub-CI-Lauf mit 64 Fachtests und 35 Browserfällen bleibt ausdrücklich ein Nachweis für 0.4, nicht für 0.5.

Reproduzierbare Prüfungen aus dem Projektverzeichnis:

```sh
npm run content:tree
npm run typecheck
npm test
npm run build
npx playwright test tests/e2e/a51-tree.spec.ts
python scripts/check-a51-native.py
```

Die PNG-Prüfung benötigt Pillow und NumPy. Die Erzeugung mit `python scripts/prepare-a51-native.py` ist nur bei einer bewussten Änderung der Ableitungen nötig. Normale Builds verwenden die gespeicherten Dateien. Belege: [Assetintegrität](evidence/a51/asset-integrity.json), [native Ruhepose](evidence/a51/native-rest-fidelity.json).

## Rechte und Auslieferungsgrenzen

Die Übernahme in OLIVA ist durch den ausdrücklichen Projektauftrag vom 6. November 2026 autorisiert. Eine gesonderte Open-Source-Lizenz der übernommenen FaithPath-Dateien wurde nicht gefunden. Originalprompts und Herkunft sind aufbewahrt; eine vollständige Prüfung der Rechtekette der früheren Bildgenerierung ist damit nicht ersetzt.

Übernommener A51-Code und A51-Bilder sind ausdrücklich von OLIVAs MIT-Lizenz ausgenommen. [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md), `LICENSE` und die In-App-Quellen weisen auf die Herkunft und die offene Prüfung vor öffentlicher Weitergabe hin. Es gibt keine zusätzliche Freigabe für öffentliche Veröffentlichung, keinen Merge nach `main` und keine Änderung der ursprünglichen FaithPath-App.

Die private Vorschau unter [OLIVA · private Web-Vorschau](https://oliva-v04-private-preview.purplebean128.chatgpt.site) enthält jetzt den A51-Baum auf **Heute** und **Mein Garten**. Zugriff erfolgt mit dem berechtigten ChatGPT-Eigentümerkonto. Private Quelle: `672947b4853bf5e6ee326233c56209666391ff3c`; Deployment: `appgdep_6aee18220f288191920427af95d581f8`; Kernbuild: `oliva-f9aa29af9f863cf9`; Hostpaket: `oliva-e0fde474fcc06f7c`. [Bereitstellungsnachweis](evidence/session-05/private-deployment.json) und [HTTP-Prüfung](evidence/session-05/private-http-check.json) sind gespeichert.

Im beobachteten Hosting deaktivierten zwei HTML-Dateien den SPA-Fallback. Die finale Hostingausgabe enthält deshalb nur eine `index.html`, der Vergleich liegt unter `/review/a51/comparison.svg`. Nach dieser Anpassung lieferten alle 13 geprüften App-URLs wieder die Shell. Maßgeblich für spätere Änderungen bleiben `RESUME.md` und der Lieferstatus. Die bereitgestellte A51-Iteration verändert FaithPath und `main` nicht.

Anschließend bleiben die offenen Arbeiten des ursprünglichen Master-Prompts bestehen, insbesondere native Geräteabnahme, hochwertige Buchschwerter und weitere geprüfte Bild-/Kapitelinhalte. Dieser Zusatzauftrag ersetzt den Master-Prompt nicht.
