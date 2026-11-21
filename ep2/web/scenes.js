// "The Unsaid" — episode 2: the tablecloth. Scenes are pure functions of absolute time t.
(function () {
  const { P, lerp, eo, eo5, ei, eio, back, spring, hash, noise1, bn, bnMoney, S, wd, span, kt, blk, at, ap, ch, pose, blink, dr, clamp } = K;
  const CH = window.CHAR;
  const AM = '#E8A33D', TE = '#6FB8AC', RU = '#D2583D', PA = '#F2EBDD', DM = '#8D93A3';
  const L = S, T = (line, w, n) => wd(line, w, n).s;
  const svgBox = (w, h, inner, x, y, extra = '') => `<svg class="abs" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="left:${x}px;top:${y}px;${extra}">${inner}</svg>`;
  const shake = (t, t0, amp = 14, d = 0.45) => { const p = P(t, t0, d); if (p <= 0 || p >= 1) return ''; const a = amp * (1 - p); return `transform:translate(${(noise1(t * 60) * a).toFixed(1)}px,${(noise1(t * 60 + 9) * a).toFixed(1)}px)`; };
  const SCN = [], add = o => SCN.push(o);

  // ---- props ---------------------------------------------------------------
  // dining table, front view. y = table top. o: {cloth:0..1 reveal, dishes:[t0..], t}
  function table(t, y, o = {}) {
    const cp = o.cloth ?? 1, x0 = 40, x1 = 1040, w = x1 - x0;
    const sweep = ((t * .12) % 1.6) - .3;
    let s = `<rect x="${x0}" y="${y}" width="${w}" height="34" fill="#5A3E2B"/>`;
    // cloth with scalloped hem
    const hh = 1360 - y;
    s += `<g style="clip-path:inset(0 ${(1 - cp) * 100}% 0 0)"><rect x="${x0 - 10}" y="${y - 8}" width="${w + 20}" height="${hh}" fill="url(#clothg)"/>
      ${[0.25, 0.5, 0.75].map(f => `<path d="M${x0 - 10 + f * (w + 20)} ${y + 40} V${1360}" stroke="#DCD3C3" stroke-width="3"/>`).join('')}
      <path d="M${x0 - 10} ${y - 8} H${x1 + 10} V${y + 20} H${x0 - 10}Z" fill="#F7F3EC"/>
      <path d="M${x0} ${y + 120} H${x1}" stroke="#E2D9C8" stroke-width="3"/><path d="M${x0} ${y + 150} H${x1}" stroke="${AM}" stroke-width="3" opacity=".5"/>
      <rect x="${x0 + sweep * w}" y="${y - 8}" width="120" height="${hh * .45}" fill="url(#gloss)" opacity=".45"/></g>
      <defs><linearGradient id="clothg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9D1C2"/><stop offset=".25" stop-color="#A8A090"/><stop offset="1" stop-color="#3A362F"/></linearGradient><linearGradient id="gloss" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>`;
    return s;
  }
  const steam = (x, y, t, k = 3) => { let s = ''; for (let i = 0; i < k; i++) { const ph = (t * .7 + i / k) % 1; s += `<path d="M${x + (i - 1) * 22} ${y - ph * 70} q-10 -16 0 -32 q10 -16 0 -32" stroke="${PA}" stroke-width="4" fill="none" stroke-linecap="round" opacity="${(Math.sin(ph * Math.PI) * .5).toFixed(2)}"/>`; } return s; };
  function dish(kind, x, y, p, t) {
    if (p <= 0) return '';
    const sc = lerp(.3, 1, back(clamp(p))), op = clamp(p * 3);
    let g = '';
    if (kind === 'polao') g = `<ellipse cx="0" cy="0" rx="90" ry="22" fill="#E9E1D0"/><path d="M-62 -4 q62 -60 124 0z" fill="#F3DFA2"/>${[...Array(9)].map((_, i) => `<circle cx="${-40 + i * 10}" cy="${-14 - Math.sin(i) * 8}" r="3" fill="#E7C56E"/>`).join('')}${steam(0, -40, t)}`;
    if (kind === 'roast') g = `<ellipse cx="0" cy="0" rx="90" ry="22" fill="#E9E1D0"/><ellipse cx="-24" cy="-12" rx="34" ry="20" fill="#9C4E22"/><ellipse cx="26" cy="-14" rx="32" ry="19" fill="#B15E2A"/><rect x="40" y="-26" width="30" height="8" rx="4" fill="#F2EBDD" transform="rotate(-20 40 -26)"/>${steam(0, -40, t, 2)}`;
    if (kind === 'salad') g = `<path d="M-70 -10 h140 q-10 44 -70 46 q-60 -2 -70 -46z" fill="#E9E1D0"/><circle cx="-30" cy="-16" r="13" fill="${RU}"/><circle cx="0" cy="-20" r="15" fill="#7DA35A"/><circle cx="28" cy="-16" r="12" fill="${AM}"/>`;
    if (kind === 'glass') g = `<path d="M-22 -70 h44 l-6 70 h-32z" fill="rgba(190,225,235,.35)" stroke="#E6F2F5" stroke-width="3"/>`;
    if (kind === 'jug') g = `<path d="M-30 -100 h60 l-6 96 q0 10 -10 10 h-28 q-10 0 -10 -10z" fill="rgba(190,225,235,.45)" stroke="#E6F2F5" stroke-width="4"/><path d="M28 -80 q26 4 20 34 q-4 18 -22 16" fill="none" stroke="#E6F2F5" stroke-width="5"/>`;
    return `<g transform="translate(${x} ${y}) scale(${sc.toFixed(3)})" opacity="${op.toFixed(2)}">${g}</g>`;
  }
  const chip = (t, t0, label, col, x, y, size = 44) => { const p = P(t, t0 - .05, .45); if (p <= 0) return ''; return at(x, y, `<div class="H" style="font-size:${size}px;color:${col};border:3px solid ${col};border-radius:60px;padding:6px 28px 12px;white-space:nowrap;background:rgba(10,13,20,.55);opacity:${eo(p)};transform:scale(${lerp(.5, 1, back(p))})">${label}</div>`); };

  // =============== 1. THE FEAST + THE UNCLE =====================================
  {
    const l0 = L('গত শুক্রবার'), l1 = L('ডাইনিং টেবিলের মাথায়'), l2 = L('সাদা পাঞ্জাবি');
    const tDaw = T(l0, 'দাওয়াত'), tCha = T(l1, 'চাচা');
    cue(0.05, 'drone_in', .9); cue(.4, 'cloth', .9); cue(tDaw - .05, 'impact', .8);
    [.9, 1.3, 1.7, 2.1].forEach((x, i) => cue(tDaw + x * .5, 'pop', .4));
    cue(tCha - .2, 'shimmer', .5); [T(l2, 'সাদা'), T(l2, 'মুখে'), T(l2, 'গলায়')].forEach(x => cue(x, 'tick', .45));
    add({
      a: 0, tr: 'cut', bg: ['#1E2230', '#10141E', '#06080D'], glow: [AM, 540, 640, 520, .12], draw(t) {
        let h = '';
        const cp = eo(P(t, .3, 1.4));
        const ty = 900;
        // uncle rises behind the table
        const up = P(t, tCha - .3, 1.0);
        if (up > 0) h += `<div class="abs" style="left:0;top:${(1 - eo5(up)) * 240}px;width:1080px;height:1350px">${ch(pose(CH.chacha('sweet'), { eyes: blink(t, 3) }), 540, 1420, 1.5, { t })}</div>`;
        // spotlight on him
        if (up > 0) h += `<div class="abs" style="left:240px;top:0;width:600px;height:1000px;background:radial-gradient(50% 60% at 50% 40%,rgba(255,220,160,${.14 * up}),transparent 70%)"></div>`;
        const d0 = tDaw + .4;
        h += svgBox(1080, 1350, table(t, ty, { cloth: cp }) + dish('polao', 230, ty + 10, P(t, d0, .5), t) + dish('roast', 450, ty + 14, P(t, d0 + .2, .5), t) + dish('salad', 660, ty + 14, P(t, d0 + .4, .5), t) + dish('glass', 830, ty + 14, P(t, d0 + .6, .5), t) + dish('jug', 950, ty + 14, P(t, d0 + .7, .5), t), 0, 0);
        h += blk(170, kt(t, span(l0, 'গত', 'বাসায়'), { font: 'B', size: 46, color: DM, out: l1.s - .2 }));
        h += blk(240, kt(t, span(l0, 'বড়', 'ছিল'), { size: 120, hl: { 'দাওয়াত': 'am glowA' }, slam: ['দাওয়াত'], out: l1.s - .2 }));
        h += blk(170, kt(t, span(l1, 'ডাইনিং', 'আছেন'), { font: 'B', size: 44, color: DM }));
        h += blk(230, kt(t, span(l1, 'বড়', 'চাচা'), { size: 110, hl: { 'চাচা': 'am glowA' }, slam: ['চাচা'] }));
        h += chip(t, T(l2, 'সাদা'), 'সাদা পাঞ্জাবি', PA, 60, 470) + chip(t, T(l2, 'মুখে'), 'মিষ্টি হাসি', AM, 720, 430) + chip(t, T(l2, 'গলায়'), 'ভারী আত্মবিশ্বাস', AM, 650, 560);
        return h;
      }
    });
  }

  // =============== 2. THE RESPECTED MAN =========================================
  {
    const l3 = L('এই মানুষটা'), l4 = L('এলাকায়'), l5 = L('ব্যাংকের'), l6 = L('যেকোনো আত্মীয়ের');
    cue(l3.s - .3, 'whoosh', .6); cue(T(l3, 'সম্মানিত'), 'shimmer', .7);
    [l4.s, l5.s, T(l6, 'রেফারেন্স')].forEach(x => cue(x - .05, 'stamp', .55));
    add({
      a: L('এই মানুষটা').s - .35, tr: 'zoom', bg: ['#262014', '#13131A', '#07080C'], glow: [AM, 330, 600, 520, .16], draw(t) {
        let h = '';
        const fp = P(t, l3.s - .2, .8);
        // golden portrait frame
        h += `<div class="abs" style="left:70px;top:330px;width:470px;height:640px;border:12px solid ${AM};box-shadow:0 0 50px rgba(232,163,61,.35),inset 0 0 40px rgba(0,0,0,.6);background:#1B1A1E;overflow:hidden;opacity:${eo(fp)};transform:scale(${lerp(.9, 1, eo(fp))})">
          <svg class="abs" viewBox="80 20 240 440" width="470" height="862" style="left:-12px;top:-12px">${pose(CH.chacha('sweet'), { eyes: blink(t) })}</svg></div>`;
        h += blk(170, kt(t, span(l3, 'এই', 'সবচেয়ে'), { font: 'B', size: 46, color: DM }));
        // ironic quotes that wobble
        const qp = P(t, T(l3, 'সম্মানিত') - .1, .5), wob = Math.sin(t * 6) * 6 * qp;
        h += blk(230, `<div class="H" style="font-size:110px;opacity:${eo(qp)}"><span style="display:inline-block;color:${RU};transform:rotate(${-wob}deg)">“</span><span class="am glowA">সম্মানিত</span><span style="display:inline-block;color:${RU};transform:rotate(${wob}deg)">”</span></div>`);
        const card = (t0, title, sub, y) => { const p = P(t, t0 - .1, .5); if (p <= 0) return ''; return at(580, y, `<div style="width:440px;padding:22px 28px 26px;border-left:8px solid ${AM};background:rgba(232,163,61,.10);opacity:${eo(p)};transform:translateX(${(1 - eo5(p)) * 120}px)"><div class="H" style="font-size:52px">${title}</div><div class="B dm" style="font-size:34px">${sub}</div></div>`); };
        h += card(l4.s, 'সভাপতি', 'এলাকার মসজিদ কমিটি', 400);
        h += card(l5.s, 'বড় পদ', 'ব্যাংক', 600);
        h += card(T(l6, 'রেফারেন্স'), 'রেফারেন্স · তদবির', 'আত্মীয়ের যেকোনো বিপদে', 800);
        return h;
      }
    });
  }

  // =============== 3. THE SISTER RUNS IN ========================================
  {
    const l7 = L('দাওয়াত শুরুর'), l8 = L('চেহারা ফ্যাকাসে'), l9 = L('হাত কাঁপতেছে');
    const tRun = T(l7, 'ছুটে'), t17 = T(l7, 'সতেরো');
    cue(l7.s - .3, 'swoosh', .6); for (let k = 0; k < 6; k++) cue(l7.s + k * .3, 'clock', .3); cue(tRun - .2, 'whoosh', .7);
    cue(T(l7, 'সতেরো'), 'pop', .5); cue(l8.s, 'drone_dark', .7); cue(l9.s, 'heartbeat', .7); cue(l9.s + .8, 'heartbeat', .6);
    add({
      a: l7.s - .35, tr: 'wipe', bg: ['#16202A', '#0D131C', '#06090F'], draw(t) {
        let h = '';
        // rewinding clock
        const ang = -((t - l7.s) * 220);
        h += svgBox(200, 200, `<circle cx="100" cy="100" r="80" fill="none" stroke="${PA}" stroke-width="6"/><line x1="100" y1="100" x2="100" y2="40" stroke="${AM}" stroke-width="6" stroke-linecap="round" transform="rotate(${ang} 100 100)"/><line x1="100" y1="100" x2="150" y2="100" stroke="${PA}" stroke-width="7" stroke-linecap="round" transform="rotate(${ang / 12} 100 100)"/>
          <path d="M30 60 a80 80 0 0 1 40 -40" fill="none" stroke="${TE}" stroke-width="6" ${dr(P(t, l7.s, .8))}/>`, 80, 170, `opacity:${eo(P(t, l7.s - .2, .5)) * (1 - P(t, tRun, .5))}`);
        h += at(300, 210, kt(t, span(l7, 'দাওয়াত', 'আগে'), { font: 'B', size: 52, hl: { 'আধা': 'am', 'ঘণ্টা': 'am' }, out: tRun }));
        // sister
        const pale = P(t, l8.s, .8), shakeA = t > l9.s ? 7 : 0;
        const sis = pose(CH.bon('scared'), { eyes: blink(t, 2), arms: [`translateX(${(noise1(t * 40) * shakeA).toFixed(1)}px)`, '50% 0%'] });
        h += ch(sis, 560, 1300, 1.25, { t, t0: tRun - .2, dur: .5, fromX: 500, filter: `saturate(${1 - pale * .75}) brightness(${1 + pale * .15})` });
        // speed lines
        const rp = P(t, tRun - .2, .6);
        if (rp > 0 && rp < 1) for (let i = 0; i < 6; i++) h += at(700 + i * 30 + rp * 200, 560 + i * 70, `<div style="width:${180 - i * 10}px;height:4px;background:${PA};opacity:${(1 - rp) * .6}"></div>`);
        // big 17
        const sp = P(t, t17 - .1, .5);
        if (sp > 0) h += at(70, 330, `<div style="opacity:${eo(sp) * .9}"><div class="H te glowT" style="font-size:240px;line-height:1">${bn(17)}</div><div class="B dm" style="font-size:40px">বছরের ছোট বোন</div></div>`);
        h += blk(1180, kt(t, l8.words, { size: 70, hl: { 'ফ্যাকাসে': 'pa' }, out: l9.s - .1 }));
        h += blk(1180, `<div style="${t > l9.s ? `transform:translateX(${(noise1(t * 50) * 4).toFixed(1)}px)` : ''}">` + kt(t, l9.words, { size: 70, hl: { 'কাঁপতেছে': 'te glowT' } }) + '</div>');
        return h;
      }
    });
  }

  // =============== 4. THE WHISPER ===============================================
  {
    const l10 = L('আম্মা রান্নাঘরে টাইনা'), l11 = L('বোনটা ফিসফিস'), l12 = L('চাচা নাকি ফোনের'), l13 = L('কিন্তু আমাদের বাড়িতে');
    const tScream = T(l11, 'চিৎকার'), tHand = T(l12, 'গায়ে');
    cue(l10.s - .3, 'swoosh', .6); cue(T(l10, 'কী'), 'hit', .4); cue(l11.s, 'whisper', .6); cue(tScream, 'riser', .5);
    cue(T(l12, 'চার্জার'), 'tick', .4); cue(T(l12, 'খালি'), 'door', .5); cue(tHand - .05, 'impact', .9); cue(l13.s - .1, 'cut_silence', 1); cue(T(l13, 'চিৎকার'), 'flatline', .3);
    add({
      a: l10.s - .35, tr: 'slide', bg: ['#1E1A16', '#100F12', '#07070A'], draw(t) {
        let h = '';
        const A = 1 - P(t, l12.s - .3, .5);
        if (A > 0) {
          // kitchen line-art
          h += `<div style="opacity:${A}">` + svgBox(1080, 1350, `<g stroke="#5A5048" stroke-width="5" fill="none"><path d="M60 820 H1020"/><rect x="640" y="700" width="260" height="120"/><circle cx="700" cy="760" r="24"/><circle cx="840" cy="760" r="24"/><path d="M740 640 h120 v60 h-120z"/><path d="M100 420 h300 M100 520 h300"/><rect x="130" y="370" width="40" height="50"/><rect x="200" y="380" width="30" height="40"/><rect x="300" y="470" width="50" height="50"/></g>${steam(800, 620, t)}`, 0, 0);
          h += ch(pose(CH.amma('stern', 'idle'), { eyes: blink(t, 1) }), 380, 1300, 1.0, { t, t0: l10.s - .2 });
          h += ch(pose(CH.bon('scared'), { eyes: blink(t, 2), arms: [`translateX(${(noise1(t * 40) * 5).toFixed(1)}px)`, '50% 0%'] }), 700, 1300, 1.0, { t, t0: l10.s - .3, fromX: -200 });
          h += blk(180, kt(t, span(l10, 'কী', 'হইছে'), { font: 'Q', size: 96, keepQuotes: false, out: l11.s - .1 }));
          // whisper: small, spaced, faint
          h += blk(190, kt(t, span(l11, 'বোনটা', 'কইল'), { font: 'B', size: 40, color: DM, ls: '6px', mode: 'fade' }));
          const sw = P(t, tScream - .2, 1.2);
          if (sw > 0) { let w = ''; for (let i = 0; i < 60; i++) { const a = Math.abs(Math.sin(i * .7 + t * 9)) * 80 * eo(sw) * (.3 + hash(i) * .7); w += `<rect x="${i * 16}" y="${-a}" width="8" height="${a * 2}" rx="4" fill="${RU}" opacity=".75"/>`; } h += svgBox(960, 200, `<g transform="translate(0 100)">${w}</g>`, 60, 320); }
          h += blk(450, kt(t, span(l11, 'যেকোনো', 'ছিল'), { font: 'B', size: 46, hl: { 'চিৎকার': 'ru' } }));
          h += '</div>';
        }
        const B = P(t, l12.s - .3, .5) * (1 - P(t, l13.s - .2, .4));
        if (B > 0) {
          // abstract, non-graphic: an empty room's door, a charger cable, darkness closing in
          const dp = P(t, T(l12, 'খালি') - .2, 1.0);
          h += `<div style="opacity:${B}">` + svgBox(1080, 1350, `<rect x="390" y="420" width="300" height="560" fill="#0A0C12" stroke="#3A4258" stroke-width="8"/>
            <rect x="398" y="428" width="${284 * (1 - eo(dp))}" height="544" fill="#2B3245"/>
            <path d="M120 1060 q120 -80 240 0 t240 0" fill="none" stroke="${PA}" stroke-width="5" ${dr(P(t, T(l12, 'চার্জার') - .2, .8))}/><rect x="100" y="1046" width="40" height="28" rx="4" fill="${PA}" opacity="${P(t, T(l12, 'চার্জার'), .3)}"/>`, 0, 0);
          h += blk(190, kt(t, span(l12, 'চাচা', 'কইরা'), { font: 'B', size: 46, color: DM }));
          h += blk(270, kt(t, span(l12, 'ওরে', 'ডাইকা'), { font: 'B', size: 46, color: DM }));
          const hp = P(t, tHand - .05, .6);
          if (hp > 0) h += `<div class="abs" style="inset:0;background:radial-gradient(circle at 50% 50%,transparent ${lerp(70, 22, eo(hp))}%,rgba(4,5,8,.92) ${lerp(80, 40, eo(hp))}%)"></div>`;
          h += blk(1080, kt(t, span(l12, 'গায়ে', 'দিছেন'), { size: 92, hl: { 'গায়ে': 'ru glowR', 'হাত': 'ru glowR' } }));
          h += '</div>';
        }
        const C = P(t, l13.s - .2, .4);
        if (C > 0) {
          const fl = P(t, T(l13, 'চিৎকার'), .8);
          let w = ''; for (let i = 0; i < 60; i++) { const a = Math.abs(Math.sin(i * .7)) * 60 * (1 - eo(fl)) * (.3 + hash(i) * .7) + 2; w += `<rect x="${i * 16}" y="${-a}" width="8" height="${a * 2}" rx="4" fill="${DM}"/>`; }
          h += `<div style="opacity:${C}">` + svgBox(960, 200, `<g transform="translate(0 100)">${w}</g>`, 60, 760);
          h += blk(420, kt(t, span(l13, 'কিন্তু', 'বাড়িতে'), { font: 'B', size: 50, color: DM }) + kt(t, span(l13, 'কোনো', 'নাই'), { size: 120, hl: { 'চিৎকার': 'pa', 'নাই': 'ru' }, slam: ['নাই'] }));
          h += '</div>';
        }
        return h;
      }
    });
  }

  // =============== 5. THE DOOR AND THE HUSH =====================================
  {
    const l14 = L('আম্মা আগে রান্নাঘরের'), l15 = L('যাতে বাইরে'), l16 = L('তারপর বোনের'), l17 = L('কাঁদিস না'), l18 = L('উনি তোর বাপের'), l19 = L('তুই ভুল'), l20 = L('এইসব ফালতু');
    const tChup = T(l16, 'চুপ');
    cue(T(l14, 'দরজাটা'), 'door', .8); cue(T(l14, 'ভিড়ায়া'), 'thud', .7); cue(l15.s, 'whisper', .4);
    cue(tChup - .03, 'impact', 1.0); cue(l17.s, 'hit', .5); cue(l18.s, 'drone_dark', .6); cue(l19.s, 'hit', .5); cue(T(l20, 'বদনাম'), 'impact_soft', .7); cue(T(l20, 'বিয়া'), 'hit', .6);
    const quotes = [[span(l16, 'চুপ', 'কর'), { 'চুপ': 'ru glowR', 'কর': 'ru glowR' }, ['চুপ'], 150], [l17.words, { 'কাঁদিস': 'pa' }, [], 110], [l18.words, { 'বাপের': 'am', 'আদর': 'am' }, [], 70], [l19.words, { 'ভুল': 'am glowA' }, ['ভুল'], 110], [span(l20, 'এইসব', 'হবে'), { 'বদনাম': 'ru' }, [], 66], [span(l20, 'বিয়া', 'না'), { 'বিয়া': 'am' }, [], 90]];
    add({
      a: l14.s - .35, tr: 'black', td: .8, bg: ['#1A1714', '#0E0D10', '#050507'], draw(t) {
        let h = '';
        // door closing (from viewer side): panel narrows
        const dc = P(t, T(l14, 'দরজাটা') - .2, 1.2), A = 1 - P(t, l16.s - .2, .5);
        if (A > 0) {
          const w = lerp(380, 0, eio(dc));
          h += `<div style="opacity:${A}">` + svgBox(1080, 1350, `<rect x="340" y="300" width="400" height="800" fill="#0A0B10" stroke="#3A3530" stroke-width="10"/>
            <rect x="345" y="305" width="${Math.max(0, 390 - w)}" height="790" fill="rgba(242,201,138,.25)"/>
            <path d="M${345 + 390 - w} 305 h${w} v790 h${-w}z" fill="#3A2C22"/>
            <circle cx="${345 + 390 - w + 30}" cy="720" r="12" fill="${AM}" opacity="${w > 40 ? 1 : 0}"/>`, 0, 0);
          h += blk(180, kt(t, span(l14, 'আম্মা', 'দিলেন'), { font: 'B', size: 46, hl: { 'দরজাটা': 'pa' } }));
          h += blk(1160, kt(t, l15.words, { size: 72, hl: { 'কেউ': 'am', 'না': 'am' } }));
          h += '</div>';
        }
        const B = P(t, l16.s - .2, .6);
        if (B > 0) {
          // amma's hand on the sister's shoulder; sister shrinks line by line
          const n = quotes.filter(q => t > q[0][0].s - .1).length;
          const shrink = lerp(1, .78, n / quotes.length);
          h += `<div style="opacity:${B}">`;
          h += `<div class="abs" style="inset:0;background:radial-gradient(circle at 60% 60%,transparent ${lerp(60, 30, n / 6)}%,rgba(3,4,6,.85) ${lerp(75, 50, n / 6)}%)"></div>`;
          h += ch(pose(CH.amma('stern', 'idle'), { eyes: blink(t, 1), armR: ['rotate(-38deg)', '0% 0%'] }), 420, 1320, 1.1, { t });
          h += ch(pose(CH.bon('down'), { eyes: blink(t, 2), head: [`rotate(${8 + n * 2}deg)`, '50% 90%'] }), 700, 1320, 1.1 * shrink, { t, filter: `brightness(${lerp(1, .6, n / 6)})` });
          h += blk(190, kt(t, span(l16, 'তারপর', 'কইলেন'), { font: 'B', size: 42, color: DM, out: tChup - .2 }));
          quotes.forEach(([ws, hl, slam, size], i) => {
            const next = quotes[i + 1] ? quotes[i + 1][0][0].s - .15 : 1e9;
            h += blk(i === 0 ? 220 : 200, `<div style="${i === 0 ? shake(t, tChup, 18) : ''}">` + kt(t, ws, { font: 'Q', size, hl, slam, out: next, keepQuotes: false }) + '</div>');
          });
          h += '</div>';
        }
        return h;
      }
    });
  }

  // =============== 6. OUTSIDE THE DOOR ==========================================
  {
    const l21 = L('আমি দরজার বাইরে'), l22 = L('আব্বাও শুনছেন');
    cue(l21.s - .3, 'swoosh', .5); cue(l22.s, 'hit', .5);
    add({
      a: l21.s - .35, tr: 'slide', bg: ['#0F121A', '#090B11', '#040508'], dust: .4, draw(t) {
        let h = '';
        // the light from the crack of the closed kitchen door falls on two listeners
        h += `<div class="abs" style="left:520px;top:200px;width:40px;height:1000px;background:linear-gradient(180deg,rgba(242,201,138,.0),rgba(242,201,138,.55),rgba(242,201,138,.0));filter:blur(6px)"></div>
          <div class="abs" style="left:420px;top:900px;width:240px;height:400px;background:radial-gradient(50% 50% at 50% 50%,rgba(242,201,138,.25),transparent)"></div>`;
        h += ch(pose(CH.son('tense' === 'x' ? 'neutral' : 'neutral', 'idle'), { eyes: blink(t) }), 330, 1300, 1.05, { t, t0: l21.s - .2, filter: 'brightness(.55)' });
        h += ch(pose(CH.abba2('tense'), { eyes: blink(t, 2) }), 760, 1300, 1.05, { t, t0: l22.s - .3, filter: 'brightness(.55)' });
        h += blk(200, kt(t, span(l21, 'আমি', 'বাইরে'), { font: 'B', size: 46, color: DM }));
        h += blk(270, kt(t, span(l21, 'দাঁড়ায়া', 'শুনছি'), { size: 92, hl: { 'সব': 'am glowA', 'শুনছি': 'am glowA' } }));
        h += blk(400, kt(t, l22.words, { size: 92, hl: { 'আব্বাও': 'am glowA' } }));
        return h;
      }
    });
  }

  // =============== 7. THE TABLECLOTH (concept) ===================================
  {
    const l23 = L('আমাদের সমাজে একটা'), l24 = L('মানুষ ভাবে'), l25 = L('আসলে না'), l26 = L('আমাদের সমাজে সামাজিকতা');
    const tCloth = T(l26, 'টেবিলক্লথ'), tUnder = T(l26, 'নিচে'), tMeh = T(l26, 'মেহমানদের');
    cue(T(l23, 'সামাজিকতা'), 'shimmer', .8); cue(T(l24, 'ভদ্রতা'), 'pop', .4); cue(T(l24, 'মিলেমিশে'), 'pop', .4);
    cue(l25.s - .03, 'crack', 1.0); cue(l25.s, 'impact', .8);
    cue(tCloth - .1, 'cloth', 1.0); cue(T(l26, 'নোংরামি'), 'thud', .5); cue(T(l26, 'অপরাধ'), 'thud', .5); cue(T(l26, 'কান্না'), 'thud', .5); cue(T(l26, 'ঢাইকা'), 'cloth', .8); cue(tMeh, 'clink', .5);
    add({
      a: l23.s - .35, tr: 'iris', bg: ['#1B2030', '#0F131D', '#06080D'], draw(t) {
        let h = '';
        const A = 1 - P(t, l26.s - .2, .5);
        if (A > 0) {
          const cr = P(t, l25.s - .05, .5);
          h += `<div style="opacity:${A}">`;
          h += blk(260, kt(t, span(l23, 'আমাদের', 'আছে'), { font: 'B', size: 46, color: DM }));
          const sp = P(t, T(l23, 'সামাজিকতা') - .1, .9);
          if (sp > 0) h += blk(420, `<div style="position:relative;display:inline-block;opacity:${eo(sp)};transform:scale(${lerp(1.3, 1, eo(sp))})">
            <div class="H am glowA" style="font-size:150px;${cr > 0 ? `clip-path:polygon(0 0,${52 - cr * 4}% 0,${46 - cr * 6}% 100%,0 100%);transform:translate(${-cr * 30}px,${cr * 40}px) rotate(${-cr * 6}deg)` : ''}">“সামাজিকতা”</div>
            ${cr > 0 ? `<div class="H am abs" style="left:0;top:0;font-size:150px;clip-path:polygon(${52 - cr * 4}% 0,100% 0,100% 100%,${46 - cr * 6}% 100%);transform:translate(${cr * 30}px,${cr * 60}px) rotate(${cr * 8}deg)">“সামাজিকতা”</div>` : ''}
            <svg class="abs" style="left:10%;top:100%" width="80%" height="30" viewBox="0 0 400 30" preserveAspectRatio="none"><path d="M0 15 h150 l20 -10 20 20 20 -20 20 20 20 -10 h150" stroke="${AM}" stroke-width="3" fill="none" ${dr(P(t, T(l23, 'সামাজিকতা'), 1))}/></svg></div>`);
          h += chip(t, T(l24, 'ভদ্রতা'), 'ভদ্রতা', PA, 250, 760 + cr * 300, 50) + chip(t, T(l24, 'মিলেমিশে'), 'মিলেমিশে থাকা', PA, 540, 760 + cr * 360, 50);
          h += blk(1150, `<div style="${shake(t, l25.s, 16)}">` + kt(t, l25.words, { size: 130, hl: { 'না': 'ru glowR' }, slam: ['না'] }) + '</div>');
          h += '</div>';
        }
        const B = P(t, l26.s - .2, .5);
        if (B > 0) {
          // dark words lie on the table; the glossy cloth slides over them
          const ty = 640;
          const words = [['নোংরামি', 150, RU], ['অপরাধ', 440, RU], ['কান্না', 720, TE]];
          const cl = eio(P(t, T(l26, 'ঢাইকা') - .6, 1.3));
          let under = '';
          words.forEach(([w, x, c], i) => { const p = P(t, T(l26, w) - .05, .4); under += at(x, ty + 70, `<div class="H" style="font-size:78px;color:${c};opacity:${eo(p)};transform:scale(${lerp(1.6, 1, eo(p))})">${w}</div>`); });
          h += `<div style="opacity:${B}">` + `<div class="abs" style="left:40px;top:${ty}px;width:1000px;height:260px;background:#3A2A20"></div>` + under;
          // cloth sliding from the top over the words, with bumps where they lie
          const cx = lerp(-1100, 40, cl);
          const stain = P(t, tMeh + .6, 2.5);
          h += svgBox(1080, 1350, `<g opacity="${cl > 0 ? 1 : 0}"><path d="M${cx - 20} ${ty - 14} H${cx + 1020} V${ty + 300} H${cx - 20}Z" fill="#ECE6DA"/>
            ${cl > .98 ? words.map(([w, x]) => `<ellipse cx="${x + 110}" cy="${ty + 120}" rx="120" ry="26" fill="#E2DBCD"/>`).join('') : ''}
            <rect x="${cx + ((t * .2) % 1.4 - .2) * 1000}" y="${ty - 14}" width="140" height="314" fill="url(#gl2)" opacity=".7"/>
            ${words.map(([w, x, c]) => `<ellipse cx="${x + 110}" cy="${ty + 130}" rx="${70 * stain}" ry="${24 * stain}" fill="${c}" opacity="${.25 * stain}"/>`).join('')}</g>
            <defs><linearGradient id="gl2" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity="1"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>`, 0, 0);
          // dishes on top after "মেহমানদের"
          const dp = tMeh - .1;
          h += svgBox(1080, 1350, dish('polao', 260, ty + 40, P(t, dp, .5), t) + dish('roast', 540, ty + 44, P(t, dp + .2, .5), t) + dish('salad', 820, ty + 44, P(t, dp + .4, .5), t), 0, 0);
          h += blk(170, kt(t, span(l26, 'আমাদের', 'হইল'), { font: 'B', size: 44, color: DM }));
          h += blk(240, kt(t, span(l26, 'একটা', 'টেবিলক্লথ'), { size: 96, hl: { 'চকচকে': 'pa', 'টেবিলক্লথ': 'am glowA' }, slam: ['টেবিলক্লথ'] }));
          h += blk(1040, kt(t, span(l26, 'যাতে', 'হয়'), { font: 'B', size: 48, hl: { 'রুচি': 'am' } }));
          h += '</div>';
        }
        return h;
      }
    });
  }

  // =============== 8. AT THE TABLE ==============================================
  {
    const l27 = L('দশ মিনিট পর'), l28 = L('চাচা পোলাওয়ের'), l29 = L('সমাজটা একদম');
    cue(l27.s - .3, 'whoosh', .6); cue(l27.s + .3, 'clink', .4); cue(T(l28, 'রোস্ট'), 'clink', .4); cue(T(l28, 'আদব-কায়দা'), 'hit', .6); cue(T(l29, 'নষ্ট'), 'impact_soft', .6);
    add({
      a: l27.s - .35, tr: 'zoom', bg: ['#231E19', '#12121A', '#07080C'], glow: ['#F2C98A', 540, 500, 600, .12], draw(t) {
        let h = '';
        const ty = 860;
        h += ch(pose(CH.amma('neutral', 'idle'), { eyes: blink(t, 1) }), 170, 1300, .95, { t, t0: l27.s });
        h += ch(pose(CH.chacha(t > l28.s ? 'smug' : 'sweet'), { eyes: blink(t, 3), armR: [`rotate(${t > T(l28, 'রোস্ট') && t < T(l28, 'রোস্ট') + 1.2 ? -25 : 0}deg)`, '0% 0%'] }), 430, 1250, 1.08, { t, t0: l27.s - .2 });
        h += ch(pose(CH.sonJug('smile', 0), { eyes: blink(t, 2) }), 700, 1300, .95, { t, t0: l27.s + .1 });
        h += ch(pose(CH.abba2('tense'), { eyes: blink(t, 4) }), 920, 1300, .92, { t, t0: l27.s + .2 });
        h += svgBox(1080, 1350, table(t, ty) + dish('polao', 260, ty + 10, 1, t) + dish('roast', 520, ty + 14, 1, t) + dish('glass', 400, ty + 14, 1, t) + dish('glass', 800, ty + 14, 1, t), 0, 0);
        h += blk(170, kt(t, l27.words, { font: 'B', size: 46, color: DM, out: l28.s + .4 }));
        h += blk(170, kt(t, span(l28, 'বুঝলি', 'নাই'), { font: 'Q', size: 66, hl: { 'আদব-কায়দা': 'am glowA' }, keepQuotes: false, out: l29.s - .15 }));
        h += blk(180, kt(t, l29.words, { font: 'Q', size: 80, hl: { 'নষ্ট': 'am glowA' }, keepQuotes: false }));
        return h;
      }
    });
  }

  // =============== 9. THE MODERN MAN'S STATUS ===================================
  {
    const l30 = L('আমি কিন্তু আধুনিক'), l31 = L('শিক্ষিত'), l32 = L('ফেসবুকে'), l33 = L('মুখোশ পরা');
    cue(l30.s - .3, 'swoosh', .6); cue(T(l30, 'আধুনিক'), 'pop', .4); cue(l31.s, 'pop', .4); cue(l32.s, 'type', .6); for (let k = 0; k < 4; k++) cue(T(l32, 'স্ট্যাটাস') + k * .25, 'like', .35); cue(T(l33, 'মুখোশ'), 'shimmer', .4);
    add({
      a: l30.s - .35, tr: 'flash', bg: ['#151C2B', '#0D121C', '#06080D'], draw(t) {
        let h = '';
        h += ch(pose(CH.son('smile', 'phone'), { eyes: blink(t, 1) }), 230, 1320, .95, { t, t0: l30.s - .2 });
        h += chip(t, T(l30, 'আধুনিক'), 'আধুনিক', PA, 60, 300, 50) + chip(t, l31.s, 'শিক্ষিত', PA, 60, 400, 50);
        // generic social post card
        const cp = P(t, l32.s - .2, .6);
        if (cp > 0) {
          const likes = Math.round(eo5(P(t, T(l32, 'স্ট্যাটাস'), 2.5)) * 2400);
          const mp = P(t, T(l33, 'মুখোশ') - .2, .6);
          h += at(440, 300, `<div style="width:580px;background:#F4F1EA;color:#1C1714;border-radius:22px;padding:28px 30px;opacity:${eo(cp)};transform:translateY(${(1 - eo5(cp)) * 120}px);box-shadow:0 30px 70px rgba(0,0,0,.5)">
            <div style="display:flex;align-items:center;gap:16px"><svg viewBox="140 60 120 120" width="70" height="70" style="overflow:hidden;border-radius:50%;background:#2B3245">${CH.son('smile', 'idle')}</svg>
              <div><div class="H" style="font-size:36px">আমি</div><div class="B" style="font-size:24px;color:#7A7268">২ ঘণ্টা আগে</div></div></div>
            <div class="H" style="font-size:44px;line-height:1.35;margin:20px 0">অন্যায় দেখে চুপ থাকাও অন্যায়।<br><span style="color:${RU}">মুখোশ খুলে দিন।</span></div>
            ${mp > 0 ? `<svg viewBox="140 60 120 140" width="120" height="140" style="float:right;margin-top:-120px;opacity:${eo(mp)}">${CH.mask(1)}</svg>` : ''}
            <div style="border-top:2px solid #DDD5C6;padding-top:14px;font-size:32px;color:${RU}" class="H">♥ ${bnMoney(likes)}  <span style="color:#7A7268" class="B">· ${bn(Math.round(likes / 9))} শেয়ার</span></div></div>`);
        }
        h += blk(1080, kt(t, span(l32, 'অন্যায়ের', 'দিই'), { font: 'B', size: 44, hl: { 'বড়': 'am' }, out: l33.s - .1 }), 'padding-left:460px');
        h += blk(1080, kt(t, l33.words, { font: 'B', size: 44, hl: { 'জ্ঞানী': 'am', 'মুখোশ': 'pa' } }), 'padding-left:460px');
        return h;
      }
    });
  }

  // =============== 10. WHAT I SHOULD HAVE DONE ==================================
  {
    const l34 = L('চাচার ওই কথাটা'), l35 = L('ঘাড় ধইরা'), l36 = L('আমি তা করি নাই');
    cue(l34.s - .3, 'whoosh', .5); cue(T(l34, 'ছুড়ে'), 'whoosh', .7); cue(T(l35, 'ঘাড়'), 'whoosh', .6); cue(l36.s - .35, 'cut_silence', 1); cue(l36.s - .03, 'impact', 1); cue(l36.s, 'glitch', .6);
    add({
      a: l34.s - .35, tr: 'zoom', draw(t) {
        let h = '';
        const ty = 860;
        const back_ = P(t, l36.s - .05, .5); // imagination rewinds
        const gp = P(t, T(l34, 'ছুড়ে') - .1, 1.0) * (1 - back_);
        const op2 = P(t, T(l35, 'ঘাড়') - .1, .8) * (1 - back_);
        // the real scene, dim
        h += `<div style="opacity:.55">` + ch(CH.chacha('smug'), 400, 1250, 1.05, { t }) + ch(CH.sonJug('smile', 0), 720, 1300, .95, { t }) + svgBox(1080, 1350, table(t, ty) + dish('polao', 300, ty + 10, 1, t), 0, 0) + '</div>';
        // imagined: plate flying, dashed teal
        if (gp > 0) h += svgBox(1080, 1350, `<g transform="translate(${lerp(300, 820, eo(gp))} ${lerp(ty, 380, Math.sin(gp * Math.PI))}) rotate(${gp * 400})" opacity="${.9}"><ellipse rx="90" ry="22" fill="none" stroke="${TE}" stroke-width="6" stroke-dasharray="14 10"/></g>`, 0, 0);
        if (op2 > 0) h += `<div class="abs" style="left:${lerp(400, 1150, ei(op2)) - 200}px;top:${lerp(0, -40, op2)}px;width:400px;height:1300px;opacity:${(1 - op2) * .9}">` + svgBox(400, 1300, `<rect x="40" y="420" width="320" height="820" rx="40" fill="none" stroke="${TE}" stroke-width="6" stroke-dasharray="16 12"/>`, 0, 0) + '</div>';
        h += blk(180, kt(t, span(l34, 'চাচার', 'ছিল'), { font: 'B', size: 44, color: DM, out: l36.s - .1 }));
        h += blk(250, kt(t, span(l34, 'প্লেটটা', 'দেওয়া'), { size: 80, hl: { 'প্লেটটা': 'te', 'ছুড়ে': 'te glowT' }, out: l35.s - .1 }));
        h += blk(250, kt(t, l35.words, { size: 80, hl: { 'ঘাড়': 'te glowT', 'বের': 'te' }, out: l36.s - .1 }));
        if (t > l36.s - .1) h += `<div class="abs" style="inset:0;background:rgba(6,8,12,${.75 * eo(P(t, l36.s - .1, .3))})"></div>` + blk(520, `<div style="${shake(t, l36.s, 18)}">` + kt(t, l36.words, { size: 150, hl: { 'করি': 'ru glowR', 'নাই': 'ru glowR' }, slam: ['আমি'] }) + '</div>');
        return h;
      }
    });
  }

  // =============== 11. POURING THE WATER =========================================
  {
    const l37 = L('আমি জগের পানি');
    const tPour = T(l37, 'গ্লাসে'), tJi = T(l37, 'জি');
    cue(tPour - .3, 'pour', .8); cue(tJi, 'shimmer', .4);
    add({
      a: l37.s - .35, tr: 'cut', bg: ['#231E19', '#12121A', '#07080C'], draw(t) {
        let h = '';
        const pp = P(t, tPour - .4, .5) * (1 - P(t, tJi - .2, .5));
        const tilt = lerp(0, -55, eo(pp));
        h += ch(pose(CH.chacha('sweet'), { eyes: blink(t, 3) }), 280, 1260, 1.15, { t });
        h += ch(pose(CH.sonJug('smile', tilt), { eyes: blink(t, 2) }), 790, 1300, 1.15, { t });
        // glass and stream
        const fill = clamp(P(t, tPour - .2, 2.2));
        let s = `<path d="M480 860 h80 l-10 140 h-60z" fill="rgba(190,225,235,.25)" stroke="#E6F2F5" stroke-width="4"/><path d="M${490 + 0} ${1000 - fill * 120} h${60 + 0} l-${4 * (1 - fill)} ${fill * 120 - 2} h-${52}z" fill="rgba(140,200,220,.6)"/>`;
        if (pp > .5) s += `<path d="M640 ${800} q-60 10 -100 ${200 - fill * 100}" stroke="rgba(170,220,235,.85)" stroke-width="${8 + Math.sin(t * 30) * 1.5}" fill="none" stroke-linecap="round"/>`;
        h += svgBox(1080, 1350, `<rect x="40" y="1000" width="1000" height="40" fill="#F4F0E8"/>` + s, 0, 0);
        h += blk(180, kt(t, span(l37, 'আমি', 'কইলাম'), { font: 'B', size: 44, color: DM, out: tJi - .2 }));
        h += blk(190, kt(t, span(l37, 'জি', 'বলছেন'), { font: 'Q', size: 96, hl: { 'ঠিক': 'am glowA', 'বলছেন': 'am glowA' }, keepQuotes: false }));
        return h;
      }
    });
  }

  // =============== 12. THE DIRTY CALCULATION =====================================
  {
    const l38 = L('আমার ভেতরে তখন'), l39 = L('কাজ করতেছিল একটা'), l40 = L('চাচার সাথে ঝামেলা'), l41 = L('আব্বার মুখ ছোট'), l42 = L('সামনে আমার চাকরির');
    cue(l38.s - .3, 'whoosh', .5); cue(T(l38, 'ভদ্রতা') + .4, 'pen', .6); cue(T(l39, 'নোংরা'), 'impact_soft', .8);
    [T(l40, 'সিন'), l41.s, T(l42, 'রেফারেন্স')].forEach(x => cue(x, 'type', .6)); cue(l42.e + .1, 'ding', .5);
    add({
      a: l38.s - .35, tr: 'wipe', bg: ['#1A1712', '#0F0E10', '#06060A'], draw(t) {
        let h = '';
        const st = P(t, T(l38, 'ভদ্রতা') + .4, .4);
        h += blk(170, `<div style="position:relative;display:inline-block">${kt(t, span(l38, 'আমার', 'না'), { font: 'B', size: 38, hl: { 'ভদ্রতা': 'pa' } })}<div class="abs" style="left:0;top:52%;height:5px;background:${RU};width:${st * 100}%"></div></div>`);
        h += blk(250, kt(t, span(l39, 'নোংরা', 'হিসাব'), { size: 120, hl: { 'নোংরা': 'ru glowR', 'হিসাব': 'pa' }, slam: ['নোংরা'] }));
        // receipt printing
        const rp = P(t, l39.e, .8);
        if (rp > 0) {
          const row = (t0, label, val, col) => { const p = P(t, t0, .35); return `<div style="display:flex;justify-content:space-between;align-items:baseline;font-size:46px;padding:10px 0;border-bottom:2px dashed #BFB4A2;opacity:${eo(p)}"><span class="H">${label}</span><span class="H" style="color:${col}">${val}</span></div>`; };
          const tot = P(t, l42.e + .1, .5);
          h += `<div class="abs" style="left:200px;top:470px;width:680px;height:${lerp(0, 760, eo(rp))}px;overflow:hidden;background:#F4EFE4;color:#2A2420;box-shadow:0 30px 70px rgba(0,0,0,.6);padding:0 44px;box-sizing:border-box;clip-path:polygon(0 0,100% 0,100% calc(100% - 14px),95% 100%,90% calc(100% - 14px),85% 100%,80% calc(100% - 14px),75% 100%,70% calc(100% - 14px),65% 100%,60% calc(100% - 14px),55% 100%,50% calc(100% - 14px),45% 100%,40% calc(100% - 14px),35% 100%,30% calc(100% - 14px),25% 100%,20% calc(100% - 14px),15% 100%,10% calc(100% - 14px),5% 100%,0 calc(100% - 14px))">
            <div style="text-align:center;font:600 22px Fr;letter-spacing:6px;margin:30px 0 10px;color:#7A7268">PROFIT &amp; LOSS</div>
            ${row(T(l40, 'সিন'), '“সিন ক্রিয়েট”', '−', RU)}
            ${row(l41.s, 'আব্বার মুখ ছোট', '−', RU)}
            ${row(T(l42, 'রেফারেন্স'), 'চাকরির রেফারেন্স', '−', RU)}
            <div style="display:flex;justify-content:space-between;align-items:baseline;padding:22px 0 10px;opacity:${eo(tot)}"><span class="H" style="font-size:56px">সিদ্ধান্ত</span><span class="H" style="font-size:66px;color:#B5781F">চুপ থাকা</span></div></div>`;
        }
        h += blk(1250, kt(t, span(l42, 'সেইটাও', 'যাবে'), { font: 'B', size: 40, color: DM }));
        return h;
      }
    });
  }

  // =============== 13. WHO THE ENEMY IS ==========================================
  {
    const l43 = L('আমরা সব সময় ভাবি'), l44 = L('মিথ্যা কথা'), l45 = L('খারাপ মানুষগুলা এত'), l46 = L('যারা নিজের চোখের'), l47 = L('পাছে লোকে'), l48 = L('পাছে পারিবারিক');
    cue(l43.s - .3, 'drone_dark', .7); cue(l44.s - .03, 'impact', 1.0); cue(l44.s, 'glitch', .7); cue(T(l45, 'ভদ্র'), 'riser', .6);
    cue(T(l48, 'দাগ'), 'drip', .7); cue(T(l48, 'দাগ') + .5, 'erase', .5);
    add({
      a: l43.s - .35, tr: 'glitch', td: .5, bg: ['#1A1416', '#0E0B0E', '#050406'], draw(t) {
        let h = '';
        const grow = eo(P(t, T(l45, 'সাহস') - .3, 2.2));
        // villain silhouette that grows behind a row of smiling masks
        const vs = lerp(1.0, 1.7, grow);
        h += `<div class="abs" style="left:0;top:0;width:1080px;height:1350px;transform-origin:540px 1300px;transform:scale(${vs})">` + ch(CH.chacha('smug'), 540, 1300, 1.0, { t, t0: l43.s - .2, filter: 'brightness(0) opacity(.85)' }) + '</div>';
        if (t > T(l43, 'খারাপ') - .1 && t < l45.s) h += at(380, 500, `<div class="H ru" style="font-size:44px;border:3px solid ${RU};padding:4px 20px 10px">খারাপ মানুষ</div>`, `opacity:${eo(P(t, T(l43, 'খারাপ'), .3))}`);
        const mp = P(t, T(l45, 'ভদ্র') - .2, 1.2);
        if (mp > 0) for (let i = 0; i < 5; i++) { const p = P(t, T(l45, 'ভদ্র') - .2 + i * .15, .5); const x = 120 + i * 210; h += `<svg class="abs" viewBox="140 50 120 160" width="170" height="227" style="left:${x - 85}px;top:${930 + (1 - eo5(p)) * 300}px;opacity:${eo(p)}">${CH.mask(1)}<rect x="150" y="200" width="100" height="10" fill="none"/></svg>`; }
        h += blk(170, kt(t, span(l43, 'আমরা', 'মানুষগুলা'), { font: 'B', size: 46, color: DM, hl: { 'শত্রু': 'pa' }, out: l44.s - .05 }));
        h += blk(250, `<div style="${shake(t, l44.s, 20)}">` + kt(t, l44.words, { size: 140, hl: { 'মিথ্যা': 'ru glowR' }, slam: ['মিথ্যা'], out: l45.s + .3 }) + '</div>');
        h += blk(180, kt(t, span(l45, 'খারাপ', 'জন্য'), { size: 66, hl: { 'সাহস': 'ru', 'ভদ্র': 'am glowA' }, out: l46.s - .1 }));
        h += blk(180, kt(t, l46.words, { font: 'B', size: 48, hl: { 'হাসিটা': 'am' }, out: l47.s - .1 }));
        h += blk(180, kt(t, l47.words, { size: 74, hl: { 'অভদ্র': 'am glowA' }, out: l48.s - .1 }));
        // family photo with a stain being wiped
        const fp = P(t, l48.s - .2, .5);
        if (fp > 0) {
          const sp = P(t, T(l48, 'দাগ'), .4), wipe = P(t, T(l48, 'দাগ') + .5, 1.0);
          h += `<div class="abs" style="left:340px;top:330px;width:400px;height:300px;border:12px solid ${AM};background:#1B2232;opacity:${eo(fp)};overflow:hidden">
            ${[CH.abba2('smile'), CH.amma('smile', 'idle'), CH.son('smile', 'idle'), CH.bon('neutral')].map((c, i) => `<svg class="abs" viewBox="0 0 400 760" width="130" height="247" style="left:${-14 + i * 92}px;top:${40 + (i % 2) * 14}px">${c}</svg>`).join('')}
            <div class="abs" style="left:150px;top:90px;width:${90 * sp}px;height:${60 * sp}px;border-radius:50%;background:${RU};opacity:${.75 * (1 - wipe)};filter:blur(4px)"></div>
            <div class="abs" style="left:${lerp(-120, 420, wipe)}px;top:60px;width:120px;height:140px;background:#F4F0E8;border-radius:12px;opacity:${wipe > 0 && wipe < 1 ? 1 : 0}"></div></div>`;
          h += blk(660, kt(t, l48.words, { size: 70, hl: { 'ইমেজে': 'am glowA', 'দাগ': 'ru' } }));
        }
        return h;
      }
    });
  }

  // =============== 14. THE SALAD BOWL ============================================
  {
    const l49 = L('খাওয়ার মাঝখানে'), l50 = L('যাতে চাচা'), l51 = L('যাতে পরিবেশটা'), l52 = L('বোনটা মাথা নিচু'), l53 = L('ও চাচার দিকে');
    cue(l49.s - .3, 'swoosh', .5); cue(T(l49, 'জোর'), 'hit', .5); cue(T(l51, 'স্বাভাবিক'), 'shimmer', .5); cue(T(l52, 'রাখল'), 'clink', .6); cue(l53.s, 'drone_dark', .6);
    add({
      a: l49.s - .35, tr: 'slide', bg: ['#231E19', '#12121A', '#07080C'], glow: ['#F2C98A', 540, 500, 600, .1], draw(t) {
        let h = '';
        const ty = 900;
        const walk = P(t, T(l49, 'পাঠাইলেন') - .6, 3.0);
        h += ch(pose(CH.chacha('sweet'), { eyes: blink(t, 3) }), 300, 1260, 1.0, { t });
        h += ch(pose(CH.sonJug('smile', 0), { eyes: blink(t, 2) }), 860, 1320, .95, { t });
        const sx = lerp(1250, 600, eio(walk)), bob = Math.abs(Math.sin(t * 6)) * 8 * (walk > 0 && walk < 1 ? 1 : 0);
        h += `<div class="abs" style="left:0;top:${-bob}px;width:1080px;height:1350px">` + ch(pose(CH.bon('down', 'bowl'), { head: ['rotate(14deg)', '50% 90%'] }), sx, 1330, 1.0, { t }) + '</div>';
        h += svgBox(1080, 1350, table(t, ty) + dish('polao', 200, ty + 10, 1, t) + dish('roast', 420, ty + 14, 1, t) + dish('salad', 620, ty + 14, P(t, T(l52, 'রাখল') - .1, .3), t), 0, 0);
        h += blk(170, kt(t, span(l49, 'খাওয়ার', 'পাঠাইলেন'), { font: 'B', size: 44, hl: { 'জোর': 'ru' }, out: l50.s - .1 }));
        h += blk(170, kt(t, l50.words, { size: 72, out: l51.s - .1 }));
        h += blk(170, kt(t, l51.words, { size: 84, hl: { 'স্বাভাবিক': 'am glowA' }, out: l52.s - .1 }));
        h += blk(170, kt(t, l52.words, { font: 'B', size: 50, out: l53.s - .1 }));
        h += blk(170, kt(t, l53.words, { size: 84, hl: { 'নাই': 'te glowT' } }));
        return h;
      }
    });
  }

  // =============== 15. THE GLANCE (key moment: 1-second freeze) ==================
  const FREEZE = (() => { const l = L('ও শুধু এক সেকেন্ডের'); const w = wd(l, 'তাকাইল'); return { a: w.e - 0.1, d: 1.0 }; })();
  window.FREEZE = FREEZE;
  {
    const l54 = L('ও শুধু এক সেকেন্ডের'), l55 = L('আমার হাতে তখনো'), l56 = L('মুখে ভদ্র ছেলের');
    cue(l54.s - .3, 'drone_dark', .6); cue(T(l54, 'চোখ'), 'riser', .5); cue(FREEZE.a - .02, 'freeze', 1); cue(FREEZE.a + FREEZE.d, 'release', .6); cue(l55.s, 'heartbeat', .6); cue(l56.s, 'heartbeat', .5);
    add({
      a: l54.s - .35, tr: 'dissolve', td: .9, bg: ['#111520', '#0A0D14', '#040508'], draw(t0) {
        const fz = t0 >= FREEZE.a && t0 < FREEZE.a + FREEZE.d;
        const t = fz ? FREEZE.a : t0;
        let h = '';
        const A = 1 - P(t0, FREEZE.a + FREEZE.d + .05, .5);
        if (A > 0) {
          const lift = eo(P(t, T(l54, 'চোখ') - .1, .6));
          const z = lerp(3.0, 3.6, eio(P(t, l54.s, 4)));
          const face = pose(CH.bon(lift > .5 ? 'glance' : 'down'), { eyes: [`translateY(${(1 - lift) * 4}px)`], head: [`rotate(${lerp(10, 0, lift)}deg)`, '50% 90%'] });
          h += `<div style="opacity:${A}"><div class="abs" style="left:540px;top:500px;width:0;height:0"><svg class="abs" viewBox="0 0 400 760" width="${400 * z}" height="${760 * z}" style="left:${-200 * z}px;top:${-148 * z}px">${face}</svg></div>
            <div class="abs" style="inset:0;background:linear-gradient(0deg,rgba(6,8,12,.95) 22%,transparent 55%)"></div>`;
          h += blk(1000, kt(t, span(l54, 'ও', 'তুইলা'), { font: 'B', size: 48, color: DM }));
          h += blk(1080, kt(t, span(l54, 'আমার', 'তাকাইল'), { size: 100, hl: { 'আমার': 'te glowT' } }));
          h += '</div>';
        }
        // her point of view: me, with the jug and the polite smile, inside an eye-shaped frame
        const B = P(t0, FREEZE.a + FREEZE.d + .05, .6);
        if (B > 0) {
          const zz = lerp(1.0, 1.12, eio(P(t0, l55.s, 5)));
          h += `<div style="opacity:${B}"><div class="abs" style="left:90px;top:300px;width:900px;height:620px;clip-path:ellipse(50% 46% at 50% 50%);background:#1E1A16;overflow:hidden">
            <div class="abs" style="inset:0;transform:scale(${zz})">${ch(pose(CH.sonJug('smile', 0), { eyes: blink(t0, 2) }), 450, 900, 1.25, { t: t0 })}</div></div>
            <svg class="abs" style="left:90px;top:300px" width="900" height="620" viewBox="0 0 900 620"><ellipse cx="450" cy="310" rx="450" ry="285" fill="none" stroke="${TE}" stroke-width="6" opacity=".6"/></svg>`;
          h += blk(170, kt(t0, l55.words, { size: 76, hl: { 'জগ': 'pa' } }));
          h += blk(1000, kt(t0, l56.words, { size: 96, hl: { 'ভদ্র': 'am glowA', 'হাসি': 'am glowA' } }));
          h += '</div>';
        }
        const fp = t0 >= FREEZE.a ? P(t0, FREEZE.a, .12) * (1 - P(t0, FREEZE.a + FREEZE.d, .5)) : 0;
        const ov = fp > 0 ? `<div class="abs" style="inset:40px;border:2px solid rgba(242,235,221,${.5 * fp})"></div><div class="abs" style="right:70px;bottom:60px;font:600 26px Fr;letter-spacing:6px;color:rgba(242,235,221,${.8 * fp})">❚❚ 00:01</div>` : '';
        return `<div style="filter:grayscale(${fp * .9}) brightness(${1 - fp * .15})">${h}</div>${ov}`;
      }
    });
  }

  // =============== 16. THE REAL FEAR =============================================
  {
    const l57 = L('ওই এক সেকেন্ডে'), l58 = L('এই বাড়িতে ওর ভয়'), l59 = L('ওর আসল ভয়');
    const tMouth = T(l59, 'মুখ');
    cue(T(l57, 'ভয়ংকর'), 'impact', .8); cue(T(l59, 'আপন'), 'heartbeat', .6); cue(T(l59, 'হাসিমুখে'), 'clink', .4); cue(T(l59, 'সামাজিকতা'), 'cloth', .6); cue(tMouth - .4, 'cloth', 1.0); cue(tMouth, 'cut_silence', 1);
    add({
      a: l57.s - .35, tr: 'black', td: .8, bg: ['#14171F', '#0A0C12', '#040507'], draw(t) {
        let h = '';
        h += blk(200, kt(t, span(l57, 'ওই', 'বুঝে'), { font: 'B', size: 46, color: DM, out: l58.s - .1 }) + kt(t, span(l57, 'ভয়ংকর', 'সত্য'), { size: 110, hl: { 'ভয়ংকর': 'ru glowR' }, slam: ['ভয়ংকর'], out: l58.s - .1 }));
        // sister at centre; masked family around the table
        const C = P(t, l58.s - .2, .6);
        if (C > 0) {
          h += `<div style="opacity:${eo(C)}">`;
          const ty = 900;
          const fam = [[150, CH.amma('smile', 'idle')], [330, CH.abba2('smile')], [750, CH.son('smile', 'idle')], [930, CH.chacha('sweet')]];
          const mp = P(t, T(l59, 'হাসিমুখে') - .2, .8);
          fam.forEach(([x, svg], i) => { h += ch(svg, x, 1260, .8, { t, filter: 'brightness(.55)' }); if (mp > 0) h += `<svg class="abs" viewBox="0 0 400 760" width="320" height="608" style="left:${x - 160}px;top:${1260 - 608 + (1 - eo(mp)) * -80}px;opacity:${eo(mp)}">${CH.mask(1)}</svg>`; });
          h += ch(pose(CH.bon('scared'), { eyes: blink(t, 3) }), 540, 1330, 1.15, { t });
          h += svgBox(1080, 1350, table(t, ty), 0, 0);
          // the tablecloth rises and covers her mouth
          const rise = eio(P(t, tMouth - .6, 1.0));
          if (rise > 0) h += svgBox(1080, 1350, `<path d="M330 ${lerp(ty, 680, rise)} Q540 ${lerp(ty, 645, rise)} 750 ${lerp(ty, 680, rise)} L780 ${ty + 10} L300 ${ty + 10}Z" fill="#F4F0E8"/><path d="M360 ${lerp(ty, 700, rise)} Q540 ${lerp(ty, 668, rise)} 720 ${lerp(ty, 700, rise)}" stroke="#E2D9C8" stroke-width="4" fill="none"/>`, 0, 0);
          h += blk(170, kt(t, l58.words, { size: 64, hl: { 'বাইরের': 'pa', 'না': 'ru' }, out: l59.s - .1 }));
          h += blk(170, kt(t, span(l59, 'ওর', 'রক্ত'), { size: 66, hl: { 'আসল': 'ru', 'আপন': 'te glowT', 'রক্ত': 'te glowT' }, out: T(l59, 'আর') - .1 }));
          h += blk(170, kt(t, span(l59, 'আর', 'ধরতেছে'), { size: 64, hl: { 'সামাজিকতা': 'am glowA', 'মুখ': 'ru', 'চাইপা': 'ru' } }));
          h += '</div>';
        }
        return h;
      }
    });
  }

  // =============== 17. THE MASK + END CARD =======================================
  {
    const l60 = L('দাওয়াত শেষে'), l61 = L('আমি আবার হাসলাম'), l62 = L('কারণ মুখোশটা');
    const tMask = T(l62, 'মুখোশটা'), tGlue = T(l62, 'আঠা'), tOpen = T(l62, 'খোলা'), endA = l62.e + .9;
    cue(l60.s - .3, 'leakwhoosh', .5); cue(T(l60, 'পিঠে'), 'thud', .5); cue(l61.s, 'shimmer', .3); cue(tMask - .1, 'whoosh', .6); cue(tMask + .5, 'thud', .9); cue(tGlue, 'drip', .7); cue(tOpen, 'creak', .6); cue(endA, 'end_note', 1);
    add({
      a: l60.s - .35, tr: 'leak', td: .9, bg: ['#1E1A16', '#0F0E11', '#05050A'], draw(t) {
        let h = '';
        const B = 1 - P(t, endA - .2, .8);
        if (B > 0) {
          const pat = t > T(l60, 'পিঠে') - .2;
          const mp = eo5(P(t, tMask - .1, .6));
          const pull = t > tOpen ? Math.sin((t - tOpen) * 25) * 6 * (1 - P(t, tOpen, 1.2)) : 0;
          const glue = P(t, tGlue, 1.5);
          let son = CH.son(t > l61.s ? 'smile' : 'smile', 'idle');
          let maskSvg = mp > 0 ? `<g transform="translate(${pull} ${lerp(-260, 0, mp)})">${CH.mask(1)}${[0, 1, 2, 3].map(i => `<path d="M${165 + i * 22} 186 v${glue * (20 + i * 9)}" stroke="${AM}" stroke-width="6" stroke-linecap="round" opacity=".85"/>`).join('')}</g>` : '';
          h += `<div style="opacity:${B}">`;
          h += ch(pose(CH.chacha('sweet'), { eyes: blink(t, 3), armR: [pat ? 'rotate(-38deg)' : '', '0% 0%'] }), 380, 1300, 1.1, { t, t0: l60.s - .3, out: l61.s - .2 });
          h += `<div class="abs" style="left:0;top:0;width:1080px;height:1350px;transform:translateX(${lerp(0, -70, eo(P(t, l61.s - .2, .8)))}px) scale(${lerp(1, 1.25, eio(P(t, l61.s, 4)))});transform-origin:610px 500px">` + ch(pose(son + maskSvg, { eyes: blink(t, 2) }), 680, 1300, 1.1, { t }) + '</div>';
          h += blk(170, kt(t, span(l60, 'দাওয়াত', 'কইলেন'), { font: 'B', size: 44, color: DM, out: T(l60, 'তুই') - .1 }));
          h += blk(170, kt(t, span(l60, 'তুই', 'রে'), { font: 'Q', size: 86, hl: { 'ভদ্র': 'am glowA' }, keepQuotes: false, out: l61.s - .1 }));
          h += blk(190, kt(t, l61.words, { size: 100, hl: { 'হাসলাম': 'am glowA' }, out: tMask - .2 }));
          h += `<div class="abs" style="left:0;right:0;bottom:0;height:420px;background:linear-gradient(0deg,rgba(6,8,12,.95) 45%,transparent)"></div>`;
          h += blk(1060, kt(t, span(l62, 'কারণ', 'গেলে'), { font: 'B', size: 44, hl: { 'মুখোশটা': 'pa', 'আঠা': 'am' } }));
          h += blk(1130, kt(t, span(l62, 'সেইটা', 'না'), { size: 76, hl: { 'খোলা': 'ru glowR', 'না': 'ru glowR' } }));
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
