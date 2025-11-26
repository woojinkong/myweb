import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useAuth();

  // ✅ 로그인 안 되어 있으면 로그인 페이지로
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ✅ 관리자 전용 페이지 접근 제한
  if (adminOnly && user.role !== "ADMIN") {
    alert("관리자만 접근 가능합니다.");
    return <Navigate to="/" replace />;
  }

  // ✅ 통과
  return children;
}
