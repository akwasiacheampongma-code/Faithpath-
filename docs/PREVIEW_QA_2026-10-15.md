# FaithPath – Phase 2: Preview und Geräteabnahme

Stand: 15. Oktober 2026. Kandidat: **FP4-20261015-G-STABLE1**.

## Entscheidung

**NO-GO für eine Produktionsfreigabe. Phase 2 ist noch nicht abgeschlossen.**

Der unveränderte Kandidat besteht die erneut ausgeführten lokalen Tests. Eine
separate Netlify-QA-Site wurde angelegt. Der Upload scheitert jedoch am derzeit
ungültigen API-Zugang; deshalb existiert noch keine veröffentlichte FaithPath-
Preview. Hosted QA, der Update-Test auf Netlify und sämtliche iPhone-Abnahmen
sind **OFFEN**. Lokale Chromium-Ergebnisse ersetzen diese Gates ausdrücklich nicht.

**GO für die Fortsetzung der Preview-Prüfung**, sobald Zugang und Test-Origin
verfügbar sind. Es gibt aus diesen Prüfungen keinen Anlass für einen Rewrite,
einen Frameworkwechsel oder neue Funktionen.

## Version, Branches und Hosting

| Gegenstand | Nachgewiesener Stand |
|---|---|
| Ausgangsbranch | `fix/production-stabilization-20261015` |
| Lokal und per `git ls-remote` bestätigter Kandidaten-HEAD | `6ce37acf164f3e048b5446f115d918274c789f25` |
| Sicherungsbranch POLISH1 | `backup/production-polish1-20261015` |
| Sicherungscommit | `aabfc725653bbb93dc02aba6d1da46c9dca1eb6c` |
| Separater QA-Arbeitsbranch | `qa/stable1-preview-20261015` |
| `main`, unverändert | `d3f0c01adc8f1a67da79e4f0b4cbe5d99ca895b3` |
| Originalproduktion | https://zesty-rolypoly-d11fff.netlify.app |
| Produktions-Site-ID | `61a5e54b-0587-4de5-9203-4fa5cd03ee7e` |
| Produktionsdeploy vor/nach den Arbeiten | `6ac4c83bfdb6fe46924d3b81` |
| Produktions-Build-ID, erneut per HTTPS gelesen | `FP4-20261006-G-POLISH1` |
| Neue isolierte QA-Site-ID | `bea821b6-6f30-4385-8dca-c0f7150954d1` |
| QA-Verwaltung | https://app.netlify.com/projects/faithpath-stable1-qa-20261015 |
| Vorgesehene feste Test-Origin | https://faithpath-stable1-qa-20261015.netlify.app |
| FaithPath-Preview-Link | **Noch nicht verfügbar: kein FaithPath-Build veröffentlicht** |
| Schutz der QA-Site | Öffentlich, nach ausdrücklicher Freigabe des Nutzers ausschließlich für diese QA-Site |

Die vorgesehene Test-Origin ist keine bereits abgenommene Preview. Der vom
Connector bei einer leeren Site angezeigte technische URL-Eintrag ist kein
Nachweis eines STABLE1-Deployments. Originalproduktion und `main` wurden weder
beschrieben noch umgeschaltet. Es wurden keine echten Benutzerdaten verwendet.

## Build und Inhaltsidentität

Frisch gebaut mit Node/npm aus dem bestätigten Kandidaten-Stand:

```sh
FAITHPATH_OUT=qa-output/preview-verified \
FAITHPATH_BUILD_BRANCH=fix/production-stabilization-20261015 npm run build
```

Die Branchvariable reproduziert ausschließlich die belegte Metadatenzeile in
BUILD.txt. Der tatsächliche Quellcommit ist oben separat ausgewiesen.

| Eigenschaft | Ergebnis |
|---|---|
| Build-ID | `FP4-20261015-G-STABLE1` |
| Artefaktdateien | 321 |
| Dateien im Release-Prüfsummenverzeichnis | 320, sämtliche SHA-256-Werte erneut geprüft |
| Abweichende Dateien | 0 |
| Release-Manifest gegenüber vorherigem gesichertem Kandidatenbuild | bytegleich |

Build-Hash:
`8fefcc9b187b66c12b19444844b9f1e7c4671a5d5c4f8816ff36f6984fd9c4d0`

Content-Hash:
`812f002add339a256d807530d3509297678e41f9e27e381938e50036234c36b9`

