import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as usersApi from "./users";
import { queryKeys } from "./queryKeys";
import { mockStore, paginate, uuid, now } from "./mockStore";
import type { PaginationParams } from "./types";

export function useTeachersQuery(params: PaginationParams = {}) {
  return useQuery({
    queryKey: queryKeys.teachers.list(params),
    queryFn: async ({ signal }) => {
      try { return await usersApi.getTeachers(params, { signal }); }
      catch { return paginate(mockStore.teachers); }
    },
  });
}

export function useTeacherDashboardQuery() {
  return useQuery({
    queryKey: queryKeys.teachers.dashboard(),
    queryFn: async ({ signal }) => {
      try { return await usersApi.getTeacherDashboard({ signal }); }
      catch {
        return {
          students: mockStore.students.map((s) => ({
            id: s.id,
            firstName: s.firstName,
            lastName: s.lastName,
            rollNo: s.rollNo ?? "",
            courseName: s.courses?.[0]?.name ?? "",
            avatar: s.avatar,
          })),
          lectures: mockStore.lectures.map((l) => ({
            id: l.id,
            lectureTitle: l.lectureTitle,
            subjectName: mockStore.subjects.find((s) => s.id === l.subjectId)?.name ?? "",
            courseName: "",
            startDate: l.startDate,
            endDate: l.endDate,
          })),
        };
      }
    },
  });
}

export function useMyTeachersQuery() {
  return useQuery({
    queryKey: queryKeys.teachers.myTeachers(),
    queryFn: async ({ signal }) => {
      try { return await usersApi.getMyTeachers({ signal }); }
      catch { return mockStore.teachers; }
    },
  });
}

export function useCreateTeacherMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Parameters<typeof usersApi.createTeacher>[0]) => {
      try {
        return await usersApi.createTeacher(payload);
      } catch {
        const item = {
          id: uuid(),
          firstName: payload.firstName,
          lastName: payload.lastName,
          email: payload.email,
          phone: payload.phone,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${payload.firstName}`,
          role: "teacher" as const,
          authServiceProvider: "app" as const,
          createdAt: now(),
          lastLoginAt: null,
          deletedAt: null,
          courses: [],
          subjects: [],
        };
        mockStore.teachers.push(item);
        return item;
      }
    },
    onSuccess: (item) => {
      queryClient.setQueryData(
        queryKeys.teachers.list({}),
        (old: ReturnType<typeof paginate<typeof item>> | undefined) =>
          old
            ? { ...old, data: [...old.data, item], record: old.record + 1, totalRecord: old.totalRecord + 1 }
            : paginate([item]),
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.teachers.all });
    },
  });
}

export function useUpdateTeacherMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Parameters<typeof usersApi.updateTeacher>[0]) => {
      try {
        return await usersApi.updateTeacher(payload);
      } catch {
        const idx = mockStore.teachers.findIndex((t) => t.id === payload.id);
        if (idx !== -1) {
          mockStore.teachers[idx] = { ...mockStore.teachers[idx], ...payload };
        }
        return mockStore.teachers.find((t) => t.id === payload.id)!;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.teachers.all });
    },
  });
}

export function useDeleteTeacherMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (teacherId: string) => {
      try {
        return await usersApi.deleteTeacher(teacherId);
      } catch {
        const idx = mockStore.teachers.findIndex((t) => t.id === teacherId);
        if (idx !== -1) mockStore.teachers.splice(idx, 1);
        return 204 as number;
      }
    },
    onSuccess: (_d, teacherId) => {
      queryClient.setQueryData(
        queryKeys.teachers.list({}),
        (old: ReturnType<typeof paginate<(typeof mockStore.teachers)[0]>> | undefined) =>
          old ? { ...old, data: old.data.filter((t) => t.id !== teacherId) } : paginate([]),
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.teachers.all });
    },
  });
}

export function useStudentsQuery(params: PaginationParams = {}) {
  return useQuery({
    queryKey: queryKeys.students.list(params),
    queryFn: async ({ signal }) => {
      try { return await usersApi.getStudents(params, { signal }); }
      catch { return paginate(mockStore.students); }
    },
  });
}

export function useTeacherStudentsQuery(params: PaginationParams = {}) {
  return useQuery({
    queryKey: queryKeys.students.teacherList(params),
    queryFn: async ({ signal }) => {
      try { return await usersApi.getTeacherStudents(params, { signal }); }
      catch { return paginate(mockStore.students); }
    },
  });
}

export function useCreateStudentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Parameters<typeof usersApi.createStudent>[0]) => {
      const selectedCourses = (payload.courseIds || [])
        .map((id) => mockStore.courses.find((c) => c.id === id))
        .filter(Boolean) as any[];

      const studentItem: any = {
        id: uuid(),
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        authServiceProvider: "app" as const,
        studentNumber: payload.phone ?? "",
        parentNumber: payload.parentMobileNumber ?? null,
        parentName: payload.parentName ?? null,
        board: payload.board ?? null,
        schoolName: payload.schoolName ?? null,
        avatar: payload.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${payload.firstName}`,
        createdAt: now(),
        lastLoginAt: null,
        deletedAt: null,
        rollNo: payload.rollNo ?? null,
        standard: payload.standard ?? null,
        courses: selectedCourses,
      };

      try {
        const res = await usersApi.createStudent(payload);
        const createdStudent = {
          ...studentItem,
          ...(res as any),
          courses: (res as any)?.courses?.length ? (res as any).courses : selectedCourses,
        };
        mockStore.students.unshift(createdStudent);
        return createdStudent;
      } catch {
        // Offline / fallback creation
        mockStore.students.unshift(studentItem);
        return studentItem;
      }
    },
    onSuccess: (newStudent: any) => {
      // Optimistically update all cached student list queries
      queryClient.setQueriesData(
        { queryKey: ["students", "list"] },
        (old: any) => {
          if (!old) return paginate([newStudent]);
          return {
            ...old,
            data: [newStudent, ...(old.data || [])],
            record: (old.record ?? 0) + 1,
            totalRecord: (old.totalRecord ?? 0) + 1,
          };
        }
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
    },
  });
}

