import {apiRequest} from "@/api";
import {z} from "zod";

export const studentStatsObject = z.object({
    totalStudents: z.number(),
    proStudents: z.number(),
});

export type studentStatsModel = z.infer<typeof studentStatsObject>;

export async function fetchStudentStats(): Promise<studentStatsModel> {
    return apiRequest<studentStatsModel>(`/student/insights`, {
        method: "GET",
    }, true);
}
