// "The Unsaid" — episode 3: the tail of the fish. Scenes are pure functions of absolute time t.
(function () {
  const { P, lerp, eo, eo5, ei, eio, back, spring, hash, noise1, bn, bnMoney, S, wd, span, kt, blk, at, ap, ch, pose, blink, dr, clamp } = K;
  const CH = window.CHAR;
  const AM = '#E8A33D', TE = '#6FB8AC', RU = '#D2583D', PA = '#F2EBDD', DM = '#8D93A3';
  const L = S, T = (line, w, n) => wd(line, w, n).s;
  const svgBox = (w, h, inner, x, y, extra = '') => `<svg class="abs" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="left:${x}px;top:${y}px;${extra}">${inner}</svg>`;
  const shake = (t, t0, amp = 14, d = 0.45) => { const p = P(t, t0, d); if (p <= 0 || p >= 1) return ''; const a = amp * (1 - p); return `transform:translate(${(noise1(t * 60) * a).toFixed(1)}px,${(noise1(t * 60 + 9) * a).toFixed(1)}px)`; };
  const SCN = [], add = o => SCN.push(o);
  const steam = (x, y, t, k = 3) => { let s = ''; for (let i = 0; i < k; i++) { const ph = (t * .7 + i / k) % 1; s += `<path d="M${x + (i - 1) * 22} ${y - ph * 70} q-10 -16 0 -32 q10 -16 0 -32" stroke="${PA}" stroke-width="4" fill="none" stroke-linecap="round" opacity="${(Math.sin(ph * Math.PI) * .5).toFixed(2)}"/>`; } return s; };
  const chip = (t, t0, label, col, x, y, size = 44) => { const p = P(t, t0 - .05, .45); if (p <= 0) return ''; return at(x, y, `<div class="H" style="font-size:${size}px;color:${col};border:3px solid ${col};border-radius:60px;padding:6px 28px 12px;white-space:nowrap;background:rgba(10,13,20,.55);opacity:${eo(p)};transform:scale(${lerp(.5, 1, back(p))})">${label}</div>`); };
  // dining table front view, cloth to the floor
  function table(t, y) {
    return `<defs><linearGradient id="tc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9D1C2"/><stop offset=".25" stop-color="#A8A090"/><stop offset="1" stop-color="#3A362F"/></linearGradient></defs>
      <rect x="30" y="${y - 8}" width="1020" height="${1360 - y}" fill="url(#tc)"/><path d="M30 ${y - 8} H1050 V${y + 18} H30Z" fill="#E7E0D3"/><path d="M30 ${y + 120} H1050" stroke="${AM}" stroke-width="3" opacity=".45"/>`;
  }
  // plate with a fish piece. kind may be null
  function plate(x, y, kind, p = 1, label = '', col = PA, glow = 0) {
    if (p <= 0) return '';
    return `<g transform="translate(${x} ${y})" opacity="${clamp(p * 2)}"><ellipse rx="120" ry="32" fill="#EDE6DA"/><ellipse rx="92" ry="22" fill="#F7F2EA"/>
      ${glow > 0 ? `<ellipse rx="110" ry="40" fill="${AM}" opacity="${glow * .25}"/>` : ''}
      ${kind ? `<g transform="translate(0 -12) scale(${lerp(.4, 1, eo(p))})">${CH.piece(kind)}</g>` : ''}
      ${label ? `<text y="78" font-family="H" font-size="42" text-anchor="middle" fill="${col}">${label}</text>` : ''}</g>`;
  }
  // round 5-second timer. p: 0..1 elapsed
  function timer(cx, cy, r, p, col = RU) {
    const n = Math.max(0, Math.ceil(5 * (1 - p) - 1e-6));
    const a = 2 * Math.PI * (1 - p), x = cx + r * Math.sin(a), y = cy - r * Math.cos(a);
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="rgba(10,13,20,.6)" stroke="#2A3247" stroke-width="12"/>
      ${p < 1 ? `<path d="M${cx} ${cy - r} A${r} ${r} 0 ${1 - p > .5 ? 1 : 0} 1 ${x.toFixed(1)} ${y.toFixed(1)}" fill="none" stroke="${col}" stroke-width="12" stroke-linecap="round"/>` : ''}
      <text x="${cx}" y="${cy + r * .38}" font-family="H" font-size="${r * 1.05}" text-anchor="middle" fill="${PA}">${bn(n)}</text>`;
  }
  // quiz card with blank
  const card = (t, t0, q, x, y, w = 820, blankCol = DM) => {
    const p = P(t, t0 - .1, .5); if (p <= 0) return '';
    const cur = Math.floor(t * 2) % 2 ? 1 : 0;
    return at(x, y, `<div style="width:${w}px;padding:22px 34px 28px;background:rgba(242,235,221,.06);border:2px solid #3A4258;border-radius:18px;opacity:${eo(p)};transform:translateX(${(1 - eo5(p)) * -80}px)">
      <div class="B" style="font-size:38px;color:${DM}">${q}</div>
      <div style="display:flex;align-items:center;gap:10px;margin-top:10px"><div style="flex:1;border-bottom:4px dashed ${blankCol};height:46px"></div><div style="width:4px;height:50px;background:${TE};opacity:${cur}"></div></div></div>`);
  };

  // =============== 1. THE 5-SECOND QUIZ =========================================
  {
    const l0 = L('আপনি কি পাঁচ'), l1 = L('পছন্দের রঙ'), l2 = L('কিংবা বিয়ের'), l3 = L('পারবেন না'), l4 = L('আমিও পারতাম');
    const tStart = T(l0, 'পাঁচ'), tEnd = l3.s;
    cue(.05, 'drone_in', .8); cue(T(l0, 'পাঁচ') - .05, 'impact_soft', .7);
    for (let k = 0; k < 9; k++) { const tt = tStart + .4 + k * ((tEnd - tStart - .4) / 9); cue(tt, 'clock', .45); }
    cue(T(l0, 'খাবারের'), 'pop', .4); cue(l1.s, 'pop', .4); cue(T(l2, 'বিয়ের'), 'pop', .4); cue(l3.s - .03, 'buzzer', .9); cue(l4.s, 'thud', .5);
    add({
      a: 0, tr: 'cut', bg: ['#1B2233', '#0F1420', '#070A10'], draw(t) {
        let h = '';
        const tp = clamp((t - tStart) / (tEnd - tStart));
        const flash = P(t, tEnd, .6);
        h += svgBox(1080, 400, timer(540, 200, 140, t < tStart ? 0 : tp, flash > 0 ? RU : AM), 0, 150, `opacity:${eo(P(t, tStart - .3, .5))};${shake(t, tEnd, 16)}`);
        if (flash > 0 && flash < 1) h += `<div class="abs" style="inset:0;background:${RU};opacity:${(1 - flash) * .25}"></div>`;
        h += blk(560, kt(t, span(l0, 'আপনি', 'পারবেন'), { font: 'B', size: 46, color: DM, out: l3.s - .1 }));
        h += card(t, T(l0, 'মায়ের'), 'মায়ের সবচেয়ে পছন্দের খাবার', 130, 650);
        h += card(t, l1.s, 'পছন্দের রং', 130, 840);
        h += card(t, T(l2, 'বিয়ের'), 'বিয়ের আগে কী হইতে চাইছিলেন', 130, 1030);
        if (t > l3.s - .1) h += `<div class="abs" style="inset:0;background:rgba(6,8,12,${.6 * eo(P(t, l3.s - .1, .3))})"></div>` + blk(600, kt(t, l3.words, { size: 150, hl: { 'না': 'ru glowR' }, slam: ['পারবেন'] }) + kt(t, l4.words, { size: 70, color: DM }));
        return h;
      }
    });
  }

  // =============== 2. WHAT WE BELIEVE ===========================================
  {
    const l5 = L('আমাদের সবার ধারণা'), l6 = L('হাঁড়ির তলার'), l7 = L('আর ঈদে নতুন'), l8 = L('আমরা খুব গর্ব');
    cue(l5.s - .3, 'whoosh', .6); [T(l5, 'লেজ'), T(l6, 'ঠান্ডা'), T(l7, 'শাড়ি')].forEach(x => cue(x - .05, 'type', .5)); cue(T(l8, 'মায়েরা'), 'shimmer', .5);
    add({
      a: l5.s - .35, tr: 'wipe', draw(t) {
        let h = '';
        h += blk(170, kt(t, span(l5, 'আমাদের', 'ধারণা'), { font: 'B', size: 46, color: DM }));
        const row = (y, t0, label, icon) => { const p = P(t, t0 - .1, .45); if (p <= 0) return ''; return at(110, y, `<div style="display:flex;align-items:center;gap:30px;opacity:${eo(p)};transform:translateX(${(1 - eo(p)) * -60}px)">
          <svg width="150" height="110" viewBox="0 0 150 110">${icon}</svg><div class="H" style="font-size:64px">${label}</div></div>`); };
        const tailIcon = `<g transform="translate(70 55) scale(1.4)">${CH.piece('tail')}</g>`;
        const potIcon = `<path d="M20 30 h110 l-10 60 q-2 14 -16 14 h-58 q-14 0 -16 -14z" fill="#3A3F4A" stroke="${PA}" stroke-width="4"/><ellipse cx="75" cy="88" rx="40" ry="10" fill="${PA}"/><path d="M40 70 q30 14 70 0" stroke="#9FB3C2" stroke-width="3" fill="none"/>`;
        const sariIcon = `<path d="M20 20 h90 v70 h-90z" fill="#9C5A63"/><path d="M20 80 h90" stroke="${AM}" stroke-width="8"/><path d="M95 15 l45 85 M140 15 l-45 85" stroke="${RU}" stroke-width="9" stroke-linecap="round" opacity="${eo(P(t, T(l7, 'না'), .3))}"/>`;
        h += row(330, T(l5, 'লেজ'), 'মাছের <span class="am">লেজ</span>', tailIcon);
        h += row(510, T(l6, 'ঠান্ডা'), 'হাঁড়ির তলার <span class="te">ঠান্ডা ভাত</span>', potIcon);
        h += row(690, T(l7, 'শাড়ি'), 'ঈদে নতুন শাড়ি <span class="ru">না</span>', sariIcon);
        h += blk(920, kt(t, span(l8, 'আমরা', 'বলি'), { font: 'B', size: 44, color: DM }));
        h += blk(990, kt(t, span(l8, 'মায়েরা', 'না'), { font: 'Q', size: 66, hl: { 'কিচ্ছু': 'am glowA', 'এমনই': 'am' }, keepQuotes: false }));
        return h;
      }
    });
  }

  // =============== 3. THE PERFORMANCE ===========================================
  {
    const l9 = L('এইটা মায়ের স্বভাব'), l10 = L('এইটা পঁচিশ বছর'), l11 = L('আর এই অভিনয়ের');
    cue(l9.s - .1, 'hit', .7); cue(T(l10, 'অভিনয়') - .4, 'curtain', .9); cue(T(l10, 'পঁচিশ'), 'impact_soft', .6); cue(T(l11, 'দর্শক'), 'applause', .45);
    add({
      a: l9.s - .35, tr: 'cut', bg: ['#2A1416', '#140B0E', '#070406'], draw(t) {
        let h = '';
        const open = eio(P(t, T(l10, 'অভিনয়') - .6, 1.4));
        // spotlight + amma on stage
        h += `<div class="abs" style="left:240px;top:0;width:600px;height:1100px;background:radial-gradient(40% 60% at 50% 70%,rgba(255,226,170,${.3 * open}),transparent 70%)"></div>`;
        h += ch(pose(CH.amma('smile', 'idle'), { eyes: blink(t, 2) }), 540, 1060, .95, { t, op: open });
        h += svgBox(1080, 1350, `<rect x="120" y="1060" width="840" height="30" fill="#4A2E22"/>`, 0, 0);
        // curtains
        const cw = lerp(560, 120, open);
        const cur = (x, w, flip) => `<path d="M${x} 120 h${w} v960 q${flip ? '' : '-'}40 -20 ${flip ? '' : '-'}0 0 h${-w}z" fill="#7A1E24"/>${[0, 1, 2, 3].map(i => `<path d="M${x + (i + .5) * w / 4} 120 V1080" stroke="#5A1418" stroke-width="10"/>`).join('')}`;
        h += svgBox(1080, 1350, `<rect x="0" y="80" width="1080" height="70" fill="#5A1418"/>${cur(0, cw)}${cur(1080 - cw, cw, 1)}`, 0, 0);
        // audience heads
        let aud = ''; for (let i = 0; i < 7; i++) aud += `<circle cx="${110 + i * 145}" cy="1230" r="54" fill="#0B0C10"/><rect x="${50 + i * 145}" y="1260" width="120" height="120" rx="40" fill="#0B0C10"/>`;
        h += svgBox(1080, 1350, aud, 0, 0, `opacity:${eo(P(t, l11.s - .2, .6))}`);
        h += blk(170, `<div style="position:relative;display:inline-block">${kt(t, l9.words, { size: 76, hl: { 'স্বভাব': 'pa' }, out: l10.s - .2 })}</div>`);
        h += blk(170, kt(t, span(l10, 'এইটা', 'চলা'), { font: 'B', size: 44, color: DM, hl: { 'পঁচিশ': 'am' }, out: l11.s - .1 }) + kt(t, span(l10, 'একটা', 'অভিনয়'), { size: 96, hl: { 'নিখুঁত': 'am', 'অভিনয়': 'ru glowR' }, slam: ['অভিনয়'], out: l11.s - .1 }));
        h += blk(170, kt(t, span(l11, 'আর', 'সবচেয়ে'), { font: 'B', size: 44, color: DM }) + kt(t, span(l11, 'সুবিধাবাদী', 'আমরা'), { size: 92, hl: { 'সুবিধাবাদী': 'am glowA', 'আমরা': 'ru' } }));
        return h;
      }
    });
  }

  // =============== 4. WHO GETS WHICH PIECE ======================================
  {
    const l12 = L('আমার মায়ের ক্ষেত্রেও'), l13 = L('ছোটবেলা থেইকা দেখছি'), l14 = L('আর আম্মা নিজের প্লেটে');
    const tCut = T(l13, 'ইলিশ'), tHead = T(l13, 'মাথা'), tBelly = T(l13, 'পেটি'), tTail = T(l14, 'লেজটা');
    cue(l12.s - .3, 'swoosh', .6); cue(tCut + .3, 'knife', .8); cue(tCut + .7, 'knife', .7); cue(tHead, 'whoosh', .5); cue(tHead + .4, 'plate', .6); cue(tBelly, 'whoosh', .5); cue(tBelly + .4, 'plate', .6); cue(tTail + .3, 'plate', .35);
    add({
      a: l12.s - .35, tr: 'zoom', bg: ['#1E2230', '#10141E', '#06080D'], draw(t) {
        let h = '';
        h += blk(170, kt(t, l12.words, { font: 'B', size: 46, color: DM, out: l13.s - .1 }));
        h += blk(170, kt(t, span(l13, 'ছোটবেলা', 'হইলে'), { font: 'B', size: 44, color: DM, hl: { 'ইলিশ': 'pa' } }));
        const fp = P(t, tCut - .3, .8), cut = P(t, tCut + .3, .6), sp = eo(P(t, tCut + .8, .5));
        // fish: pieces leave as they're served
        const goneH = P(t, tHead, .7), goneB = P(t, tBelly, .7), goneT = P(t, tTail, .8);
        let fish = CH.ilish(cut, sp);
        h += svgBox(640, 220, fish, 220, 330, `opacity:${eo(fp) * (1 - goneT)};transform:scale(${lerp(.8, 1, eo(fp))})`);
        // plates
        const py = 900;
        let pl = '';
        pl += plate(220, py, goneH > .5 ? 'head' : null, P(t, tHead - .3, .5), 'আব্বা', PA);
        pl += plate(540, py, goneB > .5 ? 'belly' : null, P(t, tBelly - .3, .5), 'আমরা', AM, goneB);
        pl += plate(860, py, goneT > .5 ? 'tail' : null, P(t, tTail - .5, .5), 'আম্মা', TE);
        h += svgBox(1080, 1350, pl, 0, 0);
        // flying pieces
        const fly = (k, p, x0, y0, x1, y1) => { if (p <= 0 || p >= 1) return ''; const x = lerp(x0, x1, eio(p)), y = lerp(y0, y1, eio(p)) - Math.sin(p * Math.PI) * 140; return `<g transform="translate(${x} ${y}) rotate(${p * 360})">${CH.piece(k)}</g>`; };
        h += svgBox(1080, 1350, fly('head', goneH, 300, 440, 220, 888) + fly('belly', goneB, 520, 440, 540, 888) + fly('tail', goneT, 800, 440, 860, 888), 0, 0);
        h += blk(1060, kt(t, span(l13, 'আব্বার', 'গাদা'), { size: 54, hl: { 'মাথা': 'pa', 'পেটি': 'am glowA', 'গাদা': 'am' }, out: l14.s - .1 }));
        h += blk(1060, kt(t, l14.words, { size: 72, hl: { 'লেজটা': 'te glowT' } }));
        return h;
      }
    });
  }

  // =============== 5. "WHY ONLY THE TAIL?" ======================================
  {
    const l15 = L('একদিন জিজ্ঞেস'), l16 = L('আম্মা হাসি দিয়া'), l17 = L('পেটিতে বেশি চর্বি'), l18 = L('আমি খুব সহজেই'), l19 = L('কারণ কথাটা বিশ্বাস');
    cue(l15.s - .3, 'swoosh', .5); cue(l16.s, 'shimmer', .3); cue(T(l18, 'বিশ্বাস'), 'tick', .4); cue(T(l19, 'আমারই'), 'lock', .8);
    add({
      a: l15.s - .35, tr: 'slide', bg: ['#231E19', '#12121A', '#07080C'], glow: ['#F2C98A', 540, 600, 520, .1], draw(t) {
        let h = '';
        const A = 1 - P(t, l18.s - .3, .5);
        if (A > 0) {
          h += `<div style="opacity:${A}">`;
          h += ch(pose(CH.son('neutral', 'idle'), { eyes: blink(t, 1) }), 270, 1300, .95, { t });
          h += ch(pose(CH.amma(t > l16.s ? 'smile' : 'neutral', 'idle'), { eyes: blink(t, 2) }), 780, 1300, 1.0, { t });
          h += blk(170, kt(t, span(l15, 'একদিন', 'করছিলাম'), { font: 'B', size: 44, color: DM, out: l16.s - .1 }));
          h += blk(240, kt(t, span(l15, 'আম্মা', 'কেন'), { font: 'Q', size: 72, hl: { 'লেজ': 'te' }, keepQuotes: false, out: l16.s - .1 }));
          h += blk(170, kt(t, span(l16, 'আম্মা', 'বলছিলেন'), { font: 'B', size: 44, color: DM }));
          h += blk(240, kt(t, span(l16, 'আমার', 'বাবা'), { font: 'Q', size: 70, hl: { 'লেজই': 'te glowT' }, keepQuotes: false, out: l17.s - .1 }));
          h += blk(240, kt(t, l17.words, { font: 'Q', size: 70, hl: { 'চর্বি': 'pa' }, keepQuotes: false }));
          h += '</div>';
        }
        const B = P(t, l18.s - .3, .5);
        if (B > 0) {
          const lk = P(t, T(l19, 'আমারই') - .1, .4);
          h += `<div style="opacity:${B}">` + svgBox(1080, 1350, plate(540, 760, 'belly', 1, 'পেটি', AM, eo(lk)) + (lk > 0 ? `<g transform="translate(640 700) scale(${lerp(2, 1, eo5(lk))})" opacity="${clamp(lk * 3)}"><rect x="-28" y="-6" width="56" height="44" rx="8" fill="${AM}"/><path d="M-16 -6 v-14 a16 16 0 0 1 32 0 v14" stroke="${AM}" stroke-width="8" fill="none"/></g>` : ''), 0, 0, 'transform:scale(1.4);transform-origin:540px 760px');
          h += blk(260, kt(t, l18.words, { size: 70, hl: { 'সহজেই': 'am' }, out: l19.s - .1 }));
          h += blk(200, kt(t, span(l19, 'কারণ', 'করলে'), { font: 'B', size: 46, color: DM }));
          h += blk(1000, kt(t, span(l19, 'আমার', 'থাকে'), { size: 88, hl: { 'পেটিটা': 'am glowA', 'আমারই': 'am glowA' }, slam: ['আমারই'] }));
          h += '</div>';
        }
        return h;
      }
    });
  }

  // =============== 6. KHALA AT THE TABLE ========================================
  {
    const l20 = L('মুখোশটা খুলল'), l21 = L('দুপুরের খাবার'), l22 = L('অভ্যাসমতো আম্মা');
    cue(l20.s - .3, 'whoosh', .6); cue(T(l20, 'খালা'), 'door', .6); cue(T(l21, 'ইলিশ'), 'plate', .5); [0, .5, 1].forEach(x => cue(T(l22, 'ভালো') + x, 'plate', .35));
    add({
      a: l20.s - .35, tr: 'iris', bg: ['#231E19', '#12121A', '#07080C'], glow: ['#F2C98A', 540, 500, 600, .12], draw(t) {
        let h = '';
        const ty = 880;
        h += ch(pose(CH.khala('smile', 'idle'), { eyes: blink(t, 3) }), 200, 1250, .95, { t, t0: T(l20, 'খালা') - .2, fromX: -200 });
        h += ch(pose(CH.amma('smile', 'idle'), { eyes: blink(t, 1), armR: [t > T(l22, 'লেজটা') - .4 ? 'rotate(-30deg)' : '', '0% 0%'] }), 480, 1250, .95, { t, t0: l21.s - .3 });
        h += ch(pose(CH.son('smile', 'idle'), { eyes: blink(t, 2) }), 740, 1300, .88, { t, t0: l21.s - .2 });
        h += ch(pose(CH.abba2('smile'), { eyes: blink(t, 4) }), 940, 1300, .88, { t, t0: l21.s - .1 });
        const served = [P(t, T(l22, 'ভালো'), .5), P(t, T(l22, 'ভালো') + .5, .5), P(t, T(l22, 'ভালো') + 1, .5)];
        h += svgBox(1080, 1350, table(t, ty) + `<g transform="translate(540 ${ty + 20})" opacity="${eo(P(t, T(l21, 'ইলিশ') - .2, .5))}"><ellipse rx="170" ry="34" fill="#EDE6DA"/><g transform="translate(-150 -60) scale(.48)">${CH.ilish(1, .4)}</g></g>` + steam(540, ty - 40, t) +
          plate(200, ty + 30, served[0] > .5 ? 'belly' : null, served[0] > 0 ? 1 : 0) + plate(760, ty + 30, served[1] > .5 ? 'belly' : null, served[1] > 0 ? 1 : 0) + plate(940, ty + 30, served[2] > .5 ? 'head' : null, served[2] > 0 ? 1 : 0), 0, 0);
        h += blk(170, kt(t, span(l20, 'মুখোশটা', 'বছর'), { size: 76, hl: { 'মুখোশটা': 'ru glowR' }, out: T(l20, 'যখন') - .1 }));
        h += blk(170, kt(t, span(l20, 'যখন', 'আসলেন'), { font: 'B', size: 46, hl: { 'খালা': 'pa' }, out: l21.s - .1 }));
        h += blk(170, kt(t, l21.words, { font: 'B', size: 46, hl: { 'ইলিশ': 'pa' }, out: l22.s - .1 }));
        h += blk(170, kt(t, span(l22, 'অভ্যাসমতো', 'দিয়া'), { font: 'B', size: 44, color: DM, hl: { 'ভালো': 'am' } }));
        h += blk(240, kt(t, span(l22, 'নিজের', 'গেলেন'), { size: 70, hl: { 'লেজটা': 'te glowT' } }));
        return h;
      }
    });
  }

  // =============== 7. KHALA GRABS HER HAND + FLASHBACK ===========================
  {
    const l23 = L('ঠিক তখনই খালা'), l24 = L('অবাক হইয়া'), l25 = L('ছোটবেলায় তো মাছের'), l26 = L('বাবার সাথে ঝগড়া');
    const tGrab = T(l23, 'ধইরা'), tThrow = T(l25, 'ছুইড়া');
    cue(tGrab - .03, 'impact', 1.0); cue(l24.s, 'hit', .4); cue(l25.s - .2, 'sepia', .7); cue(tThrow, 'plate_crash', .9); cue(T(l26, 'দুই'), 'impact_soft', .6);
    add({
      a: l23.s - .35, tr: 'cut', bg: ['#231E19', '#12121A', '#07080C'], draw(t) {
        let h = '';
        // close-up: two hands, the tail piece between them
        const gp = P(t, tGrab - .15, .3);
        const A = 1 - P(t, l25.s - .3, .5);
        if (A > 0) {
          h += `<div style="opacity:${A};${shake(t, tGrab, 18)}">` + svgBox(1080, 1350, `${plate(540, 860, 'tail', 1)}
            <g transform="translate(${lerp(-200, 330, eo5(gp))} 700) rotate(20)"><rect x="-260" y="-36" width="300" height="72" rx="30" fill="#5E7A4A"/><ellipse cx="60" cy="0" rx="70" ry="52" fill="#B17B57"/></g>
            <g transform="translate(700 760) rotate(-20)"><rect x="0" y="-34" width="360" height="68" rx="30" fill="#9C5A63"/><ellipse cx="-20" cy="0" rx="60" ry="46" fill="#B17B57"/><path d="M-60 -10 h-40" stroke="#B17B57" stroke-width="22" stroke-linecap="round"/></g>`, 0, 0);
          h += blk(200, kt(t, span(l23, 'ঠিক', 'ফালাইলেন'), { size: 76, hl: { 'হাতটা': 'pa', 'ধইরা': 'ru glowR' }, slam: ['ধইরা'], out: l24.s - .1 }));
          h += blk(200, kt(t, span(l24, 'অবাক', 'বললেন'), { font: 'B', size: 44, color: DM }));
          h += blk(270, kt(t, span(l24, 'এই', 'কেন'), { font: 'Q', size: 84, hl: { 'লেজ': 'te glowT' }, keepQuotes: false }));
          h += '</div>';
        }
        // flashback: young amma, sepia polaroid
        const B = P(t, l25.s - .3, .6);
        if (B > 0) {
          const th = P(t, tThrow - .1, .9);
          h += `<div style="opacity:${eo(B)}"><div class="abs" style="left:150px;top:300px;width:780px;height:740px;background:#EFE6D2;padding:26px 26px 110px;box-sizing:border-box;transform:rotate(-3deg) scale(${lerp(.9, 1, eo(B))});box-shadow:0 30px 70px rgba(0,0,0,.6)">
            <div class="abs" style="left:26px;top:26px;right:26px;bottom:110px;background:linear-gradient(180deg,#8A6A45,#4A3826);overflow:hidden;filter:sepia(.7) contrast(1.05)">
              ${ch(pose(CH.bon('stern'), { arms: [`rotate(${lerp(0, -40, eo(th))}deg)`, '50% 0%'] }), 260, 720, .95, { t })}
              ${svgBox(728, 604, `<g transform="translate(${lerp(300, 640, eo(th))} ${lerp(420, 160, Math.sin(th * Math.PI))}) rotate(${th * 540})" opacity="${th > 0 && th < 1 ? 1 : 0}"><ellipse rx="70" ry="20" fill="#E9E1D0"/><ellipse rx="52" ry="12" fill="#F3DFA2"/></g>`, 0, 0)}</div>
            <div class="abs B" style="left:0;right:0;bottom:30px;text-align:center;font-size:44px;color:#4A3826">ছোটবেলার আম্মা</div></div>`;
          h += blk(170, kt(t, span(l25, 'ছোটবেলায়', 'মারতি'), { font: 'Q', size: 60, hl: { 'পেটি': 'am glowA', 'থালা': 'te', 'ছুইড়া': 'te glowT' }, keepQuotes: false, out: l26.s - .1 }));
          h += blk(170, kt(t, l26.words, { font: 'Q', size: 64, hl: { 'দুই': 'te glowT', 'দিন': 'te glowT' }, keepQuotes: false }));
          h += '</div>';
        }
        return h;
      }
    });
  }

  // =============== 8. FIVE SECONDS OF SILENCE (key moment) =======================
  const FIVE = (() => { const l = L('ডাইনিং টেবিলটা পাঁচ'); return { a: l.e + .05, d: 5.0 }; })();
  window.FREEZE = { a: FIVE.a, d: 0.01 };
  window.FIVE = FIVE;
  {
    const l27 = L('ডাইনিং টেবিলটা পাঁচ'), l28 = L('আম্মার মুখটা'), l29 = L('খুব তাড়াতাড়ি'), l30 = L('বয়স হইসে না');
    cue(l27.s - .2, 'cut_silence', 1); cue(T(l27, 'চুপ'), 'hit', .6);
    for (let k = 0; k < 5; k++) cue(FIVE.a + k, 'clock', .8);
    cue(FIVE.a, 'silence_zone', 1);
    cue(T(l29, 'শুকনা'), 'shimmer', .3);
    add({
      a: l27.s - .35, tr: 'dissolve', bg: ['#1A1A22', '#0E0F15', '#050508'], draw(t) {
        let h = '';
        const fp = P(t, FIVE.a, FIVE.d);
        const flush = eo(P(t, l28.s, 3.0)) * (1 - .6 * eo(P(t, l29.s + 1, 2)));
        const z = lerp(1.7, 2.2, eio(P(t, l27.s, 10)));
        h += `<div class="abs" style="left:0;top:0;width:1080px;height:1350px;transform:scale(${z});transform-origin:540px 540px">` +
          ch(pose(CH.ammaFlush(t > l29.s + .6 ? 'smile' : 'neutral', flush), { eyes: t > FIVE.a && t < FIVE.a + FIVE.d ? '' : blink(t, 1) }), 540, 1150, 1.0, { t }) + '</div>';
        h += `<div class="abs" style="left:0;right:0;bottom:0;height:520px;background:linear-gradient(0deg,rgba(6,8,12,.96) 40%,transparent)"></div>`;
        // the 5-second ring
        if (t > FIVE.a - .3 && t < FIVE.a + FIVE.d + .6) h += svgBox(260, 260, timer(130, 130, 100, fp, RU), 790, 120, `opacity:${eo(P(t, FIVE.a - .3, .3)) * (1 - P(t, FIVE.a + FIVE.d, .5))}`);
        h += blk(180, kt(t, span(l27, 'ডাইনিং', 'গেল'), { size: 64, hl: { 'পাঁচ': 'ru glowR', 'সেকেন্ডের': 'ru glowR', 'চুপ': 'pa' }, out: l28.s - .1 }), 'padding-right:300px');
        h += blk(980, kt(t, span(l28, 'আম্মার', 'গেল'), { size: 70, hl: { 'লাল': 'ru glowR' }, out: T(l28, 'যেন') - .1 }));
        h += blk(980, kt(t, span(l28, 'যেন', 'গেসেন'), { font: 'B', size: 50, hl: { 'চুরি': 'ru', 'ধরা': 'ru' }, out: l29.s - .1 }));
        h += blk(980, kt(t, span(l29, 'খুব', 'বললেন'), { font: 'B', size: 44, color: DM, hl: { 'শুকনা': 'pa' }, out: T(l29, 'আরে') - .1 }));
        h += blk(980, kt(t, span(l29, 'আরে', 'লাগে'), { font: 'Q', size: 66, keepQuotes: false, out: l30.s - .1 }));
        h += blk(980, kt(t, l30.words, { font: 'Q', size: 90, hl: { 'বয়স': 'am' }, keepQuotes: false }));
        const vg = P(t, FIVE.a, .3) * (1 - P(t, FIVE.a + FIVE.d, .6));
        return `<div style="filter:saturate(${1 - vg * .5})">${h}</div>` + (vg > 0 ? `<div class="abs" style="inset:40px;border:2px solid rgba(242,235,221,${.4 * vg})"></div>` : '');
      }
    });
  }

  // =============== 9. FROM HUMAN TO GODDESS =======================================
  {
    const l31 = L('ওই পাঁচ সেকেন্ড'), l32 = L('সেদিন আমি প্রথম'), l33 = L('আমরা মায়েরে দেবী');
    const tDebi = T(l33, 'দেবী');
    cue(l31.s, 'heartbeat', .7); cue(l31.s + .9, 'heartbeat', .6); cue(T(l32, 'মানুষ'), 'erase', .6); cue(tDebi - .1, 'choir', .8); cue(tDebi, 'impact_soft', .6);
    add({
      a: l31.s - .35, tr: 'black', td: .8, bg: ['#191B26', '#0D0F16', '#050609'], draw(t) {
        let h = '';
        const A = 1 - P(t, l32.s - .3, .5);
        if (A > 0) {
          const beat = 1 + Math.max(0, Math.sin((t - l31.s) * Math.PI * 2 / .9)) ** 8 * .06;
          h += `<div style="opacity:${A}">` + svgBox(1080, 1350, `<g transform="translate(540 640) scale(${beat})"><path d="M0 -60 c-40 -70 -170 -50 -170 40 0 90 170 190 170 190 s170 -100 170 -190 c0 -90 -130 -110 -170 -40z" fill="none" stroke="${RU}" stroke-width="8"/>
            <text y="70" font-family="H" font-size="160" text-anchor="middle" fill="${RU}">${bn(5)}</text></g>`, 0, 0);
          h += blk(1000, kt(t, l31.words, { size: 64, hl: { 'পাঁচ': 'ru', 'বুকের': 'pa' } }));
          h += '</div>';
        }
        const B = P(t, l32.s - .3, .6);
        if (B > 0) {
          const g = P(t, tDebi - .2, 1.2);
          const rays = [...Array(16)].map((_, i) => { const a = i / 16 * Math.PI * 2 + t * .1; return `<line x1="${540 + Math.cos(a) * 120}" y1="${520 + Math.sin(a) * 120}" x2="${540 + Math.cos(a) * (220 + 60 * eo(g))}" y2="${520 + Math.sin(a) * (220 + 60 * eo(g))}" stroke="${AM}" stroke-width="5" opacity="${.6 * eo(g)}"/>`; }).join('');
          h += `<div style="opacity:${eo(B)}">`;
          h += svgBox(1080, 1350, `<circle cx="540" cy="520" r="${130 * eo(g)}" fill="none" stroke="${AM}" stroke-width="8" opacity="${eo(g)}"/>${rays}
            <path d="M300 1250 h480 l-40 -120 h-400z" fill="#3A3226" stroke="${AM}" stroke-width="4" opacity="${eo(g)}"/>${[0, 1, 2, 3, 4, 5].map(i => `<circle cx="${360 + i * 72}" cy="1130" r="16" fill="${['#E8A33D', '#D2583D', '#F2EBDD'][i % 3]}" opacity="${eo(P(t, tDebi + i * .1, .4))}"/>`).join('')}`, 0, 0);
          h += `<div class="abs" style="left:0;top:${lerp(0, -110, eo(g))}px;width:1080px;height:1350px">` + ch(pose(CH.amma('smile', 'idle'), { eyes: blink(t, 2) }), 540, 1240, .95, { t, filter: `drop-shadow(0 0 ${30 * eo(g)}px rgba(232,163,61,.6))` }) + '</div>';
          const st = P(t, T(l32, 'দেখি') + .1, .4);
          h += blk(170, kt(t, span(l32, 'সেদিন', 'পাইলাম'), { font: 'B', size: 44, color: DM, out: l33.s - .1 }));
          h += blk(230, `<div style="position:relative;display:inline-block">${kt(t, span(l32, 'আমরা', 'নাই'), { size: 54, hl: { 'মানুষ': 'te glowT' }, out: l33.s - .1 })}<div class="abs" style="left:0;top:50%;height:6px;background:${RU};width:${st * 100}%;opacity:${1 - P(t, l33.s - .1, .35)}"></div></div>`);
          h += blk(190, kt(t, span(l33, 'আমরা', 'রাখছি'), { size: 72, hl: { 'দেবী': 'am glowA' }, slam: ['দেবী'] }));
          h += '</div>';
        }
        return h;
      }
    });
  }

  // =============== 10. A GODDESS HAS NO WANTS ====================================
  {
    const l34 = L('কারণ দেবীর'), l35 = L('দেবীর ক্ষুধা'), l36 = L('মানুষরে ভালোবাসতে'), l37 = L('কিন্তু দেবীরে');
    const items = [[l34, 'শখ'], [l35, 'ক্ষুধা'], [l35, 'ক্লান্তি'], [l35, 'লোভ']];
    items.forEach(([l, w]) => cue(T(l, w), 'tick', .5));
    [T(l36, 'জায়গা'), T(l36, 'শখ'), T(l36, 'ছাড়')].forEach(x => cue(x, 'pop', .45));
    cue(T(l37, 'সস্তা'), 'hit', .6); cue(T(l37, 'ফেসবুকে'), 'type', .5); for (let k = 0; k < 4; k++) cue(T(l37, 'শ্রেষ্ঠ') + k * .2, 'like', .35); cue(T(l37, 'দায়িত্ব'), 'stamp', .9);
    add({
      a: l34.s - .35, tr: 'zoom', bg: ['#1A1C26', '#0E1017', '#05060A'], draw(t) {
        let h = '';
        const A = 1 - P(t, l37.s - .3, .5);
        if (A > 0) {
          h += `<div style="opacity:${A}">`;
          h += blk(170, kt(t, span(l34, 'কারণ', 'না'), { size: 60, hl: { 'দেবীর': 'am', 'শখ': 'pa' } }));
          // amber column: the goddess lacks these
          const x1 = (lbl, t0, y) => { const p = P(t, t0, .4); if (p <= 0) return ''; return at(110, y, `<div style="display:flex;align-items:center;gap:20px;opacity:${eo(p)}"><svg width="54" height="54"><path d="M8 8 L46 46 M46 8 L8 46" stroke="${RU}" stroke-width="8" stroke-linecap="round"/></svg><span class="H" style="font-size:58px;color:${AM}">${lbl}</span></div>`); };
          items.forEach(([l, w], i) => { h += x1(w, T(l, w) - .05, 330 + i * 120); });
          h += at(110, 280, `<div class="B dm" style="font-size:34px">দেবী</div>`);
          // teal column: a human needs these
          const ok = (lbl, t0, y) => { const p = P(t, t0, .4); if (p <= 0) return ''; return at(600, y, `<div style="display:flex;align-items:center;gap:20px;opacity:${eo(p)};transform:translateX(${(1 - eo(p)) * 40}px)"><svg width="54" height="54"><path d="M8 28 L22 44 L48 10" stroke="${TE}" stroke-width="8" fill="none" stroke-linecap="round"/></svg><span class="H" style="font-size:52px;color:${TE}">${lbl}</span></div>`); };
          if (t > l36.s - .2) h += at(600, 280, `<div class="B dm" style="font-size:34px">মানুষ</div>`);
          h += ok('জায়গা দেওয়া', T(l36, 'জায়গা'), 330) + ok('শখ পূরণ', T(l36, 'শখ'), 450) + ok('নিজের ভাগ ছাড়া', T(l36, 'ছাড়'), 570);
          h += blk(1080, kt(t, span(l35, 'পছন্দের', 'না'), { font: 'B', size: 46, hl: { 'পেটি': 'am', 'লোভ': 'am' }, out: l36.s - .1 }));
          h += blk(1080, kt(t, span(l36, 'মানুষরে', 'হয়'), { font: 'B', size: 46, hl: { 'মানুষরে': 'te' } }));
          h += '</div>';
        }
        const B = P(t, l37.s - .3, .5);
        if (B > 0) {
          const cp = P(t, T(l37, 'ফেসবুকে') - .2, .6), likes = Math.round(eo5(P(t, T(l37, 'শ্রেষ্ঠ'), 2)) * 3100), sp = P(t, T(l37, 'দায়িত্ব') - .05, .35);
          h += `<div style="opacity:${B}">`;
          h += blk(170, kt(t, span(l37, 'কিন্তু', 'সস্তা'), { size: 64, hl: { 'সস্তা': 'ru glowR' }, slam: ['সস্তা'] }));
          h += blk(300, kt(t, span(l37, 'বছরে', 'দিয়া'), { font: 'B', size: 44, color: DM }));
          if (cp > 0) h += at(220, 420, `<div style="width:640px;background:#F4F1EA;color:#1C1714;border-radius:22px;padding:26px 30px;opacity:${eo(cp)};transform:translateY(${(1 - eo5(cp)) * 120}px) rotate(-2deg);box-shadow:0 30px 70px rgba(0,0,0,.5)">
            <div style="display:flex;align-items:center;gap:16px"><svg viewBox="140 60 120 120" width="64" height="64" style="overflow:hidden;border-radius:50%;background:#2B3245">${CH.son('smile', 'idle')}</svg><div><div class="H" style="font-size:34px">আমি</div><div class="B" style="font-size:24px;color:#7A7268">মা দিবস</div></div></div>
            <div style="margin:18px 0;height:300px;border-radius:12px;background:linear-gradient(180deg,#3A3226,#1C1A16);position:relative;overflow:hidden"><svg class="abs" viewBox="0 0 400 760" width="300" height="570" style="left:170px;top:20px">${CH.amma('smile', 'idle')}</svg></div>
            <div class="Q" style="font-size:44px">মা পৃথিবীর শ্রেষ্ঠ সম্পদ ❤</div>
            <div class="H" style="font-size:30px;color:${RU};margin-top:10px">♥ ${bnMoney(likes)}</div></div>`);
          if (sp > 0) h += at(500, 1000, `<div class="H" style="font-size:72px;color:${RU};border:7px solid ${RU};padding:4px 34px 14px;transform:rotate(-8deg) scale(${lerp(2.4, 1, eo5(sp))});opacity:${clamp(sp * 3)};background:rgba(10,8,8,.7)">দায়িত্ব শেষ ✓</div>`);
          h += '</div>';
        }
        return h;
      }
    });
  }

  // =============== 11. THE MIRROR ================================================
  {
    const l38 = L('সবচেয়ে ভয়ংকর ব্যাপার'), l39 = L('আম্মা নিজেও');
    cue(l38.s - .3, 'drone_dark', .8); cue(T(l39, 'ভুইলা'), 'erase', .7); cue(T(l39, 'মানুষ'), 'shimmer', .3);
    add({
      a: l38.s - .35, tr: 'leak', td: .9, bg: ['#161A24', '#0C0F16', '#040508'], draw(t) {
        let h = '';
        const fade = eo(P(t, T(l39, 'ভুইলা') - .2, 2.4));
        // mirror frame: amma outside, young girl inside fading away
        h += `<div class="abs" style="left:520px;top:300px;width:420px;height:720px;border-radius:210px 210px 20px 20px;border:12px solid #8A7A62;background:linear-gradient(160deg,#2A3346,#141A26);overflow:hidden">
          <div class="abs" style="left:250px;top:40px;width:40px;height:640px;background:rgba(255,255,255,.08);transform:rotate(18deg)"></div>
          <svg class="abs" viewBox="0 0 400 760" width="400" height="760" style="left:10px;top:40px;opacity:${1 - fade * .95};filter:blur(${fade * 6}px)">${CH.bon('neutral')}</svg></div>`;
        h += ch(pose(CH.amma('neutral', 'idle'), { eyes: blink(t, 2) }), 290, 1320, 1.05, { t });
        h += blk(170, kt(t, l38.words, { size: 76, hl: { 'ভয়ংকর': 'ru glowR' } }));
        h += blk(1100, kt(t, span(l39, 'আম্মা', 'যে'), { font: 'B', size: 50, hl: { 'ভুইলা': 'ru' } }) + kt(t, span(l39, 'উনি', 'ছিলেন'), { size: 76, hl: { 'মানুষ': 'te glowT' } }));
        return h;
      }
    });
  }

  // =============== 12. THE PIECE COMES BACK =======================================
  {
    const l40 = L('ওই ঘটনার পর'), l41 = L('আম্মা খানিকক্ষণ'), l42 = L('তারপর আস্তে'), l43 = L('আমার আসলেই');
    const tGive = T(l40, 'তুইলা'), tBack = T(l42, 'ফেরত');
    cue(tGive - .3, 'whoosh', .5); cue(tGive + .1, 'plate', .6); cue(l41.s, 'drone_dark', .5); cue(tBack - .3, 'slide', .7); cue(tBack + .2, 'plate', .5); cue(l43.s, 'piano_soft', .6);
    add({
      a: l40.s - .35, tr: 'slide', bg: ['#231E19', '#12121A', '#07080C'], glow: ['#F2C98A', 540, 820, 520, .12], draw(t) {
        let h = '';
        const go = eio(P(t, tGive - .3, .8)), ret = eio(P(t, tBack - .3, 1.4));
        const look = eio(P(t, l41.s, 2.5));
        h += ch(pose(CH.amma('neutral', 'idle'), { eyes: [t > l41.s && t < tBack ? 'translateY(4px) scaleY(.6)' : blink(t, 2)], head: [`rotate(${lerp(0, 10, look) * (1 - ret)}deg)`, '50% 90%'] }), 300, 1250, 1.0, { t });
        h += ch(pose(CH.son('neutral', 'idle'), { eyes: blink(t, 1) }), 800, 1300, .95, { t });
        // two plates; the belly piece travels to amma and back
        const bx = lerp(lerp(760, 320, go), 760, ret), by = 960 - Math.sin(go * Math.PI) * 90 * (1 - ret) - Math.sin(ret * Math.PI) * 30;
        const glow = (go >= 1 && ret <= 0) ? .7 + .3 * Math.sin(t * 3) : 0;
        h += svgBox(1080, 1350, table(t, 900) + plate(320, 960, null, 1, 'আম্মা', TE, glow) + plate(760, 960, null, 1, 'আমি', AM) + `<g transform="translate(${bx} ${by - 12}) scale(1.1)">${CH.piece('belly')}</g>`, 0, 0);
        h += blk(170, kt(t, span(l40, 'ওই', 'তুইলা'), { font: 'B', size: 44, color: DM, hl: { 'পেটিটা': 'am', 'জোর': 'pa' }, out: l41.s - .1 }));
        h += blk(170, kt(t, l41.words, { size: 70, hl: { 'খানিকক্ষণ': 'te' }, out: l42.s - .1 }));
        h += blk(170, kt(t, span(l42, 'তারপর', 'বললেন'), { font: 'B', size: 44, color: DM, hl: { 'ফেরত': 'ru' }, out: T(l42, 'থাক') - .1 }));
        h += blk(170, kt(t, span(l42, 'থাক', 'খা'), { font: 'Q', size: 96, keepQuotes: false, out: l43.s - .1 }));
        h += blk(170, kt(t, l43.words, { font: 'Q', size: 66, hl: { 'আসলেই': 'te' }, keepQuotes: false }));
        return h;
      }
    });
  }

  // =============== 13. FORGETTING TO WANT + APPLAUSE ==============================
  {
    const l44 = L('আমি সেদিন বুঝছিলাম'), l45 = L('আর আমরা সেই');
    const tForget = T(l44, 'ভুইলা'), tClap = T(l45, 'হাততালি');
    cue(l44.s - .3, 'whoosh', .5); for (let k = 0; k < 6; k++) cue(l44.s + .4 + k * .45, 'tick', .25); cue(T(l45, 'মহান'), 'choir', .6); cue(tClap - .1, 'applause', .9);
    add({
      a: l44.s - .35, tr: 'iris', bg: ['#141A22', '#0C1016', '#05070A'], draw(t) {
        let h = '';
        // a teal "wish" light that dims year after year
        const yp = P(t, l44.s + .2, tForget - l44.s + .8);
        const year = Math.round(lerp(1999, 2024, yp));
        const glowA = 1 - eo(yp);
        const A = 1 - P(t, l45.s - .2, .5);
        if (A > 0) {
          h += `<div style="opacity:${A}">` + svgBox(1080, 1350, `<circle cx="540" cy="560" r="${40 + 160 * glowA}" fill="${TE}" opacity="${.12 * glowA}"/><circle cx="540" cy="560" r="${30 + 50 * glowA}" fill="${TE}" opacity="${.3 * glowA + .05}"/><circle cx="540" cy="560" r="26" fill="${glowA > .05 ? TE : '#3A4258'}"/>`, 0, 0);
          h += blk(720, `<div class="H" style="font-size:90px;color:${DM};font-variant-numeric:tabular-nums">${bn(year)}</div><div class="B dm" style="font-size:36px">চাওয়া</div>`);
          h += blk(170, kt(t, span(l44, 'আমি', 'বুঝছিলাম'), { font: 'B', size: 44, color: DM }));
          h += blk(240, kt(t, span(l44, 'দীর্ঘদিন', 'যায়'), { size: 68, hl: { 'চাইতে': 'te glowT', 'ভুইলা': 'ru' } }));
          h += '</div>';
        }
        const B = P(t, l45.s - .2, .5);
        if (B > 0) {
          const pp = P(t, T(l45, 'মহান') - .2, .7);
          h += `<div style="opacity:${B}">`;
          h += blk(170, kt(t, span(l45, 'আর', 'যাওয়াটারেই'), { font: 'B', size: 46, color: DM }));
          if (pp > 0) h += blk(440, `<div style="display:inline-block;padding:30px 60px 44px;border:8px double ${AM};background:linear-gradient(180deg,#3A2E18,#1E180E);transform:scale(${lerp(1.3, 1, eo5(pp))});opacity:${eo(pp)};box-shadow:0 0 60px rgba(232,163,61,.35)"><div class="Q am glowA" style="font-size:96px">“মায়ের মহান ত্যাগ”</div></div>`);
          // clapping hands
          if (t > tClap - .2) for (let i = 0; i < 8; i++) { const ph = Math.abs(Math.sin((t - tClap) * 12 + i)); const x = 90 + i * 125, y = 1000 + (i % 2) * 70; h += svgBox(120, 120, `<g transform="translate(60 60)"><ellipse cx="${-12 - ph * 14}" cy="0" rx="22" ry="36" fill="#B17B57" transform="rotate(-15)"/><ellipse cx="${12 + ph * 14}" cy="0" rx="22" ry="36" fill="#9E6845" transform="rotate(15)"/></g>`, x - 60, y, `opacity:${eo(P(t, tClap - .2 + i * .05, .3)) * .9}`); }
          h += blk(1230, kt(t, span(l45, 'নাম', 'দেই'), { font: 'B', size: 46, hl: { 'হাততালি': 'pa' } }));
          h += '</div>';
        }
        return h;
      }
    });
  }

  // =============== 14. WHO WAS SHE? + END CARD ====================================
  {
    const l46 = L('একটা মানুষের সাথে'), l47 = L('তার হাতের রান্না');
    const tWho = T(l47, 'মা'), endA = l47.e + 1.0;
    cue(l46.s - .3, 'swoosh', .5); cue(T(l46, 'পঁচিশ'), 'impact_soft', .6); cue(tWho - .2, 'riser', .5); cue(T(l47, 'কে'), 'impact', .7); cue(endA, 'end_note', 1);
    add({
      a: l46.s - .35, tr: 'black', td: .9, bg: ['#1B2233', '#0F1420', '#070A10'], draw(t) {
        let h = '';
        const B = 1 - P(t, endA - .2, .8);
        if (B > 0) {
          h += `<div style="opacity:${B}">`;
          // roof over 25 years
          const rp = P(t, l46.s, 1.2);
          h += svgBox(1080, 400, `<path d="M180 300 L540 80 L900 300" fill="none" stroke="${PA}" stroke-width="8" stroke-linejoin="round" ${dr(rp)}/>`, 0, 360, `opacity:${1 - P(t, tWho - .7, .5)}`);
          h += ch(pose(CH.amma('smile', 'idle'), { eyes: blink(t, 2) }), 540, 1300, .8, { t, t0: l46.s, out: tWho - .7, filter: 'brightness(.8)' });
          h += blk(200, kt(t, span(l46, 'একটা', 'থাকলাম'), { size: 66, hl: { 'পঁচিশ': 'am glowA', 'বছর': 'am glowA' }, out: l47.s - .1 }));
          h += blk(170, kt(t, span(l47, 'তার', 'নিলাম'), { font: 'B', size: 44, color: DM, out: tWho - .3 }));
          h += blk(170, kt(t, span(l47, 'অথচ', 'না'), { font: 'B', size: 44, color: DM, out: tWho - .3 }), 'padding-top:60px');
          h += '';
          // the quiz cards return, still blank, next to the girl she was
          const C = P(t, tWho - .5, .7);
          if (C > 0) {
            const q = (y, lbl, t0) => { const p = P(t, t0, .4); return at(80, y, `<div style="width:520px;padding:16px 26px 22px;border:2px solid #3A4258;border-radius:16px;background:rgba(242,235,221,.05);opacity:${eo(p)}"><div class="B" style="font-size:32px;color:${DM}">${lbl}</div><div class="H" style="font-size:64px;color:${TE};line-height:1">?</div></div>`); };
            h += `<div style="opacity:${eo(C)}">`;
            h += ch(pose(CH.bon('neutral'), { eyes: blink(t, 3) }), 820, 1180, 1.0, { t, filter: `drop-shadow(0 0 30px rgba(111,184,172,.45))` });
            h += q(330, 'পছন্দের খাবার', tWho - .3) + q(530, 'পছন্দের রং', tWho) + q(730, 'কী হইতে চাইছিলেন', tWho + .3);
            h += blk(170, kt(t, span(l47, 'মা', 'ছিলেন'), { size: 58, hl: { 'মা': 'pa', 'মহিলাটা': 'te glowT', 'কে': 'te glowT' } }));
            h += '</div>';
          }
          h += '</div>';
        }
        const E = P(t, endA, 1.2);
        if (E > 0) {
          const pulse = .7 + .3 * Math.sin(t * 2);
          h += `<div class="abs" style="inset:0;background:#06080D;opacity:${eo(E)}"></div>
            <div class="abs" style="left:0;right:0;top:560px;text-align:center;opacity:${eo(P(t, endA + .5, 1))};transform:translateY(${(1 - eo(P(t, endA + .5, 1.2))) * 20}px)">
              <div style="width:18px;height:18px;border-radius:50%;background:${AM};margin:0 auto 34px;box-shadow:0 0 ${30 * pulse}px ${AM}"></div>
              <div style="font:italic 500 112px Fr;color:${PA};letter-spacing:1px">The Unsaid</div>
              <div class="B" style="font-size:44px;color:${DM};margin-top:22px;opacity:${eo(P(t, endA + 1.3, 1))}">যা কেউ বলে না</div></div>`;
        }
        return h;
      }, noBrandAfter: endA
    });
  }

  const last = SCN[SCN.length - 1];
  window.STAGEFX = t => { document.getElementById('brand').style.opacity = t > last.noBrandAfter ? String(1 - clamp((t - last.noBrandAfter) / .6)) : '1'; };
  window.SECTIONS = SCN.map(s => s.a);
  defineScenes(SCN);
  window.READY = false;
  document.fonts.ready.then(() => { renderFrame(0); window.READY = true; });
})();
