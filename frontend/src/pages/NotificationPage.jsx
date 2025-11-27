import { useEffect, useState } from "react";
import { fetchNotifications, markAsRead, markAllAsRead,deleteAllNotifications } from "../api/notificationApi";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import "../styles/notification.css";
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
    <div className="notification-container">
      <div className="notification-header">
        <h2 className="notification-title">🔔 내 알림함</h2>

        {notifications.length > 0 && (
          <div className="notification-btn-row">
            <button className="notification-btn green" onClick={handleMarkAllRead}>
              전체 읽음 처리
            </button>
            <button className="notification-btn red" onClick={handleDeleteAll}>
              전체 삭제
            </button>
          </div>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="notification-empty">새로운 알림이 없습니다.</p>
      ) : (
        <ul className="notification-list">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`notification-item ${n.isRead ? "read" : "unread"}`}
              onClick={() => handleClick(n)}
            >
              <div className="notification-message">{n.message}</div>
              <div className="notification-date">
                {new Date(n.createdDate).toLocaleString("ko-KR")}
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="notification-pagination">
        <button disabled={page === 0} onClick={() => setPage(page - 1)}>
          이전
        </button>
        <span>
          {page + 1} / {totalPages}
        </span>
        <button
          disabled={page + 1 >= totalPages}
          onClick={() => setPage(page + 1)}
        >
          다음
        </button>
      </div>
    </div>
  );
}