Der Build-Hash ist SHA-256 der kompakten JSON-Darstellung der sortierten
Dateipfad→SHA-256-Zuordnung im Release-Manifest. Das Manifest selbst ist nicht
selbstreferenziell mitgehasht und bildet die 321. Datei. Der Content-Hash betrifft
die 141 Daten-JSON-Dateien ohne `data/audit/**` und stimmt weiterhin mit POLISH1
überein. Fragen, IDs, Antworten und Inhaltszuordnungen wurden nicht geändert.

**Veröffentlichte STABLE1-Build-ID und veröffentlichter Content-Hash: OFFEN.**
Die genannten STABLE1-Hashes sind lokal bestätigt. Das aktuelle Produktions-
Manifest wurde zusätzlich gelesen; es weist weiterhin POLISH1 und denselben
Content-Hash aus. Das belegt keine Veröffentlichung des Kandidaten.

## Ausgeführte Prüfungen

Alle folgenden PASS-Ergebnisse wurden in dieser Phase erneut ausgeführt.
Browserengine: Chromium auf Linux, lokale HTTP-Test-Origin. Playwright nutzte
neue Browserkontexte und ausschließlich synthetische Daten.

| Prüfung | Ergebnis | Umfang und Grenze |
|---|---|---|
| `npm test` | 108/108 laut Node-Test-Runner, 0 Fehler | Enthält auch eine als Datei gemeldete Standalone-Prüfung; keine Geräteprüfung |
| `tests/browser.mjs` | 12/12 | Zentrale Nutzerabläufe, Backup, Fehlerzustände, Offline, responsive Ansichten |
| `tests/stabilization-browser.mjs` | 12/12 | Entwurfsschutz, konkurrierende Tabs, Importschutz, Wegzuordnung, kleine Dialoge |
| `tests/chapter-questions-browser.mjs` | 17/17 | Reader, Sammlung, Status, Navigation, 1.300 Fragen, Tastatur, Offline |
| `tests/stabilization-update.mjs` | 3/3 Kontrollpunkte | Tatsächlicher lokaler Service-Worker-Wechsel POLISH1 → STABLE1 |
| `tests/preview-layout.mjs` | 32/32 Ansichten | 8 Routen × 2 Größen × Hell/Nacht, ergänzt durch Editor-Screenshots |
| Unbehandelte Browser-JavaScriptfehler | 0 in den genannten Läufen | Kein Beleg für beliebige ungetestete Eingaben |
| Netlify-Preview-QA | **OFFEN** | Kein FaithPath-Build hochgeladen |
| Netlify-Update auf fester Origin | **OFFEN** | Lokaler Update-Test ist kein CDN-Nachweis |
| iPhone Safari / installierte iPhone-PWA | **OFFEN** | Keine physischen Geräte verfügbar |

### Fachliche Abdeckung

- Onboarding → Situation → Bibelstelle → Reflexion → persönlicher Weg → Schritt.
- Wiederkehr, Erinnerungen, Rückblick, bestätigte Entwicklung und Archivierung.
- Bibelbuch/Kapitel öffnen, Verse markieren, Notiz mit Weg verbinden,
  Übersetzung wechseln und Text kopieren.
- Journal anlegen, filtern, suchen, öffnen und chronologischen Verlauf anzeigen.
- Weg A → B → keine Zuordnung: Journal, Reflexionsspiegel und Weglinks bleiben
  konsistent. Ein archivierter Weg in einem wiederaufgenommenen Entwurf bleibt erhalten.
- Entwurf nach Schließen, fremdem Formular, Export, Reload und Wiederaufnahme.
  Zweiter Tab überschreibt den ersten Entwurf nicht. Laufendes Speichern sperrt
  doppelte Eingaben. Entfernen der Bibelnotiz-Rolle erhält ungespeicherte Worte.
- Export → Importvorschau → Wiederherstellung; beschädigtes JSON und ungültige
  Zuordnungsstrukturen verändern weder gespeicherte Daten noch vorhandenen Entwurf.
- Geführter Weg mit Reflexion und Fortschritt nach Reload.
- Kapitelquiz nach dem letzten Vers, vier Antworten, gültige Lösung/Erklärung,
  fünf Fragen bis Abschluss, Rückkehr zum Reader bzw. Buch der Sammlung.
  Alle 27 Bücher, 260 Kapitel und 1.300 Fragen werden technisch zugeordnet;
  keine redaktionelle Neubewertung der Antworten.
