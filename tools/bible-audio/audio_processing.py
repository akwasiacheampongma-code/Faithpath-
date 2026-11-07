"""Conservative edge trimming and joining; never remove silence inside a phrase."""
import re
import json
import numpy as np


def parse_loudness(stderr: str):
    start = stderr.rfind('{')
    if start < 0:
        raise ValueError('FFmpeg returned no loudness measurement')
    value, _ = json.JSONDecoder().raw_decode(stderr[start:])
    return value


def split_text(text: str, max_chars=230) -> list[str]:
    if not text.strip():
        raise ValueError('Empty source text')
    pieces = re.split(r'(?<=[.!?;:])\s+', text)
    result = []
    for piece in pieces:
        words = piece.split(' ')
        current = ''
        for word in words:
            if current and len(current)+len(word)+1 > max_chars:
                result.append(current)
                current = word
            else:
                current = (current+' '+word) if current else word
        if current:
            result.append(current)
    if ' '.join(result) != text:
        raise ValueError('Source whitespace changed; no silent normalization permitted')
    return result


def trim_edges(samples, sr: int, padding_seconds=.06, threshold=.0025):
    x = np.asarray(samples, dtype=np.float32)
    if x.ndim != 1 or not np.isfinite(x).all() or len(x) < sr*.1:
        raise ValueError('Invalid synthesized audio')
    step = max(1, round(sr*.005))
    rms = np.array([np.sqrt(np.mean(x[n:n+step]**2)) for n in range(0, len(x), step)])
    active = np.flatnonzero(rms >= threshold)
    if not len(active):
        raise ValueError('Synthesized phrase contains no detectable speech')
    pad = round(sr*padding_seconds)
    start = max(0, int(active[0])*step-pad)
    end = min(len(x), (int(active[-1])+1)*step+pad)
    y = x[start:end].copy()
    # 2ms de-click fade is within the retained edge guard, never a speech splice.
    fade = min(round(sr*.002), len(y)//2)
    if fade:
        y[:fade] *= np.linspace(0, 1, fade)
        y[-fade:] *= np.linspace(1, 0, fade)
    return y, {'removed_start_seconds':start/sr, 'removed_end_seconds':(len(x)-end)/sr,
               'guard_seconds':padding_seconds, 'threshold_dbfs':float(20*np.log10(threshold))}


def join_clips(clips, sr: int, gaps: list[float], guard_seconds=.06):
    """gaps are total desired boundary pauses, inclusive of retained edge guards."""
    if len(gaps) != len(clips)-1 or not clips:
        raise ValueError('Invalid clip/gap count')
    parts, starts, cursor = [], [], 0
    for i, clip in enumerate(clips):
        starts.append(cursor)
        parts.append(clip)
        cursor += len(clip)
        if i < len(gaps):
            pause = np.zeros(round(sr*max(0, gaps[i]-2*guard_seconds)), dtype=np.float32)
            parts.append(pause)
            cursor += len(pause)
    return np.concatenate(parts), starts
