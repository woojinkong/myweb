import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import UserProfilePopup from "./UserProfilepopup";


export default function CommentSection({ boardId }) {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [replyTarget, setReplyTarget] = useState(null); // 대댓글 대상
  const [popupUserId, setPopupUserId] = useState(null);

  const [page, setPage] = useState(0);
  const [size] = useState(10);  // 원하는 대로 변경 가능
  const [hasMore, setHasMore] = useState(true);


  const BASE_URL = import.meta.env.VITE_API_URL;
  // ✅ 댓글 목록 불러오기
  const fetchComments = async () => {
    try {
      const res = await axiosInstance.get(`/comments`, {
        params: { boardNo: boardId, page, size },
      });

      const data = res.data;

    // 데이터 누적
    if (page === 0) {
      setComments(data);
    } else {
      setComments((prev) => [...prev, ...data]);
    }

    // 더 불러올 게 있는지 판단 (size보다 적으면 마지막 페이지)
     setHasMore(data.length === size);

    } catch (err) {
      console.error("댓글 불러오기 실패:", err);
    }
  };
    useEffect(() => {
    const loadCount = async () => {
      await axiosInstance.get("/comments/comments/count", {
        params: { boardNo: boardId }
      });

    };
    loadCount();
  }, [boardId]);


  useEffect(() => {
    fetchComments();
  }, [page]);

  useEffect(() => {
    setPage(0);
    setHasMore(true);
   }, [boardId]);


  // ✅ 댓글 작성 or 대댓글 작성
  const handleSubmit = async () => {
    if (!content.trim()) return alert("내용을 입력하세요!");
    try {
      await axiosInstance.post(`/comments/${boardId}`, {
        content,
        parentId: replyTarget,
      });
      setContent("");
      setReplyTarget(null);
      // ⭐ 새로 작성하면 페이지 초기화
    setPage(0);
    setHasMore(true);
    fetchComments();
    // ⭐ 직접 다시 불러오기
    } catch (err) {
      console.error("댓글 등록 실패:", err);
      const msg = err.response?.data?.message || "댓글 등록 실패!";
      alert(msg);
    }
  };

  // ✅ 댓글 삭제
  const handleDelete = async (commentNo) => {
    if (!window.confirm("댓글을 삭제하시겠습니까?")) return;
    try {
      await axiosInstance.delete(`/comments/${commentNo}`);
      setPage(0);
    } catch (err) {
      console.error("댓글 삭제 실패:", err);
    }
  };

  // ✅ 날짜 포맷
  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  // ✅ 댓글 렌더링 (재귀)
  const renderComment = (comment, depth = 0) => {
    const isReply = depth > 0;
    const depthStyles = getDepthStyles(depth);

    return (
      <div
        key={`${comment.commentNo}-${depth}`}

        className="comment-thread-item reply-depth"
        style={{
          ...styles.threadItem,
          ...depthStyles.threadItem,
        }}
      >
        {/* 대댓글 스레드 라인 */}
        {isReply && <div style={{ ...styles.threadLine, ...depthStyles.threadLine }} />}

        {/* 댓글 카드 */}
        <div className="comment-card" style={{ ...styles.card, ...depthStyles.card }}>
          <div style={styles.headerRow}>
            <div className="comment-user-id" style={styles.userRow}>
              {/* ✅ 프로필 이미지 (없으면 회색 원 표시) */}
              {comment.profileUrl ? (
                <img

                  src={`${BASE_URL}${comment.profileUrl}`}
                  alt="프로필"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "1px solid #dee2e6",
                    cursor: "pointer",        // ⭐ 손가락 모양
                  }}
                  onClick={(e) => setPopupUserId({ id: comment.userId, x: e.clientX, y: e.clientY })}
                   
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/default_profile.png"; // ✅ 로컬 fallback 이미지
                  }}
                />
              ) : (
                <div
                  style={{
                    ...styles.avatar,
                    background: depthStyles.avatarBg,
                  }}
                />
              )}

              <strong style={styles.userId}>{comment.nickName}</strong>
              {isReply && <span style={styles.replyBadge}>대댓글</span>}

              <div style={styles.actionRow}>
                  {/* depth === 0 일때만 답글 버튼 보임 */}
                    {depth === 0 && (
                      <button
                        onClick={() => setReplyTarget(comment.commentNo)}
                        style={styles.ghostBtn}
                        aria-label="답글 달기"
                      >
                        답글
                      </button>
                    )}
                  <button
                    onClick={() => handleDelete(comment.commentNo)}
                    style={{ ...styles.ghostBtn, marginLeft: 6 }}
                    aria-label="삭제"
                  >
                    삭제
                  </button>
                </div>
            </div>
            <small className="comment-date" style={styles.dateText}>{formatDate(comment.createdDate)}</small>
          </div>

          <p className="comment-content" style={styles.contentText}>{comment.content}</p>

          
        </div>

        {/* 재귀적으로 대댓글 렌더링 */}
        {comment.children &&
          comment.children.map((child) => renderComment(child, depth + 1))}
      </div>

        

    );
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>💬 댓글</h3>

      {/* 현재 답글 대상 안내 바 */}
      {replyTarget && (
        <div style={styles.replyBar}>
          <span>대댓글 작성중 • 대상 댓글번호: {replyTarget}</span>
          <button style={styles.barCloseBtn} onClick={() => setReplyTarget(null)}>
            취소
          </button>
        </div>
      )}

      {/* 입력 폼 */}
      <div style={styles.form}>
        <textarea
          style={styles.textarea}
          placeholder={replyTarget ? "대댓글을 입력하세요..." : "댓글을 입력하세요..."}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
          <button style={styles.primaryBtn} onClick={handleSubmit}>
            등록
          </button>
          {replyTarget && (
            <button style={styles.secondaryBtn} onClick={() => setReplyTarget(null)}>
              취소
            </button>
          )}
        </div>
      </div>

      {/* 댓글 목록 */}
      <div style={{ marginTop: 16 }}>
        {comments.length > 0 ? (
          comments.map((comment) => renderComment(comment))
        ) : (
          <p style={{ color: "#6c757d", margin: 0 }}>댓글이 없습니다.</p>
        )}
      </div>

        {/* 🔥 댓글 더 불러오기 버튼 — 여기 추가 */}
        {hasMore && (
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <button
              style={{
                background: "#f1f3f5",
                border: "1px solid #ced4da",
                padding: "8px 12px",
                borderRadius: 8,
                cursor: "pointer",
              }}
              onClick={() => setPage((prev) => prev + 1)}
            >
              댓글 더 불러오기 ▼
            </button>
          </div>
)}
      

      {/* 프로필 팝업 */}
      {popupUserId && (
        <UserProfilePopup 
          userId={popupUserId.id}
          position={{ x: popupUserId.x, y: popupUserId.y }}
          onClose={() => setPopupUserId(null)}
        />
      )}

    </div>

    
  );
  
}

