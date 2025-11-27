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

   // ✅ 붙여넣기(유튜브 링크, 이미지) 처리
  addProseMirrorPlugins() {
    // ⭐ TipTap Editor 인스턴스는 this.editor 로 접근
    const editor = this.editor;

    return [
      new Plugin({
        props: {
          handlePaste(view, event) {
            // clipboardData 없으면 기본 동작
            if (!event.clipboardData) {
              return false;
            }

            const items = event.clipboardData.items || [];
            const text = event.clipboardData.getData("text/plain") || "";

            // ▽ 유튜브 URL 분석
            const youtubeRegex =
              /(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/;

            const match = text.match(youtubeRegex);

            if (match && editor) {
              const videoId = match[4];
              const embedUrl = `https://www.youtube.com/embed/${videoId}`;

              // ⭐ YouTube 익스텐션의 커맨드 호출
              editor.commands.setYoutubeVideo({
                src: embedUrl,
                width: 640,
                height: 360,
              });

              return true; // 우리가 처리했으므로 기본 paste 막기
            }

            // ▽ 이미지 붙여넣기
            for (const item of items) {
              if (item.type && item.type.startsWith("image/")) {
                const file = item.getAsFile();
                if (!file || !editor) return false;

                uploadAndInsertImage(file, editor);
                return true;
              }
            }

            // ▽ 나머지 → 기본 붙여넣기 동작 유지
            return false;
          },
        },
      }),
    ];
  },
});

// 이미지 리사이즈 함수
export async function resizeImage(file, maxWidth = 1600) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = maxWidth / img.width;
      const canvas = document.createElement("canvas");
      canvas.width = maxWidth;
      canvas.height = img.height * scale;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => resolve(new File([blob], file.name, { type: "image/jpeg" })),
        "image/jpeg",
        0.8 // 압축율
      );
    };
    img.src = URL.createObjectURL(file);
  });
}


async function uploadAndInsertImage(file, editor) {
  try {

    // 🔥 리사이즈 추가
    const resized = await resizeImage(file, 1600);
    const fd = new FormData();
    fd.append("image", resized);

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


export { resizeImage };