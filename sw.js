const CACHE_PREFIX = 'run-study-log-shell:' + self.registration.scope + ':';
const CACHE_NAME = CACHE_PREFIX + 'v20261128-rd4-offline';
const SHELL_ASSETS = [
  './',
  './index.html',
  './style.css',
  './desktop.css',
  './redesign.css',
  './pixel-progress.css',
  './pixel-progress.js',
  './shared/score.js',
  './app.js',
  './logo.svg'
];

async function cacheShell() {
  const indexUrl = new URL('./index.html', self.registration.scope);
  const index = await fetch(indexUrl, { cache: 'reload' });
  if (!index.ok) throw new Error('Could not load app entry page');
  const markup = await index.clone().text();
  const assets = new Set(SHELL_ASSETS);
  for (const [, href] of markup.matchAll(/(?:href|src)=["']([^"']+)["']/g)) {
    const asset = new URL(href, indexUrl);
    if (asset.search && SHELL_ASSETS.some(path => new URL(path, indexUrl).href === asset.origin + asset.pathname)) {
      assets.add(asset.href);
    }
  }
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll([...assets].map(path => new Request(new URL(path, indexUrl), { cache: 'reload' })));
  await cache.put(indexUrl, index);
  await self.skipWaiting();
}

self.addEventListener('install', event => {
  event.waitUntil(cacheShell());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
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
