# OLIVA · KISS Faith Journey · Abnahme der Variante A

Die freigegebene Variante A ist auf `feature/oliva-kiss-faith-journey` umgesetzt. Ausgangspunkt ist der Audit `9cff742` auf dem Notizen- und Passwortstand `5262a4a`. Der Laufzeitquellstand `298ce8e` erzeugt den Web-/PWA-Kandidaten `oliva-dc815901e80fb696`. Bei der lokalen Abnahme war noch Paket `oliva-507a582d5a9cc3a6` privat ausgeliefert. [Audit und freigegebener Entwurf](46-kiss-faith-journey.md)

## Was sich in der App geändert hat

| Bereich | Umsetzung |
| --- | --- |
| Erststart | „Gottes Wort entdecken“, „Deine Gedanken festhalten“ und „Deinen Weg wachsen sehen“ mit „Überspringen“ ab Schritt eins. Die Einführung erscheint automatisch bei fehlendem Profildokument am Einstieg Heute. Auch ein vorhandenes Profil ohne gesetzte Einführungsmarkierung bleibt von der automatischen Anzeige ausgenommen. Freiwilliges Wiederöffnen geht über „Einführung noch einmal ansehen“ in den Einstellungen. |
| Heute | „Lass deinen Glaubensweg wachsen.“ steht über der direkten Aktion „Jetzt Bibel lesen“ für Markus 4,35–41. Bei vorhandenem Lesestand öffnet „In der Bibel weiterlesen“ den bisherigen Abschnitt mit dem gespeicherten Versanker und Lesemodus. Das kompakter gerahmte Galiläa-Bild hat weiter seinen Herkunftshinweis. |
| Persönlicher Garten | Das echte aktuelle A51-Stadium erscheint auf Heute als ruhiges Bild unmittelbar unter der Leseaktion. „Meinen Garten ansehen“ öffnet den bestehenden Garten inklusive persönlicher Momente und früherer FaithPath-Momente. Die sieben Stadien und ihr bisheriges Wachstum bleiben maßgeblich. |
| Weitere Angebote | „Einen Weg entdecken“ und „Meine Notizen“ folgen auf den Baum. Tagesvers, aktiver Weg oder passende Wege, Tagesreflexion, die bisherige Einladung, Entwürfe und das aktuelle Buch bleiben erreichbar. Die Hauptnavigation behält ihre fünf Bereiche. |
| Reader | „Darüber nachdenken“ öffnet am Bibeltext eine vorhandene Frage zum exakten Abschnitt. Bei einem Abschnitt ohne passenden Impuls führt „Gedanken festhalten“ zur freien Notiz mit Bibelbezug. „Weiterlesen“ lässt die Reflexion freiwillig wieder schließen. Die bestehenden Verständnisfragen und der bestätigte Lesefortschritt bleiben eigenständig. |
| Notiz und Quelle | „Gedanken festhalten“ führt in den vorhandenen Editor mit aktivem Schreibfeld. Die verknüpfte Bibelstelle steht oberhalb des Texts und ist über „Optionen“ änderbar oder entfernbar. Innerhalb desselben Leseflusses führt der Quelllink zurück zum noch offenen Reader. Eine später geöffnete Notiz springt zum gespeicherten Abschnitt. Bei Geschichten und Wegen verknüpft der Editor die zugehörige vorhandene Frage. |
| Verständliche Begriffe | Die Sammlung erklärt, was sie wiederfindbar macht. „App-Sperre auf diesem Gerät“ beschreibt den Zugangsschutz. Beim verschlüsselten Export steht, dass das eigene Passwort die Datei schützt. |

## Vergleich der tatsächlichen App

Alle Aufnahmen stammen aus lokal ausgeführten Produktionspaketen mit synthetischen Profilen. Der linke Stand ist der tatsächlich zuvor verwendete Notizen-Build. Der rechte Stand ist die implementierte App. Der klickbare Etappe-A-Entwurf ist separat dokumentiert.

