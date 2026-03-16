// import { Controller } from "react-hook-form";
// import { EditorContent, useEditor } from "@tiptap/react";
// import StarterKit from "@tiptap/starter-kit";
// import Link from "@tiptap/extension-link";
// import { useEffect } from "react";
// import TextAlign from "@tiptap/extension-text-align";

// const ToolbarButton = ({ onClick, active, children }) => (
//   <button
//     type="button"
//     onMouseDown={(e) => e.preventDefault()}
//     onClick={onClick}
//     className={`px-2 py-1 border rounded text-sm ${
//       active ? "bg-gray-200 font-semibold" : "hover:bg-gray-100"
//     }`}
//   >
//     {children}
//   </button>
// );

// export default function RichTextEditor({ name, control, label, errors }) {
//   return (
//     <Controller
//       name={name}
//       control={control}
//       render={({ field }) => {
//         const editor = useEditor({
//           extensions: [
//             StarterKit.configure({
//               heading: { levels: [1, 2] },
//             }),
//             Link.configure({
//               openOnClick: false,
//             }),
//             TextAlign.configure({
//               types: ["heading", "paragraph"], // very important
//             }),
//           ],
//           content: field.value || "",
//           onUpdate: ({ editor }) => {
//             field.onChange(editor.getHTML());
//           },
//         });

//         // Sync editor when loading edit data
//         useEffect(() => {
//           if (editor && field.value && editor.getHTML() !== field.value) {
//             editor.commands.setContent(field.value);
//           }
//         }, [field.value, editor]);

//         if (!editor) return null;

//         return (
//           <div className="col-span-2">
//             {label && <label className="block font-medium mb-1">{label}</label>}

//             {/* Toolbar */}
//             <div className="flex flex-wrap gap-2 border rounded-t p-2 bg-gray-50">
//               <ToolbarButton
//                 onClick={() => editor.chain().focus().toggleBold().run()}
//                 active={editor.isActive("bold")}
//               >
//                 B
//               </ToolbarButton>

//               <ToolbarButton
//                 onClick={() => editor.chain().focus().toggleItalic().run()}
//                 active={editor.isActive("italic")}
//               >
//                 I
//               </ToolbarButton>

//               <ToolbarButton
//                 onClick={() =>
//                   editor.chain().focus().toggleHeading({ level: 1 }).run()
//                 }
//                 active={editor.isActive("heading", { level: 1 })}
//               >
//                 H1
//               </ToolbarButton>

//               <ToolbarButton
//                 onClick={() =>
//                   editor.chain().focus().toggleHeading({ level: 2 }).run()
//                 }
//                 active={editor.isActive("heading", { level: 2 })}
//               >
//                 H2
//               </ToolbarButton>
//               <ToolbarButton
//                 onClick={() =>
//                   editor.chain().focus().toggleHeading({ level: 3 }).run()
//                 }
//                 active={editor.isActive("heading", { level: 3 })}
//               >
//                 H3
//               </ToolbarButton>
//               <ToolbarButton
//                 onClick={() =>
//                   editor.chain().focus().toggleHeading({ level: 4 }).run()
//                 }
//                 active={editor.isActive("heading", { level: 4 })}
//               >
//                 H4
//               </ToolbarButton>
//               <ToolbarButton
//                 onClick={() =>
//                   editor.chain().focus().toggleHeading({ level: 5 }).run()
//                 }
//                 active={editor.isActive("heading", { level: 5 })}
//               >
//                 H5
//               </ToolbarButton>

//               <ToolbarButton
//                 onClick={() => editor.chain().focus().setParagraph().run()}
//                 active={editor.isActive("paragraph")}
//               >
//                 P
//               </ToolbarButton>

//               <ToolbarButton
//                 onClick={() =>
//                   editor.chain().focus().setTextAlign("left").run()
//                 }
//                 active={editor.isActive({ textAlign: "left" })}
//               >
//                 ⬅
//               </ToolbarButton>

//               <ToolbarButton
//                 onClick={() =>
//                   editor.chain().focus().setTextAlign("center").run()
//                 }
//                 active={editor.isActive({ textAlign: "center" })}
//               >
//                 ⬍
//               </ToolbarButton>

