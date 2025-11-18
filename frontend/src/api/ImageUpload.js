import Image from "@tiptap/extension-image";
import axiosInstance from "./axiosInstance";
import { Plugin } from "prosemirror-state"; // ⭐ 핵심!

export const ImageUpload = Image.extend({
  name: "imageUpload",

  addCommands() {
    return {
      ...this.parent?.(),
      uploadImage:
        () =>
        ({ editor }) => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "image/*";

          input.onchange = async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            await uploadAndInsertImage(file, editor);
          };

          input.click();
        },
    };
  },

  // ⭐ 붙여넣기(Ctrl+V) 이미지 처리
  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handlePaste: async (view, event) => {
            const items = event.clipboardData?.items;
            if (!items) return false;

            for (let i = 0; i < items.length; i++) {
              const item = items[i];

              if (item.type.startsWith("image/")) {
                const file = item.getAsFile();
                if (!file) return false;

                await uploadAndInsertImage(file, this.editor);
                return true; // 기본 paste 동작 막기
              }
            }
            return false;
          },
        },
      }),
    ];
  },
});

// ⭐ 공용 업로드 함수 (파일 업로드 + 붙여넣기 모두 사용)
async function uploadAndInsertImage(file, editor) {
  try {
    const fd = new FormData();
    fd.append("image", file);

    const res = await axiosInstance.post("/board/upload-image", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const { url } = res.data;
    const fullUrl = import.meta.env.VITE_API_URL + url;

        // ✅ paragraph 감싸지 말고, 그냥 이미지 노드 삽입
        
    editor
      .chain()
      .focus()
      .setImage({ src: fullUrl })
      .run();


  } catch (err) {
    console.error("이미지 업로드 실패:", err);
    alert("이미지 업로드 중 오류 발생");
  }
}
