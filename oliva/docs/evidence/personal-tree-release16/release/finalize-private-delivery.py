from pathlib import Path
import datetime
import json
import runpy
import shutil

c = runpy.run_path('/tmp/personal-tree-v016-release-common.py')
r, e = c['ROOT'], c['EVIDENCE']
summary = c['guard']()
http_path = Path('/workspace/oliva-personal-tree-v016-private-http-check.json')
h = json.loads(http_path.read_text())
assert h['unauthenticated_status'] == 401 and not h['unauthenticated_app_html_visible']
assert h['all_asset_bytes_match_package'] and len(h['app_routes_http_checked']) == 37
assert h['served_assets_verified'] >= 111 and h['review_files_verified'] == 45
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
    'appRoutesHttpChecked': len(h['app_routes_http_checked']), 'hostedBrowserQa': False,
}
(e / 'validation-summary.json').write_text(json.dumps(summary, indent=2) + '\n')
c['guard']()
when = datetime.datetime.fromisoformat(deployment['updated_at'].replace('Z', '+00:00')).astimezone(datetime.timezone.utc)
block = f'''**OLIVA 0.16.0 ist seit {when:%d.%m.%Y, %H:%M:%S} UTC eigentümerprivat bereitgestellt.**
[Mein Garten öffnen]({c['PRIVATE_URL']}/garten). Die bisherige Vorschau-Adresse bleibt bestehen.

Der Garten verbindet tatsächlich vorhandene persönliche Vorhaben mit dem unveränderten A51-Originalbaum. Wenige bedienbare Bildziele und eine ergänzende Liste öffnen Vorhaben, Gedanken, eigene Schritte und Rückblicke. Gemeinsame Gedanken erscheinen global einmal; offene Schritte, alte Rückblicktitel und unklare Importdaten bleiben erhalten. Die sieben Stadienvorschauen zeigen keine fiktiven persönlichen Verknüpfungen. Die Liste bleibt auch während des Bildladens erreichbar; Bildziele erscheinen erst am tatsächlich geladenen eigenen Stadium. Reines Betrachten schreibt keine Daten und erzeugt keinen Fortschritt.

**328/328 Fachtests und ein einzelner vollständiger 148/148-Browserlauf bestanden**, erster Versuch, keine Retries, Skips oder Flaky-Ergebnisse. Typecheck, sieben Inhaltsprüfungen und Produktionsaudit ohne Funde erfolgreich. Echter 0.15→0.16-PWA-Wechsel: alle vier V11-Rohdatensätze durchgehend exakt, auch nach neuen Ansichten, Offline-Neustart und tatsächlichem Export/Restorepreview ohne Anwendung. AppData V11 sowie Dokument 1 / SQLite 3 / IndexedDB 1 unverändert. Android-/iOS-JS-/Assetexports und vollständige NT-/Geschichten-/Themenkatalogvergleiche bestehen statisch; **keine Geräte- oder Simulatorprüfung**.

Alle 436 Originaleinheiten / 2.479 Fragen / 436 Reflexionsimpulse, 95 Quellenvarianten, 1.300 separate NT-Fragen, 18 Lebensthemen / 45 Stellen, neun bisherige Wege und 66 Buchschwerter bleiben erhalten. Keine neuen Illustrationen oder Laufzeitabhängigkeiten. Alle 390 materialisierten Original-FaithPath-Dateien erneut hashgenau unverändert bestätigt.

Kernbuild `{summary['coreBuild']}`, Hostbuild `{package['build_id']}`; 353 eingefrorene Runtimeinputs, SHA-256 `{c['RUNTIME_SHA']}`. Private HTTP-/Paketprüfung: 37 Routen, {h['served_assets_verified']} App-Dateien ({h['byte_hash_compared_app_files']} bytegenau plus HTML-Marker) und 45 Review-Dateien. Eigentümerpolitik exakt unverändert, anonym HTTP 401. Keine gehostete Browser-QA mangels unterstütztem CUA-Werkzeug. Tatsächliche neue Gartenaufnahmen: [320 Pixel]({c['PRIVATE_URL']}/review/personal-tree/garden-320.png), [1440 Pixel]({c['PRIVATE_URL']}/review/personal-tree/garden-1440.png), jeweils synthetische Prüfdaten.

Die GitHub-Versionssicherung und die neue unabhängige 0.16-CI folgen als Lieferabschlussschritte; noch kein Erfolg dafür vorweggenommen. Der frühere WIP-Lauf 44055494198 und die ausgelieferte 0.15-CI 44045010987 bleiben getrennte Nachweise.

**Offen bleibt die vollständige historische Erschließung alter FaithPath-Rückblicke und Meilensteine.** Die aktuelle Ansicht ist die erste persönliche Historienstufe. Weitere Bildarbeit, unabhängige Fach-/Rechtefreigaben, echte Einsteiger-/Geräte-/Hilfstechnologietests, signierte native Pakete und konkrete Cloud-/KI-/Audioarbeit bleiben Master-Aufgaben. Keine öffentliche Website-/Storefreigabe, kein GitHub-main-Merge und keine Änderung an FaithPath. Die gesamte Master-Definition-of-Done ist nicht abgeschlossen.
'''
for name in ('README.md', 'docs/delivery-status.md', 'docs/16-current-plan-and-parity.md'):
    path = r / name
    text = path.read_text()
    marker = '<!-- OLIVA_016_CURRENT -->'
    assert marker not in text, 'Do not duplicate current delivery summary'
    text = text.replace('## Aktueller Lieferstand · Lebensthemen 0.15.0', '## Historischer Lieferstand · Lebensthemen 0.15.0', 1)
    line = text.index('\n')
    evidence_link = 'docs/evidence/personal-tree-release16/validation-summary.json' if name == 'README.md' else 'evidence/personal-tree-release16/validation-summary.json'
    text = text[:line] + '\n\n' + marker + '\n## Aktueller Lieferstand · persönlicher Garten 0.16.0\n\n' + block + f'\n[Gesamtabnahme]({evidence_link})\n<!-- /OLIVA_016_CURRENT -->\n\n' + text[line:]
    path.write_text(text)

