const CACHE_NAME = 'wolks1813-cache-v2'; // Version erhöhen bei jedem großen Update!

// Liste aller statischen Dateien, die für die PWA offline gespeichert werden
const URLS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './sw.js',
  
  // Schriften
  './fonts/Vollkorn-Regular.woff2',
  './fonts/Vollkorn-Italic.woff2',
  './fonts/FiraSans-Regular.woff2',
  './fonts/FiraSans-Medium.woff2',
  './fonts/FiraSans-Bold.woff2',
  './fonts/FiraSans-Italic.woff2',
  
  // Logos
  './images/logos/Logo1813.webp',
  './images/logos/Logoeg.webp',
  './images/logos/Logoev.webp',
  
  // Icons
  './images/icons/icon-192.png',
  './images/icons/website.webp',
  './images/icons/instagram.webp',
  './images/icons/whatsapp.webp',
  './images/icons/facebook.webp',
  './images/icons/tiktok.webp',
  './images/icons/youtube.webp',
  
  // Textur & Fallback-Bilder für Karten/Lexikon
  './images/paper-texture.webp',
  './images/fallback/bildfb.webp',
  './images/fallback/kartefb.webp'
];

// 1. Installation: Dateien in den Cache laden
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. Aktivierung: Alte Cache-Versionen automatisch löschen
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Alter Cache gelöscht:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Network-First Strategie für Dateien / API-Aufrufe passieren über index.html
self.addEventListener('fetch', (event) => {
  // Anfragen an Google Apps Script vom Service Worker ausnehmen
  // (diese werden bereits über localStorage in index.html gecacht)
  if (event.request.url.includes('script.google.com')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Bei erfolgreichem Netzabruf Cache aktualisieren
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Bei abgebrochener/fehlender Internetverbindung aus dem Cache bedienen
        return caches.match(event.request);
      })
  );
});