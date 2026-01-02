import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import useAuth from "../hooks/useAuth";
import CommentSection from "./CommentSection";
import UserProfilePopup from "./UserProfilepopup";
import { colors, buttons, cardBase } from "../styles/common";
import { Helmet } from "react-helmet-async";
import { fetchSiteName } from "../api/siteApi";
import AdBanner from "./AdBanner";
import useIsMobile from "../hooks/useIsMobile";
export default function BoardDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [board, setBoard] = useState(null);
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [popupUserId, setPopupUserId] = useState(null);
  const [siteTitle, setSiteTitle] = useState("KongHome");
  const BASE_URL = import.meta.env.VITE_API_URL;
  const [reporting, setReporting] = useState(false);
  const [groups, setGroups] = useState([]);
  const [moveMode, setMoveMode] = useState(false);
  const [targetGroup, setTargetGroup] = useState(null)



  const handleCopyLink = async () => {
  const url = `${window.location.origin}/board/${id}`;

  // 1) clipboard API 지원되는 경우 (HTTPS 또는 localhost)
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(url);
      alert("📢 링크가 복사되었습니다!");
      return;
    } catch (err) {
      console.error("Clipboard 오류, fallback으로 진행:", err);
    }
  }

  // 2) fallback (HTTPS 아니거나 clipboard 막혔을 때)
  try {
    const textarea = document.createElement("textarea");
    textarea.value = url;
    textarea.style.position = "fixed"; // 화면 깜빡임 방지
    textarea.style.top = "-1000px";
    document.body.appendChild(textarea);

    textarea.focus();
    textarea.select();
    document.execCommand("copy");

    document.body.removeChild(textarea);
    alert("📢 링크가 복사되었습니다!");
  } catch (err) {
    console.error("fallback 링크 복사 실패:", err);
    alert("링크 복사 중 오류가 발생했습니다.");
  }
};


    useEffect(() => {
  const loadGroups = async () => {
    try {
      const res = await axiosInstance.get("/board-group");
      setGroups(res.data);
    } catch (err) {
      console.error("그룹 목록 로드 실패:", err);
    }
  };
  loadGroups();
}, []);


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

    
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get(`/board/${id}`);
        const data = res.data;
        let fixedContent = data.content;

        // 0) 불필요한 태그 제거 (중요)
        fixedContent = fixedContent.replace(/&nbsp;/g, " ");
        fixedContent = fixedContent.replace(/<br\s*\/?>/g, "\n");


        // 1) 이미지 경로 절대경로로 교체
        fixedContent = fixedContent.replace(
          /src="\/uploads\//g,
          `src="${BASE_URL}/uploads/`
        );

        // 2) <a href="유튜브URL"> ... </a> → iframe
        fixedContent = fixedContent.replace(
        /<a[^>]*href="(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]+))"[^>]*>.*?<\/a>/g,
        `<div class="responsive-youtube">
            <iframe 
              src="https://www.youtube.com/embed/$2"
              allowfullscreen
            ></iframe>
          </div>`
      );

        // 3) 순수 텍스트 URL → iframe
        fixedContent = fixedContent.replace(
          /(^|\s)(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]+))(\s|$)/g,
          `$1<div class="responsive-youtube">
              <iframe 
                src="https://www.youtube.com/embed/$3"
                allowfullscreen
              ></iframe>
            </div>$4`
        );



         setBoard({
           ...data,
           content: fixedContent,
           pinned: data.pinned,   // ⭐ 추가
         });

        // console.log("📌 board content:", data.content);

        // 좋아요 정보
        const likeRes = await axiosInstance.get(`/board/like/${id}`);
        setLikeCount(likeRes.data.count);
        setLiked(likeRes.data.liked);
      } catch (err) {
        console.error("게시글 불러오기 실패:", err);
        alert("게시글을 불러올 수 없습니다.");
        navigate("/board");
      }
    };

    fetchData();
  }, [id, navigate, BASE_URL]);

  // 좋아요
  const handleLike = async () => {
    try {
      const res = await axiosInstance.post(`/board/like/${id}`);
      const newLiked = res.data;

      setLiked(newLiked);
      setLikeCount((prev) => (newLiked ? prev + 1 : prev - 1));
    } catch (err) {
      alert("로그인이 필요합니다.",err);
    }
  };



  const ogImage =
  board?.firstImage
    ? `${BASE_URL}${board.firstImage}`
    : "https://konghome.kr/default_thumbnail.jpg";



  // 삭제
  const handleDelete = async () => {



    // 관리자 아니면 기존 로직 유지
  if (user?.role !== "ADMIN") {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      await axiosInstance.delete(`/board/${id}`);
      alert("삭제되었습니다.");
      navigate(`/board?groupId=${board.groupId}`);
    } catch (err) {
      console.error(err);
      alert("삭제 중 오류.");
    }
    return;
  }

  // -----------------------------
  // 🔥 관리자 삭제: 사유 입력창 포함
  // -----------------------------
  const reason = prompt("삭제 사유를 입력하세요:");
  if (!reason) return;

  try {
    await axiosInstance.post(`/admin/board/delete/${id}`, { reason });
    alert("게시글이 삭제되었습니다.");
    navigate(`/board?groupId=${board.groupId}`);
  } catch (err) {
    console.error(err);
    alert("삭제 중 오류 발생");
  }
  };


  const handleTogglePin = async () => {
  if (!user || user.role !== "ADMIN") return;

  try {
    const url = board.pinned
      ? `/board/${id}/unpin`
      : `/board/${id}/pin`;

    await axiosInstance.post(url);

    alert(board.pinned ? "게시글 고정 해제됨" : "게시글이 상단에 고정되었습니다.");

    // 최신 상태 반영

    setBoard((prev) => ({
      ...prev,
      pinned: !prev.pinned
    }));
  } catch (err) {
    console.error("고정/해제 오류:", err);
    alert("처리 중 문제가 발생했습니다.");
  }
};



  // 신고 기능
