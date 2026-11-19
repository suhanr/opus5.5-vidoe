"""Synthesize score + sound design, mix with voiceover -> out/mix.wav

Everything here is generated procedurally (no samples): a soft felt-piano
score, a pad, a riser, and the SFX that sync to the visuals.
"""
import json
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt, fftconvolve, resample_poly

ROOT = Path(__file__).resolve().parent.parent
SR = 48000
rng = np.random.default_rng(7)

TL = json.loads((ROOT / "out" / "timeline.json").read_text())
DUR = TL["duration"]
N = int(DUR * SR) + SR
LINES = {l["id"]: l for l in TL["lines"]}


def word_t(line_id, word_prefix):
    for w in LINES[line_id]["words"]:
        if w["w"].lower().strip(",.").startswith(word_prefix.lower()):
            return w["s"]
    raise KeyError(word_prefix)


def buf():
    return np.zeros((N, 2), dtype=np.float64)


def add(dst, sig, t, gain=1.0, pan=0.0):
    """Add mono or stereo signal at time t (seconds) with equal-power pan."""
    i = int(t * SR)
    if i >= N:
        return
    if sig.ndim == 1:
        l = np.cos((pan + 1) * np.pi / 4)
        r = np.sin((pan + 1) * np.pi / 4)
        sig = np.stack([sig * l * 1.414, sig * r * 1.414], axis=1)
    n = min(len(sig), N - i)
    dst[i:i + n] += sig[:n] * gain


def lp(x, fc, order=2):
    return sosfilt(butter(order, fc, "low", fs=SR, output="sos"), x, axis=0)


def hp(x, fc, order=2):
    return sosfilt(butter(order, fc, "high", fs=SR, output="sos"), x, axis=0)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "band", fs=SR, output="sos"), x, axis=0)


def tt(d):
    return np.arange(int(d * SR)) / SR


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


# ----------------------------------------------------------------- instruments
def piano(m, vel=0.5, dur=4.0):
    f = midi(m)
    t = tt(dur)
    out = np.zeros_like(t)
    B = 0.0004
    bright = 0.6 + vel
    for n in range(1, 10):
        fn = f * n * np.sqrt(1 + B * n * n)
        if fn > 16000:
            break
        a = (1 / n ** 1.6) * (bright ** (n - 1) if n > 1 else 1)
        dec = (0.55 + 0.35 * n) * (f / 260) ** 0.35
        for det in (-0.6, 0.6):  # two slightly detuned strings
            out += a * 0.5 * np.exp(-t * dec) * np.sin(2 * np.pi * fn * (1 + det / 1731) * t + rng.random() * 6)
    # hammer: tiny filtered click
    click = lp(rng.standard_normal(int(0.012 * SR)), 2500) * np.linspace(1, 0, int(0.012 * SR)) * 0.15
    out[:len(click)] += click
    att = np.minimum(1, t / 0.004)
    rel = np.minimum(1, (dur - t) / 0.4)
    out *= att * rel * vel
    return lp(out, 5200)


def pad_note(m, dur, att=1.5, rel=2.0):
    f = midi(m)
    t = tt(dur)
    out = np.zeros_like(t)
    for det in (-7, 0, 7):
        ff = f * 2 ** (det / 1200)
        for n in range(1, 7):
            out += (1 / n) * np.sin(2 * np.pi * ff * n * t + rng.random() * 6)
    env = np.minimum(1, t / att) * np.minimum(1, np.maximum(0, (dur - t) / rel))
    trem = 1 + 0.08 * np.sin(2 * np.pi * 0.25 * t)
    return lp(out * env * trem, 1400) * 0.05


def reverb(x, rt=2.8, wet=0.32, pre=0.025):
    n = int(rt * SR)
    t = np.arange(n) / SR
    ir = np.zeros((n, 2))
    for c in range(2):
        noise = rng.standard_normal(n)
        ir[:, c] = noise * np.exp(-6.9 * t / rt)
    ir = lp(ir, 6000)
    ir[: int(pre * SR)] = 0
    ir /= np.sqrt((ir ** 2).sum(axis=0))
    y = np.stack([fftconvolve(x[:, c], ir[:, c])[: len(x)] for c in range(2)], axis=1)
    return x * (1 - wet) + y * wet * 2.2


