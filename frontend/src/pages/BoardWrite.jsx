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

const extractTitleFromContent = (html) => {
  if (!html) return "";

  // 1️⃣ HTML 태그 제거
  const text = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .trim();

  // 2️⃣ 줄 단위 분리
  const lines = text
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return "";

  // 3️⃣ 제목 길이 제한 (SEO + UI 기준)
  const title = lines[0];
  return title.length > 40 ? title.slice(0, 40) + "…" : title;
};

  /* ------------------------------------
     📝 TipTap Editor 초기화
  ------------------------------------ */
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        orderedList: false,
        bulletList: false,
        listItem: false,
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
        style: `
        min-height:300px;
        line-height:1.6;
        padding:10px;
        white-space: pre-wrap;
        word-break: break-word;
        overflow-wrap: break-word;
      `,
      },
    },
    content: "",
  });


    const removeLinkedTextNodes = () => {
    if (!editor) return;

    const json = editor.getJSON();

    const cleanse = (node) => {
      if (!node) return null;

      // 1️⃣ 링크가 걸린 텍스트 노드는 통째로 제거
      if (
        node.type === "text" &&
        node.marks?.some(mark => mark.type === "link")
      ) {
        return null;
      }

      // 2️⃣ 자식 노드가 있으면 재귀 처리
      if (node.content) {
        const cleanedChildren = node.content
          .map(cleanse)
          .filter(Boolean); // ⭐ null 제거

        return {
          ...node,
          content: cleanedChildren.length ? cleanedChildren : undefined,
        };
      }

      return node;
    };

    const cleaned = cleanse({ ...json });

    editor.commands.setContent(cleaned, false);
  };




  

  

  /* ------------------------------------
     📤 게시글 등록
  ------------------------------------ */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return; // 중복 제출 방지
   setSubmitting(true);

    let finalTitle = title.trim();

    if (!finalTitle) {
      finalTitle = extractTitleFromContent(editor.getHTML());
      setTitle(finalTitle); 
    }

    if (!finalTitle) {
      alert("제목 또는 본문 내용을 입력하세요!");
      setSubmitting(false);
      return;
    }

    const isEmpty =
    editor.isEmpty ||
    editor.getText().trim().length === 0;
    
    if (isEmpty) {
      alert("내용을 입력하세요!");
      setSubmitting(false);
      return;
    }

    

    const fd = new FormData();
    fd.append("title", finalTitle);
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

    <button type="button" style={styles.btn} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
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

        <button
      type="button"
      style={styles.btn}
      onClick={removeLinkedTextNodes}
      title="링크제거"
    >
      <i className="fa-solid fa-ban"></i>
    </button>


  </div>
);








  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📋 게시글 작성</h2>
      <div style={styles.toolbarWrapper}>
          <Toolbar />
        </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          placeholder="제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={styles.input}
          // required
        />

        

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
    margin: "20px auto",
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
  zIndex: 1950,
  background: "transparent",
  display: "flex",
  justifyContent: "center",
  width: "100%",
  left: 0,
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
