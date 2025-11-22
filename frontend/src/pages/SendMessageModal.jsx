import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { FiX, FiSend } from "react-icons/fi";

export default function SendMessageModal({ receiverId, onClose }) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);


  // ✅ ESC 키로 닫기
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter" && e.ctrlKey) handleSend(); // Ctrl+Enter 전송
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [content]);




  const handleSend = async () => {
    if (!content.trim()) return alert("쪽지 내용을 입력하세요!");

    try {
      setSending(true);
      await axiosInstance.post("/message/send", {
        receiverId,
        content,
      });

      alert("쪽지가 성공적으로 전송되었습니다!");
      setContent("");
      onClose();
    } catch (err) {

      // ⭐ 포인트 부족일 때
      if (err.response?.status === 400) {
        alert(err.response.data.message); 
        return;
      }

      if (err.response?.status === 429) {
        alert(err.response.data.message); // 쿨타임 메시지 출력
        return;
      }

      alert("쪽지 전송 중 오류가 발생했습니다.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="send-message-overlay" 
    style={styles.overlay} 
    onClick={onClose}>

      <div className="send-message-modal"
      style={styles.modal} 
      onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={styles.closeBtn}>
          <FiX />
        </button>

        <h3 style={styles.title}>✉️ 쪽지 보내기(10p)</h3>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="쪽지 내용을 입력하세요... (Ctrl+Enter로 전송)"
          style={styles.textarea}
        />

        <button
          onClick={handleSend}
          style={{
            ...styles.sendBtn,
            opacity: sending ? 0.6 : 1,
            pointerEvents: sending ? "none" : "auto",
          }}
        >
          <FiSend /> 보내기
        </button>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 99999,
  },
  modal: {
    position: "relative",
    background: "#fff",
    borderRadius: "12px",
    padding: "24px",
    width: "400px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  closeBtn: {
    position: "absolute",
    top: "8px",
    right: "10px",
    background: "transparent",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
  },
  title: {
    margin: 0,
    textAlign: "center",
    fontSize: "20px",
    fontWeight: "700",
    color: "#333",
  },
  receiver: {
    fontSize: "14px",
    color: "#555",
  },
  textarea: {
    resize: "none",
    height: "120px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    padding: "10px",
    fontSize: "14px",
    outline: "none",
  },
  sendBtn: {
    background: "#4CAF50",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "10px",
    fontSize: "15px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    fontWeight: "600",
  },
};
