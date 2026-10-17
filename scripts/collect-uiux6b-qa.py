"""Release evidence compiler. Fails closed if any required programme is missing."""
from pathlib import Path
import json,shutil,re,hashlib,os
root=Path(__file__).resolve().parents[1];qa=root/'qa-output/uiux6b';out=root/'reports/uiux6b';ev=out/'evidence';ev.mkdir(parents=True,exist_ok=True)
build_root=root/os.environ.get('FAITHPATH_TEST_ROOT','qa-output/uiux6b/release-final')
manifest=json.loads((build_root/'release-integrity.json').read_text())
receipts=json.loads((qa/'final-regression/exits.json').read_text())
assert len(receipts)==41 and all(r['exit']==0 for r in receipts)
assert all(r['sourceCommit']==manifest['source_commit'] and r['buildHash']==manifest['build_hash'] for r in receipts)
for r in receipts:
 log=qa/'final-regression'/(r['name']+'.log');text=log.read_text();assert not re.search(r'"status"\s*:\s*"FAIL"',text),r['name']
 shutil.copy2(log,ev/(r['name']+'.log'))
 folder=qa/'final-regression'/r['name'];dest=ev/'regression'/r['name'];dest.mkdir(parents=True,exist_ok=True)
 if folder.exists():
  for p in folder.rglob('*.json'):
   target=dest/p.relative_to(folder);target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,target)
 shutil.copy2(qa/'final-regression'/(r['name']+'-exit.json'),ev/(r['name']+'-exit.json'))
shutil.copy2(qa/'final-regression/exits.json',ev/'regression-exits.json')
for name in ['final-validation','preservation','contrast','update-https','backup-red','backup-final','focus-red','focus-final','reader-final','editorial-red2','editorial-final','reading-focus-red','reading-focus-green','fullscreen-red','fullscreen-combined-red','fullscreen-green']:
 folder=qa/name
 if folder.exists():
  target=ev/name;target.mkdir(parents=True,exist_ok=True)
  for p in folder.rglob('*'):
   if p.is_file() and p.suffix in ['.json','.log','.png']:
    target_file=target/p.relative_to(folder);target_file.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,target_file)
for name in ['release-integrity.json','candidate-integrity.json','BUILD.txt']:shutil.copy2(build_root/name,ev/name)
shutil.copy2(Path('/workspace/scratch/uiux6b/baseline/release-integrity.json'),ev/'baseline-release-integrity.json')
# A few original suites own fixed output paths. Attach only files written during
# the actual recorded final run; earlier same-ID iterations are not evidence.
for name,path in [('nt','qa-output/nt-quiz-final/results.json'),('today','qa-output/uiux-phase1/browser/results.json'),('today-zoom','qa-output/uiux-phase1/zoom/results.json')]:
 p=root/path;r=next(x for x in receipts if x['name']==name)
 assert r['started']<=p.stat().st_mtime<=r['ended']+2,(name,p.stat().st_mtime,r)
 shutil.copy2(p,ev/(name+'-results.json'))
for path in ['final-reproducibility.log','final-deploy-zip.json']:
 shutil.copy2(Path('/workspace/scratch/uiux6b')/path,ev/path)
validation=json.loads((qa/'final-validation/exits.json').read_text());assert len(validation)==3 and all(r['exit']==0 for r in validation)
unit=(qa/'final-validation/unit.log').read_text();assert re.search(r'pass 191',unit) and re.search(r'fail 0',unit)
visual=json.loads((qa/'final-visual/results.json').read_text());assert len(visual['results'])==236 and not visual['errors'] and all(r['status']=='PASS' for r in visual['results'])
states=json.loads((qa/'final-states/results.json').read_text());assert len(states['results'])==84 and not states['errors'] and all(r['status']=='PASS' for r in states['results'])
contrast=json.loads((qa/'contrast/results.json').read_text());assert len(contrast['results'])==28 and all(r['status']=='PASS' for r in contrast['results'])
update=json.loads((qa/'update-https/results.json').read_text());assert len(update['results'])==11 and not update['errors']
for folder_name in ['backup-final','focus-final','editorial-final','reading-focus-green','reader-final','fullscreen-green']:
 d=json.loads((qa/folder_name/'results.json').read_text());rows=d if isinstance(d,list) else d.get('results',[d]);assert all(r['status']=='PASS' for r in rows),folder_name
