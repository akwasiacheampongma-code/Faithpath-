# Bibel und Wege · mobile Übersichtlichkeit

Auftrag vom18.11.2026: ausschließlich die Übersichten **Bibel** und **Wege** verbessern. Arbeitsstand auf0.18-Basis, keine neue Versionsnummer, kein Retagging, kein GitHub-main-Merge und keine öffentliche Website-/Storeveröffentlichung. Der Gesamt-Master bleibt offen.

## Ausgangsstand und Wiederherstellung

Eigener Ausgangscommit `a7ce6003b0b9992cd0e188c7ec33408160620abb`, zugehöriger GitHub-Dokumentationsstand `f89df509ad353ccefa7f2955e87dedb76a17d40e`. Der zuvor ausgelieferte Heute-Stand bleibt erhalten. Eigener Feature-Branch: `feature/oliva-bible-paths-focus-20261118`. Wiederherstellbarer Ausgangstag: `oliva-pre-bible-paths-focus-20261118`; zum Vergleich einen getrennten Worktree anlegen, keinen bestehenden Checkout zurücksetzen.

Der formale0.18-Release und sein historischer erfolgreicher CI-Lauf bleiben unverändert. Die neuere bekannte picomatch-Advisory wird dadurch nicht zu einem bestandenen aktuellen Audit. Quellen-, Build- und Nachweisidentitäten werden getrennt geführt.

## UX-Befund und kleine Umsetzung

Vorher stand die große Schwertkarte auf dem Smartphone vor sämtlichen Büchern.96px-Buchkarten wiederholten dieselbe Buchdekoration. Die Wegeübersicht stellte mehrere Einleitungen, eine Ablaufkarte, fünf Filter und eine Vorhabenkarte vor den ersten Weg. Der erste nutzbare Inhalt lag weit unter dem ersten Bildschirm.

Die freigegebene RichtungA aus dem Ruhe-UX-Audit wird ausschließlich auf diese beiden Übersichten übertragen. Farben, Schriften, bestehende Landschaften und alle Ziele bleiben erhalten.

- **Bibel:** kompaktere Weiterlesen-Karte mit tatsächlicher Lesestelle, kürzere Modusschalter, früh sichtbare Buchsuche und gesamteBibel/NT/AT.68px-Buchzeilen mit Buchname, Kapitel-/Lesestand und eindeutiger Öffnung. Die vorhandenen Kapitel folgen sofort auf das aufgeklappte Buch; Beschreibung und Buchübersicht bleiben dahinter erreichbar. Alle66Bücher bleiben in ihrer bisherigen Reihenfolge.
- **Ein geistliches Schwert:** unverändertes Original, unveränderte Quellenzuordnung und wörtlicher Epheser-Auszug mit Reader-/Kontextlinks. Mobil hinter der Buchliste; auf großen Displays weiterhin als Seitenbereich. Keine Sammlung, Freischaltung, Animation oder Fortschrittsmechanik.
- **Wege:** eine kurze Einleitung, dieselben fünf Kategorien in einem Auswahlfeld, kompakte direkte Zugänge zu18Lebensthemen und persönlichen Vorhaben. Neun niedrigere mobile Listeneinträge mit Originaltitel, Untertitel, Kategorie, Bild, Dauer/Schritten und vorhandenem Fortschritt. Die bisherige ausführlichere Ablauf-/Vorhabenerklärung folgt unter der Liste. Desktopkarten bleiben erhalten.
- **Große Schrift:** ausgewählte Filterwerte dürfen umbrechen. Das wirkliche HTML-Auswahlfeld bleibt für Tastatur und Hilfstechnologien zuständig; die sichtbare Kopie ist `aria-hidden`. Der bestehende gemeinsame Bibelbereichsfilter ändert sein Standardlayout nicht; nur der Bibel-Hub aktiviert die neue Inlinevariante.

