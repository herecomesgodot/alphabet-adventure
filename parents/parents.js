// Parents' area: menu, routing between its pages, the recorder and shared record controls.
(function (root) {
  'use strict';
  const AA = root.AA;
  const el = (...a) => AA.app.el(...a);

  const parents = { views: {} };

  // ---- Recorder ----------------------------------------------------------

  const MAX_MS = 4000;
  parents.recorder = {
    supported() {
      return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && root.MediaRecorder);
    },
    mimeType() {
      for (const t of ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm']) {
        if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t)) return t;
      }
      return '';
    },
    // Resolves with a Blob when recording stops (by stop() or after 4 seconds).
    async record(onStarted) {
      if (!this.supported()) throw { reason: 'unsupported' };
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (e) {
        throw { reason: e && (e.name === 'NotAllowedError' || e.name === 'SecurityError') ? 'denied' : 'unsupported' };
      }
      const type = this.mimeType();
      const rec = new MediaRecorder(stream, type ? { mimeType: type } : undefined);
      const chunks = [];
      rec.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
      const done = new Promise((resolve) => {
        rec.onstop = () => {
          stream.getTracks().forEach((t) => t.stop());
          resolve(new Blob(chunks, { type: rec.mimeType || type || 'audio/webm' }));
        };
      });
      rec.start();
      const timer = setTimeout(() => { if (rec.state === 'recording') rec.stop(); }, MAX_MS);
      this.stop = () => { clearTimeout(timer); if (rec.state === 'recording') rec.stop(); };
      if (onStarted) onStarted();
      return done;
    },
    stop() {},
  };

  async function lowOnSpace() {
    try {
      const { quota, usage } = await navigator.storage.estimate();
      return quota - usage < 1024 * 1024;
    } catch (e) {
      return false;
    }
  }

  const MIC_MESSAGES = {
    denied: 'Microphone is blocked. On iPad or iPhone: Settings → Safari → Microphone → Allow, then come back. You can keep using the device voice.',
    unsupported: "This browser can't record sound here. You can keep using the device voice.",
    space: "There isn't enough space on this device to save a recording. Free up some space and try again.",
  };

  // Record / listen / keep / redo controls for one clip. onSaved runs after "Keep".
  parents.recordControls = function (box, clipId, { onSaved, fallbackText } = {}) {
    box.classList.add('rec');
    const status = el('div', 'rec-status');
    const buttons = el('div', 'rec-buttons');
    const msg = el('div', 'rec-msg');
    box.append(status, buttons, msg);
    let pending = null;

    const btn = (label, cls, fn) => {
      const b = el('button', 'pbtn ' + cls, label);
      b.addEventListener('click', fn);
      return b;
    };

    async function render() {
      const has = AA.voice.recorded.has(clipId);
      buttons.innerHTML = '';
      msg.textContent = '';
      if (pending) {
        status.textContent = 'How does that sound?';
        buttons.append(
          btn('Keep it', 'primary', keep),
          btn('Redo', '', record),
          btn('Listen again', '', () => AA.voice.playBlob(pending)),
        );
        return;
      }
      status.textContent = has ? 'Your recording is saved.' : 'Not recorded yet.';
      buttons.append(btn(has ? 'Record again' : 'Record', 'record', record));
      buttons.append(btn('Listen', '', () => AA.voice.say([{ id: clipId, text: fallbackText }])));
      if (has) {
        buttons.append(btn('Use device voice', '', async () => {
          await AA.storage.deleteRecording(clipId);
          await AA.voice.refreshRecorded();
          render();
          if (onSaved) onSaved();
        }));
      }
    }

    async function record() {
      if (await lowOnSpace()) { msg.textContent = MIC_MESSAGES.space; return; }
      pending = null;
      buttons.innerHTML = '';
      const stop = btn('Stop', 'record recording', () => parents.recorder.stop());
      status.textContent = 'Get ready…';
      buttons.append(stop);
      try {
        const blob = await parents.recorder.record(() => { status.textContent = 'Recording… speak now'; });
        if (!blob.size) throw { reason: 'unsupported' };
        pending = blob;
        render();
        AA.voice.playBlob(blob).catch(() => {});
      } catch (e) {
        render();
        msg.textContent = MIC_MESSAGES[e && e.reason] || MIC_MESSAGES.unsupported;
      }
    }

    async function keep() {
      await AA.storage.putRecording(clipId, pending);
      pending = null;
      await AA.voice.refreshRecorded();
      render();
      if (onSaved) onSaved();
    }

    render();
    return { render };
  };

  // ---- Pages ---------------------------------------------------------------

  parents.header = function (screen, title, back = '#/parents') {
    const h = el('header', 'p-header');
    const b = el('button', 'pbtn back', back === '#/' ? '← Back to the game' : '← Back');
    b.addEventListener('click', () => AA.app.ctx.go(back));
    h.append(b, el('h1', '', title));
    screen.appendChild(h);
    if (!AA.storage.available()) {
      screen.appendChild(el('div', 'p-banner', "This browser can't save recordings here, and may not keep progress after closing. For the full app, open it from its web address."));
    }
  };

  function menu(screen, ctx) {
    parents.header(screen, 'Grown-ups', '#/');
    const list = el('div', 'p-menu');
    const items = [
      ['Recording studio', 'Record letter sounds, or use your voice for anything the app says.', '#/parents/studio'],
      ['Progress', 'See which letters ' + (ctx.settings.childName || 'your child') + ' knows.', '#/parents/progress'],
      ['Settings', 'Name, starting letters, pace, rest timer, backup and restore.', '#/parents/settings'],
    ];
    for (const [title, sub, href] of items) {
      const b = el('button', 'p-card', `<strong>${title}</strong><span>${sub}</span>`);
      b.addEventListener('click', () => ctx.go(href));
      list.appendChild(b);
    }
    screen.appendChild(list);
    const recorded = [...AA.voice.recorded].filter((id) => id.startsWith('sound-')).length;
    screen.appendChild(el('p', 'p-note', `${recorded} of 26 letter sounds recorded.`));
  }

  parents.mount = function (screen, ctx, sub) {
    screen.classList.add('parents');
    const view = sub && parents.views[sub.split('/')[0]];
    if (view) return view(screen, ctx, sub);
    menu(screen, ctx);
    return () => {};
  };

  AA.parents = parents;
})(self);
