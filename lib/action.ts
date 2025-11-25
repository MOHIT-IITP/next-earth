export const createNotes = async ({ formData }: { formData: any }) => {
  try {
    const newNotes = await fetch(`/api/notes`, {
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


export const fetchNotes = async ({ projectId }: { projectId: string }) => {
  try {
    const notes = await fetch(`/api/notes`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        projectId: projectId
      }),
    })
  } catch (error) {
    console.error("Error fetching notes", error);
    return null;
  }
};