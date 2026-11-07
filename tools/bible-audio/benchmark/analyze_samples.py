#!/usr/bin/env python3
"""Decode delivered MP3s, measure actual audio, optionally run local German ASR.

No naturalness, pronunciation or listening score is inferred from measurements.
"""
import argparse
import json
import subprocess
import sys
import time
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from audio_processing import parse_loudness
from compare_quality import word_edits
from jobs import atomic_json, sha256


def analyze(root, output, models=None):
    recognizer = None
    if models:
        import sherpa_onnx
        model = models / 'sherpa-onnx-whisper-base'
        recognizer = sherpa_onnx.OfflineRecognizer.from_whisper(
            encoder=str(model / 'base-encoder.int8.onnx'),
            decoder=str(model / 'base-decoder.int8.onnx'),
            tokens=str(model / 'base-tokens.txt'),
            language='de', task='transcribe', num_threads=1)
    findings = []
    for manifest in sorted(root.glob('*/manifest.json')):
        data = json.loads(manifest.read_text())
        for passage in data['passages']:
            filename = next(n for n in passage['files'] if n.endswith('.mp3'))
            path = manifest.parent / filename
            if sha256(path) != passage['files'][filename]:
                raise ValueError('Delivered MP3 checksum mismatch')
            tick = time.monotonic()
            raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', str(path),
                                           '-f', 'f32le', '-ar', '16000', '-ac', '1', 'pipe:1'])
            samples = np.frombuffer(raw, dtype='<f4')
            duration = len(samples) / 16000
            if (not len(samples) or not np.isfinite(samples).all() or
                    abs(duration - passage['duration_seconds']) > .02):
                raise ValueError('Empty, invalid or truncated delivered audio')
            if float(np.max(np.abs(samples))) >= .9999:
                raise ValueError('Decoded audio reaches clipping level')
            loud = subprocess.run(['ffmpeg', '-hide_banner', '-i', str(path),
                                   '-af', 'loudnorm=I=-20:TP=-1.5:LRA=11:print_format=json',
                                   '-f', 'null', '-'], capture_output=True, text=True, check=True)
            steps = [samples[i:i+160] for i in range(0, len(samples), 160)]
            quiet = [len(s)/16000 if np.sqrt(np.mean(s*s)) < .003 else 0 for s in steps]
            longest, run = 0, 0
            for value in quiet:
                run = run + value if value else 0
                longest = max(longest, run)
            item = {'candidate': data['candidate'], 'file': str(path.relative_to(root)),
                    'sha256': sha256(path), 'first_verse': passage['first_verse'],
                    'last_verse': passage['last_verse'], 'verse_count': len(passage['verses']),
                    'duration_seconds': duration, 'sample_peak_16k_mono': float(np.max(np.abs(samples))),
                    'loudness': parse_loudness(loud.stderr),
                    'longest_quiet_seconds_rms_below_0_003': longest,
                    'quiet_seconds_rms_below_0_003': sum(quiet),
                    'technical_analysis_seconds': time.monotonic() - tick,
                    'asr': [], 'human_listening': 'OPEN'}
            if recognizer:
                for row in passage['timeline']:
                    tick = time.monotonic()
                    segment = samples[round(row['start_seconds']*16000):round(row['end_seconds']*16000)]
                    stream = recognizer.create_stream()
                    stream.accept_waveform(16000, segment)
                    recognizer.decode_stream(stream)
                    text = stream.result.text.strip()
                    edits, count = word_edits(row['text'], text)
                    item['asr'].append({'verse': row['verse'], 'reference': row['text'],
                                        'recognition': text, 'normalized_word_edits': edits,
                                        'normalized_reference_words': count,
                                        'elapsed_seconds': time.monotonic() - tick})
                    print(f'{data["candidate"]} {row["verse"]}: {text}', flush=True)
                item['asr_word_error_rate'] = sum(r['normalized_word_edits'] for r in item['asr']) / sum(r['normalized_reference_words'] for r in item['asr'])
            findings.append(item)
            atomic_json(output, {'method': 'FFmpeg delivered-MP3 decode; optional Sherpa Whisper base int8 German, 1 thread',
                                 'limitations': 'ASR disagreements are review flags, not verified omissions or pronunciation errors. No human hearing or long-listening acceptance.',
                                 'results': findings})
    return findings


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--asr-models', type=Path)
    args = parser.parse_args()
    analyze(args.root, args.output, args.asr_models)
