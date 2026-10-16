# Physische Geräteabnahme UIUX1–3 – OFFEN

Es liegt keine bestätigte echte iPhone-/Safari-/Home-Screen-PWA-/VoiceOver-Abnahme vor. Chromium, mobile Viewports, axe und synthetische Safe Areas ersetzen diese Prüfung nicht. Diese Anleitung ist ein auszufüllendes Gate; kein Schritt ist vorab als bestanden markiert.

## Vorbereitung

Eine separat freigegebene HTTPS-Test-Origin verwenden. Das gelieferte Build-ZIP enthält die fertige App direkt in der Wurzel; kein Build-Befehl auf Netlify erforderlich. **Dieser Auftrag hat nichts veröffentlicht.** Für ein echtes Update muss dieselbe isolierte Origin zunächst den UIUX2-Build, danach UIUX3 ausliefern; zwei unterschiedliche Preview-Adressen prüfen kein PWA-Update. Produktion und echte Nutzerdaten nicht verwenden.

Notieren: Datum, Tester, iPhone-Modell, iOS-/Safari-Version, Browser beziehungsweise installierte PWA, Origin, Build-ID und `release-integrity.json`-Hash. Vor jedem Austausch synthetischer Fixtures exportieren; Import ersetzt vorhandene lokale Daten. Keine persönlichen echten Journale verwenden. Browser und installierte PWA haben gegebenenfalls getrennte Datenbereiche, beide separat prüfen.

Das QA-Paket enthält gültige synthetische V5-Backups unter `fixtures/`: leer, aktiv, fünf/dreißig Wege, lang, archiviert, viele Gedanken, fehlende Quelle, Baum 0–6. Nur auf der Test-Origin importieren.

## Safari – OFFEN

1. Leerer Start/Onboarding und Heute: freiwilliger Einstieg; Olivenbaum und persönlicher nächster Schritt verständlich, keine Überdeckung durch Leisten. UIUX1-Kriterien zusätzlich anhand des bestehenden Gate-Dokuments prüfen.
2. „Mein Weg“ leer, aktiv, fünf/dreißig Wege, Archiv: nächsten tatsächlichen Schritt erkennen; Weg über „Weg öffnen“ erreichen; aus Archiv wieder aufnehmen. Lange Titel/Schritte/Gründe bis zum Ende lesbar.
3. Einzelner Weg: Grund öffnen; Schritt bearbeiten, hinzufügen, anderen als nächsten wählen, abschließen und wieder öffnen. IDs/Verknüpfungen bleiben, Baumstufe unverändert.
4. Originalgedanke und echte Bibelstelle aus Weg öffnen; zur richtigen Quelle zurück. Über 40 Momente weiterladen; älteste Gedanken erreichbar; Spiegel nicht doppelt dargestellt.
5. Rückblick: Gedanke, verändert ohne Bestätigung, weiter unterwegs, unverändert, jetzt nicht. Nur „verändert“ **plus bewusstes Ankreuzen** darf Entwicklung erzeugen. Schwierige oder unveränderte Erfahrungen bleiben ohne Bewertung erhalten.
6. Rückblick zu Schritt A öffnen, Entwurf verlassen, Schritt ändern oder Schritt B als nächsten wählen, Entwurf fortsetzen: damaliger Wortlaut/ID A erhalten, niemals B als historisches Original anzeigen. Bei Legacy-Quelle ohne damaligen Wortlaut ehrlicher Hinweis. Originaleintrag nachträglich bearbeiten/löschen; keine falsche Vorher-/Nachher-Behauptung.
7. Alle sieben Baum-Fixtures: vollständiges Motiv, Beschriftung und Erklärung, Stufen 0/1/2/3–4/5–6/7–9/10+, echte Zweige öffnen richtige Wege. Bei frühen Stufen Wege textlich erreichbar. Archivieren verändert bestätigte Entwicklung nicht. Endgültig löschen, abbrechen und Rückgängig: gespeicherte Gedanken/Markierungen bleiben; nach neuerer Änderung darf Undo diese nicht überschreiben.
8. Heute → Situation/Reader → Gedanke → Weg → kleiner Schritt → freiwilliger Rückblick → selbst bestätigte Entwicklung → Baum. Zusätzlich Geschichte → alle Wissensfragen/Erklärungen → freiwillige Reflexion → Weg. N-/FP-Inhalte und Fortschritte erhalten.
9. Reader beide Übersetzungen, Buch-/Kapitelwechsel, Markierung, Farbe, Notiz, Weg-/Journalverknüpfung, freiwillige Kapitelübung. Aus tief gescrolltem langen Kapitel und aus Entdecken nach Psalm 117 navigieren: Öffnen allein zählt nicht; kurzes sichtbar vollständiges Kapitel bewusst bestätigen. Erneutes Lesen zählt nicht doppelt. UIUX2-Schwert/Epheser 6 separat prüfen.
10. Entwurf vor Navigation, Reload, Appwechsel und Speicherabbruch sichern; wieder aufnehmen. Exportieren, Importvorschau prüfen, wiederherstellen; Gedanken, IDs, Schritte, Rückblicke, Markierungen, Quiz und Lesefortschritt vollständig erhalten. Beschädigter Import lässt Daten und Entwurf unverändert.

