// App shell: loads saved data, shows the tap-to-play gate, routes between
// the island, the games and the parents' area, and owns the shared context.
(function (root) {
  'use strict';
  const AA = root.AA;
  AA.games = AA.games || {};

  const DEFAULT_SETTINGS = {
    childName: '', firstLetters: [], pace: 'normal', restMinutes: 0, resting: false, setupDone: false,
  };

  const app = {};
  let stage, chrome, current = null, started = false;

  function deviceKind() {
    return Math.min(innerWidth, innerHeight) < 500 ? 'phone' : 'tablet';
  }

  const ctx = {
    settings: null,
    progress: null,
    order: [],
    device: deviceKind(),
    pace() { return AA.engine.PACE[ctx.settings.pace] || AA.engine.PACE.normal; },
    today() { return AA.engine.today(); },
    refreshOrder() {
      ctx.order = AA.engine.letterOrder(ctx.settings.childName, ctx.settings.firstLetters);
      AA.voice.setChildName(ctx.settings.childName);
    },
    async save() {
      await AA.storage.saveProgress(ctx.progress);
    },
    async saveSettings() {
      ctx.refreshOrder();
      await AA.storage.saveSettings(ctx.settings);
    },
    parts(kind, letter) {
      return AA.clips.compose(kind, letter, AA.voice.recorded);
    },
    go(hash) {
      if (location.hash === hash) route();
      else location.hash = hash;
    },
  };
  app.ctx = ctx;

  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  app.el = el;

  // ---- Routing -----------------------------------------------------------

  function parseHash() {
    const h = (location.hash || '#/').replace(/^#\/?/, '');
    const [first, ...rest] = h.split('/');
    return { id: first || 'island', sub: rest.join('/') };
  }

  function unmount() {
    AA.voice.stop();
    if (current && current.unmount) {
      try { current.unmount(); } catch (e) { console.error(e); }
    }
    current = null;
    stage.innerHTML = '';
  }

  function route() {
    if (!started) return;
    if (ctx.settings.resting && app.showSleeping) { app.showSleeping(); return; }
    unmount();
    const { id, sub } = parseHash();
    const screen = el('div', 'screen');
    stage.appendChild(screen);
    let module;
    if (id === 'parents') module = AA.parents;
    else module = AA.games[id];
    chrome.classList.toggle('show-home', id !== 'island' && id !== 'parents');
    document.body.dataset.route = id;
    if (!module) {
      if (id !== 'island') { ctx.go('#/'); return; }
      const b = AA.buddy.mount(screen);
      b.set('wave');
      current = null;
      return;
    }
    const unmountFn = module.mount(screen, ctx, sub);
    current = { unmount: unmountFn };
  }
  app.route = route;

  // ---- Chrome (Home button, muted icon) ---------------------------------

  function buildChrome() {
    chrome = el('div', 'chrome');
    const home = el('button', 'chrome-home round-btn', AA.art.homeIcon());
    home.setAttribute('aria-label', 'Home');
    home.addEventListener('click', () => ctx.go('#/'));
    const muted = el('button', 'chrome-muted round-btn', AA.art.mutedIcon());
    muted.setAttribute('aria-label', 'Sound is off');
    muted.addEventListener('click', () => { AA.voice.unlock(); muted.classList.remove('show'); });
    AA.voice.onMuted((isMuted) => muted.classList.toggle('show', isMuted));
    chrome.append(home, muted);
    document.body.appendChild(chrome);
  }

  // ---- Tap-to-play gate --------------------------------------------------

  function showGate() {
    const gate = el('div', 'gate');
    const buddy = AA.buddy.mount(gate);
    buddy.set('wave');
    const play = el('button', 'gate-play', AA.art.playIcon());
    play.setAttribute('aria-label', 'Play');
    gate.appendChild(play);
    document.body.appendChild(gate);
    const go = () => {
      gate.removeEventListener('pointerup', go);
      AA.voice.unlock();
      AA.storage.persist();
      gate.remove();
      started = true;
      // Always start on the island, so a reload never skips the grown-ups' hold.
      ctx.go(ctx.settings.setupDone ? '#/' : '#/parents/setup');
    };
    gate.addEventListener('pointerup', go);
  }
  app.showGate = showGate;

  // ---- Shared game helpers -----------------------------------------------

  // A new round for the pick games, wired to this child's settings.
  app.newRound = function () {
    return AA.round.createRound({
      progress: ctx.progress, order: ctx.order, device: ctx.device, pace: ctx.pace(), today: ctx.today(),
    });
  };

  // Saves after a pick so nothing is lost if the app is closed mid-round.
  // A failed save never stops the game; progress stays in memory and is saved next time.
  async function safeSave() {
    try { await ctx.save(); } catch (e) { console.error('save failed', e); }
  }

  app.saveIfDirty = async function (round) {
    if (!round.dirty) return;
    round.dirty = false;
    await safeSave();
  };

  // Ends a round: star, save, a fanfare for each new sticker, then home.
  // If the child already left the game, only the save happens.
  app.endRound = async function (screen, newStickers) {
    await safeSave();
    for (const L of newStickers) {
      if (!screen.isConnected) return;
      await stickerFanfare(screen, L);
    }
    if (screen.isConnected) ctx.go('#/');
  };

  app.finishRound = async function (screen, round) {
    const { newStickers } = round.finish();
    await app.endRound(screen, newStickers);
  };

  function stickerFanfare(screen, L) {
    return new Promise((resolve) => {
      const o = el('div', 'fanfare');
      const card = el('div', 'fanfare-card');
      card.innerHTML = AA.art.sticker ? AA.art.sticker(L) : AA.art.letter(L);
      const badge = el('div', 'fanfare-letter', AA.art.letter(L, { color: '#fff', width: 14 }));
      card.appendChild(badge);
      o.appendChild(card);
      screen.appendChild(o);
      AA.celebrate(o, { speak: false });
      let done = false;
      const finish = () => { if (done) return; done = true; o.remove(); resolve(); };
      AA.voice.say([AA.clips.part('sticker-new')].concat(ctx.parts('sound', L)))
        .then(() => setTimeout(finish, 1200));
      setTimeout(() => o.addEventListener('pointerup', finish), 800);
      setTimeout(finish, 9000);
    });
  }

  // ---- Press-and-hold (keeps grown-up controls away from little fingers) --

  // Opens on release after a full hold: a finger lifting counts as a real tap
  // on iPhone/iPad, so sound can be switched on in onOpen.
  app.holdToOpen = function (target, ms, onOpen) {
    let timer = null;
    let armed = false;
    const start = (e) => {
      e.preventDefault();
      armed = false;
      target.classList.add('holding');
      timer = setTimeout(() => { armed = true; target.classList.add('armed'); }, ms);
    };
    const cancel = () => {
      clearTimeout(timer);
      timer = null;
      armed = false;
      target.classList.remove('holding', 'armed');
    };
    const release = (e) => {
      const open = armed;
      cancel();
      if (open) {
        e.preventDefault();
        // Swallow the click the browser makes from this same release.
        const swallow = (ev) => { ev.stopPropagation(); ev.preventDefault(); };
        document.addEventListener('click', swallow, true);
        setTimeout(() => document.removeEventListener('click', swallow, true), 400);
        onOpen();
      }
    };
    target.addEventListener('pointerdown', start);
    target.addEventListener('pointerup', release);
    for (const ev of ['pointerleave', 'pointercancel']) target.addEventListener(ev, cancel);
    target.addEventListener('contextmenu', (e) => e.preventDefault());
    return cancel;
  };

  // ---- Rest timer and sleeping screen -------------------------------------

  let playSeconds = 0;
  app._restMs = null; // test hook: overrides restMinutes when set

  function tickRest() {
    if (!started || document.hidden || ctx.settings.resting) return;
    if (parseHash().id === 'parents') return;
    playSeconds += 1;
    const limitMs = app._restMs || ctx.settings.restMinutes * 60000;
    if (limitMs && playSeconds * 1000 >= limitMs) goToRest();
  }

  async function goToRest() {
    ctx.settings.resting = true;
    await AA.storage.saveSettings(ctx.settings);
    unmount();
    app.showSleeping(true);
  }

  app.showSleeping = function (sayGoodnight) {
    if (document.querySelector('.sleeping')) return;
    unmount();
    const s = el('div', 'sleeping');
    s.appendChild(el('div', 'moon'));
    const buddy = AA.buddy.mount(s);
    buddy.set(sayGoodnight ? 'yawn' : 'sleep');
    if (sayGoodnight) {
      buddy.say([AA.clips.part('rest')]).then(() => buddy.set('sleep'));
    }
    s.appendChild(el('div', 'zzz', 'z z z'));
    const gear = el('button', 'island-gear', AA.art.gear());
    gear.setAttribute('aria-label', 'Grown-ups: press and hold to wake');
    s.appendChild(gear);
    app.holdToOpen(gear, 3000, async () => {
      AA.voice.unlock();
      ctx.settings.resting = false;
      playSeconds = 0;
      s.remove();
      try { await AA.storage.saveSettings(ctx.settings); } catch (e) { console.error(e); }
      // Back to the tap-to-play screen, so the child's own tap starts the sound.
      started = false;
      showGate();
    });
    document.body.appendChild(s);
  };

  // ---- Boot --------------------------------------------------------------

  async function boot() {
    stage = el('div', 'stage');
    document.body.appendChild(stage);
    buildChrome();
    let saved = null, progress = null;
    try {
      await AA.storage.open();
      saved = await AA.storage.getSettings();
      progress = await AA.storage.getProgress();
      await AA.voice.refreshRecorded();
    } catch (e) {
      console.error('storage unavailable', e);
    }
    ctx.settings = Object.assign({}, DEFAULT_SETTINGS, saved || {});
    ctx.progress = progress && progress.letters ? progress : AA.engine.createProgress();
    try {
      ctx.refreshOrder();
      AA.engine.activeLetters(ctx.progress, ctx.order);
    } catch (e) {
      console.error('saved data unusable, starting fresh this session', e);
      ctx.settings.firstLetters = [];
      ctx.progress = AA.engine.createProgress();
      ctx.refreshOrder();
    }
    addEventListener('hashchange', route);
    addEventListener('resize', () => { ctx.device = deviceKind(); });
    setInterval(tickRest, 1000);
    if (ctx.settings.resting && app.showSleeping) { started = true; app.showSleeping(); }
    else showGate();
  }

  app.boot = boot;
  AA.app = app;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(self);
