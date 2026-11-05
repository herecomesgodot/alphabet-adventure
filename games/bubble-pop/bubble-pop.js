// Bubble Pop — under the sea. "Pop the M!"
(function (root) {
  'use strict';
  const AA = root.AA;
  const CROSS_SECONDS = 9; // time for a bubble to rise the full height

  AA.games = AA.games || {};
  AA.games['bubble-pop'] = {
    mount(screen, ctx) {
      const el = AA.app.el;
      screen.classList.add('sea');
      screen.innerHTML = `
        <div class="sea-surface"></div>
        <div class="sea-fish">${AA.art.fish('#FF9F1C')}</div>
        <div class="sea-fish sea-fish-2">${AA.art.fish('#FF8FB1')}</div>
        <div class="sea-weed sea-weed-l">${AA.art.seaweed('#1D9E75')}</div>
        <div class="sea-weed sea-weed-r">${AA.art.seaweed('#0F6E56')}</div>
        <div class="sea-sand"></div>`;
      const field = el('div', 'bubble-field');
      screen.appendChild(field);
      const buddyBox = el('div', 'sea-buddy');
      screen.appendChild(buddyBox);
      const buddy = AA.buddy.mount(buddyBox);
      const replay = el('button', 'replay round-btn', AA.art.speakerIcon());
      replay.setAttribute('aria-label', 'Say it again');
      screen.appendChild(replay);

      const round = AA.app.newRound();
      let bubbles = [];
      let busy = false;
      let alive = true;
      let raf = 0;
      let last = performance.now();

      const prompt = () => buddy.say(ctx.parts('pop', round.prompt.target));
      replay.addEventListener('click', () => { if (!busy) prompt(); });

      function size() {
        const w = field.clientWidth, h = field.clientHeight;
        const n = round.prompt.choices.length;
        return Math.max(ctx.device === 'phone' ? 64 : 84, Math.min(h * 0.3, (w / n) * 0.78, 210));
      }

      function layout() {
        const w = field.clientWidth, h = field.clientHeight, s = size();
        const n = bubbles.length;
        const order = AA.engine.shuffle(bubbles.map((_, i) => i), Math.random);
        bubbles.forEach((b, i) => {
          b.size = s;
          b.el.style.width = b.el.style.height = s + 'px';
          b.baseX = ((i + 0.5) / n) * w - s / 2;
          // Start spread through the lower two-thirds so they're tappable straight away.
          if (b.y == null) b.y = h * 0.3 + (order[i] / Math.max(1, n - 1)) * (h * 0.45);
        });
      }

      function makeBubbles() {
        field.innerHTML = '';
        bubbles = round.prompt.choices.map((L, i) => {
          const b = { letter: L, y: null, phase: Math.random() * Math.PI * 2, el: el('button', 'bubble') };
          b.el.innerHTML = AA.art.letter(L, { color: '#085041', width: 14 });
          b.el.setAttribute('aria-label', L);
          b.el.addEventListener('pointerdown', (e) => { e.preventDefault(); onTap(b); });
          field.appendChild(b.el);
          return b;
        });
        layout();
      }

      function frame(now) {
        if (!alive) return;
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        const h = field.clientHeight;
        for (const b of bubbles) {
          if (b.popped) continue;
          b.y -= (h / CROSS_SECONDS) * dt;
          if (b.y < -b.size) b.y = h + b.size * 0.2;
          b.phase += dt * 1.4;
          const x = b.baseX + Math.sin(b.phase) * b.size * 0.12;
          b.el.style.transform = `translate(${x}px, ${b.y}px)`;
        }
        raf = requestAnimationFrame(frame);
      }

      async function onTap(b) {
        if (busy || b.popped) return;
        const r = round.tap(b.letter);
        if (r.result === 'ignored') return;
        if (r.result === 'wrong') {
          b.el.classList.remove('wobble');
          void b.el.offsetWidth;
          b.el.classList.add('wobble');
          if (r.glow) bubbles.find((x) => x.letter === round.prompt.target).el.classList.add('glow');
          await buddy.say(ctx.parts('thats', b.letter).concat(ctx.parts('find', round.prompt.target)));
          return;
        }
        busy = true;
        b.popped = true;
        b.el.classList.add('popped');
        const rect = b.el.getBoundingClientRect();
        const sr = screen.getBoundingClientRect();
        buddy.set('cheer', 1400);
        const saving = AA.app.saveIfDirty(round);
        await AA.celebrate(screen, {
          x: ((rect.left + rect.width / 2 - sr.left) / sr.width) * 100,
          y: ((rect.top + rect.height / 2 - sr.top) / sr.height) * 100,
        });
        await saving;
        if (!alive) return;
        if (round.next()) {
          makeBubbles();
          busy = false;
          prompt();
        } else {
          await AA.app.finishRound(screen, round);
        }
      }

      const onResize = () => layout();
      addEventListener('resize', onResize);
      makeBubbles();
      raf = requestAnimationFrame(frame);
      setTimeout(() => { if (alive) prompt(); }, 300);

      return () => {
        alive = false;
        cancelAnimationFrame(raf);
        removeEventListener('resize', onResize);
      };
    },
  };
})(self);
