"""Align script words to the voiceover using per-chunk whisper transcripts -> web/timeline.js"""
import json, re
from rapidfuzz import fuzz
raw = open('build/script.txt').read().strip()
raw = raw.replace('—', ' — ')
toks = raw.split()
# sentences
sents, cur = [], []
for tk in toks:
    if tk == '—':
        cur.append(tk); continue
    cur.append(tk)
    if re.search(r'[।?!]["”]?$', tk):
        sents.append(cur); cur = []
if cur: sents.append(cur)
words = []  # (sentence index, display word)
for si, s in enumerate(sents):
    for w in s:
        if w == '—': continue
        words.append([si, w])
MAP = str.maketrans({'শ':'স','ষ':'স','ভ':'ব','ধ':'দ','ঠ':'ট','থ':'ত','ঢ':'ড','ঘ':'গ','খ':'ক','ছ':'চ','ঝ':'জ','ফ':'প','ণ':'ন','য':'জ','ী':'ি','ূ':'ু','ঁ':None,'্':None,'়':None,'ৎ':'ত','ঃ':None})
def norm(x):
    x = re.sub(r'[^ঀ-৿]', '', x)
    return x.translate(MAP)
wn = [norm(w) for _, w in words]
ch = json.load(open('out/chunks.json'))
for c in ch:
    if 'Баба' in c['t']: c['t'] = 'বাবা মাও মানুষ'  # whisper answered in Cyrillic here
    if c['t'].startswith('করো করো'): c['t'] = 'করে'
cn = [norm(c['t']) for c in ch]
NW, NC = len(words), len(ch)
cum = [0]
for x in wn: cum.append(cum[-1] + len(x))
NEG = -1e18
best = [[NEG] * (NW + 1) for _ in range(NC + 1)]
back = [[0] * (NW + 1) for _ in range(NC + 1)]
best[0][0] = 0
for k in range(NC):
    L = max(1, len(cn[k])); dur = ch[k]['e'] - ch[k]['s']
    for w in range(NW + 1):
        if best[k][w] == NEG: continue
        for n in range(0, 30):
            if w + n > NW: break
            sl = cum[w + n] - cum[w]
            if n and (sl > 2.6 * L + 6): break
            if n == 0:
                sc = -L * 1.0  # skipping a chunk is costly
            else:
                if sl < 0.35 * L - 4: continue
                sc = fuzz.ratio(cn[k], ''.join(wn[w:w + n])) / 100 * L - abs(sl - L) * 0.15
            v = best[k][w] + sc
            if v > best[k + 1][w + n]:
                best[k + 1][w + n] = v; back[k + 1][w + n] = n
# backtrack
assign = []; w = NW
for k in range(NC, 0, -1):
    n = back[k][w]; assign.append((k - 1, w - n, w)); w -= n
assign.reverse()
assert w == 0, w
wt = [None] * NW
for k, a, b in assign:
    if a == b: continue
    s, e = ch[k]['s'] + 0.02, ch[k]['e']
    tot = sum(max(2, len(wn[i])) + 1.5 for i in range(a, b)); acc = 0
    for i in range(a, b):
        d = (max(2, len(wn[i])) + 1.5) / tot * (e - s)
        wt[i] = [round(s + acc, 3), round(s + acc + d, 3)]; acc += d
    print(f"{ch[k]['s']:7.2f} {fuzz.ratio(cn[k], ''.join(wn[a:b])):5.1f} | {' '.join(words[i][1] for i in range(a,b))}  <= {ch[k]['t']}")
lines = []
for si, s in enumerate(sents):
    ws = [{'w': words[i][1], 's': wt[i][0], 'e': wt[i][1]} for i in range(NW) if words[i][0] == si]
    lines.append({'i': si, 'text': ' '.join(s).replace(' — ', '—'), 's': ws[0]['s'], 'e': ws[-1]['e'], 'words': ws})
import soundfile as sf
info = sf.info('assets/voiceover.wav')
tl = {'vo': round(info.duration, 3), 'dur': round(info.duration + 4.0, 3), 'fps': 30, 'lines': lines}
open('web/timeline.js', 'w').write('window.TL=' + json.dumps(tl, ensure_ascii=False) + ';\n')
json.dump(tl, open('out/timeline.json', 'w'), ensure_ascii=False)
for l in lines: print(f"{l['i']:3d} {l['s']:7.2f}-{l['e']:7.2f} {l['text'][:60]}")
