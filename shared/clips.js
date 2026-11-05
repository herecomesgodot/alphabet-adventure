// Every spoken clip, its device-voice fallback text, and how prompts are built from them.
(function (root) {
  'use strict';
  const D = root.AA && root.AA.data ? root.AA.data : require('./data.js');

  const CATALOGUE = {};
  for (const L of D.LETTERS) {
    CATALOGUE['sound-' + L] = { text: L, group: 'sound' };
    CATALOGUE['name-' + L] = { text: L, group: 'name' };
  }
  const add = (group, entries) => {
    for (const [id, text] of entries) CATALOGUE[id] = { text, group };
  };
  add('child', [['child-name', '']]);
  add('instruction', [
    ['pop-the', 'Pop the'], ['where-is', "Where's"], ['can-you-find', 'Can you find'],
    ['trace-the', "Let's trace"], ['thats', "That's"], ['like', 'like'],
  ]);
  add('praise', [
    ['praise-1', 'You did it!'], ['praise-2', 'Great job!'], ['praise-3', 'Wow!'], ['praise-4', 'Yes!'],
    ['praise-5', 'Super!'], ['praise-6', 'You found it!'], ['praise-7', 'Hooray!'], ['praise-8', 'Amazing!'],
  ]);
  add('other', [
    ['hi', 'Hi'], ['goodbye', 'Bye bye! See you soon'], ['rest', 'Time to rest. Night night!'],
    ['sticker-new', 'A new sticker!'],
  ]);

  const part = (id) => ({ id, text: CATALOGUE[id].text });

  function letterPart(L, recorded) {
    return part(recorded.has('sound-' + L) ? 'sound-' + L : 'name-' + L);
  }

  const LEAD = { pop: 'pop-the', where: 'where-is', find: 'can-you-find', trace: 'trace-the' };

  function compose(kind, letter, recorded) {
    if (kind === 'greet') return [part('hi'), part('child-name')];
    if (kind === 'thats') return [part('thats'), part('name-' + letter)];
    if (kind === 'sound') return [letterPart(letter, recorded)];
    return [part(LEAD[kind]), letterPart(letter, recorded)];
  }

  const PRAISE_IDS = Object.keys(CATALOGUE).filter((id) => CATALOGUE[id].group === 'praise');

  const api = { CATALOGUE, PRAISE_IDS, compose, part };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else (root.AA = root.AA || {}).clips = api;
})(typeof self !== 'undefined' ? self : globalThis);
