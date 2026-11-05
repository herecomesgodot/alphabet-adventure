// Sticker Book — toy-box brights. One sticker per mastered letter, six to a page.
(function (root) {
  'use strict';
  const AA = root.AA;
  const PER_PAGE = 6;

  AA.games = AA.games || {};
  AA.games.stickers = {
    mount(screen, ctx) {
      const el = AA.app.el;
      screen.classList.add('toybox');
      let confetti = '';
      const colors = ['#EF476F', '#118AB2', '#06D6A0', '#FFD23F', '#8E6CEF', '#FF9F1C'];
      for (let i = 0; i < 26; i++) {
        confetti += `<i style="left:${Math.random() * 100}%;top:${Math.random() * 100}%;background:${colors[i % 6]};transform:rotate(${Math.random() * 90}deg)"></i>`;
      }
      screen.innerHTML = `<div class="toybox-confetti">${confetti}</div>`;

      const jar = el('div', 'book-jar', AA.art.jar(ctx.progress.stars));
      jar.appendChild(el('span', 'jar-count', String(ctx.progress.stars)));
      screen.appendChild(jar);

      const book = el('div', 'book');
      const pageEl = el('div', 'book-page');
      book.appendChild(pageEl);
      screen.appendChild(book);
      const prev = el('button', 'book-arrow book-prev round-btn', arrow(-1));
      const next = el('button', 'book-arrow book-next round-btn', arrow(1));
      prev.setAttribute('aria-label', 'Previous page');
      next.setAttribute('aria-label', 'Next page');
      const dots = el('div', 'book-dots');
      screen.append(prev, next, dots);

      const earned = new Set(ctx.progress.stickers);
      const pages = Math.ceil(ctx.order.length / PER_PAGE);
      // Open on the page with the newest sticker.
      const newest = ctx.progress.stickers[ctx.progress.stickers.length - 1];
      let page = newest ? Math.floor(ctx.order.indexOf(newest) / PER_PAGE) : 0;

      function render() {
        pageEl.innerHTML = '';
        for (const L of ctx.order.slice(page * PER_PAGE, (page + 1) * PER_PAGE)) {
          if (earned.has(L)) {
            const spot = el('button', 'sticker-spot earned', AA.art.sticker(L));
            spot.appendChild(el('div', 'sticker-letter', AA.art.letter(L, { color: '#fff', width: 15 })));
            spot.setAttribute('aria-label', L + ' ' + AA.data.WORDS[L].word);
            spot.addEventListener('click', () => {
              spot.classList.remove('wobble');
              void spot.offsetWidth;
              spot.classList.add('wobble');
              AA.voice.say(ctx.parts('sound', L).concat([AA.clips.part('like'), { id: 'word-' + L, text: AA.data.WORDS[L].word }]));
            });
            pageEl.appendChild(spot);
          } else {
            pageEl.appendChild(el('div', 'sticker-spot empty'));
          }
        }
        prev.style.visibility = page > 0 ? 'visible' : 'hidden';
        next.style.visibility = page < pages - 1 ? 'visible' : 'hidden';
        dots.innerHTML = '';
        for (let i = 0; i < pages; i++) dots.appendChild(el('span', i === page ? 'on' : ''));
      }

      prev.addEventListener('click', () => { if (page > 0) { page--; render(); } });
      next.addEventListener('click', () => { if (page < pages - 1) { page++; render(); } });
      render();
      return () => {};
    },
  };

  function arrow(dir) {
    const d = dir < 0 ? 'M60 28 L38 50 L60 72' : 'M40 28 L62 50 L40 72';
    return `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" fill="#FFD23F"/>
<path d="${d}" fill="none" stroke="#2B2D42" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }
})(self);
