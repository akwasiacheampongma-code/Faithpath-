#!/usr/bin/env python3
"""Build a standalone player; optional next chapter is text-only, never fake audio."""
import argparse
import base64
import html
import json
from pathlib import Path
from jobs import chapter_source, sha256

TOOL=Path(__file__).resolve().parent


def validate_player_job(folder):
    report=json.loads((folder/'generation-report.json').read_text())
    if not isinstance(report,dict) or report.get('complete') is not True:
        raise ValueError('Player requires a complete chapter; partial QA probes are not supported')
    source=json.loads((folder/'source.json').read_text())
    timeline=json.loads((folder/'verse-timeline.json').read_text())
    if [(r['verse'],r['text'])for r in timeline] != [(n,t)for n,t in source['verses']]:
        raise ValueError('Complete chapter timeline does not match original verses')
    stem=f"{source['book'].lower()}-{source['chapter']:03d}-luther1912-thorsten-optimiert"
    required=[stem+'.mp3',stem+'.wav','source.json','verse-timeline.json']
    for name in required:
        if name not in report['outputs'] or sha256(folder/name) != report['outputs'][name]['sha256']:
            raise ValueError(f'Unverified player source: {name}')
    return source,timeline,folder/(stem+'.mp3')


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--job',type=Path,required=True)
    p.add_argument('--bibles',type=Path,required=True)
    p.add_argument('--output',type=Path,required=True)
    args=p.parse_args()
    source,timeline,mp3=validate_player_job(args.job)
    if source != chapter_source(args.bibles,source['book'],source['chapter']):
        raise ValueError('Player text does not match current canonical Bible source')
    following=chapter_source(args.bibles,source['book'],source['chapter']+1) if source['chapter']<source['chapter_count'] else None
    data={'source':source,'next':following,'timeline':[{'verse':r['verse'],'start_seconds':r['start_seconds'],'end_seconds':r['end_seconds']}for r in timeline],
          'audio':'data:audio/mpeg;base64,'+base64.b64encode(mp3.read_bytes()).decode('ascii')}
    adapter=(TOOL/'reader-player.js').read_text().replace('export function createChapterAudio','function createChapterAudio')
    page=(TOOL/'player.html').read_text().replace('__ADAPTER__',adapter).replace('__TITLE__',html.escape(f"{source['name']} {source['chapter']}"))
    page=page.replace('__DATA__',json.dumps(data,ensure_ascii=False).replace('<','\\u003c'))
    args.output.parent.mkdir(parents=True,exist_ok=True)
    args.output.write_text(page)
    print(args.output)


if __name__=='__main__':
    main()
