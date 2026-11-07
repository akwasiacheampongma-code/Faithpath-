"""Risk tests: no altered Bible text, lost verses, corrupt cache, or false scores."""
import json
import struct
import sys
import tempfile
import unittest
import wave
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from benchmark import select_rows, weighted_score, validate_media_path, checked_job, extract
from jobs import atomic_json, chapter_source, digest, sha256


class BenchmarkContracts(unittest.TestCase):
    def setUp(self):
        self.source = {'verses': [[i, f'Original {i}'] for i in range(1, 33)]}
        self.rows = [{'verse': i, 'text': f'Original {i}',
                      'start_seconds': float(i), 'end_seconds': i + .8}
                     for i in range(1, 33)]

    def test_exact_requested_verses_in_order(self):
        rows = select_rows(self.source, self.rows, 20, 24, 40)
        self.assertEqual([r['verse'] for r in rows], [20, 21, 22, 23, 24])

    def test_missing_duplicate_and_changed_words_rejected(self):
        for rows in [self.rows[:20] + self.rows[21:], self.rows + [self.rows[20]],
                     [dict(r, text='Changed') if r['verse'] == 20 else r for r in self.rows]]:
            with self.subTest(rows=rows):
                with self.assertRaises(ValueError):
                    select_rows(self.source, rows, 20, 24, 40)

    def test_overlapping_or_out_of_file_timestamps_rejected(self):
        for change in [{'end_seconds': 45}, {'start_seconds': 19.2},
                       {'start_seconds': float('nan')}]:
            rows = [dict(r, **change) if r['verse'] == 20 else r for r in self.rows]
            with self.subTest(change=change), self.assertRaises(ValueError):
                select_rows(self.source, rows, 20, 24, 40)

    def test_unmeasured_hearing_never_gets_overall_score(self):
        self.assertIsNone(weighted_score({'technical': 5}))

    def test_float_roundoff_at_touching_verse_boundary_is_not_an_overlap(self):
        self.rows[19]['start_seconds'] = 19.8 - 3e-14
        self.assertEqual(len(select_rows(self.source, self.rows, 20, 24, 40)), 5)

    def test_requested_weights_and_no_invented_default(self):
        values = {'naturalness': 4, 'pronunciation': 3, 'long_listening': 2,
                  'dialogue': 4, 'technical': 5}
        self.assertAlmostEqual(weighted_score(values), 3.45)
        self.assertIsNone(weighted_score({**values, 'naturalness': None}))
        with self.assertRaises(ValueError):
            weighted_score({**values, 'naturalness': 6})

    def test_output_names_cannot_inject_html_or_escape_directory(self):
        self.assertEqual(validate_media_path('coqui-c'), 'coqui-c')
        for name in ['../x', '<script>', 'a/b', '', 'two words']:
            with self.subTest(name=name), self.assertRaises(ValueError):
                validate_media_path(name)


class AudioProvenance(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.bibles = self.root / 'bibles'
        (self.bibles / 'l1912').mkdir(parents=True)
        verses = [[i, f'Synthetischer Prüftext {i}.'] for i in range(1, 33)]
        atomic_json(self.bibles / 'l1912/LUK.json',
                    {'code': 'LUK', 'name': 'Lukas', 'chapters': [[]]*14 + [verses]})
        self.job = self.root / 'job'
        self.job.mkdir()
        source = chapter_source(self.bibles, 'LUK', 15)
        atomic_json(self.job / 'source.json', source)
        rows = [{'verse': i, 'text': text, 'start_seconds': (i-1)/10,
                 'end_seconds': i/10} for i, text in verses]
        atomic_json(self.job / 'verse-timeline.json', rows)
        with wave.open(str(self.job / 'test-optimiert.wav'), 'wb') as w:
            w.setparams((1, 2, 22050, 0, 'NONE', 'not compressed'))
            w.writeframes(b''.join(struct.pack('<h', i*100) * 2205 for i in range(1, 33)))
        identity = {'source': source, 'settings': {'model': 'tts_models/de/thorsten/vits'}}
        self.report = {'identity': identity, 'identity_sha256': digest(identity),
                       'elapsed_seconds': 1.0,
                       'outputs': {p.name: {'sha256': sha256(p)} for p in self.job.iterdir()}}
        self.write_report()

    def write_report(self):
        atomic_json(self.job / 'generation-report.json', self.report)

    def test_changed_timeline_and_missing_audio_hash_fail_closed(self):
        timeline = self.job / 'verse-timeline.json'
        original = timeline.read_bytes()
        timeline.write_text('[]')
        with self.assertRaises(ValueError):
            checked_job(self.job, self.bibles)
        timeline.write_bytes(original)
        del self.report['outputs']['test-optimiert.wav']
        self.write_report()
        with self.assertRaises(ValueError):
            checked_job(self.job, self.bibles)

    def test_extraction_preserves_every_original_pcm_sample_and_can_repeat(self):
        out = self.root / 'output'
        folder = extract(self.job, self.bibles, out, 'coqui-test')
        manifest = json.loads((folder / 'manifest.json').read_text())
        first = manifest['passages'][0]
        wav = folder / next(n for n in first['files'] if n.endswith('.wav'))
        with wave.open(str(wav), 'rb') as r:
            r.setpos(round(.16 * r.getframerate()))
            actual = r.readframes(5 * 2205)
        expected = b''.join(struct.pack('<h', i*100) * 2205 for i in range(20, 25))
        self.assertEqual(actual, expected)
        self.assertEqual([n for n, _ in first['verses']], [20, 21, 22, 23, 24])
        before = dict(first['files'])
        self.assertEqual(folder, extract(self.job, self.bibles, out, 'coqui-test'))
        after = json.loads((folder / 'manifest.json').read_text())['passages'][0]['files']
        self.assertEqual(before, after)


if __name__ == '__main__':
    unittest.main()
