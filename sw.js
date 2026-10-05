const CACHE_NAME = 'wolks1813-v1';

// Dateien, die für den Offline-Start gespeichert werden
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './images/paper-texture.webp',
  './images/logos/Logo1813.webp',
  './images/icons/icon-192.png',
  './images/icons/icon-512.png'
];

// Installation: Dateien in den Cache laden
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Aktivierung: Alte Caches löschen
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Abruf: Zuerst Internet probieren, wenn offline -> aus Cache laden
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});