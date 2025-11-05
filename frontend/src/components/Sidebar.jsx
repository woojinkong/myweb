import { Link } from "react-router-dom";

export default function Sidebar({ isOpen, toggleSidebar }) {
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
        {/* {isOpen && <span style={styles.logo}>KONGHOME</span>} */}
      </div>

      {/* ✅ 메뉴 리스트 */}
      <ul style={styles.list}>
        <li style={styles.item}>
          <Link to="/board" style={styles.link}>
            📋 {isOpen && "게시판"}
          </Link>
        </li>
        <li style={styles.item}>
          <Link to="/ranking" style={styles.link}>
            🏆 {isOpen && "구현중"}
          </Link>
        </li>
        <li style={styles.item}>
          <Link to="/store" style={styles.link}>
            🛒 {isOpen && "구현중"}
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
  logo: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#333",
  },
  list: {
    listStyle: "none",
    padding: 0,
    marginTop: "20px",
    width: "100%",
  },
  item: {
    marginBottom: "15px",
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
