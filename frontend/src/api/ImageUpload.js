import { Extension } from "@tiptap/core";
import axiosInstance from "./axiosInstance";
import { Plugin } from "prosemirror-state";

export const ImageUpload = Extension.create({
  name: "imageUpload",

  addCommands() {
    return {
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

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handlePaste: async (view, event) => {
            const items = event.clipboardData?.items;
            if (!items) return false;

            for (const item of items) {
              if (item.type.startsWith("image/")) {
                const file = item.getAsFile();
                if (!file) return false;

                await uploadAndInsertImage(file, this.editor);
                return true;
              }
            }
            return false;
          },
        },
      }),
    ];
  },
});

async function uploadAndInsertImage(file, editor) {
  try {
    const fd = new FormData();
    fd.append("image", file);

    const res = await axiosInstance.post("/board/upload-image", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const { url } = res.data;
    const fullUrl = import.meta.env.VITE_API_URL + url;

    // ⭐ 이미지 노드를 삽입 (정렬은 CustomImage가 처리!)
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
