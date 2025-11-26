import { Node } from "@tiptap/core";

export const YouTube = Node.create({
  name: "youtube",

  group: "block",
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      width: { default: 640 },
      height: { default: 360 },
    };
  },

  parseHTML() {
    return [{ tag: "youtube-video" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      {
        class: "youtube-wrapper",
        style: "text-align:center; margin:12px 0;",
      },
      [
        "iframe",
        {
          width: HTMLAttributes.width,
          height: HTMLAttributes.height,
          src: HTMLAttributes.src,
          frameborder: "0",
          allow:
            "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
          allowfullscreen: "true",
        },
      ],
    ];
  },

  addCommands() {
    return {
      setYoutubeVideo:
        (options) =>
        ({ chain }) => {
          return chain()
            .insertContent({
              type: "youtube",
              attrs: options,
            })
            .run();
        },
    };
  },
});
