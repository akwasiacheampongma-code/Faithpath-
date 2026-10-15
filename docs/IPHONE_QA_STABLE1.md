# FaithPath – manuelle iPhone-Abnahme für STABLE1

**Status aller nachfolgenden Gerätetests: OFFEN.**
Diese Anleitung wurde vorbereitet, aber nicht auf einem iPhone ausgeführt.
Die QA-Site ist angelegt; ein FaithPath-Build ist dort noch nicht veröffentlicht.
Vor Beginn müssen Deployment und Zugang funktionieren.

## Testziel und Voraussetzungen

Feste, ausschließlich für Tests bestimmte Origin:
https://faithpath-stable1-qa-20261015.netlify.app

Netlify-Site-ID: `bea821b6-6f30-4385-8dca-c0f7150954d1`.
Die echte Produktionsseite `zesty-rolypoly-d11fff.netlify.app` gehört **nicht**
zu diesen Tests. Keine echten Journale, Backups oder Markierungen verwenden.

Der Release-Verantwortliche stellt zuerst POLISH1 und später STABLE1 auf genau
dieser Origin bereit. Dies ist ein neuer Vorwärts-Deploy auf der QA-Site; kein
Zurücksetzen oder Umschalten der echten Produktion. Noch nicht STABLE1
bereitstellen, bevor Testpersonen den POLISH1-Ausgangszustand bestätigt haben.

| Kennung | Erwartung |
|---|---|
| Ausgangsbuild | `FP4-20261006-G-POLISH1` |
| Zielbuild | `FP4-20261015-G-STABLE1` |
| Zielquellcommit | `6ce37acf164f3e048b5446f115d918274c789f25` |
| Ziel-Build-Hash | `8fefcc9b187b66c12b19444844b9f1e7c4671a5d5c4f8816ff36f6984fd9c4d0` |
| Content-Hash beider Builds | `812f002add339a256d807530d3509297678e41f9e27e381938e50036234c36b9` |

Die Build-ID steht unter **Mehr → Einstellungen**, am Ende der Seite.
Hashes kontrolliert der Release-Verantwortliche zusätzlich über die tatsächlich
ausgelieferten Dateien; die sichtbare Build-ID allein genügt nicht.

Benötigt werden ein physisches iPhone mit Safari und ein installierter
Home-Bildschirm-Eintrag, WLAN/Mobilfunk, Flugmodus und die Dateien-App. Das
Geräteprotokoll nennt Modell, iOS-Version, Sprache, Textgröße, freien Speicher
und Testzeitpunkt. Mindestens ein unterstütztes älteres iPhone/iOS und ein
aktuelles Gerät einplanen. Eine simulierte Auflösung ist kein Gerätetest.

Safari und installierte PWA jeweils separat abnehmen. Nicht voraussetzen,
dass beide Kontexte denselben Speicher oder dieselbe Anmeldung teilen.
Bei aktiver SSO-Sicherung legitim anmelden. Wenn eine Anmeldung oder ein
Redirect die Installation/Offlinefunktion verhindert, den Befund dokumentieren;
keinen Zugriffsschutz umgehen.

Keine Daten aller Safari-Websites löschen. Falls ein frischer Testzustand nötig
ist, ausschließlich die eindeutig identifizierte QA-Origin bereinigen. Bei
unklarer iOS-Zuordnung abbrechen und einen separaten Testkontext verwenden.

## Durchführung und Erwartungen

Pro Zeile das Ergebnis mit PASS / FAIL / OFFEN, Kontext Safari oder PWA,
Build-ID und Beleg notieren. Ein nicht ausgeführter Test ist niemals PASS.

### A. POLISH1 als Ausgangszustand vorbereiten — OFFEN

1. **Origin und Ausgangsbuild.** QA-Link in Safari öffnen, Domain prüfen,
   bei Bedarf per SSO anmelden. Unter Einstellungen POLISH1 bestätigen.
   Screenshot von Domain und Build-ID sichern. Bei anderer Version stoppen.
2. **Onboarding und erster Weg.** Einführung durchgehen, „Ich brauche
   Orientierung“ verwenden, eine Situation und Bibelstelle öffnen. Gedanken
   `QA-SAFARI-ALT: Ich möchte zuerst zuhören.` festhalten. Weg
   `QA-SAFARI-Geduld` und Schritt `Vor meiner Antwort kurz warten.` anlegen.
   Erwartung: Gedanke, Bibelstelle und Weg sind wieder auffindbar.
