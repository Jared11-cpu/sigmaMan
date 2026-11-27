const CACHE_PREFIX = 'run-study-log-shell:' + self.registration.scope + ':';
const CACHE_NAME = CACHE_PREFIX + 'v20261128-mobile-ab';
const SHELL_ASSETS = [
  './',
  './index.html',
  './style.css',
  './desktop.css',
  './pixel-progress.css',
  './pixel-progress.js',
  './shared/score.js',
  './app.js',
  './logo.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL_ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith(CACHE_PREFIX) && k !== CACHE_NAME).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/uploads/')) return;
  event.respondWith(
    fetch(req).then(res => {
      if (res && res.ok && url.origin === self.location.origin) {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, clone)).catch(() => {});
      }
      return res;
    }).catch(async () => {
      const cache = await caches.open(CACHE_NAME);
      return (await cache.match(req)) || (req.mode === 'navigate' && await cache.match('./index.html')) || Response.error();
    })
  );
});
