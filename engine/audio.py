"""Score + sound design + mix for an episode -> <ep>/out/mix.wav

Everything is synthesized (no samples). script.json drives it:
  "music": {"preset": "tender_piano" | "dark_pulse" | "music_box" | "cinematic",
            "build": <line id>, "peak": <line id>, "cut": <line id or null>, "bpm": 64}
  "sfx":   [{"type": "impact", "at": "<line id>[:<word prefix>]", "offset": 0.0, "gain": 0.5, "pan": 0.0, ...}]
  scenes with "trans" other than "cut" get an automatic whoosh (unless "auto_whoosh": false).
Usage: python engine/audio.py episodes/<slug>
"""
import json
import sys
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.ndimage import maximum_filter1d, uniform_filter1d
from scipy.signal import butter, fftconvolve, resample_poly, sosfilt

SR = 48000
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
rng = np.random.default_rng(7)


# ------------------------------------------------------------------ helpers
def tt(d):
    return np.arange(int(max(d, 0.001) * SR)) / SR


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def lp(x, fc, order=2):
    return sosfilt(butter(order, fc, "low", fs=SR, output="sos"), x, axis=0)


def hp(x, fc, order=2):
    return sosfilt(butter(order, fc, "high", fs=SR, output="sos"), x, axis=0)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "band", fs=SR, output="sos"), x, axis=0)


class Track:
    def __init__(self, dur):
        self.n = int(dur * SR) + SR
        self.x = np.zeros((self.n, 2))

    def add(self, sig, t, gain=1.0, pan=0.0):
        i = int(t * SR)
        if i >= self.n or i < -len(sig):
            return
        if sig.ndim == 1:
            l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
            sig = np.stack([sig * l * 1.414, sig * r * 1.414], axis=1)
        if i < 0:
            sig, i = sig[-i:], 0
        n = min(len(sig), self.n - i)
        self.x[i:i + n] += sig[:n] * gain


def reverb(x, rt=2.8, wet=0.32, pre=0.025):
    n = int(rt * SR)
    t = np.arange(n) / SR
    ir = np.stack([rng.standard_normal(n) * np.exp(-6.9 * t / rt) for _ in range(2)], axis=1)
    ir = lp(ir, 6000)
    ir[: int(pre * SR)] = 0
    ir /= np.sqrt((ir ** 2).sum(axis=0))
    y = np.stack([fftconvolve(x[:, c], ir[:, c])[: len(x)] for c in range(2)], axis=1)
    return x * (1 - wet) + y * wet * 2.2


# ------------------------------------------------------------------ instruments
def piano(m, vel=0.5, dur=4.0):
    f, t = midi(m), tt(dur)
    out = np.zeros_like(t)
    bright = 0.6 + vel
    for n in range(1, 10):
        fn = f * n * np.sqrt(1 + 0.0004 * n * n)
        if fn > 16000:
            break
        a = (1 / n ** 1.6) * (bright ** (n - 1) if n > 1 else 1)
        dec = (0.55 + 0.35 * n) * (f / 260) ** 0.35
        for det in (-0.6, 0.6):
            out += a * 0.5 * np.exp(-t * dec) * np.sin(2 * np.pi * fn * (1 + det / 1731) * t + rng.random() * 6)
    nc = int(0.012 * SR)
    out[:nc] += lp(rng.standard_normal(nc), 2500) * np.linspace(1, 0, nc) * 0.15
    out *= np.minimum(1, t / 0.004) * np.minimum(1, (dur - t) / 0.4) * vel
    return lp(out, 5200)


def pad_note(m, dur, att=1.5, rel=2.0, cutoff=1400, amp=0.05):
    f, t = midi(m), tt(dur)
    out = np.zeros_like(t)
    for det in (-7, 0, 7):
        ff = f * 2 ** (det / 1200)
        for n in range(1, 7):
            out += (1 / n) * np.sin(2 * np.pi * ff * n * t + rng.random() * 6)
    env = np.minimum(1, t / att) * np.minimum(1, np.maximum(0, (dur - t) / rel))
    return lp(out * env * (1 + 0.08 * np.sin(2 * np.pi * 0.25 * t)), cutoff) * amp


