// Settings: name, starting letters, pace, rest timer, backup and restore.
(function (root) {
  'use strict';
  const AA = root.AA;
  const el = (...a) => AA.app.el(...a);
  const MAX_FIRST = 6;

  const RESTORE_ERRORS = {
    'not-ours': "That file isn't an Alphabet Adventure backup.",
    damaged: 'That backup file looks damaged.',
    newer: 'That backup is from a newer version. Update the app first.',
  };

  function backupName() {
    return 'alphabet-adventure-backup-' + AA.engine.today() + '.json';
  }

  AA.parents.views.settings = function (screen, ctx) {
    AA.parents.header(screen, 'Settings');
    const body = el('div', 'p-body');
    screen.appendChild(body);
    const S = ctx.settings;
    const saved = (node) => {
      const t = el('span', 'p-saved', 'Saved');
      node.appendChild(t);
      setTimeout(() => t.remove(), 1500);
    };

    // ---- Name ----
    body.appendChild(el('h2', '', 'Child’s name'));
    const nameRow = el('div', 'rec-buttons');
    const name = el('input', 'p-input');
    name.type = 'text';
    name.value = S.childName;
    name.placeholder = 'First name';
    const saveName = el('button', 'pbtn', 'Save name');
    saveName.addEventListener('click', async () => {
      S.childName = name.value.trim();
      await ctx.saveSettings();
      drawFirst();
      saved(nameRow);
    });
    nameRow.append(saveName);
    body.append(name, nameRow);
    body.appendChild(el('p', 'p-note', 'Changing the name keeps all progress.'));

    // ---- Starting letters ----
    body.appendChild(el('h2', '', 'Starting letters'));
    body.appendChild(el('p', 'p-note', `Normally the letters in the name come first. To choose your own, tap up to ${MAX_FIRST} letters in the order you want them.`));
    const firstBox = el('div');
    body.appendChild(firstBox);
    let picking = S.firstLetters.slice();

    function drawFirst() {
      firstBox.innerHTML = '';
      const now = el('p', 'p-note', 'Coming up first: <strong>' + ctx.order.slice(0, 6).join(' ') + '</strong>');
      firstBox.appendChild(now);
      const grid = el('div', 'first-grid');
      for (const L of AA.data.LETTERS) {
        const i = picking.indexOf(L);
        const b = el('button', 'first-tile' + (i >= 0 ? ' on' : ''), L + (i >= 0 ? `<sup>${i + 1}</sup>` : ''));
        b.addEventListener('click', () => {
          if (i >= 0) picking.splice(i, 1);
          else if (picking.length < MAX_FIRST) picking.push(L);
          drawFirst();
        });
        grid.appendChild(b);
      }
      firstBox.appendChild(grid);
      const row = el('div', 'rec-buttons');
      const save = el('button', 'pbtn primary', 'Use these letters');
      save.addEventListener('click', async () => {
        S.firstLetters = picking.slice();
        await ctx.saveSettings();
        drawFirst();
        saved(row);
      });
      const reset = el('button', 'pbtn', 'Use name letters');
      reset.addEventListener('click', async () => {
        picking = [];
        S.firstLetters = [];
        await ctx.saveSettings();
        drawFirst();
        saved(row);
      });
      row.append(save, reset);
      firstBox.appendChild(row);
    }
    drawFirst();

    // ---- Pace ----
    body.appendChild(el('h2', '', 'New letter pace'));
    const paceRow = el('div', 'p-choice');
    for (const [val, label] of [['normal', 'Normal — 5 right picks over 2 days'], ['slower', 'Slower — 8 right picks over 3 days']]) {
      const b = el('button', 'pbtn' + (S.pace === val ? ' primary' : ''), label);
      b.addEventListener('click', async () => {
        S.pace = val;
        await ctx.saveSettings();
        [...paceRow.children].forEach((c) => c.classList.toggle('primary', c === b));
      });
      paceRow.appendChild(b);
    }
    body.appendChild(paceRow);

    // ---- Rest timer ----
    body.appendChild(el('h2', '', 'Time to rest'));
    body.appendChild(el('p', 'p-note', 'After this much play, the buddy says goodnight and the app sleeps until a grown-up holds the gear for 3 seconds.'));
    const restRow = el('div', 'p-choice');
    for (const m of [0, 10, 15, 20, 30]) {
      const b = el('button', 'pbtn' + (S.restMinutes === m ? ' primary' : ''), m ? m + ' min' : 'Off');
      b.addEventListener('click', async () => {
        S.restMinutes = m;
        await ctx.saveSettings();
        [...restRow.children].forEach((c) => c.classList.toggle('primary', c === b));
      });
      restRow.appendChild(b);
    }
    body.appendChild(restRow);

    // ---- Backup / restore ----
    body.appendChild(el('h2', '', 'Back up and restore'));
    body.appendChild(el('p', 'p-note', 'A backup is one file with the name, progress, stickers and every recording. Keep it safe (AirDrop or email it to yourself), and open it here on another iPad, iPhone or computer to carry on.'));
    const bRow = el('div', 'rec-buttons');
    const backupBtn = el('button', 'pbtn primary', 'Back up');
    const restoreBtn = el('button', 'pbtn', 'Restore from a backup…');
    const file = el('input');
    file.type = 'file';
    file.accept = '.json,application/json';
    file.hidden = true;
    bRow.append(backupBtn, restoreBtn, file);
    body.appendChild(bRow);
    const bMsg = el('div', 'p-panel');
    body.appendChild(bMsg);

    backupBtn.addEventListener('click', async () => {
      bMsg.textContent = 'Preparing backup…';
      const text = await AA.backup.serialize({
        settings: ctx.settings, progress: ctx.progress, recordings: await AA.storage.allRecordings(),
      });
      const blob = new Blob([text], { type: 'application/json' });
      const f = new File([blob], backupName(), { type: 'application/json' });
      try {
        if (navigator.canShare && navigator.canShare({ files: [f] })) {
          await navigator.share({ files: [f], title: 'Alphabet Adventure backup' });
        } else {
          const a = el('a');
          a.href = URL.createObjectURL(blob);
          a.download = backupName();
          document.body.appendChild(a);
          a.click();
          setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
        }
        bMsg.textContent = 'Backup ready: ' + backupName();
      } catch (e) {
        bMsg.textContent = e && e.name === 'AbortError' ? '' : "Couldn't make the backup file. Try again.";
      }
    });

    restoreBtn.addEventListener('click', () => file.click());
    file.addEventListener('change', async () => {
      const f = file.files[0];
      file.value = '';
      if (!f) return;
      bMsg.innerHTML = '';
      let parsed;
      try {
        parsed = await AA.backup.parse(await f.text());
      } catch (e) {
        bMsg.textContent = (e && RESTORE_ERRORS[e.reason]) || RESTORE_ERRORS.damaged;
        return;
      }
      const s = parsed.summary;
      bMsg.appendChild(el('p', '', `Replace everything on this device with: <strong>${escapeHtml(s.name || 'no name')}</strong>, ${s.mastered} letter${s.mastered === 1 ? '' : 's'} mastered, ${s.recordings} recording${s.recordings === 1 ? '' : 's'}?`));
      const row = el('div', 'rec-buttons');
      const yes = el('button', 'pbtn record', 'Replace');
      const no = el('button', 'pbtn', 'Cancel');
      no.addEventListener('click', () => { bMsg.innerHTML = ''; });
      yes.addEventListener('click', async () => {
        try {
          await AA.storage.replaceAll(parsed);
        } catch (e) {
          bMsg.textContent = "Couldn't restore. Nothing was changed. Free up some space on this device and try again.";
          return;
        }
        location.hash = '';
        location.reload();
      });
      row.append(yes, no);
      bMsg.appendChild(row);
    });

    return () => {};
  };

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
})(self);
