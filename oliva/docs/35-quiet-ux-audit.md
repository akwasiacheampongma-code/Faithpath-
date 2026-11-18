# Weniger Oberfläche, mehr Tiefe · Audit und Freigabevorlage

Auftrag vom 18.11.2026. **Auditphase, keine neue Produktversion und keine pauschale Neugestaltung.** Die 0.18-App ist funktional unverändert. Die größere gestalterische Umsetzung wartet auf die ausdrücklich verlangte Nutzerfreigabe. Neue Funktionen, Cloud-Sync, KI, Audio und Zahlungen gehören nicht zu dieser Phase.

## Tatsächlicher Ausgangsstand

Kanonischer Checkout: `/workspace/faithpath-next`; im GitHub-Gesamtrepository liegt derselbe App-Teilbaum unter `oliva/`. Der saubere Ausgangscommit ist `e5750309786fc70dad4d3944206d55550d1c0699` mit der vollständigen 0.18-Abschlussdokumentation. Releasecode: `bc2c199921ba0a20e4d9436248db8f46d256e3ff`; GitHub-Releasecommit: `84527ef0b7e3c970b3c7e33bd758cd2fd28d06a0`, Tag `oliva-v0.18.0`. Dokumentationsbackup: `84d2232c2a771cf73a2cfd51a4f2e959159b194b` auf `docs/oliva-v018-delivery-20261117`.

Vor der Auditänderung wurde der wiederherstellbare lokale Tag `oliva-pre-quiet-ux-audit-20261118` erstellt; gearbeitet wird auf `feature/oliva-quiet-ux-audit-20261118`. Wiederherstellung in einem getrennten Checkout: `git worktree add /tmp/oliva-quiet-ux-baseline oliva-pre-quiet-ux-audit-20261118`. Keine historischen Tags ändern und keinen bestehenden Checkout hart zurücksetzen.

Live gelesen: alle 32 bisherigen Versionsrefs unverändert, GitHub-main weiterhin `d3f0c01adc8f1a67da79e4f0b4cbe5d99ca895b3`. CI 44124684188 / Job 134185116862 weiterhin abgeschlossen/erfolgreich. Die vorhandene 0.18-Abnahme enthält 343 Fachtests, 146 vollständige Browserfälle, statische native Exporte sowie den geprüften PWA-Wechsel. Das sind historische Prüfergebnisse des bezeichneten Releases, keine neu erfundenen Prüfungen dieses Audits.

Die private Vorschau unter `https://oliva-v04-private-preview.purplebean128.chatgpt.site` liefert weiterhin den 0.18-Hostmarker `oliva-5d647075614ace83`. Deployment `appgdep_6afc85fb56b8819195ae3d2b7859d32f` ist erfolgreich; Eigentümerzugang/custom, Richtlinie Revision 1, ein Nutzer, keine Gruppen oder externen Besucher. Die aktuellen HTTP-Messungen enthalten authentifiziert200 und anonym403. Die alte Annahme „nur401 ist eine Ablehnung“ wurde korrigiert; aus403 allein wird keine genaue Ablehnungsschicht abgeleitet. Es gab keine Änderung an der Zugangspolitik.

## Was tatsächlich geprüft wird

- Unveränderter Produktions-Webkontrollstand 0.18; keine Entwicklungsvorschau als Release ausgegeben.
- Alle fünf Hauptbereiche bei320,375,390,430 und1440CSS-Pixeln, Hell/Dunkel, mit leerem und gefülltem synthetischem Profil.
- Nachvollziehbare Ausgangsscreenshots und zwei **nicht ausgelieferte** Layoutstudien über dem echten DOM. Originalaktionen bleiben angeschlossen; die Studien sind keine abgeschlossene React-Native-Implementierung.
- Axe-Semantik-/Kontrastprüfung; Tastaturstichprobe und200%CSS-Textvergrößerung getrennt ausgewiesen. CSS-Vergrößerung ist kein Beleg für iOS-/Android-Systemschrift.
- Reader mit den realen maximalen Einstellungen, illustrierte Geschichte, Psalm und Briefabschnitt. Alle66Bücher/1189Kapitel, sieben Baumbilder, Sammlung, Offline-Neustart und unveränderte Testdatensätze.
- Bildinventar, Import-/Backupcode, Lockfile-Lizenzen, tatsächlich beobachtetes Netzwerk und private HTTP-Header.