# ------------------------------------------------------------------- the score
BPM = 64
BEAT = 60 / BPM
BAR = BEAT * 4
# vi - IV - I - V in C (Am F C G) ; (bass root, chord tones)
CHORDS = [
    (45, [57, 60, 64, 69, 71]),   # Am(add9)
    (41, [53, 57, 60, 65, 67]),   # Fmaj(add9)
    (48, [55, 60, 64, 67, 74]),   # C(add9)
    (43, [55, 59, 62, 67, 69]),   # G(add6)
]
MELODY = [76, 72, 71, 72, 74, 72, 71, 67]  # top-line, one note per half bar in section C

t_knew = LINES["knew"]["start"]
t_announce = LINES["announce"]["start"] - 0.2
t_end1 = LINES["end1"]["start"]
t_cut = LINES["end2"]["start"] - 0.06
t_final = LINES["end2"]["end"] + 0.35


def score():
    mus = buf()
    bar_i = 0
    t = 0.12
    while t < t_cut:
        bass, tones = CHORDS[bar_i % 4]
        sect = 0 if t < t_knew - 0.3 else (1 if t < t_announce else 2)
        humanize = lambda: rng.normal(0, 0.008)
        if sect == 0:
            # sparse: two soft notes per bar
            add(mus, piano(tones[3], 0.28), t + humanize(), pan=0.15)
            add(mus, piano(tones[2], 0.22), t + 2 * BEAT + humanize(), pan=-0.1)
            if bar_i >= 1:
                add(mus, piano(bass + 12, 0.25, 5), t, pan=-0.3)
        else:
            add(mus, piano(bass, 0.42 if sect == 2 else 0.34, 5), t, pan=-0.35)
            pattern = [0, 1, 3, 2, 4, 2, 3, 1]
            for k, idx in enumerate(pattern):
                tk = t + k * BEAT / 2 + humanize()
                if tk >= t_cut:
                    break
                v = (0.24 if sect == 1 else 0.3) * (1.15 if k % 4 == 0 else 0.9)
                if t > t_end1:
                    v *= 1 + 0.8 * (tk - t_end1) / (t_cut - t_end1)
                m = tones[idx]
                add(mus, piano(m, v, 3.0), tk, pan=(m - 62) / 24)
            if sect == 2:
                for h in range(2):
                    th = t + h * 2 * BEAT
                    if th < t_cut:
                        add(mus, piano(MELODY[(bar_i * 2 + h) % len(MELODY)], 0.36, 4), th + 0.01, pan=0.2)
                d = min(BAR + 1.5, t_cut - t + 0.3)
                for m in tones[:3]:
                    add(mus, pad_note(m, d, att=1.2, rel=0.8), t)
        t += BAR
        bar_i += 1

    # hard cut before "And you won't know."
    i = int(t_cut * SR)
    fade = int(0.04 * SR)
    mus[i - fade:i] *= np.linspace(1, 0, fade)[:, None]
    mus[i:] = 0

    # final: a lone chord after the silence, long tail
    add(mus, piano(45, 0.32, 9), t_final, pan=-0.3)
    add(mus, piano(57, 0.22, 9), t_final + 0.02)
    add(mus, piano(64, 0.2, 9), t_final + 0.35, pan=0.2)
    add(mus, piano(71, 0.24, 9), t_final + 0.9, pan=0.35)
    add(mus, piano(69, 0.26, 9), t_final + 1.6, pan=0.25)
    return mus


# ---------------------------------------------------------------------- SFX
def heartbeat():
    t = tt(0.9)
    def thump(t0, a):
        tt_ = np.maximum(0, t - t0)
        f = 48 + 40 * np.exp(-tt_ * 30)
        ph = 2 * np.pi * np.cumsum(f) / SR
        return a * np.sin(ph) * np.exp(-tt_ * 14) * (t >= t0)
    return lp(thump(0, 1.0) + thump(0.26, 0.7), 300)


def whoosh(d=0.7, lo=300, hi=3500, rev=False):
    n = int(d * SR)
    x = rng.standard_normal(n)
    t = np.arange(n) / n
    env = np.sin(np.pi * t) ** 2 if not rev else t ** 3
    # sweep: blend of low and high band versions
    a = bp(x, lo, lo * 3)
    b = bp(x, hi / 3, hi)
    y = a * (1 - t) + b * t
    return y * env * 0.5


def click(f=2400, d=0.03, a=0.5):
    t = tt(d)
    return a * np.sin(2 * np.pi * f * t) * np.exp(-t * 180) + a * 0.3 * lp(rng.standard_normal(len(t)), 6000) * np.exp(-t * 300)


def thud(a=0.6):
    t = tt(0.35)
    f = 90 * np.exp(-t * 8) + 40
    return a * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 16)


