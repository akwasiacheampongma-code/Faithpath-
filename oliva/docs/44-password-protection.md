# OLIVA · Passwortschutz und Wiederherstellung

Arbeitsgrundlage ist der Stabilisierungskandidat `4c2e0d3` auf 0.18.0-Basis. Der Quellzweig lautet `feature/oliva-password-protection`. Die private Vorschau bleibt während der Abnahme beim bisher ausgelieferten Paket.

## Wiederherstellung des App-Zugriffs

Vor der Aktivierung erzeugt OLIVA auf dem Gerät einen zufälligen Wiederherstellungscode mit 128 Bit Entropie. Die Person speichert ihn außerhalb der App und bestätigt ihn. Erst dann wird die Sperre gespeichert. OLIVA speichert einen Prüfnachweis zum Code. Der vollständige Code wird einmal angezeigt. Er gehört weder zu normalen Sicherungen noch zu Reparaturdateien.

Bei einem vergessenen App-Passwort führt der passende Code zur Wahl eines neuen Passworts und zur Bestätigung eines neuen Codes. Eine atomare Änderung ersetzt den bisherigen Zugangsnachweis. Der bisherige Wiederherstellungscode verliert dadurch seine Gültigkeit. Lesestand, Texte und Archive bleiben erhalten. Wenn Passwort und Code fehlen, bleiben die Daten bestehen. Eine bereits vorhandene Sicherung kann in einer getrennten, ungesperrten Installation mit dem zugehörigen Dateipasswort wiederhergestellt werden. Einen Datenlöschweg bietet die Entsperransicht bewusst nicht an.

Das App-Passwort steuert, ob OLIVA die persönlichen Ansichten lädt. Die lokalen Datenbanken werden dadurch nicht verschlüsselt. Wer direkten Zugriff auf Browserprofil, Gerätedateien oder eine ältere OLIVA-Fassung ohne diese Sperre hat, kann gespeicherte Daten unter Umständen lesen. Die Einstellungen weisen darauf hin. Der Wiederherstellungscode öffnet ausschließlich den App-Zugriff. Für jede verschlüsselte Sicherungsdatei gilt ihr eigenes Passwort. Ohne dieses kann OLIVA die Datei nicht wiederherstellen.

## App-Zugriff und lokale Speicherung

Der Zugangsnachweis liegt getrennt vom persönlichen Datenbestand in einem eigenen lokalen Speicher (`oliva-access-v1` im Web, `oliva-access.db` unter Android und iOS). Die bestehende Datenbank und ihr Sicherungsformat benötigen dafür keine Migration. Vor dem Laden persönlicher Daten prüft OLIVA den Schutzstatus. Im gesperrten Zustand rendert der Navigator ausschließlich die Entsperransicht. Die aufgerufene Adresse kann nach erfolgreicher Entsperrung geöffnet werden. Eine Entsperrung gilt für das aktuelle Fenster oder die laufende native App und endet bei Neustart. Das Zeitlimit beträgt standardmäßig fünf Minuten und lässt sich auf eine, fünf, fünfzehn oder dreißig Minuten einstellen. Automatisches Sperren gilt pro Fenster. „Jetzt sperren“ und Änderungen am Schutz entziehen anderen geöffneten Fenstern die bisherige Freigabe. Bereits autorisierte Schreibvorgänge dürfen geordnet abschließen. Noch nicht dauerhaft gesicherte Entwürfe bleiben für die laufende Sitzung im Arbeitsspeicher erhalten.

Solange das Gerät entsperrt und OLIVA innerhalb des Zeitlimits offen ist, kann eine andere Person mit Zugriff auf das Gerät die Ansicht weiter benutzen. „Jetzt sperren“ beendet den Zugriff sofort im aktuellen Fenster. Das Web gleicht Änderungen zwischen Fenstern über Browserereignisse und den lokalen Speicher ab. Die Web-Kryptografie setzt einen sicheren Browserkontext wie HTTPS oder `localhost` voraus. Für die Bedienung eines nativen Systemdialogs kann die laufende Sitzung innerhalb des eingestellten Zeitlimits zurückkehren.

## Verschlüsselte Sicherungsdatei, Format 1

