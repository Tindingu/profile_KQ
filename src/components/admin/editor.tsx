"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { CaptionImage } from "./caption-image";
import Youtube from "@tiptap/extension-youtube";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { MediaPicker } from "./media-library";
export function RichEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      CaptionImage,
      Youtube.configure({ nocookie: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });
  if (!editor) return <div className="skeleton h-64" />;
  return (
    <div className="rich-editor">
      <div className="editor-toolbar">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <b>B</b>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <i>I</i>
        </button>
        {([2, 3] as const).map((level) => (
          <button
            key={level}
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level }).run()
            }
          >
            H{level}
          </button>
        ))}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1. List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          ❞ Quote
        </button>
        <button
          type="button"
          onClick={() => {
            const url = prompt("URL liên kết (https://)");
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
        >
          Link
        </button>
        <MediaPicker
          selected={[]}
          multiple={false}
          onChange={(items) => {
            const m = items[0];
            if (m)
              editor
                .chain()
                .focus()
                .insertContent({
                  type: "image",
                  attrs: { src: m.url, alt: m.alt, caption: m.caption },
                })
                .run();
          }}
          label="+ Ảnh"
        />
        <button
          type="button"
          onClick={() => {
            const url = prompt("YouTube URL");
            if (url) editor.commands.setYoutubeVideo({ src: url });
          }}
        >
          Video
        </button>
        <button
          type="button"
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
        >
          Table
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
        >
          ↶
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
        >
          ↷
        </button>
      </div>
      <EditorContent editor={editor} />
      <label className="p-3">
        Caption được lấy từ Media Library khi chèn ảnh.
      </label>
    </div>
  );
}
