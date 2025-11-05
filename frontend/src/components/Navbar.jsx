import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import axiosInstance from "../api/axiosInstance";

export default function Navbar({ isSidebarOpen }) {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
      setUser(null);
      navigate("/login");
    } catch (err) {
      console.error("로그아웃 실패:", err);
    }
  };

  return (
    <nav
      style={{
        ...styles.nav,
        left: isSidebarOpen ? "200px" : "70px",
        width: isSidebarOpen ? "calc(100vw - 200px)" : "calc(100vw - 70px)", // ✅ 수정
      }}
    >
      <div style={styles.logoBox}>
        <Link to="/" style={styles.logo}>
          KONGHOME
        </Link>
      </div>

      <div style={styles.menu}>
        {user ? (
          <>
            <button onClick={() => navigate("/mypage")} style={styles.button}>
              내 정보
            </button>
            <button onClick={handleLogout} style={styles.button}>
              로그아웃
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.button}>
              로그인
            </Link>
            <Link to="/signup" style={styles.button}>
              회원가입
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    position: "fixed",
    top: 0,
    height: "60px",
    background: "#ffffff",
    color: "#333",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 40px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
    zIndex: 1000,
    transition: "left 0.3s ease, width 0.3s ease", // ✅ 추가: 부드럽게 이동
    boxSizing: "border-box", // ✅ 추가
  },
  logoBox: {
    display: "flex",
    alignItems: "center",
  },
  logo: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#333",
    textDecoration: "none",
  },
  menu: {
    display: "flex",
    gap: "12px",
  },
  button: {
    background: "transparent",
    border: "1px solid #ccc",
    color: "#333",
    borderRadius: "6px",
    padding: "6px 12px",
    cursor: "pointer",
    fontWeight: "500",
    textDecoration: "none",
    transition: "all 0.2s ease",
  },
};
