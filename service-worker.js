const CACHE_NAME = "schedule-soa-v1";

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./service-worker.js",
  "./icons/app_icon_192.png",
  "./icons/app_icon_512.png"
];

// Установка SW
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Активация
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => k !== CACHE_NAME && caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Обработка запросов
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // НЕ кэшируем запросы к Google Sheets
  if (url.hostname.includes("googleusercontent.com") ||
      url.hostname.includes("docs.google.com")) {
    return; // прямой fetch без SW
  }

  event.respondWith(
    caches.match(event.request).then(
      (cached) =>
        cached ||
        fetch(event.request).catch(() => cached)
    )
  );
});

// Обновление
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
