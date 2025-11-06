import { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Cookies from "js-cookie";

export default function BoardWrite() {
  const navigate = useNavigate();
  const { user } = useAuth(); // ✅ 로그인 유저 정보 가져오기

  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "free", // ✅ 기본값
  });
  const [image, setImage] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("로그인이 필요합니다!");
      navigate("/login");
      return;
    }

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("content", form.content);
    formData.append("category", form.category); // ✅ 카테고리 전송
    if (image) formData.append("image", image);

    try {
      await axiosInstance.post("/board", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      alert("게시글이 등록되었습니다!");
      navigate(`/board?category=${form.category}`); // ✅ 선택한 카테고리로 이동
    } catch (err) {
      console.error(err);
      alert("등록 중 오류가 발생했습니다.");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>게시글 작성</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        {/* ✅ 카테고리 선택 */}
        <label style={styles.label}>
          📂 카테고리 선택:
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            style={styles.select}
          >
            <option value="notice">공지</option>
            <option value="free">자유</option>
            <option value="inform">정보</option>
          </select>
        </label>

        <input
          type="text"
          name="title"
          placeholder="제목"
          value={form.title}
          onChange={handleChange}
          required
          style={styles.input}
        />

        <textarea
          name="content"
          placeholder="내용"
          value={form.content}
          onChange={handleChange}
          required
          style={styles.textarea}
        />

        <input type="file" accept="image/*" onChange={handleFileChange} />

        <button type="submit" style={styles.button}>
          등록하기
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "600px",
    margin: "50px auto",
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    backgroundColor: "#fff",
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  label: {
    fontWeight: "bold",
    marginBottom: "5px",
  },
  select: {
    width: "100%",
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    marginTop: "5px",
    marginBottom: "10px",
  },
  input: {
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  textarea: {
    height: "150px",
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "10px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};
