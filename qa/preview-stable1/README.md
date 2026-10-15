# Neue QA-Belege vom 15. Oktober 2026

Quellcommit: `6ce37acf164f3e048b5446f115d918274c789f25`.
Kandidat: `FP4-20261015-G-STABLE1`. Alle Laufzeiteingaben sind synthetisch.

| Datei | Bedeutung |
|---|---|
| build-verification.json | Neugebautes lokales Artefakt; jede Release-Dateiprüfsumme geprüft |
| candidate-*-integrity.json | Referenzmanifeste des lokalen Kandidaten, kein Remote-Nachweis |
| unit.log | Frischer Node-Lauf, 108/108 laut Runner |
| core-browser-* | Zwölf Kernabläufe auf lokalem Server |
| stabilization-* | Zwölf gezielte Stabilisierungsszenarien; Worker hierfür blockiert |
| chapter-questions-* | Siebzehn technische Quiz-Prüfungen; eigener Offline-Fall mit aktivem Worker |
| local-update-* | Drei Kontrollpunkte eines echten lokalen Service-Worker-Updates |
| layout-* | 32 Ansichten auf localhost4197; Worker blockiert, Hinweis geschlossen |
| screenshots/ | Neue, eindeutig benannte Layout- und Konfliktdialogbilder |
| synthetic-backup.json | Durch UI erzeugtes und wieder importiertes Testbackup, keine echten Nutzerdaten |
| production-http.json | Frische öffentliche Produktionskennung, weiterhin POLISH1 |
| qa-origin-http.json | Fehlgeschlagener QA-Zugriff: Proxy-Tunnel 403 |
| hosting-snapshot.json | Connector-Snapshot vor ausdrücklicher öffentlicher Freigabe |
| hosting-final.json | Connector-Snapshot danach: nur neue QA-Site öffentlich; Originaldeploy unverändert |
| deployment-blockers.json | API-401, Netzwerkblockade und genehmigter QA-Zugriffswechsel; keine Tokens |
| deploy-packages.json | Prüfsummen der vorbereiteten, noch nicht hochgeladenen Deploy-ZIPs |

Die Kern-JSON-Ausgabe nennt die Engine, aber keine Origin; die hier ausgeführte
Invocation war `FAITHPATH_PORT=4196 FAITHPATH_TEST_ROOT=qa-output/preview-verified
FAITHPATH_CHROMIUM=/usr/bin/chromium node tests/browser.mjs`.
Die übrigen Browserdateien nennen ihre lokale Origin. Der Update-Lauf verwendet
localhost4288. Aus diesen Dateien darf kein Netlify-PASS abgeleitet werden.

Der vollständige Bericht und die Geräteanleitung liegen unter `docs/`.
Alle iPhone- und Hosted-Gates sind OFFEN. Öffentliche QA-Freigabe ist erfolgt;
ein FaithPath-Build ist auf der QA-Site noch nicht veröffentlicht.
