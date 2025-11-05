import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

export default function Home() {
  const [latestBoards, setLatestBoards] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLatestBoards = async () => {
      try {
        const res = await axiosInstance.get("/board");
        const sorted = res.data.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
        setLatestBoards(sorted.slice(0, 5)); // ✅ 최신글 5개만
      } catch (err) {
        console.error("게시글 불러오기 실패:", err);
      }
    };
    fetchLatestBoards();
  }, []);

  return (
    <div style={styles.container}>
      {/* ✅ 자유 게시판 일부 미리보기 */}
      <section style={styles.section}>
        <div style={styles.header}>
          <h2 style={styles.sectionTitle}>📰 자유 게시판</h2>
          <Link to="/board" style={styles.moreBtn}>더보기 →</Link>
        </div>

        {latestBoards.length > 0 ? (
          <ul style={styles.list}>
            {latestBoards.map((board) => (
              <li
                key={board.boardNo}
                style={styles.listItem}
                onClick={() => navigate(`/board/${board.boardNo}`)}
              >
                {/* 썸네일 */}
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

                {/* 텍스트 정보 */}
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
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "20px",
  },
  mainTitle: {
    fontSize: "28px",
    fontWeight: "700",
    textAlign: "center",
    color: "#333",
  },
  subText: {
    textAlign: "center",
    color: "#666",
    marginBottom: "40px",
  },
  section: {
    background: "#fff",
    padding: "20px 30px",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  sectionTitle: {
    fontSize: "22px",
    fontWeight: "600",
  },
  moreBtn: {
    color: "#4CAF50",
    fontWeight: "bold",
    textDecoration: "none",
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  listItem: {
    display: "flex",
    alignItems: "center",
    borderBottom: "1px solid #eee",
    padding: "10px 0",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  thumbBox: {
    width: "80px",
    height: "80px",
    background: "#ddd",
    borderRadius: "6px",
    overflow: "hidden",
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
    flex: 1,
    marginLeft: "15px",
  },
  title: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#333",
    marginBottom: "6px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  meta: {
    fontSize: "13px",
    color: "#666",
    display: "flex",
    justifyContent: "space-between",
    maxWidth: "300px",
  },
  noData: {
    textAlign: "center",
    color: "#777",
    fontSize: "16px",
    marginTop: "20px",
  },
};