| Ansicht | Vorher | Nachher |
| --- | --- | --- |
| Heute · 320 × 568 | [Vorher](evidence/kiss-faith-journey/before-today-new-320.png) | [Nachher](evidence/kiss-faith-journey-final/after-today-light-320.png) · [Dunkel](evidence/kiss-faith-journey-final/after-today-dark-320.png) |
| Heute · 375 × 812 | [Vorher](evidence/kiss-faith-journey/before-today-new-375.png) | [Nachher](evidence/kiss-faith-journey-final/after-today-light-375.png) |
| Heute · 390 × 844 | [Vorher](evidence/kiss-faith-journey/before-today-new-390.png) | [Nachher](evidence/kiss-faith-journey-final/after-today-light-390.png) · [Dunkel](evidence/kiss-faith-journey-final/after-today-dark-390.png) |
| Heute · 430 × 932 | [Vorher](evidence/kiss-faith-journey/before-today-new-430.png) | [Nachher](evidence/kiss-faith-journey-final/after-today-light-430.png) |
| Heute · Rückkehrprofil | [Vorher](evidence/kiss-faith-journey/before-today-returning-390.png) | [Nachher](evidence/kiss-faith-journey-final/after-today-returning-390.png) |
| Einführung | [Vorher](evidence/kiss-faith-journey/before-start-390.png) | [Entdecken](evidence/kiss-faith-journey-final/after-intro-1-390.png) · [Nachdenken](evidence/kiss-faith-journey-final/after-intro-2-390.png) · [Wachsen](evidence/kiss-faith-journey-final/after-intro-3-390.png) |
| Bibelreflexion und Notiz | [Vorher](evidence/kiss-faith-journey/before-reader-reflection-390.png) | [Reflexion](evidence/kiss-faith-journey-final/after-reflection-390.png) · [Verknüpfte Notiz](evidence/kiss-faith-journey-final/after-linked-note-390.png) |

## Datenerhalt und Zugriff

Die App erkennt die Existenz des lokalen Profils beim vorhandenen Lesezugriff. Beim Abschluss einer echten Erstinstallation speichert sie nur das vorhandene Kennzeichen `onboarded` mit der üblichen Revisionserhöhung. Ein parallel gespeichertes Profil hat Vorrang. Die Option in den Einstellungen öffnet bei vorhandenen Profilen dieselbe Einführung ohne Schreibvorgang. Die Zugriffssperre bleibt der Navigation vorgeschaltet. Nach dem Entsperren öffnet ein Direktlink sein ursprüngliches Ziel.

Die gespeicherte Notiz verwendet dasselbe V12-Notizbuch und die vorhandenen Verknüpfungstypen. Texte und Wiederherstellungscodes kommen nicht in die neuen URLs. Eine neue Notiz verändert weder einen bestehenden Reflexionseintrag noch Lesebestätigungen oder das Baumstadium. `src/state/model.ts`, Kryptografie, Dateiformate, SQLite-Schema, IndexedDB-Schema und die gelieferte Bibel- und Story-Datenbasis sind identisch zum Ausgangsstand.

Die aktualisierten V11- und V12-Testprofile enthielten ein originales FaithPath-Archiv, eine Rückkehrsicherung, Lesezeichen, Markierungen, Lesefortschritt, einen Entwurf, eine Reflexion sowie gespeicherte Antworten. Bei V12 kam eine bestehende Notebook-Notiz hinzu. In beiden Paketwechseln blieben die vier geprüften IndexedDB-Rohdatensätze bytegleich, auch nach Offline-Neustart, Exportvorschau und App-Entsperrung. [V11-Update](evidence/kiss-faith-journey-final/pwa-upgrade-v11.json) · [V12-Update](evidence/kiss-faith-journey-final/pwa-upgrade-v12.json)

## Lokales Webpaket