def pluck(m, vel=0.3, dur=0.6, cutoff=2600):
    f, t = midi(m), tt(dur)
    saw = sum(((-1) ** (n + 1)) * np.sin(2 * np.pi * f * n * t) / n for n in range(1, 12) if f * n < 15000)
    return lp(saw * np.exp(-t * 7) * np.minimum(1, t / 0.003), cutoff) * vel * 0.6


def bell(m, a=0.25, d=2.0):
    t, f = tt(d), midi(m)
    y = sum(w * np.sin(2 * np.pi * f * r * t) * np.exp(-t * dd)
            for r, w, dd in ((1, 1, 2.2), (2.76, 0.4, 4), (5.4, 0.2, 7), (8.93, 0.1, 10)))
    return a * y * np.minimum(1, t / 0.003)


def drone(m, dur, amp=0.08):
    t, f = tt(dur), midi(m)
    y = sum(np.sin(2 * np.pi * f * k * (1 + d / 1200) * t + rng.random() * 6) / k
            for k in (1, 2, 3) for d in (-5, 5))
    env = np.minimum(1, t / 2.5) * np.minimum(1, (dur - t) / 1.5)
    return lp(y * env * (1 + 0.15 * np.sin(2 * np.pi * 0.11 * t)), 420) * amp


def sub_kick(a=0.6):
    t = tt(0.45)
    f = 38 + 70 * np.exp(-t * 28)
    return a * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)


# ------------------------------------------------------------------ SFX library
def heartbeat(a=1.0):
    t = tt(0.9)
    def thump(t0, amp):
        u = np.maximum(0, t - t0)
        f = 48 + 40 * np.exp(-u * 30)
        return amp * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-u * 14) * (t >= t0)
    return lp(thump(0, 1.0) + thump(0.26, 0.7), 300) * a


def whoosh(dur=0.75, lo=300, hi=3500):
    n = int(dur * SR)
    x = rng.standard_normal(n)
    t = np.arange(n) / n
    return (bp(x, lo, lo * 3) * (1 - t) + bp(x, hi / 3, hi) * t) * np.sin(np.pi * t) ** 2 * 0.5


def click(f=2400, dur=0.03, a=0.5):
    t = tt(dur)
    return a * np.sin(2 * np.pi * f * t) * np.exp(-t * 180) + a * 0.3 * lp(rng.standard_normal(len(t)), 6000) * np.exp(-t * 300)


def thud(a=0.6):
    t = tt(0.35)
    f = 90 * np.exp(-t * 8) + 40
    return a * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 16)


def impact(a=0.7):
    t = tt(1.4)
    body = sub_kick(1.0)
    noise = lp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 9) * 0.35
    out = noise.copy()
    out[:len(body)] += body
    return out * a


def glitch(dur=0.35, a=0.35):
    n = int(dur * SR)
    out = np.zeros(n)
    i = 0
    while i < n:
        L = int(SR * rng.uniform(0.01, 0.05))
        kind = rng.integers(3)
        seg_t = np.arange(min(L, n - i)) / SR
        if kind == 0:
            s = np.sign(np.sin(2 * np.pi * rng.uniform(200, 2000) * seg_t))
        elif kind == 1:
            s = rng.standard_normal(len(seg_t))
        else:
            s = np.round(np.sin(2 * np.pi * rng.uniform(60, 400) * seg_t) * 3) / 3
        out[i:i + len(s)] = s * rng.uniform(0.3, 1)
        i += L + int(SR * rng.uniform(0, 0.02))
    return hp(out, 150) * a


def tick(a=0.35):
    t = tt(0.05)
    return a * (np.sin(2 * np.pi * 3200 * t) * np.exp(-t * 260) + 0.4 * np.sin(2 * np.pi * 5100 * t) * np.exp(-t * 400))


def ticks(dur=1.0, a=0.3, start_gap=0.3, accel=0.9, min_gap=0.06):
    out = np.zeros(int(dur * SR))
    t, gap = 0.0, start_gap
    while t < dur:
        tk = tick(a)
        i = int(t * SR)
        out[i:i + len(tk)] += tk[: len(out) - i]
        t += gap
        gap = max(min_gap, gap * accel)
    return out