Eine zusätzliche Messung zeigte tatsächlich abgeschnittene lange AT-/NT-Auswahlnamen bei30px-Text. Der Umbruch behebt diesen Befund, ohne die Schrift zu verkleinern oder die Filter umzubenennen. Native Auswahl und Abbruchdialog bleiben plattformgerecht; eine Geräteabnahme wird nicht daraus abgeleitet.

## Vergleichbare Aufnahmen

Echte lokale Chromium-Aufnahmen des Produktionsbuilds, keine Mockups: identische synthetische Profile, feste Zeit18.11.2026/09:00UTC, geladene Originalbilder/Schriften und Offlinebereitschaft.32normale Fälle vor und32nach der Änderung: zwei Bereiche, vier Breiten, zwei Farbschemata, leerer bzw. gefüllter Bestand. Zusätzlich je16Fälle mit200%CSS-Text. CSS-Vergrößerung ist keine Prüfung der iOS-/Android-Systemschrift.

| Breite | Erstes Buch vorher → nachher | Erster Weg vorher → nachher | Buchzeile vorher → nachher | Erste Wegekarte vorher → nachher |
|---|---|---|---|---|
|320px|1289 →480px|1124 →384px|96 →68px|300 →162px|
|375px|1183 →456px|1000 →360px|96 →68px|282 →162px|
|390px|1164 →456px|1000 →360px|96 →68px|282 →162px|
|430px|1143 →456px|952 →360px|96 →68px|282 →143px|

Positionen beziehen sich auf die obere Viewportkante im hellen gefüllten Profil. Das sind keine Zeitmessungen oder Ergebnisse echter Einsteigerstudien. Auch320px behält lesbare Schrift und große Ziele; es wird nicht die gesamte Buchliste in einen Bildschirm gepresst.

[Vergleichsgalerie](../design-previews/bible-paths-focus/index.svg) · [Bibel hell](../design-previews/bible-paths-focus/bibel-light.svg) · [Wege hell](../design-previews/bible-paths-focus/wege-light.svg). Die ausgelieferte private Galerie wird unter `/review/bible-paths-focus/index.svg` bereitgestellt. Rohaufnahmen: `evidence/bible-paths-focus/screens/`; Messwerte: `before.json`, `after.json`, `comparison-assessment.json`.

Heute, Garten und Sammlung sind quellenidentisch zum gesicherten Heute-Ausgangsstand. Fünf der sechs Kontrollbilder sind bytegleich. Im dunklen Garten unterscheiden sich22Pixel am Antialiasing-Rand unter dem Baum; beide Aufnahmen wurden angesehen, Begrenzung `(170,633)–(220,635)`, keine Layout-/Quelländerung. Eine ursprüngliche zu strenge Bytegleichheitsprüfung bleibt mit ihrem Fehler unter `pre-wrapping-select/` erhalten. Diese Abweichung wird nicht als vollständige Bildgleichheit ausgegeben.

## Geänderte Laufzeitdateien

`app/bibel.tsx`, `app/wege.tsx`, die beiden Plattformdateien von `BibleScopeSelect` sowie die neuen wegespezifischen `PathListItem.tsx` und `PathCategorySelect.tsx`/`.web.tsx`. Der gemeinsame `PathCard`, Shell, UI-Grundbausteine, Heute, Garten, Sammlung, Reader, Kataloge, Bilder, Datenmodelle und Speichercode bleiben unverändert. Keine neue Abhängigkeit.

347Runtimeinputs, SHA-256 `3b0a8ec676efb9e15a341002fd1ccd2a4a4c6c990b3c45360bb0cb01fa5c52fd`; Produktionskern `oliva-d5c8bc2a00df2334`. Dateiweise Hashes und vollständige Exportliste: `evidence/bible-paths-focus/runtime-inputs.json` und `export-inputs.json`. Ein umgeschriebener privater Host hat einen eigenen Buildmarker.

## Datenerhalt und Prüfungen

