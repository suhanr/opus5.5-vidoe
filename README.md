# Suhanur Rahman — daily English Shorts engine

Every day an AI producer (a scheduled Claude task on the owner's Windows PC) picks a fresh "dark truth"
topic, verifies the facts, writes a 30-40 s script, builds an original motion-graphics short with voice,
music, sound design, captions and the **Suhanur Rahman** watermark, then uploads it publicly through
YouTube Studio in Chrome. The full procedure is in **[DAILY.md](DAILY.md)**.

## Layout
```
engine/
  lib.js        drawing library + sequencer (characters, kinetic type, captions, transitions, glitch,
                watermark, seamless loop, thumbnail)
  player.html   loads an episode for rendering
  voice.py      Kokoro TTS, mixed voices per line, word timings
  audio.py      synthesized music presets (tender_piano, dark_pulse, music_box, cinematic) + SFX cues + mix
  render.js     headless Chromium frame renderer (frames, previews, thumbnail)
  build.py      end-to-end build + QA (duration, loudness, metadata checks, contact sheet)
  daily.py      daily status / history / upload log (Asia/Dhaka, uploads from 09:00)
episodes/<date>-<slug>/
  script.json   lines, voices, scenes, music, sfx       scenes.js   the visuals
  meta.json     title, description, tags, category…    final/      mp4 (git-ignored), thumbnail, QA sheet, upload.json
uploads/log.json  history of every short (topic, style, status, link)
```

## Setup on Windows (once)
```powershell
git clone -b ccr-8dd49bd1-v62pye https://github.com/suhanr/opus5.5-vidoe.git
cd opus5.5-vidoe
powershell -ExecutionPolicy Bypass -File setup_windows.ps1
```

## Build one episode by hand
```
python engine/build.py episodes/2026-11-20-infinite-scroll
```
Fonts: Fraunces, Playfair Display, Anton, Bebas Neue, JetBrains Mono, Caveat, Inter (all SIL OFL).
Voices: Kokoro-82M (Apache-2.0).
