import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

// ✅ 전역 AuthContext를 읽기 위한 전용 훅
export default function useAuth() {
  return useContext(AuthContext);
}
