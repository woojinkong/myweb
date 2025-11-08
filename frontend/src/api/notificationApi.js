import axiosInstance from "./axiosInstance";

// 🔔 내 알림 전체 조회
export const fetchNotifications = async () => {
  const res = await axiosInstance.get("/notifications");
  return res.data;
};

// 📩 안 읽은 알림 개수 조회
export const fetchUnreadCount = async () => {
  const res = await axiosInstance.get("/notifications/unread-count");
  return res.data;
};

// ✅ 개별 알림 읽음 처리
export const markAsRead = async (id) => {
  await axiosInstance.post(`/notifications/${id}/read`);
};

// ✅ 전체 알림 읽음 처리 (이게 지금 빠져 있었음!)
export const markAllAsRead = async () => {
  await axiosInstance.post(`/notifications/read-all`);
};