Das Archiv `/workspace/oliva-kiss-faith-journey-web.tar.xz` enthält die beiden tatsächlich ausgeführten Webpakete in `before` und `after`. Nach dem Entpacken wurden beide vollständigen Verzeichnisse byteweise mit den jeweiligen Build-Ausgaben verglichen. SHA-256 des Archivs `4f9e7ef601d9fa0299f42f2aaceb1b4fe3ef34ceac045560360e6fff14b3d89e`.

Der lokale Browser kann das ausgepackte Paket starten. Im Projektordner `PORT=4173 node scripts/serve.mjs /pfad/zum/entpackten/after` ausführen und im selben Rechner `http://localhost:4173` öffnen. Die App speichert das Browserprofil je Ursprung. Für getrennte Prüfprofile unterschiedliche Browserprofile oder Ports verwenden.

## Teststand und bekannte Grenzen

| Prüfung | Tatsächliches Ergebnis |
| --- | --- |
| TypeScript und Fachtests | TypeScript bestanden. 359 von 359 Fällen in 41 Dateien. Vier zusätzliche Fälle prüfen Erststart, vorhandenes Profil ohne Einführungskennzeichen, konkurrierenden Profilstand und Kontextlink-Validierung. [TypeScript](evidence/kiss-faith-journey-final/typecheck-final.log) · [Fachlauf](evidence/kiss-faith-journey-final/fachtests-final.log) |
| Vollständiger Produktions-Browserlauf | 184 Fälle aus allen Spezifikationen ausgeführt. 182 bestanden im Gesamtlauf. Zwei Core-Fälle bestanden anschließend gezielt mit korrigiertem Navigationsabgleich und passendem Zeitbudget. Derselbe Produktionsbuild. Null übersprungene Fälle. Darunter Offline-Neustart, V11-/V12-Sicherungen, verschlüsselte Exporte und Importe, App-Passwort, Wiederherstellungscode und geschützte Direktlinks. [Browserbericht](evidence/kiss-faith-journey-final/browser-acceptance.json) · [Gesamtlauf](evidence/kiss-faith-journey-final/browser-full.log) · [Wiederholung](evidence/kiss-faith-journey-final/core-acceptance.log) |
| Smartphone-Layout und Tastatur | Acht Fälle für 320, 375, 390 und 430 px jeweils in Hell und Dunkel. Leseaktion vollständig erreichbar und Baum bereits im ersten Bildschirm. Bei 200 Prozent simulierter Textgröße bleiben die Inhalte horizontal passend und die Aktion fokussierbar. Acht axe-Scans der Heute-Ansicht ohne gemeldete Verstöße in den geprüften Regeln. [Layoutprotokoll](evidence/kiss-faith-journey-final/layouts.json) |
| Inhalte und Webproduktion | Sieben von sieben Inhaltsprüfungen. Die Bibel enthält 66 Bücher und 1.189 Kapitel. Alle 436 Originaleinheiten, 2.479 Fragen und 436 Reflexionen sowie die sieben A51-Stadien bleiben enthalten. 135 Dateien stehen im PWA-Cachemanifest. Das einzelne geistliche Schwert ist im Produktionsbundle vorhanden. [Inhalte](evidence/kiss-faith-journey-final/content.log) · [Web-/PWA-Build](evidence/kiss-faith-journey-final/web-final.log) · [Schwert](evidence/kiss-faith-journey-final/spirit-runtime.json) |
| Statische Android-/iOS-Prüfung | Beide Expo-JavaScript- und Assetexporte bestanden. 148 verifizierte Metadatenreferenzen für Android und 145 für iOS. Das vorhandene Bildmaterial und der komplette Lebensthemenkatalog sind in beiden Paketen nachgewiesen. [Native Exporte](evidence/kiss-faith-journey-final/native-static.json) · [Themendaten](evidence/kiss-faith-journey-final/native-topics.json) |
| Abhängigkeiten | Beim aktuellen `npm audit --audit-level=moderate` wurden null bekannte Funde gemeldet. [Audit-Ausgabe](evidence/kiss-faith-journey-final/npm-audit.json) |

