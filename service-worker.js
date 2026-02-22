const CACHE_NAME = 'opera-reader-v6';

const urlsToCache = [
  '/opera-reader/',
  '/opera-reader/index.html',
  '/opera-reader/manifest.json',
  '/opera-reader/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('开始缓存...');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('缓存成功 ✅');
      })
      .catch(err => {
        console.error('缓存失败 ❌', err);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});