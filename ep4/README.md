# The Unsaid — Episode 4: A Father's Volume (বাবার গলার আওয়াজ)

**Video:** `The_Unsaid_EP4_Baba.mp4` (1080×1350, 4:5, 30 fps, 3:13, H.264 + AAC, −14 LUFS, 54 MB)

This episode deliberately uses a **new visual style**, "pop poster", instead of the dark navy look of episodes 1–3:
- **Look:** each scene sits on a bright flat colour (yellow, cobalt blue, tomato red, mint, pink, violet) with halftone dots. Text is white with a thick black outline (sticker type) or has a marker box behind it. Characters have a white sticker border. The brand is a black pill label. Transitions are coloured diagonal bars sweeping across, or a pop-in.
- **Colour story:** bright while Abba still has a voice. Grey when he goes silent. Warm cream on the morning of the note. Icy blue for "হাত-পা ঠান্ডা". Black and red for the ending, which then turns into a yellow end card.
- **Motif — a volume meter that tracks Abba's voice:**
  - full on the hook, dropping on "নিচু"
  - the TV is turned down at the sound of his footsteps
  - low while he speaks and full while the son interrupts (his bubble is snipped with scissors)
  - 0 and a mute icon when he says nothing
  - the last bar flickers out on the final line
- **Key moment:** three ১০০০-taka notes on the study table, and Abba's note writing itself word by word in a shaky hand (Li Mahfuz Himadri), timed to the voiceover.
- **Other images:**
  - the banyan tree that turns into a money machine whose gears stop at retirement
  - labels flipping from "শাসন" to "বয়সের খিটখিটে ভাব"
  - the table-bang flashback with a comic speech bubble
  - an electricity bill paid by the son
  - a hydraulic press of "অহংকার" crushing "আত্মসম্মান"
  - Abba with a guest badge, with ✓ room, ✓ meals and ✕ vote

**Fonts (new, see `../FONTS.md`):** Li Alinur Shishir (headlines), Li Alinur Nilabhro (supporting lines), Li Alinur Subas (dialogue), Li Mahfuz Himadri (handwritten note).

## Build
The pipeline is the same as episode 1 (see `../the-unsaid/README.md`). In `web/engine.js` the background is a flat colour with static halftone dots, the brand is a pill, and there are two new transitions: `bars` and `pop`. The dots are static and the grain is light so the H.264 file stays small. New sound effects are in `build/audio.py`.
