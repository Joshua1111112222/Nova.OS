const CACHE_NAME = 'nova-cache-v1';
const FILES_TO_CACHE = [
  '/', // Root
  '/index.html',
  '/styles.css',
  '/main.js',
  '/manifest.json',
  '/logo.png',
  // Cache all app files
  '/apps/flappy-app/app.js',
  '/apps/flappy-app/styles.css',
  '/apps/flappy-app/icon.png',
  '/apps/chrome-app/app.js',
  '/apps/chrome-app/styles.css',
  '/apps/chrome-app/icon.png',
  '/apps/messages-app/app.js',
  '/apps/messages-app/styles.css',
  '/apps/messages-app/icon.png',
  '/apps/settings-app/app.js',
  '/apps/settings-app/styles.css',
  '/apps/settings-app/icon.png',
  '/apps/terminal-app/app.js',
  '/apps/terminal-app/styles.css',
  '/apps/terminal-app/icon.png',
  // Cache all images
  '/images/galaxy_nova.png',
  '/images/nova.png',
  '/images/wallpaper_old.png',
  '/images/glowing_bars.jpg',
  '/images/pink_swirl.png',
  '/images/turquoise_swirl.jpg',
  // Cache src files
  '/src/loadSettings.js',
  '/src/loading_bar.js',
  '/src/apps.js',
  '/src/custom.js',
  '/styling.js',
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
  // Do NOT delete old caches, keep everything indefinitely
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
