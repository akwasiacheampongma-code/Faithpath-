# Originale Lebensthemen · Integrationsvertrag

Der laufende Master-Auftrag umfasst die bestehenden FaithPath-Funktionen. Nach der vollständig ausgelieferten Geschichtenintegration werden die 18 ursprünglichen Lebensthemen in OLIVA überführt. Die neun eigenen Einsteigerwege bleiben erhalten. Diese Arbeit verändert weder das Originalprojekt noch GitHub-main. Die eigene Abnahme ist erfolgreich;0.15.0 ist seit17.11.2026,08:07:16UTC eigentümerprivat bereitgestellt.

## Geprüfter Bestand

Quelle ist `src/content.js`, Export `LIFE_TOPICS`, aus dem unveränderten FaithPath-Snapshot `a519ce898fa33907b07d5ac7a585595127556183`. Die vollständigen Originalbytes liegen verlustfrei unter `content/faithpath-topics/source/content.js.gz`; Provenienz, Originalhash, Importbericht und Rechtehinweise liegen daneben. Der statische Acorn-Import führt den alten Programmtext nicht aus. Er übernimmt ausschließlich Literalwerte und verwirft Aufrufe, Spread, berechnete Schlüssel und doppelte Felder. `npm run content:topics` vergleicht die daraus reproduzierten Dateien bytegenau.

Übernommen werden alle 18 Themen, 45 Bibelstellen, 45 Einordnungen und 45 Reflexionsfragen aus elf Kategorien. Titel, Untertitel, Einordnungen und Fragen bleiben unverändert. Die Referenzen werden auf kanonische Buchcodes normalisiert und vollständig gegen den lokalen Luther-1912-Korpus geprüft. Die Originale enthalten keine Dauern, Lernziellisten oder Gebete; solche Angaben werden nicht ergänzt oder als Original ausgegeben. Die Übertragung ersetzt keine unabhängige Fach- oder Rechtefreigabe.

## Gestaltung und Bedienung

**Wege → 18 Lebensthemen entdecken** öffnet `/themen`. Eine ruhige typografische Übersicht erläutert den Ablauf, bietet eine Suche auch mit zusätzlichen Leerzeichen und zeigt die tatsächlichen zwei oder drei Bibelabschnitte eines Themas. Die bestehenden Cormorant-/DM-Sans-Schriften und Creme-/Oliv-/Goldfarben gelten auch hier. Es gibt keine zusätzlichen Bilder, erfundenen Zeitangaben oder Ranglisten. Fortschritt erscheint erst, wenn eigene Schritte tatsächlich abgeschlossen wurden.

Alle Themen nutzen `/weg/[id]` und denselben Reader wie die bisherigen Wege. Die IDs beginnen mit `faithpath-topic-`; das Originalthema Vergebung überschreibt deshalb nicht den bisherigen Weg Vergebung. Öffnen, Suchen und Lesen der Einführungen schreiben keinen persönlichen Datensatz. Erst die ausdrückliche Leseaktion aktiviert ein Thema; das Lesen eines Abschnitts und der freiwillige Abschluss bleiben getrennte Bestätigungen. Der Hub setzt das aktive Thema fort.

Die Originaleinordnung erscheint als **ursprüngliche FaithPath-Einordnung, kein Bibeltext**. Zwei gesonderte OLIVA-Entwürfe erläutern den antiken Sklavereikontext von Kolosser 3,22–24 und die Ruheverheißung in Hebräer 4,9–11. Sie ändern keinen Originalsatz und werden sichtbar separat bezeichnet. Ein gespeicherter Gedanke bewahrt sowohl die ursprüngliche Frage als auch die tatsächlich angezeigte zusätzliche Einordnung. Ein Thema erhält keine bloß passende alte Pilotfrage und kein erfundenes Gebet.

Der Reader bindet einen geführten Schritt nur an dessen exakte Buch-/Kapitel-/Versgrenzen. Ein fremder oder veränderter Link darf keine unpassende Themenauslegung oder Bestätigung für einen anderen Schritt erzeugen. Der Wechsel von drei zu zwei Schritten erstellt eine neue lokale Ansicht; ein alter ausgewählter Index bleibt nicht am neuen Thema hängen.

## Gedanken und bestehende Daten

