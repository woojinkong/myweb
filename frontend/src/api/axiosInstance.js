import axios from "axios";
import Cookies from "js-cookie";

const axiosInstance = axios.create({
  baseURL: "http://192.168.123.107:8080/api",
  withCredentials: true,
});

// 🔥 인증이 필요 없는 공개 API 리스트
const PUBLIC_API = [
  "/auth/check-id",
  "/auth/signup",
  "/auth/send-email-code",
  "/auth/verify-email-code",
  "/auth/login",
  "/auth/refresh",

   // ⭐ 비로그인 허용 API
  "/board-group",
  "/board",
  "/comments",

];

// refresh 전용
const refreshAxios = axios.create({
  baseURL: "http://192.168.123.107:8080/api",
  withCredentials: true,
});


/* ============================================================
   ✅ 요청 인터셉터 (AccessToken 자동 첨부)
   ➤ PUBLIC_API 는 토큰을 아예 붙이지 않음!!
============================================================ */
axiosInstance.interceptors.request.use((config) => {

  // public API는 Authorization 헤더 제거
  if (PUBLIC_API.some((url) => config.url.startsWith(url))) {
    delete config.headers.Authorization;
    return config;
  }

  const token = Cookies.get("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


/* ============================================================
   ✅ 응답 인터셉터 (401이면 refresh)
   ➤ PUBLIC_API는 refresh 시도하지 않음!!
============================================================ */
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 🔥 Public API는 refresh 시도하지 않게 막아야 한다
    if (PUBLIC_API.some((url) => originalRequest.url.startsWith(url))) {
      return Promise.reject(error);
    }

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

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (err) {
        console.error("🔴 refresh 실패:", err);
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
