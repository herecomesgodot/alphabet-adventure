// The buddy character. States are CSS classes: idle, talk, cheer, yawn, wave, sleep.
(function (root) {
  'use strict';
  const AA = root.AA;
  const STATES = ['idle', 'talk', 'cheer', 'yawn', 'wave', 'sleep'];

  AA.buddy = {
    mount(el) {
      const wrap = document.createElement('div');
      wrap.className = 'buddy buddy-idle';
      wrap.innerHTML = AA.art.buddy();
      el.appendChild(wrap);
      let timer = null;
      const api = {
        el: wrap,
        set(state, ms) {
          clearTimeout(timer);
          for (const s of STATES) wrap.classList.remove('buddy-' + s);
          wrap.classList.add('buddy-' + (STATES.includes(state) ? state : 'idle'));
          if (ms) timer = setTimeout(() => api.set('idle'), ms);
        },
        // Speak while showing the talking beak.
        async say(parts) {
          api.set('talk');
          await AA.voice.say(parts);
          if (wrap.classList.contains('buddy-talk')) api.set('idle');
        },
      };
      return api;
    },
  };
})(self);
