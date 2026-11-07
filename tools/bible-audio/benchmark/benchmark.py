#!/usr/bin/env python3
"""Extract identical, source-verified audition passages. Never download models.

This tool does not generate a new voice. Its reports identify the original job,
model, sample boundaries and checksums. Auditory ratings require human input.
"""
import argparse
import html
import json
import math
import re
import subprocess
import sys
import tempfile
import wave
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from jobs import atomic_json, chapter_source, digest, job_lock, sha256

PASSAGES = ((20, 24), (29, 32))
WEIGHTS = {'naturalness': .30, 'pronunciation': .25, 'long_listening': .20,
           'dialogue': .15, 'technical': .10}


def weighted_score(ratings):
    """1–5 listening worksheet. Missing evidence must never become a score."""
    for key in WEIGHTS:
        value = ratings.get(key)
        if value is not None and (isinstance(value, bool) or not isinstance(value, (int, float))
                                  or not math.isfinite(value) or not 1 <= value <= 5):
            raise ValueError('Ratings must be finite numbers between 1 and 5')
    if any(ratings.get(key) is None for key in WEIGHTS):
        return None
    return sum(WEIGHTS[key] * ratings[key] for key in WEIGHTS)


def validate_media_path(value):
    if not re.fullmatch(r'[a-z0-9][a-z0-9-]{0,63}', value):
        raise ValueError('Use a short lowercase candidate ID, no path or HTML')
    return value


def select_rows(source, rows, first, last, duration):
    """Reject altered text, duplicates, gaps and invalid/overlapping timestamps."""
    original = dict(source['verses'])
    numbers = [row['verse'] for row in rows]
    if len(set(numbers)) != len(numbers) or numbers != sorted(numbers):
        raise ValueError('Duplicate or reordered verse timeline')
    previous_end = 0.0
    for row in rows:
        start, end = row['start_seconds'], row['end_seconds']
        if (not math.isfinite(start) or not math.isfinite(end) or
                start < previous_end - 1e-9 or not 0 <= start < end <= duration + 1e-9):
            raise ValueError('Invalid verse sample boundaries')
        if original.get(row['verse']) != row['text']:
            raise ValueError('Timeline does not match unaltered Luther-1912 source')
        previous_end = end
    selected = [row for row in rows if first <= row['verse'] <= last]
    if [row['verse'] for row in selected] != list(range(first, last + 1)):
        raise ValueError('Missing requested verse')
    return selected


def checked_job(job, bibles):
    report = json.loads((job / 'generation-report.json').read_text())
    source = chapter_source(bibles, 'LUK', 15)
    if json.loads((job / 'source.json').read_text()) != source or len(source['verses']) != 32:
        raise ValueError('Expected verified 32-verse Luke 15 source')
    if report['identity']['source'] != source:
        raise ValueError('Source in job identity differs')
    if digest(report['identity']) != report['identity_sha256']:
        raise ValueError('Original job identity checksum differs')
    if report['identity']['settings'].get('model') != 'tts_models/de/thorsten/vits':
        raise ValueError('This extractor currently labels only verified Coqui jobs')
    required = {'source.json', 'verse-timeline.json'}
    if not required <= report['outputs'].keys():
        raise ValueError('Original job omits required checksums')
    for name, details in report['outputs'].items():
        path = job / name
        if not path.resolve().is_relative_to(job.resolve()) or sha256(path) != details['sha256']:
            raise ValueError(f'Corrupt or unsafe original job output: {name}')
    wavs = list(job.glob('*optimiert.wav'))
    if len(wavs) != 1:
        raise ValueError('Expected exactly one original full/probe WAV')
    if wavs[0].name not in report['outputs']:
        raise ValueError('Original audio has no checksum')
    return report, source, wavs[0]


