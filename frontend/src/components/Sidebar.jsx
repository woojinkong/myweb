import { Link, useLocation } from "react-router-dom";
import { FiVolume2, FiMessageSquare, FiInfo } from "react-icons/fi"; // ✅ 깔끔한 아이콘들 (Feather Icons)
import { colors, shadows, radius } from "../styles/common";

export default function Sidebar({ isOpen, toggleSidebar }) {
  const location = useLocation();
  const currentCategory = new URLSearchParams(location.search).get("category");

  const getActiveStyle = (category) => ({
    backgroundColor:
      currentCategory === category ? colors.primary : "transparent",
    color: currentCategory === category ? "#fff" : colors.text.main,
    fontWeight: currentCategory === category ? "600" : "500",
  });

  return (
    <div
      style={{
        ...styles.sidebar,
        width: isOpen ? "200px" : "70px",
      }}
    >
      {/* ✅ 상단 햄버거 버튼 */}
      <div style={styles.header}>
        <button onClick={toggleSidebar} style={styles.hamburger}>
          ☰
        </button>
      </div>

      {/* ✅ 메뉴 리스트 */}
      <ul style={styles.list}>
        <li style={styles.item}>
          <Link
            to="/board?category=notice"
            style={{ ...styles.link, ...getActiveStyle("notice") }}
          >
            <FiVolume2 style={styles.icon} />
            {isOpen && <span>공지사항</span>}
          </Link>
        </li>
        <li style={styles.item}>
          <Link
            to="/board?category=free"
            style={{ ...styles.link, ...getActiveStyle("free") }}
          >
            <FiMessageSquare style={styles.icon} />
            {isOpen && <span>자유게시판</span>}
          </Link>
        </li>
        <li style={styles.item}>
          <Link
            to="/board?category=inform"
            style={{ ...styles.link, ...getActiveStyle("inform") }}
          >
            <FiInfo style={styles.icon} />
            {isOpen && <span>정보공유</span>}
          </Link>
        </li>
      </ul>
    </div>
  );
}

const styles = {
  sidebar: {
    position: "fixed",
    top: 0,
    left: 0,
    height: "100vh",
    background: "#fff",
    borderRight: "1px solid #eee",
    boxShadow: shadows.soft,
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: "10px",
    transition: "width 0.3s ease",
    overflow: "hidden",
    zIndex: 999,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingBottom: "15px",
  },
  hamburger: {
    fontSize: "20px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: colors.text.main,
  },
  list: {
    listStyle: "none",
    padding: 0,
    marginTop: "10px",
    width: "100%",
  },
  item: {
    textAlign: "center",
    marginBottom: "10px",
  },
  link: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    justifyContent: "center",
    textDecoration: "none",
    color: colors.text.main,
    fontSize: "15px",
    fontWeight: "500",
    padding: "10px 12px",
    borderRadius: radius.medium,
    transition: "all 0.2s ease",
  },
  icon: {
    fontSize: "18px",
  },
};
