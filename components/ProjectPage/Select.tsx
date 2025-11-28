"use client"
import  { useState } from 'react'
import Notes from './Notes';
import Draw from './Draw';
import Todo from './Todo';


const Select = ({project}:{project:any}) => {
    console.log("this is my new project", project)
    const [selected, setSelected] = useState("Note");
  return (
    <div>
        <div className='rounded-full w-md flex justify-center px-8 py-1.5 mx-auto  items-center gap-8 border '>
            {["Note", "Draw", "Todo"].map((item) => (
                <button style={{fontFamily:"cinzel"}} key={item} onClick={()=> setSelected(item)} className={`px-8 py-2 border rounded-full ${selected === item ? "bg-gray-500 text-white font-bold": "bg-white"}`}  >
                {item}
                </button>
            ))}
        </div>
        <div className='w-full flex justify-center items-center '>
            {selected === "Note" && <Notes project={project}/>}
            {selected === "Draw" && <Draw/>}
            {selected === "Todo" && <Todo/>}
        </div>
    </div>
  )
}

export default Select
