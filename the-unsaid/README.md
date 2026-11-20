# The Unsaid — motion graphics video

**Video:** `The_Unsaid.mp4` (1080×1350, 4:5, 30 fps, about 3:50, H.264 + AAC, −14 LUFS)
**Storyboard and characters:** `storyboard/index.html`

The voiceover is the creator's own. Everything else is generated in code: kinetic hook text, flat-vector characters, line-art icons, transitions, score and sound effects. No stock footage or sound samples are used.

## Look
- Colour code for the whole video: amber = the son (money, pride, lineage), teal = Apa (care, sweat, unseen work), rust = hits of truth ("মিথ্যা", "লোভ", "করে।").
- Fonts from Lipighor (lipighor.com): Li Alinur Sangbadpatra for hook text, Li Alinur Tatsama for supporting lines, Li Alinur Nakkhatra for dialogue. Brand line in Fraunces italic.
- "The Unsaid" sits in the top-left corner throughout and returns as the end card.
- Key moment: on "ওর হাতটা এক সেকেন্ডের জন্য থামল" the frame, steam and all sound freeze for exactly one second.

## How it is built
| Step | File | What it does |
|---|---|---|
| 1 | `build/chunks.py` | Splits the voiceover at pauses and transcribes each piece with faster-whisper (large-v3-turbo) |
| 2 | `build/align.py` | Matches the transcripts to `build/script.txt`, writes word-level timing to `web/timeline.js` |
| 3 | `web/characters.js` | SVG character kit (son, Apa, Abba, Amma, neighbours) with expressions and animatable parts |
| 4 | `web/engine.js`, `web/scenes.js` | Deterministic frame engine (`renderFrame(t)`) and the 17 scenes, transitions and SFX cue list |
| 5 | `build/render.js` | Headless Chromium renders every frame; `cues` mode exports the SFX cue list |
| 6 | `build/audio.py` | Synthesizes the score and sound effects, ducks them under the voice, writes `out/mix.wav` |

### Rebuild
```bash
pip install faster-whisper rapidfuzz scipy soundfile
```
```bash
python3 build/chunks.py && python3 build/align.py
```
```bash
node build/render.js cues && python3 build/audio.py
```
```bash
node build/render.js video 4
```
```bash
ffmpeg -framerate 30 -i out/frames/f%05d.jpg -i out/mix.wav -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p -movflags +faststart -af loudnorm=I=-14:TP=-1.5:LRA=11 -c:a aac -b:a 192k -shortest The_Unsaid.mp4
```

The Lipighor font files are not in this repository: their licence forbids redistributing them. Download Li Alinur Sangbadpatra, Li Alinur Tatsama and Li Alinur Nakkhatra from lipighor.com and place the Unicode `.ttf` files in `assets/fonts/` as `Sangbadpatra.ttf`, `Tatsama.ttf` and `Nakkhatra.ttf` (plus `Fraunces.ttf` from the parent project).

Font credit: lipighor.com
