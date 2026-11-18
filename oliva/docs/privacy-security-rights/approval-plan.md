# Änderungen zur Freigabe

Der Audit liegt als lokaler Prüfstand vor. Die folgenden Vorschläge betreffen Hosting, Sicherungen oder Bedienabläufe. Die Reihenfolge gibt dem tatsächlichen Zugriffsschutz und belastbaren Betreiberangaben Vorrang.

## 1. Hosting und Schutzheader prüfen

Die autorisierte Stichprobe liefert für HTML, gemeinsames JavaScript, Bild, Schrift, Worker und Manifest den erwarteten Inhalt. Die Direktabrufe ohne Anmeldung wurden zurückgewiesen. Die gecachten statischen Antworten lieferten die erwarteten Schutzheader der lokalen `_headers`-Datei nicht. Der nächste Schritt benötigt einen belegten Weg, diese Header am tatsächlichen Host zu setzen. Plattformdokumentation und Vertragsunterlagen sollen klären, welche CDN-, Login- und Worker-Logs entstehen, welche Inhalte sie enthalten und wer sie wie lange sehen kann. [Autorisierte und anonyme Stichprobe](../evidence/stabilization/private-headers-entry.json)

Wenn der Host es unterstützt, die Header an einer getrennten privaten Testadresse vorbereiten. Mit geeigneten Richtlinien für Einbettung, Inhaltstyp, Referrer und Berechtigungen beginnen. Eine CSP zuerst auf Verträglichkeit mit Expo, Inline-Stilen, Schriften, Offline-Worker, Blob-Downloads und dem Login prüfen. Erst nach dieser Prüfung eine wirksame Richtlinie vereinbaren. Etwaige CSP-Berichte dürfen keine persönlichen URLs an ungeprüfte Stellen übertragen. HSTS mit breitem Geltungsbereich setzt geklärte Domainverantwortung voraus.

Vor Freigabe muss die Testadresse sieben repräsentative anonyme Direktabrufe verweigern. Angemeldete Antworten müssen die erwarteten Bytes und MIME-Typen liefern. Login, alte Direktlinks, Sicherungsdownload, Offline-Neustart und PWA-Aktualisierung müssen funktionieren. Das bisherige Paket und die Zugriffsrichtlinie dienen als Rückkehrpunkt. [HTTP-Stichprobe](../evidence/privacy-security-rights/host-http-anonymous.json)

## 2. Sicherungen und gemeinsame Geräte verständlich behandeln

Zuerst beschreiben, wo normale Sicherung, Reparatursicherung, Rückkehrkopie und Originalarchive zu finden sind. Einen kurzen Entwurf für die Exporthinweise vorlegen. Sinnvolle Angaben sind der enthaltene Klartext, die vollständigen importierten Quellen und der gewählte Speicherort. Für gemeinsam genutzte Geräte die Abmeldung vom Host von der Entfernung der lokalen Appdaten unterscheiden.

Ein freiwilliger verschlüsselter Export schützt eine kopierte Sicherungsdatei, etwa auf einem geteilten Datenträger. Lokale Datenbanken, Systemkopien und zuvor heruntergeladene Dateien haben eigene Schutzgrenzen. Für eine spätere Freigabe ist ein eigenes, versioniertes äußeres Dateiformat vorzuziehen. Der enthaltene JSON-Datensatz und sein validierter Importpfad können gleich bleiben. Unverschlüsselte V1–V11-Sicherungen bleiben lesbar. Ein vorheriger OLIVA-Stand kann weiterhin das gemeinsam lesbare JSON übernehmen. Eine Migration vorhandener Sicherungen wäre freiwillig.

Vor einem Prototyp eine bestehende plattformübergreifend geprüfte Implementierung für authentifizierte Verschlüsselung auswählen. AES-GCM mit zufälligem Nonce ist eine mögliche Basis. Schlüsselableitung, Salt und authentifizierte Format- und Parameterfelder gehören zur dokumentierten Formatspezifikation. Ressourcenlimit, zulässige KDF-Parameter und Dateigröße sind vor teuren Operationen zu prüfen. Entschlüsselte Inhalte durchlaufen dieselbe Vorschau und Validierung wie normale Sicherungen. Der Passwortverlust kann eine Wiederherstellung verhindern. Passwortaufbewahrung und Kompatibilität zwischen Web, Android und iOS sind vor Freigabe verständlich zu erklären. Eine Entscheidung über Umsetzung und Format steht aus.

Vor Freigabe den normalen Export und Restore mit Archiv und Rückkehrdaten aus Web, Android und iOS testen. Daten müssen bei Abbruch, falschem Passwort, beschädigter Datei oder Speichermangel erhalten bleiben. Eine mögliche Funktion zum Entfernen älterer Kopien braucht eine eigene verständliche Vorschau und Bestätigung. [Datenschutzentwurf](privacy-draft.md)

## 3. Betreiber, Rechte und Lizenzpflichten vervollständigen

Den Rechtsträger, Kontaktweg, Zielmärkte und tatsächliche Anbieterbeziehungen erfassen. Danach die Platzhalter anhand der Auslieferung prüfen und die Entwürfe rechtlich abnehmen lassen. Für jeden übernommenen Katalog, A51, das Schwert, die übrigen Illustrationen und die Symbole die nachweisbaren Rechte für Web, Stores und öffentliche Quellenablagen dokumentieren. Die öffentlich lesbaren früheren Quellenstände sind gesondert zu bewerten.

Als Nachweis eine Liste der tatsächlich ausgelieferten Web- und nativen Komponenten mit den erforderlichen Lizenztexten erstellen. Die Zusammenstellung am fertigen Paket prüfen. Vor einer Veröffentlichung müssen die Betreiberangaben, Bildnachweise, Nutzungsrechte und Lizenztexte vollständig und erreichbar sein. [Impressum](impressum-draft.md) · [Bildnachweise](image-credits-draft.md) · [Lizenzübersicht](licenses-draft.md)

## 4. Lieferkette beobachten

Eine veröffentlichte, kompatible picomatch-Korrektur gegen die tatsächlich betroffenen Pfade prüfen. Bei Verfügbarkeit eine eng begrenzte Aktualisierung mit reproduzierbarer Installation, Audit, Webbuild, nativen Buildprüfungen und relevanten Offline-Regressionen abnehmen. Die aktuelle CI-Sperre dokumentiert den Befund weiter. [Advisory-Nachweis](../evidence/privacy-security-rights/npm-lock-advisories.json)
