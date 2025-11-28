"use client";

import React, { useEffect, useState } from "react";
import TextAlign from "@tiptap/extension-text-align";
import { usePathname } from "next/navigation";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { createNotes, DeleteNote } from "@/lib/action";
import { Plus } from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Link from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import {
  FaAlignCenter,
  FaAlignLeft,
  FaAlignRight,
  FaBold,
  FaCode,
  FaHighlighter,
  FaItalic,
  FaStrikethrough,
} from "react-icons/fa";
import { RiH1, RiH2, RiH3 } from "react-icons/ri";
import { MdDelete, MdFormatListBulleted } from "react-icons/md";
import { GoListOrdered } from "react-icons/go";

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  return (
    <div className="border-b p-2 flex flex-wrap gap-1 bg-gray-50">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`px-3 py-1 rounded text-sm ${
          editor.isActive("bold") ? "bg-blue-200" : "bg-white hover:bg-gray-100"
        } border`}
        type="button"
      >
        <FaBold />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`px-3 py-1 rounded text-sm ${
          editor.isActive("italic")
            ? "bg-blue-200"
            : "bg-white hover:bg-gray-100"
        } border`}
        type="button"
      >
        <FaItalic />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`px-3 py-1 rounded text-sm ${
          editor.isActive("strike")
            ? "bg-blue-200"
            : "bg-white hover:bg-gray-100"
        } border`}
        type="button"
      >
        <FaStrikethrough />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`px-3 py-1 rounded text-sm ${
          editor.isActive("heading", { level: 1 })
            ? "bg-blue-200"
            : "bg-white hover:bg-gray-100"
        } border`}
        type="button"
      >
        <RiH1 />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`px-3 py-1 rounded text-sm ${
          editor.isActive("heading", { level: 2 })
            ? "bg-blue-200"
            : "bg-white hover:bg-gray-100"
        } border`}
        type="button"
      >
        <RiH2 />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`px-3 py-1 rounded text-sm ${
          editor.isActive("heading", { level: 3 })
            ? "bg-blue-200"
            : "bg-white hover:bg-gray-100"
        } border`}
        type="button"
      >
        <RiH3 />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`px-3 py-1 rounded text-sm ${
          editor.isActive("bulletList")
            ? "bg-blue-200"
            : "bg-white hover:bg-gray-100"
        } border`}
        type="button"
      >
        <MdFormatListBulleted />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`px-3 py-1 rounded text-sm ${
          editor.isActive("orderedList")
            ? "bg-blue-200"
            : "bg-white hover:bg-gray-100"
        } border`}
        type="button"
      >
        <GoListOrdered />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`px-3 py-1 rounded text-sm ${
          editor.isActive("codeBlock")
            ? "bg-blue-200"
            : "bg-white hover:bg-gray-100"
        } border`}
        type="button"
      >
        <FaCode />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        className={`px-3 py-1 rounded text-sm ${
          editor.isActive("highlight")
            ? "bg-blue-200"
            : "bg-white hover:bg-gray-100"
        } border`}
        type="button"
      >
        <FaHighlighter />
      </button>

      <button
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        className={`px-3 py-1 rounded text-sm ${
          editor.isActive({ textAlign: "left" })
            ? "bg-blue-200"
            : "bg-white hover:bg-gray-100"
        } border`}
        type="button"
      >
        <FaAlignLeft />
      </button>

      <button
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        className={`px-3 py-1 rounded text-sm ${
          editor.isActive({ textAlign: "center" })
            ? "bg-blue-200"
            : "bg-white hover:bg-gray-100"
        } border`}
        type="button"
      >
        <FaAlignCenter />
      </button>

      <button
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        className={`px-3 py-1 rounded text-sm ${
          editor.isActive({ textAlign: "right" })
            ? "bg-blue-200"
            : "bg-white hover:bg-gray-100"
        } border`}
        type="button"
      >
        <FaAlignRight />
      </button>
    </div>
  );
};

