import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

// TipTap
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

// 서버 확장 이미지 업로드 기능
import { ImageUpload } from "../api/ImageUpload";
import Image from "@tiptap/extension-image";
export default function BoardWrite() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const groupId = new URLSearchParams(location.search).get("groupId");
  const [title, setTitle] = useState("");

  /* ------------------------------------
     🔐 로그인 + groupId 체크
  ------------------------------------ */
  useEffect(() => {
    if (!user) {
      alert("로그인이 필요합니다!");
      navigate("/login");
    }
    if (!groupId) {
      alert("올바르지 않은 게시판 접근입니다.");
      navigate("/");
    }
  }, [user, groupId, navigate]);


  const CustomImage = Image.extend({
  addAttributes() {
    return {
      src: { default: null },
      style: {
        default:
          "max-width:100%; height:auto; display:block; margin:12px auto; border-radius:8px;",
      },
    };
  },
});


  /* ------------------------------------
     📝 TipTap Editor 초기화
  ------------------------------------ */
  const editor = useEditor({
    extensions: [
      StarterKit,
      CustomImage,
      ImageUpload, // ⭐ 서버 업로드 기능 확장
      Placeholder.configure({
        placeholder: "내용을 입력하세요…",
      }),
    ],

    editorProps: {
      attributes: {
        style:
          "min-height:300px; line-height:1.6; padding:10px; overflow-wrap:break-word;",
      },
    },
    content: "",
  });

  /* ------------------------------------
     ▶ 링크 삽입 핸들러
  ------------------------------------ */
  const setLink = useCallback(() => {
    const url = window.prompt("링크 URL을 입력하세요:");
    if (url === null) return;

    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: url }).run();
  }, [editor]);

  /* ------------------------------------
     📤 게시글 등록
  ------------------------------------ */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) return alert("제목을 입력하세요!");
    if (!editor?.getHTML()?.trim()) return alert("내용을 입력하세요!");

    const fd = new FormData();
    fd.append("title", title);
    fd.append("content", editor.getHTML());
    fd.append("groupId", groupId);

    try {
      await axiosInstance.post("/board", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("게시글이 등록되었습니다!");
      navigate(`/board?groupId=${groupId}`);
    } catch (err) {
      console.error(err);
      alert("등록 중 오류 발생!");
    }
  };

  if (!editor) return null;

  /* ------------------------------------
     🎨 Toolbar 버튼 UI
  ------------------------------------ */
  const Toolbar = () => (
  <div style={styles.toolbar}>
    <button type="button" onClick={() => editor.chain().focus().toggleBold().run()}>
      <b>B</b>
    </button>

    <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()}>
      <i>I</i>
    </button>

    <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()}>
      <u>U</u>
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

    <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()}>
      • List
    </button>

    <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()}>
      1. List
    </button>

    <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()}>
      ❝ Quote
    </button>

    <button type="button" onClick={setLink}>🔗 Link</button>

    <button type="button" onClick={() => editor.commands.uploadImage()}>
      🖼️ Image
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
      <h2 style={styles.title}>📋 게시글 작성</h2>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          placeholder="제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={styles.input}
          required
        />

        <Toolbar />

        <div style={styles.editorBox} className="tiptap">
          <EditorContent editor={editor} />
        </div>

        <button type="submit" style={styles.button}>등록하기</button>
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
    margin: "50px auto",
    padding: "25px",
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: "12px",
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
    fontSize: "22px",
    fontWeight: "700",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  input: {
    padding: "12px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "15px",
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
    background: "#fff",
  },
  button: {
    padding: "12px",
    background: "#4CAF50",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    cursor: "pointer",
  },
};
