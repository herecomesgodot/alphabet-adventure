// The shared "you got it!" burst, with a random praise clip.
(function (root) {
  'use strict';
  const AA = root.AA;
  const COLORS = ['#FFD23F', '#EF476F', '#06D6A0', '#118AB2', '#8E6CEF', '#FF9F1C'];

  AA.celebrate = function (el, { x = 50, y = 50, speak = true } = {}) {
    const burst = document.createElement('div');
    burst.className = 'burst';
    burst.style.left = x + '%';
    burst.style.top = y + '%';
    for (let i = 0; i < 18; i++) {
      const piece = document.createElement('span');
      const angle = (i / 18) * Math.PI * 2;
      const dist = 90 + Math.random() * 80;
      piece.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
      piece.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
      piece.style.background = COLORS[i % COLORS.length];
      if (i % 3 === 0) piece.classList.add('star');
      burst.appendChild(piece);
    }
    el.appendChild(burst);
    const ids = AA.clips.PRAISE_IDS;
    const said = speak ? AA.voice.say([AA.clips.part(ids[Math.floor(Math.random() * ids.length)])]) : Promise.resolve();
    const shown = new Promise((r) => setTimeout(r, 1200));
    return Promise.all([said, shown]).then(() => burst.remove());
  };
})(self);
