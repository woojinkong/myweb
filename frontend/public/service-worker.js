// ✔ 정리용 Service Worker
// 목적: 기존 SW + 캐시 완전 제거
// fetch 이벤트 절대 없음

self.addEventListener("install", () => {
  // 즉시 활성화
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    // 모든 Cache Storage 삭제
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => caches.delete(key)))
    ).then(() => {
      // 기존 SW 컨트롤 해제
      return self.clients.claim();
    })
  );
});
