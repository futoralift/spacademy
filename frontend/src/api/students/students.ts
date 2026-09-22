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

import { mockStore } from "@/api/mockStore";

export async function fetchStudent(): Promise<studentModel[]> {
    try {
        return await apiRequest<studentModel[]>(`/student`, {
            method: "GET",
            query: {
                limit: 15,
            }
        }, true);
    } catch {
        return mockStore.students.map((s) => ({
            id: s.id,
            firstName: s.firstName,
            lastName: s.lastName,
            email: s.email,
            studentNumber: s.studentNumber ?? "9876543210",
            parentName: s.parentName ?? "Parent",
            parentNumber: s.parentNumber ?? "9876543211",
            board: s.board ?? "State",
            schoolName: s.schoolName ?? "SF High School",
            avatar: s.avatar ?? "/images/logo.png",
            createdAt: new Date(s.createdAt),
            deletedAt: s.deletedAt ? new Date(s.deletedAt) : new Date(),
            lastLoginAt: s.lastLoginAt ? new Date(s.lastLoginAt) : new Date(),
            password: "",
            rollNo: s.rollNo ?? "101",
            standard: s.standard ?? "10th",
        }));
    }
}

export async function createStudent(student: Omit<studentModel, "id">): Promise<studentModel> {
    return apiRequest<studentModel>(`/student`, {
        method: "POST",
        body: JSON.stringify(student),
    }, true);
}
