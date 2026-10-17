# Finale gemeinsame Regression · UIUX1–6B

Anwendungscode `f89eccf923ae186ad132b779a99b829e0cf9e155`, Buildhash `911c3f4a66eccc6d07f1e2f34f35256fd09f228b606af77f522ac5973e7a5852`. Alle 41 Programme wurden gegen diese eingefrorene Ausgabe ausgeführt, nicht aus alten Berichten übernommen.

| Programm | Bestehendes Skript | Ausgang | Laufzeit | Nachweis |
|---|---|---|---|---|
| core | tests/browser.mjs | PASS | 147.0s | evidence/core-exit.json und .log |
| stabilization | tests/stabilization-browser.mjs | PASS | 64.1s | evidence/stabilization-exit.json und .log |
| chapter | tests/chapter-questions-browser.mjs | PASS | 234.5s | evidence/chapter-exit.json und .log |
| nt | tests/nt-quiz-browser.mjs | PASS | 488.0s | evidence/nt-exit.json und .log |
| nachlese | tests/nachlese-mc-corpus-browser.mjs | PASS | 173.3s | evidence/nachlese-exit.json und .log |
| mc-fixtures | tests/nachlese-mc-browser.mjs | PASS | 28.3s | evidence/mc-fixtures-exit.json und .log |
| worker | tests/service-worker.mjs | PASS | 44.6s | evidence/worker-exit.json und .log |
| today | tests/today-phase1-browser.mjs | PASS | 757.9s | evidence/today-exit.json und .log |
| today-zoom | tests/today-phase1-zoom.mjs | PASS | 12.4s | evidence/today-zoom-exit.json und .log |
| phase2 | tests/phase2-browser.mjs | PASS | 291.7s | evidence/phase2-exit.json und .log |
| phase2-stress | tests/phase2-stress.mjs | PASS | 67.5s | evidence/phase2-stress-exit.json und .log |
| phase2-short | tests/phase2-short-chapter-browser.mjs | PASS | 73.0s | evidence/phase2-short-exit.json und .log |
| experience | tests/final-experience-browser.mjs | PASS | 106.8s | evidence/experience-exit.json und .log |
| core-depth | tests/core-depth-browser.mjs | PASS | 166.4s | evidence/core-depth-exit.json und .log |
| core-axe | tests/core-depth-accessibility.mjs | PASS | 24.7s | evidence/core-axe-exit.json und .log |
| continuity | tests/continuity-browser.mjs | PASS | 136.5s | evidence/continuity-exit.json und .log |
| branches | tests/tree-branch-visual-browser.mjs | PASS | 786.7s | evidence/branches-exit.json und .log |
| overview | tests/phase3-overview-browser.mjs | PASS | 299.1s | evidence/overview-exit.json und .log |
| detail | tests/phase3-detail-browser.mjs | PASS | 220.6s | evidence/detail-exit.json und .log |
| tree | tests/phase3-tree-browser.mjs | PASS | 412.0s | evidence/tree-exit.json und .log |
| reviews-original | tests/phase3-review-browser.mjs | PASS | 616.3s | evidence/reviews-original-exit.json und .log |
| phase3-stress | tests/phase3-stress.mjs | PASS | 193.3s | evidence/phase3-stress-exit.json und .log |
| journey | tests/phase3-journey-browser.mjs | PASS | 60.3s | evidence/journey-exit.json und .log |
| short-navigation | tests/phase3-short-navigation.mjs | PASS | 433.2s | evidence/short-navigation-exit.json und .log |
| premium-journal | tests/premium-journal-browser.mjs | PASS | 139.7s | evidence/premium-journal-exit.json und .log |
| final-notes | tests/final-note-browser.mjs | PASS | 76.8s | evidence/final-notes-exit.json und .log |
| product | tests/final-product-browser.mjs | PASS | 253.6s | evidence/product-exit.json und .log |
| navigation | tests/phase4-navigation-browser.mjs | PASS | 409.9s | evidence/navigation-exit.json und .log |
| discover | tests/phase4-discover-browser.mjs | PASS | 345.4s | evidence/discover-exit.json und .log |
| onboarding | tests/phase4-onboarding-browser.mjs | PASS | 825.5s | evidence/onboarding-exit.json und .log |
| routes | tests/phase4-routes-browser.mjs | PASS | 329.2s | evidence/routes-exit.json und .log |
| menu-focus | tests/phase4-menu-focus-browser.mjs | PASS | 45.2s | evidence/menu-focus-exit.json und .log |
| phase4-stress | tests/phase4-stress-browser.mjs | PASS | 174.7s | evidence/phase4-stress-exit.json und .log |
| journal | tests/phase5-journal-browser.mjs | PASS | 433.4s | evidence/journal-exit.json und .log |
| reviews | tests/phase5-reviews-browser.mjs | PASS | 350.2s | evidence/reviews-exit.json und .log |
| reminders | tests/phase5-reminders-browser.mjs | PASS | 75.7s | evidence/reminders-exit.json und .log |
| backup | tests/phase5-backup-browser.mjs | PASS | 172.2s | evidence/backup-exit.json und .log |
| backup-races | tests/phase5-backup-races-browser.mjs | PASS | 25.1s | evidence/backup-races-exit.json und .log |
| backup-dialogs | tests/phase5-backup-dialogs-browser.mjs | PASS | 82.4s | evidence/backup-dialogs-exit.json und .log |
| phase5-stress | tests/phase5-stress-browser.mjs | PASS | 60.2s | evidence/phase5-stress-exit.json und .log |
| integration | tests/uiux45-integration-browser.mjs | PASS | 50.7s | evidence/integration-exit.json und .log |

