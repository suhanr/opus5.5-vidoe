// "The Unsaid" — episode 4: the volume of a father's voice. Pop-poster style.
(function () {
  const { P, lerp, eo, eo5, ei, eio, back, spring, hash, noise1, bn, bnMoney, S, wd, span, kt, blk, at, ap, ch, pose, blink, dr, clamp } = K;
  const CH = window.CHAR;
  const INK = '#141414', Y = '#FFD23F', R = '#FF4B3E', BL = '#2F5BFF', MI = '#2EC4A0', PK = '#FF7EB6', VI = '#3B1F78', PAPER = '#FFF6E5', GREY = '#BDBDBD';
  const L = S, T = (line, w, n) => wd(line, w, n).s;
  const svgBox = (w, h, inner, x, y, extra = '') => `<svg class="abs" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="left:${x}px;top:${y}px;${extra}">${inner}</svg>`;
  const shake = (t, t0, amp = 14, d = 0.45) => { const p = P(t, t0, d); if (p <= 0 || p >= 1) return ''; const a = amp * (1 - p); return `transform:translate(${(noise1(t * 60) * a).toFixed(1)}px,${(noise1(t * 60 + 9) * a).toFixed(1)}px)`; };
  const STK = 'drop-shadow(5px 0 0 #fff) drop-shadow(-5px 0 0 #fff) drop-shadow(0 5px 0 #fff) drop-shadow(0 -5px 0 #fff) drop-shadow(12px 14px 0 rgba(0,0,0,.22))';
  const SCN = [], add = o => SCN.push(o);
  // sticker character
  const st = (svg, x, gy, sc, o = {}) => ch(svg, x, gy, sc, Object.assign({ filter: STK }, o));
  // volume meter: level 0..1
  function meter(level, x, y, s = 1, o = {}) {
    const n = 10, on = Math.round(clamp(level) * n);
    let bars = '';
    for (let i = 0; i < n; i++) { const h = 20 + i * 11; bars += `<rect x="${110 + i * 26}" y="${130 - h}" width="18" height="${h}" rx="4" fill="${i < on ? (i > 6 ? R : INK) : 'none'}" stroke="${INK}" stroke-width="4"/>`; }
    const spk = `<path d="M10 60 h26 l34 -30 v100 l-34 -30 h-26z" fill="${INK}"/>` + (on === 0 ? `<path d="M80 52 l30 36 M110 52 l-30 36" stroke="${R}" stroke-width="9" stroke-linecap="round"/>` : `<path d="M82 58 q12 22 0 44" stroke="${INK}" stroke-width="6" fill="none"/>`);
    return `<svg class="abs" width="${380 * s}" height="${140 * s}" viewBox="0 0 380 140" style="left:${x}px;top:${y}px;${o.style || ''}"><rect x="0" y="0" width="380" height="140" rx="26" fill="${o.bg || '#fff'}" stroke="${INK}" stroke-width="6"/>${spk}${bars}</svg>`;
  }
  // speech bubble
  const bubble = (x, y, w, html, o = {}) => at(x, y, `<div style="position:relative;width:${w}px;background:${o.bg || '#fff'};color:${o.fg || INK};border:6px solid ${INK};border-radius:34px;padding:22px 30px 28px;box-shadow:9px 10px 0 ${INK};${o.style || ''}">${html}
    <svg class="abs" style="left:${o.tailX ?? 60}px;bottom:-44px" width="60" height="44" viewBox="0 0 60 44"><path d="M0 -6 L10 40 L46 -6Z" fill="${o.bg || '#fff'}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/><rect x="-2" y="-10" width="52" height="9" fill="${o.bg || '#fff'}"/></svg></div>`, o.wrap || '');
  const sticker = (t, t0, html, x, y, rot = -4, o = {}) => { const p = P(t, t0 - .05, .45); if (p <= 0) return ''; return at(x, y, `<div style="display:inline-block;transform:rotate(${rot}deg) scale(${lerp(.3, 1, back(p))});opacity:${clamp(p * 3)};${o.style || ''}">${html}</div>`); };
  const tag = (txt, bg, fg = INK, size = 50) => `<div class="H" style="font-size:${size}px;background:${bg};color:${fg};border:5px solid ${INK};border-radius:14px;padding:4px 24px 12px;box-shadow:7px 7px 0 ${INK};white-space:nowrap">${txt}</div>`;

  // =============== 1. THE VOLUME DROPS (hook) ===================================
  {
    const l0 = L('আপনার বাবার গলার'), l1 = L('যেই মানুষটার পায়ের');
    const tLow = T(l0, 'নিচু'), tStep = T(l1, 'পায়ের'), tTV = T(l1, 'টিভির'), tCough = T(l1, 'কাশি');
    cue(.05, 'pop', .6); cue(T(l0, 'গলার'), 'beep', .3); for (let k = 0; k < 6; k++) cue(tLow + k * .12, 'beep', .25 - k * .03); cue(tLow, 'riser_down', .5);
    for (let k = 0; k < 4; k++) cue(tStep + k * .35, 'step', .7); for (let k = 0; k < 5; k++) cue(tTV + .2 + k * .1, 'beep', .25); cue(tCough, 'cough', .9); cue(tCough + .55, 'cough', .8);
    add({
      a: 0, tr: 'cut', flat: Y, accent: R, draw(t) {
        let h = '';
        const lvl = t < tLow - .1 ? 1 : lerp(1, .2, eo(P(t, tLow - .1, 1.0)));
        const A = 1 - P(t, l1.s - .2, .4);
        if (A > 0) {
          h += `<div style="opacity:${A}">`;
          h += meter(lvl, 140, 230, 2.1, { style: `transform:rotate(-3deg);${shake(t, tLow, 10)}` });
          h += st(pose(CH.abba2('tense'), { eyes: blink(t) }), 790, 1360, 1.05, { t, t0: .2 });
          h += blk(540, kt(t, span(l0, 'আপনার', 'আওয়াজটা'), { size: 74, cls: 'stk', lh: 1.2 }), 'padding-right:330px;text-align:left');
          h += blk(780, kt(t, span(l0, 'ঠিক', 'গেল'), { size: 84, hl: { 'নিচু': 'mkR' }, slam: ['নিচু'], lh: 1.2 }), 'padding-right:330px;text-align:left');
          h += blk(1110, kt(t, span(l0, 'খেয়াল', 'করছেন'), { font: 'B', size: 54 }), 'padding-right:330px;text-align:left');
          h += '</div>';
        }
        const B = P(t, l1.s - .2, .4);
        if (B > 0) {
          // footsteps + TV volume going down
          let steps = ''; for (let k = 0; k < 4; k++) { const p = P(t, tStep + k * .35, .2); steps += `<g transform="translate(${120 + k * 120} ${1270 - (k % 2) * 30}) rotate(-10)" opacity="${p}"><ellipse rx="22" ry="34" fill="${INK}"/><circle cx="-10" cy="-44" r="7" fill="${INK}"/><circle cx="4" cy="-48" r="7" fill="${INK}"/><circle cx="17" cy="-42" r="6" fill="${INK}"/></g>`; }
          const tvVol = 1 - eo(P(t, tTV + .2, .8)) * .85;
          h += `<div style="opacity:${eo(B)}">`;
          h += svgBox(1080, 1350, `<g transform="translate(130 280) rotate(-3)"><rect x="0" y="0" width="520" height="360" rx="30" fill="${INK}"/><rect x="24" y="24" width="472" height="300" rx="14" fill="${BL}"/>
            <path d="M200 140 l70 40 l-70 40z" fill="#fff" opacity=".9"/><rect x="60" y="270" width="${400 * tvVol}" height="18" rx="9" fill="${Y}"/><rect x="60" y="270" width="400" height="18" rx="9" fill="none" stroke="#fff" stroke-width="3"/>
            <path d="M180 360 l-40 60 M340 360 l40 60" stroke="${INK}" stroke-width="12"/></g>${steps}`, 0, 0);
          h += blk(740, kt(t, span(l1, 'যেই', 'যাইত'), { font: 'B', size: 40 }), 'text-align:left;padding-right:420px');
          h += st(pose(CH.abba2('tense'), { eyes: blink(t), head: [t > tCough && t < tCough + 1.2 ? `rotate(${Math.sin((t - tCough) * 14) * 4}deg)` : '', '50% 90%'] }), 830, 1360, 1.0, { t, t0: l1.s - .2, fromX: 300 });
          if (t > tCough - .05) h += sticker(t, tCough, tag('অ্যাহেম!', '#fff', INK, 46), 640, 520, -8) + sticker(t, tCough + .55, tag('অ্যাহেম!', '#fff', INK, 40), 700, 640, 6);
          h += blk(930, kt(t, span(l1, 'সেই', 'কেন'), { size: 56, hl: { 'দু\'বার': 'mkY', 'কাশি': 'mkY' }, lh: 1.25 }), 'text-align:left;padding-right:400px');
          h += '</div>';
        }
        return h;
      }
    });
  }

  // =============== 2. THE BANYAN TREE ============================================
  {
    const l2 = L('আমাদের মধ্যবিত্ত'), l3 = L('আমরা মুখে বলি');
    const tTree = T(l3, 'বটগাছ');
    cue(l2.s - .3, 'whoosh', .6); cue(T(l2, 'অদ্ভুত'), 'hit', .5); cue(tTree - .2, 'grow', .8); cue(tTree + .4, 'shimmer', .5);
    add({
      a: l2.s - .35, tr: 'bars', flat: BL, accent: Y, dotCol: 'rgba(255,255,255,.10)', dotCorner: 2, draw(t) {
        let h = '';
        const g = eo5(P(t, tTree - .3, 1.2));
        h += svgBox(1080, 1350, `<g transform="translate(540 1250)"><path d="M-60 0 C-50 -180 -70 -300 -20 -420 L20 -420 C70 -300 50 -180 60 0Z" fill="#6B3E1F" stroke="${INK}" stroke-width="7"/>
          <g transform="translate(0 -520) scale(${g})"><circle cx="-200" cy="40" r="170" fill="#3DBE64" stroke="${INK}" stroke-width="7"/><circle cx="200" cy="40" r="170" fill="#3DBE64" stroke="${INK}" stroke-width="7"/><circle cx="0" cy="-60" r="220" fill="#4CD675" stroke="${INK}" stroke-width="7"/>
          ${[...Array(9)].map((_, i) => `<path d="M${-220 + i * 55} 120 v${120 + (i % 3) * 50}" stroke="#6B3E1F" stroke-width="6"/>`).join('')}</g></g>`, 0, 0, `opacity:${clamp(g * 2)}`);
        h += st(pose(CH.abba2('smile'), { eyes: blink(t) }), 540, 1330, .78, { t, t0: tTree });
        h += blk(180, kt(t, span(l2, 'আমাদের', 'পরিবারগুলায়'), { font: 'B', size: 46, cls: 'wt', out: l3.s - .1 }));
        h += blk(250, kt(t, span(l2, 'সম্মানের', 'অদ্ভুত'), { size: 92, cls: 'stk', hl: { 'অদ্ভুত': 'stkY' }, out: l3.s - .1 }));
        h += blk(180, kt(t, span(l3, 'আমরা', 'বলি'), { font: 'B', size: 46, cls: 'wt' }));
        h += blk(250, kt(t, span(l3, 'বাবা', 'বটগাছ'), { font: 'Q', size: 100, cls: 'stk', hl: { 'বটগাছ': 'stkY' }, slam: ['বটগাছ'], keepQuotes: false }));
        return h;
      }
    });
  }

  // =============== 3. THE MONEY MACHINE ==========================================
  {
    const l4 = L('কিন্তু বাস্তবে'), l5 = L('যতদিন মেশিন'), l6 = L('আর যেইদিন রিটায়ারমেন্টের');
    const tMac = T(l4, 'মেশিনের'), tStop = T(l6, 'বন্ধ'), tFlip = T(l6, 'বয়সের');
    cue(l4.s - .3, 'whoosh', .6); cue(tMac - .1, 'machine', .8); for (let k = 0; k < 4; k++) cue(l5.s + .3 + k * .8, 'cash', .5);
    cue(T(l5, 'শাসন'), 'stamp', .7); cue(T(l5, 'ব্যক্তিত্ব'), 'stamp', .7); cue(tStop - .1, 'powerdown', .9); cue(tFlip, 'flip', .7);
    add({
      a: l4.s - .35, tr: 'bars', flat: R, accent: Y, dotCorner: 0, draw(t) {
        let h = '';
        const mp = eo5(P(t, tMac - .3, .8)), running = t < tStop ? 1 : 1 - eo(P(t, tStop, 1.0));
        const ang = (t - tMac) * 120 * running;
        const gear = (cx, cy, r, a) => `<g transform="translate(${cx} ${cy}) rotate(${a})"><circle r="${r}" fill="${Y}" stroke="${INK}" stroke-width="6"/>${[...Array(8)].map((_, i) => `<rect x="-10" y="${-r - 18}" width="20" height="24" fill="${Y}" stroke="${INK}" stroke-width="5" transform="rotate(${i * 45})"/>`).join('')}<circle r="${r * .35}" fill="${INK}"/></g>`;
        let notes = '';
        if (t > l5.s && t < tStop + .3) for (let k = 0; k < 4; k++) { const p = ((t - l5.s) * .8 + k / 4) % 1; notes += `<g transform="translate(${700 + p * 60} ${640 + p * 420}) rotate(${p * 40})" opacity="${(1 - p) * running}"><rect x="-60" y="-30" width="120" height="60" rx="6" fill="#7BD88F" stroke="${INK}" stroke-width="5"/><text y="12" font-family="H" font-size="36" text-anchor="middle" fill="${INK}">৳</text></g>`; }
        h += svgBox(1080, 1350, `<g transform="translate(0 ${(1 - mp) * 400})" opacity="${mp}"><rect x="300" y="420" width="480" height="420" rx="30" fill="#fff" stroke="${INK}" stroke-width="8"/>${gear(440, 560, 70, ang)}${gear(610, 600, 50, -ang * 1.4)}
          <rect x="620" y="760" width="160" height="22" rx="8" fill="${INK}"/><circle cx="350" cy="470" r="14" fill="${running > .5 ? '#3DBE64' : R}"/><text x="540" y="810" font-family="H" font-size="36" text-anchor="middle" fill="${INK}">বাবা</text></g>${notes}`, 0, 0);
        h += blk(170, kt(t, span(l4, 'কিন্তু', 'ব্যবহার'), { font: 'B', size: 44, cls: 'wt', hl: { 'মেশিনের': 'mkY' }, out: l5.s - .1 }));
        // labels: rage = discipline, stern face = personality ; then flip
        const flip = eo(P(t, tFlip - .1, .5));
        const lab = (t0, a, b, y) => { const p = P(t, t0, .4); if (p <= 0) return ''; return at(60, y, `<div style="display:flex;align-items:center;gap:20px;opacity:${eo(p)};transform:scale(${lerp(.4, 1, back(p))});transform-origin:0 50%">${tag(a, '#fff', INK, 44)}<span class="H wt" style="font-size:50px">=</span><div style="transform:rotateX(${flip * 180}deg)">${flip < .5 ? tag(b, Y, INK, 44) : `<div style="transform:rotateX(180deg)">${tag('বয়সের খিটখিটে ভাব', GREY, INK, 40)}</div>`}</div></div>`); };
        h += lab(T(l5, 'রাগটা'), 'রাগ', 'শাসন', 920) + lab(T(l5, 'গম্ভীর'), 'গম্ভীর মুখ', 'ব্যক্তিত্ব', 1060);
        h += blk(170, kt(t, span(l5, 'যতদিন', 'আসে'), { size: 60, cls: 'stk', hl: { 'টাকা': 'stkY' }, out: l6.s - .1 }));
        h += blk(170, kt(t, span(l6, 'আর', 'যায়'), { size: 56, cls: 'stk', hl: { 'রিটায়ারমেন্টের': 'stkY', 'বন্ধ': 'stkY' } }));
        return h;
      }
    });
  }

  // =============== 4. I PAY FOR EVERYTHING =======================================
  {
    const l7 = L('আমাদের বাসায় আব্বার'), l8 = L('আব্বা রিটায়ার'), l9 = L('এখন বাসার বাজার'), l10 = L('আমি নিজেরে খুব');
    cue(l7.s - .3, 'whoosh', .6); cue(T(l7, 'শীতের'), 'wind', .5); cue(T(l8, 'তিন'), 'pop', .5);
    [T(l9, 'বাজার'), T(l9, 'কারেন্ট'), T(l9, 'ওষুধ')].forEach(x => cue(x, 'cash', .5)); cue(T(l10, 'দায়িত্বশীল'), 'medal', .7);
    add({
      a: l7.s - .35, tr: 'pop', flat: MI, accent: Y, dotCorner: 3, blob: ['rgba(255,255,255,.18)', 860, 300, 260], draw(t) {
        let h = '';
        const A = 1 - P(t, l9.s - .3, .4);
        if (A > 0) {
          h += `<div style="opacity:${A}">`;
          // winter afternoon calendar
          const cp = P(t, l7.s, .5);
          h += sticker(t, l7.s, `<div style="width:300px;background:#fff;border:6px solid ${INK};border-radius:20px;box-shadow:9px 10px 0 ${INK};overflow:hidden"><div class="H" style="background:${R};color:#fff;font-size:44px;text-align:center;padding:6px 0 12px">শীত</div><div class="H" style="font-size:120px;text-align:center;line-height:1.2">❄</div></div>`, 110, 330, -6);
          h += st(pose(CH.abba2('tense'), { eyes: blink(t) }), 760, 1330, 1.0, { t, t0: l8.s - .3 });
          h += sticker(t, T(l8, 'রিটায়ার'), tag('রিটায়ার্ড · ৩ বছর', Y, INK, 44), 560, 330, 4);
          h += blk(760, kt(t, span(l7, 'আমাদের', 'বিকালে'), { size: 58, cls: 'stk', lh: 1.25 }), 'text-align:left;padding-right:420px');
          h += '</div>';
        }
        const B = P(t, l9.s - .3, .5);
        if (B > 0) {
          h += `<div style="opacity:${eo(B)}">`;
          const bill = (t0, txt, x, y, r) => sticker(t, t0, `<div style="width:240px;background:#fff;border:5px solid ${INK};border-radius:10px;box-shadow:7px 8px 0 ${INK};padding:14px 18px 20px"><div class="H" style="font-size:40px">${txt}</div>${[0, 1, 2].map(i => `<div style="height:6px;background:#ddd;margin-top:12px;width:${60 + i * 12}%"></div>`).join('')}<div class="H" style="font-size:34px;color:${R};margin-top:8px">৳ ✓</div></div>`, x, y, r);
          h += bill(T(l9, 'বাজার'), 'বাজার', 70, 300, -8) + bill(T(l9, 'কারেন্ট'), 'কারেন্ট বিল', 400, 260, 3) + bill(T(l9, 'ওষুধ'), 'ওষুধ', 730, 310, 9);
          const medal = P(t, T(l10, 'দায়িত্বশীল') - .1, .6);
          h += st(pose(CH.son('smile', 'idle'), { eyes: blink(t, 2) }) + (medal > 0 ? `<g transform="translate(200 ${lerp(150, 300, eo5(medal))})"><path d="M-20 -60 L0 0 L20 -60" fill="${R}" stroke="${INK}" stroke-width="4"/><circle r="28" fill="${Y}" stroke="${INK}" stroke-width="5"/><text y="10" font-family="H" font-size="28" text-anchor="middle" fill="${INK}">১</text></g>` : ''), 540, 1340, 1.0, { t });
          h += blk(700, kt(t, span(l9, 'সব', 'চালাই'), { size: 96, cls: 'stk', hl: { 'আমি': 'stkY' }, slam: ['চালাই'] }));
          h += blk(830, kt(t, l10.words, { font: 'B', size: 48, hl: { 'দায়িত্বশীল': 'mkY' } }));
          h += '</div>';
        }
        return h;
      }
    });
  }

  // =============== 5. THE FRIDGE, AND THE INTERRUPTION ============================
  {
    const l11 = L('সেদিন ডাইনিং'), l12 = L('আব্বা পাশের চেয়ারে'), l13 = L('একটু বিরক্ত'), l14 = L('এখনকার ইনভার্টার'), l15 = L('আমি যেটা ভালো');
    const tCut = T(l12, 'আমি'), tAch = T(l12, 'আচ্ছা');
    cue(l11.s - .3, 'whoosh', .5); cue(T(l11, 'ফ্রিজটা'), 'hum', .5); cue(tAch, 'beep', .15);
    cue(tCut - .05, 'scissors', .9); cue(l13.s, 'hit', .5); cue(T(l13, 'বুঝবা'), 'impact', .9); cue(T(l14, 'আইডিয়া'), 'hit', .6); cue(T(l15, 'টেনশন'), 'impact_soft', .7);
    add({
      a: l11.s - .35, tr: 'bars', flat: PK, accent: BL, dotCorner: 0, draw(t) {
        let h = '';
        const loud = t > l13.s - .2;
        const lvl = loud ? lerp(.3, 1, eo(P(t, l13.s - .2, .3))) : (t > tAch ? .2 + Math.abs(Math.sin(t * 9)) * .1 : .15);
        // fridge
        h += svgBox(1080, 1350, `<g transform="translate(830 430) rotate(4)"><rect x="0" y="0" width="200" height="440" rx="22" fill="#F4F4F4" stroke="${INK}" stroke-width="7"/><line x1="0" y1="150" x2="200" y2="150" stroke="${INK}" stroke-width="6"/><rect x="160" y="40" width="14" height="80" rx="6" fill="${INK}"/><rect x="160" y="190" width="14" height="120" rx="6" fill="${INK}"/><path d="M40 300 q20 -10 30 10" stroke="#999" stroke-width="5" fill="none"/></g>`, 0, 0);
        h += st(pose(CH.amma('neutral', 'idle'), { eyes: blink(t, 1) }), 170, 1330, .82, { t });
        h += st(pose(CH.son(loud ? 'stern' === 'x' ? 'neutral' : 'neutral' : 'smile', 'idle'), { eyes: blink(t, 2), armR: [loud ? `rotate(${-30 + Math.sin(t * 8) * 10}deg)` : '', '0% 0%'] }), 420, 1340, .92, { t });
        h += st(pose(CH.abba2(t > tCut ? 'tense' : 'neutral'), { eyes: blink(t, 3), armR: [t < tCut ? `rotate(${-20 + Math.sin(t * 6) * 6}deg)` : '', '0% 0%'] }), 700, 1340, .92, { t });
        h += meter(lvl, 640, 180, 1.0, { style: 'transform:rotate(3deg)' });
        h += blk(170, kt(t, span(l11, 'সেদিন', 'নিয়া'), { font: 'B', size: 44, hl: { 'ফ্রিজটা': 'mkW' }, out: l12.s - .1 }), 'text-align:left;padding-right:480px');
        // abba's quiet bubble, cut mid-sentence
        const ab = P(t, tAch - .2, .4), cut = P(t, tCut - .1, .4);
        if (ab > 0 && t < l13.s + .2) {
          h += bubble(480, 330, 520, `<div class="Q" style="font-size:34px;color:#555">${span(l12, 'আচ্ছা', 'বছর').map(w => w.w.replace(/["“”]/g, '')).join(' ')}…</div>`, { tailX: 300, wrap: `opacity:${eo(ab) * (1 - P(t, l13.s, .3))};transform:rotate(${cut * 8}deg) translateY(${ei(cut) * 160}px)` });
          if (cut > 0) h += svgBox(1080, 1350, `<g transform="translate(${lerp(1100, 700, eo(cut))} 420) rotate(-30)" opacity="${1 - P(t, tCut + .5, .3)}"><circle cx="-30" cy="-26" r="22" fill="none" stroke="${INK}" stroke-width="9"/><circle cx="-30" cy="26" r="22" fill="none" stroke="${INK}" stroke-width="9"/><path d="M-12 -14 L90 20 M-12 14 L90 -20" stroke="${INK}" stroke-width="9" stroke-linecap="round"/></g>`, 0, 0);
        }
        // son's loud lines
        const loudLine = (ws, size, out) => blk(170, `<div style="${shake(t, ws[0].s, 12)}">` + kt(t, ws, { size, cls: 'stk', hl: { 'বুঝবা': 'stkR', 'আইডিয়া': 'stkR', 'টেনশন': 'stkR', 'না': 'stkR' }, keepQuotes: false, out }) + '</div>', 'text-align:left;padding-right:430px');
        h += loudLine(span(l13, 'আব্বা', 'না'), 78, l14.s - .1);
        h += loudLine(l14.words, 66, l15.s - .1);
        h += loudLine(l15.words, 62);
        return h;
      }
    });
  }

  // =============== 6. SILENCE (colour drains) ====================================
  {
    const l16 = L('আব্বা আর একটা শব্দও'), l17 = L('চশমাটা পকেটে');
    const tDoor = T(l17, 'ঘরে');
    cue(l16.s - .2, 'cut_silence', 1); cue(l16.s + .2, 'mute', .8); cue(T(l17, 'পকেটে'), 'cloth', .4); cue(T(l17, 'কাপটা'), 'clink', .5); cue(tDoor + .3, 'door', .7);
    add({
      a: l16.s - .35, tr: 'dissolve', td: .9, flat: GREY, dotCol: 'rgba(0,0,0,.07)', draw(t) {
        let h = '';
        const walk = eio(P(t, T(l17, 'আস্তে') - .2, 2.6));
        h += svgBox(1080, 1350, `<rect x="760" y="330" width="250" height="760" fill="#8E8E8E" stroke="${INK}" stroke-width="7"/><rect x="${760}" y="330" width="${lerp(250, 30, eo(P(t, tDoor + .1, .5)))}" height="760" fill="#5E5E5E" stroke="${INK}" stroke-width="5"/>
          <g transform="translate(240 1080)"><path d="M0 0 h110 l-12 80 h-86z" fill="#fff" stroke="${INK}" stroke-width="6"/><path d="M106 18 q34 4 26 34 q-6 16 -26 12" fill="none" stroke="${INK}" stroke-width="6"/><rect x="8" y="40" width="94" height="36" fill="#B07A4A"/></g>`, 0, 0);
        h += st(pose(CH.abba2('tense'), { head: ['rotate(8deg)', '50% 90%'] }), lerp(640, 920, walk), 1330, .95, { t, filter: `${STK} grayscale(1)`, op: 1 - P(t, tDoor + .2, .5) });
        h += meter(0, 80, 180, 1.0, { bg: '#E6E6E6', style: `opacity:${eo(P(t, l16.s, .4))}` });
        h += blk(380, kt(t, l16.words, { size: 80, cls: 'k', hl: { 'শব্দও': 'mkK' }, lh: 1.2 }), 'text-align:left;padding-right:440px');
        h += blk(660, kt(t, l17.words, { font: 'B', size: 44, cls: 'k', hl: { 'অর্ধেক': 'mkW' } }), 'text-align:left;padding-right:500px');
        return h;
      }
    });
  }

  // =============== 7. HOW IT USED TO BE (flashback) ===============================
  {
    const l18 = L('আগে হইলে আব্বা'), l19 = L('বলতেন'), l20 = L('কিন্তু সেদিন উনি'), l21 = L('কারণ উনি জানেন');
    const tBang = T(l18, 'চাপড়াইতেন');
    cue(l18.s - .3, 'flashback', .7); cue(tBang, 'bang', 1); cue(tBang + .25, 'bang', .8); cue(T(l19, 'হিসাব'), 'impact', .8);
    cue(l20.s - .2, 'flashback', .5); cue(T(l21, 'কারেন্ট'), 'type', .5);
    add({
      a: l18.s - .35, tr: 'bars', flat: VI, accent: Y, dotCol: 'rgba(255,255,255,.08)', dotCorner: 1, draw(t) {
        let h = '';
        const back_ = P(t, l20.s - .2, .5);
        if (back_ < 1) {
          const bang = t > tBang ? Math.max(0, 1 - ((t - tBang) % .25) / .25) * (t < tBang + .6 ? 1 : 0) : 0;
          h += `<div style="opacity:${1 - back_};${shake(t, tBang, 16, .6)}">`;
          h += sticker(t, l18.s - .2, tag('আগে', Y, INK, 54), 70, 170, -6);
          h += st(pose(CH.abba2('stern'), { eyes: blink(t), armR: [`rotate(${-40 + bang * 40}deg)`, '0% 0%'] }), 540, 1250, 1.15, { t });
          h += svgBox(1080, 1350, `<rect x="120" y="900" width="840" height="70" rx="10" fill="#8A5A3A" stroke="${INK}" stroke-width="7"/><rect x="160" y="968" width="30" height="160" fill="#6B4229" stroke="${INK}" stroke-width="5"/><rect x="890" y="968" width="30" height="160" fill="#6B4229" stroke="${INK}" stroke-width="5"/>${bang > 0 ? `<g transform="translate(740 890)"><path d="M0 -70 L18 -24 L66 -40 L34 0 L70 30 L22 26 L10 72 L-8 28 L-56 44 L-26 6 L-64 -30 L-16 -24Z" fill="${Y}" stroke="${INK}" stroke-width="5" transform="scale(${.6 + bang * .6})"/></g>` : ''}`, 0, 0);
          h += blk(1150, kt(t, span(l18, 'এই', 'চাপড়াইতেন'), { size: 64, cls: 'stk', hl: { 'চাপড়াইতেন': 'stkY' } }));
          const bp = P(t, l19.s + .3, .4);
          if (bp > 0) h += bubble(130, 160, 820, `<div class="Q" style="font-size:66px;line-height:1.3">${kt(t, span(l19, 'তোরে', 'শিখাইসে'), { font: 'Q', size: 66, hl: { 'হিসাব': 'mkR' }, keepQuotes: false })}</div>`, { bg: Y, tailX: 420, wrap: `transform:scale(${lerp(.4, 1, back(bp))}) rotate(-2deg);opacity:${clamp(bp * 3)}` });
          h += '</div>';
        }
        if (back_ > 0) {
          h += `<div class="abs" style="inset:0;background:${GREY};opacity:${back_}"></div><div style="opacity:${back_}">`;
          h += meter(0, 80, 180, 1.0, { bg: '#E6E6E6' });
          h += blk(400, kt(t, l20.words, { size: 80, cls: 'k', hl: { 'কিছুই': 'mkK' } }));
          // electricity bill with the son's name, not his
          const bp = P(t, T(l21, 'কারেন্ট') - .2, .6);
          if (bp > 0) h += sticker(t, T(l21, 'কারেন্ট') - .2, `<div style="width:520px;background:#fff;border:6px solid ${INK};border-radius:12px;box-shadow:10px 12px 0 ${INK};padding:24px 30px 30px"><div class="H" style="font-size:46px">বিদ্যুৎ বিল</div><div class="B" style="font-size:34px;margin-top:10px">পরিশোধকারী: <span class="mkY">ছেলে</span></div><div class="B gr" style="font-size:34px;margin-top:6px"><s>আব্বা</s></div><div class="H" style="font-size:52px;color:${R};margin-top:10px;text-align:right">৳ ২,৪৮০ ✓</div></div>`, 280, 620, -3);
          h += blk(1150, kt(t, span(l21, 'এখন', 'না'), { font: 'B', size: 46, cls: 'k', hl: { 'পকেট': 'mkW' } }));
          h += '</div>';
        }
        return h;
      }
    });
  }

  // =============== 8. THE NOTE (key moment) =====================================
  {
    const l22 = L('আমার আসল ধাক্কাটা'), l23 = L('সকালবেলা ঘুম'), l24 = L('তার ওপর আব্বার'), l25 = L('ফ্রিজের ডেলিভারি');
    const tNotes = T(l23, 'তিনটা'), tWrite = T(l24, 'আমার');
    cue(l22.s - .3, 'morning', .8); cue(T(l22, 'ধাক্কাটা'), 'impact', .8); [0, .3, .6].forEach(x => cue(tNotes + x, 'paper', .5));
    cue(tWrite - .2, 'pencil', .9); cue(l25.s, 'pencil', .8); cue(l25.e + .1, 'piano_soft', .7);
    add({
      a: l22.s - .35, tr: 'leak', td: 1.0, flat: '#FFE3A8', dotCol: 'rgba(160,90,20,.10)', dotCorner: 1, blob: ['rgba(255,255,255,.45)', 260, 260, 300], draw(t) {
        let h = '';
        h += blk(170, kt(t, l22.words, { size: 76, cls: 'stk', hl: { 'ধাক্কাটা': 'stkR' }, slam: ['ধাক্কাটা'], out: l23.s - .1 }));
        h += blk(170, kt(t, span(l23, 'সকালবেলা', 'কোনায়'), { font: 'B', size: 44, cls: 'k', out: l24.s - .2 }));
        // desk + three notes fanning out
        h += svgBox(1080, 1350, `<rect x="-20" y="1020" width="1120" height="400" fill="#B9773F" stroke="${INK}" stroke-width="7"/><rect x="-20" y="1020" width="1120" height="26" fill="#D1925A"/>`, 0, 0);
        for (let i = 0; i < 3; i++) {
          const p = P(t, tNotes + i * .3, .5);
          if (p <= 0) continue;
          h += at(170 + i * 50, 780 - i * 26, `<div style="width:520px;height:250px;background:linear-gradient(135deg,#E9C98A,#D9A95F);border:6px solid ${INK};border-radius:14px;box-shadow:8px 10px 0 rgba(0,0,0,.25);transform:rotate(${-8 + i * 6}deg) scale(${lerp(.5, 1, back(p))});opacity:${clamp(p * 3)};position:relative;overflow:hidden">
            <div class="abs" style="left:24px;top:20px;font:700 60px H;color:${INK}">১০০০</div><div class="abs" style="right:24px;bottom:16px;font:700 44px H;color:${INK}">টাকা</div>
            <div class="abs" style="left:200px;top:40px;width:150px;height:150px;border-radius:50%;border:5px solid rgba(20,20,20,.35)"></div><div class="abs" style="left:0;right:0;top:120px;height:8px;background:rgba(20,20,20,.15)"></div></div>`);
        }
        // the note, written by a shaky hand
        const np = P(t, l24.s - .1, .6);
        if (np > 0) {
          const full = 'আমার পেনশনের টাকা থেইকা তিন হাজার রাখলাম। ফ্রিজের ডেলিভারি চার্জটা এইখান থেইকা দিস।';
          const w1 = span(l24, 'আমার', 'রাখলাম'), w2 = l25.words;
          const all = w1.concat(w2);
          let shown = '';
          all.forEach((w, i) => { const p = P(t, w.s - .05, .3); if (p <= 0) return; const jit = noise1(i * 7.3) * 2.5; shown += `<span style="display:inline-block;opacity:${eo(p)};transform:translate(${jit}px,${noise1(i * 3.1) * 3}px) rotate(${noise1(i * 1.7) * 2}deg);clip-path:inset(0 ${(1 - eo(p)) * 100}% 0 0)">${w.w.replace(/["“”—]/g, '')}</span> `; });
          h += at(120, 240, `<div style="width:800px;min-height:440px;background:#FFFDF5;border:5px solid ${INK};box-shadow:12px 14px 0 rgba(0,0,0,.2);padding:40px 44px;transform:rotate(-3deg) scale(${lerp(.7, 1, back(np))});opacity:${clamp(np * 3)};background-image:repeating-linear-gradient(0deg,transparent 0 63px,rgba(47,91,255,.18) 63px 65px)">
            <div class="N" style="font-size:64px;color:#1E2A6E;line-height:1.5">${shown}</div>
            <div class="abs" style="left:310px;top:-26px;width:110px;height:44px;background:rgba(255,210,63,.75);transform:rotate(4deg)"></div></div>`);
          h += blk(1120, kt(t, span(l24, 'তার', 'চিরকুট'), { font: 'B', size: 44, cls: 'k', hl: { 'কাঁপা': 'mkW' } }));
        }
        return h;
      }
    });
  }

  // =============== 9. COLD HANDS: THIS ISN'T MONEY ================================
  {
    const l26 = L('আমার হাত-পা'), l27 = L('এইটা টাকা না'), l28 = L('এইটা ছিল নিজের'), l29 = L('উনি আসলে ডেলিভারি');
    cue(l26.s - .2, 'frost', .8); cue(l27.s - .03, 'impact', 1); cue(T(l28, 'অস্তিত্বটা'), 'heartbeat', .6); cue(T(l28, 'শেষ'), 'heartbeat', .5); cue(T(l29, 'অকেজো'), 'stamp', .9);
    add({
      a: l26.s - .35, tr: 'pop', flat: '#9AD7FF', accent: BL, dotCol: 'rgba(255,255,255,.35)', dotCorner: 2, draw(t) {
        let h = '';
        // frost on the edges
        const fr = eo(P(t, l26.s, 1.2)) * (1 - P(t, l27.s, .6) * .6);
        h += `<div class="abs" style="inset:0;box-shadow:inset 0 0 ${160 * fr}px ${40 * fr}px rgba(255,255,255,.9)"></div>`;
        h += blk(230, kt(t, l26.words, { size: 72, cls: 'stk', hl: { 'ঠান্ডা': 'stkY' }, out: l27.s - .1 }));
        const hn = P(t, l26.s - .1, .6) * (1 - P(t, l27.s - .1, .4));
        if (hn > 0) { let ns = ''; for (let i = 0; i < 3; i++) ns += `<div class="abs" style="left:${300 + i * 30}px;top:${560 - i * 20}px;width:420px;height:200px;background:linear-gradient(135deg,#E9C98A,#D9A95F);border:6px solid ${INK};border-radius:12px;transform:rotate(${-6 + i * 5 + Math.sin(t * 30) * .6}deg)"><div class="abs H" style="left:20px;top:14px;font-size:50px">১০০০</div></div>`;
          h += `<div style="opacity:${eo(hn)};filter:hue-rotate(160deg) saturate(.6)">${ns}</div>` + svgBox(1080, 1350, `<ellipse cx="300" cy="830" rx="90" ry="60" fill="#B07E5A" stroke="${INK}" stroke-width="6"/><ellipse cx="780" cy="820" rx="90" ry="60" fill="#B07E5A" stroke="${INK}" stroke-width="6"/>`, 0, 0, `opacity:${eo(hn)}`); }
        h += blk(400, `<div style="${shake(t, l27.s, 22)}">` + kt(t, l27.words, { size: 170, cls: 'stk', hl: { 'না': 'stkR' }, slam: ['টাকা'], out: l28.s - .1 }) + '</div>');
        h += blk(180, kt(t, span(l28, 'এইটা', 'রাখার'), { font: 'B', size: 46, cls: 'k', hl: { 'অস্তিত্বটা': 'mkW' }, out: l29.s - .1 }));
        h += blk(260, kt(t, span(l28, 'জন্য', 'চেষ্টা'), { size: 84, cls: 'stk', hl: { 'শেষ': 'stkY', 'চেষ্টা': 'stkY' }, out: l29.s - .1 }));
        // flickering flame = last effort
        if (t > l28.s && t < l29.s + .2) { const f = 1 + noise1(t * 10) * .15; h += svgBox(300, 400, `<path d="M150 ${60 / f} q90 120 0 240 q-90 -120 0 -240z" fill="${Y}" stroke="${INK}" stroke-width="6"/><path d="M150 180 q34 50 0 110 q-34 -60 0 -110z" fill="${R}"/><rect x="110" y="300" width="80" height="90" fill="#fff" stroke="${INK}" stroke-width="6"/>`, 390, 600, `opacity:${eo(P(t, l28.s, .5))}`); }
        h += blk(180, kt(t, span(l29, 'উনি', 'যে'), { font: 'B', size: 44, cls: 'k' }));
        const sp = P(t, T(l29, 'অকেজো') - .05, .4);
        h += st(pose(CH.abba2('tense'), { eyes: blink(t) }), 540, 1340, 1.0, { t, t0: l29.s - .2 });
        if (sp > 0) h += at(300, 560, `<div class="H" style="font-size:100px;color:${R};border:9px solid ${R};padding:0 40px 16px;background:rgba(255,255,255,.85);transform:rotate(-12deg) scale(${lerp(2.4, 1, eo5(sp))});opacity:${clamp(sp * 3)}"><s>অকেজো</s></div>`);
        h += blk(1180, kt(t, l29.words.slice(l29.words.indexOf(wd(l29, 'আমারে'))), { size: 54, cls: 'stk', hl: { 'অকেজো': 'stkR', 'এখনো': 'stkY' } }));
        return h;
      }
    });
  }

  // =============== 10. THE PRIDE THAT CRUSHES ====================================
  {
    const l30 = L('আমরা সন্তানরা'), l31 = L('কিন্তু এই সংসার');
    const tPress = T(l31, 'পিষা');
    cue(l30.s - .3, 'whoosh', .6); cue(T(l30, 'চালাই'), 'fanfare', .7); cue(tPress - .5, 'riser', .6); cue(tPress, 'crush', 1);
    add({
      a: l30.s - .35, tr: 'bars', flat: Y, accent: R, dotCorner: 0, draw(t) {
        let h = '';
        const pr = eo5(P(t, tPress - .3, .5));
        // son with crown, giant
        const crown = `<g transform="translate(200 46)"><path d="M-60 0 L-60 -50 L-30 -20 L0 -60 L30 -20 L60 -50 L60 0Z" fill="${Y}" stroke="${INK}" stroke-width="6"/></g>`;
        h += st(pose(CH.son('smile', 'idle') + crown, { eyes: blink(t, 2) }), 300, 1350, 1.25, { t, t0: l30.s });
        h += blk(170, kt(t, span(l30, 'আমরা', 'বলি'), { font: 'B', size: 44, cls: 'k', out: l31.s - .1 }));
        h += blk(240, kt(t, span(l30, 'এখন', 'চালাই'), { font: 'Q', size: 86, cls: 'stk', hl: { 'সংসার': 'stkY' }, keepQuotes: false, out: l31.s - .1 }));
        // the hydraulic press of "pride" crushing self-respect
        const C = P(t, l31.s - .2, .5);
        if (C > 0) {
          const ph = lerp(-260, 760, pr);
          const sq = 1 - pr * .8;
          h += `<div style="opacity:${eo(C)}">` + svgBox(1080, 1350, `<rect x="640" y="-20" width="40" height="${Math.max(0, ph + 40)}" fill="${INK}"/><g transform="translate(560 ${ph})"><rect x="0" y="0" width="420" height="110" rx="10" fill="${R}" stroke="${INK}" stroke-width="7"/><text x="210" y="74" font-family="H" font-size="54" text-anchor="middle" fill="#fff">অহংকার</text></g>
            <g transform="translate(770 1100) scale(1 ${sq})"><rect x="-200" y="-200" width="400" height="200" rx="16" fill="#fff" stroke="${INK}" stroke-width="7"/><text x="0" y="-80" font-family="H" font-size="56" text-anchor="middle" fill="${INK}">আত্মসম্মান</text></g>
            <rect x="520" y="1100" width="500" height="30" fill="${INK}"/>`, 0, 0, shake(t, tPress, 18));
          h += blk(170, kt(t, span(l31, 'কিন্তু', 'নিচে'), { font: 'B', size: 44, cls: 'k', hl: { 'অহংকারের': 'mkR' } }), 'text-align:left;padding-right:420px');
          h += blk(300, kt(t, span(l31, 'আমরা', 'না'), { size: 60, cls: 'stk', hl: { 'আত্মসম্মানটা': 'stkY', 'পিষা': 'stkR' }, lh: 1.25 }), 'text-align:left;padding-right:420px');
          h += '</div>';
        }
        return h;
      }
    });
  }

  // =============== 11. THE GUEST IN HIS OWN HOUSE ================================
  {
    const l32 = L('যেই মানুষটা তিরিশ');
    const tGuest = T(l32, 'অতিথি'), items = [T(l32, 'থাকার'), T(l32, 'তিন'), T(l32, 'সিদ্ধান্ত')];
    cue(l32.s - .3, 'whoosh', .6); cue(T(l32, 'তিরিশ'), 'pop', .5); cue(tGuest - .05, 'ding', .8); cue(items[0], 'tick', .5); cue(items[1], 'tick', .5); cue(items[2] + .3, 'buzzer', .7);
    add({
      a: l32.s - .35, tr: 'pop', flat: MI, accent: R, dotCorner: 2, blob: ['rgba(255,255,255,.16)', 200, 1000, 300], draw(t) {
        let h = '';
        const hp = P(t, l32.s, 1.0);
        h += svgBox(1080, 1350, `<g opacity="${eo(hp)}" transform="translate(0 130)"><path d="M560 480 L790 300 L1020 480" fill="${R}" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/><rect x="600" y="480" width="380" height="420" fill="#fff" stroke="${INK}" stroke-width="8"/><rect x="740" y="700" width="100" height="200" fill="${BL}" stroke="${INK}" stroke-width="6"/><rect x="640" y="540" width="80" height="80" fill="${Y}" stroke="${INK}" stroke-width="6"/><rect x="860" y="540" width="80" height="80" fill="${Y}" stroke="${INK}" stroke-width="6"/></g>`, 0, 0);
        h += sticker(t, T(l32, 'তিরিশ'), tag('৩০ বছরের ঘাম', Y, INK, 38), 620, 1060, -3);
        // abba with a guest badge
        const gp = P(t, tGuest - .1, .5);
        h += st(pose(CH.abba2('tense'), { eyes: blink(t) }) + (gp > 0 ? `<g transform="translate(150 300) rotate(-8) scale(${lerp(2, 1, eo5(gp))})" opacity="${clamp(gp * 3)}"><rect x="-70" y="-34" width="140" height="68" rx="10" fill="#fff" stroke="${INK}" stroke-width="5"/><text y="12" font-family="H" font-size="34" text-anchor="middle" fill="${R}">অতিথি</text></g>` : ''), 300, 1340, 1.1, { t });
        const row = (t0, txt, ok, y) => { const p = P(t, t0 - .05, .4); if (p <= 0) return ''; return at(600, y, `<div style="display:flex;align-items:center;gap:16px;opacity:${eo(p)};transform:translateX(${(1 - eo(p)) * 60}px)"><div style="width:58px;height:58px;border-radius:14px;border:5px solid ${INK};background:${ok ? '#3DBE64' : R};display:flex;align-items:center;justify-content:center;color:#fff;font:700 40px sans-serif">${ok ? '✓' : '✕'}</div><span class="H" style="font-size:40px">${txt}</span></div>`); };
        h += row(items[0], 'থাকার ঘর', 1, 1130) + row(items[1], 'তিন বেলা খাবার', 1, 1200) + row(items[2], 'সিদ্ধান্তের ভোট', 0, 1270);
        h += blk(160, kt(t, span(l32, 'যেই', 'ফেলি'), { size: 46, cls: 'stk', hl: { 'অতিথি': 'stkR' }, slam: ['অতিথি'], lh: 1.25 }));
        return h;
      }
    });
  }

  // =============== 12. THE DAY FATHERS DIE + END CARD ============================
  {
    const l33 = L('আমাদের দেশের বাবারা'), l34 = L('বাবারা মরে সেইদিন');
    const tQ = T(l34, 'আমি'), endA = l34.e + 1.2;
    cue(l33.s - .3, 'drone_dark', .9); cue(T(l33, 'না'), 'hit', .6); cue(T(l34, 'মরে'), 'impact', .9); cue(tQ - .2, 'whisper', .5); cue(l34.e + .1, 'mute', .9); cue(endA, 'end_note', 1);
    add({
      a: l33.s - .35, tr: 'black', td: .8, flat: '#111111', dotCol: 'rgba(255,255,255,.05)', draw(t) {
        let h = '';
        const B = 1 - P(t, endA - .2, .8);
        if (B > 0) {
          const lv = t < l34.e ? .1 + Math.abs(noise1(t * 6)) * .1 : 0;
          h += `<div style="opacity:${B}">`;
          h += meter(lv, 350, 220, 1.0, { bg: '#fff', style: `transform:scale(1.1)` });
          h += blk(470, kt(t, l33.words, { size: 84, cls: 'wt', hl: { 'মরে': 'stkR' }, out: l34.s - .1 }));
          h += blk(440, kt(t, span(l34, 'বাবারা', 'সেইদিন'), { size: 96, cls: 'wt', hl: { 'মরে': 'stkR' } }));
          h += blk(600, kt(t, span(l34, 'যেইদিন', 'হয়'), { font: 'B', size: 44, cls: 'wt' }));
          // the small, trembling thought
          const qp = P(t, tQ - .1, .5);
          if (qp > 0) h += at(150, 760, `<div style="width:780px;border:4px dashed #fff;border-radius:40px;padding:24px 34px 30px;opacity:${eo(qp)};transform:translateX(${noise1(t * 20) * 2}px)"><div class="Q" style="font-size:52px;color:#fff;text-align:center">${kt(t, span(l34, 'আমি', 'তো'), { font: 'Q', size: 52, cls: 'wt', keepQuotes: false, hl: { 'বিরক্ত': 'mkY' } })}</div></div>`);
          h += '</div>';
        }
        const E = P(t, endA, 1.2);
        if (E > 0) {
          h += `<div class="abs" style="inset:0;background:${Y};opacity:${eo(E)}"></div>
            <div class="abs" style="left:0;right:0;top:520px;text-align:center;opacity:${eo(P(t, endA + .4, .8))};transform:scale(${lerp(.8, 1, back(P(t, endA + .4, .9)))})">
              <div style="display:inline-block;padding:18px 54px 26px;background:${INK};border-radius:80px;transform:rotate(-3deg);box-shadow:12px 14px 0 rgba(0,0,0,.25)"><span style="font:italic 600 110px Fr;color:#fff">The Unsaid</span></div>
              <div class="H" style="font-size:56px;color:${INK};margin-top:34px;opacity:${eo(P(t, endA + 1.2, .8))}">যা কেউ বলে না</div></div>`;
        }
        return h;
      }, noBrandAfter: endA
    });
  }

  const last = SCN[SCN.length - 1];
  window.STAGEFX = t => { document.getElementById('brand').style.opacity = t > last.noBrandAfter ? String(1 - clamp((t - last.noBrandAfter) / .6)) : '1'; };
  window.SECTIONS = SCN.map(s => s.a);
  window.FREEZE = { a: 1e6, d: 0 };
  defineScenes(SCN);
  window.READY = false;
  document.fonts.ready.then(() => { renderFrame(0); window.READY = true; });
})();
