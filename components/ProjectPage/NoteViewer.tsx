"use client"
import React from 'react'

const NoteViewer = ({ notesList, selectedIndex }: any) => {
  const note = notesList?.[selectedIndex]
  if (!note) return null
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 pb-4 border-b">{note.title}</h1>
      <div className="note-content prose prose-lg max-w-none [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_li]:ml-2 [&_pre]:bg-gray-900 [&_pre]:text-gray-100 [&_pre]:p-4 [&_code]:bg-gray-900 [&_code]:text-gray-100 [&_code]:px-2 [&_code]:py-1 [&_code]:rounded" dangerouslySetInnerHTML={{ __html: note.content ?? "" }} />
    </div>
  )
}

export default NoteViewer
