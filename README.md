# FaithPath V4

**FaithPath – deine persönliche Glaubensgeschichte.**

FaithPath ist eine offline-first PWA. Der Kern ist nicht das Sammeln von Punkten, sondern der Kreislauf: Situation/Bibel → verstehen → reflektieren → persönlicher Weg → kleiner Schritt → späterer Rückblick → selbst dokumentierte Entwicklung.

## Deployment auf Netlify
Der Quellstand benötigt Node >=20. `npm run build` erzeugt den vollständigen,
versionierten Publish-Ordner `dist`; genau diesen Ordner verwendet `netlify.toml`.
Alte eingecheckte Root-/dist-Artefakte sind kein verlässlicher aktueller Build.
Keine Produktionsveröffentlichung erfolgt automatisch durch diese Anleitung.

```sh
npm ci
python3 -m pip install -r requirements-nt-import.txt
npm test
npm run build
node scripts/serve.mjs dist
```

## Datenschutz und Speicherung
Persönliche Daten liegen lokal und unverschlüsselt in LocalStorage. Der Hauptschlüssel
`faithpath.v1.rebuild`, das bestehende Schema V5 und das Backupformat bleiben erhalten.
Der ältere Schlüssel `faithpath.guidedPlans.v1` bleibt für die Migration lesbar;
aktueller Planfortschritt gehört zum Hauptbestand. Onboarding verwendet
`faithpath.onboarding.v4`. Es gibt keine automatische Gerätesynchronisation.
Regelmäßige externe Backups schützen vor Geräteverlust und Browserdatenlöschung.

## Bibel
OTB Deutsch und Luther 1912 sind vollständig lokal enthalten. V4 normalisiert ältere Kurz-Codes (z. B. `joh` → `JHN`, `mar` → `MRK`, `jak` → `JAS`) bevor Dateien geladen werden.

## Produktionssicherung und Entwicklung

- Gesicherte Produktion: `FP4-20261006-G-POLISH1`, Branch `backup/production-polish1-20261015`.
- Stabilisierungskandidat: `FP4-20261015-G-STABLE1`, Branch `fix/production-stabilization-20261015`.
- [Rekonstruktion und exakte Reproduktion](docs/PRODUCTION_RECOVERY.md)
- [Architektur, Datenregeln und Testabläufe](docs/MAINTENANCE.md)

Der Integrationskandidat `FP4-20261016-G-STABLE1-NTFINAL1` auf
`integration/quiz-final-on-stable1` übernimmt die 1.300 freigegebenen NT-Fragen
aus `content/nt-quiz-final-1300` feldgetreu auf STABLE1. Eine finale AT-Kapitelquelle
ist nicht nachgewiesen; dieser Import bleibt zurückgestellt.
Siehe [Integrationsbericht](docs/QUIZ_FINAL_STABLE1_REPORT_2026-10-16.md).

Python mit `openpyxl==3.1.5` wird ausschließlich für den lokalen Excel-Import und
die Importtests benötigt. Der Build einschließlich Master-Integritätsprüfung
läuft weiterhin allein mit Node. `npm run validate:nt-quiz` prüft die erneute
Ableitung aus dem unveränderten Excel-Master; Netlify wird dadurch nicht aufgerufen.
