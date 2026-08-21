import { apiRequest } from "./http";
import type {
  PaginationParams,
  PaginationStudentResponse,
  StudentInsightsResponse,
  StudentRequest,
  StudentUpdateRequest,
  UserModifyRequest,
  UserRequest,
  UserResponse,
  PaginationTeacherResponse,
  TeacherResponse,
  TeacherDashboardResponse,
} from "./types";

interface RequestOptions {
  signal?: AbortSignal;
}

export async function getTeachers(
  params: PaginationParams = {},
  options?: RequestOptions,
): Promise<PaginationTeacherResponse> {
  return apiRequest<PaginationTeacherResponse>("/teacher/", {
    query: params,
    signal: options?.signal,
  }, true);
}

export async function createTeacher(
  payload: UserRequest,
  options?: RequestOptions,
): Promise<TeacherResponse> {
  return apiRequest<TeacherResponse>("/teacher/", {
    method: "POST",
    body: payload,
    signal: options?.signal,
  }, true);
}

export async function updateTeacher(
  payload: UserModifyRequest,
  options?: RequestOptions,
): Promise<TeacherResponse> {
  return apiRequest<TeacherResponse>("/teacher/", {
    method: "PUT",
    body: payload,
    signal: options?.signal,
  }, true);
}

export async function deleteTeacher(
  teacherId: string,
  options?: RequestOptions,
): Promise<number> {
  return apiRequest<number>("/teacher/", {
    method: "DELETE",
    query: { teacher_id: teacherId },
    signal: options?.signal,
  }, true);
}

export async function getStudents(
  params: PaginationParams = {},
  options?: RequestOptions,
): Promise<PaginationStudentResponse> {
  return apiRequest<PaginationStudentResponse>("/student/", {
    query: params,
    signal: options?.signal,
  }, true);
}

export async function getTeacherStudents(
  params: PaginationParams = {},
  options?: RequestOptions,
): Promise<PaginationStudentResponse> {
  return apiRequest<PaginationStudentResponse>("/student/teacher", {
    query: params,
    signal: options?.signal,
  }, true);
}

export async function createStudent(
  payload: StudentRequest,
  options?: RequestOptions,
): Promise<UserResponse> {
  return apiRequest<UserResponse>("/student/", {
    method: "POST",
    body: payload,
    signal: options?.signal,
  }, true);
}

export async function updateStudent(
  payload: StudentUpdateRequest,
  options?: RequestOptions,
): Promise<UserResponse> {
  return apiRequest<UserResponse>("/student/", {
    method: "PUT",
    body: payload,
    signal: options?.signal,
  }, true);
}

export async function deleteStudent(
  studentUserId: string,
  options?: RequestOptions,
): Promise<number> {
  return apiRequest<number>("/student/", {
    method: "DELETE",
    query: { student_user_id: studentUserId },
    signal: options?.signal,
  }, true);
}

export async function getStudentInsights(
  studentUserId?: string,
  options?: RequestOptions,
): Promise<StudentInsightsResponse> {
  return apiRequest<StudentInsightsResponse>("/student/insights", {
    query: studentUserId ? { student_user_id: studentUserId } : undefined,
    signal: options?.signal,
  }, true);
}

export async function getMyStudentInsights(
  options?: RequestOptions,
): Promise<StudentInsightsResponse> {
  return apiRequest<StudentInsightsResponse>("/student/insights/me", {
    signal: options?.signal,
  }, true);
}

export async function getTeacherStudentInsights(
  studentUserId?: string,
  options?: RequestOptions,
): Promise<StudentInsightsResponse> {
  return apiRequest<StudentInsightsResponse>("/student/insights/teacher", {
    query: studentUserId ? { student_user_id: studentUserId } : undefined,
    signal: options?.signal,
  }, true);
}

export async function getTeacherDashboard(
  options?: RequestOptions,
): Promise<TeacherDashboardResponse> {
  return apiRequest<TeacherDashboardResponse>("/teacher/dashboard", {
    signal: options?.signal,
  }, true);
}

export async function getMyTeachers(
  options?: RequestOptions,
): Promise<TeacherResponse[]> {
  return apiRequest<TeacherResponse[]>("/teacher/me", {
    signal: options?.signal,
  }, true);
}