def extract(job, bibles, out, candidate):
    candidate = validate_media_path(candidate)
    report, source, wav = checked_job(job, bibles)
    rows = json.loads((job / 'verse-timeline.json').read_text())
    identity = digest({'source': source, 'original_job': report['identity_sha256'],
                       'original_wav': sha256(wav), 'extractor': sha256(__file__),
                       'ffmpeg': subprocess.check_output(['ffmpeg', '-version'], text=True).splitlines()[0]})
    folder = out / f'{candidate}-{identity[:12]}'
    folder.mkdir(parents=True, exist_ok=True)
    with job_lock(folder / 'extraction.lock'):
        with wave.open(str(wav), 'rb') as reader:
            sr, width, channels = reader.getframerate(), reader.getsampwidth(), reader.getnchannels()
            if (width, channels) != (2, 1):
                raise ValueError('Expected original mono PCM16 audio')
            duration = reader.getnframes() / sr
            items = []
            for first, last in PASSAGES:
                selected = select_rows(source, rows, first, last, duration)
                start, end = round(selected[0]['start_seconds'] * sr), round(selected[-1]['end_seconds'] * sr)
                reader.setpos(start)
                pcm = reader.readframes(end - start)
                if len(pcm) != (end - start) * width:
                    raise ValueError('Unexpected truncated source audio')
                name = f'{candidate}-luk-15-{first}-{last}'
                audio, mp3 = folder / (name + '.wav'), folder / (name + '.mp3')
                # Keep original verse-edge protection; add only silent audition margins.
                head, tail = round(.16 * sr), round(.35 * sr)
                with tempfile.TemporaryDirectory(dir=folder) as temp:
                    tmpwav, tmpmp3 = Path(temp) / 'clip.wav', Path(temp) / 'clip.mp3'
                    with wave.open(str(tmpwav), 'wb') as writer:
                        writer.setparams((1, 2, sr, 0, 'NONE', 'not compressed'))
                        writer.writeframes(b'\0' * (head * 2) + pcm + b'\0' * (tail * 2))
                    subprocess.run(['ffmpeg', '-v', 'error', '-i', str(tmpwav), '-c:a', 'libmp3lame',
                                    '-b:a', '128k', '-map_metadata', '-1', '-metadata',
                                    f'title=Lukas 15,{first}–{last} – Luther 1912',
                                    '-metadata', 'artist=KI-generierte Vorlesung: Coqui Thorsten VITS',
                                    '-metadata', f'comment=Benchmark {candidate}; original job {report["identity_sha256"]}',
                                    str(tmpmp3)], check=True)
                    tmpwav.replace(audio)
                    tmpmp3.replace(mp3)
                text = [[r['verse'], r['text']] for r in selected]
                timeline = [{'verse': r['verse'], 'text': r['text'],
                             'start_seconds': (round(r['start_seconds'] * sr) - start + head) / sr,
                             'end_seconds': (round(r['end_seconds'] * sr) - start + head) / sr}
                            for r in selected]
                metadata = {'candidate': candidate, 'kind': 'extracted-existing-synthesis',
                            'book': 'LUK', 'chapter': 15, 'translation': 'l1912',
                            'first_verse': first, 'last_verse': last, 'verses': text,
                            'text_sha256': digest(text), 'source_book_sha256': source['book_sha256'],
                            'original_job_identity': report['identity_sha256'],
                            'original_wav_sha256': sha256(wav), 'original_samples': [start, end],
                            'sample_rate': sr, 'duration_seconds': (head + end - start + tail) / sr,
                            'timeline': timeline,
                            'files': {p.name: sha256(p) for p in [audio, mp3]}}
                atomic_json(folder / (name + '.json'), metadata)
                items.append(metadata)
        atomic_json(folder / 'manifest.json', {'identity': identity, 'candidate': candidate, 'passages': items,
                                             'extractor_sha256': sha256(__file__),
                                             'synthesis_settings': report['identity']['settings'],
                                             'original_generation_seconds': report['elapsed_seconds'],
                                             'original_generation_verse_count': len(rows),
                                             'original_generation_audio_seconds': duration,
                                             'new_model_generation': False})
    return folder


