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
    if (image) formData.append("image", image);

    try {
      await axiosInstance.post("/board", formData, {
       headers: {
        "Content-Type": "multipart/form-data",
        //Authorization: `Bearer ${Cookies.get("accessToken")}`, // ✅ 꼭 붙이기
    },
        withCredentials: true, // ✅ 쿠키 포함 요청
      });
      alert("게시글이 등록되었습니다!");
      navigate("/board");
    } catch (err) {
      console.error(err);
      alert("등록 중 오류가 발생했습니다.");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>게시글 작성</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
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
