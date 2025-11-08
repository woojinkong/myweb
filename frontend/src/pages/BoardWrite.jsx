import { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function BoardWrite() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "free",
  });

  const [images, setImages] = useState([]); // ✅ 여러 장 이미지 저장
  const [previews, setPreviews] = useState([]); // ✅ 미리보기 이미지 URL
  const removeImage = (index) => {
  setImages((prev) => prev.filter((_, i) => i !== index));
  setPreviews((prev) => prev.filter((_, i) => i !== index));
    };
  // 입력값 변경
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 여러 장 이미지 선택
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]); // ✅ 누적 방식

    // 미리보기 URL 생성
    const previewUrls = files.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...previewUrls]); // ✅ 기존 미리보기 유지
  };

  // 폼 제출
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
    formData.append("category", form.category);

    

    // ✅ 여러 장 업로드
    images.forEach((img) => formData.append("images", img));

    try {
      await axiosInstance.post("/board", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      alert("게시글이 등록되었습니다!");
      navigate(`/board?category=${form.category}`);
    } catch (err) {
      console.error(err);
      alert("등록 중 오류가 발생했습니다.");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>게시글 작성</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
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

        {/* ✅ 여러 장 업로드 */}
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          style={{ marginTop: "10px" }}
        />

        {/* ✅ 미리보기 영역 */}
        {previews.length > 0 && (
          <div style={styles.previewContainer}>
           {previews.map((src, idx) => (
                <div key={idx} style={{ position: "relative" }}>
                <img src={src} alt={`preview-${idx}`} style={styles.previewImage} />
                <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    background: "rgba(0,0,0,0.5)",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    }}
                >
                    ❌
                </button>
                </div>
            ))}
          </div>
        )}

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
  previewContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "10px",
  },
  previewImage: {
    width: "100px",
    height: "100px",
    objectFit: "cover",
    borderRadius: "6px",
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
