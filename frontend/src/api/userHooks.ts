import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as usersApi from "./users";
import { queryKeys } from "./queryKeys";
import type { PaginationParams } from "./types";

export function useTeachersQuery(params: PaginationParams = {}) {
  return useQuery({
    queryKey: queryKeys.teachers.list(params),
    queryFn: ({ signal }) => usersApi.getTeachers(params, { signal }),
  });
}

export function useTeacherDashboardQuery() {
  return useQuery({
    queryKey: queryKeys.teachers.dashboard(),
    queryFn: ({ signal }) => usersApi.getTeacherDashboard({ signal }),
  });
}

export function useMyTeachersQuery() {
  return useQuery({
    queryKey: queryKeys.teachers.myTeachers(),
    queryFn: ({ signal }) => usersApi.getMyTeachers({ signal }),
  });
}

export function useCreateTeacherMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Parameters<typeof usersApi.createTeacher>[0]) =>
      usersApi.createTeacher(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.teachers.all });
    },
  });
}

export function useUpdateTeacherMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Parameters<typeof usersApi.updateTeacher>[0]) =>
      usersApi.updateTeacher(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.teachers.all });
    },
  });
}

export function useDeleteTeacherMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teacherId: string) => usersApi.deleteTeacher(teacherId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.teachers.all });
    },
  });
}

export function useStudentsQuery(params: PaginationParams = {}) {
  return useQuery({
    queryKey: queryKeys.students.list(params),
    queryFn: ({ signal }) => usersApi.getStudents(params, { signal }),
  });
}

export function useTeacherStudentsQuery(params: PaginationParams = {}) {
  return useQuery({
    queryKey: queryKeys.students.teacherList(params),
    queryFn: ({ signal }) => usersApi.getTeacherStudents(params, { signal }),
  });
}

export function useCreateStudentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Parameters<typeof usersApi.createStudent>[0]) =>
      usersApi.createStudent(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
    },
  });
}

export function useUpdateStudentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Parameters<typeof usersApi.updateStudent>[0]) =>
      usersApi.updateStudent(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
    },
  });
}

export function useDeleteStudentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (studentUserId: string) => usersApi.deleteStudent(studentUserId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
    },
  });
}

export function useStudentInsightsQuery(studentUserId?: string, options: any = {}) {
  return useQuery({
    queryKey: queryKeys.students.insights(studentUserId),
    queryFn: ({ signal }) => usersApi.getStudentInsights(studentUserId, { signal }),
    ...options
  });
}

export function useMyStudentInsightsQuery(studentUserId?: string, options: any = {}) {
  return useQuery({
    queryKey: queryKeys.students.insights(studentUserId),
    queryFn: ({ signal }) => usersApi.getMyStudentInsights({ signal }),
    ...options
  });
}

export function useTeacherStudentInsightsQuery(studentUserId?: string, options: any = {}) {
  return useQuery({
    queryKey: queryKeys.students.insights(studentUserId, "teacher"),
    queryFn: ({ signal }) => usersApi.getTeacherStudentInsights(studentUserId, { signal }),
    ...options
  });
}
