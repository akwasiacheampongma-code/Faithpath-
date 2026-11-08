# Geschichten und Offline-Abnahme · OLIVA 0.8

Stand: 08.11.2026. **OLIVA 0.8 mit David vor Goliath ist mit 117 Fachtests und einem einzelnen vollständigen 67/67-Browserlauf geprüft und seit 13:50:48 UTC privat bereitgestellt.** Der unabhängige Quellcheckpoint und die anschließende GitHub-Versionssicherung werden separat erzeugt und verifiziert; dieser Stand behauptet noch keinen 0.8-Push oder Remote-CI-Erfolg. Der ursprüngliche Master-Prompt bleibt maßgeblich.

## Szenenumfang und Inhalt

**Bibel → Eine Geschichte entdecken → Davids Vorbereitung lesen** öffnet **1. Samuel 17,38–45** im Modus „Tiefer verstehen“. Die acht Verse erzählen von Sauls Rüstung, Davids vertrauten Gegenständen und der bedrohlichen Begegnung. Der Ausgang des Kampfes folgt erst später. Die Einordnung erklärt „HERR Zebaoth“ und macht daraus keine pauschale persönliche Siegeszusage.

Originalbibeltext, KI-unterstützte redaktionelle Einordnung und KI-Illustration sind sichtbar getrennt. Gesicht, Größenverhältnisse, Kleidung, Landschaft und Morgenlicht sind künstlerische Interpretation, keine vermessene historische Rekonstruktion. Unabhängige theologische/historische sowie öffentliche Produktfreigabe stehen aus.

Der tatsächliche unveränderte Master liegt unter `art/biblical-next/masters/david-before-goliath.png` (1536×1024, SHA-256 `aec9c5366147142b052ad66098a59be607abc72c0e3a6da5e12035f58b052452`). Drei WebPs mit 640/1024/1280 Pixeln und insgesamt 448.938 Byte sind bytegleich nach `assets/images/` übernommen. Prompt, Quellen und technische Ableitung bleiben nachvollziehbar erhalten. Der frühere Generationseintrag beschreibt seinen damaligen Vorbereitungsstand; aktuelle Runtime-Metadaten stehen in `art/manifest.json`. Insgesamt enthält dieses Manifest acht biblische Master und 21 Varianten; fünf Szenen besitzen eigene Reader-Einordnungen.

## Gemeinsamer Storyrenderer

`StoryArtwork` wird von allen fünf Storykarten verwendet. Erst die tatsächlich gemessene Rahmenbreite und Pixeldichte bestimmen die bevorzugte Variante. Ein Bild wird nach erfolgreichem `onLoad` sichtbar; `onLoadEnd` allein zählt nicht, da es auch nach Fehlern auftritt. Pro Szenen-/Varianten-/Retry-Lebenszyklus verhindern Generationen und Cleanup verspätete Abschlüsse alter Kandidaten.

Nach einem echten Fehler folgen höchstens die beiden übrigen lokalen Varianten. Danach erscheinen eine lesbare Meldung und **„Bild erneut laden“** als erreichbarer Button. Der Leselink bleibt benutzbar. Bei einer Wiederholung beginnt ein neuer begrenzter Ladeversuch. Verfügbare statische Bilder benötigen keine Animation; der Renderer schreibt weder Nutzdaten noch Fortschritt.

Die Bibliothek verwendet Bildrahmen in 8:5 statt einer festen Höhe von 180 Pixeln. Der schmale alte Rahmen schnitt beim breiten David-Pilot die Figur ab. Der Readerkontext bleibt in 3:2. Der gezielte Browserlauf prüft mobile und große Ansichten, Hell/Dunkel, echte Dekodierung, Bildfehler und Retry; die automatisierte Zugänglichkeitsprüfung gehört dazu. Ein vollständiger Gesamtlauf ist davon getrennt.

## Begrenzte Offline-Wiederholung

