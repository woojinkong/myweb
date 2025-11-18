import { useEffect, useState, useContext } from "react";
import axiosInstance from "../api/axiosInstance";
import { FiMail, FiSend, FiEye, FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import UserProfilePopup from "./UserProfilepopup";

export default function InBox() {
  const [messages, setMessages] = useState([]);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [openProfileId, setOpenProfileId] = useState(null); // 🔥 추가
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // ✅ 받은 쪽지 목록 불러오기
  useEffect(() => {
    if (!user || !user.userId) return;

    const fetchMessages = async () => {
      try {
        const res = await axiosInstance.get("/message/received");
        setMessages(res.data);
      } catch (err) {
        console.error("쪽지 목록 불러오기 실패:", err);
      }
    };

    fetchMessages();
  }, [user]);

  // ✅ 쪽지 읽음 처리
  const handleRead = async (msg) => {
    setSelectedMsg(msg);

    if (msg.isRead) return;

    try {
      await axiosInstance.post(`/message/${msg.messageNo}/read`);
      setMessages((prev) =>
        prev.map((m) =>
          m.messageNo === msg.messageNo ? { ...m, isRead: true } : m
        )
      );
    } catch (err) {
      console.error("읽음 처리 실패:", err);
    }
  };

  // ✅ 쪽지 삭제
  const handleDelete = async (msgNo) => {
    if (!window.confirm("정말 이 쪽지를 삭제하시겠습니까?")) return;

    try {
      await axiosInstance.delete(`/message/${msgNo}`);
      setMessages((prev) => prev.filter((m) => m.messageNo !== msgNo));
    } catch (err) {
      console.error("삭제 실패:", err);
      alert("쪽지 삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📥 받은 쪽지함</h2>

      <div style={styles.topBar}>
        <button style={styles.switchBtn} onClick={() => navigate("/outbox")}>
          <FiSend /> 보낸 쪽지함
        </button>
      </div>

      {/* 쪽지 리스트 */}
      <div style={styles.table}>
        <div style={styles.header}>
          <span style={{ flex: 2 }}>보낸 사람</span>
          <span style={{ flex: 5 }}>내용</span>
          <span style={{ flex: 2 }}>날짜</span>
          <span style={{ flex: 1 }}>읽음</span>
          <span style={{ flex: 1 }}>삭제</span>
        </div>

        {messages.length === 0 ? (
          <div style={styles.empty}>📭 받은 쪽지가 없습니다.</div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.messageNo}
              style={{
                ...styles.row,
                background: msg.isRead ? "#fafafa" : "#e8f5ff",
              }}
            >
              {/* 🔥 보낸 사람 클릭 → 프로필 팝업 */}
              <span
                style={{
                  flex: 2,
                  fontWeight: "600",
                  cursor: "pointer",
                  color: "#007bff",
                }}
                onClick={(e) => setOpenProfileId({
                  id: msg.senderId,
                  x: e.clientX,
                  y: e.clientY
                })}
              >
                {msg.senderId}
              </span>

              <span
                style={{ flex: 5, cursor: "pointer" }}
                onClick={() => handleRead(msg)}
              >
                {msg.content.length > 35
                  ? msg.content.slice(0, 35) + "..."
                  : msg.content}
              </span>

              <span style={{ flex: 2, fontSize: "13px", color: "#666" }}>
                {new Date(msg.sendDate).toLocaleString("ko-KR", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>

              <span style={{ flex: 1 }}>
                {msg.isRead ? (
                  <FiEye color="#888" />
                ) : (
                  <FiMail color="#007bff" />
                )}
              </span>

              <span style={{ flex: 1 }}>
                <FiTrash2
                  color="#d33"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleDelete(msg.messageNo)}
                />
              </span>
            </div>
          ))
        )}
      </div>

      {/* 📌 쪽지 내용 모달 */}
      {selectedMsg && (
        <div style={styles.overlay} onClick={() => setSelectedMsg(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>✉️ 쪽지 내용</h3>

            <p>
              <strong>보낸 사람:</strong> {selectedMsg.senderId}
            </p>
            <p>
              <strong>받은 날짜:</strong>{" "}
              {new Date(selectedMsg.sendDate).toLocaleString("ko-KR")}
            </p>

            <div style={styles.modalContent}>{selectedMsg.content}</div>

            <button
              style={styles.closeBtn}
              onClick={() => setSelectedMsg(null)}
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* 📌 프로필 팝업 (UserProfilePopup) */}
      {openProfileId && (
        <UserProfilePopup
          userId={openProfileId.id}
          position={{ x: openProfileId.x, y: openProfileId.y }}
          onClose={() => setOpenProfileId(null)}
        />
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "900px",
    margin: "80px auto",
    padding: "20px",
    background: "#fff",
    borderRadius: "10px",
    boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
  },
  title: {
    fontSize: "22px",
    fontWeight: "700",
    marginBottom: "10px",
  },
  topBar: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "10px",
  },
  switchBtn: {
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "6px 12px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  table: {
    display: "flex",
    flexDirection: "column",
    border: "1px solid #ddd",
    borderRadius: "6px",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    background: "#f1f1f1",
    padding: "10px",
    fontWeight: "600",
    fontSize: "14px",
  },
  row: {
    display: "flex",
    alignItems: "center",
    padding: "10px",
    borderBottom: "1px solid #eee",
    transition: "background 0.2s ease",
  },
  empty: {
    textAlign: "center",
    padding: "20px",
    color: "#777",
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
  },
  modal: {
    background: "#fff",
    borderRadius: "10px",
    padding: "20px",
    width: "400px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
  },
  modalTitle: {
    fontSize: "18px",
    fontWeight: "700",
    marginBottom: "10px",
  },
  modalContent: {
    margin: "15px 0",
    whiteSpace: "pre-line",
    lineHeight: "1.5",
  },
  closeBtn: {
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "8px 14px",
    cursor: "pointer",
    display: "block",
    marginLeft: "auto",
  },
};