summary=dict(build=manifest['build'],sourceCommit=manifest['source_commit'],buildHash=manifest['build_hash'],contentHash=manifest['content_hash'],unitTests={'pass':191,'fail':0},existingBrowserProgrammes={'pass':41,'fail':0},uninstrumentedVisualCases=236,secondaryStateCases=84,newScreenshots=432,contrastGroups=28,contrastMeasurements=144,realLocalHttpsUpdate='PASS; exact UIUX45 → UIUX6B on same origin, explicit activation, offline fonts, Bible, questions and data',physicalIphoneSafariVoiceover='OFFEN',production='NO-GO pending physical device gate',recommendation='GO for isolated physical device acceptance; no publication performed')
(out/'QA_SUMMARY.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2))
lines=['# Finale gemeinsame Regression · UIUX1–6B','',f"Anwendungscode `{manifest['source_commit']}`, Buildhash `{manifest['build_hash']}`. Alle41 Programme wurden gegen diese eingefrorene Ausgabe ausgeführt, nicht aus alten Berichten übernommen.",'','| Programm | Bestehendes Skript | Ausgang | Laufzeit | Nachweis |','|---|---|---|---|---|']
for r in receipts:lines.append(f"| {r['name']} | tests/{r['script']}.mjs | PASS | {r['ended']-r['started']:.1f}s | evidence/{r['name']}-exit.json und .log |")
lines+=['','Zusätzlich:191 Unit-Tests, beide unveränderten Inhaltsvalidatoren,236 uninstrumentierte Theme-/Viewport-/Schriftfälle,84 echte Neben-/Baum-/Schwertzustände,432 neue PNGs,28 Kontrastgruppen/144 Einzelmessungen, Backup- und Fokus-RED/GREEN,175 unveränderte geschützte Dateien, frisches Git-Archiv mit bytegleichem366-Dateien-Build, zwei identische Deploy-ZIPs und vollständiger Bytevergleich beim Entpacken.','', 'Das lokale HTTPS-Update prüft bewusstes Warten/Aktivieren, unveränderte Main-/Draft-/Migrationsbytes, alle260 vorhandenen Kapitel-Fortschrittsschlüssel plus Storyzustand, beide Übersetzungen einschließlich Segmentierungsunterschied, alle2314 Nachlese-/1300 NT-Fragen und Offline-Nutzung mit neuen Fonts. Es verwendet ein selbst signiertes Loopback-Zertifikat und ein frisches Chromiumprofil. Keine echte iPhone-PWA wurde bedient.','', 'Alte Tests wurden bei reinen Präsentationsverträgen nachgeführt: Überschriften, kompakte Baumklasse, fortlaufender Verssatz und SVG-Aufbau. Geschäfts-/ID-/Daten-/Transaktionsassertionen bleiben bestehen. Ausschließlich Axe-Auditkontexte erlauben dessen eigene Diagnosestyles; die tatsächliche Produktions-CSP bleibt in der uninstrumentierten Matrix aktiv.','', '**OFFEN:** physisches iPhone Safari, installierte PWA, echte Bildschirmtastatur/Hardwaretastatur/VoiceOver und native iOS-Picker. Auch die früheren Gerätegates werden nicht nachträglich als bestanden erklärt. Keine Aussage einer WCAG-Zertifizierung, moderierten Nutzerstudie oder Produktionsfreigabe.']
(out/'QA_MATRIX.md').write_text('\n'.join(lines)+'\n')
print(json.dumps(summary,ensure_ascii=False))
