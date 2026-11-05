// Offline support: keeps a copy of every app file on the device.
// Bump CACHE on every release so devices pick up the new files.
const CACHE = 'aa-v1';
const FILES = [
  './',
  'index.html',
  'manifest.json',
  'icons/icon-180.png',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'shared/ui.css',
  'games/island/island.css',
  'games/bubble-pop/bubble-pop.css',
  'games/peekaboo/peekaboo.css',
  'games/trace/trace.css',
  'games/stickers/stickers.css',
  'parents/parents.css',
  'shared/data.js',
  'shared/strokes.js',
  'shared/engine.js',
  'shared/round.js',
  'shared/trace-match.js',
  'shared/clips.js',
  'shared/backup.js',
  'shared/storage.js',
  'shared/voice.js',
  'shared/art.js',
  'shared/stickers-art.js',
  'shared/buddy.js',
  'shared/celebrate.js',
  'games/island/island.js',
  'games/bubble-pop/bubble-pop.js',
  'games/peekaboo/peekaboo.js',
  'games/trace/trace.js',
  'games/stickers/stickers.js',
  'parents/parents.js',
  'parents/setup.js',
  'parents/studio.js',
  'parents/progress-view.js',
  'parents/settings.js',
  'shared/app.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(FILES.map((f) => new Request(f, { cache: 'reload' }))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Fresh files when online (so updates arrive on their own), the saved copy when
// offline or when the network is too slow to wait for.
const NETWORK_WAIT_MS = 3000;

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req, { ignoreSearch: true })
      || (req.mode === 'navigate' ? await cache.match('index.html') : undefined);
    const network = fetch(req).then((res) => {
      if (res.ok) cache.put(req, res.clone());
      return res;
    });
    if (!cached) return network.catch(() => Response.error());
    const slow = new Promise((resolve) => setTimeout(() => resolve(cached), NETWORK_WAIT_MS));
    event.waitUntil(network.catch(() => {}));
    return Promise.race([network.catch(() => cached), slow]);
  })());
});
