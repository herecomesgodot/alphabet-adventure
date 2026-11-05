// The 26 sticker pictures (A Apple … Z Zebra), simple and bold, in a 100×100 box.
(function (root) {
  'use strict';
  const AA = root.AA;
  const K = '#2B2D42';
  const eyes = (x1, x2, y, r = 3.4) => `<circle cx="${x1}" cy="${y}" r="${r}" fill="${K}"/><circle cx="${x2}" cy="${y}" r="${r}" fill="${K}"/>
<circle cx="${x1 + 1}" cy="${y - 1.2}" r="1.1" fill="#fff"/><circle cx="${x2 + 1}" cy="${y - 1.2}" r="1.1" fill="#fff"/>`;
  const smile = (x, y, w = 8) => `<path d="M${x - w / 2} ${y} q${w / 2} ${w * 0.6} ${w} 0" stroke="${K}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;

  const P = {
    A: `<path d="M50 28 q-4 -12 -10 -16" stroke="#7A4A22" stroke-width="5" stroke-linecap="round" fill="none"/>
<path d="M52 22 q14 -12 26 -4 q-12 12 -26 4z" fill="#3FA34D"/>
<path d="M50 32 q-20 -12 -34 4 q-12 18 0 40 q12 22 34 12 q22 10 34 -12 q12 -22 0 -40 q-14 -16 -34 -4z" fill="#EF476F"/>
<ellipse cx="32" cy="46" rx="6" ry="10" fill="#fff" opacity=".35"/>`,
    B: `<circle cx="26" cy="28" r="12" fill="#8B5A2B"/><circle cx="74" cy="28" r="12" fill="#8B5A2B"/>
<circle cx="26" cy="28" r="6" fill="#C08552"/><circle cx="74" cy="28" r="6" fill="#C08552"/>
<circle cx="50" cy="56" r="34" fill="#A0673A"/><ellipse cx="50" cy="68" rx="16" ry="12" fill="#E2B98A"/>
${eyes(38, 62, 50)}<ellipse cx="50" cy="62" rx="6" ry="4.5" fill="${K}"/>${smile(50, 70)}`,
    C: `<path d="M18 46 L22 12 L42 30z M82 46 L78 12 L58 30z" fill="#FF9F1C"/><path d="M24 36 L25 22 L34 30z M76 36 L75 22 L66 30z" fill="#FFB3C7"/>
<circle cx="50" cy="56" r="34" fill="#FF9F1C"/>${eyes(38, 62, 52)}
<path d="M47 62 h6 l-3 4z" fill="#FF6B8B"/>${smile(46, 68, 4)}${smile(54, 68, 4)}
<path d="M14 62 h20 M14 70 h20 M66 62 h20 M66 70 h20" stroke="${K}" stroke-width="1.8" stroke-linecap="round"/>`,
    D: `<circle cx="50" cy="54" r="32" fill="#E2B98A"/>
<path d="M22 30 q-14 6 -8 34 q8 6 16 -6z M78 30 q14 6 8 34 q-8 6 -16 -6z" fill="#8B5A2B"/>
${eyes(39, 61, 50)}<ellipse cx="50" cy="64" rx="7" ry="5" fill="${K}"/>
<path d="M50 69 v6" stroke="${K}" stroke-width="2.5"/><path d="M46 76 q4 8 8 0" fill="#FF6B8B"/>`,
    E: `<ellipse cx="50" cy="56" rx="28" ry="36" fill="#FFF4DC" stroke="#E8D3A6" stroke-width="3"/>
<ellipse cx="40" cy="42" rx="6" ry="10" fill="#fff"/>`,
    F: null,
    G: `<path d="M30 30 q-10 -16 -2 -24 M70 30 q10 -16 2 -24" stroke="#C9B79C" stroke-width="7" fill="none" stroke-linecap="round"/>
<path d="M18 42 l-12 -4 l8 12z M82 42 l12 -4 l-8 12z" fill="#D9D9D9"/>
<path d="M28 30 h44 q8 30 -6 52 h-32 q-14 -22 -6 -52z" fill="#EDEDED"/>
${eyes(40, 60, 46)}<ellipse cx="50" cy="68" rx="10" ry="7" fill="#FFC9C9"/>
<circle cx="46" cy="68" r="1.6" fill="${K}"/><circle cx="54" cy="68" r="1.6" fill="${K}"/>
<path d="M44 82 l6 14 l6 -14z" fill="#D9D9D9"/>`,
    H: `<ellipse cx="50" cy="70" rx="44" ry="12" fill="#118AB2"/>
<path d="M26 70 q0 -44 24 -44 q24 0 24 44z" fill="#118AB2"/>
<path d="M27 60 h46 v8 h-46z" fill="#EF476F"/><circle cx="66" cy="58" r="6" fill="#FFD23F"/>`,
    I: `<path d="M10 80 q0 -56 40 -56 q40 0 40 56z" fill="#E8F6FF" stroke="#9DD3EE" stroke-width="3"/>
<path d="M22 50 h56 M14 66 h72 M40 24 v26 M60 24 v26 M30 50 v16 M50 50 v16 M70 50 v16" stroke="#9DD3EE" stroke-width="2.5"/>
<path d="M38 80 v-12 q12 -14 24 0 v12z" fill="#118AB2"/><rect x="6" y="80" width="88" height="6" rx="3" fill="#BDE4F4"/>`,
    J: `<rect x="24" y="30" width="52" height="58" rx="10" fill="#EF476F"/>
<rect x="24" y="30" width="52" height="16" fill="#C9375A"/>
<path d="M20 22 h60 v12 h-60z" fill="#fff"/><path d="M20 22 h60 v12 h-60z" fill="none" stroke="#EF476F" stroke-width="2" stroke-dasharray="5 5"/>
<rect x="32" y="54" width="36" height="22" rx="4" fill="#fff"/><path d="M42 65 q8 -10 16 0 q-8 10 -16 0z" fill="#EF476F"/>`,
    K: `<path d="M50 8 L80 40 L50 76 L20 40z" fill="#FFD23F"/><path d="M50 8 L50 76 M20 40 L80 40" stroke="#F7B801" stroke-width="3"/>
<path d="M50 8 L80 40 L50 40z M20 40 L50 76 L50 40z" fill="#EF476F"/>
<path d="M50 76 q-10 8 0 12 q10 4 0 10" stroke="${K}" stroke-width="2" fill="none"/>
<path d="M44 84 l-6 -4 v8z M56 88 l6 -4 v8z" fill="#118AB2"/>`,
    L: `<circle cx="50" cy="52" r="40" fill="#E07B24"/>
${[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((a) => `<circle cx="${50 + 36 * Math.cos(a * Math.PI / 180)}" cy="${52 + 36 * Math.sin(a * Math.PI / 180)}" r="10" fill="#E07B24"/>`).join('')}
<circle cx="50" cy="54" r="27" fill="#FFC857"/>${eyes(40, 60, 50)}
<path d="M45 60 h10 l-5 5z" fill="${K}"/>${smile(46, 68, 5)}${smile(54, 68, 5)}`,
    M: `<path d="M62 12 a38 38 0 1 0 22 66 a30 30 0 1 1 -22 -66z" fill="#FFD23F"/>
<circle cx="44" cy="44" r="3" fill="${K}"/>${smile(44, 58, 8)}<circle cx="36" cy="54" r="4" fill="#FF8FB1" opacity=".6"/>`,
    N: `<ellipse cx="34" cy="54" rx="9" ry="12" fill="#9DD3EE"/><ellipse cx="50" cy="50" rx="9" ry="12" fill="#BDE4F4"/><ellipse cx="66" cy="54" rx="9" ry="12" fill="#9DD3EE"/>
<path d="M10 56 q40 -6 80 0 q-4 30 -40 30 q-36 0 -40 -30z" fill="#A0673A"/>
<path d="M14 62 q36 8 72 0 M20 72 q30 6 60 0" stroke="#7E4E28" stroke-width="3" fill="none"/>`,
    O: `<circle cx="50" cy="38" r="28" fill="#8E6CEF"/>${eyes(40, 60, 38)}${smile(50, 48)}
${[16, 28, 40, 52, 64, 76, 88].map((x, i) => `<path d="M${x} 60 q${i % 2 ? 6 : -6} 14 0 28" stroke="#8E6CEF" stroke-width="8" fill="none" stroke-linecap="round"/>`).join('')}`,
    P: `<path d="M22 30 l-6 -18 l20 10z M78 30 l6 -18 l-20 10z" fill="#FF8FB1"/>
<circle cx="50" cy="54" r="34" fill="#FFB3C7"/>${eyes(38, 62, 46)}
<ellipse cx="50" cy="64" rx="14" ry="10" fill="#FF8FB1"/><ellipse cx="45" cy="64" rx="3" ry="4" fill="#C9375A"/><ellipse cx="55" cy="64" rx="3" ry="4" fill="#C9375A"/>`,
    Q: `<circle cx="50" cy="62" r="26" fill="#F4C9A0"/>${eyes(41, 59, 60, 3)}${smile(50, 70)}
<circle cx="38" cy="68" r="4" fill="#FF8FB1" opacity=".6"/><circle cx="62" cy="68" r="4" fill="#FF8FB1" opacity=".6"/>
<path d="M22 40 l6 -28 l12 16 l10 -20 l10 20 l12 -16 l6 28z" fill="#FFD23F" stroke="#F7B801" stroke-width="2"/>
<circle cx="50" cy="30" r="4" fill="#EF476F"/><circle cx="34" cy="34" r="3" fill="#118AB2"/><circle cx="66" cy="34" r="3" fill="#06D6A0"/>`,
    R: `${['#EF476F', '#FF9F1C', '#FFD23F', '#06D6A0', '#118AB2', '#8E6CEF'].map((c, i) => `<path d="M${8 + i * 6} 76 a${42 - i * 6} ${42 - i * 6} 0 0 1 ${84 - i * 12} 0" stroke="${c}" stroke-width="6.5" fill="none"/>`).join('')}
<ellipse cx="16" cy="78" rx="14" ry="8" fill="#fff" stroke="#E2E2E2" stroke-width="2"/><ellipse cx="84" cy="78" rx="14" ry="8" fill="#fff" stroke="#E2E2E2" stroke-width="2"/>`,
    S: `${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<path d="M50 50 L${50 + 44 * Math.cos((a - 8) * Math.PI / 180)} ${50 + 44 * Math.sin((a - 8) * Math.PI / 180)} L${50 + 44 * Math.cos((a + 8) * Math.PI / 180)} ${50 + 44 * Math.sin((a + 8) * Math.PI / 180)}z" fill="#FF9F1C"/>`).join('')}
<circle cx="50" cy="50" r="26" fill="#FFD23F"/>${eyes(41, 59, 46, 3)}${smile(50, 56, 10)}`,
    T: `<ellipse cx="50" cy="60" rx="32" ry="24" fill="#3FA34D"/>
<path d="M30 60 l10 -14 h20 l10 14 l-10 14 h-20z" fill="#6FBF4A" stroke="#2E7D32" stroke-width="2"/>
<circle cx="86" cy="54" r="11" fill="#8BD45E"/><circle cx="90" cy="51" r="2.4" fill="${K}"/>
<ellipse cx="26" cy="82" rx="7" ry="5" fill="#8BD45E"/><ellipse cx="72" cy="82" rx="7" ry="5" fill="#8BD45E"/><path d="M18 62 l-10 2 l8 4z" fill="#8BD45E"/>`,
    U: `<path d="M10 50 q40 -50 80 0 q-10 -8 -20 0 q-10 -8 -20 0 q-10 -8 -20 0 q-10 -8 -20 0z" fill="#8E6CEF"/>
<path d="M30 46 q20 -40 0 0 M50 46 v-34 M70 46 q-20 -40 0 0" stroke="#6E4FD0" stroke-width="2" fill="none"/>
<path d="M50 46 v36 q0 10 -9 10 q-8 0 -8 -8" stroke="${K}" stroke-width="4.5" fill="none" stroke-linecap="round"/>`,
    V: `<path d="M8 66 v-24 q0 -10 10 -10 h44 q10 0 16 10 l10 14 q4 4 4 10 z" fill="#06D6A0"/>
<rect x="8" y="58" width="84" height="14" rx="4" fill="#06D6A0"/>
<path d="M22 38 h18 v14 h-18z M46 38 h16 v14 h-16z" fill="#E8F8FF"/><path d="M66 38 l10 14 h-10z" fill="#E8F8FF"/>
<circle cx="28" cy="74" r="10" fill="${K}"/><circle cx="72" cy="74" r="10" fill="${K}"/><circle cx="28" cy="74" r="4" fill="#ccc"/><circle cx="72" cy="74" r="4" fill="#ccc"/>`,
    W: `<path d="M8 58 q0 -26 36 -26 q30 0 40 18 l8 -14 q4 10 0 22 q-8 26 -44 26 q-40 0 -40 -26z" fill="#118AB2"/>
<path d="M14 66 q30 14 64 0 q-10 16 -34 16 q-24 0 -30 -16z" fill="#BDE4F4"/>
<circle cx="30" cy="54" r="3.4" fill="${K}"/>${smile(30, 64, 8)}
<path d="M40 30 q-4 -14 -12 -18 M40 30 q4 -14 12 -18 M40 30 v-18" stroke="#9DD3EE" stroke-width="4" fill="none" stroke-linecap="round"/>`,
    X: `<path d="M16 22 l10 32 l14 -14z M84 22 l-10 32 l-14 -14z" fill="#E07B24"/><path d="M20 28 l6 18 l6 -6z M80 28 l-6 18 l-6 -6z" fill="${K}"/>
<path d="M14 44 q36 -20 72 0 q-6 30 -36 44 q-30 -14 -36 -44z" fill="#E07B24"/>
<path d="M14 44 q16 2 26 18 q-4 20 10 26 q-30 -14 -36 -44z M86 44 q-16 2 -26 18 q4 20 -10 26 q30 -14 36 -44z" fill="#fff"/>
${eyes(38, 62, 52, 3)}<ellipse cx="50" cy="80" rx="5" ry="4" fill="${K}"/>`,
    Y: `<path d="M50 6 v24" stroke="${K}" stroke-width="2.5"/><circle cx="50" cy="6" r="4" fill="${K}"/>
<circle cx="50" cy="58" r="34" fill="#EF476F"/><circle cx="50" cy="58" r="24" fill="#FF6B8B"/>
<circle cx="50" cy="58" r="8" fill="#FFD23F"/><path d="M50 30 v20" stroke="${K}" stroke-width="2.5"/>`,
    Z: `<path d="M30 14 l4 -10 l8 12z M70 14 l-4 -10 l-8 12z" fill="#fff" stroke="${K}" stroke-width="2"/>
<path d="M30 14 q20 -8 40 0 q8 30 0 66 q-20 16 -40 0 q-8 -36 0 -66z" fill="#fff" stroke="${K}" stroke-width="2.5"/>
<path d="M32 26 h12 M56 26 h12 M30 40 h10 M60 40 h10 M30 54 h8 M62 54 h8" stroke="${K}" stroke-width="5" stroke-linecap="round"/>
<path d="M44 4 q6 10 12 0" stroke="${K}" stroke-width="7"/>
${eyes(41, 59, 38, 3)}<ellipse cx="50" cy="72" rx="14" ry="10" fill="#555"/>
<circle cx="45" cy="70" r="2" fill="${K}"/><circle cx="55" cy="70" r="2" fill="${K}"/>`,
  };

  AA.art.sticker = function (L) {
    const inner = L === 'F' ? AA.art.fish('#FF9F1C').replace(/<\/?svg[^>]*>/g, '') : P[L];
    const box = L === 'F' ? 'viewBox="-10 -25 100 100"' : 'viewBox="0 0 100 100"';
    return `<svg ${box} class="sticker-svg" role="img" aria-label="${AA.data.WORDS[L].word}">${inner}</svg>`;
  };
})(self);