3. **Reader und Quiz.** Johannes 3 öffnen, OTB und Luther 1912 prüfen,
   Vers 1 markieren und eine Notiz `QA-SAFARI-Notiz-ALT` speichern.
   Zum Kapitelende scrollen, Kapitelquiz starten, alle fünf Fragen durchgehen.
   Sammlung öffnen und Abschlussstatus dokumentieren. Eine richtige und eine
   absichtlich falsche Auswahl prüfen: vier Antworten, Erklärung und genau
   eine richtige Antwort; keine Glaubensbewertung.
4. **Rückblick.** Zum Weg zurückkehren, einen Rückblick mit dem Text
   `QA-SAFARI-Rueckblick-ALT` speichern. Nur bewusst als persönliche Entwicklung
   bestätigen. Reines Abhaken eines Schrittes darf keine Entwicklung erzeugen.
5. **Backup und ungespeicherter Entwurf.** Unter Daten & Backup exportieren,
   Datei in Dateien speichern und als `QA-Safari-vor-Update.json` kennzeichnen.
   Danach neuen Gedanken `QA-SAFARI-ENTWURF-ALT` eingeben, Formular schließen,
   nicht speichern oder verwerfen. Auf Heute muss die Fortsetzung angeboten werden.
   Vorhandene Entwurfssicherung separat sichern, soweit die Oberfläche sie anbietet;
   ein normales Backup nicht ungeprüft als Entwurfssicherung behandeln.
6. **Offline-Ausgangszustand.** Online bleiben, bis Einstellungen ausdrücklich
   „Beide Bibeln und die App sind für dieses Gerät offline bereit.“ zeigen.
   Screenshot sichern. Flugmodus einschalten und WLAN ausschalten; kontrollieren,
   dass tatsächlich keine Verbindung besteht. Seite neu laden, beide
   Übersetzungen und einen weiteren Bibelabschnitt öffnen. Danach wieder online.
7. **Installation von POLISH1.** In Safari Teilen → Zum Home-Bildschirm.
   Vom neuen Symbol starten. Installationsname, Symbol und eigenständige
   Darstellung prüfen. POLISH1 dort bestätigen. Falls die Daten nicht geteilt
   werden, Schritte 2–6 im PWA-Kontext mit Präfix `QA-PWA-` wiederholen.
   Eigenes Vorher-Backup und eigenen Entwurf erzeugen. Offline-Bereitschaft
   insbesondere in diesem Kontext erneut abwarten.

**Zwischen-Gate:** Beide Kontexte laufen mit POLISH1, Vorher-Backups liegen vor,
Entwürfe sind ungespeichert, Offline-Status ist bereit. Erst dann meldet die
Testperson „bereit für STABLE1“ an den Release-Verantwortlichen.

### B. Tatsächlicher Wechsel auf derselben Origin — OFFEN

8. **STABLE1 bereitstellen.** Release-Verantwortlicher veröffentlicht das
   verifizierte STABLE1-Artefakt ausschließlich auf derselben QA-Site. Alte und
   neue Deploy-ID, Zeitpunkt, Commit und Hashprüfung ins Protokoll aufnehmen.
   Kein neuer Domainname und kein anderer Deploy-Permalink für die Testperson.
9. **Safari aktualisieren.** Mit Internet zur bestehenden QA-Sitzung zurückkehren,
   Seite bei Bedarf neu laden und auf Update-Hinweis warten. Vor Aktivierung
   müssen die bisherigen Texte/Wege erhalten bleiben. „Jetzt aktualisieren“
   wählen. Unter Einstellungen STABLE1 bestätigen. Bleibt der Hinweis auch nach
   erneuter Onlineöffnung aus, Uhrzeit/Schritte erfassen; nicht durch Löschen von
   Website-Daten eine erfolgreiche Aktualisierung vortäuschen.
10. **Installierte PWA aktualisieren.** Vorhandenes POLISH1-Symbol weiterverwenden.
    Online öffnen, Update annehmen, Zielbuild prüfen. App schließen und über das
    gleiche Symbol wieder öffnen. Daten, Anmeldung und Zielbuild kontrollieren.
    Die App nicht deinstallieren und neu installieren: Das wäre kein Update-Test.
11. **Datenvergleich.** In jedem Kontext vorherige Wege, Schritte, Rückblick,
    Journaltexte, Bibelnotiz, Markierung, Übersetzung und Quizstatus vergleichen.
    Ein Nachher-Backup exportieren; die fachlichen Daten einschließlich IDs und
    Wegzuordnungen mit dem Vorher-Backup vergleichen. Exportzeitpunkte dürfen
    unterschiedlich sein. Keine verschwundenen Einträge, doppelten Reflexionen
    oder neu begonnenen Quizstatus akzeptieren.
