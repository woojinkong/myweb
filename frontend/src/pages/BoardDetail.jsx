import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import useAuth from "../hooks/useAuth";
import CommentSection from "./CommentSection";
import UserProfilePopup from "./UserProfilepopup";
import { colors, buttons, cardBase } from "../styles/common";
import { Helmet } from "react-helmet-async";
import { fetchSiteName } from "../api/siteApi";

export default function BoardDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [board, setBoard] = useState(null);
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [popupUserId, setPopupUserId] = useState(null);
  const [siteTitle, setSiteTitle] = useState("KongHome");
  const BASE_URL = import.meta.env.VITE_API_URL;


    useEffect(() => {
      const loadSiteName = async () => {
      try {
        const name = await fetchSiteName();
        setSiteTitle(name);
      } catch (err) {
        console.error("사이트 이름 로드 실패:", err);
      }
    };
    loadSiteName();
  }, []);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get(`/board/${id}`);
        const data = res.data;

        // ⭐ 본문(content) 내 모든 이미지 경로를 BASE_URL + 상대경로 로 변환
         const fixedContent = data.content.replace(
           /src="\/uploads\//g,
           `src="${BASE_URL}/uploads/`
         );

         setBoard({
           ...data,
           content: fixedContent,
         });

        console.log("📌 board content:", data.content);

        // 좋아요 정보
        const likeRes = await axiosInstance.get(`/board/like/${id}`);
        setLikeCount(likeRes.data.count);
        setLiked(likeRes.data.liked);
      } catch (err) {
        console.error("게시글 불러오기 실패:", err);
        alert("게시글을 불러올 수 없습니다.");
        navigate("/board");
      }
    };

    fetchData();
  }, [id, navigate, BASE_URL]);

  // 좋아요
  const handleLike = async () => {
    try {
      const res = await axiosInstance.post(`/board/like/${id}`);
      const newLiked = res.data;

      setLiked(newLiked);
      setLikeCount((prev) => (newLiked ? prev + 1 : prev - 1));
    } catch (err) {
      alert("로그인이 필요합니다.",err);
    }
  };

  // 삭제
  const handleDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      await axiosInstance.delete(`/board/${id}`);
      alert("삭제되었습니다.");
      navigate(`/board?groupId=${board.groupId}`);

    } catch (err) {
      console.error(err);
      alert("삭제 중 오류.");
    }
  };


  // 신고 기능
