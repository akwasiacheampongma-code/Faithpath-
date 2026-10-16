# Physische iPhone-Abnahme UIUX1–5 – OFFEN

Keine echte Safari-, iPhone-, Home-Screen-PWA- oder VoiceOver-Abnahme ist bestätigt. Dies gilt weiterhin für die früheren Phasen. UIUX5 enthält UIUX1–3 plus Phase 5; UIUX4 wird separat entwickelt und muss vor einem Gesamtrelease getrennt integriert und gemeinsam geprüft werden. Chromium, axe und simulierte Insets sind keine Gerätefreigabe.

## Vorbereitung und Protokoll

Nur eine separat freigegebene, erreichbare HTTPS-Test-Origin verwenden. Kein Deploy wurde ausgeführt. Build-ZIP entpacken: index.html liegt direkt in der Wurzel. Ein iPhone erreicht mit localhost nicht den Entwicklungsrechner. Keine echten persönlichen Daten in automatisierte oder belastende Tests übernehmen.

Festhalten: Datum, Tester, iPhone-Modell, iOS, Safari/Home-Screen, Origin, Build-ID FP4-20261016-G-STABLE1-UIUX5, release-integrity.json und äußerer ZIP-Hash. Browser und installierte PWA getrennt testen, da lokale Bestände unterschiedlich sein können. Nur synthetische Fixtures importieren, vor jedem Ersetzen den bisherigen Teststand exportieren. Downloads in Dateien wirklich wiederfinden; die App kann das dauerhafte Sichern nicht bestätigen.

Pro Fall: Schritte / Erwartung / Beobachtung / PASS–FAIL–OFFEN / Screenshot oder Video / Fehlerpriorität. Alle unten stehenden Fälle sind vor Durchführung OFFEN.

## A – Journal

1. Leer, 1, 30 und 300 Einträge, lange Texte, Zeilenumbrüche, Umlaute, Sonderzeichen und Kategorien. Datum und Sortierung entsprechen dem Original; unbekannte Datumswerte werden nicht ersetzt. Gedanke festhalten jederzeit erreichbar.
2. Suche nach Text, realem Wegtitel und Bibelstelle; Typ-/Weg-/Bibelstellenfilter, Kombination mit Suche, Nulltreffer und Reset. Aktive Schaltfläche prüfen. Bekannter P3: eingeklappte Filterbeschriftung kann generisch oder veraltet sein; Ergebnisse bleiben korrekt. Nicht als Datenverlust verwechseln.
3. 40er-Fortsetzung bis 300, keine doppelten/fehlenden IDs. Beim Weiterladen Fokus auf erstem neuen Eintrag. Tiefen Eintrag öffnen, Browser-Zurück: Limit, Filter, Fokus und Scroll-Kontext bleiben im laufenden App-Zustand erhalten. Reload setzt nicht gespeicherte UI-Filter zurück.
4. Beide echten Weglinks eines mehrfach zugeordneten Eintrags, archivierte Wege, Bibelvers-Link und ehrlicher Hinweis für unklare Legacy-Referenz. Keine erfundenen Zuordnungen.
5. Gedanken erstellen/bearbeiten, Zuordnung ändern, Spiegel in Journal/Reflexion nicht duplizieren. Löschen, Abbrechen und Rückgängig; zwischenzeitlich bearbeitete Daten nicht durch Undo überschreiben. Bestehende Bibelmarkierung bleibt korrekt.
6. Schreibentwurf schließen, Appwechsel, Sperren, Safari-Leisten, echte Bildschirmtastatur, Offline und Reload; eigenen Entwurf wieder aufnehmen. In zweitem Tab neueren Entwurf anlegen: beide Texte schützen. Quota-/Speichersperre nur mit synthetischen Daten; keine Erfolgsmeldung ohne Speicherung.

## B – Rückblicke und Erinnerungen

1. Originalgedanke und späterer Rückblick mit richtigen Daten getrennt. Original-Link führt zu richtiger ID; geänderter, gelöschter oder mehrdeutiger Ursprung erzeugt keinen Ersatztext. Weg-Snapshot bleibt beim damaligen Schritt, auch nach späterer Umformulierung/Löschung.
2. thought, changed ohne Bestätigung, changed mit bewusster Bestätigung, working, unchanged, notnow. Nur ausdrücklich bestätigte Entwicklung beeinflusst vorhandene Baumregeln. Häkchen beim Statuswechsel weg von changed wird zurückgesetzt. Schrittabschluss allein erzeugt keine Stufe.
3. Mehr als 40 Rückblicke weiterladen, alle Original-/Weglinks erreichbar. Frühere Quellen und vollständige Timeline bleiben unterscheidbar; keine automatische Bewertung und keine neue Bearbeiten-/Löschenfunktion für historische Belege.
4. 0, 1 und 10 fällige Einladungen. Warum diese Erinnerung? zeigt nachweisbare Aktivität und Bezug. Kein Pflicht-To-do oder Fortschrittsdruck.
5. In zwei Wochen erinnern, Im Moment nicht, Reload und späterer Wiederaufruf. Zurückgestellte Einladungen mit frühestem Datum; bewusst wieder zulassen. Archivierte/gelöschte Quellen werden nicht wiederbelebt. Datum/Zeitzone anhand synthetischer Daten prüfen.
6. Bei Rückblick 0/14/42 Tage wählen; Erklärung sagt beim Nutzen/Öffnen der App, keine Push-/Mail-/Hintergrundzustellung. Keine unerwartete OS-Berechtigungsanfrage.

## C – Datensicherung und Restore

