"""Score + sound design for 'The Unsaid', synthesized procedurally, mixed under the voiceover -> out/mix.wav"""
import json
from pathlib import Path
import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, fftconvolve, resample_poly

ROOT = Path(__file__).resolve().parent.parent
SR = 48000
rng = np.random.default_rng(11)
TL = json.loads((ROOT / 'out/timeline.json').read_text())
CU = json.loads((ROOT / 'out/cues.json').read_text())
DUR = TL['dur']; N = int(DUR * SR) + SR
FZ = CU['freeze']
def buf(): return np.zeros((N, 2))
def add(dst, sig, t, gain=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N or i < -len(sig): return
    if sig.ndim == 1:
        l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        sig = np.stack([sig * l * 1.414, sig * r * 1.414], axis=1)
    if i < 0: sig = sig[-i:]; i = 0
    n = min(len(sig), N - i); dst[i:i + n] += sig[:n] * gain
def lp(x, fc, o=2): return sosfilt(butter(o, fc, 'low', fs=SR, output='sos'), x, axis=0)
def hp(x, fc, o=2): return sosfilt(butter(o, fc, 'high', fs=SR, output='sos'), x, axis=0)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x, axis=0)
def tt(d): return np.arange(int(d * SR)) / SR
def midi(m): return 440.0 * 2 ** ((m - 69) / 12)
exec(open(ROOT / 'build/_lib.py').read())
LT = {l['i']: l for l in TL['lines']}

# ------------------------------------------------------------------ extra SFX
def place(out, c, i):
    n = min(len(c), len(out) - i)
    if n > 0: out[i:i + n] += c[:n]
    return out
def lay(d, *pairs):
    out = np.zeros(int(d * SR))
    for sig, off in pairs: place(out, sig, int(off * SR))
    return out
def noise(d): return rng.standard_normal(int(d * SR))
def env_ad(d, a=0.005, k=8): t = tt(d); return np.minimum(1, t / a) * np.exp(-t * k)
def impact(a=1.0):
    t = tt(2.2); f = 55 + 70 * np.exp(-t * 12)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.6)
    crack = lp(noise(2.2), 3000) * np.exp(-t * 28) * 0.6
    return a * (sub + crack) * 0.9
def impact_soft(a=1.0):
    t = tt(1.2); f = 70 + 40 * np.exp(-t * 10)
    return a * 0.6 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 4) + a * 0.15 * lp(noise(1.2), 1500) * np.exp(-t * 20)
def hit(a=1.0):
    t = tt(0.6); return a * (0.5 * np.sin(2 * np.pi * np.cumsum(90 * np.exp(-t * 6) + 50) / SR) * np.exp(-t * 9) + 0.3 * bp(noise(.6), 800, 5000) * np.exp(-t * 35))
def crack(a=1.0):
    d = 1.0; t = tt(d); x = hp(noise(d), 2500) * np.exp(-t * 9)
    sp = np.zeros(len(t))
    for k in range(40):
        i = int(rng.random() ** 2 * .6 * SR); sp[i:i + 60] += rng.standard_normal(60) * (1 - i / len(t))
    return a * (x * .5 + hp(sp, 2000) * .8)
def glitch(a=1.0):
    d = 0.45; x = noise(d); t = tt(d)
    sq = np.sign(np.sin(2 * np.pi * (300 + 900 * (np.floor(t * 30) % 3)) * t)) * 0.3
    y = (np.round(x * 3) / 3 * 0.3 + sq) * (np.floor(t * 22) % 2)
    return a * bp(y, 300, 6000) * np.minimum(1, (d - t) / .05)
def beep(a=1.0):
    t = tt(0.16); return a * 0.35 * np.sin(2 * np.pi * 1046 * t) * np.minimum(1, t / .004) * np.minimum(1, (0.16 - t) / .03)
def flatline(a=1.0):
    t = tt(2.2); return a * 0.25 * np.sin(2 * np.pi * 1046 * t) * np.minimum(1, t / .01) * np.minimum(1, (2.2 - t) / .8)
def pop(a=1.0):
    t = tt(0.12); f = 900 * np.exp(-t * 30) + 300
    return a * 0.5 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 40)
