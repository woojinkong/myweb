import { Link, useLocation } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import axiosInstance from "../api/axiosInstance";
import useIsMobile from "../hooks/useIsMobile";
import useAuth from "../hooks/useAuth";

export default function Sidebar({ isOpen, toggleSidebar }) {
  const location = useLocation();
  const currentGroupId = new URLSearchParams(location.search).get("groupId");

  const { user, loading: authLoading } = useAuth();  // ✔ loading 가져오기
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const isMobile = useIsMobile();

  // 📌 그룹 목록 가져오기
  const loadGroups = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/board-group/with-new");
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

  // 🚨 user 정보가 아직 로딩 중이면 사이드바를 렌더하지 않음
  if (authLoading || loading) {
    return (
      <div style={{ padding: "15px", color: "#888", fontSize: "13px" }}>
        불러오는 중...
      </div>
    );
  }

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
        {!isMobile && (
          <button onClick={toggleSidebar} style={styles.hamburger}>☰</button>
        )}
      </div>

      <ul style={styles.list}>
        {groups
          .filter((group) => {
            // ✔ 관리자 전용 게시판: user.role 로딩 전에는 숨기기
            if (group.adminOnly && user?.role !== "ADMIN") return false;
            return true;
          })
          .map((group) => {
            const id = group.groupId;
            const name = group.name;
            const hasNew = group.hasNew;

            // 구분선
            if (group.type === "DIVIDER") {
              return (
                <li key={id} style={styles.item}>
                  <div style={isOpen ? styles.dividerOpen : styles.dividerClosed}>
                    {isOpen && ` ${group.name} `}
                    {!isOpen && "─"}
                  </div>
                </li>
              );
            }

            const number = numberCounter++;
            return (
              <li key={id} style={styles.item}>
                <Link
                  to={`/board?groupId=${id}`}
                  style={{ ...styles.link, ...getActiveStyle(id) }}
                >
                  <span style={styles.number}>{number}.</span>
                  {isOpen && <span>{name}</span>}
                  {hasNew && isOpen && <span style={styles.redDot}></span>}
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
    background: "#fdfdfd",
    borderRight: "1px solid #e5e5e5",
    paddingTop: "8px",
    transition: "all 0.25s ease",
    zIndex: 2000,
    overflowY: "auto",
  },
  header: {
    display: "flex",
    alignItems: "center",
    padding: "6px 10px",
    marginBottom: "8px",
  },
  hamburger: {
    background: "transparent",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    color: "#555",
  },
  list: {
    listStyle: "none",
    padding: "0 8px",
    margin: 0,
  },
  item: {
    marginBottom: "4px",
  },
  link: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 8px",
    fontSize: "13px",
    textDecoration: "none",
    color: "#333",
    borderRadius: "6px",
  },
  active: {
    background: "#e0f2ef",
    color: "#0b8a6d",
    fontWeight: 600,
  },
  number: {
    fontSize: "12px",
    fontWeight: 600,
    width: "16px",
    textAlign: "right",
    opacity: 0.6,
  },
  dividerOpen: {
    padding: "4px 4px",
    margin: "6px 0",
    color: "#999",
    fontSize: "12px",
    borderBottom: "1px solid #ddd",
  },
  dividerClosed: {
    padding: "4px 0",
    textAlign: "center",
    color: "#bbb",
    fontSize: "10px",
  },
  redDot: {
    width: "6px",
    height: "6px",
    background: "red",
    borderRadius: "50%",
    marginLeft: "auto",
  },
};
