#!/usr/bin/env python3
"""Measure candidate recordings; never infer pleasantness from these metrics."""
import argparse
import json
import re
from pathlib import Path
import numpy as np
import soundfile as sf
from num2words import num2words
from jobs import atomic_json


def normalized_words(text):
    text=re.sub(r'\b\d+\b',lambda m:num2words(int(m[0]),lang='de'),text.lower())
    # Orthography-equivalent ß/ss is not an audible difference.
    return re.findall(r'[a-zäöü]+',text.replace('ß','ss'))


def word_edits(reference, recognized):
    a,b=normalized_words(reference),normalized_words(recognized)
    previous=list(range(len(b)+1))
    for i,word in enumerate(a,1):
        current=[i]
        for k,other in enumerate(b,1):
            current.append(min(current[-1]+1,previous[k]+1,previous[k-1]+(word!=other)))
        previous=current
    return previous[-1],len(a)


def analyze(folder):
    report=json.loads((folder/'generation-report.json').read_text())
    timeline=json.loads((folder/'verse-timeline.json').read_text())
    x,sr=sf.read(next(folder.glob('*optimiert.wav')),dtype='float32')
    step=round(sr*.01)
    rms=np.array([np.sqrt(np.mean(x[i:i+step]**2))for i in range(0,len(x),step)])
    durations=np.minimum(step,len(x)-np.arange(len(rms))*step)/sr
    quiet=rms<.003;stretches=[];run=0
    for value,duration in zip(quiet,durations):
        if value:run+=float(duration)
        elif run:stretches.append(run);run=0
    if run:stretches.append(run)
    boundaries=[round(row[key]*sr)for row in timeline for key in ['start_seconds','end_seconds']]
    jumps=[float(abs(x[n]-x[n-1]))for n in boundaries if 0<n<len(x)]
    asr=folder/'qa/asr-results.json'
    if not asr.exists():asr=folder/'qa/asr-probe.json'
    recognized=json.loads(asr.read_text())['results'] if asr.exists()else []
    edits=[word_edits(row['reference'],row['recognition'])for row in recognized]
    return {'directory':str(folder),'profile':report['identity']['settings'].get('profile_name','reference'),
            'verses':report['verse_count'],'duration_seconds':len(x)/sr,
            'words_per_minute':sum(len(row['text'].split())for row in timeline)*60/(len(x)/sr),
            'segment_count':report['segment_count'],'sample_peak':float(abs(x).max()),
            'measured_lufs':float(report['loudness_after']['input_i']),
            'quiet_seconds_rms_below_0_003':float(durations[quiet].sum()),
            'longest_quiet_seconds':max(stretches,default=0),
            'quiet_stretches_above_1_5_seconds':[s for s in stretches if s>1.5],
            'maximum_verse_boundary_sample_jump':max(jumps,default=0),
            'asr_verses_checked':len(recognized),'asr_word_edits':sum(e for e,_ in edits),
            'reference_normalized_words':sum(n for _,n in edits),
            'asr_word_error_rate':sum(e for e,_ in edits)/sum(n for _,n in edits) if edits else None,
            'warning':'ASR is a fallible spelling/transcription proxy; WER is not an acoustic quality score. No human listening or 20–30min acceptance claimed.'}


if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--jobs',type=Path,nargs='+',required=True);parser.add_argument('--output',type=Path,required=True)
    args=parser.parse_args();rows=[analyze(folder)for folder in args.jobs];atomic_json(args.output,{'results':rows});print(json.dumps(rows,ensure_ascii=False,indent=2))