Die Skripte liegen unter `scripts/audit-*.{mjs,py}`. Messungen und Originalfehlerberichte: `docs/evidence/quiet-ux-audit/`. Kein Simulator, physisches Telefon, VoiceOver/TalkBack, gehosteter Browser oder echter Einsteigertest wird als bestanden ausgegeben.

## Konkrete UX-Probleme und Prioritäten

| Priorität | Bereich | Geprüfter Ausgangsbefund | Kleine, überprüfbare Zieländerung |
|---|---|---|---|
| P1 | Heute | Begrüßung, Seitentitel, Untertitel und354pxHero erklären den Einstieg mehrfach. Weiterlesen und aktuelles Buch wiederholen sich; der Garten folgt mobil sehr spät.200%Text kann überlaufen. | Ein flexibler Lesebereich mit einer Hauptaktion; Landschaft erhalten, starre Hero-Höhe auflösen. Tagesvers und bestehende Wege freiwillig, Garten zurückhaltend erreichbar. Keine neuen Aussagen. |
| P1 | Bibel | Bei390px beginnt das erste Buch1089px unter dem Inhaltsanfang; die414pxSchwertkarte steht davor. Buchzeilen sind rund96px hoch. | Kompakte Weiterlesen-Zeile, frühere Suche/Filter,64px-orientierte Buchzeilen mit weiterhin mindestens44pxZielen. Hilfstexte und Schwert so platzieren, dass Lesen zuerst kommt. Wortlaut, Kontext, Quellen und alle Links bewahren. |
| P1 | Wege | Mehrere Einleitungen, Ablaufkarte, Filter und Vorhaben vor dem ersten Weg; dieser beginnt bei390px927px unter dem Inhaltsanfang. | Eine kurze Erklärung; vorhandene Filter, Wege/Lebensthemen klar benennen. Persönliche Vorhaben nach den Wegen weiter erreichbar. Nur ausgewählte Landschaftsbilder groß. |
| P1 | Sammlung | Vier verschieden breite Pillen brechen zufällig in mehrere Zeilen um. Lange Namen passen nicht in eine pauschal verkleinerte Viererspur. | Zwei begründete Varianten: bewusstes2×2Segment mit lesbaren Labels oder ein benanntes Auswahlfeld mit allen vier Originalbereichen. Suche, Entwürfe, Bearbeitung und alte Links erhalten. |
| P1 | Garten | Erklärungskarten konkurrieren mit Baum und Rückblicken; sieben Vorschauziele sind bei390px nur rund40px breit. | Originalbaum unverändert; persönliche/originale Historie vor langen Erklärungen.44pxZiele mit Umbruch statt enger Siebenerreihe. Keine neue Wachstumsregel. |
| P1 | Große Schrift |200%CSS-Text erzeugt im Heute-/Bibel-Bestand horizontalen Inhaltsüberlauf, obwohl die Dokumentbreite selbst nicht überläuft. | Flexible Höhen, Zeilenumbrüche und Aktionsanordnung prüfen; nicht nur die äußere Dokumentbreite testen. |
| P2 | Reader/Geschichten | Bestehende Funktionen werden auditiert; Bilder und typografische Zitate können den Einstieg verlängern. | Textzugang und Kapitelwechsel bewahren; Bild/Text-Verhältnis anhand echter Messungen entscheiden. Keine neue Bildserie oder weiterer Readerumbau vor Freigabe. |
| P2 | Offlinehinweis | „Dieser Browser unterstützt keinen Offline-Neustart“ wird in Produktions-Webansichten bei fehlender ServiceWorker-API angezeigt. Das kann auch eine Kontextbeschränkung sein. | Ursachen unterscheiden und kontextgenau formulieren. Tatsächliche Paket-/Updatefehler und endliche Wiederholungen weiterhin sichtbar lassen. Keine optische Unterdrückung. |

