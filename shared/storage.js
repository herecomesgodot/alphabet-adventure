// IndexedDB storage for settings, progress and voice recordings.
// Falls back to memory (nothing saved) when IndexedDB isn't available.
(function (root) {
  'use strict';

  const DB_NAME = 'alphabet-adventure';
  let dbPromise = null;
  let usable = true;
  const memory = { kv: new Map(), recordings: new Map() };

  function req(r) {
    return new Promise((resolve, reject) => {
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
  }

  // Without IndexedDB (e.g. some browsers opening the app as a local file),
  // settings and progress still go to localStorage; recordings stay in memory.
  const local = {
    get(key) {
      try { const v = localStorage.getItem('aa-' + key); return v == null ? undefined : JSON.parse(v); } catch (e) { return undefined; }
    },
    set(key, value) {
      try { localStorage.setItem('aa-' + key, JSON.stringify(value)); } catch (e) { /* not saved */ }
    },
    del(key) {
      try { localStorage.removeItem('aa-' + key); } catch (e) { /* nothing to remove */ }
    },
  };
  for (const key of ['settings', 'progress']) {
    const v = local.get(key);
    if (v !== undefined) memory.kv.set(key, v);
  }

  function open() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve) => {
      const fail = () => { usable = false; resolve(null); };
      // On file:// pages some browsers never answer the open request at all.
      // On a real web address keep waiting: Safari can be slow on a cold start.
      const timer = location.protocol === 'file:' ? setTimeout(fail, 2000) : null;
      let r;
      try { r = indexedDB.open(DB_NAME, 1); } catch (e) { clearTimeout(timer); fail(); return; }
      r.onupgradeneeded = () => {
        r.result.createObjectStore('kv');
        r.result.createObjectStore('recordings');
      };
      r.onsuccess = () => { clearTimeout(timer); resolve(r.result); };
      r.onerror = () => { clearTimeout(timer); fail(); };
      r.onblocked = () => { clearTimeout(timer); fail(); };
    });
    return dbPromise;
  }

  async function get(store, key) {
    const db = await open();
    if (!db) return memory[store].has(key) ? memory[store].get(key) : null;
    const v = await req(db.transaction(store).objectStore(store).get(key));
    return v === undefined ? null : v;
  }

  async function put(store, key, value) {
    const db = await open();
    if (!db) {
      memory[store].set(key, value);
      if (store === 'kv') local.set(key, value);
      return;
    }
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).put(value, key);
    await new Promise((res, rej) => { tx.oncomplete = res; tx.onerror = () => rej(tx.error); tx.onabort = () => rej(tx.error); });
  }

  async function del(store, key) {
    const db = await open();
    if (!db) {
      memory[store].delete(key);
      if (store === 'kv') local.del(key);
      return;
    }
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).delete(key);
    await new Promise((res, rej) => { tx.oncomplete = res; tx.onerror = () => rej(tx.error); });
  }

  async function keys(store) {
    const db = await open();
    if (!db) return [...memory[store].keys()];
    return req(db.transaction(store).objectStore(store).getAllKeys());
  }

  const clone = (v) => (v == null ? v : JSON.parse(JSON.stringify(v)));

  const api = {
    open,
    available: () => usable,
    getSettings: () => get('kv', 'settings'),
    saveSettings: (s) => put('kv', 'settings', clone(s)),
    getProgress: () => get('kv', 'progress'),
    saveProgress: (p) => put('kv', 'progress', clone(p)),
    getRecording: (id) => get('recordings', id),
    putRecording: (id, blob) => put('recordings', id, blob),
    deleteRecording: (id) => del('recordings', id),
    listRecordingIds: () => keys('recordings'),
    async allRecordings() {
      const map = new Map();
      for (const id of await keys('recordings')) map.set(id, await get('recordings', id));
      return map;
    },
    // All or nothing: one transaction, so a failure leaves the old data in place.
    async replaceAll({ settings, progress, recordings }) {
      const db = await open();
      if (!db) {
        memory.recordings = new Map(recordings);
        await put('kv', 'settings', clone(settings));
        await put('kv', 'progress', clone(progress));
        return;
      }
      const tx = db.transaction(['kv', 'recordings'], 'readwrite');
      const recs = tx.objectStore('recordings');
      recs.clear();
      for (const [id, blob] of recordings) recs.put(blob, id);
      tx.objectStore('kv').put(clone(settings), 'settings');
      tx.objectStore('kv').put(clone(progress), 'progress');
      await new Promise((res, rej) => { tx.oncomplete = res; tx.onerror = () => rej(tx.error); tx.onabort = () => rej(tx.error); });
    },
    async persist() {
      try { return navigator.storage && navigator.storage.persist ? await navigator.storage.persist() : false; } catch (e) { return false; }
    },
  };

  (root.AA = root.AA || {}).storage = api;
})(self);
