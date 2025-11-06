import { Link, useLocation } from "react-router-dom";

export default function Sidebar({ isOpen, toggleSidebar }) {
  const location = useLocation();
  const currentCategory = new URLSearchParams(location.search).get("category");

  const getActiveStyle = (category) => ({
  backgroundColor: currentCategory === category ? "#4CAF50" : "transparent",
  color: currentCategory === category ? "#fff" : "#333",
  fontWeight: currentCategory === category ? "600" : "500",
  transition: "all 0.2s ease",
});

  return (
    <div
      style={{
        ...styles.sidebar,
        width: isOpen ? "200px" : "70px",
      }}
    >
      {/* ✅ 상단 햄버거 + 로고 */}
      <div style={styles.header}>
        <button onClick={toggleSidebar} style={styles.hamburger}>
          ☰
        </button>
      </div>

      {/* ✅ 메뉴 리스트 */}
      <ul style={styles.list}>
        <li style={styles.item}>
          <Link to="/board?category=notice" style={{ ...styles.link, ...getActiveStyle("notice") }}>
            📢 {isOpen && "공지"}
          </Link>
        </li>
        <li style={styles.item}>
          <Link to="/board?category=free" style={{ ...styles.link, ...getActiveStyle("free") }}>
            💬 {isOpen && "자유"}
          </Link>
        </li>
        <li style={styles.item}>
          <Link to="/board?category=inform" style={{ ...styles.link, ...getActiveStyle("inform") }}>
            ℹ️  {isOpen && "정보"}
          </Link>
        </li>
        <hr style={{ width: "80%", border: "none", borderTop: "1px solid #ddd", margin: "15px auto" }} />
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
    background: "#f8f9fa",
    borderRight: "1px solid #e0e0e0",
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
    gap: "10px",
    justifyContent: "center",
    width: "100%",
    paddingBottom: "10px",
  },
  hamburger: {
    fontSize: "20px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
  },
  list: {
    listStyle: "none",
    padding: 0,
    marginTop: "20px",
    width: "100%",
  },
  item: {
    marginBottom: "10px",
    textAlign: "center",
  },
  link: {
    textDecoration: "none",
    color: "#333",
    fontSize: "16px",
    fontWeight: "500",
    padding: "10px 15px",
    display: "block",
    borderRadius: "8px",
    transition: "background 0.2s ease",
  },
};