Die App prüft den tatsächlichen Worker über `OLIVA_BUILD` und vergleicht Build-ID und Version mit dem Dokument. Bleibt eine Antwort aus, folgen höchstens drei zeitversetzte Wiederholungen. Nach Ausschöpfung zeigt die Oberfläche ehrlich, dass das Paket noch nicht vollständig bestätigt ist. Es gibt kein unbegrenztes Polling. Ports, Timer, Abortlistener und Workerlistener werden aufgeräumt; unsichtbare Tabs pausieren. Ältere Antworten dürfen einen neueren Buildkonflikt nicht überschreiben.

Ein Replay mit verzögerten echten Workerantworten am unveränderten 0.7-Kontrollexport zeigte eine dauerhaft hängenbleibende Bereitschaftsanzeige. Das belegt eine Robustheitslücke, **nicht** die Ursache des historischen 0.5-CI-Fehlers. Die drei Antworttests und der zusätzliche Registrierungsfall haben am finalen Kandidaten bestanden; der anschließende vollständige Browserlauf hat ebenfalls bestanden.

Ein späterer vollständiger 0.8-Lauf fand einen zusätzlichen tatsächlichen Produktfehler. Am unveränderten Kern `oliva-56f6fe3a12f05a5c` lieferte `controllerchange` bereits nach 466,7 ms einen Controller in `activating`; der spätere Effekt begann die Registrierung erst nach 945,4 ms und wartete dann über 38,8 Sekunden auf deren native Promise. Das Dokument blieb sichtbar und fokussiert. Zwei unabhängige spätere MessageChannel-Proben bestätigten den inzwischen aktivierten Controller und aktiven Worker mit der exakten ID/Version sowie alle 98 Cachedateien. Die Produktlogik hatte keine `OLIVA_BUILD`-Abfrage gesendet und zeigte weiter „wird vorbereitet“. Ein weiteres 16-Sekunden-Fenster änderte das nicht.

**Die Korrektur prüft einen verfügbaren tatsächlichen Controller vor dem Warten auf die Registrierung.** Ist noch keiner vorhanden, beginnt trotzdem nur der begrenzte Wiederholungsweg. Spätere Registrierung/Lebenszyklusmeldungen können normal weiterprüfen; ein Registrierungsfehler entwertet keinen bereits antwortenden passenden Controller. Der neue Regressionstest hält nur die Zustellung eines tatsächlichen Registerergebnisses zurück und prüft echte Workerantworten, ohne Cache oder Bereitschaft zu erfinden. Diagnose und Rohbelege: [Register-Gate](evidence/session-08/diagnostics/register-gate-diagnosis.md), [Messdaten](evidence/session-08/diagnostics/register-gate-diagnosis.json). Der Grund für Chromiums zugrunde liegenden Registrierungsstillstand ist ungeklärt. Das ist kein Beleg derselben Ursache beim historischen 0.5-CI, gehosteten Site oder physischen Gerät.

## Tatsächlich vorhandene Belege

| Prüfung | Aktueller Nachweis |
| --- | --- |
| Fach-/Persistenztests | 117/117 erfolgreich, `evidence/session-08/unit-results.json` |
| Typecheck und Web-/PWA-Build | erfolgreich; Kernbuild `oliva-618ddeeb77388032` |
| Biblische Bildintegrität | acht Master, 21 Varianten mit Herkunfts-/Hashmetadaten; öffentliche Freigaben bleiben offen |
| Android-/iOS-JS-/Assetexporte | erfolgreich; je 98 A51-PNGs, drei Johannes-PNGs und drei David-WebPs bytegenau, `native-builds.json` |
| Tatsächlicher 0.7→0.8-Workerwechsel | bestanden, `offline-upgrade.json` |
| Gezielte finale A51-/Offline-Browserfälle | 9/9 bestanden: fünf A51- und vier Offlinefälle, `registration-fixed-targeted.json` |
| Frühere gezielte Story-/Offline-Browserfälle | 7/7 am vorherigen Kandidaten, `story-offline-targeted-final.json`; Bild-/Zugänglichkeitsprüfungen bleiben belegt |
| Vollständiger 0.8-Browserlauf | **67/67 in einem vollständigen Lauf bestanden**, 0 übersprungen, 0 flaky, `e2e-results.json` |
| Private 0.8-Bereitstellung/HTTP-Abgleich | erfolgreich, 08.11.2026 um 13:50:48 UTC; 16 Routen, 101 App-/42 Review-Dateien bytegenau, anonym 401 |
| Unabhängiger 0.8-Quellcheckpoint/GitHub-Branch/Tag/CI | folgt nach der Abnahme; tatsächlicher Push/Remote-CI hier noch nicht bestätigt. 0.5–0.7 sind bestätigt gesichert |