def type_(a=1.0):
    out = np.zeros(int(0.7 * SR))
    for k in range(6):
        c = click(1800 + rng.random() * 1500, .03, .4); i = int((k * .1 + rng.random() * .03) * SR); place(out, c, i)
    return a * out
def clock(a=1.0): return a * tick(.5)
def mosquito(a=1.0):
    d = 2.6; t = tt(d); f = 620 + 40 * np.sin(2 * np.pi * 7 * t) + 30 * np.sin(2 * np.pi * .7 * t)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR); y = np.sign(y) * np.abs(y) ** .5
    return a * 0.12 * bp(y, 400, 3000) * np.sin(np.pi * t / d) ** 2 * (0.6 + 0.4 * np.sin(2 * np.pi * 1.3 * t))
def stamp(a=1.0):
    t = tt(0.8); return a * lay(.8, (impact_soft(1.0) * 1.2, 0), (0.5 * bp(noise(.8), 500, 4000) * np.exp(-t * 40), 0))
def coins(a=1.0):
    out = np.zeros(int(1.4 * SR))
    for k in range(14):
        c = clink(.12 + rng.random() * .1)[: int(.5 * SR)]; i = int((k * .07 + rng.random() * .03) * SR); place(out, c, i)
    return a * out
def ding(a=1.0): return a * lay(1.9, (chime(84, .3, 1.8), 0), (chime(91, .22, 1.6), .12))
def shutter(a=1.0):
    t = tt(0.3); return a * (click(3000, .03, .6).tolist() and np.pad(click(3000, .03, .6), (0, len(t) - int(.03 * SR))) + 0.4 * hp(noise(.3), 2000) * np.exp(-t * 30) + np.pad(click(2200, .03, .5), (int(.09 * SR), len(t) - int(.12 * SR))))
def like(a=1.0):
    t = tt(0.2); f = 600 + 900 * t / .2
    return a * 0.3 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 18)
def crowd(a=1.0):
    d = 3.0; t = tt(d); y = np.zeros(len(t))
    for k in range(6):
        m = 0.5 + 0.5 * np.sin(2 * np.pi * (2 + rng.random() * 3) * t + rng.random() * 6)
        y += bp(noise(d), 250 + k * 80, 900 + k * 120) * m
    return a * 0.12 * y * np.sin(np.pi * t / d)
def mic(a=1.0):
    d = 0.9; t = tt(d); return a * 0.06 * np.sin(2 * np.pi * 2200 * t) * np.sin(np.pi * t / d) ** 3 + a * 0.2 * click(900, .03, .5).sum() * 0
def water(a=1.0):
    d = 1.4; out = np.zeros(int(d * SR))
    for k in range(10):
        dd = .06 + rng.random() * .1; t = tt(dd); f = 400 + rng.random() * 900
        s = np.sin(2 * np.pi * np.cumsum(f * (1 + 2 * t / dd)) / SR) * np.exp(-t * 40)
        i = int(rng.random() * (d - .2) * SR); place(out, s * .3, i)
    return a * (out + 0.15 * bp(noise(d), 300, 3000) * np.sin(np.pi * tt(d) / d))
def erase(a=1.0):
    d = .8; t = tt(d); return a * 0.35 * bp(noise(d), 1500, 6000) * (0.5 + 0.5 * np.sin(2 * np.pi * 9 * t)) * np.sin(np.pi * t / d)
def creak(a=1.0):
    d = 1.2; t = tt(d); f = 140 + 30 * np.sin(2 * np.pi * .8 * t)
    y = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * (np.sin(2 * np.pi * 23 * t) > .2)
    return a * 0.12 * bp(y, 200, 2500) * np.sin(np.pi * t / d)
def cloth(a=1.0): return a * whoosh(.5, 200, 2000) * .8
def pen(a=1.0):
    d = 1.0; t = tt(d); return a * 0.3 * bp(noise(d), 2500, 8000) * (0.4 + 0.6 * np.abs(np.sin(2 * np.pi * 6 * t))) * np.minimum(1, (d - t) / .2)
def drone(d, root=38, dark=False):
    t = tt(d); y = np.zeros(len(t))
    for m, w in ((root, 1), (root + 7, .5), (root + 12, .4), (root + (15 if dark else 16), .25)):
        for det in (-4, 4): y += w * np.sin(2 * np.pi * midi(m) * 2 ** (det / 1200) * t + rng.random() * 6)
    return lp(y, 900) * np.minimum(1, t / 1.5) * np.minimum(1, (d - t) / 2) * 0.06
