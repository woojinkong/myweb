import { useEffect, useState } from "react";
import { fetchNotifications, markAsRead, markAllAsRead } from "../api/notificationApi";
import { useNavigate } from "react-router-dom";

export default function NotificationPage() {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  // ✅ 알림 목록 불러오기
  const loadNotifications = async () => {
    try {
      const res = await fetchNotifications();
      setNotifications(res);
    } catch (err) {
      console.error("알림 목록 불러오기 실패:", err);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  // ✅ 개별 클릭 시 읽음 처리 + 이동
  const handleClick = async (noti) => {
    try {
      await markAsRead(noti.id);
      navigate(noti.link);
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

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>🔔 내 알림함</h2>
        {notifications.length > 0 && (
          <button onClick={handleMarkAllRead} style={styles.readAllBtn}>
            전체 읽음 처리
          </button>
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
};
