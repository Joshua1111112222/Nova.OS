const CACHE_NAME = 'nova-cache-v1';
const FILES_TO_CACHE = [
  '/', // Root
  '/index.html',
  '/styles.css',
  '/main.js',
  '/manifest.json',
  '/logo.png',
  // Add files from subfolders
  '/apps/flappy-app/app.js',
  '/apps/flappy-app/app.html',
  '/apps/flappy-app/icon.png',
  '/apps/chrome-app/app.js',
  '/apps/chrome-app/app.html',
  '/apps/chrome-app/icon.png',
  '/apps/messages-app/app.js',
  '/apps/messages-app/app.html',
  '/apps/messages-app/icon.png',
  '/apps/settings-app/app.js',
  '/apps/settings-app/app.html',
  '/apps/settings-app/icon.png',
  '/apps/terminal-app/app.js',
  '/apps/terminal-app/app.html',
  '/apps/terminal-app/icon.png',
  '/src/loadSettings.js',
  '/src/loading_bar.js',
  '/src/apps.js',
  '/src/custom.js',
  '/styling.js',
  '/images/galaxy_nova.png', 
  '/images/nova.png',
  '/images/wallpaper_old.png',
  '/images/glowing_bars.jpg',
  '/images/pink_swirl.png',
  '/images/turquoise_swirl.jpg',
  // Add other files as needed
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) =>
      Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});