def paper(a=1.0): return a * page_flip(.4, .3)
def block(a=1.0):
    t = tt(.5); return a * lay(.5, (thud(.6), 0), (.2 * lp(noise(.5), 1200) * np.exp(-t * 30), 0))
def snap(a=1.0):
    t = tt(.4); return a * (0.6 * hp(noise(.4), 1500) * np.exp(-t * 60) + 0.3 * bp(noise(.4), 300, 1200) * np.exp(-t * 25))
def match(a=1.0):
    d = 1.4; t = tt(d); strike = bp(noise(d), 1500, 7000) * np.exp(-t * 18) * .6
    flame = lp(noise(d), 700) * np.minimum(1, t / .15) * np.exp(-t * 1.5) * .35
    return a * (strike + flame)
def door(a=1.0):
    return a * lay(1.2, (creak(1) * .7, 0), (thud(.4), .6))
def echo(a=1.0):
    out = np.zeros(int(2 * SR)); c = chime(76, .15, 1.2)
    for k in range(4): i = int(k * .28 * SR); place(out, c * (.6 ** k), i)
    return a * out
def freeze_sfx(a=1.0):
    d = 0.5; t = tt(d); x = bp(noise(d), 300, 8000) * (t / d) ** 3 * .5
    return a * x
def release(a=1.0):
    d = 1.5; t = tt(d); return a * 0.25 * bp(noise(d), 200, 3000) * np.exp(-t * 3) * np.minimum(1, t / .05)
def jar(a=1.0): return a * lay(1.4, (clink(.35), 0), (clink(.2), .15))
def drip(a=1.0):
    t = tt(.4); f = 900 * np.exp(-t * 15) + 500; return a * .4 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 20)
def bus(a=1.0):
    d = 4.0; t = tt(d); f = 45 + 5 * np.sin(2 * np.pi * .5 * t)
    eng = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * .3 + lp(noise(d), 200) * .8
    horn = np.zeros(len(t)); hi = int(2.2 * SR); hd = int(.5 * SR)
    th = np.arange(hd) / SR; horn[hi:hi + hd] = (np.sin(2 * np.pi * 330 * th) + np.sin(2 * np.pi * 415 * th)) * .12 * np.minimum(1, th / .02) * np.minimum(1, (.5 - th) / .1)
    return a * (lp(eng, 400) * .25 * np.sin(np.pi * t / d) + bp(horn, 200, 3000) * .6)
def city(a=1.0):
    d = 2.5; t = tt(d); return a * lay(d, (lp(noise(d), 500) * .15 * np.sin(np.pi * t / d), 0), (bp(np.sin(2 * np.pi * 440 * tt(.3)), 200, 3000) * .05, .9))
def riser_down(a=1.0): return a * riser(1.6)[::-1] * .8
def piano_soft(a=1.0):
    out = np.zeros(int(6 * SR))
    for k, m in enumerate([65, 69, 72, 77]): p = piano(m, .25, 5); i = int(k * .45 * SR); place(out, p, i)
    return a * out
def end_note(a=1.0):
    out = np.zeros(int(9 * SR))
    for k, m in enumerate([38, 50, 57, 62, 65, 69]): p = piano(m, .3 if k < 2 else .22, 8); i = int(k * .22 * SR); place(out, p, i)
    return a * out

def whisper(a=1.0):
    d = 1.6; t = tt(d); m = 0.5 + 0.5 * np.sin(2 * np.pi * 5 * t) * np.sin(2 * np.pi * .9 * t)
    return a * 0.18 * bp(noise(d), 2500, 7000) * m * np.sin(np.pi * t / d)
def clink2(a=1.0): return a * clink(.3)
def pour(a=1.0):
    d = 2.4; t = tt(d); y = bp(noise(d), 600, 4000) * (0.6 + 0.4 * np.sin(2 * np.pi * 13 * t))
    gl = np.sin(2 * np.pi * np.cumsum(500 + 500 * t / d) / SR) * 0.15
    return a * 0.3 * (y + gl) * np.minimum(1, t / .2) * np.minimum(1, (d - t) / .4)
