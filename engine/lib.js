// Shorts engine — shared drawing library + sequencer (deterministic by time)
'use strict';
const W = 1080, H = 1920;
const TL = window.TIMELINE;
const SCRIPT_SCENES = TL.scenes || [];
const L = {}; TL.lines.forEach(l => (L[l.id] = l));
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');

// ---------------------------------------------------------------- utilities
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const eo = t => 1 - Math.pow(1 - t, 3);
const eo5 = t => 1 - Math.pow(1 - t, 5);
const eio = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const eback = t => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
function rng(seed) { let s = seed % 2147483647; if (s <= 0) s += 2147483646; return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646; }
function wordT(id, prefix) {
  const w = L[id].words.find(w => w.w.toLowerCase().replace(/[,.]/g, '').startsWith(prefix.toLowerCase()));
  return w ? w.s : L[id].start;
}
function mkLayer() { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; }

const C = {
  cream: '#F7EDE1', amber: '#FFB65C', gold: '#FFD38A', coral: '#EE6F5C', rose: '#F2668B',
  teal: '#3FB7A9', sky: '#7C93FF', kid: '#FFC857', kid2: '#6FCF97', skin: '#F4C7A1',
  skin2: '#D99C77', hair: '#3B2A2E', gray: '#D9D3DC', pants: '#2C2F4E', ink: '#0B0D1A',
};

function rrect(g, x, y, w, h, r) {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}
function vgrad(g, y0, y1, stops) {
  const gr = g.createLinearGradient(0, y0, 0, y1);
  stops.forEach(([o, c]) => gr.addColorStop(o, c));
  return gr;
}
function glow(g, x, y, r, color, a = 1) {
  const gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, color); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.save(); g.globalAlpha *= a; g.globalCompositeOperation = 'lighter';
  g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); g.restore();
}
function heart(g, x, y, s, color) {
  g.save(); g.translate(x, y); g.scale(s, s); g.beginPath();
  g.moveTo(0, 0.35); g.bezierCurveTo(-0.9, -0.25, -0.45, -0.95, 0, -0.45);
  g.bezierCurveTo(0.45, -0.95, 0.9, -0.25, 0, 0.35); g.closePath();
  g.fillStyle = color; g.fill(); g.restore();
}
function shadow(g, x, y, w, a = 0.25) {
  g.save(); g.globalAlpha *= a; g.fillStyle = '#000'; g.beginPath(); g.ellipse(x, y, w, w * 0.16, 0, 0, Math.PI * 2); g.fill(); g.restore();
}

