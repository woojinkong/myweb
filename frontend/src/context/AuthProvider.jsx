// AuthProvider.jsx
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import Cookies from "js-cookie";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // ✅ 로그인 상태 복원 (AccessToken 만료 시 refresh 자동 호출)
  useEffect(() => {
    // ✅ 로그인 필요 없는 공개 경로들
    const publicPaths = [
      "/",
      "/login",
      "/signup",
      "/find-password",
      "/reset-password",
    ];

    const publicPrefixes = ["/user"];

    // ✅ 공개 경로라면 /auth/me 호출하지 않음 (깜빡임 방지)
    if (publicPaths.includes(location.pathname) || publicPrefixes.some((prefix) => location.pathname.startsWith(prefix))) {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get("/auth/me");
        setUser(res.data);
      } catch (err) {
        console.warn("유저 정보 불러오기 실패:", err);
         // ⭐ 403이면 정지된 계정 → 강제 로그아웃
        if (err.response?.status === 403) {
            Cookies.remove("accessToken");
            setUser(null);
            return;
        }

        // 그 외 오류도 로그인 초기화
        Cookies.remove("accessToken");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [location.pathname]);

  // ✅ 로그아웃
  const logout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch {
      // ignore
    }
    Cookies.remove("accessToken");
    setUser(null);
  };

  if (loading) return <p>⏳ 로그인 상태 확인 중...</p>;

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
