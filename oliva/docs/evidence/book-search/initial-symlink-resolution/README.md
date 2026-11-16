# Verworfenes QA-Setup mit verlinkten Abhängigkeiten

Der erste Export lief mit `node_modules` als Symlink in eine andere Arbeitskopie. Der Export enthielt nachweislich fremde Kontrollpfade (`../oliva-v03-upgrade-control/assets/...`) und die alte Buchoberfläche ohne Dropdown. Die darauf gestartete gezielte Browserprüfung wurde abgebrochen; diese Dateien sind kein Produkt-Abnahmenachweis.

Korrektur ausschließlich im lokalen QA-Setup: Der Symlink wurde durch einen eigenständigen Verzeichnisbaum mit Hardlinks auf unveränderte Dependency-Dateien ersetzt und Metro mit `--clear` neu aufgebaut. Keine Paketdatei, Version oder ursprüngliche FaithPath-Datei wurde dafür verändert. Der neue Build muss die echten aktuellen Buchsuche-/Dropdown-Texte enthalten und separat geprüft werden.