def buzzer(a=1.0):
    t = tt(.6); y = np.sign(np.sin(2 * np.pi * 110 * t)) * .5 + np.sign(np.sin(2 * np.pi * 116 * t)) * .5
    return a * .25 * lp(y, 1800) * np.minimum(1, t / .01) * np.minimum(1, (.6 - t) / .05)
def curtain(a=1.0):
    d = 1.6; t = tt(d); return a * .35 * lp(noise(d), 900) * np.sin(np.pi * t / d) * (0.7 + 0.3 * np.sin(2 * np.pi * 7 * t))
def applause(a=1.0):
    d = 2.8; out = np.zeros(int(d * SR))
    for k in range(160):
        c = hp(noise(.03), 800) * np.exp(-tt(.03) * 120) * (.3 + rng.random() * .5); place(out, c, int(rng.random() * (d - .05) * SR))
    return a * out * np.minimum(1, tt(d) / .3) * np.minimum(1, (d - tt(d)) / .8)
def knife(a=1.0):
    d = .35; t = tt(d); return a * (.35 * bp(noise(d), 2500, 9000) * np.exp(-t * 14) + .3 * thud(.5)[:len(t)] if len(thud(.5)) >= len(t) else 0)
def plate_(a=1.0): return a * lay(.8, (clink(.25), 0), (thud(.25), 0))
def lock(a=1.0): return a * lay(.5, (click(1500, .04, .6), 0), (click(2400, .03, .5), .09))
def sepia(a=1.0):
    d = 2.5; t = tt(d); crackle = (rng.random(len(t)) > .997) * rng.standard_normal(len(t))
    return a * (hp(crackle, 1500) * .4 + whoosh(d, 200, 2000) * .5)
def plate_crash(a=1.0):
    out = lay(1.4, (thud(.8), 0))
    for k in range(12): place(out, clink(.12 + rng.random() * .15)[:int(.6 * SR)], int((.02 + rng.random() * .3) * SR))
    return a * out
def choir(a=1.0):
    d = 3.0; t = tt(d); y = np.zeros(len(t))
    for m in (62, 65, 69, 74):
        for det in (-6, 0, 6): y += np.sin(2 * np.pi * midi(m) * 2 ** (det / 1200) * t + rng.random() * 6) * (1 + .2 * np.sin(2 * np.pi * 5 * t))
    return a * .05 * lp(y, 2500) * np.minimum(1, t / .6) * np.minimum(1, (d - t) / 1.2)
def slide_(a=1.0): return a * .4 * bp(noise(1.2), 300, 1500) * np.sin(np.pi * tt(1.2) / 1.2)
LIB = {'impact': impact, 'impact_soft': impact_soft, 'hit': hit, 'crack': crack, 'glitch': glitch, 'beep': beep, 'flatline': flatline,
       'pop': pop, 'type': type_, 'clock': lambda a: a * tick(.5), 'mosquito': mosquito, 'stamp': stamp, 'coins': coins, 'ding': ding,
       'shutter': lambda a: a * (np.pad(click(3000, .03, .6), (0, 0)) ), 'like': like, 'crowd': crowd, 'mic': mic, 'water': water,
       'erase': erase, 'creak': creak, 'cloth': cloth, 'pen': pen, 'paper': paper, 'block': block, 'snap': snap, 'match': match,
       'door': door, 'echo': echo, 'freeze': freeze_sfx, 'release': release, 'jar': jar, 'drip': drip, 'bus': bus, 'city': city,
       'riser_down': riser_down, 'piano_soft': piano_soft, 'end_note': end_note, 'tick': lambda a: a * tick(.5), 'thud': lambda a: thud(.7 * a),
       'whoosh': lambda a: a * whoosh(.8), 'swoosh': lambda a: a * whoosh(.55, 500, 6000), 'draw': lambda a: a * whoosh(1.0, 2000, 8000) * .5,
       'shimmer': lambda a: a * shimmer(2.5) * 2, 'heartbeat': lambda a: a * heartbeat(), 'riser': lambda a: a * riser(2.4),
       'sand': lambda a: a * sand(3.5) * 3, 'drone_in': lambda a: a * drone(6, 38) * 3, 'drone_dark': lambda a: a * drone(7, 37, True) * 3,
       'cut_silence': None, 'whisper': whisper, 'clink': clink2, 'pour': pour, 'leakwhoosh': lambda a: a * whoosh(1.0, 200, 3000), 'buzzer': buzzer, 'curtain': curtain, 'applause': applause, 'knife': lambda a: a * lay(.4, (.35 * bp(noise(.35), 2500, 9000) * np.exp(-tt(.35) * 14), 0), (thud(.4), .02)), 'plate': plate_, 'lock': lock, 'sepia': sepia, 'plate_crash': plate_crash, 'choir': choir, 'slide': slide_, 'silence_zone': None}
