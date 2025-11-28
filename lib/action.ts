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

export const updateNotes = async ({formData}: {formData : any}) => {
    try {
        const response = await fetch(`/api/notes/${formData.projectId}`, {
            method: "PUT", 
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: formData.title,
                content: formData.content,
            }),
        })
        const data = "helo" + response;
        return data;
    } catch (error) {
        console.error("Error in updating notes", error);
    }
}
