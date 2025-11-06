import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

export default function CommentSection({ boardId }) {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [replyTarget, setReplyTarget] = useState(null); // 대댓글 대상

  // ✅ 댓글 목록 불러오기
  const fetchComments = async () => {
    try {
      const res = await axiosInstance.get(`/comments`, {
        params: { boardNo: boardId },
      });
      setComments(res.data);
    } catch (err) {
      console.error("댓글 불러오기 실패:", err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [boardId]);

  // ✅ 댓글 작성 or 대댓글 작성
  const handleSubmit = async () => {
    if (!content.trim()) return alert("내용을 입력하세요!");

    try {
      await axiosInstance.post(`/comments/${boardId}`, {
        content,
        parentId: replyTarget, // null이면 일반 댓글, 아니면 대댓글
      });
      setContent("");
      setReplyTarget(null);
      fetchComments();
    } catch (err) {
      console.error("댓글 등록 실패:", err);
      alert("로그인이 필요합니다.");
    }
  };

  // ✅ 댓글 삭제
  const handleDelete = async (commentNo) => {
    if (!window.confirm("댓글을 삭제하시겠습니까?")) return;
    try {
      await axiosInstance.delete(`/comments/${commentNo}`);
      fetchComments();
    } catch (err) {
      console.error("댓글 삭제 실패:", err);
    }
  };

  // ✅ 댓글 렌더링 (재귀)
  const renderComment = (comment, depth = 0) => (
    <div key={comment.commentNo} style={{ marginLeft: depth * 20, marginBottom: "10px" }}>
      <div style={{ background: "#fff", borderRadius: 6, padding: "8px 12px", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
        <strong>{comment.userId}</strong>
        <p style={{ margin: "5px 0" }}>{comment.content}</p>
        <small>{new Date(comment.createdDate).toLocaleString()}</small>
        <div style={{ marginTop: 5 }}>
          <button
            onClick={() => setReplyTarget(comment.commentNo)}
            style={{ marginRight: 5 }}
          >
            답글
          </button>
          <button onClick={() => handleDelete(comment.commentNo)}>삭제</button>
        </div>
      </div>

      {/* 대댓글 재귀 */}
      {comment.children &&
        comment.children.map((child) => renderComment(child, depth + 1))}
    </div>
  );

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>💬 댓글</h3>

      <div style={styles.form}>
        <textarea
          style={styles.textarea}
          placeholder={
            replyTarget
              ? "대댓글을 입력하세요..."
              : "댓글을 입력하세요..."
          }
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div>
          {replyTarget && (
            <button
              style={styles.cancelBtn}
              onClick={() => setReplyTarget(null)}
            >
              취소
            </button>
          )}
          <button style={styles.submitBtn} onClick={handleSubmit}>
            등록
          </button>
        </div>
      </div>

      {/* 댓글 목록 */}
      <div style={{ marginTop: "20px" }}>
        {comments.length > 0 ? (
          comments.map((comment) => renderComment(comment))
        ) : (
          <p>댓글이 없습니다.</p>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    marginTop: "30px",
    padding: "15px",
    background: "#f8f9fa",
    borderRadius: "10px",
  },
  title: {
    marginBottom: "10px",
    fontSize: "18px",
    fontWeight: "600",
  },
  form: {
    marginBottom: "10px",
  },
  textarea: {
    width: "100%",
    height: "80px",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    resize: "none",
  },
  submitBtn: {
    background: "#4CAF50",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: "4px",
    cursor: "pointer",
    marginTop: "5px",
  },
  cancelBtn: {
    background: "#aaa",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: "4px",
    cursor: "pointer",
    marginTop: "5px",
    marginRight: "5px",
  },
};
