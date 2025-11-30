"use client"
import React from 'react'
import { FaAlignCenter, FaAlignLeft, FaAlignRight, FaBold, FaCode, FaHighlighter, FaItalic, FaStrikethrough } from 'react-icons/fa'
import { RiH1, RiH2, RiH3 } from 'react-icons/ri'
import { MdFormatListBulleted } from 'react-icons/md'
import { GoListOrdered } from 'react-icons/go'

const NotesEditorMenuBar = ({ editor }: any) => {
  if (!editor) return null
  return (
    <div className="border-b p-2 flex flex-wrap gap-1 bg-gray-50">
      <button onClick={() => editor.chain().focus().toggleBold().run()} className="px-3 py-1 rounded text-sm border">
        <FaBold />
      </button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className="px-3 py-1 rounded text-sm border">
        <FaItalic />
      </button>
      <button onClick={() => editor.chain().focus().toggleStrike().run()} className="px-3 py-1 rounded text-sm border">
        <FaStrikethrough />
      </button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className="px-3 py-1 rounded text-sm border">
        <RiH1 />
      </button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className="px-3 py-1 rounded text-sm border">
        <RiH2 />
      </button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className="px-3 py-1 rounded text-sm border">
        <RiH3 />
      </button>
      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className="px-3 py-1 rounded text-sm border">
        <MdFormatListBulleted />
      </button>
      <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className="px-3 py-1 rounded text-sm border">
        <GoListOrdered />
      </button>
      <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className="px-3 py-1 rounded text-sm border">
        <FaCode />
      </button>
      <button onClick={() => editor.chain().focus().toggleHighlight().run()} className="px-3 py-1 rounded text-sm border">
        <FaHighlighter />
      </button>
      <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className="px-3 py-1 rounded text-sm border">
        <FaAlignLeft />
      </button>
      <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className="px-3 py-1 rounded text-sm border">
        <FaAlignCenter />
      </button>
      <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className="px-3 py-1 rounded text-sm border">
        <FaAlignRight />
      </button>
    </div>
  )
}

export default NotesEditorMenuBar
