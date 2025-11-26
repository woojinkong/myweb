import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { cardBase, buttons, colors } from "../styles/common";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return setMessage("❌ 비밀번호가 일치하지 않습니다.");

    try {
      const res = await axiosInstance.post("/user/reset-password", { token, newPassword: password });
      setMessage("✅ " + res.data);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setMessage("❌ " + (err.response?.data || "비밀번호 변경 실패"));
    }
  };

  return (
    <div style={{ ...cardBase, maxWidth: "400px", margin: "80px auto", padding: "30px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px", color: colors.text.main }}>
        🔄 새 비밀번호 설정
      </h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <input
          type="password"
          placeholder="새 비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="비밀번호 확인"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        <button type="submit" style={buttons.primary}>비밀번호 변경</button>
      </form>
      {message && (
        <p style={{ marginTop: "15px", color: message.startsWith("❌") ? "red" : "green" }}>
          {message}
        </p>
      )}
    </div>
  );
}
