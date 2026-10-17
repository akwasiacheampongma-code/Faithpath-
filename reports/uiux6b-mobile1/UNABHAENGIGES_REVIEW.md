# Unabhängiges Mobile-Review

Ein separater Reviewer untersuchte zunächst `49ec83c..654a63f` und anschließend den finalen Appstand `637af1190912fed4b8d06c854d399b4077667514`. Keine Codeänderungen durch den Reviewer.

## Finale Prüfung

21 unabhängige, Worker-bereite Chromium-Aufnahmen über sieben Routen bei 320×568/200%,390×844/100% und1440×900/100%.

- Keine blockierenden oder wichtigen Produktbefunde.
- Einstellungen und Bibelreise: Titelwörter bleiben zusammen.
- Erste Readerzeile bei 320/200% bis421px sichtbar, Navigation beginnt bei 432px; Leseschrift 40px.
- Eigene Heute-/Journalhierarchie erhalten; mobiler Titel-Token auf Desktop nicht gesetzt.
- Kein horizontaler Seitenüberlauf oder JavaScriptfehler in diesen Prüfungen.

Rohbelege: `evidence/review-final/results.json` und `screenshots/review/final-*.png`.

## Zusätzliche erste Reviewprüfungen

Aa-Steuerung bei 320/390/1440px und200%: A+ vergrößert den Lesetext von40 auf 44px; Fokusmodus und Escape geben den Fokus korrekt zurück. Ersatzschrift mit 200% Roottext und 44px synthetischem Safe-Inset: kompletter Header, kein Seitenüberlauf. Nativer Tab-Ablauf am Kapitelende: Link 179–330px vor Navigation 432px, wie im eingefrorenen Ausgangsbuild.

Ein transienter programmatischer Fokusmesswert wurde durch diesen normalen Tastaturablauf und den Vorhervergleich verworfen. Frühe Bilder ohne `worker-`-Präfix mit künstlicher Offlinewarnung sind keine Freigabebelege.

## Testtreiberbefund

Der Reviewer fand eine falsch positionierte Playwright-Timeoutoption in der Matrix: Der zweite Parameter von `waitForFunction` ist ein Funktionsargument; Optionen gehören in den dritten Parameter. Der Test nutzte deshalb den normalen 20s-Wert statt der beabsichtigten 90s-Installationsreserve. Die Option wurde richtiggestellt. Das betrifft mögliche falsche Zeitlimitfehler, keine falsch positiven Produktprüfungen. Die bereits laufende vollständige Matrix hatte die strengere 20s-Grenze und wurde ohne Zeitlimitfehler abgeschlossen; die Assertions wurden nicht abgeschwächt.

Nicht blockierende Grenzen: Bei200% umbrechen einige Aa-Beschriftungen innerhalb des 240px-Popups wenig elegant. Eine zusätzlich künstlich auf 64px gezwungene Ersatzschrift überschreitet bei 320px die Breite; die geforderte200%-Roottextprobe mit Ersatzschrift funktioniert.

## Geräte-Grenze

Keine echte iPhone-/Safari-/VoiceOver-Prüfung und kein erfolgreicher Livehost-Abgleich. Der Reviewer führte nicht die langen vollständigen Regressionen aus; deren eigene Ergebnisse sind separat protokolliert.
