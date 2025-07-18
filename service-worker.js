// Existing code for caching...
const CACHE_NAME = 'nova-cache-v1';
const FILES_TO_CACHE = [
  '/', // Root
  '/index.html',
  '/styles.css',
  '/main.js',
  '/manifest.json',
  '/logo.png',
  // Cache all app files
  '/apps/calculator-app/app.js',
  '/apps/calculator-app/custom.js',
  '/apps/object-detector-app/app.js',
  '/apps/object-detector-app/styles.css',
  '/apps/object-detector-app/icon.png',
  '/apps/perceptra-app/app.js',
  '/apps/perceptra-app/icon.png',
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

// Push Notification Logic
self.addEventListener("push", (event) => {
  const data = event.data.json();
  const title = data.title || "Messages App";
  const options = {
    body: data.body || "You have a new message!",
    icon: "./apps/messages-app/icon.png", // Path to your app icon
    badge: "./apps/messages-app/icon.png", // Path to badge icon
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow("./apps/messages-app/") // Redirect to your app
  );
});