def scroll(dur=1.2, a=0.25):
    """fast thumb-scroll: soft swipes + detents"""
    out = np.zeros(int(dur * SR))
    t = 0.0
    while t < dur - 0.2:
        w = whoosh(0.18, 800, 6000) * 0.6
        i = int(t * SR)
        out[i:i + len(w)] += w[: len(out) - i]
        t += rng.uniform(0.16, 0.3)
    return hp(out, 500) * a


def page_flip(a=0.35, dur=0.22):
    n = int(dur * SR)
    t = np.arange(n) / n
    return bp(rng.standard_normal(n), 900, 7000) * (t ** 0.5) * (1 - t) ** 2 * 4 * a


def vibrate(dur=0.9, a=0.32):
    t = tt(dur)
    buzz = np.sign(np.sin(2 * np.pi * 155 * t)) * 0.5 + np.sin(2 * np.pi * 310 * t) * 0.3
    env = np.minimum(1, t / 0.02) * np.minimum(1, (dur - t) / 0.03)
    return lp(buzz * (0.6 + 0.4 * np.sin(2 * np.pi * 23 * t)) * env, 900) * a


def ding(a=0.25):
    out = np.zeros(int(1.6 * SR))
    for k, m in enumerate((88, 93)):
        b = bell(m, a, 1.4)
        i = int(k * 0.11 * SR)
        out[i:i + len(b)] += b
    return out


def counter(dur=1.5, a=0.22):
    return ticks(dur, a, start_gap=0.03, accel=1.03, min_gap=0.03)


def crt_off(a=0.4):
    t = tt(0.9)
    out = np.sin(2 * np.pi * np.cumsum(9000 * np.exp(-t * 5) + 200) / SR) * np.exp(-t * 4) * 0.25
    th = thud(0.6)
    out[:len(th)] += th
    return out * a


def riser(dur, a=1.0):
    n = int(dur * SR)
    t = np.arange(n) / n
    noise = bp(rng.standard_normal(n), 400, 9000) * (t ** 2.5) * 0.22
    tone = sum(np.sin(2 * np.pi * (110 * k) * (1 + 0.5 * t) * np.arange(n) / SR) for k in (1, 2, 3)) * t ** 2 * 0.08
    return (noise + tone) * a


def shimmer(dur=2.5, a=1.0):
    out = np.zeros(int(dur * SR))
    for k, m in enumerate([81, 84, 88, 91, 93, 96]):
        b = bell(m, 0.06, dur - k * 0.12)
        i = int(k * 0.12 * SR)
        out[i:i + len(b)] += b
    return out * a


def clink(a=0.3):
    t = tt(1.2)
    return a * sum(w * np.sin(2 * np.pi * f * t) * np.exp(-t * d)
                   for f, w, d in ((2150, 1, 6), (3410, 0.6, 8), (5230, 0.4, 11), (6900, 0.25, 14))) * np.minimum(1, t / 0.001)


def typing(dur=1.0, a=0.25):
    out = np.zeros(int(dur * SR))
    t = 0.0
    while t < dur - 0.05:
        c = click(rng.uniform(1500, 3500), 0.025, 0.4)
        i = int(t * SR)
        out[i:i + len(c)] += c[: len(out) - i]
        t += rng.uniform(0.06, 0.16)
    return out * a


