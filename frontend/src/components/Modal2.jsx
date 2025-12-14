export default function Modal2({ title, children, onClose }) {
  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h3 style={styles.title}>{title}</h3>
          <button onClick={onClose} style={styles.closeIcon}>✕</button>
        </div>

        <div style={styles.content}>
          {children}
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
    background: "rgba(0,0,0,0.55)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
  },
  modal: {
    background: "#fff",
    width: "95%",
    maxWidth: "720px",
    maxHeight: "85vh",
    borderRadius: "12px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
  },
  header: {
    padding: "16px 20px",
    borderBottom: "1px solid #eee",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: "18px",
    fontWeight: "700",
  },
  closeIcon: {
    border: "none",
    background: "transparent",
    fontSize: "18px",
    cursor: "pointer",
  },
  content: {
    padding: "20px",
    overflowY: "auto",
    flex: 1,
  },
  closeBtn: {
    borderTop: "1px solid #eee",
    padding: "12px",
    background: "#007bff",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    borderBottomLeftRadius: "12px",
    borderBottomRightRadius: "12px",
  },
};
