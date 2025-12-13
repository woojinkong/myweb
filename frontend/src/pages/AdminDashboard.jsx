import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import axiosInstance from "../api/axiosInstance";
import { cardBase, colors } from "../styles/common";
import VisitsChart from "../components/charts/VisitChart";
export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [adStatus, setAdStatus] = useState([]);

  const [stats, setStats] = useState({
    todayUsers: 0,
    todayVisits: 0,
    totalBoards: 0,
    activeUsers: 0
  });
  // 🔥 추가: 방문자 차트 관련 상태
  const [visitRange, setVisitRange] = useState("daily");   // "daily" | "weekly" | "monthly"
  const [visitChartData, setVisitChartData] = useState([]); // 차트에 넘길 데이터

  // ⭐ 사이트 이름 관리
  const [siteName, setSiteName] = useState("");
  const [editName, setEditName] = useState("");

  // 🚫 관리자 체크
  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      alert("관리자만 접근 가능합니다.");
      navigate("/");
    }
  }, [user, navigate]);

  // 📌 사이트 이름 로드
  useEffect(() => {
    const loadName = async () => {
      try {
        const res = await axiosInstance.get("/site/name");
        setSiteName(res.data);
        setEditName(res.data);
      } catch (err) {
        console.error("사이트 이름 불러오기 실패:", err);
      }
    };
    loadName();
  }, []);

  // 📌 사이트 이름 저장
  const updateName = async () => {
    if (!editName.trim()) return alert("값을 입력하세요!");

    try {
      await axiosInstance.put("/site/name", { siteName: editName });
      alert("사이트 이름이 변경되었습니다.");
      setSiteName(editName);
    } catch (err) {
      alert("변경 실패!");
      console.error(err);
    }
  };

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

  // 접속자 확인
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

      useEffect(() => {
      const loadAdStatus = async () => {
        try {
          const top = await axiosInstance.get("/ads/AD_TOP");
          const bottom = await axiosInstance.get("/ads/AD_BOTTOM");
          setAdStatus([
            { ...top.data, label: "본문 상단 광고" },
            { ...bottom.data, label: "본문 하단 광고" }
          ]);
        } catch (err) {
          console.error("광고 상태 불러오기 실패:", err);
        }
      };
      loadAdStatus();
    }, []);


    // 📊 방문자 통계 (일/주/월) 불러오기
    useEffect(() => {
      const fetchVisitStats = async () => {
        try {
          // range에 따라 엔드포인트를 다르게 호출
          const urlMap = {
            daily: "/admin/stats/daily",
            weekly: "/admin/stats/weekly",
            monthly: "/admin/stats/monthly",
          };

          const res = await axiosInstance.get(urlMap[visitRange]);
          setVisitChartData(res.data); // 배열 형태 [{ label: "...", count: 숫자 }, ...] 라고 가정
        } catch (err) {
          console.error("방문자 통계 불러오기 실패:", err);
        }
      };

  fetchVisitStats();
}, [visitRange]);



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
    title: "IP 차단 관리",
    icon: "🚫",
    action: () => navigate("/admin/ip-block"),
    color: "#d9534f",
    },
    {
    title: "방문 유입 로그",
    icon: "📊",
    action: () => navigate("/admin/visit-logs"),
    color: "#20c997",
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
          alert("삭제 중 오류 발생!", err);
        }
      },
      color: "#dc3545",
    },
    {
      title: "광고 관리",
      icon: "📢",
      action: () => navigate("/admin/adsetting"),
      color: "#6f42c1",
  },
  ];

  return (
    <div style={{ ...cardBase, maxWidth: "1000px", margin: "60px auto", padding: "40px" }}>
      <h2 style={{ fontSize: "26px", fontWeight: "700", color: colors.text.main, marginBottom: "25px" }}>
        👑 관리자 대시보드
      </h2>

      {/* 🔥 🔥 🔥 사이트 이름 설정 UI (추가됨) */}
      <div style={{
        padding: "20px",
        background: "#f9f9f9",
        borderRadius: "10px",
        marginBottom: "30px",
        border: "1px solid #ddd"
      }}>
        <h3 style={{ marginBottom: "10px" }}>🏷️ 사이트 이름 설정</h3>

        <p style={{ marginBottom: "8px" }}>
          현재 사이트 이름: <strong>{siteName}</strong>
        </p>

        <input
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          style={{
            width: "250px",
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            marginRight: "10px"
          }}
        />

        <button
          onClick={updateName}
          style={{
            padding: "8px 14px",
            background: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          저장
        </button>
      </div>
      {/* 🔥 사이트 이름 설정 끝 */}

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
        {/* 🔥 방문자 차트 섹션 추가 */}
        <div style={{ marginTop: "40px", padding: "20px", background: "#f9f9f9", borderRadius: "10px" }}>
          <h3 style={{ marginBottom: "15px" }}>📈 방문자 추이</h3>

          {/* 탭/버튼으로 일/주/월 전환 */}
          <div style={{ marginBottom: "15px" }}>
            <button
              onClick={() => setVisitRange("daily")}
              style={{
                marginRight: "8px",
                padding: "6px 12px",
                borderRadius: "6px",
                border: visitRange === "daily" ? "2px solid #4CAF50" : "1px solid #ccc",
                background: visitRange === "daily" ? "#e8f5e9" : "white",
                cursor: "pointer",
              }}
            >
              일별
            </button>
            <button
              onClick={() => setVisitRange("weekly")}
              style={{
                marginRight: "8px",
                padding: "6px 12px",
                borderRadius: "6px",
                border: visitRange === "weekly" ? "2px solid #4CAF50" : "1px solid #ccc",
                background: visitRange === "weekly" ? "#e8f5e9" : "white",
                cursor: "pointer",
              }}
            >
              주별
            </button>
            <button
              onClick={() => setVisitRange("monthly")}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                border: visitRange === "monthly" ? "2px solid #4CAF50" : "1px solid #ccc",
                background: visitRange === "monthly" ? "#e8f5e9" : "white",
                cursor: "pointer",
              }}
            >
              월별
            </button>
          </div>

          {/* 실제 차트 */}
          <VisitsChart range={visitRange} data={visitChartData} />
        </div>  

      <div style={{ marginTop: "40px" }}>
        <h3 style={{ marginBottom: "15px" }}>📢 광고 상태</h3>
        {adStatus.map((ad) => (
          <div key={ad.position} style={styles.card}>
            <p style={styles.cardTitle}>{ad.label}</p>
            <p style={{ color: ad.enabled ? "green" : "red" }}>
              {ad.enabled ? "활성화됨" : "비활성화됨"}
            </p>
            {ad.imageUrl && (
              <img src={ad.imageUrl} alt="" style={{ width: "200px", borderRadius: "6px" }} />
            )}
          </div>
        ))}
      </div>


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
