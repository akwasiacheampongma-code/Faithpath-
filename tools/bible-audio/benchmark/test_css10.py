import copy
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import Mock
from generate_css10 import runtime_config, synthesize_builtin, checked_models


class Css10Contracts(unittest.TestCase):
    def test_runtime_relocation_keeps_original_and_model_semantics(self):
        original={'model_args':{'speakers_file':'/author/path','length_scale':1},'use_phonemes':False}
        saved=copy.deepcopy(original)
        relocated=runtime_config(original,Path('/tmp/checked-model'))
        self.assertEqual(original,saved)
        self.assertEqual(relocated['model_args']['length_scale'],1)
        self.assertFalse(relocated['use_phonemes'])
        self.assertEqual(relocated['model_args']['speakers_file'],'/tmp/checked-model/speaker_ids.json')

    def test_single_speaker_api_does_not_receive_multispeaker_or_clone_arguments(self):
        def builtin(**kwargs):
            if any(k in kwargs for k in ['speaker','language','speaker_wav']):
                raise ValueError('Single-speaker API rejects explicit selection')
            self.assertEqual(kwargs['text'],'Vater, ich habe gesündigt.')
            self.assertFalse(kwargs['split_sentences'])
            return [.1,.2]
        voice=Mock();voice.tts.side_effect=builtin
        self.assertEqual(synthesize_builtin(voice,'Vater, ich habe gesündigt.'),[.1,.2])

    def test_missing_or_unverified_weights_are_rejected_before_loading(self):
        with tempfile.TemporaryDirectory() as temp:
            with self.assertRaises(OSError):checked_models(Path(temp))
            (Path(temp)/'model_file.pth.tar').write_bytes(b'not reviewed weights')
            with self.assertRaises(ValueError):checked_models(Path(temp))


if __name__=='__main__':unittest.main()
