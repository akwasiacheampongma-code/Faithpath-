# Datenschutzhinweise · Entwurf, rechtlich zu prüfen

Diese Vorlage beschreibt den geprüften lokalen Arbeitsstand. Angaben in eckigen Klammern müssen aus der tatsächlichen Betreiber- und Hostingkonfiguration belegt werden. Die Anwendbarkeit der DSGVO, des TDDDG und weiterer Vorschriften hängt vom konkreten Angebot, den beteiligten Stellen und den Zielmärkten ab. [DSGVO, amtliche Fundstelle](https://eur-lex.europa.eu/eli/reg/2016/679/oj)

## Wer verantwortlich ist

**[Name oder Rechtsträger, Anschrift, Kontakt für Datenschutz]**. Datenschutzbeauftragte Person, falls bestellt oder vorgeschrieben **[Kontakt]**. Die tatsächliche Rolle des Betreibers gegenüber Sites, ChatGPT-Anmeldung, CDN und weiteren Beteiligten wird dokumentiert unter **[Rollen, Verträge und Empfänger]**.

## Was in OLIVA gespeichert wird

OLIVA speichert freiwillige Angaben und persönliche Nutzung lokal im Browserprofil oder in der nativen App. Dazu zählen Vorname, Einstellungen, Lesestände, Markierungen, Lesezeichen, Antworten, Gedanken, Entwürfe, Vorhaben und der Gartenstand. Die geprüfte App nutzt keinen eigenen Kontodienst für diese Daten. Eine importierte FaithPath-Datei kann persönliche Informationen enthalten und wird zur nachvollziehbaren Herkunft vollständig im lokalen Archiv behalten. Bei einem Import kann eine getrennte Kopie des vorherigen lokalen Stands entstehen.

Im Web liegen persönliche Daten und importierte Originale in IndexedDB. CacheStorage hält das statische App-Paket für den Offline-Neustart vor. Nativ werden die persönlichen Inhalte in SQLite im Appbereich gehalten. Persönliche Texte können Angaben zu religiösen Überzeugungen und anderen besonders geschützten Informationen enthalten. Ob und durch wen solche Daten im konkreten Angebot verarbeitet werden und welche Rechtsgrundlagen anwendbar sind, ist gesondert zu prüfen. **[Zwecke und Rechtsgrundlagen je Verarbeitung, einschließlich gegebenenfalls Art. 9 DSGVO]**.

## Anmeldung und Auslieferung der privaten Vorschau

Der Zugang zur privaten Webvorschau setzt die Berechtigung für das vorgesehene Konto voraus. Die Hostingplattform wickelt die Anmeldung und die Auslieferung ab. Die tatsächlichen Kategorien der dabei verarbeiteten Daten, zum Beispiel Konto- oder Zugriffsdaten, müssen mit dem Anbieter geklärt werden. **[Vertragspartner, Loginanbieter und CDN mit Anschrift]**. **[Tatsächlich verarbeitete Daten, Zwecke, Rechtsgrundlagen, Cookie- oder Speichereinträge, Aufbewahrungsfristen und Supportzugriff]**.

**[Empfänger, Auftragsverarbeitungsverträge soweit einschlägig, Verarbeitungsorte und Drittlandgarantien]**. Die Einordnung von Registry, GitHub und CI als Entwicklungsdienste ist getrennt von der Auslieferung zu dokumentieren. Bei bewusst geöffneten externen Quellen gelten zusätzlich die Angaben der jeweiligen Anbieter.

Bei einem direkten Seitenaufruf gehen die für die Auslieferung nötige Route und technische Verbindungsdaten an den Host. Eine Route kann eine Bibelstelle oder eine Kennung eines lokalen Objekts enthalten. Im synthetischen lokalen Browsertest erschien der persönliche Prüftext weder in Anfragen noch im Browserprotokoll. Welche URLs, Kennungen und Zugriffszeiten der Hostinganbieter tatsächlich speichert, bedarf eines Nachweises. **[Logarten, Umfang, Rechtsgrundlage, Zugriff, Speicherdauer und Löschweg bestätigen]**. [Lokaler Datenfluss](../evidence/stabilization/local-data.json) · [Autorisierte HTTP-Stichprobe](../evidence/stabilization/private-headers-entry.json)

## Sicherungen, Teilen und Löschen

Beim Export wird eine Sicherung der gewählten Daten als Datei erzeugt. Die normale JSON-Datei enthält den aktuellen Zustand und kann damit persönliche Inhalte und vollständige Originalquellen im Klartext enthalten. Eine Reparatursicherung kann zusätzlich frühere lokale Stände enthalten. Der Browser lädt die Datei herunter. Nativ übergibt OLIVA sie dem Systemdialog. Bei der Wiederherstellung zeigt die App zuerst eine Vorschau. Erst die Bestätigung ersetzt den aktiven Zustand. Beim Teilen und Kopieren können die Betriebssystemfunktionen oder der gewählte Empfänger weitere Kopien anlegen. **[Angaben zu Geräten, OS-Backups und eventuell verwalteten Richtlinien prüfen]**. [Vorschlag für freiwilligen Passwortschutz](approval-plan.md)

Ein Betreiberwechsel, eine Abmeldung oder das Entfernen eines aktuellen Eintrags löscht alte Downloads, importierte Originale und getrennte Wiederherstellungsstände nicht automatisch. Lokale Browserdaten können über die Datenverwaltung des Browsers entfernt werden. Vor einer Löschung sind Datenerhalt und vorhandene Sicherungen zu prüfen. **[Geprüfte Löschwege für Browser, native App, Originalarchive, Rückkehrstände und Anbieterprotokolle]**. **[Aufbewahrungsfristen oder nachvollziehbare Kriterien]**.

## Rechte und weitere Pflichtangaben

**[Verfahren für Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit, Widerspruch und gegebenenfalls Widerruf]**. **[Beschwerderecht und zuständige Aufsicht]**. **[Pflicht oder Freiwilligkeit einzelner Angaben, Folgen der Nichtbereitstellung]**. **[Zielgruppe und Anforderungen für Minderjährige, sofern einschlägig]**. **[Prüfung einer etwaigen automatisierten Entscheidung im Sinne von Art. 22 DSGVO anhand des tatsächlichen Betriebs]**.

Vor Veröffentlichung einen verifizierten Datenfluss je Plattform mit Verantwortlichkeiten, Speichereinträgen, Vertragsunterlagen, Löschwegen und Anwendbarkeit von Art. 12–14 DSGVO sowie § 25 TDDDG abgleichen. Der lokale Browsernachweis erfasst die Anmeldung und Anbieterprotokolle nicht. [Technischer Audit](../41-privacy-security-rights-audit.md) · [§ 25 TDDDG](https://www.gesetze-im-internet.de/ttdsg/__25.html)
