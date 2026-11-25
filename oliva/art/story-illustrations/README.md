# OLIVA · FaithPath-Bildpaket

20 neue Motive für 20 FaithPath-Originaleinheiten. Jedes Motiv liegt als 1.024 × 683 px großes Detailbild und als 256 × 304 px großer Listenausschnitt vor. Die 40 Geschichten-WebPs belegen **3.479.034 Byte**. Größtes Detailbild 177.780 Byte, größtes Listenbild 29.060 Byte. Die Wegprüfung ist in `image-audit.md` dokumentiert. Das Paket enthält keine neuen Wegbilder.

## Spätere Integration durch Codex

1. `manifest.json` gegen den dann aktuellen Story-Index abgleichen. Jede `storyId` muss genau einmal vorkommen. Titel und Referenz gegenprüfen und bei inzwischen belegten Bildzuordnungen die Integration des betroffenen Motives pausieren.
2. Die WebPs aus `stories/` anhand der relativen Manifestpfade und SHA-256-Werte prüfen und unter eindeutigen Assetpfaden übernehmen. `metadata/sha256.json` enthält die Dateiprüfsummen. Die Kontaktübersicht und die Produktionsmetadaten dienen der Abnahme und gehören nicht in den Bilder-Precache.
3. Im bestehenden Geschichten-Rendering pro Original-ID das Detailbild für die Detailseite und den zugehörigen Hochformatausschnitt für die 64 × 76 px große Liste registrieren. Für das Expo-Asset-Bundling statische Assetreferenzen verwenden. Die typografische Karte bleibt als Fallback verfügbar. Im Detail den deutschen Alt-Text, den Versfokus und die Kennzeichnung als KI-Illustration und künstlerische Interpretation übernehmen.
4. Bei der späteren Integration Bilddekodierung, Hell- und Dunkelansicht, Lesbarkeit im kleinen Ausschnitt sowie den zusätzlichen Offline-Transfer in Web und nativ überprüfen. Vor einer öffentlichen Auslieferung die offenen Freigaben in `image-credits.md` klären.

## Unterlagen

- `image-audit.md` enthält Ausgangsbestand, Wegprüfung, Auswahltabelle und Größen pro Datei.
- `manifest.json` enthält sämtliche Zuordnungen und technischen Daten.
- `contact-sheet.webp` zeigt jedes Detailbild und seine zwei Listenansichten auf den OLIVA-Hintergründen.
- `metadata/generation-records.json` enthält Referenznachweise, Prompts und Nachbearbeitung.
- `metadata/quality-report.json` enthält die durchgeführten Prüfungen und Sichtbefunde.

Private projektinterne Verwendung. Öffentliche und unabhängige Fachfreigabe stehen aus.