- Quizstatus nach Export/Import und Offline-Reload; keine Punktzahl oder Streak.
- Vollständige Offline-Vorbereitung, Offline-Reload und Bibellesen in OTB/Luther.
- Fehlerzustände bei beschädigtem Speicher, ungültigem Vers und fehlender Datei.
- Deep-Link und Reload; lokale Server-Routingprüfung, Netlify-Routing bleibt offen.
- Automatisierte axe-Prüfungen ausgewählter Ansichten, Tastaturfluss, Zoom,
  lange Texte, viele Einträge und Reduced Motion. Kein vollständiger WCAG- oder
  VoiceOver-Konformitätsnachweis.

### Was der lokale Update-Test tatsächlich nachweist

Auf derselben lokalen Origin wird zuerst der rekonstruierte POLISH1-Build
installiert. Synthetische Daten aus Schema V3 werden durch POLISH1 zu V5 migriert;
ein alter ungespeicherter Entwurf bleibt bestehen. Erst nach vollständiger
Offline-Vorbereitung wird STABLE1 auf dieser Origin bereitgestellt.

Der alte Worker liefert weiter, bis der Nutzer „Jetzt aktualisieren“ wählt.
Nach der Aktivierung sind Hauptspeicher, Entwurf und Migrationssicherung
bytegleich zum Snapshot vor dem Update. Offline-Reload, Wiederaufnahme und
Speicherung des alten Entwurfs funktionieren; Markierungen und Quizstatus bleiben.

Das ist ein echter Browser-Service-Worker-Test, kein Mock. Nicht nachgewiesen
sind damit HTTPS/CDN-Cacheheader, Netlify-Auslieferung, iOS-Worker-Lebenszyklen,
installierter Standalone-Modus oder das Wiederöffnen nach Tagen.

## Layout und Bedienbarkeit

Die neuen eindeutig benannten Screenshots liegen unter
`qa/preview-stable1/screenshots/`. Sie wurden visuell inspiziert; die zusätzlich
geprüften Routen stehen vollständig in `layout-results.json`.

| Ansicht | Beobachtung |
|---|---|
| 390 × 844, Hell/Nacht | Baum, Orientierung/Bibel-Einstiege und nächster persönlicher Schritt ohne Scrollen sichtbar; kein horizontaler Seitenüberlauf |
| 320 × 568, Hell/Nacht | Baum und Einstiege sichtbar; der nächste Schritt erfordert Scrollen; kein horizontaler Seitenüberlauf |
| Reader | Buch/Kapitel/Übersetzung und markierter Vers lesbar; Kapitelquiz separat bei 100 % und 200 % Textgröße geprüft |
| Journal/Editor | Formular und Speichern durch Scrollen erreichbar; Bildschirmtastatur wurde nicht simuliert |
| Entwurfskonflikt | Fortsetzen und Sicherung in 320/375/390/430 Pixeln erreichbar |

Im synthetischen Rückkehrer-Szenario liegt der nächste Schritt bei 320 Pixeln
Breite zwischen y=551 und y=645; die feste Navigation beginnt bei y=497.
Nach rund 150 Pixeln Scrollen ist der Text darüber erreichbar. Bei 390 Pixeln
liegt er zwischen y=606 und y=675, vor der Navigation ab y=773.

Die Geometrie wurde nach Schließen des vom bewusst blockierten Service Worker
ausgelösten Offline-Hinweises gemessen. Dieser Testhinweis ist kein Defekt der
App. Die Kern- und Update-Offlineprüfungen liefen mit echten aktiven Workern.
Die älteren `home-320.png`/`home-390.png` des Kernskripts zeigen tatsächlich
„Entdecken“; sie werden deshalb nicht als Startseitenbeleg verwendet.

Safe Areas, dynamische Safari-Leisten, reale Tastatur, Auswahlgriffe,
Download-/Dateidialoge und VoiceOver sind **OFFEN**. Ein Linux-Viewport beweist
diese Eigenschaften nicht.

## Fehler und Risiken nach Kritikalität