const handleReport = async () => {
  const reason = prompt("신고 사유를 입력하세요:");
  if (!reason) return;

  try {
    await axiosInstance.post(`/board/report/${id}`, { reason });
    alert("신고가 접수되었습니다.");
  } catch (err) {
    console.error("신고 실패:", err);
    alert("신고 중 오류가 발생했습니다.");
  }
};


  if (!board)
    return <p style={styles.loading}>⏳ 게시글을 불러오는 중...</p>;

  return (
    <>
      {/* ----------------------------- */}
      {/*     🧠 SEO META 설정 부분      */}
      {/* ----------------------------- */}
      <Helmet>
        <title>{`${board.title} | ${siteTitle}`}</title>

        {/* 설명 텍스트 HTML 제거 + 공백 정리 */}
          <meta
            name="description"
            content={
              board.content
                .replace(/<[^>]+>/g, " ")
                .replace(/\s+/g, " ")
                .trim()
                .slice(0, 150)
            }
          />

        <meta property="og:title" content={board.title} />
        <meta
          property="og:description"
          content={board.content.replace(/<[^>]+>/g, "").slice(0, 150)}
        />
        <meta property="og:url" content={`${window.location.origin}/board/${id}`} />
        <meta property="og:type" content="article" />

        {board.firstImage && (
          <meta property="og:image" content={`${BASE_URL}${board.firstImage}`} />
        )}
      </Helmet>
    
    <div
      style={{
        ...cardBase,
        maxWidth: "900px",
        margin: "50px auto",
        padding: "30px",
        position: "relative",
      }}
    >
      <div style={styles.titleRow}>
        <h2 style={styles.title}>{board.title}</h2>
        <button style={styles.reportBtn} onClick={handleReport}>
          🚨 신고
        </button>
      </div>


      {/* 작성자 정보 */}
      <div style={styles.metaBox}>
        <img
          src={
            board.profileUrl
              ? `${BASE_URL}${board.profileUrl}`
              : "/default-profile.png"
          }
          alt="프로필"
          onClick={(e) => setPopupUserId({
          id: board.userId,
          x: e.clientX,
          y: e.clientY
        })}
          style={styles.profileImg}
          onError={(e) => (e.target.src = "/default-profile.png")}
        />

        <div style={styles.metaText}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <p style={styles.writer}>{board.userId}</p>
            {/* <button
              onClick={() => setShowProfile((prev) => !prev)}
              style={styles.profileBtn}
            >
              👤
            </button> */}
          </div>

          <p style={styles.date}>
            🕓 {new Date(board.createdDate).toLocaleString()} | 👁{" "}
            {board.viewCount}
          </p>
        </div>
      </div>

      {/* 프로필 팝업 */}
      {popupUserId && (
        <UserProfilePopup
          userId={popupUserId.id}
          position={{ x: popupUserId.x, y: popupUserId.y }}
          onClose={() => setPopupUserId(null)}
        />
      )}

      {/* 좋아요 */}
      <button onClick={handleLike} style={styles.likeButton}>
        {liked ? "❤️" : "🤍"} {likeCount}
      </button>

      {/* 본문 */}
      <div
        className="board-content"
        style={styles.contentBox}
        dangerouslySetInnerHTML={{ __html: board.content }}
      />

      {/* 댓글 */}
      {board.allowComment ? (
        <CommentSection boardId={Number(id)} setPopupUserId={setPopupUserId} />
      ) : (
        <p style={{ color: "#888", marginTop: "20px" }}>
          🚫 댓글이 허용되지 않은 게시판입니다.
        </p>
      )}

      {/* 버튼 영역 */}
      <div style={styles.buttons}>
        <Link to={`/board?groupId=${board.groupId}`} style={{ ...buttons.outline, textDecoration: "none" }}>
          🔙 목록
        </Link>

        {user && (user.userId === board.userId || user.role === "ADMIN") && (
          <>
            <button
              onClick={() => navigate(`/board/edit/${board.boardNo}`)}
              style={buttons.secondary}
            >
              ✏️ 수정
            </button>
            <button onClick={handleDelete} style={buttons.danger}>
              🗑 삭제
            </button>
          </>
        )}
      </div>
    </div>
    </>
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
    cursor: "pointer",   // ← 마우스를 손가락 모양으로 변경
  },
  metaText: {
    display: "flex",
    flexDirection: "column",
  },
  writer: {
    fontSize: "16px",
    fontWeight: "600",
    color: colors.text.main,
  },
  profileBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "18px",
  },
  date: {
    fontSize: "13px",
    color: colors.text.light,
  },
  likeButton: {
    ...buttons.outline,
    padding: "6px 12px",
    marginBottom: "15px",
  },
  contentBox: {
    backgroundColor: colors.background.page,
    borderRadius: "8px",
    padding: "20px",
    fontSize: "16px",
    lineHeight: "1.7",
    wordBreak: "break-word",
     /* ⭐ 추가 */
     overflowX: "auto",         // 너무 큰 이미지면 가로 스크롤
  },
  buttons: {
    marginTop: "30px",
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
  },
  loading: {
    textAlign: "center",
    marginTop: "60px",
    color: colors.text.light,
  },
  titleRow: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "15px",
},

reportBtn: {
  background: "transparent",
  border: "1px solid #ff4d4d",
  color: "#ff4d4d",
  padding: "5px 10px",
  fontSize: "12px",
  borderRadius: "5px",
  cursor: "pointer",
},



};
