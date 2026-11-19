# The Last Time — YouTube Short (motion graphics)

**Final video:** `The_Last_Time_Short.mp4` (1080×1920, 30 fps, 43 s, H.264 + AAC, -14 LUFS)

## Upload kit
**Title:** Nobody tells you this… 💔 #shorts

**Description:**
There was a last time your mom picked you up — and neither of you knew it.
Call them today. ❤️
#shorts #life #parents #mom #family #emotional #lifelessons #motivation

**Pinned comment idea:** Who are you calling today? 👇

## Script (voice-over)
Nobody tells you this. / One day, your mom picked you up, put you down, and never picked you up again. /
Neither of you knew it was the last time. / The last time you played outside until the streetlights came on. /
The last bedtime story. / The last time you told your best friend, see you tomorrow. /
Life never announces its last times. / And right now, someone you love is living one with you. /
So when Mom calls, pick up. / Stay for one more cup of coffee. / Hug a little longer. /
Because one day, it will be the last time. / And you won't know.
— End card: “Call them today.”

## How it is made (all generated, no stock assets)
- `build/voice.py` – voice-over with Kokoro TTS (voice `af_heart`), word timings → `web/timeline.js`
- `build/audio.py` – procedural felt-piano score (Am–F–C–G), pad, riser, hard cut to silence, and synced SFX
  (heartbeat, whooshes, lamp click/hum, page flips, clock ticks, sand, phone vibration, mug clink, shimmer); ducking + mix
- `web/scenes.js` – 12 Canvas scenes, word-by-word captions, transitions (zoom-blur, flash, slide, iris), bokeh, grain, vignette
- `build/render.js` – headless Chromium frame renderer

### Rebuild
```bash
pip install kokoro-onnx soundfile scipy
python3 build/voice.py <dir with kokoro-v1.0.onnx + voices-v1.0.bin>
python3 build/audio.py
node build/render.js video 4
ffmpeg -framerate 30 -i out/frames/f%05d.jpg -i out/mix.wav -c:v libx264 -crf 17 -pix_fmt yuv420p \
  -af loudnorm=I=-14:TP=-1.5 -c:a aac -b:a 192k -shortest The_Last_Time_Short.mp4
```
Fonts: Fraunces & Caveat (SIL OFL, Google Fonts), Inter (OFL).
