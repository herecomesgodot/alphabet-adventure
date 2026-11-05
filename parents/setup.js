// First run: child's name, then the 26 letter sounds, then off to the island.
(function (root) {
  'use strict';
  const AA = root.AA;
  const el = (...a) => AA.app.el(...a);

  // One letter-sound card; shared with the recording studio.
  AA.parents.letterCard = function (box, L, onSaved) {
    const W = AA.data.WORDS[L];
    const card = el('div', 'letter-card');
    card.innerHTML = `
      <div class="lc-letter">${AA.art.letter(L)}</div>
      <div class="lc-pic">${AA.art.sticker(L)}</div>
      <div class="lc-text"><strong>${L}, ${W.soundHint}</strong>
      <span>Say the sound the letter makes, short and clear — not its name.</span></div>`;
    const ctrl = el('div');
    card.appendChild(ctrl);
    box.appendChild(card);
    AA.parents.recordControls(ctrl, 'sound-' + L, { onSaved, fallbackText: L });
    return card;
  };

  AA.parents.views.setup = function (screen, ctx) {
    let step = 'name';
    let li = 0;
    const body = el('div', 'p-body');

    function draw() {
      screen.innerHTML = '';
      const h = el('header', 'p-header');
      h.appendChild(el('h1', '', 'Welcome! Let’s set up'));
      screen.appendChild(h);
      screen.appendChild(body);
      body.innerHTML = '';
      if (step === 'name') drawName();
      else if (step === 'sounds') drawSound();
      else drawDone();
    }

    function drawName() {
      body.appendChild(el('h2', '', '1. Your child’s name'));
      body.appendChild(el('p', 'p-note', 'The buddy says hello by name, and the letters in the name are learned first.'));
      const input = el('input', 'p-input');
      input.type = 'text';
      input.autocomplete = 'off';
      input.placeholder = 'First name';
      input.value = ctx.settings.childName;
      body.appendChild(input);
      const row = el('div', 'rec-buttons');
      const hear = el('button', 'pbtn', 'Hear it');
      hear.addEventListener('click', async () => {
        ctx.settings.childName = input.value.trim();
        await ctx.saveSettings();
        AA.voice.say(ctx.parts('greet'));
      });
      row.appendChild(hear);
      body.appendChild(row);
      const recBox = el('details', 'p-details');
      recBox.innerHTML = '<summary>Doesn’t sound right? Record the name instead</summary>';
      const ctrl = el('div');
      recBox.appendChild(ctrl);
      body.appendChild(recBox);
      AA.parents.recordControls(ctrl, 'child-name', { fallbackText: input.value });
      const next = el('button', 'pbtn primary big', 'Next: letter sounds →');
      next.addEventListener('click', async () => {
        ctx.settings.childName = input.value.trim();
        await ctx.saveSettings();
        step = 'sounds';
        li = 0;
        draw();
      });
      body.appendChild(next);
    }

    function drawSound() {
      const recorded = ctx.order.filter((L) => AA.voice.recorded.has('sound-' + L)).length;
      body.appendChild(el('h2', '', '2. Record the letter sounds'));
      body.appendChild(el('p', 'p-note', `${recorded} of 26 recorded. About 5 minutes in all. You can skip any and come back later from the Recording studio.`));
      const L = ctx.order[li];
      AA.parents.letterCard(body, L, () => { setTimeout(() => go(1), 400); });
      const nav = el('div', 'rec-buttons');
      const back = el('button', 'pbtn', '← Previous');
      back.disabled = li === 0;
      back.addEventListener('click', () => go(-1));
      const skip = el('button', 'pbtn', li === 25 ? 'Finish' : 'Skip →');
      skip.addEventListener('click', () => go(1));
      const later = el('button', 'pbtn', 'Finish later');
      later.addEventListener('click', () => { step = 'done'; draw(); });
      nav.append(back, skip, later);
      body.appendChild(nav);
      body.appendChild(el('p', 'p-note', `Letter ${li + 1} of 26`));
    }

    function go(d) {
      li += d;
      if (li >= 26) { step = 'done'; li = 25; }
      if (li < 0) li = 0;
      draw();
    }

    function drawDone() {
      body.appendChild(el('h2', '', '3. All set'));
      body.appendChild(el('p', 'p-note', 'To come back here, press and hold the little gear in the corner of the island for 3 seconds.'));
      body.appendChild(el('p', 'p-note', 'Tip: use Settings → Back up after recording, so your voice is safe if this device is reset.'));
      const go = el('button', 'pbtn primary big', 'Start playing');
      go.addEventListener('click', async () => {
        ctx.settings.setupDone = true;
        await ctx.saveSettings();
        AA.storage.persist();
        ctx.go('#/');
      });
      body.appendChild(go);
    }

    draw();
    return () => {};
  };
})(self);
