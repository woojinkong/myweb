import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { colors, buttons, cardBase } from "../styles/common";
import useAuth from "../hooks/useAuth";

export default function BoardList() {
  const [boards, setBoards] = useState([]);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  const [searchParams] = useSearchParams();
  const groupId = searchParams.get("groupId");

  const navigate = useNavigate();
  const { user } = useAuth();
  const BASE_URL = import.meta.env.VITE_API_URL;

  // ======================================================
  //  📌 게시판 그룹 + 목록 함께 로딩
  // ======================================================
  useEffect(() => {
    const loadData = async () => {
      if (!groupId) return;

      try {
        const [groupRes, boardRes] = await Promise.all([
          axiosInstance.get(`/board-group/${groupId}`),
          axiosInstance.get(`/board?groupId=${groupId}`)
        ]);

        setGroup(groupRes.data);

        // ⭐ 이미지 경로는 상대경로 → 화면에서 BASE_URL 붙여서 렌더링
        setBoards(boardRes.data);
        console.log("📌 boardRes.data:", boardRes.data);
      } catch (err) {
        console.error("🔥 게시판 정보 로드 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [groupId]);

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

  return (
    <div
      style={{
        ...cardBase,
        maxWidth: "1200px",
        margin: "40px auto",
        padding: "30px",
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
        <div style={styles.grid}>
          {boards.map((board) => (
            <BoardCard
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
    </div>
  );
}

/* ======================================================
   📌 카드 개별 컴포넌트 (이미지 경로 통일 반영)
====================================================== */
function BoardCard({ board, navigate, BASE_URL }) {

  console.log("📌 board.imagePath:", board.imagePath);

  // 1) DB에 imagePath가 있다면 사용
  let thumbnailSrc = board.imagePath
    ? `${BASE_URL}${board.imagePath}`
    : null;
  
  // 2) imagePath 없으면 content에서 첫 번째 이미지 자동 추출
  if (!thumbnailSrc && board.content) {
    const match = board.content.match(/<img[^>]+src="([^">]+)"/);
    if (match) {
      // match[1]은 absolute URL 또는 BASE_URL 포함 URL
      thumbnailSrc = match[1];
    }
  }

  console.log("📌 최종 thumbnailSrc:", thumbnailSrc);

  const profileSrc = board.profileUrl
    ? `${BASE_URL}${board.profileUrl}`
    : "/default-profile.png";



  return (
    <div
      style={styles.card}
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
      {/* 썸네일 */}
      {thumbnailSrc ? (
        <img
          src={thumbnailSrc}
          alt="썸네일"
          style={styles.thumbnail}
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
      ) : (
        <div style={styles.noThumb}>No Image</div>
      )}

      <h3 style={styles.cardTitle}>
        {board.title} [{board.commentCount}]
      </h3>

      <div style={styles.cardFooter}>
        <div style={styles.writerBox}>
          <img
            src={profileSrc}
            style={styles.profileImg}
            onError={(e) => (e.currentTarget.src = "/default-profile.png")}
          />
          <span style={styles.writerName}>{board.userId}</span>
        </div>

        <span style={styles.date}>
          🕓 {new Date(board.createdDate).toLocaleDateString()}
        </span>
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
    marginBottom: "25px",
  },
  title: {
    fontSize: "22px",
    fontWeight: "700",
    color: colors.text.main,
  },
  writeBtn: {
    ...buttons.primary,
    fontSize: "14px",
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
};
