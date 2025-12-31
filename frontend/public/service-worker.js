const CACHE_NAME = "konghome-static-v2";
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
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// fetch
self.addEventListener("fetch", (event) => {
  // ✅ 페이지 이동은 절대 SW 개입 안 함
  if (event.request.mode === "navigate") {
    return;
  }

  const url = event.request.url;

  // API / 업로드 / 광고 / index.html 제외
  if (
    url.includes("/api/") ||
    url.includes("/uploads/") ||
    url.includes("adsbygoogle.js") ||
    url.endsWith("/index.html")
  ) {
    return;
  }

  // 정적 리소스만 캐시
  event.respondWith(
    caches.match(event.request).then(
      (cached) => cached || fetch(event.request)
    )
  );
});
