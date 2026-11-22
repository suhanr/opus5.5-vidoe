// Episode 3 additions: খালা, blushing আম্মা, ilish fish.
(function () {
  const INK = '#1C1714';
  const glasses = (y = 154) => `<g fill="none" stroke="${INK}" stroke-width="3"><circle cx="179" cy="${y}" r="15"/><circle cx="221" cy="${y}" r="15"/><path d="M194 ${y} h12"/></g>`;
  function khala(expr = 'neutral', pose = 'idle') {
    let s = CHAR.amma(expr, pose).split('#9C5A63').join('#5E7A4A').split('#7A4049').join('#465E36');
    return s.slice(0, -4) + glasses() + '</g>';
  }
  // amma with a red flush (0..1) rising over the face
  function ammaFlush(expr = 'neutral', amt = 0, pose = 'idle') {
    const s = CHAR.amma(expr, pose);
    const fl = `<ellipse cx="200" cy="160" rx="50" ry="54" fill="#D2483A" opacity="${(amt * .32).toFixed(3)}"/><ellipse cx="170" cy="176" rx="15" ry="9" fill="#D2483A" opacity="${(amt * .7).toFixed(3)}"/><ellipse cx="230" cy="176" rx="15" ry="9" fill="#D2483A" opacity="${(amt * .7).toFixed(3)}"/>`;
    return s.slice(0, -4) + fl + '</g>';
  }
  // ilish, drawn in a 640x220 box. cut: 0..1 shows the cut lines; split: 0..1 pulls the pieces apart
  function ilish(cut = 0, split = 0) {
    const g = `<defs><linearGradient id="ils" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9FB3C2"/><stop offset=".45" stop-color="#E6EDF2"/><stop offset="1" stop-color="#B8C6D0"/></linearGradient></defs>`;
    const head = `<g transform="translate(${-split * 40} 0)"><path d="M150 40 Q60 50 20 110 Q60 170 150 180 Z" fill="url(#ils)"/><circle cx="70" cy="100" r="11" fill="#1C1714"/><circle cx="73" cy="97" r="3" fill="#fff"/><path d="M120 60 q-24 50 0 100" stroke="#8DA2B2" stroke-width="4" fill="none"/></g>`;
    const belly = `<g transform="translate(0 ${split * 18})"><path d="M150 40 Q300 10 450 44 L450 176 Q300 210 150 180 Z" fill="url(#ils)"/>
      <path d="M150 150 Q300 190 450 150 L450 176 Q300 210 150 180Z" fill="#F4E7D2" opacity=".85"/>${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<path d="M${170 + i * 36} 60 q12 20 0 40" stroke="#9FB3C2" stroke-width="3" fill="none"/>`).join('')}
      <path d="M220 34 q40 -26 90 -6" fill="#9FB3C2"/></g>`;
    const tail = `<g transform="translate(${split * 50} 0)"><path d="M450 44 Q520 70 545 110 Q520 150 450 176 Z" fill="url(#ils)"/><path d="M540 110 L625 40 Q600 110 625 180 Z" fill="#9FB3C2"/></g>`;
    const cuts = cut > 0 ? `<g stroke="#D2583D" stroke-width="5" stroke-dasharray="10 8" opacity="${Math.min(1, cut * 2)}"><path d="M150 ${30 - 10 * cut} V${190 + 10 * cut}"/><path d="M450 ${30 - 10 * cut} V${190 + 10 * cut}"/></g>` : '';
    return g + head + belly + tail + cuts;
  }
  // a single fish piece for plates: kind = head | belly | tail
  function piece(kind) {
    const fill = '#DDE5EB';
    if (kind === 'head') return `<path d="M30 -30 Q-40 -26 -60 0 Q-40 26 30 30Z" fill="${fill}"/><circle cx="-26" cy="-4" r="6" fill="${INK}"/>`;
    if (kind === 'belly') return `<path d="M-60 -26 Q0 -40 60 -26 L60 26 Q0 44 -60 26Z" fill="${fill}"/><path d="M-60 10 Q0 40 60 10 L60 26 Q0 44 -60 26Z" fill="#F2D9B0"/>`;
    return `<path d="M-50 -20 Q-10 -16 10 0 Q-10 16 -50 20Z" fill="${fill}"/><path d="M8 0 L48 -26 Q38 0 48 26Z" fill="#AFC0CC"/>`;
  }
  Object.assign(CHAR, { khala, ammaFlush, ilish, piece });
})();
