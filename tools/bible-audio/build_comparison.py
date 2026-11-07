#!/usr/bin/env python3
"""Self-contained chapter listening comparison; never mixes source translations."""
import argparse
import base64
import json
from pathlib import Path
import shutil
from build_player import validate_player_job

TOOL=Path(__file__).resolve().parent


def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--jobs',type=Path,nargs='+',required=True);p.add_argument('--out',type=Path,required=True)
    args=p.parse_args();entries=[];source=None
    for folder in args.jobs:
        text,timeline,mp3=validate_player_job(folder)
        if source is not None and source!=text:
            raise ValueError('Comparison requires exactly the same chapter and source text')
        source=text;report=json.loads((folder/'generation-report.json').read_text());settings=report['identity']['settings']
        name=settings.get('profile_name','Referenz-bisherige-Einstellungen')
        entries.append({'name':name,'seconds':report['duration_seconds'],'settings':settings,'timeline':[{k:r[k]for k in ['verse','start_seconds','end_seconds']}for r in timeline],
                        'audio':'data:audio/mpeg;base64,'+base64.b64encode(mp3.read_bytes()).decode('ascii'),'file':f'audio/{name}.mp3'})
    args.out.mkdir(parents=True,exist_ok=True);(args.out/'audio').mkdir(exist_ok=True)
    for folder,entry in zip(args.jobs,entries):
        _,_,mp3=validate_player_job(folder);shutil.copy(mp3,args.out/entry['file'])
    data=json.dumps({'source':source,'entries':entries},ensure_ascii=False).replace('<','\\u003c')
    page=(TOOL/'comparison.html').read_text().replace('__DATA__',data)
    (args.out/'index.html').write_text(page)
    print(args.out/'index.html')


if __name__=='__main__':main()
