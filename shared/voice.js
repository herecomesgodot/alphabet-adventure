// Speaking: plays the parent's recording for a clip if there is one,
// otherwise the device voice. Letter parts are spoken on their own so the
// device voice reads "A" as the letter, not the word "a".
(function (root) {
  'use strict';
  const AA = root.AA;

  let audioCtx = null;
  let voice = null;
  let noVoices = false;
  let childName = '';
  let token = 0;
  let current = null;
  const buffers = new Map();
  const mutedListeners = [];
  const api = { recorded: new Set() };

  function notifyMuted(isMuted) {
    for (const cb of mutedListeners) cb(isMuted);
  }

  function chooseVoice() {
    const all = speechSynthesis.getVoices();
    if (!all.length) return null;
    const en = all.filter((v) => /^en[-_]/i.test(v.lang));
    const us = en.filter((v) => /US/i.test(v.lang));
    const preferred = ['Samantha', 'Google US English', 'Microsoft Aria', 'Microsoft Jenny', 'Karen', 'Moira'];
    for (const name of preferred) {
      const v = en.find((x) => x.name.includes(name));
      if (v) return v;
    }
    return us[0] || en[0] || all[0];
  }

  function initVoices() {
    if (!('speechSynthesis' in root)) { noVoices = true; return; }
    voice = chooseVoice();
    speechSynthesis.onvoiceschanged = () => { voice = chooseVoice(); noVoices = !voice; };
    setTimeout(() => { if (!speechSynthesis.getVoices().length) noVoices = true; }, 1000);
  }

  api.unlock = function () {
    try {
      const Ctx = root.AudioContext || root.webkitAudioContext;
      if (Ctx && !audioCtx) audioCtx = new Ctx();
      if (audioCtx && audioCtx.state !== 'running') audioCtx.resume();
      // A silent buffer finishes iOS's unlock.
      if (audioCtx) {
        const src = audioCtx.createBufferSource();
        src.buffer = audioCtx.createBuffer(1, 1, 22050);
        src.connect(audioCtx.destination);
        src.start(0);
      }
      if ('speechSynthesis' in root) {
        const u = new SpeechSynthesisUtterance(' ');
        u.volume = 0;
        speechSynthesis.speak(u);
      }
      setTimeout(() => notifyMuted(!!audioCtx && audioCtx.state !== 'running'), 600);
    } catch (e) {
      notifyMuted(true);
    }
  };

  api.setChildName = (n) => { childName = n || ''; };
  api.onMuted = (cb) => mutedListeners.push(cb);

  api.refreshRecorded = async function () {
    api.recorded = new Set(await AA.storage.listRecordingIds());
    buffers.clear();
    return api.recorded;
  };

  async function bufferFor(id) {
    if (buffers.has(id)) return buffers.get(id);
    const blob = await AA.storage.getRecording(id);
    if (!blob || !audioCtx) return null;
    const buf = await audioCtx.decodeAudioData(await blob.arrayBuffer());
    buffers.set(id, buf);
    return buf;
  }

  function playBuffer(buf, my) {
    return new Promise((resolve) => {
      if (my !== token) return resolve();
      const src = audioCtx.createBufferSource();
      src.buffer = buf;
      src.connect(audioCtx.destination);
      src.onended = resolve;
      // If iOS interrupts audio (a call, Siri), onended may never fire.
      setTimeout(resolve, buf.duration * 1000 + 1500);
      current = { stop: () => { try { src.stop(); } catch (e) { /* already stopped */ } resolve(); } };
      src.start(0);
      notifyMuted(audioCtx.state !== 'running');
    });
  }

  function speak(text, my) {
    return new Promise((resolve) => {
      if (my !== token || !text) return resolve();
      if (noVoices || !('speechSynthesis' in root)) return chime(my).then(resolve);
      const u = new SpeechSynthesisUtterance(text);
      if (voice) u.voice = voice;
      u.lang = voice ? voice.lang : 'en-US';
      u.rate = 0.85;
      u.pitch = 1.1;
      let done = false;
      const finish = () => { if (!done) { done = true; resolve(); } };
      u.onend = finish;
      u.onerror = finish;
      // iOS sometimes never fires onend; don't let the game wait forever.
      setTimeout(finish, 1200 + text.length * 110);
      current = { stop: () => { speechSynthesis.cancel(); finish(); } };
      speechSynthesis.speak(u);
    });
  }

  function chime(my) {
    return new Promise((resolve) => {
      if (!audioCtx || my !== token) return resolve();
      const t = audioCtx.currentTime;
      [660, 880].forEach((f, i) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t + i * 0.15);
        g.gain.exponentialRampToValueAtTime(0.2, t + i * 0.15 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.15 + 0.3);
        o.connect(g).connect(audioCtx.destination);
        o.start(t + i * 0.15);
        o.stop(t + i * 0.15 + 0.32);
      });
      setTimeout(resolve, 500);
    });
  }

  api.stop = function () {
    token++;
    if (current) current.stop();
    current = null;
    if ('speechSynthesis' in root) speechSynthesis.cancel();
  };

  // parts: [{id, text}] from AA.clips. Consecutive unrecorded non-letter parts are joined.
  function wake() {
    if (audioCtx && audioCtx.state !== 'running') audioCtx.resume().catch(() => {});
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) wake(); });

  api.say = async function (parts) {
    api.stop();
    wake();
    const my = ++token;
    const isLetter = (id) => /^(name|sound)-/.test(id);
    let pending = [];
    const flush = async () => {
      if (pending.length) { const t = pending.join(' '); pending = []; await speak(t, my); }
    };
    for (const p of parts) {
      if (my !== token) return;
      const text = p.id === 'child-name' ? childName : p.text;
      if (api.recorded.has(p.id)) {
        await flush();
        let buf = null;
        try { buf = await bufferFor(p.id); } catch (e) { buf = null; }
        if (buf) await playBuffer(buf, my);
        else await speak(text, my);
      } else if (isLetter(p.id)) {
        await flush();
        await speak(text, my);
      } else {
        pending.push(text);
      }
    }
    await flush();
  };

  // Plays a blob directly (recording studio playback).
  api.playBlob = async function (blob) {
    api.stop();
    const my = ++token;
    if (!audioCtx) api.unlock();
    wake();
    const buf = await audioCtx.decodeAudioData(await blob.arrayBuffer());
    await playBuffer(buf, my);
  };

  api.chime = () => { api.stop(); return chime(++token); };

  initVoices();
  AA.voice = api;
})(self);
