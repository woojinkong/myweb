import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { colors, buttons, cardBase } from "../styles/common";
import useAuth from "../hooks/useAuth";

export default function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);

  // ✅ 관리자 아닌 경우 접근 차단
  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      alert("관리자만 접근 가능합니다.");
      window.location.href = "/";
    }
  }, [user]);

  // ✅ 유저 목록 불러오기
  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.error("유저 목록 불러오기 실패:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ✅ 유저 삭제
  const handleDelete = async (userId) => {
    if (!window.confirm(`${userId} 회원을 삭제하시겠습니까?`)) return;
    try {
      await axiosInstance.delete(`/admin/users/${userId}`);
      alert("삭제 완료");
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("삭제 실패");
    }
  };

  // ✅ 권한 변경
  const handleRoleChange = async (userId, newRole) => {
    try {
      await axiosInstance.put(`/admin/users/${userId}/role?role=${newRole}`);
      alert("권한이 변경되었습니다.");
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("권한 변경 실패");
    }
  };

  return (
    <div style={{ ...cardBase, maxWidth: "1000px", margin: "40px auto", padding: "30px" }}>
      <h2 style={{ fontSize: "22px", fontWeight: "700", color: colors.text.main, marginBottom: "20px" }}>
        👑 관리자 페이지 — 회원 관리
      </h2>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f5f5f5", textAlign: "left" }}>
            <th style={styles.th}>번호</th>
            <th style={styles.th}>아이디</th>
            <th style={styles.th}>이름</th>
            <th style={styles.th}>이메일</th>
            <th style={styles.th}>권한</th>
            <th style={styles.th}>관리</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.userNo} style={{ borderBottom: "1px solid #eee" }}>
              <td style={styles.td}>{u.userNo}</td>
              <td style={styles.td}>{u.userId}</td>
              <td style={styles.td}>{u.userName}</td>
              <td style={styles.td}>{u.email}</td>
              <td style={styles.td}>{u.role}</td>
              <td style={styles.td}>
                <button
                  onClick={() => handleRoleChange(u.userId, u.role === "ADMIN" ? "USER" : "ADMIN")}
                  style={{ ...buttons.secondary, marginRight: "6px" }}
                >
                  {u.role === "ADMIN" ? "→ USER" : "→ ADMIN"}
                </button>
                <button
                  onClick={() => handleDelete(u.userId)}
                  style={buttons.danger}
                >
                  🗑 삭제
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  th: { padding: "10px", borderBottom: "2px solid #ddd", fontSize: "14px" },
  td: { padding: "8px", fontSize: "13px" },
};
