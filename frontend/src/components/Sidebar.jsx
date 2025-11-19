import { Link, useLocation } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import axiosInstance from "../api/axiosInstance";
import useIsMobile from "../hooks/useIsMobile";

export default function Sidebar({ isOpen, toggleSidebar }) {
  const location = useLocation();
  const currentGroupId = new URLSearchParams(location.search).get("groupId");

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

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

  // 📌 활성화 강조 스타일
  const getActiveStyle = (id) => {
    const isActive = String(currentGroupId) === String(id);
    return isActive ? styles.active : {};
  };

  let numberCounter = 1;

  return (
    <div
  className={`sidebar-container ${isOpen ? "open" : ""}`}
  style={{
    ...styles.sidebar,
    ...(isMobile ? {} : { width: isOpen ? "150px" : "50px" }),
  }}
>

      <div style={styles.header}>
        <button onClick={toggleSidebar} style={styles.hamburger}>☰</button>
      </div>

      {loading && (
        <p style={{ textAlign: "center", color: "#888", fontSize: "13px" }}>
          불러오는 중...
        </p>
      )}

      <ul style={styles.list}>
        {groups.map((group) => {
          // 🔥 구분선은 번호 없음 + 번호 증가 X
          if (group.type === "DIVIDER") {
            return (
              <li key={group.id} style={styles.item}>
                <div style={isOpen ? styles.dividerOpen : styles.dividerClosed}>
                  {isOpen && ` ${group.name} `}
                  {!isOpen && "─"}
                </div>
              </li>
            );
          }

          // 🔥 BOARD 전용 번호
          const number = numberCounter;
          numberCounter++;

          return (
            <li key={group.id} style={styles.item}>
              <Link
                to={`/board?groupId=${group.id}`}
                style={{ ...styles.link, ...getActiveStyle(group.id) }}
              >
                {/* 번호만 표시 */}
                <span style={styles.number}>{number}.</span>

                {isOpen && <span>{group.name}</span>}
              </Link>
            </li>
          );
        })}
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
    justifyContent: "flex-start",
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
    gap: "8px",
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

  /* 번호 텍스트만 */
  number: {
    fontSize: "14px",
    fontWeight: "600",
    width: "20px",
    textAlign: "right",
  },

  dividerOpen: {
    textAlign: "center",
    fontWeight: 500,
    color: "#777",
    padding: "0px 0",
    borderBottom: "1px solid #ddd",
    margin: "6px 6px",
  },
  dividerClosed: {
    textAlign: "center",
    color: "#777",
    padding: "6px 0",
  },
};
