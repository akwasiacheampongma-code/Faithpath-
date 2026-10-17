# Phase 6B · noch nicht freigegeben

## Technische Entscheidung

FaithPath bleibt Vanilla-JavaScript-PWA. Die Studie benötigt keinen neuen Compiler und keine Laufzeitabhängigkeit. Das isolierte `model.js` demonstriert Abläufe, ist **kein Ersatz für die bestehenden App-Datenmodelle, Migrationen, Transaktionen oder Entwurfsspeicherung**. Sein synthetisches Backupformat darf keinesfalls als neues FaithPath-Importformat integriert werden.

Abhängigkeiten der Studie: lokale Inhaltsprojektion → reines Modell → UI-Helfer → getrennte Bereichsrenderer → kleiner Controller. Die Galerie hat einen eigenen Controller und liest keine App-Daten. Im Produktionscode sollen bestehende Datenadapter dieselben Darstellungsbausteine speisen. Keine zweite Quelle persönlicher Wahrheit, keine parallelen Fortschrittsschlüssel.

## Arbeitspakete nach ausdrücklicher Freigabe

| Paket | Änderung | Aufwand* | Abnahme |
|---|---|---:|---|
| 0 | Designentscheidung und 5–8 moderierte Aufgaben, Zielgeräte erfassen | 2–3 Tage | Reader, Versauswahl, Schreiben und Rückkehr werden verstanden |
| 1 | Semantische Tokens, lokale Fonts, Icons und vier Themes in eigene CSS-Schicht | 2–3 | Keine Daten-/Routeränderung; kontrastgeprüfte Referenzbilder |
| 2 | App-Shell und Heute, alle bisherigen Ziele erhalten | 2–3 | Vier Hauptziele; Deep Links/Back/Menu vollständig, UIUX1–5 grün |
| 3 | Readerdarstellung und kontextuelle Versaktionen mit bestehenden Readerdiensten | 4–6 | Beide vollständigen Übersetzungen; IDs, Markierungen, Notizen, echte Erkunden-Regeln unverändert; Kurzkapitel-Regressionsfall |
| 4 | Journal, Editor, Wegdetail und historischer Rückblick auf bestehenden Speichertransaktionen | 4–6 | Keine neuen Migrationen; Absturz-/Entwurfs-/Edit-/Delete-/Undo-/Archiv-/Historienfixtures |
| 5 | Geschichten, Quiz, Entdecken, Sammlung, Themen und geführte Wege | 3–4 | Alle Originalfragen/-IDs erreichbar, keine geänderten Antworten/Fortschrittsschlüssel |
| 6 | Baum-/Schwertdarstellung mit ursprünglicher Regellogik | 2–3 | Exakt sieben bestehende Stufen, echte Zweigzuordnungen, keine Zählung beim Öffnen, kein Zuwachs durch Schrittabschluss |
| 7 | Mehr, Erinnerungen, echte Backup-/Restoreoberfläche | 2–3 | Originalschema/Transaktionen, Dateigrößen-/Fehler-/Raceprüfungen, keine doppelten Bestände |
| 8 | Gemeinsame Regression, reale PWA-Updates und physisches Geräte-Gate | 4–6 | Vollständige Inhalte, Offline-Neustart, Alt→Neu auf gleicher isolierter Origin, iPhone Safari/PWA/VoiceOver bestanden |

*Eine erfahrene Vollzeitperson: **25–37 Engineering-/QA-Tage**, zusätzlich moderierte Designprüfung2–3 Tage; realistisch etwa6–8 Kalenderwochen mit Gerätefeedback. Keine Zusage auf Basis eines bereits integrierten Designs. Gerätebeschaffung und externe Nutzertermine können verlängern. Frühere6A-Schätzungen nur für schöne Übersichten decken diese Tiefe nicht ab.

## Sichere Branch- und Konfliktstrategie

Erst nach Freigabe einen neuen Integrationsbranch vom dann verifizierten UIUX4+5-Nachfolger anlegen. `main` nicht direkt ändern. Kleine Commits pro Paket, auf jeder Stufe wieder lauffähige App. Diese Prototypdateien nicht pauschal über `src/` kopieren und keine alten Featurebranches komplett mergen.

| App-Bereich | Konfliktrisiko | Erhaltener Vertrag |
|---|---|---|
| `src/app.js` / Navigation | Hoch: Eventzustand, Deep Links, Fokus, Dialogbesitzer | Alte Routen und Browser-Back, Phase4-Suche/Onboarding |
| Reader / Biblejourney | Hoch: Scroll-/Erkunden-Erkennung, Verse, Entwürfe | Vorhandene Kapitelereignisse und zwei Übersetzungen |
| Journal / Rückblicke / Wege | Hoch: Original-/Snapshotbindung, Änderungen, Löschung | Historische Wahrheit, genau eine Wegzuordnung, Drafttransaktionen |
| Backup / Service Worker | Hoch: asynchrone Datei, Frischeprüfung, Updatecache | Altes Schema, Restorelocks, Offlineversionierung |
| Themes / globale CSS | Mittel: Altkomponenten-/Kontrastregression | Vier Themes und große Schrift; schrittweise Bereichsmigration |
| Originaldaten / Bibeln / Fragen | Keine beabsichtigte Änderung | Byte-/ID-/Inhaltshashes müssen gleich bleiben |

## Bekannter Altfehler, ausdrücklich nicht hier behoben

`reports/uiux45/CODE_REVIEW.md`, P3: Eine verspätete Dateivorschau kann nach Wegnavigation und Rückkehr zur gleichen Hashroute erscheinen. Kein nachgewiesenes Überschreiben oder Umgehen der vorhandenen zwei Bestätigungen. App-Code bleibt hier unverändert. Später zuerst tatsächlichen Browser-RED mit verzögertem `File.text()` und Hin-/Rücknavigation schreiben, dann jede Navigation zur Invalidierung der Requestgeneration nutzen. Die neue isolierte Studie hat ihren eigenen entsprechenden Schutz; das behebt den Altfehler nicht.

## Freigaberegel

Designreview ist GO. Phase6B und Produktionsfreigabe sind bis zur ausdrücklichen Auswahl NO-GO. Nach6B zusätzlich Inhalte-/Daten-/Update-/Geräte-Gate. Offene echte Geräteabnahmen der Phasen1–5 werden nicht durch neue Chromium-Screenshots ersetzt.
