import React, { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { usePathname } from 'next/navigation'
import { Input } from '../ui/input';
import { createNotes, fetchNotes } from '@/lib/action';

const Notes = () => {
  const [notes, setNotes] = useState<string[]>([]);
  const pth = usePathname();
  const proId = pth.split("/")[2];

  
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null)
    const [ formData, setFormData] = useState({
        title: "",
        content: "",
        projectId: proId,
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const fetchAllNotes = async () => {
      const note = await fetchNotes({projectId: proId});
      
      // if(note){
      //   const data = await note.json();
      //   setNotes(data.notes.map((n: any) => n.title));
      // }
    }

    useEffect(()=>{
      fetchAllNotes();
    }, [proId])

    const handleCreateNote = () => {
      createNotes({formData})
    };

  return (
    <div className="flex h-full min-h-[300px]">
      <aside className="w-72 bg-gray-50 border-r p-4 flex flex-col gap-4">
                <Input value={formData.title} name='title' placeholder='title' onChange={handleChange}/>
                <Input value={formData.content} name='content' placeholder='content' onChange={handleChange}/>
        <Button onClick={handleCreateNote} type='button'>Create +</Button>

        <Button onClick={fetchAllNotes} type='button'>Refresh</Button>
        <div className="flex-1 overflow-auto">
          {notes && (
            <ul className="space-y-2">
              {notes.map((n, i) => (
                <li key={i}>
                  <button
                    onClick={() => setSelectedIndex(i)}
                    className={`w-full text-left p-2 rounded ${
                      selectedIndex === i ? 'bg-blue-100' : 'hover:bg-gray-100'
                    }`}
                  >
                    {n}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      <main className="flex-1 p-6">
        {selectedIndex === null ? (
          <div className="text-gray-600">Select or create a note to view its content.</div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold mb-2">{notes[selectedIndex]}</h2>
            <div className="p-4 border rounded bg-white">Note content for "{notes[selectedIndex]}"</div>
          </div>
        )}
      </main>
    </div>
  )
}

export default Notes
