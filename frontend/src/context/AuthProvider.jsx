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

  const publicPrefixes = [
    "/",   
    "/login",
    "/signup",
    "/find-password",
    "/reset-password",
    "/board",
    "/board-group",
    "/comments",
    "/uploads",
  ];

  useEffect(() => {

    // 🔥 공개 경로는 /auth/me 호출하지 않음
    if (publicPrefixes.some(prefix => location.pathname.startsWith(prefix))) {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get("/auth/me");
        setUser(res.data);
      } catch (err) {
        console.warn("유저 정보 불러오기 실패:", err);

        if (err.response?.status === 403) {
          Cookies.remove("accessToken");
          setUser(null);
        } else {
          Cookies.remove("accessToken");
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [location.pathname]);

  const logout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch {
          //
      }

    Cookies.remove("accessToken");

    // ⭐ 로그아웃 후 Authorization 헤더 제거
    delete axiosInstance.defaults.headers.common["Authorization"];

    setUser(null);
  };

  if (loading) return <p>⏳ 로그인 상태 확인 중...</p>;

  return (
    <AuthContext.Provider value={{ user, setUser, logout,loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