Die Datei enthält den bestehenden, vollständigen OLIVA-JSON-Export als UTF-8. AES-256-GCM authentifiziert den Inhalt und den gesamten Dateikopf. PBKDF2-HMAC-SHA-256 leitet aus dem exakten UTF-8-Passwort und einem pro Datei neu erzeugten Salt den 32-Byte-Schlüssel ab. Format 1 verwendet genau 600.000 Iterationen. Vor der Ableitung prüft OLIVA Typ, Formatversion, Parameter und maximale Größe. Die Nutzlast ist auf dieselben 64 MiB begrenzt wie der vorhandene Import. Für jede Datei entstehen 16 neue Salt-Bytes und eine neue sichere 12-Byte-Nonce.

| Position | Länge | Inhalt |
| --- | ---: | --- |
| 0 | 8 | ASCII `OLIVAENC` |
| 8 | 1 | Formatversion `1` |
| 9 | 1 | Schlüsselableitung `1` für PBKDF2-HMAC-SHA-256 |
| 10 | 4 | Iterationen als uint32 Big Endian |
| 14 | 16 | Salt |
| 30 | 12 | Nonce |
| 42 | variabel | Verschlüsselter JSON-Export |
| Dateiende | 16 | GCM-Authentifizierungstag |

Die Verschlüsselung und Entschlüsselung laufen auf dem Gerät im Arbeitsspeicher. Im Web nutzt OLIVA Web Crypto, in den nativen Builds die Plattformverschlüsselung und Zufallsquelle aus Expo Crypto sowie die asynchrone Schlüsselableitung von `@noble/hashes`. Der verschlüsselte Export übergibt nur die verschlüsselte Datei an den Browser oder den Systemdialog. Beim nativen Dateiaustausch enthält auch die temporäre Kopie im Cache ausschließlich die verschlüsselte Datei. Der Import prüft den entschlüsselten Inhalt mit dem bestehenden JSON-Validator und zeigt vor dem Schreiben die vorhandene Wiederherstellungsvorschau. Alte V1–V11-Exporte bleiben lesbar. Der ausdrücklich gewählte unverschlüsselte Export zeigt vorher einen Klartexthinweis. Reparatursicherungen und der separate Export einzelner FaithPath-Originale behalten ebenfalls ihr bestehendes Format und zeigen einen Klartexthinweis.

Die Sicherung enthält den V11-Profilstand mit persönlichen Texten, Entwürfen, Antworten, Lesefortschritt, Lesezeichen, Markierungen, Garten und übernommenen FaithPath-Originalarchiven. App-Passwort und Wiederherstellungscode gehören zum Gerät oder Browserprofil und werden bei einem Gerätewechsel neu eingerichtet. Passwörter sind mindestens zwölf Zeichen lang. Die Grundlage für das Öffnen einer Sicherung ist das exakte Dateipasswort zum Zeitpunkt des Exports.

## Abnahme und Nachweise

Der vollständige lokale Chromium-Lauf hat 167 von 167 Fällen bestanden, einschließlich aller sechs neuen Passwortfälle. Sieben Inhaltsprüfungen und die Prüfung des geistlichen Schwerts im Produktionsbuild waren ebenfalls erfolgreich. [Chromium-Protokoll](evidence/password-protection/browser-full.log) · [Maschinenlesbares Browserergebnis](evidence/password-protection/browser-full.json)

| Prüfung | Ergebnis |
| --- | --- |
| TypeScript und Fachtests | Typecheck und 350 Fachtests in 40 Dateien bestanden. Unabhängige Node-Vergleiche prüfen den AES-GCM-Dateiaustausch in beiden Richtungen und die native PBKDF2-Ableitung. Die Fachtests prüfen auch die unveränderte Wiederherstellung eines über 8 MiB großen FaithPath-Originalarchivs und den alten JSON-Import. [Fachtests](evidence/password-protection/fachtests.log) · [Typecheck](evidence/password-protection/types.log) |
| Chromium, verschlüsselter Export und Import | Offline-Rundlauf über die Oberfläche mit 1,6 MB Originalquelle. Falsches Passwort, veränderter Authentifizierungstag und Abbruch lassen die Rohdaten unverändert. Erst eine ausdrückliche Bestätigung schreibt die geprüfte Sicherung zurück. [Browserprotokoll](evidence/password-protection/browser-full.log) |
| Chromium, App-Passwortschutz | Neustart, Offline-Direktlink, Passwortwechsel mit Prüfung des bisherigen Passworts, Wiederherstellung mit rotierendem Code, mehrere Fenster und Inaktivität sind abgedeckt. Der Offline-Direktlink führt erst nach Entsperrung zur tatsächlichen Sammlung. 320 px, doppelte CSS-Schrift, Tastatur und Axe prüfen die Entsperransicht. [Browserprotokoll](evidence/password-protection/browser-full.log) |
| Tatsächlicher lokaler PWA-Paketwechsel | `oliva-507a582d5a9cc3a6` → `oliva-a1008a991b30c338`. Vier vorhandene IndexedDB-Rohdatensätze, einschließlich FaithPath-Original und Rückkehrsicherung, stimmen nach Service-Worker-Wechsel, Offline-Neustart und optionaler Einrichtung der App-Sperre genau überein. Lesefortschritt, Entwurf und Antworten wurden über die Oberfläche angelegt. [PWA-Protokoll](evidence/password-protection/pwa-upgrade.json) |
| Produktionspakete, lokale Daten und Abhängigkeiten | Web-PWA mit 127 im Offlinepaket erfassten Dateien gebaut. Android- und iOS-JavaScript samt Expo-Metadaten, eingebundenen nativen Kryptomodulen und Assets statisch geprüft. Der lokale Datenaudit meldet sechs bestandene Fälle, nur Anfragen an den lokalen Preview-Server und keine Ausgabe des Prüfmarkers. [Webbuild](evidence/password-protection/web-build.log) · [Android](evidence/password-protection/native-android.json) · [iOS](evidence/password-protection/native-ios.json) · [Datenaudit](evidence/password-protection/local-data.json) |

