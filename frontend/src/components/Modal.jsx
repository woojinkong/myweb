export default function Modal({ title, content, onClose }) {
  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3 style={styles.title}>{title}</h3>

        <div style={styles.content}>
          {content}
        </div>

        <button style={styles.closeBtn} onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    background: "#fff",
    padding: "20px",
    width: "90%",
    maxWidth: "420px",
    borderRadius: "10px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
    animation: "fadeIn 0.25s",
  },
  title: {
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "12px",
  },
  content: {
    fontSize: "14px",
    lineHeight: "1.6",
    marginBottom: "20px",
    maxHeight: "300px",
    overflowY: "auto",
    whiteSpace: "pre-wrap",   // ⭐ 개행(\n), 공백 유지 + 자동줄바꿈 활성화
  },
  closeBtn: {
    width: "100%",
    padding: "10px",
    background: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};
