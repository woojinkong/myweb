import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function Navbar() {

    const { user, logout } = useAuth();
  return (
    <div
      style={{
        position: "fixed",       // ✅ 항상 상단에 고정
        top: 0,
        left: 0,
        width: "100vw",          // ✅ 브라우저 전체 폭 기준
        height: "50px",
        background: "#2b2b2b",
        color: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 20px",
        boxSizing: "border-box",
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        zIndex: 1000,            // ✅ 다른 요소 위로
      }}
    >
      <Link
        to="/"
        style={{
          color: "white",
          textDecoration: "none",
          fontSize: "20px",
          fontWeight: "bold",
        }}
      >
        KongHome
      </Link>



     <div>
        {user ? (
          <>
            <span style={{ marginRight: "10px" }}>
              {user.userName}님 환영합니다 👋
            </span>
            <button
              onClick={logout}
              style={{
                background: "transparent",
                border: "1px solid white",
                color: "white",
                borderRadius: "5px",
                cursor: "pointer",
                padding: "5px 10px",
              }}
            >
              로그아웃
            </button>
          </>
        ) : (
          <Link
            to="/login"
            style={{ color: "white", textDecoration: "none", fontSize: "14px" }}
          >
            로그인
          </Link>
        )}
      </div>
    </div>
  );
}
