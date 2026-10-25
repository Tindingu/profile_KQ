import Image from "@tiptap/extension-image";
export const CaptionImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      caption: {
        default: "",
        parseHTML: (element) =>
          element.closest("figure")?.querySelector("figcaption")?.textContent ||
          "",
        renderHTML: () => ({}),
      },
    };
  },
  renderHTML({ node, HTMLAttributes }) {
    return node.attrs.caption
      ? [
          "figure",
          ["img", HTMLAttributes],
          ["figcaption", String(node.attrs.caption)],
        ]
      : ["img", HTMLAttributes];
  },
});
