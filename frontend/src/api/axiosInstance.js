import axios from "axios";
import Cookies from "js-cookie";

// ✅ 일반 요청용 인스턴스
const axiosInstance = axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: true, // RefreshToken 쿠키 포함
});

// ✅ Refresh 전용 인스턴스 (Authorization 헤더 추가 X)
const refreshAxios = axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: true,
});

// ✅ 요청 인터셉터 (AccessToken 자동 첨부)
axiosInstance.interceptors.request.use((config) => {
  const token = Cookies.get("accessToken");
  if (token && token !== "undefined" && token !== "null") { // ✅ 이 부분 추가
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ 응답 인터셉터 (AccessToken 만료 → 자동 재발급)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 → AccessToken 만료로 판단
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // ✅ refreshAxios 사용 (중첩 방지)
        const res = await refreshAxios.post("/auth/refresh");
        const newToken = res.data.accessToken;

       if (newToken) {
        Cookies.set("accessToken", newToken, { sameSite: "strict" }); // ✅ 명시적으로 sameSite 설정
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        console.error("리프레시 토큰 갱신실패", refreshError);
        console.warn("리프레시 토큰 만료 → 재로그인 필요");
        Cookies.remove("accessToken");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
