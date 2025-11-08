import axiosInstance from "./axiosInstance";

// ✅ 안 읽은 쪽지 개수 불러오기
export async function fetchUnreadMessages() {
  const res = await axiosInstance.get("/message/unread-count");
  return res.data;
}