Maße sind Layoutmessungen im bezeichneten synthetischen390pxProfil, keine allgemeingültigen Gerätewerte. `first-layout-study/browser-audit.json` enthält den vollständigen ersten100-Fälle-Bestand; nachfolgende Änderungen betreffen ausschließlich die getrennten Gestaltungsvorschläge.

## Zwei größere Gestaltungsvarianten

**A · Inhalt zuerst (Empfehlung).** Bestehende fünf Bereiche und Navigation bleiben. Der Einstieg erhält einen flexibel hohen, kleineren Landschaftsbereich. Die Bibel zeigt zuerst Buchzugang und eine ruhige Liste; das eine Schwert und die Einordnung folgen als Begleitung. Wege beginnen früher, die Vorhaben bleiben darunter. Sammlung mit bewusstem2×2Segment, damit alle vier Bereiche unmittelbar sichtbar sind. Im Garten folgen die Rückblicke dem Originalbaum, die Erklärungen stehen dahinter. Vorteil: weniger Einleitungen und Konkurrenz, vertraute Ziele, keine zusätzliche Auswahlstufe. Nachteil: Die Schwertkarte liegt mobil weiter unten; diese Abwägung wird ausdrücklich zur Freigabe gestellt.

**B · Stärker geführte Auswahl.** Persönlicher formulierter Heute-Einstieg, kompakte Schwertkarte weiterhin vor den Büchern, zweispaltige Wegfilter, Auswahlfeld für die Sammlung. Vorteil: kleinere Auswahlflächen und das Schwert früher sichtbar. Nachteil: mehr Entscheidung vor dem Inhalt, ein zusätzlicher Auswahlvorgang in der Sammlung und deutlich spätere erste Buchzeile. Die heutigen Zahlen sprechen deshalb fürA. Keine neue Kategorie, kein Sammelobjekt und keine neue Funktion wird eingeführt.

Die Browserstudien ändern nur das temporäre Layout, verwenden Originaltexte/-bilder und reale vorhandene Handler. Die Auswahlfeldstudie inB delegiert an die vier vorhandenen Sammlungsbereiche. Ein Screenshot ist kein Implementierungs- oder Datenmigrationsnachweis. **Freigabe ist vor Übertragung der größeren Änderungen in die App erforderlich, weil Abschnitt13 des Nutzerauftrags dies ausdrücklich verlangt.**

## Bildwelt: Inventar und kleines Pilotset

Das vollständige technische Inventar umfasst144referenzierte Bilddateien:119A51-Dateien einschließlich Webvarianten und nativer Ebenen,20Erzähl-/Landschaftsvarianten, vier PWA-Symbole und das eine geistliche Schwert. Weitere18exportierte Bildbytes stammen aus Router-/Navigationspaketen. Das sind keine162unterschiedlichen Illustrationen. Alle in den qualifizierten Webexport aufgenommenen Bilder sind im bestehenden Offlinepaket registriert. Native Paketierung und tatsächlich geladene Gerätebilder sind getrennt ausgewiesen.

Datei, Einsatzstelle/Zeile, Buch/Kapitel bzw. Symbolzuordnung, Maße, Bytezahl, Hash, Export-/Offlinezuordnung, vorhandene Herkunft und offene Rechte stehen in `evidence/quiet-ux-audit/image-inventory.json` und `.md`. Ein nicht referenziertes `garden-1280.webp` wird nur vermerkt; Originaldateien werden nicht gelöscht. Die vorhandenen Metadaten enthalten weiterhin offene unabhängige Fach- und öffentliche Rechtefreigaben; ein Hash erteilt keine Lizenz.

Empfohlenes **bestehendes** Pilotset, ohne neue Generierung:

