// Trace & Sparkle — night sky. Follow the dots; a finished letter becomes a constellation.
(function (root) {
  'use strict';
  const AA = root.AA;
  const NS = 'http://www.w3.org/2000/svg';
  const LETTERS_PER_ROUND = 3;

  const pathD = (pts) => 'M' + pts.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L');
  function svgEl(tag, attrs) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  function pickLetters(ctx) {
    let pool = AA.engine.activeLetters(ctx.progress, ctx.order);
    if (!pool.length) pool = AA.engine.mastered(ctx.progress);
    const shuffled = AA.engine.shuffle(pool, Math.random);
    const out = [];
    for (let i = 0; i < LETTERS_PER_ROUND; i++) out.push(shuffled[i % shuffled.length]);
    return out;
  }

  AA.games = AA.games || {};
  AA.games.trace = {
    mount(screen, ctx) {
      const el = AA.app.el;
      screen.classList.add('night');
      let stars = '';
      for (let i = 0; i < 40; i++) {
        stars += `<i style="left:${Math.random() * 100}%;top:${Math.random() * 100}%;animation-delay:${-Math.random() * 3}s"></i>`;
      }
      screen.innerHTML = `<div class="night-stars">${stars}</div><div class="night-moon"></div><div class="night-hill"></div>`;
      const buddyBox = el('div', 'night-buddy');
      screen.appendChild(buddyBox);
      const buddy = AA.buddy.mount(buddyBox);
      const board = el('div', 'trace-board');
      screen.appendChild(board);
      const replay = el('button', 'replay round-btn', AA.art.speakerIcon());
      replay.setAttribute('aria-label', 'Say it again');
      screen.appendChild(replay);

      const svg = svgEl('svg', { viewBox: '-8 -8 116 116', class: 'trace-svg' });
      board.appendChild(svg);
      const layers = {};
      for (const name of ['guide', 'done', 'current', 'trail', 'sky']) {
        layers[name] = svgEl('g', { class: 'layer-' + name });
        svg.appendChild(layers[name]);
      }

      const letters = pickLetters(ctx);
      let li = 0, si = 0, letter = null, drag = null, trail = null, busy = false, alive = true;

      const prompt = () => buddy.say(ctx.parts('trace', letter));
      replay.addEventListener('click', () => { if (!busy) prompt(); });

      function clear(g) { while (g.firstChild) g.removeChild(g.firstChild); }

      function showLetter() {
        letter = letters[li];
        si = 0;
        for (const g of Object.values(layers)) clear(g);
        for (const s of AA.strokes[letter]) {
          layers.guide.appendChild(svgEl('path', { d: pathD(s), class: 'guide-stroke' }));
        }
        showStrokeHint();
        prompt();
      }

      function showStrokeHint() {
        clear(layers.current);
        const s = AA.strokes[letter][si];
        layers.current.appendChild(svgEl('path', { d: pathD(s), class: 'current-stroke' }));
        const [x0, y0] = s[0];
        const next = AA.traceMatch.resample(s, 10)[1] || s[1];
        const ang = (Math.atan2(next[1] - y0, next[0] - x0) * 180) / Math.PI;
        const arrow = svgEl('path', { d: 'M0 -5 L9 0 L0 5 Z', class: 'start-arrow', transform: `translate(${next[0]} ${next[1]}) rotate(${ang})` });
        layers.current.appendChild(arrow);
        layers.current.appendChild(svgEl('circle', { cx: x0, cy: y0, r: 7, class: 'start-dot' }));
        const num = svgEl('text', { x: x0, y: y0 + 3.6, class: 'start-num' });
        num.textContent = String(si + 1);
        layers.current.appendChild(num);
      }

      function toBox(e) {
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const p = pt.matrixTransform(svg.getScreenCTM().inverse());
        return [p.x, p.y];
      }

      let lastSparkle = 0;
      function sparkle(e) {
        const now = performance.now();
        if (now - lastSparkle < 45) return;
        lastSparkle = now;
        const s = el('span', 'sparkle');
        const r = screen.getBoundingClientRect();
        s.style.left = e.clientX - r.left + 'px';
        s.style.top = e.clientY - r.top + 'px';
        s.style.background = ['#FFF3B0', '#FFD23F', '#fff', '#FF8FB1', '#9DE0FF'][Math.floor(Math.random() * 5)];
        screen.appendChild(s);
        setTimeout(() => s.remove(), 900);
      }

      // Only one finger draws at a time; extra fingers are ignored.
      let dragId = null;
      svg.addEventListener('pointerdown', (e) => {
        if (busy || drag) return;
        e.preventDefault();
        dragId = e.pointerId;
        try { svg.setPointerCapture(e.pointerId); } catch (err) { /* pointer not capturable */ }
        drag = [toBox(e)];
        trail = svgEl('path', { d: pathD(drag), class: 'trail' });
        layers.trail.appendChild(trail);
        sparkle(e);
      });
      svg.addEventListener('pointermove', (e) => {
        if (!drag || e.pointerId !== dragId) return;
        drag.push(toBox(e));
        trail.setAttribute('d', pathD(drag));
        sparkle(e);
      });
      const end = (e) => {
        if (!drag || e.pointerId !== dragId) return;
        const pts = drag;
        drag = null;
        dragId = null;
        const t = trail;
        t.classList.add('fade');
        setTimeout(() => t.remove(), 500);
        if (busy || si >= AA.strokes[letter].length) return;
        const stroke = AA.strokes[letter][si];
        if (pts.length > 1 && AA.traceMatch.coverage(stroke, pts) >= AA.traceMatch.COMPLETE) strokeDone();
      };
      svg.addEventListener('pointerup', end);
      svg.addEventListener('pointercancel', end);

      async function strokeDone() {
        layers.done.appendChild(svgEl('path', { d: pathD(AA.strokes[letter][si]), class: 'done-stroke' }));
        si += 1;
        if (si < AA.strokes[letter].length) { showStrokeHint(); return; }
        busy = true;
        clear(layers.current);
        constellation();
        buddy.set('cheer', 1800);
        await Promise.all([
          AA.celebrate(screen, { speak: false }),
          AA.voice.say(ctx.parts('sound', letter)),
        ]);
        await new Promise((r) => setTimeout(r, 700));
        if (!alive) return;
        li += 1;
        if (li < letters.length) {
          busy = false;
          showLetter();
        } else {
          const { newStickers } = AA.engine.finishRound(ctx.progress);
          await AA.app.endRound(screen, newStickers);
        }
      }

      function constellation() {
        clear(layers.done);
        clear(layers.guide);
        for (const s of AA.strokes[letter]) {
          const pts = AA.traceMatch.resample(s, 16);
          layers.sky.appendChild(svgEl('path', { d: pathD(s), class: 'sky-line' }));
          pts.forEach((p, i) => {
            const star = svgEl('path', {
              d: 'M0 -6 L1.8 -1.8 6 0 1.8 1.8 0 6 -1.8 1.8 -6 0 -1.8 -1.8 Z',
              class: 'sky-star', transform: `translate(${p[0]} ${p[1]})`,
            });
            star.style.animationDelay = i * 0.06 + 's';
            layers.sky.appendChild(star);
          });
        }
      }

      setTimeout(() => { if (alive) showLetter(); }, 300);
      return () => { alive = false; };
    },
  };
})(self);
