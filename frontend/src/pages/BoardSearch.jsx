import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

export default function BoardSearch() {
  const location = useLocation();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [type, setType] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const keywordParam = params.get("keyword") || "";
    const typeParam = params.get("type") || "title";

    setKeyword(keywordParam);
    setType(typeParam);

    if (keywordParam.trim()) {
      fetchSearchResults(keywordParam, typeParam);
    }
  }, [location.search]);

  const fetchSearchResults = async (keyword, type) => {
    try {

      // 🔥 content 검색일 때만 plain 으로 변환
      const fixedType = type === "content" ? "plain" : type;
      const response = await axiosInstance.get(`/board/search`, {
        params: { keyword, type: fixedType },
      });
      setResults(response.data);
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
        <div style={styles.list}>
          {results.map((board) => (
            <Link
              to={`/board/${board.boardNo}`}
              key={board.boardNo}
              style={styles.item}
            >
              {/* ✅ 썸네일 이미지 표시 (서버 주소 자동 연결) */}
              {board.imagePath && (
                <img
                    src={`${import.meta.env.VITE_API_URL}${board.imagePath}`}
                    alt="thumbnail"
                    style={styles.thumb}
                    onError={(e) => (e.target.style.display = "none")}/>
              )}

              <div style={styles.info}>
                <h3 style={styles.itemTitle}>{board.title}</h3>
                <p style={styles.meta}>
                  작성자: {board.userId} | 조회수: {board.viewCount} | 댓글{" "}
                  {board.commentCount}
                </p>
                <p style={styles.date}>
                  {new Date(board.createdDate).toLocaleString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    marginTop: "80px",
    padding: "20px 40px",
  },
  title: {
    fontSize: "20px",
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
    padding: "12px",
    textDecoration: "none",
    color: "#333",
    transition: "0.2s ease",
  },
  itemTitle: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "4px",
  },
  info: {
    flex: 1,
  },
  meta: {
    fontSize: "14px",
    color: "#666",
  },
  date: {
    fontSize: "13px",
    color: "#999",
  },
  thumb: {
    width: "80px",
    height: "80px",
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
};
