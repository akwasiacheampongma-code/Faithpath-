# Datenschutz, Sicherheit und Rechte · Bestandsaufnahme und Entwürfe

**Arbeitsentwurf vom18.11.2026. Kein rechtsverbindlicher Text und keine öffentliche Freigabe.** Platzhalter müssen vom tatsächlichen Betreiber ausgefüllt und rechtlich geprüft werden. Keine personenbezogenen Kontaktdaten werden erfunden. Technischer Stand: OLIVA0.18, ohne neue Cloud-/KI-/Audio-/Zahlungsfunktionen.

## Priorisierte Mängelliste

| ID | Priorität / Anlass | Tatsächlicher Befund | Nächste überprüfbare Maßnahme |
|---|---|---|---|
| SEC-01 | P1 · heutige Buildumgebung | Eine High-Advisory GHSA-fc5q-39xc-vjpf fürpicomatch mit33abgeleiteten Paketmeldungen; Registrylatest4.0.7 noch betroffen. | Abhängigkeits-/Angriffswege prüfen und verfügbare passende Korrektur beobachten; gezielt aktualisieren und prüfen, sobald eine belastbare Lösung verfügbar ist. Kein pauschaler Major-Downgrade. |
| HOST-01 | P2 · Auslieferung | Einzelne private PNG-Abrufe lieferten vorübergehend die App-Startdatei mit200; finale32Dateihashes bestätigt, erste Fehler erhalten. | Hosting-/Cacheursache getrennt untersuchen; MIME-/Bildfehler nicht als erfolgreiche Bilddarstellung ausgeben. |
| SEC-02 | P1 · Webhärtung | Mehrere Schutzheader fehlen an authentifizierten statischen Antworten. | Tatsächliche Hostingmöglichkeiten klären; kompatible Header/CSP erst mit App-/Offline-/Loginprüfung übernehmen. |
| PRIV-01 | P1 · Transparenz | JSON-Backup/OS-Teilen enthält persönliche Worte und vollständige Importoriginale unverschlüsselt. | Verständliche bestehende Exporthinweise/Datenschutzauskunft prüfen; Speicherort und Teilen in Nutzerverantwortung deutlich machen. Keine neue Kryptofunktion ohne Auftrag. |
| PRIV-02 | P1 · Betreiber-/Hostdaten | App selbst speichert lokal; Betreiberidentität, Hostingrollen, SIWC-/Cloudflare-Verträge, Protokollinhalte und Löschfristen sind nicht belegt. | Tatsächliche Vertrags-/Betriebsdaten eintragen, einschließlich Login-/IP-/Requestmetadaten und Rechtsgrundlagen. Nicht „keine Datenverarbeitung“ behaupten. |
| RIGHTS-01 | P0 vor öffentlicher Freigabe | A51, FaithPath-Redaktion und KI-Illustrationen besitzen Integrationsfreigaben, aber keine pauschal bestätigte öffentliche Inhalts-/Bildweitergabe. | Rechtekette/Providerbedingungen und unabhängige Inhaltsprüfung belegen. Historische Originale nicht entfernen. |
| RIGHTS-02 | P0 vor öffentlicher Freigabe | ArbeitsmarkeOLIVA, Impressumsverantwortung und Kontakt nicht abschließend bestätigt. | Marken-/Betreiberangaben prüfen; Platzhalter ersetzen. |
| LIC-01 | P1 vor breiter Verteilung | ShippedNotices benennen Expo-/React-Native-Pakete pauschal; vollständige transitive Pflichten sind noch nicht als ausgelieferter Gesamtnachweis belegt. | Lockfileinventar samt tatsächlichen Paketlizenzen auswerten und notwendige Texte der verwendeten Komponenten bündeln. Schrift-OFL/Bibelhinweise sind vorhanden. |
| IMP-01 | P2 · Robustheit | Größen-/Komplexitäts-/Schema-/Hash-/Revisionsschutz vorhanden;64MiBJSON auf schwachen Telefonen nicht lastgeprüft. | Grenzlast, Abbruch, Speicherdruck und Erholung auf echten Geräten separat prüfen. Kein stilles Kürzen von Originalen. |
| DEL-01 | P2 · Löschkonzept | Lokaler Eintrag, archiviertes FaithPath-Original, Rückkehrkopie, exportierte Datei und Browsercache haben unterschiedliche Lebenszyklen. | Exakte Löschwege verständlich dokumentieren; eine lokale Textlöschung nicht als Löschen aller alten Sicherungen ausgeben. |
| A11Y-01 | P1 · aktuelle UX |200%Textüberlauf inHeute/Bibel und schmaleStadienziele trotz bislang unauffälliger Axe-Stichprobe. | Reflow/Touchziele im freigegebenen Layout korrigieren; echte Hilfstechnologietests ergänzen. |

