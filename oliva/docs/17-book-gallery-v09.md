# Buchbilder und Startseite · OLIVA 0.9

0.9 integriert Römer als zweites großes Buchbild. Johannes und alle 66 kompakten Vektorschwerter bleiben erhalten. Keine Bildansicht, Wiederholung oder Buchnavigation verändert persönliche Daten oder bestätigt eine Lesung. Der vollständige Master-Prompt ist weiterhin offen.

## Gestaltung und Quellen

Der Römer-Master ist eine tatsächlich generierte Referenzbearbeitung des eigenen Johannes-Masters, keine historische Waffenrekonstruktion. Der Bogen erinnert frei an eine Brücke und der Olivenzweig an Frieden. Römer 3,23–24, 5,1 und 8,1 tragen die Einordnung von Gnade und Frieden; diese Verse beschreiben keine solche Waffe. Alle vier zitierten Verse wurden gegen den unveränderten Luther-1912-Korpus geprüft.

Unveränderter Master: `art/swords/romans-grace/masters/romans-grace-pilot.png`, 1024 × 1536 RGBA, SHA-256 `3a4b4c77c322972310198e94971c0bec81dd09d0dea8ef3038fdac8a6fe49839`. Drei transparente technische PNGs mit 256/512/768 Pixeln haben zusammen 373.916 Byte. Die sechs Johannes-/Römer-Varianten zusammen benötigen 762.431 Byte. Reines Verkleinern erhält das vollständige Bild; Originale, Prompt, Quellen, Reproduktions- und Hintergrundprüfungen bleiben erhalten. Historische Generationsangaben beschreiben den damaligen Vorbereitungsstand. Die aktuelle Runtime-Herkunft steht in `art/swords/runtime-index.json` und den dort referenzierten Manifesten.

Interne Implementierungsprüfung ist keine unabhängige theologische/historische oder allgemeine öffentliche Produktfreigabe. Die ausdrücklich autorisierte GitHub-Quellensicherung ändert den eigentümerprivaten Webzugriff nicht.

## Architektur und Verhalten

`illustrations.ts` enthält reine Buchmetadaten, Quellen und eigene Geometrien; Domainmodelle importieren keine Bildmodule. `pilot-assets.ts` enthält ausschließlich die sechs statischen Delivery-PNGs. Ein gemeinsamer Bildrenderer unterstützt gemessene Pixeldichte, echten Decode, begrenzte Varianten-Fallbacks, Retry und isolierte Ladegenerationen. Ein später alter Callback kann kein anderes Buchbild freigeben.

Die separate Lichtspur verwendet die tatsächliche Kapitelzahl: Johannes 21, Römer 16. Materialgold und Blätter sind Gestaltung. Der vorhandene kurze Bestätigungsimpuls wird nur nach ausdrücklich gespeicherter Kapitelbestätigung ausgelöst; Import, Bildladen und Voransicht lösen ihn nicht aus. App-/Systempräferenz für reduzierte Bewegung bleibt maßgeblich.

Der Hub verwendet für die beiden illustrierten Bücher 100 × 150 Pixel große Bilder und bewahrt für die anderen 64 Bücher den bisherigen kompakten Vektor. Ein direkter Buchschwertlink ergänzt den bestehenden Lesezugang. Die schmale Fehlerdarstellung behält das Buchsymbol und einen mindestens 44 Pixel hohen echten Wiederholungsbutton.

## Bereits tatsächlich geprüfter Stand

- 120/120 Fach-/Persistenztests und strikter Typecheck erfolgreich.
- 16/16 gezielte Römer-/Johannes-Browserfälle erfolgreich: Quellen, Lesespuren, 320/390/1440 Pixel, Hell/Dunkel, Axe, Offline-Erstbesuch/Reload, Retina, reale Bildfehler/Retry, verspätete Antwort und unveränderte Daten.
- Android-/iOS-JavaScript-/Assetdebugexports mit `--no-minify --no-bytecode` erfolgreich. Je 98 A51-PNGs, sechs Buch-PNGs und drei David-WebPs vorhanden; alle Metadatenreferenzen geprüft. Kein ausgeführter nativer Bildschirm, kein Simulator oder Gerät.
- Portable Prüfung `node scripts/check-native-export.mjs --report docs/evidence/latest/native-exports.json`; 13 absichtliche Beschädigungsprüfungen an temporären Exportkopien bestanden. Alle 154 originalen Android-Metadateninputs blieben unverändert. Keine App- oder Nutzerdatenänderung durch diese Prüfung.
- Echter 0.8→0.9-Workerwechsel bestanden: V6 und Speicherdokument V1 bleiben unverändert. Alle Rohdatensätze einschließlich Entwurf, Rückblick, Originalarchiv und Rückkehrsicherung exakt; fünf Geschichten, sieben A51-Stadien, Johannes und der neue Römer-Erstbesuch samt Hubnavigation offline geprüft. Ein exklusiver Vorgängerchunk bleibt nutzbar.

Rohberichte unter `docs/evidence/session-09/`. Der vollständige einzelne **76/76-Browserlauf** ohne Skip oder Flaky-Ergebnis ist erfolgreich. Die private Bereitstellung folgte am **08.11.2026 um 19:49:19 UTC**:

- Quelle `ccf9bbee496b64779583fd39101a59f2f30761b9`.
- Deployment `appgdep_6af0d232484c8191a6bc975b8d3ac093`.
- Kern `oliva-6428cb5965119e02`, Host `oliva-d355762061b4fbe6`.
- 17 HTTP-Routen sowie 104 App- und 42 Review-Dateien bytegenau; anonym 401.

Belege: `private-deployment.json` und `private-http-check.json`. Quelltag, ZIP/Manifest und GitHub-Sicherung folgen nach diesem abgenommenen Dokumentcheckpoint. Eine noch unbekannte Commit-ID wird nicht vorweggenommen.

## Bleibende Gesamtgrenzen

[Plan und Bestandsparität](16-current-plan-and-parity.md) hält insbesondere den noch fehlenden ursprünglichen Fließtextmodus und den vollständigen NT-Fragenkatalog ausdrücklich fest. 0.9 behauptet keine vollständige FaithPath-Parität. Geräteabnahme, echte Anfänger-Usability, unabhängige Inhaltsprüfung und betriebsbereite Cloud-/KI-Dienste fehlen weiterhin.
