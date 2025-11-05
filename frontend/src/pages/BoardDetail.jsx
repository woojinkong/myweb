import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import useAuth from "../hooks/useAuth"; // ✅ 로그인 유저 확인용

export default function BoardDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // ✅ 현재 로그인한 사용자
  const [board, setBoard] = useState(null);
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);

  // ✅ 게시글 및 좋아요 정보 불러오기
  useEffect(() => {
    let didFetch = false;
    const fetchData = async () => {
      if (didFetch) return;
      didFetch = true;
      try {
        // 게시글 정보
        const boardRes = await axiosInstance.get(`/board/${id}`);
        setBoard(boardRes.data);

        // 좋아요 개수
        const likeRes = await axiosInstance.get(`/board/like/${id}`);
        setLikeCount(likeRes.data);
      } catch (err) {
        console.error("게시글 불러오기 실패:", err);
        alert("게시글을 불러올 수 없습니다.");
        navigate("/board");
      }
    };
    fetchData();
  }, [id, navigate]);

  // ✅ 좋아요 토글
  const handleLike = async () => {
    try {
      const res = await axiosInstance.post(`/board/like/${id}`);
      const newLiked = res.data;
      setLiked(newLiked);
      setLikeCount((prev) => (newLiked ? prev + 1 : prev - 1));
    } catch (err) {
      console.error("좋아요 실패:", err);
      alert("로그인이 필요합니다.");
    }
  };

  // ✅ 게시글 삭제
  const handleDelete = async () => {
    if (!window.confirm("정말 이 게시글을 삭제하시겠습니까?")) return;

    try {
      await axiosInstance.delete(`/board/${id}`);
      alert("게시글이 삭제되었습니다!");
      navigate("/board");
    } catch (err) {
      console.error(err);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  if (!board) return <p style={styles.loading}>⏳ 게시글을 불러오는 중...</p>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>{board.title}</h2>
      <p style={styles.meta}>
        👤 {board.userId} &nbsp; | &nbsp; 🕓{" "}
        {new Date(board.createdDate).toLocaleString()} &nbsp; | &nbsp; 👁{" "}
        {board.viewCount}
      </p>

      {/* ✅ 좋아요 버튼 */}
      <button onClick={handleLike} style={styles.likeButton}>
        {liked ? "❤️" : "🤍"} {likeCount}
      </button>

      {board.imagePath && (
        <img
          src={`http://localhost:8080${board.imagePath}`}
          alt="게시글 이미지"
          style={styles.image}
        />
      )}

      <div style={styles.contentBox}>
        <p style={styles.content}>{board.content}</p>
      </div>

      <div style={styles.buttons}>
        <Link to="/board" style={styles.backButton}>
          🔙 목록으로
        </Link>

        {/* ✅ 작성자일 때만 수정/삭제 버튼 표시 */}
        {user && user.userId === board.userId && (
          <>
            <button
              onClick={() => navigate(`/board/edit/${board.boardNo}`)}
              style={styles.editButton}
            >
              ✏️ 수정
            </button>
            <button onClick={handleDelete} style={styles.deleteButton}>
              🗑️ 삭제
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "800px",
    margin: "60px auto",
    background: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    marginBottom: "10px",
    color: "#333",
  },
  meta: {
    color: "#777",
    fontSize: "14px",
    marginBottom: "10px",
  },
  likeButton: {
    border: "none",
    background: "transparent",
    fontSize: "18px",
    cursor: "pointer",
    marginBottom: "15px",
  },
  image: {
    width: "100%",
    borderRadius: "10px",
    marginBottom: "20px",
  },
  contentBox: {
    backgroundColor: "#fafafa",
    borderRadius: "8px",
    padding: "20px",
    lineHeight: "1.6",
    minHeight: "120px",
  },
  content: {
    whiteSpace: "pre-line",
    color: "#444",
  },
  buttons: {
    marginTop: "25px",
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
  },
  backButton: {
    padding: "8px 16px",
    background: "#4CAF50",
    color: "#fff",
    borderRadius: "6px",
    textDecoration: "none",
  },
  editButton: {
    padding: "8px 16px",
    background: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  deleteButton: {
    padding: "8px 16px",
    background: "#DC3545",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  loading: {
    textAlign: "center",
    marginTop: "50px",
  },
};