export function useUpdateStudentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Parameters<typeof usersApi.updateStudent>[0]) => {
      try {
        return await usersApi.updateStudent(payload);
      } catch {
        const idx = mockStore.students.findIndex((s) => s.id === payload.id);
        if (idx !== -1) {
          mockStore.students[idx] = {
            ...mockStore.students[idx],
            firstName: payload.firstName,
            lastName: payload.lastName,
            email: payload.email,
          };
        }
        return {
          id: payload.id,
          firstName: payload.firstName,
          lastName: payload.lastName,
          email: payload.email,
          phone: payload.phone ?? "",
          avatar: payload.avatar || "",
          role: "student" as const,
          authServiceProvider: "app" as const,
        };
      }
    },
    onSuccess: (updatedStudent: any) => {
      queryClient.setQueriesData(
        { queryKey: ["students", "list"] },
        (old: any) => {
          if (!old || !old.data) return old;
          return {
            ...old,
            data: old.data.map((s: any) =>
              s.id === updatedStudent?.id ? { ...s, ...updatedStudent } : s
            ),
          };
        }
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
    },
  });
}

export function useDeleteStudentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (studentUserId: string) => {
      try {
        return await usersApi.deleteStudent(studentUserId);
      } catch {
        const idx = mockStore.students.findIndex((s) => s.id === studentUserId);
        if (idx !== -1) mockStore.students.splice(idx, 1);
        return 204 as number;
      }
    },
    onSuccess: (_d, studentUserId) => {
      queryClient.setQueriesData(
        { queryKey: ["students", "list"] },
        (old: any) => {
          if (!old || !old.data) return old;
          return {
            ...old,
            data: old.data.filter((s: any) => s.id !== studentUserId),
            record: Math.max(0, (old.record ?? 1) - 1),
            totalRecord: Math.max(0, (old.totalRecord ?? 1) - 1),
          };
        }
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
    },
  });
}

export function useStudentInsightsQuery(studentUserId?: string, options: any = {}) {
  return useQuery({
    queryKey: queryKeys.students.insights(studentUserId),
    queryFn: async ({ signal }) => {
      try { return await usersApi.getStudentInsights(studentUserId, { signal }); }
      catch {
        return {
          totalStudents: mockStore.students.length,
          proStudents: mockStore.students.filter((s) => s.courses.length > 0).length,
        };
      }
    },
    ...options,
  });
}

export function useMyStudentInsightsQuery(studentUserId?: string, options: any = {}) {
  return useQuery({
    queryKey: queryKeys.students.insights(studentUserId),
    queryFn: async ({ signal }) => {
      try { return await usersApi.getMyStudentInsights({ signal }); }
      catch {
        return {
          totalStudents: mockStore.students.length,
          proStudents: mockStore.students.filter((s) => s.courses.length > 0).length,
        };
      }
    },
    ...options,
  });
}

export function useTeacherStudentInsightsQuery(studentUserId?: string, options: any = {}) {
  return useQuery({
    queryKey: queryKeys.students.insights(studentUserId, "teacher"),
    queryFn: async ({ signal }) => {
      try { return await usersApi.getTeacherStudentInsights(studentUserId, { signal }); }
      catch {
        return {
          totalStudents: mockStore.students.length,
          proStudents: mockStore.students.filter((s) => s.courses.length > 0).length,
        };
      }
    },
    ...options,
  });
}
