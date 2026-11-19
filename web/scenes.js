// "The Last Time" — motion graphics renderer (Canvas 2D, deterministic by time)
'use strict';
const W = 1080, H = 1920;
const TL = window.TIMELINE;
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

// word-by-word captions (lower third, above Shorts UI)
function captions(g, t, ids) {
  const id = ids.find(i => t >= L[i].start - 0.1 && t <= L[i].end + 0.3);
  if (!id) return;
  const ln = L[id];
  const out = 1 - seg(t, ln.end + 0.05, ln.end + 0.3);
  setFont(g, 66, 'InterX', 800);
  const lay = layoutWords(g, ln.words, 840); const rows = lay.rows, sp = lay.sp + 8;
  rows.forEach(r => { r.w += (r.items.length - 1) * 8; });
  const lh = 84, y0 = 1400 - (rows.length - 1) * lh / 2;
  g.textBaseline = 'middle';
  rows.forEach((r, ri) => {
    let x = 540 - r.w / 2;
    r.items.forEach(wd => {
      const p = eo(seg(t, wd.s - 0.06, wd.s + 0.16));
      const active = t >= wd.s - 0.06 && t < wd.e - 0.04;
      if (p > 0) {
        g.save(); g.globalAlpha *= p * out;
        g.translate(x + wd.ww / 2, y0 + ri * lh);
        const sc = lerp(0.75, 1, eo(p)); g.scale(sc, sc);
        g.lineJoin = 'round'; g.lineWidth = 14; g.strokeStyle = 'rgba(8,8,20,0.9)';
        g.strokeText(wd.w, -wd.ww / 2, 0);
        g.fillStyle = active ? C.amber : '#FFFFFF';
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

// ---------------------------------------------------------------- scenes
function sHook(g, t) {
  g.fillStyle = C.ink; g.fillRect(0, 0, W, H);
  const beats = [0.0, 1.05, 2.1];
  let pulse = 0;
  beats.forEach(b => { const d = t - b; if (d >= 0) pulse += Math.exp(-d * 7) + 0.6 * Math.exp(-Math.max(0, d - 0.26) * 7) * (d > 0.26); });
  const r = 18 + pulse * 10;
  glow(g, 540, 700, 260 + pulse * 90, 'rgba(255,170,90,0.55)', 0.6 + pulse * 0.3);
  g.fillStyle = C.gold; g.beginPath(); g.arc(540, 700, r, 0, Math.PI * 2); g.fill();
  // heartbeat line
  const lp = seg(t, 0, 2.4);
  g.save(); g.strokeStyle = 'rgba(255,182,92,0.5)'; g.lineWidth = 4; g.beginPath();
  for (let x = 120; x <= 120 + 840 * lp; x += 4) {
    const u = (x - 120) / 840; const k = (u * 3) % 1;
    const yy = 700 + (k > 0.42 && k < 0.58 ? Math.sin((k - 0.42) / 0.16 * Math.PI * 2) * -70 * Math.sin((k - 0.42) / 0.16 * Math.PI) : 0);
    x === 120 ? g.moveTo(x, yy) : g.lineTo(x, yy);
  }
  g.globalAlpha = 1 - seg(t, 1.8, 2.6); g.stroke(); g.restore();
  const words = [{ w: 'Nobody', s: 0.08 }, { w: 'tells', s: 0.35 }, { w: 'you', s: 0.6 }, { w: 'this.', s: 0.85 }];
  kinetic(g, t, 'hook', { words, x: 540, y: 1000, size: 112, maxW: 900, accent: ['this'] });
}

function room(g, warmth = 1) {
  g.fillStyle = vgrad(g, 0, H, [[0, '#2A2045'], [0.55, '#5A3550'], [1, '#2A1C30']]); g.fillRect(-300, -300, W + 600, H + 600);
  // window
  g.save(); g.globalAlpha = 0.9;
  g.fillStyle = vgrad(g, 360, 820, [[0, '#FFB36B'], [1, '#FF7E6B']]); rrect(g, 640, 360, 300, 440, 18); g.fill();
  glow(g, 790, 580, 520, 'rgba(255,150,90,0.35)', warmth);
  g.strokeStyle = '#3B2840'; g.lineWidth = 14; rrect(g, 640, 360, 300, 440, 18); g.stroke();
  g.beginPath(); g.moveTo(790, 360); g.lineTo(790, 800); g.moveTo(640, 580); g.lineTo(940, 580); g.stroke();
  g.restore();
  // floor + light patch
  g.fillStyle = '#25182B'; g.fillRect(-300, 1150, W + 600, H);
  g.save(); g.globalAlpha = 0.18 * warmth; g.fillStyle = '#FFB36B';
  g.beginPath(); g.moveTo(640, 1150); g.lineTo(940, 1150); g.lineTo(760, 1500); g.lineTo(380, 1500); g.closePath(); g.fill(); g.restore();
}

function sCarry(g, t) {
  const a = L.carry1, b = L.carry2, c = L.carry3;
  const zoom = lerp(1.08, 1, eo(seg(t, a.start - 0.4, a.start + 1.2))) * lerp(1, 0.9, eio(seg(t, c.start, c.end + 0.5)));
  g.save(); g.translate(540, 1000); g.scale(zoom, zoom); g.translate(-540, -1000);
  room(g);
  const mx = 470, my = 1160, ms = 1.22;
  const floor = { x: mx + 230, y: my + 10 };
  const held = { x: mx + 70, y: my - 250 };
  const up = eio(seg(t, a.start + 0.2, a.start + 1.1));
  const down = eio(seg(t, b.start + 0.0, b.start + 0.75));
  const k = up * (1 - down);
  const dropPos = { x: mx + 250, y: my + 10 };
  const from = down > 0 ? dropPos : floor;
  let kx = lerp(from.x, held.x, k), ky = lerp(from.y, held.y, k) - Math.sin(Math.PI * (down > 0 ? down : up)) * 60;
  const sway = Math.sin(t * 2.2) * 0.04 * k;
  shadow(g, mx, my, 120, 0.3);
  shadow(g, kx, from.y, 60, 0.3 * (1 - k));
  const arms = lerp(0.12, 1.32, k), armsR = lerp(-0.12, -0.55, k);
  const mom = { x: mx, y: my, s: ms, body: C.coral, hairStyle: 'bun', dress: true, deferArms: true, armL: arms, armR: armsR, lean: sway, headTilt: 0.12 * k + 0.05 };
  person(g, mom);
  person(g, { x: kx, y: ky, s: 0.5, body: C.kid, hairStyle: 'kid', lean: -0.15 * k + sway, eyesOpen: k < 0.5, pants: '#3D6AA8' });
  personArms(g, mom);
  // the moment freezes on the last line
  const fz = seg(t, c.start + 0.1, c.start + 0.9);
  if (fz > 0) {
    g.save(); g.globalCompositeOperation = 'saturation'; g.globalAlpha = 0.85 * fz; g.fillStyle = '#808080'; g.fillRect(-300, -300, W + 600, H + 600); g.restore();
    g.save(); g.globalAlpha = 0.25 * fz; g.fillStyle = '#000'; g.fillRect(-300, -300, W + 600, H + 600); g.restore();
  }
  g.restore();
  scribble(g, t, c.start + 0.35, 250, 470, 'the last time.', dropPos.x * 0.9 + 54, 870, C.gold);
}

let polaroidCache = null;
function polaroidImage() {
  if (polaroidCache) return polaroidCache;
  const c = mkLayer(), g = c.getContext('2d');
  sCarryStill(g);
  polaroidCache = c; return c;
}
function sCarryStill(g) {
  room(g);
  const mx = 470, my = 1160, ms = 1.22;
  const mom = { x: mx, y: my, s: ms, body: C.coral, hairStyle: 'bun', dress: true, deferArms: true, armL: 1.32, armR: -0.55, headTilt: 0.17 };
  shadow(g, mx, my, 120, 0.3);
  person(g, mom);
  person(g, { x: mx + 70, y: my - 250, s: 0.5, body: C.kid, hairStyle: 'kid', lean: -0.15, pants: '#3D6AA8' });
  personArms(g, mom);
}

function sKnew(g, t) {
  const l = L.knew;
  g.fillStyle = vgrad(g, 0, H, [[0, '#120F22'], [1, '#2A1A2E']]); g.fillRect(0, 0, W, H);
  glow(g, 540, 700, 700, 'rgba(255,160,100,0.18)');
  const p = eo5(seg(t, l.start - 0.3, l.start + 0.6));
  const rot = lerp(-0.5, -0.06, eback(seg(t, l.start - 0.3, l.start + 0.75))) + Math.sin(t * 0.8) * 0.01;
  const y = lerp(-500, 700, p);
  const sc = lerp(1, 0.96, seg(t, l.start + 0.6, l.end + 1));
  g.save(); g.translate(540, y); g.rotate(rot); g.scale(sc, sc);
  g.shadowColor = 'rgba(0,0,0,0.55)'; g.shadowBlur = 50; g.shadowOffsetY = 20;
  g.fillStyle = '#F4EEE6'; g.fillRect(-310, -380, 620, 740); g.shadowColor = 'transparent';
  g.save(); g.beginPath(); g.rect(-270, -340, 540, 560); g.clip();
  g.filter = 'sepia(0.85) contrast(1.05) brightness(0.95)';
  g.drawImage(polaroidImage(), 140, 380, 800, 830, -270, -340, 540, 560);
  g.filter = 'none';
  // developing / fading memory
  g.globalAlpha = 0.15 + 0.1 * Math.sin(t * 3); g.fillStyle = '#FFF4DD'; g.fillRect(-270, -340, 540, 560);
  g.restore();
  g.fillStyle = '#5A4A48'; g.font = '700 60px Caveat'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('you & mom', 0, 290);
  g.restore();
  kinetic(g, t, 'knew', { x: 540, y: 1320, size: 84, maxW: 880, accent: ['last', 'time'] });
}

function sPlay(g, t) {
  const l = L.play; const tl = wordT('play', 'streetlights');
  const dark = eio(seg(t, l.start, tl + 0.4));
  const lamp = t >= tl ? 1 : 0;
  // sky
  const top = dark < 0.5 ? '#F28C6B' : '#1C2350';
  g.fillStyle = vgrad(g, 0, 1300, [[0, mix('#FF9F68', '#141A42', dark)], [0.6, mix('#FFC48A', '#3A2F66', dark)], [1, mix('#FFD9A0', '#6A4A7A', dark)]]);
  g.fillRect(0, 0, W, H);
  // sun sinking
  const sy = lerp(820, 1220, dark);
  glow(g, 300, sy, 420, 'rgba(255,200,120,0.6)', 1 - dark * 0.8);
  g.fillStyle = mix('#FFE3A3', '#FF8A6B', dark); g.beginPath(); g.arc(300, sy, 110, 0, Math.PI * 2); g.fill();
  // stars appear
  const R = rng(11);
  for (let i = 0; i < 50; i++) { const x = R() * W, y = R() * 700, tw = 0.5 + 0.5 * Math.sin(t * 3 + i); g.globalAlpha = dark * tw * 0.8; g.fillStyle = '#fff'; g.fillRect(x, y, 3, 3); }
  g.globalAlpha = 1;
  // houses
  const hR = rng(5);
  for (let i = 0; i < 6; i++) {
    const hw = 160 + hR() * 80, hh = 180 + hR() * 140, hx = i * 190 - 40;
    g.fillStyle = mix('#7A4A6A', '#1B1838', dark);
    g.fillRect(hx, 1180 - hh, hw, hh);
    g.beginPath(); g.moveTo(hx - 10, 1180 - hh); g.lineTo(hx + hw / 2, 1180 - hh - 70); g.lineTo(hx + hw + 10, 1180 - hh); g.fill();
    // windows light up after lamp
    const wOn = seg(t, tl + 0.2 + i * 0.12, tl + 0.5 + i * 0.12);
    g.fillStyle = `rgba(255,200,110,${0.15 + 0.8 * wOn})`;
    g.fillRect(hx + 30, 1180 - hh + 50, 36, 44); g.fillRect(hx + hw - 66, 1180 - hh + 50, 36, 44);
  }
  // ground
  g.fillStyle = mix('#5B3A55', '#14122A', dark); g.fillRect(0, 1180, W, H - 1180);
  // lamp post
  const lx = 860;
  g.fillStyle = '#0F0E1E'; g.fillRect(lx - 10, 640, 20, 560); g.fillRect(lx - 70, 630, 90, 18);
  rrect(g, lx - 110, 630, 70, 40, 10); g.fill();
  if (lamp) {
    const fl = t - tl < 0.25 ? (Math.sin((t - tl) * 90) > 0 ? 1 : 0.2) : 1;
    g.save(); g.globalAlpha = 0.35 * fl; g.fillStyle = vgrad(g, 670, 1200, [[0, 'rgba(255,220,140,0.9)'], [1, 'rgba(255,220,140,0)']]);
    g.beginPath(); g.moveTo(lx - 95, 670); g.lineTo(lx - 55, 670); g.lineTo(lx + 120, 1250); g.lineTo(lx - 290, 1250); g.closePath(); g.fill(); g.restore();
    glow(g, lx - 75, 672, 260, 'rgba(255,214,140,0.9)', fl);
    g.fillStyle = '#FFE7B0'; g.beginPath(); g.ellipse(lx - 75, 672, 30, 9, 0, 0, Math.PI * 2); g.fill();
  }
  // kids playing catch
  const kA = { x: 250, y: 1230 }, kB = { x: 640, y: 1230 };
  const cyc = 0.96; const ph = ((t - l.start) / cyc);
  const hop = i => Math.abs(Math.sin((t - l.start) * 5 + i)) * -14;
  person(g, { x: kA.x, y: kA.y + hop(0), s: 0.42, body: C.kid, hairStyle: 'kid', armL: 0.4, armR: -2.4 + Math.sin(t * 6) * 0.3, eyesOpen: true, pants: '#3D6AA8' });
  person(g, { x: kB.x, y: kB.y + hop(1), s: 0.42, body: C.kid2, hairStyle: 'short', flip: true, armL: 0.4, armR: -2.4 + Math.cos(t * 6) * 0.3, eyesOpen: true });
  // ball
  const seg_i = Math.floor(ph), u = ph - seg_i; const dir = seg_i % 2 === 0;
  const bx = dir ? lerp(kA.x + 60, kB.x - 60, u) : lerp(kB.x - 60, kA.x + 60, u);
  const by = 1080 - Math.sin(u * Math.PI) * 260;
  g.fillStyle = C.rose; g.beginPath(); g.arc(bx, by, 22, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#fff'; g.lineWidth = 4; g.beginPath(); g.arc(bx, by, 22, t * 4, t * 4 + 2); g.stroke();
}
function mix(a, b, t) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const r = Math.round(lerp(pa >> 16, pb >> 16, t)), gg = Math.round(lerp((pa >> 8) & 255, (pb >> 8) & 255, t)), bb = Math.round(lerp(pa & 255, pb & 255, t));
  return `rgb(${r},${gg},${bb})`;
}

function sStory(g, t) {
  const l = L.story, u = t - l.start;
  const off = eio(seg(u, 1.45, 1.9));
  g.fillStyle = vgrad(g, 0, H, [[0, '#101634'], [1, '#22183A']]); g.fillRect(0, 0, W, H);
  // window with moon
  g.fillStyle = '#1B2350'; rrect(g, 120, 260, 340, 420, 20); g.fill();
  glow(g, 300, 400, 260, 'rgba(200,210,255,0.5)');
  g.fillStyle = '#F5F0DA'; g.beginPath(); g.arc(300, 400, 70, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#1B2350'; g.beginPath(); g.arc(330, 380, 62, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#0B0F28'; g.lineWidth = 12; rrect(g, 120, 260, 340, 420, 20); g.stroke();
  const R = rng(3);
  for (let i = 0; i < 25; i++) { const x = 500 + R() * 560, y = 120 + R() * 600; g.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(t * 2 + i * 1.7)); g.fillStyle = C.gold; g.beginPath(); g.arc(x, y, 3 + R() * 3, 0, Math.PI * 2); g.fill(); }
  g.globalAlpha = 1;
  // bedside lamp glow
  glow(g, 880, 980, 520, 'rgba(255,180,100,0.55)', 1 - off * 0.9);
  // book
  const close = eio(seg(u, 0.75, 1.35));
  const bx = 540, by = 1010, pw = 300, ph = 400;
  g.save(); g.translate(bx, by);
  g.rotate(-0.05);
  g.fillStyle = '#7A3B4F'; rrect(g, -pw - 16, -ph / 2 - 14, (pw + 16) * 2, ph + 28, 14); g.fill();
  // left page
  const pageL = (sx, flip) => {
    g.save(); g.scale(sx, 1);
    g.fillStyle = '#F8F0E0'; rrect(g, flip ? -pw : 0, -ph / 2, pw, ph, 8); g.fill();
    g.fillStyle = 'rgba(120,100,90,0.35)';
    for (let i = 0; i < 9; i++) g.fillRect((flip ? -pw : 0) + 34, -ph / 2 + 50 + i * 36, pw - 68 - (i % 3) * 30, 9);
    g.restore();
  };
  pageL(1, true);
  // right page folds over the spine
  const sx = Math.cos(close * Math.PI);
  if (sx > -0.999) { g.save(); if (sx < 0) g.filter = 'brightness(0.85)'; pageL(sx, false); g.restore(); }
  if (close > 0.5) { g.fillStyle = '#7A3B4F'; rrect(g, -pw - 16, -ph / 2 - 14, pw + 16, ph + 28, 14); g.fill(); g.fillStyle = C.gold; g.font = 'italic 600 40px Fraunces'; g.textAlign = 'center'; g.fillText('The End', -pw / 2, 0); }
  g.restore();
  // darken when lamp goes off
  g.fillStyle = `rgba(5,6,18,${off * 0.55})`; g.fillRect(0, 0, W, H);
}

function sFriend(g, t) {
  const l = L.friend, u = t - l.start;
  const tSee = wordT('friend', 'see');
  g.fillStyle = vgrad(g, 0, H, [[0, '#F7A072'], [0.5, '#E9787A'], [1, '#4A2F55']]); g.fillRect(0, 0, W, H);
  glow(g, 540, 900, 700, 'rgba(255,220,160,0.5)');
  // trees silhouettes
  g.fillStyle = 'rgba(80,40,70,0.55)';
  [[100, 1000, 140], [960, 980, 170], [800, 1040, 110]].forEach(([x, y, r]) => { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); g.fillRect(x - 12, y, 24, 220); });
  g.fillStyle = '#4A2F55'; g.fillRect(0, 1220, W, H);
  g.fillStyle = 'rgba(255,255,255,0.08)'; for (let i = 0; i < 8; i++) g.fillRect(i * 150 + 20, 1260, 90, 10);
  const walk = eio(seg(t, l.end - 0.2, l.end + 1.6));
  const sA = lerp(0.5, 0.36, walk), sB = sA;
  const ax = lerp(430, 120, walk), bx = lerp(650, 960, walk);
  const walking = walk > 0 && walk < 1;
  const wave = t > tSee - 0.3 && walk === 0 ? Math.sin(t * 9) * 0.35 : 0;
  shadow(g, ax, 1240, 60, 0.25); shadow(g, bx, 1240, 60, 0.25);
  person(g, { x: ax, y: 1240, s: sA, body: C.teal, hairStyle: 'kid', backpack: '#F2C14E', flip: walk > 0.02, walking, walk: t * 9, armR: walk > 0 ? undefined : -2.6 + wave, eyesOpen: true });
  person(g, { x: bx, y: 1240, s: sB, body: C.kid, hairStyle: 'long', backpack: '#E9667A', flip: walk <= 0.02, walking, walk: t * 9 + 1, armR: walk > 0 ? undefined : -2.6 - wave, eyesOpen: true, pants: '#3D6AA8' });
  // speech bubble
  const bp = eback(seg(t, tSee - 0.1, tSee + 0.3)) * (1 - seg(t, l.end + 0.4, l.end + 0.8));
  if (bp > 0) {
    g.save(); g.translate(400, 840); g.scale(bp, bp);
    g.fillStyle = '#FFF8EE'; rrect(g, -250, -85, 500, 150, 60); g.fill();
    g.beginPath(); g.moveTo(-30, 60); g.lineTo(20, 60); g.lineTo(-10, 120); g.fill();
    g.fillStyle = '#3B2A3E'; g.font = '700 70px Caveat'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('See you tomorrow!', 0, -10);
    g.restore();
  }
}

function sAnnounce(g, t) {
  const l = L.announce, u = t - l.start + 0.3;
  g.fillStyle = vgrad(g, 0, H, [[0, '#0F1124'], [1, '#1E1636']]); g.fillRect(0, 0, W, H);
  // calendar with flying pages
  const cx = 540, cy = 640;
  const speed = 2 + u * u * 3; const flips = Math.floor(u * speed);
  g.save(); g.translate(cx, cy);
  g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowBlur = 40;
  g.fillStyle = '#F6EFE6'; rrect(g, -220, -240, 440, 480, 30); g.fill(); g.shadowColor = 'transparent';
  g.fillStyle = C.coral; rrect(g, -220, -240, 440, 120, 30); g.fill(); g.fillRect(-220, -160, 440, 40);
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const n = flips;
  g.fillStyle = '#fff'; g.font = '800 56px InterX'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(months[Math.floor(n / 3) % 12] + '  ' + (2008 + Math.floor(n / 9)), 0, -178);
  g.fillStyle = '#2B2238'; g.font = '700 230px Fraunces'; g.fillText(String((n * 7) % 28 + 1), 0, 50);
  g.restore();
  // flying pages
  for (let k = 0; k < 6; k++) {
    const fk = flips - k; if (fk < 0) continue;
    const ft = (u * speed - fk) / speed; // seconds since flip
    if (ft > 0.9) continue;
    const R = rng(fk + 3);
    g.save(); g.globalAlpha = 1 - ft / 0.9;
    g.translate(cx + ft * (300 + R() * 500) * (R() > 0.5 ? 1 : -1), cy - 40 - ft * 700 + ft * ft * 400);
    g.rotate(ft * (R() * 6 - 3));
    g.fillStyle = '#EDE3D6'; rrect(g, -200, -170, 400, 340, 16); g.fill();
    g.fillStyle = '#C9BBAE'; g.font = '700 150px Fraunces'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String((fk * 7) % 28 + 1), 0, 10);
    g.restore();
  }
  kinetic(g, t, 'announce', { x: 540, y: 1250, size: 96, maxW: 900, accent: ['last', 'times'] });
}

function sNow(g, t) {
  const l = L.now, u = t - l.start + 0.3, d = L.call.start - l.start + 0.6;
  g.fillStyle = vgrad(g, 0, H, [[0, '#14112A'], [1, '#2E1B36']]); g.fillRect(0, 0, W, H);
  const cx = 540, cy = 760, k = seg(u, 0, d);
  glow(g, cx, cy, 600, 'rgba(255,170,90,0.25)');
  // ring of ticks rotating slowly
  g.save(); g.translate(cx, cy); g.rotate(u * 0.15);
  for (let i = 0; i < 60; i++) { g.rotate(Math.PI / 30); g.fillStyle = i % 5 ? 'rgba(255,255,255,0.15)' : 'rgba(255,200,130,0.5)'; g.fillRect(-3, -460, 6, i % 5 ? 18 : 34); }
  g.restore();
  // hourglass
  const hw = 230, hh = 330, appear = eback(seg(u, 0, 0.6));
  g.save(); g.translate(cx, cy); g.scale(appear, appear); g.rotate(Math.sin(u * 0.8) * 0.02);
  const glass = () => { g.beginPath(); g.moveTo(-hw, -hh); g.lineTo(hw, -hh); g.bezierCurveTo(hw, -hh * 0.3, 30, -40, 26, 0); g.bezierCurveTo(30, 40, hw, hh * 0.3, hw, hh); g.lineTo(-hw, hh); g.bezierCurveTo(-hw, hh * 0.3, -30, 40, -26, 0); g.bezierCurveTo(-30, -40, -hw, -hh * 0.3, -hw, -hh); g.closePath(); };
  glass(); g.fillStyle = 'rgba(255,255,255,0.06)'; g.fill();
  g.save(); glass(); g.clip();
  const top = lerp(0.55, 0.12, k), bot = lerp(0.12, 0.6, k);
  g.fillStyle = C.amber;
  g.beginPath(); g.moveTo(-hw, -hh * top + 0); g.lineTo(hw, -hh * top); g.lineTo(hw, 0); g.lineTo(-hw, 0); g.fill();
  g.beginPath(); g.moveTo(-hw, hh); g.lineTo(hw, hh); g.lineTo(hw, hh * (1 - bot)); g.quadraticCurveTo(0, hh * (1 - bot) - 70, -hw, hh * (1 - bot)); g.closePath(); g.fill();
  // stream
  g.fillRect(-4, -10, 8, hh * (1 - bot) - 40);
  const R = rng(Math.floor(u * 30) + 1);
  for (let i = 0; i < 18; i++) { g.fillStyle = C.gold; g.fillRect(-8 + R() * 16, R() * hh * (1 - bot), 4, 4); }
  g.restore();
  g.strokeStyle = 'rgba(255,240,220,0.8)'; g.lineWidth = 8; glass(); g.stroke();
  g.fillStyle = '#6B3E4E'; rrect(g, -hw - 40, -hh - 40, (hw + 40) * 2, 40, 14); g.fill(); rrect(g, -hw - 40, hh, (hw + 40) * 2, 40, 14); g.fill();
  g.restore();
}

function sCall(g, t) {
  const l = L.call; const tPick = wordT('call', 'pick');
  g.fillStyle = vgrad(g, 0, H, [[0, '#1A1530'], [1, '#3A2040']]); g.fillRect(0, 0, W, H);
  const v1 = seg(t, l.start - 0.25, l.start + 0.3) > 0 && t < l.start + 0.3, v2 = t > l.start + 0.55 && t < l.start + 1.1;
  const shake = (v1 || v2) && t < tPick ? Math.sin(t * 120) * 7 : 0;
  const ans = eo(seg(t, tPick, tPick + 0.4));
  const cx = 540 + shake, cy = 800;
  glow(g, 540, 800, 600, ans > 0 ? 'rgba(90,220,140,0.3)' : 'rgba(255,140,120,0.25)');
  // ring pulses
  if (ans < 1) for (let i = 0; i < 3; i++) { const q = ((t * 0.9 + i / 3) % 1); g.save(); g.globalAlpha = (1 - q) * 0.5 * (1 - ans); g.strokeStyle = C.coral; g.lineWidth = 6; g.beginPath(); g.arc(540, 640, 120 + q * 360, 0, Math.PI * 2); g.stroke(); g.restore(); }
  g.save(); g.translate(cx, cy); g.rotate(shake * 0.003);
  g.shadowColor = 'rgba(0,0,0,0.6)'; g.shadowBlur = 60; g.fillStyle = '#0E0E16'; rrect(g, -250, -470, 500, 940, 70); g.fill(); g.shadowColor = 'transparent';
  g.fillStyle = vgrad(g, -440, 440, [[0, '#2D2650'], [1, '#5A2E4F']]); rrect(g, -228, -448, 456, 896, 54); g.fill();
  g.fillStyle = '#0E0E16'; rrect(g, -60, -432, 120, 30, 15); g.fill();
  // avatar
  g.fillStyle = 'rgba(255,255,255,0.12)'; g.beginPath(); g.arc(0, -160, 110, 0, Math.PI * 2); g.fill();
  heart(g, 0, -150, 120 + Math.sin(t * 8) * 6 * (1 - ans), C.rose);
  g.fillStyle = '#fff'; g.font = '800 84px InterX'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Mom', 0, 20);
  g.fillStyle = 'rgba(255,255,255,0.7)'; g.font = '600 34px InterS';
  if (ans < 0.5) g.fillText('incoming call…', 0, 85);
  else { const secs = Math.floor((t - tPick) * 1) + 1; g.fillText('00:0' + Math.min(9, secs), 0, 85); }
  // voice bars after answer
  if (ans > 0) for (let i = 0; i < 9; i++) { const hgt = (20 + 60 * Math.abs(Math.sin(t * 7 + i * 1.3))) * ans; g.fillStyle = C.teal; rrect(g, -160 + i * 38, 200 - hgt / 2, 18, hgt, 9); g.fill(); }
  // buttons
  const bA = 1 - ans;
  g.save(); g.globalAlpha = bA; g.fillStyle = '#E5484D'; g.beginPath(); g.arc(-120, 340, 56, 0, Math.PI * 2); g.fill(); g.restore();
  const gx = lerp(120, 0, ans), gs = 1 + 0.08 * Math.sin(t * 10) * (1 - ans) + ans * 0.1;
  g.fillStyle = ans > 0.5 ? '#E5484D' : '#2FBF71'; g.beginPath(); g.arc(gx, 340, 56 * gs, 0, Math.PI * 2); g.fill();
  // handset glyph
  g.save(); g.translate(gx, 340); g.rotate(ans > 0.5 ? 2.36 : 0); g.strokeStyle = '#fff'; g.lineWidth = 12; g.lineCap = 'round';
  g.beginPath(); g.arc(0, 8, 24, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); g.restore();
  g.restore();
  // tap ripple on pick up
  const rp = seg(t, tPick - 0.05, tPick + 0.5);
  if (rp > 0 && rp < 1) { g.save(); g.globalAlpha = 1 - rp; g.strokeStyle = '#fff'; g.lineWidth = 6; g.beginPath(); g.arc(540 + 120, 1140, 30 + rp * 120, 0, Math.PI * 2); g.stroke(); g.restore(); }
}

function sCoffee(g, t) {
  const l = L.coffee, u = t - l.start + 0.3;
  g.fillStyle = vgrad(g, 0, H, [[0, '#3A2A3A'], [0.6, '#6A4048'], [1, '#2A1B26']]); g.fillRect(0, 0, W, H);
  glow(g, 780, 420, 600, 'rgba(255,190,120,0.4)');
  // window
  g.fillStyle = 'rgba(255,200,140,0.35)'; rrect(g, 620, 220, 340, 420, 16); g.fill();
  g.strokeStyle = '#3A2A3A'; g.lineWidth = 12; g.beginPath(); g.moveTo(790, 220); g.lineTo(790, 640); g.moveTo(620, 430); g.lineTo(960, 430); g.stroke();
  // table
  g.fillStyle = '#8A5A4A'; g.fillRect(0, 1060, W, 40); g.fillStyle = '#5E3A33'; g.fillRect(0, 1100, W, H);
  const meet = eio(seg(u, 0.5, 1.6));
  const mx1 = lerp(250, 440, meet), mx2 = lerp(830, 640, meet);
  const tilt = eo(seg(u, 1.45, 1.65)) * (1 - eo(seg(u, 1.65, 2.2))) * 0.12;
  const mug = (x, col, dir) => {
    g.save(); g.translate(x, 1060); g.rotate(dir * tilt);
    shadow(g, 0, 0, 110, 0.35);
    g.fillStyle = col; rrect(g, -95, -230, 190, 230, 26); g.fill();
    g.strokeStyle = col; g.lineWidth = 26; g.beginPath(); g.arc(dir * -95 + dir * -10, -120, 50, dir > 0 ? Math.PI * 0.5 : -Math.PI * 0.5, dir > 0 ? Math.PI * 1.5 : Math.PI * 0.5); g.stroke();
    g.fillStyle = '#3A2018'; g.beginPath(); g.ellipse(0, -228, 82, 16, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.25)'; rrect(g, -70, -200, 20, 140, 10); g.fill();
    g.restore();
    // steam
    for (let i = 0; i < 3; i++) {
      g.save(); g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 10; g.lineCap = 'round'; g.beginPath();
      for (let s = 0; s <= 30; s++) { const yy = 1060 - 260 - s * 9; const xx = x - 40 + i * 40 + Math.sin(s * 0.35 - t * 4 + i * 2) * 16; s ? g.lineTo(xx, yy) : g.moveTo(xx, yy); }
      g.globalAlpha = 0.6 + 0.4 * Math.sin(t * 2 + i); g.stroke(); g.restore();
    }
  };
  mug(mx1, C.teal, 1); mug(mx2, C.coral, -1);
  // clink sparkle
  const sp = seg(u, 1.6, 2.1);
  if (sp > 0 && sp < 1) { g.save(); g.globalAlpha = 1 - sp; g.strokeStyle = C.gold; g.lineWidth = 6; g.lineCap = 'round';
    for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.4; const r0 = 60 + sp * 40, r1 = 100 + sp * 80; g.beginPath(); g.moveTo(540 + Math.cos(a) * r0, 850 + Math.sin(a) * r0); g.lineTo(540 + Math.cos(a) * r1, 850 + Math.sin(a) * r1); g.stroke(); }
    g.restore(); }
  heart(g, 540, lerp(800, 700, eo(seg(u, 1.7, 2.6))), 60 * eback(seg(u, 1.65, 2.0)), C.rose);
}

function sHug(g, t) {
  const l = L.hug, u = t - l.start + 0.3;
  g.fillStyle = vgrad(g, 0, H, [[0, '#FFB477'], [0.55, '#F07C7A'], [1, '#5A2E55']]); g.fillRect(0, 0, W, H);
  const hugK = eio(seg(u, 0, 0.9));
  glow(g, 540, 820, 500 + hugK * 300, 'rgba(255,230,180,0.6)', 0.5 + 0.5 * hugK);
  g.fillStyle = 'rgba(90,40,80,0.5)'; g.fillRect(0, 1250, W, H);
  const px = lerp(250, 470, hugK), cx = lerp(830, 610, hugK);
  const parent = { x: px, y: 1260, s: 0.95, body: C.coral, hairStyle: 'bun', hair: C.gray, dress: true, deferArms: true, armL: lerp(0.2, 1.9, hugK), armR: -0.2, walking: hugK < 1 && hugK > 0, walk: u * 8, headTilt: 0.15 * hugK };
  const child = { x: cx, y: 1260, s: 1.08, body: C.teal, hairStyle: 'short', deferArms: true, flip: true, armL: lerp(0.2, 1.75, hugK), armR: -0.2, walking: hugK < 1 && hugK > 0, walk: u * 8 + 2, headTilt: 0.2 * hugK };
  shadow(g, 540, 1260, 200, 0.25);
  person(g, child);
  person(g, parent);
  personArms(g, child);
  personArms(g, parent);
  // floating hearts
  for (let i = 0; i < 8; i++) {
    const R = rng(i + 50); const st = 0.8 + R() * 1.2; const q = seg(u, st, st + 2.2);
    if (q <= 0 || q >= 1) continue;
    g.save(); g.globalAlpha = Math.sin(q * Math.PI);
    heart(g, 540 + (R() - 0.5) * 500 + Math.sin(q * 6 + i) * 30, 800 - q * 500, 30 + R() * 30, i % 2 ? C.rose : '#FFE3E3'); g.restore();
  }
}

function sEnd(g, t) {
  const e1 = L.end1, e2 = L.end2;
  const tCut = e2.start - 0.06;
  g.fillStyle = '#07060E'; g.fillRect(0, 0, W, H);
  if (t < tCut) {
    const k = seg(t, e1.start - 0.3, tCut);
    glow(g, 540, 700, 700 * (1 - k * 0.6), 'rgba(255,150,100,0.35)', 1 - k * 0.3);
    const r = 18 + k * k * 40 + Math.sin(t * 30) * k * 3;
    glow(g, 540, 700, 200 + k * 300, 'rgba(255,200,120,0.9)', 0.4 + k * 0.6);
    g.fillStyle = C.gold; g.beginPath(); g.arc(540, 700, r, 0, Math.PI * 2); g.fill();
    // particles pulled into the dot
    const R = rng(77);
    for (let i = 0; i < 70; i++) {
      const a = R() * Math.PI * 2, d0 = 300 + R() * 600; const q = (k * 1.5 + R()) % 1; const d = d0 * (1 - q);
      g.globalAlpha = q * 0.8; g.fillStyle = i % 3 ? C.gold : C.rose; g.beginPath(); g.arc(540 + Math.cos(a) * d, 700 + Math.sin(a) * d, 3 + R() * 4, 0, Math.PI * 2); g.fill();
    }
    g.globalAlpha = 1;
    kinetic(g, t, 'end1', { x: 540, y: 1220, size: 92, maxW: 900, accent: ['last', 'time'] });
  } else {
    // hard cut: silence, black, white words
    kinetic(g, t, 'end2', { x: 540, y: 900, size: 104, maxW: 900, color: '#FFFFFF', alpha: 1 - seg(t, e2.end + 0.2, e2.end + 0.6) });
    // end card
    const tf = e2.end + 0.7;
    const k = eo(seg(t, tf, tf + 1.0));
    if (k > 0) {
      const beat = [tf + 2.2, tf + 3.25].reduce((s, b) => s + (t > b ? Math.exp(-(t - b) * 7) : 0), 0);
      glow(g, 540, 640, (260 + beat * 90) * k, 'rgba(255,170,90,0.6)', 0.6 + beat * 0.4);
      heart(g, 540, 650, (90 + beat * 20) * eback(seg(t, tf, tf + 0.6)), C.rose);
      g.save(); g.globalAlpha = k; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillStyle = C.amber; g.font = 'italic 600 120px Fraunces'; g.shadowColor = 'rgba(255,170,80,0.6)'; g.shadowBlur = 30;
      g.fillText('Call them today.', 540, 920 + (1 - k) * 30); g.shadowColor = 'transparent';
      g.globalAlpha = eo(seg(t, tf + 0.8, tf + 1.6));
      g.fillStyle = C.cream; g.font = '600 46px InterS';
      g.fillText('Send this to someone you love.', 540, 1060);
      g.restore();
    }
  }
}

// ---------------------------------------------------------------- sequencing
const SCENES = [
  { lines: ['hook'], draw: sHook, trans: 'fade', cap: false },
  { lines: ['carry1', 'carry2', 'carry3'], draw: sCarry, trans: 'zoom', cap: true },
  { lines: ['knew'], draw: sKnew, trans: 'flash', cap: false },
  { lines: ['play'], draw: sPlay, trans: 'slide', cap: true },
  { lines: ['story'], draw: sStory, trans: 'iris', cap: true },
  { lines: ['friend'], draw: sFriend, trans: 'zoom', cap: true },
  { lines: ['announce'], draw: sAnnounce, trans: 'flash', cap: false },
  { lines: ['now'], draw: sNow, trans: 'zoom', cap: true },
  { lines: ['call'], draw: sCall, trans: 'slide', cap: true },
  { lines: ['coffee'], draw: sCoffee, trans: 'iris', cap: true },
  { lines: ['hug'], draw: sHug, trans: 'zoom', cap: true },
  { lines: ['end1', 'end2'], draw: sEnd, trans: 'fade', cap: false },
];
SCENES.forEach((s, i) => { s.start = i === 0 ? 0 : L[s.lines[0]].start - 0.32; });
const TR = 0.45;

const layerA = mkLayer(), layerB = mkLayer();
const gA = layerA.getContext('2d'), gB = layerB.getContext('2d');

function drawScene(layerG, s, t) {
  layerG.save(); layerG.setTransform(1, 0, 0, 1, 0, 0); layerG.globalAlpha = 1; layerG.filter = 'none';
  layerG.clearRect(0, 0, W, H); s.draw(layerG, t); layerG.restore();
}

// ambient bokeh
const BOKEH = (() => { const R = rng(99); return Array.from({ length: 34 }, () => ({ x: R() * W, y: R() * H, r: 4 + R() * 16, v: 10 + R() * 30, ph: R() * 6 })); })();
function bokeh(g, t, a) {
  BOKEH.forEach(b => {
    const y = ((b.y - t * b.v) % H + H) % H, x = b.x + Math.sin(t * 0.5 + b.ph) * 20;
    glow(g, x, y, b.r * 3, 'rgba(255,215,160,0.5)', a * (0.4 + 0.3 * Math.sin(t + b.ph)));
  });
}
// film grain tiles
const GRAIN = Array.from({ length: 6 }, (_, k) => {
  const c = document.createElement('canvas'); c.width = 360; c.height = 640; const g = c.getContext('2d');
  const im = g.createImageData(360, 640); const R = rng(k * 31 + 7);
  for (let i = 0; i < im.data.length; i += 4) { const v = R() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
  g.putImageData(im, 0, 0); return c;
});
function vignette(g) {
  const gr = g.createRadialGradient(540, 900, 500, 540, 960, 1250);
  gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.6)');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
}

function composite(layer, alpha, mode, p, incoming) {
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

window.renderFrame = function (t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none';
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  let k = 0; SCENES.forEach((s, i) => { if (t >= s.start) k = i; });
  const cur = SCENES[k];
  const p = k > 0 ? eio(seg(t, cur.start, cur.start + TR)) : 1;
  if (p < 1) {
    const prev = SCENES[k - 1];
    drawScene(gA, prev, t); drawScene(gB, cur, t);
    const m = cur.trans;
    if (m === 'iris') { composite(layerA, 1, 'none', p, false); composite(layerB, 1, 'iris', p, true); }
    else { composite(layerA, 1 - (m === 'slide' ? p * 0.6 : p), m, p, false); composite(layerB, m === 'slide' ? Math.min(1, p * 2) : p, m, p, true); }
    if (m === 'flash') { ctx.fillStyle = `rgba(255,240,225,${Math.sin(p * Math.PI) * 0.75})`; ctx.fillRect(0, 0, W, H); }
  } else {
    drawScene(gB, cur, t); ctx.drawImage(layerB, 0, 0);
  }
  // captions
  const capIds = [];
  SCENES.forEach(s => { if (s.cap) capIds.push(...s.lines); });
  captions(ctx, t, capIds);
  // ambient overlays (not during the silent cut)
  const silent = t >= L.end2.start - 0.06;
  bokeh(ctx, t, silent ? 0.0 : 0.55);
  vignette(ctx);
  ctx.save(); ctx.globalAlpha = 0.07; ctx.globalCompositeOperation = 'overlay';
  ctx.drawImage(GRAIN[Math.floor(t * 30) % GRAIN.length], 0, 0, W, H); ctx.restore();
  // loop-friendly fade at the very end
  const fo = seg(t, TL.duration - 0.5, TL.duration);
  if (fo > 0) { ctx.fillStyle = `rgba(11,13,26,${fo})`; ctx.fillRect(0, 0, W, H); }
};

Promise.all(['600 40px Fraunces', 'italic 600 40px Fraunces', '700 40px Caveat', '800 40px InterX', '600 40px InterS'].map(f => document.fonts.load(f)))
  .then(() => document.fonts.ready).then(() => { window.READY = true; });