def bounce(a=0.3):
    t = tt(0.25)
    f = 180 * np.exp(-t * 10) + 70
    return a * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 22)


def lamp_on():
    t = tt(1.6)
    hum = sum(np.sin(2 * np.pi * 120 * k * t) / k for k in (1, 2, 3, 5))
    hum *= 0.05 * np.minimum(1, t / 0.05) * np.exp(-t * 1.6)
    return hum + np.pad(click(1800, 0.05, 0.6), (0, len(t) - int(0.05 * SR)))


def page_flip(a=0.35, d=0.22):
    n = int(d * SR)
    x = bp(rng.standard_normal(n), 900, 7000)
    t = np.arange(n) / n
    env = (t ** 0.5) * (1 - t) ** 2 * 4
    return x * env * a


def tick(a=0.35):
    t = tt(0.05)
    return a * (np.sin(2 * np.pi * 3200 * t) * np.exp(-t * 260) + 0.4 * np.sin(2 * np.pi * 5100 * t) * np.exp(-t * 400))


def sand(d):
    x = hp(lp(rng.standard_normal(int(d * SR)), 5000), 1500)
    t = tt(d)
    grit = (rng.random(len(t)) > 0.996) * rng.standard_normal(len(t)) * 2
    env = np.minimum(1, t / 0.5) * np.minimum(1, (d - t) / 0.6)
    return (x * 0.04 + hp(grit, 3000) * 0.05) * env


def vibrate(d=0.9):
    t = tt(d)
    buzz = np.sign(np.sin(2 * np.pi * 155 * t)) * 0.5 + np.sin(2 * np.pi * 310 * t) * 0.3
    am = 0.6 + 0.4 * np.sin(2 * np.pi * 23 * t)
    env = np.minimum(1, t / 0.02) * np.minimum(1, (d - t) / 0.03)
    return lp(buzz * am * env, 900) * 0.32


def chime(m, a=0.25, d=2.0):
    t = tt(d)
    f = midi(m)
    y = sum(w * np.sin(2 * np.pi * f * r * t) * np.exp(-t * dd)
            for r, w, dd in ((1, 1, 2.2), (2.76, 0.4, 4), (5.4, 0.2, 7), (8.93, 0.1, 10)))
    return a * y * np.minimum(1, t / 0.003)


def clink(a=0.3):
    t = tt(1.2)
    y = sum(w * np.sin(2 * np.pi * f * t) * np.exp(-t * d)
            for f, w, d in ((2150, 1, 6), (3410, 0.6, 8), (5230, 0.4, 11), (6900, 0.25, 14)))
    return a * y * np.minimum(1, t / 0.001)


def riser(d):
    n = int(d * SR)
    t = np.arange(n) / n
    x = rng.standard_normal(n)
    y = bp(x, 400, 9000) * (t ** 2.5)
    tone = sum(np.sin(2 * np.pi * (110 * k) * (1 + 0.5 * t) * np.arange(n) / SR) for k in (1, 2, 3)) * t ** 2 * 0.08
    return (y * 0.22 + tone)


def shimmer(d=2.5):
    out = np.zeros(int(d * SR))
    for k, m in enumerate([81, 84, 88, 91, 93, 96]):
        c = chime(m, 0.06, d - k * 0.12)
        i = int(k * 0.12 * SR)
        out[i:i + len(c)] += c
    return out


