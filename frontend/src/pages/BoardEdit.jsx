import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import useAuth from "../hooks/useAuth";

// TipTap
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";

// 이미지 업로드 기능
import { ImageUpload } from "../api/ImageUpload";

export default function BoardEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [groupId, setGroupId] = useState("");


  const CustomImage = Image.extend({
  addAttributes() {
    return {
      src: {
        default: null,
      },
      style: {
        default:
          "max-width:100%; height:auto; display:block; margin:12px auto; border-radius:8px;",
      },
    };
  },
});

  /* ------------------------------------
     📝 TipTap Editor
  ------------------------------------ */
  const editor = useEditor({
    extensions: [
      StarterKit,
      CustomImage,
      // Image.extend({
      //   addAttributes() {
      //     return {
      //       style: {
      //         default:
      //           "max-width:100%; height:auto; display:block; margin:12px auto; border-radius:8px;",
      //       },
      //     };
      //   },
      // }),
      ImageUpload,
      Placeholder.configure({
        placeholder: "내용을 입력하세요…",
      }),
    ],

    editorProps: {
      attributes: {
        style:
          "min-height:300px; padding:12px; line-height:1.7; overflow-wrap:break-word;",
      },
    },
  });

  /* ------------------------------------
     📌 게시글 로드
  ------------------------------------ */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosInstance.get(`/board/${id}`);
        const b = res.data;

        if (!user || (user.userId !== b.userId && user.role !== "ADMIN")) {
          alert("수정 권한이 없습니다.");
          return navigate("/board");
        }

        setTitle(b.title);
        setGroupId(b.groupId);

        const BASE_URL = import.meta.env.VITE_API_URL;

        // ⭐ /uploads/ → BASE_URL/uploads 로 변환해야 TipTap에서 정상 표시됨
        const fixedContent = b.content.replace(
        /src="\/uploads\//g,
        `src="${BASE_URL}/uploads/`
        );


        editor.commands.setContent(fixedContent);
        
      } catch (err) {
        console.error(err);
        alert("게시글을 불러올 수 없습니다.");
        navigate("/board");
      }
    };

    if (editor) load();
  }, [editor, id, user, navigate]);

  /* ------------------------------------
     📤 수정 제출
  ------------------------------------ */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) return alert("제목을 입력하세요!");
    if (!editor?.getHTML()?.trim()) return alert("내용을 입력하세요!");

    let html = editor.getHTML();

    const BASE_URL = import.meta.env.VITE_API_URL;
    //const escaped = BASE_URL.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");

    // 🔥 어떤 절대경로든지 uploads만 남기고 상대경로로 강제 변환
    html = html.replace(/src="https?:\/\/[^"]*\/uploads\//g, 'src="/uploads/');

    // 🔥 src="uploads/xxx" 형태도 보정해줘야 함 (중요!)
    html = html.replace(/src="uploads\//g, 'src="/uploads/');
    const fd = new FormData();
    fd.append("title", title);
    fd.append("content", html);
    fd.append("groupId", groupId);

    try {
      await axiosInstance.put(`/board/${id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("게시글이 수정되었습니다!");
      navigate(`/board/${id}`);
    } catch (err) {
      console.error(err);
      alert("수정 중 오류 발생");
    }
  };

  if (!editor) return null;

  /* ------------------------------------
     🎨 Toolbar
  ------------------------------------ */
  const Toolbar = () => (
  <div style={styles.toolbar}>
    <button type="button" onClick={() => editor.chain().focus().toggleBold().run()}>
      <b>B</b>
    </button>

    <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()}>
      <i>I</i>
    </button>

    <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()}>
      <s>S</s>
    </button>

    <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
      H2
    </button>

    <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
      H3
    </button>

    <button type="button" onClick={() => editor.commands.uploadImage()}>
      🖼 Image
    </button>

    <button type="button" onClick={() => editor.chain().focus().undo().run()}>
      ↶ Undo
    </button>

    <button type="button" onClick={() => editor.chain().focus().redo().run()}>
      ↷ Redo
    </button>
  </div>
);


  return (
    <div style={styles.container}>
      <h2 style={styles.title}>✏️ 게시글 수정</h2>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={styles.input}
        />

        <Toolbar />

        <div style={styles.editorBox} className="tiptap">
          <EditorContent editor={editor} />
        </div>

        <div style={styles.buttonRow}>
          <button type="submit" style={styles.submitButton}>
            수정 완료
          </button>
          <button
            type="button"
            onClick={() => navigate(`/board/${id}`)}
            style={styles.cancelButton}
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
}

/* ------------------------------------
   🎨 스타일
------------------------------------ */
const styles = {
  container: {
    maxWidth: "750px",
    margin: "60px auto",
    padding: "30px",
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 3px 9px rgba(0,0,0,0.1)",
  },
  title: {
    textAlign: "center",
    fontSize: "24px",
    fontWeight: "700",
    marginBottom: "20px",
  },
  form: { display: "flex", flexDirection: "column", gap: "12px" },
  input: {
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  toolbar: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    background: "#f9f9f9",
  },
  editorBox: {
    minHeight: "300px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    padding: "10px",
  },
  buttonRow: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "20px",
  },
  submitButton: {
    background: "#4CAF50",
    color: "#fff",
    padding: "10px 16px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
  },
  cancelButton: {
    background: "#888",
    color: "#fff",
    padding: "10px 16px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
  },
};
