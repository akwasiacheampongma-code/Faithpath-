#!/usr/bin/env python3
"""Technical checks; PASS never stands for human listening or correct pronunciation."""
import argparse
import json
from pathlib import Path
import subprocess

import numpy as np
import soundfile as sf
from jobs import sha256, atomic_json, chapter_source, SegmentCache
from generate import measure_loudness


def timeline_samples_valid(rows, sample_count, sr):
    ranges=[(round(row['start_seconds']*sr),round(row['end_seconds']*sr))for row in rows]
    return bool(ranges) and all(0<=start<end<=sample_count for start,end in ranges) and all(a[1]<=b[0]for a,b in zip(ranges,ranges[1:]))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--job', type=Path, required=True)
    parser.add_argument('--bibles', type=Path, required=True)
    parser.add_argument('--web-reference', type=Path)
    args = parser.parse_args()
    folder = args.job
    report = json.loads((folder/'generation-report.json').read_text())
    source = json.loads((folder/'source.json').read_text())
    rows = json.loads((folder/'verse-timeline.json').read_text())
    original = chapter_source(args.bibles, source['book'], source['chapter'])
    checks = []
    def check(name, passed, evidence):
        checks.append({'test':name,'status':'PASS' if passed else 'FAIL','evidence':evidence})
    check('Original text, verse numbers and order',source == original and [r['text'] for r in rows] == [v[1] for v in original['verses']] and [r['verse'] for r in rows] == [v[0] for v in original['verses']],{'book_sha256':source['book_sha256'],'verse_count':len(rows)})
    check('Full chapter, no probe labelled complete',report['complete'] and report['verse_count']==len(original['verses']),report['complete'])
    check('Every synthesis input matches the complete original verse',all(' '.join(x['text']for x in row['segments'])==row['text'] for row in rows),'Exact strings including punctuation; no source spelling replacements')
    check('Published output checksums',all(sha256(folder/name)==v['sha256'] for name,v in report['outputs'].items()),report['outputs'])
    if args.web_reference:
        reference = json.loads(args.web_reference.read_text())
        check('Independent eBible web text',reference['verses']==source['verses'],reference['url'])
    wav = next(folder.glob('*optimiert.wav'))
    mp3 = wav.with_suffix('.mp3')
    x, sr = sf.read(wav,dtype='float32')
    info = sf.info(wav)
    check('Mono PCM16 22.05kHz, finite audio',sr==22050 and info.channels==1 and info.subtype=='PCM_16' and np.isfinite(x).all(),{'sample_rate':sr,'frames':len(x),'subtype':info.subtype})
    peak = float(np.max(np.abs(x)))
    check('No PCM clipping',0.01<peak<1 and not np.any(np.abs(x)>=.9999),{'peak':peak,'rms':float(np.sqrt(np.mean(x*x)))})
    check('Exact sample count and timeline',abs(len(x)/sr-report['duration_seconds'])<1/sr and timeline_samples_valid(rows,len(x),sr),{'duration_seconds':len(x)/sr,'last_verse_end':rows[-1]['end_seconds'],'method':'Integer sample boundaries; no floating-point ordering false positives'})
    cache = SegmentCache(folder/'segments')
    keys=[f"{r['verse']:03d}-{i:03d}"for r in rows for i,_ in enumerate(r['segments'])]
    check('All synthesized segments have verified audio',all(cache.get(key) is not None for key in keys),{'segments':len(keys)})
    verse_ok=True
    for row in rows:
        clip, rate=sf.read(folder/row['file'],dtype='float32')
        verse_ok &= bool(rate==sr and len(clip)==row['sample_count'] and np.isfinite(clip).all() and np.sqrt(np.mean(clip**2))>.001)
    check('Every verse has nonempty QA audio',verse_ok,{'verses':len(rows)})
    raw=subprocess.check_output(['ffmpeg','-v','error','-i',str(mp3),'-f','f32le','-ac','1','-ar',str(sr),'pipe:1'])
    decoded=np.frombuffer(raw,dtype='<f4')
    check('MP3 decodes completely',np.isfinite(decoded).all() and abs(len(decoded)-len(x))<sr*.15,{'decoded_seconds':len(decoded)/sr,'wav_seconds':len(x)/sr})
    measurement=measure_loudness(mp3)
    check('Encoded true peak below 0dBTP',float(measurement['input_tp'])<0,measurement)
    output={'checks':checks,'passed':sum(c['status']=='PASS' for c in checks),'failed':sum(c['status']=='FAIL'for c in checks),'human_listening':'OPEN','name_pronunciation_acceptance':'OPEN','speech_completeness':'ASR flags plus manual listening required; generated inputs alone are not proof of every audible word'}
    atomic_json(folder/'qa/technical-results.json',output)
    print(json.dumps(output,ensure_ascii=False,indent=2))
    if output['failed']:
        raise SystemExit(1)


if __name__=='__main__':
    main()