Alle66Bücher/1189Kapitel,436Originaleinheiten/2479Fragen/436Impulse,1300separate NT-Fragen, neun Wege,18Lebensthemen und sieben A51-Stadien bleiben erhalten. Keine Migration: AppDataV11, Dokument1, SQLite3, IndexedDB1. Kein Fortschritt durch Ansehen, Filtern oder Aufklappen. Der Reader aktualisiert weiterhin nur seine reguläre Leseposition bei tatsächlicher Navigation.

343 von 343 Fachtests, Typecheck, sieben Inhaltsprüfungen und der Produktionsbuild sind bestanden. Der abschließende Browserlauf nach der Korrektur der Filteranzeige bestand mit 33 von 33 Fällen. Der lokale PWA-Wechsel vom privaten Heute-Stand auf diesen Build bewahrte alle vier gespeicherten Rohdatensätze. Bücher, Wege, Baum und ursprüngliche FaithPath-Momente blieben offline verfügbar.

Die Browserfälle umfassen vier Breiten, beide Themen,200%Text einschließlich langer Filterwerte und Psalm150, tatsächliche Tastaturwege, alle66Bücher/1189Kapitel, sämtliche alten Buchlinks, neun Wege und ihre Filter, Epheser6,17 und6,10–18, Offline-Neustart sowie Geschichten-/Heute-Regressionen. Synthetische Rohdatensätze werden unabhängig vom Appdecoder verglichen.

Erste Testhelferfehler bleiben dokumentiert: nativer Node-JSON-Import im neuen Test wurde durch den Vergleich mit tatsächlichen ursprünglichen AccessibleNames ersetzt; strikt indizierte Testarrays wurden typisiert. Die kleine Abstandsprüfung korrigierte einen6pxangeschnittenen Filter bei320px. Keine grünen Prüfungen für fehlgeschlagene Läufe behaupten.

## Offene Grenzen

Die unabhängige Advisory `GHSA-fc5q-39xc-vjpf` ist weiterhin offen. Die aktuelle Quellen-CI wird gesondert beobachtet; lokale Browser-/Fachprüfungen sind keine grüne Gesamtabnahme. Frühere Hostingantworten mit HTML statt Assetbytes bleiben ein bekannter Befund; die neue private Lieferung erfordert exakte Dateihashes, nicht lediglich HTTP200.

Keine gehostete Browser-QA mangels unterstütztem CUA-Werkzeug. Die ausdrücklich verlangte lokale Expo/PWA-Projektprüfung verwendet die vorhandene Playwright-Suite. Kein iPhone-/Android-Gerät, kein Simulator und kein VoiceOver/TalkBack wurden geprüft. Öffentliche Inhalts-/Bildrechte und Betreiber-Rechtstexte werden nicht neu freigegeben. Keine neuen Illustrationen oder geistlichen Inhalte.

Nächster kleiner Schritt: die beiden ausgelieferten Übersichten auf einem echten Smartphone mit großer Systemschrift und VoiceOver/TalkBack prüfen. Änderungen an anderen Hauptbereichen gehören nicht zu diesem Auftrag. Der ursprüngliche Master ist nicht insgesamt abgeschlossen.

Die abgenommene Fassung floss in den privaten Arbeitsstand vom 18.11.2026 um 11:25 UTC ein. Der Quellstand wurde zuvor getrennt auf GitHub gesichert. Die unabhängige CI stoppte bei der bereits dokumentierten picomatch-Advisory. [Privater Vergleich](https://oliva-v04-private-preview.purplebean128.chatgpt.site/review/bible-paths-focus/index.svg) · [Separater GitHub-Stand](https://github.com/akwasiacheampongma-code/Faithpath-/tree/feature/oliva-bible-paths-focus-20261118/oliva) · [CI-Lauf](https://github.com/akwasiacheampongma-code/Faithpath-/actions/runs/44290174565)
