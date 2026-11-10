# Unabhängiger Integrationsreview

09.11.2026. Nur synthetische Datensätze. Produktdateien wurden durch diesen
Review nicht geändert.

## Reproduzierter Positionsfehler vor der Korrektur

`rememberNtStudyPosition(position)` schloss das übergebene veränderbare Objekt
bis zur Ausführung in der gemeinsamen Schreibqueue ein. Eine ausstehende
`openReading`-Speicherung lässt `busy` bewusst ausgeschaltet; die NT-Aktion kann
sich dahinter einreihen. Im isolierten Store-Versuch wurde MRK 4 / Frage 1
angefordert, danach das Argument auf Offenbarung 22 / Frage 5 geändert und erst
dann der Vorgängerwrite freigegeben. Gespeichert wurde die nachträgliche
Objektänderung. Damit entsprach der gespeicherte Wert nicht der ursprünglichen
Aktionsanforderung.

`mutable-position-before-fix.test.ts.txt` ist der damalige Diagnoseversuch,
`mutable-position-before-fix.json` sein tatsächlicher **1/1-PASS**-Rohbericht.
Der Versuch behauptet ausdrücklich das damalige fehlerhafte Ergebnis und ist
**keine Abnahmeregression**; nach korrekter Snapshotbildung soll genau diese
Diagnose nicht mehr bestehen. Ein anfänglicher Vitest-Harnessimportfehler
(0 ausgeführte Tests) ist separat erhalten.

Der Hauptagent hat anschließend die Eingabe vor dem Einreihen mit
`ntPositionSchema.parse(position)` kopiert und validiert. Seine separate
Produktregression muss den ursprünglich angeforderten Wert prüfen. Dieser
Reviewbericht behauptet keine eigene grüne Abnahme dieser späteren Korrektur.

## Reproduzierter Rückkehrfehler nach eigener Antwortspeicherung

Unabhängiger lokaler Chromiumversuch mit dem tatsächlich ausgelieferten
Testbuild `oliva-90d58a6a170aa170`. Eine echte IndexedDB-Schreibtransaktion wurde
abgeschlossen; ausschließlich ihr `oncomplete`-Callback zur Anwendung wurde
gezielt zurückgehalten. Vor dessen Freigabe wurde über „Das ganze Kapitel
lesen“ zum Reader navigiert. Nach Freigabe und erfolgreicher Speicherung wurde
mit Browser-Zurück zur unverändert erhaltenen Frage zurückgekehrt.

Die Originalantwort war dauerhaft vorhanden (Revision 1). Die Oberfläche zeigte
jedoch weiter „Antwort prüfen“ und keine Aktion „Antwort ändern“. Erneutes
Prüfen scheiterte mit „Dieser NT-Lernstand wurde inzwischen verändert“ gegen
die eigene bereits erfolgreiche Speicherung. Der Generationsschutz verwirft
hier die Erfolgsrückmeldung; der Effekt übernimmt den neuen `saved`-Wert bei
`editing: true` nicht.

Rohbericht `focus-return-before-fix.json`, vollständiger Probeablauf
`focus-return-before-fix.mjs`, echter Screenshot `focus-return-before-fix.png`.
Der Bericht enthält ausschließlich die automatisiert erzeugte Antwort auf die
öffentliche Testfrage. Dies ist kein Nachweis auf gehosteter Vorschau, Simulator
oder physischem Gerät. Der deterministische Callbackhalt bildet eine
verzögerte Abschlussbestätigung ab; keine Behauptung eines im normalen Lauf
bereits beobachteten IndexedDB-Defekts.

Eine Korrektur soll die eigene erfolgreiche Antwort bei Rückkehr erkennen,
ohne bei einem echten Fremdkonflikt eine noch nicht gespeicherte Auswahl
stillschweigend zu ersetzen. Die Prüfung eines zweiten Tabs bleibt erforderlich.

## Gleiche Rückkehrlücke bei einer bestätigten Fragenposition

Ein zweiter lokaler Chromiumversuch auf demselben Build hielt den echten
IndexedDB-Abschlusscallback nach „Nächste Frage“ zurück. Nach Readerbesuch,
Freigabe und Browser-Zurück blieb Frage 1 (`FP-0416`) sichtbar, während die
bereits bestätigte Position `MRK / 4 / index: 1` auf Frage 2 zeigte. Der
Generationsschutz verwirft auch hier die nachträgliche `setIndex`-Rückmeldung.
Es ging keine Antwort verloren; gespeicherte und sichtbare Position stimmten
jedoch nicht überein.

Probeablauf `navigation-return-before-fix.mjs`, Rohbericht
`navigation-return-before-fix.json`, Screenshot
`navigation-return-before-fix.png`. Auch dieser Nachweis ist eine deterministisch
verzögerte Abschlussbestätigung in lokalem Chromium, kein Geräte- oder
Produktionsfehlerbericht.

## Weitere geprüfte Grenzen

Die NT-Schreibaktionen verwenden die bestehende gemeinsame Queue und den
sichtbaren Aktionslock, führen Quellenhash-/CAS-Prüfungen vor Noops aus und
persistieren ohne Aufruf von `grow`. Aktive Antworten und historische
Quellenfassungen bleiben durch unterschiedliche Inhalts-Hashes getrennt.
Spätere Antwortänderungen lassen einen früheren Ansehen-Abschluss bewusst
bestehen; die Schema-Grenze prüft dabei `createdAt`, nicht den späteren
Bearbeitungszeitpunkt. Neue Abschlüsse müssen nach den aktuellen Antworten
liegen. Harte Grenzen für neue Quellfassungen werfen vor einer Mutation;
vorhandene Fassungen werden nicht verdrängt.

Die Archivaktivierung prüft Revision, Import-ID, Quellhash und tatsächliche
Originaldatei erneut. V8 bindet Legacy-Fakten an vorhandene Belege; vollständiges
Dekodieren prüft zusätzlich die originale `done`-Angabe. Die eingefrorenen V7-
und früheren Schemadefinitionen bleiben wie im Migrationnachweis erhalten.
In diesen gelesenen Grenzen wurde kein weiterer konkreter Integritätsfehler
festgestellt. Dies ist ein Code-/gezielter Reproduktionsreview, kein neuer
vollständiger Testlauf.
