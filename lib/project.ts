import { RegisteredUser } from "./auth";
import { prisma } from "./prisma";

export const getProject = async ({ projectId }: { projectId: any }) => {
    try {
        const session = await RegisteredUser();
        const data = await prisma.project.findUnique({
            where: {
                id: projectId,
                userId: session.user?.id,
            },
            include: {
                todos: true,
                notes: true, 
                scalitros: true,
            }
        });

        return data;

    } catch (error) {
        console.error("Error in Project fetching", error);
        return {
            status: "error",
            message: "Error in project fetching  "
        }

    }
};

