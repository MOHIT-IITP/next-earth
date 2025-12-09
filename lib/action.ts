import { Description } from "@radix-ui/react-dialog";
interface TodoFormDataProp {
  title: string,
  description: string,
  status: string,
  priority: string,
  projectId: string,
}

interface ProjectFormDataProp {
  name: string,
  stack: string,
  description: string,
}

interface NoteformDataProp {
  title: string,
  content: string,
  projectId?: string,
}

export const createNotes = async ({ formData }: { formData:NoteformDataProp }) => {
  try {
    const newNotes = await fetch(`/api/note`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: formData.title,
        content: formData.content,
        projectId: formData.projectId,
      }),
    });
    return newNotes;
  } catch (error) {
    console.error("Error in creating notes", error);
  }
};

export const DeleteNote = async (noteId: string) => {
    try {
        const res = await fetch(`/api/note/${noteId}`, {
            method: "DELETE",
        });
        return await res.json();
    } catch (err) {
        console.error("Error deleting nore:", err);
    }
}




export const updateNote = async (noteId: string, formData: NoteformDataProp) => {
  try {
    const res = await fetch(`/api/note/${noteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: formData.title,
        content: formData.content,
      }),
    });

    return await res.json();
  } catch (error) {
    console.error("Error updating notes", error);
  }
};


export const deleteProject  = async (projectId: string) => {
    try {
        const res = await fetch(`/api/project/`,{
            method: "DELETE",
            body: JSON.stringify({
                projectId: projectId,
            })
        })
        return await res.json();
    } catch (error) {
        console.error("Error in deleting Project",error)
    }
}


export const updateProject = async (projectId: string, formData: ProjectFormDataProp) => {
    try {
        const res = await fetch(`/api/project/${projectId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: formData.name , stack: formData.stack, description: formData.description }),
        })
        return await res.json();
    } catch (error) {
        console.error("Error in updating Project", error)
    }
}



export const createTodo = async (formData:TodoFormDataProp ) => {
  try {
    const res = await fetch(`/api/todo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: formData.title , description: formData.description, status: formData.status, priority: formData.priority, projectId: formData.projectId })
    });
    return await res.json();
  } catch (error) {
    console.error("Error in creating todo")
  }
}


export const fetchAllTodo = async (projectId: string) => {
  try {
    const res = await fetch(`/api/todo`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({projectId: projectId})
    })
    return await res.json();
  } catch (error) {
    console.error("Error in getting Todo")
  }
}