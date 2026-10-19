# FaithPath – Dein erster Samen

Dieser Kandidat macht den ersten persönlichen Weg verständlich und verbindet
ihn mit einem größeren, lebendigen Olivenbaum. Er verwendet die echte FaithPath-
App und ihre bestehende lokale Speicherung. Es ist keine Design-Demo.

## Dateien

- `Bericht.pdf`: vollständiger Implementierungs- und Testbericht.
- `Vergleich.html`: lokal aufrufbare Galerie echter Browserbilder und Video.
- `IMPLEMENTIERUNG.md` und `TESTMATRIX.csv`: lesbare und tabellarische Nachweise.
- `REPRODUZIEREN.md`: exakte Quelle, Buildbefehle und Testvoraussetzungen.
- `UX_TESTPLAN.md` und `UX_Testbogen_10_Personen.xlsx`: noch leere Nutzertestbögen.
- `IPHONE_ABNAHME.md`: offene echte Geräteprüfung.
- `REVIEW.md`: unabhängige Prüfung und tatsächlich behobene Befunde.
- `DATEIAENDERUNGEN.txt`: vollständige Dateiinventur.

Das separate `FaithPath_FIRSTSEED1_Netlify_QA.zip` enthält die komplette App.
Entpacken und über einen lokalen HTTP-Server öffnen, beispielsweise:

```bash
python3 -m http.server 8080 --directory entpackter-App-Ordner
```

Dann `http://localhost:8080` aufrufen. Ein Doppelklick auf die App-`index.html`
mit `file://` ist kein geeigneter PWA-Test. Die Screenshotgalerie dagegen lässt
sich ohne Server öffnen. Nichts auf die bestehende Produktion oder QA-Site laden.

## In fünf Minuten ansehen

1. Auf einem frischen Testprofil „Gemeinsam den ersten Samen säen“ wählen.
2. Ein erfundenes Anliegen wählen, den Bibelgedanken in beiden Übersetzungen
   öffnen, eigene Worte als Gedanken oder Gebet und einen nächsten Schritt notieren.
3. Zwischendurch zur Bibel gehen und über den Entwurfsstreifen fortsetzen.
4. Den Weg prüfen, speichern, Pflanzen ansehen und den echten Weg öffnen.
5. Im Journal nach den eigenen Worten sehen; später selbst eine Entwicklung
   bestätigen. Das bloße Pflanzen oder Erledigen eines Schritts erhöht keine Stufe.

Erfahrene Nutzer können direkt die Bibel öffnen. Die Einführung ist freiwillig
und unter Mehr erneut erreichbar. Ein bestehender anderer Entwurf wird geschützt.

Die sechs UX-Ziele sind **noch nicht durch echte Personen bestätigt**. Auch
physisches iPhone Safari, installierte PWA und VoiceOver bleiben **OFFEN**.
Eine technische Freigabe zum nächsten Nutzertest ist keine Produktionsfreigabe.
