const CACHE_NAME = 'opera-reader-v8';

const urlsToCache = [
  '/opera-reader/',
  '/opera-reader/index.html',
  '/opera-reader/manifest.json',
  '/opera-reader/pdf.min.js',
  '/opera-reader/pdf.worker.min.js',
  '/opera-reader/icon-512.png',

  '/opera-reader/朝阳沟/亲家母对唱.pdf',
  '/opera-reader/朝阳沟/银环上山.pdf',
  '/opera-reader/泪洒相思地/选段1.pdf',
  '/opera-reader/泪洒相思地/选段2.pdf'
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