import { Link, useNavigate } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { fetchUnreadCount } from "../api/notificationApi";

// ✅ Feather 아이콘 통일
import {
  FiSearch,
  FiBell,
  FiUser,
  FiLogIn,
  FiLogOut,
  FiUserPlus,
} from "react-icons/fi";

export default function Navbar({ isSidebarOpen }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [showSearch, setShowSearch] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [type, setType] = useState("title");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      const loadUnread = async () => {
        try {
          const count = await fetchUnreadCount();
          setUnreadCount(count);
        } catch (err) {
          console.error("알림 개수 조회 실패:", err);
        }
      };
      loadUnread();

      const interval = setInterval(loadUnread, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!keyword.trim()) {
      alert("검색어를 입력하세요!");
      return;
    }
    navigate(`/board/search?keyword=${keyword}&type=${type}`);
    setShowSearch(false);
    setKeyword("");
  };

  return (
    <nav
      style={{
        ...styles.nav,
        left: isSidebarOpen ? "200px" : "70px",
        width: isSidebarOpen ? "calc(100vw - 200px)" : "calc(100vw - 70px)",
      }}
    >
      {/* 로고 */}
      <div style={styles.logoBox}>
        <Link to="/" style={styles.logo}>
          KONGHOME
        </Link>
      </div>

      {/* 메뉴 */}
      <div style={styles.menu}>
        {/* 🔍 검색 */}
        {showSearch ? (
          <form onSubmit={handleSearchSubmit} style={styles.searchForm}>
            <select value={type} onChange={(e) => setType(e.target.value)} style={styles.select}>
              <option value="title">제목</option>
              <option value="content">내용</option>
              <option value="userId">작성자</option>
            </select>
            <input
              type="text"
              placeholder="검색어 입력..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={styles.input}
            />
            <button type="submit" style={styles.iconButton}>
              <FiSearch />
            </button>
            <button
              type="button"
              onClick={() => setShowSearch(false)}
              style={styles.iconButton}
            >
              ✖
            </button>
          </form>
        ) : (
          <button
            onClick={() => setShowSearch(true)}
            style={styles.iconButton}
            title="검색"
          >
            <FiSearch />
          </button>
        )}

        {/* 🔔 알림 */}
        {user && (
          <div
            style={styles.notificationBox}
            onClick={() => navigate("/notifications")}
            title="알림"
          >
            <FiBell style={styles.iconBase} />
            {unreadCount > 0 && <span style={styles.badge}>{unreadCount}</span>}
          </div>
        )}

        {/* 👤 로그인 상태별 */}
        {user ? (
          <>
            <button
              onClick={() => navigate("/mypage")}
              style={styles.iconButton}
              title="내 정보"
            >
              <FiUser />
            </button>
            <button onClick={logout} style={styles.iconButton} title="로그아웃">
              <FiLogOut />
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.iconButton} title="로그인">
              <FiLogIn />
            </Link>
            <Link to="/signup" style={styles.iconButton} title="회원가입">
              <FiUserPlus />
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
    borderBottom: "1px solid #eee",
    color: "#333",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 40px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
    zIndex: 1000,
    transition: "left 0.3s ease, width 0.3s ease",
    boxSizing: "border-box",
  },
  logoBox: { display: "flex", alignItems: "center" },
  logo: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#333",
    textDecoration: "none",
  },
  menu: { display: "flex", alignItems: "center", gap: "16px" },
  searchForm: { display: "flex", alignItems: "center", gap: "5px" },
  select: { padding: "6px", borderRadius: "4px", border: "1px solid #ccc" },
  input: {
    padding: "6px 10px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    width: "180px",
  },
  iconButton: {
    background: "transparent",
    border: "none",
    fontSize: "20px",
    color: "#444",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  iconBase: {
    fontSize: "20px",
    color: "#444",
  },
  iconActive: {
    color: "#4CAF50",
  },
  notificationBox: {
    position: "relative",
    fontSize: "20px",
    cursor: "pointer",
  },
  badge: {
    position: "absolute",
    top: "-6px",
    right: "-10px",
    background: "red",
    color: "white",
    borderRadius: "50%",
    fontSize: "11px",
    padding: "2px 5px",
  },
};
