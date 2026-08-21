import { apiRequest } from "@/api";
import {
  courseResponseSchema,
  type CourseResponseModel,
} from "@/entities/course.ts";


interface RequestOptions {
  signal?: AbortSignal;
}

export async function getCourses(
  options?: RequestOptions,
): Promise<CourseResponseModel[]> {
  const response = await apiRequest<unknown>("/courses/", {
    signal: options?.signal,
  });

  return courseResponseSchema.array().parse(response);
}