// ---------------------------------------------------------------- characters
// Feet at (x,y). s = scale (s=1 ≈ 420px tall). arms: angle from straight down, + = toward +x.
function person(g, o) {
  const s = o.s || 1, x = o.x, y = o.y;
  const body = o.body || C.coral, skin = o.skin || C.skin, hair = o.hair || C.hair;
  const walk = o.walk || 0;            // phase radians
  const swing = o.walking ? Math.sin(walk) * 0.35 : 0;
  const bob = o.walking ? Math.abs(Math.sin(walk)) * -8 * s : 0;
  g.save(); g.translate(x, y + bob);
  if (o.flip) g.scale(-1, 1);
  if (o.lean) g.rotate(o.lean);
  // legs
  g.lineCap = 'round'; g.strokeStyle = o.pants || C.pants; g.lineWidth = 34 * s;
  [[-20, swing], [20, -swing]].forEach(([dx, a]) => {
    g.beginPath(); g.moveTo(dx * s, -140 * s);
    g.lineTo(dx * s + Math.sin(a) * 140 * s, -140 * s + Math.cos(a) * 140 * s); g.stroke();
  });
  // torso
  g.fillStyle = body;
  g.beginPath();
  g.moveTo(-50 * s, -300 * s); g.quadraticCurveTo(0, -330 * s, 50 * s, -300 * s);
  g.lineTo(62 * s, -150 * s); g.quadraticCurveTo(0, -125 * s, -62 * s, -150 * s); g.closePath(); g.fill();
  if (o.dress) { g.beginPath(); g.moveTo(-58 * s, -190 * s); g.lineTo(58 * s, -190 * s); g.lineTo(80 * s, -95 * s); g.quadraticCurveTo(0, -80 * s, -80 * s, -95 * s); g.closePath(); g.fill(); }
  if (o.backpack) { g.fillStyle = o.backpack; rrect(g, -78 * s, -290 * s, 34 * s, 120 * s, 12 * s); g.fill(); }
  // head
  const hx = 0, hy = -372 * s, hr = 58 * s;
  g.save(); g.translate(hx, hy); g.rotate(o.headTilt || 0);
  g.fillStyle = skin; g.beginPath(); g.arc(0, 0, hr, 0, Math.PI * 2); g.fill();
  g.fillStyle = hair;
  const hs = o.hairStyle || 'short';
  if (hs === 'bun') {
    g.beginPath(); g.arc(0, -4 * s, hr * 1.03, Math.PI * 1.02, Math.PI * 1.98); g.quadraticCurveTo(hr * 0.6, -hr * 0.35, -hr * 1.0, -2 * s); g.fill();
    g.beginPath(); g.arc(-hr * 0.55, -hr * 0.95, hr * 0.42, 0, Math.PI * 2); g.fill();
  } else if (hs === 'long') {
    g.beginPath(); g.arc(0, -4 * s, hr * 1.06, Math.PI * 0.95, Math.PI * 2.05); g.lineTo(hr * 1.1, hr * 0.9); g.lineTo(hr * 0.75, hr * 0.9);
    g.quadraticCurveTo(hr * 0.75, -hr * 0.4, 0, -hr * 0.55); g.quadraticCurveTo(-hr * 0.75, -hr * 0.4, -hr * 0.75, hr * 0.9); g.lineTo(-hr * 1.1, hr * 0.9); g.closePath(); g.fill();
  } else if (hs === 'kid') {
    g.beginPath(); g.arc(0, -2 * s, hr * 1.04, Math.PI * 1.05, Math.PI * 1.95); g.quadraticCurveTo(0, -hr * 0.5, -hr * 1.0, -hr * 0.2); g.fill();
    g.beginPath(); g.ellipse(hr * 0.15, -hr * 1.02, hr * 0.18, hr * 0.32, 0.5, 0, Math.PI * 2); g.fill();
  } else {
    g.beginPath(); g.arc(0, -2 * s, hr * 1.04, Math.PI * 1.08, Math.PI * 1.92); g.quadraticCurveTo(hr * 0.2, -hr * 0.45, -hr * 1.0, -hr * 0.15); g.fill();
  }
  // face (gentle closed eyes + blush)
  if (!o.noFace) {
    g.strokeStyle = '#3a2626'; g.lineWidth = 5 * s; g.lineCap = 'round';
    const ey = 4 * s, ex = 20 * s;
    if (o.eyesOpen) { g.fillStyle = '#2b1f1f'; [-ex, ex].forEach(e => { g.beginPath(); g.arc(e, ey, 5.5 * s, 0, Math.PI * 2); g.fill(); }); }
    else [-ex, ex].forEach(e => { g.beginPath(); g.arc(e, ey - 3 * s, 9 * s, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke(); });
    g.globalAlpha *= 0.35; g.fillStyle = C.rose;
    [-ex - 8 * s, ex + 8 * s].forEach(e => { g.beginPath(); g.arc(e, ey + 18 * s, 9 * s, 0, Math.PI * 2); g.fill(); });
  }
  g.restore();
  g.restore();
  if (!o.deferArms) personArms(g, o);
}
function personArms(g, o) {
  const s = o.s || 1;
  const bob = o.walking ? Math.abs(Math.sin(o.walk || 0)) * -8 * s : 0;
  const swing = o.walking ? Math.sin(o.walk || 0) * 0.5 : 0;
  const aL = o.armL !== undefined ? o.armL : 0.18 - swing;
  const aR = o.armR !== undefined ? o.armR : -0.18 + swing;
  g.save(); g.translate(o.x, o.y + bob); if (o.flip) g.scale(-1, 1); if (o.lean) g.rotate(o.lean);
  g.lineCap = 'round';
  [[-48, aL], [48, aR]].forEach(([dx, a]) => {
    const sx = dx * s, sy = -290 * s, len = 150 * s;
    const ex = sx + Math.sin(a) * len, ey = sy + Math.cos(a) * len;
    g.strokeStyle = o.sleeve || o.body || C.coral; g.lineWidth = 28 * s;
    g.beginPath(); g.moveTo(sx, sy); g.lineTo(ex, ey); g.stroke();
    g.fillStyle = o.skin || C.skin; g.beginPath(); g.arc(ex, ey, 15 * s, 0, Math.PI * 2); g.fill();
  });
  g.restore();
}

// ---------------------------------------------------------------- text
function setFont(g, px, fam = 'Fraunces', weight = 600, italic = false) {
  g.font = `${italic ? 'italic ' : ''}${weight} ${px}px ${fam}`;
}
function layoutWords(g, words, maxW) {
  const rows = []; let row = [], w = 0; const sp = g.measureText(' ').width;
  words.forEach(word => {
    const ww = g.measureText(word.w).width;
    if (row.length && w + sp + ww > maxW) { rows.push({ items: row, w }); row = []; w = 0; }
    row.push({ ...word, ww }); w += (row.length > 1 ? sp : 0) + ww;
  });
  if (row.length) rows.push({ items: row, w });
  return { rows, sp };
}
// kinetic headline: each word pops in at its spoken time
function kinetic(g, t, id, o) {
  const words = o.words || L[id].words;
  setFont(g, o.size, o.fam || 'Fraunces', o.weight || 600, o.italic);
  const { rows, sp } = layoutWords(g, words, o.maxW || 900);
  const lh = o.size * (o.lh || 1.18);
  const y0 = o.y - (rows.length - 1) * lh / 2;
  g.textBaseline = 'middle'; g.textAlign = 'left';
  rows.forEach((r, ri) => {
    let x = o.x - r.w / 2;
    r.items.forEach(wd => {
      const p = eo(seg(t, wd.s - 0.05, wd.s + 0.35));
      const key = wd.w.toLowerCase().replace(/[,.]/g, '');
      const acc = o.accent && o.accent.includes(key);
      if (p > 0) {
        g.save(); g.globalAlpha *= p * (o.alpha === undefined ? 1 : o.alpha);
        const yy = y0 + ri * lh + (1 - p) * 34;
        if (acc) {
          setFont(g, o.size, o.fam || 'Fraunces', o.weight || 600, true);
          g.shadowColor = 'rgba(255,170,80,0.65)'; g.shadowBlur = 30;
        }
        g.fillStyle = acc ? (o.accentColor || C.amber) : (o.color || C.cream);
        g.translate(x + wd.ww / 2, yy); const sc = acc ? lerp(1.25, 1, eback(p)) : 1; g.scale(sc, sc);
        g.fillText(wd.w, -wd.ww / 2, 0);
        g.restore();
        setFont(g, o.size, o.fam || 'Fraunces', o.weight || 600, o.italic);
      }
      x += wd.ww + sp;
    });
  });
}

// word-by-word captions (lower third, above Shorts UI). Style is per episode.
const CAP_DEFAULT = { font: 'InterX', weight: 800, size: 66, y: 1400, maxW: 840, color: '#FFFFFF', active: '#FFB65C',
  stroke: 'rgba(8,8,20,0.9)', strokeW: 14, upper: false, box: null, gap: 8 };
function captions(g, t, ids, style) {
  const S = Object.assign({}, CAP_DEFAULT, style || {});
  const id = ids.find(i => L[i] && t >= L[i].start - 0.1 && t <= L[i].end + 0.3);
  if (!id) return;
  const ln = L[id];
  const out = 1 - seg(t, ln.end + 0.05, ln.end + 0.3);
  setFont(g, S.size, S.font, S.weight);
  const words = ln.words.map(w => ({ ...w, w: S.upper ? w.w.toUpperCase() : w.w }));
  const lay = layoutWords(g, words, S.maxW); const rows = lay.rows, sp = lay.sp + S.gap;
  rows.forEach(r => { r.w += (r.items.length - 1) * S.gap; });
  const lh = S.size * 1.27, y0 = S.y - (rows.length - 1) * lh / 2;
  g.textBaseline = 'middle';
  if (S.box) {
    const bw = Math.max(...rows.map(r => r.w)) + 60, bh = rows.length * lh + 30;
    g.save(); g.globalAlpha *= out * eo(seg(t, ln.start - 0.1, ln.start + 0.1)); g.fillStyle = S.box;
    rrect(g, 540 - bw / 2, S.y - bh / 2, bw, bh, 18); g.fill(); g.restore();
  }
  rows.forEach((r, ri) => {
    let x = 540 - r.w / 2;
    r.items.forEach(wd => {
      const p = eo(seg(t, wd.s - 0.06, wd.s + 0.16));
      const active = t >= wd.s - 0.06 && t < wd.e - 0.04;
      if (p > 0) {
        g.save(); g.globalAlpha *= p * out;
        g.translate(x + wd.ww / 2, y0 + ri * lh);
        const sc = lerp(0.75, 1, eo(p)); g.scale(sc, sc);
        if (S.strokeW) { g.lineJoin = 'round'; g.lineWidth = S.strokeW; g.strokeStyle = S.stroke; g.strokeText(wd.w, -wd.ww / 2, 0); }
        g.fillStyle = active ? S.active : S.color;
        g.fillText(wd.w, -wd.ww / 2, 0);
        g.restore();
      }
      x += wd.ww + sp;
    });
  });
}

// hand-drawn arrow + label (Caveat)
function scribble(g, t, t0, x, y, text, tx, ty, color = C.cream) {
  const p = seg(t, t0, t0 + 0.7);
  if (p <= 0) return;
  g.save(); g.strokeStyle = color; g.lineWidth = 5; g.lineCap = 'round';
  const cx = (x + tx) / 2 + 60, cy = Math.min(y, ty) - 60;
  const N = 40, k = Math.floor(N * eo(p));
  g.beginPath();
  for (let i = 0; i <= k; i++) {
    const u = i / N; const a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, c = u * u;
    const px = a * x + b * cx + c * tx, py = a * y + b * cy + c * ty;
    i ? g.lineTo(px, py) : g.moveTo(px, py);
  }
  g.stroke();
  if (p > 0.85) {
    const ang = Math.atan2(ty - cy, tx - cx);
    g.beginPath(); g.moveTo(tx, ty); g.lineTo(tx - 26 * Math.cos(ang - 0.5), ty - 26 * Math.sin(ang - 0.5));
    g.moveTo(tx, ty); g.lineTo(tx - 26 * Math.cos(ang + 0.5), ty - 26 * Math.sin(ang + 0.5)); g.stroke();
  }
  g.globalAlpha *= eo(seg(t, t0 + 0.2, t0 + 0.8));
  g.fillStyle = color; g.font = '700 72px Caveat'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(text, x, y + 40);
  g.restore();
}

function mix(a, b, t) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const r = Math.round(lerp(pa >> 16, pb >> 16, t)), gg = Math.round(lerp((pa >> 8) & 255, (pb >> 8) & 255, t)), bb = Math.round(lerp(pa & 255, pb & 255, t));
  return `rgb(${r},${gg},${bb})`;
}
// glitch helper: draw an image in horizontal slices with offsets + chroma fringe
function glitchDraw(g, img, amt, seed) {
  const R = rng(seed * 7919 + 13);
  let y = 0;
  while (y < H) {
    const h = 20 + R() * 160, dx = (R() - 0.5) * 2 * amt * (R() > 0.5 ? 1 : 0.2);
    g.drawImage(img, 0, y, W, h, dx, y, W, h); y += h;
  }
  if (amt > 2) {
    g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = Math.min(0.5, amt / 120);
    g.filter = 'sepia(1) hue-rotate(-50deg) saturate(6)'; g.drawImage(img, amt * 0.35, 0);
    g.filter = 'sepia(1) hue-rotate(140deg) saturate(6)'; g.drawImage(img, -amt * 0.35, 0);
    g.restore();
  }
}