resume = r / 'RESUME.md'
text = resume.read_text()
start, end = text.index('## Aktuell:'), text.index('## Qualifizierter0.15-Baum-Entwicklungsstand')
next_steps = '''
### Unmittelbar fortsetzen

Aktiver Stand im kanonischen `/workspace/faithpath-next`, Branch `feature/oliva-v016-personal-tree-20261117`. Qualifizierter Codecheckpoint `d885ce4e2a1b390c0b88774f266e869364a016c7`. Alle 353 Runtimeinputs bleiben eingefroren. Jetzt tatsächliche Sitzungstokens über verstecktes stdin mit `/tmp/scan-oliva-v016-secrets.py` prüfen; anschließend `/tmp/checkpoint-oliva-personal-tree-v016.py` ausführen. Dieser erstellt erst jetzt eigenen unveränderlichen Tag/ZIP/Webkontrollstand. Danach `/tmp/prepare-oliva-personal-tree-v016-github.py` und `/tmp/push-oliva-personal-tree-v016-github.py`: ausschließlich neuer `oliva/`-Teilbaum, Parent `94777280c915887bdc9c25527ee7c0d299eb938b`, 26 alte Versionsrefs und alle geschützten Branches einschließlich altem WIP unverändert. Keine neue Tag-/Commitkennung vor tatsächlicher Erstellung behaupten.

Nach dem Push neue tatsächliche 0.16-CI unter `docs/evidence/github/ci-v016/` unabhängig prüfen: 328/148, erster Versuch, 31 Kriterien, Artefakt-SHA/CRC/Frische, geloggte Testzeiten und exakter Quellteilbaum. Helfer sind vorbereitet, keine Run-ID vorweggenommen. Historische 0.11-IDs und ihre roten Erstläufe bleiben unverändert. Danach tatsächliche Lieferdokumentation in eigenem Dokumentationscommit/-branch sichern, Tags nicht rückwirkend ändern, keine erneute Website für reine Dokumentation.

Danach Master selbstständig fortsetzen: nächste bestehende Lücke sind quellengenaue historische Rückblicke/Meilensteine. `next-history-readonly-audit.json` belegt, dass Original-`pathEvidence` auch Rückblicke zu explizit verknüpften Journal-/Reflexions-`sourceKey`s findet, die aktuelle `LegacyHistory` bisher nur direkte Pfadbezüge auflöst und Meilensteine nur als Anzahl nennt. Noch keine neue Implementierung dieses Folgebereichs. Keine heutigen Entwicklungen aus Originalarchiven erzeugen, keine fehlenden Daten/Datierungen/gelöschten Texte erfinden.

Keine subagents starten. Git/GH-Tracevariablen entfernen, npm-Cache `/tmp/faithpath-npm`. Ruhende Originale, Quell-ZIPs und Belege erhalten; Speicherpflege nur regenerierbare Caches oder bytegleiche ausdrücklich unveränderliche Exporte. Aktive Exporte nicht mit alten Kontrollexporten hart verlinken. Bei Environment-Neustart erst tatsächlichen letzten Prozess-/Dateistand prüfen. Die folgenden Abschnitte sind historische Fortsetzungshinweise und durch den aktuellen Stand überholt.

'''
resume.write_text(text[:start] + '## Aktuell: OLIVA 0.16.0 privat ausgeliefert, Versionssicherung folgt\n\n' + block + next_steps + text[end:])
contract = r / 'docs/31-personal-tree-links.md'
text = contract.read_text()
start, end = text.index('**Aktueller Kandidat:'), text.index('## Implementierte erste Stufe')
contract.write_text(text[:start] + block + '\nDie folgenden Abschnitte bewahren die früheren Entwicklungsnachweise. Maßgeblich für die neue Lieferung ist `evidence/personal-tree-release16/validation-summary.json`.\n\n' + text[end:])
readme = e / 'README.md'
text = readme.read_text()
text += '\n## Tatsächliche private Bereitstellung\n\n' + block
readme.write_text(text)
print(json.dumps({'privateDeployment': summary['privateDeployment'], 'masterComplete': False}))
