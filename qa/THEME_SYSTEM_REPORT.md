# FaithPath — Final Experience

Ausgangsbuild: **FP4-20261005-G-CHAPTER1**. Zu Beginn live und gegen `develop/v4` geprüft.
Ausgangs-HEAD: `f02106e9a15877ec8acb92f444bf62fcbc51c36e`.
Neuer Build: **FP4-20261005-G-EXPERIENCE1**.
Branch: `feature/final-experience-v1` (isolierter Worktree vom verifizierten HEAD).
Production bleibt https://zesty-rolypoly-d11fff.netlify.app — dort wurde dieser Kandidat **nicht** veröffentlicht. Kein main-/develop-Merge, kein Release-Tag.

## Ein Produkt, vier Darstellungen

`<html data-theme="light|atmospheric|paper|night">`. Default/fallback: **Hell**. Keine Kopie von App, Storage-Namespace, Datenmodell, Routes, Content oder Manifest.

Semantische `--fp-*`-Tokens definieren Background, Surface/Muted/Elevated, Text/Muted, Primary/Soft/Border/On-Primary, Accent, Focus, Border/Input-Border, Danger/Success/Warning, Shadow/Overlay/Navigation und Reader-Farben. Bestehende Komponenten-Tokens werden darauf abgebildet. Neue Themen benötigen ein Token-Palette-Set und einen Eintrag im kleinen Theme-Katalog; keine zweite Komponentenarchitektur.

| Theme | Richtung |
|---|---|
| Hell | Exakte vorhandene Premium-Palette; Today ohne Layoutänderung |
| Atmosphärisch | #101b19 Wald, #ede8dd Creme, #e4bc80 ruhiges Gold, dunkler Reader |
| Papier | Warmes #f4edde, inkartige Texte, Oliv, zurückhaltendes Gold |
| Nacht | #1b1c1d neutrales Charcoal, warme helle Texte, gedämpfte Akzente |

Fünf vorhandene Highlightfarben unverändert. Auf hellen Highlights in dunklen Themes wird bewusst dunkle Schrift verwendet. Preview-Muster und bestehender cremefarbener Marken-Icon-Hintergrund sind absichtlich hell; keine versehentlichen weißen Formular-/Dialogflächen. Browser-native Controls nutzen passendes color-scheme. System-Sans-/Serif-Font-Stacks bleiben; keine Remote-Fonts oder neuen Lizenzrisiken.

## Auswahl und Persistenz

Mehr → Einstellungen → Darstellung. Vier Preview-Tiles als Radiogroup, aria-checked, Check/„Ausgewählt“, roving tabindex. Pfeiltasten/Home/End wechseln live, Fokus bleibt beim gewählten Theme. Keine neue Primary-Navigation.

`settings.theme` ist eine rückwärtskompatible optionale Eigenschaft des vorhandenen v5-Settings-Objekts. Bestehende Migration/Backup erhalten sie; keine neue Storage-ID oder Schema-Version. Früh im vorhandenen App-Bootstrap und nach jedem Render wird die gespeicherte Präferenz angewendet. theme-color-Metadatum folgt dem Hintergrund; PWA-Identität bleibt unverändert.

Themawechsel schreibt ausschließlich diese Option. Byte-/Semantik-Vergleiche aller anderen persönlichen Store-Felder: PASS. Bei verweigertem Speichern bleiben Theme und Daten unverändert; reale Fehlermeldung statt falscher Erfolgsmeldung.

## Coverage und Grenzen

Alle vier Themes wurden über 31 Kernrouten auf 390/100 und 320/100 sowie 15 Kernrouten auf 320/200, 390/200, 768 und 1440 geprüft. Dazu Reader-Ende, Auswahl, Palette, Notiz-, Journal-, Lösch- und Wegdialog, Drawer und Onboarding. 128 Gruppen je Theme inkl. axe/WCAG-A/AA-Tags und horizontaler Geometrie: PASS. Zusätzliche Branch-/Safe-Area-/Picker-Screens und echte lokale SW-Offline-/Update-Tests bestanden.

512 UI-Gruppen sind kein Ersatz für subjektive oder reale Device-Prüfung. EXPERT_VISUAL_REVIEW zeigt kohärente helle/papierfarbene und dunkle Flächen, ruhigen Reader und gut trennbare Branch-Ziele. Die Viewport-Screens bei 200 % haben bewusst scrollbare Dialoge; nicht jeder Formularinhalt muss gleichzeitig in einen kleinen Bildschirm passen.

Light/Today ist auf drei Vergleichszuständen exakt PNG-byte-identisch zum tatsächlichen CHAPTER1-Artefakt. Keine Behauptung, dass neue Settings-/Journey-/Branch-Seiten pixelidentisch sein müssen: diese enthalten die angefragten neuen UI-Bereiche.

Beim CHAPTER1-Upgrade wurde je Theme eine zulässige optionale Präferenz im alten Store gesät (die alte App hatte noch keinen Picker). Store und Entwurf bleiben byte-identisch, der neue Build wendet die erhaltene Option an. Neue Build-Switches/Reload/Offline testen anschließend die reale neue Auswahl. Ein Betriebssystem-Neustart bleibt Device-Gate.

## Ressourcen

+25,323 Bytes JS/CSS roh, +7,949 Bytes gzip, vier kleine zusätzliche JS-Module. Keine neuen Bitmap-/Font-Dateien oder externen Abhängigkeiten. Der bestehende SW nimmt sie über die vorhandene generierte Assetliste auf, ohne neue Cache-/Update-Architektur.

## Grenzen und nächstes Gate

Die Tests verwenden Desktop-Chromium, emulierte Viewports und 200 % Root-Schrift, keine physischen Mobilgeräte. Safe Areas 47/34 px sind CSS-Simulationen. Echtes iPhone/Safari, VoiceOver, iOS-Tastatur, Dynamic Island und OS-Level-PWA-Neustart sind noch nicht real geprüft. Ein erneuter Browserkontext und Reload prüfen Persistenz, nicht einen echten Betriebssystem-Neustart.

„Erkundet“ belegt das erreichte, unverdeckte Kapitelende. Es belegt weder Aufmerksamkeit noch Verständnis. Historische Kapitelöffnungen werden nicht rückwirkend zu gelesenen Kapiteln erklärt. Lokal gespeicherte Daten bleiben den Grenzen von Browser-/Gerätespeicher unterworfen; ein Theme schafft keine Synchronisation oder zusätzliche Sicherung.

Das alte Atmospheric-Paket/PDF war im verfügbaren Bestand nicht vorhanden. Das Theme verwendet die vorgegebene Wald-/Creme-/Gold-Richtung, keine erfundenen alten Binärassets. Vorhandene Systemfont-Stacks und Originalbilder bleiben bestehen.

Die technische Integration ändert keinen redaktionellen/theologischen Freigabestatus. Bestehende Content-Validation-Warnungen zu alten Ganzkapitel-Sentinels bleiben unverändert; sie sind kein neuer Feature-Regressionsfund.

Empfehlung: bereit für das abschließende reale Device-Gate. Keine weiteren großen Produkt-/Designsysteme; jetzt reale Nutzer beobachten und Wiederaufnahme/Retention validieren.
