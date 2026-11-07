import json
import sys
import tempfile
import unittest
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from audio_processing import split_text, trim_edges, join_clips
from jobs import SegmentCache, chapter_source, job_lock


class AudioTests(unittest.TestCase):
    def test_ffmpeg_loudness_accepts_trailing_progress_output(self):
        from audio_processing import parse_loudness
        output = 'header\n{\n"input_i":"-24.1","input_tp":"-5.0"\n}\nsize=N/A time=00:00:10.0\n'
        self.assertEqual(parse_loudness(output)['input_i'], '-24.1')

    def test_splitting_preserves_every_word_and_order(self):
        text = 'Isaak zeugte Jakob. Jakob zeugte Juda; und seine Brüder. “Siehe, ein Sohn!”'
        parts = split_text(text)
        self.assertEqual(' '.join(parts), text)
        self.assertGreater(len(parts), 1)

    def test_long_unpunctuated_text_is_not_dropped(self):
        text = ' '.join(['unverändert'] * 90)
        self.assertEqual(' '.join(split_text(text, max_chars=120)), text)
        self.assertTrue(all(len(p) <= 120 for p in split_text(text, max_chars=120)))

    def test_trim_removes_edge_silence_but_keeps_quiet_consonants_and_internal_pause(self):
        sr = 1000
        x = np.r_[np.zeros(500), np.full(25, .001), np.full(200, .1), np.zeros(400), np.full(200, .1), np.full(25, .001), np.zeros(700)].astype('float32')
        y, report = trim_edges(x, sr, padding_seconds=.06)
        self.assertLess(len(y), len(x)-900)
        self.assertEqual(int(np.count_nonzero(y)), int(np.count_nonzero(x)))
        self.assertGreaterEqual(report['removed_start_seconds'], .4)
        self.assertGreater(np.count_nonzero(y == 0), 400)

    def test_all_silent_output_is_an_error(self):
        with self.assertRaises(ValueError):
            trim_edges(np.zeros(2000), 1000)

    def test_join_keeps_both_words_without_an_extra_long_pause(self):
        a = np.r_[np.zeros(60), np.full(200, .1), np.zeros(60)].astype('float32')
        y, starts = join_clips([a, a], 1000, [.30])
        self.assertEqual(len(y), 820)  # 640 samples plus 180 for a total 300ms gap
        self.assertEqual(starts, [0, 500])
        self.assertEqual(np.count_nonzero(y), 400)


class JobTests(unittest.TestCase):
    def test_only_one_writer_can_own_the_same_chapter(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder)/'chapter.lock'
            with job_lock(path):
                with self.assertRaises(BlockingIOError):
                    with job_lock(path):
                        self.fail('Concurrent writer entered')

    def test_resume_accepts_only_verified_audio_and_rejects_corruption(self):
        with tempfile.TemporaryDirectory() as folder:
            cache = SegmentCache(Path(folder))
            x = np.full(1000, .1, dtype='float32')
            cache.save('abc', x, 1000, {'text': 'Ein Wort.'})
            self.assertIsNotNone(cache.get('abc'))
            (Path(folder)/'abc.wav').write_bytes(b'broken')
            self.assertIsNone(cache.get('abc'))

    def test_interrupted_audio_without_metadata_is_not_a_valid_cache_hit(self):
        with tempfile.TemporaryDirectory() as folder:
            (Path(folder)/'part.wav').write_bytes(b'incomplete')
            self.assertIsNone(SegmentCache(Path(folder)).get('part'))

    def test_wrong_metadata_shape_is_a_cache_miss_not_a_crash(self):
        with tempfile.TemporaryDirectory() as folder:
            (Path(folder)/'part.json').write_text('[]')
            (Path(folder)/'part.wav').write_bytes(b'incomplete')
            self.assertIsNone(SegmentCache(Path(folder)).get('part'))

    def test_empty_or_broken_completion_report_is_not_a_finished_chapter(self):
        from jobs import verified_report, sha256
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder);report=root/'generation-report.json'
            report.write_text('{"identity_sha256":"job","outputs":{}}')
            self.assertIsNone(verified_report(root,'job',['audio.mp3']))
            report.write_text('broken')
            self.assertIsNone(verified_report(root,'job',['audio.mp3']))
            (root/'audio.mp3').write_bytes(b'verified output')
            report.write_text(json.dumps({'identity_sha256':'job','outputs':{'audio.mp3':{'sha256':sha256(root/'audio.mp3')}}}))
            self.assertIsNotNone(verified_report(root,'job',['audio.mp3']))

    def test_text_is_never_silently_renumbered_or_repaired(self):
        with tempfile.TemporaryDirectory() as folder:
            d = Path(folder)/'l1912';d.mkdir()
            p = d/'MAT.json'
            p.write_text(json.dumps({'code':'MAT','name':'Matthäus','chapters':[[[1,'Ein Wort.'],[3,'Falsche Nummer.']]]}))
            with self.assertRaises(ValueError):
                chapter_source(Path(folder), 'MAT', 1)
            with self.assertRaises(ValueError):
                chapter_source(Path(folder), '../MAT', 1)

    def test_all_66_existing_books_can_be_selected_without_generating_audio(self):
        root = Path(__file__).resolve().parents[3]/'data/bibles'
        files = list((root/'l1912').glob('*.json'))
        self.assertEqual(len(files), 66)
        for path in files:
            book = json.loads(path.read_text())
            for n in (1, len(book['chapters'])):
                selected = chapter_source(root, path.stem, n)
                self.assertEqual(selected['verses'], book['chapters'][n-1])
                self.assertEqual(selected['translation'], 'l1912')


if __name__ == '__main__':
    unittest.main()