12. **Alter Entwurf.** Auf Heute „Entwurf fortsetzen“. Exakten alten Text und
    bisher gewählten Weg prüfen. Speichern, erneut öffnen und auf korrekte
    Zuordnung prüfen. Der gespeicherte Text bleibt erhalten; der eigene erledigte
    Entwurf wird entfernt. Bei einem Konflikt muss der andere Entwurf erhalten bleiben.

### C. STABLE1-Funktionen in Safari und PWA — OFFEN

13. **Journal und Bildschirmtastatur.** Neuen langen Text mit Absätzen, Umlauten,
    Emoji und einem sehr langen Wort eingeben. Tastatur öffnen, Auswahl ändern,
    Text bis zum Ende bearbeiten und zum Speichern scrollen. Speichern muss
    erreichbar sein; keine dauerhaft verdeckten Felder oder abgeschnittenen
    Dialoge. Formular auch quer/hoch drehen, Tastatur schließen und erneut öffnen.
14. **Entwurfsschutz.** Text `QA-ENTWURF-NEU` eingeben, schließen und einen anderen
    Editor starten. Fortsetzen / als Datei sichern / ausdrücklich verwerfen
    prüfen, ohne versehentlich das Original zu verlieren. Zuerst die Sicherung
    exportieren und in Dateien öffnen. Nach Reload und Schließen/Wiederöffnen
    der App muss der nicht verworfene Entwurf wieder aufnehmbar sein.
15. **Zwei Safari-Tabs.** Denselben gespeicherten Testeintrag in zwei Tabs
    bearbeiten. Tab A schreibt `QA-TAB-A`, Tab B danach `QA-TAB-B` und speichert.
    Erwartung: gespeicherter B-Text und A-Entwurf gehen nicht still verloren.
    Konflikthinweis und Exportoption prüfen. Nur synthetische Einträge verwenden.
16. **Reflexion und Notizrolle.** Eine Bibelnotiz bearbeiten, neue Worte noch
    nicht speichern, Notiz-an-der-Bibelstelle entfernen zunächst abbrechen.
    Worte müssen erhalten bleiben. In einem weiteren Versuch Rolle entfernen,
    alten Entwurf wieder aufnehmen und speichern: persönlicher Text bleibt,
    entfernte Notizrolle wird nicht ungefragt wiederhergestellt.
17. **Wegwechsel.** Zweiten Testweg anlegen. Eintrag von Weg A zu B umstellen.
    Journalansicht, Reflexion und beide Wege kontrollieren. Danach Zuordnung
    entfernen. Kein alter Link zu A/B darf widersprüchlich weiter angezeigt
    werden. Eintrag ohne Textverlust öffnen, bearbeiten und erneut speichern.
18. **Import/Export.** Nur mit Testdaten arbeiten. STABLE1-Backup über die
    Dateien-App exportieren. In einem frischen isolierten Testkontext importieren,
    Vorschau prüfen und Wiederherstellung bestätigen. Anzahl, Texte, Markierungen,
    Wegverbindungen und Quizstatus vergleichen. Anschließend eine Kopie mit
    beschädigtem JSON und eine mit `data.journal[0].pathIds` als Objekt statt
    Array importieren. Erwartung: klare Ablehnung, gespeicherte Daten und ein
    vorher angelegter Entwurf unverändert. Originaldatei nicht überschreiben.
19. **Reader und Sammlung.** Direkt Bibel öffnen, Buch/Kapitel wechseln,
    markierten Vers auswählen, Notiz erstellen und wiederfinden. Quiz vom Reader
    und von der Sammlung starten. Fünf Fragen bis Abschluss, Erklärungen,
    Rückkehrziel und Abschlussstatus nach Reload prüfen. Ein Kapitel ohne
    Fragen darf keine erfundenen Fragen anzeigen.
20. **Wege und Kontinuität.** Schritt bearbeiten/abhaken, Gedanken am Weg
    festhalten, späteren Rückblick speichern, Weg archivieren. Journaltexte
    müssen erhalten bleiben. Heute → letzter Gedanke → Weg → nächster Schritt
    ohne verlorene Verbindung durchlaufen. Baum zeigt dokumentierte Entwicklung;
    Schwert bleibt Darstellung des Bibellesens ohne spirituelle Wertung.