def shutter2(a=1.0):
    t = tt(.3); y = np.zeros(len(t)); c1 = click(3000, .03, .6); c2 = click(2200, .03, .5)
    y[:len(c1)] += c1; i = int(.09 * SR); place(y, c2, i); y += .35 * hp(noise(.3), 2000) * np.exp(-t * 30); return a * y
LIB['shutter'] = shutter2

FIVE_Z = [(c['t'], c['t'] + 5.0) for c in CU['cues'] if c['name'] == 'silence_zone']
sfx = buf()
for c in CU['cues']:
    if c['name'] != 'clock' and any(a <= c['t'] < b for a, b in FIVE_Z): continue
    f = LIB.get(c['name'])
    if f is None: continue
    add(sfx, f(c['gain']), c['t'], 0.55, c.get('pan', 0) + float(rng.uniform(-.2, .2)))

# ------------------------------------------------------------------ the score
# D minor: Dm - Bb - F - C (i - VI - III - VII); warm section F - Bb - C - Dm
PROG = [(38, [62, 65, 69, 74]), (34, [62, 65, 70, 74]), (41, [60, 65, 69, 72]), (36, [60, 64, 67, 72])]
WARM = [(41, [60, 65, 69, 72]), (34, [62, 65, 70, 74]), (36, [60, 64, 67, 72]), (38, [62, 65, 69, 74])]
BAR = 4.0
sec = lambda i: LT[i]['s']
# intensity map (time -> level 0..3), warm flag
import re as _re
def _st(x): return _re.sub(r'["“”—,।?!]', '', x)
def LS(prefix): return next(l['s'] for l in TL['lines'] if _st(l['text']).startswith(_st(prefix)))
END = TL['lines'][-1]['e'] + .6
ZONES = [(0, LS('পারবেন না') - .1, 2), (LS('আমাদের সবার ধারণা') - .3, LS('এইটা মায়ের স্বভাব') - .3, 'w'), (LS('এইটা মায়ের স্বভাব') - .3, LS('আমার মায়ের ক্ষেত্রেও') - .3, 2),
         (LS('আমার মায়ের ক্ষেত্রেও') - .3, LS('মুখোশটা খুলল') - .3, 'w'), (LS('মুখোশটা খুলল') - .3, LS('ডাইনিং টেবিলটা পাঁচ') - .3, 2), (LS('ওই পাঁচ সেকেন্ড') - .2, LS('সবচেয়ে ভয়ংকর ব্যাপার') - .3, 2),
         (LS('সবচেয়ে ভয়ংকর ব্যাপার') - .3, LS('ওই ঘটনার পর') - .3, 3), (LS('ওই ঘটনার পর') - .3, LS('আমি সেদিন বুঝছিলাম') - .3, 1), (LS('আমি সেদিন বুঝছিলাম') - .3, END, 'w')]
mus = buf(); pad = buf()
t = 0.0; bi = 0
while t < END:
    z = next((zz for zz in ZONES if zz[0] <= t + .01 < zz[1]), None)
    if z is None: t += BAR / 4; continue
    lvl = z[2]; warm = lvl == 'w'
    bass, tones = (WARM if warm else PROG)[bi % 4]
    end = min(t + BAR, z[1])
    if end - t < .5: t = z[1]; continue
    if lvl == 0:
        add(pad, pad_note(tones[0] - 12, end - t + 1.5, 2, 1.5), t)
    else:
        L_ = 1 if warm else lvl
        add(mus, piano(bass, .3 + .05 * L_, 5), t, pan=-.3)
        add(pad, pad_note(tones[0], end - t + 1.2, 1.2, 1.0) * (.6 + .25 * L_), t)
        add(pad, pad_note(tones[2], end - t + 1.2, 1.2, 1.0) * (.4 + .2 * L_), t)
        pat = [0, 2, 1, 3] if L_ == 1 else [0, 2, 1, 3, 2, 1, 3, 2]
        step = BAR / len(pat)
        for k, idx in enumerate(pat):
            tk = t + k * step + rng.normal(0, .006)
            if tk >= end: break
            v = (.16 if L_ == 1 else .2 if L_ == 2 else .24) * (1.15 if k == 0 else .9)
            add(mus, piano(tones[idx] + (12 if warm and k % 2 else 0), v, 3.5), tk, pan=(tones[idx] - 66) / 20)
        if L_ >= 3:  # pulse
            for k in range(8):
                tk = t + k * BAR / 8
                if tk < end: add(mus, thud(.12), tk)
    t = end; bi += 1
