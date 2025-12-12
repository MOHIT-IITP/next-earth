import { RegisteredUser } from "./auth";
import { prisma } from "./prisma";

export const getSingleProject = async ({ projectId }: { projectId: string }) => {
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
            message: "Error in project fetching"
        }

    }
};
export const getAllProject = async ()=>{
    try {
        const session = await RegisteredUser();
        const project = await prisma.project.findMany({
            where: {
                userId: session.user?.id,
            },
            include: {
                todos: true,
                notes: true,
                scalitros: true,
            },
            orderBy: {
                createdAt: "desc",
            }
        });
        return project;
    } catch (error) {
        console.error("Error in fetching project from", error);
        return {
            status: "error",
            message: "Error in action.ts",
        }
    }
}
