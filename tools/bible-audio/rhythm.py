"""Conservative text boundaries and temporal cues, not speaker/emotion synthesis.

Every returned fragment is a literal part of the original Bible text. A colon
is a pacing cue, never a claim to identify a speaker or the end of quoted speech.
"""
import re
from audio_processing import split_text


def segment_plan(text, settings):
    if settings.get('rhythm') != 'contextual':
        return split_text(text)
    limit = settings.get('max_phrase_chars', 260)
    if limit < 40:
        raise ValueError('Phrase limit must leave room for meaningful word groups')
    pieces = re.split(r'(?<=[.!?:])\s+', text)
    result = []
    for piece in pieces:
        while len(piece) > limit:
            # Prefer a clause boundary; otherwise fall back to an actual space.
            cuts = [m.end()-1 for m in re.finditer(r'[,;] ', piece[:limit+1]) if m.end() > limit*.4]
            cut = cuts[-1] if cuts else piece.rfind(' ', 0, limit+1)
            if cut < 1:
                raise ValueError('An individual word exceeds the phrase limit')
            result.append(piece[:cut]);piece = piece[cut+1:]
        result.append(piece)
    if ' '.join(result) != text or any(not p for p in result):
        raise ValueError('Rhythm segmentation changed the original text')
    return result


def boundary_pause(text, kind, settings):
    if settings.get('rhythm') != 'contextual':
        return settings['verse_pause_seconds'] if kind == 'verse' else settings['clause_pause_seconds'] if text[-1:] in ';:' else settings['sentence_pause_seconds']
    if kind == 'paragraph':
        return settings['paragraph_pause_seconds']
    end = text.rstrip('”"’').rstrip()[-1:]
    if end == ':':
        return settings['dialogue_pause_seconds']
    if end not in '.!?':
        return settings['continuation_pause_seconds'] if kind == 'verse' else settings['clause_pause_seconds']
    return settings['verse_pause_seconds'] if kind == 'verse' else settings['sentence_pause_seconds']


def length_scale_for(text, follows_colon, settings):
    base = settings['length_scale']
    if settings.get('rhythm') != 'contextual':
        return base
    return base*settings.get('dialogue_length_factor',1) if follows_colon else base