Bei der ersten Chromium-Prüfung fiel die Navigation nach dem Entsperren auf „Heute“ zurück. Der Schutz liegt jetzt im Layout des bestehenden Navigators. Die Ansichten bleiben bis zur Entsperrung unmontiert, während der Router das ursprüngliche Ziel behält. Direktlink und Passwortwechsel wurden danach erneut geprüft. [Gezielte Nachprüfung](evidence/password-protection/browser-route-recheck.log)

Bei einer separaten Chromium-Prüfung kamen die synthetischen Zugangsdaten weder in Anfragen und URLs noch in Konsolenausgaben, im verschlüsselten Dateidownload oder im untersuchten lokalen Speicher im Klartext vor. Im Zugangsspeicher liegen unter anderem Salt und Prüfnachweise. [Prüfnachweis](evidence/password-protection/secret-handling.json)

Ein zusätzlicher Zweifenstertest hat einen fehlgeschlagenen lokalen Schreibvorgang simuliert. Die Sperre entfernte den Editor aus der Ansicht. Nach der Entsperrung im selben Fenster ließ sich der ungesicherte Text fortsetzen und wieder dauerhaft speichern. [Prüfnachweis](evidence/password-protection/draft-during-lock.json)

`npm audit --audit-level=moderate` und die direkte Prüfung der festgeschriebenen Paketversionen melden am 18. November 2026 keine Funde. GitHub hat die zuvor gemeldete Advisory `GHSA-fc5q-39xc-vjpf` laut öffentlicher API um 15:38:56 UTC zurückgezogen. Die Registry führt picomatch weiter in Version 4.0.7. Die früheren Prüfergebnisse dokumentieren den damaligen Wissensstand. [npm-Audit](evidence/password-protection/npm-audit.json) · [GitHub- und Registry-Abgleich](evidence/password-protection/picomatch-registry-crosscheck.json) · [Stabilisierungsbericht](43-stabilization.md)

## Vor der privaten Bereitstellung

Die Freigabe des Passwortkandidaten und echte Gerätetests stehen aus. Auf einem iPhone mit Safari oder installierter PWA und auf Android mit Chrome oder installierter PWA jeweils mit einem Testprofil beginnen. Eine Sicherung auf einer Plattform erstellen und auf der anderen entschlüsseln, dann eine falsche Eingabe und den Abbruch vor der Bestätigung prüfen. Im Flugmodus neu starten und mit App-Passwort wieder öffnen. Mit großer Systemschrift sowie VoiceOver und TalkBack die Eingabefelder, Statusmeldungen und Reihenfolge prüfen. In nativen Builds zusätzlich Systemdialoge, Hintergrundwechsel und eine große Archivdatei über den nativen Dateiaustausch prüfen. [Bestehende Gerätematrix](stabilization-device-matrix.md)

Der Kandidat kann in einem getrennten lokalen Browserprofil über `npm run build` und `npm run preview` unter `http://localhost:4173` geprüft werden. Für installierbare native Entwicklungspakete muss der Entwicklungsklient mit Expo Crypto neu gebaut werden. Der Feature-Branch ist lokal gesichert, da das FaithPath-GitHub-Repository öffentlich ist. Die private Vorschau bleibt auf `oliva-507a582d5a9cc3a6`. [Lieferstatus](delivery-status.md)
