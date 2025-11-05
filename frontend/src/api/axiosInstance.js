import axios from "axios";
import Cookies from "js-cookie";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080/api", // 백엔드 주소
  withCredentials: true, // ✅ 쿠키 포함 허용
});

// 요청 인터셉터: accessToken 자동 추가
axiosInstance.interceptors.request.use((config) => {
  const token = Cookies.get("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터: accessToken 만료 시 자동 갱신
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 Unauthorized 발생 시 refresh 요청
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axiosInstance.post("/auth/refresh");
        const newToken = res.data.accessToken;

        // 새 토큰 쿠키에 저장
        Cookies.set("accessToken", newToken);

        // 기존 요청에 새 토큰 추가 후 재요청
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch {
        // refresh 실패 시 쿠키 삭제 및 로그인 페이지로 이동
        Cookies.remove("accessToken");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
