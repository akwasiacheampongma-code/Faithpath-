# OLIVA · Stabilisierung und Vorbereitung der Nutzerabnahme

Der lokale Stabilisierungskandidat basiert auf OLIVA 0.18.0. Der Arbeitsbranch heißt `hardening/oliva-user-acceptance-20261118`. Die vorhandene private Vorschau `oliva-507a582d5a9cc3a6` dient als Ausgangspunkt. Der neue lokale Webbuild `oliva-ef3b048eca9d6b21` ist für die Browserabnahme bestimmt. [Private Vorschau](https://oliva-v04-private-preview.purplebean128.chatgpt.site/) · [Gerätematrix und eigener Kurztest](stabilization-device-matrix.md)

## 1. Sicherheit

**Picomatch.** Die erneute npm-Abfrage erfasst 619 Lockfile-Installationen. Die Advisory `GHSA-fc5q-39xc-vjpf` trifft auf fünf Stellen. Drei liegen im gewöhnlichen Abhängigkeitsbaum und zwei bei Vite und Vitest. Die reguläre Audit-Stufe meldet daraus 35 betroffene Paketpfade und beendet den Lauf mit Status 1. Der Vergleich mit der GitHub-Advisory und der npm-Registry ergab `4.0.7` als jüngste Ausgabe und keinen ausgewiesenen Fix. [Lockfile-Prüfung](evidence/stabilization/npm-lock-advisories-before.json) · [Upstream-Status](evidence/stabilization/picomatch-upstream.json) · [npm audit](evidence/stabilization/npm-audit.json)

Der tatsächliche Webbuild importiert die 2.x-Version in Node über `micromatch`. Weitere mögliche Pfade sind das Verarbeiten von Asset- und Dateiglobmustern in Expo, `sideEffects`-Muster aus Paketmetadaten in Metro sowie Dateisuche und Testfilter in Tinyglobby, Jest, Vite und Vitest. Diese Aufrufer verarbeiten Projekt-, Paket- oder Testkonfiguration im Build- bzw. Testprozess. Die Prüfung fand keinen Pfad von einer Browseranfrage, Bibelsuche oder Sicherungsdatei zu diesen Globmustern. Die 50 verglichenen Web-Chunks und die geprüften Android- und iOS-JavaScript-Exporte enthalten kein picomatch-Modul. Build- und Testjobs mit fremden Konfigurationen bleiben ein eigener Risikobereich. [Tatsächliche Node-Imports](evidence/stabilization/picomatch-build-imports.jsonl) · [Web-Modulabgleich](evidence/stabilization/web-runtime-dependencies.json) · [Android](evidence/stabilization/native-android-modules.json) · [iOS](evidence/stabilization/native-ios-modules.json)

Die jüngsten Registry-Ausgaben der acht direkt betrachteten Elternpakete behalten picomatch als Abhängigkeit oder Peer bei. Der von der Advisory verlinkte Pull Request ist offen. Eine Korrektur benötigt eine vom Upstream ausgewiesene kompatible Version für die tatsächlich verwendeten 2.x- und 4.x-Pfade oder eine kompatible Aktualisierung der jeweiligen Elternpakete. Bei Verfügbarkeit die Auflösung pfadbezogen prüfen und die frische Installation anhand des Lockfiles, den normalen Audit-Gate, Web- und native Exporte sowie die Offline- und Backup-Regressionen erneut ausführen. Die Sicherheitsstufe in CI bleibt die bestehende moderate Schwelle. [Elternpakete](evidence/stabilization/picomatch-parent-versions.json) · [Upstream-Verlauf](evidence/stabilization/picomatch-upstream-history.json) · [CI-Definition](../.github/actions/quality/action.yml)

**Private Vorschau.** Sieben autorisierte Antworten lieferten die exakt erwarteten Paketbytes nach Dekompression. Die gleichen sieben anonymen Aufrufe lieferten HTTP 403. Geprüft wurden zwei HTML-Routen, das gemeinsame JavaScript, eine Schrift, ein Bild, der Worker und das Manifest. Bei der ersten ergänzenden Stichprobe lieferte der Pfad einer nicht geladenen Fehlerseiten-Datei HTTP 307. Für das tatsächlich initial eingebundene gemeinsame JavaScript lieferte der zweite Lauf HTTP 200 und den erwarteten Hash. [Erste Stichprobe](evidence/stabilization/private-headers.json) · [Normale Antworten und Header](evidence/stabilization/private-headers-entry.json)

In den sieben erfolgreichen Antworten fehlen CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options` und `Permissions-Policy`. Der Host lieferte `public, max-age=0, must-revalidate`. Die Zugriffsprüfung gilt für die beobachteten Anforderungen. Schutz gegen andere Cache- oder Proxy-Konstellationen, Lieferbarkeit von Schutzheadern und die Hostingprotokolle des Anbieters müssen vor einer externen Abnahme geklärt werden. Geplante Header brauchen einen Test gegen Login, Einbettung, Expo-Stile, Schriften, Service Worker und Sicherungsdownloads. Die Freigabe des Hostings ist ein eigener Schritt. [Plan für Hosting und Datenschutz](privacy-security-rights/approval-plan.md)

**Sicherungen.** Der FaithPath-Parser prüft die bestehenden Grenzen für Knotenzahl und Tiefe nun beim Durchlaufen des JSON-Baums. Zur Prüfung jedes Werts verfolgt er den aktuellen Pfad im Baum. Für UTF-8-Fingerabdrücke verwendet OLIVA einen Bytepuffer in benötigter Größe. Zu große Strings können bereits über ihre Mindestgröße abgewiesen werden. Format, Größenlimits, Originalbytes und SHA-256 bleiben mit vorhandenen Sicherungen kompatibel. In einer separaten Node-Probe mit einem synthetischen 8-MiB-Text sank die Speicherspitze des Prozesses von rund 438 auf 89 MiB. Beide Fingerabdrücke stimmten mit Node Crypto überein. Die äußerste JSON-Datei wird weiterhin komplett gelesen. Die Laufzeit und der Speicherbedarf nahe dem 64-MiB-Limit bleiben auf kleinen Geräten zu prüfen. [Parser](../src/features/imports/source.ts) · [Hashes](../src/lib/hash.ts) · [Speicherprobe](evidence/stabilization/backup-hash-probe.json) · [Browser-Datenfluss](evidence/stabilization/local-data.json)

## 2. Ladezeit

Vorher und nachher liefen unter Chromium mit 390 × 844 CSS-px, zweifacher Pixeldichte, 150 ms zusätzlicher Latenz sowie 1,6 Mbit/s Download und 0,75 Mbit/s Upload. Pro Paket und Ansicht wurden drei frische Kontexte mit deaktiviertem HTTP-Cache und blockiertem Service Worker geprüft. „Bereit“ umfasst die sichtbare Hauptaktion beziehungsweise das Kapitelbild, geladene Webschriften und dekodierte Bilder. Die Anfragezeiten von Skripten, CSS, Schriften und Bildern sowie IndexedDB-Verbindungs- und Transaktionszeiten liegen einzeln vor. Überlappende Zeitspannen lassen sich nicht addieren. [Rohmessungen vorher](evidence/stabilization/start-before.json) · [Rohmessungen nachher](evidence/stabilization/start-after.json)

| Messgröße, Median aus drei Proben | Bisherige private Fassung | Lokaler Kandidat |
|---|---:|---:|
| Heute bereit | 23,72 s | 16,12 s |
| Noah-Geschichte bereit | 22,05 s | 14,99 s |
| `DOMContentLoaded` für Heute | 12,53 s | 2,05 s |
| JavaScript-Transfer bis Heute bereit | 2.357.089 Byte | 2.068.236 Byte |
| JavaScript-Transfer bis Noah bereit | 2.357.989 Byte | 2.059.125 Byte |
| Webschrift-Transfer, beide Ansichten | 1.436.324 Byte | 298.848 Byte |
| Bilder bis Heute bereit | 396.551 Byte | 396.551 Byte |
| Bilder bis Noah bereit | 127.107 Byte | 127.107 Byte |

Beide Ansichten sind im Median rund 32 Prozent früher bereit. Der frühe `DOMContentLoaded`-Zeitpunkt markiert die HTML-Bereitschaft. Der erste App-Inhalt folgt nach dem Laden der nötigen Chunks. Die beobachteten Vorgänge zum Öffnen und ersten Lesen von IndexedDB zusammen dauerten im bisherigen Paket 25–67 ms und im Kandidaten 26–52 ms. Das gilt für frische Profile. JavaScript und die enthaltenen Bibel- und Katalogdaten bleiben der größte Anteil am Kaltstart. [Zeitpunkte nach Ressource](evidence/stabilization/start-after.json)

Das gemeinsame JavaScript war in der Ausgangsfassung der größte Transferposten. Das mit Expo 58 verfügbare granulare Chunking verringert die anfangs nötige Menge. Der Reader, Bibeltext und Fragen bleiben Teil desselben vollständigen PWA-Pakets. Die zweite Änderung komprimiert die beiden vollständigen Webschriften als WOFF2. Der Fonttransfer sank von rund 1,44 auf 0,30 MB. Die Umstellung bewahrt Zeichenzuordnungen, Glyphen, Metriken, Bezeichnungen und Layouttabellen. Native Exporte verwenden die TTF-Dateien. Die WOFF2-Variante mit bisheriger Chunkaufteilung und die Vorprobe mit granularer Aufteilung sind als Zwischenmessungen erhalten. [Fontdateien und Vergleich](evidence/stabilization/web-fonts.json) · [Nur WOFF2](evidence/stabilization/start-woff2-only.json) · [Vorprobe Chunkaufteilung](evidence/stabilization/start-granular-experiment.json)

Die PWA-Vorbereitung und der Offline-Neustart waren eigene Läufe mit auf Loopback aktiver Worker-Installation. Der Test gleicht die vollständige Liste im tatsächlichen Cache mit der Liste des Workers ab und startet danach eine zuvor unaufgerufene Geschichte im selben Browserprofil ohne Netzwerk. Die späteren physischen Messungen benötigen DSL-/Mobilnetz, iOS Safari und Android Chrome. Die Ergebnisse im Labor belegen keine Feldlatenz.

| Offline-Vergleich, je drei abwechselnde Proben | Bisherige private Fassung | Lokaler Kandidat |
|---|---:|---:|
| Vorbereitung bis zur Bereitschaftsmeldung | 3,81 s | 4,20 s |
| Noah nach Offline-Neustart bereit | 1,97 s | 1,94 s |
| Vollständig zwischengespeicherte Dateien | 105 | 126 |
| Größe dieser Dateien | 18,55 MB | 17,44 MB |

Die Vorbereitung dauerte in dieser Stichprobe rund 0,39 Sekunden länger. Die neue Chunkaufteilung erzeugt mehr einzelne Dateien. Das Offlinepaket ist insgesamt 1,12 MB kleiner. Der Neustart ist in beiden Stichproben im selben Zeitbereich. Alle 64 Bilddateien stimmen bytegenau überein. Beide Schriften wurden bei jedem Offline-Neustart geladen. [Paketvergleich](evidence/stabilization/pwa-package-comparison.json) · [Vorher 1](evidence/stabilization/offline-before-1.json) · [Vorher 2](evidence/stabilization/offline-before-2.json) · [Vorher 3](evidence/stabilization/offline-before-3.json) · [Nachher 1](evidence/stabilization/offline-after-1.json) · [Nachher 2](evidence/stabilization/offline-after-2.json) · [Nachher 3](evidence/stabilization/offline-after-3.json)

## 3. Datenschutz und Rechte

Der Webzustand liegt in IndexedDB. Die native App speichert in SQLite im Appbereich. Dazu zählen Name und Einstellungen, Bibelposition, Lesestände, Markierungen, Lesezeichen, Antworten, Gedanken, Entwürfe, Vorhaben, Baumstand und original importierte FaithPath-Dateien. Der normale Export kann alle aktuellen Inhalte und die Originale als Klartext enthalten. Reparatur- und Rückkehrdaten können weitere frühere Stände enthalten. Die Freigabe eines Exports über den Systemdialog kann eine zusätzliche Kopie außerhalb von OLIVA erzeugen. Ein Profil mit synthetischen Daten prüft lokal Anfragen, Import, Export und Wiederherstellung. [Technischer Datenschutz-Audit](41-privacy-security-rights-audit.md) · [Aktueller Nachweis](evidence/stabilization/local-data.json)

Der Vorschlag für eine optionale verschlüsselte Sicherung ergänzt später ein versioniertes äußeres Dateiformat um die bestehende JSON-Sicherung. Vor Umsetzung sind gemeinsame Lesbarkeit auf Web und nativen Plattformen, klarer Umgang mit Passwortverlust, Begrenzung rechenintensiver Parameter und Rückwärtskompatibilität mit V1–V11 zu prüfen. Die Entscheidung betrifft einen künftigen Freigabeschritt. [Verschlüsselungs- und Kompatibilitätsplan](privacy-security-rights/approval-plan.md)

Die Entwürfe verwenden belegte Angaben und markierte Platzhalter für Betreiber, Kontakt, Rechtsgrundlagen, Anbieterrollen, Aufbewahrung und öffentliche Rechte. Die Liste der tatsächlichen Webmodule ergänzt Lizenzdeklarationen durch die im jeweiligen Paket vorhandenen Lizenzdateien. Bei Paketen ohne eigene Lizenzdatei im installierten Ordner sind die Upstream-Pflichttexte zu belegen. Eine rechtliche Prüfung und die Freigaben zu Bildrechten, Katalogen, Lizenztexten und Betreiberangaben stehen aus. [Impressum](privacy-security-rights/impressum-draft.md) · [Datenschutz](privacy-security-rights/privacy-draft.md) · [Bildnachweise](privacy-security-rights/image-credits-draft.md) · [Lizenzübersicht](privacy-security-rights/licenses-draft.md)

## 4. Geräte- und Qualitätstests

Die Browser- und Offline-Tests verwenden ausschließlich synthetische Daten auf Loopback. Die Geräte- und Hilfstechnologieprüfung für echte iPhones und Android-Geräte steht aus. Das Testblatt enthält Vorbereitung, erwartete Ergebnisse und einen kurzen Handytest der vorhandenen Vorschau. [Gerätematrix](stabilization-device-matrix.md)

- Typecheck, sieben Inhaltsprüfungen, 345 Fachtests in 39 Dateien und Produktionsbuild erfolgreich. Der Pakettest findet alle 64 vorhandenen Bilder und bestätigt die einzelne geistliche Schwertdarstellung. [Typecheck](evidence/stabilization/types.log) · [Inhaltsprüfungen](evidence/stabilization/content-checks.log) · [Fachtests](evidence/stabilization/unit-tests.log) · [Webbuild](evidence/stabilization/web-build.log)
- Die Browserabnahme deckt 161 bestehende Szenarien ab, darunter Axe-Stichproben, Tastatur, große Schrift, reduzierte Bewegung, PWA, Sicherungen und Offlinezustände. Im ersten vollständigen Lauf bestanden 160 Szenarien. Der eine fehlerhafte Test wurde gezielt korrigiert und gegen beide Pakete erfolgreich wiederholt. Die Abnahme ergibt sich aus diesen Läufen auf demselben Kandidatenpaket. [Unveränderter Erstbericht](evidence/stabilization/browser-results.json) · [Laufprotokoll](evidence/stabilization/browser-test.log)
- Im Profiltest aktiviert sich der neue Worker am gleichen Ursprung. Er erhält vier IndexedDB-Einträge mit aktivem Zustand, unveränderter FaithPath-Originaldatei, Rückkehrsicherung und Index. Das Profil enthält Lesefortschritt, dunkles Thema, Markierung, Lesezeichen, Gedanken, Entwurf, Vorhaben, Gartenstand und Antworten aus NT- und Geschichtenfragen. Nach dem Offline-Neustart waren alle 66 Bücher und die gespeicherten Antworten zugänglich. Der Sicherungsexport entsprach genau dem Profilzustand. Die Wiederherstellungsvorschau schrieb keine Daten. [PWA-Wechsel mit gefülltem Profil](evidence/stabilization/pwa-upgrade-full-profile.json)
- Sechs Browserprüfungen zu fehlerhaftem Import, schreibgeschützter Vorschau, wörtlicher Anzeige von Text mit HTML-Zeichen, Export, bestätigter Wiederherstellung und erneutem Offline-Lesen bestanden. Die 236 beobachteten Anfragen waren GETs an den lokalen Ursprung. Der synthetische Prüftext erschien weder in Anfragen noch im Browserprotokoll. [Datenfluss und Wiederherstellung](evidence/stabilization/local-data.json)
- Die statischen Metro-Exporte für Android und iOS bestanden JavaScript-Syntax, Dateireferenzen, Prüfsummen der erwarteten Bilder und Vergleich der Lebensthemen mit dem Originalkatalog. Beide Exporte führen die ursprünglichen TTF-Schriften. Die Tests analysieren JavaScript und Assets. Installation, native Bilddekodierung und Geräteleistung stehen aus. [Native Exporte](evidence/stabilization/native-exports.json) · [Nativer Katalogvergleich](evidence/stabilization/native-topics.json)
- Der erste Offline-Reader-Test suchte nach dem veralteten alleinstehenden Buchnamen „Offenbarung“. Der Snapshot zeigt das vollständig geladene Kapitel mit der Überschrift „Offenbarung 22“. Das Verhalten traf auf beide Pakete zu. Nach der Anpassung an die tatsächliche Überschrift bestand derselbe Test für beide Pakete, einschließlich letzten Verses, Speichern und Neustart. [Ursprünglicher Snapshot](evidence/stabilization/test-triage/offline-reader-initial.md) · [Vergleich mit altem Test](evidence/stabilization/test-triage/offline-reader-private-baseline.log) · [Korrigierter Test der Basis](evidence/stabilization/test-triage/offline-reader-private-baseline-corrected.log) · [Korrigierter Test des Kandidaten](evidence/stabilization/test-triage/offline-reader-candidate-corrected.log)

## 5. Quellstand und Wiederholung

Der Quellstand `0d077a0937dc32bfa4005423ab6b6a0d510a3175` liegt im lokalen Arbeitsbranch. Der private Handy-Link liefert weiter das verifizierte Paket der Site-Version 24 mit einem zugelassenen Konto. Original-FaithPath, bestehende OLIVA-Tags und Lockfile wurden anhand der Ausgangsprüfsummen verglichen. Die neue Fassung ist bis zur Geräte- und Sicherheitsabnahme ein Kandidat auf 0.18.0-Basis. [Nachweis zu Quelle und Tags](evidence/stabilization/source-checkpoint.json) · [Verglichener privater Zugriff](evidence/stabilization/private-site-state.json)

```bash
npm run build
npm run preview
```

Für die automatischen Vergleiche den vorhandenen privaten Webexport als Ausgangspunkt und den neu gebauten Ordner `dist` verwenden. Die folgenden Befehle schreiben ihre Nachweise in ein separates temporäres Verzeichnis.

```bash
oliva_baseline=/workspace/sites/oliva-v04-preview/dist
oliva_evidence=$(mktemp -d)
node scripts/measure-web-start.mjs "$oliva_baseline" "$oliva_evidence/start-before.json" 3
node scripts/measure-web-start.mjs dist "$oliva_evidence/start-after.json" 3
node scripts/check-current-pwa-upgrade.mjs "$oliva_baseline" dist "$oliva_evidence/upgrade.json"
node scripts/audit-local-data.mjs "$oliva_evidence/local-data.json" dist
npm run typecheck
npm test
npm run test:e2e
```

Die beiden WOFF2-Dateien liegen im Quellstand. Ihre Reproduktion nutzt FontTools 4.61.1 und Brotli 1.2.0 als optionale Entwicklungswerkzeuge. Der laufende Appbuild verwendet die bereits konvertierten Dateien. [Reproduktionsskript](../scripts/prepare-web-fonts.py)
