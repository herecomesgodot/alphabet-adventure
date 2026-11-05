// Progress: a 26-letter grid — grey not started, yellow learning, green mastered.
(function (root) {
  'use strict';
  const AA = root.AA;
  const el = (...a) => AA.app.el(...a);

  function niceDate(s) {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  AA.parents.views.progress = function (screen, ctx) {
    AA.parents.header(screen, 'Progress');
    const body = el('div', 'p-body');
    screen.appendChild(body);
    const P = ctx.progress;
    const pace = ctx.pace();
    const mastered = AA.engine.mastered(P).length;
    const name = ctx.settings.childName || 'Your child';
    body.appendChild(el('p', 'p-note', `${name} has mastered ${mastered} of 26 letters and earned ${P.stars} playtime star${P.stars === 1 ? '' : 's'}. A letter is mastered after ${pace.picks} right-first-time picks on ${pace.days} different days.`));
    const legend = el('div', 'prog-legend', '<span class="k grey"></span>Not started <span class="k yellow"></span>Learning <span class="k green"></span>Mastered');
    body.appendChild(legend);
    const grid = el('div', 'prog-grid');
    for (const L of ctx.order) {
      const s = P.letters[L];
      const state = s.mastered ? 'green' : s.correct > 0 ? 'yellow' : 'grey';
      const tile = el('div', 'prog-tile ' + state, AA.art.letter(L, { width: 12 }));
      const caption = s.mastered ? niceDate(s.mastered) : s.correct > 0 ? `${Math.min(s.correct, pace.picks)} of ${pace.picks}` : '';
      tile.appendChild(el('span', 'prog-cap', caption));
      grid.appendChild(tile);
    }
    body.appendChild(grid);
    return () => {};
  };
})(self);
