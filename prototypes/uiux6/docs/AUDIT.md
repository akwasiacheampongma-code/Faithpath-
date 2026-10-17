# Unabhängiger Design-Audit der Ausgangsoberfläche

Basis: `0ec849255fe3f06d80da77ab89d5b66f92f47560`. Eigene Chromium-Aufnahmen der gebauten UIUX45-App am 17.10.2026, 390 × 844. Ausschließlich synthetische Fixtures aus `tests/phase5-fixtures.mjs`. Die vorhandenen QA-Berichte wurden zur Architektur gelesen, nicht als Nachweis visueller Qualität übernommen.

## Tatsächlich betrachteter Ablauf

1. **Heute:** Ein persönlicher nächster Schritt steht sinnvoll vor dem Baum. Die Handlung bleibt verständlich. Kleine Baumfotografie und ähnliche Karten machen die persönliche Geschichte jedoch eher zu einem weiteren Modul. Emotionaler Markencharakter entsteht kaum. Beleg: `screenshots/before-today-viewport.png`.
2. **Bibel:** Der Text steht bereits im Mittelpunkt, Übersetzungen und Kapitel sind zugänglich. Steuerung, Titel und Text wirken wie eine ordentlich gestaltete Webseite; der Leseort hat wenig eigene Identität. Die vielen Versblöcke brauchen eine präzisere typografische Beziehung zwischen Versnummer und Text. Beleg: `before-bible-viewport.png`, vollständiges Kapitel `before-bible-390.png`.
3. **Mein Weg:** Die Wegkarte benennt ein echtes Anliegen und einen konkreten Schritt. Der Baum und die persönliche Chronik sind weitere Ziele unterhalb der Karte; Vergangenheit, Gegenwart und nächster Schritt erscheinen nicht als ein gemeinsames Erlebnis. Beleg: `before-path-viewport.png`.
4. **Journal:** Schreiben und Suche sind vorhanden. Einleitung, Schaltfläche, Suche und Filter beanspruchen viel Höhe, bevor die eigenen Worte sichtbar werden. Das Journal wirkt wie ein Verwaltungsbereich für Einträge. Beleg: `before-journal-viewport.png`.
5. **Entdecken:** Erhaltener Inhalt und begrenzte Ergebniszahl sind gute Grundlagen. Einleitung, Unterbereiche, Suchfeld und mehrere Filter bilden jedoch eine hohe Bedienungsschicht vor der ersten Geschichte. Die Ergebniszeilen gleichen sich stark; eigene Fragen finden wenig emotionalen Einstieg. Beleg: `before-discover-viewport.png`, vollständige Ansicht `before-discover-390.png`.

## Urteil

Die App ist eine schützenswerte funktionale Grundlage. Vier klare Hauptziele, lokale Texte, wertungsfreie Sprache und echte persönliche Verknüpfungen bleiben richtig. Ein Komplettumbau des Datenmodells würde diese visuelle Aufgabe nicht lösen.

Die größte Chance liegt in der **unterschiedlichen Inszenierung unterschiedlicher Tätigkeiten**: einladendes Ankommen, ruhiges Lesen, eine nachvollziehbare persönliche Geschichte und unmittelbares Schreiben. Aktuell nivellieren ähnliche Schriftgrößen, Abstände und Karten diese Unterschiede. Das ist ein Designurteil anhand der Bilder, kein nachgewiesener Conversion- oder Retentionverlust.

Daraus folgen drei Hypothesen: **Lebensbaum** macht persönliche Begleitung bildhaft; **Wort & Stille** priorisiert Handlung und konzentriertes Lesen; **Lebensseiten** macht aus Modulen eine persönliche redaktionelle Ausgabe. Die älteren vorgegebenen Stilnamen sind keine Anforderungen mehr.

## Grenzen der Prüfung

Die Aufnahmen erfolgten bei blockiertem Service Worker, um die vorhandene App nicht mit einem weiteren persistenten Offline-Zustand zu vermischen. Die dadurch ausgelöste Offline-Vorbereitungswarnung wurde vor den Designaufnahmen geschlossen. Sie ist **kein** reproduzierter Produktionsfehler und fließt nicht in das Designurteil ein. Diese Bilder prüfen keine Offlinefähigkeit.

Screenshots beweisen keine Screenreader-Tauglichkeit. Eigene Phase-6-Tests stehen im QA-Bericht. Echte Safari-/iPhone-/installierte-PWA-/VoiceOver-Abnahmen der Phasen 1–5 bleiben offen. Keine Nutzerstudie, keine kommerzielle Lizenzprüfung der bereits gelieferten Baumfotografien.
