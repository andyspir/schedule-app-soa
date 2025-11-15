const CACHE_NAME = "schedule-cache-v1";
const URLS_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
];

// Установка Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Активация
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Перехват запросов
self.addEventListener("fetch", (event) => {
  const url = event.request.url;

  // ❗ Игнорируем служебные URL браузера и расширений
  if (
    url.startsWith("chrome-extension://") ||
    url.startsWith("chrome://") ||
    url.startsWith("devtools://")
  ) {
    return; // ничего не делаем
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).then((response) => {
          // Кэшируем ТОЛЬКО безопасные нормальные URL
          if (
            event.request.method === "GET" &&
            response.status === 200 &&
            response.type === "basic"
          ) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
      );
    })
  );
});

// Получение команды SKIP_WAITING
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
