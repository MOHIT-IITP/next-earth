"use client"
import { useEffect, useState } from "react";
import CreateTodoDialog from "./CreateTodoDialog";

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
  const [todo, setTodo] = useState<Todo[]>(project.todos || []);
  // const todo = project.todos;
  useEffect(()=>{
    setTodo(project.todos);
  },[project.todos])

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
      </div>
      {/* Kanban columns */}
      <div className="flex gap-4 mt-8">
        {['TODO', 'DOING', 'DONE'].map(status => (
          <div key={status} className="flex-1 bg-gray-100 dark:bg-gray-800 rounded p-2 min-h-[200px]">
            <h3 className="font-bold mb-2 text-center">{status}</h3>
            {todo.filter(item => item.status === status).length === 0 ? (
              <div className="text-gray-400 text-center">No todos</div>
            ) : (
              todo.filter(item => item.status === status).map(item => (
                <div key={item.id} className="bg-white dark:bg-gray-900 rounded shadow p-2 mb-2">
                  <div className="font-semibold">{item.title}</div>
                  <div className="text-xs text-gray-500">{item.description}</div>
                  <div className="text-xs text-gray-400">Priority: {item.priority}</div>
                </div>
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
