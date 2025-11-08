import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import axiosInstance from "../api/axiosInstance";
import { cardBase, buttons, colors } from "../styles/common";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    todayUsers: 0,
    todayVisits: 0,
    totalBoards: 0,
  });

  // ✅ 관리자 아닌 경우 접근 차단
  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      alert("관리자만 접근 가능합니다.");
      navigate("/");
    }
  }, [user, navigate]);

  // ✅ 통계 불러오기
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

  return (
    <div style={{ ...cardBase, maxWidth: "900px", margin: "60px auto", padding: "40px" }}>
      <h2 style={{ fontSize: "22px", fontWeight: "700", color: colors.text.main, marginBottom: "25px" }}>
        👑 관리자 대시보드
      </h2>

      {/* ✅ 통계 카드 */}
      <div style={styles.statsGrid}>
        <div style={styles.card}>
          <p style={styles.cardTitle}>오늘 가입한 회원</p>
          <h3 style={styles.cardValue}>{stats.todayUsers}</h3>
        </div>
        <div style={styles.card}>
          <p style={styles.cardTitle}>오늘 방문한 회원</p>
          <h3 style={styles.cardValue}>{stats.todayVisits}</h3>
        </div>
        <div style={styles.card}>
          <p style={styles.cardTitle}>총 게시글 수</p>
          <h3 style={styles.cardValue}>{stats.totalBoards}</h3>
        </div>
      </div>

      {/* ✅ 기능 버튼 */}
      <div style={{ marginTop: "40px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <button
          onClick={() => navigate("/admin/users")}
          style={{ ...buttons.primary, fontSize: "15px", padding: "10px" }}
        >
          👥 회원 관리
        </button>
        
      </div>
    </div>
  );
}

const styles = {
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
  },
  card: {
    background: "#f8f9fa",
    borderRadius: "10px",
    padding: "20px",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  cardTitle: {
    fontSize: "15px",
    color: "#666",
    marginBottom: "8px",
  },
  cardValue: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#333",
  },
};