//               <ToolbarButton
//                 onClick={() =>
//                   editor.chain().focus().setTextAlign("right").run()
//                 }
//                 active={editor.isActive({ textAlign: "right" })}
//               >
//                 ➡
//               </ToolbarButton>

//               <ToolbarButton
//                 onClick={() =>
//                   editor.chain().focus().setTextAlign("justify").run()
//                 }
//                 active={editor.isActive({ textAlign: "justify" })}
//               >
//                 ☰
//               </ToolbarButton>

//               <ToolbarButton
//                 onClick={() => editor.chain().focus().toggleBulletList().run()}
//                 active={editor.isActive("bulletList")}
//               >
//                 • List
//               </ToolbarButton>

//               <ToolbarButton
//                 onClick={() => editor.chain().focus().toggleOrderedList().run()}
//                 active={editor.isActive("orderedList")}
//               >
//                 1. List
//               </ToolbarButton>

//               <ToolbarButton
//                 onClick={() =>
//                   editor.chain().focus().sinkListItem("listItem").run()
//                 }
//               >
//                 ➡ Indent
//               </ToolbarButton>

//               <ToolbarButton
//                 onClick={() =>
//                   editor.chain().focus().liftListItem("listItem").run()
//                 }
//               >
//                 ⬅ Outdent
//               </ToolbarButton>

//               <ToolbarButton
//                 onClick={() => {
//                   if (editor.state.selection.empty) {
//                     alert("Please select a word to add a link");
//                     return;
//                   }

//                   const url = prompt("Enter URL");

//                   if (!url) return;

//                   editor
//                     .chain()
//                     .focus()
//                     .extendMarkRange("link")
//                     .setLink({
//                       href: url,
//                       target: "_blank",
//                       rel: "noopener noreferrer",
//                     })
//                     .run();
//                 }}
//                 active={editor.isActive("link")}
//               >
//                 Link
//               </ToolbarButton>
//             </div>

//             <div
//               className={`border border-t-0 rounded-b p-4 min-h-[220px] ${
//                 errors?.[name] ? "border-red-500" : ""
//               }`}
//             >
//               <EditorContent
//                 editor={editor}
//                 className="focus:outline-none max-w-none
//              [&_a]:text-[#6C47FF]
//              [&_a:hover]:text-[#4b2ecc]
//     [&_ul]:list-disc
//     [&_ul]:pl-6
//     [&_ol]:list-decimal
//     [&_ol]:pl-6
//     [&_li]:mb-1"
//               />
//             </div>

//             {errors?.[name] && (
//               <p className="text-red-500 text-sm mt-1">
//                 {errors[name]?.message}
//               </p>
//             )}
//           </div>
//         );
//       }}
//     />
//   );
// }

import { Controller } from "react-hook-form";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { useEffect } from "react";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import Code from "@tiptap/extension-code";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight } from "lowlight";
import javascript from "highlight.js/lib/languages/javascript";
import html from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import { Table } from "@tiptap/extension-table";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableRow } from "@tiptap/extension-table-row";

