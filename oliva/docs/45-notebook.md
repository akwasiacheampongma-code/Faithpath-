# OLIVA · Notizen

Die Notizen liegen unter **Sammlung → Notizen**. „Neue Notiz“ öffnet den Schreibbereich mit Fokus. Die erste Zeile ergibt den Titel in der Liste, der restliche Text die Vorschau. Die Liste sortiert angeheftete Einträge zuerst und danach jeweils nach der letzten Text- oder Verknüpfungsänderung. Die Suche berücksichtigt Titel, Text und Verknüpfungen. Unter „Zuletzt gelöscht“ können Einträge nach einer bestätigten Löschung wiederhergestellt oder ausdrücklich endgültig gelöscht werden. Die Eingabe unterstützt Text mit Zeilenumbrüchen und zeigt beim Erreichen ihrer Grenze von 10.000 Zeichen einen Hinweis.

## Vergleich auf dem Smartphone

| Ausgangsstand · 390 px | Notizen · 390 px |
| --- | --- |
| [Sammlung mit zwei Gedanken](evidence/notes/before-list-390.png) | [Notizenliste mit angeheftetem Eintrag](evidence/notes/after-list-390.png) |
| [Bisheriger Gedanken-Editor](evidence/notes/before-editor-390.png) | [Notizeditor mit automatischer Speicherung](evidence/notes/after-editor-390.png) |

Die Vergleichsbilder stammen aus lokalem Chromium mit einer Smartphone-Ansicht und synthetischen Notizen. Die bisherige Sammlung ist weiterhin der Zugang zu gespeicherten Gedanken, Reflexionen, Bibelaufzeichnungen und Entwürfen. Die neue Liste bündelt freie Notizen mit Suche und einer einzigen Aktion zum Schreiben.

Zusätzliche Ansichten bei 320 px im Dunkelmodus. [Notizenliste](evidence/notes/after-list-dark-320.png) · [Editor](evidence/notes/after-editor-dark-320.png)

## Bibel und Reflexion

Über „Optionen → Verknüpfung hinzufügen“ lassen sich Bibelbücher mit Kapitel und optionalem Versbereich, Wege, Geschichten und konkrete Reflexionsfragen auswählen. Aus dem Reader öffnet „Notizen zu diesem Kapitel“ die passende Liste. Eine von dort begonnene Notiz ist mit der angezeigten Bibelstelle vorbelegt. Zu diesem Kapitel gespeicherte ältere Einträge öffnen aus der Liste ihre ursprüngliche Ansicht in Sammlung.

## Speicherung und Datenerhalt

Das bestehende Profildokument erhält beim ersten Speichern eines Notizeintrags das Feld `notebook` und die Dokumentversion V12. Installation und Ansicht der Liste schreiben kein V12-Profil. V1–V11-Sicherungen bleiben lesbar. Die IndexedDB- und SQLite-Schemata sowie die bisherigen Typen für Bibelnotizen, Reflexionen und FaithPath-Originalarchive bleiben erhalten. Die vorherige Fassung kann V12-Sicherungen erst nach Aktualisierung öffnen.

Beim Tippen werden anstehende Transaktionen zusammengefasst und im vorhandenen lokalen Speicher bestätigt. Ein kurzlebiger Zwischenstand im Browser-Sitzungsspeicher kann beim Neuladen derselben Registerkarte erneut geschrieben werden. Bei einem Speicherfehler bleibt der Text sichtbar und ein erneuter Versuch steht zur Verfügung. Beim normalen Schließen warnt die Web-App, solange Eingaben ausstehen. Das Betriebssystem kann bei abruptem Beenden noch ausstehende Schreibvorgänge unterbrechen. Der Status „Auf diesem Gerät gespeichert“ bestätigt die abgeschlossene Transaktion.

Wenn mehrere Fenster unterschiedliche Notizen ändern, übernimmt OLIVA beide Änderungen. Bei zwei verschiedenen Bearbeitungen derselben Fassung wird die zweite als eigene Notiz gespeichert und die App weist darauf hin. Der Vergleich berücksichtigt auch inhaltlich abweichende Fassungen mit derselben Revisionsnummer, etwa nach einer Wiederherstellung. Der Papierkorb hat keine automatische Ablauffrist. Eine FaithPath-Rückkehr sichert weiterhin den früheren Importstand und erhält die davon unabhängigen Notizen. Eine OLIVA-Wiederherstellung ersetzt nach ausdrücklicher Bestätigung das gesamte Profil einschließlich Notizbuch.

