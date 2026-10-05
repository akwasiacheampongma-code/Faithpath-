# Chapter Questions Integration – Änderungsbericht

Ausgangsbuild: FP4-20261004-G-PRODUCT1

Neuer Build: FP4-20261005-G-CHAPTER1

Production: https://zesty-rolypoly-d11fff.netlify.app

Rollback: Netlify Deploy 6ac238b2dbc4b5927e3161ca (hashgeprüftes PRODUCT1).

Lokales Gate: PASS (206 Browser-/Update-Testgruppen plus Unit- und Contentvalidierung).

Live-Gate: PASS. Anzahl Live-Testgruppen: 190.

## Single Source of Truth

1300 Originalfragen FP-0261 bis FP-1560; 260 Einheiten, genau fünf Fragen pro Einheit; 27 NT-Bücher. Der neue Katalog hält Referenzen auf die vorhandenen Unit-Objekte, kopiert keine Fragen. Jede Buch-/Kapitelkombination genau einmal. Keine leeren oder erfundenen Quizangebote.

Der Storybestand bleibt unverändert: 436 Stories, 2314 Nachlese-Fragen, 260 FaithPath-Storyfragen, 2574 Source IDs, 2479 Flow Items, 0 unmapped. Chapter Quiz bleibt separat. Contenthash unverändert: 812f002add339a256d807530d3509297678e41f9e27e381938e50036234c36b9.

Chapter Quiz Editorial Status: VERIFIED gemäß bestehender PRODUCT1-Dokumentation und ihrem dort belegten Freigabekatalog. Die Integration ist keine neue redaktionelle/theologische Prüfung.

## Reader / Sammlung / Status

Nach letztem Vers: feiner Divider, Kapitelabschluss, fünf Fragen, Fragen starten und Später. Kein Overlay, keine Pflichtaufgabe, keine Änderung des Textes. Bestehende nächste Kapitelnavigation bleibt.

Entdecken → Kapitelübungen → Buch → Kapitel. Nur Bücher und Kapitel mit vorhandenen Daten. Ruhige Listen und Divider im bestehenden Designsystem, keine Hauptnavigation geändert.

Gemeinsame kanonische Unit-ID und bestehendes quiz[id].done. Status synchron über Reader/Sammlung, Reload, Offline und Backup Export/Import. Vorhandene Metadaten bleiben erhalten. Kein neues Fortschrittsmodell.

Die Return-Route ist UI-Metadatum im Link, kein neuer Nutzerdatensatz. Reader-Origin erhält Kapitel, Übersetzung, Versbereich und Kontext. Sammlung führt zurück zur Buchliste. Direkte quiz/<id> und alte story/<id> funktionieren. Nach fünf Fragen: ruhiger Abschluss ohne Score; Rückkehr zum Kapitel, nächstes Kapitel (falls vorhanden), Sammlung. Bestehende persönliche Reflexion bleibt erreichbar.

## Schutz / Regression

Datenmodell geändert: NEIN. Migration: NEIN. Content geändert: NEIN. Backupformat geändert: NEIN. Service-Worker-Logik geändert: NEIN.

Geschützte Quelldateien, Bibeldaten, Storydaten, Baumassets und App Icon unverändert; maschineller Bytevergleich im QA-Paket. Reader-Markierungen, Notizen, Wege, Journal Delete, Continuity und Menü durch bestehende Regressionen geprüft.

Echter lokaler Updatepfad PRODUCT1 → CHAPTER1 mit Service Worker, ausdrücklicher Aktivierung und bytegleichem persönlichen Speicher plus Entwurf. Vorhandene Quizstände nach Update und Offline-Reload sichtbar. Unvollständiges Update wird durch vorhandene SW-Tests zurückgewiesen.

320×568, 390×844, 768×1024, 1440×1000 sowie 320/390 bei 200% Root Text: PASS. Tastaturablauf von letztem Vers bis Quizabschluss, 44px Reader-Aktionen, Reduced Motion und axe: PASS. Safe Areas durch vorhandene Simulation geprüft.

Console / Load / Page Errors: 0 / 0 / 0 in den bestandenen Gate-Läufen.

## Bekannte Grenzen

Chromium und simulierte Textvergrößerung/Safe Areas. Kein echtes iPhone, Safari, VoiceOver, iOS-Bildschirmtastatur oder Dynamic Island geprüft. Offline setzt vollständige Installation/Vorbereitung voraus. Keine Änderungen außerhalb des beauftragten Integrationsumfangs. Keine unabhängige Review-Agent-Abnahme behauptet.

## Geänderte Dateien

- src/app.js
- src/chapter-questions.js
- src/version.js
- styles.css
- tests/chapter-questions.test.mjs
- tests/chapter-questions-browser.mjs
- tests/chapter-questions-update.mjs
- tests/chapter-questions-downloads-browser.mjs
- docs/superpowers/plans/2026-10-05-chapter-questions-integration.md
- qa/chapter-questions-integration-error-report.md
- qa/chapter-questions-integration-change-report.md
- qa/CHAPTER_QUESTIONS_RELEASE_CANDIDATE.md

Final: CHAPTER_QUESTIONS_INTEGRATION_PASS.
