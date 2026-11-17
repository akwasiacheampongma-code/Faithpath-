from pathlib import Path
import datetime
import json
import runpy
import shutil

c = runpy.run_path('/tmp/original-history-v017-release-common.py')
r, e = c['ROOT'], c['EVIDENCE']
summary = c['guard']()
http_path = Path('/workspace/oliva-original-history-v017-private-http-check.json')
h = json.loads(http_path.read_text())
assert h['unauthenticated_status'] == 401 and not h['unauthenticated_app_html_visible']
assert h['all_asset_bytes_match_package'] and len(h['app_routes_http_checked']) == 40
assert h['served_assets_verified'] == 111 and h['review_files_verified'] == 48
assert h['anonymous_app_routes_verified'] == 40 and h['all_app_routes_owner_protected']
shutil.copyfile(http_path, e / 'private-http-check.json')
deployment = c['read']('private-deployment.json')
package = c['read']('private-package-check.json')
policy = c['read']('private-access-policy.json')
source = c['read']('private-source-checkpoint.json')
assert deployment['status'] == 'succeeded' and deployment['project_id'] == c['PRIVATE_PROJECT']
assert policy['ownerOnly'] and policy['exactPolicyUnchanged']
assert package['version'] == c['VERSION'] and package['all_runtime_hashes_match']
assert package['source_build'] == summary['coreBuild']
assert c['sha'](source['archive']) == source['archive_sha256']
summary['privateDeployment'] = {
    'status': deployment['status'], 'url': deployment['url'], 'deploymentId': deployment['id'],
    'savedVersionId': deployment['version_id'], 'sourceCommit': source['commit_sha'],
    'deployedAt': deployment['updated_at'], 'hostBuild': package['build_id'], 'anonymousStatus': 401,
    'ownerOnlyPolicyUnchanged': True, 'appFilesVerified': h['served_assets_verified'],
    'byteComparedAppFiles': h['byte_hash_compared_app_files'], 'reviewFilesVerified': h['review_files_verified'],
    'appRoutesHttpChecked': len(h['app_routes_http_checked']), 'anonymousAppRoutesVerified': 40,
    'hostedBrowserQa': False,
}
(e / 'validation-summary.json').write_text(json.dumps(summary, indent=2) + '\n')
c['guard']()
when = datetime.datetime.fromisoformat(deployment['updated_at'].replace('Z', '+00:00')).astimezone(datetime.timezone.utc)
block = f'''**OLIVA 0.17.0 ist seit {when:%d.%m.%Y, %H:%M:%S} UTC eigentümerprivat bereitgestellt.**
[Private Vorschau öffnen]({c['PRIVATE_URL']}/garten). Nach einem FaithPath-Import: **Mein Garten → Frühere FaithPath-Momente ansehen**. Ohne eigene Importdatei zeigen die privaten [320-Pixel-]({c['PRIVATE_URL']}/review/original-history/original-history-320.png) und [1440-Pixel-Aufnahmen]({c['PRIVATE_URL']}/review/original-history/original-history-1440.png) die neue Ansicht mit synthetischen Prüfdaten.

Frühere Vorhaben, Rückblicke und Meilensteine sind lesbar erschlossen. Jede Originaldatei behält ihre eigene Fassung. Rückblicke ohne eindeutigen Weg bleiben eigenständig; Spiegel erscheinen einmal, abweichende Fassungen getrennt. Fehlende Datierung, fehlender Wortlaut und widersprüchliche Zuordnungen bleiben kenntlich. Genaue Archivlinks öffnen den tatsächlichen ursprünglichen Datensatz. Die Ansicht verlangt kein heutiges Vorhaben und stellt keine gelöschten heutigen Einträge wieder her. Der kompakte Smartphoneaufbau zeigt eigene Worte früh. Historische Angaben erzeugen keinen heutigen Fortschritt.

**347/347 Fachtests und ein einzelner vollständiger 154/154-Browserlauf bestanden**, erster Versuch, keine Retries, Skips oder Flaky-Ergebnisse. Typecheck, sieben Inhaltsprüfungen und Produktionsaudit ohne Funde erfolgreich. Der tatsächliche 0.16→0.17-PWA-Wechsel bewahrt alle vier V11-Rohdatensätze durchgehend exakt, auch nach Originalkarten, unzugeordneten Rückblicken, genauen Archivstellen, allen sieben Offline-A51-Stadien und tatsächlichem Export/Restorepreview ohne Anwendung. AppData V11, Dokument 1 / SQLite 3 / IndexedDB 1 unverändert.

Android-/iOS-JavaScript- und Assetexports sowie vollständige NT-/Geschichten-/Themenkatalogvergleiche bestehen statisch. Neue Historienmodule und der native Baumrenderer sind in beiden Bundles vorhanden; der DOM-/WebGL-Baumrenderer fehlt. **Keine native Geräte- oder Simulatorprüfung.** Alle 436 Originaleinheiten / 2.479 Fragen / 436 Impulse, 95 Quellenvarianten, 1.300 separate NT-Fragen, 18 Lebensthemen / 45 Stellen, neun bisherige Wege, sieben A51-Originalstadien und 66 Buchschwerter bleiben erhalten. Keine neuen Bilder oder Laufzeitabhängigkeiten. Alle 390 materialisierten FaithPath-Dateien erneut hashgenau unverändert.

Kern `{summary['coreBuild']}`, Host `{package['build_id']}`; 358 eingefrorene Runtimeinputs, SHA-256 `{c['RUNTIME_SHA']}`. Private HTTP-/Paketprüfung: 40 App-Routen, 111 App-Dateien (110 bytegenau plus HTML-Marker) und 48 Review-Dateien. Alle 40 App-Direktlinks auch anonym geprüft und gesperrt; Eigentümerpolitik exakt unverändert. Eine erste Antwort enthielt unmittelbar nach der Bereitstellung noch nicht den erwarteten Buildmarker; dieselbe normale URL lieferte später die richtige Fassung. Ohne Code-/Berechtigungsänderung oder erneute Bereitstellung bestand danach die vollständige verschärfte HTTP-Abnahme. Die frühen Nachweise bleiben erhalten. Keine gehostete Browser-QA mangels unterstütztem CUA-Werkzeug.

Die beauftragte GitHub-Versionssicherung und die neue unabhängige 0.17-CI folgen als Lieferabschlussschritte; noch kein Erfolg dafür vorweggenommen. Die bestätigte 0.16-CI 44065974720 bleibt ein eigener Nachweis. Weitere Bildarbeit, unabhängige Fach-/Rechtefreigaben, echte Einsteiger-/Geräte-/Hilfstechnologietests, signierte native Pakete und konkrete Cloud-/KI-/Audioarbeit bleiben Master-Aufgaben. **Die gesamte Master-Definition-of-Done ist nicht abgeschlossen.** Keine öffentliche Website-/Storefreigabe, kein GitHub-main-Merge und keine Änderung an Original-FaithPath.
'''
for name in ('README.md', 'docs/delivery-status.md', 'docs/16-current-plan-and-parity.md'):
    path = r / name
    text = path.read_text()
    marker = '<!-- OLIVA_017_CURRENT -->'
    assert marker not in text
    text = text.replace('## Aktueller Lieferstand · persönlicher Garten 0.16.0', '## Historischer Lieferstand · persönlicher Garten 0.16.0', 1)
    line = text.index('\n')
    evidence = 'docs/evidence/original-history-release17/validation-summary.json' if name == 'README.md' else 'evidence/original-history-release17/validation-summary.json'
    text = text[:line] + '\n\n' + marker + '\n## Aktueller Lieferstand · Originalhistorie 0.17.0\n\n' + block + f'\n[Gesamtabnahme]({evidence})\n<!-- /OLIVA_017_CURRENT -->\n\n' + text[line:]
    path.write_text(text)