def sfx():
    s = buf()
    L = LINES
    # hook: heartbeat
    for tb in (0.2, 1.2):
        add(s, heartbeat(), tb, 0.9)
    # transitions: whooshes on most scene changes
    for sid in ("carry1", "knew", "play", "story", "friend", "announce", "now", "call", "coffee", "hug", "end1"):
        if sid in L: add(s, whoosh(0.75), L[sid]["start"] - 0.5, 0.35, pan=rng.uniform(-0.3, 0.3))
    # carry: lift + set down
    add(s, chime(79, 0.12), L["carry1"]["start"] + 0.5, pan=0.2)
    add(s, thud(0.25), L["carry2"]["start"] + 0.6)
    # knew: polaroid shutter + drop
    add(s, click(3800, 0.04, 0.35), L["knew"]["start"] - 0.05)
    add(s, page_flip(0.3, 0.12), L["knew"]["start"] + 0.0)
    add(s, thud(0.3), L["knew"]["start"] + 0.55)
    # play: bouncing ball + lamp
    p0 = L["play"]["start"]
    for k in range(5):
        add(s, bounce(0.22 - k * 0.02), p0 + 0.3 + k * 0.48, pan=-0.3 + k * 0.15)
    add(s, lamp_on(), word_t("play", "streetlights"), 0.8, pan=0.35)
    # story: page flips, then book closes
    if "story" in L:
        st = L["story"]["start"]
        add(s, page_flip(0.3), st + 0.15, pan=0.2)
        add(s, page_flip(0.25), st + 0.55, pan=-0.1)
        add(s, thud(0.35), st + 1.35)
        add(s, chime(88, 0.06, 2.5), st + 1.5, pan=0.4)
    # friend: soft chime on "tomorrow"
    if "friend" in L:
        add(s, chime(76, 0.1), word_t("friend", "see"), pan=-0.2)
        add(s, chime(83, 0.08), word_t("friend", "tomorrow"), pan=0.2)
    # announce: accelerating ticks + flips
    a0, a1 = L["announce"]["start"] - 0.1, L["call"]["start"] - 0.25
    tk = a0
    gap = 0.32
    while tk < a1:
        add(s, tick(0.3), tk, pan=0.2)
        add(s, page_flip(0.12, 0.1), tk + 0.02, pan=rng.uniform(-0.5, 0.5))
        tk += gap
        gap = max(0.07, gap * 0.9)
    # now: hourglass sand
    if "now" in L:
        add(s, sand(L["call"]["start"] - L["now"]["start"]), L["now"]["start"], 1.0)
    # call: vibrate x2 then pickup pop
    c0 = L["call"]["start"]
    add(s, vibrate(0.55), c0 - 0.25, 0.9)
    add(s, vibrate(0.55), c0 + 0.55, 0.9)
    add(s, click(1200, 0.06, 0.4), word_t("call", "pick"), pan=0.1)
    add(s, chime(84, 0.08, 1.2), word_t("call", "pick") + 0.05)
    # coffee: mugs clink
    if "coffee" in L:
        add(s, clink(0.22), L["coffee"]["start"] + 1.35, pan=0.1)
    # hug: warm shimmer
    add(s, shimmer(3.0), L["hug"]["start"] + 0.55, 0.9)
    # end: riser into the cut, then heartbeat on end card
    add(s, riser(t_cut - t_end1), t_end1, 0.9)
    # sub drop exactly at the cut for impact
    add(s, thud(0.6), t_cut)
    for tb in (t_final + 1.75,):
        add(s, heartbeat(), tb, 0.7)
    return s


def vo():
    v = np.zeros(N)
    for l in TL["lines"]:
        a, sr = sf.read(ROOT / l["file"])
        a = resample_poly(a, SR, sr)
        i = int(l["start"] * SR)
        v[i:i + len(a)] += a[: N - i]
    # gentle voice EQ: remove rumble, add presence
    v = hp(v, 80)
    v = v + 0.25 * bp(v, 2500, 6000)
    v /= np.abs(v).max() + 1e-9
    return v * 0.85


def envelope_follow(x, att=0.02, rel=0.35):
    e = np.abs(x)
    # smooth via moving max then one-pole
    w = int(0.05 * SR)
    from scipy.ndimage import maximum_filter1d, uniform_filter1d
    e = maximum_filter1d(e, w)
    e = uniform_filter1d(e, int(rel * SR))
    return np.clip(e / (e.max() + 1e-9), 0, 1)


def main():
    mus = score()
    mus = reverb(mus, rt=3.2, wet=0.38)
    mus /= np.abs(mus).max() + 1e-9
    s = sfx()
    s = reverb(s, rt=1.6, wet=0.18)
    v = vo()
    # duck music under VO
    duck = 1 - 0.45 * envelope_follow(v)
    vstereo = np.stack([v, v], axis=1)
    vstereo = reverb(vstereo, rt=1.2, wet=0.08)
    mix = mus * 0.42 * duck[:, None] + s * 0.55 + vstereo * 0.95
    # soft limiter
    mix = np.tanh(mix * 1.1) / np.tanh(1.1)
    mix *= 0.89 / np.abs(mix).max()
    end = int(DUR * SR)
    mix = mix[:end]
    fo = int(0.6 * SR)
    mix[-fo:] *= np.linspace(1, 0, fo)[:, None]
    sf.write(ROOT / "out" / "mix.wav", mix.astype(np.float32), SR)
    sf.write(ROOT / "out" / "music_only.wav", (mus * 0.5).astype(np.float32)[:end], SR)
    print("wrote out/mix.wav", mix.shape[0] / SR, "s")


if __name__ == "__main__":
    main()
