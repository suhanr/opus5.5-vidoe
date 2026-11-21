// Extra cast for episode 2 (same 400x760 viewBox and face() style as characters.js)
(function () {
  const C = CHAR.C, INK = '#1C1714';
  const faceOf = (svg) => svg; // placeholder
  // reuse the face renderer by drawing a tiny head with CHAR.son and stealing nothing: we re-implement minimal face here
  function eyesFace(cx, cy, expr, skinS) {
    const ey = cy + 4, L = cx - 21, R = cx + 21, my = cy + 34;
    const dot = (x, ry = 6.2) => `<ellipse cx="${x}" cy="${ey}" rx="5" ry="${ry}" fill="${INK}"/>`;
    const lid = (x, dy = 0) => `<path d="M${x - 7} ${ey + dy} a7 6 0 0 0 14 0z" fill="${INK}"/><line x1="${x - 8}" y1="${ey + dy}" x2="${x + 8}" y2="${ey + dy}" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>`;
    const wide = x => `<ellipse cx="${x}" cy="${ey}" rx="8" ry="8.5" fill="#F4EFE6"/><circle cx="${x}" cy="${ey + 1}" r="4.4" fill="${INK}"/>`;
    const closed = x => `<path d="M${x - 7} ${ey} q7 6 14 0" stroke="${INK}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
    const brow = (x, tilt, lift = 0) => { const s = x < cx ? 1 : -1, y = ey - 17 - lift; return `<line x1="${x - 9 * s}" y1="${y}" x2="${x + 9 * s}" y2="${y - tilt}" stroke="${INK}" stroke-width="3.6" stroke-linecap="round"/>`; };
    const M = {
      smile: [dot(L), dot(R), brow(L, 1, 2), brow(R, 1, 2), `<path d="M${cx - 13} ${my - 3} q13 12 26 0" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>`],
      sweet: [closed(L), closed(R), brow(L, 2, 3), brow(R, 2, 3), `<path d="M${cx - 15} ${my - 4} q15 16 30 0" stroke="${INK}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`],
      smug: [lid(L), lid(R), brow(L, -3), brow(R, -1, 2), `<path d="M${cx - 12} ${my} q14 6 24 -6" stroke="${INK}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`],
      scared: [wide(L), wide(R), brow(L, 6, 4), brow(R, 6, 4), `<ellipse cx="${cx}" cy="${my + 2}" rx="6" ry="7" fill="${INK}"/>`],
      down: [lid(L, 3), lid(R, 3), brow(L, 5), brow(R, 5), `<path d="M${cx - 8} ${my + 2} q8 -4 16 0" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>`],
      glance: [wide(L), wide(R), brow(L, 4, 2), brow(R, 4, 2), `<path d="M${cx - 8} ${my + 1} h16" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>`],
      stern: [dot(L), dot(R), brow(L, -6), brow(R, -6), `<path d="M${cx - 11} ${my + 1} h22" stroke="${INK}" stroke-width="3.8" stroke-linecap="round"/>`],
      neutral: [dot(L), dot(R), brow(L, 0), brow(R, 0), `<path d="M${cx - 9} ${my} h18" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`],
      tense: [dot(L), dot(R), brow(L, 3), brow(R, 3), `<path d="M${cx - 10} ${my + 2} q10 -4 20 0" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>`]
    };
    const a = M[expr] || M.neutral;
    return `<g class="face"><g class="eyes">${a[0]}${a[1]}</g>${a.slice(2).join('')}</g><path d="M${cx + 2} ${cy + 8} l7 15 h-11" fill="${skinS}"/>`;
  }
  const ears = (cx, cy, r, s) => `<ellipse cx="${cx - r + 2}" cy="${cy + 6}" rx="10" ry="15" fill="${s}"/><ellipse cx="${cx + r - 2}" cy="${cy + 6}" rx="10" ry="15" fill="${s}"/>`;
  const shadow = w => `<ellipse cx="200" cy="742" rx="${w}" ry="12" fill="#000" opacity=".28"/>`;

  // ---------- বড় চাচা: ~62, white panjabi, charcoal koti, grey hair & trimmed beard, gold watch
  function chacha(expr = 'sweet') {
    const s = '#B7845E', ss = '#9A6A49', hx = 200, hy = 128;
    return `${shadow(120)}
<g id="legs"><path d="M150 560 h100 l-4 170 h-36 l-10 -140 -10 140 h-36z" fill="#E9E4DA"/><path d="M146 726 h46 v14 h-56 q0 -14 10 -14z M208 726 h46 q10 0 10 14 h-56z" fill="#3A2C22"/></g>
<g id="torso"><path d="M132 226 q68 -30 136 0 q14 170 10 340 h-156 q-4 -170 10 -340z" fill="#F4F1EA"/>
<path d="M138 232 q40 -18 62 -14 l0 330 h-74 q-4 -170 12 -316z" fill="#3B3F48"/><path d="M262 232 q-40 -18 -62 -14 l0 330 h74 q4 -170 -12 -316z" fill="#3B3F48"/>
<path d="M200 214 v120" stroke="#D8D2C6" stroke-width="3"/><path d="M182 214 h36 v14 h-36z" fill="#F4F1EA"/>
<path d="M222 270 h26 v8 h-26z" fill="${C.amber}"/><circle cx="214" cy="330" r="3" fill="#20232A"/><circle cx="214" cy="380" r="3" fill="#20232A"/><circle cx="214" cy="430" r="3" fill="#20232A"/></g>
<g id="armL"><path d="M134 236 q-34 40 -28 170 l4 60 30 0 q0 -120 10 -180z" fill="#F4F1EA"/><circle cx="126" cy="472" r="17" fill="${s}"/><rect x="110" y="446" width="32" height="12" rx="4" fill="${C.amber}"/></g>
<g id="armR"><path d="M266 236 q34 40 28 170 l-4 60 -30 0 q0 -120 -10 -180z" fill="#F4F1EA"/><circle cx="274" cy="472" r="17" fill="${s}"/></g>
<g id="head"><rect x="184" y="178" width="32" height="40" fill="${ss}"/>${ears(hx, hy, 58, s)}<ellipse cx="${hx}" cy="${hy}" rx="58" ry="66" fill="${s}"/>
<path d="M142 140 q-8 -86 60 -88 q66 2 58 88 q-8 -40 -58 -46 q-48 6 -60 46z" fill="#C9C5BF"/><path d="M160 76 q40 -14 80 6" stroke="#E6E2DB" stroke-width="5" fill="none"/>
<path d="M146 150 q6 66 54 72 q48 -6 54 -72 q-14 30 -54 32 q-40 -2 -54 -32z" fill="#BDB8B0"/>
${eyesFace(hx, hy, expr, ss)}<path d="M178 158 q22 -8 44 0" stroke="#A9A49C" stroke-width="7" fill="none" stroke-linecap="round"/></g>`;
  }
  // ---------- ছোট বোন: 17, light teal kameez, white orna, long braid
  function bon(expr = 'neutral', pose = 'idle') {
    const s = '#B07A55', ss = '#93613F', hx = 200, hy = 144;
    const arms = pose === 'bowl'
      ? `<g id="arms"><path d="M146 240 q-24 60 -6 130 l34 6 q-8 -50 2 -100z" fill="#7FC3B6"/><path d="M254 240 q24 60 6 130 l-34 6 q8 -50 -2 -100z" fill="#7FC3B6"/><circle cx="154" cy="380" r="14" fill="${s}"/><circle cx="246" cy="380" r="14" fill="${s}"/>
<g id="bowl"><path d="M120 366 h160 q-10 52 -80 54 q-70 -2 -80 -54z" fill="#E9E1D0"/><ellipse cx="200" cy="366" rx="80" ry="11" fill="#F4EFE6"/><circle cx="170" cy="358" r="12" fill="#C9543A"/><circle cx="200" cy="354" r="13" fill="#7DA35A"/><circle cx="230" cy="358" r="11" fill="#E8A33D"/><circle cx="214" cy="352" r="9" fill="#7DA35A"/></g></g>`
      : `<g id="arms"><path d="M146 240 q-28 50 -22 160 l28 2 q0 -100 10 -140z" fill="#7FC3B6"/><path d="M254 240 q28 50 22 160 l-28 2 q0 -100 -10 -140z" fill="#7FC3B6"/><circle cx="138" cy="408" r="14" fill="${s}"/><circle cx="262" cy="408" r="14" fill="${s}"/></g>`;
    return `${shadow(100)}
<g id="legs"><path d="M164 560 h72 l-4 170 h-28 l-4 -150 -4 150 h-28z" fill="#E9E4DA"/><path d="M164 724 h34 v12 h-40 q0 -12 6 -12z M202 724 h34 q6 0 6 12 h-40z" fill="#7A4A3A"/></g>
<g id="torso"><path d="M146 236 q54 -22 108 0 l16 330 h-140z" fill="#7FC3B6"/><path d="M180 232 q20 22 40 0" fill="none" stroke="#5E9F93" stroke-width="5"/>
<path d="M150 300 q50 18 100 0" stroke="#5E9F93" stroke-width="3" fill="none" opacity=".7"/></g>
<g id="orna"><path d="M140 240 q60 70 128 0 l8 22 q-10 50 -60 64 q-50 -6 -84 -60z" fill="#F2EBDD" opacity=".95"/></g>
${arms}
<g id="head"><rect x="186" y="190" width="28" height="44" fill="${ss}"/>
<path d="M238 140 q34 60 14 160 q-6 40 -18 60" stroke="${C.hair}" stroke-width="22" fill="none" stroke-linecap="round"/>
${ears(hx, hy, 50, s)}<ellipse cx="${hx}" cy="${hy}" rx="50" ry="60" fill="${s}"/>
<path d="M148 146 q-6 -74 54 -76 q56 2 50 76 q-18 -46 -52 -50 q-34 4 -52 50z" fill="${C.hair}"/><path d="M200 72 v24" stroke="#3A3330" stroke-width="3"/>
${eyesFace(hx, hy, expr, ss)}</g>`;
  }
  // ---------- আব্বা (healthy, ~58): light-blue panjabi, grey hair, moustache, glasses
  function abba2(expr = 'tense') {
    const s = '#B07E5A', ss = '#93653F', hx = 200, hy = 130;
    return `${shadow(110)}
<g id="legs"><path d="M152 560 h96 l-4 170 h-34 l-10 -140 -10 140 h-34z" fill="#2B3245"/><path d="M148 726 h44 v14 h-52 q0 -14 8 -14z M208 726 h44 q8 0 8 14 h-52z" fill="${INK}"/></g>
<g id="torso"><path d="M136 226 q64 -28 128 0 q12 170 8 340 h-144 q-4 -170 8 -340z" fill="#9DB7CC"/><path d="M200 214 v110" stroke="#7F9AB0" stroke-width="3"/></g>
<g id="armL"><path d="M138 236 q-32 40 -26 170 l4 60 30 0 q0 -120 10 -180z" fill="#9DB7CC"/><circle cx="130" cy="472" r="16" fill="${s}"/></g>
<g id="armR"><path d="M262 236 q32 40 26 170 l-4 60 -30 0 q0 -120 -10 -180z" fill="#9DB7CC"/><circle cx="270" cy="472" r="16" fill="${s}"/></g>
<g id="head"><rect x="184" y="180" width="32" height="40" fill="${ss}"/>${ears(hx, hy, 56, s)}<ellipse cx="${hx}" cy="${hy}" rx="56" ry="64" fill="${s}"/>
<path d="M144 134 q-6 -80 58 -82 q62 2 54 82 q-10 -36 -54 -42 q-44 6 -58 42z" fill="#8E8A85"/>
${eyesFace(hx, hy, expr, ss)}<path d="M178 158 q22 -8 44 0" stroke="#5A5652" stroke-width="7" fill="none" stroke-linecap="round"/>
<g fill="none" stroke="${INK}" stroke-width="3"><circle cx="179" cy="134" r="14"/><circle cx="221" cy="134" r="14"/><path d="M193 134 h14"/></g></g>`;
  }
  // son holding the water jug (right hand) — built from CHAR.son idle
  function sonJug(expr = 'smile', tilt = 0) {
    let s = CHAR.son(expr, 'idle');
    const jug = `<g id="jug" style="transform-box:view-box;transform-origin:272px 440px;transform:rotate(${tilt}deg)"><path d="M248 400 h58 l-6 90 q0 14 -14 14 h-20 q-14 0 -14 -14z" fill="rgba(190,225,235,.55)" stroke="#E6F2F5" stroke-width="4"/><path d="M304 420 q26 4 20 34 q-4 18 -22 16" fill="none" stroke="#E6F2F5" stroke-width="5"/><path d="M252 440 h50 v50 q0 10 -10 10 h-30 q-10 0 -10 -10z" fill="rgba(150,200,215,.55)"/><path d="M244 404 l-10 -10" stroke="#E6F2F5" stroke-width="5" stroke-linecap="round"/></g>`;
    return s.replace('<g id="head"', jug + '<g id="head"');
  }
  // smiling mask that fits the son's face (centre 200,132)
  function mask(op = 1) {
    return `<g id="mask" opacity="${op}"><path d="M146 92 q54 -40 108 0 q12 60 -8 100 q-46 36 -92 0 q-20 -40 -8 -100z" fill="#F2EBDD"/><path d="M164 126 q14 -12 28 0 M208 126 q14 -12 28 0" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M168 158 q32 30 64 0" stroke="#C9543A" stroke-width="6" fill="none" stroke-linecap="round"/><ellipse cx="160" cy="150" rx="10" ry="6" fill="#E8A33D" opacity=".35"/><ellipse cx="240" cy="150" rx="10" ry="6" fill="#E8A33D" opacity=".35"/></g>`;
  }
  Object.assign(CHAR, { chacha, bon, abba2, sonJug, mask });
})();
