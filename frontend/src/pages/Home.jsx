import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { colors, buttons, cardBase } from "../styles/common";
import { Helmet } from "react-helmet-async";
import { fetchSiteName } from "../api/siteApi";
import useIsMobile from "../hooks/useIsMobile";
import useAuth from "../hooks/useAuth";
import { useMemo } from "react";
//home
export default function Home() {
  const [groups, setGroups] = useState([]);
  const [boardsByGroup, setBoardsByGroup] = useState({});
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const BASE_URL = import.meta.env.VITE_API_URL;
  const { user } = useAuth();
  const [homeGroupCount, setHomeGroupCount] = useState(7);
  const [homeBoardCount, setHomeBoardCount] = useState(5);


  // const [weeklyPopular, setWeeklyPopular] = useState([]);

    const [siteTitle, setSiteTitle] = useState("KongHome");
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

  const loadHomeSettings = async () => {
    try {
      const res = await axiosInstance.get("/site/home-settings");
      setHomeGroupCount(res.data.homeGroupCount ?? 7);
      setHomeBoardCount(res.data.homeBoardCount ?? 5);
    } catch (err) {
      console.error("홈 설정 로드 실패", err);
    }
  };
  loadHomeSettings();
}, []);


  

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


  const visibleGroups = useMemo(() => {
  return groups.filter((g) => {
    if (g.type === "DIVIDER") return false;
    if (g.type === "LINK") return false;
    if (g.passwordEnabled) return false;
    if (g.adminOnly && user?.role !== "ADMIN") return false;
    if (g.loginOnly && !user) return false;
    return true;
  });
}, [groups, user]);




useEffect(() => {
  if (visibleGroups.length === 0) return;

  const fetchGroupBoards = async () => {
    const result = {};

    const targetGroups = visibleGroups.slice(0, homeGroupCount);

    for (const g of targetGroups) {
      try {
        const res = await axiosInstance.get(
          `/board?groupId=${g.id}&page=0&size=${homeBoardCount}`
        );
        result[g.id] = res.data.content || [];
      } catch {
        result[g.id] = [];
      }
    }

    setBoardsByGroup(result);
  };

  fetchGroupBoards();
}, [visibleGroups, homeGroupCount, homeBoardCount]);




const DEFAULT_THUMBNAIL = "/icons/icon-512.png";

// const getThumbnailSrc = (board) => {
//   // 1️⃣ imagePath 우선
//   if (board.imagePath) {
//     return `${BASE_URL}${board.imagePath}`;
//   }

//   // 2️⃣ content에서 첫 img
//   if (board.content) {
//     const match = board.content.match(/<img[^>]+src="([^">]+)"/);
//     if (match) {
//       return match[1].startsWith("http")
//         ? match[1]
//         : `${BASE_URL}${match[1]}`;
//     }
//   }
//   // 3️⃣ 텍스트 전용
//   return DEFAULT_THUMBNAIL;
// };

  const getThumbnailSrc = (board) => {
  if (board.imagePath) {
    return board.imagePath.startsWith("http")
      ? board.imagePath
      : `${BASE_URL}${board.imagePath}`;
  }
  return DEFAULT_THUMBNAIL;
};

//   useEffect(() => {
//   const fetchPopular = async () => {
//     try {
//       const res = await axiosInstance.get("/board/popular/week");
//       setWeeklyPopular(res.data || []);
//     } catch (e) {
//       console.error("주간 인기글 로드 실패", e);
//     }
//   };
//   fetchPopular();
// }, []);





  // 🔥 공통 섹션 렌더링
  const renderSection = (group) => {
    const list = boardsByGroup[group.id] || [];
    
    return (
      
      <section
        key={group.id}
        className="home-section"
        style={{
          ...cardBase,
          minHeight: "260px",
          padding: "12px 14px",
          transition: "all 0.25s ease",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
        if (!isMobile) {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.boxShadow = "0 6px 14px rgba(0,0,0,0.08)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isMobile) {
          e.currentTarget.style.transform = "none";
          e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.05)";
        }
       }}
      >
        {/* 제목 */}
        <div style={styles.header}>
          <h2 style={styles.sectionTitle}>
            {/* <FiFolder style={{ marginRight: "6px" }} /> */}
            {group.name}
            {group.adminOnlyWrite}
          </h2>

          <Link to={`/board?groupId=${group.id}`} style={styles.moreBtn}>
            더보기 →
          </Link>
        </div>

        {/* 목록 */}
        {list.length > 0 ? (
          <ul style={styles.list}>
            {list.slice(0,homeBoardCount).map((board) => {
              const thumbSrc = getThumbnailSrc(board);


              // const profileSrc = board.profileUrl
              //   ? `${BASE_URL}${board.profileUrl}`
              //   : "/default_profile.png";

              return (
                <li
                  className="home-item"
                  key={board.boardNo}
                  style={styles.listItem}
                  onClick={() => navigate(`/board/${board.boardNo}`)}
                >
                  {/* 썸네일 */}
                  <div className="board-thumb-box" style={styles.thumbBox}>
                    {thumbSrc && (
                      <img
                        src={thumbSrc}
                        loading="lazy"
                        decoding="async"
                        alt=""
                        style={styles.thumbnail}
                        onError={(e) => {
                          e.currentTarget.src = "/icons/icon-512.png";
                        }}
                      />
                    )}
                  </div>

                  {/* 제목/작성자 */}
                  <div style={styles.textBox}>
                    <h3 className="board-title" style={styles.title}>{board.title}</h3>

                    <div style={styles.meta}>
                      {/* <img
                        className="board-profile"
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
                      /> */}

                      {/* <span style={{ fontWeight: 500 }}>{board.nickName}</span> */}

                      <span style={{ opacity: 0.6, fontSize: "10.5px" }}>
                        {new Date(board.createdDate).toLocaleDateString()}
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
    <>
      <Helmet>
        <title>{`${siteTitle} | 부동산·IT·이슈 플랫폼`}</title>
        <meta
          name="description"
          content="서울·수도권 부동산, 재개발, 정책, 세금 절세, IT정보, 최신이슈를 정리하는 플랫폼"
        />
        <meta
          property="og:title"
          content={`${siteTitle} | 부동산·IT·이슈 플랫폼`}
        />
        <meta
          property="og:description"
          content="서울·수도권 부동산, 재개발, 정책, 세금 절세, IT정보, 최신이슈를 정리하는 플랫폼"
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://konghome.kr/" />
      </Helmet>



      <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "0px",
      }}
    > 
      <div className="home-container" style={styles.container}>
      <div className="home-grid" style={styles.grid}>
        {visibleGroups.length > 0 ? (
            visibleGroups.slice(0, homeGroupCount).map((group) => renderSection(group))
        ) : (
          <p style={{ textAlign: "center", padding: "40px 0" }}>
            게시판이 없습니다.
          </p>
        )}
      </div>
    </div>
    </div>
    </>
  );
}




const styles = {
  container: {
    width: "100%",
    padding: "0",
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
