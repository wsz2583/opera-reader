const CACHE_NAME = 'opera-reader-v4';

const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-512.png'
];

// 安装
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('缓存核心文件...');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// 激活
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

// 请求拦截
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});