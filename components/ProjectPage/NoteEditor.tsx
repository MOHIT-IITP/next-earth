"use client"
import React from 'react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { EditorContent } from '@tiptap/react'
import NotesEditorMenuBar from './NotesEditorMenuBar'

const NoteEditor = ({ editor, formData, handleChange, onCreate, onSave, onCancel }: any) => {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <Input value={formData.title} name="title" placeholder="Note Title" onChange={handleChange} className="mb-4" />
      <div className="w-full border rounded-lg overflow-hidden bg-white">
        <NotesEditorMenuBar editor={editor} />
        <div className="p-4 min-h-[300px]">
          <EditorContent editor={editor} className="prose prose-sm max-w-none focus:outline-none" />
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        {onSave ? (
          <Button onClick={onSave}>Save</Button>
        ) : (
          <Button onClick={onCreate}>Create Note</Button>
        )}
        <Button onClick={onCancel} variant="outline">
          Cancel
        </Button>
      </div>
    </div>
  )
}

export default NoteEditor
