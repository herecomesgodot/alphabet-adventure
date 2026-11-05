// Peekaboo Letters — sunny garden. Letters peek out on little signs from
// behind bushes and flowers; find the right one and the bunny pops up.
(function (root) {
  'use strict';
  const AA = root.AA;

  AA.games = AA.games || {};
  AA.games.peekaboo = {
    mount(screen, ctx) {
      const el = AA.app.el;
      screen.classList.add('garden');
      screen.innerHTML = `
        <div class="garden-sun"></div>
        <div class="garden-cloud"></div>
        <div class="garden-cloud garden-cloud-2"></div>
        <div class="garden-grass"></div>`;
      const buddyBox = el('div', 'garden-buddy');
      screen.appendChild(buddyBox);
      const buddy = AA.buddy.mount(buddyBox);
      const row = el('div', 'peek-row');
      screen.appendChild(row);
      const replay = el('button', 'replay round-btn', AA.art.speakerIcon());
      replay.setAttribute('aria-label', 'Say it again');
      screen.appendChild(replay);

      const round = AA.app.newRound();
      let spots = [];
      let busy = false;
      let alive = true;

      const prompt = () => buddy.say(ctx.parts('where', round.prompt.target));
      replay.addEventListener('click', () => { if (!busy) prompt(); });

      function makeSpots() {
        row.innerHTML = '';
        row.dataset.count = round.prompt.choices.length;
        const covers = AA.engine.shuffle(AA.art.COVERS, Math.random);
        spots = round.prompt.choices.map((L, i) => {
          const s = el('button', 'peek-spot');
          s.style.setProperty('--delay', (i * 0.5) + 's');
          s.setAttribute('aria-label', L);
          s.innerHTML = `
            <div class="peek-bunny">${AA.art.bunny()}</div>
            <div class="peek-sign">${AA.art.letter(L, { color: '#2B2D42', width: 14 })}</div>
            <div class="peek-cover">${AA.art.cover(covers[i % covers.length])}</div>`;
          s.addEventListener('pointerdown', (e) => { e.preventDefault(); onTap(L, s); });
          row.appendChild(s);
          return s;
        });
      }

      async function onTap(L, s) {
        if (busy) return;
        const r = round.tap(L);
        if (r.result === 'ignored') return;
        if (r.result === 'wrong') {
          s.classList.remove('rustle');
          void s.offsetWidth;
          s.classList.add('rustle');
          if (r.glow) spots[round.prompt.choices.indexOf(round.prompt.target)].classList.add('hint');
          await buddy.say(ctx.parts('thats', L).concat(ctx.parts('find', round.prompt.target)));
          return;
        }
        busy = true;
        s.classList.add('found');
        buddy.set('cheer', 1400);
        const rect = s.getBoundingClientRect();
        const sr = screen.getBoundingClientRect();
        const saving = AA.app.saveIfDirty(round);
        await AA.celebrate(screen, {
          x: ((rect.left + rect.width / 2 - sr.left) / sr.width) * 100,
          y: ((rect.top + rect.height * 0.3 - sr.top) / sr.height) * 100,
        });
        await saving;
        if (!alive) return;
        if (round.next()) {
          makeSpots();
          busy = false;
          prompt();
        } else {
          await AA.app.finishRound(screen, round);
        }
      }

      makeSpots();
      setTimeout(() => { if (alive) prompt(); }, 300);
      return () => { alive = false; };
    },
  };
})(self);