const lowlight = createLowlight();
lowlight.register("js", javascript);
lowlight.register("html", html);
lowlight.register("css", css);

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
  const handleImageUpload = (editor) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        editor.chain().focus().setImage({ src: reader.result }).run();
      };
      reader.readAsDataURL(file); // base64
    };

    input.click();
  };
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const editor = useEditor({
          extensions: [
            StarterKit.configure({
              heading: { levels: [1, 2, 3, 4, 5] },
              codeBlock: false,
            }),
            Link.configure({
              openOnClick: false,
            }),
            TextAlign.configure({
              types: ["heading", "paragraph"],
            }),
            Image.configure({
              inline: false,
              allowBase64: true, // REQUIRED for uploads
            }),
            Youtube.configure({
              controls: true,
              nocookie: true,
            }),
            CodeBlockLowlight.configure({
              lowlight,
            }),
            Code.configure(),
            Table.configure({
              resizable: true,
            }),
            TableRow.configure(),
            TableHeader.configure(),
            TableCell.configure(),
          ],
          content: field.value || "",
          parseOptions: { preserveWhitespace: "full" },
          onUpdate: ({ editor }) => {
            field.onChange(editor.getHTML());
          },
        });

        // Sync editor when loading edit data
        useEffect(() => {
          if (editor && field.value && editor.getHTML() !== field.value) {
            editor.commands.setContent(field.value, false, {
              preserveWhitespace: "full", // 👈 add this
            });
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

              <ToolbarButton
                onClick={() => editor.chain().focus().toggleCode().run()}
                active={editor.isActive("code")}
              >
                Code
              </ToolbarButton>

              <ToolbarButton
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                active={editor.isActive("codeBlock")}
              >
                {"</>"} Code
              </ToolbarButton>
              <ToolbarButton
                onClick={() => {
                  const url = prompt("Enter YouTube URL");
                  if (!url) return;

                  editor
                    .chain()
                    .focus()
                    .setYoutubeVideo({
                      src: url,
                      width: 640,
                      height: 360,
                    })
                    .run();
                }}
              >
                ▶ Video
              </ToolbarButton>
              <ToolbarButton onClick={() => handleImageUpload(editor)}>
                🖼 Image
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().deleteSelection().run()}
                disabled={!editor.isActive("image")}
              >
                🗑 Remove Image
              </ToolbarButton>

              <ToolbarButton
                onClick={() =>
                  editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
                }
              >
                Insert Table
              </ToolbarButton>
              <ToolbarButton onClick={() => editor.chain().focus().addColumnBefore().run()}>
                Add Column Before
              </ToolbarButton>
              <ToolbarButton onClick={() => editor.chain().focus().addColumnAfter().run()}>
                Add Column After
              </ToolbarButton>
              <ToolbarButton onClick={() => editor.chain().focus().deleteColumn().run()}>
                Delete Column
              </ToolbarButton>
              <ToolbarButton onClick={() => editor.chain().focus().addRowBefore().run()}>
                Add Row Before
              </ToolbarButton>
              <ToolbarButton onClick={() => editor.chain().focus().addRowAfter().run()}>
                Add Row After
              </ToolbarButton>
              <ToolbarButton onClick={() => editor.chain().focus().deleteRow().run()}>
                Delete Row
              </ToolbarButton>
              <ToolbarButton onClick={() => editor.chain().focus().deleteTable().run()}>
                Delete Table
              </ToolbarButton>
              <ToolbarButton onClick={() => editor.chain().focus().mergeCells().run()}>
                Merge Cells
              </ToolbarButton>
              <ToolbarButton onClick={() => editor.chain().focus().splitCell().run()}>
                Split Cell
              </ToolbarButton>
              <ToolbarButton onClick={() => editor.chain().focus().toggleHeaderColumn().run()}>
                Toggle Header Column
              </ToolbarButton>
              <ToolbarButton onClick={() => editor.chain().focus().toggleHeaderRow().run()}>
                Toggle Header Row
              </ToolbarButton>
              <ToolbarButton onClick={() => editor.chain().focus().toggleHeaderCell().run()}>
                Toggle Header Cell
              </ToolbarButton>
              <ToolbarButton onClick={() => editor.chain().focus().mergeOrSplit().run()}>
                Merge or Split
              </ToolbarButton>
              <ToolbarButton onClick={() => editor.chain().focus().setCellAttribute('colspan', 2).run()}>
                Set Cell Colspan
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
   [&_li]:mb-1
   [&_pre]:bg-black
   [&_pre]:text-white
   [&_pre]:rounded-md

   /* Table styles to match the example */
   [&_table]:w-full
   [&_table]:border-collapse
   [&_table]:border
   [&_table]:border-gray-400
   [&_thead_tr]:bg-yellow-500
   [&_thead_tr]:text-white
   [&_th]:border
   [&_th]:border-gray-300
   [&_th]:p-3
   [&_th]:font-bold
   [&_th]:text-left
   [&_td]:border
   [&_td]:border-gray-300
   [&_td]:p-3
   [&_tbody_tr:nth-child(even)]:bg-yellow-50

   [&_pre]:p-4
   [&_pre]:overflow-x-auto
   [&_pre_code]:text-white
   [&_pre_code]:font-mono
   [&_pre_code]:text-sm"
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