import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import axiosInstance from "../api/axiosInstance";
import { cardBase, colors } from "../styles/common";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    todayUsers: 0,
    todayVisits: 0,
    totalBoards: 0,
    activeUsers: 0
  });

  // 🚫 관리자 체크
  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      alert("관리자만 접근 가능합니다.");
      navigate("/");
    }
  }, [user, navigate]);

  // 📊 통계 불러오기
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axiosInstance.get("/admin/stats");
        setStats(res.data);
      } catch (err) {
        console.error("통계 불러오기 실패:", err);
      }
    };
    fetchStats();
  }, []);

  //접속자확인
  useEffect(() => {
  const load = async () => {
    const [statsRes, activeRes] = await Promise.all([
      axiosInstance.get("/admin/stats"),
      axiosInstance.get("/admin/active-users")
    ]);

    setStats({
      ...statsRes.data,
      activeUsers: activeRes.data
    });
  };
  load();
}, []);

  // 🌟 관리자 기능 목록 정의
  const menuItems = [
    {
      title: "회원 관리",
      icon: "👥",
      action: () => navigate("/admin/users"),
      color: "#007bff",
    },
    {
      title: "게시판 관리",
      icon: "📋",
      action: () => navigate("/admin/board-groups"),
      color: "#17a2b8",
    },
    {
      title: "신고된 게시글",
      icon: "🚨",
      action: () => navigate("/admin/reports"),
      color: "#ffc107",
    },
    {
      title: "전체 게시글 삭제",
      icon: "🗑",
      action: async () => {
        if (!window.confirm("정말 전체 게시글을 삭제할까요?")) return;
        try {
          await axiosInstance.delete("/admin/boards");
          alert("전체 게시글 삭제 완료!");
          window.location.reload();
        } catch (err) {
          alert("삭제 중 오류 발생!",err);
        }
      },
      color: "#dc3545",
    },
  ];

  return (
    <div style={{ ...cardBase, maxWidth: "1000px", margin: "60px auto", padding: "40px" }}>
      <h2 style={{ fontSize: "26px", fontWeight: "700", color: colors.text.main, marginBottom: "25px" }}>
        👑 관리자 대시보드
      </h2>

      {/* 🔹 통계 카드 */}
      <div style={styles.statsGrid}>
        <div style={styles.card}>
          <p style={styles.cardTitle}>오늘 가입한 회원</p>
          <h3 style={styles.cardValue}>{stats.todayUsers}</h3>
        </div>
        <div style={styles.card}>
          <p style={styles.cardTitle}>오늘 방문자</p>
          <h3 style={styles.cardValue}>{stats.todayVisits}</h3>
        </div>
        <div style={styles.card}>
          <p style={styles.cardTitle}>총 게시글 수</p>
          <h3 style={styles.cardValue}>{stats.totalBoards}</h3>
        </div>
        <div style={styles.card}>
        <p style={styles.cardTitle}>현재 접속 중</p>
        <h3 style={styles.cardValue}>{stats.activeUsers}</h3>
       </div>

      </div>

      {/* 🔹 기능 메뉴 (Grid) */}
      <h3 style={{ marginTop: "40px", marginBottom: "15px", color: "#444" }}>
        📌 관리자 기능
      </h3>

      <div style={styles.menuGrid}>
        {menuItems.map((item, idx) => (
          <div
            key={idx}
            style={{ ...styles.menuCard, borderTop: `3px solid ${item.color}` }}
            onClick={item.action}
          >
            <span style={styles.menuIcon}>{item.icon}</span>
            <p style={styles.menuTitle}>{item.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
  },
  card: {
    background: "#ffffff",
    borderRadius: "10px",
    padding: "20px",
    textAlign: "center",
    boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
  },
  cardTitle: {
    fontSize: "15px",
    color: "#666",
    marginBottom: "6px",
  },
  cardValue: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#333",
  },

  menuGrid: {
    marginTop: "10px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "16px",
  },
  menuCard: {
    background: "white",
    padding: "18px",
    borderRadius: "10px",
    boxShadow: "0 3px 10px rgba(0,0,0,0.05)",
    cursor: "pointer",
    transition: "0.2s",
    textAlign: "center",
  },
  menuIcon: {
    fontSize: "30px",
  },
  menuTitle: {
    marginTop: "10px",
    fontSize: "16px",
    fontWeight: "600",
    color: "#444",
  },
};
