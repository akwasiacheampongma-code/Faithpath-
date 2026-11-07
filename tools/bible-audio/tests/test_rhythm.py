import sys
import unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from rhythm import segment_plan, boundary_pause, length_scale_for


SETTINGS={'rhythm':'contextual','max_phrase_chars':230,'sentence_pause_seconds':.32,
          'clause_pause_seconds':.20,'dialogue_pause_seconds':.42,'verse_pause_seconds':.34,
          'continuation_pause_seconds':.18,'paragraph_pause_seconds':.65,
          'length_scale':1.12,'dialogue_length_factor':1.025}

class RhythmTests(unittest.TestCase):
    def test_semicolon_keeps_a_short_connected_sentence_together(self):
        text='Er war verloren und ist gefunden worden; lasset uns fröhlich sein!'
        self.assertEqual(segment_plan(text,SETTINGS),[text])

    def test_dialogue_introduction_gets_a_real_boundary(self):
        text='Er sprach zum Vater: Gib mir das Teil. Und er teilte es ihnen.'
        self.assertEqual(segment_plan(text,SETTINGS),['Er sprach zum Vater:','Gib mir das Teil.','Und er teilte es ihnen.'])

    def test_long_sentence_splits_at_a_comma_instead_of_arbitrary_word(self):
        text='Ein Mensch ging einen langen Weg, und er sah viele Menschen im Dorf, die dort auf ihn warteten.'
        parts=segment_plan(text,{**SETTINGS,'max_phrase_chars':65})
        self.assertEqual(' '.join(parts),text)
        self.assertTrue(parts[0].endswith(','),parts)
        self.assertTrue(all(len(p)<=65 for p in parts))

    def test_verse_continuation_is_not_given_a_full_stop_pause(self):
        self.assertEqual(boundary_pause('vor dir','verse',SETTINGS),.18)
        self.assertEqual(boundary_pause('seine Füße,','verse',SETTINGS),.18)

    def test_colon_and_paragraph_have_distinct_pauses(self):
        self.assertEqual(boundary_pause('Er sprach:','verse',SETTINGS),.42)
        self.assertEqual(boundary_pause('Er freute sich.','paragraph',SETTINGS),.65)

    def test_legacy_settings_preserve_the_original_splitter(self):
        from audio_processing import split_text
        text='Er sprach: Ein Wort; ein anderes Wort. Und er ging.'
        self.assertEqual(segment_plan(text,{}),split_text(text))

    def test_rhythm_is_a_supported_duration_change_not_an_emotion_tag(self):
        self.assertAlmostEqual(length_scale_for('Mein Sohn.',True,SETTINGS),1.148)
        self.assertEqual(length_scale_for('Ein Mensch ging.',False,SETTINGS),1.12)

    def test_all_1189_chapters_preserve_exact_source_when_segmented(self):
        import json
        for path in (Path(__file__).resolve().parents[3]/'data/bibles/l1912').glob('*.json'):
            for chapter in json.loads(path.read_text())['chapters']:
                for number,text in chapter:
                    self.assertEqual(' '.join(segment_plan(text,SETTINGS)),text,(path.stem,number))

if __name__=='__main__':unittest.main()
