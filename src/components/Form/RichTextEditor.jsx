import { Controller } from "react-hook-form";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { useEffect } from "react";
import TextAlign from "@tiptap/extension-text-align";

const ToolbarButton = ({ onClick, active, children }) => (
  <button
    type="button"
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    className={`px-2 py-1 border rounded text-sm ${
      active ? "bg-gray-200 font-semibold" : "hover:bg-gray-100"
    }`}
  >
    {children}
  </button>
);

export default function RichTextEditor({ name, control, label, errors }) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const editor = useEditor({
          extensions: [
            StarterKit.configure({
              heading: { levels: [1, 2] },
            }),
            Link.configure({
              openOnClick: false,
            }),
            TextAlign.configure({
              types: ["heading", "paragraph"], // very important
            }),
          ],
          content: field.value || "",
          onUpdate: ({ editor }) => {
            field.onChange(editor.getHTML());
          },
        });

        // Sync editor when loading edit data
        useEffect(() => {
          if (editor && field.value && editor.getHTML() !== field.value) {
            editor.commands.setContent(field.value);
          }
        }, [field.value, editor]);

        if (!editor) return null;

        return (
          <div className="col-span-2">
            {label && <label className="block font-medium mb-1">{label}</label>}

            {/* Toolbar */}
            <div className="flex flex-wrap gap-2 border rounded-t p-2 bg-gray-50">
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                active={editor.isActive("bold")}
              >
                B
              </ToolbarButton>

              <ToolbarButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                active={editor.isActive("italic")}
              >
                I
              </ToolbarButton>

              <ToolbarButton
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 1 }).run()
                }
                active={editor.isActive("heading", { level: 1 })}
              >
                H1
              </ToolbarButton>

              <ToolbarButton
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
                active={editor.isActive("heading", { level: 2 })}
              >
                H2
              </ToolbarButton>
              <ToolbarButton
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 3 }).run()
                }
                active={editor.isActive("heading", { level: 3 })}
              >
                H3
              </ToolbarButton>
              <ToolbarButton
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 4 }).run()
                }
                active={editor.isActive("heading", { level: 4 })}
              >
                H4
              </ToolbarButton>
              <ToolbarButton
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 5 }).run()
                }
                active={editor.isActive("heading", { level: 5 })}
              >
                H5
              </ToolbarButton>

              <ToolbarButton
                onClick={() => editor.chain().focus().setParagraph().run()}
                active={editor.isActive("paragraph")}
              >
                P
              </ToolbarButton>

              <ToolbarButton
                onClick={() =>
                  editor.chain().focus().setTextAlign("left").run()
                }
                active={editor.isActive({ textAlign: "left" })}
              >
                ⬅
              </ToolbarButton>

              <ToolbarButton
                onClick={() =>
                  editor.chain().focus().setTextAlign("center").run()
                }
                active={editor.isActive({ textAlign: "center" })}
              >
                ⬍
              </ToolbarButton>

              <ToolbarButton
                onClick={() =>
                  editor.chain().focus().setTextAlign("right").run()
                }
                active={editor.isActive({ textAlign: "right" })}
              >
                ➡
              </ToolbarButton>

              <ToolbarButton
                onClick={() =>
                  editor.chain().focus().setTextAlign("justify").run()
                }
                active={editor.isActive({ textAlign: "justify" })}
              >
                ☰
              </ToolbarButton>

              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                active={editor.isActive("bulletList")}
              >
                • List
              </ToolbarButton>

              <ToolbarButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                active={editor.isActive("orderedList")}
              >
                1. List
              </ToolbarButton>

              <ToolbarButton
                onClick={() =>
                  editor.chain().focus().sinkListItem("listItem").run()
                }
              >
                ➡ Indent
              </ToolbarButton>

              <ToolbarButton
                onClick={() =>
                  editor.chain().focus().liftListItem("listItem").run()
                }
              >
                ⬅ Outdent
              </ToolbarButton>

              <ToolbarButton
                onClick={() => {
                  if (editor.state.selection.empty) {
                    alert("Please select a word to add a link");
                    return;
                  }

                  const url = prompt("Enter URL");

                  if (!url) return;

                  editor
                    .chain()
                    .focus()
                    .extendMarkRange("link")
                    .setLink({
                      href: url,
                      target: "_blank",
                      rel: "noopener noreferrer",
                    })
                    .run();
                }}
                active={editor.isActive("link")}
              >
                Link
              </ToolbarButton>
            </div>

            <div
              className={`border border-t-0 rounded-b p-4 min-h-[220px] ${
                errors?.[name] ? "border-red-500" : ""
              }`}
            >
              <EditorContent
                editor={editor}
                className="focus:outline-none max-w-none
             [&_a]:text-[#6C47FF]
             [&_a:hover]:text-[#4b2ecc]
    [&_ul]:list-disc
    [&_ul]:pl-6
    [&_ol]:list-decimal
    [&_ol]:pl-6
    [&_li]:mb-1"
              />
            </div>

            {errors?.[name] && (
              <p className="text-red-500 text-sm mt-1">
                {errors[name]?.message}
              </p>
            )}
          </div>
        );
      }}
    />
  );
}