const BASE_THREAD_COLOR = "#e9ecef";

function getDepthStyles(depth) {
  const indent = Math.min(depth, 6) * 16; // 들여쓰기
  const alpha = Math.max(0.08, 0.16 - depth * 0.02); // 깊을수록 연해짐
  return {
    threadItem: {
      marginLeft: depth === 0 ? 0 : 8,
      paddingLeft: indent + (depth > 0 ? 12 : 0),
      position: "relative",
    },
    threadLine: {
      position: "absolute",
      left: indent,
      top: 0,
      bottom: 0,
      width: 2,
      background: BASE_THREAD_COLOR,
      borderRadius: 2,
    },
    card: {
      background: `rgba(248,249,250,${alpha})`,
    },
    avatarBg: `#adb5bd`,
  };
}

const styles = {
  container: {
    width: "100%",          // ★ 추가
    boxSizing: "border-box",// ★ 추가
    marginTop: 30,
    padding: 16,
    background: "#f8f9fa",
    borderRadius: 10,
    border: "1px solid #eef1f3",
  },
  title: {
    margin: 0,
    marginBottom: 10,
    fontSize: 18,
    fontWeight: 700,
  },
  form: {
    marginBottom: 10,
  },
  textarea: {
    width: "calc(100% - 20px)",
    height: 84,
    padding: 10,
    borderRadius: 8,
    border: "1px solid #d0d7de",
    outline: "none",
    background: "#fff",
    fontSize: 14,
  },
  primaryBtn: {
    background: "#4CAF50",
    color: "#fff",
    border: "1px solid #49a04d",
    padding: "6px 12px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 14,
  },
  secondaryBtn: {
    background: "#f1f3f5",
    color: "#333",
    border: "1px solid #d0d7de",
    padding: "6px 12px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 14,
  },
  threadItem: {
    marginBottom: 10,
    maxWidth: "100%",     // ★ 추가
   boxSizing: "border-box",
  },
  card: {
    background: "#fff",
    borderRadius: 10,
    padding: "6px 12px",
    border: "1px solid #eef1f3",
    boxShadow: "0 1px 3px rgba(16,24,40,.06)",
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  userRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    minWidth: 0,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    flex: "0 0 auto",
    opacity: 0.9,
  },
  userId: {
    fontSize: 14,
    fontWeight: 600,
  },
  replyBadge: {
    fontSize: 11,
    padding: "2px 6px",
    borderRadius: 999,
    background: "#eef2ff",
    color: "#3b5bdb",
    border: "1px solid #dbe4ff",
  },
  dateText: {
    color: "#6c757d",
    fontSize: 12,
    flex: "0 0 auto",
  },
  contentText: {
    margin: "8px 0 10px 0",
    fontSize: 14,
    lineHeight: 1.5,
    whiteSpace: "pre-wrap",
  },
  actionRow: {
    display: "flex",
    gap: 6,
  },
  ghostBtn: {
    background: "#fff",
    color: "#495057",
    border: "1px solid #d0d7de",
    padding: "3px 8px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 12,
  },
  threadLine: {
    background: BASE_THREAD_COLOR,
  },
  replyBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    padding: "8px 10px",
    marginBottom: 10,
    background: "#fff",
    border: "1px solid #eef1f3",
    borderRadius: 8,
    fontSize: 13,
    color: "#495057",
  },
  barCloseBtn: {
    background: "#f8f9fa",
    border: "1px solid #d0d7de",
    padding: "4px 8px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 12,
  },
};