Zusätzlich: 191 Unit-Tests, beide unveränderten Inhaltsvalidatoren,236 uninstrumentierte Theme-/Viewport-/Schriftfälle, 84 echte Neben-/Baum-/Schwertzustände,432 neue PNGs, 28 Kontrastgruppen/144 Einzelmessungen, Backup- und Fokus-RED/GREEN, 175 unveränderte geschützte Dateien, frisches Git-Archiv mit bytegleichem 366-Dateien-Build, zwei identische Deploy-ZIPs und vollständiger Bytevergleich beim Entpacken.

Das lokale HTTPS-Update prüft bewusstes Warten/Aktivieren, unveränderte Main-/Draft-/Migrationsbytes, alle 260 vorhandenen Kapitel-Fortschrittsschlüssel plus Storyzustand, beide Übersetzungen einschließlich Segmentierungsunterschied, alle 2314 Nachlese-/1300 NT-Fragen und Offline-Nutzung mit neuen Fonts. Es verwendet ein selbst signiertes Loopback-Zertifikat und ein frisches Chromiumprofil. Keine echte iPhone-PWA wurde bedient.

Alte Tests wurden bei reinen Präsentationsverträgen nachgeführt: Überschriften, kompakte Baumklasse, fortlaufender Verssatz und SVG-Aufbau. Geschäfts-/ID-/Daten-/Transaktionsassertionen bleiben bestehen. Ausschließlich Axe-Auditkontexte erlauben dessen eigene Diagnosestyles; die tatsächliche Produktions-CSP bleibt in der uninstrumentierten Matrix aktiv.

**OFFEN:** physisches iPhone Safari, installierte PWA, echte Bildschirmtastatur/Hardwaretastatur/VoiceOver und native iOS-Picker. Auch die früheren Gerätegates werden nicht nachträglich als bestanden erklärt. Keine Aussage einer WCAG-Zertifizierung, moderierten Nutzerstudie oder Produktionsfreigabe.

Die Programme wurden in getrennten Gruppen (27 und14) mit eigenen Ausgaben und frischen Browserprofilen ausgeführt. Ausschließlich abgeschlossene Ergebnisse desselben unveränderten Kandidaten wurden zusammengeführt; überflüssige doppelte Folgeprogramme wurden nicht gezählt. `evidence/regression-scheduling.json` bindet die Auswahl. Der erste Langtext-Notiztimeout und die erfolgreiche unveränderte Wiederholung stehen in `TIMING_UND_WIEDERHOLUNG.md`. Zusätzlich besteht der ursprüngliche redaktionelle Nachlese-Browsertreiber; sein Rohresultat ist beigefügt. Das vollständige Testdateiinventar grenzt historische, nicht direkt wiederholte Treiber ausdrücklich ab.
