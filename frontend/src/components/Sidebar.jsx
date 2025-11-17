import { Link, useLocation } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import axiosInstance from "../api/axiosInstance";
import { FiFolder } from "react-icons/fi";

export default function Sidebar({ isOpen, toggleSidebar }) {
  const location = useLocation();
  const currentGroupId = new URLSearchParams(location.search).get("groupId");

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  // 📌 그룹 목록 가져오기
  const loadGroups = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/board-group");
      setGroups(res.data || []);
    } catch (err) {
      console.error("❌ 게시판 그룹 불러오기 실패:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGroups();
  }, [loadGroups, location.pathname]);

  // 📌 활성화 스타일
  const getActiveStyle = (id) => {
    const isActive = String(currentGroupId) === String(id);
    return isActive ? styles.active : {};
  };

  return (
    <div style={{ ...styles.sidebar, width: isOpen ? "200px" : "70px" }}>
      {/* ☰ 햄버거 버튼 */}
      <div style={styles.header}>
        <button onClick={toggleSidebar} style={styles.hamburger}>☰</button>
      </div>

      {/* 🔄 로딩 표시 */}
      {loading && (
        <p style={{ textAlign: "center", color: "#888", fontSize: "13px" }}>
          불러오는 중...
        </p>
      )}

      {/* 📂 그룹 목록 */}
      <ul style={styles.list}>
        {groups.map((group) => (
          <li key={group.id} style={styles.item}>
            <Link
              to={`/board?groupId=${group.id}`}
              style={{ ...styles.link, ...getActiveStyle(group.id) }}
            >
              <FiFolder style={styles.icon} />
              {isOpen && <span>{group.name}</span>}
            </Link>
          </li>
        ))}

        {/* ⚠ 그룹이 없을 경우 */}
        {!loading && groups.length === 0 && (
          <li style={{ color: "#999", textAlign: "center", fontSize: "14px", marginTop: "10px" }}>
            게시판 없음
          </li>
        )}
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
    paddingTop: "10px",
    transition: "width 0.3s ease",
    overflow: "hidden",
    zIndex: 999,
  },
  header: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "15px",
  },
  hamburger: {
    background: "transparent",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
  },
  list: {
    listStyle: "none",
    padding: 0,
  },
  item: {
    marginBottom: "8px",
  },
  link: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px",
    textDecoration: "none",
    color: "#333",
    borderRadius: "6px",
    transition: "0.2s ease",
  },
  active: {
    background: "#4CAF50",
    color: "#fff",
    fontWeight: "700",
  },
  icon: {
    fontSize: "18px",
  },
};