def gallery(out):
    """Embed playable clips; never create players for an unexecuted model."""
    import base64
    cards = []
    has_css10 = False
    for manifest in sorted(out.glob('*/manifest.json')):
        data = json.loads(manifest.read_text())
        has_css10 = has_css10 or data['candidate'] == 'css10-neon'
        sections = []
        for p in data['passages']:
            filename = next(name for name in p['files'] if name.endswith('.mp3'))
            file = manifest.parent / filename
            if sha256(file) != p['files'][filename]:
                raise ValueError('Corrupt gallery audio')
            encoded = base64.b64encode(file.read_bytes()).decode()
            text = ''.join(f'<p><sup>{n}</sup> {html.escape(t)}</p>' for n, t in p['verses'])
            sections.append(f'<h3>Lukas 15,{p["first_verse"]}–{p["last_verse"]}</h3>'
                            f'<audio controls preload="none" src="data:audio/mpeg;base64,{encoded}"></audio>'
                            f'<p><a href="{manifest.parent.name}/{filename}" download>MP3 herunterladen</a> · {p["duration_seconds"]:.1f} Sekunden</p>'
                            f'<details><summary>Bibeltext anzeigen</summary>{text}</details>')
        label = {'coqui-c': 'Thorsten VITS · C', 'coqui-balanced': 'Thorsten · kürzerer Rhythmus',
                 'css10-neon': 'CSS10 / Neon · weitere Stimme'}.get(data['candidate'], data['candidate'])
        cards.append(f'<section><h2>{html.escape(label)}</h2>' + ''.join(sections) + '</section>')
    document = '''<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>FaithPath · Stimmenprüfung</title><style>
:root{font-family:system-ui;color:#192a23;background:#f6f3ec;color-scheme:light}*{box-sizing:border-box}body{max-width:48rem;margin:auto;padding:clamp(.75rem,4vw,1rem);line-height:1.6;overflow-wrap:anywhere;hyphens:auto}
h1{font-size:clamp(1.6rem,6vw,2.4rem);line-height:1.15}section{background:white;border:1px solid #bbc6bb;border-radius:1rem;padding:1rem;margin:1.3rem 0}
audio{width:100%;min-width:0;max-width:100%}a{color:#184b3e;display:inline-block;padding:.6rem .1rem}sup{color:#566457}summary{padding:.7rem 0;cursor:pointer}
:focus-visible{outline:3px solid #9d6023;outline-offset:4px}.notice{padding:1rem;background:#e4ebdf;border-radius:.6rem}p{overflow-wrap:anywhere}
@media(prefers-color-scheme:dark){:root{color:#e9ece6;background:#151d1a;color-scheme:dark}section{background:#202c26}a{color:#b8dcc9}.notice{background:#2d3a2b}sup{color:#bdc9be}}
</style><main><p>FAITHPATH · LOKALE HÖRPRÜFUNG</p><h1>Welche Stimme trägt die Geschichte?</h1>
<p class="notice"><strong>Teilprüfung · Auswahl offen.</strong> Beide hörbaren Fassungen verwenden Coqui Thorsten VITS. CosyVoice3, Qwen3-TTS und Chatterbox sind wegen gesperrter Modelldownloads noch nicht getestet.</p>
<p>KI-generierte Vorlesung · keine menschliche Aufnahme. Originaltext: Luther 1912. Kein Autoplay, keine externe Verbindung. Erst hören, dann bewerten.</p>
<p><a href="VOICE_BENCHMARK_REPORT.md">Prüfbericht</a> · <a href="VOICE_LICENSE_REVIEW.md">Rechteprüfung</a> · <a href="LISTENING_SHEET.csv" download>Hörbogen</a></p>'''
    if has_css10:
        document = document.replace('Beide hörbaren Fassungen verwenden Coqui Thorsten VITS.',
                                    'Hier sind zwei unterschiedliche Stimmen hörbar: Thorsten VITS und CSS10/Neon. Die kommerziellen Sprecherrechte von CSS10 bleiben offen.')
    document += ''.join(cards) + '''<h2>Was noch offen ist</h2><p>Natürlichkeit, Aussprache, Dialogwirkung und angenehmes Zuhören über 20–30 Minuten benötigen echte Hörprüfungen. Aus ASR oder Pegeln wird kein Klangurteil berechnet.</p></main>
<script>document.addEventListener('play',e=>{if(e.target.tagName==='AUDIO')document.querySelectorAll('audio').forEach(a=>{if(a!==e.target)a.pause()})},true)</script></html>'''
    (out / 'index.html').write_text(document)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--job', type=Path)
    parser.add_argument('--bibles', type=Path, default=HERE.parents[2] / 'data/bibles')
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--id')
    parser.add_argument('--gallery', action='store_true')
    args = parser.parse_args()
    if args.gallery:
        gallery(args.out)
    elif args.job and args.id:
        print(extract(args.job, args.bibles, args.out, args.id))
    else:
        parser.error('Supply --job and --id, or --gallery')