const handleReport = async () => {
  if (!user) {
    alert("로그인 후 신고할 수 있습니다.");
    return;
}
  if (reporting) return; // 중복 클릭 방지
  setReporting(true);
  const reason = prompt("신고 사유를 입력하세요:");
  if (!reason) return;

  try {
    await axiosInstance.post(`/board/report/${id}`, { reason });
    alert("신고가 접수되었습니다.");
  } catch (err) {
    console.error("신고 실패:", err);
    if (err.response?.status === 429) {
      alert(err.response.data.message); // 서버에서 쿨타임 메시지 보내는 경우
    } else {
      alert("신고 중 오류가 발생했습니다.");
    }
  } finally {
    setReporting(false);
  }
};


  if (!board)
    return <p style={styles.loading}>⏳ 게시글을 불러오는 중...</p>;

  return (
    <>
      {/* ----------------------------- */}
      {/*     🧠 SEO META 설정 부분      */}
      {/* ----------------------------- */}
      <Helmet>
        <title>{`${board.title} | ${siteTitle}`}</title>

        {/* 설명 텍스트 HTML 제거 + 공백 정리 */}
          <meta
            name="description"
            content={
              board.content
                .replace(/<[^>]+>/g, " ")
                .replace(/\s+/g, " ")
                .trim()
                .slice(0, 150)
            }
          />

        <meta property="og:title" content={board.title} />
        <meta
          property="og:description"
          content={board.content.replace(/<[^>]+>/g, "").slice(0, 150)}
        />
        <meta property="og:url" content={`${window.location.origin}/board/${id}`} />

        <meta property="og:type" content="article" />

        <meta property="og:image" content={ogImage} />
      </Helmet>
    
    <div
      className="board-detail-page"
      style={{
        ...cardBase,
        width: "100%",
        padding: "16px",
        position: "relative",
        boxSizing: "border-box",
      }}
    >
      <div style={styles.titleRow}>
        <h2 style={styles.title}>{board.title}</h2>
      </div>


      {/* 작성자 정보 */}
      <div style={styles.metaBox}>
      <img
        src={board.profileUrl ? `${BASE_URL}${board.profileUrl}` : "/default_profile.png"}
        alt="프로필"
        style={styles.profileImg}
        onClick={(e) =>
          setPopupUserId({ id: board.userId, x: e.clientX, y: e.clientY })
        }
      />

      {/* 전체를 한 줄에 */}
      <div style={styles.metaInfo}>
    <span style={styles.writer}>{board.nickName}</span>

    <div style={styles.metaSub}>
      <span style={styles.date}>
        {new Date(board.createdDate).toLocaleString()}
      </span>
      <span style={styles.dot}>•</span>
      <span style={styles.view}>👁 {board.viewCount}</span>
    </div>
      </div>
    </div>


      {/* 프로필 팝업 */}
      {popupUserId && (
        <UserProfilePopup
          userId={popupUserId.id}
          position={{ x: popupUserId.x, y: popupUserId.y }}
          onClose={() => setPopupUserId(null)}
        />
      )}

      {/* 좋아요 */}
      {/* 좋아요 + 신고 버튼 한 줄 */}
      <div style={styles.actionRow}>
        <button onClick={handleLike} style={styles.likeSmall}>
          {liked ? "❤️" : "🤍"} {likeCount}
        </button>

        <button style={{
          ...styles.reportSmall,
          opacity: reporting ? 0.5 : 1,
          pointerEvents: reporting ? "none" : "auto",
        }} onClick={handleReport}>
          {reporting ? "처리 중..." : "🚨 신고"}
        </button>

        {user?.role === "ADMIN" && (
          <button
            onClick={handleTogglePin}
            style={{
              padding: "6px 12px",
              backgroundColor: board?.pinned ? "#c0392b" : "#2980b9",
              color: "white",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              fontSize: "13px"
            }}
          >
            {board?.pinned ? "고정 해제" : "게시글 고정"}
          </button>
        )}

      </div>


      {/* 상단광고 */}
      <AdBanner position="AD_TOP" />

      {/* 본문 */}
      <div
        className="board-content"
        style={styles.contentBox}
        dangerouslySetInnerHTML={{ __html: board.content }}
      />

      <AdBanner position="AD_BOTTOM" />

      {/* 댓글 */}
      {board.allowComment ? (
        <CommentSection boardId={Number(id)} setPopupUserId={setPopupUserId} />
      ) : (
        <p style={{ color: "#888", marginTop: "20px" }}>
          🚫 댓글이 허용되지 않은 게시판입니다.
        </p>
      )}

      {/* 버튼 영역 */}
      <div style={styles.buttons} className="board-detail-buttons">
        <button style={styles.copyBtn} onClick={handleCopyLink}>🔗 링크복사</button>

        <Link to={`/board?groupId=${board.groupId}`} style={{ ...buttons.outline, textDecoration: "none" }}>
          🔙 목록
        </Link>

        {user && (user.userId === board.userId || user.role === "ADMIN") && (
          <>
            <button
              onClick={() => navigate(`/board/edit/${board.boardNo}`)}
              style={buttons.secondary}
            >
              ✏️ 수정
            </button>
            <button onClick={handleDelete} style={buttons.danger}>
              🗑 삭제
            </button>
            {user?.role === "ADMIN" && (
            <button
              onClick={() => setMoveMode(true)}
              style={buttons.secondary}
            >
              📂 게시판 이동
            </button>
          )}
          </>
        )}
      </div>

           {moveMode && (
        <div style={{
          marginTop: "15px",
          padding: isMobile ? "8px" : "10px",
          border: "1px solid #ddd",
          borderRadius: "8px",
          background: "#fafafa"
        }}>
          <h4 style={{ fontSize: isMobile ? "14px" : "16px" }}>게시판 이동</h4>

          <select
            value={targetGroup ?? board.groupId}
            onChange={(e) => setTargetGroup(e.target.value)}
            style={{
              padding: "8px",
              marginTop: "10px",
              width: "100%",         // ⭐ 모바일 대응을 위한 핵심
              boxSizing: "border-box"
            }}
          >
            {groups
            .filter(g => g.type !== "DIVIDER")  // ⭐ DIVIDER 제외!
            .map(g => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>

          <div style={{
            marginTop: "10px",
            display: "flex",
            flexDirection: isMobile ? "column" : "row",  // ⭐ 모바일에서는 세로 정렬
            gap: "10px"
          }}>
            <button
              style={{ ...buttons.primary, width: isMobile ? "100%" : "auto" }}
              onClick={async () => {
                try {
                  await axiosInstance.post(`/board/${id}/move?targetGroupId=${targetGroup}`);
                  alert("이동 완료");
                  navigate(`/board?groupId=${targetGroup}`);
                } catch (err) {
                  console.error("이동 실패:", err);
                  alert("이동 중 오류가 발생했습니다.");
                }
              }}
            >
              이동하기
            </button>

            <button
              style={{ ...buttons.outline, width: isMobile ? "100%" : "auto" }}
              onClick={() => setMoveMode(false)}
            >
              취소
            </button>
          </div>
        </div>
      )}


    </div>
    </>
  );
}

const styles = {

  title: {
    fontSize: "26px",
    fontWeight: "700",
    marginBottom: "15px",
    color: colors.text.main,
  },
  metaBox: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    //marginBottom: "20px",
  },
  metaInfo: {
  display: "flex",
  flexDirection: "column",
},

metaSub: {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  marginTop: "2px", // 날짜 내려오기 효과
},
  metaRow: {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  fontSize: "14px",
  color: colors.text.light,
  flexWrap: "wrap",      // 모바일에서 줄바꿈 허용
  },
  writer: {
    fontWeight: "600",
    fontSize: "15px",
    color: colors.text.main,
  },
  profileImg: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    border: "1px solid #ddd",
    objectFit: "cover",
    cursor: "pointer",   // ← 마우스를 손가락 모양으로 변경
  },
  metaText: {
    display: "flex",
    flexDirection: "column",
  },
  dot: {
  color: "#ccc",
  fontSize: "14px",
  },

  date: {
    color: "#7a7a7a",
    fontSize: "13px",
  },

  view: {
    color: "#7a7a7a",
    fontSize: "13px",
  },
  profileBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "18px",
  },
  actionRow: {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  margin: "10px 0 15px 0",   // 본문과 적당히 간격
},

