import { Link, useLocation } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import axiosInstance from "../api/axiosInstance";
import useIsMobile from "../hooks/useIsMobile";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function Sidebar({ isOpen, toggleSidebar }) {
  const location = useLocation();
  const currentGroupId = new URLSearchParams(location.search).get("groupId");
  const navigate = useNavigate();
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


      const enterBoard = async (group) => {

    // 🔗 외부 링크 게시판
    if (group.type === "LINK" && group.linkUrl) {
      window.open(group.linkUrl, "_blank", "noopener,noreferrer");
      return;
    }

    // 📘 일반 게시판
    if (!group.passwordEnabled) {
      navigate(`/board?groupId=${group.groupId}`);
      return;
    }

    const pw = prompt("🔒 게시판 비밀번호를 입력하세요");
    if (!pw) return;

    try {
      await axiosInstance.post(
        `/board-group/${group.groupId}/check-password`,
        { password: pw }
      );

      sessionStorage.setItem(`board_pw_${group.groupId}`, pw);
      sessionStorage.setItem("last_board_group", group.groupId);
      navigate(`/board?groupId=${group.groupId}`);
    } catch (err) {
      if (err.response?.status === 401) {
        alert("로그인이 필요합니다.");
        navigate("/login");
      } else {
        alert("비밀번호가 틀렸습니다.");
      }
    }
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
      className={`sidebar-container  ${isOpen ? "open" : ""}` }
      translate="no"
      style={{
        ...styles.sidebar,
        ...(isMobile ? {} : { width: isOpen ? "150px" : "50px" }),
      }}
    >
      <div style={styles.header}>
        {!isMobile && (
          <button translate="no" onClick={toggleSidebar} style={styles.hamburger}>☰</button>
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
                <button
                  onClick={() => enterBoard(group)}
                  style={{
                    ...styles.link,
                    ...getActiveStyle(id),
                    background: "none",
                    border: "none",
                    width: "100%",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  <span style={styles.number}>{number}.</span>
                  {isOpen && <span>{name}</span>}
                  {hasNew && isOpen && <span style={styles.redDot}></span>}
                </button>
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
    height: "100dvh",
    background: "#fdfdfd",
    borderRight: "1px solid #e5e5e5",
    paddingTop: "8px",
    transition: "width 0.25s ease",
    zIndex: 2000,
    overflowY: "auto",
    boxSizing: "border-box",
    overflowX: "hidden",
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
    padding: "0 8px 30px",
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
  toolSection: {
  padding: "0 8px 8px",
  marginBottom: "6px",
  borderBottom: "1px solid #eee",
},

  toolLink: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 8px",
    fontSize: "13px",
    textDecoration: "none",
    borderRadius: "6px",
    transition: "background 0.2s",
  },

  toolIcon: {
    fontSize: "14px",
    marginLeft: "3px", 
  },

};
