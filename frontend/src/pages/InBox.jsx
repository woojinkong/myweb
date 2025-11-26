import { useEffect, useState, useContext } from "react";
import axiosInstance from "../api/axiosInstance";
import { FiMail, FiSend, FiEye, FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import UserProfilePopup from "./UserProfilepopup";

export default function InBox() {
  const [messages, setMessages] = useState([]);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [openProfileId, setOpenProfileId] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // 🔥 받은 쪽지 페이지 불러오기
  useEffect(() => {
    if (!user || !user.userId) return;

    const fetchMessages = async () => {
      try {
        const res = await axiosInstance.get(
          `/message/received?page=${page}&size=10`
        );

        setMessages(res.data.content);       // 반드시 content!
        setTotalPages(res.data.totalPages);  // 전체 페이지 저장
      } catch (err) {
        console.error("쪽지 목록 불러오기 실패:", err);
      }
    };

    fetchMessages();
  }, [user, page]);

  // 🔥 읽음 처리
  const handleRead = async (msg) => {
    setSelectedMsg(msg);

    if (msg.read) return;

    try {
      await axiosInstance.post(`/message/${msg.messageNo}/read`);
      setMessages((prev) =>
        prev.map((m) =>
          m.messageNo === msg.messageNo ? { ...m, read: true } : m
        )
      );
    } catch (err) {
      console.error("읽음 처리 실패:", err);
    }
  };

  // 🔥 삭제
  const handleDelete = async (msgNo) => {
    if (!window.confirm("쪽지를 삭제하시겠습니까?")) return;

    try {
      await axiosInstance.delete(`/message/${msgNo}`);
      setMessages((prev) => prev.filter((m) => m.messageNo !== msgNo));
    } catch (err) {
      console.error("삭제 실패:", err);
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
                background: msg.read ? "#fafafa" : "#e8f5ff",
              }}
            >
              <span
                style={{
                  flex: 2,
                  fontWeight: "600",
                  cursor: "pointer",
                  color: "#007bff",
                }}
                onClick={(e) =>
                  setOpenProfileId({
                    id: msg.senderId,
                    x: e.clientX,
                    y: e.clientY,
                  })
                }
              >
                {msg.senderNickName}
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
                {new Date(msg.sendDate).toLocaleString("ko-KR")}
              </span>

              <span style={{ flex: 1 }}>
                {msg.read ? <FiEye color="#888" /> : <FiMail color="#007bff" />}
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

      {/* ▽▽ 페이징 버튼 ▽▽ */}
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button disabled={page === 0} onClick={() => setPage(page - 1)}>
          이전
        </button>
        <span style={{ margin: "0 10px" }}>
          {page + 1} / {totalPages}
        </span>
        <button
          disabled={page + 1 >= totalPages}
          onClick={() => setPage(page + 1)}
        >
          다음
        </button>
      </div>

      {/* 내용 모달 */}
      {selectedMsg && (
        <div style={styles.overlay} onClick={() => setSelectedMsg(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>✉️ 쪽지 내용</h3>

            <p>
              <strong>보낸 사람:</strong> {selectedMsg.senderNickName}
            </p>
            <p>
              <strong>받은 날짜:</strong>{" "}
              {new Date(selectedMsg.sendDate).toLocaleString("ko-KR")}
            </p>

            <div style={styles.modalContent}>{selectedMsg.content}</div>

            <button style={styles.closeBtn} onClick={() => setSelectedMsg(null)}>
              닫기
            </button>
          </div>
        </div>
      )}

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
