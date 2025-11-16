// ==== ГАРАНТИРОВАННО МГНОВЕННОЕ ОБНОВЛЕНИЕ PWA ====
self.skipWaiting();
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
    );
    self.clients.claim();
});

// ==== САМЫЙ ПРОСТОЙ И НАДЁЖНЫЙ SERVICE WORKER ====
// Он просто проксирует запросы НАПРЯМУЮ в интернет.
// Никакого кеширования — значит НИКАКИХ зависших данных.

self.addEventListener("fetch", event => {
    event.respondWith(fetch(event.request));
});