resume = r / 'RESUME.md'
text = resume.read_text()
end = text.index('## Qualifizierter0.15-Baum-Entwicklungsstand')
next_steps = '''
## Direkt fortsetzen

Aktiv `/workspace/faithpath-next`, Branch `feature/oliva-v017-original-history-20261117`, Codecheckpoint `6041c07e45f3bd7e4ee9093fd0afe7faacf1fa53`. Alle358Runtimeinputs bleiben eingefroren. Private Source/HTTP-/Paket-/Politiknachweise liegen unter `docs/evidence/original-history-release17/`; ursprüngliche Einzelfehler und Wiederherstellung unverändert erhalten. Kein Runtimeumbau und keine erneuten Exporte für Dokumentationsarbeit.

Jetzt tatsächliche Sitzungstokens nur über verstecktes stdin mit `/tmp/scan-oliva-v017-secrets.py` prüfen. Danach `/tmp/checkpoint-oliva-original-history-v017.py`: erstellt erst nach dieser konkreten privaten Abnahme eigenen unveränderlichen Tag `oliva-v0.17.0-original-history-private`, Quell-ZIP und Webkontrollstand. Anschließend `/tmp/prepare-oliva-original-history-v017-github.py` und `/tmp/push-oliva-original-history-v017-github.py`: neuer `oliva/`-Teilbaum, Parent `b2952b682b306f5f4db02d7cef63819f73fcb301`,28alteVersionsrefs sowie main/0.4/CI-/Docs16/15/14/Reader-/WIP-Branches unverändert prüfen. Neue Commit-/ZIP-/Tagkennungen erst nach tatsächlicher Erstellung bestätigen. Kein public Website-/Storedeployment und kein main-Merge.

Neue tatsächliche 0.17-CI anschließend unabhängig mit `docs/evidence/github/ci-v017/` prüfen:347Fachtests/154Browserfälle, erster Versuch,31Kriterien, tatsächliche Testzeiten, Source-/Tagidentität und Artefakt-SHA/CRC/Frische. Helfer vorbereitet, noch keine Run-ID. Historische0.11-Erstläufe und0.16-CI unverändert belassen. Danach vollständige Abschlussdokumentation auf eigenem Dokumentationsbranch sichern; kein Retagging und keine neue Website für reine Nachweise. Temporäre Site-/HTTP-/Downloadfähigkeiten nach vollständigem Scan aus Sitzungsspeicher entfernen.

Die Historienfunktion ist jetzt in der regulären App sichtbar. `docs/32-original-history.md` beschreibt tatsächlichen Gesamtumfang und Grenzen. Keine dateiübergreifend vermischte chronologische Gesamtansicht oder automatische neue Zuordnung eingeführt. Ein Vergleich früherer/heutiger eigener Worte ist eine getrennte weitere Aufgabe. Die nächsten verbleibenden Master-Aufgaben anhand aktueller Roadmap fortsetzen, insbesondere hochwertige Buch-/Bibelbilder und bestehende OLIVA-Identität. Rechte-/Fachfreigaben, reale Geräte, signierte native Pakete und konkrete Cloud-/KI-/Audioarbeit bleiben offen. Keine neue Zukunftsversion oder Termine erfinden.

Alle frühen erstenStufen-/Beta-/0.16-Belege bleiben erhalten. Unveränderliche Kontrollen: `/workspace/oliva-v016-personal-tree-control-dist`, `/workspace/oliva-original-history-first-stage-control-dist`, `/workspace/oliva-original-history-complete-development-control-dist`. Alte0.16Nativexports unter `/workspace/oliva-v016-preserved-dist-android`/`...-ios`; aktuelle dist-android/dist-ios gehören tatsächlich0.17. Speicherpflege hat nur bytegleiche ausdrücklich unveränderliche Exportdateien hart verlinkt, keine Quellen/Originale/ZIPs/Beleginhalte geändert. Rund500MB vor finalem ZIP; ausreichend Reserve beachten.

Keine subagents starten. Git/GH-Tracevariablen entfernen; npm-Cache `/tmp/faithpath-npm`. Bei Environmentneustart erst tatsächlichen Prozess-/Dateistand prüfen. Original-FaithPath und GitHub-main bleiben unangetastet, Site bleibt eigentümerprivat. Die folgenden Abschnitte sind historische Fortsetzungshinweise.

'''
resume.write_text('# Fortsetzen · OLIVA / FaithPath Next Generation\n\n## OLIVA 0.17.0 privat ausgeliefert · Versionssicherung folgt\n\n' + block + next_steps + text[end:])
contract = r / 'docs/32-original-history.md'
text = contract.read_text()
text = text.replace('Aktueller tatsächlicher Kandidat: OLIVA 0.17.0. Lokale Gesamt-, Offline- und statische Nativeabnahme bestanden; private Bereitstellung und ihre HTTP-Abnahme werden im Liefernachweis dokumentiert. Der freigegebene 0.16-Tag bleibt unverändert.', 'OLIVA 0.17.0 ist privat bereitgestellt und vollständig lokal/HTTP abgenommen. Der freigegebene 0.16-Tag bleibt unverändert. Neue GitHub-/CI-Abschlussschritte werden gesondert ergänzt.')
text += '\n## Tatsächliche private Lieferung\n\n' + block
contract.write_text(text)
readme = e / 'README.md'
readme.write_text(readme.read_text() + '\n## Tatsächliche private Lieferung\n\n' + block)
print(json.dumps({'privateDeployment': summary['privateDeployment'], 'masterComplete': False}))