Reflexionen verwenden den vorhandenen Capture-Editor: automatische lokale Entwürfe, Wiederaufnahme über die Sammlung, Neustart, ausdrückliches Speichern, Bearbeiten und bestehender Konfliktschutz. Titel enthalten Thema und Bibelstelle. Verschiedene Themen zur gleichen Bibelstelle behalten eigene Entwurfsschlüssel, Frage und Kontext. Die neun bisherigen Quellensnapshots ändern ihre Bedeutung nicht.

AppData **V11** erweitert die zulässigen aktuellen Wege auf 27 und ihre Schritte auf insgesamt 72. Die historische Neun-Wege-/27-Schritte-Prüfung ist als unabhängige Literalliste eingefroren. V1–V10 akzeptieren dadurch nicht nachträglich neue aktive Themen oder Fortschrittsschlüssel. Die ausgelieferten V10-Notiz-/Capture-/Vorhaben-/Entwurfsverträge bleiben eigene Kopien; aktuelle Erweiterungen verändern ihre verschachtelten Graphen nicht.

V10 wird ausschließlich im Arbeitsspeicher durch `version: 11` ergänzt. Kein bestehendes Feld wird dabei umgeschrieben oder ein zusätzlicher persönlicher Fortschritt angelegt. Erst eine erfolgreiche ausdrückliche Schreibaktion speichert V11. Privates Dokumentformat 1, SQLite 3 und IndexedDB 1 bleiben bestehen. Geschichten, die separaten 1.300 NT-Fragen, Altarchive und Rückkehrsicherungen behalten ihre bisherigen Regeln.

## Abnahme und Grenzen

| Kriterium | Erforderlicher Nachweis |
|---|---|
| Alle 18/45 Originaltexte und Referenzen erhalten | Reproduzierbarer Import, Quellvergleich, vollständige Domänentests |
| Neun Wege und 18 Themen getrennt, leerzeichentolerante Suche | Chromium und Registrytests |
| Exakte Readerbindung, zwei/drei Schritte, freiwilliger Abschluss | Domänentests und tatsächliche Browserbedienung |
| Originalkontext und eigene Hinweise bleiben im Gedankensnapshot | Domänen- und Browserfall mit Entwurf, Neustart, Sammlung und Bearbeiten |
| Gleiche Bibelstelle in unterschiedlichen Themen bleibt getrennt | Eigene Quellen-/Entwurfsschlüssel und Browserwechsel |
| Reines Entdecken verändert keine Daten | Roher IndexedDB-Vergleich |
| Offline-Erstaufruf und Wiederaufnahme | Installierter Worker, Netzwerk aus, neuer Themenaufruf und Neustart |
| Bestandsdaten beim Update unverändert | Echter 0.14→Kandidat-Workerwechsel im persistenten lokalen Chromiumprofil |
| Bestehende Funktionen bleiben intakt | Ein einzelner vollständiger Browser-Regressionslauf und vollständige Fachtests |
| Web und native Paketquellen stimmen | Getrennte JS-/Assetexports, statischer Katalogvergleich; keine Gerätebehauptung |

Prüfungen laufen zunächst unter `evidence/life-topics-preparation/`. Einzelne vorbereitende Erfolge sind keine behauptete Gesamtabnahme. Native Geräte, Simulatoren, VoiceOver/TalkBack, Energie-/Speichermessungen und unabhängige Inhaltsfreigaben bleiben gesondert offen. Die gesamte Master-Definition-of-Done ist nicht abgeschlossen. Weitere Ast-/Historienparität, Bildausbau sowie Cloud-, KI- und Audioarbeit werden fortgeführt, ohne zukünftige Versionsnummern oder Termine zu versprechen.

## Tatsächlicher Liefernachweis

321/321Fachtests und ein einzelner144/144Browserlauf, siebenInhaltsprüfungen, Typecheck und Audit ohneFunde bestanden. Echter0.14→0.15-Workerwechsel mit vier vor ausdrücklicher Aktion bytegleichenV10-Rohrecords, bewahrten Altbereichen und reinemV11-Restorepreview erfolgreich. Native JS-/Assetexports samt vollständiger Themen-/Geschichten-/NT-Katalogvergleiche erfolgreich; keineGeräte-/Simulatorprüfung. PrivateHTTP-/Paketprüfung:37Routen,111App-Dateien(110Hashes plusHTML-Marker),42Review-Dateien, Eigentümerpolitik exakt unverändert, anonym401. Maßgeblich `evidence/life-topics-integration/validation-summary.json`.
