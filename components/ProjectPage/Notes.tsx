import React, { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { createNotes } from '@/lib/action';
import { Plus } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color'
import Link from '@tiptap/extension-link'
import Highlight from '@tiptap/extension-highlight'
import { FaBold, FaCode, FaHighlighter, FaItalic, FaStrikethrough } from 'react-icons/fa';
import { RiH1, RiH2, RiH3 } from "react-icons/ri";
import { MdFormatListBulleted } from "react-icons/md";
import { GoListOrdered } from "react-icons/go";

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) {
        return null
    }

    return (
        <div className="border-b p-2 flex flex-wrap gap-1 bg-gray-50">
            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`px-3 py-1 rounded text-sm ${editor.isActive('bold') ? 'bg-blue-200' : 'bg-white hover:bg-gray-100'} border`}
                type="button"
            >
                <FaBold/>
            </button>
            <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`px-3 py-1 rounded text-sm ${editor.isActive('italic') ? 'bg-blue-200' : 'bg-white hover:bg-gray-100'} border`}
                type="button"
            >
                <FaItalic/>
            </button>
            <button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={`px-3 py-1 rounded text-sm ${editor.isActive('strike') ? 'bg-blue-200' : 'bg-white hover:bg-gray-100'} border`}
                type="button"
            >
                <FaStrikethrough/>

            </button>
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`px-3 py-1 rounded text-sm ${editor.isActive('heading', { level: 1 }) ? 'bg-blue-200' : 'bg-white hover:bg-gray-100'} border`}
                type="button"
            >
                <RiH1/>
            </button>
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`px-3 py-1 rounded text-sm ${editor.isActive('heading', { level: 2 }) ? 'bg-blue-200' : 'bg-white hover:bg-gray-100'} border`}
                type="button"
            >
                <RiH2/>
            </button>
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`px-3 py-1 rounded text-sm ${editor.isActive('heading', { level: 3 }) ? 'bg-blue-200' : 'bg-white hover:bg-gray-100'} border`}
                type="button"
            >
                <RiH3/>
            </button>
            <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`px-3 py-1 rounded text-sm ${editor.isActive('bulletList') ? 'bg-blue-200' : 'bg-white hover:bg-gray-100'} border`}
                type="button"
            >
                <MdFormatListBulleted/>
            </button>
            <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`px-3 py-1 rounded text-sm ${editor.isActive('orderedList') ? 'bg-blue-200' : 'bg-white hover:bg-gray-100'} border`}
                type="button"
            >
                <GoListOrdered/>
            </button>
            <button
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={`px-3 py-1 rounded text-sm ${editor.isActive('codeBlock') ? 'bg-blue-200' : 'bg-white hover:bg-gray-100'} border`}
                type="button"
            >
                <FaCode/>
            </button>
            <button
                onClick={() => editor.chain().focus().toggleHighlight().run()}
                className={`px-3 py-1 rounded text-sm ${editor.isActive('highlight') ? 'bg-blue-200' : 'bg-white hover:bg-gray-100'} border`}
                type="button"
            >
                <FaHighlighter/>
            </button>
        </div>
    )
}

const Notes = ({project}:{project:any}) => {
    const pth = usePathname();
    const proId = pth.split("/")[2];

    const notes = project.notes;

    const [visible, setVisible] = useState(10);

    const handleShowMore = () => {
        setVisible(prev => prev + 10);
    }

    const handleShowLess = () => {
        setVisible(prev => prev - 10);
    }

    const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null)
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        projectId: proId,
    })

    const [plugOpen, setPlugOpen] = useState(false)

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            TextStyle,
            Color,
            Link.configure({
                openOnClick: false,
            }),
            Highlight,
        ],
        content: formData.content,
        onUpdate: ({ editor }) => {
            setFormData(prev => ({
                ...prev,
                content: editor.getHTML(),
            }))
        },
    })

    React.useEffect(() => {
        if (editor && !plugOpen) {
            editor.commands.setContent('')
        }
    }, [plugOpen, editor])

    const handleCreateNote = async () => {
        try {
            await createNotes({ formData })
            setFormData({ title: '', content: '', projectId: proId })
            if (editor) {
                editor.commands.setContent('')
            }
            setPlugOpen(false)
        } catch (err) {
            console.error('create note error', err)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    if (plugOpen) {
        return (
            <div className="p-6 flex flex-col items-center gap-4 w-full">
                <Input 
                    value={formData.title} 
                    name='title' 
                    placeholder='Note Title' 
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
                    <Button onClick={handleCreateNote} type='button'>Create Note</Button>
                    <Button onClick={() => setPlugOpen(false)} type='button' variant="outline">Cancel</Button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-full min-h-[300px]">
            <div className="w-72 bg-gray-50 border-r p-4 flex flex-col gap-4">
                <button 
                    onClick={() => setPlugOpen(true)} 
                    aria-label="Create new note" 
                    className="flex items-center justify-center gap-2 p-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition"
                >
                    <Plus size={20} />
                    <span>New Note</span>
                </button>
                <div className="flex-1 overflow-auto">
                    {notes && notes.length > 0 ? (
                        <>
                            <ul className="space-y-2">
                                {notes.slice(0, visible).map((n: any, i: number) => (
                                    <li key={n.id ?? i}>
                                        <button
                                            onClick={() => setSelectedIndex(i)}
                                            className={`w-full text-left p-3 rounded transition ${
selectedIndex === i ? 'bg-blue-100 border-l-4 border-blue-500' : 'hover:bg-gray-100'
}`}
                                        >
                                            <div className="font-medium truncate">{n.title}</div>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-4 space-y-2">
                                {visible < notes.length && (
                                    <Button onClick={handleShowMore} className="w-full" variant="outline" size="sm">
                                        Show More
                                    </Button>
                                )}
                                {visible > 10 && (
                                    <Button onClick={handleShowLess} className="w-full" variant="outline" size="sm">
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
                                {notes[selectedIndex].title}
                            </h1>
                            <div 
                                className="prose prose-lg max-w-none [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_li]:ml-2"
                                dangerouslySetInnerHTML={{ __html: notes[selectedIndex].content }}
                            />
                        </div>
                    )}
            </main>
        </div>
    )
}

export default Notes
