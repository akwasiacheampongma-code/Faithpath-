#!/usr/bin/env python3
"""Build a standalone player; optional next chapter is text-only, never fake audio."""
import argparse
import base64
import html
import json
from pathlib import Path
from jobs import chapter_source

TOOL=Path(__file__).resolve().parent


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--job',type=Path,required=True)
    p.add_argument('--bibles',type=Path,required=True)
    p.add_argument('--output',type=Path,required=True)
    args=p.parse_args()
    source=json.loads((args.job/'source.json').read_text())
    timeline=json.loads((args.job/'verse-timeline.json').read_text())
    mp3=next(args.job.glob('*optimiert.mp3'))
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