// ---------------------------------------------------------------- engine: sequencing
// Episode scripts call defineEpisode({ draw: { <first line id>: fn(g, t) }, captionStyle, overlays, thumbnail, loopBlend })
const EP = { draw: {}, captionStyle: {}, overlays: {}, loopBlend: 0.7, thumbnail: null };
const BRAND = 'Suhanur Rahman';
let SCENES = [];
const TR = 0.45;
function defineEpisode(o) {
  Object.assign(EP, o);
  SCENES = SCRIPT_SCENES.filter(s => L[s.lines[0]]).map((s, i) => ({
    ...s, draw: EP.draw[s.lines[0]] || ((g) => { g.fillStyle = '#300'; g.fillRect(0, 0, W, H); }),
    start: i === 0 ? 0 : L[s.lines[0]].start - (s.lead !== undefined ? s.lead : 0.32),
  }));
}
const layerA = mkLayer(), layerB = mkLayer(), layerC = mkLayer();
const gA = layerA.getContext('2d'), gB = layerB.getContext('2d'), gC = layerC.getContext('2d');
function drawScene(layerG, s, t) {
  layerG.save(); layerG.setTransform(1, 0, 0, 1, 0, 0); layerG.globalAlpha = 1; layerG.filter = 'none';
  layerG.clearRect(0, 0, W, H); s.draw(layerG, t); layerG.restore();
}
const BOKEH = (() => { const R = rng(99); return Array.from({ length: 34 }, () => ({ x: R() * W, y: R() * H, r: 4 + R() * 16, v: 10 + R() * 30, ph: R() * 6 })); })();
function bokeh(g, t, a, color) {
  if (a <= 0) return;
  BOKEH.forEach(b => {
    const y = ((b.y - t * b.v) % H + H) % H, x = b.x + Math.sin(t * 0.5 + b.ph) * 20;
    glow(g, x, y, b.r * 3, color || 'rgba(255,215,160,0.5)', a * (0.4 + 0.3 * Math.sin(t + b.ph)));
  });
}
const GRAIN = Array.from({ length: 6 }, (_, k) => {
  const c = document.createElement('canvas'); c.width = 360; c.height = 640; const g = c.getContext('2d');
  const im = g.createImageData(360, 640); const R = rng(k * 31 + 7);
  for (let i = 0; i < im.data.length; i += 4) { const v = R() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
  g.putImageData(im, 0, 0); return c;
});
function vignette(g, a = 0.6) {
  const gr = g.createRadialGradient(540, 900, 500, 540, 960, 1250);
  gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, `rgba(0,0,0,${a})`);
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
}
function scanlines(g, a = 0.08) {
  g.save(); g.fillStyle = `rgba(0,0,0,${a})`; for (let y = 0; y < H; y += 6) g.fillRect(0, y, W, 2); g.restore();
}
// channel watermark — top-left (Shorts UI covers the right side and the bottom)
function watermark(g, style) {
  const S = Object.assign({ color: 'rgba(255,255,255,0.92)', bg: 'rgba(0,0,0,0.32)', accent: '#FFB65C' }, style || {});
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.filter = 'none'; g.globalCompositeOperation = 'source-over';
  setFont(g, 34, 'InterS', 600); g.textBaseline = 'middle'; g.textAlign = 'left';
  const tw = g.measureText(BRAND).width, x = 44, y = 118, h = 62, w = tw + 92;
  g.fillStyle = S.bg; rrect(g, x, y - h / 2, w, h, h / 2); g.fill();
  g.fillStyle = S.accent; g.beginPath(); g.arc(x + 33, y, 13, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#111'; g.beginPath(); g.moveTo(x + 29, y - 7); g.lineTo(x + 39, y); g.lineTo(x + 29, y + 7); g.closePath(); g.fill();
  g.fillStyle = S.color; g.fillText(BRAND, x + 60, y + 1);
  g.restore();
}
function composite(layer, alpha, mode, p, incoming, t) {
  ctx.save(); ctx.globalAlpha = alpha;
  if (mode === 'zoom') {
    const sc = incoming ? lerp(1.15, 1, p) : lerp(1, 1.06, p);
    ctx.translate(540, 960); ctx.scale(sc, sc); ctx.translate(-540, -960);
    if (incoming && p < 1) ctx.filter = `blur(${(1 - p) * 18}px)`;
  } else if (mode === 'slide') {
    ctx.translate(0, incoming ? (1 - p) * 420 : -p * 260);
  } else if (mode === 'iris' && incoming) {
    ctx.beginPath(); ctx.arc(540, 860, p * 1250, 0, Math.PI * 2); ctx.clip();
  }
  ctx.drawImage(layer, 0, 0);
  ctx.restore();
}
function drawAt(t) {
  let k = 0; SCENES.forEach((s, i) => { if (t >= s.start) k = i; });
  const cur = SCENES[k];
  const m = cur.trans || 'fade';
  const p = k > 0 && m !== 'cut' ? eio(seg(t, cur.start, cur.start + (m === 'glitch' ? 0.35 : TR))) : 1;
  if (p < 1) {
    const prev = SCENES[k - 1];
    drawScene(gA, prev, t); drawScene(gB, cur, t);
    if (m === 'iris') { composite(layerA, 1, 'none', p, false); composite(layerB, 1, 'iris', p, true); }
    else if (m === 'glitch') {
      const amt = Math.sin(p * Math.PI) * 110;
      ctx.save(); glitchDraw(ctx, p < 0.5 ? layerA : layerB, amt, Math.floor(t * 30)); ctx.restore();
      ctx.fillStyle = `rgba(255,255,255,${Math.sin(p * Math.PI) * 0.12})`; ctx.fillRect(0, 0, W, H);
    }
    else {
      composite(layerA, 1 - (m === 'slide' ? p * 0.6 : p), m, p, false);
      composite(layerB, m === 'slide' ? Math.min(1, p * 2) : p, m, p, true);
    }
    if (m === 'flash') { ctx.fillStyle = `rgba(255,240,225,${Math.sin(p * Math.PI) * 0.75})`; ctx.fillRect(0, 0, W, H); }
  } else {
    drawScene(gB, cur, t); ctx.drawImage(layerB, 0, 0);
  }
  const capIds = []; SCENES.forEach(s => { if (s.cap) capIds.push(...s.lines); });
  captions(ctx, t, capIds, EP.captionStyle);
}
window.renderFrame = function (t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const O = Object.assign({ bokeh: 0.55, bokehColor: null, grain: 0.07, vignette: 0.6, scanlines: 0 }, EP.overlays);
  drawAt(t);
  const ba = typeof O.bokeh === 'function' ? O.bokeh(t) : O.bokeh;
  bokeh(ctx, t, ba, O.bokehColor);
  if (O.scanlines) scanlines(ctx, O.scanlines);
  if (O.vignette) vignette(ctx, O.vignette);
  // seamless loop: the last moments cross-fade into the exact opening frame
  const lb = EP.loopBlend;
  if (lb > 0 && t > TL.duration - lb) {
    const q = eio(seg(t, TL.duration - lb, TL.duration));
    drawScene(gC, SCENES[0], 0);
    ctx.save(); ctx.globalAlpha = q; ctx.drawImage(layerC, 0, 0);
    bokeh(ctx, t, (typeof O.bokeh === 'function' ? O.bokeh(0) : O.bokeh) * q, O.bokehColor);
    if (O.scanlines) scanlines(ctx, O.scanlines);
    if (O.vignette) vignette(ctx, O.vignette);
    ctx.restore();
  }
  ctx.save(); ctx.globalAlpha = O.grain; ctx.globalCompositeOperation = 'overlay';
  ctx.drawImage(GRAIN[Math.floor((t % TL.duration) * 30 + 1e-6) % GRAIN.length], 0, 0, W, H); ctx.restore();
  watermark(ctx, EP.watermark);
};
window.renderThumbnail = function () {
  if (!EP.thumbnail) return window.renderFrame(0);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none';
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  EP.thumbnail(ctx);
  watermark(ctx, EP.watermark);
};
window.seek = t => window.renderFrame(((t % TL.duration) + TL.duration) % TL.duration);
const FONT_FACES = ['600 40px Fraunces', 'italic 600 40px Fraunces', '700 40px Caveat', '800 40px InterX', '600 40px InterS',
  '400 40px Anton', '400 40px Bebas', '500 40px Mono', '700 40px Mono', '600 40px Playfair', 'italic 600 40px Playfair'];
window.addEventListener('load', () => {
  Promise.all(FONT_FACES.map(f => document.fonts.load(f))).then(() => document.fonts.ready).then(() => { window.READY = true; });
});
