import { apiRequest } from "@/api";
import {
  courseResponseSchema,
  type CourseResponseModel,
} from "@/entities/course.ts";
import { mockStore } from "@/api/mockStore";

interface RequestOptions {
  signal?: AbortSignal;
}

export async function getCourses(
  options?: RequestOptions,
): Promise<CourseResponseModel[]> {
  try {
    const response = await apiRequest<unknown>("/courses/", {
      signal: options?.signal,
    });
    return courseResponseSchema.array().parse(response);
  } catch {
    // Return mock data when API is unavailable
    return mockStore.courses as CourseResponseModel[];
  }
}