1. Daten & Backup: lokal und unverschlüsselt, keine automatische Synchronisation. JSON kann private Texte enthalten. Keine Aussagen über Ende-zu-Ende-Verschlüsselung oder garantierte Speicherung.
2. Backup exportieren: echten Safari-Download beziehungsweise Teilen-/Dateien-Ablauf beobachten. Datei in Dateien/Downloads finden und an geschütztem Ort sichern. Danach Backup prüfen: Struktur und Referenzen werden geprüft, keinerlei Main-/Draft-/Wiederherstellungsdaten verändert.
3. Leere, vollständige, V3- und V5-Dateien; falsches JSON, Schema, doppelte ID, fehlende Beziehung, ungültiger Bibelvers, über 20 MiB. Fehlermeldung nachvollziehbar, kein Teilimport.
4. Wirklichen Import: erst Bestandsvergleich, dann eigene abschließende Bestätigung. Klar ersetzt statt zusammenführt. Abbrechen/X/Escape/Browser-Zurück/Reload in beiden Stufen verändern keine Daten. Offener Entwurf bleibt bytegleich; vorab als Datei sichern und auf damalige Bezüge achten.
5. Anderer Tab speichert nach Vorschau: veraltete Bestätigung blockiert. Veralteter Tab darf seinen alten Stand nicht als aktuelles Backup exportieren. Neu laden, erneut prüfen und bewusst entscheiden.
6. Unterbrochene Dateilesung: zunächst große/gedrosselte Datei wählen, anschließend lokale Wiederherstellung starten. Die ältere Datei darf den neueren Ablauf nicht verdrängen. Neuere Dateiauswahl gewinnt, nach Schließen kein verspäteter Dialog.
7. Warten auf bestehenden Journal-Speichervorgang: Wiederherstellen anfordern, dann Abbrechen/Escape/Seitenwechsel, erst danach Sperre freigeben. **Keinerlei späterer Import.** Dies ist ein sicherheitsrelevanter Regressionstest; beim echten Gerät wenn nötig mit angeschlossener Safari-Webinspektion und synthetischer Speichersperre durchführen.
8. Import bei vollem Speicher blockieren: Main/Entwurf bleiben erhalten; vorhandene vorige Sicherheitskopie soweit browserseitig möglich bewahren. Bei Fehler Vorschau bleibt bewusst prüf-/wiederholbar. Ein Absturz zwischen mehreren localStorage-Operationen ist keine vollwertige Datenbanktransaktion; Geräteprüfung und externe Kopie bleiben nötig.
9. Nach erfolgreichem Import vorigen Stand ansehen/wiederherstellen: Vergleich zeigt aktuellen und früheren Bestand. Spätere Bearbeitung darf nicht unbemerkt verschwinden; erneut bestätigen. Die neue lokale Sicherheitskopie enthält den gerade ersetzten Stand. Sie wird beim nächsten Import wieder ersetzt.
10. **Echte Übertragung auf zweiter isolierter Origin:** Datei von Origin A exportieren, auf Origin B prüfen/importieren, alle IDs, Journaltexte, Originalbezüge, Wege, Rückblicke, Schritte, Markierungen und Fortschritt vergleichen. A bleibt unverändert. Browser/PWA getrennt prüfen; keine Produktion dafür nutzen.

## D – PWA-Update, frühere Phasen und Accessibility

1. Exakten UIUX3-Build auf derselben isolierten Test-Origin offline vorbereiten, synthetische Daten und offenen Entwurf anlegen, exportieren. Danach UIUX5 auf genau diese Origin bereitstellen. Zwei verschiedene Preview-Adressen sind kein Update.
2. Angebot abwarten, vor Aktivierung Stand bytegleich; bewusst Jetzt aktualisieren. UIUX5-Build-ID und Manifest prüfen. Entwurf, alle Quizschlüssel, Markierungen, V3-Migrationskopie und persönliche Beziehungen bleiben erhalten.
3. Flugmodus, PWA vollständig schließen, Kaltstart; beide Bibeln, neuer Journal-/Rückblick-/Reminder-/Backup-Prüfpfad, Fragen und neue Styles funktionieren. Gedanken offline speichern und exportieren; Rückkehr nach Appwechsel/Sperren prüfen.
4. UIUX1: Heute, Baum und echter persönlicher nächster Schritt. UIUX2: beide Übersetzungen, Markierung/Notiz/Weg, Geschichten/Fragen/Erklärung/freiwillige Reflexion, Schwert/Epheser 6, Kurzkapitel aus gescrollter Ansicht und keine Zählung allein durch Öffnen. UIUX3: sieben Baumstufen, echte Zweige, leere/aktive/archivierte Wege, Schritte, Rückblicke und Originale, sichere Löschung/Undo.
5. Alle vier Themes, kleiner Bildschirm und Querformat, 200 % Text, reduzierte Bewegung, echte Safe Areas und Browserleisten. Kein verdecktes Speichern/Schließen, mindestens 44px für Kernaktionen, natürliches vertikales Scrollen, keine horizontale Überladung.
6. VoiceOver: Navigation, benannte Suche/Filter, Trefferzahl, Weiterladen und Fokus, damaliges/heutiges Datum, fehlende Quelle, Vergleichstabelle, beide Bestätigungen, Importfehler und Status. Mit Hardwaretastatur Tab/Shift-Tab/Enter/Escape, Dialogwechsel und Rücksprung prüfen.

## Freigabe

Datenverlust, Import nach Abbruch, falsche historische Zuordnung, nicht erreichbare Kernfunktion oder unbeabsichtigtes Baumwachstum sind Blocker. GO höchstens für isolierte Geräteabnahme nach grünen Browser-/Daten-Gates. Kein Produktions-GO ohne getrennt geprüfte UIUX4/UIUX5-Integration und dokumentierte physische UIUX1–5-Abnahme.