1. Galiläa aufHeute: flexibler Ausschnitt mit gut lesbarer Hauptaktion; keine zweite große Landschaft direkt darunter.
2. `NS-0203` „Schweig und verstumme“ (Markus4,35–41): vorhandenes Sturmbild, verständlicher Wechsel in den gemeinsamen Reader; Frage-/Reflexionsablauf unverändert.
3. `NS-0006` „Da gedachte Gott an Noah“ (1.Mose8,1–22): vorhandene Taube illustriert ausdrücklich nur8,6–12; Bildumfang nicht mit dem ganzen Abschnitt gleichsetzen.
4. `NS-0073` „Der HERR ist mein Hirte“ (Psalm23) und `NS-0349` „Ich schäme mich des Evangeliums nicht“ (Römer1,1–17): typografische Gestaltung als bewusste Vergleichsgruppe, kein Pflichtbild.

Abnahme: mobile Lesbarkeit, eindeutige Interpretation-/Quellenlabels, vollständiges Motiv ohne unpassenden Ausschnitt, keine Bildbarriere vor dem Text, Offlinefehler bleiben behandelbar. Keine hunderte neuen Bilder, keine 66-Buchschwerter.

## Sicherheit, Rechte und Datenschutz

Der heutige Produktionsaudit ist **nicht grün**: `production-audit.log` enthält eine neue High-ReDoS-Advisory für `picomatch`, GHSA-fc5q-39xc-vjpf, die über Abhängigkeiten33Pakete betrifft. Das ist eine unabhängige Advisory, nicht33verschiedene App-Lücken. Installiert sind u.a.2.3.2 und4.0.7; die Registry meldet beim Audit weiterhin4.0.7 als neueste Version. Ein reparierter Stand wird nicht behauptet. Kein `npm audit fix --force` und kein pauschales Expo-/React-Native-Downgrade. Betroffene Buildpfade und Erreichbarkeit müssen im nächsten kleinen technischen Schritt eingegrenzt und eine passende veröffentlichte Korrektur geprüft werden.

Die authentifizierten statischen Antworten enthalten beim Audit keinen CSP-, HSTS-, nosniff-, Referrer-, Frame- oder Permissions-Policy-Header. Die Zugangsseite kann andere Header liefern. Lokale `serve.mjs`-Header beweisen keine produktiven Header. Eine strikte CSP darf erst nach Prüfung der tatsächlichen Expo-/RN-Web-Skripte und Inline-Styles konfiguriert werden; keine erfundene erfolgreiche Härtung.

Lokale Daten: Browser-IndexedDB `oliva-local-v1/state`, nativeSQLite `oliva.db`, unverändertes AppDataV11, Dokument1, SQLite3 undIndexedDB1. Gedanken, Entwürfe, Studienantworten, Lesestand, Vorhaben und historische Originalquellen bleiben lokal. JSON-Exporte enthalten persönliche Inhalte und Originalarchive im Klartext; Übergeben an Download/OS-Teilen ist keine verschlüsselte Sicherung. Betriebssystem-/Hostingaufbewahrung ist nicht abschließend geprüft. Keine OLIVA-Cloud, KI-, Audio-, Zahlungs- oder Analyticsintegration wird ergänzt.

FaithPath-Import:10MiB, begrenzte Zahl/Größe von Datensätzen,200.000gescannte Knoten/maximale Tiefe40, Verbot von `__proto__`/`constructor`/`prototype`, Referenz-/ID-/Hashprüfung, Vorschau und Revision vor atomarem Schreiben. OLIVA-Restore:64MiB, strikt geprüfte Daten und explizite Ersetzungsaktion; Vorschau schreibt nicht. Alte Quellenarchive enthalten bewusst auch nicht normalisierte Originalfelder. Gültige große Dateien können dennoch Zeit und Speicher beanspruchen; kein bestandener Grenzlasttest auf Telefonen behauptet. Gezielte vorhandene Tests und der aktuelle343er-Lauf belegen die bezeichneten Fälle, keine allgemeine Penetrationstest-Freigabe.

