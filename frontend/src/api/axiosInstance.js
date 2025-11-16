import axios from "axios";
import Cookies from "js-cookie";

// ✅ 기본 API 요청용 인스턴스 (모든 요청이 /api/** 로 향하게)
const axiosInstance = axios.create({
  baseURL: "http://192.168.123.107:8080/api", // ✅ 백엔드 주소 (포트 8080)
  withCredentials: true, // ✅ 쿠키 포함 (refreshToken)
});

// ✅ Refresh 전용 인스턴스 (AccessToken 없이 쿠키만 보냄)
const refreshAxios = axios.create({
  baseURL: "http://192.168.123.107:8080/api",
  withCredentials: true,
});

// ✅ 요청 인터셉터 (AccessToken 자동 첨부)
axiosInstance.interceptors.request.use((config) => {
  const token = Cookies.get("accessToken");
  console.log("📦 axiosInstance에서 accessToken:", token);
  
  // ✅ 로그인하지 않은 경우 → 인증 필요 API 요청 막기
  const openUrls = [
    "/auth/",
    "/user/find-password",
    "/user/reset-password"
  ];
  const isOpenUrl = openUrls.some((url) => config.url.includes(url));

  if (token && token !== "undefined" && token !== "null") {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (!isOpenUrl && config.url.startsWith("/user")) {
    console.warn("🚫 로그인 안 된 상태의 요청 차단:", config.url);
    return Promise.reject({ response: { status: 401 } });
  }

  return config;
});


// ✅ 응답 인터셉터 (401 → 토큰 자동 갱신)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ✅ accessToken 만료 시 refresh 시도 (단 1회만)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const res = await refreshAxios.post("/auth/refresh", {}, { withCredentials: true });
        const newAccessToken = res.data.accessToken;

        if (newAccessToken) {
          // ✅ 새 accessToken 저장
          Cookies.set("accessToken", newAccessToken, {
            sameSite: "Lax", // ✅ cross-origin에서도 안전하게 전송됨
            expires: 1,
          });

          // ✅ 요청 헤더 갱신 후 재시도
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        console.error("리프레시 토큰 갱신 실패:", refreshError);
        Cookies.remove("accessToken");
        window.location.href = "/login"; // ✅ 무한 루프 방지용
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
