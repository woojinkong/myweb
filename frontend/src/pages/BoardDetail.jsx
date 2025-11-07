import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import useAuth from "../hooks/useAuth";
import CommentSection from "./CommentSection";
import { colors, buttons, cardBase } from "../styles/common"; // ✅ 공통 스타일 적용

export default function BoardDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [board, setBoard] = useState(null);
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const boardRes = await axiosInstance.get(`/board/${id}`);
        setBoard(boardRes.data);

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
    <div style={{ ...cardBase, maxWidth: "900px", margin: "50px auto", padding: "30px" }}>
      {/* ✅ 제목 */}
      <h2 style={styles.title}>{board.title}</h2>

      {/* ✅ 작성자 프로필 + 정보 */}
      <div style={styles.metaBox}>
        <img
          src={
            board.profileUrl
              ? `http://localhost:8080${board.profileUrl}`
              : "/default-profile.png"
          }
          alt="프로필"
          style={styles.profileImg}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/default-profile.png";
          }}
        />
        <div style={styles.metaText}>
          <p style={styles.writer}> {board.userId}</p>
          <p style={styles.date}>
            🕓 {new Date(board.createdDate).toLocaleString()} | 👁 {board.viewCount}
          </p>
        </div>
      </div>

      {/* ✅ 좋아요 버튼 */}
      <button onClick={handleLike} style={styles.likeButton}>
        {liked ? "❤️" : "🤍"} {likeCount}
      </button>

      {/* ✅ 여러 장 이미지 표시 */}
      {board.images && board.images.length > 0 ? (
        <div style={styles.imageContainer}>
          {board.images.map((img, idx) => (
            <img
              key={idx}
              src={`http://localhost:8080${img.imagePath}`}
              alt={`이미지 ${idx + 1}`}
              style={styles.image}
            />
          ))}
        </div>
      ) : (
        <p style={styles.noImage}>🖼️ 첨부된 이미지가 없습니다.</p>
      )}

      {/* ✅ 본문 내용 */}
      <div style={styles.contentBox}>
        <p style={styles.content}>{board.content}</p>
      </div>

      {/* ✅ 댓글 영역 */}
      <CommentSection boardId={Number(id)} />

      {/* ✅ 버튼 영역 */}
      <div style={styles.buttons}>
        <Link to="/board" style={{ ...buttons.outline, textDecoration: "none" }}>
          🔙 목록으로
        </Link>

        {user && user.userId === board.userId && (
          <>
            <button
              onClick={() => navigate(`/board/edit/${board.boardNo}`)}
              style={buttons.secondary}
            >
              ✏️ 수정
            </button>
            <button onClick={handleDelete} style={buttons.danger}>
              🗑️ 삭제
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  title: {
    fontSize: "26px",
    fontWeight: "700",
    marginBottom: "15px",
    color: colors.text.main,
  },
  metaBox: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "20px",
  },
  profileImg: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    border: "1px solid #ddd",
    objectFit: "cover",
  },
  metaText: {
    display: "flex",
    flexDirection: "column",
  },
  writer: {
    fontSize: "16px",
    fontWeight: "600",
    color: colors.text.main,
    marginBottom: "4px",
  },
  date: {
    color: colors.text.light,
    fontSize: "13px",
  },
  likeButton: {
    ...buttons.outline,
    padding: "6px 12px",
    fontSize: "15px",
    marginBottom: "15px",
  },
  imageContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginBottom: "20px",
  },
  image: {
    width: "100%",
    maxWidth: "380px",
    borderRadius: "10px",
    objectFit: "cover",
  },
  noImage: {
    textAlign: "center",
    color: colors.text.light,
    marginBottom: "20px",
  },
  contentBox: {
    backgroundColor: colors.background.page,
    borderRadius: "8px",
    padding: "20px",
    lineHeight: "1.6",
    minHeight: "120px",
  },
  content: {
    whiteSpace: "pre-line",
    color: colors.text.sub,
  },
  buttons: {
    marginTop: "25px",
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
  },
  loading: {
    textAlign: "center",
    color: colors.text.light,
    marginTop: "50px",
  },
};
