// === Версия SW (увеличивай при необходимости ручного обновления) ===
const SW_VERSION = 'v1';

// === Список статических файлов, которые можно кэшировать ===
// (только иконки — то, что никогда не меняется)
const STATIC_ASSETS = [
  'favicon.ico',
  'icon-192.png',
  'icon-512.png',
  'manifest.json'
];

self.addEventListener('install', event => {
  // Пропускаем стадию waiting — сразу активируемся
  self.skipWaiting();
  event.waitUntil(
    caches.open(SW_VERSION).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Удаляем старые кэши, если они есть
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== SW_VERSION)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim(); // SW начинает управлять страницей сразу
});

// Основная логика fetch
self.addEventListener('fetch', event => {
  const request = event.request;

  // === 1) НЕ кэшируем index.html и прочие страницы ===
  if (request.mode === 'navigate') {
    return event.respondWith(fetch(request));
  }

  const url = new URL(request.url);

  // === 2) НЕ кэшируем JS/CSS/HTML/Google Sheets ===
  if (
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.host.includes('docs.google.com')
  ) {
    return event.respondWith(fetch(request));
  }

  // === 3) Другие запросы делаем по стратегии cache-first ===
  event.respondWith(
    caches.match(request).then(cached => {
      return (
        cached ||
        fetch(request).then(response => {
          return caches.open(SW_VERSION).then(cache => {
            cache.put(request, response.clone());
            return response;
          });
        })
      );
    })
  );
});

// Поддержка принудительного обновления
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