SFX = {
    "heartbeat": lambda c: heartbeat(1.0), "whoosh": lambda c: whoosh(c.get("dur", 0.75)),
    "click": lambda c: click(c.get("freq", 2400), 0.04, 0.5), "thud": lambda c: thud(0.6), "impact": lambda c: impact(1.0),
    "glitch": lambda c: glitch(c.get("dur", 0.35), 1.0), "tick": lambda c: tick(1.0),
    "ticks": lambda c: ticks(c.get("dur", 1.5), 1.0), "scroll": lambda c: scroll(c.get("dur", 1.2), 1.0),
    "page_flip": lambda c: page_flip(1.0), "vibrate": lambda c: vibrate(c.get("dur", 0.6), 1.0),
    "ding": lambda c: ding(1.0), "counter": lambda c: counter(c.get("dur", 1.5), 1.0), "crt_off": lambda c: crt_off(1.0),
    "riser": lambda c: riser(c.get("dur", 2.0)), "shimmer": lambda c: shimmer(c.get("dur", 2.5)),
    "clink": lambda c: clink(1.0), "typing": lambda c: typing(c.get("dur", 1.0), 1.0),
    "bell": lambda c: bell(c.get("note", 84), 1.0, c.get("dur", 2.0)),
}


# ------------------------------------------------------------------ music presets
def piano_chords():
    return [(45, [57, 60, 64, 69, 71]), (41, [53, 57, 60, 65, 67]), (48, [55, 60, 64, 67, 74]), (43, [55, 59, 62, 67, 69])]


def m_tender_piano(tr, T, cfg):
    bpm = cfg.get("bpm", 64); beat = 60 / bpm; bar = beat * 4
    chords, melody = piano_chords(), [76, 72, 71, 72, 74, 72, 71, 67]
    t, i = 0.12, 0
    while t < T["cut"]:
        bass, tones = chords[i % 4]
        sect = 0 if t < T["build"] - 0.3 else (1 if t < T["peak"] else 2)
        h = lambda: rng.normal(0, 0.008)
        if sect == 0:
            tr.add(piano(tones[3], 0.28), t + h(), pan=0.15)
            tr.add(piano(tones[2], 0.22), t + 2 * beat + h(), pan=-0.1)
            if i >= 1:
                tr.add(piano(bass + 12, 0.25, 5), t, pan=-0.3)
        else:
            tr.add(piano(bass, 0.42 if sect == 2 else 0.34, 5), t, pan=-0.35)
            for k, idx in enumerate([0, 1, 3, 2, 4, 2, 3, 1]):
                tk = t + k * beat / 2 + h()
                if tk >= T["cut"]:
                    break
                v = (0.24 if sect == 1 else 0.3) * (1.15 if k % 4 == 0 else 0.9)
                if tk > T["rise"]:
                    v *= 1 + 0.8 * (tk - T["rise"]) / max(0.1, T["cut"] - T["rise"])
                tr.add(piano(tones[idx], v, 3.0), tk, pan=(tones[idx] - 62) / 24)
            if sect == 2:
                for hh in range(2):
                    if t + hh * 2 * beat < T["cut"]:
                        tr.add(piano(melody[(i * 2 + hh) % 8], 0.36, 4), t + hh * 2 * beat + 0.01, pan=0.2)
                for m in tones[:3]:
                    tr.add(pad_note(m, min(bar + 1.5, T["cut"] - t + 0.3), 1.2, 0.8), t)
        t += bar; i += 1
    return [(45, 0.32, 0), (57, 0.22, 0.02), (64, 0.2, 0.35), (71, 0.24, 0.9), (69, 0.26, 1.6)]


def m_dark_pulse(tr, T, cfg):
    """D minor: drone + sub pulse + ticking hats + plucked arps. Tense, modern, 'truth reveal'."""
    bpm = cfg.get("bpm", 88); beat = 60 / bpm; bar = beat * 4
    chords = [(38, [62, 65, 69, 74]), (34, [62, 65, 70, 74]), (31, [62, 67, 70, 74]), (33, [61, 64, 69, 73])]
    tr.add(drone(26, T["cut"] + 1.0, 0.10), 0.0)
    tr.add(drone(38, T["cut"] + 1.0, 0.05), 0.0, pan=0.2)
    t, i = 0.0, 0
    while t < T["cut"]:
        bass, tones = chords[i % 4]
        sect = 0 if t < T["build"] - 0.2 else (1 if t < T["peak"] else 2)
        tr.add(pad_note(bass + 24, min(bar + 1.0, T["cut"] - t + 0.2), 0.8, 0.6, 900, 0.04 + 0.02 * sect), t)
        for b in range(4):
            tb = t + b * beat
            if tb >= T["cut"]:
                break
            if sect >= 1 or b == 0:
                tr.add(sub_kick(0.55 if sect else 0.35), tb)
            if sect >= 1:
                for e in range(2):
                    th = tb + e * beat / 2
                    if th < T["cut"]:
                        tr.add(hp(click(7000, 0.03, 0.12), 4000), th, pan=0.3 * (-1) ** e)
            if sect == 2:
                for s in range(4):
                    ts = tb + s * beat / 4
                    if ts < T["cut"]:
                        v = 0.18 * (1 + (0.9 * (ts - T["rise"]) / max(0.1, T["cut"] - T["rise"]) if ts > T["rise"] else 0))
                        tr.add(pluck(tones[(s + b * 2 + i) % 4] + (12 if s == 3 else 0), v, 0.5, 2200 + 1500 * (s % 2)), ts, pan=0.4 * np.sin(s))
        t += bar; i += 1
    return [(26, 0.4, 0), (38, 0.3, 0.02), (69, 0.18, 0.6), (74, 0.16, 1.3)]


