import React, { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { createNotes } from '@/lib/action';
import { Plus } from 'lucide-react';

const Notes = ({project}:{project:any}) => {
  const pth = usePathname();
  const proId = pth.split("/")[2];

    const notes = project.notes;
    console.log("this is our notes", notes);

    const [visible , setVisible] = useState(10);

    const handleShowMore = () => {
        setVisible(prev => prev + 10);
    }

    const handleShowLess = () => {
        setVisible(prev => prev - 10);
    }

  
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null)
    const [ formData, setFormData] = useState({
        title: "",
        content: "",
        projectId: proId,
    })

    const [plugOpen, setPlugOpen] = useState(false)

    const handleCreateNote = async () => {
      try {
        await createNotes({ formData })
        setFormData({ title: '', content: '', projectId: proId })
        setPlugOpen(false)
      } catch (err) {
        console.error('create note error', err)
      }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

   
    console.log("notes is the main thing",notes);

    // this plugopen = create notes section where all things just hide
  if (plugOpen) {
    return (
      <div className="p-6 flex flex-col items-center gap-4">
        <Input value={formData.title} name='title' placeholder='title' onChange={handleChange}/>
        <Input value={formData.content} name='content' placeholder='content' onChange={handleChange}/>
        <div className="flex gap-2">
          <Button onClick={handleCreateNote} type='button'>Create</Button>
          <Button onClick={() => setPlugOpen(false)} type='button'>Close</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-[300px]">
      <div className="w-72 bg-gray-50 border-r p-4 flex flex-col gap-4">
                <button onClick={() => setPlugOpen(true)} aria-label="Open note form" className="p-2 rounded hover:bg-gray-100">
                  <Plus />
                </button>
        <div className="flex-1 overflow-auto">
          {notes && (
            <>
              <ul className="space-y-2">
                {notes.slice(0, visible).map((n: any, i: number) => (
                  <li key={n.id ?? i}>
                    <button
                      onClick={() => setSelectedIndex(i)}
                      className={`w-full text-left p-2 rounded ${
                        selectedIndex === i ? 'bg-blue-100' : 'hover:bg-gray-100'
                      }`}
                    >
                      {n.title}
                    </button>
                  </li>
                ))}
              </ul>
              {visible < notes.length && (
                <Button onClick={handleShowMore}>Show More</Button>
              )}
              {visible > notes.length && (
                <Button onClick={handleShowLess}>Show Less</Button>
              )}
            </>
          )}
        </div>
      </div>

      <main className="flex-1 p-6">
        {selectedIndex === null ? (
          <div className="text-gray-600">Select or create a note to view its content.</div>
        ) : (
          <div className='flex justify-center items-start gap-8 flex-col'>
                            <div className='flex justify-center items-center gap-8'>
                                <label>Notes title: </label>
                                <h2 className="text-xl font-semibold mb-2">{notes[selectedIndex].title}</h2>
                            </div>
                            <div className='flex justify-center items-center gap-8'>
                                <label>Notes content: </label>
                                <div className="p-4 border rounded bg-white">{notes[selectedIndex].content}</div>
                            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default Notes
