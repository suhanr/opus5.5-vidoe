// Episode: He Invented Infinite Scroll. Now He Regrets It.  — style: dark tech, glitch, neon red
'use strict';
const K = { bg: '#05060A', red: '#FF2D55', cyan: '#2DE2E6', white: '#F4F6FA', gray: '#8A8FA3', card: '#12141C', card2: '#1A1D28' };

// ---- props
function feedCard(g, x, y, w, h, seed, a = 1) {
  const R = rng(seed * 97 + 5);
  g.save(); g.globalAlpha *= a;
  g.fillStyle = K.card; rrect(g, x, y, w, h, 18 * w / 360); g.fill();
  const s = w / 360;
  g.fillStyle = ['#FF2D55', '#2DE2E6', '#F5B700', '#8B5CF6', '#22C55E'][Math.floor(R() * 5)];
  g.beginPath(); g.arc(x + 34 * s, y + 34 * s, 16 * s, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#3A3F52'; rrect(g, x + 60 * s, y + 22 * s, (110 + R() * 90) * s, 10 * s, 5 * s); g.fill();
  rrect(g, x + 60 * s, y + 40 * s, (60 + R() * 60) * s, 8 * s, 4 * s); g.fill();
  const hue = Math.floor(R() * 360);
  const gr = g.createLinearGradient(x, y + 64 * s, x + w, y + h);
  gr.addColorStop(0, `hsl(${hue},55%,32%)`); gr.addColorStop(1, `hsl(${(hue + 60) % 360},60%,18%)`);
  g.fillStyle = gr; rrect(g, x + 14 * s, y + 64 * s, w - 28 * s, h - 110 * s, 12 * s); g.fill();
  g.fillStyle = '#3A3F52'; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(x + (30 + i * 40) * s, y + h - 24 * s, 8 * s, 0, Math.PI * 2); g.fill(); }
  g.restore();
}
function feed(g, x, y, w, h, off, seed0 = 0, a = 1) {
  const ch = w * 1.05, gap = 16;
  const first = Math.floor(off / (ch + gap));
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  for (let i = first; (i - first) * (ch + gap) < h + ch * 2; i++) {
    const yy = y + i * (ch + gap) - off;
    feedCard(g, x + 10, yy, w - 20, ch, i + seed0, a);
  }
  g.restore();
}
function phone(g, cx, cy, w, h, screen, glowCol = 'rgba(255,45,85,0.35)') {
  glow(g, cx, cy, Math.max(w, h) * 0.9, glowCol, 0.9);
  g.save();
  g.fillStyle = '#0A0B10'; g.strokeStyle = '#2A2E3C'; g.lineWidth = 4;
  rrect(g, cx - w / 2, cy - h / 2, w, h, w * 0.14); g.fill(); g.stroke();
  const sx = cx - w / 2 + 14, sy = cy - h / 2 + 14, sw = w - 28, sh = h - 28;
  g.save(); rrect(g, sx, sy, sw, sh, w * 0.11); g.clip();
  g.fillStyle = '#07080D'; g.fillRect(sx, sy, sw, sh);
  screen(g, sx, sy, sw, sh);
  g.restore();
  g.fillStyle = '#0A0B10'; rrect(g, cx - w * 0.14, sy + 10, w * 0.28, 22, 11); g.fill();
  g.restore();
}
function clockIcon(g, x, y, r, t, col = K.white) {
  g.save(); g.strokeStyle = col; g.lineWidth = r * 0.16; g.lineCap = 'round';
  g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.sin(t * 6) * r * 0.7, y - Math.cos(t * 6) * r * 0.7);
  g.moveTo(x, y); g.lineTo(x + Math.sin(t * 0.5) * r * 0.45, y - Math.cos(t * 0.5) * r * 0.45); g.stroke();
  g.restore();
}
function bigText(g, txt, x, y, size, col, o = {}) {
  g.save(); g.font = `${o.weight || 400} ${size}px ${o.fam || 'Anton'}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  if (o.glow) { g.shadowColor = o.glow; g.shadowBlur = 40; }
  if (o.chroma) {
    g.globalCompositeOperation = 'lighter';
    g.fillStyle = 'rgba(255,0,60,0.8)'; g.fillText(txt, x - o.chroma, y);
    g.fillStyle = 'rgba(0,220,255,0.8)'; g.fillText(txt, x + o.chroma, y);
    g.globalCompositeOperation = 'source-over';
  }
  g.fillStyle = col; g.fillText(txt, x, y); g.restore();
}
const flick = (t, seed) => { const R = rng(Math.floor(t * 12) + seed); return R() > 0.9 ? (R() - 0.5) * 30 : 0; };

// ---- scenes
function sHook(g, t) {
  g.fillStyle = K.bg; g.fillRect(0, 0, W, H);
  // phone with an endless feed
  const off = t * 520 + t * t * 60;
  phone(g, 540, 905, 400, 780, (g, x, y, w, h) => feed(g, x, y, w, h, off, 3));
  const ch = t > 0.15 ? flick(t, 3) : 0;
  bigText(g, 'HE INVENTED THIS.', 540, 330, 118, K.white, { chroma: Math.abs(ch) * 0.4 });
  bigText(g, 'NOW HE REGRETS IT.', 540 + ch, 1420, 118, K.red, { glow: 'rgba(255,45,85,0.7)', chroma: Math.abs(ch) * 0.5 });
  // hand-drawn arrow to the phone
  g.save(); g.strokeStyle = K.red; g.lineWidth = 9; g.lineCap = 'round';
  g.beginPath(); g.moveTo(860, 400); g.quadraticCurveTo(930, 520, 770, 600); g.stroke();
  g.beginPath(); g.moveTo(770, 600); g.lineTo(812, 560); g.moveTo(770, 600); g.lineTo(826, 610); g.stroke(); g.restore();
}

function s2006(g, t) {
  const l = L.y2006, tMade = wordT('y2006', 'made'), tEnd = wordT('y2006', 'endless');
  g.fillStyle = '#0B0D14'; g.fillRect(0, 0, W, H);
  // year, typed
  const yr = '2006'.slice(0, Math.floor(seg(t, l.start - 0.2, l.start + 0.5) * 4 + 0.001));
  g.save(); g.font = '700 150px Mono'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = K.cyan;
  g.shadowColor = 'rgba(45,226,230,0.6)'; g.shadowBlur = 30; g.fillText(yr + (Math.floor(t * 2.5) % 2 ? '_' : ' '), 540, 290); g.restore();
  // browser window
  const bx = 90, by = 430, bw = 900, bh = 820;
  g.fillStyle = '#D8DCE3'; rrect(g, bx, by, bw, bh, 16); g.fill();
  g.fillStyle = '#B9BFCA'; rrect(g, bx, by, bw, 64, 16); g.fill(); g.fillRect(bx, by + 40, bw, 24);
  ['#E5484D', '#F5B700', '#30A46C'].forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.arc(bx + 34 + i * 30, by + 32, 9, 0, Math.PI * 2); g.fill(); });
  g.fillStyle = '#FFFFFF'; rrect(g, bx + 140, by + 14, bw - 170, 36, 8); g.fill();
  g.fillStyle = '#555B66'; g.font = '500 24px Mono'; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillText('http://www.my-blog.com/page1.html', bx + 158, by + 33);
  // page body (clipped); after "endless" it starts scrolling forever
  const scrollOff = t > tEnd ? Math.pow(t - tEnd, 1.6) * 900 : 0;
  g.save(); g.beginPath(); g.rect(bx, by + 64, bw, bh - 64); g.clip();
  g.fillStyle = '#FFFFFF'; g.fillRect(bx, by + 64, bw, bh - 64);
  for (let i = 0; i < 60; i++) {
    const yy = by + 100 + i * 150 - scrollOff;
    if (yy < by - 200 || yy > by + bh + 50) continue;
    const R = rng(i + 4);
    g.fillStyle = i % 3 === 0 ? '#2B6CB0' : '#9AA3AF'; rrect(g, bx + 50, yy, 300 + R() * 300, 22, 6); g.fill();
    g.fillStyle = '#C9CED6';
    for (let k = 0; k < 3; k++) { rrect(g, bx + 50, yy + 44 + k * 26, 760 - R() * 200, 12, 6); g.fill(); }
  }
  // pagination (disappears)
  const pg = 1 - seg(t, tEnd - 0.1, tEnd + 0.3);
  if (pg > 0) {
    g.save(); g.globalAlpha = pg;
    g.fillStyle = '#F1F3F6'; g.fillRect(bx, by + bh - 110, bw, 110);
    g.font = '600 34px InterS'; g.textAlign = 'center'; g.fillStyle = '#2B6CB0';
    g.fillText('‹ Prev    1   2   3   4   5    Next ›', 540, by + bh - 55);
    g.restore();
  }
  g.restore();
  // cursor clicks "Next"
  const cp = eio(seg(t, l.start + 0.3, tMade));
  const cx = lerp(300, 830, cp), cy = lerp(700, by + bh - 50, cp);
  const press = t > tMade && t < tMade + 0.15 ? 0.85 : 1;
  if (pg > 0) {
    g.save(); g.translate(cx, cy); g.scale(press * 1.4, press * 1.4);
    g.fillStyle = '#fff'; g.strokeStyle = '#000'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 34); g.lineTo(9, 26); g.lineTo(16, 40); g.lineTo(22, 37); g.lineTo(15, 23); g.lineTo(26, 23); g.closePath(); g.fill(); g.stroke();
    g.restore();
  }
  if (t > tEnd) bigText(g, '∞', 540, 1330, 120, K.red, { glow: 'rgba(255,45,85,0.8)' });
}

function sNos(g, t) {
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  for (let c = 0; c < 3; c++) feed(g, 30 + c * 350, 0, 320, H, t * (700 + c * 120) + c * 200, c * 30, 0.16);
  g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(0, 0, W, H);
  const items = [['NO PAGES.', 'no1', 640, K.white], ['NO BOTTOM.', 'no2', 840, K.white], ['NO REASON', 'no3', 1060, K.red], ['TO STOP.', 'no3', 1220, K.red]];
  let shake = 0;
  ['no1', 'no2', 'no3'].forEach(id => { const d = t - L[id].start + 0.03; if (d > 0) shake += Math.exp(-d * 14) * 26; });
  g.save(); g.translate(Math.sin(t * 90) * shake, Math.cos(t * 77) * shake);
  items.forEach(([txt, id, y, col], i) => {
    const t0 = L[id].start - 0.03 + (i === 3 ? 0.12 : 0);
    const p = eo5(seg(t, t0, t0 + 0.22));
    if (p <= 0) return;
    const later = items.slice(i + 1).some(([, id2]) => id2 !== id && t > L[id2].start);
    g.save(); g.globalAlpha = p * (later ? 0.4 : 1);
    g.translate(540, y); const sc = lerp(1.7, 1, p); g.scale(sc, sc);
    bigText(g, txt, 0, 0, 150, col, { glow: col === K.red ? 'rgba(255,45,85,0.7)' : null });
    g.restore();
  });
  g.restore();
}

function sEasy(g, t) {
  const s0 = L.steal.start, k = eio(seg(t, s0 - 0.1, s0 + 1.4));
  g.fillStyle = vgrad(g, 0, H, [[0, mix('#101A33', '#1A0710', k)], [1, '#05060A']]); g.fillRect(0, 0, W, H);
  // desk + monitor
  const mx = 650, my = 880;
  glow(g, mx, my, 620, k > 0.5 ? 'rgba(255,45,85,0.45)' : 'rgba(150,200,255,0.45)', 0.9);
  g.fillStyle = '#0B0E18'; g.fillRect(0, 1240, W, H);
  g.fillStyle = '#1A2033'; g.fillRect(mx - 20, my + 150, 40, 110); rrect(g, mx - 120, my + 250, 240, 20, 8); g.fill();
  g.fillStyle = '#0B0E18'; rrect(g, mx - 230, my - 160, 460, 310, 18); g.fill();
  g.save(); rrect(g, mx - 214, my - 144, 428, 278, 10); g.clip();
  g.fillStyle = mix('#DDE8FF', '#2A0A12', k); g.fillRect(mx - 214, my - 144, 428, 278);
  if (k < 0.5) {
    g.fillStyle = '#334'; g.font = '700 30px Mono'; g.textAlign = 'left'; g.textBaseline = 'middle';
    g.fillText('infinite_scroll.js', mx - 190, my - 110);
    g.font = '500 22px Mono'; g.fillStyle = '#556';
    ['onScroll(() => {', '  if (nearBottom())', '    loadMore();', '});'].forEach((s, i) => g.fillText(s, mx - 190, my - 60 + i * 34));
  } else feed(g, mx - 214, my - 144, 428, 278, t * 600, 9);
  g.restore();
  // designer silhouette, rim-lit by the screen
  person(g, { x: 300, y: 1290, s: 1.0, body: mix('#2B3A66', '#3A1420', k), skin: mix('#3B4B7A', '#4A1A28', k), hair: '#0D1222', hairStyle: 'short', noFace: true, armR: -1.2, armL: 0.2, pants: '#141A2E' });
  // time being pulled into the screen
  if (t > s0 - 0.1) {
    for (let i = 0; i < 14; i++) {
      const R = rng(i + 21); const st = s0 + R() * 1.6; const q = seg(t, st, st + 1.1);
      if (q <= 0 || q >= 1) continue;
      const x0 = 300 + (R() - 0.5) * 220, y0 = 850 + (R() - 0.5) * 300;
      const x = lerp(x0, mx, eio(q)), y = lerp(y0, my, eio(q)) - Math.sin(q * Math.PI) * 160;
      g.save(); g.globalAlpha = Math.sin(q * Math.PI); clockIcon(g, x, y, 26 * (1 - q * 0.6), t + i, K.white); g.restore();
    }
  }
}

function sLifetimes(g, t) {
  const l = L.lifetimes, tH = wordT('lifetimes', 'human'), tE = wordT('lifetimes', 'every');
  g.fillStyle = '#070709'; g.fillRect(0, 0, W, H);
  const prog = eo(seg(t, l.start + 0.3, tH + 0.3));
  // grid of people, lighting up red
  const cols = 22, rows = 34, cw = W / cols, rh = H / rows, total = cols * rows;
  const lit = Math.floor(total * prog);
  for (let i = 0; i < total; i++) {
    const x = (i % cols) * cw + cw / 2, y = Math.floor(i / cols) * rh + rh / 2;
    const on = (i * 7919) % total < lit;
    g.fillStyle = on ? 'rgba(255,45,85,0.28)' : 'rgba(255,255,255,0.05)';
    g.beginPath(); g.arc(x, y - 9, 6, 0, Math.PI * 2); g.fill(); rrect(g, x - 8, y - 1, 16, 18, 6); g.fill();
  }
  g.fillStyle = 'rgba(0,0,0,0.45)'; g.fillRect(0, 520, W, 860);
  g.save(); g.globalAlpha = eo(seg(t, l.start - 0.1, l.start + 0.4)); g.font = '600 38px Mono'; g.fillStyle = K.gray;
  g.textAlign = 'center'; g.fillText('YEARS LATER, HE DID THE MATH:', 540, 640); g.restore();
  const n = Math.round(200000 * prog);
  g.save(); g.font = '800 190px Mono'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = K.white;
  g.shadowColor = 'rgba(255,255,255,0.35)'; g.shadowBlur = 30; g.fillText(n.toLocaleString('en-US'), 540, 820); g.restore();
  const ph = eo5(seg(t, tH - 0.05, tH + 0.25));
  if (ph > 0) { g.save(); g.globalAlpha = ph; bigText(g, 'HUMAN LIFETIMES', 540, 1000, 104, K.red, { glow: 'rgba(255,45,85,0.7)' }); g.restore(); }
  const pe = eo5(seg(t, tE - 0.05, tE + 0.2));
  if (pe > 0) { g.save(); g.globalAlpha = pe; g.translate(540, 1170); g.scale(lerp(1.5, 1, pe), lerp(1.5, 1, pe)); bigText(g, 'EVERY. SINGLE. DAY.', 0, 0, 104, K.white); g.restore(); }
  g.save(); g.globalAlpha = eo(seg(t, tE + 0.3, tE + 0.8)); g.font = '500 30px Mono'; g.fillStyle = K.gray; g.textAlign = 'center';
  g.fillText("— Aza Raskin's own estimate", 540, 1290); g.restore();
}

function sTired(g, t) {
  const tT = L.tired.start;
  const droop = eio(seg(t, tT - 0.3, L.tired.end + 0.4));
  g.fillStyle = '#04050B'; g.fillRect(0, 0, W, H);
  // face lit from below by the screen
  const fx = 540, fy = 640;
  const gr = g.createRadialGradient(fx, fy + 260, 40, fx, fy + 100, 420);
  gr.addColorStop(0, 'rgba(90,160,255,0.55)'); gr.addColorStop(1, 'rgba(90,160,255,0)');
  g.fillStyle = '#0C1020'; g.beginPath(); g.ellipse(fx, fy, 230, 280, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = gr; g.beginPath(); g.ellipse(fx, fy, 230, 280, 0, 0, Math.PI * 2); g.fill();
  // eyes with heavy lids + screen reflection
  [-90, 90].forEach((dx, i) => {
    const ex = fx + dx, ey = fy - 10;
    g.save(); g.beginPath(); g.ellipse(ex, ey, 62, 30, 0, 0, Math.PI * 2); g.clip();
    g.fillStyle = '#C9D8F2'; g.fillRect(ex - 70, ey - 40, 140, 80);
    g.fillStyle = '#1B2236'; g.beginPath(); g.arc(ex, ey + 4, 24, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.85)'; g.fillRect(ex - 6, ey - 4, 12, 16);
    const lid = lerp(0.2, 0.78, droop) + (Math.sin(t * 2.3 + i) > 0.97 ? 0.3 : 0);
    g.fillStyle = '#0E1326'; g.fillRect(ex - 70, ey - 40, 140, 80 * lid);
    g.restore();
  });
  // time + battery
  g.save(); g.font = '700 64px Mono'; g.textAlign = 'center'; g.fillStyle = K.gray; g.fillText(t < tT ? '2:58 AM' : '3:07 AM', 470, 260);
  const bat = t < tT ? 9 : 4;
  g.strokeStyle = K.red; g.lineWidth = 4; rrect(g, 640, 230, 90, 44, 8); g.stroke(); g.fillStyle = K.red; g.fillRect(734, 244, 8, 16);
  g.fillRect(646, 236, 78 * bat / 100 + 4, 32); g.font = '700 34px Mono'; g.fillText(bat + '%', 690, 316); g.restore();
  // the phone
  phone(g, 540, 1160, 280, 470, (g, x, y, w, h) => feed(g, x, y, w, h, t * 380, 40), 'rgba(90,160,255,0.35)');
}

function sNever(g, t) {
  const l = L.never;
  g.fillStyle = '#030306'; g.fillRect(0, 0, W, H);
  const hz = 470;
  glow(g, 540, hz, 700, 'rgba(255,45,85,0.5)', 0.9);
  const speed = 1.8, N = 16;
  const items = [];
  for (let i = 0; i < N; i++) {
    let z = ((i * 0.75 - t * speed) % (N * 0.75) + N * 0.75) % (N * 0.75) + 0.35;
    items.push(z);
  }
  items.sort((a, b) => b - a).forEach((z, i) => {
    const sc = 1.25 / z, y = hz + 900 / z, a = clamp(1.6 - z / 5) * clamp((z - 0.35) * 3) * clamp((1300 - y) / 300);
    const w = 640 * sc, h = 360 * sc;
    if (y - h / 2 > H + 200) return;
    g.save(); g.translate(540, y);
    feedCard(g, -w / 2, -h / 2, w, h * 1.05, Math.floor(z * 10) + i, a);
    g.restore();
  });
  g.fillStyle = vgrad(g, 0, hz + 200, [[0, '#030306'], [0.7, 'rgba(3,3,6,0.6)'], [1, 'rgba(3,3,6,0)']]); g.fillRect(0, 0, W, hz + 200);
}

function sYou(g, t) {
  const l = L.you, t0 = l.start - 0.06;
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  // phone screen switching off (CRT collapse)
  const u = t - t0;
  if (u < 0.5) {
    const sy = u < 0.25 ? lerp(1, 0.004, eio(u / 0.25)) : 0.004, sx = u < 0.25 ? 1 : lerp(1, 0.0, eio((u - 0.25) / 0.25));
    g.save(); g.translate(540, 900); g.scale(sx, sy);
    g.fillStyle = '#fff'; g.fillRect(-300, -520, 600, 1040);
    g.restore();
    glow(g, 540, 900, 300 * (1 - u * 2) + 40, 'rgba(255,255,255,0.8)', 1 - u * 2);
  }
  kinetic(g, t, 'you', { x: 540, y: 900, size: 120, fam: 'Playfair', weight: 600, italic: true, color: K.white, maxW: 900, accent: ['have'], accentColor: K.red });
  const c = eo(seg(t, l.end + 0.5, l.end + 1.2));
  if (c > 0) {
    g.save(); g.globalAlpha = c; g.font = '600 40px InterS'; g.textAlign = 'center'; g.fillStyle = K.gray;
    g.fillText('Follow for the truths nobody tells you.', 540, 1060); g.restore();
  }
}

defineEpisode({
  draw: { hook: sHook, y2006: s2006, no1: sNos, easy: sEasy, lifetimes: sLifetimes, done: sTired, never: sNever, you: sYou },
  captionStyle: { font: 'Anton', weight: 400, size: 76, upper: true, y: 1470, active: K.red, color: '#FFFFFF', stroke: 'rgba(0,0,0,0.85)', strokeW: 10, maxW: 900 },
  overlays: { bokeh: 0, grain: 0.09, vignette: 0.7, scanlines: 0.07 },
  watermark: { accent: K.red },
  loopBlend: 0.8,
  thumbnail: g => sHook(g, 0),
});