Im ersten gezielten Layouttest ragte der vergrößerte Text „Sammlung“ bei 320 px über den Bildschirmrand. Die für das Endpaket korrigierte Breitenbegrenzung lässt die Navigationsbeschriftung in ihrer Spalte umbrechen. Der Gesamtlauf verwendete bereits das korrigierte Paket. Bei den beiden Core-Fällen betraf der Nachlauf den Test selbst. Ein Test wartet nach dem Wege-Einstieg auf den tatsächlich sichtbaren Reader. Der andere überspringt die neue Einführung vor der Prüfung der Startseite und hat genügend Zeit für die vielen Ansichten und axe-Scans.

## Ladezeit im Labor

Die Kontrollmessung und die Kandidatenmessung liefen nacheinander mit Chromium 155 bei 390 × 844 Pixeln, vierfach gedrosselter CPU, 150 ms simulierter Latenz und 1,6 Mbit/s Download. Pro Paket und Route wurden drei frische Kontexte mit deaktiviertem HTTP-Cache und blockiertem Service Worker verwendet. Gemessen wurde bis zur sichtbaren Aktion beziehungsweise bis zum sichtbaren Fließtext. [Kontrollpaket](evidence/kiss-faith-journey-final/timing-recheck-control.json) · [Kandidat](evidence/kiss-faith-journey-final/timing-recheck-candidate.json)

| Median aus drei Kaltstarts | Ursprünglicher Audit | Kontrollpaket in der Wiederholung | Variante A in der Wiederholung |
| --- | --- | --- | --- |
| Erste sichtbare Aktion | 16,05 s | 16,91 s bis zur Heute-Leseaktion | 16,56 s bis zu „Weiter“ in Schritt eins |
| Direkte URL zu Markus 4,35–41 | 15,64 s | 16,99 s bis zum Fließtext | 16,51 s bis zum Fließtext |

Im ersten Kandidatenlauf lagen die Mediane bei 16,86 s und 16,81 s. Der direkte Reader war dort gegenüber dem ursprünglichen Audit 1,17 s später sichtbar. Die anschließende Wiederholung beider Pakete zeigte beim Reader einen Unterschied von 0,48 s zugunsten des Kandidaten. Die übertragene Datenmenge bis zum direkten Bibeltext stieg um rund 1,5 kB. Aus der Schwankung lässt sich weder ein stabiler Zeitgewinn noch ein stabiler Zeitverlust ableiten. Auf Heute fällt die frühere Zwischenseite zwischen Leseaktion und Reader weg. [Auditmessung](evidence/kiss-faith-journey/baseline-timing.json) · [Erster Kandidatenlauf](evidence/kiss-faith-journey-final/timing-first-candidate.json)

## Empfehlung zur privaten Abnahme

Den vorliegenden Stand nach Freigabe zunächst privat mit synthetischem Prüfprofil auf einem iPhone und einem Android-Gerät ausprobieren. Vorrang haben der überspringbare Einstieg, der gespeicherte Versanker, die erste verknüpfte Notiz, ihr Quelllink und ein Neustart im Flugmodus.

Chromium im Labor prüft die Bedienfolge, Rollen, Beschriftungen und technische Darstellung. Nutzerbeobachtung zur Verständlichkeit innerhalb von fünf Sekunden, echte Geräteprüfungen sowie VoiceOver und TalkBack stehen aus.

Nach separater Freigabe wurde der Stand als private Sites-Version 26 bereitgestellt. Der Host verwendet angepasste Assetpfade. Die HTTP-Prüfung bestätigt Paket, Zugriffsgrenze und Direktlinks. Für den Hoster stehen erneute Bedienprüfungen im Browser und auf dem Gerät noch aus. [Private Vorschau](https://oliva-v04-private-preview.purplebean128.chatgpt.site/) · [Bereitstellungsnachweis](evidence/kiss-faith-journey-final/private-delivery.json)
