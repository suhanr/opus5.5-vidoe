// Scene list for "The Unsaid". Every scene is a pure function of absolute time t.
(function () {
  const { P, lerp, eo, eo5, ei, eio, back, spring, hash, noise1, bn, bnMoney, S, wd, span, kt, blk, at, ap, ch, pose, blink, dr, clamp } = K;
  const CH = window.CHAR;
  const AM = '#E8A33D', TE = '#6FB8AC', TED = '#3F7D74', RU = '#D2583D', PA = '#F2EBDD', DM = '#8D93A3';
  const L = S; // line lookup
  const T = (line, w, n) => wd(line, w, n).s; // time of a word
  const svgBox = (w, h, inner, x, y, extra = '') => `<svg class="abs" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="left:${x}px;top:${y}px;${extra}">${inner}</svg>`;
  const heart = (cx, cy, s) => `M${cx} ${cy - 30 * s}c-30 -40 -90 -20 -90 25 0 45 90 95 90 95s90 -50 90 -95c0 -45 -60 -65 -90 -25z`;
  const shake = (t, t0, amp = 14, d = 0.45) => { const p = P(t, t0, d); if (p <= 0 || p >= 1) return ''; const a = amp * (1 - p); return `transform:translate(${(noise1(t * 60) * a).toFixed(1)}px,${(noise1(t * 60 + 9) * a).toFixed(1)}px)`; };
  const SCN = [];
  const add = o => SCN.push(o);

  // =============== 1. HOOK + LIE ===============================================
  {
    const l0 = L('আমাদের সমাজে একটা কথা'), l1 = L('এইটা আমাদের সবচেয়ে');
    const tSom = T(l0, 'সমান'), tLie = T(l1, 'মিথ্যা'), tBhodro = T(l1, 'ভদ্র');
    cue(0.05, 'drone_in', 0.9); cue(0.3, 'shimmer', 0.5);
    cue(0.9, 'draw', 0.35); cue(tSom - 0.05, 'impact', 0.8); cue(l1.s - 0.05, 'whoosh', 0.5);
    cue(tBhodro - 0.02, 'tick', 0.4); cue(tLie - 0.06, 'crack', 1.0); cue(tLie - 0.04, 'impact', 1.0); cue(tLie, 'glitch', 0.6);
    add({
      a: 0, tr: 'cut', bg: ['#1B2234', '#0F1420', '#070A10'], draw(t) {
        let h = '';
        // light dot opening
        const d = P(t, 0, 1.0);
        if (d < 1) h += `<div class="abs" style="left:540px;top:520px;width:0;height:0;box-shadow:0 0 ${lerp(10, 400, eo(d))}px ${lerp(6, 160, eo(d))}px rgba(242,235,221,${(1 - d) * .8})"></div>`;
        // hearts
        const hp = P(t, 0.7, 1.6), split = P(t, tLie - 0.1, 0.6);
        const off = eo(split) * 70, rot = eo(split) * 10;
        const col = split > 0 ? RU : PA;
        h += svgBox(1080, 400, `
          <g transform="translate(${-off} ${eo(split) * 10}) rotate(${-rot} 330 200)"><path d="${heart(330, 160, 1)}" fill="none" stroke="${PA}" stroke-width="9" stroke-linecap="round" ${dr(hp)}/></g>
          <g transform="translate(${off} ${eo(split) * 10}) rotate(${rot} 750 200)"><path d="${heart(750, 160, 1)}" fill="none" stroke="${PA}" stroke-width="9" stroke-linecap="round" ${dr(hp)}/></g>`, 0, 330);
        // equals sign -> broken
        const ep = P(t, tSom - 0.1, 0.45);
        if (ep > 0) {
          const s = lerp(1.8, 1, spring(ep)), br = split;
          h += svgBox(1080, 400, `<g transform="translate(540 205) scale(${s.toFixed(3)})" opacity="${clamp(ep * 3)}">
            <g transform="translate(${-br * 18} ${-br * 6}) rotate(${-br * 9})"><rect x="-55" y="-30" width="${110 - br * 50}" height="18" rx="3" fill="${br > 0 ? RU : AM}"/><rect x="-55" y="12" width="${110 - br * 50}" height="18" rx="3" fill="${br > 0 ? RU : AM}"/></g>
            <g transform="translate(${br * 18} ${br * 8}) rotate(${br * 7})" opacity="${clamp(br * 4)}"><rect x="5" y="-30" width="50" height="18" rx="3" fill="${RU}"/><rect x="5" y="12" width="50" height="18" rx="3" fill="${RU}"/></g>
            <line x1="${20}" y1="-70" x2="${-20}" y2="70" stroke="${PA}" stroke-width="7" stroke-linecap="round" ${dr(eo(P(t, tLie - 0.05, 0.25)))}/></g>`, 0, 330);
        }
        // text
        const out0 = l1.s - 0.25;
        h += blk(190, kt(t, span(l0, 'আমাদের', 'চলে'), { font: 'B', size: 46, color: DM, out: out0 }));
        h += blk(800, kt(t, span(l0, 'বাবা-মা', 'ভালোবাসে'), { size: 96, hl: { 'সমান': 'am glowA' }, slam: ['সমান'], out: out0 }));
        // lie line
        const g = P(t, tLie, 1.2); const jit = g > 0 && g < 1 ? (noise1(t * 40) * 8 * (1 - g)) : 0;
        h += blk(780, kt(t, span(l1, 'এইটা', 'আমাদের'), { font: 'B', size: 50, color: DM }));
        h += blk(860, `<div style="${shake(t, tLie, 16)}">` + kt(t, span(l1, 'সবচেয়ে', 'মিথ্যা'), { size: 150, lh: 1.05, hl: { 'ভদ্র': 'ru', 'মিথ্যা': 'ru glowR' }, slam: ['মিথ্যা'] }) + '</div>',
          g > 0 && g < 1 ? `text-shadow:${jit}px 0 rgba(111,184,172,.7),${-jit}px 0 rgba(210,88,61,.7)` : '');
        return h;
      }
    });
  }

  // =============== 2. STROKE / DISTANCE =========================================
  {
    const l2 = L('আব্বার স্ট্রোক'), l3 = L('ডান পাশটা'), l4 = L('সেই চার বছর'), l5 = L('বছরে দুইবার'), l6 = L('আর বড় আপা');
    const tStroke = T(l2, 'স্ট্রোক'), tChar = T(l2, 'চার'), split = l4.s - 0.15;
    cue(l2.s - 0.3, 'whoosh', 0.6);
    for (let k = 0; k < 7; k++) cue(l2.s + k * 0.55, 'beep', k === 1 ? 0.55 : 0.28);
    cue(tStroke, 'flatline', 0.35); cue(tChar, 'impact_soft', 0.6); cue(l3.s, 'thud', 0.5);
    cue(split, 'swoosh', 0.7); cue(T(l4, 'ঢাকায়'), 'city', 0.35); cue(T(l5, 'দুইবার'), 'pop', 0.5); cue(T(l6, 'মাথার'), 'shimmer', 0.4);
    add({
      a: l2.s - 0.35, tr: 'zoom', draw(t) {
        let h = '';
        const A = 1 - P(t, split, 0.5);
        if (A > 0) {
          // ECG
          const ep = P(t, l2.s - 0.3, 3.2);
          const flat = P(t, tStroke + 0.4, 0.3);
          const beat = (x0) => `l20 0 l12 -60 l16 120 l12 -80 l10 20`;
          const path = `M0 120 h120 ${beat()} h120 ${beat()} h110 l10 -110 l20 200 l14 -130 l12 40 h${600}`;
          h += `<div style="opacity:${A}">` + svgBox(1080, 260, `<path d="${path}" fill="none" stroke="${flat > 0 ? RU : TE}" stroke-width="6" stroke-linejoin="round" ${dr(ep)}/>
            <circle cx="${lerp(0, 1080, ep)}" cy="120" r="9" fill="${RU}" opacity="${ep < 1 ? 1 : 0}"/>`, 0, 170);
          h += blk(420, kt(t, span(l2, 'চার', 'আগে'), { size: 120, hl: { 'চার': 'ru' }, slam: ['চার'] }));
          h += blk(330, kt(t, span(l2, 'আব্বার', 'হইছিল'), { font: 'B', size: 46, color: DM }));
          // Abba with right side weak (desaturated half)
          const ab = pose(CH.abba('droop'), { eyes: blink(t) });
          h += ch(ab, 540, 1290, 1.0, { t, t0: l2.s, dur: 0.9 });
          const dp = P(t, l3.s - 0.1, 0.8);
          if (dp > 0) h += `<div class="abs" style="left:0;top:740px;width:${540 * eo(dp)}px;height:560px;background:linear-gradient(90deg,rgba(15,20,32,.72),rgba(15,20,32,.35));backdrop-filter:grayscale(1)"></div>` +
            blk(640, kt(t, span(l3, 'ডান', 'গেল'), { font: 'B', size: 52, hl: { 'ডান': 'ru' } }));
          h += '</div>';
        }
        const B = P(t, split, 0.7);
        if (B > 0) {
          const sx = (1 - eo5(B)) * 540;
          // left: Dhaka (amber) / right: bedside (teal)
          h += `<div class="abs" style="left:${-sx}px;top:0;width:540px;height:1350px;background:linear-gradient(180deg,rgba(232,163,61,.10),rgba(232,163,61,.02))">
            ${svgBox(540, 300, `<path d="M20 260 v-90 h50 v-60 h40 v60 h30 v-130 h60 v130 h30 v-80 h50 v80 h40 v-40 h50 v40 h40 v-110 h50 v110 h40" fill="none" stroke="${AM}" stroke-width="4" opacity=".55" ${dr(P(t, split + .2, 1.4))}/>`, 0, 140)}
            ${ch(pose(CH.son('neutral', 'phone'), { eyes: blink(t, 2) }), 270, 1150, 0.8, { t, t0: split + .25 })}
            ${blk(250, kt(t, span(l4, 'ঢাকায়', 'ঢাকায়'), { size: 96, hl: { 'ঢাকায়': 'am glowA' }, slam: ['ঢাকায়'] }), 'padding:0')}
            ${blk(1170, kt(t, span(l5, 'বছরে', 'যাইতাম'), { font: 'B', size: 44, hl: { 'দুইবার': 'am' } }), 'padding:0 30px')}
          </div>
          <div class="abs" style="left:${540 + sx}px;top:0;width:540px;height:1350px;background:linear-gradient(180deg,rgba(111,184,172,.12),rgba(111,184,172,.03))">
            ${ch(pose(CH.abba('droop'), { eyes: blink(t, 1) }), 290, 1150, 0.72, { t, t0: split + .3 })}
            ${ch(pose(CH.apa('tired', 'idle'), { eyes: blink(t, 3) }), 150, 1150, 0.8, { t, t0: T(l6, 'আপা') - .2, fromX: 120 })}
            ${blk(250, kt(t, span(l6, 'মাথার', 'কাছে'), { size: 86, hl: { 'মাথার': 'te glowT', 'কাছে': 'te glowT' } }), 'padding:0')}
            ${blk(1170, kt(t, span(l6, 'বড়', 'আপা'), { font: 'B', size: 44, hl: { 'আপা': 'te' } }), 'padding:0')}
          </div>
          <div class="abs" style="left:539px;top:${lerp(1350, 120, eo(B))}px;bottom:120px;width:2px;background:${PA};opacity:.25"></div>`;
        }
        return h;
      }
    });
  }

  // =============== 3. APA'S LEDGER ==============================================
  {
    const l7 = L('আপার নিজের সংসার'), l8 = L('আব্বার ক্যাথেটার');
    const tA = [T(l7, 'সংসার'), T(l7, 'বাচ্চা'), T(l7, 'প্রাইভেট')];
    const tCath = T(l8, 'ক্যাথেটার'), tRat = T(l8, 'রাত'), tHos = T(l8, 'হাসপাতালের'), tJob = T(l8, 'চাকরিটা');
    tA.forEach(x => cue(x - .03, 'pop', 0.45));
    [tCath, tRat, tHos].forEach(x => cue(x - .05, 'type', 0.5));
    for (let k = 0; k < 6; k++) cue(tRat + k * 0.5, 'clock', 0.35);
    cue(tHos + 0.2, 'mosquito', 0.28); cue(tJob - 0.05, 'stamp', 1.0);
    add({
      a: l7.s - 0.35, tr: 'wipe', draw(t) {
        let h = '';
        h += blk(170, kt(t, span(l7, 'আপার', 'নিজের'), { font: 'B', size: 46, color: DM }));
        const chip = (x, label, t0, struck) => {
          const p = P(t, t0, .4); if (p <= 0) return '';
          const sp = struck ? P(t, tJob, .35) : 0;
          return `<div class="abs H" style="left:${x}px;top:250px;font-size:54px;padding:8px 30px 14px;border:3px solid ${sp > 0 ? RU : TE};border-radius:60px;color:${sp > 0 ? DM : TE};opacity:${eo(p)};transform:scale(${lerp(.5, 1, back(p))})">${label}
            <div style="position:absolute;left:16px;top:50%;height:6px;background:${RU};width:${(sp * 85).toFixed(1)}%"></div></div>`;
        };
        h += chip(150, 'সংসার', tA[0]) + chip(430, 'বাচ্চা', tA[1]) + chip(690, 'চাকরি', tA[2], true);
        // ledger rows
        const row = (y, t0, html, icon) => {
          const p = P(t, t0 - .05, .45); if (p <= 0) return '';
          const done = P(t, t0 + .7, .3);
          return at(110, y, `<div style="display:flex;align-items:center;gap:26px;opacity:${eo(p)};transform:translateX(${(1 - eo(p)) * -60}px)">
            <svg width="54" height="54" viewBox="0 0 54 54"><rect x="3" y="3" width="48" height="48" rx="8" fill="none" stroke="${TE}" stroke-width="4"/><path d="M14 28 l9 9 l18 -20" fill="none" stroke="${TE}" stroke-width="6" stroke-linecap="round" ${dr(done)}/></svg>
            <div class="H" style="font-size:62px">${html}</div>${icon || ''}</div>`);
        };
        const ang = (t - tRat) * 140;
        const clock = `<svg width="80" height="80" viewBox="-40 -40 80 80"><circle r="34" fill="none" stroke="${PA}" stroke-width="4"/><line y2="-24" stroke="${PA}" stroke-width="5" stroke-linecap="round" transform="rotate(90)"/><line y2="-30" stroke="${TE}" stroke-width="3" stroke-linecap="round" transform="rotate(${ang})"/></svg>`;
        let mos = '';
        if (t > tHos) for (let i = 0; i < 7; i++) { const x = 760 + Math.sin(t * (5 + i) + i * 3) * 90; const y = 830 + Math.cos(t * (4 + i * .7) + i) * 50; mos += `<circle cx="${x}" cy="${y}" r="4" fill="${PA}" opacity=".7"/>`; }
        h += row(450, tCath, 'ক্যাথেটার বদলানো');
        h += row(600, tRat, `রাত <span class="te">৩:০০</span>টায় প্রেশার`, clock);
        h += row(750, tHos, 'হাসপাতালের বারান্দা');
        h += svgBox(1080, 1350, mos, 0, 0);
        h += ch(pose(CH.apa('tired', 'idle'), { eyes: blink(t), head: [`rotate(${Math.sin(t * .8) * 2}deg)`, '50% 90%'] }), 900, 1330, 0.62, { t, t0: l7.s + .3, op: .9 });
        // stamp
        const sp = P(t, tJob - .05, .35);
        if (sp > 0) {
          const s = lerp(2.6, 1, eo5(sp));
          h += `<div class="abs H" style="left:150px;top:960px;font-size:92px;color:${RU};border:7px solid ${RU};padding:6px 40px 18px;transform:rotate(-6deg) scale(${s});opacity:${clamp(sp * 3)};${shake(t, tJob + .25, 10)};mix-blend-mode:screen">চাকরি ছাইড়া দিল</div>`;
        }
        return h;
      }
    });
  }

  // =============== 4. MY CONTRIBUTION ============================================
  {
    const l9 = L('আমি কী করতাম'), l10 = L('প্রতি মাসের এক তারিখে'), l11 = L('আর ঈদে বাড়ি গিয়া');
    const tBish = T(l10, 'বিশ'), tTar = T(l10, 'তারিখে'), tSelf = T(l11, 'সেলফি'), tFb = T(l11, 'ফেসবুকে');
    cue(l9.s - .3, 'whoosh', .6); cue(T(l9, 'করতাম'), 'impact_soft', .6);
    cue(tTar, 'tick', .5); cue(tBish - .1, 'coins', .7); cue(tBish + .9, 'ding', .7);
    cue(l11.s - .2, 'swoosh', .5); cue(tSelf, 'shutter', .9); for (let k = 0; k < 4; k++) cue(tFb + k * .22, 'like', .35);
    const phoneIn = l11.s - 0.1;
    add({
      a: l9.s - 0.35, tr: 'flash', bg: ['#231D14', '#12151E', '#080A10'], draw(t) {
        let h = '';
        const A = 1 - P(t, phoneIn, .45);
        h += `<div style="opacity:${A};transform:translateY(${(1 - A) * -60}px)">`;
        h += blk(180, kt(t, l9.words, { size: 104, hl: { 'কী': 'am' } }));
        // calendar
        const cp = P(t, l10.s - .1, .5);
        if (cp > 0) {
          let cells = '';
          for (let i = 0; i < 28; i++) { const x = (i % 7) * 40, y = Math.floor(i / 7) * 40; cells += `<rect x="${x}" y="${y + 40}" width="32" height="32" rx="4" fill="${i === 0 ? AM : 'none'}" stroke="${i === 0 ? AM : '#3A4258'}" stroke-width="2" opacity="${i === 0 ? clamp(P(t, tTar, .3) * 2) : .8}"/>`; }
          h += svgBox(300, 220, `<rect x="-6" y="0" width="290" height="30" rx="6" fill="#2A3247"/>${cells}<path d="M5 56 l7 7 l12 -14" stroke="#0F1420" stroke-width="4" fill="none" ${dr(P(t, tTar + .1, .3))}/>`, 140, 600, `opacity:${eo(cp)}`);
          h += at(470, 700, kt(t, span(l10, 'প্রতি', 'তারিখে'), { font: 'B', size: 40, color: DM }));
        }
        // money counter
        const mp = P(t, tBish - .1, 1.1);
        if (mp > 0) {
          const v = eo5(mp) * 20000;
          h += blk(380, `<div class="H am glowA" style="font-size:170px;transform:scale(${lerp(1.2, 1, eo(P(t, tBish + 1, .3)))})">৳${bnMoney(Math.round(v / 50) * 50)}</div>`);
          h += at(470, 625, kt(t, span(l10, 'বিকাশে', 'পাঠাইতাম'), { font: 'B', size: 42, hl: { 'বিকাশে': 'am' } }));
        }
        h += ch(pose(CH.son('smile', 'phone'), { eyes: blink(t, 1) }), 860, 1340, 0.62, { t, t0: l9.s, op: .95 });
        h += '</div>';
        // phone / selfie
        const pp = P(t, phoneIn, .6);
        if (pp > 0) {
          const y = lerp(1400, 250, eo5(pp));
          const flash = P(t, tSelf, .5);
          const son = CH.son('smile', 'idle'), ab = CH.abba('droop');
          h += `<div class="abs" style="left:290px;top:${y - 70}px;width:500px;height:820px;border-radius:60px;background:#0B0E16;border:10px solid #2C3347;box-shadow:0 30px 80px rgba(0,0,0,.6);overflow:hidden">
            <div class="abs" style="inset:0;background:linear-gradient(180deg,#2A2418,#151A26)"></div>
            <svg class="abs" viewBox="130 40 140 200" width="260" height="372" style="left:20px;top:240px">${son}</svg>
            <svg class="abs" viewBox="130 150 140 200" width="250" height="357" style="left:220px;top:262px">${ab}</svg>
            <div class="abs" style="left:0;right:0;bottom:0;height:200px;background:linear-gradient(0deg,rgba(0,0,0,.8),transparent)"></div>
            <div class="abs" style="inset:0;background:#fff;opacity:${flash > 0 ? (1 - flash) : 0}"></div>
          </div>`;
          // floating likes
          for (let i = 0; i < 6; i++) {
            const lp = P(t, tFb + i * .22, 1.6); if (lp <= 0 || lp >= 1) continue;
            const x = 760 + Math.sin(i * 2.3) * 60 + lp * 40, yy = 900 - eo(lp) * 420;
            h += at(x, yy, `<svg width="70" height="64" viewBox="-35 -30 70 64"><path d="${heart(0, 4, .35).replace(/M0 -6.5/, 'M0 -6.5')}" transform="scale(.36)" fill="${AM}"/></svg>`, `opacity:${Math.sin(lp * Math.PI)}`);
          }
          h += blk(1190, kt(t, span(l11, 'সেলফি', 'দিতাম'), { size: 66, hl: { 'সেলফি': 'am' } }));
        }
        return h;
      }
    });
  }

  // =============== 5. AMMA'S PRIDE ===============================================
  {
    const l12 = L('মজার ব্যাপার'), q1 = L('আমার ছেলে তো ঢাকায়'), q2 = L('প্রতি মাসে টাকা পাঠায়'), q3 = L('ওর জন্যই তো');
    cue(l12.s - .3, 'whoosh', .5); cue(T(l12, 'পাড়ার'), 'crowd', .5); cue(T(l12, 'গর্ব'), 'shimmer', .5);
    [q1, q2, q3].forEach(q => cue(q.s - .05, 'mic', .25));
    cue(T(q1, 'বড়'), 'impact_soft', .5);
    add({
      a: l12.s - 0.35, tr: 'iris', bg: ['#2A1D22', '#141520', '#080A10'], glow: [AM, 540, 760, 520, .12], draw(t) {
        let h = '';
        // crowd
        const cp = P(t, T(l12, 'পাড়ার') - .2, .8);
        const bob = i => Math.sin(t * 3 + i) * 3;
        h += `<svg class="abs" viewBox="0 0 400 760" width="400" height="760" style="left:-60px;top:${700 + (1 - eo(cp)) * 200}px;opacity:${eo(cp) * .9};transform:translateY(${bob(1)}px)">${CH.crowd()}</svg>`;
        h += `<svg class="abs" viewBox="0 0 400 760" width="400" height="760" style="left:740px;top:${700 + (1 - eo(cp)) * 200}px;opacity:${eo(cp) * .9};transform:scaleX(-1) translateY(${bob(2)}px)">${CH.crowd()}</svg>`;
        // amma
        const talking = t > q1.s && t < q3.e;
        const ex = talking ? (Math.sin(t * 9) > 0 ? 'proud' : 'smile') : 'smile';
        h += ch(pose(CH.amma(ex, 'talk'), { eyes: blink(t, 4), armR: [`rotate(${Math.sin(t * 2.5) * 6}deg)`, '0% 0%'] }), 540, 1330, 1.05, { t, t0: l12.s, dur: .9 });
        // sound rings from amma
        if (talking) for (let i = 0; i < 3; i++) {
          const rp = ((t - q1.s) * .9 + i / 3) % 1;
          h += `<div class="abs" style="left:${540 - 120 - rp * 260}px;top:${720 - 120 - rp * 260}px;width:${240 + rp * 520}px;height:${240 + rp * 520}px;border-radius:50%;border:3px solid ${AM};opacity:${(1 - rp) * .35}"></div>`;
        }
        const qOut = l12.e + .1;
        h += blk(170, kt(t, span(l12, 'মজার', 'হইল'), { font: 'B', size: 44, color: DM, out: qOut }));
        h += blk(250, kt(t, span(l12, 'আম্মা', 'কইত'), { size: 70, hl: { 'গর্ব': 'am glowA' }, out: qOut }));
        const quote = (q, hl, out) => blk(190, kt(t, q.words, { font: 'Q', size: 84, hl, out, keepQuotes: false }));
        h += quote(q1, { 'বড়': 'am glowA', 'চাকরি': 'am glowA' }, q2.s - .2);
        h += quote(q2, { 'টাকা': 'am glowA' }, q3.s - .2);
        h += quote(q3, { 'ওর': 'am glowA', 'চিকিৎসা': 'am' });
        if (t > q1.s - .2) h += at(120, 140, `<div class="Q am" style="font-size:180px;opacity:.25;line-height:1">“</div>`);
        return h;
      }
    });
  }

  // =============== 6. NEXT ROOM ==================================================
  {
    const l16 = L('আপা তখন পাশের ঘরে'), l17 = L('আম্মা একবারও');
    const tErase = T(l17, 'নিত');
    cue(l16.s - .3, 'swoosh', .6); cue(T(l16, 'চাদর'), 'water', .6); cue(T(l16, 'ধুইতেছে'), 'water', .45);
    cue(tErase, 'erase', .6);
    add({
      a: l16.s - 0.35, tr: 'slide', bg: ['#14202A', '#0D131C', '#06090F'], glow: [TE, 540, 1000, 500, .1], dust: .5, draw(t) {
        let h = '';
        // clothesline with the wet bedsheet, bucket with ripples
        const sw = Math.sin(t * 1.3) * 6;
        let drops = ''; for (let i = 0; i < 6; i++) { const dp = ((t * .9 + i / 6) % 1); drops += `<circle cx="${330 + i * 75}" cy="${700 + dp * 420}" r="5" fill="${TE}" opacity="${(1 - dp) * .8}"/>`; }
        let rip = ''; for (let i = 0; i < 3; i++) { const rp = ((t * .6) + i / 3) % 1; rip += `<ellipse cx="840" cy="1090" rx="${20 + rp * 80}" ry="${5 + rp * 14}" fill="none" stroke="${TE}" stroke-width="3" opacity="${(1 - rp) * .7}"/>`; }
        h += svgBox(1080, 1350, `<path d="M90 430 Q540 490 990 430" stroke="${DM}" stroke-width="4" fill="none"/>
          <path d="M290 455 Q540 500 790 455 L${790 + sw} 690 Q${540 + sw} 720 ${290 + sw} 690Z" fill="#DCE3E0" opacity=".9"/>
          <path d="M320 600 q40 20 80 0 t80 0 t80 0 t80 0 t80 0" stroke="#B8C6C2" stroke-width="4" fill="none" opacity=".7"/>${drops}
          <path d="M740 1080 h200 l-24 150 h-152z" fill="#29404A" stroke="${TE}" stroke-width="4"/><ellipse cx="840" cy="1080" rx="100" ry="20" fill="#3E6470"/>${rip}`, 0, 0);
        h += ch(pose(CH.apa('tired', 'idle'), { eyes: blink(t, 2), head: [`rotate(${8 + Math.sin(t * 1.2) * 2}deg)`, '50% 90%'], arms: [`translateY(${Math.sin(t * 4) * 6}px)`, '50% 0%'] }), 520, 1260, 0.95, { t, t0: l16.s, dur: .8 });
        h += blk(170, kt(t, span(l16, 'আপা', 'ঘরে'), { size: 76, hl: { 'পাশের': 'te glowT', 'ঘরে': 'te glowT' }, out: l17.s - .2 }));
        h += blk(275, kt(t, span(l16, 'আব্বার', 'ধুইতেছে'), { font: 'B', size: 46, color: DM, out: l17.s - .2 }));
        // erased name
        const n = P(t, T(l17, 'আপার') - .1, .4), e = P(t, tErase + .1, .8);
        if (n > 0) {
          h += blk(190, `<div class="H" style="font-size:96px;opacity:${eo(n)};clip-path:inset(0 ${(eo(e) * 100).toFixed(1)}% 0 0)">আপার নাম</div>`);
          if (e > 0 && e < 1) h += at(540 + 230 - eo(e) * 460, 200, `<div style="width:8px;height:110px;background:${RU};box-shadow:0 0 20px ${RU}"></div>`);
          h += blk(320, kt(t, span(l17, 'আম্মা', 'একবারও'), { font: 'B', size: 44, color: DM }) + kt(t, span(l17, 'নিত', 'না'), { size: 60, hl: { 'না': 'ru' } }));
        }
        return h;
      }
    });
  }

  // =============== 7. THE SCALE ==================================================
  {
    const l18 = L('কারণ আমাদের সমাজে'), l19 = L('আর মেয়ের ঘাম'), l20 = L('তাই মা-বাবা');
    const tAdh = T(l18, 'অধিকার'), tLoj = T(l19, 'লজ্জা'), tGop = T(l20, 'গোপন'), tPro = T(l20, 'প্রচার'), tMic = T(l20, 'মাইক');
    cue(l18.s - .3, 'whoosh', .5); cue(l18.s + .2, 'draw', .4); cue(tAdh - .05, 'thud', .9); cue(tLoj - .05, 'thud', .9); cue(tLoj + .1, 'creak', .6);
    cue(tGop, 'cloth', .6); cue(tMic, 'mic', .35); cue(tPro, 'crowd', .35);
    add({
      a: l18.s - 0.35, tr: 'zoom', draw(t) {
        let h = '';
        const d = P(t, l18.s, 1.0);
        const tilt = lerp(0, -9, spring(P(t, tLoj, 1.2))) + lerp(0, 0, 0);
        const piv = [540, 520];
        const arm = 330;
        const rad = tilt * Math.PI / 180;
        const Lx = piv[0] - arm * Math.cos(rad), Ly = piv[1] - arm * Math.sin(rad);
        const Rx = piv[0] + arm * Math.cos(rad), Ry = piv[1] + arm * Math.sin(rad);
        const pan = (x, y, col, content, p) => `<g transform="translate(${x} ${y})" opacity="${clamp(p * 2)}"><line x1="-80" y1="150" x2="0" y2="0" stroke="${PA}" stroke-width="3"/><line x1="80" y1="150" x2="0" y2="0" stroke="${PA}" stroke-width="3"/>
            <path d="M-120 150 h240 q-20 70 -120 70 q-100 0 -120 -70z" fill="${col}" fill-opacity=".22" stroke="${col}" stroke-width="5"/>${content}</g>`;
        const coin = P(t, tAdh - .3, .5), drop = P(t, tLoj - .3, .5);
        const coins = `<g transform="translate(0 ${lerp(-200, 0, eo(coin))})" opacity="${coin > 0 ? 1 : 0}"><ellipse cx="-30" cy="138" rx="40" ry="12" fill="${AM}"/><ellipse cx="25" cy="132" rx="40" ry="12" fill="${AM}"/><ellipse cx="0" cy="118" rx="40" ry="12" fill="${AM}"/><text x="0" y="124" font-family="H" font-size="22" text-anchor="middle" fill="#0F1420">৳</text></g>`;
        const sweat = `<g transform="translate(0 ${lerp(-200, 0, eo(drop))})" opacity="${drop > 0 ? 1 : 0}"><path d="M0 70 q34 46 0 76 q-34 -30 0 -76z" fill="${TE}"/></g>`;
        // hide cloth on teal pan
        const cl = P(t, tGop - .1, .6);
        const cloth = cl > 0 ? `<path d="M-130 ${lerp(-60, 100, eo(cl))} h260 v${lerp(0, 130, eo(cl))} h-260z" fill="#0B0F18" stroke="#2A3247" stroke-width="3"/>` : '';
        let waves = '';
        if (t > tMic) for (let i = 0; i < 3; i++) { const rp = ((t - tMic) * 1.1 + i / 3) % 1; waves += `<circle cx="0" cy="130" r="${80 + rp * 180}" fill="none" stroke="${AM}" stroke-width="3" opacity="${(1 - rp) * .5}"/>`; }
        h += svgBox(1080, 1350, `
          <path d="M440 1010 h200 M540 1010 V${piv[1]}" stroke="${PA}" stroke-width="8" stroke-linecap="round" ${dr(d)}/>
          <circle cx="${piv[0]}" cy="${piv[1]}" r="14" fill="${PA}" opacity="${d}"/>
          <line x1="${Lx}" y1="${Ly}" x2="${Rx}" y2="${Ry}" stroke="${PA}" stroke-width="8" stroke-linecap="round" ${dr(P(t, l18.s + .4, .7))}/>
          ${pan(Lx, Ly, AM, waves + coins, P(t, l18.s + .7, .5))}
          ${pan(Rx, Ry, TE, sweat + cloth, P(t, l18.s + .7, .5))}`, 0, 0);
        // labels
        const lab = (x, y, word, cls, t0, sub) => { const p = P(t, t0 - .05, .5); if (p <= 0) return ''; return at(x, y, `<div style="width:420px;text-align:center;transform:scale(${lerp(2, 1, spring(p))});opacity:${clamp(p * 3)}"><div class="H ${cls}" style="font-size:96px">${word}</div><div class="B dm" style="font-size:38px">${sub}</div></div>`); };
        h += lab(Lx - 210, Ly + 290, 'অধিকার', 'am glowA', tAdh, 'ছেলের টাকা নেওয়া');
        h += lab(Rx - 210, Ry + 290, 'লজ্জা', 'te glowT', tLoj, 'মেয়ের ঘাম নেওয়া');
        h += blk(1110, kt(t, span(l20, 'মেয়ের', 'রাখে'), { font: 'B', size: 46, hl: { 'গোপন': 'te', 'ত্যাগটারে': 'te' } }));
        h += blk(1180, kt(t, span(l20, 'ছেলের', 'করে'), { font: 'B', size: 46, hl: { 'মাইক': 'am', 'প্রচার': 'am' } }));
        h += blk(170, kt(t, span(l18, 'কারণ', 'সমাজে'), { font: 'B', size: 46, color: DM }));
        return h;
      }
    });
  }

  // =============== 8. STATEMENT ==================================================
  {
    const l21 = L('এইটা ভালোবাসা না'), l22 = L('এইটা সামাজিক');
    cue(l21.s - .1, 'hit', .7); cue(T(l21, 'না') + .05, 'pen', .7); cue(T(l22, 'সামাজিক') - .05, 'impact', .9);
    add({
      a: l21.s - 0.3, tr: 'cut', bg: ['#141A28', '#0E121C', '#070A10'], push: false, draw(t) {
        let h = '';
        const sc = (t - l21.s) * 40;
        h += `<div class="abs" style="inset:0;background:repeating-linear-gradient(0deg,transparent 0 78px,rgba(242,235,221,.06) 78px 80px);background-position:0 ${sc}px"></div>
              <div class="abs" style="left:150px;top:0;bottom:0;width:2px;background:rgba(210,88,61,.25)"></div>`;
        const st = P(t, T(l21, 'না') + .05, .4);
        h += blk(400, `<div style="position:relative;display:inline-block">${kt(t, l21.words, { size: 110, hl: { 'ভালোবাসা': 'pa' }, color: st > 0 ? DM : PA })}
          <svg class="abs" style="left:0;top:40%" width="100%" height="40" viewBox="0 0 600 40" preserveAspectRatio="none"><path d="M0 24 q150 -16 300 -2 t300 -4" stroke="${RU}" stroke-width="9" fill="none" stroke-linecap="round" ${dr(st)}/></svg></div>`);
        h += blk(640, kt(t, span(l22, 'সামাজিক', 'হিসাব'), { size: 140, lh: 1.05, hl: { 'ইজ্জতের': 'am glowA', 'হিসাব': 'am glowA' }, slam: ['ইজ্জতের'] }));
        // faint ledger numbers
        let nums = ''; for (let i = 0; i < 8; i++) { const p = P(t, l22.s + i * .1, .4); nums += `<div style="opacity:${p * .25}">${bnMoney(Math.floor(hash(i + 3) * 90000) + 1000)}</div>`; }
        h += at(850, 980, `<div class="B" style="font-size:30px;color:${AM};text-align:right;line-height:1.6">${nums}</div>`);
        return h;
      }
    });
  }

  // =============== 9. TIME RUNS OUT + DEED =======================================
  {
    const l23 = L('গত মাসে'), l24 = L('ডাক্তার কইয়া'), l25 = L('একদিন বিকালে'), l26 = L('শহরের তিন তলা');
    const tSomoy = T(l24, 'সময়'), tTin = T(l26, 'তিন'), tTola = T(l26, 'তলা'), tNam = T(l26, 'নামে'), sw = l25.s - .2;
    cue(l23.s - .3, 'drone_dark', .7); for (let k = 0; k < 5; k++) cue(l23.s + k * .95, 'beep', .22);
    cue(tSomoy - .05, 'impact_soft', .7); cue(tSomoy, 'sand', .55);
    cue(sw, 'swoosh', .6); cue(T(l25, 'সাব-রেজিস্ট্রি'), 'paper', .6);
    cue(tTin - .1, 'block', .7); cue(tTin + .25, 'block', .7); cue(tTola + .1, 'block', .8); cue(tNam, 'stamp', .9);
    add({
      a: l23.s - 0.35, tr: 'black', td: 0.9, bg: ['#161B27', '#0D1119', '#05070B'], draw(t) {
        let h = '';
        const A = 1 - P(t, sw, .5);
        if (A > 0) {
          h += `<div style="opacity:${A}">`;
          h += ch(pose(CH.abba('tired'), { eyes: blink(t), head: [`rotate(${-4 + Math.sin(t) * 1.5}deg)`, '50% 90%'] }), 540, 1290, 1.05, { t, t0: l23.s, dur: 1 });
          h += blk(190, kt(t, span(l23, 'গত', 'হইল'), { font: 'B', size: 50, color: DM }));
          h += blk(270, kt(t, span(l24, 'সময়', 'কম'), { size: 140, hl: { 'সময়': 'ru glowR', 'কম': 'ru glowR' }, slam: ['কম'] }));
          // hourglass
          const hp = P(t, tSomoy, 4);
          if (t > tSomoy - .2) h += svgBox(160, 240, `<path d="M20 10 h120 M20 230 h120 M30 10 q0 80 50 110 q-50 30 -50 110 M130 10 q0 80 -50 110 q50 30 50 110" fill="none" stroke="${PA}" stroke-width="5"/>
            <path d="M${42 + hp * 30} ${30 + hp * 70} h${76 - hp * 60} q-10 40 -38 70 q-28 -30 -38 -70z" fill="${AM}"/><path d="M80 120 v${100}" stroke="${AM}" stroke-width="3" stroke-dasharray="4 6" stroke-dashoffset="${-t * 40}"/>
            <path d="M${80 - hp * 46} 225 q${hp * 46} ${-hp * 60} ${hp * 92} 0z" fill="${AM}"/>`, 860, 460, `opacity:${eo(P(t, tSomoy - .2, .4))}`);
          h += '</div>';
        }
        const B = P(t, sw, .6);
        if (B > 0) {
          h += `<div style="opacity:${eo(B)}">`;
          h += blk(180, kt(t, span(l25, 'আব্বা', 'ডাকলেন'), { font: 'B', size: 46, color: DM, hl: { 'সাব-রেজিস্ট্রি': 'pa', 'অফিসের': 'pa' } }));
          // deed paper
          const dp = P(t, T(l25, 'সাব-রেজিস্ট্রি') - .2, .7);
          h += `<div class="abs" style="left:120px;top:${lerp(1400, 520, eo5(dp))}px;width:300px;height:400px;background:#E9E1D0;transform:rotate(${lerp(18, -7, eo(dp))}deg);box-shadow:0 30px 60px rgba(0,0,0,.5);padding:30px;box-sizing:border-box">
            <div class="H" style="color:#3A2C22;font-size:46px;text-align:center">দলিল</div>
            ${[0, 1, 2, 3, 4, 5].map(i => `<div style="height:6px;background:#B9AE98;margin:22px 0;width:${70 + hash(i) * 30}%"></div>`).join('')}
            <div style="position:absolute;right:26px;bottom:30px;width:70px;height:70px;border-radius:50%;border:4px solid ${RU};opacity:.7"></div></div>`;
          // house floors
          const f = [P(t, tTin - .1, .45), P(t, tTin + .25, .45), P(t, tTola + .1, .45)];
          const roof = P(t, tTola + .4, .5);
          let house = '';
          f.forEach((p, i) => { if (p <= 0) return; const y = 900 - i * 170; house += `<g transform="translate(0 ${(1 - eo5(p)) * -260})" opacity="${clamp(p * 3)}"><rect x="560" y="${y}" width="360" height="160" fill="rgba(232,163,61,.12)" stroke="${AM}" stroke-width="6"/>
            <rect x="${600}" y="${y + 40}" width="60" height="70" fill="none" stroke="${AM}" stroke-width="4"/><rect x="${820}" y="${y + 40}" width="60" height="70" fill="none" stroke="${AM}" stroke-width="4"/>
            <text x="740" y="${y + 105}" font-family="H" font-size="60" text-anchor="middle" fill="${AM}">${bn(i + 1)}</text></g>`; });
          if (roof > 0) house += `<path d="M540 560 L740 420 L940 560" fill="none" stroke="${AM}" stroke-width="7" stroke-linejoin="round" ${dr(roof)}/>`;
          h += svgBox(1080, 1350, house, 0, 0);
          h += blk(1110, kt(t, span(l26, 'তিন', 'বাড়িটা'), { size: 76, slam: ['তিন'] }));
          const sp = P(t, tNam, .35);
          if (sp > 0) h += at(620, 330, `<div class="H" style="font-size:54px;color:${AM};border:5px solid ${AM};padding:2px 22px 10px;transform:rotate(-5deg) scale(${lerp(2.2, 1, eo5(sp))});opacity:${clamp(sp * 3)}">আমার নামে</div>`);
          h += '</div>';
        }
        return h;
      }
    });
  }

  // =============== 10. LAMP OF LINEAGE ===========================================
  {
    const l27 = L('দলিলটা হাতে'), l28 = L('এক তলা অন্তত'), l29 = L('আব্বা আমার দিকে'), l30 = L('ভাঙা গলায়'), l31 = L('বাড়ি ওরে দিলে'), l32 = L('তুই আমার বংশের'), l33 = L('তুই না থাকলে');
    const tEk = T(l28, 'এক'), tPorer = T(l31, 'পরের'), tBati = T(l32, 'বাতি'), glare = l29.s - .1;
    cue(l27.s - .2, 'paper', .5); cue(tEk, 'shimmer', .5); cue(glare, 'drone_dark', .7); cue(T(l29, 'বেয়াদবি'), 'hit', .6);
    cue(tPorer + .1, 'snap', .9); cue(tBati - .25, 'match', .9); cue(tBati, 'impact', .8);
    add({
      a: l27.s - 0.35, tr: 'dissolve', draw(t) {
        let h = '';
        // phase A: request - house with ground floor teal
        const A = 1 - P(t, glare, .6);
        if (A > 0) {
          const hl = P(t, tEk, .5), off = P(t, glare - .1, .6);
          let hs = '';
          for (let i = 0; i < 3; i++) { const y = 860 - i * 170; const teal = i === 0 && hl > 0; hs += `<rect x="360" y="${y}" width="360" height="160" fill="${teal ? `rgba(111,184,172,${.35 * hl * (1 - off)})` : 'rgba(232,163,61,.10)'}" stroke="${teal && off < .5 ? TE : AM}" stroke-width="6"/>`; }
          hs += `<path d="M340 520 L540 380 L740 520" fill="none" stroke="${AM}" stroke-width="7"/>`;
          h += `<div style="opacity:${A}">` + svgBox(1080, 1350, hs, 0, 0);
          h += ch(pose(CH.son('neutral', 'idle'), { eyes: blink(t, 2) }), 880, 1300, .7, { t, t0: l27.s });
          h += blk(170, kt(t, span(l27, 'দলিলটা', 'কইলাম'), { font: 'B', size: 44, color: DM, out: T(l27, 'আব্বা') - .25 }));
          h += blk(170, kt(t, span(l27, 'আব্বা', 'না'), { font: 'Q', size: 72, hl: { 'আপারে': 'te glowT' } }));
          h += blk(1080, kt(t, span(l28, 'এক', 'থাকুক'), { font: 'Q', size: 60, hl: { 'এক': 'te', 'তলা': 'te', 'আপার': 'te' } }));
          h += '</div>';
        }
        // phase B: father's glare + verdict
        const B = P(t, glare, .6);
        if (B > 0) {
          const zoom = lerp(1.0, 1.25, eio(P(t, glare, 3)));
          h += `<div style="opacity:${eo(B)}">`;
          h += `<div class="abs" style="left:0;top:0;width:1080px;height:1350px;transform:scale(${zoom});transform-origin:50% 25%">` +
            ch(pose(CH.abba('droopStern'), { eyes: blink(t, 3) }), 540, 1500, 1.9, { t }) + '</div>';
          h += `<div class="abs" style="left:0;right:0;bottom:0;height:720px;background:linear-gradient(0deg,rgba(8,10,16,.95) 40%,transparent)"></div>`;
          const pOut = l31.s - .2;
          h += blk(830, kt(t, span(l29, 'যেন', 'ফেলছি'), { font: 'B', size: 46, color: DM, hl: { 'বেয়াদবি': 'ru' }, out: l30.s - .2 }));
          h += blk(830, kt(t, span(l30, 'তোর', 'দিছি'), { font: 'Q', size: 64, out: pOut }));
          // family tree: teal branch snaps
          if (t > l31.s - .3) {
            const tp = P(t, l31.s - .3, .8), sn = P(t, tPorer + .1, 1.2);
            const outT = P(t, tBati - .5, .4);
            h += svgBox(1080, 1350, `<g opacity="${1 - outT}"><path d="M540 1300 V1020 M540 1120 L380 1000 M540 1080 L700 960" stroke="${PA}" stroke-width="10" stroke-linecap="round" fill="none" ${dr(tp)}/>
              <circle cx="380" cy="990" r="26" fill="${AM}" opacity="${tp}"/>
              <g transform="translate(${sn * 40} ${ei(sn) * 260}) rotate(${sn * 50} 620 1020)" opacity="${1 - sn * .7}"><path d="M560 1060 L700 960" stroke="${TE}" stroke-width="10" stroke-linecap="round" ${dr(tp)}/><circle cx="700" cy="955" r="26" fill="${TE}" opacity="${tp}"/></g></g>`, 0, 0);
            h += blk(830, kt(t, span(l31, 'বাড়ি', 'যাবে'), { font: 'Q', size: 64, hl: { 'পরের': 'te', 'বংশে': 'te' }, out: tBati - .5 }));
          }
          // lamp
          const lp = P(t, tBati - .3, .6);
          if (lp > 0) {
            const fl = 1 + noise1(t * 8) * .08;
            h += svgBox(300, 340, `<circle cx="150" cy="120" r="${110 * eo(lp)}" fill="${AM}" opacity=".18"/><circle cx="150" cy="120" r="${60 * eo(lp)}" fill="${AM}" opacity=".25"/>
              <path d="M150 ${50 - 20 * fl} q${44 * fl} 60 0 ${110} q${-44 * fl} -50 0 ${-110}z" fill="${AM}" opacity="${clamp(lp * 2)}" transform="scale(1 ${fl}) " transform-origin="150 160"/>
              <path d="M150 90 q14 30 0 60 q-14 -30 0 -60z" fill="#FFF3D6" opacity="${clamp(lp * 2)}"/>
              <path d="M80 170 h140 l-26 70 h-88z" fill="none" stroke="${PA}" stroke-width="7"/>`, 390, 660);
            h += blk(1010, kt(t, l32.words, { size: 110, hl: { 'বংশের': 'am glowA', 'বাতি': 'am glowA' }, slam: ['বাতি'], out: l33.s - .1 }));
          }
          h += blk(1060, kt(t, l33.words, { font: 'Q', size: 60, keepQuotes: false }));
          h += '</div>';
        }
        return h;
      }
    });
  }

  // =============== 11. THE FREEZE (key moment) ===================================
  const FREEZE = (() => { const l37 = L('আমি দেখলাম'); const tw = wd(l37, 'থামল'); return { a: tw.s + 0.35, d: 1.0 }; })();
  window.FREEZE = FREEZE;
  {
    const l34 = L('ঠিক ওই মুহূর্তে'), l35 = L('হাতে এক গামলা'), l36 = L('আপা কথাটা'), l37 = L('আমি দেখলাম'), l38 = L('তারপর আর কিছু');
    cue(l34.s - .3, 'door', .6); cue(T(l35, 'গামলা'), 'water', .4); cue(T(l36, 'পুরাপুরি'), 'echo', .5);
    cue(FREEZE.a - .02, 'freeze', 1.0); cue(FREEZE.a + FREEZE.d, 'release', .6);
    add({
      a: l34.s - 0.35, tr: 'leak', td: 0.9, bg: ['#1C2230', '#10141E', '#06080D'], glow: ['#F2C98A', 760, 600, 600, .10], draw(t0) {
        // time warp: everything (except brand) holds during freeze
        const fz = t0 >= FREEZE.a && t0 < FREEZE.a + FREEZE.d;
        const t = fz ? FREEZE.a : t0;
        let h = '';
        // door light
        const dp = P(t, l34.s - .3, .8);
        h += `<div class="abs" style="left:700px;top:240px;width:${260 * eo(dp)}px;height:900px;background:linear-gradient(90deg,rgba(242,201,138,.0),rgba(242,201,138,.22));border-left:3px solid rgba(242,201,138,${.5 * dp})"></div>`;
        // apa walks in, then stops
        const wp = P(t, l34.s, 1.6);
        const stopAt = T(l37, 'হাতটা');
        const handHold = P(t, stopAt, .3);
        let apa = CH.apa(t > T(l36, 'আপা') ? (t > stopAt ? 'still' : 'tired') : 'tired', 'bowl');
        // steam animation unless frozen
        const st = Math.sin(t * 3);
        apa = pose(apa, { eyes: fz ? '' : blink(t, 5), steam: [`translateY(${(-(t * 30) % 20).toFixed(1)}px) scaleX(${1 + st * .08})`, '50% 100%'], arms: [`translateY(${handHold > 0 ? 0 : Math.sin(t * 5) * 4}px)`, '50% 0%'] });
        const x = lerp(1050, 640, eo(wp));
        h += ch(apa, x, 1250, 1.05, { t, ph: 1 });
        // abba on bed left
        h += ch(pose(CH.abba('droop'), { eyes: fz ? '' : blink(t, 2) }), 250, 1250, .78, { t, t0: l34.s - .3 });
        // texts
        h += blk(170, kt(t, span(l34, 'ঠিক', 'মুহূর্তে'), { font: 'B', size: 46, color: DM, out: l36.s - .2 }));
        h += blk(240, kt(t, span(l35, 'কুসুম', 'তোয়ালে'), { size: 76, hl: { 'কুসুম': 'te', 'গরম': 'te', 'পানি': 'te' }, out: l36.s - .2 }));
        h += blk(200, kt(t, span(l36, 'আপা', 'শুনছে'), { size: 84, hl: { 'পুরাপুরি': 'te glowT' }, out: l37.s - .1 }));
        h += blk(180, kt(t, span(l37, 'ওর', 'থামল'), { size: 92, lh: 1.15, hl: { 'এক': 'te glowT', 'সেকেন্ডের': 'te glowT' } }));
        // echo lines toward apa
        if (t > T(l36, 'পুরাপুরি') - .2 && t < l37.s) for (let i = 0; i < 3; i++) { const rp = ((t - l36.s) * .8 + i / 3) % 1; h += `<div class="abs" style="left:${300 + rp * 300}px;top:${640 - 40 * i}px;width:120px;height:4px;background:${PA};opacity:${(1 - rp) * .5}"></div>`; }
        h += blk(1250, kt(t, l38.words, { font: 'B', size: 44, color: DM }));
        // freeze styling
        const fp = t0 >= FREEZE.a ? P(t0, FREEZE.a, .15) * (1 - P(t0, FREEZE.a + FREEZE.d, .8)) : 0;
        let ov = '';
        if (fp > 0) {
          ov = `<div class="abs" style="inset:40px;border:2px solid rgba(242,235,221,${.5 * fp})"></div>
            <div class="abs" style="right:70px;bottom:60px;font:600 26px Fr;letter-spacing:6px;color:rgba(242,235,221,${.8 * fp})">❚❚ ${fz ? '00:0' + (1 - Math.floor((t0 - FREEZE.a) / FREEZE.d)) : '00:00'}</div>`;
        }
        return `<div style="filter:grayscale(${fp * .9}) brightness(${1 - fp * .15}) contrast(${1 + fp * .1})">${h}</div>${ov}`;
      }
    });
  }

  // =============== 12. THE PICKLE ================================================
  {
    const l39 = L('আপা কাঁদে নাই'), l40 = L('চিল্লায় নাই'), l41 = L('চুপচাপ খাটের'), l42 = L('রান্নাঘরে');
    const tAch = T(l42, 'আচার');
    cue(l39.s - .3, 'piano_soft', .8); cue(T(l41, 'কালকে'), 'tick', .3); cue(tAch - .1, 'jar', .7); cue(T(l42, 'ভুলিস'), 'shimmer', .4);
    add({
      a: l39.s - 0.35, tr: 'dissolve', td: 1.0, bg: ['#2B2416', '#141720', '#07090E'], glow: [AM, 540, 760, 620, .16], dust: 1.3, draw(t) {
        let h = '';
        const qPhase = l41.s + 1.0;
        const A = 1 - P(t, T(l41, 'তোর') - .3, .6);
        if (A > 0) {
          h += `<div style="opacity:${A}">`;
          h += blk(320, kt(t, l39.words, { size: 120, hl: { 'নাই': 'te' } }));
          h += blk(480, kt(t, l40.words, { size: 120, hl: { 'নাই': 'te' } }));
          h += blk(680, kt(t, span(l41, 'চুপচাপ', 'কইল'), { font: 'B', size: 46, color: DM }));
          h += '</div>';
        }
        h += ch(pose(CH.apa('soft', 'idle'), { eyes: blink(t, 1), head: [`rotate(${-6 + Math.sin(t * .7) * 1.5}deg)`, '50% 90%'] }), 220, 1300, .9, { t, t0: l39.s, op: .95 });
        const B = P(t, T(l41, 'তোর') - .3, .6);
        if (B > 0) {
          h += blk(190, kt(t, span(l41, 'তোর', 'না'), { font: 'Q', size: 62, keepQuotes: false, out: l42.s - .2 }), `opacity:${eo(B)}`);
          h += blk(170, kt(t, l42.words, { font: 'Q', size: 66, hl: { 'জলপাইয়ের': 'am glowA', 'আচার': 'am glowA', 'পছন্দের': 'am' } }));
        }
        // jar
        const jp = P(t, tAch - .3, 1.0);
        if (jp > 0) {
          let ol = ''; for (let i = 0; i < 14; i++) { const p = P(t, tAch + i * .12, .4); const x = 60 + (i % 4) * 36 + (Math.floor(i / 4) % 2) * 18, y = 270 - Math.floor(i / 4) * 34; ol += `<ellipse cx="${x}" cy="${y - (1 - eo(p)) * 120}" rx="17" ry="13" fill="#8C9A3A" opacity="${p > 0 ? .95 : 0}"/>`; }
          h += svgBox(240, 340, `<path d="M30 90 h180 v190 q0 30 -30 30 h-120 q-30 0 -30 -30z" fill="rgba(200,160,60,.15)" stroke="${PA}" stroke-width="6" ${dr(jp)}/>${ol}
            <rect x="50" y="40" width="140" height="44" rx="8" fill="${RU}" transform="translate(0 ${(1 - eo(P(t, tAch + 1.6, .5))) * -80})" opacity="${P(t, tAch + 1.6, .2)}"/>
            <rect x="60" y="150" width="120" height="70" rx="6" fill="${PA}" opacity="${P(t, tAch + 1.8, .4) * .9}"/><text x="120" y="196" font-family="H" font-size="34" text-anchor="middle" fill="#3A2C22" opacity="${P(t, tAch + 1.8, .4)}">আচার</text>`, 600, 640);
        }
        return h;
      }
    });
  }

  // =============== 13. THE SIGNATURE =============================================
  {
    const l43 = L('ওই দিন আমি চাইলে'), l44 = L('বলতে পারতাম'), l45 = L('আমি বলি নাই'), l46 = L('আমি মাথা নিচু'), l47 = L('আর নিজেরে বুঝাইছি');
    const tSoi = T(l46, 'সই'), tOrd = T(l44, 'অর্ধেক');
    cue(l43.s - .3, 'whoosh', .5); cue(l43.s + .1, 'draw', .4); cue(tOrd, 'shimmer', .4);
    cue(l45.s - .4, 'cut_silence', 1); cue(l45.s - .03, 'impact', 1.0); cue(tSoi, 'pen', .9); cue(l46.e + .1, 'thud', .6);
    add({
      a: l43.s - 0.35, tr: 'zoom', draw(t) {
        let h = '';
        const big = P(t, l45.s - .1, .3), bigOut = P(t, l46.s - .25, .4);
        const dim = big * (1 - bigOut);
        // phase A: paths
        const A = 1 - P(t, l45.s - .15, .3);
        if (A > 0) {
          const fp = P(t, l43.s, 1.4);
          const ghost = P(t, tOrd - .1, .6);
          h += `<div style="opacity:${A}">` + svgBox(1080, 1350, `
            <path d="M540 1300 V900" stroke="${PA}" stroke-width="10" stroke-linecap="round" ${dr(fp)}/>
            <path d="M540 900 Q540 760 300 640" stroke="${TE}" stroke-width="10" fill="none" stroke-linecap="round" ${dr(P(t, l43.s + .8, 1))}/>
            <path d="M540 900 Q540 760 780 640" stroke="${AM}" stroke-width="10" fill="none" stroke-linecap="round" ${dr(P(t, l43.s + .8, 1))}/>
            <g opacity="${ghost}" transform="translate(420 300)"><rect x="0" y="80" width="240" height="210" fill="rgba(111,184,172,.12)" stroke="${TE}" stroke-width="5" stroke-dasharray="14 10"/><rect x="120" y="80" width="120" height="210" fill="rgba(232,163,61,.12)"/><path d="M-10 90 L120 0 L250 90" fill="none" stroke="${PA}" stroke-width="5"/><text x="120" y="200" font-family="H" font-size="60" fill="${TE}" text-anchor="middle">½</text></g>`, 0, 0);
          h += at(70, 680, `<div class="H te" style="font-size:52px;opacity:${eo(P(t, T(l43, 'দাঁড়ায়া'), .4))}">দাঁড়ায়া যাওয়া</div>`);
          h += at(760, 680, `<div class="H am" style="font-size:52px;opacity:${eo(P(t, T(l43, 'সই'), .4))}">সই করা</div>`);
          h += blk(180, kt(t, span(l43, 'ওই', 'পারতাম'), { font: 'B', size: 46, color: DM, hl: { 'দাঁড়ায়া': 'te' }, out: l44.s - .2 }));
          h += blk(180, kt(t, l44.words, { font: 'Q', size: 58, hl: { 'অর্ধেক': 'te glowT' } }));
          h += '</div>';
        }
        // phase B: I didn't say it
        if (dim > 0) h += blk(520, `<div style="${shake(t, l45.s, 18)}">` + kt(t, l45.words, { size: 170, hl: { 'বলি': 'ru glowR', 'নাই': 'ru glowR' }, slam: ['আমি'], out: l46.s - .25 }) + '</div>');
        // phase C: signing
        const C = P(t, l46.s - .25, .5);
        if (C > 0) {
          h += `<div style="opacity:${eo(C)}">`;
          h += ch(pose(CH.son('guilt', 'idle'), { eyes: blink(t, 1), head: [`rotate(${lerp(0, 14, eo(P(t, T(l46, 'মাথা'), .8)))}deg)`, '50% 90%'] }), 250, 1300, .95, { t });
          h += `<div class="abs" style="left:470px;top:520px;width:500px;height:560px;background:#E9E1D0;transform:rotate(3deg);box-shadow:0 30px 60px rgba(0,0,0,.5);padding:40px;box-sizing:border-box">
            <div class="H" style="color:#3A2C22;font-size:50px;text-align:center">দলিল</div>
            ${[0, 1, 2, 3, 4].map(i => `<div style="height:6px;background:#B9AE98;margin:24px 0;width:${70 + hash(i + 4) * 30}%"></div>`).join('')}
            <svg class="abs" style="left:40px;bottom:50px" width="420" height="120" viewBox="0 0 420 120"><line x1="0" y1="100" x2="420" y2="100" stroke="#8A7F6C" stroke-width="3"/>
            <path d="M20 80 c30 -80 60 30 90 -20 s40 -50 60 10 50 -30 80 0 40 20 120 -40" fill="none" stroke="#1C2440" stroke-width="7" stroke-linecap="round" ${dr(P(t, tSoi, .9))}/></svg></div>`;
          h += blk(180, kt(t, span(l46, 'আমি', 'দিছি'), { size: 76, hl: { 'সই': 'am' }, out: l47.s - .1 }));
          h += blk(180, kt(t, span(l47, 'আর', 'বুঝাইছি'), { font: 'B', size: 46, color: DM }) + kt(t, span(l47, 'মরণাপন্ন', 'না'), { font: 'Q', size: 58, mode: 'fade' }));
          h += '</div>';
        }
        return h;
      }
    });
  }

  // =============== 14. GREED =====================================================
  {
    const l48 = L('সত্য কথা হইল'), l49 = L('আমার ভেতরে লোভ'), l50 = L('তিন তলা বাড়ির লোভ'), l51 = L('বংশের বাতি হইয়া');
    const tLov = T(l49, 'লোভ');
    cue(l48.s - .3, 'riser', .7); cue(T(l48, 'ভয়'), 'tick', .4); cue(tLov - .04, 'impact', 1.0);
    for (let k = 0; k < 8; k++) cue(tLov + .5 + k * .8, 'heartbeat', .55);
    cue(T(l51, 'আরাম'), 'shimmer', .4);
    add({
      a: l48.s - 0.35, tr: 'glitch', td: .5, bg: ['#22140F', '#120E10', '#070507'], draw(t) {
        let h = '';
        const pulse = t > tLov ? 1 + Math.max(0, Math.sin((t - tLov - .5) * Math.PI * 2 / .8)) ** 8 * .05 : 1;
        // golden house behind
        const hp = P(t, T(l50, 'বাড়ির') - .2, .8);
        if (hp > 0) h += svgBox(1080, 1350, `<g opacity="${hp * .5}" style="filter:drop-shadow(0 0 20px ${AM})"><path d="M300 1250 V750 H780 V1250 M300 920 H780 M300 1090 H780 M260 760 L540 560 L820 760" fill="none" stroke="${AM}" stroke-width="7" ${dr(hp)}/></g>`, 0, 0);
        h += blk(180, kt(t, span(l48, 'সত্য', 'হইল'), { font: 'B', size: 48, color: DM }));
        const strike = P(t, T(l48, 'ছিল') + .1, .4);
        h += blk(260, `<div style="position:relative;display:inline-block">${kt(t, span(l48, 'আব্বার', 'না'), { font: 'B', size: 56, hl: { 'ভয়': 'pa' } })}<div class="abs" style="left:0;top:52%;height:6px;background:${RU};width:${strike * 100}%"></div></div>`);
        h += blk(400, `<div style="transform:scale(${pulse.toFixed(4)});${shake(t, tLov, 20, .6)}">` + kt(t, span(l49, 'লোভ', 'লোভ'), { size: 400, lh: 1, hl: { 'লোভ': 'ru glowR' }, slam: ['লোভ'] }) + '</div>');
        h += blk(880, kt(t, span(l50, 'তিন', 'বাড়ির'), { size: 80, hl: { 'বাড়ির': 'am' } }));
        h += blk(1010, kt(t, l51.words, { size: 64, hl: { 'বংশের': 'am glowA', 'বাতি': 'am glowA', 'আরাম': 'am' } }));
        return h;
      }
    });
  }

  // =============== 15. MYTH vs TRUTH, DUTY vs PRIDE, POCKET ======================
  {
    const l52 = L('আমরা খুব সহজেই'), l53 = L('তারা কোনোদিন'), l54 = L('করে'), l55 = L('বাবা-মাও মানুষ'), l56 = L('তারাও রক্তের'), l57 = L('তারাও যে সন্তান'), l58 = L('আর আমরা');
    const tKore = l54.s, tDay = T(l57, 'দায়িত্ব'), tGorbo = T(l57, 'গর্ব'), tPocket = T(l58, 'পকেটে'), split = l57.s - .2, pk = l58.s - .2;
    cue(l52.s - .3, 'whoosh', .5); cue(tKore - .04, 'impact', 1.0); cue(tKore + .05, 'glitch', .5);
    cue(T(l56, 'রক্তের'), 'drip', .6); cue(T(l56, 'বংশের'), 'thud', .5);
    cue(split, 'swoosh', .7); cue(T(l57, 'পা'), 'water', .4); cue(tDay, 'hit', .6); cue(T(l57, 'টাকা'), 'coins', .5); cue(tGorbo, 'hit', .7);
    cue(pk, 'whoosh', .5); cue(tPocket, 'cloth', .7);
    add({
      a: l52.s - 0.35, tr: 'cut', draw(t) {
        let h = '';
        // phase A: myth
        const A = 1 - P(t, T(l56, 'রক্তের') - .4, .4);
        if (A > 0) {
          const strike = P(t, tKore, .35);
          h += `<div style="opacity:${A}">`;
          h += blk(240, kt(t, span(l52, 'আমরা', 'বলি'), { font: 'B', size: 48, color: DM }));
          h += blk(320, `<div style="position:relative;display:inline-block">${kt(t, span(l52, 'বাবা-মা', 'নিঃস্বার্থ'), { size: 110, color: strike > 0 ? DM : PA })}<div class="abs" style="left:-10px;top:48%;height:10px;background:${RU};width:${strike * 104}%;box-shadow:0 0 20px ${RU}"></div></div>`);
          h += blk(500, kt(t, l53.words, { font: 'B', size: 54, color: strike > 0 ? DM : PA }));
          h += blk(640, `<div style="${shake(t, tKore, 22)}">` + kt(t, l54.words, { size: 230, hl: { 'করে': 'ru glowR' }, slam: ['করে'] }) + '</div>');
          h += blk(950, kt(t, l55.words, { size: 100, hl: { 'মানুষ': 'pa' } }));
          h += '</div>';
        }
        // phase B: blood vs name
        const B = P(t, T(l56, 'রক্তের') - .4, .4) * (1 - P(t, split, .4));
        if (B > 0) {
          const dp = P(t, T(l56, 'রক্তের'), .6), np = P(t, T(l56, 'বংশের'), .6);
          h += `<div style="opacity:${B}">`;
          h += svgBox(1080, 700, `<path d="M300 ${200 + (1 - eo(dp)) * -100} q40 60 0 100 q-40 -40 0 -100z" fill="${RU}" opacity="${dp}" transform="scale(.8) translate(80 120)"/>
            <rect x="${560}" y="210" width="${380 * eo(np)}" height="150" rx="10" fill="rgba(232,163,61,.18)" stroke="${AM}" stroke-width="6"/>
            <text x="750" y="310" font-family="H" font-size="70" text-anchor="middle" fill="${AM}" opacity="${np}">বংশের নাম</text>
            <text x="320" y="480" font-family="B" font-size="44" text-anchor="middle" fill="${DM}" opacity="${dp}">রক্ত</text>
            <text x="460" y="320" font-family="H" font-size="80" text-anchor="middle" fill="${PA}" opacity="${np}">&lt;</text>`, 0, 250);
          h += blk(900, kt(t, span(l56, 'তারাও', 'ভালোবাসে'), { font: 'B', size: 52, hl: { 'রক্তের': 'ru', 'বংশের': 'am', 'নামটারে': 'am' } }));
          h += '</div>';
        }
        // phase C: duty vs pride
        const C = P(t, split, .6) * (1 - P(t, pk, .5));
        if (C > 0) {
          const sx = (1 - eo5(C)) * 540;
          h += `<div class="abs" style="left:${-sx}px;top:0;width:540px;height:1350px;background:linear-gradient(180deg,rgba(111,184,172,.16),rgba(111,184,172,.04));opacity:${C}">
            ${ch(pose(CH.apa('tired', 'bowl'), { eyes: blink(t, 3), steam: [`translateY(${(-(t * 30) % 20).toFixed(1)}px)`, '50% 100%'] }), 270, 1200, .95, { t })}
            ${blk(300, kt(t, span(l57, 'দায়িত্ব', 'দায়িত্ব'), { size: 116, hl: { 'দায়িত্ব': 'te glowT' }, slam: ['দায়িত্ব'] }), 'padding:0')}
            ${blk(200, kt(t, span(l57, 'সামনে', 'ধোয়ায়'), { font: 'B', size: 40, color: DM }), 'padding:0 30px')}</div>
          <div class="abs" style="left:${540 + sx}px;top:0;width:540px;height:1350px;background:linear-gradient(180deg,rgba(232,163,61,.16),rgba(232,163,61,.04));opacity:${C}">
            ${ch(pose(CH.son('smile', 'phone'), { eyes: blink(t, 2) }), 270, 1200, .95, { t })}
            ${blk(300, kt(t, span(l57, 'গর্ব', 'গর্ব'), { size: 130, hl: { 'গর্ব': 'am glowA' }, slam: ['গর্ব'] }), 'padding:0')}
            ${blk(200, kt(t, span(l57, 'দূর', 'দেয়'), { font: 'B', size: 40, color: DM }), 'padding:0 30px')}</div>`;
          // flying coins on the right
          for (let i = 0; i < 6; i++) { const cp = P(t, T(l57, 'টাকা') + i * .12, .9); if (cp <= 0 || cp >= 1) continue; h += at(800 - cp * 200 + i * 20, 900 - Math.sin(cp * Math.PI) * 300, `<div style="width:44px;height:44px;border-radius:50%;background:${AM};opacity:${1 - cp};font:30px H;color:#0F1420;text-align:center;line-height:44px">৳</div>`); }
        }
        // phase D: pocket
        const D = P(t, pk, .5);
        if (D > 0) {
          const tp = P(t, tPocket - .5, .9);
          h += `<div style="opacity:${eo(D)}">`;
          h += blk(200, kt(t, span(l58, 'আর', 'ছেলেরা'), { size: 76, hl: { 'ভালো': 'am', 'ছেলেরা': 'am' } }));
          h += blk(330, kt(t, span(l58, 'এই', 'দিয়া'), { font: 'B', size: 46, color: DM, hl: { 'অন্যায়টারে': 'ru' } }));
          // tag
          const ty = lerp(520, 850, ei(tp)), tr = lerp(-6, 4, tp), ts = lerp(1, .7, ei(tp));
          h += `<div class="abs" style="left:290px;top:${ty}px;width:500px;text-align:center;transform:rotate(${tr}deg) scale(${ts});clip-path:inset(0 0 ${ei(P(t, tPocket - .1, .5)) * 100}% 0)">
            <div class="Q" style="display:inline-block;background:#E9E1D0;color:#3A2C22;font-size:58px;padding:12px 40px 22px;border-radius:8px;position:relative">“বাবা-মায়ের ইচ্ছা”<div style="position:absolute;left:18px;top:50%;width:16px;height:16px;border-radius:50%;background:#0F1420;margin-top:-8px"></div></div></div>`;
          h += svgBox(1080, 1350, `<path d="M330 920 h420 v120 q0 120 -210 140 q-210 -20 -210 -140z" fill="#232B3E" stroke="${PA}" stroke-width="6"/><path d="M330 920 q210 70 420 0" fill="none" stroke="${PA}" stroke-width="4" opacity=".6"/>`, 0, 0);
          h += blk(1300 - 60, kt(t, span(l58, 'চুপচাপ', 'নিই'), { font: 'B', size: 44, hl: { 'পকেটে': 'pa' } }));
          h += '</div>';
        }
        return h;
      }
    });
  }

  // =============== 16. BUS + EYES ================================================
  {
    const l59 = L('কালকে সকালে বাসে'), l60 = L('ওর চোখে কোনো রাগ'), l61 = L('কোনো অভিমানও'), l62 = L('ওর চোখে যা ছিল');
    const tEye = l60.s - .3, tVoy = T(l62, 'ভয়ংকর');
    cue(l59.s - .4, 'bus', .6); cue(T(l59, 'বয়ামটা'), 'jar', .5); cue(tEye, 'drone_dark', .8); cue(tVoy - .05, 'impact', .9); cue(tVoy + .1, 'riser_down', .5);
    add({
      a: l59.s - 0.4, tr: 'slide', bg: ['#2A2B33', '#151821', '#08090E'], draw(t) {
        let h = '';
        const A = 1 - P(t, tEye, .6);
        if (A > 0) {
          // bus window + passing street
          let road = ''; for (let i = 0; i < 9; i++) { const x = ((i * 180 - t * 260) % 1620 + 1620) % 1620 - 270; road += `<rect x="${x}" y="${300 + hash(i) * 120}" width="${60 + hash(i + 1) * 120}" height="${200 + hash(i + 2) * 200}" fill="#2B3245" opacity=".9"/>`; }
          h += `<div style="opacity:${A}">` + `<div class="abs" style="left:110px;top:260px;width:860px;height:560px;border-radius:40px;overflow:hidden;border:14px solid #3A4258;background:linear-gradient(180deg,#F2C98A 0%,#B97F57 60%,#2B3245 100%)">${svgBox(860, 560, road, 0, 0)}</div>`;
          // jar handed over
          const jp = P(t, T(l59, 'বয়ামটা') - .3, 1);
          h += svgBox(140, 190, `<path d="M15 50 h110 v110 q0 20 -20 20 h-70 q-20 0 -20 -20z" fill="rgba(200,160,60,.35)" stroke="${PA}" stroke-width="5"/><rect x="28" y="22" width="84" height="28" rx="6" fill="${RU}"/>`, lerp(760, 300, eio(jp)), 880 - Math.sin(jp * Math.PI) * 60);
          h += blk(1110, kt(t, span(l59, 'আপা', 'দিল'), { font: 'B', size: 48, hl: { 'আচারের': 'am', 'বয়ামটা': 'am' } }));
          h += blk(170, kt(t, span(l59, 'কালকে', 'সময়'), { font: 'B', size: 46, color: DM }));
          h += '</div>';
        }
        const B = P(t, tEye, .8);
        if (B > 0) {
          const z = lerp(3.2, 4.0, eio(P(t, tEye, 12)));
          let face = pose(CH.apa('hollow', 'idle'), { eyes: [`scale(${lerp(1, .85, P(t, tVoy, .4))})`] });
          h += `<div style="opacity:${eo(B)}"><div class="abs" style="left:540px;top:520px;width:0;height:0">
            <svg class="abs" viewBox="0 0 400 760" width="${400 * z}" height="${760 * z}" style="left:${-200 * z}px;top:${-144 * z}px">${face}</svg></div>
            <div class="abs" style="inset:0;background:linear-gradient(0deg,rgba(8,10,16,.95) 25%,transparent 60%,rgba(8,10,16,.5))"></div>`;
          h += blk(900, kt(t, span(l60, 'রাগ', 'না'), { size: 70, hl: { 'রাগ': 'pa' }, out: l62.s - .2 }));
          h += blk(1000, kt(t, l61.words, { size: 70, out: l62.s - .2 }));
          h += blk(890, kt(t, span(l62, 'ওর', 'ছিল'), { font: 'B', size: 48, color: DM }));
          h += blk(970, kt(t, span(l62, 'সেইটা', 'ভয়ংকর'), { size: 104, hl: { 'ভয়ংকর': 'ru glowR' }, slam: ['ভয়ংকর'] }));
          h += '</div>';
        }
        return h;
      }
    });
  }

  // =============== 17. UNPAID NURSE + END CARD ===================================
  {
    const l63 = L('আপা বুঝে গেছে'), l64 = L('ওর জায়গাটা একজন'), l65 = L('যার ডিউটি');
    const tNurse = T(l64, 'নার্সের'), tDhon = T(l65, 'ধন্যবাদও'), endA = l65.e + 0.9;
    cue(l63.s - .3, 'swoosh', .5); cue(T(l63, 'সন্তানের'), 'erase', .5); cue(l64.s, 'draw', .4); cue(tNurse - .05, 'stamp', .8);
    cue(T(l65, 'ডিউটি'), 'tick', .4); cue(tDhon, 'impact_soft', .7); cue(endA, 'end_note', 1.0);
    add({
      a: l63.s - 0.35, tr: 'iris', draw(t) {
        let h = '';
        const A = 1 - P(t, l64.s - .3, .5);
        if (A > 0) {
          const er = P(t, T(l63, 'না') + .1, .8);
          h += `<div style="opacity:${A}">`;
          h += blk(200, kt(t, span(l63, 'আপা', 'গেছে'), { font: 'B', size: 48, color: DM }));
          // family frame with apa removed
          h += `<div class="abs" style="left:290px;top:340px;width:500px;height:560px;border:12px solid #6B4A3A;background:#1B2232;overflow:hidden">
            <svg class="abs" viewBox="0 0 400 760" width="300" height="570" style="left:-10px;top:60px;opacity:${1 - er};filter:blur(${er * 8}px)">${CH.apa('soft', 'idle')}</svg>
            <svg class="abs" viewBox="0 0 400 760" width="300" height="570" style="left:200px;top:60px">${CH.son('smile', 'idle')}</svg></div>`;
          h += blk(980, kt(t, span(l63, 'এই', 'না'), { size: 70, hl: { 'সন্তানের': 'te' } }));
          h += '</div>';
        }
        const B = P(t, l64.s - .3, .6) * (1 - P(t, endA - .2, .8));
        if (B > 0) {
          const bp = P(t, l64.s - .1, .8);
          const row = (label, val, t0, cls) => { const p = P(t, t0, .4); return `<div style="display:flex;justify-content:space-between;font-size:44px;margin-top:14px;opacity:${eo(p)}"><span class="B dm">${label}</span><span class="H ${cls}">${val}</span></div>`; };
          h += `<div style="opacity:${B}">`;
          h += `<div class="abs" style="left:190px;top:${lerp(420, 300, eo(bp))}px;width:700px;border:5px solid ${TE};border-radius:28px;background:linear-gradient(180deg,#152027,#0F171C);padding:40px 56px 50px;box-sizing:border-box;opacity:${eo(bp)};box-shadow:0 30px 80px rgba(0,0,0,.6)">
            <div style="font:600 24px Fr;letter-spacing:7px;color:${TE}">DUTY ROSTER</div>
            <div style="display:flex;gap:30px;align-items:center;margin-top:18px">
              <svg viewBox="136 60 128 128" width="150" height="150" style="overflow:hidden;border-radius:50%;background:#0B1116;border:4px solid ${TED}">${CH.apa('tired', 'idle')}</svg>
              <div>${kt(t, span(l64, 'বিনা', 'নার্সের'), { size: 78, lh: 1.05, hl: { 'নার্সের': 'te glowT' }, slam: ['নার্সের'] })}</div></div>
            <div style="height:2px;background:${TED};margin:26px 0 8px"></div>
            ${row('ডিউটি', '৪ বছর · ২৪/৭', T(l65, 'ডিউটি'), 'pa')}
            ${row('বেতন', '৳০', T(l65, 'ডিউটি') + .4, 'ru')}
            ${row('ধন্যবাদ', '০', tDhon, 'ru')}</div>`;
          h += blk(1020, kt(t, span(l65, 'বিদায়ের', 'না'), { font: 'B', size: 50, hl: { 'ধন্যবাদও': 'ru' } }));
          h += '</div>';
        }
        // end card
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

  // brand hides for end card
  const last = SCN[SCN.length - 1];
  window.STAGEFX = t => { if (t > last.noBrandAfter) document.getElementById('brand').style.opacity = String(1 - clamp((t - last.noBrandAfter) / 0.6)); else document.getElementById('brand').style.opacity = '1'; };
  // music sections for the score
  window.SECTIONS = SCN.map(s => s.a);
  defineScenes(SCN);
  window.READY = false;
  document.fonts.ready.then(() => { renderFrame(0); window.READY = true; });
})();