Die beiden früheren vollständigen Browserläufe hatten je **65/66**: [vor Navigationssynchronisierung](evidence/session-08/e2e-before-navigation-sync.json) misst die neue URL zu früh, [vor Registrierungsdiagnose](evidence/session-08/e2e-before-visibility-diagnosis.json) enthält den echten beschriebenen Bereitschaftsfehler. Ein dritter Lauf bestand **66/67**: [vor Synchronisierung des transienten Zustands](evidence/session-08/e2e-before-transient-state-sync.json). Der Test verlangte eine flüchtige „wird vorbereitet“-Anzeige, obwohl eine zweite tatsächliche Prüfung bereits erfolgreich war. Jetzt wartet er auf die reale verspätete Callbackzustellung und prüft weiterhin Bereitschaft; Produktcode blieb unverändert. Der neue Registrierungsfall erhöht den Umfang auf 67, die im finalen Gesamtlauf alle bestanden haben. Keiner der drei früheren roten Läufe wird als grün ausgegeben.

| Belegstand | Tatsächliche Zuordnung |
| --- | --- |
| `before-registration-fix/native-builds.json`, `before-registration-fix/offline-upgrade.json` | vorheriger Kern `oliva-56f6fe3a12f05a5c`; unverändert erhalten |
| Aktuelle `native-builds.json`, `offline-upgrade.json`, `registration-fixed-targeted.json` | finaler Kandidat `oliva-618ddeeb77388032`; neu ausgeführte Prüfungen |
| Finaler vollständiger Browserlauf | `e2e-results.json`: 67/67 bestanden; Zusammenfassung und Rohberichtshashes in `validation-summary.json` |

Die nativen Exporte gehören zum Runtime-Digest `60ab4ab517a1bfe768b62ad76bc6ca359099f56cfaf5d09a7c1e326f0f2cbe58` über 277 Inputs. Sie belegen Metro-Plattformauflösung und Assetbytes, keine Bilddecoder-, Bewegungs-, Energie-, Installations-, Simulator- oder physischen Gerätetests. Große Bildmaster, Promptmaterial und A51-Webengine sind aus diesen nativen Bundles ausgeschlossen.

Der aktualisierte echte Updateversuch gehört zum finalen Kern `oliva-618ddeeb77388032` und verwendet denselben Ursprung und ein persistentes Chromiumprofil. Er startet mit dem erhaltenen 0.7-Build `oliva-f5f1df50305ec1e5`, wechselt zum tatsächlichen 0.8-Worker und vergleicht alle rohen IndexedDB-Datensätze unabhängig vom Appdecoder. V6 und privates Speicherdokument V1 bleiben unverändert; keine Datenmigration. Profil, Fortschritt, alter Rückblick, Entwurf, Originalarchiv und Rückkehrsicherung sind erhalten. Fünf Szenenbilder einschließlich David laden erstmals offline und nach Reload; sieben A51-Stadien, Johannesroute/PNG und ein exklusiver Vorgängerchunk bleiben verfügbar. Reines Betrachten erzeugt keine Datencommits.

