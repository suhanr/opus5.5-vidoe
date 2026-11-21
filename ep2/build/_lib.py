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