P0 bezeichnet hier eine Voraussetzung einer späteren öffentlichen Produktfreigabe, keine Behauptung eines heutigen Datenabflusses. Die aktuelle Vorschau bleibt eigentümerprivat.

## Tatsächliche Datenflüsse

| Vorgang | Daten und Ort | Was nicht belegt ist |
|---|---|---|
| Web-App nutzen | App-/Bibel-/Bild-/Schriftdateien vom privaten Host; persönliche Inhalte inIndexedDB des aktuellen Browserprofils/Origins. | Gerätesicherung, Browserlöschregeln und Hostingprotokolle müssen betrieblich bestätigt werden. |
| Native App | SQLiteDatei im Appbereich; Dokumentauswahl, Clipboard und Teilen über vorhandene Expo-/OS-Schnittstellen. | Finale installierte Android-/iOS-Berechtigungen, OS-Backups und Geräteschutz sind ohne signierte Builds nicht abgenommen. |
| Quelle importieren | Vollständige ausgewählteFaithPathJSON lokal prüfen/archivieren, Originalhash und Revisionsstand; eigene Bestätigung vor Übernahme. | Herkunft/Vertrauenswürdigkeit einer vom Nutzer gewählten Datei lässt sich nicht allein am korrekten Format erkennen. |
| Sicherung exportieren | Vollständige OLIVA-Daten und eingebettete Importquellen alsJSON/Download bzw.OS-Teilen. | Keine App-eigene Verschlüsselung; nach Teilen kann der gewählte Zieldienst weitere Verarbeitung vornehmen. |
| Wiederherstellen |64MiB-Grenze, Schema-/Quellenprüfung und Vorschau; bewusste Ersetzung lokaler Daten. Rückkehrkopien beimFaithPathImport sind ein eigener Mechanismus. | Kein unbegrenzter Versionsverlauf und keine automatische Cloudkopie. |
| Private Anmeldung | Sign in withChatGPT/Hostingzugangsprüfung außerhalb des lokalenOLIVA-Nutzdatenmodells. | Vertragspartner, Rechtsgrundlage, Datenkategorien, Supportzugriff und Speicherfristen ergänzen. |
| Externe Quelle öffnen | Explizites Öffnen z.B.der eBible-Lizenzseite im Browser. | Verantwortlichkeit/Tracking der externen Seite nicht pauschal OLIVA zuschreiben oder ausschließen. |

In der untersuchten Appquelle wurde keine eigene Analytics-/Sentry-/Cloud-/KI-Anbindung gefunden; die lokale Browserstichprobe meldet keine unerwarteten Drittanbieterrequests. Das beweist keine Abwesenheit sämtlicher Plattform-/Hostinglogs. Lese-URLs können Buch-/Kapitelparameter enthalten. Persönliche geistliche Texte können besonders schützenswerte Informationen enthalten; eine Rechtsgrundlage wird hier nicht erfunden.

## Entwurf: Anbieterkennzeichnung

