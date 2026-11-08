# Römer · Schwert der Gnade · Vorbereitung für OLIVA 0.9

Am 08.11.2026 tatsächlich mit dem OpenAI-Bildwerkzeug erstellt: genau ein neuer Pilot auf Grundlage der projektinternen Johannes-Referenz. **Noch keine Appintegration**, keine Änderung an OLIVA0.8, keine PWA-Cache-/Daten-/Fortschrittsänderung, kein Deployment. Die bestehende FaithPath-App und der Johannes-Master bleiben unverändert.

Das Römermotiv **„Brücke“** bleibt erhalten. Ein flacher bogenförmiger Quersteg mit einer kleinen offenen Mitte und ein einzelner Olivenzweig übertragen Verbindung und Frieden in eine eigenständige Bildidentität. Warme Silberklinge, zurückhaltende Goldlinie, gealtertes helles Messing und olivgraues Leinen gehören zur bestehenden OLIVA-Familie. Anders als bei Johannes enthält der Zweig keine Weinblätter. Das Motiv zeigt weder Kampf noch Menschen, Gewalt, Trophäen, Ranglisten oder magische Effekte.

Diese Gegenstände werden nicht im Römerbrief beschrieben. Es handelt sich um freie künstlerische Symbolik, keine historische Waffenrekonstruktion, kein Bibelzitat und keine geistliche Autorität. Der allgemeine Schwertbezug aus Epheser6,17 ist von den Themen des Römerbriefs getrennt zu erläutern. Aktivität in der App verdient keine Gnade oder Liebe Gottes.

## Quellen und redaktioneller Vorschlag

Die tatsächlich gelesenen Luther-1912-Verse aus `src/data/bible.json` sind unverändert in [pilot.json](pilot.json) erfasst, einschließlich Korpus-SHA-256:

- **Römer3,23–24:** Paulus spricht von der gemeinsamen menschlichen Situation und davon, „ohne Verdienst“ aus Gnade gerecht zu werden.
- **Römer5,1:** Paulus verbindet Gerechtwerden durch Glauben mit Frieden mit Gott durch Jesus Christus.
- **Römer8,1:** Eine weitere ausdrücklich genannte Lesestelle zur fehlenden Verurteilung derer, die in Christus sind; zitiert wird die historische Luther1912-Fassung, keine moderne Mischübersetzung.

Kurzer **redaktioneller Entwurf**, noch unabhängig zu prüfen: „Paulus entfaltet Gnade, Vertrauen und ein erneuertes Leben. Der ruhige goldene Bogen und der Olivenzweig nehmen Verbindung und Frieden als künstlerisches Bild auf. Sie stehen für ein Geschenk, das nicht durch Appaktivität verdient wird.“ Christliche Auslegungstraditionen setzen bei Rechtfertigung unterschiedliche Akzente; die knappe Kunstbeschreibung löst diese Fragen nicht abschließend.

## Tatsächliche Dateien und Prüfungen

- [Unveränderter Master](masters/romans-grace-pilot.png): **1024×1536RGBA**,1.258.433Byte, SHA-256`3a4b4c77c322972310198e94971c0bec81dd09d0dea8ef3038fdac8a6fe49839`.
- [Vollständiger tatsächlich verwendeter Prompt](prompt.txt) und [Metadaten/Quellen/Rechtegrenzen](pilot.json).
- [Echter Hell-/Dunkelvergleich mit Johannes](background-review.png), über CSS-Hintergründen aus unveränderten Original-PNGs in lokalem Chromium gerendert und angesehen. [Browser-Decodenachweis](background-review.json). Kein Produkt-Mockup, kein nativer Screenshot, keine Geräte- oder Simulatorprüfung.
- [Drei transparente technische PNGs](technical-variants.json):256×384 **32.197Byte**,512×768 **108.959Byte**,768×1152 **232.760Byte**; zusammen **373.916Byte**. Vollständiges RGBA-Lanczos-Resizing, kein Ausschnitt, keine Retusche, keine kreative Bearbeitung oder Hintergrundentfernung. Jede Datei wurde tatsächlich dekodiert und pixelgenau mit dem skalierten RGBA-Puffer verglichen.
- [Zweiter Prüflauf](variant-reproducibility.json): bytegenaue reproduzierte PNGs; Master unverändert. [Zusammenfassung](validation-summary.json).
- Originalausgabe bleibt unter `/workspace/generated_images/exec-0304c4e6-f361-45a6-b432-aa502f2b1cc5.png` erhalten. Die Masterkopie ist bytegleich.

Die direkte `file://`-Prüfung wurde durch die verwaltete Chromiumrichtlinie blockiert. Für den später erfolgreichen Bildvergleich wurden unveränderte PNGs über einen kurzlebigen Loopback-HTTP-Server geladen; Flags und Richtlinien wurden nicht verändert. Der Server ist nach der Aufnahme beendet.

## Reproduktion und nächste Abnahme

Mit Python3 und der vorhandenen Pillow13.0.0-Installation:

```sh
python3 scripts/prepare-variants.py --check
node scripts/capture-review.mjs
```

Die normale Variantenableitung ohne `--check` schreibt nur `variants/` und `technical-variants.json`. `--check` vergleicht neu im Speicher kodierte PNGs mit den vorhandenen Dateien, ohne sie umzuschreiben. Der Browserharness verwendet derzeit die Playwright-Installation des unabhängigen OLIVA-Arbeitsbereichs; nach Übernahme ist dieser lokale Importpfad anzupassen.

Vor Runtimeeinbindung: gemeinsame typisierte Assetdaten auf mehrere Piloten erweitern; 16 Römerkapitel ausschließlich aus bestätigten OLIVA-Lesedaten darstellen; eine zum neuen Master registrierte Lichtspur getrennt vom gemalten Schmuck anlegen; Ladefehler/Retry und verspätete Buchwechsel, reduzierte Bewegung, Offline-Erstbesuch, Schriftvergrößerung sowie320/390/1440Ansichten prüfen. Johannes und alle66kompakten Vektoren bleiben erhalten. Bildbetrachtung und technische Ladevorgänge dürfen keinen Fortschritt erzeugen.

Rechte-/historische/theologische und unabhängige Designfreigaben bleiben offen. Generiert unter den Anbieterbedingungen für dieses Projekt; die GitHub-Quellensicherung folgender Versionen wurde am08.11.2026 autorisiert. **Keine öffentliche Web-/Storeveröffentlichung freigegeben.** Das ist Vorbereitung für0.9, kein abgeschlossenes0.9-Feature und keine Gesamtfertigstellung des Master-Prompts.