def m_music_box(tr, T, cfg):
    """Eerie lullaby: bells in A minor over a soft pad."""
    bpm = cfg.get("bpm", 72); beat = 60 / bpm; bar = beat * 4
    mel = [81, 76, 72, 76, 79, 77, 76, 72, 74, 71, 69, 71, 72, 69, 68, 69]
    chords = [[57, 60, 64], [53, 57, 60], [55, 59, 62], [52, 56, 59]]
    t, i, n = 0.1, 0, 0
    while t < T["cut"]:
        sect = 0 if t < T["build"] else (1 if t < T["peak"] else 2)
        for m in chords[i % 4]:
            tr.add(pad_note(m, min(bar + 1.0, T["cut"] - t + 0.2), 1.0, 0.8, 1200, 0.03 + 0.015 * sect), t)
        steps = 4 if sect == 0 else 8
        for s in range(steps):
            ts = t + s * bar / steps
            if ts < T["cut"]:
                tr.add(bell(mel[n % 16], 0.12 + 0.03 * sect, 2.0), ts, pan=0.3 * np.sin(n))
                n += 1
        if sect == 2:
            tr.add(piano(chords[i % 4][0] - 12, 0.35, 4), t)
        t += bar; i += 1
    return [(45, 0.3, 0), (81, 0.12, 0.5), (76, 0.1, 1.1)]


def m_cinematic(tr, T, cfg):
    """Slow strings-like swells with low piano and booms at the peak."""
    bpm = cfg.get("bpm", 60); bar = 60 / bpm * 4
    chords = [(38, [62, 65, 69]), (34, [62, 65, 70]), (41, [60, 65, 69]), (36, [60, 64, 67])]
    t, i = 0.0, 0
    while t < T["cut"]:
        bass, tones = chords[i % 4]
        sect = 0 if t < T["build"] else (1 if t < T["peak"] else 2)
        d = min(bar + 1.5, T["cut"] - t + 0.3)
        for m in tones + ([tones[0] + 12] if sect else []):
            tr.add(pad_note(m, d, 1.6, 1.0, 1800 + 800 * sect, 0.04 + 0.02 * sect), t)
        tr.add(piano(bass, 0.3 + 0.08 * sect, 5), t, pan=-0.2)
        if sect == 2:
            tr.add(impact(0.5), t)
        t += bar; i += 1
    return [(38, 0.35, 0), (62, 0.2, 0.05), (69, 0.2, 0.6)]


PRESETS = {"tender_piano": m_tender_piano, "dark_pulse": m_dark_pulse, "music_box": m_music_box, "cinematic": m_cinematic}