| ID | Priorität | Nachweis / Auswirkung | Nächster Schritt |
|---|---|---|---|
| ENV-01 | P1, Abnahmeblocker | Hinterlegter Netlify-API-Zugang liefert für `/api/v1/user` und die bestehende Site HTTP 401 „Access Denied“. Connector-Lesezugriff und Site-Erstellung funktionieren über einen getrennten Zugang; dieser stellt keinen Upload-Endpunkt bereit. Kein Kandidaten-Deploy möglich. | `NETLIFY_AUTH_TOKEN` sicher in der Umgebung erneuern; Rechte auf der QA-Site prüfen; keine Tokens im Chat oder Repository |
| ENV-02 | P1, Abnahmeblocker | Netzwerkpolicy enthält die neue QA-Domain nicht; Zugriff endet mit Proxy-Tunnel 403. | Exakt `faithpath-stable1-qa-20261015.netlify.app` in der Umgebungs-Netzwerkfreigabe ergänzen |
| ENV-03 | Erledigt | Öffentliche QA-Freigabe zunächst automatisch abgelehnt; anschließend vom Nutzer ausdrücklich genehmigt und ausschließlich auf der neuen QA-Site umgesetzt. | Kein verbleibender SSO-Blocker; Originalproduktion unverändert |
| GATE-01 | P1, Release-Gate | Netlify-Update, iPhone Safari/PWA und reale Tastatur/Safe Areas nicht geprüft. | Geräteprotokoll vollständig ausführen; PASS mit Gerät/iOS, Build und Belegen dokumentieren |
| UX-01 | P3 | Nächster Schritt bei 320 × 568 unterhalb des sichtbaren Inhalts; Screenshot und Geometrie reproduzierbar. Erreichbar durch Scrollen, keine Datengefährdung. | In dieser Phase unverändert lassen; nach Geräteabnahme gesondert priorisieren |

Kein neuer P0- oder reproduzierbarer P1-Produktfehler in den ausgeführten
Szenarien. Das bedeutet nicht, dass offene Umgebungen fehlerfrei sind. Es gab
daher **keinen Blocker-Fix am Produktcode**. Die bekannten Stabilisierungskorrekturen
bleiben unverändert; der QA-Branch ergänzt nur Prüfskript, Dokumentation und Belege.

Der erste Versuch, die neue QA-Site öffentlich zu schalten, wurde von der
automatischen Freigabeprüfung abgelehnt: Sie bewertete die Entfernung von SSO
für alle Deploy-Kontexte als nicht ausdrücklich autorisierte Abschwächung.
Der Nutzer genehmigte danach ausdrücklich „Öffentliche Freigabe nur dieser
QA-Site“. Die Aktion wurde daraufhin regulär erneut ausgeführt und erfolgreich
bestätigt. Die ursprünglichen Produktionszugriffskontrollen wurden nicht angefasst.
Ein anschließender API-Probezugriff auf die QA-Site liefert weiterhin 401;
die öffentliche Website bleibt aus dieser Umgebung durch die Netzwerkpolicy blockiert.

## Fortsetzung und Abnahmekriterien

1. API-Zugang und Netzwerkfreigabe reparieren. Die öffentliche Freigabe der
   isolierten QA-Site ist bereits genehmigt und umgesetzt.
2. Ausschließlich Site-ID `bea821b6-6f30-4385-8dca-c0f7150954d1` als Ziel verwenden.
   Keine Git-Verbindung zu `main` einrichten. `.netlify/` ist bereits ignoriert.
3. POLISH1 aus dem Sicherungscommit bauen, Artefaktidentität prüfen und als neuen
   Deploy auf der festen **QA-Origin** bereitstellen. Referenz-Build-Hash:
   `9ab0a7812559790506f4457f2c16adea6f23594d2569140f5eb5a8407e386573`.
4. Vor dem nächsten Deploy Browser und iPhone-PWA auf dieser Origin mit POLISH1
   vorbereiten. Daten/Entwurf anlegen, Offline-Bereitschaft und Ausgangsbackup sichern.
5. STABLE1 als neuen Deploy auf derselben QA-Origin bereitstellen. Der stabile
   Domainname muss unverändert bleiben; zwei unterschiedliche Deploy-Permalinks
   erfüllen den Update-Test nicht. Falls dafür Netlifys Haupt-Deploy-Kontext
   verwendet wird, gilt das ausschließlich für die isolierte QA-Site.
6. Ausgelieferte BUILD.txt, UI-Build-ID, Release- und Content-Manifest lesen.
   Dateiprüfsummen selbst nachrechnen, nicht nur den im Manifest behaupteten
   Hash abschreiben. `_headers`/`_redirects` über Artefakt/Deploy-Metadaten und
   deren wirksames HTTP-Verhalten prüfen; sie werden nicht regulär ausgeliefert.
