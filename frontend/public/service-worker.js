// 캐싱할 정적 파일 목록
const CACHE_NAME = "konghome-cache-v2";
const STATIC_FILES = [
  "/",
  "/index.html",
  "/manifest.json"
];

// Install 시 캐시 저장
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_FILES);
    })
  );
  self.skipWaiting();
});

// 활성화 시 이전 캐시 삭제
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch 이벤트 처리
self.addEventListener("fetch", (event) => {
  const url = event.request.url;

  // 1) 광고 스크립트/외부 스크립트는 건드리지 않는다
  if (url.includes("adsbygoogle.js")) {
    return; // service-worker가 개입하지 않음
  }

  // 2) API 요청은 절대 캐싱하지 않음
  if (url.includes("/api/")) {
    return; // fetch 기본 동작 사용
  }

  // 3) 업로드 이미지도 캐싱하지 않음
  if (url.includes("/uploads/")) {
    return;
  }

  // 4) 정적 파일만 캐싱 처리
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).catch(() => {
          // fetch 실패 시 index.html fallback
          return caches.match("/index.html");
        })
      );
    })
  );
});
