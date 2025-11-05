import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import useAuth from "../hooks/useAuth";

export default function BoardEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({
    title: "",
    content: "",
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  // ✅ 기존 게시글 정보 불러오기
  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const res = await axiosInstance.get(`/board/${id}`);
        const board = res.data;

        // 작성자 본인 아닌 경우 접근 제한
        if (!user || user.userId !== board.userId) {
          alert("수정 권한이 없습니다!");
          navigate("/board");
          return;
        }

        setForm({ title: board.title, content: board.content });
        setPreview(`http://localhost:8080${board.imagePath}`);
      } catch (err) {
        console.error("게시글 불러오기 실패:", err);
        alert("게시글을 불러올 수 없습니다.");
        navigate("/board");
      }
    };
    fetchBoard();
  }, [id, user, navigate]);

  // ✅ 입력 변경
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ 이미지 업로드
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  // ✅ 수정 요청
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("content", form.content);
    if (image) formData.append("image", image);

    try {
      await axiosInstance.put(`/board/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("게시글이 수정되었습니다!");
      navigate(`/board/${id}`);
    } catch (err) {
      console.error(err);
      alert("수정 중 오류가 발생했습니다.");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>✏️ 게시글 수정</h2>
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

        {preview && (
          <div style={styles.previewBox}>
            <img src={preview} alt="미리보기" style={styles.previewImg} />
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ marginBottom: "15px" }}
        />

        <div style={styles.buttonBox}>
          <button type="submit" style={styles.submitButton}>
            ✅ 수정 완료
          </button>
          <button
            type="button"
            onClick={() => navigate(`/board/${id}`)}
            style={styles.cancelButton}
          >
            🔙 취소
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "600px",
    margin: "60px auto",
    background: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  },
  title: {
    textAlign: "center",
    fontSize: "24px",
    fontWeight: "700",
    marginBottom: "20px",
    color: "#333",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  textarea: {
    height: "180px",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    resize: "none",
    fontSize: "16px",
  },
  previewBox: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    overflow: "hidden",
  },
  previewImg: {
    width: "100%",
    height: "auto",
  },
  buttonBox: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "15px",
  },
  submitButton: {
    background: "#4CAF50",
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "15px",
  },
  cancelButton: {
    background: "#999",
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "15px",
  },
};
