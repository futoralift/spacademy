import { apiRequest } from "@/api";
import { z } from "zod";
import { mockStore } from "@/api/mockStore";

export const studentStatsObject = z.object({
  totalStudents: z.number(),
  proStudents: z.number(),
});

export type studentStatsModel = z.infer<typeof studentStatsObject>;

export async function fetchStudentStats(): Promise<studentStatsModel> {
  try {
    return await apiRequest<studentStatsModel>(`/student/insights`, {
      method: "GET",
    }, true);
  } catch {
    // Return mock stats when API is unavailable
    return {
      totalStudents: mockStore.students.length,
      proStudents: mockStore.students.filter((s) => s.courses.length > 0).length,
    };
  }
}
