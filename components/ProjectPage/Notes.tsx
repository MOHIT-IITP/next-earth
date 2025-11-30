"use client";

import React, { useEffect, useState } from "react";

import TextAlign from "@tiptap/extension-text-align";
import { usePathname } from "next/navigation";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { createNotes, DeleteNote, updateNote } from "@/lib/action";
import { Plus } from "lucide-react";
import NotesSidebar from './NotesSidebar';
import NoteEditor from './NoteEditor';
import NoteViewer from './NoteViewer';
import MenuBar from './NotesEditorMenuBar';
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



const Notes = ({ project }: { project: any }) => {
    const pth = usePathname();
    const proId = pth.split("/")[2];

    // client-side notes state so UI updates instantly
    const [notesList, setNotesList] = useState<any[]>(project?.notes ?? []);
    const [visible, setVisible] = useState<number>(10);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

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

    const openNewNote = () => {
        // clear form and editor so new note doesn't show previous content
        setFormData({ title: "", content: "", projectId: proId });
        if (editor) editor.commands.setContent("");
        setEditingIndex(null);
        setSelectedIndex(null);
        setPlugOpen(true);
    };

    const handleEditClick = (i: number) => {
        const note = notesList[i];
        if (!note) return;
        setFormData({ title: note.title || "", content: note.content || "", projectId: note.projectId ?? proId });
        if (editor) editor.commands.setContent(note.content || "");
        setEditingIndex(i);
        setSelectedIndex(i);
    };

    const handleSaveUpdate = async () => {
        if (editingIndex === null) return;
        const note = notesList[editingIndex];
        if (!note) return;
        try {
            const updated = await updateNote(note.id, formData);
            // optimistic/local update
            setNotesList((prev) => prev.map((n, idx) => (idx === editingIndex ? { ...n, title: formData.title, content: formData.content } : n)));
            setEditingIndex(null);
            setSelectedIndex(editingIndex);
            return updated;
        } catch (err) {
            console.error("update note error", err);
        }
    };

    // UI: use smaller components
    if (plugOpen) {
        return <NoteEditor editor={editor} formData={formData} handleChange={handleChange} onCreate={handleCreateNote} onCancel={() => setPlugOpen(false)} />
    }

    return (
        <div className="flex h-full justify-center">
            <div className="w-full max-w-3xl flex">
                <NotesSidebar
                    notesList={notesList}
                    visible={visible}
                    setVisible={setVisible}
                    selectedIndex={selectedIndex}
                    setSelectedIndex={setSelectedIndex}
                    handleDelete={handleDelete}
                    handleEditClick={handleEditClick}
                    openNewNote={openNewNote}
                />

                <main className="flex-1 p-6 overflow-auto bg-white">
                    {editingIndex !== null ? (
                        <NoteEditor editor={editor} formData={formData} handleChange={handleChange} onSave={handleSaveUpdate} onCancel={() => setEditingIndex(null)} />
                    ) : selectedIndex === null ? (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            <div className="text-center">
                                <p className="text-lg">Select a note to view its content</p>
                                <p className="text-sm mt-2">or create a new note to get started</p>
                            </div>
                        </div>
                    ) : (
                        <NoteViewer notesList={notesList} selectedIndex={selectedIndex} />
                    )}
                </main>
            </div>
        </div>
    );
};

export default Notes;