> **ENTWURF · Angaben fehlen, nicht veröffentlichungsfertig**
>
> Verantwortlich fürOLIVA: **[VOLLSTÄNDIGER NAME / RECHTSTRÄGER]**
> Anschrift: **[TATSÄCHLICHE LADUNGSFÄHIGE ANSCHRIFT]**
> Kontakt: **[TATSÄCHLICHE KONTAKTMÖGLICHKEIT]**
> Vertretung/Register/Umsatzsteuerangaben, soweit tatsächlich einschlägig: **[PRÜFEN UND ERGÄNZEN]**
> Verantwortlichkeit für redaktionelle Inhalte, soweit einschlägig: **[PRÜFEN]**.

## Entwurf: Datenschutzhinweise

> **ENTWURF · tatsächlichen Betrieb und Rechtsgrundlagen vor Freigabe prüfen**
>
> OLIVA speichert deine Gedanken, Entwürfe, Lesezeichen, Markierungen, Lesestände und Studienantworten derzeit lokal im verwendeten Browserprofil bzw.in der nativenApp. EineOLIVA-Cloudsynchronisierung ist nicht aktiv. Ein Browserwechsel oder das Löschen der Browser-/Appdaten kann lokale Inhalte entfernen.
>
> Wenn duFaithPath-Daten importierst, bewahrtOLIVA die ausgewählte Originaldatei lokal, um Herkunft und frühere Einträge nachvollziehbar zu halten. Eine exportierteJSON-Sicherung kann deshalb auch ursprüngliche persönliche Angaben enthalten. Die Sicherungsdatei ist nicht durchOLIVA verschlüsselt. Wähle einen geschützten Ablageort und teile sie bewusst.
>
> Für die privateWeb-Vorschau werden technische Dateien ausgeliefert und der Zugang durch die Hosting-/Anmeldeplattform geprüft. Verantwortlicher: **[BETREIBER]**; Anbieter/Rollen: **[BELEGEN]**; tatsächlich verarbeitete Metadaten, Zwecke, Rechtsgrundlagen und Aufbewahrungsfristen: **[ERGÄNZEN]**.
>
> Auskunft, Berichtigung, Löschung und weitere gegebenenfalls bestehende Rechte: **[RECHTLICH PRÜFEN UND KONTAKT EINTRAGEN]**. Lokale Originalarchive, Rückkehrkopien, Browsercache und bereits exportierte Dateien sind gesondert zu berücksichtigen. Konkrete Löschanleitung: **[GEPRÜFTEN WEG EINTRAGEN]**.

## Entwurf: Inhalt und Bildnachweise

> Bibeltext: Lutherbibel1912, nach eBible.org gemeinfrei; Quelle und unverändertes Quellarchiv im Projekt nachgewiesen. OLIVA-Erklärungen, FaithPath-Fragen und künstlerische Interpretationen sind vom Bibelwort getrennt.
>
> DM Sans undCormorantGaramond: SILOpenFontLicense1.1; vollständige Schriftlizenzen mitgeliefert.
>
> A51-Baum: Originalarbeit ausFaithPath,7Stadien, mit ausdrücklicher Integrationsanweisung übernommen; öffentliche Rechteprüfung noch offen. Geschichten-/NT-/Themenredaktion: Originalkataloge mit Provenienz und MIT-Ausnahmen; keine allgemeine Weiterverwendungslizenz behauptet.
>
> Landschafts-/Bibelbilder und das einzelne geistlicheSchwert: vorhandene generierte Projektbilder, Herkunft/Prompt-/Dateinachweise im Bildinventar. Künstlerische Interpretation, keine historische Bildquelle oder nachgewiesenes Porträt. Öffentliche Provider-/Rechte-/Fachfreigabe: **[NACHWEIS ERGÄNZEN]**.
>
> Weitere Softwarelizenzen und Router-/Navigationsbilder: **[VOLLSTÄNDIGEN GEPRÜFTEN DISTRIBUTIONSNACHWEIS VERLINKEN]**. OLIVAsMIT-Softwarelizenz ersetzt diese Ausnahmen und Pflichten nicht.

Diese Entwürfe werden nicht automatisch in die App als endgültige Rechtstexte übernommen. Es wurden keine Namen, Anschriften, Genehmigungen, Vertragsfristen oder juristischen Bewertungen erfunden.