21. **Offline nach Update.** STABLE1-Offline-Bereitschaft abwarten. Flugmodus,
    WLAN aus, App vollständig aus dem App-Umschalter schließen und erneut vom
    Symbol starten. Beide Bibeln, bisher ungeöffnetes Buch/Kapitel, Sammlung,
    Quiz, Journal und Wege öffnen. Offline Gedanken speichern und App wieder
    starten. Text muss vorhanden bleiben. Danach online zurückkehren; keine
    Konflikt- oder Datenverlustschleife.
22. **Wiederkehr.** Testsitzung mindestens über eine längere Unterbrechung,
    zusätzlich nach Möglichkeit über Nacht, liegen lassen. App über ihr Symbol
    öffnen. Letzte Bibelstelle, letzter Gedanke, Weg, nächster Schritt und Entwurf
    überprüfen. SSO-Ablauf oder Betriebssystembereinigung als eigene Bedingung
    protokollieren; nicht pauschal als erfolgreich gewertet abhaken.

### D. Layout und Zugänglichkeit — OFFEN

23. **Kleine Ansichten.** 390 × 844 wurde lokal emuliert. Auf physischem Gerät
    tatsächliche CSS-Viewportgröße dokumentieren. 320 × 568 auf geeigneter Hardware
    oder ergänzend im Simulator kontrollieren und Simulator ausdrücklich als
    solchen markieren. Baum sichtbar, nächster Schritt durch Scrollen erreichbar,
    keine horizontale Seitenscrollleiste, vollständige Dialogaktionen.
24. **Safe Areas und Safari-Leisten.** Hoch/Querformat, ein-/ausgeblendete
    Adressleiste, Home-Indikator und feste Navigation prüfen. Letzten Inhalt
    vollständig nach oben scrollen können. In PWA keine abgeschnittenen Kopf-/
    Fußbereiche; mit Tastatur alle Speicher-/Schließen-Aktionen erreichbar.
25. **Hell/Nacht und Textgröße.** Beide Themen, große iOS-Textgröße und Safari-
    Seitenzoom prüfen. Text darf umbrechen; Inhalte und Aktionen nicht
    verschwinden. Reduzierte Bewegung einschalten; keine für Bedienung
    notwendigen Animationen oder unruhigen Übergänge.
26. **VoiceOver.** Heute, Hauptnavigation, Reader-Versauswahl, Notizformular,
    Importdialog, Quiz und Abschluss bedienen. Namen/Zustände werden verständlich
    vorgelesen; Dialogfokus bleibt sinnvoll, Schließen gibt Fokus zurück,
    Erklärungen und Fehlermeldungen sind erreichbar. Unerreichbare Kernaktionen
    als Blocker melden, keinen pauschalen Barrierefreiheits-PASS vergeben.

## Protokollvorlage

```text
Datum/Uhrzeit UTC:
Tester:
iPhone-Modell / iOS-Version:
Safari oder installierte PWA:
CSS-Viewport / Textgröße / Zoom:
QA-Origin:
Netlify-Site-ID:
POLISH1-Deploy-ID / Zeitpunkt:
STABLE1-Deploy-ID / Zeitpunkt:
Geprüfter Quellcommit:
Sichtbare Ausgangs-/Ziel-Build-ID:
Remote-Build-/Content-Hashprüfung durch:
SSO aktiv / Anmeldung erfolgreich:

Testnummer:
Status: OFFEN | PASS | FAIL
Genaue Schritte / Eingaben:
Erwartung:
Tatsächliches Verhalten:
Screenshot / Video / Backup-Datei:
Schweregrad bei Fehler:
```

Für alle 26 Testnummern beide Kontexte dokumentieren oder eine begründete
Nichtanwendbarkeit ausweisen. Installation selbst ist ein Safari→PWA-Übergang;
der Update- und Offline-Nachweis wird trotzdem pro Kontext geführt.

## Geräte-Gate und Abbruchregeln

**NO-GO** bei Datenverlust, widersprüchlicher Zuordnung, nicht wiederaufnehmbarem
Entwurf, falscher Build-/Inhaltsidentität, fehlgeschlagenem Update, unbrauchbarer
Offline-PWA oder unerreichbarem Speichern. Bei einem Datenfehler zuerst Backups
und genaue Schritte sichern; keine Bereinigung zum Verdecken des Fehlers.

**Noch kein GO**, solange ein Pflichtfall offen ist. Erst nach erfolgreichem
Hosted- und Geräteprotokoll ohne P0/P1 kann der Verantwortliche einen
Release-Kandidaten bestätigen. Diese Anleitung erteilt keine Produktionsfreigabe
und löst keinen Produktionsdeploy aus.
