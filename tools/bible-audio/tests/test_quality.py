import sys
import unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from compare_quality import word_edits

class QualityTests(unittest.TestCase):
    def test_touching_verse_boundaries_use_audio_sample_precision(self):
        from verify_audio import timeline_samples_valid
        rows=[{'start_seconds':0,'end_seconds':.2},{'start_seconds':.19999999999999,'end_seconds':.4}]
        self.assertTrue(timeline_samples_valid(rows,400,1000))
        rows[1]['start_seconds']=.198
        self.assertFalse(timeline_samples_valid(rows,400,1000))

    def test_equivalent_numbers_and_eszett_are_not_claimed_as_audio_errors(self):
        self.assertEqual(word_edits('neunundneunzig Schafe, daß sie kommen','99 Schafe, dass sie kommen'),(0,5))

    def test_missing_original_word_is_still_a_review_flag(self):
        edits,count=word_edits('Mein Sohn war verloren','Mein Sohn verloren')
        self.assertEqual((edits,count),(1,4))

if __name__=='__main__':unittest.main()
