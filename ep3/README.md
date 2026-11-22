# The Unsaid — Episode 3: The Tail of the Fish (মাছের লেজ)

**Video:** `The_Unsaid_EP3_Lej.mp4` (1080×1350, 4:5, 30 fps, about 3:20, H.264 + AAC, −14 LUFS)

Same direction as episodes 1–2, but with new fonts (see `../FONTS.md`): Li Alinur Kathakali for hook text, Li Hasan Jolchobi for supporting lines, Li Alinur Oishee for dialogue. Also the creator's voiceover; kinetic hook text; flat-vector characters; procedural score and sound effects; "The Unsaid" in the top-left corner and as the end card.

## Visual ideas
- **The 5-second motif:** the video opens with a 5-second quiz timer and three blank cards (favourite food, favourite colour, what she wanted to be). The buzzer sounds on "পারবেন না".
- **Key moment:** on "ডাইনিং টেবিলটা পাঁচ সেকেন্ডের জন্য চুপ" the music and every effect drop out. Only a clock ticks while a ৫→০ ring counts down and Amma's face slowly flushes red. The voiceover carries on over it.
- **Ilish diagram:** the fish is cut, and the head, belly and tail fly to আব্বা's, the children's and আম্মা's plates. Later the belly piece travels to Amma's plate, waits there, and slides back.
- **Other images:**
  - a curtain opening on a stage ("২৫ বছরের অভিনয়")
  - a sepia flashback polaroid of the girl who threw her plate
  - Amma raised on a pedestal with a halo ("দেবী")
  - a "মা দিবস" post with the stamp "দায়িত্ব শেষ"
  - a mirror where the young girl fades away
  - a teal "wish" light dimming year by year
  - a "মায়ের মহান ত্যাগ" plaque with applause
- **Ending:** the quiz cards return, still unanswered, beside the girl she used to be.
- **Colour code:** amber = the good pieces and the praise, teal = Amma as a person, rust = hits of truth.

## Build
The pipeline is the same as episode 1 (see `../the-unsaid/README.md`); run the commands from this folder. New files: `web/characters3.js` (খালা, Amma's flush, the ilish and its pieces) and `web/scenes.js`. In `build/audio.py`, a `silence_zone` cue mutes the music and every effect except the clock for 5 seconds. The Lipighor fonts are not in the repository (licence).