const Notes = ({ project }: { project: any }) => {
  const pth = usePathname();
  const proId = pth.split("/")[2];

  // client-side notes state so UI updates instantly
  const [notesList, setNotesList] = useState<any[]>(project?.notes ?? []);
  const [visible, setVisible] = useState<number>(10);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    projectId: proId,
  });

  const [plugOpen, setPlugOpen] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Link.configure({ openOnClick: false }),
      Highlight,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: formData.content,
    onUpdate: ({ editor }) => {
      setFormData((prev) => ({
        ...prev,
        content: editor.getHTML(),
      }));
    },
  });

  // clear editor when closing plug
  useEffect(() => {
    if (editor && !plugOpen) {
      editor.commands.setContent("");
    }
  }, [plugOpen, editor]);

  // when selectedIndex changes, ensure editor/view reflects selected note
  useEffect(() => {
    if (selectedIndex === null) return;
    const note = notesList[selectedIndex];
    if (!note) {
      setSelectedIndex(null);
      return;
    }
    // if you want to load note into editor for editing (optional)
    // editor?.commands.setContent(note.content || "");
    // For now we just show note content in viewer (not editing)
  }, [selectedIndex, notesList, editor]);

  // Create: expects createNotes to return the created note object
  const handleCreateNote = async () => {
    try {
      const created = await createNotes({ formData });
      // If API returns the created note, add it to state
      if (created && created.id) {
        setNotesList((prev) => [created, ...prev]);
        setSelectedIndex(0); // show newly created note
      } else {
        // fallback: minimal optimistic update if API did not return full note
        const fallback = {
          id: `temp-${Date.now()}`,
          title: formData.title || "Untitled",
          content: formData.content || "",
          projectId: proId,
          createdAt: new Date().toISOString(),
        };
        setNotesList((prev) => [fallback, ...prev]);
        setSelectedIndex(0);
      }

      // reset form and editor
      setFormData({ title: "", content: "", projectId: proId });
      if (editor) editor.commands.setContent("");
      setPlugOpen(false);
    } catch (err) {
      console.error("create note error", err);
    }
  };

  // Delete: remove from state and update selectedIndex intelligently
  const handleDelete = async (id: string) => {
    try {
      await DeleteNote(id);
      setNotesList((prev) => {
        const idx = prev.findIndex((n) => n.id === id);
        const newList = prev.filter((n) => n.id !== id);

        // adjust selectedIndex
        setSelectedIndex((prevSelected) => {
          if (prevSelected === null) return null;
          if (idx === -1) return prevSelected; // not found
          if (idx === prevSelected) return null; // deleted the selected note -> clear viewer
          if (idx < prevSelected) return Math.max(0, prevSelected - 1); // shift down
          return prevSelected;
        });

        return newList;
      });
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // UI
  if (plugOpen) {
    return (
      <div className="p-6 flex flex-col items-center gap-4 w-full">
        <Input
          value={formData.title}
          name="title"
          placeholder="Note Title"
          onChange={handleChange}
          className="w-full max-w-3xl"
        />
        <div className="w-full max-w-3xl border rounded-lg overflow-hidden bg-white">
          <MenuBar editor={editor} />
          <div className="p-4 min-h-[300px]">
            <EditorContent
              editor={editor}
              className="prose prose-sm max-w-none focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:ml-6 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:ml-6 [&_.ProseMirror_li]:ml-2"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreateNote} type="button">
            Create Note
          </Button>
          <Button onClick={() => setPlugOpen(false)} type="button" variant="outline">
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[300px]">
      <div className="w-72 bg-gray-50 border-r p-4 flex flex-col gap-4">
        <button
          onClick={() => setPlugOpen(true)}
          aria-label="Create new note"
          className="flex items-center justify-center gap-2 p-2 rounded-full bg-gray-500 text-white hover:bg-gray-900 transition"
        >
          <Plus size={15} />
          <span>New Note</span>
        </button>
        <div className="flex-1 overflow-auto">
          {notesList && notesList.length > 0 ? (
            <>
              <ul className="space-y-2">
                {notesList.slice(0, visible).map((n: any, i: number) => (
                  <li key={n.id ?? i}>
                    <div
                      className={`w-full text-left flex justify-between items-center p-3 rounded-lg transition ${
                        selectedIndex === i ? "bg-gray-200 border-l-4 border-gray-500" : "hover:bg-gray-100"
                      }`}
                    >
                      <button
                        onClick={() => setSelectedIndex(i)}
                        className="flex-1 text-left font-medium truncate"
                      >
                        {n.title || "Untitled"}
                      </button>

                      <button
                        onClick={() => handleDelete(n.id)}
                        className="ml-2 text-red-600 hover:text-red-800"
                        aria-label={`Delete ${n.title}`}
                      >
                        <MdDelete />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-4 space-y-2">
                {visible < notesList.length && (
                  <Button onClick={() => setVisible((v) => v + 10)} className="w-full" variant="outline" size="sm">
                    Show More
                  </Button>
                )}
                {visible > 10 && (
                  <Button onClick={() => setVisible((v) => v - 10)} className="w-full" variant="outline" size="sm">
                    Show Less
                  </Button>
                )}
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-sm text-center mt-4">No notes yet</p>
          )}
        </div>
      </div>

      <main className="flex-1 p-6 overflow-auto bg-white">
        {selectedIndex === null ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <p className="text-lg">Select a note to view its content</p>
              <p className="text-sm mt-2">or create a new note to get started</p>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 pb-4 border-b">
              {notesList[selectedIndex]?.title}
            </h1>
            <div
              className="prose prose-lg max-w-none [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_li]:ml-2 [&_pre]:bg-gray-900 [&_pre]:text-gray-100 [&_pre]:p-4 [&_code]:bg-gray-900 [&_code]:text-gray-100 [&_code]:px-2 [&_code]:py-1 [&_code]:rounded"
              dangerouslySetInnerHTML={{ __html: notesList[selectedIndex]?.content ?? "" }}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default Notes;

