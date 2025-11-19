import { useState } from "react";
import axiosInstance from "../api/axiosInstance";

export default function Contact() {
  const [form, setForm] = useState({
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.subject || !form.message) {
      return alert("모든 항목을 입력해주세요.");
    }

    try {
      await axiosInstance.post("/contact/send", form);
      alert("문의가 성공적으로 접수되었습니다.");
      setForm({ email: "", subject: "", message: "" });
    } catch (err) {
      console.error("문의 전송 실패:", err);
      alert("문의 전송 중 오류가 발생했습니다.");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>문의하기</h2>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="email"
          name="email"
          placeholder="본인 이메일 주소"
          value={form.email}
          onChange={handleChange}
          style={styles.input}
        />

        <input
          type="text"
          name="subject"
          placeholder="제목"
          value={form.subject}
          onChange={handleChange}
          style={styles.input}
        />

        <textarea
          name="message"
          placeholder="문의 내용을 입력하세요."
          rows="6"
          value={form.message}
          onChange={handleChange}
          style={styles.textarea}
        />

        <button type="submit" style={styles.button}>
          문의 보내기
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "700px",
    margin: "80px auto",
    padding: "20px",
  },
  title: {
    fontSize: "26px",
    fontWeight: "700",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  input: {
    padding: "12px",
    fontSize: "15px",
    border: "1px solid #ccc",
    borderRadius: "6px",
  },
  textarea: {
    padding: "12px",
    fontSize: "15px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    resize: "vertical",
  },
  button: {
    padding: "12px",
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    cursor: "pointer",
  },
};