7. Hosted Nutzerabläufe und echte Worker-/Offline-/Update-Prüfungen ausführen.
   `QA_URL` bzw. `FAITHPATH_QA_URL` steuern die vorhandenen gezielten Prüfskripte.
   `tests/browser.mjs` startet derzeit ausschließlich seinen lokalen Server;
   es darf unverändert nicht als Hosted-Nachweis ausgegeben werden.
8. Geräteanleitung aus `docs/IPHONE_QA_STABLE1.md` vollständig ausführen.
   Jeden neuen Blocker auf eigenem `fix/stable1-preview-<fehler>`-Branch beheben;
   danach neue Commit-/Artefaktidentität feststellen und betroffene Gates wiederholen.
9. Bericht um echte Deploy-ID, Link, HTTPS-Header, Remote-Dateiprüfsummen und
   Geräteprotokolle ergänzen. Erst dann kann ein Release-Kandidat bestätigt werden.

**Go-Kriterium:** Hosted Daten-/Funktionsprüfung, identifizierter Remote-Build,
Netlify-Update auf derselben Origin und beide iPhone-Kontexte erfolgreich;
keine offenen P0/P1-Fehler. Ein Build oder lokales PASS allein erfüllt das nicht.

## Belege und Wiederholung

Alle neuen Belege: `qa/preview-stable1/`. Der ZIP-Bericht enthält dieselben
Belege einschließlich synthetischem Backup und Screenshots. Frühere Belege in
`qa/stabilization/` dienen nur als Vorgeschichte; die oben genannten Ergebnisse
stammen aus den neuen Läufen.

Im Berichtspaket liegen unter `deploy/` außerdem zwei fertig geprüfte
Upload-ZIPs: `FaithPath_POLISH1_QA_2026-10-15.zip` und
`FaithPath_STABLE1_QA_2026-10-15.zip`. Alle darin enthaltenen Dateien wurden
nach dem Packen erneut gegen ihre Release-Prüfsummen geprüft. ZIP-Prüfsummen,
Größen und Dateizahlen stehen in `qa/preview-stable1/deploy-packages.json`.
Die Archive enthalten ausschließlich die ursprünglichen Buildartefakte,
keine Zugangsdaten, Tests oder Benutzerspeicher.

Als Alternative zum derzeit blockierten API-Upload kann ein angemeldeter
Verantwortlicher im Netlify-Dashboard **der isolierten QA-Site** zunächst das
POLISH1-ZIP hochladen. Nach Bestätigung des Geräte-Ausgangszustands wird dort
das STABLE1-ZIP als neuer Deploy hochgeladen. Ein Upload auf die ursprüngliche
Produktions-Site ist ausdrücklich nicht Teil dieser Anleitung. Ein manueller
Upload behebt nicht die aus dieser Umgebung fehlende Netzwerkfreigabe für
automatisierte Hosted-Tests.

```sh
npm ci
npm test
FAITHPATH_OUT=qa-output/preview-verified \
FAITHPATH_BUILD_BRANCH=fix/production-stabilization-20261015 npm run build
# In einem zweiten Terminal:
PORT=4197 node scripts/serve.mjs qa-output/preview-verified
# Prüfungen gegen diese lokale Origin:
QA_URL=http://127.0.0.1:4197 node tests/stabilization-browser.mjs
QA_URL=http://127.0.0.1:4197 node tests/preview-layout.mjs
FAITHPATH_QA_URL=http://127.0.0.1:4197 node tests/chapter-questions-browser.mjs
# Kernskript startet seinen eigenen lokalen Server:
FAITHPATH_CHROMIUM=/usr/bin/chromium \
FAITHPATH_TEST_ROOT=qa-output/preview-verified FAITHPATH_PORT=4196 node tests/browser.mjs
# Vorher POLISH1 aus Sicherungscommit reproduzieren und Verzeichnis beibehalten:
FAITHPATH_PREVIOUS_ROOT=qa-output/production-reproduction-a \
FAITHPATH_CANDIDATE_ROOT=qa-output/preview-verified node tests/stabilization-update.mjs
```

Browser-Binärpfad bei Bedarf an die lokale Installation anpassen. Das lokale
Update-Skript benötigt das originale POLISH1-Artefakt; keine Dateien erfinden oder
eine STABLE1-Dateisammlung als POLISH1 deklarieren.
