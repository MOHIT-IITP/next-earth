"use client"
import React from 'react'
import { Button } from '../ui/button'
import { Edit, Plus } from 'lucide-react'
import { MdDelete } from 'react-icons/md'

const NotesSidebar = ({
  notesList,
  visible,
  setVisible,
  selectedIndex,
  setSelectedIndex,
  handleDelete,
  handleEditClick,
  openNewNote,
}: any) => {
  return (
    <aside className="w-80 bg-gray-50 border-r p-4 flex flex-col gap-4">
      <button
        onClick={openNewNote}
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
                      selectedIndex === i ? 'bg-gray-200 border-l-4 border-gray-500' : 'hover:bg-gray-100'
                    }`}
                  >
                    <button onClick={() => setSelectedIndex(i)} className="flex-1 text-left font-medium truncate">
                      {n.title || 'Untitled'}
                    </button>
                    <button onClick={() => handleEditClick(i)} aria-label={`Edit ${n.title}`}>
                      <Edit className="ml-2 text-grey-600 size-4 hover:text-gray-800" />
                    </button>

                    <button onClick={() => handleDelete(n.id)} className="ml-2 text-red-600 hover:text-red-800" aria-label={`Delete ${n.title}`}>
                      <MdDelete />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4 space-y-2">
              {visible < notesList.length && (
                <Button onClick={() => setVisible((v: number) => v + 10)} className="w-full" variant="outline" size="sm">
                  Show More
                </Button>
              )}
              {visible > 10 && (
                <Button onClick={() => setVisible((v: number) => v - 10)} className="w-full" variant="outline" size="sm">
                  Show Less
                </Button>
              )}
            </div>
          </>
        ) : (
          <p className="text-gray-500 text-sm text-center mt-4">No notes yet</p>
        )}
      </div>
    </aside>
  )
}

export default NotesSidebar
