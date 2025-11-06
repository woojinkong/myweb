import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

export default function Home() {
  const [boards, setBoards] = useState({
    notice: [],
    free: [],
    inform: [],
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBoardsByCategory = async (category) => {
      try {
        const res = await axiosInstance.get(`/board?category=${category}`);
        // 최신순 정렬 후 상위 5개만
        return res.data
          .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))
          .slice(0, 5);
      } catch (err) {
        console.error(`${category} 게시글 불러오기 실패:`, err);
        return [];
      }
    };

    const fetchAll = async () => {
      const [notice, free, inform] = await Promise.all([
        fetchBoardsByCategory("notice"),
        fetchBoardsByCategory("free"),
        fetchBoardsByCategory("inform"),
      ]);
      setBoards({ notice, free, inform });
    };

    fetchAll();
  }, []);

  const renderSection = (title, category, list, icon) => (
    <section key={category} style={styles.section}>
      <div style={styles.header}>
        <h2 style={styles.sectionTitle}>
          <span style={{ marginRight: "8px" }}>{icon}</span> {title}
        </h2>
        <Link to={`/board?category=${category}`} style={styles.moreBtn}>
          더보기 →
        </Link>
      </div>

      {list.length > 0 ? (
        <ul style={styles.list}>
          {list.map((board) => (
            <li
              key={board.boardNo}
              style={styles.listItem}
              onClick={() => navigate(`/board/${board.boardNo}`)}
            >
              <div style={styles.thumbBox}>
                {board.imagePath ? (
                  <img
                    src={`http://localhost:8080${board.imagePath}`}
                    alt="썸네일"
                    style={styles.thumbnail}
                  />
                ) : (
                  <div style={styles.noThumb}>No Image</div>
                )}
              </div>

              <div style={styles.textBox}>
                <h3 style={styles.title}>{board.title}</h3>
                <div style={styles.meta}>
                  <span>👤 {board.userId}</span>
                  <span>🕓 {new Date(board.createdDate).toLocaleDateString()}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p style={styles.noData}>게시글이 없습니다.</p>
      )}
    </section>
  );

  return (
    <div style={styles.container}>
      <div style={styles.grid} className="home-grid">
        {renderSection("공지사항", "notice", boards.notice, "📢")}
        {renderSection("자유게시판", "free", boards.free, "💬")}
        {renderSection("정보게시판", "inform", boards.inform, "ℹ️")}
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: "100%",
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "20px 20px",
    boxSizing: "border-box", // ✅ 꼭 추가!
  },

  // ✅ 반응형 3→2→1열 고정
  grid: {
    width: "100%",
  },

  // ✅ 미디어쿼리 대신 JS로 대응
  "@media (max-width: 1400px)": {
    grid: {
      gridTemplateColumns: "repeat(2, 1fr)",
    },
  },
  "@media (max-width: 900px)": {
    grid: {
      gridTemplateColumns: "repeat(1, 1fr)",
    },
  },

  // ✅ 카드 높이 통일 + 정렬 유지
  section: {
    background: "#fff",
    padding: "20px 25px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: "400px", // ✅ 카드 높이 통일
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },

  sectionTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#333",
    display: "flex",
    alignItems: "center",
  },

  moreBtn: {
    color: "#4CAF50",
    fontWeight: "600",
    textDecoration: "none",
  },

  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    flexGrow: 1,
  },

  listItem: {
    display: "flex",
    alignItems: "center",
    padding: "8px 0",
    borderBottom: "1px solid #eee",
    cursor: "pointer",
    transition: "background 0.2s",
  },

  thumbBox: {
    width: "60px",
    height: "60px",
    borderRadius: "6px",
    overflow: "hidden",
    background: "#f1f1f1",
    flexShrink: 0,
  },

  thumbnail: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  noThumb: {
    width: "100%",
    height: "100%",
    fontSize: "12px",
    color: "#aaa",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  textBox: {
    marginLeft: "12px",
    flex: 1,
  },

  title: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#333",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  meta: {
    fontSize: "12px",
    color: "#777",
    display: "flex",
    justifyContent: "space-between",
  },

  noData: {
    textAlign: "center",
    color: "#aaa",
    fontSize: "14px",
    marginTop: "15px",
  },
};

