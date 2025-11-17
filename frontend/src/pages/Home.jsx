import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { colors, buttons, cardBase } from "../styles/common";
import { FiFolder } from "react-icons/fi";

export default function Home() {
  const [groups, setGroups] = useState([]);
  const [boardsByGroup, setBoardsByGroup] = useState({});
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_API_URL;

  // 🔥 게시판 그룹 불러오기
  useEffect(() => {
    const loadGroups = async () => {
      try {
        const res = await axiosInstance.get("/board-group");
        setGroups(res.data || []);
      } catch (err) {
        console.error("게시판 그룹 불러오기 실패:", err);
      }
    };
    loadGroups();
  }, []);

  // 🔥 각 그룹별 최근 5개의 게시글 로딩
  useEffect(() => {
    if (groups.length === 0) return;

    const fetchGroupBoards = async () => {
      const result = {};

      for (const g of groups) {
        try {
          const res = await axiosInstance.get(`/board?groupId=${g.id}`);

          // 최신순 5개
          result[g.id] = res.data
            .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))
            .slice(0, 5);
        } catch (err) {
          console.error(`그룹(${g.name}) 게시글 불러오기 실패:`, err);
          result[g.id] = [];
        }
      }

      setBoardsByGroup(result);
    };

    fetchGroupBoards();
  }, [groups]);

  // 🔥 공통 섹션 렌더링
  const renderSection = (group) => {
    const list = boardsByGroup[group.id] || [];

    return (
      <section
        key={group.id}
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
        {/* 제목 */}
        <div style={styles.header}>
          <h2 style={styles.sectionTitle}>
            <FiFolder style={{ marginRight: "6px" }} />
            {group.name}
            {group.adminOnlyWrite && " 🔒"}
          </h2>

          <Link to={`/board?groupId=${group.id}`} style={styles.moreBtn}>
            더보기 →
          </Link>
        </div>

        {/* 목록 */}
        {list.length > 0 ? (
          <ul style={styles.list}>
            {list.map((board) => {
              const thumbSrc = board.imagePath
                ? `${BASE_URL}${board.imagePath}`
                : null;

              const profileSrc = board.profileUrl
                ? `${BASE_URL}${board.profileUrl}`
                : "/default-profile.png";

              return (
                <li
                  key={board.boardNo}
                  style={styles.listItem}
                  onClick={() => navigate(`/board/${board.boardNo}`)}
                >
                  {/* 썸네일 */}
                  <div style={styles.thumbBox}>
                    {thumbSrc ? (
                      <img
                        src={thumbSrc}
                        alt="썸네일"
                        style={styles.thumbnail}
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    ) : (
                      <div style={styles.noThumb}>No Image</div>
                    )}
                  </div>

                  {/* 제목/작성자 */}
                  <div style={styles.textBox}>
                    <h3 style={styles.title}>{board.title}</h3>

                    <div style={styles.meta}>
                      <img
                        src={profileSrc}
                        alt="프로필"
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "1px solid #ddd",
                        }}
                        onError={(e) =>
                          (e.currentTarget.src = "/default-profile.png")
                        }
                      />

                      <span style={{ fontWeight: 500 }}>{board.userId}</span>

                      <span style={{ opacity: 0.6, fontSize: "10.5px" }}>
                        • {new Date(board.createdDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p style={styles.noData}>게시글이 없습니다.</p>
        )}
      </section>
    );
  };

  // 🔥 최종 렌더링
  return (
    <div style={styles.container}>
      <div style={styles.grid}>
        {groups.length > 0 ? (
          groups
           .filter((group) => group.type !== "DIVIDER")   // ← ⭐ 추가된 부분
            .map((group) => renderSection(group))
        ) : (
          <p style={{ textAlign: "center", padding: "40px 0" }}>
            게시판이 없습니다.
          </p>
        )}
      </div>
    </div>
  );
}




const styles = {
  container: {
    width: "100%",
    maxWidth: "940px",
    margin: "0 auto",
    padding: "10px 15px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
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
