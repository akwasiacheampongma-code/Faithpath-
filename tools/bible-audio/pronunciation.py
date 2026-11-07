# SPDX-License-Identifier: MPL-2.0
# Formatter adapted from Coqui TTS gruut_wrapper.py (MPL-2.0).
# Modifications: explicit whole-token biblical lexicon; validation and audit trail.
"""Override the phonetic frontend, never the source or displayed Bible text."""
import json
from pathlib import Path

import gruut
from gruut_ipa import IPA
from TTS.tts.utils.text.phonemizers.gruut_wrapper import Gruut, GRUUT_TRANS_TABLE


class BiblicalGruut(Gruut):
    def __init__(self, entries, *, language='de-de', allowed=None, **kwargs):
        super().__init__(language, **kwargs)
        self.entries = {}
        self.applied = []
        for row in entries:
            key = row['word'].casefold()
            ipa = row['ipa']
            if not key.isalpha() or key in self.entries or not ipa:
                raise ValueError(f'Invalid/duplicate lexicon word: {key}')
            if any(char.isspace() for char in ipa) or any(char in ipa for char in 'ˈˌ<>'):
                raise ValueError(f'Unsupported lexicon notation: {key}')
            if allowed is not None and set(ipa) - set(allowed):
                raise ValueError(f'Phonemes outside model vocabulary: {key}')
            for spelling in [key, *row.get('aliases', [])]:
                spelling = spelling.casefold()
                if spelling in self.entries:
                    raise ValueError(f'Duplicate lexicon alias: {spelling}')
                self.entries[spelling] = row

    @classmethod
    def from_file(cls, path: Path, **kwargs):
        data = json.loads(Path(path).read_text())
        if data['language'] != kwargs.get('language', 'de-de'):
            raise ValueError('Lexicon language mismatch')
        return cls(data['entries'], **kwargs)

    def phonemize_gruut(self, text, separator='|'):
        words = []
        for sentence in gruut.sentences(text, lang=self.language, espeak=self.use_espeak_phonemes):
            for word in sentence:
                if word.is_break:
                    if words:
                        words[-1].append(word.text)
                    else:
                        words.append([word.text])
                    continue
                row = self.entries.get(word.text.casefold())
                original = word.phonemes or []
                phones = list(row['ipa']) if row else original
                if row:
                    self.applied.append({'word': word.text, 'before': ''.join(original), 'after': row['ipa']})
                chars = []
                for phone in phones:
                    if not self.keep_stress:
                        phone = IPA.without_stress(phone)
                    chars.extend(phone.translate(GRUUT_TRANS_TABLE))
                if chars:
                    words.append(chars)
        return f'{separator} '.join(separator.join(word) for word in words)
