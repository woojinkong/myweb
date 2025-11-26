import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
// TipTap
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
// 서버 확장 이미지 업로드 기능
import { ImageUpload } from "../api/ImageUpload";
import Image from "@tiptap/extension-image";

import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { YouTube } from "../api/youtube";

export default function BoardWrite() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const groupId = new URLSearchParams(location.search).get("groupId");
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);


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
     📝 TipTap Editor 초기화
  ------------------------------------ */
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: false,
        underline: false,  
      }),
      Underline,     // ⭐ 반드시 추가
      Link.configure({
      openOnClick: true,
      autolink: true,
      linkOnPaste: true,
    }),
      YouTube,
      CustomImage,
      TextStyle,
       Color.configure({ types: ["textStyle"] }),
      ImageUpload, // ⭐ 서버 업로드 기능 확장
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
          "min-height:300px; line-height:1.6; padding:10px; overflow-wrap:break-word;",
      },
    },
    content: "",
  });


  /* ------------------------------------
     📤 게시글 등록
  ------------------------------------ */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return; // 중복 제출 방지
   setSubmitting(true);

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
      const msg = err.response?.data?.message || "등록 중 오류 발생!";

      alert(msg);
      setSubmitting(false);   // ← 반드시 필요!!
    }
  };

  if (!editor) return null;

  /* ------------------------------------
     🎨 Toolbar 버튼 UI
  ------------------------------------ */
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

    <button type="button" tyle={styles.btn} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
      H3
    </button>

    <button type="button" style={styles.btn} onClick={() => editor.commands.uploadImage()}>
      <i className="fa-solid fa-image"></i>
    </button>

    {/* 정렬 */}
    <button type="button" style={styles.btn} onClick={() => editor.chain().focus().setTextAlign('left').run()}>
      <i className="fa-solid fa-align-left"></i>
    </button>

    <button type="button" style={styles.btn} onClick={() => editor.chain().focus().setTextAlign('center').run()}>
      <i className="fa-solid fa-align-center"></i>
    </button>

    <button type="button" style={styles.btn} onClick={() => editor.chain().focus().setTextAlign('right').run()}>
      <i className="fa-solid fa-align-right"></i>
    </button>

    {/* 색상 변경 */}
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

        <div className="toolbar-wrapper">
          <Toolbar />
        </div>

        <div style={styles.editorBox} className="tiptap">
          <EditorContent editor={editor} />
        </div>

        <button type="submit" 
        style={{
        ...styles.button,
        opacity: submitting ? 0.6 : 1,
        pointerEvents: submitting ? "none" : "auto",
      }}>
          {submitting ? "등록 중..." : "등록하기"}
          </button>
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
    color: "#333",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  input: {
    padding: "10px 12px",
    border: "1px solid #e0e0e0",
    borderRadius: "6px",
    fontSize: "14px",
    outline: "none",
  },

  toolbarWrapper: {
  position: "sticky",
  top: "60px",                      // Navbar 높이
  zIndex: 3000,
  background: "transparent",
  display: "flex",
  justifyContent: "center",
  },




  toolbar: {
  width: "100%",
  maxWidth: "680px",
  background: "#fafafa",
  padding: "8px",
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

btnActive: {
  background: "#ececec",
},

colorPicker: {
  width: "26px",
  height: "26px",
  padding: 0,
  border: "none",
  background: "transparent",
  cursor: "pointer",
},




  toolbarBtn: {
    border: "none",
    background: "transparent",
    padding: "6px 8px",
    borderRadius: "4px",
    fontSize: "13px",
    cursor: "pointer",
    color: "#555",
  },

  toolbarBtnActive: {
    background: "#e6e6e6",
  },

  editorBox: {
  minHeight: "250px",
  border: "1px solid #ccc",
  borderRadius: "6px",
  padding: "12px",
},


  button: {
    padding: "10px",
    background: "#4a6cf7",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "15px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "0.15s",
  },
};
