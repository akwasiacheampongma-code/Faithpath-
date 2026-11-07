#!/usr/bin/env python3
"""Generate one Luther-1912 chapter locally; cached, restartable, no cloud calls.

Example: python tools/bible-audio/generate.py --book MAT --chapter 1
  --models /path/to/models --out /path/to/audio-jobs
The model is downloaded only by the separate prepare_model.py, never here.
"""
import argparse
import hashlib
import importlib.metadata
import json
import os
from pathlib import Path
import subprocess
import time

TOOL = Path(__file__).resolve().parent
os.environ['HF_HUB_OFFLINE'] = '1'
os.environ['TRANSFORMERS_OFFLINE'] = '1'
os.environ['HF_HUB_DISABLE_TELEMETRY'] = '1'

import numpy as np
import soundfile as sf
from audio_processing import split_text, trim_edges, join_clips, parse_loudness
from jobs import SegmentCache, chapter_source, digest, sha256, atomic_json, job_lock, verified_report


def load_voice(model_dir, settings, lexicon):
    import torch
    torch.set_num_threads(settings['num_threads'])
    torch.set_num_interop_threads(settings['inter_op_threads'])
    from TTS.api import TTS
    from pronunciation import BiblicalGruut
    if importlib.metadata.version('coqui-tts') != settings['engine_version']:
        raise ValueError('Unreviewed coqui-tts version; create a new reviewed profile')
    voice = TTS(model_path=str(model_dir/'model_file.pth'), config_path=str(model_dir/'config.json'), progress_bar=False).to('cpu')
    model = voice.synthesizer.tts_model
    # These are real attributes consumed by Vits.inference() in this exact engine.
    model.length_scale = settings['length_scale']
    model.inference_noise_scale = settings['inference_noise_scale']
    model.inference_noise_scale_dp = settings['inference_noise_scale_dp']
    config = json.loads((model_dir/'config.json').read_text())
    model.tokenizer.phonemizer = BiblicalGruut.from_file(lexicon, allowed=config['characters']['characters'])
    return voice


def measure_loudness(wav):
    result = subprocess.run(['ffmpeg','-hide_banner','-i',str(wav),'-af','loudnorm=I=-18:TP=-1.5:LRA=11:print_format=json','-f','null','-'], capture_output=True, text=True, check=True)
    return parse_loudness(result.stderr)


