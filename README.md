# FaithPath V4

**FaithPath – deine persönliche Glaubensgeschichte.**

FaithPath ist eine offline-first PWA. Der Kern ist nicht das Sammeln von Punkten, sondern der Kreislauf: Situation/Bibel → verstehen → reflektieren → persönlicher Weg → kleiner Schritt → späterer Rückblick → selbst dokumentierte Entwicklung.

## Deployment auf Netlify
Der Ordner ist bereits der Publish-Root. `index.html`, `_redirects`, `_headers`, `netlify.toml`, Manifest und Service Worker liegen auf Root-Ebene. Für Drag-and-drop den Inhalt dieses Builds bzw. die bereitgestellte flache ZIP verwenden. Es gibt keinen Build-Schritt.

## Datenschutz und Speicherung
Persönliche Daten liegen in LocalStorage. Bestehender Hauptschlüssel `faithpath.v1.rebuild` bleibt erhalten; Guided-Plan-Fortschritt bleibt unter `faithpath.guidedPlans.v1`. V4 ergänzt innerhalb des Hauptobjekts `reminderSnoozes` und `dismissedGaps`, ohne alte Daten zu löschen. Build E normalisiert das Hauptschema auf Version 4 und validiert Backups tief, bevor sie lokale Daten ersetzen. Onboarding verwendet `faithpath.onboarding.v4`.

## Bibel
OTB Deutsch und Luther 1912 sind vollständig lokal enthalten. V4 normalisiert ältere Kurz-Codes (z. B. `joh` → `JHN`, `mar` → `MRK`, `jak` → `JAS`) bevor Dateien geladen werden.

## Build
`FP4-20260916-E` · Service Worker Cache `faithpath-v4-fp4-20260916-e`.
