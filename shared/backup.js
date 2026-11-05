// Backup file format: settings, progress and recordings in one JSON file.
(function (root) {
  'use strict';

  const APP = 'alphabet-adventure';
  const VERSION = 1;

  class BackupError extends Error {
    constructor(reason) {
      super('Backup ' + reason);
      this.reason = reason; // 'not-ours' | 'damaged' | 'newer'
    }
  }

  async function blobToBase64(blob) {
    const bytes = new Uint8Array(await blob.arrayBuffer());
    let bin = '';
    for (let i = 0; i < bytes.length; i += 0x8000) {
      bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    }
    return btoa(bin);
  }

  function base64ToBlob(data, type) {
    const bin = atob(data);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new Blob([bytes], { type });
  }

  async function serialize({ settings, progress, recordings }) {
    const recs = {};
    for (const [id, blob] of recordings) recs[id] = { type: blob.type, data: await blobToBase64(blob) };
    return JSON.stringify({ app: APP, version: VERSION, created: new Date().toISOString(), settings, progress, recordings: recs });
  }

  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const isLetter = (x) => typeof x === 'string' && x.length === 1 && x >= 'A' && x <= 'Z';
  const isNum = (x) => typeof x === 'number' && isFinite(x) && x >= 0;

  // Rejects progress the app can't run with; tidies what's harmless.
  function cleanProgress(p) {
    if (!p || typeof p !== 'object' || !p.letters || typeof p.letters !== 'object') throw new BackupError('damaged');
    const letters = {};
    for (const L of LETTERS) {
      const s = p.letters[L];
      if (!s || !isNum(s.correct) || !Array.isArray(s.days) || !s.days.every((d) => typeof d === 'string')
        || !(s.mastered === null || typeof s.mastered === 'string')) throw new BackupError('damaged');
      letters[L] = { correct: s.correct, days: s.days.slice(), mastered: s.mastered };
    }
    if (!Array.isArray(p.stickers) || !isNum(p.stars)) throw new BackupError('damaged');
    const keep = (list) => (Array.isArray(list) ? list.filter(isLetter) : []);
    return { letters, stars: p.stars, stickers: keep(p.stickers), newStickers: keep(p.newStickers) };
  }

  function cleanSettings(s) {
    if (!s || typeof s !== 'object' || Array.isArray(s)) throw new BackupError('damaged');
    const out = Object.assign({}, s);
    if ('firstLetters' in s) {
      const first = [];
      for (const x of Array.isArray(s.firstLetters) ? s.firstLetters : []) {
        const L = typeof x === 'string' ? x.toUpperCase() : '';
        if (isLetter(L) && !first.includes(L)) first.push(L);
      }
      out.firstLetters = first;
    }
    if (typeof s.childName !== 'string') out.childName = '';
    return out;
  }

  async function parse(text) {
    let obj;
    try { obj = JSON.parse(text); } catch (e) { throw new BackupError('damaged'); }
    if (!obj || typeof obj !== 'object' || Array.isArray(obj) || obj.app !== APP) throw new BackupError('not-ours');
    if (typeof obj.version !== 'number' || obj.version > VERSION) throw new BackupError(obj.version > VERSION ? 'newer' : 'damaged');
    const { recordings } = obj;
    if (typeof recordings !== 'object' || !recordings) throw new BackupError('damaged');
    const settings = cleanSettings(obj.settings);
    const progress = cleanProgress(obj.progress);
    const map = new Map();
    try {
      for (const [id, r] of Object.entries(recordings)) map.set(id, base64ToBlob(r.data, r.type));
    } catch (e) {
      throw new BackupError('damaged');
    }
    const mastered = Object.values(progress.letters).filter((l) => l && l.mastered).length;
    return { settings, progress, recordings: map, summary: { name: settings.childName || '', mastered, recordings: map.size } };
  }

  const api = { serialize, parse, BackupError, VERSION };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else (root.AA = root.AA || {}).backup = api;
})(typeof self !== 'undefined' ? self : globalThis);
