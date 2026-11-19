"""Generate voiceover lines with Kokoro TTS and build timeline.json.

Usage: python build/voice.py <kokoro_model_dir>
"""
import json
import sys
from pathlib import Path

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "out" / "vo"
OUT.mkdir(parents=True, exist_ok=True)

VOICE = "af_heart"
SPEED = 0.86
SR = 24000

# (scene id, line, pause AFTER the line in seconds)
SCRIPT = [
    ("hook",     "Nobody tells you this.", 0.9),
    ("carry1",   "One day, your mom picked you up,", 0.25),
    ("carry2",   "put you down,", 0.35),
    ("carry3",   "and never picked you up again.", 0.6),
    ("knew",     "Neither of you knew it was the last time.", 1.0),
    ("play",     "The last time you played outside until the streetlights came on.", 0.5),
    ("story",    "The last bedtime story.", 0.6),
    ("friend",   "The last time you told your best friend, see you tomorrow.", 0.9),
    ("announce", "Life never announces its last times.", 0.8),
    ("now",      "And right now, someone you love is living one with you.", 1.0),
    ("call",     "So when Mom calls, pick up.", 0.6),
    ("coffee",   "Stay for one more cup of coffee.", 0.5),
    ("hug",      "Hug a little longer.", 1.0),
    ("end1",     "Because one day, it will be the last time.", 0.7),
    ("end2",     "And you won't know.", 0.0),
]

LEAD_IN = 0.6      # silence before first line
END_CARD = 3.6     # seconds after last line for the end card


def trim(audio, thresh=0.01, pad=0.03):
    idx = np.where(np.abs(audio) > thresh)[0]
    if len(idx) == 0:
        return audio
    a = max(0, idx[0] - int(pad * SR))
    b = min(len(audio), idx[-1] + int(pad * SR))
    return audio[a:b]


def main():
    mdir = Path(sys.argv[1])
    k = Kokoro(str(mdir / "kokoro-v1.0.onnx"), str(mdir / "voices-v1.0.bin"))
    t = LEAD_IN
    lines = []
    for sid, text, pause in SCRIPT:
        audio, sr = k.create(text, voice=VOICE, speed=SPEED, lang="en-us")
        assert sr == SR
        audio = trim(np.asarray(audio, dtype=np.float32))
        path = OUT / f"{sid}.wav"
        sf.write(path, audio, SR)
        dur = len(audio) / SR
        # proportional word timing (by character weight) for captions
        words = text.split()
        weights = [len(w.strip(",.")) + 2 for w in words]
        tot = sum(weights)
        acc = 0.0
        wt = []
        for w, wgt in zip(words, weights):
            ws = t + dur * acc / tot
            acc += wgt
            wt.append({"w": w, "s": round(ws, 3), "e": round(t + dur * acc / tot, 3)})
        lines.append({"id": sid, "text": text, "start": round(t, 3),
                      "end": round(t + dur, 3), "words": wt, "file": str(path.relative_to(ROOT))})
        print(f"{sid:9s} {t:6.2f} -> {t+dur:6.2f}  {text}")
        t += dur + pause
    total = t + END_CARD
    # scene boundaries: each scene runs from its line start to the next line start
    for i, ln in enumerate(lines):
        ln["sceneStart"] = 0.0 if i == 0 else ln["start"] - 0.15
        ln["sceneEnd"] = (lines[i + 1]["start"] - 0.15) if i + 1 < len(lines) else total
    tl = {"fps": 30, "width": 1080, "height": 1920, "duration": round(total, 3), "lines": lines}
    (ROOT / "out" / "timeline.json").write_text(json.dumps(tl, indent=1))
    (ROOT / "web" / "timeline.js").write_text("window.TIMELINE = " + json.dumps(tl) + ";\n")
    print("total", round(total, 2))


if __name__ == "__main__":
    main()
