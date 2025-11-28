export const createNotes = async ({ formData }: { formData: any }) => {
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
