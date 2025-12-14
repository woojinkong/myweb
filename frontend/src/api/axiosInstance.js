import axios from "axios";
import Cookies from "js-cookie";
import { getViewKey } from "./viewKey";


const axiosInstance = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

// 🔥 GET 전용 공개 API 리스트 (로그인 없어도 됨)
const PUBLIC_GET_PREFIX = [
  "/board/search",
  // "/board",
  // "/board/",
  // "/board-group",
  // "/board-group/",
  "/comments",      // 댓글 조회(GET)만 공개
  "/site/name",
  "/user/check-nickName",
];

// 🔄 Refresh 전용 axios
const refreshAxios = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

/* ============================================================
   ✅ 요청 인터셉터
   - GET + PUBLIC_GET_PREFIX → 토큰 제거
   - 그 외 요청(POST/PUT/DELETE) → 토큰 자동 첨부
============================================================ */
axiosInstance.interceptors.request.use((config) => {
  const cleanUrl = config.url.split("?")[0];
  const method = config.method.toUpperCase();

  

    // ⭐ 관리자 API는 항상 토큰 유지 (맨 위에 있어야 함!)
  if (cleanUrl.startsWith("/admin")) {
    const token = Cookies.get("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  }

    // 🔥 GET /board/** 요청이면 viewKey 추가
  if (method === "GET" && cleanUrl.startsWith("/board/")) {
    config.headers["X-View-Key"] = getViewKey();
  }

  // 🎯 GET이고 공개 API면 토큰 제거 (비로그인 허용)
  // 🎯 GET이고 공개 API면 토큰 제거
  if (
    method === "GET" &&
    PUBLIC_GET_PREFIX.some((prefix) => cleanUrl.startsWith(prefix))
  ) {
    // ❌ 무조건 제거 X
    const token = Cookies.get("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }


  // 🎯 나머지는 토큰 자동 첨부
  const token = Cookies.get("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* ============================================================
   ✅ 응답 인터셉터
   - GET + PUBLIC_GET → refresh 시도 X
   - POST/PUT/DELETE → refresh 시도 O
============================================================ */
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const cleanUrl = originalRequest.url.split("?")[0];
    const method = originalRequest.method.toUpperCase();
    // 🎯 403 (IP 차단 등)
    //if (error.response?.status === 403) {
     // alert("현재 사이트를 이용 할 수 없습니다.");
     // return Promise.reject(error);
   // }
    

    // 🎯 GET + 공개 API → refresh 금지
    if (
      method === "GET" &&
      PUBLIC_GET_PREFIX.some((prefix) => cleanUrl.startsWith(prefix))
    ) {
      return Promise.reject(error);
    }

    // 🎯 401 → refresh 시도
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const res = await refreshAxios.post("/auth/refresh", {});
        const newAccessToken = res.data.accessToken;

        if (newAccessToken) {
          Cookies.set("accessToken", newAccessToken, {
            sameSite: "Lax",
            expires: 1,
          });

          // 재요청에 새 토큰 넣기
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (err) {
        // refresh 실패 → 로그인 페이지로 이동
        console.log("err",err);
        Cookies.remove("accessToken");
        if (!window.location.pathname.startsWith("/login")) {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
