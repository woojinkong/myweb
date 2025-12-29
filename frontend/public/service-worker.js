const CACHE_NAME = "konghome-static-v1";
const STATIC_FILES = [
  "/manifest.json"
];

// install
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_FILES))
  );
  self.skipWaiting();
});

// activate
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

// fetch
self.addEventListener("fetch", (event) => {
  const url = event.request.url;

  // 절대 개입 금지 목록
  if (
    url.includes("/api/") ||
    url.includes("/uploads/") ||
    url.includes("adsbygoogle.js") ||
    url.endsWith("/index.html") ||
    event.request.mode === "navigate"
  ) {
    return; // 네트워크 직접 요청
  }

  // 그 외 정적 파일만 캐시
  event.respondWith(
    caches.match(event.request).then(
      (cached) => cached || fetch(event.request)
    )
  );
});
