"""Package a verified existing build and separate QA files; no publish action."""
from pathlib import Path
import argparse
import hashlib
import json
import shutil
import subprocess
import zipfile

REPORT = Path(__file__).resolve().parent
REPO = REPORT.parents[1]
sha = lambda content: hashlib.sha256(content).hexdigest()

def zip_files(target, files):
    with zipfile.ZipFile(target, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=6) as archive:
        for name, content in sorted(files):
            entry = zipfile.ZipInfo(name, date_time=(2026, 11, 4, 0, 0, 0))
            entry.compress_type = zipfile.ZIP_DEFLATED
            entry.external_attr = 0o100644 << 16
            archive.writestr(entry, content)
    with zipfile.ZipFile(target) as archive:
        assert archive.testzip() is None

def repeated_zip(target, files):
    zip_files(target, files)
    repeat = target.with_suffix('.repeat.zip')
    zip_files(repeat, files)
    assert target.read_bytes() == repeat.read_bytes()
    repeat.unlink()

def package(build, output):
    output.mkdir(parents=True, exist_ok=True)
    receipt = json.loads((build / 'release-integrity.json').read_text())
    for name, digest in receipt['files'].items():
        assert sha((build / name).read_bytes()) == digest, name
    assert receipt['build'] == 'FP4-20261104-G-SIMPLE-STEPS-QA1'
    branch = subprocess.check_output(['git', 'branch', '--show-current'], cwd=REPO, text=True).strip()
    assert branch == 'feature/simplified-step-experience-20261104'
    delivery = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=REPO, text=True).strip()
    app_files = [(str(file.relative_to(build)), file.read_bytes()) for file in build.rglob('*') if file.is_file()]
    assert len(app_files) == len(receipt['files']) + 1
    app_zip = output / 'FaithPath_Schritt_Hilfe_Preview.zip'
    repeated_zip(app_zip, app_files)
    metadata = f'Branch: {branch}\nDelivery commit: {delivery}\nRuntime commit: {receipt["source_commit"]}\nBuild: {receipt["build"]}\nBuild hash: {receipt["build_hash"]}\nNo merge / no deployment.\n'
    qa_files = [('FaithPath_Schritt_Hilfe_QA/' + str(file.relative_to(REPORT)), file.read_bytes())
                for file in REPORT.rglob('*') if file.is_file() and '__pycache__' not in str(file)]
    qa_files.append(('FaithPath_Schritt_Hilfe_QA/GIT_COMMIT.txt', metadata.encode()))
    qa_zip = output / 'FaithPath_Schritt_Hilfe_QA.zip'
    repeated_zip(qa_zip, qa_files)
    for source, target in [('BERICHT.pdf','FaithPath_Schritt_Hilfe_Bericht.pdf'),
                           ('screenshots/comparisons/seed-390-comparison.png','Erster_Weg_Vorher_Nachher_390.png'),
                           ('screenshots/comparisons/step-390-comparison.png','Schritt_Hinzufuegen_Vorher_Nachher_390.png')]:
        shutil.copyfile(REPORT / source, output / target)
    (output / 'GIT_COMMIT.txt').write_text(metadata)
    (output / 'START_HIER.txt').write_text('FaithPath – vereinfachte Schritt-Hilfe\n\nPreview-ZIP in einen eigenen Ordner entpacken. Dort starten:\npython3 -m http.server 4760 --bind 127.0.0.1\n\nDann http://127.0.0.1:4760/ in einem separaten Browserprofil öffnen. Keine echten Nutzerdaten für diese QA verwenden. Für neue Schritte: Einführung freiwillig starten und bis zum Schritt gehen. Für spätere Schritte: einen Weg öffnen und Schritt hinzufügen.\n\nQA-ZIP: Bericht, echte Vorher-/Nachher-Bilder und Maschinenresultate. QA_INDEX.html ist die Übersicht; Bilder und PDF können separat geöffnet werden.\n\nKeine Veröffentlichung erfolgt. Echte Safari/iPhone/VoiceOver-Prüfungen und Teile der manuellen Accessibility-Abnahme bleiben offen.\n')
    verification = {'status':'PASS','deliveryCommit':delivery,'runtimeCommit':receipt['source_commit'],
                    'build':receipt['build'],'buildHash':receipt['build_hash'],'contentHash':receipt['content_hash'],
                    'appFileCount':len(app_files),'appZIP_SHA256':sha(app_zip.read_bytes()),
                    'qaZIP_SHA256':sha(qa_zip.read_bytes()),'twoArchivesByteIdentical':True,'crcVerified':True}
    (output / 'VERIFICATION.json').write_text(json.dumps(verification, indent=2) + '\n')
    refresh_sums(output)
    print(json.dumps(verification))

def refresh_sums(output):
    (output / 'SHA256SUMS.txt').write_text(''.join(sha(file.read_bytes())+'  '+str(file.relative_to(output))+'\n'
        for file in sorted(output.rglob('*')) if file.is_file() and file.name != 'SHA256SUMS.txt'))

if __name__ == '__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('build',type=Path)
    parser.add_argument('output',type=Path)
    args=parser.parse_args()
    package(args.build,args.output)
