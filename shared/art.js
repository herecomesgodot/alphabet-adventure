// Drawings, as SVG strings. Everything is vector so it stays sharp and tiny.
(function (root) {
  'use strict';
  const AA = root.AA;
  const art = {};

  art.COLORS = {
    yellow: '#FFD23F', orange: '#FF9F1C', beak: '#FF8C42', ink: '#2B2D42',
    red: '#EF476F', blue: '#118AB2', green: '#06D6A0', purple: '#8E6CEF', pink: '#FF8FB1',
  };

  // The buddy: a round little light-blue-and-white panda. Parts carry classes the
  // CSS animates (b-wing = arms, b-beak-bot = mouth; names kept from the first buddy).
  const PANDA_BLUE = '#8CCBEA';
  const PANDA_LINE = '#C4E2F2';
  art.buddy = function () {
    return `
<svg viewBox="0 0 120 120" class="buddy-svg" aria-hidden="true">
  <ellipse cx="60" cy="113" rx="30" ry="5" fill="rgba(0,0,0,.12)"/>
  <g class="b-body">
    <ellipse cx="45" cy="104" rx="11" ry="8" fill="${PANDA_BLUE}"/>
    <ellipse cx="75" cy="104" rx="11" ry="8" fill="${PANDA_BLUE}"/>
    <ellipse cx="60" cy="82" rx="31" ry="26" fill="#fff" stroke="${PANDA_LINE}" stroke-width="2"/>
    <ellipse cx="60" cy="86" rx="17" ry="14" fill="#F4FAFD"/>
    <path class="b-wing" d="M34 68 q-20 4 -18 22 q12 7 22 -5 z" fill="${PANDA_BLUE}"/>
    <path class="b-wing b-wing-r" d="M86 68 q20 4 18 22 q-12 7 -22 -5 z" fill="${PANDA_BLUE}"/>
    <g class="b-head">
      <circle cx="37" cy="21" r="10" fill="${PANDA_BLUE}"/>
      <circle cx="83" cy="21" r="10" fill="${PANDA_BLUE}"/>
      <circle cx="60" cy="44" r="28" fill="#fff" stroke="${PANDA_LINE}" stroke-width="2"/>
      <ellipse cx="48" cy="42" rx="8" ry="10.5" fill="${PANDA_BLUE}" transform="rotate(-22 48 42)"/>
      <ellipse cx="72" cy="42" rx="8" ry="10.5" fill="${PANDA_BLUE}" transform="rotate(22 72 42)"/>
      <g class="b-eyes">
        <ellipse cx="49" cy="42" rx="3.8" ry="4.6" fill="#2B2D42"/>
        <ellipse cx="71" cy="42" rx="3.8" ry="4.6" fill="#2B2D42"/>
        <circle cx="50.3" cy="40.4" r="1.4" fill="#fff"/>
        <circle cx="72.3" cy="40.4" r="1.4" fill="#fff"/>
      </g>
      <path class="b-closed" d="M44 43 q5 4 10 0 M66 43 q5 4 10 0" stroke="#2B2D42" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <circle cx="40" cy="54" r="4.5" fill="#FF8FB1" opacity=".5"/>
      <circle cx="80" cy="54" r="4.5" fill="#FF8FB1" opacity=".5"/>
      <path d="M56 50 h8 q0 4.5 -4 5.5 q-4 -1 -4 -5.5 z" fill="#2B2D42"/>
      <path class="b-beak-bot" d="M55.5 58 q4.5 4 9 0 q-4.5 1.6 -9 0 z" fill="#2B2D42"/>
    </g>
  </g>
</svg>`;
  };

  // A letter drawn from its teaching strokes, with rounded ends.
  art.letter = function (L, { color = art.COLORS.ink, width = 13, cls = '' } = {}) {
    const paths = AA.strokes[L].map((s) => 'M' + s.map((p) => p.join(' ')).join(' L')).join(' ');
    return `<svg viewBox="-8 -8 116 116" class="letter-svg ${cls}" aria-label="${L}" role="img">
  <path d="${paths}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
  };

  art.playIcon = function () {
    return `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" fill="#06D6A0"/>
<path d="M40 30 L72 50 L40 70 Z" fill="#fff" stroke="#fff" stroke-width="6" stroke-linejoin="round"/></svg>`;
  };

  art.homeIcon = function () {
    return `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" fill="#fff"/>
<path d="M28 52 L50 32 L72 52 M36 46 V70 H64 V46" fill="none" stroke="#118AB2" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  };

  art.speakerIcon = function () {
    return `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" fill="#fff"/>
<path d="M30 42 H40 L54 30 V70 L40 58 H30 Z" fill="#118AB2"/>
<path d="M62 38 q8 12 0 24 M70 30 q14 20 0 40" fill="none" stroke="#118AB2" stroke-width="6" stroke-linecap="round"/></svg>`;
  };

  art.mutedIcon = function () {
    return `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" fill="#fff"/>
<path d="M30 42 H40 L54 30 V70 L40 58 H30 Z" fill="#EF476F"/>
<path d="M62 40 L78 60 M78 40 L62 60" stroke="#EF476F" stroke-width="6" stroke-linecap="round"/></svg>`;
  };

  // ---- Island places ----
  art.place = function (id) {
    const P = {
      beach: `<svg viewBox="0 0 120 100" aria-hidden="true">
  <ellipse cx="60" cy="88" rx="56" ry="12" fill="#F6D58E"/>
  <path d="M4 70 q14 -10 28 0 t28 0 t28 0 t28 0 V84 H4 z" fill="#3CC0E6"/>
  <circle cx="40" cy="40" r="13" fill="#E8F8FF" stroke="#fff" stroke-width="2"/><circle cx="36" cy="36" r="3" fill="#fff"/>
  <circle cx="66" cy="22" r="9" fill="#E8F8FF" stroke="#fff" stroke-width="2"/>
  <circle cx="82" cy="46" r="6" fill="#E8F8FF" stroke="#fff" stroke-width="2"/>
  <ellipse cx="90" cy="66" rx="12" ry="7" fill="#FF9F1C"/><path d="M101 66 l9 -6 v12 z" fill="#F17C00"/><circle cx="85" cy="64" r="1.6" fill="#2B2D42"/>
</svg>`,
      garden: `<svg viewBox="0 0 120 100" aria-hidden="true">
  <ellipse cx="60" cy="88" rx="56" ry="12" fill="#7BC950"/>
  <path d="M46 34 q-2 -22 6 -24 q6 2 2 26 z M62 34 q2 -22 10 -22 q6 4 -4 26 z" fill="#fff" stroke="#E7E7E7" stroke-width="2"/>
  <path d="M51 30 q0 -12 3 -14 M66 30 q2 -12 5 -13" stroke="#FFB3C7" stroke-width="3" stroke-linecap="round"/>
  <circle cx="34" cy="64" r="20" fill="#3FA34D"/><circle cx="58" cy="56" r="24" fill="#4CB860"/><circle cx="84" cy="64" r="20" fill="#3FA34D"/>
  <circle cx="22" cy="82" r="6" fill="#FF8FB1"/><circle cx="22" cy="82" r="2.5" fill="#FFD23F"/>
  <circle cx="100" cy="80" r="6" fill="#8E6CEF"/><circle cx="100" cy="80" r="2.5" fill="#FFD23F"/>
</svg>`,
      hill: `<svg viewBox="0 0 120 100" aria-hidden="true">
  <rect x="2" y="2" width="116" height="96" rx="20" fill="#1D2B64"/>
  <path d="M2 80 q30 -30 60 -20 t56 10 V98 H2 z" fill="#3B4FA3"/>
  <circle cx="88" cy="26" r="12" fill="#FFF3B0"/><circle cx="94" cy="22" r="10" fill="#1D2B64"/>
  <path d="M30 20 l3 7 7 1 -5 5 1 7 -6 -3 -6 3 1 -7 -5 -5 7 -1 z" fill="#FFD23F"/>
  <circle cx="56" cy="36" r="2.5" fill="#fff"/><circle cx="20" cy="48" r="2" fill="#fff"/><circle cx="70" cy="14" r="2" fill="#fff"/>
  <path d="M30 27 L56 36 L20 48" stroke="#FFF3B0" stroke-width="1.5" stroke-dasharray="3 3" fill="none"/>
</svg>`,
      chest: `<svg viewBox="0 0 120 100" aria-hidden="true">
  <ellipse cx="60" cy="92" rx="50" ry="7" fill="rgba(0,0,0,.15)"/>
  <rect x="16" y="44" width="88" height="46" rx="8" fill="#EF476F"/>
  <rect x="16" y="44" width="88" height="10" fill="#C9375A"/>
  <path d="M14 46 q46 -44 92 0 z" fill="#FF6B8B"/>
  <rect x="52" y="52" width="16" height="18" rx="4" fill="#FFD23F"/>
  <rect x="26" y="20" width="18" height="18" rx="3" fill="#118AB2" transform="rotate(-14 35 29)"/>
  <circle cx="84" cy="24" r="10" fill="#06D6A0"/>
  <path d="M58 12 l4 8 9 1 -7 6 2 9 -8 -5 -8 5 2 -9 -7 -6 9 -1 z" fill="#FFD23F"/>
</svg>`,
    };
    return P[id];
  };

  // ---- Sea ----
  art.fish = function (color) {
    return `<svg viewBox="0 0 80 50" aria-hidden="true">
  <ellipse cx="34" cy="25" rx="26" ry="17" fill="${color}"/>
  <path d="M56 25 L78 10 L78 40 Z" fill="${color}"/>
  <path d="M30 9 q8 -8 16 0" fill="${color}"/>
  <circle cx="20" cy="21" r="4" fill="#2B2D42"/><circle cx="21.5" cy="19.5" r="1.3" fill="#fff"/>
  <path d="M10 30 q4 3 8 0" stroke="#2B2D42" stroke-width="2" fill="none" stroke-linecap="round"/>
</svg>`;
  };

  art.seaweed = function (color) {
    return `<svg viewBox="0 0 40 100" preserveAspectRatio="none" aria-hidden="true">
  <path d="M20 100 Q6 80 18 62 Q30 44 16 26 Q8 14 18 2" stroke="${color}" stroke-width="9" fill="none" stroke-linecap="round"/>
  <path d="M24 100 Q34 84 28 70" stroke="${color}" stroke-width="7" fill="none" stroke-linecap="round"/>
</svg>`;
  };

  // ---- Garden ----
  art.cover = function (kind) {
    const C = {
      bush: `<svg viewBox="0 0 120 90" aria-hidden="true">
  <circle cx="30" cy="58" r="28" fill="#3FA34D"/><circle cx="60" cy="44" r="34" fill="#4CB860"/><circle cx="92" cy="58" r="28" fill="#3FA34D"/>
  <rect x="6" y="58" width="108" height="32" rx="14" fill="#3FA34D"/>
  <circle cx="44" cy="40" r="4" fill="#EF476F"/><circle cx="78" cy="52" r="4" fill="#EF476F"/><circle cx="26" cy="64" r="4" fill="#EF476F"/>
</svg>`,
      flowers: `<svg viewBox="0 0 120 90" aria-hidden="true">
  <rect x="4" y="54" width="112" height="36" rx="16" fill="#6FBF4A"/>
  ${[18, 42, 66, 90, 108].map((x, i) => `<path d="M${x} 60 V${30 + (i % 2) * 10}" stroke="#3B8C2A" stroke-width="5"/>
  <g transform="translate(${x} ${28 + (i % 2) * 10})">${[0, 72, 144, 216, 288].map((a) => `<ellipse rx="7" ry="11" transform="rotate(${a}) translate(0 -9)" fill="${['#FF8FB1', '#8E6CEF', '#FFD23F', '#FF8FB1', '#118AB2'][i]}"/>`).join('')}<circle r="6" fill="#FFD23F"/></g>`).join('')}
</svg>`,
      can: `<svg viewBox="0 0 120 90" aria-hidden="true">
  <rect x="4" y="74" width="112" height="16" rx="8" fill="#6FBF4A"/>
  <path d="M28 30 h56 l-6 52 h-44 z" fill="#118AB2"/>
  <path d="M84 40 l28 -20 l4 6 l-26 22 z" fill="#0C6E8E"/>
  <path d="M40 30 q16 -26 32 0" stroke="#0C6E8E" stroke-width="7" fill="none"/>
  <rect x="26" y="26" width="60" height="9" rx="4" fill="#0C6E8E"/>
  <circle cx="56" cy="56" r="8" fill="#FFD23F"/>
</svg>`,
      log: `<svg viewBox="0 0 120 90" aria-hidden="true">
  <rect x="4" y="76" width="112" height="14" rx="7" fill="#6FBF4A"/>
  <rect x="10" y="36" width="96" height="44" rx="22" fill="#A0673A"/>
  <ellipse cx="100" cy="58" rx="16" ry="22" fill="#D9A066"/>
  <ellipse cx="100" cy="58" rx="9" ry="13" fill="none" stroke="#A0673A" stroke-width="3"/>
  <path d="M24 48 h40 M30 64 h46" stroke="#7E4E28" stroke-width="4" stroke-linecap="round"/>
  <circle cx="40" cy="34" r="7" fill="#3FA34D"/><circle cx="50" cy="32" r="6" fill="#4CB860"/>
</svg>`,
    };
    return C[kind];
  };
  art.COVERS = ['bush', 'flowers', 'can', 'log'];

  art.bunny = function () {
    return `<svg viewBox="0 0 100 100" aria-hidden="true">
  <ellipse cx="34" cy="26" rx="10" ry="26" fill="#fff" stroke="#E2E2E2" stroke-width="2"/><ellipse cx="34" cy="26" rx="5" ry="18" fill="#FFB3C7"/>
  <ellipse cx="66" cy="26" rx="10" ry="26" fill="#fff" stroke="#E2E2E2" stroke-width="2"/><ellipse cx="66" cy="26" rx="5" ry="18" fill="#FFB3C7"/>
  <circle cx="50" cy="68" r="30" fill="#fff" stroke="#E2E2E2" stroke-width="2"/>
  <circle cx="40" cy="64" r="4" fill="#2B2D42"/><circle cx="60" cy="64" r="4" fill="#2B2D42"/>
  <ellipse cx="50" cy="74" rx="4" ry="3" fill="#FF8FB1"/>
  <path d="M44 80 q6 6 12 0" stroke="#2B2D42" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <circle cx="33" cy="76" r="5" fill="#FFB3C7" opacity=".6"/><circle cx="67" cy="76" r="5" fill="#FFB3C7" opacity=".6"/>
</svg>`;
  };

  art.gear = function () {
    return `<svg viewBox="0 0 100 100" aria-hidden="true">
  <circle class="hold-ring" cx="50" cy="50" r="44" fill="none" stroke="#fff" stroke-width="8" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100" transform="rotate(-90 50 50)"/>
  <circle cx="50" cy="50" r="22" fill="none" stroke="rgba(255,255,255,.75)" stroke-width="9" stroke-dasharray="8 6.5"/>
  <circle cx="50" cy="50" r="9" fill="rgba(255,255,255,.75)"/>
</svg>`;
  };

  art.jar = function (stars) {
    const shown = Math.min(stars, 20);
    let s = '';
    for (let i = 0; i < shown; i++) {
      const x = 30 + (i % 5) * 10 + ((Math.floor(i / 5) % 2) * 5);
      const y = 104 - Math.floor(i / 5) * 12;
      s += `<path transform="translate(${x} ${y}) scale(.55)" d="M0 -10 l3 7 7 1 -5 5 1 7 -6 -3 -6 3 1 -7 -5 -5 7 -1 z" fill="#FFD23F" stroke="#F7B801" stroke-width="1.5"/>`;
    }
    return `<svg viewBox="0 0 100 120" aria-hidden="true">
  <rect x="28" y="6" width="44" height="12" rx="4" fill="#C08552"/>
  <path d="M24 20 h52 q8 0 8 10 v76 q0 10 -10 10 h-48 q-10 0 -10 -10 v-76 q0 -10 8 -10 z" fill="rgba(255,255,255,.55)" stroke="#fff" stroke-width="3"/>
  ${s}
</svg>`;
  };

  AA.art = art;
})(self);
