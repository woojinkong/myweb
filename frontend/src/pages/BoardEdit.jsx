import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import useAuth from "../hooks/useAuth";

// TipTap
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";

import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { YouTube } from "../api/youtube";
// 이미지 업로드 기능
import { ImageUpload } from "../api/ImageUpload";

export default function BoardEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [groupId, setGroupId] = useState("");
  const [saving, setSaving] = useState(false);


  const CustomImage = Image.extend({
  addAttributes() {
    return {
      src: { default: null },

      textAlign: {
        default: "center",
        parseHTML: element => element.getAttribute("data-text-align") || "center",
        renderHTML: attributes => ({
          "data-text-align": attributes.textAlign,
        }),
      },

      style: {
        default: "max-width:100%; height:auto; border-radius:8px;",
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "figure",
      {
        "data-text-align": HTMLAttributes["data-text-align"] || "center",
        style: `text-align:${HTMLAttributes["data-text-align"]}; margin:12px 0;`,
      },
      ["img", { src: HTMLAttributes.src, style: HTMLAttributes.style }],
    ];
  },
});


  /* ------------------------------------
     📝 TipTap Editor
  ------------------------------------ */
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: false,  // StarterKit 내 중복 제거
        underline:false,           // ⭐ 이것만 underline 기능 제공
      }),
      Underline,
      Link.configure({
      openOnClick: true,
      autolink: true,
      linkOnPaste: true,
     }),
      YouTube,
      CustomImage,
      ImageUpload,
      TextStyle,
      Color.configure({ types: ["textStyle"] }),

      Placeholder.configure({
        placeholder: "내용을 입력하세요…",
      }),
      TextAlign.configure({
      types: ["heading", "paragraph", "image","youtube"],  // ⭐ 이미지에도 정렬 적용
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
    if (saving) return;
   setSaving(true);
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
   /* ------------------------------
      Toolbar UI
  ------------------------------ */
 const Toolbar = () => (
  <div style={styles.toolbar}>

    <button type="button" style={styles.btn} onClick={() => editor.chain().focus().toggleBold().run()}>
      <i className="fa-solid fa-bold"></i>
    </button>

    <button type="button" style={styles.btn} onClick={() => editor.chain().focus().toggleUnderline().run()}>
      <i className="fa-solid fa-underline"></i>
    </button>

    <button type="button" style={styles.btn} onClick={() => editor.chain().focus().toggleStrike().run()}>
      <i className="fa-solid fa-strikethrough"></i>
    </button>

    <button type="button" style={styles.btn} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
      H2
    </button>

    <button type="button" style={styles.btn} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
      H3
    </button>

    <button type="button" style={styles.btn} onClick={() => editor.commands.uploadImage()}>
      <i className="fa-solid fa-image"></i>
    </button>

    <button type="button" style={styles.btn} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
      <i className="fa-solid fa-align-left"></i>
    </button>

    <button type="button" style={styles.btn} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
      <i className="fa-solid fa-align-center"></i>
    </button>

    <button type="button" style={styles.btn} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
      <i className="fa-solid fa-align-right"></i>
    </button>

    <input
      type="color"
      onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
      style={styles.colorPicker}
    />

    <button type="button" style={styles.btn} onClick={() => editor.chain().focus().unsetColor().run()}>
      <i className="fa-solid fa-eraser"></i>
    </button>

  </div>
);



  return (
    <div style={styles.container}>
      <h2 style={styles.title}>✏️ 게시글 수정</h2>
      <div style={styles.toolbarWrapper}>
          <Toolbar />
        </div>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={styles.input}
        />

        
        <div style={styles.editorBox} className="tiptap">
          <EditorContent editor={editor} />
        </div>

        <div style={styles.buttonRow}>
          <button type="submit" 
          disabled={saving}
          style={styles.submitButton}>
            {saving ? "수정 중..." : "수정하기"}
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
    maxWidth: "680px",
    margin: "40px auto",
    padding: "20px",
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: "10px",
  },
  title: {
    textAlign: "center",
    marginBottom: "18px",
    fontSize: "20px",
    fontWeight: "600",
  },
  form: { display: "flex", flexDirection: "column", gap: "12px" },
  input: {
    padding: "10px 12px",
    border: "1px solid #e0e0e0",
    borderRadius: "6px",
    fontSize: "14px",
  },
  toolbarWrapper: {
  position: "sticky",
  top: "60px",                      // Navbar 높이
  zIndex: 1950,
  background: "transparent",
  display: "flex",
  justifyContent: "center",
  maxWidth: "680px",
  margin: "0 auto",
  width: "100%",
  },
  toolbar: {
  width: "100%",
  maxWidth: "680px",
  margin: "0 auto",
  background: "#fafafa",
  padding: "8px 0",
  borderRadius: "8px",
  border: "1px solid #ddd",
  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
},

  btn: {
    border: "none",
    padding: "6px 8px",
    background: "transparent",
    fontSize: "15px",
    cursor: "pointer",
    borderRadius: "6px",
    transition: "0.15s",
  },
  colorPicker: {
    width: "26px",
    height: "26px",
    border: "none",
    cursor: "pointer",
    background: "transparent",
  },
  editorBox: {
    minHeight: "250px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    padding: "12px",
  },
  buttonRow: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "20px",
  },
  submitButton: {
    padding: "10px 16px",
    background: "#4CAF50",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  cancelButton: {
    padding: "10px 16px",
    background: "#888",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};