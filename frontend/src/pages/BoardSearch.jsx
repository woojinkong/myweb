import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

export default function BoardSearch() {
  const location = useLocation();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const [keyword, setKeyword] = useState("");
  const [type, setType] = useState("");

  // ⭐ 페이징 관련 상태
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const size = 10;

  // -----------------------------
  // 🔥 URL 변경될 때 검색어/타입 초기화 + page 초기화
  // -----------------------------
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const keywordParam = params.get("keyword") || "";
    const typeParam = params.get("type") || "title";

    setKeyword(keywordParam);
    setType(typeParam);
    setPage(0); // 검색조건 변경 시 첫 페이지로 초기화
  }, [location.search]);

  // -----------------------------
  // 🔥 검색 실행
  // -----------------------------
  useEffect(() => {
    if (keyword.trim()) {
      fetchSearchResults(keyword, type, page);
    }
  }, [keyword, type, page]);

  const fetchSearchResults = async (keyword, type, page) => {
    setLoading(true);
    try {
      const fixedType = type === "content" ? "plain" : type;

      const response = await axiosInstance.get(`/board/search`, {
        params: { keyword, type: fixedType, page, size },
      });

      setResults(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error("검색 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={styles.loading}>검색 중...</div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>
        🔍 "{keyword}" 검색 결과 (
        {type === "title" ? "제목" : type === "content" ? "내용" : "작성자"})
      </h2>

      {results.length === 0 ? (
        <p style={styles.noResult}>검색 결과가 없습니다.</p>
      ) : (
        <>
          <div style={styles.list}>
            {results.map((board) => (
              <Link
                to={`/board/${board.boardNo}`}
                key={board.boardNo}
                style={styles.item}
              >
                {board.imagePath && (
                  <img
                    src={`${import.meta.env.VITE_API_URL}${board.imagePath}`}
                    alt="thumbnail"
                    style={styles.thumb}
                    onError={(e) => (e.target.style.display = "none")}
                  />
                )}

                <div style={styles.info}>
                  <h3 style={styles.itemTitle}>{board.title}</h3>

                   <p style={styles.metaRow}>
                    <span style={styles.writer}>{board.nickName}</span>
                    <span style={styles.dot}>•</span>
                    <span>👁 {board.viewCount}</span>
                    <span style={styles.dot}>•</span>
                    <span>💬 {board.commentCount}</span>
                    <span style={styles.dot}>•</span>
                    <span>{new Date(board.createdDate).toLocaleString()}</span>
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
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "8px",
    textDecoration: "none",
    color: "#333",
    transition: "0.2s ease",
  },
  itemTitle: {
    fontSize: "16px",
    fontWeight: "600",
    marginBottom: "4px",
  },
  info: {
    flex: 1,
  },
      metaRow: {
      display: "flex",
      gap: "6px",
      fontSize: "12px",
      color: "#777",
      flexWrap: "wrap", // 모바일 대응
    },

    dot: {
      color: "#bbb",
    },

    writer: {
      fontWeight: "500",
    },


  thumb: {
    width: "60px",
    height: "60px",
    objectFit: "cover",
    borderRadius: "6px",
    border: "1px solid #ccc",
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
