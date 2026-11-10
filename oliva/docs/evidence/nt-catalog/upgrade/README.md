# Reale NT-Updateprüfung

## Tatsächlicher Versuch am 09.11.2026

Der erste reale Versuch bestand mit Exitcode 0: tatsächlicher 0.11-Kontrollexport
`oliva-01c4b9f640bc0931` → tatsächlicher 0.12.0-Kandidat
`oliva-80005b3c1d2e2eef`. Rohbericht, unabhängiger Ergebnis-/Hashabgleich,
Ausführungslog und sieben echte Browserbilder liegen im Unterordner
`oliva-80005b3c1d2e2eef/`.

Alle vier rohen IndexedDB-Werte blieben beim Update, bei der V7-Hydrierung und
den ersten neuen Offlinebesuchen bis zum ausdrücklichen Antwortcommit exakt.
Der erste Commit änderte ausschließlich Nutzdatenversion, Revision und
`ntStudy`. Die drei Nicht-`main`-Werte – Originalarchiv, Rückkehrsicherung und
Rückkehrindex – blieben auch nach dem zweiten, ausdrücklichen
Legacy-Aktivierungscommit exakt. Ein gültiger historischer Abschluss wurde
belegt übernommen, ungültiges Tagesdatum und unbekannte Einheit blieben im
Originalarchiv; es entstanden keine erfundenen Antworten oder aktuellen
Abschlüsse.

Zwei alte Textentwürfe, Einladungsopt-in und Zurückstellung sowie der echte
Psalm-119-Anker Vers 120 blieben erhalten. Sieben A51-Stadien, Johannes- und
Römerillustration, fünf Storybilder und ein ausschließlich im Vorgängercache
vorhandener alter Chunk funktionierten offline. Ein echter V8-Download wurde
mit dem Datenstand und den Originalbytes verglichen und über den echten
Dateiauswahldialog als Wiederherstellungsvorschau validiert. Eine
Wiederherstellung wurde **nicht** angewendet.

Der Browser bediente Matthäus 1 und Offenbarung 22. Die vollständige Quellbank
wurde als 260 Kapitel/1.300 Fragen gelesen; keine 1.300 einzelnen
Browserinteraktionen werden behauptet. Dies ist lokale automatisierte
Chromiumprüfung, kein Sites-, Simulator- oder physischer Gerätetest.

## Historischer Vorbereitungsstand und reproduzierbarer Ablauf

`scripts/offline-upgrade-nt.mjs` ist vorbereitet. **Noch kein Browserlauf und
keine bestandene Updateabnahme** werden daraus abgeleitet. `node --check`
bestand; Kennung und Hash stehen in `preparation.json`. Das historische
`offline-upgrade-v011.mjs` bleibt bytegenau unverändert.

Dieser Absatz und `preparation.json` beschreiben ausdrücklich den Stand vor
der anschließenden Ausführung. Das tatsächliche Ergebnis steht oben und in
den separaten Ausführungsbelegen; der frühere Nachweis wurde nicht umgefärbt.

Der Kandidat wird ausschließlich aus dem tatsächlich übergebenen Webexport
gelesen: Versionskennung aus `sw.js`, Kernkennung aus `index.html`. Das Skript
verweigert einen unveränderten bzw. weiterhin als 0.11 bezeichneten
Entwicklungsbuild. Der feste Vorgänger ist der tatsächlich ausgelieferte
0.11-Kontrollexport `oliva-01c4b9f640bc0931`.

Nach Fertigstellung des tatsächlichen NT-Kandidaten ausführen:

```sh
node scripts/offline-upgrade-nt.mjs \
  /workspace/oliva-v011-reader-flow-control-dist \
  /absoluter/pfad/zum/geprueften/nt-dist
```

Das Skript verwendet einen freien eigenen Localhost-Port, eine neue dauerhafte
Chromium-Profildatei für den gesamten Versuch und einen atomar umgeschalteten
Serverpfad. Root-Tests auf Port 4173 werden nicht umgeschaltet. Es liest alle
IndexedDB-Objektspeicher und Werte unabhängig vom Appdecoder; die Prüfungen
schreiben weder künstliche Zustände noch rufen sie interne Storeaktionen auf.

Geprüfte Abläufe nach tatsächlicher Ausführung:

- Echtes 0.11-UI-Seeding: Name, V5-Originalimport samt Rückkehrsicherung,
  bestätigtes Kapitel, Einladungsopt-in mit Zurückstellen, eigener Rückblick,
  zwei gesicherte offene Textentwürfe und echter Psalm-119-Versanker 120.
- Synthetische feste Uhr `2027-01-01T12:00:00.000Z`, damit die importierte
  November-2026-Einladung nach den ursprünglichen Regeln fällig ist. Das ist
  Testzeit, kein behaupteter realer Entwicklungs- oder Gerätetermin.
- Reales Service-Worker-Update; V7 bleibt nach Hydrierung und dem ersten
  Offlinebesuch der zuvor nie geöffneten neuen NT-Routen Matthäus 1 und
  Offenbarung 22 vollständig unverändert, einschließlich aller Rohwerte.
  Die Quellbank wird als 260 Kapitel/1.300 Fragen geprüft; dieser Browserlauf
  bedient zwei Kapitel und behauptet keine 1.300 einzelnen UI-Interaktionen.
- Bloße Auswahl schreibt nichts. Erst „Antwort prüfen“ schreibt V8. Nur
  Version, Revision und `ntStudy` dürfen sich ändern; alle übrigen persönlichen
  Felder sowie Originalarchive und Rückkehrdaten bleiben exakt.
- Ausdrückliche Archivaktivierung ergänzt ausschließlich den belegten
  Originalabschluss. Das synthetische `quiz[10000].done` besitzt eine kanonische
  UTC-Zeit; Tagesdatum und unbekannte Einheit bleiben im Originalarchiv.
  Keine Antworten, aktuelle Abschlüsse, Lesestatus oder Baumaktivität werden
  aus diesem historischen Zeitstempel erfunden.
- Tatsächlicher Sicherungsdownload mit Originalbytes und Quellsnapshot,
  anschließend echte Dateiauswahl und V8-Wiederherstellungsvorschau. **Keine
  Wiederherstellung wird angewendet.** Dieser Beleg ist ausdrücklich keine
  Schreib-/Restore-Roundtripprüfung.
- Erhaltene alte Entwürfe und Versanker, sieben A51-Stadien, Johannes- und
  Römerbilder sowie fünf Storybilder beim ersten Offlinebesuch. Ein exklusiver
  Vorgängerchunk muss ausschließlich im alten Cache liegen und offline noch
  bytegenau abrufbar sein.

Standardmäßig liegt das Ergebnis in einem Unterordner mit der tatsächlichen
Kernkennung. Bereits vorhandene `offline-upgrade.json` wird nicht überschrieben.
Für einen bewusst neuen Versuch einen neuen `OLIVA_EVIDENCE_DIR` angeben;
vorherige rote oder grüne Nachweise bleiben bestehen. Fehler schreiben die
Phase, Rohwert-Hashes, Workerdiagnostik und einen echten Fehlerscreenshot.

Ein erfolgreicher späterer Lauf belegt lokale automatisierte Chromiumprüfung.
Gehostete Sites-Prüfung, Simulator, native Decoder und physische Geräte sind
andere Prüfbereiche und werden hier nicht behauptet.
