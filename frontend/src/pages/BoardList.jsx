import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { colors, buttons, cardBase } from "../styles/common";
import useAuth from "../hooks/useAuth";

export default function BoardList() {
  const [boards, setBoards] = useState([]);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_API_URL;
  const { user } = useAuth();

  const category = searchParams.get("category") || "notice";

  const categoryNameMap = {
    free: "자유게시판",
    notice: "공지사항",
    inform: "정보게시판",
  };

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const res = await axiosInstance.get(`/board?category=${category}`);
        setBoards(res.data);
      } catch (err) {
        console.error("게시글 불러오기 실패:", err);
      }
    };
    fetchBoards();
  }, [category]);

  return (
    <div style={{ ...cardBase, maxWidth: "1200px", margin: "40px auto", padding: "30px" }}>
      {/* ✅ 상단 제목 + 새 글 버튼 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "25px",
        }}
      >
        <h2 style={{ fontSize: "22px", fontWeight: "700", color: colors.text.main }}>
           {categoryNameMap[category]} 목록
        </h2>

        {/* ✅ 글쓰기 버튼 표시 조건 */}
        {(category !== "notice" || (user && user.role === "ADMIN")) && (
          <Link
            to="/board/write"
            style={{
              ...buttons.primary,
              fontSize: "14px",
              padding: "6px 12px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              textDecoration: "none",
              backgroundColor: "#4CAF50",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#45A049")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#4CAF50")}
          >
            ✏️ <span style={{ fontWeight: "600" }}>새 글</span>
          </Link>
        )}
      </div>

      {/* ✅ 카테고리 버튼 */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "25px",
          flexWrap: "wrap",
        }}
      >
        <button style={buttons.outline} onClick={() => navigate("/board?category=notice")}>
          공지
        </button>
        <button style={buttons.outline} onClick={() => navigate("/board?category=free")}>
          자유
        </button>
        <button style={buttons.outline} onClick={() => navigate("/board?category=inform")}>
          정보
        </button>
      </div>

      {/* ✅ 게시글 목록 */}
      {boards.length > 0 ? (
        <div
          style={{
            display: "grid",
            gap: "20px",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          }}
        >
          {boards.map((board) => (
            <div
              key={board.boardNo}
              style={{
                ...cardBase,
                cursor: "pointer",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
              onClick={() => navigate(`/board/${board.boardNo}`)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.05)";
              }}
            >
              {/* ✅ 썸네일 */}
              {board.imagePath ? (
                <img
                  src={`${BASE_URL}${board.imagePath}`}
                  alt="썸네일"
                  style={{
                    width: "100%",
                    height: "180px",
                    objectFit: "cover",
                    borderRadius: "10px",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "180px",
                    borderRadius: "10px",
                    background: colors.background.page,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: colors.text.light,
                    fontSize: "14px",
                  }}
                >
                  No Image
                </div>
              )}

              {/* ✅ 제목 */}
              <h3
                style={{
                  marginTop: "10px",
                  fontSize: "17px",
                  color: colors.text.main,
                  fontWeight: "600",
                }}
              >
                {board.title} [{board.commentCount}]
              </h3>

              {/* ✅ 작성자 + 프로필 + 날짜 */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "8px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <img
                    src={
                      board.profileUrl
                        ? `${BASE_URL}${board.profileUrl}`
                        : "/default-profile.png"
                    }
                    alt="프로필"
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "1px solid #ddd",
                    }}
                    onError={(e) => (e.currentTarget.src = "/default-profile.png")}
                  />
                  <span style={{ fontSize: "13px", color: colors.text.main }}>
                    {board.userId}
                  </span>
                </div>
                <span style={{ fontSize: "13px", color: colors.text.light }}>
                  🕓 {new Date(board.createdDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p
          style={{
            textAlign: "center",
            color: colors.text.light,
            marginTop: "20px",
          }}
        >
          게시글이 없습니다.
        </p>
      )}
    </div>
  );
}
