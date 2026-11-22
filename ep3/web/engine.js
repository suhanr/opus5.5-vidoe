// Deterministic frame engine: window.renderFrame(t) draws the whole stage for time t (seconds).
(function () {
  const W = 1080, H = 1350;
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const P = (t, t0, d) => clamp((t - t0) / d);
  const lerp = (a, b, p) => a + (b - a) * p;
  const eo = p => 1 - Math.pow(1 - p, 3);
  const eo5 = p => 1 - Math.pow(1 - p, 5);
  const ei = p => p * p * p;
  const eio = p => p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
  const back = p => { const c = 1.9; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); };
  const spring = p => p >= 1 ? 1 : 1 - Math.exp(-6.5 * p) * Math.cos(11 * p);
  const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const noise1 = x => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u) * 2 - 1; };
  const BN = '০১২৩৪৫৬৭৮৯';
  const bn = s => String(s).replace(/\d/g, d => BN[d]);
  const bnMoney = n => { // Indian grouping
    n = Math.round(n); let s = String(n); if (s.length > 3) { const last = s.slice(-3); let rest = s.slice(0, -3); rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ','); s = rest + ',' + last; } return bn(s);
  };

  // ---------- timeline lookups -------------------------------------------
  const LINES = TL.lines;
  const strip = s => s.replace(/["“”—,।?]/g, '');
  function S(prefix, nth = 0) {
    const p = strip(prefix); let k = 0;
    for (const l of LINES) if (strip(l.text).startsWith(p)) { if (k++ === nth) return l; }
    throw new Error('line not found: ' + prefix);
  }
  function wd(line, prefix, nth = 0) {
    const p = strip(prefix); let k = 0;
    for (const w of line.words) if (strip(w.w).startsWith(p)) { if (k++ === nth) return w; }
    throw new Error('word not found: ' + prefix + ' in ' + line.text);
  }
  // words of a line from word prefix a to word prefix b (inclusive)
  function span(line, a, b) {
    const ws = line.words; let i = a ? ws.indexOf(wd(line, a)) : 0; let j = b ? ws.indexOf(wd(line, b)) : ws.length - 1;
    return ws.slice(i, j + 1);
  }

  // ---------- drawing helpers --------------------------------------------
  const st = o => Object.entries(o).filter(([, v]) => v !== undefined && v !== null && v !== '').map(([k, v]) => `${k}:${v}`).join(';');
  // kinetic words. words: [{w,s}] ; opt: {font,size,color,hl:{prefix:cls},slam:[prefix],out,mode,lh,ls}
  function kt(t, words, o = {}) {
    const mode = o.mode || 'rise';
    const lead = o.lead ?? 0.06;
    let outP = o.out !== undefined ? P(t, o.out, o.outDur || 0.35) : 0;
    const parts = words.map((w, i) => {
      const clean = w.w.replace(/["“”]/g, o.keepQuotes ? '"' : '');
      const ts = (o.at !== undefined ? o.at + i * (o.stagger ?? 0.06) : w.s - lead);
      const p = P(t, ts, o.dur || 0.42);
      let cls = '';
      if (o.hl) for (const k in o.hl) if (strip(clean).startsWith(strip(k))) cls = o.hl[k];
      const isSlam = o.slam && o.slam.some(k => strip(clean).startsWith(strip(k)));
      let tr = '', op = 1, bl = 0;
      if (isSlam) {
        const q = P(t, ts, 0.5);
        const sc = q <= 0 ? 2.4 : lerp(2.4, 1, spring(q));
        tr = `scale(${sc.toFixed(3)})`; op = clamp(q * 4); bl = (1 - clamp(q * 3)) * 10;
      } else if (mode === 'rise') {
        tr = `translateY(${((1 - eo(p)) * 46).toFixed(1)}px)`; op = eo(p); bl = (1 - eo(p)) * 12;
      } else if (mode === 'pop') {
        tr = `scale(${(p <= 0 ? .4 : lerp(.4, 1, back(p))).toFixed(3)})`; op = clamp(p * 3); bl = 0;
      } else if (mode === 'fade') {
        op = eo(p); bl = (1 - eo(p)) * 6;
      } else if (mode === 'drop') {
        tr = `translateY(${((1 - spring(p)) * -80).toFixed(1)}px)`; op = clamp(p * 3);
      }
      if (outP > 0) { op *= 1 - eo(outP); bl += eo(outP) * 14; tr += ` translateY(${(-eo(outP) * 30).toFixed(1)}px)`; }
      return `<span class="w ${cls}" style="${st({ opacity: op.toFixed(3), transform: tr, filter: bl > 0.2 ? `blur(${bl.toFixed(1)}px)` : '' })}">${clean}</span>`;
    });
    return `<div class="${o.font || 'H'} ${o.cls || ''}" style="${st({ 'font-size': (o.size || 90) + 'px', color: o.color, 'line-height': o.lh, 'letter-spacing': o.ls })}">${parts.join(' ')}</div>`;
  }
  // block positioned at y (top px), centered
  const blk = (y, html, extra = '') => `<div class="blk" style="top:${y}px;${extra}">${html}</div>`;
  const at = (x, y, html, extra = '') => `<div class="abs" style="left:${x}px;top:${y}px;${extra}">${html}</div>`;
  // simple appear for static text
  function ap(t, t0, html, o = {}) {
    const p = P(t, t0, o.dur || 0.5); const q = o.out !== undefined ? P(t, o.out, 0.4) : 0;
    const op = eo(p) * (1 - q); if (op <= 0.001) return '';
    const dy = (1 - eo(p)) * (o.dy ?? 30) - q * 20;
    return `<div style="opacity:${op.toFixed(3)};transform:translateY(${dy.toFixed(1)}px) scale(${o.sc ? lerp(o.sc, 1, eo(p)) : 1});filter:blur(${((1 - eo(p)) * 8 + q * 10).toFixed(1)}px)">${html}</div>`;
  }
  // character placement: centre-x, ground y, scale
  function ch(svg, cx, gy, sc, o = {}) {
    const w = 400 * sc, h = 760 * sc;
    const p = o.t0 !== undefined ? P(o.t, o.t0, o.dur || 0.7) : 1;
    const q = o.out !== undefined ? P(o.t, o.out, 0.5) : 0;
    const breath = o.t !== undefined ? 1 + Math.sin(o.t * 2.1 + (o.ph || 0)) * 0.006 : 1;
    const op = eo(p) * (1 - q) * (o.op ?? 1);
    if (op <= 0.001) return '';
    const dx = (o.fromX || 0) * (1 - eo(p));
    const dy = (1 - eo(p)) * 40;
    return `<svg class="abs" viewBox="0 0 400 760" width="${w}" height="${h}" style="left:${cx - w / 2 + dx}px;top:${gy - h + dy}px;opacity:${op.toFixed(3)};transform-origin:50% 100%;transform:scaleY(${breath.toFixed(4)}) ${o.flip ? 'scaleX(-1)' : ''};${o.filter ? 'filter:' + o.filter : ''}">${svg}</svg>`;
  }
  // animate named parts of a character svg via inline CSS transforms
  function pose(svg, parts) {
    for (const k in parts) {
      if (!parts[k]) continue;
      const [tr, org] = Array.isArray(parts[k]) ? parts[k] : [parts[k], '50% 50%'];
      if (k === 'eyes') svg = svg.replace('<g class="eyes">', `<g class="eyes" style="transform-box:fill-box;transform-origin:50% 50%;transform:${tr}">`);
      else svg = svg.replace(new RegExp(`<g id="${k}"( transform="[^"]*")?`), `<g id="${k}" style="transform-box:fill-box;transform-origin:${org};transform:${tr}"`);
    }
    return svg;
  }
  const blink = (t, seed = 0) => { const ph = (t + seed * 1.7) % 4.3; return ph < 0.12 ? 'scaleY(0.12)' : ''; };
  // stroke-draw attribute string
  const dr = p => `pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="${(1 - clamp(p)).toFixed(4)}"`;

  window.K = { W, H, clamp, P, lerp, eo, eo5, ei, eio, back, spring, hash, noise1, bn, bnMoney, S, wd, span, kt, blk, at, ap, ch, pose, blink, dr, st };

  // ---------- persistent layers -----------------------------------------
  const bgc = document.getElementById('bg').getContext('2d');
  const fxc = document.getElementById('fx').getContext('2d');
  const layers = document.getElementById('layers');
  const brand = document.getElementById('brand');
  const grain = document.getElementById('grain');
  { // grain tile
    const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); const id = g.createImageData(256, 256);
    let s = 1; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < id.data.length; i += 4) { const v = rnd() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
    g.putImageData(id, 0, 0); grain.style.backgroundImage = `url(${c.toDataURL()})`;
  }
  const hexA = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
  function drawBg(t, sc) {
    const g = sc.bg || ['#1A2133', '#0F1420', '#080B12'];
    const cx = W / 2 + Math.sin(t * 0.13) * 90, cy = H * 0.42 + Math.cos(t * 0.11) * 60;
    const gr = bgc.createRadialGradient(cx, cy, 40, cx, cy, 1100);
    gr.addColorStop(0, g[0]); gr.addColorStop(0.55, g[1]); gr.addColorStop(1, g[2]);
    bgc.fillStyle = gr; bgc.fillRect(0, 0, W, H);
    if (sc.glow) { // coloured light pool
      const [col, x, y, r, a] = sc.glow; const gg = bgc.createRadialGradient(x, y, 0, x, y, r);
      gg.addColorStop(0, hexA(col, a)); gg.addColorStop(1, hexA(col, 0)); bgc.fillStyle = gg; bgc.fillRect(0, 0, W, H);
    }
  }
  function drawDust(t, amount = 1) {
    fxc.clearRect(0, 0, W, H);
    for (let i = 0; i < 46; i++) {
      const sp = 8 + hash(i) * 22;
      const x = (hash(i + 7) * W + Math.sin(t * 0.3 + i) * 30 + t * (hash(i + 3) - .5) * 14 + W) % W;
      const y = ((hash(i + 11) * H - t * sp) % H + H) % H;
      const r = 1 + hash(i + 5) * 2.4;
      const a = (0.08 + hash(i + 9) * 0.22) * amount * (0.6 + 0.4 * Math.sin(t * 1.3 + i));
      fxc.fillStyle = `rgba(242,235,221,${a.toFixed(3)})`; fxc.beginPath(); fxc.arc(x, y, r, 0, 6.283); fxc.fill();
    }
  }
  function drawBrand(t, vis) {
    const p = P(t, 0.4, 0.8) * vis;
    const pulse = 0.7 + 0.3 * Math.sin(t * 2.2);
    brand.innerHTML = p <= 0 ? '' : `<div style="position:absolute;left:58px;top:52px;display:flex;align-items:center;gap:14px;opacity:${p.toFixed(3)};transform:translateX(${((1 - eo(p)) * -20).toFixed(1)}px)">
      <span style="width:11px;height:11px;border-radius:50%;background:#E8A33D;box-shadow:0 0 ${(10 + 10 * pulse).toFixed(1)}px rgba(232,163,61,${(.6 + .4 * pulse).toFixed(2)})"></span>
      <span style="font:italic 500 34px Fr;letter-spacing:.4px;color:#F2EBDD">The Unsaid</span></div>`;
  }

  // ---------- transitions -------------------------------------------------
  // each returns [outStyle, inStyle, overlayHTML] for p in 0..1
  const TR = {
    cut: p => [p < .5 ? '' : 'display:none', p < .5 ? 'display:none' : '', ''],
    dissolve: p => [`opacity:${1 - p}`, `opacity:${p}`, ''],
    zoom: p => {
      const a = eio(p);
      return [`transform:scale(${1 + a * .35});filter:blur(${a * 18}px);opacity:${1 - eo(clamp(p * 1.6 - .3))}`,
        `transform:scale(${.82 + .18 * eo(a)});filter:blur(${(1 - a) * 18}px);opacity:${eo(clamp(p * 1.6 - .3))}`, ''];
    },
    flash: p => [`opacity:${p < .5 ? 1 : 0}`, `opacity:${p < .5 ? 0 : 1};transform:scale(${1.06 - .06 * eo(clamp(p * 2 - 1))})`,
      `<div class="abs" style="inset:0;background:#FFF6E6;opacity:${(1 - Math.abs(p - .5) * 2) ** 2 * .95}"></div>`],
    slide: p => { const a = eio(p); return [`transform:translateX(${-a * W}px)`, `transform:translateX(${(1 - a) * W}px)`, '']; },
    slideUp: p => { const a = eio(p); return [`transform:translateY(${-a * H * .6}px);opacity:${1 - a}`, `transform:translateY(${(1 - a) * H * .6}px);opacity:${a}`, '']; },
    iris: p => { const a = eio(p); return ['', `clip-path:circle(${(a * 80).toFixed(2)}% at 50% 50%)`, '']; },
    wipe: p => { const a = eio(p); return ['', `clip-path:inset(0 0 0 ${((1 - a) * 100).toFixed(2)}%)`,
      `<div class="abs" style="top:0;bottom:0;width:6px;left:${((1 - a) * W - 3).toFixed(1)}px;background:#E8A33D;box-shadow:0 0 30px #E8A33D;opacity:${p > 0 && p < 1 ? 1 : 0}"></div>`]; },
    black: p => [`opacity:${1 - eo(clamp(p * 2))}`, `opacity:${eo(clamp(p * 2 - 1))}`, ''],
    leak: p => [`opacity:${1 - p}`, `opacity:${p}`,
      `<div class="abs" style="inset:0;background:radial-gradient(60% 50% at ${30 + p * 50}% 40%,rgba(255,180,90,.75),rgba(255,120,60,.25) 45%,transparent 70%);mix-blend-mode:screen;opacity:${Math.sin(p * Math.PI).toFixed(3)}"></div>`],
    glitch: p => {
      const k = Math.floor(p * 9); const j = (hash(k) - .5) * 60;
      const bars = Array.from({ length: 6 }, (_, i) => `<div class="abs" style="left:0;right:0;top:${(hash(k * 7 + i) * H).toFixed(0)}px;height:${(8 + hash(k + i) * 40).toFixed(0)}px;background:${i % 2 ? 'rgba(210,88,61,.55)' : 'rgba(111,184,172,.45)'};transform:translateX(${((hash(i + k) - .5) * 200).toFixed(0)}px)"></div>`).join('');
      const on = p > .05 && p < .95;
      return [p < .5 ? `transform:translateX(${j}px)` : 'display:none', p < .5 ? 'display:none' : `transform:translateX(${-j}px)`, on ? bars : ''];
    }
  };

  // ---------- compositor ---------------------------------------------------
  let SC = [];
  window.defineScenes = list => { list.forEach((s, i) => { if (i > 0) s.a += 0.25; }); SC = list; };
  const TD = 0.7;
  window.renderFrame = function (t) {
    let i = SC.length - 1; while (i > 0 && t < SC[i].a) i--;
    const sc = SC[i];
    // transition windows
    let html = '', overlay = '';
    const nb = SC[i + 1] && t > SC[i + 1].a - TD / 2 ? i + 1 : (i > 0 && t < sc.a + TD / 2 ? i : -1);
    const wrap = (s, style) => {
      const lt = t - s.a; const push = s.push === false ? 1 : 1 + Math.min(lt, 30) * 0.0016;
      return `<div class="layer" style="transform:scale(${push.toFixed(4)});${style}">${s.draw(t)}</div>`;
    };
    let bgScene = sc;
    if (nb >= 0) {
      const inS = SC[nb], outS = SC[nb - 1];
      const d = inS.td || TD;
      const p = clamp((t - (inS.a - d / 2)) / d);
      const [so, si, ov] = TR[inS.tr || 'dissolve'](p);
      html = (so.includes('display:none') ? '' : wrap(outS, so)) + (si.includes('display:none') ? '' : wrap(inS, si));
      overlay = ov; bgScene = p < .5 ? outS : inS;
    } else html = wrap(sc, '');
    layers.innerHTML = html + overlay;
    drawBg(t, bgScene);
    drawDust(t, bgScene.dust ?? 1);
    const f = Math.floor(t * 30);
    grain.style.backgroundPosition = `${Math.floor(hash(f) * 256)}px ${Math.floor(hash(f + 1) * 256)}px`;
    drawBrand(t, bgScene.noBrand ? clamp(1 - (t - bgScene.a) / 0.5) : 1);
    if (window.STAGEFX) window.STAGEFX(t);
  };
  window.CUES = [];
  window.cue = (t, name, gain = 1, pan = 0) => window.CUES.push({ t: +t.toFixed(3), name, gain, pan });
})();
