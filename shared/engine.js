// Learning engine: letter order, active set, mastery, prompts and choices.
// Pure logic — functions mutate the progress object they are given and return it.
(function (root) {
  'use strict';
  const D = root.AA && root.AA.data ? root.AA.data : require('./data.js');

  const PACE = { normal: { picks: 5, days: 2 }, slower: { picks: 8, days: 3 } };
  const ACTIVE_SIZE = 3;
  const REVIEW_RATE = 0.2;

  function today(date = new Date()) {
    const pad = (n) => String(n).padStart(2, '0');
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
  }

  function createProgress() {
    const letters = {};
    for (const L of D.LETTERS) letters[L] = { correct: 0, days: [], mastered: null };
    return { letters, stars: 0, stickers: [], newStickers: [] };
  }

  function nameLetters(name) {
    return (name || '')
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .toUpperCase().split('')
      .filter((c) => c >= 'A' && c <= 'Z');
  }

  function letterOrder(name, firstLetters) {
    const first = firstLetters && firstLetters.length ? firstLetters : nameLetters(name);
    const out = [];
    for (const L of first.concat(D.DEFAULT_ORDER)) if (!out.includes(L)) out.push(L);
    return out;
  }

  function mastered(progress) {
    return progress.stickers.filter((L) => progress.letters[L].mastered);
  }

  function activeLetters(progress, order) {
    return order.filter((L) => !progress.letters[L].mastered).slice(0, ACTIVE_SIZE);
  }

  function choiceCount(masteredCount, device) {
    const n = masteredCount >= 8 ? 4 : masteredCount >= 3 ? 3 : 2;
    return device === 'phone' ? Math.min(n, 3) : n;
  }

  function shuffle(list, rng) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function weightedPick(list, weightOf, rng) {
    const total = list.reduce((s, x) => s + weightOf(x), 0);
    let r = rng() * total;
    for (const x of list) {
      r -= weightOf(x);
      if (r <= 0) return x;
    }
    return list[list.length - 1];
  }

  function pickTarget(progress, order, lastTarget, rng = Math.random) {
    const notLast = (list) => (list.length > 1 ? list.filter((L) => L !== lastTarget) : list);
    const active = notLast(activeLetters(progress, order));
    const done = notLast(mastered(progress));
    if (!active.length) return done[Math.floor(rng() * done.length)];
    if (done.length && rng() < REVIEW_RATE) return done[Math.floor(rng() * done.length)];
    return weightedPick(active, (L) => 1 / (1 + progress.letters[L].correct), rng);
  }

  function pickChoices(target, progress, order, count, rng = Math.random) {
    const active = activeLetters(progress, order);
    const primary = active.concat(mastered(progress)).filter((L) => L !== target);
    const padding = order.filter((L) => L !== target && !primary.includes(L));
    const pool = shuffle(primary, rng).concat(padding);
    const strict = count <= 3;
    const chosen = [target];
    for (const L of pool) {
      if (chosen.length >= count) break;
      if (strict && chosen.some((c) => D.isConfusable(c, L))) continue;
      chosen.push(L);
    }
    return shuffle(chosen, rng);
  }

  function recordPick(progress, letter, dateStr, pace = PACE.normal) {
    const s = progress.letters[letter];
    s.correct += 1;
    if (!s.days.includes(dateStr)) s.days.push(dateStr);
    let newlyMastered = false;
    if (!s.mastered && s.correct >= pace.picks && s.days.length >= pace.days) {
      s.mastered = dateStr;
      progress.stickers.push(letter);
      progress.newStickers.push(letter);
      newlyMastered = true;
    }
    return { progress, newlyMastered };
  }

  function finishRound(progress) {
    progress.stars += 1;
    const newStickers = progress.newStickers;
    progress.newStickers = [];
    return { progress, newStickers };
  }

  const api = {
    PACE, today, createProgress, letterOrder, mastered, activeLetters,
    choiceCount, pickTarget, pickChoices, recordPick, finishRound, shuffle,
  };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else (root.AA = root.AA || {}).engine = api;
})(typeof self !== 'undefined' ? self : globalThis);