Priorisierte Mängelliste und gekennzeichnete Betreiber-/Datenschutz-/Bildnachweisentwürfe: [Datenschutz und Rechte](quiet-ux/privacy-and-rights-drafts.md). Paket-/Lizenzinventar: `evidence/quiet-ux-audit/dependency-license-inventory.json`.

## Datenerhalt und Abnahmegrenze

Kein App-/Reader-/Datenmodell wurde für diese Auditphase geändert. Der bestehende Katalog mit66Büchern/1189Kapiteln,436Originaleinheiten/2479Fragen/436Impulsen,95Originalvarianten,1300separaten NT-Fragen,18Lebensthemen/45Stellen und den vorhandenen Wegen bleibt erhalten. Die sieben A51-Bilder, frühere FaithPath-Historie, Backup-/Restorefunktionen und alte Links werden weiter geprüft, nicht zurückgebaut.

Die Appprüfung verwendet ausschließlich neue synthetische Browserprofile. Die Betrachtung der fünf Bereiche und der Layoutstudien muss deren Rohdatensätze exakt unverändert lassen; erwartete Reader-Navigation oder ausdrücklich geänderte Prüfeinstellungen werden separat ausgewiesen. Der historische reale PWA-Versionswechsel0.17→0.18 bleibt als früherer Nachweis erhalten. Da dieses Audit keinen neuen Appbuild liefert, wird kein neuer App-Upgradepfad erfunden.

Nächster kleiner Schritt nach Freigabe: zuerst denHeute-Einstieg in einem eigenen nachvollziehbaren Commit umsetzen und bei320/375/390/430px, Hell/Dunkel und großer Schrift mit dem gesicherten0.18Stand vergleichen. Danach einzelnBibel, Wege, Sammlung und Garten. Sicherheitskorrekturen werden getrennt von Designänderungen nachvollziehbar gesichert. Der Gesamt-Master und die eigentliche Layoutumsetzung sind noch nicht abgeschlossen.

## Tatsächlicher Abschluss dieser Audititeration

