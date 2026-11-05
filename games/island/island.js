// Home: a little island with one place per world, the star jar and the parents' gear.
(function (root) {
  'use strict';
  const AA = root.AA;

  const PLACES = [
    { id: 'beach', route: '#/bubble-pop', label: 'Bubble Pop' },
    { id: 'garden', route: '#/peekaboo', label: 'Peekaboo' },
    { id: 'hill', route: '#/trace', label: 'Trace' },
    { id: 'chest', route: '#/stickers', label: 'Stickers' },
  ];

  AA.games = AA.games || {};
  AA.games.island = {
    mount(screen, ctx) {
      const el = AA.app.el;
      screen.classList.add('island');
      screen.appendChild(el('div', 'island-land'));

      const buddyBox = el('div', 'island-buddy');
      screen.appendChild(buddyBox);
      const buddy = AA.buddy.mount(buddyBox);
      buddy.set('wave', 2500);

      const grid = el('div', 'island-places');
      PLACES.forEach((p, i) => {
        const b = el('button', 'island-place', AA.art.place(p.id));
        b.style.animationDelay = i * 0.4 + 's';
        b.setAttribute('aria-label', p.label);
        b.addEventListener('click', () => ctx.go(p.route));
        grid.appendChild(b);
      });
      screen.appendChild(grid);

      const jar = el('div', 'island-jar', AA.art.jar(ctx.progress.stars));
      if (ctx.progress.stars > 20) jar.appendChild(el('span', 'jar-count', String(ctx.progress.stars)));
      screen.appendChild(jar);

      const gear = el('button', 'island-gear', AA.art.gear());
      gear.setAttribute('aria-label', 'Grown-ups: press and hold');
      screen.appendChild(gear);
      const stopHold = AA.app.holdToOpen(gear, 3000, () => ctx.go('#/parents'));

      let greeted = false;
      if (ctx.settings.childName && !AA.games.island._greeted) {
        greeted = true;
        AA.games.island._greeted = true;
        setTimeout(() => buddy.say(ctx.parts('greet')), 400);
      }
      return () => { stopHold(); if (greeted) AA.voice.stop(); };
    },
  };
})(self);
