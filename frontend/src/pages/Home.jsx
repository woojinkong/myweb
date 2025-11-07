import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { colors, buttons, cardBase } from "../styles/common";

export default function Home() {
  const [boards, setBoards] = useState({
    notice: [],
    free: [],
    inform: [],
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBoardsByCategory = async (category) => {
      try {
        const res = await axiosInstance.get(`/board?category=${category}`);
        return res.data
          .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))
          .slice(0, 5);
      } catch (err) {
        console.error(`${category} 게시글 불러오기 실패:`, err);
        return [];
      }
    };

    const fetchAll = async () => {
      const [notice, free, inform] = await Promise.all([
        fetchBoardsByCategory("notice"),
        fetchBoardsByCategory("free"),
        fetchBoardsByCategory("inform"),
      ]);
      setBoards({ notice, free, inform });
    };

    fetchAll();
  }, []);

  const renderSection = (title, category, list, icon) => (
    <section
      key={category}
      style={{
        ...cardBase,
        minHeight: "260px",
        padding: "12px 14px",
        transition: "all 0.25s ease",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 6px 14px rgba(0,0,0,0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.05)";
      }}
    >
      <div style={styles.header}>
        <h2 style={styles.sectionTitle}>
          <span style={{ marginRight: "6px" }}>{icon}</span> {title}
        </h2>
        <Link to={`/board?category=${category}`} style={styles.moreBtn}>
          더보기 →
        </Link>
      </div>

      {list.length > 0 ? (
        <ul style={styles.list}>
          {list.map((board) => (
            <li
              key={board.boardNo}
              style={styles.listItem}
              onClick={() => navigate(`/board/${board.boardNo}`)}
            >
              <div style={styles.thumbBox}>
                {board.imagePath ? (
                  <img
                    src={`http://localhost:8080${board.imagePath}`}
                    alt="썸네일"
                    style={styles.thumbnail}
                  />
                ) : (
                  <div style={styles.noThumb}>No Image</div>
                )}
              </div>

              <div style={styles.textBox}>
                <h3 style={styles.title}>{board.title}</h3>

                {/* ✅ 유저 + 날짜 한 줄 + 날짜 연하게 처리 */}
                <div style={styles.meta}>
                  <img
                    src={
                      board.profileUrl
                        ? `http://localhost:8080${board.profileUrl}`
                        : "/default-profile.png"
                    }
                    alt="프로필"
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "1px solid #ddd",
                    }}
                  />
                  <span style={{ fontWeight: 500 }}>{board.userId}</span>
                  <span style={{ opacity: 0.6, fontSize: "10.5px" }}>
                    • {new Date(board.createdDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p style={styles.noData}>게시글이 없습니다.</p>
      )}
    </section>
  );

  return (
    <div style={styles.container}>
      <div style={styles.grid}>
        {renderSection("공지사항", "notice", boards.notice, "")}
        {renderSection("자유게시판", "free", boards.free, "")}
        {renderSection("정보게시판", "inform", boards.inform, "")}
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: "100%",
    maxWidth: "940px", // ✅ 전체폭 줄임
    margin: "0 auto",
    padding: "10px 15px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", // ✅ 카드 크기 축소
    gap: "16px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  sectionTitle: {
    fontSize: "16.5px",
    fontWeight: "700",
    color: colors.text.main,
  },
  moreBtn: {
    ...buttons.outline,
    padding: "2px 6px",
    fontSize: "12px",
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  listItem: {
    display: "flex",
    alignItems: "center",
    padding: "5px 0",
    borderBottom: "1px solid #eee",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  thumbBox: {
    width: "42px",
    height: "42px",
    borderRadius: "5px",
    overflow: "hidden",
    background: "#f1f1f1",
    flexShrink: 0,
  },
  thumbnail: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  noThumb: {
    width: "100%",
    height: "100%",
    fontSize: "10px",
    color: "#aaa",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  textBox: {
    marginLeft: "8px",
    flex: 1,
  },
  title: {
    fontSize: "13.5px",
    fontWeight: "600",
    color: colors.text.main,
    lineHeight: "1.4",
  },
  meta: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    marginTop: "3px",
    fontSize: "11px",
    color: colors.text.light,
  },
  noData: {
    textAlign: "center",
    color: colors.text.light,
    fontSize: "12px",
    marginTop: "10px",
  },
};