## Darstellung und Bedienung – OFFEN

- Hell, Atmosphärisch, Papier, Nacht; Hoch-/Querformat; kleines iPhone, Safe Areas, ein-/ausfahrende Safari-Leisten. Browserzoom/Textgröße bis mindestens 200%; kein horizontaler Zwangsscroll, abgeschnittene Steuerung oder unlesbarer Kontrast.
- Echte Bildschirmtastatur: langer Wegtitel, langer Schritt, Reflexion/Rückblick; Speichern/Schließen erreichbar, Scrollposition und Entwurf nach Tastaturwechsel stabil.
- Mit Hardwaretastatur: sichtbarer Fokus, sinnvolle Reihenfolge, Dialogfokus/Rückgabe, Schrittabschluss und „Weitere Momente“ verlieren Fokus nicht; Escape und Menü bedienen.
- VoiceOver: Seitenüberschrift/Regionen, Karten mit verständlichem Namen, Schrittkästchen mit Status, sieben Baumstufen mit sachlichem Alternativtext, Zweiglinks zu realem Weg, richtige Originalquelle, Fehler und Speicherstatus angesagt. Keine Reflexion als richtig/falsch ausgeben. Dynamische Inhalte und weitere Momente erreichbar.
- iOS „Bewegung reduzieren“: ruhige Übergänge, kein Fortschrittsfeuerwerk. Touchziele mindestens 44 px und mit Abstand, insbesondere Zweige bei kleinem Display.

## Installierte PWA, Offline und Update – OFFEN

1. UIUX2 auf derselben Test-Origin öffnen, Offline-Bereitschaft abwarten, zum Home-Bildschirm hinzufügen. Synthetische Wege/Notizen/Quiz und ungespeicherten Entwurf erzeugen/exportieren. PWA schließen/erneut öffnen und Stand notieren.
2. Flugmodus: PWA vollständig beenden, wieder öffnen, beide Bibeln, Reader, Geschichten/Fragen, Wege, Rückblicke und alle Baumgrafiken prüfen. Neue synthetische Notiz speichern, schließen, wieder öffnen. Kein unerwarteter Datenverlust.
3. Online UIUX3 auf dieselbe isolierte Origin bereitstellen. App zunächst geöffnet lassen, anschließend Dokument neu laden. Updateangebot erscheint; vor bewusster Aktivierung bleibt UIUX2 benutzbar und Daten unverändert.
4. „Jetzt aktualisieren“ bewusst wählen; Build-ID muss `FP4-20261016-G-STABLE1-UIUX3` lauten. Daten und Entwurf mit vorherigem Export vergleichen; nichts doppelt, nichts verloren. Bei offenem Formular dessen bestehenden Entwurfsschutz prüfen.
5. Wieder offline und Kaltstart: beide Bibeln, persönliche Wege, neue CSS, Baum, Geschichten-MC/NT-Kapitelquiz und Schwert funktionieren. Alten Entwurf fortsetzen/speichern, erneut exportieren.
6. Appwechsel/Sperrbildschirm, späterer Neustart, Datumwechsel und Speicherknappheit nur mit synthetischen Daten prüfen. iOS-Speicherräumung kann lokale Daten entfernen; Backup bleibt notwendig. Persistenz nicht allein aus einem erfolgreichen Chromium-Reload ableiten.

## Ergebnisbogen

Pro Fall: ID, Umgebung, Build, Schritte, erwartet/beobachtet, Screenshot/Video, PASS/FAIL/OFFEN, Fehlerpriorität, Wiederholung nach Fix. P0/P1, Datenverlust, falscher Originalbezug oder unbeabsichtigtes Baumwachstum blockieren Freigabe. Produktions-GO erst nach dokumentierter erfolgreicher UIUX1-, UIUX2- und UIUX3-Geräteabnahme; bis dahin NO-GO für Produktion.
