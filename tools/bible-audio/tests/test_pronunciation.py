#!/usr/bin/env python3
"""Name regressions; --baseline demonstrates the original frontend errors.

The expected phonetic distinctions are independent of the implementation:
Abraham needs /b/ and /h/; Isaak has no /l/; Rehabeam needs /h/;
Sealthiel needs the separated final /i/ and /ɛl/.
"""
import os
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
os.environ['XDG_CACHE_HOME'] = str(ROOT / '.cache')
BASELINE = '--baseline' in sys.argv
if BASELINE:
    sys.argv.remove('--baseline')

from TTS.tts.utils.text.phonemizers.gruut_wrapper import Gruut


def candidate():
    if BASELINE:
        return Gruut('de-de')
    from pronunciation import BiblicalGruut
    return BiblicalGruut.from_file(ROOT / 'pronunciations.json', language='de-de')


class NameRegressionTests(unittest.TestCase):
    def test_abraham_keeps_b_and_h(self):
        ipa = candidate().phonemize('Abraham', separator='')
        self.assertIn('b', ipa)
        self.assertIn('h', ipa)
        self.assertNotIn('pʁ', ipa)

    def test_isaak_does_not_gain_an_l(self):
        ipa = candidate().phonemize('Isaak', separator='')
        self.assertNotIn('l', ipa)
        self.assertTrue(ipa.endswith('k'))

    def test_rehabeam_keeps_h(self):
        self.assertIn('h', candidate().phonemize('Rehabeam', separator=''))

    def test_sealthiel_keeps_final_el(self):
        ipa = candidate().phonemize('Sealthiel', separator='')
        self.assertTrue(ipa.endswith('ɛl'), ipa)

    @unittest.skipIf(BASELINE, 'New lexicon boundary contract')
    def test_ordinary_sentence_is_unchanged(self):
        sentence = 'Ein Gedanke bleibt, und ich gehe weiter.'
        self.assertEqual(candidate().phonemize(sentence, separator=''),
                         Gruut('de-de').phonemize(sentence, separator=''))

    @unittest.skipIf(BASELINE, 'New lexicon boundary contract')
    def test_does_not_replace_part_of_a_longer_name(self):
        sentence = 'Abrahamsen'
        self.assertEqual(candidate().phonemize(sentence, separator=''),
                         Gruut('de-de').phonemize(sentence, separator=''))

    @unittest.skipIf(BASELINE, 'New lexicon boundary contract')
    def test_genitive_is_registered_separately(self):
        phonemizer = candidate()
        ipa = phonemizer.phonemize('Abrahams', separator='')
        self.assertIn('h', ipa)
        self.assertTrue(ipa.endswith('s'))
        self.assertEqual([x['word'].casefold() for x in phonemizer.applied], ['abrahams'])

    @unittest.skipIf(BASELINE, 'New lexicon boundary contract')
    def test_case_does_not_disable_the_override(self):
        p = candidate()
        self.assertEqual(p.phonemize('isaak', separator=''), p.phonemize('ISAAK', separator=''))

    @unittest.skipIf(BASELINE, 'New lexicon pronunciation contract')
    def test_common_zeugte_has_no_duplicate_vowel(self):
        self.assertEqual(candidate().phonemize('zeugte', separator=''), 'tsɔʏktə')

    @unittest.skipIf(BASELINE, 'New lexicon pronunciation contract')
    def test_gruut_eszett_normalization_does_not_break_heissen(self):
        self.assertEqual(candidate().phonemize('heißen', separator=''), 'haɪsən')


if __name__ == '__main__':
    unittest.main()
