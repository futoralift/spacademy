import {apiRequest} from "@/api";
import {z} from "zod";

export const studentObject = z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    studentNumber: z.string(),
    parentName: z.string(),
    parentNumber: z.string(),
    board: z.string(),
    schoolName: z.string(),
    avatar: z.string(),
    createdAt: z.date(),
    deletedAt: z.date(),
    lastLoginAt: z.date(),
    password: z.string(),
    rollNo: z.string(),
    standard: z.string(),
});

export type studentModel = z.infer<typeof studentObject>;

export async function fetchStudent(): Promise<studentModel[]> {
    return apiRequest<studentModel[]>(`/student`, {
        method: "GET",
        query: {
            limit: 15,
        }
    }, true);
}

export async function createStudent(student: Omit<studentModel, "id">): Promise<studentModel> {
    return apiRequest<studentModel>(`/student`, {
        method: "POST",
        body: JSON.stringify(student),
    }, true);
}