# ------------------------------------------------------------------ main
def main(ep_dir):
    ep = Path(ep_dir).resolve()
    script = json.loads((ep / "script.json").read_text(encoding="utf-8"))
    tl = json.loads((ep / "out" / "timeline.json").read_text(encoding="utf-8"))
    D = tl["duration"]
    L = {l["id"]: l for l in tl["lines"]}

    def at(spec, offset=0.0):
        lid, _, word = spec.partition(":")
        if lid == "end":
            return D + offset
        ln = L[lid]
        if word == "end":
            return ln["end"] + offset
        if word:
            for w in ln["words"]:
                if w["w"].lower().strip(",.!?;:'\"").startswith(word.lower()):
                    return w["s"] + offset
            raise KeyError(f"word '{word}' not in line '{lid}'")
        return ln["start"] + offset

    mcfg = script.get("music", {})
    ids = [l["id"] for l in tl["lines"]]
    cut_id = mcfg.get("cut")
    T = {
        "build": L[mcfg.get("build", ids[min(2, len(ids) - 1)])]["start"],
        "peak": L[mcfg.get("peak", ids[len(ids) // 2])]["start"],
        "cut": (L[cut_id]["start"] - 0.06) if cut_id else D - 0.5,
    }
    T["rise"] = L[ids[ids.index(cut_id) - 1]]["start"] if cut_id else T["cut"] - 2.0
    final_t = (L[cut_id]["end"] + 0.35) if cut_id else None

    mus = Track(D)
    finale = PRESETS[mcfg.get("preset", "tender_piano")](mus, T, mcfg)
    i = int(T["cut"] * SR); f = int(0.04 * SR)
    mus.x[i - f:i] *= np.linspace(1, 0, f)[:, None]
    mus.x[i:] = 0
    if final_t is not None:
        for m, v, dt in finale:
            mus.add(piano(m, v, 9) if m < 80 else bell(m, v, 6), final_t + dt, pan=(m - 60) / 40)

    sfx = Track(D)
    if script.get("auto_whoosh", True):
        for s in script["scenes"][1:]:
            if s["lines"][0] in L and s.get("trans", "fade") not in ("cut", "glitch"):
                sfx.add(whoosh(0.75), L[s["lines"][0]]["start"] - 0.5, 0.35, pan=rng.uniform(-0.3, 0.3))
            elif s["lines"][0] in L and s.get("trans") == "glitch":
                sfx.add(glitch(0.35), L[s["lines"][0]]["start"] - 0.33, 0.3)
    if cut_id:
        sfx.add(riser(T["cut"] - T["rise"]), T["rise"], mcfg.get("riser_gain", 0.9))
        sfx.add(thud(0.6), T["cut"])
    for c in script.get("sfx", []):
        sig = SFX[c["type"]](c)
        sfx.add(sig, at(c["at"], c.get("offset", 0.0)), c.get("gain", 0.5), c.get("pan", 0.0))

    # voice
    v = np.zeros(mus.n)
    for ln in tl["lines"]:
        a, sr = sf.read(ep / ln["file"])
        a = resample_poly(a, SR, sr)
        s = int(ln["start"] * SR)
        v[s:s + len(a)] += a[: mus.n - s]
    v = hp(v, 80)
    v = v + 0.25 * bp(v, 2500, 6000)
    v = v / (np.abs(v).max() + 1e-9) * 0.85
    env = uniform_filter1d(maximum_filter1d(np.abs(v), int(0.05 * SR)), int(0.35 * SR))
    duck = 1 - 0.45 * np.clip(env / (env.max() + 1e-9), 0, 1)

    m = reverb(mus.x, 3.2, 0.38); m /= np.abs(m).max() + 1e-9
    s = reverb(sfx.x, 1.6, 0.18)
    vs = reverb(np.stack([v, v], axis=1), 1.2, 0.08)
    mix = m * mcfg.get("level", 0.42) * duck[:, None] + s * 0.55 + vs * 0.95
    mix = np.tanh(mix * 1.1) / np.tanh(1.1)
    mix *= 0.89 / np.abs(mix).max()
    mix = mix[: int(D * SR)]
    fo = int(0.4 * SR)
    mix[-fo:] *= np.linspace(1, 0.0, fo)[:, None]
    sf.write(ep / "out" / "mix.wav", mix.astype(np.float32), SR)
    print(f"wrote mix.wav {len(mix) / SR:.2f}s  preset={mcfg.get('preset', 'tender_piano')}")


if __name__ == "__main__":
    main(sys.argv[1])
