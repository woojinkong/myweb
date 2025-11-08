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
    category: "free",
  });
  const [images, setImages] = useState([]); // ✅ 새로 선택한 이미지
  const [previews, setPreviews] = useState([]); // ✅ 미리보기
  const [existingImages, setExistingImages] = useState([]); // ✅ 서버에 이미 저장된 이미지

  // ✅ 기존 게시글 불러오기
  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const res = await axiosInstance.get(`/board/${id}`);
        const board = res.data;

        // 권한 검사
        if (!user ||(user.userId !== board.userId && user.role !== "ADMIN")) {
          alert("수정 권한이 없습니다!");
          navigate("/board");
          return;
        }

        setForm({
          title: board.title,
          content: board.content,
          category: board.category,
        });

        // ✅ 기존 이미지들
        if (board.images && board.images.length > 0) {
          setExistingImages(board.images);
        }
      } catch (err) {
        console.error("게시글 불러오기 실패:", err);
        alert("게시글을 불러올 수 없습니다.");
        navigate("/board");
      }
    };
    fetchBoard();
  }, [id, user, navigate]);

  // ✅ 입력값 변경
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ 새 이미지 선택
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
    const previewUrls = files.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...previewUrls]);
    e.target.value = ""; // 같은 파일 다시 선택 가능하게
  };

  // ✅ 새로 추가한 이미지 삭제
  const removeNewImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // ✅ 기존 이미지 삭제
  const removeExistingImage = (imageId) => {
    setExistingImages((prev) => prev.filter((img) => img.imageId !== imageId));
  };

  // ✅ 수정 요청
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("content", form.content);
    formData.append("category", form.category);

    // ✅ 유지할 기존 이미지 ID만 전달
    const remainImageIds = existingImages.map((img) => img.imageId);
    formData.append("remainImageIds", JSON.stringify(remainImageIds));

    // ✅ 새로 추가한 이미지 추가
    images.forEach((img) => formData.append("images", img));

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

        {/* ✅ 기존 이미지 표시 */}
        {existingImages.length > 0 && (
          <div style={styles.previewContainer}>
            {existingImages.map((img) => (
              <div key={img.imageId} style={{ position: "relative" }}>
                <img
                  src={`http://localhost:8080${img.imagePath}`}
                  alt="기존 이미지"
                  style={styles.previewImage}
                />
                <button
                  type="button"
                  onClick={() => removeExistingImage(img.imageId)}
                  style={styles.deleteBtn}
                >
                  ❌
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ✅ 새로 추가한 이미지 미리보기 */}
        {previews.length > 0 && (
          <div style={styles.previewContainer}>
            {previews.map((src, idx) => (
              <div key={idx} style={{ position: "relative" }}>
                <img src={src} alt={`preview-${idx}`} style={styles.previewImage} />
                <button
                  type="button"
                  onClick={() => removeNewImage(idx)}
                  style={styles.deleteBtn}
                >
                  ❌
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ✅ 여러 장 업로드 */}
        <input
          type="file"
          accept="image/*"
          multiple
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
    maxWidth: "700px",
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
  deleteBtn: {
    position: "absolute",
    top: 0,
    right: 0,
    background: "rgba(0,0,0,0.5)",
    color: "#fff",
    border: "none",
    cursor: "pointer",
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
