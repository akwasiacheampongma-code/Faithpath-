# Chapter Questions Integration – Fehlerbericht

Ausgangsbuild: FP4-20261004-G-PRODUCT1. Neuer Build: FP4-20261005-G-CHAPTER1.

Lokales Gate: PASS. Live-Gate: PASS. Final: CHAPTER_QUESTIONS_INTEGRATION_PASS.

Keine offenen P0/P1/P2 im geprüften Integrationsbereich. Die drei folgenden Lücken wurden am unveränderten veröffentlichten PRODUCT1-Artefakt reproduziert. Sie sind Gegenstand dieses Integrationsauftrags, keine Änderung der Fragen.

## CQ-01

Priorität: P1 (beauftragte Integrationslücke)

Bereich: Reader

Reproduktion: Johannes 3 bis zum letzten Vers lesen: kein direkter Einstieg in seine fünf vorhandenen Fragen.

Ursache: Reader rendert keinen Abschluss aus dem vorhandenen Kapitelquiz-Katalog.

Fix: Originaleinheit über Buch und einsbasiertes Kapitel indizieren; Abschnitt ausschließlich nach dem letzten Vers. Keine CTA in 1. Mose 1 ohne Daten.

Lokaler Nachweis: PASS – Selector, Browser, Tastatur, axe, Responsive und Offline. Baseline-RED und Kandidat-GREEN als JSON im QA-Paket.

Live-Nachweis: PASS.

Status: VERIFIZIERT

## CQ-02

Priorität: P1 (beauftragte Integrationslücke)

Bereich: Sammlung

Reproduktion: Kompakte Buch-/Kapitelsammlung über Entdecken suchen: nicht vorhanden.

Ursache: Vorhandene Kapitelübungen werden als einzelne Einheiten präsentiert.

Fix: Ein Buchindex mit 27 Büchern und 260 ruhigen Kapitelzeilen. Beide Einstiege öffnen denselben quiz/<unit-id>.

Lokaler Nachweis: PASS – Selector, Browser, Tastatur, axe, Responsive und Offline. Baseline-RED und Kandidat-GREEN als JSON im QA-Paket.

Live-Nachweis: PASS.

Status: VERIFIZIERT

## CQ-03

Priorität: P1 (beauftragte Integrationslücke)

Bereich: Abschluss / Rücksprung

Reproduktion: Fünf Fragen zu Johannes 3 beantworten: Rückkehr zur alten Storyansicht statt zum Reader-Kapitel.

Ursache: Fragenflow kennt die Reader-/Sammlungsherkunft noch nicht.

Fix: Geprüfte UI-Return-Route, korrekte Übersetzung, Kapitelabschluss, nächstes Kapitel und Sammlung. Derselbe bestehende done-Status; alte Direktlinks bleiben gültig.

Lokaler Nachweis: PASS – Selector, Browser, Tastatur, axe, Responsive und Offline. Baseline-RED und Kandidat-GREEN als JSON im QA-Paket.

Live-Nachweis: PASS.

Status: VERIFIZIERT

## Testumgebung

Browserfälle mit absichtlich blockiertem Service Worker erzeugen die erwartete Offline-Vorbereitungswarnung. Nur in diesen Testkontexten wird sie vor Screenshots geschlossen. Der separate installierte Offline-Test verwendet einen aktiven Service Worker und darf keine Warnung ignorieren. Ein unabhängiger Review-Agent konnte wegen des Kontingents nicht starten; stattdessen wurde der vollständige Diff selbst geprüft.