def run(args):
    tick = time.monotonic()
    settings = json.loads(args.settings.read_text())
    source = chapter_source(args.bibles, args.book, args.chapter)
    selected = {int(x) for x in args.verses.split(',')} if args.verses else {v[0] for v in source['verses']}
    if not selected or not selected <= {v[0] for v in source['verses']}:
        raise ValueError('Requested verse does not exist')
    complete = len(selected) == len(source['verses'])
    lexicon = TOOL/'pronunciations.json'
    model_dir = args.models/'coqui-thorsten-vits/tts_models--de--thorsten--vits'
    if sha256(model_dir/'model_file.pth') != settings['model_sha256']:
        raise ValueError('Unreviewed model weights')
    config_hash = sha256(model_dir/'config.json')
    if config_hash != 'f24e159768a8fc460764ccb163e37a08cd3c3d424bdb4f5a9e196636e58c0832':
        raise ValueError('Unreviewed model configuration')
    versions = {name:importlib.metadata.version(name) for name in ('coqui-tts','torch','torchaudio','gruut','gruut-lang-de','numpy','soundfile')}
    identity = {'source':source, 'selected':sorted(selected), 'settings':settings,
                'lexicon_sha256':sha256(lexicon), 'model_config_sha256':config_hash, 'versions':versions,
                'code':{name:sha256(TOOL/name) for name in ('generate.py','pronunciation.py','audio_processing.py','jobs.py')}}
    key = digest(identity)
    folder = args.out/f"l1912-{args.book}-{args.chapter:03d}-{'full' if complete else 'probe'}-{key[:12]}"
    folder.mkdir(parents=True, exist_ok=True)
    os.environ['XDG_CACHE_HOME'] = str(args.out/'.cache')
    os.environ['TTS_HOME'] = str(args.models)
    with job_lock(folder/'generation.lock'):
        report_path = folder/'generation-report.json'
        stem = f"{args.book.lower()}-{args.chapter:03d}-luther1912-thorsten-optimiert"
        if verified_report(folder, key, [stem+'.wav',stem+'.mp3','source.json','verse-timeline.json']):
            print(json.dumps({'status':'verified-output-cache-hit','directory':str(folder),'identity_sha256':key}), flush=True)
            return folder
        cache = SegmentCache(folder/'segments')
        cache_hits, voice, sr = 0, None, None
        verses, verse_clips = [], []
        for number, text in source['verses']:
            if number not in selected:
                continue
            pieces, records = [], []
            segments = split_text(text)
            for index, segment in enumerate(segments):
                segment_key = f'{number:03d}-{index:03d}'
                cached = cache.get(segment_key)
                if cached and cached[2].get('text') == segment and cached[2].get('identity_sha256') == key:
                    samples, rate, info = cached
                    cache_hits += 1
                else:
                    if voice is None:
                        voice = load_voice(model_dir, settings, lexicon)
                    import torch
                    seed = int(hashlib.sha256(f"{settings['seed']}:{args.book}:{args.chapter}:{number}:{index}".encode()).hexdigest()[:8], 16)
                    torch.manual_seed(seed); np.random.seed(seed)
                    phonemizer = voice.synthesizer.tts_model.tokenizer.phonemizer
                    phonemizer.applied.clear()
                    started = time.monotonic()
                    raw = np.asarray(voice.tts(text=segment, split_sentences=False), dtype=np.float32)
                    rate = voice.synthesizer.output_sample_rate
                    samples, trim = trim_edges(raw, rate, settings['edge_guard_seconds'], settings['edge_threshold'])
                    info = {'identity_sha256':key, 'verse':number, 'segment':index, 'text':segment,
                            'seed':seed, 'raw_duration_seconds':len(raw)/rate, 'trim':trim,
                            'pronunciations':list(phonemizer.applied), 'generation_seconds':time.monotonic()-started}
                    cache.save(segment_key, samples, rate, info)
                if sr is not None and sr != rate:
                    raise ValueError('Sample rate changed')
                sr = rate; pieces.append(samples); records.append(info)
            gaps = [settings['clause_pause_seconds'] if text_piece[-1:] in ';:' else settings['sentence_pause_seconds'] for text_piece in segments[:-1]]
            samples, _ = join_clips(pieces, sr, gaps, settings['edge_guard_seconds'])
            verse_clips.append(samples)
            row = {'verse':number, 'text':text, 'text_sha256':digest(text), 'segments':records,
                   'sample_count':len(samples), 'duration_seconds':len(samples)/sr}
            verses.append(row)
            print(f'{args.book} {args.chapter}:{number} – {len(samples)/sr:.2f}s', flush=True)
        chapter, starts = join_clips(verse_clips, sr, [settings['verse_pause_seconds']]*(len(verse_clips)-1), settings['edge_guard_seconds'])
        silence = lambda sec:np.zeros(round(sr*sec), dtype=np.float32)
        intro = silence(settings['initial_silence_seconds'])
        chapter = np.concatenate([intro, chapter, silence(settings['final_silence_seconds'])])
        temp_wav = folder/'chapter-unmastered.tmp.wav'
        sf.write(temp_wav, chapter, sr, subtype='FLOAT')
        measured = measure_loudness(temp_wav)
        input_lufs = float(measured['input_i'])
        if not np.isfinite(input_lufs):
            raise ValueError('Invalid loudness measurement')
        desired_gain = 10**((settings['target_lufs']-input_lufs)/20)
        gain = min(desired_gain, settings['peak_ceiling']/float(np.abs(chapter).max()))
        chapter *= gain  # one chapter-wide scalar; no per-verse loudness pumping
        stem = f"{args.book.lower()}-{args.chapter:03d}-luther1912-thorsten-optimiert"
        wav, mp3 = folder/(stem+'.wav'), folder/(stem+'.mp3')
        final_tmp = folder/'chapter-final.tmp.wav'
        sf.write(final_tmp, chapter, sr, subtype='PCM_16'); os.replace(final_tmp, wav)
        mp3_tmp = folder/'chapter-final.tmp.mp3'
        subprocess.run(['ffmpeg','-v','error','-y','-i',str(wav),'-c:a','libmp3lame','-b:a',settings['mp3_bitrate'],
                        '-metadata',f"title={source['name']} {args.chapter} – Luther 1912",
                        '-metadata','artist=KI-Stimme: Coqui Thorsten VITS',
                        '-metadata','comment=Lokal synthetisiert; keine menschliche Aufnahme',str(mp3_tmp)], check=True)
        os.replace(mp3_tmp, mp3); temp_wav.unlink()
        (folder/'verses').mkdir(exist_ok=True)
        for row, clip, start in zip(verses, verse_clips, starts):
            row['start_seconds'] = (start+len(intro))/sr
            row['end_seconds'] = row['start_seconds']+len(clip)/sr
            row['file'] = f"verses/verse-{row['verse']:02d}.wav"
            # These normalized verse clips are QA inputs, not a second source of truth.
            sf.write(folder/row['file'], clip*gain, sr, subtype='PCM_16')
        atomic_json(folder/'source.json', source)
        atomic_json(folder/'verse-timeline.json', verses)
        report = {'status':'generated-for-review','complete':complete,'identity_sha256':key,'identity':identity,
                  'verse_count':len(verses),'sample_rate':sr,'duration_seconds':len(chapter)/sr,
                  'cache_hits':cache_hits,'segment_count':sum(len(v['segments']) for v in verses),
                  'gain':gain,'loudness_before':measured,'loudness_after':measure_loudness(wav),
                  'elapsed_seconds':time.monotonic()-tick,
                  'outputs':{p.name:{'sha256':sha256(p),'bytes':p.stat().st_size} for p in [wav,mp3,folder/'source.json',folder/'verse-timeline.json']}}
        atomic_json(report_path, report)
        print(json.dumps({'status':report['status'],'complete':complete,'directory':str(folder),
                          'duration_seconds':report['duration_seconds'],'cache_hits':cache_hits}), flush=True)
        return folder


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--book', required=True)
    p.add_argument('--chapter', type=int, required=True)
    p.add_argument('--bibles', type=Path, default=TOOL.parents[1]/'data/bibles')
    p.add_argument('--models', type=Path, default=TOOL/'models')
    p.add_argument('--out', type=Path, default=TOOL/'output')
    p.add_argument('--settings', type=Path, default=TOOL/'settings.json')
    p.add_argument('--verses', help='Explicit QA probe only, e.g. 2,7,12; never labelled a full chapter')
    try:
        run(p.parse_args())
    except (ValueError, OSError, subprocess.CalledProcessError) as error:
        p.exit(1, f'Kapitel nicht abgeschlossen: {error}. Verifizierte Teilstücke bleiben zum Fortsetzen erhalten.\n')


if __name__ == '__main__':
    main()
