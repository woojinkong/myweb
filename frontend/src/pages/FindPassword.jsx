import { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { cardBase, buttons, colors } from "../styles/common";

export default function FindPassword() {
  const [form, setForm] = useState({
    userId: "",
    userName: "",
    email: "",
  });
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false); // ✅ 중복 클릭 방지
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;      // 🔥 중복 제출 방지
    setSubmitting(true);
    setMessage("");
    try {
      const res = await axiosInstance.post("/user/find-password", form);
      setMessage("📩 " + res.data);
    } catch (err) {
      setMessage("❌ " + (err.response?.data || "요청에 실패했습니다."));
    }finally {
      setSubmitting(false);      // 🔥 요청 끝나면 다시 활성화
    }
  };

  return (
    <div style={{ ...cardBase, maxWidth: "400px", margin: "80px auto", padding: "30px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px", color: colors.text.main }}>
        🔐 비밀번호 찾기
      </h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <input
          type="text"
          name="userId"
          placeholder="아이디"
          value={form.userId}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="userName"
          placeholder="이름"
          value={form.userName}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="이메일"
          value={form.email}
          onChange={handleChange}
          required
        />
        <button type="submit" style={{
            ...buttons.primary,
            opacity: submitting ? 0.6 : 1,
            cursor: submitting ? "not-allowed" : "pointer",
          }} disabled={submitting} >{submitting ? "전송 중..." : "재설정 메일 보내기"}</button>
      </form>

      {message && (
        <p style={{ marginTop: "15px", color: message.startsWith("❌") ? "red" : "green" }}>
          {message}
        </p>
      )}
    </div>
  );
}
