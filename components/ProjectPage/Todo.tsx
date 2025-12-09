import { useEffect, useState } from "react";
import CreateTodoDialog from "./CreateTodoDialog";
import { fetchAllTodo } from "@/lib/action";

  // title       String
  // description String?
  // status      TodoStatus @default(TODO)
  // priority    Int        @default(1)

  interface Todo {
    id: string,
    projectId: string,
    title: string,
    description: string,
    status: string,
    priority: string,
  }

export const  Todo = ({project}:{project: any}) => {
  // const todo = await getTodo(project.id);
  // const [todo, setTodo] = useState<Todo[]>([]);
  const todo = project.todos;

  // useEffect(() => {
  //   const fetchTodos = async () => {
  //     const data = await fetchAllTodo(project.id); 
  //     console.log("todo data is " , data.todo);
  //     setTodo(data.todo);
  //   }
  //   fetchTodos();
  // },[project.id, project])

  const [formData, setFormData] = useState({
    title: "untitled",
    description: "write your desc here",
    status: "TODO",
    priority: "Low",
    projectId: project.id,
  });

  return (
    <div>
      {/* create button div */}
      <div>
          <CreateTodoDialog
          formData={formData}
          setFormData={setFormData}
          />
          {todo.map((item:any) => (
            <div key={item.id} className="border p-4 my-2 rounded">
              <h3 className="font-bold">{item.title}</h3>
              <p>{item.description}</p>
              <p>Status: {item.status}</p>
              <p>Priority: {item.priority}</p>
            </div>
          ))} 
      </div>
    </div>
  )
}
