// Round controller for the pick games (Bubble Pop, Peekaboo).
(function (root) {
  'use strict';
  const E = root.AA && root.AA.engine ? root.AA.engine : require('./engine.js');

  function createRound({ progress, order, device, pace, today, rng = Math.random, length = 6 }) {
    let lastTarget = null;
    let finished = false;

    function makePrompt(index) {
      const target = E.pickTarget(progress, order, lastTarget, rng);
      lastTarget = target;
      const count = E.choiceCount(E.mastered(progress).length, device);
      const choices = E.pickChoices(target, progress, order, count, rng);
      return { target, choices, index, misses: 0, solved: false };
    }

    const round = {
      prompt: makePrompt(0),
      done: false,
      dirty: false,

      tap(letter) {
        const p = round.prompt;
        if (p.solved || round.done) return { result: 'ignored', firstTry: false, glow: false, newlyMastered: false };
        if (letter !== p.target) {
          p.misses += 1;
          return { result: 'wrong', firstTry: false, glow: p.misses >= 2, newlyMastered: false };
        }
        p.solved = true;
        const firstTry = p.misses === 0;
        let newlyMastered = false;
        if (firstTry) {
          newlyMastered = E.recordPick(progress, letter, today, pace).newlyMastered;
          round.dirty = true;
        }
        return { result: 'correct', firstTry, glow: false, newlyMastered };
      },

      next() {
        if (round.done || !round.prompt.solved) return false;
        if (round.prompt.index + 1 >= length) {
          round.done = true;
          return false;
        }
        round.prompt = makePrompt(round.prompt.index + 1);
        return true;
      },

      finish() {
        if (finished) return { newStickers: [] };
        finished = true;
        round.done = true;
        return { newStickers: E.finishRound(progress).newStickers };
      },
    };
    return round;
  }

  const api = { createRound };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else (root.AA = root.AA || {}).round = api;
})(typeof self !== 'undefined' ? self : globalThis);
