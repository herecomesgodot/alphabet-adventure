// Letter data shared by every part of the app.
(function (root) {
  'use strict';

  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  // Clear, stretchable sounds first; confusable pairs spread apart.
  const DEFAULT_ORDER = 'SATPINMDGOCKEURHBFLJVWXYZQ'.split('');

  const CONFUSABLE = [
    ['M', 'W'], ['E', 'F'], ['P', 'R'], ['O', 'Q'], ['C', 'G'],
    ['I', 'L'], ['U', 'V'], ['N', 'Z'], ['B', 'D'],
  ];

  function isConfusable(a, b) {
    return CONFUSABLE.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
  }

  const WORD_LIST = {
    A: 'Apple', B: 'Bear', C: 'Cat', D: 'Dog', E: 'Egg', F: 'Fish', G: 'Goat',
    H: 'Hat', I: 'Igloo', J: 'Jam', K: 'Kite', L: 'Lion', M: 'Moon', N: 'Nest',
    O: 'Octopus', P: 'Pig', Q: 'Queen', R: 'Rainbow', S: 'Sun', T: 'Turtle',
    U: 'Umbrella', V: 'Van', W: 'Whale', X: 'Fox', Y: 'Yo-yo', Z: 'Zebra',
  };

  const WORDS = {};
  for (const L of LETTERS) {
    const word = WORD_LIST[L];
    WORDS[L] = { word, soundHint: L === 'X' ? 'like fo-ks' : 'like ' + word.toLowerCase() };
  }

  const api = { LETTERS, DEFAULT_ORDER, CONFUSABLE, WORDS, isConfusable };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else (root.AA = root.AA || {}).data = api;
})(typeof self !== 'undefined' ? self : globalThis);
