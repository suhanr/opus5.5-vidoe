"""Voice-over for an episode: Kokoro TTS per line (mixed voices) -> out/vo/*.wav + out/timeline.json/.js

Usage: python engine/voice.py episodes/<slug>
Model files are looked up in $KOKORO_DIR or <repo>/models/ (kokoro-v1.0.onnx, voices-v1.0.bin).
"""
import json
import os
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
SR = 24000

# Voices that sound good (Kokoro v1.0). Female: af_heart, af_bella, bf_emma. Male: am_michael, am_fenrir, bm_george.
DEFAULT_VOICES = {"A": {"voice": "af_heart", "speed": 0.9}}


def trim(audio, thresh=0.01, pad=0.03):
    idx = np.where(np.abs(audio) > thresh)[0]
    if len(idx) == 0:
        return audio
    a = max(0, idx[0] - int(pad * SR))
    b = min(len(audio), idx[-1] + int(pad * SR))
    return audio[a:b]


def main(ep_dir):
    from kokoro_onnx import Kokoro
    ep = Path(ep_dir).resolve()
    script = json.loads((ep / "script.json").read_text(encoding="utf-8"))
    mdir = Path(os.environ.get("KOKORO_DIR", ROOT / "models"))
    k = Kokoro(str(mdir / "kokoro-v1.0.onnx"), str(mdir / "voices-v1.0.bin"))
    voices = {**DEFAULT_VOICES, **script.get("voices", {})}
    out = ep / "out" / "vo"
    out.mkdir(parents=True, exist_ok=True)

    t = script.get("lead_in", 0.5)
    lines = []
    for ln in script["lines"]:
        v = voices[ln.get("voice", "A")]
        audio, sr = k.create(ln["text"], voice=v["voice"], speed=ln.get("speed", v.get("speed", 0.9)), lang="en-us")
        audio = trim(np.asarray(audio, dtype=np.float32))
        path = out / f"{ln['id']}.wav"
        sf.write(path, audio, SR)
        dur = len(audio) / SR
        words = ln["text"].split()
        weights = [len(w.strip(",.!?;:")) + 2 for w in words]
        tot, acc, wt = sum(weights), 0.0, []
        for w, wgt in zip(words, weights):
            ws = t + dur * acc / tot
            acc += wgt
            wt.append({"w": w, "s": round(ws, 3), "e": round(t + dur * acc / tot, 3)})
        lines.append({"id": ln["id"], "text": ln["text"], "voice": v["voice"], "start": round(t, 3),
                      "end": round(t + dur, 3), "words": wt, "file": str(path.relative_to(ep)).replace("\\", "/")})
        print(f"{ln['id']:10s} {t:6.2f} -> {t + dur:6.2f}  [{v['voice']}] {ln['text']}")
        t += dur + ln.get("pause", 0.5)
    total = t + script.get("end_card", 3.0)
    tl = {"fps": 30, "width": 1080, "height": 1920, "duration": round(total, 3),
          "lines": lines, "scenes": script["scenes"]}
    (ep / "out" / "timeline.json").write_text(json.dumps(tl, indent=1), encoding="utf-8")
    (ep / "out" / "timeline.js").write_text("window.TIMELINE = " + json.dumps(tl) + ";\n", encoding="utf-8")
    print(f"total {total:.2f}s")
    return tl


if __name__ == "__main__":
    main(sys.argv[1])