likeSmall: {
  padding: "3px 8px",
  fontSize: "12px",
  border: "1px solid #ccc",
  borderRadius: "6px",
  background: "#fff",
  cursor: "pointer",
},

reportSmall: {
  padding: "3px 8px",
  fontSize: "12px",
  borderRadius: "6px",
  border: "1px solid #ff4d4d",
  background: "#fff",
  color: "#ff4d4d",
  cursor: "pointer",
},

  
  contentBox: {
    backgroundColor: colors.background.page,
    borderRadius: "8px",
    padding: "20px",
    fontSize: "16px",
    lineHeight: "1.7",
    wordBreak: "break-word",
     /* ⭐ 추가 */
     //overflowX: "auto",         // 너무 큰 이미지면 가로 스크롤
  },
  buttons: {
    marginTop: "15px",
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
  },
  loading: {
    textAlign: "center",
    marginTop: "60px",
    color: colors.text.light,
  },
  titleRow: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "15px",
},
  likeButton: {
    ...buttons.outline,
    padding: "5px 10px",
    marginBottom: "15px",
    fontSize: "12px",
  },

reportBtn: {
  background: "transparent",
  border: "1px solid #ff4d4d",
  color: "#ff4d4d",
  padding: "5px 10px",
  fontSize: "12px",
  borderRadius: "5px",
  cursor: "pointer",
},
copyBtn: {
  background: "transparent",
  border: "1px solid #4a90e2",
  color: "#4a90e2",
  padding: "5px 10px",
  fontSize: "12px",
  borderRadius: "5px",
  cursor: "pointer",
},




};
