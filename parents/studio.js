// Recording studio: letter sounds, and "use my voice for…" every other clip.
(function (root) {
  'use strict';
  const AA = root.AA;
  const el = (...a) => AA.app.el(...a);

  const GROUP_TITLES = {
    child: 'Your child’s name',
    instruction: 'Instructions',
    praise: 'Cheers',
    other: 'Hello, goodbye and more',
    name: 'Letter names',
  };

  AA.parents.views.studio = function (screen, ctx) {
    AA.parents.header(screen, 'Recording studio');
    const tabs = el('div', 'p-tabs');
    const t1 = el('button', 'p-tab', 'Letter sounds');
    const t2 = el('button', 'p-tab', 'Use my voice for…');
    tabs.append(t1, t2);
    screen.appendChild(tabs);
    const body = el('div', 'p-body');
    screen.appendChild(body);
    let tab = 'sounds';
    let open = null;

    t1.addEventListener('click', () => { tab = 'sounds'; open = null; draw(); });
    t2.addEventListener('click', () => { tab = 'other'; draw(); });

    function reminder() {
      body.appendChild(el('p', 'p-note', 'After recording, use Settings → Back up so your recordings are safe.'));
    }

    function drawSounds() {
      if (open) {
        const back = el('button', 'pbtn', '← All letters');
        back.addEventListener('click', () => { open = null; draw(); });
        body.appendChild(back);
        AA.parents.letterCard(body, open, () => draw());
        reminder();
        return;
      }
      const grid = el('div', 'studio-grid');
      for (const L of ctx.order) {
        const done = AA.voice.recorded.has('sound-' + L);
        const b = el('button', 'studio-tile' + (done ? ' done' : ''), AA.art.letter(L));
        b.setAttribute('aria-label', L + (done ? ', recorded' : ', not recorded'));
        if (done) b.appendChild(el('span', 'tick', '✓'));
        b.addEventListener('click', () => { open = L; draw(); });
        grid.appendChild(b);
      }
      const n = [...AA.voice.recorded].filter((id) => id.startsWith('sound-')).length;
      body.appendChild(el('p', 'p-note', `${n} of 26 recorded. Tap a letter to record or redo it.`));
      body.appendChild(grid);
    }

    function drawOther() {
      body.appendChild(el('p', 'p-note', 'Anything you record here is used instead of the device voice. “Use device voice” switches back.'));
      const groups = {};
      for (const [id, c] of Object.entries(AA.clips.CATALOGUE)) {
        if (c.group === 'sound') continue;
        (groups[c.group] = groups[c.group] || []).push([id, c]);
      }
      for (const g of ['child', 'instruction', 'praise', 'other', 'name']) {
        if (!groups[g]) continue;
        body.appendChild(el('h2', '', GROUP_TITLES[g]));
        for (const [id, c] of groups[g]) {
          const row = el('div', 'clip-row');
          const label = id === 'child-name' ? (ctx.settings.childName || 'Child’s name') : c.text;
          row.appendChild(el('div', 'clip-label', label));
          const ctrl = el('div');
          row.appendChild(ctrl);
          body.appendChild(row);
          AA.parents.recordControls(ctrl, id, { fallbackText: id === 'child-name' ? ctx.settings.childName : c.text });
        }
      }
      reminder();
    }

    function draw() {
      body.innerHTML = '';
      t1.classList.toggle('on', tab === 'sounds');
      t2.classList.toggle('on', tab === 'other');
      if (tab === 'sounds') drawSounds();
      else drawOther();
    }

    draw();
    return () => {};
  };
})(self);