```sh
npm run build
node scripts/offline-upgrade-v08.mjs /absoluter/pfad/zum/0.7/dist dist
```

Die sieben neuen gezielten Browserfälle bestätigen exakte Readergrenzen, ausdrückliche Abschnittsbestätigung ohne Kapitelabschluss, unveränderte Daten beim Bildbetrachten, echtes Fehlschlagen aller drei Varianten und erfolgreichen Retry, Offline-Erstbesuch/Reload, 320/390/1.440 Pixel, Hell/Dunkel, reduzierte Bewegung und automatisierte Zugänglichkeitsprüfung. Alle 67 Fälle haben danach in einem einzelnen vollständigen Lauf bestanden, ohne übersprungene oder Flaky-Fälle. Rote Testberichte bleiben erhalten; ein Upload oder Teiltest ersetzt keinen vollständigen Lauf.

Die gezielten vorläufigen Buildtool-Overrides und der aktuelle Audit ohne Funde sind in [Abhängigkeiten und CI-Laufzeit](14-dependency-security.md) separat dokumentiert. Dessen isolierte Probe am eingefrorenen 0.7-Input ist kein 0.8-Produktabnahmelauf. [GitHub-Versionssicherungen](13-github-version-backups.md) beschreibt die getrennte Quellensicherung ohne Änderungen an FaithPath, `main` oder dem Publikum der privaten Vorschau.

## Private Vorschau und anschließende Sicherung

[Private OLIVA-Vorschau](https://oliva-v04-private-preview.purplebean128.chatgpt.site) → **Bibel → Eine Geschichte entdecken → Davids Vorbereitung lesen**. Die URL enthält historisch `v04`, liefert aber seit **08.11.2026, 13:50:48.918899 UTC** Version 0.8 aus. Private Quelle `5b3a1afcc6800b18f8f81adc54c57c883f9f6b6b`, Deployment `appgdep_6af07e2c546c81919bc69b551a74e979`, Version `appgprj_6aedf77e5ce0819180c10eb799447018~appgver_d0f98ac24a1481918c540595014685ee`. Kernbuild `oliva-618ddeeb77388032` wird technisch als Hostpaket `oliva-6baa9eda299dea7a` ausgeliefert.

[Deployment](evidence/session-08/private-deployment.json), [private Quelle](evidence/session-08/private-source-checkpoint.json), [Paketprüfung](evidence/session-08/private-package-check.json) und [HTTP-Prüfung](evidence/session-08/private-http-check.json) bestätigen **16 App-Routen, 101 App-Dateien und 42 Review-Dateien bytegenau**, Manifest/Worker korrekt und anonym HTTP 401 ohne App-HTML. Publikum unverändert: ein Eigentümer, keine zusätzlichen Betrachter, Editoren oder Gruppen. Diese HTTP-Abnahme ist von den lokalen Chromiumtests getrennt; mangels vorgesehenem CUA-Werkzeug keine zusätzliche gehostete Browserprüfung und keine physische Handyinstallation behaupten.

Nach dieser Abnahme wird der unabhängige Quellcheckpoint separat gesichert: lokaler Tag `oliva-v0.8-stories-offline-private`, ZIP `/workspace/oliva-next-v0.8-stories-offline-source.zip`, äußeres Manifest `/workspace/oliva-v08-local-checkpoint.json`. GitHub-Ziele sind Branch `feature/oliva-v08-stories-offline-20261108` und Tag `oliva-v0.8.0`. Der tatsächliche Push, exakte Remote-Ref-/Teilbaumabgleich und CI-Lauf werden erst nach Ausführung im äußeren Arbeitsmanifest und nächsten Lieferstand bestätigt. Keine Quellcommit-/Archivhashes vorwegnehmen. Danach folgt unmittelbar die nächste Master-Iteration mit dem vorbereiteten Römer-Bildpilot und erweiterbarer Pilotregistrierung; Vorarbeit außerhalb des Projekts ist noch keine 0.9-Runtimeintegration.
