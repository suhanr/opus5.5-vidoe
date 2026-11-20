// Flat-vector character kit for "The Unsaid". Each builder returns SVG markup
// for a 400x760 viewBox (ground line y=740). Parts carry ids/classes so the
// video can animate them (head, arm, eyes, steam ...).
(function () {
  const INK = '#1C1714';
  const C = {
    skinA: '#B97F57', skinAs: '#9E6845',   // son
    skinB: '#A9714B', skinBs: '#8D5B3B',   // apa
    skinC: '#B88663', skinCs: '#9A6C4D',   // abba
    skinD: '#B17B57', skinDs: '#946143',   // amma
    hair: '#1E1A19', grey: '#C9C5BF', white: '#EEEAE2',
    amber: '#E8A33D', teal: '#5FA59A', tealD: '#3F7D74', rust: '#C9543A',
    rose: '#9C5A63', roseD: '#7A4049', cream: '#E9E1D0', creamS: '#CFC5B1',
    navy: '#2B3245', navyD: '#20263A', paper: '#F2EBDD'
  };

  // ---------- face ------------------------------------------------------
  // expr: neutral | smile | proud | tired | stern | guilt | hollow | droop | still
  function face(cx, cy, expr, skinS, o = {}) {
    const e = [];
    const ex = 21, ey = cy + 4;
    const eye = (x, kind) => {
      if (kind === 'closed') return `<path d="M${x - 7} ${ey} q7 6 14 0" stroke="${INK}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
      if (kind === 'lid') return `<path d="M${x - 7} ${ey} a7 6 0 0 0 14 0z" fill="${INK}"/><line x1="${x - 8}" y1="${ey}" x2="${x + 8}" y2="${ey}" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>`;
      if (kind === 'down') return `<path d="M${x - 7} ${ey + 2} a7 5 0 0 0 14 0z" fill="${INK}"/><line x1="${x - 8}" y1="${ey + 2}" x2="${x + 8}" y2="${ey + 2}" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>`;
      if (kind === 'wide') return `<ellipse cx="${x}" cy="${ey}" rx="7.5" ry="8" fill="#F4EFE6"/><circle cx="${x}" cy="${ey + 1}" r="4.6" fill="${INK}"/>`;
      return `<ellipse cx="${x}" cy="${ey}" rx="5" ry="6.2" fill="${INK}"/>`;
    };
    const brow = (x, tilt, lift = 0) => { // tilt>0 => inner end up (sad), <0 => inner down (stern)
      const s = x < cx ? 1 : -1; // inner side direction
      const y = ey - 17 - lift;
      return `<line x1="${x - 9 * s}" y1="${y}" x2="${x + 9 * s}" y2="${y - tilt}" stroke="${INK}" stroke-width="3.6" stroke-linecap="round"/>`;
    };
    const L = cx - ex, R = cx + ex, my = cy + 34;
    const map = {
      neutral: [eye(L), eye(R), brow(L, 0), brow(R, 0), `<path d="M${cx - 9} ${my} h18" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`],
      smile: [eye(L), eye(R), brow(L, 1, 2), brow(R, 1, 2), `<path d="M${cx - 12} ${my - 3} q12 11 24 0" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>`],
      proud: [eye(L, 'closed'), eye(R, 'closed'), brow(L, -2, 3), brow(R, -2, 3), `<path d="M${cx - 14} ${my - 4} q14 16 28 0z" fill="${INK}"/>`],
      tired: [eye(L, 'lid'), eye(R, 'lid'), brow(L, 4), brow(R, 4), `<path d="M${cx - 9} ${my + 1} q9 -3 18 0" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>`],
      soft: [eye(L, 'lid'), eye(R, 'lid'), brow(L, 3), brow(R, 3), `<path d="M${cx - 10} ${my - 2} q10 7 20 0" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>`],
      stern: [eye(L), eye(R), brow(L, -6), brow(R, -6), `<path d="M${cx - 11} ${my + 1} h22" stroke="${INK}" stroke-width="3.8" stroke-linecap="round"/>`],
      guilt: [eye(L, 'down'), eye(R, 'down'), brow(L, 5), brow(R, 5), `<path d="M${cx - 8} ${my + 2} q8 -4 16 0" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>`],
      hollow: [eye(L, 'wide'), eye(R, 'wide'), brow(L, 0, -1), brow(R, 0, -1), `<path d="M${cx - 8} ${my} h16" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>`],
      still: [eye(L), eye(R), brow(L, 2, 4), brow(R, 2, 4), `<ellipse cx="${cx}" cy="${my}" rx="5" ry="4" fill="${INK}"/>`],
      droop: [eye(L, 'lid'), eye(R), brow(L, -3), brow(R, -4), `<path d="M${cx - 12} ${my + 5} q6 -5 12 -4 q8 0 12 -3" stroke="${INK}" stroke-width="3.4" fill="none" stroke-linecap="round"/>`],
      droopStern: [eye(L, 'lid'), eye(R), brow(L, -8), brow(R, -6), `<path d="M${cx - 13} ${my + 5} q6 -4 13 -4 h12" stroke="${INK}" stroke-width="3.8" fill="none" stroke-linecap="round"/>`]
    };
    e.push(`<g class="face">${(map[expr] || map.neutral).join('')}</g>`);
    // nose (shadow wedge)
    e.push(`<path d="M${cx + 2} ${cy + 8} l7 15 h-11" fill="${skinS}"/>`);
    if (o.underEye) e.push(`<path d="M${L - 8} ${ey + 10} q8 5 16 0 M${R - 8} ${ey + 10} q8 5 16 0" stroke="${skinS}" stroke-width="3" fill="none" stroke-linecap="round"/>`);
    if (o.blush) e.push(`<ellipse cx="${L - 6}" cy="${ey + 20}" rx="9" ry="5" fill="${C.rust}" opacity=".18"/><ellipse cx="${R + 6}" cy="${ey + 20}" rx="9" ry="5" fill="${C.rust}" opacity=".18"/>`);
    return e.join('');
  }

  const ears = (cx, cy, r, skin) => `<ellipse cx="${cx - r + 2}" cy="${cy + 6}" rx="10" ry="15" fill="${skin}"/><ellipse cx="${cx + r - 2}" cy="${cy + 6}" rx="10" ry="15" fill="${skin}"/>`;
  const shadow = (w = 120) => `<ellipse cx="200" cy="742" rx="${w}" ry="12" fill="#000" opacity=".28"/>`;

  // ---------- আমি : the son (~30, Dhaka office job) ----------------------
  function son(expr = 'neutral', pose = 'phone') {
    const s = C.skinA, ss = C.skinAs, hx = 200, hy = 132;
    const headTilt = expr === 'guilt' ? 'rotate(10 200 200)' : '';
    const armR = pose === 'phone'
      ? `<g id="armR"><path d="M262 232 q38 30 30 120 l-8 18 -30 -8 q6 -60 -10 -100z" fill="${C.cream}"/><path d="M286 352 q-10 40 -64 46 l-4 -26 q36 -6 44 -32z" fill="${C.cream}"/><circle cx="214" cy="386" r="15" fill="${s}"/><rect x="196" y="350" width="30" height="52" rx="6" fill="${INK}"/><rect x="200" y="355" width="22" height="40" rx="3" fill="${C.amber}" opacity=".85"/></g>`
      : `<g id="armR"><path d="M262 232 q30 30 26 150 l-2 70 -30 0 q-2 -110 -12 -170z" fill="${C.cream}"/><circle cx="272" cy="462" r="16" fill="${s}"/></g>`;
    return `
${shadow(110)}
<g id="legs"><path d="M150 450 h100 l-6 280 h-34 l-10 -220 -10 220 h-34z" fill="${C.navy}"/><path d="M200 470 v40" stroke="${C.navyD}" stroke-width="3"/>
<path d="M150 726 h44 v14 h-56 q0 -14 12 -14z M206 726 h44 q12 0 12 14 h-56z" fill="${INK}"/></g>
<g id="torso"><path d="M138 226 q62 -26 124 0 q10 110 -4 232 h-116 q-14 -122 -4 -232z" fill="${C.cream}"/>
<path d="M200 214 v244" stroke="${C.creamS}" stroke-width="3"/><circle cx="200" cy="270" r="3" fill="${C.creamS}"/><circle cx="200" cy="320" r="3" fill="${C.creamS}"/><circle cx="200" cy="370" r="3" fill="${C.creamS}"/>
<path d="M176 212 l24 26 24 -26 -6 -6 -18 18 -18 -18z" fill="${C.white}"/>
<path d="M142 448 h116 v14 h-116z" fill="#3A2C22"/><rect x="192" y="448" width="16" height="14" fill="${C.amber}"/>
<path d="M178 226 q22 60 22 96 q0 -36 22 -96" fill="none" stroke="${C.amber}" stroke-width="5"/><rect x="186" y="322" width="28" height="36" rx="4" fill="${C.paper}"/><rect x="190" y="328" width="20" height="5" fill="${C.amber}"/></g>
<g id="armL"><path d="M138 232 q-30 30 -26 150 l2 70 30 0 q2 -110 12 -170z" fill="${C.cream}"/><circle cx="128" cy="462" r="16" fill="${s}"/><rect x="113" y="430" width="30" height="10" rx="3" fill="#3A2C22"/></g>
${armR}
<g id="head" transform="${headTilt}"><rect x="184" y="180" width="32" height="40" fill="${ss}"/>
${ears(hx, hy, 58, s)}<ellipse cx="${hx}" cy="${hy}" rx="58" ry="66" fill="${s}"/>
<path d="M${hx - 50} ${hy + 30} q50 52 100 0 q-4 40 -50 46 q-46 -6 -50 -46z" fill="${ss}" opacity=".55"/>
<path d="M140 138 q-14 -92 62 -94 q70 0 62 90 q-4 -26 -18 -40 q-40 4 -70 -18 q-12 30 -36 62z" fill="${C.hair}"/><path d="M176 76 q30 22 70 18" stroke="#3A3532" stroke-width="4" fill="none"/>
${face(hx, hy, expr, ss)}</g>`;
  }

  // ---------- আপা : elder sister (~38) ---------------------------------
  function apa(expr = 'tired', pose = 'bowl') {
    const s = C.skinB, ss = C.skinBs, hx = 200, hy = 140;
    const arms = pose === 'bowl'
      ? `<g id="arms"><path d="M140 240 q-26 60 -10 140 l36 6 q-8 -60 4 -110z" fill="${C.teal}"/><path d="M260 240 q26 60 10 140 l-36 6 q8 -60 -4 -110z" fill="${C.teal}"/>
<circle cx="146" cy="390" r="15" fill="${s}"/><circle cx="254" cy="390" r="15" fill="${s}"/>
<g id="bowl"><path d="M112 372 h176 q-8 56 -88 58 q-80 -2 -88 -58z" fill="#B8BCC2"/><ellipse cx="200" cy="372" rx="88" ry="12" fill="#D6DADF"/><ellipse cx="200" cy="373" rx="78" ry="8" fill="#9FC9C2"/>
<path d="M150 390 q20 30 40 34 l-6 20 q-30 -8 -40 -40z" fill="${C.paper}" opacity=".95"/></g>
<g id="steam" fill="none" stroke="${C.paper}" stroke-width="4" stroke-linecap="round" opacity=".55"><path d="M170 350 q-10 -18 0 -36 q10 -18 0 -36"/><path d="M200 346 q-10 -18 0 -36 q10 -18 0 -36"/><path d="M230 350 q-10 -18 0 -36 q10 -18 0 -36"/></g></g>`
      : `<g id="arms"><path d="M140 240 q-30 40 -26 160 l30 2 q0 -100 12 -140z" fill="${C.teal}"/><path d="M260 240 q30 40 26 160 l-30 2 q0 -100 -12 -140z" fill="${C.teal}"/><circle cx="130" cy="410" r="15" fill="${s}"/><circle cx="270" cy="410" r="15" fill="${s}"/></g>`;
    return `
${shadow(110)}
<g id="legs"><path d="M160 560 h80 l-4 170 h-30 l-6 -150 -6 150 h-30z" fill="${C.tealD}"/>
<path d="M162 724 h36 v12 h-44 q0 -12 8 -12z M202 724 h36 q8 0 8 12 h-44z" fill="#6B4A3A"/></g>
<g id="torso"><path d="M140 232 q60 -24 120 0 l18 330 h-156z" fill="${C.teal}"/>
<path d="M150 560 h100" stroke="${C.tealD}" stroke-width="3"/>
<path d="M176 226 q24 26 48 0" fill="none" stroke="${C.tealD}" stroke-width="5"/>
<g id="orna"><path d="M136 236 q70 60 140 -6 l14 26 q-18 70 -20 300 l-30 -4 q2 -200 10 -270 q-60 40 -120 -16z" fill="${C.tealD}"/><path d="M262 300 q-4 120 -4 250" stroke="#346A62" stroke-width="3"/></g></g>
${arms}
<g id="head"><rect x="184" y="186" width="32" height="44" fill="${ss}"/>
<ellipse cx="200" cy="96" rx="64" ry="50" fill="${C.hair}"/><circle cx="246" cy="128" r="26" fill="${C.hair}"/>
${ears(hx, hy, 54, s)}<ellipse cx="${hx}" cy="${hy}" rx="54" ry="64" fill="${s}"/>
<path d="M146 136 q-4 -70 56 -72 q56 2 52 70 q-20 -40 -54 -44 q-30 4 -54 46z" fill="${C.hair}"/><path d="M200 66 v20" stroke="#3A3330" stroke-width="3"/>
<path d="M226 74 q14 10 20 26" stroke="${C.grey}" stroke-width="3" fill="none" opacity=".8"/>
${face(hx, hy, expr, ss, { underEye: true })}</g>`;
  }

  // ---------- আব্বা : father (~68), stroke, right side weak; seated on bed ---
  function abba(expr = 'droop') {
    const s = C.skinC, ss = C.skinCs, hx = 196, hy = 236;
    return `
<g id="bed"><rect x="20" y="520" width="360" height="160" rx="10" fill="#4B3A2E"/><rect x="20" y="500" width="360" height="56" rx="10" fill="${C.paper}"/><rect x="20" y="680" width="22" height="60" fill="#3A2C22"/><rect x="358" y="680" width="22" height="60" fill="#3A2C22"/>
<path d="M60 360 q-20 0 -20 30 v140 h110 v-150 q0 -20 -90 -20z" fill="#DCD3C2"/></g>
<g id="lungi"><path d="M110 470 h250 q24 0 24 30 v24 h-274z" fill="#3E6A86"/><path d="M140 470 v54 M180 470 v54 M220 470 v54 M260 470 v54 M300 470 v54 M340 470 v54 M110 488 h274 M110 506 h274" stroke="#5C8BA6" stroke-width="3" opacity=".7"/></g>
<g id="feet"><ellipse cx="378" cy="476" rx="12" ry="20" fill="${C.skinCs}"/><ellipse cx="380" cy="508" rx="12" ry="20" fill="${C.skinC}"/></g>
<g id="torso"><path d="M120 340 q76 -34 152 0 q12 70 6 140 h-160 q-10 -70 2 -140z" fill="${C.white}"/>
<path d="M196 328 v80" stroke="${C.creamS}" stroke-width="3"/><circle cx="196" cy="350" r="3" fill="${C.creamS}"/><circle cx="196" cy="376" r="3" fill="${C.creamS}"/></g>
<g id="armL"><path d="M272 346 q34 40 30 110 l-28 4 q-4 -60 -18 -96z" fill="${C.white}"/><circle cx="290" cy="466" r="15" fill="${s}"/></g>
<g id="armR"><path d="M120 346 q-28 40 -10 92 q30 16 70 14 l2 -28 q-36 -2 -46 -14 q0 -30 4 -50z" fill="${C.white}"/><path d="M180 438 q16 -2 18 12 q-4 14 -20 10 q-6 -2 -8 -10z" fill="${ss}"/></g>
<g id="head"><rect x="180" y="284" width="32" height="44" fill="${ss}"/>
${ears(hx, hy, 54, s)}<ellipse cx="${hx}" cy="${hy}" rx="54" ry="62" fill="${s}"/>
<path d="M146 214 q2 -54 52 -54 q48 0 50 54 q-8 -30 -50 -32 q-42 2 -52 32z" fill="${C.white}"/>
<path d="M148 256 q4 74 48 80 q44 -6 48 -80 q-10 34 -48 36 q-38 -2 -48 -36z" fill="${C.white}"/>
${face(hx, hy - 4, expr, ss)}
<g fill="none" stroke="${INK}" stroke-width="3"><circle cx="175" cy="236" r="15"/><circle cx="217" cy="236" r="15"/><path d="M190 236 h12"/></g></g>`;
  }

  // ---------- আম্মা : mother (~60) -------------------------------------
  function amma(expr = 'proud', pose = 'talk') {
    const s = C.skinD, ss = C.skinDs, hx = 200, hy = 150;
    const armR = pose === 'talk'
      ? `<g id="armR"><path d="M262 250 q40 20 46 90 l-30 10 q-6 -40 -26 -60z" fill="${C.rose}"/><circle cx="296" cy="352" r="15" fill="${s}"/><path d="M296 338 l4 -26 M302 340 l10 -22" stroke="${s}" stroke-width="8" stroke-linecap="round"/></g>`
      : `<g id="armR"><path d="M262 250 q24 50 18 170 l-28 0 q0 -100 -8 -150z" fill="${C.rose}"/><circle cx="266" cy="430" r="15" fill="${s}"/></g>`;
    return `
${shadow(130)}
<g id="sari"><path d="M140 250 q60 -26 120 0 q40 200 50 480 h-220 q10 -280 50 -480z" fill="${C.rose}"/>
<path d="M90 712 h220 v18 h-220z" fill="${C.amber}" opacity=".8"/>
<path d="M150 340 q60 50 140 10 q-10 80 4 140 q-90 30 -170 -10 q14 -70 26 -140z" fill="${C.roseD}"/>
<path d="M124 470 q86 46 170 6" stroke="${C.amber}" stroke-width="6" fill="none" opacity=".8"/></g>
<g id="armL"><path d="M140 250 q-24 50 -18 170 l28 0 q0 -100 8 -150z" fill="${C.rose}"/><circle cx="134" cy="430" r="15" fill="${s}"/><path d="M122 418 h24" stroke="${C.amber}" stroke-width="4"/></g>
${armR}
<g id="head"><rect x="184" y="196" width="32" height="44" fill="${ss}"/>
<path d="M132 160 q-6 -100 68 -104 q74 4 68 104 q16 70 0 100 q-66 -30 -136 0 q-16 -30 0 -100z" fill="${C.roseD}"/>
<path d="M136 168 q-4 -96 64 -100 q68 4 64 100" fill="none" stroke="${C.amber}" stroke-width="6" opacity=".85"/>
<ellipse cx="${hx}" cy="${hy}" rx="54" ry="62" fill="${s}"/>
<path d="M150 132 q8 -44 50 -46 q42 2 50 46 q-24 -24 -50 -26 q-26 2 -50 26z" fill="#5A524E"/><path d="M200 88 v20" stroke="${C.grey}" stroke-width="4"/>
${face(hx, hy, expr, ss, { blush: expr === 'proud' })}</g>`;
  }

  // ---------- পাড়ার লোকজন : neighbours (muted silhouettes) ---------------
  function crowd() {
    const p = (x, top, c, cap) => `<g><path d="M${x - 72} 740 v-${740 - top - 110} q0 -52 72 -52 q72 0 72 52 v${740 - top - 110}z" fill="${c}"/><circle cx="${x}" cy="${top + 4}" r="40" fill="${c}"/>${cap ? `<path d="M${x - 34} ${top - 14} q34 -34 68 0z" fill="#E4DED3" opacity=".55"/>` : ''}</g>`;
    return p(105, 420, '#3E4557', 1) + p(295, 430, '#3A4052', 0) + p(200, 380, '#525A72', 0);
  }

  window.CHAR = { C, son, apa, abba, amma, crowd };
})();