mus = mus + pad
# hard silences: freeze, and the beat before "আমি বলি নাই"
def silence(a, b, fo=.03, fi=.6):
    i, j = int(a * SR), int(b * SR); f = int(fo * SR)
    for arr in (mus, sfx):
        arr[i - f:i] *= np.linspace(1, 0, f)[:, None]; arr[i:j] = 0
    k = int(fi * SR); mus[j:j + k] *= np.linspace(0, 1, k)[:, None]
silence(FZ['a'], FZ['a'] + FZ['d'])
for c_ in [c for c in CU['cues'] if c['name'] == 'freeze']:
    add(sfx, freeze_sfx(.8), c_['t'] - .5)  # swell into the freeze
for c in CU['cues']:
    if c['name'] == 'cut_silence': silence(c['t'], c['t'] + .4, fo=.05, fi=.05)
for a_, b_ in FIVE_Z:
    i, j = int(a_ * SR), int(b_ * SR); f = int(.05 * SR); mus[i - f:i] *= np.linspace(1, 0, f)[:, None]; mus[i:j] = 0
# ------------------------------------------------------------------ voice + mix
vo, vsr = sf.read(ROOT / 'assets/voiceover.wav', dtype='float64')
if vo.ndim > 1: vo = vo.mean(1)
vo = resample_poly(vo, SR, vsr)
vo = hp(vo, 70)
vo = vo / (np.sqrt(np.mean(vo[np.abs(vo) > .01] ** 2)) + 1e-9) * 0.12
V = np.zeros(N); V[:len(vo)] = vo[:N]
# ducking envelope from VO
e = np.sqrt(np.maximum(0, lp(V ** 2, 6))); e = np.clip(e / (e.max() + 1e-9) * 6, 0, 1)
e = lp(e, 3)
duck = 1 - 0.55 * np.clip(e, 0, 1)
mus = reverb(mus, 3.2, .35) * 0.55 * duck[:, None]
sfx = reverb(sfx, 1.8, .2) * 0.85
R = lambda a: np.sqrt(np.mean(a ** 2)) + 1e-12
vr = R(V[V != 0]) if np.any(V) else R(V)
mus *= vr * 10 ** (-15 / 20) / R(mus[: int(225 * SR)])
sfx *= vr * 10 ** (-11 / 20) / R(sfx[: int(225 * SR)])
# keep any single SFX peak below the voice peak
pk = np.abs(V).max(); sp = np.abs(sfx).max()
lim = pk * 0.8; sfx = lim * np.tanh(sfx / lim)
mix = np.stack([V, V], 1) + mus + sfx
mix /= max(1e-9, np.abs(mix).max()) / 0.95
sf.write(ROOT / 'out/mix.wav', mix.astype(np.float32), SR)
sf.write(ROOT / 'out/music_sfx.wav', ((mus + sfx) / max(1e-9, np.abs(mus + sfx).max()) * .9).astype(np.float32), SR)
print('mix written', mix.shape[0] / SR, 's')
if __name__ == '__main__':
    bgm = mus + sfx
    r = lambda a: 20 * np.log10(np.sqrt(np.mean(a ** 2)) + 1e-12)
    for a, b in [(0, 9), (20, 40), (60, 70), (95, 120), (120, 131), (135, 147), (165, 172), (185, 200), (215, 225)]:
        i, j = a * SR, b * SR
        print(f'{a:4d}-{b:4d}  voice {r(V[i:j]):6.1f} dB   music+sfx {r(bgm[i:j]):6.1f} dB')