Unverschlüsselte JSON-Sicherungen und mit Passwort geschützte `.oliva`-Dateien enthalten das Notizbuch einschließlich Papierkorb. Die App-Sperre schließt die Notizenseiten und prüft vor dem Zugriff auf persönliche Inhalte den Schutzstatus. Bei direktem Zugriff auf Browserprofil oder Gerätedateien bleiben die lokalen Daten lesbar.

## Abnahme

Der vollständige Chromium-Lauf auf `oliva-4fe58df588d05d3f` hat 176 von 176 Fällen bestanden. Darunter sind alle neun Notizfälle. [Browserprotokoll](evidence/notes/browser-full.log) · [Maschinenlesbares Ergebnis](evidence/notes/browser-full.json)

| Prüfung | Ergebnis |
| --- | --- |
| Fachtests, Typecheck und Inhalte | 355 Fachtests und Typecheck bestanden. Sieben Inhaltsprüfungen und der Schwert-Check für den Produktionsbuild erfolgreich. [Fachtests](evidence/notes/fachtests.log) · [Typecheck](evidence/notes/typecheck.log) |
| Schreiben, Suche und Organisation | Acht gezielte Chromium-Fälle bestanden. Sie prüfen Fokus, schnelles Schreiben, Offline-Neustart, Neuladen mit simuliertem Speicherfehler, Suche, Sortierung, Anheften, Löschen und Wiederherstellen. [Notiztests](evidence/notes/targeted.log) |
| Inhalt und Sicherung | Die vier geprüften Rohdatensätze blieben beim PWA-Update vom Passwort-Stand zur Notizfassung bytegenau erhalten. Ein Browser-Rundlauf prüfte V11-Import, V12-JSON-Export, verschlüsselte V12-Wiederherstellung, das FaithPath-Original und den gesperrten Offline-Direktlink. Ein zusätzlicher Test prüft, dass eine alte Bibelnotiz im Reader erreichbar ist und das Notizbuch bei der FaithPath-Rückkehr erhalten bleibt. [PWA-Update](evidence/notes/pwa-upgrade.json) · [Sicherungstest](evidence/notes/targeted.log) · [Bibelnotiz und Rückkehr](evidence/notes/legacy-and-rollback.log) |
| Barrierefreiheit | Tastatur und programmatischer Fokus sowie Axe für den Editor bei 320 px, doppelter CSS-Schrift und beiden Farbschemata geprüft. [Notiztests](evidence/notes/targeted.log) |
| Produktion | Webbuild `oliva-4fe58df588d05d3f` mit 132 vorab zwischengespeicherten Dateien. Android- und iOS-Exporte statisch auf JavaScript, Paketmetadaten und Assetreferenzen geprüft. [Web](evidence/notes/web-build.log) · [Android](evidence/notes/native-android.json) · [iOS](evidence/notes/native-ios.json) |

Im ersten Browserlauf wartete ein Test beim Zurückgehen auf die sichtbare Liste und lud vor dem Wechsel der URL neu. Die gespeicherte Notiz erschien nach dem Neuladen weiterhin im Editor. Seit der Korrektur wartet der Test auch auf die Listen-URL. Ein zusätzlicher Test schließt den gesamten Browser und öffnet dasselbe Profil offline erneut. [Erster Durchlauf](evidence/notes/targeted-initial.log) · [Abnahme](evidence/notes/targeted.log)

Auf echten iPhones und Android-Geräten stehen die Bildschirmtastatur, ein Wechsel in eine andere App, große Systemschrift, VoiceOver und TalkBack zur Prüfung aus. Der getestete PWA-Kandidat ist lokal mit `npm run preview` und der Route `/notizen` erreichbar.

Der aktuelle Arbeitszweig lautet `feature/oliva-notes`. Der Quellstand `a7a3b74` basiert auf dem Passwort-Stand `c945b26`. Dessen Quellsicherung liegt auf GitHub in Commit `1501a3b`. Der aktuelle Notizenstand liegt lokal und die bisherige private Vorschau zeigt ihr bisheriges Paket. [Passwort-Zweig auf GitHub](https://github.com/akwasiacheampongma-code/Faithpath-/tree/feature/oliva-password-protection/oliva)

Die Arbeitsumgebung erreichte während der Tests ihr Speicherlimit. 821 bytegleiche Dateien in älteren, erzeugten Build-Kopien wurden anhand ihrer SHA-256-Hashes geprüft und als Hardlinks zusammengefasst. Die Dateien sind an den bisherigen Pfaden inhaltlich unverändert verfügbar. Doppelte lose Git-Objekte in der lokalen Spiegelkopie sind weiterhin in deren Packdateien vorhanden.
