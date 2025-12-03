import { useState } from "react";
import axiosInstance from "../api/axiosInstance";

export default function AdminPasswordModal({ onClose, onSuccess }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axiosInstance.post("/admin/verify-password", {
        password,
      });

      if (res.data === true) {
        onSuccess();
        onClose();
      } else {
        setError("비밀번호가 올바르지 않습니다.");
      }
    } catch (err) {
      console.error(err);
      setError("서버 오류가 발생했습니다.");
    }
  };

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modal}>
        <h3>관리자 비밀번호</h3>

        <form onSubmit={handleSubmit} style={{ marginTop: "10px" }}>
          <input
            type="password"
            placeholder="비밀번호 입력"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={modalStyles.input}
          />
          {error && <div style={modalStyles.error}>{error}</div>}

          <div style={modalStyles.btnBox}>
            <button type="button" onClick={onClose} style={modalStyles.cancel}>
              취소
            </button>
            <button type="submit" style={modalStyles.confirm}>
              확인
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const modalStyles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 4000,
  },
  modal: {
    background: "#fff",
    padding: "20px",
    width: "90%",
    maxWidth: "360px",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    animation: "fadeIn 0.25s",
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "15px",
  },
  error: {
    marginTop: "6px",
    color: "red",
    fontSize: "13px",
  },
  btnBox: {
    marginTop: "15px",
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
  },
  cancel: {
    padding: "8px 14px",
    border: "1px solid #aaa",
    borderRadius: "6px",
    background: "#f5f5f5",
    cursor: "pointer",
  },
  confirm: {
    padding: "8px 14px",
    border: "none",
    borderRadius: "6px",
    background: "#007bff",
    color: "#fff",
    cursor: "pointer",
  },
};
