#!/usr/bin/env python3
"""Local additional-voice audition using the official CSS10/Neon checkpoint.

Uses the published built-in speaker, no voice cloning or reference recordings.
No app changes, downloads, full-Bible loop or commercial release clearance.
"""
import argparse
import copy
import importlib.metadata
import json
import os
from pathlib import Path
import subprocess
import sys
import time

os.environ['HF_HUB_OFFLINE'] = '1'
os.environ['TRANSFORMERS_OFFLINE'] = '1'
os.environ['HF_HUB_DISABLE_TELEMETRY'] = '1'
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
import numpy as np
import soundfile as sf
from audio_processing import split_text, trim_edges, join_clips, parse_loudness
from jobs import atomic_json, chapter_source, sha256, digest, job_lock, SegmentCache

HASHES = {
    'model_file.pth.tar': '5b4fcb17da97ebfda929ccd503344bbe5f351dcfd97c8637c804fc7ffc72e8cd',
    'config.json': '34662716770cff1dac3f45029e345f90c6e66102a0a2e1bd259ebfc6ffb0ae9d',
    'speaker_ids.json': 'ce025097310366ad9be582651509012dc2399413ae54fb22fefd211070c97239',
    'language_ids.json': 'ce025097310366ad9be582651509012dc2399413ae54fb22fefd211070c97239',
}
PASSAGES = ((20, 24), (29, 32))


def runtime_config(config, model_dir):
    """Relocate author-machine paths; never change the original config or weights."""
    value = copy.deepcopy(config)
    for section in [value, value['model_args']]:
        section['speakers_file'] = str(model_dir / 'speaker_ids.json')
        section['language_ids_file'] = str(model_dir / 'language_ids.json')
    return value


def checked_models(model_dir):
    for name, checksum in HASHES.items():
        if sha256(model_dir / name) != checksum:
            raise ValueError('Unreviewed CSS10 model component: ' + name)


def synthesize_builtin(voice, text):
    # Coqui 0.28 selects the sole speaker/language internally. Explicit speaker
    # or language arguments are rejected by this single-speaker model's API.
    return voice.tts(text=text, split_sentences=False)


