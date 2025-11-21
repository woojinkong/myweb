import { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext"; // ✅ 추가
import { Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext); // ✅ 추가
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    userId: "",
    userPwd: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // 중복 클릭 방지
    setLoading(true);
    setError("");

    try {
      const res = await axiosInstance.post("/auth/login", form);
      const accessToken = res.data.accessToken;
      const user = res.data.user;

      // ✅ accessToken 저장
      // ✅ accessToken 저장 (반드시 sameSite 지정)
      Cookies.set("accessToken", accessToken, {
        sameSite: "Lax", // 또는 "None" (HTTPS 환경일 경우)
        secure: false, // ✅ 로컬에서는 반드시 false
        expires: 1,      // 하루 유지
      });


      // ✅ 전역 상태 갱신 (핵심)
      setUser(user);

      alert("로그인 성공!");
      navigate("/");
    } catch (err) {
      console.error(err);

      // 🚫 정지된 계정 처리 (403 에러)
      if (err.response && err.response.status === 403) {
        const data = err.response.data;
        setError(`🚫 ${data.message}\n사유: ${data.reason}`);
        // ⭐ Access Token 쿠키 제거!
      Cookies.remove("accessToken");
        return;
      }
      setError("아이디 또는 비밀번호가 올바르지 않습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>로그인</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          name="userId"
          placeholder="아이디"
          value={form.userId}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          type="password"
          name="userPwd"
          placeholder="비밀번호"
          value={form.userPwd}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </form>

      {error && <p style={styles.error}>{error}</p>}

            <p style={{ marginTop: "15px" }}>
        아직 회원이 아니신가요?{" "}
        <Link to="/signup" style={{ color: "#007BFF", textDecoration: "none" }}>
            회원가입
        </Link>
        <br /> {/* ✅ 줄바꿈 추가 */}
            <Link
                to="/find-password"
                style={{ color: "#4CAF50", fontSize: "13px", marginTop: "8px", display: "inline-block" }}
            >
                비밀번호를 잊으셨나요?
            </Link>

        </p>
    </div>
  );
}


const styles = {
  container: {
    maxWidth: "400px",
    margin: "80px auto",
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    backgroundColor: "#fff",
    textAlign: "center",
  },
  title: {
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  input: {
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "10px",
    borderRadius: "5px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
  error: {
    color: "red",
    marginTop: "10px",
  },
};
