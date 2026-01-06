import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { colors, buttons, cardBase } from "../styles/common";
import useAuth from "../hooks/useAuth";
import { Helmet } from "react-helmet-async";
import { fetchSiteName } from "../api/siteApi";

export default function BoardList() {
  const [boards, setBoards] = useState([]);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  const [searchParams] = useSearchParams();
  const groupId = searchParams.get("groupId");

  const navigate = useNavigate();
  const { user } = useAuth();
  const BASE_URL = import.meta.env.VITE_API_URL;

  const [siteTitle, setSiteTitle] = useState("KongHome");
  //페이징시스템
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [size] = useState(10); // 페이지당 10개
  // 정렬 상태 추가
  const [sort, setSort] = useState("new"); // new, old, likes


    useEffect(() => {
      const load = async () => {
        try {
          const title = await fetchSiteName();
          setSiteTitle(title);
        } catch {
          console.error("사이트 이름 로드 실패");
        }
      };
     load();
    }, []);

    useEffect(() => {
      setPage(0);
    }, [groupId]);



  // ======================================================
  //  📌 게시판 그룹 + 목록 함께 로딩
  // ======================================================
  useEffect(() => {
    const loadData = async () => {
      if (!groupId) return;

      setLoading(true);   // ⭐ 추가
      try {

        // 1) 그룹 먼저 가져오기
      const groupRes = await axiosInstance.get(`/board-group/${groupId}`);
      setGroup(groupRes.data);

      // 2) 시트 게시판이면 바로 이동
      if (groupRes.data.sheetEnabled) {
        navigate(`/sheet/${groupId}`);
        return;
      }

      // 3) 일반 게시판이면 글 목록 가져오기
      const boardRes = await axiosInstance.get(
        `/board?groupId=${groupId}&page=${page}&size=${size}&sort=${sort}`
      );

        // const [groupRes, boardRes] = await Promise.all([
        // axiosInstance.get(`/board-group/${groupId}`),
        // axiosInstance.get(`/board?groupId=${groupId}&page=${page}&size=${size}&sort=${sort}`)
        // ]);
        // setGroup(groupRes.data);
        setBoards(boardRes.data.content);
        setTotalPages(boardRes.data.totalPages);
      } catch (err) {
        console.error("🔥 게시판 정보 로드 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [groupId,page,sort]);

  // groupId 없는 경우
  if (!groupId)
    return (
      <div style={{ ...cardBase, marginTop: 40 }}>
        <h2>게시판을 선택해주세요.</h2>
      </div>
    );

  // 로딩 표시
  if (loading)
    return (
      <div style={{ ...cardBase, marginTop: 40 }}>
        <h3>loading...</h3>
      </div>
    );

  const canWrite =
    group && (!group.adminOnlyWrite || (user && user.role === "ADMIN"));

      /* --------------------------------------
      📌 SEO 동적 description 생성
    -------------------------------------- */
    const metaDescription = group
      ? `${group.name} 게시판의 최신 게시글 목록입니다.`
      : "게시판 리스트 페이지입니다.";

  return (

     <>
      {/* =============================== */}
      {/*            🔥 SEO META           */}
      {/* =============================== */}
      <Helmet>
        <title>{`${group?.name || "게시판"} | ${siteTitle}`}</title>
        <meta name="description" content={metaDescription} />

        <meta property="og:title" content={`${group?.name} | ${siteTitle}`} />
        <meta property="og:description" content={metaDescription} />
        <meta
          property="og:url"
          content={`${window.location.origin}/board?groupId=${groupId}`}
        />
        <meta property="og:type" content="website" />
      </Helmet>


    <div
      style={{
        ...cardBase,
        maxWidth: "1200px",
        margin: "0px auto",
        padding: "20px",
      }}
    >
      <div style={styles.header}>
        <h2 style={styles.title}>{group ? group.name : "게시판"} 목록</h2>

        {canWrite && (
          <Link
            to={`/board/write?groupId=${groupId}`}
            style={styles.writeBtn}
          >
            ✏️ 새 글
          </Link>
        )}
      </div>

      {boards.length > 0 ? (
        <div style={styles.list}>
          {boards.map((board) => (
            <BoardRow
              key={board.boardNo}
              board={board}
              BASE_URL={BASE_URL}
              navigate={navigate}
            />
          ))}
        </div>
      ) : (
        <p style={styles.noData}>게시글이 없습니다.</p>
      )}

      {/* 🔥 정렬 버튼 영역 */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
        <button
          onClick={() => { setSort("new"); setPage(0); }}
          style={sort === "new" ? styles.sortActive : styles.sortBtn}
        >
          최신순
        </button>

        <button
          onClick={() => { setSort("old"); setPage(0); }}
          style={sort === "old" ? styles.sortActive : styles.sortBtn}
        >
          오래된순
        </button>

        <button
          onClick={() => { setSort("likes"); setPage(0); }}
          style={sort === "likes" ? styles.sortActive : styles.sortBtn}
        >
          좋아요순
        </button>
      </div>


      {/* ⭐⭐⭐ 여기에 페이징 버튼 추가 ⭐⭐⭐ */}
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button disabled={page === 0} onClick={() => setPage(page - 1)}>
          이전
        </button>
        <span style={{ margin: "0 12px" }}>
          {page + 1} / {totalPages}
        </span>
        <button disabled={page + 1 >= totalPages} onClick={() => setPage(page + 1)}>
          다음
        </button>
      </div>
    </div>
    </>
  );
}


function BoardRow({ board, navigate, BASE_URL }) {

  const isPinned = board.pinned;

  const DEFAULT_THUMBNAIL = "/icons/icon-512.png";

  let thumbnailSrc = null;

  // 1️⃣ imagePath 우선
  if (board.imagePath) {
    thumbnailSrc = `${BASE_URL}${board.imagePath}`;
  }

  // 2️⃣ content에서 첫 img fallback
  if (!thumbnailSrc && board.content) {
    const match = board.content.match(/<img[^>]+src="([^">]+)"/);
    if (match) {
      thumbnailSrc = match[1].startsWith("http")
        ? match[1]
        : `${BASE_URL}${match[1]}`;
    }
  }

  // 3️⃣ 텍스트 전용 글
  if (!thumbnailSrc) {
    thumbnailSrc = DEFAULT_THUMBNAIL;
  }

  // let thumbnailSrc = board.imagePath
  //   ? `${BASE_URL}${board.imagePath}`
  //   : DEFAULT_THUMBNAIL;


  // if (!thumbnailSrc && board.content) {
  //   const match = board.content.match(/<img[^>]+src="([^">]+)"/);
  //   if (match) thumbnailSrc = match[1];
  // }
  
  const profileSrc = board.profileUrl
    ? `${BASE_URL}${board.profileUrl}`
    : "/default-profile.png";

  return (
    <div
      style={{
        ...styles.row,
        ...(isPinned ? styles.pinnedRow : {}),   // ⭐ 여기서 스타일 변경
      }}
      
      onClick={() => navigate(`/board/${board.boardNo}`)}
    >
      {/* 썸네일 */}
      {thumbnailSrc && (
      <img
        src={thumbnailSrc}
        style={styles.rowThumbnail}
        onError={(e) => {
          e.currentTarget.src = DEFAULT_THUMBNAIL;
        }}
      />

    )}


      {/* 제목 + 정보 */}
      <div style={styles.rowContent}>

        {/* 제목 + 작성자 정보 한 줄로 붙이기 */}
        <div style={styles.rowLine}>
          <div style={styles.rowTitle} className="board-row-title">
            {board.title}
            <span style={styles.comment}>[{board.commentCount}]</span>
          </div>

          <div style={styles.rowInfoInline}>
            <img src={profileSrc} style={styles.rowInfoProfile} />
            <span  style={{
                maxWidth: "60px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}>{board.nickName}</span>
            <span className="board-date-dot">·</span>
            <span className="board-date" style={{
              maxWidth: "100px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            }}>{new Date(board.createdDate).toLocaleDateString()}
            </span>
             <span>·</span>
              {/* 👁 조회수 표시 추가 */}
              <span style={{ whiteSpace: "nowrap", color: "#666", fontSize: "11px" }}>
                👁 {board.viewCount}
              </span>
            </div>
        </div>

      </div>


      
    </div>
    
  );
}


/* ======================================================
   📌 스타일
====================================================== */
const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0px",
  },
  title: {
    fontSize: "20px",
    fontWeight: "600",
    color: colors.text.main,
  },
  writeBtn: {
    ...buttons.primary,
    fontSize: "12px",
    padding: "6px 12px",
    borderRadius: "8px",
    textDecoration: "none",
  },
  grid: {
    display: "grid",
    gap: "20px",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  },
  card: {
    ...cardBase,
    cursor: "pointer",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  thumbnail: {
    width: "100%",
    height: "180px",
    objectFit: "cover",
    borderRadius: "10px",
  },
  noThumb: {
    width: "100%",
    height: "180px",
    borderRadius: "10px",
    background: colors.background.page,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: colors.text.light,
    fontSize: "14px",
  },
  cardTitle: {
    marginTop: "10px",
    fontSize: "17px",
    color: colors.text.main,
    fontWeight: "600",
  },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "8px",
  },
  writerBox: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  profileImg: {
    width: 22,
    height: 22,
    borderRadius: "50%",
    objectFit: "cover",
    border: "1px solid #ddd",
  },
  writerName: {
    fontSize: "13px",
    color: colors.text.main,
  },
  date: {
    fontSize: "13px",
    color: colors.text.light,
  },
  noData: {
    textAlign: "center",
    color: colors.text.light,
    marginTop: "20px",
  },
   list: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  //test
  row: {
  display: "flex",
  gap: "10px",
  alignItems: "center",
  padding: "0px 10px",
  borderRadius: "6px",
  background: "#fff",
  cursor: "pointer",
  transition: "background 0.2s",
  border: "1px solid #eee",
  minHeight: "58px",
},

  rowThumbnail: {
  width: "45px",
  height: "45px",
  objectFit: "cover",
  borderRadius: "5px",
},

  noRowThumb: {
  width: "45px",
  height: "45px",
  borderRadius: "5px",
  background: "#eee",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#aaa",
  fontSize: "11px",
},

  rowContent: {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  gap: "2px",
},

  rowTitle: {
  fontSize: "14px",
  fontWeight: "600",
  color: colors.text.main,
  overflow: "hidden",
  textOverflow: "ellipsis",
  //whiteSpace: "nowrap",
  minWidth: 0,              // ★ ellipsis 필수 조건
  flex: "1 1 auto",         // ★ 제목이 공간 차지하고 줄어들도록 설정
},
  comment: {
    color: colors.text.light,
    fontSize: "13px",
  },

  rowInfo: {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontSize: "11px",
  color: "#777",
  whiteSpace: "nowrap",
},

  sortBtn: {
  padding: "6px 12px",
  border: "1px solid #ddd",
  background: "#f9f9f9",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "13px",
},

sortActive: {
  padding: "6px 12px",
  border: "1px solid #777",
  background: "#e5e5e5",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: "600",
},
pinnedRow: {
  background: "#fff8e6",          // ⭐ 옅은 노란색 배경
  border: "1px solid #f1c40f",    // ⭐ 강조 보더
  boxShadow: "0 2px 8px rgba(241, 196, 15, 0.3)",
  position: "relative",
},

pinnedBadge: {
  position: "absolute",
  top: "-8px",
  left: "-8px",
  background: "#f39c12",
  color: "white",
  padding: "2px 8px",
  fontSize: "11px",
  borderRadius: "6px",
  fontWeight: "700",
},

pinnedText: {
  color: "#e67e22",
  fontWeight: "700",
  marginLeft: "4px",
},
rowLine: {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  width: "100%",
  minWidth: 0,
  flexWrap: "nowrap",       // ★ 강제 한 줄 배치
},
rowInfoInline: {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontSize: "11px",
  color: "#777",
  whiteSpace: "nowrap",
  flexShrink: 0,     
  minWidth: "150px", 
},

rowInfoProfile: {
  width: 16,
  height: 16,
  borderRadius: "50%",
  objectFit: "cover",
},




};