def run(model_dir, bibles, out, length_scale=1.0):
    if not .8 <= length_scale <= 1.5:
        raise ValueError('Audition duration scale outside reviewed range')
    checked_models(model_dir)
    if importlib.metadata.version('coqui-tts') != '0.28.0':
        raise ValueError('Use reviewed coqui-tts 0.28.0 environment')
    source = chapter_source(bibles, 'LUK', 15)
    settings = {'model': 'tts_models/de/css10/vits-neon', 'release': 'v0.8.0_models',
                'length_scale': length_scale, 'inference_noise_scale': .3,
                'inference_noise_scale_dp': .3, 'speaker': 'de', 'language': 'de',
                'seed': 20261107, 'sentence_gap': .30, 'colon_gap': .38,
                'verse_gap': .28, 'edge_guard': .09, 'target_lufs': -20,
                'lexicon': 'none; original grapheme frontend, no unverified IPA injection'}
    identity = {'source': source, 'settings': settings, 'model_hashes': HASHES,
                'software': {n: importlib.metadata.version(n) for n in ['coqui-tts','torch','numpy','soundfile']},
                'code': {p.name: sha256(p) for p in [Path(__file__), HERE.parent/'audio_processing.py', HERE.parent/'jobs.py']}}
    key = digest(identity)
    folder = out / f'css10-neon-{key[:12]}'
    folder.mkdir(parents=True, exist_ok=True)
    tick = time.monotonic()
    with job_lock(folder / 'generation.lock'):
        atomic_json(folder / 'source.json', source)
        original = json.loads((model_dir / 'config.json').read_text())
        local = folder / 'runtime-config.json'
        atomic_json(local, runtime_config(original, model_dir))
        cache = SegmentCache(folder / 'segments')
        voice = None
        passages = []
        segment_count = hits = 0
        for first, last in PASSAGES:
            verses = [(n, text) for n, text in source['verses'] if first <= n <= last]
            clips = []
            for number, text in verses:
                pieces = split_text(text, max_chars=240)
                assert ' '.join(pieces) == text
                audio_parts = []
                for index, piece in enumerate(pieces):
                    segment_count += 1
                    cache_key = f'{number:03d}-{index:03d}'
                    cached = cache.get(cache_key)
                    if cached and cached[2].get('identity_sha256') == key and cached[2].get('text') == piece:
                        samples, sr, _ = cached
                        hits += 1
                    else:
                        if voice is None:
                            import torch
                            torch.set_num_threads(2)
                            torch.set_num_interop_threads(1)
                            from TTS.api import TTS
                            voice = TTS(model_path=str(model_dir/'model_file.pth.tar'), config_path=str(local), progress_bar=False).to('cpu')
                            model = voice.synthesizer.tts_model
                            for param in ['length_scale', 'inference_noise_scale', 'inference_noise_scale_dp']:
                                setattr(model, param, settings[param])
                        import torch
                        seed = settings['seed'] + number * 100 + index
                        torch.manual_seed(seed)
                        np.random.seed(seed)
                        started = time.monotonic()
                        raw = np.asarray(synthesize_builtin(voice, piece), dtype=np.float32)
                        sr = voice.synthesizer.output_sample_rate
                        samples, trimmed = trim_edges(raw, sr, .09, .0015)
                        cache.save(cache_key, samples, sr, {'identity_sha256': key, 'text': piece,
                                   'verse': number, 'segment': index, 'seed': seed,
                                   'generation_seconds': time.monotonic()-started, 'trim': trimmed})
                    if sr != 22050:
                        raise ValueError('Unexpected CSS10 sample rate')
                    audio_parts.append(samples)
                gaps = [settings['colon_gap'] if p.endswith(':') else settings['sentence_gap'] for p in pieces[:-1]]
                clip, _ = join_clips(audio_parts, sr, gaps, .09)
                clips.append(clip)
                print(f'CSS10 LUK15:{number} {len(clip)/sr:.2f}s', flush=True)
            combined, starts = join_clips(clips, sr, [settings['verse_gap']] * (len(clips)-1), .09)
            head, tail = round(.16*sr), round(.35*sr)
            combined = np.concatenate([np.zeros(head), combined, np.zeros(tail)])
            stem = f'css10-neon-luk-15-{first}-{last}'
            wav, mp3 = folder/(stem+'.wav'), folder/(stem+'.mp3')
            temp = folder/'unmastered.tmp.wav'
            sf.write(temp, combined, sr, subtype='FLOAT')
            measured = subprocess.run(['ffmpeg','-hide_banner','-i',str(temp),'-af','loudnorm=I=-20:TP=-2:LRA=11:print_format=json','-f','null','-'], capture_output=True, text=True, check=True)
            loudness = parse_loudness(measured.stderr)
            gain = min(10**((-20-float(loudness['input_i']))/20), .794328/float(np.abs(combined).max()))
            sf.write(temp, combined*gain, sr, subtype='PCM_16')
            temp.replace(wav)
            tempmp3 = folder/'encoded.tmp.mp3'
            subprocess.run(['ffmpeg','-v','error','-y','-i',str(wav),'-c:a','libmp3lame','-b:a','128k',
                            '-metadata',f'title=Lukas 15,{first}–{last} – Luther 1912',
                            '-metadata','artist=KI-generierte Vorlesung: CSS10 Neon VITS',
                            '-metadata','comment=Private Hoerpruefung; kommerzielle Stimmrechte nicht abschliessend geklaert',str(tempmp3)],check=True)
            tempmp3.replace(mp3)
            row = {'candidate': 'css10-neon', 'kind': 'new-synthesis', 'book': 'LUK', 'chapter': 15,
                   'translation': 'l1912', 'first_verse': first, 'last_verse': last,
                   'verses': verses, 'text_sha256': digest(verses), 'source_book_sha256': source['book_sha256'],
                   'sample_rate': sr, 'duration_seconds': len(combined)/sr, 'mastering_gain': gain,
                   'timeline': [{'verse': n, 'text': text, 'start_seconds': (head+start)/sr,
                                 'end_seconds': (head+start+len(clip))/sr}
                                for (n,text),start,clip in zip(verses,starts,clips)],
                   'files': {p.name: sha256(p) for p in [wav,mp3]}}
            atomic_json(folder/(stem+'.json'),row)
            passages.append(row)
        atomic_json(folder/'manifest.json', {'candidate':'css10-neon','identity':key,'identity_details':identity,
                    'synthesis_settings':settings,'passages':passages,'generation_seconds':time.monotonic()-tick,
                    'segment_count':segment_count,'cache_hits':hits,'new_model_generation':True,
                    'human_listening':'OPEN','commercial_release':'NOT CLEARED'})
    print(folder, flush=True)
    return folder


if __name__ == '__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--models',type=Path,required=True)
    parser.add_argument('--bibles',type=Path,default=HERE.parents[2]/'data/bibles')
    parser.add_argument('--out',type=Path,required=True)
    parser.add_argument('--length-scale',type=float,default=1.0)
    args=parser.parse_args()
    run(args.models.resolve(),args.bibles,args.out,args.length_scale)
