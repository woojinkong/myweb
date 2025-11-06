import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

export default function BoardList() {
  const [boards, setBoards] = useState([]);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const category = searchParams.get("category") || "notice"; // ✅ 기본값 설정

  const categoryNameMap = {
  free: "자유게시판",
  notice: "공지사항",
  inform: "정보게시판",
};

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const res = await axiosInstance.get(`/board?category=${category}`); // ✅ 카테고리 적용
        setBoards(res.data);
      } catch (err) {
        console.error("게시글 불러오기 실패:", err);
      }
    };
    fetchBoards();

    // ✅ 브라우저 focus 시에도 새로고침
    window.addEventListener("focus", fetchBoards);
    return () => window.removeEventListener("focus", fetchBoards);
  }, [category]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>📋 게시글 목록 ({categoryNameMap[category] || "전체"})</h2>
        <Link to="/board/write" style={styles.writeButton}>
          ✏️ 새 글 작성
        </Link>
      </div>

      <div style={{ marginBottom: "20px" }}>
        {/* ✅ 카테고리 탭 */}
        <button onClick={() => navigate("/board?category=notice")}>공지</button>
        <button onClick={() => navigate("/board?category=free")}>자유</button>
        <button onClick={() => navigate("/board?category=inform")}>정보</button>
      </div>

      {boards.length > 0 ? (
        <div style={styles.grid}>
          {boards.map((board) => (
            <div key={board.boardNo} style={styles.card} onClick={() => navigate(`/board/${board.boardNo}`)}>
              <div style={styles.thumbnailBox}>
                {board.imagePath ? (
                  <img
                    src={`http://localhost:8080${board.imagePath}`}
                    alt="썸네일"
                    style={styles.thumbnail}
                  />
                ) : (
                  <div style={styles.noImage}>이미지 없음</div>
                )}
              </div>
              <div style={styles.cardContent}>
                <h3 style={styles.boardTitle}>
                  {board.title}{" "}
                  <span style={styles.commentCount}>[{board.commentCount}]</span>
                </h3>
                <p style={styles.writer}>👤 {board.userId}</p>
                <p style={styles.date}>
                  🕓 {new Date(board.createdDate).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p style={styles.noData}>게시글이 없습니다.</p>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "50px auto",
    padding: "30px",
    backgroundColor: "#f8f9fa",
    borderRadius: "12px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    maxWidth: "1000px",
    marginBottom: "25px",
    borderBottom: "2px solid #ddd",
    paddingBottom: "10px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#333",
  },
  writeButton: {
    padding: "10px 18px",
    background: "#4CAF50",
    color: "#fff",
    borderRadius: "6px",
    textDecoration: "none",
    fontWeight: "bold",
    transition: "background 0.3s",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "24px",
    justifyContent: "center",
    width: "100%",
    maxWidth: "1000px",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "10px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    cursor: "pointer",
  },
  thumbnailBox: {
    width: "100%",
    height: "200px",
    backgroundColor: "#f1f1f1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  cardContent: {
    padding: "15px",
  },
  boardTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "8px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  writer: {
    fontSize: "14px",
    color: "#555",
    marginBottom: "4px",
  },
  date: {
    fontSize: "13px",
    color: "#888",
  },
  noData: {
    textAlign: "center",
    color: "#777",
    fontSize: "16px",
    marginTop: "30px",
  },
  commentCount: {
    color: "#007BFF",
    fontSize: "15px",
    fontWeight: "500",
    marginLeft: "4px",
  },
};
