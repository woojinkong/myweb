/* ============================
   AdminUsers.jsx (UI 정리 완전 버전)
=============================== */

import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import {  cardBase } from "../styles/common";
import useAuth from "../hooks/useAuth";

export default function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);

  // 이메일 모달 상태
  const [emailModal, setEmailModal] = useState({
    open: false,
    targetUserId: null,
    targetEmail: "",
    subject: "",
    message: "",
  });

  // 관리자 체크
  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      window.location.href = "/";
    }
  }, [user]);

  // 유저 로드
  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.error("유저 목록 로드 실패:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 권한 변경
  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm("정말 권한을 변경하시겠습니까?")) return;
    try {
      await axiosInstance.put(`/admin/users/${userId}/role?role=${newRole}`);
      fetchUsers();
    } catch {
      alert("권한 변경 실패");
    }
  };

  // 포인트 지급
  const handleGivePoints = async (userNo) => {
    const amount = prompt("지급할 포인트:");
    if (!amount || isNaN(amount)) return;

    try {
      await axiosInstance.post(`/admin/users/${userNo}/points`, {
        amount: Number(amount),
      });
      fetchUsers();
    } catch {
      alert("포인트 지급 실패");
    }
  };

  // 유저 정지
  const handleBan = async (userId) => {
    const reason = prompt("정지 사유:");
    if (!reason) return;

    try {
      await axiosInstance.put(`/admin/users/${userId}/ban?reason=${reason}`);
      fetchUsers();
    } catch {
      alert("정지 실패");
    }
  };

  // 정지 해제
  const handleUnban = async (userId) => {
    if (!window.confirm("정지 해제하시겠습니까?")) return;

    try {
      await axiosInstance.put(`/admin/users/${userId}/unban`);
      fetchUsers();
    } catch {
      alert("정지 해제 실패");
    }
  };

  // 이메일 모달
  const openEmailModal = (id, email) => {
    setEmailModal({
      open: true,
      targetUserId: id,
      targetEmail: email,
      subject: "",
      message: "",
    });
  };

  const closeEmailModal = () =>
    setEmailModal((prev) => ({ ...prev, open: false }));

  const sendEmail = async () => {
    if (!emailModal.subject || !emailModal.message)
      return alert("제목과 내용을 입력하세요");

    try {
      if (emailModal.targetUserId === "ALL") {
        await axiosInstance.post(`/admin/email/send-all`, {
          subject: emailModal.subject,
          message: emailModal.message,
        });
      } else {
        await axiosInstance.post(
          `/admin/email/send/${emailModal.targetUserId}`,
          {
            subject: emailModal.subject,
            message: emailModal.message,
          }
        );
      }

      closeEmailModal();
      alert("전송 완료!");
    } catch {
      alert("전송 실패");
    }
  };

  return (
    <div style={{ ...cardBase, maxWidth: "1050px", margin: "40px auto" }}>
      <h2 style={{ fontSize: "20px", marginBottom: "20px" }}>
        👑 관리자 — 회원 관리
      </h2>

      {/* 전체 메일 */}
      <button
        onClick={() => openEmailModal("ALL")}
        style={ui.allMailButton}
      >
        ✉ 전체 이메일 발송
      </button>

      {/* 사용자 테이블 */}
      <table style={ui.table}>
        <thead>
          <tr>
            {["번호", "아이디", "이름", "이메일", "권한", "상태", "관리"].map(
              (h) => (
                <th key={h} style={ui.th}>
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
            <tr key={u.userNo} style={ui.row}>
              <td style={ui.td}>{u.userNo}</td>
              <td style={ui.td}>{u.userId}</td>
              <td style={ui.td}>{u.userName}</td>
              <td style={ui.td}>{u.email}</td>
              <td style={ui.td}>{u.role}</td>
              <td style={{ ...ui.td, color: u.banned ? "#d9534f" : "#28a745" }}>
                {u.banned ? "정지됨" : "정상"}
              </td>

              <td style={ui.td}>
                <div style={ui.btnGroup}>
                  <button
                    style={ui.small}
                    onClick={() => openEmailModal(u.userId, u.email)}
                  >
                    ✉ 메일
                  </button>

                  <button
                    style={ui.smallGray}
                    onClick={() =>
                      handleRoleChange(
                        u.userId,
                        u.role === "ADMIN" ? "USER" : "ADMIN"
                      )
                    }
                  >
                    {u.role === "ADMIN" ? "↓ USER" : "↑ ADMIN"}
                  </button>

                  <button
                    style={ui.smallBlue}
                    onClick={() => handleGivePoints(u.userNo)}
                  >
                    💰
                  </button>

                  {u.banned ? (
                    <button
                      style={ui.smallGreen}
                      onClick={() => handleUnban(u.userId)}
                    >
                      🔓
                    </button>
                  ) : (
                    <button
                      style={ui.smallRed}
                      onClick={() => handleBan(u.userId)}
                    >
                      ⛔
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 이메일 모달 */}
      {emailModal.open && (
        <div style={modal.overlay}>
          <div style={modal.box}>
            <h3 style={{ marginBottom: "10px" }}>✉ 이메일 보내기</h3>

            <p style={{ marginBottom: 10, color: "#666" }}>
              대상:{" "}
              {emailModal.targetUserId === "ALL"
                ? "전체 유저"
                : emailModal.targetEmail}
            </p>

            <input
              placeholder="제목"
              value={emailModal.subject}
              onChange={(e) =>
                setEmailModal({ ...emailModal, subject: e.target.value })
              }
              style={modal.input}
            />

            <textarea
              placeholder="내용"
              rows={6}
              value={emailModal.message}
              onChange={(e) =>
                setEmailModal({ ...emailModal, message: e.target.value })
              }
              style={modal.textarea}
            />

            <div style={modal.actions}>
              <button style={ui.smallGray} onClick={closeEmailModal}>
                취소
              </button>
              <button style={ui.smallBlue} onClick={sendEmail}>
                보내기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================
   UI 스타일 — 더 세련된 관리자 스타일
=============================== */

const ui = {
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  },
  th: {
    padding: "10px",
    background: "#f7f7f7",
    borderBottom: "2px solid #ddd",
  },
  td: {
    padding: "8px",
    borderBottom: "1px solid #eee",
  },
  row: {
    transition: "background 0.2s",
  },
  btnGroup: {
    display: "flex",
    gap: "4px",
  },

  /* 작고 단정한 버튼 구성 */
  small: {
    padding: "4px 8px",
    fontSize: "12px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    background: "#fff",
    cursor: "pointer",
  },
  smallGray: {
    padding: "4px 8px",
    fontSize: "12px",
    background: "#e7e7e7",
    border: "1px solid #d5d5d5",
    borderRadius: "4px",
    cursor: "pointer",
  },
  smallBlue: {
    padding: "4px 8px",
    fontSize: "12px",
    color: "#fff",
    background: "#007bff",
    border: "1px solid #007bff",
    borderRadius: "4px",
    cursor: "pointer",
  },
  smallGreen: {
    padding: "4px 8px",
    fontSize: "12px",
    color: "#fff",
    background: "#28a745",
    border: "1px solid #28a745",
    borderRadius: "4px",
    cursor: "pointer",
  },
  smallRed: {
    padding: "4px 8px",
    fontSize: "12px",
    color: "#fff",
    background: "#d9534f",
    border: "1px solid #d9534f",
    borderRadius: "4px",
    cursor: "pointer",
  },
  allMailButton: {
    padding: "8px 16px",
    fontSize: "13px",
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    marginBottom: "20px",
    cursor: "pointer",
  },
};

/* ============================
   모달 스타일
=============================== */

const modal = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  box: {
    width: "420px",
    background: "#fff",
    borderRadius: "10px",
    padding: "20px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    marginBottom: "10px",
  },
  textarea: {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    marginBottom: "10px",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
  },
};
