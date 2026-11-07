#!/usr/bin/env python3
"""Local German ASR cross-check. Recognition differences are review flags, not proof of TTS errors."""
import argparse
import difflib
import json
import re
import subprocess
import time
from pathlib import Path

import numpy as np
import sherpa_onnx

ROOT = Path(__file__).resolve().parents[1]


def words(text):
    return re.findall(r"[a-zäöüß]+", text.lower())


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=25)
    parser.add_argument("--job", type=Path, required=True)
    parser.add_argument("--models", type=Path, required=True)
    args = parser.parse_args()
    model = args.models / "sherpa-onnx-whisper-base"
    (args.job / "qa").mkdir(exist_ok=True)
    recognizer = sherpa_onnx.OfflineRecognizer.from_whisper(
        encoder=str(model / "base-encoder.int8.onnx"),
        decoder=str(model / "base-decoder.int8.onnx"),
        tokens=str(model / "base-tokens.txt"),
        language="de", task="transcribe", num_threads=1,
    )
    source = json.loads((args.job / "source.json").read_text())
    results = []
    rows = json.loads((args.job / "verse-timeline.json").read_text())
    for row in rows[:args.limit]:
        number, text = row["verse"], row["text"]
        tick = time.monotonic()
        wav = args.job / row["file"]
        raw = subprocess.check_output([
            "ffmpeg", "-loglevel", "error", "-i", str(wav),
            "-f", "f32le", "-ac", "1", "-ar", "16000", "pipe:1",
        ])
        samples = np.frombuffer(raw, dtype="<f4")
        stream = recognizer.create_stream()
        stream.accept_waveform(16000, samples)
        recognizer.decode_stream(stream)
        heard = stream.result.text.strip()
        reference, recognized = words(text), words(heard)
        matcher = difflib.SequenceMatcher(a=reference, b=recognized, autojunk=False)
        differences = [
            {"operation": tag, "reference": " ".join(reference[i:j]),
             "recognition": " ".join(recognized[k:l])}
            for tag, i, j, k, l in matcher.get_opcodes() if tag != "equal"
        ]
        row = {"verse": number, "reference": text, "recognition": heard,
               "similarity_word_sequence": matcher.ratio(), "differences": differences,
               "asr_elapsed_seconds": time.monotonic() - tick}
        results.append(row)
        print(f"{number:02d}: {heard}\n  review flags: {differences}", flush=True)
        name = "asr-results.json" if args.limit == 25 else "asr-probe.json"
        (args.job / "qa" / name).write_text(json.dumps({
            "method": "sherpa-onnx Whisper base multilingual int8, de, greedy_search",
            "limitations": "Automated recognition only; rare names and historical forms can be misrecognized. No human listening is claimed.",
            "results": results,
        }, ensure_ascii=False, indent=2) + "\n")


if __name__ == "__main__":
    main()