Die [private Vergleichsansicht](https://oliva-v04-private-preview.purplebean128.chatgpt.site/review/quiet-ux/index.svg) ist als getrennte SVG/PNG-Review bereitgestellt. Der vorhandene Ein-HTML-Guard hat einen zweiten HTML-Einstieg korrekt abgelehnt, weil dieser SPA-Rückwege gefährden kann. Der Guard und die Appdateien bleiben unverändert; der lokale HTML-Entwurf wird nicht mit ausgeliefert. Alle 161 bisherigen Hostdateien sind bytegenau erhalten, einschließlich ServiceWorker und PWA-Paket. Die Review gehört nicht zum Offlinepaket.

Aktuell erneut ausgeführt: 343/343 Fachtests, Typecheck und sieben Inhaltsprüfungen bestanden. 100 Bestands-Layoutfälle, 100 finale A/B-Studien, 10 Bestands- und 20 Studien-Axe-Prüfungen ohne gemeldete Verstöße. Die zehn 200%-CSS-Textfälle zeigen die genannten realen Bestandsüberläufe. Ein zusätzlicher, dokumentierter Zeilenumbruchfix behebt einen 320px-Überlauf nur in Studie A; er ist keine heimliche Appänderung.

40 Reader-/Geschichtenfälle bei fünf Breiten und zwei Themen zeigen keinen horizontalen Inhaltsüberlauf. Die echten maximalen Reader-Einstellungen ergeben 33px gerenderten Bibeltext bei Einstellung30/Zeilenabstand2,1. Direkte Auswahl von Vers35 und36 sowie sichtbare Auswahlleiste sind erneut geprüft. Ein erster Diagnosefühler maß fälschlich den16pxWrapper und suchte eine nicht vorhandene Test-ID; der korrigierte Fühler prüft den tatsächlichen Textabsatz und die benannte Toolbar. Der erste Bericht bleibt erhalten und wird nicht als Appfehler ausgegeben.

Drei getrennte Offlinebedingungen sind tatsächlich beobachtet: normale ServiceWorker-Bereitschaft; bewusst entfernte API mit dem beanstandeten Hinweis; blockierte Registrierung mit ehrlichem Paketfehler. Offline-Neustart mit allen66Büchern und unveränderten Rohdaten besteht separat. Fünf Tastaturstichproben mit je zwölf Tabs sind dokumentiert. Kein allgemeiner Screenreader- oder Geräteerfolg wird daraus abgeleitet.

Offen bleiben die größere Layoutumsetzung und ihre anschließende vollständige Regression/PWA-Upgradeprüfung, native Reflow-/Systemschrift-/Hilfstechnologietests, picomatch-Korrektur/Erreichbarkeitsanalyse, produktive Schutzheader, Betreiberangaben und Inhalts-/Bildrechte. Es wurde kein neuer App-Produktionsbuild, kein nativer Installer und kein neuer Release-Tag erzeugt. Das ist die abgeschlossene Audit- und Freigabevorlage, nicht die abgeschlossene Gesamtabnahme des neuen Masters.

Die finale private HTTP-Prüfung bestätigt alle32neuen Reviewdateien bytegenau sowie sieben bisherige App-/Workerabrufe mit exakt ursprünglichenBytes; Reviewindex und Beispielbild bleiben anonym gesperrt. Zwei frühere strikte Durchläufe erhielten jeweils bei einer unterschiedlichen PNG-Datei stattdessen die2381Byte-App-Startdatei mitHTTP200. Die alten Fehlerberichte bleiben erhalten; der finale Prüfer erlaubt höchstens drei reine Leseabrufe, verlangt unverändert den exaktenSHA und protokolliert jeden Versuch. Die Ursache des intermittierenden Hosting-Fallbacks ist offen; kein gehosteter Browsertest wird daraus behauptet.


## Abschließender Sicherungs- und CI-Stand des Audits

Audit-Quellcheckpoint `6b8e9d8ae550075aea7a04bd4cc42781c9a41376`, GitHub `c3f1f736bbbd37d61d3b0d845cfc377c9767a18e` auf `feature/oliva-quiet-ux-audit-20261118` ist gesichert. Alle 32 Versionsrefs, geschützten Branches und 47 Nicht-OLIVA-Root-Einträge sind unverändert bestätigt. [Neue Audit-CI 44252369532](https://github.com/akwasiacheampongma-code/Faithpath-/actions/runs/44252369532) ist **rot**: `npm audit --audit-level=moderate` stoppt vor den nachfolgenden Prüfungen wegen derselben picomatch-Advisory. Mit Entwicklungsabhängigkeiten meldet sie 35 betroffene Pakete; der lokale Produktionsaudit meldet 33. Keine 35 unabhängigen Lücken und keine erfolgreich abgeschlossene neue CI behaupten. Tatsächliches Joblog und Ergebnis: `docs/evidence/quiet-ux-audit/ci/` im Projektroot. Der historische erfolgreiche 0.18-Lauf bleibt getrennt erhalten.

Die Appdateien sind weiterhin exakt 0.18. Die separate private Review ist erfolgreich bereitgestellt und anhand aller 32 neuen Dateihashes sowie sieben unveränderten App-/Workerantworten geprüft; der finale vollständige Durchlauf benötigte keine Retries. Die beiden früheren HTML-statt-PNG-Antworten bleiben als offener Hostingbefund dokumentiert. Kein erneutes Deployment für diesen Dokumentationsnachweis. Größere Gestaltung wartet auf Nutzerfreigabe von A/B gemäß Abschnitt 13; Gesamt-Master bleibt offen.

Diese abschließenden CI-Kennungen werden auf dem getrennten Dokumentationsbranch `docs/oliva-quiet-ux-audit-closeout-20261118` gesichert. Tatsächliche eigene/remote Abschlusscommits aus `/workspace/oliva-quiet-ux-audit-closeout.json` übernehmen, sobald erstellt. Kein Retagging und keine neue Appversion.
