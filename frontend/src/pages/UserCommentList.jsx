import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

export default function UserCommentList() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchParams] = useSearchParams();
  const userId = searchParams.get("userId");

  // ⭐ 페이징 상태
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const size = 10;

  // 🔥 userId(검색 조건) 변경되면 page 초기화
  useEffect(() => {
    setPage(0);
  }, [userId]);

  // 🔥 검색 실행
  useEffect(() => {
    if (!userId) return;

    const load = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/comments/search`, {
          params: { userId, page, size },
        });

        setComments(res.data.content);
        setTotalPages(res.data.totalPages);
      } catch (err) {
        console.error("댓글 검색 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [userId, page]);

  if (loading) return <div style={styles.loading}>불러오는 중...</div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>{userId}님의 작성 댓글</h2>

      {comments.length === 0 ? (
        <p style={styles.noResult}>댓글이 없습니다.</p>
      ) : (
        <>
          <div style={styles.list}>
            {comments.map((c) => (
              <Link
                to={`/board/${c.boardNo}`}
                key={c.commentNo}
                style={styles.item}
              >
                <div style={styles.info}>
                  <p style={styles.content}>{c.content}</p>

                  <p style={styles.metaRow}>
                    <span style={styles.writer}>{c.nickName}</span>
                    <span style={styles.dot}>•</span>
                    <span>{new Date(c.createdDate).toLocaleString()}</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* ⭐⭐ 페이징 UI ⭐⭐ */}
          <div style={styles.pagination}>
            <button
              disabled={page === 0}
              onClick={() => setPage((prev) => prev - 1)}
              style={styles.pageBtn}
            >
              ← 이전
            </button>

            <span style={styles.pageInfo}>
              {page + 1} / {totalPages}
            </span>

            <button
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((prev) => prev + 1)}
              style={styles.pageBtn}
            >
              다음 →
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    marginTop: "10px",
    padding: "10px 20px",
  },
  title: {
    fontSize: "16px",
    marginBottom: "20px",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  item: {
    display: "block",
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "12px",
    textDecoration: "none",
    color: "#333",
  },
  info: {
    flex: 1,
  },
  content: {
    fontSize: "14px",
    marginBottom: "6px",
  },
  metaRow: {
    display: "flex",
    gap: "6px",
    fontSize: "12px",
    color: "#777",
    flexWrap: "wrap",
  },
  writer: {
    fontWeight: "500",
  },
  dot: {
    color: "#bbb",
  },
  loading: {
    marginTop: "100px",
    textAlign: "center",
    fontSize: "18px",
  },
  noResult: {
    fontSize: "16px",
    color: "#777",
  },
  pagination: {
    textAlign: "center",
    marginTop: "10px",
  },
  pageBtn: {
    padding: "4px 10px",
    margin: "0 8px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    cursor: "pointer",
    background: "#f9f9f9",
  },
  pageInfo: {
    margin: "0 12px",
  },
};
