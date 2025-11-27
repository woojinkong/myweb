import { useEffect, useState } from "react";
import { fetchNotifications, markAsRead, markAllAsRead,deleteAllNotifications } from "../api/notificationApi";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

export default function NotificationPage() {
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(0);
const [totalPages, setTotalPages] = useState(0);
  const navigate = useNavigate();

  // ✅ 알림 목록 불러오기
  const loadNotifications = async () => {
  try {
    const res = await fetchNotifications(page, 10);
    setNotifications(res.content);
    setTotalPages(res.totalPages);
  } catch (err) {
    console.error("알림 목록 불러오기 실패:", err);
  }
};


  useEffect(() => {
  loadNotifications();
}, [page]);


  // ✅ 개별 클릭 시 읽음 처리 + 이동
  const handleClick = async (noti) => {
    try {
      await markAsRead(noti.id);
      const link = noti.link;
       // ⭐ 출석체크 알림: 백엔드에서 지정한 링크
    if (link === "/mypage/points") {
      navigate("/mypage");
      return;
    }

       // 게시글 알림: /board/123
    if (link.startsWith("/board/")) {
      const boardId = link.split("/")[2];

      try {
        await axiosInstance.get(`/board/${boardId}`);
        navigate(link);
      } catch (err) {
        alert("해당 게시글은 이미 삭제되었습니다.",err);
      }
      return;
    }

    // 댓글 알림: /board/123?comment=555
    if (link.includes("comment")) {
      const url = new URL("http://dummy" + link);
      const commentId = url.searchParams.get("comment");

      try {
        await axiosInstance.get(`/comments/check/${commentId}`);
        navigate(link);
      } catch (err) {
        alert("해당 댓글은 이미 삭제되었습니다.",err);
      }
      return;
    }

    // 그 외 기본 이동
    navigate(link);



    } catch (err) {
      console.error("알림 처리 실패:", err);
    }
  };

  // ✅ 전체 읽음 처리 버튼
  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      await loadNotifications(); // 새로고침
    } catch (err) {
      console.error("전체 읽음 처리 실패:", err);
    }
  };

  // ⭐ 전체 삭제 기능
  const handleDeleteAll = async () => {
    if (!window.confirm("정말 모든 알림을 삭제하시겠습니까?")) return;

    try {
      await deleteAllNotifications();
      setNotifications([]); // 즉시 화면 반영
    } catch (err) {
      console.error("전체 삭제 실패:", err);
    }
  };



  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>🔔 내 알림함</h2>

        {notifications.length > 0 && (
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={handleMarkAllRead} style={styles.readAllBtn}>
              전체 읽음 처리
            </button>

            <button onClick={handleDeleteAll} style={styles.deleteAllBtn}>
              전체 삭제
            </button>
          </div>
        )}
      </div>


      {notifications.length === 0 ? (
        <p style={styles.empty}>새로운 알림이 없습니다.</p>
      ) : (
        <ul style={styles.list}>
          {notifications.map((n) => (
            <li
              key={n.id}
              onClick={() => handleClick(n)}
              style={{
                ...styles.item,
                backgroundColor: n.isRead ? "#f0f0f0" : "#e8f5e9",
                color: n.isRead ? "#777" : "#222",
              }}
            >
              <div style={styles.message}>{n.message}</div>
              <div style={styles.date}>
                {new Date(n.createdDate).toLocaleString("ko-KR")}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* ⭐⭐⭐ 페이징 UI는 여기! ⭐⭐⭐ */}
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button disabled={page === 0} onClick={() => setPage(page - 1)}>이전</button>
        <span style={{ margin: "0 12px" }}>{page + 1} / {totalPages}</span>
        <button disabled={page + 1 >= totalPages} onClick={() => setPage(page + 1)}>다음</button>
      </div>

    </div>
  );
}

const styles = {
  container: {
    padding: "80px 40px 40px",
    maxWidth: "800px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "700",
  },
  readAllBtn: {
    padding: "8px 16px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "0.2s",
  },
  empty: {
    textAlign: "center",
    fontSize: "16px",
    color: "#777",
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  item: {
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "15px",
    marginBottom: "12px",
    cursor: "pointer",
    transition: "0.2s",
  },
  message: {
    fontSize: "16px",
    fontWeight: "500",
  },
  date: {
    fontSize: "13px",
    color: "#888",
    marginTop: "4px",
  },

  deleteAllBtn: {
    padding: "8px 16px",
    backgroundColor: "#d9534f",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};
