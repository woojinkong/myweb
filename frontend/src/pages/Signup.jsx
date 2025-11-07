import { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    userId: "",
    userPwd: "",
    confirmPwd: "",
    userName: "",
    userAge: "",
    email: "",
    phone: "",
  });

  const [emailVerified, setEmailVerified] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [idChecked, setIdChecked] = useState(false); // ✅ 아이디 중복확인 완료 여부

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ✅ 이메일 정규식
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // ✅ 입력값 변경
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // ✅ 비밀번호 불일치 실시간 표시
    if ((name === "userPwd" || name === "confirmPwd") && form.confirmPwd) {
      if (name === "confirmPwd" && value !== form.userPwd) {
        setError("비밀번호가 일치하지 않습니다.");
      } else if (name === "userPwd" && form.confirmPwd !== value) {
        setError("비밀번호가 일치하지 않습니다.");
      } else {
        setError("");
      }
    }

    // ✅ 아이디 변경 시 중복확인 상태 초기화
    if (name === "userId") setIdChecked(false);
  };

  // ✅ 아이디 중복확인
  const handleCheckUserId = async () => {
    if (!form.userId.trim()) return alert("아이디를 입력해주세요!");

    try {
      const res = await axiosInstance.get(`/auth/check-id`, {
        params: { userId: form.userId },
      });

      if (res.data.exists) {
        alert("이미 사용 중인 아이디입니다.");
        setError("이미 사용 중인 아이디입니다.");
        setIdChecked(false);
      } else {
        alert("사용 가능한 아이디입니다!");
        setError("");
        setIdChecked(true);
      }
    } catch (err) {
      console.error(err);
      alert("아이디 중복 확인 중 오류가 발생했습니다.");
    }
  };

  // ✅ 이메일 인증번호 전송
  const handleSendEmail = async () => {
    if (!form.email) return alert("이메일을 입력해주세요!");
    if (!emailRegex.test(form.email)) return alert("올바른 이메일 형식이 아닙니다!");

    try {
      await axiosInstance.post("/auth/send-email-code", { email: form.email });
      setEmailSent(true);
      alert("인증번호가 이메일로 발송되었습니다!");
    } catch (err) {
      console.error(err);
      alert("이메일 전송 중 오류가 발생했습니다.");
    }
  };

  // ✅ 이메일 인증번호 확인
  const handleVerifyCode = async () => {
    if (!verifyCode.trim()) return alert("인증번호를 입력해주세요!");

    try {
      const res = await axiosInstance.post("/auth/verify-email-code", {
        email: form.email,
        code: verifyCode,
      });

      if (res.data.success) {
        setEmailVerified(true);
        alert("이메일 인증이 완료되었습니다!");
      } else {
        alert("인증번호가 올바르지 않습니다.");
      }
    } catch (err) {
      console.error(err);
      alert("인증 확인 중 오류가 발생했습니다.");
    }
  };

  // ✅ 회원가입 요청
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!idChecked) return setError("아이디 중복확인을 해주세요.");
    if (!emailRegex.test(form.email)) return setError("올바른 이메일 형식이 아닙니다.");
    if (form.userPwd !== form.confirmPwd)
      return setError("비밀번호가 일치하지 않습니다.");
    if (!emailVerified)
      return setError("이메일 인증을 완료해야 회원가입이 가능합니다.");

    try {
      const res = await axiosInstance.post("/auth/signup", form);
      if (res.status === 200) {
        setSuccess("회원가입이 완료되었습니다!");
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (err) {
      if (err.response?.data?.message)
        setError(err.response.data.message);
      else setError("회원가입 중 오류가 발생했습니다.");
    }
  };

  // ✅ 모든 조건 충족 시 버튼 활성화
  const isFormValid =
    idChecked &&
    form.userId &&
    form.userPwd &&
    form.confirmPwd &&
    form.userName &&
    emailVerified &&
    emailRegex.test(form.email) &&
    form.userPwd === form.confirmPwd;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>회원가입</h2>
      <form onSubmit={handleSubmit} style={styles.form}>

        {/* ✅ 아이디 입력 + 중복확인 */}
        <div style={styles.emailBox}>
          <input
            type="text"
            name="userId"
            placeholder="아이디"
            value={form.userId}
            onChange={handleChange}
            required
            style={{ ...styles.input, flex: 1 }}
          />
          <button
            type="button"
            onClick={handleCheckUserId}
            style={{
              ...styles.smallButton,
              backgroundColor: idChecked ? "#28a745" : "#007BFF",
            }}
          >
            {idChecked ? "사용가능" : "중복확인"}
          </button>
        </div>

        <input
          type="password"
          name="userPwd"
          placeholder="비밀번호"
          value={form.userPwd}
          onChange={handleChange}
          required
          style={styles.input}
        />

        <input
          type="password"
          name="confirmPwd"
          placeholder="비밀번호 확인"
          value={form.confirmPwd}
          onChange={handleChange}
          required
          style={styles.input}
        />

        {form.userPwd && form.confirmPwd && form.userPwd !== form.confirmPwd && (
          <p style={styles.error}>비밀번호가 일치하지 않습니다.</p>
        )}

        <input
          type="text"
          name="userName"
          placeholder="이름"
          value={form.userName}
          onChange={handleChange}
          required
          style={styles.input}
        />

        <input
          type="number"
          name="userAge"
          placeholder="나이"
          value={form.userAge}
          onChange={handleChange}
          style={styles.input}
        />

        {/* ✅ 이메일 입력 + 인증 요청 */}
        <div style={styles.emailBox}>
          <input
            type="email"
            name="email"
            placeholder="이메일"
            value={form.email}
            onChange={handleChange}
            required
            style={{ ...styles.input, flex: 1 }}
          />
          <button
            type="button"
            onClick={handleSendEmail}
            disabled={emailVerified}
            style={{
              ...styles.smallButton,
              backgroundColor: emailVerified ? "#28a745" : "#007BFF",
              opacity: emailVerified ? 0.8 : 1,
            }}
          >
            {emailVerified ? "인증완료" : "인증요청"}
          </button>
        </div>

        {emailSent && !emailVerified && (
          <div style={styles.emailBox}>
            <input
              type="text"
              placeholder="인증번호 입력"
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value)}
              style={{ ...styles.input, flex: 1 }}
            />
            <button
              type="button"
              onClick={handleVerifyCode}
              style={{
                ...styles.smallButton,
                backgroundColor: "#007BFF",
              }}
            >
              인증확인
            </button>
          </div>
        )}

        <input
          type="text"
          name="phone"
          placeholder="핸드폰번호"
          value={form.phone}
          onChange={handleChange}
          style={styles.input}
        />

        <button
          type="submit"
          style={{
            ...styles.button,
            backgroundColor: isFormValid ? "#4CAF50" : "#aaa",
            cursor: isFormValid ? "pointer" : "not-allowed",
          }}
          disabled={!isFormValid}
        >
          회원가입
        </button>
      </form>

      {error && <p style={styles.error}>{error}</p>}
      {success && <p style={styles.success}>{success}</p>}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "420px",
    margin: "80px auto",
    padding: "25px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    backgroundColor: "#fff",
    textAlign: "center",
  },
  title: { marginBottom: "20px" },
  form: { display: "flex", flexDirection: "column", gap: "10px" },
  input: {
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  emailBox: { display: "flex", gap: "8px" },
  smallButton: {
    padding: "8px 10px",
    borderRadius: "5px",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
  button: {
    padding: "10px",
    borderRadius: "5px",
    color: "white",
    border: "none",
  },
  error: { color: "red", marginTop: "5px", fontSize: "14px" },
  success: { color: "green", marginTop: "10px" },
};
